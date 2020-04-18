
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
        console.log('creating a new watch');
        watch = await api.createFileWatch(filename);
        console.log('created watch: ' + watch);
    }
}

async function main() {
    const filename = process.argv[2];
    console.log('trying to watch: ', filename);

    watchFile(filename, () => {
        console.log('saw change');
    });
}

if (require.main === module) {
    main()
    .catch(console.error);
}
