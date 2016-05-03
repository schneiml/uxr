
$(function() {
  var oldquery = $('#oldquery')
    if(oldquery.size()) {
        $('#query').val(oldquery.attr("data-query"))
        if (oldquery.attr("data-case") == 'true') $('#case').attr("checked", 1)
    }    
    
    $(".content code").each(function(i, el) {
        var line = el.id.match(/line-([0-9]+)/)[1]
        var html = el.innerHTML
        var out = ""
        var intag = false
        var ina = false
        var wordchar = /[a-zA-Z0-9_]/
        for (var i = 0; i < html.length; i++) {
            if(!intag) {
                if (wordchar.test(html[i])) {
                    if (!ina) out += '<a class="range" data-start=":' + line + ':' + i + '">'
                    ina = true
                } else {
                    if(ina) out += '</a>'
                    ina = false
                }
                if (html[i] == '<' || html[i] == '&') {
                    intag = true
                }
            } else {
                if (html[i] == '>' || html[i] == ';') {
                    intag = false
                }
            }
            out += html[i]
        }
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
