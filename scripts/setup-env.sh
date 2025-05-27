#!/bin/bash

# Environment Setup Script
# Generates secure environment files from templates

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔧 WordPress MCP Environment Setup"
echo "=================================="

# Function to generate secure random string
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length 2>/dev/null || \
    head -c $length /dev/urandom | base64 | tr -d "=+/" | cut -c1-$length
}

# Function to setup environment file
setup_environment() {
    local env=$1
    local template_file=".env.${env}.example"
    local target_file=".env.${env}"
    
    echo ""
    echo "Setting up $env environment..."
    
    if [[ ! -f "$template_file" ]]; then
        echo "❌ Template file $template_file not found"
        return 1
    fi
    
    if [[ -f "$target_file" ]]; then
        read -p "⚠️  $target_file already exists. Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping $env environment setup"
            return 0
        fi
    fi
    
    echo "📝 Generating $target_file from template..."
    cp "$template_file" "$target_file"
    
    # Generate secure passwords
    local mysql_password=$(generate_password 32)
    local mysql_root_password=$(generate_password 32)
    local redis_password=$(generate_password 32)
    
    # Replace placeholder passwords
    sed -i "s/your_secure_mysql_password_here/$mysql_password/g" "$target_file"
    sed -i "s/your_secure_root_password_here/$mysql_root_password/g" "$target_file"
    sed -i "s/your_secure_redis_password_here/$redis_password/g" "$target_file"
    
    # Generate WordPress security keys if placeholders exist
    if grep -q "your_.*_key_here\|your_.*_salt_here" "$target_file"; then
        echo "🔐 Generating WordPress security keys..."
        
        # Fetch WordPress salts from API
        local wp_salts
        wp_salts=$(curl -s https://api.wordpress.org/secret-key/1.1/salt/ || echo "")
        
        if [[ -n "$wp_salts" ]]; then
            # Extract individual keys from API response
            local auth_key=$(echo "$wp_salts" | grep "AUTH_KEY" | cut -d"'" -f4)
            local secure_auth_key=$(echo "$wp_salts" | grep "SECURE_AUTH_KEY" | cut -d"'" -f4)
            local logged_in_key=$(echo "$wp_salts" | grep "LOGGED_IN_KEY" | cut -d"'" -f4)
            local nonce_key=$(echo "$wp_salts" | grep "NONCE_KEY" | cut -d"'" -f4)
            local auth_salt=$(echo "$wp_salts" | grep "AUTH_SALT" | cut -d"'" -f4)
            local secure_auth_salt=$(echo "$wp_salts" | grep "SECURE_AUTH_SALT" | cut -d"'" -f4)
            local logged_in_salt=$(echo "$wp_salts" | grep "LOGGED_IN_SALT" | cut -d"'" -f4)
            local nonce_salt=$(echo "$wp_salts" | grep "NONCE_SALT" | cut -d"'" -f4)
            
            # Replace placeholders with actual keys
            sed -i "s/your_auth_key_here/$auth_key/g" "$target_file"
            sed -i "s/your_secure_auth_key_here/$secure_auth_key/g" "$target_file"
            sed -i "s/your_logged_in_key_here/$logged_in_key/g" "$target_file"
            sed -i "s/your_nonce_key_here/$nonce_key/g" "$target_file"
            sed -i "s/your_auth_salt_here/$auth_salt/g" "$target_file"
            sed -i "s/your_secure_auth_salt_here/$secure_auth_salt/g" "$target_file"
            sed -i "s/your_logged_in_salt_here/$logged_in_salt/g" "$target_file"
            sed -i "s/your_nonce_salt_here/$nonce_salt/g" "$target_file"
        else
            echo "⚠️  Failed to fetch WordPress keys from API. Please update manually."
        fi
    fi
    
    echo "✅ $target_file created successfully"
    echo "📋 Generated passwords for $env environment:"
    echo "   - MySQL Password: $mysql_password"
    echo "   - MySQL Root Password: $mysql_root_password"
    echo "   - Redis Password: $redis_password"
}

# Main execution
echo ""
echo "Available environments:"
echo "1. development"
echo "2. production"
echo "3. both"
echo ""

read -p "Which environment would you like to setup? (1/2/3): " choice

case $choice in
    1)
        setup_environment "development"
        ;;
    2)
        setup_environment "production"
        ;;
    3)
        setup_environment "development"
        setup_environment "production"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Review the generated .env files"
echo "   2. Update any custom configuration values"
echo "   3. Run: docker-compose up -d"
echo ""
echo "⚠️  Important: The .env files contain sensitive information."
echo "   Never commit them to version control!"