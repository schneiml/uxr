
$(function() {
     
  var uxr =  document.location.href.match(/([^?]*).*/)[1]
  var file = document.location.href.match(/path=([^&]*\/[^#&]+)/)
  if (file) file = file[1]
  var syntax = /(\w+:"[^"]*")|"([^"]*)"|(\/\*.*\*\/|\/\/.*)$|\b(if|else|for|while|class|struct|union|static|virtual|const)\b|(\w([\w0-9_]+:?:?)+)\b|./g
  var conv = document.createElement("p");

  function makea(txt, file, line, idx) {
    if (line) {
      return '<a class="range" href="' + uxr + '?q=loc:' + file + ':' + line + ':' + (idx) + " " + encodeURIComponent(txt) + '">'
    } else {
      return '<a class="range" href="' + uxr + '?q=' + encodeURIComponent(txt) + '">'
    }
  }

  $(".content code").each(function(i, el) {
    if (!file) file = $(el).attr("data-file")
    var line = el.id.match(/line-([0-9]+)/)
    if (line) line = line[1]
    var text = el.textContent

    var out = ''
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
        a = makea('"' + match[2] + '"', file, line, idx)
        aend = '</a>'
      }
      if (match[3]) /* comment */ {
        a = '<span class="c">'
        aend = '</span>'
      }
      if (match[4]) /* keyword */ {
        a = '<span class="k">'
        aend = '</span>'
      }
      if (match[5]) /* identifier */ {
        a = makea("'" + match[5] + "'", file, line, idx)
        aend = '</a>'
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
  }    
});
