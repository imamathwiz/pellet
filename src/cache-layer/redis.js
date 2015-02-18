var redis = require('redis')
  , utils = require('../utils');

function redisCacheLayer(config, instrument, cb) {
  if(instrument) {
    this.instrument = instrument.namespace('cache-layer.redis');
  }

  this.prefix = config.database.prefix || '';

  this.client = redis.createClient(config.port, config.host, config.options);
  if(config.password) {
    this.client.auth(config.password, function(err) {
      if(err) {
        console.error('Error in signing in the redis cache layer because:', err.message||err);
      }
    });
  }

  if(config.database) {
    this.client.select(config.database);
  }

  /*
  this.client.on('ready', function() {
    if(instrument) {
      instrument.increment("ready");
    }

    console.info('Redis cache layer [ready]');
    if(cb) {
      cb(null);
    }
  });

  this.client.on('error', function(err) {
    if(instrument) {
      instrument.increment("error");
    }

    console.error('Error in redis cache layer because:', err.message||err);
  });

  this.client.on('connect', function() {
    if(instrument) {
      instrument.increment("connect");
    }

    console.info('Redis cache layer [connect]');
  });

  this.client.on('end', function() {
    if(instrument) {
      instrument.increment("end");
    }

    console.info('Redis cache layer [end]');
  });

  this.client.on('drain', function() {
    if(instrument) {
      instrument.increment("drain");
    }

    console.info('Redis cache layer [drain]');
  });

  this.client.on('idle', function() {
    if(instrument) {
      instrument.increment("idle");
    }

    console.info('Redis cache layer [idle]');
  });
  */
}

redisCacheLayer.prototype.get = function(key, cb) {
  var _this = this;

  if(this.instrument) {
    var start = process.hrtime();
  }

  this.client.get(this.prefix + utils.djb2(key).toString(32), function(err, value) {
    if(err) {
      cb(err);
      return;
    }

    if(!value) {
      if(_this.instrument) {
        _this.instrument.increment('miss');
      }

      cb(null, null, null);
    } else {
      value = JSON.parse(value);

      if(_this.instrument) {
        var end = process.hrtime();
        _this.instrument.timing('get', (((end[0]-start[0])*1e9) + (end[1]-start[1]))/1e6);
        _this.instrument.increment('hit');
      }

      cb(null, value.data, value.meta);
    }
  });
}

redisCacheLayer.prototype.set = function(key, data, cb) {
  if(this.instrument) {
    this.instrument.increment('update');
  }

  data = JSON.stringify({
    data: data,
    meta: {
      lastModified: Date.now()
    }
  });

  this.client.set(this.prefix + utils.djb2(key).toString(32), data, cb);
}

module.exports = redisCacheLayer;
