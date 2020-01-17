
import { Scope } from '../scope'
import FunctionDefinition from '../vm/FunctionDefinition'

export default function defCommand(scope: Scope, commandName: string) {
    const def: FunctionDefinition = {
        inputs: [],
        outputs: []
    }

    scope.createSlotAndSet('#function:' + commandName, def);
}
