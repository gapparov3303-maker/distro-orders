// Файл собран автоматически (node build.js). Править нужно файлы в src/.
const APP_HTML = "<!doctype html>\n<html lang=\"ru\"><head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n<meta name=\"color-scheme\" content=\"light dark\">\n<title>Каталог</title>\n<script src=\"https://telegram.org/js/telegram-web-app.js\"></script>\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Unbounded:wght@500;700&display=swap\">\n<style>\n/* Layout: catalog with search and categories, cart with order form; seller panel is a tabbed list of orders, catalog editor and settings. */\n:root{\n  --bg:#F3F7F6; --surface:#FFFFFF; --surface-2:#E7EFED; --ink:#14231F; --ink-2:#5B6E69; --line:#D6E3E0;\n  --accent:#0F766E; --accent-ink:#FFFFFF; --accent-soft:#D9F0EC;\n  --stage-a:#E2F1EE; --stage-b:#E6ECF7;\n  --ok:#1F7A4D; --ok-soft:#DDF3E6; --warn:#9A5B00; --warn-soft:#FBEBCB; --bad:#B3261E; --bad-soft:#FBE0DD; --info:#1F5FA3; --info-soft:#DCEBFA; --mute:#5B6E69; --mute-soft:#E7EFED;\n  --f-display:'Unbounded','Onest',system-ui,sans-serif;\n  --f-body:'Onest',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;\n  --hdr:56px;\n}\n@media (prefers-color-scheme: dark){\n  :root:not([data-theme=\"light\"]){\n    --bg:#0E1614; --surface:#162220; --surface-2:#1D2D2A; --ink:#E8F3F0; --ink-2:#9DB5AF; --line:#27403B;\n    --accent:#4FD1C0; --accent-ink:#06211D; --accent-soft:#16403A;\n    --stage-a:#1B2B28; --stage-b:#1B2433;\n    --ok:#6FD3A0; --ok-soft:#1D3A2D; --warn:#F2B957; --warn-soft:#3F3015; --bad:#FF8A80; --bad-soft:#44201E; --info:#7DB6F0; --info-soft:#1B3149; --mute:#9DB5AF; --mute-soft:#1D2D2A;\n    color-scheme:dark;\n  }\n}\n:root[data-theme=\"dark\"]{\n  --bg:#0E1614; --surface:#162220; --surface-2:#1D2D2A; --ink:#E8F3F0; --ink-2:#9DB5AF; --line:#27403B;\n  --accent:#4FD1C0; --accent-ink:#06211D; --accent-soft:#16403A;\n  --stage-a:#1B2B28; --stage-b:#1B2433;\n  --ok:#6FD3A0; --ok-soft:#1D3A2D; --warn:#F2B957; --warn-soft:#3F3015; --bad:#FF8A80; --bad-soft:#44201E; --info:#7DB6F0; --info-soft:#1B3149; --mute:#9DB5AF; --mute-soft:#1D2D2A;\n  color-scheme:dark;\n}\n*{box-sizing:border-box}\nhtml,body{margin:0}\nbody{-webkit-text-size-adjust:100%;min-height:100vh;background:var(--bg);color:var(--ink);font:15px/1.45 var(--f-body);-webkit-font-smoothing:antialiased}\nbody::before{content:\"\";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);background:var(--bg);z-index:30}\nbutton,input,select,textarea{font:inherit;color:inherit}\nh1,h2,h3,p{margin:0}\n.wrap{max-width:1080px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n\n/* header */\n.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--bg);border-bottom:1px solid var(--line)}\n.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:var(--hdr)}\n.brand{display:flex;align-items:center;gap:10px;font:700 15px/1 var(--f-display);letter-spacing:.01em;min-width:0}\n.brand svg{flex:none}\n.brand span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.right{display:flex;align-items:center;gap:8px;flex:none}\n.nav{display:flex;flex:none;gap:2px;background:var(--surface-2);padding:4px;border-radius:12px}\n.nav button{appearance:none;border:0;background:transparent;border-radius:9px;padding:7px 10px;font-size:13px;font-weight:600;color:var(--ink-2);cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap}\n.nav button[aria-current=\"page\"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(20,35,31,.14)}\n.langbtn{appearance:none;height:38px;min-width:42px;padding:0 8px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface);font-weight:700;font-size:12px;letter-spacing:.04em;cursor:pointer}\n.badge{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--accent);color:var(--accent-ink);font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}\n@media (max-width:430px){.nav button{padding:7px 7px;font-size:12.5px;gap:4px}.nav{gap:1px;padding:3px}.langbtn{min-width:38px;padding:0 6px}.right{gap:6px}}\n@media (max-width:480px){.brand span{display:none}}\n@media (max-width:390px){.brand{display:none}.top .wrap{justify-content:space-between}}\n\n/* sections, chips */\n.sec{padding-top:18px}\n.sec h2{font:700 13px/1.2 var(--f-display);letter-spacing:.02em;display:flex;align-items:baseline;gap:10px;margin-bottom:12px}\n.chip{appearance:none;border:1.5px solid var(--line);background:var(--surface);border-radius:999px;height:36px;min-width:36px;padding:0 12px;cursor:pointer;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}\n.chip[aria-pressed=\"true\"]{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft),inset 0 0 0 1px var(--accent)}\n\n/* forms */\n.lab{display:block;font-size:12px;font-weight:600;color:var(--ink-2);margin-bottom:6px}\ninput[type=text],input[type=tel],input[type=number],input[type=date],input[type=search],select,textarea{width:100%;background:var(--surface);border:1.5px solid var(--line);border-radius:10px;padding:11px 12px;min-width:0}\ninput:focus,select:focus,textarea:focus{border-color:var(--accent);outline:none;box-shadow:0 0 0 3px var(--accent-soft)}\ninput[aria-invalid=\"true\"],select[aria-invalid=\"true\"],textarea[aria-invalid=\"true\"]{border-color:var(--bad)}\ntextarea{resize:vertical;min-height:72px}\ninput[type=checkbox]{width:20px;height:20px;accent-color:var(--accent);margin:0}\n.form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\n.form .full{grid-column:1/-1}\n@media (max-width:540px){.form{grid-template-columns:minmax(0,1fr)}}\n.err{color:var(--bad);font-size:12px;margin-top:4px;min-height:0}\n.seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:var(--surface-2);padding:4px;border-radius:12px}\n.seg button{appearance:none;border:0;background:transparent;border-radius:9px;padding:10px 8px;font-weight:600;font-size:14px;color:var(--ink-2);cursor:pointer}\n.seg button[aria-pressed=\"true\"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(20,35,31,.14)}\n.sum{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:6px 14px}\n.sum .r{display:flex;justify-content:space-between;gap:12px;padding:7px 0;font-size:14px;border-bottom:1px dashed var(--line)}\n.sum .r span:first-child{min-width:0;overflow-wrap:anywhere}\n.sum .r span:last-child{white-space:nowrap;font-variant-numeric:tabular-nums}\n.sum .r.t{border-bottom:0;font-weight:700;padding-top:10px}\n.sum .r.t span:last-child{font:700 16px var(--f-display)}\n.note{background:var(--accent-soft);border-radius:12px;padding:10px 12px;font-size:13px}\n.btn{appearance:none;border:0;border-radius:12px;padding:13px 18px;font-weight:600;font-size:15px;background:var(--accent);color:var(--accent-ink);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-align:center}\n.btn.ghost{background:transparent;color:var(--ink);border:1.5px solid var(--line)}\n.btn.sm{padding:7px 12px;font-size:13px;border-radius:10px}\n.btn[disabled]{opacity:.55;cursor:wait}\n.bar{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--surface);border-top:1px solid var(--line);padding-top:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}\n.bar .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px}\n.bar small{display:block;font-size:12px;color:var(--ink-2)}\n.bar strong{font:700 17px/1.2 var(--f-display);font-variant-numeric:tabular-nums}\n.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(88px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--bg);padding:10px 14px;border-radius:10px;font-size:13px;z-index:50;max-width:calc(100% - 32px);text-align:center}\n\n/* orders */\n.page{padding-block:18px 56px}\n.page h1{font:700 18px/1.25 var(--f-display);margin-bottom:6px;text-wrap:balance}\n.lead{color:var(--ink-2);margin-bottom:16px;max-width:60ch}\n.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0}\n@media (max-width:640px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 12px}\n.stat small{display:block;font-size:12px;color:var(--ink-2)}\n.stat b{font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}\n.stat.hot{background:var(--accent-soft);border-color:var(--accent)}\n.tabs{display:flex;flex-wrap:nowrap;gap:0;margin-bottom:14px;overflow-x:auto;scrollbar-width:none}\n.tabs::-webkit-scrollbar{display:none}\n.tab{appearance:none;background:transparent;border:0;border-bottom:2.5px solid transparent;box-shadow:inset 0 -1px 0 var(--line);padding:10px 12px;font-weight:600;font-size:14px;color:var(--ink-2);cursor:pointer;white-space:nowrap;flex:none}\n.tab .badge{margin-left:3px}\n@media (max-width:430px){.tab{padding:10px 8px;font-size:13px}}\n.tab[aria-selected=\"true\"]{color:var(--ink);border-bottom-color:var(--accent)}\n.filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}\n.ordlist{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}\n@media (min-width:980px){.ordlist{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.ord{display:grid;grid-template-columns:minmax(0,96px) minmax(0,1fr);gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:12px}\n.ord.is-new{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}\n.ord .th{background:linear-gradient(160deg,var(--stage-a),var(--stage-b));border-radius:12px;align-self:start;aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}\n.ord .th img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:12px}\n.ord .th .ph{font-size:34px}\n.ord .ob{min-width:0;display:grid;gap:5px;align-content:start}\n.oh{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}\n.oid{font:700 13px var(--f-display);letter-spacing:.02em}\n.when{font-weight:600}\n.spec{font-size:13px;color:var(--ink-2);overflow-wrap:anywhere}\n.cust{font-size:14px;display:flex;flex-wrap:wrap;align-items:center;gap:6px}\n.cm{font-size:13px;background:var(--surface-2);border-radius:8px;padding:6px 8px;overflow-wrap:anywhere}\n.tot{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}\n.tot b{font:700 15px var(--f-display);font-variant-numeric:tabular-nums}\n.tot span{font-size:12px;color:var(--ink-2)}\n.acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}\n.st{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600}\n.st::before{content:\"\";width:7px;height:7px;border-radius:50%;background:currentColor}\n.st.info{background:var(--info-soft);color:var(--info)}\n.st.warn{background:var(--warn-soft);color:var(--warn)}\n.st.ok{background:var(--ok-soft);color:var(--ok)}\n.st.bad{background:var(--bad-soft);color:var(--bad)}\n.st.mute{background:var(--mute-soft);color:var(--mute)}\n.empty{text-align:center;padding:36px 16px;color:var(--ink-2);background:var(--surface);border:1px dashed var(--line);border-radius:16px}\n.empty b{display:block;color:var(--ink);font:700 15px var(--f-display);margin-bottom:6px}\n.ord .pl{display:flex;justify-content:space-between;gap:10px;font-size:13px}\n.ord .pl span:first-child{min-width:0;overflow-wrap:anywhere}\n.ord .pl span:last-child{white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--ink-2)}\n\n/* settings, cards */\n.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:14px}\n.card h3{font:700 13px var(--f-display);margin-bottom:2px}\n.card .unit{font-size:12px;color:var(--ink-2);margin-bottom:6px}\n.savebar{font-size:12px;color:var(--ink-2);min-height:18px;margin-bottom:10px}\n.savebar.bad{color:var(--bad)}\n.settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\n@media (max-width:540px){.settings{grid-template-columns:minmax(0,1fr)}}\n.settings .full{grid-column:1/-1}\n\n/* catalog (client) */\n.shop{padding-block:14px 130px}\n.shop h1{font:700 18px/1.25 var(--f-display);margin-bottom:12px}\n.shop .search{margin-bottom:10px}\n.pchips{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px 10px;scrollbar-width:none}\n.pchips::-webkit-scrollbar{display:none}\n.pchips .chip{flex:none;white-space:nowrap}\n.chead{font:700 14px var(--f-display);margin:20px 0 10px}\n.chead:first-child{margin-top:4px}\n.pgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}\n@media (min-width:640px){.pgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}\n@media (min-width:900px){.pgrid{grid-template-columns:repeat(4,minmax(0,1fr))}}\n.pcard{background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;min-width:0}\n.pcard.off .pimg img,.pcard.off .pimg .ph{opacity:.45;filter:grayscale(1)}\n.pcard.off .pname,.pcard.off .pprice{color:var(--ink-2)}\n.pimg{position:relative;aspect-ratio:4/3;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center;overflow:hidden}\n.pimg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}\n.ph{font-size:34px;line-height:1}\n.pimg .tag{position:absolute;left:8px;top:8px;background:var(--ink);color:var(--bg);font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;z-index:1}\n.pbody{padding:10px 12px 12px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}\n.pname{font-weight:600;font-size:14px;line-height:1.3;overflow-wrap:anywhere}\n.pw{font-size:12px;color:var(--ink-2)}\n.pdesc{font-size:12px;color:var(--ink-2);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;cursor:pointer}\n.pdesc.open{display:block}\n.pprice{font:700 15px var(--f-display);margin-top:auto;padding-top:6px;font-variant-numeric:tabular-nums}\n.padd{margin-top:8px;width:100%;min-height:41px}\n.stepper{display:flex;align-items:center;justify-content:space-between;margin-top:8px;height:41px;box-sizing:border-box;border:1.5px solid var(--accent);border-radius:12px;overflow:hidden;background:var(--surface)}\n.stepper button{appearance:none;border:0;background:var(--accent-soft);color:var(--accent);width:40px;height:100%;flex:none;font-size:20px;font-weight:700;line-height:1;cursor:pointer}\n.stepper button[disabled]{opacity:.4;cursor:not-allowed}\n.stepper input.qty{flex:1;min-width:0;width:100%;border:0;border-radius:0;background:transparent;text-align:center;font:700 15px var(--f-display);padding:0 2px;height:100%;font-variant-numeric:tabular-nums;-moz-appearance:textfield;appearance:textfield}\n.stepper input.qty::-webkit-outer-spin-button,.stepper input.qty::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}\n.stepper input.qty:focus{box-shadow:none;background:var(--accent-soft)}\n.stepper.sm{margin-top:0;height:auto;width:132px}\n.stepper.sm button{width:34px;height:32px;font-size:18px}\n.stepper.sm input.qty{height:32px}\n.cline{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}\n.cline:first-child{border-top:0}\n.cth{width:56px;height:56px;border-radius:10px;overflow:hidden;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center;position:relative}\n.cth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.cth .ph{font-size:24px}\n.cline .cn{min-width:0}\n.cline .cn b{display:block;font-size:14px;font-weight:600;line-height:1.3;overflow-wrap:break-word}\n.cline .cn small{display:block;font-size:12px;color:var(--ink-2)}\n.cline .cr{display:grid;gap:6px;justify-items:end}\n.cline .cs{font:700 13px var(--f-display);font-variant-numeric:tabular-nums;white-space:nowrap}\n.backlink{margin-bottom:10px}\n@media (max-width:380px){\n  .cline{grid-template-columns:56px minmax(0,1fr)}\n  .cline .cr{grid-column:1/-1;grid-template-columns:auto auto;justify-content:space-between;align-items:center;justify-items:stretch}\n  .cline .cs{text-align:right}\n}\n\n/* seller: catalog editor */\n.prow{display:grid;grid-template-columns:104px minmax(0,1fr);gap:14px;padding:14px 0;border-top:1px solid var(--line)}\n.prow.off .pf{opacity:.8}\n.pph{display:flex;flex-direction:column;gap:8px;align-items:flex-start}\n.pthumb{position:relative;width:104px;height:104px;border-radius:12px;overflow:hidden;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center}\n.pthumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.pbtns{display:flex;flex-direction:column;gap:6px;align-items:flex-start}\n.pbtns label.dis{opacity:.6;pointer-events:none}\n.sr{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none}\n.pf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;min-width:0}\n.pf .full{grid-column:1/-1}\n.pf textarea{min-height:56px}\n.pf .avail{display:flex;align-items:flex-end;padding-bottom:10px}\n.chk{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}\n.pact{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.crow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px;align-items:center;padding:6px 0}\n.crow .x{appearance:none;border:0;background:transparent;font-size:22px;line-height:1;color:var(--ink-2);cursor:pointer;width:36px;height:36px;border-radius:10px}\n@media (max-width:480px){\n  .crow{grid-template-columns:minmax(0,1fr) auto}\n  .crow .x{grid-column:2;grid-row:1/3}\n  .crow input{grid-column:1}\n}\n@media (max-width:560px){\n  .prow{grid-template-columns:minmax(0,1fr)}\n  .pph{flex-direction:row;align-items:center}\n  .pthumb{width:88px;height:88px;flex:none}\n}\n\n/* stock: status line on product cards, seller screen «Остатки» */\n.pst{font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;color:var(--ok)}\n.pst::before{content:\"\";width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}\n.pst.low{color:var(--warn)}\n.cline .cn small.lowtxt{color:var(--warn);font-weight:600}\n.badge.warn{background:var(--warn-soft);color:var(--warn)}\n.srow{padding:14px 0;border-top:1px solid var(--line);display:grid;gap:10px}\n.srow:first-child{border-top:0;padding-top:4px}\n.sh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.sh .sn{min-width:0}\n.sh .sn b{display:block;font-weight:600;overflow-wrap:anywhere}\n.sh .sn small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.snum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\n.snum div{background:var(--surface-2);border-radius:10px;padding:8px 10px;min-width:0}\n.snum small{display:block;font-size:11px;color:var(--ink-2)}\n.snum b{font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums}\n.snum .fr.low{background:var(--warn-soft)}\n.snum .fr.low b{color:var(--warn)}\n.snum .fr.out{background:var(--bad-soft)}\n.snum .fr.out b{color:var(--bad)}\n.sact{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.sact input[type=number]{flex:0 0 150px;width:150px;padding:9px 10px}\n@media (max-width:480px){.sact input[type=number]{flex:1 1 100%;width:auto}}\n.sth{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:13px;color:var(--ink-2)}\n.sth input[type=number]{width:90px;padding:8px 10px}\n.jrow{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid var(--line);font-size:14px}\n.jrow:first-of-type{border-top:0}\n.jrow .jn{min-width:0}\n.jrow .jn b{display:block;font-weight:600;overflow-wrap:anywhere}\n.jrow small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.jrow .jd{text-align:right;flex:none;font:700 14px var(--f-display);font-variant-numeric:tabular-nums}\n.jrow .jd small{font:400 12px var(--f-body)}\n.jrow .jd.plus{color:var(--ok)}\n.jrow .jd.minus{color:var(--bad)}\n\n/* placed */\n.eyebrow{font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}\n.stack{display:grid;gap:12px}\n.row-btns{display:flex;flex-wrap:wrap;gap:8px}\n@media (prefers-reduced-motion:no-preference){.chip,.seg button{transition:border-color .12s,background-color .12s}}\n</style>\n</head><body>\n\n<header class=\"top\"><div class=\"wrap\">\n  <div class=\"brand\">\n    <svg width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" aria-hidden=\"true\"><path d=\"M4 9.5 15 4l11 5.5v11L15 26 4 20.5z\" fill=\"var(--accent-soft)\" stroke=\"var(--accent)\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><path d=\"M4 9.5 15 15l11-5.5M15 15v11\" fill=\"none\" stroke=\"var(--accent)\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/></svg>\n    <span id=\"brandName\"></span>\n  </div>\n  <div class=\"right\">\n    <nav class=\"nav\" id=\"nav\"></nav>\n    <button type=\"button\" class=\"langbtn\" id=\"langbtn\" data-act=\"lang\"></button>\n  </div>\n</div></header>\n<main id=\"view\"></main>\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\" hidden></div>\n\n<script>\n/* Общий код: настройки, единицы измерения, время, тексты заказа. Используется и в приложении, и на сервере. */\nlet LANG='ru';\nconst setLang=l=>{LANG=l==='uz'?'uz':'ru'};\nconst L=(ru,uz)=>LANG==='uz'?uz:ru;\nconst nm=o=>!o?'':(LANG==='uz'&&o.uz?o.uz:o.name);\n\n/* статусы; у самовывоза и доставки «Готов» и «Завершён» называются по-разному */\nconst STATUS={\n  new:{name:'Новый',uz:'Yangi',c:'info'},\n  accepted:{name:'В работе',uz:'Ishlanmoqda',c:'warn'},\n  ready:{name:'Готов',uz:'Tayyor',c:'ok'},\n  done:{name:'Завершён',uz:'Yakunlandi',c:'mute'},\n  cancelled:{name:'Отменён',uz:'Bekor qilindi',c:'bad'}\n};\nconst STATUS_MODE={\n  pickup:{ready:{name:'Готов к выдаче',uz:'Topshirishga tayyor'},done:{name:'Выдан',uz:'Topshirildi'}},\n  delivery:{ready:{name:'Готов к отправке',uz:'Joʻnatishga tayyor'},done:{name:'Доставлен',uz:'Yetkazildi'}}\n};\nfunction stOf(status,mode){\n  const b=STATUS[status]||STATUS.new;\n  const m=(STATUS_MODE[mode==='delivery'?'delivery':'pickup']||{})[status];\n  return m?Object.assign({},b,m):b;\n}\n\nconst DEFAULT={\n  v:3,\n  shop:{name:'Оптовая база',phone:'',telegram:'',address:'',addressUz:'',delivery:true,leadHours:2,deliveryLeadHours:24,openFrom:9,openTo:20}\n};\nconst clone=o=>JSON.parse(JSON.stringify(o));\nconst pad=n=>String(n).padStart(2,'0');\nconst ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());\nconst nf=new Intl.NumberFormat('ru-RU');\nconst num=v=>nf.format(Math.round(Number(v)||0));\nconst money=v=>num(v)+' '+L('сум','soʻm');\nconst esc=s=>String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\n\n/* единицы измерения: вес или объём одной единицы товара */\nconst UNIT_IDS=['g','kg','pc','ml','l'];\nconst UNITS={g:{ru:'г',uz:'g'},kg:{ru:'кг',uz:'kg'},pc:{ru:'шт',uz:'dona'},ml:{ru:'мл',uz:'ml'},l:{ru:'л',uz:'l'}};\nconst unitName=u=>{const x=UNITS[u]||UNITS.g;return LANG==='uz'?x.uz:x.ru};\nconst amountStr=v=>String(Math.round((Number(v)||0)*1000)/1000).replace('.',',');\nconst weightLabel=p=>Number(p&&p.amount)>0?amountStr(p.amount)+' '+unitName(p.unit):'';\nconst prodDesc=p=>LANG==='uz'&&p.descUz?p.descUz:(p.desc||'');\n\n/* Остаток товара s = {q: на складе, r: отложено под заказы, low: порог «мало»}; нет записи — учёт не ведётся.\n   Покупателям: av — сколько можно заказать (не больше cap, чтобы не раскрывать большие остатки), lw — товара мало, и число показываем в подписи «Мало (осталось N)». */\nconst stkAvail=s=>s?Math.max(0,(Number(s.q)||0)-(Number(s.r)||0)):null;\nfunction stkPublic(s,cap){\n  if(!s)return undefined;\n  const a=stkAvail(s),lw=a>0&&Number(s.low)>0&&a<=Number(s.low);\n  return {av:lw||!(cap>0)?a:Math.min(a,cap),lw};\n}\n\nfunction mergeCfg(d){\n  const out=clone(DEFAULT);\n  if(d&&typeof d==='object'&&d.shop&&typeof d.shop==='object')Object.keys(out.shop).forEach(k=>{if(d.shop[k]!==undefined&&d.shop[k]!==null)out.shop[k]=d.shop[k]});\n  return out;\n}\n\n/* Время склада: Узбекистан, UTC+5. Возвращает Date, у которого локальные часы совпадают со стенными часами склада. */\nconst SHOP_TZ=5;\nfunction shopNow(){return new Date(Date.now()+SHOP_TZ*3600000+new Date().getTimezoneOffset()*60000)}\n/* сколько часов нужно на подготовку: самовывоз и доставка настраиваются отдельно */\nconst leadFor=(cfg,mode)=>mode==='delivery'?cfg.shop.deliveryLeadHours:cfg.shop.leadHours;\nfunction pickupInfo(cfg,now,leadHours){\n  now=now||shopNow();\n  const lead=Math.max(0,Number(leadHours!==undefined?leadHours:cfg.shop.leadHours)||0);\n  const from=Math.max(0,Math.min(22,Math.floor(Number(cfg.shop.openFrom)||9)));\n  const to=Math.max(from+1,Math.min(23,Math.floor(Number(cfg.shop.openTo)||20)));\n  const earliest=new Date(now.getTime()+lead*3600000);\n  const slots=ds=>{\n    const out=[];\n    for(let m=from*60;m<=to*60;m+=30){\n      const t=pad(Math.floor(m/60))+':'+pad(m%60);\n      const dt=new Date(ds+'T'+t+':00');\n      if(dt>=earliest)out.push(t);\n    }\n    return out;\n  };\n  let min=ymd(earliest);\n  for(let i=0;i<20;i++){\n    const d=new Date(earliest.getFullYear(),earliest.getMonth(),earliest.getDate()+i);\n    if(slots(ymd(d)).length){min=ymd(d);break}\n  }\n  const md=new Date(now.getFullYear(),now.getMonth(),now.getDate()+60);\n  return {min,max:ymd(md),slots};\n}\nconst UZ_WD=['yak','dush','sesh','chor','pay','jum','shan'];\nconst UZ_MO=['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentyabr','oktyabr','noyabr','dekabr'];\nfunction fmtWhen(s){\n  const d=new Date(s);\n  if(isNaN(d))return s||'';\n  if(LANG==='uz')return UZ_WD[d.getDay()]+', '+d.getDate()+'-'+UZ_MO[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes());\n  return d.toLocaleString('ru-RU',{weekday:'short',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});\n}\nfunction prodLine(it){\n  const w=weightLabel(it);\n  return '• '+nm(it)+(w?' ('+w+')':'')+' × '+it.qty+' = '+money(it.price*it.qty);\n}\n/* Текст заказа для Telegram. maxItems: если список очень длинный, показываем первые позиции и пишем, сколько скрыто. */\nfunction orderText(o,shop,maxItems){\n  const items=o.items||[],P=[];\n  const shown=maxItems&&items.length>maxItems?items.slice(0,maxItems):items;\n  P.push(L('Заказ ','Buyurtma ')+o.id+' — '+(shop.name||DEFAULT.shop.name));\n  P.push(L('Товары:','Mahsulotlar:'));\n  shown.forEach(it=>P.push(prodLine(it)));\n  if(shown.length<items.length){\n    const n=items.length-shown.length;\n    P.push(L('… и ещё '+n+' поз. (полный список в приложении)','… va yana '+n+' ta pozitsiya (toʻliq roʻyxat ilovada)'));\n  }\n  if(o.mode==='delivery'){\n    P.push(L('Доставка: ','Yetkazib berish: ')+fmtWhen(o.pickupAt));\n    P.push(L('Адрес: ','Manzil: ')+(o.address||''));\n  }else P.push(L('Самовывоз: ','Olib ketish: ')+fmtWhen(o.pickupAt));\n  P.push(L('Имя: ','Ism: ')+o.name+L(', тел.: ',', tel.: ')+o.phone);\n  if(o.comment)P.push(L('Комментарий: ','Izoh: ')+o.comment);\n  P.push(L('Итого: ','Jami: ')+money(o.total)+L(', оплата при получении',', olganda toʻlanadi'));\n  return P.join('\\n');\n}\n\n\n/* ---------- app ---------- */\nconst $=(s,r)=>(r||document).querySelector(s);\nconst MAX_QTY=500,MAX_LINES=30,MAX_CATS=40,MAX_ITEMS=300;\nconst S={\n  view:'shop',sellerTab:'orders',filter:'active',\n  cfg:clone(DEFAULT),\n  form:{name:'',phone:'',mode:'pickup',address:'',date:'',time:'',comment:''},\n  myOrders:[],allOrders:[],stats:{doneSum:0,doneCount:0},\n  tg:null,initData:'',uid:null,admin:false,auth:false,ready:false,authErr:'',\n  busy:false,dirty:false,saving:false,again:false,saveState:'',cc:null,\n  prod:{cats:[],items:[]},cart:{},shopCat:'all',shopStep:'list',shopPlaced:null,q:'',\n  pfilter:'all',upl:{},dirtyC:false,dirtyP:false,cd:null,\n  stk:{},stkLoaded:false,sfilter:'all',sbusy:{},sc:null,jr:[],jrOpen:false\n};\nconst view=$('#view');\nlet toastT=null,saveT=null;\n\nfunction toast(msg){\n  const t=$('#toast');t.textContent=msg;t.hidden=false;\n  clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},Math.min(8000,Math.max(3200,String(msg).length*55)));\n}\nconst waitMs=ms=>new Promise(r=>setTimeout(r,ms));\n/* способ получения: доставка доступна, только если продавец её включил */\nconst mode=()=>S.cfg.shop.delivery!==false&&S.form.mode==='delivery'?'delivery':'pickup';\nconst pickup=()=>pickupInfo(S.cfg,shopNow(),leadFor(S.cfg,mode()));\nfunction normalizeMode(){if(S.cfg.shop.delivery===false)S.form.mode='pickup'}\n\n/* ---------- каталог: данные и корзина ---------- */\nconst normProd=d=>{const o={cats:[],items:[]};if(d&&typeof d==='object'){if(Array.isArray(d.cats))o.cats=d.cats.filter(x=>x&&typeof x==='object');if(Array.isArray(d.items))o.items=d.items.filter(x=>x&&typeof x==='object')}return o};\nconst imgUrl=p=>'/img/'+encodeURIComponent(p.id)+'?v='+encodeURIComponent(p.pv||'');\nconst pimg=p=>p.pv?'<img src=\"'+imgUrl(p)+'\" alt=\"'+esc(nm(p))+'\" loading=\"lazy\" decoding=\"async\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>';\nfunction loadCart(){try{const c=JSON.parse(localStorage.getItem('sh-cart')||'{}');if(c&&typeof c==='object'&&!Array.isArray(c))S.cart=c}catch(e){}}\nfunction saveCart(){try{localStorage.setItem('sh-cart',JSON.stringify(S.cart))}catch(e){}}\n/* имя, телефон, способ и адрес запоминаем на телефоне, чтобы повторный заказ был быстрее */\nfunction loadForm(){\n  try{\n    const f=JSON.parse(localStorage.getItem('sh-form')||'{}');\n    if(f&&typeof f==='object'){\n      ['name','phone','address'].forEach(k=>{if(typeof f[k]==='string')S.form[k]=f[k].slice(0,200)});\n      if(f.mode==='delivery')S.form.mode='delivery';\n    }\n  }catch(e){}\n}\nfunction saveForm(){try{localStorage.setItem('sh-form',JSON.stringify({name:S.form.name,phone:S.form.phone,address:S.form.address,mode:S.form.mode}))}catch(e){}}\n/* Товар нельзя заказать: продавец снял галочку «В наличии» или свободный остаток равен нулю. Поле av приходит с сервера у товаров с учётом (сколько можно заказать, не больше 500), lw — товара мало. */\nconst soldOut=p=>p.on===false||p.av===0;\n/* Сколько штук можно положить в корзину: до 500, а у товаров с учётом — не больше свободного остатка. */\nconst maxQty=p=>typeof p.av==='number'?Math.min(MAX_QTY,p.av):MAX_QTY;\nconst capOf=id=>{const p=S.prod.items.find(x=>x.id===id);return p?maxQty(p):MAX_QTY};\n/* Убирает из корзины то, чего больше нет в каталоге или что закончилось, и уменьшает количество до остатка. Возвращает, сколько позиций изменено. */\nfunction pruneCart(){\n  let n=0;\n  Object.keys(S.cart).forEach(id=>{\n    const p=S.prod.items.find(x=>x.id===id),q=Number(S.cart[id]);\n    if(!p||soldOut(p)||!(q>=1)){delete S.cart[id];n++}\n    else{const m=Math.min(maxQty(p),Math.floor(q));if(m!==q)n++;S.cart[id]=m}\n  });\n  if(n)saveCart();\n  return n;\n}\nconst cartLines=()=>S.prod.items.filter(p=>S.cart[p.id]>0).map(p=>({p,qty:S.cart[p.id]}));\nconst cartCount=()=>cartLines().reduce((s,l)=>s+l.qty,0);\nconst cartTotal=()=>cartLines().reduce((s,l)=>s+l.qty*(Number(l.p.price)||0),0);\n/* Ставит количество в корзине (не больше остатка и 500). Возвращает, сколько в итоге стоит в корзине. */\nfunction cartSet(id,q){\n  const p=S.prod.items.find(x=>x.id===id),cap=p?maxQty(p):MAX_QTY;\n  q=Math.max(0,Math.floor(q)||0);\n  if(q>cap){\n    q=cap;\n    if(p&&typeof p.av==='number'&&p.av<MAX_QTY)toast(p.av>0?L('Осталось только '+p.av,'Faqat '+p.av+' ta qoldi'):L('Товар закончился','Mahsulot tugadi'));\n  }\n  if(q)S.cart[id]=q;else delete S.cart[id];\n  saveCart();\n  return q;\n}\nconst lowTxt=n=>L('Мало (осталось '+n+')','Oz qoldi ('+n+' ta)');\nconst shopAddress=()=>L(S.cfg.shop.address,S.cfg.shop.addressUz||S.cfg.shop.address);\nfunction activeMine(){return S.myOrders.filter(o=>o.status!=='done'&&o.status!=='cancelled').length}\nfunction newCount(){return S.allOrders.filter(o=>o.status==='new').length}\n\n/* language */\nfunction initLang(){\n  let l='';\n  try{l=localStorage.getItem('sh-lang')||''}catch(e){}\n  if(l!=='ru'&&l!=='uz'){\n    let tl='';\n    try{tl=String(S.tg&&S.tg.initDataUnsafe&&S.tg.initDataUnsafe.user&&S.tg.initDataUnsafe.user.language_code||'')}catch(e){}\n    l=(tl||navigator.language||'').toLowerCase().indexOf('uz')===0?'uz':'ru';\n  }\n  setLang(l);\n  document.documentElement.setAttribute('lang',LANG);\n}\nfunction switchLang(){\n  const next=LANG==='ru'?'uz':'ru';\n  setLang(next);\n  try{localStorage.setItem('sh-lang',next)}catch(e){}\n  document.documentElement.setAttribute('lang',next);\n  render();\n}\n\n/* nav */\nfunction renderNav(){\n  const items=[['shop',L('Каталог','Katalog'),cartCount()],['mine',L('Заказы','Buyurtmalar'),activeMine()]];\n  if(S.admin)items.push(['seller',L('Продавец','Sotuvchi'),newCount()]);\n  const nav=$('#nav');\n  nav.setAttribute('aria-label',L('Разделы','Boʻlimlar'));\n  nav.innerHTML=items.map(i=>'<button type=\"button\" data-act=\"nav\" data-v=\"'+i[0]+'\"'+(S.view===i[0]?' aria-current=\"page\"':'')+'>'+i[1]+(i[2]?' <span class=\"badge\">'+i[2]+'</span>':'')+'</button>').join('');\n  const name=S.cfg.shop.name||DEFAULT.shop.name;\n  $('#brandName').textContent=name;\n  document.title=name;\n  const lb=$('#langbtn');\n  lb.textContent=LANG==='ru'?'UZ':'RU';\n  lb.setAttribute('aria-label',L('Oʻzbek tiliga oʻtish','Переключить на русский'));\n  lb.title=L('Oʻzbekcha','Русский');\n}\n\n/* ---------- каталог (клиент) ---------- */\nconst shopCats=()=>S.prod.cats.filter(c=>S.prod.items.some(p=>p.cat===c.id));\nfunction qtyHTML(id,q,small){\n  const i=esc(id),pre=small?'c':'p',cap=capOf(id);\n  return '<div class=\"stepper'+(small?' sm':'')+'\"><button type=\"button\" data-act=\"'+pre+'minus\" data-id=\"'+i+'\" aria-label=\"'+esc(L('Меньше','Kamroq'))+'\">−</button>'\n    +'<input class=\"qty\" type=\"number\" inputmode=\"numeric\" min=\"0\" max=\"'+cap+'\" value=\"'+q+'\" data-qty=\"'+i+'\" aria-label=\"'+esc(L('Количество','Miqdori'))+'\">'\n    +'<button type=\"button\" data-act=\"'+pre+'plus\" data-id=\"'+i+'\" aria-label=\"'+esc(L('Больше','Koʻproq'))+'\"'+(q>=cap?' disabled':'')+'>+</button></div>';\n}\nfunction productCtl(p){\n  if(soldOut(p))return '<button type=\"button\" class=\"btn ghost sm padd\" disabled>'+L('Нет в наличии','Mavjud emas')+'</button>';\n  const q=S.cart[p.id]||0;\n  if(!q)return '<button type=\"button\" class=\"btn sm padd\" data-act=\"padd\" data-id=\"'+esc(p.id)+'\">'+L('В корзину','Savatga')+'</button>';\n  return qtyHTML(p.id,q,false);\n}\nfunction productCard(p){\n  const off=soldOut(p),d=prodDesc(p),w=weightLabel(p);\n  const status=off?'':(p.lw&&typeof p.av==='number'?'<div class=\"pst low\">'+esc(lowTxt(p.av))+'</div>':'<div class=\"pst\">'+L('В наличии','Mavjud')+'</div>');\n  return '<article class=\"pcard'+(off?' off':'')+'\" id=\"pc-'+esc(p.id)+'\"><div class=\"pimg\">'+pimg(p)+(off?'<span class=\"tag\">'+L('Нет в наличии','Mavjud emas')+'</span>':'')+'</div>'\n    +'<div class=\"pbody\"><div class=\"pname\">'+esc(nm(p))+'</div>'+(w?'<div class=\"pw\">'+esc(w)+'</div>':'')+status\n    +(d?'<div class=\"pdesc\" data-act=\"pdesc\">'+esc(d)+'</div>':'')\n    +'<div class=\"pprice\">'+money(p.price)+'</div><div class=\"pctl\">'+productCtl(p)+'</div></div></article>';\n}\n/* Сетка товаров: по выбранной категории и поиску. В режиме «Все» без поиска товары идут разделами по категориям. */\nfunction paintGrid(){\n  const g=$('#pgrid');if(!g)return;\n  const q=S.q.trim().toLowerCase();\n  const items=S.prod.items.filter(p=>(S.shopCat==='all'||p.cat===S.shopCat)&&(!q||((p.name||'')+' '+(p.uz||'')).toLowerCase().indexOf(q)>=0));\n  if(!items.length){g.innerHTML='<div class=\"empty\"><b>'+L('Ничего не найдено','Hech narsa topilmadi')+'</b>'+L('Измените запрос или выберите другую категорию.','Soʻrovni oʻzgartiring yoki boshqa kategoriyani tanlang.')+'</div>';return}\n  const cats=shopCats();\n  if(S.shopCat==='all'&&!q&&cats.length>=1){\n    const rest=items.filter(p=>!cats.some(c=>c.id===p.cat));\n    g.innerHTML=cats.map(c=>{const li=items.filter(p=>p.cat===c.id);return li.length?'<h2 class=\"chead\">'+esc(nm(c))+'</h2><div class=\"pgrid\">'+li.map(productCard).join('')+'</div>':''}).join('')\n      +(rest.length?'<div class=\"pgrid\" style=\"margin-top:20px\">'+rest.map(productCard).join('')+'</div>':'');\n  }else g.innerHTML='<div class=\"pgrid\">'+items.map(productCard).join('')+'</div>';\n}\nfunction paintShopBar(){\n  const bar=$('#bar');if(!bar)return;\n  const n=cartCount();\n  if(!n){bar.style.display='none';bar.innerHTML='';return}\n  bar.style.display='';\n  if(S.shopStep==='cart')bar.innerHTML='<div class=\"wrap\"><div><small>'+L('Итого, оплата при получении','Jami, olganda toʻlanadi')+'</small><strong id=\"ctotal\">'+money(cartTotal())+'</strong></div><button type=\"button\" class=\"btn\" data-act=\"submitorder\">'+L('Заказать','Buyurtma berish')+'</button></div>';\n  else bar.innerHTML='<div class=\"wrap\"><div><small>'+L('Корзина','Savat')+': '+n+' '+L('шт.','dona')+'</small><strong>'+money(cartTotal())+'</strong></div><button type=\"button\" class=\"btn\" data-act=\"opencart\">'+L('Оформить заказ','Buyurtma berish')+'</button></div>';\n}\nfunction renderShop(){\n  if(S.shopPlaced)return renderShopPlaced();\n  if(!S.prod.items.length){\n    view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Каталог пока пуст','Katalog hozircha boʻsh')+'</b>'+L('Загляните позже.','Keyinroq qaytib keling.')+'</div></div>';\n    return;\n  }\n  if(S.shopStep==='cart'&&cartCount()>0)return renderCart();\n  S.shopStep='list';\n  const cats=shopCats();\n  if(S.shopCat!=='all'&&!cats.some(c=>c.id===S.shopCat))S.shopCat='all';\n  const chips=cats.length>1?'<div class=\"pchips\" role=\"group\" aria-label=\"'+esc(L('Категории','Kategoriyalar'))+'\">'\n    +[['all',L('Все','Barchasi')]].concat(cats.map(c=>[c.id,nm(c)])).map(c=>'<button type=\"button\" class=\"chip\" data-act=\"scat\" data-id=\"'+esc(c[0])+'\" aria-pressed=\"'+(S.shopCat===c[0])+'\">'+esc(c[1])+'</button>').join('')+'</div>':'';\n  const search=S.prod.items.length>8?'<div class=\"search\"><input type=\"search\" id=\"q\" value=\"'+esc(S.q)+'\" placeholder=\"'+esc(L('Поиск по названию','Nomi boʻyicha qidirish'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Поиск по названию','Nomi boʻyicha qidirish'))+'\"></div>':'';\n  view.innerHTML='<div class=\"wrap shop\"><div class=\"eyebrow\">'+L('Каталог','Katalog')+'</div><h1>'+esc(S.cfg.shop.name||DEFAULT.shop.name)+'</h1>'+search+chips+'<div id=\"pgrid\"></div></div><div class=\"bar\" id=\"bar\"></div>';\n  paintGrid();paintShopBar();\n}\nfunction paintShopCtl(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.querySelector('#pc-'+CSS.escape(id)+' .pctl');\n  if(p&&el)el.innerHTML=productCtl(p);\n  paintShopBar();renderNav();\n}\nfunction paintCartLines(){\n  const el=$('#clines');if(!el)return;\n  el.innerHTML=cartLines().map(l=>{\n    const p=l.p,w=weightLabel(p);\n    return '<div class=\"cline\" id=\"cl-'+esc(p.id)+'\"><div class=\"cth\">'+pimg(p)+'</div><div class=\"cn\"><b>'+esc(nm(p))+'</b><small>'+(w?esc(w)+' · ':'')+money(p.price)+'</small>'\n      +(p.lw&&typeof p.av==='number'?'<small class=\"lowtxt\">'+esc(lowTxt(p.av))+'</small>':'')+'</div>'\n      +'<div class=\"cr\">'+qtyHTML(p.id,l.qty,true)+'<div class=\"cs\">'+money(l.qty*(Number(p.price)||0))+'</div></div></div>';\n  }).join('');\n  const t=$('#ctotalrow');if(t)t.textContent=money(cartTotal());\n}\n/* Меняет суммы на экране, не перерисовывая поле, в которое клиент печатает количество. */\nfunction refreshTotals(id){\n  const p=S.prod.items.find(x=>x.id===id),line=document.querySelector('#cl-'+CSS.escape(id)+' .cs');\n  if(p&&line)line.textContent=money((S.cart[id]||0)*(Number(p.price)||0));\n  const cap=capOf(id);\n  document.querySelectorAll('[data-act=\"pplus\"],[data-act=\"cplus\"]').forEach(b=>{if(b.dataset.id===id)b.disabled=(S.cart[id]||0)>=cap});\n  const t=$('#ctotalrow');if(t)t.textContent=money(cartTotal());\n  paintShopBar();renderNav();\n}\n/* Поля заказа: способ получения, имя, телефон, адрес (для доставки), дата, время, комментарий */\nfunction formHTML(pk){\n  const del=mode()==='delivery',canDel=S.cfg.shop.delivery!==false;\n  return '<div class=\"form\">'\n    +(canDel?'<div class=\"full\"><div class=\"seg\" role=\"group\" aria-label=\"'+esc(L('Способ получения','Olish usuli'))+'\"><button type=\"button\" data-act=\"mode\" data-v=\"pickup\" aria-pressed=\"'+(!del)+'\">'+L('Самовывоз','Olib ketish')+'</button><button type=\"button\" data-act=\"mode\" data-v=\"delivery\" aria-pressed=\"'+del+'\">'+L('Доставка','Yetkazib berish')+'</button></div></div>':'')\n    +'<div><label class=\"lab\" for=\"f-name\">'+L('Ваше имя или название компании','Ismingiz yoki kompaniya nomi')+'</label><input type=\"text\" id=\"f-name\" data-f=\"name\" value=\"'+esc(S.form.name)+'\" autocomplete=\"name\"><div class=\"err\" id=\"e-name\"></div></div>'\n    +'<div><label class=\"lab\" for=\"f-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"f-phone\" data-f=\"phone\" value=\"'+esc(S.form.phone)+'\" placeholder=\"+998 90 123 45 67\" autocomplete=\"tel\"><div class=\"err\" id=\"e-phone\"></div></div>'\n    +(del?'<div class=\"full\"><label class=\"lab\" for=\"f-address\">'+L('Адрес доставки','Yetkazib berish manzili')+'</label><textarea id=\"f-address\" data-f=\"address\" rows=\"2\" maxlength=\"200\" placeholder=\"'+esc(L('Город, улица, дом, ориентир','Shahar, koʻcha, uy, moʻljal'))+'\" autocomplete=\"street-address\">'+esc(S.form.address)+'</textarea><div class=\"err\" id=\"e-address\"></div></div>':'')\n    +'<div><label class=\"lab\" for=\"f-date\">'+(del?L('Дата доставки','Yetkazib berish sanasi'):L('Дата получения','Olish sanasi'))+'</label><input type=\"date\" id=\"f-date\" data-f=\"date\" min=\"'+pk.min+'\" max=\"'+pk.max+'\" value=\"'+esc(S.form.date)+'\"><div class=\"err\" id=\"e-date\"></div></div>'\n    +'<div><label class=\"lab\" for=\"f-time\">'+L('Время','Vaqt')+'</label><select id=\"f-time\" data-f=\"time\"></select><div class=\"err\" id=\"e-time\"></div></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"f-comment\">'+L('Пожелания к заказу','Buyurtmaga istaklar')+'</label><textarea id=\"f-comment\" data-f=\"comment\" placeholder=\"'+esc(L('Как позвонить, пожелания к упаковке','Qachon qoʻngʻiroq qilish, qadoqlash boʻyicha istaklar'))+'\">'+esc(S.form.comment)+'</textarea></div>'\n    +'</div>';\n}\nfunction fillTimes(){\n  const sel=$('#f-time');if(!sel)return;\n  const list=S.form.date?pickup().slots(S.form.date):[];\n  if(!list.includes(S.form.time))S.form.time='';\n  sel.innerHTML='<option value=\"\">'+(list.length?L('Выберите время','Vaqtni tanlang'):L('На эту дату нет свободного времени','Bu sanaga boʻsh vaqt yoʻq'))+'</option>'+list.map(t=>'<option value=\"'+t+'\"'+(t===S.form.time?' selected':'')+'>'+t+'</option>').join('');\n}\nfunction cartNote(){\n  const sh=S.cfg.shop,addr=shopAddress(),hrs=esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00;';\n  if(mode()==='delivery')return L('Оплата только при получении товара. Доставка не раньше чем через '+esc(sh.deliveryLeadHours)+' ч после заказа, время доставки '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.',\n    'Toʻlov faqat mahsulotni olganda. Yetkazib berish buyurtmadan kamida '+esc(sh.deliveryLeadHours)+' soat keyin, vaqti '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.');\n  return L('Оплата только при получении'+(addr?' в точке: '+esc(addr):'')+'. Заказ можно забрать не раньше чем через '+esc(sh.leadHours)+' ч после оформления, часы выдачи '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.',\n    'Toʻlov faqat buyurtmani olganda'+(addr?': '+esc(addr):'')+'. Buyurtmani kamida '+esc(sh.leadHours)+' soatdan keyin olish mumkin, topshirish vaqti '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.');\n}\nfunction renderCart(){\n  normalizeMode();\n  const pk=pickup();\n  if(!S.form.date||S.form.date<pk.min)S.form.date=pk.min;\n  S.shopStep='cart';\n  view.innerHTML='<div class=\"wrap shop\"><button type=\"button\" class=\"btn ghost sm backlink\" data-act=\"shoplist\">← '+L('К каталогу','Katalogga')+'</button><h1>'+L('Корзина','Savat')+'</h1><div class=\"stack\">'\n    +'<div class=\"card\" id=\"clines\" style=\"margin-bottom:0\"></div>'\n    +'<div class=\"sum\"><div class=\"r t\"><span>'+L('Итого','Jami')+'</span><span id=\"ctotalrow\"></span></div></div>'\n    +'<section class=\"sec\" style=\"padding-top:6px\"><h2>'+L('Получение заказа','Buyurtmani olish')+'</h2><div class=\"stack\">'\n    +formHTML(pk)\n    +'<div class=\"note\" id=\"cnote\">'+cartNote()+'</div>'\n    +'<button type=\"button\" class=\"btn\" id=\"submit\" data-act=\"submitorder\">'+L('Заказать','Buyurtma berish')+'</button>'\n    +'</div></section></div></div><div class=\"bar\" id=\"bar\"></div>';\n  paintCartLines();fillTimes();paintShopBar();\n}\nconst tgLink=o=>{\n  const h=String(S.cfg.shop.telegram||'').replace(/^@/,'').trim();\n  if(!h)return '';\n  return 'https://t.me/'+encodeURIComponent(h)+'?text='+encodeURIComponent(L('Здравствуйте! Вопрос по заказу ','Assalomu alaykum! Buyurtma boʻyicha savol: ')+o.id);\n};\nfunction itemRow(it){return '<span>'+esc(nm(it))+(weightLabel(it)?' ('+esc(weightLabel(it))+')':'')+' × '+it.qty+'</span><span>'+money(it.price*it.qty)+'</span>'}\nfunction renderShopPlaced(){\n  const o=S.shopPlaced.order,tg=tgLink(o),del=o.mode==='delivery';\n  view.innerHTML='<div class=\"wrap page\"><div class=\"stack\" style=\"max-width:560px\"><div><div class=\"eyebrow\">'+L('Заказ отправлен','Buyurtma yuborildi')+'</div><h1>'+L('Номер ','Raqam ')+esc(o.id)+'</h1></div>'\n    +'<div class=\"note\">'+L('Продавец получил заказ и скоро подтвердит его. Мы напишем вам в этом чате, когда статус изменится. Оплата только при получении.','Sotuvchi buyurtmani oldi va tez orada tasdiqlaydi. Holat oʻzgarganda shu chatda yozamiz. Toʻlov faqat olganda.')+'</div>'\n    +'<div class=\"sum\"><div class=\"r\"><span>'+(del?L('Доставка','Yetkazib berish'):L('Самовывоз','Olib ketish'))+'</span><span>'+esc(fmtWhen(o.pickupAt))+'</span></div>'\n    +(del?'<div class=\"r\"><span>'+L('Адрес','Manzil')+'</span><span style=\"white-space:normal;text-align:right\">'+esc(o.address)+'</span></div>':'')\n    +(o.items||[]).map(it=>'<div class=\"r\">'+itemRow(it)+'</div>').join('')\n    +'<div class=\"r t\"><span>'+L('К оплате при получении','Olganda toʻlanadi')+'</span><span>'+money(o.total)+'</span></div></div>'\n    +'<div class=\"row-btns\">'+(tg?'<a class=\"btn ghost\" data-act=\"contact\" href=\"'+tg+'\" target=\"_blank\" rel=\"noopener\">'+L('Написать продавцу','Sotuvchiga yozish')+'</a>':'')\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"shopagain\">'+L('Ещё из каталога','Katalogdan yana')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"nav\" data-v=\"mine\">'+L('Мои заказы','Mening buyurtmalarim')+'</button></div></div></div>';\n}\nfunction validate(){\n  const e={},f=S.form;\n  if(!f.name.trim())e.name=L('Укажите имя','Ismingizni kiriting');\n  if(f.phone.replace(/\\D/g,'').length<9)e.phone=L('Укажите номер телефона','Telefon raqamini kiriting');\n  if(mode()==='delivery'&&f.address.trim().length<5)e.address=L('Укажите адрес доставки','Yetkazib berish manzilini kiriting');\n  if(!f.date)e.date=L('Выберите дату','Sanani tanlang');\n  if(f.date&&!f.time)e.time=L('Выберите время','Vaqtni tanlang');\n  return e;\n}\nconst FIELDS=['name','phone','address','date','time'];\nfunction orderErrText(er){\n  return {\n    too_many:L('У вас уже есть несколько неподтверждённых заказов. Дождитесь ответа продавца.','Sizda tasdiqlanmagan buyurtmalar bor. Sotuvchi javobini kuting.'),\n    pickup:L('Это время уже недоступно. Выберите другое.','Bu vaqt endi mavjud emas. Boshqasini tanlang.'),\n    auth:L('Сессия устарела. Закройте и снова откройте приложение в боте.','Seans eskirdi. Ilovani yopib, botdan qayta oching.'),\n    expired:L('Сессия устарела. Закройте и снова откройте приложение в боте.','Seans eskirdi. Ilovani yopib, botdan qayta oching.'),\n    busy:L('Сейчас много заказов. Попробуйте чуть позже.','Hozir buyurtmalar koʻp. Birozdan keyin urinib koʻring.')\n  }[er]||L('Не удалось отправить заказ. Проверьте соединение и попробуйте ещё раз.','Buyurtmani yuborib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.');\n}\nasync function submitOrder(){\n  if(S.busy)return;\n  const lines=cartLines();\n  if(!lines.length){S.shopStep='list';renderShop();return}\n  const e=validate();\n  FIELDS.forEach(k=>{\n    const el=$('#e-'+k),inp=$('#f-'+k);\n    if(el)el.textContent=e[k]||'';\n    if(inp)inp.setAttribute('aria-invalid',e[k]?'true':'false');\n  });\n  const first=FIELDS.find(k=>e[k]);\n  if(first){const inp=$('#f-'+first);if(inp){inp.focus();try{inp.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}}return}\n  if(!S.auth){toast(L('Откройте приложение через бота в Telegram, чтобы оформить заказ','Buyurtma berish uchun ilovani Telegramdagi bot orqali oching'));return}\n  S.busy=true;\n  const btn=$('#submit');if(btn){btn.disabled=true;btn.textContent=L('Отправляем…','Yuborilmoqda…')}\n  const f=S.form,del=mode()==='delivery';\n  const r=await api('POST','/api/order',{\n    cart:lines.map(l=>({id:l.p.id,qty:l.qty})),\n    form:{name:f.name.trim(),phone:f.phone.trim(),mode:mode(),address:del?f.address.trim():'',date:f.date,time:f.time,comment:f.comment.trim()},\n    lang:LANG,expectTotal:cartTotal()\n  });\n  S.busy=false;\n  if(!r.ok){\n    const er=r.data&&r.data.error;\n    if(r.data&&r.data.cfg){S.cfg=mergeCfg(r.data.cfg);normalizeMode()}\n    if(r.data&&r.data.prod)S.prod=normProd(r.data.prod);\n    if(er==='stock'){\n      /* товара меньше, чем в корзине: показываем, сколько осталось, и уменьшаем корзину */\n      const short=Array.isArray(r.data.short)?r.data.short:[];\n      const what=short.slice(0,3).map(s=>{\n        const p=S.prod.items.find(x=>x.id===s.id),n=Number(s.avail)||0;\n        return (p?nm(p):'')+': '+(n>0?L('осталось '+n,'faqat '+n+' ta qoldi'):L('нет в наличии','mavjud emas'));\n      }).join('; ')+(short.length>3?'…':'');\n      short.forEach(s=>{\n        const n=Number(s.avail)||0;\n        if(n<=0)delete S.cart[s.id];else if((S.cart[s.id]||0)>n)S.cart[s.id]=n;\n      });\n      saveCart();pruneCart();\n      S.shopStep=cartCount()?'cart':'list';\n      renderNav();renderShop();\n      toast(L('Столько товара нет на складе. '+what+'. Мы обновили корзину.','Omborda buncha mahsulot yoʻq. '+what+'. Savatni yangiladik.'));\n      return;\n    }\n    if(er==='price_changed'||er==='unavailable'||er==='no_delivery'){\n      pruneCart();\n      S.shopStep=cartCount()?'cart':'list';\n      renderNav();renderShop();\n      toast(er==='price_changed'?L('Продавец обновил цены. Проверьте сумму и оформите заказ ещё раз.','Sotuvchi narxlarni yangiladi. Summani tekshirib, qaytadan buyurtma bering.')\n        :er==='no_delivery'?L('Доставка сейчас недоступна. Выберите самовывоз.','Hozir yetkazib berish mavjud emas. Olib ketishni tanlang.')\n        :L('Что-то из корзины закончилось, мы обновили её. Проверьте заказ и оформите ещё раз.','Savatdagi baʼzi narsalar tugadi, savatni yangiladik. Buyurtmani tekshirib, qaytadan bering.'));\n      return;\n    }\n    renderShop();toast(orderErrText(er));\n    return;\n  }\n  const order=r.data.order;\n  S.cart={};saveCart();\n  S.shopPlaced={order};S.shopStep='list';\n  S.myOrders=[order].concat(S.myOrders.filter(o=>o.id!==order.id));\n  S.form.comment='';\n  try{S.tg&&S.tg.HapticFeedback&&S.tg.HapticFeedback.notificationOccurred('success')}catch(x){}\n  renderNav();renderShop();\n  window.scrollTo(0,0);\n}\n\n/* ---------- orders ---------- */\nconst pill=o=>{const t=stOf(o.status,o.mode);return '<span class=\"st '+t.c+'\">'+esc(nm(t))+'</span>'};\nfunction sellerActs(o){\n  const a=(to,label)=>'<button type=\"button\" class=\"btn sm\" data-act=\"status\" data-id=\"'+esc(o.id)+'\" data-to=\"'+to+'\">'+label+'</button>';\n  const del=o.mode==='delivery';\n  if(o.status==='new')return a('accepted',L('Принять в работу','Ishga qabul qilish'))+cancelBtn(o);\n  if(o.status==='accepted')return a('ready',del?L('Готов к отправке','Joʻnatishga tayyor'):L('Готов к выдаче','Topshirishga tayyor'))+cancelBtn(o);\n  if(o.status==='ready')return a('done',del?L('Доставлен клиенту','Mijozga yetkazildi'):L('Выдан клиенту','Mijozga topshirildi'))+cancelBtn(o);\n  return '';\n}\nfunction cancelBtn(o){\n  const sure=S.cc===o.id;\n  return '<button type=\"button\" class=\"btn ghost sm\" data-act=\"scancel\" data-id=\"'+esc(o.id)+'\">'+(sure?L('Точно отменить?','Aniq bekor qilinsinmi?'):L('Отменить','Bekor qilish'))+'</button>';\n}\nfunction orderCard(o,m){\n  const acts=m==='seller'?sellerActs(o):(o.status==='new'?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"mycancel\" data-id=\"'+esc(o.id)+'\">'+(S.cc===o.id?L('Точно отменить?','Aniq bekor qilinsinmi?'):L('Отменить заказ','Buyurtmani bekor qilish'))+'</button>':'');\n  const first=(o.items||[]).map(i=>S.prod.items.find(p=>p.id===i.id)).find(p=>p&&p.pv);\n  const del=o.mode==='delivery';\n  return '<article class=\"ord'+(m==='seller'&&o.status==='new'?' is-new':'')+'\"><div class=\"th\">'+(first?'<img src=\"'+imgUrl(first)+'\" alt=\"\" loading=\"lazy\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>')+'</div><div class=\"ob\">'\n    +'<div class=\"oh\"><span class=\"oid\">'+esc(o.id)+'</span>'+pill(o)+'</div>'\n    +'<div class=\"when\">'+esc(fmtWhen(o.pickupAt))+'</div>'\n    +'<div class=\"spec\">'+(del?L('Доставка: ','Yetkazib berish: ')+esc(o.address||''):L('Самовывоз','Olib ketish'))+'</div>'\n    +(o.items||[]).map(it=>'<div class=\"pl\">'+itemRow(it)+'</div>').join('')\n    +(m==='seller'?'<div class=\"cust\"><b>'+esc(o.name)+'</b> <span>'+esc(o.phone)+'</span>'+(o.tg&&o.tg.username?' <span>@'+esc(o.tg.username)+'</span>':'')+' <button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(o.phone)+'\">'+L('Копировать','Nusxalash')+'</button></div>':'')\n    +(o.comment?'<div class=\"cm\">'+esc(o.comment)+'</div>':'')\n    +'<div class=\"tot\"><b>'+money(o.total)+'</b><span>'+L('оплата при получении','olganda toʻlanadi')+'</span></div>'\n    +(acts?'<div class=\"acts\">'+acts+'</div>':'')\n    +'</div></article>';\n}\nfunction renderMine(){\n  let h='<div class=\"wrap page\"><h1>'+L('Мои заказы','Mening buyurtmalarim')+'</h1>';\n  if(!S.ready)h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!S.auth)h+='<div class=\"empty\"><b>'+L('Откройте через бота','Bot orqali oching')+'</b>'+L('Чтобы видеть свои заказы, откройте приложение из бота в Telegram.','Buyurtmalaringizni koʻrish uchun ilovani Telegramdagi botdan oching.')+'</div>';\n  else if(!S.myOrders.length)h+='<div class=\"empty\"><b>'+L('Пока нет заказов','Hozircha buyurtma yoʻq')+'</b>'+L('Выберите товары в каталоге, и заказ появится здесь со статусом.','Katalogdan mahsulot tanlang, buyurtma shu yerda holati bilan koʻrinadi.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"nav\" data-v=\"shop\">'+L('Открыть каталог','Katalogni ochish')+'</button></div>';\n  else{\n    const list=S.myOrders.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));\n    h+='<p class=\"lead\">'+L('Статус обновляется, когда продавец принимает и собирает заказ.','Sotuvchi buyurtmani qabul qilib yigʻganda holat yangilanadi.')+'</p><div class=\"ordlist\">'+list.map(o=>orderCard(o,'mine')).join('')+'</div>';\n  }\n  view.innerHTML=h+'</div>';\n}\n\n/* ---------- seller ---------- */\nfunction renderSeller(){\n  if(!S.admin){view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Раздел для продавца','Sotuvchi boʻlimi')+'</b>'+L('Откройте приложение с правами редактора.','Ilovani muharrir huquqi bilan oching.')+'</div></div>';return}\n  view.innerHTML='<div class=\"wrap page\"><h1>'+L('Панель продавца','Sotuvchi paneli')+'</h1><div class=\"tabs\" role=\"tablist\" id=\"stabs\"></div><div id=\"sbody\"></div></div>';\n  paintTabs();\n  paintSeller();\n}\n/* сколько товаров заканчивается или закончилось (число на вкладке «Остатки») */\nconst stockWarn=()=>S.prod.items.filter(p=>{const s=stState(p);return s==='low'||s==='out'}).length;\nfunction paintTabs(){\n  const el=$('#stabs');if(!el)return;\n  const w=stockWarn();\n  const tabs=[['orders',L('Заказы','Buyurtmalar')],['prod',L('Каталог','Katalog')],['stock',L('Остатки','Qoldiq')+(w?' <span class=\"badge warn\">'+w+'</span>':'')],['settings',L('Настройки','Sozlamalar')]];\n  el.innerHTML=tabs.map(t=>'<button type=\"button\" class=\"tab\" role=\"tab\" data-act=\"stab\" data-t=\"'+t[0]+'\" aria-selected=\"'+(S.sellerTab===t[0])+'\">'+t[1]+'</button>').join('');\n}\nfunction paintSeller(){\n  const b=$('#sbody');if(!b)return;\n  if(S.sellerTab==='orders')b.innerHTML=ordersHTML();\n  else if(S.sellerTab==='prod')b.innerHTML=prodHTML();\n  else if(S.sellerTab==='stock')b.innerHTML=stockHTML();\n  else b.innerHTML=settingsHTML();\n  paintSave();\n}\nfunction ordersHTML(){\n  const all=S.allOrders,today=ymd(shopNow());\n  const act=o=>o.status==='new'||o.status==='accepted'||o.status==='ready';\n  const nNew=all.filter(o=>o.status==='new').length;\n  const nWork=all.filter(o=>o.status==='accepted').length;\n  const nToday=all.filter(o=>act(o)&&String(o.pickupAt).slice(0,10)===today).length;\n  const sum=Number(S.stats.doneSum)||0;\n  let h='<div class=\"stats\"><div class=\"stat'+(nNew?' hot':'')+'\"><small>'+L('Новые','Yangi')+'</small><b>'+nNew+'</b></div><div class=\"stat\"><small>'+L('В работе','Ishlanmoqda')+'</small><b>'+nWork+'</b></div><div class=\"stat\"><small>'+L('На сегодня','Bugunga')+'</small><b>'+nToday+'</b></div><div class=\"stat\"><small>'+L('Завершено на сумму','Yakunlangan summa')+'</small><b>'+money(sum)+'</b></div></div>';\n  const fl=[['active',L('Активные','Faol')],['done',L('Завершены','Yakunlangan')],['cancelled',L('Отменены','Bekor qilingan')],['all',L('Все','Hammasi')]];\n  h+='<div class=\"filters\">'+fl.map(f=>'<button type=\"button\" class=\"chip\" data-act=\"filter\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(S.filter===f[0])+'\">'+f[1]+'</button>').join('')+'</div>';\n  let list=all.filter(o=>S.filter==='all'?true:S.filter==='active'?act(o):o.status===S.filter);\n  if(S.filter==='active')list.sort((a,b)=>String(a.pickupAt).localeCompare(String(b.pickupAt)));\n  else list.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));\n  if(!list.length)h+='<div class=\"empty\"><b>'+(all.length?L('В этом списке пусто','Bu roʻyxat boʻsh'):L('Заказов пока нет','Hozircha buyurtma yoʻq'))+'</b>'+(all.length?L('Выберите другой фильтр.','Boshqa filtrni tanlang.'):L('Когда клиент оформит заказ, он появится здесь с составом, адресом и телефоном.','Mijoz buyurtma berganda, u shu yerda tarkibi, manzili va telefoni bilan paydo boʻladi.'))+'</div>';\n  else h+='<div class=\"ordlist\">'+list.map(o=>orderCard(o,'seller')).join('')+'</div>';\n  return h;\n}\nfunction photoBlock(p){\n  const id=esc(p.id),busy=!!S.upl[p.id];\n  return '<div class=\"pthumb\">'+pimg(p)+'</div><div class=\"pbtns\">'\n    +'<label class=\"btn ghost sm'+(busy?' dis':'')+'\" for=\"ph-'+id+'\">'+(busy?L('Загрузка…','Yuklanmoqda…'):(p.pv?L('Заменить фото','Rasmni almashtirish'):L('Загрузить фото','Rasm yuklash')))+'</label>'\n    +'<input type=\"file\" class=\"sr\" id=\"ph-'+id+'\" accept=\"image/*\" data-photo=\"'+id+'\"'+(busy?' disabled':'')+'>'\n    +(p.pv&&!busy?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"phdel\" data-id=\"'+id+'\">'+L('Убрать фото','Rasmni olib tashlash')+'</button>':'')\n    +'</div>';\n}\nfunction paintPhoto(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.getElementById('pph-'+id);\n  if(p&&el)el.innerHTML=photoBlock(p);\n}\nfunction prodRow(p){\n  const id=esc(p.id);\n  const fld=(k,lab,inner,cls)=>'<div'+(cls?' class=\"'+cls+'\"':'')+'><label class=\"lab\" for=\"p'+k+'-'+id+'\">'+lab+'</label>'+inner+'</div>';\n  const inp=(k,type,val,extra)=>'<input type=\"'+type+'\" id=\"p'+k+'-'+id+'\" data-pid=\"'+id+'\" data-pp=\"'+k+'\" value=\"'+esc(val)+'\"'+(extra||'')+'>';\n  const ta=(k,val)=>'<textarea id=\"p'+k+'-'+id+'\" data-pid=\"'+id+'\" data-pp=\"'+k+'\" maxlength=\"300\" rows=\"2\">'+esc(val)+'</textarea>';\n  return '<div class=\"prow'+(p.on===false?' off':'')+'\" id=\"prow-'+id+'\"><div class=\"pph\" id=\"pph-'+id+'\">'+photoBlock(p)+'</div><div class=\"pf\">'\n    +fld('name',L('Название','Nomi'),inp('name','text',p.name,' maxlength=\"60\"'),'full')\n    +fld('uz',L('Название по-узбекски','Oʻzbekcha nomi'),inp('uz','text',p.uz||'',' maxlength=\"60\"'),'full')\n    +fld('desc',L('Описание','Tavsif'),ta('desc',p.desc||''),'full')\n    +fld('descUz',L('Описание по-узбекски','Oʻzbekcha tavsif'),ta('descUz',p.descUz||''),'full')\n    +fld('cat',L('Категория','Kategoriya'),'<select id=\"pcat-'+id+'\" data-pid=\"'+id+'\" data-pp=\"cat\">'+S.prod.cats.map(c=>'<option value=\"'+esc(c.id)+'\"'+(p.cat===c.id?' selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select>','full')\n    +fld('amount',L('Вес или объём единицы','Birlik ogʻirligi yoki hajmi'),inp('amount','number',p.amount||0,' inputmode=\"decimal\" step=\"any\" min=\"0\"'))\n    +fld('unit',L('Единица','Birlik'),'<select id=\"punit-'+id+'\" data-pid=\"'+id+'\" data-pp=\"unit\">'+UNIT_IDS.map(u=>'<option value=\"'+u+'\"'+(p.unit===u?' selected':'')+'>'+esc(unitName(u))+'</option>').join('')+'</select>')\n    +fld('price',L('Цена за единицу, сум','Birlik narxi, soʻm'),inp('price','number',p.price||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +'<div class=\"avail\"><label class=\"chk\"><input type=\"checkbox\" data-pid=\"'+id+'\" data-pp=\"on\"'+(p.on!==false?' checked':'')+'> '+L('В наличии','Mavjud')+'</label></div>'\n    +(S.stk[p.id]?'<div class=\"full unit\" style=\"margin:0\">'+L('Ведётся учёт остатка: свободно '+num(stkAvail(S.stk[p.id]))+' шт. Меняется на вкладке «Остатки». Когда свободного нет, товар закрывается сам.','Qoldiq hisobi yuritiladi: boʻsh '+num(stkAvail(S.stk[p.id]))+' dona. «Qoldiq» boʻlimida oʻzgartiriladi. Boʻsh qoldiq boʻlmasa, mahsulot oʻzi yopiladi.')+'</div>':'')\n    +'<div class=\"full pact\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmove\" data-id=\"'+id+'\" data-d=\"-1\" aria-label=\"'+esc(L('Выше','Yuqoriga'))+'\">▲</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmove\" data-id=\"'+id+'\" data-d=\"1\" aria-label=\"'+esc(L('Ниже','Pastga'))+'\">▼</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"pdel\" data-id=\"'+id+'\">'+(S.cd===p.id?L('Точно удалить?','Aniq oʻchirilsinmi?'):L('Удалить товар','Mahsulotni oʻchirish'))+'</button></div>'\n    +'</div></div>';\n}\nfunction prodHTML(){\n  const P=S.prod;\n  if(S.pfilter!=='all'&&!P.cats.some(c=>c.id===S.pfilter))S.pfilter='all';\n  const list=P.items.filter(p=>S.pfilter==='all'||p.cat===S.pfilter);\n  let h='<div class=\"note\" style=\"margin-bottom:14px\">'+L('Каталог товаров. Сначала создайте категории, затем добавляйте товары: название, описание, вес, цену и фото. Клиенты видят изменения сразу. Фото сжимается на телефоне. Снимите галочку «В наличии», если товара нет: он останется в каталоге серым.','Mahsulotlar katalogi. Avval kategoriyalar yarating, keyin mahsulotlar qoʻshing: nomi, tavsifi, ogʻirligi, narxi va rasmi. Mijozlar oʻzgarishlarni darhol koʻradi. Rasm telefonda siqiladi. Mahsulot boʻlmasa, «Mavjud» belgisini olib tashlang: u katalogda kulrang boʻlib qoladi.')+'</div>'\n    +'<div class=\"savebar\" id=\"savebar\"></div>';\n  h+='<div class=\"card\"><h3>'+L('Категории','Kategoriyalar')+'</h3><div class=\"unit\">'+L('Название по-русски и по-узбекски. Удалить можно пустую категорию.','Ruscha va oʻzbekcha nomi. Faqat boʻsh kategoriyani oʻchirish mumkin.')+'</div>';\n  P.cats.forEach(c=>{\n    const id=esc(c.id);\n    h+='<div class=\"crow\"><input type=\"text\" data-cid=\"'+id+'\" data-cp=\"name\" value=\"'+esc(c.name)+'\" maxlength=\"40\" aria-label=\"'+esc(L('Название категории','Kategoriya nomi'))+'\"><input type=\"text\" data-cid=\"'+id+'\" data-cp=\"uz\" value=\"'+esc(c.uz||'')+'\" maxlength=\"40\" placeholder=\"Oʻzbekcha nomi\" aria-label=\"Oʻzbekcha nomi\"><button type=\"button\" class=\"x\" data-act=\"cdel\" data-id=\"'+id+'\" aria-label=\"'+esc(L('Удалить категорию','Kategoriyani oʻchirish'))+'\">×</button></div>';\n  });\n  h+='<div style=\"margin-top:8px\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"cadd\">'+L('+ Добавить категорию','+ Kategoriya qoʻshish')+'</button></div></div>';\n  h+='<div class=\"card\"><h3>'+L('Товары','Mahsulotlar')+' · '+P.items.length+'</h3>';\n  if(P.cats.length>1)h+='<div class=\"filters\" style=\"margin:8px 0 4px\">'+[['all',L('Все','Barchasi')]].concat(P.cats.map(c=>[c.id,c.name])).map(c=>'<button type=\"button\" class=\"chip\" data-act=\"pfilter\" data-id=\"'+esc(c[0])+'\" aria-pressed=\"'+(S.pfilter===c[0])+'\">'+esc(c[1])+'</button>').join('')+'</div>';\n  if(!list.length)h+='<div class=\"unit\" style=\"padding:10px 0\">'+(P.items.length?L('В этой категории пока ничего нет.','Bu kategoriyada hozircha hech narsa yoʻq.'):L('Товаров пока нет. Нажмите «Добавить товар».','Mahsulotlar hozircha yoʻq. «Mahsulot qoʻshish» tugmasini bosing.'))+'</div>';\n  list.forEach(p=>{h+=prodRow(p)});\n  h+='<div style=\"margin-top:10px\"><button type=\"button\" class=\"btn\" data-act=\"pnew\">'+L('+ Добавить товар','+ Mahsulot qoʻshish')+'</button></div></div>';\n  return h;\n}\n/* ---------- seller: остатки ---------- */\n/* состояние учёта товара: none (не ведётся), ok, low (мало), out (свободного нет) */\nfunction stState(p){\n  const s=S.stk[p.id];\n  if(!s)return 'none';\n  const a=stkAvail(s);\n  return a===0?'out':(s.low>0&&a<=s.low?'low':'ok');\n}\n/* переносит остатки в каталог на экране, чтобы продавец видел витрину так же, как клиент */\nfunction applyStk(){\n  S.prod.items.forEach(p=>{\n    const v=stkPublic(S.stk[p.id],MAX_QTY);\n    delete p.av;delete p.lw;\n    if(v){p.av=v.av;if(v.lw)p.lw=1}\n  });\n}\nfunction statsHTML(){\n  const c={none:0,ok:0,low:0,out:0};\n  S.prod.items.forEach(p=>{c[stState(p)]++});\n  const st=(lab,v,hot)=>'<div class=\"stat'+(hot?' hot':'')+'\"><small>'+lab+'</small><b>'+v+'</b></div>';\n  return st(L('Под учётом','Hisobda'),c.ok+c.low+c.out)+st(L('Без учёта','Hisobsiz'),c.none)+st(L('Заканчивается','Tugayapti'),c.low,c.low>0)+st(L('Нет свободного','Boʻshi yoʻq'),c.out,c.out>0);\n}\nfunction stockRowHTML(p){\n  const id=esc(p.id),s=S.stk[p.id],st=stState(p),dis=S.sbusy[p.id]?' disabled':'',w=weightLabel(p);\n  const cat=S.prod.cats.find(c=>c.id===p.cat);\n  const pill=st==='none'?'<span class=\"st mute\">'+L('Без учёта','Hisobsiz')+'</span>'\n    :st==='out'?'<span class=\"st bad\">'+L('Нет свободного','Boʻshi yoʻq')+'</span>'\n    :st==='low'?'<span class=\"st warn\">'+L('Заканчивается','Tugayapti')+'</span>'\n    :'<span class=\"st ok\">'+L('В наличии','Mavjud')+'</span>';\n  const head='<div class=\"sh\"><div class=\"sn\"><b>'+esc(p.name)+'</b><small>'+(w?esc(w):'')+(w&&cat?' · ':'')+(cat?esc(cat.name):'')+'</small></div>'+pill+'</div>';\n  const numIn=(k,ph,aria,val)=>'<input type=\"number\" id=\"'+k+'-'+id+'\" inputmode=\"numeric\" min=\"0\" max=\"1000000\" step=\"1\"'+(k==='sl'?' data-sl=\"'+id+'\"':'')+' value=\"'+val+'\" placeholder=\"'+esc(ph)+'\" aria-label=\"'+esc(aria)+'\"'+dis+'>';\n  const lowIn='<div class=\"sth\"><label for=\"sl-'+id+'\">'+L('Предупредить, когда меньше','Bundan kam qolsa ogohlantirish')+'</label>'+numIn('sl','0',L('Порог «мало»','«Oz qoldi» chegarasi'),s?s.low:'')+'</div>';\n  if(!s){\n    return '<div class=\"srow\" id=\"srow-'+id+'\">'+head\n      +'<div class=\"sact\">'+numIn('sn',L('Сколько на складе','Omborda qancha'),L('Сколько сейчас на складе','Hozir omborda qancha'),'')\n      +'<button type=\"button\" class=\"btn sm\" data-act=\"sstart\" data-id=\"'+id+'\"'+dis+'>'+L('Начать учёт','Hisobni boshlash')+'</button></div>'+lowIn+'</div>';\n  }\n  return '<div class=\"srow\" id=\"srow-'+id+'\">'+head\n    +'<div class=\"snum\"><div><small>'+L('На складе','Omborda')+'</small><b>'+num(s.q)+'</b></div><div><small>'+L('В заказах','Buyurtmalarda')+'</small><b>'+num(s.r)+'</b></div><div class=\"fr '+st+'\"><small>'+L('Свободно','Boʻsh')+'</small><b>'+num(stkAvail(s))+'</b></div></div>'\n    +'<div class=\"sact\">'+numIn('sn',L('Количество','Miqdori'),L('Количество','Miqdori'),'')\n    +'<button type=\"button\" class=\"btn sm\" data-act=\"sin\" data-id=\"'+id+'\"'+dis+'>'+L('+ Приход','+ Kirim')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sset\" data-id=\"'+id+'\"'+dis+'>'+L('Задать остаток','Qoldiqni belgilash')+'</button></div>'\n    +lowIn\n    +'<div><button type=\"button\" class=\"btn ghost sm\" data-act=\"soff\" data-id=\"'+id+'\"'+dis+'>'+(S.sc===p.id?L('Точно отключить учёт?','Hisob oʻchirilsinmi?'):L('Отключить учёт','Hisobni oʻchirish'))+'</button></div></div>';\n}\nconst JR_KIND={start:['Начат учёт','Hisob boshlandi'],in:['Приход','Kirim'],fix:['Исправление остатка','Qoldiq tuzatildi'],out:['Списано по заказу','Buyurtma boʻyicha chiqim'],off:['Учёт отключён','Hisob oʻchirildi']};\nfunction jrDate(t){\n  const d=new Date(t);\n  if(isNaN(d))return '';\n  if(LANG==='uz')return d.getDate()+'-'+UZ_MO[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes());\n  return d.toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});\n}\nfunction jrHTML(){\n  if(!S.jr.length)return '<div class=\"unit\" style=\"padding:8px 0\">'+L('Записей пока нет.','Hozircha yozuv yoʻq.')+'</div>';\n  return S.jr.slice(0,60).map(x=>{\n    const k=JR_KIND[x.kind]||['',''],d=Number(x.d)||0;\n    const dd=x.kind==='off'?'—<small>'+L('было ','boʻlgan ')+num(x.q)+'</small>':(d>0?'+'+num(d):d<0?'−'+num(-d):'0')+'<small>'+L('стало ','boʻldi ')+num(x.q)+'</small>';\n    return '<div class=\"jrow\"><div class=\"jn\"><b>'+esc(x.name)+'</b><small>'+esc(L(k[0],k[1]))+(x.ref?' '+esc(x.ref):'')+' · '+esc(jrDate(x.t))+(x.by?' · '+esc(x.by):'')+'</small></div><div class=\"jd'+(x.kind!=='off'&&d>0?' plus':x.kind!=='off'&&d<0?' minus':'')+'\">'+dd+'</div></div>';\n  }).join('');\n}\nfunction stockHTML(){\n  if(!S.stkLoaded)return '<div class=\"empty\"><b>'+L('Загружаем остатки','Qoldiqlar yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  if(!S.prod.items.length)return '<div class=\"empty\"><b>'+L('Товаров пока нет','Mahsulotlar hozircha yoʻq')+'</b>'+L('Сначала добавьте товары на вкладке «Каталог».','Avval «Katalog» boʻlimida mahsulot qoʻshing.')+'</div>';\n  const fl=[['all',L('Все','Hammasi')],['low',L('Заканчивается','Tugayapti')],['out',L('Нет свободного','Boʻshi yoʻq')],['none',L('Без учёта','Hisobsiz')]];\n  const list=S.prod.items.filter(p=>{const s=stState(p);return S.sfilter==='all'||(S.sfilter==='low'?(s==='low'||s==='out'):s===S.sfilter)});\n  let h='<div class=\"note\" style=\"margin-bottom:14px\">'+L('Укажите, сколько единиц товара на складе (мешков, коробок, упаковок — как товар продаётся в каталоге). Заказ откладывает товар, при «Выдан» или «Доставлен» он списывается, при отмене возвращается. Когда свободного остаётся меньше порога, клиенты видят «Мало (осталось N)», а вам приходит сообщение в Telegram. Когда свободного нет, товар в каталоге становится серым сам.',\n    'Omborda necha birlik (qop, quti, qadoq — katalogda qanday sotilsa) borligini kiriting. Buyurtma mahsulotni band qiladi, «Topshirildi» yoki «Yetkazildi» boʻlganda ombordan chiqariladi, bekor qilinsa qaytadi. Boʻsh qoldiq chegaradan kam boʻlsa, mijozlar «Oz qoldi (N ta)» deb koʻradi, sizga Telegramda xabar keladi. Boʻsh qoldiq boʻlmasa, mahsulot katalogda oʻzi kulrang boʻladi.')+'</div>'\n    +'<div class=\"stats\" id=\"sstats\">'+statsHTML()+'</div>'\n    +'<div class=\"filters\">'+fl.map(f=>'<button type=\"button\" class=\"chip\" data-act=\"sfilter\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(S.sfilter===f[0])+'\">'+f[1]+'</button>').join('')+'</div>'\n    +'<div class=\"card\">'+(list.length?list.map(stockRowHTML).join(''):'<div class=\"unit\" style=\"padding:10px 0\">'+L('В этом списке пусто.','Bu roʻyxat boʻsh.')+'</div>')+'</div>'\n    +'<div class=\"card\"><h3>'+L('Журнал движений','Harakatlar jurnali')+'</h3><div class=\"unit\">'+L('Приходы, исправления и списания по выданным заказам. Показаны последние записи.','Kirimlar, tuzatishlar va topshirilgan buyurtmalar boʻyicha chiqimlar. Oxirgi yozuvlar koʻrsatilgan.')+'</div>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sjr\">'+(S.jrOpen?L('Скрыть журнал','Jurnalni yashirish'):L('Показать журнал','Jurnalni koʻrsatish'))+'</button>'\n    +'<div id=\"jrbody\">'+(S.jrOpen?jrHTML():'')+'</div></div>';\n  return h;\n}\nfunction paintStock(){\n  const b=$('#sbody');\n  if(b&&S.view==='seller'&&S.sellerTab==='stock')b.innerHTML=stockHTML();\n}\nfunction paintStockRow(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.getElementById('srow-'+id);\n  if(p&&el)el.outerHTML=stockRowHTML(p);\n  const st=$('#sstats');if(st)st.innerHTML=statsHTML();\n  paintTabs();\n}\nasync function loadStock(){\n  if(!S.admin)return;\n  const r=await api('GET','/api/admin/stock');\n  if(!r.ok||!r.data||!r.data.stk)return;\n  const first=!S.stkLoaded;\n  S.stkLoaded=true;\n  if(!first&&JSON.stringify(r.data.stk)===JSON.stringify(S.stk))return;\n  S.stk=r.data.stk;applyStk();\n  if(S.view!=='seller')return;\n  paintTabs();\n  if(S.sellerTab==='stock'){\n    const ae=document.activeElement,b=$('#sbody');\n    if(ae&&b&&b.contains(ae)&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))return;   // не мешаем, пока продавец вводит число\n    paintStock();\n  }\n}\nasync function loadJournal(){\n  const r=await api('GET','/api/admin/journal');\n  if(r.ok&&r.data&&Array.isArray(r.data.jr))S.jr=r.data.jr;\n  const el=$('#jrbody');if(el&&S.jrOpen)el.innerHTML=jrHTML();\n}\n/* целое число из поля; при ошибке подсказывает и возвращает null */\nfunction stockNum(id,k,min){\n  const el=document.getElementById(k+'-'+id),raw=el?String(el.value).trim():'';\n  if(raw===''){toast(L('Введите количество','Miqdorni kiriting'));if(el)el.focus();return null}\n  const n=Number(raw);\n  if(!Number.isInteger(n)||n<min||n>1000000){\n    toast(min>0?L('Введите целое число от 1','1 dan boshlab butun son kiriting'):L('Введите целое число, 0 или больше','Butun son kiriting (0 yoki koʻp)'));\n    if(el)el.focus();\n    return null;\n  }\n  return n;\n}\n/* soft: порог сохраняется тихо, строку не перерисовываем, пока продавец печатает в ней другое число */\nasync function stockDo(id,body,okMsg,soft){\n  if(S.sbusy[id]||!S.auth||!S.admin)return;\n  S.sbusy[id]=true;\n  if(!soft)paintStockRow(id);\n  await flushSave();   // товар должен уже быть на сервере\n  const r=await api('POST','/api/admin/stock',Object.assign({id:id},body));\n  delete S.sbusy[id];\n  if(r.ok&&r.data&&r.data.stk){S.stk=r.data.stk;S.stkLoaded=true;applyStk();toast(okMsg)}\n  else toast(r.status===404?L('Такого товара уже нет','Bunday mahsulot endi yoʻq'):L('Не удалось сохранить. Проверьте соединение.','Saqlab boʻlmadi. Ulanishni tekshiring.'));\n  const row=document.getElementById('srow-'+id),ae=document.activeElement;\n  if(!soft||!(row&&ae&&row.contains(ae)))paintStockRow(id);\n  else{const st=$('#sstats');if(st)st.innerHTML=statsHTML();paintTabs()}\n  if(S.jrOpen)loadJournal();\n}\n\n/* Сжимает фото на телефоне: JPEG, длинная сторона ~800 px, до ~280 КБ. */\nasync function shrinkPhoto(file){\n  const url=URL.createObjectURL(file);\n  try{\n    const img=await new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=url});\n    const w=img.naturalWidth,h=img.naturalHeight;\n    if(!w||!h)return null;\n    let k=Math.min(1,800/Math.max(w,h));\n    for(let attempt=0;attempt<4;attempt++){\n      const cw=Math.max(64,Math.round(w*k)),ch=Math.max(64,Math.round(h*k));\n      const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;\n      const g=cv.getContext('2d');g.fillStyle='#FFFFFF';g.fillRect(0,0,cw,ch);g.drawImage(img,0,0,cw,ch);\n      for(const q of [0.82,0.7,0.58]){\n        const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',q));\n        if(blob&&blob.size<=280000)return blob;\n      }\n      k*=0.8;\n    }\n    return null;\n  }finally{URL.revokeObjectURL(url)}\n}\nasync function apiBin(method,path,blob){\n  try{\n    const h={'content-type':'image/jpeg'};\n    if(S.initData)h['x-init-data']=S.initData;\n    const r=await fetch(path,{method,headers:h,body:blob,cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\nasync function uploadPhoto(id,file){\n  if(!S.auth||!S.admin||S.upl[id])return;\n  const p=S.prod.items.find(x=>x.id===id);if(!p)return;\n  S.upl[id]=true;paintPhoto(id);\n  let ok=false;\n  try{\n    await flushSave();   // товар должен уже быть на сервере, иначе фото некуда привязать\n    const blob=await shrinkPhoto(file);\n    if(blob){\n      const r=await apiBin('PUT','/api/admin/photo/'+encodeURIComponent(id),blob);\n      if(r.ok&&r.data){p.pv=r.data.pv||'';ok=true}\n    }\n  }catch(e){}\n  delete S.upl[id];paintPhoto(id);\n  toast(ok?L('Фото сохранено','Rasm saqlandi'):L('Не удалось загрузить фото. Попробуйте другое изображение.','Rasmni yuklab boʻlmadi. Boshqa rasm tanlang.'));\n}\nasync function removePhoto(id){\n  const p=S.prod.items.find(x=>x.id===id);if(!p||S.upl[id])return;\n  S.upl[id]=true;paintPhoto(id);\n  const r=await api('DELETE','/api/admin/photo/'+encodeURIComponent(id));\n  if(r.ok)p.pv='';\n  delete S.upl[id];paintPhoto(id);\n  if(!r.ok)toast(L('Не удалось убрать фото','Rasmni olib tashlab boʻlmadi'));\n}\n\nfunction settingsHTML(){\n  const s=S.cfg.shop;\n  const num=(id,lab,k,min,max)=>'<div><label class=\"lab\" for=\"s-'+id+'\">'+lab+'</label><input type=\"number\" id=\"s-'+id+'\" inputmode=\"numeric\" min=\"'+min+'\" max=\"'+max+'\" data-s=\"'+k+'\" value=\"'+esc(s[k])+'\"></div>';\n  return '<div class=\"savebar\" id=\"savebar\"></div><div class=\"card\"><div class=\"settings\">'\n    +'<div><label class=\"lab\" for=\"s-name\">'+L('Название компании','Kompaniya nomi')+'</label><input type=\"text\" id=\"s-name\" data-s=\"name\" value=\"'+esc(s.name)+'\" maxlength=\"60\"></div>'\n    +'<div><label class=\"lab\" for=\"s-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"s-phone\" data-s=\"phone\" value=\"'+esc(s.phone)+'\" placeholder=\"+998 …\"></div>'\n    +'<div><label class=\"lab\" for=\"s-tg\">'+L('Telegram для вопросов по заказу, без @','Buyurtma savollari uchun Telegram, @ belgisisiz')+'</label><input type=\"text\" id=\"s-tg\" data-s=\"telegram\" value=\"'+esc(s.telegram)+'\"></div>'\n    +'<div></div>'\n    +'<div><label class=\"lab\" for=\"s-addr\">'+L('Адрес самовывоза (по-русски)','Olib ketish manzili (ruscha)')+'</label><input type=\"text\" id=\"s-addr\" data-s=\"address\" value=\"'+esc(s.address)+'\"></div>'\n    +'<div><label class=\"lab\" for=\"s-addruz\">'+L('Адрес самовывоза (по-узбекски)','Olib ketish manzili (oʻzbekcha)')+'</label><input type=\"text\" id=\"s-addruz\" data-s=\"addressUz\" value=\"'+esc(s.addressUz)+'\"></div>'\n    +'<div class=\"full\"><label class=\"chk\"><input type=\"checkbox\" id=\"s-delivery\" data-s=\"delivery\"'+(s.delivery!==false?' checked':'')+'> '+L('Доставка по адресу включена','Manzilga yetkazib berish yoqilgan')+'</label></div>'\n    +num('lead',L('Самовывоз: заказ за, часов минимум','Olib ketish: buyurtma, kamida soat'),'leadHours',0,240)\n    +num('dlead',L('Доставка: заказ за, часов минимум','Yetkazib berish: buyurtma, kamida soat'),'deliveryLeadHours',0,240)\n    +num('from',L('Время работы с, часов','Ish vaqti: dan, soat'),'openFrom',0,22)\n    +num('to',L('Время работы до, часов','Ish vaqti: gacha, soat'),'openTo',1,23)\n    +'</div></div>';\n}\nfunction paintSave(){\n  const el=$('#savebar');if(!el)return;\n  const t={\n    saving:L('Сохраняем…','Saqlanmoqda…'),\n    saved:L('Сохранено, клиенты видят изменения','Saqlandi, mijozlar oʻzgarishlarni koʻradi'),\n    error:L('Не удалось сохранить. Проверьте соединение и измените что-нибудь ещё раз.','Saqlab boʻlmadi. Ulanishni tekshiring va yana biror narsani oʻzgartiring.'),\n    nodb:L('Изменения не сохраняются: нет доступа к хранилищу.','Oʻzgarishlar saqlanmaydi: ombor mavjud emas.')\n  }[S.saveState]||'';\n  el.textContent=t;el.className='savebar'+(S.saveState==='error'||S.saveState==='nodb'?' bad':'');\n}\nfunction queueSave(kind){\n  if(kind==='prod')S.dirtyP=true;else S.dirtyC=true;\n  S.dirty=true;\n  if(!S.auth||!S.admin){S.saveState='nodb';paintSave();return}\n  S.saveState='saving';paintSave();\n  clearTimeout(saveT);saveT=setTimeout(doSave,700);\n}\nasync function doSave(){\n  if(S.saving){S.again=true;return}\n  S.saving=true;\n  do{\n    S.again=false;\n    const jobs=[];\n    if(S.dirtyC){S.dirtyC=false;jobs.push(api('PUT','/api/admin/config',{cfg:clone(S.cfg)}).then(r=>{if(!r.ok)S.dirtyC=true;return r.ok}))}\n    if(S.dirtyP){S.dirtyP=false;jobs.push(api('PUT','/api/admin/products',{prod:clone(S.prod)}).then(r=>{if(!r.ok)S.dirtyP=true;return r.ok}))}\n    const res=await Promise.all(jobs);\n    S.saveState=res.every(Boolean)?'saved':'error';\n  }while(S.again&&S.saveState!=='error');\n  S.saving=false;\n  S.dirty=S.dirtyC||S.dirtyP;\n  paintSave();\n}\n/* Дожидается, пока все правки уйдут на сервер (нужно перед загрузкой фото). */\nasync function flushSave(){\n  clearTimeout(saveT);\n  while(S.saving)await waitMs(80);\n  if(S.dirtyC||S.dirtyP)await doSave();\n}\nfunction applyOrder(o,stats){\n  if(!o)return;\n  const upd=list=>list.map(x=>x.id===o.id?Object.assign({},x,o):x);\n  S.allOrders=upd(S.allOrders);S.myOrders=upd(S.myOrders);\n  if(stats)S.stats=stats;\n  renderNav();\n  if(S.view==='seller'&&S.sellerTab==='orders')paintSeller();\n  else if(S.view==='mine')renderMine();\n}\nasync function setStatus(id,to){\n  const r=await api('POST','/api/admin/status',{id,to});\n  if(!r.ok){\n    toast(L('Не удалось обновить статус','Holatni yangilab boʻlmadi'));\n    if(r.data&&r.data.order)applyOrder(r.data.order,r.data.stats);\n    return;\n  }\n  applyOrder(r.data.order,r.data.stats);\n  loadStock();   // выдача списывает товар, отмена возвращает\n}\nasync function cancelMine(id){\n  const r=await api('POST','/api/cancel',{id});\n  if(!r.ok){\n    toast(L('Не удалось отменить: продавец уже принял заказ. Напишите ему.','Bekor qilib boʻlmadi: sotuvchi buyurtmani qabul qilgan. Unga yozing.'));\n    if(r.data&&r.data.order)applyOrder(r.data.order);\n    return;\n  }\n  applyOrder(r.data.order);\n}\n\n/* ---------- views ---------- */\nfunction render(){\n  renderNav();\n  if(S.view==='shop')renderShop();\n  else if(S.view==='mine')renderMine();\n  else renderSeller();\n}\nfunction go(v){\n  S.view=v;S.cc=null;\n  render();window.scrollTo(0,0);\n  if(v==='mine')loadMine();\n  if(v==='shop')loadCfg();\n  if(v==='seller')loadAdmin();\n}\n/* поле количества потеряло фокус: пустое или 0 убирает товар, слишком большое число обрезается */\nfunction qtyDone(t){\n  const id=t.dataset.qty,cur=S.cart[id]||0;\n  let v=Math.floor(Number(t.value));\n  if(!isFinite(v)||v<1)v=0;\n  v=cartSet(id,v);   // обрезает до остатка и сохраняет\n  if(!v){\n    if(!cartCount()){S.shopStep='list';renderShop();renderNav();return}\n    if(S.shopStep==='cart'){paintCartLines();paintShopBar();renderNav()}else paintShopCtl(id);\n    return;\n  }\n  t.value=String(v);\n  if(cur!==v)refreshTotals(id);\n}\n\n/* ---------- events ---------- */\ndocument.addEventListener('click',e=>{\n  const t=e.target.closest('[data-act]');\n  if(!t||t.disabled)return;\n  const a=t.dataset.act;\n  if(a==='lang')switchLang();\n  else if(a==='nav'){\n    if(t.dataset.v==='shop'&&S.view!=='shop'){S.shopPlaced=null;S.shopStep='list'}\n    go(t.dataset.v);\n  }\n  else if(a==='submitorder')submitOrder();\n  else if(a==='mode'){\n    S.form.mode=t.dataset.v==='delivery'?'delivery':'pickup';saveForm();\n    renderCart();\n  }\n  else if(a==='scat'){S.shopCat=t.dataset.id;renderShop()}\n  else if(a==='pdesc')t.classList.toggle('open');\n  else if(a==='padd'||a==='pplus'||a==='pminus'){\n    const id=t.dataset.id,cur=S.cart[id]||0;\n    if(a==='padd'&&!cur&&cartLines().length>=MAX_LINES){toast(L('В корзине не больше '+MAX_LINES+' разных товаров','Savatda '+MAX_LINES+' tadan ortiq turli mahsulot boʻlmaydi'));return}\n    cartSet(id,a==='pminus'?cur-1:cur+1);\n    paintShopCtl(id);\n  }\n  else if(a==='cplus'||a==='cminus'){\n    const id=t.dataset.id,cur=S.cart[id]||0;\n    cartSet(id,a==='cminus'?cur-1:cur+1);\n    if(!cartCount()){S.shopStep='list';renderShop();renderNav();return}\n    paintCartLines();\n    paintShopBar();renderNav();\n  }\n  else if(a==='opencart'){S.shopStep='cart';renderShop();window.scrollTo(0,0)}\n  else if(a==='shoplist'){S.shopStep='list';renderShop();window.scrollTo(0,0)}\n  else if(a==='shopagain'){S.shopPlaced=null;S.shopStep='list';renderShop();window.scrollTo(0,0)}\n  else if(a==='cadd'){\n    if(S.prod.cats.length>=MAX_CATS){toast(L('Больше '+MAX_CATS+' категорий нельзя',MAX_CATS+' tadan ortiq kategoriya boʻlmaydi'));return}\n    const c={id:'c'+Math.random().toString(36).slice(2,8),name:L('Новая категория','Yangi kategoriya'),uz:'Yangi kategoriya'};\n    S.prod.cats.push(c);queueSave('prod');paintSeller();\n    const inp=document.querySelector('[data-cid=\"'+c.id+'\"][data-cp=\"name\"]');if(inp){inp.focus();inp.select()}\n  }\n  else if(a==='cdel'){\n    const id=t.dataset.id;\n    if(S.prod.items.some(p=>p.cat===id)){toast(L('В категории есть товары. Сначала перенесите или удалите их.','Kategoriyada mahsulotlar bor. Avval ularni koʻchiring yoki oʻchiring.'));return}\n    S.prod.cats=S.prod.cats.filter(c=>c.id!==id);queueSave('prod');paintSeller();\n  }\n  else if(a==='pfilter'){S.pfilter=t.dataset.id;paintSeller()}\n  else if(a==='pnew'){\n    if(!S.prod.cats.length){toast(L('Сначала создайте категорию','Avval kategoriya yarating'));return}\n    if(S.prod.items.length>=MAX_ITEMS){toast(L('Больше '+MAX_ITEMS+' товаров нельзя',MAX_ITEMS+' tadan ortiq mahsulot boʻlmaydi'));return}\n    const cat=S.pfilter!=='all'?S.pfilter:S.prod.cats[0].id;\n    const p={id:'p'+Math.random().toString(36).slice(2,9),cat,name:L('Новый товар','Yangi mahsulot'),uz:'Yangi mahsulot',desc:'',descUz:'',amount:0,unit:'g',price:0,on:true,pv:''};\n    S.prod.items.push(p);queueSave('prod');paintSeller();\n    const inp=document.getElementById('pname-'+p.id);\n    if(inp){inp.focus();inp.select();try{inp.scrollIntoView({block:'center'})}catch(x){}}\n  }\n  else if(a==='pdel'){\n    const id=t.dataset.id;\n    if(S.cd===id){\n      S.cd=null;\n      S.prod.items=S.prod.items.filter(p=>p.id!==id);delete S.cart[id];delete S.stk[id];saveCart();\n      queueSave('prod');paintSeller();\n    }else{\n      S.cd=id;t.textContent=L('Точно удалить?','Aniq oʻchirilsinmi?');\n      setTimeout(()=>{if(S.cd===id){S.cd=null;t.textContent=L('Удалить товар','Mahsulotni oʻchirish')}},4000);\n    }\n  }\n  else if(a==='pmove'){\n    const id=t.dataset.id,d=Number(t.dataset.d)||0,arr=S.prod.items;\n    const vis=arr.map((p,i)=>i).filter(i=>S.pfilter==='all'||arr[i].cat===S.pfilter);\n    const pos=vis.indexOf(arr.findIndex(p=>p.id===id)),to=pos+d;\n    if(pos<0||to<0||to>=vis.length)return;\n    const a1=vis[pos],b1=vis[to],tmp=arr[a1];arr[a1]=arr[b1];arr[b1]=tmp;\n    queueSave('prod');paintSeller();\n    const row=document.getElementById('prow-'+id);if(row)try{row.scrollIntoView({block:'center'})}catch(x){}\n  }\n  else if(a==='phdel')removePhoto(t.dataset.id);\n  else if(a==='copy'){\n    const v=t.dataset.v||'';\n    const lab=L('Номер: ','Raqam: ')+v;\n    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(()=>toast(L('Номер скопирован','Raqam nusxalandi')),()=>toast(lab));\n    else toast(lab);\n  }\n  else if(a==='stab'){\n    S.sellerTab=t.dataset.t;S.sc=null;\n    document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',String(x.dataset.t===S.sellerTab)));\n    paintSeller();\n    if(S.sellerTab==='stock'){loadStock();if(S.jrOpen)loadJournal()}\n  }\n  else if(a==='sfilter'){S.sfilter=t.dataset.v;paintStock()}\n  else if(a==='sjr'){S.jrOpen=!S.jrOpen;paintStock();if(S.jrOpen)loadJournal()}\n  else if(a==='sin'||a==='sset'){\n    const id=t.dataset.id,n=stockNum(id,'sn',a==='sin'?1:0);\n    if(n===null)return;\n    stockDo(id,{op:a==='sin'?'in':'set',n},a==='sin'?L('Приход записан','Kirim yozildi'):L('Остаток исправлен','Qoldiq tuzatildi'));\n  }\n  else if(a==='sstart'){\n    const id=t.dataset.id,n=stockNum(id,'sn',0);\n    if(n===null)return;\n    const body={op:'set',n};\n    const lw=document.getElementById('sl-'+id),raw=lw?String(lw.value).trim():'';\n    if(raw!==''){\n      const v=Number(raw);\n      if(!Number.isInteger(v)||v<0||v>1000000){toast(L('Порог — целое число, 0 или больше','Chegara — butun son (0 yoki koʻp)'));lw.focus();return}\n      body.low=v;\n    }\n    stockDo(id,body,L('Учёт начат','Hisob boshlandi'));\n  }\n  else if(a==='soff'){\n    const id=t.dataset.id;\n    if(S.sc===id){S.sc=null;stockDo(id,{op:'off'},L('Учёт отключён','Hisob oʻchirildi'))}\n    else{\n      S.sc=id;paintStockRow(id);\n      setTimeout(()=>{if(S.sc===id){S.sc=null;paintStockRow(id)}},4000);\n    }\n  }\n  else if(a==='filter'){S.filter=t.dataset.v;paintSeller()}\n  else if(a==='status'){setStatus(t.dataset.id,t.dataset.to)}\n  else if(a==='contact'){try{if(S.tg&&S.initData&&S.tg.openTelegramLink){e.preventDefault();S.tg.openTelegramLink(t.href)}}catch(err){}}\n  else if(a==='scancel'||a==='mycancel'){\n    const id=t.dataset.id;\n    if(S.cc===id){\n      S.cc=null;\n      if(a==='scancel')setStatus(id,'cancelled');\n      else cancelMine(id);\n    }else{\n      S.cc=id;\n      if(S.view==='seller')paintSeller();else renderMine();\n      setTimeout(()=>{if(S.cc===id){S.cc=null;if(S.view==='seller')paintSeller();else if(S.view==='mine')renderMine()}},4000);\n    }\n  }\n});\ndocument.addEventListener('input',e=>{\n  const t=e.target;\n  if(t.id==='q'){S.q=t.value;paintGrid()}\n  else if(t.dataset.qty!==undefined){\n    /* количество вводят с клавиатуры: пока клиент печатает, обновляем только суммы */\n    const id=t.dataset.qty;let v=Math.floor(Number(t.value));\n    if(!isFinite(v)||v<1)return;\n    const w=cartSet(id,v);\n    if(w!==v)t.value=String(w);\n    if(!w){qtyDone(t);return}\n    refreshTotals(id);\n  }\n  else if(t.dataset.f){\n    const f=t.dataset.f;S.form[f]=t.value;\n    if(f==='date')fillTimes();\n    if(f==='name'||f==='phone'||f==='address')saveForm();\n    const er=$('#e-'+f);if(er&&er.textContent){er.textContent='';t.setAttribute('aria-invalid','false')}\n  }\n  else if(t.dataset.pid!==undefined){\n    const p=S.prod.items.find(x=>x.id===t.dataset.pid),k=t.dataset.pp;\n    if(!p)return;\n    if(k==='on'){p.on=t.checked;const row=t.closest('.prow');if(row)row.classList.toggle('off',!t.checked)}\n    else if(k==='amount'||k==='price'){const v=Number(t.value);p[k]=isFinite(v)&&v>=0?v:0}\n    else p[k]=t.value;\n    queueSave('prod');\n  }\n  else if(t.dataset.cid!==undefined){\n    const c=S.prod.cats.find(x=>x.id===t.dataset.cid);\n    if(!c)return;\n    c[t.dataset.cp]=t.value;\n    queueSave('prod');\n  }\n  else if(t.dataset.s){\n    const k=t.dataset.s;\n    if(k==='delivery')S.cfg.shop.delivery=t.checked;\n    else if(['leadHours','deliveryLeadHours','openFrom','openTo'].includes(k)){const v=Number(t.value);S.cfg.shop[k]=isFinite(v)&&v>=0?v:0}\n    else S.cfg.shop[k]=t.value;\n    if(k==='name'){$('#brandName').textContent=t.value||DEFAULT.shop.name;document.title=t.value||DEFAULT.shop.name}\n    queueSave();\n  }\n});\n\ndocument.addEventListener('change',e=>{\n  const t=e.target;\n  if(t&&t.type==='file'&&t.dataset.photo){\n    const f=t.files&&t.files[0];\n    if(f)uploadPhoto(t.dataset.photo,f);\n    try{t.value=''}catch(x){}\n  }\n  else if(t&&t.dataset&&t.dataset.qty!==undefined)qtyDone(t);\n  else if(t&&t.dataset&&t.dataset.sl!==undefined){\n    /* порог «мало» у товара, по которому уже ведётся учёт, сохраняется сразу */\n    const id=t.dataset.sl,s=S.stk[id];\n    if(!s)return;\n    const raw=String(t.value).trim(),v=Number(raw);\n    if(raw===''||!Number.isInteger(v)||v<0||v>1000000){toast(L('Порог — целое число, 0 или больше','Chegara — butun son (0 yoki koʻp)'));t.value=String(s.low);return}\n    if(v!==s.low)stockDo(id,{op:'low',n:v},L('Порог сохранён','Chegara saqlandi'),true);\n  }\n});\n/* картинка не загрузилась: оставляем заглушку */\ndocument.addEventListener('error',e=>{\n  const t=e.target;\n  if(t&&t.tagName==='IMG'&&t.closest('.pimg,.cth,.pthumb,.th')){\n    const ph=document.createElement('span');ph.className='ph';ph.textContent='📦';ph.setAttribute('aria-hidden','true');\n    t.replaceWith(ph);\n  }\n},true);\n\n/* ---------- network ---------- */\nasync function api(method,path,body){\n  try{\n    const h={'content-type':'application/json'};\n    if(S.initData)h['x-init-data']=S.initData;\n    const r=await fetch(path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\nasync function loadMine(){\n  if(!S.auth)return;\n  const r=await api('GET','/api/my-orders');\n  if(!r.ok||!r.data)return;\n  if(JSON.stringify(r.data.orders)===JSON.stringify(S.myOrders))return;\n  S.myOrders=r.data.orders;renderNav();\n  if(S.view==='mine')renderMine();\n}\nasync function loadAdmin(){\n  if(!S.admin)return;\n  loadStock();\n  const r=await api('GET','/api/admin/orders');\n  if(!r.ok||!r.data)return;\n  if(JSON.stringify(r.data.orders)===JSON.stringify(S.allOrders)&&JSON.stringify(r.data.stats)===JSON.stringify(S.stats))return;\n  S.allOrders=r.data.orders;S.stats=r.data.stats;renderNav();\n  if(S.view==='seller'&&S.sellerTab==='orders')paintSeller();\n}\nasync function loadCfg(){\n  if(S.dirty||S.saving||!S.ready)return;\n  const r=await api('GET','/api/config');\n  if(!r.ok||!r.data)return;\n  const next=mergeCfg(r.data.cfg),nextP=normProd(r.data.prod);\n  if(JSON.stringify(next)===JSON.stringify(S.cfg)&&JSON.stringify(nextP)===JSON.stringify(S.prod))return;\n  const ae=document.activeElement;\n  if(S.view==='shop'&&ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))return;\n  S.cfg=next;S.prod=nextP;normalizeMode();\n  const pruned=pruneCart();\n  renderNav();\n  if(S.view==='shop'&&!S.shopPlaced){\n    if(S.shopStep==='cart'&&!cartCount())S.shopStep='list';\n    renderShop();\n    if(pruned)toast(L('Остатки изменились, мы обновили корзину','Qoldiq oʻzgardi, savatni yangiladik'));\n  }\n}\nfunction applyTheme(){\n  try{\n    const cs=S.tg&&S.tg.colorScheme;\n    if(cs==='dark'||cs==='light')document.documentElement.setAttribute('data-theme',cs);\n    const dark=cs?cs==='dark':window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;\n    const bg=dark?'#0E1614':'#F3F7F6';\n    if(S.tg&&S.tg.setHeaderColor){S.tg.setHeaderColor(bg);S.tg.setBackgroundColor(bg)}\n  }catch(e){}\n}\nlet tickN=0;\nfunction tick(){\n  if(document.visibilityState==='hidden'||!S.ready)return;\n  tickN++;\n  if(S.auth&&S.view==='mine')loadMine();\n  if(S.admin&&(S.view==='seller'||tickN%2===0))loadAdmin();\n  if(tickN%4===0)loadCfg();\n}\n(async function init(){\n  const tg=window.Telegram&&window.Telegram.WebApp;\n  if(tg){\n    S.tg=tg;\n    if(tg.initData)S.initData=tg.initData;\n    try{tg.ready();tg.expand();if(tg.onEvent)tg.onEvent('themeChanged',applyTheme)}catch(e){}\n  }\n  initLang();applyTheme();\n  renderNav();\n  view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Загружаем каталог','Katalog yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div></div>';\n  if(S.initData){\n    const r=await api('GET','/api/bootstrap');\n    if(r.ok&&r.data){\n      S.auth=true;S.uid=r.data.me.id;S.admin=!!r.data.me.admin;\n      S.cfg=mergeCfg(r.data.cfg);S.prod=normProd(r.data.prod);S.myOrders=r.data.orders||[];\n    }else S.authErr=(r.data&&r.data.error)||'net';\n  }\n  if(!S.auth){\n    const r=await api('GET','/api/config');\n    if(r.ok&&r.data){S.cfg=mergeCfg(r.data.cfg);S.prod=normProd(r.data.prod)}\n  }\n  loadCart();pruneCart();loadForm();normalizeMode();\n  S.ready=true;\n  render();\n  if(S.admin)loadAdmin();\n  setInterval(tick,15000);\n  document.addEventListener('visibilitychange',()=>{\n    if(document.visibilityState!=='visible')return;\n    loadCfg();loadMine();loadAdmin();\n  });\n})();\n</script>\n</body></html>\n";

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
  shop:{name:'Оптовая база',phone:'',telegram:'',address:'',addressUz:'',delivery:true,leadHours:2,deliveryLeadHours:24,openFrom:9,openTo:20}
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

/* Остаток товара s = {q: на складе, r: отложено под заказы, low: порог «мало»}; нет записи — учёт не ведётся.
   Покупателям: av — сколько можно заказать (не больше cap, чтобы не раскрывать большие остатки), lw — товара мало, и число показываем в подписи «Мало (осталось N)». */
const stkAvail=s=>s?Math.max(0,(Number(s.q)||0)-(Number(s.r)||0)):null;
function stkPublic(s,cap){
  if(!s)return undefined;
  const a=stkAvail(s),lw=a>0&&Number(s.low)>0&&a<=Number(s.low);
  return {av:lw||!(cap>0)?a:Math.min(a,cap),lw};
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
  return '• '+nm(it)+(w?' ('+w+')':'')+' × '+it.qty+' = '+money(it.price*it.qty);
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
  if(o.comment)P.push(L('Комментарий: ','Izoh: ')+o.comment);
  P.push(L('Итого: ','Jami: ')+money(o.total)+L(', оплата при получении',', olganda toʻlanadi'));
  return P.join('\n');
}


/*
  Сервер для Telegram-бота и мини-приложения оптового каталога (Cloudflare Worker + Durable Object).
  При сборке (build.js) перед этим файлом подставляется shared.js и константа APP_HTML.

  Worker отдаёт страницу приложения и пересылает всё остальное в один Durable Object "Shop".
  Shop хранит каталог, фото, заказы и список продавцов, принимает запросы приложения и обновления от Telegram.
*/

const TG_API = 'https://api.telegram.org/bot';
const MAX_NEW_PER_USER = 5;   // сколько неподтверждённых заказов может висеть у одного клиента
const MAX_ACTIVE = 300;       // защита от переполнения: столько активных заказов на весь склад
const HIST_CAP = 150;         // сколько завершённых заказов показывать в панели
const PROD_PHOTO_MAX = 300000; // фото товара: до 300 КБ (после сжатия на телефоне обычно 50-150 КБ)
const MAX_CATS = 40;          // категорий в каталоге
const MAX_ITEMS = 300;        // товаров в каталоге
const MAX_CART_LINES = 30;    // разных товаров в одном заказе
const MAX_QTY = 500;          // штук одного товара в заказе
const PROD_BODY_MAX = 400000; // размер каталога, который принимает сервер (символов)
const MAX_STOCK = 1000000;    // предел для остатка и порога
const JR_CAP = 200;           // сколько последних движений остатков хранить в журнале
const TEXT_MAX = 4000;        // сообщение Telegram до 4096 знаков, берём с запасом
const INIT_MAX_AGE = 2 * 24 * 3600; // initData старше двух суток не принимаем
const NEXT = { new: ['accepted', 'cancelled'], accepted: ['ready', 'cancelled'], ready: ['done', 'cancelled'] };

/* ---------- утилиты ---------- */
const enc = new TextEncoder();
const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
async function hmac(key, data) {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? enc.encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, enc.encode(data));
}
const sha256hex = async s => toHex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
function safeEq(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
/* Проверяет, что байты похожи на настоящий JPEG разумного размера (читает только заголовки). */
function checkJpeg(u, lim) {
  const minW = lim.minW, minH = lim.minH, maxSide = lim.maxSide;
  const n = u.length;
  if (n < 1000 || u[0] !== 0xFF || u[1] !== 0xD8 || u[2] !== 0xFF || u[n - 2] !== 0xFF || u[n - 1] !== 0xD9) return false;
  let i = 2, w = 0, h = 0;
  while (i + 4 < n) {
    if (u[i] !== 0xFF) return false;
    const m = u[i + 1];
    if (m === 0xFF) { i++; continue; }
    if (m === 0x01 || (m >= 0xD0 && m <= 0xD8)) { i += 2; continue; }
    const len = (u[i + 2] << 8) | u[i + 3];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
      if (i + 9 > n) return false;
      h = (u[i + 5] << 8) | u[i + 6];
      w = (u[i + 7] << 8) | u[i + 8];
      break;
    }
    if (m === 0xDA || len < 2) return false;
    i += 2 + len;
  }
  return !(w < minW || h < minH || w > maxSide || h > maxSide);
}
const PROD_PHOTO_LIM = { minW: 64, minH: 64, maxSide: 2000 };

const json = (obj, status) => new Response(JSON.stringify(obj), {
  status: status || 200,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const html = (body, status) => new Response(body, {
  status: status || 200,
  headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
});
const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randId(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map(x => ID_CHARS[x % ID_CHARS.length]).join('');
}
const cleanStr = (v, n, keepNl) => typeof v === 'string'
  ? v.replace(keepNl ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n)
  : '';
const clampN = (v, lo, hi, def) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def; };

/* Проверка подписи данных Mini App (initData) по алгоритму Telegram. */
async function verifyInitData(initData, token) {
  if (!initData || typeof initData !== 'string' || initData.length > 4096) return { err: 'auth' };
  const p = new URLSearchParams(initData);
  const hash = p.get('hash');
  if (!hash) return { err: 'auth' };
  p.delete('hash');
  const entries = [...p.entries()].sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
  const dcs = entries.map(e => e[0] + '=' + e[1]).join('\n');
  const secret = await hmac('WebAppData', token);
  const calc = toHex(await hmac(secret, dcs));
  if (!safeEq(calc, hash.toLowerCase())) return { err: 'auth' };
  const age = Math.floor(Date.now() / 1000) - Number(p.get('auth_date') || 0);
  if (!(age >= -300 && age <= INIT_MAX_AGE)) return { err: 'expired' };
  let user = null;
  try { user = JSON.parse(p.get('user') || 'null'); } catch (e) { /* ignore */ }
  if (!user || !Number.isSafeInteger(user.id)) return { err: 'auth' };
  return { user };
}

/* ---------- настройки склада, которые присылает продавец ---------- */
function sanitizeCfg(d) {
  const out = mergeCfg(d && typeof d === 'object' ? d : null);
  const s = out.shop;
  s.name = cleanStr(s.name, 60) || DEFAULT.shop.name;
  s.phone = cleanStr(s.phone, 30);
  s.telegram = cleanStr(s.telegram, 40).replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '');
  s.address = cleanStr(s.address, 120);
  s.addressUz = cleanStr(s.addressUz, 120);
  s.delivery = s.delivery !== false;
  s.leadHours = Math.round(clampN(s.leadHours, 0, 240, 2));
  s.deliveryLeadHours = Math.round(clampN(s.deliveryLeadHours, 0, 240, 24));
  s.openFrom = Math.round(clampN(s.openFrom, 0, 22, 9));
  s.openTo = Math.round(clampN(s.openTo, 1, 23, 20));
  if (s.openTo <= s.openFrom) s.openTo = Math.min(23, s.openFrom + 1);
  return out;
}

/* ---------- каталог ---------- */
const validId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{1,24}$/.test(id);
const emptyProd = () => ({ cats: [], items: [] });
function normProd(d) {
  const out = emptyProd();
  if (d && typeof d === 'object') {
    out.cats = (Array.isArray(d.cats) ? d.cats : []).filter(x => x && typeof x === 'object');
    out.items = (Array.isArray(d.items) ? d.items : []).filter(x => x && typeof x === 'object');
  }
  return out;
}
/* Чистит то, что прислал продавец. Версию фото (pv) клиент не задаёт: берём из сохранённых данных. */
function sanitizeProd(d, old) {
  const oldItems = new Map(normProd(old).items.map(i => [i.id, i]));
  const src = normProd(d);
  const cats = [], seenC = new Set();
  src.cats.slice(0, MAX_CATS).forEach(c => {
    let id = validId(c.id) ? c.id : 'c' + randId(5);
    while (seenC.has(id)) id = 'c' + randId(5);
    seenC.add(id);
    cats.push({ id, name: cleanStr(c.name, 40) || 'Без названия', uz: cleanStr(c.uz, 40) });
  });
  const items = [], seen = new Set();
  src.items.slice(0, MAX_ITEMS).forEach(o => {
    let id = validId(o.id) ? o.id : 'p' + randId(6);
    while (seen.has(id)) id = 'p' + randId(6);
    seen.add(id);
    const prev = oldItems.get(id);
    items.push({
      id,
      cat: cats.some(c => c.id === o.cat) ? o.cat : (cats[0] ? cats[0].id : ''),
      name: cleanStr(o.name, 60) || 'Без названия',
      uz: cleanStr(o.uz, 60),
      desc: cleanStr(o.desc, 300, true),
      descUz: cleanStr(o.descUz, 300, true),
      amount: Math.round(clampN(o.amount, 0, 100000, 0) * 1000) / 1000,
      unit: UNIT_IDS.includes(o.unit) ? o.unit : 'g',
      price: Math.round(clampN(o.price, 0, 1e8, 0)),
      on: o.on !== false,
      pv: prev && typeof prev.pv === 'string' ? prev.pv : ''
    });
  });
  return { cats, items };
}

/* ---------- остатки ---------- */
/* Каталог для покупателей: у товаров с учётом добавляется av (сколько можно заказать, не больше 500) и lw (товара мало). */
function publicProd(prod, stk) {
  return {
    cats: prod.cats,
    items: prod.items.map(it => {
      const v = stk ? stkPublic(stk[it.id], MAX_QTY) : undefined;
      if (!v) return it;
      return Object.assign({}, it, v.lw ? { av: v.av, lw: 1 } : { av: v.av });
    })
  };
}
/* Название для журнала и сообщений: «Рис, 25 кг». */
function ruTitle(it) {
  setLang('ru');
  const w = weightLabel(it);
  return String(it.name || '') + (w ? ', ' + w : '');
}
const intIn = (v, lo, hi) => (typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi) ? v : null;

/* ---------- проверка заказа и пересчёт цены на сервере ---------- */
/* Имя, телефон, способ получения, адрес, комментарий и время. */
function validateForm(f, cfg) {
  const name = cleanStr(f.name, 60);
  const phone = cleanStr(f.phone, 25);
  const digits = phone.replace(/\D/g, '').length;
  const comment = cleanStr(f.comment, 500, true);
  if (!name || digits < 9 || digits > 15) return { err: 'bad_request' };
  const mode = f.mode === 'delivery' ? 'delivery' : 'pickup';
  let address = '';
  if (mode === 'delivery') {
    if (cfg.shop.delivery === false) return { err: 'no_delivery' };
    address = cleanStr(f.address, 200);
    if (address.length < 5) return { err: 'bad_request' };
  }
  const date = typeof f.date === 'string' ? f.date : '', time = typeof f.time === 'string' ? f.time : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return { err: 'pickup' };
  // час запаса, чтобы не спорить с клиентскими часами
  const pk = pickupInfo(cfg, new Date(shopNow().getTime() - 3600000), leadFor(cfg, mode));
  if (date > pk.max || !pk.slots(date).includes(time)) return { err: 'pickup' };
  return { name, phone, comment, mode, address, pickupAt: date + 'T' + time };
}

/* Заказ: цены и названия берём только из каталога на сервере. */
function validateOrder(b, cfg, prod, stk) {
  if (!b || typeof b !== 'object' || !Array.isArray(b.cart) || !b.form || typeof b.form !== 'object') return { err: 'bad_request' };
  if (b.cart.length < 1 || b.cart.length > MAX_CART_LINES) return { err: 'bad_request' };
  const items = [], seen = new Set();
  let total = 0, missing = false;
  for (const c of b.cart) {
    if (!c || typeof c !== 'object') return { err: 'bad_request' };
    const qty = c.qty;
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY || typeof c.id !== 'string' || seen.has(c.id)) return { err: 'bad_request' };
    seen.add(c.id);
    const it = prod.items.find(x => x.id === c.id);
    if (!it || it.on === false) { missing = true; continue; }
    items.push({ id: it.id, name: it.name, uz: it.uz || '', amount: it.amount, unit: it.unit, price: it.price, qty });
    total += it.price * qty;
  }
  if (missing) return { err: 'unavailable' };
  // остатки: заказать можно не больше, чем свободно (на складе минус уже отложенное под другие заказы)
  const short = [];
  if (stk) items.forEach(it => {
    const s = stk[it.id];
    if (s && it.qty > stkAvail(s)) short.push({ id: it.id, avail: stkAvail(s) });
  });
  if (short.length) return { err: 'stock', short };
  const fm = validateForm(b.form, cfg);
  if (fm.err) return fm;
  return { items, total, name: fm.name, phone: fm.phone, comment: fm.comment, mode: fm.mode, address: fm.address, pickupAt: fm.pickupAt };
}

const publicOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.tg; delete x.msgs; delete x.rs; return x; };
const adminOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.msgs; delete x.rs; return x; };

/* ---------- тексты для Telegram ---------- */
const STATUS_ICON = { new: '🆕', accepted: '🛠', ready: '✅', done: '📦', cancelled: '❌' };

function adminCard(o, shop, origin, confirm) {
  setLang('ru');
  const who = o.tg && o.tg.username ? '@' + o.tg.username : 'без username';
  const tail = '\n\nTelegram: ' + who + (o.tg && o.tg.name ? ' (' + o.tg.name + ')' : '')
    + '\nСтатус: ' + stOf(o.status, o.mode).name;
  const head = STATUS_ICON[o.status] + ' ';
  // очень длинный заказ: показываем первые позиции, чтобы итог и кнопки не потерялись
  let text = head + orderText(o, shop) + tail;
  for (let k = (o.items || []).length - 1; text.length > TEXT_MAX && k >= 1; k--) text = head + orderText(o, shop, k) + tail;
  if (text.length > TEXT_MAX) text = text.slice(0, TEXT_MAX - 10) + '…';
  const rows = [];
  const btn = (t, d) => ({ text: t, callback_data: d });
  const del = o.mode === 'delivery';
  if (confirm) {
    rows.push([btn('Да, отменить заказ', 's:' + o.id + ':cancelled')]);
    rows.push([btn('Назад', 'b:' + o.id)]);
  } else {
    if (o.status === 'new') rows.push([btn('✅ Принять в работу', 's:' + o.id + ':accepted')]);
    if (o.status === 'accepted') rows.push([btn(del ? '📦 Готов к отправке' : '📦 Готов к выдаче', 's:' + o.id + ':ready')]);
    if (o.status === 'ready') rows.push([btn(del ? '🚚 Доставлен клиенту' : '🤝 Выдан клиенту', 's:' + o.id + ':done')]);
    if (NEXT[o.status]) rows.push([btn('❌ Отменить', 'c:' + o.id)]);
    rows.push([{ text: 'Открыть панель продавца', web_app: { url: origin + '/' } }]);
  }
  return { text, reply_markup: { inline_keyboard: rows } };
}

function customerText(o, kind, shop) {
  setLang(o.lang === 'uz' ? 'uz' : 'ru');
  const del = o.mode === 'delivery';
  const when = fmtWhen(o.pickupAt);
  const whenL = del ? L('Доставка: ', 'Yetkazib berish: ') : L('Самовывоз: ', 'Olib ketish: ');
  const addr = L(shop.address, shop.addressUz || shop.address);
  const contact = (shop.telegram ? '@' + shop.telegram : '') + (shop.phone ? (shop.telegram ? ', ' : '') + shop.phone : '');
  const place = del ? L('\nАдрес доставки: ', '\nYetkazib berish manzili: ') + o.address
    : (addr ? L('\nАдрес: ', '\nManzil: ') + addr : '');
  const name = shop.name || DEFAULT.shop.name;
  switch (kind) {
    case 'placed': return L(
      'Заказ ' + o.id + ' отправлен продавцу. Когда он подтвердит, напишем сюда.\n' + whenL + when + place + '\nК оплате при получении: ' + money(o.total),
      'Buyurtma ' + o.id + ' sotuvchiga yuborildi. U tasdiqlagach, shu yerga yozamiz.\n' + whenL + when + place + '\nOlganda toʻlanadi: ' + money(o.total));
    case 'accepted': return L(
      '🛠 Заказ ' + o.id + ' принят в работу.\n' + whenL + when + place,
      '🛠 Buyurtma ' + o.id + ' ishga qabul qilindi.\n' + whenL + when + place);
    case 'ready': return del ? L(
      '📦 Заказ ' + o.id + ' собран и скоро будет доставлен.\nОплата при получении: ' + money(o.total) + place,
      '📦 Buyurtma ' + o.id + ' yigʻildi va tez orada yetkaziladi.\nOlganda toʻlanadi: ' + money(o.total) + place) : L(
      '📦 Заказ ' + o.id + ' готов, можно забирать.\nОплата при получении: ' + money(o.total) + place,
      '📦 Buyurtma ' + o.id + ' tayyor, olib ketishingiz mumkin.\nOlganda toʻlanadi: ' + money(o.total) + place);
    case 'done': return del ? L(
      '🤝 Заказ ' + o.id + ' доставлен. Спасибо, что выбрали ' + name + '!',
      '🤝 Buyurtma ' + o.id + ' yetkazildi. ' + name + 'ni tanlaganingiz uchun rahmat!') : L(
      '🤝 Спасибо, что выбрали ' + name + '!',
      '🤝 ' + name + 'ni tanlaganingiz uchun rahmat!');
    case 'cancelled': return L(
      '❌ Заказ ' + o.id + ' отменён продавцом.' + (contact ? '\nВопросы: ' + contact : ''),
      '❌ Buyurtma ' + o.id + ' sotuvchi tomonidan bekor qilindi.' + (contact ? '\nSavollar: ' + contact : ''));
  }
  return '';
}

function welcomeText(lang, isAdmin, shop) {
  setLang(lang);
  const name = (shop && shop.name) || DEFAULT.shop.name;
  return L(
    'Здравствуйте! Это ' + name + ' 🛒\nОткройте каталог, выберите товары и оформите заказ: самовывоз или доставка. Оплата только при получении.',
    'Assalomu alaykum! Bu ' + name + ' 🛒\nKatalogni oching, mahsulotlarni tanlang va buyurtma bering: olib ketish yoki yetkazib berish. Toʻlov faqat olganda.')
    + (isAdmin ? '\n\nВы подключены как продавец: новые заказы приходят сюда, их можно принимать кнопками.' : '');
}
const openBtn = (origin, text) => ({ inline_keyboard: [[{ text, web_app: { url: origin + '/' } }]] });

/* ---------- страница настройки ---------- */
function setupPage(inner) {
  return html('<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Настройка бота</title>'
    + '<style>body{font:16px/1.5 system-ui,sans-serif;max-width:560px;margin:32px auto;padding:0 16px;color:#14231F}input,button{font:inherit;padding:10px 12px;border-radius:10px;border:1.5px solid #ccc}button{background:#0F766E;color:#fff;border:0;cursor:pointer}li{margin:6px 0}.ok{color:#1F7A4D}.bad{color:#B3261E}code{background:#E7EFED;padding:2px 6px;border-radius:6px}</style></head><body>'
    + '<h1>Настройка бота</h1>' + inner + '</body></html>');
}

/* ---------- Worker ---------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      return new Response(APP_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' } });
    }
    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 });
    return env.SHOP.get(env.SHOP.idFromName('main')).fetch(request);
  }
};

/* ---------- Durable Object ---------- */
export class Shop {
  constructor(state, env) {
    this.state = state;
    this.st = state.storage;
    this.env = env;
    this.origin = '';
  }

  /* --- хранилище --- */
  async getMany(keys) {
    const out = new Map();
    for (let i = 0; i < keys.length; i += 100) {
      const part = await this.st.get(keys.slice(i, i + 100));
      part.forEach((v, k) => out.set(k, v));
    }
    return out;
  }
  async getOrders(ids) {
    const map = await this.getMany(ids.map(id => 'o:' + id));
    return ids.map(id => map.get('o:' + id)).filter(Boolean);
  }
  async getCfg() { return mergeCfg(await this.st.get('cfg')); }
  async getProd() { return normProd(await this.st.get('prod')); }
  async getStk() { const s = await this.st.get('stk'); return s && typeof s === 'object' ? s : {}; }
  async pubProd() { return publicProd(await this.getProd(), await this.getStk()); }
  /* Новые строки журнала + прежние (последние JR_CAP). Возвращает массив для записи. */
  async jrWith(rows) { return rows.concat((await this.st.get('jr')) || []).slice(0, JR_CAP); }
  /* Сколько штук товара сейчас отложено под активные заказы (нужно, когда учёт товара включают заново). */
  async reservedFor(id) {
    let r = 0;
    for (const o of await this.getOrders((await this.st.get('act')) || [])) if (o.rs && o.rs[id]) r += o.rs[id];
    return r;
  }
  /* Предупреждение продавцам: товар закончился или стало меньше порога. rows: {title,before,after,low,q,r}. */
  async stockAlert(rows) {
    setLang('ru');
    const lines = [];
    for (const x of rows) {
      if (!(x.after < x.before)) continue;
      if (x.after === 0) lines.push('🚫 ' + x.title + ': свободного остатка нет (на складе ' + x.q + ', в заказах ' + x.r + ').');
      else if (x.low > 0 && x.after <= x.low && x.before > x.low) lines.push('⚠️ ' + x.title + ': осталось ' + x.after + ' (порог ' + x.low + ').');
    }
    if (!lines.length) return;
    let text = 'Остатки на складе:\n' + lines.join('\n');
    if (text.length > TEXT_MAX) text = text.slice(0, TEXT_MAX - 1) + '…';
    for (const aid of (await this.st.get('admins')) || []) await this.tg('sendMessage', { chat_id: aid, text });
  }
  async isAdmin(uid) { return ((await this.st.get('admins')) || []).includes(uid); }

  /* --- Telegram --- */
  async tg(method, payload) {
    if (!this.env.BOT_TOKEN) return { ok: false, description: 'BOT_TOKEN не задан' };
    try {
      const r = await fetch(TG_API + this.env.BOT_TOKEN + '/' + method, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload || {}),
        signal: AbortSignal.timeout(6000)
      });
      return await r.json();
    } catch (e) {
      return { ok: false, description: String(e && e.message || e) };
    }
  }
  editCard(m, card) {
    return this.tg('editMessageText', { chat_id: m.chat_id, message_id: m.message_id, text: card.text, reply_markup: card.reply_markup });
  }
  async webhookSecret() { return sha256hex('shop-webhook:' + this.env.BOT_TOKEN); }

  /* --- защита кода продавца от перебора --- */
  async checkCode(code) {
    if (!this.env.ADMIN_CODE) return 'nocode';
    const f = (await this.st.get('fail')) || { n: 0, until: 0 };
    if (f.until > Date.now()) return 'locked';
    const a = await sha256hex('code:' + String(code || ''));
    const b = await sha256hex('code:' + this.env.ADMIN_CODE);
    if (safeEq(a, b)) {
      if (f.n) await this.st.put('fail', { n: 0, until: 0 });
      return 'ok';
    }
    f.n += 1;
    if (f.n >= 8) { f.n = 0; f.until = Date.now() + 3600 * 1000; }
    await this.st.put('fail', f);
    return 'bad';
  }

  /* --- маршрутизация --- */
  async fetch(request) {
    const url = new URL(request.url);
    this.origin = url.origin;
    const path = url.pathname, method = request.method;
    try {
      if (path === '/webhook' && method === 'POST') return await this.webhook(request);
      if (path === '/setup') return await this.setup(request);
      if ((method === 'GET' || method === 'HEAD') && path.startsWith('/img/')) return await this.image(path.slice(5));
      if (path === '/api/config' && method === 'GET') return json({ cfg: await this.getCfg(), prod: await this.pubProd() });
      if (path.startsWith('/api/')) return await this.api(request, path, method);
      return json({ error: 'not_found' }, 404);
    } catch (e) {
      console.error('shop error', path, e && e.stack || e);
      return json({ error: 'server' }, 500);
    }
  }

  async readBody(request, limit) {
    const text = await request.text();
    if (text.length > limit) return { err: 413 };
    try { return { body: JSON.parse(text || 'null') }; } catch (e) { return { err: 400 }; }
  }

  async api(request, path, method) {
    if (!this.env.BOT_TOKEN) return json({ error: 'no_token' }, 500);
    const au = await verifyInitData(request.headers.get('x-init-data') || '', this.env.BOT_TOKEN);
    if (au.err) return json({ error: au.err }, 401);
    const u = au.user, uid = u.id;
    const admin = await this.isAdmin(uid);

    if (path === '/api/bootstrap' && method === 'GET') {
      return json({ cfg: await this.getCfg(), prod: await this.pubProd(), me: { id: uid, name: u.first_name || '', admin }, orders: await this.myOrders(uid) });
    }
    if (path === '/api/my-orders' && method === 'GET') return json({ orders: await this.myOrders(uid) });

    if (path === '/api/order' && method === 'POST') {
      const r = await this.readBody(request, 20000);
      if (r.err) return json({ error: 'bad_request' }, r.err);
      return await this.placeOrder(u, r.body);
    }
    if (path === '/api/cancel' && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
      return await this.cancelMine(uid, String(r.body.id || ''));
    }

    if (path.startsWith('/api/admin/')) {
      if (!admin) return json({ error: 'forbidden' }, 403);
      if (path === '/api/admin/orders' && method === 'GET') {
        const act = (await this.st.get('act')) || [], hist = (await this.st.get('hist')) || [];
        const orders = (await this.getOrders(act.concat(hist))).map(adminOrder);
        const stats = (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 };
        return json({ orders, stats });
      }
      if (path === '/api/admin/status' && method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        const res = await this.changeStatus(String(r.body.id || ''), String(r.body.to || ''));
        if (res.err) return json({ error: res.err, order: res.order ? adminOrder(res.order) : undefined }, res.err === 'not_found' ? 404 : 409);
        if (res.changed) await this.afterChange(res.order, 'admin');
        return json({ order: adminOrder(res.order), stats: res.stats || (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 } });
      }
      if (path === '/api/admin/config' && method === 'PUT') {
        const r = await this.readBody(request, 100000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        const cfg = sanitizeCfg(r.body.cfg);
        await this.st.put('cfg', cfg);
        return json({ cfg });
      }
      if (path === '/api/admin/products' && method === 'PUT') {
        const r = await this.readBody(request, PROD_BODY_MAX);
        if (r.err || !r.body) return json({ error: 'bad_request' }, r.err || 400);
        return await this.saveProd(r.body.prod);
      }
      if (path === '/api/admin/stock' && method === 'GET') return json({ stk: await this.getStk() });
      if (path === '/api/admin/journal' && method === 'GET') return json({ jr: (await this.st.get('jr')) || [] });
      if (path === '/api/admin/stock' && method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        return await this.stockOp(u, r.body);
      }
      if (path.startsWith('/api/admin/photo/') && (method === 'PUT' || method === 'DELETE')) {
        const id = path.slice('/api/admin/photo/'.length);
        if (!validId(id)) return json({ error: 'not_found' }, 404);
        if (method === 'DELETE') return await this.setPhoto(id, null);
        // фото приходит как есть, байтами (JPEG), без base64: так сервер почти ничего не считает
        if (Number(request.headers.get('content-length') || 0) > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
        const bytes = new Uint8Array(await request.arrayBuffer());
        if (bytes.length > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
        if (!checkJpeg(bytes, PROD_PHOTO_LIM)) return json({ error: 'bad_photo' }, 400);
        return await this.setPhoto(id, bytes);
      }
    }
    return json({ error: 'not_found' }, 404);
  }

  async myOrders(uid) {
    const ids = (await this.st.get('m:' + uid)) || [];
    const list = await this.getOrders(ids);
    return list.map(publicOrder);
  }

  /* --- заказы --- */
  async placeOrder(u, body) {
    const cfg = await this.getCfg();
    const prod = await this.getProd();
    const stk = await this.getStk();
    const v = validateOrder(body, cfg, prod, stk);
    if (v.err) {
      const fresh = v.err === 'unavailable' || v.err === 'no_delivery' || v.err === 'stock';
      return json({ error: v.err, short: v.short, cfg: fresh ? cfg : undefined, prod: fresh ? publicProd(prod, stk) : undefined }, fresh ? 409 : 400);
    }
    if (body.expectTotal !== undefined && Number(body.expectTotal) !== v.total) {
      return json({ error: 'price_changed', cfg, prod: publicProd(prod, stk) }, 409);
    }
    const uid = u.id;
    const ids = (await this.st.get('m:' + uid)) || [];
    const mine = await this.getOrders(ids);
    if (mine.filter(o => o.status === 'new').length >= MAX_NEW_PER_USER) return json({ error: 'too_many' }, 429);
    const act = (await this.st.get('act')) || [];
    if (act.length >= MAX_ACTIVE) return json({ error: 'busy' }, 503);

    let id;
    do { id = 'Z-' + randId(5); } while (await this.st.get('o:' + id));
    const order = {
      id, createdAt: new Date().toISOString(), status: 'new', lang: body.lang === 'uz' ? 'uz' : 'ru',
      name: v.name, phone: v.phone, mode: v.mode, address: v.address, pickupAt: v.pickupAt, comment: v.comment,
      items: v.items, total: v.total,
      uid, tg: { username: cleanStr(u.username || '', 40), name: cleanStr([u.first_name, u.last_name].filter(Boolean).join(' '), 80) },
      msgs: []
    };
    ids.unshift(id); act.unshift(id);
    // откладываем товар под заказ: пока заказ не выдан и не отменён, эти штуки другим покупателям недоступны
    const upd = { ['o:' + id]: order, ['m:' + uid]: ids.slice(0, 40), act };
    const low = [];
    v.items.forEach(it => {
      const s = stk[it.id];
      if (!s) return;
      const before = stkAvail(s);
      s.r += it.qty;
      (order.rs = order.rs || {})[it.id] = it.qty;
      low.push({ title: ruTitle(it), before, after: stkAvail(s), low: s.low, q: s.q, r: s.r });
    });
    if (order.rs) upd.stk = stk;
    await this.st.put(upd);

    // уведомления: ошибки Telegram не должны ломать приём заказа
    const sent = [];
    const card = adminCard(order, cfg.shop, this.origin, false);
    for (const aid of (await this.st.get('admins')) || []) {
      const t = await this.tg('sendMessage', { chat_id: aid, text: card.text, reply_markup: card.reply_markup });
      if (t.ok && t.result) sent.push({ chat_id: aid, message_id: t.result.message_id });
    }
    if (sent.length) {
      const cur = await this.st.get('o:' + id);
      if (cur) {
        cur.msgs = (cur.msgs || []).concat(sent);
        await this.st.put('o:' + id, cur);
      }
    }
    await this.tg('sendMessage', { chat_id: uid, text: customerText(order, 'placed', cfg.shop), reply_markup: openBtn(this.origin, order.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы') });
    await this.stockAlert(low);
    return json({ order: publicOrder(order) });
  }

  /* --- каталог --- */
  async saveProd(input) {
    const old = await this.getProd();
    const prod = sanitizeProd(input, old);
    const keep = new Set(prod.items.map(i => i.id));
    const gone = old.items.map(i => i.id).filter(id => !keep.has(id));
    const stk = await this.getStk();
    const upd = { prod };
    if (gone.some(id => stk[id])) { gone.forEach(id => { delete stk[id]; }); upd.stk = stk; }   // остаток удалённого товара не копим
    await this.st.put(upd);
    if (gone.length) await this.st.delete(gone.map(id => 'p:' + id));   // фото удалённых товаров не копим
    return json({ prod: publicProd(prod, stk) });
  }

  /* Приход, исправление остатка, порог «мало», выключение учёта. Всё считает сервер, приложение шлёт только действие. */
  async stockOp(u, b) {
    if (!validId(b.id)) return json({ error: 'bad_request' }, 400);
    const prod = await this.getProd();
    const it = prod.items.find(x => x.id === b.id);
    if (!it) return json({ error: 'not_found' }, 404);
    const stk = await this.getStk();
    const s0 = stk[it.id];
    const row = (kind, d, q) => ({ t: new Date().toISOString(), id: it.id, name: ruTitle(it), kind, d, q, by: cleanStr(u.first_name || '', 30) });
    const rows = [], low = [];
    if (b.op === 'off') {
      if (s0) { delete stk[it.id]; rows.push(row('off', 0, s0.q)); }
    } else if (b.op === 'low') {
      const n = intIn(b.n, 0, MAX_STOCK);
      if (n === null) return json({ error: 'bad_request' }, 400);
      if (!s0) return json({ error: 'not_tracked' }, 409);
      s0.low = n;
    } else if (b.op === 'in' || b.op === 'set') {
      const n = intIn(b.n, b.op === 'in' ? 1 : 0, MAX_STOCK);
      const lw = b.low === undefined || b.low === null ? null : intIn(b.low, 0, MAX_STOCK);
      if (n === null || (b.low !== undefined && b.low !== null && lw === null)) return json({ error: 'bad_request' }, 400);
      let s = s0;
      if (!s) { s = stk[it.id] = { q: 0, r: await this.reservedFor(it.id), low: 0 }; }
      const before = stkAvail(s), q0 = s.q;
      s.q = b.op === 'in' ? Math.min(MAX_STOCK, s.q + n) : n;
      if (lw !== null) s.low = lw;
      rows.push(row(!s0 ? 'start' : b.op === 'in' ? 'in' : 'fix', s.q - q0, s.q));
      if (s0) low.push({ title: ruTitle(it), before, after: stkAvail(s), low: s.low, q: s.q, r: s.r });
    } else return json({ error: 'bad_request' }, 400);
    const upd = { stk };
    if (rows.length) upd.jr = await this.jrWith(rows);
    await this.st.put(upd);
    await this.stockAlert(low);
    return json({ stk });
  }
  async setPhoto(id, bytes) {
    const prod = await this.getProd();
    const it = prod.items.find(x => x.id === id);
    if (!it) return json({ error: 'not_found' }, 404);
    if (bytes) {
      it.pv = randId(6);
      await this.st.put({ ['p:' + id]: bytes, prod });
    } else {
      it.pv = '';
      await this.st.put('prod', prod);
      await this.st.delete('p:' + id);
    }
    return json({ pv: it.pv });
  }
  /* Фото товара: открыто всем, как обычная картинка в каталоге. Адрес с ?v= меняется вместе с фото, поэтому кэш вечный. */
  async image(id) {
    if (!validId(id)) return new Response('not found', { status: 404 });
    const bytes = await this.st.get('p:' + id);
    if (!bytes) return new Response('not found', { status: 404 });
    return new Response(bytes, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
  }

  async cancelMine(uid, id) {
    const o = await this.st.get('o:' + id);
    if (!o || o.uid !== uid) return json({ error: 'not_found' }, 404);
    if (o.status !== 'new') return json({ error: 'not_cancellable', order: publicOrder(o) }, 409);
    const res = await this.changeStatus(id, 'cancelled');
    if (res.err) return json({ error: res.err }, 409);
    await this.afterChange(res.order, 'customer');
    return json({ order: publicOrder(res.order) });
  }

  /* Меняет статус без обращений к сети между чтением и записью. */
  async changeStatus(id, to) {
    const o = await this.st.get('o:' + id);
    if (!o) return { err: 'not_found' };
    if (o.status === to) return { order: o, same: true };
    if (!(NEXT[o.status] || []).includes(to)) return { err: 'bad_transition', order: o };
    o.status = to;
    o.statusAt = new Date().toISOString();
    const upd = { ['o:' + id]: o };
    let stats = null;
    if (!NEXT[to]) {
      const act = ((await this.st.get('act')) || []).filter(x => x !== id);
      const hist = ((await this.st.get('hist')) || []).filter(x => x !== id);
      hist.unshift(id);
      upd.act = act;
      upd.hist = hist.slice(0, HIST_CAP);
      stats = (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 };
      if (to === 'done') { stats.doneSum += Number(o.total) || 0; stats.doneCount += 1; }
      upd.stats = stats;
      // отложенный товар: при отмене возвращается в свободный, при выдаче списывается со склада
      if (o.rs) {
        const stk = await this.getStk(), rows = [];
        for (const pid of Object.keys(o.rs)) {
          const s = stk[pid], qty = Number(o.rs[pid]) || 0;
          if (!s) continue;
          s.r = Math.max(0, s.r - qty);
          if (to === 'done') {
            const q0 = s.q, it = (o.items || []).find(x => x.id === pid) || { name: pid };
            s.q = Math.max(0, s.q - qty);
            rows.push({ t: o.statusAt, id: pid, name: ruTitle(it), kind: 'out', d: s.q - q0, q: s.q, ref: o.id });
          }
        }
        delete o.rs;
        upd.stk = stk;
        if (rows.length) upd.jr = await this.jrWith(rows);
      }
    }
    await this.st.put(upd);
    return { order: o, changed: true, stats: stats || undefined };
  }

  /* Обновляет карточки продавца и пишет клиенту. */
  async afterChange(o, by, extraMsg) {
    const cfg = await this.getCfg();
    const card = adminCard(o, cfg.shop, this.origin, false);
    const seen = new Set(), targets = [];
    (o.msgs || []).concat(extraMsg ? [extraMsg] : []).forEach(m => {
      const k = m.chat_id + ':' + m.message_id;
      if (!seen.has(k)) { seen.add(k); targets.push(m); }
    });
    for (const m of targets) {
      await this.editCard(m, card);
    }
    if (by === 'admin') {
      const text = customerText(o, o.status, cfg.shop);
      if (text) await this.tg('sendMessage', { chat_id: o.uid, text, reply_markup: openBtn(this.origin, o.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы') });
    } else if (by === 'customer') {
      for (const aid of (await this.st.get('admins')) || []) {
        await this.tg('sendMessage', { chat_id: aid, text: '❌ Клиент отменил заказ ' + o.id + ' (' + o.name + ').' });
      }
    }
  }

  /* --- webhook Telegram --- */
  async webhook(request) {
    if (!this.env.BOT_TOKEN) return new Response('no token', { status: 500 });
    const secret = await this.webhookSecret();
    if (!safeEq(request.headers.get('x-telegram-bot-api-secret-token') || '', secret)) return new Response('forbidden', { status: 403 });
    let up = null;
    try { up = await request.json(); } catch (e) { return json({ ok: true }); }
    try {
      if (up && up.message) await this.onMessage(up.message);
      else if (up && up.callback_query) await this.onCallback(up.callback_query);
    } catch (e) {
      console.error('webhook handler error', e && e.stack || e);
    }
    return json({ ok: true });
  }

  async onMessage(msg) {
    if (!msg.from || !msg.chat || msg.chat.type !== 'private') return;
    const text = String(msg.text || '').trim();
    const lang = String(msg.from.language_code || '').toLowerCase().startsWith('uz') ? 'uz' : 'ru';
    const cmd = text.split(/\s+/)[0].split('@')[0].toLowerCase();
    const chat = msg.chat.id;
    const cfg = await this.getCfg();
    const openText = lang === 'uz' ? '🛒 Katalogni ochish' : '🛒 Открыть каталог';

    if (cmd === '/admin') {
      const code = text.replace(/^\S+\s*/, '');
      if (!code) {
        const isAdm = await this.isAdmin(msg.from.id);
        await this.tg('sendMessage', { chat_id: chat, text: isAdm ? 'Вы подключены как продавец. Новые заказы приходят в этот чат.' : welcomeText(lang, false, cfg.shop), reply_markup: openBtn(this.origin, openText) });
        return;
      }
      const r = await this.checkCode(code);
      // код не должен оставаться в переписке
      await this.tg('deleteMessage', { chat_id: chat, message_id: msg.message_id });
      if (r === 'ok') {
        const admins = (await this.st.get('admins')) || [];
        if (!admins.includes(msg.from.id)) { admins.push(msg.from.id); await this.st.put('admins', admins); }
        await this.tg('sendMessage', { chat_id: chat, text: 'Готово, вы продавец. Новые заказы будут приходить сюда с кнопками «Принять», «Готов», «Выдан». Каталог, цены и настройки меняются в приложении, вкладка «Продавец».', reply_markup: openBtn(this.origin, 'Открыть приложение') });
      } else if (r === 'locked') {
        await this.tg('sendMessage', { chat_id: chat, text: 'Слишком много неверных попыток. Попробуйте через час.' });
      } else if (r === 'nocode') {
        await this.tg('sendMessage', { chat_id: chat, text: 'На сервере не задан ADMIN_CODE.' });
      } else {
        await this.tg('sendMessage', { chat_id: chat, text: 'Неверный код.' });
      }
      return;
    }

    const isAdm = await this.isAdmin(msg.from.id);
    await this.tg('sendMessage', { chat_id: chat, text: welcomeText(lang, isAdm, cfg.shop), reply_markup: openBtn(this.origin, openText) });
  }

  async onCallback(cq) {
    const answer = (text, alert) => this.tg('answerCallbackQuery', { callback_query_id: cq.id, text: text ? String(text).slice(0, 190) : undefined, show_alert: !!alert });
    if (!cq.from || !(await this.isAdmin(cq.from.id))) return answer('Нет доступа', true);
    const parts = String(cq.data || '').split(':');
    const kind = parts[0], id = parts[1], to = parts[2];
    const o = id ? await this.st.get('o:' + id) : null;
    if (!o) return answer('Заказ не найден', true);
    const cfg = await this.getCfg();
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const edit = card => here ? this.editCard(here, card) : null;

    if (kind === 'c') { await edit(adminCard(o, cfg.shop, this.origin, true)); return answer('Отменить заказ ' + id + '?'); }
    if (kind === 'b') { await edit(adminCard(o, cfg.shop, this.origin, false)); return answer(''); }
    if (kind === 's') {
      const res = await this.changeStatus(id, to);
      if (res.err === 'bad_transition') {
        await edit(adminCard(res.order, cfg.shop, this.origin, false));
        return answer('Статус уже другой: ' + stOf(res.order.status, res.order.mode).name, true);
      }
      if (res.err) return answer('Не получилось', true);
      await this.afterChange(res.order, res.changed ? 'admin' : null, here);
      return answer(stOf(res.order.status, res.order.mode).name);
    }
    return answer('');
  }

  /* --- страница /setup: один раз связывает бота с этим сервером --- */
  async setup(request) {
    if (request.method !== 'POST') {
      return setupPage('<p>Введите код продавца (<code>ADMIN_CODE</code>), который вы задали при установке. Страница подключит бота к этому адресу.</p>'
        + '<form method="post"><p><input type="password" name="code" autocomplete="off" autofocus required style="width:100%"></p><p><button type="submit">Подключить бота</button></p></form>');
    }
    const code = new URLSearchParams(await request.text()).get('code') || '';
    const r = await this.checkCode(code);
    if (r === 'nocode') return setupPage('<p class="bad">На сервере не задан секрет <code>ADMIN_CODE</code>. Задайте его командой <code>npx wrangler secret put ADMIN_CODE</code> и откройте страницу снова.</p>');
    if (r === 'locked') return setupPage('<p class="bad">Слишком много неверных попыток. Подождите час.</p>');
    if (r !== 'ok') return setupPage('<p class="bad">Неверный код.</p><p><a href="/setup">Попробовать ещё раз</a></p>');
    if (!this.env.BOT_TOKEN) return setupPage('<p class="bad">На сервере не задан секрет <code>BOT_TOKEN</code>. Задайте его командой <code>npx wrangler secret put BOT_TOKEN</code> и откройте страницу снова.</p>');

    const steps = [];
    const me = await this.tg('getMe', {});
    steps.push(['Токен бота', me.ok, me.ok ? '@' + me.result.username : me.description]);
    if (me.ok) {
      const hook = await this.tg('setWebhook', { url: this.origin + '/webhook', secret_token: await this.webhookSecret(), allowed_updates: ['message', 'callback_query'], max_connections: 10 });
      steps.push(['Приём сообщений бота', hook.ok, hook.ok ? 'подключён' : hook.description]);
      const menu = await this.tg('setChatMenuButton', { menu_button: { type: 'web_app', text: '🛒 Каталог', web_app: { url: this.origin + '/' } } });
      steps.push(['Кнопка меню в боте', menu.ok, menu.ok ? 'установлена' : menu.description]);
      const cmds = await this.tg('setMyCommands', { commands: [{ command: 'start', description: 'Открыть каталог' }] });
      steps.push(['Команды бота', cmds.ok, cmds.ok ? 'установлены' : cmds.description]);
    }
    const allOk = steps.every(s => s[1]);
    return setupPage('<ul>' + steps.map(s => '<li class="' + (s[1] ? 'ok' : 'bad') + '">' + (s[1] ? '✔ ' : '✘ ') + esc(s[0]) + ': ' + esc(s[2]) + '</li>').join('') + '</ul>'
      + (allOk ? '<p>Готово. Теперь откройте бота' + (me.ok ? ' <b>@' + esc(me.result.username) + '</b>' : '') + ' в Telegram и отправьте ему сообщение <code>/admin ВАШ_КОД</code>. После этого заказы будут приходить вам.</p>'
        : '<p class="bad">Не всё получилось. Проверьте токен бота и повторите.</p>'));
  }
}
