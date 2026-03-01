// ═══ FIBONACCI ENGINE ═══════════════════════
const FIB = {
  PHI:1.618033988749895, E:2.718281828459045, PI:3.141592653589793, C:299792458,
  _c:new Map([[0,0n],[1,1n]]),
  get(n){
    if(this._c.has(n))return this._c.get(n);
    let a=0n,b=1n;
    for(let i=2;i<=n;i++){[a,b]=[b,a+b]}
    this._c.set(n,b);return b;
  },
  energy(s){const m=s/100,c=this.C/1e8;return m*c*c},
  tier(s){
    if(s>=80)return{t:'PLATINUM',max:3000000,cls:'b-plat'};
    if(s>=60)return{t:'GOLD',max:1000000,cls:'b-gold'};
    if(s>=40)return{t:'SILVER',max:300000,cls:'b-silver'};
    return{t:'BRONZE',max:50000,cls:'b-bronze'};
  },
  hash(d,n=20){
    const s=typeof d==='string'?d:JSON.stringify(d);
    let h1=0xdeadbeef^s.length,h2=0x41c6ce57^s.length;
    for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
    h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
    h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
    const base=(4294967296*(2097151&h2)+(h1>>>0)).toString(16).padStart(16,'0');
    const fn=this.get(Math.min(n,78)).toString(16);
    return base.split('').map((c,i)=>((parseInt(c,16)^parseInt(fn[i%fn.length],16))&0xf).toString(16)).join('');
  },
  genTINI(prenom,nom,tel,score=0){
    const nh=this.hash(nom+prenom);
    const n=(parseInt(nh.slice(0,4),16)%40)+10;
    const m=(parseInt(nh.slice(4,8),16)%30)+8;
    const k1=this.PHI*(1+(parseInt(nh.slice(0,2),16)%20)/100);
    const k2=this.E*(1+(parseInt(nh.slice(2,4),16)%10)/100);
    const fib_n=this.get(Math.min(n,78));
    const fib_m=this.get(Math.min(m,78));
    const kFib=(fib_n*BigInt(Math.round(k1*1e6))/BigInt(1e6))*(fib_m*BigInt(Math.round(k2*1e6))/BigInt(1e6));
    const kHex=kFib.toString(16);
    const psh=Math.round(this.PI*1000)%Math.max(kHex.length,1);
    const rot=kHex.slice(psh)+kHex.slice(0,psh);
    const ei=Math.round(this.E*1000)%16;
    const kFin=rot.split('').map(c=>((parseInt(c,16)^ei)%16).toString(16)).join('');
    const ph=this.hash({prenom,nom,tel,kFin,ts:Date.now()},n);
    const fb=this.get(n).toString(36).slice(0,6).toUpperCase();
    const piS=Math.round(this.PI*1e6).toString(36).toUpperCase();
    const eS=Math.round(this.E*1e6).toString(36).toUpperCase();
    return{
      id:`TINI-GHP-${fb}-${piS}-${eS}-${ph.slice(0,8).toUpperCase()}`,
      hash:ph,fib_n:n,fib_m:m,
      k1:k1.toFixed(6),k2:k2.toFixed(6),
      k_fib:kHex.slice(0,20)+'…',
      k_final:kFin.slice(0,20)+'…',
      energy:this.energy(score).toFixed(4),
    };
  },
  calcScore(d){
    let s=0;
    if(d.prenom?.length>1)s+=10;if(d.nom?.length>1)s+=10;if(d.phone)s+=15;if(d.ville)s+=8;
    const dep=parseFloat(d.depot)||0;if(dep>=10000)s+=5;if(dep>=50000)s+=8;if(dep>=100000)s+=12;
    s+=(d.formations||0)*20;s+=(d.missions||0)*8;s+=(d.prets_ok||0)*20;
    return Math.min(s,100);
  },
  diff(D,n,t){return Math.max(1,Math.round(D/(Number(this.get(Math.min(n,50)))+Math.max(t,.01))))}
};

// ═══ STORE ══════════════════════════════════
const S = {
  get:(k)=>{try{const v=localStorage.getItem('cf_'+k);return v?JSON.parse(v):null}catch{return null}},
  set:(k,v)=>{try{localStorage.setItem('cf_'+k,JSON.stringify(v))}catch{}},
  del:(k)=>{try{localStorage.removeItem('cf_'+k)}catch{}},
  user:()=>S.get('user'),
  setUser:(u)=>S.set('user',u),
  txs:()=>S.get('txs')||[],
  addTx:(t)=>{const a=S.txs();a.unshift(t);S.set('txs',a.slice(0,200))},
  blocks:()=>S.get('blocks')||[],
  addBlock:(b)=>{const a=S.blocks();a.unshift(b);S.set('blocks',a.slice(0,50))},
  prets:()=>S.get('prets')||[],
  addPret:(p)=>{const a=S.prets();a.unshift(p);S.set('prets',a)},
  tontines:()=>S.get('tontines')||[],
  addTontine:(t)=>{const a=S.tontines();a.unshift(t);S.set('tontines',a)},
  notifs:()=>S.get('notifs')||[],
  addNotif:(n)=>{const a=S.notifs();a.unshift(n);S.set('notifs',a.slice(0,50))},
  epargnes:()=>S.get('epargnes')||[],
  addEpg:(e)=>{const a=S.epargnes();a.unshift(e);S.set('epargnes',a)},
  assurances:()=>S.get('assurances')||[],
  addAss:(a)=>{const arr=S.assurances();arr.unshift(a);S.set('assurances',arr)},
};

// ═══ FORMAT ══════════════════════════════════
const F = {
  fcfa:(v)=>{const n=parseFloat(v)||0;if(n>=1e9)return(n/1e9).toFixed(1)+' Mds F';if(n>=1e6)return(n/1e6).toFixed(2)+' M F';if(n>=1000)return(n/1000).toFixed(0)+' K F';return n.toFixed(0)+' F'},
  full:(v)=>Math.round(parseFloat(v)||0).toLocaleString('fr-FR')+' FCFA',
  date:(ts)=>new Date(ts).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}),
  num:(n,d=0)=>(parseFloat(n)||0).toFixed(d),
};

// ═══ DATA ════════════════════════════════════
const D = {
  formations:[
    {id:'f1',title:'Finance Personnelle Africaine',cat:'finance',level:'debutant',dur:45,pts:20,ico:'💰',modules:['Budget familial','Tontines & ROSCAs','Mobile Money avancé','Épargne sans banque'],cert:true},
    {id:'f2',title:'Entrepreneuriat & Business Plan',cat:'entrepreneuriat',level:'intermediaire',dur:90,pts:35,ico:'🚀',modules:['Valider son idée','Business Model Canvas','Lever des fonds','Pitcher en 5 min'],cert:true},
    {id:'f3',title:'Marketing Digital Accessible',cat:'digital',level:'debutant',dur:60,pts:25,ico:'📱',modules:['WhatsApp Business','Créer du contenu','Facebook Marketplace','Mesurer ses ventes'],cert:true},
    {id:'f4',title:'Agriculture & Financement Vert',cat:'agriculture',level:'intermediaire',dur:75,pts:30,ico:'🌾',modules:['Crédit agricole','Projets écoresponsables','Certification impact','Marchés régionaux'],cert:true},
    {id:'f5',title:'Santé & Assurance Micro',cat:'sante',level:'debutant',dur:30,pts:15,ico:'🏥',modules:['Mutuelles locales','Assurance vie 2%','Urgences financières','Réseau NHIS'],cert:false},
    {id:'f6',title:'Tech & IA pour Tous',cat:'tech',level:'avance',dur:60,pts:25,ico:'🤖',modules:['IA accessible','Automatiser (Zapier)','Créer sans code','Vendre ses skills IA'],cert:true},
    {id:'f7',title:'Comptabilité Simplifiée',cat:'finance',level:'debutant',dur:50,pts:22,ico:'📊',modules:['Livre de comptes','Facturation pro','Déclarations fiscales','Excel / Tableur'],cert:true},
  ],
  offres:[
    {id:'j1',title:'Assistant Comptable',co:'Boutique Aliou & Frères',ville:'Dakar',type:'freelance',cat:'finance',min:25000,max:35000,dur:'1 semaine',urgent:true,pay:'wave',desc:'Saisie comptable mensuelle · Bilan · Formation Finance requise.'},
    {id:'j2',title:'Community Manager WhatsApp',co:'Mode Africaine Dakar',ville:'Bamako',type:'partiel',cat:'digital',min:65000,max:80000,dur:'1 mois',urgent:false,pay:'orange_money',desc:'Gérer la page WhatsApp Business · Répondre clients.'},
    {id:'j3',title:'Agent Terrain Agricole',co:'Coopérative Verte GHP',ville:'Bamako',type:'cdi',cat:'agriculture',min:100000,max:130000,dur:'6 mois',urgent:false,pay:'mtn',desc:'Superviser 15 agriculteurs partenaires GHP · Reporting mensuel.'},
    {id:'j4',title:'Développeur No-Code',co:'Startup SenTech',ville:'Dakar',type:'projet',cat:'digital',min:150000,max:200000,dur:'3 semaines',urgent:true,pay:'wave',desc:"Créer landing page · Formulaire · Mise en ligne."},
    {id:'j5',title:'Agent Sensibilisation Santé',co:'ONG Santé Plus',ville:'Abidjan',type:'cdd',cat:'sante',min:75000,max:90000,dur:'3 mois',urgent:false,pay:'mtn',desc:"Aller de porte en porte · Expliquer les mutuelles de santé."},
    {id:'j6',title:'Livreur & Logistique Locale',co:'Marché Central Dakar',ville:'Dakar',type:'freelance',cat:'logistique',min:15000,max:45000,dur:'Continu',urgent:true,pay:'orange_money',desc:'Livraisons Dakar · Moto ou à pied · Flexibilité totale.'},
    {id:'j7',title:'Professeur Numérique',co:'École Numérique GHP',ville:'Thiès',type:'partiel',cat:'tech',min:50000,max:70000,dur:'3 mois',urgent:false,pay:'wave',desc:"Former 30 jeunes au numérique · Tablettes fournies."},
  ],
  tonPublic:[
    {id:'tp0',nom:'Tontine Liberté 6',cot:15000,m:8,max:12,freq:'mensuel',pot:120000},
    {id:'tp1',nom:'Femmes Entrepreneurs Dakar',cot:25000,m:10,max:15,freq:'mensuel',pot:250000},
    {id:'tp2',nom:'Solidaire GHP Bamako',cot:10000,m:6,max:20,freq:'mensuel',pot:60000},
  ],
  payLabels:{orange_money:'🟠 Orange Money',wave:'🌊 Wave',mtn:'🟡 MTN MoMo',especes:'💵 Espèces'},
  assTypes:{vie:{t:'Assurance Vie',r:0.02},sante:{t:'Santé',r:0.025},pro:{t:'Professionnelle',r:0.015},complete:{t:'Complète',r:0.035}},
};

// ═══ SIMULATEURS ════════════════════════════
const Sim = {
  pret(mnt,dur,tx=0.05,ap=0){
    const p=mnt-ap,mr=tx/12;
    const mens=mr===0?p/dur:(p*mr)/(1-Math.pow(1+mr,-dur));
    const tot=mens*dur,int=tot-p;
    const tab=[];let sol=p;
    for(let i=1;i<=dur;i++){const im=sol*mr,cm=mens-im;sol-=cm;tab.push({m:i,mens:Math.round(mens),int:Math.round(im),cap:Math.round(cm),sol:Math.round(Math.max(sol,0))})}
    return{mens:Math.round(mens),tot:Math.round(tot),int:Math.round(int),cap:Math.round(p),tab};
  },
  epg(cap,vers=0,dur=36,tx=0.03){
    const mr=tx/12;let s=cap;const ev=[{m:0,s:cap}];
    for(let i=1;i<=dur;i++){s=s*(1+mr)+vers;ev.push({m:i,s:Math.round(s)})}
    const tv=cap+vers*dur;
    return{fin:Math.round(s),vers:Math.round(tv),gain:Math.round(s-tv),ev};
  },
  ass(cap,tx=0.02,dur=3){
    const ann=cap*tx,mens=ann/12;
    return{ann:Math.round(ann),mens:Math.round(mens),tot:Math.round(ann*dur)};
  },
  inv(mnt,tx=0.07,dur=5){
    const fin=mnt*Math.pow(1+tx,dur),gain=fin-mnt;
    const dbl=Math.ceil(Math.log(2)/Math.log(1+tx));
    const ev=Array.from({length:dur+1},(_,i)=>({an:i,v:Math.round(mnt*Math.pow(1+tx,i))}));
    return{fin:Math.round(fin),gain:Math.round(gain),roi:((gain/mnt)*100).toFixed(1),dbl,ev};
  }
};

// ═══ CHARTS ══════════════════════════════════
const CH = {
  _i:{},
  defs:{
    pl:{legend:{display:false},tooltip:{backgroundColor:'#142018',titleColor:'#D4A017',bodyColor:'#8FA898',borderColor:'rgba(212,160,23,.2)',borderWidth:1,padding:10}},
    grid:{color:'rgba(255,255,255,.05)'},
    ticks:{color:'#4A5E4F',font:{family:'DM Sans',size:11}},
  },
  kill(id){if(this._i[id]){this._i[id].destroy();delete this._i[id]}},
  act(){
    this.kill('act');const ctx=document.getElementById('ch-act');if(!ctx)return;
    const txs=S.txs(),now=Date.now(),cnt=Array(7).fill(0);
    txs.forEach(t=>{const d=Math.floor((now-t.ts)/86400000);if(d<7)cnt[6-d]++});
    this._i.act=new Chart(ctx,{type:'bar',data:{labels:['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],datasets:[{data:cnt,backgroundColor:'rgba(212,160,23,.25)',borderColor:'#D4A017',borderWidth:2,borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:this.defs.pl,scales:{x:{grid:this.defs.grid,ticks:this.defs.ticks},y:{grid:this.defs.grid,ticks:{...this.defs.ticks,stepSize:1},beginAtZero:true}}}});
  },
  pret(cap,int){
    this.kill('pret');const ctx=document.getElementById('ch-pret');if(!ctx)return;
    this._i.pret=new Chart(ctx,{type:'doughnut',data:{labels:['Capital','Intérêts'],datasets:[{data:[cap,int],backgroundColor:['#0D6B4B','#D4A017'],borderColor:'#0C1510',borderWidth:3,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{...this.defs.pl,legend:{display:true,position:'bottom',labels:{color:'#8FA898',font:{family:'DM Sans',size:11},padding:12}}}}});
  },
  epg(ev){
    this.kill('epg');const ctx=document.getElementById('ch-epg');if(!ctx)return;
    const skip=Math.max(1,Math.floor(ev.length/12));const filt=ev.filter((_,i)=>i%skip===0||i===ev.length-1);
    this._i.epg=new Chart(ctx,{type:'line',data:{labels:filt.map(e=>e.m===0?'Départ':`M${e.m}`),datasets:[{data:filt.map(e=>e.s),borderColor:'#16A870',backgroundColor:'rgba(22,168,112,.1)',fill:true,tension:.4,pointRadius:0,pointHoverRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:this.defs.pl,scales:{x:{grid:this.defs.grid,ticks:this.defs.ticks},y:{grid:this.defs.grid,ticks:{...this.defs.ticks,callback:v=>(v/1000).toFixed(0)+'K'}}}}});
  },
  inv(ev){
    this.kill('inv');const ctx=document.getElementById('ch-inv');if(!ctx)return;
    this._i.inv=new Chart(ctx,{type:'line',data:{labels:ev.map(e=>`An ${e.an}`),datasets:[{data:ev.map(e=>e.v),borderColor:'#D4A017',backgroundColor:'rgba(212,160,23,.08)',fill:true,tension:.4,pointRadius:2,pointBackgroundColor:'#D4A017'},{data:Array(ev.length).fill(ev[0]?.v||0),borderColor:'rgba(255,255,255,.12)',borderDash:[4,4],pointRadius:0,fill:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:this.defs.pl,scales:{x:{grid:this.defs.grid,ticks:this.defs.ticks},y:{grid:this.defs.grid,ticks:{...this.defs.ticks,callback:v=>(v/1e6).toFixed(1)+'M'}}}}});
  },
  bc(){
    this.kill('bc');const ctx=document.getElementById('ch-bc');if(!ctx)return;
    const bl=S.blocks().slice(0,10).reverse();
    this._i.bc=new Chart(ctx,{type:'bar',data:{labels:bl.map(b=>`#${b.index}`),datasets:[{label:'Transactions',data:bl.map(b=>b.txCount||0),backgroundColor:'rgba(13,107,75,.35)',borderColor:'#16A870',borderWidth:2,borderRadius:4},{label:'Difficulté',data:bl.map(b=>b.diff||0),backgroundColor:'rgba(212,160,23,.18)',borderColor:'#D4A017',borderWidth:2,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{...this.defs.pl,legend:{display:true,position:'bottom',labels:{color:'#8FA898',font:{family:'DM Sans',size:11},padding:12}}},scales:{x:{grid:this.defs.grid,ticks:this.defs.ticks},y:{grid:this.defs.grid,ticks:{...this.defs.ticks,stepSize:1},beginAtZero:true}}}});
  }
};

// ═══ CALCULATEURS UI ════════════════════════
const Calc = {
  pret(){
    const mnt=parseFloat(document.getElementById('sp-mnt').value)||500000;
    const dur=parseInt(document.getElementById('sp-dur').value)||24;
    const tx=parseInt(document.getElementById('sp-tx').value)||5;
    const ap=parseFloat(document.getElementById('sp-ap').value)||0;
    document.getElementById('sp-dur-v').textContent=dur+' mois';
    document.getElementById('sp-tx-v').textContent=tx+'%';
    const r=Sim.pret(mnt,dur,tx/100,ap);
    document.getElementById('rp-mens').textContent=F.full(r.mens);
    document.getElementById('rp-tot').textContent=F.full(r.tot);
    document.getElementById('rp-int').textContent=F.full(r.int);
    document.getElementById('rp-cap').textContent=F.full(r.cap);
    // Table
    const tb=document.getElementById('amort-body');
    if(tb){tb.innerHTML=r.tab.slice(0,8).map(row=>`<tr><td>${row.m}</td><td>${F.full(row.mens)}</td><td class="c-em">${F.full(row.cap)}</td><td class="c-or">${F.full(row.int)}</td><td>${F.full(row.sol)}</td></tr>`).join('')}
    setTimeout(()=>CH.pret(r.cap,r.int),50);
  },
  epg(){
    const cap=parseFloat(document.getElementById('se-cap').value)||100000;
    const vers=parseFloat(document.getElementById('se-vers').value)||0;
    const dur=parseInt(document.getElementById('se-dur').value)||36;
    const tx=parseFloat(document.getElementById('se-type').value)||0.03;
    document.getElementById('se-dur-v').textContent=dur+' mois';
    const r=Sim.epg(cap,vers,dur,tx);
    document.getElementById('re-final').textContent=F.full(r.fin);
    document.getElementById('re-vers').textContent=F.full(r.vers);
    document.getElementById('re-gain').textContent='+'+F.full(r.gain);
    setTimeout(()=>CH.epg(r.ev),50);
  },
  ass(){
    const cap=parseFloat(document.getElementById('sa-cap').value)||2000000;
    const tx=parseFloat(document.getElementById('sa-type').value)||0.02;
    const dur=parseInt(document.getElementById('sa-dur').value)||3;
    document.getElementById('sa-dur-v').textContent=dur+' an'+(dur>1?'s':'');
    const r=Sim.ass(cap,tx,dur);
    document.getElementById('ra-ann').textContent=F.full(r.ann);
    document.getElementById('ra-mens').textContent=F.full(r.mens);
    document.getElementById('ra-tot').textContent=F.full(r.tot);
  },
  inv(){
    const mnt=parseFloat(document.getElementById('si-mnt').value)||1000000;
    const tx=parseFloat(document.getElementById('si-sec').value)||0.07;
    const dur=parseInt(document.getElementById('si-dur').value)||5;
    document.getElementById('si-dur-v').textContent=dur+' an'+(dur>1?'s':'');
    const r=Sim.inv(mnt,tx,dur);
    document.getElementById('ri-fin').textContent=F.full(r.fin);
    document.getElementById('ri-gain').textContent='+'+F.full(r.gain);
    document.getElementById('ri-roi').textContent=r.roi+'%';
    document.getElementById('ri-dbl').textContent='~'+r.dbl+' ans';
    setTimeout(()=>CH.inv(r.ev),50);
  },
  pretSim(){
    const mnt=parseFloat(document.getElementById('pret-mnt').value)||0;
    const dur=parseInt(document.getElementById('pret-dur').value)||12;
    document.getElementById('pret-dur-v').textContent=dur+' mois';
    const el=document.getElementById('pret-sim');
    if(!mnt||mnt<10000){el.style.display='none';return}
    const type=document.getElementById('pret-type').value;
    const tx=type==='urgent'?0.06:type==='tontine'?0.04:0.05;
    const r=Sim.pret(mnt,dur,tx,0);
    document.getElementById('sim-mens').textContent=F.full(r.mens);
    document.getElementById('sim-tot').textContent=F.full(r.tot);
    document.getElementById('sim-int').textContent=F.full(r.int);
    el.style.display='block';
  }
};

// ═══ BLOCKCHAIN ══════════════════════════════
const BC = {
  pendingTx:[],
  addTx(type,data){
    const id='TX-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    const tx={id,type,data,ts:Date.now(),hash:FIB.hash({type,data},31),status:'pending'};
    this.pendingTx.push(tx);return tx;
  },
  mine(){
    const bl=S.blocks();
    const prev=bl[0]||{index:0,hash:'0'.repeat(16)};
    const idx=prev.index+1,fi=Math.min(idx+10,78);
    const fibV=FIB.get(fi).toString(16).slice(0,20)+'…';
    const diff=FIB.diff(100,idx,5);
    const txs=this.pendingTx.splice(0,20);
    const block={index:idx,fi,fibV,prevHash:prev.hash,txCount:txs.length,ts:Date.now(),diff,hash:FIB.hash({idx,prevHash:prev.hash,txs,fibV},fi)};
    S.addBlock(block);
    const allTx=S.txs();
    txs.forEach(t=>{t.status='confirmed';t.blockIndex=idx;allTx.unshift(t)});
    S.set('txs',allTx.slice(0,200));
    return block;
  },
  stats(){const bl=S.blocks();return{blocs:bl.length,txs:S.txs().length,diff:bl.length>0?FIB.diff(100,bl.length+5,30):3}},
  calcFib(){
    const n=parseInt(document.getElementById('fib-n').value)||20;
    const safe=Math.min(n,78);const val=FIB.get(safe);
    const h=FIB.hash({n:safe,val:val.toString()},safe);
    const el=document.getElementById('fib-res');
    el.style.display='block';
    el.innerHTML=`F(${safe}) = ${val.toString().slice(0,40)}${val.toString().length>40?'…':''}<br>φ = ${FIB.PHI}<br>e = ${FIB.E}<br>e^(iπ)+1 = 0.000000<br>H = SHA3⊕F(n) → ${h}`;
  }
};

// ═══ UI HELPERS ══════════════════════════════
const UI = {
  tab(grp,i,el){
    const tabs=document.querySelectorAll(`#${grp}-tabs .tab`);
    const conts=document.querySelectorAll(`[id^="${grp}-t"]`);
    tabs.forEach(t=>t.classList.remove('act'));
    conts.forEach((c,j)=>c.classList.toggle('act',j===i));
    el.classList.add('act');
  },
  filterTx(type,el){
    document.querySelectorAll('#sc-wallet .chip').forEach(c=>c.classList.remove('act'));
    el.classList.add('act');
    const txs=S.txs();
    const filt=type==='all'?txs:txs.filter(t=>t.type===type||t.type.startsWith(type));
    document.getElementById('w-txlist').innerHTML=filt.length?filt.map(t=>UI.txRow(t)).join(''):'<div class="tac p16 c-md sm">Aucune transaction</div>';
  },
  txRow(t){
    const icons={depot:'💚',retrait:'🔴',transfert:'💙',pret_debloque:'💰',remboursement:'✅',formation:'🎓',candidature:'💼'};
    const ico=icons[t.type]||'📝';
    const plus=t.type==='depot'||t.type==='pret_debloque';
    const sign=plus?'+':'-';
    const col=plus?'c-green':'c-red';
    return `<div class="tx-r"><div class="tx-ico" style="background:rgba(255,255,255,.05)">${ico}</div><div class="grow"><div class="sm semi">${t.label||t.type}</div><div class="tx-dt">${F.date(t.ts)}${t.blockIndex?` · Bloc #${t.blockIndex}`:''}</div></div><div class="tar"><div class="tx-amt ${col}">${sign}${F.fcfa(t.amount)}</div><div class="xs c-dim">${t.canal||''}</div></div></div>`;
  },
  filtFmt(cat,el){
    document.querySelectorAll('#sc-hopeskills .chip').forEach(c=>c.classList.remove('act'));el.classList.add('act');
    const list=cat==='all'?D.formations:D.formations.filter(f=>f.cat===cat);
    document.getElementById('fmt-grid').innerHTML=list.length?list.map(f=>UI.fmtCard(f)).join(''):'<div class="c-md sm tac p16" style="grid-column:1/-1">Aucune formation dans cette catégorie</div>';
  },
  fmtCard(f){
    const user=S.user();const done=(user?.formations||[]).includes(f.id);
    const lvlCls={debutant:'lv-deb',intermediaire:'lv-int',avance:'lv-av'}[f.level]||'lv-deb';
    const lvlTxt={debutant:'Débutant',intermediaire:'Intermédiaire',avance:'Avancé'}[f.level]||f.level;
    return`<div class="fmt-card" onclick="Act.inscrireFormation('${f.id}')"><div class="fmt-lvl ${lvlCls}">${lvlTxt}</div><div style="font-size:1.6rem;margin-bottom:8px">${f.ico}</div><div class="syne semi c-hi mb4" style="padding-right:70px">${f.title}</div><div class="flex g8 center mb4"><span class="xs c-md">⏱ ${f.dur} min</span><span class="badge b-or xs">+${f.pts} pts</span>${done?'<span class="badge b-em xs">✓ Terminé</span>':''}</div>${f.cert?'<div class="xs c-em mt4">🏅 Badge blockchain Polygon</div>':''}<div class="fmt-chips">${f.modules.map(m=>`<span class="fmt-chip">${m}</span>`).join('')}</div></div>`;
  },
  filtJob(type,el){
    document.querySelectorAll('#sc-hopework .chip').forEach(c=>c.classList.remove('act'));el.classList.add('act');
    const list=type==='all'?D.offres:D.offres.filter(j=>j.type===type||j.cat===type);
    document.getElementById('job-grid').innerHTML=list.length?list.map(j=>UI.jobCard(j)).join(''):'<div class="c-md sm tac p16" style="grid-column:1/-1">Aucune offre</div>';
  },
  jobCard(j){
    return`<div class="job-card rel" onclick="Act.postuler('${j.id}')"><div class="flex between center mb8"><div class="syne semi c-hi sm">${j.title}</div>${j.urgent?'<span class="badge b-red xs">🚨 URGENT</span>':''}</div><div class="xs c-md mb8">${j.co} · ${j.ville}</div><div class="xs c-dim mb8">${j.desc}</div><div class="flex between center"><div><div class="sm bold c-hi">${F.fcfa(j.min)} – ${F.fcfa(j.max)}</div><div class="xs c-dim">${j.dur} · ${{freelance:'Freelance',cdi:'CDI',cdd:'CDD',partiel:'Temps partiel',projet:'Projet'}[j.type]||j.type}</div></div><span class="job-pay">${D.payLabels[j.pay]||j.pay}</span></div></div>`;
  },
  selPretType(type,el){
    document.querySelectorAll('#hf-t0 .card').forEach(c=>c.style.borderColor='');
    el.style.borderColor='var(--or)';
    document.getElementById('pret-type').value=type;
    UI.tab('hf',1,document.querySelectorAll('#hf-tabs .tab')[1]);
  },
  renderTons(){
    const myTons=S.tontines();
    const el=document.getElementById('ton-list');
    el.innerHTML=myTons.length?myTons.map(t=>`<div class="ton-card"><div class="flex between center mb8"><div class="syne semi">${t.nom}</div><span class="badge b-em">${t.freq||'mensuel'}</span></div><div class="xs c-md mb4">Cotisation: <b class="c-or">${F.full(t.cotis)}</b></div><div class="xs c-md mb4">Membres: <b class="c-hi">${t.membres||1}/${t.max||12}</b></div><div class="xs c-md mb8">Pot actuel: <b class="c-em">${F.full((t.cotis||0)*(t.membres||1))}</b></div><div class="ton-avs">${Array.from({length:Math.min(t.membres||1,5)},(_,i)=>`<div class="ton-av">${['M','F','K','A','B'][i]}</div>`).join('')}</div><div class="div"></div><button class="btn btn-em btn-sm w100 mt8" onclick="event.stopPropagation();App.toast('Paiement tontine envoyé!','ok')">💰 Payer ma cotisation</button></div>`).join(''):'<div class="c-md sm tac p16" style="grid-column:1/-1">Créez ou rejoignez une tontine GHP !</div>';
    // Public
    document.getElementById('ton-pub').innerHTML=D.tonPublic.map(t=>`<div class="card card-dk mb8" style="cursor:pointer" onclick="Act.rejoindreTontine('${t.id}')"><div class="flex between center"><div><div class="semi">${t.nom}</div><div class="xs c-md mt4">Cotisation : ${F.full(t.cotis)} · ${t.m}/${t.max} membres</div><div class="xs c-md mt2">Pot : ${F.full(t.pot)}</div></div><button class="btn btn-em btn-sm">Rejoindre</button></div></div>`).join('');
  },
  renderPrets(){
    const prets=S.prets();
    document.getElementById('mes-prets').innerHTML=prets.length?prets.map(p=>{
      const r=Sim.pret(p.mnt,p.dur,p.tx,0);
      const prog=Math.min(100,Math.round(((p.paye||0)/r.tab.length)*100));
      return`<div class="card mb8"><div class="flex between center mb8"><div class="syne semi">${{micro_credit:'⚡ Micro-crédit',developpement:'📈 Développement',tontine:'👥 Tontine',urgent:'🚨 Urgent'}[p.type]||p.type}</div><span class="badge ${p.statut==='actif'?'b-em':'b-dim'}">${p.statut}</span></div><div class="flex between mb8"><span class="xs c-md">Montant</span><b class="c-or">${F.full(p.mnt)}</b></div><div class="flex between mb8"><span class="xs c-md">Mensualité</span><b class="c-hi">${F.full(r.mens)}</b></div><div class="flex between mb8"><span class="xs c-md">Durée</span><b>${p.dur} mois</b></div><div class="prog mb4"><div class="prog-f prog-em" style="width:${prog}%"></div></div><div class="flex between xs c-dim"><span>Remboursé ${prog}%</span><span>${p.paye||0}/${r.tab.length} échéances</span></div><button class="btn btn-em btn-sm w100 mt8" onclick="Act.rembourser('${p.id}')">✅ Rembourser une échéance</button></div>`;
    }).join(''):`<div class="card card-dk tac p20"><div style="font-size:2rem;margin-bottom:8px">📋</div><div class="semi c-md">Aucun prêt actif</div></div>`;
  },
  renderBlocks(){
    const bl=S.blocks().slice(0,6);
    document.getElementById('bl-list').innerHTML=bl.length?bl.map(b=>`<div class="bl-card"><div class="flex between center"><div class="syne bold c-or">#${b.index}</div><div class="xs c-md">${F.date(b.ts)}</div></div><div class="flex between mt4"><span class="xs c-md">Fibonacci F(${b.fi}) = ${b.fibV}</span><span class="badge b-em xs">diff:${b.diff}</span></div><div class="flex between mt4"><span class="xs c-md">${b.txCount} tx · vel:${b.vel||'—'}</span><span class="xs c-dim">${b.prevHash?.slice(0,12)}…</span></div><div class="bl-hash">${b.hash}</div></div>`).join(''):'<div class="c-dim sm tac p12">Aucun bloc. Minez le premier !</div>';
  },
  renderNotifs(){
    const ns=S.notifs();
    document.getElementById('notif-list').innerHTML=ns.length?ns.map(n=>`<div class="tx-r"><div class="tx-ico" style="background:rgba(255,255,255,.05)">${n.ico||'📢'}</div><div class="grow"><div class="sm semi">${n.msg}</div><div class="tx-dt">${F.date(n.ts)}</div></div></div>`).join(''):'<div class="tac p20 c-md">Aucune notification</div>';
  },
  updateScoreUI(score){
    const tier=FIB.tier(score);
    // Top nav ring
    const pct=score/100;
    const circ=62.8;
    const el=document.getElementById('tn-ring');
    if(el)el.style.strokeDashoffset=circ-(circ*pct);
    const sn=document.getElementById('tn-score-n');if(sn)sn.textContent=score;
    const st=document.getElementById('tn-tier');if(st)st.textContent=tier.t;
    // Dashboard ring
    const dr=document.getElementById('dash-ring');
    if(dr){const c=188.5;dr.style.strokeDashoffset=c-(c*pct)}
    const dn=document.getElementById('dash-score-n');if(dn)dn.textContent=score;
    // HopeFund
    const hfp=document.getElementById('hf-prog');if(hfp)hfp.style.width=score+'%';
    const hfs=document.getElementById('hf-score');if(hfs)hfs.textContent=score;
    const hft=document.getElementById('hf-tier');if(hft){hft.textContent=tier.t;hft.className='badge '+tier.cls}
    const hfpl=document.getElementById('hf-plaf');if(hfpl)hfpl.textContent=F.full(tier.max);
    // Profil
    const ps=document.getElementById('pf-score');if(ps)ps.textContent=score;
    const pb=document.getElementById('pf-prog');if(pb)pb.style.width=score+'%';
    const pt=document.getElementById('pf-tier');if(pt){pt.textContent=tier.t;pt.className='badge '+tier.cls}
    const pt2=document.getElementById('pf-tier2');if(pt2){pt2.textContent=tier.t;pt2.className='badge '+tier.cls}
    const dtt=document.getElementById('dash-tier-txt');if(dtt){dtt.textContent=tier.t;dtt.className='syne bold c-'+(score>=80?'or':score>=60?'amber':score>=40?'em':'dim')}
  },
  updateBalUI(u){
    const sets={
      'dash-bal':F.full(u.solde||0).replace(' FCFA',''),
      'w-bal':F.full(u.solde||0).replace(' FCFA',''),
      'dash-epg':F.fcfa(u.epargne||0),'st-epg':F.fcfa(u.epargne||0),
      'st-solde':F.fcfa(u.solde||0),'st-fmt':(u.formations||[]).length,'st-mss':u.missions||0,
      'w-om':F.fcfa(u.om||0),'w-wave':F.fcfa(u.wave||0),'w-mtn':F.fcfa(u.mtn||0),
      'dash-pret':S.prets().filter(p=>p.statut==='actif').length?F.fcfa(S.prets().find(p=>p.statut==='actif')?.mnt):'—',
    };
    Object.entries(sets).forEach(([id,val])=>{const el=document.getElementById(id);if(el)el.textContent=val});
  },
  updateUserUI(u){
    if(!u)return;
    const initials=(u.prenom||'?')[0]+(u.nom||'')[0]||'?';
    ['topnav-ava','pf-ava'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=initials.toUpperCase()});
    const sets={'dash-name':`${u.prenom||''} ${u.nom||''}`.trim()||'Bienvenue','pf-name':`${u.prenom||''} ${u.nom||''}`.trim(),'pf-ville':u.ville||'Sénégal','pf-phone':u.phone||'—','pf-nrg':FIB.energy(u.score||0).toFixed(3),'pf-fmts':(u.formations||[]).length};
    Object.entries(sets).forEach(([id,val])=>{const el=document.getElementById(id);if(el)el.textContent=val});
    const tiniEl=document.getElementById('pf-tini-id');
    if(tiniEl&&u.tini)tiniEl.textContent=u.tini.id;
    const mathEl=document.getElementById('pf-math');
    if(mathEl&&u.tini)mathEl.textContent=`n=${u.tini.fib_n} m=${u.tini.fib_m} · k1=${u.tini.k1} k2=${u.tini.k2} · K_fib=${u.tini.k_fib} · E=${u.tini.energy}`;
    // MM list
    const mmEl=document.getElementById('w-mm-list');
    if(mmEl)mmEl.innerHTML=[
      {ico:'🟠',lbl:'Orange Money',key:'om',col:'c-or'},{ico:'🌊',lbl:'Wave',key:'wave',col:'c-em'},{ico:'🟡',lbl:'MTN MoMo',key:'mtn',col:'c-amber'}
    ].map(m=>`<div class="flex center between py8" style="border-bottom:1px solid rgba(255,255,255,.05)"><div class="flex center g12"><div style="width:40px;height:40px;background:rgba(255,255,255,.07);border-radius:var(--r12);display:flex;align-items:center;justify-content:center;font-size:1.2rem">${m.ico}</div><div><div class="semi">${m.lbl}</div><div class="xs c-md">${u.phone||'Non configuré'}</div></div></div><div class="syne bold ${m.col}">${F.fcfa(u[m.key]||0)}</div></div>`).join('');
    this.updateScoreUI(u.score||0);
    this.updateBalUI(u);
  }
};

// ═══ ACTIONS ════════════════════════════════
const Act = {
  creerCompte(){
    const prenom=document.getElementById('ins-prenom').value.trim();
    const nom=document.getElementById('ins-nom').value.trim();
    const phone=document.getElementById('ins-phone').value.trim();
    const ville=document.getElementById('ins-ville').value;
    const type=document.getElementById('ins-type').value;
    const depot=parseFloat(document.getElementById('ins-depot').value)||0;
    const pin=document.getElementById('ins-pin').value;
    if(!prenom||!nom||!phone){App.toast('Remplissez prénom, nom et téléphone','err');return}
    if(pin.length<4){App.toast('Code d\'accès minimum 4 chiffres','err');return}
    const score=FIB.calcScore({prenom,nom,phone,ville,depot});
    const tini=FIB.genTINI(prenom,nom,phone,score);
    const user={prenom,nom,phone,ville,type,score,tini,solde:depot,om:depot,wave:0,mtn:0,epargne:0,formations:[],missions:0,prets_ok:0,created:Date.now()};
    S.setUser(user);
    // Tx dépôt initial
    if(depot>0){
      const tx={id:'TX-'+Date.now().toString(36).toUpperCase(),type:'depot',label:'Dépôt initial',amount:depot,canal:'orange_money',ts:Date.now(),hash:FIB.hash({depot,tini:tini.id},25),status:'confirmed'};
      S.addTx(tx);BC.pendingTx.push(tx);
    }
    // Genesis block si vide
    if(S.blocks().length===0){
      const genesis={index:0,fi:0,fibV:'0',prevHash:'0'.repeat(16),txCount:0,ts:Date.now(),diff:1,hash:FIB.hash({genesis:true,motto:'Finance Ethnique & Solidaire GHP',ts:Date.now()},1)};
      S.addBlock(genesis);
    }
    BC.mine();
    S.addNotif({ico:'🎉',msg:`Bienvenue ${prenom} ! Votre identité TINI est générée.`,ts:Date.now()});
    App.closeMod('mod-ins');
    UI.updateUserUI(user);
    App.nav('dashboard');
    setTimeout(()=>App.toast(`🎉 Bienvenue ${prenom} ! Score: ${score}/100 · Tier: ${FIB.tier(score).t}`,'ok'),400);
  },
  connecter(){
    const phone=document.getElementById('conn-phone').value.trim();
    const pin=document.getElementById('conn-pin').value;
    const u=S.user();
    if(!u){App.toast('Aucun compte trouvé. Créez-en un !','err');return}
    if(!phone&&!pin){App.toast('Entrez votre téléphone et code','err');return}
    App.closeMod('mod-conn');
    UI.updateUserUI(u);App.nav('dashboard');
    App.toast(`Connecté · ${u.prenom} ${u.nom}`,'ok');
  },
  depot(){
    const u=S.user();if(!u){App.toast('Connectez-vous d\'abord','err');return}
    const mnt=parseFloat(document.getElementById('dep-mnt').value)||0;
    const canal=document.getElementById('dep-canal').value;
    if(mnt<100){App.toast('Minimum 100 FCFA','err');return}
    u.solde=(u.solde||0)+mnt;u.om=(u.om||0)+(canal==='orange_money'?mnt:0);u.wave=(u.wave||0)+(canal==='wave'?mnt:0);u.mtn=(u.mtn||0)+(canal==='mtn'?mnt:0);
    if(mnt>=10000&&(u.score||0)<100){u.score=Math.min(100,(u.score||0)+5)}
    S.setUser(u);
    const tx={id:'TX-'+Date.now().toString(36).toUpperCase(),type:'depot',label:`Dépôt ${D.payLabels[canal]||canal}`,amount:mnt,canal:D.payLabels[canal]||canal,ts:Date.now(),hash:FIB.hash({mnt,canal},22),status:'confirmed'};
    S.addTx(tx);BC.pendingTx.push(tx);
    S.addNotif({ico:'💚',msg:`Dépôt de ${F.full(mnt)} reçu via ${D.payLabels[canal]||canal}`,ts:Date.now()});
    App.closeMod('mod-depot');UI.updateUserUI(u);
    App.toast(`💚 Dépôt de ${F.full(mnt)} confirmé !`,'ok');
  },
  retrait(){
    const u=S.user();if(!u){App.toast('Connectez-vous d\'abord','err');return}
    const mnt=parseFloat(document.getElementById('ret-mnt').value)||0;
    const num=document.getElementById('ret-num').value.trim();
    const canal=document.getElementById('ret-canal').value;
    if(mnt<500){App.toast('Minimum 500 FCFA','err');return}
    if(!num){App.toast('Entrez le numéro destinataire','err');return}
    if(mnt>(u.solde||0)){App.toast('Solde insuffisant','err');return}
    u.solde=(u.solde||0)-mnt;if(canal==='orange_money')u.om=Math.max(0,(u.om||0)-mnt);else if(canal==='wave')u.wave=Math.max(0,(u.wave||0)-mnt);else u.mtn=Math.max(0,(u.mtn||0)-mnt);
    S.setUser(u);
    const tx={id:'TX-'+Date.now().toString(36).toUpperCase(),type:'retrait',label:`Retrait → ${num}`,amount:mnt,canal:D.payLabels[canal]||canal,ts:Date.now(),hash:FIB.hash({mnt,num,canal},23),status:'confirmed'};
    S.addTx(tx);BC.pendingTx.push(tx);
    App.closeMod('mod-retrait');UI.updateUserUI(u);
    App.toast(`🔴 Retrait de ${F.full(mnt)} vers ${num}`,'ok');
  },
  transfert(){
    const u=S.user();if(!u){App.toast('Connectez-vous d\'abord','err');return}
    const dest=document.getElementById('trf-dest').value.trim();
    const mnt=parseFloat(document.getElementById('trf-mnt').value)||0;
    const msg=document.getElementById('trf-msg').value.trim();
    if(!dest){App.toast('Entrez le destinataire','err');return}
    if(mnt<100){App.toast('Minimum 100 FCFA','err');return}
    if(mnt>(u.solde||0)){App.toast('Solde insuffisant','err');return}
    u.solde=(u.solde||0)-mnt;S.setUser(u);
    const tx={id:'TX-'+Date.now().toString(36).toUpperCase(),type:'transfert',label:`Transfert → ${dest}${msg?' · '+msg:''}`,amount:mnt,ts:Date.now(),hash:FIB.hash({mnt,dest,msg},27),status:'confirmed'};
    S.addTx(tx);BC.pendingTx.push(tx);
    S.addNotif({ico:'💙',msg:`Transfert de ${F.full(mnt)} vers ${dest}`,ts:Date.now()});
    App.closeMod('mod-trf');UI.updateUserUI(u);
    App.toast(`💙 Transfert de ${F.full(mnt)} envoyé !`,'ok');
  },
  demanderPret(){
    const u=S.user();if(!u){App.toast('Connectez-vous d\'abord','err');return}
    const score=u.score||0;if(score<40){App.toast('Score minimum 40 requis pour emprunter','err');return}
    const mnt=parseFloat(document.getElementById('pret-mnt').value)||0;
    const dur=parseInt(document.getElementById('pret-dur').value)||12;
    const type=document.getElementById('pret-type').value;
    const obj=document.getElementById('pret-obj').value.trim();
    const tier=FIB.tier(score);
    if(!mnt||mnt<10000){App.toast('Montant minimum 10 000 FCFA','err');return}
    if(mnt>tier.max){App.toast(`Votre tier ${tier.t} limite à ${F.full(tier.max)}. Améliorez votre HopeScore !`,'err');return}
    const tx=0.05;const r=Sim.pret(mnt,dur,tx,0);
    const pret={id:'PRET-'+Date.now().toString(36).toUpperCase(),type,mnt,dur,tx,obj,statut:'actif',paye:0,created:Date.now(),r};
    S.addPret(pret);u.solde=(u.solde||0)+mnt;u.score=Math.min(100,(u.score||0)+10);S.setUser(u);
    const txObj={id:'TX-'+Date.now().toString(36).toUpperCase(),type:'pret_debloque',label:`Prêt ${type} débloqué`,amount:mnt,ts:Date.now(),hash:FIB.hash({pret},29),status:'confirmed'};
    S.addTx(txObj);BC.mine();
    S.addNotif({ico:'💰',msg:`Prêt de ${F.full(mnt)} approuvé ! Score +10pts`,ts:Date.now()});
    App.closeMod('mod-depot');App.closeMod('mod-ins');
    UI.updateUserUI(u);UI.renderPrets();
    App.toast(`💰 Prêt de ${F.full(mnt)} débloqué ! Mensualité: ${F.full(r.mens)}. Score: ${u.score}/100`,'ok');
  },
  rembourser(id){
    const u=S.user();if(!u)return;
    const prets=S.prets();const p=prets.find(x=>x.id===id);if(!p)return;
    const r=Sim.pret(p.mnt,p.dur,p.tx,0);
    const mens=r.mens;if(mens>(u.solde||0)){App.toast('Solde insuffisant pour rembourser','err');return}
    p.paye=(p.paye||0)+1;if(p.paye>=p.dur)p.statut='remboursé';
    S.set('prets',prets);u.solde=(u.solde||0)-mens;u.score=Math.min(100,(u.score||0)+2);S.setUser(u);
    const tx={id:'TX-'+Date.now().toString(36).toUpperCase(),type:'remboursement',label:`Remboursement prêt #${p.paye}/${p.dur}`,amount:mens,ts:Date.now(),hash:FIB.hash({p,mens},21),status:'confirmed'};
    S.addTx(tx);BC.pendingTx.push(tx);
    UI.updateUserUI(u);UI.renderPrets();
    App.toast(`✅ Échéance ${p.paye}/${p.dur} remboursée. Score +2pts !`,'ok');
  },
  inscrireFormation(id){
    const u=S.user();if(!u){App.openMod('mod-ins');return}
    const f=D.formations.find(x=>x.id===id);if(!f)return;
    if((u.formations||[]).includes(id)){
      // Déjà inscrit — terminer
      App.toast(`🎓 Formation "${f.title}" déjà complétée !`,'info');return;
    }
    u.formations=[...(u.formations||[]),id];u.score=Math.min(100,(u.score||0)+f.pts);S.setUser(u);
    const tx={id:'TX-'+Date.now().toString(36).toUpperCase(),type:'formation',label:`Formation "${f.title}" certifiée`,amount:0,ts:Date.now(),hash:FIB.hash({id,f,ts:Date.now()},f.pts),status:'confirmed'};
    S.addTx(tx);BC.pendingTx.push(tx);
    S.addNotif({ico:'🎓',msg:`Formation "${f.title}" terminée ! +${f.pts} pts`,ts:Date.now()});
    UI.updateUserUI(u);UI.filtFmt('all',document.querySelector('#sc-hopeskills .chip'));
    App.toast(`🎓 "${f.title}" certifiée ! +${f.pts} pts · Score: ${u.score}/100`,'ok');
  },
  postuler(id){
    const u=S.user();if(!u){App.openMod('mod-ins');return}
    const j=D.offres.find(x=>x.id===id);if(!j)return;
    u.score=Math.min(100,(u.score||0)+3);u.missions=(u.missions||0)+1;S.setUser(u);
    S.addNotif({ico:'💼',msg:`Candidature envoyée : ${j.title} chez ${j.co}`,ts:Date.now()});
    UI.updateUserUI(u);
    App.toast(`💼 Candidature envoyée pour "${j.title}" ! +3 pts`,'ok');
  },
  creerTontine(){
    const u=S.user();if(!u){App.openMod('mod-ins');return}
    const nom=document.getElementById('ton-nom').value.trim();
    const cotis=parseFloat(document.getElementById('ton-cot').value)||0;
    const max=parseInt(document.getElementById('ton-max').value)||12;
    const freq=document.getElementById('ton-freq').value;
    if(!nom||!cotis){App.toast('Nom et cotisation requis','err');return}
    const t={id:'TON-'+Date.now().toString(36).toUpperCase(),nom,cotis,max,freq,membres:1,created:Date.now()};
    S.addTontine(t);
    App.closeMod('mod-ton-cre');UI.renderTons();
    App.toast(`👥 Tontine "${nom}" créée ! Code: ${t.id.slice(-6)}`,'ok');
  },
  rejoindreTontine(id){
    App.toast('👥 Demande envoyée ! L\'admin de la tontine vous contactera.','info');
    S.addNotif({ico:'👥',msg:`Demande de rejoindre la tontine envoyée`,ts:Date.now()});
  },
  ouvrirEpargne(){
    const u=S.user();if(!u){App.openMod('mod-ins');return}
    const mnt=parseFloat(document.getElementById('epg-mnt').value)||0;
    const type=document.getElementById('epg-type-v').value;
    if(mnt<1000){App.toast('Minimum 1 000 FCFA','err');return}
    if(mnt>(u.solde||0)){App.toast('Solde insuffisant','err');return}
    u.solde=(u.solde||0)-mnt;u.epargne=(u.epargne||0)+mnt;S.setUser(u);
    const tx={id:'TX-'+Date.now().toString(36).toUpperCase(),type:'depot',label:`Épargne ${type} ouverte`,amount:mnt,ts:Date.now(),hash:FIB.hash({mnt,type},18),status:'confirmed'};
    S.addTx(tx);BC.pendingTx.push(tx);
    S.addEpg({id:'EPG-'+Date.now().toString(36).toUpperCase(),type,mnt,created:Date.now()});
    App.closeMod('mod-epg');UI.updateUserUI(u);
    App.toast(`🌱 Épargne ${type} de ${F.full(mnt)} ouverte !`,'ok');
  },
  simAss(){
    const cap=parseFloat(document.getElementById('ass-cap').value)||0;
    const type=document.getElementById('ass-type-v')?.value||'vie';
    const typeDef=D.assTypes[type]||D.assTypes.vie;
    if(!cap){document.getElementById('ass-sim-res').innerHTML='<div class="xs c-md">Entrez le capital pour simuler</div>';return}
    const r=Sim.ass(cap,typeDef.r,3);
    document.getElementById('ass-sim-res').innerHTML=`<div class="flex between mb8"><span class="sm c-md">Prime annuelle</span><b class="c-or">${F.full(r.ann)}</b></div><div class="flex between"><span class="sm c-md">Prime mensuelle</span><b class="c-hi">${F.full(r.mens)}</b></div>`;
  },
  souscrireAss(){
    const u=S.user();if(!u){App.openMod('mod-ins');return}
    const cap=parseFloat(document.getElementById('ass-cap').value)||0;
    const typev=document.getElementById('ass-type-v').value;
    if(cap<100000){App.toast('Capital minimum 100 000 FCFA','err');return}
    const typeDef=D.assTypes[typev]||D.assTypes.vie;
    const r=Sim.ass(cap,typeDef.r,3);
    S.addAss({id:'ASS-'+Date.now().toString(36).toUpperCase(),type:typev,label:typeDef.t,cap,taux:typeDef.r,prime_ann:r.ann,prime_mens:r.mens,created:Date.now(),statut:'active'});
    App.closeMod('mod-ass');
    App.toast(`🛡️ ${typeDef.t} souscrite ! Prime : ${F.full(r.mens)}/mois`,'ok');
  },
  publierOffre(){
    const titre=document.getElementById('rec-titre').value.trim();
    const desc=document.getElementById('rec-desc').value.trim();
    if(!titre){App.toast('Titre requis','err');return}
    App.closeMod('mod-recruter');
    App.toast(`📢 Offre "${titre}" publiée ! Visible par les membres GHP.`,'ok');
  },
  logout(){
    if(confirm('Se déconnecter de CAFÉS-FINANCE ?')){
      App.nav('dashboard');
      setTimeout(()=>App.openMod('mod-conn'),300);
      App.toast('Déconnecté','info');
    }
  },
  copyTINI(){
    const u=S.user();if(!u||!u.tini)return;
    navigator.clipboard.writeText(u.tini.id).then(()=>App.toast('✅ ID TINI copié !','ok')).catch(()=>App.toast(u.tini.id,'info'));
  },
  exportData(){
    const u=S.user();if(!u)return;
    const data=JSON.stringify({user:u,txs:S.txs(),prets:S.prets(),tontines:S.tontines(),blocks:S.blocks()},null,2);
    const blob=new Blob([data],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`CAFES_FINANCE_${u.tini?.id||'export'}.json`;a.click();
    URL.revokeObjectURL(url);App.toast('📤 Données exportées','ok');
  },
  resetApp(){
    if(confirm('⚠️ Effacer TOUTES les données locales ? Irréversible.')){
      ['user','txs','blocks','prets','tontines','notifs','epargnes','assurances'].forEach(k=>S.del(k));
      location.reload();
    }
  }
};

// ═══ APP CORE ════════════════════════════════
const App = {
  curSc:'dashboard',
  init(){
    // SW
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('./sw.js')
        .then(r=>console.log('[TINI] SW enregistré ✓',r.scope))
        .catch(e=>console.warn('[TINI] SW erreur:',e));
    }
  },
  start(){
    document.getElementById('ob-ov').style.display='none';
    setTimeout(()=>document.getElementById('load-ov').classList.add('hide'),600);
    const u=S.user();
    if(!u){setTimeout(()=>this.openMod('mod-ins'),700);return}
    UI.updateUserUI(u);
    // Init genesis if needed
    if(S.blocks().length===0){const g={index:0,fi:0,fibV:'0',prevHash:'0'.repeat(16),txCount:0,ts:Date.now(),diff:1,hash:FIB.hash({genesis:true},1)};S.addBlock(g)}
    this.nav('dashboard');
  },
  nav(sc){
    this.curSc=sc;
    document.querySelectorAll('.sc').forEach(s=>s.classList.remove('act'));
    const el=document.getElementById('sc-'+sc);if(el)el.classList.add('act');
    document.querySelectorAll('[data-sc]').forEach(n=>n.classList.toggle('act',n.dataset.sc===sc));
    this.closeSidebarFull();this.render(sc);
  },
  render(sc){
    const u=S.user();if(!u&&sc!=='dashboard')return;
    switch(sc){
      case'dashboard':
        if(u){UI.updateUserUI(u);document.getElementById('dash-txlist').innerHTML=S.txs().slice(0,5).map(t=>UI.txRow(t)).join('')||'<div class="tac p16 c-md sm">Aucune transaction</div>'}
        setTimeout(()=>CH.act(),100);break;
      case'wallet':
        if(u)UI.updateUserUI(u);
        document.getElementById('w-txlist').innerHTML=S.txs().slice(0,20).map(t=>UI.txRow(t)).join('')||'<div class="tac p16 c-md sm">Aucune transaction</div>';break;
      case'hopeskills':UI.filtFmt('all',document.querySelector('#sc-hopeskills .chip'));break;
      case'hopework':UI.filtJob('all',document.querySelector('#sc-hopework .chip'));break;
      case'tontines':UI.renderTons();break;
      case'hopefund':if(u){UI.updateScoreUI(u.score||0);UI.renderPrets()}break;
      case'blockchain':
        const st=BC.stats();
        ['bc-blocs','bc-txs','bc-diff'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=[st.blocs,st.txs,st.diff][i]});
        UI.renderBlocks();setTimeout(()=>CH.bc(),100);break;
      case'profil':if(u)UI.updateUserUI(u);break;
      case'simulateurs':setTimeout(()=>{Calc.pret();Calc.epg();Calc.ass();Calc.inv()},150);break;
      case'epargne':
        const epgs=S.epargnes();const assEl=document.getElementById('epg-status');
        if(assEl)assEl.innerHTML=epgs.length?epgs.map(e=>`<div class="flex between center py8" style="border-bottom:1px solid rgba(255,255,255,.05)"><div><div class="semi">${{standard:'🌱 Standard',solidaire:'💚 Solidaire',tontine:'👥 Tontine GHP'}[e.type]||e.type}</div><div class="xs c-md mt4">${F.date(e.created)}</div></div><div class="syne bold c-em">${F.full(e.mnt)}</div></div>`).join(''):'<div class="tac p20 c-md sm">🌱 Ouvrez votre premier compte épargne</div>';break;
      case'assurance':
        const assList=S.assurances();const el=document.getElementById('ass-list');
        if(el)el.innerHTML=assList.length?assList.map(a=>`<div class="flex between center py8" style="border-bottom:1px solid rgba(255,255,255,.05)"><div><div class="semi">{${D.assTypes[a.type]?.t||a.type}</div><div class="xs c-md">Capital: ${F.full(a.cap)} · Prime: ${F.full(a.prime_mens)}/mois</div></div><span class="badge b-em">Active</span></div>`).join(''):'<div class="tac p16 c-dim sm">Aucune assurance souscrite</div>';break;
    }
  },
  openMod(id,param){
    if(!S.user()&&!['mod-ins','mod-conn'].includes(id)){this.openMod('mod-ins');return}
    const m=document.getElementById(id);if(!m)return;m.classList.add('open');
    // Special param handling
    if(id==='mod-epg'&&param){document.getElementById('mod-epg-t').textContent=`🌱 Épargne ${param}`;document.getElementById('epg-type-v').value=param}
    if(id==='mod-ass'&&param){const def=D.assTypes[param];if(def){document.getElementById('mod-ass-t').textContent=`🛡️ ${def.t}`;document.getElementById('ass-type-v').value=param}}
    if(id==='mod-retrait'&&S.user()){const el=document.getElementById('ret-solde-d');if(el)el.textContent=F.fcfa(S.user().solde||0)}
  },
  closeMod(id){const m=document.getElementById(id);if(m)m.classList.remove('open')},
  toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('sb-ov').classList.toggle('show')},
  closeSidebarFull(){document.getElementById('sidebar').classList.remove('open');document.getElementById('sb-ov').classList.remove('show')},
  dialUSSD(){this.toast('📞 Composez *785# sur votre téléphone pour accéder sans internet','info',5000)},
  toast(msg,type='ok',dur=3500){
    const s=document.getElementById('toast-s');
    const t=document.createElement('div');
    t.className=`toast t-${type}`;
    const icos={ok:'✅',err:'❌',info:'ℹ️',warn:'⚠️'};
    t.innerHTML=`<div class="toast-ico">${icos[type]||'ℹ️'}</div><div class="toast-msg">${msg}</div>`;
    s.appendChild(t);
    setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),300)},dur);
  }
};

// ═══ ONBOARDING ════════════════════════════
const OB = {
  cur:0,
  slides:['ob0','ob1','ob2'],
  next(){
    document.getElementById(this.slides[this.cur]).classList.remove('act');
    document.getElementById('od'+this.cur).classList.remove('act');
    this.cur++;
    if(this.cur>=this.slides.length){this.skip();return}
    document.getElementById(this.slides[this.cur]).classList.add('act');
    document.getElementById('od'+this.cur).classList.add('act');
    document.getElementById('ob-btn').textContent=this.cur===this.slides.length-1?'Commencer 🚀':'Suivant →';
  },
  skip(){S.set('ob_done',true);document.getElementById('ob-ov').style.display='none';App.start()}
};

// ═══ PWA INSTALL PROMPT ═════════════════════

// ═══ INIT ═══════════════════════════════════

// Alias: UI.switchMod(closeId, openId)
if(!UI.switchMod) UI.switchMod = function(closeId, openId){
  App.closeMod(closeId);
  setTimeout(()=>App.openMod(openId), 200);
};

window.addEventListener('DOMContentLoaded',()=>{
  App.init();
  // Range sliders dynamic fill
  document.querySelectorAll('input[type=range]').forEach(r=>{
    const update=()=>r.style.background=`linear-gradient(to right, var(--or) ${((r.value-r.min)/(r.max-r.min))*100}%, rgba(255,255,255,.08) 0)`;
    r.addEventListener('input',update);update();
  });
});