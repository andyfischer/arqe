"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../validation");
const __1 = require("..");
it('null is invalid', () => {
    expect(validation_1.getValidationError(null)).not.toEqual(null);
});
it('undefined is invalid', () => {
    expect(validation_1.getValidationError(undefined)).not.toEqual(null);
});
it('non-objects are invalid', () => {
    expect(validation_1.getValidationError(1)).not.toEqual(null);
    expect(validation_1.getValidationError("hi")).not.toEqual(null);
});
it('objects are valid', () => {
    validation_1.assertValue({ message: 'hi' });
});
it('errors are valid', () => {
    validation_1.assertValue(__1.error('hi'));
});
//# sourceMappingURL=validation.test.js.map