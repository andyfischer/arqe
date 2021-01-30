
import { handles, decoratedObjToTableMount } from '../decorators'
import { Graph } from '..';
import { setupGraph } from './utils'

class TestClass {
    name = 'TestClass'
    schemaStr = 'x'
    x = 5

    @handles('find')
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
    const { graph, run } = setupGraph();
    graph.addTable(decoratedObjToTableMount(new TestClass()))

    expect(run('get x').stringifyBody()).toEqual([ 'x/5' ])
    expect(run('set x/2').stringifyBody()).toEqual(['x/2'])
    expect(run('get x').stringifyBody()).toEqual([ 'x/2' ])
});
