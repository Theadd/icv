var graph;

function ICVGraph (container_id, force_theme) {
  var self = this;
  if (!(self instanceof ICVGraph)) return new ICVGraph(container_id, generator);

  self._container = container_id;
  self._busy = false;
  self._preventNextClick = false;


  var labelType, useGradients, nativeTextSupport, animate,
    container = $('#' + self._container),
    theme = force_theme || container.data('theme') || 'default';

  container.addClass('icv-theme-' + theme);
  self._generator = new ICVGenerator(theme);

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

  self.rgraph = new $jit.RGraph({
    //Where to append the visualization
    injectInto: self._container,
    levelDistance: 200,
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
      onMouseEnter: function (node, eventInfo, e) {
        //console.log("enter");
      },
      onMouseLeave: function (node, eventInfo, e) {
        //console.log("leave");
      },
      onDragEnd: function(node, eventInfo, e){
        $jit.util.event.stop(e);
        self._preventNextClick = true;
      }
    },

    //Add the name of the node in the correponding label
    //and a click handler to move the graph.
    //This method is called once, on label creation.
    onCreateLabel: function (domElement, node) {

      self.getGenerator().buildNodeElement(domElement, node);

      domElement.onclick = function (a, b, c) {
        if (self._preventNextClick) {
          self._preventNextClick = false;
        } else {
          if (!self.isBusy() && self.rgraph.root != node.id) {
            self.setBusy(true);

            var rootNodeDomElement = $('#' + self._container + ' #' + self.rgraph.root + '.node').first();
            if (rootNodeDomElement.length) {
              self._mouseLeaveOnNode(rootNodeDomElement, self.rgraph.graph.getNode(self.rgraph.root), function () {

                self.animatedCanvasTranslate(500);
                self.rgraph.onClick(node.id, {
                  hideLabels: false,
                  duration: 500,
                  onComplete: function () {
                    self.setBusy(false);
                  }
                });
              })
            }
          }
        }
      };

      domElement.onmouseenter = function (e) {
        if (self.isBusy()) {
          $jit.util.event.stop(e);
        } else {
          self._mouseEnterOnNode(domElement, node, function (dE, n) {

          });
        }
      };

      domElement.onmouseleave = function (e) {
        if (self.isBusy()) {
          $jit.util.event.stop(e);
        } else {
          if (self.rgraph.root != node.id) {
            self._mouseLeaveOnNode(domElement, node, function (dE, n) {

            });
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
}

ICVGraph.prototype.load = function (json) {
  var self = this

  self.setBusy(true);
  //load JSON data
  self.rgraph.loadJSON(json);
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
      //automatically open root node
      var rootNodeDomElement = $('#' + self._container + ' #' + self.rgraph.root + '.node').first();
      if (rootNodeDomElement.length) {
        self._mouseEnterOnNode(rootNodeDomElement, self.rgraph.graph.getNode(self.rgraph.root), function () {
          self.setBusy(false);
        })
      }
    }
  });
}

ICVGraph.prototype.isBusy = function () {
  return this._busy;
}

ICVGraph.prototype.setBusy = function (busy) {
  this._busy = !!(busy || false);
}

ICVGraph.prototype.getGenerator = function () {
  return this._generator;
}

ICVGraph.prototype._mouseEnterOnNode = function (domElement, node, callback) {
  var self = this;

  $(domElement).addClass('working').promise().done(function () {
    var nodeType = self.getGenerator().getNodeTypeFor(node.data.type || null, {state: 'hover'});

    callback = callback || function () {};
    node.setData('dim', node.getData('dim'), 'start');
    node.setData('dim', nodeType.dim, 'end');

    self.rgraph.fx.animate({
      modes: ['node-property:dim'],
      duration: 500,
      transition: $jit.Trans.Bounce.easeIn,
      onComplete: function () {

        $(domElement).addClass('open').removeClass('working').promise().done(function () {
          self.rgraph.plot();
          callback(domElement, node);
        });
      }
    });
  });
}

ICVGraph.prototype._mouseLeaveOnNode = function (domElement, node, callback) {
  var self = this;

  $(domElement).addClass('working').promise().done(function () {
    var nodeType = self.getGenerator().getNodeTypeFor(node.data.type || null);

    callback = callback || function () {};
    $(domElement).removeClass('open');

    node.setData('dim', node.getData('dim'), 'start');
    node.setData('dim', nodeType.dim, 'end');

    self.rgraph.fx.animate({
      modes: ['node-property:dim'],
      duration: 500,
      transition: $jit.Trans.Bounce.easeOut,
      onComplete: function () {
        $(domElement).removeClass('working').promise().done(function () {
          callback(domElement, node);
        });
      }
    });
  });
}

ICVGraph.prototype.animatedCanvasTranslate = function (duration, callback) {
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

}
