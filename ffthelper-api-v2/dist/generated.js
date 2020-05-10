"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GraphAPI {
    constructor(graph) {
        this.graph = graph;
    }
    run(command) {
        console.log('Running command: ' + command);
        this.graph.run(command);
    }
    getWinner(matchTag) {
        // Run query search
        const queryStr = `${matchTag} winner`;
        console.log('Running query (for getWinner): ' + queryStr);
        const rels = this.graph.getRelationsSync(queryStr);
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']');
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr);
        }
        const rel = rels[0];
        return rel.getValue();
    }
    getMatchNumbers() {
        // Run query search
        const queryStr = `match/* .teams`;
        console.log('Running query (for getMatchNumbers): ' + queryStr);
        const rels = this.graph.getRelationsSync(queryStr);
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']');
        return rels.map(rel => rel.getTagValue("match")).map(str => parseInt(str, 10));
    }
    getUnits() {
        // Run query search
        const queryStr = `unit/*`;
        console.log('Running query (for getUnits): ' + queryStr);
        const rels = this.graph.getRelationsSync(queryStr);
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']');
        return rels.map(rel => rel.getTagValue("unit"));
    }
    getMatchTeams(matchTag) {
        // Run query search
        const queryStr = `${matchTag} .teams`;
        console.log('Running query (for getMatchTeams): ' + queryStr);
        const rels = this.graph.getRelationsSync(queryStr);
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']');
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr);
        }
        const rel = rels[0];
        return rel.getValue();
    }
    getTeamName(teamTag) {
        // Run query search
        const queryStr = `${teamTag}`;
        console.log('Running query (for getTeamName): ' + queryStr);
        const rels = this.graph.getRelationsSync(queryStr);
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']');
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr);
        }
        const rel = rels[0];
        return rel.getTagValue("team");
    }
    getTeamRezzes(team) {
        // Run query search
        const queryStr = `get ${team} unit/$a | join unit/$a has-skill/$s | join skill/$s category/rez`;
        console.log('Running query (for getTeamRezzes): ' + queryStr);
        const rels = this.graph.getRelationsSync(queryStr);
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']');
        return rels.map(rel => rel.getTagValue("team"));
    }
}
exports.GraphAPI = GraphAPI;
