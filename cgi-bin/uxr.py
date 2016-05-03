#!/usr/bin/python3
import cgi
import os
import time
import re
import subprocess
import fnmatch

# Where the code lives, relative to the cgi $PWD
treename = "tree/"
# the path '/cgi-bin/uxr.py' to this script is hardcded in many places.
# too much trouble to make it variable, but s|...|...|g should do
# Maximum number of things to print in the result. 1k should be ok for a browser
# but still enough that we don't need paging.
limit = 1000

print("Content-Type: text/html")    # HTML is following
print()                             # blank line, end of headers

form = cgi.FieldStorage()
# the noframe option is if we want ajax-based loading... not sure.
noframe = "noframe" in form

# dump out the first part of the html template.
if not noframe:
    template = open("cgi-bin/template.html", "r")
    for l in template:
        if l != "##content\n":
            print(l, end="")
        else:
            break

# if we have "q", we display search results, else a dir index r files.
if "q" in form:
    query = form.getvalue("q")
    
    # inivisible tag that allows the client js to refill the form. We could also
    # fill the form in the template output above, but we cannot for obvious reasons.
    print('<span id="oldquery" data-query="%s" data-case="%s"></span>' 
          % (query, str('case' in form).lower()))
    
    # monster RE to parse the query syntax. It's fine, the syntax is regular.
    # handling escaped ' or " is nontrivial but should work.
    bare = '''([^'"\s]+(\\['"\s])?)+'''
    single = "'([^']*(\\')?)+'"
    double = '"([^"]*(\\")?)+"'
    value = '(?P<value>' + bare + '|' + single + '|' + double + ')'
    key = '(?P<key>([\w-]+:)?)'
    sign = '(?P<sign>-?)'
    term = sign + key + value + '\s*'
    qe = re.compile(term)
    commands =  [m.groupdict() for m in qe.finditer(query)]
    
    # clean up input (removing quotes) and translate some commands to more basic ones. 
    for term in commands:
        v = term['value']
        if   v[0] == '"' and v[-1] == '"': term['value'] = v[1:-1].replace('\\"', '"')
        elif v[0] == "'" and v[-1] == "'": term['value'] = v[1:-1].replace("\\'", "'")
        else: term['value'] = v.replace("\\'", "'").replace('\\"', '"')
        if term['key'] == '':
            term['value'] = re.escape(term['value'])
            term['key'] = 'regexp:'
        if term['key'] == 'ext:':
            term['value'] = '*.' + term['value']
            term['key'] = 'wildcard:'
        if term['key'] == 'path:':
            term['value'] = '*' + term['value'] + '*'
            term['key'] = 'wildcard:'
    
    files = set()
    fresh = True
    def run_ag(pattern, files):
        agoptions = ["ag", "-l", "-f"]
        if 'case' in form:
            agoptions.append("-s")
        else:
            agoptions.append("-i")
        agoptions.append(pattern)
        agoptions.append("--")
        if fresh:
            agoptions.append('.')
        else:
            if len(files) == 0: return []
            agoptions = agoptions + list(files)
        ag = subprocess.Popen(agoptions, stdout = subprocess.PIPE)
        out = [s[:len(s)-1] for s in ag.stdout.readlines()]
        ag.wait()
        return out
    
    os.chdir(treename)
    allre = []
        
    for term in commands:
        if term['key'] == 'regexp:':
            print(len(files))
            if term['sign'] == '-' and fresh:
                files = set(run_ag('.', files))
                print(len(files))
            out = run_ag(term['value'], files)
            if term['sign'] == '-':
                files.difference_update(out)
            else:
                files = set(out)
                allre.append(term['value'])
            term['handled'] = True
            fresh = False
            print(len(files))
        if term['key'] == 'wildcard:':
            print(len(files))
            if fresh:
                files = set(run_ag('.', files))
                print(len(files))
            p = bytes(term['value'], "UTF-8")
            if term['sign'] == '-':
                files = {f for f in files if not fnmatch.fnmatch(f, p)}
            else:
                files = {f for f in files if fnmatch.fnmatch(f, p)}
            term['handled'] = True
            fresh = False
            print(len(files))
    
    for term in commands:
        if 'handled' not in term:
            print("<p><b>Option '%s' not understood.</b></p>" % term['key'])
    if len(files) == 0:
        print("<p><b>No matching files.</b></p>")
        
    print('''<table class="results">
      <caption class="visually-hidden">Query matches</caption>
      <thead class="visually-hidden">
          <th scope="col">Line</th>
          <th scope="col">Code Snippet</th>
      </thead>
      <tbody>''')
    
    if len(allre) == 0:
        ctr = limit
        for f in sorted(files):
            ctr = ctr - 1
            if ctr == 0: break
            f = f.decode()
            print('''<tr class="result-head">
                <td class="left-column"><div class="unknown icon-container"></div></td>
                <td><a href="/cgi-bin/uxr.py?path=%s">%s</a></td>
                </tr>''' % (f, f))
    else:
        agoptions = ["ag", "-f", "--color",  "--color-match=X", "--heading"]
        if 'case' in form:
            agoptions.append("-s")
        else:
            agoptions.append("-i")
        agoptions.append("|".join(allre))
        agoptions.append("--")
        agoptions  = agoptions + sorted(files)
        ag = subprocess.Popen(agoptions, stdout = subprocess.PIPE)
        colorre = re.compile('\033\[[0-9;]*m|\033\[K')
        matchre = re.compile('\033\[Xm([^\033]*)\033\[0m')
        
        ctr = limit
        for s in ag.stdout:
            ctr = ctr - 1
            if ctr == 0: break
            if len(s) <= 1: continue
            l = cgi.escape(s[:len(s)-1].decode())
            l = re.sub(matchre, "<b>\\1</b>", l)
            l = re.sub(colorre, '', l)
            p = l.split(':', maxsplit=1)
            if len(p) == 1:
                currentfile = p[0]
                print('''<tr class="result-head">
                <td class="left-column"><div class="unknown icon-container"></div></td>
                <td><a href="/cgi-bin/uxr.py?path=%s">%s</a></td>
                </tr>''' % (currentfile, currentfile))
            else:
                print('''<tr><td class="left-column"><a href="/cgi-bin/uxr.py?path=%s#%s">%s</a></td>'''
                    % (currentfile, p[0], p[0]))
                print('<td><code>%s</code></td></tr>' % p[1])

    print('</tbody></table>')
    
# output a dir index/file
else:
    if "path" in form:
        path = form.getvalue("path")
    else:
        path = ""
        
    # sanitize input path. Probably not enough to be save for the web.
    path = [d for d in (treename + path).replace("..", "").split("/") if len(d) > 0]
    
    # output the breadcrumb line on top
    print('<div class="breadcrumbs">')
    a = []
    for i in range(0, len(path)):
        a.append('<a href="/cgi-bin/uxr.py?path=%s">%s</a>' % ('/'.join(path[1:i+1]), path[i]))
    print('<span class="path-separator">/</span>'.join(a))
    print('</div>')
    
    name = "/".join(path)
    
    # output the dir listing. The format is dxr-like but with less useless <a>.
    if os.path.isdir(name):
        print('''<table class="folder-content">
        <thead>
        <tr>
            <th scope="col">Name</th>
            <th scope="col">Modified</th>
            <th scope="col">Size</th>
        </tr>
        </thead>
        <tbody>''')
        
        # this is magic. Due to iterators and stuff it needs a list(...) now and
        # then to work.
        alllist = os.listdir(name)
        alllist = list(filter(lambda e: not e.startswith('.'), alllist))
        folders = filter(lambda e: os.path.isdir ("/".join(path + [e])), alllist)
        files   = filter(lambda e: os.path.isfile("/".join(path + [e])), alllist)
        dirlist = sorted(list(folders)) + sorted(list(files))
        
        for e in dirlist:
            f = "/".join(path + [e])
            a = "/".join(path[1:] + [e])
            icon = "icon unknown"
            if os.path.isdir(f):
                e = e + "/"
                icon = "icon folder"
            stat = os.stat(f)
            print("<tr>")
            print('<td><a href="/cgi-bin/uxr.py?path=%s" class="%s">%s</a></td>' 
                    % (a, icon, e))
            print("<td>%s</td>" % time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime)))
            print("<td>%d</td>" % stat.st_size)
        print("    </tbody>\n</table>")
        
    # output a file. Again dxr compatible format, to make some of the useful js work.
    # useless syntax HL might go here or in the js. Usful highlighting (with a
    # real parser) should probably be done somewhere else.
    elif os.path.isfile(name):
        f = list(open(name))
        print('''<table id="file" class="file">
        <thead class="visually-hidden">
            <th scope="col">Line</th>
            <th scope="col">Code</th>
        </thead>
        <tbody>
            <tr>
                <td id="line-numbers">''')
        
        for i in range(1, len(f)+1):
            print('<span id="%d" class="line-number" unselectable="on" rel="#%d">%d</span>' % (i, i, i))
            
        print('''</td>
        <td class="code">\n<pre>''')
        
        for i, l in enumerate(f):
            print('<code id="line-%d">%s</code>' % (i+1, cgi.escape(l[:len(l)-1])))
        print('''</pre>
                </td>
            </tr>
            </tbody>
        </table>''')

# output the rest of the template. Includes the links to lots of js code.
if not noframe:
    for l in template:
        print(l, end="")
            
