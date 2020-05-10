"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FormattedFileStorage {
    async runSearch(get) {
        get.finishSearch();
    }
    async runSave(set) {
        set.saveFinished(null);
    }
}
exports.default = FormattedFileStorage;
