
import Relation from './fs/Relation'
import WebSocket from 'ws'
import CommandConnection from './fs/socket/CommandConnection'

const watches = {}

async function connectToSocketServer() {
    const ws = new WebSocket('http://localhost:42940');
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    ws.on('close', () => {
        console.log('Disconnected from server');
        process.exit();
    });

    const commandConnection = new CommandConnection(ws);
    return commandConnection;
}

async function main() {
    const conn = await connectToSocketServer();

    conn.run('listen file-watch/*', {
        relation(rel: Relation) {
            console.log('saw: ' + rel.stringify())
        },
        isDone() { return false },
        finish() {}
    });
}
