(function ($) {
  // Display year in footer
  const footerYear = new Date().getFullYear();
  $("#year").html(footerYear);

  // This is for image scroll
  $.fn.visible = function (partial) {
    var $t = $(this),
      $w = $(window),
      viewTop = $w.scrollTop(),
      viewBottom = viewTop + $w.height(),
      _top = $t.offset().top,
      _bottom = _top + $t.height(),
      compareTop = partial === true ? _bottom : _top,
      compareBottom = partial === true ? _top : _bottom;

    return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
  };

  // Load sidenav
  $('.sidenav').sidenav();

  // This is for typed.js
  var typed = new Typed("#typed", {
    strings: ['Welcome to my...', 'Photo Gallery'],
    typeSpeed: 50,
    backSpeed: 30,
    smartBackspace: true, // this is a default
    loop: false,
  });

  if(!sessionStorage.getItem("runOnce")){
    setTimeout(function () {
      $('body').addClass('loaded');
      $('h1').css('color', '#222222');
    }, 3000);
    sessionStorage.setItem("runOnce",true);
  } else {
    $('body').addClass('loaded');
  }

  

})(jQuery);

var win = $(window);
var allMods = $(".module");

allMods.each(function (i, el) {
  var el = $(el);
  if (el.visible(true)) {
    el.addClass("already-visible");
  }
});

win.scroll(function (event) {
  allMods.each(function (i, el) {
    var el = $(el);
    if (el.visible(true)) {
      el.addClass("come-in");
    }
  });
});

// Changin nav color on scroll
var mainbottom = $('.header-img').offset().top + $('.header-img').height();
$(window).on('scroll', function () {
  // we round here to reduce a little workload
  var stop = Math.round($(window).scrollTop());
  if (stop > mainbottom) {
    $('nav').addClass('teal').removeClass('transparent');
  } else {
    $('nav').removeClass('teal').addClass('transparent');
  }
});