
import Fs from 'fs'
import Path from 'path'
import { loadDumpFile } from './DumpFile'
import Graph from './Graph'
import Yaml from 'yaml'

export function* yamlToCommands(yamlString: string) {
    const object = Yaml.parse(yamlString);
    for (const item of object) {
        for (const key in item) {
            for (const suffix of item[key]) {
                yield `set ${key} ${suffix}`
            }
        }
    }
}

export default function loadGraphFromFiles(dir: string) {
    const graph = new Graph();

    loadDumpFile(graph, Path.join(dir, 'commands'));

    const dirContents = Fs.readdirSync(dir);
    for (const file of dirContents) {
        if (file.endsWith('.yaml')) {
            const contents = Fs.readFileSync(Path.join(dir, file), 'utf8');
            for (const command of yamlToCommands(contents)) {
                graph.run(command);
            }
        }
    }

    return graph;
}
