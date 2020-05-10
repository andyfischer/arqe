"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function assertInputSpecs(inputs) {
    const errors = validateInputSpecs(inputs);
    if (errors.length > 0) {
        throw new Error("assertOutputSpecs failed with these error(s): "
            + errors.join(', '));
    }
}
exports.assertInputSpecs = assertInputSpecs;
function validateInputSpecs(inputs) {
    return [];
}
exports.default = validateInputSpecs;
//# sourceMappingURL=validateInputSpecs.js.map