
import Relation from './fs/Relation'
import connect from './fs/socket/openWebSocketClient'

const watches = {}

async function main() {
    const conn = await connect();

    conn.run('listen file-watch/* **', {
        relation(rel: Relation) {
            console.log('saw: ' + rel.stringify())
        },
        isDone() { return false },
        finish() {}
    });

    conn.run('listen file-watch/* filename/*', {
        relation(rel: Relation) {
            console.log('saw: ' + rel.stringify())
        },
        isDone() { return false },
        finish() {}
    });

    console.log('Connected to server');
}

main()
.catch(console.error);
