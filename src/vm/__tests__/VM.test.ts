
import VM from '../VM'

describe('VM', () => {
    it('handles simple commands', () => {
        const vm = new VM();
        vm.mountFunction('concat-strings', {
            inputs: [{ restStartingFrom: 1 }],
            outputs: [{ type: 'save-result' }],
            callback(args: string[]) {
                return args.join(' ')
            }
        });

        const result = vm.evaluateSync('concat-strings 1 2 3');
        expect(result).toEqual('1 2 3');
    });

    it('handles name-value inputs', () => {

        const vm = new VM();

        vm.mountFunction('concat-a-and-b', {
            inputs: [{ fromName: 'a' }, { fromName: 'b'} ],
            outputs: [{ type: 'save-result' }],
            callback(a, b) {
                return a + ' ' + b;
            }
        });

        const result = vm.evaluateSync('concat-a-and-b a=123 b=456');
        expect(result).toEqual('123 456');
    });

    it('handles values from the environment', () => {
        const vm = new VM();
        vm.scope.createSlot("a", "the value");

        vm.mountFunction('get-a', {
            inputs: [{ fromName: 'a' } ],
            outputs: [{ type: 'save-result' }],
            callback(a) {
                return a;
            }
        });

        const result = vm.evaluateSync('get-a');
        expect(result).toEqual('the value');
    });
});
