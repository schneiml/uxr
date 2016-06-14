UXR Code Search
===============

The beginning of UXR was when I tried to set up [Mozilla DXR](https://github.com/mozilla/dxr). It is a really nice and very useful tool, but the amount of dependencies makes it iimpossible to setup for a small project.

So, UXR takes the web frontend of DXR (with some modfications) and replaces the backend by a single, simple Python3 CGI script. The actual search backend can be a simple grep-like tool (at the moment [the_silver_searcher](http://geoff.greer.fm/ag/), ag, or Russ Cox' great [codesearch](https://github.com/google/codesearch). The Clang-based indexer can still be used, but its output is simply stored and searched as CSV textfiles. No elasticsearch involved. No containers needed. No non-standard python dependencies.


Setup
-----

Clone uxr, create a `tree/` subfolder and populate it with code, and point a webserver at the CGI script.

    python3 -m http.server --cgi
    
In `uxr.py`, you can change some settings and search backends. The default setup uses `csearch` (so install go and `go get` it), and needs an index of filenames. Create the indexes:

    ./make_cindex.sh
    
If you want the clang index, you have to create that _first_; refer to `clang/make-index.sh`.

Bugs & Problems
---------------

- Only C/C++ really supported atm.
- The web frontend can freeze even fast browsers for a while when rendering a large (5kLOC) file.
- Syntax highlighting together with match highlighting is compilcated and broken.
- The precise search rules involving the clang index are not fully clear (normally all terms are `and` connected, but the index matches are in general `or`ed into the results)
- `codesearch`/`cindex` seems to fail on huge indexing CSV files. Therfore, `ag` is currently used for the index which does not scale well.
- The UI is sometimes misleading, due to being ripped off its backend.

License
-------

This is based on DXR, released by David Humphrey under the MIT license. Use the code added here under the same license.
