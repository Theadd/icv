
$icv.bindUIEvents = function() {

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
