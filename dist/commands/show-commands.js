"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(snapshot) {
    snapshot.implement('show-commands', (query) => {
        const db = query.get('commandDB');
        query.respond(JSON.stringify(db, null, 2));
    });
}
exports.default = default_1;
//# sourceMappingURL=show-commands.js.map