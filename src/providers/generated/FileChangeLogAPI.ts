import { GraphLike, Relation, Pattern, RelationReceiver, StorageProviderV3, emitCommandError } from "../.."

interface NativeHandler {
    onChange: (filename: string) => void
}

export default class API implements StorageProviderV3 {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    handlesPattern(pattern: Pattern): boolean {
        if ((pattern.tagCount() == 3) && (pattern.hasType("log")) && (pattern.hasType("file-changed")) && (pattern.hasType("filename"))) {
            return true;
        }

        return false;
    }

    async runSearch(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/file-change-log doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: RelationReceiver) {
        // check for handler/onChange (set log file-changed filename/$filename)

        if ((pattern.tagCount() == 3) && (pattern.hasType("log")) && (pattern.hasType("file-changed")) && (pattern.hasType("filename")) && (pattern.hasValueForType("filename"))) {
            const filename = pattern.getTagValue("filename");
            this.handler.onChange(filename);
            output.relation(pattern);
            output.finish();
        }

        emitCommandError(output, "provider code-generation/file-change-log doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/file-change-log doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}