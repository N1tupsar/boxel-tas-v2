# euc.sh level W timeout  -> Euclid-guided multibeam to the finish (ignores walls); log to euc_N.log
n=$1; W=${2:-400}; TO=${3:-90}
cd /home/user/boxel-tas-v2/work/tunnel/sim
F=$(node -e "const {Sim,loadLevel}=require('./boxel');const s=new Sim(loadLevel($n));const f=s.objects.find(o=>o.cls==='finish').body.position;console.log(JSON.stringify([[Math.round(f.x),-Math.round(f.y),20]]))")
for TM in 1000 4; do
r=$(WPS="$F" ALPHAS=0.5 LAMBDA=0 timeout $TO node multibeam.js $n $W $TM 2>&1 | tail -1 | cut -c1-400)
echo "L$n TM$TM WPS=$F $r" >> ../euc_$n.log
done
