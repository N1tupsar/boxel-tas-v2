cd /home/user/boxel-tas-v2/work
export TO=170 W=700
bash regtest.sh L28d 28 va '[[-228,6,16],[144,240,14]]'
bash regtest.sh L28d 28 vb '[[-228,6,12],[-228,100,40],[-100,225,40],[144,240,10]]'
bash regtest.sh L28d 28 vc '[[-228,6,16],[-228,150,30],[144,240,14],[700,240,60],[1500,240,60]]'
