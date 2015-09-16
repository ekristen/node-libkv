var test = require('tape')
var libkv = require('./libkv')
var async = require('async')

var backends = [
  'consul',
  'redis',
  'etcd'
]

var configs = {
  redis: {
    uri: 'redis://127.0.0.1'
  },
  consul: {
    uri: 'consul://192.168.1.152'
  },
  etcd: {
    uri: 'etcd://127.0.0.1'
  }
}

var tests = {
  set: function(client, test, callback) {
    client.set('one', 'two', function(err, result) {
      test.ok(!err, 'no error')
      test.equal(result, true)
  
      client.close(test.end.bind(null))
  
      callback()
    })
  },
  get: function(client, test, callback) {
    client.set('one', 'two', function(err, result) {
      client.get('one', function(err, res) {
        test.ok(!err, 'no error')
        test.equal(res, 'two')

        client.close(test.end.bind(null))
        
        callback()
      })
    })
  },
  delete: function(client, test, callback) {
    client.set('two', 'one', function(err, res) {
      test.ok(!err, 'no error')
      client.delete('two', function(err, status) {
        test.ok(!err, 'no error')
        test.equal(status, true)
        
        client.close(test.end.bind(null))
        
        callback()
      })
    })
  },
  exists: function(client, test, callback) {
    client.set('three', 'one', function(err, status1) {
      test.ok(!err, 'no error')

      client.exists('three', function(err, status2) {
        test.ok(!err, 'no error')
        test.equal(status2, true)

        client.exists('four', function(err, status3) {

          test.ok(!err, 'no error')
          test.equal(status3, false)

          client.close(test.end.bind(null))

          callback()
        })
      })
    })
  }
}

async.eachSeries(backends, function(backend, backendCallback) {

  async.eachSeries(Object.keys(tests), function(func, testCallback) {
    var testName = backend + '#' + func
    
    test(testName, function(t) {
      var client = libkv(backend, configs[backend])

      tests[func].call(null, client, t, testCallback)
    })
  }, backendCallback)
  
}, function(err) {

})

/*
test('redis#set', function(t) {

  var redis = libkv('redis', {
    uri: 'redis://192.168.1.55'
  })

  redis.set('one', 'two', function(err, result) {
    t.ok(!err)
    t.equal(result, 'OK')
    
    redis.redis.quit(t.end.bind(null))
  })
})

test('redis#put', function(t) {

  var redis = libkv('redis', {
    uri: 'redis://192.168.1.55'
  })

  redis.set('one', 'two', function(err, result) {
    t.ok(!err)
    t.equal(result, 'OK')
    
    redis.redis.quit(t.end.bind(null))
  })
})

test('redis#get', function(t) {
  var redis = libkv('redis', {
    uri: 'redis://192.168.1.55'
  })

  redis.get('one', function(err, result) {
    t.ok(!err)
    t.equal(result, 'two')

    redis.redis.quit(t.end.bind(null))
  })
})

*/
