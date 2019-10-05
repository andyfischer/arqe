
import { InputSpec, OutputSpec } from '../native-interface'

export default class FunctionMount {
    inputs: InputSpec[]
    outputs: OutputSpec | OutputSpec[]
    callback: any
}
