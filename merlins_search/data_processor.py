#!/usr/bin/env python3
"""
Merlin's Shack Semantic Search - Data Processor
Enhances MLS listing descriptions for better vector embeddings and vibe-based search.
"""

import pandas as pd
import re

class PropertyVibeEnhancer:
    """Enhances property descriptions to capture vibes and emotional context."""
    
    def __init__(self):
        # Define vibe mappings for different property characteristics
        self.vibe_mappings = {
            'architectural_styles': {
                'Victorian': ['classic', 'elegant', 'historical', 'ornate', 'grandeur', 'timeless'],
                'Contemporary': ['modern', 'sleek', 'minimalist', 'cutting-edge', 'sophisticated'],
                'Craftsman': ['artisanal', 'cozy', 'handcrafted', 'warm', 'character'],
                'Log': ['rustic', 'cabin', 'woodsy', 'natural', 'retreat', 'mountain'],
                'Cabin': ['cozy', 'intimate', 'rustic', 'hideaway', 'charming'],
                'Ranch': ['single-story', 'family-friendly', 'spacious', 'practical'],
                'Traditional': ['classic', 'family-oriented', 'established', 'comfortable'],
                'Mediterranean': ['luxury', 'resort-style', 'exotic', 'sophisticated'],
                'Colonial': ['stately', 'formal', 'traditional', 'prestigious']
            },
            'location_vibes': {
                'gated': ['exclusive', 'private', 'secure', 'elite', 'prestigious'],
                'acreage': ['spacious', 'private', 'expansive', 'freedom', 'nature'],
                'waterfront': ['serene', 'peaceful', 'tranquil', 'luxury'],
                'mountain': ['scenic', 'elevated', 'peaceful', 'retreat'],
                'rural': ['quiet', 'peaceful', 'escape', 'private', 'nature'],
                'downtown': ['convenient', 'walkable', 'vibrant', 'urban']
            },
            'lifestyle_vibes': {
                'horse': ['equestrian', 'rural', 'country', 'spacious', 'barn'],
                'pool': ['luxury', 'entertainment', 'resort-style', 'relaxation'],
                'workshop': ['creative', 'practical', 'maker', 'artisan'],
                'garden': ['green', 'peaceful', 'nature', 'growing', 'nurturing'],
                'wine': ['sophisticated', 'entertaining', 'luxury', 'collector'],
                'solar': ['sustainable', 'modern', 'eco-friendly', 'efficient'],
                'fireplace': ['cozy', 'warm', 'gathering', 'intimate']
            }
        }
        
        # Fantasy/vibe keywords for enhanced matching
        self.fantasy_mappings = {
            'merlin': ['magical', 'cottage', 'rustic', 'secluded', 'woodsy', 'character', 'whimsical'],
            'hobbit': ['cozy', 'underground', 'circular', 'garden', 'intimate', 'charming'],
            'castle': ['grand', 'stone', 'towers', 'majestic', 'fortress', 'medieval'],
            'mansion': ['grand', 'luxury', 'estate', 'formal', 'impressive', 'wealth'],
            'cottage': ['cozy', 'small', 'charming', 'intimate', 'garden', 'peaceful'],
            'retreat': ['private', 'peaceful', 'escape', 'secluded', 'relaxation'],
            'compound': ['multiple buildings', 'family', 'expansive', 'estate', 'generational']
        }

    def enhance_property_description(self, row: pd.Series) -> str:
        """Create enhanced, vibe-rich description for a property listing."""
        
        # Base information
        address = f"{row['Address - Street Complete']}, {row['Address - City']}"
        bedrooms = str(row['Bedrooms And Possible Bedrooms']).replace('(', 'up to ').replace(')', '') if pd.notna(row['Bedrooms And Possible Bedrooms']) else 'Multiple'
        bathrooms = str(int(row['Full Bathrooms'])) if pd.notna(row['Full Bathrooms']) else 'Multiple'
        sqft = f"{row['Square Footage']:,.0f}" if pd.notna(row['Square Footage']) else ''
        lot_size = f"{row['Lot Size - Acres']:.2f}" if pd.notna(row['Lot Size - Acres']) and row['Lot Size - Acres'] > 0 else ''
        
        # Extract architectural style vibes
        arch_vibes = []
        if pd.notna(row['Architectural Style']):
            styles = str(row['Architectural Style']).split(',')
            for style in styles:
                style = style.strip()
                if style in self.vibe_mappings['architectural_styles']:
                    arch_vibes.extend(self.vibe_mappings['architectural_styles'][style])
        
        # Extract location and lifestyle vibes from various fields
        location_vibes = []
        lifestyle_vibes = []
        
        # Analyze all text fields for vibe keywords
        text_fields = [
            str(row['Public Remarks']) if pd.notna(row['Public Remarks']) else '',
            str(row['Exterior Features']) if pd.notna(row['Exterior Features']) else '',
            str(row['Parking Features']) if pd.notna(row['Parking Features']) else '',
            str(row['Patio And Porch Features']) if pd.notna(row['Patio And Porch Features']) else ''
        ]
        
        combined_text = ' '.join(text_fields).lower()
        
        # Extract vibes based on content
        for category, mappings in self.vibe_mappings.items():
            if category == 'architectural_styles':
                continue  # Already handled above
            
            for keyword, vibes in mappings.items():
                if keyword.lower() in combined_text:
                    if category == 'location_vibes':
                        location_vibes.extend(vibes)
                    else:
                        lifestyle_vibes.extend(vibes)
        
        # Special property features
        special_features = []
        if pd.notna(row['Pool']) and str(row['Pool']).lower() == 'yes':
            special_features.append('pool and spa amenities')
            lifestyle_vibes.extend(['resort-style', 'luxury', 'entertainment'])
        
        if pd.notna(row['# of Fireplaces']) and row['# of Fireplaces'] > 0:
            special_features.append(f"{int(row['# of Fireplaces'])} fireplace{'s' if row['# of Fireplaces'] > 1 else ''}")
            lifestyle_vibes.extend(['cozy', 'warm', 'gathering'])
        
        if pd.notna(row['Lot Size - Acres']) and row['Lot Size - Acres'] >= 5:
            special_features.append('expansive acreage for privacy')
            location_vibes.extend(['spacious', 'private', 'estate-like'])
        
        # Build enhanced description
        enhanced_parts = []
        
        # Opening with vibe
        if arch_vibes:
            vibe_intro = f"A {', '.join(arch_vibes[:2])} property"
        else:
            vibe_intro = "A distinctive property"
        
        enhanced_parts.append(f"{vibe_intro} at {address}.")
        
        # Core details with vibe context
        if sqft:
            enhanced_parts.append(f"This {sqft} square foot home offers {bedrooms} bedrooms and {bathrooms} bathrooms.")
        else:
            enhanced_parts.append(f"This home features {bedrooms} bedrooms and {bathrooms} bathrooms.")
        
        if lot_size:
            enhanced_parts.append(f"Situated on {lot_size} acres, providing ample space and privacy.")
        
        # Special features with emotional context
        if special_features:
            enhanced_parts.append(f"Special features include {', '.join(special_features)}.")
        
        # Lifestyle description
        if lifestyle_vibes:
            unique_vibes = list(set(lifestyle_vibes))[:3]  # Top 3 unique vibes
            enhanced_parts.append(f"Perfect for those seeking a {', '.join(unique_vibes)} lifestyle.")
        
        # Original description (cleaned up)
        if pd.notna(row['Public Remarks']):
            original = str(row['Public Remarks'])
            # Clean up the original description
            original = re.sub(r'\s+', ' ', original)  # Multiple spaces
            original = original.strip()
            if len(original) > 50:  # Only include if substantial
                enhanced_parts.append(original)
        
        # Add vibe tags for better matching
        all_vibes = list(set(arch_vibes + location_vibes + lifestyle_vibes))
        if all_vibes:
            vibe_tags = ', '.join(all_vibes[:5])  # Top 5 vibes
            enhanced_parts.append(f"Vibes: {vibe_tags}.")
        
        return ' '.join(enhanced_parts)

    def process_listings_csv(self, csv_path: str, output_path: str = None) -> pd.DataFrame:
        """Process the MLS CSV and create enhanced descriptions."""
        
        print(f"Loading MLS data from {csv_path}...")
        # Handle potential parsing issues with quotes in descriptions
        df = pd.read_csv(csv_path, quotechar='"', escapechar='\\', on_bad_lines='skip')
        
        print(f"Processing {len(df)} property listings...")
        
        # Create enhanced descriptions
        enhanced_data = []
        
        for idx, row in df.iterrows():
            try:
                enhanced_desc = self.enhance_property_description(row)
                
                property_data = {
                    'listing_id': row['Listing Number'],
                    'address': f"{row['Address - Street Complete']}, {row['Address - City']}",
                    'city': row['Address - City'],
                    'zip_code': row['Address - Zip Code'],
                    'price': row['List Price'] if pd.notna(row['List Price']) else 0,
                    'bedrooms': row['Bedrooms And Possible Bedrooms'],
                    'bathrooms': row['Full Bathrooms'] if pd.notna(row['Full Bathrooms']) else 0,
                    'sqft': row['Square Footage'] if pd.notna(row['Square Footage']) else 0,
                    'lot_acres': row['Lot Size - Acres'] if pd.notna(row['Lot Size - Acres']) else 0,
                    'architectural_style': row['Architectural Style'],
                    'original_description': row['Public Remarks'],
                    'enhanced_description': enhanced_desc,
                    'status': row['Status'],
                    'days_on_market': row['DOM'] if pd.notna(row['DOM']) else 0
                }
                
                enhanced_data.append(property_data)
                
                if (idx + 1) % 10 == 0:
                    print(f"Processed {idx + 1} properties...")
                    
            except Exception as e:
                print(f"Error processing row {idx}: {e}")
                continue
        
        enhanced_df = pd.DataFrame(enhanced_data)
        
        if output_path:
            enhanced_df.to_json(output_path, orient='records', indent=2)
            print(f"Enhanced data saved to {output_path}")
        
        print(f"Successfully processed {len(enhanced_df)} properties")
        return enhanced_df

if __name__ == "__main__":
    enhancer = PropertyVibeEnhancer()
    
    # Process the MLS data
    csv_path = "../Listing.csv"
    output_path = "enhanced_listings.json"
    
    enhanced_df = enhancer.process_listings_csv(csv_path, output_path)
    
    # Show a sample enhanced description
    if len(enhanced_df) > 0:
        print("\n" + "="*80)
        print("SAMPLE ENHANCED DESCRIPTION:")
        print("="*80)
        sample = enhanced_df.iloc[0]
        print(f"Address: {sample['address']}")
        print(f"Price: ${sample['price']:,.0f}")
        print("Enhanced Description:")
        print(sample['enhanced_description'])
        print("="*80)