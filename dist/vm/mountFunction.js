"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateOutputSpecs_1 = require("./validateOutputSpecs");
function mountFunction(scope, name, def) {
    for (let i = 0; i < def.inputs.length; i += 1) {
        if (def.inputs[i].id == null)
            def.inputs[i].id = i;
    }
    validateOutputSpecs_1.assertOutputSpecs(def.outputs);
    scope.createSlotAndSet('#function:' + name, def);
}
exports.default = mountFunction;
//# sourceMappingURL=mountFunction.js.map