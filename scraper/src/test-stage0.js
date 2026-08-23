// src/test-stage0.js
async function checkRobots() {
  try {
    const res = await fetch('https://books.toscrape.com/robots.txt');
    if (res.status === 404) {
      console.log('✅ TEST PASSED: robots.txt check returned 404 ("no robots file found")');
    } else {
      console.log(`ℹ️ Status: ${res.status}`);
    }
  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
  }
}

checkRobots();