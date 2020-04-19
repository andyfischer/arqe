
import connect from './socket/openWebSocketClient'
import WatchFileApi from './WatchFileApi'
import CommandConnection from './socket/CommandConnection'

let processClient: CommandConnection = null;

export default async function watchFile(filename: string, callback: () => void) {
    if (processClient === null) {
        processClient = await connect();
    }

    const api = new WatchFileApi(processClient);

    let watch = await api.findFileWatch(filename);

    if (!watch) {
        watch = await api.createFileWatch(filename);
    }


    
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
