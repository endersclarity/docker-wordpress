/**
 * Merlin's Cottage Search - JavaScript Implementation
 * Connects Disney-themed UI to semantic search API
 */

class CottageSearch {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5001'; // Our optimized semantic search API
        this.currentQuery = '';
        this.currentFilters = {};
        this.searchTimeout = null;
        this.isSearching = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupElements();
        console.log('🧙‍♂️ Merlin\'s Cottage Search initialized');
    }

    bindEvents() {
        // Search form submission
        const searchForm = document.getElementById('cottage-search-form');
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });

        // Real-time search with debouncing
        const searchInput = document.getElementById('search-query');
        searchInput.addEventListener('input', (e) => {
            this.debounceSearch(e.target.value);
        });

        // Filter changes
        const propertyType = document.getElementById('property-type');
        const priceRange = document.getElementById('price-range');
        
        propertyType.addEventListener('change', () => this.updateFilters());
        priceRange.addEventListener('change', () => this.updateFilters());

        // Toggle filters
        const toggleFilters = document.getElementById('toggle-filters');
        toggleFilters.addEventListener('click', this.toggleAdvancedFilters);
    }

    setupElements() {
        // Hide advanced filters initially
        const filterGroups = document.querySelectorAll('.filter-group');
        filterGroups.forEach(group => {
            group.style.display = 'none';
        });
    }

    debounceSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            if (query.length >= 3) {
                this.performSearch(query);
            } else if (query.length === 0) {
                this.clearResults();
            }
        }, 500);
    }

    async performSearch(query = null) {
        if (this.isSearching) return;

        const searchQuery = query || document.getElementById('search-query').value;
        if (!searchQuery.trim()) {
            this.showError('Please enter a search term');
            return;
        }

        this.isSearching = true;
        this.currentQuery = searchQuery;
        this.showLoadingState();

        try {
            const searchParams = {
                query: searchQuery,
                ...this.currentFilters,
                limit: 20
            };

            console.log('🔮 Performing search:', searchParams);

            const response = await this.callSearchAPI(searchParams);
            this.displayResults(response);

        } catch (error) {
            console.error('Search error:', error);
            this.showError('Magic temporarily unavailable. Please try again.');
        } finally {
            this.isSearching = false;
            this.hideLoadingState();
        }
    }

    async callSearchAPI(params) {
        console.log('🌟 Calling semantic search API with params:', params);
        
        try {
            // Call the actual semantic search API
            const response = await fetch(`${this.apiBaseUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: params.query,
                    top_k: params.limit || 10
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Transform API response to expected format
            return {
                results: data.properties || [],
                total: data.total || 0,
                query: params.query,
                api_response: data
            };

        } catch (error) {
            console.error('API call failed, falling back to mock data:', error);
            
            // Fallback to mock data if API fails
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.getMockSearchResults(params.query);
        }
    }

    getMockSearchResults(query) {
        // Mock data for development - replace with actual API integration
        const mockProperties = [
            {
                id: 1,
                title: "Enchanted Forest Cabin",
                price: 450000,
                description: "Cozy log cabin nestled in the magical forests of Nevada County. Features rustic charm with modern amenities.",
                location: "Nevada City, CA",
                bedrooms: 2,
                bathrooms: 1,
                sqft: 1200,
                similarity_score: 0.85,
                image_url: "https://via.placeholder.com/400x300/228B22/FFFFFF?text=Forest+Cabin"
            },
            {
                id: 2,
                title: "Merlin's Mountain Retreat",
                price: 675000,
                description: "Mystical mountain property with panoramic views. Perfect for the aspiring wizard seeking solitude.",
                location: "Grass Valley, CA",
                bedrooms: 3,
                bathrooms: 2,
                sqft: 1800,
                similarity_score: 0.78,
                image_url: "https://via.placeholder.com/400x300/4169E1/FFFFFF?text=Mountain+Retreat"
            },
            {
                id: 3,
                title: "Fairy Tale Cottage",
                price: 320000,
                description: "Charming cottage with whimsical garden. Features stone fireplace and cottage-style architecture.",
                location: "Penn Valley, CA",
                bedrooms: 2,
                bathrooms: 1,
                sqft: 900,
                similarity_score: 0.72,
                image_url: "https://via.placeholder.com/400x300/FF69B4/FFFFFF?text=Fairy+Cottage"
            }
        ];

        // Filter based on query relevance
        const relevantProperties = mockProperties.filter(property => 
            property.title.toLowerCase().includes(query.toLowerCase()) ||
            property.description.toLowerCase().includes(query.toLowerCase())
        );

        return {
            results: relevantProperties.length > 0 ? relevantProperties : mockProperties,
            total: relevantProperties.length || mockProperties.length,
            query: query
        };
    }

    displayResults(response) {
        const resultsContainer = document.getElementById('search-results');
        const resultsHeader = document.getElementById('results-header');
        const resultsCount = document.getElementById('results-count');
        const resultsGrid = document.getElementById('results-grid');
        const noResults = document.getElementById('no-results');

        // Clear previous results
        resultsGrid.innerHTML = '';
        this.hideAllStates();

        if (response.results && response.results.length > 0) {
            // Show results
            resultsHeader.classList.remove('hidden');
            resultsCount.textContent = `Found ${response.total} magical properties for "${response.query}"`;

            response.results.forEach(property => {
                const propertyCard = this.createPropertyCard(property);
                resultsGrid.appendChild(propertyCard);
            });

            // Animate results in
            setTimeout(() => {
                resultsGrid.classList.add('fade-in');
            }, 100);

        } else {
            // Show no results
            noResults.classList.remove('hidden');
        }
    }

    createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.onclick = () => this.showPropertyModal(property);

        // Handle optimized API response format and fallback to mock data
        const title = property.address || property.title || 'Property';
        const price = property.price || 0;
        const location = property.city || property.location || 'Nevada County, CA';
        const beds = property.bedrooms || 'N/A';
        const baths = property.bathrooms || 'N/A';
        const sqft = property.sqft || 'N/A';
        const description = property.enhanced_description || property.description || 'Beautiful property in Nevada County';
        const similarityScore = property.similarity_score || property.score || 0;
        const imageUrl = property.image_url || `https://via.placeholder.com/400x300/228B22/FFFFFF?text=${encodeURIComponent(title)}`;

        const similarityPercentage = Math.round(similarityScore * 100);
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${title}" class="property-image" 
                 onerror="this.src='https://via.placeholder.com/400x300/cccccc/666666?text=Property+Image'">
            <div class="property-content">
                <h3 class="property-title">${this.escapeHtml(title)}</h3>
                <div class="property-price">$${parseInt(price).toLocaleString()}</div>
                <div class="property-details">
                    📍 ${this.escapeHtml(location)}<br>
                    🛏️ ${beds} bed • 🛁 ${baths} bath • 📐 ${sqft} sqft
                </div>
                <p class="property-description">${this.escapeHtml(this.truncateText(description, 120))}</p>
                <div class="similarity-score">
                    ✨ ${similarityPercentage}% magical match
                </div>
            </div>
        `;

        return card;
    }

    showPropertyModal(property) {
        const modal = document.getElementById('property-modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <div style="padding: 30px;">
                <img src="${property.image_url}" alt="${property.title}" 
                     style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;"
                     onerror="this.src='https://via.placeholder.com/600x300/cccccc/666666?text=Property+Image'">
                <h2 style="color: #1565c0; margin-bottom: 10px;">${property.title}</h2>
                <div style="font-size: 1.8rem; color: #2e7d32; font-weight: bold; margin-bottom: 15px;">
                    $${property.price.toLocaleString()}
                </div>
                <div style="margin-bottom: 20px; color: #666;">
                    📍 ${property.location}<br>
                    🛏️ ${property.bedrooms} bedrooms • 🛁 ${property.bathrooms} bathrooms • 📐 ${property.sqft} sqft
                </div>
                <p style="line-height: 1.6; margin-bottom: 20px; color: #333;">
                    ${property.description}
                </p>
                <div style="background: linear-gradient(45deg, #ffd700, #ffed4e); color: #333; padding: 15px; border-radius: 10px; text-align: center;">
                    <strong>✨ ${Math.round(property.similarity_score * 100)}% Magical Match</strong>
                    <br>
                    <small>This property matches your search criteria</small>
                </div>
                <div style="margin-top: 25px; text-align: center;">
                    <button onclick="this.openExternalLink('${property.id}')" 
                            style="background: #1565c0; color: white; border: none; padding: 15px 30px; border-radius: 25px; font-size: 1.1rem; cursor: pointer;">
                        View Full Details
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('property-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    updateFilters() {
        const propertyType = document.getElementById('property-type').value;
        const priceRange = document.getElementById('price-range').value;

        this.currentFilters = {
            property_type: propertyType || null,
            price_range: priceRange || null
        };

        // Re-run search if there's a current query
        if (this.currentQuery) {
            this.performSearch();
        }
    }

    toggleAdvancedFilters() {
        const filterGroups = document.querySelectorAll('.filter-group');
        const arrow = document.querySelector('.filter-arrow');
        const isVisible = filterGroups[0].style.display !== 'none';

        filterGroups.forEach(group => {
            group.style.display = isVisible ? 'none' : 'flex';
        });

        arrow.textContent = isVisible ? '▼' : '▲';
    }

    showLoadingState() {
        const searchStatus = document.getElementById('search-status');
        this.hideAllStates();
        searchStatus.classList.remove('hidden');
    }

    hideLoadingState() {
        const searchStatus = document.getElementById('search-status');
        searchStatus.classList.add('hidden');
    }

    showError(message) {
        const errorState = document.getElementById('error-state');
        errorState.querySelector('p').textContent = message;
        this.hideAllStates();
        errorState.classList.remove('hidden');
    }

    hideAllStates() {
        const states = ['search-status', 'results-header', 'no-results', 'error-state'];
        states.forEach(stateId => {
            document.getElementById(stateId).classList.add('hidden');
        });
    }

    clearResults() {
        document.getElementById('results-grid').innerHTML = '';
        this.hideAllStates();
    }

    clearSearch() {
        document.getElementById('search-query').value = '';
        document.getElementById('property-type').value = '';
        document.getElementById('price-range').value = '';
        this.currentQuery = '';
        this.currentFilters = {};
        this.clearResults();
    }

    retrySearch() {
        if (this.currentQuery) {
            this.performSearch();
        }
    }

    openExternalLink(propertyId) {
        // Open property details in new tab/window
        console.log('Opening property details for ID:', propertyId);
        // Replace with actual property detail URL
        window.open(`/property/${propertyId}`, '_blank');
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    formatPrice(price) {
        const numPrice = parseInt(price) || 0;
        return numPrice.toLocaleString();
    }
}

// Global functions for modal and utility actions
function closeModal() {
    if (window.cottageSearch) {
        window.cottageSearch.closeModal();
    }
}

function clearSearch() {
    if (window.cottageSearch) {
        window.cottageSearch.clearSearch();
    }
}

function retrySearch() {
    if (window.cottageSearch) {
        window.cottageSearch.retrySearch();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cottageSearch = new CottageSearch();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CottageSearch;
}