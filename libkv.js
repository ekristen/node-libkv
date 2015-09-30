var initializers = {
  'consul': require('./store/consul.js'),
  'etcd': require('./store/etcd.js'),
  'level': require('./store/level.js'),
  'redis': require('./store/redis.js'),
  'zookeeper': require('./store/zookeeper.js')
}

var NewStore = function(backend, options) {
  if (typeof initializers[backend] !== 'undefined') {
    return new initializers[backend](options)
  }

  throw new Error('unsupported backend')
}

module.exports = NewStore
