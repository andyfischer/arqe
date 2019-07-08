
import Graph from '../Graph'
import CodeGenerationDAO from './generated/CodeGenerationDAO'
import { runDAOGenerator } from './DAOGenerator'
import { generateTextAsCode } from './TextAsCode'
//import watchFile from '../old/file-watch/watchFile'
//import { notifyFileChanged } from '../old/file-watch/notifyFileChanged'
import Minimist from 'minimist'
import runStandardProcess from '../toollib/runStandardProcess'
import { runProviderGenerator } from './ProviderAPIGenerator'
import loadBootstrapConfigs, { loadLocalBootstrapConfigs } from '../loadBootstrapConfigs'

function runGenerationForTarget(dataSource: Graph, api: CodeGenerationDAO, target) {
    const strategy = api.codeGenerationTargetStrategy(target);

    if (strategy === 'dao-api' || strategy === 'consumer') {
        runDAOGenerator(dataSource, target);
    } else if (strategy == 'text-as-code') {
        generateTextAsCode(dataSource, target);
    } else if (strategy == 'provider-api' || strategy === 'provider') {
        runProviderGenerator(dataSource, target);
    } else {
        throw new Error("didn't understand code generation strategy: " + strategy);
    }
}

async function runGeneration(graph: Graph) {

    const cliArgs = Minimist(process.argv.slice(2));
    const dbDir = cliArgs['db'];

    //watchFile(graph, dbDir, () => {

        console.log(`running code generation (using ${dbDir})`);

        const dataSource = new Graph();
        loadBootstrapConfigs(dataSource, dbDir);
        const api = new CodeGenerationDAO(dataSource);

        for (const target of api.listCodeGenerationTargets()) {
            try {
                runGenerationForTarget(dataSource, api, target);
            } catch (e) {
                console.error('Failed code generation for: ' + target)
                console.error(e)
            }
        }
    //});

    //await new Promise(resolve => {});
}

export function main() {
    const graph = new Graph();
    loadLocalBootstrapConfigs(graph);
    runGeneration(graph);
    // runStandardProcess('generate-api', async (graph: Graph) => runGeneration(graph));
}
