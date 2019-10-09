
import InputSignature from './InputSignature'
import { Scope } from '../scope'
import VM from './VM'

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
    pending: PendingInput[]
    values: any[]
}

export default function resolveInputs(scope: Scope, inputSpecs: InputSignature[]): Result {
    const result: Result = {
        values: [],
        pending: [],
        errors: []
    }

    const positionals = scope.getOptional('#positionals', []);

    for (const input of inputSpecs) {
        // Handle 'fromPosition'
        if (input.fromPosition != null && input.fromPosition < positionals.length) {
            result.values.push(positionals[input.fromPosition]);
            continue;
        }

        // Handle 'fromName'
        if (input.fromName) {
            const found = scope.getOptional(input.fromName, MissingValue);
            if (found !== MissingValue) {
                result.values.push(found);
                continue;
            }

            const defaultProvider = scope.getOptional('#provider:' + input.fromName, MissingValue);
            if (found !== MissingValue) {

                const vm: VM = scope.get("#vm");
                const query = found;
                const taskId = vm.executeQueryString(query);

                result.values.push(pending);
                result.pending.push({
                    positionIndex: result.values.length,
                    taskId
                })
            }
        }

        // Handle 'restStartingFrom'
        if (input.restStartingFrom) {
            const found = positionals.slice(input.restStartingFrom);
            result.values.push(found);
            continue;
        }

        if (input.required) {
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
