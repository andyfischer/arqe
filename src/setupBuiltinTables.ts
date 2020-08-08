
import Graph from './Graph'
import TableMount from './TableMount';
import { decoratedObjToTableMount } from './decorators';

type ExecEnv = 'browser' | 'node' | 'any'

interface TableInitializer {
    init: () => TableMount[],
    execEnv: ExecEnv
}

const builtinTables: TableInitializer[] = [
    {
        init: () => {
            const { WorkingFile } = require('./tables/WorkingFile');
            return [ decoratedObjToTableMount(new WorkingFile()) ]
        },
        execEnv: 'any'
    },
    {
        init: () => {
            return require('./tables/Filesystem').setupTables();
        },
        execEnv: 'node'
    }, 
    {
        init: () => {
            const { Remote } = require('./tables/Remote');
            return [ decoratedObjToTableMount(new Remote()) ]
        },
        execEnv: 'any'
    }, 
    {
        init: () => {
            const { TestMath } = require('./tables/TestMath');
            return [ decoratedObjToTableMount(new TestMath()) ]
        },
        execEnv: 'any'
    },
];

export default function setupBuiltinTables(graph: Graph, context: ExecEnv) {

    for (const tableDef of builtinTables) {
        if (context === 'browser' && tableDef.execEnv === 'node')
            continue;

        const tables = tableDef.init();
        graph.addTables(tables);
    }
}
