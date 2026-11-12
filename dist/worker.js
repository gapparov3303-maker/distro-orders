// Файл собран автоматически (node build.js). Править нужно файлы в src/.
const APP_HTML = "<!doctype html>\n<html lang=\"ru\"><head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n<meta name=\"color-scheme\" content=\"light dark\">\n<title>Каталог</title>\n<script src=\"https://telegram.org/js/telegram-web-app.js\"></script>\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Unbounded:wght@500;700&display=swap\">\n<style>\n/* Layout: catalog with search and categories, cart with order form; seller panel is a tabbed list of orders, catalog editor and settings. */\n:root{\n  --bg:#FFFFFF; --surface:#F8F7F5; --surface-2:#EFEEEC; --ink:#1A1A1E; --ink-2:#666672; --line:#E6E6E6;\n  --accent:#139A78; --accent-ink:#FFFFFF; --accent-soft:#DDF3EC; --tx:#08755A; --grp:#B4541A;\n  --hot:#FC502C; --hot-ink:#FFFFFF; --gbg:#FFFFFF;\n  --stage-a:#EAF6F1; --stage-b:#F1F0EE;\n  --bc-bg:#E3F5EE; --bc-edge:#BDE3D5; --bc-bar:#139A78; --bc-in:#FFFFFF; --edge:#C2C0BA; --oedge:var(--edge); --pcsh:rgba(20,35,31,.12); --bar-mute:#C9C8C4;\n  --ok:#1F7A4D; --ok-soft:#DDF3E6; --warn:#9A5B00; --warn-soft:#FBEBCB; --bad:#D63A1F; --bad-soft:#FFE4DC; --info:#1F5FA3; --info-soft:#DCEBFA; --mute:#666672; --mute-soft:#EFEEEC;\n  --f-display:'Unbounded','Onest',system-ui,sans-serif;\n  --f-body:'Onest',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;\n  --hdr:56px;\n}\n@media (prefers-color-scheme: dark){\n  :root:not([data-theme=\"light\"]){\n    --bg:#101412; --surface:#1A201D; --surface-2:#242C28; --ink:#F1F5F3; --ink-2:#9FACA6; --line:#2D3833;\n    --accent:#34D1A4; --accent-ink:#04201A; --accent-soft:#18382F; --tx:#5BE0BA; --grp:#E8A662;\n    --hot:#FF7A5C; --hot-ink:#2A0A03; --gbg:#2C3631;\n    --stage-a:#1E2B26; --stage-b:#232826;\n    --bc-bg:#16332B; --bc-edge:#2A6A56; --bc-bar:#34D1A4; --bc-in:#141B18; --edge:#4F5A54; --oedge:var(--edge); --pcsh:rgba(0,0,0,.4); --bar-mute:#4A524E;\n    --ok:#6FD3A0; --ok-soft:#1D3A2D; --warn:#F2B957; --warn-soft:#3F3015; --bad:#FF8A75; --bad-soft:#44201E; --info:#7DB6F0; --info-soft:#1B3149; --mute:#9FACA6; --mute-soft:#242C28;\n    color-scheme:dark;\n  }\n}\n:root[data-theme=\"dark\"]{\n  --bg:#101412; --surface:#1A201D; --surface-2:#242C28; --ink:#F1F5F3; --ink-2:#9FACA6; --line:#2D3833;\n  --accent:#34D1A4; --accent-ink:#04201A; --accent-soft:#18382F; --tx:#5BE0BA; --grp:#E8A662;\n  --hot:#FF7A5C; --hot-ink:#2A0A03; --gbg:#2C3631;\n  --stage-a:#1E2B26; --stage-b:#232826;\n  --bc-bg:#16332B; --bc-edge:#2A6A56; --bc-bar:#34D1A4; --bc-in:#141B18; --edge:#4F5A54; --oedge:var(--edge); --pcsh:rgba(0,0,0,.4); --bar-mute:#4A524E;\n  --ok:#6FD3A0; --ok-soft:#1D3A2D; --warn:#F2B957; --warn-soft:#3F3015; --bad:#FF8A75; --bad-soft:#44201E; --info:#7DB6F0; --info-soft:#1B3149; --mute:#9FACA6; --mute-soft:#242C28;\n  color-scheme:dark;\n}\n*{box-sizing:border-box}\nhtml,body{margin:0}\nbody{-webkit-text-size-adjust:100%;min-height:100vh;background:var(--bg);color:var(--ink);font:15px/1.45 var(--f-body);-webkit-font-smoothing:antialiased}\nbody::before{content:\"\";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);background:var(--bg);z-index:30}\nbutton,input,select,textarea{font:inherit;color:inherit}\nh1,h2,h3,p{margin:0}\n.wrap{max-width:1080px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n\n/* header */\n.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--bg);border-bottom:1px solid var(--line)}\n.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:var(--hdr)}\n.brand{display:flex;align-items:center;gap:10px;font:700 15px/1 var(--f-display);letter-spacing:.01em;min-width:0}\n.brand svg{flex:none}\n.logo{flex:none;width:42px;height:42px;border-radius:50%;background:#594A43 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAAYFBMVEX/tUD/tED/s0D/skD9sUD9sED8sED7sED8r0D7r0D6r0D4rkDvqEDenUHKkEG1hEGfdkKKaUJ2XENlUUNdTENbTENbS0NaS0NZS0NaSkNZSkNYSkNXSUNUR0NTRkNRRUNbi4MWAAATYElEQVR42u1diXajurIVg81jHgMXEPj///LtkgADRiCw08m9Kzq9Vuek3WltpJp3Faz5L1/sD8AfgD8AfwD+APxqAPV/IYC6qsqyqsXWW97Kb5X4VvXrAdA+64Z3/ePRd7ytyqooirJqOB++UxOyXwoAm69o67zMsyxN4jjCCrHo9zhO0jTLC94DRvVJEB8CUFXY/KMvcuw8CgPfNpjBmDEsfMUMyw/CCDiyvHsIEL8HQI1H3/dFlsbYumkYpmXfPbFc+uXKr52bjT8zvCCME4Dou/ojGNgHHj7vu5w2bxmGdXOxY9e5by2H/uxumcz0wzjNec+r9+8Se/fhN53YvW+aeOyuez9chMI2TTcAho4w/CAAevhNFoe2Yd5Uj111FnfLsICheBcCe2f7ePhJ5BvmXefJv56EYxl+mGRd11Q/AIDUTpaENrOv7H7EcDeMIM5wjtU/BkBPP4sD03Q85/7Ocl3LCKK0ugyBXRNd3mP7hnX94c8h2IYfZby7JgtXAEB0809tX4i0Bwhx1vPynwCo6r5IQsPyPrR9qZVsyEL+uHCPTgMoeZdGlul+cPvjKYRp1VXfDYA/8tg/s32ofLGcYwimHWVdW30vgCINmGHbd3JwXEfhMohN0wewbdsy4czBl7OF+doV57sRJEVXfiOAmsNyjd6mcNocd/DVpPMmnrRNmyYnFB+5wwcNR8c68A9OwbOsKOtPOUhnT6Dtu7LIM+E1Y0MOPV/hLjPpPQOU5wdi04gBKAjI5IeDwPc0dKoDSYCz/Y1CXMn4qu9l4JImCWKXYSW0xJ4RujweD07hQRh4JiNgtpbMeJYXFycUKrse87aIvxApPh6dWD1+iUXfegAd7d2k239z3BOuHlzVKO/L7wJQ19h+RQjK8quYLxH6AgbHwYjnTlGY43qnFa7jGqG+IDDtkFFY+pZjiUf9WK2+awsRDJOMW/TcL+x9PAQzSDvNhIwegFpcEt7UX0WeY5skmbSS54qloFr03G0KJd8xa57lJ5oImFZuqkvjZ5YhwD6hUWxoSwtKyDRNEbcLXX9z1BHlqTOw73GjpYyYjsx2iS8UpdCTpgWFYt+eFssdzNZHdj4huFl6CHROAPu3n5aKNIrj3L97uY4ZlxoIjgHg+Xu2e//nywGCuq3fBlD/0P4JgRV/8fpNAGWf+j+zfyC4W9BF7wHA/gPrh/ZP7uk9OYoQ9gGUXRaY3v3Hlmv76YFXwfb3n4c/uX8gsIJsP0Bgu8F7ERk/un/YZDPMd2/R7gnw+Ofu/xNBVOypIrYnwIlzd34awN014r0jYDsGLAt+/gBImXp7gsx2wt/Q/AX7HwS5Og2g6mLjV+wfYmBE1ekTIAv8CwRgNAeJ8hIx9QX6aQ06E4OdS8R+/QUSR8Ci+tQJlH0W2M79Ny3VJdoG0MIEu79p+64V5tvRDVOYMPv+u5bSnLFNH+i3mIC5IlLI8SaAPvlt+6cjiLjmCVT8d/gQa49iOzTYAtD/CxXqPHMyRzkOWW7wjUjvBL7HiZuKHqIwcr/fRFpMLsoyjZml+fKmGolI4hs4gkoDQPnJA5jKS7RfSuFReowKIz6KCNPy/Zss41Caz6R8n2k+PyxrJMQ4yrjGCZAK+tgB2MO2aBNU9ZjKHqnIr+aZzLOKOgPlLsMhdSl+DyeiVJbnNSWUO50r9EEVdAsjUfCQ+83zourm2exZhlvUFVCYodTxtIpCMNUe9Cec8uNlrQHgo2GAH0iKFm1GZLXHgk40rKEKhXoO1UewTZm/H1YruYIgC+4UC9YAykf6OSNsW7hBljtdd9+x5c0WF2v4zfL8cOCiSUpdU5XFl9h3XV9J7n7SC6JkOxQOSaXQNkKqPc9Heh560Z+0DJUJbV9IqoAhKI50BM1QEAKW4asDANV3uKHOQt+7HlSOaaNSa9iS6iJKta7EMVEDMykEXBbgOj5+eQAAbtz3GjHHtRgeNYk26mjM9hbHBWogYIzl5TB6XcnXLoCaF98biKEEGQi+3wP/lVnsG+s62nQc1iQu8/Xi0rH1DfLtfY/kvf2bRKvpeS2US9uBN2Ju575nhnu+fDt5lHsAunhHhxJT74Yf/YZHifrpjGspmDv+GbP5mqBg6xukBEDkMJs0oXH9+VMFu1qSd5C/P5E/fs0RsVUoPLtB4gzlFYV83U26veCqBJFvX9w/8rTlC3utz85kwF1zdYeYWgeREJEbA/Vnm8wDQZI/EhZmeWA5F2OqLYdeINC+RR6LuPoEGv5Mpzt2JFkmHmyQoArDlyrCqHjk17zt/7MV1RZKgWj/RDrGRbKaLR3R6SdBWgqYwyon/4UY5xC+L1AVYVuumTr6gYo0+aks4G2V6mXLH3SbsvIQFsHf6IRDKFUHB5CiT73bFQu2UyyqeKxtfTy2FAK2KQIOsS3KqXdkbFgAnqqEHHjXYvJaXQrSd4FJCFRXaBIBx8b+623aBMpOl8quu0l+nL1zUQjYlgg41trezUxFlkbnj0CdWRvJhNrVuJufzUNjtvIjpHu4k85uisf4Mf2MyN03w6Ldq4ciDHF1U9WLp8sW5ygVPGWz+2Lnxp44AgQEN8TwFtsHIAJBT1MIYuUJTOkIP+Fq6mB55PHNuKxoETB8ZB3C4OAKUShuadF1SIq3hbh+mjHbj9AfoiTRllpRG7GJrSCiIDjNsyjrd0kDbZGGhs41WkkxU3hyxj1MSgX7EZpUQ+kRnztCf0YWJcWDP9IDAE3zIEo87pxzqlzDNu0wDupuWpGCTk65u0Mx9sj1/3rwOMrQG1fyLOvqQ1p5FuHKHR3DbZGhY8ptCRJt29XVpsQdOC+OYOCCghmRB13TX8n5MbetL+B/BcZBstROZ2qILTyS2zp+irK2a8pXBPG+Q4rIR5BXiyiupUXXASBaK3qeqaK0TY+azVXx+rGKa5yiRadsXiNPZ59zWEOAujjmoxwVpV5zS0lR2m6Ms/SG2K5oorOCQSEVqxadAyFwwfrkcP/6FM7r+BfbEy0WiBAMtXu6NARs4cp5W7qQOegyWirxds/yI+yDJ0XOa5p35aUeI/To2MprtDQEcyGONw2s40GnRksztOd8Cd6wUDhVyS/2VpWcJ0qqHiKLchuA0kPwHLZC0FQqWwa3bYoc28utnlXTKxEgtzELjdjcmVa6OOhvifk6iLo5Ci39+Gqa99urgUDHFOsBEP78PKJVZuGF3/yRfu1alaO6BgCSU2mUERyPHXhtJ9rtimj7GakANHsAXrIBXxHz3a3ui4w3n1kqwga0xOwZzd3pvbyuYy8DIZgCdPO5r/5P3jWfWopEJ9T0NoB6VwZcYxml1R2cR/O9DqRDAJsJIyUAfgAgWsZUFTJE0eyI0YiHx//RqRHbrKWLWkh4seWqp3gyyLB2LEiaS4Z3Vwo2fC4VgB1DNuqhl/geZ2yI4Qu24cLvbz4+e6TecFlUhgwh8UGs7rykdsouDS2aegGP79OPX+5po2bqGeFmUF8+DgCIo6vW1iZHBhiRY3G1p7wtqgMxdjSdueOc4RZrquJInCIMaa8+/oNIZ0Mw4U5vxsQU0Fyg7NCQlHeGjMDn3nE9qu61gQQAVCHlUdr5MEF4BUCS70X7aOHZsEibAHDfDlOGqHKV7YcBxNl+lwlfm2NHEdRXnUbpxbGT7rNHwKP0sZuye3EbVWkVUeR2jwtdaV9+FoAyEz54jbjay2eoSGwdmuKnLv0ggrqL4r0TqCu+ymQqU4vHhmD0iapPOmx9FO0JMe+K4pHOhXNVolkASCyt5Ooz2fMBAI84VPfIIG6Kwyjt5g7FXnpds3IBr7P/1BngqQXqNiWkAJnJgnxuoValbtYosrt7C5SHrXbltigvAEjvqbqehSSs75nJPG9uL9mXbMXW8vRqvn6yce6owvLzMpDZSjUkGZS49I9nXLD2yNglyq5nW3H5mvRNzick6NiVakjeCWy5eTqlqwLNsk6sT/jDeKkE9K/lxDsY1fOyAT0a8h10mOOCEHJGIdgpdJ8hHaNNM8655C4RJQ+szq8+PrBJZ6VYAsCtz5566LYiILPLlMUb1b+yXDAluZwokUTnTwBVW6VxHwBQYXU0UbtkD+o+P0H5c6kCSfw9YrbSNIwoCLJzNg5k3D6PbBWAIX1Gt2ZM/XvrNgJ2ijL3UgMGkchwBNc58FHdQuqlOjUo7cGz0Lqp9OgEIJ6kc+lLn6KcqZmtNrHNaZIHemcLbT2EBHSfp5EPiqVK9gf/kvToYGMde5dyJqj33kViq3xAur4qtl+kNCPQ9mwlAJhGAQDXZlBD3ksXBHuhHl0hAz0t3CpqrtUVjFTMCERV+OZlaiYRaR/Kowhp3qDMvRBf3+Ouv5AKeasYlIZJXcZtGMByUx+bIA+Q5pF3e6OxlTUniKM6jt5CINfORS043DQoLcTD36afLLdDIQqF4hLARl8ru1CE36eSzJ5QW8wDXoz25NJiiEFp82yN0pfoSCbJFA/Rov2isNjmrXuDWzyzM4iyw5l8YkBqQZ0QGDG5qGQvi3brhiphyAYAW6k19kr+sj/VfU2+1fOJtRiQJlpjILsLXg2VHhS+hAwSJQAg2cqsnWhBkbxyz92bILTU0wiyZ9c7YqI5yXqZ7/linFbZQgJAu3K22hHZRiOosR4VJLYumP3DIGPwebdnOM0LOaSTjXi8UG0ZGv72zL8X/2YFYHRHvS3mI9vKp2KLlhzmJ3rR7hiRO/ZWoElEDKOyMc/p7m4M0bKmS0MS+KxZEgBPT3e9AABAYcicjY9ttCK2YkiZj+nEQ7uOTY1ookmnEZPYuhZ8XqDwgPPuLZ/oLOQmBpj7NFI7JbgXQvQKgBG1MGTbwr7VzQrPWA7zG8bfpXLuHbVJkd9Po/IwJLvCsOMooE4Y8uqcWdZlJgL+s7K2k3VS3iEpxCQj1KG9ST3dbMfFIGzRSdTT8LuH2LqMW+ZjyqEW+0oMy7apqWe8cfZT0+EEnh2c9U4BCJKTdtvcMAAQWoonqODWJ8YyVHJcfTX8Xm/jpCtViOvk29MUsfE54QqxZx+ziksy2rJtb4KsklA+UI62bjvuuYiEBsb3jRwfKZshx4dZ84SEfVCR5V4Fy9nuLZDutNBsxSOJNjlHyhMotReNKSQUPbKYYmjhdFw0cDFK5O3eLwC5oKjNamx8aZQsPPsuz/iZKwQpfWgu2ckp5kUOTZ1P5wHyUzwVirtfhn5qokJWIcaIDNaEBjk2+mMZQPFONlaqXtlsjR4ojY2kRlA++BW+v187GaM5mCJ5DYeIbHCB6hMAUN5E54m5WJZpWbMm7GHd7tSN7c9W4A/UIkqYUAeoVKQ0bsw/KCHyyYcaCkEyIqMwRhlrM6UbOBj+2XKea51iud1s/JKQjIHKgH0YgMqk+cH/mfZhCbEaPjo5PSLP49jnZ6ucDs0c0edPyx30HVUNEfQP/zgVQZ0jV1xeIqLRy0cu44ErAMS/frHxcPQmhgCbGhZKTcK1PAJK+EqjBc+SVJdrnb5CsjHHvdpwKOSWqBo3+teFC6bRezMmrcifHI8twbGJBqjmPIA8vIZgPPBSVueGbKwGgDEaooziXVxDUiaYnnppRJUMj6+dgUwzDMHdUFg/5pJMV4W0p0Qt9+Dt5fvYXvkqsS4GxsMzF2I7iMSuL7S6Q00bDX8JZ2GjJvef5uqgvEuDCodnjktDd5AAlPve6NqtptMac7jRC+f2zKjC/FKK4gmAtjz8X61RhR6FgP6mNGWAEmTXRxUSNfFC4+dwaYa68wkAI60Nl49JmwApTvcT3uyQunkewXUAjlS5xDuZ8twH6W72DQNfR7GVemdImugI8fhZ8kJ1E/XssAyanEawVJyTTkq0AVA0+ikAhMA96VOoABzbxZGMVe4SEM6ObebJ/eZe0kIrAMe+kDfExuRQF/xDs9fRgZvcTt2ipRq9cgKQ4vhjAAQC9wyCCUBqugsAJ2SgSD8HgIbHY3yFdwLA3JUYWOODa68JoGnbT75Agcbfnxhf8QRgus/wQIsPZpyu9TNtDnB4tm9/9IWEh6ZXfXOs9JsAyIYHTXW61kLkoenyML4NAA3Rjmw9UV5ZYovIHFp0MGenZPz+S0RK3iR6gjDWEttIRuRUQdIyA/vjgd9+CwpSuaiOHk/ncWSGerr1wsXUU0Lm+R4udo4fhmt0oE+xfZM5uAnPWy/IHDpKyDuYffD+e2iIIUBt4/vvRkOGGgDgyLpT1anQUULumk72DS/SAUcjiz3jOdpxePvn+CJQ8Wo3FIOLwZOgyo2jBcBBuyM1odXf/kK1jkMSzLGcwWTlchx+51P/tJwQV+FzmAkFDARgU4s600u/aPolo3d51f/glXYYP5DIemUye5OUHDyYlX1d1sOEPrwyNAqYSTXIYkZhEJM7aSLb8K4yKhXS9Eu80q6t/slLBVHOKPjwOqOpODC84ahZdIz2Nd4b6jMAgBm4z19XRq/dcalwG03TL7uurP/Rax3BFZNFtKGMNswSrNbv7KU3tz7wSi+MKkK6c6jTO/J1ZbRvVA/aoZKCp1BX//DFmrV+EQ1lGk7FjnSskYgphHKeopgMOazqt74lHSVZ+TbCqSIlBnOqq5+/9TXvU1Gw0pvD+fee+j8AfwD+APwB+APwB+APwB+APwB/AP4A/K8D+H+wSQfVCduJqwAAAABJRU5ErkJggg==) center/cover no-repeat;box-shadow:0 0 0 1px rgba(60,20,0,.12)}\n.brand span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.brand{flex:1}\n.langsw{flex:none;display:inline-flex;gap:2px;padding:3px;border-radius:11px;border:1.5px solid var(--edge);background:var(--surface)}\n.langsw button{appearance:none;border:0;background:transparent;color:var(--ink-2);min-width:36px;height:30px;padding:0 6px;border-radius:8px;font-weight:700;font-size:12px;letter-spacing:.04em;cursor:pointer}\n.langsw button[aria-pressed=\"true\"]{background:var(--accent);color:var(--accent-ink)}\n.mhd .langsw{display:none}\n.badge{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--hot);color:var(--hot-ink);font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}\n.top .wrap{justify-content:flex-start;gap:12px}\n.menubtn{position:relative;flex:none;appearance:none;width:42px;height:42px;padding:0;border-radius:11px;border:1.5px solid var(--edge);background:var(--surface);color:var(--ink);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}\n.menubtn .badge[hidden]{display:none}\n.menubtn .badge{position:absolute;top:-8px;right:-8px;box-sizing:content-box;border:2px solid var(--bg);height:16px;min-width:16px;padding:0 3px;font-size:10px}\n\n/* меню: выдвигается слева; на широком экране стоит слева всегда */\n.mscrim{position:fixed;inset:0;z-index:60;background:rgba(10,20,18,.5)}\n.menu{position:fixed;top:0;bottom:0;left:0;z-index:61;width:min(86vw,300px);display:flex;flex-direction:column;background:var(--surface);border-right:1px solid var(--line);padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);padding-left:env(safe-area-inset-left,0px);transform:translateX(-104%);visibility:hidden;box-shadow:0 0 28px rgba(10,20,18,.28)}\nhtml.mn-open .menu{transform:none;visibility:visible}\nhtml.mn-open,html.mn-open body{overflow:hidden}\n@media (prefers-reduced-motion:no-preference){.menu{transition:transform .2s ease,visibility 0s linear .2s}html.mn-open .menu{transition:transform .2s ease,visibility 0s}}\n.mhd{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:var(--hdr);padding:6px 10px 6px 16px;border-bottom:1px solid var(--line)}\n.mhd .brand{flex:1}\n.mrole{flex:none;padding:8px 16px;border-bottom:1px solid var(--line);font-size:13px;color:var(--ink-2);overflow-wrap:anywhere}\n.mrole b{color:var(--ink);font-weight:600}\n.mclose{flex:none;appearance:none;width:40px;height:40px;padding:0;border:0;border-radius:10px;background:transparent;color:var(--ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}\n.mnav{flex:1;min-height:0;overflow-y:auto;padding:4px 10px 14px;overscroll-behavior:contain}\n.mgh{padding:18px 10px 5px;font:600 10.5px/1 var(--f-body);letter-spacing:.1em;text-transform:uppercase;color:var(--grp)}\n.mnav>.mgh:first-child{padding-top:12px}\n.mi{appearance:none;width:100%;min-height:44px;padding:10px;border:0;border-radius:10px;background:transparent;color:var(--ink);font-size:15px;font-weight:600;text-align:left;cursor:pointer;display:flex;align-items:center;gap:8px}\n.mi .ml{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.mi[aria-current=\"page\"]{background:var(--accent-soft)}\n.mi[data-here=\"1\"] .ml{color:var(--tx)}\n.mi .chev{flex:none;color:var(--ink-2)}\n.mgrp[aria-expanded=\"true\"] .chev{transform:rotate(180deg)}\n.msub{margin:2px 0 6px 18px;padding-left:8px;border-left:2px solid var(--line)}\n.msub .mi{min-height:40px;padding:8px 10px;font-size:14px;font-weight:500}\n.msub .mi[aria-current=\"page\"]{font-weight:600}\n}\n\n/* sections, chips */\n.sec{padding-top:18px}\n.sec h2{font:700 13px/1.2 var(--f-display);letter-spacing:.02em;display:flex;align-items:baseline;gap:10px;margin-bottom:12px}\n.chip{appearance:none;border:1.5px solid var(--edge);background:var(--surface-2);border-radius:999px;height:36px;min-width:36px;padding:0 12px;cursor:pointer;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}\n.chip[aria-pressed=\"true\"]{background:var(--bg);border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}\n\n/* forms */\n.lab{display:block;font-size:12px;font-weight:600;color:var(--ink-2);margin-bottom:6px}\n.ltag{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.03em;line-height:1.5;vertical-align:1px;background:var(--mute-soft);color:var(--ink-2);border:1px solid var(--line)}\n.ltag.uz{background:var(--accent-soft);color:var(--accent);border-color:transparent}\n.hint{display:block;font-size:12px;line-height:1.35;font-weight:400;color:var(--ink-2);margin:5px 0 0}\n.pf>.hint,.rvform>.hint{margin:-4px 0 0}\ninput[type=text],input[type=tel],input[type=number],input[type=date],input[type=search],select,textarea{width:100%;background:var(--bg);border:1.5px solid var(--edge);border-radius:10px;padding:11px 12px;min-width:0}\ninput:focus,select:focus,textarea:focus{border-color:var(--accent);outline:none;box-shadow:0 0 0 3px var(--accent-soft)}\ninput[aria-invalid=\"true\"],select[aria-invalid=\"true\"],textarea[aria-invalid=\"true\"]{border-color:var(--bad)}\ntextarea{resize:vertical;min-height:72px}\ninput[type=checkbox]{width:20px;height:20px;accent-color:var(--accent);margin:0}\n.form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\n.form .full{grid-column:1/-1}\n@media (max-width:540px){.form{grid-template-columns:minmax(0,1fr)}}\n.err{color:var(--bad);font-size:12px;margin-top:4px;min-height:0}\n.seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:var(--surface-2);border:1px solid var(--edge);padding:4px;border-radius:12px}\n.seg button{appearance:none;border:0;background:transparent;border-radius:9px;padding:10px 8px;font-weight:600;font-size:14px;color:var(--ink-2);cursor:pointer}\n.seg button[aria-pressed=\"true\"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(20,35,31,.14)}\n.sum{background:var(--surface);border:1.5px solid var(--edge);border-radius:14px;padding:6px 14px}\n.sum .r{display:flex;justify-content:space-between;gap:12px;padding:7px 0;font-size:14px;border-bottom:1px dashed var(--line)}\n.sum .r span:first-child{min-width:0;overflow-wrap:anywhere}\n.sum .r span:last-child{white-space:nowrap;font-variant-numeric:tabular-nums}\n.sum .r.t{border-bottom:0;font-weight:700;padding-top:10px}\n.sum .r.t span:last-child{font:700 16px var(--f-display)}\n.note{background:var(--accent-soft);border-radius:12px;padding:10px 12px;font-size:13px}\n.note.warnnote{background:var(--warn-soft);color:var(--warn);font-weight:600}\n.btn{appearance:none;border:0;border-radius:12px;padding:13px 18px;font-weight:600;font-size:15px;background:var(--accent);color:var(--accent-ink);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-align:center}\n.btn.ghost{background:var(--gbg);color:var(--ink);border:1.5px solid var(--edge);box-shadow:0 1px 4px rgba(0,0,0,.13)}\n.btn.sm{padding:7px 12px;font-size:13px;border-radius:10px}\n.btn.ghost.dangerbtn{color:var(--bad);border-color:var(--bad)}\n.btn[disabled]{opacity:.55;cursor:wait}\n.bar{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--surface);border-top:1px solid var(--line);padding-top:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}\n.bar .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px}\n.bar small{display:block;font-size:12px;color:var(--ink-2)}\n.bar strong{font:700 17px/1.2 var(--f-display);font-variant-numeric:tabular-nums}\n.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(88px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--bg);padding:10px 14px;border-radius:10px;font-size:13px;z-index:50;max-width:calc(100% - 32px);text-align:center}\n\n/* orders */\n.page{padding-block:18px 56px}\n.page h1{font:700 18px/1.25 var(--f-display);margin-bottom:6px;text-wrap:balance}\n.lead{color:var(--ink-2);margin-bottom:16px;max-width:60ch}\n.tagline{margin-top:4px;color:var(--ink-2);font-size:14px;line-height:1.4}\n.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0}\n@media (max-width:640px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.stat{background:var(--surface);border:1.5px solid var(--edge);border-radius:12px;padding:10px 12px}\n.stat small{display:block;font-size:12px;color:var(--ink-2)}\n.stat b{font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}\n.stat.hot{background:var(--accent-soft);border-color:var(--accent)}\n.payb{display:grid;gap:8px;background:var(--surface-2);border:1px solid var(--edge);border-radius:12px;padding:10px 12px;margin-top:4px}\n.payb .pt{font-weight:700;font-size:14px}\n.pmute{font-size:12px;color:var(--ink-2)}\n.pyrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px}\n.pyrow label{font-size:12px;color:var(--ink-2);flex:1 1 100%}\n.pyrow input[type=number]{width:130px;padding:8px 10px}\n.pyrow input[type=text]{flex:1 1 200px}\n.dlist{display:grid;gap:8px}\n.drow{appearance:none;width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--surface);border:1.5px solid var(--edge);border-radius:14px;padding:12px 14px;cursor:pointer;color:inherit;font:inherit}\n.drow.late{border-color:var(--bad)}\n.dn{min-width:0}\n.dn b{display:block;overflow-wrap:anywhere}\n.dn small,.da small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.da{text-align:right;flex:none}\n.da b{font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums}\n.da small.bad{color:var(--bad);font-weight:600}\n.dhead{margin-bottom:4px}\n.dhead h2{margin:0}\n.dsub{margin:18px 0 8px;font-size:15px}\n.lbox{background:var(--surface);border:1.5px solid var(--edge);border-radius:14px;padding:2px 12px}\n.lrow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 0;border-top:1px solid var(--line)}\n.lrow:first-child{border-top:0}\n.lrow.void .lt,.lrow.void .lsum{text-decoration:line-through;color:var(--mute)}\n.lt{min-width:0;flex:1 1 180px}\n.lt b{display:block;font-size:14px;overflow-wrap:anywhere}\n.lt small{font-size:12px;color:var(--ink-2)}\n.lsum{font:700 14px var(--f-display);font-variant-numeric:tabular-nums;white-space:nowrap}\n.lsum.pos{color:var(--ok)}\nbutton.lrow{appearance:none;width:100%;background:none;border:0;border-top:1px solid var(--line);color:inherit;font:inherit;text-align:left;cursor:pointer;border-radius:0}\nbutton.lrow:first-child{border-top:0}\nbutton.lrow{flex-wrap:nowrap}\nbutton.lrow .lt{flex:1 1 0}\n.lchev{flex:none;display:inline-flex;color:var(--ink-2)}\n.lchev svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s}\nbutton.lrow[aria-expanded=\"true\"] .lchev svg{transform:rotate(180deg)}\n.rolebox{background:var(--surface);border:1.5px solid var(--edge);border-radius:14px;padding:10px 14px;margin-bottom:12px;font-size:14px;display:grid;gap:4px;overflow-wrap:anywhere}\n.rolebox small{color:var(--ink-2);font-size:12px}\n.dbn{appearance:none;width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;background:var(--warn-soft);color:var(--warn);border:1px solid var(--warn);border-radius:12px;padding:10px 12px;margin-bottom:12px;cursor:pointer;font:inherit}\n.dbn.late{background:var(--bad-soft);color:var(--bad);border-color:var(--bad)}\n.dbn b{display:block;font-size:14px;overflow-wrap:anywhere}\n.dbn small{display:block;font-size:12px;font-weight:600}\n.dbn .lchev{color:inherit}\n.dbn .lchev svg{transform:rotate(-90deg)}\n.mdd{margin:18px 0 24px}\n.mdh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.mdh h2{margin:0;font-size:17px;min-width:0;overflow-wrap:anywhere}\n.mdsum{text-align:right;flex:none}\n.mdsum b{display:block;font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums}\n.mdsum small{display:block;font-size:12px;color:var(--ink-2)}\n.mdsum small.bad{color:var(--bad);font-weight:600}\n.ordx{display:grid;gap:4px;margin:0 0 10px;padding:10px 12px;background:var(--bg);border:1px solid var(--line);border-radius:12px;font-size:13px}\n.ordx .oxd{color:var(--ink-2);font-size:12px;margin-bottom:2px}\n.ordx .pl{display:flex;justify-content:space-between;gap:10px}\n.ordx .pl span:first-child{min-width:0;overflow-wrap:anywhere}\n.ordx .pl span:last-child{white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--ink-2)}\n.ordx .pl.t{margin-top:4px;padding-top:6px;border-top:1px solid var(--line);font-weight:700}\n.ordx .pl.t span:last-child{color:var(--ink)}\n.ordx .pl.left span:last-child{color:var(--bad);font-weight:700}\n.ordx .pl.ok span:last-child{color:var(--ok);font-weight:600}\n.pyrow input[type=tel]{flex:1 1 160px}\n.dvc{display:grid;gap:8px;background:var(--surface);border:1.5px solid var(--edge);border-radius:14px;padding:12px 14px}\n.dvh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.dvs{flex:none;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--mute-soft);color:var(--mute)}\n.dvs.ok{background:var(--ok-soft);color:var(--ok)}\n.dvs.wait{background:var(--warn-soft);color:var(--warn)}\n.dvcash{font-size:14px;color:var(--ink-2)}\n.dvcash b{color:var(--ink);font-variant-numeric:tabular-nums}\n.cfl{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;padding:0 0 10px}\n.cfs{display:flex;flex-wrap:wrap;gap:4px 6px;flex-basis:100%}\n.cfc{display:inline-block;font-size:12px;font-weight:700;line-height:1.35;padding:2px 9px;border-radius:999px;background:var(--mute-soft);color:var(--mute)}\n.cfc.ok{background:var(--ok-soft);color:var(--ok)}\n.cfc.warn{background:var(--warn-soft);color:var(--warn)}\n.cfc.bad{background:var(--bad-soft);color:var(--bad)}\n.cfl .payb{flex-basis:100%;margin-top:2px}\n.cfq{display:flex;flex-wrap:wrap;gap:6px;flex-basis:100%}\n.dsp{display:grid;gap:8px;background:var(--surface);border:1.5px solid var(--edge);border-radius:14px;padding:12px 14px}\n.dsp .dpw{font-size:14px;color:var(--ink-2)}\n.dsp .dpw b{color:var(--ink)}\n.dvnv{display:grid;gap:2px;padding:8px 0;border-top:1px solid var(--line)}\n.dvnv:first-child{border-top:0}\n.filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}\n.ordlist{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}\n@media (min-width:980px){.ordlist{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.ord{display:block;background:var(--surface);border:1.5px solid var(--oedge);border-left:7px solid var(--bar-mute);border-radius:14px;padding:8px 10px 9px 12px}\n.ord[data-st=\"new\"],.ord[data-st=\"accepted\"],.ord[data-st=\"ready\"]{border-left-color:var(--bc-bar)}\n.ord.is-new{background:var(--bc-bg);border-color:var(--bc-edge) var(--bc-edge) var(--bc-edge) var(--bc-bar)}\n.otop{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:26px;margin-bottom:3px}\n.thx{display:flex;gap:4px;min-width:0;overflow:hidden}\n.thx i,.thx b{flex:none;width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-style:normal;overflow:hidden;background:var(--bg);box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}\n.thx i img{width:100%;height:100%;object-fit:cover;display:block}\n.thx i.lt,.thx b{font-size:11px;font-weight:700;color:var(--ink-2);background:var(--surface-2)}\n.ord .st{padding:2px 8px;font-size:11px;flex:none}\n.ord .ob{min-width:0;display:grid;gap:3px;align-content:start}\n.oh{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}\n.oid{font:700 12px var(--f-display);letter-spacing:.02em}\n.when{font-weight:600}\n.spec{font-size:13px;color:var(--ink-2);overflow-wrap:anywhere}\n.ord .meta{display:flex;flex-wrap:wrap;gap:0 6px;align-items:baseline;font-size:12.5px;line-height:1.3}\n.ord .when,.ord .spec{font-size:12.5px}\n.cust{font-size:14px;display:flex;flex-wrap:wrap;align-items:center;gap:6px}\n.ord .cust{font-size:12.5px;gap:4px 6px;line-height:1.3}\n.ord .cust .btn.sm{height:26px;padding:0 9px;font-size:12px;border-radius:9px}\n.btn.sm.ic{width:28px;padding:0}\n.btn.ic svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.cm{font-size:13px;background:var(--surface-2);border:1px solid var(--edge);border-radius:8px;padding:6px 8px;overflow-wrap:anywhere}\n.tot{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}\n.tot b{font:700 15px var(--f-display);font-variant-numeric:tabular-nums}\n.tot span{font-size:12px;color:var(--ink-2)}\n.ord .tot{gap:6px}\n.ord .tot b{font-size:14px}\n.ord .tot span{font-size:11.5px}\n.acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}\n.ord .acts{gap:6px;margin-top:2px}\n.ord .acts .btn{flex:1 1 auto;padding:0 9px;min-height:32px;font-size:12px;border-radius:10px}\n.ord .acts .btn:only-child{flex:0 0 auto}\n.xtools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 12px}\n.xmenu{display:flex;flex-wrap:wrap;gap:6px;width:100%}\n.xmenu .chip[disabled]{opacity:.45;cursor:default}\n.xtools .unit{width:100%;font-size:12px;color:var(--ink-2)}\n.dxb::after{content:\" ▾\"}\n.dxb[aria-expanded=\"true\"]::after{content:\" ▴\"}\n.pov{position:fixed;inset:0;z-index:40;background:var(--bg);display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px)}\n.pov[hidden]{display:none}\n.pbar{display:flex;align-items:center;gap:8px;padding:8px max(12px,env(safe-area-inset-left,0px));border-bottom:1px solid var(--line)}\n.pbar .grow{flex:1}\n.pframe{flex:1;width:100%;border:0;background:#fff;color-scheme:light}\n.st{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600}\n.st::before{content:\"\";width:7px;height:7px;border-radius:50%;background:currentColor}\n.st.info{background:var(--info-soft);color:var(--info)}\n.st.warn{background:var(--warn-soft);color:var(--warn)}\n.st.ok{background:var(--ok-soft);color:var(--ok)}\n.st.bad{background:var(--bad-soft);color:var(--bad)}\n.st.mute{background:var(--mute-soft);color:var(--mute)}\n.empty{text-align:center;padding:36px 16px;color:var(--ink-2);background:var(--surface);border:1.5px dashed var(--edge);border-radius:16px}\n.empty b{display:block;color:var(--ink);font:700 15px var(--f-display);margin-bottom:6px}\n.ord .pl{display:flex;justify-content:space-between;gap:6px;font-size:12.5px;line-height:1.3}\n.ord .pl span:first-child{min-width:0;overflow-wrap:anywhere}\n.ord .pl span:last-child{white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--ink-2)}\n.ord .pls{display:grid;gap:3px}\n.ord .ptg{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:32px;margin:1px 0;padding:0 10px;border:0;border-radius:10px;background:var(--surface-2);color:var(--ink);font-family:inherit;font-size:13px;font-weight:600;line-height:1.2;text-align:left;cursor:pointer}\n.ord .ptg i{font-style:normal;font-size:12px;font-weight:600;color:var(--tx);white-space:nowrap}\n.ord .ptg i::after{content:\" ▾\"}\n.ord.fold:not(.open) .pls{display:none}\n.ord.fold.open .ptg i::after{content:\" ▴\"}\n\n/* settings, cards */\n.card{background:var(--surface);border:1.5px solid var(--edge);border-radius:16px;padding:14px;margin-bottom:14px}\n.card h3{font:700 13px var(--f-display);margin-bottom:2px}\n.card .unit{font-size:12px;color:var(--ink-2);margin-bottom:6px}\n.savebar{font-size:12px;color:var(--ink-2);min-height:18px;margin-bottom:10px}\n.savebar.bad{color:var(--bad)}\n.settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\n@media (max-width:540px){.settings{grid-template-columns:minmax(0,1fr)}}\n.settings .full{grid-column:1/-1}\n\n/* catalog (client) */\n.shop{padding-block:14px 130px}\n.shop h1{font:700 18px/1.25 var(--f-display);margin-bottom:12px}\n.shop .search{margin-bottom:10px}\n.pchips{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px 10px;scrollbar-width:none}\n.pchips::-webkit-scrollbar{display:none}\n.pchips .chip{flex:none;white-space:nowrap}\n.chead{font:700 14px var(--f-display);margin:20px 0 10px}\n.chg{padding:8px 0;border-top:1px solid var(--line);font-size:13px}\n.chg b{display:block;font-size:14px}.chg small{display:block;color:var(--ink-2)}\n.chg.bad small{color:var(--bad)}\n.impsum{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 0;font-size:13px}\n.impsum b{font-size:15px}\n.chead:first-child{margin-top:4px}\n.pgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}\n@media (min-width:640px){.pgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}\n@media (min-width:900px){.pgrid{grid-template-columns:repeat(4,minmax(0,1fr))}}\n.pcard{background:var(--surface);border:2px solid var(--edge);box-shadow:0 2px 6px var(--pcsh);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;min-width:0}\n.pcard.off .pimg img,.pcard.off .pimg .ph{opacity:.45;filter:grayscale(1)}\n.pcard.off .pname,.pcard.off .pprice{color:var(--ink-2)}\n.pimg{position:relative;aspect-ratio:4/3;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center;overflow:hidden}\n.pimg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}\n.ph{font-size:34px;line-height:1}\n.pimg .lbl{position:absolute;left:8px;top:8px;z-index:1;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:var(--info);color:var(--surface)}\n.pimg .lbl.sale{background:var(--bad)}\n.pimg .fav{position:absolute;right:6px;top:6px;z-index:2;width:38px;height:38px;border-radius:50%;border:0;padding:0;display:flex;align-items:center;justify-content:center;background:var(--surface);color:var(--ink-2);cursor:pointer;box-shadow:0 1px 3px rgba(20,35,31,.25)}\n.pimg .fav svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}\n.pimg .fav[aria-pressed=\"true\"]{color:var(--bad)}\n.pimg .fav[aria-pressed=\"true\"] svg{fill:currentColor}\n.pimg.zm{cursor:zoom-in}\n.pimg .pcnt{position:absolute;right:8px;bottom:8px;z-index:1;display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(20,35,31,.72);color:#fff;pointer-events:none}\n.pimg .pcnt svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\nhtml.lb-open,html.lb-open body{overflow:hidden}\n.lb{position:fixed;inset:0;z-index:200;background:#080c0b;display:flex;flex-direction:column;color:#fff;touch-action:pan-x}\n.lb-top{position:absolute;left:0;right:0;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;padding-top:max(10px,env(safe-area-inset-top))}\n.lb-cnt{font-size:14px;font-weight:700;padding:5px 12px;border-radius:999px;background:rgba(255,255,255,.14);min-width:8px}\n.lb-cnt:empty{background:transparent}\n.lb-x{appearance:none;border:0;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:28px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}\n.lb-track{flex:1;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;overscroll-behavior:contain}\n.lb-track::-webkit-scrollbar{display:none}\n.lb-slide{flex:0 0 100%;scroll-snap-align:center;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;padding:64px 0;box-sizing:border-box;cursor:zoom-out}\n.lb-slide img{max-width:100%;max-height:100%;object-fit:contain;display:block;cursor:default;user-select:none;-webkit-user-drag:none}\n.lb-slide .ph{font-size:72px}\n.lb-dots{position:absolute;left:0;right:0;bottom:max(18px,env(safe-area-inset-bottom));display:flex;gap:8px;justify-content:center;pointer-events:none}\n.lb-dots i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.4)}\n.lb-dots i.on{background:#fff}\n.pold{display:inline-block;margin-right:6px;font:500 12px var(--f-body);color:var(--ink-2);text-decoration:line-through}\n.psale{margin-left:6px;font:700 11px var(--f-body);color:var(--bad)}\n.ptier{display:block;font:500 11.5px/1.35 var(--f-body);color:var(--ink-2);margin-top:1px}\n.ptier.on{color:var(--tx);font-weight:700}\n.ppack{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n.ppack .chip{flex:1 1 auto;height:auto;min-height:34px;padding:5px 8px;font-size:12px;white-space:nowrap}\n.cline>.ppack{grid-column:1/-1;margin-top:0}\n.cline .cn small.tiernext{color:var(--tx);font-weight:600}\n.cline .cn small.packtxt{color:var(--ink-2)}\n.sum .r.disc span:last-child{color:var(--ok);font-weight:600}\n.tiers{display:grid;gap:6px}\n.trow{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink-2)}\n.trow input{width:0;flex:1 1 70px;min-width:0;padding:8px 8px}\n.trow span{flex:none}\n.sact select{flex:0 1 auto;max-width:100%;padding:9px 10px;border-radius:10px;border:1.5px solid var(--edge);background:var(--surface)}\n.snum small.pk{margin-top:2px;font-size:11px;color:var(--ink-2)}\n/* отчёты */\n.rkpi small.dl{margin-top:2px;font-size:11.5px;font-weight:600}\n.rkpi small.dl.up{color:var(--ok)}\n.rkpi small.dl.down{color:var(--bad)}\n.rkpi small.dl.flat{color:var(--ink-2)}\n.rnote{font-size:12px;color:var(--ink-2);margin:6px 0 0}\n.rread{min-height:20px;font-size:13px;margin:6px 0 8px;color:var(--ink)}\n.rread b{font-variant-numeric:tabular-nums}\n.rchart{position:relative;display:grid;grid-template-columns:44px minmax(0,1fr);gap:6px;padding-top:8px}\n.ryax{position:relative;height:150px;font-size:11px;color:var(--ink-2);font-variant-numeric:tabular-nums}\n.ryax span{position:absolute;right:0;transform:translateY(50%);white-space:nowrap}\n.rplot{position:relative;height:150px;isolation:isolate}\n.rgrid{position:absolute;left:0;right:0;border-top:1px solid var(--line);pointer-events:none}\n.rcols{position:absolute;inset:0;display:flex;align-items:flex-end;gap:2px;touch-action:pan-y}\n.rcol{appearance:none;border:0;background:transparent;padding:0;margin:0;flex:1 1 0;min-width:0;max-width:30px;height:100%;display:flex;align-items:flex-end;justify-content:center;cursor:pointer;position:relative}\n.rcol i{display:block;width:100%;max-width:24px;background:var(--accent);border-radius:4px 4px 0 0;min-height:0}\n.rcol[aria-pressed=\"true\"]::after{content:\"\";position:absolute;inset:0;background:var(--accent-soft);z-index:-1;border-radius:4px}\n.rcol:focus-visible{outline:2px solid var(--accent);outline-offset:1px}\n.rxax{display:flex;justify-content:space-between;margin:4px 0 0 50px;font-size:11px;color:var(--ink-2)}\n.rrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:8px 0;border-top:1px solid var(--line)}\n.rrow .rl{min-width:0}\n.rrow .rl b{display:block;font-weight:600;font-size:14px;overflow-wrap:anywhere}\n.rrow .rl small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.rrow .rv{font:700 13px var(--f-display);font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}\n.rbar{grid-column:1/-1;height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 1px var(--edge)}\n.rbar i{display:block;height:100%;background:var(--accent);border-radius:4px}\n.rbuy{padding:10px 0;border-top:1px solid var(--line);display:grid;gap:4px}\n.rlist>div:first-child{border-top:0}\n.rlist+.btn{margin-top:8px}\n.rgap{margin-top:10px}\n.rbuy .rh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.rbuy .rh b{font-weight:600;font-size:14px;overflow-wrap:anywhere}\n.rbuy small{font-size:12.5px;color:var(--ink-2)}\n.rtab table{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}\n.rtab th,.rtab td{text-align:right;padding:5px 4px;border-top:1px solid var(--line)}\n.rtab th:first-child,.rtab td:first-child{text-align:left}\n.rtab th{font-weight:600;color:var(--ink-2);font-size:12px}\n.pimg .tag{position:absolute;left:8px;top:8px;background:var(--ink);color:var(--bg);font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;z-index:1}\n.pbody{padding:10px 12px 12px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}\n.pname{font-weight:600;font-size:14px;line-height:1.3;overflow-wrap:anywhere}\n.pw{font-size:12px;color:var(--ink-2)}\n.pdesc{font-size:12px;color:var(--ink-2);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;cursor:pointer}\n.pdesc.open{display:block}\n.pprice{font:700 15px var(--f-display);margin-top:auto;padding-top:6px;font-variant-numeric:tabular-nums}\n.padd{margin-top:8px;width:100%;min-height:41px}\n.stepper{display:flex;align-items:center;justify-content:space-between;margin-top:8px;height:41px;box-sizing:border-box;border:1.5px solid var(--accent);border-radius:12px;overflow:hidden;background:var(--surface)}\n.stepper button{appearance:none;border:0;background:var(--accent-soft);color:var(--tx);width:40px;height:100%;flex:none;font-size:20px;font-weight:700;line-height:1;cursor:pointer}\n.stepper button[disabled]{opacity:.4;cursor:not-allowed}\n.stepper input.qty{flex:1;min-width:0;width:100%;border:0;border-radius:0;background:transparent;text-align:center;font:700 15px var(--f-display);padding:0 2px;height:100%;font-variant-numeric:tabular-nums;-moz-appearance:textfield;appearance:textfield}\n.stepper input.qty::-webkit-outer-spin-button,.stepper input.qty::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}\n.stepper input.qty:focus{box-shadow:none;background:var(--accent-soft)}\n.stepper.sm{margin-top:0;height:auto;width:132px}\n.stepper.sm button{width:34px;height:32px;font-size:18px}\n.stepper.sm input.qty{height:32px}\n.cline{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}\n.cline:first-child{border-top:0}\n.cth{width:56px;height:56px;border-radius:10px;overflow:hidden;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center;position:relative}\n.cth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.cth .ph{font-size:24px}\n.cline .cn{min-width:0}\n.cline .cn b{display:block;font-size:14px;font-weight:600;line-height:1.3;overflow-wrap:break-word}\n.cline .cn small{display:block;font-size:12px;color:var(--ink-2)}\n.cline .cr{display:grid;gap:6px;justify-items:end}\n.cline .cs{font:700 13px var(--f-display);font-variant-numeric:tabular-nums;white-space:nowrap}\n.backlink{margin-bottom:10px}\n@media (max-width:380px){\n  .cline{grid-template-columns:56px minmax(0,1fr)}\n  .cline .cr{grid-column:1/-1;grid-template-columns:auto auto;justify-content:space-between;align-items:center;justify-items:stretch}\n  .cline .cs{text-align:right}\n}\n\n/* seller: catalog editor */\n.prow{padding:12px;margin:16px -6px 0;border:1.5px solid var(--line);border-radius:14px;background:var(--bg);box-shadow:inset 4px 0 0 var(--accent)}\n.prow.off{box-shadow:inset 4px 0 0 var(--mute)}\n.prow.fold{padding:8px 12px;margin-top:10px}\n.pfbody{display:grid;grid-template-columns:232px minmax(0,1fr);gap:14px;margin-top:12px;padding-top:12px;border-top:1.5px solid var(--line)}\n.psum{appearance:none;width:100%;display:flex;align-items:center;gap:10px;text-align:left;background:none;border:0;padding:0;color:inherit;font:inherit;cursor:pointer;border-radius:10px;min-height:56px}\n.psum .pth{width:48px;height:48px;border-radius:10px;overflow:hidden;background:var(--mute-soft);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;flex:none}\n.psum .pth img{width:100%;height:100%;object-fit:cover}\n.psum .ptx{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 0}\n.psum .ptx b{overflow-wrap:anywhere}\n.psum .ptx small{color:var(--ink-2)}\n.psum .ptx em{font-style:normal;color:var(--warn);font-weight:600}\n.psum .ptx i{font-style:normal;color:var(--ink-2)}\n.ppills{display:flex;flex-wrap:wrap;gap:4px}\n.ppills:empty{display:none}\n.psum[aria-expanded=\"true\"] .lchev svg{transform:rotate(180deg)}\n.mtag.off{background:var(--bad-soft);color:var(--bad)}\n.mtag.sale{background:var(--warn-soft);color:var(--warn)}\n.mtag.new{background:var(--info-soft);color:var(--info)}\n.pfoldbar{margin:10px 0 0}\n.pfoldbtn{margin-left:auto}\n.prow.off .pf{opacity:.8}\n.pph{display:flex;flex-direction:column;gap:8px;align-items:flex-start}\n.pslots{display:grid;grid-template-columns:repeat(3,72px);gap:8px}\n.pslots.busy{pointer-events:none}\n.pslot{position:relative;width:72px;height:72px;border-radius:12px;overflow:hidden}\n.pslot label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;cursor:pointer;background:linear-gradient(160deg,var(--stage-a),var(--stage-b))}\n.pslot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.pslot.has{border:1px solid var(--line)}\n.pslot.add label{background:var(--accent-soft);color:var(--tx);border:2px dashed var(--accent);border-radius:12px;font-size:30px;font-weight:300;line-height:1}\n.pslot.ghost{border:2px dashed var(--line);background:transparent}\n.pslot .px{position:absolute;right:3px;top:3px;width:24px;height:24px;border-radius:50%;border:0;padding:0;background:rgba(20,35,31,.72);color:#fff;font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}\n.pslot .pmain{position:absolute;left:3px;bottom:3px;font-size:10px;font-weight:700;padding:2px 6px;border-radius:999px;background:var(--accent);color:#fff;pointer-events:none}\n.pslot.load::after{content:\"…\";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.72);color:var(--ink);font-size:26px;font-weight:700}\n.phint{font-size:12px;line-height:1.4;color:var(--ink-2);max-width:260px}\n.row-btns label.dis{opacity:.6;pointer-events:none}\n.sr{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none}\n.pf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;min-width:0}\n.pf .full{grid-column:1/-1}\n.pf>div:not(.full){display:flex;flex-direction:column;justify-content:flex-end}\n.pf>div>input[type=number],.pf>div>input[type=text],.pf>div>input[type=tel],.pf>div>select{height:50px}\n.pf textarea{min-height:56px}\n.pf .avail{display:flex;align-items:flex-end;padding-bottom:10px}\n.chk{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}\n.pact{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.crow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px;align-items:end;padding:10px 0 6px}\n.crow+.crow{border-top:1px solid var(--line)}\n.crow .x{appearance:none;border:0;background:transparent;font-size:22px;line-height:1;color:var(--ink-2);cursor:pointer;width:36px;height:36px;border-radius:10px;margin-bottom:7px}\n@media (max-width:480px){\n  .crow{grid-template-columns:minmax(0,1fr) auto}\n  .crow .x{grid-column:2;grid-row:1/3;align-self:center;margin-bottom:0}\n  .crow>div{grid-column:1}\n}\n@media (max-width:560px){\n  .pfbody{grid-template-columns:minmax(0,1fr)}\n  .pslots{grid-template-columns:repeat(3,minmax(0,1fr));width:100%;max-width:288px}\n  .pslot{width:auto;height:auto;aspect-ratio:1}\n}\n\n/* stock: status line on product cards, seller screen «Остатки» */\n.pst{font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;color:var(--ok)}\n.pst::before{content:\"\";width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}\n.pst.low{color:var(--warn)}\n.cline .cn small.lowtxt{color:var(--warn);font-weight:600}\n.badge.warn{background:var(--warn-soft);color:var(--warn)}\n.srow{padding:14px 0;border-top:1px solid var(--line);display:grid;gap:10px}\n.srow:first-child{border-top:0;padding-top:4px}\n.sh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.sh .sn{min-width:0}\n.sh .sn b{display:block;font-weight:600;overflow-wrap:anywhere}\n.sh .sn small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.snum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\n.snum div{background:var(--surface-2);border:1px solid var(--edge);border-radius:10px;padding:8px 10px;min-width:0}\n.snum small{display:block;font-size:11px;color:var(--ink-2)}\n.snum b{font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums}\n.snum .fr.low{background:var(--warn-soft)}\n.snum .fr.low b{color:var(--warn)}\n.snum .fr.out{background:var(--bad-soft)}\n.snum .fr.out b{color:var(--bad)}\n.sact{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.sact input[type=number]{flex:0 0 150px;width:150px;padding:9px 10px}\n@media (max-width:480px){.sact input[type=number]{flex:1 1 100%;width:auto}}\n@media (max-width:480px){.sact.haspk input[type=number]{flex:1 1 110px;min-width:0}.sact.haspk select{flex:1 1 130px;min-width:0}}\n.sth{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:13px;color:var(--ink-2)}\n.sth input[type=number]{width:90px;padding:8px 10px}\n.jrow{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid var(--line);font-size:14px}\n.jrow:first-of-type{border-top:0}\n.jrow .jn{min-width:0}\n.jrow .jn b{display:block;font-weight:600;overflow-wrap:anywhere}\n.jrow small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.jrow .jd{text-align:right;flex:none;font:700 14px var(--f-display);font-variant-numeric:tabular-nums}\n.jrow .jd small{font:400 12px var(--f-body)}\n.jrow .jd.plus{color:var(--ok)}\n.jrow .jd.minus{color:var(--bad)}\n\n/* клиенты */\n.cmeta{font-size:12.5px;color:var(--ink-2);margin-top:6px}\n.ced{margin-top:12px;display:grid;gap:14px}\n.ced .form{gap:12px}\n.ced h3{font:700 13px var(--f-display)}\n.gchips,.achips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n.gchips .chip{height:30px;font-size:12px;padding:0 10px}\n.achips .chip{height:auto;min-height:34px;padding:6px 12px;text-align:left;justify-content:flex-start;max-width:100%;white-space:normal;line-height:1.3;overflow-wrap:anywhere}\n.ck{display:flex;gap:10px;align-items:flex-start;font-size:14px;cursor:pointer}\n.ck small{display:block;color:var(--ink-2);font-size:12px}\n.corder{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4px 10px;font-size:13px;padding:7px 0;border-top:1px dashed var(--line)}\n.corder:first-of-type{border-top:0}\n.corder .oid{font-weight:700}\n.corder .cs{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.corder .cshop{flex-basis:100%;font-size:12px;color:var(--ink-2)}\n.cmine{appearance:none;display:flex;align-items:center;gap:8px;width:100%;text-align:left;background:var(--surface-2);border:1px solid var(--edge);border-radius:10px;padding:7px 10px;min-height:38px;cursor:pointer;color:var(--ink);font:inherit;font-size:13px}\n.cmine .cmt{flex:1;min-width:0;display:grid;gap:3px;overflow-wrap:anywhere}\n.cmine .cmt small{font-size:12px;color:var(--ink-2)}\n.cmine .cbadges{display:flex;flex-wrap:wrap;gap:4px}\n.cmine svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transform:rotate(-90deg);flex:none;color:var(--ink-2)}\n.bnote b{font-weight:700}\n.bfrow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:2px 2px 8px}\n.bfrow .bfound{margin:0}\n.cst{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:2px 0 12px}\n.cst>div{background:var(--surface-2);border:1px solid var(--edge);border-radius:12px;padding:8px 10px;min-width:0}\n.cst small{display:block;font-size:11.5px;color:var(--ink-2)}\n.cst b{display:block;font-size:14px;overflow-wrap:anywhere}\n.csec{margin:0 0 14px}\n.csec h3{font:700 13px var(--f-display);margin:0 0 6px}\n.cact{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}\n.cact .btn{flex:1 1 120px;text-align:center}\n.bannerbad{background:var(--bad-soft);color:var(--bad);border-radius:12px;padding:10px 12px;font-size:13px;font-weight:600}\n\n/* placed */\n.eyebrow{font-size:12px;font-weight:600;color:var(--tx);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}\n.stack{display:grid;gap:12px}\n.row-btns{display:flex;flex-wrap:wrap;gap:8px}\n/* список дистрибьюторов и раздел владельца */\n.dgrid{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:14px}\n@media (max-width:540px){.dgrid{grid-template-columns:minmax(0,1fr)}}\n.dcard{background:var(--surface);border:1.5px solid var(--edge);border-radius:16px;padding:14px;display:grid;gap:8px;align-content:start;min-width:0}\n.dcard h2{font:700 16px/1.25 var(--f-display);overflow-wrap:anywhere}\n.dmeta{font-size:13px;color:var(--ink-2)}\n.dcats{display:flex;flex-wrap:wrap;gap:6px}\n.dcats span{background:var(--surface-2);box-shadow:inset 0 0 0 1px var(--edge);border-radius:999px;padding:3px 9px;font-size:12px}\n.dtag{font-size:12px;font-weight:600;color:var(--tx)}\n.mono{font:700 19px/1.35 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.04em;background:var(--surface-2);border:1px solid var(--edge);padding:10px 12px;border-radius:10px;overflow-wrap:anywhere;user-select:all}\n.mono.small{font-size:13px;letter-spacing:0;font-weight:600}\n.codebox{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}\n.regs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px;margin-top:10px}\n@media (max-width:540px){.regs{grid-template-columns:minmax(0,1fr)}}\n.regs[hidden]{display:none}\n.regs .chk{min-height:34px}\n.regbar{margin-bottom:14px}\n.bcard{background:var(--surface);border:1.5px solid var(--edge);border-radius:16px;padding:14px;display:grid;gap:8px;margin-bottom:12px;min-width:0}\n.bcard h3{margin:0;overflow-wrap:anywhere}\n.brow,.btags{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.btags{gap:6px}\n.btag{font-size:12px;font-weight:600;padding:2px 9px;border-radius:999px;background:var(--accent-soft);color:var(--tx)}\n.btag.warn{background:var(--warn-soft);color:var(--warn)}\n.btag.mute{background:var(--mute-soft);color:var(--mute)}\n.bnote{font-size:13px;background:var(--surface-2);border:1px solid var(--edge);border-radius:10px;padding:8px 10px;white-space:pre-wrap;overflow-wrap:anywhere}\n.chip .cnt{opacity:.7;margin-left:5px;font-weight:500}\n.trow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px}\n.trow input{flex:1 1 150px;min-width:0}\n.trow .dtag{min-width:24px;text-align:center}\n.trow{flex-wrap:nowrap}.trow .btn.sm{flex:none;min-width:40px;padding:0 10px}\n.page>.search{margin-bottom:10px}\n.tsel{display:flex;flex-wrap:wrap;gap:4px 14px;margin:6px 0 10px}\n.regbar select{width:100%}\n.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px}\n.hrow h1{margin-bottom:0}\n.pctrow{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin:12px 0 4px}\n.pctrow>div{flex:0 0 auto}\n.pctrow input[type=text]{width:96px}\n.sum small.sub{display:block;font-size:12px;color:var(--ink-2)}\n.bpage{padding-bottom:30px}\n.btop{display:flex;align-items:center;gap:10px;margin-bottom:12px}\n.page .btop h1{margin:0;font-size:18px;min-width:0;overflow-wrap:anywhere}\n.btop .btn{margin-left:auto;flex:none;height:40px;padding:0 14px}\n.qbtn{appearance:none;flex:none;width:34px;height:34px;border-radius:50%;border:1.5px solid var(--edge);background:var(--surface);font:700 16px/1 var(--f-body);color:var(--ink-2);cursor:pointer;padding:0}\n.alink{display:flex;align-items:center;gap:8px;margin-bottom:10px;background:var(--surface);border:1.5px solid var(--edge);border-radius:12px;padding:5px 6px 5px 12px}\n.alink .mono{flex:1;min-width:0;background:transparent;padding:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;letter-spacing:0;user-select:text}\n.bpage .search{margin-bottom:10px}\n.bbar{position:relative;display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px 2px;scrollbar-width:none}\n.bbar::-webkit-scrollbar{display:none}\n.bbar .chip{flex:none;height:42px;padding:0 14px;gap:6px;white-space:nowrap;font-size:14px}\n.chip svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}\n.chip.on{border-color:var(--accent);background:var(--accent-soft);color:var(--tx)}\n.fbtn .cnt2{background:var(--accent);color:#fff;border-radius:999px;min-width:20px;height:20px;font-size:12px;display:inline-flex;align-items:center;justify-content:center;padding:0 5px}\n.selc{position:relative}\n.selc select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:16px}\n.anp .chip.selc{gap:6px;max-width:100%}\n.anp .chip.selc span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.chip.x .xx{margin-left:2px;font-size:13px}\n.bfound{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin:2px 2px 8px}\n.bcard{padding:12px 14px;gap:6px;margin-bottom:10px;grid-template-columns:minmax(0,1fr)}\n.bcard>*{min-width:0}\n.bcard.dim{opacity:.62}\n/* карточка магазина в «Базе»: цвет заметно отличается от фона экрана */\n.bcard.bst{--bc-bg:var(--surface);--bc-edge:var(--oedge);--bc-in:var(--bg);background:var(--bc-bg);border:1.5px solid var(--bc-edge);border-left:6px solid var(--bc-bar);padding-left:10px}\n.bcard.bst .cmine,.bcard.bst .bnote{background:var(--bc-in)}\n.bh{display:flex;align-items:center;gap:8px;min-width:0}\n.bh h3{flex:0 1 auto;min-width:0;font-size:16px;line-height:1.25}\n.bsigns{display:flex;gap:8px;flex:none}\n.who-s{margin:2px 0 10px}\n.who .wtags{display:flex;flex-wrap:wrap;gap:2px 12px}\n.who .bh h3{font-size:15px}\n.bh .dtag{margin-left:auto;flex:none;padding-left:4px}\n.sgn{position:relative;width:26px;height:26px;border-radius:50%;border:0;padding:0;display:inline-flex;align-items:center;justify-content:center;flex:none;font:inherit}\nbutton.sgn{cursor:pointer}\n.sgn::after{content:\"\";position:absolute;inset:-7px}\n.sgn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.sgn b{font-size:15px;line-height:1}\n.sgn.talk{background:var(--accent-soft);color:var(--tx)}\n.sgn.warn{background:var(--warn-soft);color:var(--warn)}\n.sgn.app{background:var(--info-soft);color:var(--info)}\n.sgn.refuse{background:var(--mute-soft);color:var(--mute)}\n.bact{display:flex;flex-wrap:wrap;gap:5px;align-items:stretch;margin-top:2px}\n.bic{display:flex;gap:4px;flex:none;margin-left:auto}\n.bphone{flex:1 1 150px;min-width:0;height:40px;border:1.5px solid var(--edge);border-radius:12px;background:var(--surface);display:flex;align-items:center;gap:6px;padding:0 10px;font-weight:600;font-size:14px;white-space:nowrap;color:var(--ink);text-decoration:none}\n.bphone svg{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.bphone span{min-width:0;overflow:hidden;text-overflow:ellipsis}\n.bact.tight .bphone svg{display:none}\n.ibtn{appearance:none;flex:none;width:38px;height:40px;padding:0;border:1.5px solid var(--edge);border-radius:12px;background:var(--surface);color:var(--ink);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}\n.ibtn svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.ibtn.ok{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}\n.ibtn[disabled]{opacity:.5;cursor:default}\nhtml.sh-open,html.sh-open body{overflow:hidden}\n.fs-bg{position:fixed;inset:0;z-index:44;background:rgba(10,20,18,.5)}\n.fs{position:fixed;left:0;right:0;bottom:0;z-index:45;background:var(--surface);border-radius:22px 22px 0 0;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 -8px 30px rgba(10,20,18,.25);max-width:560px;margin:0 auto}\n.fs-grab{width:40px;height:4px;border-radius:2px;background:var(--line);margin:10px auto 2px;flex:none}\n.fs-head{display:flex;align-items:center;justify-content:space-between;padding:8px 18px;flex:none}\n.fs-head h2{font:700 20px/1.2 var(--f-display)}\n.lnk{appearance:none;border:0;background:transparent;color:var(--tx);font:600 15px var(--f-body);cursor:pointer;padding:8px 0 8px 12px}\n.fs-body{overflow-y:auto;padding:0 18px 8px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}\n.fs-t{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2);margin:12px 0 8px}\n.fs-c{display:flex;flex-wrap:wrap;gap:8px}\n.fs-c .chip{height:40px;padding:0 14px;font-size:14px}\n.fs-foot{padding:10px 18px calc(14px + env(safe-area-inset-bottom,0px));flex:none}\n.fs-foot .btn{width:100%;height:48px}\n.lgd{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:transparent;border:0;border-top:1px solid var(--line);padding:12px 0;font:inherit;color:inherit;cursor:pointer}\ndiv.lgd{cursor:default}\n.lgd:first-child{border-top:0}\n.lgd small{display:block;color:var(--ink-2);font-size:13px;margin-top:2px}\n.lgn{font-size:13px;color:var(--ink-2);padding:8px 0 14px}\n/* проверка товаров: клиент */\n.pcard.pend{background:var(--mute-soft);border-style:dashed;border-color:var(--edge);box-shadow:none}\n.pcard.incart{border-color:var(--accent)}\n.pcard.pend .pimg img,.pcard.pend .pimg .ph{opacity:.5;filter:grayscale(1)}\n.pcard.pend .pname{color:var(--ink-2)}\n.pimg .tag.mod{background:var(--warn-soft);color:var(--warn)}\n.pwait{margin-top:auto;padding-top:6px;font-size:12px;font-weight:600;color:var(--ink-2)}\n.chip.mod{border-style:dashed}\n.modnote{margin-bottom:12px}\n/* проверка товаров: продавец */\n.mtag{display:inline-flex;align-items:center;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--mute-soft);color:var(--mute);white-space:nowrap;width:max-content}\n.mtag.wait{background:var(--info-soft);color:var(--info)}\n.mtag.ret{background:var(--bad-soft);color:var(--bad)}\n.mh:empty{display:none}\n.mhead{border-radius:12px;padding:10px 12px;background:var(--mute-soft)}\n.mhead.ret{background:var(--bad-soft)}\n.mrow{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}\n.mreason{margin-top:8px;border-left:3px solid var(--bad);background:var(--surface);border-radius:8px;padding:8px 10px;font-size:13px;overflow-wrap:anywhere;white-space:pre-wrap}\n.mreason small{display:block;font-size:11px;font-weight:700;color:var(--bad);margin-bottom:2px;white-space:normal}\n.mgroup{margin:10px 0 6px;padding:10px;border:1.5px dashed var(--edge);border-radius:14px;background:var(--surface)}\n.mgroup h4{font:700 13px var(--f-display);margin:0 0 8px}\n.mcard{border:1.5px solid var(--edge);border-radius:12px;padding:10px;margin-top:8px;background:var(--surface)}\n.mcard .mtop{display:flex;gap:10px;align-items:center}\n.mcard .mth{width:52px;height:52px;border-radius:10px;overflow:hidden;background:var(--mute-soft);display:flex;align-items:center;justify-content:center;flex:none}\n.mcard .mth img{width:100%;height:100%;object-fit:cover}\n.mcard .mtx{display:flex;flex-direction:column;gap:3px;min-width:0}\n.mcard .mtx b{overflow-wrap:anywhere}\n.mcard .mtx small{color:var(--ink-2)}\n.mact{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}\n.mban{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:8px 0}\n/* проверка товаров: владелец */\n.badge.bad{background:var(--bad);color:#fff}\n.seg.s3{grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:12px}\n.seg.s3 button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;font-size:13px;line-height:1.2}\n.seg.s3 .cnt{font-size:15px;color:var(--ink-2)}\n.seg.s3 .cnt.hot{color:var(--bad)}\n.rvfil{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:8px;margin-bottom:8px}\n.rvfil select{min-width:0;width:100%;font-size:14px;padding-left:10px;padding-right:6px;text-overflow:ellipsis}\n.rvinfo{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0 12px;font-size:13px;color:var(--ink-2);min-height:34px}\n.rcard{border:1.5px solid var(--edge);background:var(--surface);border-radius:16px;padding:12px;margin-bottom:12px}\n.rtop{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}\n.dpill{appearance:none;border:0;border-radius:999px;background:var(--accent-soft);color:var(--tx);font:700 13px var(--f-body);padding:7px 13px;cursor:pointer;max-width:68%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpill.static{cursor:default;max-width:100%}\n.rtime{font-size:12px;color:var(--ink-2);white-space:nowrap}\n.rbody{display:flex;gap:12px}\n.rth{width:96px;height:96px;flex:none;border-radius:12px;overflow:hidden;position:relative;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center}\n.rth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.rth.zm{cursor:zoom-in}\n.rth .pcnt{position:absolute;right:5px;bottom:5px;font-size:10px;font-weight:700;padding:2px 6px;border-radius:999px;background:rgba(20,35,31,.72);color:#fff}\n.rtx{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}\n.rtx b{overflow-wrap:anywhere}\n.rtx small{color:var(--ink-2);overflow-wrap:anywhere}\n.rprice{font:700 16px var(--f-display);margin-top:4px;font-variant-numeric:tabular-nums}\n.rtiers{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--ink-2)}\n.rwarn{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}\n.rwarn span{font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--warn-soft);color:var(--warn)}\n.ract{display:flex;gap:8px;margin-top:12px}\n.ract .btn{flex:1;min-width:0;padding:11px 6px;font-size:14px}\n.rsum{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:4px 0 10px}\n.rsum small{color:var(--ink-2);flex-basis:100%}\n.rcount{font-size:12px;color:var(--ink-2);text-align:right;margin-top:4px}\n.rvform .err,.fs-foot .err{color:var(--bad);font-size:13px;min-height:0}\n.fs-foot .err:empty{display:none}\n.fs-foot .err{margin-bottom:8px}\n/* точка магазина */\n.lchip{appearance:none;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;height:32px;padding:0 12px 0 9px;font:600 13px var(--f-body);display:inline-flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap}\n.lchip svg{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.lchip.add{border-style:dashed;color:var(--tx)}\n.lchip[disabled],.llink[disabled]{opacity:.5}\n.bloc{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px}\n.lchips{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px}\n.dkm{font-size:13px;font-weight:700;color:var(--ink-2);font-variant-numeric:tabular-nums}\n.llink{appearance:none;border:0;background:transparent;color:var(--tx);font:600 13px var(--f-body);cursor:pointer;padding:6px 2px}\n.cloc{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:var(--info-soft);color:var(--info);border-radius:10px;padding:8px 10px;font-size:13px;font-weight:600}\n.cloc i{display:inline-block;font-style:normal;font-size:11px;font-weight:700;background:var(--surface);border-radius:999px;padding:1px 7px;margin-left:4px;color:var(--ink-2)}\n.locbtns{display:flex;gap:6px;flex-wrap:wrap}\n.locok{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:var(--ok-soft);color:var(--ok);border-radius:10px;padding:8px 10px;font-weight:600;font-size:14px}\n.locok i{font-style:normal;font-size:12px;color:var(--warn)}\n.locbtn{display:flex;width:100%;gap:8px}\n.locbtn svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.locform{display:grid;gap:8px}\n.locpaste{display:flex;gap:8px;align-items:center}\n.locpaste input{flex:1;min-width:0}\n.locform .err{min-height:0}\n.oloc{margin:6px 0}\n.mapbtns{display:grid;gap:10px;margin:6px 0 12px}\n.mapco{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0 10px;color:var(--ink-2)}\n@media (prefers-reduced-motion:no-preference){.chip,.seg button{transition:border-color .12s,background-color .12s}}\n/* широкий экран: меню стоит слева всегда (правила стоят в конце, чтобы переопределить .bar и .toast) */\n@media (min-width:1000px){\n  body{padding-left:260px}\n  .top{display:none}\n  .menu{width:260px;z-index:15;transform:none;visibility:visible;box-shadow:none}\n  .mscrim,.mclose{display:none}\n  .mhd .langsw{display:inline-flex}\n  .bar{left:260px}\n  .toast{left:calc(50% + 130px)}\n</style>\n</head><body>\n\n<header class=\"top\"><div class=\"wrap\">\n  <button type=\"button\" class=\"menubtn\" id=\"menubtn\" data-act=\"menu\" aria-haspopup=\"dialog\" aria-controls=\"menu\" aria-expanded=\"false\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 22 22\" aria-hidden=\"true\"><path d=\"M3 6h16M3 11h16M3 16h16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg><span class=\"badge bad\" id=\"menubadge\" hidden></span></button>\n  <div class=\"brand\">\n    <span class=\"logo\" role=\"img\" aria-label=\"Sarbon\"></span>\n    <span id=\"brandName\"></span>\n  </div>\n  <div class=\"langsw\" id=\"langsw\" role=\"group\"><button type=\"button\" data-act=\"setlang\" data-lg=\"ru\" title=\"Русский\">RU</button><button type=\"button\" data-act=\"setlang\" data-lg=\"uz\" title=\"Oʻzbekcha\">UZ</button></div>\n</div></header>\n<div class=\"mscrim\" id=\"mscrim\" data-act=\"menuclose\" hidden></div>\n<aside class=\"menu\" id=\"menu\" role=\"dialog\" aria-modal=\"true\">\n  <div class=\"mhd\">\n    <div class=\"brand\">\n      <span class=\"logo\" role=\"img\" aria-label=\"Sarbon\"></span>\n      <span id=\"mbrand\"></span>\n    </div>\n    <div class=\"langsw\" role=\"group\"><button type=\"button\" data-act=\"setlang\" data-lg=\"ru\" title=\"Русский\">RU</button><button type=\"button\" data-act=\"setlang\" data-lg=\"uz\" title=\"Oʻzbekcha\">UZ</button></div>\n    <button type=\"button\" class=\"mclose\" data-act=\"menuclose\" id=\"mclose\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M4 4l12 12M16 4 4 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg></button>\n  </div>\n  <div class=\"mrole\" id=\"mrole\" hidden></div>\n  <nav class=\"mnav\" id=\"nav\"></nav>\n</aside>\n<main id=\"view\"></main>\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\" hidden></div>\n\n<script>\n/* Общий код: настройки, единицы измерения, время, тексты заказа. Используется и в приложении, и на сервере. */\nlet LANG='ru';\nconst setLang=l=>{LANG=l==='uz'?'uz':'ru'};\nconst L=(ru,uz)=>LANG==='uz'?uz:ru;\nconst nm=o=>!o?'':(LANG==='uz'&&o.uz?o.uz:o.name);\n\n/* статусы; у самовывоза и доставки «Готов» и «Завершён» называются по-разному */\nconst STATUS={\n  new:{name:'Новый',uz:'Yangi',c:'info'},\n  accepted:{name:'В работе',uz:'Ishlanmoqda',c:'warn'},\n  ready:{name:'Готов',uz:'Tayyor',c:'ok'},\n  done:{name:'Завершён',uz:'Yakunlandi',c:'mute'},\n  cancelled:{name:'Отменён',uz:'Bekor qilindi',c:'bad'}\n};\nconst STATUS_MODE={\n  pickup:{ready:{name:'Готов к выдаче',uz:'Topshirishga tayyor'},done:{name:'Выдан',uz:'Topshirildi'}},\n  delivery:{ready:{name:'Готов к отправке',uz:'Joʻnatishga tayyor'},done:{name:'Доставлен',uz:'Yetkazildi'}}\n};\nfunction stOf(status,mode){\n  const b=STATUS[status]||STATUS.new;\n  const m=(STATUS_MODE[mode==='delivery'?'delivery':'pickup']||{})[status];\n  return m?Object.assign({},b,m):b;\n}\n\nconst DEFAULT={\n  v:3,\n  shop:{name:'Оптовая база',phone:'',telegram:'',address:'',addressUz:'',delivery:true,leadHours:2,deliveryLeadHours:24,openFrom:9,openTo:20,minOrder:0,deliveryFee:0,freeDeliveryFrom:0,discounts:[],regions:[],home:''}\n};\nconst clone=o=>JSON.parse(JSON.stringify(o));\nconst pad=n=>String(n).padStart(2,'0');\nconst ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());\nconst nf=new Intl.NumberFormat('ru-RU');\nconst num=v=>nf.format(Math.round(Number(v)||0));\nconst money=v=>num(v)+' '+L('сум','soʻm');\nconst esc=s=>String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\n\n/* единицы измерения: вес или объём одной единицы товара */\nconst UNIT_IDS=['g','kg','pc','ml','l'];\nconst UNITS={g:{ru:'г',uz:'g'},kg:{ru:'кг',uz:'kg'},pc:{ru:'шт',uz:'dona'},ml:{ru:'мл',uz:'ml'},l:{ru:'л',uz:'l'}};\nconst unitName=u=>{const x=UNITS[u]||UNITS.g;return LANG==='uz'?x.uz:x.ru};\nconst amountStr=v=>String(Math.round((Number(v)||0)*1000)/1000).replace('.',',');\nconst weightLabel=p=>Number(p&&p.amount)>0?amountStr(p.amount)+' '+unitName(p.unit):'';\nconst prodDesc=p=>LANG==='uz'&&p.descUz?p.descUz:(p.desc||'');\n\n/* Метки товара: «Акция» (со старой ценой) и «Новинка». Старая цена показывается, только если она выше нынешней. */\nconst TAGS={sale:{ru:'Акция',uz:'Aksiya'},new:{ru:'Новинка',uz:'Yangilik'}};\nconst tagName=t=>TAGS[t]?(LANG==='uz'?TAGS[t].uz:TAGS[t].ru):'';\nconst oldPrice=p=>p&&p.tag==='sale'&&Number(p.old)>Number(p.price)?Number(p.old):0;\nconst salePct=p=>{const o=oldPrice(p);return o?Math.max(1,Math.min(99,Math.round((o-Number(p.price))/o*100))):0};\n\n/* Цена за штуку зависит от количества: у товара до трёх ступеней tiers=[{n, price}] («от n шт — price»), по возрастанию n и убыванию цены.\n   Считается по штукам этого товара в заказе, и цена ступени действует на все штуки. */\nconst tiersOf=p=>Array.isArray(p&&p.tiers)?p.tiers:[];\nfunction unitPrice(p,qty){\n  let pr=Number(p&&p.price)||0;\n  tiersOf(p).forEach(t=>{if(qty>=Number(t.n)&&Number(t.price)>0&&Number(t.price)<pr)pr=Number(t.price)});\n  return pr;\n}\n/* Следующая ступень, до которой не хватает штук: {n, price, left} или null. */\nfunction nextTier(p,qty){\n  const cur=unitPrice(p,qty);\n  const t=tiersOf(p).find(x=>Number(x.n)>qty&&Number(x.price)>0&&Number(x.price)<cur);\n  return t?{n:Number(t.n),price:Number(t.price),left:Number(t.n)-qty}:null;\n}\n/* Скидка от суммы заказа: cfg.shop.discounts=[{from, pct}] — «от суммы from скидка pct %». Берётся самая большая из достигнутых. */\nfunction orderDiscount(cfg,sub){\n  let pct=0;\n  (((cfg&&cfg.shop&&cfg.shop.discounts)||[])).forEach(d=>{if(sub>=Number(d.from)&&Number(d.pct)>pct)pct=Number(d.pct)});\n  return {pct,amount:pct?Math.round(sub*pct/100):0};\n}\n/* Следующая скидка, до которой не хватает суммы: {from, pct, left} или null. */\nfunction nextDiscount(cfg,sub){\n  const cur=orderDiscount(cfg,sub).pct;\n  const d=(((cfg&&cfg.shop&&cfg.shop.discounts)||[])).find(x=>Number(x.from)>sub&&Number(x.pct)>cur);\n  return d?{from:Number(d.from),pct:Number(d.pct),left:Number(d.from)-sub}:null;\n}\n\n/* Чистка ступеней цены и скидок: одни и те же правила в приложении и на сервере.\n   Ступени цены: до трёх, «от n шт» (n от 2 до 500) по возрастанию, цена каждой ниже обычной и ниже предыдущей. */\nconst cleanTiers=(a,price)=>{\n  const t=[];\n  (Array.isArray(a)?a:[]).forEach(x=>{\n    if(!x||typeof x!=='object')return;\n    const n=Math.round(Number(x.n)),pr=Math.round(Number(x.price));\n    if(n>=2&&n<=500&&pr>=1&&pr<=1e8)t.push({n,price:pr});\n  });\n  t.sort((x,y)=>x.n-y.n);\n  const out=[];let prev=Number(price)||0;\n  t.forEach(x=>{\n    if(out.length&&x.n===out[out.length-1].n)return;\n    if(x.price<prev){out.push(x);prev=x.price}\n  });\n  return out.slice(0,3);\n};\n/* Скидки от суммы заказа: до трёх ступеней «от суммы — %»; сумма растёт, процент (1–50) строго растёт, иначе ступень отбрасывается. */\nconst cleanDiscounts=a=>{\n  const t=[];\n  (Array.isArray(a)?a:[]).forEach(d=>{\n    if(!d||typeof d!=='object')return;\n    const from=Math.round(Number(d.from)),pct=Math.round(Number(d.pct));\n    if(from>=1&&from<=1e9&&pct>=1)t.push({from,pct:Math.min(50,pct)});\n  });\n  t.sort((x,y)=>x.from-y.from);\n  const out=[];\n  t.forEach(d=>{\n    const last=out[out.length-1];\n    if(last&&(d.from===last.from||d.pct<=last.pct))return;\n    out.push(d);\n  });\n  return out.slice(0,3);\n};\n\n/* Упаковки: у товара поля box («в коробке N шт») и blk («в блоке N шт»), оба необязательные. Цена и склад всегда в штуках. */\nconst PACK_KEYS=['box','blk'];\nconst packSize=(p,k)=>{const n=Math.floor(Number(p&&p[k]));return n>=2?n:0};\nconst packShort=k=>k==='box'?L('кор.','quti'):L('бл.','blok');\nconst packWord=k=>k==='box'?L('коробка','quti'):L('блок','blok');\nconst pcsWord=()=>L('шт','dona');\n/* Раскладывает штуки по упаковкам, сначала по большим: 100 шт при коробке 48 и блоке 12 → 2 кор. + 0 бл., остаток 4 шт. */\nfunction packSplit(p,qty){\n  const parts=[];let r=Math.max(0,Math.floor(Number(qty)||0));\n  PACK_KEYS.forEach(k=>{const n=packSize(p,k);if(n&&r>=n){const c=Math.floor(r/n);parts.push({k,c,n});r-=c*n}});\n  return {parts,rest:r};\n}\n/* «2 кор. × 12 шт» (одна упаковка, без остатка), «2 кор. + 1 бл. + 4 шт» (иначе); пусто, если упаковок нет или в количество не вошла ни одна. */\nfunction packText(p,qty){\n  const {parts,rest}=packSplit(p,qty);\n  if(!parts.length)return '';\n  if(parts.length===1&&!rest)return parts[0].c+' '+packShort(parts[0].k)+' × '+parts[0].n+' '+pcsWord();\n  return parts.map(x=>x.c+' '+packShort(x.k)).concat(rest?[rest+' '+pcsWord()]:[]).join(' + ');\n}\n\n/* Остаток товара s = {q: на складе, r: отложено под заказы, low: порог «мало»}; нет записи — учёт не ведётся.\n   Покупателям: av — сколько можно заказать (не больше cap, чтобы не раскрывать большие остатки), lw — товара мало, и число показываем в подписи «Мало (осталось N)». */\nconst stkAvail=s=>s?Math.max(0,(Number(s.q)||0)-(Number(s.r)||0)):null;\nfunction stkPublic(s,cap){\n  if(!s)return undefined;\n  const a=stkAvail(s),lw=a>0&&Number(s.low)>0&&a<=Number(s.low);\n  return {av:lw||!(cap>0)?a:Math.min(a,cap),lw};\n}\n\n/* Стоимость доставки: берётся только при доставке; если указан порог «бесплатно от» и сумма товаров его достигла, доставка бесплатна. */\nfunction deliveryFee(cfg,mode,sub){\n  const sh=cfg.shop,fee=Number(sh.deliveryFee)||0,free=Number(sh.freeDeliveryFrom)||0;\n  if(mode!=='delivery'||fee<=0)return 0;\n  return free>0&&Number(sub)>=free?0:fee;\n}\nfunction mergeCfg(d){\n  const out=clone(DEFAULT);\n  if(d&&typeof d==='object'&&d.shop&&typeof d.shop==='object')Object.keys(out.shop).forEach(k=>{if(d.shop[k]!==undefined&&d.shop[k]!==null)out.shop[k]=d.shop[k]});\n  return out;\n}\n\n/* Регионы Узбекистана: 12 областей, Каракалпакстан и город Ташкент.\n   Дистрибьютор отмечает, куда доставляет (shop.regions; пустой список — по всей стране) и где его склад (shop.home, для самовывоза).\n   Магазин выбирает свой регион. Самовывоз всегда возможен, ограничена только доставка. */\nconst REGIONS=[\n  {id:'kk',ru:'Республика Каракалпакстан',uz:'Qoraqalpogʻiston Respublikasi'},\n  {id:'an',ru:'Андижанская область',uz:'Andijon viloyati'},\n  {id:'bu',ru:'Бухарская область',uz:'Buxoro viloyati'},\n  {id:'ji',ru:'Джизакская область',uz:'Jizzax viloyati'},\n  {id:'qa',ru:'Кашкадарьинская область',uz:'Qashqadaryo viloyati'},\n  {id:'nv',ru:'Навоийская область',uz:'Navoiy viloyati'},\n  {id:'nm',ru:'Наманганская область',uz:'Namangan viloyati'},\n  {id:'sa',ru:'Самаркандская область',uz:'Samarqand viloyati'},\n  {id:'su',ru:'Сурхандарьинская область',uz:'Surxondaryo viloyati'},\n  {id:'si',ru:'Сырдарьинская область',uz:'Sirdaryo viloyati'},\n  {id:'tv',ru:'Ташкентская область',uz:'Toshkent viloyati'},\n  {id:'tk',ru:'Город Ташкент',uz:'Toshkent shahri'},\n  {id:'fa',ru:'Ферганская область',uz:'Fargʻona viloyati'},\n  {id:'xo',ru:'Хорезмская область',uz:'Xorazm viloyati'}\n];\nconst REGION_IDS=REGIONS.map(r=>r.id);\nconst regionName=id=>{const r=REGIONS.find(x=>x.id===id);return r?(LANG==='uz'?r.uz:r.ru):''};\n/* один регион: его номер или пустая строка */\nconst cleanRegion=v=>typeof v==='string'&&REGION_IDS.includes(v)?v:'';\n/* список регионов без повторов и лишнего, в порядке справочника */\nconst cleanRegions=a=>{const set=new Set(Array.isArray(a)?a:[]);return REGION_IDS.filter(id=>set.has(id))};\n/* Ограничена ли доставка: отмечены не все регионы, а часть. Пустой список и «все четырнадцать» — по всей стране. */\n/* Региональный фильтр пока выключен: работаем только по Навои, регионы нигде не показываются и доставку не ограничивают (даже если когда-то были отмечены).\n   Чтобы вернуть, поставьте REGIONS_DEFAULT = true. Тесты включают его через globalThis.__regionsOn. */\nconst REGIONS_DEFAULT=false;\nconst regionsOn=()=>typeof globalThis.__regionsOn==='boolean'?globalThis.__regionsOn:REGIONS_DEFAULT;\nconst hasZone=a=>{if(!regionsOn())return false;const n=cleanRegions(a).length;return n>0&&n<REGION_IDS.length};\n/* Доставляет ли дистрибьютор (запись из списка или настройки) в регион. Нет региона у клиента — считаем, что доставляет. */\nconst deliversTo=(sh,reg)=>!!sh&&sh.delivery!==false&&(!hasZone(sh.regions)||!reg||cleanRegions(sh.regions).includes(reg));\n/* Подходит ли дистрибьютор клиенту из региона reg: доставляет к нему или находится в его регионе (самовывоз). */\nconst servesRegion=(sh,reg)=>!!sh&&(deliversTo(sh,reg)||(!!reg&&sh.home===reg));\n\n/* Время склада: Узбекистан, UTC+5. Возвращает Date, у которого локальные часы совпадают со стенными часами склада. */\nconst SHOP_TZ=5;\nfunction shopNow(){return new Date(Date.now()+SHOP_TZ*3600000+new Date().getTimezoneOffset()*60000)}\n/* сколько часов нужно на подготовку: самовывоз и доставка настраиваются отдельно */\nconst leadFor=(cfg,mode)=>mode==='delivery'?cfg.shop.deliveryLeadHours:cfg.shop.leadHours;\nfunction pickupInfo(cfg,now,leadHours){\n  now=now||shopNow();\n  const lead=Math.max(0,Number(leadHours!==undefined?leadHours:cfg.shop.leadHours)||0);\n  const from=Math.max(0,Math.min(22,Math.floor(Number(cfg.shop.openFrom)||9)));\n  const to=Math.max(from+1,Math.min(23,Math.floor(Number(cfg.shop.openTo)||20)));\n  const earliest=new Date(now.getTime()+lead*3600000);\n  const slots=ds=>{\n    const out=[];\n    for(let m=from*60;m<=to*60;m+=30){\n      const t=pad(Math.floor(m/60))+':'+pad(m%60);\n      const dt=new Date(ds+'T'+t+':00');\n      if(dt>=earliest)out.push(t);\n    }\n    return out;\n  };\n  let min=ymd(earliest);\n  for(let i=0;i<20;i++){\n    const d=new Date(earliest.getFullYear(),earliest.getMonth(),earliest.getDate()+i);\n    if(slots(ymd(d)).length){min=ymd(d);break}\n  }\n  const md=new Date(now.getFullYear(),now.getMonth(),now.getDate()+60);\n  return {min,max:ymd(md),slots};\n}\nconst UZ_WD=['yak','dush','sesh','chor','pay','jum','shan'];\nconst UZ_MO=['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentyabr','oktyabr','noyabr','dekabr'];\nfunction fmtWhen(s){\n  const d=new Date(s);\n  if(isNaN(d))return s||'';\n  if(LANG==='uz')return UZ_WD[d.getDay()]+', '+d.getDate()+'-'+UZ_MO[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes());\n  return d.toLocaleString('ru-RU',{weekday:'short',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});\n}\nfunction prodLine(it){\n  const w=weightLabel(it);\n  const pk=packText(it,it.qty);\n  return '• '+nm(it)+(w?' ('+w+')':'')+' × '+it.qty+(pk?' ('+pk+')':'')+' = '+money(it.price*it.qty);\n}\n/* Текст заказа для Telegram. maxItems: если список очень длинный, показываем первые позиции и пишем, сколько скрыто. */\nfunction orderText(o,shop,maxItems){\n  const items=o.items||[],P=[];\n  const shown=maxItems&&items.length>maxItems?items.slice(0,maxItems):items;\n  P.push(L('Заказ ','Buyurtma ')+o.id+' — '+(shop.name||DEFAULT.shop.name));\n  P.push(L('Товары:','Mahsulotlar:'));\n  shown.forEach(it=>P.push(prodLine(it)));\n  if(shown.length<items.length){\n    const n=items.length-shown.length;\n    P.push(L('… и ещё '+n+' поз. (полный список в приложении)','… va yana '+n+' ta pozitsiya (toʻliq roʻyxat ilovada)'));\n  }\n  if(o.mode==='delivery'){\n    P.push(L('Доставка: ','Yetkazib berish: ')+fmtWhen(o.pickupAt));\n    if(o.region&&regionName(o.region))P.push(L('Регион: ','Hudud: ')+regionName(o.region));\n    P.push(L('Адрес: ','Manzil: ')+(o.address||''));\n  }else P.push(L('Самовывоз: ','Olib ketish: ')+fmtWhen(o.pickupAt));\n  P.push(L('Имя: ','Ism: ')+o.name+L(', тел.: ',', tel.: ')+o.phone);\n  if(o.org)P.push(L('Организация: ','Tashkilot: ')+o.org);\n  if(o.comment)P.push(L('Комментарий: ','Izoh: ')+o.comment);\n  if(o.disc>0)P.push(L('Скидка '+o.dpct+'%: −','Chegirma '+o.dpct+'%: −')+money(o.disc));\n  if(o.fee>0)P.push(L('Стоимость доставки: ','Yetkazib berish narxi: ')+money(o.fee));\n  P.push(L('Итого: ','Jami: ')+money(o.total)+L(', оплата при получении',', olganda toʻlanadi'));\n  return P.join('\\n');\n}\n\n/* ---------- местоположение ---------- */\n/* Точка на карте: {lat, lng} с пятью знаками (около метра) или null, если это не координаты. */\nfunction cleanLoc(v){\n  if(!v||typeof v!=='object'||Array.isArray(v))return null;\n  const n=x=>typeof x==='number'?x:(typeof x==='string'&&x.trim()!==''?Number(x):NaN);\n  const lat=n(v.lat),lng=n(v.lng);\n  if(!isFinite(lat)||!isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180||(lat===0&&lng===0))return null;\n  return {lat:Math.round(lat*1e5)/1e5,lng:Math.round(lng*1e5)/1e5};\n}\n/* Ссылка на точку: k — «y» (Яндекс.Карты) или «g» (Google Maps). */\nconst mapUrl=(k,p)=>k==='g'?'https://www.google.com/maps/search/?api=1&query='+p.lat+','+p.lng:'https://yandex.com/maps/?pt='+p.lng+','+p.lat+'&z=17&l=map';\n/* Расстояние между точками, км (по дуге большого круга). */\nfunction distKm(a,b){\n  const r=Math.PI/180,dl=(b.lat-a.lat)*r,dg=(b.lng-a.lng)*r;\n  const h=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dg/2)**2;\n  return 12742*Math.asin(Math.min(1,Math.sqrt(h)));\n}\n/* Координаты из того, что вставил человек: ссылка Яндекс.Карт, Google Maps, 2ГИС, OpenStreetMap или просто «41.5543, 60.6361».\n   Короткие ссылки (maps.app.goo.gl, yandex.uz/maps/-/…) координат не содержат: для них вернётся null. */\nfunction parseGeo(text){\n  let s=String(text==null?'':text).trim().slice(0,2000);\n  if(!s)return null;\n  try{s=decodeURIComponent(s)}catch(e){}\n  const F='(-?\\\\d{1,3}(?:\\\\.\\\\d+)?)',pair=(a,b)=>cleanLoc({lat:a,lng:b});\n  let m;\n  if(/yandex\\.|ya\\.ru|2gis\\./i.test(s)){\n    // у Яндекса и 2ГИС порядок «долгота, широта»\n    m=s.match(new RegExp('[?&#/](?:pt|ll|m)=\\\\s*'+F+'\\\\s*[,;]\\\\s*'+F));\n    if(m)return pair(m[2],m[1]);\n  }\n  m=s.match(/!3d(-?\\d+(?:\\.\\d+)?)!4d(-?\\d+(?:\\.\\d+)?)/);      // Google: метка\n  if(m)return pair(m[1],m[2]);\n  m=s.match(new RegExp('@'+F+'\\\\s*,\\\\s*'+F));                   // Google, Apple: центр карты\n  if(m)return pair(m[1],m[2]);\n  m=s.match(new RegExp('[?&](?:q|query|ll|sll|center|destination|daddr|saddr)=\\\\s*'+F+'\\\\s*[,;+ ]\\\\s*'+F));\n  if(m)return pair(m[1],m[2]);\n  m=s.match(new RegExp('[?&]mlat='+F+'&mlon='+F));            // OpenStreetMap\n  if(m)return pair(m[1],m[2]);\n  m=s.match(new RegExp('#map=\\\\d{1,2}/'+F+'/'+F));\n  if(m)return pair(m[1],m[2]);\n  // просто числа: «41.5543, 60.6361», «41.5543 60.6361», «41,5543 60,6361»\n  const t=s.replace(/^[^\\d-]+/,'').replace(/[^\\d.,;\\s-]+$/,'');\n  m=t.match(/^(-?\\d{1,3}(?:[.,]\\d+)?)\\s*[;\\s]\\s*(-?\\d{1,3}(?:[.,]\\d+)?)$/)||t.match(/^(-?\\d{1,3}\\.\\d+)\\s*,\\s*(-?\\d{1,3}\\.\\d+)$/);\n  if(!m)m=s.match(new RegExp('(-?\\\\d{1,2}\\\\.\\\\d{3,})\\\\s*[,;/\\\\s]\\\\s*(-?\\\\d{1,3}\\\\.\\\\d{3,})'));\n  if(m){\n    let a=Number(String(m[1]).replace(',','.')),b=Number(String(m[2]).replace(',','.'));\n    if(Math.abs(a)>90&&Math.abs(b)<=90){const x=a;a=b;b=x}\n    return pair(a,b);\n  }\n  return null;\n}\n\n\n/* ---------- app ---------- */\nconst $=(s,r)=>(r||document).querySelector(s);\nconst MAX_QTY=500,MAX_LINES=30,MAX_CATS=40,MAX_ITEMS=300;\nconst S={\n  view:'shops',sellerTab:'orders',filter:'active',msub:null,dbt:newDebts(),mdebt:newMyDebt(),pay:null,courier:null,cr:newCour(),dv:newDv(),\n  cfg:clone(DEFAULT),\n  form:{name:'',phone:'',mode:'pickup',address:'',date:'',time:'',comment:'',region:'',terr:'',loc:null},\n  region:'',showFar:false,regSent:false,regOnly:null,\n  myOrders:[],allOrders:[],stats:{doneSum:0,doneCount:0},\n  tg:null,initData:'',uid:null,admin:false,auth:false,ready:false,authErr:'',\n  busy:false,dirty:false,saving:false,again:false,saveState:'',cc:null,ox:{},\n  prod:{cats:[],items:[]},cart:{},shopCat:'all',shopStep:'list',shopPlaced:null,q:'',\n  pfilter:'all',medit:{},pxo:{},upl:{},dirtyC:false,dirtyP:false,cd:null,\n  stk:{},stkLoaded:false,sfilter:'all',sbusy:{},sc:null,jr:[],jrOpen:false,\n  profile:null,blocked:false,pfBusy:false,\n  pm:false,xbusy:'',pick:null,pickBusy:false,\n  fav:[],favT:null,favSeq:0,imp:null,impBusy:false,\n  rep:{days:30,data:null,busy:false,err:false,sel:-1,hov:-1,allP:false,tab:false,seq:0,drag:false,skip:0},\n  an:{days:30,sh:'',tab:'cats',sort:'sum',all:false,data:null,shops:[],err:false,seq:0},\n  did:'',epoch:0,switching:false,off:false,otherCart:null,\n  hub:{title:'',shops:[],me:null,terrs:[],loaded:false,err:false},\n  own:{sec:'dist',dn:0,disp:{ok:false,items:[],note:{},busy:''},shops:[],title:'',max:50,loaded:false,err:false,made:null,busy:'',fname:'',fcode:'',ftitle:null,rc:'',err2:'',period:'month',stats:null,serr:false,pcts:{},ppl:null,pbusy:false,perr:'',tname:'',aname:'',acode:'',aterr:[],amade:null,imp:null,who:{ok:false,err:false,people:[],total:0,q:'',f:'all',all:false}},\n  rv:{seg:'wait',items:[],counts:{wait:0,ret:0,ok:0},shops:[],loaded:false,err:false,q:'',did:'',cat:'',busy:false,ret:null,rtxt:'',edit:null},\n  base:{role:'',loaded:false,err:false,items:[],total:0,all:0,counts:{},unchk:0,terrs:[],mine:[],agents:[],more:false,terr:'',f:'',ag:'',sort:'',sheet:false,legend:false,q:'',busy:false,seq:0,qt:null,edit:null,fm:{},ferr:'',near:null,link:'',locBusy:false,mark:'',mc:false,cd:'',cx:null,cdd:null,cf:null,cbusy:false,cseq:0}\n};\nconst view=$('#view');\nlet toastT=null,saveT=null;\n\nfunction toast(msg){\n  const t=$('#toast');t.textContent=msg;t.hidden=false;\n  clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},Math.min(8000,Math.max(3200,String(msg).length*55)));\n}\nconst waitMs=ms=>new Promise(r=>setTimeout(r,ms));\nconst QS=new URLSearchParams(location.search);\nconst validDid=d=>/^[a-z0-9]{2,12}$/.test(String(d||''));\nconst okey=(id,d)=>d+'|'+id;\nconst plTovar=n=>{const a=n%100,b=n%10;return a>=11&&a<=14?'товаров':b===1?'товар':b>=2&&b<=4?'товара':'товаров'};\nconst hubTitle=()=>S.hub.title||'Sarbon';\nconst isOwner=()=>!!(S.hub.me&&S.hub.me.owner);\nconst isAgent=()=>!!(S.hub.me&&S.hub.me.agent);\n/* общая база магазинов: смотрят владелец, агенты и дистрибьюторы */\nconst canBase=()=>!!(S.auth&&S.hub.me&&(isOwner()||isAgent()||S.hub.me.sells.length));\nconst canList=()=>S.hub.shops.length>1||!!(S.hub.me&&(S.hub.me.owner||S.hub.me.sells.length>1));\nconst backHTML=()=>canList()?'<button type=\"button\" class=\"btn ghost sm backlink\" data-act=\"shops\">← '+L('Все дистрибьюторы','Barcha distribyutorlar')+'</button>':'';\nconst offTxt=()=>L('Этот дистрибьютор сейчас не принимает заказы.','Bu distribyutor hozir buyurtma qabul qilmayapti.');\nconst offHTML=()=>S.off?'<div class=\"bannerbad\" role=\"alert\" style=\"margin-bottom:12px\">'+esc(offTxt())+'</div>':'';\nconst sellLink=()=>{const m=S.hub.me&&S.hub.me.sells.find(x=>x.id===S.did);return m&&m.link||''};\nconst shopNameOf=did=>{const s=S.hub.shops.find(x=>x.id===did);return s?s.name:''};\n/* Вопрос «да/нет»: окно Telegram, а вне Telegram обычное окно браузера. */\nfunction askConfirm(msg,cb){\n  try{if(S.tg&&S.tg.showConfirm&&S.tg.isVersionAtLeast&&S.tg.isVersionAtLeast('6.2')){S.tg.showConfirm(msg,ok=>{if(ok)cb()});return}}catch(e){}\n  if(window.confirm(msg))cb();\n}\n/* Всё, что относится к одному дистрибьютору, сбрасывается при переходе к другому. */\nfunction resetShopState(){\n  Object.assign(S,{\n    cfg:clone(DEFAULT),prod:{cats:[],items:[]},cart:{},otherCart:null,shopCat:'all',shopStep:'list',shopPlaced:null,q:'',\n    admin:false,off:false,profile:null,blocked:false,fav:[],allOrders:[],stats:{doneSum:0,doneCount:0},\n    sellerTab:'orders',pfilter:'all',medit:{},pxo:{},upl:{},dirtyC:false,dirtyP:false,dirty:false,saving:false,again:false,saveState:'',cd:null,cc:null,\n    stk:{},stkLoaded:false,sfilter:'all',sbusy:{},sc:null,jr:[],jrOpen:false,dbt:newDebts(),pay:null,courier:null,cr:newCour(),dv:newDv(),\n    pm:false,xbusy:'',pick:null,pickBusy:false,imp:null,impBusy:false,regOnly:null,\n    rep:{days:30,data:null,busy:false,err:false,sel:-1,hov:-1,allP:false,tab:false,seq:0,drag:false,skip:0}\n  });\n  S.form.region='';\n}\n/* способ получения: доставка доступна, только если продавец её включил */\nconst mode=()=>S.cfg.shop.delivery!==false&&S.form.mode==='delivery'?'delivery':'pickup';\nconst pickup=()=>pickupInfo(S.cfg,shopNow(),leadFor(S.cfg,mode()));\nfunction normalizeMode(){if(S.cfg.shop.delivery===false)S.form.mode='pickup'}\n/* Регион магазина запоминается на телефоне и на площадке (чтобы на другом телефоне список был тем же). */\nfunction loadRegion(){if(!regionsOn())return;try{S.region=cleanRegion(localStorage.getItem('sh-region'))}catch(e){}}\nfunction saveRegionLocal(){try{if(S.region)localStorage.setItem('sh-region',S.region);else localStorage.removeItem('sh-region')}catch(e){}}\nfunction setRegion(id){\n  id=cleanRegion(id);\n  if(id===S.region)return;\n  S.region=id;S.form.region='';saveRegionLocal();\n  if(S.auth)api('PUT','/api/hub/region',{region:id});\n  if(S.view==='shops')renderShops();\n}\n/* Доставка у открытого дистрибьютора ограничена регионами: список, регион для заказа, подсказки */\nconst zoneOn=()=>hasZone(S.cfg.shop.regions)&&S.cfg.shop.delivery!==false;\nconst zone=()=>cleanRegions(S.cfg.shop.regions);\nconst orderRegion=()=>{const c=cleanRegion(S.form.region);return zoneOn()?(zone().includes(c)?c:''):(c||S.region)};\n/* в форму заказа подставляем регион магазина, если дистрибьютор в него доставляет */\nfunction normalizeRegion(){\n  if(!zoneOn()){return}\n  if(!zone().includes(S.form.region))S.form.region=zone().includes(S.region)?S.region:'';\n}\n/* Территория магазина (район или город внутри области): спрашиваем один раз, пока её нет в общей базе. */\nconst terrKnown=()=>{const c=S.hub.me&&S.hub.me.card;return !!(c&&c.terr&&S.hub.terrs.some(t=>t.id===c.terr))};\nconst terrOn=()=>S.hub.terrs.length>0&&!terrKnown();\nconst terrCur=()=>{const v=S.form.terr;return v==='-'||S.hub.terrs.some(t=>t.id===v)?v:''};\nfunction terrFieldHTML(){\n  const cur=terrCur();\n  return '<div class=\"full\"><label class=\"lab\" for=\"f-terr\">'+L('Ваш район или город','Rayon yoki shahringiz')+'</label><select id=\"f-terr\" data-f=\"terr\"><option value=\"\">'+L('Выберите район или город','Rayon yoki shaharni tanlang')+'</option>'\n    +S.hub.terrs.map(t=>'<option value=\"'+esc(t.id)+'\"'+(t.id===cur?' selected':'')+'>'+esc(t.name)+'</option>').join('')\n    +'<option value=\"-\"'+(cur==='-'?' selected':'')+'>'+L('Другой район','Boshqa hudud')+'</option></select><div class=\"err\" id=\"e-terr\"></div></div>';\n}\nfunction regionFieldHTML(){\n  const z=zone(),cur=orderRegion(),off=S.region&&!z.includes(S.region);\n  return '<div class=\"full\"><label class=\"lab\" for=\"f-region\">'+L('Регион доставки','Yetkazib berish hududi')+'</label><select id=\"f-region\" data-f=\"region\"><option value=\"\">'+L('Выберите регион','Hududni tanlang')+'</option>'\n    +z.map(id=>'<option value=\"'+id+'\"'+(id===cur?' selected':'')+'>'+esc(regionName(id))+'</option>').join('')+'</select><div class=\"err\" id=\"e-region\"></div>'\n    +(off?'<div class=\"note warnnote\" role=\"status\" style=\"margin-top:8px\">'+esc(L('Этот дистрибьютор не доставляет в ваш регион ('+regionName(S.region)+'). Выберите самовывоз или регион из списка.','Bu distribyutor sizning hududingizga ('+regionName(S.region)+') yetkazib bermaydi. Olib ketishni yoki roʻyxatdagi hududni tanlang.'))+'</div>':'')+'</div>';\n}\n/* в каталоге: куда доставляет этот дистрибьютор, и предупреждение, если не в регион магазина */\nfunction regionNoteHTML(){\n  if(!zoneOn())return '';\n  const z=zone(),names=z.slice(0,3).map(regionName).join(', ')+(z.length>3?L(' и ещё '+(z.length-3),' va yana '+(z.length-3)):'');\n  const off=S.region&&!z.includes(S.region);\n  return '<div class=\"note'+(off?' warnnote':'')+'\" role=\"status\" style=\"margin-bottom:12px\">'+esc(off\n    ?L('Доставка в ваш регион ('+regionName(S.region)+') не работает, но можно заказать с самовывозом. Доставляют: '+names+'.','Sizning hududingizga ('+regionName(S.region)+') yetkazib berilmaydi, lekin olib ketish mumkin. Yetkazib berish: '+names+'.')\n    :L('Доставка: '+names+'. В остальные регионы — самовывоз.','Yetkazib berish: '+names+'. Boshqa hududlar uchun — olib ketish.'))+'</div>';\n}\n\n/* ---------- каталог: данные и корзина ---------- */\nconst normProd=d=>{const o={cats:[],items:[]};if(d&&typeof d==='object'){if(Array.isArray(d.cats))o.cats=d.cats.filter(x=>x&&typeof x==='object');if(Array.isArray(d.items))o.items=d.items.filter(x=>x&&typeof x==='object')}return o};\n/* фото товара: до трёх; версии лежат в pv (главное, видно в каталоге), pv2, pv3; подряд, без пропусков */\nconst PH_MAX=3;\nconst phVers=p=>{const v=[p.pv,p.pv2,p.pv3].map(x=>typeof x==='string'?x:'');const n=v.findIndex(x=>!x);return n<0?v:v.slice(0,n)};\nconst imgUrl=(p,n,did)=>'/img/'+encodeURIComponent(did||S.did||'main')+'/'+encodeURIComponent(p.id)+'?v='+encodeURIComponent((n>1?p['pv'+n]:p.pv)||'')+(n>1?'&n='+n:'');\nconst pimg=p=>p.pv?'<img src=\"'+imgUrl(p)+'\" alt=\"'+esc(nm(p))+'\" loading=\"lazy\" decoding=\"async\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>';\n/* Корзина одна на всё приложение и принадлежит одному дистрибьютору: {did, name, items}. Прежний формат (просто {товар: штуки}) — это первый дистрибьютор. */\nfunction loadCart(){\n  S.cart={};S.otherCart=null;\n  try{\n    const c=JSON.parse(localStorage.getItem('sh-cart')||'{}');\n    if(!c||typeof c!=='object'||Array.isArray(c))return;\n    const nw=typeof c.did==='string'&&c.items&&typeof c.items==='object'&&!Array.isArray(c.items);\n    const did=nw?c.did:'main',items=nw?c.items:c;\n    if(!Object.keys(items).length)return;\n    if(did===S.did)S.cart=items;\n    else S.otherCart={did,name:nw&&typeof c.name==='string'?c.name:'',items};\n  }catch(e){}\n}\nfunction saveCart(){\n  if(S.otherCart)return;   // пока открыт другой дистрибьютор, его корзину не трогаем\n  try{\n    if(Object.keys(S.cart).length)localStorage.setItem('sh-cart',JSON.stringify({did:S.did,name:S.cfg.shop.name||'',items:S.cart}));\n    else localStorage.removeItem('sh-cart');\n  }catch(e){}\n}\nconst otherCartName=()=>S.otherCart?(S.otherCart.name||shopNameOf(S.otherCart.did)):'';\nconst otherCartCount=()=>S.otherCart?Object.keys(S.otherCart.items).length:0;\n/* Товар добавляют у одного дистрибьютора, а в корзине уже товары другого: спрашиваем, очистить ли её. */\nfunction askOtherCart(cb){\n  if(!S.otherCart){cb();return}\n  const n=otherCartName(),q=n?' («'+n+'»)':'';\n  askConfirm(L('В корзине товары другого дистрибьютора'+q+'. Очистить корзину и добавить этот товар?','Savatda boshqa distribyutor'+q+' mahsulotlari bor. Savatni tozalab, bu mahsulotni qoʻshamizmi?'),()=>{\n    S.otherCart=null;\n    try{localStorage.removeItem('sh-cart')}catch(e){}\n    cb();\n  });\n}\n/* имя, телефон, способ и адрес запоминаем на телефоне, чтобы повторный заказ был быстрее */\nfunction loadForm(){\n  try{\n    const f=JSON.parse(localStorage.getItem('sh-form')||'{}');\n    if(f&&typeof f==='object'){\n      ['name','phone','address'].forEach(k=>{if(typeof f[k]==='string')S.form[k]=f[k].slice(0,200)});\n      if(f.mode==='delivery')S.form.mode='delivery';\n      if(typeof f.terr==='string')S.form.terr=f.terr.slice(0,12);\n    }\n  }catch(e){}\n}\nfunction saveForm(){try{localStorage.setItem('sh-form',JSON.stringify({name:S.form.name,phone:S.form.phone,address:S.form.address,mode:S.form.mode,terr:S.form.terr}))}catch(e){}}\n/* профиль на сервере главнее того, что запомнил телефон: имя и телефон берём из него; адрес подставляем, если поле пустое */\nfunction applyProfile(){\n  const p=S.profile,c=S.hub.me&&S.hub.me.card;\n  if(!p&&!c)return;\n  if(p){\n    if(p.name)S.form.name=p.name;\n    if(p.phone)S.form.phone=p.phone;\n    if(!S.form.address&&p.addrs&&p.addrs.length)S.form.address=p.addrs[0];\n  }\n  /* Данные из общей базы магазинов: пустые поля заполняются сами (на любом телефоне и у любого дистрибьютора), поэтому повторно вводить их не нужно.\n     Если агент исправил название или телефон (ver вырос), исправление применяется один раз. */\n  if(c){\n    let seen=0;try{seen=Number(localStorage.getItem('sh-cardv'))||0}catch(e){}\n    const fix=c.ver>seen;\n    if(c.name&&(fix||!S.form.name))S.form.name=c.name;\n    if(c.phone&&(fix||!S.form.phone))S.form.phone=c.phone;\n    if(c.addr&&!S.form.address)S.form.address=c.addr;\n    if(c.terr)S.form.terr=c.terr;\n    if(fix)try{localStorage.setItem('sh-cardv',String(c.ver))}catch(e){}\n  }\n  saveForm();\n}\nconst blockedTxt=()=>L('Оформление заказов для вас сейчас недоступно. Свяжитесь с продавцом','Hozir siz uchun buyurtma berish mavjud emas. Sotuvchi bilan bogʻlaning')+(S.cfg.shop.phone?': '+S.cfg.shop.phone:'.');\n/* Товар нельзя заказать: продавец снял галочку «В наличии» или свободный остаток равен нулю. Поле av приходит с сервера у товаров с учётом (сколько можно заказать, не больше 500), lw — товара мало. */\n/* Проверка товаров: без метки ms товар одобрен; wait — ждёт проверки (клиент видит серым, без цены); draft и ret видит только продавец. */\nconst apr=p=>!p.ms;\nconst isPend=p=>p.ms==='wait';\nconst soldOut=p=>p.on===false||p.av===0||!!p.ms;\n/* Сколько штук можно положить в корзину: до 500, а у товаров с учётом — не больше свободного остатка. */\nconst maxQty=p=>typeof p.av==='number'?Math.min(MAX_QTY,p.av):MAX_QTY;\nconst capOf=id=>{const p=S.prod.items.find(x=>x.id===id);return p?maxQty(p):MAX_QTY};\n/* Убирает из корзины то, чего больше нет в каталоге или что закончилось, и уменьшает количество до остатка. Возвращает, сколько позиций изменено. */\nfunction pruneCart(){\n  let n=0;\n  Object.keys(S.cart).forEach(id=>{\n    const p=S.prod.items.find(x=>x.id===id),q=Number(S.cart[id]);\n    if(!p||soldOut(p)||!(q>=1)){delete S.cart[id];n++}\n    else{const m=Math.min(maxQty(p),Math.floor(q));if(m!==q)n++;S.cart[id]=m}\n  });\n  if(n)saveCart();\n  return n;\n}\nconst cartLines=()=>S.prod.items.filter(p=>S.cart[p.id]>0).map(p=>({p,qty:S.cart[p.id]}));\nconst cartCount=()=>cartLines().reduce((s,l)=>s+l.qty,0);\n/* цена за штуку зависит от количества (ступени), скидка от суммы, доставка: всё считается так же, как на сервере (общие функции unitPrice, orderDiscount, deliveryFee) */\nconst cartTotal=()=>cartLines().reduce((s,l)=>s+l.qty*unitPrice(l.p,l.qty),0);\nconst cartDisc=()=>orderDiscount(S.cfg,cartTotal());\nconst cartFee=()=>deliveryFee(S.cfg,mode(),cartTotal());\nconst cartPay=()=>cartTotal()-cartDisc().amount+cartFee();\nconst minOrder=()=>Number(S.cfg.shop.minOrder)||0;\n/* Ставит количество в корзине (не больше остатка и 500). Возвращает, сколько в итоге стоит в корзине. */\nfunction cartSet(id,q){\n  const p=S.prod.items.find(x=>x.id===id),cap=p?maxQty(p):MAX_QTY;\n  q=Math.max(0,Math.floor(q)||0);\n  if(q>cap){\n    q=cap;\n    if(p&&typeof p.av==='number'&&p.av<MAX_QTY)toast(p.av>0?L('Осталось только '+p.av,'Faqat '+p.av+' ta qoldi'):L('Товар закончился','Mahsulot tugadi'));\n  }\n  if(q)S.cart[id]=q;else delete S.cart[id];\n  saveCart();\n  return q;\n}\nconst lowTxt=n=>L('Мало (осталось '+n+')','Oz qoldi ('+n+' ta)');\nconst shopAddress=()=>L(S.cfg.shop.address,S.cfg.shop.addressUz||S.cfg.shop.address);\nfunction activeMine(){return S.myOrders.filter(o=>o.status!=='done'&&o.status!=='cancelled').length}\nfunction newCount(){return S.allOrders.filter(o=>o.status==='new').length}\n\n/* language */\nfunction initLang(){\n  let l='';\n  try{l=localStorage.getItem('sh-lang')||''}catch(e){}\n  if(l!=='ru'&&l!=='uz'){\n    let tl='';\n    try{tl=String(S.tg&&S.tg.initDataUnsafe&&S.tg.initDataUnsafe.user&&S.tg.initDataUnsafe.user.language_code||'')}catch(e){}\n    l=(tl||navigator.language||'').toLowerCase().indexOf('uz')===0?'uz':'ru';\n  }\n  setLang(l);\n  document.documentElement.setAttribute('lang',LANG);\n}\nfunction switchLang(){\n  const next=LANG==='ru'?'uz':'ru';\n  setLang(next);\n  try{localStorage.setItem('sh-lang',next)}catch(e){}\n  document.documentElement.setAttribute('lang',next);\n  render();\n}\n\n/* меню: разделы по группам; у «Продавца» внутри раскрываются его пять разделов */\nconst sellerSubs=()=>{\n  const w=stockWarn(),rn=modRetN();\n  return [['orders',L('Заказы','Buyurtmalar')],['debts',L('Долги','Qarzlar'),(S.dbt.late||0)+(S.dbt.fl||0),'warn'],['dlv',L('Доставщики','Yetkazuvchilar'),dvAlerts(),'warn'],['prod',L('Каталог','Katalog'),rn,'warn'],['stock',L('Остатки','Qoldiq'),w,'warn'],['reports',L('Отчёты','Hisobotlar')],['settings',L('Настройки','Sozlamalar')]];\n};\n/* Роли человека берутся с площадки (S.hub.me): владелец, агент, продавец и доставщик у каких-то дистрибьюторов. Кроме этого он всегда магазин-клиент. */\nfunction myRoles(){\n  const me=S.auth&&S.hub&&S.hub.me;\n  if(!me)return [];\n  const r=[];\n  if(me.owner)r.push({k:'owner',n:L('Владелец площадки','Platforma egasi'),d:[]});\n  if(me.agent)r.push({k:'agent',n:L('Агент','Agent'),d:me.agent.name?[me.agent.name]:[]});\n  if((me.sells||[]).length)r.push({k:'seller',n:L('Продавец','Sotuvchi'),d:me.sells.map(x=>x.name)});\n  if((me.delivers||[]).length)r.push({k:'courier',n:L('Доставщик','Yetkazuvchi'),d:me.delivers.map(x=>x.name)});\n  return r;\n}\n/* Строка в меню: роли, с которыми человек работает сейчас; у продавца и доставщика ещё название открытого дистрибьютора. */\nfunction roleLine(){\n  const me=S.auth&&S.hub&&S.hub.me;\n  if(!me)return '';\n  const here=S.did,sells=me.sells||[],dels=me.delivers||[],parts=[];\n  const sl=here?sells.find(x=>x.id===here):sells[0],dl=here?dels.find(x=>x.id===here):dels[0];\n  if(me.owner)parts.push(L('Владелец','Egasi'));\n  if(me.agent)parts.push(L('Агент','Agent'));\n  if(sl)parts.push(L('Продавец','Sotuvchi'));\n  if(dl)parts.push(L('Доставщик','Yetkazuvchi'));\n  if(here&&(sl||dl))parts.push((sl||dl).name);\n  return parts.length?parts.join(' · '):L('Магазин','Doʻkon');\n}\nfunction menuGroups(){\n  const g=[];\n  const shop=[['shop',L('Каталог','Katalog'),cartCount()],['mine',L('Заказы','Buyurtmalar'),activeMine()]];\n  if(S.mdebt.ok&&(S.mdebt.total>0||S.mdebt.ask>0))shop.push(['debt',L('Мой долг','Mening qarzim'),S.mdebt.ask,'warn']);\n  if(S.auth&&S.did)shop.push(['profile',L('Профиль','Profil')]);\n  g.push([L('Магазин','Doʻkon'),shop]);\n  const work=[];\n  if(S.admin&&S.did)work.push(['seller',L('Продавец','Sotuvchi'),newCount(),'',sellerSubs(),'stab']);\n  if(S.courier&&S.did)work.push(['courier',L('Доставка','Yetkazib berish'),crFree(),'',crTabs(),'ctab']);\n  if(canBase())work.push(['base',L('База','Baza')]);\n  if(work.length)g.push([L('Работа','Ish'),work]);\n  if(isOwner())g.push([L('Владелец','Egasi'),ownSecs().map(o=>['o_'+o[0],o[1],o[0]==='money'?S.own.dn:0,'bad',o[2].map(x=>[x[0],x[1],x[0]==='disp'?S.own.dn:0,'bad']),'otab']).concat([['analytics',L('Аналитика','Tahlil')],['review',L('Проверка','Tekshiruv'),modN(),'bad']])]);\n  return g;\n}\nconst badgeHTML=(n,c)=>n?' <span class=\"badge'+(c?' '+c:'')+'\">'+n+'</span>':'';\nconst menuWide=()=>!!(window.matchMedia&&matchMedia('(min-width:1000px)').matches);\nconst menuIsOpen=()=>document.documentElement.classList.contains('mn-open');\n/* раздел, где мы сейчас: у «Продавца» это вкладка продавца, у владельца — подраздел площадки */\nconst subHere=(i,x,cur)=>i[5]==='otab'?cur==='owner'&&S.own.sec===x[0]:i[5]==='ctab'?cur==='courier'&&S.cr.tab===x[0]:cur==='seller'&&S.sellerTab===x[0];\nconst parentHere=(i,cur)=>i[5]==='otab'?cur==='owner'&&i[4].some(x=>x[0]===S.own.sec):cur===i[0];\nconst menuSubOpen=(i,cur)=>S.msub===null?parentHere(i,cur):S.msub===i[0];\nfunction renderNav(){\n  const cur=S.view==='shops'?'shop':S.view,groups=menuGroups(),multi=groups.length>1,nav=$('#nav');\n  let h='';\n  groups.forEach(gr=>{\n    if(multi)h+='<div class=\"mgh\" role=\"presentation\">'+gr[0]+'</div>';\n    gr[1].forEach(i=>{\n      if(i[4]){\n        const open=menuSubOpen(i,cur);\n        h+='<button type=\"button\" class=\"mi mgrp\" data-act=\"msub\" data-v=\"'+i[0]+'\" aria-expanded=\"'+open+'\" aria-controls=\"msub-'+i[0]+'\"'+(parentHere(i,cur)?' data-here=\"1\"':'')+'><span class=\"ml\">'+i[1]+'</span>'+badgeHTML(i[2],i[3])\n          +'<svg class=\"chev\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"M3.5 6l4.5 4.5L12.5 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></button>'\n          +'<div class=\"msub\" id=\"msub-'+i[0]+'\" role=\"group\" aria-label=\"'+esc(i[1])+'\"'+(open?'':' hidden')+'>'\n          +i[4].map(x=>'<button type=\"button\" class=\"mi\" data-act=\"'+(i[5]||'stab')+'\" data-t=\"'+x[0]+'\"'+(subHere(i,x,cur)?' aria-current=\"page\"':'')+'><span class=\"ml\">'+x[1]+'</span>'+badgeHTML(x[2],x[3])+'</button>').join('')+'</div>';\n      }else h+='<button type=\"button\" class=\"mi\" data-act=\"nav\" data-v=\"'+i[0]+'\"'+(cur===i[0]?' aria-current=\"page\"':'')+'><span class=\"ml\">'+i[1]+'</span>'+badgeHTML(i[2],i[3])+'</button>';\n    });\n  });\n  // перерисовка не должна сбивать прокрутку и фокус открытого меню\n  const ae=document.activeElement,fk=ae&&nav.contains(ae)?[ae.dataset.act,ae.dataset.v||ae.dataset.t||'']:null,st=nav.scrollTop;\n  nav.setAttribute('aria-label',L('Разделы','Boʻlimlar'));\n  nav.innerHTML=h;\n  nav.scrollTop=st;\n  if(fk){const f=[...nav.querySelectorAll('[data-act]')].find(x=>x.dataset.act===fk[0]&&(x.dataset.v||x.dataset.t||'')===fk[1]&&!x.closest('[hidden]'));if(f)f.focus({preventScroll:true})}\n  // значок на кнопке ☰: что ждёт решения (новые заказы, товары на проверке или возвращённые)\n  const al=(S.admin&&S.did?newCount()+modRetN()+(S.dbt.fl||0)+dvAlerts():0)+(isOwner()?modN()+(S.own.dn||0):0)+(S.courier&&S.did?crFree()+(S.cr.ask||0)+(S.cr.late>0?1:0):0)+(S.auth?S.mdebt.ask||0:0),mb=$('#menubadge');\n  mb.hidden=!al;mb.textContent=al>99?'99+':String(al);\n  const mr=$('#mrole'),rl=roleLine();\n  if(mr){mr.hidden=!rl;mr.innerHTML=rl?esc(L('Вы: ','Siz: '))+'<b>'+esc(rl)+'</b>':''}\n  const mbt=$('#menubtn');\n  mbt.setAttribute('aria-label',L('Меню','Menyu')+(al?': '+al:''));\n  $('#mclose').setAttribute('aria-label',L('Закрыть меню','Menyuni yopish'));\n  // внутри дистрибьютора в шапке его название, на общих экранах название площадки\n  const inShop=S.did&&(S.view==='shop'||S.view==='seller'||S.view==='profile'||S.view==='courier');\n  const name=inShop?(S.cfg.shop.name||DEFAULT.shop.name):hubTitle();\n  $('#brandName').textContent=name;\n  $('#mbrand').textContent=name;\n  document.title=name;\n  document.querySelectorAll('.langsw').forEach(sw=>{\n    sw.setAttribute('aria-label',L('Язык','Til'));\n    sw.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lg===LANG)));\n  });\n  menuSync();\n}\n/* на широком экране меню стоит слева всегда и окном не бывает */\nfunction menuSync(){\n  const m=$('#menu'),wide=menuWide();\n  if(wide&&menuIsOpen())menuSet(false);\n  if(wide){m.removeAttribute('role');m.removeAttribute('aria-modal');m.setAttribute('aria-label',L('Разделы','Boʻlimlar'))}\n  else{m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',L('Меню','Menyu'))}\n}\nlet menuBack=null;\nfunction menuSet(on){\n  if(on&&menuWide())return;\n  const root=document.documentElement;\n  if(on===menuIsOpen())return;\n  root.classList.toggle('mn-open',on);\n  $('#mscrim').hidden=!on;\n  $('#menubtn').setAttribute('aria-expanded',String(on));\n  if(on){\n    menuBack=document.activeElement;\n    const f=$('#nav [aria-current=\"page\"]')||$('#nav .mi');\n    if(f){f.focus({preventScroll:true});try{f.scrollIntoView({block:'nearest'})}catch(e){}}\n  }else{\n    const inside=document.activeElement&&$('#menu').contains(document.activeElement);\n    if(inside||!document.activeElement||document.activeElement===document.body){const b=menuBack&&document.contains(menuBack)&&!$('#menu').contains(menuBack)?menuBack:$('#menubtn');try{b.focus({preventScroll:true})}catch(e){}}\n    menuBack=null;\n  }\n}\ndocument.addEventListener('keydown',e=>{\n  if(!menuIsOpen())return;\n  if(e.key==='Escape'){e.preventDefault();menuSet(false);return}\n  if(e.key!=='Tab')return;\n  const list=[...$('#menu').querySelectorAll('button')].filter(x=>!x.closest('[hidden]')&&!x.disabled&&x.offsetParent!==null);\n  if(!list.length)return;\n  const first=list[0],last=list[list.length-1];\n  if(!$('#menu').contains(document.activeElement)){e.preventDefault();first.focus();return}\n  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}\n  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}\n});\nwindow.addEventListener('resize',()=>{if(menuWide())menuSync()});\n\n/* ---------- каталог (клиент) ---------- */\nconst shopCats=()=>S.prod.cats.filter(c=>S.prod.items.some(p=>p.cat===c.id&&apr(p)));\nconst pendList=()=>S.prod.items.filter(isPend);\nfunction qtyHTML(id,q,small){\n  const i=esc(id),pre=small?'c':'p',cap=capOf(id);\n  return '<div class=\"stepper'+(small?' sm':'')+'\"><button type=\"button\" data-act=\"'+pre+'minus\" data-id=\"'+i+'\" aria-label=\"'+esc(L('Меньше','Kamroq'))+'\">−</button>'\n    +'<input class=\"qty\" type=\"number\" inputmode=\"numeric\" min=\"0\" max=\"'+cap+'\" value=\"'+q+'\" data-qty=\"'+i+'\" aria-label=\"'+esc(L('Количество','Miqdori'))+'\">'\n    +'<button type=\"button\" data-act=\"'+pre+'plus\" data-id=\"'+i+'\" aria-label=\"'+esc(L('Больше','Koʻproq'))+'\"'+(q>=cap?' disabled':'')+'>+</button></div>';\n}\n/* кнопки «+ блок», «+ коробка»: добавляют сразу целую упаковку (цена за штуку, количество в штуках) */\nfunction packChips(p,pre){\n  const out=['blk','box'].filter(k=>packSize(p,k)).map(k=>{\n    const n=packSize(p,k),lab=L('Добавить: '+packWord(k)+' ('+n+' шт)','Qoʻshish: '+packWord(k)+' ('+n+' dona)');\n    return '<button type=\"button\" class=\"chip\" data-act=\"'+pre+'pack\" data-id=\"'+esc(p.id)+'\" data-k=\"'+k+'\" aria-label=\"'+esc(lab)+'\">+ '+esc(packWord(k))+' · '+n+'</button>';\n  }).join('');\n  return out?'<div class=\"ppack\">'+out+'</div>':'';\n}\nfunction productCtl(p){\n  if(soldOut(p))return '<button type=\"button\" class=\"btn ghost sm padd\" disabled>'+L('Нет в наличии','Mavjud emas')+'</button>';\n  const q=S.cart[p.id]||0;\n  if(!q)return '<button type=\"button\" class=\"btn sm padd\" data-act=\"padd\" data-id=\"'+esc(p.id)+'\">'+L('В корзину','Savatga')+'</button>'+packChips(p,'p');\n  return qtyHTML(p.id,q,false)+packChips(p,'p');\n}\nconst HEART='<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.4 3.3 4.2 6.7-1.7 4.7-9.2 9.3-9.2 9.3z\"/></svg>';\nconst isFav=id=>S.fav.includes(id);\nconst favBtn=id=>S.auth?'<button type=\"button\" class=\"fav\" data-act=\"fav\" data-id=\"'+esc(id)+'\" aria-pressed=\"'+isFav(id)+'\" aria-label=\"'+esc(L('В избранное','Sevimlilarga'))+'\">'+HEART+'</button>':'';\n/* ступени цены под ценой: «от 10 шт — 7 000 сум»; та, что сейчас действует по корзине, выделена */\nfunction tiersHTML(p,q){\n  const t=tiersOf(p);\n  if(!t.length)return '';\n  let act=-1;t.forEach((x,i)=>{if(q>=x.n)act=i});\n  return t.map((x,i)=>'<span class=\"ptier'+(i===act?' on':'')+'\">'+L('от '+x.n+' шт — ',x.n+' donadan — ')+money(x.price)+'</span>').join('');\n}\nfunction priceHTML(p){\n  const q=S.cart[p.id]||0,eff=unitPrice(p,q||1),tier=eff<Number(p.price);\n  const o=tier?Number(p.price):oldPrice(p),pc=o?Math.max(1,Math.min(99,Math.round((o-eff)/o*100))):0;\n  return (o?'<span class=\"pold\">'+money(o)+'</span>':'')+money(eff)+(pc?'<span class=\"psale\">−'+pc+'%</span>':'')+tiersHTML(p,q);\n}\n/* Товар на проверке: серая карточка, без цены и без корзины */\nfunction pendCard(p){\n  const w=weightLabel(p),np=phVers(p).length;\n  return '<article class=\"pcard pend\" id=\"pc-'+esc(p.id)+'\"><div class=\"pimg'+(np?' zm':'')+'\"'+(np?' data-act=\"pzoom\" data-id=\"'+esc(p.id)+'\"':'')+'>'+pimg(p)+'<span class=\"tag mod\">'+L('На модерации','Tekshiruvda')+'</span></div>'\n    +'<div class=\"pbody\"><div class=\"pname\">'+esc(nm(p))+'</div>'+(w?'<div class=\"pw\">'+esc(w)+'</div>':'')\n    +'<div class=\"pwait\">'+L('Цена после проверки','Narx tekshiruvdan keyin')+'</div></div></article>';\n}\nfunction productCard(p){\n  if(isPend(p))return pendCard(p);\n  const off=soldOut(p),d=prodDesc(p),w=weightLabel(p);\n  const status=off?'':(p.lw&&typeof p.av==='number'?'<div class=\"pst low\">'+esc(lowTxt(p.av))+'</div>':'<div class=\"pst\">'+L('В наличии','Mavjud')+'</div>');\n  const np=phVers(p).length;\n  return '<article class=\"pcard'+(off?' off':'')+(!off&&S.cart[p.id]>0?' incart':'')+'\" id=\"pc-'+esc(p.id)+'\"><div class=\"pimg'+(np?' zm':'')+'\"'+(np?' data-act=\"pzoom\" data-id=\"'+esc(p.id)+'\"':'')+'>'+pimg(p)+(np>1?'<span class=\"pcnt\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"6\" width=\"14\" height=\"14\" rx=\"2\"/><path d=\"M7 3h12a2 2 0 0 1 2 2v12\"/></svg>'+np+' '+L('фото','rasm')+'</span>':'')+(off?'<span class=\"tag\">'+L('Нет в наличии','Mavjud emas')+'</span>':(p.tag?'<span class=\"lbl '+esc(p.tag)+'\">'+esc(tagName(p.tag))+'</span>':''))+favBtn(p.id)+'</div>'\n    +'<div class=\"pbody\"><div class=\"pname\">'+esc(nm(p))+'</div>'+(w?'<div class=\"pw\">'+esc(w)+'</div>':'')+status\n    +(d?'<div class=\"pdesc\" data-act=\"pdesc\">'+esc(d)+'</div>':'')\n    +'<div class=\"pprice\">'+priceHTML(p)+'</div><div class=\"pctl\">'+productCtl(p)+'</div></div></article>';\n}\n/* Поиск по названию, описанию и весу на обоих языках: каждое слово запроса должно встретиться. */\nconst normQ=s=>String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[ʻʼ’‘`']/g,'');\nfunction matchQ(p,q){\n  const words=normQ(q).split(/\\s+/).filter(Boolean);\n  if(!words.length)return true;\n  const hay=normQ([p.name,p.uz,p.desc,p.descUz,weightLabel(p)].join(' '));\n  return words.every(w=>hay.indexOf(w)>=0);\n}\n/* особые разделы рядом с категориями: избранное, акции, новинки */\nfunction shopSpecials(){\n  const out=[];\n  if(S.auth&&S.fav.some(id=>S.prod.items.some(p=>p.id===id&&apr(p))))out.push(['fav','★ '+L('Избранное','Sevimlilar')]);\n  if(S.prod.items.some(p=>p.tag==='sale'&&apr(p)))out.push(['sale',tagName('sale')]);\n  if(S.prod.items.some(p=>p.tag==='new'&&apr(p)))out.push(['new',tagName('new')]);\n  return out;\n}\nconst inShopFilter=p=>S.shopCat==='mod'?isPend(p):!apr(p)?false:S.shopCat==='all'?true:S.shopCat==='fav'?isFav(p.id):S.shopCat==='sale'?p.tag==='sale':S.shopCat==='new'?p.tag==='new':p.cat===S.shopCat;\n/* Сетка товаров: по выбранной категории и поиску. В режиме «Все» без поиска товары идут разделами по категориям. */\nfunction paintGrid(){\n  const g=$('#pgrid');if(!g)return;\n  const q=S.q.trim();\n  const items=S.prod.items.filter(p=>inShopFilter(p)&&matchQ(p,q));\n  if(!items.length){\n    g.innerHTML=S.shopCat==='mod'&&!q?'<div class=\"empty\"><b>'+L('Нет товаров на проверке','Tekshiruvda mahsulot yoʻq')+'</b></div>':S.shopCat==='fav'&&!q?'<div class=\"empty\"><b>'+L('В избранном пока пусто','Sevimlilar hozircha boʻsh')+'</b>'+L('Нажмите на сердечко у товара, и он появится здесь.','Mahsulotdagi yurakchani bosing, u shu yerda paydo boʻladi.')+'</div>'\n      :'<div class=\"empty\"><b>'+L('Ничего не найдено','Hech narsa topilmadi')+'</b>'+L('Измените запрос или выберите другую категорию.','Soʻrovni oʻzgartiring yoki boshqa kategoriyani tanlang.')+'</div>';\n    return;\n  }\n  const cats=shopCats();\n  if(S.shopCat==='all'&&!q&&cats.length>=1){\n    const rest=items.filter(p=>!cats.some(c=>c.id===p.cat));\n    g.innerHTML=cats.map(c=>{const li=items.filter(p=>p.cat===c.id);return li.length?'<h2 class=\"chead\">'+esc(nm(c))+'</h2><div class=\"pgrid\">'+li.map(productCard).join('')+'</div>':''}).join('')\n      +(rest.length?'<div class=\"pgrid\" style=\"margin-top:20px\">'+rest.map(productCard).join('')+'</div>':'');\n  }else g.innerHTML=(S.shopCat==='mod'?'<div class=\"note modnote\">'+L('Эти товары проверяет площадка. После проверки появятся цена и кнопка «В корзину».','Bu mahsulotlarni platforma tekshirmoqda. Tekshiruvdan keyin narx va «Savatga» tugmasi paydo boʻladi.')+'</div>':'')+'<div class=\"pgrid\">'+items.map(productCard).join('')+'</div>';\n}\nfunction paintShopBar(){\n  const bar=$('#bar');if(!bar)return;\n  const n=cartCount();\n  if(!n){bar.style.display='none';bar.innerHTML='';return}\n  bar.style.display='';\n  if(S.shopStep==='cart')bar.innerHTML='<div class=\"wrap\"><div><small>'+L('Итого, оплата при получении','Jami, olganda toʻlanadi')+'</small><strong id=\"ctotal\">'+money(cartPay())+'</strong></div><button type=\"button\" class=\"btn\" data-act=\"submitorder\">'+L('Заказать','Buyurtma berish')+'</button></div>';\n  else bar.innerHTML='<div class=\"wrap\"><div><small>'+L('Корзина','Savat')+': '+n+' '+L('шт.','dona')+'</small><strong>'+money(cartTotal()-cartDisc().amount)+'</strong></div><button type=\"button\" class=\"btn\" data-act=\"opencart\">'+L('Оформить заказ','Buyurtma berish')+'</button></div>';\n}\nfunction renderShop(){\n  if(S.shopPlaced)return renderShopPlaced();\n  const pend=pendList().length,aprN=S.prod.items.filter(apr).length;\n  if(!aprN&&!pend){\n    view.innerHTML='<div class=\"wrap page\">'+backHTML()+offHTML()+'<div class=\"empty\"><b>'+L('Каталог пока пуст','Katalog hozircha boʻsh')+'</b>'+L('Загляните позже.','Keyinroq qaytib keling.')+'</div></div>';\n    return;\n  }\n  if(S.shopStep==='cart'&&cartCount()>0)return renderCart();\n  S.shopStep='list';\n  const cats=shopCats();\n  const specials=shopSpecials();\n  if(S.shopCat==='mod'&&!pend)S.shopCat='all';\n  if(S.shopCat!=='all'&&S.shopCat!=='mod'&&!cats.some(c=>c.id===S.shopCat)&&!specials.some(x=>x[0]===S.shopCat))S.shopCat='all';\n  if(!aprN&&pend)S.shopCat='mod';   // одобренных ещё нет: открываем раздел «На модерации»\n  const modChip=pend?[['mod',L('На модерации','Tekshiruvda')+'<span class=\"cnt\">'+pend+'</span>']]:[];\n  const chips=cats.length>1||specials.length||pend?'<div class=\"pchips\" role=\"group\" aria-label=\"'+esc(L('Категории','Kategoriyalar'))+'\">'\n    +(aprN?[['all',L('Все','Barchasi')]].concat(specials,cats.length>1?cats.map(c=>[c.id,nm(c)]):[]):[]).concat(modChip).map(c=>'<button type=\"button\" class=\"chip'+(c[0]==='mod'?' mod':'')+'\" data-act=\"scat\" data-id=\"'+esc(c[0])+'\" aria-pressed=\"'+(S.shopCat===c[0])+'\">'+(c[0]==='mod'?c[1]:esc(c[1]))+'</button>').join('')+'</div>':'';\n  const search=aprN+pend>8?'<div class=\"search\"><input type=\"search\" id=\"q\" value=\"'+esc(S.q)+'\" placeholder=\"'+esc(L('Поиск по названию и описанию','Nomi va tavsifi boʻyicha qidirish'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Поиск по названию и описанию','Nomi va tavsifi boʻyicha qidirish'))+'\"></div>':'';\n  view.innerHTML='<div class=\"wrap shop\">'+backHTML()+offHTML()+bannerSlot()+regionNoteHTML()+'<div class=\"eyebrow\">'+L('Каталог','Katalog')+'</div><h1>'+esc(S.cfg.shop.name||DEFAULT.shop.name)+'</h1>'+search+chips+'<div id=\"pgrid\"></div></div><div class=\"bar\" id=\"bar\"></div>';\n  paintGrid();paintShopBar();\n}\nfunction toggleFav(id){\n  if(!S.auth)return;\n  S.fav=isFav(id)?S.fav.filter(x=>x!==id):S.fav.concat([id]).slice(-100);\n  S.favSeq++;\n  document.querySelectorAll('.fav[data-id=\"'+CSS.escape(id)+'\"]').forEach(b=>b.setAttribute('aria-pressed',String(isFav(id))));\n  if(S.view==='shop'&&!S.shopPlaced&&S.shopStep==='list'){\n    const sp=shopSpecials();\n    if(S.shopCat==='fav'&&!sp.some(x=>x[0]==='fav')){S.shopCat='all';renderShop()}\n    else if(S.shopCat==='fav')paintGrid();\n    else{const had=!!document.querySelector('[data-act=\"scat\"][data-id=\"fav\"]');if(had!==sp.some(x=>x[0]==='fav'))renderShop()}\n  }\n  clearTimeout(S.favT);S.favT=setTimeout(pushFav,600);\n}\nasync function pushFav(){\n  const seq=S.favSeq,r=await api('PUT','/api/fav',{ids:S.fav});\n  if(!r.ok||!r.data){toast(L('Избранное не сохранилось. Проверьте соединение.','Sevimlilar saqlanmadi. Ulanishni tekshiring.'));return}\n  if(S.favSeq===seq&&JSON.stringify(r.data.fav)!==JSON.stringify(S.fav)){S.fav=r.data.fav;if(S.view==='shop')renderShop()}\n}\nfunction paintShopCtl(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.querySelector('#pc-'+CSS.escape(id)+' .pctl'),pe=document.querySelector('#pc-'+CSS.escape(id)+' .pprice');\n  if(p&&el)el.innerHTML=productCtl(p);\n  if(p&&pe)pe.innerHTML=priceHTML(p);\n  const card=document.getElementById('pc-'+id);\n  if(p&&card)card.classList.toggle('incart',!soldOut(p)&&S.cart[id]>0);\n  paintShopBar();renderNav();\n}\n/* под названием в корзине: вес и цена за штуку (со ступенью), подсказка про следующую ступень, сколько это упаковок */\nfunction cartInfoHTML(p,q){\n  const w=weightLabel(p),eff=unitPrice(p,q),nt=nextTier(p,q),pk=packText(p,q);\n  return '<small>'+(w?esc(w)+' · ':'')+(eff<Number(p.price)?'<span class=\"pold\">'+money(p.price)+'</span>':'')+money(eff)+'</small>'\n    +(nt?'<small class=\"tiernext\">'+esc(L('Ещё '+nt.left+' шт — цена '+money(nt.price)+' за шт','Yana '+nt.left+' dona — narx '+money(nt.price)))+'</small>':'')\n    +(pk?'<small class=\"packtxt\">'+esc(pk)+'</small>':'');\n}\nfunction paintCartLines(){\n  const el=$('#clines');if(!el)return;\n  el.innerHTML=cartLines().map(l=>{\n    const p=l.p;\n    return '<div class=\"cline\" id=\"cl-'+esc(p.id)+'\"><div class=\"cth\">'+pimg(p)+'</div><div class=\"cn\"><b>'+esc(nm(p))+'</b><div id=\"ci-'+esc(p.id)+'\">'+cartInfoHTML(p,l.qty)+'</div>'\n      +(p.lw&&typeof p.av==='number'?'<small class=\"lowtxt\">'+esc(lowTxt(p.av))+'</small>':'')+'</div>'\n      +'<div class=\"cr\">'+qtyHTML(p.id,l.qty,true)+'<div class=\"cs\">'+money(l.qty*unitPrice(p,l.qty))+'</div></div>'+packChips(p,'c')+'</div>';\n  }).join('');\n  paintCartSum();\n}\n/* Блок «Итого» в корзине: товары, доставка (если она платная), итог, подсказки про минимум и бесплатную доставку. */\nfunction paintCartSum(){\n  const el=$('#csum');if(!el)return;\n  const sub=cartTotal(),dc=cartDisc(),fee=cartFee(),sh=S.cfg.shop,del=mode()==='delivery',feeSet=Number(sh.deliveryFee)>0,free=Number(sh.freeDeliveryFrom)||0;\n  const showFee=del&&feeSet;\n  el.innerHTML=(showFee||dc.amount>0?'<div class=\"r\"><span>'+L('Товары','Mahsulotlar')+'</span><span id=\"csubrow\">'+money(sub)+'</span></div>':'')\n    +(dc.amount>0?'<div class=\"r disc\"><span>'+L('Скидка '+dc.pct+'%','Chegirma '+dc.pct+'%')+'</span><span id=\"cdiscrow\">−'+money(dc.amount)+'</span></div>':'')\n    +(showFee?'<div class=\"r\"><span>'+L('Доставка','Yetkazib berish')+'</span><span id=\"cfeerow\">'+(fee>0?money(fee):L('бесплатно','bepul'))+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('Итого','Jami')+'</span><span id=\"ctotalrow\">'+money(cartPay())+'</span></div>';\n  const m=$('#cmin');if(!m)return;\n  const min=minOrder(),notes=[];\n  if(min>0&&sub<min)notes.push('<div class=\"note warnnote\" role=\"status\">'+L('Минимальная сумма заказа: '+money(min)+'. Добавьте товаров ещё на '+money(min-sub)+'.','Buyurtmaning minimal summasi: '+money(min)+'. Yana '+money(min-sub)+' lik mahsulot qoʻshing.')+'</div>');\n  if(showFee&&fee>0&&free>sub)notes.push('<div class=\"note\" role=\"status\">'+L('До бесплатной доставки осталось '+money(free-sub)+'.','Bepul yetkazib berishgacha '+money(free-sub)+' qoldi.')+'</div>');\n  const nd=nextDiscount(S.cfg,sub);\n  if(nd)notes.push('<div class=\"note\" role=\"status\">'+L('Добавьте товаров ещё на '+money(nd.left)+': скидка на заказ будет '+nd.pct+'%.','Yana '+money(nd.left)+' lik mahsulot qoʻshing: buyurtmaga '+nd.pct+'% chegirma boʻladi.')+'</div>');\n  m.innerHTML=notes.length?'<div class=\"stack\" style=\"margin-top:12px\">'+notes.join('')+'</div>':'';\n  paintShopBar();\n}\n/* Меняет суммы на экране, не перерисовывая поле, в которое клиент печатает количество. */\nfunction refreshTotals(id){\n  const p=S.prod.items.find(x=>x.id===id),line=document.querySelector('#cl-'+CSS.escape(id)+' .cs'),info=document.getElementById('ci-'+id);\n  if(p&&line)line.textContent=money((S.cart[id]||0)*unitPrice(p,S.cart[id]||0));\n  if(p&&info)info.innerHTML=cartInfoHTML(p,S.cart[id]||0);\n  const cap=capOf(id);\n  document.querySelectorAll('[data-act=\"pplus\"],[data-act=\"cplus\"]').forEach(b=>{if(b.dataset.id===id)b.disabled=(S.cart[id]||0)>=cap});\n  paintCartSum();paintShopBar();renderNav();\n}\n/* Поля заказа: способ получения, имя, телефон, адрес (для доставки), дата, время, комментарий */\nfunction formHTML(pk){\n  const del=mode()==='delivery',canDel=S.cfg.shop.delivery!==false;\n  return '<div class=\"form\">'\n    +(canDel?'<div class=\"full\"><div class=\"seg\" role=\"group\" aria-label=\"'+esc(L('Способ получения','Olish usuli'))+'\"><button type=\"button\" data-act=\"mode\" data-v=\"pickup\" aria-pressed=\"'+(!del)+'\">'+L('Самовывоз','Olib ketish')+'</button><button type=\"button\" data-act=\"mode\" data-v=\"delivery\" aria-pressed=\"'+del+'\">'+L('Доставка','Yetkazib berish')+'</button></div></div>':'')\n    +(del&&zoneOn()?regionFieldHTML():'')\n    +'<div><label class=\"lab\" for=\"f-name\">'+L('Ваше имя или название компании','Ismingiz yoki kompaniya nomi')+'</label><input type=\"text\" id=\"f-name\" data-f=\"name\" value=\"'+esc(S.form.name)+'\" autocomplete=\"name\"><div class=\"err\" id=\"e-name\"></div></div>'\n    +'<div><label class=\"lab\" for=\"f-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"f-phone\" data-f=\"phone\" value=\"'+esc(S.form.phone)+'\" placeholder=\"+998 90 123 45 67\" autocomplete=\"tel\"><div class=\"err\" id=\"e-phone\"></div></div>'\n    +(terrOn()?terrFieldHTML():'')\n    +(del?'<div class=\"full\"><label class=\"lab\" for=\"f-address\">'+L('Адрес доставки','Yetkazib berish manzili')+'</label><textarea id=\"f-address\" data-f=\"address\" rows=\"2\" maxlength=\"200\" placeholder=\"'+esc(L('Город, улица, дом, ориентир','Shahar, koʻcha, uy, moʻljal'))+'\" autocomplete=\"street-address\">'+esc(S.form.address)+'</textarea><div class=\"err\" id=\"e-address\"></div>'+addrChips()+'</div>':'')\n    +'<div><label class=\"lab\" for=\"f-date\">'+(del?L('Дата доставки','Yetkazib berish sanasi'):L('Дата получения','Olish sanasi'))+'</label><input type=\"date\" id=\"f-date\" data-f=\"date\" min=\"'+pk.min+'\" max=\"'+pk.max+'\" value=\"'+esc(S.form.date)+'\"><div class=\"err\" id=\"e-date\"></div></div>'\n    +'<div><label class=\"lab\" for=\"f-time\">'+L('Время','Vaqt')+'</label><select id=\"f-time\" data-f=\"time\"></select><div class=\"err\" id=\"e-time\"></div></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"f-comment\">'+L('Пожелания к заказу','Buyurtmaga istaklar')+'</label><textarea id=\"f-comment\" data-f=\"comment\" placeholder=\"'+esc(L('Как позвонить, пожелания к упаковке','Qachon qoʻngʻiroq qilish, qadoqlash boʻyicha istaklar'))+'\">'+esc(S.form.comment)+'</textarea></div>'\n    +'<div class=\"full locbox\" id=\"locbox\">'+locBoxHTML()+'</div>'\n    +'</div>';\n}\n/* сохранённые адреса из профиля: нажал и адрес подставился */\nfunction addrChips(){\n  const a=S.profile&&S.profile.addrs;\n  if(!a||!a.length)return '';\n  return '<div class=\"achips\" id=\"achips\" role=\"group\" aria-label=\"'+esc(L('Сохранённые адреса','Saqlangan manzillar'))+'\">'+a.map((x,i)=>'<button type=\"button\" class=\"chip\" data-act=\"addr\" data-i=\"'+i+'\" aria-pressed=\"'+(S.form.address.trim().toLowerCase()===x.toLowerCase())+'\">'+esc(x)+'</button>').join('')+'</div>';\n}\nfunction markAddr(){\n  const cur=S.form.address.trim().toLowerCase();\n  document.querySelectorAll('#achips .chip').forEach(b=>{const x=S.profile&&S.profile.addrs[Number(b.dataset.i)];b.setAttribute('aria-pressed',String(!!x&&x.toLowerCase()===cur))});\n}\nfunction fillTimes(){\n  const sel=$('#f-time');if(!sel)return;\n  const list=S.form.date?pickup().slots(S.form.date):[];\n  if(!list.includes(S.form.time))S.form.time='';\n  sel.innerHTML='<option value=\"\">'+(list.length?L('Выберите время','Vaqtni tanlang'):L('На эту дату нет свободного времени','Bu sanaga boʻsh vaqt yoʻq'))+'</option>'+list.map(t=>'<option value=\"'+t+'\"'+(t===S.form.time?' selected':'')+'>'+t+'</option>').join('');\n}\nfunction cartNote(){\n  const sh=S.cfg.shop,addr=shopAddress(),hrs=esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00;';\n  if(mode()==='delivery')return L('Оплата только при получении товара. Доставка не раньше чем через '+esc(sh.deliveryLeadHours)+' ч после заказа, время доставки '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.',\n    'Toʻlov faqat mahsulotni olganda. Yetkazib berish buyurtmadan kamida '+esc(sh.deliveryLeadHours)+' soat keyin, vaqti '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.');\n  return L('Оплата только при получении'+(addr?' в точке: '+esc(addr):'')+'. Заказ можно забрать не раньше чем через '+esc(sh.leadHours)+' ч после оформления, часы выдачи '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.',\n    'Toʻlov faqat buyurtmani olganda'+(addr?': '+esc(addr):'')+'. Buyurtmani kamida '+esc(sh.leadHours)+' soatdan keyin olish mumkin, topshirish vaqti '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.');\n}\nfunction renderCart(){\n  normalizeMode();normalizeRegion();\n  const pk=pickup();\n  if(!S.form.date||S.form.date<pk.min)S.form.date=pk.min;\n  S.shopStep='cart';\n  view.innerHTML='<div class=\"wrap shop\"><button type=\"button\" class=\"btn ghost sm backlink\" data-act=\"shoplist\">← '+L('К каталогу','Katalogga')+'</button><h1>'+L('Корзина','Savat')+'</h1>'+offHTML()+'<div class=\"stack\">'\n    +'<div class=\"card\" id=\"clines\" style=\"margin-bottom:0\"></div>'\n    +'<div class=\"sum\" id=\"csum\"></div><div id=\"cmin\"></div>'\n    +'<section class=\"sec\" style=\"padding-top:6px\"><h2>'+L('Получение заказа','Buyurtmani olish')+'</h2><div class=\"stack\">'\n    +(S.blocked?'<div class=\"bannerbad\" role=\"alert\">'+esc(blockedTxt())+'</div>':'')\n    +formHTML(pk)\n    +'<div class=\"note\" id=\"cnote\">'+cartNote()+'</div>'\n    +'<button type=\"button\" class=\"btn\" id=\"submit\" data-act=\"submitorder\">'+L('Заказать','Buyurtma berish')+'</button>'\n    +'</div></section></div></div><div class=\"bar\" id=\"bar\"></div>';\n  paintCartLines();fillTimes();paintShopBar();\n}\nconst tgLink=o=>{\n  const h=String(S.cfg.shop.telegram||'').replace(/^@/,'').trim();\n  if(!h)return '';\n  return 'https://t.me/'+encodeURIComponent(h)+'?text='+encodeURIComponent(L('Здравствуйте! Вопрос по заказу ','Assalomu alaykum! Buyurtma boʻyicha savol: ')+o.id);\n};\nfunction itemRow(it){const pk=packText(it,it.qty);return '<span>'+esc(nm(it))+(weightLabel(it)?' ('+esc(weightLabel(it))+')':'')+' × '+it.qty+(pk?' ('+esc(pk)+')':'')+'</span><span>'+money(it.price*it.qty)+'</span>'}\nconst discRow=(o,cls)=>o.disc>0?'<div class=\"'+cls+'\"><span>'+L('Скидка '+o.dpct+'%','Chegirma '+o.dpct+'%')+'</span><span>−'+money(o.disc)+'</span></div>':'';\nfunction renderShopPlaced(){\n  const o=S.shopPlaced.order,tg=tgLink(o),del=o.mode==='delivery';\n  view.innerHTML='<div class=\"wrap page\"><div class=\"stack\" style=\"max-width:560px\"><div><div class=\"eyebrow\">'+L('Заказ отправлен','Buyurtma yuborildi')+'</div><h1>'+L('Номер ','Raqam ')+esc(o.id)+'</h1></div>'\n    +'<div class=\"note\">'+L('Продавец получил заказ и скоро подтвердит его. Мы напишем вам в этом чате, когда статус изменится. Оплата только при получении.','Sotuvchi buyurtmani oldi va tez orada tasdiqlaydi. Holat oʻzgarganda shu chatda yozamiz. Toʻlov faqat olganda.')+'</div>'\n    +'<div class=\"sum\"><div class=\"r\"><span>'+(del?L('Доставка','Yetkazib berish'):L('Самовывоз','Olib ketish'))+'</span><span>'+esc(fmtWhen(o.pickupAt))+'</span></div>'\n    +(del&&o.region&&regionName(o.region)?'<div class=\"r\"><span>'+L('Регион','Hudud')+'</span><span style=\"white-space:normal;text-align:right\">'+esc(regionName(o.region))+'</span></div>':'')\n    +(del?'<div class=\"r\"><span>'+L('Адрес','Manzil')+'</span><span style=\"white-space:normal;text-align:right\">'+esc(o.address)+'</span></div>':'')\n    +(o.items||[]).map(it=>'<div class=\"r\">'+itemRow(it)+'</div>').join('')\n    +discRow(o,'r disc')\n    +(o.fee>0?'<div class=\"r\"><span>'+L('Стоимость доставки','Yetkazib berish narxi')+'</span><span>'+money(o.fee)+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('К оплате при получении','Olganda toʻlanadi')+'</span><span>'+money(o.total)+'</span></div></div>'\n    +'<div class=\"row-btns\">'+(tg?'<a class=\"btn ghost\" data-act=\"contact\" href=\"'+tg+'\" target=\"_blank\" rel=\"noopener\">'+L('Написать продавцу','Sotuvchiga yozish')+'</a>':'')\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"shopagain\">'+L('Ещё из каталога','Katalogdan yana')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"nav\" data-v=\"mine\">'+L('Мои заказы','Mening buyurtmalarim')+'</button></div></div></div>';\n}\nfunction validate(){\n  const e={},f=S.form;\n  if(!f.name.trim())e.name=L('Укажите имя','Ismingizni kiriting');\n  if(f.phone.replace(/\\D/g,'').length<9)e.phone=L('Укажите номер телефона','Telefon raqamini kiriting');\n  if(terrOn()&&!terrCur())e.terr=L('Выберите ваш район или город','Rayon yoki shahringizni tanlang');\n  if(mode()==='delivery'&&zoneOn()&&!orderRegion())e.region=L('Выберите регион доставки','Yetkazib berish hududini tanlang');\n  if(mode()==='delivery'&&f.address.trim().length<5)e.address=L('Укажите адрес доставки','Yetkazib berish manzilini kiriting');\n  if(!f.date)e.date=L('Выберите дату','Sanani tanlang');\n  if(f.date&&!f.time)e.time=L('Выберите время','Vaqtni tanlang');\n  return e;\n}\nconst FIELDS=['region','name','phone','terr','address','date','time'];\nfunction orderErrText(er){\n  return {\n    too_many:L('У вас уже есть несколько неподтверждённых заказов. Дождитесь ответа продавца.','Sizda tasdiqlanmagan buyurtmalar bor. Sotuvchi javobini kuting.'),\n    pickup:L('Это время уже недоступно. Выберите другое.','Bu vaqt endi mavjud emas. Boshqasini tanlang.'),\n    auth:L('Сессия устарела. Закройте и снова откройте приложение в боте.','Seans eskirdi. Ilovani yopib, botdan qayta oching.'),\n    expired:L('Сессия устарела. Закройте и снова откройте приложение в боте.','Seans eskirdi. Ilovani yopib, botdan qayta oching.'),\n    busy:L('Сейчас много заказов. Попробуйте чуть позже.','Hozir buyurtmalar koʻp. Birozdan keyin urinib koʻring.'),\n    shop_off:offTxt(),\n    blocked:blockedTxt()\n  }[er]||L('Не удалось отправить заказ. Проверьте соединение и попробуйте ещё раз.','Buyurtmani yuborib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.');\n}\nasync function submitOrder(){\n  if(S.busy)return;\n  const lines=cartLines();\n  if(!lines.length){S.shopStep='list';renderShop();return}\n  const e=validate();\n  FIELDS.forEach(k=>{\n    const el=$('#e-'+k),inp=$('#f-'+k);\n    if(el)el.textContent=e[k]||'';\n    if(inp)inp.setAttribute('aria-invalid',e[k]?'true':'false');\n  });\n  const first=FIELDS.find(k=>e[k]);\n  if(first){const inp=$('#f-'+first);if(inp){inp.focus();try{inp.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}}return}\n  if(!S.auth){toast(L('Откройте приложение через бота в Telegram, чтобы оформить заказ','Buyurtma berish uchun ilovani Telegramdagi bot orqali oching'));return}\n  if(S.blocked){toast(blockedTxt());return}\n  if(S.off){toast(offTxt());return}\n  if(minOrder()>0&&cartTotal()<minOrder()){\n    toast(L('Минимальная сумма заказа: '+money(minOrder()),'Buyurtmaning minimal summasi: '+money(minOrder())));\n    const m=$('#cmin');if(m)try{m.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}\n    return;\n  }\n  S.busy=true;\n  const btn=$('#submit');if(btn){btn.disabled=true;btn.textContent=L('Отправляем…','Yuborilmoqda…')}\n  const f=S.form,del=mode()==='delivery';\n  const r=await api('POST','/api/order',{\n    cart:lines.map(l=>({id:l.p.id,qty:l.qty})),\n    form:{name:f.name.trim(),phone:f.phone.trim(),mode:mode(),address:del?f.address.trim():'',region:del?orderRegion():'',terr:terrKnown()?S.hub.me.card.terr:(terrCur()==='-'?'':terrCur()),date:f.date,time:f.time,comment:f.comment.trim(),loc:f.loc||undefined},\n    lang:LANG,expectTotal:cartPay()\n  });\n  S.busy=false;\n  if(!r.ok){\n    const er=r.data&&r.data.error;\n    if(r.data&&r.data.cfg){S.cfg=mergeCfg(r.data.cfg);normalizeMode()}\n    if(r.data&&r.data.prod)S.prod=normProd(r.data.prod);\n    if(er==='stock'){\n      /* товара меньше, чем в корзине: показываем, сколько осталось, и уменьшаем корзину */\n      const short=Array.isArray(r.data.short)?r.data.short:[];\n      const what=short.slice(0,3).map(s=>{\n        const p=S.prod.items.find(x=>x.id===s.id),n=Number(s.avail)||0;\n        return (p?nm(p):'')+': '+(n>0?L('осталось '+n,'faqat '+n+' ta qoldi'):L('нет в наличии','mavjud emas'));\n      }).join('; ')+(short.length>3?'…':'');\n      short.forEach(s=>{\n        const n=Number(s.avail)||0;\n        if(n<=0)delete S.cart[s.id];else if((S.cart[s.id]||0)>n)S.cart[s.id]=n;\n      });\n      saveCart();pruneCart();\n      S.shopStep=cartCount()?'cart':'list';\n      renderNav();renderShop();\n      toast(L('Столько товара нет на складе. '+what+'. Мы обновили корзину.','Omborda buncha mahsulot yoʻq. '+what+'. Savatni yangiladik.'));\n      return;\n    }\n    if(er==='min_order'){\n      renderShop();\n      toast(L('Минимальная сумма заказа: '+money(Number(r.data.min)||minOrder()),'Buyurtmaning minimal summasi: '+money(Number(r.data.min)||minOrder())));\n      return;\n    }\n    if(er==='no_region'||er==='region_need'){\n      normalizeRegion();renderShop();\n      toast(er==='region_need'?L('Выберите регион доставки.','Yetkazib berish hududini tanlang.')\n        :L('Дистрибьютор не доставляет в этот регион. Выберите самовывоз или регион из списка.','Distribyutor bu hududga yetkazib bermaydi. Olib ketishni yoki roʻyxatdagi hududni tanlang.'));\n      return;\n    }\n    if(er==='price_changed'||er==='unavailable'||er==='no_delivery'){\n      pruneCart();\n      S.shopStep=cartCount()?'cart':'list';\n      renderNav();renderShop();\n      toast(er==='price_changed'?L('Продавец обновил цены. Проверьте сумму и оформите заказ ещё раз.','Sotuvchi narxlarni yangiladi. Summani tekshirib, qaytadan buyurtma bering.')\n        :er==='no_delivery'?L('Доставка сейчас недоступна. Выберите самовывоз.','Hozir yetkazib berish mavjud emas. Olib ketishni tanlang.')\n        :L('Что-то из корзины закончилось, мы обновили её. Проверьте заказ и оформите ещё раз.','Savatdagi baʼzi narsalar tugadi, savatni yangiladik. Buyurtmani tekshirib, qaytadan bering.'));\n      return;\n    }\n    if(er==='blocked')S.blocked=true;\n    if(er==='shop_off')S.off=true;\n    renderShop();toast(orderErrText(er));\n    return;\n  }\n  const order=r.data.order;\n  order.did=S.did;order.shopName=S.cfg.shop.name||'';\n  S.cart={};saveCart();\n  S.shopPlaced={order};S.shopStep='list';\n  loadHub();   // магазин уже в общей базе: поле района больше не нужно\n  S.myOrders=[order].concat(S.myOrders.filter(o=>!(o.id===order.id&&(o.did||S.did)===S.did)));\n  S.form.comment='';S.form.loc=null;   // точка относится к одному заказу: в следующий раз магазин может быть уже в другом месте\n  if(!S.profile)S.profile={name:order.name,phone:order.phone,org:'',addrs:order.mode==='delivery'&&order.address?[order.address]:[]};\n  else{\n    if(!S.profile.name)S.profile.name=order.name;\n    if(!S.profile.phone)S.profile.phone=order.phone;\n    if(order.mode==='delivery'&&order.address&&S.profile.addrs.length<5&&!S.profile.addrs.some(a=>a.toLowerCase()===order.address.toLowerCase()))S.profile.addrs=S.profile.addrs.concat([order.address]);\n  }\n  try{S.tg&&S.tg.HapticFeedback&&S.tg.HapticFeedback.notificationOccurred('success')}catch(x){}\n  renderNav();renderShop();\n  window.scrollTo(0,0);\n}\n\n/* ---------- orders ---------- */\nconst pill=o=>{const t=stOf(o.status,o.mode);return '<span class=\"st '+t.c+'\">'+esc(nm(t))+'</span>'};\nfunction sellerActs(o){\n  const a=(to,label)=>'<button type=\"button\" class=\"btn sm\" data-act=\"status\" data-id=\"'+esc(o.id)+'\" data-to=\"'+to+'\">'+label+'</button>';\n  const del=o.mode==='delivery';\n  const pk='<button type=\"button\" class=\"btn ghost sm\" data-act=\"pick1\" data-id=\"'+esc(o.id)+'\">'+L('Сборочный лист','Yigʻish roʻyxati')+'</button>';\n  if(o.status==='new')return a('accepted',L('Принять в работу','Ishga qabul qilish'))+cancelBtn(o)+pk;\n  if(o.status==='accepted')return a('ready',del?L('Готов к отправке','Joʻnatishga tayyor'):L('Готов к выдаче','Topshirishga tayyor'))+cancelBtn(o)+pk;\n  if(o.status==='ready'){\n    if(S.pay&&S.pay.key===okey(o.id,S.did))return payBlockHTML(o);\n    return '<button type=\"button\" class=\"btn sm\" data-act=\"payopen\" data-id=\"'+esc(o.id)+'\">'+(del?L('Доставлен клиенту','Mijozga yetkazildi'):L('Выдан клиенту','Mijozga topshirildi'))+'</button>'+cancelBtn(o)+pk;\n  }\n  return o.status==='done'?pk:'';\n}\nfunction cancelBtn(o){\n  const sure=S.cc===okey(o.id,S.did);\n  return '<button type=\"button\" class=\"btn ghost sm\" data-act=\"scancel\" data-id=\"'+esc(o.id)+'\">'+(sure?L('Точно отменить?','Aniq bekor qilinsinmi?'):L('Отменить','Bekor qilish'))+'</button>';\n}\n// мелкие фото всех товаров заказа в одну линию (фото есть только у открытого сейчас дистрибьютора; без фото: серый квадрат с первой буквой)\nfunction orderThumbs(o,od){\n  const its=o.items||[],prods=od===S.did&&S.prod?S.prod.items:[],MAX=5,n=its.length;\n  const cell=it=>{const p=prods.find(x=>x.id===it.id);return p&&p.pv?'<i><img src=\"'+imgUrl(p)+'\" alt=\"\" loading=\"lazy\"></i>':'<i class=\"lt\">'+esc(([...String(it.name||'?').trim()][0]||'?').toUpperCase())+'</i>'};\n  return '<div class=\"thx\" aria-hidden=\"true\">'+(n>MAX?its.slice(0,MAX-1):its).map(cell).join('')+(n>MAX?'<b>+'+(n-MAX+1)+'</b>':'')+'</div>';\n}\nfunction orderCard(o,m){\n  const od=o.did||S.did,key=okey(o.id,od),dd=m==='mine'?' data-d=\"'+esc(od)+'\"':'';\n  const rep=m==='mine'?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"repeat\" data-id=\"'+esc(o.id)+'\"'+dd+'>'+L('Повторить заказ','Buyurtmani takrorlash')+'</button>':'';\n  const acts=m==='seller'?sellerActs(o):m==='courier'?courierActs(o):rep+(o.status==='new'?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"mycancel\" data-id=\"'+esc(o.id)+'\"'+dd+'>'+(S.cc===key?L('Точно отменить?','Aniq bekor qilinsinmi?'):L('Отменить заказ','Buyurtmani bekor qilish'))+'</button>':'');\n  // картинки товаров есть только у открытого сейчас дистрибьютора\n  const del=o.mode==='delivery';\n  const nItems=(o.items||[]).length,fold=nItems>=4,open=fold&&!!S.ox[key];\n  return '<article class=\"ord'+(m==='seller'&&o.status==='new'?' is-new':'')+(fold?' fold'+(open?' open':''):'')+'\" data-st=\"'+esc(o.status)+'\"><div class=\"otop\">'+orderThumbs(o,od)+pill(o)+'</div><div class=\"ob\">'\n    +(m==='mine'&&o.shopName?'<div class=\"dtag\">'+esc(o.shopName)+'</div>':'')\n    +'<div class=\"meta\"><span class=\"oid\">'+esc(o.id)+'</span><span class=\"when\">'+esc(fmtWhen(o.pickupAt))+'</span><span class=\"spec\">'+(del?L('Доставка: ','Yetkazib berish: ')+esc((o.region&&regionName(o.region)?regionName(o.region)+', ':'')+(o.address||'')):L('Самовывоз','Olib ketish'))+'</span></div>'\n    +(fold?'<button type=\"button\" class=\"ptg\" data-act=\"oitems\" data-id=\"'+esc(o.id)+'\"'+dd+' aria-expanded=\"'+(open?'true':'false')+'\"><span>'+nItems+' '+L(nItems<5?'товара':'товаров','mahsulot')+'</span><i>'+(open?L('Свернуть','Yigʻish'):L('Показать','Koʻrsatish'))+'</i></button>':'')\n    +'<div class=\"pls\">'\n    +(o.items||[]).map(it=>'<div class=\"pl\">'+itemRow(it)+'</div>').join('')\n    +discRow(o,'pl')\n    +(o.fee>0?'<div class=\"pl\"><span>'+L('Стоимость доставки','Yetkazib berish narxi')+'</span><span>'+money(o.fee)+'</span></div>':'')\n    +'</div>'\n    +(m==='seller'||m==='courier'?'<div class=\"cust\"><b>'+esc(o.name)+'</b>'+(o.org?' <span>'+esc(o.org)+'</span>':'')+' <span>'+esc(o.phone)+'</span>'+(o.tg&&o.tg.username?' <span>@'+esc(o.tg.username)+'</span>':'')+(m==='courier'?' <a class=\"btn ghost sm\" href=\"'+telHref(o.phone)+'\">'+L('Позвонить','Qoʻngʻiroq')+'</a>':'')+' <button type=\"button\" class=\"btn ghost sm ic\" data-act=\"copy\" data-v=\"'+esc(m==='courier'&&o.address?o.address:o.phone)+'\"'+(m==='courier'?' data-ok=\"'+L('Адрес скопирован','Manzil nusxalandi')+'\" data-lab=\"\"':'')+' title=\"'+(m==='courier'?L('Копировать адрес','Manzilni nusxalash'):L('Копировать','Nusxalash'))+'\" aria-label=\"'+(m==='courier'?L('Копировать адрес','Manzilni nusxalash'):L('Копировать','Nusxalash'))+'\">'+ICO.copy+'</button></div>':'')\n    +((m==='seller'||m==='courier')&&o.crn&&!o.mine&&o.status!=='done'?'<div class=\"note\">🚚 '+L('Везёт: ','Olib ketmoqda: ')+esc(o.crn)+'</div>':'')\n    +(m==='seller'&&o.status==='done'&&o.crn?'<div class=\"note\">🚚 '+L('Доставил: ','Yetkazdi: ')+esc(o.crn)+'</div>':'')\n    +((m==='seller'||m==='courier')&&o.loc?'<div class=\"oloc\"><button type=\"button\" class=\"lchip\" data-act=\"map\" data-lat=\"'+o.loc.lat+'\" data-lng=\"'+o.loc.lng+'\" data-t=\"'+esc(o.org||o.name)+'\">'+ICO.pin+L('Точка на карте','Xaritadagi nuqta')+'</button></div>':'')\n    +(o.comment?'<div class=\"cm\">'+esc(o.comment)+'</div>':'')\n    +((m==='seller'||m==='courier')&&o.debt?'<div class=\"note warnnote\">'+L('Долг магазина: ','Doʻkon qarzi: ')+money(o.debt.bal)+(o.debt.days?' · '+L('просрочка '+o.debt.days+' дн.',o.debt.days+' kun kechikdi'):'')+'</div>':'')\n    +'<div class=\"tot\"><b>'+money(o.total)+'</b><span>'+(o.pay?esc(payText(o)):L('оплата при получении','olganda toʻlanadi'))+'</span></div>'\n    +(acts?'<div class=\"acts\">'+acts+'</div>':'')\n    +'</div></article>';\n}\nfunction renderMine(){\n  let h='<div class=\"wrap page\"><h1>'+L('Мои заказы','Mening buyurtmalarim')+'</h1>'+bannerSlot();\n  if(!S.ready)h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!S.auth)h+='<div class=\"empty\"><b>'+L('Откройте через бота','Bot orqali oching')+'</b>'+L('Чтобы видеть свои заказы, откройте приложение из бота в Telegram.','Buyurtmalaringizni koʻrish uchun ilovani Telegramdagi botdan oching.')+'</div>';\n  else if(!S.myOrders.length)h+='<div class=\"empty\"><b>'+L('Пока нет заказов','Hozircha buyurtma yoʻq')+'</b>'+L('Выберите товары в каталоге, и заказ появится здесь со статусом.','Katalogdan mahsulot tanlang, buyurtma shu yerda holati bilan koʻrinadi.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"nav\" data-v=\"shop\">'+L('Открыть каталог','Katalogni ochish')+'</button></div>';\n  else{\n    const list=S.myOrders.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));\n    h+='<p class=\"lead\">'+L('Заказы у всех дистрибьюторов. Статус обновляется, когда продавец принимает и собирает заказ.','Barcha distribyutorlardagi buyurtmalar. Sotuvchi buyurtmani qabul qilib yigʻganda holat yangilanadi.')+'</p><div class=\"ordlist\">'+list.map(o=>orderCard(o,'mine')).join('')+'</div>';\n  }\n  view.innerHTML=h+'</div>';\n}\n\n/* ---------- профиль клиента ---------- */\nfunction rolesBoxHTML(){\n  const rs=myRoles();\n  return '<div class=\"rolebox\"><small>'+L('Ваши роли','Rollaringiz')+'</small>'\n    +(rs.length?rs.map(x=>'<div><b>'+esc(x.n)+'</b>'+(x.d.length?' · '+esc(x.d.join(', ')):'')+'</div>').join(''):'<div><b>'+L('Магазин','Doʻkon')+'</b></div>')+'</div>';\n}\nfunction renderProfile(){\n  let h='<div class=\"wrap page\"><h1>'+L('Мой профиль','Mening profilim')+'</h1>';\n  if(!S.ready)h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!S.did)h+='<div class=\"empty\"><b>'+L('Выберите дистрибьютора','Distribyutorni tanlang')+'</b>'+L('Профиль хранится у каждого дистрибьютора отдельно.','Profil har bir distribyutorda alohida saqlanadi.')+'</div>';\n  else if(!S.auth)h+='<div class=\"empty\"><b>'+L('Откройте через бота','Bot orqali oching')+'</b>'+L('Профиль доступен, если открыть приложение из бота в Telegram.','Profil ilovani Telegramdagi botdan ochganda mavjud.')+'</div>';\n  else{\n    const p=S.profile||{name:'',phone:'',org:'',addrs:[]};\n    h+='<p class=\"lead\">'+L('Эти данные подставляются в заказ, на любом вашем устройстве. При оформлении заказа их можно изменить.','Bu maʼlumotlar istalgan qurilmangizda buyurtmaga avtomatik qoʻyiladi. Buyurtma berayotganda oʻzgartirish mumkin.')+'</p>'\n      +(S.blocked?'<div class=\"bannerbad\" role=\"alert\" style=\"margin-bottom:12px\">'+esc(blockedTxt())+'</div>':'')\n      +rolesBoxHTML()\n      +'<div class=\"card\"><div class=\"form\">'\n      +'<div><label class=\"lab\" for=\"p-name\">'+L('Ваше имя','Ismingiz')+'</label><input type=\"text\" id=\"p-name\" data-pf=\"name\" maxlength=\"60\" value=\"'+esc(p.name)+'\" autocomplete=\"name\"><div class=\"err\" id=\"pe-name\"></div></div>'\n      +'<div><label class=\"lab\" for=\"p-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"p-phone\" data-pf=\"phone\" maxlength=\"25\" value=\"'+esc(p.phone)+'\" placeholder=\"+998 90 123 45 67\" autocomplete=\"tel\"><div class=\"err\" id=\"pe-phone\"></div></div>'\n      +'<div class=\"full\"><label class=\"lab\" for=\"p-org\">'+L('Организация (магазин, кафе, компания)','Tashkilot (doʻkon, kafe, kompaniya)')+'</label><input type=\"text\" id=\"p-org\" data-pf=\"org\" maxlength=\"80\" value=\"'+esc(p.org)+'\" autocomplete=\"organization\"><div class=\"err\" id=\"pe-org\"></div></div>'\n      +'<div class=\"full\"><label class=\"lab\" for=\"p-addrs\">'+L('Адреса доставки: каждый с новой строки, до 5','Yetkazib berish manzillari: har biri yangi qatordan, 5 tagacha')+'</label><textarea id=\"p-addrs\" data-pf=\"addrs\" rows=\"4\" placeholder=\"'+esc(L('Город, улица, дом, ориентир','Shahar, koʻcha, uy, moʻljal'))+'\">'+esc((p.addrs||[]).join('\\n'))+'</textarea><div class=\"err\" id=\"pe-addrs\"></div></div>'\n      +'</div><div class=\"row-btns\" style=\"margin-top:14px\"><button type=\"button\" class=\"btn\" id=\"pfsave\" data-act=\"pfsave\">'+L('Сохранить','Saqlash')+'</button></div></div>';\n  }\n  view.innerHTML=h+'</div>';\n}\n/* общая проверка полей клиента на телефоне; возвращает {v} или {e:{поле:текст}} */\nfunction checkClientFields(get){\n  const e={},v={name:get('name').trim(),phone:get('phone').trim(),org:get('org').trim()};\n  if(v.phone&&(v.phone.replace(/\\D/g,'').length<9||v.phone.replace(/\\D/g,'').length>15))e.phone=L('Проверьте номер телефона','Telefon raqamini tekshiring');\n  const lines=get('addrs').split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean),addrs=[];\n  lines.forEach(x=>{if(!addrs.some(y=>y.toLowerCase()===x.toLowerCase()))addrs.push(x)});\n  if(addrs.some(x=>x.length<5))e.addrs=L('Адрес слишком короткий','Manzil juda qisqa');\n  else if(addrs.length>5)e.addrs=L('Можно сохранить не больше 5 адресов','5 tadan ortiq manzil saqlab boʻlmaydi');\n  v.addrs=addrs;\n  return Object.keys(e).length?{e}:{v};\n}\nconst clientErrText=er=>({\n  bad_phone:L('Проверьте номер телефона','Telefon raqamini tekshiring'),\n  bad_addr:L('Адрес слишком короткий','Manzil juda qisqa'),\n  too_many_addrs:L('Можно сохранить не больше 5 адресов','5 tadan ortiq manzil saqlab boʻlmaydi'),\n  busy:L('Сейчас сохранить нельзя. Попробуйте позже.','Hozir saqlab boʻlmaydi. Keyinroq urinib koʻring.')\n}[er]||L('Не удалось сохранить. Проверьте соединение.','Saqlab boʻlmadi. Ulanishni tekshiring.'));\nasync function saveProfile(){\n  if(S.pfBusy||!S.auth)return;\n  const get=k=>{const el=document.getElementById('p-'+k);return el?String(el.value):''};\n  const c=checkClientFields(get);\n  ['name','phone','org','addrs'].forEach(k=>{const er=document.getElementById('pe-'+k),inp=document.getElementById('p-'+k);if(er)er.textContent=(c.e&&c.e[k])||'';if(inp)inp.setAttribute('aria-invalid',c.e&&c.e[k]?'true':'false')});\n  if(c.e){const k=Object.keys(c.e)[0],inp=document.getElementById('p-'+k);if(inp)inp.focus();return}\n  S.pfBusy=true;\n  const btn=$('#pfsave');if(btn)btn.disabled=true;\n  const r=await api('PUT','/api/profile',c.v);\n  S.pfBusy=false;\n  if(btn)btn.disabled=false;\n  if(!r.ok||!r.data||!r.data.profile){toast(clientErrText(r.data&&r.data.error));return}\n  S.profile=r.data.profile;\n  /* данные профиля подставляем в форму заказа сразу; адрес — только если поле пустое или адреса больше нет в профиле */\n  S.form.name=S.profile.name||S.form.name;S.form.phone=S.profile.phone||S.form.phone;\n  if(!S.form.address||!S.profile.addrs.some(a=>a.toLowerCase()===S.form.address.toLowerCase()))S.form.address=S.profile.addrs[0]||S.form.address;\n  saveForm();\n  toast(L('Профиль сохранён','Profil saqlandi'));\n  if(S.view==='profile')renderProfile();\n}\n\n/* ---------- seller ---------- */\nfunction renderSeller(){\n  if(!S.admin){view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Раздел для продавца','Sotuvchi boʻlimi')+'</b>'+L('Откройте приложение с правами редактора.','Ilovani muharrir huquqi bilan oching.')+'</div></div>';return}\n  view.innerHTML='<div class=\"wrap page\">'+backHTML()+'<div class=\"hrow\" style=\"margin-bottom:14px\"><div><div class=\"eyebrow\">'+L('Продавец','Sotuvchi')+' · '+esc(S.cfg.shop.name||DEFAULT.shop.name)+'</div><h1 id=\"stitle\"></h1></div></div>'\n    +(S.off?'<div class=\"bannerbad\" role=\"alert\" style=\"margin-bottom:12px\">'+esc(L('Владелец площадки скрыл ваш каталог: клиенты его не видят и не могут заказать.','Platforma egasi katalogingizni yashirgan: mijozlar uni koʻrmaydi va buyurtma bera olmaydi.'))+'</div>':'')\n    +'<div id=\"sbody\"></div></div>';\n  paintTabs();\n  paintSeller();\n}\n/* сколько товаров заканчивается или закончилось (число на вкладке «Остатки») */\nconst stockWarn=()=>S.prod.items.filter(p=>{const s=stState(p);return s==='low'||s==='out'}).length;\nfunction paintTabs(){\n  const t=$('#stitle');\n  if(t){const x=sellerSubs().find(y=>y[0]===S.sellerTab);t.textContent=x?x[1]:''}\n  renderNav();\n}\n/* открыть раздел продавца из меню: из любого места приложения */\nfunction sellerOpen(tab){\n  S.sellerTab=tab;S.sc=null;S.pay=null;\n  if(tab==='debts')S.dbt.open=null;\n  if(S.view!=='seller')go('seller');\n  else{paintTabs();paintSeller();window.scrollTo(0,0)}\n  if(tab==='stock'){loadStock();if(S.jrOpen)loadJournal()}\n  if(tab==='reports')loadReport();\n  if(tab==='debts')loadDebts();\n  if(tab==='dlv'){S.dv.open=null;S.dv.det=null;loadCouriers()}\n}\nfunction paintSeller(){\n  const b=$('#sbody');if(!b)return;\n  if(S.sellerTab==='orders')b.innerHTML=ordersHTML();\n  else if(S.sellerTab==='prod')b.innerHTML=prodHTML();\n  else if(S.sellerTab==='stock')b.innerHTML=stockHTML();\n  else if(S.sellerTab==='debts')b.innerHTML=debtsHTML();\n  else if(S.sellerTab==='dlv')b.innerHTML=couriersHTML();\n  else if(S.sellerTab==='reports')b.innerHTML=repHTML();\n  else b.innerHTML=settingsHTML();\n  paintSave();\n}\nfunction ordersHTML(){\n  const all=S.allOrders,today=ymd(shopNow());\n  const act=o=>o.status==='new'||o.status==='accepted'||o.status==='ready';\n  const nNew=all.filter(o=>o.status==='new').length;\n  const nWork=all.filter(o=>o.status==='accepted').length;\n  const nToday=all.filter(o=>act(o)&&String(o.pickupAt).slice(0,10)===today).length;\n  const sum=Number(S.stats.doneSum)||0;\n  let h='<div class=\"stats\"><div class=\"stat'+(nNew?' hot':'')+'\"><small>'+L('Новые','Yangi')+'</small><b>'+nNew+'</b></div><div class=\"stat\"><small>'+L('В работе','Ishlanmoqda')+'</small><b>'+nWork+'</b></div><div class=\"stat\"><small>'+L('На сегодня','Bugunga')+'</small><b>'+nToday+'</b></div><div class=\"stat\"><small>'+L('Завершено на сумму','Yakunlangan summa')+'</small><b>'+money(sum)+'</b></div></div>';\n  const fl=[['active',L('Активные','Faol')],['done',L('Завершены','Yakunlangan')],['cancelled',L('Отменены','Bekor qilingan')],['all',L('Все','Hammasi')]];\n  h+='<div class=\"filters\">'+fl.map(f=>'<button type=\"button\" class=\"chip\" data-act=\"filter\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(S.filter===f[0])+'\">'+f[1]+'</button>').join('')+'</div>';\n  h+=xtoolsHTML();\n  let list=all.filter(o=>S.filter==='all'?true:S.filter==='active'?act(o):o.status===S.filter);\n  if(S.filter==='active')list.sort((a,b)=>String(a.pickupAt).localeCompare(String(b.pickupAt)));\n  else list.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));\n  if(!list.length)h+='<div class=\"empty\"><b>'+(all.length?L('В этом списке пусто','Bu roʻyxat boʻsh'):L('Заказов пока нет','Hozircha buyurtma yoʻq'))+'</b>'+(all.length?L('Выберите другой фильтр.','Boshqa filtrni tanlang.'):L('Когда клиент оформит заказ, он появится здесь с составом, адресом и телефоном.','Mijoz buyurtma berganda, u shu yerda tarkibi, manzili va telefoni bilan paydo boʻladi.'))+'</div>';\n  else h+='<div class=\"ordlist\">'+list.map(o=>orderCard(o,'seller')).join('')+'</div>';\n  return h;\n}\n/* ---------- оплата при выдаче и долги ---------- */\nconst PAYN={cash:['Наличные','Naqd'],card:['Карта','Karta'],bank:['Перечисление','Oʻtkazma'],credit:['В долг','Qarzga']};\nconst PAYI={cash:'💵',card:'💳',bank:'🏦',credit:'📒'};\nconst payName=m=>(PAYI[m]||'')+' '+(PAYN[m]?L(PAYN[m][0],PAYN[m][1]):'');\n/* как оплачен выданный заказ: способ, а при долге срок и сколько оплачено сразу */\nfunction payText(o){\n  const p=o.pay;\n  if(!p)return '';\n  if(p.m!=='credit')return payName(p.m);\n  return (p.paid?payName(p.pm)+' '+money(p.paid)+' + ':'')+payName('credit')+(p.paid?' '+money(Math.max(0,(Number(o.total)||0)-p.paid)):'')+' · '+L('до ','gacha ')+fDay(p.due);\n}\nconst lateTxt=d=>d.days?L('просрочка '+d.days+' дн.',d.days+' kun kechikdi'):d.due?L('срок '+fDay(d.due),'muddat '+fDay(d.due)):L('без срока','muddatsiz');\n/* «Выдан клиенту»: сначала спрашиваем, как оплатил клиент. Наличные, карта и перечисление записываются одним нажатием, «в долг» просит срок и позволяет отметить часть, оплаченную сразу. */\nfunction payOpen(id){\n  S.pay={id,key:okey(id,S.did),step:'m',days:'7',paid:'',pm:'cash'};\n  paintSeller();\n}\nconst curPay=()=>S.view==='courier'?S.cr.pay:S.pay;\nconst curOrder=id=>(S.view==='courier'?S.cr.orders:S.allOrders).find(x=>x.id===id);\nfunction payBlockHTML(o){\n  const p=curPay();\n  let h='<div class=\"payb\"><div class=\"pt\">'+L('Как оплатил клиент?','Mijoz qanday toʻladi?')+'</div><div class=\"pmute\">'+L('К оплате: ','Toʻlanadi: ')+money(o.total)+'</div>';\n  if(p.step==='m'){\n    h+='<div class=\"pyrow\">'+['cash','card','bank','credit'].filter(k=>k!=='credit'||S.view!=='courier'||S.courier.credit!==false).map(k=>'<button type=\"button\" class=\"chip\" data-act=\"paym\" data-m=\"'+k+'\"'+(S.cr.busy&&S.view==='courier'?' disabled':'')+'>'+esc(payName(k))+'</button>').join('')+'</div>';\n  }else{\n    h+='<div class=\"pyrow\"><label for=\"pd-days\">'+L('В долг на (дней)','Qarzga (kun)')+'</label><input type=\"number\" id=\"pd-days\" inputmode=\"numeric\" min=\"1\" max=\"90\" step=\"1\" value=\"'+esc(p.days)+'\">'\n      +[3,7,14,30].map(n=>'<button type=\"button\" class=\"chip\" data-act=\"paydays\" data-n=\"'+n+'\" aria-pressed=\"'+(String(p.days)===String(n))+'\">'+n+'</button>').join('')+'</div>'\n      +'<div class=\"pyrow\"><label for=\"pd-paid\">'+L('Оплачено сразу (необязательно)','Darhol toʻlangan (ixtiyoriy)')+'</label><input type=\"number\" id=\"pd-paid\" inputmode=\"numeric\" min=\"0\" step=\"1\" value=\"'+esc(p.paid)+'\" placeholder=\"0\">'\n      +['cash','card','bank'].map(k=>'<button type=\"button\" class=\"chip\" data-act=\"paypm\" data-v=\"'+k+'\" aria-pressed=\"'+(p.pm===k)+'\">'+esc(payName(k))+'</button>').join('')+'</div>'\n      +'<div class=\"pmute\" id=\"pd-rest\">'+payRestTxt(o)+'</div>'\n      +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm\" data-act=\"paygo\">'+L('Выдать в долг','Qarzga topshirish')+'</button></div>';\n  }\n  return h+'<div class=\"pyrow\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"payback\">'+L('Назад','Orqaga')+'</button></div></div>';\n}\nfunction payRestTxt(o){\n  const paid=Math.floor(Number(curPay().paid)||0),rest=(Number(o.total)||0)-(paid>0?paid:0);\n  return L('Запишется в долг: ','Qarzga yoziladi: ')+money(Math.max(0,rest));\n}\nfunction payMethod(m){\n  const p=curPay(),cr=S.view==='courier';\n  if(!p)return;\n  if(m==='credit'){p.step='credit';if(cr)paintCourier();else paintSeller();return}\n  if(PAYN[m]){if(cr)crDone(p.id,{m});else setStatus(p.id,'done',{m})}\n}\nfunction payGo(){\n  const p=curPay(),o=p&&curOrder(p.id),cr=S.view==='courier';\n  if(!o)return;\n  const dEl=$('#pd-days'),pEl=$('#pd-paid');\n  const days=Number(String(dEl?dEl.value:p.days).trim());\n  if(!Number.isInteger(days)||days<1||days>90){toast(L('Срок: целое число дней от 1 до 90','Muddat: 1 dan 90 gacha butun kun'));if(dEl)dEl.focus();return}\n  const raw=String(pEl?pEl.value:p.paid).trim(),paid=raw===''?0:Number(raw);\n  if(!Number.isInteger(paid)||paid<0||paid>=o.total){\n    toast(L('Оплачено сразу должно быть меньше суммы заказа. Если клиент оплатил всё, выберите способ оплаты.','Darhol toʻlangan summa buyurtma summasidan kam boʻlishi kerak. Mijoz hammasini toʻlagan boʻlsa, toʻlov usulini tanlang.'));\n    if(pEl)pEl.focus();return;\n  }\n  const pay=paid>0?{m:'credit',days,paid,pm:p.pm}:{m:'credit',days};\n  if(cr)crDone(o.id,pay);else setStatus(o.id,'done',pay);\n}\n\n/* ---------- «Мой долг»: что видит сам магазин ---------- */\nfunction newMyDebt(){return {ok:false,full:false,list:[],total:0,over:0,late:0,n:0,ask:0,busy:false,ex:{}}}\nasync function loadMyDebt(full){\n  if(!S.auth)return;\n  if(!full&&S.view==='debt')return;   // на самом экране нужны заказы и оплаты, краткий ответ их затёр бы\n  const r=await api('GET','/api/hub/debts'+(full?'?full=1':''));\n  if(!r.ok||!r.data||!Array.isArray(r.data.debts))return;\n  const m=S.mdebt,d=r.data,f=!!full;\n  if(m.ok&&m.full===f&&JSON.stringify([d.debts,d.total,d.over,d.ask])===JSON.stringify([m.list,m.total,m.over,m.ask]))return;\n  Object.assign(m,{ok:true,full:f,list:d.debts,total:d.total,over:d.over,late:d.late,n:d.n,ask:d.ask||0});\n  renderNav();paintDebtBanner();\n  if(S.view==='debt')renderMyDebt();\n}\nconst debtBannerHTML=()=>{\n  const m=S.mdebt;\n  if(!S.auth||!m.ok||!(m.total>0||m.ask>0))return '';\n  const ask=m.ask>0?L('Подтвердите записей: '+m.ask,'Tasdiqlang: '+m.ask):'';\n  return '<button type=\"button\" class=\"dbn'+(m.over>0?' late':'')+'\" data-act=\"nav\" data-v=\"debt\"><span><b>'+(m.total>0?L('Ваш долг ','Sizning qarzingiz ')+money(m.total):L('Подтвердите записи','Yozuvlarni tasdiqlang'))+'</b><small>'+(m.total>0&&ask?ask:m.over>0?L('Просрочено ','Muddati oʻtgan ')+money(m.over):L('Заказы и оплаты','Buyurtmalar va toʻlovlar'))+'</small></span><span class=\"lchev\">'+ICO.chev+'</span></button>';\n};\nconst bannerSlot=()=>'<div id=\"mdbanner\">'+debtBannerHTML()+'</div>';\nfunction paintDebtBanner(){const el=$('#mdbanner');if(el)el.innerHTML=debtBannerHTML()}\n/* Подписи под оплатой в «Моём долге»: подтверждена ли, отменена ли и почему, закрыл ли продавец вопрос. */\nfunction mdChips(r){\n  const c=(cls,t)=>'<span class=\"cfc'+(cls?' '+cls:'')+'\">'+t+'</span>';\n  let h='';\n  if(r.void)h=r.vwhy?c('bad',L('Отменена. Причина: ','Bekor qilindi. Sabab: ')+esc(r.vwhy)):'';\n  else if(r.rsl)h=c('ok',L('Продавец закрыл вопрос: ','Sotuvchi masalani yopdi: ')+esc(r.rsl.why||''));\n  else if(r.cf==='ok')h=c('ok','✓ '+L('Вы подтвердили','Siz tasdiqladingiz'));\n  else if(r.cf==='no')h=c('bad',L('Вы отметили «Не так»','Siz «Notoʻgʻri» dedingiz'));\n  else if(r.cf==='wait'||r.cf==='na')h=c('warn',L('Ждёт вашего ответа','Javobingiz kutilmoqda'));\n  return h?'<div class=\"cfl\"><span class=\"cfs\">'+h+'</span></div>':'';\n}\n/* Записи, на которые отвечает магазин: выдача в долг, оплата и акт сверки. */\nconst cfK=r=>r.k==='ch'||r.k==='pay'||r.k==='ac';\n/* Остаток словами: долг, переплата или «долга нет». */\nconst balWords=v=>v>0?L('долг ','qarz ')+money(v):v<0?L('переплата ','ortiqcha toʻlov ')+money(-v):L('долга нет','qarz yoʻq');\n/* Записи, на которые магазин ещё не ответил или ответил «Не так» (их можно изменить на «Верно»). Записи одного заказа — одним блоком. */\nfunction mdAsks(x){\n  const rows=x.rows||[],seen=new Set(),out=[];\n  rows.forEach(r=>{\n    if(!cfK(r)||!r.cf||r.cf==='ok'||r.void||r.rsl)return;\n    const g=r.g||r.n;\n    if(seen.has(g))return;\n    seen.add(g);\n    out.push({g,rows:rows.filter(z=>(z.g||z.n)===g&&cfK(z)&&z.cf)});\n  });\n  return out;\n}\nfunction mdAskHTML(x,a){\n  const ch=a.rows.find(r=>r.k==='ch'),p=a.rows.find(r=>r.k==='pay'),ac=a.rows.find(r=>r.k==='ac'),first=a.rows[0],no=a.rows.every(r=>r.cf==='no'),dis=S.mdebt.busy?' disabled':'';\n  const title=ac?L('Акт сверки: '+(ac.f?fDay(ac.f):'с начала')+' – '+fDay(ac.e)+', '+balWords(ac.cb),'Solishtirma dalolatnoma: '+(ac.f?fDay(ac.f):'boshidan')+' – '+fDay(ac.e)+', '+balWords(ac.cb))\n    :ch?L('Заказ '+esc(ch.ref)+' выдан вам в долг на '+money(ch.a)+(ch.due?', срок '+fDay(ch.due):''),esc(ch.ref)+' buyurtma sizga qarzga berildi: '+money(ch.a)+(ch.due?', muddat '+fDay(ch.due):''))\n    :L('Принята оплата долга: '+esc(payName(p.m))+' '+money(p.a),'Qarz toʻlovi qabul qilindi: '+esc(payName(p.m))+' '+money(p.a));\n  const btn=(ok,label,cls)=>'<button type=\"button\" class=\"btn sm'+(cls?' '+cls:'')+'\" data-act=\"mdcf\" data-did=\"'+esc(x.did)+'\" data-g=\"'+a.g+'\" data-ok=\"'+ok+'\"'+dis+'>'+label+'</button>';\n  return '<div class=\"dsp\"><b>'+title+'</b>'\n    +(ch&&p?'<div class=\"dpw\">'+L('Сразу оплачено: ','Darhol toʻlangan: ')+esc(payName(p.m))+' '+money(p.a)+'</div>':'')\n    +(ac?'<div class=\"dpw\">'+L('Заказы и оплаты за период — в сообщении бота в Telegram.','Davr buyurtmalari va toʻlovlari — Telegramdagi bot xabarida.')+'</div>':'')\n    +'<div class=\"dpw\">'+esc(jrDate(first.t))+(first.bn?' · '+(ac?L('Отправил: ','Yubordi: '):L('Принял: ','Qabul qildi: '))+'<b>'+esc(first.bn)+'</b>':'')+'</div>'\n    +(no?'<div class=\"note warnnote\">'+L('Вы отметили «Не так», продавец это видит. Если ошиблись, подтвердите запись.','Siz «Notoʻgʻri» dedingiz, sotuvchi buni koʻradi. Adashgan boʻlsangiz, yozuvni tasdiqlang.')+'</div>':'')\n    +'<div class=\"cfq\">'+btn(1,'✅ '+L(no?'Всё-таки верно':'Верно',no?'Baribir toʻgʻri':'Toʻgʻri'))+(no?'':btn(0,'❌ '+L('Не так','Notoʻgʻri'),'ghost dangerbtn'))+'</div></div>';\n}\nasync function myDebtConfirm(did,g,ok){\n  const m=S.mdebt;\n  if(m.busy)return;\n  m.busy=true;renderMyDebt();\n  const r=await api('POST','/api/hub/debts/confirm',{did,n:g,ok});\n  m.busy=false;\n  if(!r.ok||!r.data||r.data.debt===undefined){\n    toast(r.status===409?L('Эту запись уже нельзя изменить','Bu yozuvni endi oʻzgartirib boʻlmaydi'):L('Не удалось отправить ответ. Проверьте соединение.','Javobni yuborib boʻlmadi. Ulanishni tekshiring.'));\n    await loadMyDebt(true);renderMyDebt();return;\n  }\n  const d=r.data.debt;\n  m.list=d?m.list.map(x=>x.did===did?d:x):m.list.filter(x=>x.did!==did);\n  Object.assign(m,{n:m.list.length,total:m.list.reduce((t,x)=>t+x.bal,0),over:m.list.reduce((t,x)=>t+x.over,0),late:m.list.filter(x=>x.days>0).length,ask:m.list.reduce((t,x)=>t+(x.ask||0),0)});\n  renderNav();paintDebtBanner();renderMyDebt();\n  toast(ok?L('Спасибо, подтверждено','Rahmat, tasdiqlandi'):L('Отмечено «Не так». Продавец увидит.','«Notoʻgʻri» deb belgilandi. Sotuvchi koʻradi.'));\n}\nfunction myDebtBlock(x){\n  const ex=S.mdebt.ex,today=ymd(shopNow()),tg=String((x.contact&&x.contact.telegram)||'').replace(/^@/,'').trim(),ph=(x.contact&&x.contact.phone)||'';\n  let h='<section class=\"mdd\"><div class=\"mdh\"><h2>'+esc(x.shopName||'')+'</h2><div class=\"mdsum\"><b>'+money(x.bal)+'</b>'\n    +(x.days>0?'<small class=\"bad\">'+L('просрочка '+x.days+' дн.','kechikish '+x.days+' kun')+'</small>':x.due?'<small>'+L('срок ','muddat ')+fDay(x.due)+'</small>':'')+'</div></div>';\n  const asks=mdAsks(x);\n  if(asks.length)h+='<h3 class=\"dsub\">'+L('Подтвердите записи','Yozuvlarni tasdiqlang')+'</h3>'+asks.map(a=>mdAskHTML(x,a)).join('');\n  const open=(x.open||[]).filter(q=>q&&q.r>0);\n  if(open.length)h+='<h3 class=\"dsub\">'+L('Не оплачено','Toʻlanmagan')+'</h3><div class=\"lbox\">'+open.map(q=>lgRowBox('o:'+x.did+':'+(q.ref||''),ordIn(x,q.ref),q.r,'<div class=\"lt\"><b>'+(q.ref?esc(q.ref):L('Прежний долг','Oldingi qarz'))+'</b><small>'+(q.due?(q.due<today?L('срок вышел ','muddat oʻtdi ')+fDay(q.due):L('срок ','muddat ')+fDay(q.due)):L('без срока','muddatsiz'))+'</small></div><div class=\"lsum\">'+money(q.r)+'</div>','',ex,'mdord')).join('')+'</div>';\n  const pays=(x.rows||[]).filter(r=>r.k==='pay');\n  if(pays.length)h+='<h3 class=\"dsub\">'+L('Оплаты','Toʻlovlar')+'</h3><div class=\"lbox\">'+pays.slice(0,15).map(r=>'<div class=\"lrow'+(r.void?' void':'')+'\"><div class=\"lt\"><b>'+esc(payName(r.m))+'</b><small>'+esc(jrDate(r.t))+(r.bn?' · '+L('Принял: ','Qabul qildi: ')+esc(r.bn):'')+(r.void?' · '+L('отменена','bekor qilingan'):'')+'</small></div><div class=\"lsum pos\">−'+money(r.a)+'</div></div>'+mdChips(r)).join('')+'</div>'\n    +(pays.length>15?'<p class=\"rnote\">'+L('Показаны последние 15 оплат.','Oxirgi 15 ta toʻlov koʻrsatilgan.')+'</p>':'');\n  const btns=(tg?'<a class=\"btn ghost sm\" data-act=\"contact\" href=\"https://t.me/'+encodeURIComponent(tg)+'?text='+encodeURIComponent(L('Здравствуйте! Вопрос по долгу.','Assalomu alaykum! Qarz boʻyicha savol.'))+'\" target=\"_blank\" rel=\"noopener\">'+L('Написать дистрибьютору','Distribyutorga yozish')+'</a>':'')\n    +(ph?'<a class=\"btn ghost sm\" href=\"'+telHref(ph)+'\">'+L('Позвонить','Qoʻngʻiroq')+'</a>':'');\n  if(btns)h+='<div class=\"row-btns\" style=\"margin-top:12px\">'+btns+'</div>';\n  return h+'</section>';\n}\nfunction renderMyDebt(){\n  const m=S.mdebt;\n  let h='<div class=\"wrap page\"><h1>'+L('Мой долг','Mening qarzim')+'</h1>';\n  if(!S.auth)h+='<div class=\"empty\"><b>'+L('Откройте через бота','Bot orqali oching')+'</b>'+L('Чтобы видеть свой долг, откройте приложение из бота в Telegram.','Qarzingizni koʻrish uchun ilovani Telegramdagi botdan oching.')+'</div>';\n  else if(!m.ok||(m.list.length&&!m.full))h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!m.list.length)h+='<div class=\"empty\"><b>'+L('Долгов нет','Qarzlar yoʻq')+'</b>'+L('У вас нет неоплаченных заказов. Спасибо!','Toʻlanmagan buyurtmalaringiz yoʻq. Rahmat!')+'</div>';\n  else{\n    const dues=m.list.map(x=>x.due).filter(Boolean).sort();\n    h+='<div class=\"stats\"><div class=\"stat'+(m.over>0?' hot':'')+'\"><small>'+L('Вы должны','Siz qarzdorsiz')+'</small><b>'+money(m.total)+'</b></div>'\n      +'<div class=\"stat\"><small>'+L('Просрочено','Muddati oʻtgan')+'</small><b>'+money(m.over)+'</b></div>'\n      +'<div class=\"stat\"><small>'+L('Ближайший срок','Eng yaqin muddat')+'</small><b>'+(dues[0]?fDay(dues[0]):'—')+'</b></div></div>';\n    if(m.over>0)h+='<div class=\"note warnnote\" style=\"margin-bottom:12px\">'+L('Есть просроченные платежи. Пожалуйста, свяжитесь с дистрибьютором и оплатите.','Muddati oʻtgan toʻlovlar bor. Iltimos, distribyutor bilan bogʻlanib, toʻlang.')+'</div>';\n    h+=m.list.map(myDebtBlock).join('')\n      +'<p class=\"rnote\">'+L('Выдачу в долг и оплату записывает дистрибьютор или доставщик, а вы подтверждаете, что запись верна. Если нет, нажмите «Не так»: продавец увидит.','Qarzga berish va toʻlovni distribyutor yoki yetkazuvchi yozadi, siz esa yozuv toʻgʻriligini tasdiqlaysiz. Aks holda «Notoʻgʻri»ni bosing: sotuvchi koʻradi.')+'</p>';\n  }\n  view.innerHTML=h+'</div>';\n}\n\n/* ---------- вкладка «Долги» ---------- */\nconst DB=()=>S.view==='courier'?S.cr.dbt:S.dbt;\nconst dPaint=()=>S.view==='courier'?paintCourier():paintSeller();\nconst dApi=()=>S.view==='courier'?'/api/courier/debts':'/api/admin/debts';\nconst dLoad=()=>S.view==='courier'?loadCrDebts():loadDebts();\nfunction newDebts(){return {ok:false,list:[],total:0,overdue:0,n:0,late:0,fl:0,flt:'all',open:null,det:null,ex:{},amount:'',pm:'cash',note:'',busy:false,vn:0,vwhy:'',rn:0,rnote:'',morning:true,mbusy:false,actOpen:false,actp:'this'}}\nasync function loadDebts(){\n  if(!S.admin||!S.did)return;\n  const r=await api('GET','/api/admin/debts');\n  if(!r.ok||!r.data||!Array.isArray(r.data.debtors))return;\n  const d=S.dbt,same=d.ok&&JSON.stringify([r.data.debtors,r.data.total,r.data.late,r.data.fl])===JSON.stringify([d.list,d.total,d.late,d.fl]);\n  Object.assign(d,{ok:true,list:r.data.debtors,total:r.data.total,overdue:r.data.overdue,n:r.data.n,late:r.data.late,fl:r.data.fl||0,morning:r.data.morning!==false});\n  if(!same)renderNav();\n  if(same||S.view!=='seller')return;\n  paintTabs();\n  if(S.sellerTab==='debts'&&d.open===null){\n    const ae=document.activeElement;\n    if(!(ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)))paintSeller();\n  }\n}\nfunction debtsHTML(){\n  const d=DB();\n  if(d.open!==null)return debtorHTML();\n  if(!d.ok)return '<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  let h='<div class=\"stats\"><div class=\"stat'+(d.late?' hot':'')+'\"><small>'+L('Всего должны','Jami qarz')+'</small><b>'+money(d.total)+'</b></div>'\n    +'<div class=\"stat\"><small>'+L('Просрочено','Muddati oʻtgan')+'</small><b>'+money(d.overdue)+'</b></div>'\n    +'<div class=\"stat\"><small>'+L('Должников','Qarzdorlar')+'</small><b>'+d.n+'</b></div>'\n    +'<div class=\"stat\"><small>'+L('С просрочкой','Kechikkan')+'</small><b>'+d.late+'</b></div></div>';\n  if(d.fl>0)h+='<div class=\"note warnnote\" style=\"margin-bottom:10px\">'+L('Спорных записей: '+d.fl+'. Магазин ответил «Не так», не получил сообщение или молчит больше суток.','Bahsli yozuvlar: '+d.fl+'. Doʻkon «Notoʻgʻri» dedi, xabarni olmadi yoki bir sutkadan ortiq jim.')+'</div>'\n    +'<div class=\"filters\">'+[['all',L('Все','Hammasi')],['fl',L('Спорные','Bahsli')]].map(f=>'<button type=\"button\" class=\"chip\" data-act=\"dflt\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(d.flt===f[0])+'\">'+f[1]+'</button>').join('')+'</div>';\n  h+=dxHTML(d);\n  if(!d.list.length)return h+'<div class=\"empty\"><b>'+L('Долгов пока нет','Qarzlar hozircha yoʻq')+'</b>'+L('Когда вы выдадите заказ «в долг», магазин появится здесь. Оплаты записываются в карточке магазина, в том числе частями.','Buyurtmani «qarzga» topshirganingizda, doʻkon shu yerda paydo boʻladi. Toʻlovlar doʻkon kartochkasida yoziladi, shu jumladan qism-qism.')+'</div>'+dmHTML(d);\n  return h+'<div class=\"dlist\">'+d.list.filter(x=>d.flt!=='fl'||x.fl>0).map(x=>{\n    const adv=x.bal<0;\n    return '<button type=\"button\" class=\"drow'+(x.days&&!adv?' late':'')+'\" data-act=\"dopen\" data-uid=\"'+x.uid+'\"><div class=\"dn\"><b>'+esc(x.name||('ID '+x.uid))+'</b><small>'+esc([x.org,x.phone,x.addr].filter(Boolean).join(' · '))+'</small>'+(x.fl>0?'<small class=\"bad\">'+L('Спорных записей: '+x.fl,'Bahsli yozuvlar: '+x.fl)+'</small>':x.wt>0?'<small>'+L('Ждёт ответа магазина: '+x.wt,'Doʻkon javobi kutilmoqda: '+x.wt)+'</small>':'')+'</div>'\n      +'<div class=\"da\"><b>'+(adv?L('Аванс ','Avans ')+money(-x.bal):money(x.bal))+'</b>'+(adv||(x.bal===0&&(x.wt>0||x.fl>0))?'':'<small class=\"'+(x.days?'bad':'')+'\">'+esc(lateTxt(x))+'</small>')+'</div></button>';\n  }).join('')+'</div>'+dmHTML(d);\n}\n/* Утреннее напоминание в 9:00: список магазинов с просрочкой приходит продавцу в чат с ботом. Только у продавца. */\nfunction dmHTML(d){\n  if(S.view==='courier'||!S.admin)return '';\n  return '<div class=\"xtools\" style=\"margin-top:14px\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"dmorn\" aria-pressed=\"'+(d.morning?'true':'false')+'\"'+(d.mbusy?' disabled':'')+'>'+(d.morning?L('Утреннее напоминание: вкл','Ertalabki eslatma: yoqilgan'):L('Утреннее напоминание: выкл','Ertalabki eslatma: oʻchirilgan'))+'</button>'\n    +'<div class=\"unit\">'+L('Каждое утро в 9:00 бот пришлёт в чат список магазинов с просроченным долгом. Если просрочки нет, сообщения не будет. Магазинам ничего не отправляется.','Har kuni ertalab soat 9:00 da bot chatga muddati oʻtgan qarzi bor doʻkonlar roʻyxatini yuboradi. Muddati oʻtgan qarz boʻlmasa, xabar kelmaydi. Doʻkonlarga hech narsa yuborilmaydi.')+'</div></div>';\n}\nasync function dMorning(){\n  const d=S.dbt;if(d.mbusy||!S.admin)return;\n  const on=!d.morning;\n  d.mbusy=true;dPaint();\n  const r=await api('POST','/api/admin/debts/morning',{on});\n  d.mbusy=false;\n  if(r.ok&&r.data&&typeof r.data.morning==='boolean'){d.morning=r.data.morning;toast(d.morning?L('Утреннее напоминание включено','Ertalabki eslatma yoqildi'):L('Утреннее напоминание выключено','Ertalabki eslatma oʻchirildi'))}\n  else toast(L('Не получилось. Проверьте соединение и повторите.','Bajarib boʻlmadi. Ulanishni tekshirib, qayta urining.'));\n  dPaint();\n}\n/* «Долги в Excel»: кнопка открывает выбор (все / просроченные / спорные), файл уходит продавцу в чат с ботом. Только у продавца. */\nfunction dxHTML(d){\n  if(S.view==='courier'||!S.admin||!d.list.length)return '';\n  const n={all:d.list.length,over:d.list.filter(x=>x.bal>0&&x.days>0).length,fl:d.list.filter(x=>x.fl>0).length};\n  const chip=(f,lab)=>'<button type=\"button\" class=\"chip\" data-act=\"dxport\" data-f=\"'+f+'\"'+(n[f]&&!S.xbusy?'':' disabled')+'>'+lab+' · '+n[f]+'</button>';\n  return '<div class=\"xtools\"><button type=\"button\" class=\"btn ghost sm dxb\" data-act=\"dxmenu\" data-xk=\"debts\" aria-expanded=\"'+(S.dxm?'true':'false')+'\"'+(S.xbusy?' disabled':'')+'>'+xlab('debts')+'</button>'\n    +(S.dxm?'<div class=\"xmenu\">'+chip('all',L('Все','Hammasi'))+chip('over',L('Просроченные','Muddati oʻtgan'))+chip('fl',L('Спорные','Bahsli'))+'</div><div class=\"unit\">'+L('Файл придёт вам в чат с ботом. Лист «Долги»: по магазинам, лист «История»: все выдачи и оплаты. В шапке есть стрелки фильтров: по ним можно отобрать магазин, статус, сумму и срок.','Fayl botdagi chatingizga yuboriladi. «Qarzlar» varagʻi: doʻkonlar boʻyicha, «Tarix» varagʻi: barcha berilganlar va toʻlovlar. Sarlavhadagi filtr strelkalari orqali doʻkon, holat, summa va muddat boʻyicha tanlash mumkin.')+'</div>':'')\n    +'</div>';\n}\n/* Состав заказа, который лежит в основе долга: раскрывается по нажатию на строку. */\nfunction ordIn(x,ref){const o=x&&x.ords&&ref?x.ords[ref]:null;return o&&Array.isArray(o.items)?o:null}\nfunction ordOf(ref){return ordIn(DB().det,ref)}\nfunction ordBodyHTML(o,left){\n  const paid=Math.max(0,o.total-left);\n  return '<div class=\"ordx\">'+(o.at?'<div class=\"oxd\">'+L('Выдан ','Berilgan ')+esc(jrDate(o.at))+'</div>':'')\n    +o.items.map(it=>'<div class=\"pl\">'+itemRow(it)+'</div>').join('')\n    +discRow(o,'pl')\n    +(o.fee>0?'<div class=\"pl\"><span>'+L('Стоимость доставки','Yetkazib berish narxi')+'</span><span>'+money(o.fee)+'</span></div>':'')\n    +'<div class=\"pl t\"><span>'+L('Сумма заказа','Buyurtma summasi')+'</span><span>'+money(o.total)+'</span></div>'\n    +(left>0?(paid>0?'<div class=\"pl\"><span>'+L('Оплачено','Toʻlangan')+'</span><span>'+money(paid)+'</span></div>':'')+'<div class=\"pl left\"><span>'+L('Осталось оплатить','Toʻlash qoldi')+'</span><span>'+money(left)+'</span></div>'\n      :'<div class=\"pl ok\"><span>'+L('Оплачен полностью','Toʻliq toʻlangan')+'</span><span>'+money(o.total)+'</span></div>')\n    +'</div>';\n}\n/* Строка списка: если состав заказа известен, она превращается в кнопку-«гармошку». */\nfunction lgRowBox(key,o,left,inner,cls,ex,act){\n  if(!o)return '<div class=\"lrow'+(cls||'')+'\">'+inner+'</div>';\n  const on=!!(ex||DB().ex)[key];\n  return '<button type=\"button\" class=\"lrow'+(cls||'')+'\" data-act=\"'+(act||'dord')+'\" data-k=\"'+esc(key)+'\" aria-expanded=\"'+on+'\">'+inner+'<span class=\"lchev\">'+ICO.chev+'</span></button>'+(on?ordBodyHTML(o,left):'');\n}\n/* Контроль денег: подписи под записью — ответил ли магазин, сверены ли деньги, закрыт ли спор. */\nconst cfFlag=r=>!!(r.cf&&r.cf!=='ok'&&!r.void&&!r.rsl&&(r.cf!=='wait'||r.late));\nfunction cfLines(r){\n  if(!cfK(r))return '';\n  const c=(cls,t)=>'<span class=\"cfc'+(cls?' '+cls:'')+'\">'+t+'</span>';\n  let h='';\n  if(!r.void){\n    if(r.rsl)h+=c('ok',L('Спор закрыт: ','Bahs yopildi: ')+esc(r.rsl.bn||'')+' — '+esc(r.rsl.why||''));\n    else if(r.cf==='ok')h+=c('ok','✓ '+L('Магазин подтвердил','Doʻkon tasdiqladi'));\n    else if(r.cf==='wait')h+=r.late?c('bad',L('Магазин молчит больше суток','Doʻkon bir sutkadan ortiq jim')):c('',L('Ждём ответа магазина','Doʻkon javobi kutilmoqda'));\n    else if(r.cf==='no')h+=c('bad',L('Магазин: «Не так»','Doʻkon: «Notoʻgʻri»'));\n    else if(r.cf==='na')h+=c('bad',L('Магазин не получил сообщение','Doʻkon xabarni olmadi'));\n    if(r.vr==='wait')h+=c('warn',L('Деньги не сверены','Pul tekshirilmagan'));\n    else if(r.vr==='ok')h+=c('ok','✓ '+L('Деньги пришли','Pul tushdi'));\n  }\n  return h?'<span class=\"cfs\">'+h+'</span>':'';\n}\nfunction voidFormHTML(){\n  const d=DB(),dis=d.busy?' disabled':'';\n  return '<div class=\"payb\"><div class=\"pt\">'+L('Отмена записи об оплате','Toʻlov yozuvini bekor qilish')+'</div>'\n    +'<div class=\"pmute\">'+L('Долг магазина вернётся. Магазин и доставщик получат сообщение с причиной.','Doʻkon qarzi qaytadi. Doʻkon va yetkazuvchi sabab bilan xabar oladi.')+'</div>'\n    +'<div class=\"pyrow\"><input type=\"text\" id=\"dx-why\" maxlength=\"80\" value=\"'+esc(d.vwhy)+'\" placeholder=\"'+esc(L('Причина (обязательно)','Sabab (majburiy)'))+'\"'+dis+'></div>'\n    +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm dangerbtn\" data-act=\"dvoidgo\"'+dis+'>'+L('Отменить запись','Yozuvni bekor qilish')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"dvoidno\">'+L('Не отменять','Bekor qilmaslik')+'</button></div></div>';\n}\nfunction resFormHTML(){\n  const d=DB(),dis=d.busy?' disabled':'';\n  return '<div class=\"payb\"><div class=\"pt\">'+L('Закрыть спорную запись','Bahsli yozuvni yopish')+'</div>'\n    +'<div class=\"pmute\">'+L('Напишите, как вы разобрались с магазином. Запись останется в журнале с вашим именем и комментарием.','Doʻkon bilan qanday hal qilganingizni yozing. Yozuv jurnalda ismingiz va izohingiz bilan qoladi.')+'</div>'\n    +'<div class=\"pyrow\"><input type=\"text\" id=\"dx-note\" maxlength=\"120\" value=\"'+esc(d.rnote)+'\" placeholder=\"'+esc(L('Комментарий (обязательно)','Izoh (majburiy)'))+'\"'+dis+'></div>'\n    +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm\" data-act=\"dresgo\"'+dis+'>'+L('Закрыть','Yopish')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"dresno\">'+L('Не сейчас','Hozir emas')+'</button></div></div>';\n}\nfunction lgRowHTML(r){\n  let t,sum,sub=esc(jrDate(r.t));\n  const by=r.bn?' · '+L('Принял: ','Qabul qildi: ')+esc(r.bn):'',d=DB();\n  if(r.k==='ch'){t=L('Выдан заказ ','Buyurtma berildi ')+esc(r.ref||'')+(r.due?' · '+L('срок ','muddat ')+fDay(r.due):'');sum='+'+money(r.a);sub+=by}\n  else if(r.k==='pay'){t=L('Оплата: ','Toʻlov: ')+esc(payName(r.m))+(r.ref?' · '+esc(r.ref):'')+(r.note?' · '+esc(r.note):'');sum='−'+money(r.a);sub+=by}\n  else if(r.k==='ac'){t=L('Акт сверки: ','Solishtirma dalolatnoma: ')+(r.f?fDay(r.f):L('с начала','boshidan'))+' – '+fDay(r.e);sum=money(r.cb);sub+=(r.bn?' · '+L('Отправил: ','Yubordi: ')+esc(r.bn):'')+' · '+L('долг на конец периода','davr oxiridagi qarz')}\n  else{t=L('Оплата отменена','Toʻlov bekor qilindi');sum='+'+money(r.a);sub+=(r.bn?' · '+esc(r.bn):'')+(r.why?' · '+L('Причина: ','Sabab: ')+esc(r.why):'')}\n  if(r.void)sub+=' · '+L('отменена','bekor qilingan');\n  const inner='<div class=\"lt\"><b>'+t+'</b><small>'+sub+'</small></div><div class=\"lsum'+(r.k==='pay'?' pos':'')+'\">'+sum+'</div>';\n  const o=r.k==='ch'?ordOf(r.ref):null,x=d.det,q=o&&((x.open||[]).find(z=>z.ref===r.ref)||null);\n  const row=o?lgRowBox('h:'+r.n,o,q?q.r:0,inner,r.void?' void':''):'<div class=\"lrow'+(r.void?' void':'')+'\">'+inner+'</div>';\n  let acts='';\n  if(S.view!=='courier'){\n    if(r.k==='pay'&&!r.void)acts+=d.vn===r.n?voidFormHTML():'<button type=\"button\" class=\"btn ghost sm\" data-act=\"dvoid\" data-n=\"'+r.n+'\">'+L('Отменить запись','Yozuvni bekor qilish')+'</button>';\n    if(r._res)acts+=d.rn===r.n?resFormHTML():'<button type=\"button\" class=\"btn ghost sm\" data-act=\"dres\" data-n=\"'+r.n+'\">'+L('Закрыть спор','Bahsni yopish')+'</button>';\n  }\n  const chips=cfLines(r);\n  return row+(chips||acts?'<div class=\"cfl\">'+chips+acts+'</div>':'');\n}\nconst ACT_P=[['this','Этот месяц','Shu oy'],['prev','Прошлый месяц','Oʻtgan oy'],['all','Всё время','Butun davr']];\n/* Акт сверки: выписка за период уходит магазину сообщением в Telegram, он отвечает «Верно» или «Не так». */\nfunction actPanelHTML(){\n  const d=DB(),dis=d.busy?' disabled':'';\n  return '<div class=\"payb\"><div class=\"pt\">'+L('Акт сверки','Solishtirma dalolatnoma')+'</div>'\n    +'<div class=\"pmute\">'+L('Магазин получит в Telegram выписку: остаток на начало, заказы с товарами, оплаты и итог. Под ней кнопки «Верно» и «Не так». Если он ответит «Не так», долг станет спорным.','Doʻkon Telegramda koʻchirma oladi: boshlangʻich qoldiq, mahsulotli buyurtmalar, toʻlovlar va yakun. Pastda «Toʻgʻri» va «Notoʻgʻri» tugmalari. «Notoʻgʻri» desa, qarz bahsli boʻladi.')+'</div>'\n    +'<div class=\"pyrow\">'+ACT_P.map(p=>'<button type=\"button\" class=\"chip\" data-act=\"dactp\" data-v=\"'+p[0]+'\" aria-pressed=\"'+(d.actp===p[0])+'\"'+dis+'>'+L(p[1],p[2])+'</button>').join('')+'</div>'\n    +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm\" data-act=\"dactgo\"'+dis+'>'+L('Отправить магазину','Doʻkonga yuborish')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"dact\"'+dis+'>'+L('Закрыть','Yopish')+'</button></div></div>';\n}\nfunction debtorHTML(){\n  const d=DB(),x=d.det;\n  const back='<p><button type=\"button\" class=\"btn ghost sm\" data-act=\"dback\">← '+L('К списку должников','Qarzdorlar roʻyxatiga')+'</button></p>';\n  if(!x)return back+'<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  const adv=x.bal<0,dis=d.busy?' disabled':'';\n  let h=back+'<div class=\"dhead\"><h2>'+esc(x.name||('ID '+x.uid))+'</h2><div class=\"pmute\">'+esc([x.org,x.phone].filter(Boolean).join(' · '))+'</div>'+(x.addr?'<div class=\"pmute\">'+esc(x.addr)+'</div>':'')+(S.view==='courier'&&x.phone?'<div class=\"pyrow\" style=\"margin-top:6px\"><a class=\"btn ghost sm\" href=\"'+telHref(x.phone)+'\">'+L('Позвонить','Qoʻngʻiroq')+'</a>'+(x.addr?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(x.addr)+'\">'+L('Копировать адрес','Manzilni nusxalash')+'</button>':'')+'</div>':'')+'</div>'\n    +'<div class=\"stats\"><div class=\"stat'+(x.days?' hot':'')+'\"><small>'+(adv?L('Аванс магазина','Doʻkon avansi'):L('Долг','Qarz'))+'</small><b>'+money(Math.abs(x.bal))+'</b></div>'\n    +'<div class=\"stat\"><small>'+L('Просрочено','Muddati oʻtgan')+'</small><b>'+money(x.over)+'</b></div>'\n    +'<div class=\"stat\"><small>'+L('Ближайший срок','Eng yaqin muddat')+'</small><b>'+(x.due?fDay(x.due):'—')+'</b></div></div>';\n  if(x.fl>0)h+='<div class=\"note warnnote\" style=\"margin-bottom:12px\">'+L('Спорных записей: '+x.fl+'. Магазин ответил «Не так», не получил сообщение или молчит больше суток. Разберитесь с ним и закройте запись с комментарием.','Bahsli yozuvlar: '+x.fl+'. Doʻkon «Notoʻgʻri» dedi, xabarni olmadi yoki bir sutkadan ortiq jim. U bilan hal qiling va yozuvni izoh bilan yoping.')+'</div>';\n  if(x.days)h+='<div class=\"note warnnote\" style=\"margin-bottom:12px\">'+L('Просрочка: ','Kechikish: ')+x.days+L(' дн. Просрочено ',' kun. Muddati oʻtgan ')+money(x.over)+'</div>';\n  h+='<div class=\"payb\"><div class=\"pt\">'+L('Принять оплату','Toʻlovni qabul qilish')+'</div>'\n    +'<div class=\"pmute\">'+L('Можно любую сумму, в том числе часть долга. Оплата закрывает самые старые долги первыми.','Istalgan summa mumkin, qarzning bir qismi ham. Toʻlov eng eski qarzlarni birinchi yopadi.')+'</div>'\n    +'<div class=\"pyrow\"><label for=\"dp-amount\">'+L('Сумма','Summa')+'</label><input type=\"number\" id=\"dp-amount\" inputmode=\"numeric\" min=\"1\" step=\"1\" value=\"'+esc(d.amount)+'\" placeholder=\"0\"'+dis+'>'\n    +(x.bal>0?'<button type=\"button\" class=\"chip\" data-act=\"dfull\">'+L('Весь долг','Butun qarz')+'</button>':'')+'</div>'\n    +(crLimHit()?'<div class=\"note warnnote\">'+L('Лимит наличных достигнут: сдайте деньги продавцу. Наличные пока не принять, карту и перечисление можно.','Naqd limit tugadi: pulni sotuvchiga topshiring. Hozircha naqd olinmaydi, karta va oʻtkazma mumkin.')+'</div>':'')\n    +'<div class=\"pyrow\">'+['cash','card','bank'].map(k=>'<button type=\"button\" class=\"chip\" data-act=\"dpm\" data-v=\"'+k+'\" aria-pressed=\"'+(d.pm===k)+'\">'+esc(payName(k))+'</button>').join('')+'</div>'\n    +'<div class=\"pyrow\"><input type=\"text\" id=\"dp-note\" maxlength=\"80\" value=\"'+esc(d.note)+'\" placeholder=\"'+esc(L('Заметка (необязательно)','Izoh (ixtiyoriy)'))+'\"'+dis+'></div>'\n    +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm\" data-act=\"dpay\"'+dis+'>'+L('Записать оплату','Toʻlovni yozish')+'</button>'\n    +(x.bal>0?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"dremind\"'+dis+'>'+L('Напомнить в Telegram','Telegramda eslatish')+'</button>':'')\n    +(S.view!=='courier'?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"dact\" aria-expanded=\"'+!!d.actOpen+'\"'+dis+'>'+L('Акт сверки','Solishtirma dalolatnoma')+'</button>':'')+'</div></div>'\n    +(S.view!=='courier'&&d.actOpen?actPanelHTML():'');\n  if(x.open&&x.open.length)h+='<h3 class=\"dsub\">'+L('Не оплачено','Toʻlanmagan')+'</h3><div class=\"lbox\">'+x.open.map(q=>lgRowBox('o:'+(q.ref||''),ordOf(q.ref),q.r,'<div class=\"lt\"><b>'+(q.ref?esc(q.ref):L('Прежний долг','Oldingi qarz'))+'</b><small>'+(q.due?(q.due<ymd(shopNow())?L('срок вышел ','muddat oʻtdi ')+fDay(q.due):L('срок ','muddat ')+fDay(q.due)):L('без срока','muddatsiz'))+'</small></div><div class=\"lsum\">'+money(q.r)+'</div>')).join('')+'</div>';\n  const seenG=new Set();\n  x.rows.forEach(r=>{r._res=false;if(cfFlag(r)){const g=r.g||r.n;if(!seenG.has(g)){seenG.add(g);r._res=true}}});\n  h+='<h3 class=\"dsub\">'+L('История расчётов','Hisob-kitoblar tarixi')+'</h3>';\n  h+=x.rows.length?'<div class=\"lbox\">'+x.rows.map(lgRowHTML).join('')+'</div>'+(x.more?'<p class=\"rnote\">'+L('Показаны последние '+x.rows.length+' записей.','Oxirgi '+x.rows.length+' ta yozuv koʻrsatilgan.')+'</p>':''):'<div class=\"empty\">'+L('Записей нет.','Yozuvlar yoʻq.')+'</div>';\n  return h;\n}\nasync function debtOpen(uid){\n  const d=DB();\n  Object.assign(d,{open:uid,det:null,ex:{},amount:'',pm:'cash',note:'',busy:false,vn:0,vwhy:'',rn:0,rnote:'',actOpen:false,actp:'this'});\n  dPaint();window.scrollTo(0,0);\n  const r=await api('GET',dApi()+'/'+uid);\n  if(d.open!==uid)return;\n  if(!r.ok||!r.data||!r.data.debt){d.open=null;dPaint();toast(L('Магазин не найден','Doʻkon topilmadi'));return}\n  d.det=r.data.debt;d.amount=d.det.bal>0?String(d.det.bal):'';\n  dPaint();\n}\nfunction debtClose(){DB().open=null;DB().det=null;dPaint();dLoad()}\nfunction debtSync(){   // перед перерисовкой формы не теряем то, что уже введено\n  const a=$('#dp-amount'),n=$('#dp-note'),w=$('#dx-why'),rn=$('#dx-note');\n  if(a)DB().amount=a.value;\n  if(n)DB().note=n.value;\n  if(w)DB().vwhy=w.value;\n  if(rn)DB().rnote=rn.value;\n}\nasync function debtPay(){\n  const d=DB(),x=d.det;\n  if(!x||d.busy)return;\n  debtSync();\n  const raw=String(d.amount).trim(),amount=Number(raw);\n  if(raw===''||!Number.isInteger(amount)||amount<1){toast(L('Введите сумму целым числом','Summani butun son bilan kiriting'));const el=$('#dp-amount');if(el)el.focus();return}\n  const go=async()=>{\n    d.busy=true;dPaint();\n    const r=await api('POST',dApi()+'/'+x.uid+'/pay',{amount,m:d.pm,note:d.note.trim()});\n    d.busy=false;\n    if(!r.ok||!r.data||!r.data.debt){toast(crLimErr(r)||L('Не удалось записать оплату','Toʻlovni yozib boʻlmadi'));dPaint();if(crLimErr(r))loadCourier();return}\n    d.det=r.data.debt;d.amount=d.det.bal>0?String(d.det.bal):'';d.note='';\n    toast(L('Оплата записана','Toʻlov yozildi'));\n    dPaint();dLoad();\n  };\n  if(amount>x.bal)askConfirm(x.bal>0\n    ?L('Сумма больше долга ('+money(x.bal)+'). Разница запишется как аванс магазина. Продолжить?','Summa qarzdan ('+money(x.bal)+') katta. Farq doʻkon avansi sifatida yoziladi. Davom etasizmi?')\n    :L('Долга нет. Записать оплату как аванс магазина?','Qarz yoʻq. Toʻlov doʻkon avansi sifatida yozilsinmi?'),go);\n  else go();\n}\n/* «Отменить запись» и «Закрыть спор» открывают поле для причины или комментария прямо под записью. */\nfunction debtVoid(n){\n  const d=DB();\n  if(!d.det||d.busy)return;\n  debtSync();\n  d.vn=d.vn===n?0:n;d.rn=0;d.vwhy='';\n  dPaint();\n  const el=$('#dx-why');if(el)el.focus();\n}\nfunction debtRes(n){\n  const d=DB();\n  if(!d.det||d.busy)return;\n  debtSync();\n  d.rn=d.rn===n?0:n;d.vn=0;d.rnote='';\n  dPaint();\n  const el=$('#dx-note');if(el)el.focus();\n}\nasync function debtVoidGo(){\n  const d=DB(),x=d.det;\n  if(!x||d.busy||!d.vn)return;\n  debtSync();\n  const why=d.vwhy.trim();\n  if(why.length<3){toast(L('Напишите причину (от 3 букв)','Sababni yozing (kamida 3 ta harf)'));const el=$('#dx-why');if(el)el.focus();return}\n  d.busy=true;dPaint();\n  const r=await api('POST',dApi()+'/'+x.uid+'/void',{n:d.vn,reason:why});\n  d.busy=false;\n  if(!r.ok||!r.data||!r.data.debt){toast(L('Не удалось отменить запись','Yozuvni bekor qilib boʻlmadi'));dPaint();return}\n  d.det=r.data.debt;d.amount=d.det.bal>0?String(d.det.bal):'';d.vn=0;d.vwhy='';\n  toast(L('Запись отменена. Магазин получил причину.','Yozuv bekor qilindi. Doʻkon sababni oldi.'));\n  dPaint();dLoad();\n}\nasync function debtResGo(){\n  const d=DB(),x=d.det;\n  if(!x||d.busy||!d.rn)return;\n  debtSync();\n  const note=d.rnote.trim();\n  if(note.length<3){toast(L('Напишите комментарий (от 3 букв)','Izoh yozing (kamida 3 ta harf)'));const el=$('#dx-note');if(el)el.focus();return}\n  d.busy=true;dPaint();\n  const r=await api('POST',dApi()+'/'+x.uid+'/resolve',{n:d.rn,note});\n  d.busy=false;\n  if(!r.ok||!r.data||!r.data.debt){toast(r.status===409?L('Эта запись уже закрыта или ещё не спорная','Bu yozuv allaqachon yopilgan yoki hali bahsli emas'):L('Не удалось закрыть запись','Yozuvni yopib boʻlmadi'));dPaint();dLoad();return}\n  d.det=r.data.debt;d.rn=0;d.rnote='';\n  toast(L('Спор закрыт. Магазин получил комментарий.','Bahs yopildi. Doʻkon izohni oldi.'));\n  dPaint();dLoad();\n}\nasync function debtRemind(){\n  const d=DB(),x=d.det;\n  if(!x||d.busy)return;\n  d.busy=true;debtSync();dPaint();\n  const r=await api('POST',dApi()+'/'+x.uid+'/remind',{});\n  d.busy=false;dPaint();\n  toast(r.ok?L('Напоминание отправлено в Telegram','Eslatma Telegramga yuborildi')\n    :r.status===429?L('Недавно уже напоминали. Повторить можно через час.','Yaqinda eslatilgan. Bir soatdan keyin takrorlash mumkin.')\n    :r.status===502?L('Не получилось отправить: возможно, магазин остановил бота.','Yuborib boʻlmadi: doʻkon botni toʻxtatgan boʻlishi mumkin.')\n    :L('Не удалось отправить напоминание','Eslatmani yuborib boʻlmadi'));\n}\nasync function debtActSend(){\n  const d=DB(),x=d.det;\n  if(!x||d.busy||S.view==='courier')return;\n  debtSync();\n  const per=d.actp,pn=ACT_P.find(p=>p[0]===per)||ACT_P[0];\n  askConfirm(L('Отправить магазину акт сверки ('+pn[1].toLowerCase()+')? Он придёт ему сообщением в Telegram.','Doʻkonga solishtirma dalolatnoma ('+pn[2].toLowerCase()+') yuborilsinmi? U Telegramda xabar boʻlib boradi.'),async()=>{\n    d.busy=true;dPaint();\n    const r=await api('POST',dApi()+'/'+x.uid+'/act',{period:per});\n    d.busy=false;\n    if(r.ok&&r.data&&r.data.debt){d.det=r.data.debt;d.actOpen=false;dPaint();dLoad();toast(L('Акт отправлен магазину','Dalolatnoma doʻkonga yuborildi'));return}\n    dPaint();\n    toast(r.status===429?L('Акт уже отправляли недавно. Повторить можно через час.','Dalolatnoma yaqinda yuborilgan. Bir soatdan keyin takrorlash mumkin.')\n      :r.status===404?L('За этот период записей нет','Bu davr uchun yozuvlar yoʻq')\n      :r.status===413?L('Слишком много записей за этот период. Выберите месяц.','Bu davrda yozuvlar juda koʻp. Oyni tanlang.')\n      :r.status===502?L('Не получилось отправить: возможно, магазин остановил бота.','Yuborib boʻlmadi: doʻkon botni toʻxtatgan boʻlishi mumkin.')\n      :L('Не удалось отправить акт','Dalolatnomani yuborib boʻlmadi'));\n  });\n}\n/* ---------- доставщик: заказы на доставку, должники, касса ---------- */\nconst crLimHit=()=>S.view==='courier'&&S.cr.lim>0&&S.cr.cash>=S.cr.lim;\nconst crLimErr=r=>{\n  const e=r&&r.data&&r.data.error;\n  return e==='cash_limit'?L('Сначала сдайте деньги продавцу: на руках '+money(r.data.cash)+', лимит '+money(r.data.lim)+'. Карту и перечисление принять можно.','Avval pulni sotuvchiga topshiring: qoʻlingizda '+money(r.data.cash)+', limit '+money(r.data.lim)+'. Karta va oʻtkazmani qabul qilsa boʻladi.')\n    :e==='cash_late'?L('Сначала сдайте деньги продавцу: просрочка '+r.data.late+' дн. Карту и перечисление принять можно.','Avval pulni sotuvchiga topshiring: '+r.data.late+' kun kechikish. Karta va oʻtkazmani qabul qilsa boʻladi.')\n    :e==='nv_full'?L('Слишком много оплат ждёт сверки. Покажите их продавцу: он отметит «Деньги пришли».','Tekshirilmagan toʻlovlar juda koʻp. Sotuvchiga koʻrsating: u «Pul tushdi» deb belgilaydi.'):'';\n};\n/* Срок сдачи наличных: подпись и тексты про просрочку и вопросы по сдаче. */\nconst dlName=dl=>dl<0?L('без срока','muddatsiz'):dl===0?L('в тот же день','shu kuni'):dl+L(' дн.',' kun');\nconst crLateTxt=c=>L('Деньги не сданы в срок: просрочка '+c.late+' дн.'+(c.cs?' Самые старые деньги на руках с '+jrDate(c.cs)+'.':'')+' Сдайте их продавцу: пока не сдадите, новые заказы и наличные оплаты долга брать нельзя. Карту и перечисление принять можно.',\n  'Pul muddatida topshirilmadi: '+c.late+' kun kechikish.'+(c.cs?' Eng eski pul '+jrDate(c.cs)+' dan beri qoʻlingizda.':'')+' Uni sotuvchiga topshiring: topshirmaguncha yangi buyurtma va qarzning naqd toʻlovini olib boʻlmaydi. Karta va oʻtkazmani qabul qilsa boʻladi.');\nfunction newCour(){return {tab:'today',ok:false,orders:[],soon:0,cash:0,lim:0,dl:0,late:0,ask:0,cs:'',nvn:0,nv:[],rows:[],cashOk:false,dbt:newDebts(),pay:null,busy:''}}\nconst crFree=()=>S.cr.orders.filter(o=>o.status==='ready'&&!o.crn).length;\nconst crTabs=()=>[['today',L('Сегодня','Bugun'),crFree()],['debts',L('Должники','Qarzdorlar'),S.cr.dbt.late,'warn'],['cash',L('Касса','Kassa'),(S.cr.ask||0)+(S.cr.late>0?1:0),'warn']];\nfunction courierOpen(tab){\n  S.cr.tab=tab;S.cr.pay=null;S.cr.dbt.open=null;S.cr.dbt.det=null;\n  if(S.view!=='courier')go('courier');\n  else{paintCrTabs();paintCourier();window.scrollTo(0,0)}\n  if(tab==='debts')loadCrDebts();\n  if(tab==='cash')loadCrCash();\n}\nfunction renderCourier(){\n  if(!S.courier){view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Раздел для доставщика','Yetkazuvchi boʻlimi')+'</b>'+L('Попросите продавца прислать вам ссылку-приглашение.','Sotuvchidan taklif havolasini yuborishni soʻrang.')+'</div></div>';return}\n  view.innerHTML='<div class=\"wrap page\">'+backHTML()+'<div class=\"hrow\" style=\"margin-bottom:10px\"><div><div class=\"eyebrow\">'+L('Доставка','Yetkazib berish')+' · '+esc(S.cfg.shop.name||DEFAULT.shop.name)+'</div><h1 id=\"ctitle\"></h1></div></div><div class=\"filters\" id=\"ctabs\"></div><div id=\"cbody\"></div></div>';\n  paintCrTabs();paintCourier();\n}\nfunction paintCrTabs(){\n  const t=$('#ctitle'),tabs=crTabs();\n  if(t){const x=tabs.find(y=>y[0]===S.cr.tab);t.textContent=x?x[1]:''}\n  const c=$('#ctabs');\n  if(c)c.innerHTML=tabs.map(x=>'<button type=\"button\" class=\"chip\" data-act=\"crtab\" data-v=\"'+x[0]+'\" aria-pressed=\"'+(S.cr.tab===x[0])+'\">'+x[1]+(x[2]?' · '+x[2]:'')+'</button>').join('');\n  renderNav();\n}\nfunction paintCourier(){\n  const b=$('#cbody');if(!b)return;\n  b.innerHTML=S.cr.tab==='today'?crTodayHTML():S.cr.tab==='debts'?debtsHTML():crCashHTML();\n}\nconst loadingHTML=()=>'<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\nfunction crTodayHTML(){\n  const c=S.cr;\n  if(!c.ok)return loadingHTML();\n  const free=c.orders.filter(o=>o.status==='ready'&&!o.crn),mine=c.orders.filter(o=>o.status==='ready'&&o.mine);\n  const other=c.orders.filter(o=>o.status==='ready'&&o.crn&&!o.mine),done=c.orders.filter(o=>o.status==='done');\n  let h='<div class=\"stats\"><div class=\"stat'+(free.length?' hot':'')+'\"><small>'+L('Свободные','Boʻsh')+'</small><b>'+free.length+'</b></div>'\n    +'<div class=\"stat\"><small>'+L('Мои','Meniki')+'</small><b>'+mine.length+'</b></div>'\n    +'<div class=\"stat\"><small>'+L('Доставлено сегодня','Bugun yetkazilgan')+'</small><b>'+done.length+'</b></div>'\n    +'<div class=\"stat\"><small>'+L('Наличные у вас','Sizdagi naqd')+'</small><b>'+money(c.cash)+'</b></div></div>';\n  if(crLimHit())h+='<div class=\"note warnnote\" style=\"margin-bottom:12px\">'+L('Лимит наличных достигнут ('+money(c.lim)+'). Сдайте деньги продавцу: пока не сдадите, новые заказы взять нельзя.','Naqd limiti tugadi ('+money(c.lim)+'). Pulni sotuvchiga topshiring: topshirmaguncha yangi buyurtma olib boʻlmaydi.')+'</div>';\n  if(c.late>0)h+='<div class=\"note warnnote\" style=\"margin-bottom:12px\">'+crLateTxt(c)+'</div>';\n  if(c.ask>0)h+='<div class=\"note warnnote\" style=\"margin-bottom:12px\">'+L('Продавец записал сдачу денег: подтвердите «Верно» или «Не так» ('+c.ask+'). Смотрите вкладку «Касса».','Sotuvchi pul topshirishni yozdi: «Toʻgʻri» yoki «Notoʻgʻri»ni tasdiqlang ('+c.ask+'). «Kassa» boʻlimiga qarang.')+'</div>';\n  if(c.nvn>0)h+='<div class=\"note\" style=\"margin-bottom:12px\">'+L('Оплат картой и переводом ждёт сверки продавцом: '+c.nvn+'. Смотрите вкладку «Касса».','Sotuvchi tekshirishini kutayotgan karta va oʻtkazma toʻlovlari: '+c.nvn+'. «Kassa» boʻlimiga qarang.')+'</div>';\n  if(c.soon)h+='<div class=\"note\" style=\"margin-bottom:12px\">'+L('Собирается заказов: '+c.soon+'. Когда они будут готовы, придёт сообщение в Telegram.','Yigʻilayotgan buyurtmalar: '+c.soon+'. Tayyor boʻlsa, Telegramga xabar keladi.')+'</div>';\n  const sec=(t,list)=>list.length?'<h3 class=\"dsub\">'+t+'</h3><div class=\"ordlist\">'+list.map(o=>orderCard(o,'courier')).join('')+'</div>':'';\n  h+=sec(L('Мои заказы','Mening buyurtmalarim'),mine)+sec(L('Свободные заказы','Boʻsh buyurtmalar'),free)+sec(L('Уже взяли другие','Boshqalar olgan'),other)+sec(L('Доставлено сегодня','Bugun yetkazilgan'),done);\n  if(!mine.length&&!free.length&&!other.length&&!done.length)h+='<div class=\"empty\"><b>'+L('Заказов на доставку пока нет','Yetkazish uchun buyurtma hozircha yoʻq')+'</b>'+L('Когда продавец отметит заказ готовым к отправке, он появится здесь и придёт сообщением в Telegram с кнопкой «Взял».','Sotuvchi buyurtmani joʻnatishga tayyor deb belgilasa, u shu yerda paydo boʻladi va Telegramga «Взял» tugmasi bilan keladi.')+'</div>';\n  return h;\n}\nfunction courierActs(o){\n  if(o.status!=='ready')return '';\n  if(o.mine){\n    if(S.cr.pay&&S.cr.pay.id===o.id)return payBlockHTML(o);\n    return '<button type=\"button\" class=\"btn sm\" data-act=\"crpayopen\" data-id=\"'+esc(o.id)+'\">'+L('Доставлен клиенту','Mijozga yetkazildi')+'</button>'\n      +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"crrelease\" data-id=\"'+esc(o.id)+'\">'+L('Вернуть заказ','Buyurtmani qaytarish')+'</button>';\n  }\n  if(o.crn)return '';\n  return '<button type=\"button\" class=\"btn sm\" data-act=\"crtake\" data-id=\"'+esc(o.id)+'\"'+(S.cr.busy?' disabled':'')+'>🚚 '+L('Взял','Oldim')+'</button>';\n}\n/* Оплата картой или переводом, принятая доставщиком и ещё не сверенная продавцом. cid — у продавца: с кнопкой «Деньги пришли». */\nfunction nvRowHTML(x,cid){\n  const what=x.k==='o'?L('Заказ ','Buyurtma ')+esc(x.o||''):L('Оплата долга','Qarz toʻlovi');\n  return '<div class=\"lrow\"><div class=\"lt\"><b>'+esc(payName(x.m))+' · '+what+(x.nm?' · '+esc(x.nm):'')+'</b><small>'+esc(jrDate(x.t))+'</small></div><div class=\"lsum\">'+money(x.a)+'</div>'\n    +(cid?'<div class=\"cfq\"><button type=\"button\" class=\"btn sm\" data-act=\"dvver\" data-id=\"'+esc(cid)+'\" data-nv=\"'+x.id+'\"'+(S.dv.busy?' disabled':'')+'>'+L('Деньги пришли','Pul tushdi')+'</button></div>':'')+'</div>';\n}\n/* Сдача денег: ответ доставщика. Подписи для продавца (seller) и для самого доставщика. */\nconst hdFlag=r=>!!(r.cf&&r.cf!=='ok'&&r.vwhy===undefined&&!r.rsl&&(r.cf!=='wait'||r.late));\nfunction hdLines(r,seller){\n  if((r.k!=='out'&&r.k!=='ox')||r.vwhy!==undefined)return '';\n  const c=(cls,t)=>'<span class=\"cfc'+(cls?' '+cls:'')+'\">'+t+'</span>';\n  let h='';\n  if(r.rsl)h+=c('ok',L('Спор закрыт: ','Bahs yopildi: ')+esc(r.rsl.bn||'')+' — '+esc(r.rsl.why||''));\n  else if(r.cf==='ok')h+=c('ok','✓ '+(seller?L('Доставщик подтвердил','Yetkazuvchi tasdiqladi'):L('Вы подтвердили','Siz tasdiqladingiz')));\n  else if(r.cf==='wait')h+=r.late?c('bad',seller?L('Доставщик молчит больше суток','Yetkazuvchi bir sutkadan ortiq jim'):L('Ответа нет больше суток','Bir sutkadan ortiq javob yoʻq')):c('warn',seller?L('Ждём ответа доставщика','Yetkazuvchi javobi kutilmoqda'):L('Подтвердите: всё верно?','Tasdiqlang: hammasi toʻgʻrimi?'));\n  else if(r.cf==='no')h+=c('bad',seller?L('Доставщик: «Не так»','Yetkazuvchi: «Notoʻgʻri»'):L('Вы отметили «Не так»','Siz «Notoʻgʻri» deb belgiladingiz'));\n  else if(r.cf==='na')h+=c('bad',seller?L('Доставщик не получил сообщение','Yetkazuvchi xabarni olmadi'):L('Сообщение не дошло: ответьте здесь','Xabar kelmadi: shu yerda javob bering'));\n  return h?'<span class=\"cfs\">'+h+'</span>':'';\n}\nfunction hdVoidForm(){\n  const d=S.dv,dis=d.busy?' disabled':'';\n  return '<div class=\"payb\"><div class=\"pt\">'+L('Отмена записи о сдаче','Topshirish yozuvini bekor qilish')+'</div>'\n    +'<div class=\"pmute\">'+L('Деньги снова будут числиться на руках у доставщика. Он получит сообщение с причиной и подтвердит или оспорит.','Pul yana yetkazuvchi qoʻlida hisoblanadi. U sabab bilan xabar oladi va tasdiqlaydi yoki e’tiroz bildiradi.')+'</div>'\n    +'<div class=\"pyrow\"><input type=\"text\" id=\"dh-why\" maxlength=\"80\" value=\"'+esc(d.why)+'\" placeholder=\"'+esc(L('Причина (обязательно)','Sabab (majburiy)'))+'\"'+dis+'></div>'\n    +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm dangerbtn\" data-act=\"dhvgo\"'+dis+'>'+L('Отменить сдачу','Topshirishni bekor qilish')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"dhvno\">'+L('Не отменять','Bekor qilmaslik')+'</button></div></div>';\n}\nfunction hdResForm(){\n  const d=S.dv,dis=d.busy?' disabled':'';\n  return '<div class=\"payb\"><div class=\"pt\">'+L('Закрыть спорную запись','Bahsli yozuvni yopish')+'</div>'\n    +'<div class=\"pmute\">'+L('Напишите, как вы разобрались с доставщиком. Запись останется в журнале с вашим именем и комментарием.','Yetkazuvchi bilan qanday hal qilganingizni yozing. Yozuv jurnalda ismingiz va izohingiz bilan qoladi.')+'</div>'\n    +'<div class=\"pyrow\"><input type=\"text\" id=\"dh-note\" maxlength=\"120\" value=\"'+esc(d.note)+'\" placeholder=\"'+esc(L('Комментарий (обязательно)','Izoh (majburiy)'))+'\"'+dis+'></div>'\n    +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm\" data-act=\"dhrgo\"'+dis+'>'+L('Закрыть','Yopish')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"dhrno\">'+L('Не сейчас','Hozir emas')+'</button></div></div>';\n}\n/* Кнопки под записью о сдаче: у продавца (cid) отмена и закрытие спора, у самого доставщика ответ «Верно» / «Не так». */\nfunction hdActs(r,cid){\n  if(r.k!=='out'&&r.k!=='ox')return '';\n  if(cid){\n    const d=S.dv;let h='';\n    if(r.k==='out'&&r.vwhy===undefined)h+=d.hv===r.n?hdVoidForm():'<button type=\"button\" class=\"btn ghost sm\" data-act=\"dhvoid\" data-n=\"'+r.n+'\">'+L('Отменить сдачу','Topshirishni bekor qilish')+'</button>';\n    if(hdFlag(r))h+=d.hr===r.n?hdResForm():'<button type=\"button\" class=\"btn ghost sm\" data-act=\"dhres\" data-n=\"'+r.n+'\">'+L('Закрыть спор','Bahsni yopish')+'</button>';\n    return h;\n  }\n  if(r.vwhy!==undefined||r.rsl)return '';\n  const dis=S.cr.busy?' disabled':'';\n  if(r.cf==='wait'||r.cf==='na')return '<span class=\"cfq\"><button type=\"button\" class=\"btn sm\" data-act=\"chans\" data-n=\"'+r.n+'\" data-ok=\"1\"'+dis+'>✅ '+L('Верно','Toʻgʻri')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"chans\" data-n=\"'+r.n+'\" data-ok=\"0\"'+dis+'>❌ '+L('Не так','Notoʻgʻri')+'</button></span>';\n  if(r.cf==='no')return '<span class=\"cfq\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"chans\" data-n=\"'+r.n+'\" data-ok=\"1\"'+dis+'>✅ '+L('Всё-таки верно','Baribir toʻgʻri')+'</button></span>';\n  return '';\n}\nfunction crRowHTML(r,cid){\n  let t,sum,pos=false;\n  if(r.k==='in'){t=r.o?L('Заказ ','Buyurtma ')+esc(r.o)+(r.nm?' · '+esc(r.nm):''):L('Оплата долга: ','Qarz toʻlovi: ')+esc(r.nm||'');sum='+'+money(r.a);pos=true}\n  else if(r.k==='out'){t=L('Сдано продавцу','Sotuvchiga topshirildi');sum='−'+money(r.a)}\n  else if(r.k==='ox'){t=L('Сдача отменена продавцом','Topshirish sotuvchi tomonidan bekor qilindi');sum='+'+money(r.a)}\n  else if(r.k==='nv'){t=L('Принято без наличных: ','Naqdsiz qabul qilindi: ')+esc(payName(r.m))+' · '+(r.o?L('заказ ','buyurtma ')+esc(r.o):esc(r.nm||''));sum=money(r.a)}\n  else if(r.k==='vr'){t=L('Продавец подтвердил поступление: ','Sotuvchi tushganini tasdiqladi: ')+esc(payName(r.m))+' · '+(r.o?esc(r.o):esc(r.nm||''));sum=money(r.a)}\n  else if(r.k==='nx'){t=L('Продавец отменил запись: ','Sotuvchi yozuvni bekor qildi: ')+esc(payName(r.m))+' · '+esc(r.nm||'');sum=money(r.a)}\n  else{t=L('Продавец отменил запись об оплате: ','Sotuvchi toʻlov yozuvini bekor qildi: ')+esc(r.nm||'');sum='−'+money(r.a)}\n  let sub=esc(jrDate(r.t));\n  if((r.k==='out'||r.k==='ox')&&r.bn)sub+=' · '+L('Записал: ','Yozgan: ')+esc(r.bn);\n  if(r.k==='ox'&&r.why)sub+=' · '+L('Причина: ','Sabab: ')+esc(r.why);\n  const gone=r.k==='out'&&r.vwhy!==undefined;\n  if(gone)sub+=' · '+L('отменена: ','bekor qilingan: ')+esc(r.vwhy);\n  const ex=(r.k==='out'||r.k==='ox')?hdLines(r,!!cid)+hdActs(r,cid):'';\n  return '<div class=\"lrow'+(gone?' void':'')+'\"><div class=\"lt\"><b>'+t+'</b><small>'+sub+'</small></div><div class=\"lsum'+(pos?' pos':'')+'\">'+sum+'</div></div>'+(ex?'<div class=\"cfl\">'+ex+'</div>':'');\n}\nfunction crCashHTML(){\n  const c=S.cr;\n  let h='<div class=\"stat hot\" style=\"margin:14px 0\"><small>'+L('На руках сейчас','Hozir qoʻlingizda')+'</small><b>'+money(c.cash)+'</b></div>'\n    +'<p class=\"rnote\">'+L('Это наличные, которые вы приняли от клиентов и должников. Передайте их продавцу: он отметит это у себя, и сумма здесь уменьшится. Карта и перечисление сюда не попадают.','Bu mijozlar va qarzdorlardan olgan naqd pullaringiz. Sotuvchiga topshiring: u oʻzida belgilaydi va bu yerda summa kamayadi. Karta va oʻtkazma bu yerga kirmaydi.')+'</p>';\n  h+='<div class=\"note'+(c.late>0?' warnnote':'')+'\" style=\"margin-bottom:12px\">'+L('Срок сдачи наличных: ','Naqd pulni topshirish muddati: ')+'<b>'+dlName(c.dl)+'</b>'+(c.cash>0&&c.cs?' · '+L('самые старые деньги на руках с ','eng eski pul qoʻlingizda: ')+esc(jrDate(c.cs)):'')+'</div>';\n  if(c.late>0)h+='<div class=\"note warnnote\" style=\"margin-bottom:12px\">'+crLateTxt(c)+'</div>';\n  if(c.ask>0)h+='<div class=\"note warnnote\" style=\"margin-bottom:12px\">'+L('Продавец записал сдачу денег: подтвердите ниже «Верно» или «Не так» ('+c.ask+').','Sotuvchi pul topshirishni yozdi: quyida «Toʻgʻri» yoki «Notoʻgʻri»ni tasdiqlang ('+c.ask+').')+'</div>';\n  if(c.lim>0)h+='<div class=\"note'+(c.cash>=c.lim?' warnnote':'')+'\" style=\"margin-bottom:12px\">'+L('Лимит наличных: ','Naqd limiti: ')+money(c.lim)+(c.cash>=c.lim?L('. Лимит достигнут: пока не сдадите деньги продавцу, новые заказы и наличные оплаты долга брать нельзя.','. Limit tugadi: pulni topshirmaguncha yangi buyurtma va qarzning naqd toʻlovini olib boʻlmaydi.'):'')+'</div>';\n  if(!c.cashOk)return h+loadingHTML();\n  if(c.nv.length)h+='<h3 class=\"dsub\">'+L('Не сверено · ','Tekshirilmagan · ')+c.nv.length+'</h3><p class=\"rnote\">'+L('Оплаты картой и переводом, которые вы приняли. В вашу кассу они не входят: продавец проверит поступление в банке и отметит «Деньги пришли».','Siz qabul qilgan karta va oʻtkazma toʻlovlari. Ular kassangizga kirmaydi: sotuvchi bankda tushganini tekshirib, «Pul tushdi» deb belgilaydi.')+'</p><div class=\"lbox\">'+c.nv.map(x=>nvRowHTML(x)).join('')+'</div>';\n  h+='<h3 class=\"dsub\">'+L('История','Tarix')+'</h3>';\n  h+=c.rows.length?'<div class=\"lbox\">'+c.rows.map(r=>crRowHTML(r)).join('')+'</div>':'<div class=\"empty\">'+L('Записей пока нет.','Yozuvlar hozircha yoʻq.')+'</div>';\n  return h;\n}\nasync function loadCourier(){\n  if(!S.courier||!S.did)return;\n  const r=await api('GET','/api/courier/orders');\n  if(r.status===403){S.courier=null;renderNav();if(S.view==='courier')go('shop');return}   // доступ закрыт продавцом\n  if(!r.ok||!r.data||!Array.isArray(r.data.orders))return;\n  const c=S.cr,same=c.ok&&JSON.stringify([r.data.orders,r.data.soon,r.data.cash,r.data.lim,r.data.nvn,r.data.late,r.data.dl,r.data.ask])===JSON.stringify([c.orders,c.soon,c.cash,c.lim,c.nvn,c.late,c.dl,c.ask]);\n  Object.assign(c,{ok:true,orders:r.data.orders,soon:r.data.soon,cash:r.data.cash,lim:r.data.lim||0,nvn:r.data.nvn||0,late:r.data.late||0,dl:r.data.dl||0,ask:r.data.ask||0});\n  if(S.view==='courier'){loadCrDebts();if(c.tab==='cash')loadCrCash()}\n  if(same||S.view!=='courier'){if(!same)renderNav();return}\n  renderNav();\n  const ae=document.activeElement;\n  if(c.tab==='today'&&!(c.pay&&ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName))){paintCrTabs();paintCourier()}\n}\nasync function loadCrDebts(){\n  if(!S.courier||!S.did)return;\n  const r=await api('GET','/api/courier/debts');\n  if(!r.ok||!r.data||!Array.isArray(r.data.debtors))return;\n  const d=S.cr.dbt,same=d.ok&&JSON.stringify([r.data.debtors,r.data.total,r.data.late,r.data.fl])===JSON.stringify([d.list,d.total,d.late,d.fl]);\n  Object.assign(d,{ok:true,list:r.data.debtors,total:r.data.total,overdue:r.data.overdue,n:r.data.n,late:r.data.late,fl:r.data.fl||0});\n  if(same||S.view!=='courier')return;\n  paintCrTabs();\n  if(S.cr.tab==='debts'&&d.open===null){\n    const ae=document.activeElement;\n    if(!(ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)))paintCourier();\n  }\n}\nasync function loadCrCash(){\n  if(!S.courier||!S.did)return;\n  const r=await api('GET','/api/courier/cash');\n  if(!r.ok||!r.data)return;\n  crApplyCash(r.data);\n  if(S.view==='courier'&&S.cr.tab==='cash')paintCourier();\n}\nfunction crApplyCash(d){\n  Object.assign(S.cr,{cash:d.cash,lim:d.lim||0,dl:d.dl||0,late:d.late||0,cs:d.cs||'',ask:d.ask||0,rows:d.rows||[],nv:d.nv||[],nvn:(d.nv||[]).length,cashOk:true});\n}\n/* Доставщик отвечает на «Продавец записал сдачу»: «Верно» или «Не так». То же, что кнопки в Telegram. */\nasync function crHandAns(n,ok){\n  if(S.cr.busy)return;\n  S.cr.busy='h'+n;paintCourier();\n  const r=await api('POST','/api/courier/confirm',{n,ok});\n  S.cr.busy='';\n  if(r.ok&&r.data&&Array.isArray(r.data.rows)){\n    crApplyCash(r.data);\n    toast(ok?L('Спасибо, подтверждено','Rahmat, tasdiqlandi'):L('Отмечено «Не так». Продавец увидит.','«Notoʻgʻri» deb belgilandi. Sotuvchi koʻradi.'));\n  }else{\n    const e=r.data&&r.data.error;\n    toast(e==='final'?L('Вы уже подтвердили эту запись','Bu yozuvni allaqachon tasdiqlagansiz'):e==='resolved'?L('Продавец уже закрыл этот вопрос. Если не согласны, напишите ему.','Sotuvchi bu masalani yopgan. Rozi boʻlmasangiz, unga yozing.'):e==='void'?L('Эта запись уже отменена продавцом','Bu yozuv sotuvchi tomonidan bekor qilingan'):L('Не удалось отправить ответ. Проверьте соединение.','Javobni yuborib boʻlmadi. Ulanishni tekshiring.'));\n  }\n  paintCrTabs();paintCourier();loadCourier();loadCrCash();\n}\nasync function crTake(id){\n  if(S.cr.busy)return;\n  S.cr.busy=id;paintCourier();\n  const r=await api('POST','/api/courier/take',{id});\n  S.cr.busy='';\n  if(r.ok)toast(L('Заказ ваш. Клиент получил сообщение.','Buyurtma sizniki. Mijozga xabar yuborildi.'));\n  else if(r.data&&r.data.error==='taken'){const n=r.data.order&&r.data.order.crn||'';toast(L('Заказ уже взял '+(n||'другой доставщик'),'Buyurtmani allaqachon '+(n||'boshqa yetkazuvchi')+' oldi'))}\n  else toast(crLimErr(r)||L('Не удалось взять заказ','Buyurtmani olib boʻlmadi'));\n  paintCourier();loadCourier();\n}\nfunction crRelease(id){\n  askConfirm(L('Вернуть заказ? Его снова смогут взять другие доставщики.','Buyurtma qaytarilsinmi? Uni boshqa yetkazuvchilar olishi mumkin.'),async()=>{\n    const r=await api('POST','/api/courier/release',{id});\n    if(!r.ok)toast(L('Не удалось вернуть заказ','Buyurtmani qaytarib boʻlmadi'));\n    S.cr.pay=null;loadCourier();\n  });\n}\nasync function crDone(id,pay){\n  if(S.cr.busy)return;\n  S.cr.busy=id;paintCourier();\n  const r=await api('POST','/api/courier/done',{id,pay});\n  S.cr.busy='';\n  if(!r.ok||!r.data||!r.data.order){\n    const er=r.data&&r.data.error;\n    toast(er==='no_credit'?L('Выдавать в долг вам не разрешено. Позвоните продавцу.','Qarzga berishga ruxsat yoʻq. Sotuvchiga qoʻngʻiroq qiling.')\n      :er==='not_yours'?L('Этот заказ не ваш','Bu buyurtma sizniki emas'):L('Не удалось записать выдачу. Проверьте соединение.','Topshirishni yozib boʻlmadi. Ulanishni tekshiring.'));\n    paintCourier();loadCourier();return;\n  }\n  S.cr.pay=null;S.cr.cash=r.data.cash;\n  toast(L('Выдача записана','Topshirish yozildi'));\n  paintCrTabs();paintCourier();loadCourier();\n}\n\n/* ---------- продавец: доставщики ---------- */\nfunction newDv(){return {ok:false,list:[],name:'',phone:'',busy:false,open:null,mode:'',det:null,amount:'',hv:0,hr:0,why:'',note:''}}\nasync function loadCouriers(){\n  if(!S.admin||!S.did)return;\n  const r=await api('GET','/api/admin/couriers');\n  if(!r.ok||!r.data||!Array.isArray(r.data.couriers))return;\n  const d=S.dv,same=d.ok&&JSON.stringify(r.data.couriers)===JSON.stringify(d.list),was=dvAlerts();\n  d.ok=true;d.list=r.data.couriers;\n  if(dvAlerts()!==was){renderNav();if(S.view==='seller')paintTabs()}\n  if(same||S.view!=='seller'||S.sellerTab!=='dlv')return;\n  const ae=document.activeElement;\n  if(!(ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)))paintSeller();\n}\n/* Сколько доставщиков требуют внимания: просрочили сдачу или есть сдачи без ответа или спорные. */\nconst dvAlerts=()=>S.dv.list.filter(c=>c.late>0||c.hf>0).length;\nfunction dvState(c){return !c.joined?['wait',L('Ждёт входа по ссылке','Havola orqali kirishni kutmoqda')]:c.on?['ok',L('Работает','Ishlayapti')]:['off',L('Отключён','Oʻchirilgan')]}\nfunction couriersHTML(){\n  const d=S.dv;\n  let h='<p class=\"lead\">'+L('Доставщики возят заказы с доставкой и принимают наличные. Когда вы отметите заказ «Готов к отправке», он придёт всем доставщикам в Telegram с кнопкой «Взял», и первый нажавший его возьмёт. Добавьте человека и отправьте ему ссылку: нажав её, он станет вашим доставщиком.','Yetkazuvchilar yetkazib berish buyurtmalarini olib boradi va naqd pul qabul qiladi. Buyurtmani «Joʻnatishga tayyor» deb belgilasangiz, u hamma yetkazuvchilarga Telegramda «Взял» tugmasi bilan boradi, birinchi bosgan oladi. Odamni qoʻshing va unga havola yuboring: uni bosib, u yetkazuvchingiz boʻladi.')+'</p>';\n  h+='<div class=\"payb\"><div class=\"pt\">'+L('Добавить доставщика','Yetkazuvchi qoʻshish')+'</div>'\n    +'<div class=\"pyrow\"><input type=\"text\" id=\"dv-name\" maxlength=\"40\" value=\"'+esc(d.name)+'\" placeholder=\"'+esc(L('Имя','Ism'))+'\"><input type=\"tel\" id=\"dv-phone\" maxlength=\"25\" value=\"'+esc(d.phone)+'\" placeholder=\"'+esc(L('Телефон (необязательно)','Telefon (ixtiyoriy)'))+'\"></div>'\n    +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm\" data-act=\"dvadd\"'+(d.busy?' disabled':'')+'>'+L('Получить ссылку','Havolani olish')+'</button></div></div>';\n  if(!d.ok)return h+loadingHTML();\n  if(!d.list.length)return h+'<div class=\"empty\"><b>'+L('Доставщиков пока нет','Yetkazuvchilar hozircha yoʻq')+'</b>'+L('Если возите заказы сами, этот раздел не нужен.','Buyurtmalarni oʻzingiz olib borsangiz, bu boʻlim kerak emas.')+'</div>';\n  const total=d.list.reduce((t,c)=>t+(c.cash||0),0);\n  if(total>0)h+='<div class=\"note warnnote\" style=\"margin-top:12px\">'+L('Наличные у доставщиков: ','Yetkazuvchilardagi naqd pul: ')+money(total)+'</div>';\n  const lateN=d.list.filter(c=>c.late>0).length;\n  if(lateN>0)h+='<div class=\"note warnnote\" style=\"margin-top:12px\">'+L('Не сдали деньги в срок: '+lateN+'. Они выделены ниже.','Pulni muddatida topshirmaganlar: '+lateN+'. Ular quyida belgilangan.')+'</div>';\n  return h+'<div class=\"dlist\" style=\"margin-top:12px\">'+d.list.map(dvCardHTML).join('')+'</div>';\n}\nfunction dvCardHTML(c){\n  const d=S.dv,st=dvState(c),open=d.open===c.id,dis=d.busy?' disabled':'';\n  const btn=(act,label,cls,extra)=>'<button type=\"button\" class=\"btn ghost sm'+(cls?' '+cls:'')+'\" data-act=\"'+act+'\" data-id=\"'+esc(c.id)+'\"'+(extra||'')+dis+'>'+label+'</button>';\n  let h='<div class=\"dvc\"><div class=\"dvh\"><div class=\"dn\"><b>'+esc(c.name)+'</b><small>'+esc(c.phone||L('телефон не указан','telefon koʻrsatilmagan'))+'</small></div><span class=\"dvs '+st[0]+'\">'+st[1]+'</span></div>'\n    +'<div class=\"dvcash\">'+L('Наличные на руках: ','Qoʻldagi naqd pul: ')+'<b>'+money(c.cash)+'</b>'+(c.lim>0?' · '+L('лимит ','limit ')+money(c.lim)+(c.cash>=c.lim?' · <b class=\"bad\">'+L('достигнут','yetdi')+'</b>':''):'')+'</div>'\n    +'<div class=\"dvcash\">'+L('Срок сдачи: ','Topshirish muddati: ')+'<b>'+dlName(c.dl)+'</b>'+(c.cash>0&&c.cs?' · '+L('самые старые деньги с ','eng eski pul ')+esc(jrDate(c.cs)):'')+(c.late>0?' · <b class=\"bad\">'+L('просрочка '+c.late+' дн.','kechikish '+c.late+' kun')+'</b>':'')+'</div>'\n    +(c.late>0?'<div class=\"note warnnote\">'+L('Доставщик не сдал деньги в срок. Новые заказы и наличные оплаты долга ему закрыты, пока не сдаст. Безналичные оплаты принимать может.','Yetkazuvchi pulni muddatida topshirmadi. Topshirmaguncha unga yangi buyurtma va qarzning naqd toʻlovi yopiq. Naqdsiz toʻlovlarni qabul qila oladi.')+'</div>':'')\n    +(c.hf>0?'<div class=\"note warnnote\">'+L('Сдач без подтверждения: '+c.hf+'. Доставщик ответил «Не так», не получил сообщение или молчит больше суток. Откройте «История» и закройте вопрос с комментарием.','Tasdiqlanmagan topshirishlar: '+c.hf+'. Yetkazuvchi «Notoʻgʻri» dedi, xabarni olmadi yoki bir sutkadan ortiq jim. «Tarix»ni oching va savolni izoh bilan yoping.')+'</div>':'')\n    +(c.hw>0?'<div class=\"dvcash\">'+L('Ждём ответа доставщика на сдачу: ','Yetkazuvchining topshirishga javobi kutilmoqda: ')+'<b>'+c.hw+'</b></div>':'')\n    +(c.nvn>0?'<div class=\"dvcash\">'+L('Не сверено (карта, перечисление): ','Tekshirilmagan (karta, oʻtkazma): ')+'<b>'+c.nvn+' · '+money(c.nva)+'</b></div>':'');\n  if(c.link){\n    const msg=L('Ссылка для входа доставщиком. Нажмите её и откройте бота.','Yetkazuvchi sifatida kirish havolasi. Uni bosing va botni oching.');\n    h+='<div class=\"note\" style=\"word-break:break-all\">'+L('Ссылка для входа (действует 7 дней, нажать можно один раз): ','Kirish havolasi (7 kun amal qiladi, bir marta bosiladi): ')+'<b>'+esc(c.link)+'</b></div>'\n      +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm\" data-act=\"copy\" data-v=\"'+esc(c.link)+'\">'+L('Копировать ссылку','Havolani nusxalash')+'</button>'\n      +'<a class=\"btn ghost sm\" data-act=\"contact\" href=\"https://t.me/share/url?url='+encodeURIComponent(c.link)+'&amp;text='+encodeURIComponent(msg)+'\" target=\"_blank\" rel=\"noopener\">'+L('Отправить в Telegram','Telegramga yuborish')+'</a></div>';\n  }\n  h+='<div class=\"pyrow\">'\n    +(c.cash>0?btn('dvhand',L('Принял деньги','Pulni qabul qildim'),'',open&&d.mode==='hand'?' aria-pressed=\"true\"':''):'')\n    +(c.nvn>0?btn('dvnv',L('Не сверено · ','Tekshirilmagan · ')+c.nvn,'',open&&d.mode==='nv'?' aria-pressed=\"true\"':''):'')\n    +(c.joined?btn('dvlim',L('Лимит наличных','Naqd limiti'),'',open&&d.mode==='lim'?' aria-pressed=\"true\"':''):'')\n    +btn('dvdl',L('Срок сдачи','Topshirish muddati'),'',open&&d.mode==='dl'?' aria-pressed=\"true\"':'')\n    +btn('dvhist',L('История','Tarix'))\n    +(c.joined?btn('dvflag',c.credit?L('Долг: разрешён','Qarz: ruxsat'):L('Долг: запрещён','Qarz: taqiqlangan'),'',' data-k=\"credit\"'):'')\n    +(c.joined?btn('dvflag',c.on?L('Отключить','Oʻchirish'):L('Включить','Yoqish'),'',' data-k=\"on\"'):'')\n    +btn('dvlink',c.joined?L('Новая ссылка','Yangi havola'):L('Обновить ссылку','Havolani yangilash'))\n    +btn('dvdel',L('Удалить','Oʻchirish'),'dangerbtn')+'</div>';\n  if(open&&d.mode==='hand'){\n    h+='<div class=\"payb\"><div class=\"pt\">'+L('Доставщик сдал вам наличные','Yetkazuvchi sizga naqd pul topshirdi')+'</div>'\n      +'<div class=\"pyrow\"><label for=\"dv-amount\">'+L('Сумма','Summa')+'</label><input type=\"number\" id=\"dv-amount\" inputmode=\"numeric\" min=\"1\" step=\"1\" value=\"'+esc(d.amount)+'\" placeholder=\"0\"'+dis+'><button type=\"button\" class=\"chip\" data-act=\"dvall\">'+L('Всё','Hammasi')+'</button></div>'\n      +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm\" data-act=\"dvgo\"'+dis+'>'+L('Записать','Yozish')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"dvclose\">'+L('Закрыть','Yopish')+'</button></div></div>';\n  }\n  if(open&&d.mode==='nv'){\n    h+='<h3 class=\"dsub\">'+L('Не сверено','Tekshirilmagan')+'</h3><p class=\"rnote\">'+L('Проверьте в банке, что деньги пришли, и нажмите «Деньги пришли». Пока вы не отметили, оплата числится за доставщиком.','Bankda pul tushganini tekshiring va «Pul tushdi»ni bosing. Belgilamaguncha toʻlov yetkazuvchi hisobida turadi.')+'</p>';\n    h+=!d.det?loadingHTML():d.det.nv&&d.det.nv.length?'<div class=\"lbox\">'+d.det.nv.map(x=>nvRowHTML(x,c.id)).join('')+'</div>':'<div class=\"empty\">'+L('Всё сверено.','Hammasi tekshirilgan.')+'</div>';\n    h+='<div class=\"pyrow\" style=\"margin-top:8px\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"dvclose\">'+L('Закрыть','Yopish')+'</button></div>';\n  }\n  if(open&&d.mode==='lim'){\n    h+='<div class=\"payb\"><div class=\"pt\">'+L('Лимит наличных','Naqd limiti')+'</div>'\n      +'<div class=\"pmute\">'+L('Если у доставщика на руках столько наличных или больше, он не может взять новый заказ и принять наличные оплаты долга, пока не сдаст деньги вам. Ноль — без лимита.','Yetkazuvchining qoʻlida shuncha yoki undan koʻp naqd pul boʻlsa, pulni sizga topshirmaguncha yangi buyurtma ola olmaydi va qarzning naqd toʻlovini qabul qila olmaydi. Nol — limitsiz.')+'</div>'\n      +'<div class=\"pyrow\"><label for=\"dv-lim\">'+L('Сумма','Summa')+'</label><input type=\"number\" id=\"dv-lim\" inputmode=\"numeric\" min=\"0\" step=\"1\" value=\"'+esc(d.amount)+'\" placeholder=\"0\"'+dis+'><button type=\"button\" class=\"chip\" data-act=\"dvlimoff\">'+L('Без лимита','Limitsiz')+'</button></div>'\n      +'<div class=\"pyrow\"><button type=\"button\" class=\"btn sm\" data-act=\"dvlimgo\"'+dis+'>'+L('Сохранить','Saqlash')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"dvclose\">'+L('Закрыть','Yopish')+'</button></div></div>';\n  }\n  if(open&&d.mode==='dl'){\n    const opts=[[0,L('В тот же день','Shu kuni')],[1,L('1 день','1 kun')],[3,L('3 дня','3 kun')],[-1,L('Без срока','Muddatsiz')]];\n    if(!opts.some(x=>x[0]===c.dl))opts.splice(1,0,[c.dl,dlName(c.dl)]);\n    h+='<div class=\"payb\"><div class=\"pt\">'+L('Срок сдачи наличных','Naqd pulni topshirish muddati')+'</div>'\n      +'<div class=\"pmute\">'+L('Сколько доставщик может держать наличные, не сдав их вам. Если срок прошёл, он не может взять новый заказ и принять наличные оплаты долга, пока не сдаст деньги. Безналичные оплаты принимать может.','Yetkazuvchi naqd pulni sizga topshirmay qancha ushlab turishi mumkin. Muddat oʻtsa, u pulni topshirmaguncha yangi buyurtma ola olmaydi va qarzning naqd toʻlovini qabul qila olmaydi. Naqdsiz toʻlovlarni qabul qila oladi.')+'</div>'\n      +'<div class=\"pyrow\">'+opts.map(x=>'<button type=\"button\" class=\"chip\" data-act=\"dvdlgo\" data-v=\"'+x[0]+'\" aria-pressed=\"'+(c.dl===x[0])+'\"'+dis+'>'+x[1]+'</button>').join('')+'</div>'\n      +'<div class=\"pyrow\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"dvclose\">'+L('Закрыть','Yopish')+'</button></div></div>';\n  }\n  if(open&&d.mode==='hist'){\n    h+='<h3 class=\"dsub\">'+L('Касса доставщика','Yetkazuvchi kassasi')+'</h3>';\n    h+=!d.det?loadingHTML():d.det.rows.length?'<div class=\"lbox\">'+d.det.rows.map(r=>crRowHTML(r,c.id)).join('')+'</div>':'<div class=\"empty\">'+L('Записей пока нет.','Yozuvlar hozircha yoʻq.')+'</div>';\n    h+='<div class=\"pyrow\" style=\"margin-top:8px\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"dvclose\">'+L('Закрыть','Yopish')+'</button></div>';\n  }\n  return h+'</div>';\n}\nconst dvErr=er=>({bad_dl:L('Срок — от 0 до 30 дней или «без срока»','Muddat — 0 dan 30 kungacha yoki «muddatsiz»'),has_hq:L('У доставщика есть сдачи без ответа или спорные. Сначала закройте их.','Yetkazuvchida javobsiz yoki bahsli topshirishlar bor. Avval ularni yoping.'),bad_reason:L('Напишите причину (от 3 букв)','Sababni yozing (kamida 3 ta harf)'),bad_note:L('Напишите комментарий (от 3 букв)','Izoh yozing (kamida 3 ta harf)'),already:L('Эта запись уже обработана','Bu yozuv allaqachon qayta ishlangan'),not_flagged:L('Эта запись ещё не спорная','Bu yozuv hali bahsli emas'),has_nv:L('У доставщика есть неподтверждённые оплаты картой или переводом. Сначала сверьте их.','Yetkazuvchida tasdiqlanmagan karta yoki oʻtkazma toʻlovlari bor. Avval ularni tekshiring.'),bad_lim:L('Лимит — целое число сум, 0 — без лимита','Limit — butun son, 0 — limitsiz'),bad_name:L('Введите имя (от 2 букв)','Ismni kiriting (kamida 2 harf)'),bad_phone:L('Проверьте номер телефона','Telefon raqamini tekshiring'),too_many:L('Слишком много доставщиков','Yetkazuvchilar juda koʻp'),has_cash:L('У доставщика есть наличные. Сначала отметьте, что он их сдал.','Yetkazuvchida naqd pul bor. Avval uni topshirganini belgilang.'),bad_amount:L('Сумма больше, чем у доставщика на руках','Summa yetkazuvchi qoʻlidagidan katta')}[er]||L('Не получилось. Проверьте соединение.','Muvaffaqiyatsiz. Ulanishni tekshiring.'));\nasync function dvAdd(){\n  const d=S.dv;if(d.busy)return;\n  const n=$('#dv-name'),p=$('#dv-phone');\n  if(n)d.name=n.value;if(p)d.phone=p.value;\n  if(d.name.trim().length<2){toast(dvErr('bad_name'));if(n)n.focus();return}\n  d.busy=true;paintSeller();\n  const r=await api('POST','/api/admin/couriers',{name:d.name.trim(),phone:d.phone.trim()});\n  d.busy=false;\n  if(!r.ok||!r.data||!r.data.courier){toast(dvErr(r.data&&r.data.error));paintSeller();return}\n  d.name='';d.phone='';\n  toast(L('Готово. Отправьте доставщику ссылку.','Tayyor. Yetkazuvchiga havolani yuboring.'));\n  await loadCouriers();paintSeller();\n}\nasync function dvOpen(id,mode){\n  const d=S.dv;\n  if(d.open===id&&d.mode===mode){d.open=null;d.det=null;paintSeller();return}\n  const c=d.list.find(x=>x.id===id);\n  Object.assign(d,{open:id,mode,det:null,hv:0,hr:0,why:'',note:'',amount:mode==='hand'&&c?String(c.cash):mode==='lim'&&c&&c.lim?String(c.lim):''});\n  paintSeller();\n  const r=await api('GET','/api/admin/couriers/'+id);\n  if(d.open!==id)return;\n  if(r.ok&&r.data&&r.data.courier)d.det=r.data;\n  paintSeller();\n}\nasync function dvVerify(id,nv){\n  const d=S.dv;if(d.busy)return;\n  d.busy=true;paintSeller();\n  const r=await api('POST','/api/admin/couriers/'+id+'/verify',{id:nv});\n  d.busy=false;\n  if(!r.ok||!r.data||!r.data.courier){toast(r.status===404?L('Эта оплата уже сверена','Bu toʻlov allaqachon tekshirilgan'):dvErr(r.data&&r.data.error));await loadCouriers();paintSeller();return}\n  d.det=r.data;\n  toast(L('Отмечено: деньги пришли','Belgilandi: pul tushdi'));\n  await loadCouriers();paintSeller();\n}\nasync function dvSetDl(v){\n  const d=S.dv,c=d.list.find(x=>x.id===d.open);\n  if(!c||d.busy||!Number.isInteger(v))return;\n  d.busy=true;paintSeller();\n  const r=await api('PUT','/api/admin/couriers/'+c.id,{dl:v});\n  d.busy=false;\n  if(!r.ok||!r.data||!r.data.courier){toast(dvErr(r.data&&r.data.error));paintSeller();return}\n  d.open=null;d.det=null;\n  toast(L('Срок сдачи: '+dlName(v),'Topshirish muddati: '+dlName(v)));\n  await loadCouriers();paintSeller();\n}\nfunction dvHSync(){const w=$('#dh-why'),n=$('#dh-note');if(w)S.dv.why=w.value;if(n)S.dv.note=n.value}\nfunction dvHVoid(n){\n  const d=S.dv;if(d.busy)return;\n  dvHSync();d.hv=d.hv===n?0:n;d.hr=0;d.why='';paintSeller();\n  const el=$('#dh-why');if(el)el.focus();\n}\nfunction dvHRes(n){\n  const d=S.dv;if(d.busy)return;\n  dvHSync();d.hr=d.hr===n?0:n;d.hv=0;d.note='';paintSeller();\n  const el=$('#dh-note');if(el)el.focus();\n}\n/* Отмена записи о сдаче и закрытие спора по сдаче: обе с обязательным текстом. */\nasync function dvHGo(kind){\n  const d=S.dv,id=d.open,n=kind==='void'?d.hv:d.hr;\n  if(!id||!n||d.busy)return;\n  dvHSync();\n  const txt=(kind==='void'?d.why:d.note).trim();\n  if(txt.length<3){toast(dvErr(kind==='void'?'bad_reason':'bad_note'));const el=$(kind==='void'?'#dh-why':'#dh-note');if(el)el.focus();return}\n  d.busy=true;paintSeller();\n  const r=await api('POST','/api/admin/couriers/'+id+(kind==='void'?'/hvoid':'/hresolve'),kind==='void'?{n,reason:txt}:{n,note:txt});\n  d.busy=false;\n  if(!r.ok||!r.data||!r.data.courier){toast(dvErr(r.data&&r.data.error));paintSeller();await loadCouriers();return}\n  d.det=r.data;d.hv=0;d.hr=0;d.why='';d.note='';\n  toast(kind==='void'?L('Сдача отменена. Доставщик получил причину.','Topshirish bekor qilindi. Yetkazuvchi sababni oldi.'):L('Спор закрыт. Доставщик получил комментарий.','Bahs yopildi. Yetkazuvchi izohni oldi.'));\n  await loadCouriers();paintSeller();\n}\nasync function dvSetLim(v){\n  const d=S.dv,c=d.list.find(x=>x.id===d.open);\n  if(!c||d.busy)return;\n  const el=$('#dv-lim');\n  const raw=v===undefined?String(el?el.value:d.amount).trim():String(v),lim=raw===''?0:Number(raw);\n  if(!Number.isInteger(lim)||lim<0){toast(dvErr('bad_lim'));if(el)el.focus();return}\n  d.busy=true;paintSeller();\n  const r=await api('PUT','/api/admin/couriers/'+c.id,{lim});\n  d.busy=false;\n  if(!r.ok||!r.data||!r.data.courier){toast(dvErr(r.data&&r.data.error));paintSeller();return}\n  d.open=null;d.det=null;\n  toast(lim>0?L('Лимит наличных: '+money(lim),'Naqd limiti: '+money(lim)):L('Лимит снят','Limit olib tashlandi'));\n  await loadCouriers();paintSeller();\n}\nasync function dvHand(){\n  const d=S.dv,c=d.list.find(x=>x.id===d.open);\n  if(!c||d.busy)return;\n  const el=$('#dv-amount');if(el)d.amount=el.value;\n  const raw=String(d.amount).trim(),amount=Number(raw);\n  if(raw===''||!Number.isInteger(amount)||amount<1){toast(L('Введите сумму целым числом','Summani butun son bilan kiriting'));if(el)el.focus();return}\n  if(amount>c.cash){toast(dvErr('bad_amount'));return}\n  d.busy=true;paintSeller();\n  const r=await api('POST','/api/admin/couriers/'+c.id+'/handover',{amount});\n  d.busy=false;\n  if(!r.ok||!r.data||!r.data.courier){toast(dvErr(r.data&&r.data.error));paintSeller();return}\n  d.open=null;d.det=null;\n  toast(L('Записано: сдано '+money(amount),'Yozildi: topshirildi '+money(amount)));\n  await loadCouriers();paintSeller();\n}\nfunction dvLink(id){\n  askConfirm(L('Выдать новую ссылку? Прежняя перестанет работать. Тот, кто войдёт по новой, станет этим доставщиком, а прежний аккаунт потеряет доступ.','Yangi havola berilsinmi? Eskisi ishlamay qoladi. Yangisi orqali kirgan odam shu yetkazuvchi boʻladi, oldingi akkaunt kirishni yoʻqotadi.'),async()=>{\n    const r=await api('POST','/api/admin/couriers/'+id+'/link',{});\n    if(!r.ok)toast(dvErr(r.data&&r.data.error));\n    await loadCouriers();paintSeller();\n  });\n}\nasync function dvFlag(id,k){\n  const c=S.dv.list.find(x=>x.id===id);if(!c)return;\n  const r=await api('PUT','/api/admin/couriers/'+id,k==='credit'?{credit:!c.credit}:{on:!c.on});\n  if(!r.ok)toast(dvErr(r.data&&r.data.error));\n  await loadCouriers();paintSeller();\n}\nfunction dvDel(id){\n  const c=S.dv.list.find(x=>x.id===id);if(!c)return;\n  askConfirm(L('Удалить доставщика «'+c.name+'»? Заказы, которые он вёз, снова станут свободными.','«'+c.name+'» yetkazuvchisi oʻchirilsinmi? U olib ketayotgan buyurtmalar yana boʻsh boʻladi.'),async()=>{\n    const r=await api('DELETE','/api/admin/couriers/'+id);\n    if(!r.ok)toast(dvErr(r.data&&r.data.error));\n    if(S.dv.open===id){S.dv.open=null;S.dv.det=null}\n    await loadCouriers();paintSeller();\n  });\n}\n\n/* ---------- сборочный лист и выгрузки ---------- */\nconst XLAB={orders:['Заказы в Excel','Buyurtmalar Excelda'],clients:['Клиенты в Excel','Mijozlar Excelda'],backup:['Получить резервную копию','Zaxira nusxasini olish'],pick:['Файлом в чат','Chatga fayl sifatida'],catalog:['Каталог в Excel','Katalog Excelda'],report:['Отчёт в Excel','Hisobot Excelda'],debts:['Долги в Excel','Qarzlar Excelda']};\nconst xlab=k=>S.xbusy===k?L('Отправляем…','Yuborilmoqda…'):L(XLAB[k][0],XLAB[k][1]);\nconst xbtn=(k,cls,act)=>'<button type=\"button\" class=\"btn ghost sm'+(cls?' '+cls:'')+'\" data-act=\"'+(act||(k==='pick'?'xpick':'xport'))+'\" data-k=\"'+k+'\" data-xk=\"'+k+'\"'+(S.xbusy?' disabled':'')+'>'+xlab(k)+'</button>';\nfunction xtoolsHTML(){\n  const work=S.allOrders.filter(o=>o.status==='new'||o.status==='accepted');\n  const d=shopNow(),today=ymd(d);d.setDate(d.getDate()+1);\n  const tom=ymd(d);\n  const chip=(lab,day)=>{const n=day?work.filter(o=>String(o.pickupAt).slice(0,10)===day).length:work.length;return '<button type=\"button\" class=\"chip\" data-act=\"pick\" data-day=\"'+day+'\"'+(n&&!S.pickBusy?'':' disabled')+'>'+lab+' · '+n+'</button>'};\n  return '<div class=\"xtools\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmenu\" aria-expanded=\"'+(S.pm?'true':'false')+'\">'+L('Сборочный лист','Yigʻish roʻyxati')+(S.pm?' ▴':' ▾')+'</button>'+xbtn('orders')\n    +(S.pm?'<div class=\"xmenu\">'+chip(L('Все','Hammasi'),'')+chip(L('Сегодня','Bugun'),today)+chip(L('Завтра','Ertaga'),tom)+'</div><div class=\"unit\">'+L('Что достать со склада: общий список и страница на каждый заказ. Берутся новые заказы и заказы в работе. Один заказ можно открыть кнопкой в его карточке.','Ombordan nimalarni olish kerak: umumiy roʻyxat va har bir buyurtma uchun alohida sahifa. Yangi va ishdagi buyurtmalar olinadi. Bitta buyurtmani uning kartochkasidagi tugma bilan ochish mumkin.')+'</div>':'')\n    +'</div>';\n}\nfunction paintX(){\n  document.querySelectorAll('[data-xk]').forEach(b=>{b.disabled=!!S.xbusy;b.textContent=xlab(b.dataset.xk)});\n}\nconst xErrText=(er,kind)=>er==='empty'&&kind==='debts'?L('Под этот фильтр долгов нет','Bu filtrga qarz topilmadi'):({\n  empty:L('Нет заказов для сборки','Yigʻish uchun buyurtma yoʻq'),\n  busy:L('Файл уже готовится. Подождите несколько секунд.','Fayl tayyorlanmoqda. Bir necha soniya kuting.'),\n  send_failed:L('Telegram не принял файл. Откройте чат с ботом, нажмите «Старт» и повторите.','Telegram faylni qabul qilmadi. Bot chatini oching, «Start» tugmasini bosing va qayta urining.')\n}[er]||L('Не удалось подготовить файл. Проверьте соединение и повторите.','Faylni tayyorlab boʻlmadi. Ulanishni tekshiring va qayta urining.'));\n/* Файл уходит в чат продавца с ботом: в Telegram он открывается и сохраняется на любом устройстве. */\nasync function doExport(kind,extra,did){\n  if(S.xbusy||(!did&&!S.admin))return;\n  S.xbusy=kind;paintX();\n  const r=await api('POST','/api/admin/export',Object.assign({kind,lang:LANG},extra||{}),did);\n  S.xbusy='';paintX();\n  if(r.ok&&r.data&&r.data.ok){toast(L('Файл отправлен вам в чат с ботом. Закройте приложение, чтобы его увидеть.','Fayl botdagi chatingizga yuborildi. Koʻrish uchun ilovani yoping.'));return}\n  toast(xErrText(r.data&&r.data.error,kind));\n}\nasync function openPick(body){\n  if(S.pickBusy||!S.admin)return;\n  S.pickBusy=true;\n  const r=await api('POST','/api/admin/pick',body);\n  S.pickBusy=false;\n  if(!r.ok||!r.data||!r.data.html){toast(xErrText(r.data&&r.data.error));return}\n  S.pick={body,n:r.data.n};\n  let ov=document.getElementById('pov');\n  if(!ov){ov=document.createElement('div');ov.id='pov';ov.className='pov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');document.body.appendChild(ov)}\n  ov.setAttribute('aria-label',L('Сборочный лист','Yigʻish roʻyxati')+', '+r.data.n);\n  const canPrint=!(S.tg&&/^(android|ios)$/.test(S.tg.platform||''));\n  ov.innerHTML='<div class=\"pbar\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pclose\">← '+L('Назад','Orqaga')+'</button><span class=\"grow\"></span>'\n    +(canPrint?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"pprint\">'+L('Печать','Chop etish')+'</button>':'')+xbtn('pick')+'</div>'\n    +'<iframe class=\"pframe\" id=\"pframe\" title=\"'+esc(L('Сборочный лист','Yigʻish roʻyxati'))+'\" sandbox=\"allow-same-origin allow-modals\"></iframe>';\n  $('#pframe').srcdoc=r.data.html;\n  ov.hidden=false;\n  const cb=ov.querySelector('[data-act=\"pclose\"]');if(cb)cb.focus();\n}\nfunction closePick(){\n  const ov=document.getElementById('pov');\n  if(ov){ov.hidden=true;ov.innerHTML=''}\n  S.pick=null;\n}\nfunction printPick(){\n  const f=$('#pframe');\n  try{f.contentWindow.focus();f.contentWindow.print()}\n  catch(e){toast(L('Печать здесь недоступна. Нажмите «Файлом в чат» и распечатайте файл из браузера.','Bu yerda chop etib boʻlmaydi. «Chatga fayl sifatida» tugmasini bosib, faylni brauzerdan chop eting.'))}\n}\ndocument.addEventListener('keydown',e=>{\n  if(e.key!=='Escape')return;\n  if(document.getElementById('mapsheet'))closeMapSheet();\n  else if(S.pick)closePick();\n  else if(S.view==='review'&&(S.rv.ret||S.rv.edit))rvClose();\n  else if(S.view==='base'&&(S.base.sheet||S.base.legend||S.base.cd))clientCardClose()\n});\n\nfunction photoBlock(p){\n  const id=esc(p.id),up=S.upl[p.id],busy=!!up,cnt=phVers(p).length;\n  let h='<div class=\"pslots'+(busy?' busy':'')+'\">';\n  for(let i=1;i<=PH_MAX;i++){\n    const inp='<input type=\"file\" class=\"sr\" id=\"ph-'+id+'-'+i+'\" accept=\"image/*\" data-photo=\"'+id+'\" data-n=\"'+i+'\"'+(busy?' disabled':'')+'>';\n    if(i<=cnt){\n      h+='<div class=\"pslot has'+(up===i?' load':'')+'\"><label for=\"ph-'+id+'-'+i+'\" aria-label=\"'+esc(L('Заменить фото '+i,i+'-rasmni almashtirish'))+'\"><img src=\"'+imgUrl(p,i)+'\" alt=\"\" decoding=\"async\"></label>'\n        +(i===1?'<span class=\"pmain\">'+L('Главное','Asosiy')+'</span>':'')\n        +(busy?'':'<button type=\"button\" class=\"px\" data-act=\"phdel\" data-id=\"'+id+'\" data-n=\"'+i+'\" aria-label=\"'+esc(L('Убрать фото '+i,i+'-rasmni olib tashlash'))+'\">×</button>')\n        +inp+'</div>';\n    }else if(i===cnt+1){\n      h+='<div class=\"pslot add'+(up===i?' load':'')+'\"><label for=\"ph-'+id+'-'+i+'\" aria-label=\"'+esc(L('Добавить фото','Rasm qoʻshish'))+'\"><span>+</span></label>'+inp+'</div>';\n    }else h+='<div class=\"pslot ghost\" aria-hidden=\"true\"></div>';\n  }\n  return h+'</div><div class=\"phint\">'+L('До 3 фото. Первое видно в каталоге, остальные открываются по нажатию на него. Чтобы заменить фото, нажмите на него.','3 tagacha rasm. Birinchisi katalogda koʻrinadi, qolganlari unga bosilganda ochiladi. Rasmni almashtirish uchun unga bosing.')+'</div>';\n}\nfunction paintPhoto(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.getElementById('pph-'+id);\n  if(p&&el)el.innerHTML=photoBlock(p);\n}\n/* ступени цены в редакторе: три строки «от N шт — цена»; в товар попадают только верные (общая cleanTiers) */\nfunction tiersEditHTML(p){\n  const id=esc(p.id),t=tiersOf(p);\n  const rows=[0,1,2].map(i=>{\n    const x=t[i]||{};\n    return '<div class=\"trow\"><span>'+L('от','dan')+'</span><input type=\"number\" id=\"ptn-'+id+'-'+i+'\" data-pid=\"'+id+'\" data-pp=\"tn\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"2\" max=\"500\" step=\"1\" value=\"'+(x.n||'')+'\" placeholder=\"'+(i===0?'10':'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': от скольких штук','Pogʻona '+(i+1)+': necha donadan'))+'\">'\n      +'<span>'+L('шт — цена','dona — narx')+'</span><input type=\"number\" id=\"ptp-'+id+'-'+i+'\" data-pid=\"'+id+'\" data-pp=\"tp\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"1\" step=\"100\" value=\"'+(x.price||'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': цена за штуку, сум','Pogʻona '+(i+1)+': bir dona narxi, soʻm'))+'\"><span>'+L('сум','soʻm')+'</span></div>';\n  }).join('');\n  return '<div class=\"full\"><span class=\"lab\">'+L('Цена от количества (оптовые ступени)','Miqdorga qarab narx (ulgurji pogʻonalar)')+'</span><div class=\"tiers\">'+rows+'</div><div class=\"err\" id=\"ptw-'+id+'\" role=\"status\"></div>'\n    +'<div class=\"unit\" style=\"margin:2px 0 0\">'+L('Пример: от 10 шт — 7 000 сум. Когда клиент берёт столько штук этого товара, цена действует на все штуки. Цена ступени должна быть ниже обычной, а следующая — ещё ниже. Пустые строки не нужны.','Misol: 10 dona — 7 000 soʻm. Mijoz shuncha dona olsa, narx barcha donalarga qoʻllanadi. Pogʻona narxi odatdagidan, keyingisi esa undan ham past boʻlishi kerak. Boʻsh qatorlar kerak emas.')+'</div></div>';\n}\nfunction syncTiers(p){\n  const rows=[];\n  for(let i=0;i<3;i++){\n    const a=document.getElementById('ptn-'+p.id+'-'+i),b=document.getElementById('ptp-'+p.id+'-'+i);\n    const n=a?String(a.value).trim():'',pr=b?String(b.value).trim():'';\n    if(n!==''&&pr!=='')rows.push({n:Number(n),price:Number(pr)});\n  }\n  p.tiers=cleanTiers(rows,p.price);\n  const w=document.getElementById('ptw-'+p.id);\n  if(w)w.textContent=p.tiers.length<rows.length?L('Одна из строк не учтена: цена ступени должна быть ниже обычной и ниже предыдущей, а количество — больше предыдущего (от 2 до 500).','Qatorlardan biri hisobga olinmadi: pogʻona narxi odatdagidan va oldingisidan past, miqdor esa oldingisidan katta boʻlishi kerak (2 dan 500 gacha).'):'';\n}\n/* ---------- проверка товаров: продавец ---------- */\nconst inModGroup=p=>p.ms==='wait'||p.ms==='ret';\nconst modRetN=()=>S.prod.items.filter(p=>p.ms==='ret').length;\nconst modTag=p=>p.ms?'<span class=\"mtag '+p.ms+'\">'+({draft:L('Черновик','Qoralama'),wait:L('Ждёт проверки','Tekshiruv kutmoqda'),ret:L('Нужно исправить','Tuzatish kerak')}[p.ms]||'')+'</span>':'';\nconst modReasonHTML=p=>'<div class=\"mreason\"><small>'+L('Причина возврата','Qaytarish sababi')+'</small>'+esc(p.mc||L('Причина не указана','Sabab koʻrsatilmagan'))+'</div>';\n/* шапка товара в редакторе: черновик и возвращённый показывают состояние и кнопку отправки */\nfunction modHeadInner(p){\n  if(p.ms!=='draft'&&p.ms!=='ret')return '';\n  const id=esc(p.id),ret=p.ms==='ret';\n  return '<div class=\"mhead '+p.ms+'\"><div class=\"mrow\">'+modTag(p)+'<button type=\"button\" class=\"btn sm\" data-act=\"msub1\" data-id=\"'+id+'\"'+(S.msubBusy?' disabled':'')+'>'+(ret?L('Отправить снова','Qayta yuborish'):L('Отправить на проверку','Tekshiruvga yuborish'))+'</button></div>'\n    +(ret?modReasonHTML(p):'<div class=\"unit\" style=\"margin:6px 0 0\">'+L('Клиенты пока не видят этот товар. Укажите название, цену и категорию и отправьте на проверку.','Mijozlar bu mahsulotni hozircha koʻrmaydi. Nomi, narxi va kategoriyasini koʻrsatib, tekshiruvga yuboring.')+'</div>')+'</div>';\n}\nfunction modBanInner(){\n  const n=S.prod.items.filter(p=>p.ms==='draft').length;\n  if(!n)return '';\n  return '<div class=\"note warnnote mban\"><div>'+L('Черновиков: '+n+'. Клиенты их не видят, пока площадка не проверит.','Qoralamalar: '+n+'. Platforma tekshirmaguncha mijozlar ularni koʻrmaydi.')+'</div><button type=\"button\" class=\"btn sm\" data-act=\"msuball\"'+(S.msubBusy?' disabled':'')+'>'+L('Отправить на проверку ('+n+')','Tekshiruvga yuborish ('+n+')')+'</button></div>';\n}\n/* компактная карточка товара «на проверке»; у возвращённого есть причина и кнопки Исправить / Отправить снова */\nfunction modCard(p){\n  if(S.medit[p.id]&&p.ms==='ret')return prodRow(p);\n  const id=esc(p.id),ret=p.ms==='ret',w=weightLabel(p);\n  const th=p.pv?'<img src=\"'+imgUrl(p)+'\" alt=\"\" decoding=\"async\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>';\n  return '<div class=\"mcard '+p.ms+'\" id=\"prow-'+id+'\"><div class=\"mtop\"><div class=\"mth\">'+th+'</div><div class=\"mtx\"><b>'+esc(nm(p))+'</b><small>'+(w?esc(w)+' · ':'')+money(p.price)+'</small>'+modTag(p)+'</div></div>'\n    +(ret?modReasonHTML(p):'<div class=\"unit\" style=\"margin:8px 0 0\">'+L('Отправлено: '+agoTxt(p.mt)+'. Клиенты видят товар серым, без цены, пока площадка не проверит.','Yuborilgan: '+agoTxt(p.mt)+'. Platforma tekshirmaguncha mijozlar mahsulotni kulrang, narxsiz koʻradi.')+'</div>')\n    +'<div class=\"mact\">'+(ret?'<button type=\"button\" class=\"btn sm\" data-act=\"mfix\" data-id=\"'+id+'\">'+L('Исправить','Tuzatish')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"msub1\" data-id=\"'+id+'\"'+(S.msubBusy?' disabled':'')+'>'+L('Отправить снова','Qayta yuborish')+'</button>':'')\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"pdel\" data-id=\"'+id+'\">'+L('Удалить товар','Mahsulotni oʻchirish')+'</button></div></div>';\n}\n/* сервер ведёт статусы сам: после сохранения берём их из ответа (названия, цены и фото на экране не трогаем) */\nfunction mergeMod(prod){\n  const before=S.prod.items.map(p=>p.id+':'+(p.ms||'')+':'+(p.mc||'')).join();\n  const map=new Map(normProd(prod).items.map(i=>[i.id,i]));\n  let grp=false;\n  S.prod.items.forEach(p=>{\n    const n=map.get(p.id);if(!n)return;\n    const was=inModGroup(p);\n    ['ms','mt','mc','ma'].forEach(k=>{if(n[k]===undefined)delete p[k];else p[k]=n[k]});\n    if(was!==inModGroup(p))grp=true;\n  });\n  if(S.prod.items.map(p=>p.id+':'+(p.ms||'')+':'+(p.mc||'')).join()===before)return;\n  paintTabs();renderNav();\n  if(S.view!=='seller'||S.sellerTab!=='prod')return;\n  if(grp)paintSeller();\n  else paintModBits();\n}\nfunction paintModBits(){\n  S.prod.items.forEach(p=>{const el=document.getElementById('mh-'+p.id);if(el)el.innerHTML=modHeadInner(p);pxLive(p)});\n  const b=document.getElementById('mban');if(b)b.innerHTML=modBanInner();\n}\nconst MOD_WHY={name:['название','nomi'],price:['цену','narxi'],cat:['категорию','kategoriyasi']};\n/* ids — какие товары отправить */\nasync function modSubmit(ids){\n  if(S.msubBusy)return;\n  S.msubBusy=true;paintModBits();\n  await flushSave();\n  const r=await api('POST','/api/admin/submit',ids?{ids}:{});\n  S.msubBusy=false;\n  const bad=r.data&&Array.isArray(r.data.bad)?r.data.bad:[];\n  if(r.data&&r.data.prod)mergeMod(r.data.prod);\n  if(!r.ok){\n    if(bad.length){\n      const p=S.prod.items.find(x=>x.id===bad[0].id);\n      toast((p?'«'+nm(p)+'»: ':'')+L('укажите '+bad[0].why.map(w=>MOD_WHY[w][0]).join(', '),bad[0].why.map(w=>MOD_WHY[w][1]).join(', ')+' koʻrsating'));\n    }else toast(L('Нечего отправлять','Yuboradigan narsa yoʻq'));\n    /* товары, у которых не хватает данных, раскрываются сами */\n    bad.forEach(b=>{S.pxo[b.id]=true});\n    if(bad.length&&S.pfilter!=='all'&&!S.prod.items.some(p=>p.id===bad[0].id&&p.cat===S.pfilter))S.pfilter='all';\n    paintSeller();\n    if(bad.length){const row=document.getElementById('prow-'+bad[0].id);if(row)try{row.scrollIntoView({block:'start'});window.scrollBy(0,-72)}catch(x){}}\n    return;\n  }\n  ids&&ids.forEach(id=>{delete S.medit[id]});\n  S.prod.items.forEach(p=>{if(!inModGroup(p))delete S.medit[p.id]});\n  paintSeller();\n  const n=r.data.sent||0;\n  toast(L('Отправлено на проверку: '+n+(bad.length?'. Не хватает данных у '+bad.length+'.':''),'Tekshiruvga yuborildi: '+n+(bad.length?'. '+bad.length+' tasida maʼlumot yetishmaydi.':'')));\n}\n/* Подписи и мелкие подсказки полей товара: общие для формы продавца и правки владельца. Каждое поле на двух языках подписано явно: RU или UZ. */\nconst PF_LAB=()=>({\n  name:[L('Название по-русски','Ruscha nomi'),'ru'],\n  uz:[L('Название по-узбекски','Oʻzbekcha nomi'),'uz'],\n  desc:[L('Описание по-русски','Ruscha tavsif'),'ru'],\n  descUz:[L('Описание по-узбекски','Oʻzbekcha tavsif'),'uz']});\nconst pfLab=(k,lab)=>{const x=PF_LAB()[k];return x?x[0]+'<span class=\"ltag'+(x[1]==='uz'?' uz':'')+'\">'+x[1].toUpperCase()+'</span>':lab};\nconst PF_HINT=()=>({\n  name:L('Так название увидят клиенты в русском режиме. Пример: Тушёнка говяжья «Экстра»','Mijozlar bu nomni ruscha rejimda koʻradi. Misol: Тушёнка говяжья «Экстра»'),\n  uz:L('Так название увидят клиенты в узбекском режиме. Пример: Mol goʻshti dimlama «Ekstra». Если оставить пустым, клиенты увидят русское название.','Mijozlar bu nomni oʻzbekcha rejimda koʻradi. Misol: Mol goʻshti dimlama «Ekstra». Boʻsh qoldirsangiz, mijozlar ruscha nomni koʻradi.'),\n  desc:L('Коротко: состав, вкус, чем товар хорош. Можно оставить пустым. Пример: Кусковая говядина без добавок','Qisqacha: tarkibi, mazasi, nimasi bilan yaxshi. Boʻsh qoldirish mumkin. Misol: Кусковая говядина без добавок'),\n  descUz:L('То же по-узбекски. Если оставить пустым, клиенты увидят русское описание.','Xuddi shu oʻzbekcha. Boʻsh qoldirsangiz, mijozlar ruscha tavsifni koʻradi.'),\n  cat:L('Раздел каталога, в котором клиенты найдут товар.','Mijozlar mahsulotni katalogning shu boʻlimidan topadi.'),\n  amount:L('Сколько в одной единице: для банки 325 г впишите 325 и выберите «'+unitName('g')+'».','Bitta birlikda qancha: 325 g li banka uchun 325 yozing va «'+unitName('g')+'» ni tanlang.'),\n  price:L('Цена одной единицы (банки, пачки). Метка «'+tagName('sale')+'» или «'+tagName('new')+'» появится на карточке товара.','Bitta birlik (banka, pachka) narxi. «'+tagName('sale')+'» yoki «'+tagName('new')+'» belgisi mahsulot kartasida koʻrinadi.'),\n  old:L('Старая цена показывается зачёркнутой рядом с новой, нужна для акции. Снимите «В наличии», если товара нет: клиенты увидят его серым.','Eski narx yangisi yonida chizilgan holda koʻrinadi, aksiya uchun kerak. Mahsulot boʻlmasa, «Mavjud» belgisini olib tashlang: mijozlar uni kulrang koʻradi.'),\n  oldS:L('Старая цена показывается зачёркнутой рядом с новой, нужна только для акции.','Eski narx yangisi yonida chizilgan holda koʻrinadi, faqat aksiya uchun kerak.')});\nconst pfHint=k=>'<span class=\"hint\">'+esc(PF_HINT()[k])+'</span>';\nconst pfHintRow=k=>'<div class=\"full hint\">'+esc(PF_HINT()[k])+'</div>';\nconst PF_FULL=['name','uz','desc','descUz','cat'];\n/* свёрнутая строка товара в редакторе: фото, название, цена и пометки; по нажатию открывается полная форма.\n   Какие товары раскрыты, помнит S.pxo (только на время работы, на сервер не уходит) */\nfunction pxPills(p){\n  let h=modTag(p);\n  if(p.on===false)h+='<span class=\"mtag off\">'+L('Нет в наличии','Mavjud emas')+'</span>';\n  else if(p.av===0)h+='<span class=\"mtag off\">'+L('Остаток закончился','Qoldiq tugagan')+'</span>';\n  if(p.tag==='sale'||p.tag==='new')h+='<span class=\"mtag '+p.tag+'\">'+tagName(p.tag)+'</span>';\n  return h;\n}\nfunction pxSumInner(p){\n  const w=weightLabel(p),n=nm(p)||p.name||p.uz||'';\n  const th=p.pv?'<img src=\"'+imgUrl(p)+'\" alt=\"\" decoding=\"async\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>';\n  return '<span class=\"pth\">'+th+'</span><span class=\"ptx\"><b>'+(n?esc(n):'<i>'+L('Без названия','Nomsiz')+'</i>')+'</b><small>'+(w?esc(w)+' · ':'')+(p.price>0?money(p.price):'<em>'+L('цена не указана','narx koʻrsatilmagan')+'</em>')+'</small><span class=\"ppills\">'+pxPills(p)+'</span></span><span class=\"lchev\">'+ICO.chev+'</span>';\n}\nfunction pxLive(p){const s=document.getElementById('psum-'+p.id);if(s)s.innerHTML=pxSumInner(p)}\nfunction prodRow(p){\n  const id=esc(p.id),open=!!S.pxo[p.id];\n  return '<div class=\"prow'+(p.on===false?' off':'')+(open?' open':' fold')+'\" id=\"prow-'+id+'\"><button type=\"button\" class=\"psum\" id=\"psum-'+id+'\" data-act=\"pfold\" data-id=\"'+id+'\" aria-expanded=\"'+open+'\" aria-controls=\"pfbody-'+id+'\">'+pxSumInner(p)+'</button>'\n    +(open?'<div class=\"pfbody\" id=\"pfbody-'+id+'\">'+prodBody(p)+'</div>':'')+'</div>';\n}\n/* раскрыть или свернуть один товар: перерисовывается только его карточка, страница не прыгает */\nfunction pxSet(id,open){\n  const p=S.prod.items.find(x=>x.id===id),el=document.getElementById('prow-'+id);\n  if(!p||!el)return;\n  if(open)S.pxo[id]=true;else delete S.pxo[id];\n  const w=document.createElement('div');w.innerHTML=prodRow(p);\n  el.replaceWith(w.firstElementChild);\n  const b=document.getElementById('psum-'+id);\n  if(b){\n    try{b.focus({preventScroll:true})}catch(x){}\n    const r=b.getBoundingClientRect();\n    if(r.top<64||r.bottom>window.innerHeight)try{b.scrollIntoView({block:'center'})}catch(x){}\n  }\n}\n/* «Свернуть все» / «Развернуть все»: кнопки остаются на месте под пальцем */\nfunction pxAll(open){\n  const ids=S.prod.items.filter(p=>!inModGroup(p)&&(S.pfilter==='all'||p.cat===S.pfilter)).map(p=>p.id);\n  if(open)ids.forEach(id=>{S.pxo[id]=true});else S.pxo={};\n  const bar=document.getElementById('pfoldbar'),y=bar?bar.getBoundingClientRect().top:0;\n  paintSeller();\n  const nb=document.getElementById('pfoldbar');\n  if(bar&&nb){const d=nb.getBoundingClientRect().top-y;if(d)window.scrollBy(0,d)}\n}\nfunction prodBody(p){\n  const id=esc(p.id);\n  const fld=(k,lab,inner,cls)=>'<div'+(cls?' class=\"'+cls+'\"':'')+'><label class=\"lab\" for=\"p'+k+'-'+id+'\">'+pfLab(k,lab)+'</label>'+inner+(PF_FULL.includes(k)?pfHint(k):'')+'</div>';\n  const inp=(k,type,val,extra)=>'<input type=\"'+type+'\" id=\"p'+k+'-'+id+'\" data-pid=\"'+id+'\" data-pp=\"'+k+'\" value=\"'+esc(val)+'\"'+(extra||'')+'>';\n  const ta=(k,val)=>'<textarea id=\"p'+k+'-'+id+'\" data-pid=\"'+id+'\" data-pp=\"'+k+'\" maxlength=\"300\" rows=\"2\">'+esc(val)+'</textarea>';\n  return '<div class=\"pph\" id=\"pph-'+id+'\">'+photoBlock(p)+'</div><div class=\"pf\"><div class=\"full mh\" id=\"mh-'+id+'\">'+modHeadInner(p)+'</div>'\n    +fld('name',L('Название','Nomi'),inp('name','text',p.name,' maxlength=\"60\"'),'full')\n    +fld('uz',L('Название по-узбекски','Oʻzbekcha nomi'),inp('uz','text',p.uz||'',' maxlength=\"60\"'),'full')\n    +fld('desc',L('Описание','Tavsif'),ta('desc',p.desc||''),'full')\n    +fld('descUz',L('Описание по-узбекски','Oʻzbekcha tavsif'),ta('descUz',p.descUz||''),'full')\n    +fld('cat',L('Категория','Kategoriya'),'<select id=\"pcat-'+id+'\" data-pid=\"'+id+'\" data-pp=\"cat\">'+S.prod.cats.map(c=>'<option value=\"'+esc(c.id)+'\"'+(p.cat===c.id?' selected':'')+'>'+esc(nm(c))+'</option>').join('')+'</select>','full')\n    +fld('amount',L('Вес или объём единицы','Birlik ogʻirligi yoki hajmi'),inp('amount','number',p.amount||0,' inputmode=\"decimal\" step=\"any\" min=\"0\"'))\n    +fld('unit',L('Единица','Birlik'),'<select id=\"punit-'+id+'\" data-pid=\"'+id+'\" data-pp=\"unit\">'+UNIT_IDS.map(u=>'<option value=\"'+u+'\"'+(p.unit===u?' selected':'')+'>'+esc(unitName(u))+'</option>').join('')+'</select>')\n    +pfHintRow('amount')\n    +fld('price',L('Цена за единицу, сум','Birlik narxi, soʻm'),inp('price','number',p.price||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +fld('tag',L('Метка','Belgi'),'<select id=\"ptag-'+id+'\" data-pid=\"'+id+'\" data-pp=\"tag\"><option value=\"\"'+(!p.tag?' selected':'')+'>'+L('Без метки','Belgisiz')+'</option><option value=\"sale\"'+(p.tag==='sale'?' selected':'')+'>'+tagName('sale')+'</option><option value=\"new\"'+(p.tag==='new'?' selected':'')+'>'+tagName('new')+'</option></select>')\n    +pfHintRow('price')\n    +fld('old',L('Старая цена для акции, сум','Aksiya uchun eski narx, soʻm'),inp('old','number',p.old||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +'<div class=\"avail\"><label class=\"chk\"><input type=\"checkbox\" data-pid=\"'+id+'\" data-pp=\"on\"'+(p.on!==false?' checked':'')+'> '+L('В наличии','Mavjud')+'</label></div>'\n    +pfHintRow('old')\n    +tiersEditHTML(p)\n    +fld('blk',L('Штук в блоке (0 — нет блока)','Blokda necha dona (0 — blok yoʻq)'),inp('blk','number',p.blk||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +fld('box',L('Штук в коробке (0 — нет коробки)','Qutida necha dona (0 — quti yoʻq)'),inp('box','number',p.box||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +'<div class=\"full unit\" style=\"margin:0\">'+L('Блок и коробка — для удобства: цена и остаток всегда считаются в штуках. Если указать, у клиента появятся кнопки «+ блок» и «+ коробка», а в заказах будет видно, сколько это коробок. Допустимо от 2 до 500 штук.','Blok va quti — qulaylik uchun: narx va qoldiq doim donada hisoblanadi. Koʻrsatilsa, mijozda «+ blok» va «+ quti» tugmalari paydo boʻladi, buyurtmalarda esa necha quti ekani koʻrinadi. 2 dan 500 donagacha.')+'</div>'\n    +(S.stk[p.id]?'<div class=\"full unit\" style=\"margin:0\">'+L('Ведётся учёт остатка: свободно '+num(stkAvail(S.stk[p.id]))+' шт. Меняется на вкладке «Остатки». Когда свободного нет, товар закрывается сам.','Qoldiq hisobi yuritiladi: boʻsh '+num(stkAvail(S.stk[p.id]))+' dona. «Qoldiq» boʻlimida oʻzgartiriladi. Boʻsh qoldiq boʻlmasa, mahsulot oʻzi yopiladi.')+'</div>':'')\n    +'<div class=\"full pact\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmove\" data-id=\"'+id+'\" data-d=\"-1\" aria-label=\"'+esc(L('Выше','Yuqoriga'))+'\">▲</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmove\" data-id=\"'+id+'\" data-d=\"1\" aria-label=\"'+esc(L('Ниже','Pastga'))+'\">▼</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"pdel\" data-id=\"'+id+'\">'+(S.cd===p.id?L('Точно удалить?','Aniq oʻchirilsinmi?'):L('Удалить товар','Mahsulotni oʻchirish'))+'</button>'\n    +'<button type=\"button\" class=\"btn ghost sm pfoldbtn\" data-act=\"pfold\" data-id=\"'+id+'\">'+L('Свернуть','Yigʻish')+'</button></div>'\n    +'</div>';\n}\n/* ---------- прайс из Excel ---------- */\nconst IMP_F={price:['цена','narx'],name:['название','nomi'],uz:['название (узб.)','nomi (uz)'],desc:['описание','tavsif'],descUz:['описание (узб.)','tavsif (uz)'],cat:['категория','kategoriya'],amount:['вес','ogʻirlik'],unit:['единица','birlik'],on:['в наличии','mavjud'],tag:['метка','belgi'],old:['старая цена','eski narx']};\nfunction impVal(k,v){\n  if(k==='price'||k==='old')return v?num(v):'—';\n  if(k==='on')return v?L('да','ha'):L('нет','yoʻq');\n  if(k==='tag')return v?tagName(v):L('нет','yoʻq');\n  if(k==='unit')return unitName(v);\n  if(k==='amount')return amountStr(v);\n  return v===''||v==null?'—':String(v).slice(0,40);\n}\nfunction impWhy(w){return {\n  not_xlsx:L('Это не файл Excel (.xlsx). Откройте прайс в Excel и сохраните как «Книга Excel (*.xlsx)».','Bu Excel (.xlsx) fayli emas. Prays-listni Excelda ochib, «Excel Workbook (*.xlsx)» sifatida saqlang.'),\n  no_header:L('Не нашёл колонки «Название» и «Цена» (или «Nomi» и «Narx») в первых строках. Проверьте заголовки.','Birinchi qatorlarda «Nomi» va «Narx» (yoki «Название» va «Цена») ustunlari topilmadi. Sarlavhalarni tekshiring.'),\n  too_big:L('Файл слишком большой (до 1 МБ).','Fayl juda katta (1 MB gacha).')\n}[w]||L('Не удалось прочитать файл.','Faylni oʻqib boʻlmadi.')}\nfunction impCardHTML(){\n  const im=S.imp;\n  let h='<div class=\"card\"><h3>'+L('Прайс из Excel','Excel prays-listi')+'</h3><div class=\"unit\">'+L('Выгрузите каталог в Excel, поправьте цены и загрузите файл обратно. Перед применением вы увидите, что изменится. Ничего не удаляется, фото и остатки не меняются.','Katalogni Excelga yuklab oling, narxlarni tuzating va faylni qaytarib yuklang. Qoʻllashdan oldin nima oʻzgarishini koʻrasiz. Hech narsa oʻchirilmaydi, rasm va qoldiqlar oʻzgarmaydi.')+'</div>'\n    +'<div class=\"row-btns\">'+xbtn('catalog')\n    +'<label class=\"btn ghost sm'+(S.impBusy?' dis':'')+'\" for=\"imp-file\">'+(im&&im.busy?L('Читаем файл…','Fayl oʻqilmoqda…'):L('Загрузить прайс','Prays yuklash'))+'</label><input type=\"file\" class=\"sr\" id=\"imp-file\" accept=\".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\" data-imp=\"1\"'+(S.impBusy?' disabled':'')+'></div>';\n  if(im&&im.res){\n    const r=im.res,sm=r.summary;\n    h+='<div class=\"impsum\" id=\"impsum\"><span>'+L('Добавится','Qoʻshiladi')+': <b>'+sm.added+'</b></span><span>'+L('Изменится','Oʻzgaradi')+': <b>'+sm.updated+'</b></span><span>'+L('Без изменений','Oʻzgarishsiz')+': <b>'+sm.same+'</b></span>'+(sm.errors?'<span style=\"color:var(--bad)\">'+L('Ошибок','Xatolar')+': <b>'+sm.errors+'</b></span>':'')+'</div>';\n    if(sm.newCats&&sm.newCats.length)h+='<div class=\"unit\">'+L('Новые категории: ','Yangi kategoriyalar: ')+esc(sm.newCats.join(', '))+'</div>';\n    h+=r.changes.map(c=>{\n      const f=c.fields.map(x=>c.kind==='add'?(x.k==='price'?L('цена ','narx ')+impVal('price',x.to):''):esc(L(IMP_F[x.k][0],IMP_F[x.k][1]))+': '+esc(impVal(x.k,x.from))+' → '+esc(impVal(x.k,x.to))).filter(Boolean).join('; ');\n      return '<div class=\"chg\"><b>'+(c.kind==='add'?'+ ':'')+esc(c.name)+'</b><small>'+(c.kind==='add'?esc(L('новый товар, ','yangi mahsulot, ')+(c.cat?c.cat+', ':''))+f:f)+'</small></div>';\n    }).join('');\n    if(r.moreChanges)h+='<div class=\"unit\">'+L('…и ещё изменений: ','…va yana oʻzgarishlar: ')+r.moreChanges+'</div>';\n    if(r.errors.length)h+='<div class=\"unit\" style=\"margin-top:8px\"><b>'+L('Эти строки не будут загружены:','Bu qatorlar yuklanmaydi:')+'</b></div>'+r.errors.map(e=>'<div class=\"chg bad\"><small>'+L('строка ','qator ')+e.row+': '+esc(L(e.msg,e.uz||e.msg))+'</small></div>').join('')+(r.moreErrors?'<div class=\"unit\">'+L('…и ещё ошибок: ','…va yana xatolar: ')+r.moreErrors+'</div>':'');\n    const can=sm.added+sm.updated>0;\n    h+=(can?'':'<div class=\"note\" style=\"margin-top:8px\">'+L('В файле нет изменений для каталога.','Faylda katalog uchun oʻzgarishlar yoʻq.')+'</div>')\n      +'<div class=\"row-btns\" style=\"margin-top:10px\">'+(can?'<button type=\"button\" class=\"btn sm\" id=\"impapply\" data-act=\"impapply\"'+(S.impBusy?' disabled':'')+'>'+L('Применить изменения','Oʻzgarishlarni qoʻllash')+'</button>':'')+'<button type=\"button\" class=\"btn ghost sm\" data-act=\"impcancel\"'+(S.impBusy?' disabled':'')+'>'+(can?L('Отмена','Bekor qilish'):L('Закрыть','Yopish'))+'</button></div>';\n  }\n  return h+'</div>';\n}\nasync function importFile(file){\n  if(S.impBusy||!S.admin)return;\n  if(file.size>1000000){toast(impWhy('too_big'));return}\n  S.impBusy=true;S.imp={busy:true};paintSeller();\n  await flushSave();   // сначала уходят несохранённые правки каталога\n  let bytes;\n  try{bytes=new Uint8Array(await file.arrayBuffer())}catch(e){S.impBusy=false;S.imp=null;paintSeller();toast(impWhy(''));return}\n  const r=await apiBin('POST','/api/admin/import',bytes,'application/octet-stream');\n  S.impBusy=false;\n  if(!r.ok||!r.data||!r.data.summary){S.imp=null;paintSeller();toast(r.data&&r.data.why?impWhy(r.data.why):L('Не удалось прочитать файл. Проверьте соединение.','Faylni oʻqib boʻlmadi. Ulanishni tekshiring.'));return}\n  S.imp={bytes,res:r.data};paintSeller();\n  try{document.getElementById('impsum').scrollIntoView({block:'center'})}catch(e){}\n}\nasync function impApply(){\n  if(S.impBusy||!S.imp||!S.imp.bytes)return;\n  S.impBusy=true;paintSeller();\n  await flushSave();\n  const r=await apiBin('POST','/api/admin/import?apply=1',S.imp.bytes,'application/octet-stream');\n  S.impBusy=false;\n  if(!r.ok||!r.data||!r.data.summary){paintSeller();toast(L('Не удалось применить прайс. Проверьте соединение и попробуйте ещё раз.','Prays qoʻllanmadi. Ulanishni tekshirib, qayta urining.'));return}\n  const sm=r.data.summary;\n  if(r.data.prod){S.prod=normProd(r.data.prod);applyStk();pruneCart()}\n  S.imp=null;paintSeller();renderNav();\n  toast(L('Готово: добавлено '+sm.added+', изменено '+sm.updated+'.','Tayyor: '+sm.added+' ta qoʻshildi, '+sm.updated+' ta oʻzgardi.'));\n}\nfunction prodHTML(){\n  const P=S.prod;\n  if(S.pfilter!=='all'&&!P.cats.some(c=>c.id===S.pfilter))S.pfilter='all';\n  const pend=P.items.filter(inModGroup);\n  const list=P.items.filter(p=>!inModGroup(p)&&(S.pfilter==='all'||p.cat===S.pfilter));\n  let h='<div class=\"note\" style=\"margin-bottom:14px\">'+L('Каталог товаров. Сначала создайте категории, затем добавляйте товары: название, описание, вес, цену и фото. Клиенты видят изменения сразу. Фото сжимается на телефоне. Снимите галочку «В наличии», если товара нет: он останется в каталоге серым.','Mahsulotlar katalogi. Avval kategoriyalar yarating, keyin mahsulotlar qoʻshing: nomi, tavsifi, ogʻirligi, narxi va rasmi. Mijozlar oʻzgarishlarni darhol koʻradi. Rasm telefonda siqiladi. Mahsulot boʻlmasa, «Mavjud» belgisini olib tashlang: u katalogda kulrang boʻlib qoladi.')+'</div>'\n    +'<div class=\"savebar\" id=\"savebar\"></div>';\n  h+=impCardHTML();\n  h+='<div class=\"card\"><h3>'+L('Категории','Kategoriyalar')+'</h3><div class=\"unit\">'+L('Каждая категория называется на двух языках: клиент видит название на языке своего приложения. Если узбекское пустое, покажется русское. Удалить можно только пустую категорию.','Har bir kategoriya ikki tilda nomlanadi: mijoz oʻz ilovasi tilidagi nomni koʻradi. Oʻzbekcha nom boʻsh boʻlsa, ruscha koʻrinadi. Faqat boʻsh kategoriyani oʻchirish mumkin.')+'</div>';\n  P.cats.forEach(c=>{\n    const id=esc(c.id);\n    h+='<div class=\"crow\"><div><label class=\"lab\" for=\"cn-'+id+'\">'+L('Название по-русски','Ruscha nomi')+'<span class=\"ltag\">RU</span></label><input type=\"text\" id=\"cn-'+id+'\" data-cid=\"'+id+'\" data-cp=\"name\" value=\"'+esc(c.name)+'\" maxlength=\"40\" placeholder=\"'+esc(L('Например: Консервы','Masalan: Консервы'))+'\"></div><div><label class=\"lab\" for=\"cu-'+id+'\">'+L('Название по-узбекски','Oʻzbekcha nomi')+'<span class=\"ltag uz\">UZ</span></label><input type=\"text\" id=\"cu-'+id+'\" data-cid=\"'+id+'\" data-cp=\"uz\" value=\"'+esc(c.uz||'')+'\" maxlength=\"40\" placeholder=\"'+esc(L('Например: Konservalar','Masalan: Konservalar'))+'\"></div><button type=\"button\" class=\"x\" data-act=\"cdel\" data-id=\"'+id+'\" aria-label=\"'+esc(L('Удалить категорию','Kategoriyani oʻchirish'))+'\">×</button></div>';\n  });\n  h+='<div style=\"margin-top:8px\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"cadd\">'+L('+ Добавить категорию','+ Kategoriya qoʻshish')+'</button></div></div>';\n  h+='<div class=\"card\"><h3>'+L('Товары','Mahsulotlar')+' · '+P.items.length+'</h3>';\n  h+='<div id=\"mban\">'+modBanInner()+'</div>';\n  if(pend.length)h+='<div class=\"mgroup\"><h4>'+L('На проверке','Tekshiruvda')+' · '+pend.length+'</h4>'+pend.map(modCard).join('')+'</div>';\n  if(P.cats.length>1)h+='<div class=\"filters\" style=\"margin:8px 0 4px\">'+[['all',L('Все','Barchasi')]].concat(P.cats.map(c=>[c.id,nm(c)])).map(c=>'<button type=\"button\" class=\"chip\" data-act=\"pfilter\" data-id=\"'+esc(c[0])+'\" aria-pressed=\"'+(S.pfilter===c[0])+'\">'+esc(c[1])+'</button>').join('')+'</div>';\n  if(!list.length)h+='<div class=\"unit\" style=\"padding:10px 0\">'+(P.items.length-pend.length?L('В этой категории пока ничего нет.','Bu kategoriyada hozircha hech narsa yoʻq.'):L('Товаров пока нет. Нажмите «Добавить товар».','Mahsulotlar hozircha yoʻq. «Mahsulot qoʻshish» tugmasini bosing.'))+'</div>';\n  if(list.length>1)h+='<div class=\"row-btns pfoldbar\" id=\"pfoldbar\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pfoldall\" data-v=\"0\">'+L('Свернуть все','Hammasini yigʻish')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"pfoldall\" data-v=\"1\">'+L('Развернуть все','Hammasini yoyish')+'</button></div>';\n  list.forEach(p=>{h+=prodRow(p)});\n  h+='<div style=\"margin-top:10px\"><button type=\"button\" class=\"btn\" data-act=\"pnew\">'+L('+ Добавить товар','+ Mahsulot qoʻshish')+'</button></div></div>';\n  return h;\n}\n/* ---------- seller: остатки ---------- */\n/* состояние учёта товара: none (не ведётся), ok, low (мало), out (свободного нет) */\nfunction stState(p){\n  const s=S.stk[p.id];\n  if(!s)return 'none';\n  const a=stkAvail(s);\n  return a===0?'out':(s.low>0&&a<=s.low?'low':'ok');\n}\n/* переносит остатки в каталог на экране, чтобы продавец видел витрину так же, как клиент */\nfunction applyStk(){\n  S.prod.items.forEach(p=>{\n    const v=stkPublic(S.stk[p.id],MAX_QTY);\n    delete p.av;delete p.lw;\n    if(v){p.av=v.av;if(v.lw)p.lw=1}\n  });\n}\nfunction statsHTML(){\n  const c={none:0,ok:0,low:0,out:0};\n  S.prod.items.forEach(p=>{c[stState(p)]++});\n  const st=(lab,v,hot)=>'<div class=\"stat'+(hot?' hot':'')+'\"><small>'+lab+'</small><b>'+v+'</b></div>';\n  return st(L('Под учётом','Hisobda'),c.ok+c.low+c.out)+st(L('Без учёта','Hisobsiz'),c.none)+st(L('Заканчивается','Tugayapti'),c.low,c.low>0)+st(L('Нет свободного','Boʻshi yoʻq'),c.out,c.out>0);\n}\n/* выбор «шт / коробка / блок» для прихода, если у товара есть упаковки */\nfunction stockUnitSel(p){\n  const ks=['blk','box'].filter(k=>packSize(p,k));\n  if(!ks.length)return '';\n  return '<select id=\"su-'+esc(p.id)+'\" aria-label=\"'+esc(L('В чём вводите количество','Miqdor nimada kiritiladi'))+'\"'+(S.sbusy[p.id]?' disabled':'')+'><option value=\"pc\">'+L('шт','dona')+'</option>'+ks.map(k=>'<option value=\"'+k+'\">'+esc(packWord(k))+' ('+packSize(p,k)+' '+pcsWord()+')</option>').join('')+'</select>';\n}\nconst stockUnit=id=>{const el=document.getElementById('su-'+id);return el&&el.value&&el.value!=='pc'?el.value:''};\nconst pkSmall=(p,n)=>{const t=packText(p,n);return t?'<small class=\"pk\">'+esc(t)+'</small>':''};\nfunction stockRowHTML(p){\n  const id=esc(p.id),s=S.stk[p.id],st=stState(p),dis=S.sbusy[p.id]?' disabled':'',w=weightLabel(p);\n  const cat=S.prod.cats.find(c=>c.id===p.cat);\n  const pill=st==='none'?'<span class=\"st mute\">'+L('Без учёта','Hisobsiz')+'</span>'\n    :st==='out'?'<span class=\"st bad\">'+L('Нет свободного','Boʻshi yoʻq')+'</span>'\n    :st==='low'?'<span class=\"st warn\">'+L('Заканчивается','Tugayapti')+'</span>'\n    :'<span class=\"st ok\">'+L('В наличии','Mavjud')+'</span>';\n  const head='<div class=\"sh\"><div class=\"sn\"><b>'+esc(p.name)+'</b><small>'+(w?esc(w):'')+(w&&cat?' · ':'')+(cat?esc(cat.name):'')+'</small></div>'+pill+'</div>';\n  const numIn=(k,ph,aria,val)=>'<input type=\"number\" id=\"'+k+'-'+id+'\" inputmode=\"numeric\" min=\"0\" max=\"1000000\" step=\"1\"'+(k==='sl'?' data-sl=\"'+id+'\"':'')+' value=\"'+val+'\" placeholder=\"'+esc(ph)+'\" aria-label=\"'+esc(aria)+'\"'+dis+'>';\n  const lowIn='<div class=\"sth\"><label for=\"sl-'+id+'\">'+L('Предупредить, когда меньше','Bundan kam qolsa ogohlantirish')+'</label>'+numIn('sl','0',L('Порог «мало»','«Oz qoldi» chegarasi'),s?s.low:'')+'</div>';\n  if(!s){\n    return '<div class=\"srow\" id=\"srow-'+id+'\">'+head\n      +'<div class=\"sact'+(packSize(p,'blk')||packSize(p,'box')?' haspk':'')+'\">'+numIn('sn',L('Сколько на складе','Omborda qancha'),L('Сколько сейчас на складе','Hozir omborda qancha'),'')+stockUnitSel(p)\n      +'<button type=\"button\" class=\"btn sm\" data-act=\"sstart\" data-id=\"'+id+'\"'+dis+'>'+L('Начать учёт','Hisobni boshlash')+'</button></div>'+lowIn+'</div>';\n  }\n  return '<div class=\"srow\" id=\"srow-'+id+'\">'+head\n    +'<div class=\"snum\"><div><small>'+L('На складе','Omborda')+'</small><b>'+num(s.q)+'</b>'+pkSmall(p,s.q)+'</div><div><small>'+L('В заказах','Buyurtmalarda')+'</small><b>'+num(s.r)+'</b>'+pkSmall(p,s.r)+'</div><div class=\"fr '+st+'\"><small>'+L('Свободно','Boʻsh')+'</small><b>'+num(stkAvail(s))+'</b>'+pkSmall(p,stkAvail(s))+'</div></div>'\n    +'<div class=\"sact'+(packSize(p,'blk')||packSize(p,'box')?' haspk':'')+'\">'+numIn('sn',L('Количество','Miqdori'),L('Количество','Miqdori'),'')+stockUnitSel(p)\n    +'<button type=\"button\" class=\"btn sm\" data-act=\"sin\" data-id=\"'+id+'\"'+dis+'>'+L('+ Приход','+ Kirim')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sset\" data-id=\"'+id+'\"'+dis+'>'+L('Задать остаток','Qoldiqni belgilash')+'</button></div>'\n    +lowIn\n    +'<div><button type=\"button\" class=\"btn ghost sm\" data-act=\"soff\" data-id=\"'+id+'\"'+dis+'>'+(S.sc===p.id?L('Точно отключить учёт?','Hisob oʻchirilsinmi?'):L('Отключить учёт','Hisobni oʻchirish'))+'</button></div></div>';\n}\nconst JR_KIND={start:['Начат учёт','Hisob boshlandi'],in:['Приход','Kirim'],fix:['Исправление остатка','Qoldiq tuzatildi'],out:['Списано по заказу','Buyurtma boʻyicha chiqim'],off:['Учёт отключён','Hisob oʻchirildi']};\nfunction jrDate(t){\n  const d=new Date(t);\n  if(isNaN(d))return '';\n  if(LANG==='uz')return d.getDate()+'-'+UZ_MO[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes());\n  return d.toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});\n}\nfunction jrHTML(){\n  if(!S.jr.length)return '<div class=\"unit\" style=\"padding:8px 0\">'+L('Записей пока нет.','Hozircha yozuv yoʻq.')+'</div>';\n  return S.jr.slice(0,60).map(x=>{\n    const k=JR_KIND[x.kind]||['',''],d=Number(x.d)||0;\n    const dd=x.kind==='off'?'—<small>'+L('было ','boʻlgan ')+num(x.q)+'</small>':(d>0?'+'+num(d):d<0?'−'+num(-d):'0')+'<small>'+L('стало ','boʻldi ')+num(x.q)+'</small>';\n    return '<div class=\"jrow\"><div class=\"jn\"><b>'+esc(x.name)+'</b><small>'+esc(L(k[0],k[1]))+(x.ref?' '+esc(x.ref):'')+' · '+esc(jrDate(x.t))+(x.by?' · '+esc(x.by):'')+'</small></div><div class=\"jd'+(x.kind!=='off'&&d>0?' plus':x.kind!=='off'&&d<0?' minus':'')+'\">'+dd+'</div></div>';\n  }).join('');\n}\nfunction stockHTML(){\n  if(!S.stkLoaded)return '<div class=\"empty\"><b>'+L('Загружаем остатки','Qoldiqlar yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  if(!S.prod.items.length)return '<div class=\"empty\"><b>'+L('Товаров пока нет','Mahsulotlar hozircha yoʻq')+'</b>'+L('Сначала добавьте товары на вкладке «Каталог».','Avval «Katalog» boʻlimida mahsulot qoʻshing.')+'</div>';\n  const fl=[['all',L('Все','Hammasi')],['low',L('Заканчивается','Tugayapti')],['out',L('Нет свободного','Boʻshi yoʻq')],['none',L('Без учёта','Hisobsiz')]];\n  const list=S.prod.items.filter(p=>{const s=stState(p);return S.sfilter==='all'||(S.sfilter==='low'?(s==='low'||s==='out'):s===S.sfilter)});\n  const hasPk=S.prod.items.some(p=>packSize(p,'box')||packSize(p,'blk'));\n  let h='<div class=\"note\" style=\"margin-bottom:14px\">'+(hasPk?L('Если у товара указан блок или коробка, приход и остаток можно вводить ими: выберите единицу рядом с полем, программа пересчитает в штуки. ','Agar mahsulotda blok yoki quti koʻrsatilgan boʻlsa, kirim va qoldiqni ular bilan kiritish mumkin: maydon yonida birlikni tanlang, dastur donaga hisoblab beradi. '):'')+L('Укажите, сколько единиц товара на складе (мешков, коробок, упаковок — как товар продаётся в каталоге). Заказ откладывает товар, при «Выдан» или «Доставлен» он списывается, при отмене возвращается. Когда свободного остаётся меньше порога, клиенты видят «Мало (осталось N)», а вам приходит сообщение в Telegram. Когда свободного нет, товар в каталоге становится серым сам.',\n    'Omborda necha birlik (qop, quti, qadoq — katalogda qanday sotilsa) borligini kiriting. Buyurtma mahsulotni band qiladi, «Topshirildi» yoki «Yetkazildi» boʻlganda ombordan chiqariladi, bekor qilinsa qaytadi. Boʻsh qoldiq chegaradan kam boʻlsa, mijozlar «Oz qoldi (N ta)» deb koʻradi, sizga Telegramda xabar keladi. Boʻsh qoldiq boʻlmasa, mahsulot katalogda oʻzi kulrang boʻladi.')+'</div>'\n    +'<div class=\"stats\" id=\"sstats\">'+statsHTML()+'</div>'\n    +'<div class=\"filters\">'+fl.map(f=>'<button type=\"button\" class=\"chip\" data-act=\"sfilter\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(S.sfilter===f[0])+'\">'+f[1]+'</button>').join('')+'</div>'\n    +'<div class=\"card\">'+(list.length?list.map(stockRowHTML).join(''):'<div class=\"unit\" style=\"padding:10px 0\">'+L('В этом списке пусто.','Bu roʻyxat boʻsh.')+'</div>')+'</div>'\n    +'<div class=\"card\"><h3>'+L('Журнал движений','Harakatlar jurnali')+'</h3><div class=\"unit\">'+L('Приходы, исправления и списания по выданным заказам. Показаны последние записи.','Kirimlar, tuzatishlar va topshirilgan buyurtmalar boʻyicha chiqimlar. Oxirgi yozuvlar koʻrsatilgan.')+'</div>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sjr\">'+(S.jrOpen?L('Скрыть журнал','Jurnalni yashirish'):L('Показать журнал','Jurnalni koʻrsatish'))+'</button>'\n    +'<div id=\"jrbody\">'+(S.jrOpen?jrHTML():'')+'</div></div>';\n  return h;\n}\nfunction paintStock(){\n  const b=$('#sbody');\n  if(b&&S.view==='seller'&&S.sellerTab==='stock')b.innerHTML=stockHTML();\n}\nfunction paintStockRow(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.getElementById('srow-'+id);\n  if(p&&el)el.outerHTML=stockRowHTML(p);\n  const st=$('#sstats');if(st)st.innerHTML=statsHTML();\n  paintTabs();\n}\nasync function loadStock(){\n  if(!S.admin)return;\n  const r=await api('GET','/api/admin/stock');\n  if(!r.ok||!r.data||!r.data.stk)return;\n  const first=!S.stkLoaded;\n  S.stkLoaded=true;\n  if(!first&&JSON.stringify(r.data.stk)===JSON.stringify(S.stk))return;\n  S.stk=r.data.stk;applyStk();\n  if(S.view!=='seller')return;\n  paintTabs();\n  if(S.sellerTab==='stock'){\n    const ae=document.activeElement,b=$('#sbody');\n    if(ae&&b&&b.contains(ae)&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))return;   // не мешаем, пока продавец вводит число\n    paintStock();\n  }\n}\nasync function loadJournal(){\n  const r=await api('GET','/api/admin/journal');\n  if(r.ok&&r.data&&Array.isArray(r.data.jr))S.jr=r.data.jr;\n  const el=$('#jrbody');if(el&&S.jrOpen)el.innerHTML=jrHTML();\n}\n/* целое число из поля; при ошибке подсказывает и возвращает null */\nfunction stockNum(id,k,min){\n  const el=document.getElementById(k+'-'+id),raw=el?String(el.value).trim():'';\n  if(raw===''){toast(L('Введите количество','Miqdorni kiriting'));if(el)el.focus();return null}\n  const n=Number(raw);\n  if(!Number.isInteger(n)||n<min||n>1000000){\n    toast(min>0?L('Введите целое число от 1','1 dan boshlab butun son kiriting'):L('Введите целое число, 0 или больше','Butun son kiriting (0 yoki koʻp)'));\n    if(el)el.focus();\n    return null;\n  }\n  return n;\n}\n/* soft: порог сохраняется тихо, строку не перерисовываем, пока продавец печатает в ней другое число */\nasync function stockDo(id,body,okMsg,soft){\n  if(S.sbusy[id]||!S.auth||!S.admin)return;\n  S.sbusy[id]=true;\n  if(!soft)paintStockRow(id);\n  await flushSave();   // товар должен уже быть на сервере\n  const r=await api('POST','/api/admin/stock',Object.assign({id:id},body));\n  delete S.sbusy[id];\n  if(r.ok&&r.data&&r.data.stk){S.stk=r.data.stk;S.stkLoaded=true;applyStk();toast(okMsg)}\n  else toast(r.status===404?L('Такого товара уже нет','Bunday mahsulot endi yoʻq'):L('Не удалось сохранить. Проверьте соединение.','Saqlab boʻlmadi. Ulanishni tekshiring.'));\n  const row=document.getElementById('srow-'+id),ae=document.activeElement;\n  if(!soft||!(row&&ae&&row.contains(ae)))paintStockRow(id);\n  else{const st=$('#sstats');if(st)st.innerHTML=statsHTML();paintTabs()}\n  if(S.jrOpen)loadJournal();\n}\n\n/* ---------- отчёты (продавец) ---------- */\nconst RP_DAYS=[7,30,90,365];\nconst MO_S_RU=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'],MO_S_UZ=['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'];\nconst MO_F_RU=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];\nconst dShort=d=>{const m=Number(d.slice(5,7))-1,n=Number(d.slice(8,10));return LANG==='uz'?n+'-'+UZ_MO[m]:n+' '+MO_S_RU[m]};\nconst fDay=d=>d.slice(8,10)+'.'+d.slice(5,7)+'.'+d.slice(0,4);\nconst mFull=m=>{const i=Number(m.slice(5,7))-1;return (LANG==='uz'?UZ_MO[i]:MO_F_RU[i])+' '+m.slice(0,4)};\nconst mShort=m=>{const i=Number(m.slice(5,7))-1;return LANG==='uz'?MO_S_UZ[i]:MO_S_RU[i]};\nconst rpRange=d=>({7:L('7 дней','7 kun'),30:L('30 дней','30 kun'),90:L('3 месяца','3 oy'),365:L('Год','Yil')})[d];\nfunction ruPl(n,a){const m=n%100,k=n%10;return m>=11&&m<=14?a[2]:k===1?a[0]:k>=2&&k<=4?a[1]:a[2]}\nconst ordTxt=n=>LANG==='uz'?n+' ta buyurtma':n+' '+ruPl(n,['заказ','заказа','заказов']);\n/* подписи на оси: 1,2 млн / 500 тыс */\nfunction cCompact(v){\n  v=Math.round(v);\n  const f=x=>String(Math.round(x*10)/10).replace('.',',');\n  return v>=1e9?f(v/1e9)+' '+L('млрд','mlrd'):v>=1e6?f(v/1e6)+' '+L('млн','mln'):v>=1e3?f(v/1e3)+' '+L('тыс','ming'):String(v);\n}\n/* верх шкалы: круглое число, чтобы половина тоже была круглой */\nfunction niceMax(v){\n  if(!(v>0))return 1;\n  const pow=Math.pow(10,Math.floor(Math.log10(v))),m=v/pow;\n  return [1,2,4,6,8,10].find(x=>m<=x+1e-9)*pow;\n}\n/* столбцы: до месяца — дни, три месяца — недели, год — месяцы */\nfunction repBuckets(r){\n  const ser=r.series,sum=(g,k)=>g.reduce((a,x)=>a+x[k],0);\n  if(r.days<=30)return ser.map(x=>({n:x.n,sum:x.sum,full:dShort(x.d),ax:dShort(x.d)}));\n  const out=[];\n  if(r.days<=90){\n    for(let i=0;i<ser.length;i+=7){const g=ser.slice(i,i+7);out.push({n:sum(g,'n'),sum:sum(g,'sum'),full:dShort(g[0].d)+(g.length>1?' – '+dShort(g[g.length-1].d):''),ax:dShort(g[0].d)})}\n    return out;\n  }\n  const mp=new Map();\n  ser.forEach(x=>{const k=x.d.slice(0,7),g=mp.get(k)||{m:k,n:0,sum:0};g.n+=x.n;g.sum+=x.sum;mp.set(k,g)});\n  mp.forEach(g=>out.push({n:g.n,sum:g.sum,full:mFull(g.m),ax:mShort(g.m)}));\n  return out;\n}\nconst readTxt=b=>'<b>'+esc(b.full)+'</b> · '+esc(money(b.sum))+' · '+esc(ordTxt(b.n));\nfunction readHTML(bs,i){\n  if(i>=0&&bs[i])return readTxt(bs[i]);\n  const mx=Math.max(0,...bs.map(b=>b.sum));\n  if(!(mx>0))return '';\n  return esc(L('Пик: ','Eng yuqori: '))+readTxt(bs[bs.findIndex(b=>b.sum===mx)]);\n}\n/* подсветка столбца и строка со значением (наведение, касание, нажатие) без перерисовки */\nfunction repShow(i){\n  const r=S.rep.data;if(!r)return;\n  document.querySelectorAll('.rcol').forEach((c,k)=>c.setAttribute('aria-pressed',String(k===i)));\n  const el=$('#rread');if(el)el.innerHTML=readHTML(repBuckets(r),i);\n}\nfunction repIdx(e){\n  const box=e.target&&e.target.closest?e.target.closest('.rcols'):null;\n  if(!box||!S.rep.data)return -1;\n  const rc=box.getBoundingClientRect(),n=box.children.length;\n  if(!rc.width||!n)return -1;\n  return Math.max(0,Math.min(n-1,Math.floor((e.clientX-rc.left)/rc.width*n)));\n}\ndocument.addEventListener('pointermove',e=>{\n  const i=repIdx(e);\n  if(i<0||i===S.rep.hov)return;\n  S.rep.hov=i;repShow(i);\n  if(e.pointerType==='touch')S.rep.drag=true;\n});\ndocument.addEventListener('pointerup',e=>{\n  if(e.pointerType==='touch'&&S.rep.drag){S.rep.drag=false;S.rep.sel=S.rep.hov;S.rep.skip=Date.now()}\n});\ndocument.addEventListener('pointerout',e=>{\n  if(e.pointerType!=='mouse'||!e.target.closest||!e.target.closest('.rcols'))return;\n  if(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.rcols'))return;\n  S.rep.hov=-1;repShow(S.rep.sel);\n});\nfunction chartHTML(r){\n  const bs=repBuckets(r),mx=Math.max(0,...bs.map(b=>b.sum)),top=niceMax(mx),ticks=[top,top/2,0];\n  const cols=bs.map((b,i)=>'<button type=\"button\" class=\"rcol\" data-act=\"rsel\" data-i=\"'+i+'\" aria-pressed=\"'+(S.rep.sel===i)+'\" aria-label=\"'+esc(b.full+': '+money(b.sum)+', '+ordTxt(b.n))+'\"><i style=\"height:'+(b.sum>0?Math.max(b.sum/top*100,1.5):0)+'%\"></i></button>').join('');\n  const ax=bs.length>2?[bs[0],bs[Math.floor((bs.length-1)/2)],bs[bs.length-1]]:bs;\n  return '<div class=\"rread\" id=\"rread\" aria-live=\"polite\">'+readHTML(bs,S.rep.sel)+'</div>'\n    +'<div class=\"rchart\"><div class=\"ryax\" aria-hidden=\"true\">'+ticks.map(v=>'<span style=\"bottom:'+(v/top*100)+'%\">'+esc(cCompact(v))+'</span>').join('')+'</div>'\n    +'<div class=\"rplot\">'+ticks.map(v=>'<div class=\"rgrid\" style=\"bottom:'+(v/top*100)+'%\"></div>').join('')+'<div class=\"rcols\" role=\"group\" aria-label=\"'+esc(L('Выручка по периодам','Davrlar boʻyicha tushum'))+'\">'+cols+'</div></div></div>'\n    +'<div class=\"rxax\" aria-hidden=\"true\">'+ax.map(b=>'<span>'+esc(b.ax)+'</span>').join('')+'</div>'\n    +'<p class=\"rnote\">'+L('Нажмите на столбец или проведите по графику, чтобы увидеть сумму и число заказов.','Summa va buyurtmalar sonini koʻrish uchun ustunni bosing yoki grafik boʻylab suring.')+'</p>'\n    +'<button type=\"button\" class=\"btn ghost sm rgap\" data-act=\"rtab\" aria-expanded=\"'+S.rep.tab+'\">'+(S.rep.tab?L('Скрыть таблицу','Jadvalni yashirish'):L('Показать таблицей','Jadval sifatida koʻrsatish'))+'</button>'\n    +(S.rep.tab?'<div class=\"rtab\"><table><thead><tr><th>'+L('Период','Davr')+'</th><th>'+L('Заказов','Buyurtma')+'</th><th>'+L('Выручка, сум','Tushum, soʻm')+'</th></tr></thead><tbody>'+bs.map(b=>'<tr><td>'+esc(b.full)+'</td><td>'+b.n+'</td><td>'+num(b.sum)+'</td></tr>').join('')+'</tbody></table></div>':'');\n}\nfunction deltaHTML(cur,prev,r){\n  if(!r.prev)return '';\n  if(!(prev>0))return cur>0?'<small class=\"dl flat\">'+L('в прошлом периоде продаж не было','oldingi davrda sotuv boʻlmagan')+'</small>':'';\n  const p=Math.round((cur-prev)/prev*100),cls=p>0?'up':p<0?'down':'flat',ar=p>0?'▲':p<0?'▼':'•';\n  return '<small class=\"dl '+cls+'\">'+ar+' '+(p>0?'+':'')+p+'% '+L('к прошлому периоду','oldingi davrga nisbatan')+'</small>';\n}\nfunction rankHTML(rows){\n  const mx=Math.max(1,...rows.map(x=>x.v));\n  return '<div class=\"rlist\">'+rows.map(x=>'<div class=\"rrow\"><div class=\"rl\"><b>'+esc(x.t)+'</b>'+(x.s?'<small>'+esc(x.s)+'</small>':'')+'</div><div class=\"rv\">'+esc(money(x.v))+'</div><div class=\"rbar\" aria-hidden=\"true\"><i style=\"width:'+Math.max(2,x.v/mx*100)+'%\"></i></div></div>').join('')+'</div>';\n}\nfunction buyHTML(r){\n  const b=r.buy;\n  let h='<div class=\"card\"><h3>'+L('Что пора закупать','Nimani sotib olish vaqti')+'</h3><div class=\"unit\">'+L('Только товары, по которым ведётся учёт остатков. Смотрим на продажи за последние '+b.window+' дн. и показываем, на сколько дней хватит свободного остатка. Докупить — чтобы хватило на '+b.cover+' дн.','Faqat qoldiq hisobi yuritiladigan mahsulotlar. Oxirgi '+b.window+' kunlik sotuvga qaraymiz va boʻsh qoldiq necha kunga yetishini koʻrsatamiz. Sotib olish — '+b.cover+' kunga yetishi uchun.')+'</div>';\n  if(!b.list.length)return h+'<div class=\"empty\"><b>'+L('Срочного нет','Shoshilinch narsa yoʻq')+'</b>'+L('Запаса хватает больше чем на '+b.cover+' дн. или продаж по этим товарам ещё не было. Учёт остатков включается на вкладке «Остатки».','Zaxira '+b.cover+' kundan koʻpga yetadi yoki bu mahsulotlar sotilmagan. Qoldiq hisobi «Qoldiq» boʻlimida yoqiladi.')+'</div></div>';\n  h+='<div class=\"rlist\">'+b.list.map(x=>{\n    const p=S.prod.items.find(y=>y.id===x.id),left=Number(x.left)||0,wl=p?weightLabel(p):'';\n    const cls=left<=3?'bad':left<=7?'warn':'info',lab=left<1?L('меньше 1 дня','1 kundan kam'):L('хватит на '+Math.floor(left)+' дн.',Math.floor(left)+' kunga yetadi');\n    const pk=p&&x.need>0?packText(p,x.need):'';\n    return '<div class=\"rbuy\"><div class=\"rh\"><b>'+esc(p?nm(p):x.name)+(wl?' <small>'+esc(wl)+'</small>':'')+'</b><span class=\"st '+cls+'\">'+esc(lab)+'</span></div>'\n      +'<small>'+L('Свободно '+num(x.avail)+' шт, продаётся ≈ '+amountStr(x.daily)+' шт в день','Boʻsh '+num(x.avail)+' dona, kuniga ≈ '+amountStr(x.daily)+' dona sotiladi')+'</small>'\n      +(x.need>0?'<small>'+L('Докупить ≈ '+num(x.need)+' шт','Sotib olish ≈ '+num(x.need)+' dona')+(pk?' ('+esc(pk)+')':'')+'</small>':'')+'</div>';\n  }).join('')+'</div></div>';\n  return h;\n}\n/* Комиссия площадки в отчётах дистрибьютора: сколько он должен площадке за этот и прошлый месяц (видна, если процент больше нуля) */\nfunction commHTML(r){\n  const c=r.comm;\n  if(!c||!(c.pct>0||c.cur.cm>0||c.prev.cm>0))return '';\n  const row=(lab,x)=>'<div class=\"r\"><span>'+esc(lab+' ('+mFull(x.m)+')')+'<small class=\"sub\">'+esc(ordTxt(x.n)+' · '+L('товаров на ','mahsulotlar: ')+money(x.base))+'</small></span><span>'+esc(money(x.cm))+'</span></div>';\n  return '<div class=\"card\"><h3>'+L('Комиссия площадки','Platforma komissiyasi')+'</h3><div class=\"unit\">'\n    +L('Площадка берёт '+fmtPct(c.pct)+'% от суммы товаров (после скидки, без доставки) по выданным заказам. Это сумма, которую вы платите площадке за месяц.','Platforma topshirilgan buyurtmalarda mahsulotlar summasidan (chegirmadan keyin, yetkazib berishsiz) '+fmtPct(c.pct)+'% oladi. Bu siz platformaga oylik toʻlaydigan summa.')\n    +'</div><div class=\"sum\">'+row(L('Этот месяц','Shu oy'),c.cur)+row(L('Прошлый месяц','Oʻtgan oy'),c.prev)+'</div></div>';\n}\nfunction repHTML(){\n  const R=S.rep,r=R.data;\n  let h='<div class=\"filters\">'+RP_DAYS.map(d=>'<button type=\"button\" class=\"chip\" data-act=\"rdays\" data-v=\"'+d+'\" aria-pressed=\"'+(R.days===d)+'\">'+esc(rpRange(d))+'</button>').join('')+'</div>';\n  if(!r||r.days!==R.days){\n    if(R.err)return h+'<div class=\"empty\"><b>'+L('Не удалось загрузить отчёт','Hisobotni yuklab boʻlmadi')+'</b>'+L('Проверьте соединение.','Ulanishni tekshiring.')+'<div style=\"margin-top:10px\"><button type=\"button\" class=\"btn sm\" data-act=\"rretry\">'+L('Повторить','Qayta urinish')+'</button></div></div>';\n    return h+'<div class=\"empty\"><b>'+L('Считаем отчёт','Hisobot tayyorlanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  }\n  h+=commHTML(r);\n  h+='<div class=\"xtools\">'+xbtn('report')+'</div>'\n    +'<p class=\"rnote\" style=\"margin:0 0 4px\">'+L('Период: '+fDay(r.from)+' — '+fDay(r.to)+'. В отчёт попадают заказы со статусом «Выдан» или «Доставлен», по дню завершения.','Davr: '+fDay(r.from)+' — '+fDay(r.to)+'. Hisobotga «Topshirildi» yoki «Yetkazildi» holatidagi buyurtmalar kiradi, yakunlangan kun boʻyicha.')+'</p>';\n  if(r.since>r.from)h+='<p class=\"rnote\">'+L('Отчёт ведётся с '+fDay(r.since)+', раньше данных нет.','Hisobot '+fDay(r.since)+' dan yuritiladi, undan oldin maʼlumot yoʻq.')+'</p>';\n  if(r.thin)h+='<p class=\"rnote\">'+L('Данных пока мало: чем дольше работает бот, тем точнее цифры и подсказки.','Maʼlumot hozircha kam: bot qancha uzoq ishlasa, raqamlar va maslahatlar shuncha aniq boʻladi.')+'</p>';\n  if(!r.tot.n){\n    return h+'<div class=\"empty\"><b>'+L('За этот период завершённых заказов нет','Bu davrda yakunlangan buyurtma yoʻq')+'</b>'+L('Заказ попадает в отчёт, когда вы переводите его в «Выдан» или «Доставлен».','Buyurtma «Topshirildi» yoki «Yetkazildi» holatiga oʻtganda hisobotga kiradi.')+'</div>'+buyHTML(r);\n  }\n  const t=r.tot,pv=r.prev||{n:0,sum:0};\n  const kpi=(lab,v,extra)=>'<div class=\"stat rkpi\"><small>'+lab+'</small><b>'+v+'</b>'+(extra||'')+'</div>';\n  h+='<div class=\"stats\">'+kpi(L('Заказов','Buyurtmalar'),t.n,deltaHTML(t.n,pv.n,r))+kpi(L('Выручка','Tushum'),esc(money(t.sum)),deltaHTML(t.sum,pv.sum,r))+kpi(L('Средний заказ','Oʻrtacha buyurtma'),esc(money(t.avg)))+kpi(L('Дано скидок','Berilgan chegirma'),esc(money(t.disc)))+'</div>';\n  h+='<div class=\"card\"><h3>'+(r.days<=30?L('Выручка по дням','Kunlar boʻyicha tushum'):r.days<=90?L('Выручка по неделям','Haftalar boʻyicha tushum'):L('Выручка по месяцам','Oylar boʻyicha tushum'))+'</h3>'+chartHTML(r)+'</div>';\n  const pr=R.allP?r.prods:r.prods.slice(0,8);\n  h+='<div class=\"card\"><h3>'+L('Ходовые товары','Ommabop mahsulotlar')+'</h3><div class=\"unit\">'+L('По выручке за период.','Davr tushumi boʻyicha.')+'</div>'\n    +rankHTML(pr.map(x=>{const p=S.prod.items.find(y=>y.id===x.id),pk=p?packText(p,x.qty):'',w=p?weightLabel(p):'';return {t:p?nm(p):x.name,s:(w?w+' · ':'')+L('продано ','sotildi ')+num(x.qty)+' '+pcsWord()+(pk?' ('+pk+')':''),v:x.sum}}))\n    +(r.prods.length>8?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"rall\">'+(R.allP?L('Свернуть','Yigʻish'):L('Показать все ('+r.prods.length+')','Hammasini koʻrsatish ('+r.prods.length+')'))+'</button>':'')+'</div>';\n  if(r.cl.length)h+='<div class=\"card\"><h3>'+L('Лучшие клиенты','Eng yaxshi mijozlar')+'</h3><div class=\"unit\">'+L('По сумме заказов за период.','Davrdagi buyurtmalar summasi boʻyicha.')+'</div>'\n    +rankHTML(r.cl.map(c=>({t:(c.name||L('Без имени','Nomsiz'))+(c.org?' · '+c.org:''),s:ordTxt(c.n),v:c.sum})))+'</div>';\n  return h+buyHTML(r);\n}\nfunction paintRep(){\n  const b=$('#sbody');\n  if(b&&S.view==='seller'&&S.sellerTab==='reports')b.innerHTML=repHTML();\n}\nasync function loadReport(){\n  if(!S.admin)return;\n  const R=S.rep,days=R.days,seq=++R.seq;\n  R.busy=true;R.err=false;\n  paintRep();\n  const r=await api('GET','/api/admin/report?days='+days);\n  if(seq!==R.seq)return;\n  R.busy=false;\n  if(r.ok&&r.data&&r.data.report){R.data=r.data.report;R.err=false;if(R.sel>=repBuckets(R.data).length)R.sel=-1}\n  else R.err=true;\n  paintRep();\n}\n\n/* ---------- клиент дистрибьютора внутри «Базы» ---------- */\nfunction agoTxt(iso){\n  const t=new Date(iso).getTime();\n  if(isNaN(t))return '';\n  const d=Math.floor((Date.now()-t)/86400000);\n  if(d<=0)return L('сегодня','bugun');\n  if(d===1)return L('вчера','kecha');\n  if(d<60)return L(d+' дн. назад',d+' kun oldin');\n  return jrDate(iso);\n}\n/* дистрибьютор, от имени которого ведутся заметки и заказы: открытый сейчас, а если нет — первый из своих */\nconst baseShop=()=>{const sl=S.hub.me&&S.hub.me.sells||[];return sl.some(x=>x.id===S.did)?S.did:(sl[0]&&sl[0].id)||''};\n/* строка на карточке магазина: заказы у дистрибьютора (у владельца у всех), группа, блокировка, личная заметка */\nfunction baseMineHTML(x){\n  const b=S.base,owner=b.role==='owner',m=x.m,my=x.my||{};\n  const parts=[];\n  if(m){\n    parts.push(L('Заказов: ','Buyurtmalar: ')+num(m.n));\n    if(m.sum)parts.push(L('выдано на ','topshirildi: ')+money(m.sum));\n    if(owner&&m.by&&m.by.length)parts.push(m.by.length>1?L('у '+m.by.length+' дистрибьюторов',m.by.length+' ta distribyutorda'):esc(m.by[0].name));\n    if(m.last)parts.push(L('последний: ','oxirgisi: ')+esc(agoTxt(m.last)));\n  }\n  const head=parts.length?parts.join(' · '):(owner?L('Ещё не заказывал','Hali buyurtma bermagan'):L('У вас ещё не заказывал','Sizdan hali buyurtma bermagan'));\n  const badges=(my.grp?'<span class=\"st info\">'+esc(my.grp)+'</span>':'')+(my.blocked?'<span class=\"st bad\">'+L('Заблокирован','Bloklangan')+'</span>':'');\n  return '<button type=\"button\" class=\"cmine\" data-act=\"cmine\" data-id=\"'+esc(x.id)+'\" aria-label=\"'+esc(L('Карточка клиента: ','Mijoz kartochkasi: ')+x.name+L('. Заметка, группа, блокировка','. Eslatma, guruh, bloklash'))+'\"><span class=\"cmt\"><span>'+head+'</span>'\n    +(badges?'<span class=\"cbadges\">'+badges+'</span>':'')+'</span>'+ICO.chev+'</button>'\n    +(my.note?'<div class=\"bnote\"><b>'+L('Моя заметка: ','Mening eslatmam: ')+'</b>'+esc(my.note)+'</div>':'');\n}\nconst groupSuggest=()=>[...new Set(S.base.items.map(x=>x.my&&x.my.grp).filter(Boolean).concat([L('Магазин','Doʻkon'),L('Кафе','Kafe'),L('Столовая','Oshxona')]))];\nfunction cardOrdersHTML(d){\n  const list=d.orders||[],owner=S.base.role==='owner';\n  if(!list.length)return '<div class=\"unit\">'+L('Заказов пока нет.','Hozircha buyurtma yoʻq.')+'</div>';\n  return list.slice(0,15).map(o=>'<div class=\"corder\"><span class=\"oid\">'+esc(o.id)+'</span><span class=\"cs\">'+pill(o)+'<span>'+esc(jrDate(o.createdAt))+'</span></span><b>'+money(o.total)+'</b>'+(owner&&o.shopName?'<small class=\"cshop\">'+esc(o.shopName)+'</small>':'')+'</div>').join('')\n    +(list.length>15?'<div class=\"unit\" style=\"padding-top:6px\">'+L('… и ещё '+(list.length-15),'… va yana '+(list.length-15)+' ta')+'</div>':'');\n}\n/* нижняя панель клиента */\nfunction clientSheetHTML(){\n  const b=S.base,x=b.cx||{},d=b.cdd||{},f=b.cf||{},owner=b.role==='owner';\n  const phone=String(x.phone||'').replace(/[^\\d+]/g,''),tgu=d.my&&d.my.tg;\n  let body='';\n  if(d.err)body='<div class=\"empty\"><b>'+L('Не удалось загрузить','Yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"justify-content:center;margin-bottom:14px\"><button type=\"button\" class=\"btn\" data-act=\"cretry\">'+L('Повторить','Qayta urinish')+'</button></div>';\n  else if(!d.loaded)body='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else{\n    const m=d.m||{n:0,ds:0,sum:0,last:''},my=d.my||{};\n    body+='<div class=\"cact\">'+(phone?'<a class=\"btn ghost sm\" href=\"tel:'+esc(phone)+'\">'+L('Позвонить','Qoʻngʻiroq')+'</a>':'')+(tgu?'<a class=\"btn ghost sm\" data-act=\"contact\" href=\"https://t.me/'+encodeURIComponent(tgu)+'\" target=\"_blank\" rel=\"noopener\">Telegram</a>':'')+'</div>';\n    body+='<div class=\"cst\"><div><small>'+(owner?L('Заказов у всех','Hammasida buyurtma'):L('Заказов у вас','Sizda buyurtma'))+'</small><b>'+num(m.n)+'</b></div><div><small>'+L('Выдано на','Topshirildi')+'</small><b>'+money(m.sum)+'</b></div><div><small>'+L('Последний','Oxirgisi')+'</small><b>'+(m.last?esc(agoTxt(m.last)):'—')+'</b></div></div>';\n    if(owner&&m.by&&m.by.length)body+='<div class=\"csec\"><h3>'+L('По дистрибьюторам','Distribyutorlar boʻyicha')+'</h3>'+m.by.map(y=>'<div class=\"corder\"><span class=\"oid\">'+esc(y.name||y.did)+'</span><b>'+L('заказов: ','buyurtma: ')+num(y.n)+(y.sum?' · '+money(y.sum):'')+'</b></div>').join('')+'</div>';\n    if(baseShop())body+='<div class=\"csec form\"><div class=\"full\"><label class=\"lab\" for=\"cf-grp\">'+L('Группа','Guruh')+'</label><input type=\"text\" id=\"cf-grp\" data-cf=\"grp\" maxlength=\"30\" value=\"'+esc(f.grp)+'\" placeholder=\"'+esc(L('Например: Магазин','Masalan: Doʻkon'))+'\" autocomplete=\"off\"><div class=\"gchips\">'+groupSuggest().map(g=>'<button type=\"button\" class=\"chip\" data-act=\"cgrp\" data-v=\"'+esc(g)+'\">'+esc(g)+'</button>').join('')+'</div></div>'\n      +'<div class=\"full\"><label class=\"lab\" for=\"cf-note\">'+L('Заметка (видна только вам)','Eslatma (faqat sizga koʻrinadi)')+'</label><textarea id=\"cf-note\" data-cf=\"note\" rows=\"3\" maxlength=\"500\" placeholder=\"'+esc(L('Например: платит в конце недели','Masalan: hafta oxirida toʻlaydi'))+'\">'+esc(f.note)+'</textarea></div>'\n      +'<div class=\"full\"><label class=\"ck\"><input type=\"checkbox\" id=\"cf-blocked\" data-cf=\"blocked\"'+(f.blocked?' checked':'')+(my.has?'':' disabled')+'><span>'+L('Заблокировать','Bloklash')+'<small>'+(my.has?L('Магазин не сможет оформить заказ у вас, пока вы не снимете блокировку. У других дистрибьюторов он заказывает как раньше.','Siz blokni olmaguningizcha doʻkon sizdan buyurtma bera olmaydi. Boshqa distribyutorlarda avvalgidek buyurtma beradi.'):L('Доступно, когда магазин закажет у вас или заполнит профиль в вашем каталоге.','Doʻkon sizdan buyurtma berganda yoki katalogingizda profilini toʻldirganda mavjud boʻladi.'))+'</small></span></label></div></div>';\n    body+='<div class=\"csec\"><h3>'+(owner?L('История заказов у всех дистрибьюторов','Barcha distribyutorlardagi buyurtmalar tarixi'):L('История заказов','Buyurtmalar tarixi'))+'</h3>'+cardOrdersHTML(d)+'</div>';\n  }\n  const sub=[x.addr,terrName(x.terr)].filter(Boolean).map(esc).join(' · ');\n  return '<div class=\"fs-bg\" data-act=\"bsheetx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(x.name||'')+'\"><div class=\"fs-grab\"></div>'\n    +'<div class=\"fs-head\"><h2>'+esc(x.name||'')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"bsheetx\">'+L('Закрыть','Yopish')+'</button></div><div class=\"fs-body\">'\n    +(sub?'<div class=\"dmeta\" style=\"margin:0 0 10px\">'+sub+'</div>':'')+(x.phone?'<div class=\"dmeta\" style=\"margin:0 0 10px\">'+esc(x.phone)+'</div>':'')+body+'</div>'\n    +(d.loaded&&baseShop()?'<div class=\"fs-foot\"><button type=\"button\" class=\"btn\" data-act=\"csave\"'+(b.cbusy?' disabled':'')+'>'+(b.cbusy?L('Сохраняем…','Saqlanmoqda…'):L('Сохранить','Saqlash'))+'</button></div>':'')+'</div>';\n}\nasync function clientCardOpen(id){\n  const b=S.base,x=b.items.find(y=>y.id===id)||(b.cx&&b.cx.id===id?b.cx:null);\n  if(!x)return;\n  const seq=++b.cseq;\n  Object.assign(b,{cd:id,cx:x,cdd:{loaded:false,err:false},cf:null,cbusy:false,sheet:false,legend:false});\n  paintSheet();\n  const r=await api('GET','/api/hub/base/'+encodeURIComponent(id)+'/mine?sh='+encodeURIComponent(baseShop()));\n  if(seq!==b.cseq||b.cd!==id)return;\n  if(!r.ok||!r.data){b.cdd={loaded:false,err:true};paintSheet();return}\n  b.cdd=Object.assign({loaded:true,err:false},r.data);\n  const my=r.data.my||{};\n  b.cf={note:my.note||'',grp:my.grp||'',blocked:!!my.blocked};\n  paintSheet();\n}\nfunction clientCardClose(){\n  const b=S.base;\n  b.cseq++;\n  Object.assign(b,{cd:'',cx:null,cdd:null,cf:null,cbusy:false,sheet:false,legend:false});\n  paintSheet();\n}\nasync function clientCardSave(){\n  const b=S.base,id=b.cd,f=b.cf,d=b.cdd;\n  if(!id||!f||!d||!d.loaded||b.cbusy)return;\n  const body={sh:baseShop(),note:String(f.note||'').trim(),grp:String(f.grp||'').trim()};\n  if(d.my&&d.my.has)body.blocked=!!f.blocked;\n  b.cbusy=true;paintSheet();\n  const r=await api('PUT','/api/hub/base/'+encodeURIComponent(id)+'/mine',body);\n  b.cbusy=false;\n  if(!r.ok||!r.data||!r.data.my){toast(baseErr(r.data&&r.data.error));paintSheet();return}\n  const x=b.items.find(y=>y.id===id);\n  if(x)x.my=Object.assign({},x.my,r.data.my);\n  toast(L('Сохранено','Saqlandi'));\n  clientCardClose();\n  paintBase();\n}\n\n/* ---------- аналитика продаж (владелец площадки) ---------- */\nconst AN_TABS=()=>[['cats',L('Категории','Kategoriyalar')],['prods',L('Товары','Mahsulotlar')],['stores',L('Магазины','Doʻkonlar')]];\nconst anCatName=c=>c.name?L(c.name,c.uz||c.name):L('Без категории','Kategoriyasiz');\n/* «заказов» по товару и категории считаются не за все дни: у прежних дней остаётся прочерк */\nconst anN=(d,n)=>n>0||!d.partial?num(n):'—';\nconst anSort=rows=>rows.slice().sort((a,b)=>S.an.sort==='n'?(b.n-a.n||b.sum-a.sum):(b.sum-a.sum||b.n-a.n));\nfunction anListHTML(d){\n  const A=S.an,one=!!d.sh,pc=pcsWord();\n  let rows,total;\n  if(A.tab==='cats'){\n    const all=d.cats.reduce((s,c)=>s+c.sum,0)||1;\n    rows=anSort(d.cats).map(c=>({t:anCatName(c),s:L('заказов: '+anN(d,c.n)+' · продано '+num(c.qty)+' '+pc+' · доля '+Math.round(c.sum/all*100)+'%','buyurtma: '+anN(d,c.n)+' · sotildi '+num(c.qty)+' '+pc+' · ulushi '+Math.round(c.sum/all*100)+'%'),v:c.sum}));\n    total=rows.length;\n  }else if(A.tab==='prods'){\n    rows=anSort(d.prods).map(p=>({t:p.name,s:(one?'':p.shopName+' · ')+L('заказов: '+anN(d,p.n)+' · продано '+num(p.qty)+' '+pc,'buyurtma: '+anN(d,p.n)+' · sotildi '+num(p.qty)+' '+pc),v:p.sum}));\n    total=d.nprods;\n  }else{\n    rows=anSort(d.stores).map(x=>({t:x.name||L('Без имени','Nomsiz'),s:L('заказов: '+num(x.n)+(one?'':' · дистрибьюторов: '+x.nd)+' · последний: '+fDay(x.last),'buyurtma: '+num(x.n)+(one?'':' · distribyutorlar: '+x.nd)+' · oxirgisi: '+fDay(x.last)),v:x.sum}));\n    total=d.nstores;\n  }\n  const show=A.all?rows:rows.slice(0,20);\n  return (rows.length?rankHTML(show):'<div class=\"unit\">'+L('Нет данных.','Maʼlumot yoʻq.')+'</div>')\n    +(rows.length>20?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"anall\">'+(A.all?L('Свернуть','Yigʻish'):L('Показать все ('+rows.length+')','Hammasini koʻrsatish ('+rows.length+')'))+'</button>':'')\n    +(total>rows.length?'<p class=\"rnote\">'+L('Показаны первые '+rows.length+' из '+total+' по сумме.','Summa boʻyicha dastlabki '+rows.length+' ta koʻrsatilgan (jami '+total+').')+'</p>':'');\n}\nfunction renderAnalytics(){\n  const A=S.an,d=A.data,fresh=d&&d.days===A.days&&d.sh===A.sh;\n  const shops=(d&&d.shops)||A.shops;\n  let h='<div class=\"wrap page anp\"><div class=\"hrow\"><div><div class=\"eyebrow\">'+L('Только выданные и доставленные заказы','Faqat topshirilgan va yetkazilgan buyurtmalar')+'</div><h1>'+L('Аналитика','Tahlil')+'</h1></div></div>';\n  h+='<div class=\"filters\">'+RP_DAYS.map(x=>'<button type=\"button\" class=\"chip\" data-act=\"adays\" data-v=\"'+x+'\" aria-pressed=\"'+(A.days===x)+'\">'+esc(rpRange(x))+'</button>').join('')+'</div>';\n  h+='<div class=\"filters\"><div class=\"chip selc'+(A.sh?' on':'')+'\"><span>'+esc(A.sh?((shops.find(x=>x.id===A.sh)||{}).name||''):L('Все дистрибьюторы','Barcha distribyutorlar'))+'</span>'+ICO.chev\n    +'<select data-ash=\"1\" aria-label=\"'+esc(L('Дистрибьютор','Distribyutor'))+'\"><option value=\"\"'+(A.sh?'':' selected')+'>'+esc(L('Все дистрибьюторы','Barcha distribyutorlar'))+'</option>'+shops.map(x=>'<option value=\"'+esc(x.id)+'\"'+(A.sh===x.id?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></div></div>';\n  if(!fresh){\n    h+=A.err?'<div class=\"empty\"><b>'+L('Не удалось загрузить аналитику','Tahlilni yuklab boʻlmadi')+'</b>'+L('Проверьте соединение.','Ulanishni tekshiring.')+'<div style=\"margin-top:10px\"><button type=\"button\" class=\"btn sm\" data-act=\"anretry\">'+L('Повторить','Qayta urinish')+'</button></div></div>'\n      :'<div class=\"empty\"><b>'+L('Считаем продажи','Sotuvlar hisoblanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n    view.innerHTML=h+'</div>';\n    return;\n  }\n  h+='<p class=\"rnote\" style=\"margin:0 0 4px\">'+L('Период: '+fDay(d.from)+' — '+fDay(d.to)+', по дню выдачи заказа.','Davr: '+fDay(d.from)+' — '+fDay(d.to)+', buyurtma topshirilgan kun boʻyicha.')+'</p>';\n  if(d.since&&d.since>d.from)h+='<p class=\"rnote\">'+L('Учёт продаж ведётся с '+fDay(d.since)+', раньше данных нет.','Sotuvlar hisobi '+fDay(d.since)+' dan yuritiladi, undan oldin maʼlumot yoʻq.')+'</p>';\n  if(d.failed)h+='<p class=\"rnote\" style=\"color:var(--bad)\">'+L('Не удалось получить данные у дистрибьюторов: '+d.failed+'. Цифры неполные.','Distribyutorlardan maʼlumot olinmadi: '+d.failed+'. Raqamlar toʻliq emas.')+'</p>';\n  if(!d.tot.n){\n    view.innerHTML=h+'<div class=\"empty\"><b>'+L('За этот период выданных заказов нет','Bu davrda topshirilgan buyurtma yoʻq')+'</b>'+L('Заказ попадает в аналитику, когда дистрибьютор переводит его в «Выдан» или «Доставлен».','Buyurtma distribyutor uni «Topshirildi» yoki «Yetkazildi» ga oʻtkazganda tahlilga tushadi.')+'</div></div>';\n    return;\n  }\n  const t=d.tot,kpi=(lab,v)=>'<div class=\"stat rkpi\"><small>'+lab+'</small><b>'+v+'</b></div>';\n  h+='<div class=\"stats\">'+kpi(L('Заказов','Buyurtmalar'),num(t.n))+kpi(L('Выручка','Tushum'),esc(money(t.sum)))+kpi(L('Магазинов','Doʻkonlar'),num(t.stores))+(d.sh?kpi(L('Средний заказ','Oʻrtacha buyurtma'),esc(money(Math.round(t.sum/t.n)))):kpi(L('Дистрибьюторов','Distribyutorlar'),num(t.shops)))+'</div>';\n  const cnt={cats:d.cats.length,prods:d.nprods,stores:d.nstores};\n  h+='<div class=\"seg s3\" role=\"group\" aria-label=\"'+esc(L('Раздел','Boʻlim'))+'\">'+AN_TABS().map(x=>'<button type=\"button\" data-act=\"antab\" data-v=\"'+x[0]+'\" aria-pressed=\"'+(A.tab===x[0])+'\"><span>'+x[1]+'</span><b class=\"cnt\">'+num(cnt[x[0]])+'</b></button>').join('')+'</div>';\n  h+='<div class=\"card\"><div class=\"filters\" style=\"margin-bottom:6px\"><button type=\"button\" class=\"chip\" data-act=\"ansort\" data-v=\"sum\" aria-pressed=\"'+(A.sort==='sum')+'\">'+L('По сумме','Summa boʻyicha')+'</button><button type=\"button\" class=\"chip\" data-act=\"ansort\" data-v=\"n\" aria-pressed=\"'+(A.sort==='n')+'\">'+L('По заказам','Buyurtma boʻyicha')+'</button></div>'+anListHTML(d)+'</div>';\n  if(d.partial&&A.tab!=='stores')h+='<p class=\"rnote\">'+L('Число заказов по товарам и категориям считается только за дни, когда этот счёт уже шёл. За более ранние дни показаны штуки и суммы, а заказов там «—» или меньше, чем было.','Mahsulot va kategoriyalar boʻyicha buyurtmalar soni faqat bu hisob yuritilgan kunlar uchun hisoblanadi. Oldingi kunlar uchun dona va summa koʻrsatilgan, buyurtmalar esa «—» yoki haqiqatdagidan kam.')+'</p>';\n  h+='<p class=\"rnote\">'+(A.tab==='stores'?L('Сумма магазина — сколько он заплатил за выданные заказы (со скидкой и доставкой).','Doʻkon summasi — topshirilgan buyurtmalar uchun toʻlagan puli (chegirma va yetkazib berish bilan).'):L('Суммы товаров и категорий считаются по ценам в заказах, до скидки на весь заказ. Заказ с товарами из разных категорий учитывается в каждой из них. Категория — та, что была у товара в день продажи.','Mahsulot va kategoriyalar summasi buyurtmadagi narxlar boʻyicha, butun buyurtmaga chegirmagacha hisoblanadi. Turli kategoriyadagi mahsulotli buyurtma har bir kategoriyada hisobga olinadi. Kategoriya — mahsulot sotilgan kundagi kategoriya.'))+'</p>';\n  view.innerHTML=h+'</div>';\n}\nasync function loadAnalytics(){\n  if(!isOwner())return;\n  const A=S.an,seq=++A.seq;\n  A.err=false;\n  if(S.view==='analytics')renderAnalytics();\n  const r=await api('GET','/api/hub/admin/analytics?days='+A.days+'&sh='+encodeURIComponent(A.sh));\n  if(seq!==A.seq)return;\n  if(!r.ok||!r.data||!r.data.tot){A.err=true;if(S.view==='analytics')renderAnalytics();return}\n  A.data=r.data;A.shops=r.data.shops||A.shops;\n  if(r.data.sh!==A.sh)A.sh=r.data.sh;   // такого дистрибьютора нет: показаны все\n  if(S.view==='analytics')renderAnalytics();\n}\n\n/* Сжимает фото на телефоне: JPEG, длинная сторона ~800 px, до ~280 КБ. */\nasync function shrinkPhoto(file){\n  const url=URL.createObjectURL(file);\n  try{\n    const img=await new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=url});\n    const w=img.naturalWidth,h=img.naturalHeight;\n    if(!w||!h)return null;\n    let k=Math.min(1,800/Math.max(w,h));\n    for(let attempt=0;attempt<4;attempt++){\n      const cw=Math.max(64,Math.round(w*k)),ch=Math.max(64,Math.round(h*k));\n      const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;\n      const g=cv.getContext('2d');g.fillStyle='#FFFFFF';g.fillRect(0,0,cw,ch);g.drawImage(img,0,0,cw,ch);\n      for(const q of [0.82,0.7,0.58]){\n        const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',q));\n        if(blob&&blob.size<=280000)return blob;\n      }\n      k*=0.8;\n    }\n    return null;\n  }finally{URL.revokeObjectURL(url)}\n}\nasync function apiBin(method,path,blob,ctype){\n  const ep=S.epoch;\n  if(!S.did)return {ok:false,status:0,data:null,stale:true};\n  try{\n    const h={'content-type':ctype||'image/jpeg','x-shop':S.did};\n    if(S.initData)h['x-init-data']=S.initData;\n    const r=await fetch(path,{method,headers:h,body:blob,cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    if(S.epoch!==ep)return {ok:false,status:0,data:null,stale:true};\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\nfunction setPhotoVers(p,d){p.pv=d&&d.pv||'';p.pv2=d&&d.pv2||'';p.pv3=d&&d.pv3||''}\nasync function uploadPhoto(id,file,n){\n  if(!S.auth||!S.admin||S.upl[id])return;\n  const p=S.prod.items.find(x=>x.id===id);if(!p)return;\n  n=Math.max(1,Math.min(PH_MAX,Number(n)||1));\n  n=Math.min(n,phVers(p).length+1);          // фото идут подряд: следующее — сразу за последним\n  S.upl[id]=n;paintPhoto(id);\n  let ok=false;\n  try{\n    await flushSave();   // товар должен уже быть на сервере, иначе фото некуда привязать\n    const blob=await shrinkPhoto(file);\n    if(blob){\n      const r=await apiBin('PUT','/api/admin/photo/'+encodeURIComponent(id)+'?n='+n,blob);\n      if(r.ok&&r.data){setPhotoVers(p,r.data);ok=true}\n    }\n  }catch(e){}\n  delete S.upl[id];paintPhoto(id);\n  toast(ok?L('Фото сохранено','Rasm saqlandi'):L('Не удалось загрузить фото. Попробуйте другое изображение.','Rasmni yuklab boʻlmadi. Boshqa rasm tanlang.'));\n}\nasync function removePhoto(id,n){\n  const p=S.prod.items.find(x=>x.id===id);if(!p||S.upl[id])return;\n  n=Math.max(1,Math.min(PH_MAX,Number(n)||1));\n  S.upl[id]=n;paintPhoto(id);\n  const r=await api('DELETE','/api/admin/photo/'+encodeURIComponent(id)+'?n='+n);\n  if(r.ok&&r.data)setPhotoVers(p,r.data);\n  delete S.upl[id];paintPhoto(id);\n  if(!r.ok)toast(L('Не удалось убрать фото','Rasmni olib tashlab boʻlmadi'));\n}\n\n/* просмотр фото на весь экран: свайп между фото, × / касание тёмного поля / Esc / «Назад» в Telegram закрывают */\nfunction lbBack(){closeViewer()}\nfunction openViewer(id,pp,did){\n  const p=pp||S.prod.items.find(x=>x.id===id);if(!p)return;\n  const vs=phVers(p);if(!vs.length)return;\n  closeViewer();\n  const el=document.createElement('div');el.id='lb';el.className='lb';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',nm(p));\n  const many=vs.length>1;\n  el.innerHTML='<div class=\"lb-top\"><span class=\"lb-cnt\" id=\"lb-cnt\" aria-live=\"polite\">'+(many?'1 / '+vs.length:'')+'</span><button type=\"button\" class=\"lb-x\" data-act=\"lbclose\" aria-label=\"'+esc(L('Закрыть','Yopish'))+'\">×</button></div>'\n    +'<div class=\"lb-track\" id=\"lb-track\">'+vs.map((v,i)=>'<div class=\"lb-slide\" data-act=\"lbbg\"><img src=\"'+imgUrl(p,i+1,did)+'\" alt=\"'+esc(nm(p))+'\" decoding=\"async\" draggable=\"false\"></div>').join('')+'</div>'\n    +(many?'<div class=\"lb-dots\" id=\"lb-dots\">'+vs.map((v,i)=>'<i'+(i?'':' class=\"on\"')+'></i>').join('')+'</div>':'');\n  document.body.appendChild(el);\n  document.documentElement.classList.add('lb-open');\n  const tr=el.querySelector('#lb-track');let raf=0;\n  tr.addEventListener('scroll',()=>{\n    if(raf)return;\n    raf=requestAnimationFrame(()=>{\n      raf=0;\n      const i=Math.max(0,Math.min(vs.length-1,Math.round(tr.scrollLeft/(tr.clientWidth||1))));\n      const c=el.querySelector('#lb-cnt');if(c&&many)c.textContent=(i+1)+' / '+vs.length;\n      el.querySelectorAll('#lb-dots i').forEach((d,k)=>d.classList.toggle('on',k===i));\n    });\n  },{passive:true});\n  try{if(S.tg&&S.tg.BackButton&&S.tg.isVersionAtLeast&&S.tg.isVersionAtLeast('6.1')){S.tg.BackButton.onClick(lbBack);S.tg.BackButton.show();S.lbTg=true}}catch(e){}\n}\nfunction closeViewer(){\n  const el=document.getElementById('lb');\n  if(el)el.remove();\n  document.documentElement.classList.remove('lb-open');\n  if(S.lbTg){S.lbTg=false;try{S.tg.BackButton.offClick(lbBack);S.tg.BackButton.hide()}catch(e){}}\n}\ndocument.addEventListener('keydown',e=>{\n  const el=document.getElementById('lb');if(!el)return;\n  if(e.key==='Escape')closeViewer();\n  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const tr=el.querySelector('#lb-track');if(tr)tr.scrollBy({left:(e.key==='ArrowRight'?1:-1)*tr.clientWidth,behavior:'smooth'})}\n});\n\n/* скидка на заказ: до трёх строк «от суммы — %» */\nfunction discEditHTML(){\n  const d=S.cfg.shop.discounts||[];\n  const rows=[0,1,2].map(i=>{\n    const x=d[i]||{};\n    return '<div class=\"trow\"><span>'+L('от','dan')+'</span><input type=\"number\" id=\"sdf-'+i+'\" data-sd=\"from\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"1\" max=\"1000000000\" step=\"1000\" value=\"'+(x.from||'')+'\" placeholder=\"'+(i===0?'500000':'')+'\" aria-label=\"'+esc(L('Скидка '+(i+1)+': от какой суммы, сум','Chegirma '+(i+1)+': qaysi summadan, soʻm'))+'\">'\n      +'<span>'+L('сум — скидка','soʻm — chegirma')+'</span><input type=\"number\" id=\"sdp-'+i+'\" data-sd=\"pct\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"1\" max=\"50\" step=\"1\" value=\"'+(x.pct||'')+'\" aria-label=\"'+esc(L('Скидка '+(i+1)+': процент','Chegirma '+(i+1)+': foiz'))+'\"><span>%</span></div>';\n  }).join('');\n  return '<div class=\"full\"><span class=\"lab\">'+L('Скидка на заказ от суммы','Buyurtma summasiga qarab chegirma')+'</span><div class=\"tiers\" id=\"sdisc\">'+rows+'</div><div class=\"err\" id=\"sdw\" role=\"status\"></div>'\n    +'<div class=\"note\">'+L('Считается от суммы товаров (уже с ценами по ступеням) и показывается клиенту отдельной строкой. На минимальную сумму заказа и порог бесплатной доставки скидка не влияет: они считаются по сумме до скидки. Процент от 1 до 50, он должен расти вместе с суммой.','Mahsulotlar summasidan (pogʻona narxlarida) hisoblanadi va mijozga alohida qatorda koʻrsatiladi. Minimal buyurtma summasiga va bepul yetkazish chegarasiga chegirma taʼsir qilmaydi: ular chegirmagacha boʻlgan summa boʻyicha hisoblanadi. Foiz 1 dan 50 gacha, summa oshgani sari oshishi kerak.')+'</div></div>';\n}\nfunction syncDisc(){\n  const rows=[];\n  for(let i=0;i<3;i++){\n    const a=document.getElementById('sdf-'+i),b=document.getElementById('sdp-'+i);\n    const f=a?String(a.value).trim():'',pc=b?String(b.value).trim():'';\n    if(f!==''&&pc!=='')rows.push({from:Number(f),pct:Number(pc)});\n  }\n  const ok=cleanDiscounts(rows);\n  S.cfg.shop.discounts=ok;\n  const w=document.getElementById('sdw');\n  if(w)w.textContent=ok.length<rows.length?L('Одна из строк не учтена: сумма и процент должны расти от строки к строке.','Qatorlardan biri hisobga olinmadi: summa va foiz qatordan qatorga oshib borishi kerak.')\n    :rows.some(r=>Math.round(r.pct)>50)?L('Скидка не больше 50%.','Chegirma 50% dan oshmasligi kerak.'):'';\n  queueSave();\n}\nfunction sellLinkHTML(){\n  const l=sellLink();\n  if(!l)return '';\n  return '<div class=\"card\"><h3>'+L('Ссылка для клиентов','Mijozlar uchun havola')+'</h3><div class=\"unit\">'+L('Отправьте её клиентам: она сразу открывает ваш каталог в боте.','Uni mijozlarga yuboring: u botda darhol katalogingizni ochadi.')+'</div>'\n    +'<div class=\"mono small\">'+esc(l)+'</div><div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn ghost\" data-act=\"copy\" data-v=\"'+esc(l)+'\" data-ok=\"'+esc(L('Ссылка скопирована','Havola nusxalandi'))+'\" data-lab=\"\">'+L('Копировать ссылку','Havolani nusxalash')+'</button></div></div>';\n}\n/* Куда дистрибьютор доставляет и где его склад. Самовывоз доступен всем, ограничивается только доставка. */\nfunction regionsEditHTML(){\n  const s=S.cfg.shop,z=cleanRegions(s.regions),only=S.regOnly===null?z.length>0:S.regOnly;\n  return '<div class=\"full\"><div class=\"lab\">'+L('Куда вы доставляете','Qayerga yetkazib berasiz')+'</div>'\n    +'<label class=\"chk\"><input type=\"checkbox\" id=\"s-regonly\" data-s=\"regonly\"'+(only?' checked':'')+'> '+L('Доставляю только в отмеченные регионы','Faqat belgilangan hududlarga yetkazaman')+'</label>'\n    +'<div class=\"regs\" id=\"regbox\"'+(only?'':' hidden')+'>'+REGIONS.map(r=>'<label class=\"chk\"><input type=\"checkbox\" data-sreg=\"'+r.id+'\"'+(z.includes(r.id)?' checked':'')+'> '+esc(regionName(r.id))+'</label>').join('')+'</div>'\n    +'<div class=\"note\" style=\"margin-top:8px\">'+L('Магазин из неотмеченного региона не сможет заказать доставку, но самовывоз ему доступен. Если не отметить ни одного региона, доставка будет по всей стране.','Belgilanmagan hududdagi doʻkon yetkazib berishni tanlay olmaydi, lekin olib ketish unga ochiq. Birorta hudud belgilanmasa, yetkazib berish butun mamlakat boʻylab boʻladi.')+'</div>'\n    +'<div style=\"margin-top:12px\"><label class=\"lab\" for=\"s-home\">'+L('Регион вашего склада (где самовывоз)','Omboringiz hududi (olib ketish joyi)')+'</label><select id=\"s-home\" data-s=\"home\"><option value=\"\">'+L('Не указывать','Koʻrsatilmasin')+'</option>'\n    +REGIONS.map(r=>'<option value=\"'+r.id+'\"'+(s.home===r.id?' selected':'')+'>'+esc(regionName(r.id))+'</option>').join('')+'</select>'\n    +'<div class=\"unit\">'+L('Магазины этого региона увидят вас в списке первыми, даже если вы туда не доставляете.','Shu hududdagi doʻkonlar sizni roʻyxatda birinchi koʻradi, hatto yetkazib bermasangiz ham.')+'</div></div></div>';\n}\nfunction settingsHTML(){\n  const s=S.cfg.shop;\n  const num=(id,lab,k,min,max)=>'<div><label class=\"lab\" for=\"s-'+id+'\">'+lab+'</label><input type=\"number\" id=\"s-'+id+'\" inputmode=\"numeric\" min=\"'+min+'\" max=\"'+max+'\" data-s=\"'+k+'\" value=\"'+esc(s[k])+'\"></div>';\n  return '<div class=\"savebar\" id=\"savebar\"></div><div class=\"card\"><div class=\"settings\">'\n    +'<div><label class=\"lab\" for=\"s-name\">'+L('Название компании','Kompaniya nomi')+'</label><input type=\"text\" id=\"s-name\" data-s=\"name\" value=\"'+esc(s.name)+'\" maxlength=\"60\"></div>'\n    +'<div><label class=\"lab\" for=\"s-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"s-phone\" data-s=\"phone\" value=\"'+esc(s.phone)+'\" placeholder=\"+998 …\"></div>'\n    +'<div><label class=\"lab\" for=\"s-tg\">'+L('Telegram для вопросов по заказу, без @','Buyurtma savollari uchun Telegram, @ belgisisiz')+'</label><input type=\"text\" id=\"s-tg\" data-s=\"telegram\" value=\"'+esc(s.telegram)+'\"></div>'\n    +'<div></div>'\n    +'<div><label class=\"lab\" for=\"s-addr\">'+L('Адрес самовывоза (по-русски)','Olib ketish manzili (ruscha)')+'</label><input type=\"text\" id=\"s-addr\" data-s=\"address\" value=\"'+esc(s.address)+'\"></div>'\n    +'<div><label class=\"lab\" for=\"s-addruz\">'+L('Адрес самовывоза (по-узбекски)','Olib ketish manzili (oʻzbekcha)')+'</label><input type=\"text\" id=\"s-addruz\" data-s=\"addressUz\" value=\"'+esc(s.addressUz)+'\"></div>'\n    +'<div class=\"full\"><label class=\"chk\"><input type=\"checkbox\" id=\"s-delivery\" data-s=\"delivery\"'+(s.delivery!==false?' checked':'')+'> '+L('Доставка по адресу включена','Manzilga yetkazib berish yoqilgan')+'</label></div>'\n    +num('lead',L('Самовывоз: заказ за, часов минимум','Olib ketish: buyurtma, kamida soat'),'leadHours',0,240)\n    +num('dlead',L('Доставка: заказ за, часов минимум','Yetkazib berish: buyurtma, kamida soat'),'deliveryLeadHours',0,240)\n    +num('minorder',L('Минимальная сумма заказа, сум (0 — без минимума)','Buyurtmaning minimal summasi, soʻm (0 — cheklovsiz)'),'minOrder',0,1000000000)\n    +num('dfee',L('Стоимость доставки, сум (0 — бесплатно)','Yetkazib berish narxi, soʻm (0 — bepul)'),'deliveryFee',0,1000000000)\n    +num('dfree',L('Доставка бесплатна от суммы, сум (0 — нет порога)','Yetkazib berish bepul boʻladigan summa, soʻm (0 — chegarasiz)'),'freeDeliveryFrom',0,1000000000)\n    +'<div class=\"full\"><div class=\"note\">'+L('Минимальная сумма считается по товарам и действует и на самовывоз, и на доставку. Стоимость доставки добавляется к заказу только при доставке; если указан порог, при сумме товаров от него доставка бесплатна.','Minimal summa mahsulotlar boʻyicha hisoblanadi va olib ketishga ham, yetkazib berishga ham taalluqli. Yetkazib berish narxi faqat yetkazishda qoʻshiladi; chegara koʻrsatilsa, mahsulotlar shu summadan oshganda yetkazish bepul.')+'</div></div>'\n    +(regionsOn()?regionsEditHTML():'')\n    +discEditHTML()\n    +num('from',L('Время работы с, часов','Ish vaqti: dan, soat'),'openFrom',0,22)\n    +num('to',L('Время работы до, часов','Ish vaqti: gacha, soat'),'openTo',1,23)\n    +'</div></div>'\n    +sellLinkHTML()\n    +'<div class=\"card\"><h3>'+L('Резервная копия','Zaxira nusxasi')+'</h3><div class=\"unit\">'+L('Один файл со всем: настройки, каталог с фото, остатки, заказы и клиенты. Он придёт вам в чат с ботом. Храните его в надёжном месте: в нём телефоны и адреса клиентов. Токен бота и код продавца в файл не попадают.','Hammasi bitta faylda: sozlamalar, rasmli katalog, qoldiqlar, buyurtmalar va mijozlar. U botdagi chatingizga keladi. Uni ishonchli joyda saqlang: unda mijozlarning telefon va manzillari bor. Bot tokeni va sotuvchi kodi faylga kirmaydi.')+'</div>'+xbtn('backup')+'</div>';\n}\nfunction paintSave(){\n  const el=$('#savebar');if(!el)return;\n  const t={\n    saving:L('Сохраняем…','Saqlanmoqda…'),\n    saved:L('Сохранено, клиенты видят изменения','Saqlandi, mijozlar oʻzgarishlarni koʻradi'),\n    error:L('Не удалось сохранить. Проверьте соединение и измените что-нибудь ещё раз.','Saqlab boʻlmadi. Ulanishni tekshiring va yana biror narsani oʻzgartiring.'),\n    nodb:L('Изменения не сохраняются: нет доступа к хранилищу.','Oʻzgarishlar saqlanmaydi: ombor mavjud emas.')\n  }[S.saveState]||'';\n  el.textContent=t;el.className='savebar'+(S.saveState==='error'||S.saveState==='nodb'?' bad':'');\n}\nfunction queueSave(kind){\n  if(kind==='prod')S.dirtyP=true;else S.dirtyC=true;\n  S.dirty=true;\n  if(!S.auth||!S.admin){S.saveState='nodb';paintSave();return}\n  S.saveState='saving';paintSave();\n  clearTimeout(saveT);saveT=setTimeout(doSave,700);\n}\nasync function doSave(){\n  if(S.saving){S.again=true;return}\n  S.saving=true;\n  const ep=S.epoch;\n  do{\n    S.again=false;\n    const jobs=[];\n    if(S.dirtyC){S.dirtyC=false;jobs.push(api('PUT','/api/admin/config',{cfg:clone(S.cfg)}).then(r=>{if(!r.ok&&S.epoch===ep)S.dirtyC=true;return r.ok}))}\n    if(S.dirtyP){S.dirtyP=false;jobs.push(api('PUT','/api/admin/products',{prod:clone(S.prod)}).then(r=>{if(!r.ok&&S.epoch===ep)S.dirtyP=true;if(r.ok&&r.data&&r.data.prod&&S.epoch===ep)mergeMod(r.data.prod);return r.ok}))}\n    const res=await Promise.all(jobs);\n    S.saveState=res.every(Boolean)?'saved':'error';\n  }while(S.again&&S.saveState!=='error');\n  S.saving=false;\n  S.dirty=S.dirtyC||S.dirtyP;\n  paintSave();\n}\n/* Дожидается, пока все правки уйдут на сервер (нужно перед загрузкой фото). */\nasync function flushSave(){\n  clearTimeout(saveT);\n  while(S.saving)await waitMs(80);\n  if(S.dirtyC||S.dirtyP)await doSave();\n}\nfunction applyOrder(o,stats,did){\n  if(!o)return;\n  did=did||S.did;\n  const upd=(list,hub)=>list.map(x=>x.id===o.id&&(!hub||(x.did||S.did)===did)?Object.assign({},x,o):x);\n  if(did===S.did){S.allOrders=upd(S.allOrders,false);if(stats)S.stats=stats}\n  S.myOrders=upd(S.myOrders,true);\n  renderNav();\n  if(S.view==='seller'&&S.sellerTab==='orders')paintSeller();\n  else if(S.view==='mine')renderMine();\n}\nasync function setStatus(id,to,pay){\n  const r=await api('POST','/api/admin/status',{id,to,pay});\n  if(!r.ok){\n    toast(r.data&&r.data.error==='bad_pay'?L('Проверьте способ оплаты, срок и сумму','Toʻlov usuli, muddat va summani tekshiring'):L('Не удалось обновить статус','Holatni yangilab boʻlmadi'));\n    if(r.data&&r.data.order)applyOrder(r.data.order,r.data.stats);\n    return;\n  }\n  if(to==='done')S.pay=null;\n  applyOrder(r.data.order,r.data.stats);\n  loadStock();   // выдача списывает товар, отмена возвращает\n  if(to==='done')loadDebts();\n}\n/* «Повторить заказ»: открывает дистрибьютора этого заказа и кладёт в корзину всё, что сейчас есть в продаже (по сегодняшним ценам и остаткам). */\nasync function repeatOrder(id,d){\n  const od=d||S.did;\n  const o=S.myOrders.find(x=>x.id===id&&(x.did||S.did)===od);\n  if(!o)return;\n  if(od!==S.did&&!(await openShop(od)))return;\n  doRepeat(o);\n}\nfunction doRepeat(o){\n  if(S.otherCart){askOtherCart(()=>doRepeat(o));return}\n  let added=0,cut=0;const skipped=[];\n  (o.items||[]).forEach(it=>{\n    const p=S.prod.items.find(x=>x.id===it.id),qty=Number(it.qty)||0;\n    if(!p||soldOut(p)||qty<1){skipped.push(nm(it));return}\n    const cur=S.cart[p.id]||0;\n    if(!cur&&cartLines().length>=MAX_LINES){skipped.push(nm(it));return}\n    const want=Math.min(MAX_QTY,cur+qty),cap=maxQty(p),got=Math.min(want,cap);\n    if(got<want)cut++;\n    if(got>cur){S.cart[p.id]=got;added++}\n  });\n  saveCart();\n  if(!added){toast(L('Этих товаров сейчас нет в наличии','Bu mahsulotlar hozir mavjud emas'));go('shop');return}\n  S.shopPlaced=null;S.shopStep='cart';\n  go('shop');\n  toast(L('Товары из заказа '+o.id+' добавлены в корзину. Проверьте количество и цены.','Buyurtma '+o.id+' mahsulotlari savatga qoʻshildi. Miqdor va narxlarni tekshiring.')\n    +(skipped.length?L(' Нет в наличии: ',' Mavjud emas: ')+skipped.slice(0,3).join(', ')+(skipped.length>3?'…':'')+'.':'')\n    +(cut?L(' Количество уменьшено по остатку.',' Miqdor qoldiqqa qarab kamaytirildi.'):''));\n}\nasync function cancelMine(id,d){\n  const od=d||S.did;\n  const r=await api('POST','/api/cancel',{id},od);\n  if(!r.ok){\n    toast(L('Не удалось отменить: продавец уже принял заказ. Напишите ему.','Bekor qilib boʻlmadi: sotuvchi buyurtmani qabul qilgan. Unga yozing.'));\n    if(r.data&&r.data.order)applyOrder(r.data.order,undefined,od);\n    return;\n  }\n  applyOrder(r.data.order,undefined,od);\n}\n\n/* ---------- местоположение ---------- */\n/* Где сейчас телефон: ok({lat,lng},точность в метрах) или fail('denied'|'na'|'fail'|'timeout') */\nfunction getPos(ok,fail){\n  if(!navigator.geolocation){fail('na');return}\n  let done=false;\n  const fin=(f,a,b)=>{if(done)return;done=true;clearTimeout(to);f(a,b)};\n  const to=setTimeout(()=>fin(fail,'timeout'),20000);\n  try{\n    navigator.geolocation.getCurrentPosition(p=>{const l=cleanLoc({lat:p.coords.latitude,lng:p.coords.longitude});if(l)fin(ok,l,p.coords.accuracy);else fin(fail,'fail')},e=>fin(fail,e&&e.code===1?'denied':'fail'),{enableHighAccuracy:true,timeout:15000,maximumAge:20000});\n  }catch(e){fin(fail,'fail')}\n}\nconst geoErr=k=>k==='denied'?L('Нет доступа к геолокации. Разрешите её для Telegram в настройках телефона.','Geolokatsiyaga ruxsat yoʻq. Telefon sozlamalarida Telegram uchun ruxsat bering.')\n  :L('Не удалось определить местоположение. Включите геолокацию на телефоне и выйдите на открытое место.','Joylashuvni aniqlab boʻlmadi. Telefonda geolokatsiyani yoqing va ochiq joyga chiqing.');\nconst fmtKm=d=>d<1?L(Math.round(d*10)*100+' м',Math.round(d*10)*100+' m'):L(String(d).replace('.',',')+' км',d+' km');\n/* выбор карты: Яндекс.Карты или Google Maps */\nfunction openMapSheet(lat,lng,title){\n  const loc=cleanLoc({lat,lng});if(!loc)return;\n  closeMapSheet();\n  S.map=loc;\n  const el=document.createElement('div');el.id='mapsheet';\n  const co=loc.lat.toFixed(5)+', '+loc.lng.toFixed(5);\n  el.innerHTML='<div class=\"fs-bg\" data-act=\"mapx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Открыть на карте','Xaritada ochish'))+'\"><div class=\"fs-grab\"></div>'\n    +'<div class=\"fs-head\"><h2>'+L('Открыть на карте','Xaritada ochish')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"mapx\">'+L('Закрыть','Yopish')+'</button></div>'\n    +'<div class=\"fs-body\">'+(title?'<div class=\"rsum\"><b>'+esc(title)+'</b></div>':'')\n    +'<div class=\"mapbtns\"><button type=\"button\" class=\"btn\" data-act=\"mapgo\" data-k=\"y\">'+L('Яндекс.Карты','Yandex Xaritalar')+'</button><button type=\"button\" class=\"btn ghost\" data-act=\"mapgo\" data-k=\"g\">Google Maps</button></div>'\n    +'<div class=\"mapco\"><span class=\"mono small\">'+esc(co)+'</span><button type=\"button\" class=\"lnk\" data-act=\"copy\" data-v=\"'+esc(co)+'\" data-ok=\"'+esc(L('Координаты скопированы','Koordinatalar nusxalandi'))+'\" data-lab=\"\">'+L('Копировать','Nusxalash')+'</button></div></div></div>';\n  document.body.appendChild(el);\n  document.documentElement.classList.add('sh-open');\n}\nfunction closeMapSheet(){\n  const el=document.getElementById('mapsheet');\n  if(el)el.remove();\n  S.map=null;\n  setScrollLock();\n}\nfunction mapGo(k){\n  if(!S.map)return;\n  const url=mapUrl(k==='g'?'g':'y',S.map);\n  try{if(S.tg&&S.tg.openLink){S.tg.openLink(url);closeMapSheet();return}}catch(e){}\n  window.open(url,'_blank','noopener');\n  closeMapSheet();\n}\n/* --- клиент: точка в заказе (необязательно, хранится только в заказе) --- */\nfunction locBoxHTML(){\n  const l=S.form.loc;\n  if(S.locBusy)return '<div class=\"unit\" style=\"margin:0\">'+L('Определяем местоположение…','Joylashuv aniqlanmoqda…')+'</div>';\n  if(l)return '<div class=\"locok\"><span>✓ '+L('Местоположение указано','Joylashuv koʻrsatildi')+'</span><span class=\"locbtns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"map\" data-lat=\"'+l.lat+'\" data-lng=\"'+l.lng+'\" data-t=\"\">'+L('На карте','Xaritada')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"locclear\">'+L('Убрать','Olib tashlash')+'</button></span></div>';\n  return '<button type=\"button\" class=\"btn ghost locbtn\" data-act=\"locmark\">'+ICO.pin+'<span>'+L('Указать моё местоположение','Joylashuvimni koʻrsatish')+'</span></button>'\n    +'<div class=\"unit\" style=\"margin:6px 0 0\">'+L('Необязательно. Продавец увидит точку на карте, так проще найти магазин.','Majburiy emas. Sotuvchi nuqtani xaritada koʻradi, doʻkonni topish osonroq.')+'</div>';\n}\nfunction paintLocBox(){const el=$('#locbox');if(el)el.innerHTML=locBoxHTML()}\nfunction locMark(){\n  if(S.locBusy)return;\n  S.locBusy=true;paintLocBox();\n  getPos(l=>{S.locBusy=false;S.form.loc=l;paintLocBox();toast(L('Местоположение добавлено к заказу','Joylashuv buyurtmaga qoʻshildi'))},k=>{S.locBusy=false;paintLocBox();toast(geoErr(k))});\n}\n/* --- база магазинов --- */\n/* строка точки в карточке: у всех «На карте» и расстояние; у агента и владельца ещё «Обновить», «Отметить здесь» и предложение клиента */\nfunction baseLocHTML(x){\n  const w=baseW(),id=esc(x.id),busy=S.base.mark===x.id;\n  let h='';\n  if(x.loc)h+='<span class=\"lchips\"><button type=\"button\" class=\"lchip\" data-act=\"map\" data-lat=\"'+x.loc.lat+'\" data-lng=\"'+x.loc.lng+'\" data-t=\"'+esc(x.name)+'\">'+ICO.pin+L('На карте','Xaritada')+'</button>'\n    +(x.d!==undefined?'<span class=\"dkm\">'+esc(fmtKm(x.d))+'</span>':'')\n    +(w?'<button type=\"button\" class=\"llink\" data-act=\"baseloc\" data-id=\"'+id+'\"'+(S.base.mark?' disabled':'')+'>'+(busy?L('Определяем…','Aniqlanmoqda…'):L('Обновить','Yangilash'))+'</button>':'')+'</span>';\n  else if(w)h+='<button type=\"button\" class=\"lchip add\" data-act=\"baseloc\" data-id=\"'+id+'\"'+(S.base.mark?' disabled':'')+'>'+ICO.pin+(busy?L('Определяем…','Aniqlanmoqda…'):L('Отметить здесь','Shu yerda belgilash'))+'</button>';\n  let c='';\n  if(w&&x.cloc)c='<div class=\"cloc\"><span>'+L('Клиент прислал точку','Mijoz nuqta yubordi')+' <i>'+L('отмечено клиентом','mijoz belgilagan')+'</i></span><span class=\"locbtns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"map\" data-lat=\"'+x.cloc.lat+'\" data-lng=\"'+x.cloc.lng+'\" data-t=\"'+esc(x.name)+'\">'+L('На карте','Xaritada')+'</button><button type=\"button\" class=\"btn sm\" data-act=\"baseaccept\" data-id=\"'+id+'\"'+(S.base.mark?' disabled':'')+'>'+L('Принять','Qabul qilish')+'</button></span></div>';\n  return (h?'<div class=\"bloc\">'+h+'</div>':'')+c;\n}\n/* «Отметить здесь» и «Обновить»: берём место, где стоит агент; не вышло — открываем форму, там можно вставить ссылку на карту */\nfunction baseMark(id){\n  const b=S.base,x=b.items.find(y=>y.id===id);\n  if(!x||b.mark||b.busy)return;\n  const go=()=>{\n    b.mark=id;paintBase();\n    getPos(async l=>{\n      const r=await api('PUT','/api/hub/base/'+encodeURIComponent(id),{loc:{lat:l.lat,lng:l.lng}});\n      b.mark='';\n      if(!r.ok){toast(baseErr(r.data&&r.data.error));paintBase();return}\n      toast(L('Точка магазина сохранена','Doʻkon nuqtasi saqlandi'));\n      loadBase(true);\n    },k=>{\n      b.mark='';\n      toast(geoErr(k)+' '+L('Можно вставить ссылку на карту в форме.','Formaga xarita havolasini qoʻyish mumkin.'));\n      baseOpenForm(x);\n    });\n  };\n  if(x.loc)askConfirm(L('Заменить точку магазина на ваше текущее местоположение? Вы сейчас у магазина?','Doʻkon nuqtasini hozirgi joylashuvingizga almashtiraylikmi? Hozir doʻkon yonidamisiz?'),go);\n  else go();\n}\nasync function baseAccept(id){\n  const b=S.base;if(b.mark||b.busy)return;\n  b.mark=id;paintBase();\n  const r=await api('PUT','/api/hub/base/'+encodeURIComponent(id),{accept:true});\n  b.mark='';\n  if(!r.ok){toast(r.data&&r.data.error==='no_client_loc'?L('Точки от клиента уже нет','Mijoz nuqtasi endi yoʻq'):baseErr(r.data&&r.data.error));loadBase(true);return}\n  toast(L('Точка принята','Nuqta qabul qilindi'));\n  loadBase(true);\n}\n/* «Ближайшие»: спрашиваем, где вы сейчас, и сортируем магазины с точкой по расстоянию */\nfunction baseNear(){\n  const b=S.base;\n  toast(L('Определяем, где вы…','Qayerdaligingiz aniqlanmoqda…'));\n  getPos(l=>{b.near={lat:l.lat,lng:l.lng};b.sort='near';loadBase(true)},k=>toast(geoErr(k)));\n}\n/* блок «Местоположение» в форме магазина: точка хранится в форме и уходит на сервер вместе с остальным по кнопке «Сохранить» */\nfunction baseLocFormHTML(){\n  const b=S.base,l=b.fm.loc;\n  return '<div class=\"full\"><span class=\"lab\">'+L('Местоположение','Joylashuv')+'</span><div class=\"locform\">'\n    +(l?'<div class=\"locok\"><span>✓ '+l.lat.toFixed(5)+', '+l.lng.toFixed(5)+(b.fm.locDirty?' <i>'+L('не сохранено','saqlanmagan')+'</i>':'')+'</span><span class=\"locbtns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"map\" data-lat=\"'+l.lat+'\" data-lng=\"'+l.lng+'\" data-t=\"\">'+L('На карте','Xaritada')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"bfloc-clear\">'+L('Убрать','Olib tashlash')+'</button></span></div>'\n      :'<div class=\"unit\" style=\"margin:0\">'+L('Точка не отмечена. Если вы у магазина, нажмите «Отметить здесь».','Nuqta belgilanmagan. Doʻkon yonida boʻlsangiz, «Shu yerda belgilash» tugmasini bosing.')+'</div>')\n    +'<button type=\"button\" class=\"btn ghost locbtn\" data-act=\"bfloc-here\"'+(b.locBusy?' disabled':'')+'>'+ICO.pin+'<span>'+(b.locBusy?L('Определяем…','Aniqlanmoqda…'):l?L('Обновить здесь','Shu yerda yangilash'):L('Отметить здесь','Shu yerda belgilash'))+'</span></button>'\n    +'<div class=\"locpaste\"><input type=\"text\" id=\"bf-link\" data-bf-link=\"1\" value=\"'+esc(b.link)+'\" placeholder=\"'+esc(L('или ссылка на карту, или «41.5543, 60.6361»','yoki xarita havolasi, yoki «41.5543, 60.6361»'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Ссылка на карту или координаты','Xarita havolasi yoki koordinatalar'))+'\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"bfloc-link\">'+L('Применить','Qoʻllash')+'</button></div>'\n    +'<div class=\"err\" id=\"bflerr\" role=\"alert\"></div></div></div>';\n}\nfunction bfLocHere(){\n  const b=S.base;if(b.locBusy)return;\n  b.locBusy=true;paintBase();\n  getPos(l=>{b.locBusy=false;b.fm.loc={lat:l.lat,lng:l.lng};b.fm.locDirty=true;paintBase()},k=>{b.locBusy=false;paintBase();const e=$('#bflerr');if(e)e.textContent=geoErr(k)});\n}\nfunction bfLocLink(){\n  const b=S.base,l=parseGeo(b.link),e=$('#bflerr');\n  if(!String(b.link||'').trim()){if(e)e.textContent=L('Вставьте ссылку на карту или координаты.','Xarita havolasini yoki koordinatalarni qoʻying.');return}\n  if(!l){if(e)e.textContent=L('Не нашёл координаты. Откройте точку на карте и скопируйте ссылку из адресной строки браузера или координаты вида «41.5543, 60.6361». Короткие ссылки (maps.app.goo.gl) не подойдут.','Koordinatalar topilmadi. Nuqtani xaritada ochib, brauzer manzil satridagi havolani yoki «41.5543, 60.6361» koʻrinishidagi koordinatalarni nusxalang. Qisqa havolalar (maps.app.goo.gl) mos kelmaydi.');return}\n  b.fm.loc=l;b.fm.locDirty=true;b.link='';paintBase();\n}\n\n/* ---------- проверка товаров: владелец ---------- */\nconst modN=()=>S.hub.me&&Number(S.hub.me.modN)||0;\nconst catLabel=p=>(LANG==='uz'&&p.catUz)||p.catName||'';\nasync function hubBin(method,path,blob){\n  try{\n    const h={'content-type':'image/jpeg'};\n    if(S.initData)h['x-init-data']=S.initData;\n    const r=await fetch(path,{method,headers:h,body:blob,cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\n/* быстрые причины: нажатие добавляет фразу в текст, «Другое» только ставит курсор в поле */\nconst RV_WHY=()=>[['nophoto',L('Нет фото','Rasm yoʻq'),L('Нет фото.','Rasm yoʻq.')],['nouz',L('Нет названия по-узбекски','Oʻzbekcha nomi yoʻq'),L('Нет названия по-узбекски.','Oʻzbekcha nomi yoʻq.')],['price',L('Неверная цена','Narx notoʻgʻri'),L('Неверная цена.','Narx notoʻgʻri.')],['name',L('Ошибка в названии','Nomida xato'),L('Ошибка в названии.','Nomida xato bor.')],['other',L('Другое','Boshqa'),'']];\nfunction rvWhen(iso){\n  const t=new Date(iso);\n  if(!iso||isNaN(t.getTime()))return '';\n  const hm=('0'+t.getHours()).slice(-2)+':'+('0'+t.getMinutes()).slice(-2);\n  const a=agoTxt(iso);\n  return a===L('сегодня','bugun')?a+', '+hm:a;\n}\nfunction rvList(){\n  const v=S.rv;\n  if(v.did&&!v.shops.some(x=>x.id===v.did))v.did='';\n  const cats=new Set(v.items.filter(p=>!v.did||p.did===v.did).map(catLabel));\n  if(v.cat&&!cats.has(v.cat))v.cat='';\n  const q=normQ(v.q.trim()).split(/\\s+/).filter(Boolean);\n  return v.items.filter(p=>{\n    if(v.did&&p.did!==v.did)return false;\n    if(v.cat&&catLabel(p)!==v.cat)return false;\n    if(!q.length)return true;\n    const hay=normQ([p.name,p.uz,p.dname,catLabel(p),weightLabel(p)].join(' '));\n    return q.every(w=>hay.indexOf(w)>=0);\n  });\n}\nfunction renderReview(){\n  const v=S.rv;\n  view.innerHTML='<div class=\"wrap page rvpage\"><div class=\"hrow\"><div><div class=\"eyebrow\">'+esc(hubTitle())+'</div><h1>'+L('Проверка товаров','Mahsulotlarni tekshirish')+'</h1></div></div>'\n    +'<div class=\"seg s3\" id=\"rvsegs\" role=\"group\" aria-label=\"'+esc(L('Статус','Holat'))+'\"></div>'\n    +'<div class=\"search\"><input type=\"search\" id=\"rq\" data-rq=\"1\" value=\"'+esc(v.q)+'\" placeholder=\"'+esc(L('Название, дистрибьютор, категория','Nomi, distribyutor, kategoriya'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Поиск','Qidiruv'))+'\"></div>'\n    +'<div id=\"rvbody\"></div><div id=\"rvsheet\"></div></div>';\n  paintReview();\n}\nfunction rvSegsHTML(){\n  const v=S.rv;\n  return [['wait',L('Ждут проверки','Kutmoqda')],['ret',L('Возвращены','Qaytarilgan')],['ok',L('Одобрены','Tasdiqlangan')]].map(x=>'<button type=\"button\" data-act=\"rseg\" data-v=\"'+x[0]+'\" aria-pressed=\"'+(v.seg===x[0])+'\"><span>'+x[1]+'</span><b class=\"cnt'+(x[0]==='wait'&&v.counts.wait?' hot':'')+'\">'+(Number(v.counts[x[0]])||0)+'</b></button>').join('');\n}\nfunction rvFiltersHTML(){\n  const v=S.rv,opt=(val,lab,cur)=>'<option value=\"'+esc(val)+'\"'+(val===cur?' selected':'')+'>'+esc(lab)+'</option>';\n  const cats=[...new Set(v.items.filter(p=>!v.did||p.did===v.did).map(catLabel).filter(Boolean))].sort((a,b)=>a.localeCompare(b));\n  return '<div class=\"rvfil\"><select data-rfil=\"did\" aria-label=\"'+esc(L('Дистрибьютор','Distribyutor'))+'\">'+opt('',L('Все дистрибьюторы','Barcha distribyutorlar'),v.did)+v.shops.map(s=>opt(s.id,s.name+' · '+s.n,v.did)).join('')+'</select>'\n    +'<select data-rfil=\"cat\" aria-label=\"'+esc(L('Категория','Kategoriya'))+'\">'+opt('',L('Все категории','Barcha kategoriyalar'),v.cat)+cats.map(c=>opt(c,c,v.cat)).join('')+'</select></div>';\n}\nfunction rvCard(p){\n  const did=esc(p.did),id=esc(p.id),np=phVers(p).length,w=weightLabel(p),seg=S.rv.seg;\n  const meta=[catLabel(p),w,p.box>1?L('коробка '+p.box+' шт','quti '+p.box+' dona'):'',p.blk>1?L('блок '+p.blk+' шт','blok '+p.blk+' dona'):''].filter(Boolean).join(' · ');\n  const warn=[];\n  if(!p.pv)warn.push(L('нет фото','rasm yoʻq'));\n  if(!String(p.uz||'').trim())warn.push(L('нет названия по-узбекски','oʻzbekcha nomi yoʻq'));\n  const tiers=tiersOf(p).map(x=>'<span>'+L('от '+x.n+' шт — ',x.n+' donadan — ')+money(x.price)+'</span>').join('');\n  const btn=(act,cls,lab)=>'<button type=\"button\" class=\"btn'+cls+'\" data-act=\"'+act+'\" data-did=\"'+did+'\" data-id=\"'+id+'\">'+lab+'</button>';\n  return '<article class=\"rcard\" id=\"rc-'+did+'-'+id+'\"><div class=\"rtop\"><button type=\"button\" class=\"dpill\" data-act=\"rdist\" data-did=\"'+did+'\" aria-label=\"'+esc(L('Показать только: ','Faqat shuni koʻrsatish: ')+p.dname)+'\">'+esc(p.dname)+'</button><span class=\"rtime\">'+esc(rvWhen(seg==='ok'?p.ma:p.mt))+'</span></div>'\n    +'<div class=\"rbody\"><div class=\"rth'+(np?' zm':'')+'\"'+(np?' data-act=\"rzoom\" data-did=\"'+did+'\" data-id=\"'+id+'\"':'')+'>'+(p.pv?'<img src=\"'+imgUrl(p,1,p.did)+'\" alt=\"\" loading=\"lazy\" decoding=\"async\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>')+(np>1?'<span class=\"pcnt\" aria-hidden=\"true\">'+np+' '+L('фото','rasm')+'</span>':'')+'</div>'\n    +'<div class=\"rtx\"><b>'+esc(p.name)+'</b>'+(p.uz?'<small>'+esc(p.uz)+'</small>':'')+(meta?'<small>'+esc(meta)+'</small>':'')+'<div class=\"rprice\">'+money(p.price)+'</div>'+(tiers?'<div class=\"rtiers\">'+tiers+'</div>':'')+'</div></div>'\n    +(warn.length&&seg!=='ok'?'<div class=\"rwarn\">'+warn.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>':'')\n    +(p.ms==='ret'?modReasonHTML(p):'')\n    +'<div class=\"ract\">'+btn('redit',' ghost',L('Изменить','Tuzatish'))+(seg==='ok'?'':btn('rret',' ghost',L('Вернуть','Qaytarish'))+btn('rok','',L('Одобрить','Tasdiqlash')))+'</div></article>';\n}\nfunction paintReview(){\n  const v=S.rv,body=$('#rvbody');if(!body)return;\n  const sg=$('#rvsegs');if(sg)sg.innerHTML=rvSegsHTML();\n  if(!v.loaded){\n    body.innerHTML=v.err?'<div class=\"empty\"><b>'+L('Не удалось загрузить','Yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"rvreload\">'+L('Повторить','Qayta urinish')+'</button></div>'\n      :'<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n    paintRvSheet();return;\n  }\n  const list=rvList(),total=Number(v.counts[v.seg])||0;\n  let h=v.shops.length>1?rvFiltersHTML():'';\n  h+='<div class=\"rvinfo\"><span>'+L('Показано: ','Koʻrsatilgan: ')+list.length+L(' из ',' / ')+total+'</span>'+(v.seg==='wait'&&list.length?'<button type=\"button\" class=\"btn sm\" data-act=\"rall\">'+L('Одобрить все','Hammasini tasdiqlash')+' ('+list.length+')</button>':'')+'</div>';\n  h+=list.length?list.map(rvCard).join(''):'<div class=\"empty\"><b>'+(total?L('Ничего не найдено','Hech narsa topilmadi'):v.seg==='wait'?L('Всё проверено','Hammasi tekshirilgan'):v.seg==='ret'?L('Возвращённых нет','Qaytarilganlar yoʻq'):L('Одобренных пока нет','Tasdiqlanganlar hozircha yoʻq'))+'</b>'+(total?L('Измените поиск или фильтры.','Qidiruv yoki filtrlarni oʻzgartiring.'):v.seg==='wait'?L('Новые товары продавцов появятся здесь.','Sotuvchilarning yangi mahsulotlari shu yerda paydo boʻladi.'):'')+'</div>';\n  body.innerHTML=h;\n  paintRvSheet();\n}\nasync function loadReview(silent){\n  const v=S.rv,seg=v.seg;\n  if(!silent){v.loaded=false;v.err=false;if(S.view==='review')paintReview()}\n  const r=await api('GET','/api/hub/admin/mod?seg='+seg);\n  if(S.view!=='review'||v.seg!==seg)return;\n  if(!r.ok||!r.data){if(!v.loaded){v.err=true;paintReview()}return}\n  v.items=Array.isArray(r.data.items)?r.data.items:[];v.counts=Object.assign({wait:0,ret:0,ok:0},r.data.counts);v.shops=Array.isArray(r.data.shops)?r.data.shops:[];\n  v.loaded=true;v.err=false;\n  if(S.hub.me)S.hub.me.modN=v.counts.wait;\n  renderNav();\n  if(v.edit||v.ret){const sg=$('#rvsegs');if(sg)sg.innerHTML=rvSegsHTML();return}   // пока открыта шторка, список под ней не трогаем\n  paintReview();\n}\nasync function rvApprove(items){\n  const v=S.rv;if(v.busy||!items.length)return;\n  v.busy=true;\n  const r=await api('POST','/api/hub/admin/mod/approve',{items:items.map(x=>({did:x.did,id:x.id}))});\n  v.busy=false;\n  if(!r.ok||!r.data){toast(L('Не удалось одобрить. Проверьте соединение.','Tasdiqlab boʻlmadi. Ulanishni tekshiring.'));return}\n  const n=Number(r.data.n)||0;\n  toast(n?L('Одобрено: '+n,'Tasdiqlandi: '+n):L('Эти товары уже обработаны','Bu mahsulotlar allaqachon koʻrib chiqilgan'));\n  await loadReview(true);\n}\nfunction rvFind(did,id){return S.rv.items.find(x=>x.did===did&&x.id===id)}\nfunction rvOpenRet(did,id){\n  const it=rvFind(did,id);if(!it)return;\n  S.rv.ret={did,id,name:it.name,dname:it.dname};S.rv.rtxt=it.ms==='ret'?String(it.mc||''):'';\n  paintRvSheet();\n}\n/* шторка «Вернуть товар продавцу» и шторка правки: рисуются один раз при открытии, чтобы поле ввода не теряло курсор */\nfunction paintRvSheet(){\n  const el=$('#rvsheet');if(!el)return;\n  const v=S.rv,key=v.ret?'r:'+v.ret.did+'|'+v.ret.id:v.edit?'e:'+v.edit.did+'|'+v.edit.p.id:'';\n  document.documentElement.classList.toggle('sh-open',!!key&&S.view==='review');\n  if((el.dataset.k||'')===key)return;\n  el.dataset.k=key;\n  if(v.ret){\n    const r=v.ret;\n    el.innerHTML='<div class=\"fs-bg\" data-act=\"rsx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Вернуть товар продавцу','Mahsulotni sotuvchiga qaytarish'))+'\"><div class=\"fs-grab\"></div>'\n      +'<div class=\"fs-head\"><h2>'+L('Вернуть товар продавцу','Mahsulotni sotuvchiga qaytarish')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"rsx\">'+L('Закрыть','Yopish')+'</button></div>'\n      +'<div class=\"fs-body\"><div class=\"rsum\"><b>'+esc(r.name)+'</b><small>'+esc(r.dname)+'</small></div>'\n      +'<div class=\"fs-t\">'+L('Быстрые причины','Tezkor sabablar')+'</div><div class=\"fs-c\" id=\"rwhy\">'+RV_WHY().map(x=>'<button type=\"button\" class=\"chip\" data-act=\"rwhy\" data-k=\"'+x[0]+'\" data-ph=\"'+esc(x[2])+'\" aria-pressed=\"false\">'+esc(x[1])+'</button>').join('')+'</div>'\n      +'<label class=\"lab\" for=\"rtxt\" style=\"margin-top:14px\">'+L('Что нужно исправить','Nimani tuzatish kerak')+'</label><textarea id=\"rtxt\" data-rtxt=\"1\" maxlength=\"300\" rows=\"4\" placeholder=\"'+esc(L('Напишите, что исправить. Продавец получит это сообщением.','Nimani tuzatishni yozing. Sotuvchi buni xabar sifatida oladi.'))+'\">'+esc(v.rtxt)+'</textarea><div class=\"rcount\" id=\"rcount\"></div></div>'\n      +'<div class=\"fs-foot\"><button type=\"button\" class=\"btn\" id=\"rsend\" data-act=\"rsend\" disabled>'+L('Вернуть продавцу','Sotuvchiga qaytarish')+'</button></div></div>';\n    rvRetSync();\n  }else if(v.edit){\n    el.innerHTML=rvEditHTML(v.edit);\n    paintRvPhoto();\n  }else el.innerHTML='';\n}\nfunction rvRetSync(){\n  const v=S.rv,t=v.rtxt.trim(),b=$('#rsend'),c=$('#rcount');\n  if(b)b.disabled=!t||v.busy;\n  if(c)c.textContent=v.rtxt.length+' / 300';\n  document.querySelectorAll('#rwhy .chip').forEach(ch=>{const ph=ch.dataset.ph;ch.setAttribute('aria-pressed',String(!!ph&&v.rtxt.indexOf(ph)>=0))});\n}\nfunction rvWhy(k,ph){\n  const v=S.rv,ta=$('#rtxt');if(!v.ret||!ta)return;\n  if(ph&&v.rtxt.indexOf(ph)<0){\n    const cur=v.rtxt.trim();\n    v.rtxt=((cur?cur+' ':'')+ph).slice(0,300);\n    ta.value=v.rtxt;\n  }\n  rvRetSync();\n  try{ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)}catch(e){}\n}\nasync function rvSend(){\n  const v=S.rv,r0=v.ret,reason=v.rtxt.trim();\n  if(!r0||v.busy||!reason)return;\n  v.busy=true;rvRetSync();\n  const r=await api('POST','/api/hub/admin/mod/return',{did:r0.did,id:r0.id,reason});\n  v.busy=false;\n  if(!r.ok){\n    if(r.status===409){v.ret=null;v.rtxt='';paintRvSheet();toast(L('Этот товар уже обработан','Bu mahsulot allaqachon koʻrib chiqilgan'));loadReview(true);return}\n    rvRetSync();toast(L('Не удалось вернуть. Проверьте соединение.','Qaytarib boʻlmadi. Ulanishni tekshiring.'));return;\n  }\n  v.ret=null;v.rtxt='';paintRvSheet();\n  toast(L('Возвращено продавцу','Sotuvchiga qaytarildi'));\n  await loadReview(true);\n}\n/* --- правка товара владельцем --- */\nfunction rvOpenEdit(did,id){\n  const it=rvFind(did,id);if(!it)return;\n  const shop=S.rv.shops.find(s=>s.id===did);\n  S.rv.edit={did,dname:it.dname,cats:(shop&&shop.cats)||[],p:clone(it),err:'',busy:false,upl:null};\n  paintRvSheet();\n}\nfunction rvEditHTML(e){\n  const p=e.p,fld=(k,lab,inner,cls)=>'<div'+(cls?' class=\"'+cls+'\"':'')+'><label class=\"lab\" for=\"rf-'+k+'\">'+pfLab(k,lab)+'</label>'+inner+(PF_FULL.includes(k)?pfHint(k):'')+'</div>';\n  const inp=(k,type,val,extra)=>'<input type=\"'+type+'\" id=\"rf-'+k+'\" data-rf=\"'+k+'\" value=\"'+esc(val)+'\"'+(extra||'')+'>';\n  const ta=(k,val)=>'<textarea id=\"rf-'+k+'\" data-rf=\"'+k+'\" maxlength=\"300\" rows=\"2\">'+esc(val)+'</textarea>';\n  const t=tiersOf(p);\n  const tiers=[0,1,2].map(i=>{const x=t[i]||{};return '<div class=\"trow\"><span>'+L('от','dan')+'</span><input type=\"number\" id=\"rtn-'+i+'\" data-rf=\"tn\" inputmode=\"numeric\" min=\"2\" max=\"500\" step=\"1\" value=\"'+(x.n||'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': от скольких штук','Pogʻona '+(i+1)+': necha donadan'))+'\"><span>'+L('шт — цена','dona — narx')+'</span><input type=\"number\" id=\"rtp-'+i+'\" data-rf=\"tp\" inputmode=\"numeric\" min=\"1\" step=\"100\" value=\"'+(x.price||'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': цена за штуку, сум','Pogʻona '+(i+1)+': bir dona narxi, soʻm'))+'\"><span>'+L('сум','soʻm')+'</span></div>'}).join('');\n  return '<div class=\"fs-bg\" data-act=\"rsx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Изменить товар','Mahsulotni tuzatish'))+'\"><div class=\"fs-grab\"></div>'\n    +'<div class=\"fs-head\"><h2>'+L('Изменить товар','Mahsulotni tuzatish')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"rsx\">'+L('Закрыть','Yopish')+'</button></div>'\n    +'<div class=\"fs-body\"><div class=\"rsum\"><span class=\"dpill static\">'+esc(e.dname)+'</span>'+modTag(p)+'</div>'\n    +'<div class=\"pph\" id=\"rvph\"></div>'\n    +'<div class=\"pf rvform\" style=\"margin-top:12px\">'\n    +fld('name',L('Название','Nomi'),inp('name','text',p.name,' maxlength=\"60\"'),'full')\n    +fld('uz',L('Название по-узбекски','Oʻzbekcha nomi'),inp('uz','text',p.uz||'',' maxlength=\"60\"'),'full')\n    +fld('desc',L('Описание','Tavsif'),ta('desc',p.desc||''),'full')\n    +fld('descUz',L('Описание по-узбекски','Oʻzbekcha tavsif'),ta('descUz',p.descUz||''),'full')\n    +fld('cat',L('Категория','Kategoriya'),'<select id=\"rf-cat\" data-rf=\"cat\">'+e.cats.map(c=>'<option value=\"'+esc(c.id)+'\"'+(p.cat===c.id?' selected':'')+'>'+esc(nm(c))+'</option>').join('')+'</select>','full')\n    +fld('amount',L('Вес или объём единицы','Birlik ogʻirligi yoki hajmi'),inp('amount','number',p.amount||0,' inputmode=\"decimal\" step=\"any\" min=\"0\"'))\n    +fld('unit',L('Единица','Birlik'),'<select id=\"rf-unit\" data-rf=\"unit\">'+UNIT_IDS.map(u=>'<option value=\"'+u+'\"'+(p.unit===u?' selected':'')+'>'+esc(unitName(u))+'</option>').join('')+'</select>')\n    +pfHintRow('amount')\n    +fld('price',L('Цена за единицу, сум','Birlik narxi, soʻm'),inp('price','number',p.price||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +fld('tag',L('Метка','Belgi'),'<select id=\"rf-tag\" data-rf=\"tag\"><option value=\"\"'+(!p.tag?' selected':'')+'>'+L('Без метки','Belgisiz')+'</option><option value=\"sale\"'+(p.tag==='sale'?' selected':'')+'>'+tagName('sale')+'</option><option value=\"new\"'+(p.tag==='new'?' selected':'')+'>'+tagName('new')+'</option></select>')\n    +pfHintRow('price')\n    +fld('old',L('Старая цена для акции, сум','Aksiya uchun eski narx, soʻm'),inp('old','number',p.old||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +pfHintRow('oldS')\n    +'<div class=\"full\"><span class=\"lab\">'+L('Цена от количества (оптовые ступени)','Miqdorga qarab narx (ulgurji pogʻonalar)')+'</span><div class=\"tiers\">'+tiers+'</div><div class=\"err\" id=\"rtw\" role=\"status\"></div></div>'\n    +fld('blk',L('Штук в блоке (0 — нет блока)','Blokda necha dona (0 — blok yoʻq)'),inp('blk','number',p.blk||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +fld('box',L('Штук в коробке (0 — нет коробки)','Qutida necha dona (0 — quti yoʻq)'),inp('box','number',p.box||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +'</div></div>'\n    +'<div class=\"fs-foot\"><div class=\"err\" id=\"rerr\" role=\"alert\"></div><button type=\"button\" class=\"btn\" id=\"rsave\" data-act=\"rsave\">'+L('Сохранить','Saqlash')+'</button></div></div>';\n}\nfunction paintRvPhoto(){\n  const e=S.rv.edit,el=$('#rvph');if(!e||!el)return;\n  const p=e.p,cnt=phVers(p).length,busy=!!e.upl;\n  let h='<div class=\"pslots'+(busy?' busy':'')+'\">';\n  for(let i=1;i<=PH_MAX;i++){\n    const inp='<input type=\"file\" class=\"sr\" id=\"rph-'+i+'\" accept=\"image/*\" data-rphoto=\"1\" data-n=\"'+i+'\"'+(busy?' disabled':'')+'>';\n    if(i<=cnt)h+='<div class=\"pslot has'+(e.upl===i?' load':'')+'\"><label for=\"rph-'+i+'\" aria-label=\"'+esc(L('Заменить фото '+i,i+'-rasmni almashtirish'))+'\"><img src=\"'+imgUrl(p,i,e.did)+'\" alt=\"\" decoding=\"async\"></label>'+(i===1?'<span class=\"pmain\">'+L('Главное','Asosiy')+'</span>':'')+(busy?'':'<button type=\"button\" class=\"px\" data-act=\"rphdel\" data-n=\"'+i+'\" aria-label=\"'+esc(L('Убрать фото '+i,i+'-rasmni olib tashlash'))+'\">×</button>')+inp+'</div>';\n    else if(i===cnt+1)h+='<div class=\"pslot add'+(e.upl===i?' load':'')+'\"><label for=\"rph-'+i+'\" aria-label=\"'+esc(L('Добавить фото','Rasm qoʻshish'))+'\"><span>+</span></label>'+inp+'</div>';\n    else h+='<div class=\"pslot ghost\" aria-hidden=\"true\"></div>';\n  }\n  el.innerHTML=h+'</div>';\n}\nfunction rvSyncPhotos(e){\n  const it=rvFind(e.did,e.p.id);\n  if(it)setPhotoVers(it,e.p);\n}\nasync function rvPhotoUp(file,n){\n  const e=S.rv.edit;if(!e||e.upl)return;\n  n=Math.max(1,Math.min(PH_MAX,Number(n)||1));n=Math.min(n,phVers(e.p).length+1);\n  e.upl=n;paintRvPhoto();\n  let ok=false;\n  try{\n    const blob=await shrinkPhoto(file);\n    if(blob){\n      const r=await hubBin('PUT','/api/hub/admin/mod/photo?did='+encodeURIComponent(e.did)+'&id='+encodeURIComponent(e.p.id)+'&n='+n,blob);\n      if(r.ok&&r.data){setPhotoVers(e.p,r.data);rvSyncPhotos(e);ok=true}\n    }\n  }catch(x){}\n  e.upl=null;if(S.rv.edit===e)paintRvPhoto();\n  toast(ok?L('Фото сохранено','Rasm saqlandi'):L('Не удалось загрузить фото. Попробуйте другое изображение.','Rasmni yuklab boʻlmadi. Boshqa rasm tanlang.'));\n}\nasync function rvPhotoDel(n){\n  const e=S.rv.edit;if(!e||e.upl)return;\n  e.upl=Number(n)||1;paintRvPhoto();\n  const r=await api('DELETE','/api/hub/admin/mod/photo?did='+encodeURIComponent(e.did)+'&id='+encodeURIComponent(e.p.id)+'&n='+(Number(n)||1));\n  if(r.ok&&r.data){setPhotoVers(e.p,r.data);rvSyncPhotos(e)}\n  else toast(L('Не удалось убрать фото','Rasmni olib tashlab boʻlmadi'));\n  e.upl=null;if(S.rv.edit===e)paintRvPhoto();\n}\nfunction rvSyncTiers(){\n  const e=S.rv.edit;if(!e)return;\n  const rows=[];\n  for(let i=0;i<3;i++){\n    const a=$('#rtn-'+i),b=$('#rtp-'+i);\n    const n=a?String(a.value).trim():'',pr=b?String(b.value).trim():'';\n    if(n!==''&&pr!=='')rows.push({n:Number(n),price:Number(pr)});\n  }\n  e.p.tiers=cleanTiers(rows,e.p.price);\n  const w=$('#rtw');\n  if(w)w.textContent=e.p.tiers.length<rows.length?L('Одна из строк не учтена: цена ступени должна быть ниже обычной и ниже предыдущей, а количество — больше предыдущего (от 2 до 500).','Qatorlardan biri hisobga olinmadi: pogʻona narxi odatdagidan va oldingisidan past, miqdor esa oldingisidan katta boʻlishi kerak (2 dan 500 gacha).'):'';\n}\nfunction rvField(t){\n  const e=S.rv.edit;if(!e)return;\n  const p=e.p,k=t.dataset.rf;\n  if(k==='amount'||k==='price'||k==='old'){const v=Number(t.value);p[k]=isFinite(v)&&v>=0?v:0;if(k==='price')rvSyncTiers()}\n  else if(k==='blk'||k==='box'){const v=Math.round(Number(t.value));p[k]=v>=2&&v<=500?v:0}\n  else if(k==='tn'||k==='tp')rvSyncTiers();\n  else p[k]=t.value;\n  const er=$('#rerr');if(er)er.textContent='';\n}\nasync function rvSave(){\n  const e=S.rv.edit;if(!e||e.busy||e.upl)return;\n  const p=e.p,er=$('#rerr'),btn=$('#rsave');\n  if(!String(p.name||'').trim()){if(er)er.textContent=L('Укажите название','Nomini kiriting');return}\n  if(!(Number(p.price)>0)){if(er)er.textContent=L('Укажите цену','Narxni kiriting');return}\n  e.busy=true;if(btn)btn.disabled=true;\n  const item={name:p.name,uz:p.uz,desc:p.desc,descUz:p.descUz,cat:p.cat,amount:p.amount,unit:p.unit,price:p.price,tiers:p.tiers||[],blk:p.blk,box:p.box,tag:p.tag,old:p.old};\n  const r=await api('PUT','/api/hub/admin/mod/edit',{did:e.did,id:p.id,item});\n  e.busy=false;\n  if(!r.ok||!r.data||!r.data.item){if(btn)btn.disabled=false;if(er)er.textContent=L('Не удалось сохранить. Проверьте соединение.','Saqlab boʻlmadi. Ulanishni tekshiring.');return}\n  const i=S.rv.items.findIndex(x=>x.did===e.did&&x.id===p.id);\n  if(i>=0){\n    const old=S.rv.items[i],cat=e.cats.find(c=>c.id===r.data.item.cat)||{};\n    S.rv.items[i]=Object.assign({},old,r.data.item,{did:old.did,dname:old.dname,catName:cat.name||'',catUz:cat.uz||''});\n  }\n  S.rv.edit=null;paintReview();\n  toast(L('Сохранено','Saqlandi'));\n}\nfunction rvClose(){\n  const v=S.rv;\n  if(v.edit&&v.edit.busy)return;\n  v.ret=null;v.edit=null;v.rtxt='';\n  paintRvSheet();\n  if(v.loaded)paintReview();\n}\n\n/* ---------- views ---------- */\nfunction render(){\n  renderNav();\n  if(S.view==='shops')renderShops();\n  else if(S.view==='owner')renderOwner();\n  else if(S.view==='shop')renderShop();\n  else if(S.view==='mine')renderMine();\n  else if(S.view==='debt')renderMyDebt();\n  else if(S.view==='profile')renderProfile();\n  else if(S.view==='base')renderBase();\n  else if(S.view==='review')renderReview();\n  else if(S.view==='analytics')renderAnalytics();\n  else if(S.view==='courier')renderCourier();\n  else renderSeller();\n}\nfunction go(v){\n  // каталог, профиль и панель продавца есть только внутри дистрибьютора\n  if(!S.did&&(v==='shop'||v==='profile'||v==='seller'||v==='courier'))v='shops';\n  if(v==='courier'&&!S.courier)v='shop';\n  if(v==='owner'&&!isOwner())v='shops';\n  if(v==='base'&&!canBase())v='shops';\n  if(v==='review'&&!isOwner())v='shops';\n  if(v==='analytics'&&!isOwner())v='shops';\n  const was=S.view;\n  if(v==='base'&&was!=='base')baseResetUI();\n  S.view=v;S.cc=null;S.msub=null;setScrollLock();\n  render();window.scrollTo(0,0);\n  if(v==='mine')loadMine();\n  if(v==='debt')loadMyDebt(true);\n  if(v==='shop')loadCfg();\n  if(v==='seller')loadAdmin();\n  if(v==='courier')loadCourier();\n  if(v==='shops')loadHub();\n  if(v==='owner')loadOwner();\n  if(v==='base')loadBase(true);\n  if(v==='analytics')loadAnalytics();\n  if(v==='review'){S.rv.ret=null;S.rv.edit=null;loadReview()}\n}\n/* ---------- дистрибьюторы: список, переход, раздел владельца ---------- */\n/* Региональный фильтр работает, только если кто-то из дистрибьюторов уже отметил регионы или склад */\nconst regionsInUse=()=>regionsOn()&&S.hub.shops.some(r=>hasZone(r.regions)||r.home);\nfunction shopCardHTML(r){\n  const meta=[],reg=S.region&&regionsInUse()?S.region:'';\n  if(r.items)meta.push(L(r.items+' '+plTovar(r.items),r.items+' ta mahsulot'));\n  if(!r.delivery)meta.push(L('только самовывоз','faqat olib ketish'));\n  else if(hasZone(r.regions)){\n    const n=cleanRegions(r.regions).length;\n    meta.push(reg?(deliversTo(r,reg)?L('доставка к вам','sizga yetkazib beradi'):L('к вам не доставляет, самовывоз','sizga yetkazmaydi, olib ketish')):L('доставка в '+n+' рег.','yetkazib berish: '+n+' ta hudud'));\n  }\n  else meta.push(L('есть доставка','yetkazib berish bor'));\n  if(regionsOn()&&r.home&&regionName(r.home))meta.push(L('склад: ','ombor: ')+regionName(r.home));\n  if(r.minOrder>0)meta.push(L('мин. заказ ','min. buyurtma ')+money(r.minOrder));\n  return '<article class=\"dcard\"><h2>'+esc(r.name)+'</h2><div class=\"dmeta\">'+esc(meta.join(' · '))+'</div>'\n    +((r.cats||[]).length?'<div class=\"dcats\">'+r.cats.map(c=>'<span>'+esc(nm(c))+'</span>').join('')+'</div>':'')\n    +'<button type=\"button\" class=\"btn\" data-act=\"openshop\" data-id=\"'+esc(r.id)+'\">'+L('Открыть каталог','Katalogni ochish')+'</button></article>';\n}\n/* что лежит в корзине сейчас: у открытого дистрибьютора или у другого */\nfunction pendingCart(){\n  if(S.otherCart)return {did:S.otherCart.did,name:otherCartName(),n:otherCartCount()};\n  const n=Object.keys(S.cart).length;\n  return n&&S.did?{did:S.did,name:S.cfg.shop.name||shopNameOf(S.did),n}:null;\n}\n/* Выбор региона магазина */\nfunction regionBarHTML(){\n  return '<div class=\"card regbar\"><label class=\"lab\" for=\"reg-sel\">'+L('Ваш регион','Sizning hududingiz')+'</label><select id=\"reg-sel\" data-reg=\"1\"><option value=\"\">'+L('Выберите регион','Hududni tanlang')+'</option>'\n    +REGIONS.map(r=>'<option value=\"'+r.id+'\"'+(r.id===S.region?' selected':'')+'>'+esc(regionName(r.id))+'</option>').join('')+'</select>'\n    +'<div class=\"unit\">'+(S.region?L('Сначала показываем тех, кто доставляет к вам или находится в вашем регионе.','Avval sizga yetkazib beradigan yoki hududingizdagi distribyutorlar koʻrsatiladi.'):L('Выберите регион, и мы покажем тех, кто доставляет к вам.','Hududni tanlang, sizga yetkazib beradiganlarni koʻrsatamiz.'))+'</div></div>';\n}\n/* Список: сначала те, кто доставляет в регион магазина или находится в нём; остальные (у них можно заказать с самовывозом) спрятаны за кнопкой */\nfunction shopsListHTML(){\n  const all=S.hub.shops;\n  if(!all.length)return '<div class=\"empty\"><b>'+L('Пока нет дистрибьюторов с товарами','Hozircha mahsulotli distribyutorlar yoʻq')+'</b>'+L('Загляните позже.','Keyinroq qaytib keling.')+'</div>';\n  const grid=a=>'<div class=\"dgrid\">'+a.map(shopCardHTML).join('')+'</div>';\n  if(!regionsInUse())return grid(all);\n  const bar=regionBarHTML();\n  if(!S.region)return bar+grid(all);\n  const near=all.filter(r=>servesRegion(r,S.region)),far=all.filter(r=>!servesRegion(r,S.region));\n  if(!far.length)return bar+grid(near);\n  if(!near.length)return bar+'<div class=\"note warnnote\" role=\"status\" style=\"margin-bottom:12px\">'+esc(L('В вашем регионе ('+regionName(S.region)+') пока нет дистрибьюторов с доставкой. Ниже те, у кого можно заказать с самовывозом.','Sizning hududingizda ('+regionName(S.region)+') yetkazib beradigan distribyutorlar hozircha yoʻq. Quyida olib ketish bilan buyurtma berish mumkin boʻlganlar.'))+'</div>'+grid(far);\n  return bar+grid(near)\n    +'<div class=\"row-btns\" style=\"justify-content:center;margin-bottom:14px\"><button type=\"button\" class=\"btn ghost\" data-act=\"showfar\" aria-expanded=\"'+S.showFar+'\">'\n    +(S.showFar?L('Скрыть тех, кто не доставляет к вам','Sizga yetkazib bermaydiganlarni yashirish'):L('Показать и тех, кто не доставляет к вам ('+far.length+')','Sizga yetkazib bermaydiganlarni ham koʻrsatish ('+far.length+')'))+'</button></div>'\n    +(S.showFar?'<p class=\"lead\">'+L('Эти дистрибьюторы не доставляют в ваш регион, но у них можно заказать с самовывозом.','Bu distribyutorlar sizning hududingizga yetkazib bermaydi, lekin olib ketish bilan buyurtma berish mumkin.')+'</p>'+grid(far):'');\n}\nfunction renderShops(){\n  const h=S.hub,me=h.me;\n  let out='<div class=\"wrap page\"><div class=\"hrow\"><div><h1>'+esc(hubTitle())+'</h1><div class=\"tagline\">'+L('Дистрибьюторы и магазины в одном приложении','Distribyutorlar va doʻkonlar bir ilovada')+'</div></div>'\n    +'</div>';\n  if(!h.loaded&&!h.err)out+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!h.loaded)out+='<div class=\"empty\"><b>'+L('Не удалось загрузить список','Roʻyxatni yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"hubreload\">'+L('Повторить','Qayta urinish')+'</button></div>';\n  else{\n    out+=bannerSlot();\n    out+='<p class=\"lead\">'+L('Выберите дистрибьютора, чтобы посмотреть каталог и заказать товары. В одной корзине товары только одного дистрибьютора.','Katalog va buyurtma uchun distribyutorni tanlang. Bitta savatda faqat bitta distribyutorning mahsulotlari boʻladi.')+'</p>';\n    const pc=pendingCart();\n    if(pc)out+='<div class=\"note\" style=\"margin-bottom:12px\">🛒 '+esc(L('В корзине '+pc.n+' поз.'+(pc.name?' · «'+pc.name+'»':''),'Savatda '+pc.n+' ta mahsulot'+(pc.name?' · «'+pc.name+'»':'')))+' <button type=\"button\" class=\"btn ghost sm\" data-act=\"opencartshop\" data-id=\"'+esc(pc.did)+'\">'+L('Открыть корзину','Savatni ochish')+'</button></div>';\n    const sells=me&&me.sells||[];\n    if(sells.length)out+='<div class=\"row-btns\" style=\"margin-bottom:14px\">'+sells.map(x=>'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sellerof\" data-id=\"'+esc(x.id)+'\">'+esc(L('Панель продавца: ','Sotuvchi paneli: ')+x.name)+'</button>').join('')+'</div>';\n    const dels=me&&me.delivers||[];\n    if(dels.length)out+='<div class=\"row-btns\" style=\"margin-bottom:14px\">'+dels.map(x=>'<button type=\"button\" class=\"btn ghost sm\" data-act=\"courierof\" data-id=\"'+esc(x.id)+'\">'+esc(L('Доставка: ','Yetkazib berish: ')+x.name)+'</button>').join('')+'</div>';\n    out+=shopsListHTML();\n  }\n  view.innerHTML=out+'</div>';\n}\nasync function loadHub(){\n  const r=await api('GET','/api/shops');\n  if(!r.ok||!r.data){\n    if(!S.hub.loaded){S.hub.err=true;if(S.view==='shops')renderShops()}\n    return false;\n  }\n  const d=r.data,h=S.hub;\n  const next={title:d.title||'',shops:Array.isArray(d.shops)?d.shops:[],me:d.me||null,terrs:Array.isArray(d.terrs)?d.terrs:[]};\n  if(d.me){\n    S.auth=true;S.uid=d.me.id;\n    // регион: что выбрано на этом телефоне, то главнее; если здесь пусто, берём с площадки\n    const sr=regionsOn()?cleanRegion(d.me.region):'';\n    if(sr&&!S.region){S.region=sr;saveRegionLocal()}\n    else if(S.region&&sr!==S.region&&!S.regSent){S.regSent=true;api('PUT','/api/hub/region',{region:S.region})}\n  }\n  const same=h.loaded&&JSON.stringify([h.title,h.shops,h.me,h.terrs])===JSON.stringify([next.title,next.shops,next.me,next.terrs]);\n  Object.assign(h,next,{loaded:true,err:false});\n  if(same)return true;\n  renderNav();\n  if(S.view==='shops')renderShops();\n  return true;\n}\n/* Открывает каталог дистрибьютора: всё, что относилось к прежнему, сбрасывается. Возвращает true, если получилось. */\nasync function openShop(did){\n  if(!validDid(did)||S.switching)return false;\n  if(S.did===did)return true;\n  S.switching=true;\n  try{\n    if(S.did&&(S.dirty||S.saving))await flushSave();\n    view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Загружаем каталог','Katalog yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div></div>';\n    let r=S.initData?await api('GET','/api/bootstrap',undefined,did):null;\n    if(!r||r.status===401)r=await api('GET','/api/config',undefined,did);\n    if(!r.ok||!r.data){\n      toast(L('Не удалось открыть каталог. Проверьте соединение.','Katalogni ochib boʻlmadi. Ulanishni tekshiring.'));\n      render();\n      return false;\n    }\n    const d=r.data;\n    S.epoch++;\n    resetShopState();\n    S.did=did;\n    S.cfg=mergeCfg(d.cfg);S.prod=normProd(d.prod);S.off=!!d.off;\n    if(d.me){\n      S.admin=!!d.me.admin;S.courier=d.me.courier||null;S.profile=d.me.profile||null;S.blocked=!!d.me.blocked;\n      S.fav=Array.isArray(d.me.fav)?d.me.fav:[];\n    }\n    loadCart();pruneCart();normalizeMode();applyProfile();\n    return true;\n  }finally{S.switching=false}\n}\nasync function enterShop(did,v,cart){\n  if(!(await openShop(did))){if(!S.did)S.view='shops';render();return false}\n  S.shopPlaced=null;S.shopStep=cart&&cartCount()>0?'cart':'list';\n  go(v==='seller'&&S.admin?'seller':v==='courier'&&S.courier?'courier':'shop');\n  return true;\n}\n/* ---------- база магазинов ---------- */\nconst BST=()=>({new:L('Новый','Yangi'),talk:L('Переговоры','Muzokara'),refuse:L('Отказался','Rad etdi')});\nconst terrName=id=>{const t=S.base.terrs.find(x=>x.id===id);return t?t.name:''};\nconst telHref=p=>'tel:'+String(p||'').replace(/[^\\d+]/g,'');\nconst baseW=()=>S.base.role==='owner'||S.base.role==='agent';\nconst baseErr=e=>({\n  bad_name:L('Название — от 2 символов','Nomi kamida 2 belgi boʻlsin'),\n  bad_phone:L('Укажите телефон: не меньше 9 цифр','Telefonni kiriting: kamida 9 ta raqam'),\n  bad_terr:L('Выберите территорию из списка','Roʻyxatdan hududni tanlang'),\n  need_terr:L('Выберите территорию','Hududni tanlang'),\n  too_many:L('В базе уже максимум магазинов','Bazada doʻkonlar maksimal sonda'),\n  forbidden:L('Это действие вам недоступно','Bu amal siz uchun mavjud emas'),\n  bad_loc:L('Точка не распознана. Отметьте её заново.','Nuqta aniqlanmadi. Uni qaytadan belgilang.'),\n  no_client:L('Блокировать можно магазин, у которого есть запись у вас: заказ или профиль в вашем каталоге','Faqat sizda yozuvi bor doʻkonni bloklash mumkin: buyurtma yoki katalogingizdagi profil'),\n  not_found:L('Записи уже нет. Обновите список.','Yozuv topilmadi. Roʻyxatni yangilang.')\n}[e]||L('Не получилось. Проверьте соединение и попробуйте ещё раз.','Bajarib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.'));\nconst dupTxt=x=>L('Такой магазин уже есть в базе: «'+(x&&x.name||'')+'»'+(x&&x.terr&&terrName(x.terr)?' ('+terrName(x.terr)+')':'')+'. Повторно добавить нельзя'+(x&&x.mine?'. Откройте его в списке и исправьте данные.':': его ведёт другой агент.'),\n  'Bunday doʻkon bazada bor: «'+(x&&x.name||'')+'»'+(x&&x.terr&&terrName(x.terr)?' ('+terrName(x.terr)+')':'')+'. Qayta qoʻshib boʻlmaydi'+(x&&x.mine?'. Uni roʻyxatdan ochib, maʼlumotlarni tuzating.':': uni boshqa agent yuritadi.'));\nasync function loadBase(reset){\n  const b=S.base,seq=++b.seq;\n  const r=await api('GET','/api/hub/base?terr='+encodeURIComponent(b.terr)+'&f='+encodeURIComponent(b.f)+'&ag='+encodeURIComponent(b.ag)+'&sort='+encodeURIComponent(b.sort)+(b.sort==='near'&&b.near?'&lat='+b.near.lat+'&lng='+b.near.lng:'')+'&q='+encodeURIComponent(b.q)+(isOwner()||!isAgent()?'&sh='+encodeURIComponent(baseShop())+(b.mc?'&mine=1':''):'')+'&off='+(reset?0:b.items.length));\n  if(seq!==b.seq)return;\n  if(!r.ok||!r.data||!Array.isArray(r.data.items)){\n    if(!b.loaded)b.err=true;else toast(baseErr(r.data&&r.data.error));\n    if(S.view==='base')renderBase();\n    return;\n  }\n  const d=r.data,first=!b.loaded;\n  Object.assign(b,{role:d.role,total:d.total,all:d.all,counts:d.counts||{},unchk:d.unchk||0,terrs:d.terrs||[],mine:d.mine||[],agents:d.agents||[],more:!!d.more,loaded:true,err:false});\n  b.items=reset?d.items:b.items.concat(d.items);\n  if(S.view!=='base')return;\n  if(first)renderBase();else paintBase();\n}\n/* фильтры экрана не переживают выход с него: при новом заходе список полный */\nfunction baseResetUI(){Object.assign(S.base,{terr:'',f:'',ag:'',sort:'',q:'',mc:false,sheet:false,legend:false,cd:'',cx:null,cdd:null,cf:null,cbusy:false,edit:null,ferr:''});S.base.cseq++;setScrollLock()}\nfunction setScrollLock(){const b=S.base,v=S.rv;document.documentElement.classList.toggle('sh-open',!!((S.view==='base'&&(b.sheet||b.legend||b.cd))||(S.view==='review'&&(v.ret||v.edit))))}\nconst ICO={\n  talk:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 5.5h16v11H10l-4.5 3.5v-3.5H4z\"/></svg>',\n  app:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"7\" y=\"2.5\" width=\"10\" height=\"19\" rx=\"2.5\"/><path d=\"M11 18.2h2\"/></svg>',\n  refuse:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6.5 6.5l11 11M17.5 6.5l-11 11\"/></svg>',\n  warn:'<b aria-hidden=\"true\">!</b>',\n  copy:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"9\" y=\"9\" width=\"11\" height=\"11\" rx=\"2.5\"/><path d=\"M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9\"/></svg>',\n  ok:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"/></svg>',\n  edit:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z\"/><path d=\"M14.5 6.5l3 3\"/></svg>',\n  del:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5\"/></svg>',\n  tel:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 4h4l1.5 4-2 1.3a11 11 0 0 0 5.2 5.2L15 12.5l4 1.5v4a1.5 1.5 0 0 1-1.6 1.5C10.7 19 5 13.3 4.5 5.6A1.5 1.5 0 0 1 5 4z\"/></svg>',\n  chev:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6 9.5l6 6 6-6\"/></svg>',\n  pin:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.3\"/></svg>',\n  filt:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 7h9M17 7h3M4 17h3M11 17h9\"/><circle cx=\"15\" cy=\"7\" r=\"2\"/><circle cx=\"9\" cy=\"17\" r=\"2\"/></svg>'\n};\n/* знаки на карточке: что значит каждый — в окне «?»; нажатие на знак оставляет в списке только такие магазины */\nconst SIGNS=()=>({\n  talk:{f:'talk',name:L('Переговоры','Muzokara'),txt:L('Идут переговоры','Muzokaralar bormoqda')},\n  warn:{f:'chk',name:L('Не проверен','Tekshirilmagan'),txt:L('Данные ввёл сам магазин (профиль или заказ), агент ещё не проверил','Maʼlumotlarni doʻkonning oʻzi kiritgan (profil yoki buyurtma), agent hali tekshirmagan')},\n  app:{f:'app',name:L('В приложении','Ilovada'),txt:L('Магазин уже пользуется приложением: заполнил профиль или заказывал','Doʻkon ilovadan foydalanmoqda: profilni toʻldirgan yoki buyurtma bergan')},\n  refuse:{f:'refuse',name:L('Отказался','Rad etdi'),txt:L('Магазин отказался, карточка затемнена','Doʻkon rad etdi, kartochka xiralashtirilgan')}\n});\nconst signOf=x=>{const o=[],w=baseW();if(w&&x.st==='talk')o.push('talk');if(w&&!x.chk)o.push('warn');if(x.app)o.push('app');if(w&&x.st==='refuse')o.push('refuse');return o};\nconst BSTAT=()=>[['','Любые','Har qanday'],['new','Новые','Yangi'],['chk','Не проверены','Tekshirilmagan'],['talk','Переговоры','Muzokara'],['app','В приложении','Ilovada'],['refuse','Отказались','Rad etganlar']];\nconst bFilterN=()=>{const b=S.base;return (b.f?1:0)+(b.ag?1:0)+(b.sort?1:0)};\nconst bAgName=id=>id==='-'?L('Без агента','Agentsiz'):((S.base.agents.find(a=>a.id===id)||{}).name||'');\nfunction renderBase(){\n  const b=S.base,ag=S.hub.me&&S.hub.me.agent,w=baseW();\n  let h='<div class=\"wrap page bpage\">';\n  if(!b.loaded&&!b.err)h+='<h1>'+L('База магазинов','Doʻkonlar bazasi')+'</h1><div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!b.loaded)h+='<h1>'+L('База магазинов','Doʻkonlar bazasi')+'</h1><div class=\"empty\"><b>'+L('Не удалось загрузить','Yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"basereload\">'+L('Повторить','Qayta urinish')+'</button></div>';\n  else{\n    h+='<div class=\"btop\"><h1 id=\"btitle\"></h1><button type=\"button\" class=\"qbtn\" data-act=\"blegend\" aria-label=\"'+esc(L('Что значат знаки','Belgilar nimani anglatadi'))+'\">?</button>'\n      +(w?'<button type=\"button\" class=\"btn\" data-act=\"basenew\">＋ '+L('Добавить','Qoʻshish')+'</button>':'')+'</div>';\n    if(b.role==='agent'&&ag&&ag.link)h+='<div class=\"alink\"><span class=\"mono small\" title=\"'+esc(L('Ссылка для магазинов: после первого заказа магазин закрепится за вами','Doʻkonlar uchun havola: birinchi buyurtmadan keyin doʻkon sizga biriktiriladi'))+'\">'+esc(ag.link.replace(/^https?:\\/\\//,''))+'</span><button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(ag.link)+'\" data-ok=\"'+esc(L('Ссылка скопирована','Havola nusxalandi'))+'\" data-lab=\"\">'+L('Копировать','Nusxalash')+'</button></div>';\n    h+='<div class=\"search\"><input type=\"search\" id=\"bq\" data-bq=\"1\" value=\"'+esc(b.q)+'\" placeholder=\"'+esc(L('Название, адрес, телефон','Nomi, manzil, telefon'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Поиск','Qidiruv'))+'\"></div><div id=\"bbody\"></div><div id=\"bsheet\"></div>';\n  }\n  view.innerHTML=h+'</div>';\n  if(b.loaded)paintBase();\n}\nfunction baseCardHTML(x){\n  const w=baseW(),b=S.base,sg=signOf(x),SG=SIGNS();\n  const signs=sg.map(k=>w?'<button type=\"button\" class=\"sgn '+k+'\" data-act=\"bsign\" data-v=\"'+SG[k].f+'\" aria-label=\"'+esc(SG[k].name+'. '+L('Показать только такие','Faqat shundaylarini koʻrsatish'))+'\">'+ICO[k]+'</button>'\n    :'<span class=\"sgn '+k+'\" role=\"img\" aria-label=\"'+esc(SG[k].name)+'\">'+ICO[k]+'</span>').join('');\n  const tn=terrName(x.terr);\n  const canDel=b.role==='owner'||(b.role==='agent'&&!x.app);\n  const ib=(cls,act,ico,lab,extra)=>'<button type=\"button\" class=\"ibtn'+cls+'\" data-act=\"'+act+'\" data-id=\"'+esc(x.id)+'\" aria-label=\"'+esc(lab)+'\"'+(extra||'')+'>'+ICO[ico]+'</button>';\n  return '<article class=\"bcard bst'+(w&&x.st==='refuse'?' dim':'')+'\"><div class=\"bh\"><h3>'+esc(x.name)+'</h3>'+(signs?'<span class=\"bsigns\">'+signs+'</span>':'')+'<span class=\"dtag\">'+esc(tn||(w?L('без района','rayonsiz'):''))+'</span></div>'\n    +(x.addr?'<div class=\"dmeta\">'+esc(x.addr)+'</div>':'')\n    +(w&&x.note?'<div class=\"bnote\">'+esc(x.note)+'</div>':'')\n    +baseLocHTML(x)\n    +(b.role!=='agent'?baseMineHTML(x):'')\n    +'<div class=\"bact'+(w&&!x.chk&&canDel?' tight':'')+'\"><a class=\"bphone\" href=\"'+esc(telHref(x.phone))+'\">'+ICO.tel+'<span>'+esc(x.phone)+'</span></a>'\n    +'<div class=\"bic\"><button type=\"button\" class=\"ibtn\" data-act=\"copy\" data-v=\"'+esc(x.phone)+'\" data-ok=\"'+esc(L('Телефон скопирован','Telefon nusxalandi'))+'\" data-lab=\"\" aria-label=\"'+esc(L('Копировать телефон','Telefonni nusxalash'))+'\">'+ICO.copy+'</button>'\n    +(w?(!x.chk?ib(' ok','basechk','ok',L('Проверено','Tekshirildi'),b.busy?' disabled':''):'')+ib('','baseedit','edit',L('Изменить','Tahrirlash'))+(canDel?ib('','basedel','del',L('Удалить','Oʻchirish'),b.busy?' disabled':''):''):'')\n    +'</div></div></article>';\n}\nfunction baseFormHTML(){\n  const b=S.base,f=b.fm,agent=b.role==='agent';\n  const tl=agent&&b.mine.length?b.terrs.filter(t=>b.mine.includes(t.id)):b.terrs;\n  const opt=(v,lab,cur)=>'<option value=\"'+esc(v)+'\"'+(v===cur?' selected':'')+'>'+esc(lab)+'</option>';\n  return '<div class=\"card\" id=\"bform\"><h3>'+(b.edit==='new'?L('Новый магазин','Yangi doʻkon'):L('Данные магазина','Doʻkon maʼlumotlari'))+'</h3><div class=\"form\">'\n    +'<div class=\"full\"><label class=\"lab\" for=\"bf-name\">'+L('Название магазина','Doʻkon nomi')+'</label><input type=\"text\" id=\"bf-name\" data-bf=\"name\" maxlength=\"60\" value=\"'+esc(f.name)+'\" autocomplete=\"off\"></div>'\n    +'<div><label class=\"lab\" for=\"bf-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"bf-phone\" data-bf=\"phone\" value=\"'+esc(f.phone)+'\" placeholder=\"+998 90 123 45 67\" autocomplete=\"off\"></div>'\n    +'<div><label class=\"lab\" for=\"bf-terr\">'+L('Территория','Hudud')+'</label><select id=\"bf-terr\" data-bf=\"terr\">'+opt('',agent?L('Выберите территорию','Hududni tanlang'):L('Без территории','Hududsiz'),f.terr)+tl.map(t=>opt(t.id,t.name,f.terr)).join('')+'</select></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"bf-addr\">'+L('Адрес','Manzil')+'</label><input type=\"text\" id=\"bf-addr\" data-bf=\"addr\" maxlength=\"200\" value=\"'+esc(f.addr)+'\" autocomplete=\"off\"></div>'\n    +'<div><label class=\"lab\" for=\"bf-st\">'+L('Статус','Holat')+'</label><select id=\"bf-st\" data-bf=\"st\">'+['new','talk','refuse'].map(k=>opt(k,BST()[k],f.st)).join('')+'</select></div>'\n    +(b.role==='owner'?'<div><label class=\"lab\" for=\"bf-agent\">'+L('Агент','Agent')+'</label><select id=\"bf-agent\" data-bf=\"agent\">'+opt('','—',f.agent)+b.agents.map(a=>opt(a.id,a.name,f.agent)).join('')+'</select></div>':'')\n    +baseLocFormHTML()\n    +'<div class=\"full\"><label class=\"lab\" for=\"bf-note\">'+L('Заметка о визите (магазин и дистрибьюторы её не видят)','Tashrif haqida eslatma (doʻkon va distribyutorlar koʻrmaydi)')+'</label><textarea id=\"bf-note\" data-bf=\"note\" rows=\"3\" maxlength=\"500\">'+esc(f.note)+'</textarea></div>'\n    +'</div><div class=\"err\" id=\"bferr\" role=\"alert\">'+esc(b.ferr)+'</div>'\n    +'<div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn\" data-act=\"basesave\"'+(b.busy?' disabled':'')+'>'+(b.busy?L('Сохраняем…','Saqlanmoqda…'):L('Сохранить','Saqlash'))+'</button><button type=\"button\" class=\"btn ghost\" data-act=\"basecancel\"'+(b.busy?' disabled':'')+'>'+L('Отмена','Bekor qilish')+'</button></div></div>';\n}\nfunction bChip(act,k,v,lab,n,on){return '<button type=\"button\" class=\"chip\" data-act=\"'+act+'\" data-k=\"'+k+'\" data-v=\"'+esc(v)+'\" aria-pressed=\"'+on+'\">'+esc(lab)+(n!==undefined?'<span class=\"cnt\">'+n+'</span>':'')+'</button>'}\n/* все добавленные районы, даже пока без клиентов; число — с учётом остальных фильтров. Агенту — его территории */\nfunction bTerrList(){\n  const b=S.base,w=baseW();\n  const src=b.role==='agent'&&b.mine.length?b.terrs.filter(t=>b.mine.includes(t.id)):b.terrs;   // агент видит свои районы\n  const l=src.map(t=>({id:t.id,name:t.name,n:b.counts[t.id]||0}));\n  if(w&&(b.counts['']||b.terr==='-'))l.push({id:'-',name:L('Без района','Rayonsiz'),n:b.counts['']||0});\n  return l;\n}\nfunction paintBase(){\n  const el=$('#bbody');if(!el)return;\n  const b=S.base,w=baseW(),owner=b.role==='owner';\n  const ti=$('#btitle');if(ti)ti.textContent=L('База магазинов','Doʻkonlar bazasi')+' · '+num(b.all);\n  let h=b.edit!==null?baseFormHTML():'';\n  if(!b.all){\n    h+='<div class=\"empty\"><b>'+L('База пока пустая','Baza hozircha boʻsh')+'</b>'+(w?L('Магазин попадает сюда сам, когда заполнит профиль или сделает первый заказ. Ещё можно добавить магазин вручную: кнопка «Добавить».','Doʻkon profilni toʻldirganda yoki birinchi buyurtma berganda oʻzi shu yerga tushadi. Qoʻlda ham qoʻshish mumkin: «Qoʻshish» tugmasi.'):L('Магазины появятся здесь, когда заполнят профиль или сделают первый заказ.','Doʻkonlar profilni toʻldirganda yoki birinchi buyurtma berganda shu yerda paydo boʻladi.'))+'</div>';\n    el.innerHTML=h;paintSheet();return;\n  }\n  const tl=bTerrList(),cur=b.terr&&tl.find(t=>t.id===b.terr);\n  const tsum=Object.keys(b.counts).reduce((a,k)=>a+b.counts[k],0);\n  let bar='<div class=\"bbar\">';\n  if(w)bar+='<button type=\"button\" class=\"chip fbtn'+(bFilterN()?' on':'')+'\" data-act=\"bsheet\" aria-haspopup=\"dialog\">'+ICO.filt+L('Фильтры','Filtrlar')+(bFilterN()?'<span class=\"cnt2\">'+bFilterN()+'</span>':'')+'</button>';\n  if(b.role!=='agent')bar+='<button type=\"button\" class=\"chip'+(b.mc?' on':'')+'\" data-act=\"bmine\" aria-pressed=\"'+b.mc+'\">'+(owner?L('С заказами','Buyurtmalilar'):L('Мои клиенты','Mening mijozlarim'))+'</button>';\n  bar+='<div class=\"chip selc'+(b.terr?' on':'')+'\"><span>'+esc(cur?cur.name:L('Все районы','Barcha rayonlar'))+'</span>'+ICO.chev\n    +'<select data-bterr=\"1\" aria-label=\"'+esc(L('Район','Rayon'))+'\"><option value=\"\"'+(b.terr?'':' selected')+'>'+esc(L('Все районы','Barcha rayonlar'))+' · '+tsum+'</option>'\n    +tl.map(t=>'<option value=\"'+esc(t.id)+'\"'+(b.terr===t.id?' selected':'')+'>'+esc(t.name)+' · '+t.n+'</option>').join('')+'</select></div>';\n  if(w&&b.f){const nm=(BSTAT().find(x=>x[0]===b.f)||[])[1];bar+='<button type=\"button\" class=\"chip on x\" data-act=\"bclr\" data-k=\"f\">'+esc(L(nm||'',(BSTAT().find(x=>x[0]===b.f)||[])[2]||''))+'<span class=\"xx\" aria-hidden=\"true\">✕</span><span class=\"sr\">'+esc(L('Сбросить','Bekor qilish'))+'</span></button>'}\n  if(w&&b.sort==='near')bar+='<button type=\"button\" class=\"chip on x\" data-act=\"bclr\" data-k=\"sort\">'+ICO.pin+L('Ближайшие','Eng yaqinlari')+'<span class=\"xx\" aria-hidden=\"true\">✕</span><span class=\"sr\">'+esc(L('Сбросить','Bekor qilish'))+'</span></button>';\n  if(owner&&b.ag)bar+='<button type=\"button\" class=\"chip on x\" data-act=\"bclr\" data-k=\"ag\">'+esc(bAgName(b.ag))+'<span class=\"xx\" aria-hidden=\"true\">✕</span><span class=\"sr\">'+esc(L('Сбросить','Bekor qilish'))+'</span></button>';\n  bar+='</div>';\n  h+=bar+'<div class=\"bfrow\"><div class=\"bfound\">'+L('Найдено: ','Topildi: ')+num(b.total)+'</div>'+(b.role!=='agent'&&baseShop()?xbtn('clients','','bxport'):'')+'</div>';\n  h+=b.items.length?b.items.map(baseCardHTML).join(''):'<div class=\"empty\"><b>'+L('Никого не найдено','Hech kim topilmadi')+'</b>'+(b.mc&&!b.q&&!b.f&&!b.terr&&!b.ag?(owner?L('Пока никто не заказывал. Нажмите «С заказами», чтобы увидеть всю базу.','Hozircha hech kim buyurtma bermagan. Butun bazani koʻrish uchun «Buyurtmalilar» tugmasini bosing.'):L('У вас ещё никто не заказывал. Нажмите «Мои клиенты», чтобы увидеть всю базу.','Sizdan hali hech kim buyurtma bermagan. Butun bazani koʻrish uchun «Mening mijozlarim» tugmasini bosing.')):L('Измените поиск или фильтры.','Qidiruv yoki filtrlarni oʻzgartiring.'))+'</div><div class=\"row-btns\" style=\"justify-content:center;margin-bottom:14px\"><button type=\"button\" class=\"btn ghost\" data-act=\"breset\">'+L('Сбросить фильтры','Filtrlarni tozalash')+'</button></div>';\n  if(b.more)h+='<div class=\"row-btns\" style=\"justify-content:center;margin-bottom:14px\"><button type=\"button\" class=\"btn ghost\" data-act=\"basemore\">'+L('Показать ещё','Yana koʻrsatish')+'</button></div>';\n  el.innerHTML=h;\n  paintSheet();\n}\n/* нижняя панель: фильтры и пояснение знаков */\nfunction paintSheet(){\n  const el=$('#bsheet');if(!el)return;\n  const b=S.base,w=baseW(),owner=b.role==='owner';\n  setScrollLock();\n  if(b.cd){el.innerHTML=clientSheetHTML();return}\n  if(b.legend){\n    const SG=SIGNS(),ks=w?['talk','warn','app','refuse']:['app'];\n    el.innerHTML='<div class=\"fs-bg\" data-act=\"bsheetx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Что значат знаки','Belgilar nimani anglatadi'))+'\"><div class=\"fs-grab\"></div>'\n      +'<div class=\"fs-head\"><h2>'+L('Что значат знаки','Belgilar nimani anglatadi')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"bsheetx\">'+L('Закрыть','Yopish')+'</button></div><div class=\"fs-body\">'\n      +ks.map(k=>(w?'<button type=\"button\" class=\"lgd\" data-act=\"bsign\" data-v=\"'+SG[k].f+'\">':'<div class=\"lgd\">')+'<span class=\"sgn '+k+'\">'+ICO[k]+'</span><span><b>'+esc(SG[k].name)+'</b><small>'+esc(SG[k].txt)+'</small></span>'+(w?'</button>':'</div>')).join('')\n      +'<p class=\"lgn\">'+(w?L('Нет знака — магазин новый или уже проверен. Нажмите на знак, и в списке останутся только такие магазины.','Belgi yoʻq — doʻkon yangi yoki allaqachon tekshirilgan. Belgini bossangiz, roʻyxatda faqat shunday doʻkonlar qoladi.'):L('Нет знака — магазин ещё не пользуется приложением.','Belgi yoʻq — doʻkon ilovadan hali foydalanmayapti.'))+'</p></div></div>';\n    return;\n  }\n  if(!b.sheet||!w){el.innerHTML='';return}\n  const grp=(t,body)=>'<div class=\"fs-g\"><div class=\"fs-t\">'+t+'</div><div class=\"fs-c\">'+body+'</div></div>';\n  let h=grp(L('Статус','Holat'),BSTAT().map(x=>bChip('bset','f',x[0],L(x[1],x[2]),x[0]==='chk'?b.unchk:undefined,b.f===x[0])).join(''));\n  const tl=bTerrList(),tsum=Object.keys(b.counts).reduce((a,k)=>a+b.counts[k],0);\n  h+=grp(L('Район','Rayon'),bChip('bset','terr','',L('Все','Hammasi'),tsum,b.terr==='')+tl.map(t=>bChip('bset','terr',t.id,t.name,t.n,b.terr===t.id)).join(''));\n  if(owner)h+=grp(L('Агент','Agent'),bChip('bset','ag','',L('Все','Hammasi'),undefined,b.ag==='')+b.agents.map(a=>bChip('bset','ag',a.id,a.name,undefined,b.ag===a.id)).join('')+bChip('bset','ag','-',L('Без агента','Agentsiz'),undefined,b.ag==='-'));\n  h+=grp(L('Порядок','Tartib'),bChip('bset','sort','',L('По названию','Nomi boʻyicha'),undefined,b.sort==='')+bChip('bset','sort','new',L('Сначала новые','Avval yangilari'),undefined,b.sort==='new')+bChip('bset','sort','near',L('Ближайшие','Eng yaqinlari'),undefined,b.sort==='near'));\n  const n=b.total;\n  el.innerHTML='<div class=\"fs-bg\" data-act=\"bsheetx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Фильтры','Filtrlar'))+'\"><div class=\"fs-grab\"></div>'\n    +'<div class=\"fs-head\"><h2>'+L('Фильтры','Filtrlar')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"breset\">'+L('Сбросить','Tozalash')+'</button></div><div class=\"fs-body\">'+h+'</div>'\n    +'<div class=\"fs-foot\"><button type=\"button\" class=\"btn\" data-act=\"bsheetx\">'+L('Показать '+n+' '+plShop(n),n+' ta doʻkonni koʻrsatish')+'</button></div></div>';\n}\nconst plShop=n=>{const a=n%100,b=n%10;return a>10&&a<15?'магазинов':b===1?'магазин':b>1&&b<5?'магазина':'магазинов'};\nfunction baseOpenForm(x){\n  const b=S.base;\n  let terr=x?x.terr:(b.terr&&b.terr!=='-'?b.terr:'');\n  if(!x&&b.role==='agent'&&!terr&&b.mine.length===1)terr=b.mine[0];\n  b.edit=x?x.id:'new';b.ferr='';\n  b.fm=x?{name:x.name,phone:x.phone,addr:x.addr||'',terr:x.terr||'',st:x.st||'new',note:x.note||'',agent:x.agent||'',loc:x.loc?{lat:x.loc.lat,lng:x.loc.lng}:null,locDirty:false}:{name:'',phone:'',addr:'',terr,st:'new',note:'',agent:'',loc:null,locDirty:false};b.link='';\n  paintBase();\n  const f=$('#bform');if(f)try{f.scrollIntoView({block:'start',behavior:'smooth'})}catch(e){}\n}\nasync function baseSave(){\n  const b=S.base;if(b.busy||b.edit===null)return;\n  const f=b.fm,body={name:f.name.trim(),phone:f.phone.trim(),addr:f.addr.trim(),terr:f.terr,st:f.st,note:f.note.trim()};\n  if(b.role==='owner')body.agent=f.agent||'';\n  if(f.locDirty)body.loc=f.loc?{lat:f.loc.lat,lng:f.loc.lng}:null;   // точку шлём, только если её меняли\n  if(body.name.length<2){b.ferr=baseErr('bad_name');paintBase();return}\n  if(body.phone.replace(/\\D/g,'').length<9){b.ferr=baseErr('bad_phone');paintBase();return}\n  const isNew=b.edit==='new';\n  b.busy=true;b.ferr='';paintBase();\n  const r=await api(isNew?'POST':'PUT','/api/hub/base'+(isNew?'':'/'+encodeURIComponent(b.edit)),body);\n  b.busy=false;\n  if(!r.ok||!r.data){b.ferr=r.data&&r.data.error==='dup'?dupTxt(r.data.exists):baseErr(r.data&&r.data.error);paintBase();return}\n  b.edit=null;\n  toast(isNew?L('Магазин добавлен в базу','Doʻkon bazaga qoʻshildi'):L('Данные сохранены','Maʼlumotlar saqlandi'));\n  loadBase(true);\n}\nasync function baseCheck(id){\n  const b=S.base;if(b.busy)return;\n  b.busy=true;paintBase();\n  const r=await api('PUT','/api/hub/base/'+encodeURIComponent(id),{});\n  b.busy=false;\n  if(!r.ok||!r.data){toast(baseErr(r.data&&r.data.error));paintBase();return}\n  toast(L('Отмечено: данные проверены','Belgilandi: maʼlumotlar tekshirildi'));\n  loadBase(true);\n}\nfunction baseDelete(id){\n  const x=S.base.items.find(y=>y.id===id);if(!x||S.base.busy)return;\n  askConfirm(L('Удалить магазин «'+x.name+'» из базы?','«'+x.name+'» doʻkonini bazadan oʻchirasizmi?'),async()=>{\n    const b=S.base;b.busy=true;paintBase();\n    const r=await api('DELETE','/api/hub/base/'+encodeURIComponent(id));\n    b.busy=false;\n    if(!r.ok){toast(baseErr(r.data&&r.data.error));paintBase();return}\n    toast(L('Магазин удалён из базы','Doʻkon bazadan oʻchirildi'));\n    loadBase(true);\n  });\n}\nconst ownErr=e=>({\n  main_shop:L('Первого дистрибьютора (вашу компанию) удалить нельзя','Birinchi distribyutorni (sizning kompaniyangizni) oʻchirib boʻlmaydi'),\n  not_found:L('Уже удалён. Обновите страницу.','Allaqachon oʻchirilgan. Sahifani yangilang.'),\n  bad_name:L('Название — от 2 символов','Nomi kamida 2 belgi boʻlsin'),\n  too_many:L('Больше дистрибьюторов добавить нельзя','Boshqa distribyutor qoʻshib boʻlmaydi'),\n  bad_pct:L('Процент — число от 0 до 50','Foiz — 0 dan 50 gacha son'),\n  weak_code:L('Код должен быть не короче 12 символов','Kod kamida 12 belgidan iborat boʻlsin'),\n  code_taken:L('Такой код уже занят, придумайте другой','Bu kod band, boshqasini oʻylab toping'),\n  forbidden:L('Раздел только для владельца','Boʻlim faqat egasi uchun')\n}[e]||L('Не получилось. Проверьте соединение и попробуйте ещё раз.','Bajarib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.'));\n/* перерисовывает раздел владельца, но не сбивает того, кто сейчас печатает в поле */\nfunction ownRefresh(){\n  if(S.view!=='owner')return;\n  const ae=document.activeElement;\n  if(ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)&&view.contains(ae))return;\n  renderOwner();\n}\n/* Спорные записи по всем дистрибьюторам: магазин ответил «Не так», не получил сообщение или молчит больше суток. */\nasync function loadDisputes(){\n  if(!isOwner())return;\n  const r=await api('GET','/api/hub/admin/disputes');\n  if(!r.ok||!r.data||!Array.isArray(r.data.items))return;\n  const D=S.own.disp,same=D.ok&&JSON.stringify(r.data.items)===JSON.stringify(D.items);\n  D.ok=true;D.items=r.data.items;\n  const cnt=r.data.items.length,chg=cnt!==S.own.dn;\n  S.own.dn=cnt;\n  if(chg)renderNav();\n  if(!same&&S.view==='owner'&&S.own.sec==='disp')ownRefresh();\n}\nconst dispKey=x=>x.did+'-'+(x.h?x.cid:x.uid)+'-'+x.n;\n/* Сдача денег доставщиком: спорная запись (h=1) или просрочка (h=2, закрывать нечем: нужно, чтобы доставщик сдал деньги). */\nfunction dispHandHTML(x){\n  const key=dispKey(x),D=S.own.disp;\n  if(x.h===2)return '<div class=\"dsp\"><div class=\"dn\"><b>'+L('Доставщик ','Yetkazuvchi ')+esc(x.cn||'')+'</b></div>'\n    +'<div class=\"dpw\"><b>'+esc(x.shopName||x.did)+'</b> · '+L('не сдал деньги: на руках ','pulni topshirmadi: qoʻlida ')+money(x.a)+'</div>'\n    +'<div class=\"dpw\">'+(x.t?L('Самые старые деньги с ','Eng eski pul ')+esc(jrDate(x.t)):'')+'</div>'\n    +'<span class=\"cfs\"><span class=\"cfc bad\">'+L('Просрочка сдачи: '+x.late+' дн.','Topshirish kechikishi: '+x.late+' kun')+'</span></span></div>';\n  const why=x.cf==='no'?L('Доставщик: «Не так»','Yetkazuvchi: «Notoʻgʻri»'):x.cf==='na'?L('Доставщик не получил сообщение','Yetkazuvchi xabarni olmadi'):L('Доставщик молчит больше суток','Yetkazuvchi bir sutkadan ortiq jim');\n  const what=x.k==='ox'?L('Отмена сдачи: ','Topshirish bekor qilindi: ')+money(x.a)+(x.why?' · '+esc(x.why):''):L('Сдача денег: ','Pul topshirish: ')+money(x.a);\n  return '<div class=\"dsp\"><div class=\"dn\"><b>'+L('Доставщик ','Yetkazuvchi ')+esc(x.cn||'')+'</b></div>'\n    +'<div class=\"dpw\"><b>'+esc(x.shopName||x.did)+'</b> · '+what+'</div>'\n    +'<div class=\"dpw\">'+esc(jrDate(x.t))+(x.bn?' · '+L('Записал: ','Yozgan: ')+esc(x.bn):'')+'</div>'\n    +'<span class=\"cfs\"><span class=\"cfc bad\">'+why+'</span></span>'\n    +'<div class=\"pyrow\"><input type=\"text\" id=\"dn-'+esc(key)+'\" data-dnote=\"'+esc(key)+'\" maxlength=\"120\" value=\"'+esc(D.note[key]||'')+'\" placeholder=\"'+esc(L('Комментарий (обязательно)','Izoh (majburiy)'))+'\"'+(D.busy===key?' disabled':'')+'>'\n    +'<button type=\"button\" class=\"btn sm\" data-act=\"dispres\" data-did=\"'+esc(x.did)+'\" data-cid=\"'+esc(x.cid)+'\" data-n=\"'+x.n+'\"'+(D.busy?' disabled':'')+'>'+L('Закрыть','Yopish')+'</button></div></div>';\n}\nfunction dispCardHTML(x){\n  if(x.h)return dispHandHTML(x);\n  const key=dispKey(x),D=S.own.disp;\n  const why=x.cf==='no'?L('Магазин: «Не так»','Doʻkon: «Notoʻgʻri»'):x.cf==='na'?L('Магазин не получил сообщение','Doʻkon xabarni olmadi'):L('Магазин молчит больше суток','Doʻkon bir sutkadan ortiq jim');\n  const what=x.k==='ac'?L('Акт сверки '+(x.f?fDay(x.f)+' – ':'до ')+fDay(x.e)+': ','Solishtirma dalolatnoma '+(x.f?fDay(x.f)+' – ':'')+fDay(x.e)+': ')+balWords(x.cb)\n    :x.k==='ch'?L('Выдача в долг '+esc(x.ref||'')+': ','Qarzga berildi '+esc(x.ref||'')+': ')+money(x.a):L('Оплата долга: ','Qarz toʻlovi: ')+esc(payName(x.m))+' '+money(x.a);\n  return '<div class=\"dsp\"><div class=\"dn\"><b>'+esc(x.name||('ID '+x.uid))+'</b><small>'+esc([x.org,x.phone].filter(Boolean).join(' · '))+'</small></div>'\n    +'<div class=\"dpw\"><b>'+esc(x.shopName||x.did)+'</b> · '+what+'</div>'\n    +'<div class=\"dpw\">'+esc(jrDate(x.t))+(x.bn?' · '+L('Записал: ','Yozgan: ')+esc(x.bn):'')+'</div>'\n    +'<span class=\"cfs\"><span class=\"cfc bad\">'+why+'</span></span>'\n    +'<div class=\"pyrow\"><input type=\"text\" id=\"dn-'+esc(key)+'\" data-dnote=\"'+esc(key)+'\" maxlength=\"120\" value=\"'+esc(D.note[key]||'')+'\" placeholder=\"'+esc(L('Комментарий (обязательно)','Izoh (majburiy)'))+'\"'+(D.busy===key?' disabled':'')+'>'\n    +'<button type=\"button\" class=\"btn sm\" data-act=\"dispres\" data-did=\"'+esc(x.did)+'\" data-uid=\"'+x.uid+'\" data-n=\"'+x.n+'\"'+(D.busy?' disabled':'')+'>'+L('Закрыть','Yopish')+'</button></div></div>';\n}\nfunction ownDispHTML(){\n  const D=S.own.disp;\n  if(!D.ok)return loadingHTML();\n  const lead='<p class=\"lead\">'+L('Записи о долгах, оплатах и сдаче денег доставщиками, по которым стороны не сошлись: магазин или доставщик ответил «Не так», не получил сообщение или молчит больше суток. Здесь же доставщики, которые не сдали деньги в срок. Разберитесь и закройте запись с комментарием: он останется в журнале вместе с вашим именем.','Qarz, toʻlov va yetkazuvchilar pul topshirishi yozuvlari, boʻyicha tomonlar kelisha olmagan: doʻkon yoki yetkazuvchi «Notoʻgʻri» dedi, xabarni olmadi yoki bir sutkadan ortiq jim. Shu yerda pulni muddatida topshirmagan yetkazuvchilar ham koʻrinadi. Hal qiling va yozuvni izoh bilan yoping: u ismingiz bilan jurnalda qoladi.')+'</p>';\n  if(!D.items.length)return lead+'<div class=\"empty\"><b>'+L('Спорных записей нет','Bahsli yozuvlar yoʻq')+'</b>'+L('Все записи подтверждены или закрыты, деньги сданы в срок.','Hamma yozuvlar tasdiqlangan yoki yopilgan, pul muddatida topshirilgan.')+'</div>';\n  return lead+'<div class=\"dlist\">'+D.items.map(dispCardHTML).join('')+'</div>';\n}\nasync function dispResolve(did,uid,n,cid){\n  const D=S.own.disp,key=did+'-'+(cid||uid)+'-'+n;\n  if(D.busy)return;\n  const el=document.getElementById('dn-'+key);\n  if(el)D.note[key]=el.value;\n  const note=String(D.note[key]||'').trim();\n  if(note.length<3){toast(L('Напишите комментарий (от 3 букв)','Izoh yozing (kamida 3 ta harf)'));if(el)el.focus();return}\n  D.busy=key;renderOwner();\n  const r=await api('POST','/api/hub/admin/disputes/resolve',cid?{did,cid,n,note}:{did,uid,n,note});\n  D.busy='';\n  if(!r.ok){toast(r.status===409?L('Эта запись уже закрыта или ещё не спорная','Bu yozuv allaqachon yopilgan yoki hali bahsli emas'):L('Не удалось закрыть запись','Yozuvni yopib boʻlmadi'))}\n  else{delete D.note[key];toast(cid?L('Спор закрыт. Доставщик получил комментарий.','Bahs yopildi. Yetkazuvchi izohni oldi.'):L('Спор закрыт. Магазин получил комментарий.','Bahs yopildi. Doʻkon izohni oldi.'))}\n  renderOwner();loadDisputes();\n}\nasync function loadOwner(){\n  if(!isOwner())return;\n  loadDisputes();\n  loadOwnerStats();\n  loadOwnerPeople();\n  loadOwnerWho();\n  const r=await api('GET','/api/hub/admin/shops');\n  const o=S.own;\n  if(!r.ok||!r.data){o.err=true;o.loaded=true;if(S.view==='owner')renderOwner();return}\n  o.shops=r.data.shops||[];o.title=r.data.title||'';o.max=r.data.max||50;o.err=false;o.loaded=true;\n  ownRefresh();\n}\nasync function loadOwnerStats(){\n  if(!isOwner())return;\n  const o=S.own,per=o.period;\n  const r=await api('GET','/api/hub/admin/stats?period='+encodeURIComponent(per));\n  if(per!==o.period)return;   // пока грузилось, выбрали другой период\n  if(r.ok&&r.data&&Array.isArray(r.data.rows)){o.stats=r.data;o.serr=false}\n  else o.serr=true;\n  ownRefresh();\n}\nconst fmtPct=p=>String(p).replace('.',',');\n/* «Заказы и комиссия»: сводка по всем дистрибьюторам за выбранный период. Составы заказов и клиенты здесь не показываются. */\nfunction ownStatsHTML(){\n  const o=S.own,st=o.stats;\n  const per=[['7d',L('7 дней','7 kun')],['30d',L('30 дней','30 kun')],['month',L('Этот месяц','Shu oy')],['prev',L('Прошлый месяц','Oʻtgan oy')]];\n  let h='<div class=\"card\"><h3>'+L('Заказы и комиссия','Buyurtmalar va komissiya')+'</h3>'\n    +'<div class=\"filters\" style=\"margin:8px 0\">'+per.map(p=>'<button type=\"button\" class=\"chip\" data-act=\"ownper\" data-v=\"'+p[0]+'\" aria-pressed=\"'+(o.period===p[0])+'\">'+esc(p[1])+'</button>').join('')+'</div>';\n  if(!st||st.period!==o.period){\n    h+=o.serr?'<div class=\"note\">'+L('Не удалось загрузить сводку. Проверьте соединение.','Hisobotni yuklab boʻlmadi. Ulanishni tekshiring.')+' <button type=\"button\" class=\"btn ghost sm\" data-act=\"ownreload\">'+L('Повторить','Qayta urinish')+'</button></div>'\n      :'<div class=\"unit\">'+L('Считаем…','Hisoblanmoqda…')+'</div>';\n    return h+'</div>';\n  }\n  const t=st.total;\n  h+='<div class=\"unit\">'+esc(fDay(st.from)+' — '+fDay(st.to))+'</div><div class=\"sum\">'\n    +'<div class=\"r\"><span>'+L('Выдано заказов','Topshirilgan buyurtmalar')+'</span><span>'+num(t.n)+'</span></div>'\n    +'<div class=\"r\"><span>'+L('Товаров на сумму','Mahsulotlar summasi')+'</span><span>'+esc(money(t.base))+'</span></div>'\n    +(t.active?'<div class=\"r\"><span>'+L('Сейчас в работе','Hozir jarayonda')+'</span><span>'+num(t.active)+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('Комиссия к получению','Olinadigan komissiya')+'</span><span>'+esc(money(t.cm))+'</span></div></div>'\n    +'<div class=\"note\" style=\"margin-top:12px\">'+L('Считаются только выданные и доставленные заказы. Комиссия — процент от суммы товаров после скидки, без доставки. Процент у каждого дистрибьютора свой, его можно менять ниже. Новый процент действует на заказы, выданные после изменения, прежние не пересчитываются. Деньги приложение не собирает: клиенты платят дистрибьютору при получении, а комиссию вы получаете с него сами.','Faqat topshirilgan va yetkazilgan buyurtmalar hisoblanadi. Komissiya — chegirmadan keyingi mahsulotlar summasidan foiz, yetkazib berishsiz. Har bir distribyutorning foizi alohida, uni quyida oʻzgartirish mumkin. Yangi foiz oʻzgartirilgandan keyin topshirilgan buyurtmalarga amal qiladi, avvalgilari qayta hisoblanmaydi. Ilova pul yigʻmaydi: mijozlar distribyutorga olganda toʻlaydi, komissiyani esa siz undan oʻzingiz olasiz.')+'</div></div>';\n  return h;\n}\nasync function ownPct(id){\n  const o=S.own;if(o.busy)return;\n  const row=o.stats&&o.stats.rows.find(x=>x.id===id);\n  const raw=String(o.pcts[id]!==undefined?o.pcts[id]:(row?row.pct:'')).trim().replace(',','.');\n  const v=Number(raw);\n  if(raw===''||!isFinite(v)||v<0||v>50){toast(ownErr('bad_pct'));return}\n  o.busy='pct';renderOwner();\n  const r=await api('PUT','/api/hub/admin/shops/'+encodeURIComponent(id),{pct:v});\n  o.busy='';\n  if(r.ok&&r.data&&typeof r.data.pct==='number'){\n    delete o.pcts[id];\n    toast(L('Процент сохранён: '+fmtPct(r.data.pct)+'%. Он действует на заказы, которые выдаются с этого момента.','Foiz saqlandi: '+fmtPct(r.data.pct)+'%. U shu paytdan topshiriladigan buyurtmalarga amal qiladi.'));\n  }else toast(ownErr(r.data&&r.data.error));\n  renderOwner();\n  loadOwnerStats();\n}\n/* раздел владельца: каждый блок на своём экране, заходят в него из меню ☰ (категория → подраздел) */\nconst ownSecs=()=>[\n  ['dists',L('Дистрибьюторы','Distribyutorlar'),[['dist',L('Список','Roʻyxat'),L('Дистрибьюторы','Distribyutorlar')],['add',L('Добавить','Qoʻshish'),L('Добавить дистрибьютора','Distribyutor qoʻshish')],['comm',L('Комиссия','Komissiya'),L('Заказы и комиссия','Buyurtmalar va komissiya')]]],\n  ['team',L('Люди и территории','Odamlar va hududlar'),[['people',L('Люди','Odamlar'),L('Люди','Odamlar')],['agents',L('Агенты','Agentlar'),L('Агенты','Agentlar')],['terr',L('Территории','Hududlar'),L('Территории','Hududlar')]]],\n  ['money',L('Деньги','Pul'),[['disp',L('Спорные записи','Bahsli yozuvlar'),L('Спорные записи','Bahsli yozuvlar')]]],\n  ['site',L('Площадка','Platforma'),[['title',L('Название','Nomi'),L('Название площадки','Platforma nomi')],['clients',L('База магазинов','Doʻkonlar bazasi'),L('База магазинов','Doʻkonlar bazasi')]]]\n];\nfunction ownSecInfo(sec){\n  for(const g of ownSecs()){const x=g[2].find(y=>y[0]===sec);if(x)return {group:g[1],title:x[2]}}\n  return {group:'',title:''};\n}\nfunction ownOpen(sec){\n  S.own.sec=sec;S.own.perr='';\n  if(S.view!=='owner')go('owner');\n  else{S.msub=null;renderNav();renderOwner();window.scrollTo(0,0)}\n}\nfunction ownMadeHTML(){\n  const o=S.own;let h='';\n    if(o.made){\n      const m=o.made;\n      h+='<div class=\"card codebox\"><h3>'+esc(m.reset?L('Новый код: ','Yangi kod: ')+m.name:L('Дистрибьютор добавлен: ','Distribyutor qoʻshildi: ')+m.name)+'</h3>'\n        +'<div class=\"unit\">'+L('Сохраните код сейчас: потом он нигде не показывается. Отправьте его дистрибьютору.','Kodni hozir saqlang: keyin u hech qayerda koʻrsatilmaydi. Uni distribyutorga yuboring.')+'</div>'\n        +'<div class=\"mono\">'+esc(m.code)+'</div>'\n        +'<div class=\"row-btns\" style=\"margin:12px 0\"><button type=\"button\" class=\"btn\" data-act=\"copy\" data-v=\"'+esc(m.code)+'\" data-ok=\"'+esc(L('Код скопирован','Kod nusxalandi'))+'\" data-lab=\"'+esc(L('Код: ','Kod: '))+'\">'+L('Копировать код','Kodni nusxalash')+'</button>'\n        +'<button type=\"button\" class=\"btn ghost\" data-act=\"copy\" data-v=\"/admin '+esc(m.code)+'\" data-ok=\"'+esc(L('Команда скопирована','Buyruq nusxalandi'))+'\" data-lab=\"\">'+L('Копировать «/admin КОД»','«/admin KOD» nusxalash')+'</button></div>'\n        +'<div class=\"note\">'+L('Дистрибьютор открывает бота, отправляет «/admin КОД» (бот сразу удалит сообщение с кодом) и нажимает «Открыть приложение». Заказы будут приходить ему в бот.','Distribyutor botni ochib, «/admin KOD» yuboradi (bot kod yozilgan xabarni darhol oʻchiradi) va «Ilovani ochish» tugmasini bosadi. Buyurtmalar botga keladi.')+'</div>'\n        +'<div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"ownmadeclose\">'+L('Готово, код сохранён','Tayyor, kod saqlandi')+'</button></div></div>';\n    }\n  return h;\n}\nfunction ownAddHTML(){\n  const o=S.own;let h='';\n    h+='<p class=\"lead\">'+L('Каждому дистрибьютору вы даёте личный код. Он пишет боту «/admin КОД», становится продавцом и сам добавляет товары в приложении.','Har bir distribyutorga shaxsiy kod berasiz. U botga «/admin KOD» deb yozadi, sotuvchi boʻladi va mahsulotlarni ilovada oʻzi qoʻshadi.')+'</p>';\n    const full=o.shops.length>=o.max;\n    h+='<div class=\"card\"><h3>'+L('Добавить дистрибьютора','Distribyutor qoʻshish')+'</h3><div class=\"form\">'\n      +'<div><label class=\"lab\" for=\"o-name\">'+L('Название компании','Kompaniya nomi')+'</label><input type=\"text\" id=\"o-name\" data-own=\"fname\" maxlength=\"60\" value=\"'+esc(o.fname)+'\" autocomplete=\"off\"></div>'\n      +'<div><label class=\"lab\" for=\"o-code\">'+L('Свой код (от 12 символов) или пусто — придумаем','Oʻz kodingiz (12 belgidan) yoki boʻsh — oʻzimiz yaratamiz')+'</label><input type=\"text\" id=\"o-code\" data-own=\"fcode\" maxlength=\"64\" value=\"'+esc(o.fcode)+'\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\"></div>'\n      +'</div><div class=\"err\" id=\"o-err\" role=\"alert\">'+esc(o.err2||'')+'</div>'\n      +'<div class=\"row-btns\" style=\"margin-top:14px\"><button type=\"button\" class=\"btn\" id=\"ownadd\" data-act=\"ownadd\"'+(o.busy||full?' disabled':'')+'>'+(o.busy==='add'?L('Добавляем…','Qoʻshilmoqda…'):L('Добавить','Qoʻshish'))+'</button></div>'\n      +(full?'<div class=\"note\" style=\"margin-top:10px\">'+esc(ownErr('too_many'))+'</div>':'')+'</div>';\n  return h;\n}\nfunction ownListHTML(){\n  const o=S.own;let h='';\n    h+=o.shops.map(r=>{\n      const sure=o.rc===r.id;\n      const meta=[L(r.items+' '+plTovar(r.items),r.items+' ta mahsulot'),L('продавцов: '+r.sellers,'sotuvchilar: '+r.sellers),r.own?L('код выдан','kod berilgan'):L('кода нет','kod yoʻq')];\n      return '<div class=\"card\"><div class=\"hrow\"><h3 style=\"margin:0\">'+esc(r.name)+'</h3><span class=\"dtag\">'+(r.on?L('в списке','roʻyxatda'):L('скрыт','yashirin'))+'</span></div>'\n        +'<div class=\"dmeta\" style=\"margin-bottom:12px\">'+esc(meta.join(' · '))+'</div>'+ownShopStatsHTML(r.id)+'<div class=\"row-btns\">'\n        +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"openshop\" data-id=\"'+esc(r.id)+'\">'+L('Открыть каталог','Katalogni ochish')+'</button>'\n        +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"owntoggle\" data-id=\"'+esc(r.id)+'\"'+(o.busy?' disabled':'')+'>'+(r.on?L('Скрыть и закрыть заказы','Yashirish va buyurtmani yopish'):L('Вернуть в список','Roʻyxatga qaytarish'))+'</button>'\n        +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"ownreset\" data-id=\"'+esc(r.id)+'\"'+(o.busy?' disabled':'')+'>'+(sure?L('Точно? Прежние продавцы потеряют доступ','Aniqmi? Avvalgi sotuvchilar kirolmaydi'):L('Новый код','Yangi kod'))+'</button>'\n        +(r.link?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(r.link)+'\" data-ok=\"'+esc(L('Ссылка скопирована','Havola nusxalandi'))+'\" data-lab=\"\">'+L('Ссылка для клиентов','Mijozlar uchun havola')+'</button>':'')\n        +(r.id!=='main'?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"owndel\" data-id=\"'+esc(r.id)+'\"'+(o.busy?' disabled':'')+'>'+L('Удалить','Oʻchirish')+'</button>':'')\n        +'</div></div>';\n    }).join('');\n  if(!o.shops.length)h+='<div class=\"empty\"><b>'+L('Дистрибьюторов пока нет','Distribyutorlar hozircha yoʻq')+'</b>'+L('Добавьте первого: он получит личный код.','Birinchisini qoʻshing: u shaxsiy kod oladi.')+'<div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn\" data-act=\"otab\" data-t=\"add\">'+L('Добавить дистрибьютора','Distribyutor qoʻshish')+'</button></div></div>';\n  return h;\n}\nfunction ownTitleHTML(){\n  const o=S.own;let h='';\n    const tv=o.ftitle===null?o.title:o.ftitle;\n    h+='<div class=\"card\"><h3>'+L('Название площадки','Platforma nomi')+'</h3><div class=\"unit\">'+L('Показывается наверху списка дистрибьюторов.','Distribyutorlar roʻyxati tepasida koʻrsatiladi.')+'</div><div class=\"form\"><div class=\"full\"><input type=\"text\" id=\"o-title\" data-own=\"ftitle\" maxlength=\"60\" value=\"'+esc(tv)+'\" aria-label=\"'+esc(L('Название площадки','Platforma nomi'))+'\"></div></div>'\n      +'<div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn ghost\" data-act=\"owntitle\"'+(o.busy?' disabled':'')+'>'+L('Сохранить название','Nomni saqlash')+'</button></div></div>';\n  return h;\n}\nfunction renderOwner(){\n  const o=S.own,sec=o.sec||'dist',info=ownSecInfo(sec);\n  let h='<div class=\"wrap page\"><button type=\"button\" class=\"btn ghost sm backlink\" data-act=\"shops\">← '+L('Все дистрибьюторы','Barcha distribyutorlar')+'</button><div class=\"eyebrow\" style=\"margin-top:12px\">'+esc(info.group)+'</div><h1>'+esc(info.title)+'</h1>';\n  if(!o.loaded)h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(o.err)h+='<div class=\"empty\"><b>'+L('Не удалось загрузить','Yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"ownreload\">'+L('Повторить','Qayta urinish')+'</button></div>';\n  else{\n    if(sec==='dist')h+=ownMadeHTML()+ownListHTML();\n    else if(sec==='add')h+=ownMadeHTML()+ownAddHTML();\n    else if(sec==='comm')h+=ownStatsHTML();\n    else if(sec==='title')h+=ownTitleHTML();\n    else if(sec==='disp')h+=ownDispHTML();\n    else if(sec==='people')h+=ownWhoHTML();\n    else h+=ownPeopleHTML(sec);\n  }\n  view.innerHTML=h+'</div>';\n}\n/* у каждого дистрибьютора: выданные заказы за период, комиссия и поле процента */\nfunction ownShopStatsHTML(id){\n  const o=S.own,st=o.stats,x=st&&st.period===o.period?st.rows.find(y=>y.id===id):null;\n  if(!x)return '';\n  if(x.err)return '<div class=\"note\" style=\"margin-bottom:12px\">'+L('Нет данных по этому дистрибьютору.','Bu distribyutor boʻyicha maʼlumot yoʻq.')+'</div>';\n  const pv=o.pcts[id]!==undefined?o.pcts[id]:fmtPct(x.pct);\n  return '<div class=\"sum\" style=\"margin-bottom:6px\">'\n    +'<div class=\"r\"><span>'+L('Выдано заказов','Topshirilgan buyurtmalar')+'</span><span>'+num(x.n)+'</span></div>'\n    +'<div class=\"r\"><span>'+L('Товаров на сумму','Mahsulotlar summasi')+'</span><span>'+esc(money(x.base))+'</span></div>'\n    +(x.active?'<div class=\"r\"><span>'+L('Сейчас в работе','Hozir jarayonda')+'</span><span>'+num(x.active)+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('Комиссия ','Komissiya ')+esc(fmtPct(x.pct))+'%</span><span>'+esc(money(x.cm))+'</span></div></div>'\n    +'<div class=\"pctrow\"><div><label class=\"lab\" for=\"pc-'+esc(id)+'\">'+L('Процент комиссии, %','Komissiya foizi, %')+'</label><input type=\"text\" inputmode=\"decimal\" id=\"pc-'+esc(id)+'\" data-opct=\"'+esc(id)+'\" maxlength=\"5\" value=\"'+esc(pv)+'\" autocomplete=\"off\"></div>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"ownpct\" data-id=\"'+esc(id)+'\"'+(o.busy?' disabled':'')+'>'+L('Сохранить %','% ni saqlash')+'</button></div>';\n}\nasync function ownAdd(){\n  const o=S.own;if(o.busy)return;\n  const name=o.fname.trim(),code=o.fcode.trim();\n  if(name.length<2){o.err2=ownErr('bad_name');renderOwner();return}\n  if(code&&code.length<12){o.err2=ownErr('weak_code');renderOwner();return}\n  o.busy='add';o.err2='';renderOwner();\n  const r=await api('POST','/api/hub/admin/shops',code?{name,code}:{name});\n  o.busy='';\n  if(!r.ok||!r.data){o.err2=ownErr(r.data&&r.data.error);renderOwner();return}\n  o.shops=o.shops.concat([r.data.shop]);\n  o.made={name:r.data.shop.name,code:r.data.code,reset:false};\n  o.fname='';o.fcode='';\n  renderOwner();window.scrollTo(0,0);\n  loadHub();\n}\nasync function ownToggle(id){\n  const o=S.own,rec=o.shops.find(x=>x.id===id);if(!rec||o.busy)return;\n  o.busy='tg';renderOwner();\n  const r=await api('PUT','/api/hub/admin/shops/'+encodeURIComponent(id),{on:!rec.on});\n  o.busy='';\n  if(r.ok&&r.data&&r.data.shop)o.shops=o.shops.map(x=>x.id===id?r.data.shop:x);\n  else toast(ownErr(r.data&&r.data.error));\n  renderOwner();\n  loadHub();\n}\n/* ---------- владелец: база, территории и агенты ---------- */\nconst NAVOI_TERR=['Навои','Зарафшан','Учкудук','Кармана','Нурата','Навбахор','Конимех','Томды','Хатырчи','Кызылтепа'];\nconst peopleErr=e=>({\n  not_found:L('Уже удалён. Обновите страницу.','Allaqachon oʻchirilgan. Sahifani yangilang.'),\n  bad_name:L('Название — от 2 символов','Nomi kamida 2 belgi boʻlsin'),\n  terr_dup:L('Такая территория уже есть (или нечего добавлять)','Bunday hudud bor (yoki qoʻshadigan narsa yoʻq)'),\n  terr_used:L('В этой территории есть магазины. Сначала перенесите их в другую.','Bu hududda doʻkonlar bor. Avval ularni boshqasiga oʻtkazing.'),\n  too_many:L('Больше добавить нельзя','Koʻproq qoʻshib boʻlmaydi'),\n  weak_code:L('Код должен быть не короче 12 символов','Kod kamida 12 belgidan iborat boʻlsin'),\n  code_taken:L('Такой код уже занят, придумайте другой','Bu kod band, boshqasini oʻylab toping'),\n  forbidden:L('Раздел только для владельца','Boʻlim faqat egasi uchun')\n}[e]||L('Не получилось. Проверьте соединение и попробуйте ещё раз.','Bajarib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.'));\n/* «Люди»: все, кто открывал приложение или писал боту, и держатели ролей. Только просмотр: поиск и фильтр по роли считаются здесь, на телефоне. */\nasync function loadOwnerWho(){\n  if(!isOwner())return;\n  const W=S.own.who,r=await api('GET','/api/hub/admin/people/list');\n  if(!r.ok||!r.data||!Array.isArray(r.data.people)){W.err=!W.ok;if(!W.ok&&S.view==='owner'&&S.own.sec==='people')ownRefresh();return}\n  W.ok=true;W.err=false;W.people=r.data.people;W.total=r.data.total||r.data.people.length;\n  if(S.view==='owner'&&S.own.sec==='people')ownRefresh();\n}\nconst WHO_ROLES=()=>[['owner',L('Владельцы','Egalar')],['seller',L('Продавцы','Sotuvchilar')],['agent',L('Агенты','Agentlar')],['courier',L('Доставщики','Yetkazuvchilar')],['shop',L('Магазины','Doʻkonlar')]];\n/* роли человека для фильтра: без особых ролей он «магазин» (обычный клиент) */\nconst whoRoles=x=>x.roles.length?[...new Set(x.roles.map(r=>r.r))]:['shop'];\nfunction whoFiltered(){\n  const W=S.own.who,q=W.q.trim().toLowerCase().replace(/^@/,'');\n  return W.people.filter(x=>(W.f==='all'||whoRoles(x).includes(W.f))&&(!q||[x.nm,x.un,String(x.id),x.shop&&x.shop.name,x.shop&&x.shop.phone,...x.roles.map(r=>r.n)].filter(Boolean).some(v=>String(v).toLowerCase().includes(q))));\n}\nfunction whoRoleTag(r){\n  const nm={owner:L('Владелец','Ega'),seller:L('Продавец','Sotuvchi'),agent:L('Агент','Agent'),courier:L('Доставщик','Yetkazuvchi')}[r.r]||r.r;\n  return '<span class=\"dtag\">'+esc(nm+(r.n?' · '+r.n:''))+'</span>';\n}\nfunction whoRowHTML(x){\n  const tags=x.roles.length?x.roles.map(whoRoleTag).join(''):'<span class=\"dtag\">'+esc(L('Магазин','Doʻkon')+(x.shop&&x.shop.name?' · '+x.shop.name:''))+'</span>';\n  const name=x.nm||(x.shop&&x.shop.name)||L('Без имени','Ismsiz');\n  const seen=x.last?L('Заходил: ','Kirgan: ')+agoTxt(x.last)+(x.first?L(' · с ',' · ')+jrDay(x.first)+(LANG==='uz'?' dan':''):''):L('Пока не заходил после появления списка','Roʻyxat paydo boʻlgandan keyin hali kirmagan');\n  return '<div class=\"bcard who\"><div class=\"bh\"><h3>'+esc(name)+'</h3></div>'\n    +'<div class=\"dmeta\">'+esc([x.un?'@'+x.un:'',x.shop&&x.shop.phone,'ID '+x.id].filter(Boolean).join(' · '))+'</div>'\n    +'<div class=\"wtags\">'+tags+'</div><div class=\"dmeta\">'+esc(seen)+'</div></div>';\n}\nconst jrDay=iso=>{const d=new Date(iso);return isNaN(d)?'':pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear()};\nfunction whoListHTML(){\n  const W=S.own.who,list=whoFiltered(),CAP=100,shown=W.all?list:list.slice(0,CAP);\n  if(!list.length)return '<div class=\"empty\"><b>'+L('Никого не нашли','Hech kim topilmadi')+'</b>'+L('Измените поиск или фильтр.','Qidiruv yoki filtrni oʻzgartiring.')+'</div>';\n  return shown.map(whoRowHTML).join('')+(list.length>shown.length?'<div class=\"row-btns\"><button type=\"button\" class=\"btn ghost\" data-act=\"whoall\">'+L('Показать всех ('+list.length+')','Hammasini koʻrsatish ('+list.length+')')+'</button></div>':'');\n}\nfunction ownWhoHTML(){\n  const W=S.own.who;\n  if(!W.ok)return W.err?'<div class=\"empty\"><b>'+L('Не удалось загрузить','Yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div>':'<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  const cnt=k=>W.people.filter(x=>whoRoles(x).includes(k)).length;\n  return '<p class=\"lead\">'+L('Все, кто открывал приложение или писал боту, и те, у кого есть роль. Роль у человека видна сразу, а имя и дата захода появляются, когда он откроет приложение.','Ilovani ochgan yoki botga yozgan hamma, shuningdek roli bor odamlar. Rol darhol koʻrinadi, ism va kirgan sana esa odam ilovani ochganda paydo boʻladi.')+'</p>'\n    +'<div class=\"filters\">'+[['all',L('Все','Hammasi'),W.people.length]].concat(WHO_ROLES().map(r=>[r[0],r[1],cnt(r[0])])).map(f=>'<button type=\"button\" class=\"chip\" data-act=\"whof\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(W.f===f[0])+'\">'+f[1]+' · '+f[2]+'</button>').join('')+'</div>'\n    +'<div class=\"who-s\"><input type=\"search\" id=\"who-q\" data-own-who=\"q\" value=\"'+esc(W.q)+'\" placeholder=\"'+esc(L('Имя, @логин, телефон или ID','Ism, @login, telefon yoki ID'))+'\" aria-label=\"'+esc(L('Поиск людей','Odamlarni qidirish'))+'\" autocomplete=\"off\" maxlength=\"60\"></div>'\n    +(W.total>W.people.length?'<div class=\"note\" style=\"margin-bottom:10px\">'+L('В списке первые '+W.people.length+' из '+W.total+'.','Roʻyxatda '+W.total+' tadan dastlabki '+W.people.length+' tasi.')+'</div>':'')\n    +'<div id=\"who-list\">'+whoListHTML()+'</div>';\n}\nasync function loadOwnerPeople(){\n  if(!isOwner())return;\n  const r=await api('GET','/api/hub/admin/people');\n  if(r.ok&&r.data&&Array.isArray(r.data.terr)){S.own.ppl=r.data;ownRefresh()}\n}\n/* одно действие владельца: показывает занятость, обновляет список, возвращает ответ сервера или null */\nasync function peopleCall(method,path,body){\n  const o=S.own;if(o.pbusy)return null;\n  o.pbusy=true;o.perr='';renderOwner();\n  const r=await api(method,'/api/hub/admin'+path,body);\n  o.pbusy=false;\n  if(!r.ok||!r.data){o.perr=peopleErr(r.data&&r.data.error);renderOwner();return null}\n  o.ppl=r.data.state||r.data;\n  renderOwner();\n  return r.data;\n}\nfunction ownPeopleHTML(part){\n  const o=S.own,p=o.ppl,dis=o.pbusy?' disabled':'';\n  if(!p)return '<div class=\"card\"><h3>'+esc(ownSecInfo(part).title)+'</h3><div class=\"unit\">'+L('Загружаем…','Yuklanmoqda…')+'</div></div>';\n  let h='';\n  if(part==='clients'){\n  h+='<div class=\"card\"><h3>'+L('База магазинов','Doʻkonlar bazasi')+'</h3><div class=\"unit\">'+L('Магазин попадает в базу сам при первом заказе. Агент проверяет данные после визита и добавляет тех, кого ещё нет. Дистрибьюторы видят всю базу (название, адрес, телефон, территорию), но не заметки агентов.','Doʻkon birinchi buyurtmada bazaga oʻzi tushadi. Agent tashrifdan keyin maʼlumotlarni tekshiradi va hali yoʻqlarini qoʻshadi. Distribyutorlar butun bazani koʻradi (nomi, manzil, telefon, hudud), lekin agent eslatmalarini emas.')+'</div>'\n    +'<div class=\"sum\"><div class=\"r\"><span>'+L('Магазинов в базе','Bazadagi doʻkonlar')+'</span><span>'+num(p.total)+'</span></div><div class=\"r\"><span>'+L('Без территории','Hududsiz')+'</span><span>'+num(p.free)+'</span></div></div>'\n    +(o.perr?'<div class=\"err\" role=\"alert\" style=\"margin-top:8px\">'+esc(o.perr)+'</div>':'')\n    +'<div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn\" data-act=\"nav\" data-v=\"base\">'+L('Открыть базу','Bazani ochish')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"baseimport\"'+dis+'>'+L('Перенести клиентов дистрибьюторов','Distribyutorlar mijozlarini oʻtkazish')+'</button></div>'\n    +'<div class=\"unit\" style=\"margin-top:8px\">'+L('Перенос нужен один раз: клиенты, которые уже заказывали у дистрибьюторов, попадут в общую базу. Кто уже есть, не добавится повторно.','Oʻtkazish bir marta kerak: distribyutorlarga allaqachon buyurtma bergan mijozlar umumiy bazaga tushadi. Bor boʻlganlar qayta qoʻshilmaydi.')+'</div>'\n    +(o.imp?'<div class=\"note\" style=\"margin-top:8px\">'+esc(L('Перенос выполнен: добавлено '+o.imp.added+', уже были в базе '+o.imp.linked+', пропущено '+o.imp.skipped+'.','Oʻtkazildi: qoʻshildi '+o.imp.added+', bazada bor edi '+o.imp.linked+', oʻtkazib yuborildi '+o.imp.skipped+'.'))+'</div>':'')+'</div>';\n  }\n  else if(part==='terr'){\n  h+=o.perr?'<div class=\"err\" role=\"alert\" style=\"margin-bottom:10px\">'+esc(o.perr)+'</div>':'';\n  h+='<div class=\"card\"><h3>'+L('Территории','Hududlar')+'</h3><div class=\"unit\">'+L('Районы и города, по которым агенты закрепляют магазины. Например: Навои, Зарафшан, Кармана.','Agentlar doʻkonlarni biriktiradigan tuman va shaharlar. Masalan: Navoiy, Zarafshon, Karmana.')+'</div>';\n  h+=p.terr.map(t=>'<div class=\"trow\"><input type=\"text\" id=\"tn-'+esc(t.id)+'\" value=\"'+esc(t.name)+'\" maxlength=\"40\" aria-label=\"'+esc(L('Название территории','Hudud nomi'))+'\"><span class=\"dtag\" title=\"'+esc(L('Магазинов','Doʻkonlar'))+'\">'+num(t.n)+'</span>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"terrsave\" data-id=\"'+esc(t.id)+'\"'+dis+' aria-label=\"'+esc(L('Сохранить название','Nomini saqlash'))+'\" title=\"'+esc(L('Сохранить название','Nomini saqlash'))+'\">✓</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"terrdel\" data-id=\"'+esc(t.id)+'\"'+dis+' aria-label=\"'+esc(L('Удалить территорию','Hududni oʻchirish'))+'\" title=\"'+esc(L('Удалить территорию','Hududni oʻchirish'))+'\">✕</button></div>').join('');\n  h+='<div class=\"trow\"><input type=\"text\" id=\"o-tname\" data-own=\"tname\" maxlength=\"40\" value=\"'+esc(o.tname)+'\" placeholder=\"'+esc(L('Новая территория','Yangi hudud'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Новая территория','Yangi hudud'))+'\"><button type=\"button\" class=\"btn sm\" data-act=\"terradd\"'+dis+'>'+L('Добавить','Qoʻshish')+'</button></div>'\n    +'<div class=\"row-btns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"terrpreset\"'+dis+'>'+L('Добавить районы и города Навоийской области','Navoiy viloyati tumanlari va shaharlarini qoʻshish')+'</button></div></div>';\n  }\n  else if(part==='agents'){\n  h+=o.perr?'<div class=\"err\" role=\"alert\" style=\"margin-bottom:10px\">'+esc(o.perr)+'</div>':'';\n  h+='<div class=\"card\"><h3>'+L('Агенты','Agentlar')+'</h3><div class=\"unit\">'+L('Каждому агенту вы даёте личный код. Он пишет боту «/agent КОД», в приложении открывается вкладка «База». Агент видит магазины своих территорий и магазины без территории.','Har bir agentga shaxsiy kod berasiz. U botga «/agent KOD» deb yozadi, ilovada «Baza» boʻlimi ochiladi. Agent oʻz hududlaridagi va hududsiz doʻkonlarni koʻradi.')+'</div>';\n  if(o.amade){\n    const m=o.amade;\n    h+='<div class=\"codebox\" style=\"margin:12px 0\"><h3>'+esc(m.reset?L('Новый код: ','Yangi kod: ')+m.name:L('Агент добавлен: ','Agent qoʻshildi: ')+m.name)+'</h3><div class=\"unit\">'+L('Сохраните код сейчас: потом он нигде не показывается. Отправьте его агенту.','Kodni hozir saqlang: keyin u hech qayerda koʻrsatilmaydi. Uni agentga yuboring.')+'</div><div class=\"mono\">'+esc(m.code)+'</div>'\n      +'<div class=\"row-btns\" style=\"margin:12px 0\"><button type=\"button\" class=\"btn\" data-act=\"copy\" data-v=\"'+esc(m.code)+'\" data-ok=\"'+esc(L('Код скопирован','Kod nusxalandi'))+'\" data-lab=\"\">'+L('Копировать код','Kodni nusxalash')+'</button>'\n      +'<button type=\"button\" class=\"btn ghost\" data-act=\"copy\" data-v=\"/agent '+esc(m.code)+'\" data-ok=\"'+esc(L('Команда скопирована','Buyruq nusxalandi'))+'\" data-lab=\"\">'+L('Копировать «/agent КОД»','«/agent KOD» nusxalash')+'</button></div>'\n      +'<div class=\"row-btns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"amadeclose\">'+L('Готово, код сохранён','Tayyor, kod saqlandi')+'</button></div></div>';\n  }\n  h+=p.agents.map(a=>'<div class=\"bcard\"><div class=\"hrow\"><h3>'+esc(a.name)+'</h3><span class=\"dtag\">'+(a.on?L('работает','ishlaydi'):L('отключён','oʻchirilgan'))+'</span></div>'\n    +'<div class=\"dmeta\">'+esc(L('магазинов: '+a.n+' · ','doʻkonlar: '+a.n+' · ')+(a.used?L('вошёл по коду','kod bilan kirgan'):L('ещё не входил','hali kirmagan')))+'</div>'\n    +(p.terr.length?'<div class=\"tsel\" role=\"group\" aria-label=\"'+esc(L('Территории агента','Agent hududlari'))+'\">'+p.terr.map(t=>'<label class=\"chk\"><input type=\"checkbox\" data-agterr=\"'+esc(a.id+':'+t.id)+'\"'+(a.terr.includes(t.id)?' checked':'')+dis+'> '+esc(t.name)+'</label>').join('')+'</div>':'')\n    +'<div class=\"row-btns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"agenton\" data-id=\"'+esc(a.id)+'\"'+dis+'>'+(a.on?L('Отключить','Oʻchirish'):L('Включить','Yoqish'))+'</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"agentcode\" data-id=\"'+esc(a.id)+'\"'+dis+'>'+L('Новый код','Yangi kod')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"agentdel\" data-id=\"'+esc(a.id)+'\"'+dis+'>'+L('Удалить','Oʻchirish')+'</button>'\n    +(a.link?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(a.link)+'\" data-ok=\"'+esc(L('Ссылка скопирована','Havola nusxalandi'))+'\" data-lab=\"\">'+L('Ссылка агента','Agent havolasi')+'</button>':'')+'</div></div>').join('');\n  h+='<div class=\"form\" style=\"margin-top:12px\"><div><label class=\"lab\" for=\"o-aname\">'+L('Имя агента','Agent ismi')+'</label><input type=\"text\" id=\"o-aname\" data-own=\"aname\" maxlength=\"60\" value=\"'+esc(o.aname)+'\" autocomplete=\"off\"></div>'\n    +'<div><label class=\"lab\" for=\"o-acode\">'+L('Свой код (от 12 символов) или пусто','Oʻz kodingiz (12 belgidan) yoki boʻsh')+'</label><input type=\"text\" id=\"o-acode\" data-own=\"acode\" maxlength=\"64\" value=\"'+esc(o.acode)+'\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\"></div></div>'\n    +(p.terr.length?'<div class=\"lab\" style=\"margin-top:8px\">'+L('Территории нового агента','Yangi agent hududlari')+'</div><div class=\"tsel\">'+p.terr.map(t=>'<label class=\"chk\"><input type=\"checkbox\" data-aterr=\"'+esc(t.id)+'\"'+(o.aterr.includes(t.id)?' checked':'')+'> '+esc(t.name)+'</label>').join('')+'</div>':'')\n    +'<div class=\"row-btns\" style=\"margin-top:8px\"><button type=\"button\" class=\"btn\" data-act=\"agentadd\"'+dis+'>'+L('Добавить агента','Agent qoʻshish')+'</button></div></div>';\n  }\n  return h;\n}\nasync function ownTerrAdd(names){\n  const d=await peopleCall('POST','/terr',{names});\n  if(d){S.own.tname='';renderOwner()}\n}\nasync function ownAgentAdd(){\n  const o=S.own,name=o.aname.trim(),code=o.acode.trim();\n  if(name.length<2){o.perr=peopleErr('bad_name');renderOwner();return}\n  if(code&&code.length<12){o.perr=peopleErr('weak_code');renderOwner();return}\n  const d=await peopleCall('POST','/agents',code?{name,terr:o.aterr,code}:{name,terr:o.aterr});\n  if(d){o.amade={name,code:d.code,reset:false};o.aname='';o.acode='';o.aterr=[];renderOwner();window.scrollTo(0,0);loadHub()}\n}\n/* удаление дистрибьютора совсем: товары, заказы, клиенты и продавцы; сервер сам не даёт удалить первого */\nasync function ownDelete(id){\n  const o=S.own,rec=o.shops.find(x=>x.id===id);if(!rec||o.busy)return;\n  o.busy='del';o.rc='';renderOwner();\n  const r=await api('DELETE','/api/hub/admin/shops/'+encodeURIComponent(id));\n  o.busy='';\n  if(!r.ok){toast(ownErr(r.data&&r.data.error));if(r.data&&r.data.error==='not_found')o.shops=o.shops.filter(x=>x.id!==id);renderOwner();return}\n  o.shops=o.shops.filter(x=>x.id!==id);\n  toast(L('Дистрибьютор «'+rec.name+'» удалён','Distribyutor «'+rec.name+'» oʻchirildi'));\n  renderOwner();\n  loadHub();loadOwnerStats();\n}\nasync function ownReset(id){\n  const o=S.own,rec=o.shops.find(x=>x.id===id);if(!rec||o.busy)return;\n  o.busy='rc';o.rc='';renderOwner();\n  const r=await api('POST','/api/hub/admin/shops/'+encodeURIComponent(id)+'/code',{});\n  o.busy='';\n  if(!r.ok||!r.data){toast(ownErr(r.data&&r.data.error));renderOwner();return}\n  o.shops=o.shops.map(x=>x.id===id?r.data.shop:x);\n  o.made={name:rec.name,code:r.data.code,reset:true};\n  renderOwner();window.scrollTo(0,0);\n}\nasync function ownTitle(){\n  const o=S.own;if(o.busy)return;\n  const t=(o.ftitle===null?o.title:o.ftitle).trim();\n  o.busy='tt';renderOwner();\n  const r=await api('PUT','/api/hub/admin/title',{title:t});\n  o.busy='';\n  if(r.ok&&r.data){o.title=r.data.title;o.ftitle=null;S.hub.title=r.data.title;renderNav();toast(L('Название сохранено','Nom saqlandi'))}\n  else toast(ownErr(r.data&&r.data.error));\n  renderOwner();\n}\n/* поле количества потеряло фокус: пустое или 0 убирает товар, слишком большое число обрезается */\nfunction qtyDone(t){\n  const id=t.dataset.qty,cur=S.cart[id]||0;\n  let v=Math.floor(Number(t.value));\n  if(!isFinite(v)||v<1)v=0;\n  v=cartSet(id,v);   // обрезает до остатка и сохраняет\n  if(!v){\n    if(!cartCount()){S.shopStep='list';renderShop();renderNav();return}\n    if(S.shopStep==='cart'){paintCartLines();paintShopBar();renderNav()}else paintShopCtl(id);\n    return;\n  }\n  t.value=String(v);\n  if(cur!==v)refreshTotals(id);\n}\n\n/* ---------- events ---------- */\ndocument.addEventListener('click',e=>{\n  const t=e.target.closest('[data-act]');\n  if(!t||t.disabled)return;\n  const a=t.dataset.act;\n  if(a==='setlang'){if(t.dataset.lg&&t.dataset.lg!==LANG)switchLang()}\n  else if(a==='nav'){\n    if(t.dataset.v==='shop'&&S.did&&S.view!=='shop'){S.shopPlaced=null;S.shopStep='list'}\n    go(t.dataset.v);\n    menuSet(false);\n  }\n  else if(a==='menu')menuSet(!menuIsOpen());\n  else if(a==='menuclose')menuSet(false);\n  else if(a==='msub'){const it=menuGroups().reduce((r,g)=>r.concat(g[1]),[]).find(x=>x[0]===t.dataset.v),cur=S.view==='shops'?'shop':S.view;S.msub=it&&menuSubOpen(it,cur)?'':t.dataset.v;renderNav()}\n  else if(a==='shops')go('shops');\n  else if(a==='owner')go('owner');\n  else if(a==='hubreload'){S.hub.err=false;renderShops();loadHub()}\n  else if(a==='showfar'){S.showFar=!S.showFar;renderShops()}\n  else if(a==='dispres')dispResolve(t.dataset.did,Number(t.dataset.uid),Number(t.dataset.n),t.dataset.cid||'')\n  else if(a==='ownreload'){S.own.loaded=false;S.own.err=false;renderOwner();loadOwner()}\n  else if(a==='openshop')enterShop(t.dataset.id,'shop');\n  else if(a==='opencartshop')enterShop(t.dataset.id,'shop',true);\n  else if(a==='sellerof')enterShop(t.dataset.id,'seller');\n  else if(a==='ownadd')ownAdd();\n  else if(a==='owntoggle')ownToggle(t.dataset.id);\n  else if(a==='owntitle')ownTitle();\n  else if(a==='ownper'){S.own.period=t.dataset.v;renderOwner();loadOwnerStats()}\n  else if(a==='ownpct')ownPct(t.dataset.id);\n  else if(a==='ownmadeclose'){S.own.made=null;renderOwner()}\n  else if(a==='owndel'){\n    const id=t.dataset.id,rec=S.own.shops.find(x=>x.id===id);\n    if(rec)askConfirm(L('Удалить дистрибьютора «'+rec.name+'» навсегда? Его товары ('+rec.items+'), заказы, клиенты и настройки сотрутся, вернуть их будет нельзя. Продавцы потеряют доступ. Если нужно только убрать его из списка, нажмите «Скрыть и закрыть заказы».','«'+rec.name+'» distribyutori butunlay oʻchirilsinmi? Uning mahsulotlari ('+rec.items+' ta), buyurtmalari, mijozlari va sozlamalari oʻchib ketadi, qaytarib boʻlmaydi. Sotuvchilar kirishdan mahrum boʻladi. Faqat roʻyxatdan olib qoʻymoqchi boʻlsangiz, «Yashirish va buyurtmani yopish» tugmasini bosing.'),()=>ownDelete(id));\n  }\n  else if(a==='ownreset'){\n    const id=t.dataset.id;\n    if(S.own.rc===id)ownReset(id);\n    else{\n      S.own.rc=id;renderOwner();\n      setTimeout(()=>{if(S.own.rc===id){S.own.rc='';if(S.view==='owner')renderOwner()}},5000);\n    }\n  }\n  else if(a==='basereload'){S.base.err=false;renderBase();loadBase(true)}\n  else if(a==='bsheet'){S.base.sheet=true;S.base.legend=false;paintSheet()}\n  else if(a==='blegend'){S.base.legend=true;S.base.sheet=false;paintSheet()}\n  else if(a==='bsheetx')clientCardClose()\n  else if(a==='bset'){\n    const k=t.dataset.k;\n    if(k==='sort'&&t.dataset.v==='near')baseNear();\n    else if(['f','terr','ag','sort'].includes(k)){S.base[k]=t.dataset.v;loadBase(true)}\n  }\n  else if(a==='bclr'){const k=t.dataset.k;if(k==='f'||k==='ag'||k==='sort'){S.base[k]='';loadBase(true)}}\n  else if(a==='breset'){Object.assign(S.base,{f:'',terr:'',ag:'',sort:'',mc:false});loadBase(true)}\n  else if(a==='bsign'){const b=S.base;b.f=b.f===t.dataset.v?'':t.dataset.v;b.legend=false;loadBase(true);window.scrollTo(0,0)}\n  else if(a==='basemore')loadBase(false);\n  else if(a==='basenew')baseOpenForm(null);\n  else if(a==='baseedit')baseOpenForm(S.base.items.find(x=>x.id===t.dataset.id)||null);\n  else if(a==='map')openMapSheet(t.dataset.lat,t.dataset.lng,t.dataset.t||'');\n  else if(a==='mapx')closeMapSheet();\n  else if(a==='mapgo')mapGo(t.dataset.k);\n  else if(a==='locmark')locMark();\n  else if(a==='locclear'){S.form.loc=null;paintLocBox()}\n  else if(a==='baseloc')baseMark(t.dataset.id);\n  else if(a==='baseaccept')baseAccept(t.dataset.id);\n  else if(a==='bfloc-here')bfLocHere();\n  else if(a==='bfloc-link')bfLocLink();\n  else if(a==='bfloc-clear'){S.base.fm.loc=null;S.base.fm.locDirty=true;paintBase()}\n  else if(a==='basecancel'){S.base.edit=null;S.base.ferr='';paintBase()}\n  else if(a==='basesave')baseSave();\n  else if(a==='basechk')baseCheck(t.dataset.id);\n  else if(a==='basedel')baseDelete(t.dataset.id);\n  else if(a==='terradd'){const n=S.own.tname.trim();if(n.length<2){S.own.perr=peopleErr('bad_name');renderOwner()}else ownTerrAdd([n])}\n  else if(a==='terrpreset')ownTerrAdd(NAVOI_TERR);\n  else if(a==='terrsave'){const el=document.getElementById('tn-'+t.dataset.id);if(el)peopleCall('PUT','/terr/'+encodeURIComponent(t.dataset.id),{name:el.value.trim()})}\n  else if(a==='terrdel'){\n    const tt=S.own.ppl&&S.own.ppl.terr.find(x=>x.id===t.dataset.id);\n    if(tt)askConfirm(L('Удалить территорию «'+tt.name+'»?','«'+tt.name+'» hududini oʻchirasizmi?'),()=>peopleCall('DELETE','/terr/'+encodeURIComponent(tt.id)));\n  }\n  else if(a==='agentadd')ownAgentAdd();\n  else if(a==='agenton'){const ag=S.own.ppl&&S.own.ppl.agents.find(x=>x.id===t.dataset.id);if(ag)peopleCall('PUT','/agents/'+encodeURIComponent(ag.id),{on:!ag.on}).then(()=>loadHub())}\n  else if(a==='agentcode'){\n    const ag=S.own.ppl&&S.own.ppl.agents.find(x=>x.id===t.dataset.id);\n    if(ag)askConfirm(L('Выдать «'+ag.name+'» новый код? Прежний аккаунт агента потеряет доступ.','«'+ag.name+'» ga yangi kod berasizmi? Agentning avvalgi akkaunti kirolmaydi.'),async()=>{\n      const d=await peopleCall('POST','/agents/'+encodeURIComponent(ag.id)+'/code',{});\n      if(d){S.own.amade={name:ag.name,code:d.code,reset:true};renderOwner();window.scrollTo(0,0)}\n    });\n  }\n  else if(a==='amadeclose'){S.own.amade=null;renderOwner()}\n  else if(a==='agentdel'){\n    const ag=S.own.ppl&&S.own.ppl.agents.find(x=>x.id===t.dataset.id);\n    if(ag)askConfirm(L('Удалить агента «'+ag.name+'»? Доступ закроется сразу, его магазины останутся в базе без агента.','Agent «'+ag.name+'» oʻchirilsinmi? Kirish darhol yopiladi, doʻkonlari agentsiz bazada qoladi.'),()=>{peopleCall('DELETE','/agents/'+encodeURIComponent(ag.id)).then(d=>{if(d)loadHub()})});\n  }\n  else if(a==='baseimport'){\n    peopleCall('POST','/base/import',{}).then(d=>{if(d){S.own.imp={added:d.added,linked:d.linked,skipped:d.skipped};renderOwner()}});\n  }\n  else if(a==='submitorder')submitOrder();\n  else if(a==='mode'){\n    S.form.mode=t.dataset.v==='delivery'?'delivery':'pickup';saveForm();\n    renderCart();\n  }\n  else if(a==='scat'){S.shopCat=t.dataset.id;renderShop()}\n  else if(a==='fav')toggleFav(t.dataset.id);\n  else if(a==='pdesc')t.classList.toggle('open');\n  else if(a==='padd'||a==='pplus'||a==='pminus'){\n    const id=t.dataset.id,cur=S.cart[id]||0;\n    if(a==='padd'&&!cur&&cartLines().length>=MAX_LINES){toast(L('В корзине не больше '+MAX_LINES+' разных товаров','Savatda '+MAX_LINES+' tadan ortiq turli mahsulot boʻlmaydi'));return}\n    const run=()=>{cartSet(id,a==='pminus'?cur-1:cur+1);paintShopCtl(id)};\n    if(a==='padd'&&S.otherCart)askOtherCart(run);else run();\n  }\n  else if(a==='ppack'||a==='cpack'){\n    const id=t.dataset.id,p=S.prod.items.find(x=>x.id===id),size=p?packSize(p,t.dataset.k):0,cur=S.cart[id]||0;\n    if(!p||!size)return;\n    if(!cur&&cartLines().length>=MAX_LINES){toast(L('В корзине не больше '+MAX_LINES+' разных товаров','Savatda '+MAX_LINES+' tadan ortiq turli mahsulot boʻlmaydi'));return}\n    const run=()=>{\n      cartSet(id,cur+size);\n      if(a==='ppack')paintShopCtl(id);\n      else{paintCartLines();paintShopBar();renderNav()}\n    };\n    if(a==='ppack'&&S.otherCart)askOtherCart(run);else run();\n  }\n  else if(a==='cplus'||a==='cminus'){\n    const id=t.dataset.id,cur=S.cart[id]||0;\n    cartSet(id,a==='cminus'?cur-1:cur+1);\n    if(!cartCount()){S.shopStep='list';renderShop();renderNav();return}\n    paintCartLines();\n    paintShopBar();renderNav();\n  }\n  else if(a==='opencart'){S.shopStep='cart';renderShop();window.scrollTo(0,0)}\n  else if(a==='shoplist'){S.shopStep='list';renderShop();window.scrollTo(0,0)}\n  else if(a==='shopagain'){S.shopPlaced=null;S.shopStep='list';renderShop();window.scrollTo(0,0)}\n  else if(a==='cadd'){\n    if(S.prod.cats.length>=MAX_CATS){toast(L('Больше '+MAX_CATS+' категорий нельзя',MAX_CATS+' tadan ortiq kategoriya boʻlmaydi'));return}\n    const c={id:'c'+Math.random().toString(36).slice(2,8),name:'Новая категория',uz:'Yangi kategoriya'};\n    S.prod.cats.push(c);queueSave('prod');paintSeller();\n    const inp=document.querySelector('[data-cid=\"'+c.id+'\"][data-cp=\"name\"]');if(inp){inp.focus();inp.select()}\n  }\n  else if(a==='cdel'){\n    const id=t.dataset.id;\n    if(S.prod.items.some(p=>p.cat===id)){toast(L('В категории есть товары. Сначала перенесите или удалите их.','Kategoriyada mahsulotlar bor. Avval ularni koʻchiring yoki oʻchiring.'));return}\n    S.prod.cats=S.prod.cats.filter(c=>c.id!==id);queueSave('prod');paintSeller();\n  }\n  else if(a==='pfilter'){S.pfilter=t.dataset.id;paintSeller()}\n  else if(a==='pfold')pxSet(t.dataset.id,!S.pxo[t.dataset.id]);\n  else if(a==='pfoldall')pxAll(t.dataset.v==='1');\n  else if(a==='rseg'){if(S.rv.seg!==t.dataset.v){S.rv.seg=t.dataset.v;S.rv.did='';S.rv.cat='';S.rv.items=[];loadReview()}}\n  else if(a==='rvreload')loadReview();\n  else if(a==='rdist'){S.rv.did=S.rv.did===t.dataset.did?'':t.dataset.did;paintReview()}\n  else if(a==='rzoom'){const it=rvFind(t.dataset.did,t.dataset.id);if(it)openViewer(it.id,it,it.did)}\n  else if(a==='rok'){const it=rvFind(t.dataset.did,t.dataset.id);if(it)rvApprove([it])}\n  else if(a==='rall'){\n    const list=rvList();if(!list.length)return;\n    askConfirm(L('Одобрить '+list.length+' '+plTovar(list.length)+'? Они сразу появятся в каталогах с ценой.','Tasdiqlansinmi: '+list.length+' ta mahsulot? Ular darhol narx bilan kataloglarda paydo boʻladi.'),()=>rvApprove(rvList()));\n  }\n  else if(a==='rret')rvOpenRet(t.dataset.did,t.dataset.id);\n  else if(a==='redit')rvOpenEdit(t.dataset.did,t.dataset.id);\n  else if(a==='rsx')rvClose();\n  else if(a==='rwhy')rvWhy(t.dataset.k,t.dataset.ph);\n  else if(a==='rsend')rvSend();\n  else if(a==='rsave')rvSave();\n  else if(a==='rphdel')rvPhotoDel(t.dataset.n);\n  else if(a==='msub1')modSubmit([t.dataset.id]);\n  else if(a==='msuball')modSubmit(S.prod.items.filter(p=>p.ms==='draft').map(p=>p.id));   // только черновики: возвращённые уходят после исправления, кнопкой у самого товара\n  else if(a==='mfix'){\n    S.medit[t.dataset.id]=true;S.pxo[t.dataset.id]=true;paintSeller();\n    const row=document.getElementById('prow-'+t.dataset.id);if(row)try{row.scrollIntoView({block:'center'})}catch(x){}\n  }\n  else if(a==='pnew'){\n    if(!S.prod.cats.length){toast(L('Сначала создайте категорию','Avval kategoriya yarating'));return}\n    if(S.prod.items.length>=MAX_ITEMS){toast(L('Больше '+MAX_ITEMS+' товаров нельзя',MAX_ITEMS+' tadan ortiq mahsulot boʻlmaydi'));return}\n    const cat=S.pfilter!=='all'?S.pfilter:S.prod.cats[0].id;\n    const p={id:'p'+Math.random().toString(36).slice(2,9),cat,name:'Новый товар',uz:'Yangi mahsulot',desc:'',descUz:'',amount:0,unit:'g',price:0,on:true,tag:'',old:0,pv:'',tiers:[],blk:0,box:0};\n    S.prod.items.push(p);S.pxo[p.id]=true;queueSave('prod');paintSeller();\n    const inp=document.getElementById('pname-'+p.id);\n    if(inp){inp.focus();inp.select();try{inp.scrollIntoView({block:'center'})}catch(x){}}\n  }\n  else if(a==='pdel'){\n    const id=t.dataset.id;\n    if(S.cd===id){\n      S.cd=null;\n      S.prod.items=S.prod.items.filter(p=>p.id!==id);delete S.pxo[id];delete S.cart[id];delete S.stk[id];saveCart();\n      queueSave('prod');paintSeller();\n    }else{\n      S.cd=id;t.textContent=L('Точно удалить?','Aniq oʻchirilsinmi?');\n      setTimeout(()=>{if(S.cd===id){S.cd=null;t.textContent=L('Удалить товар','Mahsulotni oʻchirish')}},4000);\n    }\n  }\n  else if(a==='pmove'){\n    const id=t.dataset.id,d=Number(t.dataset.d)||0,arr=S.prod.items;\n    const vis=arr.map((p,i)=>i).filter(i=>S.pfilter==='all'||arr[i].cat===S.pfilter);\n    const pos=vis.indexOf(arr.findIndex(p=>p.id===id)),to=pos+d;\n    if(pos<0||to<0||to>=vis.length)return;\n    const a1=vis[pos],b1=vis[to],tmp=arr[a1];arr[a1]=arr[b1];arr[b1]=tmp;\n    queueSave('prod');paintSeller();\n    const row=document.getElementById('prow-'+id);if(row)try{row.scrollIntoView({block:'center'})}catch(x){}\n  }\n  else if(a==='phdel')removePhoto(t.dataset.id,t.dataset.n);\n  else if(a==='pzoom')openViewer(t.dataset.id);\n  else if(a==='lbclose')closeViewer();\n  else if(a==='lbbg'){if(e.target.tagName!=='IMG')closeViewer()}\n  else if(a==='copy'){\n    const v=t.dataset.v||'';\n    const ok=t.dataset.ok||L('Номер скопирован','Raqam nusxalandi');\n    const lab=(t.dataset.lab!==undefined?t.dataset.lab:L('Номер: ','Raqam: '))+v;\n    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(()=>toast(ok),()=>toast(lab));\n    else toast(lab);\n  }\n  else if(a==='stab'){sellerOpen(t.dataset.t);menuSet(false)}\n  else if(a==='otab'){ownOpen(t.dataset.t);menuSet(false)}\n  else if(a==='rdays'){const v=Number(t.dataset.v);if(RP_DAYS.includes(v)&&v!==S.rep.days){S.rep.days=v;S.rep.sel=-1;S.rep.hov=-1;S.rep.allP=false;loadReport()}}\n  else if(a==='rsel'){if(Date.now()-S.rep.skip<400)return;const i=Number(t.dataset.i);S.rep.sel=S.rep.sel===i?-1:i;S.rep.hov=-1;repShow(S.rep.sel)}\n  else if(a==='rtab'){S.rep.tab=!S.rep.tab;paintRep()}\n  else if(a==='rall'){S.rep.allP=!S.rep.allP;paintRep()}\n  else if(a==='rretry')loadReport();\n  else if(a==='sfilter'){S.sfilter=t.dataset.v;paintStock()}\n  else if(a==='sjr'){S.jrOpen=!S.jrOpen;paintStock();if(S.jrOpen)loadJournal()}\n  else if(a==='sin'||a==='sset'){\n    const id=t.dataset.id,n=stockNum(id,'sn',a==='sin'?1:0);\n    if(n===null)return;\n    const body={op:a==='sin'?'in':'set',n},u=stockUnit(id),pr=S.prod.items.find(x=>x.id===id);\n    if(u)body.u=u;\n    const pcs=u&&pr?n*packSize(pr,u):0,ex=pcs?' ('+(a==='sin'?'+':'= ')+pcs+' '+pcsWord()+')':'';\n    stockDo(id,body,(a==='sin'?L('Приход записан','Kirim yozildi'):L('Остаток исправлен','Qoldiq tuzatildi'))+ex);\n  }\n  else if(a==='sstart'){\n    const id=t.dataset.id,n=stockNum(id,'sn',0);\n    if(n===null)return;\n    const body={op:'set',n},u=stockUnit(id);\n    if(u)body.u=u;\n    const lw=document.getElementById('sl-'+id),raw=lw?String(lw.value).trim():'';\n    if(raw!==''){\n      const v=Number(raw);\n      if(!Number.isInteger(v)||v<0||v>1000000){toast(L('Порог — целое число, 0 или больше','Chegara — butun son (0 yoki koʻp)'));lw.focus();return}\n      body.low=v;\n    }\n    stockDo(id,body,L('Учёт начат','Hisob boshlandi'));\n  }\n  else if(a==='soff'){\n    const id=t.dataset.id;\n    if(S.sc===id){S.sc=null;stockDo(id,{op:'off'},L('Учёт отключён','Hisob oʻchirildi'))}\n    else{\n      S.sc=id;paintStockRow(id);\n      setTimeout(()=>{if(S.sc===id){S.sc=null;paintStockRow(id)}},4000);\n    }\n  }\n  else if(a==='adays'){const v=Number(t.dataset.v);if(RP_DAYS.includes(v)&&v!==S.an.days){S.an.days=v;S.an.all=false;loadAnalytics()}}\n  else if(a==='antab'){S.an.tab=t.dataset.v;S.an.all=false;renderAnalytics()}\n  else if(a==='ansort'){S.an.sort=t.dataset.v==='n'?'n':'sum';renderAnalytics()}\n  else if(a==='anall'){S.an.all=!S.an.all;renderAnalytics()}\n  else if(a==='anretry')loadAnalytics();\n  else if(a==='bmine'){S.base.mc=!S.base.mc;loadBase(true)}\n  else if(a==='cmine')clientCardOpen(t.dataset.id);\n  else if(a==='csave')clientCardSave();\n  else if(a==='cretry')clientCardOpen(S.base.cd);\n  else if(a==='cgrp'){const el=document.getElementById('cf-grp');if(el&&S.base.cf){el.value=t.dataset.v;S.base.cf.grp=t.dataset.v;el.focus()}}\n  else if(a==='bxport')doExport(t.dataset.k,undefined,baseShop());\n  else if(a==='pmenu'){S.pm=!S.pm;paintSeller()}\n  else if(a==='whof'){S.own.who.f=t.dataset.v;S.own.who.all=false;renderOwner()}\n  else if(a==='whoall'){S.own.who.all=true;const l=$('#who-list');if(l)l.innerHTML=whoListHTML()}\n  else if(a==='dxmenu'){S.dxm=!S.dxm;dPaint()}\n  else if(a==='dmorn')dMorning()\n  else if(a==='dxport'){S.dxm=false;dPaint();doExport('debts',{f:t.dataset.f})}\n  else if(a==='impapply')impApply();\n  else if(a==='impcancel'){S.imp=null;paintSeller()}\n  else if(a==='pick')openPick(t.dataset.day?{day:t.dataset.day}:{});\n  else if(a==='pick1')openPick({ids:[t.dataset.id]});\n  else if(a==='pclose')closePick();\n  else if(a==='pprint')printPick();\n  else if(a==='xport')doExport(t.dataset.k,t.dataset.k==='report'?{days:S.rep.days}:undefined);\n  else if(a==='xpick'){if(S.pick)doExport('pick',S.pick.body)}\n  else if(a==='pfsave')saveProfile();\n  else if(a==='repeat')repeatOrder(t.dataset.id,t.dataset.d);\n  else if(a==='addr'){\n    const x=S.profile&&S.profile.addrs[Number(t.dataset.i)];\n    if(!x)return;\n    S.form.address=x;saveForm();\n    const ta=$('#f-address');\n    if(ta){ta.value=x;ta.setAttribute('aria-invalid','false')}\n    const er=$('#e-address');if(er)er.textContent='';\n    markAddr();\n  }\n  else if(a==='filter'){S.filter=t.dataset.v;paintSeller()}\n  else if(a==='status'){setStatus(t.dataset.id,t.dataset.to)}\n  else if(a==='payopen')payOpen(t.dataset.id)\n  else if(a==='payback'){if(S.view==='courier'){S.cr.pay=null;paintCourier()}else{S.pay=null;paintSeller()}}\n  else if(a==='paym')payMethod(t.dataset.m)\n  else if(a==='paydays'){if(curPay()){curPay().days=t.dataset.n;const el=$('#pd-days');if(el)el.value=t.dataset.n;document.querySelectorAll('[data-act=\"paydays\"]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.n===t.dataset.n)))}}\n  else if(a==='paypm'){if(curPay()){curPay().pm=t.dataset.v;document.querySelectorAll('[data-act=\"paypm\"]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.v===t.dataset.v)))}}\n  else if(a==='paygo')payGo()\n  else if(a==='ctab'){courierOpen(t.dataset.t);menuSet(false)}\n  else if(a==='crtab')courierOpen(t.dataset.v)\n  else if(a==='courierof')enterShop(t.dataset.id,'courier')\n  else if(a==='crtake')crTake(t.dataset.id)\n  else if(a==='crrelease')crRelease(t.dataset.id)\n  else if(a==='crpayopen'){S.cr.pay={id:t.dataset.id,step:'m',days:'7',paid:'',pm:'cash'};paintCourier()}\n  else if(a==='dvadd')dvAdd()\n  else if(a==='dvlink')dvLink(t.dataset.id)\n  else if(a==='dvdel')dvDel(t.dataset.id)\n  else if(a==='dvflag')dvFlag(t.dataset.id,t.dataset.k)\n  else if(a==='dvhist')dvOpen(t.dataset.id,'hist')\n  else if(a==='dvnv')dvOpen(t.dataset.id,'nv')\n  else if(a==='dvlim')dvOpen(t.dataset.id,'lim')\n  else if(a==='dvlimgo')dvSetLim()\n  else if(a==='dvlimoff')dvSetLim(0)\n  else if(a==='dvdl')dvOpen(t.dataset.id,'dl')\n  else if(a==='dvdlgo')dvSetDl(Number(t.dataset.v))\n  else if(a==='dhvoid')dvHVoid(Number(t.dataset.n))\n  else if(a==='dhvgo')dvHGo('void')\n  else if(a==='dhvno'){S.dv.hv=0;S.dv.why='';paintSeller()}\n  else if(a==='dhres')dvHRes(Number(t.dataset.n))\n  else if(a==='dhrgo')dvHGo('res')\n  else if(a==='dhrno'){S.dv.hr=0;S.dv.note='';paintSeller()}\n  else if(a==='chans')crHandAns(Number(t.dataset.n),t.dataset.ok==='1')\n  else if(a==='dvver')dvVerify(t.dataset.id,Number(t.dataset.nv))\n  else if(a==='dvhand')dvOpen(t.dataset.id,'hand')\n  else if(a==='dvclose'){S.dv.open=null;S.dv.det=null;paintSeller()}\n  else if(a==='dvall'){const el=$('#dv-amount'),c=S.dv.det&&S.dv.det.courier;if(el&&c){el.value=String(c.cash);S.dv.amount=el.value}}\n  else if(a==='dvgo')dvHand()\n  else if(a==='dopen')debtOpen(Number(t.dataset.uid))\n  else if(a==='dback')debtClose()\n  else if(a==='mdcf')myDebtConfirm(t.dataset.did,Number(t.dataset.g),t.dataset.ok==='1')\n  else if(a==='mdord'){const m=S.mdebt;m.ex[t.dataset.k]=!m.ex[t.dataset.k];renderMyDebt()}\n  else if(a==='dord'){const d=DB();d.ex[t.dataset.k]=!d.ex[t.dataset.k];debtSync();dPaint()}\n  else if(a==='dfull'){const el=$('#dp-amount');if(el&&DB().det){el.value=String(DB().det.bal);DB().amount=el.value}}\n  else if(a==='dpm'){DB().pm=t.dataset.v;document.querySelectorAll('[data-act=\"dpm\"]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.v===t.dataset.v)))}\n  else if(a==='dpay')debtPay()\n  else if(a==='dvoid')debtVoid(Number(t.dataset.n))\n  else if(a==='dvoidgo')debtVoidGo()\n  else if(a==='dvoidno'){const d=DB();d.vn=0;d.vwhy='';dPaint()}\n  else if(a==='dres')debtRes(Number(t.dataset.n))\n  else if(a==='dresgo')debtResGo()\n  else if(a==='dresno'){const d=DB();d.rn=0;d.rnote='';dPaint()}\n  else if(a==='dflt'){const d=DB();d.flt=t.dataset.v;dPaint()}\n  else if(a==='dremind')debtRemind()\n  else if(a==='dact'){debtSync();DB().actOpen=!DB().actOpen;dPaint()}\n  else if(a==='dactp'){DB().actp=t.dataset.v;document.querySelectorAll('[data-act=\"dactp\"]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.v===t.dataset.v)))}\n  else if(a==='dactgo')debtActSend()\n  else if(a==='contact'){try{if(S.tg&&S.initData&&S.tg.openTelegramLink){e.preventDefault();S.tg.openTelegramLink(t.href)}}catch(err){}}\n  else if(a==='oitems'){\n    const k=okey(t.dataset.id,t.dataset.d||S.did),card=t.closest('.ord'),on=!S.ox[k];\n    if(on)S.ox[k]=1;else delete S.ox[k];\n    if(card){card.classList.toggle('open',on);t.setAttribute('aria-expanded',on?'true':'false');const i=t.querySelector('i');if(i)i.textContent=on?L('Свернуть','Yigʻish'):L('Показать','Koʻrsatish')}\n  }\n  else if(a==='scancel'||a==='mycancel'){\n    const id=t.dataset.id,d=t.dataset.d||S.did,k=okey(id,d);\n    if(S.cc===k){\n      S.cc=null;\n      if(a==='scancel')setStatus(id,'cancelled');\n      else cancelMine(id,d);\n    }else{\n      S.cc=k;\n      if(S.view==='seller')paintSeller();else renderMine();\n      setTimeout(()=>{if(S.cc===k){S.cc=null;if(S.view==='seller')paintSeller();else if(S.view==='mine')renderMine()}},4000);\n    }\n  }\n});\ndocument.addEventListener('input',e=>{\n  const t=e.target;\n  if(t.id==='q'){S.q=t.value;paintGrid()}\n  else if(t.id==='dp-amount')DB().amount=t.value\n  else if(t.id==='dp-note')DB().note=t.value\n  else if(t.id==='dv-name')S.dv.name=t.value\n  else if(t.id==='dv-phone')S.dv.phone=t.value\n  else if(t.id==='dv-amount')S.dv.amount=t.value\n  else if(t.id==='dv-lim')S.dv.amount=t.value\n  else if(t.id==='dh-why')S.dv.why=t.value\n  else if(t.id==='dh-note')S.dv.note=t.value\n  else if(t.id==='dx-why')DB().vwhy=t.value\n  else if(t.id==='dx-note')DB().rnote=t.value\n  else if(t.dataset.dnote!==undefined)S.own.disp.note[t.dataset.dnote]=t.value\n  else if(t.id==='pd-days'&&curPay()){curPay().days=t.value;document.querySelectorAll('[data-act=\"paydays\"]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.n===String(t.value).trim())))}\n  else if(t.id==='pd-paid'&&curPay()){curPay().paid=t.value;const o=curOrder(curPay().id),el=$('#pd-rest');if(o&&el)el.textContent=payRestTxt(o)}\n  else if(t.dataset.cf!==undefined&&t.dataset.cf!=='blocked'&&S.base.cf)S.base.cf[t.dataset.cf]=t.value;\n  else if(t.dataset.rq!==undefined){S.rv.q=t.value;if(S.rv.loaded)paintReview()}\n  else if(t.dataset.rtxt!==undefined){S.rv.rtxt=t.value;rvRetSync()}\n  else if(t.dataset.rf!==undefined)rvField(t)\n  else if(t.dataset.opct!==undefined)S.own.pcts[t.dataset.opct]=t.value;\n  else if(t.dataset.bq!==undefined){S.base.q=t.value;clearTimeout(S.base.qt);S.base.qt=setTimeout(()=>loadBase(true),350)}\n  else if(t.dataset.bf!==undefined)S.base.fm[t.dataset.bf]=t.value;\n  else if(t.dataset.bfLink!==undefined)S.base.link=t.value;\n  else if(t.dataset.aterr!==undefined){const set=new Set(S.own.aterr);if(t.checked)set.add(t.dataset.aterr);else set.delete(t.dataset.aterr);S.own.aterr=[...set]}\n  else if(t.dataset.agterr!==undefined){\n    const [aid,tid]=t.dataset.agterr.split(':'),ag=S.own.ppl&&S.own.ppl.agents.find(x=>x.id===aid);\n    if(ag){const set=new Set(ag.terr);if(t.checked)set.add(tid);else set.delete(tid);peopleCall('PUT','/agents/'+encodeURIComponent(aid),{terr:[...set]})}\n  }\n  else if(t.dataset.ownWho!==undefined){const W=S.own.who;W[t.dataset.ownWho]=t.value;W.all=false;const l=$('#who-list');if(l)l.innerHTML=whoListHTML()}\n  else if(t.dataset.own!==undefined){S.own[t.dataset.own]=t.value;if(t.dataset.own!=='ftitle'&&S.own.err2){S.own.err2='';const er=$('#o-err');if(er)er.textContent=''}}\n  else if(t.dataset.qty!==undefined){\n    /* количество вводят с клавиатуры: пока клиент печатает, обновляем только суммы */\n    const id=t.dataset.qty;let v=Math.floor(Number(t.value));\n    if(!isFinite(v)||v<1)return;\n    const w=cartSet(id,v);\n    if(w!==v)t.value=String(w);\n    if(!w){qtyDone(t);return}\n    refreshTotals(id);\n  }\n  else if(t.dataset.f){\n    const f=t.dataset.f;S.form[f]=t.value;\n    if(f==='date')fillTimes();\n    if(f==='name'||f==='phone'||f==='address'||f==='terr')saveForm();\n    if(f==='address')markAddr();\n    const er=$('#e-'+f);if(er&&er.textContent){er.textContent='';t.setAttribute('aria-invalid','false')}\n  }\n  else if(t.dataset.pid!==undefined){\n    const p=S.prod.items.find(x=>x.id===t.dataset.pid),k=t.dataset.pp;\n    if(!p)return;\n    if(k==='on'){p.on=t.checked;const row=t.closest('.prow');if(row)row.classList.toggle('off',!t.checked)}\n    else if(k==='amount'||k==='price'||k==='old'){const v=Number(t.value);p[k]=isFinite(v)&&v>=0?v:0;if(k==='price')syncTiers(p)}\n    else if(k==='blk'||k==='box'){const v=Math.round(Number(t.value));p[k]=v>=2&&v<=500?v:0}\n    else if(k==='tn'||k==='tp')syncTiers(p);\n    else p[k]=t.value;\n    pxLive(p);\n    queueSave('prod');\n  }\n  else if(t.dataset.cid!==undefined){\n    const c=S.prod.cats.find(x=>x.id===t.dataset.cid);\n    if(!c)return;\n    c[t.dataset.cp]=t.value;\n    queueSave('prod');\n  }\n  else if(t.dataset.sd!==undefined)syncDisc();\n  else if(t.dataset.sreg!==undefined){\n    const set=new Set(cleanRegions(S.cfg.shop.regions));\n    if(t.checked)set.add(t.dataset.sreg);else set.delete(t.dataset.sreg);\n    S.cfg.shop.regions=cleanRegions([...set]);\n    queueSave();\n  }\n  else if(t.dataset.s){\n    const k=t.dataset.s;\n    if(k==='regonly'){\n      S.regOnly=t.checked;\n      if(!t.checked){S.cfg.shop.regions=[];document.querySelectorAll('[data-sreg]').forEach(x=>{x.checked=false})}\n      const b=$('#regbox');if(b)b.hidden=!t.checked;\n    }\n    else if(k==='home')S.cfg.shop.home=cleanRegion(t.value);\n    else if(k==='delivery')S.cfg.shop.delivery=t.checked;\n    else if(['leadHours','deliveryLeadHours','openFrom','openTo','minOrder','deliveryFee','freeDeliveryFrom'].includes(k)){const v=Number(t.value);S.cfg.shop[k]=isFinite(v)&&v>=0?v:0}\n    else S.cfg.shop[k]=t.value;\n    if(k==='name'){$('#brandName').textContent=t.value||DEFAULT.shop.name;document.title=t.value||DEFAULT.shop.name}\n    queueSave();\n  }\n});\n\ndocument.addEventListener('change',e=>{\n  const t=e.target;\n  if(t&&t.type==='file'&&t.dataset.imp){\n    const f=t.files&&t.files[0];\n    if(f)importFile(f);\n    try{t.value=''}catch(x){}\n  }\n  else if(t&&t.type==='file'&&t.dataset.photo){\n    const f=t.files&&t.files[0];\n    if(f)uploadPhoto(t.dataset.photo,f,t.dataset.n);\n    try{t.value=''}catch(x){}\n  }\n  else if(t&&t.type==='file'&&t.dataset.rphoto){\n    const f=t.files&&t.files[0];\n    if(f)rvPhotoUp(f,t.dataset.n);\n    try{t.value=''}catch(x){}\n  }\n  else if(t&&t.dataset&&t.dataset.rfil!==undefined){S.rv[t.dataset.rfil]=t.value;paintReview()}\n  else if(t&&t.dataset&&t.dataset.bterr!==undefined){S.base.terr=t.value;loadBase(true)}\n  else if(t&&t.dataset&&t.dataset.ash!==undefined){S.an.sh=t.value;S.an.all=false;loadAnalytics()}\n  else if(t&&t.dataset&&t.dataset.cf==='blocked'){if(S.base.cf)S.base.cf.blocked=!!t.checked}\n  else if(t&&t.dataset&&t.dataset.reg!==undefined)setRegion(t.value);\n  else if(t&&t.dataset&&t.dataset.qty!==undefined)qtyDone(t);\n  else if(t&&t.dataset&&t.dataset.sl!==undefined){\n    /* порог «мало» у товара, по которому уже ведётся учёт, сохраняется сразу */\n    const id=t.dataset.sl,s=S.stk[id];\n    if(!s)return;\n    const raw=String(t.value).trim(),v=Number(raw);\n    if(raw===''||!Number.isInteger(v)||v<0||v>1000000){toast(L('Порог — целое число, 0 или больше','Chegara — butun son (0 yoki koʻp)'));t.value=String(s.low);return}\n    if(v!==s.low)stockDo(id,{op:'low',n:v},L('Порог сохранён','Chegara saqlandi'),true);\n  }\n});\n/* картинка не загрузилась: оставляем заглушку */\ndocument.addEventListener('error',e=>{\n  const t=e.target;\n  if(t&&t.tagName==='IMG'&&t.closest('.pimg,.cth,.pthumb,.th,.pslot,.lb-slide')){\n    const ph=document.createElement('span');ph.className='ph';ph.textContent='📦';ph.setAttribute('aria-hidden','true');\n    t.replaceWith(ph);\n  }\n},true);\n\n/* ---------- network ---------- */\n/* Запросы к дистрибьютору идут с его номером в заголовке x-shop (по умолчанию открытый сейчас). Ответ, пришедший уже после перехода к другому дистрибьютору, отбрасывается. */\nconst isHubPath=path=>path==='/api/shops'||path.indexOf('/api/hub/')===0;\nasync function api(method,path,body,did){\n  const ep=S.epoch,hub=isHubPath(path),d=did||S.did;\n  if(!hub&&!d)return {ok:false,status:0,data:null,stale:true};\n  try{\n    const h={'content-type':'application/json'};\n    if(S.initData)h['x-init-data']=S.initData;\n    if(!hub)h['x-shop']=d;\n    const r=await fetch(path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    if(!hub&&!did&&S.epoch!==ep)return {ok:false,status:0,data:null,stale:true};\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\n/* «Мои заказы» — заказы клиента у всех дистрибьюторов сразу (каждый с полями did и shopName) */\nasync function loadMine(){\n  if(!S.auth)return;\n  const r=await api('GET','/api/hub/orders');\n  if(!r.ok||!r.data||!Array.isArray(r.data.orders))return;\n  if(JSON.stringify(r.data.orders)===JSON.stringify(S.myOrders))return;\n  S.myOrders=r.data.orders;renderNav();\n  if(S.view==='mine')renderMine();\n}\nasync function loadAdmin(){\n  if(!S.admin||!S.did)return;\n  loadStock();loadDebts();\n  if((S.sellerTab==='dlv'&&S.view==='seller')||!S.dv.ok||S.dv.list.length)loadCouriers();\n  const r=await api('GET','/api/admin/orders');\n  if(!r.ok||!r.data)return;\n  if(JSON.stringify(r.data.orders)===JSON.stringify(S.allOrders)&&JSON.stringify(r.data.stats)===JSON.stringify(S.stats))return;\n  S.allOrders=r.data.orders;S.stats=r.data.stats;renderNav();\n  const ae=document.activeElement;\n  if(S.view==='seller'&&S.sellerTab==='orders'&&!(S.pay&&ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)))paintSeller();\n}\nasync function loadCfg(){\n  if(!S.did||S.dirty||S.saving||!S.ready)return;\n  const r=await api('GET','/api/config');\n  if(!r.ok||!r.data)return;\n  const next=mergeCfg(r.data.cfg),nextP=normProd(r.data.prod),off=!!r.data.off;\n  if(JSON.stringify(next)===JSON.stringify(S.cfg)&&JSON.stringify(nextP)===JSON.stringify(S.prod)&&off===S.off)return;\n  const ae=document.activeElement,typing=ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);\n  if(S.view==='shop'&&typing)return;\n  if(S.view==='seller'&&S.sellerTab==='prod'&&typing)return;\n  const msig=x=>x.items.map(p=>p.id+':'+(p.ms||'')+':'+(p.mc||'')).join();\n  const msChanged=msig(nextP)!==msig(S.prod);\n  S.cfg=next;S.prod=nextP;S.off=off;normalizeMode();\n  if(S.view==='seller'&&msChanged){paintTabs();if(S.sellerTab==='prod')paintSeller()}\n  const pruned=pruneCart();\n  renderNav();\n  if(S.view==='shop'&&!S.shopPlaced){\n    if(S.shopStep==='cart'&&!cartCount())S.shopStep='list';\n    renderShop();\n    if(pruned)toast(L('Остатки изменились, мы обновили корзину','Qoldiq oʻzgardi, savatni yangiladik'));\n  }\n}\nfunction applyTheme(){\n  try{\n    const cs=S.tg&&S.tg.colorScheme;\n    if(cs==='dark'||cs==='light')document.documentElement.setAttribute('data-theme',cs);\n    const dark=cs?cs==='dark':window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;\n    const bg=dark?'#0E1614':'#F3F7F6';\n    if(S.tg&&S.tg.setHeaderColor){S.tg.setHeaderColor(bg);S.tg.setBackgroundColor(bg)}\n  }catch(e){}\n}\nlet tickN=0;\nfunction tick(){\n  if(document.visibilityState==='hidden'||!S.ready)return;\n  tickN++;\n  if(S.auth&&S.view==='mine')loadMine();\n  if(S.auth&&(S.view==='debt'||tickN%4===0))loadMyDebt(S.view==='debt');\n  if((S.view==='shops'||S.view==='review')&&tickN%2===0)loadHub();\n  else if(isOwner()&&tickN%4===0)loadHub();\n  if(isOwner()&&(tickN%4===0||(S.view==='owner'&&S.own.sec==='disp'&&tickN%2===0)))loadDisputes();\n  if(S.view==='review'&&tickN%2===0&&!S.rv.ret&&!S.rv.edit&&!S.rv.busy)loadReview(true);\n  if(S.admin&&S.did&&(S.view==='seller'||tickN%2===0))loadAdmin();\n  if(S.courier&&S.did&&(S.view==='courier'||tickN%2===0))loadCourier();\n  if(S.did&&tickN%4===0)loadCfg();\n}\n(async function init(){\n  const tg=window.Telegram&&window.Telegram.WebApp;\n  if(tg){\n    S.tg=tg;\n    if(tg.initData)S.initData=tg.initData;\n    try{tg.ready();tg.expand();if(tg.onEvent)tg.onEvent('themeChanged',applyTheme)}catch(e){}\n  }\n  initLang();applyTheme();\n  renderNav();\n  view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Загружаем каталог','Katalog yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div></div>';\n  /* адрес: ?d=<дистрибьютор> открывает его каталог, ?v=mine|seller|owner — нужный раздел */\n  const want=QS.get('d')||'',vw=QS.get('v')||'';\n  loadRegion();\n  await loadHub();\n  if(S.initData&&!S.auth)S.authErr='auth';\n  loadForm();loadCart();\n  const me=S.hub.me;\n  let did=validDid(want)?want:'';\n  if(!did&&!vw&&S.hub.shops.length===1)did=S.hub.shops[0].id;   // дистрибьютор один: список выбирать не из чего\n  if(!did&&!S.hub.loaded&&vw!=='owner'&&vw!=='review'&&vw!=='analytics')did='main';   // список недоступен (площадка не подключена): работаем как раньше, с первым дистрибьютором\n  if(!did&&vw==='seller'&&me&&me.sells.length===1)did=me.sells[0].id;\n  if(!did&&vw==='courier'&&me&&me.delivers&&me.delivers.length===1)did=me.delivers[0].id;\n  S.ready=true;\n  let v='shops';\n  if(did&&await openShop(did))v=vw==='review'&&isOwner()?'review':vw==='seller'&&S.admin?'seller':vw==='courier'&&S.courier?'courier':vw==='mine'?'mine':vw==='debt'?'debt':'shop';\n  else if(vw==='mine')v='mine';\n  else if(vw==='debt')v='debt';\n  else if(vw==='owner'&&isOwner())v='owner';\n  else if(vw==='base'&&canBase())v='base';\n  else if(vw==='review'&&isOwner())v='review';\n  else if(vw==='analytics'&&isOwner())v='analytics';\n  S.view=v;\n  render();\n  if(v==='debt')loadMyDebt(true);\n  if(v==='owner')loadOwner();\n  if(v==='base')loadBase(true);\n  if(v==='analytics')loadAnalytics();\n  if(v==='review')loadReview();\n  if(S.admin&&S.did)loadAdmin();\n  if(S.courier&&S.did)loadCourier();\n  if(isOwner()&&v!=='owner')loadDisputes();\n  loadMine();if(v!=='debt')loadMyDebt(false);\n  setInterval(tick,15000);\n  document.addEventListener('visibilitychange',()=>{\n    if(document.visibilityState!=='visible')return;\n    loadCfg();loadMine();loadMyDebt(S.view==='debt');loadAdmin();loadCourier();\n    if(S.view==='shops')loadHub();\n  });\n})();\n</script>\n</body></html>\n";

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
  shop:{name:'Оптовая база',phone:'',telegram:'',address:'',addressUz:'',delivery:true,leadHours:2,deliveryLeadHours:24,openFrom:9,openTo:20,minOrder:0,deliveryFee:0,freeDeliveryFrom:0,discounts:[],regions:[],home:''}
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

/* Регионы Узбекистана: 12 областей, Каракалпакстан и город Ташкент.
   Дистрибьютор отмечает, куда доставляет (shop.regions; пустой список — по всей стране) и где его склад (shop.home, для самовывоза).
   Магазин выбирает свой регион. Самовывоз всегда возможен, ограничена только доставка. */
const REGIONS=[
  {id:'kk',ru:'Республика Каракалпакстан',uz:'Qoraqalpogʻiston Respublikasi'},
  {id:'an',ru:'Андижанская область',uz:'Andijon viloyati'},
  {id:'bu',ru:'Бухарская область',uz:'Buxoro viloyati'},
  {id:'ji',ru:'Джизакская область',uz:'Jizzax viloyati'},
  {id:'qa',ru:'Кашкадарьинская область',uz:'Qashqadaryo viloyati'},
  {id:'nv',ru:'Навоийская область',uz:'Navoiy viloyati'},
  {id:'nm',ru:'Наманганская область',uz:'Namangan viloyati'},
  {id:'sa',ru:'Самаркандская область',uz:'Samarqand viloyati'},
  {id:'su',ru:'Сурхандарьинская область',uz:'Surxondaryo viloyati'},
  {id:'si',ru:'Сырдарьинская область',uz:'Sirdaryo viloyati'},
  {id:'tv',ru:'Ташкентская область',uz:'Toshkent viloyati'},
  {id:'tk',ru:'Город Ташкент',uz:'Toshkent shahri'},
  {id:'fa',ru:'Ферганская область',uz:'Fargʻona viloyati'},
  {id:'xo',ru:'Хорезмская область',uz:'Xorazm viloyati'}
];
const REGION_IDS=REGIONS.map(r=>r.id);
const regionName=id=>{const r=REGIONS.find(x=>x.id===id);return r?(LANG==='uz'?r.uz:r.ru):''};
/* один регион: его номер или пустая строка */
const cleanRegion=v=>typeof v==='string'&&REGION_IDS.includes(v)?v:'';
/* список регионов без повторов и лишнего, в порядке справочника */
const cleanRegions=a=>{const set=new Set(Array.isArray(a)?a:[]);return REGION_IDS.filter(id=>set.has(id))};
/* Ограничена ли доставка: отмечены не все регионы, а часть. Пустой список и «все четырнадцать» — по всей стране. */
/* Региональный фильтр пока выключен: работаем только по Навои, регионы нигде не показываются и доставку не ограничивают (даже если когда-то были отмечены).
   Чтобы вернуть, поставьте REGIONS_DEFAULT = true. Тесты включают его через globalThis.__regionsOn. */
const REGIONS_DEFAULT=false;
const regionsOn=()=>typeof globalThis.__regionsOn==='boolean'?globalThis.__regionsOn:REGIONS_DEFAULT;
const hasZone=a=>{if(!regionsOn())return false;const n=cleanRegions(a).length;return n>0&&n<REGION_IDS.length};
/* Доставляет ли дистрибьютор (запись из списка или настройки) в регион. Нет региона у клиента — считаем, что доставляет. */
const deliversTo=(sh,reg)=>!!sh&&sh.delivery!==false&&(!hasZone(sh.regions)||!reg||cleanRegions(sh.regions).includes(reg));
/* Подходит ли дистрибьютор клиенту из региона reg: доставляет к нему или находится в его регионе (самовывоз). */
const servesRegion=(sh,reg)=>!!sh&&(deliversTo(sh,reg)||(!!reg&&sh.home===reg));

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
    if(o.region&&regionName(o.region))P.push(L('Регион: ','Hudud: ')+regionName(o.region));
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

/* ---------- местоположение ---------- */
/* Точка на карте: {lat, lng} с пятью знаками (около метра) или null, если это не координаты. */
function cleanLoc(v){
  if(!v||typeof v!=='object'||Array.isArray(v))return null;
  const n=x=>typeof x==='number'?x:(typeof x==='string'&&x.trim()!==''?Number(x):NaN);
  const lat=n(v.lat),lng=n(v.lng);
  if(!isFinite(lat)||!isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180||(lat===0&&lng===0))return null;
  return {lat:Math.round(lat*1e5)/1e5,lng:Math.round(lng*1e5)/1e5};
}
/* Ссылка на точку: k — «y» (Яндекс.Карты) или «g» (Google Maps). */
const mapUrl=(k,p)=>k==='g'?'https://www.google.com/maps/search/?api=1&query='+p.lat+','+p.lng:'https://yandex.com/maps/?pt='+p.lng+','+p.lat+'&z=17&l=map';
/* Расстояние между точками, км (по дуге большого круга). */
function distKm(a,b){
  const r=Math.PI/180,dl=(b.lat-a.lat)*r,dg=(b.lng-a.lng)*r;
  const h=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dg/2)**2;
  return 12742*Math.asin(Math.min(1,Math.sqrt(h)));
}
/* Координаты из того, что вставил человек: ссылка Яндекс.Карт, Google Maps, 2ГИС, OpenStreetMap или просто «41.5543, 60.6361».
   Короткие ссылки (maps.app.goo.gl, yandex.uz/maps/-/…) координат не содержат: для них вернётся null. */
function parseGeo(text){
  let s=String(text==null?'':text).trim().slice(0,2000);
  if(!s)return null;
  try{s=decodeURIComponent(s)}catch(e){}
  const F='(-?\\d{1,3}(?:\\.\\d+)?)',pair=(a,b)=>cleanLoc({lat:a,lng:b});
  let m;
  if(/yandex\.|ya\.ru|2gis\./i.test(s)){
    // у Яндекса и 2ГИС порядок «долгота, широта»
    m=s.match(new RegExp('[?&#/](?:pt|ll|m)=\\s*'+F+'\\s*[,;]\\s*'+F));
    if(m)return pair(m[2],m[1]);
  }
  m=s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);      // Google: метка
  if(m)return pair(m[1],m[2]);
  m=s.match(new RegExp('@'+F+'\\s*,\\s*'+F));                   // Google, Apple: центр карты
  if(m)return pair(m[1],m[2]);
  m=s.match(new RegExp('[?&](?:q|query|ll|sll|center|destination|daddr|saddr)=\\s*'+F+'\\s*[,;+ ]\\s*'+F));
  if(m)return pair(m[1],m[2]);
  m=s.match(new RegExp('[?&]mlat='+F+'&mlon='+F));            // OpenStreetMap
  if(m)return pair(m[1],m[2]);
  m=s.match(new RegExp('#map=\\d{1,2}/'+F+'/'+F));
  if(m)return pair(m[1],m[2]);
  // просто числа: «41.5543, 60.6361», «41.5543 60.6361», «41,5543 60,6361»
  const t=s.replace(/^[^\d-]+/,'').replace(/[^\d.,;\s-]+$/,'');
  m=t.match(/^(-?\d{1,3}(?:[.,]\d+)?)\s*[;\s]\s*(-?\d{1,3}(?:[.,]\d+)?)$/)||t.match(/^(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)$/);
  if(!m)m=s.match(new RegExp('(-?\\d{1,2}\\.\\d{3,})\\s*[,;/\\s]\\s*(-?\\d{1,3}\\.\\d{3,})'));
  if(m){
    let a=Number(String(m[1]).replace(',','.')),b=Number(String(m[2]).replace(',','.'));
    if(Math.abs(a)>90&&Math.abs(b)<=90){const x=a;a=b;b=x}
    return pair(a,b);
  }
  return null;
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
const MAIN = 'main';          // первый дистрибьютор: его данные лежали в хранилище ещё до появления площадки
const MAX_SHOPS = 50;         // дистрибьюторов на площадке
const MIN_CODE = 12;          // короткий код продавца не принимаем
const HUB_TITLE = 'Sarbon';
const validDid = d => typeof d === 'string' && /^[a-z0-9]{2,12}$/.test(d);
const NEXT ={ new: ['accepted', 'cancelled'], accepted: ['ready', 'cancelled'], ready: ['done', 'cancelled'] };

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
/* Фото товара: до трёх. Первое (pv) показывается на карточке в каталоге и лежит там же, где лежало единственное фото раньше (p:<товар>);
   второе и третье (pv2, pv3) лежат в p2:<товар> и p3:<товар>. Фото всегда идут подряд, без дыр: убрали первое, второе встаёт на его место. */
const PHOTOS_MAX = 3;
const photoKey = (id, n) => (n > 1 ? 'p' + n + ':' : 'p:') + id;
const photoVers = it => {
  const v = [it.pv, it.pv2, it.pv3].map(x => (typeof x === 'string' ? x : ''));
  const n = v.findIndex(x => !x);
  return n < 0 ? v : v.slice(0, n);
};

const json = (obj, status) => new Response(JSON.stringify(obj), {
  status: status || 200,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const html = (body, status) => new Response(body, {
  status: status || 200,
  headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
});
/* Запрос к Telegram Bot API. Сбой сети не бросает ошибку, а возвращается как {ok:false}. */
async function tgApi(token, method, payload) {
  if (!token) return { ok: false, description: 'BOT_TOKEN не задан' };
  try {
    const r = await fetch(TG_API + token + '/' + method, {
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
  s.regions = cleanRegions(s.regions);
  s.home = cleanRegion(s.home);
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
/* Проверка товаров. У одобренного товара метки ms нет совсем (так выглядят и все прежние товары).
   ms: 'draft' — продавец добавил, но ещё не отправил на проверку; 'wait' — ждёт проверки; 'ret' — владелец вернул с причиной mc.
   mt — когда статус менялся в последний раз, ma — когда владелец одобрил. Эти поля продавец не задаёт: берутся из сохранённых данных. */
const MOD_BAD_NAMES = ['', 'Без названия', 'Новый товар'];
const MOD_REASON_MAX = 300;
const isApproved = it => !it.ms;
const ruCount = (n, w) => { const m = n % 100, k = n % 10; return m > 10 && m < 15 ? w[2] : k === 1 ? w[0] : k > 1 && k < 5 ? w[1] : w[2]; };
const ruTovar = n => n + ' ' + ruCount(n, ['товар', 'товара', 'товаров']);
/* Что мешает отправить товар на проверку: название, цена, категория. */
function modProblems(it, cats) {
  const bad = [];
  if (MOD_BAD_NAMES.includes(String(it.name || '').trim())) bad.push('name');
  if (!(Number(it.price) > 0)) bad.push('price');
  if (!cats.some(c => c.id === it.cat)) bad.push('cat');
  return bad;
}
/* Чистит то, что прислал продавец. Версию фото (pv) клиент не задаёт: берём из сохранённых данных.
   mod: {state, at} — в каком состоянии начинают новые товары (draft, wait; у владельца ok — метки нет). */
function sanitizeProd(d, old, mod) {
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
      pv: prev && typeof prev.pv === 'string' ? prev.pv : '',
      pv2: prev && typeof prev.pv2 === 'string' ? prev.pv2 : '',
      pv3: prev && typeof prev.pv3 === 'string' ? prev.pv3 : ''
    });
    const it = items[items.length - 1];
    if (prev) {
      if (prev.ms) { it.ms = prev.ms; if (prev.mt) it.mt = prev.mt; if (prev.mc) it.mc = prev.mc; }
      if (prev.ma) it.ma = prev.ma;
    } else if (mod && mod.state && mod.state !== 'ok') {
      it.ms = mod.state;
      if (mod.state === 'wait') it.mt = mod.at;
    }
  });
  return { cats, items };
}

/* ---------- остатки ---------- */
/* Каталог для покупателей: у товаров с учётом добавляется av (сколько можно заказать, не больше 500) и lw (товара мало).
   Товар на проверке виден покупателю без цены (серой карточкой «На модерации»), черновики и возвращённые не видны совсем.
   admin: продавцу отдаётся всё, с метками проверки. */
function publicProd(prod, stk, admin) {
  const items = [];
  prod.items.forEach(it => {
    if (it.ms && !admin) {
      if (it.ms !== 'wait') return;
      items.push({ id: it.id, cat: it.cat, name: it.name, uz: it.uz || '', desc: it.desc, descUz: it.descUz, amount: it.amount, unit: it.unit, price: 0, tiers: [], blk: 0, box: 0, on: true, tag: '', old: 0, pv: it.pv, pv2: it.pv2, pv3: it.pv3, ms: 'wait' });
      return;
    }
    const v = stk && !it.ms ? stkPublic(stk[it.id], MAX_QTY) : undefined;
    items.push(!v ? it : Object.assign({}, it, v.lw ? { av: v.av, lw: 1 } : { av: v.av }));
  });
  return { cats: prod.cats, items };
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
  let address = '', region = '';
  if (mode === 'delivery') {
    if (cfg.shop.delivery === false) return { err: 'no_delivery' };
    // доставка только в отмеченные регионы: регион нужен, и он должен быть из списка. Самовывоз не ограничен.
    region = cleanRegion(f.region);
    if (hasZone(cfg.shop.regions)) {
      if (!region) return { err: 'region_need' };
      if (!cleanRegions(cfg.shop.regions).includes(region)) return { err: 'no_region' };
    }
    address = cleanStr(f.address, 200);
    if (address.length < 5) return { err: 'bad_request' };
  }
  const date = typeof f.date === 'string' ? f.date : '', time = typeof f.time === 'string' ? f.time : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return { err: 'pickup' };
  // час запаса, чтобы не спорить с клиентскими часами
  const pk = pickupInfo(cfg, new Date(shopNow().getTime() - 3600000), leadFor(cfg, mode));
  if (date > pk.max || !pk.slots(date).includes(time)) return { err: 'pickup' };
  // точка на карте необязательна; неверную молча отбрасываем, заказ из-за неё не отклоняем
  return { name, phone, comment, mode, address, region, pickupAt: date + 'T' + time, loc: cleanLoc(f.loc) };
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
    if (!it || it.on === false || it.ms) { missing = true; continue; }   // на проверке заказать нельзя
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
  return { items, sub: total, disc: dc.amount, dpct: dc.pct, fee, total: total - dc.amount + fee, name: fm.name, phone: fm.phone, comment: fm.comment, mode: fm.mode, address: fm.address, region: fm.region, pickupAt: fm.pickupAt, loc: fm.loc };
}

const publicOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.tg; delete x.msgs; delete x.rs; delete x.cm; delete x.cr; delete x.crAt; return x; };
const adminOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.msgs; delete x.rs; delete x.cm; return x; };

/* ---------- клиентская база ---------- */
const phoneOk = p => { const d = p.replace(/\D/g, '').length; return d >= 9 && d <= 15; };
const newClient = (uid, since) => ({ uid, name: '', phone: '', org: '', addrs: [], note: '', grp: '', blocked: false, since: since || new Date().toISOString(), last: '', n: 0, ds: 0, sum: 0, tg: { username: '', name: '' }, lang: '' });
/* то, что клиент видит о себе: заметка, группа и блокировка остаются у продавца */
const clientPublic = c => c ? { name: c.name, phone: c.phone, org: c.org, addrs: c.addrs } : null;
const sameAddr = (a, b) => a.toLowerCase() === b.toLowerCase();
/* Что дистрибьютор знает о магазине из общей базы: заказы у него, его заметка, группа и блокировка.
   cs: записи клиентов этого дистрибьютора, относящиеся к магазину (у магазина может быть несколько сотрудников со своими аккаунтами);
   bn: заметка и группа, которые дистрибьютор ведёт по номеру магазина в базе (работает и у магазина без аккаунта). */
function mineRow(bid, cs, bn) {
  const r = { bid, has: cs.length > 0, n: 0, ds: 0, sum: 0, last: '', blocked: false, note: '', grp: '', tg: '' };
  for (const c of cs) {
    r.n += Number(c.n) || 0; r.ds += Number(c.ds) || 0; r.sum += Number(c.sum) || 0;
    if (String(c.last || '') > r.last) r.last = String(c.last);
    if (c.blocked) r.blocked = true;
    if (!r.tg && c.tg && c.tg.username) r.tg = String(c.tg.username);
  }
  const src = bn || cs.find(c => c.note || c.grp) || {};
  r.note = src.note || ''; r.grp = src.grp || '';
  return r;
}
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

/* Кнопки под заказом несут номер дистрибьютора, чтобы нажатие дошло до его хранилища. У первого дистрибьютора формат прежний: так работают и старые сообщения в чате. */
const cbPrefix = did => (did && did !== MAIN ? did + ':' : '');
/* Разбор данных кнопки под заказом: «s:<заказ>:<статус>», «c:<заказ>», «b:<заказ>», «p:<заказ>:<оплата>[:<дней>]».
   У дистрибьюторов кроме первого после буквы идёт ещё его номер. Номера заказов начинаются с «Z-», а у номера дистрибьютора дефиса нет. */
function cbParse(data) {
  const parts = String(data || '').split(':');
  const kind = parts[0];
  const withDid = kind === 's' || kind === 'q' || kind === 'h' ? parts.length >= 4 : kind === 'p' ? !/^Z-/.test(parts[1] || '') : parts.length >= 3;
  const i = withDid ? 2 : 1;
  return { kind, did: withDid ? parts[1] : MAIN, id: parts[i], to: parts[i + 1], days: parts[i + 2] };
}
/* Адреса, которые открывает кнопка в Telegram: каталог дистрибьютора и его панель продавца. */
const shopUrl = (origin, did) => origin + '/' + (did ? '?d=' + did : '');
const sellerUrl = (origin, did) => origin + '/?d=' + (did || MAIN) + '&v=seller';
const courierUrl = (origin, did) => origin + '/?d=' + (did || MAIN) + '&v=courier';
function adminCard(o, shop, origin, confirm, cl, did, debt) {
  setLang('ru');
  const px = cbPrefix(did);
  const who = o.tg && o.tg.username ? '@' + o.tg.username : 'без username';
  const cLines = clientLines(cl);
  const dLine = o.status === 'cancelled' ? '' : debtLine(debt, dayOf(new Date().toISOString()));
  const tail = '\n\n' + (cLines ? cLines + '\n' : '') + (dLine ? dLine + '\n' : '') + 'Telegram: ' + who + (o.tg && o.tg.name ? ' (' + o.tg.name + ')' : '')
    + '\nСтатус: ' + stOf(o.status, o.mode).name + (o.crn ? '\n🚚 Доставщик: ' + o.crn : '') + (o.pay ? '\n' + payLine(o.pay) : '');
  const head = STATUS_ICON[o.status] + ' ';
  // очень длинный заказ: показываем первые позиции, чтобы итог и кнопки не потерялись
  const ask = confirm === 'pay' ? '\n\nКак клиент оплатил заказ? К оплате: ' + money(o.total) : confirm === 'days' ? '\n\nНа сколько дней записать долг?' : '';
  let text = head + orderText(o, shop) + tail + ask;
  for (let k = (o.items || []).length - 1; text.length > TEXT_MAX && k >= 1; k--) text = head + orderText(o, shop, k) + tail + ask;
  if (text.length > TEXT_MAX) text = text.slice(0, TEXT_MAX - 10) + '…';
  const rows = [];
  const btn = (t, d) => ({ text: t, callback_data: d });
  const del = o.mode === 'delivery';
  if (confirm === 'pay') {
    rows.push([btn(PAY_RU.cash, 'p:' + px + o.id + ':cash'), btn(PAY_RU.card, 'p:' + px + o.id + ':card')]);
    rows.push([btn(PAY_RU.bank, 'p:' + px + o.id + ':bank'), btn(PAY_RU.credit, 'p:' + px + o.id + ':credit')]);
    rows.push([{ text: '✂️ Часть сразу, остальное в долг', web_app: { url: sellerUrl(origin, did) } }]);
    rows.push([btn('Назад', 'b:' + px + o.id)]);
  } else if (confirm === 'days') {
    rows.push([3, 7, 14, 30].map(n => btn(n + ' дн.', 'p:' + px + o.id + ':credit:' + n)));
    rows.push([btn('Назад', 's:' + px + o.id + ':done')]);
  } else if (confirm) {
    rows.push([btn('Да, отменить заказ', 's:' + px + o.id + ':cancelled')]);
    rows.push([btn('Назад', 'b:' + px + o.id)]);
  } else {
    if (o.status === 'new') rows.push([btn('✅ Принять в работу', 's:' + px + o.id + ':accepted')]);
    if (o.status === 'accepted') rows.push([btn(del ? '📦 Готов к отправке' : '📦 Готов к выдаче', 's:' + px + o.id + ':ready')]);
    if (o.status === 'ready') rows.push([btn(del ? '🚚 Доставлен клиенту' : '🤝 Выдан клиенту', 's:' + px + o.id + ':done')]);
    if (NEXT[o.status]) rows.push([btn('❌ Отменить', 'c:' + px + o.id)]);
    if (o.loc) rows.push([{ text: '📍 Яндекс.Карты', url: mapUrl('y', o.loc) }, { text: '📍 Google Maps', url: mapUrl('g', o.loc) }]);
    rows.push([{ text: 'Открыть панель продавца', web_app: { url: sellerUrl(origin, did) } }]);
  }
  return { text, reply_markup: { inline_keyboard: rows } };
}

/* Сообщение доставщику: заказ готов к доставке. state: null — свободен, 'mine' — взял этот доставщик, строка — имя того, кто уже взял. */
function courierCard(o, shop, origin, did, state) {
  setLang('ru');
  const px = cbPrefix(did);
  const when = fmtWhen(o.pickupAt);
  const head = state === 'mine' ? '🚚 Вы взяли заказ ' : state ? '✔ Заказ ' : '🚚 Готов к доставке: заказ ';
  let text = head + o.id + (state && state !== 'mine' ? ' уже взял ' + state : '')
    + '\n\n' + (o.org ? o.org + ' · ' : '') + o.name + '\nТелефон: ' + o.phone
    + '\nАдрес: ' + (o.address || '—') + '\nКогда: ' + when
    + '\nСумма: ' + money(o.total)
    + (o.comment ? '\nКомментарий: ' + o.comment : '');
  if (text.length > TEXT_MAX) text = text.slice(0, TEXT_MAX - 1) + '…';
  const rows = [];
  if (!state) rows.push([{ text: '🚚 Взял', callback_data: 'k:' + px + o.id }]);
  if (o.loc) rows.push([{ text: '📍 Яндекс.Карты', url: mapUrl('y', o.loc) }, { text: '📍 Google Maps', url: mapUrl('g', o.loc) }]);
  rows.push([{ text: 'Открыть доставку', web_app: { url: courierUrl(origin, did) } }]);
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
    case 'done': {
      const owe = o.pay && o.pay.m === 'credit' ? Math.max(0, (Number(o.total) || 0) - (Number(o.pay.paid) || 0)) : 0;
      const dueRu = owe ? '\nОплатить до ' + dmy(o.pay.due) + ': ' + money(owe) : '', dueUz = owe ? '\nToʻlov muddati ' + dmy(o.pay.due) + ': ' + money(owe) : '';
      return (del ? L(
        '🤝 Заказ ' + o.id + ' доставлен. Спасибо, что выбрали ' + name + '!' + dueRu,
        '🤝 Buyurtma ' + o.id + ' yetkazildi. ' + name + 'ni tanlaganingiz uchun rahmat!' + dueUz) : L(
        '🤝 Спасибо, что выбрали ' + name + '!' + dueRu,
        '🤝 ' + name + 'ni tanlaganingiz uchun rahmat!' + dueUz));
    }
    case 'taken': return L(
      '🚚 Заказ ' + o.id + ': доставщик ' + o.crn + ' везёт ваш заказ.' + (o.crp ? '\nТелефон: ' + o.crp : '') + '\nОплата при получении: ' + money(o.total),
      '🚚 Buyurtma ' + o.id + ': yetkazib beruvchi ' + o.crn + ' buyurtmangizni olib ketmoqda.' + (o.crp ? '\nTelefon: ' + o.crp : '') + '\nOlganda toʻlanadi: ' + money(o.total));
    case 'cancelled': return L(
      '❌ Заказ ' + o.id + ' отменён продавцом.' + (contact ? '\nВопросы: ' + contact : ''),
      '❌ Buyurtma ' + o.id + ' sotuvchi tomonidan bekor qilindi.' + (contact ? '\nSavollar: ' + contact : ''));
  }
  return '';
}

/* Приветствие на двух языках: сверху язык человека (по языку его Telegram), ниже второй.
   Многие в Узбекистане пользуются Telegram на русском или английском, но говорят по-узбекски. */
const bilingual = (lang, ru, uz) => lang === 'uz' ? uz + '\n\n' + ru : ru + '\n\n' + uz;
const SELLER_NOTE_RU = 'Вы продавец: новые заказы придут сюда.';
const SELLER_NOTE_UZ = 'Siz sotuvchisiz: yangi buyurtmalar shu yerga keladi.';
/* Приветствие (/start): сверху всегда узбекский, ниже русский, язык Telegram у человека не важен.
   Текст один и для одного дистрибьютора, и для нескольких: список дистрибьюторов клиент видит в приложении. */
function welcomeText(lang, isAdmin, shop) {
  setLang(lang);
  const name = (shop && shop.name) || DEFAULT.shop.name;
  let uz = 'Assalomu alaykum! Bu ' + name + ' 🛒\n«Katalog» tugmasini bosing, mahsulotlarni tanlang va buyurtma bering. Olib ketish yoki yetkazib berish. Toʻlovni buyurtmangizni olganda qilasiz.';
  let ru = 'Здравствуйте! Это ' + name + ' 🛒\nНажмите «Каталог», выберите товары и оформите заказ. Самовывоз или доставка. Оплата при получении заказа.';
  if (isAdmin) { uz += '\n\n' + SELLER_NOTE_UZ; ru += '\n\n' + SELLER_NOTE_RU; }
  return uz + '\n\n' + ru;
}
const openBtn = (origin, text, url) => ({ inline_keyboard: [[{ text, web_app: { url: url || origin + '/' } }]] });

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
  const rows = [['№ заказа', 'Создан', 'Статус', 'Получение', 'Когда', 'Клиент', 'Телефон', 'Организация', 'Telegram', 'Адрес доставки', 'Комментарий', 'Товары, сум', 'Скидка, сум', 'Доставка, сум', 'Итого, сум', 'Позиций', 'Оплата', 'Доставщик']];
  const items = [['№ заказа', 'Статус', 'Когда', 'Клиент', 'Товар', 'Вес / объём', 'Количество', 'В упаковках', 'Цена, сум', 'Сумма, сум']];
  list.forEach(o => {
    const fee = Number(o.fee) || 0, total = Number(o.total) || 0, disc = Number(o.disc) || 0, st = stOf(o.status, o.mode).name, when = String(o.pickupAt || '').replace('T', ' ');
    rows.push([o.id, shopTime(o.createdAt), st, o.mode === 'delivery' ? 'Доставка' : 'Самовывоз', when, o.name || '', o.phone || '', o.org || '',
      o.tg && o.tg.username ? '@' + o.tg.username : '', o.mode === 'delivery' ? (o.address || '') : '', o.comment || '', total - fee + disc, disc, fee, total, (o.items || []).length, payPlain(o.pay), o.crn || '']);
    (o.items || []).forEach(it => items.push([o.id, st, when, o.name || '', it.name || '', weightLabel(it), Number(it.qty) || 0, packText(it, it.qty), Number(it.price) || 0, (Number(it.price) || 0) * (Number(it.qty) || 0)]));
  });
  return [
    { name: 'Заказы', w: [11, 17, 16, 12, 17, 22, 17, 22, 16, 34, 30, 14, 12, 14, 14, 9, 30, 18], money: [11, 12, 13, 14], rows },
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

/* Долги в Excel. list — строки debtRow, logs — их журналы (в том же порядке). Лист «Долги» по магазинам, лист «История» по всем записям журнала. */
const CF_PLAIN = { ok: 'подтвердил', wait: 'ждём ответа', no: 'ответил «Не так»', na: 'не получил сообщение' };
function debtsSheets(list, logs) {
  setLang('ru');
  const head = [['Магазин', 'Организация', 'Телефон', 'Адрес', 'Долг, сум', 'Ближайший срок', 'Просрочено, сум', 'Дней просрочки', 'Спорных записей', 'Ждут ответа магазина', 'Последняя оплата', 'Статус']];
  const hist = [['Магазин', 'Телефон', 'Дата', 'Запись', '№ записи', '№ заказа', 'Сумма, сум', 'Способ', 'Срок оплаты', 'Ответ магазина', 'Записал', 'Комментарий', 'Отменена']];
  list.forEach((x, i) => {
    const lg = logs[i] || { rows: [] }, rows = Array.isArray(lg.rows) ? lg.rows : [];
    const voided = new Set(rows.filter(r => r.k === 'rv').map(r => r.of));
    const nm = x.name || ('ID ' + x.uid);
    const pays = rows.filter(r => r.k === 'pay' && !voided.has(r.n));
    const last = pays.length ? pays[pays.length - 1].t : '';
    const st = x.bal < 0 ? 'Аванс (магазин переплатил)' : x.days > 0 ? 'Просрочен' : x.bal > 0 ? 'Должен в срок' : 'Долга нет, есть записи без ответа';
    head.push([nm, x.org || '', x.phone || '', x.addr || '', x.bal, dmy(x.due), x.over || 0, x.days || 0, x.fl || 0, x.wt || 0, last ? shopTime(last).slice(0, 10) : '', st + (x.fl > 0 ? ' · спорные записи' : '')]);
    if (lg.base) hist.push([nm, x.phone || '', '', 'Ранние записи свёрнуты', '', '', lg.base.d, '', dmy(lg.base.due), '', '', 'Остаток по старым записям, подробностей нет', '']);
    rows.forEach(r => {
      const kind = r.k === 'ch' ? 'Выдача в долг' : r.k === 'pay' ? 'Оплата' : r.k === 'rv' ? 'Отмена записи №' + r.of : r.k === 'rs' ? 'Спор по записи №' + r.of + ' закрыт' : r.k === 'ac' ? 'Акт сверки ' + (r.f ? dmy(r.f) : 'с начала') + ' – ' + dmy(r.e) : '';
      if (!kind) return;
      hist.push([nm, x.phone || '', shopTime(r.t), kind, r.n, r.ref || '', r.k === 'rs' ? '' : r.k === 'ac' ? Number(r.cb) || 0 : Number(r.a) || 0, r.k === 'pay' ? (PAY_PLAIN[r.m] || '') : '', r.k === 'ch' ? dmy(r.due) : '',
        isCf(r) ? (CF_PLAIN[r.cf] || '') : '', r.bn || '', r.k === 'pay' ? (r.note || '') : (r.why || ''), voided.has(r.n) ? 'да' : '']);
    });
  });
  return [
    { name: 'Долги', w: [26, 22, 17, 34, 15, 15, 16, 13, 13, 16, 16, 34], money: [4, 6], rows: head },
    { name: 'История', w: [26, 17, 17, 28, 10, 12, 15, 15, 13, 22, 20, 36, 11], money: [6], rows: hist }
  ];
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
  id: ['Код', 'ID', 'Артикул', 'Kod'],
  cat: ['Категория', 'Kategoriya'],
  name: ['Название', 'Наименование', 'Товар', 'Название товара', 'Nomi (rus.)', 'Ruscha nomi', 'Mahsulot', 'Mahsulot nomi'],
  uz: ['Название (узб.)', 'Название по-узбекски', 'Nomi', 'Nomi (uzb.)', 'Nomi (uz)', 'Oʻzbekcha nomi'],
  desc: ['Описание', 'Tavsif (rus.)', 'Ruscha tavsif'],
  descUz: ['Описание (узб.)', 'Описание по-узбекски', 'Tavsif', 'Tavsif (uzb.)', 'Tavsif (uz)', 'Oʻzbekcha tavsif'],
  amount: ['Вес / объём', 'Вес', 'Объём', 'Фасовка', 'Ogʻirlik / hajm', 'Ogʻirlik', 'Hajm'],
  unit: ['Единица', 'Ед.', 'Ед. изм.', 'Единица измерения', 'Birlik', 'Oʻlchov birligi'],
  price: ['Цена', 'Цена, сум', 'Цена за единицу', 'Цена за единицу, сум', 'Narx', 'Narx, soʻm', 'Birlik narxi', 'Birlik narxi, soʻm'],
  on: ['В наличии', 'Наличие', 'Mavjud', 'Mavjudligi'],
  tag: ['Метка', 'Belgi'],
  old: ['Старая цена', 'Старая цена, сум', 'Eski narx', 'Eski narx, soʻm']
};
const XL_KEY = (() => { const m = new Map(); Object.keys(XL_COLS).forEach(k => XL_COLS[k].forEach(a => m.set(nk(a), k))); return m; })();
const XL_UNITS = { 'г': 'g', 'гр': 'g', 'g': 'g', 'кг': 'kg', 'kg': 'kg', 'шт': 'pc', 'dona': 'pc', 'pc': 'pc', 'мл': 'ml', 'ml': 'ml', 'л': 'l', 'l': 'l', 'gr': 'g', 'litr': 'l', 'ta': 'pc' };
const XL_YES = ['да', 'yes', '1', 'true', '+', 'есть', 'ha', 'в наличии', 'mavjud', 'bor'], XL_NO = ['нет', 'no', '0', 'false', '-', 'yoq', 'yoʻq', "yo'q", 'yo‘q', 'yo’q', 'yoʼq', 'нет в наличии', 'mavjud emas', 'yoq emas'];
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
    if ((m.name !== undefined || m.uz !== undefined) && m.price !== undefined) { hi = i; map = m; break; }   // «Nomi» + «Narx» достаточно: узбекское название заменяет русское
  }
  if (!map) throw new XlErr('no_header');
  const out = [], errors = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const cell = k => { const v = map[k] === undefined ? '' : r[map[k]]; return v === undefined || v === null ? '' : v; };
    const txt = k => { const v = cell(k); return typeof v === 'number' ? String(v) : cleanStr(v === '' ? '' : String(v), 400, true); };
    if (!r.some(c => String(c).trim() !== '')) continue;
    if (out.length + errors.length >= XL_MAX_ROWS) { errors.push({ row: i + 1, msg: 'слишком много строк, остальные пропущены', uz: 'qatorlar juda koʻp, qolganlari oʻtkazib yuborildi' }); break; }
    const row = i + 1, x = { row };
    const bad = (msg, uz) => { errors.push({ row, msg, uz }); return null; };
    const nameOnly = map.name === undefined;   // русской колонки нет: единственное название идёт и в русское, и в узбекское поле
    const name = nameOnly ? txt('uz') : txt('name');
    if (!name) { bad('нет названия', 'nomi yoʻq'); continue; }
    if (name.length > 60) { bad('название длиннее 60 знаков', 'nomi 60 belgidan uzun'); continue; }
    x.name = name;
    if (nameOnly) { x.uz = name; x.nameOnly = true; }
    const pv = cell('price');
    const price = String(pv).trim() === '' ? null : xlNum(pv);
    if (price === null || price < 0 || price > 1e8) { bad('цена должна быть числом от 0 до 100 000 000', 'narx 0 dan 100 000 000 gacha son boʻlishi kerak'); continue; }
    x.price = Math.round(price);
    x.id = cleanStr(txt('id'), 24);
    x.cat = cleanStr(txt('cat'), 40);
    if (x.cat.length > 40) { bad('категория длиннее 40 знаков', 'kategoriya 40 belgidan uzun'); continue; }
    if (map.uz !== undefined && !nameOnly) { const v = txt('uz'); if (v) { if (v.length > 60) { bad('узбекское название длиннее 60 знаков', 'oʻzbekcha nomi 60 belgidan uzun'); continue; } x.uz = v; } }
    if (map.desc !== undefined) { const v = txt('desc'); if (v) x.desc = v.slice(0, 300); }
    if (map.descUz !== undefined) { const v = txt('descUz'); if (v) x.descUz = v.slice(0, 300); }
    if (map.amount !== undefined && String(cell('amount')).trim() !== '') {
      const a = xlNum(cell('amount'));
      if (a === null || a < 0 || a > 100000) { bad('вес или объём должен быть числом', 'ogʻirlik yoki hajm son boʻlishi kerak'); continue; }
      x.amount = Math.round(a * 1000) / 1000;
    }
    if (map.unit !== undefined && String(cell('unit')).trim() !== '') {
      const un = XL_UNITS[String(cell('unit')).trim().toLowerCase().replace(/\.$/, '')];
      if (!un) { bad('неизвестная единица (нужны г, кг, шт, мл или л)', 'nomaʼlum birlik (g, kg, dona, ml yoki l kerak)'); continue; }
      x.unit = un;
    }
    if (map.on !== undefined && String(cell('on')).trim() !== '') {
      const v = String(cell('on')).trim().toLowerCase();
      if (XL_YES.includes(v)) x.on = true; else if (XL_NO.includes(v)) x.on = false;
      else { bad('«В наличии»: нужно «да» или «нет»', '«Mavjud»: «ha» yoki «yoʻq» yozing'); continue; }
    }
    if (map.tag !== undefined) {
      const v = String(cell('tag')).trim().toLowerCase();
      if (!v) x.tag = ''; else if (XL_TAGS[v]) x.tag = XL_TAGS[v]; else { bad('метка: нужно «Акция» или «Новинка»', 'belgi: «Aksiya» yoki «Yangilik» yozing'); continue; }
    }
    if (map.old !== undefined) {
      const ov = cell('old');
      if (String(ov).trim() === '') x.old = 0;
      else { const o = xlNum(ov); if (o === null || o < 0 || o > 1e8) { bad('старая цена должна быть числом', 'eski narx son boʻlishi kerak'); continue; } x.old = Math.round(o); }
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
    let c = cats.find(x => key(x.name) === key(nmx) || (x.uz && key(x.uz) === key(nmx)));
    if (!c) {
      if (cats.length >= MAX_CATS) return null;
      c = { id: 'c' + randId(5), name: nmx, uz: /[а-яё]/i.test(nmx) ? '' : nmx };   // название латиницей — это узбекское
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
      if (!cand.length) cand = items.filter(x => x.uz && key(x.uz) === key(r.name));   // файл по-узбекски: ищем и по узбекскому названию
      if (cand.length > 1) {
        cand = cand.filter(x => (r.amount === undefined || Number(x.amount) === r.amount) && (r.unit === undefined || x.unit === r.unit));
        if (cand.length !== 1) { errors.push({ row: r.row, msg: 'несколько товаров с названием «' + r.name + '»: укажите код или вес', uz: 'bir nechta mahsulot «' + r.name + '» nomli: kodni yoki ogʻirlikni koʻrsating' }); continue; }
      }
      it = cand[0] || null;
    }
    if (it) {
      if (used.has(it.id)) { errors.push({ row: r.row, msg: 'товар «' + it.name + '» уже был выше в файле', uz: 'mahsulot «' + it.name + '» faylda yuqorida allaqachon bor' }); continue; }
      used.add(it.id);
      const f = [];
      const set = (k, to, show) => { if (it[k] !== to) { f.push({ k, from: show ? show(it[k]) : it[k], to: show ? show(to) : to }); it[k] = to; } };
      if (r.nameOnly) { if (key(r.name) !== key(it.name)) set('uz', r.uz); }   // в файле одно название: русское в карточке не трогаем, узбекское обновляем
      else if (byCode && r.name !== it.name) set('name', r.name);
      set('price', r.price);
      if (r.uz !== undefined && !r.nameOnly) set('uz', r.uz);
      if (r.desc !== undefined) set('desc', r.desc);
      if (r.descUz !== undefined) set('descUz', r.descUz);
      if (r.amount !== undefined) set('amount', r.amount);
      if (r.unit !== undefined) set('unit', r.unit);
      if (r.on !== undefined) set('on', r.on);
      if (r.cat) {
        const cid = catFor(r.cat);
        if (cid === null) { errors.push({ row: r.row, msg: 'в каталоге уже ' + MAX_CATS + ' категорий', uz: 'katalogda allaqachon ' + MAX_CATS + ' ta kategoriya bor' }); continue; }
        if (it.cat !== cid) { f.push({ k: 'cat', from: catName(it.cat), to: catName(cid) }); it.cat = cid; }
      }
      if (r.tag !== undefined) {
        set('tag', r.tag);
        const o = r.tag === 'sale' ? (r.old || 0) : 0;
        if ((Number(it.old) || 0) !== o) { f.push({ k: 'old', from: Number(it.old) || 0, to: o }); it.old = o; }
      }
      if (f.length) changes.push({ kind: 'upd', id: it.id, name: it.name, fields: f }); else same++;
    } else {
      if (items.length >= MAX_ITEMS) { errors.push({ row: r.row, msg: 'в каталоге уже ' + MAX_ITEMS + ' товаров', uz: 'katalogda allaqachon ' + MAX_ITEMS + ' ta mahsulot bor' }); continue; }
      const cid = catFor(r.cat);
      if (cid === null) { errors.push({ row: r.row, msg: 'в каталоге уже ' + MAX_CATS + ' категорий', uz: 'katalogda allaqachon ' + MAX_CATS + ' ta kategoriya bor' }); continue; }
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

/* Каталог для выгрузки в Excel (он же образец прайса). Заголовки, «да/нет», метки и подсказки идут на языке интерфейса (lang), загрузка понимает оба языка. */
function catalogSheets(prod, lang) {
  const uz = lang === 'uz';
  setLang(uz ? 'uz' : 'ru');
  const catName = new Map(prod.cats.map(c => [c.id, uz && c.uz ? c.uz : c.name]));
  const rows = [uz
    ? ['Kod', 'Kategoriya', 'Nomi (rus.)', 'Nomi (uzb.)', 'Tavsif (rus.)', 'Tavsif (uzb.)', 'Ogʻirlik / hajm', 'Birlik', 'Narx, soʻm', 'Mavjud', 'Belgi', 'Eski narx, soʻm']
    : ['Код', 'Категория', 'Название', 'Название (узб.)', 'Описание', 'Описание (узб.)', 'Вес / объём', 'Единица', 'Цена, сум', 'В наличии', 'Метка', 'Старая цена, сум']];
  prod.items.forEach(p => rows.push([p.id, catName.get(p.cat) || '', p.name, p.uz || '', p.desc || '', p.descUz || '', Number(p.amount) || 0, unitName(p.unit), Number(p.price) || 0, p.on === false ? (uz ? 'yoʻq' : 'нет') : (uz ? 'ha' : 'да'), tagName(p.tag), p.tag === 'sale' && Number(p.old) > 0 ? Number(p.old) : '']));
  const help = uz ? ['Prays-listni qanday toʻldirish',
    'Faylni ilovada yuklang: «Katalog» boʻlimi → «Prays yuklash». Qoʻllashdan oldin bot nima oʻzgarishini koʻrsatadi, siz tasdiqlaysiz.',
    'Mahsulot kod boʻyicha topiladi. Kod boʻsh yoki topilmasa, nomi boʻyicha (bir xil nomlar bir nechta boʻlsa, ogʻirligi boʻyicha). Katalogda yoʻq mahsulot qoʻshiladi.',
    'Hech narsa oʻchirilmaydi. Fayldagi yoʻq mahsulot katalogda avvalgidek qoladi. Rasmlar va ombor qoldiqlari oʻzgarmaydi.',
    'Boʻsh katak «oʻzgartirma» degani. Istisno: boʻsh «Belgi» belgini olib tashlaydi, boʻsh «Eski narx» eski narxni olib tashlaydi.',
    'Faqat «Nomi» va «Narx» ustunlari majburiy. Qolganlarini fayldan butunlay olib tashlash mumkin, shunda ular oʻzgarmaydi. Ustun sarlavhalari ruscha ham, oʻzbekcha ham boʻlishi mumkin.',
    'Birlik: g, kg, dona, ml yoki l. Mavjud: ha yoki yoʻq. Belgi: Aksiya yoki Yangilik. Eski narx faqat aksiyada va narxdan baland boʻlsa koʻrinadi.',
    'Yangi mahsulotlarning kategoriyasi «Kategoriya» ustunidan olinadi; shunday kategoriya yoʻq boʻlsa, yaratiladi.']
    : ['Как заполнять прайс',
    'Загрузите файл в приложении: вкладка «Каталог» → «Загрузить прайс». Перед применением бот покажет, что изменится, и вы подтвердите.',
    'Товар находится по коду. Если код пустой или не найден, по названию (и по весу, если одинаковых названий несколько). Нового товара нет в каталоге: он будет добавлен.',
    'Ничего не удаляется. Товар, которого нет в файле, остаётся в каталоге как был. Фото и остатки на складе не меняются.',
    'Пустая ячейка означает «не менять». Исключения: пустая «Метка» убирает метку, пустая «Старая цена» убирает старую цену.',
    'Обязательны только колонки «Название» и «Цена». Остальные можно удалить из файла целиком, тогда они не затрагиваются. Заголовки колонок могут быть и по-русски, и по-узбекски.',
    'Единица: г, кг, шт, мл или л. В наличии: да или нет. Метка: Акция или Новинка. Старая цена показывается только у акции и только если она выше цены.',
    'У новых товаров категория берётся из колонки «Категория»; если такой категории нет, она создаётся.'];
  return [{ name: uz ? 'Katalog' : 'Каталог', w: [12, 18, 34, 28, 30, 30, 12, 9, 14, 11, 11, 16], money: [8, 11], rows },
    { name: uz ? 'Qanday toʻldirish' : 'Как заполнять', w: [150], plain: true, rows: help.map(x => [x]) }];
}

/* ---------- расчёты с магазинами: способы оплаты и долги ---------- */
/* При выдаче продавец отмечает, как заплатил магазин: наличные, карта, перечисление или в долг (можно часть сразу, остаток в долг).
   По каждому магазину ведётся журнал расчётов lg:<uid>. Он только дополняется: выдача в долг (ch), оплата (pay), отмена оплаты (rv).
   d — как запись меняет долг: выдано в долг +сумма, получена оплата −сумма. Долг — сумма всех d.
   Оплаты гасят самые старые выдачи первыми, просрочка считается по непогашенной части. Заголовок lh:<uid> хранит долг и непогашенные выдачи,
   список магазинов с долгом — dbi. Записей хранится не больше LG_MAX: самые старые сворачиваются в base, журнал не растёт бесконечно. */
const PAY_M = ['cash', 'card', 'bank'];
const DEBT_ORD_MAX = 100, LG_MAX = 500, LG_FOLD = 100, LG_NOTE = 80, LG_SHOW = 100, MAX_PAY = 1e11, CREDIT_MAX_DAYS = 90, REMIND_GAP = 3600000;
const PAY_RU = { cash: '💵 Наличные', card: '💳 Карта', bank: '🏦 Перечисление', credit: '📒 В долг' };
/* Контроль денег: сколько ждём ответа магазина, сколько безналичных оплат доставщика ждут сверки, длина причины и комментария. */
const CF_LATE = 24 * 3600000, NV_MAX = 100, WHY_MIN = 3, WHY_MAX = 80, RES_MAX = 120;
/* Как назвать человека в сообщении владельцу: имя, логин и номер, чтобы не перепутать тёзок. */
const whoFull = u => (whoName(u) || 'Без имени') + (u && u.username ? ' (@' + u.username + ')' : '') + ', ID ' + (u && u.id);
const whoName = u => cleanStr([u && u.first_name, u && u.last_name].filter(Boolean).join(' ') || (u && u.username) || '', 40);

/* ---------- доставка: доставщики и касса наличных ---------- */
const MAX_COURIERS = 30, CC_KEEP = 200, CC_SHOW = 60, CINV_MS = 7 * 86400000;
const validCid = c => typeof c === 'string' && /^k[a-z0-9]{3,9}$/.test(c);
const validTok = t => typeof t === 'string' && /^[a-z0-9]{6,12}$/.test(t);
/* Доставщик с телефоном и без секретов: ссылку-приглашение продавец получает отдельно. */
/* Срок сдачи наличных, дней: 0 — до конца дня приёма, −1 — без срока. Не задан — по умолчанию в тот же день. */
const DL_DEF = 0, DL_MAX = 30;
const crDl = c => { const v = c && c.dl; return Number.isInteger(v) && v >= -1 && v <= DL_MAX ? v : DL_DEF; };
/* На сколько дней просрочена сдача наличных (0 — вовремя или срока нет). cs — когда принят самый старый несданный рубль. */
function crLate(c, now) {
  const dl = crDl(c);
  if (dl < 0 || !((Number(c && c.cash) || 0) > 0) || !c.cs) return 0;
  const a = Date.parse(dayOf(c.cs) + 'T00:00:00Z'), b = Date.parse(dayOf(new Date(now).toISOString()) + 'T00:00:00Z');
  return Math.max(0, Math.round((b - a) / 86400000) - dl);
}
/* Открытый вопрос по сдаче: продавец записал сдачу (или её отмену), доставщик ещё не сказал «Верно» и вопрос не закрыт. */
const hOpen = r => (r.k === 'out' || r.k === 'ox') && (r.cf === 'wait' || r.cf === 'no' || r.cf === 'na') && !r.hr && !r.ox;
/* Сколько записей о сдаче ждут ответа самого доставщика: ещё не ответил или сообщение не дошло. */
const crAsk = c => ((c && c.hwt) || []).length + (Number(c && c.hna) || 0);
/* Сколько записей о сдаче требуют внимания: «Не так», не дошло, или нет ответа больше суток. */
const crHf = (c, now) => (Number(c && c.hfl) || 0) + ((c && c.hwt) || []).filter(t => now - Date.parse(t) > CF_LATE).length;
/* С какого времени деньги на руках: сданные деньги закрывают самые старые поступления, поэтому остаток набирается из самых новых.
   Отменённая оплата долга убирает своё поступление. Строки кассы обрезаются: если остаток не набрался, берём самое старое известное поступление. */
function cashSince(rows, cash) {
  if (!(cash > 0)) return '';
  const vs = [];
  let need = cash, last = '';
  for (let i = rows.length - 1; i >= 0 && need > 0; i--) {
    const r = rows[i];
    if (r.k === 'rv' && r.du) { vs.push(r); continue; }
    if (r.k !== 'in') continue;
    const vi = r.du ? vs.findIndex(v => v.du === r.du && v.a === r.a) : -1;
    if (vi >= 0) { vs.splice(vi, 1); continue; }
    need -= Number(r.a) || 0; last = r.t;
  }
  if (need > 0) { const f = rows.find(r => r.k === 'in'); return f ? f.t : ''; }
  return last;
}
/* Сохраняет кассу доставщика: старые строки обрезаются (открытые вопросы по сдаче остаются), пересчитывается «с какого времени деньги на руках» и счётчики вопросов по сдаче. */
function crSave(c, lg) {
  if (lg.rows.length > CC_KEEP) { const cut = lg.rows.length - CC_KEEP; lg.rows = lg.rows.slice(0, cut).filter(hOpen).slice(-100).concat(lg.rows.slice(cut)); }
  c.cs = cashSince(lg.rows, Number(c.cash) || 0);
  c.hfl = lg.rows.filter(r => hOpen(r) && r.cf !== 'wait').length;
  c.hwt = lg.rows.filter(r => hOpen(r) && r.cf === 'wait').map(r => r.t);
  c.hna = lg.rows.filter(r => hOpen(r) && r.cf === 'na').length;
  return { ['cc:' + c.id]: lg, ['cr:' + c.id]: c };
}
const crPub = c => ({ id: c.id, name: c.name, phone: c.phone || '', joined: !!c.uid, on: c.on !== false, credit: c.credit !== false, cash: Number(c.cash) || 0, lim: Number(c.lim) || 0, nvn: (c.nv || []).length, nva: (c.nv || []).reduce((t, x) => t + (Number(x.a) || 0), 0), dl: crDl(c), cs: c.cs || '', late: crLate(c, Date.now()), hf: crHf(c, Date.now()), hw: (c.hwt || []).length, since: c.since });
/* Текст сообщения доставщику: продавец записал сдачу денег или отменил её. */
function handText(r) {
  const by = r.bn ? ' Записал: ' + r.bn + '.' : '';
  return r.k === 'ox'
    ? '↩️ Продавец отменил вашу сдачу ' + money(r.a) + '. Причина: ' + (r.why || '') + '.' + by + '\nНа руках теперь ' + money(r.left) + '.\n\nВсё верно?'
    : '📥 Продавец записал: вы сдали ' + money(r.a) + '.' + by + '\nОстаток на руках: ' + money(r.left) + '.\n\nВсё верно?';
}
const handDesc = r => (r.k === 'ox' ? 'отмена сдачи ' : 'сдача ') + money(r.a);
const PAY_PLAIN = { cash: 'Наличные', card: 'Карта', bank: 'Перечисление', credit: 'В долг' };
const dmy = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d.slice(8, 10) + '.' + d.slice(5, 7) + '.' + d.slice(0, 4) : '';
/* Как заплатил магазин при выдаче заказа. Не указано — наличные: так было, пока оплата при получении была единственной. null — данные неверны. */
function cleanPay(p, total, today) {
  if (p === undefined || p === null) return { m: 'cash' };
  if (typeof p !== 'object') return null;
  const m = p.m === undefined ? 'cash' : p.m;
  if (PAY_M.includes(m)) return { m };
  if (m !== 'credit') return null;
  const days = Number(p.days);
  if (!Number.isInteger(days) || days < 1 || days > CREDIT_MAX_DAYS) return null;
  const r = { m: 'credit', days, due: addDays(today, days) };
  if (p.paid !== undefined && p.paid !== null && p.paid !== '' && Number(p.paid) !== 0) {
    const paid = Number(p.paid);
    // если оплачена вся сумма, это обычная оплата, а не долг
    if (!Number.isInteger(paid) || paid < 0 || paid >= total || !PAY_M.includes(p.pm)) return null;
    r.paid = paid; r.pm = p.pm;
  }
  return r;
}
/* Долг и непогашенные выдачи по журналу. all — все записи журнала (нужны, чтобы увидеть отмены, которые лежат в хвосте). */
function lgState(rows, base, all) {
  const voided = new Set((all || rows).filter(r => r.k === 'rv').map(r => r.of));
  const net = rows.filter(r => r.k !== 'rv' && r.k !== 'rs' && r.k !== 'ac' && !voided.has(r.n));
  let bal = base ? base.d : 0, paid = base && base.d < 0 ? -base.d : 0;
  const queue = [];
  if (base && base.d > 0) queue.push({ ref: '', due: base.due || '', r: base.d });
  for (const r of net) {
    bal += r.d;
    if (r.k === 'ch') queue.push({ ref: r.ref || '', due: r.due || '', r: r.d });
    else paid -= r.d;
  }
  for (const q of queue) { const t = Math.min(q.r, paid); q.r -= t; paid -= t; }
  return { bal, open: queue.filter(q => q.r > 0) };
}
/* Когда срок и сколько просрочено на день today. */
function lgDue(open, today) {
  let over = 0, days = 0;
  const day = d => Date.parse(d + 'T00:00:00Z');
  for (const q of open || []) if (q.due && q.due < today) { over += q.r; days = Math.max(days, Math.round((day(today) - day(q.due)) / 86400000)); }
  const dues = (open || []).map(q => q.due).filter(Boolean).sort();
  return { due: dues[0] || '', over, days };
}
/* Когда записей больше LG_MAX, старые уходят в base: остаток долга по ним и самый ранний срок. */
/* Записи, которым магазин ещё не ответил (cf «wait»), отметил «не так» («no») или которые до него не дошли («na»), и которые продавец не закрыл
   и не отменил. Записи одного заказа (общий g) считаются за одну. fl — спорные, cwt — время каждой записи, ждущей ответа, first — позиция первой из них. */
function lgPend(rows) {
  const gone = new Set(), fl = new Set(), na = new Set(), cw = new Map();
  rows.forEach(r => { if (r.k === 'rv' || r.k === 'rs') gone.add(r.of); });
  let first = -1;
  rows.forEach((r, i) => {
    if (!isCf(r) || !r.cf || r.cf === 'ok' || gone.has(r.n)) return;
    if (first < 0) first = i;
    const g = r.g || r.n;
    if (r.cf === 'wait') { if (!cw.has(g) || r.t < cw.get(g)) cw.set(g, r.t); } else { fl.add(g); if (r.cf === 'na') na.add(g); }
  });
  return { fl: fl.size, na: na.size, cwt: [...cw.values()].sort().slice(0, 50), first };
}
/* Сколько записей магазина требуют внимания продавца сейчас: спорные и те, на которые магазин молчит дольше суток. */
const lgFlags = (h, now) => (h.fl || 0) + (h.cwt || []).filter(t => now - Date.parse(t) > CF_LATE).length;
function lgFold(rows, base) {
  if (rows.length <= LG_MAX) return { rows, base };
  let cut = rows.length - LG_MAX + LG_FOLD;
  // спорные записи остаются в журнале, пока он не вырос в полтора раза
  const pd = lgPend(rows);
  if (pd.first >= 0 && pd.first < cut && rows.length <= LG_MAX * 1.6) cut = pd.first;
  if (cut <= 0) return { rows, base };
  const s = lgState(rows.slice(0, cut), base, rows);
  return { rows: rows.slice(cut), base: { d: s.bal, due: s.open.map(q => q.due).filter(Boolean).sort()[0] || '' } };
}
const debtRow = (h, today) => Object.assign({ uid: h.uid, name: h.name || '', org: h.org || '', phone: h.phone || '', addr: h.addr || '', bal: h.bal, fl: lgFlags(h, Date.now()), wt: (h.cwt || []).length }, lgDue(h.open, today));
/* Оплата заказа простым текстом для Excel. */
function payPlain(pay) {
  if (!pay) return '';
  if (pay.m !== 'credit') return PAY_PLAIN[pay.m] || '';
  return (pay.paid ? PAY_PLAIN[pay.pm] + ' ' + pay.paid + ' + ' : '') + 'В долг до ' + dmy(pay.due);
}
function payLine(pay) {
  if (!pay) return '';
  if (pay.m !== 'credit') return 'Оплата: ' + PAY_RU[pay.m];
  return 'Оплата: ' + (pay.paid ? PAY_RU[pay.pm] + ' ' + money(pay.paid) + ' + ' : '') + PAY_RU.credit + ' до ' + dmy(pay.due);
}
/* Утреннее сообщение продавцу: у кого просрочен долг. late — строки debtRow только с просрочкой, самые давние первыми. */
const MORNING_ROWS = 10;
function morningText(shopName, late) {
  setLang('ru');
  const over = late.reduce((t, x) => t + (Number(x.over) || 0), 0);
  const lines = late.slice(0, MORNING_ROWS).map((x, i) => (i + 1) + '. ' + cleanStr(x.name || x.org || ('ID ' + x.uid), 40) + ': ' + money(x.over) + ', ' + x.days + ' дн.');
  return '⏰ ' + cleanStr(shopName || '', 60) + ': просрочка на сегодня\nМагазинов: ' + late.length + ', просрочено ' + money(over) + '\n\n' + lines.join('\n')
    + (late.length > MORNING_ROWS ? '\nи ещё ' + (late.length - MORNING_ROWS) : '');
}
function debtLine(h, today) {
  if (!h || !(h.bal > 0)) return '';
  const d = lgDue(h.open, today);
  return '⚠️ Долг магазина: ' + money(h.bal) + (d.days ? ', просрочка ' + d.days + ' дн.' : d.due ? ', срок ' + dmy(d.due) : '');
}
/* Напоминание магазину. ords — состав заказов {номер: заказ}; по каждому неоплаченному заказу пишем дату, товары, сумму и остаток.
   Если текст не влезает в одно сообщение Telegram, заказов и позиций показываем меньше. */
const REMIND_STEPS = [[5, 8], [3, 3], [3, 0], [1, 0]];
const PAY_NAME2 = { cash: ['наличные', 'naqd'], card: ['карта', 'karta'], bank: ['перечисление', 'oʻtkazma'] };
/* Сообщение магазину, когда продавец или доставщик записал оплату долга. h — заголовок долга после записи, a — сумма, m — способ. */
function debtPayText(h, a, m, shop) {
  setLang(h.lang === 'uz' ? 'uz' : 'ru');
  const name = shop.name || DEFAULT.shop.name, pn = PAY_NAME2[m] ? ' (' + L(PAY_NAME2[m][0], PAY_NAME2[m][1]) + ')' : '';
  const head = L('✅ ' + name + ': принята оплата ' + money(a) + pn + '.', '✅ ' + name + ': toʻlov qabul qilindi: ' + money(a) + pn + '.');
  const bal = Number(h.bal) || 0;
  const tail = bal > 0 ? L('\nОстаток долга: ', '\nQarz qoldigʻi: ') + money(bal)
    : L('\nДолг погашен, спасибо!', '\nQarz toʻlandi, rahmat!') + (bal < 0 ? L(' Переплата (аванс): ', ' Ortiqcha toʻlov (avans): ') + money(-bal) : '');
  return head + tail;
}
/* Что записано, одной строкой для продавца и доставщика. */
function rowDesc(rows) {
  const ac = rows.find(r => r.k === 'ac');
  if (ac) return 'акт сверки ' + (ac.f ? 'с ' + dmy(ac.f) + ' ' : '') + 'по ' + dmy(ac.e) + ', ' + ((Number(ac.cb) || 0) > 0 ? 'долг ' + money(ac.cb) : (Number(ac.cb) || 0) < 0 ? 'переплата ' + money(-ac.cb) : 'долга нет');
  const ch = rows.find(r => r.k === 'ch'), p = rows.find(r => r.k === 'pay');
  if (ch) return 'заказ ' + ch.ref + ' в долг на ' + money(ch.a) + (ch.due ? ' до ' + dmy(ch.due) : '') + (p ? ', сразу оплачено ' + money(p.a) : '');
  return p ? 'оплата долга ' + money(p.a) + (PAY_NAME2[p.m] ? ' (' + PAY_NAME2[p.m][0] + ')' : '') : '';
}
/* Сообщение магазину с просьбой подтвердить запись: выдачу в долг или принятую оплату. h — заголовок долга, rows — записи одного заказа или одна оплата. */
function confirmText(h, rows, shop) {
  const ch = rows.find(r => r.k === 'ch'), p = rows.find(r => r.k === 'pay'), who = (rows.find(r => r.bn) || {}).bn || '';
  let text;
  if (ch) {
    setLang(h.lang === 'uz' ? 'uz' : 'ru');
    const name = shop.name || DEFAULT.shop.name;
    text = L('📒 ' + name + ': заказ ' + ch.ref + ' выдан вам в долг на ' + money(ch.a) + (ch.due ? ' до ' + dmy(ch.due) : '') + '.',
      '📒 ' + name + ': ' + ch.ref + ' buyurtma sizga qarzga berildi: ' + money(ch.a) + (ch.due ? ', muddat ' + dmy(ch.due) : '') + '.');
    if (p) text += '\n' + L('Сразу оплачено: ', 'Darhol toʻlandi: ') + money(p.a) + (PAY_NAME2[p.m] ? ' (' + L(PAY_NAME2[p.m][0], PAY_NAME2[p.m][1]) + ')' : '') + '.';
  } else text = debtPayText(h, p.a, p.m, shop);
  setLang(h.lang === 'uz' ? 'uz' : 'ru');
  return text + (who ? '\n' + L('Принял: ', 'Qabul qildi: ') + who : '') + '\n\n' + L('Всё верно?', 'Hammasi toʻgʻrimi?');
}
/* Акт сверки: выписка по расчётам магазина за период. Магазин получает её в Telegram и отвечает «Верно» или «Не так».
   Запись об акте лежит в журнале долга (k «ac», сумма 0, долг не меняет), чтобы «Не так» попадало в спорные так же, как по обычным записям. */
const ACT_PER = ['this', 'prev', 'all'], ACT_PART = 3800, ACT_MAX_MSG = 6, ACT_ITEMS = 25;
/* Записи, на которые магазин отвечает «Верно» или «Не так»: выдача в долг, оплата и акт сверки. */
const isCf = r => r.k === 'ch' || r.k === 'pay' || r.k === 'ac';
/* Границы периода по дню today (YYYY-MM-DD): f — первый день (пусто — с начала записей), e — последний. */
function actPeriod(per, today) {
  if (per === 'all') return { f: '', e: today };
  const y = Number(today.slice(0, 4)), m = Number(today.slice(5, 7));
  if (per === 'this') return { f: today.slice(0, 7) + '-01', e: today };
  const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1, p2 = n => (n < 10 ? '0' : '') + n;
  return { f: py + '-' + p2(pm) + '-01', e: py + '-' + p2(pm) + '-' + p2(new Date(Date.UTC(py, pm, 0)).getUTCDate()) };
}
/* Текст акта сверки по журналу lg. Возвращает { parts, f, e, ob, cb, n } или { empty }, или { long }.
   ords — состав заказов {номер: заказ}. Если текст не влезает в ACT_MAX_MSG сообщений, состав заказов убирается; если и так много — long. */
function actBuild(h, lg, per, today, ords, shop) {
  const { f, e } = actPeriod(per, today);
  const voided = new Set(lg.rows.filter(r => r.k === 'rv').map(r => r.of));
  const net = lg.rows.filter(r => (r.k === 'ch' || r.k === 'pay') && !voided.has(r.n));
  const day = r => dayOf(r.t);
  const before = f ? net.filter(r => day(r) < f) : [];
  const inside = net.filter(r => (!f || day(r) >= f) && day(r) <= e);
  const ob = (lg.base ? lg.base.d : 0) + before.reduce((t, r) => t + (Number(r.d) || 0), 0);
  const cb = ob + inside.reduce((t, r) => t + (Number(r.d) || 0), 0);
  if (!inside.length && ob === 0) return { empty: true };
  // период начинается раньше, чем помнит журнал: прежние записи свёрнуты в один остаток
  const early = !!lg.base && (!f || !lg.rows.length || f <= day(lg.rows[0]));
  const uz = h.lang === 'uz';
  setLang(uz ? 'uz' : 'ru');
  const bal = v => v < 0 ? '−' + money(-v) + L(' (переплата)', ' (ortiqcha toʻlov)') : money(v);
  const who = [h.org, h.name].filter(Boolean).map(s => cleanStr(s, 60)).join(' · ');
  const build = compact => {
    const blocks = [];
    blocks.push(L('📄 Акт сверки', '📄 Hisob-kitoblarni solishtirish dalolatnomasi') + ' — ' + cleanStr(shop.name || DEFAULT.shop.name, 60)
      + (who ? '\n' + L('Магазин: ', 'Doʻkon: ') + who : '')
      + '\n' + L('Период: ', 'Davr: ') + (f ? dmy(f) : L('с начала записей', 'yozuvlar boshidan')) + ' – ' + dmy(e));
    blocks.push((early ? L('Остаток на начало записей: ', 'Yozuvlar boshidagi qoldiq: ') : L('Остаток на ', 'Qoldiq ') + (f ? dmy(f) : L('начало', 'boshida')) + ': ') + bal(ob)
      + (early ? '\n' + L('Более ранние записи объединены в этот остаток.', 'Oldingi yozuvlar shu qoldiqqa birlashtirilgan.') : ''));
    let add = 0, paid = 0;
    for (const r of inside) {
      const a = Math.abs(Number(r.d) || 0);
      if (r.k === 'ch') {
        add += a;
        const o = r.ref ? (ords || {})[r.ref] : null;
        const items = !compact && o && Array.isArray(o.items) ? o.items : [];
        const lines = items.slice(0, ACT_ITEMS).map(it => '• ' + cleanStr(uz ? (it.uz || it.name) : it.name, 60) + (weightLabel(it) ? ' (' + weightLabel(it) + ')' : '') + ' × ' + (Number(it.qty) || 0));
        if (items.length > ACT_ITEMS) lines.push(L('…и ещё ' + (items.length - ACT_ITEMS) + ' поз.', '…yana ' + (items.length - ACT_ITEMS) + ' ta'));
        blocks.push(dmy(day(r)) + ' · ' + L('Заказ ', 'Buyurtma ') + (r.ref || '—') + (lines.length ? '\n' + lines.join('\n') : '')
          + '\n' + L('В долг: +', 'Qarzga: +') + money(a) + (r.due ? ' (' + L('срок ', 'muddat ') + dmy(r.due) + ')' : ''));
      } else {
        paid += a;
        const pn = PAY_NAME2[r.m] ? ' (' + L(PAY_NAME2[r.m][0], PAY_NAME2[r.m][1]) + ')' : '';
        blocks.push(dmy(day(r)) + ' · ' + L('Оплата', 'Toʻlov') + pn + '\n−' + money(a));
      }
    }
    if (!inside.length) blocks.push(L('За период записей нет.', 'Davr uchun yozuvlar yoʻq.'));
    else blocks.push(L('Итого за период: в долг +', 'Davr boʻyicha jami: qarzga +') + money(add) + L(', оплачено −', ', toʻlangan −') + money(paid));
    blocks.push((cb > 0 ? L('Долг на ', 'Qarz ') + dmy(e) + ': ' + money(cb) : cb < 0 ? L('Переплата (аванс) на ', 'Ortiqcha toʻlov (avans) ') + dmy(e) + ': ' + money(-cb) : L('На ', '') + dmy(e) + L(' долга нет', ' sanasida qarz yoʻq'))
      + '\n\n' + L('Всё верно?', 'Hammasi toʻgʻrimi?'));
    // сообщения: блоки подряд, пока влезает; слишком длинный блок режется
    const parts = [];
    let cur = '';
    for (let b of blocks) {
      if (b.length > ACT_PART) b = b.slice(0, ACT_PART - 1) + '…';
      if (cur && cur.length + 2 + b.length > ACT_PART) { parts.push(cur); cur = b; } else cur = cur ? cur + '\n\n' + b : b;
    }
    if (cur) parts.push(cur);
    return parts;
  };
  let parts = build(false), compact = false;
  if (parts.length > ACT_MAX_MSG) { parts = build(true); compact = true; }
  if (parts.length > ACT_MAX_MSG) return { long: true };
  const head = L('📄 Акт сверки', '📄 Dalolatnoma');
  if (parts.length > 1) parts = parts.map((p, i) => i ? head + ' · ' + (i + 1) + '/' + parts.length + '\n\n' + p : p.replace('\n', ' (1/' + parts.length + ')\n'));
  return { parts, f, e, ob, cb, n: inside.length, compact };
}
function debtRemindText(h, shop, today, ords) {
  setLang(h.lang === 'uz' ? 'uz' : 'ru');
  const d = lgDue(h.open, today);
  const name = shop.name || DEFAULT.shop.name;
  const contact = (shop.telegram ? '@' + shop.telegram : '') + (shop.phone ? (shop.telegram ? ', ' : '') + shop.phone : '');
  const late = d.days ? L(' (просрочка ' + d.days + ' дн.)', ' (' + d.days + ' kun kechikdi)') : '';
  const head = L('🔔 ' + name + ': напоминание об оплате.\nДолг по заказам: ' + money(h.bal) + (d.due ? '\nСрок оплаты: ' + dmy(d.due) + late : ''),
    '🔔 ' + name + ': toʻlov eslatmasi.\nBuyurtmalar boʻyicha qarz: ' + money(h.bal) + (d.due ? '\nToʻlov muddati: ' + dmy(d.due) + late : ''));
  const tail = contact ? L('\nВопросы: ', '\nSavollar: ') + contact : '';
  const open = (Array.isArray(h.open) ? h.open : []).filter(q => q && q.r > 0), by = ords || {};
  const block = (q, maxItems) => {
    const o = q.ref ? by[q.ref] : null;
    if (!q.ref) return L('Прежние долги: ', 'Oldingi qarzlar: ') + money(q.r);
    if (!o) return q.ref + ' · ' + L('осталось ', 'qoldi ') + money(q.r) + (q.due ? ' · ' + L('срок ', 'muddat ') + dmy(q.due) : '');
    const items = Array.isArray(o.items) ? o.items : [];
    const lines = items.slice(0, maxItems).map(it => '• ' + (L(it.name, it.uz || it.name)) + (weightLabel(it) ? ' (' + weightLabel(it) + ')' : '') + ' × ' + it.qty);
    if (items.length > maxItems) lines.push(L('…и ещё ' + (items.length - maxItems) + ' поз.', '…yana ' + (items.length - maxItems) + ' ta'));
    const paidPart = o.total > q.r ? ', ' + L('осталось ', 'qoldi ') + money(q.r) : '';
    return o.id + ' · ' + dmy(dayOf(o.at)) + '\n' + (lines.length ? lines.join('\n') + '\n' : '')
      + L('Сумма ', 'Summa ') + money(o.total) + paidPart + (q.due ? ' · ' + L('срок ', 'muddat ') + dmy(q.due) : '');
  };
  let text = head + tail;
  if (open.length) for (const [maxOrders, maxItems] of REMIND_STEPS) {
    const show = open.slice(0, maxOrders), rest = open.slice(maxOrders);
    const more = rest.length ? '\n\n' + L('…и ещё ' + rest.length + ' зак. на ' + money(rest.reduce((t, q) => t + q.r, 0)), '…yana ' + rest.length + ' ta buyurtma, ' + money(rest.reduce((t, q) => t + q.r, 0))) : '';
    text = head + '\n\n' + show.map(q => block(q, maxItems)).join('\n\n') + more + tail;
    if (text.length <= 3800) break;
  }
  return text;
}

/* ---------- отчёты ---------- */
/* Продажи копятся по дням: когда заказ становится «выдан», его сумма, товары и клиент добавляются в запись rp:<день> (день по часам склада).
   Самих заказов в панели хранится не больше 150 завершённых, поэтому отчёты берут данные не из них. Старше 400 дней записи удаляются. */
const RP_KEEP = 400;
const RP_RANGES = [7, 30, 90, 365];
const RP_COVER = 14;          // на сколько дней считаем запас в подсказке «что пора закупать»
const dayOf = iso => { const t = Date.parse(iso); return new Date((Number.isFinite(t) ? t : Date.now()) + SHOP_TZ * 3600000).toISOString().slice(0, 10); };
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const newRp = () => ({ n: 0, sum: 0, disc: 0, fee: 0, cb: 0, cm: 0, items: [], cl: [] });
/* Комиссия площадки: считается с суммы товаров после скидки, без доставки (итог заказа минус доставка), только с выданных заказов.
   В записи дня cb — эта сумма, cm — комиссия, начисленная по проценту на момент выдачи (позже процент меняют только для новых заказов). */
const COMM_DEFAULT = 2, COMM_MAX = 50;
const cleanPct = v => { const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) && n >= 0 && n <= COMM_MAX ? Math.round(n * 100) / 100 : null; };
const commBase = r => r.cb !== undefined ? r.cb : Math.max(0, (Number(r.sum) || 0) - (Number(r.fee) || 0));
function statRange(period) {
  const today = dayOf(new Date().toISOString());
  const first = today.slice(0, 7) + '-01';
  if (period === '7d') return { period, from: addDays(today, -6), to: today };
  if (period === '30d') return { period, from: addDays(today, -29), to: today };
  if (period === 'prev') { const last = addDays(first, -1); return { period, from: last.slice(0, 7) + '-01', to: last }; }
  return { period: 'month', from: first, to: today };
}
function rpAdd(rp, o, pct, catOf) {
  const total = Number(o.total) || 0;
  if (!rp.n) rp.v = 2;   // день начат с подсчётом заказов по товарам и категориям (у записей до этого счёта поля v нет)
  if (rp.cb === undefined) rp.cb = Math.max(0, (Number(rp.sum) || 0) - (Number(rp.fee) || 0));   // запись дня, начатая до комиссии
  const base = Math.max(0, total - (Number(o.fee) || 0));
  rp.cb += base; rp.cm = (Number(rp.cm) || 0) + Math.round(base * (Number(pct) || 0) / 100);
  rp.n += 1; rp.sum += total; rp.disc += Number(o.disc) || 0; rp.fee += Number(o.fee) || 0;
  const seen = new Set(), cats = new Set();
  for (const it of o.items || []) {
    const qty = Number(it.qty) || 0;
    let x = rp.items.find(y => y.id === it.id);
    if (!x) { x = { id: String(it.id), name: cleanStr(it.name, 60), qty: 0, sum: 0 }; if (catOf) x.c = catOf(String(it.id)); rp.items.push(x); }
    x.qty += qty; x.sum += qty * (Number(it.price) || 0);
    if (rp.v === 2 && !seen.has(x.id)) { seen.add(x.id); x.n = (Number(x.n) || 0) + 1; }
    if (catOf) cats.add(x.c !== undefined ? x.c : catOf(x.id));
  }
  if (rp.v === 2 && cats.size) { rp.cn = rp.cn || {}; cats.forEach(c => { rp.cn[c] = (Number(rp.cn[c]) || 0) + 1; }); }
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
/* Продажи за период для владельца: по товарам, по категориям, по клиентам. days — дни периода, map — «rp:<день>» → запись.
   Заказов по товару и по категории считаются только за дни с полем v (с запуска этого раздела), за прежние дни остаются штуки и суммы (partial).
   Категория продажи — та, что была у товара в день продажи (поле c записи); у записей без неё берётся нынешний каталог.
   Если такой категории в каталоге уже нет, продажа попадает в «Без категории» (name ''). */
function analyticsBuild(o) {
  const { days, map, prod } = o;
  const catOf = new Map(prod.items.map(p => [p.id, p.cat])), nameOf = new Map(prod.items.map(p => [p.id, p.name]));
  const catById = new Map(prod.cats.map(c => [c.id, c]));
  const tot = { n: 0, sum: 0 }, prods = new Map(), cats = new Map(), cls = new Map();
  let partial = false;
  const catRow = id => {
    const c = catById.get(id), key = c ? id : '';
    let a = cats.get(key);
    if (!a) { a = { name: c ? c.name : '', uz: c ? (c.uz || '') : '', n: 0, qty: 0, sum: 0 }; cats.set(key, a); }
    return a;
  };
  for (const d of days) {
    const r = map.get('rp:' + d);
    if (!r) continue;
    tot.n += Number(r.n) || 0; tot.sum += Number(r.sum) || 0;
    const counted = r.v === 2;
    if (!counted && r.n > 0) partial = true;
    for (const x of r.items || []) {
      let a = prods.get(x.id);
      if (!a) { a = { id: x.id, name: x.name, n: 0, qty: 0, sum: 0 }; prods.set(x.id, a); }
      a.qty += Number(x.qty) || 0; a.sum += Number(x.sum) || 0; a.name = nameOf.get(x.id) || x.name || a.name;
      if (counted) a.n += Number(x.n) || 0;
      const c = catRow(x.c !== undefined ? x.c : (catOf.get(x.id) || ''));
      c.qty += Number(x.qty) || 0; c.sum += Number(x.sum) || 0;
    }
    if (counted && r.cn) for (const k of Object.keys(r.cn)) catRow(k).n += Number(r.cn[k]) || 0;
    for (const c of r.cl || []) {
      let a = cls.get(c.uid);
      if (!a) { a = { uid: c.uid, name: c.name, org: c.org, n: 0, sum: 0, last: '' }; cls.set(c.uid, a); }
      a.n += Number(c.n) || 0; a.sum += Number(c.sum) || 0; a.name = c.name || a.name; a.org = c.org || a.org;
      if (d > a.last) a.last = d;
    }
  }
  const top = (m, cap) => [...m.values()].sort((a, b) => b.sum - a.sum || b.n - a.n).slice(0, cap);
  return { tot, partial, since: o.since || '', prods: top(prods, 500), cats: [...cats.values()].sort((a, b) => b.sum - a.sum), cls: top(cls, 1000) };
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
    + '<style>body{font:16px/1.5 system-ui,sans-serif;max-width:560px;margin:32px auto;padding:0 16px;color:#1A1A1E}input,button{font:inherit;padding:10px 12px;border-radius:10px;border:1.5px solid #ccc}button{background:#139A78;color:#fff;border:0;cursor:pointer}li{margin:6px 0}.ok{color:#1F7A4D}.bad{color:#D63A1F}code{background:#EFEEEC;padding:2px 6px;border-radius:6px}</style></head><body>'
    + '<h1>Настройка бота</h1>' + inner + '</body></html>');
}

/* ---------- связь между Worker, площадкой (Hub) и дистрибьюторами (Shop) ---------- */
const stubOf = (ns, name) => ns.get(ns.idFromName(name));
/* Служебный запрос внутри сервера: идёт напрямую в хранилище, снаружи такие адреса (/__/…) недоступны. */
async function internalCall(stub, did, path, body) {
  const r = await stub.fetch(new Request('https://internal' + path, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-did': did }, body: JSON.stringify(body || {})
  }));
  let data = null;
  try { data = await r.json(); } catch (e) { /* пустой ответ */ }
  return { ok: r.ok, status: r.status, data };
}
const hubCall = async (env, path, body) => (await internalCall(stubOf(env.HUB, 'hub'), MAIN, path, body)).data;
const shopCall = (env, did, path, body) => internalCall(stubOf(env.SHOP, did), did, path, body);
const withDid = (request, did) => {
  const h = new Headers(request.headers);
  h.set('x-did', did);
  return new Request(request, { headers: h });
};

/* ---------- Worker ---------- */
/* Worker отдаёт страницу и раздаёт запросы: бот и список дистрибьюторов идут в Hub, всё остальное — в хранилище нужного дистрибьютора
   (его номер приложение присылает в заголовке x-shop; без заголовка работает первый дистрибьютор, как до появления площадки). */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    if (request.method === 'GET' && (p === '/' || p === '/index.html')) {
      return new Response(APP_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' } });
    }
    if (p === '/favicon.ico') return new Response(null, { status: 204 });
    if (p === '/webhook' || p === '/api/shops' || p.startsWith('/api/hub/')) {
      if (!env.HUB) {
        // площадка не подключена (в wrangler.toml нет привязки HUB): каталог и заказы первого дистрибьютора, как раньше, и кнопки под заказами работают
        if (p === '/webhook') return stubOf(env.SHOP, MAIN).fetch(withDid(request, MAIN));
        return json({ error: 'no_hub' }, 503);
      }
      return stubOf(env.HUB, 'hub').fetch(request);
    }
    if (p === '/setup') return stubOf(env.SHOP, MAIN).fetch(withDid(request, MAIN));
    if (p.startsWith('/img/')) {
      // /img/<дистрибьютор>/<товар>; без номера дистрибьютора (старые адреса) это первый дистрибьютор
      const rest = p.slice(5).split('/');
      const did = rest.length > 1 ? rest[0] : MAIN, pid = rest[rest.length - 1];
      if (rest.length > 2 || !validDid(did)) return new Response('not found', { status: 404 });
      return stubOf(env.SHOP, did).fetch(withDid(new Request(url.origin + '/img/' + pid + url.search, request), did));
    }
    if (p.startsWith('/api/')) {
      const did = request.headers.get('x-shop') || MAIN;
      if (!validDid(did)) return json({ error: 'bad_shop' }, 400);
      return stubOf(env.SHOP, did).fetch(withDid(request, did));
    }
    return json({ error: 'not_found' }, 404);
  },
  /* Расписание из wrangler.toml (каждое утро): напоминание продавцам о просроченных долгах. */
  async scheduled(event, env, ctx) {
    const run = async () => {
      try {
        if (env.HUB) await hubCall(env, '/__/morning', {});
        else await shopCall(env, MAIN, '/__/morning', { origin: '' });
      } catch (e) { console.error('scheduled failed', e && e.message || e); }
    };
    if (ctx && ctx.waitUntil) ctx.waitUntil(run()); else await run();
  }
};

/* ---------- Durable Object ---------- */
export class Shop {
  constructor(state, env) {
    this.state = state;
    this.st = state.storage;
    this.env = env;
    this.origin = '';
    this.did = MAIN;      // номер дистрибьютора: его присылает Worker в заголовке x-did
    this.born = undefined; // хранилище создано площадкой (у первого дистрибьютора есть всегда)
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
  async card(o, shop, confirm) { return adminCard(o, shop, this.origin, confirm, o.uid ? await this.getClient(o.uid) : null, this.did, o.uid ? await this.st.get('lh:' + o.uid) : null); }
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
    const byDay = new Map(), catOf = await this.catOf();
    let first = null;
    for (const o of done) {
      const d = dayOf(o.statusAt || o.createdAt);
      let r = byDay.get(d);
      if (!r) { r = newRp(); byDay.set(d, r); }
      rpAdd(r, o, 0, catOf);
      if (!first || d < first) first = d;
    }
    const days = [...byDay.keys()].sort().slice(-RP_KEEP);
    const upd = { rpx: days, rp0: first || dayOf(new Date().toISOString()) };
    days.forEach(d => { upd['rp:' + d] = byDay.get(d); });
    await this.st.put(upd);
  }
  /* Категория товара по его номеру в нынешнем каталоге ('' — товара или категории нет). */
  async catOf() {
    const prod = await this.getProd(), cat = new Map(prod.items.map(p => [p.id, p.cat]));
    return id => cat.get(id) || '';
  }
  /* Продажи за период для раздела «Аналитика» владельца. */
  async analytics(from, to) {
    await this.ensureReports();
    const days = ((await this.st.get('rpx')) || []).filter(d => d >= from && d <= to);
    const map = await this.getMany(days.map(d => 'rp:' + d));
    return analyticsBuild({ days, map, prod: await this.getProd(), since: (await this.st.get('rp0')) || '' });
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
    const rep = reportBuild({ days, today, rp, rp0: await this.st.get('rp0'), prod: await this.getProd(), stk: await this.getStk() });
    rep.comm = await this.commSummary();
    return rep;
  }
  /* Процент комиссии площадки: у первого дистрибьютора по умолчанию 0, у остальных его ставит площадка при создании. */
  async getPct() { const p = await this.st.get('cpct'); return typeof p === 'number' && p >= 0 && p <= COMM_MAX ? p : 0; }
  /* Выданные заказы за период (дни включительно): сколько, на какую сумму товаров, какая комиссия, сколько заказов сейчас в работе. */
  async commRange(from, to) {
    await this.ensureReports();
    const days = ((await this.st.get('rpx')) || []).filter(d => d >= from && d <= to);
    const map = await this.getMany(days.map(d => 'rp:' + d));
    const out = { pct: await this.getPct(), n: 0, base: 0, cm: 0, active: ((await this.st.get('act')) || []).length };
    map.forEach(r => { out.n += Number(r.n) || 0; out.base += commBase(r); out.cm += Number(r.cm) || 0; });
    return out;
  }
  /* Для отчётов дистрибьютора: комиссия за этот и прошлый месяц. */
  async commSummary() {
    const today = dayOf(new Date().toISOString());
    const first = today.slice(0, 7) + '-01', last = addDays(first, -1), pfirst = last.slice(0, 7) + '-01';
    const cur = await this.commRange(first, today), prev = await this.commRange(pfirst, last);
    const pick = (m, x) => ({ m, n: x.n, base: x.base, cm: x.cm });
    return { pct: cur.pct, cur: pick(first.slice(0, 7), cur), prev: pick(last.slice(0, 7), prev) };
  }
  async getProd() { return normProd(await this.st.get('prod')); }
  async getStk() { const s = await this.st.get('stk'); return s && typeof s === 'object' ? s : {}; }
  async pubProd(admin) { return publicProd(await this.getProd(), await this.getStk(), !!admin); }
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
  /* Публичный адрес /api/config читают все, но продавцу нужен каталог целиком (с черновиками): узнаём его, если Telegram-подпись приложена. */
  async adminIn(request) {
    const h = request.headers.get('x-init-data');
    if (!h || !this.env.BOT_TOKEN) return false;
    const au = await verifyInitData(h, this.env.BOT_TOKEN);
    return !au.err && await this.isAdmin(au.user.id);
  }

  /* --- Telegram --- */
  tg(method, payload) { return tgApi(this.env.BOT_TOKEN, method, payload); }
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
    // все фото всех товаров: первое как photos/<товар>.jpg, второе и третье как photos/<товар>-2.jpg и -3.jpg
    const withPhoto = [];
    prod.items.forEach(it => photoVers(it).forEach((v, i) => withPhoto.push({ id: it.id, n: i + 1 })));
    const photos = [];
    let used = 0;
    for (let i = 0; i < withPhoto.length; i += 20) {
      const part = withPhoto.slice(i, i + 20);
      const m = await this.getMany(part.map(x => photoKey(x.id, x.n)));
      for (const x of part) {
        const b = m.get(photoKey(x.id, x.n));
        if (!b || !b.length) continue;
        const u = b instanceof Uint8Array ? b : new Uint8Array(b);
        if (used + u.length > BACKUP_PHOTO_BUDGET) continue;
        used += u.length;
        photos.push({ name: 'photos/' + x.id + (x.n > 1 ? '-' + x.n : '') + '.jpg', data: u });
      }
    }
    const at = new Date().toISOString();
    const data = {
      kind: 'distro-backup', v: 1, at,
      cfg: await this.getCfg(), prod, stk: await this.getStk(), jr: (await this.st.get('jr')) || [],
      stats: (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 },
      admins: (await this.st.get('admins')) || [],
      act: (await this.st.get('act')) || [], hist: (await this.st.get('hist')) || [],
      orders: orders.map(o => { const x = Object.assign({}, o); delete x.msgs; delete x.cm; return x; }),
      clients: idx.map(x => cmap.get('c:' + x)).filter(Boolean),
      reports: await this.reportsDump(),
      debts: await this.debtsDump(),
      couriers: await this.couriersDump(),
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
  /* Доставщики и их журналы кассы для резервной копии (без ссылок-приглашений). */
  async couriersDump() {
    const list = await this.crList();
    const map = await this.getMany(list.map(c => 'cc:' + c.id));
    return list.map(c => ({ courier: Object.assign({}, c, { tok: '' }), log: map.get('cc:' + c.id) || null }));
  }
  /* Журналы расчётов магазинов с непогашенным долгом (или переплатой) для резервной копии. */
  async debtsDump() {
    const idx = (await this.st.get('dbi')) || [];
    const keys = [];
    idx.forEach(u => { keys.push('lh:' + u, 'lg:' + u); });
    const map = await this.getMany(keys);
    return idx.map(u => ({ uid: u, head: map.get('lh:' + u) || null, log: map.get('lg:' + u) || null }));
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
  /* Собирает файл выгрузки. kind: orders | clients | backup | catalog | report | debts | pick. Возвращает {name, bytes, mime, caption, n} или {err}. */
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
      const prod = await this.getProd(), uz = b && b.lang === 'uz';
      return { name: 'catalog-' + day + '.xlsx', bytes: xlsxBuild(catalogSheets(prod, uz ? 'uz' : 'ru')), mime: XLSX_MIME, n: prod.items.length,
        caption: uz ? 'Katalog: mahsulotlar ' + prod.items.length + '. Narxlarni tuzating, faylni saqlang va ilovada yuklang: Katalog → Prays yuklash.'
          : 'Каталог: товаров ' + prod.items.length + '. Измените цены, сохраните файл и загрузите его в приложении: Каталог → Загрузить прайс.' };
    }
    if (kind === 'report') {
      const r = await this.report(Number(b && b.days));
      return { name: 'report-' + day + '.xlsx', bytes: xlsxBuild(reportSheets(r)), mime: XLSX_MIME, n: r.tot.n,
        caption: 'Отчёт за ' + r.days + ' дн.: заказов ' + r.tot.n + ', сумма ' + num(r.tot.sum) + ' сум. Откройте в Excel.' };
    }
    if (kind === 'debts') {
      // f: all — все записи, over — просроченные, fl — спорные
      const f = b && ['all', 'over', 'fl'].includes(b.f) ? b.f : 'all';
      const dl = await this.debtList();
      const list = dl.debtors.filter(x => f === 'all' || (f === 'over' ? x.bal > 0 && x.days > 0 : x.fl > 0));
      if (!list.length) return { err: 'empty' };
      const map = await this.getMany(list.map(x => 'lg:' + x.uid));
      const owe = list.filter(x => x.bal > 0);
      return { name: 'debts-' + day + '.xlsx', bytes: xlsxBuild(debtsSheets(list, list.map(x => map.get('lg:' + x.uid) || null))), mime: XLSX_MIME, n: list.length,
        caption: 'Долги (' + (f === 'over' ? 'просроченные' : f === 'fl' ? 'спорные' : 'все') + '): магазинов ' + list.length + ', должны ' + num(owe.reduce((t, x) => t + x.bal, 0)) + ' сум, просрочено ' + num(owe.reduce((t, x) => t + x.over, 0)) + ' сум. Откройте в Excel.' };
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
    const did = request.headers.get('x-did') || MAIN;
    this.did = validDid(did) ? did : MAIN;
    try {
      // служебные запросы площадки (Hub): снаружи до них не добраться, Worker такие пути не пропускает
      if (path.startsWith('/__/')) return await this.internal(request, path);
      // хранилище, которое площадка не создавала, ничего не отдаёт (так нельзя «наплодить» пустых дистрибьюторов)
      if (this.did !== MAIN && !(await this.isBorn())) return json({ error: 'no_shop' }, 404);
      if (path === '/webhook' && method === 'POST') return await this.webhook(request);
      if (path === '/setup') return await this.setup(request);
      if ((method === 'GET' || method === 'HEAD') && path.startsWith('/img/')) return await this.image(path.slice(5), new URL(request.url).searchParams.get('n'));
      if (path === '/api/config' && method === 'GET') return json({ cfg: await this.getCfg(), prod: await this.pubProd(await this.adminIn(request)), off: await this.isOff() });
      if (path.startsWith('/api/')) return await this.api(request, path, method);
      return json({ error: 'not_found' }, 404);
    } catch (e) {
      console.error('shop error', path, e && e.stack || e);
      return json({ error: 'server' }, 500);
    }
  }

  async isBorn() {
    if (this.born === undefined) this.born = !!(await this.st.get('born'));
    return this.born;
  }
  async isOff() { return !!(await this.st.get('off')); }

  /* --- связь с площадкой --- */
  /* Краткая карточка дистрибьютора для списка: название, сколько товаров, категории, есть ли доставка. */
  async summary() {
    const cfg = await this.getCfg(), prod = await this.getProd();
    const ok = prod.items.filter(isApproved);   // в списке дистрибьюторов считаются только одобренные товары
    const cats = prod.cats.filter(c => ok.some(p => p.cat === c.id)).slice(0, 6).map(c => ({ name: c.name, uz: c.uz || '' }));
    return {
      name: cfg.shop.name || DEFAULT.shop.name, items: ok.length, wait: prod.items.filter(i => i.ms === 'wait').length, cats,
      delivery: cfg.shop.delivery !== false, minOrder: Number(cfg.shop.minOrder) || 0,
      regions: cleanRegions(cfg.shop.regions), home: cleanRegion(cfg.shop.home)
    };
  }
  /* Сообщает площадке о новом названии и составе каталога. Сбой не мешает продавцу: список обновится при следующем изменении. */
  async hubSync() {
    if (!this.env.HUB) return;
    try { await hubCall(this.env, '/__/sync', { did: this.did, summary: await this.summary() }); }
    catch (e) { console.error('hub sync failed', e && e.message || e); }
  }
  async hubOrdered(uid, prof) {
    if (!this.env.HUB) return;
    try { await hubCall(this.env, '/__/ordered', { did: this.did, uid, prof }); }
    catch (e) { console.error('hub ordered failed', e && e.message || e); }
  }
  async internal(request, path) {
    if (request.method !== 'POST') return json({ error: 'not_found' }, 404);
    // фото от владельца приходит байтами, остальное — JSON
    const raw = path === '/__/mod-photo';
    const r = raw ? { body: {} } : await this.readBody(request, 8000);
    const b = r.body && typeof r.body === 'object' ? r.body : {};
    if (path === '/__/init') {
      // площадка создаёт дистрибьютора: помечаем хранилище и ставим название
      const cfg = await this.getCfg();
      cfg.shop.name = cleanStr(b.name, 60) || DEFAULT.shop.name;
      const upd = { born: 1, cfg: sanitizeCfg(cfg) };
      const pct = b.pct === undefined ? null : cleanPct(b.pct);
      if (pct !== null) upd.cpct = pct;
      await this.st.put(upd);
      this.born = true;
      return json({ ok: true });
    }
    if (path === '/__/wipe') {
      // дистрибьютор удалён: хранилище очищается целиком (товары, фото, заказы, клиенты, настройки); у первого дистрибьютора так нельзя
      if (this.did === MAIN) return json({ error: 'forbidden' }, 403);
      await this.st.deleteAll();
      this.born = false;
      return json({ ok: true });
    }
    if (this.did !== MAIN && !(await this.isBorn())) return json({ error: 'no_shop' }, 404);
    if (path === '/__/mod-photo') return await this.modPhoto(request);
    if (path === '/__/summary') return json(await this.summary());
    if (path === '/__/clients') {
      // клиенты этого дистрибьютора: площадка один раз переносит их в общую базу магазинов
      await this.ensureClients();
      const idx = await this.clientsIdx(), map = await this.getMany(idx.map(x => 'c:' + x));
      return json({ clients: idx.map(x => map.get('c:' + x)).filter(Boolean).map(c => ({ uid: c.uid, name: c.name, phone: c.phone, org: c.org, addr: (c.addrs || [])[0] || '' })) });
    }
    if (path === '/__/mine') return json({ rows: await this.mineRows(b.items) });
    if (path === '/__/mine-ids') return json({ uids: await this.mineIds() });
    if (path === '/__/mine-set') return await this.mineSet(b);
    if (path === '/__/mine-orders') return json({ orders: await this.mineOrders(b.uids) });
    if (path === '/__/stats') return json(await this.commRange(String(b.from || ''), String(b.to || '')));
    if (path === '/__/analytics') {
      const ymd = /^\d{4}-\d\d-\d\d$/;
      if (!ymd.test(String(b.from)) || !ymd.test(String(b.to))) return json({ error: 'bad_request' }, 400);
      return json(await this.analytics(b.from, b.to));
    }
    if (path === '/__/cpct') {
      const pct = cleanPct(b.pct);
      if (pct === null) return json({ error: 'bad_pct' }, 400);
      await this.st.put('cpct', pct);
      return json({ ok: true, pct });
    }
    if (path === '/__/mod-list') return json(await this.modList(b.seg === 'ret' || b.seg === 'ok' ? b.seg : 'wait'));
    if (path === '/__/mod-approve') return await this.modApprove(b);
    if (path === '/__/mod-return') return await this.modReturn(b);
    if (path === '/__/mod-edit') return await this.modEdit(b);
    if (path === '/__/admins') return json({ admins: (await this.st.get('admins')) || [] });
    if (path === '/__/morning') return json(await this.morning(b.origin));
    if (path === '/__/admin-add') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid)) return json({ error: 'bad_request' }, 400);
      const admins = (await this.st.get('admins')) || [];
      if (!admins.includes(uid)) { admins.push(uid); await this.st.put('admins', admins); }
      return json({ ok: true, admins });
    }
    if (path === '/__/admin-clear') {
      const admins = (await this.st.get('admins')) || [];
      await this.st.put('admins', []);
      return json({ ok: true, removed: admins });
    }
    if (path === '/__/courier-of') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid)) return json({ error: 'bad_request' }, 400);
      const c = await this.courierOf(uid);
      return json({ courier: c ? { id: c.id, name: c.name } : null });
    }
    // вход доставщика по ссылке-приглашению: «/start c_<дистрибьютор>_<ключ>» разбирает площадка
    if (path === '/__/courier-join') {
      const uid = Number(b.uid), tok = String(b.token || '');
      if (!Number.isSafeInteger(uid) || !validTok(tok)) return json({ error: 'bad_request' }, 400);
      const id = await this.st.get('ct:' + tok), c = id ? await this.crGet(id) : null;
      if (!c) {
        const me = await this.courierOf(uid);      // ссылку нажали второй раз: уже вошёл, ничего не меняем
        return me ? json({ ok: true, courier: { id: me.id, name: me.name }, again: true }) : json({ error: 'bad_token' }, 404);
      }
      if (Date.now() - (Number(c.tokAt) || 0) > CINV_MS) return json({ error: 'expired' }, 410);
      const mine = await this.st.get('cru:' + uid);
      if (mine && mine !== c.id) return json({ error: 'already' }, 409);
      const upd = {}, del = ['ct:' + tok];
      if (c.uid && c.uid !== uid) del.push('cru:' + c.uid);       // новая ссылка передала место другому человеку
      c.uid = uid; c.tok = ''; c.tokAt = 0; c.on = true;
      upd['cr:' + c.id] = c; upd['cru:' + uid] = c.id;
      await this.st.put(upd);
      await this.st.delete(del);
      return json({ ok: true, courier: { id: c.id, name: c.name } });
    }
    if (path === '/__/off') { if (b.off) await this.st.put('off', 1); else await this.st.delete('off'); return json({ ok: true }); }
    if (path === '/__/my-debt') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid)) return json({ error: 'bad_request' }, 400);
      return json({ debt: await this.myDebt(uid, !!b.full) });
    }
    if (path === '/__/my-confirm') {
      const uid = Number(b.uid), n = Number(b.n);
      if (!Number.isSafeInteger(uid) || !Number.isInteger(n)) return json({ error: 'bad_request' }, 400);
      const res = await this.confirmRow(uid, n, !!b.ok);
      if (res.err) return json({ error: res.err }, res.err === 'not_found' ? 404 : 409);
      if (res.changed && !b.ok) await this.disputeNotify(uid, res.rows, res.hdr);
      return json({ ok: true, debt: await this.myDebt(uid, true) });
    }
    if (path === '/__/disputes') return json({ items: await this.disputes() });
    if (path === '/__/resolve' && b.cid) {
      const c = validCid(b.cid) ? await this.crGet(b.cid) : null;
      if (!c || !b.by || !Number.isSafeInteger(Number(b.by.id))) return json({ error: c ? 'bad_request' : 'not_found' }, c ? 400 : 404);
      return await this.handAct(c, 'resolve', { n: b.n, note: b.note }, { id: Number(b.by.id), first_name: String(b.by.first_name || ''), last_name: String(b.by.last_name || ''), username: String(b.by.username || '') });
    }
    if (path === '/__/resolve') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid) || !b.by || !Number.isSafeInteger(Number(b.by.id))) return json({ error: 'bad_request' }, 400);
      return await this.debtAct(uid, 'resolve', { n: b.n, note: b.note }, { id: Number(b.by.id), first_name: String(b.by.first_name || ''), last_name: String(b.by.last_name || ''), username: String(b.by.username || '') });
    }
    if (path === '/__/my-orders') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid)) return json({ error: 'bad_request' }, 400);
      return json({ orders: await this.myOrders(uid) });
    }
    return json({ error: 'not_found' }, 404);
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

    if (path.startsWith('/api/courier/')) {
      const cour = await this.courierOf(uid);
      if (!cour) return json({ error: 'forbidden' }, 403);
      return await this.courierApi(request, path, method, u, cour);
    }
    if (path === '/api/bootstrap' && method === 'GET') {
      await this.ensureClients();
      const cl = await this.getClient(uid);
      return json({ did: this.did, off: await this.isOff(), cfg: await this.getCfg(), prod: await this.pubProd(admin), me: { id: uid, name: u.first_name || '', admin, courier: await this.courierMe(uid), profile: clientPublic(cl), blocked: !!(cl && cl.blocked), fav: await this.getFav(uid) }, orders: await this.myOrders(uid) });
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
        const raw = await this.getOrders(act.concat(hist));
        const orders = raw.map(adminOrder);
        // у заказов в работе показываем долг магазина: продавец видит его до выдачи
        const live = raw.map((o, i) => [o, i]).filter(([o]) => o.uid && NEXT[o.status]);
        if (live.length) {
          const heads = await this.getMany([...new Set(live.map(([o]) => o.uid))].map(u => 'lh:' + u));
          const today = dayOf(new Date().toISOString());
          live.forEach(([o, i]) => {
            const h = heads.get('lh:' + o.uid);
            if (h && h.bal > 0) { const d = lgDue(h.open, today); orders[i].debt = { bal: h.bal, over: d.over, days: d.days, due: d.due }; }
          });
        }
        const stats = (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 };
        return json({ orders, stats });
      }
      if (path === '/api/admin/status' && method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        const res = await this.changeStatus(String(r.body.id || ''), String(r.body.to || ''), r.body.pay, null, { id: uid, name: whoName(u) });
        if (res.err) return json({ error: res.err, order: res.order ? adminOrder(res.order) : undefined }, res.err === 'not_found' ? 404 : res.err === 'bad_pay' ? 400 : 409);
        if (res.changed) { await this.afterChange(res.order, 'admin'); if (res.ask) await this.askConfirm(res.ask.uid, res.ask.n); }
        return json({ order: adminOrder(res.order), stats: res.stats || (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 } });
      }
      if (path === '/api/admin/config' && method === 'PUT') {
        const r = await this.readBody(request, 100000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        const cfg = sanitizeCfg(r.body.cfg);
        await this.st.put('cfg', cfg);
        await this.hubSync();
        return json({ cfg });
      }
      if (path === '/api/admin/products' && method === 'PUT') {
        const r = await this.readBody(request, PROD_BODY_MAX);
        if (r.err || !r.body) return json({ error: 'bad_request' }, r.err || 400);
        return await this.saveProd(r.body.prod, uid);
      }
      if (path === '/api/admin/submit' && method === 'POST') {
        const r = await this.readBody(request, 6000);
        if (r.err) return json({ error: 'bad_request' }, 400);
        return await this.modSubmit(r.body && typeof r.body === 'object' ? r.body : {});
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
          const dh = await this.st.get('lh:' + cuid);
          if (dh && (dh.bal !== 0 || (dh.fl || 0) > 0 || (dh.cwt || []).length)) return json({ error: 'has_debt' }, 409);
          const idx = await this.clientsIdx();
          await this.st.put('cx', idx.filter(x => x !== cuid));
          await this.st.delete('c:' + cuid);
          return json({ ok: true });
        }
      }
      if (path === '/api/admin/couriers' || path.startsWith('/api/admin/couriers/')) return await this.adminCouriers(request, path, method, uid, u);
      if (path === '/api/admin/debts' && method === 'GET') return json(await this.debtList());
      if (path === '/api/admin/debts/morning' && method === 'POST') {
        const r = await this.readBody(request, 500);
        if (r.err || !r.body || typeof r.body.on !== 'boolean') return json({ error: 'bad_request' }, 400);
        if (r.body.on) await this.st.delete('mrn'); else await this.st.put('mrn', 0);
        return json({ ok: true, morning: r.body.on });
      }
      if (path === '/api/admin/disputes' && method === 'GET') return json({ items: await this.disputes() });
      const dm = path.match(/^\/api\/admin\/debts\/(\d{1,15})(?:\/(pay|void|remind|resolve|act))?$/);
      if (dm) {
        const duid = Number(dm[1]);
        if (!dm[2] && method === 'GET') return await this.debtOne(duid);
        if (dm[2] && method === 'POST') {
          const r = await this.readBody(request, 2000);
          if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
          return await this.debtAct(duid, dm[2], r.body, u);
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
      if (path === '/api/admin/import' && method === 'POST') return await this.importPrice(request, new URL(request.url).searchParams.get('apply') === '1', uid);
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
        // ?n=1..3 — какое по счёту фото; без n это первое (так работало, пока фото было одно)
        const rawN = new URL(request.url).searchParams.get('n');
        const n = rawN === null ? 1 : Number(rawN);
        if (!Number.isInteger(n) || n < 1 || n > PHOTOS_MAX) return json({ error: 'bad_slot' }, 400);
        if (method === 'DELETE') return await this.setPhoto(id, null, n);
        // фото приходит как есть, байтами (JPEG), без base64: так сервер почти ничего не считает
        if (Number(request.headers.get('content-length') || 0) > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
        const bytes = new Uint8Array(await request.arrayBuffer());
        if (bytes.length > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
        if (!checkJpeg(bytes, PROD_PHOTO_LIM)) return json({ error: 'bad_photo' }, 400);
        return await this.setPhoto(id, bytes, n);
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
    await this.hubProfile(u.id, c);
    return json({ profile: clientPublic(c) });
  }
  /* Магазин заполнил профиль: он попадает в общую базу и без заказа (если там его ещё нет). */
  async hubProfile(uid, c) {
    if (!this.env.HUB) return;
    const name = cleanStr(c.org, 60) || cleanStr(c.name, 60);
    if (name.length < 2 || !phoneOk(String(c.phone || ''))) return;
    try { await hubCall(this.env, '/__/profile', { did: this.did, uid, prof: { name: c.name, phone: c.phone, org: c.org, addr: (c.addrs || [])[0] || '' } }); }
    catch (e) { console.error('hub profile failed', e && e.message || e); }
  }

  /* --- клиенты в общей базе: данные дистрибьютора о магазине (площадка спрашивает их только у самого дистрибьютора) ---
     Заметка и группа лежат по номеру магазина в базе (bn:<номер>), поэтому их можно вести и у магазина, который ещё не заходил в приложение.
     Если у магазина есть запись клиента c:<uid>, заметка и группа дублируются и туда: так они попадают в карточку заказа в Telegram.
     Блокировка живёт только в c:<uid>: она нужна при оформлении заказа. */
  mineUids(x) { return (Array.isArray(x && x.uids) ? x.uids : []).slice(0, 10).map(Number).filter(Number.isSafeInteger); }
  async mineRows(items) {
    await this.ensureClients();
    const list = (Array.isArray(items) ? items : []).slice(0, 60).filter(x => x && typeof x.bid === 'string' && /^b[a-z0-9]{4,12}$/.test(x.bid));
    const uids = [...new Set(list.flatMap(x => this.mineUids(x)))];
    const cm = await this.getMany(uids.map(u => 'c:' + u));
    const bm = await this.getMany(list.map(x => 'bn:' + x.bid));
    return list.map(x => mineRow(x.bid, this.mineUids(x).map(u => cm.get('c:' + u)).filter(Boolean), bm.get('bn:' + x.bid)));
  }
  /* Номера клиентов, которые заказывали у этого дистрибьютора (не считая отменённых). */
  async mineIds() {
    await this.ensureClients();
    const idx = await this.clientsIdx(), map = await this.getMany(idx.map(x => 'c:' + x));
    return idx.filter(x => { const c = map.get('c:' + x); return c && c.n > 0; });
  }
  async mineSet(b) {
    await this.ensureClients();
    const bid = typeof b.bid === 'string' && /^b[a-z0-9]{4,12}$/.test(b.bid) ? b.bid : '';
    if (!bid) return json({ error: 'bad_request' }, 400);
    const uids = this.mineUids(b);
    const v = cleanClient({ note: b.note, grp: b.grp, blocked: b.blocked }, true);
    if (v.err) return json({ error: v.err }, 400);
    const cs = (await Promise.all(uids.map(u => this.getClient(u)))).filter(Boolean);
    if (v.v.blocked !== undefined && !cs.length) return json({ error: 'no_client' }, 409);
    const upd = {};
    if (v.v.note !== undefined || v.v.grp !== undefined) {
      const bn = (await this.st.get('bn:' + bid)) || { note: '', grp: '' };
      if (v.v.note !== undefined) bn.note = v.v.note;
      if (v.v.grp !== undefined) bn.grp = v.v.grp;
      upd['bn:' + bid] = bn;
    }
    for (const c of cs) { Object.assign(c, v.v); upd['c:' + c.uid] = c; }
    if (Object.keys(upd).length) await this.st.put(upd);
    return json({ row: (await this.mineRows([{ bid, uids }]))[0] });
  }
  /* Последние заказы магазина у этого дистрибьютора. */
  async mineOrders(uids) {
    const ids = [];
    for (const u of this.mineUids({ uids })) for (const id of (await this.st.get('m:' + u)) || []) if (!ids.includes(id)) ids.push(id);
    const orders = await this.getOrders(ids);
    return orders.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 30).map(adminOrder);
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
    if (await this.isOff()) return json({ error: 'shop_off' }, 403);
    await this.ensureClients();
    const cl0 = await this.getClient(u.id);
    if (cl0 && cl0.blocked) return json({ error: 'blocked' }, 403);
    const cfg = await this.getCfg();
    const prod = await this.getProd();
    const stk = await this.getStk();
    const v = validateOrder(body, cfg, prod, stk);
    if (v.err) {
      const fresh = v.err === 'unavailable' || v.err === 'no_delivery' || v.err === 'no_region' || v.err === 'region_need' || v.err === 'stock' || v.err === 'min_order';
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
    if (v.mode === 'delivery' && v.region) order.region = v.region;
    if (v.loc) order.loc = v.loc;   // только в заказе: в базу магазинов точка попадает после подтверждения агентом
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
    await this.hubOrdered(uid, { name: order.name, phone: order.phone, org: order.org || '', addr: order.mode === 'delivery' ? order.address : '', terr: cleanStr(body.form.terr, 12), loc: order.loc });

    // уведомления: ошибки Telegram не должны ломать приём заказа
    const sent = [];
    const card = adminCard(order, cfg.shop, this.origin, false, cl, this.did, await this.st.get('lh:' + uid));
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
    await this.tg('sendMessage', { chat_id: uid, text: customerText(order, 'placed', cfg.shop), reply_markup: openBtn(this.origin, order.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы', this.origin + '/?v=mine') });
    await this.stockAlert(low);
    return json({ order: publicOrder(order) });
  }

  /* --- каталог --- */
  async saveProd(input, uid) { return json({ prod: await this.applyProd(input, uid) }); }
  /* Владелец площадки? Без площадки (одиночный магазин) продавец и есть владелец. */
  async isOwnerUid(uid) {
    if (!this.env.HUB) return true;
    try { const r = await hubCall(this.env, '/__/is-owner', { uid }); return !!(r && r.owner); } catch (e) { return false; }
  }
  /* Сохраняет каталог целиком (его присылает приложение или прайс) и возвращает его продавцу с метками проверки.
     Новые товары продавца начинаются черновиками (из прайса — сразу «ждёт проверки»), у владельца — сразу одобренными. */
  async applyProd(input, uid, newState) {
    const old = await this.getProd();
    const oldIds = new Set(old.items.map(i => i.id));
    const hasNew = normProd(input).items.some(o => !(validId(o.id) && oldIds.has(o.id)));
    const mod = hasNew && !(await this.isOwnerUid(uid)) ? { state: newState || 'draft', at: new Date().toISOString() } : null;
    const prod = sanitizeProd(input, old, mod);
    const keep = new Set(prod.items.map(i => i.id));
    const gone = old.items.map(i => i.id).filter(id => !keep.has(id));
    const stk = await this.getStk();
    const upd = { prod };
    if (gone.some(id => stk[id])) { gone.forEach(id => { delete stk[id]; }); upd.stk = stk; }   // остаток удалённого товара не копим
    await this.st.put(upd);
    if (gone.length) await this.st.delete(gone.flatMap(id => [1, 2, 3].map(n => photoKey(id, n))));   // фото удалённых товаров не копим
    await this.hubSync();
    if (mod && mod.state === 'wait') {
      const fresh = prod.items.filter(i => i.ms === 'wait' && !oldIds.has(i.id));
      if (fresh.length) await this.modNotifyOwner(fresh.length);
    }
    return publicProd(prod, stk, true);
  }
  /* Продавец отправляет новые (или возвращённые) товары на проверку. ids — какие; без них — все черновики и возвращённые.
     Нужны название, цена и категория: у остальных в ответе bad (что исправить), они остаются как были. */
  async modSubmit(b) {
    const prod = await this.getProd();
    const want = Array.isArray(b.ids) ? new Set(b.ids.filter(validId)) : null;
    const sent = [], bad = [], now = new Date().toISOString();
    for (const it of prod.items) {
      if ((it.ms !== 'draft' && it.ms !== 'ret') || (want && !want.has(it.id))) continue;
      const why = modProblems(it, prod.cats);
      if (why.length) { bad.push({ id: it.id, why }); continue; }
      it.ms = 'wait'; it.mt = now; delete it.mc;
      sent.push(it);
    }
    if (!sent.length) return json({ error: 'nothing', bad }, 400);
    await this.st.put('prod', prod);
    await this.hubSync();
    await this.modNotifyOwner(sent.length);
    return json({ prod: publicProd(prod, await this.getStk(), true), sent: sent.length, bad });
  }
  /* Один раз на отправку: владельцу уходит «Дистрибьютор: на проверке N товаров» с кнопкой в раздел проверки. */
  async modNotifyOwner(n) {
    if (!this.env.HUB || !(n > 0)) return;
    try { await hubCall(this.env, '/__/mod-notify', { did: this.did, n, origin: this.origin }); }
    catch (e) { console.error('mod notify failed', e && e.message || e); }
  }
  /* Сообщение продавцам этого дистрибьютора (одобрили или вернули). */
  async modTellSellers(text, origin) {
    const url = /^https:\/\/(?!internal)/.test(origin || '') ? origin : '';
    for (const aid of (await this.st.get('admins')) || []) {
      try { await this.tg('sendMessage', Object.assign({ chat_id: aid, text }, url ? { reply_markup: openBtn(url, 'Открыть товары', sellerUrl(url, this.did)) } : {})); }
      catch (e) { console.error('mod tell failed', e && e.message || e); }
    }
  }
  /* Владелец: список товаров по статусам. seg: wait, ret или ok (одобренные через проверку). Ответ — вместе с числами по всем трём. */
  async modList(seg) {
    const prod = await this.getProd();
    const cat = new Map(prod.cats.map(c => [c.id, c]));
    const counts = { wait: 0, ret: 0, ok: 0 };
    prod.items.forEach(i => { if (i.ms === 'wait') counts.wait++; else if (i.ms === 'ret') counts.ret++; else if (!i.ms && i.ma) counts.ok++; });
    const pick = i => seg === 'ok' ? (!i.ms && i.ma) : i.ms === seg;
    const rows = prod.items.filter(pick).sort((a, b) => String(b.ma || b.mt || '').localeCompare(String(a.ma || a.mt || ''))).slice(0, 150)
      .map(i => Object.assign({}, i, { catName: (cat.get(i.cat) || {}).name || '', catUz: (cat.get(i.cat) || {}).uz || '' }));
    return { items: rows, counts, name: (await this.getCfg()).shop.name || '', cats: prod.cats };
  }
  async modApprove(b) {
    const prod = await this.getProd(), ids = new Set((Array.isArray(b.ids) ? b.ids : []).filter(validId));
    const done = [], now = new Date().toISOString();
    for (const it of prod.items) {
      if (!ids.has(it.id) || (it.ms !== 'wait' && it.ms !== 'ret')) continue;
      delete it.ms; delete it.mt; delete it.mc; it.ma = now;
      done.push(it);
    }
    if (done.length) {
      await this.st.put('prod', prod);
      await this.hubSync();
      const names = done.slice(0, 8).map(i => '• ' + i.name).join('\n') + (done.length > 8 ? '\n… и ещё ' + (done.length - 8) : '');
      await this.modTellSellers(done.length === 1 ? '✅ Товар «' + done[0].name + '» одобрен и появился в каталоге.' : '✅ Одобрено: ' + ruTovar(done.length) + '. Они появились в каталоге.\n' + names, b.origin);
    }
    return json({ ok: true, n: done.length });
  }
  async modReturn(b) {
    const reason = cleanStr(b.reason, MOD_REASON_MAX, true);
    if (!validId(b.id) || !reason) return json({ error: 'bad_request' }, 400);
    const prod = await this.getProd(), it = prod.items.find(x => x.id === b.id);
    if (!it) return json({ error: 'not_found' }, 404);
    if (it.ms !== 'wait' && it.ms !== 'ret') return json({ error: 'not_pending' }, 409);
    it.ms = 'ret'; it.mt = new Date().toISOString(); it.mc = reason; delete it.ma;
    await this.st.put('prod', prod);
    await this.hubSync();
    await this.modTellSellers('↩️ Товар «' + it.name + '» возвращён на доработку.\nЧто исправить: ' + reason + '\nОткройте «Продавец» → «Каталог», исправьте и отправьте снова.', b.origin);
    return json({ ok: true });
  }
  /* Владелец правит товар сам (текст, цена, упаковка); статус проверки при этом не меняется. */
  async modEdit(b) {
    if (!validId(b.id) || !b.item || typeof b.item !== 'object') return json({ error: 'bad_request' }, 400);
    const old = await this.getProd();
    if (!old.items.some(x => x.id === b.id)) return json({ error: 'not_found' }, 404);
    const F = ['name', 'uz', 'desc', 'descUz', 'cat', 'amount', 'unit', 'price', 'tiers', 'blk', 'box', 'tag', 'old'];
    const patch = {};
    F.forEach(k => { if (b.item[k] !== undefined) patch[k] = b.item[k]; });
    const prod = sanitizeProd({ cats: old.cats, items: old.items.map(x => x.id === b.id ? Object.assign({}, x, patch) : x) }, old);
    await this.st.put('prod', prod);
    await this.hubSync();
    return json({ item: prod.items.find(x => x.id === b.id) });
  }
  /* Фото товара от владельца (через площадку): то же, что у продавца, с теми же проверками. del=1 — убрать. */
  async modPhoto(request) {
    const q = new URL(request.url).searchParams, id = q.get('id') || '', n = Number(q.get('n') || 1);
    if (!validId(id)) return json({ error: 'not_found' }, 404);
    if (!Number.isInteger(n) || n < 1 || n > PHOTOS_MAX) return json({ error: 'bad_slot' }, 400);
    if (q.get('del') === '1') return await this.setPhoto(id, null, n);
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (bytes.length > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
    if (!checkJpeg(bytes, PROD_PHOTO_LIM)) return json({ error: 'bad_photo' }, 400);
    return await this.setPhoto(id, bytes, n);
  }
  /* Прайс из Excel: apply=false только показывает, что изменится; apply=true записывает. */
  async importPrice(request, apply, uid) {
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
    if (apply && plan.changes.length) { out.prod = await this.applyProd(plan.prod, uid, 'wait'); out.applied = true; }   // новые строки прайса сразу идут на проверку
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
  /* Кладёт фото под номером n (замена или добавление в конец) или убирает его, а следующие сдвигает на одно место вперёд.
     Номер больше «сколько есть + 1» нельзя: фото идут подряд. Ответ: версии всех трёх мест (пустая строка, если места нет). */
  async setPhoto(id, bytes, n) {
    n = n || 1;
    const prod = await this.getProd();
    const it = prod.items.find(x => x.id === id);
    if (!it) return json({ error: 'not_found' }, 404);
    const vers = photoVers(it);
    const put = {}, del = [];
    if (bytes) {
      if (n > vers.length + 1) return json({ error: 'bad_slot' }, 400);
      vers[n - 1] = randId(6);
      put[photoKey(id, n)] = bytes;
    } else if (n <= vers.length) {
      for (let i = n; i < vers.length; i++) {
        // фото i+1 переезжает на место i, под новой версией, чтобы адрес в кэше не совпал ни с каким прежним
        put[photoKey(id, i)] = await this.st.get(photoKey(id, i + 1));
        vers[i - 1] = randId(6);
      }
      del.push(photoKey(id, vers.length));
      vers.length--;
    }
    it.pv = vers[0] || ''; it.pv2 = vers[1] || ''; it.pv3 = vers[2] || '';
    await this.st.put(Object.assign(put, { prod }));
    if (del.length) await this.st.delete(del);
    return json({ pv: it.pv, pv2: it.pv2, pv3: it.pv3 });
  }
  /* Фото товара: открыто всем, как обычная картинка в каталоге. Адрес с ?v= меняется вместе с фото, поэтому кэш вечный.
     ?n=2 и ?n=3 — второе и третье фото; без n это первое. */
  async image(id, n) {
    if (!validId(id)) return new Response('not found', { status: 404 });
    const k = Number(n);
    const bytes = await this.st.get(photoKey(id, Number.isInteger(k) && k >= 1 && k <= PHOTOS_MAX ? k : 1));
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
  async changeStatus(id, to, pay, cour, by) {
    await this.ensureClients();
    await this.ensureReports();
    const o = await this.st.get('o:' + id);
    if (!o) return { err: 'not_found' };
    if (o.status === to) return { order: o, same: true };
    if (!(NEXT[o.status] || []).includes(to)) return { err: 'bad_transition', order: o };
    // доставщик закрывает только свой заказ на доставку
    if (cour && (o.mode !== 'delivery' || o.cr !== cour.id || to !== 'done')) return { err: 'not_yours', order: o };
    const nowIso = new Date().toISOString();
    const payRec = to === 'done' ? cleanPay(pay, Number(o.total) || 0, dayOf(nowIso)) : null;
    if (to === 'done' && !payRec) return { err: 'bad_pay', order: o };
    o.status = to;
    o.statusAt = nowIso;
    const upd = { ['o:' + id]: o };
    let stats = null, ask = null;
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
        rpAdd(rp, o, await this.getPct(), await this.catOf());
        upd['rp:' + day] = rp;
        const idx = (await this.st.get('rpx')) || [];
        if (!idx.includes(day)) {
          idx.push(day); idx.sort();
          const drop = idx.splice(0, Math.max(0, idx.length - RP_KEEP));
          if (drop.length) await this.st.delete(drop.map(d => 'rp:' + d));
          upd.rpx = idx;
        }
      }
      // оплата: как заплатил магазин; выдача в долг (и часть, оплаченная сразу) попадает в журнал расчётов
      if (to === 'done') {
        o.pay = payRec;
        const total = Number(o.total) || 0;
        if (payRec.m === 'credit' && o.uid && total > 0) {
          // кто записал; магазин подтверждает запись в Telegram (cf «wait»)
          const mk = r => Object.assign(r, { by: by ? by.id : 0, bn: by ? by.name : '', cf: 'wait' }, cour ? { cid: cour.id } : {});
          const adds = [mk({ k: 'ch', d: total, a: total, ref: o.id, due: payRec.due })];
          if (payRec.paid) adds.push(mk({ k: 'pay', d: -payRec.paid, a: payRec.paid, m: payRec.pm, ref: o.id }));
          if (cour && payRec.paid && payRec.pm !== 'cash') adds[1].vr = 'wait';
          const snap = {};
          if (o.name) snap.name = o.name;
          if (o.org) snap.org = o.org;
          if (o.phone) snap.phone = o.phone;
          if (o.mode === 'delivery' && o.address) snap.addr = o.address;
          if (o.lang) snap.lang = o.lang;
          const lr = await this.lgAdd(o.uid, adds, snap);
          Object.assign(upd, lr.put);
          ask = { uid: o.uid, n: lr.ns[0], pn: payRec.paid && cour && payRec.pm !== 'cash' ? lr.ns[1] : 0 };
        }
        // наличные, которые доставщик принял у клиента, оседают в его кассе до сдачи продавцу
        if (cour) {
          const cashIn = payRec.m === 'cash' ? total : payRec.m === 'credit' && payRec.pm === 'cash' ? (payRec.paid || 0) : 0;
          // карта и перечисление не попадают в наличные доставщика: они ждут сверки продавцом с банком
          const nvIn = payRec.m === 'card' || payRec.m === 'bank' ? total : payRec.m === 'credit' && payRec.paid && payRec.pm !== 'cash' ? payRec.paid : 0;
          const c = cashIn > 0 || nvIn > 0 ? await this.crGet(cour.id) : null;
          if (c && cashIn > 0) Object.assign(upd, await this.crAdd(c, [{ k: 'in', d: cashIn, a: cashIn, o: o.id, nm: o.name || '' }]));
          else if (c) {
            const nm = payRec.m === 'credit' ? payRec.pm : payRec.m;
            this.nvAdd(c, Object.assign({ k: 'o', a: nvIn, m: nm, o: o.id, nm: o.name || '' }, ask && ask.pn ? { uid: o.uid, n: ask.pn } : {}));
            Object.assign(upd, await this.crAdd(c, [{ k: 'nv', d: 0, a: nvIn, m: nm, o: o.id, nm: o.name || '' }]));
          }
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
    return { order: o, changed: true, stats: stats || undefined, ask: ask || undefined };
  }

  /* --- доставка: доставщики, «Взял», касса наличных --- */
  async crList() {
    const idx = (await this.st.get('crx')) || [];
    const map = await this.getMany(idx.map(i => 'cr:' + i));
    return idx.map(i => map.get('cr:' + i)).filter(Boolean);
  }
  async crGet(id) { const c = validCid(id) ? await this.st.get('cr:' + id) : null; return c && typeof c === 'object' ? c : null; }
  /* Доставщик по номеру в Telegram: только тот, кто вошёл по ссылке и не отключён. */
  async courierOf(uid) {
    const id = await this.st.get('cru:' + uid);
    const c = id ? await this.crGet(id) : null;
    return c && c.uid === uid && c.on !== false ? c : null;
  }
  async botUser() {
    if (!this.botun) {
      this.botun = (await this.st.get('botun')) || '';
      if (!this.botun) {
        const me = await this.tg('getMe', {});
        if (me.ok && me.result && me.result.username) { this.botun = String(me.result.username); await this.st.put('botun', this.botun); }
      }
    }
    return this.botun;
  }
  async courierMe(uid) { const c = await this.courierOf(uid); return c ? { id: c.id, name: c.name, credit: c.credit !== false } : null; }
  async crOut(c) {
    const o = crPub(c);
    const fresh = c.tok && Date.now() - (Number(c.tokAt) || 0) < CINV_MS;
    const b = fresh ? await this.botUser() : '';
    o.link = fresh && b ? 'https://t.me/' + b + '?start=c_' + this.did + '_' + c.tok : '';
    return o;
  }
  async crDetail(c) {
    const lg = (await this.st.get('cc:' + c.id)) || { rows: [] };
    return { courier: await this.crOut(c), rows: this.crRows(lg), nv: (c.nv || []).slice().reverse() };
  }
  /* Строки кассы для показа, новые сверху: последние CC_SHOW и все открытые вопросы по сдаче. Закрытие вопроса и отмена сдачи приклеены к своей строке. */
  crRows(lg) {
    const now = Date.now(), all = lg.rows;
    const hr = new Map(all.filter(r => r.k === 'hr').map(r => [r.of, r])), ox = new Map(all.filter(r => r.k === 'ox').map(r => [r.of, r]));
    return all.slice(0, -CC_SHOW).filter(hOpen).concat(all.slice(-CC_SHOW)).filter(r => r.k !== 'hr').map(r => {
      const x = Object.assign({}, r);
      if (r.k === 'out' || r.k === 'ox') {
        if (hOpen(r) && r.cf === 'wait' && now - Date.parse(r.t) > CF_LATE) x.late = true;
        const h = hr.get(r.n), v = ox.get(r.n);
        if (h) x.rsl = { bn: h.bn || '', why: h.why || '', t: h.t };
        if (v) { x.vwhy = v.why || ''; x.vbn = v.bn || ''; }
      }
      return x;
    }).reverse();
  }
  /* Касса доставщика целиком: то, что видит он сам. */
  async courierCash(c) {
    const lg = (await this.st.get('cc:' + c.id)) || { rows: [] };
    return { cash: Number(c.cash) || 0, lim: Number(c.lim) || 0, dl: crDl(c), cs: c.cs || '', late: crLate(c, Date.now()), hf: crHf(c, Date.now()), ask: crAsk(c), rows: this.crRows(lg), nv: (c.nv || []).slice().reverse() };
  }
  /* Дописывает строки в кассу доставщика и меняет остаток. Сам ничего не сохраняет: вызывающий кладёт put вместе со своими правками. */
  async crAdd(c, adds) {
    const lg = (await this.st.get('cc:' + c.id)) || { rows: [], seq: 0 };
    const now = new Date().toISOString();
    adds.forEach(a => { lg.seq += 1; lg.rows.push(Object.assign({ n: lg.seq, t: now }, a)); c.cash = (Number(c.cash) || 0) + a.d; });
    return crSave(c, lg);
  }
  /* Что видит доставщик: заказы на доставку, готовые к выезду (свободные и свои), и свои выданные сегодня. */
  async courierOrders(cour) {
    const act = (await this.st.get('act')) || [], hist = ((await this.st.get('hist')) || []).slice(0, 60);
    const del = (await this.getOrders(act)).filter(o => o.mode === 'delivery');
    const today = dayOf(new Date().toISOString());
    const done = (await this.getOrders(hist)).filter(o => o.status === 'done' && o.mode === 'delivery' && o.cr === cour.id && dayOf(o.statusAt) === today);
    const list = del.filter(o => o.status === 'ready').concat(done);
    const heads = await this.getMany([...new Set(list.map(o => o.uid).filter(Boolean))].map(u => 'lh:' + u));
    const orders = list.map(o => {
      const x = this.cview(o, cour);
      const h = o.status === 'ready' && o.uid ? heads.get('lh:' + o.uid) : null;
      if (h && h.bal > 0) { const d = lgDue(h.open, today); x.debt = { bal: h.bal, over: d.over, days: d.days, due: d.due, uid: o.uid }; }
      return x;
    });
    return { orders, soon: del.filter(o => o.status === 'accepted').length, cash: Number(cour.cash) || 0, lim: Number(cour.lim) || 0, nvn: (cour.nv || []).length, dl: crDl(cour), late: crLate(cour, Date.now()), hf: crHf(cour, Date.now()), ask: crAsk(cour) };
  }
  cview(o, cour) { const x = adminOrder(o); x.mine = o.cr === cour.id; return x; }
  async courierTake(cour, id) {
    const o = await this.st.get('o:' + id);
    if (!o) return { err: 'not_found' };
    if (o.mode !== 'delivery' || o.status !== 'ready') return { err: 'bad_transition', order: o };
    if (o.cr === cour.id) return { order: o, same: true };
    if (o.cr) return { err: 'taken', order: o };
    // наличных на руках больше лимита или не сверено слишком много безнала: сначала сдать деньги
    if (cour.lim > 0 && (Number(cour.cash) || 0) >= cour.lim) return { err: 'cash_limit', order: o, cash: Number(cour.cash) || 0, lim: cour.lim };
    if ((cour.nv || []).length >= NV_MAX) return { err: 'nv_full', order: o };
    // деньги не сданы в срок: сначала сдать
    const late = crLate(cour, Date.now());
    if (late > 0) return { err: 'cash_late', order: o, cash: Number(cour.cash) || 0, late };
    o.cr = cour.id; o.crn = cour.name; o.crAt = new Date().toISOString();
    if (cour.phone) o.crp = cour.phone;
    await this.st.put('o:' + id, o);
    return { order: o, changed: true };
  }
  async courierRelease(cour, id) {
    const o = await this.st.get('o:' + id);
    if (!o) return { err: 'not_found' };
    if (o.cr !== cour.id || o.status !== 'ready') return { err: 'not_yours', order: o };
    delete o.cr; delete o.crn; delete o.crAt; delete o.crp;
    await this.st.put('o:' + id, o);
    return { order: o, changed: true };
  }
  /* Заказ взяли: карточки продавцов и сообщения других доставщиков обновляются, клиент узнаёт, кто везёт. */
  async afterTake(o) {
    const cfg = await this.getCfg();
    await this.afterChange(o, null);
    for (const m of o.cm || []) {
      const card = courierCard(o, cfg.shop, this.origin, this.did, m.cid === o.cr ? 'mine' : o.crn);
      await this.editCard(m, card);
    }
    await this.tg('sendMessage', { chat_id: o.uid, text: customerText(o, 'taken', cfg.shop), reply_markup: openBtn(this.origin, o.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы', this.origin + '/?v=mine') });
  }
  /* Заказ вернули в свободные: сообщения доставщиков снова с кнопкой «Взял», продавцы видят, что доставщика нет. */
  async afterRelease(o, byId) {
    const cfg = await this.getCfg();
    await this.afterChange(o, null);
    for (const m of o.cm || []) await this.editCard(m, courierCard(o, cfg.shop, this.origin, this.did, null));
    await this.notifyCouriers(o, cfg, byId, true);
  }
  /* Готовый заказ на доставку приходит всем доставщикам с кнопкой «Взял»; номера сообщений запоминаются, чтобы потом обновить. */
  async notifyCouriers(o, cfg, except, again) {
    const list = (await this.crList()).filter(c => c.uid && c.on !== false && c.id !== except);
    if (!list.length) return;
    const sent = [];
    for (const c of list) {
      if (again && (o.cm || []).some(m => m.cid === c.id)) continue;   // у него сообщение уже есть и обновлено
      const card = courierCard(o, cfg.shop, this.origin, this.did, null);
      const t = await this.tg('sendMessage', { chat_id: c.uid, text: card.text, reply_markup: card.reply_markup });
      if (t.ok && t.result) sent.push({ chat_id: c.uid, message_id: t.result.message_id, cid: c.id });
    }
    if (sent.length) {
      const cur = await this.st.get('o:' + o.id);
      if (cur) { cur.cm = (cur.cm || []).concat(sent); await this.st.put('o:' + o.id, cur); }
    }
  }
  /* Нажатие «Взял» под сообщением в чате доставщика. */
  async onCourierCb(cq, p, answer) {
    const cour = cq.from ? await this.courierOf(cq.from.id) : null;
    if (!cour) return answer('Нет доступа', true);
    const cfg = await this.getCfg();
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const res = await this.courierTake(cour, p.id);
    if (res.err === 'not_found') return answer('Заказ не найден', true);
    if (res.err === 'taken') {
      if (here) await this.editCard(here, courierCard(res.order, cfg.shop, this.origin, this.did, res.order.crn));
      return answer('Заказ уже взял ' + res.order.crn, true);
    }
    if (res.err === 'cash_limit') return answer('Сначала сдайте деньги продавцу: на руках ' + money(res.cash) + ', лимит ' + money(res.lim), true);
    if (res.err === 'nv_full') return answer('Сначала покажите продавцу оплаты картой и переводом на сверку', true);
    if (res.err === 'cash_late') return answer('Сначала сдайте деньги продавцу: на руках ' + money(res.cash) + ', просрочка ' + res.late + ' дн.', true);
    if (res.err) return answer('Этот заказ уже не ждёт доставки', true);
    if (res.changed) await this.afterTake(res.order);
    else if (here) await this.editCard(here, courierCard(res.order, cfg.shop, this.origin, this.did, 'mine'));
    return answer('Вы взяли заказ ' + p.id);
  }
  /* API доставщика: заказы, «Взял», выдача с оплатой, должники, касса. */
  async courierApi(request, path, method, u, cour) {
    const uid = u.id;
    if (path === '/api/courier/orders' && method === 'GET') return json(await this.courierOrders(cour));
    if (path === '/api/courier/cash' && method === 'GET') return json(await this.courierCash(cour));
    // ответ доставщика в приложении на «Продавец записал сдачу»: то же, что кнопки в Telegram
    if (path === '/api/courier/confirm' && method === 'POST') {
      const r = await this.readBody(request, 500);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const n = Number(r.body.n), res = Number.isInteger(n) ? await this.handConfirm(cour, n, !!r.body.ok) : { err: 'not_found' };
      if (res.err) return json({ error: res.err }, res.err === 'not_found' ? 404 : 409);
      if (res.changed && !r.body.ok) await this.handDisputeNotify(cour, res.row);
      return json(await this.courierCash(cour));
    }
    if (path === '/api/courier/debts' && method === 'GET') return json(await this.debtList());
    const dm = path.match(/^\/api\/courier\/debts\/(\d{1,15})(?:\/(pay|remind))?$/);
    if (dm) {
      const duid = Number(dm[1]);
      if (!dm[2] && method === 'GET') return await this.debtOne(duid);
      if (dm[2] && method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
        return await this.debtAct(duid, dm[2], r.body, u, cour);
      }
    }
    const om = path.match(/^\/api\/courier\/(take|release|done)$/);
    if (om && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const id = String(r.body.id || '');
      if (om[1] === 'take') {
        const res = await this.courierTake(cour, id);
        if (res.err) return json({ error: res.err, order: res.order ? this.cview(res.order, cour) : undefined, cash: res.cash, lim: res.lim, late: res.late }, res.err === 'not_found' ? 404 : 409);
        if (res.changed) await this.afterTake(res.order);
        return json({ order: this.cview(res.order, cour) });
      }
      if (om[1] === 'release') {
        const res = await this.courierRelease(cour, id);
        if (res.err) return json({ error: res.err, order: res.order ? this.cview(res.order, cour) : undefined }, res.err === 'not_found' ? 404 : 409);
        await this.afterRelease(res.order, cour.id);
        return json({ order: this.cview(res.order, cour) });
      }
      const pay = r.body.pay;
      if (pay && typeof pay === 'object' && pay.m === 'credit' && cour.credit === false) return json({ error: 'no_credit' }, 403);
      const res = await this.changeStatus(id, 'done', pay, cour, { id: uid, name: whoName(u) });
      if (!res.err && res.same && res.order.cr !== cour.id) res.err = 'not_yours';
      if (res.err) return json({ error: res.err, order: res.order ? this.cview(res.order, cour) : undefined }, res.err === 'not_found' ? 404 : res.err === 'bad_pay' ? 400 : res.err === 'not_yours' ? 403 : 409);
      if (res.changed) { await this.afterChange(res.order, 'admin'); if (res.ask) await this.askConfirm(res.ask.uid, res.ask.n); }
      const c = await this.crGet(cour.id);
      return json({ order: this.cview(res.order, cour), cash: c ? Number(c.cash) || 0 : 0 });
    }
    return json({ error: 'not_found' }, 404);
  }
  /* Управление доставщиками (продавец): список, приглашение ссылкой, правка, сдача денег, удаление. */
  async adminCouriers(request, path, method, uid, u) {
    if (path === '/api/admin/couriers') {
      if (method === 'GET') return json({ couriers: await Promise.all((await this.crList()).map(c => this.crOut(c))) });
      if (method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
        const name = cleanStr(r.body.name, 40), phone = cleanStr(r.body.phone || '', 25);
        if (name.length < 2) return json({ error: 'bad_name' }, 400);
        if (phone && !phoneOk(phone)) return json({ error: 'bad_phone' }, 400);
        const idx = (await this.st.get('crx')) || [];
        if (idx.length >= MAX_COURIERS) return json({ error: 'too_many' }, 409);
        let id;
        do { id = 'k' + randId(5).toLowerCase(); } while (idx.includes(id));
        const c = { id, name, phone, uid: 0, on: true, credit: true, cash: 0, since: new Date().toISOString(), tok: randId(8).toLowerCase(), tokAt: Date.now() };
        await this.st.put({ ['cr:' + id]: c, crx: idx.concat([id]), ['ct:' + c.tok]: id });
        return json({ courier: await this.crOut(c) });
      }
      return json({ error: 'not_found' }, 404);
    }
    const m = path.match(/^\/api\/admin\/couriers\/(k[a-z0-9]{3,9})(?:\/(link|handover|verify|hresolve|hvoid))?$/);
    if (!m) return json({ error: 'not_found' }, 404);
    const c = await this.crGet(m[1]), sub = m[2];
    if (!c) return json({ error: 'not_found' }, 404);
    if (!sub && method === 'GET') return json(await this.crDetail(c));
    if (!sub && method === 'PUT') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const b = r.body;
      if (b.name !== undefined) { c.name = cleanStr(b.name, 40); if (c.name.length < 2) return json({ error: 'bad_name' }, 400); }
      if (b.phone !== undefined) { c.phone = cleanStr(b.phone, 25); if (c.phone && !phoneOk(c.phone)) return json({ error: 'bad_phone' }, 400); }
      if (b.credit !== undefined) c.credit = b.credit !== false;
      if (b.on !== undefined) c.on = b.on !== false;
      if (b.lim !== undefined) {
        const lim = b.lim === null || b.lim === '' ? 0 : Number(b.lim);
        if (!Number.isInteger(lim) || lim < 0 || lim > MAX_PAY) return json({ error: 'bad_lim' }, 400);
        c.lim = lim;
      }
      if (b.dl !== undefined) {
        if (typeof b.dl !== 'number' || !Number.isInteger(b.dl) || b.dl < -1 || b.dl > DL_MAX) return json({ error: 'bad_dl' }, 400);
        c.dl = b.dl;
      }
      await this.st.put('cr:' + c.id, c);
      return json(await this.crDetail(c));
    }
    if (!sub && method === 'DELETE') {
      if ((Number(c.cash) || 0) !== 0) return json({ error: 'has_cash', cash: Number(c.cash) || 0 }, 409);
      if ((c.nv || []).length) return json({ error: 'has_nv', n: c.nv.length }, 409);
      if (crHf(c, Date.now()) > 0 || (c.hwt || []).length) return json({ error: 'has_hq' }, 409);
      const upd = {}, del = ['cr:' + c.id, 'cc:' + c.id];
      if (c.uid) del.push('cru:' + c.uid);
      if (c.tok) del.push('ct:' + c.tok);
      // заказы, которые он вёз, снова свободны
      for (const o of await this.getOrders((await this.st.get('act')) || [])) {
        if (o.cr === c.id) { delete o.cr; delete o.crn; delete o.crAt; delete o.crp; upd['o:' + o.id] = o; }
      }
      upd.crx = ((await this.st.get('crx')) || []).filter(x => x !== c.id);
      await this.st.put(upd);
      await this.st.delete(del);
      return json({ ok: true });
    }
    if (sub === 'link' && method === 'POST') {
      if (c.tok) await this.st.delete('ct:' + c.tok);
      c.tok = randId(8).toLowerCase(); c.tokAt = Date.now();
      await this.st.put({ ['cr:' + c.id]: c, ['ct:' + c.tok]: c.id });
      return json({ courier: await this.crOut(c) });
    }
    // «Деньги пришли»: продавец сверил оплату картой или переводом, принятую доставщиком, с банком
    if (sub === 'verify' && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const e = (c.nv || []).find(x => x.id === Number(r.body.id));
      if (!e) return json({ error: 'not_found' }, 404);
      c.nv = c.nv.filter(x => x !== e);
      const put = await this.crAdd(c, [{ k: 'vr', d: 0, a: e.a, m: e.m, du: e.uid, o: e.o, nm: e.nm, by: uid }]);
      if (e.uid && e.n) {
        const { lg, lh } = await this.lgLoad(e.uid), row = lg.rows.find(x => x.n === e.n);
        if (row && lh) { row.vr = 'ok'; row.vrt = new Date().toISOString(); row.vb = whoName(u); Object.assign(put, (await this.lgSave(e.uid, lg, lh)).put); }
      }
      await this.st.put(put);
      return json(await this.crDetail(c));
    }
    if (sub === 'handover' && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const amount = Number(r.body.amount);
      if (!Number.isInteger(amount) || amount < 1 || amount > (Number(c.cash) || 0)) return json({ error: 'bad_amount', cash: Number(c.cash) || 0 }, 400);
      // доставщик подтверждает сдачу в Telegram; без привязки к Telegram подтверждать некому
      const row = { k: 'out', d: -amount, a: amount, by: uid, bn: whoName(u), left: (Number(c.cash) || 0) - amount };
      if (c.uid) row.cf = 'wait';
      const put = await this.crAdd(c, [row]);
      await this.st.put(put);
      if (c.uid) await this.askHandover(c.id, put['cc:' + c.id].seq);
      return json(await this.crDetail(await this.crGet(c.id)));
    }
    if ((sub === 'hresolve' || sub === 'hvoid') && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      return await this.handAct(c, sub === 'hvoid' ? 'void' : 'resolve', r.body, u);
    }
    return json({ error: 'not_found' }, 404);
  }

  /* --- журнал расчётов с магазинами (долги) --- */
  async lgLoad(uid) {
    const lg = await this.st.get('lg:' + uid), lh = await this.st.get('lh:' + uid);
    return { lg: lg && Array.isArray(lg.rows) ? lg : { rows: [], base: null, seq: 0 }, lh: lh && typeof lh === 'object' ? lh : null };
  }
  /* Дописывает записи в журнал магазина и считает новый заголовок. Сам ничего не сохраняет: вызывающий кладёт put одной операцией вместе со своими правками. */
  async lgAdd(uid, adds, snap) {
    const { lg, lh } = await this.lgLoad(uid);
    const now = new Date().toISOString(), ns = [];
    adds.forEach(a => { lg.seq += 1; ns.push(lg.seq); lg.rows.push(Object.assign({ n: lg.seq, t: now }, a)); });
    // записи одного заказа подтверждаются магазином вместе
    if (ns.length > 1) lg.rows.slice(-ns.length).forEach(r => { r.g = ns[0]; });
    const res = await this.lgSave(uid, lg, lh, snap, now);
    res.ns = ns;
    return res;
  }
  /* Пересчитывает заголовок долга и список должников по журналу. now — время новой записи; без него заголовок только пересчитывается (подтверждение, закрытие спора). */
  async lgSave(uid, lg, lh, snap, now) {
    const f = lgFold(lg.rows, lg.base);
    lg.rows = f.rows; lg.base = f.base;
    const st = lgState(lg.rows, lg.base), pd = lgPend(lg.rows);
    const hdr = Object.assign({ uid, name: '', org: '', phone: '', lang: '', rem: 0 }, lh || {}, snap || {}, { bal: st.bal, open: st.open, fl: pd.fl, na: pd.na, cwt: pd.cwt, upd: now || (lh && lh.upd) || new Date().toISOString() });
    const idx = (await this.st.get('dbi')) || [];
    const has = idx.includes(uid), need = st.bal !== 0 || pd.fl > 0 || pd.cwt.length > 0;
    const put = { ['lg:' + uid]: lg, ['lh:' + uid]: hdr };
    if (need && !has) put.dbi = idx.concat([uid]);
    else if (!need && has) put.dbi = idx.filter(x => x !== uid);
    return { put, hdr };
  }
  /* Список магазинов с долгом: просроченные сверху, потом по ближайшему сроку. Переплата (аванс) уходит в конец. */
  async debtList() {
    const idx = (await this.st.get('dbi')) || [];
    const map = await this.getMany(idx.map(u => 'lh:' + u));
    const today = dayOf(new Date().toISOString());
    const list = idx.map(u => map.get('lh:' + u)).filter(h => h && (h.bal !== 0 || lgFlags(h, Date.now()) > 0 || (h.cwt || []).length)).map(h => debtRow(h, today));
    list.sort((a, b) => ((b.fl > 0) - (a.fl > 0)) || ((a.bal < 0) - (b.bal < 0)) || (b.days - a.days) || (a.due || '9').localeCompare(b.due || '9') || b.bal - a.bal);
    const owing = list.filter(x => x.bal > 0);
    return { debtors: list, total: owing.reduce((t, x) => t + x.bal, 0), overdue: owing.reduce((t, x) => t + x.over, 0), n: owing.length, late: owing.filter(x => x.days > 0).length, fl: list.reduce((t, x) => t + x.fl, 0), morning: (await this.st.get('mrn')) !== 0 };
  }
  /* Утреннее напоминание продавцам. Вызывается площадкой по расписанию. Молчит, если выключено, уже было сегодня или просрочки нет. */
  async morning(origin) {
    if (!this.env.BOT_TOKEN) return { sent: 0, why: 'no_token' };
    if (/^https:\/\/(?!internal)/.test(origin || '')) this.origin = origin;
    if ((await this.st.get('mrn')) === 0) return { sent: 0, why: 'off' };
    const day = dayOf(new Date().toISOString());
    if ((await this.st.get('mrd')) === day) return { sent: 0, why: 'done' };
    const dl = await this.debtList();
    const late = dl.debtors.filter(x => x.bal > 0 && x.days > 0).sort((a, b) => b.days - a.days || b.over - a.over);
    if (!late.length) return { sent: 0, why: 'none' };
    await this.st.put('mrd', day);      // отметка до отправки: повторный запуск в тот же день не задвоит сообщения
    const text = morningText((await this.getCfg()).shop.name, late);
    const markup = this.origin ? openBtn(this.origin, 'Долги', sellerUrl(this.origin, this.did)) : undefined;
    let sent = 0;
    for (const aid of (await this.st.get('admins')) || []) {
      try { const r = await this.tg('sendMessage', Object.assign({ chat_id: aid, text }, markup ? { reply_markup: markup } : {})); if (r && r.ok) sent++; }
      catch (e) { console.error('morning failed', e && e.message || e); }
    }
    return { sent, n: late.length };
  }
  /* Состав заказов, по которым числится долг. Берётся из самих заказов; если заказа уже нет, номер остаётся без состава. */
  async debtOrders(refs) {
    const ids = [...new Set(refs.filter(r => typeof r === 'string' && /^Z-[A-Z0-9]{3,12}$/.test(r)))].slice(0, DEBT_ORD_MAX);
    const map = await this.getMany(ids.map(r => 'o:' + r));
    const out = {};
    ids.forEach(r => {
      const o = map.get('o:' + r);
      if (!o || typeof o !== 'object') return;
      out[r] = { id: r, at: o.createdAt, total: Number(o.total) || 0, fee: Number(o.fee) || 0, disc: Number(o.disc) || 0, sub: Number(o.sub) || 0, items: Array.isArray(o.items) ? o.items : [] };
    });
    return out;
  }
  async debtOne(uid) {
    const { lg, lh } = await this.lgLoad(uid);
    if (!lh) return json({ error: 'not_found' }, 404);
    const voided = new Set(lg.rows.filter(r => r.k === 'rv').map(r => r.of));
    const rsl = new Map(lg.rows.filter(r => r.k === 'rs').map(r => [r.of, r]));
    const now = Date.now();
    const rows = lg.rows.filter(r => r.k !== 'rs').slice(-LG_SHOW).reverse().map(r => {
      const x = voided.has(r.n) ? Object.assign({}, r, { void: true }) : Object.assign({}, r);
      const z = rsl.get(r.n);
      if (z) x.rsl = { bn: z.bn || '', why: z.why || '', t: z.t };
      else if (r.cf === 'wait' && !x.void && now - Date.parse(r.t) > CF_LATE) x.late = true;
      return x;
    });
    const ords = await this.debtOrders((lh.open || []).map(q => q.ref).concat(rows.filter(r => r.k === 'ch').map(r => r.ref)));
    return json({ debt: Object.assign(debtRow(lh, dayOf(new Date().toISOString())), { open: lh.open, rows, ords, more: lg.rows.length > LG_SHOW || !!lg.base, rem: lh.rem || 0 }) });
  }
  /* То, что видит сам магазин в «Мой долг»: без заметок продавца и служебных полей. Без full только суммы и сроки. Нет долга — null. */
  async myDebt(uid, full) {
    const { lg, lh } = await this.lgLoad(uid);
    const ask = lh ? (lh.cwt || []).length + (lh.fl || 0) : 0;
    if (!lh || (!(lh.bal > 0) && !ask)) return null;
    const d = debtRow(lh, dayOf(new Date().toISOString()));
    const out = { bal: Math.max(0, d.bal), due: d.due, over: d.over, days: d.days, ask: (lh.cwt || []).length + (lh.na || 0) };
    if (!full) return out;
    const voided = new Map(lg.rows.filter(r => r.k === 'rv').map(r => [r.of, r]));
    const rsl = new Map(lg.rows.filter(r => r.k === 'rs').map(r => [r.of, r]));
    const rows = lg.rows.filter(r => r.k !== 'rv' && r.k !== 'rs').slice(-LG_SHOW).reverse().map(r => {
      const x = { n: r.n, g: r.g || r.n, t: r.t, k: r.k, a: r.a };
      if (r.k === 'pay') { x.m = r.m; if (voided.has(r.n)) { x.void = true; x.vwhy = voided.get(r.n).why || ''; } }
      else if (r.k === 'ac') { x.f = r.f || ''; x.e = r.e || ''; x.cb = Number(r.cb) || 0; }
      else { x.ref = r.ref || ''; x.due = r.due || ''; }
      if (r.cf) { x.cf = r.cf; x.bn = r.bn || ''; }
      const z = rsl.get(r.n);
      if (z) x.rsl = { bn: z.bn || '', why: z.why || '' };
      return x;
    });
    const open = Array.isArray(lh.open) ? lh.open : [];
    const shop = (await this.getCfg()).shop;
    return Object.assign(out, {
      open, rows, more: lg.rows.length > LG_SHOW || !!lg.base,
      ords: await this.debtOrders(open.map(q => q.ref).concat(rows.filter(r => r.k === 'ch').map(r => r.ref))),
      contact: { telegram: shop.telegram || '', phone: shop.phone || '' }
    });
  }
  /* Все продавцы дистрибьютора получают короткое сообщение с кнопкой в приложение. */
  async notifyAdmins(text, label) {
    if (!this.env.BOT_TOKEN) return;
    for (const aid of (await this.st.get('admins')) || []) {
      try { await this.tg('sendMessage', { chat_id: aid, text, reply_markup: openBtn(this.origin, label || 'Долги', sellerUrl(this.origin, this.did)) }); }
      catch (e) { console.error('admin notify failed', e && e.message || e); }
    }
  }
  /* Магазин просят подтвердить запись: выдачу в долг или принятую оплату. n — номер записи (или первой записи заказа).
     Не удалось отправить в Telegram — запись сразу помечается «магазин не получил», продавец видит её среди спорных. */
  async askConfirm(uid, n) {
    if (!this.env.BOT_TOKEN) return;
    try {
      const { lg, lh } = await this.lgLoad(uid);
      const rows = lg.rows.filter(r => (r.g || r.n) === n && (r.k === 'ch' || r.k === 'pay'));
      if (!rows.length || !lh) return;
      const text = confirmText(lh, rows, (await this.getCfg()).shop), px = cbPrefix(this.did), uz = lh.lang === 'uz';
      const kb = openBtn(this.origin, uz ? 'Mening qarzim' : 'Мой долг', this.origin + '/?v=debt').inline_keyboard;
      const r = await this.tg('sendMessage', { chat_id: uid, text, reply_markup: { inline_keyboard: [[
        { text: uz ? '✅ Toʻgʻri' : '✅ Верно', callback_data: 'q:' + px + n + ':y' }, { text: uz ? '❌ Notoʻgʻri' : '❌ Не так', callback_data: 'q:' + px + n + ':n' }
      ]].concat(kb) } });
      if (r && r.ok) return;
      const cur = await this.lgLoad(uid), now = new Date().toISOString();
      let hit = false;
      cur.lg.rows.forEach(x => { if ((x.g || x.n) === n && x.cf === 'wait') { x.cf = 'na'; x.cft = now; hit = true; } });
      if (hit) await this.st.put((await this.lgSave(uid, cur.lg, cur.lh)).put);
    } catch (e) { console.error('confirm ask failed', e && e.message || e); }
  }
  /* Магазин ответил на вопрос «Всё верно?». ok — «Верно», иначе «Не так». «Верно» окончательно; «Не так» магазин ещё может изменить на «Верно». */
  async confirmRow(uid, n, ok) {
    const { lg, lh } = await this.lgLoad(uid);
    const grp = lh ? lg.rows.filter(r => (r.g || r.n) === n && isCf(r) && r.cf) : [];
    if (!grp.length) return { err: 'not_found' };
    const has = (k, r) => lg.rows.some(z => z.k === k && z.of === r.n);
    const live = grp.filter(r => !has('rv', r));
    if (!live.length) return { err: 'void', hdr: lh };
    if (live.some(r => r.cf === 'ok')) return { err: 'final', hdr: lh, rows: live };
    if (!ok && live.some(r => has('rs', r))) return { err: 'resolved', hdr: lh };
    const to = ok ? 'ok' : 'no';
    let hdr = lh;
    const changed = live.some(r => r.cf !== to);
    if (changed) {
      const now = new Date().toISOString();
      live.forEach(r => { r.cf = to; r.cft = now; });
      const sv = await this.lgSave(uid, lg, lh);
      await this.st.put(sv.put);
      hdr = sv.hdr;
    }
    return { rows: live, hdr, changed };
  }
  /* Магазин отметил запись «Не так»: продавцы и доставщик, который её принял, узнают сразу. */
  async disputeNotify(uid, rows, hdr) {
    if (!this.env.BOT_TOKEN) return;
    const who = hdr.name || hdr.org || 'Магазин', bn = (rows.find(r => r.bn) || {}).bn || '';
    const text = '⚠️ ' + who + ' отметил запись «Не так»: ' + rowDesc(rows) + (bn ? '. Записал: ' + bn : '') + '.';
    await this.notifyAdmins(text + '\nОткройте «Долги» и разберитесь с магазином.');
    const cid = (rows.find(r => r.cid) || {}).cid, c = cid ? await this.crGet(cid) : null;
    if (c && c.uid) {
      try { await this.tg('sendMessage', { chat_id: c.uid, text }); } catch (e) { console.error('dispute courier notify failed', e && e.message || e); }
    }
  }
  /* Что видит сам магазин при ответе «Верно» или «Не так»: текст сообщения и кнопки после ответа. */
  confirmEdit(text, hdr, to, px, n) {
    setLang(hdr.lang === 'uz' ? 'uz' : 'ru');
    const base = String(text || '').replace(/\n\n(✅|❌) [^\n]*$/, '');
    const kb = openBtn(this.origin, L('Мой долг', 'Mening qarzim'), this.origin + '/?v=debt').inline_keyboard;
    if (to === 'ok') return { text: base + '\n\n' + L('✅ Вы подтвердили. Спасибо!', '✅ Tasdiqladingiz. Rahmat!'), reply_markup: { inline_keyboard: kb } };
    return { text: base + '\n\n' + L('❌ Вы отметили «Не так». Продавец увидит это.', '❌ «Notoʻgʻri» deb belgiladingiz. Sotuvchi buni koʻradi.'),
      reply_markup: { inline_keyboard: [[{ text: L('✅ Всё-таки верно', '✅ Baribir toʻgʻri'), callback_data: 'q:' + px + n + ':y' }]].concat(kb) } };
  }
  /* Нажатие «Верно» / «Не так» под сообщением магазину. Отвечать может только сам магазин. */
  async onConfirmCb(cq, p, answer) {
    const uid = cq.from && cq.from.id, n = Number(p.id);
    if (!uid || !Number.isInteger(n) || (p.to !== 'y' && p.to !== 'n')) return answer('');
    const ok = p.to === 'y';
    const res = await this.confirmRow(uid, n, ok);
    if (res.err === 'not_found') return answer('Запись не найдена', true);
    const hdr = res.hdr || {};
    setLang(hdr.lang === 'uz' ? 'uz' : 'ru');
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const px = cbPrefix(this.did);
    if (res.err === 'void') return answer(L('Эта запись уже отменена продавцом', 'Bu yozuv sotuvchi tomonidan bekor qilingan'), true);
    if (res.err === 'resolved') return answer(L('Продавец уже закрыл этот вопрос. Если не согласны, напишите ему.', 'Sotuvchi bu masalani yopgan. Rozi boʻlmasangiz, unga yozing.'), true);
    if (res.err === 'final') {
      if (here) await this.editCard(here, this.confirmEdit(cq.message.text, hdr, 'ok', px, n));
      return answer(L('Вы уже подтвердили эту запись', 'Bu yozuvni allaqachon tasdiqlagansiz'), true);
    }
    if (here) await this.editCard(here, this.confirmEdit(cq.message.text, hdr, ok ? 'ok' : 'no', px, n));
    if (res.changed && !ok) await this.disputeNotify(uid, res.rows, hdr);
    return answer(ok ? L('Спасибо, подтверждено', 'Rahmat, tasdiqlandi') : L('Отмечено «Не так». Продавец увидит.', '«Notoʻgʻri» deb belgilandi'));
  }
  /* Спорные записи: магазин ответил «Не так», сообщение не дошло или магазин молчит больше суток. Не закрытые и не отменённые. */
  async disputes() {
    const idx = (await this.st.get('dbi')) || [], now = Date.now();
    const map = await this.getMany(idx.map(u => 'lh:' + u));
    const cand = idx.map(u => map.get('lh:' + u)).filter(h => h && lgFlags(h, now) > 0).slice(0, 60);
    const out = [];
    for (const h of cand) {
      const { lg } = await this.lgLoad(h.uid);
      const gone = new Set(lg.rows.filter(r => r.k === 'rv' || r.k === 'rs').map(r => r.of)), seen = new Set();
      for (const r of lg.rows) {
        if (!isCf(r) || !r.cf || r.cf === 'ok' || gone.has(r.n)) continue;
        if (r.cf === 'wait' && now - Date.parse(r.t) <= CF_LATE) continue;
        const g = r.g || r.n;
        if (seen.has(g)) continue;
        seen.add(g);
        out.push(Object.assign({ uid: h.uid, name: h.name || '', org: h.org || '', phone: h.phone || '', n: r.n, k: r.k, a: r.a, m: r.m || '', ref: r.ref || '', t: r.t, bn: r.bn || '', cf: r.cf === 'wait' ? 'late' : r.cf, cft: r.cft || '' }, r.k === 'ac' ? { f: r.f || '', e: r.e || '', cb: Number(r.cb) || 0 } : {}));
      }
    }
    // сдача денег доставщиками: вопросы без ответа и доставщики с просроченной сдачей
    for (const c of await this.crList()) {
      const late = crLate(c, now);
      if (late > 0) out.push({ h: 2, cid: c.id, cn: c.name, late, a: Number(c.cash) || 0, t: c.cs });
      if (crHf(c, now) < 1) continue;
      const lg = (await this.st.get('cc:' + c.id)) || { rows: [] };
      for (const r of lg.rows) {
        if (!hOpen(r) || (r.cf === 'wait' && now - Date.parse(r.t) <= CF_LATE)) continue;
        out.push({ h: 1, cid: c.id, cn: c.name, n: r.n, k: r.k, a: r.a, t: r.t, bn: r.bn || '', why: r.why || '', cf: r.cf === 'wait' ? 'late' : r.cf, cft: r.cft || '' });
      }
    }
    out.sort((a, b) => String(b.t).localeCompare(String(a.t)));
    return out.slice(0, 100);
  }
  /* Доставщика просят подтвердить запись продавца о сдаче денег (или об отмене сдачи). Не дошло в Telegram — запись сразу «доставщик не получил». */
  async askHandover(cid, n) {
    if (!this.env.BOT_TOKEN) return;
    try {
      const c = await this.crGet(cid), lg = c ? await this.st.get('cc:' + cid) : null;
      const row = lg && lg.rows.find(r => r.n === n && (r.k === 'out' || r.k === 'ox'));
      if (!c || !c.uid || !row || row.cf !== 'wait') return;
      const px = cbPrefix(this.did);
      const r = await this.tg('sendMessage', { chat_id: c.uid, text: handText(row), reply_markup: { inline_keyboard: [[
        { text: '✅ Верно', callback_data: 'h:' + px + n + ':y' }, { text: '❌ Не так', callback_data: 'h:' + px + n + ':n' }
      ]].concat(openBtn(this.origin, 'Моя касса', courierUrl(this.origin, this.did)).inline_keyboard) } });
      if (r && r.ok) return;
      row.cf = 'na'; row.cft = new Date().toISOString();
      await this.st.put(crSave(c, lg));
    } catch (e) { console.error('handover ask failed', e && e.message || e); }
  }
  /* Доставщик ответил «Верно» / «Не так». «Верно» окончательно; «Не так» он ещё может изменить на «Верно». */
  async handConfirm(c, n, ok) {
    const lg = await this.st.get('cc:' + c.id), row = lg && lg.rows.find(r => r.n === n && (r.k === 'out' || r.k === 'ox') && r.cf);
    if (!row) return { err: 'not_found' };
    if (row.ox) return { err: 'void' };
    if (row.cf === 'ok') return { err: 'final', row };
    if (!ok && row.hr) return { err: 'resolved', row };
    const to = ok ? 'ok' : 'no', changed = row.cf !== to;
    if (changed) { row.cf = to; row.cft = new Date().toISOString(); await this.st.put(crSave(c, lg)); }
    return { row, changed };
  }
  /* Что видит сам доставщик после ответа: текст сообщения и кнопки. */
  handEdit(text, to, px, n) {
    const base = String(text || '').replace(/\n\n(✅|❌) [^\n]*$/, '');
    const kb = openBtn(this.origin, 'Моя касса', courierUrl(this.origin, this.did)).inline_keyboard;
    if (to === 'ok') return { text: base + '\n\n✅ Вы подтвердили. Спасибо!', reply_markup: { inline_keyboard: kb } };
    return { text: base + '\n\n❌ Вы отметили «Не так». Продавец увидит это.', reply_markup: { inline_keyboard: [[{ text: '✅ Всё-таки верно', callback_data: 'h:' + px + n + ':y' }]].concat(kb) } };
  }
  /* Доставщик отметил сдачу «Не так»: продавцы узнают сразу. */
  async handDisputeNotify(c, row) {
    await this.notifyAdmins('⚠️ Доставщик ' + c.name + ' отметил «Не так»: ' + handDesc(row) + (row.bn ? '. Записал: ' + row.bn : '') + '.\nОткройте «Доставка» и разберитесь с доставщиком.', 'Доставка');
  }
  /* Нажатие «Верно» / «Не так» под сообщением доставщику. Отвечать может только сам доставщик. */
  async onHandCb(cq, p, answer) {
    const uid = cq.from && cq.from.id, n = Number(p.id);
    if (!uid || !Number.isInteger(n) || (p.to !== 'y' && p.to !== 'n')) return answer('');
    const id = await this.st.get('cru:' + uid), c = id ? await this.crGet(id) : null;
    if (!c || c.uid !== uid) return answer('Нет доступа', true);
    const ok = p.to === 'y', res = await this.handConfirm(c, n, ok);
    if (res.err === 'not_found') return answer('Запись не найдена', true);
    if (res.err === 'void') return answer('Эта запись уже отменена продавцом', true);
    if (res.err === 'resolved') return answer('Продавец уже закрыл этот вопрос. Если не согласны, напишите ему.', true);
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const px = cbPrefix(this.did);
    if (res.err === 'final') {
      if (here) await this.editCard(here, this.handEdit(cq.message.text, 'ok', px, n));
      return answer('Вы уже подтвердили эту запись', true);
    }
    if (here) await this.editCard(here, this.handEdit(cq.message.text, ok ? 'ok' : 'no', px, n));
    if (res.changed && !ok) await this.handDisputeNotify(c, res.row);
    return answer(ok ? 'Спасибо, подтверждено' : 'Отмечено «Не так». Продавец увидит.');
  }
  /* Сдача денег доставщиком: закрыть спорную запись с комментарием или отменить запись о сдаче с причиной. u — Telegram-пользователь продавца или владельца. */
  async handAct(c, act, body, u) {
    const by = u.id, bn = whoName(u), n = Number(body.n), now = new Date().toISOString();
    const lg = (await this.st.get('cc:' + c.id)) || { rows: [], seq: 0 };
    const row = lg.rows.find(r => r.n === n && (r.k === 'out' || r.k === 'ox'));
    if (!row) return json({ error: 'not_found' }, 404);
    if (act === 'resolve') {
      const note = cleanStr(body.note || '', RES_MAX);
      if (note.length < WHY_MIN) return json({ error: 'bad_note' }, 400);
      if (!row.cf || row.cf === 'ok') return json({ error: 'not_found' }, 404);
      if (row.hr || row.ox) return json({ error: 'already' }, 409);
      if (row.cf === 'wait' && Date.now() - Date.parse(row.t) <= CF_LATE) return json({ error: 'not_flagged' }, 409);
      lg.seq += 1; row.hr = lg.seq;
      lg.rows.push({ n: lg.seq, t: now, k: 'hr', d: 0, a: 0, of: n, by, bn, why: note });
      await this.st.put(crSave(c, lg));
      if (c.uid && this.env.BOT_TOKEN) {
        try { await this.tg('sendMessage', { chat_id: c.uid, text: 'ℹ️ Продавец закрыл вопрос по записи: ' + handDesc(row) + '.\nКомментарий: ' + note, reply_markup: openBtn(this.origin, 'Моя касса', courierUrl(this.origin, this.did)) }); }
        catch (e) { console.error('hand resolve notify failed', e && e.message || e); }
      }
      return json(await this.crDetail(await this.crGet(c.id)));
    }
    // отмена записи о сдаче: только сама сдача, один раз, с причиной; деньги снова числятся на руках у доставщика
    if (row.k !== 'out') return json({ error: 'not_found' }, 404);
    if (row.ox) return json({ error: 'already' }, 409);
    const why = cleanStr(body.reason || '', WHY_MAX);
    if (why.length < WHY_MIN) return json({ error: 'bad_reason' }, 400);
    const left = (Number(c.cash) || 0) + row.a;
    lg.seq += 1; row.ox = lg.seq;
    lg.rows.push(Object.assign({ n: lg.seq, t: now, k: 'ox', d: row.a, a: row.a, of: n, by, bn, why, left }, c.uid ? { cf: 'wait' } : {}));
    c.cash = left;
    await this.st.put(crSave(c, lg));
    if (c.uid) await this.askHandover(c.id, lg.seq);
    return json(await this.crDetail(await this.crGet(c.id)));
  }
  nvAdd(c, e) { c.nvs = (Number(c.nvs) || 0) + 1; c.nv = (c.nv || []).concat([Object.assign({ id: c.nvs, t: new Date().toISOString() }, e)]); }
  /* Приём оплаты, отмена записи об оплате, закрытие спорной записи и напоминание магазину. u — пользователь Telegram, который это делает. */
  async debtAct(uid, act, body, u, cour) {
    const by = u.id, bn = whoName(u);
    const { lg, lh } = await this.lgLoad(uid);
    if (!lh) return json({ error: 'not_found' }, 404);
    const who = lh.name || lh.org || '';
    if (act === 'remind') {
      if (!(lh.bal > 0)) return json({ error: 'no_debt' }, 409);
      if (Date.now() - (Number(lh.rem) || 0) < REMIND_GAP) return json({ error: 'too_soon' }, 429);
      if (!this.env.BOT_TOKEN) return json({ error: 'server' }, 500);
      const r = await this.tg('sendMessage', { chat_id: uid, text: debtRemindText(lh, (await this.getCfg()).shop, dayOf(new Date().toISOString()), await this.debtOrders((lh.open || []).slice(0, 12).map(q => q.ref))), reply_markup: openBtn(this.origin, lh.lang === 'uz' ? 'Mening qarzim' : 'Мой долг', this.origin + '/?v=debt') });
      if (!r.ok) return json({ error: 'tg_failed' }, 502);
      lh.rem = Date.now();
      await this.st.put('lh:' + uid, lh);
      return json({ ok: true, rem: lh.rem });
    }
    if (act === 'act') {
      if (cour) return json({ error: 'forbidden' }, 403);
      if (!ACT_PER.includes(body.period)) return json({ error: 'bad_request' }, 400);
      if (!this.env.BOT_TOKEN) return json({ error: 'server' }, 500);
      const lastAct = lg.rows.filter(r => r.k === 'ac').pop();
      if (lastAct && Date.now() - Date.parse(lastAct.t) < REMIND_GAP) return json({ error: 'too_soon' }, 429);
      const ords = await this.debtOrders(lg.rows.filter(r => r.k === 'ch').map(r => r.ref)), shop = (await this.getCfg()).shop;
      // дальше без пауз: журнал читается заново, акт собирается и записывается одной операцией
      const cur = await this.lgLoad(uid);
      const built = actBuild(cur.lh, cur.lg, body.period, dayOf(new Date().toISOString()), ords, shop);
      if (built.empty) return json({ error: 'empty' }, 404);
      if (built.long) return json({ error: 'too_long' }, 413);
      // прежний акт, на который магазин не ответил, заменяется новым; ответивший остаётся в истории
      cur.lg.rows = cur.lg.rows.filter(r => !(r.k === 'ac' && (r.cf === 'wait' || r.cf === 'na')));
      const now = new Date().toISOString();
      cur.lg.seq += 1;
      const n = cur.lg.seq;
      cur.lg.rows.push({ n, t: now, k: 'ac', d: 0, a: 0, by, bn, cf: 'wait', pr: body.period, f: built.f, e: built.e, ob: built.ob, cb: built.cb });
      await this.st.put((await this.lgSave(uid, cur.lg, cur.lh, null, now)).put);
      const px = cbPrefix(this.did), uz = cur.lh.lang === 'uz';
      let sent = true;
      for (let i = 0; i < built.parts.length && sent; i++) {
        const msg = { chat_id: uid, text: built.parts[i] };
        if (i === built.parts.length - 1) msg.reply_markup = { inline_keyboard: [[
          { text: uz ? '✅ Toʻgʻri' : '✅ Верно', callback_data: 'q:' + px + n + ':y' }, { text: uz ? '❌ Notoʻgʻri' : '❌ Не так', callback_data: 'q:' + px + n + ':n' }
        ]].concat(openBtn(this.origin, uz ? 'Mening qarzim' : 'Мой долг', this.origin + '/?v=debt').inline_keyboard) };
        try { const r = await this.tg('sendMessage', msg); sent = !!(r && r.ok); } catch (e) { console.error('act send failed', e && e.message || e); sent = false; }
      }
      if (!sent) {
        // магазин акт не получил: запись в журнале не нужна, продавцу ответ об ошибке
        const fresh = await this.lgLoad(uid);
        fresh.lg.rows = fresh.lg.rows.filter(r => r.n !== n);
        await this.st.put((await this.lgSave(uid, fresh.lg, fresh.lh)).put);
        return json({ error: 'tg_failed' }, 502);
      }
      return await this.debtOne(uid);
    }
    if (act === 'pay') {
      const amount = Number(body.amount);
      if (!Number.isInteger(amount) || amount < 1 || amount > MAX_PAY || !PAY_M.includes(body.m)) return json({ error: 'bad_request' }, 400);
      if (cour) {
        // доставщик с лимитом наличных не берёт новые наличные, пока не сдаст деньги; безналичные оплаты ждут сверки продавцом
        if (body.m === 'cash' && cour.lim > 0 && (Number(cour.cash) || 0) >= cour.lim) return json({ error: 'cash_limit', cash: Number(cour.cash) || 0, lim: cour.lim }, 409);
        if (body.m === 'cash' && crLate(cour, Date.now()) > 0) return json({ error: 'cash_late', cash: Number(cour.cash) || 0, late: crLate(cour, Date.now()) }, 409);
        if (body.m !== 'cash' && (cour.nv || []).length >= NV_MAX) return json({ error: 'nv_full' }, 409);
      }
      const row = { k: 'pay', d: -amount, a: amount, m: body.m, by, bn, note: cleanStr(body.note || '', LG_NOTE), cf: 'wait' };
      if (cour) { row.cid = cour.id; if (body.m !== 'cash') row.vr = 'wait'; }
      const res = await this.lgAdd(uid, [row]);
      if (cour) {
        if (body.m === 'cash') Object.assign(res.put, await this.crAdd(cour, [{ k: 'in', d: amount, a: amount, du: uid, nm: who }]));
        else { this.nvAdd(cour, { k: 'd', a: amount, m: body.m, nm: who, uid, n: res.ns[0] }); Object.assign(res.put, await this.crAdd(cour, [{ k: 'nv', d: 0, a: amount, m: body.m, du: uid, nm: who }])); }
      }
      await this.st.put(res.put);
      await this.askConfirm(uid, res.ns[0]);
      if (cour) await this.notifyAdmins('💰 Доставщик ' + cour.name + ' принял оплату долга: ' + (who || 'магазин') + ', ' + money(amount) + ' (' + PAY_NAME2[body.m][0] + ').');
      return await this.debtOne(uid);
    }
    if (cour) return json({ error: 'forbidden' }, 403);
    const n = Number(body.n), row = lg.rows.find(r => r.n === n);
    if (act === 'resolve') {
      const note = cleanStr(body.note || '', RES_MAX);
      if (note.length < WHY_MIN) return json({ error: 'bad_note' }, 400);
      if (!row || !isCf(row) || !row.cf || row.cf === 'ok') return json({ error: 'not_found' }, 404);
      const closed = r => lg.rows.some(z => (z.k === 'rv' || z.k === 'rs') && z.of === r.n);
      if (closed(row)) return json({ error: 'already' }, 409);
      if (row.cf === 'wait' && Date.now() - Date.parse(row.t) <= CF_LATE) return json({ error: 'not_flagged' }, 409);
      const grp = lg.rows.filter(r => (r.g || r.n) === (row.g || row.n) && isCf(r) && r.cf && r.cf !== 'ok' && !closed(r));
      const res = await this.lgAdd(uid, grp.map(r => ({ k: 'rs', of: r.n, d: 0, a: 0, by, bn, why: note })));
      await this.st.put(res.put);
      if (this.env.BOT_TOKEN) {
        try {
          setLang(lh.lang === 'uz' ? 'uz' : 'ru');
          await this.tg('sendMessage', { chat_id: uid, text: L('ℹ️ Продавец закрыл вопрос по записи: ', 'ℹ️ Sotuvchi yozuv boʻyicha masalani yopdi: ') + rowDesc(grp) + '.\n' + L('Комментарий: ', 'Izoh: ') + note, reply_markup: openBtn(this.origin, L('Мой долг', 'Mening qarzim'), this.origin + '/?v=debt') });
        } catch (e) { console.error('resolve notify failed', e && e.message || e); }
      }
      return await this.debtOne(uid);
    }
    // отменить можно только запись об оплате, и один раз, с причиной; ошибочную выдачу в долг гасят оплатой
    if (!row || row.k !== 'pay') return json({ error: 'not_found' }, 404);
    if (lg.rows.some(r => r.k === 'rv' && r.of === n)) return json({ error: 'already' }, 409);
    const why = cleanStr(body.reason || '', WHY_MAX);
    if (why.length < WHY_MIN) return json({ error: 'bad_reason' }, 400);
    const res = await this.lgAdd(uid, [{ k: 'rv', of: n, d: -row.d, a: row.a, by, bn, why }]);
    // наличные, принятые доставщиком, возвращаются из его кассы; неподтверждённый безнал уходит из списка сверки
    const c = row.cid ? await this.crGet(row.cid) : null;
    if (c && row.m === 'cash') Object.assign(res.put, await this.crAdd(c, [{ k: 'rv', d: -row.a, a: row.a, du: uid, nm: who }]));
    else if (c && (c.nv || []).some(x => x.uid === uid && x.n === n)) {
      c.nv = c.nv.filter(x => !(x.uid === uid && x.n === n));
      Object.assign(res.put, await this.crAdd(c, [{ k: 'nx', d: 0, a: row.a, m: row.m, du: uid, nm: who }]));
    }
    await this.st.put(res.put);
    if (this.env.BOT_TOKEN) {
      try {
        setLang(lh.lang === 'uz' ? 'uz' : 'ru');
        await this.tg('sendMessage', { chat_id: uid, text: L('❌ Запись об оплате ' + money(row.a) + ' отменена продавцом.\nПричина: ' + why, '❌ ' + money(row.a) + ' toʻlov yozuvi sotuvchi tomonidan bekor qilindi.\nSabab: ' + why), reply_markup: openBtn(this.origin, L('Мой долг', 'Mening qarzim'), this.origin + '/?v=debt') });
        if (c && c.uid) await this.tg('sendMessage', { chat_id: c.uid, text: '❌ Продавец отменил принятую вами оплату: ' + (who || 'магазин') + ', ' + money(row.a) + '.\nПричина: ' + why });
      } catch (e) { console.error('void notify failed', e && e.message || e); }
    }
    return await this.debtOne(uid);
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
      if (text) await this.tg('sendMessage', { chat_id: o.uid, text, reply_markup: openBtn(this.origin, o.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы', this.origin + '/?v=mine') });
      if (o.status === 'ready' && o.mode === 'delivery' && !o.cr) await this.notifyCouriers(o, cfg);
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
      // сообщения («/start», «/admin КОД») разбирает площадка (Hub), сюда доходят только нажатия кнопок под заказами
      if (up && up.callback_query) await this.onCallback(up.callback_query);
    } catch (e) {
      console.error('webhook handler error', e && e.stack || e);
    }
    return json({ ok: true });
  }

  async onCallback(cq) {
    const answer = (text, alert) => this.tg('answerCallbackQuery', { callback_query_id: cq.id, text: text ? String(text).slice(0, 190) : undefined, show_alert: !!alert });
    const parsed = cbParse(cq.data);
    if (parsed.kind === 'k') return await this.onCourierCb(cq, parsed, answer);
    if (parsed.kind === 'q') return await this.onConfirmCb(cq, parsed, answer);
    if (parsed.kind === 'h') return await this.onHandCb(cq, parsed, answer);
    if (!cq.from || !(await this.isAdmin(cq.from.id))) return answer('Нет доступа', true);
    const { kind, id, to, days } = parsed;
    const o = id ? await this.st.get('o:' + id) : null;
    if (!o) return answer('Заказ не найден', true);
    const cfg = await this.getCfg();
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const edit = card => here ? this.editCard(here, card) : null;

    if (kind === 'c') { await edit(await this.card(o, cfg.shop, true)); return answer('Отменить заказ ' + id + '?'); }
    if (kind === 'b') { await edit(await this.card(o, cfg.shop, false)); return answer(''); }
    // «Выдан клиенту» сначала спрашивает, как оплатил клиент (нажатия в старых сообщениях тоже придут сюда)
    if (kind === 's' && to === 'done' && o.status === 'ready') { await edit(await this.card(o, cfg.shop, 'pay')); return answer('Как оплатил клиент?'); }
    if (kind === 'p' && to === 'credit' && !days && o.status === 'ready') { await edit(await this.card(o, cfg.shop, 'days')); return answer('На сколько дней в долг?'); }
    if (kind === 's' || kind === 'p') {
      const pay = kind === 'p' ? (to === 'credit' ? { m: 'credit', days: Number(days) } : { m: to }) : undefined;
      const res = await this.changeStatus(id, kind === 'p' ? 'done' : to, pay, null, { id: cq.from.id, name: whoName(cq.from) });
      if (res.err === 'bad_pay') return answer('Не получилось: проверьте способ оплаты', true);
      if (res.err === 'bad_transition') {
        await edit(await this.card(res.order, cfg.shop, false));
        return answer('Статус уже другой: ' + stOf(res.order.status, res.order.mode).name, true);
      }
      if (res.err) return answer('Не получилось', true);
      await this.afterChange(res.order, res.changed ? 'admin' : null, here);
      if (res.changed && res.ask) await this.askConfirm(res.ask.uid, res.ask.n);
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
      // площадка дистрибьюторов: реестр создаётся при первом обращении, имя бота нужно для ссылок на каталоги
      try {
        await hubCall(this.env, '/__/bot', { username: me.result.username });
        const hub = await hubCall(this.env, '/__/ensure', {});
        steps.push(['Площадка дистрибьюторов', !!(hub && hub.ok), hub && hub.ok ? 'готова, дистрибьюторов: ' + hub.shops : 'не отвечает']);
      } catch (e) {
        steps.push(['Площадка дистрибьюторов', false, 'не подключена: проверьте wrangler.toml (привязка HUB) и опубликуйте приложение заново']);
      }
    }
    const allOk = steps.every(s => s[1]);
    return setupPage('<ul>' + steps.map(s => '<li class="' + (s[1] ? 'ok' : 'bad') + '">' + (s[1] ? '✔ ' : '✘ ') + esc(s[0]) + ': ' + esc(s[2]) + '</li>').join('') + '</ul>'
      + (allOk ? '<p>Готово. Теперь откройте бота' + (me.ok ? ' <b>@' + esc(me.result.username) + '</b>' : '') + ' в Telegram и отправьте ему сообщение <code>/admin ВАШ_КОД</code>. После этого заказы будут приходить вам.</p>'
        : '<p class="bad">Не всё получилось. Проверьте токен бота и повторите.</p>'));
  }
}

/* ---------- Площадка: реестр дистрибьюторов, их коды, вход продавцов, заказы клиента по всем компаниям ---------- */
const newRec = (id, name, hash, sum) => ({
  id, name: cleanStr(name, 60) || DEFAULT.shop.name, on: true, hash: hash || '', since: new Date().toISOString(), sellers: 0,
  items: sum && Number(sum.items) || 0, wait: sum && Number(sum.wait) || 0, cats: sum && Array.isArray(sum.cats) ? sum.cats : [], delivery: !sum || sum.delivery !== false, minOrder: sum && Number(sum.minOrder) || 0,
  regions: cleanRegions(sum && sum.regions), home: cleanRegion(sum && sum.home)
});
/* Что видит клиент в списке. Код и служебные поля не уходят. */
const pubRec = r => ({ id: r.id, name: r.name, items: r.items, cats: r.cats, delivery: r.delivery, minOrder: r.minOrder, regions: cleanRegions(r.regions), home: cleanRegion(r.home) });
const newCode = () => randId(4) + '-' + randId(4) + '-' + randId(4);

/* ---------- База магазинов: территории, агенты, записи ---------- */
const MAX_BASE = 5000, MAX_TERR = 100, MAX_AGENTS = 100, BASE_PAGE = 50;
const PEOPLE_GAP = 600000, PEOPLE_MAX = 1000;
const BASE_STATUS = ['new', 'talk', 'refuse'];
/* Ключ для поиска повторов: последние 9 цифр номера (код страны, пробелы и скобки не мешают). */
const phoneKey = p => { const d = String(p || '').replace(/\D/g, ''); return d.length > 9 ? d.slice(-9) : d; };
/* Второй ключ повтора: то же название по тому же адресу (без регистра, пробелов и знаков). Без адреса ключа нет. */
const nameKey = (name, addr) => {
  const n = String(name || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''), a = String(addr || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  return n && a ? (n + '|' + a).slice(0, 200) : '';
};
const validAid = a => typeof a === 'string' && /^a[a-z0-9]{3,10}$/.test(a);
const validBid = b => typeof b === 'string' && /^b[a-z0-9]{4,12}$/.test(b);
const validTid = t => typeof t === 'string' && /^t[a-z0-9]{2,8}$/.test(t);
/* Запись магазина для того, кто смотрит: владелец и агент видят всё, дистрибьютор только то, что нужно для звонка и доставки. */
/* Точка магазина: loc — сохранённая (поставил агент или владелец, либо принята от клиента), cloc — то, что прислал клиент в заказе и ждёт подтверждения.
   Дистрибьютор видит только сохранённую точку. */
const locOut = l => l ? { lat: l.lat, lng: l.lng, by: l.by || '' } : null;
const baseOwn = b => { const o = { id: b.id, name: b.name, phone: b.phone, addr: b.addr, terr: b.terr, st: b.st, note: b.note, agent: b.agent, app: !!b.uid, chk: !!b.chk, src: b.src }; if (b.loc) o.loc = locOut(b.loc); if (b.cloc) o.cloc = { lat: b.cloc.lat, lng: b.cloc.lng }; return o; };
const basePub = b => { const o = { id: b.id, name: b.name, phone: b.phone, addr: b.addr, terr: b.terr, app: !!b.uid }; if (b.loc) o.loc = { lat: b.loc.lat, lng: b.loc.lng }; return o; };
/* Клиент прислал точку в заказе: запоминаем как предложение. Если она рядом с уже сохранённой (до 50 м), ничего не меняем. Возвращает, изменилась ли запись. */
function setClientLoc(rec, loc, now) {
  const l = cleanLoc(loc);
  if (!l) return false;
  if (rec.loc && distKm(rec.loc, l) < 0.05) { if (!rec.cloc) return false; delete rec.cloc; return true; }
  if (rec.cloc && distKm(rec.cloc, l) < 0.005) return false;
  rec.cloc = { lat: l.lat, lng: l.lng, t: now };
  return true;
}
const lowName = (a, b) => { const x = a.name.toLowerCase(), y = b.name.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; };

export class Hub {
  constructor(state, env) {
    this.st = state.storage;
    this.env = env;
    this.origin = '';
    this.ready = false;
  }
  tg(method, payload) { return tgApi(this.env.BOT_TOKEN, method, payload); }
  webhookSecret() { return sha256hex('shop-webhook:' + this.env.BOT_TOKEN); }

  /* --- реестр --- */
  /* Один раз при первом обращении: первый дистрибьютор (то, что бот хранил до площадки) вносится в реестр, а его продавцы становятся владельцами. */
  async ensure() {
    if (this.ready) return;
    if (!(await this.st.get('init'))) {
      const sum = (await shopCall(this.env, MAIN, '/__/summary')).data || {};
      const adm = (await shopCall(this.env, MAIN, '/__/admins')).data;
      const admins = adm && Array.isArray(adm.admins) ? adm.admins.filter(Number.isSafeInteger) : [];
      const rec = newRec(MAIN, sum.name, '', sum);
      rec.sellers = admins.length;
      const upd = { init: 1, dx: [MAIN], ['d:' + MAIN]: rec, owners: admins };
      admins.forEach(uid => { upd['adm:' + uid] = [MAIN]; });
      await this.st.put(upd);
    }
    this.ready = true;
  }
  async getRec(did) { const r = await this.st.get('d:' + did); return r && typeof r === 'object' ? r : null; }
  async allRecs() {
    const idx = (await this.st.get('dx')) || [];
    const map = await this.st.get(idx.map(x => 'd:' + x));
    return idx.map(x => map.get('d:' + x)).filter(Boolean);
  }
  async owners() { const o = await this.st.get('owners'); return Array.isArray(o) ? o : []; }
  async sellsOf(uid) { const a = await this.st.get('adm:' + uid); return Array.isArray(a) ? a : []; }
  async title() { return (await this.st.get('title')) || HUB_TITLE; }
  async botName() {
    let b = await this.st.get('bot');
    if (!b) {
      const me = await this.tg('getMe', {});
      if (me.ok && me.result && me.result.username) { b = String(me.result.username); await this.st.put('bot', b); }
    }
    return b || '';
  }
  async link(did) { const b = await this.botName(); return b ? 'https://t.me/' + b + '?start=d_' + did : ''; }
  /* Запись дистрибьютора для владельца: всё, кроме хэша кода. */
  async ownerRec(r) { return Object.assign(pubRec(r), { on: r.on, sellers: r.sellers, since: r.since, own: !!r.hash, link: await this.link(r.id) }); }

  /* --- вход продавцов по коду --- */
  /* Код продавца ищется среди кода владельца (ADMIN_CODE) и кодов дистрибьюторов. Ошибки считаются по человеку: 8 подряд закрывают ввод на час. */
  async tryCode(code, uid) {
    if (!this.env.ADMIN_CODE) return { r: 'nocode' };
    const f = (await this.st.get('fail:' + uid)) || { n: 0, until: 0 };
    if (f.until > Date.now()) return { r: 'locked' };
    const h = await sha256hex('code:' + String(code || ''));
    let did = '', owner = false;
    if (safeEq(h, await sha256hex('code:' + this.env.ADMIN_CODE))) { did = MAIN; owner = true; }
    for (const rec of await this.allRecs()) if (rec.hash && safeEq(h, rec.hash) && !did) did = rec.id;
    if (!did) {
      f.n += 1;
      if (f.n >= 8) { f.n = 0; f.until = Date.now() + 3600 * 1000; }
      await this.st.put('fail:' + uid, f);
      return { r: 'bad' };
    }
    if (f.n || f.until) await this.st.delete('fail:' + uid);
    const had = (await this.sellsOf(uid)).includes(did), hadOwner = (await this.owners()).includes(uid);
    const res = await shopCall(this.env, did, '/__/admin-add', { uid });
    if (!res.ok || !res.data) return { r: 'error' };
    await this.setSeller(uid, did, true, res.data.admins);
    if (owner) {
      const own = await this.owners();
      if (!own.includes(uid)) { own.push(uid); await this.st.put('owners', own); }
    }
    // fresh: этот человек вошёл по коду впервые (стал продавцом или владельцем), а не повторил команду
    return { r: 'ok', did, owner, fresh: !had || (owner && !hadOwner) };
  }
  /* Запоминает, у каких дистрибьюторов человек продавец, и сколько продавцов у дистрибьютора. */
  async setSeller(uid, did, on, admins) {
    const list = await this.sellsOf(uid);
    const has = list.includes(did);
    if (on && !has) await this.st.put('adm:' + uid, list.concat([did]));
    if (!on && has) { const rest = list.filter(x => x !== did); if (rest.length) await this.st.put('adm:' + uid, rest); else await this.st.delete('adm:' + uid); }
    const rec = await this.getRec(did);
    if (rec && Array.isArray(admins)) { rec.sellers = admins.length; await this.st.put('d:' + did, rec); }
  }

  /* --- маршрутизация --- */
  async fetch(request) {
    const url = new URL(request.url);
    this.origin = url.origin;
    const path = url.pathname, method = request.method;
    try {
      // адрес сайта нужен рассылкам по расписанию: там нет запроса, из которого его можно взять
      if (!this.originSaved && /^https:\/\/(?!internal)/.test(this.origin)) {
        this.originSaved = true;
        if ((await this.st.get('origin')) !== this.origin) await this.st.put('origin', this.origin);
      }
      if (path === '/webhook' && method === 'POST') return await this.webhook(request);
      await this.ensure();
      if (path.startsWith('/__/')) return await this.internal(request, path);
      if (path === '/api/shops' && method === 'GET') return await this.publicList(request);
      if (path.startsWith('/api/hub/')) return await this.api(request, path, method);
      return json({ error: 'not_found' }, 404);
    } catch (e) {
      console.error('hub error', path, e && e.stack || e);
      return json({ error: 'server' }, 500);
    }
  }
  async readBody(request, limit) {
    const text = await request.text();
    if (text.length > limit) return { err: 413 };
    try { return { body: JSON.parse(text || 'null') }; } catch (e) { return { err: 400 }; }
  }

  /* Запросы от дистрибьюторов: новое название и каталог, новый заказ клиента. */
  async internal(request, path) {
    if (request.method !== 'POST') return json({ error: 'not_found' }, 404);
    const r = await this.readBody(request, 20000);
    const b = r.body && typeof r.body === 'object' ? r.body : {};
    if (path === '/__/ensure') return json({ ok: true, shops: ((await this.st.get('dx')) || []).length });
    if (path === '/__/morning') {
      // запуск по расписанию: каждому включённому дистрибьютору напоминание о просрочке
      await this.ensure();
      const origin = (await this.st.get('origin')) || '';
      let sent = 0, shops = 0;
      for (const rec of await this.allRecs()) {
        if (!rec.on) continue;
        try { const r = await shopCall(this.env, rec.id, '/__/morning', { origin }); shops++; sent += (r.data && r.data.sent) || 0; }
        catch (e) { console.error('morning shop failed', rec.id, e && e.message || e); }
      }
      return json({ ok: true, shops, sent });
    }
    if (path === '/__/bot') { if (typeof b.username === 'string' && /^[A-Za-z0-9_]{3,64}$/.test(b.username)) await this.st.put('bot', b.username); return json({ ok: true }); }
    if (path === '/__/sync') {
      const rec = validDid(b.did) ? await this.getRec(b.did) : null;
      if (!rec || !b.summary || typeof b.summary !== 'object') return json({ ok: false });
      const s = b.summary;
      rec.name = cleanStr(s.name, 60) || rec.name;
      rec.items = Math.max(0, Math.min(MAX_ITEMS, Math.round(Number(s.items) || 0)));
      rec.wait = Math.max(0, Math.min(MAX_ITEMS, Math.round(Number(s.wait) || 0)));
      rec.cats = (Array.isArray(s.cats) ? s.cats : []).slice(0, 6).map(c => ({ name: cleanStr(c && c.name, 40), uz: cleanStr(c && c.uz, 40) })).filter(c => c.name);
      rec.delivery = s.delivery !== false;
      rec.minOrder = Math.max(0, Math.round(Number(s.minOrder) || 0));
      rec.regions = cleanRegions(s.regions);
      rec.home = cleanRegion(s.home);
      await this.st.put('d:' + rec.id, rec);
      return json({ ok: true });
    }
    if (path === '/__/is-owner') return json({ owner: (await this.owners()).includes(Number(b.uid)) });
    if (path === '/__/mod-notify') {
      // продавец отправил товары на проверку: владельцам уходит одно сообщение на отправку
      const n = Math.round(Number(b.n));
      if (!validDid(b.did) || !(n > 0)) return json({ ok: false });
      const rec = await this.getRec(b.did), origin = /^https:\/\/(?!internal)/.test(b.origin || '') ? b.origin : '';
      const text = (rec ? rec.name : b.did) + ': на проверке ' + ruTovar(n);
      for (const oid of await this.owners()) {
        try { await this.tg('sendMessage', Object.assign({ chat_id: oid, text }, origin ? { reply_markup: openBtn(origin, 'Проверить', origin + '/?v=review') } : {})); }
        catch (e) { console.error('mod notify send failed', e && e.message || e); }
      }
      return json({ ok: true });
    }
    if (path === '/__/ordered') {
      const uid = Number(b.uid);
      if (!validDid(b.did) || !Number.isSafeInteger(uid)) return json({ ok: false });
      const list = await this.userShops(uid, b.did);
      if (!list.includes(b.did)) await this.st.put('u:' + uid, list.concat([b.did]));
      // магазин оформил заказ: если его ещё нет в общей базе, он добавляется с данными из заказа
      try { await this.baseTouch(uid, b.prof); } catch (e) { console.error('base touch failed', e && e.message || e); }
      return json({ ok: true });
    }
    if (path === '/__/profile') {
      // магазин заполнил профиль у дистрибьютора: заносим в общую базу, если его там ещё нет
      const uid = Number(b.uid);
      if (!validDid(b.did) || !Number.isSafeInteger(uid)) return json({ ok: false });
      try { await this.baseTouch(uid, b.prof, 'profile'); } catch (e) { console.error('base touch failed', e && e.message || e); }
      return json({ ok: true });
    }
    return json({ error: 'not_found' }, 404);
  }
  /* У каких дистрибьюторов у человека есть заказы. Кто заказывал до площадки, найдётся у первого: это проверяется один раз. */
  async userShops(uid, skip) {
    const have = await this.st.get('u:' + uid);
    if (Array.isArray(have)) return have;
    let list = [];
    if (skip !== MAIN) {
      const r = await shopCall(this.env, MAIN, '/__/my-orders', { uid });
      if (r.data && Array.isArray(r.data.orders) && r.data.orders.length) list = [MAIN];
    }
    await this.st.put('u:' + uid, list);
    return list;
  }

  /* --- территории, агенты, база магазинов --- */
  async terrs() { const t = await this.st.get('terr'); return Array.isArray(t) ? t : []; }
  async allAgents() {
    const idx = (await this.st.get('ax')) || [];
    if (!idx.length) return [];
    const map = await this.st.get(idx.map(x => 'a:' + x));
    return idx.map(x => map.get('a:' + x)).filter(Boolean);
  }
  /* Агент, который вошёл по коду с этого аккаунта. Новый код отключает прежний аккаунт. */
  async agentOf(uid) {
    const aid = await this.st.get('agu:' + uid);
    const a = aid ? await this.st.get('a:' + aid) : null;
    return a && a.on && a.uid === uid ? a : null;
  }
  async agentLink(id) { const b = await this.botName(); return b ? 'https://t.me/' + b + '?start=a_' + id : ''; }
  /* Реестр людей: кто открывал приложение или писал боту (имя, логин, первый и последний заход). Роли здесь не хранятся: они считаются при показе списка.
     Запись обновляется не чаще раза в 10 минут на человека, чтобы каждый запрос не писал в хранилище. */
  async touchPerson(u) {
    try {
      if (!u || !Number.isInteger(u.id) || u.id <= 0) return;
      const now = Date.now();
      if (!this.pseen) this.pseen = new Map();
      if (now - (this.pseen.get(u.id) || 0) < PEOPLE_GAP) return;
      if (this.pseen.size > 5000) this.pseen.clear();
      this.pseen.set(u.id, now);
      const nm = whoName(u), un = cleanStr(u.username || '', 40), iso = new Date(now).toISOString();
      const cur = await this.st.get('pp:' + u.id);
      if (cur && cur.nm === nm && cur.un === un && now - Date.parse(cur.last) < PEOPLE_GAP) return;
      await this.st.put('pp:' + u.id, { id: u.id, nm, un, first: cur && cur.first ? cur.first : iso, last: iso });
    } catch (e) { console.error('touchPerson failed', e && e.message || e); }
  }
  /* Список для владельца: все, кто заходил, плюс держатели ролей, которых ещё не видели после появления списка. Самые свежие первыми. */
  async peopleSeen() {
    const rec = new Map();
    const row = (id) => { let r = rec.get(id); if (!r) { r = { id, nm: '', un: '', first: '', last: '', roles: [], shop: null }; rec.set(id, r); } return r; };
    for (const v of (await this.st.list({ prefix: 'pp:' })).values()) if (v && v.id) Object.assign(row(v.id), { nm: v.nm || '', un: v.un || '', first: v.first || '', last: v.last || '' });
    const recs = new Map((await this.allRecs()).map(r => [r.id, r.name]));
    const uidOf = k => Number(String(k).slice(String(k).indexOf(':') + 1));
    for (const id of await this.owners()) row(id).roles.push({ r: 'owner' });
    for (const [k, list] of (await this.st.list({ prefix: 'adm:' })).entries()) for (const did of Array.isArray(list) ? list : []) row(uidOf(k)).roles.push({ r: 'seller', n: recs.get(did) || did });
    for (const [k, list] of (await this.st.list({ prefix: 'dls:' })).entries()) for (const did of Array.isArray(list) ? list : []) if (recs.has(did)) row(uidOf(k)).roles.push({ r: 'courier', n: recs.get(did) });
    const ags = new Map((await this.allAgents()).map(a => [a.id, a]));
    for (const a of ags.values()) if (a.on && a.uid) row(a.uid).roles.push({ r: 'agent', n: a.name });
    for (const b of (await this.st.list({ prefix: 'b:' })).values()) if (b && b.uid) row(b.uid).shop = { name: b.name || '', phone: b.phone || '' };
    const all = [...rec.values()].filter(x => Number.isInteger(x.id) && x.id > 0);
    all.sort((a, b) => String(b.last).localeCompare(String(a.last)) || a.id - b.id);
    return { people: all.slice(0, PEOPLE_MAX), total: all.length, max: PEOPLE_MAX };
  }
  /* Сообщение всем владельцам площадки (кроме самого человека, если он владелец). */
  async notifyOwners(text, exceptUid) {
    if (!this.env.BOT_TOKEN) return;
    for (const o of await this.owners()) {
      if (o === exceptUid) continue;
      try { await this.tg('sendMessage', { chat_id: o, text }); } catch (e) { console.error('owner notify failed', e && e.message || e); }
    }
  }
  async baseRole(uid) {
    if ((await this.owners()).includes(uid)) return { r: 'owner' };
    const ag = await this.agentOf(uid);
    if (ag) return { r: 'agent', ag };
    if ((await this.sellsOf(uid)).length) return { r: 'dist' };
    return null;
  }
  /* Агент видит и правит свои магазины, магазины своих территорий и магазины без территории (их добавили сами по заказу). */
  inScope(ag, b) { return b.agent === ag.id || !b.terr || (ag.terr || []).includes(b.terr); }
  async newBid() {
    let id;
    do { id = 'b' + randId(7).toLowerCase(); } while (await this.st.get('b:' + id));
    return id;
  }
  /* Нет ли уже такого магазина: по телефону или по названию с тем же адресом. except: запись, которую правим. */
  async findDup(phone, name, addr, except) {
    const ids = [await this.st.get('bp:' + phoneKey(phone))];
    const k = nameKey(name, addr);
    if (k) ids.push(await this.st.get('bk:' + k));
    for (const id of ids) if (id && id !== except) { const e = await this.st.get('b:' + id); if (e) return e; }
    return null;
  }
  /* Ключи поиска повторов записи: что положить и что убрать при смене телефона, названия или адреса. */
  idxOf(b) { const o = { ['bp:' + phoneKey(b.phone)]: b.id }, k = nameKey(b.name, b.addr); if (k) o['bk:' + k] = b.id; return o; }
  /* Магазин оформил заказ. Есть в базе — ничего не меняем (данные могла проверить агент); нет — добавляем из заказа, агент потом проверит. */
  async baseTouch(uid, p, src) {
    if (!p || typeof p !== 'object' || !Number.isSafeInteger(uid)) return;
    // территорию называет сам магазин в заказе; принимаем только из списка владельца
    const tid = cleanStr(p.terr, 12), terr = tid && (await this.terrs()).some(t => t.id === tid) ? tid : '';
    const have = await this.st.get('bu:' + uid);
    const hv = have ? await this.st.get('b:' + have) : null;
    if (hv) {
      // запись уже есть: пустую территорию дополняем, уже выбранную (в том числе агентом) не меняем
      const now = new Date().toISOString();
      let ch = false;
      if (!hv.terr && terr) { hv.terr = terr; hv.upd = now; ch = true; }
      if (setClientLoc(hv, p.loc, now)) ch = true;
      if (ch) await this.st.put('b:' + hv.id, hv);
      return;
    }
    const name = cleanStr(p.org, 60) || cleanStr(p.name, 60), phone = cleanStr(p.phone, 25), addr = cleanStr(p.addr, 200);
    if (name.length < 2 || !phoneOk(phone)) return;
    const ex = await this.findDup(phone, name, addr, '');
    const now = new Date().toISOString();
    if (ex) {
      // уже есть (внёс агент или другой сотрудник магазина): привязываем человека к записи
      const upd = { ['bu:' + uid]: ex.id };
      if (!ex.uid) { ex.uid = uid; upd['b:' + ex.id] = ex; }
      if (!ex.terr && terr) { ex.terr = terr; ex.upd = now; upd['b:' + ex.id] = ex; }
      if (setClientLoc(ex, p.loc, now)) upd['b:' + ex.id] = ex;
      await this.st.put(upd);
      return;
    }
    const n = (await this.st.get('bn')) || 0;
    if (n >= MAX_BASE) return;
    const id = await this.newBid();
    const ref = await this.st.get('ref:' + uid);
    const agent = validAid(ref) && (await this.st.get('a:' + ref)) ? ref : '';
    const rec = { id, name, phone, addr, terr, st: 'new', note: '', agent, uid, chk: false, ver: 0, src: src || 'order', created: now, upd: now };
    setClientLoc(rec, p.loc, now);
    await this.st.put(Object.assign({ ['b:' + id]: rec, ['bu:' + uid]: id, bn: n + 1 }, this.idxOf(rec)));
  }
  /* Поля записи из запроса: проверяет только присланные. role решает, какие территории можно выбрать. */
  async baseFields(b, role) {
    const v = {}, has = k => b[k] !== undefined;
    for (const k of ['name', 'phone', 'addr', 'terr', 'st', 'note', 'agent']) if (has(k) && typeof b[k] !== 'string') return { err: 'bad_request' };
    if (has('name')) { v.name = cleanStr(b.name, 60); if (v.name.length < 2) return { err: 'bad_name' }; }
    if (has('phone')) { v.phone = cleanStr(b.phone, 25); if (!phoneOk(v.phone)) return { err: 'bad_phone' }; }
    if (has('addr')) v.addr = cleanStr(b.addr, 200);
    if (has('note')) v.note = cleanStr(b.note, 500, true);
    if (has('st')) { if (!BASE_STATUS.includes(b.st)) return { err: 'bad_request' }; v.st = b.st; }
    if (has('terr')) {
      const terrs = await this.terrs();
      if (b.terr === '') { if (terrs.length && role.r === 'agent') return { err: 'need_terr' }; v.terr = ''; }
      else {
        if (!terrs.some(t => t.id === b.terr)) return { err: 'bad_terr' };
        if (role.r === 'agent' && (role.ag.terr || []).length && !role.ag.terr.includes(b.terr)) return { err: 'bad_terr' };
        v.terr = b.terr;
      }
    }
    if (has('agent') && role.r === 'owner') {
      if (b.agent && !(await this.st.get('a:' + b.agent))) return { err: 'bad_agent' };
      v.agent = b.agent;
    }
    return { v };
  }
  dupJson(e, role) {
    return json({ error: 'dup', exists: { name: e.name, terr: e.terr, mine: role.r === 'owner' || (role.ag && e.agent === role.ag.id) } }, 409);
  }
  /* Что делать с точкой: b.loc {lat,lng} — поставить; b.loc === null — убрать; b.accept === true — принять точку, присланную клиентом.
     by — кто поставил: owner, agent или client (принята от клиента). */
  locChange(role, rec, b, now) {
    if (!b || typeof b !== 'object') return {};
    if (b.accept === true) {
      if (!rec.cloc) return { err: 'no_client_loc' };
      return { accepted: { lat: rec.cloc.lat, lng: rec.cloc.lng, t: now, by: 'client' } };
    }
    if (b.loc === undefined) return {};
    if (b.loc === null) return { clear: true };
    const l = cleanLoc(b.loc);
    if (!l) return { err: 'bad_loc' };
    return { set: { lat: l.lat, lng: l.lng, t: now, by: role.r === 'owner' ? 'owner' : 'agent' } };
  }
  async baseCreate(role, b) {
    const f = await this.baseFields(Object.assign({ terr: '' }, b), role);
    if (f.err) return json({ error: f.err }, 400);
    const v = f.v;
    if (!v.name) return json({ error: 'bad_name' }, 400);
    if (!v.phone) return json({ error: 'bad_phone' }, 400);
    const n = (await this.st.get('bn')) || 0;
    if (n >= MAX_BASE) return json({ error: 'too_many' }, 409);
    const dup = await this.findDup(v.phone, v.name, v.addr || '', '');
    if (dup) return this.dupJson(dup, role);
    const now = new Date().toISOString(), id = await this.newBid();
    const rec = { id, name: v.name, phone: v.phone, addr: v.addr || '', terr: v.terr || '', st: v.st || 'new', note: v.note || '', agent: role.r === 'agent' ? role.ag.id : (v.agent || ''), uid: 0, chk: true, ver: 1, src: 'agent', created: now, upd: now };
    const lc = this.locChange(role, {}, b, now);
    if (lc.err) return json({ error: lc.err }, 400);
    if (lc.set) rec.loc = lc.set;
    await this.st.put(Object.assign({ ['b:' + id]: rec, bn: n + 1 }, this.idxOf(rec)));
    return json({ item: baseOwn(rec) });
  }
  async baseUpdate(role, id, b) {
    const rec = await this.st.get('b:' + id);
    if (!rec) return json({ error: 'not_found' }, 404);
    if (role.r === 'agent' && !this.inScope(role.ag, rec)) return json({ error: 'forbidden' }, 403);
    const f = await this.baseFields(b, role);
    if (f.err) return json({ error: f.err }, 400);
    const v = f.v, next = Object.assign({}, rec, v);
    const dup = await this.findDup(next.phone, next.name, next.addr, rec.id);
    if (dup) return this.dupJson(dup, role);
    // точка магазина: только владелец и агент (эта запись — его зона); клиент и дистрибьютор её не меняют
    const lc = this.locChange(role, rec, b, new Date().toISOString());
    if (lc.err) return json({ error: lc.err }, lc.err === 'no_client_loc' ? 409 : 400);
    if (lc.set) { next.loc = lc.set; delete next.cloc; }
    else if (lc.clear) { delete next.loc; }
    if (lc.accepted) { next.loc = lc.accepted; delete next.cloc; }
    const upd = {}, del = [];
    const was = this.idxOf(rec), now = this.idxOf(next);
    Object.keys(was).forEach(k => { if (!(k in now)) del.push(k); });
    // телефон или название исправлены: магазин получит исправление в форме заказа один раз (ver)
    if ((v.name !== undefined && v.name !== rec.name) || (v.phone !== undefined && v.phone !== rec.phone)) next.ver = (Number(rec.ver) || 0) + 1;
    // правит агент или владелец: данные проверены; магазин без территории и агента закрепляется за агентом
    next.chk = true;
    if (role.r === 'agent' && !next.agent) next.agent = role.ag.id;
    next.upd = new Date().toISOString();
    await this.st.put(Object.assign({ ['b:' + id]: next }, now, upd));
    if (del.length) await this.st.delete(del);
    return json({ item: baseOwn(next) });
  }
  async baseDelete(role, id) {
    const rec = await this.st.get('b:' + id);
    if (!rec) return json({ error: 'not_found' }, 404);
    // агент убирает только свои записи без привязки к приложению: магазин, который уже заказывал, остаётся в базе
    if (role.r === 'agent' && (!this.inScope(role.ag, rec) || rec.uid)) return json({ error: 'forbidden' }, 403);
    const del = ['b:' + id].concat(Object.keys(this.idxOf(rec)));
    if (rec.uid) del.push('bu:' + rec.uid);
    await this.st.delete(del);
    await this.st.put('bn', Math.max(0, ((await this.st.get('bn')) || 1) - 1));
    return json({ ok: true });
  }
  /* Список для экрана «База»: владелец видит всё, агент свою зону, дистрибьютор всех, кроме отказавшихся (без заметок и статусов).
     Фильтры (кроме района и поиска только у владельца и агента): f — статус (new, chk «не проверен», talk, app «в приложении», refuse),
     ag — агент (только владелец; «-» без агента), sort=new — сначала новые. Счётчики по районам считаются уже с учётом статуса, агента и поиска. */
  async baseList(role, url, uid) {
    const sp = url.searchParams;
    const terr = String(sp.get('terr') || '').slice(0, 12), f = String(sp.get('f') || '');
    const ag = role.r === 'owner' ? String(sp.get('ag') || '').slice(0, 12) : '';
    const byNew = sp.get('sort') === 'new';
    const here = sp.get('sort') === 'near' ? cleanLoc({ lat: sp.get('lat'), lng: sp.get('lng') }) : null;
    const q = String(sp.get('q') || '').trim().toLowerCase().slice(0, 40);
    const off = Math.max(0, Math.min(MAX_BASE, parseInt(sp.get('off') || '0', 10) || 0));
    const all = [...(await this.st.list({ prefix: 'b:' })).values()];
    let scope = all;
    if (role.r === 'agent') scope = all.filter(b => this.inScope(role.ag, b));
    else if (role.r === 'dist') scope = all.filter(b => b.st !== 'refuse');
    const qd = q.replace(/\D/g, '');
    const full = role.r !== 'dist';
    const stOk = b => !full || !f || (f === 'chk' ? !b.chk : f === 'app' ? !!b.uid : b.st === f);
    const agOk = b => !ag || (ag === '-' ? !b.agent : b.agent === ag);
    const qOk = b => !q || b.name.toLowerCase().includes(q) || (b.addr || '').toLowerCase().includes(q) || (qd.length >= 3 && String(b.phone).replace(/\D/g, '').includes(qd));
    // «Мои клиенты»: те, кто заказывал у дистрибьютора (у владельца: у любого дистрибьютора)
    const sh = role.r === 'agent' ? '' : await this.mineShop(uid, sp.get('sh'));
    let mine = null;
    if (sp.get('mine') === '1' && role.r !== 'agent') mine = await this.mineBids(role, sh);
    const pre = scope.filter(b => stOk(b) && agOk(b) && qOk(b) && (!mine || mine.has(b.id)));
    const counts = {};
    pre.forEach(b => { const k = b.terr || ''; counts[k] = (counts[k] || 0) + 1; });
    const rows = pre.filter(b => !terr || (terr === '-' ? !b.terr : b.terr === terr));
    // «Ближайшие»: сначала магазины с точкой по расстоянию от того, кто смотрит, потом остальные по названию
    const dist = new Map();
    if (here) rows.forEach(b => { if (b.loc) dist.set(b.id, distKm(here, b.loc)); });
    if (here) rows.sort((x, y) => (dist.has(x.id) ? 0 : 1) - (dist.has(y.id) ? 0 : 1) || (dist.get(x.id) || 0) - (dist.get(y.id) || 0) || lowName(x, y));
    else rows.sort(byNew ? (x, y) => String(y.created || '').localeCompare(String(x.created || '')) || lowName(x, y) : lowName);
    const out = {
      role: role.r, total: rows.length, all: scope.length, counts, more: off + BASE_PAGE < rows.length,
      items: rows.slice(off, off + BASE_PAGE).map(b => { const o = (full ? baseOwn : basePub)(b); if (dist.has(b.id)) o.d = Math.round(dist.get(b.id) * 10) / 10; return o; }),
      terrs: (await this.terrs()).map(t => ({ id: t.id, name: t.name }))
    };
    if (role.r !== 'agent') {
      // данные клиента: у дистрибьютора только его, у владельца заказы у всех дистрибьюторов
      const ext = await this.mineAttach(role, sh, out.items.map(o => all.find(b => b.id === o.id)).filter(Boolean));
      out.items.forEach(o => { const e = ext.get(o.id); if (e) { if (e.m) o.m = e.m; if (e.my) o.my = e.my; } });
      out.sh = sh;
    }
    if (full) out.unchk = scope.filter(b => !b.chk).length;
    if (role.r === 'agent') out.mine = role.ag.terr || [];
    if (role.r === 'owner') out.agents = (await this.allAgents()).map(a => ({ id: a.id, name: a.name }));
    return json(out);
  }
  /* --- данные клиента для дистрибьютора и владельца ---
     Номер аккаунта (uid) наружу не выходит: площадка сама переводит номер магазина в номера аккаунтов и спрашивает дистрибьютора. */
  /* От чьего имени человек смотрит клиентов: только магазин (дистрибьютор), где он продавец. */
  async mineShop(uid, sh) {
    const sells = await this.sellsOf(uid);
    return validDid(sh) && sells.includes(sh) ? sh : (sells[0] || '');
  }
  /* Соответствие «номер магазина в базе» ↔ «номера аккаунтов». */
  async uidMap() {
    const bidOf = new Map(), uidsOf = new Map();
    (await this.st.list({ prefix: 'bu:' })).forEach((bid, k) => {
      const u = Number(k.slice(3));
      bidOf.set(u, bid);
      const a = uidsOf.get(bid) || [];
      a.push(u);
      uidsOf.set(bid, a);
    });
    return { bidOf, uidsOf };
  }
  /* Номера записей базы, которые заказывали у дистрибьютора sh (у владельца у любого). */
  async mineBids(role, sh) {
    const targets = role.r === 'owner' ? (await this.allRecs()).map(r => r.id) : (sh ? [sh] : []);
    const um = await this.uidMap();
    const out = new Set();
    const res = await Promise.all(targets.map(d => shopCall(this.env, d, '/__/mine-ids', {})));
    res.forEach(r => (r.ok && r.data && Array.isArray(r.data.uids) ? r.data.uids : []).forEach(u => { const bid = um.bidOf.get(Number(u)); if (bid) out.add(bid); }));
    return out;
  }
  /* Для записей базы: m (заказы) и my (заметка, группа, блокировка у дистрибьютора sh). */
  async mineAttach(role, sh, recs, um) {
    const out = new Map();
    if (!recs.length) return out;
    um = um || await this.uidMap();
    const items = recs.map(b => ({ bid: b.id, uids: [...new Set([...(um.uidsOf.get(b.id) || []), ...(b.uid ? [b.uid] : [])])].slice(0, 10) }));
    const owner = role.r === 'owner';
    const recsAll = owner ? await this.allRecs() : [];
    const targets = owner ? recsAll.map(r => r.id) : (sh ? [sh] : []);
    const res = await Promise.all(targets.map(async d => ({ d, r: await shopCall(this.env, d, '/__/mine', { items }) })));
    const name = new Map(recsAll.map(r => [r.id, r.name]));
    recs.forEach(b => {
      const m = { n: 0, ds: 0, sum: 0, last: '' }, by = [];
      let my = null;
      res.forEach(x => {
        const row = x.r.ok && x.r.data && Array.isArray(x.r.data.rows) ? x.r.data.rows.find(w => w.bid === b.id) : null;
        if (!row) return;
        m.n += row.n; m.ds += row.ds; m.sum += row.sum;
        if (row.last > m.last) m.last = row.last;
        if (row.n > 0) by.push({ did: x.d, name: name.get(x.d) || '', n: row.n, sum: row.sum });
        if (x.d === sh) my = { has: row.has, note: row.note, grp: row.grp, blocked: row.blocked, tg: row.tg };
      });
      const e = {};
      if (m.n > 0) { e.m = m; if (owner) e.m.by = by; }
      if (my && (my.has || my.note || my.grp || my.blocked)) e.my = my;
      out.set(b.id, e);
    });
    return out;
  }
  /* Карточка магазина у дистрибьютора: заказы и история (GET), заметка, группа, блокировка (PUT). */
  async baseMine(role, uid, bid, method, request) {
    if (role.r === 'agent') return json({ error: 'forbidden' }, 403);
    const rec = await this.st.get('b:' + bid);
    if (!rec || (role.r === 'dist' && rec.st === 'refuse')) return json({ error: 'not_found' }, 404);
    const um = await this.uidMap();
    const uids = [...new Set([...(um.uidsOf.get(bid) || []), ...(rec.uid ? [rec.uid] : [])])].slice(0, 10);
    if (method === 'GET') {
      const sh = await this.mineShop(uid, new URL(request.url).searchParams.get('sh'));
      const ext = (await this.mineAttach(role, sh, [rec], um)).get(bid) || {};
      const recsAll = await this.allRecs();
      const targets = role.r === 'owner' ? recsAll.map(r => r.id) : (sh ? [sh] : []);
      const res = await Promise.all(targets.map(async d => ({ d, r: await shopCall(this.env, d, '/__/mine-orders', { uids }) })));
      const name = new Map(recsAll.map(r => [r.id, r.name]));
      const orders = [];
      res.forEach(x => (x.r.ok && x.r.data && Array.isArray(x.r.data.orders) ? x.r.data.orders : []).forEach(o => orders.push(Object.assign(o, { did: x.d, shopName: name.get(x.d) || '' }))));
      orders.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return json({ sh, m: ext.m || null, my: ext.my || null, orders: orders.slice(0, 30) });
    }
    const rd = await this.readBody(request, 3000);
    if (rd.err || !rd.body || typeof rd.body !== 'object') return json({ error: 'bad_request' }, 400);
    const sells = await this.sellsOf(uid);
    const sh = validDid(rd.body.sh) && sells.includes(rd.body.sh) ? rd.body.sh : '';
    if (!sh) return json({ error: 'forbidden' }, 403);
    const r = await shopCall(this.env, sh, '/__/mine-set', { bid, uids, note: rd.body.note, grp: rd.body.grp, blocked: rd.body.blocked });
    if (!r.ok) return json({ error: (r.data && r.data.error) || 'bad_request' }, r.status || 400);
    const row = r.data.row;
    return json({ my: { has: row.has, note: row.note, grp: row.grp, blocked: row.blocked, tg: row.tg } });
  }
  /* Для владельца: территории и агенты со счётчиками. */
  async peopleState() {
    const rows = [...(await this.st.list({ prefix: 'b:' })).values()];
    const byT = {}, byA = {};
    rows.forEach(b => { byT[b.terr || ''] = (byT[b.terr || ''] || 0) + 1; byA[b.agent || ''] = (byA[b.agent || ''] || 0) + 1; });
    const terr = (await this.terrs()).map(t => ({ id: t.id, name: t.name, n: byT[t.id] || 0 }));
    const agents = await Promise.all((await this.allAgents()).map(async a => ({ id: a.id, name: a.name, on: a.on, since: a.since, terr: a.terr || [], used: !!a.uid, n: byA[a.id] || 0, link: await this.agentLink(a.id) })));
    return { terr, agents, free: byT[''] || 0, total: rows.length, max: { terr: MAX_TERR, agents: MAX_AGENTS, base: MAX_BASE } };
  }
  async addTerr(names) {
    const terrs = await this.terrs();
    const have = new Set(terrs.map(t => t.name.toLowerCase()));
    let added = 0;
    for (const raw of names.slice(0, 20)) {
      const name = cleanStr(raw, 40);
      if (name.length < 2 || have.has(name.toLowerCase()) || terrs.length >= MAX_TERR) continue;
      let id;
      do { id = 't' + randId(4).toLowerCase(); } while (terrs.some(t => t.id === id));
      terrs.push({ id, name });
      have.add(name.toLowerCase());
      added++;
    }
    if (added) await this.st.put('terr', terrs);
    return added;
  }
  async adminPeople(request, path, method) {
    if (path === '/api/hub/admin/people' && method === 'GET') return json(await this.peopleState());
    if (path === '/api/hub/admin/people/list' && method === 'GET') return json(await this.peopleSeen());
    if (path === '/api/hub/admin/terr' && method === 'POST') {
      const r = await this.readBody(request, 4000);
      const names = r.body && Array.isArray(r.body.names) ? r.body.names.filter(x => typeof x === 'string') : null;
      if (r.err || !names || !names.length) return json({ error: 'bad_name' }, 400);
      const added = await this.addTerr(names);
      if (!added) return json({ error: (await this.terrs()).length >= MAX_TERR ? 'too_many' : 'terr_dup' }, 409);
      return json(await this.peopleState());
    }
    const tm = path.match(/^\/api\/hub\/admin\/terr\/(t[a-z0-9]{2,8})$/);
    if (tm) {
      const terrs = await this.terrs(), t = terrs.find(x => x.id === tm[1]);
      if (!t) return json({ error: 'not_found' }, 404);
      if (method === 'PUT') {
        const r = await this.readBody(request, 1000);
        const name = r.body && typeof r.body === 'object' ? cleanStr(r.body.name, 40) : '';
        if (r.err || name.length < 2) return json({ error: 'bad_name' }, 400);
        if (terrs.some(x => x.id !== t.id && x.name.toLowerCase() === name.toLowerCase())) return json({ error: 'terr_dup' }, 409);
        t.name = name;
        await this.st.put('terr', terrs);
        return json(await this.peopleState());
      }
      if (method === 'DELETE') {
        if ([...(await this.st.list({ prefix: 'b:' })).values()].some(b => b.terr === t.id)) return json({ error: 'terr_used' }, 409);
        await this.st.put('terr', terrs.filter(x => x.id !== t.id));
        for (const a of await this.allAgents()) if ((a.terr || []).includes(t.id)) { a.terr = a.terr.filter(x => x !== t.id); await this.st.put('a:' + a.id, a); }
        return json(await this.peopleState());
      }
    }
    if (path === '/api/hub/admin/agents' && method === 'POST') {
      const r = await this.readBody(request, 3000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const name = cleanStr(r.body.name, 60);
      if (name.length < 2) return json({ error: 'bad_name' }, 400);
      const idx = (await this.st.get('ax')) || [];
      if (idx.length >= MAX_AGENTS) return json({ error: 'too_many' }, 409);
      const c = await this.pickCode(r.body.code);
      if (c.err) return json({ error: c.err }, c.err === 'code_taken' ? 409 : 400);
      const valid = new Set((await this.terrs()).map(t => t.id));
      const terr = (Array.isArray(r.body.terr) ? r.body.terr : []).filter(x => valid.has(x)).filter((x, i, a) => a.indexOf(x) === i);
      let id;
      do { id = 'a' + randId(5).toLowerCase(); } while (idx.includes(id));
      await this.st.put({ ['a:' + id]: { id, name, on: true, hash: c.hash, since: new Date().toISOString(), uid: 0, terr }, ax: idx.concat([id]) });
      return json(Object.assign(await this.peopleState(), { code: c.code, agentId: id }));
    }
    const am = path.match(/^\/api\/hub\/admin\/agents\/(a[a-z0-9]{3,10})(\/code)?$/);
    if (am) {
      const a = await this.st.get('a:' + am[1]);
      if (!a) return json({ error: 'not_found' }, 404);
      const r = await this.readBody(request, 3000);
      if (r.err) return json({ error: 'bad_request' }, 400);
      const b = r.body && typeof r.body === 'object' ? r.body : {};
      if (am[2] && method === 'POST') {
        const c = await this.pickCode(b.code, a.id);
        if (c.err) return json({ error: c.err }, c.err === 'code_taken' ? 409 : 400);
        if (a.uid) await this.st.delete('agu:' + a.uid);   // прежний аккаунт теряет доступ
        a.hash = c.hash; a.uid = 0;
        await this.st.put('a:' + a.id, a);
        return json(Object.assign(await this.peopleState(), { code: c.code, agentId: a.id }));
      }
      if (!am[2] && method === 'DELETE') {
        // агент удаляется совсем: доступ закрывается, его магазины остаются в базе без агента
        if (a.uid) await this.st.delete('agu:' + a.uid);
        const upd = {}, now = new Date().toISOString();
        (await this.st.list({ prefix: 'b:' })).forEach(rec => { if (rec.agent === a.id) { rec.agent = ''; rec.ver = (Number(rec.ver) || 0) + 1; rec.upd = now; upd['b:' + rec.id] = rec; } });
        if (Object.keys(upd).length) await this.st.put(upd);
        await this.st.put('ax', ((await this.st.get('ax')) || []).filter(x => x !== a.id));
        await this.st.delete('a:' + a.id);
        return json(await this.peopleState());
      }
      if (!am[2] && method === 'PUT') {
        if (typeof b.on === 'boolean') a.on = b.on;
        if (b.name !== undefined) { const n = cleanStr(b.name, 60); if (n.length < 2) return json({ error: 'bad_name' }, 400); a.name = n; }
        if (b.terr !== undefined) {
          if (!Array.isArray(b.terr)) return json({ error: 'bad_request' }, 400);
          const valid = new Set((await this.terrs()).map(t => t.id));
          a.terr = b.terr.filter(x => valid.has(x)).filter((x, i, arr) => arr.indexOf(x) === i);
        }
        await this.st.put('a:' + a.id, a);
        return json(await this.peopleState());
      }
    }
    if (path === '/api/hub/admin/base/import' && method === 'POST') return json(Object.assign(await this.importClients(), { state: await this.peopleState() }));
    return null;
  }
  /* Один раз (и безопасно повторно) переносит клиентов всех дистрибьюторов в общую базу. Кто уже есть (по телефону или названию с адресом), не добавляется, а привязывается. */
  async importClients() {
    const byPhone = await this.st.list({ prefix: 'bp:' }), byName = await this.st.list({ prefix: 'bk:' }), byUid = await this.st.list({ prefix: 'bu:' });
    let n = (await this.st.get('bn')) || 0, added = 0, linked = 0, skipped = 0;
    const now = new Date().toISOString(), upd = {}, touched = new Map();
    for (const shop of await this.allRecs()) {
      const r = await shopCall(this.env, shop.id, '/__/clients', {});
      for (const c of (r.data && Array.isArray(r.data.clients) ? r.data.clients : [])) {
        const uid = Number(c.uid);
        const name = cleanStr(c.org, 60) || cleanStr(c.name, 60), phone = cleanStr(c.phone, 25), addr = cleanStr(c.addr, 200);
        if (!Number.isSafeInteger(uid) || byUid.has('bu:' + uid) || name.length < 2 || !phoneOk(phone)) { skipped++; continue; }
        const k = nameKey(name, addr);
        const ex = byPhone.get('bp:' + phoneKey(phone)) || (k && byName.get('bk:' + k)) || '';
        if (ex) {
          byUid.set('bu:' + uid, ex); upd['bu:' + uid] = ex;
          const rec = touched.get(ex) || await this.st.get('b:' + ex);
          if (rec && !rec.uid) { rec.uid = uid; touched.set(ex, rec); }
          linked++;
          continue;
        }
        if (n >= MAX_BASE) { skipped++; continue; }
        let id;
        do { id = 'b' + randId(7).toLowerCase(); } while (upd['b:' + id]);
        const rec = { id, name, phone, addr, terr: '', st: 'new', note: '', agent: '', uid, chk: false, ver: 0, src: 'import', created: now, upd: now };
        upd['b:' + id] = rec; upd['bu:' + uid] = id; upd['bp:' + phoneKey(phone)] = id;
        byPhone.set('bp:' + phoneKey(phone), id); byUid.set('bu:' + uid, id);
        if (k) { upd['bk:' + k] = id; byName.set('bk:' + k, id); }
        n++; added++;
      }
    }
    touched.forEach((rec, id) => { upd['b:' + id] = rec; });
    upd.bn = n;
    const keys = Object.keys(upd);
    for (let i = 0; i < keys.length; i += 100) { const part = {}; keys.slice(i, i + 100).forEach(k => { part[k] = upd[k]; }); await this.st.put(part); }
    return { added, linked, skipped };
  }
  /* Вход агента по коду. Ошибки считаются в том же счётчике, что и у /admin. */
  async tryAgentCode(code, uid) {
    const f = (await this.st.get('fail:' + uid)) || { n: 0, until: 0 };
    if (f.until > Date.now()) return { r: 'locked' };
    const h = await sha256hex('code:' + String(code || ''));
    let ag = null;
    for (const a of await this.allAgents()) if (a.hash && safeEq(h, a.hash) && !ag) ag = a;
    if (!ag || !ag.on) {
      f.n += 1;
      if (f.n >= 8) { f.n = 0; f.until = Date.now() + 3600 * 1000; }
      await this.st.put('fail:' + uid, f);
      return { r: 'bad' };
    }
    if (f.n || f.until) await this.st.delete('fail:' + uid);
    const prev = ag.uid && ag.uid !== uid ? ag.uid : 0, fresh = ag.uid !== uid;
    if (prev) await this.st.delete('agu:' + prev);
    ag.uid = uid;
    await this.st.put({ ['a:' + ag.id]: ag, ['agu:' + uid]: ag.id });
    return { r: 'ok', ag, fresh, prev };
  }

  /* --- приложение --- */
  async auth(request) {
    if (!this.env.BOT_TOKEN) return { err: 'no_token' };
    return verifyInitData(request.headers.get('x-init-data') || '', this.env.BOT_TOKEN);
  }
  /* Главный экран: дистрибьюторы, у которых есть товары и которые не отключены. Без входа через Telegram виден только список. */
  async publicList(request) {
    const recs = (await this.allRecs()).filter(r => r.on && r.items > 0);
    const terrs = (await this.terrs()).map(t => ({ id: t.id, name: t.name }));
    const out = { title: await this.title(), shops: recs.map(pubRec), terrs };
    const au = await this.auth(request);
    if (au.user) {
      await this.touchPerson(au.user);
      const sells = await this.sellsOf(au.user.id);
      const all = await this.allRecs();
      const mine = sells.map(id => all.find(r => r.id === id)).filter(Boolean);
      out.me = {
        id: au.user.id, owner: (await this.owners()).includes(au.user.id), region: cleanRegion(await this.st.get('reg:' + au.user.id)),
        // ссылка на каталог нужна продавцу, чтобы раздать её клиентам
        sells: await Promise.all(mine.map(async r => ({ id: r.id, name: r.name, link: await this.link(r.id) })))
      };
      // у владельца на вкладке «Проверка» горит число товаров, которые ждут решения
      if (out.me.owner) out.me.modN = all.reduce((n, r) => n + (Number(r.wait) || 0), 0);
      // доставщик: у каких дистрибьюторов человек возит заказы (запись сверяется с хранилищем, снятые и удалённые пропадают)
      const dl = (await this.st.get('dls:' + au.user.id)) || [];
      if (dl.length) {
        const alive = [], keep = [];
        for (const did of dl) {
          const rec = all.find(r => r.id === did);
          if (!rec) continue;
          const r = await shopCall(this.env, did, '/__/courier-of', { uid: au.user.id });
          if (r.ok && r.data && r.data.courier === null) continue;     // доставщиком больше не является
          keep.push(did);
          if (r.ok && r.data && r.data.courier) alive.push({ id: did, name: rec.name });
        }
        if (keep.length !== dl.length) { if (keep.length) await this.st.put('dls:' + au.user.id, keep); else await this.st.delete('dls:' + au.user.id); }
        if (alive.length) out.me.delivers = alive;
      }
      const ag = await this.agentOf(au.user.id);
      if (ag) out.me.agent = { id: ag.id, name: ag.name, terr: ag.terr || [], link: await this.agentLink(ag.id) };
      // данные магазина из общей базы: форма заказа подставляется сама, на любом телефоне и у любого дистрибьютора
      const bid = await this.st.get('bu:' + au.user.id), br = bid ? await this.st.get('b:' + bid) : null;
      if (br) out.me.card = { name: br.name, phone: br.phone, addr: br.addr || '', terr: terrs.some(t => t.id === br.terr) ? br.terr : '', ver: Number(br.ver) || 0 };
    }
    return json(out);
  }
  async api(request, path, method) {
    const au = await this.auth(request);
    if (au.err) return json({ error: au.err }, au.err === 'no_token' ? 500 : 401);
    await this.touchPerson(au.user);
    const uid = au.user.id;

    if (path === '/api/hub/orders' && method === 'GET') {
      const all = await this.allRecs();
      const list = (await this.userShops(uid)).filter(did => all.some(x => x.id === did));   // удалённые дистрибьюторы пропускаются
      const got = await Promise.all(list.map(async did => {
        const r = await shopCall(this.env, did, '/__/my-orders', { uid });
        const rec = all.find(x => x.id === did);
        return ((r.data && r.data.orders) || []).map(o => Object.assign({}, o, { did, shopName: rec ? rec.name : did }));
      }));
      const orders = [].concat(...got).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return json({ orders });
    }

    // долг магазина по всем дистрибьюторам, у которых он заказывал; full=1 добавляет заказы, оплаты и контакты
    if (path === '/api/hub/debts' && method === 'GET') {
      const full = new URL(request.url).searchParams.get('full') === '1';
      const all = await this.allRecs();
      const list = (await this.userShops(uid)).filter(did => all.some(x => x.id === did));
      const got = await Promise.all(list.map(async did => {
        const r = await shopCall(this.env, did, '/__/my-debt', { uid, full });
        const rec = all.find(x => x.id === did), d = r.data && r.data.debt;
        return d ? Object.assign({}, d, { did, shopName: rec ? rec.name : did }) : null;
      }));
      const debts = got.filter(Boolean).sort((a, b) => (b.over > 0) - (a.over > 0) || b.bal - a.bal);
      return json({ debts, n: debts.length, total: debts.reduce((t, d) => t + d.bal, 0), over: debts.reduce((t, d) => t + d.over, 0), late: debts.filter(d => d.days > 0).length, ask: debts.reduce((t, d) => t + (d.ask || 0), 0) });
    }

    // магазин отвечает «Верно» / «Не так» на запись о выдаче в долг или оплате
    if (path === '/api/hub/debts/confirm' && method === 'POST') {
      const r = await this.readBody(request, 500);
      const b = r.body && typeof r.body === 'object' ? r.body : null;
      if (r.err || !b || !validDid(b.did) || !Number.isInteger(Number(b.n)) || typeof b.ok !== 'boolean') return json({ error: 'bad_request' }, 400);
      if (!(await this.userShops(uid)).includes(b.did) || !(await this.getRec(b.did))) return json({ error: 'not_found' }, 404);
      const sc = await shopCall(this.env, b.did, '/__/my-confirm', { uid, n: Number(b.n), ok: b.ok });
      if (!sc.ok) return json({ error: (sc.data && sc.data.error) || 'server' }, sc.status || 500);
      return json({ debt: sc.data.debt ? Object.assign({}, sc.data.debt, { did: b.did, shopName: (await this.getRec(b.did)).name }) : null });
    }

    // регион магазина: запоминается, чтобы на другом телефоне список был тем же
    if (path === '/api/hub/region' && method === 'PUT') {
      const r = await this.readBody(request, 500);
      const reg = r.body && typeof r.body === 'object' ? r.body.region : undefined;
      if (r.err || (reg !== '' && !cleanRegion(reg))) return json({ error: 'bad_request' }, 400);
      if (reg) await this.st.put('reg:' + uid, reg); else await this.st.delete('reg:' + uid);
      return json({ region: reg });
    }

    // база магазинов: смотрят владелец, агенты и дистрибьюторы; правят владелец и агенты
    if (path === '/api/hub/base' || path.startsWith('/api/hub/base/')) {
      const role = await this.baseRole(uid);
      if (!role) return json({ error: 'forbidden' }, 403);
      if (path === '/api/hub/base' && method === 'GET') return await this.baseList(role, new URL(request.url), uid);
      const mm = path.match(/^\/api\/hub\/base\/(b[a-z0-9]{4,12})\/mine$/);
      if (mm && (method === 'GET' || method === 'PUT')) return await this.baseMine(role, uid, mm[1], method, request);
      if (role.r === 'dist') return json({ error: 'forbidden' }, 403);
      const rd = await this.readBody(request, 3000);
      if (path === '/api/hub/base' && method === 'POST') {
        if (rd.err || !rd.body || typeof rd.body !== 'object') return json({ error: 'bad_request' }, 400);
        return await this.baseCreate(role, rd.body);
      }
      const bm = path.match(/^\/api\/hub\/base\/(b[a-z0-9]{4,12})$/);
      if (bm && method === 'PUT') {
        if (rd.err || !rd.body || typeof rd.body !== 'object') return json({ error: 'bad_request' }, 400);
        return await this.baseUpdate(role, bm[1], rd.body);
      }
      if (bm && method === 'DELETE') return await this.baseDelete(role, bm[1]);
      return json({ error: 'not_found' }, 404);
    }

    // дальше только владелец площадки
    if (!path.startsWith('/api/hub/admin/')) return json({ error: 'not_found' }, 404);
    if (!(await this.owners()).includes(uid)) return json({ error: 'forbidden' }, 403);
    if (path.startsWith('/api/hub/admin/mod')) return await this.adminMod(request, path, method);
    if (path.startsWith('/api/hub/admin/people') || path.startsWith('/api/hub/admin/terr') || path.startsWith('/api/hub/admin/agents') || path === '/api/hub/admin/base/import') {
      const res = await this.adminPeople(request, path, method);
      if (res) return res;
    }
    if (path === '/api/hub/admin/shops' && method === 'GET') {
      const recs = await this.allRecs();
      return json({ title: await this.title(), max: MAX_SHOPS, shops: await Promise.all(recs.map(r => this.ownerRec(r))) });
    }
    if (path === '/api/hub/admin/shops' && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      return await this.createShop(r.body);
    }
    if (path === '/api/hub/admin/title' && method === 'PUT') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body.title !== 'string') return json({ error: 'bad_request' }, 400);
      const t = cleanStr(r.body.title, 60) || HUB_TITLE;
      await this.st.put('title', t);
      return json({ title: t });
    }
    // спорные записи по всем дистрибьюторам: владелец видит, где магазин и продавец не сошлись
    if (path === '/api/hub/admin/disputes' && method === 'GET') {
      const recs = await this.allRecs();
      const got = await Promise.all(recs.map(async rec => {
        const r = await shopCall(this.env, rec.id, '/__/disputes', {});
        return ((r.data && r.data.items) || []).map(x => Object.assign({}, x, { did: rec.id, shopName: rec.name }));
      }));
      return json({ items: [].concat(...got).sort((a, b) => String(b.t).localeCompare(String(a.t))).slice(0, 200) });
    }
    if (path === '/api/hub/admin/disputes/resolve' && method === 'POST') {
      const r = await this.readBody(request, 1000);
      const b = r.body && typeof r.body === 'object' ? r.body : null;
      const isH = !!b && validCid(b.cid);
      if (r.err || !b || !validDid(b.did) || (!isH && !Number.isSafeInteger(Number(b.uid))) || !Number.isInteger(Number(b.n))) return json({ error: 'bad_request' }, 400);
      if (!(await this.getRec(b.did))) return json({ error: 'not_found' }, 404);
      const sc = await shopCall(this.env, b.did, '/__/resolve', isH ? { cid: b.cid, n: Number(b.n), note: b.note, by: au.user } : { uid: Number(b.uid), n: Number(b.n), note: b.note, by: au.user });
      return json(sc.data || { error: 'server' }, sc.status || 500);
    }
    if (path === '/api/hub/admin/analytics' && method === 'GET') return await this.adminAnalytics(new URL(request.url));
    if (path === '/api/hub/admin/stats' && method === 'GET') {
      const rg = statRange(new URL(request.url).searchParams.get('period') || 'month');
      const recs = await this.allRecs();
      const rows = await Promise.all(recs.map(async rec => {
        const r = await shopCall(this.env, rec.id, '/__/stats', { from: rg.from, to: rg.to });
        const d = r.ok && r.data ? r.data : null;
        return { id: rec.id, name: rec.name, on: rec.on, pct: d ? d.pct : 0, n: d ? d.n : 0, base: d ? d.base : 0, cm: d ? d.cm : 0, active: d ? d.active : 0, err: !d };
      }));
      const total = rows.reduce((t, x) => ({ n: t.n + x.n, base: t.base + x.base, cm: t.cm + x.cm, active: t.active + x.active }), { n: 0, base: 0, cm: 0, active: 0 });
      return json({ period: rg.period, from: rg.from, to: rg.to, rows, total });
    }
    const m = path.match(/^\/api\/hub\/admin\/shops\/([a-z0-9]{2,12})(\/code)?$/);
    if (m) {
      const rec = await this.getRec(m[1]);
      if (!rec) return json({ error: 'not_found' }, 404);
      if (!m[2] && method === 'DELETE') return await this.deleteShop(rec);
      const r = await this.readBody(request, 2000);
      if (r.err) return json({ error: 'bad_request' }, 400);
      if (m[2] && method === 'POST') return await this.resetCode(rec, r.body || {});
      if (!m[2] && method === 'PUT') {
        const b = r.body && typeof r.body === 'object' ? r.body : {};
        const hasOn = typeof b.on === 'boolean', hasPct = b.pct !== undefined;
        if (!hasOn && !hasPct) return json({ error: 'bad_request' }, 400);
        let pct;
        if (hasPct) {
          pct = cleanPct(b.pct);
          if (pct === null) return json({ error: 'bad_pct' }, 400);
          const sp = await shopCall(this.env, rec.id, '/__/cpct', { pct });
          if (!sp.ok) return json({ error: 'server' }, 500);
        }
        if (hasOn) {
          rec.on = b.on;
          await this.st.put('d:' + rec.id, rec);
          await shopCall(this.env, rec.id, '/__/off', { off: !rec.on });
        }
        return json(Object.assign({ shop: await this.ownerRec(rec) }, hasPct ? { pct } : {}));
      }
    }
    return json({ error: 'not_found' }, 404);
  }
  /* Аналитика продаж, владелец: только выданные заказы за период (7/30/90/365 дней), по всем дистрибьюторам или по одному (?sh=).
     Категории сводятся по названию, магазины по записи базы (номера аккаунтов наружу не уходят). */
  async adminAnalytics(url) {
    const sp = url.searchParams, d = Number(sp.get('days'));
    const days = RP_RANGES.includes(d) ? d : 30;
    const to = dayOf(new Date().toISOString()), from = addDays(to, -(days - 1));
    const recs = await this.allRecs();
    const sh = recs.some(r => r.id === sp.get('sh')) ? sp.get('sh') : '';
    const res = await Promise.all((sh ? recs.filter(r => r.id === sh) : recs).map(async r => ({ r, x: await shopCall(this.env, r.id, '/__/analytics', { from, to }) })));
    const um = await this.uidMap();
    const tot = { n: 0, sum: 0, shops: 0 }, cats = new Map(), prods = [], stores = new Map();
    let partial = false, failed = 0, since = '';
    for (const { r, x } of res) {
      const a = x.ok && x.data && x.data.tot ? x.data : null;
      if (!a) { failed++; continue; }
      tot.n += a.tot.n; tot.sum += a.tot.sum;
      if (a.tot.n > 0) tot.shops++;
      if (a.partial) partial = true;
      if (a.since && (!since || a.since < since)) since = a.since;
      for (const c of a.cats) {
        const key = String(c.name || '').trim().toLowerCase();
        const e = cats.get(key) || { name: c.name, uz: c.uz || '', n: 0, qty: 0, sum: 0 };
        e.n += c.n; e.qty += c.qty; e.sum += c.sum; if (!e.uz && c.uz) e.uz = c.uz;
        cats.set(key, e);
      }
      for (const p of a.prods) prods.push({ name: p.name, shop: r.id, shopName: r.name, n: p.n, qty: p.qty, sum: p.sum });
      for (const c of a.cls) {
        const bid = um.bidOf.get(Number(c.uid)), key = bid || 'u' + c.uid;
        const e = stores.get(key) || { bid, name: c.name || '', org: c.org || '', n: 0, sum: 0, shops: new Set(), last: '' };
        e.n += c.n; e.sum += c.sum; e.shops.add(r.id); if (c.last > e.last) e.last = c.last;
        stores.set(key, e);
      }
    }
    const bids = [...new Set([...stores.values()].map(e => e.bid).filter(Boolean))], nm = new Map();
    for (let i = 0; i < bids.length; i += 100) {
      const got = await this.st.get(bids.slice(i, i + 100).map(b => 'b:' + b));
      got.forEach(rec => { if (rec && rec.name) nm.set(rec.id, rec.name); });
    }
    const storesOut = [...stores.values()].map(e => ({ name: nm.get(e.bid) || e.name, n: e.n, sum: e.sum, nd: e.shops.size, last: e.last }))
      .sort((a, b) => b.sum - a.sum || b.n - a.n);
    prods.sort((a, b) => b.sum - a.sum || b.n - a.n);
    return json({
      days, from, to, sh, since, partial, failed,
      shops: recs.map(r => ({ id: r.id, name: r.name })),
      tot: Object.assign(tot, { stores: storesOut.length }),
      cats: [...cats.values()].sort((a, b) => b.sum - a.sum),
      prods: prods.slice(0, 300), nprods: prods.length,
      stores: storesOut.slice(0, 300), nstores: storesOut.length
    });
  }
  /* Проверка товаров, владелец: список со всех дистрибьюторов, одобрить, вернуть с причиной, поправить, фото. */
  async adminMod(request, path, method) {
    const url = new URL(request.url), origin = url.origin, sp = url.searchParams;
    const recs = await this.allRecs();
    if (path === '/api/hub/admin/mod' && method === 'GET') {
      const seg = sp.get('seg') === 'ret' || sp.get('seg') === 'ok' ? sp.get('seg') : 'wait';
      const got = await Promise.all(recs.map(async r => { const x = await shopCall(this.env, r.id, '/__/mod-list', { seg }); return { r, d: x.ok && x.data ? x.data : null }; }));
      const items = [], counts = { wait: 0, ret: 0, ok: 0 }, shops = [];
      got.forEach(({ r, d }) => {
        if (!d) return;
        const dn = d.name || r.name;
        counts.wait += d.counts.wait; counts.ret += d.counts.ret; counts.ok += d.counts.ok;
        if (d.items.length) shops.push({ id: r.id, name: dn, n: d.items.length, cats: d.cats || [] });
        d.items.forEach(i => items.push(Object.assign({}, i, { did: r.id, dname: dn })));
      });
      items.sort((a, b) => String(b.ma || b.mt || '').localeCompare(String(a.ma || a.mt || '')));
      return json({ seg, items: items.slice(0, 300), counts, shops });
    }
    const did = validDid(sp.get('did')) ? sp.get('did') : '';
    if (path === '/api/hub/admin/mod/photo' && (method === 'PUT' || method === 'DELETE')) {
      if (!did || !recs.some(r => r.id === did)) return json({ error: 'not_found' }, 404);
      const q = '?id=' + encodeURIComponent(sp.get('id') || '') + '&n=' + encodeURIComponent(sp.get('n') || '1') + (method === 'DELETE' ? '&del=1' : '');
      if (method === 'PUT' && Number(request.headers.get('content-length') || 0) > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
      const bytes = method === 'PUT' ? new Uint8Array(await request.arrayBuffer()) : new Uint8Array(0);
      const r = await stubOf(this.env.SHOP, did).fetch(new Request('https://internal/__/mod-photo' + q, { method: 'POST', headers: { 'content-type': 'application/octet-stream', 'x-did': did }, body: bytes }));
      let data = null; try { data = await r.json(); } catch (e) { /* пусто */ }
      return json(data || { error: 'server' }, r.status);
    }
    const rd = await this.readBody(request, 30000);
    const b = rd.body && typeof rd.body === 'object' ? rd.body : null;
    if (rd.err || !b) return json({ error: 'bad_request' }, 400);
    const have = id => validDid(id) && recs.some(r => r.id === id);
    if (path === '/api/hub/admin/mod/approve' && method === 'POST') {
      const by = new Map();
      for (const x of (Array.isArray(b.items) ? b.items : []).slice(0, 300)) {
        if (!x || !have(x.did) || !validId(x.id)) continue;
        by.set(x.did, (by.get(x.did) || []).concat([x.id]));
      }
      let n = 0;
      for (const [d, ids] of by) { const r = await shopCall(this.env, d, '/__/mod-approve', { ids, origin }); n += r.data && r.data.n || 0; }
      return json({ ok: true, n });
    }
    if (!have(b.did)) return json({ error: 'not_found' }, 404);
    if (path === '/api/hub/admin/mod/return' && method === 'POST') {
      const r = await shopCall(this.env, b.did, '/__/mod-return', { id: b.id, reason: b.reason, origin });
      return json(r.data || { error: 'server' }, r.status);
    }
    if (path === '/api/hub/admin/mod/edit' && method === 'PUT') {
      const r = await shopCall(this.env, b.did, '/__/mod-edit', { id: b.id, item: b.item });
      return json(r.data || { error: 'server' }, r.status);
    }
    return json({ error: 'not_found' }, 404);
  }
  /* Проверяет код, который задал владелец, или придумывает новый. Возвращает {code, hash} или {err}. */
  async pickCode(want, except) {
    let code;
    if (want === undefined || want === null || want === '') code = newCode();
    else {
      if (typeof want !== 'string') return { err: 'bad_request' };
      code = cleanStr(want, 64);
      if (code.length < MIN_CODE) return { err: 'weak_code' };
    }
    const hash = await sha256hex('code:' + code);
    if (this.env.ADMIN_CODE && safeEq(hash, await sha256hex('code:' + this.env.ADMIN_CODE))) return { err: 'code_taken' };
    for (const x of await this.allRecs()) if (x.hash && x.id !== except && safeEq(hash, x.hash)) return { err: 'code_taken' };
    for (const x of await this.allAgents()) if (x.hash && x.id !== except && safeEq(hash, x.hash)) return { err: 'code_taken' };
    return { code, hash };
  }
  async createShop(b) {
    const name = cleanStr(b.name, 60);
    if (name.length < 2) return json({ error: 'bad_name' }, 400);
    const idx = (await this.st.get('dx')) || [];
    if (idx.length >= MAX_SHOPS) return json({ error: 'too_many' }, 409);
    const c = await this.pickCode(b.code);
    if (c.err) return json({ error: c.err }, c.err === 'code_taken' ? 409 : 400);
    let id;
    do { id = 's' + randId(5).toLowerCase(); } while (idx.includes(id));
    const init = await shopCall(this.env, id, '/__/init', { name, pct: COMM_DEFAULT });
    if (!init.ok) return json({ error: 'server' }, 500);
    const rec = newRec(id, name, c.hash);
    await this.st.put({ ['d:' + id]: rec, dx: idx.concat([id]) });
    return json({ shop: await this.ownerRec(rec), code: c.code });
  }
  /* Удаление дистрибьютора совсем: сначала очищается его хранилище (если не вышло, ничего не меняется), потом запись в реестре.
     Продавцы теряют доступ. Первого дистрибьютора (компанию владельца) удалить нельзя. */
  async deleteShop(rec) {
    if (rec.id === MAIN) return json({ error: 'main_shop' }, 409);
    const adm = (await shopCall(this.env, rec.id, '/__/admins', {})).data;
    const admins = adm && Array.isArray(adm.admins) ? adm.admins.filter(Number.isSafeInteger) : [];
    const wipe = await shopCall(this.env, rec.id, '/__/wipe', {});
    if (!wipe.ok) return json({ error: 'server' }, 500);
    for (const uid of admins) await this.setSeller(uid, rec.id, false);
    await this.st.put('dx', ((await this.st.get('dx')) || []).filter(x => x !== rec.id));
    await this.st.delete('d:' + rec.id);
    return json({ ok: true, id: rec.id });
  }
  /* Новый код дистрибьютора. Прежние продавцы теряют доступ и входят заново по новому коду. */
  async resetCode(rec, b) {
    const c = await this.pickCode(b.code, rec.id);
    if (c.err) return json({ error: c.err }, c.err === 'code_taken' ? 409 : 400);
    const cleared = await shopCall(this.env, rec.id, '/__/admin-clear', {});
    const removed = cleared.data && Array.isArray(cleared.data.removed) ? cleared.data.removed : [];
    for (const uid of removed) await this.setSeller(uid, rec.id, false);
    rec.hash = c.hash;
    rec.sellers = 0;
    await this.st.put('d:' + rec.id, rec);
    // владельцы площадки остаются продавцами первого дистрибьютора: у них свой код (ADMIN_CODE)
    if (rec.id === MAIN) for (const uid of await this.owners()) {
      const res = await shopCall(this.env, MAIN, '/__/admin-add', { uid });
      await this.setSeller(uid, MAIN, true, res.data && res.data.admins);
    }
    return json({ shop: await this.ownerRec(rec), code: c.code });
  }

  /* --- бот --- */
  async webhook(request) {
    if (!this.env.BOT_TOKEN) return new Response('no token', { status: 500 });
    const secret = await this.webhookSecret();
    const given = request.headers.get('x-telegram-bot-api-secret-token') || '';
    if (!safeEq(given, secret)) return new Response('forbidden', { status: 403 });
    let up = null;
    try { up = await request.json(); } catch (e) { return json({ ok: true }); }
    try {
      await this.ensure();
      if (up && up.message) await this.onMessage(up.message);
      else if (up && up.callback_query) await this.onCallback(request, up, given);
    } catch (e) {
      console.error('webhook handler error', e && e.stack || e);
    }
    return json({ ok: true });
  }
  /* Нажатие кнопки под заказом уходит в хранилище того дистрибьютора, чей это заказ. */
  async onCallback(request, up, secret) {
    const did = cbParse(up.callback_query.data).did;
    if (!validDid(did) || !(await this.getRec(did))) return;
    await stubOf(this.env.SHOP, did).fetch(new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-did': did, 'x-telegram-bot-api-secret-token': secret },
      body: JSON.stringify(up)
    }));
  }
  async onMessage(msg) {
    if (!msg.from || !msg.chat || msg.chat.type !== 'private') return;
    await this.touchPerson(msg.from);
    const uid = msg.from.id, chat = msg.chat.id;
    const text = String(msg.text || '').trim();
    const lang = String(msg.from.language_code || '').toLowerCase().startsWith('uz') ? 'uz' : 'ru';
    const cmd = text.split(/\s+/)[0].split('@')[0].toLowerCase();
    const openText = 'CATALOG';
    const isSeller = async () => (await this.sellsOf(uid)).length > 0;

    if (cmd === '/admin') {
      const code = text.replace(/^\S+\s*/, '');
      if (!code) {
        const adm = await isSeller();
        await this.tg('sendMessage', { chat_id: chat, text: adm ? bilingual(lang, 'Вы подключены как продавец. Новые заказы приходят в этот чат.', 'Siz sotuvchi sifatida ulangansiz. Yangi buyurtmalar shu chatga keladi.') : await this.welcome(lang, false, ''), reply_markup: openBtn(this.origin, openText) });
        return;
      }
      const res = await this.tryCode(code, uid);
      // код не должен оставаться в переписке
      await this.tg('deleteMessage', { chat_id: chat, message_id: msg.message_id });
      if (res.r === 'ok') {
        const rec = await this.getRec(res.did);
        if (res.fresh) await this.notifyOwners('🔑 Вход по коду: ' + whoFull(msg.from) + ' вошёл как ' + (res.owner ? 'владелец площадки' : 'продавец «' + (rec ? rec.name : res.did) + '»') + '.', uid);
        const who = res.did === MAIN && res.owner ? 'Готово, вы продавец.' : 'Готово, вы продавец «' + (rec ? rec.name : res.did) + '».';
        await this.tg('sendMessage', {
          chat_id: chat,
          text: who + ' Новые заказы будут приходить сюда с кнопками «Принять», «Готов», «Выдан». Каталог, цены и настройки меняются в приложении, вкладка «Продавец».'
            + (res.owner ? '\n\nВы также владелец площадки: дистрибьюторов можно добавлять в приложении: кнопка ☰ → «Дистрибьюторы» → «Добавить».' : ''),
          reply_markup: openBtn(this.origin, 'Открыть приложение', sellerUrl(this.origin, res.did))
        });
      } else if (res.r === 'locked') {
        await this.tg('sendMessage', { chat_id: chat, text: 'Слишком много неверных попыток. Попробуйте через час.' });
      } else if (res.r === 'nocode') {
        await this.tg('sendMessage', { chat_id: chat, text: 'На сервере не задан ADMIN_CODE.' });
      } else if (res.r === 'error') {
        await this.tg('sendMessage', { chat_id: chat, text: 'Не получилось подключить. Попробуйте ещё раз.' });
      } else {
        await this.tg('sendMessage', { chat_id: chat, text: 'Неверный код.' });
      }
      return;
    }

    if (cmd === '/agent') {
      const code = text.replace(/^\S+\s*/, '');
      if (!code) {
        await this.tg('sendMessage', { chat_id: chat, text: 'Отправьте «/agent КОД». Код агента выдаёт владелец площадки.' });
        return;
      }
      const res = await this.tryAgentCode(code, uid);
      await this.tg('deleteMessage', { chat_id: chat, message_id: msg.message_id });   // код не должен оставаться в переписке
      if (res.r === 'ok') {
        if (res.fresh) await this.notifyOwners('🔑 Вход по коду: ' + whoFull(msg.from) + ' вошёл как агент «' + res.ag.name + '».' + (res.prev ? ' Этот код раньше был у другого Telegram-аккаунта (ID ' + res.prev + '), тот аккаунт отключён.' : ''), uid);
        const names = (await this.terrs()).filter(t => (res.ag.terr || []).includes(t.id)).map(t => t.name);
        await this.tg('sendMessage', {
          chat_id: chat,
          text: 'Готово, вы агент «' + res.ag.name + '».' + (names.length ? ' Территории: ' + names.join(', ') + '.' : '')
            + '\n\nВ приложении откройте вкладку «База»: там можно проверять данные магазинов после визита, исправлять ошибки и добавлять тех, кого ещё нет. Свою ссылку для магазинов вы найдёте там же.',
          reply_markup: openBtn(this.origin, 'Открыть базу', this.origin + '/?v=base')
        });
      } else if (res.r === 'locked') await this.tg('sendMessage', { chat_id: chat, text: 'Слишком много неверных попыток. Попробуйте через час.' });
      else await this.tg('sendMessage', { chat_id: chat, text: 'Неверный код.' });
      return;
    }

    // «/start d_<номер>» — ссылка на каталог конкретного дистрибьютора; всё остальное — общее приветствие
    const payload = cmd === '/start' ? (text.split(/\s+/)[1] || '') : '';
    // «/start c_<дистрибьютор>_<ключ>» — приглашение доставщика, которое выдал продавец
    const cj = payload.match(/^c_([a-z0-9]{2,12})_([a-z0-9]{6,12})$/);
    if (cj) { await this.courierJoin(uid, chat, lang, cj[1], cj[2], msg.from); return; }
    // «/start a_<номер>» — личная ссылка агента: магазин, пришедший по ней, закрепляется за агентом (при первом заказе)
    const am0 = payload.match(/^a_(a[a-z0-9]{3,10})$/);
    if (am0 && !(await this.st.get('ref:' + uid))) { const ag = await this.st.get('a:' + am0[1]); if (ag && ag.on) await this.st.put('ref:' + uid, ag.id); }
    let target = null;
    const m = payload.match(/^d_([a-z0-9]{2,12})$/);
    if (m) { const rec = await this.getRec(m[1]); if (rec && rec.on) target = rec; }
    await this.tg('sendMessage', {
      chat_id: chat,
      text: await this.welcome(lang, await isSeller(), target ? target.name : ''),
      reply_markup: openBtn(this.origin, openText, target ? shopUrl(this.origin, target.id) : this.origin + '/')
    });
  }
  /* Доставщик нажал ссылку-приглашение: хранилище дистрибьютора проверяет ключ и записывает его, площадка запоминает, где он доставщик. */
  async courierJoin(uid, chat, lang, did, tok, from) {
    const say = (ru, uz, markup) => this.tg('sendMessage', { chat_id: chat, text: bilingual(lang, ru, uz), reply_markup: markup });
    const rec = await this.getRec(did);
    const r = rec ? await shopCall(this.env, did, '/__/courier-join', { uid, token: tok }) : null;
    if (!r || !r.ok || !r.data || !r.data.ok) {
      if (r && r.status === 409) await say('Вы уже доставщик у другого продавца площадки или у этого. Один человек — одна запись.', 'Siz allaqachon yetkazib beruvchisiz. Bir kishi — bitta yozuv.');
      else await say('Ссылка не подошла: она устарела или уже использована. Попросите продавца прислать новую.', 'Havola yaroqsiz: eskirgan yoki allaqachon ishlatilgan. Sotuvchidan yangisini soʻrang.');
      return;
    }
    const dl = (await this.st.get('dls:' + uid)) || [];
    if (!dl.includes(did)) await this.st.put('dls:' + uid, dl.concat([did]));
    await this.notifyOwners('🔑 Вход по приглашению: ' + whoFull(from || { id: uid }) + ' стал доставщиком «' + rec.name + '».', uid);
    await say('Готово, вы доставщик «' + rec.name + '». Когда продавец отметит заказ готовым к доставке, он придёт сюда с кнопкой «Взял». Заказы, должников и кассу смотрите в приложении.',
      'Tayyor, siz «' + rec.name + '» yetkazib beruvchisisiz. Sotuvchi buyurtmani yetkazishga tayyor deb belgilasa, u shu yerga «Взял» tugmasi bilan keladi. Buyurtmalar, qarzdorlar va kassa ilovada.',
      openBtn(this.origin, lang === 'uz' ? 'Yetkazib berishni ochish' : 'Открыть доставку', courierUrl(this.origin, did)));
  }
  /* Приветствие: если дистрибьютор один (или клиент пришёл по ссылке на него), говорим от его имени, иначе от имени площадки. */
  async welcome(lang, isAdmin, shopName) {
    let name = shopName;
    if (!name) {
      const vis = (await this.allRecs()).filter(r => r.on && r.items > 0);
      name = vis.length === 1 ? vis[0].name : await this.title();     // один дистрибьютор: от его имени, иначе от имени площадки
    }
    return welcomeText(lang, isAdmin, { name });
  }
}
