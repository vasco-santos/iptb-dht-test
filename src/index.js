'use strict'

const Network = require('./network')

const run = (async () => {
  const n = 10
  const iterations = 200
  const lookupFactor = 2
  const churnFactor = 2

  // setup network
  const network = new Network(n, iterations, lookupFactor, churnFactor)
  await network.setup()

  // start simulation
  await network.start()

  // stop simulation
  await network.stop()

  // save analysis
  network.saveAnalysis()
})()
