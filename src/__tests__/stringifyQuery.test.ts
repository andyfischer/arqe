
import parseCommand from '../parseCommand'
import { parsedCommandToString, appendTagInCommand } from '../stringifyQuery'
import Pattern from '../Pattern'
import { newTagFromObject } from '../PatternTag'

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
    testRestringify("join $a")
    testRestringify("join $a $b")
    testRestringify("join a/$a $b")
});

it('stringifies tag identifiers', () => {
    expect((new Pattern([newTagFromObject({identifier: 'foo', star: true})])).stringify()).toEqual('$foo');
    expect((new Pattern([newTagFromObject({identifier: 'foo', tagType: 'type', starValue: true})])).stringify()).toEqual('type/$foo');
    expect((new Pattern([newTagFromObject({identifier: 'foo', tagType: 'type'})])).stringify()).toEqual('[from $foo] type');
    expect((new Pattern([newTagFromObject({identifier: 'foo', tagType: 'type', tagValue: 'value'})])).stringify()).toEqual('[from $foo] type/value');
});
