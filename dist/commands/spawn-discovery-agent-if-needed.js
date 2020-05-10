"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdlib_1 = require("../stdlib");
function default_1(snapshot) {
    snapshot.implement('spawn-discovery-agent-if-needed', (query) => {
        stdlib_1.spawn(query.get('discovery-service/launch-cmd'));
        query.respond(null);
    });
}
exports.default = default_1;
//# sourceMappingURL=spawn-discovery-agent-if-needed.js.map