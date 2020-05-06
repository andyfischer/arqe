
import 'source-map-support'
import Graph from './fs/Graph'
import runStandardProcess from './fs/toollib/runStandardProcess2'
import path from 'path'
import fs from 'fs-extra'
import BuildBotAPI from './BuildBotAPI'
import ChildProcess from 'child_process'
import Chalk from 'chalk'

let graph: Graph;
let api: BuildBotAPI;

function ignoreFile(filename: string) {
    return (/COMMIT_EDITMSG/.exec(filename));
}

async function scheduleCommandIfNeeded(cmd: string, cwd: string) {
    const tasks = await api.findTasksByCommand(cmd, cwd);

    for (const task of tasks) {
        const status = await api.taskStatus(task);
        if (status === 'scheduled') {
            console.log('already have this scheduled: ' + JSON.stringify({cmd, cwd}));
            return;
        } else if (status === 'running') {
            console.log('already running, TODO, schedule build for after: ' + JSON.stringify({cmd, cwd}));
            return;
        }
    }

    const task = await api.createBuildTask(cmd, cwd, 'scheduled');
    await api.setPendingTaskTimer(task);
}

async function findProjectRoot(filename: string): Promise<string> {
    const dirname = path.dirname(filename);

    if (dirname === filename || dirname === '/' || dirname === '/Users')
        return null;
    
    if (await fs.exists(path.join(dirname, 'package.json'))) {
        return dirname;
    }

    return findProjectRoot(dirname);
}

async function fileWasChanged(filename: string) {

    const packageRoot = await findProjectRoot(filename);
    if (!packageRoot)
        return;

    const packageJsonFilename = path.join(packageRoot, 'package.json');
    const hasPackageJson = await fs.exists(packageJsonFilename);

    if (!hasPackageJson)
        return;

    const inSrcDir = filename.startsWith(path.join(packageRoot, 'src'));

    if (!inSrcDir) {
        return;
    }

    const packageJson = await JSON.parse(await fs.readFile(packageJsonFilename, 'utf8'));

    const hasBuildScript = packageJson.scripts && packageJson.scripts.build;

    if (!hasBuildScript) {
        console.log('No build script in: ' + packageJsonFilename)
        return;
    }

    scheduleCommandIfNeeded(`yarn build`, packageRoot);
}

function randInt(max) {
    return Math.floor(Math.random() * max);
}

async function getOrInitColor(dir: string): Promise<number[]> {
    const existing = await api.getDirectoryColor(dir);
    if (existing)
        return JSON.parse(existing)

    const color = [randInt(255), randInt(255), randInt(255)];
    await api.setDirectoryColor(dir, JSON.stringify(color));
    return color;
}

async function startTask(task: string) {
    const info = await api.getTaskInfo(task);
    api.setTaskStatus(task, 'running');
    const color = await getOrInitColor(info.cwd);
    const logLabel = Chalk.rgb(color[0], color[1], color[2])(`[${task}]`);

    console.log(`${logLabel}: starting, cmd = "${info.cmd}", cwd = ${info.cwd}`);

    const args = info.cmd.split(' ');

    const proc = ChildProcess.spawn(args[0], args.slice(1), {
        cwd: info.cwd,
        stdio: 'pipe'
    });

    proc.stdout.on('data', (msg) => {
        msg = msg.toString();
        msg = msg.replace(/\n$/, '');
        console.log(`${logLabel} ${msg}`);
    });

    proc.stderr.on('data', (msg) => {
        msg = msg.toString();
        msg = msg.replace(/\n$/, '');
        console.log(`${logLabel} ${msg}`);
    });

    proc.on('exit', (evt) => {
        console.log(`${logLabel}: finished`);
        api.deleteTask(task);
    });
}

async function start() {

    console.log('Build bot starting..');

    // Watch all changed files
    api.eventListener(async (evt) => {

        // console.log('received event: ' + JSON.stringify(evt));
        
        switch (evt.id) {
        case 'fileChanged':

            const { filename } = evt;

            if (ignoreFile(filename))
                return;

            fileWasChanged(filename);
            return;

        case 'taskTimerExpired':
            const info = await api.getTaskInfo(evt.buildTask);

            if (info.status === 'scheduled') {
                startTask(evt.buildTask)
                .catch(console.error);
            }

            return;

        default:
            console.error('unrecognized event: ', evt)
        }
    });

    await new Promise((resolve,reject) => {});
}

export async function main() {
    runStandardProcess('autobuildbot', (_graph: Graph) => {
        graph = _graph;
        api = new BuildBotAPI(graph);
        return start();
    });
}
