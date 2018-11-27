'use strict'

const lookup = async (ipfsExec, n, factor, iterations) => {
  let out
  let analysis = {
    putFailError: 0,
    putFailOffline: 0,
    getFailError: 0,
    getFailOffline: 0,
    getFailExpected: 0
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

    // Put data
    out = await ipfsExec(peerId, `dht put ${key} ${value}`)
    if (out.stderr) {
      analysis.putFailError = analysis.putFailError + 1
    } else if (out.stdout.includes('this command must be run in online mode')) {
      analysis.putFailOffline = analysis.putFailOffline + 1
    } else {
      data[key] = value
    }

    // Choose random key to get
    const keyToGet = `key${Math.floor(Math.random() * (n / factor))}`

    // Check if we have previous put that key
    if (data[keyToGet]) {
      // Get to the DHT
      out = await ipfsExec(peerId, `dht get ${key}`)

      if (out.stderr) {
        analysis.getFailError = analysis.getFailError + 1
      } else if (out.stdout.includes('this command must be run in online mode')) {
        analysis.getFailOffline = analysis.getFailOffline + 1
      } else if (!out.stdout.includes(data[key])) {
        analysis.getFailExpected = analysis.getFailExpected + 1
      }
    }

    i++
  } while (i < iterations)
  return analysis
}

module.exports = {
  lookup
}
