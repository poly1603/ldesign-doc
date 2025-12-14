const fs = require('fs');
const path = require('path');

async function verify() {
  console.log('='.repeat(60));
  console.log('LDesign Doc Site Verification');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  // Test 1: Check source files exist
  console.log('\n📁 Checking Source Files...');

  const srcDemoPath = path.join(__dirname, '.ldesign/docs/src-demo.md');
  if (fs.existsSync(srcDemoPath)) {
    const content = fs.readFileSync(srcDemoPath, 'utf-8');
    // The original error was from <style scoped> with CSS like "padding: 16px;"
    // If file doesn't have "<style scoped>" at all, it's fixed
    if (!content.includes('<style scoped>')) {
      console.log('✅ src-demo.md: Fixed (no <style scoped> tag)');
      passed++;
    } else {
      console.log('❌ src-demo.md: Still has <style scoped> tag');
      failed++;
    }
  }

  // Test 2: Check homepage has diverse content
  const indexPath = path.join(__dirname, '.ldesign/docs/index.md');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8');

    if (content.includes('comparison-table')) {
      console.log('✅ Homepage: Has comparison table');
      passed++;
    } else {
      console.log('❌ Homepage: Missing comparison table');
      failed++;
    }

    if (content.includes('steps-section')) {
      console.log('✅ Homepage: Has steps section');
      passed++;
    } else {
      console.log('❌ Homepage: Missing steps section');
      failed++;
    }

    if (content.includes('roadmap-section')) {
      console.log('✅ Homepage: Has roadmap section');
      passed++;
    } else {
      console.log('❌ Homepage: Missing roadmap section');
      failed++;
    }

    if (content.includes('testimonials-section')) {
      console.log('✅ Homepage: Has testimonials section');
      passed++;
    } else {
      console.log('❌ Homepage: Missing testimonials section');
      failed++;
    }

    if (content.includes('stats-section')) {
      console.log('✅ Homepage: Has stats section');
      passed++;
    } else {
      console.log('❌ Homepage: Missing stats section');
      failed++;
    }
  }

  // Test 3: Check English homepage exists
  const enIndexPath = path.join(__dirname, '.ldesign/docs/en/index.md');
  if (fs.existsSync(enIndexPath)) {
    const content = fs.readFileSync(enIndexPath, 'utf-8');
    if (content.includes('Why LDoc?') && content.includes('stats-section')) {
      console.log('✅ English Homepage: Exists with proper content');
      passed++;
    } else {
      console.log('❌ English Homepage: Missing expected content');
      failed++;
    }
  } else {
    console.log('❌ English Homepage: File not found');
    failed++;
  }

  // Test 4: Check language switcher in VPNav
  const vpNavPath = path.join(__dirname, '../src/theme-default/components/VPNav.vue');
  if (fs.existsSync(vpNavPath)) {
    const content = fs.readFileSync(vpNavPath, 'utf-8');
    if (content.includes('vp-nav-lang') && content.includes('currentLocaleLabel')) {
      console.log('✅ VPNav: Has language switcher');
      passed++;
    } else {
      console.log('❌ VPNav: Missing language switcher');
      failed++;
    }
  }

  // Test 5: Check locales config
  const configPath = path.join(__dirname, '.ldesign/doc.config.ts');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    if (content.includes('locales:') && content.includes("label: 'English'")) {
      console.log('✅ Config: Has multi-language locales');
      passed++;
    } else {
      console.log('❌ Config: Missing locales configuration');
      failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 All verifications passed!');
  } else {
    console.log('\n⚠️  Some verifications failed. Please check the issues above.');
  }
}

verify();
