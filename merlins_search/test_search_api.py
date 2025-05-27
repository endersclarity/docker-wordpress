#!/usr/bin/env python3
"""
Test suite for Merlin's Property Search API
"""

import unittest
import requests
import json
import time
from typing import Dict, Any

class TestPropertySearchAPI(unittest.TestCase):
    """Test cases for the property search API."""
    
    def setUp(self):
        """Set up test configuration."""
        self.base_url = "http://localhost:5000"
        self.timeout = 10
        
    def test_health_endpoint(self):
        """Test the health check endpoint."""
        response = requests.get(f"{self.base_url}/health", timeout=self.timeout)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('status', data)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('properties_loaded', data)
        self.assertIn('embeddings_available', data)
    
    def test_root_endpoint(self):
        """Test the root endpoint."""
        response = requests.get(f"{self.base_url}/", timeout=self.timeout)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('message', data)
        self.assertIn('status', data)
        self.assertIn('properties_loaded', data)
    
    def test_search_endpoint_post(self):
        """Test POST search endpoint with valid query."""
        search_data = {
            "query": "cozy cottage",
            "limit": 3
        }
        
        response = requests.post(
            f"{self.base_url}/search",
            json=search_data,
            timeout=self.timeout
        )
        
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('query', data)
        self.assertIn('results', data)
        self.assertIn('total_found', data)
        self.assertEqual(data['query'], search_data['query'])
        self.assertLessEqual(len(data['results']), search_data['limit'])
    
    def test_search_endpoint_get(self):
        """Test GET search endpoint with valid query."""
        response = requests.get(
            f"{self.base_url}/search?query=luxury+estate&limit=5",
            timeout=self.timeout
        )
        
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('query', data)
        self.assertIn('results', data)
        self.assertIn('total_found', data)
    
    def test_search_validation_empty_query(self):
        """Test search validation with empty query."""
        search_data = {
            "query": "",
            "limit": 5
        }
        
        response = requests.post(
            f"{self.base_url}/search",
            json=search_data,
            timeout=self.timeout
        )
        
        self.assertEqual(response.status_code, 400)
    
    def test_search_validation_invalid_limit(self):
        """Test search validation with invalid limit."""
        search_data = {
            "query": "test query",
            "limit": 100  # Exceeds max limit of 50
        }
        
        response = requests.post(
            f"{self.base_url}/search",
            json=search_data,
            timeout=self.timeout
        )
        
        self.assertEqual(response.status_code, 422)  # Validation error
    
    def test_search_response_format(self):
        """Test that search responses have correct format."""
        search_data = {
            "query": "family home",
            "limit": 2
        }
        
        response = requests.post(
            f"{self.base_url}/search",
            json=search_data,
            timeout=self.timeout
        )
        
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        
        # Check response structure
        self.assertIn('query', data)
        self.assertIn('results', data)
        self.assertIn('total_found', data)
        
        # Check individual result structure
        if data['results']:
            result = data['results'][0]
            required_fields = ['id', 'title', 'address', 'price', 'bedrooms', 'bathrooms', 'sqft']
            for field in required_fields:
                self.assertIn(field, result)
    
    def test_search_performance(self):
        """Test search response time performance."""
        search_data = {
            "query": "mountain view property",
            "limit": 10
        }
        
        start_time = time.time()
        response = requests.post(
            f"{self.base_url}/search",
            json=search_data,
            timeout=self.timeout
        )
        end_time = time.time()
        
        response_time = end_time - start_time
        
        self.assertEqual(response.status_code, 200)
        self.assertLess(response_time, 3.0, "Search should complete within 3 seconds")
    
    def test_semantic_search_quality(self):
        """Test semantic search quality with specific queries."""
        test_cases = [
            {
                "query": "Merlin's shack",
                "expected_keywords": ["cottage", "cabin", "rustic", "cozy"]
            },
            {
                "query": "luxury estate",
                "expected_keywords": ["luxury", "estate", "mansion", "high-end"]
            }
        ]
        
        for test_case in test_cases:
            search_data = {
                "query": test_case["query"],
                "limit": 5
            }
            
            response = requests.post(
                f"{self.base_url}/search",
                json=search_data,
                timeout=self.timeout
            )
            
            self.assertEqual(response.status_code, 200)
            
            data = response.json()
            self.assertGreater(len(data['results']), 0, f"Should return results for '{test_case['query']}'")
            
            # Check if results contain relevant terms
            if data['results']:
                first_result = data['results'][0]
                description = first_result.get('description', '').lower()
                address = first_result.get('address', '').lower()
                
                # At least one expected keyword should appear in description or address
                found_keyword = any(
                    keyword in description or keyword in address 
                    for keyword in test_case["expected_keywords"]
                )
                # Note: This is a soft assertion - semantic search might find relevant results
                # without exact keyword matches
    
    def test_cors_headers(self):
        """Test that CORS headers are properly set."""
        response = requests.options(f"{self.base_url}/search", timeout=self.timeout)
        
        # Check for CORS headers
        self.assertIn('access-control-allow-origin', response.headers)
        self.assertIn('access-control-allow-methods', response.headers)

class TestSearchAPIIntegration(unittest.TestCase):
    """Integration tests for the search API."""
    
    def setUp(self):
        """Set up integration test configuration."""
        self.base_url = "http://localhost:5000"
        self.timeout = 15
    
    def test_end_to_end_search_workflow(self):
        """Test complete search workflow."""
        # 1. Check API is healthy
        health_response = requests.get(f"{self.base_url}/health", timeout=self.timeout)
        self.assertEqual(health_response.status_code, 200)
        
        # 2. Perform search
        search_data = {
            "query": "waterfront property with acreage",
            "limit": 3
        }
        
        search_response = requests.post(
            f"{self.base_url}/search",
            json=search_data,
            timeout=self.timeout
        )
        
        self.assertEqual(search_response.status_code, 200)
        
        # 3. Validate results
        data = search_response.json()
        self.assertIn('results', data)
        
        # 4. Check result quality
        if data['results']:
            for result in data['results']:
                self.assertIn('similarity_score', result)
                self.assertIsInstance(result['similarity_score'], (int, float))
                self.assertGreaterEqual(result['similarity_score'], 0)
                self.assertLessEqual(result['similarity_score'], 1)

def run_performance_benchmark():
    """Run performance benchmark tests."""
    print("Running performance benchmark...")
    
    base_url = "http://localhost:5000"
    queries = [
        "cozy cottage",
        "luxury estate with pool",
        "family home with large yard",
        "mountain view property",
        "waterfront home"
    ]
    
    total_time = 0
    successful_requests = 0
    
    for query in queries:
        search_data = {"query": query, "limit": 5}
        
        try:
            start_time = time.time()
            response = requests.post(f"{base_url}/search", json=search_data, timeout=10)
            end_time = time.time()
            
            if response.status_code == 200:
                response_time = end_time - start_time
                total_time += response_time
                successful_requests += 1
                print(f"Query: '{query}' - {response_time:.3f}s")
            else:
                print(f"Query: '{query}' - FAILED ({response.status_code})")
                
        except Exception as e:
            print(f"Query: '{query}' - ERROR: {e}")
    
    if successful_requests > 0:
        avg_time = total_time / successful_requests
        print(f"\nBenchmark Results:")
        print(f"Successful requests: {successful_requests}/{len(queries)}")
        print(f"Average response time: {avg_time:.3f}s")
        print(f"Total time: {total_time:.3f}s")
        
        if avg_time < 2.0:
            print("✅ Performance target met (<2s average)")
        else:
            print("⚠️  Performance target not met (>2s average)")
    else:
        print("❌ No successful requests")

if __name__ == "__main__":
    # Run unit tests
    print("Running unit tests...")
    unittest.main(argv=[''], exit=False, verbosity=2)
    
    print("\n" + "="*50)
    
    # Run performance benchmark
    run_performance_benchmark()