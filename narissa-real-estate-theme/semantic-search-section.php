<?php
/**
 * Semantic Property Search Section
 * Clean integration matching Narissa site aesthetic
 */
?>

<section class="semantic-search-section section section-cream">
  <div class="container">
    
    <!-- Section Header -->
    <div class="section-header">
      <h2>Find Your Perfect Home</h2>
      <p class="subtitle">Search by vibe, not just keywords</p>
    </div>
    
    <!-- Clean Search Interface -->
    <div class="search-interface">
      <div class="search-wrapper">
        <input 
          type="text" 
          id="semantic-search" 
          class="search-input"
          placeholder="Try searching: 'rustic mountain retreat' or 'modern family home'"
        />
        <button type="button" class="search-button" id="search-btn">
          Search Properties
        </button>
      </div>
      
      <div class="search-suggestions">
        <span class="suggestion-label">Popular searches:</span>
        <button class="suggestion-pill" data-query="Merlin's shack">Merlin's shack</button>
        <button class="suggestion-pill" data-query="luxury castle">Luxury castle</button>
        <button class="suggestion-pill" data-query="family retreat">Family retreat</button>
        <button class="suggestion-pill" data-query="hobbit house">Hobbit house</button>
      </div>
    </div>
    
    <!-- Results Container -->
    <div class="search-results-container" id="search-results">
      <!-- Results will populate here -->
    </div>
    
  </div>
</section>

<style>
/* Semantic Search Section - Matching Narissa aesthetic */
.semantic-search-section {
  background: var(--cream-warm);
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-family: var(--font-primary);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 300;
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.search-interface {
  max-width: 800px;
  margin: 0 auto 3rem auto;
}

.search-wrapper {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  border-radius: var(--border-radius);
  padding: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: var(--transition);
}

.search-wrapper:focus-within {
  border-color: var(--accent-gold);
  box-shadow: 0 6px 30px rgba(212, 175, 55, 0.2);
}

.search-input {
  flex: 1;
  border: none;
  padding: 1.2rem 1.5rem;
  font-family: var(--font-secondary);
  font-size: 1rem;
  color: var(--text-dark);
  background: transparent;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
  font-style: italic;
}

.search-button {
  background: var(--accent-gold);
  color: var(--primary-dark);
  border: none;
  padding: 1.2rem 2rem;
  border-radius: calc(var(--border-radius) - 2px);
  font-family: var(--font-secondary);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: var(--transition);
}

.search-button:hover {
  background: #b8860b;
  transform: translateY(-1px);
}

.search-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
}

.suggestion-label {
  font-family: var(--font-secondary);
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.suggestion-pill {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--text-dark);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-family: var(--font-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition);
}

.suggestion-pill:hover {
  background: var(--accent-gold);
  color: var(--primary-dark);
  border-color: var(--accent-gold);
}

/* Results Styling */
.search-results-container {
  max-width: 1000px;
  margin: 0 auto;
  display: none;
}

.search-results-container.active {
  display: block;
  animation: fadeInUp 0.5s ease;
}

.results-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: var(--border-radius);
}

.results-header h3 {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.property-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: var(--transition);
  border: 2px solid transparent;
}

.property-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  border-color: var(--accent-gold);
}

.property-image {
  width: 100%;
  height: 250px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.similarity-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--accent-gold);
  color: var(--primary-dark);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-family: var(--font-secondary);
  font-size: 0.8rem;
  font-weight: 600;
}

.property-content {
  padding: 1.5rem;
}

.property-address {
  font-family: var(--font-primary);
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.property-price {
  font-family: var(--font-secondary);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--accent-gold);
  margin-bottom: 1rem;
}

.property-description {
  font-family: var(--font-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.property-vibes {
  font-family: var(--font-secondary);
  font-size: 0.8rem;
  color: var(--accent-gold);
  font-style: italic;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .search-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-suggestions {
    justify-content: flex-start;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
// Clean Semantic Search Functionality
class NarissaSemanticSearch {
  constructor() {
    this.searchInput = document.getElementById('semantic-search');
    this.searchBtn = document.getElementById('search-btn');
    this.resultsContainer = document.getElementById('search-results');
    this.suggestions = document.querySelectorAll('.suggestion-pill');
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Search button
    this.searchBtn.addEventListener('click', () => this.performSearch());
    
    // Enter key
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });
    
    // Suggestion pills
    this.suggestions.forEach(pill => {
      pill.addEventListener('click', () => {
        this.searchInput.value = pill.dataset.query;
        this.performSearch();
      });
    });
  }

  async performSearch() {
    const query = this.searchInput.value.trim();
    if (!query) return;

    this.searchBtn.textContent = 'Searching...';
    this.searchBtn.disabled = true;

    try {
      // Connect to actual semantic search API
      const response = await fetch('http://localhost:5001/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 6 })
      });

      if (response.ok) {
        const data = await response.json();
        this.displayResults(data.results, query);
      } else {
        throw new Error('API unavailable');
      }
    } catch (error) {
      // Fallback to demo results
      this.displayDemoResults(query);
    } finally {
      this.searchBtn.textContent = 'Search Properties';
      this.searchBtn.disabled = false;
    }
  }

  displayResults(results, query) {
    if (!results?.length) {
      this.showNoResults(query);
      return;
    }

    let html = `
      <div class="results-header">
        <h3>Found ${results.length} properties matching "${query}"</h3>
        <p>Semantic search results based on vibe and feeling</p>
      </div>
      <div class="results-grid">
    `;

    results.forEach(property => {
      const score = Math.round((property.similarity_score || 0) * 100);
      const imageUrl = this.getPropertyImage(property, query);
      
      html += `
        <div class="property-card">
          <div class="property-image" style="background-image: url('${imageUrl}')">
            <div class="similarity-badge">${score}% Match</div>
          </div>
          <div class="property-content">
            <div class="property-address">${property.address}</div>
            <div class="property-price">$${property.price?.toLocaleString() || 'Price on request'}</div>
            <div class="property-description">${property.enhanced_description || property.description}</div>
            <div class="property-vibes">✨ ${property.vibes || 'Unique character'}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    this.resultsContainer.innerHTML = html;
    this.resultsContainer.classList.add('active');
    this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  getPropertyImage(property, query) {
    // Use Shacksearch.png for cottage/cabin queries
    if (query.toLowerCase().includes('merlin') || 
        query.toLowerCase().includes('shack') || 
        query.toLowerCase().includes('cottage') ||
        property.vibes?.includes('cottage') ||
        property.vibes?.includes('cabin')) {
      return 'assets/images/disney-assets/Shacksearch.png';
    }
    
    // Default property images
    return 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=400&h=250&fit=crop';
  }

  displayDemoResults(query) {
    const demoResults = [
      {
        address: "16100 Barbara Ct, Grass Valley",
        price: 645000,
        similarity_score: 0.72,
        enhanced_description: "Rustic log cabin nestled on 10 acres of mountain tranquility. Perfect hideaway with authentic woodsy charm.",
        vibes: "cottage, cabin, woodsy, peaceful, retreat"
      }
    ];
    
    this.displayResults(demoResults, query);
  }

  showNoResults(query) {
    this.resultsContainer.innerHTML = `
      <div class="results-header">
        <h3>No exact matches for "${query}"</h3>
        <p>Try searching for "luxury home", "mountain retreat", or "family estate"</p>
      </div>
    `;
    this.resultsContainer.classList.add('active');
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  new NarissaSemanticSearch();
});
</script>