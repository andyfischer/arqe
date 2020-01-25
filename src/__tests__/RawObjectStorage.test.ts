
import Graph from '../Graph'
import RawObjectStorage from '../RawObjectStorage'

it('correctly handles get', () => {
    const graph = new Graph();
    const linkPattern = graph.relationPattern("listen objectmount/123 option/*");
    const storage = new RawObjectStorage(linkPattern);

});
