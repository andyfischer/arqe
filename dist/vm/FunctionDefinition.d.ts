import InputSignature from './InputSignature';
import OutputSignature from './OutputSignature';
export default class FunctionDefinition {
    inputs: InputSignature[];
    outputs: OutputSignature[];
    callback?: any;
}
