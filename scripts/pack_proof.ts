import fs from 'fs';
import path from 'path';

// Usage: ts-node pack_proof.ts <path_to_proof> <path_to_public_inputs>

function main() {
    const proofPath = process.argv[2];
    const pubInputsPath = process.argv[3];
    
    if (!proofPath) {
        console.error("Usage: ts-node pack_proof.ts <proof> [public_inputs.json]");
        process.exit(1);
    }
    
    // Read raw proof (binary)
    const proof = fs.readFileSync(proofPath);
    
    let packed = proof;
    
    // If public inputs are provided, we prepend them according to UltraHonk format:
    // [num_public_inputs: u32][public_inputs][proof_bytes]
    if (pubInputsPath && fs.existsSync(pubInputsPath)) {
        const pubInputsJson = JSON.parse(fs.readFileSync(pubInputsPath, 'utf-8'));
        const numInputs = pubInputsJson.length;
        
        // 4 bytes for num_public_inputs
        const numInputsBuf = Buffer.alloc(4);
        numInputsBuf.writeUInt32BE(numInputs, 0);
        
        // 32 bytes per public input
        const pubInputsBufs = pubInputsJson.map((hexStr: string) => {
            const cleanHex = hexStr.replace(/^0x/, '');
            const paddedHex = cleanHex.padStart(64, '0');
            return Buffer.from(paddedHex, 'hex');
        });
        
        packed = Buffer.concat([numInputsBuf, ...pubInputsBufs, proof]);
    } else {
        console.warn("Warning: No public inputs provided. Assembling with raw proof only.");
    }
    
    const hex = packed.toString('hex');
    console.log(hex);
}
main();
