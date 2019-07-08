
import Fs from 'fs'
import Path from 'path'
import { loadDumpFile } from './DumpFile'
import Graph from './Graph'
import Yaml from 'yaml'

export function* yamlToCommands(yamlString: string) {
    const object = Yaml.parse(yamlString);
    for (const item of object) {
        if (typeof item === 'string') {
            yield `set ${item}`
        } else {
            for (const key in item) {
                for (const suffix of item[key]) {
                    yield `set ${key} ${suffix}`
                }
            }
        }
    }
}

export default function loadBootstrapConfigs(graph: Graph, dir: string) {
    loadDumpFile(graph, Path.join(dir, 'commands'));

    const dirContents = Fs.readdirSync(dir);
    for (const file of dirContents) {
        if (file.endsWith('.yaml')) {
            const fullFilename = Path.join(dir, file);
            const contents = Fs.readFileSync(fullFilename, 'utf8');
            for (const command of yamlToCommands(contents)) {
                try {
                    graph.run(command);
                } catch (e) {
                    console.error(`Error loading file (${fullFilename}): ${e.stack || e}`);
                }
            }
        }
    }

    return graph;
}

export function loadLocalBootstrapConfigs(graph: Graph) {
    loadBootstrapConfigs(graph, Path.join(__dirname, '../src/db'));
}
