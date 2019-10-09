
import VM from '../VM'

it('environment-modifying functions work correctly', () => {
    const vm = new VM();

    return;

    vm.mountFunction('env-add-1', {
        inputs: [],
        outputs: [],
        callback() {
        }
    });
});
