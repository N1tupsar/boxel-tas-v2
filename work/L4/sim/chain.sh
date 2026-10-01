#!/bin/sh
# usage: chain.sh N seedstart count ge_ms rs_ms maxt
N=$1; S=$2; C=$3
i=0
while [ $i -lt $C ]; do
  s=$((S+i)); rm -f l${N}_found.jsonl.$s
  node ge_save.js $N $s $4 > cg$s.log 2>&1
  J=$(head -1 cg$s.log | sed 's/.*verified [0-9]* //')
  case "$J" in \[*) J="$J" timeout $(( $5/1000 + 20 )) node rs.js $N $s $5 $6 > cr$s.log 2>&1; echo "seed $s: $(head -1 cg$s.log | cut -c1-20) -> $(tail -n 1 cr$s.log | cut -c1-110)" >> chain_$S.out;; esac
  i=$((i+1))
done
