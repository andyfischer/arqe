import { GraphLike, Relation, Pattern, RelationReceiver, StorageProviderV3, emitCommandError } from "../.."

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

        emitCommandError(output, "provider code-generation/git-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    runSave(pattern: Pattern, output: RelationReceiver) {
        // check for handler/createBranch (set git dir/$dir branch/$branchName)

        if ((pattern.tagCount() == 3) && (pattern.hasType("git")) && (pattern.hasType("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasType("branch")) && (pattern.hasValueForType("branch"))) {
            const dir = pattern.getTagValue("dir");
            const branchName = pattern.getTagValue("branch");
            this.handler.createBranch(dir, branchName);
            output.relation(pattern);
            output.finish();
        }

        emitCommandError(output, "provider code-generation/git-provider doesn't support: set " + pattern.stringify());
        output.finish()
    }

    runDelete(pattern: Pattern, output: RelationReceiver) {
        // check for handler/deleteBranch (delete git dir/$dir branch/$branch)

        if ((pattern.tagCount() == 3) && (pattern.hasType("git")) && (pattern.hasType("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasType("branch")) && (pattern.hasValueForType("branch"))) {
            const dir = pattern.getTagValue("dir");
            const branch = pattern.getTagValue("branch");
            this.handler.deleteBranch(dir, branch);
        }

        emitCommandError(output, "provider code-generation/git-provider doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}