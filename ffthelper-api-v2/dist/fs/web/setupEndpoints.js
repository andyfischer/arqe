"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
// import { submitQuery } from '../query'
// import { saveEvent } from '../snapshot'
function setupEndpoints(app) {
    app.get('/hi', async (req) => {
        return {
            response: 'hello',
            server: 'papert'
        };
    });
    app.post('/command', async (req) => {
        const { cmd, session } = req.body;
        utils_1.print('received command: ' + cmd);
        return {};
        // return await submitQuery({query: cmd, session});
    });
    app.post('/start-terminal', async (req) => {
        const session = 'terminal-' + utils_1.randomHex(8);
        // await saveEvent({name: 'newTerminalSession', session });
        return { session };
    });
}
exports.default = setupEndpoints;
