
import Command from './Command'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'
import { normalizeExactTag } from './parseCommand'
import StoragePlugin from './StoragePlugin'

export default class SetOperation {
    replyWithEcho = false
    needsReply = true
    graph: Graph
    command: Command
    respond: RespondFunc
    ntag: string
    customStorage: boolean
    storagePlugin: StoragePlugin
    relation: Relation
    relationIsNew: boolean
    savePromise: Promise<void>

    constructor(graph: Graph, command: Command, respond: RespondFunc) {
        this.graph = graph;
        this.command = command;
        this.respond = respond;
    }

    resolveSpecialTags() {
        const command = this.command;

        for (const arg of command.tags) {
            if (arg.tagValue === '#unique') {
                arg.tagValue = this.graph.schema.findTagType(arg.tagType).getUniqueId()
                this.replyWithEcho = true;
            }
        }
    }

    findOrInitRelation() {
        const { command, ntag } = this;

        const existingRelation = this.graph.relationsByNtag[ntag];

        if (existingRelation) {
            this.relation = existingRelation;
            this.relationIsNew = false;
        } else {
            this.relation = new Relation(ntag, command.tags, command.payloadStr);
            this.relationIsNew = true;
        }
    }

    findStoragePlugin() {
        this.storagePlugin = this.graph.findStoragePlugin(this.relation);
    }

    save() {
        const { storagePlugin, ntag, relation, command } = this;

        if (storagePlugin) {

            if (storagePlugin.setAsync) {

                this.savePromise = storagePlugin.setAsync(this);
            } else {
                storagePlugin.set(this);
            }

        } else if (this.relationIsNew) {
            this.graph.relationsByNtag[ntag] = relation;
        } else {
            relation.setPayload(command.payloadStr);
        }
    }

    finish() {

        const { respond, command, relation } = this;

        this.graph.onRelationUpdated(command, relation);

        if (this.needsReply) {
            if (this.replyWithEcho) {
                respond(this.graph.schema.stringifyRelation(relation));
            } else {
                respond("#done");
            }
        }
    }

    perform() {

        const { command } = this;

        this.resolveSpecialTags();
        this.ntag = normalizeExactTag(command.tags);
        this.findOrInitRelation();
        this.findStoragePlugin();
        this.save();

        if (this.savePromise) {
            this.savePromise.then(() => this.finish());
        } else {
            this.finish();
        }
    }
}
