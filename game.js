(()=>{"use strict";
const c=document.getElementById("game"),x=c.getContext("2d"),hp=document.getElementById("hp"),arm=document.getElementById("arm"),waveEl=document.getElementById("wave"),zEl=document.getElementById("zombies"),ammo=document.getElementById("ammo"),msg=document.getElementById("message"),start=document.getElementById("startOverlay"),pause=document.getElementById("pauseOverlay"),startBtn=document.getElementById("startBtn"),resume=document.getElementById("resumeBtn"),pauseBtn=document.getElementById("pauseBtn"),reloadBtn=document.getElementById("reloadBtn"),grenadeBtn=document.getElementById("grenadeBtn"),ms=document.getElementById("moveStick"),as=document.getElementById("aimStick");
let W,H,last=0,running=false,paused=false,wave=1,left=0,spawnT=0,inter=0,player,z=[],b=[],g=[],p=[],keys={},clock=0;const mv={x:0,y:0,id:null},aim={x:0,y:0,id:null};
const C={base:700,perWave:0,spawnMs:20,max:700,speed:240};
function resize(){W=c.width=innerWidth;H=c.height=innerHeight}addEventListener("resize",resize);resize();
function message(t){msg.textContent=t;clearTimeout(message.t);message.t=setTimeout(()=>msg.textContent="",1000)}
function reset(){z=[];b=[];g=[];p=[];wave=1;clock=0;player={x:W/2,y:H/2,r:17,hp:100,arm:50,ammo:12,a:0,cd:0,walk:0,move:0,shootT:0,reloadT:0,throwT:0};newWave()}
function newWave(){left=C.base+(wave-1)*C.perWave;spawnT=0;inter=0;message("WAVE "+wave)}
function spawn(){if(left<=0||z.length>=C.max)return;let s=Math.floor(Math.random()*4),px,py;if(s===0){px=Math.random()*W;py=-25}else if(s===1){px=W+25;py=Math.random()*H}else if(s===2){px=Math.random()*W;py=H+25}else{px=-25;py=Math.random()*H}z.push({x:px,y:py,r:13+Math.random()*3,v:55+Math.random()*23,phase:Math.random()*6.28,h:0,hitT:0,dead:false,deathT:0,deathLen:.48+Math.random()*.22,variant:Math.floor(Math.random()*20),walkStyle:Math.floor(Math.random()*3),deathStyle:Math.floor(Math.random()*3),turn:Math.atan2(player.y-py,player.x-px)+Math.PI/2,bloodLevel:Math.random(),skinTone:Math.random()});left--}
function shoot(){if(!running||paused||player.cd>0)return;let dx=aim.x,dy=aim.y;if(Math.hypot(dx,dy)<.2){dx=Math.cos(player.a);dy=Math.sin(player.a)}let d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;player.a=Math.atan2(dy,dx);b.push({x:player.x+dx*24,y:player.y+dy*24,vx:dx*850,vy:dy*850,t:.6});player.cd=.07;player.ammo=12;player.shootT=.12;p.push({x:player.x+dx*27,y:player.y+dy*27,t:.07,m:.07,k:"m"})}
function grenade(){if(!running||paused)return;let dx=aim.x,dy=aim.y;if(Math.hypot(dx,dy)<.2){dx=Math.cos(player.a);dy=Math.sin(player.a)}let d=Math.hypot(dx,dy)||1;g.push({x:player.x+dx*18,y:player.y+dy*18,vx:dx/d*430,vy:dy/d*430,t:.55});player.throwT=.32}
function reload(){if(!player)return;player.ammo=12;if(running&&!paused)player.reloadT=.42}
function hurt(v){}
function killZombie(e){if(e.dead)return;e.dead=true;e.deathT=e.deathLen||.58;e.hitT=0;blood(e.x,e.y,e.variant)}
function update(dt){if(!running||paused)return;clock+=dt;player.cd=Math.max(0,player.cd-dt);player.shootT=Math.max(0,player.shootT-dt);player.reloadT=Math.max(0,player.reloadT-dt);player.throwT=Math.max(0,player.throwT-dt);spawnT-=dt*1000;while(left>0&&spawnT<=0&&z.length<C.max){spawn();spawnT+=C.spawnMs}
let mx=mv.x,my=mv.y;if(keys.w||keys.arrowup)my--;if(keys.s||keys.arrowdown)my++;if(keys.a||keys.arrowleft)mx--;if(keys.d||keys.arrowright)mx++;let moveLen=Math.hypot(mx,my);let d=moveLen||1;if(moveLen>0){mx/=d;my/=d}player.move=moveLen>0?1:0;player.walk+=dt*(player.move?10:2);player.x=Math.max(24,Math.min(W-24,player.x+mx*C.speed*dt));player.y=Math.max(24,Math.min(H-24,player.y+my*C.speed*dt));
if(Math.hypot(aim.x,aim.y)>.2){player.a=Math.atan2(aim.y,aim.x);shoot()}
for(const q of b){q.x+=q.vx*dt;q.y+=q.vy*dt;q.t-=dt;for(const e of z)if(!e.dead&&Math.hypot(q.x-e.x,q.y-e.y)<e.r+4){killZombie(e);q.t=0;break}}b=b.filter(q=>q.t>0&&q.x>-40&&q.x<W+40&&q.y>-40&&q.y<H+40);
for(const q of g){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.985;q.vy*=.985;q.t-=dt;if(q.t<=0){boom(q.x,q.y);q.dead=1}}g=g.filter(q=>!q.dead);
for(const e of z){if(e.dead){e.deathT-=dt;continue}e.hitT=Math.max(0,e.hitT-dt);let dx=player.x-e.x,dy=player.y-e.y,dist=Math.hypot(dx,dy)||1;e.phase+=dt*(e.v*.12);const desiredTurn=Math.atan2(dy,dx)+Math.PI/2;let turnDelta=((desiredTurn-e.turn+Math.PI*3)%(Math.PI*2))-Math.PI;e.turn+=turnDelta*Math.min(1,dt*9);e.x+=dx/dist*e.v*dt;e.y+=dy/dist*e.v*dt;if(dist<e.r+player.r+3)hurt(12*dt)}z=z.filter(e=>!e.dead||e.deathT>0);for(const q of p)q.t-=dt;p=p.filter(q=>q.t>0);
if(left===0&&z.filter(e=>!e.dead).length===0){inter+=dt;if(inter>.5){wave++;newWave()}}
hp.textContent="∞";arm.textContent="∞";waveEl.textContent=wave;zEl.textContent=z.length+left;ammo.textContent="∞"}
function blood(x,y,variant=0){const count=5+Math.floor(Math.random()*4);for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,d=Math.random()*19;p.push({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,t:.34+Math.random()*.38,m:.72,k:"b",r:1.5+Math.random()*3.2,rot:Math.random()*6.28})}p.push({x,y,t:.85,m:.85,k:"s",r:5+Math.random()*5})}
function boom(x,y){p.push({x,y,t:.35,m:.35,k:"e"});for(const e of z){let dx=e.x-x,dy=e.y-y,dist=Math.hypot(dx,dy);if(!e.dead&&dist<105)killZombie(e)}}
function limb(x1,y1,x2,y2,w,col){x.strokeStyle=col;x.lineWidth=w;x.lineCap="round";x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke()}
function drawZombie(e){
 const dying=e.dead,life=dying?Math.max(0,e.deathT/(e.deathLen||.58)):1;
 const step=Math.sin(e.phase)*3.4,side=Math.cos(e.phase*.72)*2.1,reach=Math.sin(e.phase*.82);
 // Twenty compact procedural palettes keep the horde varied without sprite downloads.
 const looks=[
  {skin:"#65745a",cloth:"#4e5142",pants:"#34372f",accent:"#8c2525"},
  {skin:"#77766b",cloth:"#34434a",pants:"#272f32",accent:"#a52b2b"},
  {skin:"#626a55",cloth:"#693f3a",pants:"#38302b",accent:"#7d2222"},
  {skin:"#7c6b5c",cloth:"#5a5140",pants:"#39352c",accent:"#6f171b"},
  {skin:"#565f55",cloth:"#3f4141",pants:"#292d2b",accent:"#8d2024"},
  {skin:"#b0a18a",cloth:"#493b35",pants:"#272629",accent:"#9d2427"},
  {skin:"#8c9a78",cloth:"#414b35",pants:"#31382c",accent:"#6f2022"},
  {skin:"#8e7771",cloth:"#46323d",pants:"#2e2932",accent:"#a92d30"},
  {skin:"#b3b4a0",cloth:"#4a4d52",pants:"#303136",accent:"#7d2528"},
  {skin:"#6b6651",cloth:"#786b4d",pants:"#3f392d",accent:"#9a2925"},
  {skin:"#9c8060",cloth:"#573f2e",pants:"#332b25",accent:"#7f1d21"},
  {skin:"#525b61",cloth:"#384b59",pants:"#262d35",accent:"#a02c32"},
  {skin:"#a8a08d",cloth:"#5e5a58",pants:"#3a3635",accent:"#752025"},
  {skin:"#74816a",cloth:"#594c32",pants:"#383326",accent:"#a22b26"},
  {skin:"#887f6a",cloth:"#494c31",pants:"#2f3325",accent:"#772126"},
  {skin:"#a08b8b",cloth:"#533b42",pants:"#33292e",accent:"#b02b31"},
  {skin:"#62645e",cloth:"#625d5b",pants:"#343333",accent:"#872125"},
  {skin:"#b6ad95",cloth:"#3f4541",pants:"#2b302d",accent:"#9e2428"},
  {skin:"#81705b",cloth:"#6b3f32",pants:"#3b2e29",accent:"#aa2828"},
  {skin:"#737d83",cloth:"#3b3f4e",pants:"#292b37",accent:"#7e2029"}
 ];
 const look=looks[e.variant%looks.length],skin=look.skin,cloth=look.cloth,pants=look.pants,accent=look.accent;
 let rot=0,lean=0,fall=0;
 if(dying){fall=(1-life);if(e.deathStyle===0){rot=fall*1.42;lean=fall*5}else if(e.deathStyle===1){rot=-fall*1.72;lean=fall*2}else{rot=fall*.45;lean=fall*10}}
 x.save();x.translate(e.x,e.y+lean);x.rotate(dying?rot:e.turn+Math.sin(e.phase*.5)*.025);x.globalAlpha=dying?Math.min(1,life*1.8):1;
 if(dying&&e.deathStyle===2)x.scale(1+fall*.28,1-fall*.14);
 // Distinct gait rhythms and body silhouettes.
 if(!dying){let l=step,r=-step;if(e.walkStyle===1){l=side+step*.45;r=-side-step*.45}else if(e.walkStyle===2){l=step*1.25;r=-step*.65}
  limb(-4,4,-5+l,12,5,pants);limb(4,4,5+r,12,5,pants);
 }
 x.fillStyle=cloth;x.beginPath();const shape=e.variant%6;if(shape===1)x.ellipse(0,1,e.r*.79,e.r*.8,0,0,Math.PI*2);else if(shape===2)x.ellipse(0,1,e.r*.48,e.r*.9,0,0,Math.PI*2);else if(shape===3){x.moveTo(-e.r*.62,-7);x.lineTo(e.r*.55,-7);x.lineTo(e.r*.8,5);x.lineTo(4,8);x.lineTo(-e.r*.72,5);x.closePath()}else if(shape===4){x.ellipse(0,1,e.r*.67,e.r*.72,0,0,Math.PI*2)}else x.ellipse(0,1,e.r*.62,e.r*.83,0,0,Math.PI*2);x.fill();
 // Dark collar and shoulder shadows reinforce the human upper-body silhouette.
 x.fillStyle="#252522";x.beginPath();x.moveTo(-5,-7);x.lineTo(0,-4.5);x.lineTo(5,-7);x.lineTo(3,-2);x.lineTo(-3,-2);x.closePath();x.fill();
 // Torn seams, contrasting undershirts, and grime stripes.
 x.strokeStyle="#201f1d";x.lineWidth=2;x.beginPath();x.moveTo(-5,-7);x.lineTo(-2,-1);x.lineTo(-6,3);x.moveTo(4,-5);x.lineTo(2,1);x.lineTo(6,6);x.stroke();
 if(e.variant%4===1){x.fillStyle="#a5a09a";x.fillRect(-2,-7,4,11)}else if(e.variant%4===2){x.fillStyle="#272727";x.fillRect(-2,-7,3,12)}else if(e.variant%4===3){x.fillStyle="#c0b59a";x.fillRect(-5,-5,2,7);x.fillRect(3,-3,2,7)}
 // Reaching-horror gait: shoulders flare outward, elbows bend, and forearms
 // reach toward the zombie's facing direction (local -Y). Small asymmetry keeps
 // the horde from looking perfectly synchronized while using only cheap line art.
 if(!dying){
  const gait=e.walkStyle===1?side*.55:step*.22;
  const reachL=reach*(e.walkStyle===2?1.4:1.0),reachR=Math.sin(e.phase*.82+1.05)*(e.walkStyle===1?1.25:.9);
  const lx=-5.5-gait*.35,rx=5.5+gait*.35;
  const lex=-9.5-gait+reachL*.65, rex=9.5+gait+reachR*.65;
  const ley=-6.5+Math.abs(step)*.12, rey=-6.2+Math.abs(step)*.1;
  const lwx=-6.5+reachL*.9, rwx=6.5+reachR*.9;
  const lwy=-13.2+reachL*.8, rwy=-13.8+reachR*.8;
  limb(lx,-3,lex,ley,4.8,skin);limb(rx,-3,rex,rey,4.8,skin);
  limb(lex,ley,lwx,lwy,3.8,skin);limb(rex,rey,rwx,rwy,3.8,skin);
  // Small claw-like fingers are readable at close range but inexpensive to draw.
  limb(lwx,lwy,lwx-2.0,lwy-2.2,1.7,skin);limb(lwx,lwy,lwx+.5,lwy-2.8,1.6,skin);
  limb(rwx,rwy,rwx+2.0,rwy-2.2,1.7,skin);limb(rwx,rwy,rwx-.5,rwy-2.8,1.6,skin);
 }
 // Forward-thrust head and neck make the stance feel hunched and predatory.
 x.fillStyle=skin;x.beginPath();x.ellipse(0,-e.r*.38,3.1,4.4,-.08,0,Math.PI*2);x.fill();
 // Head shape and face details.
 x.fillStyle=e.hitT>0?"#f0d6c1":skin;x.beginPath();if(e.variant%5===2)x.ellipse(e.variant%2?1:-1,-e.r*.66,e.r*.32,e.r*.42,0,0,Math.PI*2);else x.arc(e.variant%3===0?1:-1,-e.r*.66,e.variant%5===1?e.r*.39:e.r*.42,0,Math.PI*2);x.fill();
 x.fillStyle="#1a1412";x.beginPath();x.arc(-4,-e.r*.69,1.7,0,Math.PI*2);x.arc(2,-e.r*.72,1.4,0,Math.PI*2);x.fill();
 // Palette-specific wounds and bruises; stylised at game scale.
 x.fillStyle=accent;x.beginPath();x.ellipse(-5,-2,3.2+(e.variant%3)*.5,2.2,-.5,0,Math.PI*2);x.fill();x.fillRect(3,1,3,5);x.fillRect(-2,5,4,2);
 x.strokeStyle="#261c1a";x.lineWidth=1.6;x.beginPath();x.moveTo(-7,-5);x.lineTo(-3,-1);x.moveTo(5,-4);x.lineTo(2,-1);x.stroke();
 const mark=e.variant%10;
 if(mark===0||mark===6){x.fillStyle="#282c25";x.beginPath();x.moveTo(6,-7);x.lineTo(10,-3);x.lineTo(7,0);x.fill()}
 if(mark===1||mark===7){x.fillStyle="#4b2424";x.beginPath();x.ellipse(5,3,4,3,.5,0,Math.PI*2);x.fill();x.fillStyle=accent;x.fillRect(-6,-7,4,3)}
 if(mark===2||mark===8){x.fillStyle="#29201d";x.beginPath();x.moveTo(-8,-3);x.lineTo(-4,-7);x.lineTo(-3,1);x.fill();x.fillStyle=accent;x.fillRect(2,4,3,4)}
 if(mark===3||mark===9){x.fillStyle="#a6a18a";x.fillRect(-5,-4,3,3);x.fillStyle=accent;x.fillRect(3,-1,4,3)}
 if(mark===4){x.fillStyle="#211b1a";x.beginPath();x.moveTo(-6,-8);x.lineTo(-1,-6);x.lineTo(-4,-2);x.fill();x.fillStyle=accent;x.fillRect(-6,2,5,4)}
 if(e.variant>=10){x.strokeStyle=accent;x.lineWidth=1.8;x.beginPath();x.moveTo(-6,4);x.lineTo(-2,7);x.lineTo(1,3);x.stroke()}
 if(e.variant%7===5){x.fillStyle="#272323";x.fillRect(-7,-10,13,3);x.fillRect(-4,-13,8,3)}
 if(dying){x.globalAlpha=Math.max(.12,life);x.fillStyle="#6f1518";x.beginPath();x.ellipse(0,7,8+fall*5,3+fall*2,0,0,Math.PI*2);x.fill();if(e.deathStyle===1)limb(-2,1,-12,8,3,skin)}
 x.restore();x.globalAlpha=1;
}
function drawPlayer(){if(!player)return;let walk=player.move?Math.sin(player.walk)*4:Math.sin(player.walk)*.5,shoot=player.shootT>0?player.shootT/.12:0,reload=player.reloadT>0?Math.sin((.42-player.reloadT)/.42*Math.PI):0,throwing=player.throwT>0?player.throwT/.32:0;x.save();x.translate(player.x,player.y);x.rotate(player.a);
// legs and boots animate with movement
limb(-5,5,-6+walk,13,5,"#252b2e");limb(5,5,6-walk,13,5,"#252b2e");x.fillStyle="#171a1b";x.fillRect(-9+walk,10,7,4);x.fillRect(2-walk,10,7,4);
// torso and head
x.fillStyle="#56605a";x.beginPath();x.ellipse(0,1,10,12,0,0,Math.PI*2);x.fill();x.fillStyle="#b39a7d";x.beginPath();x.arc(3,-8,6,0,Math.PI*2);x.fill();x.fillStyle="#343a3a";x.fillRect(-3,-14,10,4);
// rear arm and animated weapon arm
limb(-4,-1,-9,4,4,"#8e806a");let armY=throwing?-11*throwing:(reload?-7*reload:0);limb(4,-2,10+shoot*2,armY+1,4,"#a18d73");
// pistol points forward; recoil and reload visibly move it
x.save();x.translate(7+shoot*3,armY);x.rotate(reload*.7+throwing*.9);x.fillStyle="#b9b9b3";x.fillRect(0,-3,18,6);x.fillStyle="#292b2b";x.fillRect(8,-4,9,3);x.fillStyle="#111";x.fillRect(4,1,5,7);x.restore();
if(throwing>.05){x.fillStyle="#8b8b83";x.beginPath();x.arc(13,-11,3.5,0,Math.PI*2);x.fill()}if(reload>.1){x.strokeStyle="#d7c7a5";x.lineWidth=2;x.beginPath();x.arc(7,-3,8,-.8,.9);x.stroke()}x.restore()}
function draw(){x.clearRect(0,0,W,H);x.fillStyle="#151515";x.fillRect(0,0,W,H);x.strokeStyle="#383838";x.lineWidth=3;x.strokeRect(18,18,W-36,H-36);
for(const q of p){let a=q.t/q.m;if(q.k==="b"){x.globalAlpha=a;x.fillStyle="#76191c";x.save();x.translate(q.x,q.y);x.rotate(q.rot||0);x.beginPath();x.ellipse(0,0,q.r||3,(q.r||3)*.58,0,0,Math.PI*2);x.fill();x.restore()}else if(q.k==="s"){x.globalAlpha=a*.7;x.fillStyle="#501316";x.beginPath();x.ellipse(q.x,q.y,q.r||7,(q.r||7)*.55,0,0,Math.PI*2);x.fill()}else if(q.k==="m"){x.globalAlpha=a;x.fillStyle="#fff1a8";x.beginPath();x.arc(q.x,q.y,13,0,7);x.fill()}else{x.globalAlpha=a;x.strokeStyle="#ffcc55";x.lineWidth=6;x.beginPath();x.arc(q.x,q.y,60*(1-a)+8,0,7);x.stroke()}}x.globalAlpha=1;
for(const q of g){x.fillStyle="#777";x.beginPath();x.arc(q.x,q.y,7,0,7);x.fill()}for(const e of z)drawZombie(e);drawPlayer()}
function frame(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
function toggle(){if(!running)return;paused=!paused;pause.classList.toggle("hidden",!paused);pauseBtn.textContent=paused?"▶":"Ⅱ";if(paused)mv.x=mv.y=aim.x=aim.y=0}
function startGame(e){e.preventDefault();e.stopPropagation();if(running)return;reset();running=true;paused=false;start.classList.add("hidden");pause.classList.add("hidden")}
function bind(el,fn){let suppressClick=false;el.addEventListener("touchstart",e=>{e.preventDefault();e.stopPropagation();suppressClick=true;fn(e);setTimeout(()=>suppressClick=false,700)},{passive:false});el.addEventListener("click",e=>{e.preventDefault();if(suppressClick){suppressClick=false;return}fn(e)})}
bind(startBtn,startGame);bind(resume,toggle);bind(pauseBtn,toggle);bind(reloadBtn,reload);bind(grenadeBtn,grenade);
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=1;if(e.key==="Escape")toggle();if(e.key.toLowerCase()==="r")reload();if(e.key.toLowerCase()==="g")grenade()});addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);
function stick(el,s){el.addEventListener("touchstart",e=>{e.preventDefault();if(s.id!==null)return;s.id=e.changedTouches[0].identifier;moveStick(e.changedTouches[0],el,s)},{passive:false})}
function moveStick(t,el,s){let r=el.getBoundingClientRect(),dx=t.clientX-(r.left+r.width/2),dy=t.clientY-(r.top+r.height/2),m=r.width*.37,d=Math.hypot(dx,dy)||1;if(d>m){dx=dx/d*m;dy=dy/d*m}s.x=dx/m;s.y=dy/m;el.querySelector(".knob").style.transform=`translate(${dx}px,${dy}px)`}
function clearStick(el,s){s.id=null;s.x=s.y=0;el.querySelector(".knob").style.transform="translate(0,0)"}
stick(ms,mv);stick(as,aim);document.addEventListener("touchmove",e=>{e.preventDefault();for(const t of e.touches){if(t.identifier===mv.id)moveStick(t,ms,mv);if(t.identifier===aim.id)moveStick(t,as,aim)}},{passive:false});document.addEventListener("touchend",e=>{for(const t of e.changedTouches){if(t.identifier===mv.id)clearStick(ms,mv);if(t.identifier===aim.id)clearStick(as,aim)}},{passive:false});document.addEventListener("touchcancel",e=>{for(const t of e.changedTouches){if(t.identifier===mv.id)clearStick(ms,mv);if(t.identifier===aim.id)clearStick(as,aim)}},{passive:false});document.addEventListener("gesturestart",e=>e.preventDefault(),{passive:false});document.addEventListener("gesturechange",e=>e.preventDefault(),{passive:false});document.addEventListener("gestureend",e=>e.preventDefault(),{passive:false});
})();
