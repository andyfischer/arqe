
import ChildProcess from 'child_process'
import Path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextJsBuildDir = Path.resolve(__dirname, '../nextjs-dashboard');
const nextJsBin = Path.resolve(__dirname, '../nextjs-dashboard/node_modules/.bin/next');

function dropNewline(str) {
    if (!str || str.length == 0)
        return str;

    if (str[str.length - 1] == '\n')
        return str.slice(0, str.length - 1);

    return str;
}

async function exec(cmd, args, options = {}) {
    console.log(`exec: ${cmd} ${args.join(' ')}`)
    const proc = ChildProcess.spawn(cmd, args, options);

    proc.stdout.on('data', data => {
        data = dropNewline(data.toString());
        console.log(data);
    })

    proc.stderr.on('data', data => {
        data = dropNewline(data.toString());
        console.log(data);
    })

    return new Promise((resolve, reject) => {
        proc.on('close', resolve)
        proc.on('error', reject)
    })
}

async function yarnInstall(dir) {
    await exec('yarn', [], {
        cwd: dir
    })
}

async function main() {
    // Update with 'yarn'
    await yarnInstall(nextJsBuildDir);

    // Run react-scripts
    await exec(nextJsBin, ['start'], {
        cwd: __dirname,
        env: {
            ...process.env
        }
    })
}

main()
.catch(console.error);