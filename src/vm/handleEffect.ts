
import VM from './VM'
import VMEffect from './VMEffect'

export default function handleEffect(vm: VM, effect: VMEffect) {
    switch (effect.type) {
    case 'set-env':
        vm.scope.set(effect.name, effect.value);
        return;

    case 'save-result': {
        const task = vm.tasks[effect.fromTaskId]
        task.result = effect.value;
        return;
    }
    case 'fill-pending-input': {
    }

    }

    throw new Error('unhandled effect.type: '  + effect.type);
}
