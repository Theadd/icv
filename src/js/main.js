

window.$icv = {};

$icv.version = '0.1.0';

$icv._callProfile = {
  "onBeforePlotLine": 0,
  "onPlaceLabel": 0,
  "onCreateLabel": 0,
  "recursiveGetTree": 0,
  "_mouseEnterOnNode": 0,
  "_mouseLeaveOnNode": 0,
  "animatedCanvasTranslate": 0,
  "translate": 0,
  "renderEdgeTypes": 0,
  "containsEdgeTypes": 0,
  "renderNodeTypes": 0,
  "containsNodeTypes": 0
}

$icv.Instance = Instance;

/**
 *
 * @param opt {Object} with the following values: {
 *  (REQUIRED) containerId: 'domElementId',
 *  theme: 'themeName',
 *  bindKeyShortcuts: boolean,
 *  hideLabels: boolean,
 *  noShadows: boolean
 * }
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

