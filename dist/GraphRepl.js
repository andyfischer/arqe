"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function trimEndline(str) {
    if (str.length > 0 && str[str.length - 1] === '\n')
        return str.slice(0, str.length - 1);
    return str;
}
class GraphRepl {
    constructor(graph) {
        this.graph = graph;
    }
    async eval(line, onDone) {
        let isFinished = false;
        line = trimEndline(line);
        if (line === '') {
            onDone();
            return;
        }
        this.graph.run(line, {
            relation: (rel) => {
                if (isFinished)
                    throw new Error('got relation after finish()');
                if (rel.hasType('command-meta')) {
                    if (rel.hasType('error')) {
                        console.log('error: ' + rel.getTagValue('message'));
                    }
                    return;
                }
                console.log(' > ' + rel.stringifyRelation());
            },
            finish: () => {
                isFinished = true;
                onDone();
            }
        });
    }
}
exports.default = GraphRepl;
//# sourceMappingURL=GraphRepl.js.map