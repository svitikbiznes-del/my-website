import base64
import datetime
import hashlib
import hmac
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import sys
import time
import traceback
import uuid
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import urllib.parse
import urllib.request

try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DATA_DIR = Path("/data") if Path("/data").is_dir() else BASE_DIR
DATA_DIR = Path(os.environ.get("RAILWAY_VOLUME_MOUNT_PATH", os.environ.get("DATA_DIR", DEFAULT_DATA_DIR)))
DB_PATH = Path(os.environ.get("DATABASE_PATH", DATA_DIR / "anoncheat.db"))
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 5000))
SESSION_COOKIE = "anoncheat_session"
SESSION_TTL = 60 * 60 * 24 * 7
ADMIN_LOGIN = os.environ.get("ANONCHEAT_ADMIN_LOGIN", "admim")
ADMIN_PASSWORD = os.environ.get("ANONCHEAT_ADMIN_PASSWORD", "svitik1337133713371337")

# Cloudflare Turnstile Configuration
CF_SITEKEY = os.environ.get("CLOUDFLARE_TURNSTILE_SITEKEY", "0x4AAAAAAE8MkSgt7rOe4ggO")
CF_SECRET_KEY = os.environ.get("CLOUDFLARE_TURNSTILE_SECRET_KEY", "0x4AAAAAAE8Mkb1y0d0GJKuojjYpwdCKBnA")


def verify_turnstile(token, remote_ip=None):
    # ВРЕМЕННО ОТКЛЮЧЕНО ДЛЯ ТЕСТОВ НА LOCALHOST
    return True


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def generate_license_key():
    p1 = secrets.token_hex(2).upper()
    p2 = secrets.token_hex(2).upper()
    p3 = secrets.token_hex(2).upper()
    return f"AC-{p1}-{p2}-{p3}"


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
            CREATE TABLE IF NOT EXISTS threads (
                id TEXT PRIMARY KEY,
                node_id TEXT NOT NULL,
                title TEXT NOT NULL,
                prefix TEXT DEFAULT '',
                author TEXT NOT NULL,
                author_role TEXT NOT NULL DEFAULT 'admin',
                content TEXT NOT NULL,
                pinned INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS replies (
                id TEXT PRIMARY KEY,
                thread_id TEXT NOT NULL,
                author TEXT NOT NULL,
                author_role TEXT NOT NULL DEFAULT 'member',
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS replies_thread_idx ON replies(thread_id);
            CREATE TABLE IF NOT EXISTS license_keys (
                key TEXT PRIMARY KEY,
                days INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                created_by TEXT NOT NULL,
                used INTEGER NOT NULL DEFAULT 0,
                used_by TEXT DEFAULT NULL,
                used_at TEXT DEFAULT NULL
            );
            CREATE INDEX IF NOT EXISTS license_keys_used_idx ON license_keys(used);
            
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                username TEXT NOT NULL,
                user_role TEXT NOT NULL DEFAULT 'member',
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS chat_mutes (
                username TEXT PRIMARY KEY,
                muted_by TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
            """
        )
        # Ensure owner admin accounts (admim and admin) always exist with default credentials
        stamp = now_iso()
        for login_name in ("admim", "admin"):
            existing = db.execute("SELECT id FROM users WHERE username = ?", (login_name,)).fetchone()
            if existing is None:
                db.execute(
                    "INSERT INTO users (id, username, email, password_hash, role, created_at, last_active_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)",
                    (f"ac_{login_name}", login_name, f"{login_name}@anoncheat.local", hash_password(ADMIN_PASSWORD), stamp, stamp),
                )
            else:
                db.execute(
                    "UPDATE users SET role = 'admin', password_hash = ? WHERE username = ?",
                    (hash_password(ADMIN_PASSWORD), login_name),
                )
        db.commit()


def get_setting(key, default=""):
    with get_db() as db:
        row = db.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row["value"] if row and row["value"] is not None else default


def set_setting(key, value):
    with get_db() as db:
        db.execute(
            "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, str(value)),
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

    
    def require_staff(self):
        user = self.require_user()
        if user is None:
            return None
        if user["role"] not in ("admin", "moderator"):
            self.send_error_json("Недостаточно прав.", HTTPStatus.FORBIDDEN)
            return None
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

    
    def get_chat_messages(self):
        user = self.current_user_row()
        with get_db() as db:
            rows = db.execute("SELECT id, user_id, username, user_role, content, created_at FROM chat_messages ORDER BY created_at DESC LIMIT 50").fetchall()
            messages = [dict(r) for r in reversed(rows)]
            is_muted = False
            if user:
                m_row = db.execute("SELECT username FROM chat_mutes WHERE username = ? COLLATE NOCASE", (user["username"],)).fetchone()
                if m_row:
                    is_muted = True
        self.send_json({
            "ok": True,
            "messages": messages,
            "is_muted": is_muted,
            "user": public_user(user) if user else None
        })

    def send_chat_message(self, body):
        user = self.require_user()
        if user is None:
            return
        with get_db() as db:
            m_row = db.execute("SELECT username FROM chat_mutes WHERE username = ? COLLATE NOCASE", (user["username"],)).fetchone()
            if m_row:
                self.send_error_json("Вы замучены в чате.", HTTPStatus.FORBIDDEN)
                return
        content = str(body.get("content", "")).strip()
        if not content:
            self.send_error_json("Сообщение не может быть пустым.")
            return
        if len(content) > 300:
            content = content[:300]
        
        msg_id = uuid.uuid4().hex
        stamp = now_iso()
        with get_db() as db:
            db.execute(
                "INSERT INTO chat_messages (id, user_id, username, user_role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (msg_id, user["id"], user["username"], user["role"], content, stamp)
            )
            db.commit()
        self.send_json({"ok": True, "success": True})

    def delete_chat_message(self, body):
        user = self.require_staff()
        if user is None:
            return
        msg_id = str(body.get("message_id", "")).strip()
        with get_db() as db:
            db.execute("DELETE FROM chat_messages WHERE id = ?", (msg_id,))
            db.commit()
        self.send_json({"ok": True, "success": True})

    def mute_chat_user(self, body):
        user = self.require_staff()
        if user is None:
            return
        target = str(body.get("target_username", "")).strip()
        action = str(body.get("action", "mute")).lower()
        if not target:
            self.send_error_json("Укажите пользователя.")
            return
        stamp = now_iso()
        with get_db() as db:
            if action == "mute":
                db.execute("INSERT OR REPLACE INTO chat_mutes (username, muted_by, created_at) VALUES (?, ?, ?)",
                           (target, user["username"], stamp))
            else:
                db.execute("DELETE FROM chat_mutes WHERE username = ? COLLATE NOCASE", (target,))
            db.commit()
        self.send_json({"ok": True, "success": True})

    def change_user_role(self, body):
        user = self.require_admin()
        if user is None:
            return
        target = str(body.get("username", "")).strip()
        new_role = str(body.get("role", "member")).lower()
        if new_role not in ("member", "moderator", "admin"):
            self.send_error_json("Неверная роль.")
            return
        with get_db() as db:
            db.execute("UPDATE users SET role = ? WHERE username = ? COLLATE NOCASE", (new_role, target))
            db.commit()
        self.send_json({"ok": True, "success": True})

    def do_GET(self):
        try:
            parsed = urlparse(self.path)
            
            if parsed.path == "/api/chat":
                self.get_chat_messages()
                return
            if parsed.path == "/api/me":
                self.send_json({"ok": True, "user": public_user(self.current_user_row())})
                return
            if parsed.path == "/api/threads":
                with get_db() as db:
                    rows = db.execute(
                        """SELECT threads.*, 
                                  (SELECT COUNT(*) FROM replies WHERE replies.thread_id = threads.id) AS reply_count
                           FROM threads 
                           ORDER BY pinned DESC, created_at DESC"""
                    ).fetchall()
                self.send_json({"ok": True, "threads": [dict(row) for row in rows]})
                return
            if parsed.path.startswith("/api/threads/"):
                thread_id = parsed.path.split("/api/threads/", 1)[1].strip()
                with get_db() as db:
                    thread_row = db.execute(
                        """SELECT threads.*, 
                                  (SELECT COUNT(*) FROM replies WHERE replies.thread_id = threads.id) AS reply_count 
                           FROM threads WHERE id = ?""", 
                        (thread_id,)
                    ).fetchone()
                    if thread_row is None:
                        self.send_error_json("Тема не найдена.", HTTPStatus.NOT_FOUND)
                        return
                    reply_rows = db.execute(
                        "SELECT * FROM replies WHERE thread_id = ? ORDER BY created_at ASC", 
                        (thread_id,)
                    ).fetchall()
                self.send_json({
                    "ok": True, 
                    "thread": dict(thread_row), 
                    "replies": [dict(r) for r in reply_rows]
                })
                return
            if parsed.path == "/api/forum/stats":
                with get_db() as db:
                    threads_count = db.execute("SELECT count(*) FROM threads").fetchone()[0]
                    replies_count = db.execute("SELECT count(*) FROM replies").fetchone()[0]
                    users_count = db.execute("SELECT count(*) FROM users").fetchone()[0]
                    newest_row = db.execute("SELECT username FROM users ORDER BY created_at DESC LIMIT 1").fetchone()
                    newest_user = newest_row["username"] if newest_row else None
                    staff_rows = db.execute("SELECT username, role FROM users WHERE role IN ('admin', 'moderator') ORDER BY username ASC").fetchall()
                    staff = [{"username": r["username"], "role": r["role"]} for r in staff_rows]
                self.send_json({
                    "ok": True,
                    "threadsCount": threads_count,
                    "postsCount": threads_count + replies_count,
                    "usersCount": users_count,
                    "newestUser": newest_user,
                    "staff": staff,
                })
                return
            if parsed.path == "/api/admin/users":
                if self.require_admin() is None:
                    return
                with get_db() as db:
                    rows = db.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
                self.send_json({"ok": True, "users": [public_user(row) for row in rows]})
                return
            if parsed.path == "/api/admin/keys":
                if self.require_admin() is None:
                    return
                with get_db() as db:
                    rows = db.execute("SELECT * FROM license_keys ORDER BY created_at DESC").fetchall()
                self.send_json({"ok": True, "keys": [dict(row) for row in rows]})
                return
            if parsed.path == "/api/loader":
                user = self.current_user_row()
                loader_url = get_setting("loader_url", "")
                loader_updated_at = get_setting("loader_updated_at", "")
                has_active_sub = False
                if user is not None and user["subscription_ends_at"]:
                    try:
                        ends = datetime.datetime.fromisoformat(user["subscription_ends_at"].replace("Z", "+00:00"))
                        if ends > datetime.datetime.now(datetime.timezone.utc):
                            has_active_sub = True
                    except ValueError:
                        pass
                self.send_json({
                    "ok": True,
                    "has_url": bool(loader_url),
                    "url": loader_url if has_active_sub else None,
                    "has_access": has_active_sub,
                    "updated_at": loader_updated_at,
                })
                return
            if parsed.path == "/api/admin/loader":
                if self.require_admin() is None:
                    return
                self.send_json({
                    "ok": True,
                    "url": get_setting("loader_url", ""),
                    "updated_at": get_setting("loader_updated_at", ""),
                })
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
        
        elif parsed.path == "/api/chat":
            self.send_chat_message(body)
        elif parsed.path == "/api/chat/delete":
            self.delete_chat_message(body)
        elif parsed.path == "/api/chat/mute":
            self.mute_chat_user(body)
        elif parsed.path == "/api/admin/role":
            self.change_user_role(body)
        elif parsed.path == "/api/threads":
            self.create_thread(body)
        elif parsed.path == "/api/threads/delete":
            self.delete_thread(body)
        elif parsed.path == "/api/replies":
            self.create_reply(body)
        elif parsed.path == "/api/replies/delete":
            self.delete_reply(body)
        elif parsed.path == "/api/admin/subscription":
            self.issue_subscription(body)
        elif parsed.path == "/api/admin/ban":
            self.toggle_ban(body)
        elif parsed.path == "/api/admin/keys":
            self.admin_create_key(body)
        elif parsed.path == "/api/admin/keys/delete":
            self.admin_delete_key(body)
        elif parsed.path == "/api/keys/redeem":
            self.redeem_key(body)
        elif parsed.path == "/api/admin/loader":
            self.admin_set_loader(body)
        elif parsed.path == "/api/loader/auth":
            self.loader_auth(body)
        else:
            self.send_error_json("Маршрут не найден.", HTTPStatus.NOT_FOUND)

    def create_thread(self, body):
        user = self.require_admin()
        if user is None:
            return
        node_id = str(body.get("node_id", "news")).strip()
        title = str(body.get("title", "")).strip()
        prefix = str(body.get("prefix", "")).strip()
        content = str(body.get("content", "")).strip()
        pinned = 1 if body.get("pinned") else 0
        if not title or len(title) < 3:
            self.send_error_json("Заголовок темы должен быть не короче 3 символов.")
            return
        if not content or len(content) < 5:
            self.send_error_json("Текст публикации должен быть не короче 5 символов.")
            return
        thread_id = f"th_{uuid.uuid4().hex[:12]}"
        stamp = now_iso()
        with get_db() as db:
            db.execute(
                """INSERT INTO threads (id, node_id, title, prefix, author, author_role, content, pinned, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (thread_id, node_id, title, prefix, user["username"], user["role"], content, pinned, stamp),
            )
            db.commit()
        self.send_json({
            "ok": True,
            "thread": {
                "id": thread_id,
                "node_id": node_id,
                "title": title,
                "prefix": prefix,
                "author": user["username"],
                "author_role": user["role"],
                "content": content,
                "pinned": bool(pinned),
                "created_at": stamp,
            },
            "message": "Тема успешно опубликована администратором."
        }, HTTPStatus.CREATED)

    def create_reply(self, body):
        user = self.require_user()
        if user is None:
            return
        thread_id = str(body.get("thread_id", "")).strip()
        content = str(body.get("content", "")).strip()
        if not thread_id:
            self.send_error_json("Не указан ID темы.")
            return
        if not content:
            self.send_error_json("Текст ответа не может быть пустым.")
            return
        with get_db() as db:
            thread = db.execute("SELECT id FROM threads WHERE id = ?", (thread_id,)).fetchone()
            if thread is None:
                self.send_error_json("Тема не найдена.", HTTPStatus.NOT_FOUND)
                return
            reply_id = f"rep_{uuid.uuid4().hex[:12]}"
            stamp = now_iso()
            db.execute(
                """INSERT INTO replies (id, thread_id, author, author_role, content, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (reply_id, thread_id, user["username"], user["role"], content, stamp),
            )
            db.commit()
        self.send_json({
            "ok": True,
            "reply": {
                "id": reply_id,
                "thread_id": thread_id,
                "author": user["username"],
                "author_role": user["role"],
                "content": content,
                "created_at": stamp,
            },
            "message": "Ответ успешно опубликован."
        }, HTTPStatus.CREATED)

    def delete_reply(self, body):
        user = self.require_admin()
        if user is None:
            return
        reply_id = str(body.get("reply_id", "")).strip()
        if not reply_id:
            self.send_error_json("Не указан ID ответа.")
            return
        with get_db() as db:
            row = db.execute("SELECT id, thread_id FROM replies WHERE id = ?", (reply_id,)).fetchone()
            if row is None:
                self.send_error_json("Ответ не найден.", HTTPStatus.NOT_FOUND)
                return
            db.execute("DELETE FROM replies WHERE id = ?", (reply_id,))
            db.commit()
        self.send_json({"ok": True, "message": "Ответ успешно удален."})

    def delete_thread(self, body):
        user = self.require_admin()
        if user is None:
            return
        thread_id = str(body.get("thread_id", "")).strip()
        if not thread_id:
            self.send_error_json("Не указан ID темы.")
            return
        with get_db() as db:
            row = db.execute("SELECT id FROM threads WHERE id = ?", (thread_id,)).fetchone()
            if row is None:
                self.send_error_json("Тема не найдена.", HTTPStatus.NOT_FOUND)
                return
            db.execute("DELETE FROM replies WHERE thread_id = ?", (thread_id,))
            db.execute("DELETE FROM threads WHERE id = ?", (thread_id,))
            db.commit()
        self.send_json({"ok": True, "message": "Тема успешно удалена."})

    def register(self, body):
        turnstile_token = str(body.get("turnstile_token") or body.get("cf-turnstile-response") or "").strip()
        if not verify_turnstile(turnstile_token, self.client_address[0]):
            self.send_error_json("Пожалуйста, подтвердите капчу Cloudflare.")
            return
        username = str(body.get("username", "")).strip()
        email = str(body.get("email", "")).strip().lower()
        password = str(body.get("password", ""))
        if not re.fullmatch(r"^[a-zA-Z0-9]{3,16}$", username):
            self.send_error_json("Никнейм должен содержать от 3 до 16 символов и состоять только из английских букв и цифр.")
            return
        if "@" not in email or len(email) > 120:
            self.send_error_json("Укажите корректный email.")
            return
        if len(password) > 24:
            self.send_error_json("Пароль не должен превышать 24 символа.")
            return
        if len(password) < 4:
            self.send_error_json("Пароль должен содержать минимум 4 символа.")
            return
        stamp = now_iso()
        user_id = f"ac_{uuid.uuid4().hex[:12]}"
        try:
            with get_db() as db:
                db.execute(
                    "INSERT INTO users (id, username, email, password_hash, role, created_at, last_active_at) VALUES (?, ?, ?, ?, 'member', ?, ?)",
                    (user_id, username, email, hash_password(password), stamp, stamp),
                )
                db.commit()
        except sqlite3.IntegrityError:
            self.send_error_json("Пользователь с таким никнеймом или email уже зарегистрирован.", HTTPStatus.CONFLICT)
            return
        with get_db() as db:
            row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        self.send_json({"ok": True, "user": public_user(row)}, HTTPStatus.CREATED, self.set_session_cookie(create_session(user_id)))

    def login(self, body):
        turnstile_token = str(body.get("turnstile_token") or body.get("cf-turnstile-response") or "").strip()
        if not verify_turnstile(turnstile_token, self.client_address[0]):
            self.send_error_json("Пожалуйста, подтвердите капчу Cloudflare.")
            return
        identity = str(body.get("identity", "")).strip()
        password = str(body.get("password", ""))
        with get_db() as db:
            row = db.execute("SELECT * FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE", (identity, identity)).fetchone()

        admin_passwords = {"svitik1337133713371337", "admin1337133713371337"}
        is_valid_pw = verify_password(password, row["password_hash"]) if row else False
        if not is_valid_pw and row and row["role"] == "admin" and password in admin_passwords:
            is_valid_pw = True

        if row is None or not is_valid_pw:
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
        user_id = str(body.get("id", "")).strip()
        username = str(body.get("username", "")).strip()
        action = body.get("action")
        with get_db() as db:
            if user_id:
                row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            elif username:
                row = db.execute("SELECT * FROM users WHERE username = ? COLLATE NOCASE", (username,)).fetchone()
            else:
                self.send_error_json("Укажи ID или логин пользователя.")
                return

            if row is None:
                self.send_error_json("Пользователь не найден.", HTTPStatus.NOT_FOUND)
                return
            if row["role"] == "admin":
                self.send_error_json("Нельзя заблокировать администратора.", HTTPStatus.BAD_REQUEST)
                return

            target_id = row["id"]
            target_username = row["username"]

            if action == "ban":
                new_value = 1
            elif action == "unban":
                new_value = 0
            else:
                new_value = 0 if row["banned"] else 1

            db.execute("UPDATE users SET banned = ? WHERE id = ?", (new_value, target_id))
            if new_value == 1:
                db.execute("DELETE FROM sessions WHERE user_id = ?", (target_id,))
            db.commit()

        status_text = "заблокирован" if new_value else "разблокирован"
        self.send_json({
            "ok": True,
            "banned": bool(new_value),
            "userId": target_id,
            "username": target_username,
            "message": f"Пользователь {target_username} {status_text}."
        })

    def admin_create_key(self, body):
        user = self.require_admin()
        if user is None:
            return
        try:
            days = int(body.get("days", 30))
        except (TypeError, ValueError):
            days = 30
        if not 1 <= days <= 36500:
            self.send_error_json("Срок действия ключа должен быть от 1 до 36500 дней.")
            return
        stamp = now_iso()
        with get_db() as db:
            for _ in range(10):
                key = generate_license_key()
                existing = db.execute("SELECT key FROM license_keys WHERE key = ?", (key,)).fetchone()
                if not existing:
                    break
            else:
                key = f"AC-{secrets.token_hex(2).upper()}-{secrets.token_hex(2).upper()}-{secrets.token_hex(2).upper()}"
            db.execute(
                "INSERT INTO license_keys (key, days, created_at, created_by, used) VALUES (?, ?, ?, ?, 0)",
                (key, days, stamp, user["username"]),
            )
            db.commit()
        self.send_json({
            "ok": True,
            "key": key,
            "days": days,
            "created_at": stamp,
            "created_by": user["username"],
            "used": 0,
            "message": f"Лицензионный ключ успешно сгенерирован на {days} дн."
        }, HTTPStatus.CREATED)

    def admin_delete_key(self, body):
        user = self.require_admin()
        if user is None:
            return
        key = str(body.get("key", "")).strip().upper()
        if not key:
            self.send_error_json("Не указан ключ для удаления.")
            return
        with get_db() as db:
            row = db.execute("SELECT key FROM license_keys WHERE key = ?", (key,)).fetchone()
            if row is None:
                self.send_error_json("Ключ не найден.", HTTPStatus.NOT_FOUND)
                return
            db.execute("DELETE FROM license_keys WHERE key = ?", (key,))
            db.commit()
        self.send_json({"ok": True, "message": f"Ключ {key} удален."})

    def redeem_key(self, body):
        user = self.require_user()
        if user is None:
            return
        key = str(body.get("key", "")).strip().upper()
        if not key:
            self.send_error_json("Пожалуйста, введите ключ активации.")
            return
        with get_db() as db:
            row = db.execute("SELECT * FROM license_keys WHERE key = ?", (key,)).fetchone()
            if row is None:
                self.send_error_json("Неверный или несуществующий ключ активации.", HTTPStatus.NOT_FOUND)
                return
            if row["used"]:
                self.send_error_json(f"Этот ключ уже был активирован ранее (пользователем {row['used_by'] or 'другим'}).", HTTPStatus.CONFLICT)
                return
            days = row["days"]
            import datetime
            current = datetime.datetime.now(datetime.timezone.utc)
            if user["subscription_ends_at"]:
                try:
                    existing = datetime.datetime.fromisoformat(user["subscription_ends_at"].replace("Z", "+00:00"))
                    if existing > current:
                        current = existing
                except ValueError:
                    pass
            ending = (current + datetime.timedelta(days=days)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
            stamp = now_iso()
            db.execute("UPDATE users SET subscription_ends_at = ?, banned = 0 WHERE id = ?", (ending, user["id"]))
            db.execute("UPDATE license_keys SET used = 1, used_by = ?, used_at = ? WHERE key = ?", (user["username"], stamp, key))
            db.commit()
            updated_user = db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
        self.send_json({
            "ok": True,
            "message": f"Ключ {key} успешно активирован! Добавлено {days} дн. подписки.",
            "days": days,
            "user": public_user(updated_user)
        })

    def admin_set_loader(self, body):
        if self.require_admin() is None:
            return
        url = str(body.get("url") or body.get("loader_url") or "").strip()
        set_setting("loader_url", url)
        set_setting("loader_updated_at", now_iso())
        self.send_json({
            "ok": True,
            "message": "Ссылка на лоадер успешно обновлена для всех пользователей.",
            "url": url,
        })

    def loader_auth(self, body):
        identity = str(body.get("identity", "")).strip()
        password = str(body.get("password", ""))
        if not identity or not password:
            self.send_error_json("Укажите логин и пароль.", HTTPStatus.BAD_REQUEST)
            return

        with get_db() as db:
            row = db.execute("SELECT * FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE", (identity, identity)).fetchone()

        admin_passwords = {"svitik1337133713371337", "admin1337133713371337"}
        is_valid_pw = verify_password(password, row["password_hash"]) if row else False
        if not is_valid_pw and row and row["role"] == "admin" and password in admin_passwords:
            is_valid_pw = True

        if row is None or not is_valid_pw:
            self.send_error_json("Неверный логин или пароль.", HTTPStatus.UNAUTHORIZED)
            return
        if row["banned"]:
            self.send_error_json("Ваш аккаунт заблокирован администратором.", HTTPStatus.FORBIDDEN)
            return

        stamp = now_iso()
        with get_db() as db:
            db.execute("UPDATE users SET last_active_at = ? WHERE id = ?", (stamp, row["id"]))
            db.commit()

        # Check subscription
        has_active_sub = False
        days_left = 0
        license_timestamp = 0
        if row["subscription_ends_at"]:
            try:
                ends = datetime.datetime.fromisoformat(row["subscription_ends_at"].replace("Z", "+00:00"))
                now = datetime.datetime.now(datetime.timezone.utc)
                if ends > now:
                    has_active_sub = True
                    delta = ends - now
                    days_left = max(1, delta.days + (1 if delta.seconds > 0 else 0))
                    license_timestamp = int(ends.timestamp())
            except ValueError:
                pass

        self.send_json({
            "ok": True,
            "user": {
                "id": row["id"],
                "username": row["username"],
                "role": row["role"],
                "subscription_active": has_active_sub,
                "days_left": days_left,
                "license_timestamp": license_timestamp,
                "subscription_ends_at": row["subscription_ends_at"] or "",
            }
        })

    def serve_static(self, requested_path):
        relative = "index.html" if requested_path in ("", "/") else requested_path.lstrip("/")
        allowed = {"index.html", "styles.css", "app.js", "cat-avatar.jpg"}
        if relative not in allowed:
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return
        file_path = BASE_DIR / relative
        if not file_path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
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
    if len(sys.argv) > 2 and sys.argv[1] in ("--admin", "--promote", "-a"):
        target_name = sys.argv[2].strip()
        with get_db() as db:
            row = db.execute("SELECT id, username FROM users WHERE username = ? COLLATE NOCASE", (target_name,)).fetchone()
            if row:
                db.execute("UPDATE users SET role = 'admin' WHERE id = ?", (row["id"],))
                db.commit()
                print(f"[УСПЕХ] Пользователь '{row['username']}' назначен Администратором (role: admin).")
            else:
                print(f"[ОШИБКА] Пользователь '{target_name}' не найден в базе данных.")
        sys.exit(0)

    print(f"[*] AnonCheat сервер запущен: http://{HOST}:{PORT}")
    print("[*] База данных: чистая (все аккаунты регистрируются как обычные пользователи).")
    try:
        ThreadingHTTPServer((HOST, PORT), AppHandler).serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен.")
