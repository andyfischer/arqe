"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setupBuiltinSlots(scope) {
    scope.createSlot("commandDatabase");
    scope.createSlot("relations");
    scope.createSlot("relationDatabase");
    scope.createSlot("lastIncompleteClause");
    scope.createSlot("thisQueryStr");
    scope.createSlot("lastQueryStr");
    scope.createSlot("autocompleteInfo");
    scope.createSlot("functionDatabase");
}
exports.default = setupBuiltinSlots;
//# sourceMappingURL=setupBuiltinSlots.js.map