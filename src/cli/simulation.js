'use strict'

const Network = require('../network')

module.exports = {
  command: 'simulation [options]',
  describe: 'Start a dht simulation',
  builder: {
    nodes: {
      default: 10,
      alias: 'n',
      describe: 'Number of nodes. Default: 10',
    },
    iterations: {
      default: 200,
      alias: 'i',
      describe: 'Number of iterations of putting and getting data. Default: 200',
    },
    'lookup-factor': {
      default: 2,
      alias: 'lf',
      describe: 'Keys replication for the number of nodes: Default: 2'
    },
    'churn-factor': {
      default: 2,
      alias: 'cf',
      describe: 'Churn per second: Default: 2'
    }
  },
  async handler(argv) {
    const n = argv.nodes || 10
    const iterations = argv.iterations || 200
    const lookupFactor = argv.ld || 2
    const churnFactor = argv.cf || 2

    // setup network
    const network = new Network(n, iterations, lookupFactor, churnFactor)
    await network.setup()

    // start simulation
    await network.start()

    // stop simulation
    await network.stop()

    // save analysis
    network.saveAnalysis(n, iterations, lookupFactor, churnFactor)
  }
}
