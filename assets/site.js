{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
document.documentElement.classList.add('js');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const KEY='vetai.v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}};
const save=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
const D=(()=>{const el=$('#data');try{return el?JSON.parse(el.textContent):null}catch(e){return null}})();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Math.round(n).toLocaleString('th-TH');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* reveal on scroll */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
$$('.rv').forEach(el=>RM?el.classList.add('in'):io.observe(el));
if(RM)$$('animateMotion').forEach(a=>a.remove());

/* progress */
function pct(slug,st,qn,en){const c=st[slug];if(!c)return 0;const q=qn?Math.min(1,(c.qa||0)/qn):0;const e=en?Object.values(c.ex||{}).filter(Boolean).length/en:0;return Math.round((q*.5+e*.5)*100)}
function paintDots(){const st=load();$$('.dots a').forEach(a=>{const s=a.dataset.slug;if(s&&pct(s,st,+a.dataset.qn,+a.dataset.en)>=50)a.classList.add('done')})}
paintDots();

/* copy */
$$('[data-copy]').forEach(b=>b.addEventListener('click',()=>{const t=$('#'+b.dataset.copy);const txt=t.value!==undefined&&t.tagName!=='PRE'?t.value:t.textContent;
 const ok=()=>{const o=b.textContent;b.textContent='คัดลอกแล้ว';setTimeout(()=>b.textContent=o,1500)};
 try{navigator.clipboard.writeText(txt).then(ok,()=>{selectText(t);b.textContent='กด Ctrl/⌘+C'})}catch(e){selectText(t)}}));
function selectText(el){const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)}

/* ───── index ───── */
if(D&&D.page==='index'){
 const st=load();
 $$('.chcard').forEach(c=>{const s=c.dataset.slug;const p=pct(s,st,+c.dataset.qn,+c.dataset.en);$('.prog i',c).style.width=p+'%';$('.pv',c).textContent=p?p+'%':'ยังไม่เริ่ม'});
 const setTrack=t=>{$$('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.track===t));
  const path=t==='all'?null:D.paths[t];
  $$('.node').forEach(n=>n.classList.toggle('dim',!!path&&!path.includes(+n.dataset.no)));
  $$('.chcard').forEach(n=>n.classList.toggle('dim',!!path&&!path.includes(+n.dataset.no)));
  $('#trackInfo').innerHTML=path?esc(D.goals[t]):'ดูทั้ง 8 บท หรือเลือกบทบาทเพื่อดูเส้นทางที่แนะนำ';
  const s=load();s.track=t;save(s)};
 $$('.seg button').forEach(b=>b.addEventListener('click',()=>setTrack(b.dataset.track)));
 setTrack(st.track||'all');
}

/* ───── chapter ───── */
if(D&&D.page==='chapter'){
 const slug=D.slug;
 const getC=()=>{const s=load();s[slug]=s[slug]||{qa:0,ex:{},qs:{}};return s};
 /* section nav */
 const links=$$('.secnav a');
 const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-40% 0px -55% 0px'});
 $$('main section[id]').forEach(s=>so.observe(s));

 /* simulation player */
 const play=$('#play'),reveal=$('#reveal');
 const tP=$('#tPrompt'),tO=$('#tOut'),chk=$('#checks');
 if(play){
  const htmlP=tP.innerHTML,htmlO=tO.innerHTML,capP=$('.cap',tP).outerHTML,capO=$('.cap',tO).outerHTML;
  let busy=false;
  play.addEventListener('click',async()=>{if(busy)return;busy=true;play.disabled=true;
   $$('#sim .term').forEach(t=>t.classList.remove('reveal'));chk.classList.remove('show');
   const P=D.sim.prompt,O=D.sim.output;
   tP.innerHTML=capP+'<span class="caret"></span>';tO.innerHTML=capO;
   const sp=$('.caret',tP);
   for(let i=0;i<P.length;i+=RM?P.length:4){sp.textContent=P.slice(0,i+4);await sleep(14)}
   sp.classList.remove('caret');
   tO.innerHTML=capO+'<span class="caret"></span>';const so2=$('.caret',tO);await sleep(500);
   const lines=O.split('\n');let acc='';
   for(const l of lines){acc+=(acc?'\n':'')+l;so2.textContent=acc;await sleep(RM?0:260)}
   tP.innerHTML=htmlP;tO.innerHTML=htmlO;busy=false;play.disabled=false;play.textContent='▶ เล่นอีกครั้ง'});
  reveal.addEventListener('click',()=>{$$('#sim .term').forEach(t=>t.classList.add('reveal'));chk.classList.add('show');chk.scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'})});
 }

 /* exercises criteria */
 const st0=getC();
 $$('.crit input').forEach(cb=>{cb.checked=!!st0[slug].ex[cb.dataset.k];
  cb.addEventListener('change',()=>{const s=getC();s[slug].ex[cb.dataset.k]=cb.checked;save(s);paintDots()})});

 /* quiz */
 const qs=$$('.q');
 const tally=()=>{const q=getC()[slug].qs;const keys=Object.keys(q).filter(k=>!k.endsWith('i'));const ok=keys.filter(k=>q[k]).length;
  $('#qscore').textContent=keys.length?`ตอบแล้ว ${keys.length}/${qs.length} · ถูก ${ok}`:'ยังไม่ได้ตอบ'};
 qs.forEach((q,qi)=>{const a=+q.dataset.a;const bs=$$('.opts .chip',q);
  const mark=i=>{bs.forEach((b,j)=>{b.classList.toggle('ok',j===a);b.classList.toggle('no',j===i&&i!==a);b.setAttribute('aria-pressed',j===i)});q.classList.add('done')};
  const prev=st0[slug].qs[qi+'i'];if(prev!==undefined)mark(prev);
  bs.forEach((b,i)=>b.addEventListener('click',()=>{mark(i);const s=getC();s[slug].qs[qi]=i===a;s[slug].qs[qi+'i']=i;
   s[slug].qa=Object.keys(s[slug].qs).filter(k=>!k.endsWith('i')).length;save(s);tally();paintDots()}))});
 if(qs.length)tally();
}

/* ───── labs ───── */
const LABS={
vets(D){
 const ids=['V','E','T','S','C'];const f=ids.map(k=>$('#v_'+k));const out=$('#vetsOut'),m=$('#vetsMeter'),sc=$('#vetsScore'),tips=$('#vetsTips');
 const tag={V:'[V] ',E:'[E] ',T:'[T] ',S:'[S] ',C:'[✓] '};
 const up=()=>{const v=f.map(x=>x.value.trim());let n=v.filter(Boolean).length;let s=n*17;const t=[];
  if(/ห้าม/.test(v[2]))s+=8;else t.push('เพิ่มสิ่งที่ห้าม AI ทำใน T เช่น "ห้ามเติมข้อมูลที่ไม่มี"');
  if(/0\d{1,2}[-\s]?\d{3}|คุณ[ก-๙]+\s|โทร|LINE|ที่อยู่|เลขบัตร/.test(v[1])){s-=25;t.unshift('⚠ ส่วน E มีข้อมูลระบุตัวเจ้าของ ลบออกก่อน (PDPA)')}
  if(!v[4])t.push('ปิดท้ายด้วย Check: ให้ AI ทำเครื่องหมาย [ต้องยืนยัน]');
  if(!v[0])t.push('ใส่บทบาทและผู้อ่านใน V');
  if(v[3]&&!/\d|หัวข้อ|ตาราง|bullet|บรรทัด/.test(v[3]))t.push('S ควรระบุรูปแบบที่วัดได้ เช่น จำนวนบรรทัดหรือหัวข้อ');
  s=Math.max(0,Math.min(100,s+(n===5?7:0)));
  out.textContent=ids.map((k,i)=>v[i]?tag[k]+v[i]:'').filter(Boolean).join('\n')||'เริ่มพิมพ์ หรือเลือกชุดตัวอย่างด้านบน';
  m.style.width=s+'%';sc.textContent=s;tips.innerHTML=t.length?t.map(x=>'<li>'+esc(x)+'</li>').join(''):'<li>ครบถ้วน พร้อมใช้เป็นแม่แบบของทีม</li>'};
 f.forEach(x=>x.addEventListener('input',up));
 if(f.every(x=>!x.value))D.presets[0].forEach((v,i)=>f[i].value=v);
 $$('[data-preset]').forEach(b=>b.addEventListener('click',()=>{const p=D.presets[+b.dataset.preset];ids.forEach((k,i)=>f[i].value=p[i]);up()}));
 up();
},
soap(D){
 const pool=$('#pool');const items=D.soap_items.map((x,i)=>({t:x[0],a:x[1],i}));
 const order=[3,0,6,1,7,4,2,5];let sel=null;
 const render=()=>{pool.innerHTML='';$$('.bucket .chips').forEach(b=>b.innerHTML='');
  order.forEach(k=>{const it=items[k];const c=document.createElement('button');c.className='chip';c.textContent=it.t;c.draggable=true;c.dataset.i=it.i;
   c.addEventListener('click',e=>{e.stopPropagation();$$('.chip',$('#soapLab')).forEach(x=>x.classList.remove('sel'));sel=c;c.classList.add('sel')});
   c.addEventListener('dragstart',e=>{sel=c;e.dataTransfer.setData('text/plain',it.i)});pool.appendChild(c)});$('#soapRes').textContent=''};
 $$('.bucket').forEach(b=>{const drop=()=>{if(!sel)return;$('.chips',b).appendChild(sel);sel.classList.remove('sel','ok','no');sel=null};
  b.addEventListener('click',drop);b.addEventListener('dragover',e=>{e.preventDefault();b.classList.add('over')});
  b.addEventListener('dragleave',()=>b.classList.remove('over'));b.addEventListener('drop',e=>{e.preventDefault();b.classList.remove('over');drop()})});
 $('#soapCheck').addEventListener('click',()=>{let ok=0,n=0;$$('.bucket').forEach(b=>$$('.chip',b).forEach(c=>{n++;const r=items[+c.dataset.i].a===b.dataset.k;c.classList.toggle('ok',r);c.classList.toggle('no',!r);if(r)ok++}));
  $('#soapRes').textContent=n<items.length?`จัดแล้ว ${n}/${items.length} ข้อ · ถูก ${ok}`:`ถูก ${ok}/${items.length} ข้อ`+(ok===items.length?' เยี่ยม! พร้อมให้ AI ร่างตามโครงนี้':' ข้อที่แดง ลองย้ายใหม่')});
 $('#soapReset').addEventListener('click',render);render();
},
time(D){
 const box=$('#timeRows');const rows=D.time_tasks;
 box.innerHTML=rows.map((r,i)=>`<div class="trow"><input type="checkbox" id="tk${i}" checked aria-label="เลือก ${esc(r[0])}"><label for="tk${i}" style="font-weight:400;margin:0">${esc(r[0])}<br><span class="note">AI ลดเวลาได้ราว ${r[2]}% (สมมติ)</span></label><input type="range" id="tm${i}" min="0" max="600" step="10" value="${r[1]}" aria-label="นาทีต่อสัปดาห์"><span class="note" id="tv${i}" style="text-align:right">${r[1]} น.</span></div>`).join('');
 const up=()=>{let tot=0;const bars=[];rows.forEach((r,i)=>{const m=+$('#tm'+i).value;$('#tv'+i).textContent=m+' น.';const s=$('#tk'+i).checked?m*r[2]/100:0;tot+=s;bars.push([r[0],s])});
  const hm=tot*52/12/60;$('#timeOut').textContent=hm.toFixed(1);$('#timeDay').textContent=fmt(tot/5);
  const mx=Math.max(1,...bars.map(b=>b[1]));$('#timeBars').innerHTML=bars.map(b=>`<div class="bar"><div class="t"><i style="width:${b[1]/mx*100}%"></i><span>${esc(b[0])}</span></div><div class="v">${fmt(b[1])} น./สัปดาห์</div></div>`).join('')};
 box.addEventListener('input',up);up();
},
cite(D){
 const box=$('#citeRows');box.innerHTML=D.cite_claims.map((c,i)=>`<div class="trow" style="grid-template-columns:minmax(0,1fr) auto"><span>${esc(c[0])}</span><span class="chips"><button class="chip" data-i="${i}" data-v="1">อยู่ในเอกสาร</button><button class="chip" data-i="${i}" data-v="0">ต้องตัด</button></span></div>`).join('');
 const ans={};box.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;ans[b.dataset.i]=b.dataset.v==='1';$$(`.chip[data-i="${b.dataset.i}"]`,box).forEach(x=>{x.classList.toggle('sel',x===b);x.classList.remove('ok','no')})});
 $('#citeCheck').addEventListener('click',()=>{let ok=0;D.cite_claims.forEach((c,i)=>{const bs=$$(`.chip[data-i="${i}"]`,box);bs.forEach(b=>b.classList.remove('ok','no','sel'));
  const right=bs.find(b=>(b.dataset.v==='1')===c[1]);right.classList.add('ok');if(ans[i]!==undefined&&ans[i]!==c[1])bs.find(b=>b!==right).classList.add('no');if(ans[i]===c[1])ok++});
  $('#citeRes').textContent=`ถูก ${ok}/${D.cite_claims.length} · ข้อความที่ต้องตัดคือสิ่งที่ AI เติมเอง ไม่มีใน abstract`});
},
pico(D){
 const f=['P','I','C','O'].map(k=>$('#p_'+k));const up=()=>{const v=f.map(x=>x.value.trim()||'…');
  $('#picoOut').textContent=`ใน${v[0]} การ${v[1]} เมื่อเทียบกับ${v[2]} สัมพันธ์กับ${v[3]}แตกต่างกันหรือไม่`};
 f.forEach(x=>x.addEventListener('input',up));up();
 const kb=$('#kpiPick');kb.innerHTML=D.kpis.map((k,i)=>`<label style="display:flex;gap:10px;font-weight:400;margin:0;padding:6px 0"><input type="checkbox" data-i="${i}" ${i<2?'checked':''}>${esc(k[0])}</label>`).join('');
 const rk=()=>{const sel=$$('input',kb).filter(x=>x.checked).map(x=>D.kpis[+x.dataset.i]);
  $('#kpiCards').innerHTML=sel.length?sel.map(k=>`<div class="card"><b>${esc(k[0])}</b><div class="small" style="margin-top:6px">ตัวตั้ง: ${esc(k[1])}<br>ตัวหาร: ${esc(k[2])}<br>แหล่ง: ${esc(k[3])} · ${esc(k[4])}<br>เป้า: <b>${esc(k[5])}</b></div></div>`).join(''):'<p class="muted">เลือก KPI อย่างน้อย 1 ตัว</p>'};
 kb.addEventListener('change',rk);rk();
 $('#confBtn').addEventListener('click',()=>{$('#confBox').hidden=!$('#confBox').hidden});
},
flow(D){
 const h=$('#fHuman'),t=$('#fTriage'),msg=$('#fMsg'),res=$('#fRes');
 const urgent=/ชัก|หายใจ|เลือด|สารพิษ|คลอด/;
 const up=()=>{$('#fn4').classList.toggle('off',!h.checked);$('#fn2').classList.toggle('off',!t.checked);
  const m=msg.value;const u=urgent.test(m);let html;
  if(u&&t.checked)html='<div class="good">คัดกรองเจอคำเร่งด่วน → <b>แจ้งสัตวแพทย์เวรทันที</b> ไม่ผ่าน AI</div>';
  else if(u)html='<div class="warn"><b>อันตราย:</b> ไม่มีขั้นคัดกรอง ข้อความฉุกเฉินเข้าคิวเดียวกับคำถามทั่วไป และ AI อาจตอบเอง</div>';
  else if(h.checked)html='<div class="good">AI ร่างจากคลังคำตอบที่อนุมัติ → <b>เจ้าหน้าที่ตรวจและกดส่ง</b> → บันทึก log</div>';
  else html='<div class="warn"><b>เสี่ยง:</b> AI ส่งคำตอบเองโดยไม่มีคนตรวจ ถ้าตอบผิดไม่มีใครรู้และไม่มีผู้รับผิดชอบ</div>';
  res.innerHTML=html};
 [h,t,msg].forEach(x=>x.addEventListener('change',up));up();
 const mx=$('#matrix');D.matrix_tasks.forEach(([n,fq,rk])=>{const b=document.createElement('button');b.className='mt'+(rk>=4?' red':'');b.textContent=n;
  b.style.left=((fq-.5)/5*100)+'%';b.style.bottom=((rk-.5)/5*100)+'%';
  b.addEventListener('click',()=>{const r=rk>=4?'ความเสี่ยงสูง: ต้องให้สัตวแพทย์ทำหรือตรวจทุกครั้ง ไม่ทำอัตโนมัติ':rk<=2&&fq>=3?'เริ่มทำ workflow ได้ก่อน: ทำบ่อย เสี่ยงต่ำ':'ทำได้ภายหลัง ใช้ checklist ตรวจเข้ม';
   $('#mInfo').innerHTML=`<b>${esc(n)}</b> · ความถี่ ${fq}/5 · ความเสี่ยง ${rk}/5<br>${r}`});mx.appendChild(b)});
},
redact(D){
 const box=$('#redactBox');const segs=D.redact_text;
 box.innerHTML=segs.map((s,i)=>/^\s|\s$/.test(s[0])||s[0].length<3?`<span>${esc(s[0])}</span>`:`<button data-i="${i}">${esc(s[0])}</button>`).join('');
 const total=segs.filter(s=>s[1]).length;
 box.addEventListener('click',e=>{const b=e.target.closest('button');if(b){b.classList.toggle('x');b.classList.remove('miss','fp')}});
 $('#redCheck').addEventListener('click',()=>{let ok=0,fp=0;$$('button',box).forEach(b=>{const pii=segs[+b.dataset.i][1];const x=b.classList.contains('x');
  b.classList.toggle('miss',pii&&!x);b.classList.toggle('fp',!pii&&x);if(pii&&x)ok++;if(!pii&&x)fp++});
  $('#redRes').innerHTML=`ลบถูก <b>${ok}/${total}</b> จุด`+(fp?` · ลบเกิน ${fp} จุด (ข้อมูลทางคลินิกควรเก็บไว้)`:'')+(ok===total&&!fp?' — ปลอดภัย พร้อมวางใน AI':' — กรอบแดงคือข้อมูลที่ยังหลุด')});
 $('#redAll').addEventListener('click',()=>$$('button',box).forEach(b=>b.classList.remove('x','miss','fp')));
},
roi(D){
 const k=['vets','save','check','adopt','days','rate','tool'];const el=Object.fromEntries(k.map(x=>[x,$('#r_'+x)]));
 const up=()=>{const v=Object.fromEntries(k.map(x=>[x,+el[x].value]));k.forEach(x=>$('#rv_'+x).textContent=fmt(v[x]));
  const cost=v.tool*v.vets;const hO=v.save*v.vets*v.days/60;const hP=Math.max(0,v.save-v.check)*v.vets*v.days*(v.adopt/100)/60;
  const nO=hO*v.rate-cost,nP=hP*v.rate-cost;$('#roiOut').textContent=fmt(nP);$('#roiH').textContent=hP.toFixed(1);
  const mx=Math.max(1,Math.abs(nO),Math.abs(nP));
  $('#roiBars').innerHTML=[['แบบที่ผู้ขายเล่า (ใช้ 100% ไม่หักเวลาตรวจ)',nO],['แบบรอบคอบ',nP]].map(b=>`<div class="bar"><div class="t"><i style="width:${Math.max(0,b[1])/mx*100}%;${b[1]<0?'background:var(--bad)':''}"></i><span>${b[0]}</span></div><div class="v">${fmt(b[1])} ฿</div></div>`).join('');
  $('#roiNote').textContent=nP<0?'ยังไม่คุ้มในแบบรอบคอบ ลองวัดเวลาจริงกับทีมนำร่องก่อนตัดสินใจ':`ค่าเครื่องมือ ${fmt(cost)} บาท/เดือน · เวลาตรวจกินเวลาที่ประหยัดไป ${Math.round(v.check/v.save*100)||0}%`};
 k.forEach(x=>el[x].addEventListener('input',up));up();
 const pf=$$('#policy textarea');const pu=()=>{$('#polOut').textContent='นโยบายการใช้ AI ของโรงพยาบาล (ฉบับร่าง)\n\n'+pf.map((t,i)=>`${i+1}. ${t.dataset.h}: ${t.value.trim()||'—'}`).join('\n')+'\n\nทบทวนทุก 6 เดือน · ผู้อนุมัติ: ____________'};
 pf.forEach(t=>t.addEventListener('input',pu));pu();
}};
if(D&&D.page==='chapter'&&LABS[D.lab]){try{LABS[D.lab](D)}catch(e){console.error(e)}}
}
