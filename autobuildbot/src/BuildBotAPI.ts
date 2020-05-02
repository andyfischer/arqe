import { GraphLike, Relation, receiveToRelationListPromise } from "./fs"

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    listenToFileChanges(callback: (filename: string) => void) {
        const command = `listen file-watch filename/* version`;

        this.graph.run(command, {
            relation(rel: Relation) {
                if (rel.hasType('command-meta'))
                    return;
                callback(rel.getTagValue("filename"));
            },
            finish() { }
        });
    }

    async findTasksByCommand(cmd: string): Promise<string[]> {
        const command = `get build-task/* cmd(${cmd}) status`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("build-task"));
    }

    async createBuildTask(cmd: string, status: string): Promise<string> {
        const command = `set build-task/(unique) cmd(${cmd}) status/${status}`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("build-task");
    }

    async taskStatus(task: string): Promise<string> {
        const command = `get ${task} cmd status`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("status");
    }

    async setPendingTaskTimer(expiresAt: string, task: string): Promise<string> {
        const command = `set ${task} pending-task-timer expires-at(${expiresAt})`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("status");
    }

    listenToPendingTasks(callback: (rel: Relation) => void) {
        const command = `listen build-task/* pending-task-timer expires-at`;

        this.graph.run(command, {
            relation(rel: Relation) {
                if (rel.hasType('command-meta'))
                    return;
                callback(rel);
            },
            finish() { }
        });
    }

    eventListener(handler: (evt) => void) {

        // eventType/anyFileChange
        this.graph.run("listen file-watch filename/* version", {
            relation(rel: Relation) {
                if (rel.hasType('command-meta'))
                    return;
                handler({
    id: 'fileChanged',
    filename: rel.getTagValue("filename"),
});
            },
            finish() { }
        });

        // eventType/taskTimerExpired
        this.graph.run("listen build-task/* pending-task-timer expires-at", {
            relation(rel: Relation) {
                if (rel.hasType('command-meta') && rel.hasType('deleted')) {
                    handler({
    id: 'taskTimerExpired',
    buildTask: rel.getTagValue("build-task"),
});
                }
            },
            finish() { }
        });
    }
}