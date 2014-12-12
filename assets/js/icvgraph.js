var graph;

$(document).ready(function(){
  graph = new ICVGraph('interactive-cv');
  graph.load(techs_json);
});

function ICVGraph (container_id) {
  var self = this;
  if (!(self instanceof ICVGraph)) return new ICVGraph(container_id, generator);

  self._container = container_id;
  self._busy = false;
  self._preventNextClick = false;

  var labelType, useGradients, nativeTextSupport, animate,
    container = $('#' + self._container),
    theme = container.data('theme') || 'default';

  container.addClass('icv-theme-' + theme);
  self._generator = new ICVGenerator(theme);

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
    Node: self.getGenerator().getNodeTypeFor('default', null, {overridable: true, type: 'custom'}),
    Edge: {
      overridable: true,
      type: 'custom',
      color: '#4e7844',
      lineWidth: 3
    },

    Tips: {
      enable: true,
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
      /*type: 'framework',
       experience: 5,
       active: true,
       years: 0.5,
       desc: 'Chromium based cross-platform desktop applications using JavaScript, HTML and CSS.',
       url: 'https://github.com/atom/atom-shell'*/

      var expanded = !(node.data.relation || false);

      if (expanded) {
        var inlineExpansion = "<div class=\"inline-expansion\">",
          expansion = "<div class=\"expansion\">";

        inlineExpansion += '<span class="icv-experience icv-bar-' + parseInt(node.data.experience || '0') + '"></span>';
        inlineExpansion += '<span class="icv-active">' + ((node.data.active || false) ? 'ACTIVE' : 'IN THE PAST') + '</span>';
        inlineExpansion += '<span class="icv-years">' + (node.data.years || 0) + '</span>';

        inlineExpansion += "</div>";

        expansion += '<span class="icv-desc">' + (node.data.desc || '') + '</span>';

        expansion += "</div>";

        domElement.innerHTML = node.name + inlineExpansion + expansion;
      } else {
        domElement.innerHTML = node.name + "<div class=\"expansion\">" + node.data.relation + "</div>";
      }


      domElement.onclick = function (a, b, c) {
        if (self._preventNextClick) {
          self._preventNextClick = false;
        } else {
          if (!self.isBusy() && self.rgraph.root != node.id) {
            self.setBusy(true);

            var rootNodeDomElement = $('#' + self._container + ' #' + self.rgraph.root + '.node').first();
            if (rootNodeDomElement.length) {
              self._mouseLeaveOnNode(rootNodeDomElement, self.rgraph.graph.getNode(self.rgraph.root), function () {
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
