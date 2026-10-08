(() => {
"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha:false });
const hpBar = document.getElementById("hpBar"), armourBar = document.getElementById("armourBar");
const hpText = document.getElementById("hpText"), armourText = document.getElementById("armourText");
const waveText = document.getElementById("waveText"), zombieText = document.getElementById("zombieText");
const ammoText = document.getElementById("ammoText"), message = document.getElementById("message");
const overlay = document.getElementById("startOverlay"), startBtn = document.getElementById("startBtn");
const reloadBtn = document.getElementById("reloadBtn"), grenadeBtn = document.getElementById("grenadeBtn");

let W=0,H=0,dpr=1,last=0,running=false;
const world = { w:2600, h:1800 };
const keys = new Set();
const pointer = { x:0,y:0,down:false };
const camera = { x:0,y:0 };
const player = {
  x:world.w/2,y:world.h/2,r:18,speed:260,hp:100,maxHp:100,armour:50,maxArmour:50,
  angle:0,ammo:12,mag:12,fireRate:6,cooldown:0,reload:0,invuln:0,grenades:3
};

const zombies=[];
const bullets=[];
const blood=[];
const grenades=[];
const flashes=[];
const walls=[
  {x:180,y:150,w:2240,h:70},{x:180,y:1580,w:2240,h:70},
  {x:180,y:220,w:70,h:1360},{x:2350,y:220,w:70,h:1360},
  {x:560,y:500,w:420,h:70},{x:1620,y:500,w:420,h:70},
  {x:560,y:1230,w:420,h:70},{x:1620,y:1230,w:420,h:70},
  {x:1160,y:340,w:70,h:400},{x:1160,y:1060,w:70,h:400}
];

let wave=1,spawnRemaining=0,spawnTimer=0,betweenWave=0,kills=0;
let waveBanner=0;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function resize(){
  dpr=Math.min(devicePixelRatio||1,2);
  W=innerWidth; H=innerHeight;
  canvas.width=Math.floor(W*dpr); canvas.height=Math.floor(H*dpr);
  canvas.style.width=W+"px"; canvas.style.height=H+"px";
}
addEventListener("resize",resize); resize();

function reset(){
  player.x=world.w/2;player.y=world.h/2;player.hp=100;player.armour=50;player.ammo=12;
  player.reload=0;player.cooldown=0;player.grenades=3;player.angle=0;
  wave=1;kills=0;betweenWave=0;
  zombies.length=0;bullets.length=0;blood.length=0;grenades.length=0;flashes.length=0;
  moveStick.reset(); aimStick.reset();
  beginWave();
  message.textContent="";message.style.opacity=0;
}

function start(e){
  if(e){e.preventDefault();e.stopPropagation();}
  if(running)return;
  reset(); running=true; overlay.style.display="none"; last=performance.now(); requestAnimationFrame(loop);
}

// Direct touch handling is used for the start screen because iOS Safari can delay/suppress
// synthetic click events when the page is behaving like a full-screen game.
startBtn.addEventListener("touchstart",start,{passive:false});
overlay.addEventListener("touchstart",start,{passive:false});
startBtn.addEventListener("click",start);

document.addEventListener("touchmove",e=>e.preventDefault(),{passive:false});
document.addEventListener("gesturestart",e=>e.preventDefault(),{passive:false});
document.addEventListener("gesturechange",e=>e.preventDefault(),{passive:false});
document.addEventListener("gestureend",e=>e.preventDefault(),{passive:false});

addEventListener("keydown",e=>{
  keys.add(e.key.toLowerCase());
  if(e.key.toLowerCase()==="r") reload();
  if(e.key.toLowerCase()==="g") grenade();
});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
addEventListener("blur",()=>{keys.clear();pointer.down=false;moveStick.reset();aimStick.reset()});

canvas.addEventListener("pointermove",e=>{
  if(e.pointerType==="mouse"){pointer.x=e.clientX;pointer.y=e.clientY;}
});
canvas.addEventListener("pointerdown",e=>{
  if(e.pointerType==="mouse"){pointer.down=true;pointer.x=e.clientX;pointer.y=e.clientY;}
});
addEventListener("pointerup",e=>{if(e.pointerType==="mouse")pointer.down=false});

function worldFromScreen(x,y){return {x:x+(camera.x-W/2),y:y+(camera.y-H/2)}}

function circleRectResolve(o,r){
  for(const q of walls){
    const cx=clamp(o.x,q.x,q.x+q.w),cy=clamp(o.y,q.y,q.y+q.h);
    let dx=o.x-cx,dy=o.y-cy,d2=dx*dx+dy*dy;
    if(d2<r*r){
      if(d2===0){
        const left=Math.abs(o.x-q.x),right=Math.abs(o.x-(q.x+q.w)),top=Math.abs(o.y-q.y),bot=Math.abs(o.y-(q.y+q.h));
        const m=Math.min(left,right,top,bot);
        if(m===left)o.x=q.x-r;else if(m===right)o.x=q.x+q.w+r;else if(m===top)o.y=q.y-r;else o.y=q.y+q.h+r;
      } else {
        const d=Math.sqrt(d2);o.x+=dx/d*(r-d);o.y+=dy/d*(r-d);
      }
    }
  }
  o.x=clamp(o.x,220+r,2330-r);o.y=clamp(o.y,190+r,1570-r);
}

function reload(){if(player.reload<=0 && player.ammo<player.mag) player.reload=1.05}

function shoot(angle=player.angle){
  if(player.reload>0||player.cooldown>0)return;
  if(player.ammo<=0){reload();return}
  player.ammo--;player.cooldown=1/player.fireRate;
  const spread=rand(-.025,.025),a=angle+spread;
  bullets.push({x:player.x+Math.cos(a)*22,y:player.y+Math.sin(a)*22,vx:Math.cos(a)*900,vy:Math.sin(a)*900,life:.7,r:3,damage:28});
  flashes.push({x:player.x+Math.cos(a)*38,y:player.y+Math.sin(a)*38,life:.055,max:.055,r:18});
}

function grenade(){
  if(player.grenades<=0)return;
  player.grenades--;
  const a=player.angle;
  const gx=clamp(player.x+Math.cos(a)*220,220,2380),gy=clamp(player.y+Math.sin(a)*220,190,1610);
  grenades.push({x:gx,y:gy,life:.45,max:.45,blink:0});
}

function explodeGrenade(g){
  const radius=190;
  for(let i=zombies.length-1;i>=0;i--){
    const z=zombies[i],d=Math.hypot(z.x-g.x,z.y-g.y);
    if(d<radius){
      z.hp-=120*(1-d/radius);z.flash=.12;
      const push=Math.max(0,1-d/radius)*70;
      if(d>0){z.x+=(z.x-g.x)/d*push;z.y+=(z.y-g.y)/d*push;circleRectResolve(z,z.r)}
      if(z.hp<=0)killZombie(i);
    }
  }
  for(let i=0;i<55;i++) blood.push({x:g.x+rand(-150,150),y:g.y+rand(-150,150),r:rand(2,8),life:rand(.3,.9)});
  flashes.push({x:g.x,y:g.y,life:.22,max:.22,r:220,type:"explosion"});
}

function spawnZombie(){
  const side=Math.floor(Math.random()*4), pad=100;
  let x,y;
  if(side===0){x=rand(250,2350);y=pad+100}
  else if(side===1){x=rand(250,2350);y=world.h-pad-100}
  else if(side===2){x=pad+100;y=rand(250,1550)}
  else{x=world.w-pad-100;y=rand(250,1550)}
  zombies.push({x,y,r:15,hp:45+wave*4,maxHp:45+wave*4,speed:55+Math.min(wave,20)*2,attack:0,flash:0});
}

function beginWave(){
  spawnRemaining=12+wave*6;
  spawnTimer=0;
  betweenWave=2;
  waveText.textContent=`WAVE ${wave}`;
  waveBanner=1.1;
}

function killZombie(index){
  const z=zombies[index];
  kills++;
  for(let k=0;k<9;k++)blood.push({x:z.x+rand(-15,15),y:z.y+rand(-15,15),r:rand(2,6),life:rand(.3,1)});
  flashes.push({x:z.x,y:z.y,life:.08,max:.08,r:22,type:"hit"});
  zombies.splice(index,1);
}

function damagePlayer(amount){
  if(player.invuln>0)return;
  player.invuln=.22;
  const absorbed=Math.min(player.armour,amount*.65);
  player.armour-=absorbed;
  player.hp-=amount-absorbed;
  if(player.hp<=0){
    player.hp=0;running=false;
    message.textContent="YOU DIED";
    message.style.opacity=1;
    setTimeout(()=>{overlay.style.display="flex";message.style.opacity=0},800);
  }
}

function update(dt){
  if(player.invuln>0)player.invuln-=dt;
  if(player.cooldown>0)player.cooldown-=dt;
  if(player.reload>0){player.reload-=dt;if(player.reload<=0)player.ammo=player.mag}
  if(waveBanner>0)waveBanner-=dt;

  let mx=0,my=0;
  if(keys.has("w")||keys.has("arrowup"))my--;
  if(keys.has("s")||keys.has("arrowdown"))my++;
  if(keys.has("a")||keys.has("arrowleft"))mx--;
  if(keys.has("d")||keys.has("arrowright"))mx++;
  if(moveStick.active){mx=moveStick.x;my=moveStick.y}
  const len=Math.hypot(mx,my);if(len>1){mx/=len;my/=len}
  player.x+=mx*player.speed*dt;player.y+=my*player.speed*dt;circleRectResolve(player,player.r);

  if(aimStick.active && Math.hypot(aimStick.x,aimStick.y)>.15){
    player.angle=Math.atan2(aimStick.y,aimStick.x);shoot(player.angle);
  }else if(!isCoarsePointer()){
    const p=worldFromScreen(pointer.x,pointer.y);player.angle=Math.atan2(p.y-player.y,p.x-player.x);
    if(pointer.down)shoot(player.angle);
  }

  if(spawnRemaining>0){
    spawnTimer-=dt;
    if(spawnTimer<=0){spawnZombie();spawnRemaining--;spawnTimer=Math.max(.08,.35-wave*.006)}
  } else if(zombies.length===0 && betweenWave>0){
    betweenWave-=dt;
    if(betweenWave<=0){wave++;beginWave()}
  }

  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    let remove=b.life<=0||b.x<0||b.y<0||b.x>world.w||b.y>world.h;
    for(const q of walls)if(b.x>q.x&&b.x<q.x+q.w&&b.y>q.y&&b.y<q.y+q.h){remove=true;break}
    if(!remove)for(let j=zombies.length-1;j>=0;j--){
      const z=zombies[j],d=Math.hypot(b.x-z.x,b.y-z.y);
      if(d<z.r+b.r){
        z.hp-=b.damage;z.flash=.07;remove=true;
        if(z.hp<=0)killZombie(j);
        break;
      }
    }
    if(remove)bullets.splice(i,1);
  }

  for(let i=grenades.length-1;i>=0;i--){
    const g=grenades[i];g.life-=dt;g.blink+=dt;
    if(g.life<=0){explodeGrenade(g);grenades.splice(i,1)}
  }

  for(const z of zombies){
    z.flash=Math.max(0,z.flash-dt);z.attack-=dt;
    const dx=player.x-z.x,dy=player.y-z.y,d=Math.hypot(dx,dy)||1;
    if(d>player.r+z.r+4){z.x+=dx/d*z.speed*dt;z.y+=dy/d*z.speed*dt;circleRectResolve(z,z.r)}
    else if(z.attack<=0){damagePlayer(7+wave*.15);z.attack=.65}
  }

  for(let i=blood.length-1;i>=0;i--){blood[i].life-=dt;if(blood[i].life<=0)blood.splice(i,1)}
  for(let i=flashes.length-1;i>=0;i--){flashes[i].life-=dt;if(flashes[i].life<=0)flashes.splice(i,1)}

  camera.x+=((player.x)-camera.x)*Math.min(1,dt*8);camera.y+=((player.y)-camera.y)*Math.min(1,dt*8);

  hpBar.style.width=`${player.hp}%`;armourBar.style.width=`${player.armour/player.maxArmour*100}%`;
  hpText.textContent=Math.ceil(player.hp);armourText.textContent=Math.ceil(player.armour);
  zombieText.textContent=`ZOMBIES ${zombies.length}  •  KILLS ${kills}`;
  ammoText.textContent=player.reload>0?"RELOADING":`${player.ammo} / ∞  •  G ${player.grenades}`;
}

function draw(){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle="#0d0f0f";ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(W/2-camera.x,H/2-camera.y);

  ctx.fillStyle="#34332f";ctx.fillRect(0,0,world.w,world.h);
  ctx.strokeStyle="rgba(0,0,0,.13)";ctx.lineWidth=2;
  for(let x=220;x<2380;x+=80){ctx.beginPath();ctx.moveTo(x,190);ctx.lineTo(x,1570);ctx.stroke()}
  for(let y=190;y<1580;y+=80){ctx.beginPath();ctx.moveTo(220,y);ctx.lineTo(2380,y);ctx.stroke()}

  ctx.fillStyle="rgba(90,70,45,.22)";ctx.fillRect(900,740,820,320);
  for(const q of walls){
    ctx.fillStyle="#242321";ctx.fillRect(q.x,q.y,q.w,q.h);
    ctx.strokeStyle="#57534a";ctx.strokeRect(q.x,q.y,q.w,q.h);
  }

  for(const b of blood){ctx.globalAlpha=Math.min(1,b.life*2);ctx.fillStyle="#7c1717";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=1;

  for(const b of bullets){ctx.fillStyle="#f0d28a";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()}

  for(const g of grenades){
    ctx.save();ctx.translate(g.x,g.y);
    const pulse=1+Math.sin(g.blink*20)*.12;
    ctx.fillStyle="#262626";ctx.beginPath();ctx.arc(0,0,8*pulse,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#d0a12a";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,11*pulse,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }

  for(const z of zombies){
    ctx.save();ctx.translate(z.x,z.y);
    ctx.fillStyle=z.flash>0?"#eee":"#536052";ctx.beginPath();ctx.arc(0,0,z.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#171717";ctx.beginPath();ctx.arc(-5,-2,2,0,7);ctx.arc(5,-2,2,0,7);ctx.fill();
    const hp=Math.max(0,z.hp/z.maxHp);ctx.fillStyle="#111";ctx.fillRect(-17,-24,34,4);ctx.fillStyle="#9d2424";ctx.fillRect(-17,-24,34*hp,4);
    ctx.restore();
  }

  ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.angle);
  ctx.fillStyle=player.invuln>0?"#eee":"#7b8580";ctx.beginPath();ctx.arc(0,0,player.r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#222";ctx.fillRect(7,-5,27,10);
  ctx.fillStyle="#b52c2c";ctx.fillRect(-6,-12,12,4);
  ctx.restore();

  for(const f of flashes){
    const a=Math.max(0,f.life/f.max);
    ctx.save();ctx.globalAlpha=a;
    if(f.type==="explosion"){
      const p=1-a;ctx.fillStyle="#f1c05a";ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.35+p*.65),0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#fff0a8";ctx.lineWidth=5;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.2+p*.8),0,Math.PI*2);ctx.stroke();
    }else{
      ctx.fillStyle="#eee";ctx.beginPath();ctx.arc(f.x,f.y,f.r*(1-a),0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();

  if(waveBanner>0 && running){
    ctx.save();ctx.globalAlpha=Math.min(1,waveBanner/.3, (1.1-waveBanner)/.3 + .3);
    ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="900 30px Arial";ctx.fillText(`WAVE ${wave}`,W/2,H*.22);
    ctx.restore();
  }
}

function loop(now){
  if(!running)return;
  const dt=Math.min(.033,(now-last)/1000);last=now;
  update(dt);draw();requestAnimationFrame(loop);
}

function isCoarsePointer(){return matchMedia("(pointer:coarse)").matches}

function createStick(){
  return {
    active:false,id:null,x:0,y:0,
    reset(){this.active=false;this.id=null;this.x=0;this.y=0;if(this.knob)this.knob.style.transform="translate(0,0)";},
    knob:null
  };
}
const moveStick=createStick();
const aimStick=createStick();

function bindStick(el,state){
  state.knob=el.querySelector(".knob");
  const radius=47;
  function setPoint(clientX,clientY){
    const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    let x=clientX-cx,y=clientY-cy,d=Math.hypot(x,y);
    if(d>radius){x=x/d*radius;y=y/d*radius}
    state.x=x/radius;state.y=y/radius;
    state.knob.style.transform=`translate(${x}px,${y}px)`;
  }

  el.addEventListener("touchstart",e=>{
    e.preventDefault();
    if(state.active)return;
    const t=e.changedTouches[0];state.active=true;state.id=t.identifier;setPoint(t.clientX,t.clientY);
  },{passive:false});
  document.addEventListener("touchmove",e=>{
    if(!state.active)return;
    for(const t of e.touches){if(t.identifier===state.id){e.preventDefault();setPoint(t.clientX,t.clientY);break;}}
  },{passive:false});
  document.addEventListener("touchend",e=>{
    for(const t of e.changedTouches){if(t.identifier===state.id){state.reset();break;}}
  },{passive:false});
  document.addEventListener("touchcancel",e=>{
    for(const t of e.changedTouches){if(t.identifier===state.id){state.reset();break;}}
  },{passive:false});

  // Mouse/pointer fallback for desktop testing.
  el.addEventListener("pointerdown",e=>{
    if(e.pointerType!=="mouse")return;
    e.preventDefault();state.active=true;state.id=e.pointerId;el.setPointerCapture(e.pointerId);setPoint(e.clientX,e.clientY);
  });
  el.addEventListener("pointermove",e=>{if(e.pointerType==="mouse"&&state.active&&e.pointerId===state.id)setPoint(e.clientX,e.clientY)});
  const end=e=>{if(e.pointerType==="mouse"&&e.pointerId===state.id)state.reset()};
  el.addEventListener("pointerup",end);el.addEventListener("pointercancel",end);
}

bindStick(document.getElementById("moveStick"),moveStick);
bindStick(document.getElementById("aimStick"),aimStick);

function bindAction(el,fn){
  el.addEventListener("touchstart",e=>{e.preventDefault();fn()},{passive:false});
  el.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"){e.preventDefault();fn()}});
}
bindAction(reloadBtn,reload);
bindAction(grenadeBtn,grenade);

beginWave();
})();
