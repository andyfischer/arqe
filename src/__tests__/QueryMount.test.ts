
import { setupGraph } from "./utils"
import Pipe, { newPrefilledPipe } from '../Pipe'
import { runQuery } from '../runQuery'
import { toQuery } from '../coerce'
import { receiveToTupleList } from "../receiveUtils";

it("allows a plain value mount", () => {

    const { run } = setupGraph({
        provide: {
            'fixed-val': 'val fixed-val(1 2 3)'
        }
    });

    expect(run('get fixed-val').stringifyBody()).toEqual(['fixed-val(1 2 3)']);
});

it("allows complicated patterns", () => {
    const { run } = setupGraph({
        provide: {
            'a/1 squared': 'val squared/1',
            'a/2 squared': 'val squared/4',
            'a/3 squared': 'val squared/9',
            'a/4 squared': 'val squared/16',
            'all a squared': 'get a squared',

            'b': 'val b/123',
            'alias b': 'get b',
        }
    });

    expect(run('get a squared').stringifyBody()).toEqual([
        'a/1 squared/1', 'a/2 squared/4', 'a/3 squared/9', 'a/4 squared/16'
    ]);
    
    expect(run('get all a squared').stringifyBody()).toEqual([
        'all a/1 squared/1',
        'all a/2 squared/4',
        'all a/3 squared/9',
        'all a/4 squared/16',
    ]);

    expect(run('get alias b').stringifyBody()).toEqual(['alias b/123']);
});

it("intermediate tables work with direct runQuery", () => {
    const { run, graph } = setupGraph({
        provide: {
            'b': 'val b/123',
            'alias b': 'get b',
        }
    });

    const out = runQuery(graph.newScope(), toQuery('get b'), newPrefilledPipe([]));
    expect(out.isDone());
    expect(out.take().map(t => t.stringify())).toEqual([
        'b command-meta search-pattern',
        'b/123',
    ]);

    const out2 = runQuery(graph.newScope(), toQuery('get alias b'), newPrefilledPipe([]));
    expect(out2.isDone());
    expect(out2.take().map(t => t.stringify())).toEqual([
        'alias b command-meta search-pattern',
        'alias b/123'
    ]);

    const out3 = graph.run('get alias b');
    expect(out3.isDone());
    expect(out3.rel().stringifyBuffer()).toEqual([
        'alias b command-meta search-pattern',
        'alias b/123']);

    expect(run('get alias b').rel().stringifyBuffer()).toEqual([
        "alias b command-meta search-pattern",
        "alias b/123"
    ]);
});

it("errors are propogated for query based mounts", () => {
    const { run } = setupGraph({
        provide: {
            'always-errors'(i,o) {
                throw new Error("oops had an error")
            },
            'derived-from-always-errors': 'get always-errors'
        }
    });

    expect(run('get always-errors').rel().errorsToErrorObject()).toEqual(new Error("oops had an error"));
    expect(run('get derived-from-always-errors').rel().errorsToErrorObject()).toEqual(new Error("oops had an error"));
});

