#!/usr/bin/env python3
import click
from pathlib import Path
import sys

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from src.db.cli import cli, display_error, display_success

@click.command()
@click.option('--backup', is_flag=True, help='Create backup before reset')
@click.confirmation_option(prompt='Are you sure you want to reset the database?')
def reset_database(backup: bool):
    """Reset database to initial state"""
    try:
        if backup:
            # TODO: Implement backup functionality
            display_error("Backup functionality not yet implemented")
            return

        # 1. Drop existing database
        cli.commands['db'].commands['drop'].callback()

        # 2. Initialize fresh database
        cli.commands['db'].commands['init'].callback()

        # 3. Run migrations
        cli.commands['migrate'].commands['up'].callback()

        display_success("Database reset completed successfully!")

    except Exception as e:
        display_error(f"Reset failed: {str(e)}")
        raise click.Abort()

if __name__ == '__main__':
    reset_database()
