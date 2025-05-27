#!/usr/bin/env python3
"""
Property Search API Server
FastAPI server for semantic property search
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import re
from typing import List, Dict, Any, Optional
import uvicorn
from gemini_embedder import GeminiPropertyEmbedder

app = FastAPI(title="Property Search API", version="1.0.0")

# Enable CORS for WordPress integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for property data
properties_data = []
embeddings_data = None
gemini_embedder = None

class SearchRequest(BaseModel):
    query: str
    limit: int = 5

class SearchResponse(BaseModel):
    query: str
    results: List[Dict[str, Any]]
    total_found: int

def load_property_data():
    """Load property data from enhanced_listings.json"""
    global properties_data
    
    json_path = "enhanced_listings.json"
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            properties_data = json.load(f)
        print(f"Loaded {len(properties_data)} properties")
    else:
        print(f"Property data file not found: {json_path}")

def load_embeddings_data():
    """Load embeddings data if available"""
    global embeddings_data, gemini_embedder
    
    embeddings_path = "property_embeddings_gemini.json"
    if os.path.exists(embeddings_path):
        with open(embeddings_path, 'r') as f:
            embeddings_data = json.load(f)
        print(f"Loaded embeddings for {len(embeddings_data.get('listings', []))} properties")
        
        # Initialize Gemini embedder for query embeddings
        try:
            api_key = os.getenv('GEMINI_API_KEY', 'AIzaSyCJ8-hQJVLGXDkHy2sjw-O6Dls0FVO0gGU')
            gemini_embedder = GeminiPropertyEmbedder(api_key)
            print("Gemini embedder initialized for query processing")
        except Exception as e:
            print(f"Warning: Could not initialize Gemini embedder: {e}")
            gemini_embedder = None
        
        return True
    return False

def text_search_properties(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Fallback text-based search when embeddings aren't available"""
    
    query_lower = query.lower()
    query_words = re.findall(r'\w+', query_lower)
    
    scored_properties = []
    
    for prop in properties_data:
        score = 0
        searchable_text = ""
        
        # Build searchable text
        if prop.get('enhanced_description'):
            searchable_text += prop['enhanced_description'].lower() + " "
        if prop.get('original_description'):
            searchable_text += prop['original_description'].lower() + " "
        if prop.get('architectural_style'):
            searchable_text += prop['architectural_style'].lower() + " "
        if prop.get('address'):
            searchable_text += prop['address'].lower() + " "
        
        # Score based on word matches
        for word in query_words:
            # Exact word matches
            word_count = searchable_text.count(word)
            score += word_count * 2
            
            # Partial matches
            if word in searchable_text:
                score += 1
        
        # Bonus for price range matches
        if any(price_word in query_lower for price_word in ['luxury', 'expensive', 'high-end']):
            if prop.get('price', 0) > 800000:
                score += 5
        
        if any(price_word in query_lower for price_word in ['affordable', 'cheap', 'budget']):
            if prop.get('price', 0) < 400000:
                score += 5
        
        # Bonus for property type matches
        if any(type_word in query_lower for type_word in ['cottage', 'cabin', 'shack']):
            if any(style_word in searchable_text for style_word in ['cottage', 'cabin', 'rustic', 'cozy']):
                score += 10
        
        if any(type_word in query_lower for type_word in ['estate', 'mansion', 'luxury']):
            if prop.get('sqft', 0) > 3000 or prop.get('lot_acres', 0) > 2:
                score += 10
        
        if score > 0:
            # Format property for response
            result = {
                'id': prop.get('listing_id'),
                'title': f"{prop.get('bedrooms', '?')} bed, {prop.get('bathrooms', '?')} bath home",
                'address': prop.get('address', 'Address not available'),
                'price': f"${prop.get('price', 0):,.0f}" if prop.get('price') else "Price not available",
                'image': "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",  # Placeholder
                'bedrooms': prop.get('bedrooms', '?'),
                'bathrooms': prop.get('bathrooms', '?'),
                'sqft': prop.get('sqft', 0),
                'description': prop.get('enhanced_description', prop.get('original_description', ''))[:200] + "...",
                'similarity_score': score / 100.0,  # Normalize score
                'search_type': 'text_match'
            }
            scored_properties.append(result)
    
    # Sort by score and return top results
    scored_properties.sort(key=lambda x: x['similarity_score'], reverse=True)
    return scored_properties[:limit]

def embedding_search_properties(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Semantic search using embeddings (when available)"""
    if not embeddings_data or not gemini_embedder:
        print("Embeddings not available, falling back to text search")
        return text_search_properties(query, limit)
    
    try:
        # Use the Gemini embedder's search function
        results = gemini_embedder.search_similar_properties(query, embeddings_data, top_k=limit)
        
        # Format results for API response
        formatted_results = []
        for result in results:
            formatted_result = {
                'id': result.get('listing_id'),
                'title': f"{result.get('bedrooms', '?')} bed, {result.get('bathrooms', '?')} bath home",
                'address': result.get('address', 'Address not available'),
                'price': f"${result.get('price', 0):,.0f}" if result.get('price') else "Price not available",
                'image': "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",  # Placeholder
                'bedrooms': result.get('bedrooms', '?'),
                'bathrooms': result.get('bathrooms', '?'),
                'sqft': result.get('sqft', 0),
                'description': result.get('enhanced_description', result.get('original_description', ''))[:200] + "...",
                'similarity_score': result.get('similarity_score', 0),
                'search_type': 'semantic_embedding'
            }
            formatted_results.append(formatted_result)
        
        print(f"Semantic search returned {len(formatted_results)} results for query: '{query}'")
        return formatted_results
        
    except Exception as e:
        print(f"Error in embedding search: {e}")
        print("Falling back to text search")
        return text_search_properties(query, limit)

@app.get("/")
async def root():
    return {"message": "Property Search API", "status": "running", "properties_loaded": len(properties_data)}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "properties_loaded": len(properties_data),
        "embeddings_available": embeddings_data is not None
    }

@app.post("/search", response_model=SearchResponse)
async def search_properties(request: SearchRequest):
    """Search properties by query"""
    
    if not properties_data:
        raise HTTPException(status_code=503, detail="Property data not loaded")
    
    # Use embedding search if available, otherwise fall back to text search
    if embeddings_data:
        results = embedding_search_properties(request.query, request.limit)
    else:
        results = text_search_properties(request.query, request.limit)
    
    return SearchResponse(
        query=request.query,
        results=results,
        total_found=len(results)
    )

@app.get("/search")
async def search_properties_get(query: str, limit: int = 5):
    """GET endpoint for search (for easy testing)"""
    request = SearchRequest(query=query, limit=limit)
    return await search_properties(request)

@app.on_event("startup")
async def startup_event():
    """Load data on startup"""
    load_property_data()
    load_embeddings_data()

if __name__ == "__main__":
    print("Starting Property Search API Server...")
    print("Loading property data...")
    load_property_data()
    load_embeddings_data()
    
    print(f"Server ready with {len(properties_data)} properties")
    print("Starting server on http://localhost:5000")
    
    uvicorn.run(app, host="0.0.0.0", port=5000)