import { GraphLike, Relation, Pattern, RelationReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    createAstFromText: (text: string) => any
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: RelationReceiver) {
        // check for handler/createAstFromText (get typescript-tree/* text/$text)

        if ((pattern.tagCount() == 2) && (pattern.hasType("typescript-tree")) && (pattern.hasType("text")) && (pattern.hasValueForType("text"))) {
            const text = pattern.getTagValue("text");
            const filename = this.handler.createAstFromText(text);

            if (typeof filename !== 'string') {
                throw new Error("expected createAstFromText to return a string, got: " + JSON.stringify(filename))
            }

            const outRelation = pattern.setTagValueForType("typescript-tree", filename);
            output.relation(outRelation);
            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/javascript-ast doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/javascript-ast doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/javascript-ast doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}