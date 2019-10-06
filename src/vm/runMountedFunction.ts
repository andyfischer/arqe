
import FunctionMount from './FunctionMount'
import { Scope } from '../Scope'
import { resolveIncoming } from '../native-interface'

export default function runMountedFunction(func: FunctionMount, scope: Scope) {
    const resolvedInputs = resolveIncoming(scope, func.inputs);

    const result = func.callback.apply(null, resolveIncoming)

    return result;
}
