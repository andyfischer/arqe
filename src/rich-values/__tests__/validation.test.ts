
import { getValidationError, assertValue } from '../validation'
import { error } from '..'

it('null is invalid', () => {
    expect(getValidationError(null)).not.toEqual(null);
});

it('undefined is invalid', () => {
    expect(getValidationError(undefined)).not.toEqual(null);
});

it('non-objects are invalid', () => {
    expect(getValidationError(1)).not.toEqual(null);
    expect(getValidationError("hi")).not.toEqual(null);
});

it('objects are valid', () => {
    assertValue({message: 'hi'});
});

it('errors are valid', () => {
    assertValue(error('hi'));
});
