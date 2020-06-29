
import Graph from './Graph'
import ExpireAtListener from './providers/ExpireAtListener'
import { parsePattern } from './parseCommand'
import { isRunningInNode } from './utils'

type ExecEnv = 'browser' | 'node' | 'any'

const tableDefinitions = {
    tables: [
    {
        init: () => {
            const { FsFileContents } = require('./virtualTables/Filesystem');
            return new FsFileContents();
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { FsDirectory } = require('./virtualTables/Filesystem');
            return new FsDirectory();
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { Glob } = require('./virtualTables/Glob');
            return new Glob();
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { Remote } = require('./virtualTables/Remote');
            return new Remote();
        },
        execEnv: 'any'
    }, 
    {
        init: () => {
            const { TestMath } = require('./virtualTables/TestMath');
            return new TestMath();
        },
        execEnv: 'any'
    }, 
    ],
}

function currentExecEnv(): ExecEnv {
    if (isRunningInNode())
        return 'node'
    else
        return 'browser'
}

export default function setupBuiltinTables(graph: Graph) {

    const execEnv = currentExecEnv();
    for (const tableDef of tableDefinitions.tables) {
        if (execEnv === 'browser' && tableDef.execEnv === 'node')
            continue;

        const table = tableDef.init();
        graph.defineVirtualTable(table.name, parsePattern(table.schema), table);
    }

    /*
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
    if (process.env.WITH_MINECRAFT_SERVER) {
        const setupMinecraftServer = require('./providers/MinecraftServer').default;
        views['mc'] = setupMinecraftServer()
    }

    return views;
    */
}


