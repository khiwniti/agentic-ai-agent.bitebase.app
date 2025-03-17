import pytest
import os
import tempfile
import json
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import create_database, drop_database

from src.db.models import Base
from src.db.config import DATABASE_URL

# Test database URL
TEST_DATABASE_URL = f"{DATABASE_URL}_test"

@pytest.fixture(scope="session")
def test_db_url():
    """Create a test database URL"""
    return TEST_DATABASE_URL

@pytest.fixture(scope="session")
def engine(test_db_url):
    """Create a test database engine"""
    # Create test database
    create_database(test_db_url)
    
    # Create engine
    engine = create_engine(test_db_url)
    
    # Create all tables
    Base.metadata.create_all(engine)
    
    yield engine
    
    # Drop test database
    drop_database(test_db_url)

@pytest.fixture(scope="function")
def db_session(engine):
    """Create a new database session for a test"""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    # Rollback the transaction
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def test_data_dir():
    """Create a temporary directory with test data"""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Sample restaurant data
        sample_data = {
            "name": "Test Restaurant",
            "branch_name": "Test Branch",
            "description": "A test restaurant",
            "address": "123 Test St",
            "latitude": 13.7563,
            "longitude": 100.5018,
            "cuisine_type": "Thai",
            "opening_hours": {
                "monday": ["11:00", "22:00"],
                "tuesday": ["11:00", "22:00"]
            },
            "rating": 4.5,
            "price_range": {"min": 100, "max": 500},
            "menu": [
                {
                    "name": "Test Dish",
                    "description": "A delicious test dish",
                    "price": 250.0,
                    "categories": ["Main", "Popular"],
                    "is_recommended": True
                }
            ],
            "reviews": [
                {
                    "rating": 5.0,
                    "comment": "Great food!",
                    "reviewer_id": "user123"
                }
            ]
        }

        # Create test files
        data_dir = Path(tmpdir)
        
        # Create a few test restaurant files
        for i in range(1, 4):
            file_path = data_dir / f"{i}-1.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                test_data = sample_data.copy()
                test_data["name"] = f"Test Restaurant {i}"
                json.dump(test_data, f)

        yield data_dir

@pytest.fixture(scope="function")
def clean_db(db_session):
    """Ensure the database is clean before each test"""
    # Delete all data from all tables
    for table in reversed(Base.metadata.sorted_tables):
        db_session.execute(table.delete())
    db_session.commit()
    yield db_session

@pytest.fixture(scope="function")
def mock_env(monkeypatch):
    """Set up test environment variables"""
    monkeypatch.setenv('DATABASE_URL', TEST_DATABASE_URL)
    yield

@pytest.fixture(scope="function")
def cli_runner():
    """Create a CLI test runner"""
    from click.testing import CliRunner
    return CliRunner()

@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for async tests"""
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
