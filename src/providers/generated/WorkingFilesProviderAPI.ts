import { GraphLike, Relation, Pattern, RelationReceiver, StorageProvider, emitCommandError } from "../.."

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

    async runSearch(pattern: Pattern, output: RelationReceiver) {
        // check for handler/loadFile (get working-file((new)) filename/$filename)

        if ((pattern.tagCount() == 2) && (pattern.hasType("working-file")) && (pattern.hasType("filename")) && (pattern.hasValueForType("filename"))) {
            try {
                const filename = pattern.getTagValue("filename");
                const result = await this.handler.loadFile(filename);
                const outRelation = pattern
                    .setTagValueForType("working-file", result.id)
                    .setTagValueForType("filename", result.filename);
                output.relation(outRelation);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        // check for handler/getLine (get working-file/$id line/$lineno text)

        if ((pattern.tagCount() == 3) && (pattern.hasType("working-file")) && (pattern.hasValueForType("working-file")) && (pattern.hasType("line")) && (pattern.hasValueForType("line")) && (pattern.hasType("text"))) {
            try {
                const id = pattern.getTagValue("working-file");
                const lineno = pattern.getTagValue("line");
                const text = this.handler.getLine(id, lineno);

                if (typeof text !== 'string') {
                    throw new Error("expected getLine to return a string, got: " + JSON.stringify(text))
                }

                const outRelation = pattern.setTagValueForType("text", text);
                output.relation(outRelation);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/working-files-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: RelationReceiver) {
        // check for handler/setLine (set working-file/$id line/$lineno text/$text)

        if ((pattern.tagCount() == 3) && (pattern.hasType("working-file")) && (pattern.hasValueForType("working-file")) && (pattern.hasType("line")) && (pattern.hasValueForType("line")) && (pattern.hasType("text")) && (pattern.hasValueForType("text"))) {
            try {
                const id = pattern.getTagValue("working-file");
                const lineno = pattern.getTagValue("line");
                const text = pattern.getTagValue("text");
                this.handler.setLine(id, lineno, text);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        // check for handler/commitFile (set working-file/$id commit)

        if ((pattern.tagCount() == 2) && (pattern.hasType("working-file")) && (pattern.hasValueForType("working-file")) && (pattern.hasType("commit"))) {
            try {
                const id = pattern.getTagValue("working-file");
                await this.handler.commitFile(id);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/working-files-provider doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/working-files-provider doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}