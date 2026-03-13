
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def check_admin():
    url = os.getenv("DATABASE_URL")
    print(f"Connecting to: {url.split('@')[-1]}") # Print only host part
    conn = psycopg2.connect(url)
    cur = conn.cursor()
    
    try:
        # Check user
        cur.execute("SELECT id, email, is_active, school_id FROM users WHERE email = 'admin@university.edu';")
        user = cur.fetchone()
        if not user:
            print("❌ User admin@university.edu not found!")
            return
        
        user_id, email, is_active, school_id = user
        print(f"✅ User found: ID={user_id}, Email={email}, Active={is_active}, SchoolID={school_id}")
        
        # Check roles
        cur.execute("SELECT id, name FROM roles;")
        all_roles = cur.fetchall()
        print(f"✅ Existing Roles in roles table: {[r[1] for r in all_roles]}")

        cur.execute("""
            SELECT r.name 
            FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = %s;
        """, (user_id,))
        roles = cur.fetchall()
        if not roles:
            print("❌ No roles assigned to this user!")
        else:
            print(f"✅ Roles assigned: {[r[0] for r in roles]}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    check_admin()
