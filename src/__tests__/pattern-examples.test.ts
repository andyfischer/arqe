
import loadGraphFromLocalDatabase from '../loadGraphFromLocalDatabase'
import patternFuzzTest from '../test/pattern-examples'

it("patterns fuzz-test", () => {
    const graph = loadGraphFromLocalDatabase();
    const { passed, failed } = patternFuzzTest(graph);

    expect(passed).toBeGreaterThan(10);
    expect(failed).toEqual(0);
});
