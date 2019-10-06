
import { InputSpec, OutputSpec } from '../native-interface'

export default class FunctionMount {
    inputs: InputSpec[]
    output: OutputSpec | OutputSpec[]
    callback: any
}
