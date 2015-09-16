var url = require('url')
var util = require('util')
var events = require('events')

function Store(options) {

  if (typeof options.uri != 'undefined') {
    this.uri = url.parse(options.uri)
  }
  
  this.options = options
}
util.inherits(Store, events.EventEmitter)

Store.prototype.put = function putNoop() {}
Store.prototype.get = function getNoop() {}
Store.prototype.delete = function deleteNoop() {}
Store.prototype.exists = function existsNoop() {}
Store.prototype.watch = function watchNoop() {}
Store.prototype.list = function listNoop() {}
Store.prototype.close = function closeNoop(callback) {
  if (typeof callback != 'function') {
    callback = function StoreCloseNoop() {}
  }
  
  callback()
}

module.exports = Store
