#!/usr/bin/env python3
import click
import subprocess
import json
import gzip
import shutil
import tempfile
from datetime import datetime
from pathlib import Path
import sys
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from src.db.config import DATABASE_URL
from src.db.cli import cli as db_cli, display_error, display_success

console = Console()

def extract_backup(backup_file: Path, temp_dir: Path) -> bool:
    """Extract compressed backup files"""
    try:
        with gzip.open(backup_file, 'rb') as archive:
            # Extract schema file
            schema_file = temp_dir / "schema.sql"
            with open(schema_file, 'wb') as f:
                shutil.copyfileobj(archive, f)
            
            # Extract data file
            data_file = temp_dir / "data.sql"
            with open(data_file, 'wb') as f:
                shutil.copyfileobj(archive, f)
                
        return True
    except Exception as e:
        display_error(f"Extraction failed: {e}")
        return False

def restore_schema(schema_file: Path) -> bool:
    """Restore database schema"""
    try:
        cmd = [
            "psql",
            "--dbname", DATABASE_URL,
            "--file", str(schema_file),
            "--no-owner",
            "--single-transaction"
        ]
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        display_error(f"Schema restoration failed: {e}")
        return False

def restore_data(data_file: Path) -> bool:
    """Restore database data"""
    try:
        cmd = [
            "psql",
            "--dbname", DATABASE_URL,
            "--file", str(data_file),
            "--no-owner",
            "--single-transaction"
        ]
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        display_error(f"Data restoration failed: {e}")
        return False

def verify_backup(backup_file: Path) -> dict:
    """Verify backup file and load metadata"""
    try:
        metadata_file = backup_file.parent / f"{backup_file.stem}_metadata.json"
        if not metadata_file.exists():
            raise ValueError("Backup metadata file not found")

        with open(metadata_file, 'r') as f:
            metadata = json.load(f)

        # Verify backup structure
        if not all(key in metadata for key in ['timestamp', 'settings', 'backup_files']):
            raise ValueError("Invalid backup metadata format")

        return metadata
    except Exception as e:
        raise ValueError(f"Backup verification failed: {e}")

@click.command()
@click.argument('backup_file', type=click.Path(exists=True))
@click.option('--force', is_flag=True, help='Force restore without confirmation')
@click.option('--skip-schema', is_flag=True, help='Skip schema restoration')
@click.option('--verify-only', is_flag=True, help='Only verify backup without restoring')
def restore_database(backup_file: str, force: bool, skip_schema: bool, verify_only: bool):
    """Restore database from backup"""
    try:
        backup_path = Path(backup_file)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            # Verify backup
            task = progress.add_task("Verifying backup...", total=None)
            metadata = verify_backup(backup_path)
            progress.update(task, completed=True)

            if verify_only:
                display_success("Backup verification completed!")
                console.print("\n[yellow]Backup Information:[/yellow]")
                console.print(f"Timestamp: {metadata['timestamp']}")
                console.print(f"Settings: {json.dumps(metadata['settings'], indent=2)}")
                return

            # Confirm restore
            if not force:
                click.confirm(
                    'This will overwrite the current database. Are you sure?',
                    abort=True
                )

            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)

                # Extract backup
                task = progress.add_task("Extracting backup...", total=None)
                if not extract_backup(backup_path, temp_path):
                    return
                progress.update(task, completed=True)

                # Drop existing database
                task = progress.add_task("Dropping existing database...", total=None)
                db_cli.commands['db'].commands['drop'].callback()
                progress.update(task, completed=True)

                if not skip_schema:
                    # Restore schema
                    task = progress.add_task("Restoring schema...", total=None)
                    if not restore_schema(temp_path / "schema.sql"):
                        return
                    progress.update(task, completed=True)

                # Restore data
                task = progress.add_task("Restoring data...", total=None)
                if not restore_data(temp_path / "data.sql"):
                    return
                progress.update(task, completed=True)

                # Verify restoration
                task = progress.add_task("Verifying restoration...", total=None)
                db_cli.commands['status'].commands['check'].callback()
                progress.update(task, completed=True)

        display_success("\nDatabase restoration completed successfully!")
        
        # Show restore information
        console.print("\n[yellow]Restore Information:[/yellow]")
        console.print(f"Restored from: {backup_path}")
        console.print(f"Backup timestamp: {metadata['timestamp']}")
        console.print("\nNext steps:")
        console.print("1. Verify data integrity:")
        console.print("   bitebase status info")
        console.print("2. Run application tests")
        console.print("3. Monitor system performance")

    except Exception as e:
        display_error(f"Restoration failed: {str(e)}")
        raise click.Abort()

@click.group()
def cli():
    """Database restore management commands"""
    pass

cli.add_command(restore_database)

if __name__ == '__main__':
    cli()
