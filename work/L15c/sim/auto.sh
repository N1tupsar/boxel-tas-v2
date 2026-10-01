#!/bin/sh
# usage: auto.sh N seedstart count ge_ms rs_ms maxt
N=$1; S=$2; C=$3; i=0
while [ $i -lt $C ]; do
  s=$((S+i))
  node ge_save.js $N $s $4 > ag$s.log 2>&1
  J=$(head -1 ag$s.log | sed 's/.*verified [0-9]* //')
  case "$J" in \[*) J="$J" timeout $(( $5/1000 + 15 )) node rs.js $N $s $5 $6 > ar$s.log 2>&1; echo "$(tail -n 1 ar$s.log | awk '{print $2}') seed $s $(tail -n 1 ar$s.log | cut -d' ' -f4)" >> auto_$S.out;; esac
  i=$((i+1))
done
