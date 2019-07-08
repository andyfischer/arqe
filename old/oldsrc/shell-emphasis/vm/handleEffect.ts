
import VM from './VM'
import VMEffect from './VMEffect'

export default function handleEffect(vm: VM, effect: VMEffect) {
    switch (effect.type) {
    case 'define':
        vm.scope.set(effect.name, effect.value);
        return;

    case 'value': {
        const task = vm.tasks[effect.fromTaskId]
        task.result = effect.value;
        return;
    }

    }

    throw new Error('unhandled effect type: '  + effect.type);
}
