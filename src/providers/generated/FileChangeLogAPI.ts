import { GraphLike, Relation, Pattern, RelationReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    onChange: (filename: string) => void
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/file-change-log doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: RelationReceiver) {
        // check for handler/onChange (set log file-changed filename/$filename)

        if ((pattern.tagCount() == 3) && (pattern.hasType("log")) && (pattern.hasType("file-changed")) && (pattern.hasType("filename")) && (pattern.hasValueForType("filename"))) {
            try {
                const filename = pattern.getTagValue("filename");
                this.handler.onChange(filename);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/file-change-log doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/file-change-log doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}