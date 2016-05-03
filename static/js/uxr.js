
$(function() {
  var oldquery = $('#oldquery')
    if(oldquery.size()) {
        $('#query').val(oldquery.attr("data-query"))
        if (oldquery.attr("data-case") == 'true') $('#case').attr("checked", 1)
    }    
    
    $(".content code").each(function(i, el) {
        var line = el.id.match(/line-([0-9]+)/)[1]
        var html = el.innerHTML
        // quoted things, identifiers including . or ->, namespaces (including plain words) and <...> as long as it is not fancy
        var interesting = /"[^"]"|-&gt;\w+|\.\w+|&lt;[\w/.]+&gt;|\w\w\w+/g
        var inner = /[\w][\w/.: ]+[\w]/ // this is what we really care about inside the above
        var current = 0
        out = ''
        while ((match = interesting.exec(html)) != null) {
            var i = match.index
            var submatch = inner.exec(match[0])
            if (!submatch) continue
            i += submatch.index
            var j = i + submatch[0].length
            out += html.substr(current, i - current)
            current = i
            
            var offset = 0
            var current_str = html.substr(0, current)
            var tags = /<[^>]*>|&[^;]*;/g
            while ((tag = tags.exec(current_str)) != null) offset += tag[0].length - 1
            
            out += '<a class="range" data-start=":' + line + ':' + (i-offset) + '">'
            out += html.substr(current, j - current)
            current = j
            out += '</a>'
        }
        out += html.substr(current, html.length - current)
            
        el.innerHTML = out
    });
    $("a.range").click(function(event) {
        var file = document.location.href.match(/path=[^&]*\/([^&]+)/)
        if (!file) file = $(event.target.parentElement).attr("data-file")
        else file = file[1]
        var uxr =  document.location.href.match(/([^?]*).*/)[1]
        event.target.href = uxr + "?q='" + file + $(event.target).attr("data-start") + "'"
    });
});
