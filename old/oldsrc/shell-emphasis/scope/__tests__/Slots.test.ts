
import { Scope, Graph } from '..'


it("lets you get and set", () => {
    const graph = new Graph()
    const scope = new Scope(graph)
    scope.createSlot("a");
    scope.set("a", 1);
    expect(scope.get("a")).toEqual(1);
});

it("getOptional uses default values", () => {
    const graph = new Graph()
    const scope = new Scope(graph)
    expect(scope.getOptional("a", "default")).toEqual("default");
});

it("get throws on missing value", () => {
    const graph = new Graph()
    const scope = new Scope(graph)
    expect(() => scope.get("a")).toThrow();
});

