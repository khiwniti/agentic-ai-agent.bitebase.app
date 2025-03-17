import pytest
import requests
import time
import os
import subprocess
import signal
import sys
import atexit
import json
from datetime import datetime, timedelta

# Configuration
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000/api")
TEST_AUTH_TOKEN = os.environ.get("TEST_AUTH_TOKEN", "test-token")
TEST_PROJECT_ID = os.environ.get("TEST_PROJECT_ID", "test-project-1")
UVICORN_SERVER_PATH = os.path.join(os.path.dirname(__file__), "fastapi-test-server.py")

# Server process
server_process = None

def start_uvicorn():
    """Start the Uvicorn server for testing"""
    global server_process
    
    # Check if server is already running
    try:
        response = requests.get(f"{API_BASE_URL.split('/api')[0]}/docs")
        if response.status_code == 200:
            print("Server is already running")
            return
    except requests.ConnectionError:
        pass
    
    print("Starting Uvicorn server...")
    server_process = subprocess.Popen(
        [sys.executable, UVICORN_SERVER_PATH],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP # This is for Windows
    )

    # Give the server time to start
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{API_BASE_URL.split('/api')[0]}/docs")
            if response.status_code == 200:
                print(f"Server started after {attempt + 1} attempts")
                break
        except requests.ConnectionError:
            if attempt == max_attempts - 1:
                print("Failed to start server")
                raise  # Re-raise the exception to signal failure
            time.sleep(1)  # Wait before trying again

def stop_uvicorn():
    """Stop the Uvicorn server"""
    global server_process
    if server_process:
        print("Stopping Uvicorn server...")
        server_process.terminate()
        server_process.wait()
        server_process = None

# Register cleanup function
atexit.register(stop_uvicorn)

# Fixture to ensure server is running for tests
@pytest.fixture(scope="session", autouse=True)
def setup_server():
    start_uvicorn()
    yield
    stop_uvicorn()

# Helper for API requests
def api_request(method, path, data=None, params=None):
    url = f"{API_BASE_URL}{path}"
    headers = {"Authorization": f"Bearer {TEST_AUTH_TOKEN}"}
    
    if method.lower() == "get":
        return requests.get(url, headers=headers, params=params)
    elif method.lower() == "post":
        return requests.post(url, headers=headers, json=data)
    elif method.lower() == "put":
        return requests.put(url, headers=headers, json=data)
    elif method.lower() == "delete":
        return requests.delete(url, headers=headers)
    else:
        raise ValueError(f"Unsupported method: {method}")

class TestAuthentication:
    def test_validate_token(self):
        response = api_request("post", "/auth/validate")
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True

class TestProjects:
    def test_list_projects(self):
        response = api_request("get", "/projects")
        assert response.status_code == 200
        projects = response.json()
        assert isinstance(projects, list)
        
        if projects:
            project = projects[0]
            assert "id" in project
            assert "name" in project
            assert "coordinates" in project

    def test_create_project(self):
        # Create a unique project name with timestamp
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        project_data = {
            "name": f"Test Project {timestamp}",
            "description": "Project created during Python tests",
            "location": "Test Location",
            "address": "123 Test Street",
            "cuisine": "Test Cuisine",
            "coordinates": {"lat": 40.123, "lng": -74.456},
            "radius": 1.5
        }
        
        response = api_request("post", "/projects", data=project_data)
        assert response.status_code == 201
        
        new_project = response.json()
        assert "id" in new_project
        assert new_project["name"] == project_data["name"]
        assert new_project["cuisine"] == project_data["cuisine"]
        
        # Store project ID for other tests
        project_id = new_project["id"]
    
    def test_get_project_by_id(self):
        response = api_request("get", f"/projects/{TEST_PROJECT_ID}")
        assert response.status_code == 200
        
        project = response.json()
        assert project["id"] == TEST_PROJECT_ID
        assert "name" in project
        assert "cuisine" in project

class TestCompetitors:
    def test_list_competitors(self):
        response = api_request("get", "/inventory", params={"projectId": TEST_PROJECT_ID})
        assert response.status_code == 200
        
        competitors = response.json()
        assert isinstance(competitors, list)
    
    def test_create_competitor(self):
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        competitor_data = {
            "name": f"Competitor {timestamp}",
            "description": "Test competitor",
            "cuisine": "Test Cuisine",
            "address": "456 Competitor St",
            "coordinates": {"lat": 40.123, "lng": -74.456},
            "rating": 4.5,
            "priceRange": 2,
            "projectId": TEST_PROJECT_ID
        }
        
        response = api_request("post", "/inventory", data=competitor_data)
        assert response.status_code == 201
        
        new_competitor = response.json()
        assert "id" in new_competitor
        assert new_competitor["name"] == competitor_data["name"]
        assert new_competitor["projectId"] == TEST_PROJECT_ID

class TestDemographics:
    def test_get_demographics(self):
        response = api_request("get", "/analytics/demographics", 
                              params={"projectId": TEST_PROJECT_ID})
        assert response.status_code == 200
        
        demographics = response.json()
        assert demographics["projectId"] == TEST_PROJECT_ID
        assert "populationDensity" in demographics
        assert "medianIncome" in demographics
        assert "ageDistribution" in demographics
        assert "under18" in demographics["ageDistribution"]
        assert "educationLevels" in demographics
        assert "highSchool" in demographics["educationLevels"]

class TestTraffic:
    def test_get_traffic(self):
        response = api_request("get", "/analytics/traffic", 
                              params={"projectId": TEST_PROJECT_ID})
        assert response.status_code == 200
        
        traffic = response.json()
        assert traffic["projectId"] == TEST_PROJECT_ID
        assert "weekdayAverage" in traffic
        assert "weekendAverage" in traffic
        assert "peakHours" in traffic
        assert "morning" in traffic["peakHours"]
        assert "seasonalVariation" in traffic
        assert "summer" in traffic["seasonalVariation"]

class TestMenuItems:
    def test_list_menu_items(self):
        response = api_request("get", "/analytics/menu-items", 
                              params={"projectId": TEST_PROJECT_ID})
        assert response.status_code == 200
        
        menu_items = response.json()
        assert isinstance(menu_items, list)
        
        if menu_items:
            menu_item = menu_items[0]
            assert "id" in menu_item
            assert "name" in menu_item
            assert "price" in menu_item
            assert "cost" in menu_item
            assert "projectId" in menu_item
    
    def test_create_menu_item(self):
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        menu_item_data = {
            "name": f"Menu Item {timestamp}",
            "description": "Test menu item",
            "category": "Appetizer",
            "price": 9.99,
            "cost": 3.50,
            "popularity": 75,
            "projectId": TEST_PROJECT_ID
        }
        
        response = api_request("post", "/analytics/menu-items", data=menu_item_data)
        assert response.status_code == 201
        
        new_menu_item = response.json()
        assert "id" in new_menu_item
        assert new_menu_item["name"] == menu_item_data["name"]
        assert new_menu_item["price"] == menu_item_data["price"]
        assert new_menu_item["projectId"] == menu_item_data["projectId"]

class TestInsights:
    def test_list_insights(self):
        response = api_request("get", "/insights", 
                              params={"projectId": TEST_PROJECT_ID})
        assert response.status_code == 200
        
        insights = response.json()
        assert isinstance(insights, list)
        
        if insights:
            insight = insights[0]
            assert "id" in insight
            assert "title" in insight
            assert "category" in insight
            assert "impact" in insight
            assert "projectId" in insight
    
    def test_create_insight(self):
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        insight_data = {
            "title": f"Insight {timestamp}",
            "description": "Test insight",
            "category": "price",
            "impact": "medium",
            "actionable": True,
            "projectId": TEST_PROJECT_ID
        }
        
        response = api_request("post", "/insights", data=insight_data)
        assert response.status_code == 201
        
        new_insight = response.json()
        assert "id" in new_insight
        assert new_insight["title"] == insight_data["title"]
        assert new_insight["category"] == insight_data["category"]
        assert new_insight["projectId"] == insight_data["projectId"]

class TestErrorHandling:
    def test_unauthorized_access(self):
        # Make request without auth token
        url = f"{API_BASE_URL}/projects"
        response = requests.get(url)
        assert response.status_code == 401
    
    def test_project_not_found(self):
        non_existent_id = f"non-existent-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        response = api_request("get", f"/projects/{non_existent_id}")
        assert response.status_code == 404
    
    def test_invalid_project_data(self):
        # Missing required fields
        invalid_project = {"description": "Invalid project"}
        response = api_request("post", "/projects/error-test", data=invalid_project)
        assert response.status_code == 400

class TestPerformance:
    def test_project_response_time(self):
        start_time = time.time()
        response = api_request("get", f"/projects/{TEST_PROJECT_ID}")
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        assert response.status_code == 200
        assert response_time < 1000  # Response should be under 1 second
    
    def test_dashboard_response_time(self):
        start_time = time.time()
        
        # Make parallel requests for all dashboard data using a session
        session = requests.Session()
        session.headers.update({"Authorization": f"Bearer {TEST_AUTH_TOKEN}"})
        
        def get_url(path, params=None):
            return session.get(f"{API_BASE_URL}{path}", params=params)
        
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            futures = [
                executor.submit(get_url, f"/projects/{TEST_PROJECT_ID}"),
                executor.submit(get_url, "/inventory", {"projectId": TEST_PROJECT_ID}),
                executor.submit(get_url, "/insights", {"projectId": TEST_PROJECT_ID}),
                executor.submit(get_url, "/analytics/demographics", {"projectId": TEST_PROJECT_ID}),
                executor.submit(get_url, "/analytics/traffic", {"projectId": TEST_PROJECT_ID}),
                executor.submit(get_url, "/analytics/menu-items", {"projectId": TEST_PROJECT_ID})
            ]
            
            # Wait for all futures to complete
            responses = [future.result() for future in futures]
        
        end_time = time.time()
        total_response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        # Check all responses were successful
        for response in responses:
            assert response.status_code == 200
        
        # Total time should be reasonable
        assert total_response_time < 3000  # Should be under 3 seconds

#if __name__ == "__main__":
#    start_uvicorn()
#    pytest.main(["-xvs", __file__])
#    stop_uvicorn()
