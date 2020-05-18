
import Fs from 'fs'
import Graph from './Graph'

export function loadDumpFile(graph: Graph, filename: string) {
    const contents = Fs.readFileSync(filename, 'utf8');
    for (const line of contents.split(/\r\n|\r|\n/)) {
        if (line.trim() === '')
            continue;

        try {
            graph.run(line);
        } catch (e) {
            console.log('Failed on command: ' + line);
        }
    }

    /*
    const fileStream = Fs.createReadStream(filename);

    const rl = Readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
  
    for await (const line of rl) {
        this.run(line);
    }
    */
}

export function loadDump(graph: Graph, contents: string) {
    for (const line of contents.split(/\r\n|\r|\n/)) {
        graph.run(line);
    }
}

export function saveDumpFile(graph: Graph, filename: string) {
    const contents = (graph.runSyncOld('dump') as string[]).join('\n');
    Fs.writeFileSync(filename, contents);
}

export function loadFromDumpFile(filename: string): Graph {
    const graph = new Graph();
    loadDumpFile(graph, filename);
    return graph;
}
