
import { Scope } from '../scope'
import FunctionMount from './FunctionMount'
import { assertInputSpecs } from './validateInputSpecs'
import { assertOutputSpecs } from './validateOutputSpecs'

export default function mountFunction(scope: Scope, name: string, mount: FunctionMount) {
    // make sure each input has an ID.
    for (let i = 0; i < mount.inputs.length; i += 1) {
        if (mount.inputs[i].id == null)
            mount.inputs[i].id = i;
    }

    assertOutputSpecs(mount.outputs);
    scope.createSlotAndSet('#function:' + name, mount);
}
