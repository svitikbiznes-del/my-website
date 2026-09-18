import base64
import hashlib
import hmac
import json
import mimetypes
import os
import secrets
import sqlite3
import time
import traceback
import uuid
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "anoncheat.db"
HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", 5000))
SESSION_COOKIE = "anoncheat_session"
SESSION_TTL = 60 * 60 * 24 * 7
ADMIN_LOGIN = os.environ.get("ANONCHEAT_ADMIN_LOGIN", "admim")
ADMIN_PASSWORD = os.environ.get("ANONCHEAT_ADMIN_PASSWORD", "svitik1337133713371337")


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def avatar_data_url():
    avatar_path = BASE_DIR / "cat-avatar.jpg"
    try:
        encoded = base64.b64encode(avatar_path.read_bytes()).decode("ascii")
        return f"data:image/jpeg;base64,{encoded}"
    except OSError:
        return None


def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def hash_password(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    derived = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=16384, r=8, p=1)
    return f"{salt.hex()}${derived.hex()}"


def verify_password(password, stored):
    try:
        salt_hex, expected_hex = stored.split("$", 1)
        actual = hashlib.scrypt(password.encode("utf-8"), salt=bytes.fromhex(salt_hex), n=16384, r=8, p=1)
        return hmac.compare_digest(actual.hex(), expected_hex)
    except (ValueError, TypeError):
        return False


def init_db():
    with get_db() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'member',
                subscription_ends_at TEXT,
                hwid TEXT DEFAULT NULL,
                banned INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                last_active_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
            """
        )
        admin = db.execute("SELECT id FROM users WHERE username = ?", (ADMIN_LOGIN,)).fetchone()
        if admin is None:
            stamp = now_iso()
            db.execute(
                "INSERT INTO users (id, username, email, password_hash, role, created_at, last_active_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)",
                ("ac_admin", ADMIN_LOGIN, "admin@anoncheat.local", hash_password(ADMIN_PASSWORD), stamp, stamp),
            )
        else:
            db.execute(
                "UPDATE users SET role = 'admin', password_hash = ? WHERE username = ?",
                (hash_password(ADMIN_PASSWORD), ADMIN_LOGIN),
            )
        # Compatibility for the common typo: if an account named "admin" already
        # exists, treat it as the same local administrator account as "admim".
        if ADMIN_LOGIN.lower() != "admin":
            alias = db.execute("SELECT id FROM users WHERE username = ?", ("admin",)).fetchone()
            if alias is not None:
                db.execute(
                    "UPDATE users SET role = 'admin', password_hash = ? WHERE username = ?",
                    (hash_password(ADMIN_PASSWORD), "admin"),
                )
        db.commit()


def public_user(row):
    if row is None:
        return None
    return {
        "id": row["id"],
        "username": row["username"],
        "email": row["email"],
        "role": row["role"],
        "subscriptionEndsAt": row["subscription_ends_at"],
        "hwid": None,
        "avatarUrl": avatar_data_url(),
        "banned": bool(row["banned"]),
        "createdAt": row["created_at"],
        "lastActiveAt": row["last_active_at"],
    }


def create_session(user_id):
    token = secrets.token_urlsafe(32)
    timestamp = int(time.time())
    with get_db() as db:
        db.execute("DELETE FROM sessions WHERE expires_at < ?", (timestamp,))
        db.execute("INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)", (token, user_id, timestamp + SESSION_TTL, timestamp))
        db.commit()
    return token


def request_body(handler):
    try:
        length = int(handler.headers.get("Content-Length", "0"))
        if length > 100_000:
            return None
        return json.loads(handler.rfile.read(length) or b"{}")
    except (ValueError, json.JSONDecodeError):
        return None


class AppHandler(BaseHTTPRequestHandler):
    server_version = "AnonCheat/1.0"

    def log_message(self, format_string, *args):
        print(f"[{self.log_date_time_string()}] {format_string % args}")

    def send_json(self, payload, status=HTTPStatus.OK, extra_headers=None):
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        for key, value in (extra_headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(content)

    def send_error_json(self, message, status=HTTPStatus.BAD_REQUEST):
        self.send_json({"ok": False, "error": message}, status)

    def cookie_value(self, name):
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        return cookie[name].value if name in cookie else None

    def current_user_row(self):
        token = self.cookie_value(SESSION_COOKIE)
        if not token:
            return None
        with get_db() as db:
            row = db.execute(
                "SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ? AND sessions.expires_at > ?",
                (token, int(time.time())),
            ).fetchone()
        return row

    def require_user(self):
        user = self.current_user_row()
        if user is None:
            self.send_error_json("Требуется авторизация.", HTTPStatus.UNAUTHORIZED)
        elif user["banned"]:
            self.send_error_json("Аккаунт заблокирован.", HTTPStatus.FORBIDDEN)
        return user

    def require_admin(self):
        user = self.require_user()
        if user is not None and user["role"] != "admin":
            self.send_error_json("Недостаточно прав.", HTTPStatus.FORBIDDEN)
            return None
        return user

    def set_session_cookie(self, token):
        cookie = f"{SESSION_COOKIE}={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_TTL}"
        return {"Set-Cookie": cookie}

    def clear_session_cookie(self):
        token = self.cookie_value(SESSION_COOKIE)
        if token:
            with get_db() as db:
                db.execute("DELETE FROM sessions WHERE token = ?", (token,))
                db.commit()
        return {"Set-Cookie": f"{SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"}

    def do_GET(self):
        try:
            parsed = urlparse(self.path)
            if parsed.path == "/api/me":
                self.send_json({"ok": True, "user": public_user(self.current_user_row())})
                return
            if parsed.path == "/api/admin/users":
                if self.require_admin() is None:
                    return
                with get_db() as db:
                    rows = db.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
                self.send_json({"ok": True, "users": [public_user(row) for row in rows]})
                return
            self.serve_static(parsed.path)
        except Exception:
            traceback.print_exc()
            if not self.wfile.closed:
                self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, "Static file error")

    def do_POST(self):
        parsed = urlparse(self.path)
        body = request_body(self)
        if body is None:
            self.send_error_json("Некорректный JSON.")
            return
        if parsed.path == "/api/register":
            self.register(body)
        elif parsed.path == "/api/login":
            self.login(body)
        elif parsed.path == "/api/logout":
            self.send_json({"ok": True}, extra_headers=self.clear_session_cookie())
        elif parsed.path == "/api/admin/subscription":
            self.issue_subscription(body)
        elif parsed.path == "/api/admin/ban":
            self.toggle_ban(body)
        else:
            self.send_error_json("Маршрут не найден.", HTTPStatus.NOT_FOUND)

    def register(self, body):
        username = str(body.get("username", "")).strip()
        email = str(body.get("email", "")).strip().lower()
        password = str(body.get("password", ""))
        if not (3 <= len(username) <= 24) or not all(char.isalnum() or char == "_" for char in username):
            self.send_error_json("Логин: 3–24 символа, только латиница, цифры и _.")
            return
        if "@" not in email or len(email) > 120:
            self.send_error_json("Укажи корректный email.")
            return
        if len(password) < 8:
            self.send_error_json("Пароль должен быть не короче 8 символов.")
            return
        stamp = now_iso()
        user_id = f"ac_{uuid.uuid4().hex[:12]}"
        try:
            with get_db() as db:
                db.execute(
                    "INSERT INTO users (id, username, email, password_hash, created_at, last_active_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, username, email, hash_password(password), stamp, stamp),
                )
                db.commit()
        except sqlite3.IntegrityError:
            self.send_error_json("Такой логин или email уже зарегистрирован.", HTTPStatus.CONFLICT)
            return
        with get_db() as db:
            row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        self.send_json({"ok": True, "user": public_user(row)}, HTTPStatus.CREATED, self.set_session_cookie(create_session(user_id)))

    def login(self, body):
        identity = str(body.get("identity", "")).strip()
        password = str(body.get("password", ""))
        with get_db() as db:
            row = db.execute("SELECT * FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE", (identity, identity)).fetchone()
        if row is None or not verify_password(password, row["password_hash"]):
            self.send_error_json("Неверный логин или пароль.", HTTPStatus.UNAUTHORIZED)
            return
        if row["banned"]:
            self.send_error_json("Этот аккаунт заблокирован администратором.", HTTPStatus.FORBIDDEN)
            return
        stamp = now_iso()
        with get_db() as db:
            db.execute("UPDATE users SET last_active_at = ? WHERE id = ?", (stamp, row["id"]))
            db.commit()
            row = db.execute("SELECT * FROM users WHERE id = ?", (row["id"],)).fetchone()
        self.send_json({"ok": True, "user": public_user(row)}, extra_headers=self.set_session_cookie(create_session(row["id"])))

    def issue_subscription(self, body):
        if self.require_admin() is None:
            return
        username = str(body.get("username", "")).strip()
        try:
            days = int(body.get("days", 0))
        except (TypeError, ValueError):
            days = 0
        if not 1 <= days <= 3650:
            self.send_error_json("Срок подписки должен быть от 1 до 3650 дней.")
            return
        with get_db() as db:
            row = db.execute("SELECT * FROM users WHERE username = ? COLLATE NOCASE", (username,)).fetchone()
            if row is None:
                self.send_error_json("Пользователь не найден.", HTTPStatus.NOT_FOUND)
                return
            import datetime
            current = datetime.datetime.now(datetime.timezone.utc)
            if row["subscription_ends_at"]:
                try:
                    existing = datetime.datetime.fromisoformat(row["subscription_ends_at"].replace("Z", "+00:00"))
                    if existing > current:
                        current = existing
                except ValueError:
                    pass
            ending = (current + datetime.timedelta(days=days)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
            db.execute("UPDATE users SET subscription_ends_at = ?, banned = 0 WHERE id = ?", (ending, row["id"]))
            db.commit()
        self.send_json({"ok": True, "message": f"Подписка выдана: {username} · {days} дн."})

    def toggle_ban(self, body):
        if self.require_admin() is None:
            return
        user_id = str(body.get("id", ""))
        with get_db() as db:
            row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if row is None or row["role"] == "admin":
                self.send_error_json("Нельзя изменить этого пользователя.", HTTPStatus.BAD_REQUEST)
                return
            new_value = 0 if row["banned"] else 1
            db.execute("UPDATE users SET banned = ? WHERE id = ?", (new_value, user_id))
            db.commit()
        self.send_json({"ok": True, "banned": bool(new_value)})

    def serve_static(self, requested_path):
        relative = "index.html" if requested_path in ("", "/") else requested_path.lstrip("/")
        allowed = {"index.html", "styles.css", "app.js", "cat-avatar.jpg"}
        if relative not in allowed:
            self.send_error("Not found", HTTPStatus.NOT_FOUND)
            return
        file_path = BASE_DIR / relative
        if not file_path.is_file():
            self.send_error("Not found", HTTPStatus.NOT_FOUND)
            return
        content_length = file_path.stat().st_size
        content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8" if content_type.startswith("text/") or content_type == "application/javascript" else content_type)
        self.send_header("Content-Length", str(content_length))
        self.send_header("Connection", "close")
        self.end_headers()
        with file_path.open("rb") as asset:
            while chunk := asset.read(64 * 1024):
                self.wfile.write(chunk)
        self.wfile.flush()
        self.close_connection = True


if __name__ == "__main__":
    init_db()
    print(f"AnonCheat запущен: http://{HOST}:{PORT}")
    print(f"Админ: {ADMIN_LOGIN}")
    try:
        ThreadingHTTPServer((HOST, PORT), AppHandler).serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен.")
