import { GraphLike, Relation, Pattern, RelationReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    runTsc: (filename: string) => any[]
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: RelationReceiver) {
        // check for handler/runTsc (get tsc-compile filename/$filename message line col)

        if ((pattern.tagCount() == 5) && (pattern.hasType("tsc-compile")) && (pattern.hasType("filename")) && (pattern.hasValueForType("filename")) && (pattern.hasType("message")) && (pattern.hasType("line")) && (pattern.hasType("col"))) {
            const filename = pattern.getTagValue("filename");
            const result = this.handler.runTsc(filename);

            if (!Array.isArray(result)) {
                throw new Error("expected runTsc to return an Array, got: " + JSON.stringify(result))
            }

            for (const item of result) {
                const outRelation = pattern
                    .setTagValueForType("message", item.message)
                    .setTagValueForType("line", item.line)
                    .setTagValueForType("col", item.col);
                output.relation(outRelation);
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/tsc-compile doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/tsc-compile doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/tsc-compile doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}