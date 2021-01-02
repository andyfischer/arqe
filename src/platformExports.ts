
import Graph from './Graph'
import runningInBrowser from './utils/runningInBrowser'
import { TableSetDefinition } from './parseTableDefinition'

interface GraphOptions {
    provide?: TableSetDefinition
}

let getGlobal: (s: string) => any;
let setGlobal: (s: string, v: any) => void;

if (runningInBrowser()) {
    getGlobal = (s) => window[s];
    setGlobal = (s,v) => { window[s] = v; }
} else {
    getGlobal = (s) => global[s];
    setGlobal = (s,v) => { global[s] = v; }
}

export function processGraph(opts: GraphOptions = {}): Graph {
    let graph = getGlobal('_arqe_graph');

    if (!graph) {
        graph = new Graph();
        setGlobal('_arqe_graph', graph);
    }

    if (opts.provide)
        graph.provide(opts.provide);

    return graph;
}
