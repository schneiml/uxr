#!/bin/bash
# Run this where you would normally build the code like "../../uxr/clang/make-index.sh make".
# it will run the argument with the environment set up to dump index data to the index/ folder.

BASE_DIR=$(readlink -e  $(dirname $0))
INDEXDIR=$BASE_DIR/../index # the index should be a sibling of the source tree
CLANG_PLUGIN=$BASE_DIR/libclang-index-plugin.so
MAKECMD="$1"

mkdir -p $INDEXDIR
# rm $INDEXDIR/*

if [ ! -f $CLANG_PLUGIN ]; then # try to make the plugin if it is not there
    ( cd $(dirname $CLANG_PLUGIN); make)
fi

export DXR_CXX_CLANG_TEMP_FOLDER=$INDEXDIR # this is the output
export DXR_CXX_CLANG_OBJECT_FOLDER=/tmp    # this should be the make output, to detect generated sources
# lots of options to enable the plugin. The last determins which source files are considered interesting
export DXR_CLANG_FLAGS="-Xclang -load -Xclang $CLANG_PLUGIN -Xclang -add-plugin -Xclang dxr-index -Xclang -plugin-arg-dxr-index -Xclang ${PWD/tree*/tree}"

export CXX="clang++ $DXR_CLANG_FLAGS"
export CC="clang $DXR_CLANG_FLAGS"

eval $MAKECMD
