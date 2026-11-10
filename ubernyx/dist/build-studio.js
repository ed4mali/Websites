(() => {
'use strict';
const $ = id => document.getElementById(id);
const apps = {
 portal: {name:'My customer portal',users:'Customers & your team',goal:'Give customers one place to track requests, find documents, and get updates.',features:['Request tracking','Document access','Customer accounts'],entity:'requests',fields:['Customer access','Request tracking','Document permissions'],stats:['Open requests','Documents','Customers'],values:['12','48','24'],rows:['Onboarding request','Contract review'],action:'Add demo request'},
 inventory: {name:'My inventory manager',users:'Operations & warehouse teams',goal:'Keep stock information in one place and help your team spot what needs attention.',features:['Stock tracking','Low-stock alerts','Supplier records'],entity:'inventory',fields:['Product records','Stock movements','Reorder thresholds'],stats:['Products','Low stock','Suppliers'],values:['128','8','16'],rows:['Office supplies','Packaging materials'],action:'Add demo item'},
 booking: {name:'My booking application',users:'Customers & scheduling teams',goal:'Help customers book a time and give your team a clear view of upcoming appointments.',features:['Available time slots','Booking requests','Schedule view'],entity:'bookings',fields:['Available time slots','Booking validation','Schedule permissions'],stats:['Bookings','Available slots','Services'],values:['32','18','6'],rows:['Consultation · 10:00','Discovery call · 14:00'],action:'Add demo booking'}
};
const stages = [
 {name:'Your idea',short:'Idea',status:'READY TO BUILD',text:'We start with your business goal, who will use the application, and what would make their day easier.'},
 {name:'Define the requirements',short:'Plan',status:'SCOPE MAPPED',text:'Translate the idea into users, features, and data requirements. Agree what the first version needs to do.'},
 {name:'Design the experience',short:'Design',status:'WIREFRAME READY',text:'Map the screens and user flows before writing code. This wireframe shows where information and actions will live.'},
 {name:'Develop the application',short:'Code',status:'BUILDING LOGIC',text:'Build the interface, application logic, and data connections. This simplified code illustrates an API for your application.'},
 {name:'Test the workflows',short:'Test',status:'DEMO CHECKS PASSED',text:'Check access rules, data validation, and key workflows. These example results illustrate a testing stage, not a real test run.'},
 {name:'Release to production',short:'Launch',status:'SIMULATED RELEASE',text:'Plan the deployment, configuration, and handover. Your illustrative application is ready below — try adding a demo record.'}
];
let current=0, running=false, timer=null, added=0;
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getApp=()=>apps[$('app-type').value];
const getName=()=>($('app-name').value.trim()||getApp().name);
const chips=items=>'<div class="mini-chips">'+items.map(x=>'<span>'+escape(x)+'</span>').join('')+'</div>';
function artifact(){
 const a=getApp(), name=escape(getName());
 if(current===0) return `<div class="idea-screen"><div class="mini-eyebrow">THE CUSTOMER BRIEF</div><h4>${name}</h4><p>${escape(a.goal)}</p>${chips(a.features)}</div>`;
 if(current===1) return `<div class="spec-screen"><div class="spec-title">${name} / first-version scope</div><div class="spec-row"><span>Users</span><span>${escape(a.users)}</span></div>${a.fields.map((f,i)=>`<div class="spec-row"><span>0${i+1} / Requirement</span><span>${escape(f)}</span></div>`).join('')}<div class="spec-row"><span>Delivery</span><span>Web application + API</span></div></div>`;
 if(current===2) return `<div class="wire-screen"><div class="wire-side"><div class="wire-label">U / APP</div><br>${'<div class="wire-block"></div>'.repeat(5)}</div><div class="wire-content"><div class="wire-label">${name} / dashboard wireframe</div><div class="wire-cards"><div></div><div></div><div></div></div><div class="wire-table"><div class="wire-label">${escape(a.entity.toUpperCase())}</div><br>${'<div class="wire-block"></div>'.repeat(3)}</div></div></div>`;
 if(current===3) return `<div class="code-screen"><div class="file">src / api / ${a.entity}.js · illustrative pseudocode</div><pre><span class="code-key">app</span>.get(<span class="code-string">"/api/${a.entity}"</span>, <span class="code-key">async</span> (req) =&gt; {\n  <span class="code-key">const</span> user = await requireUser(req);\n  <span class="code-key">const</span> records = await database.find({\n    collection: <span class="code-string">"${a.entity}"</span>,\n    accountId: user.accountId\n  });\n  <span class="code-key">return</span> response.json(records);\n}); <span class="code-cursor"></span></pre></div>`;
 if(current===4) return `<div class="test-screen"><div class="test-title">$ run workflow-checks --demo</div>${['Authorized users can access records','Invalid input is rejected',a.fields[1]+' works as expected','Dashboard adapts to mobile'].map(t=>`<div class="test-row"><span>✓ PASS</span> ${escape(t)}</div>`).join('')}<div class="test-total">4 illustrative checks · All passed · Ready for release planning</div></div>`;
 return `<div class="prod-screen"><div class="prod-address"><span>◉</span> ${a.entity}.example / dashboard <span>DEMO ENVIRONMENT</span></div><div class="prod-inner"><div class="prod-title">${name}</div><div class="prod-sub">Welcome back. Here’s your workspace.</div><div class="prod-stats">${a.stats.map((t,i)=>`<div class="prod-stat">${escape(t)}<b>${Number(a.values[i])+(i===0?added:0)}</b></div>`).join('')}</div><div class="prod-table">${a.rows.map(t=>`<div class="prod-row"><span>${escape(t)}</span><span>Active</span></div>`).join('')}${added?`<div class="prod-row"><span>${added} new demo record${added===1?'':'s'}</span><span>Added just now ✓</span></div>`:''}</div></div><div class="prod-ribbon"><span>✓ Simulated production preview</span><button type="button" id="demo-add">+ ${escape(a.action)}</button></div></div>`;
}
function render(animate=true){
 const stage=stages[current];
 $('build-timeline').innerHTML=stages.map((s,i)=>`<button type="button" class="stage-tab ${i===current?'active':i<current?'complete':''}" data-stage="${i}" ${i===current?'aria-current="step"':''} aria-label="Stage ${i+1}: ${s.name}">${i<current?'✓ ':''}${s.short}</button>`).join('');
 $('stage-counter').textContent=`0${current+1} / 06`;
 $('stage-name').textContent=stage.name;
 $('stage-status').textContent=stage.status;
 $('stage-description').textContent=stage.text;
 $('stage-canvas').innerHTML=artifact();
 $('stage-canvas').scrollTop=0;
 $('stage-canvas').classList.remove('stage-enter');
 if(animate){void $('stage-canvas').offsetWidth;$('stage-canvas').classList.add('stage-enter');}
 $('build-progress-fill').style.width=`${current/5*100}%`;
 document.querySelector('.build-progress').setAttribute('aria-valuenow',String(current*20));
 $('play-build').textContent=running?'Ⅱ Pause simulation':current===5?'↺ Replay the build':current===0?'▶ Simulate my build':'▶ Continue simulation';
 $('play-build').setAttribute('aria-pressed',String(running));
 $('next-build').disabled=current===5;
}
function stop(){running=false;if(timer!==null)clearTimeout(timer);timer=null;}
function schedule(){timer=setTimeout(()=>{if(!running)return;if(current<5)current++;if(current===5)stop();render();if(running)schedule();},3600);}
function play(){if(running){stop();render(false);return;}if(current===5){current=0;added=0;}running=true;render();schedule();}
$('play-build').addEventListener('click',play);
$('hero-simulate').addEventListener('click',()=>{if(!running)play();});
$('next-build').addEventListener('click',()=>{stop();current=Math.min(5,current+1);render();});
$('reset-build').addEventListener('click',()=>{stop();current=0;added=0;render();});
$('build-timeline').addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(!b)return;stop();current=Number(b.dataset.stage);render();});
$('app-type').addEventListener('change',()=>{stop();current=0;added=0;$('app-name').value=getApp().name;render();});
$('app-name').addEventListener('input',()=>{render(false);});
$('stage-canvas').addEventListener('click',e=>{if(e.target.closest('#demo-add')){added++;render(false);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){stop();render(false);}});
render(false);
})();
