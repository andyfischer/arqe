
import Graph from './fs/Graph'
import { saveObject } from './fs/GraphORM'
import ChildProcess from 'child_process'
import Fs from 'fs-extra'
import Path from 'path'

const graph = new Graph();

const bootstrap = `
set launch-command == tsc -p .
set cwd == /Users/afischer/fs

set fix/1
set fix/1 replacement/1
set fix/1 replacement/1 .from == clss
set fix/1 replacement/1 .to == class

set fix/2
set fix/2 replacement/1
set fix/2 replacement/1 .from == RelationPattern
set fix/2 replacement/1 .to == Pattern
`;

for (const line of bootstrap.split('\n'))
    graph.run(line);


const errorRegex = /(.*?)\(([0-9]+),([0-9]+)\): (.*)/

function getLine(s: string, n: number) {
    const lines = s.split('\n');
    return lines[n];
}

function setLine(s: string, n: number, line: string) {
    const lines = s.split('\n');
    lines[n] = line;
    return lines.join('\n');
}

class ReplacementsList {
    replacements: {pattern: RegExp, toStr: string}[]

    update(cxt) {
        this.replacements = [];

        for (const replace of cxt.get('fix/* replacement/*')) {

            const details = cxt.getOptionsObject(replace.stringify());

            if (!details['from'] || !details['to'])
                continue;

            this.replacements.push({
                pattern: new RegExp('(\\W)(' + details['from'] + ')(\\W|$)', 'g'),
                toStr: details.to
            });
        }
    }
}

async function applyFixes() {
    const replacementsList = new ReplacementsList();

    const replacements = graph.runDerived(cxt => replacementsList.update(cxt));

    console.log('active replacements: ', replacementsList.replacements);
    
    await graph.runDerived(async cxt => {
        const cwd = cxt.getOne('cwd').getValue();
        for (const error of cxt.get('error/*')) {
            const details = cxt.getOptionsObject(error.stringify());
            const filename = Path.join(cwd, details.filename);
            const lineno = parseInt(details.lineno);
            const contents = await Fs.readFile(filename, 'utf8');

            console.log('Looking at error: ', details.tscMessage);

            const affectedLine = getLine(contents, lineno - 1);
            
            console.log('Affected line: ', affectedLine);

            let updatedLine = affectedLine;

            for (const replacement of replacementsList.replacements) {
                updatedLine = updatedLine.replace(replacement.pattern, (m, pre, _, post) => {
                    return pre + replacement.toStr + post;
                });
            }

            if (affectedLine === updatedLine) {
                console.log('No fix found')
                continue;
            }

            const newContents = setLine(contents, lineno - 1, updatedLine);
            await Fs.writeFile(filename, newContents);
            console.log('Applied a fix:')
            console.log(`  ${affectedLine} -> ${updatedLine}`);
        }
    });
}

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
        for (let tscMessage of data.toString('utf8').split('\n')) {

            console.log('tsc said: ', tscMessage);

            tscMessage = tscMessage.trim();
            if (tscMessage == '')
                continue;

            const match = errorRegex.exec(tscMessage);
            if (!match)
                console.log("didn't understand TSC message: ", tscMessage);

            const [_, filename, lineno, colno, message] = match;

            await saveObject(graph, 'error/#unique', {
                filename, lineno, colno, message, tscMessage: JSON.stringify(tscMessage)
            })
        }
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

    await applyFixes();

    console.log('done')
}

main()
.catch(console.error);
