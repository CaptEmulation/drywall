/* global app:true */
/* exported app */

(function () {
  'use strict';

  // Mobile/Desktop Detection script
  (function (ua, w, d) {

    // Listen to the DOMContentLoaded Event (Supported in IE9+, Chrome Firefox, Safari)
    w.addEventListener("DOMContentLoaded", function () {
      // Mobile JavaScript

      if ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(ua)) {
        loadFiles({
          "css":"css/libs/jquery.mobile.css",
          // Change this to "js/app/config/MobileInit.min" for production
          "data-main":"js/app/config/MobileInit",
          "requirejs":"vendor/require//require.js"
        });
      }
      // Desktop JavaScript
      else {
        loadFiles({
          //"css":"css/libs/bootstrap.css",
          // Change this to "js/app/config/DesktopInit.min" for production
          "data-main": app.baseUrl + "config/DesktopInit.js",
          "requirejs": app.baseUrl + "vendor/require/require.js"
        });
      }

      function loadCss(url, callback) {
        var link = d.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;

        d.querySelector("head").appendChild(link);

        if (callback) {
          callback();
        }
      }

      function loadRequireJS(obj, callback) {
        var script = d.createElement('script');
        script.setAttribute("data-main", obj["data-main"]);
        script.src = obj.src;
        d.body.appendChild(script);
        if (callback) {
          callback();
        }
      }

      function loadFiles(obj) {
        // Loads the jQuery Mobile CSS file
        //loadCss(obj.css);

        // Loads Require.js and tells Require.js to find the mobile intialization file
        loadRequireJS({ "data-main":obj["data-main"], "src":obj.requirejs });
      }

    }, false);

  })(navigator.userAgent || navigator.vendor || window.opera, window, window.document);

}());


(function() {
  'use strict';

  $(document).ready(function() {
    //active (selected) navigation elements
    $('.nav [href="'+ window.location.pathname +'"]').closest('li').toggleClass('active');

    //register global ajax handlers
    $(document).ajaxStart(function(){ $('.ajax-spinner').show(); });
    $(document).ajaxStop(function(){  $('.ajax-spinner').hide(); });

    //ajax spinner follows mouse
    $(document).bind('mousemove', function(e) {
      $('.ajax-spinner').css({
        left: e.pageX + 15,
        top: e.pageY
      });
    });
  });
}());
