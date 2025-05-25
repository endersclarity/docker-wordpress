<?php
// Create gaudy about page
require_once('wp-config.php');
require_once('wp-includes/wp-db.php');
require_once('wp-includes/functions.php');
require_once('wp-includes/post.php');

$about_page = array(
    'post_title'    => 'ABOUT THIS FUCKING HELLSCAPE',
    'post_content'  => '<div style="background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff); padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: rainbow 3s ease-in-out infinite;">

<h1 style="text-align: center; color: #fff; text-shadow: 3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000; font-size: 3em; animation: pulse 2s infinite;">🔥 WELCOME TO THE MATRIX 🔥</h1>

<div style="background: rgba(0,0,0,0.8); color: #00ff00; font-family: \'Courier New\', monospace; padding: 20px; border-radius: 10px; border: 2px solid #00ff00; margin: 20px 0;">
<h2 style="color: #ff00ff; text-align: center;">👨‍💻 KAELEN JENNINGS 👨‍💻</h2>
<p style="font-size: 1.2em; text-align: center;"><strong>AI AUTOMATION WIZARD • DOCKER DESTROYER • LLM WHISPERER</strong></p>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">

<div style="background: #ff6b6b; padding: 20px; border-radius: 15px; transform: rotate(-2deg); box-shadow: 5px 5px 15px rgba(0,0,0,0.3);">
<h3 style="color: #fff; text-shadow: 2px 2px 0px #000;">🐳 DOCKER DOMINATION</h3>
<p style="color: #fff;">I containerize shit that was never meant to be containerized. WordPress? Dockerized. My breakfast? Probably dockerized. My life? Definitely dockerized.</p>
</div>

<div style="background: #feca57; padding: 20px; border-radius: 15px; transform: rotate(2deg); box-shadow: 5px 5px 15px rgba(0,0,0,0.3);">
<h3 style="color: #000; text-shadow: 1px 1px 0px #fff;">🤖 LLM INTEGRATION MADNESS</h3>
<p style="color: #000;">Claude Code, Browser MCP, WordPress automation - I make AI do shit it was never designed to do. And it fucking loves it.</p>
</div>

<div style="background: #48dbfb; padding: 20px; border-radius: 15px; transform: rotate(-1deg); box-shadow: 5px 5px 15px rgba(0,0,0,0.3);">
<h3 style="color: #fff; text-shadow: 2px 2px 0px #000;">🔧 AUTOMATION OVERLORD</h3>
<p style="color: #fff;">If it can be automated, I will automate it. If it can\'t be automated, I\'ll find a way to automate it anyway. Resistance is futile.</p>
</div>

<div style="background: #ff9ff3; padding: 20px; border-radius: 15px; transform: rotate(1deg); box-shadow: 5px 5px 15px rgba(0,0,0,0.3);">
<h3 style="color: #000; text-shadow: 1px 1px 0px #fff;">💀 WORKFLOW DESTRUCTION</h3>
<p style="color: #000;">Traditional workflows fear me. Manual processes run when they see me coming. I turn chaos into beautiful, vulgar automation.</p>
</div>

</div>

<div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 20px; text-align: center; margin: 30px 0;">
<h2 style="color: #fff; margin: 0;">📊 CURRENT STATS</h2>
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px;">
<div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
<div style="font-size: 2em; color: #feca57;">🐳</div>
<div style="color: #fff; font-weight: bold;">Docker Containers</div>
<div style="color: #feca57; font-size: 1.5em;">42</div>
</div>
<div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
<div style="font-size: 2em; color: #ff6b6b;">🤖</div>
<div style="color: #fff; font-weight: bold;">AI Integrations</div>
<div style="color: #ff6b6b; font-size: 1.5em;">∞</div>
</div>
<div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
<div style="font-size: 2em; color: #48dbfb;">⚡</div>
<div style="color: #fff; font-weight: bold;">Workflows Destroyed</div>
<div style="color: #48dbfb; font-size: 1.5em;">9001</div>
</div>
<div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
<div style="font-size: 2em; color: #ff9ff3;">🔥</div>
<div style="color: #fff; font-weight: bold;">Fucks Given</div>
<div style="color: #ff9ff3; font-size: 1.5em;">0</div>
</div>
</div>
</div>

<div style="background: #000; color: #00ff00; padding: 20px; border-radius: 10px; font-family: \'Courier New\', monospace; border: 2px solid #00ff00; margin: 30px 0;">
<h3 style="color: #ff00ff; text-align: center;">💻 TECH STACK OF DOOM</h3>
<ul style="list-style: none; columns: 2;">
<li>🐳 Docker & Docker Compose</li>
<li>🤖 Claude Code & MCP Servers</li>
<li>🌐 WordPress Automation</li>
<li>🎯 Browser MCP Integration</li>
<li>🔧 REST API Manipulation</li>
<li>💀 Database Direct Access</li>
<li>🚀 Astra Theme Customization</li>
<li>⚡ Vulgar Content Generation</li>
</ul>
</div>

<div style="text-align: center; margin: 40px 0;">
<p style="font-size: 2em; background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: bold; animation: shake 0.5s infinite;">
🔥 THIS IS JUST THE FUCKING BEGINNING! 🔥
</p>
</div>

</div>

<style>
@keyframes rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
</style>',
    'post_status'   => 'publish',
    'post_author'   => 1,
    'post_type'     => 'page'
);

$page_id = wp_insert_post($about_page);

if ($page_id) {
    echo "🌈 GAUDY ABOUT PAGE CREATED! ID: $page_id\n";
} else {
    echo "💩 Failed to create about page\n";
}

// Update homepage to show posts
update_option('show_on_front', 'posts');

echo "✅ Gaudy content creation complete!\n";
?>