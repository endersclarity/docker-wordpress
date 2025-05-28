#!/usr/bin/env python3
"""
Test the Merlin's Shack semantic search with a demo API key setup.
"""

import os
import json

def demo_search_system():
    """Demo the search system with sample data if no API key available."""
    
    # Check if we have enhanced listings
    if not os.path.exists("enhanced_listings.json"):
        print("No enhanced listings found. Please run data_processor.py first.")
        return
    
    # Load enhanced listings to show what we have
    with open("enhanced_listings.json", 'r') as f:
        listings = json.load(f)
    
    print(f"🏡 Found {len(listings)} enhanced property listings!")
    print("\nSample properties that would match 'Merlin's shack':")
    print("="*60)
    
    # Look for cottage-like, rustic, or character properties
    merlin_candidates = []
    
    for listing in listings:
        desc = listing['enhanced_description'].lower()
        address = listing['address']
        price = listing['price']
        
        # Look for Merlin-esque keywords
        merlin_keywords = [
            'cottage', 'cabin', 'rustic', 'character', 'woodsy', 'secluded', 
            'magical', 'charming', 'cozy', 'retreat', 'log', 'fairytale',
            'artisan', 'unique', 'whimsical'
        ]
        
        score = sum(1 for keyword in merlin_keywords if keyword in desc)
        
        if score >= 2:  # Properties with at least 2 magical keywords
            merlin_candidates.append({
                'address': address,
                'price': price,
                'score': score,
                'description': listing['enhanced_description'][:200] + "..."
            })
    
    # Sort by magic score
    merlin_candidates.sort(key=lambda x: x['score'], reverse=True)
    
    # Show top candidates
    for i, candidate in enumerate(merlin_candidates[:5], 1):
        print(f"{i}. {candidate['address']}")
        print(f"   Price: ${candidate['price']:,.0f}")
        print(f"   Magic Score: {candidate['score']}/10")
        print(f"   {candidate['description']}")
        print()
    
    print("\n🧙‍♂️ API Key Setup Instructions:")
    print("="*60)
    print("To enable full semantic search with OpenAI embeddings:")
    print("1. Get an OpenAI API key from https://platform.openai.com/")
    print("2. Export it: export OPENAI_API_KEY='your_key_here'")
    print("3. Run: python embedding_generator.py")
    print("4. Test queries like 'Merlin's shack', 'luxury castle', 'hobbit house'")
    
    print("\n💰 Cost estimate:")
    print(f"- Embedding {len(listings)} properties: ~$0.01")
    print("- Each search query: ~$0.0001")
    print("- Total demo cost: Under $0.05")

if __name__ == "__main__":
    demo_search_system()