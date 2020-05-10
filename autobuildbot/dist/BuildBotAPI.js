"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./fs");
class API {
    constructor(graph) {
        this.graph = graph;
    }
    listenToFileChanges(callback) {
        const command = `listen file-watch filename/* version`;
        this.graph.run(command, {
            relation(rel) {
                if (rel.hasType('command-meta'))
                    return;
                callback(rel.getTagValue("filename"));
            },
            finish() { }
        });
    }
    async findTasksByCommand(cmd, cwd) {
        const command = `get build-task/* cmd(${cmd}) cwd(${cwd}) status`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("build-task"));
    }
    async createBuildTask(cmd, cwd, status) {
        const command = `set build-task/(unique) cmd(${cmd}) cwd(${cwd}) status/${status}`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(createBuildTask) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(createBuildTask) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTag("build-task");
    }
    async taskStatus(task) {
        const command = `get ${task} cmd cwd status`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(taskStatus) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(taskStatus) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("status");
    }
    async setPendingTaskTimer(task) {
        const command = `set ${task} pending-task-timer expires-at/(seconds-from-now 1)`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(setPendingTaskTimer) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(setPendingTaskTimer) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
    }
    listenToPendingTasks(callback) {
        const command = `listen build-task/* pending-task-timer expires-at`;
        this.graph.run(command, {
            relation(rel) {
                if (rel.hasType('command-meta'))
                    return;
                callback(rel);
            },
            finish() { }
        });
    }
    eventListener(handler) {
        this.graph.run("listen file-watch filename/* version", {
            relation(rel) {
                if (rel.hasType('command-meta'))
                    return;
                handler({
                    id: 'fileChanged',
                    filename: rel.getTagValue("filename"),
                });
            },
            finish() { }
        });
        this.graph.run("listen build-task/* pending-task-timer expires-at", {
            relation(rel) {
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
    async getTaskInfo(task) {
        const command = `get ${task} cmd cwd status`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(getTaskInfo) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(getTaskInfo) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return ({
            cmd: oneRel.getTagValue("cmd"),
            cwd: oneRel.getTagValue("cwd"),
            status: oneRel.getTagValue("status"),
        });
    }
    async setTaskStatus(task, status) {
        const command = `set ${task} cmd cwd status/(set ${status})`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
    }
    async deleteTask(task) {
        const command = `delete ${task} cmd cwd status`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
    }
    async setTaskWaitingFor(task, waitingForTask) {
        const command = `set ${task} waitingFor(${waitingForTask})`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
    }
    async getTaskWaitingFor(task) {
        const command = `get ${task} waitingFor/*`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTagValue("waitingFor"));
    }
    async getDirectoryColor(directory) {
        const command = `get directory/${directory} color`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(getDirectoryColor) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("color");
    }
    async setDirectoryColor(directory, color) {
        const command = `set directory/${directory} color/${color}`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
    }
}
exports.default = API;
//# sourceMappingURL=BuildBotAPI.js.map