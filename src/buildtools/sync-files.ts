
// Glob the files listing
// Iterate each file
// Copy over to the new directory

import Graph from "../Graph";
import Path from 'path'
import Fs from 'fs-extra'

interface Settings {
    fromBaseDir: string
    glob: string
    toBaseDir: string
    deleteExtraFiles?: boolean
}

async function fileContentIsDifferent(filenameA: string, filenameB: string) {

}

class FileSyncer {
    graph: Graph
    settings: Settings

    constructor(graph: Graph, settings: Settings) {
        this.graph = graph;
        this.settings = settings;
    }

    async runFirstPass() {
        const { fromBaseDir, glob, toBaseDir, deleteExtraFiles } = this.settings;
        // console.log('calling ' + `glob cwd(${fromBaseDir}) pattern(${glob}) filename`)
        const filenames = (await this.graph.getRelationAsync(`glob cwd(${fromBaseDir}) pattern(${glob}) filename`))
            .tuples.map(entry => entry.getVal('filename'));

        const filenamesMap = new Map();
        for (const filename of filenames)
            filenamesMap.set(filename, true);

        // Maybe delete leftover files in the 'to' dir.
        if (deleteExtraFiles) {
            const existingFilenames = (await this.graph.getRelationAsync(`glob cwd(${toBaseDir}) pattern(**) filename`))
                .tuples.map(entry => entry.getVal('filename'));

            for (const filename of existingFilenames) {
                if (!filenamesMap.has(filename)) {
                    console.log('deleting extra file: ' + filename)
                    const newPath = Path.join(toBaseDir, filename)
                    await Fs.unlink(newPath);
                }
            }
        }

        // Copy all files 'from' -> 'to'.
        for (const filename of filenames) {
            const oldPath = Path.join(fromBaseDir, filename)
            const newPath = Path.join(toBaseDir, filename)

            console.log(`copy: ${oldPath} -> ${newPath}`)

            const isFile = (await Fs.lstat(oldPath)).isFile();

            if (isFile) {
                await Fs.copyFile(oldPath, newPath);
            } else {
                await Fs.mkdirp(newPath);
            }
        }
    }
}

export async function startFileSyncer(graph: Graph, settings: Settings) {
    console.log('startFileSyncer..')
    const syncer = new FileSyncer(graph, settings);
    await syncer.runFirstPass();

}
