
import { setupGraph } from './utils'

const { graph, run } = setupGraph();

it("browse works", () => {

    graph.provide({
        'a b': {},
        'b c': {}
    })

    expect(run('browse b')).toEqual([
        "id/mount-2 name/AB schema(a b)",
        "id/mount-3 name/BC schema(b c)"
    ])
    
    expect(run('browse a')).toEqual([
        "id/mount-2 name/AB schema(a b)",
    ])

});
