import { GraphLike, Tuple, Pattern, Stream, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    readFile: (filename: string) => Promise<any>
    writeFile: (filename: string, contents: string) => void
    readDir: (dir: string) => Promise<any[]>
    listMatchingFiles: (match: string) => Promise<any[]>
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: Stream) {
        // check for handler/readFile (get fs filename/$filename file-contents)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("fs")) && (pattern.hasAttr("filename")) && (pattern.hasValueForAttr("filename")) && (pattern.hasAttr("file-contents"))) {
            try {
                const filename = pattern.getVal("filename");
                const contents = await this.handler.readFile(filename);

                if (typeof contents !== 'string') {
                    throw new Error("expected readFile to return a string, got: " + JSON.stringify(contents))
                }

                const outRelation = pattern.setVal("file-contents", contents);
                output.next(outRelation);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        // check for handler/readDir (get fs dir/$dir filename)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("fs")) && (pattern.hasAttr("dir")) && (pattern.hasValueForAttr("dir")) && (pattern.hasAttr("filename"))) {
            try {
                const dir = pattern.getVal("dir");
                const filename = await this.handler.readDir(dir);

                if (!Array.isArray(filename)) {
                    throw new Error("expected readDir to return an Array, got: " + JSON.stringify(filename))
                }

                for (const item of filename) {
                    const outRelation = pattern.setVal("filename", item);
                    output.next(outRelation);
                }
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        // check for handler/listMatchingFiles (get fs match/$match filename)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("fs")) && (pattern.hasAttr("match")) && (pattern.hasValueForAttr("match")) && (pattern.hasAttr("filename"))) {
            try {
                const match = pattern.getVal("match");
                const filename = await this.handler.listMatchingFiles(match);

                if (!Array.isArray(filename)) {
                    throw new Error("expected listMatchingFiles to return an Array, got: " + JSON.stringify(filename))
                }

                for (const item of filename) {
                    const outRelation = pattern.setVal("filename", item);
                    output.next(outRelation);
                }
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        emitCommandError(output, "provider code-generation/filesystem-provider doesn't support: get " + pattern.stringify());
        output.done()
    }

    async runSave(pattern: Pattern, output: Stream) {
        // check for handler/writeFile (set fs filename/$filename file-contents/$contents)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("fs")) && (pattern.hasAttr("filename")) && (pattern.hasValueForAttr("filename")) && (pattern.hasAttr("file-contents")) && (pattern.hasValueForAttr("file-contents"))) {
            try {
                const filename = pattern.getVal("filename");
                const contents = pattern.getVal("file-contents");
                await this.handler.writeFile(filename, contents);
                output.next(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.done();
            return;
        }

        emitCommandError(output, "provider code-generation/filesystem-provider doesn't support: set " + pattern.stringify());
        output.done()
    }

    async runDelete(pattern: Pattern, output: Stream) {
        emitCommandError(output, "provider code-generation/filesystem-provider doesn't support: delete " + pattern.stringify());
        output.done()
    }
}