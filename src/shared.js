/* Общий код: настройки, единицы измерения, время, тексты заказа. Используется и в приложении, и на сервере. */
let LANG='ru';
const setLang=l=>{LANG=l==='uz'?'uz':'ru'};
const L=(ru,uz)=>LANG==='uz'?uz:ru;
const nm=o=>!o?'':(LANG==='uz'&&o.uz?o.uz:o.name);

/* статусы; у самовывоза и доставки «Готов» и «Завершён» называются по-разному */
const STATUS={
  new:{name:'Новый',uz:'Yangi',c:'info'},
  accepted:{name:'В работе',uz:'Ishlanmoqda',c:'warn'},
  ready:{name:'Готов',uz:'Tayyor',c:'ok'},
  done:{name:'Завершён',uz:'Yakunlandi',c:'mute'},
  cancelled:{name:'Отменён',uz:'Bekor qilindi',c:'bad'}
};
const STATUS_MODE={
  pickup:{ready:{name:'Готов к выдаче',uz:'Topshirishga tayyor'},done:{name:'Выдан',uz:'Topshirildi'}},
  delivery:{ready:{name:'Готов к отправке',uz:'Joʻnatishga tayyor'},done:{name:'Доставлен',uz:'Yetkazildi'}}
};
function stOf(status,mode){
  const b=STATUS[status]||STATUS.new;
  const m=(STATUS_MODE[mode==='delivery'?'delivery':'pickup']||{})[status];
  return m?Object.assign({},b,m):b;
}

const DEFAULT={
  v:3,
  shop:{name:'Оптовая база',phone:'',telegram:'',address:'',addressUz:'',delivery:true,leadHours:2,deliveryLeadHours:24,openFrom:9,openTo:20,minOrder:0,deliveryFee:0,freeDeliveryFrom:0,discounts:[]}
};
const clone=o=>JSON.parse(JSON.stringify(o));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const nf=new Intl.NumberFormat('ru-RU');
const num=v=>nf.format(Math.round(Number(v)||0));
const money=v=>num(v)+' '+L('сум','soʻm');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* единицы измерения: вес или объём одной единицы товара */
const UNIT_IDS=['g','kg','pc','ml','l'];
const UNITS={g:{ru:'г',uz:'g'},kg:{ru:'кг',uz:'kg'},pc:{ru:'шт',uz:'dona'},ml:{ru:'мл',uz:'ml'},l:{ru:'л',uz:'l'}};
const unitName=u=>{const x=UNITS[u]||UNITS.g;return LANG==='uz'?x.uz:x.ru};
const amountStr=v=>String(Math.round((Number(v)||0)*1000)/1000).replace('.',',');
const weightLabel=p=>Number(p&&p.amount)>0?amountStr(p.amount)+' '+unitName(p.unit):'';
const prodDesc=p=>LANG==='uz'&&p.descUz?p.descUz:(p.desc||'');

/* Метки товара: «Акция» (со старой ценой) и «Новинка». Старая цена показывается, только если она выше нынешней. */
const TAGS={sale:{ru:'Акция',uz:'Aksiya'},new:{ru:'Новинка',uz:'Yangilik'}};
const tagName=t=>TAGS[t]?(LANG==='uz'?TAGS[t].uz:TAGS[t].ru):'';
const oldPrice=p=>p&&p.tag==='sale'&&Number(p.old)>Number(p.price)?Number(p.old):0;
const salePct=p=>{const o=oldPrice(p);return o?Math.max(1,Math.min(99,Math.round((o-Number(p.price))/o*100))):0};

/* Цена за штуку зависит от количества: у товара до трёх ступеней tiers=[{n, price}] («от n шт — price»), по возрастанию n и убыванию цены.
   Считается по штукам этого товара в заказе, и цена ступени действует на все штуки. */
const tiersOf=p=>Array.isArray(p&&p.tiers)?p.tiers:[];
function unitPrice(p,qty){
  let pr=Number(p&&p.price)||0;
  tiersOf(p).forEach(t=>{if(qty>=Number(t.n)&&Number(t.price)>0&&Number(t.price)<pr)pr=Number(t.price)});
  return pr;
}
/* Следующая ступень, до которой не хватает штук: {n, price, left} или null. */
function nextTier(p,qty){
  const cur=unitPrice(p,qty);
  const t=tiersOf(p).find(x=>Number(x.n)>qty&&Number(x.price)>0&&Number(x.price)<cur);
  return t?{n:Number(t.n),price:Number(t.price),left:Number(t.n)-qty}:null;
}
/* Скидка от суммы заказа: cfg.shop.discounts=[{from, pct}] — «от суммы from скидка pct %». Берётся самая большая из достигнутых. */
function orderDiscount(cfg,sub){
  let pct=0;
  (((cfg&&cfg.shop&&cfg.shop.discounts)||[])).forEach(d=>{if(sub>=Number(d.from)&&Number(d.pct)>pct)pct=Number(d.pct)});
  return {pct,amount:pct?Math.round(sub*pct/100):0};
}
/* Следующая скидка, до которой не хватает суммы: {from, pct, left} или null. */
function nextDiscount(cfg,sub){
  const cur=orderDiscount(cfg,sub).pct;
  const d=(((cfg&&cfg.shop&&cfg.shop.discounts)||[])).find(x=>Number(x.from)>sub&&Number(x.pct)>cur);
  return d?{from:Number(d.from),pct:Number(d.pct),left:Number(d.from)-sub}:null;
}

/* Чистка ступеней цены и скидок: одни и те же правила в приложении и на сервере.
   Ступени цены: до трёх, «от n шт» (n от 2 до 500) по возрастанию, цена каждой ниже обычной и ниже предыдущей. */
const cleanTiers=(a,price)=>{
  const t=[];
  (Array.isArray(a)?a:[]).forEach(x=>{
    if(!x||typeof x!=='object')return;
    const n=Math.round(Number(x.n)),pr=Math.round(Number(x.price));
    if(n>=2&&n<=500&&pr>=1&&pr<=1e8)t.push({n,price:pr});
  });
  t.sort((x,y)=>x.n-y.n);
  const out=[];let prev=Number(price)||0;
  t.forEach(x=>{
    if(out.length&&x.n===out[out.length-1].n)return;
    if(x.price<prev){out.push(x);prev=x.price}
  });
  return out.slice(0,3);
};
/* Скидки от суммы заказа: до трёх ступеней «от суммы — %»; сумма растёт, процент (1–50) строго растёт, иначе ступень отбрасывается. */
const cleanDiscounts=a=>{
  const t=[];
  (Array.isArray(a)?a:[]).forEach(d=>{
    if(!d||typeof d!=='object')return;
    const from=Math.round(Number(d.from)),pct=Math.round(Number(d.pct));
    if(from>=1&&from<=1e9&&pct>=1)t.push({from,pct:Math.min(50,pct)});
  });
  t.sort((x,y)=>x.from-y.from);
  const out=[];
  t.forEach(d=>{
    const last=out[out.length-1];
    if(last&&(d.from===last.from||d.pct<=last.pct))return;
    out.push(d);
  });
  return out.slice(0,3);
};

/* Упаковки: у товара поля box («в коробке N шт») и blk («в блоке N шт»), оба необязательные. Цена и склад всегда в штуках. */
const PACK_KEYS=['box','blk'];
const packSize=(p,k)=>{const n=Math.floor(Number(p&&p[k]));return n>=2?n:0};
const packShort=k=>k==='box'?L('кор.','quti'):L('бл.','blok');
const packWord=k=>k==='box'?L('коробка','quti'):L('блок','blok');
const pcsWord=()=>L('шт','dona');
/* Раскладывает штуки по упаковкам, сначала по большим: 100 шт при коробке 48 и блоке 12 → 2 кор. + 0 бл., остаток 4 шт. */
function packSplit(p,qty){
  const parts=[];let r=Math.max(0,Math.floor(Number(qty)||0));
  PACK_KEYS.forEach(k=>{const n=packSize(p,k);if(n&&r>=n){const c=Math.floor(r/n);parts.push({k,c,n});r-=c*n}});
  return {parts,rest:r};
}
/* «2 кор. × 12 шт» (одна упаковка, без остатка), «2 кор. + 1 бл. + 4 шт» (иначе); пусто, если упаковок нет или в количество не вошла ни одна. */
function packText(p,qty){
  const {parts,rest}=packSplit(p,qty);
  if(!parts.length)return '';
  if(parts.length===1&&!rest)return parts[0].c+' '+packShort(parts[0].k)+' × '+parts[0].n+' '+pcsWord();
  return parts.map(x=>x.c+' '+packShort(x.k)).concat(rest?[rest+' '+pcsWord()]:[]).join(' + ');
}

/* Остаток товара s = {q: на складе, r: отложено под заказы, low: порог «мало»}; нет записи — учёт не ведётся.
   Покупателям: av — сколько можно заказать (не больше cap, чтобы не раскрывать большие остатки), lw — товара мало, и число показываем в подписи «Мало (осталось N)». */
const stkAvail=s=>s?Math.max(0,(Number(s.q)||0)-(Number(s.r)||0)):null;
function stkPublic(s,cap){
  if(!s)return undefined;
  const a=stkAvail(s),lw=a>0&&Number(s.low)>0&&a<=Number(s.low);
  return {av:lw||!(cap>0)?a:Math.min(a,cap),lw};
}

/* Стоимость доставки: берётся только при доставке; если указан порог «бесплатно от» и сумма товаров его достигла, доставка бесплатна. */
function deliveryFee(cfg,mode,sub){
  const sh=cfg.shop,fee=Number(sh.deliveryFee)||0,free=Number(sh.freeDeliveryFrom)||0;
  if(mode!=='delivery'||fee<=0)return 0;
  return free>0&&Number(sub)>=free?0:fee;
}
function mergeCfg(d){
  const out=clone(DEFAULT);
  if(d&&typeof d==='object'&&d.shop&&typeof d.shop==='object')Object.keys(out.shop).forEach(k=>{if(d.shop[k]!==undefined&&d.shop[k]!==null)out.shop[k]=d.shop[k]});
  return out;
}

/* Время склада: Узбекистан, UTC+5. Возвращает Date, у которого локальные часы совпадают со стенными часами склада. */
const SHOP_TZ=5;
function shopNow(){return new Date(Date.now()+SHOP_TZ*3600000+new Date().getTimezoneOffset()*60000)}
/* сколько часов нужно на подготовку: самовывоз и доставка настраиваются отдельно */
const leadFor=(cfg,mode)=>mode==='delivery'?cfg.shop.deliveryLeadHours:cfg.shop.leadHours;
function pickupInfo(cfg,now,leadHours){
  now=now||shopNow();
  const lead=Math.max(0,Number(leadHours!==undefined?leadHours:cfg.shop.leadHours)||0);
  const from=Math.max(0,Math.min(22,Math.floor(Number(cfg.shop.openFrom)||9)));
  const to=Math.max(from+1,Math.min(23,Math.floor(Number(cfg.shop.openTo)||20)));
  const earliest=new Date(now.getTime()+lead*3600000);
  const slots=ds=>{
    const out=[];
    for(let m=from*60;m<=to*60;m+=30){
      const t=pad(Math.floor(m/60))+':'+pad(m%60);
      const dt=new Date(ds+'T'+t+':00');
      if(dt>=earliest)out.push(t);
    }
    return out;
  };
  let min=ymd(earliest);
  for(let i=0;i<20;i++){
    const d=new Date(earliest.getFullYear(),earliest.getMonth(),earliest.getDate()+i);
    if(slots(ymd(d)).length){min=ymd(d);break}
  }
  const md=new Date(now.getFullYear(),now.getMonth(),now.getDate()+60);
  return {min,max:ymd(md),slots};
}
const UZ_WD=['yak','dush','sesh','chor','pay','jum','shan'];
const UZ_MO=['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentyabr','oktyabr','noyabr','dekabr'];
function fmtWhen(s){
  const d=new Date(s);
  if(isNaN(d))return s||'';
  if(LANG==='uz')return UZ_WD[d.getDay()]+', '+d.getDate()+'-'+UZ_MO[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes());
  return d.toLocaleString('ru-RU',{weekday:'short',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
}
function prodLine(it){
  const w=weightLabel(it);
  const pk=packText(it,it.qty);
  return '• '+nm(it)+(w?' ('+w+')':'')+' × '+it.qty+(pk?' ('+pk+')':'')+' = '+money(it.price*it.qty);
}
/* Текст заказа для Telegram. maxItems: если список очень длинный, показываем первые позиции и пишем, сколько скрыто. */
function orderText(o,shop,maxItems){
  const items=o.items||[],P=[];
  const shown=maxItems&&items.length>maxItems?items.slice(0,maxItems):items;
  P.push(L('Заказ ','Buyurtma ')+o.id+' — '+(shop.name||DEFAULT.shop.name));
  P.push(L('Товары:','Mahsulotlar:'));
  shown.forEach(it=>P.push(prodLine(it)));
  if(shown.length<items.length){
    const n=items.length-shown.length;
    P.push(L('… и ещё '+n+' поз. (полный список в приложении)','… va yana '+n+' ta pozitsiya (toʻliq roʻyxat ilovada)'));
  }
  if(o.mode==='delivery'){
    P.push(L('Доставка: ','Yetkazib berish: ')+fmtWhen(o.pickupAt));
    P.push(L('Адрес: ','Manzil: ')+(o.address||''));
  }else P.push(L('Самовывоз: ','Olib ketish: ')+fmtWhen(o.pickupAt));
  P.push(L('Имя: ','Ism: ')+o.name+L(', тел.: ',', tel.: ')+o.phone);
  if(o.org)P.push(L('Организация: ','Tashkilot: ')+o.org);
  if(o.comment)P.push(L('Комментарий: ','Izoh: ')+o.comment);
  if(o.disc>0)P.push(L('Скидка '+o.dpct+'%: −','Chegirma '+o.dpct+'%: −')+money(o.disc));
  if(o.fee>0)P.push(L('Стоимость доставки: ','Yetkazib berish narxi: ')+money(o.fee));
  P.push(L('Итого: ','Jami: ')+money(o.total)+L(', оплата при получении',', olganda toʻlanadi'));
  return P.join('\n');
}
