#!/usr/bin/env python3
import click
import logging
from pathlib import Path
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
import sys
import os

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from src.db.cli import cli, display_error, display_success

console = Console()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@click.command()
@click.option('--data-dir', default='LMWN', help='Directory containing LMWN JSON files')
@click.option('--force', is_flag=True, help='Force recreation of database')
@click.option('--skip-migrations', is_flag=True, help='Skip running migrations')
def setup_database(data_dir: str, force: bool, skip_migrations: bool):
    """Initialize database and load initial data"""
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            # Check if data directory exists
            if not Path(data_dir).exists():
                display_error(f"Data directory '{data_dir}' not found!")
                return

            # 1. Database Initialization
            task = progress.add_task("Initializing database...", total=None)
            if force:
                # Drop existing database
                result = cli.commands['db'].commands['drop'].callback()
                if not result:
                    return
            
            # Initialize database
            result = cli.commands['db'].commands['init'].callback()
            if not result:
                return
            progress.update(task, completed=True)

            # 2. Run Migrations
            if not skip_migrations:
                task = progress.add_task("Running database migrations...", total=None)
                result = cli.commands['migrate'].commands['up'].callback()
                if not result:
                    return
                progress.update(task, completed=True)

            # 3. Load Data
            task = progress.add_task("Loading initial data...", total=None)
            result = cli.commands['data'].commands['ingest'].callback(data_dir)
            if not result:
                return
            progress.update(task, completed=True)

            # 4. Verify Setup
            task = progress.add_task("Verifying setup...", total=None)
            result = cli.commands['status'].commands['check'].callback()
            if not result:
                return
            progress.update(task, completed=True)

        display_success("\nDatabase setup completed successfully!")
        
        # Show next steps
        console.print("\n[yellow]Next Steps:[/yellow]")
        console.print("1. Verify data integrity:")
        console.print("   bitebase status info")
        console.print("\n2. Check API endpoints:")
        console.print("   curl http://localhost:3000/api/restaurants")
        console.print("\n3. Monitor system:")
        console.print("   bitebase status check")

    except Exception as e:
        display_error(f"Setup failed: {str(e)}")
        raise click.Abort()

if __name__ == '__main__':
    setup_database()
