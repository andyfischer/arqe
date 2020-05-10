"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(snapshot) {
    snapshot.implement('def-slot', (query) => {
        const name = query.args[0];
        query.snapshot.globalScope.createSlot(name);
    });
}
exports.default = default_1;
//# sourceMappingURL=def-slot.js.map