# BiteBase Quick Start Guide

## Installation

1. Clone the repository and install the package:
```bash
git clone <repository-url>
cd agentic-ai-agent.bitebase.app
pip install -e .
```

2. Set up environment variables (or use .env file):
```bash
# Database connection
DATABASE_URL="postgresql://bitebase_admin:npg_U1lvFbx4egOr@ep-broad-lake-a5n1vqt1-pooler.us-east-2.aws.neon.tech/bitebasedb?sslmode=require"
```

## Database Setup

1. Initialize the database:
```bash
bitebase db init
```

2. Run migrations:
```bash
bitebase migrate up
```

3. Ingest LMWN data:
```bash
bitebase data ingest LMWN/
```

## Available Commands

### Database Management
```bash
# Initialize database
bitebase db init

# Drop database (requires confirmation)
bitebase db drop
```

### Data Management
```bash
# Ingest data
bitebase data ingest <directory>
```

### Migration Management
```bash
# Run migrations
bitebase migrate up

# Rollback migrations
bitebase migrate down [revision]
```

### Status and Information
```bash
# Check system status
bitebase status check

# Show detailed info
bitebase status info
```

## Common Tasks

### Adding New Data
```bash
# Ensure database is up to date
bitebase migrate up

# Ingest new data
bitebase data ingest path/to/new/data
```

### Checking Data Status
```bash
# View database status
bitebase status check

# View detailed information
bitebase status info
```

### Troubleshooting

1. Connection Issues:
```bash
# Check connection status
bitebase status check
```

2. Migration Issues:
```bash
# Rollback to previous version
bitebase migrate down
# Then try migrating up again
bitebase migrate up
```

3. Data Issues:
```bash
# Check data integrity
bitebase status info
```

## Getting Help

For any command, you can use the `--help` flag to see detailed usage information:
```bash
bitebase --help
bitebase <command> --help
bitebase <command> <subcommand> --help
```

## Next Steps

1. Explore the API endpoints
2. Review the data models
3. Check the analytics features
4. Set up monitoring

For more detailed information, refer to the full documentation in README.md.
