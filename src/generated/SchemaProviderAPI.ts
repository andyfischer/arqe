import { GraphLike, Tuple, Stream, emitCommandError } from ".."

interface NativeHandler {
    setObjectColumn: (column: string) => void
    setViewColumn: (column: string) => void
}

export default class API {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Tuple, output: Stream) {
        emitCommandError(output, "provider code-generation/schema-provider doesn't support: get " + pattern.stringify());
        output.done()
    }

    async runSave(pattern: Tuple, output: Stream) {
        // check for handler/setObjectColumn (set schema column/$column object)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("schema")) && (pattern.hasAttr("column")) && (pattern.hasValueForAttr("column")) && (pattern.hasAttr("object"))) {
            try {
                const column = pattern.getVal("column");
                this.handler.setObjectColumn(column);
                output.next(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        // check for handler/setViewColumn (set schema column/$column view)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("schema")) && (pattern.hasAttr("column")) && (pattern.hasValueForAttr("column")) && (pattern.hasAttr("view"))) {
            try {
                const column = pattern.getVal("column");
                this.handler.setViewColumn(column);
                output.next(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        emitCommandError(output, "provider code-generation/schema-provider doesn't support: set " + pattern.stringify());
        output.done()
    }

    async runDelete(pattern: Tuple, output: Stream) {
        emitCommandError(output, "provider code-generation/schema-provider doesn't support: delete " + pattern.stringify());
        output.done()
    }
}
