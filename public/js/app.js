'use strict';
document.getElementById('year').textContent = new Date().getFullYear().toLocaleString('bn-BD',{useGrouping:false});
document.querySelectorAll('[data-gallery]').forEach(g=>{
 const track=g.querySelector('.gallery-track'), slides=[...track.children], wrap=g.querySelector('.gallery-dots');
 let index=0,timer,start=null,hover=false,focus=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const go=n=>{index=(n+slides.length)%slides.length;track.style.transform=`translateX(-${index*100}%)`;[...wrap.children].forEach((d,i)=>{d.classList.toggle('active',i===index);d.setAttribute('aria-current',String(i===index));});slides.forEach((s,i)=>s.setAttribute('aria-hidden',String(i!==index)));const name=g.querySelector('.hero-product-name');if(name)name.textContent=slides[index].dataset.product;};
 const stop=()=>clearInterval(timer);
 const resume=()=>{stop();if(!hover&&!focus&&start===null&&!document.hidden&&!reduced.matches)timer=setInterval(()=>go(index+1),3800);};
 slides.forEach((s,i)=>{const d=document.createElement('button');d.type='button';d.className='gallery-dot';if(g.dataset.gallery==='hero')d.dataset.product=s.dataset.product;d.setAttribute('aria-label',`ছবি ${(i+1).toLocaleString('bn-BD')} দেখুন`);d.onclick=()=>{go(i);resume();};wrap.append(d);});
 g.querySelector('.gallery-prev').onclick=()=>{go(index-1);resume();};g.querySelector('.gallery-next').onclick=()=>{go(index+1);resume();};
 track.onpointerdown=e=>{start=e.clientX;stop();track.setPointerCapture(e.pointerId);};
 track.onpointerup=e=>{if(start!==null&&Math.abs(e.clientX-start)>35)go(index+(e.clientX<start?1:-1));start=null;resume();};
 track.onpointercancel=()=>{start=null;resume();};
 g.onmouseenter=()=>{hover=true;stop();};g.onmouseleave=()=>{hover=false;resume();};g.onfocusin=()=>{focus=true;stop();};g.onfocusout=e=>{if(!g.contains(e.relatedTarget)){focus=false;resume();}};
 document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);go(0);resume();
});
const form=document.getElementById('preorderForm'),message=document.getElementById('formMessage'),button=document.getElementById('submitButton');
const successDialog=document.getElementById('orderSuccess');
if(successDialog){
 successDialog.querySelector('.success-close').addEventListener('click',()=>successDialog.close());
 successDialog.querySelector('.success-done').addEventListener('click',()=>successDialog.close());
 successDialog.addEventListener('click',event=>{if(event.target===successDialog){const r=successDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)successDialog.close();}});
 successDialog.addEventListener('close',()=>button.focus());
}
const warningDialog=document.getElementById('orderWarning');
let warningField=null;
if(warningDialog){
 warningDialog.querySelector('.success-close').addEventListener('click',()=>warningDialog.close());
 warningDialog.querySelector('.warning-done').addEventListener('click',()=>warningDialog.close());
 warningDialog.addEventListener('close',()=>{if(warningField){const target=document.getElementById(warningField);target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});target?.focus({preventScroll:true});}});
 warningDialog.addEventListener('click',event=>{if(event.target===warningDialog){const r=warningDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)warningDialog.close();}});
}
const original=button.innerHTML;let busy=false,pending=null;
try{pending=JSON.parse(sessionStorage.getItem('zocs-pending'));}catch{}
function show(text,ok=false){message.textContent=text;message.className='mt-4 rounded-xl p-3 text-center text-sm '+(ok?'bg-green-50 text-green-800':'bg-red-50 text-red-700');}
function fail(text,id){
 show(text);
 if(warningDialog){
  warningField=id;
  const product=id==='product1';
  document.getElementById('warningTitle').textContent=product?'আপনার পছন্দের পণ্য বেছে নিন':'তথ্যটি একটু যাচাই করুন';
  document.getElementById('warningDescription').textContent=product?'অর্ডার করার আগে ZOCS Micro অথবা ZOCS Nano নির্বাচন করুন। চাইলে দুটি পণ্যই একসঙ্গে নিতে পারবেন।':text;
  warningDialog.querySelector('.warning-done').textContent=product?'পণ্য নির্বাচন করি →':'তথ্য ঠিক করি →';
  warningDialog.querySelector('.success-note').textContent=product?'পণ্যের নিচে থাকা গোল চিহ্নে চাপ দিয়ে বেছে নিন':'আপনার দেওয়া তথ্য ফর্মেই রাখা আছে';
  if(!warningDialog.open)warningDialog.showModal();
 }else document.getElementById(id)?.focus();
}
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 const products=[...form.querySelectorAll('[name="products"]:checked')].map(x=>x.value);
 const name=document.getElementById('customerName').value.trim(),address=document.getElementById('customerAddress').value.trim();
 let phone=document.getElementById('customerPhone').value.replace(/[০-৯]/g,c=>'০১২৩৪৫৬৭৮৯'.indexOf(c)).replace(/[\s-]/g,'').replace(/^(?:\+88|88)/,'');
 if(!products.length)return fail('অন্তত একটি পণ্য নির্বাচন করুন।','product1');
 if(name.length<2||name.length>100)return fail('আপনার সম্পূর্ণ নাম লিখুন (২–১০০ অক্ষর)।','customerName');
 if(!/^01[3-9]\d{8}$/.test(phone))return fail('সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।','customerPhone');
 if(address.length<10||address.length>500)return fail('সম্পূর্ণ ঠিকানা লিখুন (১০–৫০০ অক্ষর)।','customerAddress');
 const endpoint=window.ZOCS_CONFIG?.endpoint;
 if(!/^https:\/\/script.google.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint||''))return show('এই মুহূর্তে অর্ডার গ্রহণ চালু হয়নি। অনুগ্রহ করে পরে চেষ্টা করুন।');
 const payload={name,phone,address,products:JSON.stringify(products),website:form.elements.website.value};
 const fingerprint=JSON.stringify(payload);
 if(!pending||pending.fingerprint!==fingerprint)pending={fingerprint,id:crypto.randomUUID()};
 try{sessionStorage.setItem('zocs-pending',JSON.stringify(pending));}catch{}
 busy=true;button.disabled=true;button.textContent='◌ অর্ডার জমা হচ্ছে…';form.setAttribute('aria-busy','true');show('অনুগ্রহ করে অপেক্ষা করুন…');
 try{
  const response=await fetch(endpoint,{method:'POST',body:new URLSearchParams({...payload,submissionId:pending.id}),redirect:'follow',credentials:'omit',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('http');const data=await response.json();
  if(data.ok!==true||data.submissionId!==pending.id)throw Error('unconfirmed');
  show('আপনার প্রি-অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমাদের সঙ্গে থাকার জন্য ধন্যবাদ। প্রয়োজন হলে আমরা আপনার সঙ্গে যোগাযোগ করব।',true);
  form.reset();pending=null;try{sessionStorage.removeItem('zocs-pending');}catch{}
  if(successDialog && !successDialog.open)successDialog.showModal();
 }catch{show('অর্ডার সংরক্ষণের নিশ্চয়তা পাওয়া যায়নি। আপনার তথ্য রাখা আছে। একই তথ্য দিয়ে আবার চেষ্টা করুন; একই অর্ডার দুবার জমা হবে না।');}
 finally{busy=false;button.disabled=false;button.innerHTML=original;form.removeAttribute('aria-busy');}
});
