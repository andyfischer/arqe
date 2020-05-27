import { GraphLike, Relation, Pattern, RelationReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    readFile: (filename: string) => Promise<any>
    writeFile: (filename: string, contents: string) => void
    readDir: (dir: string) => Promise<any[]>
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: RelationReceiver) {
        // check for handler/readFile (get fs filename/$filename file-contents)

        if ((pattern.tagCount() == 3) && (pattern.hasType("fs")) && (pattern.hasType("filename")) && (pattern.hasValueForType("filename")) && (pattern.hasType("file-contents"))) {
            try {
                const filename = pattern.getTagValue("filename");
                const contents = await this.handler.readFile(filename);

                if (typeof contents !== 'string') {
                    throw new Error("expected readFile to return a string, got: " + JSON.stringify(contents))
                }

                const outRelation = pattern.setTagValueForType("file-contents", contents);
                output.relation(outRelation);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        // check for handler/readDir (get fs dir/$dir filename)

        if ((pattern.tagCount() == 3) && (pattern.hasType("fs")) && (pattern.hasType("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasType("filename"))) {
            try {
                const dir = pattern.getTagValue("dir");
                const filename = await this.handler.readDir(dir);

                if (!Array.isArray(filename)) {
                    throw new Error("expected readDir to return an Array, got: " + JSON.stringify(filename))
                }

                for (const item of filename) {
                    const outRelation = pattern.setTagValueForType("filename", filename);
                    output.relation(outRelation);
                }
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/filesystem-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: RelationReceiver) {
        // check for handler/writeFile (set fs filename/$filename file-contents/$contents)

        if ((pattern.tagCount() == 3) && (pattern.hasType("fs")) && (pattern.hasType("filename")) && (pattern.hasValueForType("filename")) && (pattern.hasType("file-contents")) && (pattern.hasValueForType("file-contents"))) {
            try {
                const filename = pattern.getTagValue("filename");
                const contents = pattern.getTagValue("file-contents");
                await this.handler.writeFile(filename, contents);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/filesystem-provider doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: RelationReceiver) {
        emitCommandError(output, "provider code-generation/filesystem-provider doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}