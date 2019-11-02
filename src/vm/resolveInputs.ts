
import InputSignature from './InputSignature'
import { Scope } from '../scope'
import VM from './VM'
import Task from './Task'

const MissingValue = Symbol('missing');
const PendingValue = Symbol('pending');
const ErrorValue = Symbol('error');

interface InputError {
    id: number
    notFound: true
}

interface PendingInput {
    positionIndex: number
    taskId: number
}

interface Result {
    errors?: InputError[]
    hasPending?: boolean
    values: any[]
}

export default function resolveInputs(vm: VM, task: Task, inputs: InputSignature[]): Result {

    vm.log(`resolve-inputs taskId=${task.id}`);

    const scope = task.scope;
    const result: Result = {
        values: [],
        errors: []
    }

    const positionals = scope.getOptional('#positionals', []);

    for (const input of inputs) {
        vm.log(`resolve-one-input taskId=${task.id} inputId=${input.id} -- ${JSON.stringify(input)}`);

        // Handle 'fromPosition'
        if (input.fromPosition != null && input.fromPosition < positionals.length) {
            result.values.push(positionals[input.fromPosition]);
            continue;
        }

        // Handle 'fromName'
        if (input.fromName) {
            vm.log(`looking-for-named-input name=${input.fromName}`)

            const found = scope.getOptional(input.fromName, MissingValue);
            if (found !== MissingValue) {
                vm.log(`found-named-input name=${input.fromName}`)
                result.values.push(found);
                continue;
            }

            const provider = scope.getOptional('#provider:' + input.fromName, MissingValue);

            if (provider !== MissingValue) {
                const query = provider;
                const providerTaskId = vm.evaluateQuery(query);

                result.hasPending = true;
                result.values.push(pending);

                vm.graph.insert(`task/${providerTaskId} trigger/${task.id}`);

                vm.log(`resolver-started-provider taskId=${providerTaskId} -- ${query}`)
                continue;
            }
        }

        // Handle 'restStartingFrom'
        if (input.restStartingFrom) {
            const found = positionals.slice(input.restStartingFrom);
            result.values.push(found);
            continue;
        }

        // Handle 'restKeyValues'
        if (input.restKeyValues) {
            result.values.push(scope.getOptional('#commandOptions', {}));
            continue;
        }

        if (input.fromMeta === 'scope') {
            result.values.push(vm.scope);
            continue;
        }


        // Not found

        if (input.isRequired) {
            result.values.push(input.defaultValue);
            result.errors.push({
                id: input.id,
                notFound: true
            });

            continue;
        }

        result.values.push(input.defaultValue);
    }

    /* prop test

    if (result.values.length !== inputSpecs.length) {
        throw new Error(`proptest failure in resolveInputs: result has different length `
                        +`(${result.values.length}) than inputSpecs length (${inputSpecs.length})`);

    }
    */

    return result;
}
