'use strict'

const fs = require('fs')
const execa = require('execa')
const { lookup } = require('./lookup')
const NetworkChurn = require('./churn')
const statistics = require('../statistics')

const debug = require('debug')
const log = debug('iptb-dht-test:network:setup')
log.error = debug('iptb-dht-test:network:setup:error')

class Network {
  constructor (implementation, n, iterations, waitTime, lookupFactor, churnFactor) {
    this._implementation = implementation
    this._n = n
    this._iterations = iterations
    this._waitTime = waitTime
    this._lookupFactor = lookupFactor
    this._churnFactor = churnFactor
    this._ipfsExec = undefined
    this._networkChurn = undefined
    this._analysis = undefined
  }

  async setup() {
    let out

    // Create iptb testbed with js-ipfs nodes
    await execa.shell(`iptb testbed create -count ${this._n} -type localipfs -force -attr binary,$(which ${this._implementation})`)
    log('testbed created')

    // Init repos
    await execa.shell('iptb init')
    log('repos initialized')

    // Set proper config to use the first node with no bootstrap nodes
    await execa.shell('iptb run 0 -- ipfs config --json Bootstrap \'[]\'')
    log('node 0 repo properly configured')

    // Start node 0
    if (this._implementation === 'jsipfs') {
      await execa.shell('iptb start 0 --wait -- --enable-dht-experiment')
    } else {
      await execa.shell('iptb start 0 --wait')
    }

    out = await execa.shell('iptb run 0 -- ipfs id --format="<addrs>"')
    const addr = out.stdout.split(/\r?\n/)[2]

    log(`node 0 started with addr ${addr}`)

    // Set proper config to the remaning nodes and start them
    for (let i = 1; i < this._n; i++) {
      await execa.shell(`iptb run ${i} -- ipfs config --json Bootstrap '["${addr}"]'`)
      if (this._implementation === 'jsipfs') {
        await execa.shell(`iptb start ${i} --wait -- --enable-dht-experiment`)
      } else {
        await execa.shell(`iptb start ${i} --wait`)
      }
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
    this._analysis = await lookup(this._ipfsExec, this._n, this._waitTime, this._lookupFactor, this._iterations)

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
    const result = {
      implementation: this._implementation,
      inputs: {
        n: this._n,
        i: this._iterations,
        lf: this._lookupFactor,
        cf: this._churnFactor
      },
      results: this._analysis
    }

    const filename = `${(new Date).getTime()}-${this._implementation}-${this._n}-${this._iterations}-${this._lookupFactor}-${this._churnFactor}`

    statistics.get(result)
    fs.writeFileSync(`${process.cwd()}/results/${filename}.json`, JSON.stringify(result, null, 4), { flag: 'wx' })
  }
}

exports = module.exports = Network
