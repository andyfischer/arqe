
import Graph from '../Graph'
import CodeGenerationApi from './CodeGenerationApi'
import { generateAPI } from './DAOGenerator'
import { generateTextAsCode } from './TextAsCode'
import watchFile from '../file-watch/watchFile'

export function runCodeGenerator(filename: string) {

    watchFile(filename, () => {
        const graph = Graph.loadFromDumpFile(filename);
        const api = new CodeGenerationApi(graph);

        for (const target of api.listCodeGenerationTargets()) {
            const strategy = api.codeGenerationTargetStrategy(target);

            if (strategy === 'dao-api') {
                generateAPI(graph, target);
            } else if (strategy == 'text-as-code') {
                generateTextAsCode(graph, target);
            } else {
                throw new Error("didn't understand code generation strategy: " + strategy);
            }
        }
    });
}
