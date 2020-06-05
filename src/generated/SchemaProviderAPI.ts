import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from ".."

interface NativeHandler {
    setObjectColumn: (column: string) => void
    setViewColumn: (column: string) => void
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/schema-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        // check for handler/setObjectColumn (set schema column/$column object)

        if ((pattern.tagCount() == 3) && (pattern.hasType("schema")) && (pattern.hasType("column")) && (pattern.hasValueForType("column")) && (pattern.hasType("object"))) {
            try {
                const column = pattern.getTagValue("column");
                this.handler.setObjectColumn(column);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        // check for handler/setViewColumn (set schema column/$column view)

        if ((pattern.tagCount() == 3) && (pattern.hasType("schema")) && (pattern.hasType("column")) && (pattern.hasValueForType("column")) && (pattern.hasType("view"))) {
            try {
                const column = pattern.getTagValue("column");
                this.handler.setViewColumn(column);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/schema-provider doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/schema-provider doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}