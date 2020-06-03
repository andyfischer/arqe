import { GraphLike, Relation, Pattern, RelationReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    loadFile: (filename: string) => Promise<any>
    fileContents: (id: string) => any
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

        // check for handler/fileContents (get working-file/$id contents)

        if ((pattern.tagCount() == 2) && (pattern.hasType("working-file")) && (pattern.hasValueForType("working-file")) && (pattern.hasType("contents"))) {
            try {
                const id = pattern.getTagValue("working-file");
                const text = this.handler.fileContents(id);

                if (typeof text !== 'string') {
                    throw new Error("expected fileContents to return a string, got: " + JSON.stringify(text))
                }

                const outRelation = pattern.setTagValueForType("contents", text);
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
        // check for handler/commitFile (set working-file/$id commit)

        if ((pattern.tagCount() == 2) && (pattern.hasType("working-file")) && (pattern.hasValueForType("working-file")) && (pattern.hasType("commit"))) {
            try {
                const id = pattern.getTagValue("working-file");
                this.handler.commitFile(id);
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