"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RelationDatabase_1 = require("../types/RelationDatabase");
function default_1(snapshot) {
    snapshot.implement('find-relations', (query) => {
        const filterArgs = query.args;
        if (filterArgs.length === 0)
            return query.respond([]);
        const filterCallbacks = [];
        for (const item of filterArgs) {
            if (item === '*')
                continue;
            return query.respond("didn't understand filter: " + item);
        }
        const relationDatabase = RelationDatabase_1.getRelationDatabase(query);
        const found = [];
        for (const rel of relationDatabase.everyRelation) {
            let pass = true;
            for (const callback of filterCallbacks) {
                if (!callback(rel)) {
                    pass = false;
                    break;
                }
            }
            if (pass)
                found.push(rel);
        }
        query.respond(found);
    });
}
exports.default = default_1;
//# sourceMappingURL=find-relations.js.map