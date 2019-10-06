
import InputSpec from './InputSpec'
import OutputSpec from './OutputSpec'

export default class FunctionMount {
    inputs: InputSpec[]
    output: OutputSpec | OutputSpec[]
    callback: any
}
