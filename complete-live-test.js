const { chromium } = require("playwright");
const fs = require('fs');

async function completeLiveTest() {
  console.log("🚀 COMPLETE LIVE AUTOMATION TEST");
  console.log("=" * 50);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const page = await browser.newPage();
  
  try {
    // STEP 1: Navigate and take BEFORE screenshot
    console.log("🌐 STEP 1: Loading WordPress site...");
    await page.goto("http://localhost:10004");
    await page.waitForLoadState('networkidle');
    
    console.log("📸 Taking BEFORE screenshot...");
    await page.screenshot({ 
      path: "./screenshots/complete-before.png", 
      fullPage: true 
    });
    
    console.log("✅ BEFORE state captured");
    console.log("\n⏸️  USER: You should now see the automation browser opened");
    console.log("   Keep your own browser tab open to http://localhost:10004");
    
    // Wait so user can see the browser
    await page.waitForTimeout(3000);
    
    // STEP 2: Make backend changes
    console.log("\n🔧 STEP 2: Making backend changes to WordPress CSS...");
    
    const cssFilePath = "/mnt/c/Users/ender/Local Sites/narissarealtycom/app/public/wp-content/themes/narissa-real-estate-theme/style.css";
    
    // Read current CSS
    const currentCSS = fs.readFileSync(cssFilePath, 'utf8');
    
    // Make a dramatic change - modify ALL paragraphs to be bright red
    const modifiedCSS = currentCSS.replace(
      /p\s*{[^}]*}/g,
      `p {
        color: #ff0000 !important;
        background-color: #ffff00 !important;
        padding: 10px !important;
        border: 3px solid #ff0000 !important;
        font-weight: bold !important;
        font-size: 18px !important;
        margin: 10px 0 !important;
      }`
    );
    
    // Write the modified CSS
    fs.writeFileSync(cssFilePath, modifiedCSS);
    
    console.log("✅ Backend CSS modified - all paragraphs now RED with YELLOW background!");
    
    // STEP 3: Refresh automation browser
    console.log("\n🔄 STEP 3: Refreshing automation browser...");
    await page.reload({ waitUntil: 'networkidle' });
    
    console.log("📸 Taking AFTER screenshot...");
    await page.screenshot({ 
      path: "./screenshots/complete-after.png", 
      fullPage: true 
    });
    
    // STEP 4: Tell user what to do
    console.log("\n🎉 STEP 4: CHANGES APPLIED!");
    console.log("👀 YOU SHOULD NOW SEE:");
    console.log("   - Automation browser: Shows NEW styling (red text, yellow background)");
    console.log("   - Your browser: Still shows OLD styling");
    console.log("   - Action: REFRESH your browser tab to see the changes!");
    
    console.log("\n⏰ Automation browser staying open for 20 seconds...");
    console.log("   Use this time to refresh your own browser and compare!");
    
    await page.waitForTimeout(20000);
    
    // STEP 5: Revert changes
    console.log("\n🔄 STEP 5: Reverting changes...");
    fs.writeFileSync(cssFilePath, currentCSS);
    console.log("✅ Original CSS restored");
    
    return {
      success: true,
      changes: "All paragraphs modified to red text with yellow background",
      screenshots: ["./screenshots/complete-before.png", "./screenshots/complete-after.png"]
    };
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
    console.log("🔚 Test complete - automation browser closed");
  }
}

completeLiveTest().then(result => {
  console.log("\n" + "=".repeat(60));
  console.log("LIVE AUTOMATION TEST RESULTS");
  console.log("=".repeat(60));
  console.log(JSON.stringify(result, null, 2));
}).catch(console.error);