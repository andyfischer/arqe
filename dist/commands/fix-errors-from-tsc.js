"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const code_change_1 = require("../code-change");
const sourcePosition = /([a-zA-Z0-9_\-\/\.]+)\((\d+),(\d+)\): /;
const cannotFindName = /Cannot find name '(\w+)'/;
function getOneMatchingRelation(filter) {
    if (filter.relation === 'needs-rename-to' && filter.subject === 'missing-name/snapshot') {
        return {
            relationParams: ['scope']
        };
    }
    if (filter.relation === 'needs-import' && filter.subject === 'missing-name/Scope') {
        return {
            relationParams: [`import Scope from '../scope/Scope';`]
        };
    }
    return null;
}
function parseTscError(str) {
    const sourcePositionMatch = sourcePosition.exec(str);
    const filename = sourcePositionMatch && sourcePositionMatch[1];
    const lineNo = sourcePositionMatch && parseInt(sourcePositionMatch[2]);
    const colNo = sourcePositionMatch && parseInt(sourcePositionMatch[3]);
    const result = {
        filename,
        lineNo,
        colNo
    };
    const cannotFindNameMatch = cannotFindName.exec(str);
    if (cannotFindNameMatch) {
        result.id = 'cannotFindName';
        result.name = cannotFindNameMatch[1];
    }
    return result;
}
function getFixForError(snapshot, error) {
    if (error.id === 'cannotFindName') {
        const name = error.name;
        const subject = 'missing-name/' + name;
        const needsRenameTo = getOneMatchingRelation({
            subject: 'missing-name/' + name,
            relation: 'needs-rename-to'
        });
        if (needsRenameTo) {
            const to = needsRenameTo.relationParams[0];
            return `select-line ${error.lineNo} | find-ident ${name} | insert ${to}`;
        }
        const needsImport = getOneMatchingRelation({
            subject: 'missing-name/' + name,
            relation: 'needs-import'
        });
        if (needsImport) {
        }
    }
    return null;
}
function default_1(snapshot) {
    snapshot.implement('fix-errors-from-tsc', (query) => __awaiter(this, void 0, void 0, function* () {
        utils_1.print("Running tsc..");
        const output = (yield (utils_1.exec("tsc -p .").catch(err => err))).stdout;
        const errors = output.split('\n')
            .filter(error => error && error.trim() !== '');
        if (errors.length === 0) {
            utils_1.print("No errors!");
            return;
        }
        utils_1.print(`TSC reported ${errors.length} errors..`);
        for (const error of errors) {
            utils_1.print(' TSC says: ' + error);
            const parsedError = parseTscError(error);
            utils_1.print(' Understood error as: ' + JSON.stringify(parsedError));
            const filename = parsedError.filename;
            if (!filename) {
                utils_1.print(" Can't fix, didn't understand filename");
                continue;
            }
            const fix = getFixForError(snapshot, parsedError);
            if (!fix) {
                utils_1.print(" Don't know how to fix!");
                continue;
            }
            utils_1.print(' Applying fix: ' + fix);
            const file = yield code_change_1.openFile(filename);
            code_change_1.runChangeCommand(file, fix);
            yield file.saveFile(filename);
        }
        utils_1.print('Done');
    }));
}
exports.default = default_1;
//# sourceMappingURL=fix-errors-from-tsc.js.map