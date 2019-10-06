
import InputSpec from './InputSpec'
import { Scope } from '../scope'

const MissingValue = Symbol('missing');
const ErrorValue = Symbol('error');

interface InputError {
    id: number
    notFound: true
}

interface Result {
    errors?: InputError[]
    values: any[]
}

function resolveInputs(scope: Scope, inputSpecs: InputSpec[]): Result {
    const result: Result = {
        values: [],
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

    return result;
}

export default resolveInputs;

export function resolveInputs_PropTest(scope: Scope, inputSpecs: InputSpec[]): Result {

    const result = resolveInputs(scope, inputSpecs);

    if (result.values.length !== inputSpecs.length) {
        throw new Error(`proptest failure in resolveInputs: result has different length `
                        +`(${result.values.length}) than inputSpecs length (${inputSpecs.length})`);

    }

    return result;
}


