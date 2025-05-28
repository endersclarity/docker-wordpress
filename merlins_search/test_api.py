#!/usr/bin/env python3
"""
Simple test version of Merlin's Shack Search API
"""

import os
import json
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global cache
listings_data = None

def load_listings():
    global listings_data
    if listings_data is None:
        with open('enhanced_listings.json', 'r') as f:
            listings_data = json.load(f)
    return listings_data

def keyword_search(query: str, top_k: int = 5):
    """Simple keyword search for testing."""
    query_lower = query.lower()
    listings = load_listings()
    
    # Simple scoring
    scored = []
    for listing in listings[:200]:  # Just search first 200 for speed
        desc = listing.get('enhanced_description', '').lower()
        address = listing.get('address', '').lower()
        
        score = 0
        for word in query_lower.split():
            if word in desc:
                score += 1
            if word in address:
                score += 2
        
        if score > 0:
            result = listing.copy()
            result['similarity_score'] = score / 10.0
            scored.append(result)
    
    # Sort and return top k
    scored.sort(key=lambda x: x['similarity_score'], reverse=True)
    return scored[:top_k]

@app.route('/health')
def health():
    listings = load_listings()
    return jsonify({
        'status': 'healthy',
        'properties_loaded': len(listings),
        'embeddings_available': False,
        'semantic_search_available': False
    })

@app.route('/search', methods=['POST'])
def search():
    start_time = time.time()
    
    data = request.get_json()
    query = data.get('query', '').strip()
    top_k = min(data.get('top_k', 5), 20)
    
    if not query:
        return jsonify({'error': 'Query required'}), 400
    
    results = keyword_search(query, top_k)
    
    return jsonify({
        'properties': results,
        'total': len(results),
        'query': query,
        'search_time_ms': round((time.time() - start_time) * 1000, 2),
        'search_type': 'keyword_test'
    })

@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head><title>🧙‍♂️ Merlin's Shack Search API Test</title></head>
    <body style="font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px;">
        <h1>🧙‍♂️ Merlin's Shack Property Search API</h1>
        <p><strong>API is LIVE and working!</strong></p>
        <p>Search 458+ Nevada County properties by vibe, not just specs.</p>
        
        <div style="margin: 30px 0;">
            <input type="text" id="query" placeholder="Try: 'cozy cottage', 'luxury castle', 'family retreat'..." 
                   style="width: 70%; padding: 10px; font-size: 16px;">
            <button onclick="search()" style="padding: 10px 20px; font-size: 16px;">🔮 Search</button>
        </div>
        
        <div id="results"></div>
        
        <script>
            function search() {
                const query = document.getElementById('query').value;
                if (!query) return;
                
                document.getElementById('results').innerHTML = 'Searching...';
                
                fetch('/search', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({query: query, top_k: 5})
                })
                .then(r => r.json())
                .then(data => {
                    let html = `<h3>Found ${data.total} results in ${data.search_time_ms}ms:</h3>`;
                    data.properties.forEach((p, i) => {
                        html += `<div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px;">
                            <h4>${i+1}. ${p.address}</h4>
                            <p><strong>$${p.price.toLocaleString()}</strong> | ${p.bedrooms}br/${p.bathrooms}ba | ${p.sqft.toLocaleString()} sqft</p>
                            <p>Score: ${(p.similarity_score * 100).toFixed(1)}%</p>
                        </div>`;
                    });
                    document.getElementById('results').innerHTML = html;
                });
            }
            document.getElementById('query').onkeypress = (e) => e.key === 'Enter' && search();
        </script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    print("🧙‍♂️ Starting Test Search API...")
    load_listings()
    print(f"Loaded {len(listings_data)} properties")
    app.run(host='0.0.0.0', port=5001, debug=False)