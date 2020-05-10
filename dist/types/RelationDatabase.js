"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getZeroRelationDatabase() {
    return {
        everyRelation: []
    };
}
exports.getZeroRelationDatabase = getZeroRelationDatabase;
function getRelationDatabase(key) {
    const snapshot = key.snapshot || key;
    return snapshot.getValue('relationDatabase');
}
exports.getRelationDatabase = getRelationDatabase;
//# sourceMappingURL=RelationDatabase.js.map