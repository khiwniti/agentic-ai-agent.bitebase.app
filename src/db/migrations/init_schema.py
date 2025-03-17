from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON, ENUM
import enum

# Create revision ID: init_schema
revision = 'init_schema_001'
down_revision = None
branch_labels = None
depends_on = None

class PriceRange(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PREMIUM = "premium"

class MenuItemStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SEASONAL = "seasonal"

def upgrade():
    # Create ENUM types
    price_range_enum = ENUM(
        'low', 'medium', 'high', 'premium',
        name='price_range'
    )
    price_range_enum.create(op.get_bind())

    menu_item_status_enum = ENUM(
        'active', 'inactive', 'seasonal',
        name='menu_item_status'
    )
    menu_item_status_enum.create(op.get_bind())

    # Create restaurants table
    op.create_table(
        'restaurants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('public_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('branch_name', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('cuisine_type', sa.String(), nullable=True),
        sa.Column('opening_hours', JSON, nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('price_range', price_range_enum, nullable=True),
        sa.Column('contact_info', JSON, nullable=True),
        sa.Column('features', JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('public_id')
    )
    op.create_index('idx_restaurant_public_id', 'restaurants', ['public_id'])
    op.create_index('idx_restaurant_location', 'restaurants', ['latitude', 'longitude'])

    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create menu_items table
    op.create_table(
        'menu_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('restaurant_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('original_price', sa.Float(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('status', menu_item_status_enum, nullable=False),
        sa.Column('is_recommended', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_spicy', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_vegetarian', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_signature', sa.Boolean(), nullable=False, default=False),
        sa.Column('nutritional_info', JSON, nullable=True),
        sa.Column('preparation_time', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['restaurant_id'], ['restaurants.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_menu_item_restaurant', 'menu_items', ['restaurant_id'])
    op.create_index('idx_menu_item_price', 'menu_items', ['price'])

    # Create menu_categories association table
    op.create_table(
        'menu_categories',
        sa.Column('menu_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['menu_id'], ['menu_items.id']),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id']),
        sa.PrimaryKeyConstraint('menu_id', 'category_id')
    )

    # Create reviews table
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('restaurant_id', sa.Integer(), nullable=False),
        sa.Column('menu_item_id', sa.Integer(), nullable=True),
        sa.Column('rating', sa.Float(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('sentiment_score', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('reviewer_id', sa.String(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, default=False),
        sa.ForeignKeyConstraint(['restaurant_id'], ['restaurants.id']),
        sa.ForeignKeyConstraint(['menu_item_id'], ['menu_items.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_review_restaurant', 'reviews', ['restaurant_id'])
    op.create_index('idx_review_rating', 'reviews', ['rating'])

    # Create restaurant_analytics table
    op.create_table(
        'restaurant_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('restaurant_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('views', sa.Integer(), nullable=False, default=0),
        sa.Column('orders', sa.Integer(), nullable=False, default=0),
        sa.Column('revenue', sa.Float(), nullable=False, default=0.0),
        sa.Column('average_order_value', sa.Float(), nullable=False, default=0.0),
        sa.Column('customer_retention_rate', sa.Float(), nullable=True),
        sa.Column('popular_items', JSON, nullable=True),
        sa.Column('peak_hours', JSON, nullable=True),
        sa.Column('performance_metrics', JSON, nullable=True),
        sa.ForeignKeyConstraint(['restaurant_id'], ['restaurants.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_analytics_restaurant', 'restaurant_analytics', ['restaurant_id'])
    op.create_index('idx_analytics_timestamp', 'restaurant_analytics', ['timestamp'])

def downgrade():
    # Drop tables
    op.drop_table('restaurant_analytics')
    op.drop_table('reviews')
    op.drop_table('menu_categories')
    op.drop_table('menu_items')
    op.drop_table('categories')
    op.drop_table('restaurants')

    # Drop ENUM types
    op.execute('DROP TYPE menu_item_status')
    op.execute('DROP TYPE price_range')
