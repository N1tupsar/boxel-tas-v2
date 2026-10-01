# rsweep.sh dir count seed
cd /home/user/boxel-tas-v2/work/$1/sim; RANDOM=$3
for i in $(seq 1 $2); do
 R=$((15+RANDOM%26)); LK=$((6+RANDOM%20)); W=$((500+RANDOM%6*100)); T0=$(( (RANDOM%5)*15 ))
 echo "$(bash rpl.sh $W $T0 $R $LK)" >> rs_$3.log
done
