"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function javascriptTemplate(vars) {
    return (`import Graph from './fs/Graph'

export class GraphAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
}
`);
}
class APIGenerator {
    constructor(graph) {
        this.graph = graph;
    }
    asJavascript() {
        return javascriptTemplate({});
    }
}
exports.APIGenerator = APIGenerator;
function main() {
}
//# sourceMappingURL=GeneratedAPI.js.map