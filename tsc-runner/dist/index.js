"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("./fs/Graph"));
const GraphORM_1 = require("./fs/GraphORM");
const child_process_1 = __importDefault(require("child_process"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const graph = new Graph_1.default();
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
const errorRegex = /(.*?)\(([0-9]+),([0-9]+)\): (.*)/;
function getLine(s, n) {
    const lines = s.split('\n');
    return lines[n];
}
function setLine(s, n, line) {
    const lines = s.split('\n');
    lines[n] = line;
    return lines.join('\n');
}
class ReplacementsList {
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
    await graph.runDerived(async (cxt) => {
        const cwd = cxt.getOne('cwd').getValue();
        for (const error of cxt.get('error/*')) {
            const details = cxt.getOptionsObject(error.stringify());
            const filename = path_1.default.join(cwd, details.filename);
            const lineno = parseInt(details.lineno);
            const contents = await fs_extra_1.default.readFile(filename, 'utf8');
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
                console.log('No fix found');
                continue;
            }
            const newContents = setLine(contents, lineno - 1, updatedLine);
            await fs_extra_1.default.writeFile(filename, newContents);
            console.log('Applied a fix:');
            console.log(`  ${affectedLine} -> ${updatedLine}`);
        }
    });
}
async function main() {
    const cmd = graph.runSync('get launch-command');
    const cwd = graph.runSync('get cwd');
    console.log(`tsc-runner starting: ${cmd} (cwd: ${cwd})`);
    const args = cmd.split(' ');
    const proc = child_process_1.default.spawn(args[0], args.slice(1), {
        shell: true,
        stdio: 'pipe',
        cwd
    });
    proc.stdout.on('data', async (data) => {
        for (let tscMessage of data.toString('utf8').split('\n')) {
            console.log('tsc said: ', tscMessage);
            tscMessage = tscMessage.trim();
            if (tscMessage == '')
                continue;
            const match = errorRegex.exec(tscMessage);
            if (!match)
                console.log("didn't understand TSC message: ", tscMessage);
            const [_, filename, lineno, colno, message] = match;
            await GraphORM_1.saveObject(graph, 'error/#unique', {
                filename, lineno, colno, message, tscMessage: JSON.stringify(tscMessage)
            });
        }
    });
    proc.stderr.on('data', data => {
    });
    await new Promise(resolve => {
        proc.on('close', resolve);
        proc.on('error', err => {
            console.log('error: ' + err);
            resolve();
        });
    });
    await fs_extra_1.default.writeFile('dump.graph', (await graph.runAsync('dump')).join('\n'));
    await applyFixes();
    console.log('done');
}
main()
    .catch(console.error);
//# sourceMappingURL=index.js.map
