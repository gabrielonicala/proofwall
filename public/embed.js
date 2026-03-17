(function () {
  var ATTR = "data-laudica";

  function init() {
    var els = document.querySelectorAll("[" + ATTR + "]");
    for (var i = 0; i < els.length; i++) {
      mount(els[i]);
    }
  }

  function mount(el) {
    if (el._pw) return; // already mounted
    el._pw = true;

    var wallId = el.getAttribute(ATTR);
    if (!wallId) return;

    // Determine the embed origin from the script src
    var origin = getScriptOrigin();
    var src = origin + "/embed/" + wallId;

    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.display = "block";
    iframe.style.minHeight = "100px";
    iframe.style.height = "500px"; // initial fallback
    iframe.style.colorScheme = "normal";
    iframe.style.margin = "1.5rem 0";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("title", "Laudica testimonials");

    el.innerHTML = "";
    el.style.overflow = "hidden";
    el.appendChild(iframe);

    // Listen for resize messages from this iframe
    window.addEventListener("message", function (e) {
      if (e.source !== iframe.contentWindow) return;
      if (e.data && e.data.type === "laudica-resize" && e.data.height) {
        iframe.style.height = e.data.height + "px";
      }
    });
  }

  function getScriptOrigin() {
    try {
      var scripts = document.querySelectorAll("script[src]");
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].getAttribute("src") || "";
        if (src.indexOf("/embed.js") !== -1) {
          var url = new URL(src, window.location.href);
          return url.origin;
        }
      }
    } catch (e) {}
    // Fallback: same origin
    return window.location.origin;
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
