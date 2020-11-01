
import Graph from '../Graph'
import patternFuzzTest from '../test/pattern-examples'
import loadBootstrapConfigs, { loadLocalBootstrapConfigs } from '../node/loadBootstrapConfigs'

xit("patterns fuzz-test", () => {
    const graph = new Graph({
        provide: {
            'pattern-test-example pattern': 'memory',
            'pattern-test-example pattern is-superset-of': 'memory',
            'pattern-test-example pattern is-superset-of filename': 'memory',
            'pattern-test-example pattern not-superset-of': 'memory',
            'query-test-example query': 'memory',
        }
    });
    loadLocalBootstrapConfigs(graph);
    const { passed, failed } = patternFuzzTest(graph);

    expect(passed).toBeGreaterThan(10);
    expect(failed).toEqual(0);
});
