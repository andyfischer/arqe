
import Graph from '../Graph'
import ResponseAccumulator from '../ResponseAccumulator'

describe('waitUntilDone', () => {
    let graph;
    let run;

    beforeEach(() => {
        graph = new Graph()

        run = async (msg) => {
            const accumulator = new ResponseAccumulator();
            graph.run(msg, accumulator.receiveCallback());
            return await accumulator.waitUntilDone();
        }
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
