import { run } from './utils'
import { Graph } from '..';

it('increment expression works', () => {
    const g = new Graph();
    run(g, 'set a/1 b/1');
    run(g, 'set a/(increment) b');
    expect(run(g, 'get a b')).toEqual(['a/2 b/1']);

    run(g, 'set a/(increment) b');
    expect(run(g, 'get a b')).toEqual(['a/3 b/1']);

    run(g, 'set a/(increment) b/(increment)');
    expect(run(g, 'get a b')).toEqual(['a/4 b/2']);

    run(g, 'set a/1 b/(increment)');
    expect(run(g, 'get a b')).toEqual(['a/4 b/2']);
});

test('increment with multiple matches works', () => {
    const g = new Graph();
    run(g, 'set file-watch/(unique) filename//test version/0')
    run(g, 'set file-watch/* filename//test version/(increment)')
});
