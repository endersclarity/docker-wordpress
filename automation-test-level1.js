const { chromium } = require("playwright");

async function testButtonStyling() {
  console.log("🧪 Starting Level 1 Button Styling Automation Test...");
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to a simple test page
    await page.goto("https://example.com");
    await page.waitForLoadState("networkidle");
    
    console.log("✅ Page loaded successfully");
    
    // Take before screenshot
    await page.screenshot({ path: "./screenshots/before-test.png", fullPage: true });
    console.log("📸 Before screenshot captured");
    
    // Add custom button for testing
    await page.evaluate(() => {
      const button = document.createElement("button");
      button.textContent = "Test Button - BEFORE";
      button.id = "automation-test-button";
      button.style.cssText = `
        padding: 10px 20px;
        background-color: #ccc;
        border: 1px solid #999;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin: 20px;
      `;
      document.body.appendChild(button);
    });
    
    await page.waitForTimeout(1000);
    console.log("🔘 Test button added with default styling");
    
    // Take after adding button screenshot
    await page.screenshot({ path: "./screenshots/button-added.png", fullPage: true });
    
    // Apply styling changes - Level 1 Micro-tweak
    await page.evaluate(() => {
      const button = document.getElementById("automation-test-button");
      if (button) {
        button.textContent = "Test Button - AFTER";
        button.style.cssText = `
          padding: 15px 30px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          border: 2px solid #ff6b6b;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          color: white;
          margin: 20px;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
          transition: all 0.3s ease;
        `;
        
        // Add hover effect
        button.addEventListener("mouseenter", () => {
          button.style.transform = "translateY(-2px)";
          button.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)";
        });
        
        button.addEventListener("mouseleave", () => {
          button.style.transform = "translateY(0)";
          button.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)";
        });
      }
    });
    
    await page.waitForTimeout(1000);
    console.log("✨ Button styling updated with gradient and effects");
    
    // Take final screenshot
    await page.screenshot({ path: "./screenshots/after-test.png", fullPage: true });
    console.log("📸 After screenshot captured");
    
    console.log("\n🎉 Level 1 Automation Test COMPLETED!");
    console.log("📁 Screenshots saved:");
    console.log("   - ./screenshots/before-test.png (initial page)");
    console.log("   - ./screenshots/button-added.png (button added)");
    console.log("   - ./screenshots/after-test.png (styled button)");
    
    return {
      success: true,
      testLevel: "Level 1 - Micro-tweaks",
      testType: "Button Styling",
      changes: [
        "Added test button to page",
        "Changed background from gray to gradient (red to teal)",
        "Increased padding from 10px/20px to 15px/30px", 
        "Changed border radius from 4px to 25px (rounded)",
        "Added drop shadow with color matching",
        "Added hover effects with transform and enhanced shadow",
        "Changed text color to white for contrast",
        "Increased font weight to bold"
      ],
      screenshots: [
        "./screenshots/before-test.png",
        "./screenshots/button-added.png", 
        "./screenshots/after-test.png"
      ]
    };
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testButtonStyling().then(result => {
  console.log("\n" + "=".repeat(50));
  console.log("AUTOMATION TEST RESULTS");
  console.log("=".repeat(50));
  console.log(JSON.stringify(result, null, 2));
}).catch(console.error);