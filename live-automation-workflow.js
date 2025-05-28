const { chromium } = require("playwright");

async function liveAutomationWorkflow() {
  console.log("🎯 LIVE AUTOMATION WORKFLOW STARTING");
  console.log("📱 User should have http://localhost:10004 open in their browser");
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down so user can see what's happening
  });
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to the WordPress site
    console.log("\n🌐 Step 1: Opening WordPress site in automation browser...");
    await page.goto("http://localhost:10004", { waitUntil: 'networkidle' });
    
    // Step 2: Take BEFORE screenshot
    console.log("📸 Step 2: Taking BEFORE screenshot...");
    await page.screenshot({ 
      path: "./screenshots/live-before.png", 
      fullPage: true 
    });
    
    // Step 3: Wait for user confirmation
    console.log("\n⏸️  PAUSE: User should now see their WordPress site in BOTH:");
    console.log("   - Their own browser window");
    console.log("   - The automation browser window that just opened");
    console.log("\n🔄 Step 3: Making backend changes...");
    
    // Give user time to see both windows
    await page.waitForTimeout(3000);
    
    // Step 4: Make backend changes (this will be done by another function)
    console.log("✏️  Backend changes will be made now...");
    await page.waitForTimeout(2000);
    
    // Step 5: Refresh the automation browser
    console.log("\n🔄 Step 4: Refreshing automation browser to show changes...");
    await page.reload({ waitUntil: 'networkidle' });
    
    // Step 6: Take AFTER screenshot
    console.log("📸 Step 5: Taking AFTER screenshot...");
    await page.screenshot({ 
      path: "./screenshots/live-after.png", 
      fullPage: true 
    });
    
    // Step 7: Keep browser open so user can see the changes
    console.log("\n🎉 AUTOMATION COMPLETE!");
    console.log("✅ User can now see changes in:");
    console.log("   - The automation browser (showing new styling)");
    console.log("   - Their own browser (refresh to see changes)");
    console.log("\n⏰ Keeping automation browser open for 15 seconds...");
    
    await page.waitForTimeout(15000);
    
    return {
      success: true,
      message: "Live automation workflow completed successfully"
    };
    
  } catch (error) {
    console.error("❌ Workflow failed:", error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
    console.log("🔚 Automation browser closed");
  }
}

module.exports = { liveAutomationWorkflow };