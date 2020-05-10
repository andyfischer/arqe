"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyQuery_1 = require("../stringifyQuery");
const parseCommand_1 = require("../parseCommand");
function testRestringify(str) {
    const restringified = stringifyQuery_1.stringifyCommandChain(parseCommand_1.parseCommandChain(str));
    expect(restringified).toEqual(str);
}
it('works', () => {
    testRestringify('get a');
    testRestringify('get a | join b');
    testRestringify('get a b $c | join b $c d');
    testRestringify('get a | join b | join c');
});
