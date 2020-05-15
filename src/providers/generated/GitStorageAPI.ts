import { GraphLike, Relation, Pattern, RelationReceiver, StorageProviderV3 } from "../.."

interface NativeHandler {
    createBranch: (dir: string, branchName: string) => void
    listBranches: (dir: string) => string[]
    checkBranchExists: (dir: string, branchName: string) => boolean
    deleteBranch: (dir: string, branchName: string) => void
}

export default class API implements StorageProviderV3 {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    handlesPattern(pattern: Pattern): boolean {
        if ((pattern.tagCount() >= 2) && (pattern.hasType("git"))) {
            return true;
        }

        return false;
    }

    runSearch(pattern: Pattern, output: RelationReceiver) {
        // check for handler/listBranches (get git dir/$dir branch/*)

        if ((pattern.tagCount() == 3) && (pattern.hasType("git")) && (pattern.hasType("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasType("branch"))) {
            const dir = pattern.getTagValue("dir");
            this.handler.listBranches(dir);
        }

        // check for handler/checkBranchExists (get git dir/$dir branch/$branch)

        if ((pattern.tagCount() == 3) && (pattern.hasType("git")) && (pattern.hasType("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasType("branch")) && (pattern.hasValueForType("branch"))) {
            const dir = pattern.getTagValue("dir");
            const branch = pattern.getTagValue("branch");
            this.handler.checkBranchExists(dir, branch);
        }

    }

    runSave(pattern: Pattern, output: RelationReceiver) {
        // check for handler/createBranch (set git dir/$dir branch/$branchName)

        if ((pattern.tagCount() == 3) && (pattern.hasType("git")) && (pattern.hasType("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasType("branch")) && (pattern.hasValueForType("branch"))) {
            const dir = pattern.getTagValue("dir");
            const branchName = pattern.getTagValue("branch");
            this.handler.createBranch(dir, branchName);
        }

    }

    runDelete(pattern: Pattern, output: RelationReceiver) {
        // check for handler/deleteBranch (delete git dir/$dir branch/$branch)

        if ((pattern.tagCount() == 3) && (pattern.hasType("git")) && (pattern.hasType("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasType("branch")) && (pattern.hasValueForType("branch"))) {
            const dir = pattern.getTagValue("dir");
            const branch = pattern.getTagValue("branch");
            this.handler.deleteBranch(dir, branch);
        }

    }
}