var debug = require('debug')('libkv:store:base')
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
module.exports = Store

Store.prototype.get = function StoreGetNoop() {}
Store.prototype.getValue = function StoreGetValueNoop() {}
Store.prototype.getMetadata = function StoreGetMetadataNoop() {}

Store.prototype.set = function StoreSetNoop() {}
Store.prototype.put = Store.prototype.set

Store.prototype.delete = function StoreDeleteNoop() {}
Store.prototype.del = Store.prototype.delete
Store.prototype.remove = Store.prototype.delete

Store.prototype.exists = function StoreExistsNoop() {}
Store.prototype.watch = function StoreWatchNoop() {}

Store.prototype.close = function StoreCloseNoop(callback) {
  if (typeof callback != 'function') {
    callback = function StoreCloseCallbackNoop() {}
  }
  
  callback()
}

Store.prototype.normalize = function Normalize(key) {
  return '/' + SplitKey(key).join('/')
}


function SplitKey(key) {
  if (key.indexOf('/') >= 0) {
    path = key.split('/')
  }
  else {
    path = [ key ]
  }
  
  return path
}
