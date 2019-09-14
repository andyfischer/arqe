
import { Query, Snapshot } from '..'
import { print, exec } from '../utils'

const sourcePosition = /([a-zA-Z0-9_\-\/\.]+)\((\d+),(\d+)\): /
const cannotFindName = /Cannot find name '(\w+)'/

interface ParsedError {
    id: string
    filename: string
    lineNo: number
    colNo: number
    name?: string
}

interface RelationFilter {
    subject: string,
    relation: string
}

function getOneMatchingRelation(filter: RelationFilter) {
    // temporary hardcoded relations
    if (filter.relation === 'needs-rename-to' && filter.subject === 'missing-name/snapshot') {
        return {
            relationParams: ['scope']
        }
    }

    // temporary hardcoded relations
    if (filter.relation === 'needs-import' && filter.subject === 'missing-name/Scope') {
        return {
            relationParams: [`import Scope from '../scope/Scope';`]
        }
    }

    return null;
}

function parseTscError(str: string) {
    const sourcePositionMatch = sourcePosition.exec(str);

    const filename = sourcePositionMatch && sourcePositionMatch[1]
    const lineNo = sourcePositionMatch && parseInt(sourcePositionMatch[2])
    const colNo = sourcePositionMatch && parseInt(sourcePositionMatch[3])

    const result: any =  {
        filename,
        lineNo,
        colNo
    }

    const cannotFindNameMatch = cannotFindName.exec(str);
    if (cannotFindNameMatch) {
        result.id = 'cannotFindName'
        result.name = cannotFindNameMatch[1];
    }

    return result;
}

function getFixForError(snapshot: Snapshot, error: ParsedError): string {
    if (error.id === 'cannotFindName') {
        const name = error.name;
        const subject = 'missing-name/' + name;

        // check relations to see if this name needs an import, or if it
        // needs a rename.

        const needsRenameTo = getOneMatchingRelation({
            subject: 'missing-name/' + name,
            relation: 'needs-rename-to'
        });

        if (needsRenameTo) {
            return ""
        }

        const needsImport = getOneMatchingRelation({
            subject: 'missing-name/' + name,
            relation: 'needs-import'
        });

        if (needsImport) {
            // TODO

        }
    }

    return null;
}

export default function(snapshot: Snapshot) {
    snapshot.implement('fix-errors-from-tsc', async (query: Query) => {

        print("Running tsc..");

        const output = (await (exec("tsc -p .").catch(err => err))).stdout;
        const errors = output.split('\n')
            .filter(error => error && error.trim() !== '');

        if (errors.length === 0) {
            print("No errors!");
            return;
        }

        print(`Found ${errors.length} errors..`)
        for (const error of errors) {
            print(' TSC says: ' + error);
            const parsed = parseTscError(error);
            print(' Understood error as: ' + JSON.stringify(parsed));
            const fix = getFixForError(snapshot, parsed);

            if (!fix) {
                print(" Don't know how to fix!");
                continue;
            }

            print(' Applying fix: ' + fix);
        }

        print('Applying fixes..');

    });
}
