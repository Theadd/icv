
function ICVGenerator (theme) {
  var self = this;
  if (!(self instanceof ICVGenerator)) return new ICVGenerator(theme);

  self._themeName = theme || "default";
  self._theme = ICVStyle.theme[self._themeName];
  self._cache = {};
}

ICVGenerator.prototype.buildNodeElement = function (element, node) {
  var self = this;

  /*type: 'framework',
   experience: 5,
   active: true,
   years: 0.5,
   desc: 'Chromium based cross-platform desktop applications using JavaScript, HTML and CSS.',
   url: 'https://github.com/atom/atom-shell'*/

  var expanded = !(node.data.relation || false);

  if (expanded) {
    var inlineExpansion = "<div class=\"inline-expansion\">",
      expansion = "<div class=\"expansion\">",
      experience = Math.max(Math.min(Math.round(parseInt(node.data.experience || '1')), 5), 1);

    $(element).addClass('icv-exp-' + experience);

    inlineExpansion += '<span class="icv-experience"></span>';
    //inlineExpansion += '<span class="icv-active">' + ((node.data.active || false) ? 'ACTIVE' : 'IN THE PAST') + '</span>';
    //inlineExpansion += '<span class="icv-years">' + (node.data.years || 0) + '</span>';

    inlineExpansion += "</div>";

    expansion += '<span class="icv-desc">' + (node.data.desc || '') + '</span>';

    expansion += "</div>";

    element.innerHTML = node.name + inlineExpansion + expansion;
  } else {
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

      if (node.data.active || false) {

        ctx.fillStyle = "#006900";
        this.nodeHelper.circle.render('fill', pos, dim + 8, canvas);
      }
      ctx.fillStyle = color;
      this.nodeHelper.circle.render('fill', pos, dim, canvas);
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
