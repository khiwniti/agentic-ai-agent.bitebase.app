import pytest
import json
from pathlib import Path
from sqlalchemy.orm import Session
from src.db.ingest import LMWNDataIngester
from src.db.models import Restaurant, MenuItem, Category, Review, PriceRange, RestaurantAnalytics

def test_load_existing_categories(clean_db, test_data_dir):
    """Test loading of existing categories"""
    # Create some test categories
    categories = ["Thai", "Seafood", "Dessert"]
    for name in categories:
        cat = Category(name=name)
        clean_db.add(cat)
    clean_db.commit()

    # Initialize ingester
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db  # Use test session

    # Test category loading
    loaded_categories = ingester._load_existing_categories()
    assert set(loaded_categories.keys()) == set(categories)
    assert all(isinstance(v, int) for v in loaded_categories.values())

def test_get_or_create_category(clean_db, test_data_dir):
    """Test category creation and retrieval"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Test creating new category
    category = ingester._get_or_create_category("Test Category")
    assert category.name == "Test Category"
    assert category.id is not None

    # Test retrieving existing category
    same_category = ingester._get_or_create_category("Test Category")
    assert same_category.id == category.id

def test_parse_price_range(clean_db, test_data_dir):
    """Test price range parsing"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Test various price ranges
    low_price = {"min": 0, "max": 100}
    medium_price = {"min": 100, "max": 500}
    high_price = {"min": 500, "max": 1000}
    premium_price = {"min": 1000, "max": None}

    assert ingester._parse_price_range(low_price) == PriceRange.LOW
    assert ingester._parse_price_range(medium_price) == PriceRange.MEDIUM
    assert ingester._parse_price_range(high_price) == PriceRange.HIGH
    assert ingester._parse_price_range(premium_price) == PriceRange.PREMIUM

def test_process_menu_items(clean_db, test_data_dir):
    """Test menu item processing"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Create test restaurant
    restaurant = Restaurant(
        public_id="1",
        name="Test Restaurant"
    )
    clean_db.add(restaurant)
    clean_db.commit()

    # Test menu data
    menu_data = [
        {
            "name": "Test Dish 1",
            "description": "Description 1",
            "price": 100.0,
            "categories": ["Main", "Spicy"],
            "is_recommended": True
        },
        {
            "name": "Test Dish 2",
            "description": "Description 2",
            "price": 150.0,
            "categories": ["Dessert"],
            "is_vegetarian": True
        }
    ]

    # Process menu items
    ingester._process_menu_items(menu_data, restaurant)
    clean_db.commit()

    # Verify results
    menu_items = clean_db.query(MenuItem).all()
    assert len(menu_items) == 2
    assert {item.name for item in menu_items} == {"Test Dish 1", "Test Dish 2"}
    assert len(menu_items[0].categories) > 0

def test_process_reviews(clean_db, test_data_dir):
    """Test review processing"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Create test restaurant
    restaurant = Restaurant(
        public_id="1",
        name="Test Restaurant"
    )
    clean_db.add(restaurant)
    clean_db.commit()

    # Test review data
    reviews_data = [
        {
            "rating": 5.0,
            "comment": "Great food!",
            "reviewer_id": "user1"
        },
        {
            "rating": 3.5,
            "comment": "Average experience",
            "reviewer_id": "user2"
        }
    ]

    # Process reviews
    ingester._process_reviews(reviews_data, restaurant)
    clean_db.commit()

    # Verify results
    reviews = clean_db.query(Review).all()
    assert len(reviews) == 2
    assert {review.rating for review in reviews} == {5.0, 3.5}

def test_create_analytics(clean_db, test_data_dir):
    """Test analytics creation"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Create test restaurant
    restaurant = Restaurant(
        public_id="1",
        name="Test Restaurant"
    )
    clean_db.add(restaurant)
    clean_db.commit()

    # Test analytics data
    analytics_data = {
        "views": 1000,
        "orders": 50,
        "revenue": 5000.0,
        "average_order_value": 100.0,
        "popular_items": ["Dish 1", "Dish 2"],
        "peak_hours": {"12:00": 20, "13:00": 30}
    }

    # Create analytics
    ingester._create_analytics(analytics_data, restaurant)
    clean_db.commit()

    # Verify results
    analytics = clean_db.query(RestaurantAnalytics).first()
    assert analytics is not None
    assert analytics.views == 1000
    assert analytics.revenue == 5000.0

@pytest.mark.asyncio
async def test_full_ingestion_process(clean_db, test_data_dir):
    """Test complete ingestion process"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Run ingestion
    ingester.ingest_all()

    # Verify all data was processed
    restaurants = clean_db.query(Restaurant).all()
    menu_items = clean_db.query(MenuItem).all()
    reviews = clean_db.query(Review).all()
    categories = clean_db.query(Category).all()
    analytics = clean_db.query(RestaurantAnalytics).all()

    assert len(restaurants) > 0
    assert len(menu_items) > 0
    assert len(reviews) > 0
    assert len(categories) > 0
    assert len(analytics) > 0

def test_error_handling(clean_db, test_data_dir):
    """Test error handling during ingestion"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Test with invalid JSON
    invalid_file = Path(test_data_dir) / "invalid.json"
    invalid_file.write_text("invalid json")

    with pytest.raises(Exception):
        ingester.process_file(invalid_file)

def test_duplicate_handling(clean_db, test_data_dir):
    """Test handling of duplicate data"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Run ingestion twice
    ingester.ingest_all()
    ingester.ingest_all()

    # Verify no duplicates
    restaurants = clean_db.query(Restaurant).all()
    assert len(restaurants) == len(set(r.public_id for r in restaurants))

def test_data_relationships(clean_db, test_data_dir):
    """Test relationships between ingested data"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Run ingestion
    ingester.ingest_all()

    # Get a restaurant
    restaurant = clean_db.query(Restaurant).first()
    assert restaurant is not None

    # Check relationships
    assert len(restaurant.menu_items) > 0
    assert len(restaurant.reviews) > 0
    assert len(restaurant.analytics) > 0

    # Check menu item categories
    menu_item = restaurant.menu_items[0]
    assert len(menu_item.categories) > 0

def test_data_validation(clean_db, test_data_dir):
    """Test data validation during ingestion"""
    ingester = LMWNDataIngester(test_data_dir)
    ingester.db = clean_db

    # Create invalid test data
    invalid_data = {
        "name": "Test Restaurant",
        # Missing required fields
    }
    invalid_file = Path(test_data_dir) / "invalid_restaurant.json"
    with open(invalid_file, "w") as f:
        json.dump(invalid_data, f)

    # Test ingestion with invalid data
    with pytest.raises(Exception):
        ingester.process_file(invalid_file)

    # Verify no invalid data was ingested
    restaurants = clean_db.query(Restaurant).all()
    assert all(r.address is not None for r in restaurants)
