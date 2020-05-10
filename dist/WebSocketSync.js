"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandConnection_1 = require("./socket/CommandConnection");
class WebSocketSync {
    constructor(host, pattern) {
        this.host = host;
        this.pattern = pattern;
        this.connection = CommandConnection_1.connectToServer(host);
    }
}
exports.default = WebSocketSync;
function updateWebSocketSyncs(cxt) {
    const syncs = [];
    for (const rel of cxt.getRelations('tag-definition provider/wssync *')) {
    }
    return syncs;
}
exports.updateWebSocketSyncs = updateWebSocketSyncs;
//# sourceMappingURL=WebSocketSync.js.map