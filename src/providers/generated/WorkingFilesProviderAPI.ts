import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    loadFile: (filename: string) => Promise<any>
    getLine: (id: string, lineno: string) => any
    setLine: (id: string, lineno: string, text: string) => void
    commitFile: (id: string) => void
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        // check for handler/loadFile (get working-file((new)) filename/$filename)

        if ((pattern.tagCount() == 2) && (pattern.hasAttr("working-file")) && (pattern.hasAttr("filename")) && (pattern.hasValueForAttr("filename"))) {
            try {
                const filename = pattern.getVal("filename");
                const result = await this.handler.loadFile(filename);
                const outRelation = pattern
                    .setVal("working-file", result.id)
                    .setVal("filename", result.filename);
                output.next(outRelation);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        // check for handler/getLine (get working-file/$id line/$lineno text)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("working-file")) && (pattern.hasValueForAttr("working-file")) && (pattern.hasAttr("line")) && (pattern.hasValueForAttr("line")) && (pattern.hasAttr("text"))) {
            try {
                const id = pattern.getVal("working-file");
                const lineno = pattern.getVal("line");
                const text = this.handler.getLine(id, lineno);

                if (typeof text !== 'string') {
                    throw new Error("expected getLine to return a string, got: " + JSON.stringify(text))
                }

                const outRelation = pattern.setVal("text", text);
                output.next(outRelation);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        emitCommandError(output, "provider code-generation/working-files-provider doesn't support: get " + pattern.stringify());
        output.done()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        // check for handler/setLine (set working-file/$id line/$lineno text/$text)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("working-file")) && (pattern.hasValueForAttr("working-file")) && (pattern.hasAttr("line")) && (pattern.hasValueForAttr("line")) && (pattern.hasAttr("text")) && (pattern.hasValueForAttr("text"))) {
            try {
                const id = pattern.getVal("working-file");
                const lineno = pattern.getVal("line");
                const text = pattern.getVal("text");
                this.handler.setLine(id, lineno, text);
                output.next(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        // check for handler/commitFile (set working-file/$id commit)

        if ((pattern.tagCount() == 2) && (pattern.hasAttr("working-file")) && (pattern.hasValueForAttr("working-file")) && (pattern.hasAttr("commit"))) {
            try {
                const id = pattern.getVal("working-file");
                await this.handler.commitFile(id);
                output.next(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        emitCommandError(output, "provider code-generation/working-files-provider doesn't support: set " + pattern.stringify());
        output.done()
    }

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/working-files-provider doesn't support: delete " + pattern.stringify());
        output.done()
    }
}
