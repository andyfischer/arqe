
import OutputSpec from './OutputSpec'

export default function validateOutputSpecs(outputs: OutputSpec[]) {

    if (outputs.length === 0)
        return ["has 0 outputs"]

    return []
}

export function assertOutputSpecs(outputs: OutputSpec[]) {
    const errors = validateOutputSpecs(outputs);
    if (errors.length > 0) {
        throw new Error("assertOutputSpecs failed with these error(s): "
                        + errors.join(', '));
    }
}
