import InputSignature from './InputSignature';
import VM from './VM';
import Task from './Task';
interface InputError {
    id: number;
    notFound: true;
}
interface Result {
    errors?: InputError[];
    hasPending?: boolean;
    values: any[];
}
export default function resolveInputs(vm: VM, task: Task, inputs: InputSignature[]): Result;
export {};
