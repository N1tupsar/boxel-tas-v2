cd /home/user/boxel-tas-v2/work
while pgrep -f "regtest.sh L24d 24 topleft" >/dev/null; do sleep 3; done
export TO=100
bash regtest.sh L24d 24 rightloop '[[693,-296,40],[624,-328,30]]'
bash regtest.sh L24d 24 topcorr '[[545,328,50],[1100,328,50],[624,-328,30]]'
bash regtest.sh L24d 24 bottomleft '[[-135,-265,40],[624,-328,30]]'
