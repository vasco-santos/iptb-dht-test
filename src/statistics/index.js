'use strict'

const fs = require('fs')
const { print } = require('../utils')

const _average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length

const _stats = (data) => {
  print('\n--- FINAL ANALYSIS ---\n')

  print(`Implementation: ${data.implementation}\n`)

  print('INPUTS: \n')
  print(`- Iterations: ${data.inputs.i}`)
  print(`- Nodes: ${data.inputs.n}`)
  print(`- Lookup factor: ${data.inputs.lf}`)
  print(`- Churn factor: ${data.inputs.cf}`)

  print('\nRESULTS: \n')

  print('- PUT:')
  print(`\t- Round trip time: ${_average(data.results.put.rtt)} ms`)
  print(`\t- failed error: ${data.results.put.failError}`)
  print(`\t- failed offline: ${data.results.put.failOffline}`)

  print('- GET:')
  print(`\t- Round trip time: ${_average(data.results.get.rtt)} ms`)
  print(`\t- failed error: ${data.results.get.failError}`)
  print(`\t- failed offline: ${data.results.get.failOffline}`)
  print(`\t- failed expected value (not synec): ${data.results.get.failExpected}`)
}

module.exports = {
  get: (data) => {
    _stats(data)
  },
  getFromFile: (path) => {
    fs.readFile(`${process.cwd()}${path}`, 'utf8', (err, data) => {
      if (err) {
        console.log('error getting file') // TODO DEBUG
        return
      }
      _stats(JSON.parse(data))
    })
  }
}
