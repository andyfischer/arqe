import { GraphLike, Relation } from "./fs";
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    listenToFileChanges(callback: (filename: string) => void): void;
    findTasksByCommand(cmd: string, cwd: string): Promise<string[]>;
    createBuildTask(cmd: string, cwd: string, status: string): Promise<string>;
    taskStatus(task: string): Promise<string>;
    setPendingTaskTimer(task: string): Promise<void>;
    listenToPendingTasks(callback: (rel: Relation) => void): void;
    eventListener(handler: (evt: any) => void): void;
    getTaskInfo(task: string): Promise<{
        cmd: string;
        cwd: string;
        status: string;
    }>;
    setTaskStatus(task: string, status: string): Promise<void>;
    deleteTask(task: string): Promise<void>;
    setTaskWaitingFor(task: string, waitingForTask: string): Promise<void>;
    getTaskWaitingFor(task: string): Promise<string[]>;
    getDirectoryColor(directory: string): Promise<string>;
    setDirectoryColor(directory: string, color: string): Promise<void>;
}
