
import { Scope } from '../scope'
import FunctionDefinition from './FunctionDefinition'
import { assertInputSpecs } from './validateInputSpecs'
import { assertOutputSpecs } from './validateOutputSpecs'

export default function mountFunction(scope: Scope, name: string, def: FunctionDefinition) {
    // make sure each input has an ID.
    for (let i = 0; i < def.inputs.length; i += 1) {
        if (def.inputs[i].id == null)
            def.inputs[i].id = i;
    }

    assertOutputSpecs(def.outputs);
    scope.createSlotAndSet('#function:' + name, def);
}
