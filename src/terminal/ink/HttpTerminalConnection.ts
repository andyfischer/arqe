
import Bent from 'bent'
import { print } from '../..'

const host = 'http://localhost:9140'
const get = Bent(host, 'json')
const post = Bent(host, 'json', 'POST')

export default class HttpTerminalConnection {

    session: string;

    async start() {
        const ok = await get('/hi')
            .catch(() => { error: true });

        if (!ok || ok.error)
            throw new Error("[external] Couldn't connect to host at: " + host);

        if (ok.server !== 'papert') 
            throw new Error("[external] Host doesn't seem to be a compatible server: " + host);

        const startSession = await post('/start-terminal', {});

        if (!startSession.session)
            throw new Error("[external] Server didn't provide session ID");

        this.session = startSession.session;

        print('started session: ' + startSession.session);
    }

    async submitCommand(cmd: string) {
        const resp = await post('/command', { cmd, session: this.session });

        return resp;
    }
}
