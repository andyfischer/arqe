"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RelationDatabase_1 = require("../types/RelationDatabase");
function default_1(query) {
    if (query.relation) {
        const db = RelationDatabase_1.getRelationDatabase(query);
        db.everyRelation.push({
            relation: query.relation,
            relationSubject: query.relationSubject,
            relationArgs: []
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=growRelationDatabase.js.map