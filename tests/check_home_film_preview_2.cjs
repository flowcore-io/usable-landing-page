const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.PREVIEW_URL||'http://localhost:8080/home-film-preview-2.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await chromium.launch({headless:true});const results=[];
try{for(const spec of [
{name:'slow',network:{downlink:.4,effectiveType:'3g',rtt:400,saveData:false}},
{name:'unknown',network:null},
{name:'save-data',network:{downlink:10,effectiveType:'4g',rtt:50,saveData:true}},
{name:'reduced-motion',network:{downlink:10,effectiveType:'4g',rtt:50,saveData:false},reduce:true},
{name:'no-js',js:false},
{name:'fast',network:{downlink:10,effectiveType:'4g',rtt:50,saveData:false},film:true},
{name:'manual',network:null,manual:true,film:true},
{name:'failed-engine',network:{downlink:10,effectiveType:'4g',rtt:50,saveData:false},block:'**/film-preview-2/scrollcraft.js*'},
{name:'failed-mount',network:{downlink:10,effectiveType:'4g',rtt:50,saveData:false},block:'**/film-preview-2/home-film.js*'},
{name:'failed-video',network:{downlink:10,effectiveType:'4g',rtt:50,saveData:false},block:'**/assets/film/*.mp4',film:true},
]){
 const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:spec.js!==false,reducedMotion:spec.reduce?'reduce':'no-preference'});
 await context.addInitScript(network=>Object.defineProperty(navigator,'connection',{configurable:true,value:network===null?undefined:Object.assign(new EventTarget(),network)}),spec.network??null);
 const page=await context.newPage();const media=[],errors=[];page.on('request',r=>{if(/\/assets\/film\//.test(r.url()))media.push(r.url())});page.on('pageerror',e=>errors.push(e.message));
 if(spec.block)await page.route(spec.block,r=>r.abort('failed'));
 await page.goto(base,{waitUntil:'load',timeout:30000});
 if(spec.manual)await page.locator('[data-film-start]').click();
 if(spec.film)await page.waitForFunction(()=>document.body.classList.contains('preview-film-active')&&!document.body.classList.contains('preview-film-pending'),{timeout:12000});
 else await wait(spec.block?9000:1000);
 const state=await page.evaluate(()=>{
 function visible(e){if(!e)return false;for(let p=e;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}return e.getBoundingClientRect().width>0}
 return {film:document.body.classList.contains('preview-film-active'),pending:document.body.classList.contains('preview-film-pending'),hero:visible(document.querySelector(document.body.classList.contains('preview-film-active')?'#film-hero-title':'#hero-title')),loop:visible(document.querySelector('.hero-loop')),cycle:visible(document.querySelector('#how-it-compounds')),nav:visible(document.querySelector('nav')),overflow:document.documentElement.scrollWidth>innerWidth,video:[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc,painted:v.classList.contains('sc-has-clip'),ready:v.readyState})),ids:[...document.querySelectorAll('[id]')].map(e=>e.id)};
 });
 assert.equal(state.film,!!spec.film,spec.name+' film policy');assert.equal(state.pending,false,spec.name+' pending');assert(state.hero,spec.name+' hero visible');assert(state.loop&&state.cycle&&state.nav,spec.name+' static content');assert(!state.overflow,spec.name+' overflow');assert.equal(new Set(state.ids).size,state.ids.length,spec.name+' unique IDs');assert.deepEqual(errors,[],spec.name+' page errors');
 if(!spec.film)assert.equal(media.length,0,spec.name+' no film requests');
 if(spec.name==='fast'){
  await page.locator('.preview-film-controls a[href="#how-it-compounds"]').click();await wait(1000);
  const rect=await page.locator('#how-it-compounds').boundingBox();assert(rect.y<120&&rect.y>-20,'skip lands on cycle');
 }
 if(spec.name==='manual'){
  await page.locator('[data-film-stop]').click();
  await page.waitForURL(/view=light/);
  assert.equal(await page.locator('video').count(),0,'manual still switch removes film');
 }
 if(spec.name==='failed-video'){await wait(1200);const painted=await page.locator('video.sc-has-clip').count();assert.equal(painted,0,'failed video keeps poster');}
 results.push({name:spec.name,pass:true,state,media});console.log(JSON.stringify({name:spec.name,pass:true,media:media.length,film:state.film}));await context.close();
 }
 fs.writeFileSync('/tmp/usable-film-v2-functional-results.json',JSON.stringify(results,null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
