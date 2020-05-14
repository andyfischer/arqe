import { GraphLike, Relation, Pattern, RelationReceiver } from ".."

interface NativeHandler {
    createBranch: (dir: string, branchName: string) => void
    listBranches: (dir: string) => string[]
    checkBranchExists: (dir: string, branchName: string) => boolean
    deleteBranch: (dir: string, branchName: string) => void
}

export default class API {
    handler: NativeHandler

    constructor(handler: NativeHandler) {
        this.handler = handler;
    }

    runSearch(pattern: Pattern, output: RelationReceiver) {
        // check for: handler/listBranches
        // get git dir/$dir branch/*

        // check for: handler/checkBranchExists
        // get git dir/$dir branch/$branch

    }

    runSave(relation: Relation, output: RelationReceiver) {
        // check for: handler/createBranch
        // set git dir/$dir branch/$branchName

    }

    runDelete(pattern: Pattern, output: RelationReceiver) {
        // check for: handler/deleteBranch
        // delete git dir/$dir branch/$branch

    }
}