"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function defCommand(scope, commandName) {
    const def = {
        inputs: [],
        outputs: []
    };
    scope.createSlotAndSet('#function:' + commandName, def);
}
exports.default = defCommand;
//# sourceMappingURL=defCommand.js.map