
import 'source-map-support'
import Graph from './fs/Graph'
import runStandardProcess from './fs/toollib/runStandardProcess'
import path from 'path'
import fs from 'fs-extra'
import BuildBotAPI from './BuildBotAPI'

let graph: Graph;
let api: BuildBotAPI;

function ignoreFile(filename: string) {
    return (/COMMIT_EDITMSG/.exec(filename));
}

async function scheduleCommandIfNeeded(cmd: string) {
    const tasks = await api.findTasksByCommand(cmd);

    for (const task of tasks) {
        const status = await api.taskStatus(task);
        if (status === 'scheduled') {
            console.log('already have this scheduled: ' + cmd);
            return;
        }
    }

    console.log('scheduling command: ' + cmd);
    await api.createBuildTask(cmd, 'scheduled');
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
        console.log('Not in src directory: ' + filename);
        return;
    }

    const packageJson = await JSON.parse(await fs.readFile(packageJsonFilename, 'utf8'));

    const hasBuildScript = packageJson.scripts && packageJson.scripts.build;

    if (!hasBuildScript) {
        console.log('No build script in: ' + packageJsonFilename)
        return;
    }

    console.log('Trggering build in: ' + packageRoot);
    scheduleCommandIfNeeded(`cd ${packageRoot} && yarn build`);
}

async function start() {

    console.log('Build bot starting..');

    // Watch all changed files
    api.eventListener((evt) => {
        switch (evt.id) {
        case 'fileChanged':

            const { filename } = evt;

            if (ignoreFile(filename))
                return;

            fileWasChanged(filename);
            return;

        case 'taskTimerExpired':
            console.log('task timer expired: ', evt);
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
