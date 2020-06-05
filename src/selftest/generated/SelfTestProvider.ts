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

        if ((pattern.tagCount() == 4) && (pattern.hasType("self-test-results")) && (pattern.hasType("description")) && (pattern.hasType("resultMessage")) && (pattern.hasType("passed"))) {
            try {
                const result = this.handler.selfTestResults();

                if (!Array.isArray(result)) {
                    throw new Error("expected selfTestResults to return an Array, got: " + JSON.stringify(result))
                }

                for (const item of result) {
                    const outRelation = pattern
                        .setTagValueForType("description", item.description)
                        .setTagValueForType("resultMessage", item.resultMessage)
                        .setTagValueForType("passed", item.passed);
                    output.relation(outRelation);
                }
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/selftest-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/selftest-provider doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/selftest-provider doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}