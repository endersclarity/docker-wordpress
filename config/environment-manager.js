#!/usr/bin/env node
/**
 * Environment-based Configuration Management System
 * Manages configuration across development, staging, and production environments
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EnvironmentManager {
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        this.configDir = path.join(projectRoot, 'config');
        this.environmentsDir = path.join(this.configDir, 'environments');
        this.templatesDir = path.join(this.configDir, 'templates');
        
        // Supported environments
        this.environments = ['development', 'staging', 'production'];
        
        // Configuration schema
        this.configSchema = {
            environment: { required: true, type: 'string' },
            wordpress: {
                url: { required: true, type: 'string' },
                version: { required: false, type: 'string', default: '6.4-fpm-alpine' },
                debug: { required: false, type: 'boolean', default: false },
                memory_limit: { required: false, type: 'string', default: '256M' }
            },
            database: {
                host: { required: false, type: 'string', default: 'mysql' },
                name: { required: true, type: 'string' },
                user: { required: true, type: 'string' },
                password: { required: true, type: 'string' },
                root_password: { required: true, type: 'string' }
            },
            redis: {
                enabled: { required: false, type: 'boolean', default: true },
                password: { required: true, type: 'string' },
                max_memory: { required: false, type: 'string', default: '256mb' }
            },
            ssl: {
                enabled: { required: false, type: 'boolean', default: false },
                force_admin: { required: false, type: 'boolean', default: false },
                cert_path: { required: false, type: 'string' },
                key_path: { required: false, type: 'string' }
            },
            security: {
                file_edit_disabled: { required: false, type: 'boolean', default: true },
                auto_updates_disabled: { required: false, type: 'boolean', default: true },
                post_revisions: { required: false, type: 'number', default: 3 }
            },
            performance: {
                mysql_buffer_pool: { required: false, type: 'string', default: '256M' },
                mysql_max_connections: { required: false, type: 'number', default: 100 },
                nginx_worker_processes: { required: false, type: 'string', default: 'auto' }
            },
            backup: {
                enabled: { required: false, type: 'boolean', default: true },
                schedule: { required: false, type: 'string', default: '0 2 * * *' },
                retention_days: { required: false, type: 'number', default: 30 }
            },
            monitoring: {
                enabled: { required: false, type: 'boolean', default: false },
                prometheus_enabled: { required: false, type: 'boolean', default: false },
                grafana_enabled: { required: false, type: 'boolean', default: false }
            }
        };
    }

    // Initialize the configuration management system
    async initialize() {
        this.log('Initializing environment configuration management...');
        
        // Create necessary directories
        await this.createDirectories();
        
        // Create default configuration templates
        await this.createTemplates();
        
        // Create environment-specific configurations
        await this.createEnvironmentConfigs();
        
        this.log('Environment configuration management initialized successfully');
    }

    // Create necessary directories
    async createDirectories() {
        const dirs = [this.configDir, this.environmentsDir, this.templatesDir];
        
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.log(`Created directory: ${dir}`);
            }
        }
    }

    // Create configuration templates
    async createTemplates() {
        const templates = {
            'docker-compose.template.yml': this.getDockerComposeTemplate(),
            'nginx.template.conf': this.getNginxTemplate(),
            'env.template': this.getEnvTemplate()
        };

        for (const [filename, content] of Object.entries(templates)) {
            const filepath = path.join(this.templatesDir, filename);
            if (!fs.existsSync(filepath)) {
                fs.writeFileSync(filepath, content);
                this.log(`Created template: ${filename}`);
            }
        }
    }

    // Create environment-specific configurations
    async createEnvironmentConfigs() {
        for (const env of this.environments) {
            const configPath = path.join(this.environmentsDir, `${env}.json`);
            
            if (!fs.existsSync(configPath)) {
                const config = this.getDefaultConfig(env);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                this.log(`Created ${env} configuration`);
            }
        }
    }

    // Get default configuration for an environment
    getDefaultConfig(environment) {
        const baseConfig = {
            environment: environment,
            wordpress: {
                url: environment === 'production' ? 'https://your-domain.com' : `http://localhost:${8090 + this.environments.indexOf(environment)}`,
                version: '6.4-fpm-alpine',
                debug: environment !== 'production',
                memory_limit: environment === 'production' ? '512M' : '256M'
            },
            database: {
                host: 'mysql',
                name: 'wordpress',
                user: 'wordpress',
                password: this.generateSecurePassword(),
                root_password: this.generateSecurePassword()
            },
            redis: {
                enabled: true,
                password: this.generateSecurePassword(),
                max_memory: environment === 'production' ? '512mb' : '256mb'
            },
            ssl: {
                enabled: environment === 'production',
                force_admin: environment === 'production',
                cert_path: '/etc/nginx/ssl/cert.pem',
                key_path: '/etc/nginx/ssl/private.key'
            },
            security: {
                file_edit_disabled: environment === 'production',
                auto_updates_disabled: environment === 'production',
                post_revisions: environment === 'production' ? 3 : 5
            },
            performance: {
                mysql_buffer_pool: environment === 'production' ? '1024M' : '256M',
                mysql_max_connections: environment === 'production' ? 200 : 100,
                nginx_worker_processes: 'auto'
            },
            backup: {
                enabled: environment !== 'development',
                schedule: '0 2 * * *',
                retention_days: environment === 'production' ? 30 : 7
            },
            monitoring: {
                enabled: environment === 'production',
                prometheus_enabled: environment === 'production',
                grafana_enabled: environment === 'production'
            }
        };

        // Add WordPress security keys
        baseConfig.wordpress.security_keys = this.generateWordPressKeys();

        return baseConfig;
    }

    // Generate secure password
    generateSecurePassword(length = 32) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    // Generate WordPress security keys
    generateWordPressKeys() {
        const keyNames = [
            'AUTH_KEY', 'SECURE_AUTH_KEY', 'LOGGED_IN_KEY', 'NONCE_KEY',
            'AUTH_SALT', 'SECURE_AUTH_SALT', 'LOGGED_IN_SALT', 'NONCE_SALT'
        ];

        const keys = {};
        keyNames.forEach(keyName => {
            keys[keyName] = this.generateSecurePassword(64);
        });

        return keys;
    }

    // Load configuration for a specific environment
    loadEnvironmentConfig(environment) {
        if (!this.environments.includes(environment)) {
            throw new Error(`Invalid environment: ${environment}`);
        }

        const configPath = path.join(this.environmentsDir, `${environment}.json`);
        
        if (!fs.existsSync(configPath)) {
            throw new Error(`Configuration not found for environment: ${environment}`);
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return this.validateConfig(config);
    }

    // Validate configuration against schema
    validateConfig(config) {
        const errors = [];
        
        const validateObject = (obj, schema, path = '') => {
            for (const [key, definition] of Object.entries(schema)) {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (typeof definition === 'object' && definition.type) {
                    // Leaf node validation
                    const value = obj[key];
                    
                    if (definition.required && (value === undefined || value === null)) {
                        errors.push(`Required field missing: ${currentPath}`);
                        continue;
                    }
                    
                    if (value !== undefined && typeof value !== definition.type) {
                        errors.push(`Invalid type for ${currentPath}: expected ${definition.type}, got ${typeof value}`);
                    }
                } else if (typeof definition === 'object') {
                    // Nested object validation
                    if (obj[key] && typeof obj[key] === 'object') {
                        validateObject(obj[key], definition, currentPath);
                    }
                }
            }
        };

        validateObject(config, this.configSchema);

        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }

        return config;
    }

    // Generate environment files
    async generateEnvironmentFiles(environment) {
        this.log(`Generating environment files for: ${environment}`);
        
        const config = this.loadEnvironmentConfig(environment);
        
        // Generate .env file
        await this.generateEnvFile(config, environment);
        
        // Generate Docker Compose override
        await this.generateDockerComposeOverride(config, environment);
        
        // Generate Nginx configuration
        await this.generateNginxConfig(config, environment);
        
        this.log(`Environment files generated for: ${environment}`);
    }

    // Generate .env file
    async generateEnvFile(config, environment) {
        const envContent = `# Environment: ${environment}
# Generated on: ${new Date().toISOString()}

# WordPress Configuration
WORDPRESS_URL=${config.wordpress.url}
WORDPRESS_VERSION=${config.wordpress.version}
WP_ENVIRONMENT_TYPE=${environment}
WP_DEBUG=${config.wordpress.debug}
WP_MEMORY_LIMIT=${config.wordpress.memory_limit}
WP_MAX_MEMORY_LIMIT=${config.wordpress.memory_limit}

# Database Configuration
MYSQL_DATABASE=${config.database.name}
MYSQL_USER=${config.database.user}
MYSQL_PASSWORD=${config.database.password}
MYSQL_ROOT_PASSWORD=${config.database.root_password}
MYSQL_INNODB_BUFFER_POOL_SIZE=${config.performance.mysql_buffer_pool}
MYSQL_MAX_CONNECTIONS=${config.performance.mysql_max_connections}

# Redis Configuration
REDIS_PASSWORD=${config.redis.password}
REDIS_MAX_MEMORY=${config.redis.max_memory}

# SSL Configuration
FORCE_SSL_ADMIN=${config.ssl.force_admin}
SSL_CERT_PATH=${config.ssl.cert_path}
SSL_KEY_PATH=${config.ssl.key_path}

# Security Configuration
DISALLOW_FILE_EDIT=${config.security.file_edit_disabled}
AUTOMATIC_UPDATER_DISABLED=${config.security.auto_updates_disabled}
WP_POST_REVISIONS=${config.security.post_revisions}

# WordPress Security Keys
${Object.entries(config.wordpress.security_keys).map(([key, value]) => `WORDPRESS_${key}=${value}`).join('\n')}

# Backup Configuration
BACKUP_SCHEDULE=${config.backup.schedule}
BACKUP_RETENTION_DAYS=${config.backup.retention_days}

# Data Paths
WP_DATA_PATH=./data/wordpress
MYSQL_DATA_PATH=./data/mysql
REDIS_DATA_PATH=./data/redis
`;

        const envPath = path.join(this.projectRoot, `.env.${environment}`);
        fs.writeFileSync(envPath, envContent);
        this.log(`Generated .env.${environment}`);
    }

    // Generate Docker Compose override
    async generateDockerComposeOverride(config, environment) {
        // Implementation would generate environment-specific docker-compose overrides
        this.log(`Docker Compose override generation for ${environment} - placeholder`);
    }

    // Generate Nginx configuration
    async generateNginxConfig(config, environment) {
        // Implementation would generate environment-specific nginx configurations
        this.log(`Nginx configuration generation for ${environment} - placeholder`);
    }

    // Switch to a specific environment
    async switchEnvironment(environment) {
        this.log(`Switching to environment: ${environment}`);
        
        if (!this.environments.includes(environment)) {
            throw new Error(`Invalid environment: ${environment}`);
        }

        // Generate environment files
        await this.generateEnvironmentFiles(environment);
        
        // Copy environment-specific .env file to .env
        const sourceEnv = path.join(this.projectRoot, `.env.${environment}`);
        const targetEnv = path.join(this.projectRoot, '.env');
        
        if (fs.existsSync(sourceEnv)) {
            fs.copyFileSync(sourceEnv, targetEnv);
            this.log(`Activated .env.${environment} as .env`);
        }
        
        this.log(`Successfully switched to ${environment} environment`);
    }

    // Get templates (placeholder implementations)
    getDockerComposeTemplate() {
        return '# Docker Compose template placeholder';
    }

    getNginxTemplate() {
        return '# Nginx template placeholder';
    }

    getEnvTemplate() {
        return '# Environment template placeholder';
    }

    // Logging utility
    log(message) {
        console.log(`[ENV-MANAGER] ${new Date().toISOString()} - ${message}`);
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const environment = args[1];

    const manager = new EnvironmentManager();

    try {
        switch (command) {
            case 'init':
                await manager.initialize();
                break;
                
            case 'switch':
                if (!environment) {
                    throw new Error('Environment parameter required for switch command');
                }
                await manager.switchEnvironment(environment);
                break;
                
            case 'generate':
                if (!environment) {
                    throw new Error('Environment parameter required for generate command');
                }
                await manager.generateEnvironmentFiles(environment);
                break;
                
            case 'validate':
                if (!environment) {
                    throw new Error('Environment parameter required for validate command');
                }
                const config = manager.loadEnvironmentConfig(environment);
                console.log(`✅ Configuration for ${environment} is valid`);
                break;
                
            case 'list':
                console.log('Available environments:', manager.environments.join(', '));
                break;
                
            default:
                console.log(`
Environment Configuration Manager

Usage: node environment-manager.js <command> [environment]

Commands:
  init                    - Initialize configuration management
  switch <env>           - Switch to specified environment
  generate <env>         - Generate files for specified environment
  validate <env>         - Validate configuration for environment
  list                   - List available environments

Environments: ${manager.environments.join(', ')}
                `);
                break;
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Export for programmatic use
module.exports = EnvironmentManager;

// Run CLI if called directly
if (require.main === module) {
    main();
}