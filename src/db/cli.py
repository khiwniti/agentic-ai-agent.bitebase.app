import click
import logging
from pathlib import Path
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text
from rich.console import Console
from rich.table import Table
from rich.progress import track
from .config import DATABASE_URL, Base, engine
from .ingest import LMWNDataIngester

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
console = Console()

def display_error(message: str):
    """Display error message in red"""
    console.print(f"[red]Error: {message}[/red]")

def display_success(message: str):
    """Display success message in green"""
    console.print(f"[green]{message}[/green]")

@click.group()
@click.version_option(version='0.1.0')
def cli():
    """BiteBase Database Management CLI

    This CLI tool provides commands for managing the BiteBase database,
    including initialization, data ingestion, and maintenance tasks.
    """
    pass

@cli.group()
def db():
    """Database management commands"""
    pass

@db.command(name='init')
def init_db():
    """Initialize the database with all tables"""
    try:
        with console.status("[bold blue]Creating database tables..."):
            Base.metadata.create_all(bind=engine)
        display_success("Database tables created successfully")
    except Exception as e:
        display_error(f"Failed to create database tables: {e}")
        raise click.Abort()

@db.command(name='drop')
@click.confirmation_option(prompt='Are you sure you want to drop all tables?')
def drop_db():
    """Drop all database tables (CAUTION!)"""
    try:
        with console.status("[bold red]Dropping all database tables..."):
            Base.metadata.drop_all(bind=engine)
        display_success("Database tables dropped successfully")
    except Exception as e:
        display_error(f"Failed to drop database tables: {e}")
        raise click.Abort()

@cli.group()
def data():
    """Data management commands"""
    pass

@data.command(name='ingest')
@click.argument('data_dir', type=click.Path(exists=True))
def ingest_data(data_dir):
    """Ingest data from LMWN JSON files"""
    try:
        with console.status("[bold blue]Starting data ingestion..."):
            ingester = LMWNDataIngester(data_dir)
            ingester.ingest_all()
        display_success("Data ingestion completed successfully")
    except Exception as e:
        display_error(f"Data ingestion failed: {e}")
        raise click.Abort()

@cli.group()
def migrate():
    """Database migration commands"""
    pass

@migrate.command(name='up')
def migrate_up():
    """Run pending database migrations"""
    try:
        with console.status("[bold blue]Running database migrations..."):
            alembic_cfg = Config("alembic.ini")
            command.upgrade(alembic_cfg, "head")
        display_success("Database migrations completed successfully")
    except Exception as e:
        display_error(f"Database migration failed: {e}")
        raise click.Abort()

@migrate.command(name='down')
@click.argument('revision', required=False)
@click.confirmation_option(prompt='Are you sure you want to downgrade the database?')
def migrate_down(revision):
    """Rollback database migrations"""
    try:
        with console.status("[bold yellow]Rolling back database migrations..."):
            alembic_cfg = Config("alembic.ini")
            command.downgrade(alembic_cfg, revision or '-1')
        display_success("Database rollback completed successfully")
    except Exception as e:
        display_error(f"Database rollback failed: {e}")
        raise click.Abort()

@cli.group()
def status():
    """System status commands"""
    pass

@status.command(name='check')
def check_status():
    """Check database connection and status"""
    table = Table(title="Database Status")
    table.add_column("Component", style="cyan")
    table.add_column("Status", style="green")
    table.add_column("Details", style="yellow")

    try:
        # Check connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            table.add_row("Connection", "✓ Connected", DATABASE_URL.split('@')[1])

            # Check tables
            inspector = engine.inspect()
            tables = inspector.get_table_names()
            table.add_row("Tables", f"✓ {len(tables)} tables", ", ".join(tables))

            # Get row counts
            counts = {}
            for table_name in tables:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                counts[table_name] = result.scalar()
                table.add_row("Data", f"✓ {table_name}", f"{counts[table_name]} records")

        console.print(table)
        display_success("System check completed successfully")

    except Exception as e:
        display_error(f"System check failed: {e}")
        raise click.Abort()

@status.command(name='info')
def show_info():
    """Show detailed database information"""
    try:
        with engine.connect() as conn:
            # Get database info
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()

            # Create info table
            table = Table(title="Database Information")
            table.add_column("Property", style="cyan")
            table.add_column("Value", style="yellow")

            table.add_row("Version", version)
            table.add_row("URL", DATABASE_URL.split('@')[1])

            # Get schema info
            inspector = engine.inspect()
            tables = inspector.get_table_names()
            
            for table_name in tables:
                table.add_row(
                    f"\nTable: {table_name}",
                    ""
                )
                columns = inspector.get_columns(table_name)
                for col in columns:
                    table.add_row(
                        f"  └─ {col['name']}",
                        f"{col['type']}"
                    )

            console.print(table)

    except Exception as e:
        display_error(f"Failed to fetch database information: {e}")
        raise click.Abort()

if __name__ == '__main__':
    cli()
