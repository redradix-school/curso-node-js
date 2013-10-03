// Utilidades generales

function bind(ctx, fn) {
  var oldargs = [].slice.call(arguments, 2);
  return function() {
    var newargs = [].slice.call(arguments);
    return fn.apply(ctx, oldargs.concat(newargs));
  };
}

function curry(fn) {
  var oldargs = [].slice.call(arguments, 1);
  return function() {
    var newargs = [].slice.call(arguments);
    return fn.apply(this, oldargs.concat(newargs));
  };
}

function augment(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function(source) {
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        target[prop] = source[prop];
      }
    }
  });
  return target;
}

function merge() {
  var sources = [].slice.call(arguments);
  return augment.apply(this, [{}].concat(sources));
}

function clone(orig) {
  function F() {}
  F.prototype = orig;
  return new F();
}

function pick(obj) {
  var keys = [].slice.call(arguments, 1),
      target = {};
  keys.forEach(function(key) {
    if (obj.hasOwnProperty(key)) target[key] = obj[key];
  });
  return target;
}

function omit(obj, props) {
  var result = merge(obj), p;
  while (p = props.pop()) delete result[p];
  return result;
}

function rand(a, b) {
  var top = b ? (b - a) : a,
      delta = b ? a : 0;
  return Math.floor(Math.random() * top + delta);
}

function randString(length, base) {
  length || (length = 10);
  base || (base = 36);
  return rand(Math.pow(base, length)).toString(base);
}

function keys(obj, inherited) {
  if (obj !== Object(obj)) throw new TypeError('Invalid object');
  var keys = [];
  for (var key in obj) if (inherited || obj.hasOwnProperty(key)) keys.push(key);
  return keys;
}

/* Iterators. The obvious are just for completion */

function isArray(e) {
  // I know this can be improved, but it's enough for now
  return e instanceof Array;
}

function isFunction(e) {
  return typeof e === "function"
}

function isString(e) {
  return typeof e === "string"
}

function objMap(obj, fn) {
  var result = {}
  for (var k in obj) if (obj.hasOwnProperty(k)) result[k] = fn.call(obj, k, obj[k]);
  return result;
}

function map(list, fn) {
  if (!isFunction(fn) && isString(fn)) fn = fn.f();
  if (!isArray(list)) return objMap(list, fn);
  var result = new Array(list.length);
  for (var i=0,_len=list.length; i<_len; i++) { result[i] = fn.call(list, list[i]); }
  return result;
}

function objReduce(obj, fn, acc) {
  for (var k in obj) if (obj.hasOwnProperty(k)) acc = fn.call(obj, k, obj[k], acc);
  return acc;
}

function reduce(list, fn, acc) {
  if (!isFunction(fn) && isString(fn)) fn = fn.f();
  if (!isArray(list)) return objReduce(list, fn, acc);
  if (!acc) {
    acc = list[0];
    list = list.slice(1);
  }
  for (var i=0,_len=list.length; i<_len; i++) { acc = fn.call(list, list[i], acc); }
  return acc;
}

function objEach(obj, fn) {
  for (var k in obj) if (obj.hasOwnProperty(k)) fn.call(obj, k, obj[k]);
}

function each(list, fn) {
  if (!isFunction(fn) && isString(fn)) fn = fn.f();
  if (!isArray(list)) return objEach(list, fn);
  for (var i=0,_len=list.length; i<_len; i++) { fn.call(list, list[i]); }
}

function uniq(list) {
  return list.filter(function (e, i, arr) {
    return arr.lastIndexOf(e) === i;
  });
}

/* apply constructor to arguments with new, like construct(MiClass, [1, 2, 3]) */
function construct(constructor, args) {
  function F() { return constructor.apply(this, args); }
  F.prototype = constructor.prototype
  return new F();
}

function value(vOrF, ctx) {
  if (isFunction(vOrF)) vOrF = vOrF.call(ctx || {})
  return vOrF
}

function rotright(arr) {
  var r = arr.slice();
  r.unshift(r.pop());
  return r;
}

function rotleft(arr) {
  var r = arr.slice();
  r.push(r.shift());
  return r;
}


var R = (function(my) {
  augment(my, {
    bind: bind,
    curry: curry,
    augment: augment,
    merge: merge,
    clone: clone,
    pick: pick,
    omit: omit,
    rand: rand,
    randString: randString,
    keys: keys,
    map: map,
    each: each,
    reduce: reduce,
    uniq: uniq,
    value: value,
    rotright: rotright,
    rotleft: rotleft
  });
  return my;
}(R || {}));

// Un par de aumentos por comodidad (cuidado con colisiones...)

String.prototype.format = function() {
  var args = [].slice.call(arguments),
      result = this.slice(),
      regexp;
  for (var i=args.length; i--;) {
    regexp = new RegExp("%"+(i+1), "g");
    result = result.replace(regexp, args[i]);
  }
  return result;
};

Number.prototype.times = function(p) {
  var cb = (typeof p === "function") ? p : function() { return p; };
  var result = [];
  for (var i=0, _times=this; i < _times; i++) result.push(cb(i));
  return result;
};

String.prototype.times = function(cb) {
  return parseInt(this, 10).times(cb);
};

String.prototype.f = function() {
  var code = this.replace(/\%(\d+)/g, "(arguments[parseInt($1, 10) - 1])"),
      statements = code.split(';'),
      last = statements.pop();
  if (!(/return/.test(last))) last = "return " + last;
  statements.push(last);
  return new Function(statements.join(';'));
};

if (Object.defineProperty) {
  Object.defineProperty(Object.prototype, "bind", {
    value: function(method) {
      var fn = this[method],
          args = [].slice.call(arguments, 1)
      console.log(method, fn)
      if (fn) return fn.bind.apply(fn, [this].concat(args));
      throw new Error("Obj no tiene método: " + method);
    },
    enumerable: false
  })
}

// Herencia clásica y mixins

var R = (function(my) {

  function mixin(target, source, options) {
    options || (options = {})
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        if (!target[prop] || options.force) { target[prop] = source[prop]; }
      }
    }
  }

  var Class = function() {};

  Class.include = function(m, options) {
    mixin(this, m, options);
    if (m.included) { m.included(this); }
  };
  Class.mixin = function(m, options) {
    mixin(this.prototype, m, options);
    if (m.mixed) { m.mixed(this); }
  };


  Class.extend = function(prop, staticProp) {
    var _super = this.prototype;

    function F() {}
    F.prototype = _super;
    var proto = new F();

    for (var name in prop) {
      if (typeof prop[name] === "function" &&
          typeof _super[name] === "function" &&
          prop[name].constructor === Function &&
          _super[name].constructor === Function ) {
        proto[name] = (function(name, fn) {
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);
            this._super = tmp;
            return ret;
          };
        }(name, prop[name]));
      } else {
        proto[name] = prop[name];
      }
    }

    function Klass() {
      if (this.init) return this.init.apply(this, arguments);
    }

    // Heredamos las propiedades de clase
    for (var classProp in this) {
      if (this.hasOwnProperty(classProp)) {
        Klass[classProp] = this[classProp];
      }
    }
    if (staticProp) {
      for (var classProp in staticProp) {
        if (staticProp.hasOwnProperty(classProp)) {
          Klass[classProp] = staticProp[classProp];
        }
      }
    }
    Klass.prototype = proto;
    Klass.prototype.constructor = Klass;

    return Klass;
  };

  // The global super-constructor, wich does
  // nothin gexcept being the top of the chain
  Class.prototype.init = function() { };

  my.Class = Class;

  return my;

}(R || {}));

// Herencia, con otro enfoque

var R = (function(my) {

  my.extend = function(sup, prop, staticProp) {
    prop || (prop = {});
    staticProp || (staticProp = {});
    var _super = sup.prototype,
        F = function(){ if (this.init) return this.init.apply(this,arguments); },
        proto = F.prototype = Object.create(_super)
    // el truco
    for (var k in prop) if (prop.hasOwnProperty(k)) {
      if (typeof prop[k] === "function" && typeof _super[k] === "function"
          && prop[k].constructor === Function && _super[k].constructor === Function) {
        proto[k] = (function(k, fn, supFn) {
          return function proxy() {
            if (this instanceof proxy) {
              return construct(fn, arguments);
            } else {
              var ret
              this._super = supFn
              ret = fn.apply(this, arguments)
              this._super = undefined
              return ret
            }
          };
        }(k, prop[k], _super[k]));
      } else {
        proto[k] = prop[k]
      }
    }
    // heredamos las propiedades de clase
    for (var classProp in sup) if (sup.hasOwnProperty(classProp)) {
      F[classProp] = sup[classProp];
    }
    for (var classProp in staticProp) if (staticProp.hasOwnProperty(classProp)) {
      F[classProp] = staticProp[classProp];
    }
    // burocracia
    F.prototype.constructor = F;
    F.prototype.superClass = sup;
    // utilidades
    F.mixin = R.Class.mixin;
    F.include = R.Class.include;
    F.extend = R.Class.extend;

    return F
  };

  return my

}(R || {}));

// Namespace

var R = (function(my) {
  my.namespace = function(string, sandbox) {
    var spaces = string.split('.'),
        root = this,
        space = spaces.shift();
    while (space) {
      root = root[space] || (root[space] = {});
      space = spaces.shift();
    }
    return sandbox(root);
  };
  return my;
}(R || {}));

// Templates

var R = (function (my) {

  my.Template = function(text) {
    var code = '%>' + text + '<%';
    code = code.replace(/[\n\r\t]/g,' ');
    code = code.replace(/\s+/g, ' ');
    code = code.replace(/##/g, '');  // Just for security
    code = code.replace(/<%=(.*?);?\s*%>/g, "##, $1, ##");
    code = code.replace(/%>(.*?)<%/g, "_t_.push(##$1##); ");
    code = code.replace(/##(.*?)##/g, function(_, str) {
      str = str.replace(/(['"])/g, '\\$1');
      return "'" + str + "'";
    });
    code = "var _t_ = [];" + code + "; return _t_.join('');";
    var fn = new Function('obj', code);
    return function(data) { return fn.call(data); };
  };

  my.Template.byId = function (id) {
    var el = document.getElementById(id);
    if (el) return my.Template(el.innerHTML);
  };

  return my;

})(R || {});


// Mixins

var R = (function (my) {

  // Observable

  my.Observable = {
    mixed: function(klass) {
      var klass_init = klass.prototype.init || function() {};
      klass.prototype.init = function() {
        this._subscribers = {};
        return klass_init.apply(this, arguments);
      };
    },
    on: function(event, callback, ctx) {
      if (typeof event != "string") {
        ctx = callback || {};
        this._onMany(event, ctx);
      } else {
        this._subscribers[event] || (this._subscribers[event] = []);
        this._subscribers[event].push({cb:callback, ctx: ctx || {}});
      }
    },
    _onMany: function(desc, ctx) {
      for (var key in desc) { this.on(key, desc[key], ctx); }
    },
    off: function(event, callback, ctx) {
      var events, subs;
      if (!event && !callback && !ctx) {
        return this._subscribers = {};
      }
      events = event ? [event] : R.keys(this._subscribers);
      for (var j=0, _len=events.length; j<_len; j++) {
        subs = this._subscribers[event];
        if (subs.length > 0) {
          for (var i=0; i<subs.length; i++) {
            if ((callback && ctx && subs[i].cb === callback && subs[i].ctx === ctx) ||
                (callback && !ctx && subs[i].cb === callback) ||
                (!callback && ctx && subs[i].ctx === ctx) ||
                (!callback && !ctx)) {
              subs.splice(i, 1);
            }
          }
          this._subscribers[event] = subs;
        }
      }
    },
    trigger: function(event) {
      var args = [].slice.call(arguments),
          eventArgs = args.slice(1),
          subscribers = this._subscribers[event] || [],
          subscribersToAll = this._subscribers['*'] || [];
      subscribers.forEach(function(sub){ sub.cb.apply(sub.ctx, eventArgs); });
      subscribersToAll.forEach(function(sub) { sub.cb.apply(sub.ctx, args); });
    }
  };


  // Mediable

  my.Mediable = {
    setMediator: function(mediator) {
      this._mediator = mediator;
    },
    notify: function(event) {
      return this._mediator.trigger.apply(this._mediator, arguments);
    }
  };

  return my;
}(R || {}));

// Mediator

var R = (function(my) {
  my.Mediator = R.Class.extend({
    init: function(desc) {
      if (desc) desc.call({}, this);
    },
    add: function() {
      var elems = [].slice.call(arguments);
      elems.forEach(bind(this, function(e) {
        if (e.setMediator) e.setMediator(this);
      }));
    }
  });
  my.Mediator.mixin(R.Observable);

  return my;
}(R || {}));

/* CommonJS exports */

try {
  if (exports) { augment(exports, R); }
} catch (e) {}
