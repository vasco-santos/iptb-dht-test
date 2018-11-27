'use strict'

// Setup CLI
require('yargs')
  .commandDir('cli')
  .demandCommand()
  .help()
  .argv
