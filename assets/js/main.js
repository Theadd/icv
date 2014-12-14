/**
 *
 * @param sParam
 * @returns {*}
 * @constructor
 */
function GetURLParameter (sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; ++i) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

$(document).ready(function(){
  $("#interactive-cv").height($(window).height());
  graph = new ICVGraph('interactive-cv', GetURLParameter('theme') || null);
  graph.load(techs_json, function() {
    graph.bindKeyShortcuts();
    bindUIEvents();

    graph.centerNodeFromHash();
  });
});


