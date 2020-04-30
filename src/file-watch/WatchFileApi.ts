import { GraphLike, Relation, receiveToRelationListPromise } from ".."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    async findFileWatch(filename: string): Promise<string> {
        const command = `get file-watch filename(${filename}) version`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("file-watch");
    }

    async findFileWatch2(filename: string): Promise<string> {
        const command = `get file-watch filename(${filename}) version`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("file-watch");
    }

    listenToFile(watch: string, callback: (version: string) => void) {
        const command = `listen -get ${watch} filename version`;

        this.graph.run(command, {
            relation(rel: Relation) {
                if (rel.hasType('command-meta'))
                    return;
                callback(rel.getTagValue("version"));
            },
            finish() { }
        });
    }

    async postChange(filename: string) {
        const command = `set file-watch/* filename(${filename}) version/(increment)`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

    }

    async findWatchesForFilename(filename: string): Promise<string[]> {
        const command = `get file-watch/* filename(${filename}) version`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("file-watch"));
    }

    async createWatch(filename: string): Promise<string> {
        const command = `set file-watch/(unique) filename(${filename}) version/0`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("file-watch");
    }

    async incrementVersion(filename: string) {
        const command = `set file-watch/* filename(${filename}) version/(increment)`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

    }
}