'use strict'

const execa = require('execa')
const { intensiveLookup } = require('./lookup')
const { intensiveChurn } = require('./churn')

const setup = async (n) => {
  let out

  // Create iptb testbed with js-ipfs nodes
  await execa.shell(`iptb testbed create -count ${n} -type localipfs -force -attr binary,$(which jsipfs)`)
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
  for (let i = 1; i < n; i++) {
    await execa.shell(`iptb run ${i} -- ipfs config --json Bootstrap '["${addr}"]'`)
    // ipfs config --json Bootstrap '["/ip4/127.0.0.1/tcp/59163/ipfs/QmYEouqLdPepu5GiVL9LLxSByvophh8XaSq8wmrXWzupu6"]'
    await execa.shell(`iptb start ${i} --wait -- --enable-dht-experiment`)
    console.info(`node ${i} repo properly configured and node started`)
  }

  // Create ipfs executer
  const ipfsExec = async (peerId, cmd) => await execa.shell(`iptb run ${peerId} -- ipfs ${cmd}`)

  return ipfsExec
}

module.exports = {
  setupNetwork: setup,
  intensiveLookup,
  intensiveChurn
}
