
import { startFile, formatBlock } from '../JavascriptAst'

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

    formatBlock(file);

    expect(file.stringify()).toEqual(
`class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }
}`);
});

it('formats spaces between import & class', () => {

    const file = startFile();
    file.addImport('a', 'b');
    file.addClass('C');

    expect(file.stringify()).toEqual(
`import a from \"b\"
class C {
}`
    );

    formatBlock(file);

    expect(file.stringify()).toEqual(
`import a from \"b\"

class C {
}`
    );
});

it('formats spaces between fields & constructor', () => {
    const file = startFile();
    const classDef = file.addClass('C');

    classDef.addField('a', 'string');
    classDef.contents.addMethod('constructor');
    formatBlock(file);

    expect(file.stringify()).toEqual(
`class C {
    a: string

    constructor() {
    }
}`);


    expect(classDef.contents.statements[0].statementType).toEqual('fieldDecl');
    expect(classDef.contents.statements[1].statementType).toEqual('blank');
    expect(classDef.contents.statements[2].statementType).toEqual('functionDecl');
});
