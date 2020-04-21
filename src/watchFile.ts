
import connect from './socket/openWebSocketClient'
import WatchFileApi from './WatchFileApi'
import CommandConnection from './socket/CommandConnection'
import Path from 'path'

let processClient: CommandConnection = null;

export default async function watchFile(filename: string, callback: () => void) {
    if (processClient === null) {
        processClient = await connect();
    }

    filename = Path.resolve(filename);

    const api = new WatchFileApi(processClient);

    let watch = await api.findFileWatch(filename);

    if (!watch) {
        watch = await api.createFileWatch(filename);
    }

    api.listenToFile(watch, (evt) => {
        console.log('saw: ' + evt.stringify());
        callback();
    });
}

async function main() {
    const filename = process.argv[2];
    console.log('trying to watch: ', filename);

    watchFile(filename, () => {
        console.log('saw change');
    })
    .catch(console.error);
}

if (require.main === module) {
    main()
    .catch(console.error);
}
