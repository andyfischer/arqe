
import RichValue from './RichValue'

export function getValidationError(val: RichValue): string | null {
    if (val === null)
        return "value is null"

    if (val === undefined)
        return "value is undefined"

    const t = typeof val;
    if (t === 'string')
        return `value has type string (${val})`

    if (t === 'number')
        return `value has type number (${val})`

    return null;
}

export function assertValue(val: RichValue) {
    const error = getValidationError(val);

    if (error)
        throw new Error("Invalid RV: " + error);
}
