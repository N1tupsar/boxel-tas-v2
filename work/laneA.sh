# laneA.sh dir n  : refprog sweeps on current best, then suffix loop
cd /home/user/boxel-tas-v2/work/$1/sim; n=$2
for P in "800 0 30 12" "800 0 20 20" "1000 0 15 25" "800 30 25 10" "800 60 30 15" "800 0 40 8"; do bash rpl.sh $P >> A.log 2>&1; done
bash loop.sh sfx 1000 30 70 110 150 190 230 270 320 >/dev/null 2>&1
