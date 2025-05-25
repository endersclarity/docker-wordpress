<?php
// Docker Hellscape page creation
require_once('/var/www/html/wp-config.php');

$page_content = '
<style>
.hellscape-container {
    background: linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #88ff00, #00ff88, #0088ff, #8800ff, #ff0088);
    background-size: 400% 400%;
    animation: hellscape-bg 3s ease infinite;
    padding: 40px 20px;
    border-radius: 20px;
    margin: 20px 0;
}

@keyframes hellscape-bg {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.container-card {
    background: rgba(0, 0, 0, 0.8);
    color: #00ff00;
    padding: 20px;
    margin: 15px 0;
    border-radius: 15px;
    border: 2px solid #ff00ff;
    animation: container-pulse 2s ease-in-out infinite;
}

@keyframes container-pulse {
    0%, 100% { box-shadow: 0 0 20px #ff00ff; }
    50% { box-shadow: 0 0 40px #00ffff, 0 0 60px #ff00ff; }
}

.command-block {
    background: #000;
    color: #00ff00;
    padding: 15px;
    font-family: monospace;
    border-left: 5px solid #ff0000;
    margin: 10px 0;
    animation: command-glow 1.5s ease-in-out infinite alternate;
}

@keyframes command-glow {
    from { border-left-color: #ff0000; box-shadow: -5px 0 10px #ff0000; }
    to { border-left-color: #00ff00; box-shadow: -5px 0 10px #00ff00; }
}

.hell-title {
    text-align: center;
    font-size: 3em;
    background: linear-gradient(45deg, #ff0000, #ff8800, #ffff00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: title-shake 0.5s ease-in-out infinite;
}

@keyframes title-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px) rotate(-1deg); }
    75% { transform: translateX(2px) rotate(1deg); }
}

.docker-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.stat-item {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    text-align: center;
    border-radius: 15px;
    animation: stat-bounce 2s ease-in-out infinite;
}

@keyframes stat-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
</style>

<div class="hellscape-container">
    <h1 class="hell-title">🐳 DOCKER HELLSCAPE 🔥</h1>
    
    <div class="container-card">
        <h2>🔥 CONTAINERIZATION DOMINATION</h2>
        <p>Welcome to my fucking Docker empire where I containerize everything that moves and some things that don\'t. This is where traditional infrastructure comes to die and beautiful, orchestrated chaos is born.</p>
    </div>

    <div class="container-card">
        <h3>🐳 THE DOCKER COMPOSE MASTERPIECE</h3>
        <div class="command-block">
version: "3.8"
services:
  wordpress:
    image: wordpress:latest
    container_name: wp_hellscape
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: D@wordpresska79823!4
      WP_ENVIRONMENT_TYPE: development
    ports:
      - "8090:80"
    depends_on:
      - db
    volumes:
      - ./wordpress:/var/www/html

  db:
    image: mysql:8.0
    container_name: wp_db_hellscape
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: D@wordpresska79823!4
      MYSQL_ROOT_PASSWORD: rootpassword
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
        </div>
    </div>

    <div class="docker-stats">
        <div class="stat-item">
            <h3>🐳</h3>
            <h4>Containers Running</h4>
            <div style="font-size: 2em; color: #00ff00;">2</div>
        </div>
        
        <div class="stat-item">
            <h3>💀</h3>
            <h4>Legacy Systems Destroyed</h4>
            <div style="font-size: 2em; color: #ff0000;">∞</div>
        </div>
        
        <div class="stat-item">
            <h3>⚡</h3>
            <h4>Deploy Time</h4>
            <div style="font-size: 2em; color: #ffff00;">30s</div>
        </div>
        
        <div class="stat-item">
            <h3>🔥</h3>
            <h4>Infrastructure Tears</h4>
            <div style="font-size: 2em; color: #ff00ff;">Many</div>
        </div>
    </div>

    <div class="container-card">
        <h3>⚡ ORCHESTRATION COMMANDS OF POWER</h3>
        <div class="command-block">
# Summon the hellscape
docker-compose up -d

# Check the chaos
docker ps

# Enter the WordPress fortress
docker exec -it wp_hellscape bash

# Inspect the database realm
docker exec -it wp_db_hellscape mysql -u wordpress -p

# Burn it all down (when needed)
docker-compose down --volumes
        </div>
    </div>

    <div class="container-card">
        <h3>🏗️ INFRASTRUCTURE AS FUCKING CODE</h3>
        <p>Every piece of this hellscape is codified, version controlled, and ready to be deployed anywhere. No more "it works on my machine" bullshit - it works in my containers, and my containers work everywhere.</p>
        
        <ul style="color: #00ffff; font-size: 1.2em;">
            <li>🐳 <strong>Portable as fuck</strong> - Deploy anywhere Docker runs</li>
            <li>⚡ <strong>Fast as lightning</strong> - Spin up entire stack in seconds</li>
            <li>🔄 <strong>Reproducible madness</strong> - Same environment every time</li>
            <li>💀 <strong>Legacy killer</strong> - No more XAMPP/WAMP bullshit</li>
            <li>🚀 <strong>Scalable insanity</strong> - Add more containers when needed</li>
        </ul>
    </div>

    <div class="container-card">
        <h3>🎯 FUTURE DOCKER DOMINATION PLANS</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div style="background: rgba(255, 0, 0, 0.2); padding: 15px; border-radius: 10px;">
                <h4>🔥 Redis Cache Layer</h4>
                <p>Speed boost for this WordPress hellscape</p>
            </div>
            <div style="background: rgba(0, 255, 0, 0.2); padding: 15px; border-radius: 10px;">
                <h4>📊 Analytics Stack</h4>
                <p>Grafana + Prometheus monitoring</p>
            </div>
            <div style="background: rgba(0, 0, 255, 0.2); padding: 15px; border-radius: 10px;">
                <h4>🔐 Nginx Reverse Proxy</h4>
                <p>SSL termination and load balancing</p>
            </div>
            <div style="background: rgba(255, 255, 0, 0.2); padding: 15px; border-radius: 10px;">
                <h4>🚀 CI/CD Pipeline</h4>
                <p>Automated builds and deployments</p>
            </div>
        </div>
    </div>

    <div style="text-align: center; font-size: 2em; margin: 30px 0; animation: rainbow 2s linear infinite;">
        🐳 THIS IS DOCKER FUCKING DOMINATION! 🔥
    </div>
</div>

@keyframes rainbow {
    0% { color: #ff0000; }
    16% { color: #ff8800; }
    33% { color: #ffff00; }
    50% { color: #00ff00; }
    66% { color: #0088ff; }
    83% { color: #8800ff; }
    100% { color: #ff0000; }
}
';

$page_data = array(
    'post_title'   => 'DOCKER HELLSCAPE: Container Domination',
    'post_content' => $page_content,
    'post_status'  => 'publish',
    'post_type'    => 'page',
    'post_author'  => 1
);

$page_id = wp_insert_post($page_data);

if ($page_id) {
    echo "Docker Hellscape page created successfully! Page ID: $page_id\n";
    echo "URL: http://localhost:8090/?page_id=$page_id\n";
} else {
    echo "Failed to create Docker Hellscape page.\n";
}
?>