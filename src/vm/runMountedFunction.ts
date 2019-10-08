
import FunctionMount from './FunctionMount'
import { Scope } from '../Scope'
import resolveInputs from './resolveInputs'
import VM from './VM'
import VMEffect from './VMEffect'
import OutputSpec from './OutputSpec'

function valueToEffect(execId: number, value: any, output: OutputSpec) {
    switch (output.type) {
    case 'set-env':
        return {
            type: output.type,
            name: output.name,
            execId,
            value
        }
    case 'emit-result':
        return {
            type: output.type,
            execId,
            value
        }
    }

    throw new Error('unhandled output.type: ' + output.type);
}

export default function runMountedFunction(vm: VM, execId: number, scope: Scope, func: FunctionMount) {
    const resolved = resolveInputs(scope, func.inputs);

    if (resolved.errors.length > 0)
        throw new Error("error(s) resolving inputs: " + resolved.errors);

    const rawResult = func.callback.apply(null, resolved.values);

    // handle effects
    const outputSpec = func.outputs;
    for (let i = 0; i < func.outputs.length; i++) {
        const spec = func.outputs[i];
        vm.handleEffect(valueToEffect(execId, rawResult, spec));
    }
}
