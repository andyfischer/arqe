
import FunctionMount from './FunctionMount'
import { Scope } from '../Scope'
import resolveInputs from './resolveInputs'
import VM from './VM'
import VMEffect from './VMEffect'
import OutputSpec from './OutputSpec'

function valueToEffect(value: any, output: OutputSpec) {
    switch (output.type) {
    case 'set-env':
        return {
            type: output.type,
            name: output.name,
            value
        }
    case 'emit-result':
        return {
            type: output.type,
            value
        }
    }

    throw new Error('unhandled output.type: ' + output.type);
}

export default function runMountedFunction(vm: VM, scope: Scope, func: FunctionMount) {
    const inputs = resolveInputs(scope, func.inputs);

    const result = func.callback.apply(null, inputs);

    // handle effects
    const outputSpec = func.output;
    if (Array.isArray(outputSpec)) {
        for (let i = 0; i < outputSpec.length; i++) {
            const spec = outputSpec[i];
            vm.handleEffect(valueToEffect(result[i], spec));
        }
    } else {
        vm.handleEffect(valueToEffect(result, outputSpec));
    }
}
