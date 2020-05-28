
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

export default function getBuiltinViews(graph: Graph): {[name: string]: StorageProvider } {
    return {
        'fs': setupFilesystemProvider(),
        'git': setupGitProvider(),
        'file-changed': setupFileChangeLog(graph),
        'expires-at': new ExpireAtListener(graph),
        'test-math': setupTestMathStorage(),
        'typescript-tree': setupTypescriptTree(),
        'tsc-compile': setupTypescriptCompilation(),
        'self-test-results': setupSelfTest(graph)
    }
}
