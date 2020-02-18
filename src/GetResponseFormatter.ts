
import Command from './Command'
import Graph, { RespondFunc } from './Graph'
import Schema from './Schema'
import Relation from './Relation'
import RelationPattern, { PatternTag } from './RelationPattern'
import StorageProvider from './StorageProvider'
import { commandTagToString } from './stringifyQuery'
import RelationReceiver  from './RelationReceiver'

export default class GetResponseFormatter implements RelationReceiver {
    // Context
    schema: Schema
    pattern: RelationPattern
    respond: RespondFunc

    // Format options
    extendedResult?: boolean
    asMultiResults?: boolean
    asSetCommands?: boolean
    listOnly?: boolean

    // Progress
    anyResults: boolean = false
    enoughResults: boolean = false

    // Protocol validation
    hasStarted = false;
    calledFinish = false;

    start() {
        if (this.hasStarted)
            throw new Error("ResponseFormatter protocol error: .start() called twice");

        if (this.asMultiResults)
            this.respond('#start');

        this.hasStarted = true;
    }

    formatRelation(rel: Relation) {
        const tags = rel.tags.filter(tag => {
            if (this.pattern.fixedTagsForType[tag.tagType])
                return false;

            return true;
        });

        if (this.schema) {
            this.schema.ordering.sortTags(tags);
        }

        const tagStrs = tags.map(commandTagToString);

        let str = tagStrs.join(' ');
        
        if (!this.listOnly) {
            str += (rel.hasPayload() ? ` == ${rel.payload()}` : '');
        }

        if (rel.wasDeleted) {
            str = 'delete ' + str;

        } else if (this.asSetCommands) {
            str = 'set ' + str;
        }

        return str;
    }

    relation(rel: Relation) {

        if (!this.hasStarted)
            throw new Error("ResponseFormatter protocol error: .relation called before .start()");

        if (this.calledFinish)
            throw new Error("ResponseFormatter protocol error: .relation called after .finish()");

        if (this.enoughResults)
            return;

        const { respond, pattern, extendedResult, asMultiResults } = this;

        this.anyResults = true;

        if (asMultiResults) {
            if (extendedResult) {
                respond(this.schema.stringifyRelation(rel));
            } else {
                respond(this.formatRelation(rel));
            }
        } else {
            if (extendedResult) {
                respond(this.schema.stringifyRelation(rel));
            } else {
                if (rel.hasPayload()) {
                    respond(rel.payload());
                } else {
                    respond('#exists');
                }
            }

            this.enoughResults = true;
        }
    }
    
    error(e) {
        if (this.calledFinish)
            throw new Error("ResponseFormatter protocol error: .error() called after .finish");

        this.respond('#error ' + e);
    }

    finish() {
        if (!this.hasStarted)
            throw new Error("ResponseFormatter protocol error: .finish() called before .start()");
        if (this.calledFinish)
            throw new Error("ResponseFormatter protocol error: .finish() called twice");
        if (this.enoughResults)
            return

        this.calledFinish = true;

        if (this.asMultiResults)
            this.respond('#done');

        if (!this.asMultiResults && !this.anyResults)
            this.respond('#null');
    }

    isDone() {
        return this.calledFinish || this.enoughResults;
    }
}
