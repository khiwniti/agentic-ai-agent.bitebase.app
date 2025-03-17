from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey, Table, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .config import Base
import enum

# Enums
class MenuItemStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SEASONAL = "seasonal"

class PriceRange(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PREMIUM = "premium"

# Association tables
menu_categories = Table(
    'menu_categories', 
    Base.metadata,
    Column('menu_id', Integer, ForeignKey('menu_items.id')),
    Column('category_id', Integer, ForeignKey('categories.id'))
)

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, unique=True, index=True)
    name = Column(String)
    branch_name = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    cuisine_type = Column(String)
    opening_hours = Column(JSON)
    rating = Column(Float)
    price_range = Column(Enum(PriceRange))
    contact_info = Column(JSON)
    features = Column(JSON)  # Store features like parking, wifi, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    menu_items = relationship("MenuItem", back_populates="restaurant")
    reviews = relationship("Review", back_populates="restaurant")
    analytics = relationship("RestaurantAnalytics", back_populates="restaurant")

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    name = Column(String)
    description = Column(Text, nullable=True)
    price = Column(Float)
    original_price = Column(Float, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(Enum(MenuItemStatus), default=MenuItemStatus.ACTIVE)
    is_recommended = Column(Boolean, default=False)
    is_spicy = Column(Boolean, default=False)
    is_vegetarian = Column(Boolean, default=False)
    is_signature = Column(Boolean, default=False)
    nutritional_info = Column(JSON, nullable=True)
    preparation_time = Column(Integer, nullable=True)  # in minutes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="menu_items")
    categories = relationship("Category", secondary=menu_categories)
    reviews = relationship("Review", back_populates="menu_item")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    menu_items = relationship("MenuItem", secondary=menu_categories)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=True)
    rating = Column(Float)
    comment = Column(Text, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String)  # e.g., "LMWN", "website", "app"
    reviewer_id = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="reviews")
    menu_item = relationship("MenuItem", back_populates="reviews")

class RestaurantAnalytics(Base):
    __tablename__ = "restaurant_analytics"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    views = Column(Integer, default=0)
    orders = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    average_order_value = Column(Float, default=0.0)
    customer_retention_rate = Column(Float, nullable=True)
    popular_items = Column(JSON)  # Store top selling items
    peak_hours = Column(JSON)  # Store busy hours data
    performance_metrics = Column(JSON)  # Store additional metrics
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="analytics")

# Create indexes
from sqlalchemy import Index
Index('idx_restaurant_location', Restaurant.latitude, Restaurant.longitude)
Index('idx_menu_item_price', MenuItem.price)
Index('idx_review_rating', Review.rating)
Index('idx_analytics_timestamp', RestaurantAnalytics.timestamp)
