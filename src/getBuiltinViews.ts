
import Graph from './Graph'
import StorageProviderV3 from './StorageProviderV3'
import setupFilesystemProvider from './providers/Filesystem'
import { setupGitProvider } from './providers/Git'
import setupFileChangeLog from './providers/FileChangedLog'
import ExpireAtListener from './ExpireAtListener'
import { setupTestMathStorage } from './providers/TestMathStorage'

export default function getBuiltinViews(graph: Graph): {[name: string]: StorageProviderV3 } {
    return {
        'fs': setupFilesystemProvider(),
        'git': setupGitProvider(),
        'file-changed': setupFileChangeLog(this),
        // 'expires-at': new ExpireAtListener(graph),
        'test-math': setupTestMathStorage()
    }
}
