'use strict'

exports.print = (msg, newline) => {
  if (newline === undefined) {
    newline = true
  }

  if (msg === undefined) {
    msg = ''
  }
  msg = newline ? msg + '\n' : msg
  process.stdout.write(msg)
}
