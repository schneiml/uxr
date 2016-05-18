$(function() {
  var HoverListener = {
      addElem: function( elem, callback, delay ) {
          if ( delay === undefined )
              delay = 500;
          
          var hoverTimer;
          
          addEvent( elem, 'mouseover', function() {
              hoverTimer = setTimeout( callback, delay );
          });
          
          addEvent( elem, 'mouseout', function() {
              clearTimeout( hoverTimer );
          });
      }
  }

  function highlighter(ref) {
      return function highlight() {
          var needle = ref.innerText.replace(/[^\w]/,"")
          var els = document.getElementsByTagName("a");
          for (var i = 0; i < els.length; i++) {
              var a = els[i];
              a.classList.remove("hl");
              if (a.innerText.replace(/[^\w]/,"") == needle) {
                  a.classList.add("hl");
              }
          }
      }
  }

  //  Generic event abstractor
  function addEvent( obj, evt, fn ) {
      if ( 'undefined' != typeof obj.addEventListener ) {
          obj.addEventListener( evt, fn, false );
      }
      else if ( 'undefined' != typeof obj.attachEvent ) {
          obj.attachEvent( "on" + evt, fn );
      }
  }

  function addHoverEvents() {
      var node = document.createElement('style');
      node.innerHTML = ".hl { background-color: rgba(255, 255, 0, 127); }";
      document.body.appendChild(node);
      
      var els = document.getElementsByTagName("a");
      for (var i = 0; i < els.length; i++) {
          var a = els[i];
          HoverListener.addElem(a, highlighter(a));
      }
  }

  addHoverEvents();
})
