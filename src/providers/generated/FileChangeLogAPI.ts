import { GraphLike, Relation, Pattern, RelationReceiver, StorageProviderV3 } from "../.."

interface NativeHandler {
    onChange: (filename: string) => void
}

export default class API implements StorageProviderV3 {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    handlesPattern(pattern: Pattern): boolean {
        if ((pattern.tagCount() == 3) && (pattern.hasType("log")) && (pattern.hasType("file-changed")) && (pattern.hasType("filename"))) {
            return true;
        }

        return false;
    }

    runSearch(pattern: Pattern, output: RelationReceiver) {
    }

    runSave(pattern: Pattern, output: RelationReceiver) {
        // check for handler/onChange (set log file-changed filename/$filename)

        if ((pattern.tagCount() == 3) && (pattern.hasType("log")) && (pattern.hasType("file-changed")) && (pattern.hasType("filename")) && (pattern.hasValueForType("filename"))) {
            const filename = pattern.getTagValue("filename");
            this.handler.onChange(filename);
            output.relation(pattern);
            output.finish();
        }

    }

    runDelete(pattern: Pattern, output: RelationReceiver) {
    }
}
