import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    selfTestResults: () => any[]
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        // check for handler/selfTestResults (get self-test-results description resultMessage passed)

        if ((pattern.tagCount() == 4) && (pattern.hasAttr("self-test-results")) && (pattern.hasAttr("description")) && (pattern.hasAttr("resultMessage")) && (pattern.hasAttr("passed"))) {
            try {
                const result = this.handler.selfTestResults();

                if (!Array.isArray(result)) {
                    throw new Error("expected selfTestResults to return an Array, got: " + JSON.stringify(result))
                }

                for (const item of result) {
                    const outRelation = pattern
                        .setVal("description", item.description)
                        .setVal("resultMessage", item.resultMessage)
                        .setVal("passed", item.passed);
                    output.next(outRelation);
                }
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        emitCommandError(output, "provider code-generation/selftest-provider doesn't support: get " + pattern.stringify());
        output.done()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/selftest-provider doesn't support: set " + pattern.stringify());
        output.done()
    }

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/selftest-provider doesn't support: delete " + pattern.stringify());
        output.done()
    }
}
