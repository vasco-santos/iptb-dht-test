'use strict'

const execa = require('execa')
const { lookup } = require('./lookup')
const NetworkChurn = require('./churn')

class Network {
  constructor (n, iterations, lookupFactor, churnFactor) {
    this._n = n
    this._iterations = iterations
    this._lookupFactor = lookupFactor
    this._churnFactor = churnFactor
    this._ipfsExec = undefined
    this._networkChurn = undefined
    this._analysis = undefined
  }

  async setup() {
    let out

    // Create iptb testbed with js-ipfs nodes
    await execa.shell(`iptb testbed create -count ${this._n} -type localipfs -force -attr binary,$(which jsipfs)`)
    console.info('testbed created')

    // Init repos
    await execa.shell('iptb init')
    console.info('repos initialized')

    // Set proper config to use the first node with no bootstrap nodes
    await execa.shell('iptb run 0 -- ipfs config --json Bootstrap \'[]\'')
    console.info('node 0 repo properly configured')

    // Start node 0
    await execa.shell('iptb start 0 --wait -- --enable-dht-experiment')

    out = await execa.shell('iptb run 0 -- ipfs id --format="<addrs>"')
    const addr = out.stdout.split(/\r?\n/)[2]

    console.info(`node 0 started with addr ${addr}`)

    // Set proper config to the remaning nodes and start them
    for (let i = 1; i < this._n; i++) {
      await execa.shell(`iptb run ${i} -- ipfs config --json Bootstrap '["${addr}"]'`)
      // ipfs config --json Bootstrap '["/ip4/127.0.0.1/tcp/59163/ipfs/QmYEouqLdPepu5GiVL9LLxSByvophh8XaSq8wmrXWzupu6"]'
      await execa.shell(`iptb start ${i} --wait -- --enable-dht-experiment`)
      console.info(`node ${i} repo properly configured and node started`)
    }

    // Create ipfs executer
    this._ipfsExec = async (peerId, cmd) => await execa.shell(`iptb run ${peerId} -- ipfs ${cmd}`)
    this._networkChurn = new NetworkChurn(this._n, this._churnFactor)
  }

  async start () {
    if (!this._ipfsExec) {
      await this.setup()
    }

    // start churn
    this._networkChurn.start()

    // start lookup
    this._analysis = await lookup(this._ipfsExec, this._n, this._lookupFactor, this._iterations)

    // stop churn
    await this._networkChurn.stop()
  }

  async stop () {
    for (let i = 0; i < this._n; i++) {
      await execa.shell(`iptb stop ${i}`)
      console.info(`node ${i} stopped`)
    }
  }

  saveAnalysis () {
    const analysis = this._analysis

    console.log('FINAL ANALYSIS')

    console.log(`Put failed error: ${analysis.putFailError}`)
    console.log(`Put failed offline: ${analysis.putFailOffline}`)

    console.log(`Get failed error: ${analysis.getFailError}`)
    console.log(`Get failed offline: ${analysis.getFailOffline}`)
    console.log(`Get failed expected value (not synced): ${analysis.getFailExpected}`)
  }
}

exports = module.exports = Network
