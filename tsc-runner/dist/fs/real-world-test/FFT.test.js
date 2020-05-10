"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const Graph_1 = __importDefault(require("../Graph"));
let graph;
beforeAll(() => {
    graph = new Graph_1.default();
    const dumpContents = fs_1.default.readFileSync(__dirname + '/fft.dump', 'utf8');
    for (const cmd of dumpContents.split('\n'))
        graph.run(cmd);
});
it('correctly joins with a has-skill', () => {
    let joinResults = [];
    for (const team of graph.getRelationsSync('team/*')) {
        const teamId = team.getTagValue('team');
        const result = graph.runSync(`get ${teamId} unit/$a | join unit/$a has-skill/Revive`);
        joinResults = joinResults.concat(result);
    }
    expect(joinResults).toEqual([
        "has-skill/Revive unit/2d6dd",
        "has-skill/Revive unit/56330",
        "has-skill/Revive unit/ce769",
    ]);
});
//# sourceMappingURL=FFT.test.js.map