const { chromium } = require("playwright");

async function testRealWordPressSite() {
  console.log("🎯 Testing REAL WordPress site - NarissaRealty.com");
  
  const browser = await chromium.launch({ headless: false }); // Show browser
  const page = await browser.newPage();
  
  try {
    // Navigate to your actual WordPress site
    console.log("🌐 Navigating to http://localhost:10004");
    await page.goto("http://localhost:10004");
    await page.waitForLoadState("networkidle");
    
    console.log("✅ WordPress site loaded successfully");
    
    // Take before screenshot
    await page.screenshot({ path: "./screenshots/wordpress-before.png", fullPage: true });
    console.log("📸 BEFORE screenshot captured");
    
    // Get page title to confirm we're on the right site
    const pageTitle = await page.title();
    console.log(`📄 Page title: "${pageTitle}"`);
    
    // Look for actual buttons/elements to modify
    const buttons = await page.$$('button, .btn, input[type="submit"], a.button');
    console.log(`🔘 Found ${buttons.length} button elements`);
    
    // Look for navigation or header elements
    const navElements = await page.$$('nav, .navigation, .menu, header');
    console.log(`🧭 Found ${navElements.length} navigation elements`);
    
    // Try to find and modify the first real button
    const buttonModified = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, .btn, input[type="submit"], a.button, .wp-block-button a');
      if (buttons.length > 0) {
        const firstButton = buttons[0];
        const originalStyle = firstButton.style.cssText;
        const originalText = firstButton.textContent;
        
        // Apply dramatic styling changes
        firstButton.style.cssText = `
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
          border: 3px solid #ff6b6b !important;
          border-radius: 25px !important;
          padding: 15px 30px !important;
          color: white !important;
          font-weight: bold !important;
          font-size: 16px !important;
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4) !important;
          transform: scale(1.1) !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
        `;
        
        return {
          success: true,
          element: firstButton.tagName,
          originalText: originalText,
          originalStyle: originalStyle,
          newStyle: firstButton.style.cssText
        };
      }
      return { success: false, reason: "No buttons found" };
    });
    
    if (buttonModified.success) {
      console.log("✨ REAL WordPress button modified!");
      console.log(`   Element: ${buttonModified.element}`);
      console.log(`   Text: "${buttonModified.originalText}"`);
      
      await page.waitForTimeout(2000); // Wait to see the change
      
      // Take after screenshot
      await page.screenshot({ path: "./screenshots/wordpress-after.png", fullPage: true });
      console.log("📸 AFTER screenshot captured");
      
      // Wait a bit longer so you can see it in the browser
      console.log("⏰ Waiting 5 seconds so you can see the changes in browser...");
      await page.waitForTimeout(5000);
      
    } else {
      console.log("❌ No buttons found to modify");
      
      // Try to modify text content instead
      const textModified = await page.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3, .site-title');
        if (headings.length > 0) {
          const firstHeading = headings[0];
          const originalText = firstHeading.textContent;
          firstHeading.style.cssText = `
            color: #ff6b6b !important;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3) !important;
            transform: scale(1.1) !important;
          `;
          return { success: true, originalText: originalText };
        }
        return { success: false };
      });
      
      if (textModified.success) {
        console.log("✨ Modified heading text instead!");
        await page.screenshot({ path: "./screenshots/wordpress-after.png", fullPage: true });
      }
    }
    
    return {
      success: true,
      siteTitle: pageTitle,
      buttonsFound: buttons.length,
      navigationFound: navElements.length,
      modification: buttonModified
    };
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return { success: false, error: error.message };
  } finally {
    // Don't close browser immediately so you can see the changes
    console.log("🔍 Browser staying open for 10 seconds so you can see the changes...");
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testRealWordPressSite().then(result => {
  console.log("\n" + "=".repeat(60));
  console.log("REAL WORDPRESS AUTOMATION TEST RESULTS");
  console.log("=".repeat(60));
  console.log(JSON.stringify(result, null, 2));
}).catch(console.error);