
# arqe - Awesome Relational Query Engine #

General purpose engine for providing and using data with a relational-query interface.

The goal is to improve the process of software development, by putting a unified
interface on top of many disparate systems, and enabling very good debuggability,
introspection, and liveness.

The hope is that this approach can enable:

 - Unifying the deployment of code and versioning and configs (feature flags, a/b tests,
   branching, canaries, etc)
 - Break down the "build step", instead treat software delivery as a single fluid environment
   that understands staged compilation.

# Inspirations / Influences #

 - Relational tables over foreign data: [OSQuery](https://osquery.io/), [SQL foreign data wrappers](https://wiki.postgresql.org/wiki/Foreign_data_wrappers), and others.
 - Codd's relational model of data
 - [The Third Manifesto](https://www.dcs.warwick.ac.uk/~hugh/TTM/DTATRM.pdf)

# Syntax #

A lot of visitors love to see syntax samples first, so here we go.






# Goals #

 - Unify and simpify the modern application development process.
 - Store code as structured relational data.
 - Unified database for all the metadata around code: configs, feature flags,
   branching, versioning, a/b traffic splitting, etc.
 - Remove the "build step" as we know it, instead have a single fluid system that
   handles staged compilation.
 - Functional-reactive database with efficient change propogation.
 - Not a closed system: Easily connect and leverage existing tools, databases and APIs.
 - Enable amazing developer dashboards and tools.

# Goals - Elaboration #

More thoughts behind the goals listed above.

# Storing code as data / Unified system for code metadata #

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

# Removing the build system as we know it #

Typical software projects have another duplication of effort - completely different
technologies used for the build process compared to the application runtime. This 
problem manifests in a few ways:

 - Additional tooling complexity.
 - Sometimes there are build-time tasks that we want to move to runtime tasks, but
   with different platforms, this requires a rewrite.
 - More often, there are run-time tasks that we'd like to move to build-time. An example
   is React.js client-side rendering, where the user's browser does work for
   data-to-HTML rendering, even though that task can (usually) be done just as well ahead of time.
