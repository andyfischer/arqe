
import Graph from '../Graph'
import CodeGenerationApi from './CodeGenerationApi'
import { runDAOGenerator } from './DAOGenerator'
import { runDAOGenerator2 } from './DAOGenerator2'
import { generateTextAsCode } from './TextAsCode'
import watchFile from '../file-watch/watchFile'
import { notifyFileChanged } from '../file-watch/notifyFileChanged'
import Minimist from 'minimist'
import runStandardProcess from '../toollib/runStandardProcess'

async function runGeneration(graph: Graph) {

    const cliArgs = Minimist(process.argv.slice(2));
    const filename = cliArgs['file'];

    watchFile(filename, () => {

        console.log(`running code generation (using ${filename})`);

        const dataSource = Graph.loadFromDumpFile(filename);
        const api = new CodeGenerationApi(dataSource);

        for (const target of api.listCodeGenerationTargets()) {
            const strategy = api.codeGenerationTargetStrategy(target);

            if (strategy === 'dao-api') {
                runDAOGenerator(dataSource, target);
            } else if (strategy === 'dao-api2') {
                runDAOGenerator2(dataSource, target);
            } else if (strategy == 'text-as-code') {
                generateTextAsCode(dataSource, target);
            } else {
                throw new Error("didn't understand code generation strategy: " + strategy);
            }
        }
    });

    await new Promise(resolve => {});
}

export function main() {
    runStandardProcess(async (graph: Graph) => runGeneration(graph));
}
