
# future-data #

Experimental project looking at using relational databases in new ways.

This project is highly amorphous and wandering, looking for a useful niche.
This project is also partially a learning exercise for me, to practice doing database
implementations. There's probably a lot of ideas in here that have already been 
done better by smarter people, since databases are such a well-studied field.

# Motivations #

This project started by noticing that today, software services have code, and they
always have a lot of data *around* the code. The 'surrounding' data includes:

 - Global configuration files.
 - Source control branches. Code & build artifacts associated with branches or sha1s.
 - Environment-based configuration. Feature flags.
 - Datacenter-based configuration.
 - Version rollouts. Blue/green versions. Pinned versions. Canary versions.
 - Per-user configs. Traffic splitting. A/B testing. Canaried feature flags.

That led to a question: can we make a unified system where all of these different things
are all represented in one homogenous way?

So that led to thinking about how all this is multidimensional data. The code is a data
structure and branches are a dimension - the code can vary across the branch dimension.
If we have environment-based configuration then the environment is another dimension.
Altogether, we need maybe 3 to 5 dimensions to handle all of those web-scale things.
So our ideal system should be able to store data against N dimensions, and some users will
probably use a standard set of dimensions, whereas other users might want to invent more
for other purposes.

In this world I'm not drawing a significant difference between code & configuration - those
just get lumped together as 'data'.

That leads to another topic. A typical software project has two completely different codebases:
one for building the application, and the application runtime itself. This seems a little
ridiculous, and maybe we can have one unified system that understands both build-time and run-time
execution. Also known as staged compilation / multi-stage programming.


