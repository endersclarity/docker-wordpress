/* 🧙‍♂️ Merlin's Shack Cottage Search Functionality */

class CottageSearch {
  constructor() {
    this.searchInput = document.getElementById('merlin-search');
    this.searchBtn = document.querySelector('.magic-search-btn');
    this.resultsContainer = document.getElementById('search-results');
    this.cottageFrame = document.querySelector('.cottage-frame');
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Search button click
    this.searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.performSearch();
    });

    // Enter key press
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch();
      }
    });

    // Magic focus effects
    this.searchInput.addEventListener('focus', () => {
      this.cottageFrame.classList.add('focused');
    });

    this.searchInput.addEventListener('blur', () => {
      this.cottageFrame.classList.remove('focused');
    });
  }

  async performSearch() {
    const query = this.searchInput.value.trim();
    
    if (!query) {
      this.showMessage('✨ Enter your magical property wish to begin the search!');
      return;
    }

    // Add searching animation
    this.cottageFrame.classList.add('searching');
    this.searchBtn.innerHTML = '🔮 Searching...';
    this.searchBtn.disabled = true;

    try {
      // Call semantic search API
      const response = await fetch('/api/merlin-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          top_k: 5
        })
      });

      if (!response.ok) {
        throw new Error('Search spell failed');
      }

      const data = await response.json();
      this.displayResults(data.results, query);
      
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to demo results for now
      this.displayDemoResults(query);
    } finally {
      // Remove searching animation
      this.cottageFrame.classList.remove('searching');
      this.searchBtn.innerHTML = '🔮 Find Magic';
      this.searchBtn.disabled = false;
    }
  }

  displayResults(results, query) {
    if (!results || results.length === 0) {
      this.showMessage(`🏰 No magical properties found for "${query}". Try "hobbit house" or "luxury castle"!`);
      return;
    }

    let html = `<h3>🌟 Magical matches for "${query}":</h3>`;
    
    results.forEach(property => {
      const similarityPercent = Math.round((property.similarity_score || 0) * 100);
      
      html += `
        <div class="property-result">
          <div class="similarity-score">${similarityPercent}% Magic Match</div>
          <div class="property-address">${property.address}</div>
          <div class="property-price">$${property.price?.toLocaleString() || 'Price upon request'}</div>
          <div class="property-description">${property.enhanced_description || property.description}</div>
          <div class="property-vibes">✨ Vibes: ${property.vibes || 'Magical properties'}</div>
        </div>
      `;
    });

    this.resultsContainer.innerHTML = html;
    this.resultsContainer.classList.add('active');
    this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  displayDemoResults(query) {
    // Demo results when API is not available
    const demoResults = [
      {
        address: "16100 Barbara Ct, Grass Valley",
        price: 645000,
        similarity_score: 0.72,
        enhanced_description: "A rustic, cabin property nestled on 10 acres of mountain tranquility. This log cabin offers the perfect hideaway experience with woodsy charm and peaceful surroundings.",
        vibes: "mountain, intimate, hideaway, peaceful, woodsy"
      },
      {
        address: "456 Enchanted Woods Dr, Nevada City", 
        price: 520000,
        similarity_score: 0.65,
        enhanced_description: "Whimsical cottage tucked away in a serene forest setting. Stone and timber construction creates an authentic fairytale atmosphere.",
        vibes: "cottage, fairytale, forest, whimsical, charming"
      }
    ];

    this.displayResults(demoResults, query);
  }

  showMessage(message) {
    this.resultsContainer.innerHTML = `
      <div class="search-message">
        <p>${message}</p>
      </div>
    `;
    this.resultsContainer.classList.add('active');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CottageSearch();
});

// Add some magical interaction effects
document.addEventListener('DOMContentLoaded', () => {
  const cottageFrame = document.querySelector('.cottage-frame');
  
  // Add sparkle effects on hover
  cottageFrame.addEventListener('mouseenter', () => {
    createSparkles(cottageFrame);
  });
});

function createSparkles(container) {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.innerHTML = '✨';
      sparkle.style.position = 'absolute';
      sparkle.style.left = Math.random() * 80 + 10 + '%';
      sparkle.style.top = Math.random() * 80 + 10 + '%';
      sparkle.style.fontSize = '20px';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.animation = 'sparkle 1s ease-out forwards';
      sparkle.style.zIndex = '5';
      
      container.appendChild(sparkle);
      
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, 1000);
    }, i * 200);
  }
}