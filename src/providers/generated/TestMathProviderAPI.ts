import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    sum: (a: string, b: string) => any
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        // check for handler/sum (get test-math sum a/$a b/$b)

        if ((pattern.tagCount() == 4) && (pattern.hasAttr("test-math")) && (pattern.hasAttr("sum")) && (pattern.hasAttr("a")) && (pattern.hasAttr("a")) && (pattern.hasAttr("b")) && (pattern.hasAttr("b"))) {
            try {
                const a = pattern.getVal("a");
                const b = pattern.getVal("b");
                const sum = this.handler.sum(a, b);

                if (typeof sum !== 'string') {
                    throw new Error("expected sum to return a string, got: " + JSON.stringify(sum))
                }

                const outRelation = pattern.setTagValueForType("sum", sum);
                output.relation(outRelation);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/test-math-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/test-math-provider doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/test-math-provider doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}