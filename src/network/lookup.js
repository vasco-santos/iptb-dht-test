'use strict'

const lookup = async (ipfsExec, n, waitTime, factor, iterations) => {
  let out
  let analysis = {
    put: {
      failError: 0,
      failOffline: 0,
      rtt: []
    },
    get: {
      failError: 0,
      failOffline: 0,
      failExpected: 0,
      rtt: []
    }
  }

  // Map with key and value
  const data = {}

  // Run the number of times provided
  let i = 0
  do {
    // Choose random key and value to put
    const key = `key${Math.floor(Math.random() * (n / factor))}`
    const value = Math.random().toString(36).substring(7)

    // Choose random peer to put
    const peerId = Math.floor(Math.random() * n)
    const putStart = (new Date).getTime()

    // Put data
    out = await ipfsExec(peerId, `dht put ${key} ${value}`)

    // Store rtt
    analysis.put.rtt.push((new Date).getTime() - putStart)

    if (out.stderr) {
      analysis.put.failError = analysis.put.failError + 1
    } else if (out.stdout.includes('this command must be run in online mode')) {
      analysis.put.failOffline = analysis.put.failOffline + 1
    } else {
      data[key] = value
    }

    // Choose random key to get
    const keyToGet = `key${Math.floor(Math.random() * (n / factor))}`

    // Check if we have previous put that key
    if (data[keyToGet]) {
      const tid = setTimeout(async () => {
        const getStart = (new Date).getTime()
        // Get to the DHT
        out = await ipfsExec(peerId, `dht get ${key}`)

        analysis.get.rtt.push((new Date).getTime() - getStart)
        if (out.stderr) {
          analysis.get.failError = analysis.get.failError + 1
        } else if (out.stdout.includes('this command must be run in online mode')) {
          analysis.get.failOffline = analysis.get.failOffline + 1
        } else if (!out.stdout.includes(data[key])) {
          analysis.get.failExpected = analysis.get.failExpected + 1
        }
        clearTimeout(tid)
      }, waitTime)
    }

    i++
  } while (i < iterations)
  return analysis
}

module.exports = {
  lookup
}
