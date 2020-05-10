"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function outputValueToEffects(task, value, output) {
    switch (output.type) {
        case 'define':
            return [{
                    type: output.type,
                    name: output.name,
                    fromTaskId: task.id,
                    value
                }];
        case 'value':
            return [{
                    type: output.type,
                    fromTaskId: task.id,
                    value
                }];
        case 'vmeffect':
            return value;
    }
    throw new Error('unhandled output.type: ' + output.type);
}
exports.default = outputValueToEffects;
//# sourceMappingURL=outputValueToEffects.js.map