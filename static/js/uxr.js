
$(function() {
     
  var uxr =  document.location.href.match(/([^?]*).*/)[1]
  var file = document.location.href.match(/path=([^&]*\/[^#&]+)/)
  if (file) file = file[1]
  var syntax = /(\w+:"[^"]*")|"([^"]*)"|(\/\*.*\*\/|\/\/.*)$|\b(if|else|for|while|class|struct|union|static|virtual|const|public|private|protected|new|using|namespace|typedef|break|continue|case|switch|goto|return|void|unsigned|int|long|short|char|float|double|volatile|u?int\d+_t)\b|#\s*(include|if|ifdef|ifndef|define|endif|pragma)\b|(\w([\w0-9_]+:?:?)+)\b|(\u3039)|(\u303a)|./g
  var conv = document.createElement("p");

  function makea(txt, file, line, idx) {
    if (line) {
      return '<a class="range" href="' + uxr + '?q=loc:' + file + ':' + line + ':' + (idx) + " " + encodeURIComponent(txt) + '">'
    } else {
      return '<a class="range" href="' + uxr + '?q=' + encodeURIComponent(txt) + '">'
    }
  }

  $(".content code").each(function(i, el) {
    if ($(el).attr("data-file")) file = $(el).attr("data-file")
    var line = el.id.match(/line-([0-9]+)/)
    if (line) line = line[1]
    if (el.innerHTML.match("<b>")) {
      // hope that those symbols never appear, we turn them back into tags later
      el.innerHTML = el.innerHTML.replace(/<b>/g, "&#12345;").replace(/<\/b>/g, "&#12346;")
    }
    var text = el.textContent

    var out = ''
    var offset = 0 // num invisible chars so far
    while ((match = syntax.exec(text)) != null) {
      var idx = match.index
      var a = ''
      var aend = ''
      var txt = match[0]

      if (match[1]) /* key:"value" ref */ {
        a = makea(match[1])
        aend = '</a>'
      }
      if (match[2]) /* string literal */ {
        a = makea('"' + match[2] + '"', file, line, idx-offset) + '<span class="str">'
        aend = '</span></a>'
      }
      if (match[3]) /* comment */ {
        a = '<span class="c">'
        aend = '</span>'
      }
      if (match[4]) /* keyword */ {
        a = '<span class="k">'
        aend = '</span>'
      }
      if (match[5]) /* preprocessor */ {
        a = '<span class="k">'
        aend = '</span>'
      }
      if (match[6]) /* identifier */ {
        a = makea("'" + match[6] + "'", file, line, idx-offset)
        aend = '</a>'
      }
      if (match[8]) /* <b> marker */ {
        txt = ''
        a = "<b>"
        offset++
      }
      if (match[9]) /* </b> marker */ {
        txt = ''
        a = "</b>"
        offset++
      }

      // otherwise we progress char-by char, probably not optimal.

      conv.textContent = txt
      out += a + conv.innerHTML + aend
    }
    el.innerHTML = out
  })


    
  var oldquery = $('#oldquery')
  if(oldquery.size()) {
      $('#query').val(oldquery.attr("data-query"))
      if (oldquery.attr("data-case") == 'true') $('#case').attr("checked", 1)
      $('#query').blur();
  }    
});
