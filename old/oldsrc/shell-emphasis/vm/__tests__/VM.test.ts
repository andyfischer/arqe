
import VM from '../VM'
import { Scope } from '../../scope'

describe('VM', () => {
    it('handles simple commands', () => {
        const vm = new VM();
        vm.mountFunction('concat-strings', {
            inputs: [{ restStartingFrom: 1 }],
            outputs: [{ type: 'value' }],
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
            outputs: [{ type: 'value' }],
            callback(a, b) {
                return a + ' ' + b;
            }
        });

        const result = vm.evaluateSync('concat-a-and-b a=123 b=456');
        expect(result).toEqual('123 456');
    });

    it('handles values from the environment', () => {
        const vm = new VM();
        vm.scope.createSlotAndSet("a", "the value");

        vm.mountFunction('get-a', {
            inputs: [{ fromName: 'a' } ],
            outputs: [{ type: 'value' }],
            callback(a) {
                return a;
            }
        });

        const result = vm.evaluateSync('get-a');
        expect(result).toEqual('the value');
    });

    it('uses a provider for missing named values', () => {
        const vm = new VM();
        // vm.onLog = console.log;
        vm.scope.createSlotAndSet("#provider:a", "provide-a");
        vm.scope.createSlot("a");
        
        vm.mountFunction('provide-a', {
            inputs: [],
            outputs: [{ type: 'define', name: 'a' }],
            callback() {
                return "the provided value"
            }
        });

        vm.mountFunction('get-a', {
            inputs: [{ fromName: 'a' } ],
            outputs: [{ type: 'value' }],
            callback(a) {
                return a;
            }
        });

        const result = vm.evaluateSync('get-a');
        expect(result).toEqual('the provided value');
    });

    it('supports functions that make meta changes to scope', () => {
        const vm = new VM();

        vm.mountFunction('func', {
            inputs: [{
                fromMeta: 'scope'
            }],
            outputs: [],
            callback(scope: Scope) {
                scope.createSlotAndSet('a', 1);
            }
        });

        vm.evaluateSync('func');
        expect(vm.scope.get('a')).toEqual(1);
    });
});
