import { GraphLike, Relation, receiveToRelationListPromise } from "./fs"
export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    listenToFileChanges() {
        const command = `listen file-watch filename/* version`;
    }

    findTasksByCommand() {
        const command = `get build-task/* cmd(${cmd}) status`;
    }

    createBuildTask() {
        const command = `set build-task/(unique) cmd(${cmd}) status/${status}`;
    }

    taskStatus() {
        const command = `get ${task} cmd status`;
    }

    setPendingTaskTimer() {
        const command = `set ${task} pending-task-timer expires-at(${expiresAt})`;
    }

    listenToPendingTasks() {
        const command = `listen build-task/* pending-task-timer expires-at`;
    }
}