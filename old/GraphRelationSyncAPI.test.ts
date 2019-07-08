
import Graph from '../Graph'
import GraphRelationSyncAPI from '../GraphRelationSyncAPI'

let graph;
let api;

beforeEach(() => {
    graph = new Graph()
    api = new GraphRelationSyncAPI(graph);
});

it('supports gets', () => {
    api.run('set a/1')
    api.run('set a/2')

    expect(api.get('a/*').map(rel => rel.tag('a').value())).toEqual(['1','2']);
    expect(api.get('a/*').map(rel => rel.tagValue('a'))).toEqual(['1','2']);
});

it('supports getOne', () => {

    expect(() => api.getOne('a/*')).toThrow();

    api.run('set a/1')
    expect(() => api.getOne('a/*')).not.toThrow();

    api.run('set a/2')
    expect(() => api.getOne('a/*')).toThrow();
});

it('supports gets of related tags', () => {

    api.run('set a/1')
    api.run('set a/1 name/apple')
    api.run('set a/2')
    api.run('set a/2 name/banana')

    const withName = api.get('a/*').map(rel => {
        const name = rel.tag('a').add('name/*').getOne('name/*').tagValue('name')
        return [rel.tag('a').str(), name];
    });

    expect(withName).toEqual([['a/1', 'apple'], ['a/2', 'banana']])

});

it('supports joins', () => {

    api.run('set a/1')
    api.run('set a/1 name/apple')
    api.run('set a/2')
    api.run('set a/2 name/banana')

    const withName = api.pattern('a/$a').join('a/$a name/*').rels().map(rel => {
        return [rel.tag('a').str(), rel.tagValue('name')]
    });

    expect(withName).toEqual([['[from $a] a/1', 'apple'],['[from $a] a/2', 'banana']])
});
