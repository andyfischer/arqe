
import ExpressPromisedApp from '../express-promised-app'
import { print, randomHex } from '../utils'
// import { submitQuery } from '../query'
// import { saveEvent } from '../snapshot'

export default function setupEndpoints(app: ExpressPromisedApp) {
    app.get('/hi', async (req) => {
        return {
            response: 'hello',
            server: 'wish'
        }
    });

    app.post('/command', async (req) => {

        const { cmd, session } = req.body;

        print('received command: ' + cmd);

        return {}
        // return await submitQuery({query: cmd, session});
    });

    app.post('/start-terminal', async (req) => {
        const session = 'terminal-' + randomHex(8);

        // await saveEvent({name: 'newTerminalSession', session });

        return { session };
    });
}
