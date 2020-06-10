import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    readBlock: (x: string, y: string, z: string) => Promise<any>
    setBlock: (x: string, y: string, z: string, block: string) => void
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        // check for handler/readBlock (get mc x/$x y/$y z/$z block/*)

        if ((pattern.tagCount() == 5) && (pattern.hasType("mc")) && (pattern.hasType("x")) && (pattern.hasValueForType("x")) && (pattern.hasType("y")) && (pattern.hasValueForType("y")) && (pattern.hasType("z")) && (pattern.hasValueForType("z")) && (pattern.hasType("block"))) {
            try {
                const x = pattern.getTagValue("x");
                const y = pattern.getTagValue("y");
                const z = pattern.getTagValue("z");
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

        if ((pattern.tagCount() == 5) && (pattern.hasType("mc")) && (pattern.hasType("x")) && (pattern.hasValueForType("x")) && (pattern.hasType("y")) && (pattern.hasValueForType("y")) && (pattern.hasType("z")) && (pattern.hasValueForType("z")) && (pattern.hasType("block")) && (pattern.hasValueForType("block"))) {
            try {
                const x = pattern.getTagValue("x");
                const y = pattern.getTagValue("y");
                const z = pattern.getTagValue("z");
                const block = pattern.getTagValue("block");
                await this.handler.setBlock(x, y, z, block);
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