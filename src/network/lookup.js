'use strict'

const intensiveLookup = async (ipfsExec, n, factor, iterations) => {
  let out
  // Map with key and value
  const data = {}

  // Run the number of times provided
  let i = 0
  do {
    // Choose random key and value to put
    const key = `key${Math.floor(Math.random() * (n * factor))}`
    const value = Math.random().toString(36).substring(7)

    // Choose random peer to put
    const peerId = Math.floor(Math.random() * n)

    // Put data
    await ipfsExec(peerId, `dht put ${key} ${value}`)
    // await execa.shell(`iptb run ${peerId} -- ipfs dht put ${key} ${value}`)
    data[key] = value

    // Choose random key to get
    const keyToGet = `key${Math.floor(Math.random() * (n * factor))}`

    // Check if we have previous put that key
    if (data[keyToGet]) {
      // Get to the DHT
      out = await ipfsExec(peerId, `dht get ${key}`)
      // out = await execa.shell(`iptb run ${peerId} -- ipfs dht get ${key}`)
      console.log('out', i, out.stdout, out.stdout.includes(data[key]))
    }

    i++
  } while (i < iterations)
}

module.exports = {
  intensiveLookup
}
