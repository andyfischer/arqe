import { GraphLike, Relation, Pattern, RelationReceiver, StorageProviderV3, emitCommandError } from "../.."

interface NativeHandler {
    readFile: (filename: string) => void
    writeFile: (filename: string, contents: string) => void
}

export default class API implements StorageProviderV3 {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    handlesPattern(pattern: Pattern): boolean {
        if ((pattern.tagCount() >= 2) && (pattern.hasType("fs"))) {
            return true;
        }

        return false;
    }

    async runSearch(pattern: Pattern, output: RelationReceiver) {
        // check for handler/readFile (get fs filename/$filename file-contents)

        if ((pattern.tagCount() == 3) && (pattern.hasType("fs")) && (pattern.hasType("filename")) && (pattern.hasValueForType("filename")) && (pattern.hasType("file-contents"))) {
            const filename = pattern.getTagValue("filename");
            const contents = await this.handler.readFile(filename);
            output.relation(pattern.setTagValueForType("file-contents", contents))
            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/filesystem-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: RelationReceiver) {
        // check for handler/writeFile (set fs filename/$filename file-contents/$contents)

        if ((pattern.tagCount() == 3) && (pattern.hasType("fs")) && (pattern.hasType("filename")) && (pattern.hasValueForType("filename")) && (pattern.hasType("file-contents")) && (pattern.hasValueForType("file-contents"))) {
            const filename = pattern.getTagValue("filename");
            const contents = pattern.getTagValue("file-contents");
            await this.handler.writeFile(filename, contents);
            output.relation(pattern);
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