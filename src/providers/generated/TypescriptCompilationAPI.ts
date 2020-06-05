import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    runTsc: (dir: string) => Promise<any[]>
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        // check for handler/runTsc (get tsc-compile dir/$dir filename message lineno colno)

        if ((pattern.tagCount() == 6) && (pattern.hasType("tsc-compile")) && (pattern.hasType("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasType("filename")) && (pattern.hasType("message")) && (pattern.hasType("lineno")) && (pattern.hasType("colno"))) {
            try {
                const dir = pattern.getTagValue("dir");
                const result = await this.handler.runTsc(dir);

                if (!Array.isArray(result)) {
                    throw new Error("expected runTsc to return an Array, got: " + JSON.stringify(result))
                }

                for (const item of result) {
                    const outRelation = pattern
                        .setTagValueForType("filename", item.filename)
                        .setTagValueForType("message", item.message)
                        .setTagValueForType("lineno", item.lineno)
                        .setTagValueForType("colno", item.colno);
                    output.relation(outRelation);
                }
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/tsc-compile doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/tsc-compile doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/tsc-compile doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}