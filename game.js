(()=>{"use strict";
const c=document.getElementById("game"),x=c.getContext("2d"),hp=document.getElementById("hp"),arm=document.getElementById("arm"),waveEl=document.getElementById("wave"),zEl=document.getElementById("zombies"),ammo=document.getElementById("ammo"),msg=document.getElementById("message"),start=document.getElementById("startOverlay"),pause=document.getElementById("pauseOverlay"),startBtn=document.getElementById("startBtn"),resume=document.getElementById("resumeBtn"),pauseBtn=document.getElementById("pauseBtn"),reloadBtn=document.getElementById("reloadBtn"),grenadeBtn=document.getElementById("grenadeBtn"),ms=document.getElementById("moveStick"),as=document.getElementById("aimStick");
let W,H,last=0,running=false,paused=false,wave=1,left=0,spawnT=0,inter=0,player,z=[],b=[],g=[],p=[],keys={};const mv={x:0,y:0,id:null},aim={x:0,y:0,id:null};
const C={base:45,perWave:30,spawnMs:45,max:260,speed:240};
function resize(){W=c.width=innerWidth;H=c.height=innerHeight}addEventListener("resize",resize);resize();
function message(t){msg.textContent=t;clearTimeout(message.t);message.t=setTimeout(()=>msg.textContent="",1000)}
function reset(){z=[];b=[];g=[];p=[];wave=1;player={x:W/2,y:H/2,r:17,hp:100,arm:50,ammo:12,a:0,cd:0};newWave()}
function newWave(){left=C.base+(wave-1)*C.perWave;spawnT=0;inter=0;message("WAVE "+wave)}
function spawn(){if(left<=0||z.length>=C.max)return;let s=Math.floor(Math.random()*4),px,py;if(s===0){px=Math.random()*W;py=-25}else if(s===1){px=W+25;py=Math.random()*H}else if(s===2){px=Math.random()*W;py=H+25}else{px=-25;py=Math.random()*H}z.push({x:px,y:py,r:13+Math.random()*3,v:55+Math.random()*23,w:Math.random()*6.28,h:0});left--}
function shoot(){if(!running||paused||player.cd>0)return;let dx=aim.x,dy=aim.y;if(Math.hypot(dx,dy)<.2){dx=Math.cos(player.a);dy=Math.sin(player.a)}let d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;player.a=Math.atan2(dy,dx);b.push({x:player.x+dx*24,y:player.y+dy*24,vx:dx*850,vy:dy*850,t:.6});player.cd=.07;player.ammo=12;p.push({x:player.x+dx*27,y:player.y+dy*27,t:.07,m:.07,k:"m"})}
function grenade(){if(!running||paused)return;let dx=aim.x,dy=aim.y;if(Math.hypot(dx,dy)<.2){dx=Math.cos(player.a);dy=Math.sin(player.a)}let d=Math.hypot(dx,dy)||1;g.push({x:player.x,y:player.y,vx:dx/d*430,vy:dy/d*430,t:.55})}
function reload(){if(player)player.ammo=12}
function hurt(v){let a=Math.min(player.arm,v*.55);player.arm-=a;player.hp-=Math.max(0,v-a);if(player.hp<=0){player.hp=0;running=false;start.classList.remove("hidden");startBtn.textContent="PLAY AGAIN"}}
function update(dt){if(!running||paused)return;player.cd=Math.max(0,player.cd-dt);spawnT-=dt*1000;while(left>0&&spawnT<=0){spawn();spawnT+=C.spawnMs}
let mx=mv.x,my=mv.y;if(keys.w||keys.arrowup)my--;if(keys.s||keys.arrowdown)my++;if(keys.a||keys.arrowleft)mx--;if(keys.d||keys.arrowright)mx++;let d=Math.hypot(mx,my)||1;if(Math.hypot(mx,my)>0){mx/=d;my/=d}player.x=Math.max(24,Math.min(W-24,player.x+mx*C.speed*dt));player.y=Math.max(24,Math.min(H-24,player.y+my*C.speed*dt));
if(Math.hypot(aim.x,aim.y)>.2){player.a=Math.atan2(aim.y,aim.x);shoot()}
for(const q of b){q.x+=q.vx*dt;q.y+=q.vy*dt;q.t-=dt;for(const e of z)if(e.h<=0&&Math.hypot(q.x-e.x,q.y-e.y)<e.r+4){e.h=.15;q.t=0;blood(e.x,e.y);break}}b=b.filter(q=>q.t>0&&q.x>-40&&q.x<W+40&&q.y>-40&&q.y<H+40);
for(const q of g){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.985;q.vy*=.985;q.t-=dt;if(q.t<=0){boom(q.x,q.y);q.dead=1}}g=g.filter(q=>!q.dead);
for(const e of z){if(e.h>0){e.h-=dt;continue}let dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;e.w+=dt*2;e.x+=dx/d*e.v*dt;e.y+=dy/d*e.v*dt;if(d<e.r+player.r+3)hurt(12*dt)}
z=z.filter(e=>{if(e.h>0){blood(e.x,e.y);return false}return true});for(const q of p)q.t-=dt;p=p.filter(q=>q.t>0);
if(left===0&&z.length===0){inter+=dt;if(inter>.5){wave++;newWave()}}
hp.textContent=Math.ceil(player.hp);arm.textContent=Math.ceil(player.arm);waveEl.textContent=wave;zEl.textContent=z.length+left;ammo.textContent=player.ammo}
function blood(x,y){for(let i=0;i<3;i++)p.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,t:.25,m:.25,k:"b"})}
function boom(x,y){p.push({x,y,t:.35,m:.35,k:"e"});for(const e of z){let dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy);if(d<105)e.h=.2}}
function draw(){x.clearRect(0,0,W,H);x.fillStyle="#151515";x.fillRect(0,0,W,H);x.strokeStyle="#383838";x.lineWidth=3;x.strokeRect(18,18,W-36,H-36);
for(const q of p){let a=q.t/q.m;if(q.k==="b"){x.globalAlpha=a;x.fillStyle="#8b1111";x.fillRect(q.x,q.y,4,4)}else if(q.k==="m"){x.globalAlpha=a;x.fillStyle="#fff1a8";x.beginPath();x.arc(q.x,q.y,13,0,7);x.fill()}else{x.globalAlpha=a;x.strokeStyle="#ffcc55";x.lineWidth=6;x.beginPath();x.arc(q.x,q.y,60*(1-a)+8,0,7);x.stroke()}}x.globalAlpha=1;
for(const q of g){x.fillStyle="#777";x.beginPath();x.arc(q.x,q.y,7,0,7);x.fill()}for(const e of z){x.fillStyle="#777";x.beginPath();x.arc(e.x,e.y,e.r,0,7);x.fill();x.fillStyle="#111";x.fillRect(e.x-5,e.y-3,3,3);x.fillRect(e.x+3,e.y-3,3,3)}
if(player){x.save();x.translate(player.x,player.y);x.rotate(player.a);x.fillStyle="#ccc";x.fillRect(0,-4,25,8);x.fillStyle="#4b4b4b";x.beginPath();x.arc(0,0,player.r,0,7);x.fill();x.restore()}}
function frame(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
function toggle(){if(!running)return;paused=!paused;pause.classList.toggle("hidden",!paused);pauseBtn.textContent=paused?"▶":"Ⅱ";if(paused)mv.x=mv.y=aim.x=aim.y=0}
function startGame(e){e.preventDefault();e.stopPropagation();if(running)return;reset();running=true;paused=false;start.classList.add("hidden");pause.classList.add("hidden")}
function bind(el,fn){el.addEventListener("touchstart",e=>{e.preventDefault();e.stopPropagation();fn(e)},{passive:false});el.addEventListener("click",e=>{e.preventDefault();fn(e)})}
bind(startBtn,startGame);bind(resume,toggle);bind(pauseBtn,toggle);bind(reloadBtn,reload);bind(grenadeBtn,grenade);
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=1;if(e.key==="Escape")toggle();if(e.key.toLowerCase()==="r")reload();if(e.key.toLowerCase()==="g")grenade()});addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);
function stick(el,s){el.addEventListener("touchstart",e=>{e.preventDefault();if(s.id!==null)return;s.id=e.changedTouches[0].identifier;moveStick(e.changedTouches[0],el,s)},{passive:false})}
function moveStick(t,el,s){let r=el.getBoundingClientRect(),dx=t.clientX-(r.left+r.width/2),dy=t.clientY-(r.top+r.height/2),m=r.width*.37,d=Math.hypot(dx,dy)||1;if(d>m){dx=dx/d*m;dy=dy/d*m}s.x=dx/m;s.y=dy/m;el.querySelector(".knob").style.transform=`translate(${dx}px,${dy}px)`}
function clearStick(el,s){s.id=null;s.x=s.y=0;el.querySelector(".knob").style.transform="translate(0,0")}
stick(ms,mv);stick(as,aim);document.addEventListener("touchmove",e=>{e.preventDefault();for(const t of e.touches){if(t.identifier===mv.id)moveStick(t,ms,mv);if(t.identifier===aim.id)moveStick(t,as,aim)}},{passive:false});document.addEventListener("touchend",e=>{for(const t of e.changedTouches){if(t.identifier===mv.id)clearStick(ms,mv);if(t.identifier===aim.id)clearStick(as,aim)}},{passive:false});document.addEventListener("touchcancel",e=>{for(const t of e.changedTouches){if(t.identifier===mv.id)clearStick(ms,mv);if(t.identifier===aim.id)clearStick(as,aim)}},{passive:false});document.addEventListener("gesturestart",e=>e.preventDefault(),{passive:false});document.addEventListener("gesturechange",e=>e.preventDefault(),{passive:false});document.addEventListener("gestureend",e=>e.preventDefault(),{passive:false});
})();