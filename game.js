(()=>{"use strict";
const c=document.getElementById("game"),x=c.getContext("2d"),hp=document.getElementById("hp"),arm=document.getElementById("arm"),waveEl=document.getElementById("wave"),zEl=document.getElementById("zombies"),ammo=document.getElementById("ammo"),msg=document.getElementById("message"),start=document.getElementById("startOverlay"),pause=document.getElementById("pauseOverlay"),startBtn=document.getElementById("startBtn"),resume=document.getElementById("resumeBtn"),pauseBtn=document.getElementById("pauseBtn"),settingsBtn=document.getElementById("settingsBtn"),pauseSettingsBtn=document.getElementById("pauseSettingsBtn"),backHomeBtn=document.getElementById("backHomeBtn"),returnMenuBtn=document.getElementById("returnMenuBtn"),confirmOverlay=document.getElementById("confirmOverlay"),cancelReturnBtn=document.getElementById("cancelReturnBtn"),confirmReturnBtn=document.getElementById("confirmReturnBtn"),multiplayerBtn=document.getElementById("multiplayerBtn"),homeMenu=document.getElementById("homeMenu"),mapMenu=document.getElementById("mapMenu"),backMapBtn=document.getElementById("backMapBtn"),farmhouseBtn=document.getElementById("farmhouseBtn"),stressTestBtn=document.getElementById("stressTestBtn"),settingsMenu=document.getElementById("settingsMenu"),reloadBtn=document.getElementById("reloadBtn"),grenadeBtn=document.getElementById("grenadeBtn"),ms=document.getElementById("moveStick"),as=document.getElementById("aimStick");
let W,H,last=0,running=false,paused=false,wave=1,left=0,spawnT=0,inter=0,player,z=[],b=[],g=[],p=[],keys={},clock=0,selectedMap="farmhouse",stressMode=false;const mv={x:0,y:0,id:null},aim={x:0,y:0,id:null};
const C={base:85,perWave:0,spawnMs:220,max:100,speed:240};
// Layered map data: rendering, collision and navigation are deliberately separate.
// Coordinates are normalized to the current viewport so the layout scales to phones and desktop.
const farmhouseMap={id:"farmhouse",spawn:{x:.50,y:.73},collision:[
 {x:.285,y:.225,w:.43,h:.018,type:"wall"},{x:.285,y:.225,w:.018,h:.44,type:"wall"},{x:.697,y:.225,w:.018,h:.44,type:"wall"},{x:.285,y:.655,w:.17,h:.018,type:"wall"},{x:.517,y:.655,w:.198,h:.018,type:"wall"},
 {x:.405,y:.235,w:.012,h:.19,type:"wall"},{x:.565,y:.235,w:.012,h:.19,type:"wall"},{x:.405,y:.44,w:.012,h:.21,type:"wall"},{x:.565,y:.44,w:.012,h:.21,type:"wall"},
 {x:.33,y:.31,w:.055,h:.065,type:"furniture"},{x:.61,y:.31,w:.055,h:.055,type:"furniture"},{x:.46,y:.49,w:.08,h:.045,type:"furniture"}],
 interactiveObjects:[{id:"front-window-left",type:"window",health:100,repairable:true},{id:"front-window-right",type:"window",health:100,repairable:true},{id:"back-door",type:"door",health:150,repairable:true},{id:"barn-gate",type:"barrier",health:200,repairable:true}]};
function rectHit(px,py,r,box){return px+r>box.x*W&&px-r<(box.x+box.w)*W&&py+r>box.y*H&&py-r<(box.y+box.h)*H}
function blocked(px,py,r){if(stressMode)return false;return farmhouseMap.collision.some(q=>q.type!=="building-shell"&&rectHit(px,py,r,q))}
function movePlayer(dx,dy){let nx=Math.max(18,Math.min(W-18,player.x+dx)),ny=Math.max(18,Math.min(H-18,player.y+dy));if(!blocked(nx,player.y,player.r))player.x=nx;if(!blocked(player.x,ny,player.r))player.y=ny}
// Alpha 1.19: a consistent 20-model top-down sprite roster. Each model is a
// transparent overhead PNG, oriented head-first toward the top of the image.
const zombieArt=Array.from({length:20},(_,i)=>{const im=new Image();im.src=`assets/zombie_topdown_${String(i+1).padStart(2,"0")}.png`;return im;});
function drawDetailedZombie(e){
 const im=zombieArt[e.variant%zombieArt.length];
 if(!im||!im.complete||!im.naturalWidth)return false;
 // Sprite strips contain 13 equal 96x96 frames: walk 0-5, hit 6-8, death 9-12.
 // Derive frame dimensions from the actual image so a strip is never drawn as a barcode.
 const frameCount=13,frameW=im.naturalWidth/frameCount,frameH=im.naturalHeight;
 if(!Number.isFinite(frameW)||frameW<=0||frameH<=0)return false;
 const dying=e.dead,life=dying?Math.max(0,Math.min(1,e.deathT/(e.deathLen||.58))):1;
 let frame;
 if(dying){
  const progress=Math.max(0,Math.min(.999,1-life));
  frame=9+Math.min(3,Math.floor(progress*4));
 }else if(e.hitT>0){
  const hitDuration=.18;
  const progress=Math.max(0,Math.min(.999,1-e.hitT/hitDuration));
  frame=6+Math.min(2,Math.floor(progress*3));
 }else{
  frame=((Math.floor(e.phase*1.3)%6)+6)%6;
 }
 const sx=frame*frameW;
 const bob=dying?0:Math.sin(e.phase*1.7)*1.15;
 const scale=1.02+(e.variant===14?0.13:0)+(e.variant%5)*0.015;
 x.save();
 x.translate(e.x,e.y+bob);
 x.rotate(dying?e.turn+((e.deathStyle===1?-1:1)*(1-life)*.8):e.turn+Math.sin(e.phase*.35)*.018);
 x.globalAlpha=dying?Math.max(.12,life):1;
 x.drawImage(im,sx,0,frameW,frameH,-25*scale,-25*scale,50*scale,50*scale);
 // No extra ellipse/shadow is drawn beneath the sprite; the PNG has transparency.
 if(!dying&&e.hitT>0){
  x.globalCompositeOperation='screen';x.globalAlpha=.18;
  x.fillStyle='#f4d4bd';x.beginPath();x.ellipse(0,-9,8,10,0,0,Math.PI*2);x.fill();
 }
 x.restore();x.globalAlpha=1;x.globalCompositeOperation='source-over';return true;
}
function resize(){W=c.width=innerWidth;H=c.height=innerHeight}addEventListener("resize",resize);resize();
function message(t){msg.textContent=t;clearTimeout(message.t);message.t=setTimeout(()=>msg.textContent="",1000)}
function reset(){z=[];b=[];g=[];p=[];wave=1;clock=0;player={x:W/2,y:stressMode?H/2:H*.73,r:17,hp:100,arm:50,ammo:12,a:0,cd:0,walk:0,move:0,shootT:0,reloadT:0,throwT:0};C.base=stressMode?700:85;C.perWave=stressMode?0:5;C.spawnMs=stressMode?20:220;C.max=stressMode?700:100;newWave()}
function newWave(){left=C.base+(wave-1)*C.perWave;spawnT=0;inter=0;message("WAVE "+wave)}
function spawn(){if(left<=0||z.length>=C.max)return;let s=Math.floor(Math.random()*4),px,py;if(!stressMode&&s===0){px=(.12+Math.random()*.76)*W;py=H*.08}else if(!stressMode&&s===1){px=W*.92;py=(.12+Math.random()*.76)*H}else if(!stressMode&&s===2){px=(.12+Math.random()*.76)*W;py=H*.92}else if(!stressMode){px=W*.08;py=(.12+Math.random()*.76)*H}else if(s===0){px=Math.random()*W;py=-25}else if(s===1){px=W+25;py=Math.random()*H}else if(s===2){px=Math.random()*W;py=H+25}else{px=-25;py=Math.random()*H}z.push({x:px,y:py,r:13+Math.random()*3,v:55+Math.random()*23,phase:Math.random()*6.28,h:0,hitT:0,dead:false,deathT:0,deathLen:.48+Math.random()*.22,variant:Math.floor(Math.random()*20),walkStyle:Math.floor(Math.random()*3),deathStyle:Math.floor(Math.random()*3),turn:Math.atan2(player.y-py,player.x-px)+Math.PI/2,bloodLevel:Math.random(),skinTone:Math.random()});left--}
function shoot(){if(!running||paused||player.cd>0)return;let dx=aim.x,dy=aim.y;if(Math.hypot(dx,dy)<.2){dx=Math.cos(player.a);dy=Math.sin(player.a)}let d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;player.a=Math.atan2(dy,dx);b.push({x:player.x+dx*24,y:player.y+dy*24,vx:dx*850,vy:dy*850,t:.6});player.cd=.07;player.ammo=12;player.shootT=.12;p.push({x:player.x+dx*27,y:player.y+dy*27,t:.07,m:.07,k:"m"})}
function grenade(){if(!running||paused)return;let dx=aim.x,dy=aim.y;if(Math.hypot(dx,dy)<.2){dx=Math.cos(player.a);dy=Math.sin(player.a)}let d=Math.hypot(dx,dy)||1;g.push({x:player.x+dx*18,y:player.y+dy*18,vx:dx/d*430,vy:dy/d*430,t:.55});player.throwT=.32}
function reload(){if(!player)return;player.ammo=12;if(running&&!paused)player.reloadT=.42}
function hurt(v){}
function killZombie(e){if(e.dead)return;e.dead=true;e.deathT=e.deathLen||.58;e.hitT=0;blood(e.x,e.y,e.variant)}
function update(dt){if(!running||paused)return;clock+=dt;player.cd=Math.max(0,player.cd-dt);player.shootT=Math.max(0,player.shootT-dt);player.reloadT=Math.max(0,player.reloadT-dt);player.throwT=Math.max(0,player.throwT-dt);spawnT-=dt*1000;while(left>0&&spawnT<=0&&z.length<C.max){spawn();spawnT+=C.spawnMs}
let mx=mv.x,my=mv.y;if(keys.w||keys.arrowup)my--;if(keys.s||keys.arrowdown)my++;if(keys.a||keys.arrowleft)mx--;if(keys.d||keys.arrowright)mx++;let moveLen=Math.hypot(mx,my);let d=moveLen||1;if(moveLen>0){mx/=d;my/=d}player.move=moveLen>0?1:0;player.walk+=dt*(player.move?10:2);movePlayer(mx*C.speed*dt,my*C.speed*dt);
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
 // All 20 zombie variants now use the consistent top-down sprite roster.
 if(drawDetailedZombie(e))return;
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
function drawFarmhouse(){
 // Ground-art layer: weathered grass, soil tracks and mottled patches.
 x.fillStyle="#424632";x.fillRect(0,0,W,H);
 for(let i=0;i<260;i++){let xx=(i*173.7%W),yy=(i*97.3%H);x.fillStyle=i%3===0?"#55533a":i%3===1?"#343d2b":"#4a4c35";x.globalAlpha=.28;x.beginPath();x.ellipse(xx,yy,3+(i%7),1+(i%3),i*.7,0,Math.PI*2);x.fill()}x.globalAlpha=1;
 // Muddy wheel tracks around the yard.
 x.strokeStyle="#282c22";x.lineWidth=Math.max(8,W*.012);x.globalAlpha=.55;x.beginPath();x.moveTo(W*.04,H*.19);x.bezierCurveTo(W*.22,H*.1,W*.77,H*.13,W*.95,H*.2);x.stroke();x.beginPath();x.moveTo(W*.08,H*.83);x.bezierCurveTo(W*.28,H*.93,W*.73,H*.91,W*.92,H*.82);x.stroke();x.globalAlpha=1;
 // Fence and gates are a separate prop layer.
 x.strokeStyle="#4c3828";x.lineWidth=4;x.beginPath();x.moveTo(W*.06,H*.08);x.lineTo(W*.94,H*.08);x.lineTo(W*.94,H*.92);x.lineTo(W*.06,H*.92);x.closePath();x.stroke();for(let i=0;i<30;i++){let xx=W*(.06+i*.88/29);x.fillStyle="#776044";x.fillRect(xx-2,H*.07,4,10);x.fillRect(xx-2,H*.91,4,10)}
 // Rear garden and vegetable beds.
 x.fillStyle="#303b28";x.fillRect(W*.12,H*.12,W*.2,H*.095);for(let i=0;i<5;i++){x.fillStyle=i%2?"#59613b":"#6d6740";x.fillRect(W*(.13+i*.036),H*.13,W*.022,H*.075)}
 // Barn/outbuilding, roof and shadow on the rear-right side.
 x.fillStyle="#20221b";x.fillRect(W*.735,H*.16,W*.17,H*.2);x.fillStyle="#574034";x.fillRect(W*.745,H*.15,W*.15,H*.18);x.fillStyle="#392b25";for(let i=0;i<7;i++)x.fillRect(W*.75,H*(.16+i*.022),W*.14,H*.006);x.fillStyle="#171a17";x.fillRect(W*.79,H*.245,W*.06,H*.085);x.strokeStyle="#a08b67";x.lineWidth=3;x.strokeRect(W*.745,H*.15,W*.15,H*.18);
 // Farmhouse shadow, masonry/foundation and floorboards.
 x.fillStyle="#20221e";x.fillRect(W*.255,H*.205,W*.49,H*.51);x.fillStyle="#8a806a";x.fillRect(W*.27,H*.22,W*.46,H*.48);x.fillStyle="#574b3c";x.fillRect(W*.285,H*.235,W*.43,H*.45);
 // Ground-floor rooms rendered as individual floor layers.
 const rooms=[{x:.30,y:.25,w:.105,h:.17,c:"#74654f"},{x:.42,y:.25,w:.145,h:.17,c:"#81735b"},{x:.575,y:.25,w:.12,h:.17,c:"#665744"},{x:.30,y:.44,w:.16,h:.22,c:"#8b795f"},{x:.47,y:.44,w:.225,h:.22,c:"#76664e"}];for(const r of rooms){x.fillStyle=r.c;x.fillRect(W*r.x,H*r.y,W*r.w,H*r.h);x.strokeStyle="#a79a7a";x.lineWidth=1;x.strokeRect(W*r.x,H*r.y,W*r.w,H*r.h);for(let j=0;j<6;j++){x.strokeStyle="#443b30";x.globalAlpha=.35;x.beginPath();x.moveTo(W*r.x,H*(r.y+.025+j*r.h/7));x.lineTo(W*(r.x+r.w),H*(r.y+.025+j*r.h/7));x.stroke()}x.globalAlpha=1}
 // Interior furniture, wreckage and broken boards.
 x.fillStyle="#403126";x.fillRect(W*.32,H*.285,W*.055,H*.07);x.fillStyle="#8e7759";x.fillRect(W*.325,H*.29,W*.045,H*.06);x.fillStyle="#332b25";x.fillRect(W*.60,H*.29,W*.07,H*.045);x.fillStyle="#8a7657";x.fillRect(W*.605,H*.295,W*.06,H*.035);x.fillStyle="#342b24";x.fillRect(W*.49,H*.50,W*.06,H*.045);x.fillStyle="#9b8764";x.fillRect(W*.495,H*.505,W*.05,H*.035);
 for(let i=0;i<9;i++){x.strokeStyle=i%2?"#3b2b20":"#b5a17a";x.lineWidth=2;x.beginPath();x.moveTo(W*(.35+i*.009),H*(.58+(i%3)*.012));x.lineTo(W*(.37+i*.009),H*(.62+(i%2)*.01));x.stroke()}
 // Walls over floor; openings are intentional future window/door interaction points.
 x.fillStyle="#292824";x.fillRect(W*.285,H*.225,W*.43,H*.018);x.fillRect(W*.285,H*.225,W*.018,H*.44);x.fillRect(W*.697,H*.225,W*.018,H*.44);x.fillRect(W*.285,H*.655,W*.17,H*.018);x.fillRect(W*.51,H*.655,W*.205,H*.018);x.fillRect(W*.405,H*.235,W*.012,H*.19);x.fillRect(W*.565,H*.235,W*.012,H*.19);x.fillRect(W*.405,H*.44,W*.012,H*.21);x.fillRect(W*.565,H*.44,W*.012,H*.21);
 // Windows and doors: clear, high-contrast features reserved for later damage states.
 for(const wx of [.34,.62]){x.fillStyle="#1b282a";x.fillRect(W*wx,H*.216,W*.045,H*.025);x.strokeStyle="#b7b29c";x.lineWidth=2;x.strokeRect(W*wx,H*.216,W*.045,H*.025);x.beginPath();x.moveTo(W*(wx+.0225),H*.217);x.lineTo(W*(wx+.0225),H*.24);x.stroke()}
 x.fillStyle="#463225";x.fillRect(W*.465,H*.638,W*.052,H*.04);x.strokeStyle="#b59a6c";x.strokeRect(W*.465,H*.638,W*.052,H*.04);x.fillStyle="#c6b28b";x.beginPath();x.arc(W*.506,H*.657,2,0,Math.PI*2);x.fill();
 // Blood-stained environmental storytelling: trails, smears and HELP on the floor.
 x.fillStyle="#651719";for(let i=0;i<18;i++){let xx=W*(.36+(i%6)*.011),yy=H*(.34+Math.floor(i/6)*.014);x.globalAlpha=.55+(i%3)*.12;x.beginPath();x.ellipse(xx,yy,W*(.003+(i%3)*.001),H*(.002+(i%2)*.002),i*.6,0,Math.PI*2);x.fill()}x.globalAlpha=1;
 x.save();x.translate(W*.61,H*.57);x.rotate(-.09);x.fillStyle="#7e1b20";x.font=`900 ${Math.max(11,Math.min(20,W*.022))}px Georgia`;x.fillText("HELP",0,0);x.strokeStyle="#681619";x.lineWidth=2;x.beginPath();x.moveTo(-4,5);x.lineTo(W*.035,8);x.moveTo(2,10);x.lineTo(W*.022,13);x.stroke();x.restore();
 // Outdoor clutter: barrels, stones, scattered timber and blood near the path.
 for(let i=0;i<12;i++){let xx=W*(.12+(i*37%72)/100),yy=H*(.76+(i%4)*.035);x.fillStyle=i%2?"#554735":"#34352d";x.save();x.translate(xx,yy);x.rotate(i*.8);x.fillRect(-5,-2,10,4);x.restore()}x.fillStyle="#6a171a";x.globalAlpha=.65;x.beginPath();x.ellipse(W*.23,H*.72,W*.035,H*.012,-.4,0,Math.PI*2);x.fill();x.globalAlpha=1;
 // Light vignette and grime keep the art moody without obscuring gameplay.
 const vg=x.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.15,W*.5,H*.5,Math.max(W,H)*.72);vg.addColorStop(0,"#00000000");vg.addColorStop(1,"#080908a8");x.fillStyle=vg;x.fillRect(0,0,W,H);
}
function draw(){x.clearRect(0,0,W,H);if(stressMode){x.fillStyle="#151515";x.fillRect(0,0,W,H);x.strokeStyle="#383838";x.lineWidth=3;x.strokeRect(18,18,W-36,H-36)}else drawFarmhouse();
for(const q of p){let a=q.t/q.m;if(q.k==="b"){x.globalAlpha=a;x.fillStyle="#76191c";x.save();x.translate(q.x,q.y);x.rotate(q.rot||0);x.beginPath();x.ellipse(0,0,q.r||3,(q.r||3)*.58,0,0,Math.PI*2);x.fill();x.restore()}else if(q.k==="s"){x.globalAlpha=a*.7;x.fillStyle="#501316";x.beginPath();x.ellipse(q.x,q.y,q.r||7,(q.r||7)*.55,0,0,Math.PI*2);x.fill()}else if(q.k==="m"){x.globalAlpha=a;x.fillStyle="#fff1a8";x.beginPath();x.arc(q.x,q.y,13,0,7);x.fill()}else{x.globalAlpha=a;x.strokeStyle="#ffcc55";x.lineWidth=6;x.beginPath();x.arc(q.x,q.y,60*(1-a)+8,0,7);x.stroke()}}x.globalAlpha=1;
for(const q of g){x.fillStyle="#777";x.beginPath();x.arc(q.x,q.y,7,0,7);x.fill()}for(const e of z)drawZombie(e);drawPlayer()}

function frame(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
let settingsOrigin="home";
function toggle(){if(!running||!start.classList.contains("hidden")||!confirmOverlay.classList.contains("hidden"))return;paused=!paused;pause.classList.toggle("hidden",!paused);pauseBtn.textContent=paused?"▶":"Ⅱ";if(paused)mv.x=mv.y=aim.x=aim.y=0}
function showMapSelect(){homeMenu.classList.add("hidden");settingsMenu.classList.add("hidden");mapMenu.classList.remove("hidden");start.classList.remove("hidden")}
function backToHome(){mapMenu.classList.add("hidden");homeMenu.classList.remove("hidden")}
function startGame(e){e.preventDefault();e.stopPropagation();if(running)return;reset();running=true;paused=false;mapMenu.classList.add("hidden");start.classList.add("hidden");pause.classList.add("hidden");confirmOverlay.classList.add("hidden")}
function startSelectedMap(isStress=false){stressMode=isStress;selectedMap=isStress?"arena":"farmhouse";startGame({preventDefault(){},stopPropagation(){}})}
function openSettings(origin){settingsOrigin=origin;homeMenu.classList.add("hidden");mapMenu.classList.add("hidden");settingsMenu.classList.remove("hidden");backHomeBtn.textContent=origin==="pause"?"← BACK TO PAUSE MENU":"← BACK";start.classList.remove("hidden");pause.classList.add("hidden")}
function backFromSettings(){settingsMenu.classList.add("hidden");if(settingsOrigin==="pause"&&running){start.classList.add("hidden");pause.classList.remove("hidden");paused=true;pauseBtn.textContent="▶"}else{mapMenu.classList.add("hidden");homeMenu.classList.remove("hidden");start.classList.remove("hidden")}}
function askReturnToMenu(){confirmOverlay.classList.remove("hidden")}
function cancelReturn(){confirmOverlay.classList.add("hidden")}
function returnToMenu(){confirmOverlay.classList.add("hidden");pause.classList.add("hidden");start.classList.remove("hidden");settingsMenu.classList.add("hidden");mapMenu.classList.add("hidden");homeMenu.classList.remove("hidden");running=false;paused=false;z=[];b=[];g=[];p=[];keys={};mv.x=mv.y=aim.x=aim.y=0;pauseBtn.textContent="Ⅱ";hp.textContent="100";arm.textContent="50";waveEl.textContent="1";zEl.textContent="0";ammo.textContent="12";msg.textContent=""}
function bind(el,fn){let suppressClick=false;el.addEventListener("touchstart",e=>{e.preventDefault();e.stopPropagation();suppressClick=true;fn(e);setTimeout(()=>suppressClick=false,700)},{passive:false});el.addEventListener("click",e=>{e.preventDefault();if(suppressClick){suppressClick=false;return}fn(e)})}
bind(startBtn,showMapSelect);bind(backMapBtn,backToHome);bind(farmhouseBtn,()=>startSelectedMap(false));bind(stressTestBtn,()=>startSelectedMap(true));document.querySelectorAll(".mapCard.unavailable").forEach(el=>bind(el,()=>{message("LOCATION COMING SOON")}));bind(settingsBtn,()=>openSettings("home"));bind(pauseSettingsBtn,()=>openSettings("pause"));bind(backHomeBtn,backFromSettings);bind(multiplayerBtn,()=>{multiplayerBtn.querySelector("span").textContent="NOT AVAILABLE YET";setTimeout(()=>{const s=multiplayerBtn.querySelector("span");if(s)s.textContent="COMING SOON"},1800)});bind(resume,toggle);bind(pauseBtn,toggle);bind(returnMenuBtn,askReturnToMenu);bind(cancelReturnBtn,cancelReturn);bind(confirmReturnBtn,returnToMenu);bind(reloadBtn,reload);bind(grenadeBtn,grenade);
addEventListener("keydown",e=>{const k=e.key.toLowerCase();keys[k]=1;if(e.key==="Escape"){if(!confirmOverlay.classList.contains("hidden"))cancelReturn();else if(!settingsMenu.classList.contains("hidden"))backFromSettings();else toggle()}if(k==="r")reload();if(k==="g")grenade()});addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);
function stick(el,s){el.addEventListener("touchstart",e=>{e.preventDefault();if(s.id!==null)return;s.id=e.changedTouches[0].identifier;moveStick(e.changedTouches[0],el,s)},{passive:false})}
function moveStick(t,el,s){let r=el.getBoundingClientRect(),dx=t.clientX-(r.left+r.width/2),dy=t.clientY-(r.top+r.height/2),m=r.width*.37,d=Math.hypot(dx,dy)||1;if(d>m){dx=dx/d*m;dy=dy/d*m}s.x=dx/m;s.y=dy/m;el.querySelector(".knob").style.transform=`translate(${dx}px,${dy}px)`}
function clearStick(el,s){s.id=null;s.x=s.y=0;el.querySelector(".knob").style.transform="translate(0,0)"}
stick(ms,mv);stick(as,aim);document.addEventListener("touchmove",e=>{e.preventDefault();for(const t of e.touches){if(t.identifier===mv.id)moveStick(t,ms,mv);if(t.identifier===aim.id)moveStick(t,as,aim)}},{passive:false});document.addEventListener("touchend",e=>{for(const t of e.changedTouches){if(t.identifier===mv.id)clearStick(ms,mv);if(t.identifier===aim.id)clearStick(as,aim)}},{passive:false});document.addEventListener("touchcancel",e=>{for(const t of e.changedTouches){if(t.identifier===mv.id)clearStick(ms,mv);if(t.identifier===aim.id)clearStick(as,aim)}},{passive:false});document.addEventListener("gesturestart",e=>e.preventDefault(),{passive:false});document.addEventListener("gesturechange",e=>e.preventDefault(),{passive:false});document.addEventListener("gestureend",e=>e.preventDefault(),{passive:false});
})();
