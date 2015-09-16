var util = require('util')
var Store = require('./index')

var Redis = function Redis(endpoints, options) {
  Redis.super_.apply(this, arguments)

  if (this.uri.protocol != 'redis:') {
    throw new Error('unexpected uri format', this.href)
  }

  if (this.uri.port == null) {
    this.uri.port = 6379
  }

  this.redis = require('redis').createClient(this.uri.port, this.uri.host)

  var self = this;
  [ 'error', 'ready', 'connect' ].forEach(function(ev) {
    self.redis.on(ev, self.emit.bind(self, ev))
  })

  return this
}
util.inherits(Redis, Store)
module.exports = Redis

Redis.prototype.get = function RedisGet(key, callback) {
  this.redis.get(key, callback)
}

Redis.prototype.set = function RedisSet(key, value, callback) {
  this.redis.set(key, value, function(err, status) {
    callback(err, status == 'OK' ? true : false)
  })    
}
Redis.prototype.put = Redis.prototype.set

Redis.prototype.delete = function RedisDelete(key, callback) {
  this.redis.del(key, function(err, status) {
    callback(err, status ? true : false)
  })
}

Redis.prototype.exists = function RedisExists(key, callback) {
  this.redis.exists(key, function(err, status) {
    callback(err, status ? true : false)
  })
}

Redis.prototype.close = function RedisClose(callback) {
  if (typeof callback != 'function') {
    callback = function RedisCloseNoop() {}
  }

  this.redis.quit(callback)
}
