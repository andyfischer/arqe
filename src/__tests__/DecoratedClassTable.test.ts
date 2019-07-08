
import { handles, decoratedObjToTableMount } from '../decorators'
import { Graph } from '..';
import { run } from './utils'

class TestClass {
    name = 'TestClass'
    schemaStr = 'x'
    x = 5

    @handles('list-all')
    getX() {
        return { x: this.x }
    }

    @handles('set x')
    set({x}) {
        this.x = x;
        return { x: this.x }
    }
}

it(`correctly binds 'this' param`, () => {
    const graph = new Graph();
    graph.addTable(decoratedObjToTableMount(new TestClass()))

    expect(run(graph, 'get x')).toEqual(['x/5'])
    expect(run(graph, 'set x/2')).toEqual(['x/2'])
    expect(run(graph, 'get x')).toEqual(['x/2'])

});