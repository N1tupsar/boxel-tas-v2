#!/bin/bash
# usage: sweep.sh TMIN W T0...
TMIN=$1; W=$2; shift 2
for T0 in "$@"; do node suffix.js 16 $T0 $W $TMIN; done
