"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(query) {
    query.snapshot.modifyGlobal('autocompleteInfo', (info) => {
        if (!info) {
            info = {
                everyWord: {}
            };
        }
        for (const clause of query.syntax.clauses) {
            info.everyWord[clause.key] = true;
        }
        return info;
    });
}
exports.default = default_1;
//# sourceMappingURL=saveAutocompleteStrings.js.map