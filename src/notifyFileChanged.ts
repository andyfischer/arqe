
import getProcessClient from './toollib/getProcessClient'
import Path from 'path'
import WatchFileApi from './file-watch/WatchFileApi'

async function main() {
    let filename = process.argv[2];
    filename = Path.resolve(filename);
    const graph = await getProcessClient();
    const api = new WatchFileApi(graph);
    await api.postChange(filename);
    graph.close();
}

if (require.main === module) {
    main()
    .catch(e => {
        process.exitCode = -1;
        console.error(e);
    });
}
