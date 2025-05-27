# WordPress Production Deployment Guide

This guide covers deploying WordPress in a production environment with SSL/TLS termination, Redis caching, automated backups, and comprehensive security hardening.

## 🏗️ Architecture Overview

The production deployment includes:

- **Nginx**: Reverse proxy with SSL/TLS termination and security headers
- **WordPress**: PHP-FPM with security hardening and performance optimization
- **MySQL 8.0**: Database with production optimizations
- **Redis**: Object caching and session storage
- **Automated Backups**: Database and file backups with retention
- **Security**: Rate limiting, security headers, file permissions

## 🚀 Quick Start

1. **Copy environment configuration:**
   ```bash
   cp .env.production .env
   ```

2. **Edit configuration:**
   ```bash
   nano .env
   ```
   Update the following required fields:
   - `DOMAIN_NAME`: Your domain name
   - `WORDPRESS_URL`: Your full WordPress URL
   - `MYSQL_PASSWORD`: Secure database password
   - `MYSQL_ROOT_PASSWORD`: Secure root password
   - `REDIS_PASSWORD`: Secure Redis password
   - WordPress security keys (generate at [WordPress.org](https://api.wordpress.org/secret-key/1.1/salt/))

3. **Deploy production environment:**
   ```bash
   ./scripts/deploy-production.sh
   ```

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- OpenSSL (for SSL certificate generation)
- 4GB+ RAM recommended
- 20GB+ disk space

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DOMAIN_NAME` | Your domain name | - | ✅ |
| `WORDPRESS_URL` | Full WordPress URL | - | ✅ |
| `MYSQL_PASSWORD` | Database password | - | ✅ |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | - | ✅ |
| `REDIS_PASSWORD` | Redis password | - | ✅ |
| `WORDPRESS_AUTH_KEY` | WordPress auth key | - | ✅ |
| `WP_ENVIRONMENT_TYPE` | Environment type | production | ❌ |
| `WP_DEBUG` | Enable debugging | false | ❌ |
| `FORCE_SSL_ADMIN` | Force SSL for admin | true | ❌ |

### SSL/TLS Configuration

The deployment script generates self-signed certificates for development. For production:

1. **Let's Encrypt (Recommended):**
   ```bash
   # Install certbot
   sudo apt-get install certbot
   
   # Generate certificate
   sudo certbot certonly --webroot -w ./data/wordpress -d your-domain.com
   
   # Copy certificates
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/private.key
   ```

2. **Commercial Certificate:**
   - Place certificate in `./ssl/cert.pem`
   - Place private key in `./ssl/private.key`
   - Ensure DH parameters exist: `./ssl/dhparam.pem`

### Performance Tuning

#### MySQL Optimization
```env
MYSQL_INNODB_BUFFER_POOL_SIZE=1024M
MYSQL_MAX_CONNECTIONS=200
```

#### Redis Configuration
```env
REDIS_MAX_MEMORY=512mb
```

#### WordPress Memory
```env
WP_MEMORY_LIMIT=512M
WP_MAX_MEMORY_LIMIT=768M
```

## 🔒 Security Features

### Nginx Security
- SSL/TLS termination with modern ciphers
- Security headers (HSTS, CSP, X-Frame-Options)
- Rate limiting (login attempts, API calls)
- Request size limits
- Static file security

### WordPress Security
- File editing disabled in admin
- Automatic updates disabled
- Debug mode disabled
- Secure file permissions
- Read-only containers where possible

### Container Security
- Non-root user execution
- Security options (`no-new-privileges`)
- Read-only filesystems
- Minimal attack surface

## 📊 Monitoring & Maintenance

### Health Checks
All services include health checks:
- WordPress: PHP-FPM status
- MySQL: Connection test
- Redis: Ping test
- Nginx: Configuration validation

### Backup System
Automated backups include:
- **Database**: Full MySQL dump with compression
- **Files**: WordPress files excluding cache
- **Retention**: 30 days (configurable)
- **Schedule**: Daily at 2 AM (configurable)

Enable backups:
```bash
docker-compose -f docker-compose.production.yml --profile backup up -d
```

### Log Management
Logs are stored in:
- Nginx: `./nginx/logs/`
- MySQL: Container logs via Docker
- WordPress: PHP error logs in container

View logs:
```bash
# All services
./scripts/deploy-production.sh logs

# Specific service
docker-compose -f docker-compose.production.yml logs wordpress
```

## 🛠️ Operations

### Deployment Commands

```bash
# Deploy production environment
./scripts/deploy-production.sh deploy

# Stop all services
./scripts/deploy-production.sh stop

# View logs
./scripts/deploy-production.sh logs

# Generate SSL certificates only
./scripts/deploy-production.sh ssl
```

### WordPress CLI Operations

```bash
# Access WP-CLI
docker-compose -f docker-compose.production.yml run --rm wp-cli wp --info

# Update WordPress
docker-compose -f docker-compose.production.yml run --rm wp-cli wp core update

# Install plugins
docker-compose -f docker-compose.production.yml run --rm wp-cli wp plugin install redis-cache --activate
```

### Database Operations

```bash
# Access MySQL
docker-compose -f docker-compose.production.yml exec db mysql -u wordpress -p wordpress

# Manual backup
docker-compose -f docker-compose.production.yml exec db mysqldump -u wordpress -p wordpress > backup.sql

# Restore from backup
docker-compose -f docker-compose.production.yml exec -T db mysql -u wordpress -p wordpress < backup.sql
```

## 🔄 Updates & Scaling

### WordPress Updates
```bash
# Update WordPress core
docker-compose -f docker-compose.production.yml run --rm wp-cli wp core update

# Update plugins
docker-compose -f docker-compose.production.yml run --rm wp-cli wp plugin update --all
```

### Container Updates
```bash
# Pull latest images
docker-compose -f docker-compose.production.yml pull

# Recreate containers
docker-compose -f docker-compose.production.yml up -d --force-recreate
```

### Scaling Considerations
- **Database**: Consider read replicas for high traffic
- **Redis**: Cluster mode for large deployments
- **WordPress**: Multiple PHP-FPM containers behind load balancer
- **Storage**: Use external storage for `wp-content/uploads`

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   ```bash
   # Check certificate validity
   openssl x509 -in ./ssl/cert.pem -text -noout
   
   # Regenerate self-signed certificate
   ./scripts/deploy-production.sh ssl
   ```

2. **Database Connection Issues**
   ```bash
   # Check MySQL health
   docker-compose -f docker-compose.production.yml ps db
   
   # View MySQL logs
   docker-compose -f docker-compose.production.yml logs db
   ```

3. **Performance Issues**
   ```bash
   # Check resource usage
   docker stats
   
   # View slow query log
   docker-compose -f docker-compose.production.yml exec db tail -f /var/lib/mysql/slow.log
   ```

4. **Redis Connection Issues**
   ```bash
   # Test Redis connection
   docker-compose -f docker-compose.production.yml exec redis redis-cli auth $REDIS_PASSWORD ping
   ```

### Recovery Procedures

1. **Restore from Backup**
   ```bash
   # Stop services
   ./scripts/deploy-production.sh stop
   
   # Restore database
   gunzip -c ./backup/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
   docker-compose -f docker-compose.production.yml exec -T db mysql -u wordpress -p
   
   # Restore files
   tar -xzf ./backup/wp_files_YYYYMMDD_HHMMSS.tar.gz -C ./data/
   
   # Start services
   ./scripts/deploy-production.sh deploy
   ```

## 📈 Performance Optimization

### Recommended Plugins
- **Redis Object Cache**: For database query caching
- **W3 Total Cache**: For page caching (configure with Redis)
- **Smush**: For image optimization
- **Yoast SEO**: For SEO

### Server-Level Optimizations
- Enable HTTP/2 and HTTP/3
- Use CDN for static assets
- Implement database query optimization
- Monitor and tune MySQL performance

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Generate unique WordPress security keys
- [ ] Configure SSL/TLS with valid certificates
- [ ] Enable firewall on host system
- [ ] Regular security updates
- [ ] Monitor access logs for suspicious activity
- [ ] Implement IP whitelisting for admin access
- [ ] Regular backup testing
- [ ] Security plugin installation (Wordfence, etc.)

## 📞 Support

For issues and questions:
1. Check container logs: `./scripts/deploy-production.sh logs`
2. Verify configuration in `.env` file
3. Review this documentation
4. Check WordPress and plugin documentation
5. Monitor system resources and performance

---

**Note**: This deployment is designed for production use with security and performance optimizations. Regular maintenance, updates, and monitoring are essential for optimal operation.