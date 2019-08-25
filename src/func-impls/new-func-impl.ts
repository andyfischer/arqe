
import { Snapshot, Query } from '..'

export default (snapshot: Snapshot) => {
    snapshot.implement('new-func-impl', async (query: Query) => {

        // create a file in fs/src/func-impls from the template
        // add it to fs/src/func-impls/index.ts
        //   open fs/src/func-impls/index.ts
        //   identify the insertion points
        //     for index.ts
        //       insert call=implementAll after-contents
        //       insert after-imports
        //     for new file
        //       replace call func=implement argument 0
        //      

        //   translate from dash-style to camelStyle
        //   insert the calls



    });
}
