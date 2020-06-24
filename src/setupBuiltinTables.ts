
import Graph from './Graph'
import StorageProvider from './StorageProvider'
import setupFilesystemProvider from './providers/Filesystem'
import { setupGitProvider } from './providers/Git'
import setupFileChangeLog from './providers/FileChangedLog'
import ExpireAtListener from './providers/ExpireAtListener'
import { setupTestMathStorage } from './providers/TestMathStorage'
import setupTypescriptTree from './providers/TypescriptTree'
import setupTypescriptCompilation from './providers/TypescriptCompiler'
import setupSelfTest from './selftest/SelfTest'
import setupWorkingFile from './providers/WorkingFile'
import setupMinecraftServer from './providers/MinecraftServer'
import { FsFileContents, FsDirectory } from './virtualTables/Filesystem'
import { parsePattern } from './parseCommand'
import { Remote } from './virtualTables/Remote'

export default function setupBuiltinTables(graph: Graph): {[name: string]: StorageProvider } {

    const tables = [new FsFileContents(), new FsDirectory(), new Remote()]
    for (const table of tables) {
        graph.defineVirtualTable(table.name, parsePattern(table.schema), table);
    }

    const views = {
        'git': setupGitProvider(),
        'file-changed': setupFileChangeLog(graph),
        'expires-at': new ExpireAtListener(graph),
        'test-math': setupTestMathStorage(),
        'typescript-tree': setupTypescriptTree(),
        'tsc-compile': setupTypescriptCompilation(),
        'self-test-results': setupSelfTest(graph),
        'working-file': setupWorkingFile(),
    }

    if (process.env.WITH_MINECRAFT_SERVER)
        views['mc'] = setupMinecraftServer()

    return views;
}


