
import Graph from './fs/Graph'
import runStandardProcess from './fs/toollib/runStandardProcess'
import path from 'path'
import fs from 'fs-extra'
import BuildBotAPI from './BuildBotAPI'

let graph: Graph;

function ignoreFile(filename: string) {
    return (/COMMIT_EDITMSG/.exec(filename));
}

async function findProjectRoot(filename: string) {

    console.log('findProjectRoot: ' + filename);

    const dirname = path.dirname(filename);

    console.log(' dirname: ' + dirname);

    if (dirname === filename || dirname === '/' || dirname === '/Users')
        return null;
    
    if (await fs.exists(path.join(dirname, 'package.json'))) {
        console.log(`package root dir of ${filename} is: ${dirname}`);
        return dirname;
    }

    return findProjectRoot(dirname);
}

async function fileWasChanged(filename: string) {

    console.log('file was changed: ', filename);

    const packageRoot = findProjectRoot(filename);
    const packageJsonFilename = path.join(packageRoot, 'package.json');
    const hasPackageJson = await fs.exists(packageJsonFilename);

    if (!hasPackageJson)
        return;

    const inSrcDir = filename.startsWith(path.join(packageRoot, 'src'));

    if (!inSrcDir)
        return;

    const packageJson = await JSON.parse(await fs.readFile(packageJsonFilename, 'utf8'));

    const hasBuildScript = packageJson.scripts && packageJson.scripts.build;

    if (!hasBuildScript) {
        console.log('No build script in: ' + packageJsonFilename)
        return;
    }

    console.log('trigger rebuild: ', packageRoot);
}

async function start() {
    const api = new BuildBotAPI(graph);

    // Watch all changed files
    api.listenToFileChanges((filename: string) => {
        if (ignoreFile(filename))
            return;

        console.log('Saw file change: ', filename);
        fileWasChanged(filename);
    });

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
        return start();
    });
}
