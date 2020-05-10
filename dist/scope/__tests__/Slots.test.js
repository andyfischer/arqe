"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
it("lets you get and set", () => {
    const graph = new __1.Graph();
    const scope = new __1.Scope(graph);
    scope.createSlot("a");
    scope.set("a", 1);
    expect(scope.get("a")).toEqual(1);
});
it("getOptional uses default values", () => {
    const graph = new __1.Graph();
    const scope = new __1.Scope(graph);
    expect(scope.getOptional("a", "default")).toEqual("default");
});
it("get throws on missing value", () => {
    const graph = new __1.Graph();
    const scope = new __1.Scope(graph);
    expect(() => scope.get("a")).toThrow();
});
//# sourceMappingURL=Slots.test.js.map