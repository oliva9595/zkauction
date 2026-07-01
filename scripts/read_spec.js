const fs = require('fs');
const { xdr } = require('@stellar/stellar-sdk');

const data = fs.readFileSync('spec.bin');

let offset = 0;
while (offset < data.length) {
    let found = false;
    for (let len = 4; len <= data.length - offset; len += 4) {
        try {
            const slice = data.subarray(offset, offset + len);
            const entry = xdr.ScSpecEntry.fromXDR(slice);
            const b64 = entry.toXDR('base64');
            if (Buffer.from(b64, 'base64').length === slice.length) {
                console.log('"' + b64 + '",');
                offset += len;
                found = true;
                break;
            }
        } catch (e) {}
    }
    if (!found) { console.log("Failed at offset", offset); break; }
}
