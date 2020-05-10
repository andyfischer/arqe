"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VM_1 = __importDefault(require("../VM"));
describe('VM', () => {
    it('handles simple commands', () => {
        const vm = new VM_1.default();
        vm.mountFunction('concat-strings', {
            inputs: [{ restStartingFrom: 1 }],
            outputs: [{ type: 'value' }],
            callback(args) {
                return args.join(' ');
            }
        });
        const result = vm.evaluateSync('concat-strings 1 2 3');
        expect(result).toEqual('1 2 3');
    });
    it('handles name-value inputs', () => {
        const vm = new VM_1.default();
        vm.mountFunction('concat-a-and-b', {
            inputs: [{ fromName: 'a' }, { fromName: 'b' }],
            outputs: [{ type: 'value' }],
            callback(a, b) {
                return a + ' ' + b;
            }
        });
        const result = vm.evaluateSync('concat-a-and-b a=123 b=456');
        expect(result).toEqual('123 456');
    });
    it('handles values from the environment', () => {
        const vm = new VM_1.default();
        vm.scope.createSlotAndSet("a", "the value");
        vm.mountFunction('get-a', {
            inputs: [{ fromName: 'a' }],
            outputs: [{ type: 'value' }],
            callback(a) {
                return a;
            }
        });
        const result = vm.evaluateSync('get-a');
        expect(result).toEqual('the value');
    });
    it('uses a provider for missing named values', () => {
        const vm = new VM_1.default();
        vm.scope.createSlotAndSet("#provider:a", "provide-a");
        vm.scope.createSlot("a");
        vm.mountFunction('provide-a', {
            inputs: [],
            outputs: [{ type: 'define', name: 'a' }],
            callback() {
                return "the provided value";
            }
        });
        vm.mountFunction('get-a', {
            inputs: [{ fromName: 'a' }],
            outputs: [{ type: 'value' }],
            callback(a) {
                return a;
            }
        });
        const result = vm.evaluateSync('get-a');
        expect(result).toEqual('the provided value');
    });
    it('supports functions that make meta changes to scope', () => {
        const vm = new VM_1.default();
        vm.mountFunction('func', {
            inputs: [{
                    fromMeta: 'scope'
                }],
            outputs: [],
            callback(scope) {
                scope.createSlotAndSet('a', 1);
            }
        });
        vm.evaluateSync('func');
        expect(vm.scope.get('a')).toEqual(1);
    });
});
//# sourceMappingURL=VM.test.js.map