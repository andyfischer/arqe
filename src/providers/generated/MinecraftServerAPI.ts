import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    readBlock: (x: string, y: string, z: string) => Promise<any>
    setBlock: (x: string, y: string, z: string, block: string) => void
    setBlockWithData: (x: string, y: string, z: string, block: string, data: string) => void
    setPredef: (x: string, y: string, z: string, predef: string) => void
    undo: () => void
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        // check for handler/readBlock (get mc x/$x y/$y z/$z block/*)

        if ((pattern.tagCount() == 5) && (pattern.hasAttr("mc")) && (pattern.hasAttr("x")) && (pattern.hasAttr("x")) && (pattern.hasAttr("y")) && (pattern.hasAttr("y")) && (pattern.hasAttr("z")) && (pattern.hasAttr("z")) && (pattern.hasAttr("block"))) {
            try {
                const x = pattern.getVal("x");
                const y = pattern.getVal("y");
                const z = pattern.getVal("z");
                const contents = await this.handler.readBlock(x, y, z);

                if (typeof contents !== 'string') {
                    throw new Error("expected readBlock to return a string, got: " + JSON.stringify(contents))
                }

                const outRelation = pattern.setTagValueForType("block", contents);
                output.relation(outRelation);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/minecraft-server-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        // check for handler/setBlock (set mc x/$x y/$y z/$z block/$block)

        if ((pattern.tagCount() == 5) && (pattern.hasAttr("mc")) && (pattern.hasAttr("x")) && (pattern.hasAttr("x")) && (pattern.hasAttr("y")) && (pattern.hasAttr("y")) && (pattern.hasAttr("z")) && (pattern.hasAttr("z")) && (pattern.hasAttr("block")) && (pattern.hasAttr("block"))) {
            try {
                const x = pattern.getVal("x");
                const y = pattern.getVal("y");
                const z = pattern.getVal("z");
                const block = pattern.getVal("block");
                await this.handler.setBlock(x, y, z, block);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        // check for handler/setBlockWithData (set mc x/$x y/$y z/$z block/$block data/$data)

        if ((pattern.tagCount() == 6) && (pattern.hasAttr("mc")) && (pattern.hasAttr("x")) && (pattern.hasAttr("x")) && (pattern.hasAttr("y")) && (pattern.hasAttr("y")) && (pattern.hasAttr("z")) && (pattern.hasAttr("z")) && (pattern.hasAttr("block")) && (pattern.hasAttr("block")) && (pattern.hasAttr("data")) && (pattern.hasAttr("data"))) {
            try {
                const x = pattern.getVal("x");
                const y = pattern.getVal("y");
                const z = pattern.getVal("z");
                const block = pattern.getVal("block");
                const data = pattern.getVal("data");
                await this.handler.setBlockWithData(x, y, z, block, data);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        // check for handler/setPredef (set mc x/$x y/$y z/$z predef/$predef)

        if ((pattern.tagCount() == 5) && (pattern.hasAttr("mc")) && (pattern.hasAttr("x")) && (pattern.hasAttr("x")) && (pattern.hasAttr("y")) && (pattern.hasAttr("y")) && (pattern.hasAttr("z")) && (pattern.hasAttr("z")) && (pattern.hasAttr("predef")) && (pattern.hasAttr("predef"))) {
            try {
                const x = pattern.getVal("x");
                const y = pattern.getVal("y");
                const z = pattern.getVal("z");
                const predef = pattern.getVal("predef");
                await this.handler.setPredef(x, y, z, predef);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        // check for handler/mcundo (set mc undo)

        if ((pattern.tagCount() == 2) && (pattern.hasAttr("mc")) && (pattern.hasAttr("undo"))) {
            try {
                await this.handler.undo();
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/minecraft-server-provider doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        emitCommandError(output, "provider code-generation/minecraft-server-provider doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}