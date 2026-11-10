(()=>{
const gallery=document.querySelector('.production-gallery');
document.querySelectorAll('.card-expand').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).hidden=!open;}));
document.querySelectorAll('[data-build-stage]').forEach(link=>link.addEventListener('click',()=>{const stage=document.querySelector(`#build-timeline [data-stage="${link.dataset.buildStage}"]`);if(stage)stage.click();}));
const prev=document.getElementById('gallery-prev'),next=document.getElementById('gallery-next');
const update=()=>{prev.disabled=gallery.scrollLeft<=2;next.disabled=gallery.scrollLeft+gallery.clientWidth>=gallery.scrollWidth-3;};
function move(direction){const card=gallery.querySelector('.production-card');gallery.scrollBy({left:direction*(card.getBoundingClientRect().width+20),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));gallery.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
})();
