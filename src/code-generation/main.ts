
import Graph from '../Graph'
import CodeGenerationDAO from './generated/CodeGenerationDAO'
import { runDAOGenerator } from './DAOGenerator'
import { generateTextAsCode } from './TextAsCode'
import watchFile from '../file-watch/watchFile'
import { notifyFileChanged } from '../file-watch/notifyFileChanged'
import Minimist from 'minimist'
import runStandardProcess from '../toollib/runStandardProcess'
import { runProviderGenerator } from './ProviderAPIGenerator'

function runGenerationForTarget(dataSource: Graph, api: CodeGenerationDAO, target) {
    const strategy = api.codeGenerationTargetStrategy(target);

    if (strategy === 'dao-api') {
        runDAOGenerator(dataSource, target);
    } else if (strategy == 'text-as-code') {
        generateTextAsCode(dataSource, target);
    } else if (strategy == 'provider-api') {
        runProviderGenerator(dataSource, target);
    } else {
        throw new Error("didn't understand code generation strategy: " + strategy);
    }
}

async function runGeneration(graph: Graph) {

    const cliArgs = Minimist(process.argv.slice(2));
    const filename = cliArgs['file'];

    watchFile(filename, () => {

        console.log(`running code generation (using ${filename})`);

        const dataSource = Graph.loadFromDumpFile(filename);
        const api = new CodeGenerationDAO(dataSource);

        for (const target of api.listCodeGenerationTargets()) {
            try {
                runGenerationForTarget(dataSource, api, target);
            } catch (e) {
                console.error('Failed code generation for: ' + target)
                console.error(e)
            }
        }
    });

    await new Promise(resolve => {});
}

export function main() {
    runStandardProcess('generate-api', async (graph: Graph) => runGeneration(graph));
}
