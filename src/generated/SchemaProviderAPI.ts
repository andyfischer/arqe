import { GraphLike, Relation, Pattern, RelationReceiver, StorageProviderV3, emitCommandError } from ".."

interface NativeHandler {
    setObjectColumn: (column: string) => void
    setTableColumn: (column: string) => void
}

export default class API implements StorageProviderV3 {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    handlesPattern(pattern: Pattern): boolean {
        if ((pattern.tagCount() >= 2) && (pattern.hasType("schema"))) {
            return true;
        }

        return false;
    }

    async runSearch(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/schema-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: RelationReceiver) {
        // check for handler/setObjectColumn (set schema column/$column object)

        if ((pattern.tagCount() == 3) && (pattern.hasType("schema")) && (pattern.hasType("column")) && (pattern.hasValueForType("column")) && (pattern.hasType("object"))) {
            const column = pattern.getTagValue("column");
            this.handler.setObjectColumn(column);
            output.relation(pattern);
            output.finish();
            return;
        }

        // check for handler/setTableColumn (set schema column/$column table)

        if ((pattern.tagCount() == 3) && (pattern.hasType("schema")) && (pattern.hasType("column")) && (pattern.hasValueForType("column")) && (pattern.hasType("table"))) {
            const column = pattern.getTagValue("column");
            this.handler.setTableColumn(column);
            output.relation(pattern);
            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/schema-provider doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/schema-provider doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}