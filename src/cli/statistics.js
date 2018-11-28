'use strict'

const statistics = require('../statistics')

module.exports = {
  command: 'statistics <filePath>',
  describe: 'Show dht simulation statistics',
  builder: {},
  handler(argv) {
    statistics.getFromFile(argv.filePath)
  }
}
