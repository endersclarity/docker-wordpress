# 🧙‍♂️ Merlin's Shack Semantic Property Search

Revolutionary vibe-based real estate search that understands natural language queries like "Merlin's shack" or "luxury castle" and returns properties that match the requested aesthetic and feeling.

## ✨ What It Does

- **Semantic Search**: Search by vibe, not just keywords
- **Natural Language**: "Merlin's shack", "hobbit house", "luxury retreat" 
- **AI-Powered**: Uses OpenAI embeddings for true understanding
- **Fallback Search**: Works even without API key using smart keyword matching
- **WordPress Ready**: API designed for easy website integration

## 🏗️ System Architecture

```
1. Data Processor (data_processor.py)
   ├── Enhances boring MLS descriptions 
   ├── Adds vibe keywords and emotional context
   └── Creates rich, searchable content

2. Embedding Generator (embedding_generator.py)
   ├── Creates vector embeddings using OpenAI
   ├── Enables semantic similarity search
   └── Handles similarity calculations

3. Search API (search_api.py)
   ├── Flask web API for searches
   ├── Fallback keyword search
   └── WordPress integration endpoints
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install pandas openai flask flask-cors
```

### 2. Process MLS Data
```bash
python data_processor.py
# Creates enhanced_listings.json with 458+ properties
```

### 3. Generate Embeddings (Optional)
```bash
export OPENAI_API_KEY='your_key_here'
python embedding_generator.py
# Creates property_embeddings.json (~$0.01 cost)
```

### 4. Start Search API
```bash
python search_api.py
# Runs on http://localhost:5001
```

### 5. Test Searches
```bash
curl -X POST http://localhost:5001/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Merlins shack", "top_k": 3}'
```

## 🧪 Example Searches That Work

- **"Merlin's shack"** → Rustic cabins and cottages with character
- **"Luxury castle"** → Grand estates and impressive homes  
- **"Hobbit house"** → Cozy, underground-feeling, garden properties
- **"Family retreat"** → Spacious homes with acreage and privacy
- **"Tech billionaire hideaway"** → Modern, sustainable, high-tech properties

## 📊 Sample Results

**Query: "Merlin's shack"**
```json
{
  "results": [
    {
      "address": "16100 Barbara Ct, Grass Valley",
      "price": 645000,
      "similarity_score": 0.6,
      "enhanced_description": "A rustic, cabin property... log cabin nestled on 10 acres...",
      "vibes": "mountain, intimate, hideaway, peaceful, woodsy"
    }
  ]
}
```

## 🌐 WordPress Integration

### Add to WordPress Theme
```javascript
// Add search box to any page
fetch('/wp-json/merlin-search/v1/search', {
  method: 'POST',
  body: JSON.stringify({query: 'cottage retreat', top_k: 5})
})
.then(response => response.json())
.then(properties => displayResults(properties));
```

### API Endpoints
- `POST /search` - Main search endpoint
- `GET /api/properties` - All properties
- `GET /health` - System status

## 💰 Costs

- **Setup**: ~$0.01 to embed all properties
- **Searches**: ~$0.0001 per query
- **Monthly**: Under $5 for typical real estate site traffic

## 🎨 UI Integration Ideas

1. **Merlin's Cottage Interface**: Search bar embedded in Disney-style cottage door
2. **Magic Results**: Properties appear with "why this matched" explanations
3. **Vibe Tags**: Visual tags showing property personality
4. **Social Sharing**: "Found my dream hobbit house!" sharing

## 📁 File Structure

```
merlins_search/
├── data_processor.py      # Enhances MLS descriptions
├── embedding_generator.py # Creates AI embeddings  
├── search_api.py         # Flask search API
├── test_search.py        # Demo without API key
├── enhanced_listings.json # Processed property data
├── property_embeddings.json # AI embeddings (optional)
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🔮 Next Steps

1. **Disney UI**: Create Merlin's cottage search interface
2. **WordPress Plugin**: Package as installable plugin
3. **Image Search**: "Show me properties like this photo"
4. **Social Integration**: Shareable search results
5. **Analytics**: Track popular vibe searches

## 🧙‍♂️ Magic Features

- Understands context: "artist studio" vs "family compound" 
- Price awareness: "luxury" queries favor expensive properties
- Location vibes: Mountain, waterfront, urban context
- Architectural personality: Modern, rustic, traditional vibes
- Lifestyle matching: Equestrian, entertaining, retreat properties

**This system makes property search memorable, shareable, and fun - setting Narissa apart from every other realtor using boring MLS search!**