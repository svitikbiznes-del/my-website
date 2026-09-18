import sys
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "anoncheat.db"

def promote(username):
    username = (username or "").strip()
    if not username:
        print("[!] Ошибка: логин пользователя не указан.")
        return False

    if not DB_PATH.exists():
        print(f"[!] База данных {DB_PATH.name} пока не создана. Сначала запустите start.bat и зарегистрируйтесь.")
        return False

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT id, username, role FROM users WHERE username = ? COLLATE NOCASE", (username,))
    row = cursor.fetchone()

    if not row:
        print(f"[!] Ошибка: пользователь '{username}' не найден в базе данных.")
        print("    Убедитесь, что вы сначала зарегистрировали этот аккаунт на сайте.")
        conn.close()
        return False

    if row["role"] == "admin":
        print(f"[*] Пользователь '{row['username']}' уже имеет права Администратора (admin).")
        conn.close()
        return True

    cursor.execute("UPDATE users SET role = 'admin' WHERE id = ?", (row["id"],))
    conn.commit()
    conn.close()

    print("=" * 60)
    print(f"[УСПЕХ] Пользователь '{row['username']}' успешно повышен до АДМИНИСТРАТОРА!")
    print("        Теперь в профиле и на форуме доступны все функции админки.")
    print("=" * 60)
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        promote(sys.argv[1])
    else:
        print("--- Выдача прав Администратора AnonCheat ---")
        user = input("Введите логин пользователя: ").strip()
        promote(user)
        input("\nНажмите Enter для выхода...")
