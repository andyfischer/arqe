"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("../parseCommand"));
const stringifyQuery_1 = require("../stringifyQuery");
function testRestringify(str) {
    const restringified = stringifyQuery_1.parsedCommandToString(parseCommand_1.default(str));
    expect(restringified).toEqual(str);
}
describe("parsedCommandToString", () => {
    it("works", () => {
        const parsed = parseCommand_1.default('get x y');
        expect(stringifyQuery_1.parsedCommandToString(parsed)).toEqual('get x y');
    });
    it("handles payloads", () => {
        const parsed = parseCommand_1.default('set x y == 123');
        expect(stringifyQuery_1.parsedCommandToString(parsed)).toEqual('set x y == 123');
    });
});
describe("appendTagInCommand", () => {
    it("works", () => {
        expect(stringifyQuery_1.appendTagInCommand('get x y', 'extra')).toEqual('get x y extra');
        expect(stringifyQuery_1.appendTagInCommand('set x y == 1', 'extra')).toEqual('set x y extra == 1');
    });
});
it("restringify tests", () => {
    testRestringify("set *");
    testRestringify("set **");
});
