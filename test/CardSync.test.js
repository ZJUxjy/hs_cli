// test/CardSync.test.js
const CardSync = require('../src/data/CardSync');

async function testSync() {
  try {
    const sync = new CardSync();
    const result = await sync.download();
    console.log('Downloaded:', result.length, 'cards');
    return result.length > 0;
  } catch (e) {
    console.error('Sync failed:', e.message);
    return false;
  }
}

testSync().then(ok => process.exit(ok ? 0 : 1));
