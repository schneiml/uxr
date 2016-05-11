#!/bin/bash
DIR=$(dirname $0)
rm $(find $DIR -name .cindex)
(cd $DIR/index && CSEARCHINDEX=.cindex cindex .)
(cd $DIR/tree && CSEARCHINDEX=.cindex cindex . * */*)
(cd $DIR/tree && ag -f -l > .files)
