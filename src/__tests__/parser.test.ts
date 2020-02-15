

import { parseCommandChain } from '../parseCommand'

it('parses correctly', () => {
    const chain = parseCommandChain("get x y | join y z");
    expect(chain.commands[0].stringify()).toEqual('get x y');
    expect(chain.commands[1].stringify()).toEqual('join y z');
});
