"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const Graph_1 = __importDefault(require("./fs/Graph"));
const GraphORM_1 = require("./fs/GraphORM");
const path_1 = __importDefault(require("path"));
const parseCommand_1 = require("./fs/parseCommand");
const sexpr_1 = require("./fs/sexpr");
const graph = new Graph_1.default();
graph.loadDumpFile(path_1.default.join(__dirname, '../source.graph'));
function toTagName(str) {
    return str.replace(/ /g, '')
        .replace(/\'/g, '');
}
const api = graph.relationSyncApi();
async function main() {
    const data = await (node_fetch_1.default('https://fftbg.com/api/tournament/latest').then(d => d.json()));
    // Load all the JSON into the graph
    for (const teamName in data.Teams) {
        const teamData = data.Teams[teamName];
        const teamId = `team/${teamName}`;
        const team = api.run(`set ${teamId}`);
        for (const unit of teamData.Units) {
            const className = toTagName(unit.Class);
            const unitId = (await GraphORM_1.saveObject(graph, 'unit/#unique', unit)).stringify();
            api.run(`set ${unitId} class/${className}`);
            api.run(`set ${teamId} ${unitId}`);
            for (const skill of unit.ClassSkills) {
                api.run(`set ${unitId} has-skill/${toTagName(skill)}`);
            }
            for (const extraSkill of unit.ExtraSkills) {
                api.run(`set ${unitId} has-skill/${toTagName(extraSkill)}`);
            }
            api.run(`set ${unitId} has-skill/${toTagName(unit.ReactionSkill)}`);
        }
    }
    // Figure out who is playing
    let firstUnfinishedMatch = null;
    graph.runDerived(cxt => {
        for (const match of cxt.get('match/* .teams')) {
            const num = parseInt(match.getTagValue('match'));
            const foundWinner = data.Winners[num - 1];
            if (foundWinner) {
                api.run(`set ${match.getTag('match')} winner == team/${foundWinner}`);
            }
            else {
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
        const val = firstUnfinishedMatch.value();
        if (val[0] === '(') {
            const expr = sexpr_1.parseSexprFromString(val);
            return sexpr_1.evalSexpr({
                winner(inputs) {
                    // console.log('computing winner: ', JSON.stringify(inputs));
                    const match = inputs[0];
                    return api.getOne(`${match} winner`).value();
                }
            }, expr);
        }
        else {
            return val.split(' ');
        }
    }
    const fightingTeams = getFightingTeams().map(t => parseCommand_1.parsePattern(t));
    for (const team of fightingTeams) {
        graph.runDerived(cxt => {
            console.log(`Team: ${team.getTagValue('team')}`);
            const teamId = team.getTag('team');
            function formatRezzes(matches) {
                if (matches.length === 0)
                    return '(none)';
                return matches.map(match => {
                    const name = api.getOne(`${match.getTag('unit')} .Name`).value();
                    return `${name} (${match.getTagValue('skill')})`;
                }).join(', ');
            }
            console.log('  Rez abilities: ' + formatRezzes(api.run(`get ${teamId} unit/$a | join unit/$a has-skill/$s | join skill/$s category/rez`)));
            for (const unit of api.get(`${teamId} unit/*`)) {
                console.log('  Unit: ' + unit.tag('unit').add('.Name').getOne().value());
                // console.log(' Class: ' + api.getOne(`${unit.getTag('unit')} class/*`).getTagValue('class'))
                //for (const skill of api.get(`${unit.getTag('unit')} has-skill/$s`))
                //    console.log(`  Skill: ${skill.getTagValue('has-skill')}`)
                for (const clss of unit.tag('unit').add('class/$s').join(`class/$s rank/*`).rels())
                    console.log(`    Noteworthy class: ${clss.getTagValue('class')} (${clss.getTagValue('rank')})`);
                for (const skill of api.get(`${unit.getTag('unit')} has-skill/$s | join skill/$s rank/*`))
                    console.log(`    Noteworthy skill: ${skill.getTagValue('skill')} (${skill.getTagValue('rank')})`);
                for (const skill of api.get(`${unit.getTag('unit')} has-skill/$s | join skill/$s skilltype/*`))
                    console.log(`    Noteworthy skill: ${skill.getTagValue('skill')} (${skill.getTagValue('skilltype')})`);
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
