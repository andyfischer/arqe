import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    createAstFromText: (text: string) => any
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        // check for handler/createAstFromText (get typescript-tree/* text/$text)

        if ((pattern.tagCount() == 2) && (pattern.hasAttr("typescript-tree")) && (pattern.hasAttr("text")) && (pattern.hasValueForAttr("text"))) {
            try {
                const text = pattern.getVal("text");
                const filename = this.handler.createAstFromText(text);

                if (typeof filename !== 'string') {
                    throw new Error("expected createAstFromText to return a string, got: " + JSON.stringify(filename))
                }

                const outRelation = pattern.setVal("typescript-tree", filename);
                output.next(outRelation);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        emitCommandError(output, "provider code-generation/javascript-ast doesn't support: get " + pattern.stringify());
        output.done()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/javascript-ast doesn't support: set " + pattern.stringify());
        output.done()
    }

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/javascript-ast doesn't support: delete " + pattern.stringify());
        output.done()
    }
}