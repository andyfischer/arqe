
import Graph from './Graph'
import Fs from 'fs'

function javascriptTemplate(vars) {
    return (
`import Graph from './fs/Graph'

export class GraphAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
}
`);
}

export class APIGenerator {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    asJavascript() {
        return javascriptTemplate({});
    }
}

export function generateAPI(graph: Graph) {
    const destinationFilename = graph.getOneRelationSync('code-generation destination-filename/*').getTagValue('destination-filename');

    console.log('writing to: ' + destinationFilename);

    const generator = new APIGenerator(graph);

    Fs.writeFileSync(destinationFilename, generator.asJavascript());

    console.log('generateAPI done');
}
