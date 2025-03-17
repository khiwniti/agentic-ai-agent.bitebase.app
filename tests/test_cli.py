import pytest
from pathlib import Path
from click.testing import CliRunner
from src.db.cli import cli
from src.db.models import Restaurant, MenuItem, Review
from sqlalchemy import text

def test_cli_version(cli_runner):
    """Test CLI version command"""
    result = cli_runner.invoke(cli, ['--version'])
    assert result.exit_code == 0
    assert '0.1.0' in result.output

def test_db_init(cli_runner, clean_db, mock_env):
    """Test database initialization"""
    result = cli_runner.invoke(cli, ['db', 'init'])
    assert result.exit_code == 0
    assert 'Database tables created successfully' in result.output

def test_db_drop(cli_runner, clean_db, mock_env):
    """Test database drop command"""
    # First initialize the database
    cli_runner.invoke(cli, ['db', 'init'])
    
    # Test drop with confirmation
    result = cli_runner.invoke(cli, ['db', 'drop'], input='y\n')
    assert result.exit_code == 0
    assert 'Database tables dropped successfully' in result.output

    # Test drop without confirmation
    result = cli_runner.invoke(cli, ['db', 'drop'], input='n\n')
    assert result.exit_code == 1
    assert 'Aborted!' in result.output

def test_data_ingest(cli_runner, clean_db, test_data_dir, mock_env):
    """Test data ingestion command"""
    # First initialize the database
    cli_runner.invoke(cli, ['db', 'init'])
    
    # Test ingestion
    result = cli_runner.invoke(cli, ['data', 'ingest', str(test_data_dir)])
    assert result.exit_code == 0
    assert 'Data ingestion completed successfully' in result.output

def test_status_check(cli_runner, clean_db, mock_env):
    """Test status check command"""
    # First initialize the database
    cli_runner.invoke(cli, ['db', 'init'])
    
    result = cli_runner.invoke(cli, ['status', 'check'])
    assert result.exit_code == 0
    assert 'Database Status' in result.output
    assert '✓ Connected' in result.output

def test_status_info(cli_runner, clean_db, test_data_dir, mock_env):
    """Test detailed status info command"""
    # Set up test data
    cli_runner.invoke(cli, ['db', 'init'])
    cli_runner.invoke(cli, ['data', 'ingest', str(test_data_dir)])
    
    result = cli_runner.invoke(cli, ['status', 'info'])
    assert result.exit_code == 0
    assert 'Database Information' in result.output
    assert 'restaurants' in result.output
    assert 'menu_items' in result.output

def test_migration_commands(cli_runner, clean_db, mock_env):
    """Test migration commands"""
    # Test migration up
    result = cli_runner.invoke(cli, ['migrate', 'up'])
    assert result.exit_code == 0
    assert 'Database migrations completed successfully' in result.output

    # Test migration down with confirmation
    result = cli_runner.invoke(cli, ['migrate', 'down'], input='y\n')
    assert result.exit_code == 0
    assert 'Database rollback completed successfully' in result.output

def test_error_handling(cli_runner, mock_env):
    """Test CLI error handling"""
    # Test with invalid database URL
    result = cli_runner.invoke(cli, ['status', 'check'])
    assert result.exit_code == 1
    assert 'Error' in result.output

    # Test with non-existent data directory
    result = cli_runner.invoke(cli, ['data', 'ingest', 'nonexistent'])
    assert result.exit_code == 2
    assert 'Error' in result.output

def test_full_workflow(cli_runner, clean_db, test_data_dir, mock_env):
    """Test complete workflow from initialization to data analysis"""
    # Initialize database
    result = cli_runner.invoke(cli, ['db', 'init'])
    assert result.exit_code == 0
    
    # Run migrations
    result = cli_runner.invoke(cli, ['migrate', 'up'])
    assert result.exit_code == 0
    
    # Ingest data
    result = cli_runner.invoke(cli, ['data', 'ingest', str(test_data_dir)])
    assert result.exit_code == 0
    
    # Check status
    result = cli_runner.invoke(cli, ['status', 'check'])
    assert result.exit_code == 0
    assert 'restaurants' in result.output
    
    # Get detailed info
    result = cli_runner.invoke(cli, ['status', 'info'])
    assert result.exit_code == 0
    assert 'Database Information' in result.output

@pytest.mark.parametrize("command,expected_output", [
    (['--help'], 'BiteBase Database Management CLI'),
    (['db', '--help'], 'Database management commands'),
    (['data', '--help'], 'Data management commands'),
    (['migrate', '--help'], 'Database migration commands'),
    (['status', '--help'], 'System status commands'),
])
def test_help_messages(cli_runner, command, expected_output):
    """Test help messages for all commands"""
    result = cli_runner.invoke(cli, command)
    assert result.exit_code == 0
    assert expected_output in result.output

def test_data_validation(cli_runner, clean_db, test_data_dir, mock_env):
    """Test data validation during ingestion"""
    # Initialize database
    cli_runner.invoke(cli, ['db', 'init'])
    
    # Create invalid test data
    invalid_data = Path(test_data_dir) / 'invalid.json'
    with open(invalid_data, 'w') as f:
        f.write('{"name": "Invalid Restaurant"}')  # Missing required fields
    
    # Test ingestion with invalid data
    result = cli_runner.invoke(cli, ['data', 'ingest', str(invalid_data)])
    assert result.exit_code != 0
    assert 'Error' in result.output

def test_concurrent_operations(cli_runner, clean_db, test_data_dir, mock_env):
    """Test handling of concurrent operations"""
    # Initialize database
    cli_runner.invoke(cli, ['db', 'init'])
    
    # Simulate concurrent operations
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [
            executor.submit(lambda: cli_runner.invoke(cli, ['data', 'ingest', str(test_data_dir)])),
            executor.submit(lambda: cli_runner.invoke(cli, ['status', 'check'])),
            executor.submit(lambda: cli_runner.invoke(cli, ['status', 'info']))
        ]
        
        results = [f.result() for f in futures]
        
    # Check that all operations completed without errors
    assert all(r.exit_code == 0 for r in results)
