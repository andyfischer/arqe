"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MissingValue = Symbol('missing');
const PendingValue = Symbol('pending');
const ErrorValue = Symbol('error');
function resolveInputs(vm, task, inputs) {
    vm.log(`resolve-inputs taskId=${task.id}`);
    const scope = task.scope;
    const result = {
        values: [],
        errors: []
    };
    const positionals = scope.getOptional('#positionals', []);
    for (const input of inputs) {
        vm.log(`resolve-one-input taskId=${task.id} inputId=${input.id} -- ${JSON.stringify(input)}`);
        if (input.fromPosition != null && input.fromPosition < positionals.length) {
            result.values.push(positionals[input.fromPosition]);
            continue;
        }
        if (input.fromName) {
            vm.log(`looking-for-named-input name=${input.fromName}`);
            const found = scope.getOptional(input.fromName, MissingValue);
            if (found !== MissingValue) {
                vm.log(`found-named-input name=${input.fromName}`);
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
                vm.log(`resolver-started-provider taskId=${providerTaskId} -- ${query}`);
                continue;
            }
        }
        if (input.restStartingFrom) {
            const found = positionals.slice(input.restStartingFrom);
            result.values.push(found);
            continue;
        }
        if (input.restKeyValues) {
            result.values.push(scope.getOptional('#commandOptions', {}));
            continue;
        }
        if (input.fromMeta === 'scope') {
            result.values.push(vm.scope);
            continue;
        }
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
    return result;
}
exports.default = resolveInputs;
//# sourceMappingURL=resolveInputs.js.map