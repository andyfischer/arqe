
Important things about IK:

 - Homogenous implementation. Every node can be a database. Data is efficiently replicated.
 - Tagging and annotation. Every item can have more information added on top. Extra
   information can be queried. Sometimes a piece of knowledge is inherited.

   - Examples of annotations:
     - Data lifecycle. Which build phase does this belong to? How static is this?

 - All code knowledge lives in the database. Source code, branches, comments, deployments.
 - The database is live and reactive. It can receive changes and it always knows how to
   propogate those changes to derived values and listeners. It's easy for clients to subscribe
   to a live view.

 - Everything in the system is highly introspectable. A query can be introspected to break
   down the evaluation plan and depdendencies.

 - Excellent DX. Beautiful dashboard.

 - Supports efficient usage and "evaporation". A program can start off as tightly-integrated
   with the database (and gaining the benefits), but when the program is ready to ship, it
   can be compiled and linked down into a smaller version that doesn't use a database.

 - Supports dimensions, views and lenses
   - Manipulate the way that data is viewed
   - Support branches / forks - altered and sandboxed versions of the universe

 - Entire workspace can be captured. Capture a running application and replicate it on another workstation.

--- 

Operations that should be easy:

 - Take any piece of data and find out its dependencies, provenence, lifecycle.
 - Subscribe to any piece of data and receive a stream of live changes.
 - Have aggregating queries (combining data from other queries). Aggregate queries
   have the same features (find dependencies, lifecycle, subscribe to live updates).
 - Entire universe can be branched / forked / viewed through a custom lens.

---

Implementation notes:

 - Do queries need to think about SQL columns?
 - How is branching stored?
 - Implement in SQLite?
