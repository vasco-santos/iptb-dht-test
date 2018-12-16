'use strict'

const Network = require('../network')

module.exports = {
  command: 'simulation [options]',
  describe: 'Start a dht simulation',
  builder: {
    implementation: {
      default: 'jsipfs',
      alias: 'imp',
      describe: 'ipfs implementation. (ipfs or jsipfs)'
    },
    nodes: {
      default: 10,
      alias: 'n',
      describe: 'Number of nodes.',
    },
    iterations: {
      default: 200,
      alias: 'i',
      describe: 'Number of iterations of putting and getting data.',
    },
    'wait-time': {
      default: 500,
      alias: 'wt',
      describe: 'time to wait between put a key and try to get it.'
    },
    'lookup-factor': {
      default: 2,
      alias: 'lf',
      describe: 'Keys replication for the number of nodes.'
    },
    'churn-factor': {
      default: 2,
      alias: 'cf',
      describe: 'Churn per second.'
    }
  },
  async handler(argv) {
    const n = argv.nodes || 10
    const iterations = argv.iterations || 200
    const waitTime = argv.wt || 500
    const lookupFactor = argv.ld || 2
    const churnFactor = argv.cf || 2
    let implementation = 'jsipfs'

    if (argv.implementation && argv.implementation === 'ipfs') {
      implementation = argv.implementation
    }

    // setup network
    const network = new Network(implementation, n, iterations, waitTime, lookupFactor, churnFactor)
    await network.setup()

    // start simulation
    await network.start()

    // stop simulation
    await network.stop()

    // save analysis
    network.saveAnalysis()

    process.exit()
  }
}
