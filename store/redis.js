var debug = require('debug')('libkv:store:redis')
var util = require('util')
var Store = require('./index')
var NotFoundError = require('./error')

var Redis = function Redis(endpoints, options) {
  Redis.super_.apply(this, arguments)

  if (this.uri.protocol != 'redis:') {
    throw new Error('unexpected uri format', this.href)
  }

  if (this.uri.host == '') {
    this.uri.host = '127.0.0.1'
  }

  if (this.uri.port == null) {
    this.uri.port = 6379
  }

  this.store = require('redis').createClient(this.uri.port, this.uri.host)

  var self = this;
  [ 'error', 'ready', 'connect' ].forEach(function(ev) {
    self.store.on(ev, self.emit.bind(self, ev))
  })

  self.store.on('connect', function() {
    debug('connected', {host: self.uri.host, port: self.uri.port})
  })

  return this
}
util.inherits(Redis, Store)
module.exports = Redis

Redis.prototype.get = function RedisGet(key, callback) {
  debug('get - key: %s', this.normalize(key))
  this.store.get(this.normalize(key), function(err, value) {
    if (err == null && value == null) {
      return callback(new NotFoundError())
    }

    if (err) {
      debug('get - error: %j', err)
      return callback(err)
    }

    var pair = {
      Key: key,
      Value: value
    }

    debug('get - pair: %j', pair)

    callback(null, pair)
  })
}

Redis.prototype.set = function RedisSet(key, value, options, callback) {
  var self = this

  if (typeof options == 'function') {
    callback = options
    options = {}
  }

  debug('set - key: %s, value: %s', this.normalize(key), value)
  self.store.set(this.normalize(key), value, function(err, status) {
    if (err) {
      debug('set - error: %j', err)
      return callback(err, false)
    }

    debug('set - status: %s', status)
    callback(null, status == 'OK' ? true : false)
  })    
}
Redis.prototype.put = Redis.prototype.set

Redis.prototype.delete = function RedisDelete(key, callback) {
  debug('delete - key: %s', this.normalize(key))
  this.store.del(this.normalize(key), function(err, status) {
    callback(err, status ? true : false)
  })
}

Redis.prototype.exists = function RedisExists(key, callback) {
  debug('exists - key: %s', this.normalize(key))
  this.store.exists(this.normalize(key), function(err, status) {
    callback(err, status ? true : false)
  })
}

Redis.prototype.close = function RedisClose(callback) {
  if (typeof callback != 'function') {
    callback = function RedisCloseNoop() {}
  }

  debug('close')

  this.store.quit(callback)
}

Redis.prototype.normalize = function RedisNormalize(key) {
  return Store.prototype.normalize.call(this, key).substr(1)
}
