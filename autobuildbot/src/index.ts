
import 'source-map-support'
import Graph from './fs/Graph'
import runStandardProcess from './fs/toollib/runStandardProcess'
import path from 'path'
import fs from 'fs-extra'
import BuildBotAPI from './BuildBotAPI'
import ChildProcess from 'child_process'

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
    const packageJsonFilename = path.join(packageRoot, 'package.json');
    const hasPackageJson = await fs.exists(packageJsonFilename);

    if (!hasPackageJson)
        return;

    const inSrcDir = filename.startsWith(path.join(packageRoot, 'src'));

    if (!inSrcDir) {
        // console.log('ignoring, not in a src directory: ' + filename);
        return;
    }

    const packageJson = await JSON.parse(await fs.readFile(packageJsonFilename, 'utf8'));

    const hasBuildScript = packageJson.scripts && packageJson.scripts.build;

    if (!hasBuildScript) {
        console.log('No build script in: ' + packageJsonFilename)
        return;
    }

    console.log('scheduling build: ' + packageRoot);
    scheduleCommandIfNeeded(`yarn build`, packageRoot);
}

async function startTask(task: string) {
    const info = await api.getTaskInfo(task);
    api.setTaskStatus(task, 'running');

    console.log(`[starting ${task}] ${info.cmd} (cwd = ${info.cwd})`);

    const args = info.cmd.split(' ');

    const proc = ChildProcess.spawn(args[0], args.slice(1), {
        cwd: info.cwd,
        stdio: 'pipe'
    });

    proc.stdout.on('data', (msg) => {
        msg = msg.toString();
        msg = msg.replace(/\n$/, '');
        console.log(`[${task}] ${msg}`);
    });

    proc.stderr.on('data', (msg) => {
        msg = msg.toString();
        msg = msg.replace(/\n$/, '');
        console.log(`[${task} err] ${msg}`);
    });

    proc.on('exit', (evt) => {
        console.log(`[finished ${task}]: ${evt}`);
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

    //api.listenToFileChanges((filename: string) => {
    //});

    //api.listenToPendingTasks((task: string) => {
    //});

    await new Promise((resolve,reject) => {});

    // Look for certain file extensions
    // If we see a rebuildable file..
    // Find the parent package.json file
    // Check if a rebuild is in progress
    //   If so schedule one for later
    //   If not, start one
    // Run rebuild
    // Print to stdout with different colors
}

// API
//   Listen to all changed files
//   Find existing job
//   Create job
//   Delete job
//   Get color list
export async function main() {
    runStandardProcess((_graph: Graph) => {
        graph = _graph;
        api = new BuildBotAPI(graph);
        return start();
    });
}
