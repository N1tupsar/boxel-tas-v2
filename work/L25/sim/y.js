const {toTas,emulate}=require('./tas');const {loadLevel}=require('./boxel');const L=loadLevel(25);
// j0 variant: tick-0 jump = leading "j0" + toTas of the rest, emulate with first jump pending
for(const J of [[1,7,9,10,13,15],[0,5,8,9,11,13],[0,15,64,75,90]]){
 const rest=J[0]===0?J.slice(1):J; const a=toTas(rest); const arr=J[0]===0?['j0',...a]:a;
 console.log(JSON.stringify(arr));
}
