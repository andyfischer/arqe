
import 'source-map-support'
import fetch from 'node-fetch'
import Graph from './fs/Graph'
import { saveObject } from './fs/GraphORM'
import Fs from 'fs-extra'
import Path from 'path'
import { mountDerivedTag } from './fs/DerivedValueMount'
import UpdateContext from './fs/UpdateContext'
import { parsePattern } from './fs/parseCommand'
import { parseSexprFromString, evalSexpr } from './fs/sexpr'
import Pattern from './fs/Pattern'
import { GraphAPI } from './generated'

const graph = new Graph();
graph.loadDumpFile(Path.join(__dirname, '../source.graph'));

const api = new GraphAPI(graph);

function toTagName(str) {
    return str.replace(/ /g, '')
        .replace(/\'/g, '');
}

async function main() {
    const data = await (fetch('https://fftbg.com/api/tournament/latest').then(d => d.json()));

    // Load all the JSON into the graph
    for (const teamName in data.Teams) {
        const teamData = data.Teams[teamName];

        const teamId = `team/${teamName}`
        const team = api.run(`set ${teamId}`)

        for (const unit of teamData.Units) {

            const className = toTagName(unit.Class);
            const unitId = (await saveObject(graph, 'unit/#unique', unit)).stringify()

            api.run(`set ${unitId} class/${className}`)
            api.run(`set ${teamId} ${unitId}`)

            for (const skill of unit.ClassSkills) {
                api.run(`set ${unitId} has-skill/${toTagName(skill)}`)
            }

            for (const extraSkill of unit.ExtraSkills) {
                api.run(`set ${unitId} has-skill/${toTagName(extraSkill)}`)
            }

            api.run(`set ${unitId} has-skill/${toTagName(unit.ReactionSkill)}`)
        }
    }

    // Figure out who is playing
    let firstUnfinishedMatch = null;

    const matchNums = api.getMatchNumbers();

    for (const num of api.getMatchNumbers()) {
        const matchTag = 'match/' + num;

        const foundWinner = data.Winners[num - 1]
        if (foundWinner) {
            api.run(`set ${matchTag} winner == team/${foundWinner}`)
        } else {
            if (!firstUnfinishedMatch)
                firstUnfinishedMatch = matchTag;
        }
    }

    if (!firstUnfinishedMatch) {
        console.log('No unfinished match found (tourny over?)');
        return;
    }

    // console.log('Next match is: ', firstUnfinishedMatch.stringifyRelation());

    function getFightingTeams() {
        const teamsStr = api.getMatchTeams(firstUnfinishedMatch);
        if (teamsStr[0] === '(') {
            const expr = parseSexprFromString(teamsStr) as string[];
            return evalSexpr({
                winner(inputs: string[]) {
                    // console.log('computing winner: ', JSON.stringify(inputs));
                    const match = inputs[0];
                    return api.getWinner(match);
                }
            }, expr)
        } else {
            return teamsStr.split(' ')
        }
    }

    const fightingTeams = getFightingTeams();

    console.log('fightingTeams are: ', fightingTeams)

    for (const team of fightingTeams) {
        console.log(`Team: ${api.getTeamName(team)}`)

        function formatRezzes(matches) {
            if (matches.length === 0)
                return '(none)'

            return matches.map(match => {
                // const name = api.getOne(`${match.getTag('unit')} .Name`).value();
                // return `${name} (${match.getTagValue('skill')})`
            }).join(', ');
        }

        console.log('  Rez abilities: ' + formatRezzes(
            api.run(`get ${team} unit/$a | join unit/$a has-skill/$s | join skill/$s category/rez`)
        ));

        for (const unit of [] /* api.get(`${teamId} unit / *` */ ) {
            console.log('  Unit: ' + unit.tag('unit').add('.Name').getOne().value());
            // console.log(' Class: ' + api.getOne(`${unit.getTag('unit')} class/*`).getTagValue('class'))

            //for (const skill of api.get(`${unit.getTag('unit')} has-skill/$s`))
            //    console.log(`  Skill: ${skill.getTagValue('has-skill')}`)

            for (const clss of unit.tag('unit').add('class/$s').join(`class/$s rank/*`).rels())
                console.log(`    Noteworthy class: ${clss.getTagValue('class')} (${clss.getTagValue('rank')})`)

            for (const skill of [] /* api.get(`${unit.getTag('unit')} has-skill/$s | join skill/$s rank/*` */)
                console.log(`    Noteworthy skill: ${skill.getTagValue('skill')} (${skill.getTagValue('rank')})`)

            for (const skill of [] /* api.get(`${unit.getTag('unit')} has-skill/$s | join skill/$s skilltype/*`) */ )
                console.log(`    Noteworthy skill: ${skill.getTagValue('skill')} (${skill.getTagValue('skilltype')})`)
        }
    }

    graph.saveDumpFile('dump.graph');
    graph.startRepl();
}


main()
.catch(console.error);
