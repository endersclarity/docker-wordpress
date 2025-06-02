#!/usr/bin/env python3
"""
Simple Flask API server for semantic property search
Serves the enhanced semantic search functionality to the frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import time
from gemini_embedder import GeminiPropertyEmbedder

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Initialize embedder
API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyCJ8-hQJVLGXDkHy2sjw-O6Dls0FVO0gGU')
embedder = GeminiPropertyEmbedder(API_KEY)

# Load embeddings data
embeddings_data = None
try:
    with open('property_embeddings_gemini.json', 'r') as f:
        embeddings_data = json.load(f)
    print(f"✅ Loaded {len(embeddings_data['listings'])} properties with embeddings")
except Exception as e:
    print(f"❌ Error loading embeddings: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'properties_loaded': len(embeddings_data['listings']) if embeddings_data else 0,
        'timestamp': time.time()
    })

@app.route('/search', methods=['POST'])
def semantic_search():
    """Semantic search endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        limit = data.get('limit', 10)
        
        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400
        
        if not embeddings_data:
            return jsonify({'error': 'Embeddings data not loaded'}), 500
        
        start_time = time.time()
        
        # Perform semantic search
        results = embedder.search_similar_properties(query, embeddings_data, top_k=limit)
        
        search_time = time.time() - start_time
        
        # Format results for frontend
        formatted_results = []
        for result in results:
            formatted_results.append({
                'id': result['listing_id'],
                'address': result['address'],
                'city': result['city'],
                'price': result['price'],
                'bedrooms': result['bedrooms'],
                'bathrooms': result['bathrooms'],
                'sqft': result['sqft'],
                'lot_acres': result['lot_acres'],
                'architectural_style': result['architectural_style'],
                'description': result['enhanced_description'][:300] + '...' if len(result['enhanced_description']) > 300 else result['enhanced_description'],
                'similarity_score': result['similarity_score'],
                'days_on_market': result.get('days_on_market', 0)
            })
        
        return jsonify({
            'query': query,
            'results': formatted_results,
            'total_results': len(formatted_results),
            'search_time': round(search_time, 3),
            'expanded_query': embedder.expand_creative_query(query)
        })
        
    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/properties', methods=['GET'])
def get_all_properties():
    """Get all properties (for browsing)"""
    try:
        if not embeddings_data:
            return jsonify({'error': 'Embeddings data not loaded'}), 500
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Calculate pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        properties = embeddings_data['listings'][start_idx:end_idx]
        
        # Format for frontend
        formatted_properties = []
        for prop in properties:
            formatted_properties.append({
                'id': prop['listing_id'],
                'address': prop['address'],
                'city': prop['city'],
                'price': prop['price'],
                'bedrooms': prop['bedrooms'],
                'bathrooms': prop['bathrooms'],
                'sqft': prop['sqft'],
                'lot_acres': prop['lot_acres'],
                'architectural_style': prop['architectural_style'],
                'description': prop['enhanced_description'][:300] + '...' if len(prop['enhanced_description']) > 300 else prop['enhanced_description'],
                'days_on_market': prop.get('days_on_market', 0)
            })
        
        return jsonify({
            'properties': formatted_properties,
            'total': len(embeddings_data['listings']),
            'page': page,
            'per_page': per_page,
            'pages': (len(embeddings_data['listings']) + per_page - 1) // per_page
        })
        
    except Exception as e:
        print(f"Properties error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if not embeddings_data:
        print("❌ Cannot start server - embeddings data not loaded")
        exit(1)
    
    print("🚀 Starting semantic search API server...")
    print("📡 Endpoints:")
    print("   GET  /health - Health check")
    print("   POST /search - Semantic search")
    print("   GET  /properties - Browse all properties")
    print()
    
    # Run server on all interfaces for WSL compatibility
    app.run(host='0.0.0.0', port=5001, debug=True)