
import Graph from '../Graph'
import patternFuzzTest from '../test/pattern-examples'
import loadBootstrapConfigs, { loadLocalBootstrapConfigs } from '../loadBootstrapConfigs'

it("patterns fuzz-test", () => {
    const graph = new Graph();
    loadLocalBootstrapConfigs(graph);
    const { passed, failed } = patternFuzzTest(graph);

    expect(passed).toBeGreaterThan(10);
    expect(failed).toEqual(0);
});
