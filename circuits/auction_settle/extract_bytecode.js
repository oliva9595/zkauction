const fs = require('fs');
const zlib = require('zlib');

try {
  const jsonStr = fs.readFileSync('target/auction_settle.json', 'utf8');
  const json = JSON.parse(jsonStr);
  const bytecodeBase64 = json.bytecode;
  const bytecodeGzipped = Buffer.from(bytecodeBase64, 'base64');
  const bytecode = zlib.gunzipSync(bytecodeGzipped);
  fs.writeFileSync('target/auction_settle.bin', bytecode);
  console.log('Successfully extracted bytecode to target/auction_settle.bin');
} catch (e) {
  console.error('Extraction failed:', e);
}
