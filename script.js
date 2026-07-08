const isMobile = window.matchMedia('(max-width: 768px)').matches;

function toggleMenu(){
  document.getElementById('navLinks')?.classList.toggle('open');
}

// Mobile dropdown controls for premium navigation
function setupDropdowns(){
  document.querySelectorAll('.nav-drop .drop-main').forEach(btn=>{
    btn.addEventListener('click', e=>{
      if(window.innerWidth <= 950){
        e.preventDefault();
        const parent = btn.closest('.nav-drop');
        document.querySelectorAll('.nav-drop.open').forEach(d=>{ if(d!==parent) d.classList.remove('open'); });
        parent.classList.toggle('open');
      }
    });
  });
  document.addEventListener('click', e=>{
    if(!e.target.closest('.nav-drop') && !e.target.closest('.menu')) document.querySelectorAll('.nav-drop.open').forEach(d=>d.classList.remove('open'));
  });
}
setupDropdowns();

document.addEventListener('click', e => {
  const links = document.getElementById('navLinks');
  if (!links) return;
  if (e.target.closest('.links a') && !e.target.closest('.drop-panel')) links.classList.remove('open');
});

function rand(min,max){return Math.round((min+Math.random()*(max-min))*10)/10}
function setLiveStatus(){
  const cpu=rand(10,29), ram=rand(12,29), storage=rand(15,29), bw=rand(8,29), mum=rand(12,29), del=rand(14,29);
  const vals=document.querySelectorAll('.live-value');
  const bars=document.querySelectorAll('.bar span');
  const data=[ram,cpu,storage,bw];
  bars.forEach((b,i)=>{b.style.width=data[i%4]+'%'});
  vals.forEach(v=>{
    const type=v.dataset.live;
    if(type==='ram') v.textContent=ram+'% Used';
    if(type==='cpu') v.textContent=cpu+'% Load';
    if(type==='storage') v.textContent=storage+'% Used';
    if(type==='bw') v.textContent=bw+'% Used';
    if(type==='ping') v.innerHTML='Mumbai <span>~'+mum+'ms</span> | Delhi <span>~'+del+'ms</span>';
  });
}

window.addEventListener('load',()=>{
  setTimeout(()=>document.querySelectorAll('.loader').forEach(l=>l.classList.add('hide')), isMobile ? 150 : 350);
  setLiveStatus();
  setInterval(setLiveStatus, isMobile ? 5200 : 2400);
  if(!isMobile) revealRun();
  else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('show'));
});

const glow=document.querySelector('.cursor-glow');
if(!isMobile && glow){
  let ticking=false, mx=0, my=0;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    if(!ticking){
      requestAnimationFrame(()=>{glow.style.left=(mx-160)+'px';glow.style.top=(my-160)+'px';ticking=false;});
      ticking=true;
    }
  }, {passive:true});
}

let obs;
function revealRun(){
  obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.1, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.card,.section-head,.review,.hero-l,.hero-card,.glass,.subhero').forEach(el=>{el.classList.add('reveal');obs.observe(el)});
}

const cpuNames={intel:'Intel Xeon E5 / Scalable Node',amd:'AMD EPYC High Performance Node',ryzen:'Ryzen 9 Single-Core Boost Node'};
function setCpu(type){document.querySelectorAll('[data-cpu-tab]').forEach(b=>b.classList.toggle('active',b.dataset.cpuTab===type));document.querySelectorAll('[data-processor]').forEach(x=>x.textContent=cpuNames[type]);}
function setGameCpu(type){document.querySelectorAll('[data-game-tab]').forEach(b=>b.classList.toggle('active',b.dataset.gameTab===type));document.querySelectorAll('[data-game-processor]').forEach(x=>x.textContent=cpuNames[type].replace('Node','Game Node'));}

function animateNetCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    if(el.dataset.done) return;
    const target=parseInt(el.dataset.count,10)||0; let current=0;
    const step=Math.max(1,Math.ceil(target/42)); el.dataset.done='1';
    const timer=setInterval(()=>{current+=step; if(current>=target){current=target; clearInterval(timer);} el.textContent=current.toLocaleString('en-IN')+'+';},28);
  });
}
function updateHomePings(){
  const ranges={legacy:[16,28],budget:[18,30],performance:[15,25],free:[20,34],bot:[16,29],ultimate:[12,24],germany:[120,155],'sg-intel':[55,78],'sg-amd':[55,80]};
  document.querySelectorAll('[data-ping]').forEach(el=>{
    const r=ranges[el.dataset.ping]||[20,60]; const val=Math.round(r[0]+Math.random()*(r[1]-r[0]));
    el.textContent=val+'ms'; const meter=el.closest('.ping-meter')?.querySelector('i'); if(meter) meter.style.setProperty('--ping', Math.min(92, Math.max(18, val/1.7))+'%');
  });
}
window.addEventListener('load',()=>{
  animateNetCounters(); updateHomePings(); setInterval(updateHomePings, isMobile ? 5500 : 2600);
  const pingBtn=document.querySelector('.ping-all'); if(pingBtn) pingBtn.addEventListener('click',()=>{updateHomePings(); pingBtn.textContent='Ping Updated ✓'; setTimeout(()=>pingBtn.textContent='Ping Now',1200);});
});

// Interactive, draggable Gokuldham node globe (no heavy library, mobile friendly)
(function(){
  const canvas=document.getElementById('nodeGlobe');
  const shell=document.getElementById('interactiveGlobe');
  if(!canvas||!shell) return;
  const ctx=canvas.getContext('2d');
  const tip=document.getElementById('globeTooltip');
  const nodes=[
    {name:'Mumbai Performance Nodes', lat:19.07, lon:72.87, ping:'~18ms'},
    {name:'Delhi / Noida Legacy Nodes', lat:28.61, lon:77.20, ping:'~22ms'},
    {name:'Free India Nodes', lat:22.57, lon:88.36, ping:'~26ms'},
    {name:'Singapore Intel Nodes', lat:1.35, lon:103.82, ping:'~62ms'},
    {name:'Singapore AMD Nodes', lat:1.29, lon:103.85, ping:'~65ms'},
    {name:'Germany Ultimate Nodes', lat:50.11, lon:8.68, ping:'~138ms'},
    {name:'Bot Hosting India', lat:18.52, lon:73.85, ping:'~20ms'},
    {name:'Storage India', lat:12.97, lon:77.59, ping:'~24ms'},
    {name:'Dedicated India', lat:23.02, lon:72.57, ping:'~21ms'}
  ];
  let rotX=-0.16, rotY=0.0, velX=0, velY=0.0042, dragging=false, lastX=0,lastY=0,lastInteract=0, hoverNode=null;
  function resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2); const rect=shell.getBoundingClientRect();
    canvas.width=Math.max(240,Math.round(rect.width*dpr)); canvas.height=Math.max(240,Math.round(rect.height*dpr));
    canvas.style.width=rect.width+'px'; canvas.style.height=rect.height+'px'; ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function project(lat,lon){
    const rad=Math.PI/180; let phi=lat*rad, theta=(lon*rad)+rotY;
    let x=Math.cos(phi)*Math.sin(theta), y=Math.sin(phi), z=Math.cos(phi)*Math.cos(theta);
    const cy=Math.cos(rotX), sy=Math.sin(rotX); const y2=y*cy-z*sy, z2=y*sy+z*cy; y=y2; z=z2;
    return {x,y,z};
  }
  function draw(){
    const rect=shell.getBoundingClientRect(), w=rect.width, h=rect.height, cx=w/2, cy=h/2, r=Math.min(w,h)*0.43;
    ctx.clearRect(0,0,w,h);
    const grad=ctx.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r*1.04); grad.addColorStop(0,'rgba(0,229,255,.18)');grad.addColorStop(.5,'rgba(5,12,24,.62)');grad.addColorStop(1,'rgba(0,0,0,.92)');
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill(); ctx.strokeStyle='rgba(0,229,255,.25)'; ctx.lineWidth=1; ctx.stroke();
    // dotted globe grid
    for(let lat=-70;lat<=70;lat+=10){
      for(let lon=-180;lon<180;lon+=8){
        const p=project(lat,lon), scale=0.72+0.28*(p.z+1)/2; if(p.z<-0.55) continue;
        const x=cx+p.x*r, y=cy-p.y*r; ctx.beginPath(); ctx.arc(x,y,Math.max(.55,1.25*scale),0,Math.PI*2); ctx.fillStyle=`rgba(185,232,255,${0.08+0.34*((p.z+1)/2)})`; ctx.fill();
      }
    }
    // connection arcs from India hub
    const hub=project(19.07,72.87);
    nodes.slice(1).forEach(n=>{const p=project(n.lat,n.lon); if(hub.z<-0.35&&p.z<-0.35) return; ctx.beginPath(); ctx.moveTo(cx+hub.x*r,cy-hub.y*r); const mx=cx+(hub.x+p.x)*r/2, my=cy-(hub.y+p.y)*r/2-r*.13; ctx.quadraticCurveTo(mx,my,cx+p.x*r,cy-p.y*r); ctx.strokeStyle='rgba(245,197,24,.24)'; ctx.lineWidth=1; ctx.stroke();});
    // node markers
    let closest=null, closestDist=9999; const pointer=window.__globePointer;
    nodes.forEach(n=>{const p=project(n.lat,n.lon); if(p.z<-0.18) return; const x=cx+p.x*r, y=cy-p.y*r, depth=(p.z+1)/2, size=4+4*depth; const pulse=1+Math.sin(Date.now()/350 + n.lon)*.25; ctx.beginPath(); ctx.arc(x,y,size*2.8*pulse,0,Math.PI*2); ctx.fillStyle='rgba(0,255,166,.08)'; ctx.fill(); ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fillStyle='#00ffa6'; ctx.shadowColor='#00ffa6'; ctx.shadowBlur=18; ctx.fill(); ctx.shadowBlur=0; ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.stroke(); if(pointer){const d=Math.hypot(pointer.x-x,pointer.y-y); if(d<closestDist){closestDist=d; closest={n,x,y};}} });
    hoverNode=closest&&closestDist<26?closest:null;
    if(hoverNode&&tip){tip.textContent=hoverNode.n.name+' • '+hoverNode.n.ping; tip.classList.add('show'); tip.style.left=(hoverNode.x/w*100)+'%'; tip.style.top=(hoverNode.y/h*100)+'%';} else if(tip){tip.classList.remove('show');}
    if(!dragging){
      const idle=Date.now()-lastInteract>2200; rotY+= idle?0.0042:velY; rotX+=velX; velX*=.94; velY*=.94; if(rotX>.75)rotX=.75;if(rotX<-.75)rotX=-.75;
    }
    requestAnimationFrame(draw);
  }
  function local(e){const rect=shell.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-rect.left,y:t.clientY-rect.top};}
  function down(e){dragging=true; lastInteract=Date.now(); const p=local(e); lastX=p.x; lastY=p.y; velX=velY=0; shell.classList.add('dragging');}
  function move(e){const p=local(e); window.__globePointer=p; if(!dragging)return; e.preventDefault(); const dx=p.x-lastX, dy=p.y-lastY; rotY+=dx*.008; rotX+=dy*.006; velY=dx*.0008; velX=dy*.0006; lastX=p.x; lastY=p.y;}
  function up(){dragging=false; lastInteract=Date.now(); shell.classList.remove('dragging');}
  shell.addEventListener('mousedown',down); window.addEventListener('mousemove',move); window.addEventListener('mouseup',up); shell.addEventListener('touchstart',down,{passive:true}); shell.addEventListener('touchmove',move,{passive:false}); window.addEventListener('touchend',up);
  shell.addEventListener('mouseleave',()=>{window.__globePointer=null;}); window.addEventListener('resize',resize,{passive:true}); resize(); draw();
})();
