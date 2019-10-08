
import InputSignature from './InputSignature'
import OutputSignature from './OutputSignature'

export default class FunctionMount {
    inputs: InputSignature[]
    outputs: OutputSignature[]
    callback: any
}

export interface FunctionMountShorthand {
    inputs: InputSignature[]
    outputs?: OutputSignature[]
    callback: any
}

export function fixMountShorthand(mount: FunctionMountShorthand): FunctionMount {
    if (!mount.outputs) {
        mount.outputs = [{ type: 'emit-result' }]
    }

    return mount as FunctionMount;
}
