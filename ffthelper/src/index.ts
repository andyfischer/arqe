
import fetch from 'node-fetch'
import Graph from './fs/Graph'
import { saveObject } from './fs/GraphORM'
import Fs from 'fs-extra'
import { mountDerivedTag } from './fs/DerivedValueMount'
import UpdateContext from './fs/UpdateContext'
import { parsePattern } from './fs/parseCommand'
import { parseSexprFromString, evalSexpr } from './fs/sexpr'

const graph = new Graph()

function toTagName(str) {
    return str.replace(/ /g, '')
        .replace(/\'/g, '');
}

const bootstrap = `
set skill/GilTaking skilltype/trap

set skill/GilTaking skilltype/trap
set skill/StealWeapon skilltype/trap
set skill/Wiznabius skilltype/trap
set skill/NamelessSong skilltype/trap

set skill/Revive category/rez
set skill/PhoenixDown category/rez
set skill/Raise category/rez
set skill/Raise2 category/rez

set skill/FastCharge rank/verygood
set skill/GalaxyStop rank/verygood
set skill/Doublehand rank/good
set skill/DamageSplit rank/good

set item/StoneGun rank/verygood
set item/Ribbon rank/verygood

set class/Ninja rank/good
set class/Calculator rank/good
set class/Summoner rank/good
set class/Monk rank/good
set class/Lancer rank/good
set class/RedChocobo rank/good

set class/Taiju rank/verygood
set class/SteelGiant rank/verygood

set class/TimeMage rank/bad
set class/Dancer rank/bad

set team/red
set team/blue
set team/green
set team/yellow
set team/white
set team/black
set team/purple
set team/brown
set team/champ

set match/1 .teams == team/red team/blue
set match/2 .teams == team/green team/yellow
set match/3 .teams == team/white team/black
set match/4 .teams == team/purple team/brown
set match/5 .teams == (list (winner match/1) (winner match/2))
set match/6 .teams == (list (winner match/3) (winner match/4))
set match/7 .teams == (list (winner match/5) (winner match/6))
set match/8 .teams == (list (winner match/7) team/champ)

`;

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

for (const command of bootstrap.split('\n'))
    graph.run(command)

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

    console.log('Next unfinished match is: ', firstUnfinishedMatch.stringifyRelation());

    function getFightingTeams() {
        const val = firstUnfinishedMatch.getValue();
        if (val[0] === '(') {
            const expr = parseSexprFromString(val);
            return evalSexpr({
                winner(inputs: string[]) {
                    const match = inputs[0];
                    return graph.runSync(`get ${match} winner`).getValue()
                }
            }, expr)
        } else {
            return val;
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
