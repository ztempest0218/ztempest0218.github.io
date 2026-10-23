/*!
 * Start Bootstrap - Grayscale Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

$(window).on('scroll', function() {
    $('.navbar-fixed-top').toggleClass('top-nav-collapse', window.scrollY > 50);
});

$(function() {
 var slider = new IdealImageSlider.Slider('#slider');
 slider.addBulletNav();
 slider.addCaptions();
 slider.start();
 $(document).on('contextmenu', 'img[data-protected-image]', function(event) {
  event.preventDefault();
 });
    $('a.page-scroll').on('click', function(event) {
        var target = this.hash && document.getElementById(decodeURIComponent(this.hash.slice(1)));
        var samePage = this.pathname === location.pathname && this.hostname === location.hostname;

        if (target && samePage) {
            $('html, body').stop().animate({
                scrollTop: $(target).offset().top
            }, 1500, 'easeInOutExpo');
            event.preventDefault();
        }
    });

    $('.navbar-collapse a').on('click', function() {
        if ($('.navbar-toggle').is(':visible')) {
            var menu = document.getElementById('main-navigation');
            bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
        }
    });

    $('a').on('mouseup', function() {
        this.blur();
    });
});
