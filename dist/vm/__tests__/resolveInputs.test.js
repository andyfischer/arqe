"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("../../scope");
const resolveInputs_1 = __importDefault(require("../resolveInputs"));
const VM_1 = __importDefault(require("../VM"));
const vm = new VM_1.default();
function quickTask(obj) {
    const scope = scope_1.scopeFromObject(obj);
    return {
        id: '1',
        scope
    };
}
it("handles positionals", () => {
    const task = quickTask({
        '#positionals': ['a', 'b']
    });
    const result = resolveInputs_1.default(vm, task, [{
            id: 0,
            fromPosition: 0
        }, {
            id: 1,
            fromPosition: 1
        }]);
    expect(result.values).toEqual(['a', 'b']);
    expect(result.errors).toEqual([]);
});
it("handles named", () => {
    const task = quickTask({
        a: 100,
        b: 200
    });
    const result = resolveInputs_1.default(vm, task, [{
            id: 0,
            fromName: "a"
        }, {
            id: 1,
            fromName: "b"
        }]);
    expect(result.values).toEqual([100, 200]);
    expect(result.errors).toEqual([]);
});
it("handles rest", () => {
    const task = quickTask({
        '#positionals': ['a', 'b', 'c', 'd']
    });
    const result = resolveInputs_1.default(vm, task, [{
            restStartingFrom: 1
        }]);
    expect(result.values).toEqual([['b', 'c', 'd']]);
    expect(result.errors).toEqual([]);
});
it("allows an arg to be either named or positional", () => {
    const spec = [{
            id: 0,
            fromPosition: 0,
            fromName: "arg-name"
        }];
    expect(resolveInputs_1.default(vm, quickTask({
        'arg-name': 'the value'
    }), spec).values).toEqual(['the value']);
    expect(resolveInputs_1.default(vm, quickTask({
        '#positionals': ['the value']
    }), spec).values).toEqual(['the value']);
});
it("signals an error for a missing required named input", () => {
    const task = quickTask({
        a: 100
    });
    const result = resolveInputs_1.default(vm, task, [{
            id: 0,
            fromName: "b",
            isRequired: true,
            defaultValue: "?"
        }]);
    expect(result.values).toEqual(["?"]);
    expect(result.errors).toEqual([{
            id: 0,
            notFound: true
        }]);
});
it("signals an error for a missing required positional input", () => {
    const task = quickTask({
        '#positionals': ["a"]
    });
    const result = resolveInputs_1.default(vm, task, [{
            id: 0,
            fromPosition: 2,
            isRequired: true,
            defaultValue: "?"
        }]);
    expect(result.values).toEqual(["?"]);
    expect(result.errors).toEqual([{
            id: 0,
            notFound: true
        }]);
});
it("doesn't signal an error for a missing non-required input", () => {
    const task = quickTask({});
    const result = resolveInputs_1.default(vm, task, [{
            id: 0,
            fromName: "name",
            defaultValue: "the default"
        }]);
    expect(result.values).toEqual(["the default"]);
    expect(result.errors).toEqual([]);
});
//# sourceMappingURL=resolveInputs.test.js.map