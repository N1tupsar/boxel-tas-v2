for T in "$@"; do
 T0=$T CHR=1 node gb.js 300 3 > gsd$T.log 2>&1
 J=$(tail -n 1 gsd$T.log | node -e "try{const r=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(JSON.stringify(r.jumps||[]))}catch(e){console.log('[]')}")
 [ "$J" != "[]" ] && node save.js "$J" >> drv.out
done
