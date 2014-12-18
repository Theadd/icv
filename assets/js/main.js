
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

var icvInstance;

$(document).ready(function(){

  $("#interactive-cv").height($(window).height());

  icvInstance = new $icv.Instance({
    "containerId": "interactive-cv",
    "theme": GetURLParameter('theme') || null
  });

  icvInstance.initialize();

  icvInstance.load(techs_json, function () {
    console.log("Loaded!");
  });

});


