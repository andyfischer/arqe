
import fetch from 'node-fetch'
import Graph from './fs/Graph'
import { saveObject } from './fs/GraphORM'
import Fs from 'fs-extra'
import { mountDerivedTag } from './fs/DerivedValueMount'
import UpdateContext from './fs/UpdateContext'
import { parsePattern } from './fs/parseCommand'
import { parseSexprFromString, evalSexpr } from './fs/sexpr'
import Path from 'path'

const graph = new Graph()
graph.loadDumpFile(Path.join(__dirname, '../source.graph'));

function toTagName(str) {
    return str.replace(/ /g, '')
        .replace(/\'/g, '');
}

function run(graph: Graph, cmd: string) {

    const result = graph.runSync(cmd);
    console.log(' ran: ' + cmd);
    console.log(' > ' + result);
    return result;
}

/*
mountDerivedTag(graph, 'unit/* unit-has-rez', (cxt: UpdateContext, search) => {

    //const result = graph.runSync(`get -exists ${rel.getTag('unit')} has-skill/$a | join skill/$a category/rez`)
    //return result === '#exists';
})
*/

async function main() {
    const data = await (fetch('https://fftbg.com/api/tournament/latest').then(d => d.json()));

    // Load all the JSON into the graph
    for (const teamName in data.Teams) {
        const teamData = data.Teams[teamName];

        const teamId = `team/${teamName}`
        const team = graph.runSync(`save ${teamId}`)

        for (const unit of teamData.Units) {

            const className = toTagName(unit.Class);
            const unitId = (await saveObject(graph, 'unit/#unique', unit)).stringify()

            graph.runSync(`set ${unitId} ${className}`)
            graph.runSync(`set ${teamId} ${unitId}`)

            for (const skill of unit.ClassSkills) {
                graph.runSync(`set ${unitId} has-skill/${toTagName(skill)}`)
            }

            for (const extraSkill of unit.ExtraSkills) {
                graph.runSync(`set ${unitId} has-skill/${toTagName(extraSkill)}`)
            }
        }
    }

    // Figure out who is playing
    let firstUnfinishedMatch = null;
    graph.runDerived(cxt => {
        for (const match of cxt.get('match/* .teams')) {
            const num = parseInt(match.getTagValue('match'))

            const foundWinner = data.Winners[num - 1]
            if (foundWinner) {
                graph.runSync(`set ${match.getTag('match')} winner == team/${foundWinner}`)
            } else {
                if (!firstUnfinishedMatch)
                    firstUnfinishedMatch = match;
            }
        }
    });

    if (!firstUnfinishedMatch) {
        console.log('No unfinished match found (tourny over?)');
        return;
    }

    // console.log('Next unfinished match is: ', firstUnfinishedMatch.stringifyRelation());

    function getFightingTeams() {
        const val = firstUnfinishedMatch.getValue();
        if (val[0] === '(') {
            const expr = parseSexprFromString(val) as string[];
            return evalSexpr({
                winner(inputs: string[]) {
                    // console.log('computing winner: ', JSON.stringify(inputs));
                    const match = inputs[0];
                    return graph.runSync(`get ${match} winner`)[0].getValue()
                }
            }, expr)
        } else {
            return val.split(' ')
        }
    }

    const fightingTeams = getFightingTeams()

    console.log("Teams playing are: " + fightingTeams)

    for (const team of fightingTeams) {
        graph.runDerived(cxt => {
            console.log(`Analyzing team: ${team}`)

            function formatRezzes(matches) {
                if (matches.length === 0)
                    return '(none)'

                return matches.map(match => {
                    match = parsePattern(match)
                    const name = cxt.getOne(`${match.getTag('unit')} .Name`).getValue();
                    return `${name} (${match.getTagValue('skill')})`
                }).join(', ');
            }

            console.log('Rez abilities: ', formatRezzes(
                graph.runSync(`get ${team} unit/$a | join unit/$a has-skill/$s | join skill/$s category/rez`)
            ));

            for (const unit of cxt.get(`${team} unit/*`)) {
                console.log('Unit: ', cxt.getOne(unit.getTag('unit') + ' .Name').getValue())
            }
        });
    }

    // Analyze

    graph.runDerived(cxt => {
        for (const unit of cxt.get('unit/*')) {
            graph.run(`get ${unit.getTag('unit')} unit-has-rez`);
        }
    });

    graph.saveDumpFile('dump.graph');
    graph.startRepl();
}


main()
.catch(console.error);
