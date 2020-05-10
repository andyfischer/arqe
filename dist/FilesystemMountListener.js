"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FilesystemMountListener {
    constructor(graph) {
        this.graph = graph;
        graph.listen("filesystem-mount/* option/*", resp => this.onChangeMounts());
    }
    onChangeMount() {
        const providers = [];
        const mounts = this.graph.runSync("get filesystem-mount/*");
        console.log('found mounts: ', mounts);
    }
}
exports.default = FilesystemMountListener;
//# sourceMappingURL=FilesystemMountListener.js.map