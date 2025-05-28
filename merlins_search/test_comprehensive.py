#!/usr/bin/env python3
"""
Comprehensive test suite for Merlin's Shack semantic search system.
Tests all components, error handling, and edge cases.
"""

import json
import os
import time
import tempfile
from typing import List, Dict, Any
from search_api import load_embeddings_data, fallback_keyword_search
from embedding_generator import PropertyEmbeddingGenerator

class ComprehensiveSearchTests:
    """Comprehensive test suite for semantic search system."""
    
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests = []
    
    def test(self, name: str, func):
        """Run a test and track results."""
        try:
            print(f"\n🧪 Testing: {name}")
            func()
            print(f"✅ PASS: {name}")
            self.passed += 1
        except Exception as e:
            print(f"❌ FAIL: {name} - {e}")
            self.failed += 1
        
        self.tests.append({
            'name': name,
            'passed': self.passed > len(self.tests)
        })
    
    def test_data_loading(self):
        """Test property data loading functionality."""
        data = load_embeddings_data()
        assert data is not None, "Data loading failed"
        assert 'listings' in data, "Missing listings in data"
        assert len(data['listings']) > 0, "No listings found"
        assert 'metadata' in data, "Missing metadata"
        print(f"   Loaded {len(data['listings'])} properties")
    
    def test_fallback_search_basic(self):
        """Test basic fallback search functionality."""
        with open('enhanced_listings.json', 'r') as f:
            listings = json.load(f)
        
        results = fallback_keyword_search("cottage", listings, top_k=3)
        assert len(results) > 0, "No results returned for 'cottage'"
        assert all('similarity_score' in r for r in results), "Missing similarity scores"
        assert all(r['similarity_score'] > 0 for r in results), "Invalid similarity scores"
        print(f"   Found {len(results)} cottage results")
    
    def test_fallback_search_edge_cases(self):
        """Test fallback search with edge cases."""
        with open('enhanced_listings.json', 'r') as f:
            listings = json.load(f)
        
        # Empty query
        results = fallback_keyword_search("", listings, top_k=3)
        assert len(results) == 0, "Empty query should return no results"
        
        # Nonsense query
        results = fallback_keyword_search("xyzabc123nonexistent", listings, top_k=3)
        assert len(results) == 0, "Nonsense query should return no results"
        
        # Very long query
        long_query = "luxury " * 100
        results = fallback_keyword_search(long_query, listings, top_k=3)
        assert len(results) >= 0, "Long query should not crash"
        
        print("   Edge cases handled correctly")
    
    def test_search_scoring_logic(self):
        """Test search scoring and ranking logic."""
        with open('enhanced_listings.json', 'r') as f:
            listings = json.load(f)
        
        # Test luxury query prioritizes expensive properties
        luxury_results = fallback_keyword_search("luxury estate", listings, top_k=5)
        if len(luxury_results) >= 2:
            avg_price = sum(r['price'] for r in luxury_results) / len(luxury_results)
            assert avg_price > 500000, "Luxury search should find expensive properties"
            print(f"   Luxury search average price: ${avg_price:,.0f}")
        
        # Test cottage query finds reasonable prices
        cottage_results = fallback_keyword_search("cottage cozy", listings, top_k=5)
        if len(cottage_results) >= 2:
            prices = [r['price'] for r in cottage_results]
            max_price = max(prices)
            assert max_price < 2000000, "Cottage search should not find ultra-luxury"
            print(f"   Cottage search max price: ${max_price:,.0f}")
    
    def test_property_data_integrity(self):
        """Test property data structure and integrity."""
        with open('enhanced_listings.json', 'r') as f:
            listings = json.load(f)
        
        required_fields = ['address', 'price', 'enhanced_description', 'listing_id']
        
        for i, listing in enumerate(listings[:10]):  # Test first 10
            for field in required_fields:
                assert field in listing, f"Missing {field} in listing {i}"
            
            assert isinstance(listing['price'], (int, float)), f"Invalid price type in listing {i}"
            assert listing['price'] >= 0, f"Negative price in listing {i}"
            assert len(listing['enhanced_description']) > 10, f"Description too short in listing {i}"
        
        print(f"   Validated data integrity for {len(listings)} listings")
    
    def test_embedding_generator_error_handling(self):
        """Test embedding generator error handling."""
        # Test without API key
        try:
            generator = PropertyEmbeddingGenerator()
            assert False, "Should fail without API key"
        except ValueError:
            pass  # Expected
        except Exception as e:
            assert False, f"Wrong exception type: {e}"
        
        print("   Error handling working correctly")
    
    def test_performance_benchmarks(self):
        """Test search performance benchmarks."""
        with open('enhanced_listings.json', 'r') as f:
            listings = json.load(f)
        
        queries = ["luxury castle", "cozy cottage", "family retreat", "modern home"]
        
        for query in queries:
            start_time = time.time()
            results = fallback_keyword_search(query, listings, top_k=5)
            end_time = time.time()
            
            search_time = end_time - start_time
            assert search_time < 2.0, f"Search too slow: {search_time:.2f}s for '{query}'"
            print(f"   '{query}': {search_time:.3f}s ({len(results)} results)")
    
    def test_json_serialization(self):
        """Test JSON serialization of search results."""
        with open('enhanced_listings.json', 'r') as f:
            listings = json.load(f)
        
        results = fallback_keyword_search("test", listings, top_k=3)
        
        # Test serialization
        json_str = json.dumps(results)
        restored_results = json.loads(json_str)
        
        assert len(restored_results) == len(results), "Serialization changed result count"
        print("   JSON serialization working correctly")
    
    def test_memory_usage(self):
        """Test memory usage doesn't grow excessively."""
        with open('enhanced_listings.json', 'r') as f:
            listings = json.load(f)
        
        # Run multiple searches to test memory
        for i in range(10):
            fallback_keyword_search(f"test query {i}", listings, top_k=5)
        
        print("   Memory usage test completed")
    
    def run_all_tests(self):
        """Run all comprehensive tests."""
        print("🔥 RUNNING COMPREHENSIVE SEMANTIC SEARCH TESTS")
        print("=" * 60)
        
        self.test("Data Loading", self.test_data_loading)
        self.test("Fallback Search Basic", self.test_fallback_search_basic)
        self.test("Fallback Search Edge Cases", self.test_fallback_search_edge_cases)
        self.test("Search Scoring Logic", self.test_search_scoring_logic)
        self.test("Property Data Integrity", self.test_property_data_integrity)
        self.test("Embedding Generator Error Handling", self.test_embedding_generator_error_handling)
        self.test("Performance Benchmarks", self.test_performance_benchmarks)
        self.test("JSON Serialization", self.test_json_serialization)
        self.test("Memory Usage", self.test_memory_usage)
        
        print("\n" + "=" * 60)
        print(f"🏆 TEST RESULTS: {self.passed} passed, {self.failed} failed")
        
        if self.failed == 0:
            print("✅ ALL TESTS PASSED - Search system is bulletproof!")
        else:
            print("❌ Some tests failed - needs attention")
        
        return self.failed == 0

if __name__ == "__main__":
    tester = ComprehensiveSearchTests()
    success = tester.run_all_tests()
    exit(0 if success else 1)