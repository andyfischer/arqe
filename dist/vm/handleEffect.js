"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handleEffect(vm, effect) {
    switch (effect.type) {
        case 'define':
            vm.scope.set(effect.name, effect.value);
            return;
        case 'value': {
            const task = vm.tasks[effect.fromTaskId];
            task.result = effect.value;
            return;
        }
    }
    throw new Error('unhandled effect type: ' + effect.type);
}
exports.default = handleEffect;
//# sourceMappingURL=handleEffect.js.map