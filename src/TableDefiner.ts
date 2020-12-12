
import setupTableSet, { setupTable, SingleTableDefinition, TableSetDefinition } from './setupTableSet'
import TableMount from './TableMount'
import { TupleLike } from './coerce'
import Graph from './Graph'

export default class TableDefiner {
    mounts: TableMount[] = []

    provide(schema: TupleLike, def: SingleTableDefinition) {
        const mount = setupTable(schema, def);

        this.mounts.push(mount);

        return this;
    }

    provideSet(set: TableSetDefinition) {
        this.mounts = this.mounts.concat(setupTableSet(set));
        return this;
    }

    mount(graph: Graph) {
        graph.addTables(this.mounts);
    }

    unmount(graph: Graph) {
        graph.removeTables(this.mounts);
        this.mounts = [];
    }
}
