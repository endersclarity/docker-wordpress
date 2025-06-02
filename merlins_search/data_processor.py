#!/usr/bin/env python3
"""
Merlin's Shack Semantic Search - Data Processor
Enhances MLS listing descriptions for better vector embeddings and vibe-based search.
"""

import pandas as pd
import re
import json
from typing import Dict, List, Any

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
        
        # Creative/abstract concept mappings for enhanced semantic matching
        self.creative_mappings = {
            # Professional/Trade Associations
            'fish_monger': ['waterfront', 'commercial kitchen', 'large refrigeration', 'processing space', 'fresh air', 'maritime', 'coastal living'],
            'blacksmith': ['workshop', 'garage', 'industrial', 'metal working', 'forge space', 'creative studio', 'artisan'],
            'baker': ['large kitchen', 'commercial space', 'early riser', 'warmth', 'gathering place', 'community hub'],
            'artist': ['studio space', 'natural light', 'creative sanctuary', 'inspiring views', 'open concept', 'loft', 'workshop'],
            'writer': ['quiet retreat', 'library', 'secluded office', 'inspiring views', 'peaceful sanctuary', 'study'],
            'musician': ['sound isolation', 'studio space', 'performance area', 'acoustic design', 'creative retreat'],
            
            # Fantasy/Mythical Concepts
            'wizard': ['tower', 'stone', 'library', 'mysterious', 'ancient', 'secluded', 'magical', 'study'],
            'hobbit': ['cozy', 'underground', 'circular', 'garden', 'intimate', 'charming', 'earth-integrated'],
            'dragon': ['cave-like', 'stone', 'fortress', 'commanding views', 'treasure room', 'imposing', 'medieval'],
            'fairy': ['garden', 'whimsical', 'cottage', 'magical', 'flowers', 'enchanted', 'small-scale'],
            'merlin': ['magical', 'cottage', 'rustic', 'secluded', 'woodsy', 'character', 'whimsical', 'wise hermit'],
            'castle': ['grand', 'stone', 'towers', 'majestic', 'fortress', 'medieval', 'commanding'],
            
            # Lifestyle/Activity Concepts
            'hermit': ['secluded', 'private', 'off-grid', 'self-sufficient', 'retreat', 'solitude', 'wilderness'],
            'entertainer': ['large kitchen', 'open concept', 'party space', 'multiple living areas', 'outdoor entertaining'],
            'chef': ['gourmet kitchen', 'commercial appliances', 'herb garden', 'wine storage', 'dining space'],
            'gardener': ['greenhouse', 'garden space', 'potting shed', 'growing areas', 'nature lover', 'sustainable'],
            'collector': ['storage space', 'display areas', 'organized', 'climate control', 'security', 'vault-like'],
            'inventor': ['workshop', 'laboratory', 'creative space', 'electrical capacity', 'experimental', 'mad scientist'],
            
            # Abstract Concepts
            'sanctuary': ['peaceful', 'private', 'retreat', 'healing space', 'meditation', 'spiritual', 'quiet'],
            'fortress': ['secure', 'private', 'defensive', 'stone', 'commanding views', 'protected', 'stronghold'],
            'laboratory': ['workshop', 'clean lines', 'functional', 'experimental space', 'modern', 'sterile'],
            'library': ['quiet', 'studious', 'books', 'reading nooks', 'scholarly', 'intellectual', 'cozy'],
            'gallery': ['display space', 'natural light', 'open concept', 'artistic', 'sophisticated', 'museum-like'],
            'theater': ['performance space', 'dramatic', 'entertainment', 'stage-like', 'acoustic design'],
            
            # Size/Scale Concepts
            'mansion': ['grand', 'luxury', 'estate', 'formal', 'impressive', 'wealth', 'staff quarters'],
            'cottage': ['cozy', 'small', 'charming', 'intimate', 'garden', 'peaceful', 'quaint'],
            'cabin': ['rustic', 'woodsy', 'cozy', 'retreat', 'simple', 'natural materials'],
            'palace': ['opulent', 'grand', 'formal', 'luxury', 'regal', 'impressive', 'ceremonial'],
            'shack': ['simple', 'basic', 'rustic', 'humble', 'authentic', 'unpretentious', 'charming'],
            'compound': ['multiple buildings', 'family', 'expansive', 'estate', 'generational', 'self-contained'],
            
            # Emotional/Aspirational Concepts
            'dream_home': ['perfect', 'everything you want', 'ideal', 'fantasy', 'wish fulfillment'],
            'escape': ['retreat', 'getaway', 'peaceful', 'secluded', 'sanctuary', 'stress-free'],
            'adventure': ['exciting', 'unique', 'challenging', 'opportunity', 'potential', 'project'],
            'legacy': ['generational', 'estate', 'historic', 'timeless', 'inheritance', 'family seat']
        }

    def enhance_property_description(self, row: pd.Series) -> str:
        """Create enhanced, vibe-rich description for a property listing."""
        
        # Base information
        address = f"{row['Address - Street Complete']}, {row['Address - City']}"
        price = f"${row['List Price']:,.0f}" if pd.notna(row['List Price']) else "Price Available Upon Request"
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

    def create_creative_scenarios(self, row: pd.Series) -> List[str]:
        """Create creative lifestyle scenarios and metaphorical descriptions."""
        scenarios = []
        
        # Analyze property features for creative associations
        price = row['List Price'] if pd.notna(row['List Price']) else 0
        lot_acres = row['Lot Size - Acres'] if pd.notna(row['Lot Size - Acres']) else 0
        bedrooms = str(row['Bedrooms And Possible Bedrooms']) if pd.notna(row['Bedrooms And Possible Bedrooms']) else ''
        sqft = row['Square Footage'] if pd.notna(row['Square Footage']) else 0
        
        text_fields = [
            str(row['Public Remarks']) if pd.notna(row['Public Remarks']) else '',
            str(row['Exterior Features']) if pd.notna(row['Exterior Features']) else '',
            str(row['Architectural Style']) if pd.notna(row['Architectural Style']) else ''
        ]
        combined_text = ' '.join(text_fields).lower()
        
        # Professional/Trade Scenarios
        if 'kitchen' in combined_text and ('commercial' in combined_text or 'large' in combined_text or sqft > 3000):
            scenarios.append("Perfect fish monger's retreat with ample space for commercial food preparation and storage")
            scenarios.append("Ideal baker's sanctuary with expansive kitchen facilities for artisanal bread making")
            scenarios.append("Dream chef's laboratory with professional-grade space for culinary experimentation")
        
        if 'workshop' in combined_text or 'garage' in combined_text or 'barn' in combined_text:
            scenarios.append("Blacksmith's forge potential with substantial workspace for metalworking and artistic creation")
            scenarios.append("Inventor's laboratory ready for mad scientist experiments and creative breakthroughs")
            scenarios.append("Artisan's studio perfect for craftspeople requiring substantial work areas")
        
        # Fantasy/Mythical Scenarios
        if 'stone' in combined_text or 'tower' in combined_text or price > 1000000:
            scenarios.append("Wizard's tower commanding magical views over the kingdom below")
            scenarios.append("Dragon's lair with fortress-like privacy and treasure-room potential")
            scenarios.append("Medieval castle suitable for modern-day royalty and grand entertaining")
        
        if lot_acres >= 5 and 'private' in combined_text:
            scenarios.append("Merlin's enchanted woodland cottage where magic happens away from prying eyes")
            scenarios.append("Hermit's paradise offering complete solitude for contemplation and self-discovery")
            scenarios.append("Secret sanctuary where fairy folk might gather under moonlight")
        
        # Size-based Creative Descriptions
        if sqft < 1500:
            scenarios.append("Charming hobbit hole perfect for cozy living and unexpected adventures")
            scenarios.append("Intimate cottage where every corner tells a story of simple pleasures")
            scenarios.append("Quaint shack with authentic character that money can't buy")
        elif sqft > 4000:
            scenarios.append("Grand mansion worthy of hosting elaborate dinner parties and secret societies")
            scenarios.append("Sprawling palace where every room could house a different creative pursuit")
            scenarios.append("Estate compound suitable for multi-generational living or artist collective")
        
        # Location-based Scenarios
        if 'water' in combined_text or 'lake' in combined_text:
            scenarios.append("Waterfront fish monger's dream with direct access to fresh maritime bounty")
            scenarios.append("Lakeside philosopher's retreat perfect for deep contemplation and morning meditation")
            scenarios.append("Aquatic adventure base camp for water sports enthusiasts and fishing aficionados")
        
        if 'mountain' in combined_text or 'view' in combined_text:
            scenarios.append("Mountain wizard's observatory with commanding views for stargazing and spellcasting")
            scenarios.append("Eagle's nest retreat offering perspective on life's grand adventures")
            scenarios.append("Elevated sanctuary where artists find inspiration in dramatic vistas")
        
        # Lifestyle/Activity Scenarios
        if 'fireplace' in combined_text:
            scenarios.append("Storyteller's hearth where tales are spun by flickering firelight")
            scenarios.append("Writer's cozy sanctum perfect for crafting novels on stormy nights")
            scenarios.append("Gathering place for intellectual salons and intimate conversations")
        
        if 'garden' in combined_text or 'greenhouse' in combined_text:
            scenarios.append("Herbalist's paradise with space for growing magical ingredients and healing plants")
            scenarios.append("Fairy garden potential where whimsical landscaping creates enchanted outdoor rooms")
            scenarios.append("Sustainable living laboratory for modern homesteaders and environmental pioneers")
        
        # Emotional/Aspirational Scenarios
        if price < 400000:
            scenarios.append("Adventurer's base camp offering exciting potential for creative transformation")
            scenarios.append("Diamond in the rough waiting for vision and sweat equity investment")
            scenarios.append("Authentic character home where real life happens without pretense")
        elif price > 800000:
            scenarios.append("Legacy estate suitable for establishing family dynasties and generational wealth")
            scenarios.append("Dream home manifestation where fantasy becomes luxurious reality")
            scenarios.append("Investment in lifestyle excellence for those who demand the extraordinary")
        
        return scenarios

    def create_metaphorical_descriptions(self, row: pd.Series) -> List[str]:
        """Create metaphorical and poetic descriptions."""
        metaphors = []
        
        # Analyze property characteristics
        lot_acres = row['Lot Size - Acres'] if pd.notna(row['Lot Size - Acres']) else 0
        price = row['List Price'] if pd.notna(row['List Price']) else 0
        sqft = row['Square Footage'] if pd.notna(row['Square Footage']) else 0
        
        text_fields = [
            str(row['Public Remarks']) if pd.notna(row['Public Remarks']) else '',
            str(row['Architectural Style']) if pd.notna(row['Architectural Style']) else ''
        ]
        combined_text = ' '.join(text_fields).lower()
        
        # Space and Scale Metaphors
        if lot_acres >= 10:
            metaphors.append("A personal kingdom where your domain stretches to the horizon")
            metaphors.append("Your own private universe with room for all of life's adventures")
        elif lot_acres >= 2:
            metaphors.append("A generous canvas for painting your ideal lifestyle")
            metaphors.append("Breathing room in a world that often feels too small")
        
        # Architectural Metaphors
        if 'contemporary' in combined_text or 'modern' in combined_text:
            metaphors.append("A sleek vessel for sailing into the future of living")
            metaphors.append("Architectural poetry written in clean lines and open concepts")
        elif 'traditional' in combined_text or 'colonial' in combined_text:
            metaphors.append("A time capsule where history and comfort embrace")
            metaphors.append("Rooted like an ancient oak, offering stability in changing times")
        elif 'log' in combined_text or 'cabin' in combined_text:
            metaphors.append("A wooden symphony composed by nature's own architects")
            metaphors.append("Living inside a tree's dream of becoming shelter")
        
        # Emotional State Metaphors
        if 'private' in combined_text and lot_acres > 1:
            metaphors.append("A secret world where you're the main character in your own story")
            metaphors.append("Your personal refuge from civilization's constant noise")
        
        if 'view' in combined_text:
            metaphors.append("A daily painting that changes with light and season")
            metaphors.append("Nature's IMAX theater with front-row seats included")
        
        # Price Point Metaphors
        if price < 300000:
            metaphors.append("A diamond waiting for the right jeweler to reveal its brilliance")
            metaphors.append("An unfinished poem waiting for the perfect ending")
        elif price > 1000000:
            metaphors.append("A masterpiece that generations will admire and cherish")
            metaphors.append("Your personal Versailles scaled for modern royal living")
        
        return metaphors

    def enhance_property_description_creative(self, row: pd.Series) -> str:
        """Create highly creative, multi-layered descriptions for abstract semantic matching."""
        
        # Get the basic enhanced description
        basic_description = self.enhance_property_description(row)
        
        # Add creative scenarios
        scenarios = self.create_creative_scenarios(row)
        
        # Add metaphorical descriptions
        metaphors = self.create_metaphorical_descriptions(row)
        
        # Combine all elements
        creative_parts = [basic_description]
        
        # Add selected scenarios (limit to avoid overwhelming)
        if scenarios:
            creative_parts.extend(scenarios[:3])  # Top 3 scenarios
        
        # Add selected metaphors
        if metaphors:
            creative_parts.extend(metaphors[:2])  # Top 2 metaphors
        
        # Add comprehensive conceptual tags for better matching
        conceptual_tags = self.generate_conceptual_tags(row)
        if conceptual_tags:
            creative_parts.append(f"Conceptual matches: {', '.join(conceptual_tags)}")
        
        return ' '.join(creative_parts)
    
    def generate_conceptual_tags(self, row: pd.Series) -> List[str]:
        """Generate abstract conceptual tags that don't appear in literal description."""
        tags = []
        
        # Analyze property for abstract associations
        lot_acres = row['Lot Size - Acres'] if pd.notna(row['Lot Size - Acres']) else 0
        price = row['List Price'] if pd.notna(row['List Price']) else 0
        sqft = row['Square Footage'] if pd.notna(row['Square Footage']) else 0
        
        text_fields = [
            str(row['Public Remarks']) if pd.notna(row['Public Remarks']) else '',
            str(row['Exterior Features']) if pd.notna(row['Exterior Features']) else ''
        ]
        combined_text = ' '.join(text_fields).lower()
        
        # Professional/Trade Tags
        if 'kitchen' in combined_text:
            tags.extend(['culinary workspace', 'food artisan', 'commercial cooking', 'fish monger ready', 'baker friendly'])
        
        if 'workshop' in combined_text or 'garage' in combined_text:
            tags.extend(['maker space', 'blacksmith ready', 'artisan workshop', 'inventor laboratory', 'creative forge'])
        
        # Fantasy/Character Tags
        if lot_acres > 5:
            tags.extend(['hermit hideaway', 'wizard retreat', 'dragon lair potential', 'fairy kingdom', 'magical realm'])
        
        if 'stone' in combined_text or price > 800000:
            tags.extend(['castle vibes', 'fortress living', 'royal quarters', 'medieval manor', 'knight\'s stronghold'])
        
        # Lifestyle/Activity Tags
        if 'quiet' in combined_text or 'private' in combined_text:
            tags.extend(['writer\'s sanctuary', 'philosopher\'s den', 'artist studio space', 'meditation retreat'])
        
        if 'large' in combined_text or sqft > 3000:
            tags.extend(['entertainer\'s palace', 'collector\'s museum', 'family compound', 'generational estate'])
        
        # Emotional/Aspirational Tags
        tags.extend(['dream manifestation', 'lifestyle upgrade', 'adventure beginning', 'legacy building'])
        
        return list(set(tags))  # Remove duplicates

    def process_listings_csv(self, csv_path: str, output_path: str = None) -> pd.DataFrame:
        """Process the MLS CSV and create enhanced descriptions."""
        
        print(f"Loading MLS data from {csv_path}...")
        # Handle tab-separated format with potential parsing issues
        df = pd.read_csv(csv_path, sep='\t', quotechar='"', escapechar='\\', on_bad_lines='skip')
        
        print(f"Processing {len(df)} property listings...")
        
        # Create enhanced descriptions
        enhanced_data = []
        
        for idx, row in df.iterrows():
            try:
                enhanced_desc = self.enhance_property_description_creative(row)
                
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
    csv_path = "Listing.txt"
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
        print(f"Enhanced Description:")
        print(sample['enhanced_description'])
        print("="*80)