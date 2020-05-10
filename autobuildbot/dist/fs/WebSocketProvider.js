"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WebSocketProvider {
    constructor(host, pattern) {
        this.host = host;
        this.pattern = pattern;
    }
}
exports.default = WebSocketProvider;
function updateWebSocketProviders(cxt) {
    const syncs = [];
    for (const rel of cxt.getRelations('schema provider/wssync *')) {
        const options = cxt.getOptionsObject(rel.stringify());
        const anchor = rel.removeType('provider').removeType('schema');
        if (!options.host)
            continue;
        console.log('Mounting WS with options: ', options, ' on pattern: ', anchor.stringify());
        syncs.push(new WebSocketProvider(options.host, anchor));
    }
    return syncs;
}
exports.updateWebSocketProviders = updateWebSocketProviders;
//# sourceMappingURL=WebSocketProvider.js.map