"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ClientConnection_1 = require("../socket/ClientConnection");
let _processClient = null;
async function getProcessClient() {
    if (_processClient === null) {
        _processClient = await ClientConnection_1.connectToServer();
    }
    return _processClient;
}
exports.default = getProcessClient;
//# sourceMappingURL=getProcessClient.js.map