from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.internal.db.users import create_user
from app.internal.token import hash_password
from dotenv import load_dotenv
import os


print('starting...')

# Load .env variables
#load_dotenv(".env")

# Construct the DATABASE_URL using environment variables
#DATABASE_URL = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"

'''
def get_db():
    # Create the SQLAlchemy engine
    engine = create_engine(DATABASE_URL)

    # Create a session factory bound to this engine
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

        '''

if __name__ == "__main__":
    print('starting')
    '''
    # Get root user information from environment variables
    root_username = os.getenv("ROOT_USERNAME")
    root_first_name = os.getenv("ROOT_FIRST_NAME")
    root_last_name = os.getenv("ROOT_LAST_NAME")
    root_email = os.getenv("ROOT_EMAIL")
    root_password = os.getenv("ROOT_PASSWORD")
    print(DATABASE_URL)

    # Hash the root user's password
    hashed_password = hash_password(root_password)

    # Initialize database session
    for db in get_db():
        # Create the admin user
        result = create_user(
            db,
            root_username,
            root_email,
            hashed_password,
            root_first_name,
            root_last_name,
            True
        )
        
        # Check the result and print the status
        if result['status'] == 'success':
            print("Admin user successfully created.")
        else:
            print(f"Failed to create admin user: {result['detail']}")

        # Close db session and exit loop
        db.close()
        break
'''