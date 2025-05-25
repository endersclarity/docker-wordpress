<?php
// Main Navigation Hub page creation
require_once('/var/www/html/wp-config.php');

$page_content = '
<style>
.nav-hub-container {
    background: linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #88ff00, #00ff88, #0088ff, #8800ff, #ff0088);
    background-size: 800% 800%;
    animation: mega-gradient 4s ease infinite;
    padding: 40px 20px;
    border-radius: 20px;
    margin: 20px 0;
}

@keyframes mega-gradient {
    0%, 100% { background-position: 0% 50%; }
    25% { background-position: 100% 0%; }
    50% { background-position: 100% 100%; }
    75% { background-position: 0% 100%; }
}

.nav-title {
    text-align: center;
    font-size: 4em;
    font-weight: bold;
    text-shadow: 3px 3px 0px #000, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff, 1px 1px 0px #fff;
    animation: title-pulse 2s ease-in-out infinite;
    margin-bottom: 30px;
}

@keyframes title-pulse {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.05) rotate(1deg); }
}

.page-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin: 40px 0;
}

.page-link-card {
    background: rgba(0, 0, 0, 0.9);
    border: 3px solid;
    border-image: linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ff00ff) 1;
    border-radius: 20px;
    padding: 30px;
    text-decoration: none;
    color: #fff;
    transition: all 0.3s ease;
    animation: card-float 3s ease-in-out infinite;
    position: relative;
    overflow: hidden;
}

.page-link-card:hover {
    transform: scale(1.05) rotate(2deg);
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
}

@keyframes card-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

.card-emoji {
    font-size: 4em;
    display: block;
    text-align: center;
    margin-bottom: 15px;
    animation: emoji-spin 4s linear infinite;
}

@keyframes emoji-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.card-title {
    font-size: 1.8em;
    font-weight: bold;
    text-align: center;
    margin-bottom: 15px;
    background: linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.card-description {
    text-align: center;
    font-size: 1.1em;
    line-height: 1.4;
    color: #ccc;
}

.coming-soon-card {
    background: rgba(50, 50, 50, 0.9);
    border: 3px dashed #666;
    opacity: 0.7;
}

.coming-soon-card .card-title {
    color: #999;
    background: none;
    -webkit-text-fill-color: #999;
}

.epic-footer {
    text-align: center;
    font-size: 2.5em;
    font-weight: bold;
    margin: 40px 0;
    animation: rainbow-text 3s linear infinite;
}

@keyframes rainbow-text {
    0% { color: #ff0000; }
    16% { color: #ff8800; }
    33% { color: #ffff00; }
    50% { color: #00ff00; }
    66% { color: #0088ff; }
    83% { color: #8800ff; }
    100% { color: #ff0000; }
}

.intro-text {
    background: rgba(0, 0, 0, 0.8);
    color: #00ff00;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
    font-size: 1.3em;
    margin: 30px 0;
    border: 2px solid #ff00ff;
    animation: intro-glow 2s ease-in-out infinite alternate;
}

@keyframes intro-glow {
    from { box-shadow: 0 0 20px #ff00ff; }
    to { box-shadow: 0 0 40px #00ffff; }
}
</style>

<div class="nav-hub-container">
    <div class="nav-title">🚀 KAELEN\'S FUCKING EPIC NAVIGATION HUB 🔥</div>
    
    <div class="intro-text">
        Welcome to the epicenter of my Docker WordPress LLM automation hellscape! Navigate through the chaos and discover the beautiful fucking madness I\'ve created with Claude Code, Browser MCP, and pure determination.
    </div>

    <div class="page-links-grid">
        
        <a href="/?page_id=9" class="page-link-card">
            <span class="card-emoji">👨‍💻</span>
            <div class="card-title">ABOUT THIS FUCKING HELLSCAPE</div>
            <div class="card-description">
                Meet Kaelen Jennings - AI Automation Wizard, Docker Destroyer, and LLM Whisperer. Discover the madman behind the automation empire.
            </div>
        </a>

        <a href="/?page_id=10" class="page-link-card">
            <span class="card-emoji">🐳</span>
            <div class="card-title">DOCKER HELLSCAPE</div>
            <div class="card-description">
                Dive into the containerization domination! See how Docker transforms chaos into beautiful, orchestrated infrastructure madness.
            </div>
        </a>

        <a href="/?p=7" class="page-link-card">
            <span class="card-emoji">📖</span>
            <div class="card-title">THE FUCKING EPIC JOURNEY</div>
            <div class="card-description">
                The origin story of this WordPress LLM automation hellscape. Browser MCP, Claude Code, and a lot of fucking determination.
            </div>
        </a>

        <a href="/?p=8" class="page-link-card">
            <span class="card-emoji">🔧</span>
            <div class="card-title">TECHNICAL DEEP DIVE</div>
            <div class="card-description">
                WordPress MCP Servers are the fucking future! Technical breakdown of the architecture behind this beautiful mess.
            </div>
        </a>

        <div class="page-link-card coming-soon-card">
            <span class="card-emoji">🤖</span>
            <div class="card-title">MCP SERVER ARSENAL</div>
            <div class="card-description">
                Coming Soon: My collection of MCP tools and integrations that make AI do shit it was never designed to do.
            </div>
        </div>

        <div class="page-link-card coming-soon-card">
            <span class="card-emoji">⚡</span>
            <div class="card-title">AUTOMATION GALLERY</div>
            <div class="card-description">
                Coming Soon: Screenshots and demos of workflows destroyed by beautiful automation. Resistance is futile.
            </div>
        </div>

        <div class="page-link-card coming-soon-card">
            <span class="card-emoji">💀</span>
            <div class="card-title">WORKFLOW GRAVEYARD</div>
            <div class="card-description">
                Coming Soon: RIP to all the manual processes that couldn\'t survive the automation apocalypse.
            </div>
        </div>

        <div class="page-link-card coming-soon-card">
            <span class="card-emoji">🔗</span>
            <div class="card-title">CONTACT & LINKS</div>
            <div class="card-description">
                Coming Soon: Find me on GitHub, social media, and other places where automation legends gather.
            </div>
        </div>

    </div>

    <div class="epic-footer">
        🔥 WELCOME TO THE FUCKING FUTURE OF AUTOMATION! 🚀
    </div>

    <div class="intro-text">
        This is just the beginning of the automation revolution. Every page you visit, every workflow you see - it\'s all part of the grand plan to make AI and containers do impossible shit. Buckle up, the ride\'s just getting started!
    </div>
</div>
';

$page_data = array(
    'post_title'   => 'NAVIGATION HUB: Your Guide to the Hellscape',
    'post_content' => $page_content,
    'post_status'  => 'publish',
    'post_type'    => 'page',
    'post_author'  => 1
);

$page_id = wp_insert_post($page_data);

if ($page_id) {
    echo "Navigation Hub page created successfully! Page ID: $page_id\n";
    echo "URL: http://localhost:8090/?page_id=$page_id\n";
} else {
    echo "Failed to create Navigation Hub page.\n";
}
?>