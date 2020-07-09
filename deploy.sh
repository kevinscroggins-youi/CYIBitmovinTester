#!/bin/bash

./generate.rb -p tizen-nacl
./build.rb -b build/tizen-nacl/Debug
tizen install -n /Users/kevinscroggins/youidev/Projects/CYIBitmovinTester/build/tizen-nacl/Debug/BitmovinTester-Debug.wgt
tizen run -p 0CYQbLheLf.bitmovintester
