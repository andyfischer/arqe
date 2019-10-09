
import { Scope } from '..'

it("lets you get and set", () => {
    const scope = new Scope()
    scope.createSlot("a");
    scope.set("a", 1);
    expect(scope.get("a")).toEqual(1);
});

it("getOptional uses default values", () => {
    const scope = new Scope()
    expect(scope.getOptional("a", "default")).toEqual("default");
});

it("get throws on missing value", () => {
    const scope = new Scope()
    expect(() => scope.get("a")).toThrow();
});

it("supports lookup on parent scopes", () => {
    const parent = new Scope()
    parent.createSlot("a");
    parent.set("a", 1);

    const child = new Scope(parent);
    child.createSlot("b");
    child.set("b", 2);

    expect(child.get("a")).toEqual(1);
    expect(child.get("b")).toEqual(2);
    expect(parent.get("a")).toEqual(1);
    expect(parent.getOptional("b", null)).toEqual(null);
});
