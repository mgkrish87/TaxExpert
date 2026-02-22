"""Make a user an admin by email.

Usage:
    python make_admin.py your@email.com
"""

import sys
import asyncio
from sqlalchemy import select, update
from database import async_session, init_db
from models.user import User


async def make_admin(email: str):
    await init_db()
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            print(f"❌ No user found with email: {email}")
            print("\nRegistered users:")
            all_users = await session.execute(select(User))
            for u in all_users.scalars().all():
                print(f"  • {u.email} ({u.full_name}) - role: {u.role}")
            return

        user.role = "admin"
        session.add(user)
        await session.commit()
        print(f"✅ {user.full_name} ({user.email}) is now an admin!")
        print(f"\nYou can now access admin endpoints:")
        print(f"  GET /api/admin/stats   — System statistics")
        print(f"  GET /api/admin/users   — All registered users")
        print(f"  GET /api/admin/filings — All filings")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
        print("\nListing all users:")
        asyncio.run(make_admin(""))
    else:
        asyncio.run(make_admin(sys.argv[1]))
