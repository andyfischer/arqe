
import fetch from 'node-fetch'
import Graph from './fs/Graph'
import { saveObject } from './fs/GraphORM'
import Fs from 'fs-extra'
import { mountDerivedTag } from './fs/DerivedValueMount'
import UpdateContext from './fs/UpdateContext'
import { parsePattern } from './fs/parseCommand'
import { parseSexprFromString, evalSexpr } from './fs/sexpr'
import Pattern from './fs/Pattern'

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
set skill/StealHeart rank/good
set skill/Murasame rank/good

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
set class/UltimaDemon rank/verygood
set class/Vampire rank/good
set class/BlueDragon rank/good

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
set team/champion

set match/1 .teams == team/red team/blue
set match/2 .teams == team/green team/yellow
set match/3 .teams == team/white team/black
set match/4 .teams == team/purple team/brown
set match/5 .teams == (list (winner match/1) (winner match/2))
set match/6 .teams == (list (winner match/3) (winner match/4))
set match/7 .teams == (list (winner match/5) (winner match/6))
set match/8 .teams == (list (winner match/7) team/champion)

`;

const api = graph.relationSyncApi();

function run(graph: Graph, cmd: string) {

    const result = graph.runSync(cmd);
    console.log(' ran: ' + cmd);
    console.log(' > ' + result);
    return result;
}

for (const command of bootstrap.split('\n'))
    graph.run(command)

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
        }
    }

    // Figure out who is playing
    let firstUnfinishedMatch = null;
    graph.runDerived(cxt => {
        for (const match of cxt.get('match/* .teams')) {
            const num = parseInt(match.getTagValue('match'))

            const foundWinner = data.Winners[num - 1]
            if (foundWinner) {
                api.run(`set ${match.getTag('match')} winner == team/${foundWinner}`)
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

    // console.log('Next match is: ', firstUnfinishedMatch.stringifyRelation());

    function getFightingTeams() {
        const val = firstUnfinishedMatch.getValue();
        if (val[0] === '(') {
            const expr = parseSexprFromString(val) as string[];
            return evalSexpr({
                winner(inputs: string[]) {
                    // console.log('computing winner: ', JSON.stringify(inputs));
                    const match = inputs[0];
                    return api.getOne(`${match} winner`).getValue()
                }
            }, expr)
        } else {
            return val.split(' ')
        }
    }

    const fightingTeams = getFightingTeams().map(t => parsePattern(t))

    for (const team of fightingTeams) {
        graph.runDerived(cxt => {
            console.log(`Team: ${team.getTagValue('team')}`)

            const teamId = team.getTag('team')

            function formatRezzes(matches) {
                if (matches.length === 0)
                    return '(none)'

                return matches.map(match => {
                    const name = cxt.getOne(`${match.getTag('unit')} .Name`).getValue();
                    return `${name} (${match.getTagValue('skill')})`
                }).join(', ');
            }

            console.log('  Rez abilities: ' + formatRezzes(
                api.run(`get ${teamId} unit/$a | join unit/$a has-skill/$s | join skill/$s category/rez`)
            ));

            for (const unit of api.get(`${teamId} unit/*`)) {
                console.log('  Unit: ' + api.getOne(unit.getTag('unit') + ' .Name').getValue());
                // console.log(' Class: ' + api.getOne(`${unit.getTag('unit')} class/*`).getTagValue('class'))

                //for (const skill of api.get(`${unit.getTag('unit')} has-skill/$s`))
                //    console.log(`  Skill: ${skill.getTagValue('has-skill')}`)

                for (const clss of api.get(`${unit.getTag('unit')} class/$s | join class/$s rank/*`))
                    console.log(`    Noteworthy class: ${clss.getTagValue('class')} (${clss.getTagValue('rank')})`)

                for (const skill of api.get(`${unit.getTag('unit')} has-skill/$s | join skill/$s rank/*`))
                    console.log(`    Noteworthy skill: ${skill.getTagValue('skill')} (${skill.getTagValue('rank')})`)
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
