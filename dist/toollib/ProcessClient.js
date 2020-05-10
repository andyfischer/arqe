"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _processClient = null;
async function getProcessClient() {
    if (_processClient === null) {
        _processClient = await connect();
    }
    return _processClient;
}
exports.getProcessClient = getProcessClient;
//# sourceMappingURL=ProcessClient.js.map