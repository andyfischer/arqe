
import Relation from './fs/Relation'
import connect from './fs/socket/openWebSocketClient'
import Chokidar from 'chokidar'

const watchesByFilename = {
}

async function main() {
    const conn = await connect();

    const watcher = Chokidar.watch('', {
        persistent: true
    });

    watcher.on('change', path => {
        console.log('path has changed: ' + path);

        conn.run(`set file-watch/* filename(${path}) version((increment))`);
    });

    conn.run('listen -get file-watch/* filename/*', {
        relation(rel: Relation) {
            console.log('saw: ' + rel.stringify());

            const filename = rel.getTagValue('filename');

            if (!watchesByFilename[filename]) {
                console.log('creating watch for file: ' + filename);

                watchesByFilename[filename] = { }

                watcher.add(filename);
            }

        },
        finish() {}
    });

    console.log('Connected to server');
}

main()
.catch(console.error);
