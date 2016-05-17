
$(function() {

  // useless ( = line-based) syntax highlighting
  function syntax_hl(text) {
     var kw = /^([^<>]*(<[^>]*>[^<>]*)*)\b(if|else|for|while|class|struct|union|static|virtual|const)\b/g
     var string = /"[^"]*"/g
     var comment = /\/\/.*|\/\*.*\*\//
     text = text.replace(kw, '$1<span class="k">$3</span>')
     return text
  }
     
    
  var oldquery = $('#oldquery')
    if(oldquery.size()) {
        $('#query').val(oldquery.attr("data-query"))
        if (oldquery.attr("data-case") == 'true') $('#case').attr("checked", 1)
    }    
    
    $(".content code").each(function(i, el) {
        var file = document.location.href.match(/path=([^&]*\/[^#&]+)/)
        if (!file) file = $(el).attr("data-file")
        else file = file[1]
            
        var uxr =  document.location.href.match(/([^?]*).*/)[1]
        
        var line = el.id.match(/line-([0-9]+)/)
        if (line) line = line[1]
            
        var html = el.innerHTML.replace(/&amp;/g, "&#38;")
        
        var interesting = /(\w+:)?"[^"]*"|&lt;[\w/.:]+&gt;|\w\w[\w/]+/g
        
        var current = 0
        out = ''
        while ((match = interesting.exec(html)) != null) {
            var i = match.index
            var j = i + match[0].length
            if (match[0].startsWith("&lt;")) i += 4
            if (match[0].endsWith  ("&gt;")) j -= 4
            var txt = html.substr(i, j-i)
            if(!txt.match(/\w+:/)) txt = "'" + txt + "'"
                
            out += html.substr(current, i - current)
            current = i
            
            var current_str = html.substr(0, current)
            var offset = current_str.length - $("<div>").html(current_str).text().length
            
            if (line) {
                var tag = '<a class="range" href="' + uxr + '?q=loc:' + file + ':' + line + ':' + (i-offset) + " " + encodeURIComponent(txt) + '">'
                out += tag
            } else {
                out += '<a class="range" href="' + uxr + '?q=' + encodeURIComponent(txt) + '">'
            }
            out += html.substr(current, j - current)
            current = j
            out += '</a>'
        }
        out += html.substr(current, html.length - current)
            
        el.innerHTML = out //syntax_hl(out)
    });
});
