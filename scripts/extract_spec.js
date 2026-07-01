const fs = require('fs');

async function main() {
    const { xdr } = await import('@stellar/stellar-sdk');
    const wasm = fs.readFileSync('../contracts/auction/target/wasm32v1-none/release/auction.wasm');

    let offset = 8;
    while (offset < wasm.length) {
        const sectionId = wasm[offset++];
        let size = 0, shift = 0;
        while (true) {
            const byte = wasm[offset++];
            size |= (byte & 0x7f) << shift;
            shift += 7;
            if ((byte & 0x80) === 0) break;
        }
        
        if (sectionId === 0) {
            let nameLen = 0, nameShift = 0, nameOffset = offset;
            while (true) {
                const byte = wasm[nameOffset++];
                nameLen |= (byte & 0x7f) << nameShift;
                nameShift += 7;
                if ((byte & 0x80) === 0) break;
            }
            const name = wasm.subarray(nameOffset, nameOffset + nameLen).toString('utf8');
            if (name === 'contractspecv0') {
                const dataOffset = nameOffset + nameLen;
                const data = wasm.subarray(dataOffset, offset + size);
                
                const entries = [];
                let buffer = data;
                while (buffer.length > 0) {
                    try {
                        const entry = xdr.SCSpecEntry.fromXDR(buffer);
                        const b64 = entry.toXDR('base64');
                        entries.push(`"${b64}"`);
                        
                        // We have to advance buffer. fromXDR doesn't return length.
                        // Actually, we can use the cursor approach:
                        // No wait, fromXDR doesn't take a cursor.
                        // Let's use the buffer stream directly!
                        break;
                    } catch (e) {
                        break;
                    }
                }
            }
        }
        offset += size;
    }
}
// Using reader is easier
async function parseWithReader() {
    const { xdr } = require('@stellar/stellar-sdk');
    const wasm = fs.readFileSync('./contracts/auction/target/wasm32v1-none/release/auction.wasm');

    let offset = 8;
    while (offset < wasm.length) {
        const sectionId = wasm[offset++];
        let size = 0, shift = 0;
        while (true) {
            const byte = wasm[offset++];
            size |= (byte & 0x7f) << shift;
            shift += 7;
            if ((byte & 0x80) === 0) break;
        }
        
        if (sectionId === 0) {
            let nameLen = 0, nameShift = 0, nameOffset = offset;
            while (true) {
                const byte = wasm[nameOffset++];
                nameLen |= (byte & 0x7f) << nameShift;
                nameShift += 7;
                if ((byte & 0x80) === 0) break;
            }
            const name = wasm.subarray(nameOffset, nameOffset + nameLen).toString('utf8');
            if (name === 'contractspecv0') {
                const dataOffset = nameOffset + nameLen;
                const data = wasm.subarray(dataOffset, offset + size);
                
                const entries = [];
                // The `xdr` library exposes `xdr.SCSpecEntry.read(io)`
                // But we don't have io directly.
                // An easy way is just to brute force lengths from 4 bytes upwards? No.
                // Wait! We can just use python to extract the base64! No python stellar-sdk installed.
                console.log("Found contractspecv0, length: " + data.length);
                fs.writeFileSync('spec.bin', data);
            }
        }
        offset += size;
    }
}

parseWithReader();
