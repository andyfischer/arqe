"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
it('bumps the changeToken value when there are changes', () => {
    const graph = new Graph_1.default();
    const query = graph.savedQuery('tag/*');
    const token = query.changeToken;
    graph.run('set othertag/1');
    expect(query.changeToken).toEqual(token);
    graph.run('set tag/1');
    expect(query.changeToken).not.toEqual(token);
});
//# sourceMappingURL=SavedQuery.test.js.map