"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const Graph_1 = __importDefault(require("../Graph"));
let graph;
beforeAll(async () => {
    graph = new Graph_1.default();
    await graph.loadDumpFile(path_1.default.join(__dirname, 'fft.dump'));
});
it('correctly joins with a has-skill', () => {
    let joinResults = [];
    for (const team of graph.getRelationsSync('team/*')) {
        const teamId = team.getTagValue('team');
        const result = graph.runSyncOld(`get ${teamId} unit/$a | join unit/$a has-skill/Revive`);
        joinResults = joinResults.concat(result);
    }
    expect(joinResults).toEqual([
        "[from $a] unit/2d6dd",
        "[from $a] unit/56330",
        "[from $a] unit/ce769",
    ]);
});
//# sourceMappingURL=FFT.test.js.map