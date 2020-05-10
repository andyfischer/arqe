"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support");
const runStandardProcess2_1 = __importDefault(require("./fs/toollib/runStandardProcess2"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const BuildBotAPI_1 = __importDefault(require("./BuildBotAPI"));
const child_process_1 = __importDefault(require("child_process"));
const chalk_1 = __importDefault(require("chalk"));
let graph;
let api;
function ignoreFile(filename) {
    return (/COMMIT_EDITMSG/.exec(filename));
}
async function scheduleCommandIfNeeded(cmd, cwd) {
    const tasks = await api.findTasksByCommand(cmd, cwd);
    for (const task of tasks) {
        const status = await api.taskStatus(task);
        if (status === 'scheduled') {
            console.log('already have this scheduled: ' + JSON.stringify({ cmd, cwd }));
            return;
        }
        else if (status === 'running') {
            console.log('already running, TODO, schedule build for after: ' + JSON.stringify({ cmd, cwd }));
            return;
        }
    }
    const task = await api.createBuildTask(cmd, cwd, 'scheduled');
    await api.setPendingTaskTimer(task);
}
async function findProjectRoot(filename) {
    const dirname = path_1.default.dirname(filename);
    if (dirname === filename || dirname === '/' || dirname === '/Users')
        return null;
    if (await fs_extra_1.default.exists(path_1.default.join(dirname, 'package.json'))) {
        return dirname;
    }
    return findProjectRoot(dirname);
}
async function fileWasChanged(filename) {
    const packageRoot = await findProjectRoot(filename);
    if (!packageRoot)
        return;
    const packageJsonFilename = path_1.default.join(packageRoot, 'package.json');
    const hasPackageJson = await fs_extra_1.default.exists(packageJsonFilename);
    if (!hasPackageJson)
        return;
    const inSrcDir = filename.startsWith(path_1.default.join(packageRoot, 'src'));
    if (!inSrcDir) {
        return;
    }
    const packageJson = await JSON.parse(await fs_extra_1.default.readFile(packageJsonFilename, 'utf8'));
    const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
    if (!hasBuildScript) {
        console.log('No build script in: ' + packageJsonFilename);
        return;
    }
    scheduleCommandIfNeeded(`yarn build`, packageRoot);
}
function randInt(max) {
    return Math.floor(Math.random() * max);
}
async function getOrInitColor(dir) {
    const existing = await api.getDirectoryColor(dir);
    if (existing)
        return JSON.parse(existing);
    const color = [randInt(255), randInt(255), randInt(255)];
    await api.setDirectoryColor(dir, JSON.stringify(color));
    return color;
}
async function startTask(task) {
    const info = await api.getTaskInfo(task);
    api.setTaskStatus(task, 'running');
    const color = await getOrInitColor(info.cwd);
    const logLabel = chalk_1.default.rgb(color[0], color[1], color[2])(`[${task}]`);
    console.log(`${logLabel}: starting, cmd = "${info.cmd}", cwd = ${info.cwd}`);
    const args = info.cmd.split(' ');
    const proc = child_process_1.default.spawn(args[0], args.slice(1), {
        cwd: info.cwd,
        stdio: 'pipe'
    });
    proc.stdout.on('data', (msg) => {
        msg = msg.toString();
        msg = msg.replace(/\n$/, '');
        console.log(`${logLabel} ${msg}`);
    });
    proc.stderr.on('data', (msg) => {
        msg = msg.toString();
        msg = msg.replace(/\n$/, '');
        console.log(`${logLabel} ${msg}`);
    });
    proc.on('exit', (evt) => {
        console.log(`${logLabel}: finished`);
        api.deleteTask(task);
    });
}
async function start() {
    console.log('Build bot starting..');
    api.eventListener(async (evt) => {
        switch (evt.id) {
            case 'fileChanged':
                const { filename } = evt;
                if (ignoreFile(filename))
                    return;
                fileWasChanged(filename);
                return;
            case 'taskTimerExpired':
                const info = await api.getTaskInfo(evt.buildTask);
                if (info.status === 'scheduled') {
                    startTask(evt.buildTask)
                        .catch(console.error);
                }
                return;
            default:
                console.error('unrecognized event: ', evt);
        }
    });
    await new Promise((resolve, reject) => { });
}
async function main() {
    runStandardProcess2_1.default('autobuildbot', (_graph) => {
        graph = _graph;
        api = new BuildBotAPI_1.default(graph);
        return start();
    });
}
exports.main = main;
//# sourceMappingURL=index.js.map