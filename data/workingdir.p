
def-command provision-working-dir

command/provision-working-dir ..
  requires-arg filesystem.workingdir
  requires-arg dir-name
  has-main-arg dir-name

command/deploy ..
  requires-arg deployment-name
