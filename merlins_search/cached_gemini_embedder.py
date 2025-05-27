#!/usr/bin/env python3
"""
Cached Gemini Property Embedder
High-performance version with query caching and optimizations
"""

import json
import os
import time
from typing import List, Dict, Any, Optional
import requests
import hashlib
from functools import lru_cache

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    import math
    NUMPY_AVAILABLE = False
    print("Warning: numpy not available, using pure Python (slower)")

class CachedGeminiPropertyEmbedder:
    """Optimized Gemini embedder with caching and performance improvements."""
    
    def __init__(self, api_key: str = None, cache_size: int = 100):
        """Initialize with API key and cache configuration."""
        if api_key:
            self.api_key = api_key
        else:
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("Gemini API key required")
            self.api_key = api_key
        
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"
        
        # Query embedding cache
        self.query_cache = {}
        self.cache_size = cache_size
        
        # Precomputed common queries
        self.common_queries = self._load_precomputed_queries()
        
        # Performance tracking
        self.stats = {
            'api_calls': 0,
            'cache_hits': 0,
            'precomputed_hits': 0,
            'total_queries': 0
        }
    
    def _load_precomputed_queries(self) -> Dict[str, List[float]]:
        """Load precomputed embeddings for common queries."""
        # For now, return empty dict - we'll populate this after caching some queries
        return {}
    
    def _cache_key(self, query: str) -> str:
        """Generate cache key for query."""
        return hashlib.md5(query.lower().strip().encode()).hexdigest()
    
    def create_embedding(self, text: str, use_cache: bool = True) -> Optional[List[float]]:
        """Create embedding with caching support."""
        self.stats['total_queries'] += 1
        
        # Check precomputed queries first
        if text.lower().strip() in self.common_queries:
            self.stats['precomputed_hits'] += 1
            return self.common_queries[text.lower().strip()]
        
        # Check cache
        if use_cache:
            cache_key = self._cache_key(text)
            if cache_key in self.query_cache:
                self.stats['cache_hits'] += 1
                return self.query_cache[cache_key]
        
        # Make API call
        try:
            start_time = time.time()
            self.stats['api_calls'] += 1
            
            headers = {'Content-Type': 'application/json'}
            data = {
                'model': 'models/text-embedding-004',
                'content': {'parts': [{'text': text}]}
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            embedding = result['embedding']['values']
            
            api_time = time.time() - start_time
            
            # Cache the result
            if use_cache:
                # Implement LRU-style cache eviction
                if len(self.query_cache) >= self.cache_size:
                    # Remove oldest entry (simple FIFO for now)
                    oldest_key = next(iter(self.query_cache))
                    del self.query_cache[oldest_key]
                
                self.query_cache[cache_key] = embedding
            
            print(f"API call completed in {api_time:.3f}s")
            return embedding
            
        except Exception as e:
            print(f"Error creating embedding: {e}")
            return None
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity with numpy optimization if available."""
        if not embedding1 or not embedding2:
            return 0.0
        
        if NUMPY_AVAILABLE:
            # Use numpy for faster computation
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            return float(dot_product / (norm1 * norm2))
        else:
            # Fallback to pure Python
            dot_product = sum(a * b for a, b in zip(embedding1, embedding2))
            norm1 = math.sqrt(sum(a * a for a in embedding1))
            norm2 = math.sqrt(sum(a * a for a in embedding2))
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            return dot_product / (norm1 * norm2)
    
    def search_similar_properties(self, query: str, embeddings_data: Dict[str, Any], top_k: int = 5) -> List[Dict[str, Any]]:
        """Optimized property search with caching."""
        start_time = time.time()
        
        print(f"Searching for: '{query}'")
        
        # Create embedding for query (with caching)
        query_embedding = self.create_embedding(query, use_cache=True)
        if not query_embedding:
            print("Failed to create query embedding")
            return []
        
        embedding_time = time.time() - start_time
        
        # Calculate similarities
        calc_start = time.time()
        similarities = []
        
        if NUMPY_AVAILABLE:
            # Vectorized similarity calculation for better performance
            query_vec = np.array(query_embedding)
            query_norm = np.linalg.norm(query_vec)
            
            for listing in embeddings_data['listings']:
                if 'embedding' in listing:
                    prop_vec = np.array(listing['embedding'])
                    prop_norm = np.linalg.norm(prop_vec)
                    
                    if query_norm > 0 and prop_norm > 0:
                        similarity = float(np.dot(query_vec, prop_vec) / (query_norm * prop_norm))
                    else:
                        similarity = 0.0
                    
                    similarities.append({
                        'listing': listing,
                        'similarity': similarity
                    })
        else:
            # Standard calculation
            for listing in embeddings_data['listings']:
                if 'embedding' in listing:
                    similarity = self.calculate_similarity(query_embedding, listing['embedding'])
                    similarities.append({
                        'listing': listing,
                        'similarity': similarity
                    })
        
        calc_time = time.time() - calc_start
        
        # Sort and return top k
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        
        results = []
        for item in similarities[:top_k]:
            result = item['listing'].copy()
            result['similarity_score'] = item['similarity']
            # Remove embedding to save space
            if 'embedding' in result:
                del result['embedding']
            results.append(result)
        
        total_time = time.time() - start_time
        
        print(f"Search completed in {total_time:.3f}s (embedding: {embedding_time:.3f}s, calc: {calc_time:.3f}s)")
        self.print_performance_stats()
        
        return results
    
    def print_performance_stats(self):
        """Print current performance statistics."""
        total = self.stats['total_queries']
        if total > 0:
            cache_rate = (self.stats['cache_hits'] / total) * 100
            precomputed_rate = (self.stats['precomputed_hits'] / total) * 100
            api_rate = (self.stats['api_calls'] / total) * 100
            
            print(f"Performance: {cache_rate:.1f}% cache hits, {precomputed_rate:.1f}% precomputed, {api_rate:.1f}% API calls")
    
    def populate_common_queries(self, queries: List[str]):
        """Pre-populate cache with common queries."""
        print(f"Pre-populating cache with {len(queries)} common queries...")
        
        for query in queries:
            print(f"Caching: '{query}'")
            embedding = self.create_embedding(query, use_cache=True)
            if embedding:
                self.common_queries[query.lower().strip()] = embedding
                time.sleep(0.1)  # Rate limiting
        
        print(f"Cache populated with {len(self.common_queries)} queries")
    
    def save_precomputed_queries(self, filepath: str):
        """Save precomputed queries to file."""
        with open(filepath, 'w') as f:
            json.dump(self.common_queries, f, indent=2)
        print(f"Saved {len(self.common_queries)} precomputed queries to {filepath}")
    
    def load_precomputed_queries(self, filepath: str):
        """Load precomputed queries from file."""
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                self.common_queries = json.load(f)
            print(f"Loaded {len(self.common_queries)} precomputed queries from {filepath}")
            return True
        return False

def main():
    """Test the cached embedder performance."""
    
    # Common property search queries for pre-population
    common_queries = [
        "cozy cottage",
        "luxury estate", 
        "family home",
        "waterfront property",
        "mountain view",
        "rustic cabin",
        "modern home",
        "historic property",
        "acreage property",
        "horse property",
        "Merlin's shack",
        "affordable home",
        "starter home",
        "retirement home",
        "vacation rental"
    ]
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("GEMINI_API_KEY not found")
        return
    
    # Test cached embedder
    embedder = CachedGeminiPropertyEmbedder(api_key)
    
    # Pre-populate common queries
    embedder.populate_common_queries(common_queries)
    
    # Save for future use
    embedder.save_precomputed_queries("precomputed_queries.json")
    
    # Test search performance
    if os.path.exists("property_embeddings_gemini.json"):
        with open("property_embeddings_gemini.json", 'r') as f:
            embeddings_data = json.load(f)
        
        # Test queries
        test_queries = ["cozy cottage", "luxury estate", "new query not cached"]
        
        for query in test_queries:
            print(f"\n{'='*50}")
            print(f"Testing: '{query}'")
            start = time.time()
            results = embedder.search_similar_properties(query, embeddings_data, top_k=3)
            total_time = time.time() - start
            print(f"Total search time: {total_time:.3f}s")

if __name__ == "__main__":
    main()