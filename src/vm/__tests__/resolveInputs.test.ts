
import { Scope, scopeFromObject } from '../../scope'
import resolveInputs from '../resolveInputs'

it("handles positionals", () => {

    const scope = scopeFromObject({
        '#positionals': ['a', 'b']
    });

    const result = resolveInputs(scope, [{
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
    const scope = scopeFromObject({
        a: 100,
        b: 200
    });

    const result = resolveInputs(scope, [{
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
    const scope = scopeFromObject({
        '#positionals': ['a', 'b', 'c', 'd']
    });

    const result = resolveInputs(scope, [{
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

    expect(resolveInputs(scopeFromObject({
        'arg-name': 'the value'
    }), spec).values).toEqual(['the value']);

    expect(resolveInputs(scopeFromObject({
        '#positionals': ['the value']
    }), spec).values).toEqual(['the value']);
});

it("signals an error for a missing required named input", () => {
    const scope = scopeFromObject({
        a: 100
    });

    const result = resolveInputs(scope, [{
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
    const scope = scopeFromObject({
        '#positionals': ["a"]
    });

    const result = resolveInputs(scope, [{
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
    const scope = scopeFromObject({
    });

    const result = resolveInputs(scope, [{
        id: 0,
        fromName: "name",
        defaultValue: "the default"
    }]);

    expect(result.values).toEqual(["the default"]);
    expect(result.errors).toEqual([]);
});
