(()=>{"use strict";
const c=document.getElementById("game"),x=c.getContext("2d"),hp=document.getElementById("hp"),arm=document.getElementById("arm"),waveEl=document.getElementById("wave"),zEl=document.getElementById("zombies"),ammo=document.getElementById("ammo"),msg=document.getElementById("message"),start=document.getElementById("startOverlay"),pause=document.getElementById("pauseOverlay"),startBtn=document.getElementById("startBtn"),resume=document.getElementById("resumeBtn"),pauseBtn=document.getElementById("pauseBtn"),settingsBtn=document.getElementById("settingsBtn"),pauseSettingsBtn=document.getElementById("pauseSettingsBtn"),backHomeBtn=document.getElementById("backHomeBtn"),returnMenuBtn=document.getElementById("returnMenuBtn"),confirmOverlay=document.getElementById("confirmOverlay"),cancelReturnBtn=document.getElementById("cancelReturnBtn"),confirmReturnBtn=document.getElementById("confirmReturnBtn"),multiplayerBtn=document.getElementById("multiplayerBtn"),homeMenu=document.getElementById("homeMenu"),mapMenu=document.getElementById("mapMenu"),backMapBtn=document.getElementById("backMapBtn"),farmhouseBtn=document.getElementById("farmhouseBtn"),stressTestBtn=document.getElementById("stressTestBtn"),settingsMenu=document.getElementById("settingsMenu"),reloadBtn=document.getElementById("reloadBtn"),grenadeBtn=document.getElementById("grenadeBtn"),ms=document.getElementById("moveStick"),as=document.getElementById("aimStick");
let W,H,last=0,running=false,paused=false,wave=1,left=0,spawnT=0,inter=0,player,z=[],b=[],g=[],p=[],keys={},clock=0,selectedMap="farmhouse",stressMode=false,collisionDebug=false,tutorialMode=false;
// Farmhouse world is 3x the viewport dimensions in each axis. The camera follows
// the player instead of shrinking the estate to fit the screen. Stress-test remains screen-sized.
const FARMHOUSE_WORLD_SCALE=3; let viewW=innerWidth,viewH=innerHeight,camX=0,camY=0;
const mv={x:0,y:0,id:null},aim={x:0,y:0,id:null};
const farmhouseTexture=new Image(); farmhouseTexture.src="assets/farmhouse_apocalypse.png";
const tutorialTexture=new Image(); tutorialTexture.src="assets/tutorial_interior.png";
// The tutorial map is displayed at 65% of the play area, centred. Artwork and collision share this transform.
const TUTORIAL_SCALE=.65;
function tutorialPoint(nx,ny){return {x:(W*(1-TUTORIAL_SCALE)/2)+nx*W*TUTORIAL_SCALE,y:(H*(1-TUTORIAL_SCALE)/2)+ny*H*TUTORIAL_SCALE}}
// Tutorial collision segments use the same normalized coordinates as the PNG. The two side squares each have an open doorway between them, and each room connects to the central rectangle.
const tutorialSolids=[[.10,.15,.90,.15],[.90,.15,.90,.85],[.90,.85,.10,.85],[.10,.85,.10,.15],[.3667,.15,.3667,.27],[.3667,.333,.3667,.50],[.3667,.50,.3667,.567],[.3667,.633,.3667,.85],[.6333,.15,.6333,.267],[.6333,.333,.6333,.50],[.6333,.50,.6333,.567],[.6333,.633,.6333,.85],[.10,.50,.1833,.50],[.2583,.50,.3667,.50],[.6333,.50,.7417,.50],[.8167,.50,.90,.50]];
const C={base:85,perWave:0,spawnMs:220,max:100,speed:240};
// Layered map data: rendering, collision and navigation are deliberately separate.
// Coordinates are normalized to the current viewport so the layout scales to phones and desktop.
const farmhouseMap={id:"farmhouse",spawn:{x:.52,y:.79},interactiveObjects:[
 {id:"front-window-left",type:"window",health:100,maxHealth:100,repairable:true,x:.39,y:.58,w:.035,h:.018},
 {id:"front-window-right",type:"window",health:100,maxHealth:100,repairable:true,x:.61,y:.58,w:.035,h:.018}
]};
// Collision blueprint transcribed from the user's red/blue/green/yellow markup.
// All coordinates are normalized against the farmhouse PNG and therefore scale with the world.
const solidSegments=[
 // Outer perimeter, with gaps at marked climbing points and the main walk-through gate.
 [.02,.075,.955,.075],
 [.02,.075,.02,.91],
 [.02,.91,.30,.91],[.36,.91,.48,.91],[.55,.91,.69,.91],[.75,.91,.955,.91],
 [.955,.075,.955,.91],
 // Barn shell (left upper structure) with southern entry gap.
 [.075,.10,.24,.10],[.075,.10,.075,.27],[.075,.27,.075,.48],[.075,.48,.135,.48],
 [.185,.48,.24,.48],[.24,.10,.24,.27],[.24,.27,.24,.48],
 [.075,.10,.075,.27],[.075,.27,.15,.27],[.19,.27,.24,.27],
 // House exterior, with front porch/door opening centred on south wall.
 [.34,.17,.47,.17],[.50,.17,.59,.17],[.66,.17,.745,.17],
 [.34,.17,.34,.42],[.34,.42,.34,.56],[.34,.56,.34,.64],
 [.745,.17,.745,.34],[.745,.34,.745,.55],[.745,.55,.745,.64],
 [.34,.64,.47,.64],[.51,.64,.63,.64],[.69,.64,.745,.64],
 // Interior partitions, intentionally segmented to preserve the marked open doorways.
 [.47,.17,.47,.29],[.47,.33,.47,.39],[.47,.43,.47,.49],
 [.34,.34,.43,.34],[.47,.34,.49,.34],
 [.34,.43,.40,.43],[.44,.43,.47,.43],
 [.50,.17,.50,.28],[.50,.32,.50,.40],[.50,.40,.58,.40],
 [.59,.17,.59,.28],[.59,.32,.59,.40],
 [.66,.17,.66,.26],[.66,.30,.66,.40],
 [.34,.50,.41,.50],[.45,.50,.47,.50],[.34,.50,.34,.64],
 [.41,.50,.41,.57],[.41,.61,.41,.64],
 [.59,.40,.59,.49],[.59,.53,.59,.64],
 [.59,.49,.66,.49],[.70,.49,.745,.49],
 // Garage/workshop (lower left), main opening on upper side and side door gap.
 [.075,.65,.135,.65],[.18,.65,.26,.65],[.075,.65,.075,.85],[.26,.65,.26,.85],
 [.075,.85,.135,.85],[.18,.85,.26,.85],
 // Detached animal pen/shed upper-right.
 [.83,.105,.92,.105],[.92,.105,.92,.27],[.92,.27,.83,.27],[.83,.27,.83,.105]
];
// Green obstacles stop character movement but intentionally never block bullets.
const movementOnly=[
 [.095,.13,.13,.22],[.16,.13,.22,.16],[.095,.31,.14,.45],[.19,.31,.22,.45],
 [.355,.20,.39,.21],[.365,.22,.435,.22],[.38,.22,.38,.30],
 [.365,.35,.405,.35],[.38,.35,.38,.41],[.36,.46,.405,.46],[.37,.46,.37,.53],
 [.355,.55,.38,.56],[.36,.57,.36,.61],[.405,.54,.445,.54],[.445,.54,.445,.62],
 [.52,.21,.58,.21],[.58,.21,.58,.29],[.52,.26,.56,.26],
 [.62,.22,.65,.22],[.65,.22,.65,.28],
 [.67,.19,.70,.19],[.70,.19,.70,.22],
 [.615,.38,.63,.38],[.615,.38,.615,.44],[.60,.48,.63,.48],
 [.665,.35,.685,.35],[.665,.35,.665,.43],[.68,.45,.72,.45],
 [.62,.52,.69,.52],[.62,.52,.62,.59],[.69,.52,.69,.60],
 [.09,.70,.13,.70],[.10,.73,.16,.73],[.16,.73,.16,.82],
 [.84,.48,.91,.48],[.91,.48,.91,.55],[.85,.55,.91,.55],
 [.83,.74,.90,.74],[.83,.74,.83,.83],[.83,.83,.90,.83],
 [.90,.75,.95,.75],[.90,.75,.90,.82]
];
// Blue window barricades. A destroyed barricade stops blocking movement and bullets.
const breakables=[
 {id:"window-nw",x:.39,y:.165,w:.035,h:.012,hp:100,maxHp:100},
 {id:"window-north",x:.52,y:.165,w:.035,h:.012,hp:100,maxHp:100},
 {id:"window-east",x:.742,y:.30,w:.012,h:.035,hp:100,maxHp:100},
 {id:"window-west",x:.332,y:.50,w:.012,h:.035,hp:100,maxHp:100}
];
// The gate is a walk-through opening. Other yellow-marked points are climb locations.
const gatePoint={x:.515,y:.91};
const climbPoints=[{x:.31,y:.055,side:"top"},{x:.64,y:.055,side:"top"},{x:.955,y:.315,side:"right"},{x:.955,y:.715,side:"right"}];
function segmentHit(px,py,r,seg){const a=tutorialMode?tutorialPoint(seg[0],seg[1]):{x:seg[0]*W,y:seg[1]*H},bb=tutorialMode?tutorialPoint(seg[2],seg[3]):{x:seg[2]*W,y:seg[3]*H},ax=a.x,ay=a.y,bx=bb.x,by=bb.y,dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l)):0;return Math.hypot(px-(ax+t*dx),py-(ay+t*dy))<r+5}
function rectHit(px,py,r,box){return px+r>box.x*W&&px-r<(box.x+box.w)*W&&py+r>box.y*H&&py-r<(box.y+box.h)*H}
function insideBreakable(px,py,r,q){return q.hp>0&&rectHit(px,py,r,q)}
function blocked(px,py,r,kind="player"){
 if(stressMode)return false;
 if((tutorialMode?tutorialSolids:solidSegments).some(q=>segmentHit(px,py,r,q)))return true;
 if(!tutorialMode&&movementOnly.some(q=>segmentHit(px,py,r,q)))return true;
 if(!tutorialMode&&breakables.some(q=>insideBreakable(px,py,r,q)))return true;
 return false;
}
function projectileBlocked(px,py,r=2){if(stressMode)return false;return (tutorialMode?tutorialSolids:solidSegments).some(q=>segmentHit(px,py,r,q))||(!tutorialMode&&breakables.some(q=>insideBreakable(px,py,r,q)))}
function moveBullet(q,dt){const dx=q.vx*dt,dy=q.vy*dt,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/7));for(let i=0;i<steps;i++){q.x+=dx/steps;q.y+=dy/steps;const panel=stressMode?null:breakables.find(v=>v.hp>0&&rectHit(q.x,q.y,2,v));if(panel){panel.hp=Math.max(0,panel.hp-25);q.t=0;return false}if(projectileBlocked(q.x,q.y,2)){q.t=0;return false}for(const e of z){if(!e.dead&&Math.hypot(q.x-e.x,q.y-e.y)<e.r+3){killZombie(e);q.t=0;return false}}}q.t-=dt;return true}
function movePlayer(dx,dy){let nx=Math.max(18,Math.min(W-18,player.x+dx)),ny=Math.max(18,Math.min(H-18,player.y+dy));if(!blocked(nx,player.y,player.r))player.x=nx;if(!blocked(player.x,ny,player.r))player.y=ny}
function moveZombie(e,dx,dy){
 if(e.climbing)return;
 const r=Math.max(5,e.r*.72),ox=e.x,oy=e.y,step=Math.hypot(dx,dy);
 // Outside zombies deliberately navigate to a gate or climb point before trying to reach the player.
 if(!stressMode&&!tutorialMode&&isOutsideFence(e.x,e.y)){
  const points=[gatePoint,...climbPoints];
  const target=points.reduce((best,q)=>Math.hypot(q.x*W-e.x,q.y*H-e.y)<Math.hypot(best.x*W-e.x,best.y*H-e.y)?q:best,points[0]);
  const tx=target.x*W,ty=target.y*H,dd=Math.hypot(tx-e.x,ty-e.y)||1;
  if(dd<24){if(target===gatePoint){e.x=tx;e.y=H*.89}else{e.climbing=true;e.climbT=.82;e.climbPoint=target;e.climbFrame=0}return}
  const sx=(tx-e.x)/dd*Math.min(step,dd),sy=(ty-e.y)/dd*Math.min(step,dd);
  // The outside approach can move along the outside edge, but never cross the fence except via a traversal.
  if(!solidSegments.some(q=>segmentHit(e.x+sx,e.y+sy,r,q))){e.x+=sx;e.y+=sy;return}
  const tangentCandidates=[[sx,0],[0,sy],[0,-Math.sign(e.y-ty)*step],[-Math.sign(e.x-tx)*step,0]];
  for(const [txd,tyd] of tangentCandidates){if(!solidSegments.some(q=>segmentHit(e.x+txd,e.y+tyd,r,q))){e.x+=txd;e.y+=tyd;break}}
  return;
 }
 let nx=ox+dx,ny=oy+dy;
 if(!blocked(nx,oy,r,"zombie"))e.x=nx;
 if(!blocked(e.x,ny,r,"zombie"))e.y=ny;
 if(Math.hypot(e.x-ox,e.y-oy)>.01)return;
 const base=Math.atan2(dy,dx);
 for(const a of [.65,-.65,1.25,-1.25,1.9,-1.9,Math.PI]){const tx=ox+Math.cos(base+a)*step,ty=oy+Math.sin(base+a)*step;if(!blocked(tx,ty,r,"zombie")){e.x=tx;e.y=ty;return}}
}
function isOutsideFence(px,py){return px<.035*W||px>.945*W||py<.065*H||py>.895*H}
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
 x.translate(e.x,e.y+(e.climbing?-7*Math.sin((e.climbFrame||0)/5*Math.PI):bob));
 x.rotate(dying?e.turn+((e.deathStyle===1?-1:1)*(1-life)*.8):e.climbing?(e.turn+Math.sin((e.climbFrame||0)*.7)*.25):e.turn+Math.sin(e.phase*.35)*.018);
 x.globalAlpha=dying?Math.max(.12,life):1;
 x.drawImage(im,sx,0,frameW,frameH,-25*scale,-25*scale,50*scale,50*scale);
 // No extra ellipse/shadow is drawn beneath the sprite; the PNG has transparency.
 if(!dying&&e.hitT>0){
  x.globalCompositeOperation='screen';x.globalAlpha=.18;
  x.fillStyle='#f4d4bd';x.beginPath();x.ellipse(0,-9,8,10,0,0,Math.PI*2);x.fill();
 }
 x.restore();x.globalAlpha=1;x.globalCompositeOperation='source-over';return true;
}
function resize(){
 viewW=innerWidth;viewH=innerHeight;
 c.width=viewW;c.height=viewH;
 const scale=stressMode?1:FARMHOUSE_WORLD_SCALE;
 W=viewW*scale;H=viewH*scale;
 camX=Math.max(0,Math.min(W-viewW,(player?player.x:viewW*scale/2)-viewW/2));
 camY=Math.max(0,Math.min(H-viewH,(player?player.y:viewH*scale/2)-viewH/2));
}addEventListener("resize",resize);resize();
function message(t){msg.textContent=t;clearTimeout(message.t);message.t=setTimeout(()=>msg.textContent="",1000)}
function reset(){resize();z=[];b=[];g=[];p=[];wave=1;clock=0;player={x:stressMode?W/2:tutorialMode?tutorialPoint(.20,.50).x:W*farmhouseMap.spawn.x,y:stressMode?H/2:tutorialMode?tutorialPoint(.20,.50).y:H*farmhouseMap.spawn.y,r:17,hp:100,arm:50,ammo:12,a:0,cd:0,walk:0,move:0,shootT:0,reloadT:0,throwT:0};C.base=stressMode?700:85;C.perWave=stressMode?0:5;C.spawnMs=stressMode?20:220;C.max=stressMode?700:100;newWave()}
function newWave(){left=C.base+(wave-1)*C.perWave;spawnT=0;inter=0;message("WAVE "+wave)}
function spawn(){if(left<=0||z.length>=C.max)return;let s=Math.floor(Math.random()*4),px,py;if(!stressMode){if(tutorialMode){let tp;if(s===0)tp=tutorialPoint(.08+Math.random()*.84,.03);else if(s===1)tp=tutorialPoint(.97,.52+Math.random()*.3);else if(s===2)tp=tutorialPoint(.08+Math.random()*.84,.97);else tp=tutorialPoint(.03,.2+Math.random()*.6);px=tp.x;py=tp.y}else if(s===0){px=(.05+Math.random()*.88)*W;py=H*.025}else if(s===1){px=W*.985;py=(.10+Math.random()*.78)*H}else if(s===2){px=(.05+Math.random()*.88)*W;py=H*.975}else{px=W*.005;py=(.10+Math.random()*.78)*H}}else if(s===0){px=Math.random()*W;py=-25}else if(s===1){px=W+25;py=Math.random()*H}else if(s===2){px=Math.random()*W;py=H+25}else{px=-25;py=Math.random()*H}z.push({x:px,y:py,r:13+Math.random()*3,v:55+Math.random()*23,phase:Math.random()*6.28,h:0,hitT:0,dead:false,deathT:0,deathLen:.48+Math.random()*.22,variant:Math.floor(Math.random()*20),walkStyle:Math.floor(Math.random()*3),deathStyle:Math.floor(Math.random()*3),turn:Math.atan2(player.y-py,player.x-px)+Math.PI/2,bloodLevel:Math.random(),skinTone:Math.random(),climbing:false,climbT:0,climbFrame:0,climbPoint:null});left--}
function shoot(){if(!running||paused||player.cd>0)return;let dx=aim.x,dy=aim.y;if(Math.hypot(dx,dy)<.2){dx=Math.cos(player.a);dy=Math.sin(player.a)}let d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;player.a=Math.atan2(dy,dx);b.push({x:player.x+dx*24,y:player.y+dy*24,vx:dx*850,vy:dy*850,t:.6});player.cd=.07;player.ammo=12;player.shootT=.12;p.push({x:player.x+dx*27,y:player.y+dy*27,t:.07,m:.07,k:"m"})}
function grenade(){if(!running||paused)return;let dx=aim.x,dy=aim.y;if(Math.hypot(dx,dy)<.2){dx=Math.cos(player.a);dy=Math.sin(player.a)}let d=Math.hypot(dx,dy)||1;g.push({x:player.x+dx*18,y:player.y+dy*18,vx:dx/d*430,vy:dy/d*430,t:.55});player.throwT=.32}
function reload(){if(!player)return;player.ammo=12;if(running&&!paused){player.reloadT=.42;let near=breakables.filter(q=>q.hp>0&&q.hp<q.maxHp).sort((a,b)=>Math.hypot(a.x*W-player.x,a.y*H-player.y)-Math.hypot(b.x*W-player.x,b.y*H-player.y))[0];if(near&&Math.hypot(near.x*W-player.x,near.y*H-player.y)<85){near.hp=Math.min(near.maxHp,near.hp+35);message("BARRICADE REPAIRED")}}}
function hurt(v){}
function killZombie(e){if(e.dead)return;e.dead=true;e.deathT=e.deathLen||.58;e.hitT=0;blood(e.x,e.y,e.variant)}
function update(dt){if(!running||paused)return;clock+=dt;player.cd=Math.max(0,player.cd-dt);player.shootT=Math.max(0,player.shootT-dt);player.reloadT=Math.max(0,player.reloadT-dt);player.throwT=Math.max(0,player.throwT-dt);spawnT-=dt*1000;while(left>0&&spawnT<=0&&z.length<C.max){spawn();spawnT+=C.spawnMs}
let mx=mv.x,my=mv.y;if(keys.w||keys.arrowup)my--;if(keys.s||keys.arrowdown)my++;if(keys.a||keys.arrowleft)mx--;if(keys.d||keys.arrowright)mx++;let moveLen=Math.hypot(mx,my);let d=moveLen||1;if(moveLen>0){mx/=d;my/=d}player.move=moveLen>0?1:0;player.walk+=dt*(player.move?10:2);movePlayer(mx*C.speed*dt,my*C.speed*dt);
if(Math.hypot(aim.x,aim.y)>.2){player.a=Math.atan2(aim.y,aim.x);shoot()}
for(const q of b)moveBullet(q,dt);b=b.filter(q=>q.t>0&&q.x>-40&&q.x<W+40&&q.y>-40&&q.y<H+40);
for(const q of g){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.985;q.vy*=.985;q.t-=dt;if(q.t<=0){boom(q.x,q.y);q.dead=1}}g=g.filter(q=>!q.dead);
for(const e of z){if(e.dead){e.deathT-=dt;continue}e.hitT=Math.max(0,e.hitT-dt);e.phase+=dt*(e.v*.12);
 if(e.climbing){e.climbT-=dt;e.climbFrame=Math.min(5,Math.floor((.82-e.climbT)/.82*6));const cp=e.climbPoint;if(e.climbT<=0&&cp){if(cp.side==="top")e.y=H*.095;else e.x=W*.935;e.climbing=false;e.climbPoint=null;e.climbT=0}continue}
 let dx=player.x-e.x,dy=player.y-e.y,dist=Math.hypot(dx,dy)||1;const desiredTurn=Math.atan2(dy,dx)+Math.PI/2;let turnDelta=((desiredTurn-e.turn+Math.PI*3)%(Math.PI*2))-Math.PI;e.turn+=turnDelta*Math.min(1,dt*9);moveZombie(e,dx/dist*e.v*dt,dy/dist*e.v*dt);if(!e.climbing&&!stressMode){const wall=breakables.find(q=>q.hp>0&&Math.hypot(q.x*W-e.x,q.y*H-e.y)<32);if(wall)wall.hp=Math.max(0,wall.hp-10*dt)}if(dist<e.r+player.r+3)hurt(12*dt)}z=z.filter(e=>!e.dead||e.deathT>0);for(const q of p)q.t-=dt;p=p.filter(q=>q.t>0);
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
 // Landscape estate canvas: deliberately follows the supplied plan after a 90-degree clockwise rotation.
 const R=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(W*a,H*b,W*c,H*d)}, S=(a,b,c,d,col,l=2)=>{x.strokeStyle=col;x.lineWidth=l;x.strokeRect(W*a,H*b,W*c,H*d)};
 R(0,0,1,1,"#30382a");
 // Dead grass, scorched patches and overgrowth.
 for(let i=0;i<360;i++){let xx=(i*173.7%W),yy=(i*97.3%H);x.globalAlpha=.28+(i%4)*.07;x.fillStyle=["#55513a","#242b22","#65513a","#3d432e"][i%4];x.beginPath();x.ellipse(xx,yy,2+i%8,1+i%4,i*.7,0,Math.PI*2);x.fill()}x.globalAlpha=1;
 // Perimeter fence, broken panels and rusty posts.
 x.strokeStyle="#161a17";x.lineWidth=8;x.strokeRect(W*.025,H*.055,W*.95,H*.89);x.strokeStyle="#6c6a58";x.lineWidth=2;x.strokeRect(W*.025,H*.055,W*.95,H*.89);
 for(let i=0;i<44;i++){let xx=W*(.025+i*.95/43);R(xx/W-.003,.047,.006,.025,i%7===0?"#282a25":"#77715c");R(xx/W-.003,.928,.006,.025,i%8===0?"#282a25":"#77715c")}
 for(let i=0;i<18;i++){let yy=.07+i*.049;R(.018,yy,.014,.007,"#665e4a");R(.968,yy,.014,.007,"#665e4a")}
 // Overgrown perimeter, dead trees and thorny hedges.
 for(let i=0;i<23;i++){let xx=.035+(i%2)*.02, yy=.10+i*.036; x.fillStyle=i%3?"#202b20":"#353d29";x.beginPath();x.arc(W*xx,H*yy,W*.014,0,Math.PI*2);x.fill();x.fillStyle="#171e18";x.beginPath();x.arc(W*(xx-.004),H*(yy-.006),W*.008,0,Math.PI*2);x.fill()}
 for(let i=0;i<24;i++){let xx=.92+(i%2)*.018,yy=.10+i*.035;x.fillStyle="#263023";x.beginPath();x.arc(W*xx,H*yy,W*.013,0,7);x.fill()}
 // Winding stone footpath from gardens around the farmhouse to the drive.
 x.lineCap="round";x.lineJoin="round";x.strokeStyle="#242820";x.lineWidth= W*.026;x.beginPath();x.moveTo(W*.30,H*.43);x.lineTo(W*.30,H*.51);x.bezierCurveTo(W*.29,H*.62,W*.32,H*.70,W*.38,H*.83);x.stroke();x.strokeStyle="#77715e";x.lineWidth=W*.019;x.beginPath();x.moveTo(W*.30,H*.43);x.lineTo(W*.30,H*.51);x.bezierCurveTo(W*.29,H*.62,W*.32,H*.70,W*.38,H*.83);x.stroke();
 // Main gravel drive and entrance on the right.
 x.strokeStyle="#20231f";x.lineWidth=W*.105;x.beginPath();x.moveTo(W*.98,H*.56);x.bezierCurveTo(W*.88,H*.56,W*.79,H*.57,W*.75,H*.66);x.bezierCurveTo(W*.72,H*.74,W*.80,H*.83,W*.91,H*.88);x.stroke();x.strokeStyle="#696657";x.lineWidth=W*.083;x.stroke();for(let i=0;i<210;i++){let xx=.70+(i*37%29)/100,yy=.55+(i*53%35)/100;x.fillStyle=i%3?"#89816a":"#403e35";x.globalAlpha=.45;x.fillRect(W*xx,H*yy,2,2)}x.globalAlpha=1;
 // Barn at left: seven damaged stalls and the large storage/work bay.
 R(.052,.115,.285,.34,"#121817");R(.06,.125,.269,.315,"#39403b");R(.065,.132,.255,.30,"#493b2d");
 // Stall floors, partitions and filthy straw.
 for(let i=0;i<4;i++){let xx=.075+i*.056;R(xx,.15,.049,.105,i%2?"#55452e":"#665033");for(let k=0;k<16;k++){x.strokeStyle=k%2?"#847044":"#332b20";x.lineWidth=1;x.beginPath();x.moveTo(W*(xx+.004+(k%5)*.008),H*(.16+Math.floor(k/5)*.025));x.lineTo(W*(xx+.012+(k%5)*.008),H*(.17+Math.floor(k/5)*.025));x.stroke()}R(xx+.047,.145,.006,.116,"#242724")}
 for(let i=0;i<3;i++){let xx=.075+i*.056;R(xx,.275,.049,.105,"#4d402e");for(let k=0;k<12;k++){x.strokeStyle="#79643c";x.beginPath();x.moveTo(W*(xx+.005+(k%4)*.01),H*(.29+Math.floor(k/4)*.027));x.lineTo(W*(xx+.012+(k%4)*.01),H*(.30+Math.floor(k/4)*.027));x.stroke()}}
 // Barn storage bay, crates, drums and broken roof sections.
 R(.255,.145,.073,.27,"#292d2a");R(.262,.153,.059,.25,"#55564d");for(let i=0;i<7;i++)for(let j=0;j<3;j++){R(.27+i*.007,.18+j*.065,.023,.047,(i+j)%2?"#62503a":"#4a3b2b");S(.27+i*.007,.18+j*.065,.023,.047,"#201f1a",1)}
 for(let i=0;i<8;i++){x.fillStyle=i%2?"#3b3227":"#4c4131";x.beginPath();x.arc(W*(.08+(i%4)*.055),H*(.14+Math.floor(i/4)*.27),W*.006,0,7);x.fill();x.strokeStyle="#161a18";x.stroke()}
 S(.052,.115,.285,.34,"#121715",5);for(let i=0;i<9;i++){R(.055+i*.032,.118,.003,.334,i%3?"#55594f":"#7a705c")}
 // Farmhouse centre, preserving room arrangement and central hall.
 R(.333,.15,.385,.70,"#111715");R(.345,.165,.36,.67,"#5a4c3a");R(.355,.18,.34,.64,"#302a24");
 // Floor rooms: upper bedrooms, bathroom, living rooms, kitchen and lower rooms.
 const rooms=[ [.365,.20,.083,.17,"#564635"],[.465,.20,.083,.17,"#554331"],[.565,.20,.083,.17,"#4b4438"],[.365,.40,.083,.17,"#554433"],[.465,.40,.083,.17,"#3e3429"],[.565,.40,.083,.17,"#514434"],[.365,.60,.083,.17,"#4b3d2d"],[.465,.60,.083,.17,"#493a2c"],[.565,.60,.083,.17,"#514333"] ];
 for(const a of rooms){R(...a);for(let j=0;j<8;j++){x.strokeStyle="#211f1a";x.globalAlpha=.45;x.lineWidth=1;x.beginPath();x.moveTo(W*a[0],H*(a[1]+.02+j*a[3]/8));x.lineTo(W*(a[0]+a[2]),H*(a[1]+.02+j*a[3]/8));x.stroke()}x.globalAlpha=1;S(a[0],a[1],a[2],a[3],"#89785b",2)}
 // Central corridor and blood-smeared runner.
 R(.448,.185,.012,.65,"#211b19");R(.449,.20,.009,.62,"#6c5542");R(.445,.39,.018,.23,"#4b1719");
 // Room partitions with door gaps, furniture and fixtures.
 for(const a of [[.455,.18,.012,.18],[.555,.18,.012,.18],[.455,.40,.012,.15],[.555,.40,.012,.15],[.455,.60,.012,.17],[.555,.60,.012,.17]])R(...a,"#171c1b");
 // Beds, bathroom fixtures, kitchen island, dining table and wrecked lounge furniture.
 R(.378,.23,.052,.07,"#292824");R(.381,.235,.045,.027,"#aaa18b");R(.381,.264,.045,.03,"#687582");R(.478,.23,.052,.07,"#292824");R(.481,.235,.045,.027,"#b1a48b");R(.481,.264,.045,.03,"#59636a");
 R(.58,.225,.022,.07,"#9b9887");R(.584,.23,.014,.045,"#c3c0b1");R(.614,.22,.025,.025,"#b6b4a6");R(.616,.225,.02,.015,"#4b5a5a");
 R(.58,.435,.052,.035,"#2b2721");R(.585,.44,.042,.025,"#6a5840");R(.59,.47,.01,.035,"#27251f");R(.38,.435,.045,.045,"#433a2d");R(.384,.44,.037,.035,"#75644b");
 R(.378,.64,.052,.06,"#302b24");R(.382,.645,.044,.05,"#77664e");R(.482,.64,.052,.06,"#312a22");R(.486,.645,.044,.05,"#66553e");R(.58,.64,.052,.06,"#292622");R(.584,.645,.044,.05,"#726149");
 // Wall outline and window frames, with boarded/broken panes.
 S(.333,.15,.385,.70,"#101615",5);S(.342,.16,.367,.68,"#7b7661",2);
 for(const yy of [.31,.51,.71]){R(.335,yy,.015,.045,"#171c1b");R(.704,yy,.015,.045,"#171c1b");R(.336,yy+.005,.012,.034,"#5c6966");R(.705,yy+.005,.012,.034,"#4b5a56");for(let j=0;j<3;j++)R(.337+j*.004,yy+.006,.002,.031,j%2?"#171b1a":"#8a3d32")}
 // Garage/workshop bottom-left, with wrecked car, shelves and scattered tools.
 R(.075,.64,.225,.225,"#121716");R(.085,.65,.205,.205,"#393b35");R(.095,.66,.185,.185,"#45443b");for(let i=0;i<5;i++){R(.10+i*.012,.67,.009,.15,i%2?"#5d4a34":"#282a26");R(.10+i*.012,.67,.009,.15,"#55422f")}
 // Car silhouette with shattered windshield and rust.
 x.fillStyle="#171b1c";x.beginPath();x.ellipse(W*.205,H*.755,W*.052,H*.042,-.06,0,Math.PI*2);x.fill();x.fillStyle="#343a3a";x.beginPath();x.ellipse(W*.205,H*.755,W*.043,H*.031,-.06,0,Math.PI*2);x.fill();x.fillStyle="#1c282b";x.beginPath();x.moveTo(W*.18,H*.735);x.lineTo(W*.224,H*.733);x.lineTo(W*.238,H*.755);x.lineTo(W*.17,H*.758);x.closePath();x.fill();x.strokeStyle="#73362c";x.lineWidth=3;x.beginPath();x.moveTo(W*.18,H*.735);x.lineTo(W*.20,H*.751);x.lineTo(W*.225,H*.735);x.stroke();for(const xx of [.17,.24]){x.fillStyle="#080a09";x.beginPath();x.arc(W*xx,H*.775,W*.009,0,7);x.fill()}
 S(.075,.64,.225,.225,"#111514",4);
 // Vegetable beds and overgrown left garden.
 for(let i=0;i<3;i++){R(.06,.49+i*.055,.045,.035,"#242720");S(.06,.49+i*.055,.045,.035,"#716047",2);for(let j=0;j<5;j++){x.fillStyle=j%2?"#465034":"#5c5a37";x.beginPath();x.arc(W*(.068+j*.007),H*(.50+i*.055),W*.003,0,7);x.fill()}}
 // Fountain on the right, drained and bloodied, ringed by weeds and rubble.
 x.fillStyle="#18201d";x.beginPath();x.ellipse(W*.825,H*.59,W*.064,H*.105,0,0,7);x.fill();x.fillStyle="#665d49";x.beginPath();x.ellipse(W*.825,H*.59,W*.054,H*.091,0,0,7);x.fill();x.fillStyle="#272f2e";x.beginPath();x.ellipse(W*.825,H*.59,W*.044,H*.076,0,0,7);x.fill();x.fillStyle="#3f4b48";x.beginPath();x.ellipse(W*.825,H*.59,W*.034,H*.063,0,0,7);x.fill();x.fillStyle="#6b171b";x.beginPath();x.ellipse(W*.817,H*.60,W*.023,H*.027,-.2,0,7);x.fill();x.strokeStyle="#8d8065";x.lineWidth=3;x.beginPath();x.ellipse(W*.825,H*.59,W*.049,H*.083,0,0,7);x.stroke();
 // Gore, corpses, broken boards, sandbags, rubble and rusty barricades.
 for(let i=0;i<22;i++){let xx=.32+(i*17%43)/100,yy=.22+(i*31%56)/100;x.fillStyle=i%3?"#64181b":"#302a24";x.globalAlpha=.45+(i%4)*.12;x.beginPath();x.ellipse(W*xx,H*yy,W*(.004+i%3*.002),H*(.003+i%2*.002),i*.6,0,7);x.fill()}x.globalAlpha=1;
 for(let i=0;i<13;i++){let xx=.30+(i*23%62)/100,yy=.84-(i%3)*.025;x.save();x.translate(W*xx,H*yy);x.rotate(i*.77);R(-.012,-.003,.024,.006,i%2?"#302b24":"#4c4030");x.restore()}
 // Blood-written warning and oppressive vignette.
 x.save();x.translate(W*.49,H*.53);x.rotate(-.04);x.fillStyle="#8a2023";x.font=`900 ${Math.max(12,Math.min(22,W*.022))}px Georgia`;x.fillText("HELP",0,0);x.restore();
 const vg=x.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.12,W*.5,H*.5,Math.max(W,H)*.76);vg.addColorStop(0,"#00000000");vg.addColorStop(1,"#050706c9");x.fillStyle=vg;x.fillRect(0,0,W,H);
}
function drawCollisionDebug(){
 if(!collisionDebug||stressMode)return;
 x.save();
 // World-space 2% grid. Each cell is labelled with its X/Y percentage range
 // so collision reports can identify the exact box start and end.
 x.lineWidth=1;
 const cellW=W/50, cellH=H/50;
 x.font='9px monospace';
 for(let ix=0;ix<=50;ix++){
  const gx=W*ix/50;
  x.strokeStyle=ix%5===0?'rgba(255,255,255,.48)':'rgba(255,255,255,.24)';
  x.beginPath();x.moveTo(gx,0);x.lineTo(gx,H);x.stroke();
 }
 for(let iy=0;iy<=50;iy++){
  const gy=H*iy/50;
  x.strokeStyle=iy%5===0?'rgba(255,255,255,.48)':'rgba(255,255,255,.24)';
  x.beginPath();x.moveTo(0,gy);x.lineTo(W,gy);x.stroke();
 }
 // Label every cell with the cell's top-left X/Y coordinate, using a dark
 // backing for legibility. Labels are world-space and pan with the map.
 for(let iy=0;iy<50;iy++){
  for(let ix=0;ix<50;ix++){
   const gx=ix*cellW, gy=iy*cellH;
   const label=`${String(ix*2).padStart(2,'0')},${String(iy*2).padStart(2,'0')}`;
   x.font='9px monospace';
   const tw=x.measureText(label).width;
   x.fillStyle='rgba(0,0,0,.62)';
   x.fillRect(gx+2,gy+2,tw+4,12);
   x.fillStyle='rgba(255,255,255,.94)';
   x.fillText(label,gx+4,gy+11);
  }
 }
 // Perimeter labels every 10% remain larger for orientation.
 x.font='bold 12px monospace';
 for(let i=0;i<=10;i++){
  const pct=i*10, gx=W*i/10, gy=H*i/10, label=String(pct).padStart(2,'0')+'%';
  x.fillStyle='rgba(0,0,0,.82)'; x.fillRect(Math.min(Math.max(0,gx-17),W-36),0,36,16);
  x.fillStyle='#fff'; x.fillText(label,Math.min(Math.max(2,gx-15),W-34),12);
  x.fillStyle='rgba(0,0,0,.82)'; x.fillRect(0,Math.min(Math.max(0,gy-8),H-16),36,16);
  x.fillStyle='#fff'; x.fillText(label,2,Math.min(Math.max(12,gy+4),H-2));
 }
 const drawSegments=(arr,color,width)=>{x.strokeStyle=color;x.lineWidth=width;x.lineCap='round';for(const q of arr){x.beginPath();x.moveTo(q[0]*W,q[1]*H);x.lineTo(q[2]*W,q[3]*H);x.stroke()}};
 drawSegments(solidSegments,'#ff3b30',4);
 drawSegments(movementOnly,'#38e56d',4);
 for(const q of breakables){x.fillStyle=q.hp>0?'rgba(30,160,255,.48)':'rgba(120,120,120,.25)';x.strokeStyle='#26a7ff';x.lineWidth=3;x.fillRect(q.x*W,q.y*H,q.w*W,q.h*H);x.strokeRect(q.x*W,q.y*H,q.w*W,q.h*H)}
 for(const q of climbPoints){x.fillStyle='#ffe52e';x.strokeStyle='#111';x.lineWidth=2;x.beginPath();x.arc(q.x*W,q.y*H,13,0,Math.PI*2);x.fill();x.stroke();x.fillStyle='#111';x.font='bold 12px monospace';x.fillText('CLIMB',q.x*W-20,q.y*H-18)}
 x.fillStyle='#ffe52e';x.strokeStyle='#111';x.lineWidth=2;x.beginPath();x.arc(gatePoint.x*W,gatePoint.y*H,13,0,Math.PI*2);x.fill();x.stroke();x.fillStyle='#111';x.font='bold 12px monospace';x.fillText('GATE',gatePoint.x*W-15,gatePoint.y*H-18);
 if(player){x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(player.x,player.y,player.r,0,Math.PI*2);x.stroke();x.fillStyle='#fff';x.font='bold 13px monospace';x.fillText(`PLAYER ${Math.round(player.x/W*100)}%, ${Math.round(player.y/H*100)}%`,player.x+18,player.y-18)}
 x.restore();
}
function draw(){
 x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);
 if(player){camX=Math.max(0,Math.min(W-viewW,player.x-viewW/2));camY=Math.max(0,Math.min(H-viewH,player.y-viewH/2))}else{camX=0;camY=0}
 x.save();x.translate(-camX,-camY);
 if(stressMode){x.fillStyle="#151515";x.fillRect(0,0,W,H);x.strokeStyle="#383838";x.lineWidth=3;x.strokeRect(18,18,W-36,H-36)}else if(tutorialMode&&tutorialTexture.complete&&tutorialTexture.naturalWidth){const tw=W*TUTORIAL_SCALE,th=H*TUTORIAL_SCALE;x.drawImage(tutorialTexture,(W-tw)/2,(H-th)/2,tw,th)}else if(farmhouseTexture.complete&&farmhouseTexture.naturalWidth){x.drawImage(farmhouseTexture,0,0,W,H)}else drawFarmhouse();
for(const q of p){let a=q.t/q.m;if(q.k==="b"){x.globalAlpha=a;x.fillStyle="#76191c";x.save();x.translate(q.x,q.y);x.rotate(q.rot||0);x.beginPath();x.ellipse(0,0,q.r||3,(q.r||3)*.58,0,0,Math.PI*2);x.fill();x.restore()}else if(q.k==="s"){x.globalAlpha=a*.7;x.fillStyle="#501316";x.beginPath();x.ellipse(q.x,q.y,q.r||7,(q.r||7)*.55,0,0,Math.PI*2);x.fill()}else if(q.k==="m"){x.globalAlpha=a;x.fillStyle="#fff1a8";x.beginPath();x.arc(q.x,q.y,13,0,7);x.fill()}else{x.globalAlpha=a;x.strokeStyle="#ffcc55";x.lineWidth=6;x.beginPath();x.arc(q.x,q.y,60*(1-a)+8,0,7);x.stroke()}}x.globalAlpha=1;
for(const q of g){x.fillStyle="#777";x.beginPath();x.arc(q.x,q.y,7,0,7);x.fill()}for(const e of z)drawZombie(e);drawPlayer();drawCollisionDebug();x.restore();if(collisionDebug&&!stressMode){x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle="rgba(0,0,0,.78)";x.fillRect(8,8,Math.min(c.width-16,360),48);x.fillStyle="#fff";x.font="bold 13px monospace";x.fillText("COLLISION DEBUG ON · GRID 5%",16,26);x.font="11px monospace";x.fillText("RED solid · BLUE breakable · GREEN movement-only · YELLOW entry",16,43);x.restore()}}

function frame(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
let settingsOrigin="home";
function toggle(){if(!running||!start.classList.contains("hidden")||!confirmOverlay.classList.contains("hidden"))return;paused=!paused;pause.classList.toggle("hidden",!paused);pauseBtn.textContent=paused?"▶":"Ⅱ";if(paused)mv.x=mv.y=aim.x=aim.y=0}
function showMapSelect(){homeMenu.classList.add("hidden");settingsMenu.classList.add("hidden");mapMenu.classList.remove("hidden");start.classList.remove("hidden")}
function backToHome(){mapMenu.classList.add("hidden");homeMenu.classList.remove("hidden")}
function startGame(e){e.preventDefault();e.stopPropagation();if(running)return;reset();running=true;paused=false;mapMenu.classList.add("hidden");start.classList.add("hidden");pause.classList.add("hidden");confirmOverlay.classList.add("hidden")}
function startSelectedMap(isStress=false,isTutorial=false){stressMode=isStress;tutorialMode=isTutorial;selectedMap=isStress?"arena":isTutorial?"tutorial":"farmhouse";resize();startGame({preventDefault(){},stopPropagation(){}})}
function openSettings(origin){settingsOrigin=origin;homeMenu.classList.add("hidden");mapMenu.classList.add("hidden");settingsMenu.classList.remove("hidden");backHomeBtn.textContent=origin==="pause"?"← BACK TO PAUSE MENU":"← BACK";start.classList.remove("hidden");pause.classList.add("hidden")}
function backFromSettings(){settingsMenu.classList.add("hidden");if(settingsOrigin==="pause"&&running){start.classList.add("hidden");pause.classList.remove("hidden");paused=true;pauseBtn.textContent="▶"}else{mapMenu.classList.add("hidden");homeMenu.classList.remove("hidden");start.classList.remove("hidden")}}
function askReturnToMenu(){confirmOverlay.classList.remove("hidden")}
function cancelReturn(){confirmOverlay.classList.add("hidden")}
function returnToMenu(){confirmOverlay.classList.add("hidden");pause.classList.add("hidden");start.classList.remove("hidden");settingsMenu.classList.add("hidden");mapMenu.classList.add("hidden");homeMenu.classList.remove("hidden");running=false;paused=false;z=[];b=[];g=[];p=[];keys={};mv.x=mv.y=aim.x=aim.y=0;pauseBtn.textContent="Ⅱ";hp.textContent="100";arm.textContent="50";waveEl.textContent="1";zEl.textContent="0";ammo.textContent="12";msg.textContent=""}
function bind(el,fn){let suppressClick=false;el.addEventListener("touchstart",e=>{e.preventDefault();e.stopPropagation();suppressClick=true;fn(e);setTimeout(()=>suppressClick=false,700)},{passive:false});el.addEventListener("click",e=>{e.preventDefault();if(suppressClick){suppressClick=false;return}fn(e)})}
bind(startBtn,showMapSelect);bind(backMapBtn,backToHome);bind(farmhouseBtn,()=>startSelectedMap(false,false));const tutorialBtn=document.getElementById("tutorialBtn");if(tutorialBtn)bind(tutorialBtn,()=>startSelectedMap(false,true));bind(stressTestBtn,()=>startSelectedMap(true,false));document.querySelectorAll(".mapCard.unavailable").forEach(el=>bind(el,()=>{message("LOCATION COMING SOON")}));bind(settingsBtn,()=>openSettings("home"));bind(pauseSettingsBtn,()=>openSettings("pause"));bind(backHomeBtn,backFromSettings);bind(multiplayerBtn,()=>{multiplayerBtn.querySelector("span").textContent="NOT AVAILABLE YET";setTimeout(()=>{const s=multiplayerBtn.querySelector("span");if(s)s.textContent="COMING SOON"},1800)});bind(resume,toggle);bind(pauseBtn,toggle);const debugBtn=document.getElementById("collisionDebugBtn");if(debugBtn)bind(debugBtn,()=>{collisionDebug=!collisionDebug;debugBtn.textContent=collisionDebug?"COLLISION DEBUG: ON":"COLLISION DEBUG: OFF";message(collisionDebug?"COLLISION DEBUG ON":"COLLISION DEBUG OFF")});bind(returnMenuBtn,askReturnToMenu);bind(cancelReturnBtn,cancelReturn);bind(confirmReturnBtn,returnToMenu);bind(reloadBtn,reload);bind(grenadeBtn,grenade);
addEventListener("keydown",e=>{const k=e.key.toLowerCase();keys[k]=1;if(e.key==="Escape"){if(!confirmOverlay.classList.contains("hidden"))cancelReturn();else if(!settingsMenu.classList.contains("hidden"))backFromSettings();else toggle()}if(k==="r")reload();if(k==="g")grenade();if(k==="d"){collisionDebug=!collisionDebug;const db=document.getElementById("collisionDebugBtn");if(db)db.textContent=collisionDebug?"COLLISION DEBUG: ON":"COLLISION DEBUG: OFF";message(collisionDebug?"COLLISION DEBUG ON":"COLLISION DEBUG OFF")}});addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);
function stick(el,s){el.addEventListener("touchstart",e=>{e.preventDefault();if(s.id!==null)return;s.id=e.changedTouches[0].identifier;moveStick(e.changedTouches[0],el,s)},{passive:false})}
function moveStick(t,el,s){let r=el.getBoundingClientRect(),dx=t.clientX-(r.left+r.width/2),dy=t.clientY-(r.top+r.height/2),m=r.width*.37,d=Math.hypot(dx,dy)||1;if(d>m){dx=dx/d*m;dy=dy/d*m}s.x=dx/m;s.y=dy/m;el.querySelector(".knob").style.transform=`translate(${dx}px,${dy}px)`}
function clearStick(el,s){s.id=null;s.x=s.y=0;el.querySelector(".knob").style.transform="translate(0,0)"}
stick(ms,mv);stick(as,aim);document.addEventListener("touchmove",e=>{e.preventDefault();for(const t of e.touches){if(t.identifier===mv.id)moveStick(t,ms,mv);if(t.identifier===aim.id)moveStick(t,as,aim)}},{passive:false});document.addEventListener("touchend",e=>{for(const t of e.changedTouches){if(t.identifier===mv.id)clearStick(ms,mv);if(t.identifier===aim.id)clearStick(as,aim)}},{passive:false});document.addEventListener("touchcancel",e=>{for(const t of e.changedTouches){if(t.identifier===mv.id)clearStick(ms,mv);if(t.identifier===aim.id)clearStick(as,aim)}},{passive:false});document.addEventListener("gesturestart",e=>e.preventDefault(),{passive:false});document.addEventListener("gesturechange",e=>e.preventDefault(),{passive:false});document.addEventListener("gestureend",e=>e.preventDefault(),{passive:false});
})();
