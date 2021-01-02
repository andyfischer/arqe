
import { setupGraph } from './utils'

const { graph, run } = setupGraph();

it("browse works", () => {

    graph.provide({
        'a b': {},
        'b c': {}
    })

    expect(run('browse b | just name schema')).toEqual([
        "name/AB schema(a b)",
        "name/BC schema(b c)"
    ])
    
    expect(run('browse a | just name schema')).toEqual([
        "name/AB schema(a b)",
    ])

});
