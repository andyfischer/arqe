"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getValidationError(val) {
    if (val === null)
        return "value is null";
    if (val === undefined)
        return "value is undefined";
    const t = typeof val;
    if (t === 'string')
        return `value has type string (${val})`;
    if (t === 'number')
        return `value has type number (${val})`;
    return null;
}
exports.getValidationError = getValidationError;
function assertValue(val) {
    const error = getValidationError(val);
    if (error)
        throw new Error("Invalid RV: " + error);
}
exports.assertValue = assertValue;
//# sourceMappingURL=validation.js.map