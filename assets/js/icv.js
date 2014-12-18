(function () {

window.$icv = {};

$icv.version = '0.1.0';

$icv.Instance = Instance;

/**
 *
 * @param opt {Object} with the following values: { (REQUIRED) containerId: 'domElementId', theme: 'themeName', bindKeyShortcuts: boolean }.
 *
 * @returns {Instance}
 * @constructor
 */
function Instance (opt) {
  var self = this;
  if (!(self instanceof Instance)) return new Instance(opt || {});

  self._opt = $.extend(true, {}, { "theme": null, "bindKeyShortcuts": true }, opt || {});
  self._graph = false;
}

Instance.prototype.initialize = function () {
  var self = this;

  self._graph = new $icv.Graph(self.getOption('containerId'), self.getOption('theme') || null);
};

Instance.prototype.load = function (json, callback) {
  var self = this;

  callback = callback || function () {};

  self._graph.load(json, function() {
    if (self.getOption('bindKeyShortcuts') || false) {
      self._graph.bindKeyShortcuts();
    }

    $icv.bindUIEvents(self._graph);

    self._graph.centerNodeFromHash();
    callback();
  });
};

Instance.prototype.getOption = function (optionName) {
  return this._opt[optionName] || null;
};



$icv.Graph = function (container_id, force_theme) {
  var self = this;
  if (!(self instanceof $icv.Graph)) return new $icv.Graph(container_id, force_theme);

  self._container = container_id;
  self._busy = false;
  self._preventNextClick = false;
  self._mouseDragStartAt = { x: 0, y: 0 };
  self._json = {};

  self._zoomId = false;
  self._rootId = false;


  var labelType, useGradients, nativeTextSupport, animate,
    container = $('#' + self._container),
    theme = force_theme || container.data('theme') || 'default';

  container.addClass('icv-theme-' + theme);
  self._generator = new $icv.Generator(theme);

  self._stickBackgroundImage = self._generator.getConfig('stickBackgroundImage') || false;

  /** @constructs */
  (function () {
    var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
    //I'm setting this based on the fact that ExCanvas provides text support for IE
    //and that as of today iPhone/iPad current text support is lame
    labelType = (!nativeCanvasSupport || (textSupport && !iStuff)) ? 'Native' : 'HTML';
    nativeTextSupport = labelType == 'Native';
    useGradients = nativeCanvasSupport;
    animate = !(iStuff || !nativeCanvasSupport);

  })();

  $(window).on('hashchange', function() {
    if (self.getGenerator().getConfig('centerNodeOnHashChange')) {
      self.centerNodeFromHash();
    }
  });

  self.rgraph = new $jit.RGraph({
    //Where to append the visualization
    injectInto: self._container,
    levelDistance: 200,
    interpolation: 'polar',
    //concentric circles.
    background: {
      CanvasStyles: {
        strokeStyle: 'transparent'
      }
    },
    //Add navigation capabilities:
    //zooming by scrolling and panning.
    Navigation: {
      enable: true,
      type: 'auto',
      panning: true,
      zooming: 10
    },
    //Set Node and Edge styles.
    Node: self.getGenerator().getNodeTypeFor('default', null, {
      overridable: true,
      type: 'custom'
    }),
    Edge: {
      overridable: true,
      type: 'custom',
      //color: '#4e7844',
      color: '#ffffff',
      lineWidth: 2
    },

    Tips: {
      enable: false,
      type: 'Native',
      offsetX: 10,
      offsetY: 10,
      onShow: function(tip, node) {
        tip.innerHTML = node.name;
      }
    },

    Events: {
      enable: true,
      type: self.getGenerator().getConfig('nativeEvents') ? 'Native' : 'auto',
      onMouseEnter: function (node, eventInfo, e) {
        if (self.getGenerator().getConfig('nativeEvents')) {

          if (self.isBusy()) {
            $jit.util.event.stop(e);
          } else {
            node.setData('state', 'open');
            self._mouseEnterOnNode(self.getNodeElement(node.id), node, function (err) {

            });
          }
        }
      },
      onMouseLeave: function (node, eventInfo, e) {
        if (self.getGenerator().getConfig('nativeEvents')) {

          if (self.isBusy()) {
            $jit.util.event.stop(e);
          } else {
            if (self.rgraph.root != node.id) {
              node.setData('state', 'normal');
              self._mouseLeaveOnNode(self.getNodeElement(node.id), node, function (err) {

              });
            }
          }
        }
      },
      onDragEnd: function(node, eventInfo, e){
        $jit.util.event.stop(e);
        if (Math.abs(self._mouseDragStartAt.x - e.x) + Math.abs(self._mouseDragStartAt.y - e.y) > 20) {
          self._preventNextClick = true;
        }
      },
      onDragStart: function(node, eventInfo, e){
        $jit.util.event.stop(e);
        self._mouseDragStartAt = { x: e.x, y: e.y };
      }
    },

    //Add the name of the node in the correponding label
    //and a click handler to move the graph.
    //This method is called once, on label creation.
    onCreateLabel: function (domElement, node) {

      self.getGenerator().buildNodeElement(domElement, node);

      node.setData('state', 'normal');

      domElement.onclick = function () {

        if (self._preventNextClick) {
          self._preventNextClick = false;
        } else {

          var nodeType = self.getGenerator().getNodeTypeFor(
            node.data.type || null,
            { state: node.getData('state') || 'normal' }
          );

          if (nodeType.extended && nodeType.extended.centerOnClick) {
            self.setRootNode(node);
          }
        }
      };

      domElement.onmouseenter = function (e) {
        if (!self.getGenerator().getConfig('nativeEvents')) {
          if (self.isBusy()) {
            $jit.util.event.stop(e);
          } else {
            node.setData('state', 'open');
            self._mouseEnterOnNode(domElement, node, function (err) {

            });
          }
        }
      };

      domElement.onmouseleave = function (e) {
        if (!self.getGenerator().getConfig('nativeEvents')) {
          if (self.isBusy()) {
            $jit.util.event.stop(e);
          } else {
            if (self.rgraph.root != node.id) {
              node.setData('state', 'normal');
              self._mouseLeaveOnNode(domElement, node, function (err) {

              });
            }
          }
        }
      };

    },

    //Change some label dom properties.
    //This method is called each time a label is plotted.
    onPlaceLabel: function (domElement, node) {
      var style = domElement.style;

      var left = parseInt(style.left);
      var top = parseInt(style.top);
      var w = domElement.offsetWidth;
      var h = domElement.offsetHeight;
      style.left = (left - w / 2) + 'px';
      style.top = (top - h / 2) + 'px';
    },
    onBeforePlotLine: function(adj) {

      if (self._stickBackgroundImage) {
        var bg_w = 260, bg_h = 260, background_pos_x = 30, background_pos_y = 30;
        var x = self.rgraph.canvas.translateOffsetX,
          y = self.rgraph.canvas.translateOffsetY,
          modScaleX = (((bg_w * self.rgraph.canvas.scaleOffsetX) * background_pos_x) / bg_w) - background_pos_x,
          modScaleY = (((bg_h * self.rgraph.canvas.scaleOffsetY) * background_pos_y) / bg_h) - background_pos_y;

        var canvas_size = self.rgraph.canvas.getSize();
        var pos = '' + ((canvas_size.width / 2) + x + background_pos_x + modScaleX) + 'px ' + ((canvas_size.height / 2) + y + background_pos_y + modScaleY) + 'px';
        var container = $('#'+self._container);

        if (container.css('background-position') != pos) {
          container.css('background-position', pos);
        }
      }
    }
  });

  self.rgraph._owner = self;
}

$icv.Graph.prototype.load = function (json, callback) {
  var self = this

  callback = callback || function () {};

  self.setBusy(true);
  //load JSON data
  self.rgraph.loadJSON(json);
  self._json = json;
  //trigger small animation
  self.rgraph.graph.eachNode(function(n) {
    var pos = n.getPos();
    pos.setc(-200, -200);
  });
  self.rgraph.compute('end');
  self.rgraph.fx.animate({
    modes:['polar'],
    duration: 1000,
    onComplete: function() {
      self._zoomId = self.rgraph.root;
      //automatically open root node
      var rootNodeDomElement = $('#' + self._container + ' #' + self.rgraph.root + '.node').first();

      if (rootNodeDomElement.length) {
        self._mouseEnterOnNode(rootNodeDomElement, self.rgraph.graph.getNode(self.rgraph.root), function () {
          self.setBusy(false);
          callback(null, {});
        })
      }
    }
  });
};

$icv.Graph.prototype.morph = function (id, callback) {
  var self = this,
    node = self.getNode(id);

  callback = callback || function () {};

  if (!(node || false)) {
    self._morph(id, function () {
      callback();
    })
  } else {
    self.setRootNode(node, function () {
      self._morph(id, callback);
    });
  }

};

$icv.Graph.prototype._morph = function (id, callback) {
  var self = this;

  self.setBusy(true);
  //get graph to morph to.
  var subGraph = (id == self._json.id) ? self._json : self.recursiveGetTree(self._json, id);

  //perform morphing animation.
  self.rgraph.op.morph(subGraph, {
    type: 'fade:con',
    fps: 40,
    duration: 3000,
    hideLabels: false,
    onComplete: function () {
      self.setBusy(false);
      self._zoomId = id;
      callback();
    }
  });

};

$icv.Graph.prototype.recursiveGetTree = function (json, id) {
  var self = this, found = false;

  for (var i = 0; i < json.children.length; ++i) {
    var child = json.children[i];
    if (child.id == id) {
      return child;
    } else {
      if (child.children.length) {
        found = self.recursiveGetTree(child, id);
        if (found) {
          return found;
        }
      }
    }
  }

  return false;
};

$icv.Graph.prototype.isBusy = function () {
  return this._busy;
};

$icv.Graph.prototype.setBusy = function (busy) {
  this._busy = !!(busy || false);
};

$icv.Graph.prototype.getGenerator = function () {
  return this._generator;
};

$icv.Graph.prototype._mouseEnterOnNode = function (domElement, node, callback) {
  var self = this;

  callback = callback || function () {};

  if ($(domElement).hasClass('open')) {
    return callback(true);
  } else {
    $(domElement).addClass('working in').promise().done(function () {
      var nodeType = self.getGenerator().getNodeTypeFor(node.data.type || null, {state: 'open'}),
        dim = (nodeType.extended && nodeType.extended.dim) ? nodeType.extended.dim(node) : nodeType.dim || node.getData('dim');



      node.setData('dim', node.getData('dim'), 'start');
      node.setData('dim', dim, 'end');

      if (!(node.data._eventHandler || false)) {
        node.data._eventHandler = new $icv.EventHandler(domElement, node);
      }

      self.rgraph.fx.animate({
        modes: ['node-property:dim'],
        duration: 500,
        transition: $jit.Trans.Bounce.easeIn,
        onComplete: node.data._eventHandler.mouseEnterOnNode(500, function () {

          $(domElement).addClass('open').removeClass('working in').promise().done(function () {
            self.rgraph.plot();

            $('.tooltip').tooltipster({
              trigger: 'click',
              interactive: true,
              contentAsHTML: true,
              animation: 'grow',
              minWidth: 100,
              maxWidth: 300,
              position: 'right'
            });    //TODO: maybe its not required here but after loading json
            callback(false);
          });
        }, function () {
          //callback on break
          $(domElement).removeClass('open in');
          callback(true);
        })
      });
    });
  }
};

$icv.Graph.prototype._mouseLeaveOnNode = function (domElement, node, callback) {
  var self = this;

  $(domElement).addClass('working out').promise().done(function () {
    var nodeType = self.getGenerator().getNodeTypeFor(node.data.type || null),
      dim = (nodeType.extended && nodeType.extended.dim) ? nodeType.extended.dim(node) : nodeType.dim || node.getData('dim');

    callback = callback || function () {};
    $(domElement).removeClass('open');

    node.setData('dim', node.getData('dim'), 'start');
    node.setData('dim', dim, 'end');

    if (!(node.data._eventHandler || false)) {
      console.debug("node.data._eventHandler should exist!");
      node.data._eventHandler = new $icv.EventHandler(domElement, node);
    }

    self.rgraph.fx.animate({
      modes: ['node-property:dim'],
      duration: 500,
      transition: $jit.Trans.Bounce.easeOut,
      onComplete: node.data._eventHandler.mouseLeaveOnNode(500, function () {
        $(domElement).removeClass('working out').promise().done(function () {
          callback(false);
        });
      })
    });
  });
};

$icv.Graph.prototype.animatedCanvasTranslate = function (duration, callback) {
  var self = this;

  var x = self.rgraph.canvas.translateOffsetX * -1;
  var y = self.rgraph.canvas.translateOffsetY * -1;
  duration = duration || 1000;
  var rounds = (duration / 1000) * 50;
  var xpf = x / rounds;
  var ypf = y / rounds;
  callback = callback || function () {};

  var timer = setInterval(function () {
    self.rgraph.canvas.translate(xpf, ypf);
    if (--rounds == 0) {
      clearInterval(timer);
      timer = 0;
      return callback();
    }
  }, 20); //25ms == 40fps, 20ms == 50fps

};

$icv.Graph.prototype.bindKeyShortcuts = function () {
  var self = this,
    up = false,
    down = false,
    right = false,
    left = false;

  //Zoom
  Mousetrap.bind('pageup', function() {
    self.zoom(15);
  });

  Mousetrap.bind('pagedown', function() {
    self.zoom(-15);
  });

  //Arrow keys
  Mousetrap.bind('left', function(e, combo) {
    left = true;
    self.pan(up, right, down, left);
    return true;
  }, 'keydown');
  Mousetrap.bind('left', function(e, combo) {
    left = false;
    self.pan(up, right, down, left);
    return true;
  }, 'keyup');
  Mousetrap.bind('right', function(e, combo) {
    right = true;
    self.pan(up, right, down, left);
    return true;
  }, 'keydown');
  Mousetrap.bind('right', function(e, combo) {
    right = false;
    self.pan(up, right, down, left);
    return true;
  }, 'keyup');

  Mousetrap.bind('up', function(e, combo) {
    up = true;
    self.pan(up, right, down, left);
    return true;
  }, 'keydown');
  Mousetrap.bind('up', function(e, combo) {
    up = false;
    self.pan(up, right, down, left);
    return true;
  }, 'keyup');
  Mousetrap.bind('down', function(e, combo) {
    down = true;
    self.pan(up, right, down, left);
    return true;
  }, 'keydown');
  Mousetrap.bind('down', function(e, combo) {
    down = false;
    self.pan(up, right, down, left);
    return true;
  }, 'keyup');

};

$icv.Graph.prototype.zoom = function (delta) {
  var self = this;

  var val = self.rgraph.controller.Navigation.zooming/1000;
  var ans = 1 - (delta * val);
  self.rgraph.canvas.scale(ans, ans);
};

$icv.Graph.prototype.pan = function (up, right, down, left, distance) {
  var self = this;

  distance = distance || 15;

  var modX = ((right) ? -1 * distance : 0) + ((left) ? distance : 0),
    modY = ((up) ? distance : 0) + ((down) ? -1 * distance : 0);

  self.rgraph.canvas.translate(modX, modY);
};

$icv.Graph.prototype.setRootNode = function (node, callback) {
  var self = this;

  callback = callback || function () {};

  if (!self.isBusy() && self.rgraph.root != node.id) {
    self.setBusy(true);
    self._rootId = node.id;

    var rootNodeDomElement = self.getNodeElement(self.rgraph.root);
    if (rootNodeDomElement.length) {
      self._mouseLeaveOnNode(rootNodeDomElement, self.rgraph.graph.getNode(self.rgraph.root), function () {

        self.animatedCanvasTranslate(500);
        self.rgraph.onClick(node.id, {
          hideLabels: false,
          duration: 500,
          onComplete: function () {
            self.setBusy(false);

            self._mouseEnterOnNode(self.getNodeElement(node.id), node, function () {
              return callback(null, node);
            });
          }
        });
      })
    }
  } else {
    return callback(true, node);
  }
};

$icv.Graph.prototype.getNode = function (id) {
  return this.rgraph.graph.getNode(id);
};

$icv.Graph.prototype.getNodeElement = function (id) {
  return $('#' + this._container + ' #' + id + '.node').first();
};

$icv.Graph.prototype.centerNodeFromHash = function () {
  var self = this, hash = location.hash.replace(/^#/, '');

  if (hash.length && hash != location.hash) {
    var ids = hash.split('|');
    if (ids[0] != self._zoomId) {
      self.morph(ids[0], function () {
        if (ids[1] != self._rootId) {
          self.setRootNode(self.getNode(ids[1]));
        }
      });
    } else {
      if (ids[1] != self._rootId) {
        self.setRootNode(self.getNode(ids[1]));
      }
    }
  } else {
    self._rootId = self.rgraph.root;
    self.setHash(self._zoomId, self._rootId);
  }
};


$icv.Graph.prototype.setHash = function (zoomId, rootId) {
  var self = this;

  zoomId = zoomId || self._zoomId;
  rootId = rootId || self._rootId;

  location.hash = '#' + zoomId + '|' + rootId;
};


$icv.Generator = function (theme) {
  var self = this;
  if (!(self instanceof $icv.Generator)) return new $icv.Generator(theme);

  self._themeName = theme || "default";
  self._theme = $icv.Style.theme[self._themeName];
  self._cache = {};
}

$icv.Generator.prototype.buildNodeElement = function (element, node) {
  var self = this,
    expanded = !(node.data.relation || false),  //TODO: Get rid of this!
    nodeType = self.getNodeTypeFor(node.data.type || null);

  if (expanded) {
    var expansion = "<div class=\"expansion\">",
      level = Math.max(Math.min(Math.round(parseInt(node.data.level || '1')), 5), 1),
      levelClass = (nodeType.extended && nodeType.extended.levelBasedNameSize) ? ' icv-level-' + level : '';

    $(element).addClass(((Boolean(node.data.active)) ? 'icv-active' : '') + levelClass);

    expansion += '<span class="icv-note">' + (node.data.note || '') + '</span><br />';

    expansion += '<a href="#' + node.id + '" class="icv-btn icv-btn-zoom"><i class="fa fa-fw fa-search-plus"></i></a>';

    if (!(nodeType.extended && nodeType.extended.removeCenterButton)) {
      expansion += '<a href="#' + node.id + '" class="icv-btn icv-btn-root"><i class="fa fa-fw fa-puzzle-piece"></i></a>';
    }

    if (!(nodeType.extended && nodeType.extended.removeUrlButton)) {
      expansion += '<a href="' + (node.data.url || '#') + '" target="_blank" class="icv-btn icv-btn-link' +
        ((Boolean(node.data.url)) ? '' : ' disabled') + '"><i class="fa fa-fw fa-home"></i></a>';
    }

    if (!(nodeType.extended && nodeType.extended.removeDescButton)) {
      expansion += '<a href="#" class="icv-btn icv-btn-desc' + ((Boolean(node.data.desc)) ? ' tooltip' : ' disabled') +
        '" title="' + (node.data.desc || '') + '"><i class="fa fa-fw fa-info"></i></a>';
    }

    expansion += "</div>";

    element.innerHTML = node.name + expansion;
  } else {
    //TODO: Get rid of this!
    element.innerHTML = node.name + "<div class=\"expansion\">" + node.data.relation + "</div>";
  }

};

$icv.Generator.prototype.getNodeTypeFor = function (type, opts, ext) {
  type = type || 'default';
  opts = opts || {};
  ext = ext || {};

  var self = this,
    state = opts.state || 'normal',
    id = type + '-' + state,
    value = self._cache[id] || false;

  if (!value) {
    value = $.extend(true, {}, self._theme.nodeType.default['normal'] || {});
    if (state != 'normal') {
      value = $.extend(true, value, self._theme.nodeType.default[state] || {});
    }
    if (type != 'default') {
      value = $.extend(true, value, self._theme.nodeType[type]['normal'] || {});
      if (state != 'normal') {
        value = $.extend(true, value, self._theme.nodeType[type][state] || {});
      }
    }
    self._cache[id] = value;
  }

  return (Object.keys(ext).length) ? $.extend(true, {}, value, ext) : value;
};

$icv.Generator.prototype.getConfig = function (param) {
  var self = this;

  param = param || '';

  return (self._theme.config[param] || false) ? self._theme.config[param] : false;
};

$jit.RGraph.Plot.NodeTypes.implement({

  'custom': {
    'render': function (node, canvas) {
      var pos = node.pos.getc(true),
        ctx = canvas.getCtx(),
        nodeType = this.viz._owner.getGenerator().getNodeTypeFor(node.data.type || null/*, {"state": node.getData('state') || "normal"}*/),
        color = nodeType.color;

      if (!(node.data._created || false)) {
        node.setData('dim', (nodeType.extended && nodeType.extended.dim) ? nodeType.extended.dim(node) : nodeType.dim || node.getData('dim'));
        node.data._created = true;

      }

      var dim = node.getData("dim");

      //node.setData('color', color);

      if (nodeType.extended && typeof nodeType.extended.radialGradient === "object") {
        //RADIAL GRADIENT
        var colorStopList = Object.keys(nodeType.extended.radialGradient),
          color0_radius = Math.round(dim / 2),
          color1_start = Math.round(dim * 0.75),
          gradient = ctx.createRadialGradient(
            pos.x, pos.y, color0_radius,
            pos.x + color1_start, pos.y + color1_start, dim * 3
          );

        colorStopList.sort();
        for (var stop in colorStopList) {
          //console.log("\tColorStop " + Number(colorStopList[stop]) + " => " + nodeType.extended.radialGradient[colorStopList[stop]] + "\t" + node.name);
          gradient.addColorStop(Number(colorStopList[stop]), nodeType.extended.radialGradient[colorStopList[stop]]);
        }

        ctx.fillStyle = gradient;
      }

      this.nodeHelper.circle.render('fill', pos, dim, canvas);
      this.nodeHelper.circle.render('stroke', pos, dim, canvas);

      if (nodeType.extended && nodeType.extended.multipleCircleWaves) {
        var waves = 1,
          multipleCircleWaves = (typeof nodeType.extended.multipleCircleWaves === "function") ?
            nodeType.extended.multipleCircleWaves(node) : nodeType.extended.multipleCircleWaves;

        if (typeof multipleCircleWaves === "boolean") {
          waves = Math.max(Math.min(Math.round(parseInt(node.data.level || '1')), 5), 1);
        } else if (typeof multipleCircleWaves === "number") {
          waves = multipleCircleWaves
        }

        for (; waves > 1; --waves) {
          this.nodeHelper.circle.render('stroke', pos, dim - ((waves * 2) - 2), canvas);
        }
      }
    },
    'contains': function(node, pos){
      var npos = node.pos.getc(true),
        dim = node.getData('dim');

      return this.nodeHelper.circle.contains(npos, pos, dim);
    }
  }

});

$jit.RGraph.Plot.EdgeTypes.implement({

  //Code to render lines - dim of node
/*'render': function(adj, canvas) {
  var from = adj.nodeFrom.pos.getc(true),
    to = adj.nodeTo.pos.getc(true),
    dim = adj.getData('dim'),
    direction = adj.data.$direction,
    inv = (direction && direction.length>1 && direction[0] != adj.nodeFrom.id),
    arrowPosition = this.edge.arrowPosition || 'end';
  this.edgeHelper.arrow.render(from, to, dim, inv, canvas, arrowPosition);
},
'contains': function(adj, pos) {
  var from = adj.nodeFrom.pos.getc(true),
    to = adj.nodeTo.pos.getc(true);
  return this.edgeHelper.arrow.contains(from, to, pos, this.edge.epsilon);
}*/

  'custom': {
    'render': function(adj, canvas) {
      var from = adj.nodeFrom.pos.getc(true),
        to = adj.nodeTo.pos.getc(true),
        nodeType = this.viz._owner.getGenerator().getNodeTypeFor(adj.nodeTo.data.type || null),
        color = (nodeType.extended && nodeType.extended.edgeColor) ? nodeType.extended.edgeColor : nodeType.color;

      adj.setData('color', color);

      this.edgeHelper.line.render(from, to, canvas);

      var name = '' + adj.nodeFrom.id + '#' + adj.nodeTo.id,
        x = from.x + 0.5 * (to.x - from.x),
        y = from.y + 0.5 * (to.y - from.y),
        ctx = canvas.getCtx();

      //ctx.font = 'normal 11px Verdana';
      //ctx.fillStyle="#ff0000";
      //ctx.fillText(name, x, y);

    },
    'contains': function(adj, pos) {
      var from = adj.nodeFrom.pos.getc(true),
        to = adj.nodeTo.pos.getc(true);

      return this.edgeHelper.line.contains(from, to, pos, this.edge.epsilon);
    }
  }

});


$icv.Style = {
  global: {
    url: ''
  },
  theme: {
    default: {

      //Default Theme
      nodeType: {
        default: {
          //node state. (normal, open)
          normal: {
            //color: 'rgba(200, 220, 230, 0.5)',
            //edgeColor: 'rgba(200, 220, 230, 0.5)'
            //overridable: true,
            //type: 'custom',
            color: '#445978',
            dim: 32,
            //CanvasStyles: {
              //fillStyle: '#daa',
              //strokeStyle: '#fff',
              //lineWidth: 1
            //},
            "extended": {
              "radialGradient": false,
              /** Draw multiple node borders for each level of experience if
               * 'true' or specify the number of circles to draw.
               *
               * It can be a function, with node as argument, returning one of those values.
               */
              "multipleCircleWaves": false,
              "centerOnClick": true,
              /** Increase node name based on data.level value. */
              "levelBasedNameSize": true,
              //remove buttons from node expansion (normal state only)
              "removeCenterButton": true,
              "removeUrlButton": false,
              "removeDescButton": false,
              /** Color of the line pointing to this node. */
              "edgeColor": '#445978'
            }
          },
          open: {
            dim: 92
          }
        },
        category: {
          normal: {
            color: '#445978',
            "extended": {
              "multipleCircleWaves": false
            }
          }
        },
        skill: {
          normal: {
            color: '#4e7844'
          }
        },
        framework: {
          normal: {
            color: '#4e7844'
          }
        },
        language: {
          normal: {
            color: '#4e7844'
          }
        },
        library: {
          normal: {
            color: '#4e7844'
          }
        },
        application: {
          normal: {
            color: '#4e7844'
          }
        }
      },
      "config": {
        "backgroundColor": 'transparent',
        "stickBackgroundImage": true,
        "centerNodeOnHashChange": false,
        /** Whether use the custom ‘Native’ canvas Event System of the library or to attach
         *  the events onto the HTML labels (via event delegation).
         */
        "nativeEvents": false
      }
    },

    "flatline": (function () {
      var value = $.extend(true, {}, $icv.Style.theme.default);

      value.nodeType.default.normal.CanvasStyles = { "strokeStyle": "#fff", lineWidth: 1 };
      value.nodeType.default.normal.extended.edgeColor = '#fff';

      return value;
    }),

    //SoapBubble Theme
    "soapbubble": (function () {
      var soapbubble = {
        nodeType: {
          default: {
            normal: {
              CanvasStyles: {
                strokeStyle: '#fff',
                lineWidth: 1
              },
              "extended": {
                "radialGradient": {
                  "0": '#445978',
                  "1": '#fff'
                },
                "centerOnClick": false,
                "removeCenterButton": false,
                "edgeColor": '#fff'
              }
            }
          },
          framework: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": '#4e7844',
                  "1": '#fff'
                }
              }
            }
          }
        },
        "config": {
          "centerNodeOnHashChange": true
        }
      };

      return $.extend(true, {}, $icv.Style.theme.default, soapbubble);
    }),

    /** ReverseSoapBubble Theme (Inner view of soap bubbles)
     *
     * Works fine in IE 11, Chrome 39 and Opera 26 but in Firefox looks like SoapBubble.
     */
    "reversesoapbubble": (function () {
      var colorList = [/*Lightblue*/'#a4bde3' , /*Yellow*/'#e3e3a4', /*Green*/'#4e7844', /*Red*/ '#e67070', /*Blue*/'#445978', /*Orange*/ '#e6b770', /*Cyan*/'#70dee6'];

      var reversesoapbubble = {
        nodeType: {
          default: {
            normal: {
              CanvasStyles: {
                strokeStyle: '#fff',
                lineWidth: 1
              },
              "extended": {
                "radialGradient": {
                  "0": colorList[0],
                  "0.5": '#000',
                  "0.75": colorList[0],
                  "1": '#fff'
                },
                "centerOnClick": false,
                "removeCenterButton": false,
                "multipleCircleWaves": true,
                "levelBasedNameSize": false,
                "edgeColor": '#fff'
              }
            }
          },
          category: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[1],
                  "0.5": '#000',
                  "0.75": colorList[1],
                  "1": '#fff'
                },
                "multipleCircleWaves": false,
                "levelBasedNameSize": false
              }
            }
          },
          framework: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": String(colorList[2]),
                  "0.5": '#000',
                  "0.75": String(colorList[2]),
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          },
          language: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": String(colorList[3]),
                  "0.5": '#000',
                  "0.75": String(colorList[3]),
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          },
          skill: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[4],
                  "0.5": '#000',
                  "0.75": colorList[4],
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          },
          library: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[5],
                  "0.5": '#000',
                  "0.75": colorList[5],
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          },
          application: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[6],
                  "0.5": '#000',
                  "0.75": colorList[6],
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          }
        },
        "config": {
          "centerNodeOnHashChange": true
        }
      };

      return $.extend(true, {}, $icv.Style.theme.default, reversesoapbubble);
    }),

    /** Chemical Theme. */
    "chemical": (function () {
      var colorList = [/*Lightblue*/'#a4bde3' , /*Yellow*/'#e3e3a4', /*Green*/'#4e7844', /*Red*/ '#e67070', /*Blue*/'#445978', /*Orange*/ '#e6b770', /*Cyan*/'#70dee6'];

      var chemical = {
        nodeType: {
          default: {
            normal: {
              CanvasStyles: {
                strokeStyle: '#fff',
                lineWidth: 1
              },
              "extended": {
                "radialGradient": {
                  "0": colorList[0],
                  "0.5": '#000'
                },
                "centerOnClick": false,
                "removeCenterButton": false,
                "multipleCircleWaves": function (node) {
                  return (node.data && node.data.active) ? 2 : 1;
                },
                "levelBasedNameSize": false,
                "edgeColor": '#fff',
                /** When not false, overwrites default node dimension with the returned value of a function. */
                "dim": function (node) {
                  return (Math.max(Math.min(Math.round(parseInt(node.data.level || '1')), 5), 1) - 1) * 7 + 15
                }
              }
            },
            open: {
              dim: 92,
              "extended": {
                "dim": false
              }
            }
          },
          category: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[0],
                  "0.5": '#000'
                },
                "levelBasedNameSize": false
              }
            }
          },
          framework: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[2],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          },
          language: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[4],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          },
          skill: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[6],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          },
          library: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[2],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          },
          application: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[3],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          }
        },
        "config": {
          "centerNodeOnHashChange": true,
          "nativeEvents": true
        }
      };

      return $.extend(true, {}, $icv.Style.theme.default, chemical);
    })

  }
};

$icv.Style.theme.flatline = $icv.Style.theme.flatline();
$icv.Style.theme.soapbubble = $icv.Style.theme.soapbubble();
$icv.Style.theme.reversesoapbubble = $icv.Style.theme.reversesoapbubble();
$icv.Style.theme.chemical = $icv.Style.theme.chemical();


$icv.bindUIEvents = function(graph) {

  $("#interactive-cv").on("click", ".icv-btn", function (ev) {

    if ($(this).hasClass('disabled')) {
      ev.preventDefault();

    } else {
      if ($(this).hasClass('icv-btn-root')) {
        ev.preventDefault();
        graph.setHash(null, $(this).attr('href').substr(1));
      }

      if ($(this).hasClass('icv-btn-zoom')) {
        ev.preventDefault();
        var id = $(this).attr('href').substr(1);
        graph.setHash(id, id);
      }

      if ($(this).hasClass('icv-btn-desc')) {
        ev.preventDefault();
      }
    }

  });

}

$icv.EventHandler = function (domElement, node) {
  var self = this;
  if (!(self instanceof $icv.EventHandler)) return new $icv.EventHandler(domElement, node);

  self._domElement = domElement;
  self._node = node;
  self._mouseEnterTimer = false;
  self._mouseLeaveTimer = false;
  self._mouseEnterCallback = false;
  self._mouseEnterCallbackOnBreak = false;
  self._mouseLeaveCallback = false;
}

$icv.EventHandler.prototype.mouseEnterOnNode = function (duration, callback, callbackOnBreak) {
  var self = this;

  self._mouseEnterCallback = callback;
  self._mouseEnterCallbackOnBreak = callbackOnBreak;

  var _callback = function () {
    clearTimeout(self._mouseEnterTimer);
    self._mouseEnterTimer = false;
    self._mouseEnterCallback();
  };

  self._mouseEnterTimer = setTimeout(_callback, duration + 50);

  return _callback;
};

$icv.EventHandler.prototype.mouseLeaveOnNode = function (duration, callback) {
  var self = this;

  self._mouseLeaveCallback = callback;

  var _callback = function () {
    clearTimeout(self._mouseLeaveTimer);
    self._mouseLeaveTimer = false;
    self._mouseLeaveCallback();
  };

  if (self._mouseEnterTimer !== false) {
    clearTimeout(self._mouseEnterTimer);
    self._mouseEnterCallback = function () {};
    self._mouseEnterCallbackOnBreak();
  }

  self._mouseLeaveTimer = setTimeout(_callback, duration + 50);

  return _callback;
};

}());