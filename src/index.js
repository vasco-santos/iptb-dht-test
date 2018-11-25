'use strict'

const { setupNetwork, intensiveLookup } = require('./network')

const run = (async () => {
  const n = 4

  // setup network
  const ipfsExec = await setupNetwork(n)

  intensiveLookup(ipfsExec, n, 2, 50)
})()
