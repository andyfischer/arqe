
import VM from '../VM'

describe('VM', () => {
    it('handles simple commands', () => {
        const vm = new VM();
        vm.mountFunction('concat-strings', {
            inputs: [{
                restStartingFrom: 1
            }],
            outputs: [{
                type: 'emit-result'
            }],
            callback(args: string[]) {
                return args.join(' ')
            }
        });

        const results = [];
        vm.onResult = (id, val) => results.push(val);

        vm.executeQueryString('concat-strings 1 2 3', {});

        expect(results).toEqual(['1 2 3']);
    });
});
