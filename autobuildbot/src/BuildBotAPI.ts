import { GraphLike, Tuple, receiveToTupleListPromise } from "./fs"

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/autobuildbot constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    listenToFileChanges(callback: (filename: string) => void) {
        const command = `listen file-watch filename/* version`;

        this.graph.run(command, {
            relation(rel: Tuple) {
                if (rel.hasType('command-meta'))
                    return;
                callback(rel.getTagValue("filename"));
            },
            finish() { }
        });
    }

    async findTasksByCommand(cmd: string, cwd: string): Promise<string[]> {
        const command = `get build-task/* cmd(${cmd}) cwd(${cwd}) status`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("build-task"));
    }

    async createBuildTask(cmd: string, cwd: string, status: string): Promise<string> {
        const command = `set build-task/(unique) cmd(${cmd}) cwd(${cwd}) status/${status}`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(createBuildTask) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(createBuildTask) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("build-task");
    }

    async taskStatus(task: string): Promise<string> {
        const command = `get ${task} cmd cwd status`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(taskStatus) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(taskStatus) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("status");
    }

    async setPendingTaskTimer(task: string) {
        const command = `set ${task} pending-task-timer expires-at/(seconds-from-now 1)`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(setPendingTaskTimer) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(setPendingTaskTimer) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        // no output
    }

    listenToPendingTasks(callback: (rel: Tuple) => void) {
        const command = `listen build-task/* pending-task-timer expires-at`;

        this.graph.run(command, {
            relation(rel: Tuple) {
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
            relation(rel: Tuple) {
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
            relation(rel: Tuple) {
                if (rel.hasType('command-meta') && rel.hasType('deleted')) {
                    handler({
    id: 'taskTimerExpired',
    buildTask: rel.getTag("build-task"),
});
                }
            },
            finish() { }
        });
    }

    async getTaskInfo(task: string) {
        const command = `get ${task} cmd cwd status`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getTaskInfo) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getTaskInfo) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return ({
    cmd: oneRel.getTagValue("cmd"),
    cwd: oneRel.getTagValue("cwd"),
    status: oneRel.getTagValue("status"),
});
    }

    async setTaskStatus(task: string, status: string) {
        const command = `set ${task} cmd cwd status/(set ${status})`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }

    async deleteTask(task: string) {
        const command = `delete ${task} cmd cwd status`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }

    async setTaskWaitingFor(task: string, waitingForTask: string) {
        const command = `set ${task} waitingFor(${waitingForTask})`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }

    async getTaskWaitingFor(task: string): Promise<string[]> {
        const command = `get ${task} waitingFor/*`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("waitingFor"));
    }

    async getDirectoryColor(directory: string): Promise<string> {
        const command = `get directory/${directory} color`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(getDirectoryColor) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("color");
    }

    async setDirectoryColor(directory: string, color: string) {
        const command = `set directory/${directory} color/${color}`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }
}