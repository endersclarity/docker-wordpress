#!/usr/bin/env python3
"""
Merlin's Shack Semantic Search - Gemini Embedding Generator
Creates vector embeddings for property listings using Google's Gemini API.
"""

import json
import os
import time
from typing import List, Dict, Any
import requests
import numpy as np

class GeminiPropertyEmbedder:
    """Generates embeddings using Google Gemini API."""
    
    def __init__(self, api_key: str = None):
        """Initialize with Gemini API key."""
        if api_key:
            self.api_key = api_key
        else:
            # Try to get from environment variable
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("Gemini API key required. Set GEMINI_API_KEY environment variable or pass api_key parameter.")
            self.api_key = api_key
        
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"
        
    def create_embedding(self, text: str) -> List[float]:
        """Create embedding for a single text string using Gemini."""
        try:
            headers = {
                'Content-Type': 'application/json',
            }
            
            data = {
                'model': 'models/text-embedding-004',
                'content': {
                    'parts': [{'text': text}]
                }
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            return result['embedding']['values']
            
        except Exception as e:
            print(f"Error creating embedding: {e}")
            return None
    
    def create_embeddings_batch(self, texts: List[str], batch_size: int = 5) -> List[List[float]]:
        """Create embeddings for multiple texts (Gemini doesn't support true batching, so we do sequential)."""
        embeddings = []
        
        for i, text in enumerate(texts):
            print(f"Processing property {i+1}/{len(texts)}")
            
            embedding = self.create_embedding(text)
            embeddings.append(embedding)
            
            # Small delay to be respectful to API
            if i % 10 == 0 and i > 0:
                print(f"Processed {i} properties, taking a short break...")
                time.sleep(1)
            else:
                time.sleep(0.1)
                
        return embeddings
    
    def process_enhanced_listings(self, json_path: str, output_path: str = None) -> Dict[str, Any]:
        """Process enhanced listings and create embeddings."""
        
        print(f"Loading enhanced listings from {json_path}...")
        with open(json_path, 'r') as f:
            listings = json.load(f)
        
        print(f"Creating Gemini embeddings for {len(listings)} properties...")
        
        # Prepare texts for embedding
        texts = []
        for listing in listings:
            # Combine enhanced description with key features for embedding
            embedding_text = listing['enhanced_description']
            
            # Add key searchable features
            if listing.get('architectural_style'):
                embedding_text += f" Architectural style: {listing['architectural_style']}"
            
            if listing.get('price') and listing['price'] > 0:
                price_range = self.get_price_range(listing['price'])
                embedding_text += f" Price range: {price_range}"
            
            if listing.get('lot_acres') and listing['lot_acres'] > 0:
                if listing['lot_acres'] >= 5:
                    embedding_text += " Large acreage estate property"
                elif listing['lot_acres'] >= 1:
                    embedding_text += " Spacious lot with acreage"
            
            texts.append(embedding_text)
        
        # Create embeddings
        embeddings = self.create_embeddings_batch(texts)
        
        # Combine listings with embeddings
        processed_data = {
            'listings': [],
            'metadata': {
                'total_properties': len(listings),
                'embedding_model': 'gemini-text-embedding-004',
                'created_timestamp': time.time(),
                'embedding_dimension': len(embeddings[0]) if embeddings and embeddings[0] else None
            }
        }
        
        successful_embeddings = 0
        for listing, embedding in zip(listings, embeddings):
            if embedding is not None:
                listing['embedding'] = embedding
                processed_data['listings'].append(listing)
                successful_embeddings += 1
            else:
                print(f"Skipping listing {listing.get('listing_id', 'unknown')} due to embedding failure")
        
        print(f"Successfully created embeddings for {successful_embeddings} properties")
        
        if output_path:
            print(f"Saving embeddings to {output_path}...")
            with open(output_path, 'w') as f:
                json.dump(processed_data, f, indent=2)
            print(f"Embeddings saved to {output_path}")
        
        return processed_data
    
    def get_price_range(self, price: float) -> str:
        """Convert price to descriptive range."""
        if price < 300000:
            return "affordable starter home"
        elif price < 500000:
            return "mid-range family home"
        elif price < 800000:
            return "upscale residential"
        elif price < 1200000:
            return "luxury home"
        elif price < 2000000:
            return "luxury estate"
        else:
            return "ultra-luxury estate"
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings."""
        if not embedding1 or not embedding2:
            return 0.0
        
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def search_similar_properties(self, query: str, embeddings_data: Dict[str, Any], top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for properties similar to a query."""
        
        print(f"Searching for: '{query}'")
        
        # Create embedding for query
        query_embedding = self.create_embedding(query)
        if not query_embedding:
            print("Failed to create query embedding")
            return []
        
        # Calculate similarities
        similarities = []
        for listing in embeddings_data['listings']:
            if 'embedding' in listing:
                similarity = self.calculate_similarity(query_embedding, listing['embedding'])
                similarities.append({
                    'listing': listing,
                    'similarity': similarity
                })
        
        # Sort by similarity and return top k
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        
        results = []
        for item in similarities[:top_k]:
            result = item['listing'].copy()
            result['similarity_score'] = item['similarity']
            # Remove embedding from result to save space
            if 'embedding' in result:
                del result['embedding']
            results.append(result)
        
        return results

def main():
    """Main function to demonstrate embedding generation."""
    
    # Get Gemini API key
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("Gemini API key not found in environment variables.")
        print("Please set GEMINI_API_KEY environment variable.")
        return
    
    embedder = GeminiPropertyEmbedder(api_key)
    
    # Process enhanced listings
    enhanced_path = "enhanced_listings.json"
    embeddings_path = "property_embeddings_gemini.json"
    
    if not os.path.exists(enhanced_path):
        print(f"Enhanced listings file not found: {enhanced_path}")
        print("Please run data_processor.py first to create enhanced listings.")
        return
    
    # Generate embeddings
    embeddings_data = embedder.process_enhanced_listings(enhanced_path, embeddings_path)
    
    # Test some searches
    test_queries = [
        "Merlin's shack",
        "luxury estate with pool",
        "cozy cottage",
        "family home with acreage",
        "modern contemporary"
    ]
    
    print("\n" + "="*80)
    print("TESTING SEMANTIC SEARCH WITH GEMINI")
    print("="*80)
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        print("-" * 40)
        
        results = embedder.search_similar_properties(query, embeddings_data, top_k=3)
        
        for i, result in enumerate(results, 1):
            print(f"{i}. {result['address']} - ${result['price']:,.0f}")
            print(f"   Similarity: {result['similarity_score']:.3f}")
            print(f"   {result['enhanced_description'][:100]}...")
            print()

if __name__ == "__main__":
    main()