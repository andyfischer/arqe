
import { startFile } from '../JavascriptAst'

it('can declare an import', () => {
    const file = startFile();

    file.addImport('{ GraphLike, Relation, receiveToRelationListPromise }', '..');

    expect(file.stringify()).toEqual(`import { GraphLike, Relation, receiveToRelationListPromise } from ".."`);
});

it('can declare a class', () => {
    const file = startFile();
    const clss = file.addClass('API');
    clss.addField('graph', 'GraphLike');
    const c = clss.contents.addMethod('constructor');
    c.addInput('graph', 'GraphLike');
    c.contents.addRaw('this.graph = graph;')

    expect(file.stringify()).toEqual(
`class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }
}`);
});
