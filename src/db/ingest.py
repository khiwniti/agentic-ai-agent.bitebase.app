import json
import os
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import logging
from datetime import datetime
from pathlib import Path

from src.db.models import Restaurant, MenuItem, Category, Review, RestaurantAnalytics, PriceRange, MenuItemStatus
from src.db.config import SessionLocal, engine, Base

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LMWNDataIngester:
    def __init__(self, data_dir: str = "LMWN"):
        self.data_dir = Path(data_dir)
        self.db = SessionLocal()
        self.existing_categories = self._load_existing_categories()

    def _load_existing_categories(self) -> Dict[str, int]:
        """Load existing categories from database"""
        return {cat.name: cat.id for cat in self.db.query(Category).all()}

    def _get_or_create_category(self, category_name: str) -> Category:
        """Get existing category or create new one"""
        if category_name in self.existing_categories:
            return self.db.query(Category).get(self.existing_categories[category_name])
        
        category = Category(name=category_name)
        self.db.add(category)
        self.db.commit()
        self.existing_categories[category_name] = category.id
        return category

    def _parse_price_range(self, price_data: Dict[str, Any]) -> PriceRange:
        """Convert price data to PriceRange enum"""
        # TODO: Implement price range logic based on actual data
        return PriceRange.MEDIUM

    def _process_menu_items(self, menu_data: List[Dict], restaurant: Restaurant) -> None:
        """Process and create menu items"""
        for item in menu_data:
            menu_item = MenuItem(
                restaurant_id=restaurant.id,
                name=item.get('name', ''),
                description=item.get('description'),
                price=item.get('price', 0.0),
                original_price=item.get('original_price'),
                image_url=item.get('image_url'),
                status=MenuItemStatus.ACTIVE,
                is_recommended=item.get('is_recommended', False),
                is_spicy=item.get('is_spicy', False),
                is_vegetarian=item.get('is_vegetarian', False),
                is_signature=item.get('is_signature', False),
                nutritional_info=item.get('nutritional_info', {})
            )

            # Process categories
            for category_name in item.get('categories', []):
                category = self._get_or_create_category(category_name)
                menu_item.categories.append(category)

            self.db.add(menu_item)

    def _process_reviews(self, review_data: List[Dict], restaurant: Restaurant) -> None:
        """Process and create reviews"""
        for review in review_data:
            review_obj = Review(
                restaurant_id=restaurant.id,
                rating=review.get('rating', 0.0),
                comment=review.get('comment', ''),
                source='LMWN',
                reviewer_id=review.get('reviewer_id'),
                is_verified=review.get('is_verified', False)
            )
            self.db.add(review_obj)

    def _create_analytics(self, analytics_data: Dict[str, Any], restaurant: Restaurant) -> None:
        """Create initial analytics record"""
        analytics = RestaurantAnalytics(
            restaurant_id=restaurant.id,
            views=analytics_data.get('views', 0),
            orders=analytics_data.get('orders', 0),
            revenue=analytics_data.get('revenue', 0.0),
            average_order_value=analytics_data.get('average_order_value', 0.0),
            popular_items=analytics_data.get('popular_items', {}),
            peak_hours=analytics_data.get('peak_hours', {}),
            performance_metrics=analytics_data.get('performance_metrics', {})
        )
        self.db.add(analytics)

    def process_file(self, file_path: Path) -> None:
        """Process a single JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Extract public_id from filename (e.g., "1-1.json" -> "1")
            public_id = file_path.stem.split('-')[0]

            # Check if restaurant already exists
            existing = self.db.query(Restaurant).filter_by(public_id=public_id).first()
            if existing:
                logger.info(f"Restaurant {public_id} already exists, skipping...")
                return

            # Create restaurant
            restaurant = Restaurant(
                public_id=public_id,
                name=data.get('name', ''),
                branch_name=data.get('branch_name'),
                description=data.get('description'),
                address=data.get('address', ''),
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                cuisine_type=data.get('cuisine_type', ''),
                opening_hours=data.get('opening_hours', {}),
                rating=data.get('rating', 0.0),
                price_range=self._parse_price_range(data.get('price_range', {})),
                contact_info=data.get('contact_info', {}),
                features=data.get('features', {})
            )
            self.db.add(restaurant)
            self.db.commit()

            # Process related data
            self._process_menu_items(data.get('menu', []), restaurant)
            self._process_reviews(data.get('reviews', []), restaurant)
            self._create_analytics(data.get('analytics', {}), restaurant)

            self.db.commit()
            logger.info(f"Successfully processed {file_path}")

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error processing {file_path}: {str(e)}")
            raise

    def ingest_all(self) -> None:
        """Process all JSON files in the data directory"""
        try:
            # Create tables if they don't exist
            Base.metadata.create_all(bind=engine)

            # Process each file
            for file_path in sorted(self.data_dir.glob('*.json')):
                logger.info(f"Processing {file_path}")
                self.process_file(file_path)

            logger.info("Data ingestion completed successfully")

        except Exception as e:
            logger.error(f"Data ingestion failed: {str(e)}")
            raise
        finally:
            self.db.close()

if __name__ == "__main__":
    ingester = LMWNDataIngester()
    ingester.ingest_all()
