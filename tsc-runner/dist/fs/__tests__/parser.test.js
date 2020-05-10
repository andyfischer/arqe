"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = require("../parseCommand");
it('parses correctly', () => {
    const chain = parseCommand_1.parseCommandChain("get x y | join y z");
    expect(chain.commands[0].stringify()).toEqual('get x y');
    expect(chain.commands[1].stringify()).toEqual('join y z');
});
//# sourceMappingURL=parser.test.js.map