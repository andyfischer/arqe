
import Repl from 'repl'
import Graph from './Graph'
import RelationReceiver, { receiveToRelationStream } from './RelationReceiver'
import Runnable from './Runnable'

const prompt = '~ '

function trimEndline(str) {
    if (str.length > 0 && str[str.length-1] === '\n')
        return str.slice(0, str.length-1);

    return str;
}

export default class ClientRepl {
    graph: Runnable
    repl: any

    constructor(graph: Runnable) {
        this.graph = graph;
    }

    async eval(line) {
        let isFinished = false;
        line = trimEndline(line);

        if (line === '') {
            this.displayPrompt();
            return;
        }

        this.graph.run(line, {
            relation: (rel) => {
                if (isFinished)
                    throw new Error('got relation after finish()');

                if (rel.hasType('command-meta'))
                    return;

                console.log(' > ' + rel.stringifyRelation());
            },
            finish: () => {
                isFinished = true;
                this.displayPrompt()
            }
        });
    }

    displayPrompt() {
        this.repl.displayPrompt()
    }

    start() {
        this.repl = Repl.start({
            prompt,
            eval: line => this.eval(line)
        });
    }
}

export function startRepl(graph: Graph) {
        const repl = new ClientRepl(graph);
        repl.start();
        return repl;
}
