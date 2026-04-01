(function(){
  const STORAGE_KEY = 'dp_pagina3_state';

  const st = (typeof dpGetState === 'function') ? dpGetState() : { config:{business:{}}, products:[] };
  const cfg = (typeof dpGetConfig === 'function') ? dpGetConfig() : (st?.config || {});
  const business = cfg?.business || st?.config?.business || st?.meta?.business || {};
  const defaults = {
    businessName: business.name || 'Dinamita Gym',
    heroTitle: 'Explota tu potencial',
    heroSubtitle: 'Página 3.0 ahora ya se comporta como una web real con tienda, categoría y producto.',
    bannerPrimary: '',
    bannerSecondary: '',
    phone: business.phone || '',
    address: business.address || '',
    hours: '',
    maps: '',
    facebook: '',
    instagram: '',
    route: 'inicio',
    selectedCategory: '',
    selectedProductId: (st.products && st.products[0] && st.products[0].id) || '',
    limitCatalog: 8,
    search: '',
    cart: []
  };

  const state = loadState();
  const els = {
    businessName: document.getElementById('pg3-businessName'),
    heroTitle: document.getElementById('pg3-heroTitle'),
    heroSubtitle: document.getElementById('pg3-heroSubtitle'),
    bannerPrimaryFile: document.getElementById('pg3-bannerPrimaryFile'),
    bannerPrimaryPreview: document.getElementById('pg3-bannerPrimaryPreview'),
    bannerPrimaryClear: document.getElementById('pg3-bannerPrimaryClear'),
    bannerSecondaryFile: document.getElementById('pg3-bannerSecondaryFile'),
    bannerSecondaryPreview: document.getElementById('pg3-bannerSecondaryPreview'),
    bannerSecondaryClear: document.getElementById('pg3-bannerSecondaryClear'),
    phone: document.getElementById('pg3-phone'),
    address: document.getElementById('pg3-address'),
    hours: document.getElementById('pg3-hours'),
    maps: document.getElementById('pg3-maps'),
    facebook: document.getElementById('pg3-facebook'),
    instagram: document.getElementById('pg3-instagram'),
    limitCatalog: document.getElementById('pg3-limitCatalog'),
    search: document.getElementById('pg3-search'),
    routeLabel: document.getElementById('pg3-currentRouteLabel'),
    previewRoot: document.getElementById('pg3-previewRoot'),
    saveBtn: document.getElementById('pg3-saveBtn'),
    resetBtn: document.getElementById('pg3-resetBtn'),
    nav: document.getElementById('pg3-routeNav'),
    exportHtmlBtn: document.getElementById('pg3-exportHtmlBtn'),
    exportJsonBtn: document.getElementById('pg3-exportJsonBtn'),
    exportZipBtn: document.getElementById('pg3-exportZipBtn'),
    importJsonInput: document.getElementById('pg3-importJsonInput')
  };

  hydrateForm();
  bindEditor();
  renderPreview();

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return { ...defaults };
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed, cart: Array.isArray(parsed.cart) ? parsed.cart : [] };
    }catch(e){
      console.warn('Página 3.0 state error', e);
      return { ...defaults };
    }
  }

  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function hydrateForm(){
    els.businessName.value = state.businessName || '';
    els.heroTitle.value = state.heroTitle || '';
    els.heroSubtitle.value = state.heroSubtitle || '';
    setBannerPreview(els.bannerPrimaryPreview, state.bannerPrimary);
    setBannerPreview(els.bannerSecondaryPreview, state.bannerSecondary);
    els.phone.value = state.phone || '';
    els.address.value = state.address || '';
    els.hours.value = state.hours || '';
    els.maps.value = state.maps || '';
    els.facebook.value = state.facebook || '';
    els.instagram.value = state.instagram || '';
    els.limitCatalog.value = state.limitCatalog || 8;
    els.search.value = state.search || '';
    syncRouteButtons();
  }

  function bindEditor(){
    bindInput(els.businessName, 'businessName');
    bindInput(els.heroTitle, 'heroTitle');
    bindInput(els.heroSubtitle, 'heroSubtitle');
    bindImageInput(els.bannerPrimaryFile, 'bannerPrimary', els.bannerPrimaryPreview);
    bindImageInput(els.bannerSecondaryFile, 'bannerSecondary', els.bannerSecondaryPreview);
    els.bannerPrimaryClear.addEventListener('click', ()=>{ state.bannerPrimary=''; if(els.bannerPrimaryFile) els.bannerPrimaryFile.value=''; setBannerPreview(els.bannerPrimaryPreview,''); renderPreview(); saveState(); });
    els.bannerSecondaryClear.addEventListener('click', ()=>{ state.bannerSecondary=''; if(els.bannerSecondaryFile) els.bannerSecondaryFile.value=''; setBannerPreview(els.bannerSecondaryPreview,''); renderPreview(); saveState(); });
    bindInput(els.phone, 'phone');
    bindInput(els.address, 'address');
    bindInput(els.hours, 'hours');
    bindInput(els.maps, 'maps');
    bindInput(els.facebook, 'facebook');
    bindInput(els.instagram, 'instagram');
    els.limitCatalog.addEventListener('input', e=>{
      const n = Number(e.target.value || 8);
      state.limitCatalog = Math.max(4, Math.min(60, n));
      renderPreview();
    });
    bindInput(els.search, 'search');
    els.saveBtn.addEventListener('click', ()=>{ saveState(); alert('Página 3.0 guardada.'); });
    if(els.exportHtmlBtn) els.exportHtmlBtn.addEventListener('click', exportSingleHtml);
    if(els.exportJsonBtn) els.exportJsonBtn.addEventListener('click', exportJson);
    if(els.exportZipBtn) els.exportZipBtn.addEventListener('click', exportZipSite);
    if(els.importJsonInput) els.importJsonInput.addEventListener('change', importJsonFile);
    els.resetBtn.addEventListener('click', ()=>{
      Object.assign(state, JSON.parse(JSON.stringify(defaults)));
      hydrateForm();
      renderPreview();
      saveState();
    });
    els.nav.querySelectorAll('[data-route]').forEach(btn=>{
      btn.addEventListener('click', ()=> navigate(btn.dataset.route));
    });
  }

  function bindInput(el, key){
    el.addEventListener('input', e=>{ state[key] = e.target.value; renderPreview(); });
  }

  function bindImageInput(el, key, previewEl){
    if(!el) return;
    el.addEventListener('change', e=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      if(!file.type.startsWith('image/')){ alert('Archivo no es imagen.'); return; }
      const reader = new FileReader();
      reader.onload = ()=>{ state[key] = String(reader.result || ''); setBannerPreview(previewEl, state[key]); renderPreview(); saveState(); };
      reader.onerror = ()=> alert('No se pudo procesar la imagen.');
      reader.readAsDataURL(file);
    });
  }

  function setBannerPreview(el, src){
    if(!el) return;
    if(src){ el.src = src; el.style.display='block'; }
    else { el.removeAttribute('src'); el.style.display='none'; }
  }

  function navigate(route, opts={}){
    state.route = route;
    if(opts.category !== undefined) state.selectedCategory = opts.category;
    if(route !== 'tienda' && route !== 'categoria') state.search = state.search || '';
    if(opts.productId !== undefined) state.selectedProductId = opts.productId;
    syncRouteButtons();
    renderPreview();
  }

  function syncRouteButtons(){
    els.nav.querySelectorAll('[data-route]').forEach(btn=>{
      const active = btn.dataset.route === state.route;
      btn.classList.toggle('active', active);
      btn.classList.toggle('ghost', !active);
    });
  }

  function allProducts(){
    return Array.isArray(st.products) ? st.products.slice() : [];
  }

  function categories(){
    const set = new Set(allProducts().map(p=> normalizeCat(p.category)).filter(Boolean));
    return Array.from(set);
  }

  function normalizeCat(v){
    return String(v||'General').trim() || 'General';
  }

  function featuredProducts(){
    return filteredProducts().slice(0, Math.max(1, Number(state.limitCatalog||8)));
  }

  function filteredProducts(){
    const q = String(state.search || '').trim().toLowerCase();
    const selected = normalizeCat(state.selectedCategory || '');
    return allProducts().filter(p=>{
      const byCat = !selected || selected === 'General' ? true : normalizeCat(p.category) === selected;
      const hay = [p.name,p.sku,p.barcode,p.category].map(v=>String(v||'').toLowerCase()).join(' ');
      const bySearch = !q || hay.includes(q);
      return byCat && bySearch;
    });
  }

  function latestProducts(){
    return allProducts().slice().sort((a,b)=> String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))).slice(0,4);
  }

  function productsByCategory(cat){
    return allProducts().filter(p=> normalizeCat(p.category) === normalizeCat(cat));
  }

  function selectedProduct(){
    return allProducts().find(p=> p.id === state.selectedProductId) || allProducts()[0] || null;
  }

  function cartItems(){
    return Array.isArray(state.cart) ? state.cart : [];
  }

  function cartDetailedItems(){
    return cartItems().map(item => {
      const product = allProducts().find(p => p.id === item.id);
      if(!product) return null;
      const qty = Math.max(1, Number(item.qty || 1));
      const price = Number(product.price || 0);
      return { product, qty, subtotal: qty * price };
    }).filter(Boolean);
  }

  function cartCount(){
    return cartDetailedItems().reduce((acc, item) => acc + item.qty, 0);
  }

  function cartTotal(){
    return cartDetailedItems().reduce((acc, item) => acc + item.subtotal, 0);
  }

  function addToCart(productId){
    const product = allProducts().find(p => p.id === productId);
    if(!product) return;
    const existing = cartItems().find(item => item.id === productId);
    if(existing) existing.qty = Math.max(1, Number(existing.qty || 1) + 1);
    else state.cart.push({ id: productId, qty: 1 });
    saveState();
    renderPreview();
  }

  function updateCartQty(productId, delta){
    const item = cartItems().find(entry => entry.id === productId);
    if(!item) return;
    item.qty = Math.max(1, Number(item.qty || 1) + delta);
    saveState();
    renderPreview();
  }

  function removeFromCart(productId){
    state.cart = cartItems().filter(entry => entry.id !== productId);
    saveState();
    renderPreview();
  }

  function clearCart(){
    state.cart = [];
    saveState();
    renderPreview();
  }

  function normalizePhone(raw){
    const digits = String(raw || '').replace(/\D+/g,'');
    if(!digits) return '';
    if(digits.startsWith('521')) return digits;
    if(digits.startsWith('52') && digits.length === 12) return '521' + digits.slice(2);
    if(digits.length === 10) return '521' + digits;
    return digits;
  }

  function openWhatsApp(message){
    const phone = normalizePhone(state.phone || business.phone || '');
    if(!phone){
      alert('Captura un teléfono o WhatsApp válido en Página 3.0.');
      return;
    }
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function sendCartToWhatsApp(){
    const items = cartDetailedItems();
    if(!items.length){
      alert('Agrega productos al carrito para enviarlos.');
      return;
    }
    const lines = items.map(item => `- ${item.product.name} x${item.qty} ${money(item.subtotal)}`);
    const message = ['Hola, me interesa este pedido:', '', ...lines, '', `Total: ${money(cartTotal())}`].join('\n');
    openWhatsApp(message);
  }

  function importJsonFile(e){
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const parsed = JSON.parse(String(reader.result||'{}'));
        const incoming = parsed.state || parsed.pageState || parsed.page || parsed;
        if(!incoming || typeof incoming !== 'object') throw new Error('Formato inválido');
        Object.assign(state, JSON.parse(JSON.stringify(defaults)), incoming);
        if(!Array.isArray(state.cart)) state.cart = [];
        hydrateForm();
        renderPreview();
        saveState();
        alert('JSON importado correctamente.');
      }catch(err){
        console.warn(err);
        alert('No se pudo importar el JSON. Verifica que sea un respaldo válido.');
      }finally{
        e.target.value='';
      }
    };
    reader.onerror = ()=> alert('No se pudo leer el archivo JSON.');
    reader.readAsText(file,'utf-8');
  }

  function exportJson(){
    const payload = { state: buildExportState(), exportedAt: new Date().toISOString(), version: 'V30.5' };
    downloadFile('pagina3-respaldo.json', 'application/json;charset=utf-8', JSON.stringify(payload,null,2));
  }

  function exportSingleHtml(){
    try{
      const html = buildStandaloneHtml();
      downloadFile('pagina3-sitio.html', 'text/html;charset=utf-8', html);
    }catch(err){
      console.warn(err);
      alert('No se pudo generar la página HTML.');
    }
  }

  function exportZipSite(){
    try{
      const files = buildZipFiles();
      const zipBytes = createZip(files);
      const blob = new Blob([zipBytes], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pagina3-web.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=> URL.revokeObjectURL(url), 1000);
    }catch(err){
      console.warn(err);
      alert('No se pudo generar el ZIP web.');
    }
  }

  function buildExportState(){
    return {
      businessName: state.businessName,
      heroTitle: state.heroTitle,
      heroSubtitle: state.heroSubtitle,
      bannerPrimary: state.bannerPrimary || '',
      bannerSecondary: state.bannerSecondary || '',
      phone: state.phone || business.phone || '',
      address: state.address || business.address || '',
      hours: state.hours || '',
      maps: state.maps || '',
      facebook: state.facebook || '',
      instagram: state.instagram || '',
      limitCatalog: state.limitCatalog || 8,
      logo: business.logo || cfg?.business?.logo || st?.config?.business?.logo || '',
      products: allProducts().map(p => ({
        id: p.id, name: p.name, price: Number(p.price||0), stock: Number(p.stock||0),
        sku: p.sku || '', barcode: p.barcode || '', category: normalizeCat(p.category),
        image: p.image || p.photo || p.imageUrl || '', description: productDescription(p)
      }))
    };
  }

  function buildZipFiles(){
    const payload = buildExportState();
    const appJs = buildExportAppJs();
    const stylesCss = buildExportStyles();
    return [
      { name:'index.html', content: buildExportPageHtml('inicio', payload, stylesCss, appJs) },
      { name:'tienda.html', content: buildExportPageHtml('tienda', payload, stylesCss, appJs) },
      { name:'categoria.html', content: buildExportPageHtml('categoria', payload, stylesCss, appJs) },
      { name:'producto.html', content: buildExportPageHtml('producto', payload, stylesCss, appJs) },
      { name:'assets/styles.css', content: stylesCss },
      { name:'assets/app.js', content: appJs },
      { name:'data/data.js', content: 'window.__PAGINA3_DATA__ = ' + JSON.stringify(payload) + ';' },
      { name:'data/data.json', content: JSON.stringify(payload,null,2) }
    ];
  }

  function buildStandaloneHtml(){
    const payload = buildExportState();
    return buildExportPageHtml('inicio', payload, buildExportStyles(), buildExportAppJs());
  }

  function buildExportPageHtml(pageName, payload, stylesCss, appJs){
    const title = escapeHtml(payload.businessName || 'Página 3.0');
    return `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><style>${stylesCss}</style></head><body data-page="${pageName}"><div id="app"></div><script>window.__PAGINA3_DATA__=${JSON.stringify(payload)};<\/script><script>${appJs}<\/script></body></html>`;
  }

  function buildExportStyles(){
    return `:root{--red:#c00000;--soft:#fff5f5;--line:#ececec;--text:#222}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#fafafa;color:var(--text)}.site{min-height:100vh;display:flex;flex-direction:column}.top{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}.wrap{max-width:1180px;margin:0 auto;padding:16px}.brand{display:flex;align-items:center;gap:12px}.brand img{width:52px;height:52px;object-fit:contain;border-radius:12px;background:#fff}.brandMark{width:52px;height:52px;border-radius:12px;background:var(--soft);display:grid;place-items:center;font-weight:800;color:var(--red)}.nav{display:flex;gap:10px;flex-wrap:wrap}.nav a{padding:10px 12px;border-radius:10px;text-decoration:none;color:#555;font-weight:700}.nav a.active,.nav a:hover{background:var(--soft);color:var(--red)}.topRow{display:flex;justify-content:space-between;align-items:center;gap:16px}.hero{padding:36px 0;background:linear-gradient(135deg,#fff 0%,#fff5f5 100%)}.heroGrid{display:grid;gap:18px}.heroBox{background:#fff;border:1px solid var(--line);border-radius:22px;overflow:hidden}.heroMedia{min-height:340px;background:#f4f4f4;display:grid;place-items:center}.heroMedia img{width:100%;height:100%;object-fit:cover;display:block}.heroBody{padding:24px}.hero h1{margin:0 0 10px;font-size:40px}.hero p{margin:0 0 18px;color:#555;max-width:720px}.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{border:none;background:var(--red);color:#fff;padding:12px 16px;border-radius:12px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.btn:hover{filter:brightness(.95)}.btn.secondary{background:#fff;color:var(--red);border:1px solid #f0b0b0}.section{padding:22px 0}.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px}.section h2{margin:0 0 14px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.product{display:grid;gap:10px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px}.media{height:160px;border-radius:14px;background:linear-gradient(135deg,#fff1f1,#f0f0f0);display:grid;place-items:center;overflow:hidden}.media img{width:100%;height:100%;object-fit:cover}.pillRow{display:flex;gap:8px;flex-wrap:wrap}.pill{padding:9px 12px;border:1px solid #f0b0b0;background:#fff1f1;color:var(--red);border-radius:999px;text-decoration:none;font-weight:700;font-size:12px}.pill.active{background:var(--red);color:#fff}.price{font-weight:800}.stock{font-size:12px;color:#666}.search{width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:12px}.tools{display:grid;gap:10px;margin-bottom:14px}.cart{position:sticky;bottom:0;background:#fff;border-top:1px solid var(--line);box-shadow:0 -10px 24px rgba(0,0,0,.08)}.cartInner{max-width:1180px;margin:0 auto;padding:16px;display:grid;gap:12px}.cartItem{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #f4f4f4}.cartActions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.muted{color:#666}.empty{padding:18px;border:1px dashed #ead1d1;border-radius:14px;background:#fff}.contactGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.footer{margin-top:auto;background:#fff;border-top:1px solid var(--line);padding:18px 0;color:#666}.floatingWa{position:fixed;right:18px;bottom:18px;z-index:10}.detail{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}.detail .media{height:320px}.meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.tag{padding:8px 10px;border-radius:999px;background:#f6f6f6;font-size:12px;font-weight:700}.mini{font-size:12px;color:#777}@media(max-width:900px){.topRow{flex-direction:column;align-items:flex-start}.detail{grid-template-columns:1fr}.hero h1{font-size:32px}}`;
  }

  function buildExportAppJs(){
    return String.raw`(function(){const data=window.__PAGINA3_DATA__||{};const page=document.body.dataset.page||'inicio';const qs=new URLSearchParams(location.search);const app=document.getElementById('app');const cartKey='pagina3_export_cart';const state={search:'',category:qs.get('cat')||'',productId:qs.get('id')||'',cart:loadCart()};function products(){return Array.isArray(data.products)?data.products:[]}function categories(){return Array.from(new Set(products().map(p=>String(p.category||'General'))))}function money(v){const n=Number(v||0);try{return n.toLocaleString('es-MX',{style:'currency',currency:'MXN'})}catch(e){return '$'+n.toFixed(2)}}function phone(){const digits=String(data.phone||'').replace(/\D+/g,'');if(!digits)return'';if(digits.startsWith('521'))return digits;if(digits.startsWith('52')&&digits.length===12)return '521'+digits.slice(2);if(digits.length===10)return '521'+digits;return digits}function wa(msg){const p=phone();if(!p){alert('Configura primero el teléfono/WhatsApp.');return}window.open('https://api.whatsapp.com/send?phone='+p+'&text='+encodeURIComponent(msg),'_blank','noopener,noreferrer')}function loadCart(){try{return JSON.parse(localStorage.getItem(cartKey)||'[]')}catch(e){return[]}}function saveCart(){localStorage.setItem(cartKey,JSON.stringify(state.cart))}function addToCart(id){const ex=state.cart.find(i=>i.id===id);if(ex)ex.qty+=1;else state.cart.push({id,qty:1});saveCart();render()}function changeQty(id,delta){const it=state.cart.find(i=>i.id===id);if(!it)return;it.qty=Math.max(1,Number(it.qty||1)+delta);saveCart();render()}function removeItem(id){state.cart=state.cart.filter(i=>i.id!==id);saveCart();render()}function clearCart(){state.cart=[];saveCart();render()}function cartRows(){return state.cart.map(i=>{const p=products().find(x=>x.id===i.id);if(!p)return null;return {p,qty:i.qty,subtotal:Number(p.price||0)*Number(i.qty||1)}}).filter(Boolean)}function cartTotal(){return cartRows().reduce((a,b)=>a+b.subtotal,0)}function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}function media(p){return p&&p.image?'<img src="'+esc(p.image)+'" alt="'+esc(p.name)+'">':'<span>'+esc((p.name||'PR').split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'DG')+'</span>'}function header(){const logo=data.logo?'<img src="'+esc(data.logo)+'" alt="logo">':'<div class="brandMark">'+esc((data.businessName||'DG').split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase())+'</div>';return '<header class="top"><div class="wrap topRow"><div class="brand">'+logo+'<div><strong>'+esc(data.businessName||'Dinamita Gym')+'</strong><div class="mini">Tienda web</div></div></div><nav class="nav"><a class="'+(page==='inicio'?'active':'')+'" href="index.html">Inicio</a><a class="'+(page==='tienda'?'active':'')+'" href="tienda.html">Tienda</a><a class="'+(page==='categoria'?'active':'')+'" href="categoria.html">Categoría</a><a class="'+(page==='producto'?'active':'')+'" href="producto.html">Producto</a></nav></div></header>'}function hero(){let mediaHtml='';if(data.bannerPrimary){mediaHtml='<div class="heroMedia"><img src="'+esc(data.bannerPrimary)+'" alt="banner"></div>'}return '<section class="hero"><div class="wrap heroGrid"><div class="heroBox">'+mediaHtml+'<div class="heroBody"><h1>'+esc(data.heroTitle||'Explota tu potencial')+'</h1><p>'+esc(data.heroSubtitle||'Catálogo real conectado a tu negocio.')+'</p><div class="actions"><button class="btn" data-wa="hero">Entrenar ahora</button><a class="btn secondary" href="tienda.html">Ir a tienda</a></div></div></div>'+(data.bannerSecondary?'<div class="heroBox"><div class="heroMedia"><img src="'+esc(data.bannerSecondary)+'" alt="banner secundario"></div></div>':'')+'</div></section>'}function productCard(p){return '<article class="product"><div class="media">'+media(p)+'</div><div class="mini">'+esc(p.category||'General')+'</div><strong>'+esc(p.name)+'</strong><div class="price">'+money(p.price)+'</div><div class="stock">'+Number(p.stock||0)+' pzs</div><div class="actions"><button class="btn" data-add="'+esc(p.id)+'">Agregar</button><button class="btn secondary" data-wa-product="'+esc(p.id)+'">WhatsApp</button><a class="btn secondary" href="producto.html?id='+encodeURIComponent(p.id)+'">Ver detalle</a></div></article>'}function home(){const featured=products().slice(0,4);const latest=products().slice(0,4);return '<section class="section"><div class="wrap"><div class="card"><h2>Categorías</h2><div class="pillRow">'+categories().map(c=>'<a class="pill" href="categoria.html?cat='+encodeURIComponent(c)+'">'+esc(c)+'</a>').join('')+'</div></div></div></section><section class="section"><div class="wrap"><div class="card"><h2>Productos destacados</h2><div class="grid">'+(featured.length?featured.map(productCard).join(''):'<div class="empty">No hay productos.</div>')+'</div></div></div></section><section class="section"><div class="wrap"><div class="card"><h2>Nuevos productos</h2><div class="grid">'+(latest.length?latest.map(productCard).join(''):'<div class="empty">No hay productos.</div>')+'</div></div></div></section>'}function tienda(){const q=(state.search||'').toLowerCase();const cat=state.category;const list=products().filter(p=>{const byCat=!cat||String(p.category||'General')===cat;const hay=[p.name,p.sku,p.barcode,p.category].join(' ').toLowerCase();const byQ=!q||hay.includes(q);return byCat&&byQ}).slice(0,Math.max(1,Number(data.limitCatalog||8)));return '<section class="section"><div class="wrap"><div class="card"><h2>Tienda</h2><div class="tools"><input class="search" placeholder="Buscar producto..." value="'+esc(state.search||'')+'" data-search><div class="pillRow"><button class="pill '+(!cat?'active':'')+'" data-cat="">Todo</button>'+categories().map(c=>'<button class="pill '+(cat===c?'active':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div><div class="mini">Mostrando '+list.length+' producto(s).</div></div><div class="grid">'+(list.length?list.map(productCard).join(''):'<div class="empty">No hay productos con ese filtro.</div>')+'</div></div></div></section>'}function categoria(){const cat=state.category||categories()[0]||'';const list=products().filter(p=>String(p.category||'General')===cat);return '<section class="section"><div class="wrap"><div class="card"><h2>Categoría: '+esc(cat||'General')+'</h2><div class="pillRow">'+categories().map(c=>'<a class="pill '+(cat===c?'active':'')+'" href="categoria.html?cat='+encodeURIComponent(c)+'">'+esc(c)+'</a>').join('')+'</div><div class="grid" style="margin-top:14px">'+(list.length?list.map(productCard).join(''):'<div class="empty">No hay productos en esta categoría.</div>')+'</div></div></div></section>'}function producto(){const id=state.productId||products()[0]?.id||'';const p=products().find(x=>x.id===id)||products()[0];if(!p)return '<section class="section"><div class="wrap"><div class="empty">No hay producto.</div></div></section>';return '<section class="section"><div class="wrap"><div class="card detail"><div class="media">'+media(p)+'</div><div><div class="meta"><span class="tag">'+esc(p.category||'General')+'</span><span class="tag">SKU '+esc(p.sku||'—')+'</span></div><h2>'+esc(p.name)+'</h2><p class="muted">'+esc(p.description||'Producto del catálogo.')+'</p><div class="price" style="margin:10px 0">'+money(p.price)+'</div><div class="muted">Stock: '+Number(p.stock||0)+' pzs</div><div class="actions" style="margin-top:14px"><button class="btn" data-add="'+esc(p.id)+'">Agregar</button><button class="btn secondary" data-wa-product="'+esc(p.id)+'">Comprar por WhatsApp</button></div></div></div></div></section>'}function contact(){return '<section class="section"><div class="wrap"><div class="card"><h2>Contacto</h2><div class="contactGrid"><div><strong>Teléfono</strong><div class="muted">'+esc(data.phone||'Sin definir')+'</div></div><div><strong>Dirección</strong><div class="muted">'+esc(data.address||'Sin definir')+'</div></div><div><strong>Horario</strong><div class="muted">'+esc(data.hours||'Sin definir')+'</div></div><div><strong>Catálogo</strong><div class="muted">'+products().length+' productos · '+categories().length+' categorías</div></div></div><div class="actions" style="margin-top:14px">'+(data.maps?'<a class="btn secondary" target="_blank" rel="noopener" href="'+esc(data.maps)+'">Google Maps</a>':'')+(data.facebook?'<a class="btn secondary" target="_blank" rel="noopener" href="'+esc(data.facebook)+'">Facebook</a>':'')+(data.instagram?'<a class="btn secondary" target="_blank" rel="noopener" href="'+esc(data.instagram)+'">Instagram</a>':'')+'<button class="btn" data-wa="contacto">Escríbenos por WhatsApp</button></div></div></div></section>'}function cart(){const rows=cartRows();return '<div class="cart"><div class="cartInner"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><strong>Carrito</strong><div class="mini">'+(rows.length?rows.reduce((a,b)=>a+b.qty,0)+' producto(s) agregados':'Agrega productos desde la tienda')+'</div></div><strong>'+money(cartTotal())+'</strong></div>'+(rows.length?'<div>'+rows.map(r=>'<div class="cartItem"><div><strong>'+esc(r.p.name)+'</strong><div class="mini">'+esc(r.p.category||'General')+'</div></div><div class="cartActions"><button class="btn secondary" data-qty="-1" data-id="'+esc(r.p.id)+'">-</button><span>'+r.qty+'</span><button class="btn secondary" data-qty="1" data-id="'+esc(r.p.id)+'">+</button><strong>'+money(r.subtotal)+'</strong><button class="btn secondary" data-remove="'+esc(r.p.id)+'">Quitar</button></div></div>').join('')+'</div><div class="actions"><button class="btn secondary" data-clear>Vaciar</button><button class="btn" data-wa="carrito">Enviar por WhatsApp</button></div>':'<div class="empty">Tu carrito está vacío.</div>')+'</div></div>'}function footer(){return '<footer class="footer"><div class="wrap">Página exportada desde Dinamita POS · Página 3.0</div></footer>'}function render(){let main='';if(page==='tienda')main=tienda();else if(page==='categoria')main=categoria();else if(page==='producto')main=producto();else main=home();app.innerHTML='<div class="site">'+header()+hero()+main+contact()+cart()+footer()+'<button class="btn floatingWa" data-wa="flotante">WhatsApp</button></div>';bind()}function bind(){app.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addToCart(b.dataset.add)));app.querySelectorAll('[data-qty]').forEach(b=>b.addEventListener('click',()=>changeQty(b.dataset.id,Number(b.dataset.qty||0))));app.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>removeItem(b.dataset.remove)));const clear=app.querySelector('[data-clear]');if(clear)clear.addEventListener('click',clearCart);app.querySelectorAll('[data-wa]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.wa==='carrito'){const rows=cartRows();if(!rows.length){alert('Tu carrito está vacío.');return}const lines=['Hola, quiero hacer este pedido:','',...rows.map(r=>'- '+r.p.name+' x'+r.qty+' '+money(r.subtotal)),'','Total: '+money(cartTotal())];wa(lines.join('\n'));return}const msg=b.dataset.wa==='hero'?'Hola, me interesa entrenar y conocer sus productos.':b.dataset.wa==='contacto'?'Hola, me interesa información del negocio.':'Hola, me interesa hacer una compra.';wa(msg)}));app.querySelectorAll('[data-wa-product]').forEach(b=>b.addEventListener('click',()=>{const p=products().find(x=>x.id===b.dataset.waProduct);if(!p)return;wa('Hola, me interesa:\n'+p.name+'\nPrecio: '+money(p.price))}));const search=app.querySelector('[data-search]');if(search){search.addEventListener('keydown',e=>{if(e.key==='Enter')e.preventDefault()});search.addEventListener('input',e=>{const v=e.target.value||'';const ss=e.target.selectionStart||v.length;const se=e.target.selectionEnd||v.length;state.search=v;render();const ns=app.querySelector('[data-search]');if(ns){ns.focus({preventScroll:true});try{ns.setSelectionRange(Math.min(ss,ns.value.length),Math.min(se,ns.value.length))}catch(_e){}}})};app.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click',()=>{state.category=b.dataset.cat||'';render()}))}render();})();`;
  }

  function downloadFile(filename, type, content){
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=> URL.revokeObjectURL(url), 1000);
  }

  function createZip(files){
    const encoder = new TextEncoder();
    const entries = [];
    let localOffset = 0;
    const chunks = [];
    for(const file of files){
      const nameBytes = encoder.encode(file.name);
      const dataBytes = file.content instanceof Uint8Array ? file.content : encoder.encode(String(file.content));
      const crc = crc32(dataBytes);
      const local = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(local.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint32(14, crc >>> 0, true);
      view.setUint32(18, dataBytes.length, true);
      view.setUint32(22, dataBytes.length, true);
      view.setUint16(26, nameBytes.length, true);
      view.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      chunks.push(local, dataBytes);
      entries.push({ nameBytes, dataBytes, crc, offset: localOffset });
      localOffset += local.length + dataBytes.length;
    }
    const centralStart = localOffset;
    let centralSize = 0;
    for(const e of entries){
      const central = new Uint8Array(46 + e.nameBytes.length);
      const view = new DataView(central.buffer);
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint16(14, 0, true);
      view.setUint32(16, e.crc >>> 0, true);
      view.setUint32(20, e.dataBytes.length, true);
      view.setUint32(24, e.dataBytes.length, true);
      view.setUint16(28, e.nameBytes.length, true);
      view.setUint16(30, 0, true);
      view.setUint16(32, 0, true);
      view.setUint16(34, 0, true);
      view.setUint16(36, 0, true);
      view.setUint32(38, 0, true);
      view.setUint32(42, e.offset, true);
      central.set(e.nameBytes, 46);
      chunks.push(central);
      centralSize += central.length;
    }
    const end = new Uint8Array(22);
    const view = new DataView(end.buffer);
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, entries.length, true);
    view.setUint16(10, entries.length, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, centralStart, true);
    view.setUint16(20, 0, true);
    chunks.push(end);
    const total = chunks.reduce((a,b)=> a + b.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    chunks.forEach(chunk => { out.set(chunk, offset); offset += chunk.length; });
    return out;
  }

  const __crcTable = (()=>{
    const table = new Uint32Array(256);
    for(let i=0;i<256;i++){
      let c = i;
      for(let k=0;k<8;k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c >>> 0;
    }
    return table;
  })();
  function crc32(bytes){
    let c = 0 ^ (-1);
    for(let i=0;i<bytes.length;i++) c = (c >>> 8) ^ __crcTable[(c ^ bytes[i]) & 0xFF];
    return (c ^ (-1)) >>> 0;
  }

  function renderPreview(){
    const categoryLabel = state.route === 'categoria' ? ` · ${state.selectedCategory || 'Sin categoría'}` : '';
    els.routeLabel.textContent = `Ruta actual: ${routeName(state.route)}${categoryLabel}`;
    els.previewRoot.innerHTML = `
      <div class="pg3-web">
        ${renderHeader()}
        ${renderHero()}
        <div class="pg3-content">
          ${renderCurrentRoute()}
          ${renderCarritoPanel()}
          ${renderContacto()}
        </div>
        ${renderFooter()}
      </div>
    `;
    bindPreviewNav();
  }

  function bindPreviewNav(){
    els.previewRoot.querySelectorAll('[data-preview-route]').forEach(btn=>{
      btn.addEventListener('click', ()=> navigate(btn.dataset.previewRoute, {
        category: btn.dataset.category,
        productId: btn.dataset.productId
      }));
    });
    const search = els.previewRoot.querySelector('[data-preview-search]');
    if(search){
      search.addEventListener('keydown', e=>{
        if(e.key === 'Enter') e.preventDefault();
      });
      search.addEventListener('input', e=>{
        const nextValue = e.target.value || '';
        const selStart = e.target.selectionStart || nextValue.length;
        const selEnd = e.target.selectionEnd || nextValue.length;
        const scrollY = window.scrollY;
        state.search = nextValue;
        if(state.route !== 'tienda') state.route = 'tienda';
        renderPreview();
        const nextSearch = els.previewRoot.querySelector('[data-preview-search]');
        if(nextSearch){
          nextSearch.focus({ preventScroll: true });
          const pos = Math.min(selStart, nextSearch.value.length);
          const posEnd = Math.min(selEnd, nextSearch.value.length);
          try{ nextSearch.setSelectionRange(pos, posEnd); }catch(_e){}
        }
        window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
      });
    }
    els.previewRoot.querySelectorAll('[data-add-cart]').forEach(btn => {
      btn.addEventListener('click', () => addToCart(btn.dataset.addCart));
    });
    els.previewRoot.querySelectorAll('[data-cart-delta]').forEach(btn => {
      btn.addEventListener('click', () => updateCartQty(btn.dataset.cartId, Number(btn.dataset.cartDelta || 0)));
    });
    els.previewRoot.querySelectorAll('[data-cart-remove]').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.cartRemove));
    });
    const clearBtn = els.previewRoot.querySelector('[data-cart-clear]');
    if(clearBtn) clearBtn.addEventListener('click', clearCart);
    const sendBtn = els.previewRoot.querySelector('[data-cart-send]');
    if(sendBtn) sendBtn.addEventListener('click', sendCartToWhatsApp);
    els.previewRoot.querySelectorAll('[data-product-wa]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = allProducts().find(item => item.id === btn.dataset.productWa);
        if(!p) return;
        openWhatsApp(`Hola, me interesa:\n${p.name}\nPrecio: ${money(p.price)}`);
      });
    });
  }

  function renderHeader(){
    const logo = business.logoDataUrl || st?.config?.business?.logoDataUrl || st?.meta?.business?.logoDataUrl || '';
    const logoHtml = logo ? `<img class="pg3-logo" src="${escapeHtmlAttr(logo)}" alt="Logo">` : `<div class="pg3-logoFallback">${escapeHtml(initials(state.businessName))}</div>`;
    return `
      <header class="pg3-webHeader">
        <div class="pg3-webBrand">
          <div class="pg3-webBrandRow">${logoHtml}<div><strong>${escapeHtml(state.businessName)}</strong><small>Página 3.0 · Router funcional</small></div></div>
        </div>
        <nav class="pg3-webNav">
          ${navBtn('inicio','Inicio')}
          ${navBtn('tienda','Tienda')}
          ${navBtn('categoria','Categoría')}
          ${navBtn('producto','Producto')}
        </nav>
      </header>`;
  }

  function navBtn(route,label){
    const active = state.route === route ? 'active' : '';
    return `<button type="button" class="${active}" data-preview-route="${route}">${label}</button>`;
  }

  function renderHero(){
    const primaryStyle = state.bannerPrimary ? `style="background-image:url('${escapeHtmlAttr(state.bannerPrimary)}')"` : '';
    const secondary = state.bannerSecondary ? `
      <div class="pg3-heroSecondary" style="background-image:url('${escapeHtmlAttr(state.bannerSecondary)}')"></div>` : '';
    return `
      <section class="pg3-heroWrap">
        <section class="pg3-hero pg3-hero--media" ${primaryStyle}>
          <div class="pg3-heroOverlay">
            <small>Estructura primero · Diseño después</small>
            <h2>${escapeHtml(state.heroTitle)}</h2>
            <p>${escapeHtml(state.heroSubtitle)}</p>
            <div class="pg3-heroActions">
              <button type="button" class="btn" data-preview-route="tienda">Ir a tienda</button>
              <button type="button" class="btn ghost" data-preview-route="categoria" data-category="${escapeHtmlAttr(categories()[0] || '')}">Ver categoría</button>
            </div>
          </div>
        </section>${secondary}
      </section>`;
  }

  function renderCurrentRoute(){
    switch(state.route){
      case 'tienda': return renderTienda();
      case 'categoria': return renderCategoria();
      case 'producto': return renderProducto();
      default: return renderInicio();
    }
  }

  function renderInicio(){
    const cats = categories();
    return `
      <section class="pg3-panel">
        <h3>Página principal</h3>
        <p>Home base conectado a tu catálogo real de la TPV.</p>
      </section>
      <section class="pg3-panel">
        <h3>Categorías detectadas</h3>
        <div class="pg3-cats">
          ${cats.length ? cats.map(cat=> `<button type="button" class="pg3-pill" data-preview-route="categoria" data-category="${escapeHtmlAttr(cat)}">${escapeHtml(cat)}</button>`).join('') : '<div class="pg3-empty">No hay categorías todavía.</div>'}
        </div>
      </section>
      <section class="pg3-panel">
        <h3>Productos destacados</h3>
        <div class="pg3-products">${featuredProducts().slice(0,4).map(productCard).join('') || '<div class="pg3-empty">No hay productos.</div>'}</div>
      </section>`;
  }

  function renderTienda(){
    const cats = categories();
    const items = filteredProducts().slice(0, Math.max(1, Number(state.limitCatalog||8)));
    return `
      <section class="pg3-panel">
        <h3>Tienda</h3>
        <p>Catálogo conectado a productos reales de la TPV con buscador y filtro activo.</p>
        <div class="pg3-tools">
          <input class="pg3-search" type="text" value="${escapeHtmlAttr(state.search || '')}" placeholder="Buscar producto..." data-preview-search>
          <div class="pg3-cats">
            <button type="button" class="pg3-pill ${!state.selectedCategory ? 'active' : ''}" data-preview-route="tienda" data-category="">Todo</button>
            ${cats.map(c=> `<button type="button" class="pg3-pill ${normalizeCat(c)===normalizeCat(state.selectedCategory||'') ? 'active' : ''}" data-preview-route="tienda" data-category="${escapeHtmlAttr(c)}">${escapeHtml(c)}</button>`).join('')}
          </div>
          <div class="pg3-count">Mostrando ${items.length} producto(s)${state.selectedCategory ? ` de ${escapeHtml(state.selectedCategory)}` : ''}${state.search ? ` que coinciden con "${escapeHtml(state.search)}"` : ''}.</div>
        </div>
        <div class="pg3-products">${items.map(productCard).join('') || '<div class="pg3-empty">No hay productos con ese filtro.</div>'}</div>
      </section>`;
  }

  function renderCategoria(){
    const cat = state.selectedCategory || categories()[0] || '';
    const items = productsByCategory(cat);
    return `
      <section class="pg3-panel">
        <h3>Categoría: ${escapeHtml(cat || 'Sin categoría')}</h3>
        <p>Vista preparada para mostrar todos los productos filtrados por categoría.</p>
        <div class="pg3-cats">${categories().map(c=> `<button type="button" class="pg3-pill" data-preview-route="categoria" data-category="${escapeHtmlAttr(c)}">${escapeHtml(c)}</button>`).join('')}</div>
      </section>
      <section class="pg3-panel">
        <div class="pg3-products">${items.map(productCard).join('') || '<div class="pg3-empty">No hay productos en esta categoría.</div>'}</div>
      </section>`;
  }

  function renderProducto(){
    const p = selectedProduct();
    if(!p){
      return `<section class="pg3-panel"><div class="pg3-empty">No hay producto seleccionado.</div></section>`;
    }
    const desc = productDescription(p);
    return `
      <section class="pg3-panel pg3-split">
        <div>
          <div class="pg3-productMedia pg3-productMedia--detail">${productMediaHtml(p)}</div>
        </div>
        <div>
          <div class="pg3-productMeta">
            <span class="pg3-tag">${escapeHtml(normalizeCat(p.category))}</span>
            <span class="pg3-tag">SKU ${escapeHtml(p.sku || '—')}</span>
          </div>
          <h3>${escapeHtml(p.name || 'Producto')}</h3>
          <p class="pg3-productDesc">${escapeHtml(desc)}</p>
          <dl class="pg3-kv">
            <dt>Precio</dt><dd>${money(p.price)}</dd>
            <dt>Stock</dt><dd>${Number(p.stock||0)} pzs</dd>
            <dt>SKU</dt><dd>${escapeHtml(p.sku || '—')}</dd>
            <dt>Código</dt><dd>${escapeHtml(p.barcode || '—')}</dd>
            <dt>Categoría</dt><dd>${escapeHtml(normalizeCat(p.category))}</dd>
          </dl>
          <div class="pg3-detailActions">
            <button type="button" class="btn ghost" data-preview-route="categoria" data-category="${escapeHtmlAttr(normalizeCat(p.category))}">Ver categoría</button>
            <button type="button" class="btn" data-preview-route="tienda">Volver a tienda</button>
          </div>
          <div class="pg3-miniNote">Producto tomado del catálogo real de la TPV.</div>
        </div>
      </section>`;
  }

  function productCard(p){
    return `
      <article class="pg3-product">
        <div class="pg3-productMedia">${productMediaHtml(p)}</div>
        <div class="pg3-productTop">
          <small>${escapeHtml(normalizeCat(p.category))}</small>
          <span class="pg3-stock">${Number(p.stock||0)} pzs</span>
        </div>
        <strong>${escapeHtml(p.name || 'Producto')}</strong>
        <span class="pg3-price">${money(p.price)}</span>
        <div class="pg3-productActions">
          <button type="button" class="btn" data-add-cart="${escapeHtmlAttr(p.id)}">Agregar</button>
          <button type="button" class="btn ghost" data-product-wa="${escapeHtmlAttr(p.id)}">WhatsApp</button>
          <button type="button" class="btn ghost" data-preview-route="producto" data-product-id="${escapeHtmlAttr(p.id)}">Ver</button>
        </div>
      </article>`;
  }

  function productMediaHtml(p){
    if(p && p.image){
      return `<img class="pg3-productImg" src="${escapeHtmlAttr(p.image)}" alt="${escapeHtmlAttr(p.name || 'Producto')}">`;
    }
    return `<span class="pg3-productPlaceholder">${productMediaLabel(p)}</span>`;
  }

  function productMediaLabel(p){
    const words = String(p.name||'PR').trim().split(/\s+/).slice(0,2);
    return escapeHtml(words.map(w=> w[0]?.toUpperCase() || '').join('') || 'DG');
  }

  function initials(name){
    const words = String(name || 'DG').trim().split(/\s+/).slice(0,2);
    return words.map(w=> w[0]?.toUpperCase() || '').join('') || 'DG';
  }

  function productDescription(p){
    const cat = normalizeCat(p.category);
    const stock = Number(p.stock||0);
    return `${p.name || 'Producto'} pertenece a la categoría ${cat} y actualmente cuenta con ${stock} pieza(s) disponibles en el catálogo.`;
  }

  function renderCarritoPanel(){
    const items = cartDetailedItems();
    return `
      <section class="pg3-panel">
        <div class="pg3-cartHead">
          <div>
            <h3>Carrito</h3>
            <p>${items.length ? `${cartCount()} producto(s) agregados.` : 'Agrega productos desde la tienda para empezar tu pedido.'}</p>
          </div>
          <span class="pg3-tag">${money(cartTotal())}</span>
        </div>
        ${items.length ? `
          <div class="pg3-cartList">
            ${items.map(item => `
              <article class="pg3-cartItem">
                <div>
                  <strong>${escapeHtml(item.product.name)}</strong>
                  <small>${escapeHtml(normalizeCat(item.product.category))}</small>
                </div>
                <div class="pg3-cartActions">
                  <button type="button" class="btn ghost" data-cart-delta="-1" data-cart-id="${escapeHtmlAttr(item.product.id)}">-</button>
                  <span>${item.qty}</span>
                  <button type="button" class="btn ghost" data-cart-delta="1" data-cart-id="${escapeHtmlAttr(item.product.id)}">+</button>
                  <strong>${money(item.subtotal)}</strong>
                  <button type="button" class="btn ghost" data-cart-remove="${escapeHtmlAttr(item.product.id)}">Quitar</button>
                </div>
              </article>
            `).join('')}
          </div>
          <div class="pg3-cartFooter">
            <button type="button" class="btn ghost" data-cart-clear>Vaciar</button>
            <button type="button" class="btn" data-cart-send>Enviar por WhatsApp</button>
          </div>
        ` : `<div class="pg3-empty">Tu carrito está vacío.</div>`}
      </section>`;
  }

  function renderContacto(){
    return `
      <section class="pg3-panel">
        <h3>Contacto</h3>
        <p>Base de contacto reforzada para una página real del negocio.</p>
        <div class="pg3-contactGrid">
          <div class="pg3-contactCard"><strong>Teléfono</strong><span>${escapeHtml(state.phone || 'Sin definir')}</span></div>
          <div class="pg3-contactCard"><strong>Dirección</strong><span>${escapeHtml(state.address || 'Sin definir')}</span></div>
          <div class="pg3-contactCard"><strong>Horario</strong><span>${escapeHtml(state.hours || 'Sin definir')}</span></div>
          <div class="pg3-contactCard"><strong>Cobertura</strong><span>${allProducts().length} productos · ${categories().length} categorías</span></div>
        </div>
        <div class="pg3-contactActions">
          ${state.maps ? `<a class="btn ghost" href="${escapeHtmlAttr(state.maps)}" target="_blank" rel="noopener">Google Maps</a>` : ''}
          ${state.facebook ? `<a class="btn ghost" href="${escapeHtmlAttr(state.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}
          ${state.instagram ? `<a class="btn ghost" href="${escapeHtmlAttr(state.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}
        </div>
      </section>`;
  }

  function renderFooter(){
    return `<footer class="pg3-footer">Página 3.0 · Render modular con tienda, producto y contacto reforzado.</footer>`;
  }

  function money(v){
    const n = Number(v || 0);
    try{ return n.toLocaleString('es-MX', { style:'currency', currency:'MXN' }); }catch(_){ return '$' + n.toFixed(2); }
  }

  function routeName(route){
    return ({ inicio:'Inicio', tienda:'Tienda', categoria:'Categoría', producto:'Producto' }[route]) || route;
  }

  function escapeHtml(v){
    return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function escapeHtmlAttr(v){
    return escapeHtml(v).replace(/`/g,'&#96;');
  }
})();
