#!/usr/bin/env python3
"""
Merlin's Shack Semantic Search API
Flask API for semantic property search with vibe-based queries.
"""

import os
import json
import time
from typing import List, Dict, Any
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from embedding_generator import PropertyEmbeddingGenerator

app = Flask(__name__)
CORS(app)  # Enable CORS for WordPress integration

# Global variables for caching
embeddings_data = None
generator = None
last_loaded = 0

def load_embeddings_data():
    """Load embeddings data with caching."""
    global embeddings_data, generator, last_loaded
    
    embeddings_path = "property_embeddings.json"
    
    # Check if we need to reload
    if embeddings_data is None or (time.time() - last_loaded > 300):  # Reload every 5 minutes
        try:
            if os.path.exists(embeddings_path):
                print("Loading embeddings from file...")
                with open(embeddings_path, 'r') as f:
                    embeddings_data = json.load(f)
                last_loaded = time.time()
                print(f"Loaded {len(embeddings_data.get('listings', []))} properties with embeddings")
            else:
                print("No embeddings file found, using enhanced listings only...")
                # Fallback to enhanced listings without embeddings
                with open("enhanced_listings.json", 'r') as f:
                    listings = json.load(f)
                embeddings_data = {
                    'listings': listings,
                    'metadata': {
                        'total_properties': len(listings),
                        'embedding_model': 'fallback_keyword_search',
                        'created_timestamp': time.time()
                    }
                }
                last_loaded = time.time()
        except Exception as e:
            print(f"Error loading embeddings: {e}")
            return None
    
    return embeddings_data

def get_generator():
    """Get or create embedding generator."""
    global generator
    
    if generator is None:
        try:
            generator = PropertyEmbeddingGenerator()
        except Exception as e:
            print(f"Could not initialize OpenAI generator: {e}")
            generator = None
    
    return generator

def fallback_keyword_search(query: str, listings: List[Dict], top_k: int = 5) -> List[Dict]:
    """Fallback keyword-based search when embeddings aren't available."""
    
    # Handle empty or whitespace-only queries
    if not query or not query.strip():
        return []
    
    query_lower = query.lower().strip()
    
    # Enhanced keyword mappings for better matches
    keyword_mappings = {
        'merlin': ['cottage', 'rustic', 'cabin', 'magical', 'character', 'secluded', 'woodsy'],
        'shack': ['cottage', 'cabin', 'small', 'cozy', 'rustic', 'simple'],
        'cottage': ['cozy', 'small', 'charming', 'garden', 'intimate'],
        'castle': ['grand', 'stone', 'luxury', 'estate', 'impressive', 'majestic'],
        'mansion': ['grand', 'luxury', 'estate', 'formal', 'large'],
        'hobbit': ['cozy', 'underground', 'garden', 'intimate', 'charming', 'round'],
        'luxury': ['upscale', 'premium', 'high-end', 'elegant', 'sophisticated'],
        'modern': ['contemporary', 'updated', 'new', 'sleek', 'minimalist'],
        'family': ['spacious', 'bedrooms', 'yard', 'neighborhood', 'schools'],
        'retreat': ['private', 'peaceful', 'secluded', 'quiet', 'escape']
    }
    
    # Expand query with related keywords
    expanded_keywords = set(query_lower.split())
    for word in query_lower.split():
        if word in keyword_mappings:
            expanded_keywords.update(keyword_mappings[word])
    
    # Score listings
    scored_listings = []
    for listing in listings:
        desc = listing['enhanced_description'].lower()
        score = 0
        
        # Base keyword matching
        for keyword in expanded_keywords:
            if keyword in desc:
                score += 1
        
        # Bonus for exact query match
        if query_lower in desc:
            score += 5
        
        # Price range bonuses based on query type
        price = listing.get('price', 0)
        if 'luxury' in query_lower or 'castle' in query_lower or 'mansion' in query_lower:
            if price > 1000000:
                score += 3
        elif 'cottage' in query_lower or 'shack' in query_lower or 'cozy' in query_lower:
            if 300000 <= price <= 800000:
                score += 2
        
        # Acreage bonuses
        acres = listing.get('lot_acres', 0)
        if 'estate' in query_lower or 'retreat' in query_lower:
            if acres >= 5:
                score += 2
        
        if score > 0:
            result = listing.copy()
            result['similarity_score'] = score / 10.0  # Normalize to 0-1 range
            scored_listings.append(result)
    
    # Sort by score and return top k
    scored_listings.sort(key=lambda x: x['similarity_score'], reverse=True)
    return scored_listings[:top_k]

@app.route('/')
def home():
    """Home page with search interface."""
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Merlin's Shack Property Search</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .search-box { width: 100%; padding: 15px; font-size: 18px; border: 2px solid #8B4513; border-radius: 10px; }
            .search-btn { padding: 15px 30px; font-size: 18px; background: #8B4513; color: white; border: none; border-radius: 10px; cursor: pointer; }
            .result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
            .price { color: #228B22; font-weight: bold; }
            .similarity { color: #666; font-size: 12px; }
            .cottage { text-align: center; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="cottage">
            <h1>🧙‍♂️ Merlin's Shack Property Search</h1>
            <p><em>Search for properties by vibe, not just specs!</em></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <input type="text" id="query" class="search-box" placeholder="Try: 'Merlin's shack', 'luxury castle', 'cozy cottage', 'family retreat'..." />
            <br><br>
            <button onclick="searchProperties()" class="search-btn">🔮 Search Properties</button>
        </div>
        
        <div id="results"></div>
        
        <script>
            function searchProperties() {
                const query = document.getElementById('query').value;
                if (!query) return;
                
                document.getElementById('results').innerHTML = '<p>Searching...</p>';
                
                fetch('/search', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({query: query, top_k: 5})
                })
                .then(response => response.json())
                .then(data => {
                    let html = '<h3>Search Results for: "' + query + '"</h3>';
                    
                    if (data.results && data.results.length > 0) {
                        data.results.forEach((property, index) => {
                            html += `
                                <div class="result">
                                    <h4>${index + 1}. ${property.address}</h4>
                                    <p class="price">$${property.price.toLocaleString()}</p>
                                    <p class="similarity">Match Score: ${(property.similarity_score * 100).toFixed(1)}%</p>
                                    <p>${property.enhanced_description.substring(0, 300)}...</p>
                                </div>
                            `;
                        });
                    } else {
                        html += '<p>No properties found matching that vibe. Try a different search!</p>';
                    }
                    
                    document.getElementById('results').innerHTML = html;
                })
                .catch(error => {
                    document.getElementById('results').innerHTML = '<p>Error searching properties: ' + error + '</p>';
                });
            }
            
            // Allow Enter key to search
            document.getElementById('query').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchProperties();
                }
            });
        </script>
    </body>
    </html>
    """)

@app.route('/search', methods=['POST'])
def search_properties():
    """Search endpoint for property queries."""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        top_k = min(data.get('top_k', 5), 20)  # Max 20 results
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        # Load data
        embeddings_data = load_embeddings_data()
        if not embeddings_data:
            return jsonify({'error': 'Property data not available'}), 500
        
        print(f"Search query: '{query}'")
        
        # Try semantic search first, fallback to keyword search
        generator = get_generator()
        if generator and 'embedding' in embeddings_data.get('listings', [{}])[0]:
            print("Using semantic search with embeddings")
            results = generator.search_similar_properties(query, embeddings_data, top_k)
        else:
            print("Using fallback keyword search")
            results = fallback_keyword_search(query, embeddings_data['listings'], top_k)
        
        return jsonify({
            'query': query,
            'results': results,
            'total_found': len(results),
            'search_type': 'semantic' if generator else 'keyword'
        })
        
    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/properties')
def get_all_properties():
    """Get all properties (for WordPress integration)."""
    try:
        embeddings_data = load_embeddings_data()
        if not embeddings_data:
            return jsonify({'error': 'Property data not available'}), 500
        
        # Return properties without embeddings to save bandwidth
        properties = []
        for listing in embeddings_data['listings']:
            prop = listing.copy()
            if 'embedding' in prop:
                del prop['embedding']
            properties.append(prop)
        
        return jsonify({
            'properties': properties,
            'total': len(properties),
            'metadata': embeddings_data.get('metadata', {})
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health_check():
    """Health check endpoint."""
    embeddings_data = load_embeddings_data()
    generator = get_generator()
    
    return jsonify({
        'status': 'healthy',
        'properties_loaded': len(embeddings_data['listings']) if embeddings_data else 0,
        'semantic_search_available': generator is not None,
        'embeddings_available': embeddings_data and 'embedding' in embeddings_data.get('listings', [{}])[0] if embeddings_data else False
    })

if __name__ == '__main__':
    print("🧙‍♂️ Starting Merlin's Shack Property Search API...")
    print("Loading property data...")
    
    # Preload data
    load_embeddings_data()
    
    print("API ready!")
    print("Open http://localhost:5001 to test the search interface")
    
    app.run(host='0.0.0.0', port=5001, debug=True)