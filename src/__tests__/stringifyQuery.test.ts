
import parseCommand from '../parseCommand'
import { parsedCommandToString, appendTagInCommand } from '../stringifyQuery'

function testRestringify(str: string) {
    const restringified = parsedCommandToString(parseCommand(str))
    expect(restringified).toEqual(str);
}

describe("parsedCommandToString", () => {
    it("works", () => {
        const parsed = parseCommand('get x y');
        expect(parsedCommandToString(parsed)).toEqual('get x y');
    });

    it("handles payloads", () => {
        const parsed = parseCommand('set x y == 123');
        expect(parsedCommandToString(parsed)).toEqual('set x y == 123');
    });
});

describe("appendTagInCommand", () => {
    it("works", () => {
        expect(appendTagInCommand('get x y', 'extra')).toEqual('get x y extra');
        expect(appendTagInCommand('set x y == 1', 'extra')).toEqual('set x y extra == 1');
    });
});

it("restringify tests", () => {
    testRestringify("set *");
    testRestringify("set **");
});
