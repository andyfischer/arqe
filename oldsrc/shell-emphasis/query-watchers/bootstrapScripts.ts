
import { Query } from '..'

export default function(query: Query) {
    if (query.relationSubject === 'bootstrap-scripts') {
        if (query.relation === 'includes') {
            query.snapshot.modifyGlobal('bootstrapScripts', value => {
                if (!value)
                    value = { scripts: {} };
            
                for (const arg of query.args)
                    value.scripts[arg] = true;

                return value;
            })
        }
    }
}
