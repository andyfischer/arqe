
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
import setupRemoteProvider from './providers/RemoteProvider'
import { FsFileContents } from './virtualTables/Filesystem'
import { parsePattern } from './parseCommand'

export default function setupBuiltinTables(graph: Graph): {[name: string]: StorageProvider } {

    for (const table of [new FsFileContents()]) {
        graph.defineVirtualTable(table.name, parsePattern(table.schema), table);
    }

    const views = {
        'remote': setupRemoteProvider(),
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


