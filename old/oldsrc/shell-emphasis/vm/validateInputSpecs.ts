
import InputSignature from './InputSignature'

export function assertInputSpecs(inputs: InputSignature[]) {
    const errors = validateInputSpecs(inputs);
    if (errors.length > 0) {
        throw new Error("assertOutputSpecs failed with these error(s): "
                        + errors.join(', '));
    }
}

export default function validateInputSpecs(inputs: InputSignature[]) {
    // TODO- add validations here

    return []
}
