
$icv.Graph = function (container_id, force_theme) {
  var self = this;
  if (!(self instanceof $icv.Graph)) return new $icv.Graph(container_id, force_theme);

  self._container = container_id;
  self._busy = false;
  self._preventNextClick = false;
  self._mouseDragStartAt = { x: 0, y: 0 };
  self._json = {};
  //FIXME: get opt values for:
  self._hideLabels = true;
  self._unstickBackgroundImage = true;
  self._fps = 20;

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
    //interpolation: 'polar',
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

      ++$icv._callProfile.onCreateLabel; //FIXME
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

      ++$icv._callProfile.onPlaceLabel; //FIXME

      var left = parseInt(style.left);
      var top = parseInt(style.top);
      var w = domElement.offsetWidth;
      var h = domElement.offsetHeight;
      style.left = (left - w / 2) + 'px';
      style.top = (top - h / 2) + 'px';
    },
    onBeforePlotLine: function(adj) {

      if (self._stickBackgroundImage && !self._unstickBackgroundImage) {
        ++$icv._callProfile.onBeforePlotLine; //FIXME
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
    duration: 3000,
    hideLabels: self._hideLabels,
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
    fps: self._fps,
    duration: 3000,
    hideLabels: self._hideLabels,
    onComplete: function () {
      self.setBusy(false);
      self._zoomId = id;
      callback();
    }
  });

};

$icv.Graph.prototype.recursiveGetTree = function (json, id) {
  var self = this, found = false;

  ++$icv._callProfile.recursiveGetTree; //FIXME

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

    ++$icv._callProfile._mouseEnterOnNode; //FIXME

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

            /*$('.tooltip').tooltipster({
              trigger: 'click',
              interactive: true,
              contentAsHTML: true,
              animation: 'grow',
              minWidth: 100,
              maxWidth: 300,
              position: 'right'
            });*/    //TODO: maybe its not required here but after loading json
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

  ++$icv._callProfile._mouseLeaveOnNode; //FIXME

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

  ++$icv._callProfile.animatedCanvasTranslate; //FIXME

  var x = self.rgraph.canvas.translateOffsetX * -1;
  var y = self.rgraph.canvas.translateOffsetY * -1;
  duration = duration || 1000;
  var rounds = (duration / 1000) * self._fps;
  var xpf = x / rounds;
  var ypf = y / rounds;
  callback = callback || function () {};

  var timer = setInterval(function () {
    ++$icv._callProfile.translate; //FIXME
    self.rgraph.canvas.translate(xpf, ypf);
    if (--rounds == 0) {
      clearInterval(timer);
      timer = 0;
      return callback();
    }
  }, (1000 / self._fps)); //25ms == 40fps, 20ms == 50fps

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
          hideLabels: self._hideLabels,
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

$icv.Graph.prototype.hideLabels = function (hide) {
  this._hideLabels = Boolean(hide) || false;
};
