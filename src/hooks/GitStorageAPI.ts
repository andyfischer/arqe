import { GraphLike, Relation, receiveToRelationListPromise } from ".."

interface NativeHandler {
    createBranch: (dir: string, branchName: string) => void
    listBranches: (dir: string) => string[]
    checkBranchExists: (dir: string, branchName: string) => boolean
    deleteBranch: (dir: string, branchName: string) => void
}

export default class API {
}