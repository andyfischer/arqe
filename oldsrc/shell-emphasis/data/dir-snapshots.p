
def-slot stored-snapshot-dir
def-command save-dir-snapshot
def-command restore-dir-snapshot

command/save-dir-snapshot ..
  requires-arg stored-snapshot-dir
  requires-arg snapshot-name
  has-main-arg snapshot-name

command/restore-dir-snapshot ..
  requires-arg stored-snapshot-dir
  requires-arg snapshot-name
  has-main-arg snapshot-name
