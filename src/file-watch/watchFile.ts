
import Path from 'path'
import WatchFileApi from './WatchFileApi'
import getProcessClient from '../toollib/getProcessClient'

export default async function watchFile(filename: string, callback: () => void) {
    const graph = await getProcessClient();

    filename = Path.resolve(filename);

    const api = new WatchFileApi(graph);

    let watch = await api.findFileWatch(filename);
    if (!watch) {
        watch = await api.createFileWatch(filename);
    }

    api.listenToFile(watch, (evt) => {
        callback();
    });
}

async function main() {
    const filename = process.argv[2];

    watchFile(filename, () => {
        console.log('watchFile saw change');
    })
    .catch(console.error);
}

if (require.main === module) {
    main()
    .catch(console.error);
}
