const fs = require('fs-extra');

async function main() {
    for (const i of Array(10000)) {
        await fs.appendFile("append.txt", i+ "\n");
    }
}

main();
