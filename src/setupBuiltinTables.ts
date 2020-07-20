
import Graph from './Graph'
import { isRunningInNode } from './utils'
import TableMount from './TableMount';
import { decoratedObjToTableMount } from './decorators';

type ExecEnv = 'browser' | 'node' | 'any'

interface TableInitializer {
    init: () => TableMount,
    execEnv: ExecEnv
}

const builtinTables: TableInitializer[] = [
    {
        init: () => {
            const { WorkingFile } = require('./tables/WorkingFile');
            return decoratedObjToTableMount(new WorkingFile())
        },
        execEnv: 'any'
    },
    {
        init: () => {
            const { fsFileContents } = require('./tables/Filesystem');
            return fsFileContents();
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { fsDirectory } = require('./tables/Filesystem');
            return fsDirectory();
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { glob } = require('./tables/Filesystem');
            return glob();
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { Remote } = require('./tables/Remote');
            return decoratedObjToTableMount(new Remote());
        },
        execEnv: 'any'
    }, 
    {
        init: () => {
            const { TestMath } = require('./tables/TestMath');
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
