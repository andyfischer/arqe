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
        /*
        const options = cxt.getOptionsObject(key.getTag("ws-sync"));

        if (!options.host || !options.pattern)
            continue;

        const pattern = parsePattern(options.pattern);

        syncs.push(new WebSocketSync(options.host, pattern));
        */
    }
    return syncs;
}
exports.updateWebSocketSyncs = updateWebSocketSyncs;
