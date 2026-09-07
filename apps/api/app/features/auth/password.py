"""Password hashing and verification using native bcrypt."""

import bcrypt


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the plain-text password.

    Truncates at 72 bytes as per bcrypt specification.
    """
    password_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the hashed password."""
    try:
        password_bytes = plain.encode("utf-8")[:72]
        return bcrypt.checkpw(password_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


__all__ = ["hash_password", "verify_password"]
