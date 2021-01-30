
import { setupGraph } from './utils'

it(`'from' works`, () => {
    const { graph, run } = setupGraph();

    expect(run('val a=1 b=2 | rewrite c(from a)').stringifyBody()).toEqual(['c(a/1)']);
    expect(run('val a=1 b=2 | rewrite c(from a) d(from b)').stringifyBody()).toEqual(['c(a/1) d(b/2)']);
});

it(`'from' defaults to the containing attr`, () => {
    const { graph, run } = setupGraph();

    expect(run('val a=1 b=2 | rewrite b(from-val)').stringifyBody()).toEqual(['b/2']);
});

it(`'from' works in nested context`, () => {
    const { graph, run } = setupGraph();

    expect(run('val a=1 b=2 | rewrite c(d(e) f(from a b))').stringifyBody()).toEqual(['c(d(e) f(a/1 b/2))']);
});

it(`from-val works`, () => {
    const { graph, run } = setupGraph();

    expect(run('val a=1 b=2 | rewrite c(from-val a)').stringifyBody()).toEqual(['c/1']);
    expect(run('val a=1 b=2 | rewrite c(from-val a) d(from-val b)').stringifyBody()).toEqual(['c/1 d/2']);
});
