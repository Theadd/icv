
function bindUIEvents() {

  $("#interactive-cv").on("click", ".icv-btn", function (ev) {

    if ($(this).hasClass('disabled')) {
      ev.preventDefault();

    } else {
      if ($(this).hasClass('icv-btn-root')) {
        //var id = $(this).closest(".node").attr('id');

        //graph.setRootNode(graph.getNode(id));
        console.log("changing hash");
      }

      if ($(this).hasClass('icv-btn-desc')) {
        ev.preventDefault();
      }
    }

  });

}

/*
expansion += '<a href="#" class="icv-btn icv-btn-root"><i class="fa fa-fw fa-puzzle-piece"></i></a>';
expansion += '<a href="#" class="icv-btn icv-btn-link disabled"><i class="fa fa-fw fa-home"></i></a>';
expansion += '<a href="#" class="icv-btn icv-btn-desc"><i class="fa fa-fw fa-info"></i></a>';
*/

