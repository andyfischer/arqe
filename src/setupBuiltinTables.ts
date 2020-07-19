
import Graph from './Graph'
import { isRunningInNode } from './utils'
import parseTuple from './parseTuple';
import TableMount, { decoratedObjToTableMount } from './TableMount';
import setupInMemoryObject from './virtualTables/InMemoryObject'

type ExecEnv = 'browser' | 'node' | 'any'

interface TableInitializer {
    init: () => TableMount,
    execEnv: ExecEnv
}

const builtinTables: TableInitializer[] = [
    {
        init: () => {
            const { WorkingFile } = require('./virtualTables/WorkingFile');
            return decoratedObjToTableMount(new WorkingFile())
        },
        execEnv: 'any'
    },
    {
        init: () => {
            const { fsFileContents } = require('./virtualTables/Filesystem');
            return fsFileContents();
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { fsDirectory } = require('./virtualTables/Filesystem');
            return fsDirectory();
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { glob } = require('./virtualTables/Filesystem');
            return glob();
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

    // graph.defineInMemoryTable('WatchCommands', parseTuple('watch pattern'));

    for (const tableDef of builtinTables) {
        if (execEnv === 'browser' && tableDef.execEnv === 'node')
            continue;

        const table = tableDef.init();
        graph.addTable(table);
    }

    /*
    const { object, table } = setupInMemoryObject({
        primaryKey: parseTuple('testobj'),
        initialValue: {
            a: '1',
            b: '2'
        }
    });

    graph.addTable(table);
    */
}
