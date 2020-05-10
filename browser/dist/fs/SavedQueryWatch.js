"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SavedQueryWatch {
    constructor(savedQuery) {
        this.savedQuery = savedQuery;
        this.sawChangeToken = savedQuery.changeToken;
    }
    checkChange() {
        if (this.sawChangeToken !== this.savedQuery.changeToken) {
            this.sawChangeToken = this.savedQuery.changeToken;
            return true;
        }
        return false;
    }
}
exports.default = SavedQueryWatch;
