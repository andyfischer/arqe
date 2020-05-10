"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const ResponseAccumulator_1 = __importDefault(require("../ResponseAccumulator"));
describe('waitUntilDone', () => {
    let graph;
    let run;
    beforeEach(() => {
        graph = new Graph_1.default();
        run = async (msg) => {
            const accumulator = new ResponseAccumulator_1.default();
            graph.run(msg, accumulator.receiveCallback());
            return await accumulator.waitUntilDone();
        };
    });
    xit('works correctly for get (single result)', async () => {
        graph.run('set a/1 -- val');
        const result = await run('get a/1');
        expect(result).toEqual('val');
    });
    it('works correctly for get (multiple results)', () => {
    });
    it('works correctly for set', () => {
    });
});
//# sourceMappingURL=ResponseAccumulator.test.js.map