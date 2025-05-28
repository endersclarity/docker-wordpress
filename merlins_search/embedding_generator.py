#!/usr/bin/env python3
"""
Merlin's Shack Semantic Search - Embedding Generator
Creates vector embeddings for property listings using OpenAI's API.
"""

import json
import os
import time
from typing import List, Dict, Any
import numpy as np
from openai import OpenAI

class PropertyEmbeddingGenerator:
    """Generates and manages vector embeddings for property listings."""
    
    def __init__(self, api_key: str = None):
        """Initialize with OpenAI API key."""
        if api_key:
            self.client = OpenAI(api_key=api_key)
        else:
            # Try to get from environment variable
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("OpenAI API key required. Set OPENAI_API_KEY environment variable or pass api_key parameter.")
            self.client = OpenAI(api_key=api_key)
        
        self.embedding_model = "text-embedding-ada-002"
        self.embeddings_cache = {}
    
    def create_embedding(self, text: str) -> List[float]:
        """Create embedding for a single text string."""
        try:
            response = self.client.embeddings.create(
                input=text,
                model=self.embedding_model
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error creating embedding: {e}")
            return None
    
    def create_embeddings_batch(self, texts: List[str], batch_size: int = 10) -> List[List[float]]:
        """Create embeddings for multiple texts in batches."""
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            print(f"Processing batch {i//batch_size + 1}/{(len(texts) + batch_size - 1)//batch_size}")
            
            try:
                response = self.client.embeddings.create(
                    input=batch,
                    model=self.embedding_model
                )
                
                batch_embeddings = [item.embedding for item in response.data]
                embeddings.extend(batch_embeddings)
                
                # Small delay to be respectful to API
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Error in batch {i//batch_size + 1}: {e}")
                # Add None placeholders for failed batch
                embeddings.extend([None] * len(batch))
                
        return embeddings
    
    def process_enhanced_listings(self, json_path: str, output_path: str = None) -> Dict[str, Any]:
        """Process enhanced listings and create embeddings."""
        
        print(f"Loading enhanced listings from {json_path}...")
        with open(json_path, 'r') as f:
            listings = json.load(f)
        
        print(f"Creating embeddings for {len(listings)} properties...")
        
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
                'embedding_model': self.embedding_model,
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
    
    # Get OpenAI API key from user input if not in environment
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("OpenAI API key not found in environment variables.")
        print("Please set OPENAI_API_KEY environment variable or update the script with your key.")
        print("For testing, you can export OPENAI_API_KEY='your_key_here'")
        return
    
    generator = PropertyEmbeddingGenerator()
    
    # Process enhanced listings
    enhanced_path = "enhanced_listings.json"
    embeddings_path = "property_embeddings.json"
    
    if not os.path.exists(enhanced_path):
        print(f"Enhanced listings file not found: {enhanced_path}")
        print("Please run data_processor.py first to create enhanced listings.")
        return
    
    # Generate embeddings
    embeddings_data = generator.process_enhanced_listings(enhanced_path, embeddings_path)
    
    # Test some searches
    test_queries = [
        "Merlin's shack",
        "luxury estate with pool",
        "cozy cottage",
        "family home with acreage",
        "modern contemporary"
    ]
    
    print("\n" + "="*80)
    print("TESTING SEMANTIC SEARCH")
    print("="*80)
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        print("-" * 40)
        
        results = generator.search_similar_properties(query, embeddings_data, top_k=3)
        
        for i, result in enumerate(results, 1):
            print(f"{i}. {result['address']} - ${result['price']:,.0f}")
            print(f"   Similarity: {result['similarity_score']:.3f}")
            print(f"   {result['enhanced_description'][:100]}...")
            print()

if __name__ == "__main__":
    main()