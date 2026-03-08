"""
Migration script to add new cookie and tracking columns to sandbox_reports table
Run this script once to update the database schema
"""
import sqlite3
import os

# Path to your database
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "mailshield.db")

def migrate_database():
    """Add new columns to sandbox_reports table"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # List of new columns to add
    new_columns = [
        ("total_cookies", "INTEGER DEFAULT 0"),
        ("advertising_cookies", "INTEGER DEFAULT 0"),
        ("analytics_cookies", "INTEGER DEFAULT 0"),
        ("functional_cookies", "INTEGER DEFAULT 0"),
        ("session_cookies", "INTEGER DEFAULT 0"),
        ("persistent_cookies", "INTEGER DEFAULT 0"),
        ("third_party_cookies", "INTEGER DEFAULT 0"),
        ("tracking_cookie_details", "TEXT"),  # Will store JSON
        ("advertising_cookie_details", "TEXT"),  # Will store JSON
        ("analytics_cookie_details", "TEXT"),  # Will store JSON
        ("analytics_services", "TEXT"),  # Will store JSON
        ("ad_networks", "TEXT"),  # Will store JSON
        ("social_trackers", "TEXT"),  # Will store JSON
        ("page_metadata", "TEXT"),  # Will store JSON
    ]
    
    print("Starting database migration...")
    
    # Get existing columns
    cursor.execute("PRAGMA table_info(sandbox_reports)")
    existing_columns = {row[1] for row in cursor.fetchall()}
    
    # Add each new column if it doesn't exist
    for column_name, column_type in new_columns:
        if column_name not in existing_columns:
            try:
                sql = f"ALTER TABLE sandbox_reports ADD COLUMN {column_name} {column_type}"
                cursor.execute(sql)
                print(f"✓ Added column: {column_name}")
            except sqlite3.OperationalError as e:
                print(f"⚠ Warning adding {column_name}: {e}")
        else:
            print(f"→ Column {column_name} already exists, skipping")
    
    conn.commit()
    conn.close()
    
    print("\n✓ Migration completed successfully!")
    print("You can now restart your backend server.")

if __name__ == "__main__":
    if os.path.exists(DATABASE_PATH):
        migrate_database()
    else:
        print(f"Database not found at {DATABASE_PATH}")
        print("The database will be created automatically when you start the backend server.")
