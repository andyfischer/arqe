
# arqe - Abstract Relational Query Engine #

General purpose engine for making anything available through a relational query interface.

Provides:
 - A query engine that handles parsing, planning, and execution.
 - A pretty easy API for mounting your own custom tables into the system.
 - Standard tables like filesystem mounts and caching.

# Inspirations and Influences #

 - Relational tables over foreign data: [OSQuery](https://osquery.io/), [SQL foreign data wrappers](https://wiki.postgresql.org/wiki/Foreign_data_wrappers), and others.
 - Codd's relational model of data
 - [The Third Manifesto](https://www.dcs.warwick.ac.uk/~hugh/TTM/DTATRM.pdf)
 - ["Compilers are databases"](https://www.youtube.com/watch?v=WxyyJyB_Ssc) - Martin Odersky

# Goals #

 - Unify and simpify the modern application development process.
 - Store code as structured relational data.
 - Unified database for all the metadata around code: configs, feature flags,
   branching, versioning, a/b traffic splitting, etc.
 - Eliminate the "build step" as we know it, instead have a single fluid system that
   understands stages.
 - Functional-reactive database with efficient change propogation.
 - Enable amazing developer dashboards and tools.

### Elaboration on: Unified system for code metadata ###

With modern practices, a typical software product is a combination of a few things:

 - The source code
 - Configuration data
 - Versioning / deployment state

Each of these pieces of data can vary across multiple dimensions:

 - Source code varies across branches.
 - Configration varies across environments or branches.
 - Versioning state has different styles of how it changes, such as canary or blue/green
   deployments.
 - Additionally there can be per-user code or configuration changes, also called
   traffic splitting or A/B testing.

Within that there's some finer-grained breakdowns. Configuration can be divided up
into "slow-changing" data (such as deployed XML / YAML files) or "fast-changing" (such
as feature flags / feature toggles).

The old fashioned perspective is to think of just the source code as "the program", and
everything else is a less significant detail. But increasingly, we're realizing that the
real "program" is the amalgamation of everything listed above. Especially with the
popularity of microservices, where versioning / deployment effects become a lot more
significant, we're finding that the program running on our desk is a distant representation
of the experience that our users get.

So the problem statement is:

 1) The boundaries between those various systems is poorly defined. For example it's fuzzy
    on whether a piece of data should live in code versus configuration.
 2) A lot of these systems have similar capabilities, the common thread is that some data
    varies across some dimensions. But typically those systems are implemented with completely
    different technologies which leads to a lot of complexity and duplicate effort.

So this project tries to solve the problem by implementing a single database layer that
stores everything mentioned above. A defining feature in this system is that any piece 
of data can vary across multiple dimensions. The dimensions might be: branches, environments,
data centers, canaries, traffic splits.

# Elaboration on: Removing the build system as we know it #

Typical software projects have another duplication of effort - using completely different
technologies for the build process compared to the application itself. This means we have
roughly double the toolset to manage. And, it leads to awkward situations where we might
want to move a certain task from build-time to runtime, or vice-versa, but it's not as easy as
it should be.

 - If we want the system to be more "live", where we can change anything and see the results
   quickly, then we need to move tasks from build-time to runtime. Potentially the entire
   application might need to rebuild while we're running it.
 - If we want to have good runtime performance, we often need to move tasks from runtime
   to build-time. A specific example in the web world is taking client-side HTML rendering
   and moving to happen ahead of time on the server (SSR).
