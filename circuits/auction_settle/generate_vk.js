const fs = require('fs');
const { BarretenbergBackend } = require('@noir-lang/backend_barretenberg');

async function main() {
  try {
    const circuitStr = fs.readFileSync('./target/auction_settle.json', 'utf-8');
    const circuit = JSON.parse(circuitStr);
    
    console.log('Initializing backend...');
    const backend = new BarretenbergBackend(circuit);
    
    console.log('Generating Verification Key...');
    const vk = await backend.getVerificationKey();
    
    fs.writeFileSync('./target/vk', Buffer.from(vk));
    console.log('VK generated successfully at ./target/vk');
    process.exit(0);
  } catch (err) {
    console.error('Error generating VK:', err);
    process.exit(1);
  }
}

main();
