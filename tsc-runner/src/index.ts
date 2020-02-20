
import Graph from './fs/Graph'
import { saveObject } from './fs/GraphORM'
import ChildProcess from 'child_process'
import Fs from 'fs-extra'

const graph = new Graph();

const bootstrap = `
set launch-command == tsc -p .
set cwd == /Users/afischer/bob/app
`;

for (const line of bootstrap.split('\n'))
    graph.run(line);

const errorRegex = /(.*?)\(([0-9]+),([0-9]+)\): (.*)/

async function main() {
    const cmd = graph.runSync('get launch-command');
    const cwd = graph.runSync('get cwd');

    console.log(`tsc-runner starting: ${cmd} (cwd: ${cwd})`)

    const args = cmd.split(' ');

    const proc = ChildProcess.spawn(args[0], args.slice(1), {
        shell: true,
        stdio: 'pipe',
        cwd
    })

    proc.stdout.on('data', async data => {
        const str = data.toString('utf8');
        const match = errorRegex.exec(str);
        if (!match)
            console.log("didn't understand stdout: ", str);

        const [_, filename, lineno, colno, message] = match;
        const object = { filename, lineno, colno, message }

        // console.log('saw error', object)

        await saveObject(graph, 'error/#unique', {
            filename, lineno, colno, message
        })
    });

    proc.stderr.on('data', data => {
    });

    await new Promise(resolve => {
        proc.on('close', resolve);
        proc.on('error', err => {
            console.log('error: ' + err);
            resolve()
        });
    });

    await Fs.writeFile('dump.graph', (await graph.runAsync('dump') as string[]).join('\n'))
    console.log('done')
}

main()
.catch(console.error);
