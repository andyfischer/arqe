
import connect from './socket/openWebSocketClient'
import WatchFileApi from './WatchFileApi'
import CommandConnection from './socket/CommandConnection'

let processClient: CommandConnection = null;

export async function watchFile(filename: string, callback: () => void) {
    if (processClient === null) {
        processClient = await connect();
    }

    const api = new WatchFileApi(processClient);

    let watch = await api.findFileWatch(filename);

    console.log('found existing watch: ' + watch);

    if (!watch) {
        // watch = await api.createFileWatch(filename);
    }
}

async function main() {
    const conn = await connect();
    // const api = new WatchFileApi(conn);

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
