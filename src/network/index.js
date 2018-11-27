'use strict'

const fs = require('fs')
const execa = require('execa')
const { lookup } = require('./lookup')
const NetworkChurn = require('./churn')

const debug = require('debug')
const log = debug('iptb-dht-test:network:setup')
log.error = debug('iptb-dht-test:network:setup:error')

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
    log('testbed created')

    // Init repos
    await execa.shell('iptb init')
    log('repos initialized')

    // Set proper config to use the first node with no bootstrap nodes
    await execa.shell('iptb run 0 -- ipfs config --json Bootstrap \'[]\'')
    log('node 0 repo properly configured')

    // Start node 0
    await execa.shell('iptb start 0 --wait -- --enable-dht-experiment')

    out = await execa.shell('iptb run 0 -- ipfs id --format="<addrs>"')
    const addr = out.stdout.split(/\r?\n/)[2]

    log(`node 0 started with addr ${addr}`)

    // Set proper config to the remaning nodes and start them
    for (let i = 1; i < this._n; i++) {
      await execa.shell(`iptb run ${i} -- ipfs config --json Bootstrap '["${addr}"]'`)
      // ipfs config --json Bootstrap '["/ip4/127.0.0.1/tcp/59163/ipfs/QmYEouqLdPepu5GiVL9LLxSByvophh8XaSq8wmrXWzupu6"]'
      await execa.shell(`iptb start ${i} --wait -- --enable-dht-experiment`)
      log(`node ${i} repo properly configured and node started`)
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
      log(`node ${i} stopped`)
    }
  }

  // save to file
  saveAnalysis () {
    console.log('FINAL ANALYSIS')

    console.log(`Put failed error: ${this._analysis.put.failError}`)
    console.log(`Put failed offline: ${this._analysis.put.failOffline}`)

    console.log(`Get failed error: ${this._analysis.get.failError}`)
    console.log(`Get failed offline: ${this._analysis.get.failOffline}`)
    console.log(`Get failed expected value (not synced): ${this._analysis.get.failExpected}`)

    const result = {
      inputs: {
        n: this._n,
        i: this._iterations,
        lf: this._lookupFactor,
        cf: this._churnFactor
      },
      results: this._analysis
    }

    const filename = `${(new Date).getTime()}-${this._n}-${this._iterations}-${this._lookupFactor}-${this._churnFactor}`

    fs.writeFileSync(`${process.cwd()}/results/${filename}.json`, JSON.stringify(result, null, 4), { flag: 'wx' })
  }
}

exports = module.exports = Network
