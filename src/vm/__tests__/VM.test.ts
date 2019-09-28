
import VM from '../VM'

describe('VM', () => {
    it('handles simple commands', () => {
        const vm = new VM();
        vm.lookupCommand = (name) => {
            if (name === 'concat-strings') {
                return (cxt) => {
                    cxt.respond(cxt.positionals.slice(1).join(' '))
                }
            }
        }

        const results = [];
        vm.onResult = (id, val) => results.push(val);

        vm.executeQueryString('concat-strings 1 2 3', {});

        expect(results).toEqual(['1 2 3']);
    });
});
