(function () {

  // Mobile/Desktop Detection script
  (function (ua, w, d) {

    // Listen to the DOMContentLoaded Event (Supported in IE9+, Chrome Firefox, Safari)
    w.addEventListener("DOMContentLoaded", function () {
      // Mobile JavaScript

      if ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(ua)) {
        loadFiles({
          "css":"plugins/jquery.mobile/jquery.mobile.css",
          // Change this to "js/app/config/MobileInit.min" for production
          "data-main":"js/app/config/MobileInit",
          "requirejs":"vendor/require/require.js"
        });
      }
      // Desktop JavaScript
      else {
        loadFiles({
//          "css":"vendor/bootstrap.css",
          // Change this to "js/app/config/DesktopInit.min" for production
          "data-main":"js/app/config/DesktopInit",
          "requirejs":"vendor/require/require.js"
        });
      }

      function loadCss(url, callback) {
        var link = d.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;

        d.querySelector("head").appendChild(link);

        if (callback) callback();
      }

      function loadRequireJS(obj, callback) {
        var script = d.createElement('script');
        script.setAttribute("data-main", obj["data-main"]);
        script.src = obj.src;
        d.body.appendChild(script);
        if (callback) callback();
      }

      function loadFiles(obj) {
        // Loads the jQuery Mobile CSS file
        loadCss(obj.css);

        // Loads Require.js and tells Require.js to find the mobile intialization file
        loadRequireJS({ "data-main":obj["data-main"], "src":obj.requirejs });
      }

    }, false);

  })(navigator.userAgent || navigator.vendor || window.opera, window, window.document);

}());
