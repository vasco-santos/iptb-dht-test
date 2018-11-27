'use strict'

const execa = require('execa')

class NetworkChurn {
  constructor (n, churnFactor) {
    this._n = n
    this._churnFactor = churnFactor
    this._churnHandle = undefined
  }

  async start() {
    if (this._churnHandle) {
      throw new Error('already running')
    }

    const churnHandle = {
      _onCancel: null,
      _timeoutId: null,
      runPeriodically: async (fn, period) => {
        churnHandle._timeoutId = setTimeout(async () => {
          churnHandle._timeoutId = null

          await fn(this._n)

          // restart if not canceled
          if (!churnHandle._onCancel) {
            churnHandle.runPeriodically(fn, period)
          }
        }, period)
      },
      cancel: async () => {
        // Not currently running a churn, can stop immediately
        if (churnHandle._timeoutId) {
          clearTimeout(churnHandle._timeoutId)
          return
        }

        // signal to stop
        churnHandle._onCancel = true
        return
      }
    }

    // TODO: period according to the param received
    churnHandle.runPeriodically(this._stopAndStart, 1000 / this._churnFactor)

    this._churnHandle = churnHandle
  }

  async _stopAndStart(n) {
    // Choose random peer to put
    const peerId = Math.floor(Math.random() * n)

    // stop daemon
    try {
      await execa.shell(`iptb stop ${peerId}`)
    } catch (err) {
      return
    }

    // Start the daemon
    let error
    do {
      error = false

      try {
        await execa.shell(`iptb start ${peerId} --wait -- --enable-dht-experiment`)
      } catch (err) {
        error = err // times out some times
      }
    } while (error)
  }

  async stop() {
    const churnHandle = this._churnHandle

    if (!churnHandle) {
      throw new Error('not running')
    }

    this._churnHandle = null
    await churnHandle.cancel()
  }
}


exports = module.exports = NetworkChurn
