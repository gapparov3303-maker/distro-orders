// Файл собран автоматически (node build.js). Править нужно файлы в src/.
const APP_HTML = "<!doctype html>\n<html lang=\"ru\"><head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n<meta name=\"color-scheme\" content=\"light dark\">\n<title>Каталог</title>\n<script src=\"https://telegram.org/js/telegram-web-app.js\"></script>\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Unbounded:wght@500;700&display=swap\">\n<style>\n/* Layout: catalog with search and categories, cart with order form; seller panel is a tabbed list of orders, catalog editor and settings. */\n:root{\n  --bg:#F3F7F6; --surface:#FFFFFF; --surface-2:#E7EFED; --ink:#14231F; --ink-2:#5B6E69; --line:#D6E3E0;\n  --accent:#0F766E; --accent-ink:#FFFFFF; --accent-soft:#D9F0EC;\n  --stage-a:#E2F1EE; --stage-b:#E6ECF7;\n  --ok:#1F7A4D; --ok-soft:#DDF3E6; --warn:#9A5B00; --warn-soft:#FBEBCB; --bad:#B3261E; --bad-soft:#FBE0DD; --info:#1F5FA3; --info-soft:#DCEBFA; --mute:#5B6E69; --mute-soft:#E7EFED;\n  --f-display:'Unbounded','Onest',system-ui,sans-serif;\n  --f-body:'Onest',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;\n  --hdr:56px;\n}\n@media (prefers-color-scheme: dark){\n  :root:not([data-theme=\"light\"]){\n    --bg:#0E1614; --surface:#162220; --surface-2:#1D2D2A; --ink:#E8F3F0; --ink-2:#9DB5AF; --line:#27403B;\n    --accent:#4FD1C0; --accent-ink:#06211D; --accent-soft:#16403A;\n    --stage-a:#1B2B28; --stage-b:#1B2433;\n    --ok:#6FD3A0; --ok-soft:#1D3A2D; --warn:#F2B957; --warn-soft:#3F3015; --bad:#FF8A80; --bad-soft:#44201E; --info:#7DB6F0; --info-soft:#1B3149; --mute:#9DB5AF; --mute-soft:#1D2D2A;\n    color-scheme:dark;\n  }\n}\n:root[data-theme=\"dark\"]{\n  --bg:#0E1614; --surface:#162220; --surface-2:#1D2D2A; --ink:#E8F3F0; --ink-2:#9DB5AF; --line:#27403B;\n  --accent:#4FD1C0; --accent-ink:#06211D; --accent-soft:#16403A;\n  --stage-a:#1B2B28; --stage-b:#1B2433;\n  --ok:#6FD3A0; --ok-soft:#1D3A2D; --warn:#F2B957; --warn-soft:#3F3015; --bad:#FF8A80; --bad-soft:#44201E; --info:#7DB6F0; --info-soft:#1B3149; --mute:#9DB5AF; --mute-soft:#1D2D2A;\n  color-scheme:dark;\n}\n*{box-sizing:border-box}\nhtml,body{margin:0}\nbody{-webkit-text-size-adjust:100%;min-height:100vh;background:var(--bg);color:var(--ink);font:15px/1.45 var(--f-body);-webkit-font-smoothing:antialiased}\nbody::before{content:\"\";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);background:var(--bg);z-index:30}\nbutton,input,select,textarea{font:inherit;color:inherit}\nh1,h2,h3,p{margin:0}\n.wrap{max-width:1080px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n\n/* header */\n.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--bg);border-bottom:1px solid var(--line)}\n.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:var(--hdr)}\n.brand{display:flex;align-items:center;gap:10px;font:700 15px/1 var(--f-display);letter-spacing:.01em;min-width:0}\n.brand svg{flex:none}\n.brand span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.right{display:flex;align-items:center;gap:8px;flex:none}\n.nav{display:flex;flex:none;gap:2px;background:var(--surface-2);padding:4px;border-radius:12px}\n.nav button{appearance:none;border:0;background:transparent;border-radius:9px;padding:7px 10px;font-size:13px;font-weight:600;color:var(--ink-2);cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap}\n.nav button[aria-current=\"page\"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(20,35,31,.14)}\n.langbtn{appearance:none;height:38px;min-width:42px;padding:0 8px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface);font-weight:700;font-size:12px;letter-spacing:.04em;cursor:pointer}\n.badge{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--accent);color:var(--accent-ink);font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}\n@media (max-width:430px){.nav button{padding:7px 7px;font-size:12.5px;gap:4px}.nav{gap:1px;padding:3px}.langbtn{min-width:38px;padding:0 6px}.right{gap:6px}}\n@media (max-width:480px){.brand span{display:none}}\n@media (max-width:390px){.brand{display:none}.top .wrap{justify-content:space-between}}\n\n/* sections, chips */\n.sec{padding-top:18px}\n.sec h2{font:700 13px/1.2 var(--f-display);letter-spacing:.02em;display:flex;align-items:baseline;gap:10px;margin-bottom:12px}\n.chip{appearance:none;border:1.5px solid var(--line);background:var(--surface);border-radius:999px;height:36px;min-width:36px;padding:0 12px;cursor:pointer;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}\n.chip[aria-pressed=\"true\"]{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft),inset 0 0 0 1px var(--accent)}\n\n/* forms */\n.lab{display:block;font-size:12px;font-weight:600;color:var(--ink-2);margin-bottom:6px}\ninput[type=text],input[type=tel],input[type=number],input[type=date],input[type=search],select,textarea{width:100%;background:var(--surface);border:1.5px solid var(--line);border-radius:10px;padding:11px 12px;min-width:0}\ninput:focus,select:focus,textarea:focus{border-color:var(--accent);outline:none;box-shadow:0 0 0 3px var(--accent-soft)}\ninput[aria-invalid=\"true\"],select[aria-invalid=\"true\"],textarea[aria-invalid=\"true\"]{border-color:var(--bad)}\ntextarea{resize:vertical;min-height:72px}\ninput[type=checkbox]{width:20px;height:20px;accent-color:var(--accent);margin:0}\n.form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\n.form .full{grid-column:1/-1}\n@media (max-width:540px){.form{grid-template-columns:minmax(0,1fr)}}\n.err{color:var(--bad);font-size:12px;margin-top:4px;min-height:0}\n.seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:var(--surface-2);padding:4px;border-radius:12px}\n.seg button{appearance:none;border:0;background:transparent;border-radius:9px;padding:10px 8px;font-weight:600;font-size:14px;color:var(--ink-2);cursor:pointer}\n.seg button[aria-pressed=\"true\"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(20,35,31,.14)}\n.sum{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:6px 14px}\n.sum .r{display:flex;justify-content:space-between;gap:12px;padding:7px 0;font-size:14px;border-bottom:1px dashed var(--line)}\n.sum .r span:first-child{min-width:0;overflow-wrap:anywhere}\n.sum .r span:last-child{white-space:nowrap;font-variant-numeric:tabular-nums}\n.sum .r.t{border-bottom:0;font-weight:700;padding-top:10px}\n.sum .r.t span:last-child{font:700 16px var(--f-display)}\n.note{background:var(--accent-soft);border-radius:12px;padding:10px 12px;font-size:13px}\n.note.warnnote{background:var(--warn-soft);color:var(--warn);font-weight:600}\n.btn{appearance:none;border:0;border-radius:12px;padding:13px 18px;font-weight:600;font-size:15px;background:var(--accent);color:var(--accent-ink);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-align:center}\n.btn.ghost{background:transparent;color:var(--ink);border:1.5px solid var(--line)}\n.btn.sm{padding:7px 12px;font-size:13px;border-radius:10px}\n.btn[disabled]{opacity:.55;cursor:wait}\n.bar{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--surface);border-top:1px solid var(--line);padding-top:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}\n.bar .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px}\n.bar small{display:block;font-size:12px;color:var(--ink-2)}\n.bar strong{font:700 17px/1.2 var(--f-display);font-variant-numeric:tabular-nums}\n.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(88px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--bg);padding:10px 14px;border-radius:10px;font-size:13px;z-index:50;max-width:calc(100% - 32px);text-align:center}\n\n/* orders */\n.page{padding-block:18px 56px}\n.page h1{font:700 18px/1.25 var(--f-display);margin-bottom:6px;text-wrap:balance}\n.lead{color:var(--ink-2);margin-bottom:16px;max-width:60ch}\n.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0}\n@media (max-width:640px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 12px}\n.stat small{display:block;font-size:12px;color:var(--ink-2)}\n.stat b{font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}\n.stat.hot{background:var(--accent-soft);border-color:var(--accent)}\n.tabs{display:flex;flex-wrap:nowrap;gap:0;margin-bottom:14px;overflow-x:auto;scrollbar-width:none}\n.tabs::-webkit-scrollbar{display:none}\n.tab{appearance:none;background:transparent;border:0;border-bottom:2.5px solid transparent;box-shadow:inset 0 -1px 0 var(--line);padding:10px 12px;font-weight:600;font-size:14px;color:var(--ink-2);cursor:pointer;white-space:nowrap;flex:none}\n.tab .badge{margin-left:3px}\n/* шесть вкладок на узком экране: две строки по три, чтобы ни одна не пряталась за краем */\n@media (max-width:520px){.tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:visible}.tab{padding:10px 4px;font-size:13px;text-align:center;white-space:normal}.tab .badge{margin-left:2px;min-width:16px;height:16px;padding:0 4px;font-size:10px}}\n.tab[aria-selected=\"true\"]{color:var(--ink);border-bottom-color:var(--accent)}\n.filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}\n.ordlist{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}\n@media (min-width:980px){.ordlist{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.ord{display:grid;grid-template-columns:minmax(0,96px) minmax(0,1fr);gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:12px}\n.ord.is-new{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}\n.ord .th{background:linear-gradient(160deg,var(--stage-a),var(--stage-b));border-radius:12px;align-self:start;aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}\n.ord .th img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:12px}\n.ord .th .ph{font-size:34px}\n.ord .ob{min-width:0;display:grid;gap:5px;align-content:start}\n.oh{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}\n.oid{font:700 13px var(--f-display);letter-spacing:.02em}\n.when{font-weight:600}\n.spec{font-size:13px;color:var(--ink-2);overflow-wrap:anywhere}\n.cust{font-size:14px;display:flex;flex-wrap:wrap;align-items:center;gap:6px}\n.cm{font-size:13px;background:var(--surface-2);border-radius:8px;padding:6px 8px;overflow-wrap:anywhere}\n.tot{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}\n.tot b{font:700 15px var(--f-display);font-variant-numeric:tabular-nums}\n.tot span{font-size:12px;color:var(--ink-2)}\n.acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}\n.xtools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 12px}\n.xmenu{display:flex;flex-wrap:wrap;gap:6px;width:100%}\n.xmenu .chip[disabled]{opacity:.45;cursor:default}\n.xtools .unit{width:100%;font-size:12px;color:var(--ink-2)}\n.pov{position:fixed;inset:0;z-index:40;background:var(--bg);display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px)}\n.pov[hidden]{display:none}\n.pbar{display:flex;align-items:center;gap:8px;padding:8px max(12px,env(safe-area-inset-left,0px));border-bottom:1px solid var(--line)}\n.pbar .grow{flex:1}\n.pframe{flex:1;width:100%;border:0;background:#fff;color-scheme:light}\n.st{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600}\n.st::before{content:\"\";width:7px;height:7px;border-radius:50%;background:currentColor}\n.st.info{background:var(--info-soft);color:var(--info)}\n.st.warn{background:var(--warn-soft);color:var(--warn)}\n.st.ok{background:var(--ok-soft);color:var(--ok)}\n.st.bad{background:var(--bad-soft);color:var(--bad)}\n.st.mute{background:var(--mute-soft);color:var(--mute)}\n.empty{text-align:center;padding:36px 16px;color:var(--ink-2);background:var(--surface);border:1px dashed var(--line);border-radius:16px}\n.empty b{display:block;color:var(--ink);font:700 15px var(--f-display);margin-bottom:6px}\n.ord .pl{display:flex;justify-content:space-between;gap:10px;font-size:13px}\n.ord .pl span:first-child{min-width:0;overflow-wrap:anywhere}\n.ord .pl span:last-child{white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--ink-2)}\n\n/* settings, cards */\n.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:14px}\n.card h3{font:700 13px var(--f-display);margin-bottom:2px}\n.card .unit{font-size:12px;color:var(--ink-2);margin-bottom:6px}\n.savebar{font-size:12px;color:var(--ink-2);min-height:18px;margin-bottom:10px}\n.savebar.bad{color:var(--bad)}\n.settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\n@media (max-width:540px){.settings{grid-template-columns:minmax(0,1fr)}}\n.settings .full{grid-column:1/-1}\n\n/* catalog (client) */\n.shop{padding-block:14px 130px}\n.shop h1{font:700 18px/1.25 var(--f-display);margin-bottom:12px}\n.shop .search{margin-bottom:10px}\n.pchips{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px 10px;scrollbar-width:none}\n.pchips::-webkit-scrollbar{display:none}\n.pchips .chip{flex:none;white-space:nowrap}\n.chead{font:700 14px var(--f-display);margin:20px 0 10px}\n.chg{padding:8px 0;border-top:1px solid var(--line);font-size:13px}\n.chg b{display:block;font-size:14px}.chg small{display:block;color:var(--ink-2)}\n.chg.bad small{color:var(--bad)}\n.impsum{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 0;font-size:13px}\n.impsum b{font-size:15px}\n.chead:first-child{margin-top:4px}\n.pgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}\n@media (min-width:640px){.pgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}\n@media (min-width:900px){.pgrid{grid-template-columns:repeat(4,minmax(0,1fr))}}\n.pcard{background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;min-width:0}\n.pcard.off .pimg img,.pcard.off .pimg .ph{opacity:.45;filter:grayscale(1)}\n.pcard.off .pname,.pcard.off .pprice{color:var(--ink-2)}\n.pimg{position:relative;aspect-ratio:4/3;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center;overflow:hidden}\n.pimg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}\n.ph{font-size:34px;line-height:1}\n.pimg .lbl{position:absolute;left:8px;top:8px;z-index:1;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:var(--info);color:var(--surface)}\n.pimg .lbl.sale{background:var(--bad)}\n.pimg .fav{position:absolute;right:6px;top:6px;z-index:2;width:38px;height:38px;border-radius:50%;border:0;padding:0;display:flex;align-items:center;justify-content:center;background:var(--surface);color:var(--ink-2);cursor:pointer;box-shadow:0 1px 3px rgba(20,35,31,.25)}\n.pimg .fav svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}\n.pimg .fav[aria-pressed=\"true\"]{color:var(--bad)}\n.pimg .fav[aria-pressed=\"true\"] svg{fill:currentColor}\n.pold{display:inline-block;margin-right:6px;font:500 12px var(--f-body);color:var(--ink-2);text-decoration:line-through}\n.psale{margin-left:6px;font:700 11px var(--f-body);color:var(--bad)}\n.ptier{display:block;font:500 11.5px/1.35 var(--f-body);color:var(--ink-2);margin-top:1px}\n.ptier.on{color:var(--accent);font-weight:700}\n.ppack{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n.ppack .chip{flex:1 1 auto;height:auto;min-height:34px;padding:5px 8px;font-size:12px;white-space:nowrap}\n.cline>.ppack{grid-column:1/-1;margin-top:0}\n.cline .cn small.tiernext{color:var(--accent);font-weight:600}\n.cline .cn small.packtxt{color:var(--ink-2)}\n.sum .r.disc span:last-child{color:var(--ok);font-weight:600}\n.tiers{display:grid;gap:6px}\n.trow{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink-2)}\n.trow input{width:0;flex:1 1 70px;min-width:0;padding:8px 8px}\n.trow span{flex:none}\n.sact select{flex:0 1 auto;max-width:100%;padding:9px 10px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface)}\n.snum small.pk{margin-top:2px;font-size:11px;color:var(--ink-2)}\n/* отчёты */\n.rkpi small.dl{margin-top:2px;font-size:11.5px;font-weight:600}\n.rkpi small.dl.up{color:var(--ok)}\n.rkpi small.dl.down{color:var(--bad)}\n.rkpi small.dl.flat{color:var(--ink-2)}\n.rnote{font-size:12px;color:var(--ink-2);margin:6px 0 0}\n.rread{min-height:20px;font-size:13px;margin:6px 0 8px;color:var(--ink)}\n.rread b{font-variant-numeric:tabular-nums}\n.rchart{position:relative;display:grid;grid-template-columns:44px minmax(0,1fr);gap:6px;padding-top:8px}\n.ryax{position:relative;height:150px;font-size:11px;color:var(--ink-2);font-variant-numeric:tabular-nums}\n.ryax span{position:absolute;right:0;transform:translateY(50%);white-space:nowrap}\n.rplot{position:relative;height:150px;isolation:isolate}\n.rgrid{position:absolute;left:0;right:0;border-top:1px solid var(--line);pointer-events:none}\n.rcols{position:absolute;inset:0;display:flex;align-items:flex-end;gap:2px;touch-action:pan-y}\n.rcol{appearance:none;border:0;background:transparent;padding:0;margin:0;flex:1 1 0;min-width:0;max-width:30px;height:100%;display:flex;align-items:flex-end;justify-content:center;cursor:pointer;position:relative}\n.rcol i{display:block;width:100%;max-width:24px;background:var(--accent);border-radius:4px 4px 0 0;min-height:0}\n.rcol[aria-pressed=\"true\"]::after{content:\"\";position:absolute;inset:0;background:var(--accent-soft);z-index:-1;border-radius:4px}\n.rcol:focus-visible{outline:2px solid var(--accent);outline-offset:1px}\n.rxax{display:flex;justify-content:space-between;margin:4px 0 0 50px;font-size:11px;color:var(--ink-2)}\n.rrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:8px 0;border-top:1px solid var(--line)}\n.rrow .rl{min-width:0}\n.rrow .rl b{display:block;font-weight:600;font-size:14px;overflow-wrap:anywhere}\n.rrow .rl small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.rrow .rv{font:700 13px var(--f-display);font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}\n.rbar{grid-column:1/-1;height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden}\n.rbar i{display:block;height:100%;background:var(--accent);border-radius:4px}\n.rbuy{padding:10px 0;border-top:1px solid var(--line);display:grid;gap:4px}\n.rlist>div:first-child{border-top:0}\n.rlist+.btn{margin-top:8px}\n.rgap{margin-top:10px}\n.rbuy .rh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.rbuy .rh b{font-weight:600;font-size:14px;overflow-wrap:anywhere}\n.rbuy small{font-size:12.5px;color:var(--ink-2)}\n.rtab table{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}\n.rtab th,.rtab td{text-align:right;padding:5px 4px;border-top:1px solid var(--line)}\n.rtab th:first-child,.rtab td:first-child{text-align:left}\n.rtab th{font-weight:600;color:var(--ink-2);font-size:12px}\n.pimg .tag{position:absolute;left:8px;top:8px;background:var(--ink);color:var(--bg);font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;z-index:1}\n.pbody{padding:10px 12px 12px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}\n.pname{font-weight:600;font-size:14px;line-height:1.3;overflow-wrap:anywhere}\n.pw{font-size:12px;color:var(--ink-2)}\n.pdesc{font-size:12px;color:var(--ink-2);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;cursor:pointer}\n.pdesc.open{display:block}\n.pprice{font:700 15px var(--f-display);margin-top:auto;padding-top:6px;font-variant-numeric:tabular-nums}\n.padd{margin-top:8px;width:100%;min-height:41px}\n.stepper{display:flex;align-items:center;justify-content:space-between;margin-top:8px;height:41px;box-sizing:border-box;border:1.5px solid var(--accent);border-radius:12px;overflow:hidden;background:var(--surface)}\n.stepper button{appearance:none;border:0;background:var(--accent-soft);color:var(--accent);width:40px;height:100%;flex:none;font-size:20px;font-weight:700;line-height:1;cursor:pointer}\n.stepper button[disabled]{opacity:.4;cursor:not-allowed}\n.stepper input.qty{flex:1;min-width:0;width:100%;border:0;border-radius:0;background:transparent;text-align:center;font:700 15px var(--f-display);padding:0 2px;height:100%;font-variant-numeric:tabular-nums;-moz-appearance:textfield;appearance:textfield}\n.stepper input.qty::-webkit-outer-spin-button,.stepper input.qty::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}\n.stepper input.qty:focus{box-shadow:none;background:var(--accent-soft)}\n.stepper.sm{margin-top:0;height:auto;width:132px}\n.stepper.sm button{width:34px;height:32px;font-size:18px}\n.stepper.sm input.qty{height:32px}\n.cline{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}\n.cline:first-child{border-top:0}\n.cth{width:56px;height:56px;border-radius:10px;overflow:hidden;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center;position:relative}\n.cth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.cth .ph{font-size:24px}\n.cline .cn{min-width:0}\n.cline .cn b{display:block;font-size:14px;font-weight:600;line-height:1.3;overflow-wrap:break-word}\n.cline .cn small{display:block;font-size:12px;color:var(--ink-2)}\n.cline .cr{display:grid;gap:6px;justify-items:end}\n.cline .cs{font:700 13px var(--f-display);font-variant-numeric:tabular-nums;white-space:nowrap}\n.backlink{margin-bottom:10px}\n@media (max-width:380px){\n  .cline{grid-template-columns:56px minmax(0,1fr)}\n  .cline .cr{grid-column:1/-1;grid-template-columns:auto auto;justify-content:space-between;align-items:center;justify-items:stretch}\n  .cline .cs{text-align:right}\n}\n\n/* seller: catalog editor */\n.prow{display:grid;grid-template-columns:104px minmax(0,1fr);gap:14px;padding:14px 0;border-top:1px solid var(--line)}\n.prow.off .pf{opacity:.8}\n.pph{display:flex;flex-direction:column;gap:8px;align-items:flex-start}\n.pthumb{position:relative;width:104px;height:104px;border-radius:12px;overflow:hidden;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center}\n.pthumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.pbtns{display:flex;flex-direction:column;gap:6px;align-items:flex-start}\n.pbtns label.dis,.row-btns label.dis{opacity:.6;pointer-events:none}\n.sr{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none}\n.pf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;min-width:0}\n.pf .full{grid-column:1/-1}\n.pf textarea{min-height:56px}\n.pf .avail{display:flex;align-items:flex-end;padding-bottom:10px}\n.chk{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}\n.pact{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.crow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px;align-items:center;padding:6px 0}\n.crow .x{appearance:none;border:0;background:transparent;font-size:22px;line-height:1;color:var(--ink-2);cursor:pointer;width:36px;height:36px;border-radius:10px}\n@media (max-width:480px){\n  .crow{grid-template-columns:minmax(0,1fr) auto}\n  .crow .x{grid-column:2;grid-row:1/3}\n  .crow input{grid-column:1}\n}\n@media (max-width:560px){\n  .prow{grid-template-columns:minmax(0,1fr)}\n  .pph{flex-direction:row;align-items:center}\n  .pthumb{width:88px;height:88px;flex:none}\n}\n\n/* stock: status line on product cards, seller screen «Остатки» */\n.pst{font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;color:var(--ok)}\n.pst::before{content:\"\";width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}\n.pst.low{color:var(--warn)}\n.cline .cn small.lowtxt{color:var(--warn);font-weight:600}\n.badge.warn{background:var(--warn-soft);color:var(--warn)}\n.srow{padding:14px 0;border-top:1px solid var(--line);display:grid;gap:10px}\n.srow:first-child{border-top:0;padding-top:4px}\n.sh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.sh .sn{min-width:0}\n.sh .sn b{display:block;font-weight:600;overflow-wrap:anywhere}\n.sh .sn small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.snum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\n.snum div{background:var(--surface-2);border-radius:10px;padding:8px 10px;min-width:0}\n.snum small{display:block;font-size:11px;color:var(--ink-2)}\n.snum b{font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums}\n.snum .fr.low{background:var(--warn-soft)}\n.snum .fr.low b{color:var(--warn)}\n.snum .fr.out{background:var(--bad-soft)}\n.snum .fr.out b{color:var(--bad)}\n.sact{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.sact input[type=number]{flex:0 0 150px;width:150px;padding:9px 10px}\n@media (max-width:480px){.sact input[type=number]{flex:1 1 100%;width:auto}}\n@media (max-width:480px){.sact.haspk input[type=number]{flex:1 1 110px;min-width:0}.sact.haspk select{flex:1 1 130px;min-width:0}}\n.sth{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:13px;color:var(--ink-2)}\n.sth input[type=number]{width:90px;padding:8px 10px}\n.jrow{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid var(--line);font-size:14px}\n.jrow:first-of-type{border-top:0}\n.jrow .jn{min-width:0}\n.jrow .jn b{display:block;font-weight:600;overflow-wrap:anywhere}\n.jrow small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.jrow .jd{text-align:right;flex:none;font:700 14px var(--f-display);font-variant-numeric:tabular-nums}\n.jrow .jd small{font:400 12px var(--f-body)}\n.jrow .jd.plus{color:var(--ok)}\n.jrow .jd.minus{color:var(--bad)}\n\n/* клиенты */\n.clrow{padding:12px 0;border-top:1px solid var(--line)}\n.clrow:first-child{border-top:0;padding-top:2px}\n.clhead{appearance:none;background:transparent;border:0;width:100%;text-align:left;padding:0;cursor:pointer;display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.clhead .cn{min-width:0;display:grid;gap:2px}\n.clhead .cn b{font-size:15px;overflow-wrap:anywhere}\n.clhead .cn small{font-size:12.5px;color:var(--ink-2);overflow-wrap:anywhere}\n.cbadges{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end;flex:none;max-width:45%}\n.cmeta{font-size:12.5px;color:var(--ink-2);margin-top:6px}\n.ced{margin-top:12px;display:grid;gap:14px}\n.ced .form{gap:12px}\n.ced h3{font:700 13px var(--f-display)}\n.gchips,.achips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n.gchips .chip{height:30px;font-size:12px;padding:0 10px}\n.achips .chip{height:auto;min-height:34px;padding:6px 12px;text-align:left;justify-content:flex-start;max-width:100%;white-space:normal;line-height:1.3;overflow-wrap:anywhere}\n.ck{display:flex;gap:10px;align-items:flex-start;font-size:14px;cursor:pointer}\n.ck small{display:block;color:var(--ink-2);font-size:12px}\n.corder{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4px 10px;font-size:13px;padding:7px 0;border-top:1px dashed var(--line)}\n.corder:first-of-type{border-top:0}\n.corder .oid{font-weight:700}\n.corder .cs{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.csearch{margin-bottom:12px}\n.bannerbad{background:var(--bad-soft);color:var(--bad);border-radius:12px;padding:10px 12px;font-size:13px;font-weight:600}\n\n/* placed */\n.eyebrow{font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}\n.stack{display:grid;gap:12px}\n.row-btns{display:flex;flex-wrap:wrap;gap:8px}\n@media (prefers-reduced-motion:no-preference){.chip,.seg button{transition:border-color .12s,background-color .12s}}\n</style>\n</head><body>\n\n<header class=\"top\"><div class=\"wrap\">\n  <div class=\"brand\">\n    <svg width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" aria-hidden=\"true\"><path d=\"M4 9.5 15 4l11 5.5v11L15 26 4 20.5z\" fill=\"var(--accent-soft)\" stroke=\"var(--accent)\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><path d=\"M4 9.5 15 15l11-5.5M15 15v11\" fill=\"none\" stroke=\"var(--accent)\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/></svg>\n    <span id=\"brandName\"></span>\n  </div>\n  <div class=\"right\">\n    <nav class=\"nav\" id=\"nav\"></nav>\n    <button type=\"button\" class=\"langbtn\" id=\"langbtn\" data-act=\"lang\"></button>\n  </div>\n</div></header>\n<main id=\"view\"></main>\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\" hidden></div>\n\n<script>\n/* Общий код: настройки, единицы измерения, время, тексты заказа. Используется и в приложении, и на сервере. */\nlet LANG='ru';\nconst setLang=l=>{LANG=l==='uz'?'uz':'ru'};\nconst L=(ru,uz)=>LANG==='uz'?uz:ru;\nconst nm=o=>!o?'':(LANG==='uz'&&o.uz?o.uz:o.name);\n\n/* статусы; у самовывоза и доставки «Готов» и «Завершён» называются по-разному */\nconst STATUS={\n  new:{name:'Новый',uz:'Yangi',c:'info'},\n  accepted:{name:'В работе',uz:'Ishlanmoqda',c:'warn'},\n  ready:{name:'Готов',uz:'Tayyor',c:'ok'},\n  done:{name:'Завершён',uz:'Yakunlandi',c:'mute'},\n  cancelled:{name:'Отменён',uz:'Bekor qilindi',c:'bad'}\n};\nconst STATUS_MODE={\n  pickup:{ready:{name:'Готов к выдаче',uz:'Topshirishga tayyor'},done:{name:'Выдан',uz:'Topshirildi'}},\n  delivery:{ready:{name:'Готов к отправке',uz:'Joʻnatishga tayyor'},done:{name:'Доставлен',uz:'Yetkazildi'}}\n};\nfunction stOf(status,mode){\n  const b=STATUS[status]||STATUS.new;\n  const m=(STATUS_MODE[mode==='delivery'?'delivery':'pickup']||{})[status];\n  return m?Object.assign({},b,m):b;\n}\n\nconst DEFAULT={\n  v:3,\n  shop:{name:'Оптовая база',phone:'',telegram:'',address:'',addressUz:'',delivery:true,leadHours:2,deliveryLeadHours:24,openFrom:9,openTo:20,minOrder:0,deliveryFee:0,freeDeliveryFrom:0,discounts:[]}\n};\nconst clone=o=>JSON.parse(JSON.stringify(o));\nconst pad=n=>String(n).padStart(2,'0');\nconst ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());\nconst nf=new Intl.NumberFormat('ru-RU');\nconst num=v=>nf.format(Math.round(Number(v)||0));\nconst money=v=>num(v)+' '+L('сум','soʻm');\nconst esc=s=>String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\n\n/* единицы измерения: вес или объём одной единицы товара */\nconst UNIT_IDS=['g','kg','pc','ml','l'];\nconst UNITS={g:{ru:'г',uz:'g'},kg:{ru:'кг',uz:'kg'},pc:{ru:'шт',uz:'dona'},ml:{ru:'мл',uz:'ml'},l:{ru:'л',uz:'l'}};\nconst unitName=u=>{const x=UNITS[u]||UNITS.g;return LANG==='uz'?x.uz:x.ru};\nconst amountStr=v=>String(Math.round((Number(v)||0)*1000)/1000).replace('.',',');\nconst weightLabel=p=>Number(p&&p.amount)>0?amountStr(p.amount)+' '+unitName(p.unit):'';\nconst prodDesc=p=>LANG==='uz'&&p.descUz?p.descUz:(p.desc||'');\n\n/* Метки товара: «Акция» (со старой ценой) и «Новинка». Старая цена показывается, только если она выше нынешней. */\nconst TAGS={sale:{ru:'Акция',uz:'Aksiya'},new:{ru:'Новинка',uz:'Yangilik'}};\nconst tagName=t=>TAGS[t]?(LANG==='uz'?TAGS[t].uz:TAGS[t].ru):'';\nconst oldPrice=p=>p&&p.tag==='sale'&&Number(p.old)>Number(p.price)?Number(p.old):0;\nconst salePct=p=>{const o=oldPrice(p);return o?Math.max(1,Math.min(99,Math.round((o-Number(p.price))/o*100))):0};\n\n/* Цена за штуку зависит от количества: у товара до трёх ступеней tiers=[{n, price}] («от n шт — price»), по возрастанию n и убыванию цены.\n   Считается по штукам этого товара в заказе, и цена ступени действует на все штуки. */\nconst tiersOf=p=>Array.isArray(p&&p.tiers)?p.tiers:[];\nfunction unitPrice(p,qty){\n  let pr=Number(p&&p.price)||0;\n  tiersOf(p).forEach(t=>{if(qty>=Number(t.n)&&Number(t.price)>0&&Number(t.price)<pr)pr=Number(t.price)});\n  return pr;\n}\n/* Следующая ступень, до которой не хватает штук: {n, price, left} или null. */\nfunction nextTier(p,qty){\n  const cur=unitPrice(p,qty);\n  const t=tiersOf(p).find(x=>Number(x.n)>qty&&Number(x.price)>0&&Number(x.price)<cur);\n  return t?{n:Number(t.n),price:Number(t.price),left:Number(t.n)-qty}:null;\n}\n/* Скидка от суммы заказа: cfg.shop.discounts=[{from, pct}] — «от суммы from скидка pct %». Берётся самая большая из достигнутых. */\nfunction orderDiscount(cfg,sub){\n  let pct=0;\n  (((cfg&&cfg.shop&&cfg.shop.discounts)||[])).forEach(d=>{if(sub>=Number(d.from)&&Number(d.pct)>pct)pct=Number(d.pct)});\n  return {pct,amount:pct?Math.round(sub*pct/100):0};\n}\n/* Следующая скидка, до которой не хватает суммы: {from, pct, left} или null. */\nfunction nextDiscount(cfg,sub){\n  const cur=orderDiscount(cfg,sub).pct;\n  const d=(((cfg&&cfg.shop&&cfg.shop.discounts)||[])).find(x=>Number(x.from)>sub&&Number(x.pct)>cur);\n  return d?{from:Number(d.from),pct:Number(d.pct),left:Number(d.from)-sub}:null;\n}\n\n/* Чистка ступеней цены и скидок: одни и те же правила в приложении и на сервере.\n   Ступени цены: до трёх, «от n шт» (n от 2 до 500) по возрастанию, цена каждой ниже обычной и ниже предыдущей. */\nconst cleanTiers=(a,price)=>{\n  const t=[];\n  (Array.isArray(a)?a:[]).forEach(x=>{\n    if(!x||typeof x!=='object')return;\n    const n=Math.round(Number(x.n)),pr=Math.round(Number(x.price));\n    if(n>=2&&n<=500&&pr>=1&&pr<=1e8)t.push({n,price:pr});\n  });\n  t.sort((x,y)=>x.n-y.n);\n  const out=[];let prev=Number(price)||0;\n  t.forEach(x=>{\n    if(out.length&&x.n===out[out.length-1].n)return;\n    if(x.price<prev){out.push(x);prev=x.price}\n  });\n  return out.slice(0,3);\n};\n/* Скидки от суммы заказа: до трёх ступеней «от суммы — %»; сумма растёт, процент (1–50) строго растёт, иначе ступень отбрасывается. */\nconst cleanDiscounts=a=>{\n  const t=[];\n  (Array.isArray(a)?a:[]).forEach(d=>{\n    if(!d||typeof d!=='object')return;\n    const from=Math.round(Number(d.from)),pct=Math.round(Number(d.pct));\n    if(from>=1&&from<=1e9&&pct>=1)t.push({from,pct:Math.min(50,pct)});\n  });\n  t.sort((x,y)=>x.from-y.from);\n  const out=[];\n  t.forEach(d=>{\n    const last=out[out.length-1];\n    if(last&&(d.from===last.from||d.pct<=last.pct))return;\n    out.push(d);\n  });\n  return out.slice(0,3);\n};\n\n/* Упаковки: у товара поля box («в коробке N шт») и blk («в блоке N шт»), оба необязательные. Цена и склад всегда в штуках. */\nconst PACK_KEYS=['box','blk'];\nconst packSize=(p,k)=>{const n=Math.floor(Number(p&&p[k]));return n>=2?n:0};\nconst packShort=k=>k==='box'?L('кор.','quti'):L('бл.','blok');\nconst packWord=k=>k==='box'?L('коробка','quti'):L('блок','blok');\nconst pcsWord=()=>L('шт','dona');\n/* Раскладывает штуки по упаковкам, сначала по большим: 100 шт при коробке 48 и блоке 12 → 2 кор. + 0 бл., остаток 4 шт. */\nfunction packSplit(p,qty){\n  const parts=[];let r=Math.max(0,Math.floor(Number(qty)||0));\n  PACK_KEYS.forEach(k=>{const n=packSize(p,k);if(n&&r>=n){const c=Math.floor(r/n);parts.push({k,c,n});r-=c*n}});\n  return {parts,rest:r};\n}\n/* «2 кор. × 12 шт» (одна упаковка, без остатка), «2 кор. + 1 бл. + 4 шт» (иначе); пусто, если упаковок нет или в количество не вошла ни одна. */\nfunction packText(p,qty){\n  const {parts,rest}=packSplit(p,qty);\n  if(!parts.length)return '';\n  if(parts.length===1&&!rest)return parts[0].c+' '+packShort(parts[0].k)+' × '+parts[0].n+' '+pcsWord();\n  return parts.map(x=>x.c+' '+packShort(x.k)).concat(rest?[rest+' '+pcsWord()]:[]).join(' + ');\n}\n\n/* Остаток товара s = {q: на складе, r: отложено под заказы, low: порог «мало»}; нет записи — учёт не ведётся.\n   Покупателям: av — сколько можно заказать (не больше cap, чтобы не раскрывать большие остатки), lw — товара мало, и число показываем в подписи «Мало (осталось N)». */\nconst stkAvail=s=>s?Math.max(0,(Number(s.q)||0)-(Number(s.r)||0)):null;\nfunction stkPublic(s,cap){\n  if(!s)return undefined;\n  const a=stkAvail(s),lw=a>0&&Number(s.low)>0&&a<=Number(s.low);\n  return {av:lw||!(cap>0)?a:Math.min(a,cap),lw};\n}\n\n/* Стоимость доставки: берётся только при доставке; если указан порог «бесплатно от» и сумма товаров его достигла, доставка бесплатна. */\nfunction deliveryFee(cfg,mode,sub){\n  const sh=cfg.shop,fee=Number(sh.deliveryFee)||0,free=Number(sh.freeDeliveryFrom)||0;\n  if(mode!=='delivery'||fee<=0)return 0;\n  return free>0&&Number(sub)>=free?0:fee;\n}\nfunction mergeCfg(d){\n  const out=clone(DEFAULT);\n  if(d&&typeof d==='object'&&d.shop&&typeof d.shop==='object')Object.keys(out.shop).forEach(k=>{if(d.shop[k]!==undefined&&d.shop[k]!==null)out.shop[k]=d.shop[k]});\n  return out;\n}\n\n/* Время склада: Узбекистан, UTC+5. Возвращает Date, у которого локальные часы совпадают со стенными часами склада. */\nconst SHOP_TZ=5;\nfunction shopNow(){return new Date(Date.now()+SHOP_TZ*3600000+new Date().getTimezoneOffset()*60000)}\n/* сколько часов нужно на подготовку: самовывоз и доставка настраиваются отдельно */\nconst leadFor=(cfg,mode)=>mode==='delivery'?cfg.shop.deliveryLeadHours:cfg.shop.leadHours;\nfunction pickupInfo(cfg,now,leadHours){\n  now=now||shopNow();\n  const lead=Math.max(0,Number(leadHours!==undefined?leadHours:cfg.shop.leadHours)||0);\n  const from=Math.max(0,Math.min(22,Math.floor(Number(cfg.shop.openFrom)||9)));\n  const to=Math.max(from+1,Math.min(23,Math.floor(Number(cfg.shop.openTo)||20)));\n  const earliest=new Date(now.getTime()+lead*3600000);\n  const slots=ds=>{\n    const out=[];\n    for(let m=from*60;m<=to*60;m+=30){\n      const t=pad(Math.floor(m/60))+':'+pad(m%60);\n      const dt=new Date(ds+'T'+t+':00');\n      if(dt>=earliest)out.push(t);\n    }\n    return out;\n  };\n  let min=ymd(earliest);\n  for(let i=0;i<20;i++){\n    const d=new Date(earliest.getFullYear(),earliest.getMonth(),earliest.getDate()+i);\n    if(slots(ymd(d)).length){min=ymd(d);break}\n  }\n  const md=new Date(now.getFullYear(),now.getMonth(),now.getDate()+60);\n  return {min,max:ymd(md),slots};\n}\nconst UZ_WD=['yak','dush','sesh','chor','pay','jum','shan'];\nconst UZ_MO=['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentyabr','oktyabr','noyabr','dekabr'];\nfunction fmtWhen(s){\n  const d=new Date(s);\n  if(isNaN(d))return s||'';\n  if(LANG==='uz')return UZ_WD[d.getDay()]+', '+d.getDate()+'-'+UZ_MO[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes());\n  return d.toLocaleString('ru-RU',{weekday:'short',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});\n}\nfunction prodLine(it){\n  const w=weightLabel(it);\n  const pk=packText(it,it.qty);\n  return '• '+nm(it)+(w?' ('+w+')':'')+' × '+it.qty+(pk?' ('+pk+')':'')+' = '+money(it.price*it.qty);\n}\n/* Текст заказа для Telegram. maxItems: если список очень длинный, показываем первые позиции и пишем, сколько скрыто. */\nfunction orderText(o,shop,maxItems){\n  const items=o.items||[],P=[];\n  const shown=maxItems&&items.length>maxItems?items.slice(0,maxItems):items;\n  P.push(L('Заказ ','Buyurtma ')+o.id+' — '+(shop.name||DEFAULT.shop.name));\n  P.push(L('Товары:','Mahsulotlar:'));\n  shown.forEach(it=>P.push(prodLine(it)));\n  if(shown.length<items.length){\n    const n=items.length-shown.length;\n    P.push(L('… и ещё '+n+' поз. (полный список в приложении)','… va yana '+n+' ta pozitsiya (toʻliq roʻyxat ilovada)'));\n  }\n  if(o.mode==='delivery'){\n    P.push(L('Доставка: ','Yetkazib berish: ')+fmtWhen(o.pickupAt));\n    P.push(L('Адрес: ','Manzil: ')+(o.address||''));\n  }else P.push(L('Самовывоз: ','Olib ketish: ')+fmtWhen(o.pickupAt));\n  P.push(L('Имя: ','Ism: ')+o.name+L(', тел.: ',', tel.: ')+o.phone);\n  if(o.org)P.push(L('Организация: ','Tashkilot: ')+o.org);\n  if(o.comment)P.push(L('Комментарий: ','Izoh: ')+o.comment);\n  if(o.disc>0)P.push(L('Скидка '+o.dpct+'%: −','Chegirma '+o.dpct+'%: −')+money(o.disc));\n  if(o.fee>0)P.push(L('Стоимость доставки: ','Yetkazib berish narxi: ')+money(o.fee));\n  P.push(L('Итого: ','Jami: ')+money(o.total)+L(', оплата при получении',', olganda toʻlanadi'));\n  return P.join('\\n');\n}\n\n\n/* ---------- app ---------- */\nconst $=(s,r)=>(r||document).querySelector(s);\nconst MAX_QTY=500,MAX_LINES=30,MAX_CATS=40,MAX_ITEMS=300;\nconst S={\n  view:'shop',sellerTab:'orders',filter:'active',\n  cfg:clone(DEFAULT),\n  form:{name:'',phone:'',mode:'pickup',address:'',date:'',time:'',comment:''},\n  myOrders:[],allOrders:[],stats:{doneSum:0,doneCount:0},\n  tg:null,initData:'',uid:null,admin:false,auth:false,ready:false,authErr:'',\n  busy:false,dirty:false,saving:false,again:false,saveState:'',cc:null,\n  prod:{cats:[],items:[]},cart:{},shopCat:'all',shopStep:'list',shopPlaced:null,q:'',\n  pfilter:'all',upl:{},dirtyC:false,dirtyP:false,cd:null,\n  stk:{},stkLoaded:false,sfilter:'all',sbusy:{},sc:null,jr:[],jrOpen:false,\n  profile:null,blocked:false,pfBusy:false,\n  cl:[],clLoaded:false,cq:'',cg:'all',cOpen:null,cDet:{},cBusy:false,cDel:null,\n  pm:false,xbusy:'',pick:null,pickBusy:false,\n  fav:[],favT:null,favSeq:0,imp:null,impBusy:false,\n  rep:{days:30,data:null,busy:false,err:false,sel:-1,hov:-1,allP:false,tab:false,seq:0,drag:false,skip:0}\n};\nconst view=$('#view');\nlet toastT=null,saveT=null;\n\nfunction toast(msg){\n  const t=$('#toast');t.textContent=msg;t.hidden=false;\n  clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},Math.min(8000,Math.max(3200,String(msg).length*55)));\n}\nconst waitMs=ms=>new Promise(r=>setTimeout(r,ms));\n/* способ получения: доставка доступна, только если продавец её включил */\nconst mode=()=>S.cfg.shop.delivery!==false&&S.form.mode==='delivery'?'delivery':'pickup';\nconst pickup=()=>pickupInfo(S.cfg,shopNow(),leadFor(S.cfg,mode()));\nfunction normalizeMode(){if(S.cfg.shop.delivery===false)S.form.mode='pickup'}\n\n/* ---------- каталог: данные и корзина ---------- */\nconst normProd=d=>{const o={cats:[],items:[]};if(d&&typeof d==='object'){if(Array.isArray(d.cats))o.cats=d.cats.filter(x=>x&&typeof x==='object');if(Array.isArray(d.items))o.items=d.items.filter(x=>x&&typeof x==='object')}return o};\nconst imgUrl=p=>'/img/'+encodeURIComponent(p.id)+'?v='+encodeURIComponent(p.pv||'');\nconst pimg=p=>p.pv?'<img src=\"'+imgUrl(p)+'\" alt=\"'+esc(nm(p))+'\" loading=\"lazy\" decoding=\"async\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>';\nfunction loadCart(){try{const c=JSON.parse(localStorage.getItem('sh-cart')||'{}');if(c&&typeof c==='object'&&!Array.isArray(c))S.cart=c}catch(e){}}\nfunction saveCart(){try{localStorage.setItem('sh-cart',JSON.stringify(S.cart))}catch(e){}}\n/* имя, телефон, способ и адрес запоминаем на телефоне, чтобы повторный заказ был быстрее */\nfunction loadForm(){\n  try{\n    const f=JSON.parse(localStorage.getItem('sh-form')||'{}');\n    if(f&&typeof f==='object'){\n      ['name','phone','address'].forEach(k=>{if(typeof f[k]==='string')S.form[k]=f[k].slice(0,200)});\n      if(f.mode==='delivery')S.form.mode='delivery';\n    }\n  }catch(e){}\n}\nfunction saveForm(){try{localStorage.setItem('sh-form',JSON.stringify({name:S.form.name,phone:S.form.phone,address:S.form.address,mode:S.form.mode}))}catch(e){}}\n/* профиль на сервере главнее того, что запомнил телефон: имя и телефон берём из него; адрес подставляем, если поле пустое */\nfunction applyProfile(){\n  const p=S.profile;if(!p)return;\n  if(p.name)S.form.name=p.name;\n  if(p.phone)S.form.phone=p.phone;\n  if(!S.form.address&&p.addrs&&p.addrs.length)S.form.address=p.addrs[0];\n  saveForm();\n}\nconst blockedTxt=()=>L('Оформление заказов для вас сейчас недоступно. Свяжитесь с продавцом','Hozir siz uchun buyurtma berish mavjud emas. Sotuvchi bilan bogʻlaning')+(S.cfg.shop.phone?': '+S.cfg.shop.phone:'.');\n/* Товар нельзя заказать: продавец снял галочку «В наличии» или свободный остаток равен нулю. Поле av приходит с сервера у товаров с учётом (сколько можно заказать, не больше 500), lw — товара мало. */\nconst soldOut=p=>p.on===false||p.av===0;\n/* Сколько штук можно положить в корзину: до 500, а у товаров с учётом — не больше свободного остатка. */\nconst maxQty=p=>typeof p.av==='number'?Math.min(MAX_QTY,p.av):MAX_QTY;\nconst capOf=id=>{const p=S.prod.items.find(x=>x.id===id);return p?maxQty(p):MAX_QTY};\n/* Убирает из корзины то, чего больше нет в каталоге или что закончилось, и уменьшает количество до остатка. Возвращает, сколько позиций изменено. */\nfunction pruneCart(){\n  let n=0;\n  Object.keys(S.cart).forEach(id=>{\n    const p=S.prod.items.find(x=>x.id===id),q=Number(S.cart[id]);\n    if(!p||soldOut(p)||!(q>=1)){delete S.cart[id];n++}\n    else{const m=Math.min(maxQty(p),Math.floor(q));if(m!==q)n++;S.cart[id]=m}\n  });\n  if(n)saveCart();\n  return n;\n}\nconst cartLines=()=>S.prod.items.filter(p=>S.cart[p.id]>0).map(p=>({p,qty:S.cart[p.id]}));\nconst cartCount=()=>cartLines().reduce((s,l)=>s+l.qty,0);\n/* цена за штуку зависит от количества (ступени), скидка от суммы, доставка: всё считается так же, как на сервере (общие функции unitPrice, orderDiscount, deliveryFee) */\nconst cartTotal=()=>cartLines().reduce((s,l)=>s+l.qty*unitPrice(l.p,l.qty),0);\nconst cartDisc=()=>orderDiscount(S.cfg,cartTotal());\nconst cartFee=()=>deliveryFee(S.cfg,mode(),cartTotal());\nconst cartPay=()=>cartTotal()-cartDisc().amount+cartFee();\nconst minOrder=()=>Number(S.cfg.shop.minOrder)||0;\n/* Ставит количество в корзине (не больше остатка и 500). Возвращает, сколько в итоге стоит в корзине. */\nfunction cartSet(id,q){\n  const p=S.prod.items.find(x=>x.id===id),cap=p?maxQty(p):MAX_QTY;\n  q=Math.max(0,Math.floor(q)||0);\n  if(q>cap){\n    q=cap;\n    if(p&&typeof p.av==='number'&&p.av<MAX_QTY)toast(p.av>0?L('Осталось только '+p.av,'Faqat '+p.av+' ta qoldi'):L('Товар закончился','Mahsulot tugadi'));\n  }\n  if(q)S.cart[id]=q;else delete S.cart[id];\n  saveCart();\n  return q;\n}\nconst lowTxt=n=>L('Мало (осталось '+n+')','Oz qoldi ('+n+' ta)');\nconst shopAddress=()=>L(S.cfg.shop.address,S.cfg.shop.addressUz||S.cfg.shop.address);\nfunction activeMine(){return S.myOrders.filter(o=>o.status!=='done'&&o.status!=='cancelled').length}\nfunction newCount(){return S.allOrders.filter(o=>o.status==='new').length}\n\n/* language */\nfunction initLang(){\n  let l='';\n  try{l=localStorage.getItem('sh-lang')||''}catch(e){}\n  if(l!=='ru'&&l!=='uz'){\n    let tl='';\n    try{tl=String(S.tg&&S.tg.initDataUnsafe&&S.tg.initDataUnsafe.user&&S.tg.initDataUnsafe.user.language_code||'')}catch(e){}\n    l=(tl||navigator.language||'').toLowerCase().indexOf('uz')===0?'uz':'ru';\n  }\n  setLang(l);\n  document.documentElement.setAttribute('lang',LANG);\n}\nfunction switchLang(){\n  const next=LANG==='ru'?'uz':'ru';\n  setLang(next);\n  try{localStorage.setItem('sh-lang',next)}catch(e){}\n  document.documentElement.setAttribute('lang',next);\n  render();\n}\n\n/* nav */\nfunction renderNav(){\n  const items=[['shop',L('Каталог','Katalog'),cartCount()],['mine',L('Заказы','Buyurtmalar'),activeMine()]];\n  if(S.auth)items.push(['profile',L('Профиль','Profil')]);\n  if(S.admin)items.push(['seller',L('Продавец','Sotuvchi'),newCount()]);\n  const nav=$('#nav');\n  nav.setAttribute('aria-label',L('Разделы','Boʻlimlar'));\n  nav.innerHTML=items.map(i=>'<button type=\"button\" data-act=\"nav\" data-v=\"'+i[0]+'\"'+(S.view===i[0]?' aria-current=\"page\"':'')+'>'+i[1]+(i[2]?' <span class=\"badge\">'+i[2]+'</span>':'')+'</button>').join('');\n  const name=S.cfg.shop.name||DEFAULT.shop.name;\n  $('#brandName').textContent=name;\n  document.title=name;\n  const lb=$('#langbtn');\n  lb.textContent=LANG==='ru'?'UZ':'RU';\n  lb.setAttribute('aria-label',L('Oʻzbek tiliga oʻtish','Переключить на русский'));\n  lb.title=L('Oʻzbekcha','Русский');\n}\n\n/* ---------- каталог (клиент) ---------- */\nconst shopCats=()=>S.prod.cats.filter(c=>S.prod.items.some(p=>p.cat===c.id));\nfunction qtyHTML(id,q,small){\n  const i=esc(id),pre=small?'c':'p',cap=capOf(id);\n  return '<div class=\"stepper'+(small?' sm':'')+'\"><button type=\"button\" data-act=\"'+pre+'minus\" data-id=\"'+i+'\" aria-label=\"'+esc(L('Меньше','Kamroq'))+'\">−</button>'\n    +'<input class=\"qty\" type=\"number\" inputmode=\"numeric\" min=\"0\" max=\"'+cap+'\" value=\"'+q+'\" data-qty=\"'+i+'\" aria-label=\"'+esc(L('Количество','Miqdori'))+'\">'\n    +'<button type=\"button\" data-act=\"'+pre+'plus\" data-id=\"'+i+'\" aria-label=\"'+esc(L('Больше','Koʻproq'))+'\"'+(q>=cap?' disabled':'')+'>+</button></div>';\n}\n/* кнопки «+ блок», «+ коробка»: добавляют сразу целую упаковку (цена за штуку, количество в штуках) */\nfunction packChips(p,pre){\n  const out=['blk','box'].filter(k=>packSize(p,k)).map(k=>{\n    const n=packSize(p,k),lab=L('Добавить: '+packWord(k)+' ('+n+' шт)','Qoʻshish: '+packWord(k)+' ('+n+' dona)');\n    return '<button type=\"button\" class=\"chip\" data-act=\"'+pre+'pack\" data-id=\"'+esc(p.id)+'\" data-k=\"'+k+'\" aria-label=\"'+esc(lab)+'\">+ '+esc(packWord(k))+' · '+n+'</button>';\n  }).join('');\n  return out?'<div class=\"ppack\">'+out+'</div>':'';\n}\nfunction productCtl(p){\n  if(soldOut(p))return '<button type=\"button\" class=\"btn ghost sm padd\" disabled>'+L('Нет в наличии','Mavjud emas')+'</button>';\n  const q=S.cart[p.id]||0;\n  if(!q)return '<button type=\"button\" class=\"btn sm padd\" data-act=\"padd\" data-id=\"'+esc(p.id)+'\">'+L('В корзину','Savatga')+'</button>'+packChips(p,'p');\n  return qtyHTML(p.id,q,false)+packChips(p,'p');\n}\nconst HEART='<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.4 3.3 4.2 6.7-1.7 4.7-9.2 9.3-9.2 9.3z\"/></svg>';\nconst isFav=id=>S.fav.includes(id);\nconst favBtn=id=>S.auth?'<button type=\"button\" class=\"fav\" data-act=\"fav\" data-id=\"'+esc(id)+'\" aria-pressed=\"'+isFav(id)+'\" aria-label=\"'+esc(L('В избранное','Sevimlilarga'))+'\">'+HEART+'</button>':'';\n/* ступени цены под ценой: «от 10 шт — 7 000 сум»; та, что сейчас действует по корзине, выделена */\nfunction tiersHTML(p,q){\n  const t=tiersOf(p);\n  if(!t.length)return '';\n  let act=-1;t.forEach((x,i)=>{if(q>=x.n)act=i});\n  return t.map((x,i)=>'<span class=\"ptier'+(i===act?' on':'')+'\">'+L('от '+x.n+' шт — ',x.n+' donadan — ')+money(x.price)+'</span>').join('');\n}\nfunction priceHTML(p){\n  const q=S.cart[p.id]||0,eff=unitPrice(p,q||1),tier=eff<Number(p.price);\n  const o=tier?Number(p.price):oldPrice(p),pc=o?Math.max(1,Math.min(99,Math.round((o-eff)/o*100))):0;\n  return (o?'<span class=\"pold\">'+money(o)+'</span>':'')+money(eff)+(pc?'<span class=\"psale\">−'+pc+'%</span>':'')+tiersHTML(p,q);\n}\nfunction productCard(p){\n  const off=soldOut(p),d=prodDesc(p),w=weightLabel(p);\n  const status=off?'':(p.lw&&typeof p.av==='number'?'<div class=\"pst low\">'+esc(lowTxt(p.av))+'</div>':'<div class=\"pst\">'+L('В наличии','Mavjud')+'</div>');\n  return '<article class=\"pcard'+(off?' off':'')+'\" id=\"pc-'+esc(p.id)+'\"><div class=\"pimg\">'+pimg(p)+(off?'<span class=\"tag\">'+L('Нет в наличии','Mavjud emas')+'</span>':(p.tag?'<span class=\"lbl '+esc(p.tag)+'\">'+esc(tagName(p.tag))+'</span>':''))+favBtn(p.id)+'</div>'\n    +'<div class=\"pbody\"><div class=\"pname\">'+esc(nm(p))+'</div>'+(w?'<div class=\"pw\">'+esc(w)+'</div>':'')+status\n    +(d?'<div class=\"pdesc\" data-act=\"pdesc\">'+esc(d)+'</div>':'')\n    +'<div class=\"pprice\">'+priceHTML(p)+'</div><div class=\"pctl\">'+productCtl(p)+'</div></div></article>';\n}\n/* Поиск по названию, описанию и весу на обоих языках: каждое слово запроса должно встретиться. */\nconst normQ=s=>String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[ʻʼ’‘`']/g,'');\nfunction matchQ(p,q){\n  const words=normQ(q).split(/\\s+/).filter(Boolean);\n  if(!words.length)return true;\n  const hay=normQ([p.name,p.uz,p.desc,p.descUz,weightLabel(p)].join(' '));\n  return words.every(w=>hay.indexOf(w)>=0);\n}\n/* особые разделы рядом с категориями: избранное, акции, новинки */\nfunction shopSpecials(){\n  const out=[];\n  if(S.auth&&S.fav.some(id=>S.prod.items.some(p=>p.id===id)))out.push(['fav','★ '+L('Избранное','Sevimlilar')]);\n  if(S.prod.items.some(p=>p.tag==='sale'))out.push(['sale',tagName('sale')]);\n  if(S.prod.items.some(p=>p.tag==='new'))out.push(['new',tagName('new')]);\n  return out;\n}\nconst inShopFilter=p=>S.shopCat==='all'?true:S.shopCat==='fav'?isFav(p.id):S.shopCat==='sale'?p.tag==='sale':S.shopCat==='new'?p.tag==='new':p.cat===S.shopCat;\n/* Сетка товаров: по выбранной категории и поиску. В режиме «Все» без поиска товары идут разделами по категориям. */\nfunction paintGrid(){\n  const g=$('#pgrid');if(!g)return;\n  const q=S.q.trim();\n  const items=S.prod.items.filter(p=>inShopFilter(p)&&matchQ(p,q));\n  if(!items.length){\n    g.innerHTML=S.shopCat==='fav'&&!q?'<div class=\"empty\"><b>'+L('В избранном пока пусто','Sevimlilar hozircha boʻsh')+'</b>'+L('Нажмите на сердечко у товара, и он появится здесь.','Mahsulotdagi yurakchani bosing, u shu yerda paydo boʻladi.')+'</div>'\n      :'<div class=\"empty\"><b>'+L('Ничего не найдено','Hech narsa topilmadi')+'</b>'+L('Измените запрос или выберите другую категорию.','Soʻrovni oʻzgartiring yoki boshqa kategoriyani tanlang.')+'</div>';\n    return;\n  }\n  const cats=shopCats();\n  if(S.shopCat==='all'&&!q&&cats.length>=1){\n    const rest=items.filter(p=>!cats.some(c=>c.id===p.cat));\n    g.innerHTML=cats.map(c=>{const li=items.filter(p=>p.cat===c.id);return li.length?'<h2 class=\"chead\">'+esc(nm(c))+'</h2><div class=\"pgrid\">'+li.map(productCard).join('')+'</div>':''}).join('')\n      +(rest.length?'<div class=\"pgrid\" style=\"margin-top:20px\">'+rest.map(productCard).join('')+'</div>':'');\n  }else g.innerHTML='<div class=\"pgrid\">'+items.map(productCard).join('')+'</div>';\n}\nfunction paintShopBar(){\n  const bar=$('#bar');if(!bar)return;\n  const n=cartCount();\n  if(!n){bar.style.display='none';bar.innerHTML='';return}\n  bar.style.display='';\n  if(S.shopStep==='cart')bar.innerHTML='<div class=\"wrap\"><div><small>'+L('Итого, оплата при получении','Jami, olganda toʻlanadi')+'</small><strong id=\"ctotal\">'+money(cartPay())+'</strong></div><button type=\"button\" class=\"btn\" data-act=\"submitorder\">'+L('Заказать','Buyurtma berish')+'</button></div>';\n  else bar.innerHTML='<div class=\"wrap\"><div><small>'+L('Корзина','Savat')+': '+n+' '+L('шт.','dona')+'</small><strong>'+money(cartTotal()-cartDisc().amount)+'</strong></div><button type=\"button\" class=\"btn\" data-act=\"opencart\">'+L('Оформить заказ','Buyurtma berish')+'</button></div>';\n}\nfunction renderShop(){\n  if(S.shopPlaced)return renderShopPlaced();\n  if(!S.prod.items.length){\n    view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Каталог пока пуст','Katalog hozircha boʻsh')+'</b>'+L('Загляните позже.','Keyinroq qaytib keling.')+'</div></div>';\n    return;\n  }\n  if(S.shopStep==='cart'&&cartCount()>0)return renderCart();\n  S.shopStep='list';\n  const cats=shopCats();\n  const specials=shopSpecials();\n  if(S.shopCat!=='all'&&!cats.some(c=>c.id===S.shopCat)&&!specials.some(x=>x[0]===S.shopCat))S.shopCat='all';\n  const chips=cats.length>1||specials.length?'<div class=\"pchips\" role=\"group\" aria-label=\"'+esc(L('Категории','Kategoriyalar'))+'\">'\n    +[['all',L('Все','Barchasi')]].concat(specials,cats.length>1?cats.map(c=>[c.id,nm(c)]):[]).map(c=>'<button type=\"button\" class=\"chip\" data-act=\"scat\" data-id=\"'+esc(c[0])+'\" aria-pressed=\"'+(S.shopCat===c[0])+'\">'+esc(c[1])+'</button>').join('')+'</div>':'';\n  const search=S.prod.items.length>8?'<div class=\"search\"><input type=\"search\" id=\"q\" value=\"'+esc(S.q)+'\" placeholder=\"'+esc(L('Поиск по названию и описанию','Nomi va tavsifi boʻyicha qidirish'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Поиск по названию и описанию','Nomi va tavsifi boʻyicha qidirish'))+'\"></div>':'';\n  view.innerHTML='<div class=\"wrap shop\"><div class=\"eyebrow\">'+L('Каталог','Katalog')+'</div><h1>'+esc(S.cfg.shop.name||DEFAULT.shop.name)+'</h1>'+search+chips+'<div id=\"pgrid\"></div></div><div class=\"bar\" id=\"bar\"></div>';\n  paintGrid();paintShopBar();\n}\nfunction toggleFav(id){\n  if(!S.auth)return;\n  S.fav=isFav(id)?S.fav.filter(x=>x!==id):S.fav.concat([id]).slice(-100);\n  S.favSeq++;\n  document.querySelectorAll('.fav[data-id=\"'+CSS.escape(id)+'\"]').forEach(b=>b.setAttribute('aria-pressed',String(isFav(id))));\n  if(S.view==='shop'&&!S.shopPlaced&&S.shopStep==='list'){\n    const sp=shopSpecials();\n    if(S.shopCat==='fav'&&!sp.some(x=>x[0]==='fav')){S.shopCat='all';renderShop()}\n    else if(S.shopCat==='fav')paintGrid();\n    else{const had=!!document.querySelector('[data-act=\"scat\"][data-id=\"fav\"]');if(had!==sp.some(x=>x[0]==='fav'))renderShop()}\n  }\n  clearTimeout(S.favT);S.favT=setTimeout(pushFav,600);\n}\nasync function pushFav(){\n  const seq=S.favSeq,r=await api('PUT','/api/fav',{ids:S.fav});\n  if(!r.ok||!r.data){toast(L('Избранное не сохранилось. Проверьте соединение.','Sevimlilar saqlanmadi. Ulanishni tekshiring.'));return}\n  if(S.favSeq===seq&&JSON.stringify(r.data.fav)!==JSON.stringify(S.fav)){S.fav=r.data.fav;if(S.view==='shop')renderShop()}\n}\nfunction paintShopCtl(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.querySelector('#pc-'+CSS.escape(id)+' .pctl'),pe=document.querySelector('#pc-'+CSS.escape(id)+' .pprice');\n  if(p&&el)el.innerHTML=productCtl(p);\n  if(p&&pe)pe.innerHTML=priceHTML(p);\n  paintShopBar();renderNav();\n}\n/* под названием в корзине: вес и цена за штуку (со ступенью), подсказка про следующую ступень, сколько это упаковок */\nfunction cartInfoHTML(p,q){\n  const w=weightLabel(p),eff=unitPrice(p,q),nt=nextTier(p,q),pk=packText(p,q);\n  return '<small>'+(w?esc(w)+' · ':'')+(eff<Number(p.price)?'<span class=\"pold\">'+money(p.price)+'</span>':'')+money(eff)+'</small>'\n    +(nt?'<small class=\"tiernext\">'+esc(L('Ещё '+nt.left+' шт — цена '+money(nt.price)+' за шт','Yana '+nt.left+' dona — narx '+money(nt.price)))+'</small>':'')\n    +(pk?'<small class=\"packtxt\">'+esc(pk)+'</small>':'');\n}\nfunction paintCartLines(){\n  const el=$('#clines');if(!el)return;\n  el.innerHTML=cartLines().map(l=>{\n    const p=l.p;\n    return '<div class=\"cline\" id=\"cl-'+esc(p.id)+'\"><div class=\"cth\">'+pimg(p)+'</div><div class=\"cn\"><b>'+esc(nm(p))+'</b><div id=\"ci-'+esc(p.id)+'\">'+cartInfoHTML(p,l.qty)+'</div>'\n      +(p.lw&&typeof p.av==='number'?'<small class=\"lowtxt\">'+esc(lowTxt(p.av))+'</small>':'')+'</div>'\n      +'<div class=\"cr\">'+qtyHTML(p.id,l.qty,true)+'<div class=\"cs\">'+money(l.qty*unitPrice(p,l.qty))+'</div></div>'+packChips(p,'c')+'</div>';\n  }).join('');\n  paintCartSum();\n}\n/* Блок «Итого» в корзине: товары, доставка (если она платная), итог, подсказки про минимум и бесплатную доставку. */\nfunction paintCartSum(){\n  const el=$('#csum');if(!el)return;\n  const sub=cartTotal(),dc=cartDisc(),fee=cartFee(),sh=S.cfg.shop,del=mode()==='delivery',feeSet=Number(sh.deliveryFee)>0,free=Number(sh.freeDeliveryFrom)||0;\n  const showFee=del&&feeSet;\n  el.innerHTML=(showFee||dc.amount>0?'<div class=\"r\"><span>'+L('Товары','Mahsulotlar')+'</span><span id=\"csubrow\">'+money(sub)+'</span></div>':'')\n    +(dc.amount>0?'<div class=\"r disc\"><span>'+L('Скидка '+dc.pct+'%','Chegirma '+dc.pct+'%')+'</span><span id=\"cdiscrow\">−'+money(dc.amount)+'</span></div>':'')\n    +(showFee?'<div class=\"r\"><span>'+L('Доставка','Yetkazib berish')+'</span><span id=\"cfeerow\">'+(fee>0?money(fee):L('бесплатно','bepul'))+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('Итого','Jami')+'</span><span id=\"ctotalrow\">'+money(cartPay())+'</span></div>';\n  const m=$('#cmin');if(!m)return;\n  const min=minOrder(),notes=[];\n  if(min>0&&sub<min)notes.push('<div class=\"note warnnote\" role=\"status\">'+L('Минимальная сумма заказа: '+money(min)+'. Добавьте товаров ещё на '+money(min-sub)+'.','Buyurtmaning minimal summasi: '+money(min)+'. Yana '+money(min-sub)+' lik mahsulot qoʻshing.')+'</div>');\n  if(showFee&&fee>0&&free>sub)notes.push('<div class=\"note\" role=\"status\">'+L('До бесплатной доставки осталось '+money(free-sub)+'.','Bepul yetkazib berishgacha '+money(free-sub)+' qoldi.')+'</div>');\n  const nd=nextDiscount(S.cfg,sub);\n  if(nd)notes.push('<div class=\"note\" role=\"status\">'+L('Добавьте товаров ещё на '+money(nd.left)+': скидка на заказ будет '+nd.pct+'%.','Yana '+money(nd.left)+' lik mahsulot qoʻshing: buyurtmaga '+nd.pct+'% chegirma boʻladi.')+'</div>');\n  m.innerHTML=notes.length?'<div class=\"stack\" style=\"margin-top:12px\">'+notes.join('')+'</div>':'';\n  paintShopBar();\n}\n/* Меняет суммы на экране, не перерисовывая поле, в которое клиент печатает количество. */\nfunction refreshTotals(id){\n  const p=S.prod.items.find(x=>x.id===id),line=document.querySelector('#cl-'+CSS.escape(id)+' .cs'),info=document.getElementById('ci-'+id);\n  if(p&&line)line.textContent=money((S.cart[id]||0)*unitPrice(p,S.cart[id]||0));\n  if(p&&info)info.innerHTML=cartInfoHTML(p,S.cart[id]||0);\n  const cap=capOf(id);\n  document.querySelectorAll('[data-act=\"pplus\"],[data-act=\"cplus\"]').forEach(b=>{if(b.dataset.id===id)b.disabled=(S.cart[id]||0)>=cap});\n  paintCartSum();paintShopBar();renderNav();\n}\n/* Поля заказа: способ получения, имя, телефон, адрес (для доставки), дата, время, комментарий */\nfunction formHTML(pk){\n  const del=mode()==='delivery',canDel=S.cfg.shop.delivery!==false;\n  return '<div class=\"form\">'\n    +(canDel?'<div class=\"full\"><div class=\"seg\" role=\"group\" aria-label=\"'+esc(L('Способ получения','Olish usuli'))+'\"><button type=\"button\" data-act=\"mode\" data-v=\"pickup\" aria-pressed=\"'+(!del)+'\">'+L('Самовывоз','Olib ketish')+'</button><button type=\"button\" data-act=\"mode\" data-v=\"delivery\" aria-pressed=\"'+del+'\">'+L('Доставка','Yetkazib berish')+'</button></div></div>':'')\n    +'<div><label class=\"lab\" for=\"f-name\">'+L('Ваше имя или название компании','Ismingiz yoki kompaniya nomi')+'</label><input type=\"text\" id=\"f-name\" data-f=\"name\" value=\"'+esc(S.form.name)+'\" autocomplete=\"name\"><div class=\"err\" id=\"e-name\"></div></div>'\n    +'<div><label class=\"lab\" for=\"f-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"f-phone\" data-f=\"phone\" value=\"'+esc(S.form.phone)+'\" placeholder=\"+998 90 123 45 67\" autocomplete=\"tel\"><div class=\"err\" id=\"e-phone\"></div></div>'\n    +(del?'<div class=\"full\"><label class=\"lab\" for=\"f-address\">'+L('Адрес доставки','Yetkazib berish manzili')+'</label><textarea id=\"f-address\" data-f=\"address\" rows=\"2\" maxlength=\"200\" placeholder=\"'+esc(L('Город, улица, дом, ориентир','Shahar, koʻcha, uy, moʻljal'))+'\" autocomplete=\"street-address\">'+esc(S.form.address)+'</textarea><div class=\"err\" id=\"e-address\"></div>'+addrChips()+'</div>':'')\n    +'<div><label class=\"lab\" for=\"f-date\">'+(del?L('Дата доставки','Yetkazib berish sanasi'):L('Дата получения','Olish sanasi'))+'</label><input type=\"date\" id=\"f-date\" data-f=\"date\" min=\"'+pk.min+'\" max=\"'+pk.max+'\" value=\"'+esc(S.form.date)+'\"><div class=\"err\" id=\"e-date\"></div></div>'\n    +'<div><label class=\"lab\" for=\"f-time\">'+L('Время','Vaqt')+'</label><select id=\"f-time\" data-f=\"time\"></select><div class=\"err\" id=\"e-time\"></div></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"f-comment\">'+L('Пожелания к заказу','Buyurtmaga istaklar')+'</label><textarea id=\"f-comment\" data-f=\"comment\" placeholder=\"'+esc(L('Как позвонить, пожелания к упаковке','Qachon qoʻngʻiroq qilish, qadoqlash boʻyicha istaklar'))+'\">'+esc(S.form.comment)+'</textarea></div>'\n    +'</div>';\n}\n/* сохранённые адреса из профиля: нажал и адрес подставился */\nfunction addrChips(){\n  const a=S.profile&&S.profile.addrs;\n  if(!a||!a.length)return '';\n  return '<div class=\"achips\" id=\"achips\" role=\"group\" aria-label=\"'+esc(L('Сохранённые адреса','Saqlangan manzillar'))+'\">'+a.map((x,i)=>'<button type=\"button\" class=\"chip\" data-act=\"addr\" data-i=\"'+i+'\" aria-pressed=\"'+(S.form.address.trim().toLowerCase()===x.toLowerCase())+'\">'+esc(x)+'</button>').join('')+'</div>';\n}\nfunction markAddr(){\n  const cur=S.form.address.trim().toLowerCase();\n  document.querySelectorAll('#achips .chip').forEach(b=>{const x=S.profile&&S.profile.addrs[Number(b.dataset.i)];b.setAttribute('aria-pressed',String(!!x&&x.toLowerCase()===cur))});\n}\nfunction fillTimes(){\n  const sel=$('#f-time');if(!sel)return;\n  const list=S.form.date?pickup().slots(S.form.date):[];\n  if(!list.includes(S.form.time))S.form.time='';\n  sel.innerHTML='<option value=\"\">'+(list.length?L('Выберите время','Vaqtni tanlang'):L('На эту дату нет свободного времени','Bu sanaga boʻsh vaqt yoʻq'))+'</option>'+list.map(t=>'<option value=\"'+t+'\"'+(t===S.form.time?' selected':'')+'>'+t+'</option>').join('');\n}\nfunction cartNote(){\n  const sh=S.cfg.shop,addr=shopAddress(),hrs=esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00;';\n  if(mode()==='delivery')return L('Оплата только при получении товара. Доставка не раньше чем через '+esc(sh.deliveryLeadHours)+' ч после заказа, время доставки '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.',\n    'Toʻlov faqat mahsulotni olganda. Yetkazib berish buyurtmadan kamida '+esc(sh.deliveryLeadHours)+' soat keyin, vaqti '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.');\n  return L('Оплата только при получении'+(addr?' в точке: '+esc(addr):'')+'. Заказ можно забрать не раньше чем через '+esc(sh.leadHours)+' ч после оформления, часы выдачи '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.',\n    'Toʻlov faqat buyurtmani olganda'+(addr?': '+esc(addr):'')+'. Buyurtmani kamida '+esc(sh.leadHours)+' soatdan keyin olish mumkin, topshirish vaqti '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.');\n}\nfunction renderCart(){\n  normalizeMode();\n  const pk=pickup();\n  if(!S.form.date||S.form.date<pk.min)S.form.date=pk.min;\n  S.shopStep='cart';\n  view.innerHTML='<div class=\"wrap shop\"><button type=\"button\" class=\"btn ghost sm backlink\" data-act=\"shoplist\">← '+L('К каталогу','Katalogga')+'</button><h1>'+L('Корзина','Savat')+'</h1><div class=\"stack\">'\n    +'<div class=\"card\" id=\"clines\" style=\"margin-bottom:0\"></div>'\n    +'<div class=\"sum\" id=\"csum\"></div><div id=\"cmin\"></div>'\n    +'<section class=\"sec\" style=\"padding-top:6px\"><h2>'+L('Получение заказа','Buyurtmani olish')+'</h2><div class=\"stack\">'\n    +(S.blocked?'<div class=\"bannerbad\" role=\"alert\">'+esc(blockedTxt())+'</div>':'')\n    +formHTML(pk)\n    +'<div class=\"note\" id=\"cnote\">'+cartNote()+'</div>'\n    +'<button type=\"button\" class=\"btn\" id=\"submit\" data-act=\"submitorder\">'+L('Заказать','Buyurtma berish')+'</button>'\n    +'</div></section></div></div><div class=\"bar\" id=\"bar\"></div>';\n  paintCartLines();fillTimes();paintShopBar();\n}\nconst tgLink=o=>{\n  const h=String(S.cfg.shop.telegram||'').replace(/^@/,'').trim();\n  if(!h)return '';\n  return 'https://t.me/'+encodeURIComponent(h)+'?text='+encodeURIComponent(L('Здравствуйте! Вопрос по заказу ','Assalomu alaykum! Buyurtma boʻyicha savol: ')+o.id);\n};\nfunction itemRow(it){const pk=packText(it,it.qty);return '<span>'+esc(nm(it))+(weightLabel(it)?' ('+esc(weightLabel(it))+')':'')+' × '+it.qty+(pk?' ('+esc(pk)+')':'')+'</span><span>'+money(it.price*it.qty)+'</span>'}\nconst discRow=(o,cls)=>o.disc>0?'<div class=\"'+cls+'\"><span>'+L('Скидка '+o.dpct+'%','Chegirma '+o.dpct+'%')+'</span><span>−'+money(o.disc)+'</span></div>':'';\nfunction renderShopPlaced(){\n  const o=S.shopPlaced.order,tg=tgLink(o),del=o.mode==='delivery';\n  view.innerHTML='<div class=\"wrap page\"><div class=\"stack\" style=\"max-width:560px\"><div><div class=\"eyebrow\">'+L('Заказ отправлен','Buyurtma yuborildi')+'</div><h1>'+L('Номер ','Raqam ')+esc(o.id)+'</h1></div>'\n    +'<div class=\"note\">'+L('Продавец получил заказ и скоро подтвердит его. Мы напишем вам в этом чате, когда статус изменится. Оплата только при получении.','Sotuvchi buyurtmani oldi va tez orada tasdiqlaydi. Holat oʻzgarganda shu chatda yozamiz. Toʻlov faqat olganda.')+'</div>'\n    +'<div class=\"sum\"><div class=\"r\"><span>'+(del?L('Доставка','Yetkazib berish'):L('Самовывоз','Olib ketish'))+'</span><span>'+esc(fmtWhen(o.pickupAt))+'</span></div>'\n    +(del?'<div class=\"r\"><span>'+L('Адрес','Manzil')+'</span><span style=\"white-space:normal;text-align:right\">'+esc(o.address)+'</span></div>':'')\n    +(o.items||[]).map(it=>'<div class=\"r\">'+itemRow(it)+'</div>').join('')\n    +discRow(o,'r disc')\n    +(o.fee>0?'<div class=\"r\"><span>'+L('Стоимость доставки','Yetkazib berish narxi')+'</span><span>'+money(o.fee)+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('К оплате при получении','Olganda toʻlanadi')+'</span><span>'+money(o.total)+'</span></div></div>'\n    +'<div class=\"row-btns\">'+(tg?'<a class=\"btn ghost\" data-act=\"contact\" href=\"'+tg+'\" target=\"_blank\" rel=\"noopener\">'+L('Написать продавцу','Sotuvchiga yozish')+'</a>':'')\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"shopagain\">'+L('Ещё из каталога','Katalogdan yana')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"nav\" data-v=\"mine\">'+L('Мои заказы','Mening buyurtmalarim')+'</button></div></div></div>';\n}\nfunction validate(){\n  const e={},f=S.form;\n  if(!f.name.trim())e.name=L('Укажите имя','Ismingizni kiriting');\n  if(f.phone.replace(/\\D/g,'').length<9)e.phone=L('Укажите номер телефона','Telefon raqamini kiriting');\n  if(mode()==='delivery'&&f.address.trim().length<5)e.address=L('Укажите адрес доставки','Yetkazib berish manzilini kiriting');\n  if(!f.date)e.date=L('Выберите дату','Sanani tanlang');\n  if(f.date&&!f.time)e.time=L('Выберите время','Vaqtni tanlang');\n  return e;\n}\nconst FIELDS=['name','phone','address','date','time'];\nfunction orderErrText(er){\n  return {\n    too_many:L('У вас уже есть несколько неподтверждённых заказов. Дождитесь ответа продавца.','Sizda tasdiqlanmagan buyurtmalar bor. Sotuvchi javobini kuting.'),\n    pickup:L('Это время уже недоступно. Выберите другое.','Bu vaqt endi mavjud emas. Boshqasini tanlang.'),\n    auth:L('Сессия устарела. Закройте и снова откройте приложение в боте.','Seans eskirdi. Ilovani yopib, botdan qayta oching.'),\n    expired:L('Сессия устарела. Закройте и снова откройте приложение в боте.','Seans eskirdi. Ilovani yopib, botdan qayta oching.'),\n    busy:L('Сейчас много заказов. Попробуйте чуть позже.','Hozir buyurtmalar koʻp. Birozdan keyin urinib koʻring.'),\n    blocked:blockedTxt()\n  }[er]||L('Не удалось отправить заказ. Проверьте соединение и попробуйте ещё раз.','Buyurtmani yuborib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.');\n}\nasync function submitOrder(){\n  if(S.busy)return;\n  const lines=cartLines();\n  if(!lines.length){S.shopStep='list';renderShop();return}\n  const e=validate();\n  FIELDS.forEach(k=>{\n    const el=$('#e-'+k),inp=$('#f-'+k);\n    if(el)el.textContent=e[k]||'';\n    if(inp)inp.setAttribute('aria-invalid',e[k]?'true':'false');\n  });\n  const first=FIELDS.find(k=>e[k]);\n  if(first){const inp=$('#f-'+first);if(inp){inp.focus();try{inp.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}}return}\n  if(!S.auth){toast(L('Откройте приложение через бота в Telegram, чтобы оформить заказ','Buyurtma berish uchun ilovani Telegramdagi bot orqali oching'));return}\n  if(S.blocked){toast(blockedTxt());return}\n  if(minOrder()>0&&cartTotal()<minOrder()){\n    toast(L('Минимальная сумма заказа: '+money(minOrder()),'Buyurtmaning minimal summasi: '+money(minOrder())));\n    const m=$('#cmin');if(m)try{m.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}\n    return;\n  }\n  S.busy=true;\n  const btn=$('#submit');if(btn){btn.disabled=true;btn.textContent=L('Отправляем…','Yuborilmoqda…')}\n  const f=S.form,del=mode()==='delivery';\n  const r=await api('POST','/api/order',{\n    cart:lines.map(l=>({id:l.p.id,qty:l.qty})),\n    form:{name:f.name.trim(),phone:f.phone.trim(),mode:mode(),address:del?f.address.trim():'',date:f.date,time:f.time,comment:f.comment.trim()},\n    lang:LANG,expectTotal:cartPay()\n  });\n  S.busy=false;\n  if(!r.ok){\n    const er=r.data&&r.data.error;\n    if(r.data&&r.data.cfg){S.cfg=mergeCfg(r.data.cfg);normalizeMode()}\n    if(r.data&&r.data.prod)S.prod=normProd(r.data.prod);\n    if(er==='stock'){\n      /* товара меньше, чем в корзине: показываем, сколько осталось, и уменьшаем корзину */\n      const short=Array.isArray(r.data.short)?r.data.short:[];\n      const what=short.slice(0,3).map(s=>{\n        const p=S.prod.items.find(x=>x.id===s.id),n=Number(s.avail)||0;\n        return (p?nm(p):'')+': '+(n>0?L('осталось '+n,'faqat '+n+' ta qoldi'):L('нет в наличии','mavjud emas'));\n      }).join('; ')+(short.length>3?'…':'');\n      short.forEach(s=>{\n        const n=Number(s.avail)||0;\n        if(n<=0)delete S.cart[s.id];else if((S.cart[s.id]||0)>n)S.cart[s.id]=n;\n      });\n      saveCart();pruneCart();\n      S.shopStep=cartCount()?'cart':'list';\n      renderNav();renderShop();\n      toast(L('Столько товара нет на складе. '+what+'. Мы обновили корзину.','Omborda buncha mahsulot yoʻq. '+what+'. Savatni yangiladik.'));\n      return;\n    }\n    if(er==='min_order'){\n      renderShop();\n      toast(L('Минимальная сумма заказа: '+money(Number(r.data.min)||minOrder()),'Buyurtmaning minimal summasi: '+money(Number(r.data.min)||minOrder())));\n      return;\n    }\n    if(er==='price_changed'||er==='unavailable'||er==='no_delivery'){\n      pruneCart();\n      S.shopStep=cartCount()?'cart':'list';\n      renderNav();renderShop();\n      toast(er==='price_changed'?L('Продавец обновил цены. Проверьте сумму и оформите заказ ещё раз.','Sotuvchi narxlarni yangiladi. Summani tekshirib, qaytadan buyurtma bering.')\n        :er==='no_delivery'?L('Доставка сейчас недоступна. Выберите самовывоз.','Hozir yetkazib berish mavjud emas. Olib ketishni tanlang.')\n        :L('Что-то из корзины закончилось, мы обновили её. Проверьте заказ и оформите ещё раз.','Savatdagi baʼzi narsalar tugadi, savatni yangiladik. Buyurtmani tekshirib, qaytadan bering.'));\n      return;\n    }\n    if(er==='blocked')S.blocked=true;\n    renderShop();toast(orderErrText(er));\n    return;\n  }\n  const order=r.data.order;\n  S.cart={};saveCart();\n  S.shopPlaced={order};S.shopStep='list';\n  S.myOrders=[order].concat(S.myOrders.filter(o=>o.id!==order.id));\n  S.form.comment='';\n  if(!S.profile)S.profile={name:order.name,phone:order.phone,org:'',addrs:order.mode==='delivery'&&order.address?[order.address]:[]};\n  else{\n    if(!S.profile.name)S.profile.name=order.name;\n    if(!S.profile.phone)S.profile.phone=order.phone;\n    if(order.mode==='delivery'&&order.address&&S.profile.addrs.length<5&&!S.profile.addrs.some(a=>a.toLowerCase()===order.address.toLowerCase()))S.profile.addrs=S.profile.addrs.concat([order.address]);\n  }\n  try{S.tg&&S.tg.HapticFeedback&&S.tg.HapticFeedback.notificationOccurred('success')}catch(x){}\n  renderNav();renderShop();\n  window.scrollTo(0,0);\n}\n\n/* ---------- orders ---------- */\nconst pill=o=>{const t=stOf(o.status,o.mode);return '<span class=\"st '+t.c+'\">'+esc(nm(t))+'</span>'};\nfunction sellerActs(o){\n  const a=(to,label)=>'<button type=\"button\" class=\"btn sm\" data-act=\"status\" data-id=\"'+esc(o.id)+'\" data-to=\"'+to+'\">'+label+'</button>';\n  const del=o.mode==='delivery';\n  const pk='<button type=\"button\" class=\"btn ghost sm\" data-act=\"pick1\" data-id=\"'+esc(o.id)+'\">'+L('Сборочный лист','Yigʻish roʻyxati')+'</button>';\n  if(o.status==='new')return a('accepted',L('Принять в работу','Ishga qabul qilish'))+cancelBtn(o)+pk;\n  if(o.status==='accepted')return a('ready',del?L('Готов к отправке','Joʻnatishga tayyor'):L('Готов к выдаче','Topshirishga tayyor'))+cancelBtn(o)+pk;\n  if(o.status==='ready')return a('done',del?L('Доставлен клиенту','Mijozga yetkazildi'):L('Выдан клиенту','Mijozga topshirildi'))+cancelBtn(o)+pk;\n  return o.status==='done'?pk:'';\n}\nfunction cancelBtn(o){\n  const sure=S.cc===o.id;\n  return '<button type=\"button\" class=\"btn ghost sm\" data-act=\"scancel\" data-id=\"'+esc(o.id)+'\">'+(sure?L('Точно отменить?','Aniq bekor qilinsinmi?'):L('Отменить','Bekor qilish'))+'</button>';\n}\nfunction orderCard(o,m){\n  const rep=m==='mine'?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"repeat\" data-id=\"'+esc(o.id)+'\">'+L('Повторить заказ','Buyurtmani takrorlash')+'</button>':'';\n  const acts=m==='seller'?sellerActs(o):rep+(o.status==='new'?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"mycancel\" data-id=\"'+esc(o.id)+'\">'+(S.cc===o.id?L('Точно отменить?','Aniq bekor qilinsinmi?'):L('Отменить заказ','Buyurtmani bekor qilish'))+'</button>':'');\n  const first=(o.items||[]).map(i=>S.prod.items.find(p=>p.id===i.id)).find(p=>p&&p.pv);\n  const del=o.mode==='delivery';\n  return '<article class=\"ord'+(m==='seller'&&o.status==='new'?' is-new':'')+'\"><div class=\"th\">'+(first?'<img src=\"'+imgUrl(first)+'\" alt=\"\" loading=\"lazy\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>')+'</div><div class=\"ob\">'\n    +'<div class=\"oh\"><span class=\"oid\">'+esc(o.id)+'</span>'+pill(o)+'</div>'\n    +'<div class=\"when\">'+esc(fmtWhen(o.pickupAt))+'</div>'\n    +'<div class=\"spec\">'+(del?L('Доставка: ','Yetkazib berish: ')+esc(o.address||''):L('Самовывоз','Olib ketish'))+'</div>'\n    +(o.items||[]).map(it=>'<div class=\"pl\">'+itemRow(it)+'</div>').join('')\n    +discRow(o,'pl')\n    +(o.fee>0?'<div class=\"pl\"><span>'+L('Стоимость доставки','Yetkazib berish narxi')+'</span><span>'+money(o.fee)+'</span></div>':'')\n    +(m==='seller'?'<div class=\"cust\"><b>'+esc(o.name)+'</b>'+(o.org?' <span>'+esc(o.org)+'</span>':'')+' <span>'+esc(o.phone)+'</span>'+(o.tg&&o.tg.username?' <span>@'+esc(o.tg.username)+'</span>':'')+' <button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(o.phone)+'\">'+L('Копировать','Nusxalash')+'</button></div>':'')\n    +(o.comment?'<div class=\"cm\">'+esc(o.comment)+'</div>':'')\n    +'<div class=\"tot\"><b>'+money(o.total)+'</b><span>'+L('оплата при получении','olganda toʻlanadi')+'</span></div>'\n    +(acts?'<div class=\"acts\">'+acts+'</div>':'')\n    +'</div></article>';\n}\nfunction renderMine(){\n  let h='<div class=\"wrap page\"><h1>'+L('Мои заказы','Mening buyurtmalarim')+'</h1>';\n  if(!S.ready)h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!S.auth)h+='<div class=\"empty\"><b>'+L('Откройте через бота','Bot orqali oching')+'</b>'+L('Чтобы видеть свои заказы, откройте приложение из бота в Telegram.','Buyurtmalaringizni koʻrish uchun ilovani Telegramdagi botdan oching.')+'</div>';\n  else if(!S.myOrders.length)h+='<div class=\"empty\"><b>'+L('Пока нет заказов','Hozircha buyurtma yoʻq')+'</b>'+L('Выберите товары в каталоге, и заказ появится здесь со статусом.','Katalogdan mahsulot tanlang, buyurtma shu yerda holati bilan koʻrinadi.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"nav\" data-v=\"shop\">'+L('Открыть каталог','Katalogni ochish')+'</button></div>';\n  else{\n    const list=S.myOrders.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));\n    h+='<p class=\"lead\">'+L('Статус обновляется, когда продавец принимает и собирает заказ.','Sotuvchi buyurtmani qabul qilib yigʻganda holat yangilanadi.')+'</p><div class=\"ordlist\">'+list.map(o=>orderCard(o,'mine')).join('')+'</div>';\n  }\n  view.innerHTML=h+'</div>';\n}\n\n/* ---------- профиль клиента ---------- */\nfunction renderProfile(){\n  let h='<div class=\"wrap page\"><h1>'+L('Мой профиль','Mening profilim')+'</h1>';\n  if(!S.ready)h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!S.auth)h+='<div class=\"empty\"><b>'+L('Откройте через бота','Bot orqali oching')+'</b>'+L('Профиль доступен, если открыть приложение из бота в Telegram.','Profil ilovani Telegramdagi botdan ochganda mavjud.')+'</div>';\n  else{\n    const p=S.profile||{name:'',phone:'',org:'',addrs:[]};\n    h+='<p class=\"lead\">'+L('Эти данные подставляются в заказ, на любом вашем устройстве. При оформлении заказа их можно изменить.','Bu maʼlumotlar istalgan qurilmangizda buyurtmaga avtomatik qoʻyiladi. Buyurtma berayotganda oʻzgartirish mumkin.')+'</p>'\n      +(S.blocked?'<div class=\"bannerbad\" role=\"alert\" style=\"margin-bottom:12px\">'+esc(blockedTxt())+'</div>':'')\n      +'<div class=\"card\"><div class=\"form\">'\n      +'<div><label class=\"lab\" for=\"p-name\">'+L('Ваше имя','Ismingiz')+'</label><input type=\"text\" id=\"p-name\" data-pf=\"name\" maxlength=\"60\" value=\"'+esc(p.name)+'\" autocomplete=\"name\"><div class=\"err\" id=\"pe-name\"></div></div>'\n      +'<div><label class=\"lab\" for=\"p-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"p-phone\" data-pf=\"phone\" maxlength=\"25\" value=\"'+esc(p.phone)+'\" placeholder=\"+998 90 123 45 67\" autocomplete=\"tel\"><div class=\"err\" id=\"pe-phone\"></div></div>'\n      +'<div class=\"full\"><label class=\"lab\" for=\"p-org\">'+L('Организация (магазин, кафе, компания)','Tashkilot (doʻkon, kafe, kompaniya)')+'</label><input type=\"text\" id=\"p-org\" data-pf=\"org\" maxlength=\"80\" value=\"'+esc(p.org)+'\" autocomplete=\"organization\"><div class=\"err\" id=\"pe-org\"></div></div>'\n      +'<div class=\"full\"><label class=\"lab\" for=\"p-addrs\">'+L('Адреса доставки: каждый с новой строки, до 5','Yetkazib berish manzillari: har biri yangi qatordan, 5 tagacha')+'</label><textarea id=\"p-addrs\" data-pf=\"addrs\" rows=\"4\" placeholder=\"'+esc(L('Город, улица, дом, ориентир','Shahar, koʻcha, uy, moʻljal'))+'\">'+esc((p.addrs||[]).join('\\n'))+'</textarea><div class=\"err\" id=\"pe-addrs\"></div></div>'\n      +'</div><div class=\"row-btns\" style=\"margin-top:14px\"><button type=\"button\" class=\"btn\" id=\"pfsave\" data-act=\"pfsave\">'+L('Сохранить','Saqlash')+'</button></div></div>';\n  }\n  view.innerHTML=h+'</div>';\n}\n/* общая проверка полей клиента на телефоне; возвращает {v} или {e:{поле:текст}} */\nfunction checkClientFields(get){\n  const e={},v={name:get('name').trim(),phone:get('phone').trim(),org:get('org').trim()};\n  if(v.phone&&(v.phone.replace(/\\D/g,'').length<9||v.phone.replace(/\\D/g,'').length>15))e.phone=L('Проверьте номер телефона','Telefon raqamini tekshiring');\n  const lines=get('addrs').split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean),addrs=[];\n  lines.forEach(x=>{if(!addrs.some(y=>y.toLowerCase()===x.toLowerCase()))addrs.push(x)});\n  if(addrs.some(x=>x.length<5))e.addrs=L('Адрес слишком короткий','Manzil juda qisqa');\n  else if(addrs.length>5)e.addrs=L('Можно сохранить не больше 5 адресов','5 tadan ortiq manzil saqlab boʻlmaydi');\n  v.addrs=addrs;\n  return Object.keys(e).length?{e}:{v};\n}\nconst clientErrText=er=>({\n  bad_phone:L('Проверьте номер телефона','Telefon raqamini tekshiring'),\n  bad_addr:L('Адрес слишком короткий','Manzil juda qisqa'),\n  too_many_addrs:L('Можно сохранить не больше 5 адресов','5 tadan ortiq manzil saqlab boʻlmaydi'),\n  busy:L('Сейчас сохранить нельзя. Попробуйте позже.','Hozir saqlab boʻlmaydi. Keyinroq urinib koʻring.')\n}[er]||L('Не удалось сохранить. Проверьте соединение.','Saqlab boʻlmadi. Ulanishni tekshiring.'));\nasync function saveProfile(){\n  if(S.pfBusy||!S.auth)return;\n  const get=k=>{const el=document.getElementById('p-'+k);return el?String(el.value):''};\n  const c=checkClientFields(get);\n  ['name','phone','org','addrs'].forEach(k=>{const er=document.getElementById('pe-'+k),inp=document.getElementById('p-'+k);if(er)er.textContent=(c.e&&c.e[k])||'';if(inp)inp.setAttribute('aria-invalid',c.e&&c.e[k]?'true':'false')});\n  if(c.e){const k=Object.keys(c.e)[0],inp=document.getElementById('p-'+k);if(inp)inp.focus();return}\n  S.pfBusy=true;\n  const btn=$('#pfsave');if(btn)btn.disabled=true;\n  const r=await api('PUT','/api/profile',c.v);\n  S.pfBusy=false;\n  if(btn)btn.disabled=false;\n  if(!r.ok||!r.data||!r.data.profile){toast(clientErrText(r.data&&r.data.error));return}\n  S.profile=r.data.profile;\n  /* данные профиля подставляем в форму заказа сразу; адрес — только если поле пустое или адреса больше нет в профиле */\n  S.form.name=S.profile.name||S.form.name;S.form.phone=S.profile.phone||S.form.phone;\n  if(!S.form.address||!S.profile.addrs.some(a=>a.toLowerCase()===S.form.address.toLowerCase()))S.form.address=S.profile.addrs[0]||S.form.address;\n  saveForm();\n  toast(L('Профиль сохранён','Profil saqlandi'));\n  if(S.view==='profile')renderProfile();\n}\n\n/* ---------- seller ---------- */\nfunction renderSeller(){\n  if(!S.admin){view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Раздел для продавца','Sotuvchi boʻlimi')+'</b>'+L('Откройте приложение с правами редактора.','Ilovani muharrir huquqi bilan oching.')+'</div></div>';return}\n  view.innerHTML='<div class=\"wrap page\"><h1>'+L('Панель продавца','Sotuvchi paneli')+'</h1><div class=\"tabs\" role=\"tablist\" id=\"stabs\"></div><div id=\"sbody\"></div></div>';\n  paintTabs();\n  paintSeller();\n}\n/* сколько товаров заканчивается или закончилось (число на вкладке «Остатки») */\nconst stockWarn=()=>S.prod.items.filter(p=>{const s=stState(p);return s==='low'||s==='out'}).length;\nfunction paintTabs(){\n  const el=$('#stabs');if(!el)return;\n  const w=stockWarn();\n  const tabs=[['orders',L('Заказы','Buyurtmalar')],['prod',L('Каталог','Katalog')],['stock',L('Остатки','Qoldiq')+(w?' <span class=\"badge warn\">'+w+'</span>':'')],['clients',L('Клиенты','Mijozlar')],['reports',L('Отчёты','Hisobotlar')],['settings',L('Настройки','Sozlamalar')]];\n  el.innerHTML=tabs.map(t=>'<button type=\"button\" class=\"tab\" role=\"tab\" data-act=\"stab\" data-t=\"'+t[0]+'\" aria-selected=\"'+(S.sellerTab===t[0])+'\">'+t[1]+'</button>').join('');\n}\nfunction paintSeller(){\n  const b=$('#sbody');if(!b)return;\n  if(S.sellerTab==='orders')b.innerHTML=ordersHTML();\n  else if(S.sellerTab==='prod')b.innerHTML=prodHTML();\n  else if(S.sellerTab==='stock')b.innerHTML=stockHTML();\n  else if(S.sellerTab==='clients')b.innerHTML=clientsHTML();\n  else if(S.sellerTab==='reports')b.innerHTML=repHTML();\n  else b.innerHTML=settingsHTML();\n  paintSave();\n}\nfunction ordersHTML(){\n  const all=S.allOrders,today=ymd(shopNow());\n  const act=o=>o.status==='new'||o.status==='accepted'||o.status==='ready';\n  const nNew=all.filter(o=>o.status==='new').length;\n  const nWork=all.filter(o=>o.status==='accepted').length;\n  const nToday=all.filter(o=>act(o)&&String(o.pickupAt).slice(0,10)===today).length;\n  const sum=Number(S.stats.doneSum)||0;\n  let h='<div class=\"stats\"><div class=\"stat'+(nNew?' hot':'')+'\"><small>'+L('Новые','Yangi')+'</small><b>'+nNew+'</b></div><div class=\"stat\"><small>'+L('В работе','Ishlanmoqda')+'</small><b>'+nWork+'</b></div><div class=\"stat\"><small>'+L('На сегодня','Bugunga')+'</small><b>'+nToday+'</b></div><div class=\"stat\"><small>'+L('Завершено на сумму','Yakunlangan summa')+'</small><b>'+money(sum)+'</b></div></div>';\n  const fl=[['active',L('Активные','Faol')],['done',L('Завершены','Yakunlangan')],['cancelled',L('Отменены','Bekor qilingan')],['all',L('Все','Hammasi')]];\n  h+='<div class=\"filters\">'+fl.map(f=>'<button type=\"button\" class=\"chip\" data-act=\"filter\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(S.filter===f[0])+'\">'+f[1]+'</button>').join('')+'</div>';\n  h+=xtoolsHTML();\n  let list=all.filter(o=>S.filter==='all'?true:S.filter==='active'?act(o):o.status===S.filter);\n  if(S.filter==='active')list.sort((a,b)=>String(a.pickupAt).localeCompare(String(b.pickupAt)));\n  else list.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));\n  if(!list.length)h+='<div class=\"empty\"><b>'+(all.length?L('В этом списке пусто','Bu roʻyxat boʻsh'):L('Заказов пока нет','Hozircha buyurtma yoʻq'))+'</b>'+(all.length?L('Выберите другой фильтр.','Boshqa filtrni tanlang.'):L('Когда клиент оформит заказ, он появится здесь с составом, адресом и телефоном.','Mijoz buyurtma berganda, u shu yerda tarkibi, manzili va telefoni bilan paydo boʻladi.'))+'</div>';\n  else h+='<div class=\"ordlist\">'+list.map(o=>orderCard(o,'seller')).join('')+'</div>';\n  return h;\n}\n/* ---------- сборочный лист и выгрузки ---------- */\nconst XLAB={orders:['Заказы в Excel','Buyurtmalar Excelda'],clients:['Клиенты в Excel','Mijozlar Excelda'],backup:['Получить резервную копию','Zaxira nusxasini olish'],pick:['Файлом в чат','Chatga fayl sifatida'],catalog:['Каталог в Excel','Katalog Excelda'],report:['Отчёт в Excel','Hisobot Excelda']};\nconst xlab=k=>S.xbusy===k?L('Отправляем…','Yuborilmoqda…'):L(XLAB[k][0],XLAB[k][1]);\nconst xbtn=(k,cls)=>'<button type=\"button\" class=\"btn ghost sm'+(cls?' '+cls:'')+'\" data-act=\"'+(k==='pick'?'xpick':'xport')+'\" data-k=\"'+k+'\" data-xk=\"'+k+'\"'+(S.xbusy?' disabled':'')+'>'+xlab(k)+'</button>';\nfunction xtoolsHTML(){\n  const work=S.allOrders.filter(o=>o.status==='new'||o.status==='accepted');\n  const d=shopNow(),today=ymd(d);d.setDate(d.getDate()+1);\n  const tom=ymd(d);\n  const chip=(lab,day)=>{const n=day?work.filter(o=>String(o.pickupAt).slice(0,10)===day).length:work.length;return '<button type=\"button\" class=\"chip\" data-act=\"pick\" data-day=\"'+day+'\"'+(n&&!S.pickBusy?'':' disabled')+'>'+lab+' · '+n+'</button>'};\n  return '<div class=\"xtools\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmenu\" aria-expanded=\"'+(S.pm?'true':'false')+'\">'+L('Сборочный лист','Yigʻish roʻyxati')+(S.pm?' ▴':' ▾')+'</button>'+xbtn('orders')\n    +(S.pm?'<div class=\"xmenu\">'+chip(L('Все','Hammasi'),'')+chip(L('Сегодня','Bugun'),today)+chip(L('Завтра','Ertaga'),tom)+'</div><div class=\"unit\">'+L('Что достать со склада: общий список и страница на каждый заказ. Берутся новые заказы и заказы в работе. Один заказ можно открыть кнопкой в его карточке.','Ombordan nimalarni olish kerak: umumiy roʻyxat va har bir buyurtma uchun alohida sahifa. Yangi va ishdagi buyurtmalar olinadi. Bitta buyurtmani uning kartochkasidagi tugma bilan ochish mumkin.')+'</div>':'')\n    +'</div>';\n}\nfunction paintX(){\n  document.querySelectorAll('[data-xk]').forEach(b=>{b.disabled=!!S.xbusy;b.textContent=xlab(b.dataset.xk)});\n}\nconst xErrText=er=>({\n  empty:L('Нет заказов для сборки','Yigʻish uchun buyurtma yoʻq'),\n  busy:L('Файл уже готовится. Подождите несколько секунд.','Fayl tayyorlanmoqda. Bir necha soniya kuting.'),\n  send_failed:L('Telegram не принял файл. Откройте чат с ботом, нажмите «Старт» и повторите.','Telegram faylni qabul qilmadi. Bot chatini oching, «Start» tugmasini bosing va qayta urining.')\n}[er]||L('Не удалось подготовить файл. Проверьте соединение и повторите.','Faylni tayyorlab boʻlmadi. Ulanishni tekshiring va qayta urining.'));\n/* Файл уходит в чат продавца с ботом: в Telegram он открывается и сохраняется на любом устройстве. */\nasync function doExport(kind,extra){\n  if(S.xbusy||!S.admin)return;\n  S.xbusy=kind;paintX();\n  const r=await api('POST','/api/admin/export',Object.assign({kind},extra||{}));\n  S.xbusy='';paintX();\n  if(r.ok&&r.data&&r.data.ok){toast(L('Файл отправлен вам в чат с ботом. Закройте приложение, чтобы его увидеть.','Fayl botdagi chatingizga yuborildi. Koʻrish uchun ilovani yoping.'));return}\n  toast(xErrText(r.data&&r.data.error));\n}\nasync function openPick(body){\n  if(S.pickBusy||!S.admin)return;\n  S.pickBusy=true;\n  const r=await api('POST','/api/admin/pick',body);\n  S.pickBusy=false;\n  if(!r.ok||!r.data||!r.data.html){toast(xErrText(r.data&&r.data.error));return}\n  S.pick={body,n:r.data.n};\n  let ov=document.getElementById('pov');\n  if(!ov){ov=document.createElement('div');ov.id='pov';ov.className='pov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');document.body.appendChild(ov)}\n  ov.setAttribute('aria-label',L('Сборочный лист','Yigʻish roʻyxati')+', '+r.data.n);\n  const canPrint=!(S.tg&&/^(android|ios)$/.test(S.tg.platform||''));\n  ov.innerHTML='<div class=\"pbar\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pclose\">← '+L('Назад','Orqaga')+'</button><span class=\"grow\"></span>'\n    +(canPrint?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"pprint\">'+L('Печать','Chop etish')+'</button>':'')+xbtn('pick')+'</div>'\n    +'<iframe class=\"pframe\" id=\"pframe\" title=\"'+esc(L('Сборочный лист','Yigʻish roʻyxati'))+'\" sandbox=\"allow-same-origin allow-modals\"></iframe>';\n  $('#pframe').srcdoc=r.data.html;\n  ov.hidden=false;\n  const cb=ov.querySelector('[data-act=\"pclose\"]');if(cb)cb.focus();\n}\nfunction closePick(){\n  const ov=document.getElementById('pov');\n  if(ov){ov.hidden=true;ov.innerHTML=''}\n  S.pick=null;\n}\nfunction printPick(){\n  const f=$('#pframe');\n  try{f.contentWindow.focus();f.contentWindow.print()}\n  catch(e){toast(L('Печать здесь недоступна. Нажмите «Файлом в чат» и распечатайте файл из браузера.','Bu yerda chop etib boʻlmaydi. «Chatga fayl sifatida» tugmasini bosib, faylni brauzerdan chop eting.'))}\n}\ndocument.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.pick)closePick()});\n\nfunction photoBlock(p){\n  const id=esc(p.id),busy=!!S.upl[p.id];\n  return '<div class=\"pthumb\">'+pimg(p)+'</div><div class=\"pbtns\">'\n    +'<label class=\"btn ghost sm'+(busy?' dis':'')+'\" for=\"ph-'+id+'\">'+(busy?L('Загрузка…','Yuklanmoqda…'):(p.pv?L('Заменить фото','Rasmni almashtirish'):L('Загрузить фото','Rasm yuklash')))+'</label>'\n    +'<input type=\"file\" class=\"sr\" id=\"ph-'+id+'\" accept=\"image/*\" data-photo=\"'+id+'\"'+(busy?' disabled':'')+'>'\n    +(p.pv&&!busy?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"phdel\" data-id=\"'+id+'\">'+L('Убрать фото','Rasmni olib tashlash')+'</button>':'')\n    +'</div>';\n}\nfunction paintPhoto(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.getElementById('pph-'+id);\n  if(p&&el)el.innerHTML=photoBlock(p);\n}\n/* ступени цены в редакторе: три строки «от N шт — цена»; в товар попадают только верные (общая cleanTiers) */\nfunction tiersEditHTML(p){\n  const id=esc(p.id),t=tiersOf(p);\n  const rows=[0,1,2].map(i=>{\n    const x=t[i]||{};\n    return '<div class=\"trow\"><span>'+L('от','dan')+'</span><input type=\"number\" id=\"ptn-'+id+'-'+i+'\" data-pid=\"'+id+'\" data-pp=\"tn\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"2\" max=\"500\" step=\"1\" value=\"'+(x.n||'')+'\" placeholder=\"'+(i===0?'10':'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': от скольких штук','Pogʻona '+(i+1)+': necha donadan'))+'\">'\n      +'<span>'+L('шт — цена','dona — narx')+'</span><input type=\"number\" id=\"ptp-'+id+'-'+i+'\" data-pid=\"'+id+'\" data-pp=\"tp\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"1\" step=\"100\" value=\"'+(x.price||'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': цена за штуку, сум','Pogʻona '+(i+1)+': bir dona narxi, soʻm'))+'\"><span>'+L('сум','soʻm')+'</span></div>';\n  }).join('');\n  return '<div class=\"full\"><span class=\"lab\">'+L('Цена от количества (оптовые ступени)','Miqdorga qarab narx (ulgurji pogʻonalar)')+'</span><div class=\"tiers\">'+rows+'</div><div class=\"err\" id=\"ptw-'+id+'\" role=\"status\"></div>'\n    +'<div class=\"unit\" style=\"margin:2px 0 0\">'+L('Пример: от 10 шт — 7 000 сум. Когда клиент берёт столько штук этого товара, цена действует на все штуки. Цена ступени должна быть ниже обычной, а следующая — ещё ниже. Пустые строки не нужны.','Misol: 10 dona — 7 000 soʻm. Mijoz shuncha dona olsa, narx barcha donalarga qoʻllanadi. Pogʻona narxi odatdagidan, keyingisi esa undan ham past boʻlishi kerak. Boʻsh qatorlar kerak emas.')+'</div></div>';\n}\nfunction syncTiers(p){\n  const rows=[];\n  for(let i=0;i<3;i++){\n    const a=document.getElementById('ptn-'+p.id+'-'+i),b=document.getElementById('ptp-'+p.id+'-'+i);\n    const n=a?String(a.value).trim():'',pr=b?String(b.value).trim():'';\n    if(n!==''&&pr!=='')rows.push({n:Number(n),price:Number(pr)});\n  }\n  p.tiers=cleanTiers(rows,p.price);\n  const w=document.getElementById('ptw-'+p.id);\n  if(w)w.textContent=p.tiers.length<rows.length?L('Одна из строк не учтена: цена ступени должна быть ниже обычной и ниже предыдущей, а количество — больше предыдущего (от 2 до 500).','Qatorlardan biri hisobga olinmadi: pogʻona narxi odatdagidan va oldingisidan past, miqdor esa oldingisidan katta boʻlishi kerak (2 dan 500 gacha).'):'';\n}\nfunction prodRow(p){\n  const id=esc(p.id);\n  const fld=(k,lab,inner,cls)=>'<div'+(cls?' class=\"'+cls+'\"':'')+'><label class=\"lab\" for=\"p'+k+'-'+id+'\">'+lab+'</label>'+inner+'</div>';\n  const inp=(k,type,val,extra)=>'<input type=\"'+type+'\" id=\"p'+k+'-'+id+'\" data-pid=\"'+id+'\" data-pp=\"'+k+'\" value=\"'+esc(val)+'\"'+(extra||'')+'>';\n  const ta=(k,val)=>'<textarea id=\"p'+k+'-'+id+'\" data-pid=\"'+id+'\" data-pp=\"'+k+'\" maxlength=\"300\" rows=\"2\">'+esc(val)+'</textarea>';\n  return '<div class=\"prow'+(p.on===false?' off':'')+'\" id=\"prow-'+id+'\"><div class=\"pph\" id=\"pph-'+id+'\">'+photoBlock(p)+'</div><div class=\"pf\">'\n    +fld('name',L('Название','Nomi'),inp('name','text',p.name,' maxlength=\"60\"'),'full')\n    +fld('uz',L('Название по-узбекски','Oʻzbekcha nomi'),inp('uz','text',p.uz||'',' maxlength=\"60\"'),'full')\n    +fld('desc',L('Описание','Tavsif'),ta('desc',p.desc||''),'full')\n    +fld('descUz',L('Описание по-узбекски','Oʻzbekcha tavsif'),ta('descUz',p.descUz||''),'full')\n    +fld('cat',L('Категория','Kategoriya'),'<select id=\"pcat-'+id+'\" data-pid=\"'+id+'\" data-pp=\"cat\">'+S.prod.cats.map(c=>'<option value=\"'+esc(c.id)+'\"'+(p.cat===c.id?' selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select>','full')\n    +fld('amount',L('Вес или объём единицы','Birlik ogʻirligi yoki hajmi'),inp('amount','number',p.amount||0,' inputmode=\"decimal\" step=\"any\" min=\"0\"'))\n    +fld('unit',L('Единица','Birlik'),'<select id=\"punit-'+id+'\" data-pid=\"'+id+'\" data-pp=\"unit\">'+UNIT_IDS.map(u=>'<option value=\"'+u+'\"'+(p.unit===u?' selected':'')+'>'+esc(unitName(u))+'</option>').join('')+'</select>')\n    +fld('price',L('Цена за единицу, сум','Birlik narxi, soʻm'),inp('price','number',p.price||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +fld('tag',L('Метка','Belgi'),'<select id=\"ptag-'+id+'\" data-pid=\"'+id+'\" data-pp=\"tag\"><option value=\"\"'+(!p.tag?' selected':'')+'>'+L('Без метки','Belgisiz')+'</option><option value=\"sale\"'+(p.tag==='sale'?' selected':'')+'>'+tagName('sale')+'</option><option value=\"new\"'+(p.tag==='new'?' selected':'')+'>'+tagName('new')+'</option></select>')\n    +fld('old',L('Старая цена для акции, сум','Aksiya uchun eski narx, soʻm'),inp('old','number',p.old||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +'<div class=\"avail\"><label class=\"chk\"><input type=\"checkbox\" data-pid=\"'+id+'\" data-pp=\"on\"'+(p.on!==false?' checked':'')+'> '+L('В наличии','Mavjud')+'</label></div>'\n    +tiersEditHTML(p)\n    +fld('blk',L('Штук в блоке (0 — нет блока)','Blokda necha dona (0 — blok yoʻq)'),inp('blk','number',p.blk||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +fld('box',L('Штук в коробке (0 — нет коробки)','Qutida necha dona (0 — quti yoʻq)'),inp('box','number',p.box||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +'<div class=\"full unit\" style=\"margin:0\">'+L('Блок и коробка — для удобства: цена и остаток всегда считаются в штуках. Если указать, у клиента появятся кнопки «+ блок» и «+ коробка», а в заказах будет видно, сколько это коробок. Допустимо от 2 до 500 штук.','Blok va quti — qulaylik uchun: narx va qoldiq doim donada hisoblanadi. Koʻrsatilsa, mijozda «+ blok» va «+ quti» tugmalari paydo boʻladi, buyurtmalarda esa necha quti ekani koʻrinadi. 2 dan 500 donagacha.')+'</div>'\n    +(S.stk[p.id]?'<div class=\"full unit\" style=\"margin:0\">'+L('Ведётся учёт остатка: свободно '+num(stkAvail(S.stk[p.id]))+' шт. Меняется на вкладке «Остатки». Когда свободного нет, товар закрывается сам.','Qoldiq hisobi yuritiladi: boʻsh '+num(stkAvail(S.stk[p.id]))+' dona. «Qoldiq» boʻlimida oʻzgartiriladi. Boʻsh qoldiq boʻlmasa, mahsulot oʻzi yopiladi.')+'</div>':'')\n    +'<div class=\"full pact\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmove\" data-id=\"'+id+'\" data-d=\"-1\" aria-label=\"'+esc(L('Выше','Yuqoriga'))+'\">▲</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmove\" data-id=\"'+id+'\" data-d=\"1\" aria-label=\"'+esc(L('Ниже','Pastga'))+'\">▼</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"pdel\" data-id=\"'+id+'\">'+(S.cd===p.id?L('Точно удалить?','Aniq oʻchirilsinmi?'):L('Удалить товар','Mahsulotni oʻchirish'))+'</button></div>'\n    +'</div></div>';\n}\n/* ---------- прайс из Excel ---------- */\nconst IMP_F={price:['цена','narx'],name:['название','nomi'],uz:['название (узб.)','nomi (uz)'],desc:['описание','tavsif'],descUz:['описание (узб.)','tavsif (uz)'],cat:['категория','kategoriya'],amount:['вес','ogʻirlik'],unit:['единица','birlik'],on:['в наличии','mavjud'],tag:['метка','belgi'],old:['старая цена','eski narx']};\nfunction impVal(k,v){\n  if(k==='price'||k==='old')return v?num(v):'—';\n  if(k==='on')return v?L('да','ha'):L('нет','yoʻq');\n  if(k==='tag')return v?tagName(v):L('нет','yoʻq');\n  if(k==='unit')return unitName(v);\n  if(k==='amount')return amountStr(v);\n  return v===''||v==null?'—':String(v).slice(0,40);\n}\nfunction impWhy(w){return {\n  not_xlsx:L('Это не файл Excel (.xlsx). Откройте прайс в Excel и сохраните как «Книга Excel (*.xlsx)».','Bu Excel (.xlsx) fayli emas. Prays-listni Excelda ochib, «Excel Workbook (*.xlsx)» sifatida saqlang.'),\n  no_header:L('Не нашёл колонки «Название» и «Цена» в первых строках. Проверьте заголовки.','Birinchi qatorlarda «Название» va «Цена» ustunlari topilmadi. Sarlavhalarni tekshiring.'),\n  too_big:L('Файл слишком большой (до 1 МБ).','Fayl juda katta (1 MB gacha).')\n}[w]||L('Не удалось прочитать файл.','Faylni oʻqib boʻlmadi.')}\nfunction impCardHTML(){\n  const im=S.imp;\n  let h='<div class=\"card\"><h3>'+L('Прайс из Excel','Excel prays-listi')+'</h3><div class=\"unit\">'+L('Выгрузите каталог в Excel, поправьте цены и загрузите файл обратно. Перед применением вы увидите, что изменится. Ничего не удаляется, фото и остатки не меняются.','Katalogni Excelga yuklab oling, narxlarni tuzating va faylni qaytarib yuklang. Qoʻllashdan oldin nima oʻzgarishini koʻrasiz. Hech narsa oʻchirilmaydi, rasm va qoldiqlar oʻzgarmaydi.')+'</div>'\n    +'<div class=\"row-btns\">'+xbtn('catalog')\n    +'<label class=\"btn ghost sm'+(S.impBusy?' dis':'')+'\" for=\"imp-file\">'+(im&&im.busy?L('Читаем файл…','Fayl oʻqilmoqda…'):L('Загрузить прайс','Prays yuklash'))+'</label><input type=\"file\" class=\"sr\" id=\"imp-file\" accept=\".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\" data-imp=\"1\"'+(S.impBusy?' disabled':'')+'></div>';\n  if(im&&im.res){\n    const r=im.res,sm=r.summary;\n    h+='<div class=\"impsum\" id=\"impsum\"><span>'+L('Добавится','Qoʻshiladi')+': <b>'+sm.added+'</b></span><span>'+L('Изменится','Oʻzgaradi')+': <b>'+sm.updated+'</b></span><span>'+L('Без изменений','Oʻzgarishsiz')+': <b>'+sm.same+'</b></span>'+(sm.errors?'<span style=\"color:var(--bad)\">'+L('Ошибок','Xatolar')+': <b>'+sm.errors+'</b></span>':'')+'</div>';\n    if(sm.newCats&&sm.newCats.length)h+='<div class=\"unit\">'+L('Новые категории: ','Yangi kategoriyalar: ')+esc(sm.newCats.join(', '))+'</div>';\n    h+=r.changes.map(c=>{\n      const f=c.fields.map(x=>c.kind==='add'?(x.k==='price'?L('цена ','narx ')+impVal('price',x.to):''):esc(L(IMP_F[x.k][0],IMP_F[x.k][1]))+': '+esc(impVal(x.k,x.from))+' → '+esc(impVal(x.k,x.to))).filter(Boolean).join('; ');\n      return '<div class=\"chg\"><b>'+(c.kind==='add'?'+ ':'')+esc(c.name)+'</b><small>'+(c.kind==='add'?esc(L('новый товар, ','yangi mahsulot, ')+(c.cat?c.cat+', ':''))+f:f)+'</small></div>';\n    }).join('');\n    if(r.moreChanges)h+='<div class=\"unit\">'+L('…и ещё изменений: ','…va yana oʻzgarishlar: ')+r.moreChanges+'</div>';\n    if(r.errors.length)h+='<div class=\"unit\" style=\"margin-top:8px\"><b>'+L('Эти строки не будут загружены:','Bu qatorlar yuklanmaydi:')+'</b></div>'+r.errors.map(e=>'<div class=\"chg bad\"><small>'+L('строка ','qator ')+e.row+': '+esc(e.msg)+'</small></div>').join('')+(r.moreErrors?'<div class=\"unit\">'+L('…и ещё ошибок: ','…va yana xatolar: ')+r.moreErrors+'</div>':'');\n    const can=sm.added+sm.updated>0;\n    h+=(can?'':'<div class=\"note\" style=\"margin-top:8px\">'+L('В файле нет изменений для каталога.','Faylda katalog uchun oʻzgarishlar yoʻq.')+'</div>')\n      +'<div class=\"row-btns\" style=\"margin-top:10px\">'+(can?'<button type=\"button\" class=\"btn sm\" id=\"impapply\" data-act=\"impapply\"'+(S.impBusy?' disabled':'')+'>'+L('Применить изменения','Oʻzgarishlarni qoʻllash')+'</button>':'')+'<button type=\"button\" class=\"btn ghost sm\" data-act=\"impcancel\"'+(S.impBusy?' disabled':'')+'>'+(can?L('Отмена','Bekor qilish'):L('Закрыть','Yopish'))+'</button></div>';\n  }\n  return h+'</div>';\n}\nasync function importFile(file){\n  if(S.impBusy||!S.admin)return;\n  if(file.size>1000000){toast(impWhy('too_big'));return}\n  S.impBusy=true;S.imp={busy:true};paintSeller();\n  await flushSave();   // сначала уходят несохранённые правки каталога\n  let bytes;\n  try{bytes=new Uint8Array(await file.arrayBuffer())}catch(e){S.impBusy=false;S.imp=null;paintSeller();toast(impWhy(''));return}\n  const r=await apiBin('POST','/api/admin/import',bytes,'application/octet-stream');\n  S.impBusy=false;\n  if(!r.ok||!r.data||!r.data.summary){S.imp=null;paintSeller();toast(r.data&&r.data.why?impWhy(r.data.why):L('Не удалось прочитать файл. Проверьте соединение.','Faylni oʻqib boʻlmadi. Ulanishni tekshiring.'));return}\n  S.imp={bytes,res:r.data};paintSeller();\n  try{document.getElementById('impsum').scrollIntoView({block:'center'})}catch(e){}\n}\nasync function impApply(){\n  if(S.impBusy||!S.imp||!S.imp.bytes)return;\n  S.impBusy=true;paintSeller();\n  await flushSave();\n  const r=await apiBin('POST','/api/admin/import?apply=1',S.imp.bytes,'application/octet-stream');\n  S.impBusy=false;\n  if(!r.ok||!r.data||!r.data.summary){paintSeller();toast(L('Не удалось применить прайс. Проверьте соединение и попробуйте ещё раз.','Prays qoʻllanmadi. Ulanishni tekshirib, qayta urining.'));return}\n  const sm=r.data.summary;\n  if(r.data.prod){S.prod=normProd(r.data.prod);applyStk();pruneCart()}\n  S.imp=null;paintSeller();renderNav();\n  toast(L('Готово: добавлено '+sm.added+', изменено '+sm.updated+'.','Tayyor: '+sm.added+' ta qoʻshildi, '+sm.updated+' ta oʻzgardi.'));\n}\nfunction prodHTML(){\n  const P=S.prod;\n  if(S.pfilter!=='all'&&!P.cats.some(c=>c.id===S.pfilter))S.pfilter='all';\n  const list=P.items.filter(p=>S.pfilter==='all'||p.cat===S.pfilter);\n  let h='<div class=\"note\" style=\"margin-bottom:14px\">'+L('Каталог товаров. Сначала создайте категории, затем добавляйте товары: название, описание, вес, цену и фото. Клиенты видят изменения сразу. Фото сжимается на телефоне. Снимите галочку «В наличии», если товара нет: он останется в каталоге серым.','Mahsulotlar katalogi. Avval kategoriyalar yarating, keyin mahsulotlar qoʻshing: nomi, tavsifi, ogʻirligi, narxi va rasmi. Mijozlar oʻzgarishlarni darhol koʻradi. Rasm telefonda siqiladi. Mahsulot boʻlmasa, «Mavjud» belgisini olib tashlang: u katalogda kulrang boʻlib qoladi.')+'</div>'\n    +'<div class=\"savebar\" id=\"savebar\"></div>';\n  h+=impCardHTML();\n  h+='<div class=\"card\"><h3>'+L('Категории','Kategoriyalar')+'</h3><div class=\"unit\">'+L('Название по-русски и по-узбекски. Удалить можно пустую категорию.','Ruscha va oʻzbekcha nomi. Faqat boʻsh kategoriyani oʻchirish mumkin.')+'</div>';\n  P.cats.forEach(c=>{\n    const id=esc(c.id);\n    h+='<div class=\"crow\"><input type=\"text\" data-cid=\"'+id+'\" data-cp=\"name\" value=\"'+esc(c.name)+'\" maxlength=\"40\" aria-label=\"'+esc(L('Название категории','Kategoriya nomi'))+'\"><input type=\"text\" data-cid=\"'+id+'\" data-cp=\"uz\" value=\"'+esc(c.uz||'')+'\" maxlength=\"40\" placeholder=\"Oʻzbekcha nomi\" aria-label=\"Oʻzbekcha nomi\"><button type=\"button\" class=\"x\" data-act=\"cdel\" data-id=\"'+id+'\" aria-label=\"'+esc(L('Удалить категорию','Kategoriyani oʻchirish'))+'\">×</button></div>';\n  });\n  h+='<div style=\"margin-top:8px\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"cadd\">'+L('+ Добавить категорию','+ Kategoriya qoʻshish')+'</button></div></div>';\n  h+='<div class=\"card\"><h3>'+L('Товары','Mahsulotlar')+' · '+P.items.length+'</h3>';\n  if(P.cats.length>1)h+='<div class=\"filters\" style=\"margin:8px 0 4px\">'+[['all',L('Все','Barchasi')]].concat(P.cats.map(c=>[c.id,c.name])).map(c=>'<button type=\"button\" class=\"chip\" data-act=\"pfilter\" data-id=\"'+esc(c[0])+'\" aria-pressed=\"'+(S.pfilter===c[0])+'\">'+esc(c[1])+'</button>').join('')+'</div>';\n  if(!list.length)h+='<div class=\"unit\" style=\"padding:10px 0\">'+(P.items.length?L('В этой категории пока ничего нет.','Bu kategoriyada hozircha hech narsa yoʻq.'):L('Товаров пока нет. Нажмите «Добавить товар».','Mahsulotlar hozircha yoʻq. «Mahsulot qoʻshish» tugmasini bosing.'))+'</div>';\n  list.forEach(p=>{h+=prodRow(p)});\n  h+='<div style=\"margin-top:10px\"><button type=\"button\" class=\"btn\" data-act=\"pnew\">'+L('+ Добавить товар','+ Mahsulot qoʻshish')+'</button></div></div>';\n  return h;\n}\n/* ---------- seller: остатки ---------- */\n/* состояние учёта товара: none (не ведётся), ok, low (мало), out (свободного нет) */\nfunction stState(p){\n  const s=S.stk[p.id];\n  if(!s)return 'none';\n  const a=stkAvail(s);\n  return a===0?'out':(s.low>0&&a<=s.low?'low':'ok');\n}\n/* переносит остатки в каталог на экране, чтобы продавец видел витрину так же, как клиент */\nfunction applyStk(){\n  S.prod.items.forEach(p=>{\n    const v=stkPublic(S.stk[p.id],MAX_QTY);\n    delete p.av;delete p.lw;\n    if(v){p.av=v.av;if(v.lw)p.lw=1}\n  });\n}\nfunction statsHTML(){\n  const c={none:0,ok:0,low:0,out:0};\n  S.prod.items.forEach(p=>{c[stState(p)]++});\n  const st=(lab,v,hot)=>'<div class=\"stat'+(hot?' hot':'')+'\"><small>'+lab+'</small><b>'+v+'</b></div>';\n  return st(L('Под учётом','Hisobda'),c.ok+c.low+c.out)+st(L('Без учёта','Hisobsiz'),c.none)+st(L('Заканчивается','Tugayapti'),c.low,c.low>0)+st(L('Нет свободного','Boʻshi yoʻq'),c.out,c.out>0);\n}\n/* выбор «шт / коробка / блок» для прихода, если у товара есть упаковки */\nfunction stockUnitSel(p){\n  const ks=['blk','box'].filter(k=>packSize(p,k));\n  if(!ks.length)return '';\n  return '<select id=\"su-'+esc(p.id)+'\" aria-label=\"'+esc(L('В чём вводите количество','Miqdor nimada kiritiladi'))+'\"'+(S.sbusy[p.id]?' disabled':'')+'><option value=\"pc\">'+L('шт','dona')+'</option>'+ks.map(k=>'<option value=\"'+k+'\">'+esc(packWord(k))+' ('+packSize(p,k)+' '+pcsWord()+')</option>').join('')+'</select>';\n}\nconst stockUnit=id=>{const el=document.getElementById('su-'+id);return el&&el.value&&el.value!=='pc'?el.value:''};\nconst pkSmall=(p,n)=>{const t=packText(p,n);return t?'<small class=\"pk\">'+esc(t)+'</small>':''};\nfunction stockRowHTML(p){\n  const id=esc(p.id),s=S.stk[p.id],st=stState(p),dis=S.sbusy[p.id]?' disabled':'',w=weightLabel(p);\n  const cat=S.prod.cats.find(c=>c.id===p.cat);\n  const pill=st==='none'?'<span class=\"st mute\">'+L('Без учёта','Hisobsiz')+'</span>'\n    :st==='out'?'<span class=\"st bad\">'+L('Нет свободного','Boʻshi yoʻq')+'</span>'\n    :st==='low'?'<span class=\"st warn\">'+L('Заканчивается','Tugayapti')+'</span>'\n    :'<span class=\"st ok\">'+L('В наличии','Mavjud')+'</span>';\n  const head='<div class=\"sh\"><div class=\"sn\"><b>'+esc(p.name)+'</b><small>'+(w?esc(w):'')+(w&&cat?' · ':'')+(cat?esc(cat.name):'')+'</small></div>'+pill+'</div>';\n  const numIn=(k,ph,aria,val)=>'<input type=\"number\" id=\"'+k+'-'+id+'\" inputmode=\"numeric\" min=\"0\" max=\"1000000\" step=\"1\"'+(k==='sl'?' data-sl=\"'+id+'\"':'')+' value=\"'+val+'\" placeholder=\"'+esc(ph)+'\" aria-label=\"'+esc(aria)+'\"'+dis+'>';\n  const lowIn='<div class=\"sth\"><label for=\"sl-'+id+'\">'+L('Предупредить, когда меньше','Bundan kam qolsa ogohlantirish')+'</label>'+numIn('sl','0',L('Порог «мало»','«Oz qoldi» chegarasi'),s?s.low:'')+'</div>';\n  if(!s){\n    return '<div class=\"srow\" id=\"srow-'+id+'\">'+head\n      +'<div class=\"sact'+(packSize(p,'blk')||packSize(p,'box')?' haspk':'')+'\">'+numIn('sn',L('Сколько на складе','Omborda qancha'),L('Сколько сейчас на складе','Hozir omborda qancha'),'')+stockUnitSel(p)\n      +'<button type=\"button\" class=\"btn sm\" data-act=\"sstart\" data-id=\"'+id+'\"'+dis+'>'+L('Начать учёт','Hisobni boshlash')+'</button></div>'+lowIn+'</div>';\n  }\n  return '<div class=\"srow\" id=\"srow-'+id+'\">'+head\n    +'<div class=\"snum\"><div><small>'+L('На складе','Omborda')+'</small><b>'+num(s.q)+'</b>'+pkSmall(p,s.q)+'</div><div><small>'+L('В заказах','Buyurtmalarda')+'</small><b>'+num(s.r)+'</b>'+pkSmall(p,s.r)+'</div><div class=\"fr '+st+'\"><small>'+L('Свободно','Boʻsh')+'</small><b>'+num(stkAvail(s))+'</b>'+pkSmall(p,stkAvail(s))+'</div></div>'\n    +'<div class=\"sact'+(packSize(p,'blk')||packSize(p,'box')?' haspk':'')+'\">'+numIn('sn',L('Количество','Miqdori'),L('Количество','Miqdori'),'')+stockUnitSel(p)\n    +'<button type=\"button\" class=\"btn sm\" data-act=\"sin\" data-id=\"'+id+'\"'+dis+'>'+L('+ Приход','+ Kirim')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sset\" data-id=\"'+id+'\"'+dis+'>'+L('Задать остаток','Qoldiqni belgilash')+'</button></div>'\n    +lowIn\n    +'<div><button type=\"button\" class=\"btn ghost sm\" data-act=\"soff\" data-id=\"'+id+'\"'+dis+'>'+(S.sc===p.id?L('Точно отключить учёт?','Hisob oʻchirilsinmi?'):L('Отключить учёт','Hisobni oʻchirish'))+'</button></div></div>';\n}\nconst JR_KIND={start:['Начат учёт','Hisob boshlandi'],in:['Приход','Kirim'],fix:['Исправление остатка','Qoldiq tuzatildi'],out:['Списано по заказу','Buyurtma boʻyicha chiqim'],off:['Учёт отключён','Hisob oʻchirildi']};\nfunction jrDate(t){\n  const d=new Date(t);\n  if(isNaN(d))return '';\n  if(LANG==='uz')return d.getDate()+'-'+UZ_MO[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes());\n  return d.toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});\n}\nfunction jrHTML(){\n  if(!S.jr.length)return '<div class=\"unit\" style=\"padding:8px 0\">'+L('Записей пока нет.','Hozircha yozuv yoʻq.')+'</div>';\n  return S.jr.slice(0,60).map(x=>{\n    const k=JR_KIND[x.kind]||['',''],d=Number(x.d)||0;\n    const dd=x.kind==='off'?'—<small>'+L('было ','boʻlgan ')+num(x.q)+'</small>':(d>0?'+'+num(d):d<0?'−'+num(-d):'0')+'<small>'+L('стало ','boʻldi ')+num(x.q)+'</small>';\n    return '<div class=\"jrow\"><div class=\"jn\"><b>'+esc(x.name)+'</b><small>'+esc(L(k[0],k[1]))+(x.ref?' '+esc(x.ref):'')+' · '+esc(jrDate(x.t))+(x.by?' · '+esc(x.by):'')+'</small></div><div class=\"jd'+(x.kind!=='off'&&d>0?' plus':x.kind!=='off'&&d<0?' minus':'')+'\">'+dd+'</div></div>';\n  }).join('');\n}\nfunction stockHTML(){\n  if(!S.stkLoaded)return '<div class=\"empty\"><b>'+L('Загружаем остатки','Qoldiqlar yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  if(!S.prod.items.length)return '<div class=\"empty\"><b>'+L('Товаров пока нет','Mahsulotlar hozircha yoʻq')+'</b>'+L('Сначала добавьте товары на вкладке «Каталог».','Avval «Katalog» boʻlimida mahsulot qoʻshing.')+'</div>';\n  const fl=[['all',L('Все','Hammasi')],['low',L('Заканчивается','Tugayapti')],['out',L('Нет свободного','Boʻshi yoʻq')],['none',L('Без учёта','Hisobsiz')]];\n  const list=S.prod.items.filter(p=>{const s=stState(p);return S.sfilter==='all'||(S.sfilter==='low'?(s==='low'||s==='out'):s===S.sfilter)});\n  const hasPk=S.prod.items.some(p=>packSize(p,'box')||packSize(p,'blk'));\n  let h='<div class=\"note\" style=\"margin-bottom:14px\">'+(hasPk?L('Если у товара указан блок или коробка, приход и остаток можно вводить ими: выберите единицу рядом с полем, программа пересчитает в штуки. ','Agar mahsulotda blok yoki quti koʻrsatilgan boʻlsa, kirim va qoldiqni ular bilan kiritish mumkin: maydon yonida birlikni tanlang, dastur donaga hisoblab beradi. '):'')+L('Укажите, сколько единиц товара на складе (мешков, коробок, упаковок — как товар продаётся в каталоге). Заказ откладывает товар, при «Выдан» или «Доставлен» он списывается, при отмене возвращается. Когда свободного остаётся меньше порога, клиенты видят «Мало (осталось N)», а вам приходит сообщение в Telegram. Когда свободного нет, товар в каталоге становится серым сам.',\n    'Omborda necha birlik (qop, quti, qadoq — katalogda qanday sotilsa) borligini kiriting. Buyurtma mahsulotni band qiladi, «Topshirildi» yoki «Yetkazildi» boʻlganda ombordan chiqariladi, bekor qilinsa qaytadi. Boʻsh qoldiq chegaradan kam boʻlsa, mijozlar «Oz qoldi (N ta)» deb koʻradi, sizga Telegramda xabar keladi. Boʻsh qoldiq boʻlmasa, mahsulot katalogda oʻzi kulrang boʻladi.')+'</div>'\n    +'<div class=\"stats\" id=\"sstats\">'+statsHTML()+'</div>'\n    +'<div class=\"filters\">'+fl.map(f=>'<button type=\"button\" class=\"chip\" data-act=\"sfilter\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(S.sfilter===f[0])+'\">'+f[1]+'</button>').join('')+'</div>'\n    +'<div class=\"card\">'+(list.length?list.map(stockRowHTML).join(''):'<div class=\"unit\" style=\"padding:10px 0\">'+L('В этом списке пусто.','Bu roʻyxat boʻsh.')+'</div>')+'</div>'\n    +'<div class=\"card\"><h3>'+L('Журнал движений','Harakatlar jurnali')+'</h3><div class=\"unit\">'+L('Приходы, исправления и списания по выданным заказам. Показаны последние записи.','Kirimlar, tuzatishlar va topshirilgan buyurtmalar boʻyicha chiqimlar. Oxirgi yozuvlar koʻrsatilgan.')+'</div>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sjr\">'+(S.jrOpen?L('Скрыть журнал','Jurnalni yashirish'):L('Показать журнал','Jurnalni koʻrsatish'))+'</button>'\n    +'<div id=\"jrbody\">'+(S.jrOpen?jrHTML():'')+'</div></div>';\n  return h;\n}\nfunction paintStock(){\n  const b=$('#sbody');\n  if(b&&S.view==='seller'&&S.sellerTab==='stock')b.innerHTML=stockHTML();\n}\nfunction paintStockRow(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.getElementById('srow-'+id);\n  if(p&&el)el.outerHTML=stockRowHTML(p);\n  const st=$('#sstats');if(st)st.innerHTML=statsHTML();\n  paintTabs();\n}\nasync function loadStock(){\n  if(!S.admin)return;\n  const r=await api('GET','/api/admin/stock');\n  if(!r.ok||!r.data||!r.data.stk)return;\n  const first=!S.stkLoaded;\n  S.stkLoaded=true;\n  if(!first&&JSON.stringify(r.data.stk)===JSON.stringify(S.stk))return;\n  S.stk=r.data.stk;applyStk();\n  if(S.view!=='seller')return;\n  paintTabs();\n  if(S.sellerTab==='stock'){\n    const ae=document.activeElement,b=$('#sbody');\n    if(ae&&b&&b.contains(ae)&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))return;   // не мешаем, пока продавец вводит число\n    paintStock();\n  }\n}\nasync function loadJournal(){\n  const r=await api('GET','/api/admin/journal');\n  if(r.ok&&r.data&&Array.isArray(r.data.jr))S.jr=r.data.jr;\n  const el=$('#jrbody');if(el&&S.jrOpen)el.innerHTML=jrHTML();\n}\n/* целое число из поля; при ошибке подсказывает и возвращает null */\nfunction stockNum(id,k,min){\n  const el=document.getElementById(k+'-'+id),raw=el?String(el.value).trim():'';\n  if(raw===''){toast(L('Введите количество','Miqdorni kiriting'));if(el)el.focus();return null}\n  const n=Number(raw);\n  if(!Number.isInteger(n)||n<min||n>1000000){\n    toast(min>0?L('Введите целое число от 1','1 dan boshlab butun son kiriting'):L('Введите целое число, 0 или больше','Butun son kiriting (0 yoki koʻp)'));\n    if(el)el.focus();\n    return null;\n  }\n  return n;\n}\n/* soft: порог сохраняется тихо, строку не перерисовываем, пока продавец печатает в ней другое число */\nasync function stockDo(id,body,okMsg,soft){\n  if(S.sbusy[id]||!S.auth||!S.admin)return;\n  S.sbusy[id]=true;\n  if(!soft)paintStockRow(id);\n  await flushSave();   // товар должен уже быть на сервере\n  const r=await api('POST','/api/admin/stock',Object.assign({id:id},body));\n  delete S.sbusy[id];\n  if(r.ok&&r.data&&r.data.stk){S.stk=r.data.stk;S.stkLoaded=true;applyStk();toast(okMsg)}\n  else toast(r.status===404?L('Такого товара уже нет','Bunday mahsulot endi yoʻq'):L('Не удалось сохранить. Проверьте соединение.','Saqlab boʻlmadi. Ulanishni tekshiring.'));\n  const row=document.getElementById('srow-'+id),ae=document.activeElement;\n  if(!soft||!(row&&ae&&row.contains(ae)))paintStockRow(id);\n  else{const st=$('#sstats');if(st)st.innerHTML=statsHTML();paintTabs()}\n  if(S.jrOpen)loadJournal();\n}\n\n/* ---------- отчёты (продавец) ---------- */\nconst RP_DAYS=[7,30,90,365];\nconst MO_S_RU=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'],MO_S_UZ=['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'];\nconst MO_F_RU=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];\nconst dShort=d=>{const m=Number(d.slice(5,7))-1,n=Number(d.slice(8,10));return LANG==='uz'?n+'-'+UZ_MO[m]:n+' '+MO_S_RU[m]};\nconst fDay=d=>d.slice(8,10)+'.'+d.slice(5,7)+'.'+d.slice(0,4);\nconst mFull=m=>{const i=Number(m.slice(5,7))-1;return (LANG==='uz'?UZ_MO[i]:MO_F_RU[i])+' '+m.slice(0,4)};\nconst mShort=m=>{const i=Number(m.slice(5,7))-1;return LANG==='uz'?MO_S_UZ[i]:MO_S_RU[i]};\nconst rpRange=d=>({7:L('7 дней','7 kun'),30:L('30 дней','30 kun'),90:L('3 месяца','3 oy'),365:L('Год','Yil')})[d];\nfunction ruPl(n,a){const m=n%100,k=n%10;return m>=11&&m<=14?a[2]:k===1?a[0]:k>=2&&k<=4?a[1]:a[2]}\nconst ordTxt=n=>LANG==='uz'?n+' ta buyurtma':n+' '+ruPl(n,['заказ','заказа','заказов']);\n/* подписи на оси: 1,2 млн / 500 тыс */\nfunction cCompact(v){\n  v=Math.round(v);\n  const f=x=>String(Math.round(x*10)/10).replace('.',',');\n  return v>=1e9?f(v/1e9)+' '+L('млрд','mlrd'):v>=1e6?f(v/1e6)+' '+L('млн','mln'):v>=1e3?f(v/1e3)+' '+L('тыс','ming'):String(v);\n}\n/* верх шкалы: круглое число, чтобы половина тоже была круглой */\nfunction niceMax(v){\n  if(!(v>0))return 1;\n  const pow=Math.pow(10,Math.floor(Math.log10(v))),m=v/pow;\n  return [1,2,4,6,8,10].find(x=>m<=x+1e-9)*pow;\n}\n/* столбцы: до месяца — дни, три месяца — недели, год — месяцы */\nfunction repBuckets(r){\n  const ser=r.series,sum=(g,k)=>g.reduce((a,x)=>a+x[k],0);\n  if(r.days<=30)return ser.map(x=>({n:x.n,sum:x.sum,full:dShort(x.d),ax:dShort(x.d)}));\n  const out=[];\n  if(r.days<=90){\n    for(let i=0;i<ser.length;i+=7){const g=ser.slice(i,i+7);out.push({n:sum(g,'n'),sum:sum(g,'sum'),full:dShort(g[0].d)+(g.length>1?' – '+dShort(g[g.length-1].d):''),ax:dShort(g[0].d)})}\n    return out;\n  }\n  const mp=new Map();\n  ser.forEach(x=>{const k=x.d.slice(0,7),g=mp.get(k)||{m:k,n:0,sum:0};g.n+=x.n;g.sum+=x.sum;mp.set(k,g)});\n  mp.forEach(g=>out.push({n:g.n,sum:g.sum,full:mFull(g.m),ax:mShort(g.m)}));\n  return out;\n}\nconst readTxt=b=>'<b>'+esc(b.full)+'</b> · '+esc(money(b.sum))+' · '+esc(ordTxt(b.n));\nfunction readHTML(bs,i){\n  if(i>=0&&bs[i])return readTxt(bs[i]);\n  const mx=Math.max(0,...bs.map(b=>b.sum));\n  if(!(mx>0))return '';\n  return esc(L('Пик: ','Eng yuqori: '))+readTxt(bs[bs.findIndex(b=>b.sum===mx)]);\n}\n/* подсветка столбца и строка со значением (наведение, касание, нажатие) без перерисовки */\nfunction repShow(i){\n  const r=S.rep.data;if(!r)return;\n  document.querySelectorAll('.rcol').forEach((c,k)=>c.setAttribute('aria-pressed',String(k===i)));\n  const el=$('#rread');if(el)el.innerHTML=readHTML(repBuckets(r),i);\n}\nfunction repIdx(e){\n  const box=e.target&&e.target.closest?e.target.closest('.rcols'):null;\n  if(!box||!S.rep.data)return -1;\n  const rc=box.getBoundingClientRect(),n=box.children.length;\n  if(!rc.width||!n)return -1;\n  return Math.max(0,Math.min(n-1,Math.floor((e.clientX-rc.left)/rc.width*n)));\n}\ndocument.addEventListener('pointermove',e=>{\n  const i=repIdx(e);\n  if(i<0||i===S.rep.hov)return;\n  S.rep.hov=i;repShow(i);\n  if(e.pointerType==='touch')S.rep.drag=true;\n});\ndocument.addEventListener('pointerup',e=>{\n  if(e.pointerType==='touch'&&S.rep.drag){S.rep.drag=false;S.rep.sel=S.rep.hov;S.rep.skip=Date.now()}\n});\ndocument.addEventListener('pointerout',e=>{\n  if(e.pointerType!=='mouse'||!e.target.closest||!e.target.closest('.rcols'))return;\n  if(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.rcols'))return;\n  S.rep.hov=-1;repShow(S.rep.sel);\n});\nfunction chartHTML(r){\n  const bs=repBuckets(r),mx=Math.max(0,...bs.map(b=>b.sum)),top=niceMax(mx),ticks=[top,top/2,0];\n  const cols=bs.map((b,i)=>'<button type=\"button\" class=\"rcol\" data-act=\"rsel\" data-i=\"'+i+'\" aria-pressed=\"'+(S.rep.sel===i)+'\" aria-label=\"'+esc(b.full+': '+money(b.sum)+', '+ordTxt(b.n))+'\"><i style=\"height:'+(b.sum>0?Math.max(b.sum/top*100,1.5):0)+'%\"></i></button>').join('');\n  const ax=bs.length>2?[bs[0],bs[Math.floor((bs.length-1)/2)],bs[bs.length-1]]:bs;\n  return '<div class=\"rread\" id=\"rread\" aria-live=\"polite\">'+readHTML(bs,S.rep.sel)+'</div>'\n    +'<div class=\"rchart\"><div class=\"ryax\" aria-hidden=\"true\">'+ticks.map(v=>'<span style=\"bottom:'+(v/top*100)+'%\">'+esc(cCompact(v))+'</span>').join('')+'</div>'\n    +'<div class=\"rplot\">'+ticks.map(v=>'<div class=\"rgrid\" style=\"bottom:'+(v/top*100)+'%\"></div>').join('')+'<div class=\"rcols\" role=\"group\" aria-label=\"'+esc(L('Выручка по периодам','Davrlar boʻyicha tushum'))+'\">'+cols+'</div></div></div>'\n    +'<div class=\"rxax\" aria-hidden=\"true\">'+ax.map(b=>'<span>'+esc(b.ax)+'</span>').join('')+'</div>'\n    +'<p class=\"rnote\">'+L('Нажмите на столбец или проведите по графику, чтобы увидеть сумму и число заказов.','Summa va buyurtmalar sonini koʻrish uchun ustunni bosing yoki grafik boʻylab suring.')+'</p>'\n    +'<button type=\"button\" class=\"btn ghost sm rgap\" data-act=\"rtab\" aria-expanded=\"'+S.rep.tab+'\">'+(S.rep.tab?L('Скрыть таблицу','Jadvalni yashirish'):L('Показать таблицей','Jadval sifatida koʻrsatish'))+'</button>'\n    +(S.rep.tab?'<div class=\"rtab\"><table><thead><tr><th>'+L('Период','Davr')+'</th><th>'+L('Заказов','Buyurtma')+'</th><th>'+L('Выручка, сум','Tushum, soʻm')+'</th></tr></thead><tbody>'+bs.map(b=>'<tr><td>'+esc(b.full)+'</td><td>'+b.n+'</td><td>'+num(b.sum)+'</td></tr>').join('')+'</tbody></table></div>':'');\n}\nfunction deltaHTML(cur,prev,r){\n  if(!r.prev)return '';\n  if(!(prev>0))return cur>0?'<small class=\"dl flat\">'+L('в прошлом периоде продаж не было','oldingi davrda sotuv boʻlmagan')+'</small>':'';\n  const p=Math.round((cur-prev)/prev*100),cls=p>0?'up':p<0?'down':'flat',ar=p>0?'▲':p<0?'▼':'•';\n  return '<small class=\"dl '+cls+'\">'+ar+' '+(p>0?'+':'')+p+'% '+L('к прошлому периоду','oldingi davrga nisbatan')+'</small>';\n}\nfunction rankHTML(rows){\n  const mx=Math.max(1,...rows.map(x=>x.v));\n  return '<div class=\"rlist\">'+rows.map(x=>'<div class=\"rrow\"><div class=\"rl\"><b>'+esc(x.t)+'</b>'+(x.s?'<small>'+esc(x.s)+'</small>':'')+'</div><div class=\"rv\">'+esc(money(x.v))+'</div><div class=\"rbar\" aria-hidden=\"true\"><i style=\"width:'+Math.max(2,x.v/mx*100)+'%\"></i></div></div>').join('')+'</div>';\n}\nfunction buyHTML(r){\n  const b=r.buy;\n  let h='<div class=\"card\"><h3>'+L('Что пора закупать','Nimani sotib olish vaqti')+'</h3><div class=\"unit\">'+L('Только товары, по которым ведётся учёт остатков. Смотрим на продажи за последние '+b.window+' дн. и показываем, на сколько дней хватит свободного остатка. Докупить — чтобы хватило на '+b.cover+' дн.','Faqat qoldiq hisobi yuritiladigan mahsulotlar. Oxirgi '+b.window+' kunlik sotuvga qaraymiz va boʻsh qoldiq necha kunga yetishini koʻrsatamiz. Sotib olish — '+b.cover+' kunga yetishi uchun.')+'</div>';\n  if(!b.list.length)return h+'<div class=\"empty\"><b>'+L('Срочного нет','Shoshilinch narsa yoʻq')+'</b>'+L('Запаса хватает больше чем на '+b.cover+' дн. или продаж по этим товарам ещё не было. Учёт остатков включается на вкладке «Остатки».','Zaxira '+b.cover+' kundan koʻpga yetadi yoki bu mahsulotlar sotilmagan. Qoldiq hisobi «Qoldiq» boʻlimida yoqiladi.')+'</div></div>';\n  h+='<div class=\"rlist\">'+b.list.map(x=>{\n    const p=S.prod.items.find(y=>y.id===x.id),left=Number(x.left)||0,wl=p?weightLabel(p):'';\n    const cls=left<=3?'bad':left<=7?'warn':'info',lab=left<1?L('меньше 1 дня','1 kundan kam'):L('хватит на '+Math.floor(left)+' дн.',Math.floor(left)+' kunga yetadi');\n    const pk=p&&x.need>0?packText(p,x.need):'';\n    return '<div class=\"rbuy\"><div class=\"rh\"><b>'+esc(p?nm(p):x.name)+(wl?' <small>'+esc(wl)+'</small>':'')+'</b><span class=\"st '+cls+'\">'+esc(lab)+'</span></div>'\n      +'<small>'+L('Свободно '+num(x.avail)+' шт, продаётся ≈ '+amountStr(x.daily)+' шт в день','Boʻsh '+num(x.avail)+' dona, kuniga ≈ '+amountStr(x.daily)+' dona sotiladi')+'</small>'\n      +(x.need>0?'<small>'+L('Докупить ≈ '+num(x.need)+' шт','Sotib olish ≈ '+num(x.need)+' dona')+(pk?' ('+esc(pk)+')':'')+'</small>':'')+'</div>';\n  }).join('')+'</div></div>';\n  return h;\n}\nfunction repHTML(){\n  const R=S.rep,r=R.data;\n  let h='<div class=\"filters\">'+RP_DAYS.map(d=>'<button type=\"button\" class=\"chip\" data-act=\"rdays\" data-v=\"'+d+'\" aria-pressed=\"'+(R.days===d)+'\">'+esc(rpRange(d))+'</button>').join('')+'</div>';\n  if(!r||r.days!==R.days){\n    if(R.err)return h+'<div class=\"empty\"><b>'+L('Не удалось загрузить отчёт','Hisobotni yuklab boʻlmadi')+'</b>'+L('Проверьте соединение.','Ulanishni tekshiring.')+'<div style=\"margin-top:10px\"><button type=\"button\" class=\"btn sm\" data-act=\"rretry\">'+L('Повторить','Qayta urinish')+'</button></div></div>';\n    return h+'<div class=\"empty\"><b>'+L('Считаем отчёт','Hisobot tayyorlanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  }\n  h+='<div class=\"xtools\">'+xbtn('report')+'</div>'\n    +'<p class=\"rnote\" style=\"margin:0 0 4px\">'+L('Период: '+fDay(r.from)+' — '+fDay(r.to)+'. В отчёт попадают заказы со статусом «Выдан» или «Доставлен», по дню завершения.','Davr: '+fDay(r.from)+' — '+fDay(r.to)+'. Hisobotga «Topshirildi» yoki «Yetkazildi» holatidagi buyurtmalar kiradi, yakunlangan kun boʻyicha.')+'</p>';\n  if(r.since>r.from)h+='<p class=\"rnote\">'+L('Отчёт ведётся с '+fDay(r.since)+', раньше данных нет.','Hisobot '+fDay(r.since)+' dan yuritiladi, undan oldin maʼlumot yoʻq.')+'</p>';\n  if(r.thin)h+='<p class=\"rnote\">'+L('Данных пока мало: чем дольше работает бот, тем точнее цифры и подсказки.','Maʼlumot hozircha kam: bot qancha uzoq ishlasa, raqamlar va maslahatlar shuncha aniq boʻladi.')+'</p>';\n  if(!r.tot.n){\n    return h+'<div class=\"empty\"><b>'+L('За этот период завершённых заказов нет','Bu davrda yakunlangan buyurtma yoʻq')+'</b>'+L('Заказ попадает в отчёт, когда вы переводите его в «Выдан» или «Доставлен».','Buyurtma «Topshirildi» yoki «Yetkazildi» holatiga oʻtganda hisobotga kiradi.')+'</div>'+buyHTML(r);\n  }\n  const t=r.tot,pv=r.prev||{n:0,sum:0};\n  const kpi=(lab,v,extra)=>'<div class=\"stat rkpi\"><small>'+lab+'</small><b>'+v+'</b>'+(extra||'')+'</div>';\n  h+='<div class=\"stats\">'+kpi(L('Заказов','Buyurtmalar'),t.n,deltaHTML(t.n,pv.n,r))+kpi(L('Выручка','Tushum'),esc(money(t.sum)),deltaHTML(t.sum,pv.sum,r))+kpi(L('Средний заказ','Oʻrtacha buyurtma'),esc(money(t.avg)))+kpi(L('Дано скидок','Berilgan chegirma'),esc(money(t.disc)))+'</div>';\n  h+='<div class=\"card\"><h3>'+(r.days<=30?L('Выручка по дням','Kunlar boʻyicha tushum'):r.days<=90?L('Выручка по неделям','Haftalar boʻyicha tushum'):L('Выручка по месяцам','Oylar boʻyicha tushum'))+'</h3>'+chartHTML(r)+'</div>';\n  const pr=R.allP?r.prods:r.prods.slice(0,8);\n  h+='<div class=\"card\"><h3>'+L('Ходовые товары','Ommabop mahsulotlar')+'</h3><div class=\"unit\">'+L('По выручке за период.','Davr tushumi boʻyicha.')+'</div>'\n    +rankHTML(pr.map(x=>{const p=S.prod.items.find(y=>y.id===x.id),pk=p?packText(p,x.qty):'',w=p?weightLabel(p):'';return {t:p?nm(p):x.name,s:(w?w+' · ':'')+L('продано ','sotildi ')+num(x.qty)+' '+pcsWord()+(pk?' ('+pk+')':''),v:x.sum}}))\n    +(r.prods.length>8?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"rall\">'+(R.allP?L('Свернуть','Yigʻish'):L('Показать все ('+r.prods.length+')','Hammasini koʻrsatish ('+r.prods.length+')'))+'</button>':'')+'</div>';\n  if(r.cl.length)h+='<div class=\"card\"><h3>'+L('Лучшие клиенты','Eng yaxshi mijozlar')+'</h3><div class=\"unit\">'+L('По сумме заказов за период.','Davrdagi buyurtmalar summasi boʻyicha.')+'</div>'\n    +rankHTML(r.cl.map(c=>({t:(c.name||L('Без имени','Nomsiz'))+(c.org?' · '+c.org:''),s:ordTxt(c.n),v:c.sum})))+'</div>';\n  return h+buyHTML(r);\n}\nfunction paintRep(){\n  const b=$('#sbody');\n  if(b&&S.view==='seller'&&S.sellerTab==='reports')b.innerHTML=repHTML();\n}\nasync function loadReport(){\n  if(!S.admin)return;\n  const R=S.rep,days=R.days,seq=++R.seq;\n  R.busy=true;R.err=false;\n  paintRep();\n  const r=await api('GET','/api/admin/report?days='+days);\n  if(seq!==R.seq)return;\n  R.busy=false;\n  if(r.ok&&r.data&&r.data.report){R.data=r.data.report;R.err=false;if(R.sel>=repBuckets(R.data).length)R.sel=-1}\n  else R.err=true;\n  paintRep();\n}\n\n/* ---------- клиенты (продавец) ---------- */\nconst cName=c=>c.name||(c.tg&&c.tg.name)||(c.tg&&c.tg.username?'@'+c.tg.username:'')||('ID '+c.uid);\nfunction agoTxt(iso){\n  const t=new Date(iso).getTime();\n  if(isNaN(t))return '';\n  const d=Math.floor((Date.now()-t)/86400000);\n  if(d<=0)return L('сегодня','bugun');\n  if(d===1)return L('вчера','kecha');\n  if(d<60)return L(d+' дн. назад',d+' kun oldin');\n  return jrDate(iso);\n}\nconst groupsList=()=>[...new Set(S.cl.map(c=>c.grp).filter(Boolean))].sort((a,b)=>a.localeCompare(b));\nfunction clientMatch(c){\n  if(S.cg==='blocked'&&!c.blocked)return false;\n  if(S.cg.slice(0,2)==='g:'&&c.grp!==S.cg.slice(2))return false;\n  const q=S.cq.trim().toLowerCase();\n  if(!q)return true;\n  const hay=[c.name,c.org,c.phone,c.tg&&c.tg.username,c.tg&&c.tg.name,c.grp,c.note].join(' ').toLowerCase();\n  if(hay.includes(q))return true;\n  const qd=q.replace(/\\D/g,'');\n  return qd.length>=3&&String(c.phone||'').replace(/\\D/g,'').includes(qd);\n}\nconst clientsSorted=()=>S.cl.slice().sort((a,b)=>String(b.last||b.since).localeCompare(String(a.last||a.since)));\nfunction clientStatsHTML(){\n  const st=(lab,v,hot)=>'<div class=\"stat'+(hot?' hot':'')+'\"><small>'+lab+'</small><b>'+v+'</b></div>';\n  const bl=S.cl.filter(c=>c.blocked).length;\n  return st(L('Клиентов','Mijozlar'),S.cl.length)+st(L('Заказывали','Buyurtma berganlar'),S.cl.filter(c=>c.n>0).length)+st(L('Выдано на сумму','Topshirilgan summa'),money(S.cl.reduce((s,c)=>s+(Number(c.sum)||0),0)))+st(L('Заблокировано','Bloklangan'),bl,bl>0);\n}\nfunction clientChipsHTML(){\n  const ch=(v,label)=>'<button type=\"button\" class=\"chip\" data-act=\"cfilter\" data-v=\"'+esc(v)+'\" aria-pressed=\"'+(S.cg===v)+'\">'+esc(label)+'</button>';\n  const bl=S.cl.filter(c=>c.blocked).length;\n  return ch('all',L('Все','Hammasi')+' '+S.cl.length)+groupsList().map(g=>ch('g:'+g,g+' '+S.cl.filter(c=>c.grp===g).length)).join('')+(bl?ch('blocked',L('Заблокированные','Bloklanganlar')+' '+bl):'');\n}\nfunction clientRowHTML(c){\n  const open=S.cOpen===c.uid;\n  const sub=[c.org,c.phone].filter(Boolean).map(esc).join(' · ');\n  const badges=(c.grp?'<span class=\"st info\">'+esc(c.grp)+'</span>':'')+(c.blocked?'<span class=\"st bad\">'+L('Заблокирован','Bloklangan')+'</span>':'');\n  const ago=c.last?agoTxt(c.last):'';\n  return '<div class=\"clrow\" id=\"clrow-'+c.uid+'\"><button type=\"button\" class=\"clhead\" data-act=\"copen\" data-id=\"'+c.uid+'\" aria-expanded=\"'+open+'\"><span class=\"cn\"><b>'+esc(cName(c))+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span><span class=\"cbadges\">'+badges+'</span></button>'\n    +'<div class=\"cmeta\">'+L('Заказов: ','Buyurtmalar: ')+num(c.n)+' · '+L('выдано на ','topshirildi: ')+money(c.sum)+(ago?' · '+L('последний: ','oxirgisi: ')+esc(ago):'')+'</div>'\n    +(open?clientEditHTML(c):'')+'</div>';\n}\nfunction clientOrdersHTML(uid){\n  const list=S.cDet[uid];\n  if(!list)return '<div class=\"unit\">'+L('Загружаем…','Yuklanmoqda…')+'</div>';\n  if(!list.length)return '<div class=\"unit\">'+L('Заказов пока нет.','Hozircha buyurtma yoʻq.')+'</div>';\n  const sorted=list.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));\n  return sorted.slice(0,15).map(o=>'<div class=\"corder\"><span class=\"oid\">'+esc(o.id)+'</span><span class=\"cs\">'+pill(o)+'<span>'+esc(jrDate(o.createdAt))+'</span></span><b>'+money(o.total)+'</b></div>').join('')\n    +(sorted.length>15?'<div class=\"unit\" style=\"padding-top:6px\">'+L('… и ещё '+(sorted.length-15),'… va yana '+(sorted.length-15)+' ta')+'</div>':'');\n}\nfunction clientEditHTML(c){\n  const id=c.uid,phone=String(c.phone||'').replace(/[^\\d+]/g,''),tgu=c.tg&&c.tg.username;\n  const sug=[...new Set(groupsList().concat([L('Магазин','Doʻkon'),L('Кафе','Kafe'),L('Столовая','Oshxona')]))];\n  return '<div class=\"ced\" id=\"ced\">'\n    +'<div class=\"form\">'\n    +'<div><label class=\"lab\" for=\"ce-name\">'+L('Имя','Ism')+'</label><input type=\"text\" id=\"ce-name\" data-ce=\"name\" maxlength=\"60\" value=\"'+esc(c.name)+'\"></div>'\n    +'<div><label class=\"lab\" for=\"ce-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"ce-phone\" data-ce=\"phone\" maxlength=\"25\" value=\"'+esc(c.phone)+'\" placeholder=\"+998 90 123 45 67\"></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"ce-org\">'+L('Организация','Tashkilot')+'</label><input type=\"text\" id=\"ce-org\" data-ce=\"org\" maxlength=\"80\" value=\"'+esc(c.org)+'\"></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"ce-addrs\">'+L('Адреса доставки: каждый с новой строки, до 5','Yetkazib berish manzillari: har biri yangi qatordan, 5 tagacha')+'</label><textarea id=\"ce-addrs\" data-ce=\"addrs\" rows=\"3\">'+esc((c.addrs||[]).join('\\n'))+'</textarea><div class=\"err\" id=\"cee-addrs\"></div></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"ce-grp\">'+L('Группа','Guruh')+'</label><input type=\"text\" id=\"ce-grp\" data-ce=\"grp\" maxlength=\"30\" value=\"'+esc(c.grp)+'\" placeholder=\"'+esc(L('Например: Магазин','Masalan: Doʻkon'))+'\"><div class=\"gchips\">'+sug.map(g=>'<button type=\"button\" class=\"chip\" data-act=\"cgrp\" data-v=\"'+esc(g)+'\">'+esc(g)+'</button>').join('')+'</div></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"ce-note\">'+L('Заметка (видна только вам)','Eslatma (faqat sizga koʻrinadi)')+'</label><textarea id=\"ce-note\" data-ce=\"note\" rows=\"3\" maxlength=\"500\" placeholder=\"'+esc(L('Например: платит в конце недели','Masalan: hafta oxirida toʻlaydi'))+'\">'+esc(c.note)+'</textarea></div>'\n    +'<div class=\"full\"><label class=\"ck\"><input type=\"checkbox\" id=\"ce-blocked\" data-ce=\"blocked\"'+(c.blocked?' checked':'')+'><span>'+L('Заблокировать','Bloklash')+'<small>'+L('Клиент не сможет оформить заказ, пока вы не снимете блокировку.','Siz blokni olmaguningizcha mijoz buyurtma bera olmaydi.')+'</small></span></label></div>'\n    +'</div>'\n    +'<div class=\"row-btns\"><button type=\"button\" class=\"btn sm\" data-act=\"csave\" data-id=\"'+id+'\">'+L('Сохранить','Saqlash')+'</button>'\n    +(phone?'<a class=\"btn ghost sm\" href=\"tel:'+esc(phone)+'\">'+L('Позвонить','Qoʻngʻiroq')+'</a>':'')\n    +(tgu?'<a class=\"btn ghost sm\" data-act=\"contact\" href=\"https://t.me/'+encodeURIComponent(tgu)+'\" target=\"_blank\" rel=\"noopener\">Telegram</a>':'')+'</div>'\n    +'<div><h3>'+L('История заказов','Buyurtmalar tarixi')+'</h3><div id=\"cord\">'+clientOrdersHTML(id)+'</div></div>'\n    +'<div><button type=\"button\" class=\"btn ghost sm\" data-act=\"cldel\" data-id=\"'+id+'\">'+(S.cDel===id?L('Точно удалить из базы?','Bazadan aniq oʻchirilsinmi?'):L('Удалить из базы','Bazadan oʻchirish'))+'</button></div></div>';\n}\nfunction clientListHTML(){\n  const list=clientsSorted().filter(clientMatch);\n  return list.length?list.map(clientRowHTML).join(''):'<div class=\"unit\" style=\"padding:10px 0\">'+L('Никого не нашли.','Hech kim topilmadi.')+'</div>';\n}\nfunction clientsHTML(){\n  if(!S.clLoaded)return '<div class=\"empty\"><b>'+L('Загружаем клиентов','Mijozlar yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  if(!S.cl.length)return '<div class=\"empty\"><b>'+L('Клиентов пока нет','Hozircha mijoz yoʻq')+'</b>'+L('Клиент появляется в базе после первого заказа или когда заполнит свой профиль.','Mijoz birinchi buyurtmadan keyin yoki oʻz profilini toʻldirganda bazaga tushadi.')+'</div>';\n  return '<div class=\"xtools\">'+xbtn('clients')+'</div><div class=\"stats\" id=\"cstats\">'+clientStatsHTML()+'</div>'\n    +'<input type=\"search\" id=\"cq\" class=\"csearch\" value=\"'+esc(S.cq)+'\" placeholder=\"'+esc(L('Поиск: имя, телефон, организация','Qidirish: ism, telefon, tashkilot'))+'\" aria-label=\"'+esc(L('Поиск клиента','Mijozni qidirish'))+'\" autocomplete=\"off\">'\n    +'<div class=\"filters\" id=\"cfilters\">'+clientChipsHTML()+'</div>'\n    +'<div class=\"card\" id=\"clients-list\">'+clientListHTML()+'</div>';\n}\nfunction paintClients(){\n  const b=$('#sbody');\n  if(b&&S.view==='seller'&&S.sellerTab==='clients')b.innerHTML=clientsHTML();\n}\n/* перерисовывает только список и фильтры, поле поиска остаётся на месте */\nfunction paintClientList(){\n  const l=$('#clients-list');\n  if(!l){paintClients();return}\n  l.innerHTML=clientListHTML();\n  const f=$('#cfilters');if(f)f.innerHTML=clientChipsHTML();\n  const st=$('#cstats');if(st)st.innerHTML=clientStatsHTML();\n}\nasync function loadClients(){\n  if(!S.admin)return;\n  const r=await api('GET','/api/admin/clients');\n  if(!r.ok||!r.data||!Array.isArray(r.data.clients))return;\n  const first=!S.clLoaded;\n  S.clLoaded=true;\n  if(!first&&JSON.stringify(r.data.clients)===JSON.stringify(S.cl))return;\n  S.cl=r.data.clients;\n  if(S.view!=='seller'||S.sellerTab!=='clients')return;\n  if($('#ced'))return;   // карточка открыта: не затираем то, что продавец печатает; список обновится, когда её закроют\n  const ae=document.activeElement;\n  if(ae&&ae.id==='cq'){paintClientList();return}\n  paintClients();\n}\nasync function loadClientDetail(uid){\n  const r=await api('GET','/api/admin/clients/'+uid);\n  if(!r.ok||!r.data)return;\n  S.cDet[uid]=r.data.orders||[];\n  const el=$('#cord');\n  if(el&&S.cOpen===uid)el.innerHTML=clientOrdersHTML(uid);\n}\nfunction toggleClient(uid){\n  S.cOpen=S.cOpen===uid?null:uid;S.cDel=null;\n  paintClientList();\n  if(S.cOpen!==null){\n    loadClientDetail(uid);\n    const row=document.getElementById('clrow-'+uid);\n    if(row)try{row.scrollIntoView({block:'nearest'})}catch(x){}\n  }\n}\nasync function saveClient(uid){\n  if(S.cBusy)return;\n  const get=k=>{const el=document.getElementById('ce-'+k);return el?String(el.value):''};\n  const c=checkClientFields(get);\n  const er=document.getElementById('cee-addrs');if(er)er.textContent=(c.e&&c.e.addrs)||'';\n  if(c.e){\n    if(c.e.phone){toast(c.e.phone);const el=document.getElementById('ce-phone');if(el)el.focus()}\n    else{const el=document.getElementById('ce-addrs');if(el)el.focus()}\n    return;\n  }\n  const blk=document.getElementById('ce-blocked');\n  const body=Object.assign({},c.v,{grp:get('grp').trim(),note:get('note').trim(),blocked:!!(blk&&blk.checked)});\n  S.cBusy=true;\n  const btn=document.querySelector('[data-act=\"csave\"]');if(btn)btn.disabled=true;\n  const r=await api('PUT','/api/admin/clients/'+uid,body);\n  S.cBusy=false;\n  if(btn)btn.disabled=false;\n  if(!r.ok||!r.data||!r.data.client){toast(r.status===404?L('Клиента уже нет в базе','Mijoz endi bazada yoʻq'):clientErrText(r.data&&r.data.error));return}\n  const i=S.cl.findIndex(x=>x.uid===uid);\n  if(i>=0)S.cl[i]=r.data.client;\n  toast(L('Клиент сохранён','Mijoz saqlandi'));\n  paintClientList();\n}\nasync function deleteClient(uid){\n  const r=await api('DELETE','/api/admin/clients/'+uid);\n  if(!r.ok){toast(clientErrText(r.data&&r.data.error));return}\n  S.cl=S.cl.filter(c=>c.uid!==uid);S.cOpen=null;S.cDel=null;delete S.cDet[uid];\n  toast(L('Клиент удалён из базы. Его заказы остались.','Mijoz bazadan oʻchirildi. Buyurtmalari qoldi.'));\n  paintClients();\n}\n\n/* Сжимает фото на телефоне: JPEG, длинная сторона ~800 px, до ~280 КБ. */\nasync function shrinkPhoto(file){\n  const url=URL.createObjectURL(file);\n  try{\n    const img=await new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=url});\n    const w=img.naturalWidth,h=img.naturalHeight;\n    if(!w||!h)return null;\n    let k=Math.min(1,800/Math.max(w,h));\n    for(let attempt=0;attempt<4;attempt++){\n      const cw=Math.max(64,Math.round(w*k)),ch=Math.max(64,Math.round(h*k));\n      const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;\n      const g=cv.getContext('2d');g.fillStyle='#FFFFFF';g.fillRect(0,0,cw,ch);g.drawImage(img,0,0,cw,ch);\n      for(const q of [0.82,0.7,0.58]){\n        const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',q));\n        if(blob&&blob.size<=280000)return blob;\n      }\n      k*=0.8;\n    }\n    return null;\n  }finally{URL.revokeObjectURL(url)}\n}\nasync function apiBin(method,path,blob,ctype){\n  try{\n    const h={'content-type':ctype||'image/jpeg'};\n    if(S.initData)h['x-init-data']=S.initData;\n    const r=await fetch(path,{method,headers:h,body:blob,cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\nasync function uploadPhoto(id,file){\n  if(!S.auth||!S.admin||S.upl[id])return;\n  const p=S.prod.items.find(x=>x.id===id);if(!p)return;\n  S.upl[id]=true;paintPhoto(id);\n  let ok=false;\n  try{\n    await flushSave();   // товар должен уже быть на сервере, иначе фото некуда привязать\n    const blob=await shrinkPhoto(file);\n    if(blob){\n      const r=await apiBin('PUT','/api/admin/photo/'+encodeURIComponent(id),blob);\n      if(r.ok&&r.data){p.pv=r.data.pv||'';ok=true}\n    }\n  }catch(e){}\n  delete S.upl[id];paintPhoto(id);\n  toast(ok?L('Фото сохранено','Rasm saqlandi'):L('Не удалось загрузить фото. Попробуйте другое изображение.','Rasmni yuklab boʻlmadi. Boshqa rasm tanlang.'));\n}\nasync function removePhoto(id){\n  const p=S.prod.items.find(x=>x.id===id);if(!p||S.upl[id])return;\n  S.upl[id]=true;paintPhoto(id);\n  const r=await api('DELETE','/api/admin/photo/'+encodeURIComponent(id));\n  if(r.ok)p.pv='';\n  delete S.upl[id];paintPhoto(id);\n  if(!r.ok)toast(L('Не удалось убрать фото','Rasmni olib tashlab boʻlmadi'));\n}\n\n/* скидка на заказ: до трёх строк «от суммы — %» */\nfunction discEditHTML(){\n  const d=S.cfg.shop.discounts||[];\n  const rows=[0,1,2].map(i=>{\n    const x=d[i]||{};\n    return '<div class=\"trow\"><span>'+L('от','dan')+'</span><input type=\"number\" id=\"sdf-'+i+'\" data-sd=\"from\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"1\" max=\"1000000000\" step=\"1000\" value=\"'+(x.from||'')+'\" placeholder=\"'+(i===0?'500000':'')+'\" aria-label=\"'+esc(L('Скидка '+(i+1)+': от какой суммы, сум','Chegirma '+(i+1)+': qaysi summadan, soʻm'))+'\">'\n      +'<span>'+L('сум — скидка','soʻm — chegirma')+'</span><input type=\"number\" id=\"sdp-'+i+'\" data-sd=\"pct\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"1\" max=\"50\" step=\"1\" value=\"'+(x.pct||'')+'\" aria-label=\"'+esc(L('Скидка '+(i+1)+': процент','Chegirma '+(i+1)+': foiz'))+'\"><span>%</span></div>';\n  }).join('');\n  return '<div class=\"full\"><span class=\"lab\">'+L('Скидка на заказ от суммы','Buyurtma summasiga qarab chegirma')+'</span><div class=\"tiers\" id=\"sdisc\">'+rows+'</div><div class=\"err\" id=\"sdw\" role=\"status\"></div>'\n    +'<div class=\"note\">'+L('Считается от суммы товаров (уже с ценами по ступеням) и показывается клиенту отдельной строкой. На минимальную сумму заказа и порог бесплатной доставки скидка не влияет: они считаются по сумме до скидки. Процент от 1 до 50, он должен расти вместе с суммой.','Mahsulotlar summasidan (pogʻona narxlarida) hisoblanadi va mijozga alohida qatorda koʻrsatiladi. Minimal buyurtma summasiga va bepul yetkazish chegarasiga chegirma taʼsir qilmaydi: ular chegirmagacha boʻlgan summa boʻyicha hisoblanadi. Foiz 1 dan 50 gacha, summa oshgani sari oshishi kerak.')+'</div></div>';\n}\nfunction syncDisc(){\n  const rows=[];\n  for(let i=0;i<3;i++){\n    const a=document.getElementById('sdf-'+i),b=document.getElementById('sdp-'+i);\n    const f=a?String(a.value).trim():'',pc=b?String(b.value).trim():'';\n    if(f!==''&&pc!=='')rows.push({from:Number(f),pct:Number(pc)});\n  }\n  const ok=cleanDiscounts(rows);\n  S.cfg.shop.discounts=ok;\n  const w=document.getElementById('sdw');\n  if(w)w.textContent=ok.length<rows.length?L('Одна из строк не учтена: сумма и процент должны расти от строки к строке.','Qatorlardan biri hisobga olinmadi: summa va foiz qatordan qatorga oshib borishi kerak.')\n    :rows.some(r=>Math.round(r.pct)>50)?L('Скидка не больше 50%.','Chegirma 50% dan oshmasligi kerak.'):'';\n  queueSave();\n}\nfunction settingsHTML(){\n  const s=S.cfg.shop;\n  const num=(id,lab,k,min,max)=>'<div><label class=\"lab\" for=\"s-'+id+'\">'+lab+'</label><input type=\"number\" id=\"s-'+id+'\" inputmode=\"numeric\" min=\"'+min+'\" max=\"'+max+'\" data-s=\"'+k+'\" value=\"'+esc(s[k])+'\"></div>';\n  return '<div class=\"savebar\" id=\"savebar\"></div><div class=\"card\"><div class=\"settings\">'\n    +'<div><label class=\"lab\" for=\"s-name\">'+L('Название компании','Kompaniya nomi')+'</label><input type=\"text\" id=\"s-name\" data-s=\"name\" value=\"'+esc(s.name)+'\" maxlength=\"60\"></div>'\n    +'<div><label class=\"lab\" for=\"s-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"s-phone\" data-s=\"phone\" value=\"'+esc(s.phone)+'\" placeholder=\"+998 …\"></div>'\n    +'<div><label class=\"lab\" for=\"s-tg\">'+L('Telegram для вопросов по заказу, без @','Buyurtma savollari uchun Telegram, @ belgisisiz')+'</label><input type=\"text\" id=\"s-tg\" data-s=\"telegram\" value=\"'+esc(s.telegram)+'\"></div>'\n    +'<div></div>'\n    +'<div><label class=\"lab\" for=\"s-addr\">'+L('Адрес самовывоза (по-русски)','Olib ketish manzili (ruscha)')+'</label><input type=\"text\" id=\"s-addr\" data-s=\"address\" value=\"'+esc(s.address)+'\"></div>'\n    +'<div><label class=\"lab\" for=\"s-addruz\">'+L('Адрес самовывоза (по-узбекски)','Olib ketish manzili (oʻzbekcha)')+'</label><input type=\"text\" id=\"s-addruz\" data-s=\"addressUz\" value=\"'+esc(s.addressUz)+'\"></div>'\n    +'<div class=\"full\"><label class=\"chk\"><input type=\"checkbox\" id=\"s-delivery\" data-s=\"delivery\"'+(s.delivery!==false?' checked':'')+'> '+L('Доставка по адресу включена','Manzilga yetkazib berish yoqilgan')+'</label></div>'\n    +num('lead',L('Самовывоз: заказ за, часов минимум','Olib ketish: buyurtma, kamida soat'),'leadHours',0,240)\n    +num('dlead',L('Доставка: заказ за, часов минимум','Yetkazib berish: buyurtma, kamida soat'),'deliveryLeadHours',0,240)\n    +num('minorder',L('Минимальная сумма заказа, сум (0 — без минимума)','Buyurtmaning minimal summasi, soʻm (0 — cheklovsiz)'),'minOrder',0,1000000000)\n    +num('dfee',L('Стоимость доставки, сум (0 — бесплатно)','Yetkazib berish narxi, soʻm (0 — bepul)'),'deliveryFee',0,1000000000)\n    +num('dfree',L('Доставка бесплатна от суммы, сум (0 — нет порога)','Yetkazib berish bepul boʻladigan summa, soʻm (0 — chegarasiz)'),'freeDeliveryFrom',0,1000000000)\n    +'<div class=\"full\"><div class=\"note\">'+L('Минимальная сумма считается по товарам и действует и на самовывоз, и на доставку. Стоимость доставки добавляется к заказу только при доставке; если указан порог, при сумме товаров от него доставка бесплатна.','Minimal summa mahsulotlar boʻyicha hisoblanadi va olib ketishga ham, yetkazib berishga ham taalluqli. Yetkazib berish narxi faqat yetkazishda qoʻshiladi; chegara koʻrsatilsa, mahsulotlar shu summadan oshganda yetkazish bepul.')+'</div></div>'\n    +discEditHTML()\n    +num('from',L('Время работы с, часов','Ish vaqti: dan, soat'),'openFrom',0,22)\n    +num('to',L('Время работы до, часов','Ish vaqti: gacha, soat'),'openTo',1,23)\n    +'</div></div>'\n    +'<div class=\"card\"><h3>'+L('Резервная копия','Zaxira nusxasi')+'</h3><div class=\"unit\">'+L('Один файл со всем: настройки, каталог с фото, остатки, заказы и клиенты. Он придёт вам в чат с ботом. Храните его в надёжном месте: в нём телефоны и адреса клиентов. Токен бота и код продавца в файл не попадают.','Hammasi bitta faylda: sozlamalar, rasmli katalog, qoldiqlar, buyurtmalar va mijozlar. U botdagi chatingizga keladi. Uni ishonchli joyda saqlang: unda mijozlarning telefon va manzillari bor. Bot tokeni va sotuvchi kodi faylga kirmaydi.')+'</div>'+xbtn('backup')+'</div>';\n}\nfunction paintSave(){\n  const el=$('#savebar');if(!el)return;\n  const t={\n    saving:L('Сохраняем…','Saqlanmoqda…'),\n    saved:L('Сохранено, клиенты видят изменения','Saqlandi, mijozlar oʻzgarishlarni koʻradi'),\n    error:L('Не удалось сохранить. Проверьте соединение и измените что-нибудь ещё раз.','Saqlab boʻlmadi. Ulanishni tekshiring va yana biror narsani oʻzgartiring.'),\n    nodb:L('Изменения не сохраняются: нет доступа к хранилищу.','Oʻzgarishlar saqlanmaydi: ombor mavjud emas.')\n  }[S.saveState]||'';\n  el.textContent=t;el.className='savebar'+(S.saveState==='error'||S.saveState==='nodb'?' bad':'');\n}\nfunction queueSave(kind){\n  if(kind==='prod')S.dirtyP=true;else S.dirtyC=true;\n  S.dirty=true;\n  if(!S.auth||!S.admin){S.saveState='nodb';paintSave();return}\n  S.saveState='saving';paintSave();\n  clearTimeout(saveT);saveT=setTimeout(doSave,700);\n}\nasync function doSave(){\n  if(S.saving){S.again=true;return}\n  S.saving=true;\n  do{\n    S.again=false;\n    const jobs=[];\n    if(S.dirtyC){S.dirtyC=false;jobs.push(api('PUT','/api/admin/config',{cfg:clone(S.cfg)}).then(r=>{if(!r.ok)S.dirtyC=true;return r.ok}))}\n    if(S.dirtyP){S.dirtyP=false;jobs.push(api('PUT','/api/admin/products',{prod:clone(S.prod)}).then(r=>{if(!r.ok)S.dirtyP=true;return r.ok}))}\n    const res=await Promise.all(jobs);\n    S.saveState=res.every(Boolean)?'saved':'error';\n  }while(S.again&&S.saveState!=='error');\n  S.saving=false;\n  S.dirty=S.dirtyC||S.dirtyP;\n  paintSave();\n}\n/* Дожидается, пока все правки уйдут на сервер (нужно перед загрузкой фото). */\nasync function flushSave(){\n  clearTimeout(saveT);\n  while(S.saving)await waitMs(80);\n  if(S.dirtyC||S.dirtyP)await doSave();\n}\nfunction applyOrder(o,stats){\n  if(!o)return;\n  const upd=list=>list.map(x=>x.id===o.id?Object.assign({},x,o):x);\n  S.allOrders=upd(S.allOrders);S.myOrders=upd(S.myOrders);\n  if(stats)S.stats=stats;\n  renderNav();\n  if(S.view==='seller'&&S.sellerTab==='orders')paintSeller();\n  else if(S.view==='mine')renderMine();\n}\nasync function setStatus(id,to){\n  const r=await api('POST','/api/admin/status',{id,to});\n  if(!r.ok){\n    toast(L('Не удалось обновить статус','Holatni yangilab boʻlmadi'));\n    if(r.data&&r.data.order)applyOrder(r.data.order,r.data.stats);\n    return;\n  }\n  applyOrder(r.data.order,r.data.stats);\n  loadStock();   // выдача списывает товар, отмена возвращает\n}\n/* «Повторить заказ»: кладёт в корзину всё из прошлого заказа, что сейчас есть в продаже (по сегодняшним ценам и остаткам). */\nfunction repeatOrder(id){\n  const o=S.myOrders.find(x=>x.id===id);\n  if(!o)return;\n  let added=0,cut=0;const skipped=[];\n  (o.items||[]).forEach(it=>{\n    const p=S.prod.items.find(x=>x.id===it.id),qty=Number(it.qty)||0;\n    if(!p||soldOut(p)||qty<1){skipped.push(nm(it));return}\n    const cur=S.cart[p.id]||0;\n    if(!cur&&cartLines().length>=MAX_LINES){skipped.push(nm(it));return}\n    const want=Math.min(MAX_QTY,cur+qty),cap=maxQty(p),got=Math.min(want,cap);\n    if(got<want)cut++;\n    if(got>cur){S.cart[p.id]=got;added++}\n  });\n  saveCart();\n  if(!added){toast(L('Этих товаров сейчас нет в наличии','Bu mahsulotlar hozir mavjud emas'));return}\n  S.shopPlaced=null;S.shopStep='cart';\n  go('shop');\n  toast(L('Товары из заказа '+id+' добавлены в корзину. Проверьте количество и цены.','Buyurtma '+id+' mahsulotlari savatga qoʻshildi. Miqdor va narxlarni tekshiring.')\n    +(skipped.length?L(' Нет в наличии: ',' Mavjud emas: ')+skipped.slice(0,3).join(', ')+(skipped.length>3?'…':'')+'.':'')\n    +(cut?L(' Количество уменьшено по остатку.',' Miqdor qoldiqqa qarab kamaytirildi.'):''));\n}\nasync function cancelMine(id){\n  const r=await api('POST','/api/cancel',{id});\n  if(!r.ok){\n    toast(L('Не удалось отменить: продавец уже принял заказ. Напишите ему.','Bekor qilib boʻlmadi: sotuvchi buyurtmani qabul qilgan. Unga yozing.'));\n    if(r.data&&r.data.order)applyOrder(r.data.order);\n    return;\n  }\n  applyOrder(r.data.order);\n}\n\n/* ---------- views ---------- */\nfunction render(){\n  renderNav();\n  if(S.view==='shop')renderShop();\n  else if(S.view==='mine')renderMine();\n  else if(S.view==='profile')renderProfile();\n  else renderSeller();\n}\nfunction go(v){\n  S.view=v;S.cc=null;\n  render();window.scrollTo(0,0);\n  if(v==='mine')loadMine();\n  if(v==='shop')loadCfg();\n  if(v==='seller')loadAdmin();\n}\n/* поле количества потеряло фокус: пустое или 0 убирает товар, слишком большое число обрезается */\nfunction qtyDone(t){\n  const id=t.dataset.qty,cur=S.cart[id]||0;\n  let v=Math.floor(Number(t.value));\n  if(!isFinite(v)||v<1)v=0;\n  v=cartSet(id,v);   // обрезает до остатка и сохраняет\n  if(!v){\n    if(!cartCount()){S.shopStep='list';renderShop();renderNav();return}\n    if(S.shopStep==='cart'){paintCartLines();paintShopBar();renderNav()}else paintShopCtl(id);\n    return;\n  }\n  t.value=String(v);\n  if(cur!==v)refreshTotals(id);\n}\n\n/* ---------- events ---------- */\ndocument.addEventListener('click',e=>{\n  const t=e.target.closest('[data-act]');\n  if(!t||t.disabled)return;\n  const a=t.dataset.act;\n  if(a==='lang')switchLang();\n  else if(a==='nav'){\n    if(t.dataset.v==='shop'&&S.view!=='shop'){S.shopPlaced=null;S.shopStep='list'}\n    go(t.dataset.v);\n  }\n  else if(a==='submitorder')submitOrder();\n  else if(a==='mode'){\n    S.form.mode=t.dataset.v==='delivery'?'delivery':'pickup';saveForm();\n    renderCart();\n  }\n  else if(a==='scat'){S.shopCat=t.dataset.id;renderShop()}\n  else if(a==='fav')toggleFav(t.dataset.id);\n  else if(a==='pdesc')t.classList.toggle('open');\n  else if(a==='padd'||a==='pplus'||a==='pminus'){\n    const id=t.dataset.id,cur=S.cart[id]||0;\n    if(a==='padd'&&!cur&&cartLines().length>=MAX_LINES){toast(L('В корзине не больше '+MAX_LINES+' разных товаров','Savatda '+MAX_LINES+' tadan ortiq turli mahsulot boʻlmaydi'));return}\n    cartSet(id,a==='pminus'?cur-1:cur+1);\n    paintShopCtl(id);\n  }\n  else if(a==='ppack'||a==='cpack'){\n    const id=t.dataset.id,p=S.prod.items.find(x=>x.id===id),size=p?packSize(p,t.dataset.k):0,cur=S.cart[id]||0;\n    if(!p||!size)return;\n    if(!cur&&cartLines().length>=MAX_LINES){toast(L('В корзине не больше '+MAX_LINES+' разных товаров','Savatda '+MAX_LINES+' tadan ortiq turli mahsulot boʻlmaydi'));return}\n    cartSet(id,cur+size);\n    if(a==='ppack')paintShopCtl(id);\n    else{paintCartLines();paintShopBar();renderNav()}\n  }\n  else if(a==='cplus'||a==='cminus'){\n    const id=t.dataset.id,cur=S.cart[id]||0;\n    cartSet(id,a==='cminus'?cur-1:cur+1);\n    if(!cartCount()){S.shopStep='list';renderShop();renderNav();return}\n    paintCartLines();\n    paintShopBar();renderNav();\n  }\n  else if(a==='opencart'){S.shopStep='cart';renderShop();window.scrollTo(0,0)}\n  else if(a==='shoplist'){S.shopStep='list';renderShop();window.scrollTo(0,0)}\n  else if(a==='shopagain'){S.shopPlaced=null;S.shopStep='list';renderShop();window.scrollTo(0,0)}\n  else if(a==='cadd'){\n    if(S.prod.cats.length>=MAX_CATS){toast(L('Больше '+MAX_CATS+' категорий нельзя',MAX_CATS+' tadan ortiq kategoriya boʻlmaydi'));return}\n    const c={id:'c'+Math.random().toString(36).slice(2,8),name:L('Новая категория','Yangi kategoriya'),uz:'Yangi kategoriya'};\n    S.prod.cats.push(c);queueSave('prod');paintSeller();\n    const inp=document.querySelector('[data-cid=\"'+c.id+'\"][data-cp=\"name\"]');if(inp){inp.focus();inp.select()}\n  }\n  else if(a==='cdel'){\n    const id=t.dataset.id;\n    if(S.prod.items.some(p=>p.cat===id)){toast(L('В категории есть товары. Сначала перенесите или удалите их.','Kategoriyada mahsulotlar bor. Avval ularni koʻchiring yoki oʻchiring.'));return}\n    S.prod.cats=S.prod.cats.filter(c=>c.id!==id);queueSave('prod');paintSeller();\n  }\n  else if(a==='pfilter'){S.pfilter=t.dataset.id;paintSeller()}\n  else if(a==='pnew'){\n    if(!S.prod.cats.length){toast(L('Сначала создайте категорию','Avval kategoriya yarating'));return}\n    if(S.prod.items.length>=MAX_ITEMS){toast(L('Больше '+MAX_ITEMS+' товаров нельзя',MAX_ITEMS+' tadan ortiq mahsulot boʻlmaydi'));return}\n    const cat=S.pfilter!=='all'?S.pfilter:S.prod.cats[0].id;\n    const p={id:'p'+Math.random().toString(36).slice(2,9),cat,name:L('Новый товар','Yangi mahsulot'),uz:'Yangi mahsulot',desc:'',descUz:'',amount:0,unit:'g',price:0,on:true,tag:'',old:0,pv:'',tiers:[],blk:0,box:0};\n    S.prod.items.push(p);queueSave('prod');paintSeller();\n    const inp=document.getElementById('pname-'+p.id);\n    if(inp){inp.focus();inp.select();try{inp.scrollIntoView({block:'center'})}catch(x){}}\n  }\n  else if(a==='pdel'){\n    const id=t.dataset.id;\n    if(S.cd===id){\n      S.cd=null;\n      S.prod.items=S.prod.items.filter(p=>p.id!==id);delete S.cart[id];delete S.stk[id];saveCart();\n      queueSave('prod');paintSeller();\n    }else{\n      S.cd=id;t.textContent=L('Точно удалить?','Aniq oʻchirilsinmi?');\n      setTimeout(()=>{if(S.cd===id){S.cd=null;t.textContent=L('Удалить товар','Mahsulotni oʻchirish')}},4000);\n    }\n  }\n  else if(a==='pmove'){\n    const id=t.dataset.id,d=Number(t.dataset.d)||0,arr=S.prod.items;\n    const vis=arr.map((p,i)=>i).filter(i=>S.pfilter==='all'||arr[i].cat===S.pfilter);\n    const pos=vis.indexOf(arr.findIndex(p=>p.id===id)),to=pos+d;\n    if(pos<0||to<0||to>=vis.length)return;\n    const a1=vis[pos],b1=vis[to],tmp=arr[a1];arr[a1]=arr[b1];arr[b1]=tmp;\n    queueSave('prod');paintSeller();\n    const row=document.getElementById('prow-'+id);if(row)try{row.scrollIntoView({block:'center'})}catch(x){}\n  }\n  else if(a==='phdel')removePhoto(t.dataset.id);\n  else if(a==='copy'){\n    const v=t.dataset.v||'';\n    const lab=L('Номер: ','Raqam: ')+v;\n    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(()=>toast(L('Номер скопирован','Raqam nusxalandi')),()=>toast(lab));\n    else toast(lab);\n  }\n  else if(a==='stab'){\n    S.sellerTab=t.dataset.t;S.sc=null;\n    document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',String(x.dataset.t===S.sellerTab)));\n    try{t.scrollIntoView({block:'nearest',inline:'nearest'})}catch(x){}\n    paintSeller();\n    if(S.sellerTab==='stock'){loadStock();if(S.jrOpen)loadJournal()}\n    if(S.sellerTab==='clients')loadClients();\n    if(S.sellerTab==='reports')loadReport();\n  }\n  else if(a==='rdays'){const v=Number(t.dataset.v);if(RP_DAYS.includes(v)&&v!==S.rep.days){S.rep.days=v;S.rep.sel=-1;S.rep.hov=-1;S.rep.allP=false;loadReport()}}\n  else if(a==='rsel'){if(Date.now()-S.rep.skip<400)return;const i=Number(t.dataset.i);S.rep.sel=S.rep.sel===i?-1:i;S.rep.hov=-1;repShow(S.rep.sel)}\n  else if(a==='rtab'){S.rep.tab=!S.rep.tab;paintRep()}\n  else if(a==='rall'){S.rep.allP=!S.rep.allP;paintRep()}\n  else if(a==='rretry')loadReport();\n  else if(a==='sfilter'){S.sfilter=t.dataset.v;paintStock()}\n  else if(a==='sjr'){S.jrOpen=!S.jrOpen;paintStock();if(S.jrOpen)loadJournal()}\n  else if(a==='sin'||a==='sset'){\n    const id=t.dataset.id,n=stockNum(id,'sn',a==='sin'?1:0);\n    if(n===null)return;\n    const body={op:a==='sin'?'in':'set',n},u=stockUnit(id),pr=S.prod.items.find(x=>x.id===id);\n    if(u)body.u=u;\n    const pcs=u&&pr?n*packSize(pr,u):0,ex=pcs?' ('+(a==='sin'?'+':'= ')+pcs+' '+pcsWord()+')':'';\n    stockDo(id,body,(a==='sin'?L('Приход записан','Kirim yozildi'):L('Остаток исправлен','Qoldiq tuzatildi'))+ex);\n  }\n  else if(a==='sstart'){\n    const id=t.dataset.id,n=stockNum(id,'sn',0);\n    if(n===null)return;\n    const body={op:'set',n},u=stockUnit(id);\n    if(u)body.u=u;\n    const lw=document.getElementById('sl-'+id),raw=lw?String(lw.value).trim():'';\n    if(raw!==''){\n      const v=Number(raw);\n      if(!Number.isInteger(v)||v<0||v>1000000){toast(L('Порог — целое число, 0 или больше','Chegara — butun son (0 yoki koʻp)'));lw.focus();return}\n      body.low=v;\n    }\n    stockDo(id,body,L('Учёт начат','Hisob boshlandi'));\n  }\n  else if(a==='soff'){\n    const id=t.dataset.id;\n    if(S.sc===id){S.sc=null;stockDo(id,{op:'off'},L('Учёт отключён','Hisob oʻchirildi'))}\n    else{\n      S.sc=id;paintStockRow(id);\n      setTimeout(()=>{if(S.sc===id){S.sc=null;paintStockRow(id)}},4000);\n    }\n  }\n  else if(a==='cfilter'){S.cg=t.dataset.v;paintClientList()}\n  else if(a==='copen')toggleClient(Number(t.dataset.id));\n  else if(a==='csave')saveClient(Number(t.dataset.id));\n  else if(a==='cgrp'){const el=document.getElementById('ce-grp');if(el){el.value=t.dataset.v;el.focus()}}\n  else if(a==='cldel'){\n    const uid=Number(t.dataset.id);\n    if(S.cDel===uid){S.cDel=null;deleteClient(uid)}\n    else{\n      S.cDel=uid;t.textContent=L('Точно удалить из базы?','Bazadan aniq oʻchirilsinmi?');\n      setTimeout(()=>{if(S.cDel===uid){S.cDel=null;t.textContent=L('Удалить из базы','Bazadan oʻchirish')}},4000);\n    }\n  }\n  else if(a==='pmenu'){S.pm=!S.pm;paintSeller()}\n  else if(a==='impapply')impApply();\n  else if(a==='impcancel'){S.imp=null;paintSeller()}\n  else if(a==='pick')openPick(t.dataset.day?{day:t.dataset.day}:{});\n  else if(a==='pick1')openPick({ids:[t.dataset.id]});\n  else if(a==='pclose')closePick();\n  else if(a==='pprint')printPick();\n  else if(a==='xport')doExport(t.dataset.k,t.dataset.k==='report'?{days:S.rep.days}:undefined);\n  else if(a==='xpick'){if(S.pick)doExport('pick',S.pick.body)}\n  else if(a==='pfsave')saveProfile();\n  else if(a==='repeat')repeatOrder(t.dataset.id);\n  else if(a==='addr'){\n    const x=S.profile&&S.profile.addrs[Number(t.dataset.i)];\n    if(!x)return;\n    S.form.address=x;saveForm();\n    const ta=$('#f-address');\n    if(ta){ta.value=x;ta.setAttribute('aria-invalid','false')}\n    const er=$('#e-address');if(er)er.textContent='';\n    markAddr();\n  }\n  else if(a==='filter'){S.filter=t.dataset.v;paintSeller()}\n  else if(a==='status'){setStatus(t.dataset.id,t.dataset.to)}\n  else if(a==='contact'){try{if(S.tg&&S.initData&&S.tg.openTelegramLink){e.preventDefault();S.tg.openTelegramLink(t.href)}}catch(err){}}\n  else if(a==='scancel'||a==='mycancel'){\n    const id=t.dataset.id;\n    if(S.cc===id){\n      S.cc=null;\n      if(a==='scancel')setStatus(id,'cancelled');\n      else cancelMine(id);\n    }else{\n      S.cc=id;\n      if(S.view==='seller')paintSeller();else renderMine();\n      setTimeout(()=>{if(S.cc===id){S.cc=null;if(S.view==='seller')paintSeller();else if(S.view==='mine')renderMine()}},4000);\n    }\n  }\n});\ndocument.addEventListener('input',e=>{\n  const t=e.target;\n  if(t.id==='q'){S.q=t.value;paintGrid()}\n  else if(t.id==='cq'){S.cq=t.value;paintClientList()}\n  else if(t.dataset.qty!==undefined){\n    /* количество вводят с клавиатуры: пока клиент печатает, обновляем только суммы */\n    const id=t.dataset.qty;let v=Math.floor(Number(t.value));\n    if(!isFinite(v)||v<1)return;\n    const w=cartSet(id,v);\n    if(w!==v)t.value=String(w);\n    if(!w){qtyDone(t);return}\n    refreshTotals(id);\n  }\n  else if(t.dataset.f){\n    const f=t.dataset.f;S.form[f]=t.value;\n    if(f==='date')fillTimes();\n    if(f==='name'||f==='phone'||f==='address')saveForm();\n    if(f==='address')markAddr();\n    const er=$('#e-'+f);if(er&&er.textContent){er.textContent='';t.setAttribute('aria-invalid','false')}\n  }\n  else if(t.dataset.pid!==undefined){\n    const p=S.prod.items.find(x=>x.id===t.dataset.pid),k=t.dataset.pp;\n    if(!p)return;\n    if(k==='on'){p.on=t.checked;const row=t.closest('.prow');if(row)row.classList.toggle('off',!t.checked)}\n    else if(k==='amount'||k==='price'||k==='old'){const v=Number(t.value);p[k]=isFinite(v)&&v>=0?v:0;if(k==='price')syncTiers(p)}\n    else if(k==='blk'||k==='box'){const v=Math.round(Number(t.value));p[k]=v>=2&&v<=500?v:0}\n    else if(k==='tn'||k==='tp')syncTiers(p);\n    else p[k]=t.value;\n    queueSave('prod');\n  }\n  else if(t.dataset.cid!==undefined){\n    const c=S.prod.cats.find(x=>x.id===t.dataset.cid);\n    if(!c)return;\n    c[t.dataset.cp]=t.value;\n    queueSave('prod');\n  }\n  else if(t.dataset.sd!==undefined)syncDisc();\n  else if(t.dataset.s){\n    const k=t.dataset.s;\n    if(k==='delivery')S.cfg.shop.delivery=t.checked;\n    else if(['leadHours','deliveryLeadHours','openFrom','openTo','minOrder','deliveryFee','freeDeliveryFrom'].includes(k)){const v=Number(t.value);S.cfg.shop[k]=isFinite(v)&&v>=0?v:0}\n    else S.cfg.shop[k]=t.value;\n    if(k==='name'){$('#brandName').textContent=t.value||DEFAULT.shop.name;document.title=t.value||DEFAULT.shop.name}\n    queueSave();\n  }\n});\n\ndocument.addEventListener('change',e=>{\n  const t=e.target;\n  if(t&&t.type==='file'&&t.dataset.imp){\n    const f=t.files&&t.files[0];\n    if(f)importFile(f);\n    try{t.value=''}catch(x){}\n  }\n  else if(t&&t.type==='file'&&t.dataset.photo){\n    const f=t.files&&t.files[0];\n    if(f)uploadPhoto(t.dataset.photo,f);\n    try{t.value=''}catch(x){}\n  }\n  else if(t&&t.dataset&&t.dataset.qty!==undefined)qtyDone(t);\n  else if(t&&t.dataset&&t.dataset.sl!==undefined){\n    /* порог «мало» у товара, по которому уже ведётся учёт, сохраняется сразу */\n    const id=t.dataset.sl,s=S.stk[id];\n    if(!s)return;\n    const raw=String(t.value).trim(),v=Number(raw);\n    if(raw===''||!Number.isInteger(v)||v<0||v>1000000){toast(L('Порог — целое число, 0 или больше','Chegara — butun son (0 yoki koʻp)'));t.value=String(s.low);return}\n    if(v!==s.low)stockDo(id,{op:'low',n:v},L('Порог сохранён','Chegara saqlandi'),true);\n  }\n});\n/* картинка не загрузилась: оставляем заглушку */\ndocument.addEventListener('error',e=>{\n  const t=e.target;\n  if(t&&t.tagName==='IMG'&&t.closest('.pimg,.cth,.pthumb,.th')){\n    const ph=document.createElement('span');ph.className='ph';ph.textContent='📦';ph.setAttribute('aria-hidden','true');\n    t.replaceWith(ph);\n  }\n},true);\n\n/* ---------- network ---------- */\nasync function api(method,path,body){\n  try{\n    const h={'content-type':'application/json'};\n    if(S.initData)h['x-init-data']=S.initData;\n    const r=await fetch(path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\nasync function loadMine(){\n  if(!S.auth)return;\n  const r=await api('GET','/api/my-orders');\n  if(!r.ok||!r.data)return;\n  if(JSON.stringify(r.data.orders)===JSON.stringify(S.myOrders))return;\n  S.myOrders=r.data.orders;renderNav();\n  if(S.view==='mine')renderMine();\n}\nasync function loadAdmin(){\n  if(!S.admin)return;\n  loadStock();\n  if(S.sellerTab==='clients')loadClients();\n  const r=await api('GET','/api/admin/orders');\n  if(!r.ok||!r.data)return;\n  if(JSON.stringify(r.data.orders)===JSON.stringify(S.allOrders)&&JSON.stringify(r.data.stats)===JSON.stringify(S.stats))return;\n  S.allOrders=r.data.orders;S.stats=r.data.stats;renderNav();\n  if(S.view==='seller'&&S.sellerTab==='orders')paintSeller();\n}\nasync function loadCfg(){\n  if(S.dirty||S.saving||!S.ready)return;\n  const r=await api('GET','/api/config');\n  if(!r.ok||!r.data)return;\n  const next=mergeCfg(r.data.cfg),nextP=normProd(r.data.prod);\n  if(JSON.stringify(next)===JSON.stringify(S.cfg)&&JSON.stringify(nextP)===JSON.stringify(S.prod))return;\n  const ae=document.activeElement;\n  if(S.view==='shop'&&ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))return;\n  S.cfg=next;S.prod=nextP;normalizeMode();\n  const pruned=pruneCart();\n  renderNav();\n  if(S.view==='shop'&&!S.shopPlaced){\n    if(S.shopStep==='cart'&&!cartCount())S.shopStep='list';\n    renderShop();\n    if(pruned)toast(L('Остатки изменились, мы обновили корзину','Qoldiq oʻzgardi, savatni yangiladik'));\n  }\n}\nfunction applyTheme(){\n  try{\n    const cs=S.tg&&S.tg.colorScheme;\n    if(cs==='dark'||cs==='light')document.documentElement.setAttribute('data-theme',cs);\n    const dark=cs?cs==='dark':window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;\n    const bg=dark?'#0E1614':'#F3F7F6';\n    if(S.tg&&S.tg.setHeaderColor){S.tg.setHeaderColor(bg);S.tg.setBackgroundColor(bg)}\n  }catch(e){}\n}\nlet tickN=0;\nfunction tick(){\n  if(document.visibilityState==='hidden'||!S.ready)return;\n  tickN++;\n  if(S.auth&&S.view==='mine')loadMine();\n  if(S.admin&&(S.view==='seller'||tickN%2===0))loadAdmin();\n  if(tickN%4===0)loadCfg();\n}\n(async function init(){\n  const tg=window.Telegram&&window.Telegram.WebApp;\n  if(tg){\n    S.tg=tg;\n    if(tg.initData)S.initData=tg.initData;\n    try{tg.ready();tg.expand();if(tg.onEvent)tg.onEvent('themeChanged',applyTheme)}catch(e){}\n  }\n  initLang();applyTheme();\n  renderNav();\n  view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Загружаем каталог','Katalog yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div></div>';\n  if(S.initData){\n    const r=await api('GET','/api/bootstrap');\n    if(r.ok&&r.data){\n      S.auth=true;S.uid=r.data.me.id;S.admin=!!r.data.me.admin;\n      S.cfg=mergeCfg(r.data.cfg);S.prod=normProd(r.data.prod);S.myOrders=r.data.orders||[];\n      S.profile=r.data.me.profile||null;S.blocked=!!r.data.me.blocked;S.fav=Array.isArray(r.data.me.fav)?r.data.me.fav:[];\n    }else S.authErr=(r.data&&r.data.error)||'net';\n  }\n  if(!S.auth){\n    const r=await api('GET','/api/config');\n    if(r.ok&&r.data){S.cfg=mergeCfg(r.data.cfg);S.prod=normProd(r.data.prod)}\n  }\n  loadCart();pruneCart();loadForm();applyProfile();normalizeMode();\n  S.ready=true;\n  render();\n  if(S.admin)loadAdmin();\n  setInterval(tick,15000);\n  document.addEventListener('visibilitychange',()=>{\n    if(document.visibilityState!=='visible')return;\n    loadCfg();loadMine();loadAdmin();\n  });\n})();\n</script>\n</body></html>\n";

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
const MAX_CLIENTS = 3000;     // клиентов в базе
const MAX_ADDRS = 5;
const MAX_FAV = 100;          // товаров в избранном у одного клиента          // адресов доставки у одного клиента
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
  s.minOrder = Math.round(clampN(s.minOrder, 0, 1e9, 0));
  s.deliveryFee = Math.round(clampN(s.deliveryFee, 0, 1e9, 0));
  s.freeDeliveryFrom = Math.round(clampN(s.freeDeliveryFrom, 0, 1e9, 0));
  s.discounts = cleanDiscounts(s.discounts);
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
/* Штук в блоке или коробке: 0 (нет такой упаковки) или от 2 до 500. */
const cleanPack = v => { const n = Math.round(Number(v)); return n >= 2 && n <= MAX_QTY ? n : 0; };
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
    const price = Math.round(clampN(o.price, 0, 1e8, 0));
    items.push({
      id,
      cat: cats.some(c => c.id === o.cat) ? o.cat : (cats[0] ? cats[0].id : ''),
      name: cleanStr(o.name, 60) || 'Без названия',
      uz: cleanStr(o.uz, 60),
      desc: cleanStr(o.desc, 300, true),
      descUz: cleanStr(o.descUz, 300, true),
      amount: Math.round(clampN(o.amount, 0, 100000, 0) * 1000) / 1000,
      unit: UNIT_IDS.includes(o.unit) ? o.unit : 'g',
      price,
      tiers: cleanTiers(o.tiers, price),
      blk: cleanPack(o.blk),
      box: cleanPack(o.box),
      on: o.on !== false,
      tag: o.tag === 'sale' || o.tag === 'new' ? o.tag : '',
      old: o.tag === 'sale' ? Math.round(clampN(o.old, 0, 1e8, 0)) : 0,
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
    const price = unitPrice(it, qty);    // цена за штуку с учётом ступеней: считает только сервер
    const line = { id: it.id, name: it.name, uz: it.uz || '', amount: it.amount, unit: it.unit, price, qty };
    if (packSize(it, 'box')) line.box = packSize(it, 'box');
    if (packSize(it, 'blk')) line.blk = packSize(it, 'blk');
    items.push(line);
    total += price * qty;
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
  // минимальная сумма и порог бесплатной доставки считаются по товарам до скидки, доставка к ним не прибавляется
  const min = Number(cfg.shop.minOrder) || 0;
  if (min > 0 && total < min) return { err: 'min_order', min };
  const fee = deliveryFee(cfg, fm.mode, total);
  const dc = orderDiscount(cfg, total);
  return { items, sub: total, disc: dc.amount, dpct: dc.pct, fee, total: total - dc.amount + fee, name: fm.name, phone: fm.phone, comment: fm.comment, mode: fm.mode, address: fm.address, pickupAt: fm.pickupAt };
}

const publicOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.tg; delete x.msgs; delete x.rs; return x; };
const adminOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.msgs; delete x.rs; return x; };

/* ---------- клиентская база ---------- */
const phoneOk = p => { const d = p.replace(/\D/g, '').length; return d >= 9 && d <= 15; };
const newClient = (uid, since) => ({ uid, name: '', phone: '', org: '', addrs: [], note: '', grp: '', blocked: false, since: since || new Date().toISOString(), last: '', n: 0, ds: 0, sum: 0, tg: { username: '', name: '' }, lang: '' });
/* то, что клиент видит о себе: заметка, группа и блокировка остаются у продавца */
const clientPublic = c => c ? { name: c.name, phone: c.phone, org: c.org, addrs: c.addrs } : null;
const sameAddr = (a, b) => a.toLowerCase() === b.toLowerCase();
/* Поля клиента из запроса. Приходит только то, что меняют; admin разрешает ещё заметку, группу и блокировку. */
function cleanClient(b, admin) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return { err: 'bad_request' };
  const v = {};
  for (const k of ['name', 'phone', 'org']) if (b[k] !== undefined && typeof b[k] !== 'string') return { err: 'bad_request' };
  if (b.name !== undefined) v.name = cleanStr(b.name, 60);
  if (b.phone !== undefined) { v.phone = cleanStr(b.phone, 25); if (v.phone && !phoneOk(v.phone)) return { err: 'bad_phone' }; }
  if (b.org !== undefined) v.org = cleanStr(b.org, 80);
  if (b.addrs !== undefined) {
    if (!Array.isArray(b.addrs) || b.addrs.length > 30) return { err: 'bad_request' };
    const out = [];
    for (const a of b.addrs) {
      if (typeof a !== 'string') return { err: 'bad_request' };
      const x = cleanStr(a, 200);
      if (!x) continue;
      if (x.length < 5) return { err: 'bad_addr' };
      if (!out.some(y => sameAddr(x, y))) out.push(x);
    }
    if (out.length > MAX_ADDRS) return { err: 'too_many_addrs' };
    v.addrs = out;
  }
  if (admin) {
    if (b.note !== undefined) { if (typeof b.note !== 'string') return { err: 'bad_request' }; v.note = cleanStr(b.note, 500, true); }
    if (b.grp !== undefined) { if (typeof b.grp !== 'string') return { err: 'bad_request' }; v.grp = cleanStr(b.grp, 30); }
    if (b.blocked !== undefined) v.blocked = b.blocked === true;
  }
  return { v };
}
/* Строки о клиенте для карточки продавца в Telegram: группа и заметка. */
function clientLines(cl) {
  if (!cl) return '';
  const p = [];
  if (cl.grp) p.push('👥 Группа: ' + cl.grp);
  if (cl.note) p.push('📝 Заметка: ' + cl.note);
  return p.join('\n');
}

/* ---------- тексты для Telegram ---------- */
const STATUS_ICON = { new: '🆕', accepted: '🛠', ready: '✅', done: '📦', cancelled: '❌' };

function adminCard(o, shop, origin, confirm, cl) {
  setLang('ru');
  const who = o.tg && o.tg.username ? '@' + o.tg.username : 'без username';
  const cLines = clientLines(cl);
  const tail = '\n\n' + (cLines ? cLines + '\n' : '') + 'Telegram: ' + who + (o.tg && o.tg.name ? ' (' + o.tg.name + ')' : '')
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

/* ---------- выгрузки: Excel, сборочный лист, резервная копия ---------- */
const PICK_MAX = 100;                  // заказов в одном сборочном листе
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const BACKUP_PHOTO_BUDGET = 20000000;  // сколько байт фото кладём в резервную копию (Telegram принимает файл до 50 МБ)

/* ZIP без сжатия: хватает для xlsx и резервной копии, а кода почти нет. files: [{name, data: Uint8Array}] */
const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(u) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u.length; i++) c = CRC_T[(c ^ u[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function zipStore(files) {
  const now = new Date();
  const dosT = (now.getUTCHours() << 11) | (now.getUTCMinutes() << 5) | (now.getUTCSeconds() >> 1);
  const dosD = ((Math.max(1980, now.getUTCFullYear()) - 1980) << 9) | ((now.getUTCMonth() + 1) << 5) | now.getUTCDate();
  const ents = files.map(f => ({ nm: enc.encode(f.name), d: f.data, crc: crc32(f.data) }));
  let size = 22;
  ents.forEach(e => { size += 30 + e.nm.length + e.d.length + 46 + e.nm.length; });
  const out = new Uint8Array(size), dv = new DataView(out.buffer);
  let p = 0;
  const offs = [];
  ents.forEach(e => {
    offs.push(p);
    dv.setUint32(p, 0x04034b50, true); dv.setUint16(p + 4, 20, true); dv.setUint16(p + 6, 0x0800, true); dv.setUint16(p + 8, 0, true);
    dv.setUint16(p + 10, dosT, true); dv.setUint16(p + 12, dosD, true); dv.setUint32(p + 14, e.crc, true);
    dv.setUint32(p + 18, e.d.length, true); dv.setUint32(p + 22, e.d.length, true); dv.setUint16(p + 26, e.nm.length, true); dv.setUint16(p + 28, 0, true);
    out.set(e.nm, p + 30); out.set(e.d, p + 30 + e.nm.length);
    p += 30 + e.nm.length + e.d.length;
  });
  const cd = p;
  ents.forEach((e, i) => {
    dv.setUint32(p, 0x02014b50, true); dv.setUint16(p + 4, 20, true); dv.setUint16(p + 6, 20, true); dv.setUint16(p + 8, 0x0800, true); dv.setUint16(p + 10, 0, true);
    dv.setUint16(p + 12, dosT, true); dv.setUint16(p + 14, dosD, true); dv.setUint32(p + 16, e.crc, true);
    dv.setUint32(p + 20, e.d.length, true); dv.setUint32(p + 24, e.d.length, true); dv.setUint16(p + 28, e.nm.length, true);
    dv.setUint16(p + 30, 0, true); dv.setUint16(p + 32, 0, true); dv.setUint16(p + 34, 0, true); dv.setUint16(p + 36, 0, true); dv.setUint32(p + 38, 0, true);
    dv.setUint32(p + 42, offs[i], true);
    out.set(e.nm, p + 46);
    p += 46 + e.nm.length;
  });
  dv.setUint32(p, 0x06054b50, true); dv.setUint16(p + 4, 0, true); dv.setUint16(p + 6, 0, true);
  dv.setUint16(p + 8, ents.length, true); dv.setUint16(p + 10, ents.length, true);
  dv.setUint32(p + 12, p - cd, true); dv.setUint32(p + 16, cd, true); dv.setUint16(p + 20, 0, true);
  return out;
}

/* Книга Excel (.xlsx). sheets: [{name, w: [ширины столбцов], money: [номера столбцов с суммами], rows: [[заголовки], [ячейки]…]}].
   Текст пишется как есть (inlineStr), поэтому ячейка вида «=1+1» остаётся текстом и формулой не становится. */
const xmlEsc = s => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const colName = i => { let s = ''; for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s; return s; };
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
function sheetXml(sh) {
  let x = XML_HEAD + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>'
    + sh.w.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') + '</cols><sheetData>';
  sh.rows.forEach((r, ri) => {
    x += '<row r="' + (ri + 1) + '">';
    r.forEach((v, ci) => {
      if (v === null || v === undefined || v === '') return;
      const ref = colName(ci) + (ri + 1);
      if (ri > 0 && typeof v === 'number' && Number.isFinite(v)) x += '<c r="' + ref + '" s="' + ((sh.money || []).includes(ci) ? 2 : 0) + '"><v>' + v + '</v></c>';
      else x += '<c r="' + ref + '"' + (ri === 0 ? ' s="1"' : '') + ' t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(v) + '</t></is></c>';
    });
    x += '</row>';
  });
  x += '</sheetData>';
  if (sh.rows.length > 1 && !sh.plain) x += '<autoFilter ref="A1:' + colName(sh.w.length - 1) + sh.rows.length + '"/>';
  return x + '</worksheet>';
}
function xlsxBuild(sheets) {
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', RN = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const files = [];
  const add = (name, text) => files.push({ name, data: enc.encode(text) });
  add('[Content_Types].xml', XML_HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
    + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
    + sheets.map((s, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')
    + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
  add('_rels/.rels', XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + RN + '/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  add('xl/workbook.xml', XML_HEAD + '<workbook xmlns="' + NS + '" xmlns:r="' + RN + '"><sheets>'
    + sheets.map((s, i) => '<sheet name="' + xmlEsc(s.name.replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets></workbook>');
  add('xl/_rels/workbook.xml.rels', XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + sheets.map((s, i) => '<Relationship Id="rId' + (i + 1) + '" Type="' + RN + '/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join('')
    + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="' + RN + '/styles" Target="styles.xml"/></Relationships>');
  add('xl/styles.xml', XML_HEAD + '<styleSheet xmlns="' + NS + '"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
    + '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9F0EC"/><bgColor indexed="64"/></patternFill></fill></fills>'
    + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    + '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>'
    + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>');
  sheets.forEach((s, i) => add('xl/worksheets/sheet' + (i + 1) + '.xml', sheetXml(s)));
  return zipStore(files);
}

/* Время создания заказа хранится по Гринвичу; в выгрузках показываем по часам склада. */
const shopTime = iso => { const t = Date.parse(iso); return isNaN(t) ? '' : new Date(t + SHOP_TZ * 3600000).toISOString().slice(0, 16).replace('T', ' '); };
const WD_RU = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
/* «2026-10-30T14:00» → «30.10.2026 (пт) 14:00» */
function whenRu(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
  if (!m) return String(s || '');
  return m[3] + '.' + m[2] + '.' + m[1] + ' (' + WD_RU[new Date(+m[1], +m[2] - 1, +m[3]).getDay()] + ') ' + m[4];
}

function ordersSheets(orders) {
  setLang('ru');
  const list = orders.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const rows = [['№ заказа', 'Создан', 'Статус', 'Получение', 'Когда', 'Клиент', 'Телефон', 'Организация', 'Telegram', 'Адрес доставки', 'Комментарий', 'Товары, сум', 'Скидка, сум', 'Доставка, сум', 'Итого, сум', 'Позиций']];
  const items = [['№ заказа', 'Статус', 'Когда', 'Клиент', 'Товар', 'Вес / объём', 'Количество', 'В упаковках', 'Цена, сум', 'Сумма, сум']];
  list.forEach(o => {
    const fee = Number(o.fee) || 0, total = Number(o.total) || 0, disc = Number(o.disc) || 0, st = stOf(o.status, o.mode).name, when = String(o.pickupAt || '').replace('T', ' ');
    rows.push([o.id, shopTime(o.createdAt), st, o.mode === 'delivery' ? 'Доставка' : 'Самовывоз', when, o.name || '', o.phone || '', o.org || '',
      o.tg && o.tg.username ? '@' + o.tg.username : '', o.mode === 'delivery' ? (o.address || '') : '', o.comment || '', total - fee + disc, disc, fee, total, (o.items || []).length]);
    (o.items || []).forEach(it => items.push([o.id, st, when, o.name || '', it.name || '', weightLabel(it), Number(it.qty) || 0, packText(it, it.qty), Number(it.price) || 0, (Number(it.price) || 0) * (Number(it.qty) || 0)]));
  });
  return [
    { name: 'Заказы', w: [11, 17, 16, 12, 17, 22, 17, 22, 16, 34, 30, 14, 12, 14, 14, 9], money: [11, 12, 13, 14], rows },
    { name: 'Товары в заказах', w: [11, 16, 17, 22, 32, 13, 12, 20, 14, 14], money: [8, 9], rows: items }
  ];
}
function clientsSheets(clients) {
  const list = clients.slice().sort((a, b) => String(b.last || b.since).localeCompare(String(a.last || a.since)));
  const rows = [['Имя', 'Телефон', 'Организация', 'Группа', 'Адреса доставки', 'Заметка', 'Заказов', 'Завершено', 'Сумма завершённых, сум', 'Клиент с', 'Последний заказ', 'Telegram', 'Язык', 'Заблокирован']];
  list.forEach(c => rows.push([c.name || '', c.phone || '', c.org || '', c.grp || '', (c.addrs || []).join(' | '), c.note || '', Number(c.n) || 0, Number(c.ds) || 0, Number(c.sum) || 0,
    shopTime(c.since), shopTime(c.last), c.tg && c.tg.username ? '@' + c.tg.username : '', c.lang === 'uz' ? 'узбекский' : c.lang === 'ru' ? 'русский' : '', c.blocked ? 'да' : '']));
  return [{ name: 'Клиенты', w: [22, 17, 22, 14, 40, 34, 9, 10, 18, 17, 17, 16, 11, 13], money: [8], rows }];
}

/* Сборочный лист: сверху общий список «что достать со склада» по выбранным заказам, дальше каждый заказ на отдельной странице.
   Бумага всегда белая и по-русски: это рабочий документ продавца, его печатают или открывают на телефоне. */
function pickHtml(orders, shop, prod, cut) {
  setLang('ru');
  const list = orders.slice().sort((a, b) => String(a.pickupAt).localeCompare(String(b.pickupAt)) || String(a.createdAt).localeCompare(String(b.createdAt)));
  const now = shopNow(), stamp = pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '.' + now.getFullYear() + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
  const shopName = (shop && shop.name) || DEFAULT.shop.name;
  const catIx = new Map(prod.cats.map((c, i) => [c.id, i])), itIx = new Map(prod.items.map((p, i) => [p.id, i]));
  const catOf = new Map(prod.items.map(p => [p.id, p.cat]));
  const catName = new Map(prod.cats.map(c => [c.id, c.name]));
  const tr = (cells) => '<tr>' + cells.join('') + '</tr>';
  let h = '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Сборочный лист — ' + esc(shopName) + '</title><style>'
    + '@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;padding:14px;font:15px/1.4 Arial,"Helvetica Neue",sans-serif;color:#111;background:#fff}'
    + 'h1{font-size:20px;margin:0 0 2px}h2{font-size:17px;margin:0 0 6px}h3{font-size:13px;margin:14px 0 2px;color:#444;text-transform:uppercase;letter-spacing:.04em}.sub{color:#555;font-size:13px;margin-bottom:14px}'
    + 'section{margin:0 0 24px}.ord{border-top:3px solid #111;padding-top:10px}.ord+.ord,.sum+.ord{break-before:page;page-break-before:always}'
    + 'table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #bbb;padding:7px 6px;text-align:left;vertical-align:top}th{font-size:12px;color:#555;font-weight:600}'
    + 'td.c,th.c{width:34px;padding-right:0}input[type=checkbox]{width:22px;height:22px;margin:0}td.q,th.q,td.p,th.p,td.s,th.s{text-align:right;white-space:nowrap}td.q{font-size:20px;font-weight:700}'
    + 'small{display:block;color:#555;font-size:12px}tr:has(input:checked) td{color:#888;text-decoration:line-through}tfoot td{border-bottom:0;font-weight:700}'
    + '.id{font-family:"Courier New",monospace;font-size:20px;font-weight:700}.tag{display:inline-block;border:1.5px solid #111;border-radius:6px;padding:0 7px;font-size:13px;font-weight:700;margin-left:6px}'
    + '.row{margin:2px 0}.cm{margin:6px 0;padding:6px 8px;border:1.5px dashed #111;border-radius:6px;font-weight:600}.pay{margin:10px 0 0;font-size:17px}.sign{margin-top:16px;color:#444;font-size:13px}'
    + '.cut{margin:0 0 14px;padding:8px 10px;border:1.5px solid #b3261e;border-radius:6px;color:#b3261e;font-weight:600}'
    + '@media print{body{padding:0}input[type=checkbox]{appearance:none;-webkit-appearance:none;border:1.5px solid #111;border-radius:3px}}'
    + '</style></head><body><h1>Сборочный лист</h1><div class="sub">' + esc(shopName) + ' · сформирован ' + stamp + ' · заказов: ' + list.length + '</div>';
  if (cut > 0) h += '<div class="cut">В лист вошли первые ' + list.length + ' заказов, ещё ' + cut + ' не поместились. Откройте лист ещё раз с фильтром по дате.</div>';
  if (list.length > 1) {
    const agg = new Map();
    list.forEach(o => (o.items || []).forEach(it => {
      let a = agg.get(it.id);
      if (!a) { a = { id: it.id, name: it.name, w: weightLabel(it), qty: 0, n: 0, pk: prod.items.find(x => x.id === it.id) || it }; agg.set(it.id, a); }
      a.qty += Number(it.qty) || 0; a.n += 1;
    }));
    const rows = [...agg.values()].sort((a, b) => {
      const ca = catIx.has(catOf.get(a.id)) ? catIx.get(catOf.get(a.id)) : 1e6, cb = catIx.has(catOf.get(b.id)) ? catIx.get(catOf.get(b.id)) : 1e6;
      if (ca !== cb) return ca - cb;
      const ia = itIx.has(a.id) ? itIx.get(a.id) : 1e6, ib = itIx.has(b.id) ? itIx.get(b.id) : 1e6;
      return ia !== ib ? ia - ib : String(a.name).localeCompare(String(b.name), 'ru');
    });
    h += '<section class="sum"><h2>Всего собрать со склада</h2><table><thead>' + tr(['<th class="c"></th>', '<th>Товар</th>', '<th class="q">Всего</th>', '<th class="p">В заказах</th>']) + '</thead><tbody>';
    let lastCat;
    rows.forEach(a => {
      const cid = catOf.get(a.id), cn = catName.get(cid) || 'Другое';
      if (cn !== lastCat) { h += '<tr><td colspan="4" style="padding:10px 6px 2px;border-bottom:0"><h3 style="margin:0">' + esc(cn) + '</h3></td></tr>'; lastCat = cn; }
      h += tr(['<td class="c"><input type="checkbox"></td>', '<td>' + esc(a.name) + (a.w ? '<small>' + esc(a.w) + '</small>' : '') + '</td>', '<td class="q">' + a.qty + (packText(a.pk, a.qty) ? '<small>' + esc(packText(a.pk, a.qty)) + '</small>' : '') + '</td>', '<td class="p">' + a.n + '</td>']);
    });
    h += '</tbody></table></section>';
  }
  list.forEach(o => {
    const del = o.mode === 'delivery', fee = Number(o.fee) || 0, disc = Number(o.disc) || 0;
    h += '<section class="ord"><h2><span class="id">' + esc(o.id) + '</span><span class="tag">' + (del ? 'Доставка' : 'Самовывоз') + '</span><span class="tag">' + esc(stOf(o.status, o.mode).name) + '</span></h2>'
      + '<div class="row"><b>' + (del ? 'Доставить' : 'Выдать') + ':</b> ' + esc(whenRu(o.pickupAt)) + '</div>'
      + '<div class="row"><b>' + esc(o.name || '') + '</b>' + (o.org ? ' · ' + esc(o.org) : '') + ' · ' + esc(o.phone || '') + '</div>'
      + (del && o.address ? '<div class="row"><b>Адрес:</b> ' + esc(o.address) + '</div>' : '')
      + (o.comment ? '<div class="cm">' + esc(o.comment) + '</div>' : '')
      + '<table><thead>' + tr(['<th class="c"></th>', '<th>Товар</th>', '<th class="q">Кол-во</th>', '<th class="p">Цена</th>', '<th class="s">Сумма</th>']) + '</thead><tbody>';
    (o.items || []).forEach(it => {
      const w = weightLabel(it);
      h += tr(['<td class="c"><input type="checkbox"></td>', '<td>' + esc(it.name) + (w ? '<small>' + esc(w) + '</small>' : '') + '</td>', '<td class="q">' + (Number(it.qty) || 0) + (packText(it, it.qty) ? '<small>' + esc(packText(it, it.qty)) + '</small>' : '') + '</td>', '<td class="p">' + num(it.price) + '</td>', '<td class="s">' + num((Number(it.price) || 0) * (Number(it.qty) || 0)) + '</td>']);
    });
    h += '</tbody><tfoot>' + (disc > 0 ? tr(['<td></td>', '<td colspan="3">Скидка ' + (Number(o.dpct) || 0) + '%</td>', '<td class="s">−' + num(disc) + '</td>']) : '') + (fee > 0 ? tr(['<td></td>', '<td colspan="3">Доставка</td>', '<td class="s">' + num(fee) + '</td>']) : '')
      + tr(['<td></td>', '<td colspan="3">Итого</td>', '<td class="s">' + num(o.total) + '</td>']) + '</tfoot></table>'
      + '<div class="pay">К оплате при получении: <b>' + esc(money(o.total)) + '</b></div><div class="sign">Собрал: ____________ &nbsp; Проверил: ____________</div></section>';
  });
  return h + '</body></html>';
}

/* ---------- прайс из Excel ---------- */
const XL_MAX_FILE = 1000000;   // размер файла с прайсом
const XL_MAX_XML = 8000000;    // сколько байт XML разрешаем распаковать (защита от «архива-бомбы»)
const XL_MAX_ROWS = 1500;      // строк с товарами в файле
class XlErr extends Error { constructor(why) { super(why); this.why = why; } }

async function inflateRaw(u8, limit) {
  const ds = new DecompressionStream('deflate-raw');
  const w = ds.writable.getWriter();
  w.write(u8).then(() => w.close()).catch(() => {});
  const rd = ds.readable.getReader();
  const chunks = [];
  let n = 0;
  for (;;) {
    const { done, value } = await rd.read();
    if (done) break;
    n += value.length;
    if (n > limit) { rd.cancel().catch(() => {}); throw new XlErr('too_big'); }
    chunks.push(value);
  }
  const out = new Uint8Array(n);
  let p = 0;
  chunks.forEach(c => { out.set(c, p); p += c.length; });
  return out;
}
function zipIndex(u) {
  if (u.length < 22) return null;
  const dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
  let e = -1;
  for (let i = u.length - 22; i >= Math.max(0, u.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) return null;
  const n = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  const out = new Map();
  for (let i = 0; i < n; i++) {
    if (p + 46 > u.length || dv.getUint32(p, true) !== 0x02014b50) return null;
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    out.set(new TextDecoder().decode(u.subarray(p + 46, p + 46 + nl)), { method: dv.getUint16(p + 10, true), csize: dv.getUint32(p + 20, true), usize: dv.getUint32(p + 24, true), off: dv.getUint32(p + 42, true) });
    p += 46 + nl + xl + cl;
  }
  return out;
}
async function zipRead(u, ent, limit) {
  if (!ent || ent.usize > limit) throw new XlErr('too_big');
  const dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
  if (ent.off + 30 > u.length || dv.getUint32(ent.off, true) !== 0x04034b50) throw new XlErr('not_xlsx');
  const start = ent.off + 30 + dv.getUint16(ent.off + 26, true) + dv.getUint16(ent.off + 28, true);
  const data = u.subarray(start, start + ent.csize);
  if (ent.method === 0) return data;
  if (ent.method !== 8) throw new XlErr('not_xlsx');
  return inflateRaw(data, limit);
}
function xmlUnesc(s) {
  return String(s).replace(/&(#x[0-9a-fA-F]+|#\d+|lt|gt|amp|quot|apos);/g, (m, g) => {
    if (g === 'lt') return '<'; if (g === 'gt') return '>'; if (g === 'amp') return '&'; if (g === 'quot') return '"'; if (g === 'apos') return "'";
    try { return String.fromCodePoint(g[1] === 'x' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10)); } catch (e) { return ''; }
  });
}
const xmlTexts = body => [...body.matchAll(/<t\b[^>]*?(?:\/>|>([\s\S]*?)<\/t>)/g)].map(x => xmlUnesc(x[1] || '')).join('');
const colIndex = letters => { let n = 0; for (const ch of letters) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };

/* Первый лист книги (или лист «Каталог») → массив строк, в ячейках числа и текст. */
async function xlReadSheet(u) {
  const dec = x => new TextDecoder().decode(x);
  const idx = zipIndex(u);
  if (!idx || !idx.has('xl/workbook.xml')) throw new XlErr('not_xlsx');
  const wb = dec(await zipRead(u, idx.get('xl/workbook.xml'), XL_MAX_XML));
  const sheets = [...wb.matchAll(/<sheet\b([^>]*?)\/?>/g)].map(m => ({ name: xmlUnesc((/\bname="([^"]*)"/.exec(m[1]) || [])[1] || ''), rid: (/\br:id="([^"]*)"/.exec(m[1]) || [])[1] || '' }));
  if (!sheets.length) throw new XlErr('not_xlsx');
  const pick = sheets.find(s => s.name.trim().toLowerCase() === 'каталог') || sheets[0];
  let target = 'worksheets/sheet1.xml';
  if (idx.has('xl/_rels/workbook.xml.rels')) {
    const rels = dec(await zipRead(u, idx.get('xl/_rels/workbook.xml.rels'), XL_MAX_XML));
    for (const m of rels.matchAll(/<Relationship\b([^>]*?)\/?>/g)) {
      if ((/\bId="([^"]*)"/.exec(m[1]) || [])[1] === pick.rid) { target = (/\bTarget="([^"]*)"/.exec(m[1]) || [])[1] || target; break; }
    }
  }
  const sheetPath = target.startsWith('/') ? target.slice(1) : 'xl/' + target;
  if (!idx.has(sheetPath)) throw new XlErr('not_xlsx');
  const shared = [];
  if (idx.has('xl/sharedStrings.xml')) {
    const ss = dec(await zipRead(u, idx.get('xl/sharedStrings.xml'), XL_MAX_XML));
    for (const m of ss.matchAll(/<si\b[^>]*?(?:\/>|>([\s\S]*?)<\/si>)/g)) shared.push(xmlTexts((m[1] || '').replace(/<rPh\b[\s\S]*?<\/rPh>/g, '')));
  }
  const xml = dec(await zipRead(u, idx.get(sheetPath), XL_MAX_XML));
  const rows = [];
  for (const m of xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const ref = /\br="([A-Z]{1,3})(\d+)"/.exec(m[1]);
    if (!ref) continue;
    const ri = Number(ref[2]) - 1, ci = colIndex(ref[1]);
    if (ri < 0 || ri > XL_MAX_ROWS + 20 || ci > 40) continue;
    const t = (/\bt="([^"]*)"/.exec(m[1]) || [])[1] || 'n', body = m[2] || '';
    let v = '';
    if (t === 'inlineStr') v = xmlTexts(body);
    else {
      const vm = /<v>([\s\S]*?)<\/v>/.exec(body);
      if (vm) {
        const raw = xmlUnesc(vm[1]);
        if (t === 's') v = shared[Number(raw)] === undefined ? '' : shared[Number(raw)];
        else if (t === 'e') v = '';
        else if (t === 'b') v = raw === '1' ? 'да' : 'нет';
        else if (t === 'str') v = raw;
        else v = Number.isFinite(Number(raw)) && raw.trim() !== '' ? Number(raw) : raw;
      }
    }
    (rows[ri] || (rows[ri] = []))[ci] = v;
  }
  return Array.from(rows, r => Array.from(r || [], c => c === undefined ? '' : c));
}

/* Названия колонок прайса: сравниваем без регистра, пробелов и знаков. */
const nk = s => String(s == null ? '' : s).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, '');
const XL_COLS = {
  id: ['Код', 'ID', 'Артикул'],
  cat: ['Категория'],
  name: ['Название', 'Наименование', 'Товар', 'Название товара'],
  uz: ['Название (узб.)', 'Название по-узбекски', 'Nomi'],
  desc: ['Описание'],
  descUz: ['Описание (узб.)', 'Описание по-узбекски', 'Tavsif'],
  amount: ['Вес / объём', 'Вес', 'Объём', 'Фасовка'],
  unit: ['Единица', 'Ед.', 'Ед. изм.', 'Единица измерения'],
  price: ['Цена', 'Цена, сум', 'Цена за единицу', 'Цена за единицу, сум'],
  on: ['В наличии', 'Наличие'],
  tag: ['Метка'],
  old: ['Старая цена', 'Старая цена, сум']
};
const XL_KEY = (() => { const m = new Map(); Object.keys(XL_COLS).forEach(k => XL_COLS[k].forEach(a => m.set(nk(a), k))); return m; })();
const XL_UNITS = { 'г': 'g', 'гр': 'g', 'g': 'g', 'кг': 'kg', 'kg': 'kg', 'шт': 'pc', 'dona': 'pc', 'pc': 'pc', 'мл': 'ml', 'ml': 'ml', 'л': 'l', 'l': 'l' };
const XL_YES = ['да', 'yes', '1', 'true', '+', 'есть', 'ha', 'в наличии'], XL_NO = ['нет', 'no', '0', 'false', '-', 'yoq', 'yoʻq', 'нет в наличии'];
const XL_TAGS = { 'акция': 'sale', 'aksiya': 'sale', 'sale': 'sale', 'новинка': 'new', 'yangilik': 'new', 'new': 'new' };
const xlNum = v => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/[\s  ]/g, '').replace(',', '.');
  if (!s || !/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
};

/* Строки листа → список товаров прайса и список ошибок {row, msg}. Пустая ячейка — «не менять», кроме меток и старой цены. */
function xlParse(rows) {
  let hi = -1, map = null;
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const m = {};
    (rows[i] || []).forEach((c, ci) => { const k = XL_KEY.get(nk(c)); if (k && m[k] === undefined) m[k] = ci; });
    if (m.name !== undefined && m.price !== undefined) { hi = i; map = m; break; }
  }
  if (!map) throw new XlErr('no_header');
  const out = [], errors = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const cell = k => { const v = map[k] === undefined ? '' : r[map[k]]; return v === undefined || v === null ? '' : v; };
    const txt = k => { const v = cell(k); return typeof v === 'number' ? String(v) : cleanStr(v === '' ? '' : String(v), 400, true); };
    if (!r.some(c => String(c).trim() !== '')) continue;
    if (out.length + errors.length >= XL_MAX_ROWS) { errors.push({ row: i + 1, msg: 'слишком много строк, остальные пропущены' }); break; }
    const row = i + 1, x = { row };
    const bad = msg => { errors.push({ row, msg }); return null; };
    const name = txt('name');
    if (!name) { bad('нет названия'); continue; }
    if (name.length > 60) { bad('название длиннее 60 знаков'); continue; }
    x.name = name;
    const pv = cell('price');
    const price = String(pv).trim() === '' ? null : xlNum(pv);
    if (price === null || price < 0 || price > 1e8) { bad('цена должна быть числом от 0 до 100 000 000'); continue; }
    x.price = Math.round(price);
    x.id = cleanStr(txt('id'), 24);
    x.cat = cleanStr(txt('cat'), 40);
    if (x.cat.length > 40) { bad('категория длиннее 40 знаков'); continue; }
    if (map.uz !== undefined) { const v = txt('uz'); if (v) { if (v.length > 60) { bad('узбекское название длиннее 60 знаков'); continue; } x.uz = v; } }
    if (map.desc !== undefined) { const v = txt('desc'); if (v) x.desc = v.slice(0, 300); }
    if (map.descUz !== undefined) { const v = txt('descUz'); if (v) x.descUz = v.slice(0, 300); }
    if (map.amount !== undefined && String(cell('amount')).trim() !== '') {
      const a = xlNum(cell('amount'));
      if (a === null || a < 0 || a > 100000) { bad('вес или объём должен быть числом'); continue; }
      x.amount = Math.round(a * 1000) / 1000;
    }
    if (map.unit !== undefined && String(cell('unit')).trim() !== '') {
      const un = XL_UNITS[String(cell('unit')).trim().toLowerCase().replace(/\.$/, '')];
      if (!un) { bad('неизвестная единица (нужны г, кг, шт, мл или л)'); continue; }
      x.unit = un;
    }
    if (map.on !== undefined && String(cell('on')).trim() !== '') {
      const v = String(cell('on')).trim().toLowerCase();
      if (XL_YES.includes(v)) x.on = true; else if (XL_NO.includes(v)) x.on = false;
      else { bad('«В наличии»: нужно «да» или «нет»'); continue; }
    }
    if (map.tag !== undefined) {
      const v = String(cell('tag')).trim().toLowerCase();
      if (!v) x.tag = ''; else if (XL_TAGS[v]) x.tag = XL_TAGS[v]; else { bad('метка: нужно «Акция» или «Новинка»'); continue; }
    }
    if (map.old !== undefined) {
      const ov = cell('old');
      if (String(ov).trim() === '') x.old = 0;
      else { const o = xlNum(ov); if (o === null || o < 0 || o > 1e8) { bad('старая цена должна быть числом'); continue; } x.old = Math.round(o); }
    }
    out.push(x);
  }
  return { rows: out, errors };
}

/* Сравнивает прайс с каталогом. Ничего не удаляет и не трогает фото и остатки. Возвращает новый каталог и список изменений. */
function xlPlan(parsed, prod) {
  const items = prod.items.map(it => Object.assign({}, it)), cats = prod.cats.map(c => Object.assign({}, c));
  const key = s => String(s || '').trim().toLowerCase().replace(/ё/g, 'е');
  const byId = new Map(items.map(i => [i.id, i]));
  const used = new Set(), changes = [], errors = parsed.errors.slice(), newCats = [];
  let same = 0, added = 0;
  const catFor = nameRaw => {
    const nmx = nameRaw || (cats[0] ? null : 'Прочее');
    if (!nmx) return cats[0].id;
    let c = cats.find(x => key(x.name) === key(nmx));
    if (!c) {
      if (cats.length >= MAX_CATS) return null;
      c = { id: 'c' + randId(5), name: nmx, uz: '' };
      while (cats.some(x => x.id === c.id)) c.id = 'c' + randId(5);
      cats.push(c); newCats.push(c.name);
    }
    return c.id;
  };
  const catName = id => (cats.find(c => c.id === id) || {}).name || '';
  for (const r of parsed.rows) {
    let it = r.id ? byId.get(r.id) : null;
    let byCode = !!it;
    if (!it) {
      let cand = items.filter(x => key(x.name) === key(r.name));
      if (cand.length > 1) {
        cand = cand.filter(x => (r.amount === undefined || Number(x.amount) === r.amount) && (r.unit === undefined || x.unit === r.unit));
        if (cand.length !== 1) { errors.push({ row: r.row, msg: 'несколько товаров с названием «' + r.name + '»: укажите код или вес' }); continue; }
      }
      it = cand[0] || null;
    }
    if (it) {
      if (used.has(it.id)) { errors.push({ row: r.row, msg: 'товар «' + it.name + '» уже был выше в файле' }); continue; }
      used.add(it.id);
      const f = [];
      const set = (k, to, show) => { if (it[k] !== to) { f.push({ k, from: show ? show(it[k]) : it[k], to: show ? show(to) : to }); it[k] = to; } };
      if (byCode && r.name !== it.name) set('name', r.name);
      set('price', r.price);
      if (r.uz !== undefined) set('uz', r.uz);
      if (r.desc !== undefined) set('desc', r.desc);
      if (r.descUz !== undefined) set('descUz', r.descUz);
      if (r.amount !== undefined) set('amount', r.amount);
      if (r.unit !== undefined) set('unit', r.unit);
      if (r.on !== undefined) set('on', r.on);
      if (r.cat) {
        const cid = catFor(r.cat);
        if (cid === null) { errors.push({ row: r.row, msg: 'в каталоге уже ' + MAX_CATS + ' категорий' }); continue; }
        if (it.cat !== cid) { f.push({ k: 'cat', from: catName(it.cat), to: catName(cid) }); it.cat = cid; }
      }
      if (r.tag !== undefined) {
        set('tag', r.tag);
        const o = r.tag === 'sale' ? (r.old || 0) : 0;
        if ((Number(it.old) || 0) !== o) { f.push({ k: 'old', from: Number(it.old) || 0, to: o }); it.old = o; }
      }
      if (f.length) changes.push({ kind: 'upd', id: it.id, name: it.name, fields: f }); else same++;
    } else {
      if (items.length >= MAX_ITEMS) { errors.push({ row: r.row, msg: 'в каталоге уже ' + MAX_ITEMS + ' товаров' }); continue; }
      const cid = catFor(r.cat);
      if (cid === null) { errors.push({ row: r.row, msg: 'в каталоге уже ' + MAX_CATS + ' категорий' }); continue; }
      let id = 'p' + randId(6);
      while (byId.has(id)) id = 'p' + randId(6);
      const n = { id, cat: cid, name: r.name, uz: r.uz || '', desc: r.desc || '', descUz: r.descUz || '', amount: r.amount || 0, unit: r.unit || 'g', price: r.price, on: r.on !== false, tag: r.tag || '', old: r.tag === 'sale' ? (r.old || 0) : 0, pv: '' };
      items.push(n); byId.set(id, n); used.add(id);
      added++;
      changes.push({ kind: 'add', id, name: n.name, fields: [{ k: 'price', from: null, to: n.price }], cat: catName(cid) });
    }
  }
  return { prod: { cats, items }, changes, errors, same, added, updated: changes.length - added, newCats };
}

/* Каталог для выгрузки в Excel (он же образец прайса). */
function catalogSheets(prod) {
  setLang('ru');
  const catName = new Map(prod.cats.map(c => [c.id, c.name]));
  const rows = [['Код', 'Категория', 'Название', 'Название (узб.)', 'Описание', 'Описание (узб.)', 'Вес / объём', 'Единица', 'Цена, сум', 'В наличии', 'Метка', 'Старая цена, сум']];
  prod.items.forEach(p => rows.push([p.id, catName.get(p.cat) || '', p.name, p.uz || '', p.desc || '', p.descUz || '', Number(p.amount) || 0, unitName(p.unit), Number(p.price) || 0, p.on === false ? 'нет' : 'да', p.tag === 'sale' ? 'Акция' : p.tag === 'new' ? 'Новинка' : '', p.tag === 'sale' && Number(p.old) > 0 ? Number(p.old) : '']));
  const help = ['Как заполнять прайс',
    'Загрузите файл в приложении: вкладка «Каталог» → «Загрузить прайс». Перед применением бот покажет, что изменится, и вы подтвердите.',
    'Товар находится по коду. Если код пустой или не найден, по названию (и по весу, если одинаковых названий несколько). Нового товара нет в каталоге: он будет добавлен.',
    'Ничего не удаляется. Товар, которого нет в файле, остаётся в каталоге как был. Фото и остатки на складе не меняются.',
    'Пустая ячейка означает «не менять». Исключения: пустая «Метка» убирает метку, пустая «Старая цена» убирает старую цену.',
    'Обязательны только колонки «Название» и «Цена». Остальные можно удалить из файла целиком, тогда они не затрагиваются.',
    'Единица: г, кг, шт, мл или л. В наличии: да или нет. Метка: Акция или Новинка. Старая цена показывается только у акции и только если она выше цены.',
    'У новых товаров категория берётся из колонки «Категория»; если такой категории нет, она создаётся.'];
  return [{ name: 'Каталог', w: [12, 18, 34, 28, 30, 30, 12, 9, 14, 11, 11, 16], money: [8, 11], rows },
    { name: 'Как заполнять', w: [150], plain: true, rows: help.map(x => [x]) }];
}

/* ---------- отчёты ---------- */
/* Продажи копятся по дням: когда заказ становится «выдан», его сумма, товары и клиент добавляются в запись rp:<день> (день по часам склада).
   Самих заказов в панели хранится не больше 150 завершённых, поэтому отчёты берут данные не из них. Старше 400 дней записи удаляются. */
const RP_KEEP = 400;
const RP_RANGES = [7, 30, 90, 365];
const RP_COVER = 14;          // на сколько дней считаем запас в подсказке «что пора закупать»
const dayOf = iso => { const t = Date.parse(iso); return new Date((Number.isFinite(t) ? t : Date.now()) + SHOP_TZ * 3600000).toISOString().slice(0, 10); };
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const newRp = () => ({ n: 0, sum: 0, disc: 0, fee: 0, items: [], cl: [] });
function rpAdd(rp, o) {
  const total = Number(o.total) || 0;
  rp.n += 1; rp.sum += total; rp.disc += Number(o.disc) || 0; rp.fee += Number(o.fee) || 0;
  for (const it of o.items || []) {
    const qty = Number(it.qty) || 0;
    let x = rp.items.find(y => y.id === it.id);
    if (!x) { x = { id: String(it.id), name: cleanStr(it.name, 60), qty: 0, sum: 0 }; rp.items.push(x); }
    x.qty += qty; x.sum += qty * (Number(it.price) || 0);
  }
  if (o.uid) {
    let c = rp.cl.find(y => y.uid === o.uid);
    if (!c) { if (rp.cl.length >= 400) return; c = { uid: o.uid, name: '', org: '', n: 0, sum: 0 }; rp.cl.push(c); }
    c.name = cleanStr(o.name, 60) || c.name; c.org = cleanStr(o.org || '', 80) || c.org;
    c.n += 1; c.sum += total;
  }
}
/* Собирает отчёт за days дней, заканчивая днём today. Вход: rp — Map «день → запись», rp0 — с какого дня ведётся учёт. */
function reportBuild(o) {
  const { days, today, rp, rp0, prod, stk } = o;
  const from = addDays(today, -(days - 1));
  const series = [], months = new Map(), prods = new Map(), cls = new Map();
  const tot = { n: 0, sum: 0, disc: 0, fee: 0 };
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i), r = rp.get(d);
    series.push({ d, n: r ? r.n : 0, sum: r ? r.sum : 0 });
    if (!r) continue;
    tot.n += r.n; tot.sum += r.sum; tot.disc += r.disc; tot.fee += r.fee;
    const m = months.get(d.slice(0, 7)) || { m: d.slice(0, 7), n: 0, sum: 0 };
    m.n += r.n; m.sum += r.sum; months.set(m.m, m);
    r.items.forEach(x => { const a = prods.get(x.id) || { id: x.id, name: x.name, qty: 0, sum: 0 }; a.qty += x.qty; a.sum += x.sum; a.name = x.name || a.name; prods.set(x.id, a); });
    r.cl.forEach(c => { const a = cls.get(c.uid) || { name: c.name, org: c.org, n: 0, sum: 0 }; a.n += c.n; a.sum += c.sum; a.name = c.name || a.name; a.org = c.org || a.org; cls.set(c.uid, a); });
  }
  // прошлый период той же длины: только если учёт шёл уже тогда
  const pFrom = addDays(from, -days);
  let prev = null;
  if (rp0 && rp0 <= pFrom) {
    prev = { n: 0, sum: 0 };
    for (let i = 0; i < days; i++) { const r = rp.get(addDays(pFrom, i)); if (r) { prev.n += r.n; prev.sum += r.sum; } }
  }
  const pitem = new Map((prod ? prod.items : []).map(x => [x.id, x]));
  const prodsOut = [...prods.values()].sort((a, b) => b.sum - a.sum || b.qty - a.qty).slice(0, 20).map(x => {
    const it = pitem.get(x.id);
    return Object.assign({}, x, it ? { name: it.name, w: weightLabel(it) } : {});
  });
  const clOut = [...cls.values()].sort((a, b) => b.sum - a.sum || b.n - a.n).slice(0, 10);
  // что пора закупать: у товаров с учётом остатка считаем, на сколько дней хватит при нынешних продажах (за последние 30 дней или сколько есть)
  const span = Math.max(1, Math.round((Date.parse(today) - Date.parse(rp0 || today)) / 86400000) + 1);
  const W = Math.min(30, span), wFrom = addDays(today, -(W - 1));
  const sold = new Map();
  for (let i = 0; i < W; i++) { const r = rp.get(addDays(wFrom, i)); if (r) r.items.forEach(x => sold.set(x.id, (sold.get(x.id) || 0) + x.qty)); }
  const list = [];
  for (const it of prod ? prod.items : []) {
    const s = stk && stk[it.id];
    if (!s) continue;
    const q = sold.get(it.id) || 0;
    if (!(q > 0)) continue;
    const avail = stkAvail(s), daily = q / W, left = avail / daily;
    if (left > RP_COVER) continue;
    list.push({ id: it.id, name: it.name, w: weightLabel(it), avail, daily: Math.round(daily * 100) / 100, left: Math.round(left * 10) / 10, need: Math.max(0, Math.ceil(daily * RP_COVER - avail)) });
  }
  list.sort((a, b) => a.left - b.left);
  return {
    days, from, to: today, since: rp0 || today, span, thin: span < 7,
    tot: Object.assign(tot, { avg: tot.n ? Math.round(tot.sum / tot.n) : 0 }), prev,
    series, months: [...months.values()].sort((a, b) => a.m.localeCompare(b.m)),
    prods: prodsOut, cl: clOut, buy: { window: W, cover: RP_COVER, list: list.slice(0, 30) }
  };
}
const MONTHS_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const ruDay = d => d.slice(8, 10) + '.' + d.slice(5, 7) + '.' + d.slice(0, 4);
const ruMonth = m => MONTHS_RU[Number(m.slice(5, 7)) - 1] + ' ' + m.slice(0, 4);
function reportSheets(r) {
  setLang('ru');
  const days = [['Дата', 'Заказов', 'Сумма, сум']].concat(r.series.map(x => [ruDay(x.d), x.n, x.sum]));
  days.push(['Итого', r.tot.n, r.tot.sum]);
  const months = [['Месяц', 'Заказов', 'Сумма, сум']].concat(r.months.map(x => [ruMonth(x.m), x.n, x.sum]));
  const prods = [['Товар', 'Вес / объём', 'Продано, шт', 'Сумма, сум']].concat(r.prods.map(x => [x.name, x.w || '', x.qty, x.sum]));
  const cl = [['Клиент', 'Организация', 'Заказов', 'Сумма, сум']].concat(r.cl.map(x => [x.name, x.org || '', x.n, x.sum]));
  const buy = [['Товар', 'Вес / объём', 'Свободно, шт', 'Продаётся в день, шт', 'Хватит на, дней', 'Докупить на ' + r.buy.cover + ' дн., шт']].concat(r.buy.list.map(x => [x.name, x.w || '', x.avail, x.daily, x.left, x.need]));
  const head = ['Отчёт за ' + ruDay(r.from) + ' — ' + ruDay(r.to), 'Учёт продаж ведётся с ' + ruDay(r.since) + '. В отчёт входят заказы со статусом «выдан» и «доставлен».',
    'Сумма товара считается по ценам в заказе, до скидки на весь заказ. Сумма заказа — то, что заплатил клиент (со скидкой и доставкой).',
    'Заказов: ' + r.tot.n + '. Сумма: ' + num(r.tot.sum) + ' сум. Скидки: ' + num(r.tot.disc) + ' сум. Доставка: ' + num(r.tot.fee) + ' сум. Средний заказ: ' + num(r.tot.avg) + ' сум.'];
  return [
    { name: 'Сводка', w: [150], plain: true, rows: head.map(x => [x]) },
    { name: 'По дням', w: [14, 11, 16], money: [2], rows: days },
    { name: 'По месяцам', w: [20, 11, 16], money: [2], rows: months },
    { name: 'Товары', w: [38, 14, 14, 16], money: [3], rows: prods },
    { name: 'Клиенты', w: [30, 26, 11, 16], money: [3], rows: cl },
    { name: 'Что закупать', w: [38, 14, 14, 20, 16, 24], rows: buy }
  ];
}

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
  async getClient(uid) { const c = await this.st.get('c:' + uid); return c && typeof c === 'object' ? c : null; }
  async clientsIdx() { const x = await this.st.get('cx'); return Array.isArray(x) ? x : []; }
  /* Карточка заказа для продавца вместе с группой и заметкой клиента. */
  async card(o, shop, confirm) { return adminCard(o, shop, this.origin, confirm, o.uid ? await this.getClient(o.uid) : null); }
  /* Один раз собирает базу клиентов из уже оформленных заказов (активных и в истории). Дальше база живёт сама. */
  async ensureClients() {
    if (await this.st.get('cxb')) return;
    const ids = ((await this.st.get('act')) || []).concat((await this.st.get('hist')) || []);
    const orders = (await this.getOrders(ids)).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    const map = new Map();
    for (const o of orders) {
      if (!o.uid) continue;
      let c = map.get(o.uid);
      if (!c) { if (map.size >= MAX_CLIENTS) continue; c = newClient(o.uid, o.createdAt); map.set(o.uid, c); }
      // идём от старых заказов к новым: контакты берём из самого свежего
      c.name = o.name || c.name; c.phone = o.phone || c.phone; c.lang = o.lang || c.lang;
      if (o.tg) c.tg = { username: o.tg.username || '', name: o.tg.name || '' };
      if (o.mode === 'delivery' && o.address) c.addrs = [o.address].concat(c.addrs.filter(a => !sameAddr(a, o.address))).slice(0, MAX_ADDRS);
      if (o.status !== 'cancelled') c.n += 1;
      if (o.status === 'done') { c.ds += 1; c.sum += Number(o.total) || 0; }
      c.last = o.createdAt;
    }
    const upd = { cxb: 1, cx: [...map.keys()] };
    map.forEach((c, uid) => { upd['c:' + uid] = c; });
    await this.st.put(upd);
  }
  /* Один раз при первом обращении: заполняет отчёты из уже завершённых заказов, которые ещё хранятся (до 150). Дальше записи копятся сами. */
  async ensureReports() {
    if (await this.st.get('rpx') !== undefined) return;
    const done = (await this.getOrders((await this.st.get('hist')) || [])).filter(o => o.status === 'done');
    const byDay = new Map();
    let first = null;
    for (const o of done) {
      const d = dayOf(o.statusAt || o.createdAt);
      let r = byDay.get(d);
      if (!r) { r = newRp(); byDay.set(d, r); }
      rpAdd(r, o);
      if (!first || d < first) first = d;
    }
    const days = [...byDay.keys()].sort().slice(-RP_KEEP);
    const upd = { rpx: days, rp0: first || dayOf(new Date().toISOString()) };
    days.forEach(d => { upd['rp:' + d] = byDay.get(d); });
    await this.st.put(upd);
  }
  async report(days) {
    await this.ensureReports();
    days = RP_RANGES.includes(days) ? days : 30;
    const today = dayOf(new Date().toISOString());
    const idx = (await this.st.get('rpx')) || [];
    const need = addDays(today, -Math.max(2 * days, 30));
    const map = await this.getMany(idx.filter(d => d >= need).map(d => 'rp:' + d));
    const rp = new Map();
    map.forEach((v, k) => rp.set(k.slice(3), v));
    return reportBuild({ days, today, rp, rp0: await this.st.get('rp0'), prod: await this.getProd(), stk: await this.getStk() });
  }
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

  /* Отправляет файл в чат (sendDocument). Telegram принимает его только как multipart-форму. */
  async tgDoc(chatId, name, bytes, mime, caption) {
    if (!this.env.BOT_TOKEN) return { ok: false, description: 'BOT_TOKEN не задан' };
    try {
      const fd = new FormData();
      fd.append('chat_id', String(chatId));
      if (caption) fd.append('caption', caption.slice(0, 1000));
      fd.append('document', new Blob([bytes], { type: mime }), name);
      const r = await fetch(TG_API + this.env.BOT_TOKEN + '/sendDocument', { method: 'POST', body: fd, signal: AbortSignal.timeout(30000) });
      return await r.json();
    } catch (e) {
      return { ok: false, description: String(e && e.message || e) };
    }
  }

  /* --- выгрузки --- */
  /* Заказы для сборочного листа: названные по номерам или все «новые» и «в работе» (можно только на один день). */
  async pickOrders(b) {
    let orders;
    if (Array.isArray(b.ids)) {
      const ids = [...new Set(b.ids.filter(x => typeof x === 'string' && /^[A-Za-z0-9-]{1,12}$/.test(x)))].slice(0, PICK_MAX);
      orders = await this.getOrders(ids);
    } else {
      orders = (await this.getOrders((await this.st.get('act')) || [])).filter(o => o.status === 'new' || o.status === 'accepted');
      const day = typeof b.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.day) ? b.day : '';
      if (day) orders = orders.filter(o => String(o.pickupAt).slice(0, 10) === day);
    }
    orders.sort((a, c) => String(a.pickupAt).localeCompare(String(c.pickupAt)) || String(a.createdAt).localeCompare(String(c.createdAt)));
    return { orders: orders.slice(0, PICK_MAX), cut: Math.max(0, orders.length - PICK_MAX) };
  }
  async allOrders() {
    return this.getOrders(((await this.st.get('act')) || []).concat((await this.st.get('hist')) || []));
  }
  /* Резервная копия: архив с backup.json (всё, что хранит бот), фото товаров и коротким описанием. Токен и код продавца в хранилище не лежат. */
  async backupFiles() {
    await this.ensureClients();
    const prod = await this.getProd(), orders = await this.allOrders();
    const idx = await this.clientsIdx(), cmap = await this.getMany(idx.map(x => 'c:' + x));
    const withPhoto = prod.items.filter(it => it.pv);
    const photos = [];
    let used = 0;
    for (let i = 0; i < withPhoto.length; i += 20) {
      const part = withPhoto.slice(i, i + 20);
      const m = await this.getMany(part.map(it => 'p:' + it.id));
      for (const it of part) {
        const b = m.get('p:' + it.id);
        if (!b || !b.length) continue;
        const u = b instanceof Uint8Array ? b : new Uint8Array(b);
        if (used + u.length > BACKUP_PHOTO_BUDGET) continue;
        used += u.length;
        photos.push({ name: 'photos/' + it.id + '.jpg', data: u });
      }
    }
    const at = new Date().toISOString();
    const data = {
      kind: 'distro-backup', v: 1, at,
      cfg: await this.getCfg(), prod, stk: await this.getStk(), jr: (await this.st.get('jr')) || [],
      stats: (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 },
      admins: (await this.st.get('admins')) || [],
      act: (await this.st.get('act')) || [], hist: (await this.st.get('hist')) || [],
      orders: orders.map(o => { const x = Object.assign({}, o); delete x.msgs; return x; }),
      clients: idx.map(x => cmap.get('c:' + x)).filter(Boolean),
      reports: await this.reportsDump(),
      photos: { saved: photos.length, of: withPhoto.length }
    };
    const readme = 'Резервная копия магазина «' + ((data.cfg.shop && data.cfg.shop.name) || '') + '»\r\nСоздана: ' + shopTime(at) + ' (время склада)\r\n\r\n'
      + 'backup.json — настройки, каталог, остатки, заказы, клиенты.\r\nphotos/ — фото товаров (' + photos.length + ' из ' + withPhoto.length + ').\r\n\r\n'
      + 'Файл не содержит токена бота и кода продавца. Храните его в надёжном месте: в нём телефоны и адреса клиентов.\r\n'
      + 'Чтобы вернуть данные, передайте этот файл разработчику бота.\r\n';
    return {
      files: [{ name: 'backup.json', data: enc.encode(JSON.stringify(data)) }, { name: 'README.txt', data: enc.encode(readme) }].concat(photos),
      info: { orders: orders.length, clients: data.clients.length, photos: photos.length, photosOf: withPhoto.length }
    };
  }
  /* Записи продаж по дням для резервной копии. */
  async reportsDump() {
    await this.ensureReports();
    const idx = (await this.st.get('rpx')) || [];
    const map = await this.getMany(idx.map(d => 'rp:' + d));
    const days = {};
    idx.forEach(d => { const v = map.get('rp:' + d); if (v) days[d] = v; });
    return { since: (await this.st.get('rp0')) || '', days };
  }
  /* Собирает файл выгрузки. kind: orders | clients | backup | pick. Возвращает {name, bytes, mime, caption, n} или {err}. */
  async makeExport(kind, b) {
    setLang('ru');
    const day = ymd(shopNow());
    if (kind === 'orders') {
      const orders = await this.allOrders();
      return { name: 'orders-' + day + '.xlsx', bytes: xlsxBuild(ordersSheets(orders)), mime: XLSX_MIME, n: orders.length,
        caption: 'Заказы: ' + orders.length + ' (активные и последние завершённые). Откройте в Excel.' };
    }
    if (kind === 'clients') {
      await this.ensureClients();
      const idx = await this.clientsIdx(), map = await this.getMany(idx.map(x => 'c:' + x));
      const list = idx.map(x => map.get('c:' + x)).filter(Boolean);
      return { name: 'clients-' + day + '.xlsx', bytes: xlsxBuild(clientsSheets(list)), mime: XLSX_MIME, n: list.length, caption: 'Клиенты: ' + list.length + '. Откройте в Excel.' };
    }
    if (kind === 'backup') {
      const bk = await this.backupFiles();
      return { name: 'backup-' + day + '.zip', bytes: zipStore(bk.files), mime: 'application/zip', n: bk.info.orders,
        caption: 'Резервная копия: заказов ' + bk.info.orders + ', клиентов ' + bk.info.clients + ', фото ' + bk.info.photos + (bk.info.photos < bk.info.photosOf ? ' из ' + bk.info.photosOf : '') + '. Сохраните файл в надёжном месте.' };
    }
    if (kind === 'catalog') {
      const prod = await this.getProd();
      return { name: 'catalog-' + day + '.xlsx', bytes: xlsxBuild(catalogSheets(prod)), mime: XLSX_MIME, n: prod.items.length,
        caption: 'Каталог: товаров ' + prod.items.length + '. Измените цены, сохраните файл и загрузите его в приложении: Каталог → Загрузить прайс.' };
    }
    if (kind === 'report') {
      const r = await this.report(Number(b && b.days));
      return { name: 'report-' + day + '.xlsx', bytes: xlsxBuild(reportSheets(r)), mime: XLSX_MIME, n: r.tot.n,
        caption: 'Отчёт за ' + r.days + ' дн.: заказов ' + r.tot.n + ', сумма ' + num(r.tot.sum) + ' сум. Откройте в Excel.' };
    }
    if (kind === 'pick') {
      const p = await this.pickOrders(b || {});
      if (!p.orders.length) return { err: 'empty' };
      return { name: 'sborka-' + day + '.html', bytes: enc.encode(pickHtml(p.orders, (await this.getCfg()).shop, await this.getProd(), p.cut)), mime: 'text/html', n: p.orders.length,
        caption: 'Сборочный лист: заказов ' + p.orders.length + '. Откройте файл в браузере и нажмите Ctrl+P, чтобы распечатать.' };
    }
    return { err: 'bad_request' };
  }

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
      await this.ensureClients();
      const cl = await this.getClient(uid);
      return json({ cfg: await this.getCfg(), prod: await this.pubProd(), me: { id: uid, name: u.first_name || '', admin, profile: clientPublic(cl), blocked: !!(cl && cl.blocked), fav: await this.getFav(uid) }, orders: await this.myOrders(uid) });
    }
    if (path === '/api/profile' && method === 'PUT') {
      const r = await this.readBody(request, 6000);
      if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
      return await this.saveProfile(u, r.body);
    }
    if (path === '/api/fav' && method === 'PUT') {
      const r = await this.readBody(request, 4000);
      if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
      return await this.saveFav(uid, r.body);
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
      if (path === '/api/admin/clients' && method === 'GET') {
        await this.ensureClients();
        const idx = await this.clientsIdx();
        const map = await this.getMany(idx.map(x => 'c:' + x));
        return json({ clients: idx.map(x => map.get('c:' + x)).filter(Boolean) });
      }
      const cm = path.match(/^\/api\/admin\/clients\/(\d{1,15})$/);
      if (cm) {
        const cuid = Number(cm[1]);
        await this.ensureClients();
        if (method === 'GET') {
          const c = await this.getClient(cuid);
          if (!c) return json({ error: 'not_found' }, 404);
          return json({ client: c, orders: (await this.getOrders((await this.st.get('m:' + cuid)) || [])).map(adminOrder) });
        }
        if (method === 'PUT') {
          const r = await this.readBody(request, 8000);
          if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
          const c = await this.getClient(cuid);
          if (!c) return json({ error: 'not_found' }, 404);
          const v = cleanClient(r.body, true);
          if (v.err) return json({ error: v.err }, 400);
          Object.assign(c, v.v);
          await this.st.put('c:' + cuid, c);
          return json({ client: c });
        }
        if (method === 'DELETE') {
          const idx = await this.clientsIdx();
          await this.st.put('cx', idx.filter(x => x !== cuid));
          await this.st.delete('c:' + cuid);
          return json({ ok: true });
        }
      }
      if (path === '/api/admin/report' && method === 'GET') {
        return json({ report: await this.report(Number(new URL(request.url).searchParams.get('days'))) });
      }
      if (path === '/api/admin/pick' && method === 'POST') {
        const r = await this.readBody(request, 4000);
        if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
        const p = await this.pickOrders(r.body);
        if (!p.orders.length) return json({ error: 'empty' }, 404);
        return json({ html: pickHtml(p.orders, (await this.getCfg()).shop, await this.getProd(), p.cut), n: p.orders.length, cut: p.cut });
      }
      if (path === '/api/admin/export' && method === 'POST') {
        const r = await this.readBody(request, 4000);
        if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
        if (this.exporting) return json({ error: 'busy' }, 429);
        this.exporting = true;
        try {
          const f = await this.makeExport(String(r.body.kind || ''), r.body);
          if (f.err) return json({ error: f.err }, f.err === 'empty' ? 404 : 400);
          // файл уходит в личный чат продавца с ботом (номер чата совпадает с номером пользователя)
          const sent = await this.tgDoc(uid, f.name, f.bytes, f.mime, f.caption);
          if (!sent || !sent.ok) return json({ error: 'send_failed', detail: String(sent && sent.description || '').slice(0, 200) }, 502);
          return json({ ok: true, name: f.name, size: f.bytes.length, n: f.n });
        } finally { this.exporting = false; }
      }
      if (path === '/api/admin/import' && method === 'POST') return await this.importPrice(request, new URL(request.url).searchParams.get('apply') === '1');
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

  /* Профиль клиента: имя, телефон, организация, адреса. Заметку, группу и блокировку клиент менять не может. */
  async saveProfile(u, body) {
    await this.ensureClients();
    const v = cleanClient(body, false);
    if (v.err) return json({ error: v.err }, 400);
    const upd = {};
    let c = await this.getClient(u.id);
    if (!c) {
      const idx = await this.clientsIdx();
      if (idx.length >= MAX_CLIENTS) return json({ error: 'busy' }, 503);
      c = newClient(u.id);
      upd.cx = idx.concat([u.id]);
    }
    Object.assign(c, v.v);
    c.tg = { username: cleanStr(u.username || '', 40), name: cleanStr([u.first_name, u.last_name].filter(Boolean).join(' '), 80) };
    upd['c:' + u.id] = c;
    await this.st.put(upd);
    return json({ profile: clientPublic(c) });
  }

  /* Избранное клиента: хранится отдельно от базы клиентов, поэтому тот, кто только отмечает товары, в базе не появляется. */
  async getFav(uid) { const x = await this.st.get('f:' + uid); return Array.isArray(x) ? x : []; }
  async saveFav(uid, body) {
    if (!Array.isArray(body.ids) || body.ids.length > MAX_FAV) return json({ error: 'bad_request' }, 400);
    const have = new Set((await this.getProd()).items.map(i => i.id));
    const ids = [];
    for (const id of body.ids) {
      if (!validId(id)) return json({ error: 'bad_request' }, 400);
      if (have.has(id) && !ids.includes(id)) ids.push(id);
    }
    if (ids.length) await this.st.put('f:' + uid, ids); else await this.st.delete('f:' + uid);
    return json({ fav: ids });
  }

  async myOrders(uid) {
    const ids = (await this.st.get('m:' + uid)) || [];
    const list = await this.getOrders(ids);
    return list.map(publicOrder);
  }

  /* --- заказы --- */
  async placeOrder(u, body) {
    await this.ensureClients();
    const cl0 = await this.getClient(u.id);
    if (cl0 && cl0.blocked) return json({ error: 'blocked' }, 403);
    const cfg = await this.getCfg();
    const prod = await this.getProd();
    const stk = await this.getStk();
    const v = validateOrder(body, cfg, prod, stk);
    if (v.err) {
      const fresh = v.err === 'unavailable' || v.err === 'no_delivery' || v.err === 'stock' || v.err === 'min_order';
      return json({ error: v.err, short: v.short, min: v.min, cfg: fresh ? cfg : undefined, prod: fresh ? publicProd(prod, stk) : undefined }, fresh ? 409 : 400);
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
    if (cl0 && cl0.org) order.org = cl0.org;
    if (v.fee > 0 || v.disc > 0) order.sub = v.sub;
    if (v.disc > 0) { order.disc = v.disc; order.dpct = v.dpct; }
    if (v.fee > 0) order.fee = v.fee;
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
    // клиентская база: заказ создаёт клиента, а у существующего дополняет только пустые поля и добавляет новый адрес
    let cl = cl0;
    if (!cl) {
      const idx = await this.clientsIdx();
      if (idx.length < MAX_CLIENTS) { cl = newClient(uid, order.createdAt); upd.cx = idx.concat([uid]); }
    }
    if (cl) {
      if (!cl.name) cl.name = order.name;
      if (!cl.phone) cl.phone = order.phone;
      if (order.mode === 'delivery' && order.address && cl.addrs.length < MAX_ADDRS && !cl.addrs.some(a => sameAddr(a, order.address))) cl.addrs.push(order.address);
      cl.n += 1;
      cl.last = order.createdAt;
      cl.tg = order.tg;
      cl.lang = order.lang;
      upd['c:' + uid] = cl;
    }
    await this.st.put(upd);

    // уведомления: ошибки Telegram не должны ломать приём заказа
    const sent = [];
    const card = adminCard(order, cfg.shop, this.origin, false, cl);
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
  async saveProd(input) { return json({ prod: await this.applyProd(input) }); }
  /* Сохраняет каталог целиком (его присылает приложение или прайс) и возвращает его в виде, который видят клиенты. */
  async applyProd(input) {
    const old = await this.getProd();
    const prod = sanitizeProd(input, old);
    const keep = new Set(prod.items.map(i => i.id));
    const gone = old.items.map(i => i.id).filter(id => !keep.has(id));
    const stk = await this.getStk();
    const upd = { prod };
    if (gone.some(id => stk[id])) { gone.forEach(id => { delete stk[id]; }); upd.stk = stk; }   // остаток удалённого товара не копим
    await this.st.put(upd);
    if (gone.length) await this.st.delete(gone.map(id => 'p:' + id));   // фото удалённых товаров не копим
    return publicProd(prod, stk);
  }
  /* Прайс из Excel: apply=false только показывает, что изменится; apply=true записывает. */
  async importPrice(request, apply) {
    if (Number(request.headers.get('content-length') || 0) > XL_MAX_FILE) return json({ error: 'bad_file', why: 'too_big' }, 413);
    const u = new Uint8Array(await request.arrayBuffer());
    if (u.length > XL_MAX_FILE) return json({ error: 'bad_file', why: 'too_big' }, 413);
    if (u.length < 100 || u[0] !== 0x50 || u[1] !== 0x4B) return json({ error: 'bad_file', why: 'not_xlsx' }, 400);
    let plan;
    try { plan = xlPlan(xlParse(await xlReadSheet(u)), await this.getProd()); }
    catch (e) {
      if (!(e instanceof XlErr)) console.error('import error', e && e.stack || e);
      return json({ error: 'bad_file', why: e instanceof XlErr ? e.why : 'not_xlsx' }, 400);
    }
    const out = {
      ok: true, applied: false,
      summary: { added: plan.added, updated: plan.updated, same: plan.same, errors: plan.errors.length, newCats: plan.newCats },
      changes: plan.changes.slice(0, 200), moreChanges: Math.max(0, plan.changes.length - 200),
      errors: plan.errors.slice(0, 50), moreErrors: Math.max(0, plan.errors.length - 50)
    };
    if (apply && plan.changes.length) { out.prod = await this.applyProd(plan.prod); out.applied = true; }
    return json(out);
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
      // количество можно прислать в упаковках: u = 'box' (коробки) или 'blk' (блоки), n — их число; на склад идут штуки
      let nIn = b.n;
      if (b.u !== undefined && b.u !== null && b.u !== 'pc') {
        const size = b.u === 'box' || b.u === 'blk' ? packSize(it, b.u) : 0;
        if (!size) return json({ error: 'no_pack' }, 400);
        if (typeof b.n !== 'number' || !Number.isInteger(b.n) || b.n < 0 || b.n > MAX_STOCK) return json({ error: 'bad_request' }, 400);
        nIn = b.n * size;
      }
      const n = intIn(nIn, b.op === 'in' ? 1 : 0, MAX_STOCK);
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
    await this.ensureClients();
    await this.ensureReports();
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
      // отчёты: выданный заказ добавляется в запись своего дня
      if (to === 'done') {
        const day = dayOf(o.statusAt);
        const rp = (await this.st.get('rp:' + day)) || newRp();
        rpAdd(rp, o);
        upd['rp:' + day] = rp;
        const idx = (await this.st.get('rpx')) || [];
        if (!idx.includes(day)) {
          idx.push(day); idx.sort();
          const drop = idx.splice(0, Math.max(0, idx.length - RP_KEEP));
          if (drop.length) await this.st.delete(drop.map(d => 'rp:' + d));
          upd.rpx = idx;
        }
      }
      // счётчики клиента: выдача добавляет сумму, отмена убирает заказ из счёта
      const cl = o.uid ? await this.getClient(o.uid) : null;
      if (cl) {
        if (to === 'done') { cl.ds += 1; cl.sum += Number(o.total) || 0; } else cl.n = Math.max(0, cl.n - 1);
        upd['c:' + o.uid] = cl;
      }
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
    const card = await this.card(o, cfg.shop, false);
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

    if (kind === 'c') { await edit(await this.card(o, cfg.shop, true)); return answer('Отменить заказ ' + id + '?'); }
    if (kind === 'b') { await edit(await this.card(o, cfg.shop, false)); return answer(''); }
    if (kind === 's') {
      const res = await this.changeStatus(id, to);
      if (res.err === 'bad_transition') {
        await edit(await this.card(res.order, cfg.shop, false));
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
