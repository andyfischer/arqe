
import { Scope, scopeFromObject } from '../../scope'
import resolveInputs from '../resolveInputs'
import Task from '../Task'
import VM from '../VM'

const vm = new VM();

function quickTask(obj: any): Task {
    const scope = scopeFromObject(obj);
    return {
        id: '1',
        scope
    }
}

it("handles positionals", () => {

    const task = quickTask({
        '#positionals': ['a', 'b']
    });

    const result = resolveInputs(vm, task, [{
        id: 0,
        fromPosition: 0
    },{
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

    const result = resolveInputs(vm, task, [{
        id: 0,
        fromName: "a"
    },{
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

    const result = resolveInputs(vm, task, [{
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

    expect(resolveInputs(vm, quickTask({
        'arg-name': 'the value'
    }), spec).values).toEqual(['the value']);

    expect(resolveInputs(vm, quickTask({
        '#positionals': ['the value']
    }), spec).values).toEqual(['the value']);
});

it("signals an error for a missing required named input", () => {
    const task = quickTask({
        a: 100
    });

    const result = resolveInputs(vm, task, [{
        id: 0,
        fromName: "b",
        required: true,
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

    const result = resolveInputs(vm, task, [{
        id: 0,
        fromPosition: 2,
        required: true,
        defaultValue: "?"
    }]);

    expect(result.values).toEqual(["?"]);
    expect(result.errors).toEqual([{
        id: 0,
        notFound: true
    }]);
});

it("doesn't signal an error for a missing non-required input", () => {
    const task = quickTask({
    });

    const result = resolveInputs(vm, task, [{
        id: 0,
        fromName: "name",
        defaultValue: "the default"
    }]);

    expect(result.values).toEqual(["the default"]);
    expect(result.errors).toEqual([]);
});
