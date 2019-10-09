
/*
import FunctionMount from './FunctionMount'
import { Scope } from '../Scope'
import resolveInputs from './resolveInputs'
import VM from './VM'
import VMEffect from './VMEffect'
import OutputSignature from './OutputSignature'


export default function runMountedFunction(vm: VM, taskId: number, scope: Scope, func: FunctionMount) {
        const funcMount = this.functionMounts[commandName];

        if (!commandName)
            throw new Error('no command name found: ' + commandName);

        runMountedFunction(this, taskId, scope, funcMount);
        return taskId;

    const resolved = resolveInputs(scope, func.inputs);

    if (resolved.errors.length > 0)
        throw new Error("error(s) resolving inputs: " + resolved.errors);

    for (const pending of resolved.pending) {

    }

    const rawResult = func.callback.apply(null, resolved.values);

    // handle effects
    const outputSpec = func.outputs;
    for (let i = 0; i < func.outputs.length; i++) {
        const spec = func.outputs[i];
        vm.handleEffect(outputValueToEffect(taskId, rawResult, spec));
    }
}
*/
