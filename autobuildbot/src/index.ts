
import Graph from './fs/Graph'
import runStandardProcess from './fs/toollib/runStandardProcess'
import Path from 'path'
import BuildBotAPI from './BuildBotAPI'

async function run(graph: Graph) {

    const api = new BuildBotAPI(graph);

    api.listenToFileChanges((filename: string) => {
        console.log('Saw file change: ', filename);
    });

    console.log('Launched Build Bot..');

    await new Promise((resolve,reject) => {});

    // Watch all changed files
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
    runStandardProcess(run);
}
