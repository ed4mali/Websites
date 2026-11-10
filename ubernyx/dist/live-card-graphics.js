(()=>{
const $=id=>document.getElementById(id);
const themes={ocean:['#1765c8','#d8eaff','Ocean blue'],sky:['#1383ad','#d6f1fb','Sky blue'],slate:['#506b99','#e0e7f3','Slate blue']};let requests=12;
document.querySelectorAll('[data-preview-theme]').forEach(button=>button.addEventListener('click',()=>{const t=themes[button.dataset.previewTheme];$('mini-app').style.setProperty('--accent',t[0]);$('mini-app').style.setProperty('--accent-light',t[1]);document.querySelectorAll('[data-preview-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('design-feedback').textContent=t[2]+' selected. Your workspace, your style.';}));
$('mini-add').addEventListener('click',()=>{requests++;$('mini-record-count').textContent=requests;$('mini-record').innerHTML='Demo request #'+requests+' <span>Added ✓</span>';$('design-feedback').textContent='Request added to this demo. Try another color or add more.';document.querySelectorAll('.mini-live-chart i').forEach((bar,i)=>bar.style.setProperty('--bar',(30+((requests*11+i*17)%64))+'%'));});
let step=0,running=false,timer=null;
const messages=['$ Ready to simulate your build','> Compiling application components…','✓ Example workflow checks passed','✓ Demo release complete. Ready to explore.'];
function render(){['flow-code','flow-test','flow-release'].forEach((id,i)=>{const e=$(id);e.classList.toggle('flow-active',step===i+1);e.classList.toggle('flow-done',step>i+1||step===3);});$('mini-terminal').textContent=messages[step];$('mini-build-badge').textContent=['READY','COMPILING','TESTING','DEMO COMPLETE'][step];$('mini-run').textContent=running?'Ⅱ Pause build':step===3?'↺ Replay build':step>0?'▶ Continue build':'▶ Run demo build';$('mini-run').setAttribute('aria-pressed',String(running));}
function stop(){running=false;if(timer!==null)clearTimeout(timer);timer=null;}
function schedule(){timer=setTimeout(()=>{if(!running)return;step++;if(step===3)stop();render();if(running)schedule();},1500);}
$('mini-run').addEventListener('click',()=>{if(running){stop();render();return;}if(step===3)step=0;running=true;if(step===0)step=1;render();schedule();});
$('mini-reset').addEventListener('click',()=>{stop();step=0;render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();render();}});render();
})();
