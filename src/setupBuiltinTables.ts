
import Graph from './Graph'
import { isRunningInNode } from './utils'
import parseTuple from './parseTuple';
import TableMount, { decoratedObjToTableMount } from './TableMount';

type ExecEnv = 'browser' | 'node' | 'any'

interface TableInitializer {
    init: () => TableMount,
    execEnv: ExecEnv
}

const tableInitializers: TableInitializer[] = [
    {
        init: () => {
            const { WorkingFile } = require('./virtualTables/WorkingFile');
            return decoratedObjToTableMount(new WorkingFile())
        },
        execEnv: 'any'
    },
    {
        init: () => {
            const { FsFileContents } = require('./virtualTables/Filesystem');
            return decoratedObjToTableMount(new FsFileContents())
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { FsDirectory } = require('./virtualTables/Filesystem');
            return decoratedObjToTableMount(new FsDirectory());
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { Glob } = require('./virtualTables/Glob');
            return decoratedObjToTableMount(new Glob());
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { Remote } = require('./virtualTables/Remote');
            return decoratedObjToTableMount(new Remote());
        },
        execEnv: 'any'
    }, 
    {
        init: () => {
            const { TestMath } = require('./virtualTables/TestMath');
            return decoratedObjToTableMount(new TestMath())
        },
        execEnv: 'any'
    }, 
];

function currentExecEnv(): ExecEnv {
    if (isRunningInNode())
        return 'node'
    else
        return 'browser'
}

export default function setupBuiltinTables(graph: Graph) {

    const execEnv = currentExecEnv();

    graph.defineInMemoryTable('WatchCommands', parseTuple('watch pattern'));

    for (const tableDef of tableInitializers) {
        if (execEnv === 'browser' && tableDef.execEnv === 'node')
            continue;

        const table = tableDef.init();
        graph.addTable(table);
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


