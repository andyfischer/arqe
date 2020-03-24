
import { stringifyCommandChain } from '../stringifyQuery'
import { parseCommandChain } from '../parseCommand'

function testRestringify(str: string) {
    const restringified = stringifyCommandChain(parseCommandChain(str))
    expect(restringified).toEqual(str);
}

it('works', () => {
    testRestringify('get a');
    testRestringify('get a | join b');
    testRestringify('get a b $c | join b $c d');
    testRestringify('get a | join b | join c');
});
