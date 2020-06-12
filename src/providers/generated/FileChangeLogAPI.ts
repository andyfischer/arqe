import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    onChange: (filename: string) => void
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/file-change-log doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        // check for handler/onChange (set log file-changed filename/$filename)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("log")) && (pattern.hasAttr("file-changed")) && (pattern.hasAttr("filename")) && (pattern.hasValueForType("filename"))) {
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

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/file-change-log doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}