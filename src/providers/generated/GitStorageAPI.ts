import { GraphLike, Tuple, Pattern, TupleReceiver, StorageProvider, emitCommandError } from "../.."

interface NativeHandler {
    createBranch: (dir: string, branchName: string) => void
    listBranches: (dir: string) => Promise<string[]>
    checkBranchExists: (dir: string, branchName: string) => Promise<boolean>
    deleteBranch: (dir: string, branchName: string) => void
}

export default class API implements StorageProvider {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    async runSearch(pattern: Pattern, output: TupleReceiver) {
        // check for handler/listBranches (get git dir/$dir branch/*)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("git")) && (pattern.hasAttr("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasAttr("branch"))) {
            try {
                const dir = pattern.getVal("dir");
                await this.handler.listBranches(dir);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        // check for handler/checkBranchExists (get git dir/$dir branch/$branch)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("git")) && (pattern.hasAttr("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasAttr("branch")) && (pattern.hasValueForType("branch"))) {
            try {
                const dir = pattern.getVal("dir");
                const branch = pattern.getVal("branch");
                await this.handler.checkBranchExists(dir, branch);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/git-provider doesn't support: get " + pattern.stringify());
        output.finish()
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        // check for handler/createBranch (set git dir/$dir branch/$branchName)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("git")) && (pattern.hasAttr("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasAttr("branch")) && (pattern.hasValueForType("branch"))) {
            try {
                const dir = pattern.getVal("dir");
                const branchName = pattern.getVal("branch");
                await this.handler.createBranch(dir, branchName);
                output.relation(pattern);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/git-provider doesn't support: set " + pattern.stringify());
        output.finish()
    }

    async runDelete(pattern: Pattern, output: TupleReceiver) {
        // check for handler/deleteBranch (delete git dir/$dir branch/$branch)

        if ((pattern.tagCount() == 3) && (pattern.hasAttr("git")) && (pattern.hasAttr("dir")) && (pattern.hasValueForType("dir")) && (pattern.hasAttr("branch")) && (pattern.hasValueForType("branch"))) {
            try {
                const dir = pattern.getVal("dir");
                const branch = pattern.getVal("branch");
                await this.handler.deleteBranch(dir, branch);
            }
            catch(e) {
                console.error(e.stack || e)
            }

            output.finish();
            return;
        }

        emitCommandError(output, "provider code-generation/git-provider doesn't support: delete " + pattern.stringify());
        output.finish()
    }
}