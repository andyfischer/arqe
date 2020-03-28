
import Repl from 'repl'
import CommandConnection from './socket/CommandConnection'
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

        this.graph.run2(line, {
            start() {},
            relation: (rel) => {
                if (isFinished)
                    throw new Error('got relation after finish()');

                console.log(' > ' + rel.stringifyRelation());
            },
            isDone: () => false,
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
