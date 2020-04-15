
import connect from './fs/socket/openWebSocketClient'

async function main() {
    const conn = await connect();

    const filename = process.argv[2];

    console.log('watching filename: ', filename);

    conn.run(`get file-watch/* filename/${filename}`, {
        relation(rel) { console.log(rel.stringify()) },
        isDone() { return false },
        finish() {}
    });
}

main()
.catch(console.error);
