#!/usr/bin/env python3
import click
import subprocess
import json
from datetime import datetime
from pathlib import Path
import sys
import gzip
import shutil
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from src.db.config import DATABASE_URL
from src.db.cli import display_error, display_success

console = Console()

def create_backup_filename() -> str:
    """Create a backup filename with timestamp"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"bitebase_backup_{timestamp}"

def backup_schema(backup_dir: Path, filename: str) -> bool:
    """Backup database schema"""
    try:
        schema_file = backup_dir / f"{filename}_schema.sql"
        cmd = [
            "pg_dump",
            "--dbname", DATABASE_URL,
            "--schema-only",
            "--no-owner",
            "--file", str(schema_file)
        ]
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        display_error(f"Schema backup failed: {e}")
        return False

def backup_data(backup_dir: Path, filename: str) -> bool:
    """Backup database data"""
    try:
        data_file = backup_dir / f"{filename}_data.sql"
        cmd = [
            "pg_dump",
            "--dbname", DATABASE_URL,
            "--data-only",
            "--no-owner",
            "--file", str(data_file)
        ]
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        display_error(f"Data backup failed: {e}")
        return False

def compress_backup(backup_dir: Path, filename: str) -> bool:
    """Compress backup files"""
    try:
        files_to_compress = [
            backup_dir / f"{filename}_schema.sql",
            backup_dir / f"{filename}_data.sql"
        ]
        
        archive_path = backup_dir / f"{filename}.tar.gz"
        with gzip.open(archive_path, 'wb') as archive:
            for file in files_to_compress:
                with open(file, 'rb') as f:
                    shutil.copyfileobj(f, archive)
                file.unlink()  # Remove original file
        return True
    except Exception as e:
        display_error(f"Compression failed: {e}")
        return False

def create_metadata(backup_dir: Path, filename: str, settings: dict) -> bool:
    """Create backup metadata file"""
    try:
        metadata = {
            "timestamp": datetime.now().isoformat(),
            "filename": filename,
            "settings": settings,
            "database_url": DATABASE_URL.split('@')[1],  # Don't include credentials
            "backup_files": [
                f"{filename}.tar.gz"
            ]
        }
        
        metadata_file = backup_dir / f"{filename}_metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        return True
    except Exception as e:
        display_error(f"Metadata creation failed: {e}")
        return False

@click.command()
@click.option('--backup-dir', type=click.Path(), default='backups',
              help='Directory to store backups')
@click.option('--compress/--no-compress', default=True,
              help='Compress backup files')
def backup_database(backup_dir: str, compress: bool):
    """Create a backup of the database"""
    try:
        backup_path = Path(backup_dir)
        backup_path.mkdir(parents=True, exist_ok=True)
        
        settings = {
            "compress": compress,
            "include_schema": True,
            "include_data": True
        }

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            # Generate backup filename
            backup_name = create_backup_filename()
            
            # Backup schema
            task = progress.add_task("Backing up schema...", total=None)
            if not backup_schema(backup_path, backup_name):
                return
            progress.update(task, completed=True)

            # Backup data
            task = progress.add_task("Backing up data...", total=None)
            if not backup_data(backup_path, backup_name):
                return
            progress.update(task, completed=True)

            # Compress if requested
            if compress:
                task = progress.add_task("Compressing backup...", total=None)
                if not compress_backup(backup_path, backup_name):
                    return
                progress.update(task, completed=True)

            # Create metadata
            task = progress.add_task("Creating metadata...", total=None)
            if not create_metadata(backup_path, backup_name, settings):
                return
            progress.update(task, completed=True)

        display_success(f"\nBackup completed successfully!")
        console.print(f"\nBackup files created in: {backup_path}")
        console.print(f"Backup name: {backup_name}")

    except Exception as e:
        display_error(f"Backup failed: {str(e)}")
        raise click.Abort()

@click.group()
def cli():
    """Database backup management commands"""
    pass

cli.add_command(backup_database)

if __name__ == '__main__':
    cli()
