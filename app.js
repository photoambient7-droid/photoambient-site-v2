
const translations = {
  en:{nav:{home:'Home',portfolio:'Portfolio',about:'About',contact:'Contact'},hero:{tagline:'Photography · Films · Visual Stories',scroll:'SCROLL TO EXPLORE'},portfolio:{eyebrow:'PORTFOLIO',title:'Explore Our Work',subtitle:'Different stories. One visual language.'},about:{eyebrow:'PHOTOAMBIENT',title:'Photography built around people, moments and stories.',body:'Professional imagery for events, brands, schools, families and individuals — created with a cinematic, modern visual language.'},contact:{eyebrow:'CONTACT',title:"Let's Create Something Together.",location:'LOCATION',phone:'PHONE'},form:{name:'Name',email:'Email',phone:'Phone',type:'Photography Type',message:'Message',submit:'START YOUR PROJECT',sending:'Sending message...',success:'Thank you! Your message has been sent successfully.',sent:'Opening your email application with the project details.'},categories:{corporate:'Corporate',schools:'Schools',portraits:'Portraits',weddings:'Weddings',sports:'Sports',ballet:'Ballet',products:'Products',other:'Other'}},
  pt:{nav:{home:'Início',portfolio:'Portfólio',about:'Sobre',contact:'Contato'},hero:{tagline:'Fotografia · Filmes · Histórias Visuais',scroll:'ROLE PARA EXPLORAR'},portfolio:{eyebrow:'PORTFÓLIO',title:'Explore Nosso Trabalho',subtitle:'Histórias diferentes. Uma só linguagem visual.'},about:{eyebrow:'PHOTOAMBIENT',title:'Fotografia criada em torno de pessoas, momentos e histórias.',body:'Imagens profissionais para eventos, marcas, escolas, famílias e retratos individuais — com uma linguagem visual cinematográfica e moderna.'},contact:{eyebrow:'CONTATO',title:'Vamos Criar Algo Juntos.',location:'LOCALIZAÇÃO',phone:'TELEFONE'},form:{name:'Nome',email:'Email',phone:'Telefone',type:'Tipo de Fotografia',message:'Mensagem',submit:'INICIE SEU PROJETO',sending:'Enviando mensagem...',success:'Obrigado! Sua mensagem foi enviada com sucesso.',sent:'Abrindo seu aplicativo de e-mail com os detalhes do projeto.'},categories:{corporate:'Corporativo',schools:'Escolas',portraits:'Retratos',weddings:'Casamentos',sports:'Esportes',ballet:'Ballet',products:'Produtos',other:'Outro'}},
  es:{nav:{home:'Inicio',portfolio:'Portafolio',about:'Nosotros',contact:'Contacto'},hero:{tagline:'Fotografía · Films · Historias Visuales',scroll:'DESLIZA PARA EXPLORAR'},portfolio:{eyebrow:'PORTAFOLIO',title:'Explora Nuestro Trabajo',subtitle:'Historias diferentes. Un mismo lenguaje visual.'},about:{eyebrow:'PHOTOAMBIENT',title:'Fotografía creada alrededor de personas, momentos e historias.',body:'Imágenes profesionales para eventos, marcas, escuelas, familias y retratos — con un lenguaje visual cinematográfico y moderno.'},contact:{eyebrow:'CONTACTO',title:'Creemos Algo Juntos.',location:'UBICACIÓN',phone:'TELÉFONO'},form:{name:'Nombre',email:'Email',phone:'Teléfono',type:'Tipo de Fotografía',message:'Mensaje',submit:'INICIA TU PROYECTO',sending:'Enviando mensaje...',success:'¡Gracias! Tu mensaje ha sido enviado con éxito.',sent:'Abriendo tu aplicación de correo con los detalles del proyecto.'},categories:{corporate:'Corporativo',schools:'Escuelas',portraits:'Retratos',weddings:'Bodas',sports:'Deportes',ballet:'Ballet',products:'Productos',other:'Otro'}}
};
const galleryImages = window.PHOTOAMBIENT_GALLERIES || {};
const tunnelImages = window.PHOTOAMBIENT_TUNNEL_IMAGES || [];
const cats=['corporate','schools','portraits','weddings','sports','ballet','products'];
const coverSelections={corporate:29,schools:4,products:1};
const coverImage = cat => { const arr=galleryImages[cat] || []; const idx=coverSelections.hasOwnProperty(cat)?coverSelections[cat]:0; return arr[idx] || arr[0] || ''; };
let lang='en';
function detectLang(){const saved=localStorage.getItem('photoambient_lang');if(saved&&translations[saved])return saved;const b=(navigator.language||'en').toLowerCase();return b.startsWith('pt')?'pt':b.startsWith('es')?'es':'en'}
function t(path){return path.split('.').reduce((o,k)=>o?.[k],translations[lang])??path}
function applyLang(next){lang=next;document.documentElement.lang=lang;localStorage.setItem('photoambient_lang',lang);document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));renderPortfolio();renderTypeOptions()}
function renderTypeOptions(){const s=document.querySelector('#typeSelect');s.innerHTML=[...cats,'other'].map(k=>`<option value="${k}">${t('categories.'+k)}</option>`).join('')}
function renderPortfolio(){const grid=document.querySelector('#portfolioGrid');grid.innerHTML=cats.map((c,i)=>`<article class="portfolio-card reveal" data-category="${c}" tabindex="0" role="button" aria-label="${t('categories.'+c)}"><img src="${coverImage(c)}" alt="${t('categories.'+c)} photography" loading="lazy"><div class="card-meta"><h3>${t('categories.'+c)}</h3><span>↗</span></div></article>`).join('');attachCards();observeReveals()}
function attachCards(){document.querySelectorAll('.portfolio-card').forEach(card=>{const open=()=>openGallery(card.dataset.category);card.addEventListener('click',open);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')open()});card.addEventListener('pointermove',e=>{if(matchMedia('(pointer:fine)').matches){const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1100px) rotateX(${y*-3}deg) rotateY(${x*4}deg) translateZ(0)`}});card.addEventListener('pointerleave',()=>card.style.transform='')})}
const menuBtn=document.querySelector('#menuButton'),menu=document.querySelector('#menuOverlay');menuBtn.addEventListener('click',()=>{const open=!menu.classList.contains('open');menu.classList.toggle('open',open);menuBtn.classList.toggle('active',open);menuBtn.setAttribute('aria-expanded',open);menu.setAttribute('aria-hidden',!open)});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuBtn.classList.remove('active')}));document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>applyLang(b.dataset.lang)));window.addEventListener('scroll',()=>document.querySelector('#siteHeader').classList.toggle('scrolled',scrollY>24));
let io;function observeReveals(){io?.disconnect();io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el))}

const gallery=document.querySelector('#galleryOverlay'),galleryTitle=document.querySelector('#galleryTitle'),galleryGrid=document.querySelector('#galleryGrid');let currentGallery=[],lightIndex=0;
function openGallery(cat){galleryTitle.textContent=t('categories.'+cat);currentGallery=[...(galleryImages[cat] || [])];galleryGrid.innerHTML=currentGallery.map((src,i)=>`<button data-index="${i}" aria-label="View image ${i+1}"><img src="${src}" alt="${t('categories.'+cat)} portfolio image" loading="lazy"></button>`).join('');galleryGrid.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>openLightbox(+b.dataset.index)));gallery.classList.add('open');gallery.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeGallery(){gallery.classList.remove('open');gallery.setAttribute('aria-hidden','true');document.body.style.overflow=''}document.querySelector('#galleryClose').addEventListener('click',closeGallery);
const lb=document.querySelector('#lightbox'),lbImg=document.querySelector('#lightboxImage');function openLightbox(i){lightIndex=i;lbImg.src=currentGallery[i];lb.classList.add('open');lb.setAttribute('aria-hidden','false')}function closeLb(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true')}function navLb(d){lightIndex=(lightIndex+d+currentGallery.length)%currentGallery.length;lbImg.src=currentGallery[lightIndex]}document.querySelector('#lightboxClose').onclick=closeLb;document.querySelector('#lightboxPrev').onclick=()=>navLb(-1);document.querySelector('#lightboxNext').onclick=()=>navLb(1);window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(lb.classList.contains('open'))closeLb();else if(gallery.classList.contains('open'))closeGallery()}if(lb.classList.contains('open')){if(e.key==='ArrowLeft')navLb(-1);if(e.key==='ArrowRight')navLb(1)}});

document.querySelector('#contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const statusEl = document.querySelector('#formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    type: formData.get('type'),
    message: formData.get('message'),
    lang: lang,
    _gotcha: formData.get('_gotcha') || ''
  };

  statusEl.className = 'form-status sending';
  statusEl.textContent = t('form.sending');
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      statusEl.className = 'form-status success';
      statusEl.textContent = t('form.success');
      form.reset();
    } else {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'API Error');
    }
  } catch (error) {
    console.warn('Resend API call failed, falling back to mailto client:', error);
    statusEl.className = 'form-status fallback';
    statusEl.textContent = t('form.sent');
    const subject = encodeURIComponent(`PhotoAmbient — ${payload.type} inquiry`);
    const body = encodeURIComponent(`Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nType: ${payload.type}\n\n${payload.message}`);
    window.location.href = `mailto:photoambient.7@gmail.com?subject=${subject}&body=${body}`;
  } finally {
    submitBtn.disabled = false;
  }
});

function initTunnel(){const frame=document.querySelector('#tunnel');const scene=new THREE.Scene();scene.background=new THREE.Color('#000');scene.fog=new THREE.Fog('#000',3,14);const camera=new THREE.PerspectiveCamera(45,1,.1,100);camera.position.set(0,0,.15);const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));frame.appendChild(renderer.domElement);const W=2,H=1.8,D=1,N=15,R=.003;const hw=W/2,hh=H/2,cols=4,rows=4,colW=W/cols,rowH=H/rows;const lineMat=new THREE.MeshBasicMaterial({color:'#b0b0b0',transparent:true,opacity:.54});const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');const imgMats=tunnelImages.map(url=>{const m=new THREE.MeshBasicMaterial({transparent:true,opacity:0,side:THREE.DoubleSide});loader.load(url,tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;m.map=tex;m.needsUpdate=true});return m});const colors=['#ff6a00','#ab54f7','#ea3737','#0072e3','#00aa3c','#ffb200'];const colorMats=colors.map(c=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));const floor=new THREE.PlaneGeometry(colW,D),wall=new THREE.PlaneGeometry(D,rowH);const tubeZ=new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-D)),1,R,8),tubeX=new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(W,0,0)),1,R,8),tubeY=new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,H,0)),1,R,8);const slots=[];for(let i=0;i<cols;i++){const x=-hw+i*colW+colW/2;slots.push([floor,new THREE.Vector3(x,-hh,-D/2),new THREE.Euler(-Math.PI/2,0,0)]);slots.push([floor,new THREE.Vector3(x,hh,-D/2),new THREE.Euler(Math.PI/2,0,0)])}for(let i=0;i<rows;i++){const y=-hh+i*rowH+rowH/2;slots.push([wall,new THREE.Vector3(-hw,y,-D/2),new THREE.Euler(0,Math.PI/2,0)]);slots.push([wall,new THREE.Vector3(hw,y,-D/2),new THREE.Euler(0,-Math.PI/2,0)])}let imageIndex=0,colorIndex=0,populateIndex=0,scrollPos=0,pressed=false;const tube=(geo,x,y,z=0)=>{const m=new THREE.Mesh(geo,lineMat);m.position.set(x,y,z);return m};function populate(g){const takes=populateIndex++%2===0;g.userData.slabs.forEach(s=>{if(!takes||Math.random()>.5){s.visible=false;return}s.visible=true;s.material=(imgMats.length && Math.random()<=.55)?imgMats[(3*imageIndex++)%imgMats.length]:colorMats[(5*colorIndex++)%colorMats.length]})}function make(z){const g=new THREE.Group();g.position.z=z;for(let i=0;i<=cols;i++){const x=-hw+i*colW;g.add(tube(tubeZ,x,-hh));g.add(tube(tubeZ,x,hh))}for(let i=1;i<rows;i++){const y=-hh+i*rowH;g.add(tube(tubeZ,-hw,y));g.add(tube(tubeZ,hw,y))}g.add(tube(tubeX,-hw,-hh));g.add(tube(tubeX,-hw,hh));g.add(tube(tubeY,-hw,-hh));g.add(tube(tubeY,hw,-hh));g.userData.slabs=slots.map(([geo,pos,rot])=>{const m=new THREE.Mesh(geo,colorMats[0]);m.position.copy(pos);m.rotation.copy(rot);m.visible=false;g.add(m);return m});populate(g);return g}const segs=[];for(let i=0;i<N;i++){const g=make(-i*D);scene.add(g);segs.push(g)}function resize(){const w=frame.clientWidth,h=frame.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}new ResizeObserver(resize).observe(frame);resize();let last=performance.now();function animate(now){const dt=Math.min((now-last)/1000,1/30);last=now;scrollPos+=pressed?10:1;const want=-.05*scrollPos;camera.position.z+=.1*(want-camera.position.z);const span=N*D,z=camera.position.z;segs.forEach(seg=>{if(seg.position.z>z+D){let min=Math.min(...segs.map(s=>s.position.z));seg.position.z=min-D;populate(seg)}else if(seg.position.z<z-span-D){let max=Math.max(...segs.map(s=>s.position.z));seg.position.z=max+D;populate(seg)}});imgMats.forEach(m=>{if(m.map&&m.opacity<1)m.opacity=Math.min(1,m.opacity+dt)});renderer.render(scene,camera);requestAnimationFrame(animate)}requestAnimationFrame(animate);frame.addEventListener('pointerdown',()=>pressed=true);window.addEventListener('pointerup',()=>pressed=false)}

applyLang(detectLang());observeReveals();initTunnel();
