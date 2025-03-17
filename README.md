# BiteBase Database System

This system manages restaurant data and provides AI-driven insights through a comprehensive database schema and API layer.

## Getting Started

### Prerequisites

- Python 3.9 or higher
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bitebase.git
cd bitebase
```

2. Create a virtual environment and activate it:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install sqlalchemy alembic psycopg2-binary python-dotenv click
```

### Running with Docker

1. Build the Docker image:
```bash
docker build -t agentic-ai .
```

2. Run the Docker container:
```bash
docker run -it agentic-ai
```

The Dockerfile includes:
- Python 3.13 slim base image
- All required dependencies
- Application code and configuration
- Entry point to run the orchestration

Benefits of using Docker:
- Consistent environment across different machines
- Easy deployment
- Isolated runtime
- Simple scaling

### Environment Configuration

Create a `.env` file in the project root:
```bash
DATABASE_URL="postgresql://bitebase_admin:npg_U1lvFbx4egOr@ep-broad-lake-a5n1vqt1-pooler.us-east-2.aws.neon.tech/bitebasedb?sslmode=require"
```

## Database Setup

### Initial Setup

1. Initialize the database:
```bash
python -m src.db.cli init_db
```

2. Run migrations:
```bash
python -m src.db.cli migrate
```

3. Ingest LMWN data:
```bash
python -m src.db.cli ingest_data LMWN/
```

### Schema Structure

#### Core Tables

1. **restaurants**
   - Basic information (name, description)
   - Location data (address, coordinates)
   - Operating hours
   - Ratings and pricing
   - Contact information
   - Features and amenities

2. **menu_items**
   - Name and description
   - Pricing information
   - Categories
   - Nutritional information
   - Status flags (spicy, vegetarian, etc.)

3. **categories**
   - Category name
   - Description
   - Parent category (if applicable)

4. **reviews**
   - Customer ratings
   - Written feedback
   - Sentiment analysis
   - Source tracking
   - Verification status

5. **restaurant_analytics**
   - Performance metrics
   - Traffic patterns
   - Revenue data
   - Customer behavior
   - Peak hours analysis

## CLI Commands

### Database Management
```bash
# Check database connection
python -m src.db.cli check_connection

# Show database tables and structure
python -m src.db.cli show_tables

# Analyze current data
python -m src.db.cli analyze_data

# Drop all tables (use with caution)
python -m src.db.cli drop_db
```

### Migration Commands
```bash
# Run migrations
python -m src.db.cli migrate

# Rollback to specific version
python -m src.db.cli rollback <version>
```

## Data Ingestion Process

The system ingests data through a robust pipeline:

1. **Data Validation**
   - Schema validation
   - Data type checking
   - Required field verification
   - Format consistency

2. **Processing Steps**
   - Restaurant information parsing
   - Menu item creation
   - Category mapping
   - Review processing
   - Analytics generation

3. **Error Handling**
   - Transaction management
   - Duplicate detection
   - Error logging
   - Recovery mechanisms

4. **Data Relationships**
   - Menu item to category mapping
   - Review to restaurant linking
   - Analytics association

## API Integration

The database system integrates with several components:

1. **Web Scraping System**
   - Data collection scheduling
   - Source management
   - Data transformation
   - Quality validation

2. **Analytics Engine**
   - Performance metrics
   - Trend analysis
   - Predictive modeling
   - Report generation

3. **Insights Generation**
   - Pattern recognition
   - Anomaly detection
   - Recommendation engine
   - Market analysis

4. **Restaurant Management**
   - Menu updates
   - Price optimization
   - Performance tracking
   - Customer feedback

## Development

### Adding New Migrations

1. Create a new migration:
```bash
alembic revision -m "description"
```

2. Auto-generate from models:
```bash
alembic revision --autogenerate -m "description"
```

3. Apply migrations:
```bash
alembic upgrade head
```

### Testing

```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=src
```

## Monitoring

### System Metrics

1. **Performance**
   - Query response times
   - Resource utilization
   - Connection pool stats
   - Cache hit rates

2. **Data Quality**
   - Completeness checks
   - Consistency validation
   - Accuracy metrics
   - Freshness monitoring

3. **Error Tracking**
   - Exception logging
   - Stack traces
   - Error rates
   - Recovery success

## Security

### Implementation

1. **Connection Security**
   - SSL/TLS encryption
   - Certificate validation
   - Secure connection pooling
   - Connection timeouts

2. **Authentication**
   - Role-based access
   - Password policies
   - Session management
   - API key security

3. **Data Protection**
   - Encryption at rest
   - Backup encryption
   - Secure deletion
   - Access logging

## Troubleshooting

### Common Issues

1. **Connection Problems**
   - Network connectivity
   - Credential verification
   - SSL configuration
   - Connection pool settings

2. **Migration Errors**
   - Schema conflicts
   - Data type mismatches
   - Foreign key constraints
   - Transaction rollbacks

3. **Ingestion Failures**
   - Data validation errors
   - Resource constraints
   - Timeout issues
   - Dependency problems

### Resolution Steps

1. Check logs for detailed error messages
2. Verify environment configuration
3. Validate data source integrity
4. Review system resources
5. Test in isolation if needed

## Future Improvements

1. **Automation**
   - Scheduled backups
   - Auto-scaling
   - Automated testing
   - Deployment pipelines

2. **Performance**
   - Query optimization
   - Index tuning
   - Cache implementation
   - Connection pooling

3. **Features**
   - Real-time analytics
   - Advanced reporting
   - API enhancements
   - Mobile integration

4. **Infrastructure**
   - High availability
   - Disaster recovery
   - Geographic distribution
   - Load balancing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
