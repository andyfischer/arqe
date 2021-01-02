
import parseTableDefinition, { setupTable, SingleTableDefinition, TableSetDefinition } from './parseTableDefinition'
import TableMount from './TableMount'
import { TupleLike } from './coerce'
import Graph from './Graph'
import QueryTemplate from './QueryTemplate'
import { QueryLike } from './coerce'

export default class TableDefiner {
    mounts: TableMount[] = []

    provide(schema: TupleLike, def: SingleTableDefinition) {
        const mount = setupTable(schema, def);

        this.mounts.push(mount);

        return this;
    }

    provideSet(set: TableSetDefinition) {
        this.mounts = this.mounts.concat(parseTableDefinition(set));
        return this;
    }

    mount(graph: Graph) {
        graph.addTables(this.mounts);
    }

    unmount(graph: Graph) {
        graph.removeTables(this.mounts);
        this.mounts = [];
    }

    prepare(queryLike: QueryLike) {
        return new QueryTemplate(queryLike);
    }
}
