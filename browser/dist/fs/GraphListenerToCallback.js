"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GraphListenerToCallback {
    constructor(graph, command, callback) {
        this.pattern = command.toPattern();
        this.callback = callback;
    }
    emit(str) {
        try {
            this.callback(str);
        }
        catch (e) {
            console.error(e);
        }
    }
    onRelationUpdated(rel) {
        if (this.pattern.matches(rel)) {
            this.emit('set ' + this.pattern.formatRelationRelative(rel));
        }
    }
    onRelationDeleted(rel) {
        if (this.pattern.matches(rel)) {
            this.emit('delete ' + this.pattern.formatRelationRelative(rel));
        }
    }
}
exports.default = GraphListenerToCallback;
