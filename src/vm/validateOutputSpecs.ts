
import OutputSignature from './OutputSignature'

export default function validateOutputSpecs(outputs: OutputSignature[]) {

    /*
       TODO
    if (outputs.length === 0)
        return ["has 0 outputs"]
        */

    return []
}

export function assertOutputSpecs(outputs: OutputSignature[]) {
    const errors = validateOutputSpecs(outputs);
    if (errors.length > 0) {
        throw new Error("assertOutputSpecs failed with these error(s): "
                        + errors.join(', '));
    }
}
