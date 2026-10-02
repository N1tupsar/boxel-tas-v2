#!/bin/bash
# usage: loop.sh TAG W NOISE LA TIME seeds...
TAG=$1;W=$2;N=$3;LA=$4;TM=$5;shift 5
for s in "$@"; do
 r=$(HV=${HV:-} NOISE=$N SEED=$((s*7919)) LA=$LA TIME=$TM node search2.js 30 $W 600000 | tail -1)
 echo "$TAG $N $LA $TM s$s $r" | cut -c1-400 >> loop_$TAG.log
done
echo DONE >> loop_$TAG.log
