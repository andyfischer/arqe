"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
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
    });
    app.post('/start-terminal', async (req) => {
        const session = 'terminal-' + utils_1.randomHex(8);
        return { session };
    });
}
exports.default = setupEndpoints;
//# sourceMappingURL=setupEndpoints.js.map