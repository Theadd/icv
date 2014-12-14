
function ICVGenerator (theme) {
  var self = this;
  if (!(self instanceof ICVGenerator)) return new ICVGenerator(theme);

  self._themeName = theme || "default";
  self._theme = ICVStyle.theme[self._themeName];
  self._cache = {};
}

ICVGenerator.prototype.buildNodeElement = function (element, node) {
  var self = this,
    expanded = !(node.data.relation || false),  //TODO: Get rid of this!
    nodeType = graph.getGenerator().getNodeTypeFor(node.data.type || null);

  if (expanded) {
    var expansion = "<div class=\"expansion\">",
      level = Math.max(Math.min(Math.round(parseInt(node.data.level || '1')), 5), 1),
      levelClass = (nodeType.extended && nodeType.extended.levelBasedNameSize) ? ' icv-level-' + level : '';

    $(element).addClass(((Boolean(node.data.active)) ? 'icv-active' : '') + levelClass);

    expansion += '<span class="icv-note">' + (node.data.note || '') + '</span><br />';

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

}

ICVGenerator.prototype.getNodeTypeFor = function (type, opts, ext) {
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
}

ICVGenerator.prototype.getConfig = function (param) {
  var self = this;

  param = param || '';

  return (self._theme.config[param] || false) ? self._theme.config[param] : false;
}

$jit.RGraph.Plot.NodeTypes.implement({

  'custom': {
    'render': function (node, canvas) {
      var pos = node.pos.getc(true),
        ctx = canvas.getCtx(),
        dim = node.getData('dim'),
        nodeType = graph.getGenerator().getNodeTypeFor(node.data.type || null),
        color = nodeType.color;

      node.setData('color', color);

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
        var waves = 1
        if (typeof nodeType.extended.multipleCircleWaves === "boolean") {
          waves = Math.max(Math.min(Math.round(parseInt(node.data.level || '1')), 5), 1);
        } else if (typeof nodeType.extended.multipleCircleWaves === "number") {
          waves = nodeType.extended.multipleCircleWaves
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

  'custom': {
    'render': function(adj, canvas) {
      var from = adj.nodeFrom.pos.getc(true),
        to = adj.nodeTo.pos.getc(true),
        nodeType = graph.getGenerator().getNodeTypeFor(adj.nodeTo.data.type || null),
        color = nodeType.color;

      adj.setData('color', '#ffffff');

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
