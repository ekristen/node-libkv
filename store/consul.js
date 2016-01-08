var debug = require('debug')('libkv:store:consul')
var util = require('util')
var xtend = require('xtend')
var clone = require('clone')
var Store = require('./index')
var NotFoundError = require('./error')
var EventEmitter = require("events").EventEmitter;

var Consul = function Consul(options) {
  Consul.super_.apply(this, arguments)

  if (this.uri.protocol != 'consul:') {
    throw new Error('unexpected uri format', this.href)
  }

  if (this.uri.hostname == '') {
    this.uri.hostname = '127.0.0.1'
  }

  if (this.uri.port == null) {
    this.uri.port = 8500
  }

  this._supportsTTL = false

  this.options.host = this.uri.hostname
  this.options.port = this.uri.port
  
  this.consul = require('consul')(clone(this.options) || {})

  debug('connect')
  
  return this
}
util.inherits(Consul, Store)
module.exports = Consul

Consul.prototype.get = function ConsulGet(key, options, callback) {
  var self = this

  debug('get - key: %s', this.normalize(key))

  if (typeof options == 'function') {
    callback = options
    options = {}
  }

  var opts = xtend({
    Key: this.normalize(key)
  }, options)
  
  this.consul.kv.get(opts, function(err, data, res) {
    if (err) {
      debug('get - error: %j', err)
      return callback(err)
    }

    if (typeof data == 'undefined' || data == null || res.statusCode == 404) {
      return callback(new NotFoundError())
    }

    var pair = {
      Key: data.Key,
      Value: data.Value,
      Metadata: data
    }

    delete pair.Metadata.Key
    delete pair.Metadata.Value

    debug('get - pair: %j', pair)

    if (self.options.valueOnly) {
      return callback(null, pair.Value)
    }

    callback(null, pair)
  })
}

Consul.prototype.set = function ConsulSet(key, value, options, callback) {
  debug('set - key: %s, value: %s', this.normalize(key), value)
  debug('set - options: %j', options)

  if (typeof options == 'function') {
    callback = options
    options = {}
  }

  var opts = xtend({
    Key: this.normalize(key),
    Value: value
  }, options)

  this.consul.kv.set(opts, function(err, status, res) {
    if (err) {
      debug('set - error: %j', err)
      return callback(err, status, res)
    }
    
    return callback(null, status, res)
  })
}
Consul.prototype.put = Consul.prototype.set

Consul.prototype.delete = function ConsulDelete(key, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options = {}
  }

  var opts = xtend({
    Key: this.normalize(key)
  }, options)

  this.consul.kv.del(opts, function(err) {
    callback(err, err ? false : true)
  })
}
Consul.prototype.del = Consul.prototype.delete

Consul.prototype.exists = function ConsulExists(key, callback) {
  debug('exists - key: %s', this.normalize(key))
  this.consul.kv.get(this.normalize(key), function(err, data, res) {
    if (err) {
      return callback(err)
    }

    if (data == null) {
      return callback(null, false)
    }
    
    return callback(null, true)
  })
}

Consul.prototype.watch = function ConsulWatch(key) {
  var self = this

  var watcher = new EventEmitter()

  var opts = {
    method: self.consul.kv.keys,
    options: {
      key: key
    }
  }
  
  debug('watch - opts: %j', opts)

  self.consul.watch(opts)
    .on('change', function(data, res) {
      data.forEach(function(key) {
        self.get(key, function(err, data, res) {
          if (!err) {
            watcher.emit('change', key, data)
          }
        })
      })
    })
    .on('error', function(err) {
      watcher.emit('error', err)
    })

  return watcher
}

Consul.prototype.normalize = function ConsulNormalize(key) {
  return Store.prototype.normalize.call(this, key).substr(1)
}
