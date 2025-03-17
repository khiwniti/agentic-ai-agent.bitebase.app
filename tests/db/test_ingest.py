import pytest
import json
from pathlib import Path
from unittest.mock import Mock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import tempfile
import os

from src.db.models import Base, Restaurant, MenuItem, Category, Review, RestaurantAnalytics
from src.db.ingest import LMWNDataIngester

# Test data
SAMPLE_RESTAURANT_DATA = {
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
    "contact_info": {
        "phone": "123-456-7890",
        "email": "test@restaurant.com"
    },
    "features": {
        "parking": True,
        "wifi": True
    },
    "menu": [
        {
            "name": "Test Dish",
            "description": "A test dish",
            "price": 250.0,
            "categories": ["Main", "Spicy"],
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

@pytest.fixture(scope="function")
def test_db():
    """Create a test database"""
    # Create temporary SQLite database
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    return TestingSessionLocal()

@pytest.fixture(scope="function")
def test_data_dir():
    """Create a temporary directory with test data"""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create test JSON file
        with open(os.path.join(tmpdir, '1-1.json'), 'w') as f:
            json.dump(SAMPLE_RESTAURANT_DATA, f)
        yield tmpdir

class TestLMWNDataIngester:
    
    def test_init(self, test_db):
        """Test ingester initialization"""
        with patch('src.db.ingest.SessionLocal', return_value=test_db):
            ingester = LMWNDataIngester("test_dir")
            assert ingester.data_dir == Path("test_dir")
            assert ingester.db is not None

    def test_get_or_create_category(self, test_db):
        """Test category creation and retrieval"""
        with patch('src.db.ingest.SessionLocal', return_value=test_db):
            ingester = LMWNDataIngester("test_dir")
            
            # Create new category
            category = ingester._get_or_create_category("Test Category")
            assert category.name == "Test Category"
            
            # Retrieve existing category
            same_category = ingester._get_or_create_category("Test Category")
            assert same_category.id == category.id

    def test_process_menu_items(self, test_db):
        """Test menu item processing"""
        with patch('src.db.ingest.SessionLocal', return_value=test_db):
            ingester = LMWNDataIngester("test_dir")
            
            # Create test restaurant
            restaurant = Restaurant(
                public_id="1",
                name="Test Restaurant"
            )
            test_db.add(restaurant)
            test_db.commit()

            # Process menu items
            menu_data = SAMPLE_RESTAURANT_DATA["menu"]
            ingester._process_menu_items(menu_data, restaurant)
            
            # Verify results
            menu_items = test_db.query(MenuItem).all()
            assert len(menu_items) == 1
            assert menu_items[0].name == "Test Dish"
            assert menu_items[0].price == 250.0

    def test_process_reviews(self, test_db):
        """Test review processing"""
        with patch('src.db.ingest.SessionLocal', return_value=test_db):
            ingester = LMWNDataIngester("test_dir")
            
            # Create test restaurant
            restaurant = Restaurant(
                public_id="1",
                name="Test Restaurant"
            )
            test_db.add(restaurant)
            test_db.commit()

            # Process reviews
            review_data = SAMPLE_RESTAURANT_DATA["reviews"]
            ingester._process_reviews(review_data, restaurant)
            
            # Verify results
            reviews = test_db.query(Review).all()
            assert len(reviews) == 1
            assert reviews[0].rating == 5.0
            assert reviews[0].comment == "Great food!"

    @pytest.mark.asyncio
    async def test_full_ingestion(self, test_db, test_data_dir):
        """Test complete ingestion process"""
        with patch('src.db.ingest.SessionLocal', return_value=test_db):
            ingester = LMWNDataIngester(test_data_dir)
            ingester.ingest_all()

            # Verify all data was processed
            restaurants = test_db.query(Restaurant).all()
            menu_items = test_db.query(MenuItem).all()
            reviews = test_db.query(Review).all()
            analytics = test_db.query(RestaurantAnalytics).all()

            assert len(restaurants) == 1
            assert len(menu_items) == 1
            assert len(reviews) == 1
            assert len(analytics) == 1

            # Verify relationships
            restaurant = restaurants[0]
            assert len(restaurant.menu_items) == 1
            assert len(restaurant.reviews) == 1
            assert len(restaurant.analytics) == 1

    def test_error_handling(self, test_db, test_data_dir):
        """Test error handling during ingestion"""
        with patch('src.db.ingest.SessionLocal', return_value=test_db):
            ingester = LMWNDataIngester(test_data_dir)
            
            # Test with invalid JSON
            with open(os.path.join(test_data_dir, 'invalid.json'), 'w') as f:
                f.write('invalid json')

            with pytest.raises(Exception):
                ingester.process_file(Path(os.path.join(test_data_dir, 'invalid.json')))

    def test_duplicate_handling(self, test_db, test_data_dir):
        """Test handling of duplicate data"""
        with patch('src.db.ingest.SessionLocal', return_value=test_db):
            ingester = LMWNDataIngester(test_data_dir)
            
            # Process same file twice
            ingester.ingest_all()
            ingester.ingest_all()

            # Verify no duplicates
            restaurants = test_db.query(Restaurant).all()
            assert len(restaurants) == 1

if __name__ == '__main__':
    pytest.main([__file__])
