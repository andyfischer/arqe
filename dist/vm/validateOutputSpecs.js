"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateOutputSpecs(outputs) {
    return [];
}
exports.default = validateOutputSpecs;
function assertOutputSpecs(outputs) {
    const errors = validateOutputSpecs(outputs);
    if (errors.length > 0) {
        throw new Error("assertOutputSpecs failed with these error(s): "
            + errors.join(', '));
    }
}
exports.assertOutputSpecs = assertOutputSpecs;
//# sourceMappingURL=validateOutputSpecs.js.map