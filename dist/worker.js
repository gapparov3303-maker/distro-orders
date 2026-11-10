// Файл собран автоматически (node build.js). Править нужно файлы в src/.
const APP_HTML = "<!doctype html>\n<html lang=\"ru\"><head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n<meta name=\"color-scheme\" content=\"light dark\">\n<title>Каталог</title>\n<script src=\"https://telegram.org/js/telegram-web-app.js\"></script>\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Unbounded:wght@500;700&display=swap\">\n<style>\n/* Layout: catalog with search and categories, cart with order form; seller panel is a tabbed list of orders, catalog editor and settings. */\n:root{\n  --bg:#F3F7F6; --surface:#FFFFFF; --surface-2:#E7EFED; --ink:#14231F; --ink-2:#5B6E69; --line:#D6E3E0;\n  --accent:#0F766E; --accent-ink:#FFFFFF; --accent-soft:#D9F0EC;\n  --stage-a:#E2F1EE; --stage-b:#E6ECF7;\n  --ok:#1F7A4D; --ok-soft:#DDF3E6; --warn:#9A5B00; --warn-soft:#FBEBCB; --bad:#B3261E; --bad-soft:#FBE0DD; --info:#1F5FA3; --info-soft:#DCEBFA; --mute:#5B6E69; --mute-soft:#E7EFED;\n  --f-display:'Unbounded','Onest',system-ui,sans-serif;\n  --f-body:'Onest',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;\n  --hdr:56px;\n}\n@media (prefers-color-scheme: dark){\n  :root:not([data-theme=\"light\"]){\n    --bg:#0E1614; --surface:#162220; --surface-2:#1D2D2A; --ink:#E8F3F0; --ink-2:#9DB5AF; --line:#27403B;\n    --accent:#4FD1C0; --accent-ink:#06211D; --accent-soft:#16403A;\n    --stage-a:#1B2B28; --stage-b:#1B2433;\n    --ok:#6FD3A0; --ok-soft:#1D3A2D; --warn:#F2B957; --warn-soft:#3F3015; --bad:#FF8A80; --bad-soft:#44201E; --info:#7DB6F0; --info-soft:#1B3149; --mute:#9DB5AF; --mute-soft:#1D2D2A;\n    color-scheme:dark;\n  }\n}\n:root[data-theme=\"dark\"]{\n  --bg:#0E1614; --surface:#162220; --surface-2:#1D2D2A; --ink:#E8F3F0; --ink-2:#9DB5AF; --line:#27403B;\n  --accent:#4FD1C0; --accent-ink:#06211D; --accent-soft:#16403A;\n  --stage-a:#1B2B28; --stage-b:#1B2433;\n  --ok:#6FD3A0; --ok-soft:#1D3A2D; --warn:#F2B957; --warn-soft:#3F3015; --bad:#FF8A80; --bad-soft:#44201E; --info:#7DB6F0; --info-soft:#1B3149; --mute:#9DB5AF; --mute-soft:#1D2D2A;\n  color-scheme:dark;\n}\n*{box-sizing:border-box}\nhtml,body{margin:0}\nbody{-webkit-text-size-adjust:100%;min-height:100vh;background:var(--bg);color:var(--ink);font:15px/1.45 var(--f-body);-webkit-font-smoothing:antialiased}\nbody::before{content:\"\";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);background:var(--bg);z-index:30}\nbutton,input,select,textarea{font:inherit;color:inherit}\nh1,h2,h3,p{margin:0}\n.wrap{max-width:1080px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n\n/* header */\n.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--bg);border-bottom:1px solid var(--line)}\n.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:var(--hdr)}\n.brand{display:flex;align-items:center;gap:10px;font:700 15px/1 var(--f-display);letter-spacing:.01em;min-width:0}\n.brand svg{flex:none}\n.logo{flex:none;width:42px;height:42px;border-radius:11px;background:#faf5ed url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAIAAAAErfB6AABD+ElEQVR42u19d5ieVdH+zDnnKW/dXrK76T2kQIBQQ0d6E1Hgo6goCGL7ELuiKHb4UMQOShGlV+lEektCeu+bZJPt7771KefM/P543k2CUpIQQvC3c+11JdlkN+8+9ztz5txzzwwGhW4YsP9eEwOPYADgARsAeMAGAB6wAYAHbADgARsAeMAGAB4AeMAGAB6wAYAHbADgARsAeMAGAB6wAYAHAB6wAYAHbADgARsAeMAGAB6wAYAHbADgARsAeADgARsAeMD2ZFP/v/ygzP2/8rafRsRt/zAA8IcDS2YGZmAABABAIUAIISUAoJRCCmBgACZiYyD6DRETQfSFiICIiP8FkKv/HlCJmBmFEEpJyxLS7j+AjAk84/ul3l4A8DJ9Xi4npEIEK5GIVaSZSLiuchw7mQKQAAKAiEMKQw5DJip7+ocTb/Vh91QmElIK25aWA6AYAj+TKaxa1bdmbaF1Q2b16sKG9aWubj9fyLW1AVNQLIXFkhDIjCLmJFJJQeSkkvHqKqe+IVZbUz12bHLIkNSwoYmWFrumRlpxACDyje+z1uV48OFBGj+M3YVMxMTCUioWQ7CNKZXaNnUtWNg+e3bXnDm9y1Zk29rCbJ4Itp63CFICCpRKIghiAgAgBjICBRIBQdlXASwAJ+m6NTWpYcNq95lSPXWf6imTEyNG2MkqBjJ+kYLgw4L0hwlgZmZjhFQqEUewgnxv94JFrc/MWD/j2b6lSwqbOjWAABAK0FIoFQgEBmAAZGBAZoEADMSMAAwgGAQiYjkCY/nEBmRgYzgMMSQAkADxVDwxakTNwQcPPu7YmmnT3IZGANSlPIchCIFCDAD8nl2W2XJdYSW0n+uaO2/1w/9c/fAjvctXlLxQAFgWCmWV4YoSJQBgJoYIQVHGDoCBEUX5k4iIQAwIzAAIAhCBkZgREFEiIiIZAq21HxqAmIDU0MH1hxw05ONn1R023amoM6ZkisUofRsAeMehNQYQ7WQSQGVWr1jx0CMr77mvc+YsP9AKQcUsEJKJmRmZAKHshVEiDJGfCoEoEAAQmJgItEEmgQiGiUAgQP8/NgwCQFmCmQFQSAlSCCEkIgMiMLDRXgCaLQGVe41rOfnkweeeXTlxEgPrfA6Y9zSY91yA+6FNM+u2V19f8Nfblt3/QKGzxwKQrqWUFGXHZuyP4IiADKLstIAASMShBgIBQAAA4MSsRFW1jMUMgpWuqBg9urBpM4WB9gKpVM3Y0dn1G4rr1glmCEPK5f1i0RiSAASAAMJWaFtCKSAKcwVkiFcmG485ZtSll9QecRgKFeazexTMeyLA0c3ETqaZzdoZz866/tfrnngyCMkSYDsWIxKxjBySIQq/2M9aSEY0xEFoAAAgJqCieVBi9OiK4UPdpqaqffeNVVYkR44Urhvkcm5NtZOuKmW6gchoI5SMV9eHpVxhw0ZglpbSmWyQyRRa1/mt67vnzs8vW15s3RDm8gaAAcCxlOtwqHXRc5SoP+Kw0V+6fNDJJwNAmMvuISnYngVwlEY5qRQgrnrqmVnX37Dm0ScAwLUFSsVMQMyAIFBEhymAQBRCACIHIQVGAMQlVo4cWbv/vvUHTquePCk1erRTX4dSAQCCINYUhsCEQpLWrLWwVJRlMTOFIUopbAu2hHepEBQAMoQ6l80tX15au679X89vfv7F0tq1pVyBAZRjCaW4ULIVNJx88qgvf7Hh8CN1UCTPQ6UGAC4baa1cV9rxTbNnvnDNT1c98BAy2K5CIcAQbuUbUZQZKlBSInHoBQzgxpy6KZOHHv+RlmOPrhg/zq2qia7FJggoDLekXWXKAvpprigpezNbycT9f9P/VcwgBEopHEcIG4D97s7C+vVdL77c9fSMjmef9/uyCkDEXb/ooSXHXPLZcd/6WnzQ4CCfKV+o/n8GuD8mV+U2tb76s2vn/fHPfsmPuZYQSFw+ZaMPZhDAAgUgshcIBltA3b5Th556csuJx1dPGK/cNENgPK8MqhC7koHaQoICCMsSti2EzWD6Fi3qevpf7Q893PHCS6VQKyVYU2pYy8Qffn/weedT6JtS6YNy5Q8eYNLaisWEZb/x11tf/N7V2fUb4o4USprQIECU/jIzMCCiEEIg6GKgAarra0effsrwj57WdOSR0k4w+7rksda7GNR3BxtlPCZlzJhSz6uvtd7+9033PZDv6IpKdcPO/dheP/tpvGVomO1BJftDz/8fADMzENmp6sy6VU9/9RuL77nflqAcB8jIcjhmBISoMoCIQphSgAD1e40dd97/jDn74+lhoxi0LhbKuH5AkZCJgAillIm4ADu3ZsXam/6y9qZbvM3tDJAcNXzvX/9f0wmnhoWeiC3//wJgNkZYlnITC267bcY3v9O3cVM8YSMCaWIGif2VamIEFFLqkq8BBk2ZOPXyS0d9/CwnXWPCgimV9igiiYmAWMZcaSUKratW//GmNTffkt202VFi4g+/N/bKK0mHFAS78xL1wQBMWtvJlJfNPnnF1+fdfIsrQTmW0RQFZABALl9+pJTkBb7hhrGj9vvaFaM//jE7WRWWslG6i3smFRxRqjFXWancmqUrf3bdyj//pWjMmHM+tu/vfyvjcVMs7LYj+QMAmLR20tUdixfce94nN82Zn4rbCIyGAIAAEUEACGYUUgAEpSBRXTnlS5fvfdklsdqmsJghrYWUH4J6DjMbI2MxacU7XvjXvK99u/XV1wdNnXz4/XfHhwwPs727B+PdCzAzETmp2hWPPfzApz5TbO90YzZErCFz2XEBEMESQhcDBhhz9lkHff871WMnaa/PBMGHA9r/OJ6tdIUuFpf/5nfzv/ndxJCWwx66t3LS5CCb2Q0Y7z6Ao9uOlah87Vf/99SV3wStLdcibbBcyWFRdl9EAOOFdSOHHfLLn408/QwyQVgofOig/beEA6W04lVds1555aKLc8tXHvP80/X7H+Rnu8X7jPFuApiJUEjpujOu+sHzP/pZzJJCIhNhP7cgAJBBCsFBaAj2vujCQ370g3hjc5DrjfJngA+95oSMsdNpUyy9+uWvrrrjHyfMeKx+2kF+tvd9xVjtNnSVG3vo0s+/9seb03EHInlNVIoFRgZkEFIGXljZUHfEdT8fe+55Jij62R6h/ltERYhCqTCXQ6UO/eNNlRPGP37cqSc991TN5H2CbM/7F6vfdw/egu4/L77ktZtuTSRd0DriBwQwAgqgiJgoeXrIQdNOvOWmqtETglx3ma/YeRKCgBmjbxLp6HY7yfD2yRfZ6bqV9/x99vd/cNx991SMGhUWcu/T3en9BZiZhRDCdv958SWzbr4tnnDZhOV6baS+QJSIgsj3zZRLPn3ktb+UrhMW8jvnuJFECwCUbUvHBbAo9EJNQiqkkI3fzzbjnkC8O+n61scfXnrLLdN//Wu7ImUC//04id5PgCMaz3UfuvjS2Tffmkg4pE05JgMIYMkghaRQSymnX/ezfT7/BV0qkA536L3MZcqQUAjLdtFyATDbvnHD0oU9qxcNr9lQ05A2VXvL2kki0SyEAu0xhXsC0hSGTkXDhheeWfvEUwd865uI9G+a7T0dYDbGTlU/fsVXXrzuhmTCYW04isnIgkEAW0KGXmjX1px00+9HnPKxINe5Q2E5glYpJV0XwAbjdbWuWzHzlaUv/WvZay92rF9bysLEqfFvfmN6GDLJONRMNLX7q9opMtGIzGB8pvCDhTmiBNpef7WwvnXEqaeawN/l1I16P1963fM/u+bl625IxR3SBoAFbKWXlVS6GLh11Wc8dG/TgYf5fe3CsnYoPCilhOMUenvXz5619PWXl7/87IaFczLtGWKw42C7SigOAttATEgCE3DbS7jxhTBWr2smy4ZpWDVBuLXIAVD4QWEslArymcape3vDhrwf6L5fAJPWTrpmyQN3zfj2VY5raTIILKK7EDAYUkrpYtAwfvTxd95RO2myn+3YIXSZWUiVy2b//oPvrJn5fPv6dcUCOxa4cYhXKmIEJiAgbaQARI4EViwTAMxexqx5PFjzBDm1WDMxNekCjDV8gBijENr37YqKqMfiQwAwG2MnU12LFzxy8eVSAAoAw/3VXEZgpSSVwvpxo0/950Pp4SP8bEYoa0czc5VI/vOn1zxy4601TSCUSFdHjBhFAjwAYGSOFLIoI9kssAEiBIFWEojA66FVD+TzG5JHXIsf6GGMiKz1+0TjiF2fNluW19d337nnFzq7pKXAkGDASJ8MIIQMSzo9pOm0fz6QGjbMz2Z29qZLfW1rKqulsGxkADYYVY8x0j5SJNrQVFZxCCkRBXPUj6SBDaJiq4oLbRBmASUA75q8kgkiVf02n+3/eCeQPxxEBxOpROWTX/jy+nkL4zG7P20GZEYAIYUOTbKx7tR7/pEaMSrYeXQBACwnhsAKWRuCgEohGISYA44tQEpEtARJAURGoGAEIVgp8AMGZNaGo3werV3404O0GC1gQvKBDQACCkBV/lvS/YqjrZIh+BD1JkVH7/xbbp7951tijiKtEaOfhgFYILIhx3VOu/vvDfsfvPM0LDNK4Wcz2Z5sGJAqUbK2ZtDwkYn6QdlMrnPN6mL7OvI0SwgJDJFQFhALQb19fkdnftzYqlw+ABRkDGlfso/AsAvuJwyoqNhp+W3Cjun4CFJpRKaggGGGmQ3YMlaFwMJ4zCykJO4X5gMDm22kZnskwExkxeK9a1Y8/tVvgBRMhBEZiYBRoQgFBfq4P/+65dCj/L4dy6q23oqYAcByHWGLxhGjjz77Yw0jR+dyfUcd2VSXyhHEMvrMzoy9bO6i5fMXr1i4xFghGS2NhyrmJFJ33zjrqCMGjRuTkpZl2YqsFDn1JOJSOawLwFT2uZ1611kWP/mHKx66/fEJY2tO/MTJQw44Ld/6BmSWW1CQqK14pagYhYOP8+KjhbKKhULMRstWTGTAYpXgsCiAYE++JqFUz3z167muHjdmkTZSCIx6gBClEL4XHvm9b4y/4CI/17n96G4hp6RSluOAcAB0rrNz5eyZ2WymI5Nf+ch9ratWvviAuubre6cTdpV06ysaxx+WDI85sCc43XNaClXK6psbKyxdPmdpV1vfXfeE4/ebeOBhIxMNo5WCqnRQWvGwM3S6TDQJ6UBEeJWj6w5ckZkZlfJL/vwl/qrWtllv3HTGic+88GprKZSOa6WSVmNNbGjTvxob/zHhgINlsqZnwwarIrFuYz4dV4CiasxBzviPhVqW/+s9jeiIgvO8m/9030WXWq7FzCI6dBGQQSqpi8HEj5568r13B/lc1Oy1nVFBWko6CQD0c71tq1Ytn/PG3OdmrJr9auemtpBYh2ArUDaELH71o+kjhlaUSpq1z9pDCqSbQLdKO006PVq7Tdd94Zub1nYcfOyxJd9s3Nia62y3/c5LL500ZEjSgyQkB2PNVDloP7tqJFpxIM3GB9Lb6dBMRsVS3Que+vrpZ/V62gvIchQa9gONAMTABD7B+NHpYU1OV0dp372bTz1jr6985eGMZ8aMqmyKh3sdefpBl/8Wjb9rAVa7JHOWjpvfvOH5q34kBCITcrlDiBmEENoLa0cMPeq3v9G+B8Db+8iYLNfN9fbOf+mxuS88u+SVFzvXrsz1BQQQjwFIaUl2bGRmY8iyhFICgBAIhSQrASJFRJTPQLZDtL2UbJyy3ykf/8ePfzrr6QfDktECpAUdeVi3KRwxLm1681CcC53zvOV3lZItdt0Eq+kAUTVGOJWgS9t3AoOQcvHKTMEXWpNtoQ6NFBx3BTEAIjHEgDeszy5fDbk8nHpq1RtvbFyzPrQSor2LIBVr/fPtgyYfN+bYTwS53l1YeFC75OKrElWv/OQbXRs2Oo5iIkQEKLcMEQEIcdRvfhVvaNz+2iczS8vp3rTpu+d8YvnsOZYEpcByMJ5WgEiGIvmAIdp6BmK57YwBERmYABiFYqkILSxtGjNmXzcmiobBtSQwIPtgQiITBIZY2qnQIGtPdyz022bKZXeLRJM77mPxMWdw6L9zyCFDTjI995knr/vMp1CaVNrpygSujQIwNJFWnxlQICpbKt+MaFK11XjjTYvRgpgFbRsz3YjAcOO3r/rh5EMTlZVG613FaoldkFvFE91LF8z76+2WJSOuudyZCSBBeIGe9sVLR5xw6g5VtplI2u5jf/3r8pfnVFXZ8aTlxBSgMMSGiIEZ+++VUcRnYOj/VLl3ARmwfISTYWGhZXkGSiGXAlMMuBRyaECHWusQmIFM6BVNGAorLmI1LFwqtudfvja/bq6wY/9xtX3zQ5QiKBaf+NOftDY5D4aNrjr6sCG5LjKGokcBAEjslczmTjNtv/rzzhz1rate3bAhl4pLIHSkBCW1gMWLV21cuVLa9i6sOqhdwGwo5+Wf/DyfzTlxh7Xe0rcphdCeHj5x/KFXXRWWMmKHwg4CMBkicAQxG2O2ZDwc0Sb9vUmw7biVSPCOQOXwYfr7TxARGaVvQEQJPrBkAAaBwMQMSASOrZgkMSMwM4G0WedMVyuMPKDc5vY270U7Hls7f9HiuQuMIy1N69dkv3vjSS3NFXfes6RUCBWwzxBzccLYmpNPG7PPuPSfbloUagYJQd6QAMeBkg8k4Lwrvj5y773DUknsurqheo/ua8eTm2a/tvCue20lwZj+SxEgMxC6ljrq+l/Y6XSQ69vxcwUt10EkZoGRc0Zt2eWKxb8fgdE9MhLeOpb0fF12AwZEJNZh6BsWwMYwMyCgEBJs2wLS7OdAIrMAIGQEIUDYwEgSAleW+8HfnoQibSrr60RMmcAk47Jrc/GOvy+86ItTTj1u6NIVuUx3XzwdHz6iomlY1drlmW9+/6UlyzM1abSSVXufeHhPZ2fHmlWDK6qOvuCTZ3zuc2QMGbMLL0vqPfovSvn6tb/yPd9xLSyPRmAkFkIGgd770+cPPvoEP9u1o5wGogAKezs6BEYn6pbn2++rZdEAl1U/UZ8YRq0uvHBF9/iRFcwy8A0jMGBYKhbDTrQcCkMpEAFCX+c8kFbCrh2DFRUinq6ormeiMAiLXavD9vlQ7AZ02Krs7w1+23e5sNx1ixb0rFmRiEtmdhPijnuXrF7Xc84nJk2aWG1BomjUqlXZ229f/PrL63oyXD0oQUX/iutvPPD0T3h9ncVcLllZaSfTYSG7y2lL9Z5YyXiic+H8ZQ8+bEkEKl/SI0pYG0pWV+7/za+bsLjTQgUUkmgriYvQn0Vx5LLbvproqSAxOjH54BNr/xVXF18wMZmydah9T8fSFbX2yFCHUgpDIA02tgw/atq+meSI+b0NYwZ5xd5N69s2aC2sRFW8YkjNAQdSqbtv+VPM+u3D89YXuvqNORyyjKExTIyxmHx1Zvucue1VFa4W0iuFuhAUc2ArOOXTH28YPOL+G64fOXky67xQsrK+zhjj53bwFNsNAAvpLvjLbaWiZ7sKDHF/U4KUQgd62lcurxw1fifcd9uDODrPsYwybjltucwv4hZ8uRzFGVApwnsfaJ2/pPeQ/eomT6hOJ4ST0cv6XrN0UPJZVqTP/+Qxhx447KmnZy+ZubRtTu7udV0b1xeKBWAD0oKqapg0sfmI004bse/ZsVH7Emlmflu/QgTWgydORFcYQxy1QCIk45KZ+3K+NmxQSmlNPmLqqZ+55OhzP/XQL66qSSdTNTVGG2DWYYgA4v3RZKmdDs7KcYqdbYvvuU8KZI6iKkQDa4xvBg0fss9ll2ov+15et++VRLn7rJxgbZUClT9ZPhwRAYQiAseGYsFbtSZTVY1t7bm/3Zd78NE1cVf0Fk2m76Vxw9MnHTxs+iGNGHZe9YNHG2rc0UPqfBObut+w44+1kolYV0fhiedaFy3LbN608dXnfts07Jbjzv/UYRd/V9kx/TaaKWYCtNpa1xWKlKq0tDbR+5CiLlOBroCA5SXXXHvypy6UlsVsNqxuTdYOclOpoFR6vxXBOwkwEVlOYuVj93S1brBdi4kERKNMWKLUbKZ84TK3unGn3ZeMAenWDx5iNKAQwFRufSiDzOUpkxz1L6EAdhwlKhzd5//xlkVtXUXHFjEkZXPO4yA0gwenz/po8/GHNzcPq3zh2Q2//cv8c84eP2lEMpVO1dTGURCAXr0yU/Ctb12575x52X8+sW7T5uy8lYVF3/nN3JfnX/bHO+14jEyI/8HSICCwWTZ3bnkK4taxmIAAglkh2K67z/RDpFKlbJ9Sducbc4Y3N4GwmYvvd3uV2vkaNYXL7rp3S0ZbznJRcKDrBjWMPfds4+feW9hBZan+7/zvzzR6KkIgM2f7uLE50d3R98as9Q89uWb+smzCBfRNKi6HDUmOHFM7ZWLtlEmNqYZYZkP2mp++9uhzG667+uADDm4Je4pEyIZWre67/4GV81Z0f+GzEyoqE8ceVz912pAla+2//m1mz5qVrz32vP78Z75+211k9H/6r7RUKZtZs3C+ZQMRbx14ioAIKISXM0eddlJlXUNYKillAWKyu33cUYcDKCCCPdCDmUjFYr0rlrc++7wUAERloSQDCuGRHnPh+YmGll3Ql8EcHWlUHnTE0RHACFE7U2+WUmk5/ZCGY45qyXuUSCXOPnPsuYjGcGWlW1vt1tS4scoYCPS7Sw/fu+yRR1YtXZW9+jsHHnBAU35z0XGk5eADD6+6457F7ZvDH3x3/wMOGVbs8rUupSwzfXKYjI+/9Z509/w3Ztzzz5H7XX/WFV/3c91Cqm0jmRNPzXzmn6vmL3RjgiP6bGu2j0SSHHfioYenaxu9vk4rHi+0t+uentqRo/rn/sCeCLCQsRUPPJQvFCxHRReUCGMKdTyVGHfeOaS99366cERZlUkNLidaAEKKMNAS4OSTR5x2ypiRQysgDAEl2ALYlAfvMAIjlPzO1r7X5nY9NWPd0pVdgQ+f/eS4o48d7nX68aRbKHrXXTfrlZc3uS40N6nxY6upYKQUAEBG5PPh3sN03ZcPuOehUc/fee9d1/384JNOGjRylPa3PTgZEJ+8/VbtG5FQZKifdUEGsJRUQXDyZZdPP+ucoNAjpBSWlV/favthzegxAOFuaMlRO6cTI+OtefLpbe4uzJH7hnrMMUfWTpgYFPpQvMe0EJnICyP9DROVGTIhsFTUTYOSX7h82t5TaiFkIAA3BqVioTsselTydLEY9vR6G9ryS5d1L1vZ097lSQtR4F6Tqz9xzmSd1XbCzuZKV1390qLFPVWVyvOMVCoWs0UU/ZkFgpDSC+UguebT50/bvG7qi0/MfOh3v7r0V39mL4+ReFCHbkXD648+9MZjjyTTgjSVWZ7+d6dmPmxqxf6HHxKLJ/ycjwAIdu+K5SpuV4wYYcJgN7TTqZ2OzxtnzhIYzU/pnwKnWQDsdcF5gPgeFU4oROhlp5966mN/v6N73SpbiujZSYGFghk5ovL73z+ivi4GfgBCrV6TmzVv05IlmzdvLuTyvu9pP6BSyGEIAsB1IZWUiFwo0ifPnWQpyxjjafrhNS8tXtyTTiutWUnMF4NM1q+siUFAZaUNSGAo+RALX/zUmVWQa7r3T7eOOfKko0//qF/ISMtyE1WLZ85+8PrvVNXYXRlPCthChjMAENfE8MijxjaPHWWCIgrBxgBg14IFybraWF0d7bqKwi4FmFlIZ/PsOdlc0bJldEEs346MqRkxtOWw6dovvJfgQ8YIKS03XtcyeMq+U59dtzYEkGCkAB1wXW3su98+rL42DkRLVmT+fveyN+Zu8kpGSbAUCBFlNyLpIsQQGIiBGLw8HXxIy37ThobZooyJa3/28oIFXelKFYYGAYXAUt4sW5EZNr4eixoRy5OUgB1L+GFs1FD14x8f9a+nF3XN+kfpkEmAyu/KLps1s33Wnc1V2Xl9AQpkoP6LOwgBns9DB8WqBo8SsRogg9FnQXfPn187drxyU0G+5z0HufcjRDMA4PoXX+ZyLh0RWIxChWBGHndsrLrBz/YItZMv3WjtptPa8x/5y0333nBt35qVtoWaAAUyg2fgG5fsO2hoZZgp3X7n4vvvX1IKKBbDdEpGZQVmIGKOypT9RQlEMAjHnTCGEa2K+O1/fWPGsxuqqq0wpC0JkQCYOWvjcSeMEEJE3KeyxNwFmwTSlMmNxWzIpcxRh7YEQb707FdZWDoojuJsB+Sfeq5dIoEQbPpn2wIjY8gwaohVsdeJsco68vsAhbAsL9Pdu3TRlEsvBxBAvBtWZuzw/yCkMGGxff78KCAxlosLREYBjDr5RACzc4EnKu256Zplr8+88pSTf3nxpZtXrmRbagAhAAV099H06UMOPmZsvie4+qcv33LbIlScTEpEYZg1sSEgLt9Mt8hVGSH0aMzIir0n1CDphXM77/jHolSFCENTTh0AgVnYOG9pd6YnkK4NKFAIlJCIq59c/8bMWe3x6lgiKUgbKVXS1RWxkpuwHp7Re8ONC7QOUSIzwZahpoDaQGUcpk2fFht1NIRFEIKZpW33rV3j9/Q27H8AQAi7pelZ7fAB7Dp9rRu6lywTIpKVlyWTxte1w1oap+335iRzhy5EYCdT/7j+2luv/h55frpKMVFU0idENFyZlOedvU8Y8A+vef71mW1VNZIMEVHZS7l/3NI2pDUACBRFH/Y/YJhbW+F1ZX77+1eMIRslbWXEIkGV8LN+e7eurHfYDwEASDS1NDggfvjDl6ZOG7T/1LoRQ1KuY2d6i0uX9z770qY1a3PxODIyaYr+2yjTlwI8n4/eJzHk4DPBqYEgAyiBCdHpmD3TTsar99rLBN7uGVigdhQHoZyelav6evuULbncd8uAImRoPuTgWG3jTpDmZXQTFTd/7xt/+uG16UoRT0ljDPffi1CAX+RpBzQOn9hw3dVPv/JaW12N0pr6aZb+MNJPVvM2PDECGAljxtZCMv74nQsXLuqtqpJUpiSidy0AghRoNPf25AGrGFAIAUJIW7kxSyO8+Oqm517eVBETIIQXkA7IsiCelET870QqQGiwIkbHn3aYGHk8hIVtJEq4+aXnaiZNjDc0hYXs7hlbIHYcCdW9ZKkGACG3sP+R1nTIEYcDiJ3In5nZjif//O2v3fuTawdVgSsx1BS9eSKMBUAugIOmD13w0urHH11VWy2NiULilrSmXJnA8vg02DI4WodUkbJGj6z12gsPPbAoGQOi8uhh3IZsBICSgWLJi5rCQAgQ4BcLvXkfACqSqjopAdEQORakUtJ2pKFyk0z0vRCQGS0pSh4dc1DVmNP+F5xa4HLXEyqlvez6mbMaDj0c0WbeHSzHTkp2elatBgACoIh8RSRjXEs2TJrEHGyZdbW9WZXRTrLq7t/8+rc//j+rwppw4KG2lNsUAIEBtOHKlGhuSt9+y1zbBtoy1D0ScOCWi3M5oJRTQUQUGBpurE3UD6155sml69bl3JjAbdLd/l/RMLOEdGUCIrU+Eyjo7M4Vsr6tgIzRhghYCABgE+3gAe6HtlyfFgq9APYZwqd99hJums5B1BQTHW2xTbNnt69uHfqR45l9RLEnAoxCAOjM+g207YYpRB2a9ODmypHDd7QHkojsWLJ18by7r/lRtS0+f/1vm8ZP7OsNVH+Qjx6cH/Cw5uTCBe1zFnVKVxBBud2pX6/DALRNA1D581FwIaiqctnop59aqawoC8NyTWCLDyMwcTJhNTdWQKCBDBGDpZYsz3glFkL07/dgJt76zcsETyRgQSWx5GGVbS75+qdrjvoaB1sL4UyE6C5/6IFUS3PDlKnaK+62sTJix5ozhNB+sXfDxm0k4YwMhqFyzBi3uobCHeySYxZK3XL11b3t2a/feO1hp5/x1F13glPuQyzTBsACoRTQc8+vBgX9kizAbWUAW25w/Ydx5FYC2BDEUk7b2mzryi7XFf0jMLd+RQQwBTRhVHVDrSIvEAhCAJN46cVWKcFwf+8c/1sVKeLWmBiElL7Pg1P6f7934ehzrwMQ20rYhaW017fy4QfGnnyKilWSDgH2xN2FjEIEhWKhswu36lPLGvfGCeNR2Ey0I1fe0EnVPXnH3+6688Gppxx17Ge+POuJR/vae6Uto+S5XOlFVDZ2dBU3bsjGHPEmhQduc/oCbBHrMpZpimgNg+VY8+dvzueNkKJfONCvjMEozgIRnHTcSAFkwpAMyZQz87WNC+a2x+Miokm3iej9Wz4QEVEKhSj6esPxQ+S3f3P11Etu9AMCCrfkVmSM5aZWznimddn6CWefw+Tttvi8Y1k0A0ilvL4+P5cTAERlAASwAKgeM2qH9ERkjJuuee2x+3/3lS/Xx8Tpl1wGAEtnva4AlcCyUgfLQruyfBJxWxHHtr/bIuOBcumprAQhBCmgmCvNnrPeiKhUu21bHwKAktjbZ444ZNCB0wb5OY8BXUdku/0//f41ISI5M0fvFS6nYwgimmvMQaBLRXJtOPWsYy/89jcqx033i1mxtYVwq673hd/d2HjgPoOmTgtLhd059kvteAWg7LJYVq0iA7sIVSNHAGwvuUrGOMnUG/96+upPXUj53NBhTeOmTmXjLZo73whGLofDSGy3NfBGd24uy75wy3XoP2XE/XclBnRs3LChL+Q+y4b+3HXr8SsFhCUzfEj8sxeOC30/0JxMWMWS96NrXlu3JptICTYkAAE4gpSYPZ9YAxijAaobKo469ejjL7xwwhHHGoNhISPezD6Wk4x5s+Y9PuOiO24V0mKi3TltdofvwYhCYb8GGVgwsKZYMp5uaSGzXQcwE1mu275u3c8v/oyfyynC2iEjKuoa8r1d7evXKQnUL8Lq11+VpZPlhgkEQxB4FGpgBiXBddBSkpjLg8O3iLYigZiFnZ0FRLAsjBRTW1o2ESEIYFB97HtX7l+Vtkslv6o23boxf+2vZi5c1JNOCSYWAoDYsCiVTBJBOljV0DRk6OAh4/Yate/+kw+b3jByFAD6+SwCvAW3zIzSefxH19RPGDX5tDPCYp/YvQtZ1I4qORi2ehgARrmQU1VppyvIGNzeKQDufb++vmv1xso6J9Phj5w8Rah49+Yl+d5uYUG0qWrbdKZfEcsCoZgn24KhwysqaxJKiN7e0vr1mVyftmywXUvJKAXuF1X0S+CiUR1btzKUxVxYCs1ZHxs1qDGeyYZMdOvfFj3+xOreviCdkkQkMFoLILw+c8pln9v/8CN+ccF5k/be5xt3318OZ9rz8zlgfkvYoiE6Cx576MV7HrniwX9I29F+ac8GGAABTP+onOh5GYBYTa2dSm7PGBEismKx1sULn/rHbckKUfI0Ju2pHzkegDta1/qZvBUTHAG8DcqIIJC1wTCkI48Yds6nDho6LAGFXDG0PZ8ynd0rlvU++/SSRcuyXgCWC9ISbwqVCETlZmWKahGIgBCEVFPtjB1V1ZPxkqnY3fet/P2ty+ur0Y0pQ9Tf+ipKJTN2n70+8/3vxyoaTvjUjJd/88dlTz0y9tiTiz0dynHerguBjJGO42Uzf/7c5yeddOyUUz8a5He3++5kuTAA2MY9gADI3z5mlZmMESo+4+57ejOFdMLq7Q3PvPT8/Y85FsCsWbrUD8BJSgMatpG3AwAK9DUMa6k644xhx31i7zULctf/7KU5izaZgseITmV8yl6NV/zyGx0Z+eyjs2c//0pnx2Y/HxIDI8ho150AQyAk2BYoq5yek+amOte1CIDXrMs8O2NdS60IGah/SioCSClQm32O/kisosbr23zeNT+B1tbfn37WFS+/2DJlmtfXKZT6z8zDaG27rrDd/zvr7GKh+Jk//N4EHsCevV4Wo+SosjJeVVnqzYgo0gkwAG59vXRd7b8jy8GMQsQqGuY88887b7hROXapRAceedDFP/pxUCjY8cSSWbMFvuluWq4eCNQh1VW6P/nRIVUN9vVXPzfjsZWlAKQNjgISonNtKd44NXXA/9Y6OOFUzrZv3rhqdeuShe0bN/S0d/S0rkGp+jJZoaQVc9rXb+hsXW0pAEBBMG54Ugj0fe+2f6zcsMlP11hgDG59ByMwhwK4awHoIghl2eqC2/72+zM/+tsjj7r4gfuGHXY8BdnQ87Zu62EGADddne/t+u05589+9PEfzHiyqrnFz30A7rvjHkwklMT+Wm+kmSKAeHWVUDaUPJD4tu2gSmW7u+//+bUPXv8L8sMDTzp56KjRHzn/f1KVlaFXzPf2rJo/x3GBqT/D4v5OQUAk/J+LT0jUul/8yoxZM9vrq2XCLefSNkBTg33ZVd90bC719QqpEpWV4w8+aPzBh5X7z4xmosDzpFIqFr/usxc8uXyVlVZMBhSMHFlBxuR1wyH/84nGvRc/c+8/rGgRHpc7KIiZJXYuft5b/rwcc6wuZpQbv+See/72yQuuO+aEI6/836M+f3lF0zAAAohoZwlglr303G8+d/nmdeu//+Sj4w470s/1bCvV21MBRowGcSRr6zqWrxIoCKl8jSGzPVPdcr09+e7Oy3553ai9pwzba6JQismUctlYRc2Lj/xj86q18ZSkCODyrRYkykJfeNm1vzjihOE//eyl82d3NtQoKjOHjCwzffr4T5414cDpfq5XWXYUHnUYQr8WMGolFUowmbBUWLViFUsghiDg+np3cHM819VXf+zXx08+FUDHUrE7f35jVa0qD08DYAbXEu1dQfsrtw8afrhQygS+tKxP3X3v0zfccPd3vvWv3/1m6plnjZ1+aMOoMSYM1i9aMuPue5Y8+/KkQ6d9+95XGseM+2CHIqsdbua37FhNDfdn1NF9k/jdddTa95tGjPzir28AsIC9sFQyvg/MylKhV7z3xv9DsXURWeTESqq+7vDUz57/0S989dEbrnnl+c66RisI9JbGBm0oXpU847IvkQm2IZbxP08KMmTZdk9HR/emNiFBIIeaJ42rdqFkBh2aHnuMl22Xyvr0VT8sZrKP3XybkwDblpFERElY2y2Xzny2etozsfEngtdHRlNJH/ulr+57xukv3Hzz3IcfXPDwA2i5goltt3Ls+K/eeesBZ5wmpPJzvR/syOsdLfgzgKpoacY3Ubnl0uG7zhJjZj+fZSKMmCBEY7SbrH/wD79e8Mob6UpJZPqzKiERuzvDkz/58S9efwOzLoYgLGTDW8hkoUQuq8++4qIRU/bzcz3vesIJ225bs7bQ3hZzJDNVxXG/Ma5XgEGnXyaQQUpmFgL/93d/GD/tgJu+9518TyZVoYwhRPB8enVhftKsW6yhh0hLIREg+rnuqqam077/41O/+91cR0exp0cqK1Vf71bVAGBYzGo/+KAi806XCxkAG0aPiqZfbRkN6xcKvH0shxBCKhVdLYzRbqpi7aI5t/zo6kQckVkiI7CQgkJT6tX/c+XlV/7hJqPDyCc9w6ZfAiClCDzTMmbomV/4stkOjR8zA1itS5aUiiAVhgE1t6Ri0nenfLZi8AQTFKMpeUQUlIonXHTJLx57csx++2U7tQSQwEkHFi/35r/2euHV34BKIBAACClD3/dz3dr3k7U1jePH144aqeIxP9/n53o/2JWFO1suRATQdePHWeXpGwBEEiC/fr0u5VHK7Z8oZrR23Hi2p+fnF1/k9fTYNgIxE1qW8vLGTlZ9/eY/Xvrz60gHZAwAdHR0BgzRyNpIvewHfM7/fq160OAw8N6VIkUAAFo+6zVLRld5MbhRLOqbUH/ohcbLbmGgovDuZXuGT5r004cfOf7TF5SKBMRCyiA0d8/IbHrt791v3GWcKmSK/n0UOXQQBsViWCqx1kIIscfsDxY7zGRRmBrc7MZdNoRlOQcoy96h+WFkjJtK53P5ay48d83cubGkZEOAwFL29eox+0y57vGnjjn/Ij+XYWYpJVC4cdlSRwIxMgBKmc+afY86/Jhzzw8KGfmuYZBZWVa+p2vB7JnShTDguirV18dTTrsskY4b/e8ZolTKz+dsx/7Kn/506bXXl3zhe9qJyfWbS395qHPzkz/LzfwbWIltjyRExGgH2x62GmaHPVj7QXpIS9WIYaAp2nivALxcTufz2xmRmMhJptYuWvj1M055Y8ZzbkoFgRGICiGX0cd96vwfP/zYsAkTvGxX5AfKsTs3rl83f1YsVt7NIww7tjr3ym8oe7sKlEQk3cSCV15es2SFUBIArSCINx+473HHB/m3bnAVUhJRkM+e9LnLvvP3uxLp2lzOJGNiwdLMn+5Yveqe7+QWPizsJJOBPdt22INJaydVVT9+fFSVk8wKIcznwlIJheDtoioT85579mvHH7ty5qx4UlKoUYiSz6FWX/7VL6/8/U3xRNwv5KVSZRG8lXjl8cc61ne7MUsCW1IUsmb6R8+YfPjRfn67+o8jivJfd9zqECOgRMrk8JgLP4NSvsM8m8gpvWzvASed/r27H6hsbAkDrkqpdW3Fx1/qzL5xa+jld4NyfbdrshgAxJDDpgsAiSgAhRRhNlvq7BRKvesZjACI4p8339TXkamstAQZIYQOyU5Wfuv2O0679Ao/lzE63AKbVIpC71933QEqahnCok+xhuqzr/wm6e3q7SEiO55c9MoLs556Ip4SzOwFpKorhk+ezOG7d8hJpUqZjtH7H3L2FVeERVICXVcsWhusX7lWBr0gFLwPixY+SIBRIJM/+NCDK2KO0EYACIGBb7Kt6xG3A2AhdFDq3dhqO6g1EYjQgJ1MX3XbrQed9FEv2xENdt7W3V9++MGVr72eTAltCITIF/mgE08aPH5SWCpuz7ghZgJhL3rl5WLWF1JIAVqL6sbmiupaHYbbU8CWlhWWeo886xNjp4wrZkIhRBhwJuPvqLzwwwKw0J5XM35cw8QJbEggShQIkF+5CkBuzwQvRBGJHTWBlBjm6BNf+vK+x5xS6uuQb+YEEICNmf3MDM/jaKuhFJAQMHjIEGbcbsdBAAahQgPIbEkkn47++NlWIk3bN0UfEcmYRFXlF3/752RNbbFIrsK44lAz/vcBHJU5lZMaddIJEkBJKREBoH3egndVdETbzgLPAzdBCEoKv2DGTZt0+qVfCIo98j8G+zMACDzsjNMtV+mQlETBDAo2b1iP260eiZgxo3VoAKX0snraMQefesnlYSm3/fPGhBB+Pjtyv0M+9tUrtUc+qr5sn+5ZD9Ji4P82gFEIJn/YiSekLQu1RmYFkFm+TBfz7ypGEVKWcrm+zW22AgHEDOd+63uxdAUb85+ACSHCUmGfY44571vf4RIBc0hsEJbNneNlM1Jt17UbEQFM+5oVMRuKJZ1qbPjCb/9s2Rbv4LwxIZXx+w4782MtIxt8T69c11dc8zoI67/tDC4375YKdfvs03zIQRwapaRjicKatYWNbeKd5ywyC8vq2bypZ+1K2xb5PrP/cUdNO/6kd6iEI2BYLJxz5ZVHXnBBd8YwY8LF7hVL1y1aKO0YbcfDlUr5+ezK2bPjLnh5+sh5FzQMH+8X8ztKMyGiDoKqpsH7TD+aPe7sMr1LXqKwtIcvztzZF2dYKHfMeefYABaCZdt+b7Zn3jypXHj7iykxA1qrFy3K5XS0R+HEiy5Fqd7pPYHIBCYMLv3Ftfsdcagu6Jhrh4Xw9X8+jMKGd2sAYSJpO22rV21qXS8kNNa6R5x5JpuieA/Xm2knnx6zsbtPrJw7q7BphbDc3daHsvsARim0nx9y6kn1QwaDFygUgqHr5VeiCvk78oW8+OUX2YBX0uOmTtz7iCN16V2G8aBAo7Xrulf8/k9NI4f4xRDi8l/33t21boVyYu+c1hEzSmfuv2b4ffkwgLHTDhw8YVK4s40FKITxi+MOOKBuaHN7n1mxugM2vMbC3pOjtNjpXT/k+7G65jH/8wmlySJ2AHqee1GXsu+wKVUq5ef71i6YF49D6MGhp37USVTrUG9XjlMqNgwfe+EPf5ovkm3JjjVtT9/0B2m/ixBMCkFh6fUnHkULJMF+x50olLtD6vx/j9JhmKprGD5lqgy5o5Neu+fv2ivuOczzrpwXjVKaoDDyks9U19bIILAs2bdoSW7pMuG+9RMkIuW4rUuXbly9SlqQSIrJRxwFtL0rN6VSQb572omnHXLKCWE2SFWpR275a9uKhVYsTm8DGBGpWHzl3DkLX3/ddcGJq7EHHATkQzRHmpmJmCga8EpGk9ZkdP8f3/JDUxiSwQn7TK0U0Fe07rjt5RWvvqDchNH6vw1gQDReKTl09NiLLhTaSNshP8jMeFaItz6GmRmEvfDFF3KZog5h+F57DdtrovZLYrvpAgYQEs/6ytecilQIuKm995arr3qHI5CNQeG8+NBDxT6fQqgdMrRxxMjQK6EQUill23Y8YSdTTqrKSVU5qVonXeukavv/+JYftbGqWqHslr0mkQJm9EJz50+uNlrbsVj0M5bfB8YQGe4f0AcfloL/fzqx9vPDv3DZ2lv/3tfZKRHaH3lk6Jcuh7cKWVG0nPf0o0kXSiXY66BDnWSVl+uS210SF0KExcK4adMOPfOsR266ub5aznzw/mf+8oejP/V5P9eBKHjLhGhARHQSiUJv+xsP3lWbxr48j9nvgETVINZ5E4alXNbL5f1sxs9le9vbA9/v27wRjClls7nuTomA5SEsApE1GRBCCBmvqXUTyVgiOf/ll1EqMFRbaXfPnfX63/489cxzpRRWPAFo97uNBgpN6JM2FG1i61eY7U6A3+vWFdbaTtetvPbnc7/6DeXYiHD480+n9t3PFN9UhCciOxZfNWfOd045VrGfz9Lnf3PDsZ/+nJ/r3aEDjImU665fsuTqU44tFrJCCET7khv+MP2sj4PRIC2ASFtitFfUhh787W9uv+p7lZXKy+uRU/cZs8++HWtW5Xu6/Fy2mOnjYl5qnS8C9S/fEwjRNCQhQACwAQDQGkICA8AADgAD5AEsG2IKbAkCIEBwaxOpdGVldW314JbqQc21Q4ZXDh1e2TykumVILJWWdgwAgYl0aLS/O91aveddSTIs9g69+DPtt/2te8GigGjzvfdX7n+Iodybhowwo7RfffjBfLZUmcCauvj4Aw9iswPNxEzl/cl+Pjd00v4nXvS5O675WaJWBH7p/z5zoSkVxh186IZlS/LdnV3r1nWuX9u1cX1X26a2tk1uXISBcV1cPXfOslfmOAJYgBDgKFAShVTxSlmWeJNhbUgDaxAAQoGTxETMxWQqVlmVqm+0LKdmUD3YdgiitqU5FrOZCAWClH7J00FIYZBpXa0zm9ZtWLH4OS0kJRNusnGolUw3Dm2pHTo8Ud+UrBuGwmKOVpeUh+XuuR5c3rqSquh+8smZx59mEKpGj9j/tReFY4MpjwiP+ts7Vq38wYlHZft6jebGoS3XzHjVTSbfab3INqvOhJTKcVDaABI4IMOv3vm3333pc8JiBhTAilgrt9BXEgxMgAjKAiNAWkIiGAJmIEQphIoeKYEFzEaHHqAGBLAlJCqsqrraquahDaNGN4wYlW5uqWhqTlTXuOkKJ5V0EkkQCMKKdtMDvGvgMRQUgny2kM/mujuo1GNh6OV7Yom65oNOZwA2mkmzCZlMeV4B4i5fWK12xcIzqXN9tR85fvCnLlhx81/7lq/qfuLJQR8/N8z2RArqaHHHC3fd3bO5J1WpClob4eS6OmPp9LZt9v+26kwoZZdXnVFYzLWvXLF5xdL1ixeuX7Swa93q9tZWoVAQc6TgEYhhqSIlGYWAqN+XNTECC2SlhGEkZiIKfAMBKANoQ7o6Vj12WMuYMYMnTmkcM7Zu2PCKQc1uZZWwYgACQANrNoaIAYQmASxZA1MAxg8LPWG+iwtd7PVSrt2Ens52AEOQadeFPkQhRaTJkoRSSstoFuk6S7pt654Jl7+aHDvVrRpkVTTIVK10U6hsYGYTUuiz0VsHf7xnsNWu2nJs/OKon/xg87PP9axes/YPN9WfdhojsI6mxhGF3qalSwBQEiQEqHxeWTYgUjRoepsVq9KyohMryGc2LFqwZvbM5a++1LZsUfu6VfnuYhgCCrAcQAFKlJfJRp2ClhDAjGyEQAQkRCkRGdgYHZDxQAPE4lA/bPDQMWNH7b9/04RJ9WPGVTW3WMkKAAVgmEIT+NovcakIQqJ0hLIBBGkvzG8O+zZSrq3UuSLoaaVSZ6lnY5jvRe0JNoIMExAxEJFBYgQGEU1lM4aJmZGZSGtgAqHalhr1LAg7hm4yVjnIqRniDhobbx5nN4x06keqRBVIxTqk0GMTlnuwdzY1e28hOgqhkZBVa7uqtuf5Z1854XSr5B30/JPpQ48GiGYVEIAz75/33XDOx6yYcCRCXh/xmYtOv+5PwF40mx8FUhgCQq6jY83s1xfPeGLVrNfa167JZXxmsFxQNqKQKARzNCiDkVlsEUFz/wwCYKMpDIA0CAblQKIiVT9sxJC9Jg2atPeQSZMGjR0fq6kFdACIja+DgHTIRIiA0haWi8IiE7LfF/atLW1e6ncsCDpXhJn1ptQLOjDaMAgQktBClEJIYDAGkBmZTbQKO5rvZaIWdC6/YIqm8AGRwa2LgYiNBh2ADhFRxFJudVOseXxq1IGJYfu4g0arVB2goKBEoQ/AO4H0jgMc8QPMKIRQSliWkNHFAP2+TlMq9Tw9o7BmXSCFGNysjc62t5d6eqUU+c0bZz56fwmBDUljnBKMOHiq1TiIJAAFwMILwQTe5mVLNm3oMAaUA8pBqRRzeR+EAECBW/dxkCFtTAikATVICY4FVlIm6hqqBjXXjxzdNHZC/ejxtSNGVTW3qHgaQACE2vcoDLfOyBESpYPKYWBT7A57VwZdi0tt83TX8jDbFhb7BEgWSggbhCQDxIxAwERhwKQp1GQMkCnPPSYwBAKlAGEISVMU4THqXSYmRkuCNsaEoRTAAJoYUTGWVwcRGWQSDNJJuDWDK0ZPS409NDH6YKduKAhJQZFCv1+Qi7sS4Ij0QURh28qJASiA0M/05tvaepcu7Vm2vNC6btOcBflNba5E4/uZ3t6iIT/ov7UABABSgFLgO1AzuHno5HHMuquza3PrKr/kcQB5H4jBcQGVNCgAWGB0EwVDbMiQJtDAGhSDVGDFIZWuSNXWVzQ1Nw4bWd3cXDNmfKqppWJQS6yyGu1Y1CbE2tdBpL0tr79DgCgCo7TZeDrf5m9+I9g402tfpHMb2YTMgsq78RjJAGsTeOUlDKhAOWjF3HilsFNsV0k7Zlc0gtFWVYuwk0Qo4rVCSGA00YbgLfeI/tu8CUom1ymV8jObdL4nKOS83g72cpTvDgo9XiFrQh9MwIaZAATEagdVjTu0au8T0xOOsGuGMGnyC2T09jj0OwJcHu7JqKSMxQQ6AMbr3Nw1f37n3Pltr7/eu2RJtm1jkMlHfDABoChfGRFAAxCADZBOW8nBg+PDhldPGDfi4IOrxo0npu7Vq+fcd+fKma/29XR6hmwJKNAwMgECsTGkmQxwCAxg2WC7IlZTV9/SUjdseO2w4XUjRlcOGVbR2ByvqraSKRBu9EZi0iYMo6jb39+L/Ys9GFChclEoNqWgZ0WweU64eWbQtSTMdrAOQdqIklmz0UwGhIVWQiZqQaatyiFWqkGkm1W8DuxKlai0YhXSirG0EQUI9aatTlzuzwB8Jz0fb5kGRMSk2WjyC6aQ8Xs3hdmOsG9T0LHG61hb7N6g+zb4PR3ag1h9ZfXk46oPODs9frqdqCFTosAjY96B7n0ngIVS0o4DKNb5nkWL1j35dNerr3bPmtnZ2u4DmH6qUwEIAaGCmOvEHMd3YzKZTNVUx2rrKoYMqZowvnHvKRWjRsVrmgGga/XiN+76+9x7/9G+dKVHYCdA2koTEBFqggB8DRIhkcbKuvqaoUNrBg+rGT66Yey4ipYh6UHNiepa4cQBJAADa6ND0pqN6Z+lj+V2sze/r1EoVDFGyUE27F7sbXgxbH/D71xGXq48alY5oBLKrRTxGkgOsuKNsmKIVTEY3RqVqGHhKMsFFNGpCWyYDJMBpqheuXWcwJsTRtiq9uBth679pwikf1ieRClRWihkpDPn0Ccvr/PdQXdrYf3Cwvr5hXXzSp0bZbKmeu9Tag88M9Y0yk6kjVd8O772nQD2u3t65sxtfeqZdc+/mJm/EAEUQqylwa2rc9MVdl1trK7OaWyMV1XGGurtVDrWUG/FE1Y6LR3bTibRshAlgA0AupRZ+OjD8+68ffGzM3IZnUgD2NIPDAfAGlhAPKVqmpuHjRldN3Hv2hGjqkeNrRo8NFFVjXYEJwFrEwZGazZmCxkJ5Zj7LmHK+Bm/YwFtfsVrmxn0bQAAGa9lp8ZJ1KvKoRirl8kmVTFExmrQTgoVAyGRickAazYagICpf9Qpbp2StesJiv6tX8xbgRcSpYXSQqkQgELP69mUXz07s+TV/MZWcusb9zuifp/pwom9JUH2VgAzC9vOr169/t77s+s3yppqu74uPbgl3dLsVFTYVVUqHhOOK5QCsPp/SAIgYgNk2BAZQ2GoHEc6sUL7pgUP3vfSLX/ZsGCBQmAJJgRhAC1I1tcMGj++aeKUpomTBk2YWD14qFtdA+gAMHBogsBsG2nfyjW3Y3SbZJ0vrH6C/YxlCc0JmRwsU41WvIplQigXpYOIzASkmcJ+p+Stg7g++E6FaJZf/94xIVDZwooJVCYsljrWFzeuiDeNcOtaWIf/+Wrf1oOZSDq2tJIA0ewxw6DJGNY6Sri23JG2+hAiMBOR5brSSWdaV8667ZZF9/6tbfFaX4OwIZaUdS2DB42b0Dx1v8bJe9ePn5geNAhUDACYAhPdWJh2Fs53aiwUVoyjuYZkmDSzwSiHKUc23DLRCvZ8Yy4fSSiFZaNlk+8x6bd88W8fohGhDOSWea5bBle8RVSMGCjLdYWVyrevm3nzn5///Q1trX2uDQ0jGkZO3X/oAQc17zutbtx4t6YWwALQJvRNEES8Vfk++365C28j7vlQYbl9VMQ7PLpdwEWXp/U5jrATvetXv/jHP7z+x99zrtA4ZeyIw48ZdujhLVP2Tg8eDGADBNrzSGtmQkAQAvG/4invwbYrig3MdqK6c/WSu779ne75byQrKiefctrEE0+sGT3GiqcByASeCfyo73v3F0QHAN4FHrz4iccfueHGkfvtd8SFFzTuNRHAAvZDr0TalPOCAVA/pAAjog78jfPnx2rrmsZPAfaDQiE6FfZwwfAAwDsAshWLg9F+sTiA655mapckckE+B/3DDAbsvw7gPWPayIDtatnsgA0APGADAA/YAMADNgDwgA0APADwgA0APGADAA/YAMADNgDwgA0APGADAA/YAMADAA/YAMADNgDwgA0APGADAA/YAMADNgDwAMADNgDwgA0APGADAA/Y+2//D3WsPT+93I4MAAAAAElFTkSuQmCC) center/cover no-repeat;box-shadow:0 0 0 1px rgba(60,20,0,.12)}\n.brand span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.brand{flex:1}\n.langbtn{appearance:none;flex:none;height:38px;min-width:42px;padding:0 8px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface);font-weight:700;font-size:12px;letter-spacing:.04em;cursor:pointer}\n.badge{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--accent);color:var(--accent-ink);font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}\n.top .wrap{justify-content:flex-start;gap:12px}\n.menubtn{position:relative;flex:none;appearance:none;width:42px;height:42px;padding:0;border-radius:11px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}\n.menubtn .badge[hidden]{display:none}\n.menubtn .badge{position:absolute;top:-8px;right:-8px;box-sizing:content-box;border:2px solid var(--bg);height:16px;min-width:16px;padding:0 3px;font-size:10px}\n\n/* меню: выдвигается слева; на широком экране стоит слева всегда */\n.mscrim{position:fixed;inset:0;z-index:60;background:rgba(10,20,18,.5)}\n.menu{position:fixed;top:0;bottom:0;left:0;z-index:61;width:min(86vw,300px);display:flex;flex-direction:column;background:var(--surface);border-right:1px solid var(--line);padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);padding-left:env(safe-area-inset-left,0px);transform:translateX(-104%);visibility:hidden;box-shadow:0 0 28px rgba(10,20,18,.28)}\nhtml.mn-open .menu{transform:none;visibility:visible}\nhtml.mn-open,html.mn-open body{overflow:hidden}\n@media (prefers-reduced-motion:no-preference){.menu{transition:transform .2s ease,visibility 0s linear .2s}html.mn-open .menu{transition:transform .2s ease,visibility 0s}}\n.mhd{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:var(--hdr);padding:6px 10px 6px 16px;border-bottom:1px solid var(--line)}\n.mhd .brand{flex:1}\n.mclose{flex:none;appearance:none;width:40px;height:40px;padding:0;border:0;border-radius:10px;background:transparent;color:var(--ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}\n.mnav{flex:1;min-height:0;overflow-y:auto;padding:4px 10px 14px;overscroll-behavior:contain}\n.mgh{padding:18px 10px 6px;font:700 11px/1 var(--f-display);letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2)}\n.mnav>.mgh:first-child{padding-top:12px}\n.mi{appearance:none;width:100%;min-height:44px;padding:10px;border:0;border-radius:10px;background:transparent;color:var(--ink);font-size:15px;font-weight:600;text-align:left;cursor:pointer;display:flex;align-items:center;gap:8px}\n.mi .ml{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.mi[aria-current=\"page\"]{background:var(--accent-soft)}\n.mi[data-here=\"1\"] .ml{color:var(--accent)}\n.mi .chev{flex:none;color:var(--ink-2)}\n.mgrp[aria-expanded=\"true\"] .chev{transform:rotate(180deg)}\n.msub{margin:2px 0 6px 18px;padding-left:8px;border-left:2px solid var(--line)}\n.msub .mi{min-height:40px;padding:8px 10px;font-size:14px;font-weight:500}\n.msub .mi[aria-current=\"page\"]{font-weight:600}\n.mfoot{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;border-top:1px solid var(--line);font-size:13px;font-weight:600;color:var(--ink-2)}\n}\n\n/* sections, chips */\n.sec{padding-top:18px}\n.sec h2{font:700 13px/1.2 var(--f-display);letter-spacing:.02em;display:flex;align-items:baseline;gap:10px;margin-bottom:12px}\n.chip{appearance:none;border:1.5px solid var(--line);background:var(--surface);border-radius:999px;height:36px;min-width:36px;padding:0 12px;cursor:pointer;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}\n.chip[aria-pressed=\"true\"]{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft),inset 0 0 0 1px var(--accent)}\n\n/* forms */\n.lab{display:block;font-size:12px;font-weight:600;color:var(--ink-2);margin-bottom:6px}\ninput[type=text],input[type=tel],input[type=number],input[type=date],input[type=search],select,textarea{width:100%;background:var(--surface);border:1.5px solid var(--line);border-radius:10px;padding:11px 12px;min-width:0}\ninput:focus,select:focus,textarea:focus{border-color:var(--accent);outline:none;box-shadow:0 0 0 3px var(--accent-soft)}\ninput[aria-invalid=\"true\"],select[aria-invalid=\"true\"],textarea[aria-invalid=\"true\"]{border-color:var(--bad)}\ntextarea{resize:vertical;min-height:72px}\ninput[type=checkbox]{width:20px;height:20px;accent-color:var(--accent);margin:0}\n.form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\n.form .full{grid-column:1/-1}\n@media (max-width:540px){.form{grid-template-columns:minmax(0,1fr)}}\n.err{color:var(--bad);font-size:12px;margin-top:4px;min-height:0}\n.seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:var(--surface-2);padding:4px;border-radius:12px}\n.seg button{appearance:none;border:0;background:transparent;border-radius:9px;padding:10px 8px;font-weight:600;font-size:14px;color:var(--ink-2);cursor:pointer}\n.seg button[aria-pressed=\"true\"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(20,35,31,.14)}\n.sum{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:6px 14px}\n.sum .r{display:flex;justify-content:space-between;gap:12px;padding:7px 0;font-size:14px;border-bottom:1px dashed var(--line)}\n.sum .r span:first-child{min-width:0;overflow-wrap:anywhere}\n.sum .r span:last-child{white-space:nowrap;font-variant-numeric:tabular-nums}\n.sum .r.t{border-bottom:0;font-weight:700;padding-top:10px}\n.sum .r.t span:last-child{font:700 16px var(--f-display)}\n.note{background:var(--accent-soft);border-radius:12px;padding:10px 12px;font-size:13px}\n.note.warnnote{background:var(--warn-soft);color:var(--warn);font-weight:600}\n.btn{appearance:none;border:0;border-radius:12px;padding:13px 18px;font-weight:600;font-size:15px;background:var(--accent);color:var(--accent-ink);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-align:center}\n.btn.ghost{background:transparent;color:var(--ink);border:1.5px solid var(--line)}\n.btn.sm{padding:7px 12px;font-size:13px;border-radius:10px}\n.btn[disabled]{opacity:.55;cursor:wait}\n.bar{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--surface);border-top:1px solid var(--line);padding-top:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}\n.bar .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px}\n.bar small{display:block;font-size:12px;color:var(--ink-2)}\n.bar strong{font:700 17px/1.2 var(--f-display);font-variant-numeric:tabular-nums}\n.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(88px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--bg);padding:10px 14px;border-radius:10px;font-size:13px;z-index:50;max-width:calc(100% - 32px);text-align:center}\n\n/* orders */\n.page{padding-block:18px 56px}\n.page h1{font:700 18px/1.25 var(--f-display);margin-bottom:6px;text-wrap:balance}\n.lead{color:var(--ink-2);margin-bottom:16px;max-width:60ch}\n.tagline{margin-top:4px;color:var(--ink-2);font-size:14px;line-height:1.4}\n.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0}\n@media (max-width:640px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 12px}\n.stat small{display:block;font-size:12px;color:var(--ink-2)}\n.stat b{font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}\n.stat.hot{background:var(--accent-soft);border-color:var(--accent)}\n.filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}\n.ordlist{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}\n@media (min-width:980px){.ordlist{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.ord{display:grid;grid-template-columns:minmax(0,96px) minmax(0,1fr);gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:12px}\n.ord.is-new{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}\n.ord .th{background:linear-gradient(160deg,var(--stage-a),var(--stage-b));border-radius:12px;align-self:start;aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}\n.ord .th img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:12px}\n.ord .th .ph{font-size:34px}\n.ord .ob{min-width:0;display:grid;gap:5px;align-content:start}\n.oh{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}\n.oid{font:700 13px var(--f-display);letter-spacing:.02em}\n.when{font-weight:600}\n.spec{font-size:13px;color:var(--ink-2);overflow-wrap:anywhere}\n.cust{font-size:14px;display:flex;flex-wrap:wrap;align-items:center;gap:6px}\n.cm{font-size:13px;background:var(--surface-2);border-radius:8px;padding:6px 8px;overflow-wrap:anywhere}\n.tot{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}\n.tot b{font:700 15px var(--f-display);font-variant-numeric:tabular-nums}\n.tot span{font-size:12px;color:var(--ink-2)}\n.acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}\n.xtools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 12px}\n.xmenu{display:flex;flex-wrap:wrap;gap:6px;width:100%}\n.xmenu .chip[disabled]{opacity:.45;cursor:default}\n.xtools .unit{width:100%;font-size:12px;color:var(--ink-2)}\n.pov{position:fixed;inset:0;z-index:40;background:var(--bg);display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px)}\n.pov[hidden]{display:none}\n.pbar{display:flex;align-items:center;gap:8px;padding:8px max(12px,env(safe-area-inset-left,0px));border-bottom:1px solid var(--line)}\n.pbar .grow{flex:1}\n.pframe{flex:1;width:100%;border:0;background:#fff;color-scheme:light}\n.st{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600}\n.st::before{content:\"\";width:7px;height:7px;border-radius:50%;background:currentColor}\n.st.info{background:var(--info-soft);color:var(--info)}\n.st.warn{background:var(--warn-soft);color:var(--warn)}\n.st.ok{background:var(--ok-soft);color:var(--ok)}\n.st.bad{background:var(--bad-soft);color:var(--bad)}\n.st.mute{background:var(--mute-soft);color:var(--mute)}\n.empty{text-align:center;padding:36px 16px;color:var(--ink-2);background:var(--surface);border:1px dashed var(--line);border-radius:16px}\n.empty b{display:block;color:var(--ink);font:700 15px var(--f-display);margin-bottom:6px}\n.ord .pl{display:flex;justify-content:space-between;gap:10px;font-size:13px}\n.ord .pl span:first-child{min-width:0;overflow-wrap:anywhere}\n.ord .pl span:last-child{white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--ink-2)}\n\n/* settings, cards */\n.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:14px}\n.card h3{font:700 13px var(--f-display);margin-bottom:2px}\n.card .unit{font-size:12px;color:var(--ink-2);margin-bottom:6px}\n.savebar{font-size:12px;color:var(--ink-2);min-height:18px;margin-bottom:10px}\n.savebar.bad{color:var(--bad)}\n.settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\n@media (max-width:540px){.settings{grid-template-columns:minmax(0,1fr)}}\n.settings .full{grid-column:1/-1}\n\n/* catalog (client) */\n.shop{padding-block:14px 130px}\n.shop h1{font:700 18px/1.25 var(--f-display);margin-bottom:12px}\n.shop .search{margin-bottom:10px}\n.pchips{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px 10px;scrollbar-width:none}\n.pchips::-webkit-scrollbar{display:none}\n.pchips .chip{flex:none;white-space:nowrap}\n.chead{font:700 14px var(--f-display);margin:20px 0 10px}\n.chg{padding:8px 0;border-top:1px solid var(--line);font-size:13px}\n.chg b{display:block;font-size:14px}.chg small{display:block;color:var(--ink-2)}\n.chg.bad small{color:var(--bad)}\n.impsum{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 0;font-size:13px}\n.impsum b{font-size:15px}\n.chead:first-child{margin-top:4px}\n.pgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}\n@media (min-width:640px){.pgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}\n@media (min-width:900px){.pgrid{grid-template-columns:repeat(4,minmax(0,1fr))}}\n.pcard{background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;min-width:0}\n.pcard.off .pimg img,.pcard.off .pimg .ph{opacity:.45;filter:grayscale(1)}\n.pcard.off .pname,.pcard.off .pprice{color:var(--ink-2)}\n.pimg{position:relative;aspect-ratio:4/3;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center;overflow:hidden}\n.pimg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}\n.ph{font-size:34px;line-height:1}\n.pimg .lbl{position:absolute;left:8px;top:8px;z-index:1;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:var(--info);color:var(--surface)}\n.pimg .lbl.sale{background:var(--bad)}\n.pimg .fav{position:absolute;right:6px;top:6px;z-index:2;width:38px;height:38px;border-radius:50%;border:0;padding:0;display:flex;align-items:center;justify-content:center;background:var(--surface);color:var(--ink-2);cursor:pointer;box-shadow:0 1px 3px rgba(20,35,31,.25)}\n.pimg .fav svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}\n.pimg .fav[aria-pressed=\"true\"]{color:var(--bad)}\n.pimg .fav[aria-pressed=\"true\"] svg{fill:currentColor}\n.pimg.zm{cursor:zoom-in}\n.pimg .pcnt{position:absolute;right:8px;bottom:8px;z-index:1;display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(20,35,31,.72);color:#fff;pointer-events:none}\n.pimg .pcnt svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\nhtml.lb-open,html.lb-open body{overflow:hidden}\n.lb{position:fixed;inset:0;z-index:200;background:#080c0b;display:flex;flex-direction:column;color:#fff;touch-action:pan-x}\n.lb-top{position:absolute;left:0;right:0;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;padding-top:max(10px,env(safe-area-inset-top))}\n.lb-cnt{font-size:14px;font-weight:700;padding:5px 12px;border-radius:999px;background:rgba(255,255,255,.14);min-width:8px}\n.lb-cnt:empty{background:transparent}\n.lb-x{appearance:none;border:0;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:28px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}\n.lb-track{flex:1;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;overscroll-behavior:contain}\n.lb-track::-webkit-scrollbar{display:none}\n.lb-slide{flex:0 0 100%;scroll-snap-align:center;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;padding:64px 0;box-sizing:border-box;cursor:zoom-out}\n.lb-slide img{max-width:100%;max-height:100%;object-fit:contain;display:block;cursor:default;user-select:none;-webkit-user-drag:none}\n.lb-slide .ph{font-size:72px}\n.lb-dots{position:absolute;left:0;right:0;bottom:max(18px,env(safe-area-inset-bottom));display:flex;gap:8px;justify-content:center;pointer-events:none}\n.lb-dots i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.4)}\n.lb-dots i.on{background:#fff}\n.pold{display:inline-block;margin-right:6px;font:500 12px var(--f-body);color:var(--ink-2);text-decoration:line-through}\n.psale{margin-left:6px;font:700 11px var(--f-body);color:var(--bad)}\n.ptier{display:block;font:500 11.5px/1.35 var(--f-body);color:var(--ink-2);margin-top:1px}\n.ptier.on{color:var(--accent);font-weight:700}\n.ppack{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n.ppack .chip{flex:1 1 auto;height:auto;min-height:34px;padding:5px 8px;font-size:12px;white-space:nowrap}\n.cline>.ppack{grid-column:1/-1;margin-top:0}\n.cline .cn small.tiernext{color:var(--accent);font-weight:600}\n.cline .cn small.packtxt{color:var(--ink-2)}\n.sum .r.disc span:last-child{color:var(--ok);font-weight:600}\n.tiers{display:grid;gap:6px}\n.trow{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink-2)}\n.trow input{width:0;flex:1 1 70px;min-width:0;padding:8px 8px}\n.trow span{flex:none}\n.sact select{flex:0 1 auto;max-width:100%;padding:9px 10px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface)}\n.snum small.pk{margin-top:2px;font-size:11px;color:var(--ink-2)}\n/* отчёты */\n.rkpi small.dl{margin-top:2px;font-size:11.5px;font-weight:600}\n.rkpi small.dl.up{color:var(--ok)}\n.rkpi small.dl.down{color:var(--bad)}\n.rkpi small.dl.flat{color:var(--ink-2)}\n.rnote{font-size:12px;color:var(--ink-2);margin:6px 0 0}\n.rread{min-height:20px;font-size:13px;margin:6px 0 8px;color:var(--ink)}\n.rread b{font-variant-numeric:tabular-nums}\n.rchart{position:relative;display:grid;grid-template-columns:44px minmax(0,1fr);gap:6px;padding-top:8px}\n.ryax{position:relative;height:150px;font-size:11px;color:var(--ink-2);font-variant-numeric:tabular-nums}\n.ryax span{position:absolute;right:0;transform:translateY(50%);white-space:nowrap}\n.rplot{position:relative;height:150px;isolation:isolate}\n.rgrid{position:absolute;left:0;right:0;border-top:1px solid var(--line);pointer-events:none}\n.rcols{position:absolute;inset:0;display:flex;align-items:flex-end;gap:2px;touch-action:pan-y}\n.rcol{appearance:none;border:0;background:transparent;padding:0;margin:0;flex:1 1 0;min-width:0;max-width:30px;height:100%;display:flex;align-items:flex-end;justify-content:center;cursor:pointer;position:relative}\n.rcol i{display:block;width:100%;max-width:24px;background:var(--accent);border-radius:4px 4px 0 0;min-height:0}\n.rcol[aria-pressed=\"true\"]::after{content:\"\";position:absolute;inset:0;background:var(--accent-soft);z-index:-1;border-radius:4px}\n.rcol:focus-visible{outline:2px solid var(--accent);outline-offset:1px}\n.rxax{display:flex;justify-content:space-between;margin:4px 0 0 50px;font-size:11px;color:var(--ink-2)}\n.rrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:8px 0;border-top:1px solid var(--line)}\n.rrow .rl{min-width:0}\n.rrow .rl b{display:block;font-weight:600;font-size:14px;overflow-wrap:anywhere}\n.rrow .rl small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.rrow .rv{font:700 13px var(--f-display);font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}\n.rbar{grid-column:1/-1;height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden}\n.rbar i{display:block;height:100%;background:var(--accent);border-radius:4px}\n.rbuy{padding:10px 0;border-top:1px solid var(--line);display:grid;gap:4px}\n.rlist>div:first-child{border-top:0}\n.rlist+.btn{margin-top:8px}\n.rgap{margin-top:10px}\n.rbuy .rh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.rbuy .rh b{font-weight:600;font-size:14px;overflow-wrap:anywhere}\n.rbuy small{font-size:12.5px;color:var(--ink-2)}\n.rtab table{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}\n.rtab th,.rtab td{text-align:right;padding:5px 4px;border-top:1px solid var(--line)}\n.rtab th:first-child,.rtab td:first-child{text-align:left}\n.rtab th{font-weight:600;color:var(--ink-2);font-size:12px}\n.pimg .tag{position:absolute;left:8px;top:8px;background:var(--ink);color:var(--bg);font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;z-index:1}\n.pbody{padding:10px 12px 12px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}\n.pname{font-weight:600;font-size:14px;line-height:1.3;overflow-wrap:anywhere}\n.pw{font-size:12px;color:var(--ink-2)}\n.pdesc{font-size:12px;color:var(--ink-2);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;cursor:pointer}\n.pdesc.open{display:block}\n.pprice{font:700 15px var(--f-display);margin-top:auto;padding-top:6px;font-variant-numeric:tabular-nums}\n.padd{margin-top:8px;width:100%;min-height:41px}\n.stepper{display:flex;align-items:center;justify-content:space-between;margin-top:8px;height:41px;box-sizing:border-box;border:1.5px solid var(--accent);border-radius:12px;overflow:hidden;background:var(--surface)}\n.stepper button{appearance:none;border:0;background:var(--accent-soft);color:var(--accent);width:40px;height:100%;flex:none;font-size:20px;font-weight:700;line-height:1;cursor:pointer}\n.stepper button[disabled]{opacity:.4;cursor:not-allowed}\n.stepper input.qty{flex:1;min-width:0;width:100%;border:0;border-radius:0;background:transparent;text-align:center;font:700 15px var(--f-display);padding:0 2px;height:100%;font-variant-numeric:tabular-nums;-moz-appearance:textfield;appearance:textfield}\n.stepper input.qty::-webkit-outer-spin-button,.stepper input.qty::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}\n.stepper input.qty:focus{box-shadow:none;background:var(--accent-soft)}\n.stepper.sm{margin-top:0;height:auto;width:132px}\n.stepper.sm button{width:34px;height:32px;font-size:18px}\n.stepper.sm input.qty{height:32px}\n.cline{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}\n.cline:first-child{border-top:0}\n.cth{width:56px;height:56px;border-radius:10px;overflow:hidden;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center;position:relative}\n.cth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.cth .ph{font-size:24px}\n.cline .cn{min-width:0}\n.cline .cn b{display:block;font-size:14px;font-weight:600;line-height:1.3;overflow-wrap:break-word}\n.cline .cn small{display:block;font-size:12px;color:var(--ink-2)}\n.cline .cr{display:grid;gap:6px;justify-items:end}\n.cline .cs{font:700 13px var(--f-display);font-variant-numeric:tabular-nums;white-space:nowrap}\n.backlink{margin-bottom:10px}\n@media (max-width:380px){\n  .cline{grid-template-columns:56px minmax(0,1fr)}\n  .cline .cr{grid-column:1/-1;grid-template-columns:auto auto;justify-content:space-between;align-items:center;justify-items:stretch}\n  .cline .cs{text-align:right}\n}\n\n/* seller: catalog editor */\n.prow{display:grid;grid-template-columns:232px minmax(0,1fr);gap:14px;padding:14px 0;border-top:1px solid var(--line)}\n.prow.off .pf{opacity:.8}\n.pph{display:flex;flex-direction:column;gap:8px;align-items:flex-start}\n.pslots{display:grid;grid-template-columns:repeat(3,72px);gap:8px}\n.pslots.busy{pointer-events:none}\n.pslot{position:relative;width:72px;height:72px;border-radius:12px;overflow:hidden}\n.pslot label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;cursor:pointer;background:linear-gradient(160deg,var(--stage-a),var(--stage-b))}\n.pslot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.pslot.has{border:1px solid var(--line)}\n.pslot.add label{background:var(--accent-soft);color:var(--accent);border:2px dashed var(--accent);border-radius:12px;font-size:30px;font-weight:300;line-height:1}\n.pslot.ghost{border:2px dashed var(--line);background:transparent}\n.pslot .px{position:absolute;right:3px;top:3px;width:24px;height:24px;border-radius:50%;border:0;padding:0;background:rgba(20,35,31,.72);color:#fff;font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}\n.pslot .pmain{position:absolute;left:3px;bottom:3px;font-size:10px;font-weight:700;padding:2px 6px;border-radius:999px;background:var(--accent);color:#fff;pointer-events:none}\n.pslot.load::after{content:\"…\";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.72);color:var(--ink);font-size:26px;font-weight:700}\n.phint{font-size:12px;line-height:1.4;color:var(--ink-2);max-width:260px}\n.row-btns label.dis{opacity:.6;pointer-events:none}\n.sr{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none}\n.pf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;min-width:0}\n.pf .full{grid-column:1/-1}\n.pf textarea{min-height:56px}\n.pf .avail{display:flex;align-items:flex-end;padding-bottom:10px}\n.chk{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}\n.pact{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.crow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px;align-items:center;padding:6px 0}\n.crow .x{appearance:none;border:0;background:transparent;font-size:22px;line-height:1;color:var(--ink-2);cursor:pointer;width:36px;height:36px;border-radius:10px}\n@media (max-width:480px){\n  .crow{grid-template-columns:minmax(0,1fr) auto}\n  .crow .x{grid-column:2;grid-row:1/3}\n  .crow input{grid-column:1}\n}\n@media (max-width:560px){\n  .prow{grid-template-columns:minmax(0,1fr)}\n  .pslots{grid-template-columns:repeat(3,minmax(0,1fr));width:100%;max-width:288px}\n  .pslot{width:auto;height:auto;aspect-ratio:1}\n}\n\n/* stock: status line on product cards, seller screen «Остатки» */\n.pst{font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;color:var(--ok)}\n.pst::before{content:\"\";width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}\n.pst.low{color:var(--warn)}\n.cline .cn small.lowtxt{color:var(--warn);font-weight:600}\n.badge.warn{background:var(--warn-soft);color:var(--warn)}\n.srow{padding:14px 0;border-top:1px solid var(--line);display:grid;gap:10px}\n.srow:first-child{border-top:0;padding-top:4px}\n.sh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.sh .sn{min-width:0}\n.sh .sn b{display:block;font-weight:600;overflow-wrap:anywhere}\n.sh .sn small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.snum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\n.snum div{background:var(--surface-2);border-radius:10px;padding:8px 10px;min-width:0}\n.snum small{display:block;font-size:11px;color:var(--ink-2)}\n.snum b{font:700 16px/1.3 var(--f-display);font-variant-numeric:tabular-nums}\n.snum .fr.low{background:var(--warn-soft)}\n.snum .fr.low b{color:var(--warn)}\n.snum .fr.out{background:var(--bad-soft)}\n.snum .fr.out b{color:var(--bad)}\n.sact{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.sact input[type=number]{flex:0 0 150px;width:150px;padding:9px 10px}\n@media (max-width:480px){.sact input[type=number]{flex:1 1 100%;width:auto}}\n@media (max-width:480px){.sact.haspk input[type=number]{flex:1 1 110px;min-width:0}.sact.haspk select{flex:1 1 130px;min-width:0}}\n.sth{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:13px;color:var(--ink-2)}\n.sth input[type=number]{width:90px;padding:8px 10px}\n.jrow{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid var(--line);font-size:14px}\n.jrow:first-of-type{border-top:0}\n.jrow .jn{min-width:0}\n.jrow .jn b{display:block;font-weight:600;overflow-wrap:anywhere}\n.jrow small{display:block;font-size:12px;color:var(--ink-2);overflow-wrap:anywhere}\n.jrow .jd{text-align:right;flex:none;font:700 14px var(--f-display);font-variant-numeric:tabular-nums}\n.jrow .jd small{font:400 12px var(--f-body)}\n.jrow .jd.plus{color:var(--ok)}\n.jrow .jd.minus{color:var(--bad)}\n\n/* клиенты */\n.cmeta{font-size:12.5px;color:var(--ink-2);margin-top:6px}\n.ced{margin-top:12px;display:grid;gap:14px}\n.ced .form{gap:12px}\n.ced h3{font:700 13px var(--f-display)}\n.gchips,.achips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n.gchips .chip{height:30px;font-size:12px;padding:0 10px}\n.achips .chip{height:auto;min-height:34px;padding:6px 12px;text-align:left;justify-content:flex-start;max-width:100%;white-space:normal;line-height:1.3;overflow-wrap:anywhere}\n.ck{display:flex;gap:10px;align-items:flex-start;font-size:14px;cursor:pointer}\n.ck small{display:block;color:var(--ink-2);font-size:12px}\n.corder{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4px 10px;font-size:13px;padding:7px 0;border-top:1px dashed var(--line)}\n.corder:first-of-type{border-top:0}\n.corder .oid{font-weight:700}\n.corder .cs{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.corder .cshop{flex-basis:100%;font-size:12px;color:var(--ink-2)}\n.cmine{appearance:none;display:flex;align-items:center;gap:8px;width:100%;text-align:left;background:var(--surface-2);border:0;border-radius:10px;padding:7px 10px;min-height:38px;cursor:pointer;color:var(--ink);font:inherit;font-size:13px}\n.cmine .cmt{flex:1;min-width:0;display:grid;gap:3px;overflow-wrap:anywhere}\n.cmine .cmt small{font-size:12px;color:var(--ink-2)}\n.cmine .cbadges{display:flex;flex-wrap:wrap;gap:4px}\n.cmine svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transform:rotate(-90deg);flex:none;color:var(--ink-2)}\n.bnote b{font-weight:700}\n.bfrow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:2px 2px 8px}\n.bfrow .bfound{margin:0}\n.cst{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:2px 0 12px}\n.cst>div{background:var(--surface-2);border-radius:12px;padding:8px 10px;min-width:0}\n.cst small{display:block;font-size:11.5px;color:var(--ink-2)}\n.cst b{display:block;font-size:14px;overflow-wrap:anywhere}\n.csec{margin:0 0 14px}\n.csec h3{font:700 13px var(--f-display);margin:0 0 6px}\n.cact{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}\n.cact .btn{flex:1 1 120px;text-align:center}\n.bannerbad{background:var(--bad-soft);color:var(--bad);border-radius:12px;padding:10px 12px;font-size:13px;font-weight:600}\n\n/* placed */\n.eyebrow{font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}\n.stack{display:grid;gap:12px}\n.row-btns{display:flex;flex-wrap:wrap;gap:8px}\n/* список дистрибьюторов и раздел владельца */\n.dgrid{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:14px}\n@media (max-width:540px){.dgrid{grid-template-columns:minmax(0,1fr)}}\n.dcard{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px;display:grid;gap:8px;align-content:start;min-width:0}\n.dcard h2{font:700 16px/1.25 var(--f-display);overflow-wrap:anywhere}\n.dmeta{font-size:13px;color:var(--ink-2)}\n.dcats{display:flex;flex-wrap:wrap;gap:6px}\n.dcats span{background:var(--surface-2);border-radius:999px;padding:3px 9px;font-size:12px}\n.dtag{font-size:12px;font-weight:600;color:var(--accent)}\n.mono{font:700 19px/1.35 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.04em;background:var(--surface-2);padding:10px 12px;border-radius:10px;overflow-wrap:anywhere;user-select:all}\n.mono.small{font-size:13px;letter-spacing:0;font-weight:600}\n.codebox{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}\n.regs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px;margin-top:10px}\n@media (max-width:540px){.regs{grid-template-columns:minmax(0,1fr)}}\n.regs[hidden]{display:none}\n.regs .chk{min-height:34px}\n.regbar{margin-bottom:14px}\n.bcard{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px;display:grid;gap:8px;margin-bottom:12px;min-width:0}\n.bcard h3{margin:0;overflow-wrap:anywhere}\n.brow,.btags{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.btags{gap:6px}\n.btag{font-size:12px;font-weight:600;padding:2px 9px;border-radius:999px;background:var(--accent-soft);color:var(--accent)}\n.btag.warn{background:var(--warn-soft);color:var(--warn)}\n.btag.mute{background:var(--mute-soft);color:var(--mute)}\n.bnote{font-size:13px;background:var(--surface-2);border-radius:10px;padding:8px 10px;white-space:pre-wrap;overflow-wrap:anywhere}\n.chip .cnt{opacity:.7;margin-left:5px;font-weight:500}\n.trow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px}\n.trow input{flex:1 1 150px;min-width:0}\n.trow .dtag{min-width:24px;text-align:center}\n.trow{flex-wrap:nowrap}.trow .btn.sm{flex:none;min-width:40px;padding:0 10px}\n.page>.search{margin-bottom:10px}\n.tsel{display:flex;flex-wrap:wrap;gap:4px 14px;margin:6px 0 10px}\n.regbar select{width:100%}\n.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px}\n.hrow h1{margin-bottom:0}\n.pctrow{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin:12px 0 4px}\n.pctrow>div{flex:0 0 auto}\n.pctrow input[type=text]{width:96px}\n.sum small.sub{display:block;font-size:12px;color:var(--ink-2)}\n.bpage{padding-bottom:30px}\n.btop{display:flex;align-items:center;gap:10px;margin-bottom:12px}\n.page .btop h1{margin:0;font-size:18px;min-width:0;overflow-wrap:anywhere}\n.btop .btn{margin-left:auto;flex:none;height:40px;padding:0 14px}\n.qbtn{appearance:none;flex:none;width:34px;height:34px;border-radius:50%;border:1.5px solid var(--line);background:var(--surface);font:700 16px/1 var(--f-body);color:var(--ink-2);cursor:pointer;padding:0}\n.alink{display:flex;align-items:center;gap:8px;margin-bottom:10px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:5px 6px 5px 12px}\n.alink .mono{flex:1;min-width:0;background:transparent;padding:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;letter-spacing:0;user-select:text}\n.bpage .search{margin-bottom:10px}\n.bbar{position:relative;display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px 2px;scrollbar-width:none}\n.bbar::-webkit-scrollbar{display:none}\n.bbar .chip{flex:none;height:42px;padding:0 14px;gap:6px;white-space:nowrap;font-size:14px}\n.chip svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}\n.chip.on{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}\n.fbtn .cnt2{background:var(--accent);color:#fff;border-radius:999px;min-width:20px;height:20px;font-size:12px;display:inline-flex;align-items:center;justify-content:center;padding:0 5px}\n.selc{position:relative}\n.selc select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:16px}\n.anp .chip.selc{gap:6px;max-width:100%}\n.anp .chip.selc span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.chip.x .xx{margin-left:2px;font-size:13px}\n.bfound{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin:2px 2px 8px}\n.bcard{padding:12px 14px;gap:6px;margin-bottom:10px;grid-template-columns:minmax(0,1fr)}\n.bcard>*{min-width:0}\n.bcard.dim{opacity:.62}\n.bh{display:flex;align-items:center;gap:8px;min-width:0}\n.bh h3{flex:0 1 auto;min-width:0;font-size:16px;line-height:1.25}\n.bsigns{display:flex;gap:8px;flex:none}\n.bh .dtag{margin-left:auto;flex:none;padding-left:4px}\n.sgn{position:relative;width:26px;height:26px;border-radius:50%;border:0;padding:0;display:inline-flex;align-items:center;justify-content:center;flex:none;font:inherit}\nbutton.sgn{cursor:pointer}\n.sgn::after{content:\"\";position:absolute;inset:-7px}\n.sgn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.sgn b{font-size:15px;line-height:1}\n.sgn.talk{background:var(--accent-soft);color:var(--accent)}\n.sgn.warn{background:var(--warn-soft);color:var(--warn)}\n.sgn.app{background:var(--info-soft);color:var(--info)}\n.sgn.refuse{background:var(--mute-soft);color:var(--mute)}\n.bact{display:flex;flex-wrap:wrap;gap:5px;align-items:stretch;margin-top:2px}\n.bic{display:flex;gap:4px;flex:none;margin-left:auto}\n.bphone{flex:1 1 150px;min-width:0;height:40px;border:1.5px solid var(--line);border-radius:12px;background:var(--surface);display:flex;align-items:center;gap:6px;padding:0 10px;font-weight:600;font-size:14px;white-space:nowrap;color:var(--ink);text-decoration:none}\n.bphone svg{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.bphone span{min-width:0;overflow:hidden;text-overflow:ellipsis}\n.bact.tight .bphone svg{display:none}\n.ibtn{appearance:none;flex:none;width:38px;height:40px;padding:0;border:1.5px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}\n.ibtn svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.ibtn.ok{background:var(--accent);border-color:var(--accent);color:#fff}\n.ibtn[disabled]{opacity:.5;cursor:default}\nhtml.sh-open,html.sh-open body{overflow:hidden}\n.fs-bg{position:fixed;inset:0;z-index:44;background:rgba(10,20,18,.5)}\n.fs{position:fixed;left:0;right:0;bottom:0;z-index:45;background:var(--surface);border-radius:22px 22px 0 0;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 -8px 30px rgba(10,20,18,.25);max-width:560px;margin:0 auto}\n.fs-grab{width:40px;height:4px;border-radius:2px;background:var(--line);margin:10px auto 2px;flex:none}\n.fs-head{display:flex;align-items:center;justify-content:space-between;padding:8px 18px;flex:none}\n.fs-head h2{font:700 20px/1.2 var(--f-display)}\n.lnk{appearance:none;border:0;background:transparent;color:var(--accent);font:600 15px var(--f-body);cursor:pointer;padding:8px 0 8px 12px}\n.fs-body{overflow-y:auto;padding:0 18px 8px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}\n.fs-t{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2);margin:12px 0 8px}\n.fs-c{display:flex;flex-wrap:wrap;gap:8px}\n.fs-c .chip{height:40px;padding:0 14px;font-size:14px}\n.fs-foot{padding:10px 18px calc(14px + env(safe-area-inset-bottom,0px));flex:none}\n.fs-foot .btn{width:100%;height:48px}\n.lgd{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:transparent;border:0;border-top:1px solid var(--line);padding:12px 0;font:inherit;color:inherit;cursor:pointer}\ndiv.lgd{cursor:default}\n.lgd:first-child{border-top:0}\n.lgd small{display:block;color:var(--ink-2);font-size:13px;margin-top:2px}\n.lgn{font-size:13px;color:var(--ink-2);padding:8px 0 14px}\n/* проверка товаров: клиент */\n.pcard.pend{background:var(--mute-soft);border-style:dashed}\n.pcard.pend .pimg img,.pcard.pend .pimg .ph{opacity:.5;filter:grayscale(1)}\n.pcard.pend .pname{color:var(--ink-2)}\n.pimg .tag.mod{background:var(--warn-soft);color:var(--warn)}\n.pwait{margin-top:auto;padding-top:6px;font-size:12px;font-weight:600;color:var(--ink-2)}\n.chip.mod{border-style:dashed}\n.modnote{margin-bottom:12px}\n/* проверка товаров: продавец */\n.mtag{display:inline-flex;align-items:center;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--mute-soft);color:var(--mute);white-space:nowrap;width:max-content}\n.mtag.wait{background:var(--info-soft);color:var(--info)}\n.mtag.ret{background:var(--bad-soft);color:var(--bad)}\n.mh:empty{display:none}\n.mhead{border-radius:12px;padding:10px 12px;background:var(--mute-soft)}\n.mhead.ret{background:var(--bad-soft)}\n.mrow{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}\n.mreason{margin-top:8px;border-left:3px solid var(--bad);background:var(--surface);border-radius:8px;padding:8px 10px;font-size:13px;overflow-wrap:anywhere;white-space:pre-wrap}\n.mreason small{display:block;font-size:11px;font-weight:700;color:var(--bad);margin-bottom:2px;white-space:normal}\n.mgroup{margin:10px 0 6px;padding:10px;border:1px dashed var(--line);border-radius:14px;background:var(--surface)}\n.mgroup h4{font:700 13px var(--f-display);margin:0 0 8px}\n.mcard{border:1px solid var(--line);border-radius:12px;padding:10px;margin-top:8px;background:var(--surface)}\n.mcard .mtop{display:flex;gap:10px;align-items:center}\n.mcard .mth{width:52px;height:52px;border-radius:10px;overflow:hidden;background:var(--mute-soft);display:flex;align-items:center;justify-content:center;flex:none}\n.mcard .mth img{width:100%;height:100%;object-fit:cover}\n.mcard .mtx{display:flex;flex-direction:column;gap:3px;min-width:0}\n.mcard .mtx b{overflow-wrap:anywhere}\n.mcard .mtx small{color:var(--ink-2)}\n.mact{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}\n.mban{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:8px 0}\n/* проверка товаров: владелец */\n.badge.bad{background:var(--bad);color:#fff}\n.seg.s3{grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:12px}\n.seg.s3 button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;font-size:13px;line-height:1.2}\n.seg.s3 .cnt{font-size:15px;color:var(--ink-2)}\n.seg.s3 .cnt.hot{color:var(--bad)}\n.rvfil{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:8px;margin-bottom:8px}\n.rvfil select{min-width:0;width:100%;font-size:14px;padding-left:10px;padding-right:6px;text-overflow:ellipsis}\n.rvinfo{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0 12px;font-size:13px;color:var(--ink-2);min-height:34px}\n.rcard{border:1px solid var(--line);background:var(--surface);border-radius:16px;padding:12px;margin-bottom:12px}\n.rtop{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}\n.dpill{appearance:none;border:0;border-radius:999px;background:var(--accent-soft);color:var(--accent);font:700 13px var(--f-body);padding:7px 13px;cursor:pointer;max-width:68%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpill.static{cursor:default;max-width:100%}\n.rtime{font-size:12px;color:var(--ink-2);white-space:nowrap}\n.rbody{display:flex;gap:12px}\n.rth{width:96px;height:96px;flex:none;border-radius:12px;overflow:hidden;position:relative;background:linear-gradient(160deg,var(--stage-a),var(--stage-b));display:flex;align-items:center;justify-content:center}\n.rth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.rth.zm{cursor:zoom-in}\n.rth .pcnt{position:absolute;right:5px;bottom:5px;font-size:10px;font-weight:700;padding:2px 6px;border-radius:999px;background:rgba(20,35,31,.72);color:#fff}\n.rtx{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}\n.rtx b{overflow-wrap:anywhere}\n.rtx small{color:var(--ink-2);overflow-wrap:anywhere}\n.rprice{font:700 16px var(--f-display);margin-top:4px;font-variant-numeric:tabular-nums}\n.rtiers{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--ink-2)}\n.rwarn{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}\n.rwarn span{font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--warn-soft);color:var(--warn)}\n.ract{display:flex;gap:8px;margin-top:12px}\n.ract .btn{flex:1;min-width:0;padding:11px 6px;font-size:14px}\n.rsum{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:4px 0 10px}\n.rsum small{color:var(--ink-2);flex-basis:100%}\n.rcount{font-size:12px;color:var(--ink-2);text-align:right;margin-top:4px}\n.rvform .err,.fs-foot .err{color:var(--bad);font-size:13px;min-height:0}\n.fs-foot .err:empty{display:none}\n.fs-foot .err{margin-bottom:8px}\n/* точка магазина */\n.lchip{appearance:none;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;height:32px;padding:0 12px 0 9px;font:600 13px var(--f-body);display:inline-flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap}\n.lchip svg{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.lchip.add{border-style:dashed;color:var(--accent)}\n.lchip[disabled],.llink[disabled]{opacity:.5}\n.bloc{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px}\n.lchips{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px}\n.dkm{font-size:13px;font-weight:700;color:var(--ink-2);font-variant-numeric:tabular-nums}\n.llink{appearance:none;border:0;background:transparent;color:var(--accent);font:600 13px var(--f-body);cursor:pointer;padding:6px 2px}\n.cloc{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:var(--info-soft);color:var(--info);border-radius:10px;padding:8px 10px;font-size:13px;font-weight:600}\n.cloc i{display:inline-block;font-style:normal;font-size:11px;font-weight:700;background:var(--surface);border-radius:999px;padding:1px 7px;margin-left:4px;color:var(--ink-2)}\n.locbtns{display:flex;gap:6px;flex-wrap:wrap}\n.locok{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:var(--ok-soft);color:var(--ok);border-radius:10px;padding:8px 10px;font-weight:600;font-size:14px}\n.locok i{font-style:normal;font-size:12px;color:var(--warn)}\n.locbtn{display:flex;width:100%;gap:8px}\n.locbtn svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.locform{display:grid;gap:8px}\n.locpaste{display:flex;gap:8px;align-items:center}\n.locpaste input{flex:1;min-width:0}\n.locform .err{min-height:0}\n.oloc{margin:6px 0}\n.mapbtns{display:grid;gap:10px;margin:6px 0 12px}\n.mapco{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0 10px;color:var(--ink-2)}\n@media (prefers-reduced-motion:no-preference){.chip,.seg button{transition:border-color .12s,background-color .12s}}\n/* широкий экран: меню стоит слева всегда (правила стоят в конце, чтобы переопределить .bar и .toast) */\n@media (min-width:1000px){\n  body{padding-left:260px}\n  .top{display:none}\n  .menu{width:260px;z-index:15;transform:none;visibility:visible;box-shadow:none}\n  .mscrim,.mclose{display:none}\n  .bar{left:260px}\n  .toast{left:calc(50% + 130px)}\n</style>\n</head><body>\n\n<header class=\"top\"><div class=\"wrap\">\n  <button type=\"button\" class=\"menubtn\" id=\"menubtn\" data-act=\"menu\" aria-haspopup=\"dialog\" aria-controls=\"menu\" aria-expanded=\"false\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 22 22\" aria-hidden=\"true\"><path d=\"M3 6h16M3 11h16M3 16h16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg><span class=\"badge bad\" id=\"menubadge\" hidden></span></button>\n  <div class=\"brand\">\n    <span class=\"logo\" role=\"img\" aria-label=\"Sarbon\"></span>\n    <span id=\"brandName\"></span>\n  </div>\n</div></header>\n<div class=\"mscrim\" id=\"mscrim\" data-act=\"menuclose\" hidden></div>\n<aside class=\"menu\" id=\"menu\" role=\"dialog\" aria-modal=\"true\">\n  <div class=\"mhd\">\n    <div class=\"brand\">\n      <span class=\"logo\" role=\"img\" aria-label=\"Sarbon\"></span>\n      <span id=\"mbrand\"></span>\n    </div>\n    <button type=\"button\" class=\"mclose\" data-act=\"menuclose\" id=\"mclose\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M4 4l12 12M16 4 4 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg></button>\n  </div>\n  <nav class=\"mnav\" id=\"nav\"></nav>\n  <div class=\"mfoot\"><span id=\"langlab\"></span><button type=\"button\" class=\"langbtn\" id=\"langbtn\" data-act=\"lang\"></button></div>\n</aside>\n<main id=\"view\"></main>\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\" hidden></div>\n\n<script>\n/* Общий код: настройки, единицы измерения, время, тексты заказа. Используется и в приложении, и на сервере. */\nlet LANG='ru';\nconst setLang=l=>{LANG=l==='uz'?'uz':'ru'};\nconst L=(ru,uz)=>LANG==='uz'?uz:ru;\nconst nm=o=>!o?'':(LANG==='uz'&&o.uz?o.uz:o.name);\n\n/* статусы; у самовывоза и доставки «Готов» и «Завершён» называются по-разному */\nconst STATUS={\n  new:{name:'Новый',uz:'Yangi',c:'info'},\n  accepted:{name:'В работе',uz:'Ishlanmoqda',c:'warn'},\n  ready:{name:'Готов',uz:'Tayyor',c:'ok'},\n  done:{name:'Завершён',uz:'Yakunlandi',c:'mute'},\n  cancelled:{name:'Отменён',uz:'Bekor qilindi',c:'bad'}\n};\nconst STATUS_MODE={\n  pickup:{ready:{name:'Готов к выдаче',uz:'Topshirishga tayyor'},done:{name:'Выдан',uz:'Topshirildi'}},\n  delivery:{ready:{name:'Готов к отправке',uz:'Joʻnatishga tayyor'},done:{name:'Доставлен',uz:'Yetkazildi'}}\n};\nfunction stOf(status,mode){\n  const b=STATUS[status]||STATUS.new;\n  const m=(STATUS_MODE[mode==='delivery'?'delivery':'pickup']||{})[status];\n  return m?Object.assign({},b,m):b;\n}\n\nconst DEFAULT={\n  v:3,\n  shop:{name:'Оптовая база',phone:'',telegram:'',address:'',addressUz:'',delivery:true,leadHours:2,deliveryLeadHours:24,openFrom:9,openTo:20,minOrder:0,deliveryFee:0,freeDeliveryFrom:0,discounts:[],regions:[],home:''}\n};\nconst clone=o=>JSON.parse(JSON.stringify(o));\nconst pad=n=>String(n).padStart(2,'0');\nconst ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());\nconst nf=new Intl.NumberFormat('ru-RU');\nconst num=v=>nf.format(Math.round(Number(v)||0));\nconst money=v=>num(v)+' '+L('сум','soʻm');\nconst esc=s=>String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\n\n/* единицы измерения: вес или объём одной единицы товара */\nconst UNIT_IDS=['g','kg','pc','ml','l'];\nconst UNITS={g:{ru:'г',uz:'g'},kg:{ru:'кг',uz:'kg'},pc:{ru:'шт',uz:'dona'},ml:{ru:'мл',uz:'ml'},l:{ru:'л',uz:'l'}};\nconst unitName=u=>{const x=UNITS[u]||UNITS.g;return LANG==='uz'?x.uz:x.ru};\nconst amountStr=v=>String(Math.round((Number(v)||0)*1000)/1000).replace('.',',');\nconst weightLabel=p=>Number(p&&p.amount)>0?amountStr(p.amount)+' '+unitName(p.unit):'';\nconst prodDesc=p=>LANG==='uz'&&p.descUz?p.descUz:(p.desc||'');\n\n/* Метки товара: «Акция» (со старой ценой) и «Новинка». Старая цена показывается, только если она выше нынешней. */\nconst TAGS={sale:{ru:'Акция',uz:'Aksiya'},new:{ru:'Новинка',uz:'Yangilik'}};\nconst tagName=t=>TAGS[t]?(LANG==='uz'?TAGS[t].uz:TAGS[t].ru):'';\nconst oldPrice=p=>p&&p.tag==='sale'&&Number(p.old)>Number(p.price)?Number(p.old):0;\nconst salePct=p=>{const o=oldPrice(p);return o?Math.max(1,Math.min(99,Math.round((o-Number(p.price))/o*100))):0};\n\n/* Цена за штуку зависит от количества: у товара до трёх ступеней tiers=[{n, price}] («от n шт — price»), по возрастанию n и убыванию цены.\n   Считается по штукам этого товара в заказе, и цена ступени действует на все штуки. */\nconst tiersOf=p=>Array.isArray(p&&p.tiers)?p.tiers:[];\nfunction unitPrice(p,qty){\n  let pr=Number(p&&p.price)||0;\n  tiersOf(p).forEach(t=>{if(qty>=Number(t.n)&&Number(t.price)>0&&Number(t.price)<pr)pr=Number(t.price)});\n  return pr;\n}\n/* Следующая ступень, до которой не хватает штук: {n, price, left} или null. */\nfunction nextTier(p,qty){\n  const cur=unitPrice(p,qty);\n  const t=tiersOf(p).find(x=>Number(x.n)>qty&&Number(x.price)>0&&Number(x.price)<cur);\n  return t?{n:Number(t.n),price:Number(t.price),left:Number(t.n)-qty}:null;\n}\n/* Скидка от суммы заказа: cfg.shop.discounts=[{from, pct}] — «от суммы from скидка pct %». Берётся самая большая из достигнутых. */\nfunction orderDiscount(cfg,sub){\n  let pct=0;\n  (((cfg&&cfg.shop&&cfg.shop.discounts)||[])).forEach(d=>{if(sub>=Number(d.from)&&Number(d.pct)>pct)pct=Number(d.pct)});\n  return {pct,amount:pct?Math.round(sub*pct/100):0};\n}\n/* Следующая скидка, до которой не хватает суммы: {from, pct, left} или null. */\nfunction nextDiscount(cfg,sub){\n  const cur=orderDiscount(cfg,sub).pct;\n  const d=(((cfg&&cfg.shop&&cfg.shop.discounts)||[])).find(x=>Number(x.from)>sub&&Number(x.pct)>cur);\n  return d?{from:Number(d.from),pct:Number(d.pct),left:Number(d.from)-sub}:null;\n}\n\n/* Чистка ступеней цены и скидок: одни и те же правила в приложении и на сервере.\n   Ступени цены: до трёх, «от n шт» (n от 2 до 500) по возрастанию, цена каждой ниже обычной и ниже предыдущей. */\nconst cleanTiers=(a,price)=>{\n  const t=[];\n  (Array.isArray(a)?a:[]).forEach(x=>{\n    if(!x||typeof x!=='object')return;\n    const n=Math.round(Number(x.n)),pr=Math.round(Number(x.price));\n    if(n>=2&&n<=500&&pr>=1&&pr<=1e8)t.push({n,price:pr});\n  });\n  t.sort((x,y)=>x.n-y.n);\n  const out=[];let prev=Number(price)||0;\n  t.forEach(x=>{\n    if(out.length&&x.n===out[out.length-1].n)return;\n    if(x.price<prev){out.push(x);prev=x.price}\n  });\n  return out.slice(0,3);\n};\n/* Скидки от суммы заказа: до трёх ступеней «от суммы — %»; сумма растёт, процент (1–50) строго растёт, иначе ступень отбрасывается. */\nconst cleanDiscounts=a=>{\n  const t=[];\n  (Array.isArray(a)?a:[]).forEach(d=>{\n    if(!d||typeof d!=='object')return;\n    const from=Math.round(Number(d.from)),pct=Math.round(Number(d.pct));\n    if(from>=1&&from<=1e9&&pct>=1)t.push({from,pct:Math.min(50,pct)});\n  });\n  t.sort((x,y)=>x.from-y.from);\n  const out=[];\n  t.forEach(d=>{\n    const last=out[out.length-1];\n    if(last&&(d.from===last.from||d.pct<=last.pct))return;\n    out.push(d);\n  });\n  return out.slice(0,3);\n};\n\n/* Упаковки: у товара поля box («в коробке N шт») и blk («в блоке N шт»), оба необязательные. Цена и склад всегда в штуках. */\nconst PACK_KEYS=['box','blk'];\nconst packSize=(p,k)=>{const n=Math.floor(Number(p&&p[k]));return n>=2?n:0};\nconst packShort=k=>k==='box'?L('кор.','quti'):L('бл.','blok');\nconst packWord=k=>k==='box'?L('коробка','quti'):L('блок','blok');\nconst pcsWord=()=>L('шт','dona');\n/* Раскладывает штуки по упаковкам, сначала по большим: 100 шт при коробке 48 и блоке 12 → 2 кор. + 0 бл., остаток 4 шт. */\nfunction packSplit(p,qty){\n  const parts=[];let r=Math.max(0,Math.floor(Number(qty)||0));\n  PACK_KEYS.forEach(k=>{const n=packSize(p,k);if(n&&r>=n){const c=Math.floor(r/n);parts.push({k,c,n});r-=c*n}});\n  return {parts,rest:r};\n}\n/* «2 кор. × 12 шт» (одна упаковка, без остатка), «2 кор. + 1 бл. + 4 шт» (иначе); пусто, если упаковок нет или в количество не вошла ни одна. */\nfunction packText(p,qty){\n  const {parts,rest}=packSplit(p,qty);\n  if(!parts.length)return '';\n  if(parts.length===1&&!rest)return parts[0].c+' '+packShort(parts[0].k)+' × '+parts[0].n+' '+pcsWord();\n  return parts.map(x=>x.c+' '+packShort(x.k)).concat(rest?[rest+' '+pcsWord()]:[]).join(' + ');\n}\n\n/* Остаток товара s = {q: на складе, r: отложено под заказы, low: порог «мало»}; нет записи — учёт не ведётся.\n   Покупателям: av — сколько можно заказать (не больше cap, чтобы не раскрывать большие остатки), lw — товара мало, и число показываем в подписи «Мало (осталось N)». */\nconst stkAvail=s=>s?Math.max(0,(Number(s.q)||0)-(Number(s.r)||0)):null;\nfunction stkPublic(s,cap){\n  if(!s)return undefined;\n  const a=stkAvail(s),lw=a>0&&Number(s.low)>0&&a<=Number(s.low);\n  return {av:lw||!(cap>0)?a:Math.min(a,cap),lw};\n}\n\n/* Стоимость доставки: берётся только при доставке; если указан порог «бесплатно от» и сумма товаров его достигла, доставка бесплатна. */\nfunction deliveryFee(cfg,mode,sub){\n  const sh=cfg.shop,fee=Number(sh.deliveryFee)||0,free=Number(sh.freeDeliveryFrom)||0;\n  if(mode!=='delivery'||fee<=0)return 0;\n  return free>0&&Number(sub)>=free?0:fee;\n}\nfunction mergeCfg(d){\n  const out=clone(DEFAULT);\n  if(d&&typeof d==='object'&&d.shop&&typeof d.shop==='object')Object.keys(out.shop).forEach(k=>{if(d.shop[k]!==undefined&&d.shop[k]!==null)out.shop[k]=d.shop[k]});\n  return out;\n}\n\n/* Регионы Узбекистана: 12 областей, Каракалпакстан и город Ташкент.\n   Дистрибьютор отмечает, куда доставляет (shop.regions; пустой список — по всей стране) и где его склад (shop.home, для самовывоза).\n   Магазин выбирает свой регион. Самовывоз всегда возможен, ограничена только доставка. */\nconst REGIONS=[\n  {id:'kk',ru:'Республика Каракалпакстан',uz:'Qoraqalpogʻiston Respublikasi'},\n  {id:'an',ru:'Андижанская область',uz:'Andijon viloyati'},\n  {id:'bu',ru:'Бухарская область',uz:'Buxoro viloyati'},\n  {id:'ji',ru:'Джизакская область',uz:'Jizzax viloyati'},\n  {id:'qa',ru:'Кашкадарьинская область',uz:'Qashqadaryo viloyati'},\n  {id:'nv',ru:'Навоийская область',uz:'Navoiy viloyati'},\n  {id:'nm',ru:'Наманганская область',uz:'Namangan viloyati'},\n  {id:'sa',ru:'Самаркандская область',uz:'Samarqand viloyati'},\n  {id:'su',ru:'Сурхандарьинская область',uz:'Surxondaryo viloyati'},\n  {id:'si',ru:'Сырдарьинская область',uz:'Sirdaryo viloyati'},\n  {id:'tv',ru:'Ташкентская область',uz:'Toshkent viloyati'},\n  {id:'tk',ru:'Город Ташкент',uz:'Toshkent shahri'},\n  {id:'fa',ru:'Ферганская область',uz:'Fargʻona viloyati'},\n  {id:'xo',ru:'Хорезмская область',uz:'Xorazm viloyati'}\n];\nconst REGION_IDS=REGIONS.map(r=>r.id);\nconst regionName=id=>{const r=REGIONS.find(x=>x.id===id);return r?(LANG==='uz'?r.uz:r.ru):''};\n/* один регион: его номер или пустая строка */\nconst cleanRegion=v=>typeof v==='string'&&REGION_IDS.includes(v)?v:'';\n/* список регионов без повторов и лишнего, в порядке справочника */\nconst cleanRegions=a=>{const set=new Set(Array.isArray(a)?a:[]);return REGION_IDS.filter(id=>set.has(id))};\n/* Ограничена ли доставка: отмечены не все регионы, а часть. Пустой список и «все четырнадцать» — по всей стране. */\n/* Региональный фильтр пока выключен: работаем только по Навои, регионы нигде не показываются и доставку не ограничивают (даже если когда-то были отмечены).\n   Чтобы вернуть, поставьте REGIONS_DEFAULT = true. Тесты включают его через globalThis.__regionsOn. */\nconst REGIONS_DEFAULT=false;\nconst regionsOn=()=>typeof globalThis.__regionsOn==='boolean'?globalThis.__regionsOn:REGIONS_DEFAULT;\nconst hasZone=a=>{if(!regionsOn())return false;const n=cleanRegions(a).length;return n>0&&n<REGION_IDS.length};\n/* Доставляет ли дистрибьютор (запись из списка или настройки) в регион. Нет региона у клиента — считаем, что доставляет. */\nconst deliversTo=(sh,reg)=>!!sh&&sh.delivery!==false&&(!hasZone(sh.regions)||!reg||cleanRegions(sh.regions).includes(reg));\n/* Подходит ли дистрибьютор клиенту из региона reg: доставляет к нему или находится в его регионе (самовывоз). */\nconst servesRegion=(sh,reg)=>!!sh&&(deliversTo(sh,reg)||(!!reg&&sh.home===reg));\n\n/* Время склада: Узбекистан, UTC+5. Возвращает Date, у которого локальные часы совпадают со стенными часами склада. */\nconst SHOP_TZ=5;\nfunction shopNow(){return new Date(Date.now()+SHOP_TZ*3600000+new Date().getTimezoneOffset()*60000)}\n/* сколько часов нужно на подготовку: самовывоз и доставка настраиваются отдельно */\nconst leadFor=(cfg,mode)=>mode==='delivery'?cfg.shop.deliveryLeadHours:cfg.shop.leadHours;\nfunction pickupInfo(cfg,now,leadHours){\n  now=now||shopNow();\n  const lead=Math.max(0,Number(leadHours!==undefined?leadHours:cfg.shop.leadHours)||0);\n  const from=Math.max(0,Math.min(22,Math.floor(Number(cfg.shop.openFrom)||9)));\n  const to=Math.max(from+1,Math.min(23,Math.floor(Number(cfg.shop.openTo)||20)));\n  const earliest=new Date(now.getTime()+lead*3600000);\n  const slots=ds=>{\n    const out=[];\n    for(let m=from*60;m<=to*60;m+=30){\n      const t=pad(Math.floor(m/60))+':'+pad(m%60);\n      const dt=new Date(ds+'T'+t+':00');\n      if(dt>=earliest)out.push(t);\n    }\n    return out;\n  };\n  let min=ymd(earliest);\n  for(let i=0;i<20;i++){\n    const d=new Date(earliest.getFullYear(),earliest.getMonth(),earliest.getDate()+i);\n    if(slots(ymd(d)).length){min=ymd(d);break}\n  }\n  const md=new Date(now.getFullYear(),now.getMonth(),now.getDate()+60);\n  return {min,max:ymd(md),slots};\n}\nconst UZ_WD=['yak','dush','sesh','chor','pay','jum','shan'];\nconst UZ_MO=['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentyabr','oktyabr','noyabr','dekabr'];\nfunction fmtWhen(s){\n  const d=new Date(s);\n  if(isNaN(d))return s||'';\n  if(LANG==='uz')return UZ_WD[d.getDay()]+', '+d.getDate()+'-'+UZ_MO[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes());\n  return d.toLocaleString('ru-RU',{weekday:'short',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});\n}\nfunction prodLine(it){\n  const w=weightLabel(it);\n  const pk=packText(it,it.qty);\n  return '• '+nm(it)+(w?' ('+w+')':'')+' × '+it.qty+(pk?' ('+pk+')':'')+' = '+money(it.price*it.qty);\n}\n/* Текст заказа для Telegram. maxItems: если список очень длинный, показываем первые позиции и пишем, сколько скрыто. */\nfunction orderText(o,shop,maxItems){\n  const items=o.items||[],P=[];\n  const shown=maxItems&&items.length>maxItems?items.slice(0,maxItems):items;\n  P.push(L('Заказ ','Buyurtma ')+o.id+' — '+(shop.name||DEFAULT.shop.name));\n  P.push(L('Товары:','Mahsulotlar:'));\n  shown.forEach(it=>P.push(prodLine(it)));\n  if(shown.length<items.length){\n    const n=items.length-shown.length;\n    P.push(L('… и ещё '+n+' поз. (полный список в приложении)','… va yana '+n+' ta pozitsiya (toʻliq roʻyxat ilovada)'));\n  }\n  if(o.mode==='delivery'){\n    P.push(L('Доставка: ','Yetkazib berish: ')+fmtWhen(o.pickupAt));\n    if(o.region&&regionName(o.region))P.push(L('Регион: ','Hudud: ')+regionName(o.region));\n    P.push(L('Адрес: ','Manzil: ')+(o.address||''));\n  }else P.push(L('Самовывоз: ','Olib ketish: ')+fmtWhen(o.pickupAt));\n  P.push(L('Имя: ','Ism: ')+o.name+L(', тел.: ',', tel.: ')+o.phone);\n  if(o.org)P.push(L('Организация: ','Tashkilot: ')+o.org);\n  if(o.comment)P.push(L('Комментарий: ','Izoh: ')+o.comment);\n  if(o.disc>0)P.push(L('Скидка '+o.dpct+'%: −','Chegirma '+o.dpct+'%: −')+money(o.disc));\n  if(o.fee>0)P.push(L('Стоимость доставки: ','Yetkazib berish narxi: ')+money(o.fee));\n  P.push(L('Итого: ','Jami: ')+money(o.total)+L(', оплата при получении',', olganda toʻlanadi'));\n  return P.join('\\n');\n}\n\n/* ---------- местоположение ---------- */\n/* Точка на карте: {lat, lng} с пятью знаками (около метра) или null, если это не координаты. */\nfunction cleanLoc(v){\n  if(!v||typeof v!=='object'||Array.isArray(v))return null;\n  const n=x=>typeof x==='number'?x:(typeof x==='string'&&x.trim()!==''?Number(x):NaN);\n  const lat=n(v.lat),lng=n(v.lng);\n  if(!isFinite(lat)||!isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180||(lat===0&&lng===0))return null;\n  return {lat:Math.round(lat*1e5)/1e5,lng:Math.round(lng*1e5)/1e5};\n}\n/* Ссылка на точку: k — «y» (Яндекс.Карты) или «g» (Google Maps). */\nconst mapUrl=(k,p)=>k==='g'?'https://www.google.com/maps/search/?api=1&query='+p.lat+','+p.lng:'https://yandex.com/maps/?pt='+p.lng+','+p.lat+'&z=17&l=map';\n/* Расстояние между точками, км (по дуге большого круга). */\nfunction distKm(a,b){\n  const r=Math.PI/180,dl=(b.lat-a.lat)*r,dg=(b.lng-a.lng)*r;\n  const h=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dg/2)**2;\n  return 12742*Math.asin(Math.min(1,Math.sqrt(h)));\n}\n/* Координаты из того, что вставил человек: ссылка Яндекс.Карт, Google Maps, 2ГИС, OpenStreetMap или просто «41.5543, 60.6361».\n   Короткие ссылки (maps.app.goo.gl, yandex.uz/maps/-/…) координат не содержат: для них вернётся null. */\nfunction parseGeo(text){\n  let s=String(text==null?'':text).trim().slice(0,2000);\n  if(!s)return null;\n  try{s=decodeURIComponent(s)}catch(e){}\n  const F='(-?\\\\d{1,3}(?:\\\\.\\\\d+)?)',pair=(a,b)=>cleanLoc({lat:a,lng:b});\n  let m;\n  if(/yandex\\.|ya\\.ru|2gis\\./i.test(s)){\n    // у Яндекса и 2ГИС порядок «долгота, широта»\n    m=s.match(new RegExp('[?&#/](?:pt|ll|m)=\\\\s*'+F+'\\\\s*[,;]\\\\s*'+F));\n    if(m)return pair(m[2],m[1]);\n  }\n  m=s.match(/!3d(-?\\d+(?:\\.\\d+)?)!4d(-?\\d+(?:\\.\\d+)?)/);      // Google: метка\n  if(m)return pair(m[1],m[2]);\n  m=s.match(new RegExp('@'+F+'\\\\s*,\\\\s*'+F));                   // Google, Apple: центр карты\n  if(m)return pair(m[1],m[2]);\n  m=s.match(new RegExp('[?&](?:q|query|ll|sll|center|destination|daddr|saddr)=\\\\s*'+F+'\\\\s*[,;+ ]\\\\s*'+F));\n  if(m)return pair(m[1],m[2]);\n  m=s.match(new RegExp('[?&]mlat='+F+'&mlon='+F));            // OpenStreetMap\n  if(m)return pair(m[1],m[2]);\n  m=s.match(new RegExp('#map=\\\\d{1,2}/'+F+'/'+F));\n  if(m)return pair(m[1],m[2]);\n  // просто числа: «41.5543, 60.6361», «41.5543 60.6361», «41,5543 60,6361»\n  const t=s.replace(/^[^\\d-]+/,'').replace(/[^\\d.,;\\s-]+$/,'');\n  m=t.match(/^(-?\\d{1,3}(?:[.,]\\d+)?)\\s*[;\\s]\\s*(-?\\d{1,3}(?:[.,]\\d+)?)$/)||t.match(/^(-?\\d{1,3}\\.\\d+)\\s*,\\s*(-?\\d{1,3}\\.\\d+)$/);\n  if(!m)m=s.match(new RegExp('(-?\\\\d{1,2}\\\\.\\\\d{3,})\\\\s*[,;/\\\\s]\\\\s*(-?\\\\d{1,3}\\\\.\\\\d{3,})'));\n  if(m){\n    let a=Number(String(m[1]).replace(',','.')),b=Number(String(m[2]).replace(',','.'));\n    if(Math.abs(a)>90&&Math.abs(b)<=90){const x=a;a=b;b=x}\n    return pair(a,b);\n  }\n  return null;\n}\n\n\n/* ---------- app ---------- */\nconst $=(s,r)=>(r||document).querySelector(s);\nconst MAX_QTY=500,MAX_LINES=30,MAX_CATS=40,MAX_ITEMS=300;\nconst S={\n  view:'shops',sellerTab:'orders',filter:'active',msub:null,\n  cfg:clone(DEFAULT),\n  form:{name:'',phone:'',mode:'pickup',address:'',date:'',time:'',comment:'',region:'',terr:'',loc:null},\n  region:'',showFar:false,regSent:false,regOnly:null,\n  myOrders:[],allOrders:[],stats:{doneSum:0,doneCount:0},\n  tg:null,initData:'',uid:null,admin:false,auth:false,ready:false,authErr:'',\n  busy:false,dirty:false,saving:false,again:false,saveState:'',cc:null,\n  prod:{cats:[],items:[]},cart:{},shopCat:'all',shopStep:'list',shopPlaced:null,q:'',\n  pfilter:'all',medit:{},upl:{},dirtyC:false,dirtyP:false,cd:null,\n  stk:{},stkLoaded:false,sfilter:'all',sbusy:{},sc:null,jr:[],jrOpen:false,\n  profile:null,blocked:false,pfBusy:false,\n  pm:false,xbusy:'',pick:null,pickBusy:false,\n  fav:[],favT:null,favSeq:0,imp:null,impBusy:false,\n  rep:{days:30,data:null,busy:false,err:false,sel:-1,hov:-1,allP:false,tab:false,seq:0,drag:false,skip:0},\n  an:{days:30,sh:'',tab:'cats',sort:'sum',all:false,data:null,shops:[],err:false,seq:0},\n  did:'',epoch:0,switching:false,off:false,otherCart:null,\n  hub:{title:'',shops:[],me:null,terrs:[],loaded:false,err:false},\n  own:{shops:[],title:'',max:50,loaded:false,err:false,made:null,busy:'',fname:'',fcode:'',ftitle:null,rc:'',err2:'',period:'month',stats:null,serr:false,pcts:{},ppl:null,pbusy:false,perr:'',tname:'',aname:'',acode:'',aterr:[],amade:null,imp:null},\n  rv:{seg:'wait',items:[],counts:{wait:0,ret:0,ok:0},shops:[],loaded:false,err:false,q:'',did:'',cat:'',busy:false,ret:null,rtxt:'',edit:null},\n  base:{role:'',loaded:false,err:false,items:[],total:0,all:0,counts:{},unchk:0,terrs:[],mine:[],agents:[],more:false,terr:'',f:'',ag:'',sort:'',sheet:false,legend:false,q:'',busy:false,seq:0,qt:null,edit:null,fm:{},ferr:'',near:null,link:'',locBusy:false,mark:'',mc:false,cd:'',cx:null,cdd:null,cf:null,cbusy:false,cseq:0}\n};\nconst view=$('#view');\nlet toastT=null,saveT=null;\n\nfunction toast(msg){\n  const t=$('#toast');t.textContent=msg;t.hidden=false;\n  clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},Math.min(8000,Math.max(3200,String(msg).length*55)));\n}\nconst waitMs=ms=>new Promise(r=>setTimeout(r,ms));\nconst QS=new URLSearchParams(location.search);\nconst validDid=d=>/^[a-z0-9]{2,12}$/.test(String(d||''));\nconst okey=(id,d)=>d+'|'+id;\nconst plTovar=n=>{const a=n%100,b=n%10;return a>=11&&a<=14?'товаров':b===1?'товар':b>=2&&b<=4?'товара':'товаров'};\nconst hubTitle=()=>S.hub.title||'Sarbon';\nconst isOwner=()=>!!(S.hub.me&&S.hub.me.owner);\nconst isAgent=()=>!!(S.hub.me&&S.hub.me.agent);\n/* общая база магазинов: смотрят владелец, агенты и дистрибьюторы */\nconst canBase=()=>!!(S.auth&&S.hub.me&&(isOwner()||isAgent()||S.hub.me.sells.length));\nconst canList=()=>S.hub.shops.length>1||!!(S.hub.me&&(S.hub.me.owner||S.hub.me.sells.length>1));\nconst backHTML=()=>canList()?'<button type=\"button\" class=\"btn ghost sm backlink\" data-act=\"shops\">← '+L('Все дистрибьюторы','Barcha distribyutorlar')+'</button>':'';\nconst offTxt=()=>L('Этот дистрибьютор сейчас не принимает заказы.','Bu distribyutor hozir buyurtma qabul qilmayapti.');\nconst offHTML=()=>S.off?'<div class=\"bannerbad\" role=\"alert\" style=\"margin-bottom:12px\">'+esc(offTxt())+'</div>':'';\nconst sellLink=()=>{const m=S.hub.me&&S.hub.me.sells.find(x=>x.id===S.did);return m&&m.link||''};\nconst shopNameOf=did=>{const s=S.hub.shops.find(x=>x.id===did);return s?s.name:''};\n/* Вопрос «да/нет»: окно Telegram, а вне Telegram обычное окно браузера. */\nfunction askConfirm(msg,cb){\n  try{if(S.tg&&S.tg.showConfirm&&S.tg.isVersionAtLeast&&S.tg.isVersionAtLeast('6.2')){S.tg.showConfirm(msg,ok=>{if(ok)cb()});return}}catch(e){}\n  if(window.confirm(msg))cb();\n}\n/* Всё, что относится к одному дистрибьютору, сбрасывается при переходе к другому. */\nfunction resetShopState(){\n  Object.assign(S,{\n    cfg:clone(DEFAULT),prod:{cats:[],items:[]},cart:{},otherCart:null,shopCat:'all',shopStep:'list',shopPlaced:null,q:'',\n    admin:false,off:false,profile:null,blocked:false,fav:[],allOrders:[],stats:{doneSum:0,doneCount:0},\n    sellerTab:'orders',pfilter:'all',medit:{},upl:{},dirtyC:false,dirtyP:false,dirty:false,saving:false,again:false,saveState:'',cd:null,cc:null,\n    stk:{},stkLoaded:false,sfilter:'all',sbusy:{},sc:null,jr:[],jrOpen:false,\n    pm:false,xbusy:'',pick:null,pickBusy:false,imp:null,impBusy:false,regOnly:null,\n    rep:{days:30,data:null,busy:false,err:false,sel:-1,hov:-1,allP:false,tab:false,seq:0,drag:false,skip:0}\n  });\n  S.form.region='';\n}\n/* способ получения: доставка доступна, только если продавец её включил */\nconst mode=()=>S.cfg.shop.delivery!==false&&S.form.mode==='delivery'?'delivery':'pickup';\nconst pickup=()=>pickupInfo(S.cfg,shopNow(),leadFor(S.cfg,mode()));\nfunction normalizeMode(){if(S.cfg.shop.delivery===false)S.form.mode='pickup'}\n/* Регион магазина запоминается на телефоне и на площадке (чтобы на другом телефоне список был тем же). */\nfunction loadRegion(){if(!regionsOn())return;try{S.region=cleanRegion(localStorage.getItem('sh-region'))}catch(e){}}\nfunction saveRegionLocal(){try{if(S.region)localStorage.setItem('sh-region',S.region);else localStorage.removeItem('sh-region')}catch(e){}}\nfunction setRegion(id){\n  id=cleanRegion(id);\n  if(id===S.region)return;\n  S.region=id;S.form.region='';saveRegionLocal();\n  if(S.auth)api('PUT','/api/hub/region',{region:id});\n  if(S.view==='shops')renderShops();\n}\n/* Доставка у открытого дистрибьютора ограничена регионами: список, регион для заказа, подсказки */\nconst zoneOn=()=>hasZone(S.cfg.shop.regions)&&S.cfg.shop.delivery!==false;\nconst zone=()=>cleanRegions(S.cfg.shop.regions);\nconst orderRegion=()=>{const c=cleanRegion(S.form.region);return zoneOn()?(zone().includes(c)?c:''):(c||S.region)};\n/* в форму заказа подставляем регион магазина, если дистрибьютор в него доставляет */\nfunction normalizeRegion(){\n  if(!zoneOn()){return}\n  if(!zone().includes(S.form.region))S.form.region=zone().includes(S.region)?S.region:'';\n}\n/* Территория магазина (район или город внутри области): спрашиваем один раз, пока её нет в общей базе. */\nconst terrKnown=()=>{const c=S.hub.me&&S.hub.me.card;return !!(c&&c.terr&&S.hub.terrs.some(t=>t.id===c.terr))};\nconst terrOn=()=>S.hub.terrs.length>0&&!terrKnown();\nconst terrCur=()=>{const v=S.form.terr;return v==='-'||S.hub.terrs.some(t=>t.id===v)?v:''};\nfunction terrFieldHTML(){\n  const cur=terrCur();\n  return '<div class=\"full\"><label class=\"lab\" for=\"f-terr\">'+L('Ваш район или город','Rayon yoki shahringiz')+'</label><select id=\"f-terr\" data-f=\"terr\"><option value=\"\">'+L('Выберите район или город','Rayon yoki shaharni tanlang')+'</option>'\n    +S.hub.terrs.map(t=>'<option value=\"'+esc(t.id)+'\"'+(t.id===cur?' selected':'')+'>'+esc(t.name)+'</option>').join('')\n    +'<option value=\"-\"'+(cur==='-'?' selected':'')+'>'+L('Другой район','Boshqa hudud')+'</option></select><div class=\"err\" id=\"e-terr\"></div></div>';\n}\nfunction regionFieldHTML(){\n  const z=zone(),cur=orderRegion(),off=S.region&&!z.includes(S.region);\n  return '<div class=\"full\"><label class=\"lab\" for=\"f-region\">'+L('Регион доставки','Yetkazib berish hududi')+'</label><select id=\"f-region\" data-f=\"region\"><option value=\"\">'+L('Выберите регион','Hududni tanlang')+'</option>'\n    +z.map(id=>'<option value=\"'+id+'\"'+(id===cur?' selected':'')+'>'+esc(regionName(id))+'</option>').join('')+'</select><div class=\"err\" id=\"e-region\"></div>'\n    +(off?'<div class=\"note warnnote\" role=\"status\" style=\"margin-top:8px\">'+esc(L('Этот дистрибьютор не доставляет в ваш регион ('+regionName(S.region)+'). Выберите самовывоз или регион из списка.','Bu distribyutor sizning hududingizga ('+regionName(S.region)+') yetkazib bermaydi. Olib ketishni yoki roʻyxatdagi hududni tanlang.'))+'</div>':'')+'</div>';\n}\n/* в каталоге: куда доставляет этот дистрибьютор, и предупреждение, если не в регион магазина */\nfunction regionNoteHTML(){\n  if(!zoneOn())return '';\n  const z=zone(),names=z.slice(0,3).map(regionName).join(', ')+(z.length>3?L(' и ещё '+(z.length-3),' va yana '+(z.length-3)):'');\n  const off=S.region&&!z.includes(S.region);\n  return '<div class=\"note'+(off?' warnnote':'')+'\" role=\"status\" style=\"margin-bottom:12px\">'+esc(off\n    ?L('Доставка в ваш регион ('+regionName(S.region)+') не работает, но можно заказать с самовывозом. Доставляют: '+names+'.','Sizning hududingizga ('+regionName(S.region)+') yetkazib berilmaydi, lekin olib ketish mumkin. Yetkazib berish: '+names+'.')\n    :L('Доставка: '+names+'. В остальные регионы — самовывоз.','Yetkazib berish: '+names+'. Boshqa hududlar uchun — olib ketish.'))+'</div>';\n}\n\n/* ---------- каталог: данные и корзина ---------- */\nconst normProd=d=>{const o={cats:[],items:[]};if(d&&typeof d==='object'){if(Array.isArray(d.cats))o.cats=d.cats.filter(x=>x&&typeof x==='object');if(Array.isArray(d.items))o.items=d.items.filter(x=>x&&typeof x==='object')}return o};\n/* фото товара: до трёх; версии лежат в pv (главное, видно в каталоге), pv2, pv3; подряд, без пропусков */\nconst PH_MAX=3;\nconst phVers=p=>{const v=[p.pv,p.pv2,p.pv3].map(x=>typeof x==='string'?x:'');const n=v.findIndex(x=>!x);return n<0?v:v.slice(0,n)};\nconst imgUrl=(p,n,did)=>'/img/'+encodeURIComponent(did||S.did||'main')+'/'+encodeURIComponent(p.id)+'?v='+encodeURIComponent((n>1?p['pv'+n]:p.pv)||'')+(n>1?'&n='+n:'');\nconst pimg=p=>p.pv?'<img src=\"'+imgUrl(p)+'\" alt=\"'+esc(nm(p))+'\" loading=\"lazy\" decoding=\"async\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>';\n/* Корзина одна на всё приложение и принадлежит одному дистрибьютору: {did, name, items}. Прежний формат (просто {товар: штуки}) — это первый дистрибьютор. */\nfunction loadCart(){\n  S.cart={};S.otherCart=null;\n  try{\n    const c=JSON.parse(localStorage.getItem('sh-cart')||'{}');\n    if(!c||typeof c!=='object'||Array.isArray(c))return;\n    const nw=typeof c.did==='string'&&c.items&&typeof c.items==='object'&&!Array.isArray(c.items);\n    const did=nw?c.did:'main',items=nw?c.items:c;\n    if(!Object.keys(items).length)return;\n    if(did===S.did)S.cart=items;\n    else S.otherCart={did,name:nw&&typeof c.name==='string'?c.name:'',items};\n  }catch(e){}\n}\nfunction saveCart(){\n  if(S.otherCart)return;   // пока открыт другой дистрибьютор, его корзину не трогаем\n  try{\n    if(Object.keys(S.cart).length)localStorage.setItem('sh-cart',JSON.stringify({did:S.did,name:S.cfg.shop.name||'',items:S.cart}));\n    else localStorage.removeItem('sh-cart');\n  }catch(e){}\n}\nconst otherCartName=()=>S.otherCart?(S.otherCart.name||shopNameOf(S.otherCart.did)):'';\nconst otherCartCount=()=>S.otherCart?Object.keys(S.otherCart.items).length:0;\n/* Товар добавляют у одного дистрибьютора, а в корзине уже товары другого: спрашиваем, очистить ли её. */\nfunction askOtherCart(cb){\n  if(!S.otherCart){cb();return}\n  const n=otherCartName(),q=n?' («'+n+'»)':'';\n  askConfirm(L('В корзине товары другого дистрибьютора'+q+'. Очистить корзину и добавить этот товар?','Savatda boshqa distribyutor'+q+' mahsulotlari bor. Savatni tozalab, bu mahsulotni qoʻshamizmi?'),()=>{\n    S.otherCart=null;\n    try{localStorage.removeItem('sh-cart')}catch(e){}\n    cb();\n  });\n}\n/* имя, телефон, способ и адрес запоминаем на телефоне, чтобы повторный заказ был быстрее */\nfunction loadForm(){\n  try{\n    const f=JSON.parse(localStorage.getItem('sh-form')||'{}');\n    if(f&&typeof f==='object'){\n      ['name','phone','address'].forEach(k=>{if(typeof f[k]==='string')S.form[k]=f[k].slice(0,200)});\n      if(f.mode==='delivery')S.form.mode='delivery';\n      if(typeof f.terr==='string')S.form.terr=f.terr.slice(0,12);\n    }\n  }catch(e){}\n}\nfunction saveForm(){try{localStorage.setItem('sh-form',JSON.stringify({name:S.form.name,phone:S.form.phone,address:S.form.address,mode:S.form.mode,terr:S.form.terr}))}catch(e){}}\n/* профиль на сервере главнее того, что запомнил телефон: имя и телефон берём из него; адрес подставляем, если поле пустое */\nfunction applyProfile(){\n  const p=S.profile,c=S.hub.me&&S.hub.me.card;\n  if(!p&&!c)return;\n  if(p){\n    if(p.name)S.form.name=p.name;\n    if(p.phone)S.form.phone=p.phone;\n    if(!S.form.address&&p.addrs&&p.addrs.length)S.form.address=p.addrs[0];\n  }\n  /* Данные из общей базы магазинов: пустые поля заполняются сами (на любом телефоне и у любого дистрибьютора), поэтому повторно вводить их не нужно.\n     Если агент исправил название или телефон (ver вырос), исправление применяется один раз. */\n  if(c){\n    let seen=0;try{seen=Number(localStorage.getItem('sh-cardv'))||0}catch(e){}\n    const fix=c.ver>seen;\n    if(c.name&&(fix||!S.form.name))S.form.name=c.name;\n    if(c.phone&&(fix||!S.form.phone))S.form.phone=c.phone;\n    if(c.addr&&!S.form.address)S.form.address=c.addr;\n    if(c.terr)S.form.terr=c.terr;\n    if(fix)try{localStorage.setItem('sh-cardv',String(c.ver))}catch(e){}\n  }\n  saveForm();\n}\nconst blockedTxt=()=>L('Оформление заказов для вас сейчас недоступно. Свяжитесь с продавцом','Hozir siz uchun buyurtma berish mavjud emas. Sotuvchi bilan bogʻlaning')+(S.cfg.shop.phone?': '+S.cfg.shop.phone:'.');\n/* Товар нельзя заказать: продавец снял галочку «В наличии» или свободный остаток равен нулю. Поле av приходит с сервера у товаров с учётом (сколько можно заказать, не больше 500), lw — товара мало. */\n/* Проверка товаров: без метки ms товар одобрен; wait — ждёт проверки (клиент видит серым, без цены); draft и ret видит только продавец. */\nconst apr=p=>!p.ms;\nconst isPend=p=>p.ms==='wait';\nconst soldOut=p=>p.on===false||p.av===0||!!p.ms;\n/* Сколько штук можно положить в корзину: до 500, а у товаров с учётом — не больше свободного остатка. */\nconst maxQty=p=>typeof p.av==='number'?Math.min(MAX_QTY,p.av):MAX_QTY;\nconst capOf=id=>{const p=S.prod.items.find(x=>x.id===id);return p?maxQty(p):MAX_QTY};\n/* Убирает из корзины то, чего больше нет в каталоге или что закончилось, и уменьшает количество до остатка. Возвращает, сколько позиций изменено. */\nfunction pruneCart(){\n  let n=0;\n  Object.keys(S.cart).forEach(id=>{\n    const p=S.prod.items.find(x=>x.id===id),q=Number(S.cart[id]);\n    if(!p||soldOut(p)||!(q>=1)){delete S.cart[id];n++}\n    else{const m=Math.min(maxQty(p),Math.floor(q));if(m!==q)n++;S.cart[id]=m}\n  });\n  if(n)saveCart();\n  return n;\n}\nconst cartLines=()=>S.prod.items.filter(p=>S.cart[p.id]>0).map(p=>({p,qty:S.cart[p.id]}));\nconst cartCount=()=>cartLines().reduce((s,l)=>s+l.qty,0);\n/* цена за штуку зависит от количества (ступени), скидка от суммы, доставка: всё считается так же, как на сервере (общие функции unitPrice, orderDiscount, deliveryFee) */\nconst cartTotal=()=>cartLines().reduce((s,l)=>s+l.qty*unitPrice(l.p,l.qty),0);\nconst cartDisc=()=>orderDiscount(S.cfg,cartTotal());\nconst cartFee=()=>deliveryFee(S.cfg,mode(),cartTotal());\nconst cartPay=()=>cartTotal()-cartDisc().amount+cartFee();\nconst minOrder=()=>Number(S.cfg.shop.minOrder)||0;\n/* Ставит количество в корзине (не больше остатка и 500). Возвращает, сколько в итоге стоит в корзине. */\nfunction cartSet(id,q){\n  const p=S.prod.items.find(x=>x.id===id),cap=p?maxQty(p):MAX_QTY;\n  q=Math.max(0,Math.floor(q)||0);\n  if(q>cap){\n    q=cap;\n    if(p&&typeof p.av==='number'&&p.av<MAX_QTY)toast(p.av>0?L('Осталось только '+p.av,'Faqat '+p.av+' ta qoldi'):L('Товар закончился','Mahsulot tugadi'));\n  }\n  if(q)S.cart[id]=q;else delete S.cart[id];\n  saveCart();\n  return q;\n}\nconst lowTxt=n=>L('Мало (осталось '+n+')','Oz qoldi ('+n+' ta)');\nconst shopAddress=()=>L(S.cfg.shop.address,S.cfg.shop.addressUz||S.cfg.shop.address);\nfunction activeMine(){return S.myOrders.filter(o=>o.status!=='done'&&o.status!=='cancelled').length}\nfunction newCount(){return S.allOrders.filter(o=>o.status==='new').length}\n\n/* language */\nfunction initLang(){\n  let l='';\n  try{l=localStorage.getItem('sh-lang')||''}catch(e){}\n  if(l!=='ru'&&l!=='uz'){\n    let tl='';\n    try{tl=String(S.tg&&S.tg.initDataUnsafe&&S.tg.initDataUnsafe.user&&S.tg.initDataUnsafe.user.language_code||'')}catch(e){}\n    l=(tl||navigator.language||'').toLowerCase().indexOf('uz')===0?'uz':'ru';\n  }\n  setLang(l);\n  document.documentElement.setAttribute('lang',LANG);\n}\nfunction switchLang(){\n  const next=LANG==='ru'?'uz':'ru';\n  setLang(next);\n  try{localStorage.setItem('sh-lang',next)}catch(e){}\n  document.documentElement.setAttribute('lang',next);\n  render();\n}\n\n/* меню: разделы по группам; у «Продавца» внутри раскрываются его пять разделов */\nconst sellerSubs=()=>{\n  const w=stockWarn(),rn=modRetN();\n  return [['orders',L('Заказы','Buyurtmalar')],['prod',L('Каталог','Katalog'),rn,'warn'],['stock',L('Остатки','Qoldiq'),w,'warn'],['reports',L('Отчёты','Hisobotlar')],['settings',L('Настройки','Sozlamalar')]];\n};\nfunction menuGroups(){\n  const g=[];\n  const shop=[['shop',L('Каталог','Katalog'),cartCount()],['mine',L('Заказы','Buyurtmalar'),activeMine()]];\n  if(S.auth&&S.did)shop.push(['profile',L('Профиль','Profil')]);\n  g.push([L('Магазин','Doʻkon'),shop]);\n  const work=[];\n  if(S.admin&&S.did)work.push(['seller',L('Продавец','Sotuvchi'),newCount(),'',sellerSubs()]);\n  if(canBase())work.push(['base',L('База','Baza')]);\n  if(work.length)g.push([L('Работа','Ish'),work]);\n  if(isOwner())g.push([L('Владелец','Egasi'),[['owner',L('Дистрибьюторы','Distribyutorlar')],['analytics',L('Аналитика','Tahlil')],['review',L('Проверка','Tekshiruv'),modN(),'bad']]]);\n  return g;\n}\nconst badgeHTML=(n,c)=>n?' <span class=\"badge'+(c?' '+c:'')+'\">'+n+'</span>':'';\nconst menuWide=()=>!!(window.matchMedia&&matchMedia('(min-width:1000px)').matches);\nconst menuIsOpen=()=>document.documentElement.classList.contains('mn-open');\nconst menuSubOpen=cur=>S.msub===null?cur==='seller':S.msub==='seller';\nfunction renderNav(){\n  const cur=S.view==='shops'?'shop':S.view,groups=menuGroups(),multi=groups.length>1,nav=$('#nav');\n  let h='';\n  groups.forEach(gr=>{\n    if(multi)h+='<div class=\"mgh\" role=\"presentation\">'+gr[0]+'</div>';\n    gr[1].forEach(i=>{\n      if(i[4]){\n        const open=menuSubOpen(cur);\n        h+='<button type=\"button\" class=\"mi mgrp\" data-act=\"msub\" data-v=\"'+i[0]+'\" aria-expanded=\"'+open+'\" aria-controls=\"msub-'+i[0]+'\"'+(cur===i[0]?' data-here=\"1\"':'')+'><span class=\"ml\">'+i[1]+'</span>'+badgeHTML(i[2],i[3])\n          +'<svg class=\"chev\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"M3.5 6l4.5 4.5L12.5 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></button>'\n          +'<div class=\"msub\" id=\"msub-'+i[0]+'\" role=\"group\" aria-label=\"'+esc(i[1])+'\"'+(open?'':' hidden')+'>'\n          +i[4].map(x=>'<button type=\"button\" class=\"mi\" data-act=\"stab\" data-t=\"'+x[0]+'\"'+(cur==='seller'&&S.sellerTab===x[0]?' aria-current=\"page\"':'')+'><span class=\"ml\">'+x[1]+'</span>'+badgeHTML(x[2],x[3])+'</button>').join('')+'</div>';\n      }else h+='<button type=\"button\" class=\"mi\" data-act=\"nav\" data-v=\"'+i[0]+'\"'+(cur===i[0]?' aria-current=\"page\"':'')+'><span class=\"ml\">'+i[1]+'</span>'+badgeHTML(i[2],i[3])+'</button>';\n    });\n  });\n  // перерисовка не должна сбивать прокрутку и фокус открытого меню\n  const ae=document.activeElement,fk=ae&&nav.contains(ae)?[ae.dataset.act,ae.dataset.v||ae.dataset.t||'']:null,st=nav.scrollTop;\n  nav.setAttribute('aria-label',L('Разделы','Boʻlimlar'));\n  nav.innerHTML=h;\n  nav.scrollTop=st;\n  if(fk){const f=[...nav.querySelectorAll('[data-act]')].find(x=>x.dataset.act===fk[0]&&(x.dataset.v||x.dataset.t||'')===fk[1]&&!x.closest('[hidden]'));if(f)f.focus({preventScroll:true})}\n  // значок на кнопке ☰: что ждёт решения (новые заказы, товары на проверке или возвращённые)\n  const al=(S.admin&&S.did?newCount()+modRetN():0)+(isOwner()?modN():0),mb=$('#menubadge');\n  mb.hidden=!al;mb.textContent=al>99?'99+':String(al);\n  const mbt=$('#menubtn');\n  mbt.setAttribute('aria-label',L('Меню','Menyu')+(al?': '+al:''));\n  $('#mclose').setAttribute('aria-label',L('Закрыть меню','Menyuni yopish'));\n  // внутри дистрибьютора в шапке его название, на общих экранах название площадки\n  const inShop=S.did&&(S.view==='shop'||S.view==='seller'||S.view==='profile');\n  const name=inShop?(S.cfg.shop.name||DEFAULT.shop.name):hubTitle();\n  $('#brandName').textContent=name;\n  $('#mbrand').textContent=name;\n  document.title=name;\n  $('#langlab').textContent=L('Язык','Til');\n  const lb=$('#langbtn');\n  lb.textContent=LANG==='ru'?'UZ':'RU';\n  lb.setAttribute('aria-label',L('Oʻzbek tiliga oʻtish','Переключить на русский'));\n  lb.title=L('Oʻzbekcha','Русский');\n  menuSync();\n}\n/* на широком экране меню стоит слева всегда и окном не бывает */\nfunction menuSync(){\n  const m=$('#menu'),wide=menuWide();\n  if(wide&&menuIsOpen())menuSet(false);\n  if(wide){m.removeAttribute('role');m.removeAttribute('aria-modal');m.setAttribute('aria-label',L('Разделы','Boʻlimlar'))}\n  else{m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',L('Меню','Menyu'))}\n}\nlet menuBack=null;\nfunction menuSet(on){\n  if(on&&menuWide())return;\n  const root=document.documentElement;\n  if(on===menuIsOpen())return;\n  root.classList.toggle('mn-open',on);\n  $('#mscrim').hidden=!on;\n  $('#menubtn').setAttribute('aria-expanded',String(on));\n  if(on){\n    menuBack=document.activeElement;\n    const f=$('#nav [aria-current=\"page\"]')||$('#nav .mi');\n    if(f){f.focus({preventScroll:true});try{f.scrollIntoView({block:'nearest'})}catch(e){}}\n  }else{\n    const inside=document.activeElement&&$('#menu').contains(document.activeElement);\n    if(inside||!document.activeElement||document.activeElement===document.body){const b=menuBack&&document.contains(menuBack)&&!$('#menu').contains(menuBack)?menuBack:$('#menubtn');try{b.focus({preventScroll:true})}catch(e){}}\n    menuBack=null;\n  }\n}\ndocument.addEventListener('keydown',e=>{\n  if(!menuIsOpen())return;\n  if(e.key==='Escape'){e.preventDefault();menuSet(false);return}\n  if(e.key!=='Tab')return;\n  const list=[...$('#menu').querySelectorAll('button')].filter(x=>!x.closest('[hidden]')&&!x.disabled&&x.offsetParent!==null);\n  if(!list.length)return;\n  const first=list[0],last=list[list.length-1];\n  if(!$('#menu').contains(document.activeElement)){e.preventDefault();first.focus();return}\n  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}\n  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}\n});\nwindow.addEventListener('resize',()=>{if(menuWide())menuSync()});\n\n/* ---------- каталог (клиент) ---------- */\nconst shopCats=()=>S.prod.cats.filter(c=>S.prod.items.some(p=>p.cat===c.id&&apr(p)));\nconst pendList=()=>S.prod.items.filter(isPend);\nfunction qtyHTML(id,q,small){\n  const i=esc(id),pre=small?'c':'p',cap=capOf(id);\n  return '<div class=\"stepper'+(small?' sm':'')+'\"><button type=\"button\" data-act=\"'+pre+'minus\" data-id=\"'+i+'\" aria-label=\"'+esc(L('Меньше','Kamroq'))+'\">−</button>'\n    +'<input class=\"qty\" type=\"number\" inputmode=\"numeric\" min=\"0\" max=\"'+cap+'\" value=\"'+q+'\" data-qty=\"'+i+'\" aria-label=\"'+esc(L('Количество','Miqdori'))+'\">'\n    +'<button type=\"button\" data-act=\"'+pre+'plus\" data-id=\"'+i+'\" aria-label=\"'+esc(L('Больше','Koʻproq'))+'\"'+(q>=cap?' disabled':'')+'>+</button></div>';\n}\n/* кнопки «+ блок», «+ коробка»: добавляют сразу целую упаковку (цена за штуку, количество в штуках) */\nfunction packChips(p,pre){\n  const out=['blk','box'].filter(k=>packSize(p,k)).map(k=>{\n    const n=packSize(p,k),lab=L('Добавить: '+packWord(k)+' ('+n+' шт)','Qoʻshish: '+packWord(k)+' ('+n+' dona)');\n    return '<button type=\"button\" class=\"chip\" data-act=\"'+pre+'pack\" data-id=\"'+esc(p.id)+'\" data-k=\"'+k+'\" aria-label=\"'+esc(lab)+'\">+ '+esc(packWord(k))+' · '+n+'</button>';\n  }).join('');\n  return out?'<div class=\"ppack\">'+out+'</div>':'';\n}\nfunction productCtl(p){\n  if(soldOut(p))return '<button type=\"button\" class=\"btn ghost sm padd\" disabled>'+L('Нет в наличии','Mavjud emas')+'</button>';\n  const q=S.cart[p.id]||0;\n  if(!q)return '<button type=\"button\" class=\"btn sm padd\" data-act=\"padd\" data-id=\"'+esc(p.id)+'\">'+L('В корзину','Savatga')+'</button>'+packChips(p,'p');\n  return qtyHTML(p.id,q,false)+packChips(p,'p');\n}\nconst HEART='<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.4 3.3 4.2 6.7-1.7 4.7-9.2 9.3-9.2 9.3z\"/></svg>';\nconst isFav=id=>S.fav.includes(id);\nconst favBtn=id=>S.auth?'<button type=\"button\" class=\"fav\" data-act=\"fav\" data-id=\"'+esc(id)+'\" aria-pressed=\"'+isFav(id)+'\" aria-label=\"'+esc(L('В избранное','Sevimlilarga'))+'\">'+HEART+'</button>':'';\n/* ступени цены под ценой: «от 10 шт — 7 000 сум»; та, что сейчас действует по корзине, выделена */\nfunction tiersHTML(p,q){\n  const t=tiersOf(p);\n  if(!t.length)return '';\n  let act=-1;t.forEach((x,i)=>{if(q>=x.n)act=i});\n  return t.map((x,i)=>'<span class=\"ptier'+(i===act?' on':'')+'\">'+L('от '+x.n+' шт — ',x.n+' donadan — ')+money(x.price)+'</span>').join('');\n}\nfunction priceHTML(p){\n  const q=S.cart[p.id]||0,eff=unitPrice(p,q||1),tier=eff<Number(p.price);\n  const o=tier?Number(p.price):oldPrice(p),pc=o?Math.max(1,Math.min(99,Math.round((o-eff)/o*100))):0;\n  return (o?'<span class=\"pold\">'+money(o)+'</span>':'')+money(eff)+(pc?'<span class=\"psale\">−'+pc+'%</span>':'')+tiersHTML(p,q);\n}\n/* Товар на проверке: серая карточка, без цены и без корзины */\nfunction pendCard(p){\n  const w=weightLabel(p),np=phVers(p).length;\n  return '<article class=\"pcard pend\" id=\"pc-'+esc(p.id)+'\"><div class=\"pimg'+(np?' zm':'')+'\"'+(np?' data-act=\"pzoom\" data-id=\"'+esc(p.id)+'\"':'')+'>'+pimg(p)+'<span class=\"tag mod\">'+L('На модерации','Tekshiruvda')+'</span></div>'\n    +'<div class=\"pbody\"><div class=\"pname\">'+esc(nm(p))+'</div>'+(w?'<div class=\"pw\">'+esc(w)+'</div>':'')\n    +'<div class=\"pwait\">'+L('Цена после проверки','Narx tekshiruvdan keyin')+'</div></div></article>';\n}\nfunction productCard(p){\n  if(isPend(p))return pendCard(p);\n  const off=soldOut(p),d=prodDesc(p),w=weightLabel(p);\n  const status=off?'':(p.lw&&typeof p.av==='number'?'<div class=\"pst low\">'+esc(lowTxt(p.av))+'</div>':'<div class=\"pst\">'+L('В наличии','Mavjud')+'</div>');\n  const np=phVers(p).length;\n  return '<article class=\"pcard'+(off?' off':'')+'\" id=\"pc-'+esc(p.id)+'\"><div class=\"pimg'+(np?' zm':'')+'\"'+(np?' data-act=\"pzoom\" data-id=\"'+esc(p.id)+'\"':'')+'>'+pimg(p)+(np>1?'<span class=\"pcnt\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"6\" width=\"14\" height=\"14\" rx=\"2\"/><path d=\"M7 3h12a2 2 0 0 1 2 2v12\"/></svg>'+np+' '+L('фото','rasm')+'</span>':'')+(off?'<span class=\"tag\">'+L('Нет в наличии','Mavjud emas')+'</span>':(p.tag?'<span class=\"lbl '+esc(p.tag)+'\">'+esc(tagName(p.tag))+'</span>':''))+favBtn(p.id)+'</div>'\n    +'<div class=\"pbody\"><div class=\"pname\">'+esc(nm(p))+'</div>'+(w?'<div class=\"pw\">'+esc(w)+'</div>':'')+status\n    +(d?'<div class=\"pdesc\" data-act=\"pdesc\">'+esc(d)+'</div>':'')\n    +'<div class=\"pprice\">'+priceHTML(p)+'</div><div class=\"pctl\">'+productCtl(p)+'</div></div></article>';\n}\n/* Поиск по названию, описанию и весу на обоих языках: каждое слово запроса должно встретиться. */\nconst normQ=s=>String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[ʻʼ’‘`']/g,'');\nfunction matchQ(p,q){\n  const words=normQ(q).split(/\\s+/).filter(Boolean);\n  if(!words.length)return true;\n  const hay=normQ([p.name,p.uz,p.desc,p.descUz,weightLabel(p)].join(' '));\n  return words.every(w=>hay.indexOf(w)>=0);\n}\n/* особые разделы рядом с категориями: избранное, акции, новинки */\nfunction shopSpecials(){\n  const out=[];\n  if(S.auth&&S.fav.some(id=>S.prod.items.some(p=>p.id===id&&apr(p))))out.push(['fav','★ '+L('Избранное','Sevimlilar')]);\n  if(S.prod.items.some(p=>p.tag==='sale'&&apr(p)))out.push(['sale',tagName('sale')]);\n  if(S.prod.items.some(p=>p.tag==='new'&&apr(p)))out.push(['new',tagName('new')]);\n  return out;\n}\nconst inShopFilter=p=>S.shopCat==='mod'?isPend(p):!apr(p)?false:S.shopCat==='all'?true:S.shopCat==='fav'?isFav(p.id):S.shopCat==='sale'?p.tag==='sale':S.shopCat==='new'?p.tag==='new':p.cat===S.shopCat;\n/* Сетка товаров: по выбранной категории и поиску. В режиме «Все» без поиска товары идут разделами по категориям. */\nfunction paintGrid(){\n  const g=$('#pgrid');if(!g)return;\n  const q=S.q.trim();\n  const items=S.prod.items.filter(p=>inShopFilter(p)&&matchQ(p,q));\n  if(!items.length){\n    g.innerHTML=S.shopCat==='mod'&&!q?'<div class=\"empty\"><b>'+L('Нет товаров на проверке','Tekshiruvda mahsulot yoʻq')+'</b></div>':S.shopCat==='fav'&&!q?'<div class=\"empty\"><b>'+L('В избранном пока пусто','Sevimlilar hozircha boʻsh')+'</b>'+L('Нажмите на сердечко у товара, и он появится здесь.','Mahsulotdagi yurakchani bosing, u shu yerda paydo boʻladi.')+'</div>'\n      :'<div class=\"empty\"><b>'+L('Ничего не найдено','Hech narsa topilmadi')+'</b>'+L('Измените запрос или выберите другую категорию.','Soʻrovni oʻzgartiring yoki boshqa kategoriyani tanlang.')+'</div>';\n    return;\n  }\n  const cats=shopCats();\n  if(S.shopCat==='all'&&!q&&cats.length>=1){\n    const rest=items.filter(p=>!cats.some(c=>c.id===p.cat));\n    g.innerHTML=cats.map(c=>{const li=items.filter(p=>p.cat===c.id);return li.length?'<h2 class=\"chead\">'+esc(nm(c))+'</h2><div class=\"pgrid\">'+li.map(productCard).join('')+'</div>':''}).join('')\n      +(rest.length?'<div class=\"pgrid\" style=\"margin-top:20px\">'+rest.map(productCard).join('')+'</div>':'');\n  }else g.innerHTML=(S.shopCat==='mod'?'<div class=\"note modnote\">'+L('Эти товары проверяет площадка. После проверки появятся цена и кнопка «В корзину».','Bu mahsulotlarni platforma tekshirmoqda. Tekshiruvdan keyin narx va «Savatga» tugmasi paydo boʻladi.')+'</div>':'')+'<div class=\"pgrid\">'+items.map(productCard).join('')+'</div>';\n}\nfunction paintShopBar(){\n  const bar=$('#bar');if(!bar)return;\n  const n=cartCount();\n  if(!n){bar.style.display='none';bar.innerHTML='';return}\n  bar.style.display='';\n  if(S.shopStep==='cart')bar.innerHTML='<div class=\"wrap\"><div><small>'+L('Итого, оплата при получении','Jami, olganda toʻlanadi')+'</small><strong id=\"ctotal\">'+money(cartPay())+'</strong></div><button type=\"button\" class=\"btn\" data-act=\"submitorder\">'+L('Заказать','Buyurtma berish')+'</button></div>';\n  else bar.innerHTML='<div class=\"wrap\"><div><small>'+L('Корзина','Savat')+': '+n+' '+L('шт.','dona')+'</small><strong>'+money(cartTotal()-cartDisc().amount)+'</strong></div><button type=\"button\" class=\"btn\" data-act=\"opencart\">'+L('Оформить заказ','Buyurtma berish')+'</button></div>';\n}\nfunction renderShop(){\n  if(S.shopPlaced)return renderShopPlaced();\n  const pend=pendList().length,aprN=S.prod.items.filter(apr).length;\n  if(!aprN&&!pend){\n    view.innerHTML='<div class=\"wrap page\">'+backHTML()+offHTML()+'<div class=\"empty\"><b>'+L('Каталог пока пуст','Katalog hozircha boʻsh')+'</b>'+L('Загляните позже.','Keyinroq qaytib keling.')+'</div></div>';\n    return;\n  }\n  if(S.shopStep==='cart'&&cartCount()>0)return renderCart();\n  S.shopStep='list';\n  const cats=shopCats();\n  const specials=shopSpecials();\n  if(S.shopCat==='mod'&&!pend)S.shopCat='all';\n  if(S.shopCat!=='all'&&S.shopCat!=='mod'&&!cats.some(c=>c.id===S.shopCat)&&!specials.some(x=>x[0]===S.shopCat))S.shopCat='all';\n  if(!aprN&&pend)S.shopCat='mod';   // одобренных ещё нет: открываем раздел «На модерации»\n  const modChip=pend?[['mod',L('На модерации','Tekshiruvda')+'<span class=\"cnt\">'+pend+'</span>']]:[];\n  const chips=cats.length>1||specials.length||pend?'<div class=\"pchips\" role=\"group\" aria-label=\"'+esc(L('Категории','Kategoriyalar'))+'\">'\n    +(aprN?[['all',L('Все','Barchasi')]].concat(specials,cats.length>1?cats.map(c=>[c.id,nm(c)]):[]):[]).concat(modChip).map(c=>'<button type=\"button\" class=\"chip'+(c[0]==='mod'?' mod':'')+'\" data-act=\"scat\" data-id=\"'+esc(c[0])+'\" aria-pressed=\"'+(S.shopCat===c[0])+'\">'+(c[0]==='mod'?c[1]:esc(c[1]))+'</button>').join('')+'</div>':'';\n  const search=aprN+pend>8?'<div class=\"search\"><input type=\"search\" id=\"q\" value=\"'+esc(S.q)+'\" placeholder=\"'+esc(L('Поиск по названию и описанию','Nomi va tavsifi boʻyicha qidirish'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Поиск по названию и описанию','Nomi va tavsifi boʻyicha qidirish'))+'\"></div>':'';\n  view.innerHTML='<div class=\"wrap shop\">'+backHTML()+offHTML()+regionNoteHTML()+'<div class=\"eyebrow\">'+L('Каталог','Katalog')+'</div><h1>'+esc(S.cfg.shop.name||DEFAULT.shop.name)+'</h1>'+search+chips+'<div id=\"pgrid\"></div></div><div class=\"bar\" id=\"bar\"></div>';\n  paintGrid();paintShopBar();\n}\nfunction toggleFav(id){\n  if(!S.auth)return;\n  S.fav=isFav(id)?S.fav.filter(x=>x!==id):S.fav.concat([id]).slice(-100);\n  S.favSeq++;\n  document.querySelectorAll('.fav[data-id=\"'+CSS.escape(id)+'\"]').forEach(b=>b.setAttribute('aria-pressed',String(isFav(id))));\n  if(S.view==='shop'&&!S.shopPlaced&&S.shopStep==='list'){\n    const sp=shopSpecials();\n    if(S.shopCat==='fav'&&!sp.some(x=>x[0]==='fav')){S.shopCat='all';renderShop()}\n    else if(S.shopCat==='fav')paintGrid();\n    else{const had=!!document.querySelector('[data-act=\"scat\"][data-id=\"fav\"]');if(had!==sp.some(x=>x[0]==='fav'))renderShop()}\n  }\n  clearTimeout(S.favT);S.favT=setTimeout(pushFav,600);\n}\nasync function pushFav(){\n  const seq=S.favSeq,r=await api('PUT','/api/fav',{ids:S.fav});\n  if(!r.ok||!r.data){toast(L('Избранное не сохранилось. Проверьте соединение.','Sevimlilar saqlanmadi. Ulanishni tekshiring.'));return}\n  if(S.favSeq===seq&&JSON.stringify(r.data.fav)!==JSON.stringify(S.fav)){S.fav=r.data.fav;if(S.view==='shop')renderShop()}\n}\nfunction paintShopCtl(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.querySelector('#pc-'+CSS.escape(id)+' .pctl'),pe=document.querySelector('#pc-'+CSS.escape(id)+' .pprice');\n  if(p&&el)el.innerHTML=productCtl(p);\n  if(p&&pe)pe.innerHTML=priceHTML(p);\n  paintShopBar();renderNav();\n}\n/* под названием в корзине: вес и цена за штуку (со ступенью), подсказка про следующую ступень, сколько это упаковок */\nfunction cartInfoHTML(p,q){\n  const w=weightLabel(p),eff=unitPrice(p,q),nt=nextTier(p,q),pk=packText(p,q);\n  return '<small>'+(w?esc(w)+' · ':'')+(eff<Number(p.price)?'<span class=\"pold\">'+money(p.price)+'</span>':'')+money(eff)+'</small>'\n    +(nt?'<small class=\"tiernext\">'+esc(L('Ещё '+nt.left+' шт — цена '+money(nt.price)+' за шт','Yana '+nt.left+' dona — narx '+money(nt.price)))+'</small>':'')\n    +(pk?'<small class=\"packtxt\">'+esc(pk)+'</small>':'');\n}\nfunction paintCartLines(){\n  const el=$('#clines');if(!el)return;\n  el.innerHTML=cartLines().map(l=>{\n    const p=l.p;\n    return '<div class=\"cline\" id=\"cl-'+esc(p.id)+'\"><div class=\"cth\">'+pimg(p)+'</div><div class=\"cn\"><b>'+esc(nm(p))+'</b><div id=\"ci-'+esc(p.id)+'\">'+cartInfoHTML(p,l.qty)+'</div>'\n      +(p.lw&&typeof p.av==='number'?'<small class=\"lowtxt\">'+esc(lowTxt(p.av))+'</small>':'')+'</div>'\n      +'<div class=\"cr\">'+qtyHTML(p.id,l.qty,true)+'<div class=\"cs\">'+money(l.qty*unitPrice(p,l.qty))+'</div></div>'+packChips(p,'c')+'</div>';\n  }).join('');\n  paintCartSum();\n}\n/* Блок «Итого» в корзине: товары, доставка (если она платная), итог, подсказки про минимум и бесплатную доставку. */\nfunction paintCartSum(){\n  const el=$('#csum');if(!el)return;\n  const sub=cartTotal(),dc=cartDisc(),fee=cartFee(),sh=S.cfg.shop,del=mode()==='delivery',feeSet=Number(sh.deliveryFee)>0,free=Number(sh.freeDeliveryFrom)||0;\n  const showFee=del&&feeSet;\n  el.innerHTML=(showFee||dc.amount>0?'<div class=\"r\"><span>'+L('Товары','Mahsulotlar')+'</span><span id=\"csubrow\">'+money(sub)+'</span></div>':'')\n    +(dc.amount>0?'<div class=\"r disc\"><span>'+L('Скидка '+dc.pct+'%','Chegirma '+dc.pct+'%')+'</span><span id=\"cdiscrow\">−'+money(dc.amount)+'</span></div>':'')\n    +(showFee?'<div class=\"r\"><span>'+L('Доставка','Yetkazib berish')+'</span><span id=\"cfeerow\">'+(fee>0?money(fee):L('бесплатно','bepul'))+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('Итого','Jami')+'</span><span id=\"ctotalrow\">'+money(cartPay())+'</span></div>';\n  const m=$('#cmin');if(!m)return;\n  const min=minOrder(),notes=[];\n  if(min>0&&sub<min)notes.push('<div class=\"note warnnote\" role=\"status\">'+L('Минимальная сумма заказа: '+money(min)+'. Добавьте товаров ещё на '+money(min-sub)+'.','Buyurtmaning minimal summasi: '+money(min)+'. Yana '+money(min-sub)+' lik mahsulot qoʻshing.')+'</div>');\n  if(showFee&&fee>0&&free>sub)notes.push('<div class=\"note\" role=\"status\">'+L('До бесплатной доставки осталось '+money(free-sub)+'.','Bepul yetkazib berishgacha '+money(free-sub)+' qoldi.')+'</div>');\n  const nd=nextDiscount(S.cfg,sub);\n  if(nd)notes.push('<div class=\"note\" role=\"status\">'+L('Добавьте товаров ещё на '+money(nd.left)+': скидка на заказ будет '+nd.pct+'%.','Yana '+money(nd.left)+' lik mahsulot qoʻshing: buyurtmaga '+nd.pct+'% chegirma boʻladi.')+'</div>');\n  m.innerHTML=notes.length?'<div class=\"stack\" style=\"margin-top:12px\">'+notes.join('')+'</div>':'';\n  paintShopBar();\n}\n/* Меняет суммы на экране, не перерисовывая поле, в которое клиент печатает количество. */\nfunction refreshTotals(id){\n  const p=S.prod.items.find(x=>x.id===id),line=document.querySelector('#cl-'+CSS.escape(id)+' .cs'),info=document.getElementById('ci-'+id);\n  if(p&&line)line.textContent=money((S.cart[id]||0)*unitPrice(p,S.cart[id]||0));\n  if(p&&info)info.innerHTML=cartInfoHTML(p,S.cart[id]||0);\n  const cap=capOf(id);\n  document.querySelectorAll('[data-act=\"pplus\"],[data-act=\"cplus\"]').forEach(b=>{if(b.dataset.id===id)b.disabled=(S.cart[id]||0)>=cap});\n  paintCartSum();paintShopBar();renderNav();\n}\n/* Поля заказа: способ получения, имя, телефон, адрес (для доставки), дата, время, комментарий */\nfunction formHTML(pk){\n  const del=mode()==='delivery',canDel=S.cfg.shop.delivery!==false;\n  return '<div class=\"form\">'\n    +(canDel?'<div class=\"full\"><div class=\"seg\" role=\"group\" aria-label=\"'+esc(L('Способ получения','Olish usuli'))+'\"><button type=\"button\" data-act=\"mode\" data-v=\"pickup\" aria-pressed=\"'+(!del)+'\">'+L('Самовывоз','Olib ketish')+'</button><button type=\"button\" data-act=\"mode\" data-v=\"delivery\" aria-pressed=\"'+del+'\">'+L('Доставка','Yetkazib berish')+'</button></div></div>':'')\n    +(del&&zoneOn()?regionFieldHTML():'')\n    +'<div><label class=\"lab\" for=\"f-name\">'+L('Ваше имя или название компании','Ismingiz yoki kompaniya nomi')+'</label><input type=\"text\" id=\"f-name\" data-f=\"name\" value=\"'+esc(S.form.name)+'\" autocomplete=\"name\"><div class=\"err\" id=\"e-name\"></div></div>'\n    +'<div><label class=\"lab\" for=\"f-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"f-phone\" data-f=\"phone\" value=\"'+esc(S.form.phone)+'\" placeholder=\"+998 90 123 45 67\" autocomplete=\"tel\"><div class=\"err\" id=\"e-phone\"></div></div>'\n    +(terrOn()?terrFieldHTML():'')\n    +(del?'<div class=\"full\"><label class=\"lab\" for=\"f-address\">'+L('Адрес доставки','Yetkazib berish manzili')+'</label><textarea id=\"f-address\" data-f=\"address\" rows=\"2\" maxlength=\"200\" placeholder=\"'+esc(L('Город, улица, дом, ориентир','Shahar, koʻcha, uy, moʻljal'))+'\" autocomplete=\"street-address\">'+esc(S.form.address)+'</textarea><div class=\"err\" id=\"e-address\"></div>'+addrChips()+'</div>':'')\n    +'<div><label class=\"lab\" for=\"f-date\">'+(del?L('Дата доставки','Yetkazib berish sanasi'):L('Дата получения','Olish sanasi'))+'</label><input type=\"date\" id=\"f-date\" data-f=\"date\" min=\"'+pk.min+'\" max=\"'+pk.max+'\" value=\"'+esc(S.form.date)+'\"><div class=\"err\" id=\"e-date\"></div></div>'\n    +'<div><label class=\"lab\" for=\"f-time\">'+L('Время','Vaqt')+'</label><select id=\"f-time\" data-f=\"time\"></select><div class=\"err\" id=\"e-time\"></div></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"f-comment\">'+L('Пожелания к заказу','Buyurtmaga istaklar')+'</label><textarea id=\"f-comment\" data-f=\"comment\" placeholder=\"'+esc(L('Как позвонить, пожелания к упаковке','Qachon qoʻngʻiroq qilish, qadoqlash boʻyicha istaklar'))+'\">'+esc(S.form.comment)+'</textarea></div>'\n    +'<div class=\"full locbox\" id=\"locbox\">'+locBoxHTML()+'</div>'\n    +'</div>';\n}\n/* сохранённые адреса из профиля: нажал и адрес подставился */\nfunction addrChips(){\n  const a=S.profile&&S.profile.addrs;\n  if(!a||!a.length)return '';\n  return '<div class=\"achips\" id=\"achips\" role=\"group\" aria-label=\"'+esc(L('Сохранённые адреса','Saqlangan manzillar'))+'\">'+a.map((x,i)=>'<button type=\"button\" class=\"chip\" data-act=\"addr\" data-i=\"'+i+'\" aria-pressed=\"'+(S.form.address.trim().toLowerCase()===x.toLowerCase())+'\">'+esc(x)+'</button>').join('')+'</div>';\n}\nfunction markAddr(){\n  const cur=S.form.address.trim().toLowerCase();\n  document.querySelectorAll('#achips .chip').forEach(b=>{const x=S.profile&&S.profile.addrs[Number(b.dataset.i)];b.setAttribute('aria-pressed',String(!!x&&x.toLowerCase()===cur))});\n}\nfunction fillTimes(){\n  const sel=$('#f-time');if(!sel)return;\n  const list=S.form.date?pickup().slots(S.form.date):[];\n  if(!list.includes(S.form.time))S.form.time='';\n  sel.innerHTML='<option value=\"\">'+(list.length?L('Выберите время','Vaqtni tanlang'):L('На эту дату нет свободного времени','Bu sanaga boʻsh vaqt yoʻq'))+'</option>'+list.map(t=>'<option value=\"'+t+'\"'+(t===S.form.time?' selected':'')+'>'+t+'</option>').join('');\n}\nfunction cartNote(){\n  const sh=S.cfg.shop,addr=shopAddress(),hrs=esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00;';\n  if(mode()==='delivery')return L('Оплата только при получении товара. Доставка не раньше чем через '+esc(sh.deliveryLeadHours)+' ч после заказа, время доставки '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.',\n    'Toʻlov faqat mahsulotni olganda. Yetkazib berish buyurtmadan kamida '+esc(sh.deliveryLeadHours)+' soat keyin, vaqti '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.');\n  return L('Оплата только при получении'+(addr?' в точке: '+esc(addr):'')+'. Заказ можно забрать не раньше чем через '+esc(sh.leadHours)+' ч после оформления, часы выдачи '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.',\n    'Toʻlov faqat buyurtmani olganda'+(addr?': '+esc(addr):'')+'. Buyurtmani kamida '+esc(sh.leadHours)+' soatdan keyin olish mumkin, topshirish vaqti '+esc(sh.openFrom)+':00–'+esc(sh.openTo)+':00.');\n}\nfunction renderCart(){\n  normalizeMode();normalizeRegion();\n  const pk=pickup();\n  if(!S.form.date||S.form.date<pk.min)S.form.date=pk.min;\n  S.shopStep='cart';\n  view.innerHTML='<div class=\"wrap shop\"><button type=\"button\" class=\"btn ghost sm backlink\" data-act=\"shoplist\">← '+L('К каталогу','Katalogga')+'</button><h1>'+L('Корзина','Savat')+'</h1>'+offHTML()+'<div class=\"stack\">'\n    +'<div class=\"card\" id=\"clines\" style=\"margin-bottom:0\"></div>'\n    +'<div class=\"sum\" id=\"csum\"></div><div id=\"cmin\"></div>'\n    +'<section class=\"sec\" style=\"padding-top:6px\"><h2>'+L('Получение заказа','Buyurtmani olish')+'</h2><div class=\"stack\">'\n    +(S.blocked?'<div class=\"bannerbad\" role=\"alert\">'+esc(blockedTxt())+'</div>':'')\n    +formHTML(pk)\n    +'<div class=\"note\" id=\"cnote\">'+cartNote()+'</div>'\n    +'<button type=\"button\" class=\"btn\" id=\"submit\" data-act=\"submitorder\">'+L('Заказать','Buyurtma berish')+'</button>'\n    +'</div></section></div></div><div class=\"bar\" id=\"bar\"></div>';\n  paintCartLines();fillTimes();paintShopBar();\n}\nconst tgLink=o=>{\n  const h=String(S.cfg.shop.telegram||'').replace(/^@/,'').trim();\n  if(!h)return '';\n  return 'https://t.me/'+encodeURIComponent(h)+'?text='+encodeURIComponent(L('Здравствуйте! Вопрос по заказу ','Assalomu alaykum! Buyurtma boʻyicha savol: ')+o.id);\n};\nfunction itemRow(it){const pk=packText(it,it.qty);return '<span>'+esc(nm(it))+(weightLabel(it)?' ('+esc(weightLabel(it))+')':'')+' × '+it.qty+(pk?' ('+esc(pk)+')':'')+'</span><span>'+money(it.price*it.qty)+'</span>'}\nconst discRow=(o,cls)=>o.disc>0?'<div class=\"'+cls+'\"><span>'+L('Скидка '+o.dpct+'%','Chegirma '+o.dpct+'%')+'</span><span>−'+money(o.disc)+'</span></div>':'';\nfunction renderShopPlaced(){\n  const o=S.shopPlaced.order,tg=tgLink(o),del=o.mode==='delivery';\n  view.innerHTML='<div class=\"wrap page\"><div class=\"stack\" style=\"max-width:560px\"><div><div class=\"eyebrow\">'+L('Заказ отправлен','Buyurtma yuborildi')+'</div><h1>'+L('Номер ','Raqam ')+esc(o.id)+'</h1></div>'\n    +'<div class=\"note\">'+L('Продавец получил заказ и скоро подтвердит его. Мы напишем вам в этом чате, когда статус изменится. Оплата только при получении.','Sotuvchi buyurtmani oldi va tez orada tasdiqlaydi. Holat oʻzgarganda shu chatda yozamiz. Toʻlov faqat olganda.')+'</div>'\n    +'<div class=\"sum\"><div class=\"r\"><span>'+(del?L('Доставка','Yetkazib berish'):L('Самовывоз','Olib ketish'))+'</span><span>'+esc(fmtWhen(o.pickupAt))+'</span></div>'\n    +(del&&o.region&&regionName(o.region)?'<div class=\"r\"><span>'+L('Регион','Hudud')+'</span><span style=\"white-space:normal;text-align:right\">'+esc(regionName(o.region))+'</span></div>':'')\n    +(del?'<div class=\"r\"><span>'+L('Адрес','Manzil')+'</span><span style=\"white-space:normal;text-align:right\">'+esc(o.address)+'</span></div>':'')\n    +(o.items||[]).map(it=>'<div class=\"r\">'+itemRow(it)+'</div>').join('')\n    +discRow(o,'r disc')\n    +(o.fee>0?'<div class=\"r\"><span>'+L('Стоимость доставки','Yetkazib berish narxi')+'</span><span>'+money(o.fee)+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('К оплате при получении','Olganda toʻlanadi')+'</span><span>'+money(o.total)+'</span></div></div>'\n    +'<div class=\"row-btns\">'+(tg?'<a class=\"btn ghost\" data-act=\"contact\" href=\"'+tg+'\" target=\"_blank\" rel=\"noopener\">'+L('Написать продавцу','Sotuvchiga yozish')+'</a>':'')\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"shopagain\">'+L('Ещё из каталога','Katalogdan yana')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"nav\" data-v=\"mine\">'+L('Мои заказы','Mening buyurtmalarim')+'</button></div></div></div>';\n}\nfunction validate(){\n  const e={},f=S.form;\n  if(!f.name.trim())e.name=L('Укажите имя','Ismingizni kiriting');\n  if(f.phone.replace(/\\D/g,'').length<9)e.phone=L('Укажите номер телефона','Telefon raqamini kiriting');\n  if(terrOn()&&!terrCur())e.terr=L('Выберите ваш район или город','Rayon yoki shahringizni tanlang');\n  if(mode()==='delivery'&&zoneOn()&&!orderRegion())e.region=L('Выберите регион доставки','Yetkazib berish hududini tanlang');\n  if(mode()==='delivery'&&f.address.trim().length<5)e.address=L('Укажите адрес доставки','Yetkazib berish manzilini kiriting');\n  if(!f.date)e.date=L('Выберите дату','Sanani tanlang');\n  if(f.date&&!f.time)e.time=L('Выберите время','Vaqtni tanlang');\n  return e;\n}\nconst FIELDS=['region','name','phone','terr','address','date','time'];\nfunction orderErrText(er){\n  return {\n    too_many:L('У вас уже есть несколько неподтверждённых заказов. Дождитесь ответа продавца.','Sizda tasdiqlanmagan buyurtmalar bor. Sotuvchi javobini kuting.'),\n    pickup:L('Это время уже недоступно. Выберите другое.','Bu vaqt endi mavjud emas. Boshqasini tanlang.'),\n    auth:L('Сессия устарела. Закройте и снова откройте приложение в боте.','Seans eskirdi. Ilovani yopib, botdan qayta oching.'),\n    expired:L('Сессия устарела. Закройте и снова откройте приложение в боте.','Seans eskirdi. Ilovani yopib, botdan qayta oching.'),\n    busy:L('Сейчас много заказов. Попробуйте чуть позже.','Hozir buyurtmalar koʻp. Birozdan keyin urinib koʻring.'),\n    shop_off:offTxt(),\n    blocked:blockedTxt()\n  }[er]||L('Не удалось отправить заказ. Проверьте соединение и попробуйте ещё раз.','Buyurtmani yuborib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.');\n}\nasync function submitOrder(){\n  if(S.busy)return;\n  const lines=cartLines();\n  if(!lines.length){S.shopStep='list';renderShop();return}\n  const e=validate();\n  FIELDS.forEach(k=>{\n    const el=$('#e-'+k),inp=$('#f-'+k);\n    if(el)el.textContent=e[k]||'';\n    if(inp)inp.setAttribute('aria-invalid',e[k]?'true':'false');\n  });\n  const first=FIELDS.find(k=>e[k]);\n  if(first){const inp=$('#f-'+first);if(inp){inp.focus();try{inp.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}}return}\n  if(!S.auth){toast(L('Откройте приложение через бота в Telegram, чтобы оформить заказ','Buyurtma berish uchun ilovani Telegramdagi bot orqali oching'));return}\n  if(S.blocked){toast(blockedTxt());return}\n  if(S.off){toast(offTxt());return}\n  if(minOrder()>0&&cartTotal()<minOrder()){\n    toast(L('Минимальная сумма заказа: '+money(minOrder()),'Buyurtmaning minimal summasi: '+money(minOrder())));\n    const m=$('#cmin');if(m)try{m.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}\n    return;\n  }\n  S.busy=true;\n  const btn=$('#submit');if(btn){btn.disabled=true;btn.textContent=L('Отправляем…','Yuborilmoqda…')}\n  const f=S.form,del=mode()==='delivery';\n  const r=await api('POST','/api/order',{\n    cart:lines.map(l=>({id:l.p.id,qty:l.qty})),\n    form:{name:f.name.trim(),phone:f.phone.trim(),mode:mode(),address:del?f.address.trim():'',region:del?orderRegion():'',terr:terrKnown()?S.hub.me.card.terr:(terrCur()==='-'?'':terrCur()),date:f.date,time:f.time,comment:f.comment.trim(),loc:f.loc||undefined},\n    lang:LANG,expectTotal:cartPay()\n  });\n  S.busy=false;\n  if(!r.ok){\n    const er=r.data&&r.data.error;\n    if(r.data&&r.data.cfg){S.cfg=mergeCfg(r.data.cfg);normalizeMode()}\n    if(r.data&&r.data.prod)S.prod=normProd(r.data.prod);\n    if(er==='stock'){\n      /* товара меньше, чем в корзине: показываем, сколько осталось, и уменьшаем корзину */\n      const short=Array.isArray(r.data.short)?r.data.short:[];\n      const what=short.slice(0,3).map(s=>{\n        const p=S.prod.items.find(x=>x.id===s.id),n=Number(s.avail)||0;\n        return (p?nm(p):'')+': '+(n>0?L('осталось '+n,'faqat '+n+' ta qoldi'):L('нет в наличии','mavjud emas'));\n      }).join('; ')+(short.length>3?'…':'');\n      short.forEach(s=>{\n        const n=Number(s.avail)||0;\n        if(n<=0)delete S.cart[s.id];else if((S.cart[s.id]||0)>n)S.cart[s.id]=n;\n      });\n      saveCart();pruneCart();\n      S.shopStep=cartCount()?'cart':'list';\n      renderNav();renderShop();\n      toast(L('Столько товара нет на складе. '+what+'. Мы обновили корзину.','Omborda buncha mahsulot yoʻq. '+what+'. Savatni yangiladik.'));\n      return;\n    }\n    if(er==='min_order'){\n      renderShop();\n      toast(L('Минимальная сумма заказа: '+money(Number(r.data.min)||minOrder()),'Buyurtmaning minimal summasi: '+money(Number(r.data.min)||minOrder())));\n      return;\n    }\n    if(er==='no_region'||er==='region_need'){\n      normalizeRegion();renderShop();\n      toast(er==='region_need'?L('Выберите регион доставки.','Yetkazib berish hududini tanlang.')\n        :L('Дистрибьютор не доставляет в этот регион. Выберите самовывоз или регион из списка.','Distribyutor bu hududga yetkazib bermaydi. Olib ketishni yoki roʻyxatdagi hududni tanlang.'));\n      return;\n    }\n    if(er==='price_changed'||er==='unavailable'||er==='no_delivery'){\n      pruneCart();\n      S.shopStep=cartCount()?'cart':'list';\n      renderNav();renderShop();\n      toast(er==='price_changed'?L('Продавец обновил цены. Проверьте сумму и оформите заказ ещё раз.','Sotuvchi narxlarni yangiladi. Summani tekshirib, qaytadan buyurtma bering.')\n        :er==='no_delivery'?L('Доставка сейчас недоступна. Выберите самовывоз.','Hozir yetkazib berish mavjud emas. Olib ketishni tanlang.')\n        :L('Что-то из корзины закончилось, мы обновили её. Проверьте заказ и оформите ещё раз.','Savatdagi baʼzi narsalar tugadi, savatni yangiladik. Buyurtmani tekshirib, qaytadan bering.'));\n      return;\n    }\n    if(er==='blocked')S.blocked=true;\n    if(er==='shop_off')S.off=true;\n    renderShop();toast(orderErrText(er));\n    return;\n  }\n  const order=r.data.order;\n  order.did=S.did;order.shopName=S.cfg.shop.name||'';\n  S.cart={};saveCart();\n  S.shopPlaced={order};S.shopStep='list';\n  loadHub();   // магазин уже в общей базе: поле района больше не нужно\n  S.myOrders=[order].concat(S.myOrders.filter(o=>!(o.id===order.id&&(o.did||S.did)===S.did)));\n  S.form.comment='';S.form.loc=null;   // точка относится к одному заказу: в следующий раз магазин может быть уже в другом месте\n  if(!S.profile)S.profile={name:order.name,phone:order.phone,org:'',addrs:order.mode==='delivery'&&order.address?[order.address]:[]};\n  else{\n    if(!S.profile.name)S.profile.name=order.name;\n    if(!S.profile.phone)S.profile.phone=order.phone;\n    if(order.mode==='delivery'&&order.address&&S.profile.addrs.length<5&&!S.profile.addrs.some(a=>a.toLowerCase()===order.address.toLowerCase()))S.profile.addrs=S.profile.addrs.concat([order.address]);\n  }\n  try{S.tg&&S.tg.HapticFeedback&&S.tg.HapticFeedback.notificationOccurred('success')}catch(x){}\n  renderNav();renderShop();\n  window.scrollTo(0,0);\n}\n\n/* ---------- orders ---------- */\nconst pill=o=>{const t=stOf(o.status,o.mode);return '<span class=\"st '+t.c+'\">'+esc(nm(t))+'</span>'};\nfunction sellerActs(o){\n  const a=(to,label)=>'<button type=\"button\" class=\"btn sm\" data-act=\"status\" data-id=\"'+esc(o.id)+'\" data-to=\"'+to+'\">'+label+'</button>';\n  const del=o.mode==='delivery';\n  const pk='<button type=\"button\" class=\"btn ghost sm\" data-act=\"pick1\" data-id=\"'+esc(o.id)+'\">'+L('Сборочный лист','Yigʻish roʻyxati')+'</button>';\n  if(o.status==='new')return a('accepted',L('Принять в работу','Ishga qabul qilish'))+cancelBtn(o)+pk;\n  if(o.status==='accepted')return a('ready',del?L('Готов к отправке','Joʻnatishga tayyor'):L('Готов к выдаче','Topshirishga tayyor'))+cancelBtn(o)+pk;\n  if(o.status==='ready')return a('done',del?L('Доставлен клиенту','Mijozga yetkazildi'):L('Выдан клиенту','Mijozga topshirildi'))+cancelBtn(o)+pk;\n  return o.status==='done'?pk:'';\n}\nfunction cancelBtn(o){\n  const sure=S.cc===okey(o.id,S.did);\n  return '<button type=\"button\" class=\"btn ghost sm\" data-act=\"scancel\" data-id=\"'+esc(o.id)+'\">'+(sure?L('Точно отменить?','Aniq bekor qilinsinmi?'):L('Отменить','Bekor qilish'))+'</button>';\n}\nfunction orderCard(o,m){\n  const od=o.did||S.did,key=okey(o.id,od),dd=m==='mine'?' data-d=\"'+esc(od)+'\"':'';\n  const rep=m==='mine'?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"repeat\" data-id=\"'+esc(o.id)+'\"'+dd+'>'+L('Повторить заказ','Buyurtmani takrorlash')+'</button>':'';\n  const acts=m==='seller'?sellerActs(o):rep+(o.status==='new'?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"mycancel\" data-id=\"'+esc(o.id)+'\"'+dd+'>'+(S.cc===key?L('Точно отменить?','Aniq bekor qilinsinmi?'):L('Отменить заказ','Buyurtmani bekor qilish'))+'</button>':'');\n  // картинки товаров есть только у открытого сейчас дистрибьютора\n  const first=od===S.did?(o.items||[]).map(i=>S.prod.items.find(p=>p.id===i.id)).find(p=>p&&p.pv):null;\n  const del=o.mode==='delivery';\n  return '<article class=\"ord'+(m==='seller'&&o.status==='new'?' is-new':'')+'\"><div class=\"th\">'+(first?'<img src=\"'+imgUrl(first)+'\" alt=\"\" loading=\"lazy\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>')+'</div><div class=\"ob\">'\n    +'<div class=\"oh\"><span class=\"oid\">'+esc(o.id)+'</span>'+pill(o)+'</div>'\n    +(m==='mine'&&o.shopName?'<div class=\"dtag\">'+esc(o.shopName)+'</div>':'')\n    +'<div class=\"when\">'+esc(fmtWhen(o.pickupAt))+'</div>'\n    +'<div class=\"spec\">'+(del?L('Доставка: ','Yetkazib berish: ')+esc((o.region&&regionName(o.region)?regionName(o.region)+', ':'')+(o.address||'')):L('Самовывоз','Olib ketish'))+'</div>'\n    +(o.items||[]).map(it=>'<div class=\"pl\">'+itemRow(it)+'</div>').join('')\n    +discRow(o,'pl')\n    +(o.fee>0?'<div class=\"pl\"><span>'+L('Стоимость доставки','Yetkazib berish narxi')+'</span><span>'+money(o.fee)+'</span></div>':'')\n    +(m==='seller'?'<div class=\"cust\"><b>'+esc(o.name)+'</b>'+(o.org?' <span>'+esc(o.org)+'</span>':'')+' <span>'+esc(o.phone)+'</span>'+(o.tg&&o.tg.username?' <span>@'+esc(o.tg.username)+'</span>':'')+' <button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(o.phone)+'\">'+L('Копировать','Nusxalash')+'</button></div>':'')\n    +(m==='seller'&&o.loc?'<div class=\"oloc\"><button type=\"button\" class=\"lchip\" data-act=\"map\" data-lat=\"'+o.loc.lat+'\" data-lng=\"'+o.loc.lng+'\" data-t=\"'+esc(o.org||o.name)+'\">'+ICO.pin+L('Точка на карте','Xaritadagi nuqta')+'</button></div>':'')\n    +(o.comment?'<div class=\"cm\">'+esc(o.comment)+'</div>':'')\n    +'<div class=\"tot\"><b>'+money(o.total)+'</b><span>'+L('оплата при получении','olganda toʻlanadi')+'</span></div>'\n    +(acts?'<div class=\"acts\">'+acts+'</div>':'')\n    +'</div></article>';\n}\nfunction renderMine(){\n  let h='<div class=\"wrap page\"><h1>'+L('Мои заказы','Mening buyurtmalarim')+'</h1>';\n  if(!S.ready)h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!S.auth)h+='<div class=\"empty\"><b>'+L('Откройте через бота','Bot orqali oching')+'</b>'+L('Чтобы видеть свои заказы, откройте приложение из бота в Telegram.','Buyurtmalaringizni koʻrish uchun ilovani Telegramdagi botdan oching.')+'</div>';\n  else if(!S.myOrders.length)h+='<div class=\"empty\"><b>'+L('Пока нет заказов','Hozircha buyurtma yoʻq')+'</b>'+L('Выберите товары в каталоге, и заказ появится здесь со статусом.','Katalogdan mahsulot tanlang, buyurtma shu yerda holati bilan koʻrinadi.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"nav\" data-v=\"shop\">'+L('Открыть каталог','Katalogni ochish')+'</button></div>';\n  else{\n    const list=S.myOrders.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));\n    h+='<p class=\"lead\">'+L('Заказы у всех дистрибьюторов. Статус обновляется, когда продавец принимает и собирает заказ.','Barcha distribyutorlardagi buyurtmalar. Sotuvchi buyurtmani qabul qilib yigʻganda holat yangilanadi.')+'</p><div class=\"ordlist\">'+list.map(o=>orderCard(o,'mine')).join('')+'</div>';\n  }\n  view.innerHTML=h+'</div>';\n}\n\n/* ---------- профиль клиента ---------- */\nfunction renderProfile(){\n  let h='<div class=\"wrap page\"><h1>'+L('Мой профиль','Mening profilim')+'</h1>';\n  if(!S.ready)h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!S.did)h+='<div class=\"empty\"><b>'+L('Выберите дистрибьютора','Distribyutorni tanlang')+'</b>'+L('Профиль хранится у каждого дистрибьютора отдельно.','Profil har bir distribyutorda alohida saqlanadi.')+'</div>';\n  else if(!S.auth)h+='<div class=\"empty\"><b>'+L('Откройте через бота','Bot orqali oching')+'</b>'+L('Профиль доступен, если открыть приложение из бота в Telegram.','Profil ilovani Telegramdagi botdan ochganda mavjud.')+'</div>';\n  else{\n    const p=S.profile||{name:'',phone:'',org:'',addrs:[]};\n    h+='<p class=\"lead\">'+L('Эти данные подставляются в заказ, на любом вашем устройстве. При оформлении заказа их можно изменить.','Bu maʼlumotlar istalgan qurilmangizda buyurtmaga avtomatik qoʻyiladi. Buyurtma berayotganda oʻzgartirish mumkin.')+'</p>'\n      +(S.blocked?'<div class=\"bannerbad\" role=\"alert\" style=\"margin-bottom:12px\">'+esc(blockedTxt())+'</div>':'')\n      +'<div class=\"card\"><div class=\"form\">'\n      +'<div><label class=\"lab\" for=\"p-name\">'+L('Ваше имя','Ismingiz')+'</label><input type=\"text\" id=\"p-name\" data-pf=\"name\" maxlength=\"60\" value=\"'+esc(p.name)+'\" autocomplete=\"name\"><div class=\"err\" id=\"pe-name\"></div></div>'\n      +'<div><label class=\"lab\" for=\"p-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"p-phone\" data-pf=\"phone\" maxlength=\"25\" value=\"'+esc(p.phone)+'\" placeholder=\"+998 90 123 45 67\" autocomplete=\"tel\"><div class=\"err\" id=\"pe-phone\"></div></div>'\n      +'<div class=\"full\"><label class=\"lab\" for=\"p-org\">'+L('Организация (магазин, кафе, компания)','Tashkilot (doʻkon, kafe, kompaniya)')+'</label><input type=\"text\" id=\"p-org\" data-pf=\"org\" maxlength=\"80\" value=\"'+esc(p.org)+'\" autocomplete=\"organization\"><div class=\"err\" id=\"pe-org\"></div></div>'\n      +'<div class=\"full\"><label class=\"lab\" for=\"p-addrs\">'+L('Адреса доставки: каждый с новой строки, до 5','Yetkazib berish manzillari: har biri yangi qatordan, 5 tagacha')+'</label><textarea id=\"p-addrs\" data-pf=\"addrs\" rows=\"4\" placeholder=\"'+esc(L('Город, улица, дом, ориентир','Shahar, koʻcha, uy, moʻljal'))+'\">'+esc((p.addrs||[]).join('\\n'))+'</textarea><div class=\"err\" id=\"pe-addrs\"></div></div>'\n      +'</div><div class=\"row-btns\" style=\"margin-top:14px\"><button type=\"button\" class=\"btn\" id=\"pfsave\" data-act=\"pfsave\">'+L('Сохранить','Saqlash')+'</button></div></div>';\n  }\n  view.innerHTML=h+'</div>';\n}\n/* общая проверка полей клиента на телефоне; возвращает {v} или {e:{поле:текст}} */\nfunction checkClientFields(get){\n  const e={},v={name:get('name').trim(),phone:get('phone').trim(),org:get('org').trim()};\n  if(v.phone&&(v.phone.replace(/\\D/g,'').length<9||v.phone.replace(/\\D/g,'').length>15))e.phone=L('Проверьте номер телефона','Telefon raqamini tekshiring');\n  const lines=get('addrs').split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean),addrs=[];\n  lines.forEach(x=>{if(!addrs.some(y=>y.toLowerCase()===x.toLowerCase()))addrs.push(x)});\n  if(addrs.some(x=>x.length<5))e.addrs=L('Адрес слишком короткий','Manzil juda qisqa');\n  else if(addrs.length>5)e.addrs=L('Можно сохранить не больше 5 адресов','5 tadan ortiq manzil saqlab boʻlmaydi');\n  v.addrs=addrs;\n  return Object.keys(e).length?{e}:{v};\n}\nconst clientErrText=er=>({\n  bad_phone:L('Проверьте номер телефона','Telefon raqamini tekshiring'),\n  bad_addr:L('Адрес слишком короткий','Manzil juda qisqa'),\n  too_many_addrs:L('Можно сохранить не больше 5 адресов','5 tadan ortiq manzil saqlab boʻlmaydi'),\n  busy:L('Сейчас сохранить нельзя. Попробуйте позже.','Hozir saqlab boʻlmaydi. Keyinroq urinib koʻring.')\n}[er]||L('Не удалось сохранить. Проверьте соединение.','Saqlab boʻlmadi. Ulanishni tekshiring.'));\nasync function saveProfile(){\n  if(S.pfBusy||!S.auth)return;\n  const get=k=>{const el=document.getElementById('p-'+k);return el?String(el.value):''};\n  const c=checkClientFields(get);\n  ['name','phone','org','addrs'].forEach(k=>{const er=document.getElementById('pe-'+k),inp=document.getElementById('p-'+k);if(er)er.textContent=(c.e&&c.e[k])||'';if(inp)inp.setAttribute('aria-invalid',c.e&&c.e[k]?'true':'false')});\n  if(c.e){const k=Object.keys(c.e)[0],inp=document.getElementById('p-'+k);if(inp)inp.focus();return}\n  S.pfBusy=true;\n  const btn=$('#pfsave');if(btn)btn.disabled=true;\n  const r=await api('PUT','/api/profile',c.v);\n  S.pfBusy=false;\n  if(btn)btn.disabled=false;\n  if(!r.ok||!r.data||!r.data.profile){toast(clientErrText(r.data&&r.data.error));return}\n  S.profile=r.data.profile;\n  /* данные профиля подставляем в форму заказа сразу; адрес — только если поле пустое или адреса больше нет в профиле */\n  S.form.name=S.profile.name||S.form.name;S.form.phone=S.profile.phone||S.form.phone;\n  if(!S.form.address||!S.profile.addrs.some(a=>a.toLowerCase()===S.form.address.toLowerCase()))S.form.address=S.profile.addrs[0]||S.form.address;\n  saveForm();\n  toast(L('Профиль сохранён','Profil saqlandi'));\n  if(S.view==='profile')renderProfile();\n}\n\n/* ---------- seller ---------- */\nfunction renderSeller(){\n  if(!S.admin){view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Раздел для продавца','Sotuvchi boʻlimi')+'</b>'+L('Откройте приложение с правами редактора.','Ilovani muharrir huquqi bilan oching.')+'</div></div>';return}\n  view.innerHTML='<div class=\"wrap page\">'+backHTML()+'<div class=\"hrow\" style=\"margin-bottom:14px\"><div><div class=\"eyebrow\">'+L('Продавец','Sotuvchi')+' · '+esc(S.cfg.shop.name||DEFAULT.shop.name)+'</div><h1 id=\"stitle\"></h1></div></div>'\n    +(S.off?'<div class=\"bannerbad\" role=\"alert\" style=\"margin-bottom:12px\">'+esc(L('Владелец площадки скрыл ваш каталог: клиенты его не видят и не могут заказать.','Platforma egasi katalogingizni yashirgan: mijozlar uni koʻrmaydi va buyurtma bera olmaydi.'))+'</div>':'')\n    +'<div id=\"sbody\"></div></div>';\n  paintTabs();\n  paintSeller();\n}\n/* сколько товаров заканчивается или закончилось (число на вкладке «Остатки») */\nconst stockWarn=()=>S.prod.items.filter(p=>{const s=stState(p);return s==='low'||s==='out'}).length;\nfunction paintTabs(){\n  const t=$('#stitle');\n  if(t){const x=sellerSubs().find(y=>y[0]===S.sellerTab);t.textContent=x?x[1]:''}\n  renderNav();\n}\n/* открыть раздел продавца из меню: из любого места приложения */\nfunction sellerOpen(tab){\n  S.sellerTab=tab;S.sc=null;\n  if(S.view!=='seller')go('seller');\n  else{paintTabs();paintSeller();window.scrollTo(0,0)}\n  if(tab==='stock'){loadStock();if(S.jrOpen)loadJournal()}\n  if(tab==='reports')loadReport();\n}\nfunction paintSeller(){\n  const b=$('#sbody');if(!b)return;\n  if(S.sellerTab==='orders')b.innerHTML=ordersHTML();\n  else if(S.sellerTab==='prod')b.innerHTML=prodHTML();\n  else if(S.sellerTab==='stock')b.innerHTML=stockHTML();\n  else if(S.sellerTab==='reports')b.innerHTML=repHTML();\n  else b.innerHTML=settingsHTML();\n  paintSave();\n}\nfunction ordersHTML(){\n  const all=S.allOrders,today=ymd(shopNow());\n  const act=o=>o.status==='new'||o.status==='accepted'||o.status==='ready';\n  const nNew=all.filter(o=>o.status==='new').length;\n  const nWork=all.filter(o=>o.status==='accepted').length;\n  const nToday=all.filter(o=>act(o)&&String(o.pickupAt).slice(0,10)===today).length;\n  const sum=Number(S.stats.doneSum)||0;\n  let h='<div class=\"stats\"><div class=\"stat'+(nNew?' hot':'')+'\"><small>'+L('Новые','Yangi')+'</small><b>'+nNew+'</b></div><div class=\"stat\"><small>'+L('В работе','Ishlanmoqda')+'</small><b>'+nWork+'</b></div><div class=\"stat\"><small>'+L('На сегодня','Bugunga')+'</small><b>'+nToday+'</b></div><div class=\"stat\"><small>'+L('Завершено на сумму','Yakunlangan summa')+'</small><b>'+money(sum)+'</b></div></div>';\n  const fl=[['active',L('Активные','Faol')],['done',L('Завершены','Yakunlangan')],['cancelled',L('Отменены','Bekor qilingan')],['all',L('Все','Hammasi')]];\n  h+='<div class=\"filters\">'+fl.map(f=>'<button type=\"button\" class=\"chip\" data-act=\"filter\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(S.filter===f[0])+'\">'+f[1]+'</button>').join('')+'</div>';\n  h+=xtoolsHTML();\n  let list=all.filter(o=>S.filter==='all'?true:S.filter==='active'?act(o):o.status===S.filter);\n  if(S.filter==='active')list.sort((a,b)=>String(a.pickupAt).localeCompare(String(b.pickupAt)));\n  else list.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));\n  if(!list.length)h+='<div class=\"empty\"><b>'+(all.length?L('В этом списке пусто','Bu roʻyxat boʻsh'):L('Заказов пока нет','Hozircha buyurtma yoʻq'))+'</b>'+(all.length?L('Выберите другой фильтр.','Boshqa filtrni tanlang.'):L('Когда клиент оформит заказ, он появится здесь с составом, адресом и телефоном.','Mijoz buyurtma berganda, u shu yerda tarkibi, manzili va telefoni bilan paydo boʻladi.'))+'</div>';\n  else h+='<div class=\"ordlist\">'+list.map(o=>orderCard(o,'seller')).join('')+'</div>';\n  return h;\n}\n/* ---------- сборочный лист и выгрузки ---------- */\nconst XLAB={orders:['Заказы в Excel','Buyurtmalar Excelda'],clients:['Клиенты в Excel','Mijozlar Excelda'],backup:['Получить резервную копию','Zaxira nusxasini olish'],pick:['Файлом в чат','Chatga fayl sifatida'],catalog:['Каталог в Excel','Katalog Excelda'],report:['Отчёт в Excel','Hisobot Excelda']};\nconst xlab=k=>S.xbusy===k?L('Отправляем…','Yuborilmoqda…'):L(XLAB[k][0],XLAB[k][1]);\nconst xbtn=(k,cls,act)=>'<button type=\"button\" class=\"btn ghost sm'+(cls?' '+cls:'')+'\" data-act=\"'+(act||(k==='pick'?'xpick':'xport'))+'\" data-k=\"'+k+'\" data-xk=\"'+k+'\"'+(S.xbusy?' disabled':'')+'>'+xlab(k)+'</button>';\nfunction xtoolsHTML(){\n  const work=S.allOrders.filter(o=>o.status==='new'||o.status==='accepted');\n  const d=shopNow(),today=ymd(d);d.setDate(d.getDate()+1);\n  const tom=ymd(d);\n  const chip=(lab,day)=>{const n=day?work.filter(o=>String(o.pickupAt).slice(0,10)===day).length:work.length;return '<button type=\"button\" class=\"chip\" data-act=\"pick\" data-day=\"'+day+'\"'+(n&&!S.pickBusy?'':' disabled')+'>'+lab+' · '+n+'</button>'};\n  return '<div class=\"xtools\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmenu\" aria-expanded=\"'+(S.pm?'true':'false')+'\">'+L('Сборочный лист','Yigʻish roʻyxati')+(S.pm?' ▴':' ▾')+'</button>'+xbtn('orders')\n    +(S.pm?'<div class=\"xmenu\">'+chip(L('Все','Hammasi'),'')+chip(L('Сегодня','Bugun'),today)+chip(L('Завтра','Ertaga'),tom)+'</div><div class=\"unit\">'+L('Что достать со склада: общий список и страница на каждый заказ. Берутся новые заказы и заказы в работе. Один заказ можно открыть кнопкой в его карточке.','Ombordan nimalarni olish kerak: umumiy roʻyxat va har bir buyurtma uchun alohida sahifa. Yangi va ishdagi buyurtmalar olinadi. Bitta buyurtmani uning kartochkasidagi tugma bilan ochish mumkin.')+'</div>':'')\n    +'</div>';\n}\nfunction paintX(){\n  document.querySelectorAll('[data-xk]').forEach(b=>{b.disabled=!!S.xbusy;b.textContent=xlab(b.dataset.xk)});\n}\nconst xErrText=er=>({\n  empty:L('Нет заказов для сборки','Yigʻish uchun buyurtma yoʻq'),\n  busy:L('Файл уже готовится. Подождите несколько секунд.','Fayl tayyorlanmoqda. Bir necha soniya kuting.'),\n  send_failed:L('Telegram не принял файл. Откройте чат с ботом, нажмите «Старт» и повторите.','Telegram faylni qabul qilmadi. Bot chatini oching, «Start» tugmasini bosing va qayta urining.')\n}[er]||L('Не удалось подготовить файл. Проверьте соединение и повторите.','Faylni tayyorlab boʻlmadi. Ulanishni tekshiring va qayta urining.'));\n/* Файл уходит в чат продавца с ботом: в Telegram он открывается и сохраняется на любом устройстве. */\nasync function doExport(kind,extra,did){\n  if(S.xbusy||(!did&&!S.admin))return;\n  S.xbusy=kind;paintX();\n  const r=await api('POST','/api/admin/export',Object.assign({kind},extra||{}),did);\n  S.xbusy='';paintX();\n  if(r.ok&&r.data&&r.data.ok){toast(L('Файл отправлен вам в чат с ботом. Закройте приложение, чтобы его увидеть.','Fayl botdagi chatingizga yuborildi. Koʻrish uchun ilovani yoping.'));return}\n  toast(xErrText(r.data&&r.data.error));\n}\nasync function openPick(body){\n  if(S.pickBusy||!S.admin)return;\n  S.pickBusy=true;\n  const r=await api('POST','/api/admin/pick',body);\n  S.pickBusy=false;\n  if(!r.ok||!r.data||!r.data.html){toast(xErrText(r.data&&r.data.error));return}\n  S.pick={body,n:r.data.n};\n  let ov=document.getElementById('pov');\n  if(!ov){ov=document.createElement('div');ov.id='pov';ov.className='pov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');document.body.appendChild(ov)}\n  ov.setAttribute('aria-label',L('Сборочный лист','Yigʻish roʻyxati')+', '+r.data.n);\n  const canPrint=!(S.tg&&/^(android|ios)$/.test(S.tg.platform||''));\n  ov.innerHTML='<div class=\"pbar\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pclose\">← '+L('Назад','Orqaga')+'</button><span class=\"grow\"></span>'\n    +(canPrint?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"pprint\">'+L('Печать','Chop etish')+'</button>':'')+xbtn('pick')+'</div>'\n    +'<iframe class=\"pframe\" id=\"pframe\" title=\"'+esc(L('Сборочный лист','Yigʻish roʻyxati'))+'\" sandbox=\"allow-same-origin allow-modals\"></iframe>';\n  $('#pframe').srcdoc=r.data.html;\n  ov.hidden=false;\n  const cb=ov.querySelector('[data-act=\"pclose\"]');if(cb)cb.focus();\n}\nfunction closePick(){\n  const ov=document.getElementById('pov');\n  if(ov){ov.hidden=true;ov.innerHTML=''}\n  S.pick=null;\n}\nfunction printPick(){\n  const f=$('#pframe');\n  try{f.contentWindow.focus();f.contentWindow.print()}\n  catch(e){toast(L('Печать здесь недоступна. Нажмите «Файлом в чат» и распечатайте файл из браузера.','Bu yerda chop etib boʻlmaydi. «Chatga fayl sifatida» tugmasini bosib, faylni brauzerdan chop eting.'))}\n}\ndocument.addEventListener('keydown',e=>{\n  if(e.key!=='Escape')return;\n  if(document.getElementById('mapsheet'))closeMapSheet();\n  else if(S.pick)closePick();\n  else if(S.view==='review'&&(S.rv.ret||S.rv.edit))rvClose();\n  else if(S.view==='base'&&(S.base.sheet||S.base.legend||S.base.cd))clientCardClose()\n});\n\nfunction photoBlock(p){\n  const id=esc(p.id),up=S.upl[p.id],busy=!!up,cnt=phVers(p).length;\n  let h='<div class=\"pslots'+(busy?' busy':'')+'\">';\n  for(let i=1;i<=PH_MAX;i++){\n    const inp='<input type=\"file\" class=\"sr\" id=\"ph-'+id+'-'+i+'\" accept=\"image/*\" data-photo=\"'+id+'\" data-n=\"'+i+'\"'+(busy?' disabled':'')+'>';\n    if(i<=cnt){\n      h+='<div class=\"pslot has'+(up===i?' load':'')+'\"><label for=\"ph-'+id+'-'+i+'\" aria-label=\"'+esc(L('Заменить фото '+i,i+'-rasmni almashtirish'))+'\"><img src=\"'+imgUrl(p,i)+'\" alt=\"\" decoding=\"async\"></label>'\n        +(i===1?'<span class=\"pmain\">'+L('Главное','Asosiy')+'</span>':'')\n        +(busy?'':'<button type=\"button\" class=\"px\" data-act=\"phdel\" data-id=\"'+id+'\" data-n=\"'+i+'\" aria-label=\"'+esc(L('Убрать фото '+i,i+'-rasmni olib tashlash'))+'\">×</button>')\n        +inp+'</div>';\n    }else if(i===cnt+1){\n      h+='<div class=\"pslot add'+(up===i?' load':'')+'\"><label for=\"ph-'+id+'-'+i+'\" aria-label=\"'+esc(L('Добавить фото','Rasm qoʻshish'))+'\"><span>+</span></label>'+inp+'</div>';\n    }else h+='<div class=\"pslot ghost\" aria-hidden=\"true\"></div>';\n  }\n  return h+'</div><div class=\"phint\">'+L('До 3 фото. Первое видно в каталоге, остальные открываются по нажатию на него. Чтобы заменить фото, нажмите на него.','3 tagacha rasm. Birinchisi katalogda koʻrinadi, qolganlari unga bosilganda ochiladi. Rasmni almashtirish uchun unga bosing.')+'</div>';\n}\nfunction paintPhoto(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.getElementById('pph-'+id);\n  if(p&&el)el.innerHTML=photoBlock(p);\n}\n/* ступени цены в редакторе: три строки «от N шт — цена»; в товар попадают только верные (общая cleanTiers) */\nfunction tiersEditHTML(p){\n  const id=esc(p.id),t=tiersOf(p);\n  const rows=[0,1,2].map(i=>{\n    const x=t[i]||{};\n    return '<div class=\"trow\"><span>'+L('от','dan')+'</span><input type=\"number\" id=\"ptn-'+id+'-'+i+'\" data-pid=\"'+id+'\" data-pp=\"tn\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"2\" max=\"500\" step=\"1\" value=\"'+(x.n||'')+'\" placeholder=\"'+(i===0?'10':'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': от скольких штук','Pogʻona '+(i+1)+': necha donadan'))+'\">'\n      +'<span>'+L('шт — цена','dona — narx')+'</span><input type=\"number\" id=\"ptp-'+id+'-'+i+'\" data-pid=\"'+id+'\" data-pp=\"tp\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"1\" step=\"100\" value=\"'+(x.price||'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': цена за штуку, сум','Pogʻona '+(i+1)+': bir dona narxi, soʻm'))+'\"><span>'+L('сум','soʻm')+'</span></div>';\n  }).join('');\n  return '<div class=\"full\"><span class=\"lab\">'+L('Цена от количества (оптовые ступени)','Miqdorga qarab narx (ulgurji pogʻonalar)')+'</span><div class=\"tiers\">'+rows+'</div><div class=\"err\" id=\"ptw-'+id+'\" role=\"status\"></div>'\n    +'<div class=\"unit\" style=\"margin:2px 0 0\">'+L('Пример: от 10 шт — 7 000 сум. Когда клиент берёт столько штук этого товара, цена действует на все штуки. Цена ступени должна быть ниже обычной, а следующая — ещё ниже. Пустые строки не нужны.','Misol: 10 dona — 7 000 soʻm. Mijoz shuncha dona olsa, narx barcha donalarga qoʻllanadi. Pogʻona narxi odatdagidan, keyingisi esa undan ham past boʻlishi kerak. Boʻsh qatorlar kerak emas.')+'</div></div>';\n}\nfunction syncTiers(p){\n  const rows=[];\n  for(let i=0;i<3;i++){\n    const a=document.getElementById('ptn-'+p.id+'-'+i),b=document.getElementById('ptp-'+p.id+'-'+i);\n    const n=a?String(a.value).trim():'',pr=b?String(b.value).trim():'';\n    if(n!==''&&pr!=='')rows.push({n:Number(n),price:Number(pr)});\n  }\n  p.tiers=cleanTiers(rows,p.price);\n  const w=document.getElementById('ptw-'+p.id);\n  if(w)w.textContent=p.tiers.length<rows.length?L('Одна из строк не учтена: цена ступени должна быть ниже обычной и ниже предыдущей, а количество — больше предыдущего (от 2 до 500).','Qatorlardan biri hisobga olinmadi: pogʻona narxi odatdagidan va oldingisidan past, miqdor esa oldingisidan katta boʻlishi kerak (2 dan 500 gacha).'):'';\n}\n/* ---------- проверка товаров: продавец ---------- */\nconst inModGroup=p=>p.ms==='wait'||p.ms==='ret';\nconst modRetN=()=>S.prod.items.filter(p=>p.ms==='ret').length;\nconst modTag=p=>p.ms?'<span class=\"mtag '+p.ms+'\">'+({draft:L('Черновик','Qoralama'),wait:L('Ждёт проверки','Tekshiruv kutmoqda'),ret:L('Нужно исправить','Tuzatish kerak')}[p.ms]||'')+'</span>':'';\nconst modReasonHTML=p=>'<div class=\"mreason\"><small>'+L('Причина возврата','Qaytarish sababi')+'</small>'+esc(p.mc||L('Причина не указана','Sabab koʻrsatilmagan'))+'</div>';\n/* шапка товара в редакторе: черновик и возвращённый показывают состояние и кнопку отправки */\nfunction modHeadInner(p){\n  if(p.ms!=='draft'&&p.ms!=='ret')return '';\n  const id=esc(p.id),ret=p.ms==='ret';\n  return '<div class=\"mhead '+p.ms+'\"><div class=\"mrow\">'+modTag(p)+'<button type=\"button\" class=\"btn sm\" data-act=\"msub1\" data-id=\"'+id+'\"'+(S.msubBusy?' disabled':'')+'>'+(ret?L('Отправить снова','Qayta yuborish'):L('Отправить на проверку','Tekshiruvga yuborish'))+'</button></div>'\n    +(ret?modReasonHTML(p):'<div class=\"unit\" style=\"margin:6px 0 0\">'+L('Клиенты пока не видят этот товар. Укажите название, цену и категорию и отправьте на проверку.','Mijozlar bu mahsulotni hozircha koʻrmaydi. Nomi, narxi va kategoriyasini koʻrsatib, tekshiruvga yuboring.')+'</div>')+'</div>';\n}\nfunction modBanInner(){\n  const n=S.prod.items.filter(p=>p.ms==='draft').length;\n  if(!n)return '';\n  return '<div class=\"note warnnote mban\"><div>'+L('Черновиков: '+n+'. Клиенты их не видят, пока площадка не проверит.','Qoralamalar: '+n+'. Platforma tekshirmaguncha mijozlar ularni koʻrmaydi.')+'</div><button type=\"button\" class=\"btn sm\" data-act=\"msuball\"'+(S.msubBusy?' disabled':'')+'>'+L('Отправить на проверку ('+n+')','Tekshiruvga yuborish ('+n+')')+'</button></div>';\n}\n/* компактная карточка товара «на проверке»; у возвращённого есть причина и кнопки Исправить / Отправить снова */\nfunction modCard(p){\n  if(S.medit[p.id]&&p.ms==='ret')return prodRow(p);\n  const id=esc(p.id),ret=p.ms==='ret',w=weightLabel(p);\n  const th=p.pv?'<img src=\"'+imgUrl(p)+'\" alt=\"\" decoding=\"async\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>';\n  return '<div class=\"mcard '+p.ms+'\" id=\"prow-'+id+'\"><div class=\"mtop\"><div class=\"mth\">'+th+'</div><div class=\"mtx\"><b>'+esc(nm(p))+'</b><small>'+(w?esc(w)+' · ':'')+money(p.price)+'</small>'+modTag(p)+'</div></div>'\n    +(ret?modReasonHTML(p):'<div class=\"unit\" style=\"margin:8px 0 0\">'+L('Отправлено: '+agoTxt(p.mt)+'. Клиенты видят товар серым, без цены, пока площадка не проверит.','Yuborilgan: '+agoTxt(p.mt)+'. Platforma tekshirmaguncha mijozlar mahsulotni kulrang, narxsiz koʻradi.')+'</div>')\n    +'<div class=\"mact\">'+(ret?'<button type=\"button\" class=\"btn sm\" data-act=\"mfix\" data-id=\"'+id+'\">'+L('Исправить','Tuzatish')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"msub1\" data-id=\"'+id+'\"'+(S.msubBusy?' disabled':'')+'>'+L('Отправить снова','Qayta yuborish')+'</button>':'')\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"pdel\" data-id=\"'+id+'\">'+L('Удалить товар','Mahsulotni oʻchirish')+'</button></div></div>';\n}\n/* сервер ведёт статусы сам: после сохранения берём их из ответа (названия, цены и фото на экране не трогаем) */\nfunction mergeMod(prod){\n  const before=S.prod.items.map(p=>p.id+':'+(p.ms||'')+':'+(p.mc||'')).join();\n  const map=new Map(normProd(prod).items.map(i=>[i.id,i]));\n  let grp=false;\n  S.prod.items.forEach(p=>{\n    const n=map.get(p.id);if(!n)return;\n    const was=inModGroup(p);\n    ['ms','mt','mc','ma'].forEach(k=>{if(n[k]===undefined)delete p[k];else p[k]=n[k]});\n    if(was!==inModGroup(p))grp=true;\n  });\n  if(S.prod.items.map(p=>p.id+':'+(p.ms||'')+':'+(p.mc||'')).join()===before)return;\n  paintTabs();renderNav();\n  if(S.view!=='seller'||S.sellerTab!=='prod')return;\n  if(grp)paintSeller();\n  else paintModBits();\n}\nfunction paintModBits(){\n  S.prod.items.forEach(p=>{const el=document.getElementById('mh-'+p.id);if(el)el.innerHTML=modHeadInner(p)});\n  const b=document.getElementById('mban');if(b)b.innerHTML=modBanInner();\n}\nconst MOD_WHY={name:['название','nomi'],price:['цену','narxi'],cat:['категорию','kategoriyasi']};\n/* ids — какие товары отправить */\nasync function modSubmit(ids){\n  if(S.msubBusy)return;\n  S.msubBusy=true;paintModBits();\n  await flushSave();\n  const r=await api('POST','/api/admin/submit',ids?{ids}:{});\n  S.msubBusy=false;\n  const bad=r.data&&Array.isArray(r.data.bad)?r.data.bad:[];\n  if(r.data&&r.data.prod)mergeMod(r.data.prod);\n  if(!r.ok){\n    if(bad.length){\n      const p=S.prod.items.find(x=>x.id===bad[0].id);\n      toast((p?'«'+nm(p)+'»: ':'')+L('укажите '+bad[0].why.map(w=>MOD_WHY[w][0]).join(', '),bad[0].why.map(w=>MOD_WHY[w][1]).join(', ')+' koʻrsating'));\n    }else toast(L('Нечего отправлять','Yuboradigan narsa yoʻq'));\n    paintSeller();return;\n  }\n  ids&&ids.forEach(id=>{delete S.medit[id]});\n  S.prod.items.forEach(p=>{if(!inModGroup(p))delete S.medit[p.id]});\n  paintSeller();\n  const n=r.data.sent||0;\n  toast(L('Отправлено на проверку: '+n+(bad.length?'. Не хватает данных у '+bad.length+'.':''),'Tekshiruvga yuborildi: '+n+(bad.length?'. '+bad.length+' tasida maʼlumot yetishmaydi.':'')));\n}\nfunction prodRow(p){\n  const id=esc(p.id);\n  const fld=(k,lab,inner,cls)=>'<div'+(cls?' class=\"'+cls+'\"':'')+'><label class=\"lab\" for=\"p'+k+'-'+id+'\">'+lab+'</label>'+inner+'</div>';\n  const inp=(k,type,val,extra)=>'<input type=\"'+type+'\" id=\"p'+k+'-'+id+'\" data-pid=\"'+id+'\" data-pp=\"'+k+'\" value=\"'+esc(val)+'\"'+(extra||'')+'>';\n  const ta=(k,val)=>'<textarea id=\"p'+k+'-'+id+'\" data-pid=\"'+id+'\" data-pp=\"'+k+'\" maxlength=\"300\" rows=\"2\">'+esc(val)+'</textarea>';\n  return '<div class=\"prow'+(p.on===false?' off':'')+'\" id=\"prow-'+id+'\"><div class=\"pph\" id=\"pph-'+id+'\">'+photoBlock(p)+'</div><div class=\"pf\"><div class=\"full mh\" id=\"mh-'+id+'\">'+modHeadInner(p)+'</div>'\n    +fld('name',L('Название','Nomi'),inp('name','text',p.name,' maxlength=\"60\"'),'full')\n    +fld('uz',L('Название по-узбекски','Oʻzbekcha nomi'),inp('uz','text',p.uz||'',' maxlength=\"60\"'),'full')\n    +fld('desc',L('Описание','Tavsif'),ta('desc',p.desc||''),'full')\n    +fld('descUz',L('Описание по-узбекски','Oʻzbekcha tavsif'),ta('descUz',p.descUz||''),'full')\n    +fld('cat',L('Категория','Kategoriya'),'<select id=\"pcat-'+id+'\" data-pid=\"'+id+'\" data-pp=\"cat\">'+S.prod.cats.map(c=>'<option value=\"'+esc(c.id)+'\"'+(p.cat===c.id?' selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select>','full')\n    +fld('amount',L('Вес или объём единицы','Birlik ogʻirligi yoki hajmi'),inp('amount','number',p.amount||0,' inputmode=\"decimal\" step=\"any\" min=\"0\"'))\n    +fld('unit',L('Единица','Birlik'),'<select id=\"punit-'+id+'\" data-pid=\"'+id+'\" data-pp=\"unit\">'+UNIT_IDS.map(u=>'<option value=\"'+u+'\"'+(p.unit===u?' selected':'')+'>'+esc(unitName(u))+'</option>').join('')+'</select>')\n    +fld('price',L('Цена за единицу, сум','Birlik narxi, soʻm'),inp('price','number',p.price||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +fld('tag',L('Метка','Belgi'),'<select id=\"ptag-'+id+'\" data-pid=\"'+id+'\" data-pp=\"tag\"><option value=\"\"'+(!p.tag?' selected':'')+'>'+L('Без метки','Belgisiz')+'</option><option value=\"sale\"'+(p.tag==='sale'?' selected':'')+'>'+tagName('sale')+'</option><option value=\"new\"'+(p.tag==='new'?' selected':'')+'>'+tagName('new')+'</option></select>')\n    +fld('old',L('Старая цена для акции, сум','Aksiya uchun eski narx, soʻm'),inp('old','number',p.old||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +'<div class=\"avail\"><label class=\"chk\"><input type=\"checkbox\" data-pid=\"'+id+'\" data-pp=\"on\"'+(p.on!==false?' checked':'')+'> '+L('В наличии','Mavjud')+'</label></div>'\n    +tiersEditHTML(p)\n    +fld('blk',L('Штук в блоке (0 — нет блока)','Blokda necha dona (0 — blok yoʻq)'),inp('blk','number',p.blk||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +fld('box',L('Штук в коробке (0 — нет коробки)','Qutida necha dona (0 — quti yoʻq)'),inp('box','number',p.box||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +'<div class=\"full unit\" style=\"margin:0\">'+L('Блок и коробка — для удобства: цена и остаток всегда считаются в штуках. Если указать, у клиента появятся кнопки «+ блок» и «+ коробка», а в заказах будет видно, сколько это коробок. Допустимо от 2 до 500 штук.','Blok va quti — qulaylik uchun: narx va qoldiq doim donada hisoblanadi. Koʻrsatilsa, mijozda «+ blok» va «+ quti» tugmalari paydo boʻladi, buyurtmalarda esa necha quti ekani koʻrinadi. 2 dan 500 donagacha.')+'</div>'\n    +(S.stk[p.id]?'<div class=\"full unit\" style=\"margin:0\">'+L('Ведётся учёт остатка: свободно '+num(stkAvail(S.stk[p.id]))+' шт. Меняется на вкладке «Остатки». Когда свободного нет, товар закрывается сам.','Qoldiq hisobi yuritiladi: boʻsh '+num(stkAvail(S.stk[p.id]))+' dona. «Qoldiq» boʻlimida oʻzgartiriladi. Boʻsh qoldiq boʻlmasa, mahsulot oʻzi yopiladi.')+'</div>':'')\n    +'<div class=\"full pact\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmove\" data-id=\"'+id+'\" data-d=\"-1\" aria-label=\"'+esc(L('Выше','Yuqoriga'))+'\">▲</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"pmove\" data-id=\"'+id+'\" data-d=\"1\" aria-label=\"'+esc(L('Ниже','Pastga'))+'\">▼</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"pdel\" data-id=\"'+id+'\">'+(S.cd===p.id?L('Точно удалить?','Aniq oʻchirilsinmi?'):L('Удалить товар','Mahsulotni oʻchirish'))+'</button></div>'\n    +'</div></div>';\n}\n/* ---------- прайс из Excel ---------- */\nconst IMP_F={price:['цена','narx'],name:['название','nomi'],uz:['название (узб.)','nomi (uz)'],desc:['описание','tavsif'],descUz:['описание (узб.)','tavsif (uz)'],cat:['категория','kategoriya'],amount:['вес','ogʻirlik'],unit:['единица','birlik'],on:['в наличии','mavjud'],tag:['метка','belgi'],old:['старая цена','eski narx']};\nfunction impVal(k,v){\n  if(k==='price'||k==='old')return v?num(v):'—';\n  if(k==='on')return v?L('да','ha'):L('нет','yoʻq');\n  if(k==='tag')return v?tagName(v):L('нет','yoʻq');\n  if(k==='unit')return unitName(v);\n  if(k==='amount')return amountStr(v);\n  return v===''||v==null?'—':String(v).slice(0,40);\n}\nfunction impWhy(w){return {\n  not_xlsx:L('Это не файл Excel (.xlsx). Откройте прайс в Excel и сохраните как «Книга Excel (*.xlsx)».','Bu Excel (.xlsx) fayli emas. Prays-listni Excelda ochib, «Excel Workbook (*.xlsx)» sifatida saqlang.'),\n  no_header:L('Не нашёл колонки «Название» и «Цена» в первых строках. Проверьте заголовки.','Birinchi qatorlarda «Название» va «Цена» ustunlari topilmadi. Sarlavhalarni tekshiring.'),\n  too_big:L('Файл слишком большой (до 1 МБ).','Fayl juda katta (1 MB gacha).')\n}[w]||L('Не удалось прочитать файл.','Faylni oʻqib boʻlmadi.')}\nfunction impCardHTML(){\n  const im=S.imp;\n  let h='<div class=\"card\"><h3>'+L('Прайс из Excel','Excel prays-listi')+'</h3><div class=\"unit\">'+L('Выгрузите каталог в Excel, поправьте цены и загрузите файл обратно. Перед применением вы увидите, что изменится. Ничего не удаляется, фото и остатки не меняются.','Katalogni Excelga yuklab oling, narxlarni tuzating va faylni qaytarib yuklang. Qoʻllashdan oldin nima oʻzgarishini koʻrasiz. Hech narsa oʻchirilmaydi, rasm va qoldiqlar oʻzgarmaydi.')+'</div>'\n    +'<div class=\"row-btns\">'+xbtn('catalog')\n    +'<label class=\"btn ghost sm'+(S.impBusy?' dis':'')+'\" for=\"imp-file\">'+(im&&im.busy?L('Читаем файл…','Fayl oʻqilmoqda…'):L('Загрузить прайс','Prays yuklash'))+'</label><input type=\"file\" class=\"sr\" id=\"imp-file\" accept=\".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\" data-imp=\"1\"'+(S.impBusy?' disabled':'')+'></div>';\n  if(im&&im.res){\n    const r=im.res,sm=r.summary;\n    h+='<div class=\"impsum\" id=\"impsum\"><span>'+L('Добавится','Qoʻshiladi')+': <b>'+sm.added+'</b></span><span>'+L('Изменится','Oʻzgaradi')+': <b>'+sm.updated+'</b></span><span>'+L('Без изменений','Oʻzgarishsiz')+': <b>'+sm.same+'</b></span>'+(sm.errors?'<span style=\"color:var(--bad)\">'+L('Ошибок','Xatolar')+': <b>'+sm.errors+'</b></span>':'')+'</div>';\n    if(sm.newCats&&sm.newCats.length)h+='<div class=\"unit\">'+L('Новые категории: ','Yangi kategoriyalar: ')+esc(sm.newCats.join(', '))+'</div>';\n    h+=r.changes.map(c=>{\n      const f=c.fields.map(x=>c.kind==='add'?(x.k==='price'?L('цена ','narx ')+impVal('price',x.to):''):esc(L(IMP_F[x.k][0],IMP_F[x.k][1]))+': '+esc(impVal(x.k,x.from))+' → '+esc(impVal(x.k,x.to))).filter(Boolean).join('; ');\n      return '<div class=\"chg\"><b>'+(c.kind==='add'?'+ ':'')+esc(c.name)+'</b><small>'+(c.kind==='add'?esc(L('новый товар, ','yangi mahsulot, ')+(c.cat?c.cat+', ':''))+f:f)+'</small></div>';\n    }).join('');\n    if(r.moreChanges)h+='<div class=\"unit\">'+L('…и ещё изменений: ','…va yana oʻzgarishlar: ')+r.moreChanges+'</div>';\n    if(r.errors.length)h+='<div class=\"unit\" style=\"margin-top:8px\"><b>'+L('Эти строки не будут загружены:','Bu qatorlar yuklanmaydi:')+'</b></div>'+r.errors.map(e=>'<div class=\"chg bad\"><small>'+L('строка ','qator ')+e.row+': '+esc(e.msg)+'</small></div>').join('')+(r.moreErrors?'<div class=\"unit\">'+L('…и ещё ошибок: ','…va yana xatolar: ')+r.moreErrors+'</div>':'');\n    const can=sm.added+sm.updated>0;\n    h+=(can?'':'<div class=\"note\" style=\"margin-top:8px\">'+L('В файле нет изменений для каталога.','Faylda katalog uchun oʻzgarishlar yoʻq.')+'</div>')\n      +'<div class=\"row-btns\" style=\"margin-top:10px\">'+(can?'<button type=\"button\" class=\"btn sm\" id=\"impapply\" data-act=\"impapply\"'+(S.impBusy?' disabled':'')+'>'+L('Применить изменения','Oʻzgarishlarni qoʻllash')+'</button>':'')+'<button type=\"button\" class=\"btn ghost sm\" data-act=\"impcancel\"'+(S.impBusy?' disabled':'')+'>'+(can?L('Отмена','Bekor qilish'):L('Закрыть','Yopish'))+'</button></div>';\n  }\n  return h+'</div>';\n}\nasync function importFile(file){\n  if(S.impBusy||!S.admin)return;\n  if(file.size>1000000){toast(impWhy('too_big'));return}\n  S.impBusy=true;S.imp={busy:true};paintSeller();\n  await flushSave();   // сначала уходят несохранённые правки каталога\n  let bytes;\n  try{bytes=new Uint8Array(await file.arrayBuffer())}catch(e){S.impBusy=false;S.imp=null;paintSeller();toast(impWhy(''));return}\n  const r=await apiBin('POST','/api/admin/import',bytes,'application/octet-stream');\n  S.impBusy=false;\n  if(!r.ok||!r.data||!r.data.summary){S.imp=null;paintSeller();toast(r.data&&r.data.why?impWhy(r.data.why):L('Не удалось прочитать файл. Проверьте соединение.','Faylni oʻqib boʻlmadi. Ulanishni tekshiring.'));return}\n  S.imp={bytes,res:r.data};paintSeller();\n  try{document.getElementById('impsum').scrollIntoView({block:'center'})}catch(e){}\n}\nasync function impApply(){\n  if(S.impBusy||!S.imp||!S.imp.bytes)return;\n  S.impBusy=true;paintSeller();\n  await flushSave();\n  const r=await apiBin('POST','/api/admin/import?apply=1',S.imp.bytes,'application/octet-stream');\n  S.impBusy=false;\n  if(!r.ok||!r.data||!r.data.summary){paintSeller();toast(L('Не удалось применить прайс. Проверьте соединение и попробуйте ещё раз.','Prays qoʻllanmadi. Ulanishni tekshirib, qayta urining.'));return}\n  const sm=r.data.summary;\n  if(r.data.prod){S.prod=normProd(r.data.prod);applyStk();pruneCart()}\n  S.imp=null;paintSeller();renderNav();\n  toast(L('Готово: добавлено '+sm.added+', изменено '+sm.updated+'.','Tayyor: '+sm.added+' ta qoʻshildi, '+sm.updated+' ta oʻzgardi.'));\n}\nfunction prodHTML(){\n  const P=S.prod;\n  if(S.pfilter!=='all'&&!P.cats.some(c=>c.id===S.pfilter))S.pfilter='all';\n  const pend=P.items.filter(inModGroup);\n  const list=P.items.filter(p=>!inModGroup(p)&&(S.pfilter==='all'||p.cat===S.pfilter));\n  let h='<div class=\"note\" style=\"margin-bottom:14px\">'+L('Каталог товаров. Сначала создайте категории, затем добавляйте товары: название, описание, вес, цену и фото. Клиенты видят изменения сразу. Фото сжимается на телефоне. Снимите галочку «В наличии», если товара нет: он останется в каталоге серым.','Mahsulotlar katalogi. Avval kategoriyalar yarating, keyin mahsulotlar qoʻshing: nomi, tavsifi, ogʻirligi, narxi va rasmi. Mijozlar oʻzgarishlarni darhol koʻradi. Rasm telefonda siqiladi. Mahsulot boʻlmasa, «Mavjud» belgisini olib tashlang: u katalogda kulrang boʻlib qoladi.')+'</div>'\n    +'<div class=\"savebar\" id=\"savebar\"></div>';\n  h+=impCardHTML();\n  h+='<div class=\"card\"><h3>'+L('Категории','Kategoriyalar')+'</h3><div class=\"unit\">'+L('Название по-русски и по-узбекски. Удалить можно пустую категорию.','Ruscha va oʻzbekcha nomi. Faqat boʻsh kategoriyani oʻchirish mumkin.')+'</div>';\n  P.cats.forEach(c=>{\n    const id=esc(c.id);\n    h+='<div class=\"crow\"><input type=\"text\" data-cid=\"'+id+'\" data-cp=\"name\" value=\"'+esc(c.name)+'\" maxlength=\"40\" aria-label=\"'+esc(L('Название категории','Kategoriya nomi'))+'\"><input type=\"text\" data-cid=\"'+id+'\" data-cp=\"uz\" value=\"'+esc(c.uz||'')+'\" maxlength=\"40\" placeholder=\"Oʻzbekcha nomi\" aria-label=\"Oʻzbekcha nomi\"><button type=\"button\" class=\"x\" data-act=\"cdel\" data-id=\"'+id+'\" aria-label=\"'+esc(L('Удалить категорию','Kategoriyani oʻchirish'))+'\">×</button></div>';\n  });\n  h+='<div style=\"margin-top:8px\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"cadd\">'+L('+ Добавить категорию','+ Kategoriya qoʻshish')+'</button></div></div>';\n  h+='<div class=\"card\"><h3>'+L('Товары','Mahsulotlar')+' · '+P.items.length+'</h3>';\n  h+='<div id=\"mban\">'+modBanInner()+'</div>';\n  if(pend.length)h+='<div class=\"mgroup\"><h4>'+L('На проверке','Tekshiruvda')+' · '+pend.length+'</h4>'+pend.map(modCard).join('')+'</div>';\n  if(P.cats.length>1)h+='<div class=\"filters\" style=\"margin:8px 0 4px\">'+[['all',L('Все','Barchasi')]].concat(P.cats.map(c=>[c.id,c.name])).map(c=>'<button type=\"button\" class=\"chip\" data-act=\"pfilter\" data-id=\"'+esc(c[0])+'\" aria-pressed=\"'+(S.pfilter===c[0])+'\">'+esc(c[1])+'</button>').join('')+'</div>';\n  if(!list.length)h+='<div class=\"unit\" style=\"padding:10px 0\">'+(P.items.length-pend.length?L('В этой категории пока ничего нет.','Bu kategoriyada hozircha hech narsa yoʻq.'):L('Товаров пока нет. Нажмите «Добавить товар».','Mahsulotlar hozircha yoʻq. «Mahsulot qoʻshish» tugmasini bosing.'))+'</div>';\n  list.forEach(p=>{h+=prodRow(p)});\n  h+='<div style=\"margin-top:10px\"><button type=\"button\" class=\"btn\" data-act=\"pnew\">'+L('+ Добавить товар','+ Mahsulot qoʻshish')+'</button></div></div>';\n  return h;\n}\n/* ---------- seller: остатки ---------- */\n/* состояние учёта товара: none (не ведётся), ok, low (мало), out (свободного нет) */\nfunction stState(p){\n  const s=S.stk[p.id];\n  if(!s)return 'none';\n  const a=stkAvail(s);\n  return a===0?'out':(s.low>0&&a<=s.low?'low':'ok');\n}\n/* переносит остатки в каталог на экране, чтобы продавец видел витрину так же, как клиент */\nfunction applyStk(){\n  S.prod.items.forEach(p=>{\n    const v=stkPublic(S.stk[p.id],MAX_QTY);\n    delete p.av;delete p.lw;\n    if(v){p.av=v.av;if(v.lw)p.lw=1}\n  });\n}\nfunction statsHTML(){\n  const c={none:0,ok:0,low:0,out:0};\n  S.prod.items.forEach(p=>{c[stState(p)]++});\n  const st=(lab,v,hot)=>'<div class=\"stat'+(hot?' hot':'')+'\"><small>'+lab+'</small><b>'+v+'</b></div>';\n  return st(L('Под учётом','Hisobda'),c.ok+c.low+c.out)+st(L('Без учёта','Hisobsiz'),c.none)+st(L('Заканчивается','Tugayapti'),c.low,c.low>0)+st(L('Нет свободного','Boʻshi yoʻq'),c.out,c.out>0);\n}\n/* выбор «шт / коробка / блок» для прихода, если у товара есть упаковки */\nfunction stockUnitSel(p){\n  const ks=['blk','box'].filter(k=>packSize(p,k));\n  if(!ks.length)return '';\n  return '<select id=\"su-'+esc(p.id)+'\" aria-label=\"'+esc(L('В чём вводите количество','Miqdor nimada kiritiladi'))+'\"'+(S.sbusy[p.id]?' disabled':'')+'><option value=\"pc\">'+L('шт','dona')+'</option>'+ks.map(k=>'<option value=\"'+k+'\">'+esc(packWord(k))+' ('+packSize(p,k)+' '+pcsWord()+')</option>').join('')+'</select>';\n}\nconst stockUnit=id=>{const el=document.getElementById('su-'+id);return el&&el.value&&el.value!=='pc'?el.value:''};\nconst pkSmall=(p,n)=>{const t=packText(p,n);return t?'<small class=\"pk\">'+esc(t)+'</small>':''};\nfunction stockRowHTML(p){\n  const id=esc(p.id),s=S.stk[p.id],st=stState(p),dis=S.sbusy[p.id]?' disabled':'',w=weightLabel(p);\n  const cat=S.prod.cats.find(c=>c.id===p.cat);\n  const pill=st==='none'?'<span class=\"st mute\">'+L('Без учёта','Hisobsiz')+'</span>'\n    :st==='out'?'<span class=\"st bad\">'+L('Нет свободного','Boʻshi yoʻq')+'</span>'\n    :st==='low'?'<span class=\"st warn\">'+L('Заканчивается','Tugayapti')+'</span>'\n    :'<span class=\"st ok\">'+L('В наличии','Mavjud')+'</span>';\n  const head='<div class=\"sh\"><div class=\"sn\"><b>'+esc(p.name)+'</b><small>'+(w?esc(w):'')+(w&&cat?' · ':'')+(cat?esc(cat.name):'')+'</small></div>'+pill+'</div>';\n  const numIn=(k,ph,aria,val)=>'<input type=\"number\" id=\"'+k+'-'+id+'\" inputmode=\"numeric\" min=\"0\" max=\"1000000\" step=\"1\"'+(k==='sl'?' data-sl=\"'+id+'\"':'')+' value=\"'+val+'\" placeholder=\"'+esc(ph)+'\" aria-label=\"'+esc(aria)+'\"'+dis+'>';\n  const lowIn='<div class=\"sth\"><label for=\"sl-'+id+'\">'+L('Предупредить, когда меньше','Bundan kam qolsa ogohlantirish')+'</label>'+numIn('sl','0',L('Порог «мало»','«Oz qoldi» chegarasi'),s?s.low:'')+'</div>';\n  if(!s){\n    return '<div class=\"srow\" id=\"srow-'+id+'\">'+head\n      +'<div class=\"sact'+(packSize(p,'blk')||packSize(p,'box')?' haspk':'')+'\">'+numIn('sn',L('Сколько на складе','Omborda qancha'),L('Сколько сейчас на складе','Hozir omborda qancha'),'')+stockUnitSel(p)\n      +'<button type=\"button\" class=\"btn sm\" data-act=\"sstart\" data-id=\"'+id+'\"'+dis+'>'+L('Начать учёт','Hisobni boshlash')+'</button></div>'+lowIn+'</div>';\n  }\n  return '<div class=\"srow\" id=\"srow-'+id+'\">'+head\n    +'<div class=\"snum\"><div><small>'+L('На складе','Omborda')+'</small><b>'+num(s.q)+'</b>'+pkSmall(p,s.q)+'</div><div><small>'+L('В заказах','Buyurtmalarda')+'</small><b>'+num(s.r)+'</b>'+pkSmall(p,s.r)+'</div><div class=\"fr '+st+'\"><small>'+L('Свободно','Boʻsh')+'</small><b>'+num(stkAvail(s))+'</b>'+pkSmall(p,stkAvail(s))+'</div></div>'\n    +'<div class=\"sact'+(packSize(p,'blk')||packSize(p,'box')?' haspk':'')+'\">'+numIn('sn',L('Количество','Miqdori'),L('Количество','Miqdori'),'')+stockUnitSel(p)\n    +'<button type=\"button\" class=\"btn sm\" data-act=\"sin\" data-id=\"'+id+'\"'+dis+'>'+L('+ Приход','+ Kirim')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sset\" data-id=\"'+id+'\"'+dis+'>'+L('Задать остаток','Qoldiqni belgilash')+'</button></div>'\n    +lowIn\n    +'<div><button type=\"button\" class=\"btn ghost sm\" data-act=\"soff\" data-id=\"'+id+'\"'+dis+'>'+(S.sc===p.id?L('Точно отключить учёт?','Hisob oʻchirilsinmi?'):L('Отключить учёт','Hisobni oʻchirish'))+'</button></div></div>';\n}\nconst JR_KIND={start:['Начат учёт','Hisob boshlandi'],in:['Приход','Kirim'],fix:['Исправление остатка','Qoldiq tuzatildi'],out:['Списано по заказу','Buyurtma boʻyicha chiqim'],off:['Учёт отключён','Hisob oʻchirildi']};\nfunction jrDate(t){\n  const d=new Date(t);\n  if(isNaN(d))return '';\n  if(LANG==='uz')return d.getDate()+'-'+UZ_MO[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes());\n  return d.toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});\n}\nfunction jrHTML(){\n  if(!S.jr.length)return '<div class=\"unit\" style=\"padding:8px 0\">'+L('Записей пока нет.','Hozircha yozuv yoʻq.')+'</div>';\n  return S.jr.slice(0,60).map(x=>{\n    const k=JR_KIND[x.kind]||['',''],d=Number(x.d)||0;\n    const dd=x.kind==='off'?'—<small>'+L('было ','boʻlgan ')+num(x.q)+'</small>':(d>0?'+'+num(d):d<0?'−'+num(-d):'0')+'<small>'+L('стало ','boʻldi ')+num(x.q)+'</small>';\n    return '<div class=\"jrow\"><div class=\"jn\"><b>'+esc(x.name)+'</b><small>'+esc(L(k[0],k[1]))+(x.ref?' '+esc(x.ref):'')+' · '+esc(jrDate(x.t))+(x.by?' · '+esc(x.by):'')+'</small></div><div class=\"jd'+(x.kind!=='off'&&d>0?' plus':x.kind!=='off'&&d<0?' minus':'')+'\">'+dd+'</div></div>';\n  }).join('');\n}\nfunction stockHTML(){\n  if(!S.stkLoaded)return '<div class=\"empty\"><b>'+L('Загружаем остатки','Qoldiqlar yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  if(!S.prod.items.length)return '<div class=\"empty\"><b>'+L('Товаров пока нет','Mahsulotlar hozircha yoʻq')+'</b>'+L('Сначала добавьте товары на вкладке «Каталог».','Avval «Katalog» boʻlimida mahsulot qoʻshing.')+'</div>';\n  const fl=[['all',L('Все','Hammasi')],['low',L('Заканчивается','Tugayapti')],['out',L('Нет свободного','Boʻshi yoʻq')],['none',L('Без учёта','Hisobsiz')]];\n  const list=S.prod.items.filter(p=>{const s=stState(p);return S.sfilter==='all'||(S.sfilter==='low'?(s==='low'||s==='out'):s===S.sfilter)});\n  const hasPk=S.prod.items.some(p=>packSize(p,'box')||packSize(p,'blk'));\n  let h='<div class=\"note\" style=\"margin-bottom:14px\">'+(hasPk?L('Если у товара указан блок или коробка, приход и остаток можно вводить ими: выберите единицу рядом с полем, программа пересчитает в штуки. ','Agar mahsulotda blok yoki quti koʻrsatilgan boʻlsa, kirim va qoldiqni ular bilan kiritish mumkin: maydon yonida birlikni tanlang, dastur donaga hisoblab beradi. '):'')+L('Укажите, сколько единиц товара на складе (мешков, коробок, упаковок — как товар продаётся в каталоге). Заказ откладывает товар, при «Выдан» или «Доставлен» он списывается, при отмене возвращается. Когда свободного остаётся меньше порога, клиенты видят «Мало (осталось N)», а вам приходит сообщение в Telegram. Когда свободного нет, товар в каталоге становится серым сам.',\n    'Omborda necha birlik (qop, quti, qadoq — katalogda qanday sotilsa) borligini kiriting. Buyurtma mahsulotni band qiladi, «Topshirildi» yoki «Yetkazildi» boʻlganda ombordan chiqariladi, bekor qilinsa qaytadi. Boʻsh qoldiq chegaradan kam boʻlsa, mijozlar «Oz qoldi (N ta)» deb koʻradi, sizga Telegramda xabar keladi. Boʻsh qoldiq boʻlmasa, mahsulot katalogda oʻzi kulrang boʻladi.')+'</div>'\n    +'<div class=\"stats\" id=\"sstats\">'+statsHTML()+'</div>'\n    +'<div class=\"filters\">'+fl.map(f=>'<button type=\"button\" class=\"chip\" data-act=\"sfilter\" data-v=\"'+f[0]+'\" aria-pressed=\"'+(S.sfilter===f[0])+'\">'+f[1]+'</button>').join('')+'</div>'\n    +'<div class=\"card\">'+(list.length?list.map(stockRowHTML).join(''):'<div class=\"unit\" style=\"padding:10px 0\">'+L('В этом списке пусто.','Bu roʻyxat boʻsh.')+'</div>')+'</div>'\n    +'<div class=\"card\"><h3>'+L('Журнал движений','Harakatlar jurnali')+'</h3><div class=\"unit\">'+L('Приходы, исправления и списания по выданным заказам. Показаны последние записи.','Kirimlar, tuzatishlar va topshirilgan buyurtmalar boʻyicha chiqimlar. Oxirgi yozuvlar koʻrsatilgan.')+'</div>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sjr\">'+(S.jrOpen?L('Скрыть журнал','Jurnalni yashirish'):L('Показать журнал','Jurnalni koʻrsatish'))+'</button>'\n    +'<div id=\"jrbody\">'+(S.jrOpen?jrHTML():'')+'</div></div>';\n  return h;\n}\nfunction paintStock(){\n  const b=$('#sbody');\n  if(b&&S.view==='seller'&&S.sellerTab==='stock')b.innerHTML=stockHTML();\n}\nfunction paintStockRow(id){\n  const p=S.prod.items.find(x=>x.id===id),el=document.getElementById('srow-'+id);\n  if(p&&el)el.outerHTML=stockRowHTML(p);\n  const st=$('#sstats');if(st)st.innerHTML=statsHTML();\n  paintTabs();\n}\nasync function loadStock(){\n  if(!S.admin)return;\n  const r=await api('GET','/api/admin/stock');\n  if(!r.ok||!r.data||!r.data.stk)return;\n  const first=!S.stkLoaded;\n  S.stkLoaded=true;\n  if(!first&&JSON.stringify(r.data.stk)===JSON.stringify(S.stk))return;\n  S.stk=r.data.stk;applyStk();\n  if(S.view!=='seller')return;\n  paintTabs();\n  if(S.sellerTab==='stock'){\n    const ae=document.activeElement,b=$('#sbody');\n    if(ae&&b&&b.contains(ae)&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))return;   // не мешаем, пока продавец вводит число\n    paintStock();\n  }\n}\nasync function loadJournal(){\n  const r=await api('GET','/api/admin/journal');\n  if(r.ok&&r.data&&Array.isArray(r.data.jr))S.jr=r.data.jr;\n  const el=$('#jrbody');if(el&&S.jrOpen)el.innerHTML=jrHTML();\n}\n/* целое число из поля; при ошибке подсказывает и возвращает null */\nfunction stockNum(id,k,min){\n  const el=document.getElementById(k+'-'+id),raw=el?String(el.value).trim():'';\n  if(raw===''){toast(L('Введите количество','Miqdorni kiriting'));if(el)el.focus();return null}\n  const n=Number(raw);\n  if(!Number.isInteger(n)||n<min||n>1000000){\n    toast(min>0?L('Введите целое число от 1','1 dan boshlab butun son kiriting'):L('Введите целое число, 0 или больше','Butun son kiriting (0 yoki koʻp)'));\n    if(el)el.focus();\n    return null;\n  }\n  return n;\n}\n/* soft: порог сохраняется тихо, строку не перерисовываем, пока продавец печатает в ней другое число */\nasync function stockDo(id,body,okMsg,soft){\n  if(S.sbusy[id]||!S.auth||!S.admin)return;\n  S.sbusy[id]=true;\n  if(!soft)paintStockRow(id);\n  await flushSave();   // товар должен уже быть на сервере\n  const r=await api('POST','/api/admin/stock',Object.assign({id:id},body));\n  delete S.sbusy[id];\n  if(r.ok&&r.data&&r.data.stk){S.stk=r.data.stk;S.stkLoaded=true;applyStk();toast(okMsg)}\n  else toast(r.status===404?L('Такого товара уже нет','Bunday mahsulot endi yoʻq'):L('Не удалось сохранить. Проверьте соединение.','Saqlab boʻlmadi. Ulanishni tekshiring.'));\n  const row=document.getElementById('srow-'+id),ae=document.activeElement;\n  if(!soft||!(row&&ae&&row.contains(ae)))paintStockRow(id);\n  else{const st=$('#sstats');if(st)st.innerHTML=statsHTML();paintTabs()}\n  if(S.jrOpen)loadJournal();\n}\n\n/* ---------- отчёты (продавец) ---------- */\nconst RP_DAYS=[7,30,90,365];\nconst MO_S_RU=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'],MO_S_UZ=['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'];\nconst MO_F_RU=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];\nconst dShort=d=>{const m=Number(d.slice(5,7))-1,n=Number(d.slice(8,10));return LANG==='uz'?n+'-'+UZ_MO[m]:n+' '+MO_S_RU[m]};\nconst fDay=d=>d.slice(8,10)+'.'+d.slice(5,7)+'.'+d.slice(0,4);\nconst mFull=m=>{const i=Number(m.slice(5,7))-1;return (LANG==='uz'?UZ_MO[i]:MO_F_RU[i])+' '+m.slice(0,4)};\nconst mShort=m=>{const i=Number(m.slice(5,7))-1;return LANG==='uz'?MO_S_UZ[i]:MO_S_RU[i]};\nconst rpRange=d=>({7:L('7 дней','7 kun'),30:L('30 дней','30 kun'),90:L('3 месяца','3 oy'),365:L('Год','Yil')})[d];\nfunction ruPl(n,a){const m=n%100,k=n%10;return m>=11&&m<=14?a[2]:k===1?a[0]:k>=2&&k<=4?a[1]:a[2]}\nconst ordTxt=n=>LANG==='uz'?n+' ta buyurtma':n+' '+ruPl(n,['заказ','заказа','заказов']);\n/* подписи на оси: 1,2 млн / 500 тыс */\nfunction cCompact(v){\n  v=Math.round(v);\n  const f=x=>String(Math.round(x*10)/10).replace('.',',');\n  return v>=1e9?f(v/1e9)+' '+L('млрд','mlrd'):v>=1e6?f(v/1e6)+' '+L('млн','mln'):v>=1e3?f(v/1e3)+' '+L('тыс','ming'):String(v);\n}\n/* верх шкалы: круглое число, чтобы половина тоже была круглой */\nfunction niceMax(v){\n  if(!(v>0))return 1;\n  const pow=Math.pow(10,Math.floor(Math.log10(v))),m=v/pow;\n  return [1,2,4,6,8,10].find(x=>m<=x+1e-9)*pow;\n}\n/* столбцы: до месяца — дни, три месяца — недели, год — месяцы */\nfunction repBuckets(r){\n  const ser=r.series,sum=(g,k)=>g.reduce((a,x)=>a+x[k],0);\n  if(r.days<=30)return ser.map(x=>({n:x.n,sum:x.sum,full:dShort(x.d),ax:dShort(x.d)}));\n  const out=[];\n  if(r.days<=90){\n    for(let i=0;i<ser.length;i+=7){const g=ser.slice(i,i+7);out.push({n:sum(g,'n'),sum:sum(g,'sum'),full:dShort(g[0].d)+(g.length>1?' – '+dShort(g[g.length-1].d):''),ax:dShort(g[0].d)})}\n    return out;\n  }\n  const mp=new Map();\n  ser.forEach(x=>{const k=x.d.slice(0,7),g=mp.get(k)||{m:k,n:0,sum:0};g.n+=x.n;g.sum+=x.sum;mp.set(k,g)});\n  mp.forEach(g=>out.push({n:g.n,sum:g.sum,full:mFull(g.m),ax:mShort(g.m)}));\n  return out;\n}\nconst readTxt=b=>'<b>'+esc(b.full)+'</b> · '+esc(money(b.sum))+' · '+esc(ordTxt(b.n));\nfunction readHTML(bs,i){\n  if(i>=0&&bs[i])return readTxt(bs[i]);\n  const mx=Math.max(0,...bs.map(b=>b.sum));\n  if(!(mx>0))return '';\n  return esc(L('Пик: ','Eng yuqori: '))+readTxt(bs[bs.findIndex(b=>b.sum===mx)]);\n}\n/* подсветка столбца и строка со значением (наведение, касание, нажатие) без перерисовки */\nfunction repShow(i){\n  const r=S.rep.data;if(!r)return;\n  document.querySelectorAll('.rcol').forEach((c,k)=>c.setAttribute('aria-pressed',String(k===i)));\n  const el=$('#rread');if(el)el.innerHTML=readHTML(repBuckets(r),i);\n}\nfunction repIdx(e){\n  const box=e.target&&e.target.closest?e.target.closest('.rcols'):null;\n  if(!box||!S.rep.data)return -1;\n  const rc=box.getBoundingClientRect(),n=box.children.length;\n  if(!rc.width||!n)return -1;\n  return Math.max(0,Math.min(n-1,Math.floor((e.clientX-rc.left)/rc.width*n)));\n}\ndocument.addEventListener('pointermove',e=>{\n  const i=repIdx(e);\n  if(i<0||i===S.rep.hov)return;\n  S.rep.hov=i;repShow(i);\n  if(e.pointerType==='touch')S.rep.drag=true;\n});\ndocument.addEventListener('pointerup',e=>{\n  if(e.pointerType==='touch'&&S.rep.drag){S.rep.drag=false;S.rep.sel=S.rep.hov;S.rep.skip=Date.now()}\n});\ndocument.addEventListener('pointerout',e=>{\n  if(e.pointerType!=='mouse'||!e.target.closest||!e.target.closest('.rcols'))return;\n  if(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.rcols'))return;\n  S.rep.hov=-1;repShow(S.rep.sel);\n});\nfunction chartHTML(r){\n  const bs=repBuckets(r),mx=Math.max(0,...bs.map(b=>b.sum)),top=niceMax(mx),ticks=[top,top/2,0];\n  const cols=bs.map((b,i)=>'<button type=\"button\" class=\"rcol\" data-act=\"rsel\" data-i=\"'+i+'\" aria-pressed=\"'+(S.rep.sel===i)+'\" aria-label=\"'+esc(b.full+': '+money(b.sum)+', '+ordTxt(b.n))+'\"><i style=\"height:'+(b.sum>0?Math.max(b.sum/top*100,1.5):0)+'%\"></i></button>').join('');\n  const ax=bs.length>2?[bs[0],bs[Math.floor((bs.length-1)/2)],bs[bs.length-1]]:bs;\n  return '<div class=\"rread\" id=\"rread\" aria-live=\"polite\">'+readHTML(bs,S.rep.sel)+'</div>'\n    +'<div class=\"rchart\"><div class=\"ryax\" aria-hidden=\"true\">'+ticks.map(v=>'<span style=\"bottom:'+(v/top*100)+'%\">'+esc(cCompact(v))+'</span>').join('')+'</div>'\n    +'<div class=\"rplot\">'+ticks.map(v=>'<div class=\"rgrid\" style=\"bottom:'+(v/top*100)+'%\"></div>').join('')+'<div class=\"rcols\" role=\"group\" aria-label=\"'+esc(L('Выручка по периодам','Davrlar boʻyicha tushum'))+'\">'+cols+'</div></div></div>'\n    +'<div class=\"rxax\" aria-hidden=\"true\">'+ax.map(b=>'<span>'+esc(b.ax)+'</span>').join('')+'</div>'\n    +'<p class=\"rnote\">'+L('Нажмите на столбец или проведите по графику, чтобы увидеть сумму и число заказов.','Summa va buyurtmalar sonini koʻrish uchun ustunni bosing yoki grafik boʻylab suring.')+'</p>'\n    +'<button type=\"button\" class=\"btn ghost sm rgap\" data-act=\"rtab\" aria-expanded=\"'+S.rep.tab+'\">'+(S.rep.tab?L('Скрыть таблицу','Jadvalni yashirish'):L('Показать таблицей','Jadval sifatida koʻrsatish'))+'</button>'\n    +(S.rep.tab?'<div class=\"rtab\"><table><thead><tr><th>'+L('Период','Davr')+'</th><th>'+L('Заказов','Buyurtma')+'</th><th>'+L('Выручка, сум','Tushum, soʻm')+'</th></tr></thead><tbody>'+bs.map(b=>'<tr><td>'+esc(b.full)+'</td><td>'+b.n+'</td><td>'+num(b.sum)+'</td></tr>').join('')+'</tbody></table></div>':'');\n}\nfunction deltaHTML(cur,prev,r){\n  if(!r.prev)return '';\n  if(!(prev>0))return cur>0?'<small class=\"dl flat\">'+L('в прошлом периоде продаж не было','oldingi davrda sotuv boʻlmagan')+'</small>':'';\n  const p=Math.round((cur-prev)/prev*100),cls=p>0?'up':p<0?'down':'flat',ar=p>0?'▲':p<0?'▼':'•';\n  return '<small class=\"dl '+cls+'\">'+ar+' '+(p>0?'+':'')+p+'% '+L('к прошлому периоду','oldingi davrga nisbatan')+'</small>';\n}\nfunction rankHTML(rows){\n  const mx=Math.max(1,...rows.map(x=>x.v));\n  return '<div class=\"rlist\">'+rows.map(x=>'<div class=\"rrow\"><div class=\"rl\"><b>'+esc(x.t)+'</b>'+(x.s?'<small>'+esc(x.s)+'</small>':'')+'</div><div class=\"rv\">'+esc(money(x.v))+'</div><div class=\"rbar\" aria-hidden=\"true\"><i style=\"width:'+Math.max(2,x.v/mx*100)+'%\"></i></div></div>').join('')+'</div>';\n}\nfunction buyHTML(r){\n  const b=r.buy;\n  let h='<div class=\"card\"><h3>'+L('Что пора закупать','Nimani sotib olish vaqti')+'</h3><div class=\"unit\">'+L('Только товары, по которым ведётся учёт остатков. Смотрим на продажи за последние '+b.window+' дн. и показываем, на сколько дней хватит свободного остатка. Докупить — чтобы хватило на '+b.cover+' дн.','Faqat qoldiq hisobi yuritiladigan mahsulotlar. Oxirgi '+b.window+' kunlik sotuvga qaraymiz va boʻsh qoldiq necha kunga yetishini koʻrsatamiz. Sotib olish — '+b.cover+' kunga yetishi uchun.')+'</div>';\n  if(!b.list.length)return h+'<div class=\"empty\"><b>'+L('Срочного нет','Shoshilinch narsa yoʻq')+'</b>'+L('Запаса хватает больше чем на '+b.cover+' дн. или продаж по этим товарам ещё не было. Учёт остатков включается на вкладке «Остатки».','Zaxira '+b.cover+' kundan koʻpga yetadi yoki bu mahsulotlar sotilmagan. Qoldiq hisobi «Qoldiq» boʻlimida yoqiladi.')+'</div></div>';\n  h+='<div class=\"rlist\">'+b.list.map(x=>{\n    const p=S.prod.items.find(y=>y.id===x.id),left=Number(x.left)||0,wl=p?weightLabel(p):'';\n    const cls=left<=3?'bad':left<=7?'warn':'info',lab=left<1?L('меньше 1 дня','1 kundan kam'):L('хватит на '+Math.floor(left)+' дн.',Math.floor(left)+' kunga yetadi');\n    const pk=p&&x.need>0?packText(p,x.need):'';\n    return '<div class=\"rbuy\"><div class=\"rh\"><b>'+esc(p?nm(p):x.name)+(wl?' <small>'+esc(wl)+'</small>':'')+'</b><span class=\"st '+cls+'\">'+esc(lab)+'</span></div>'\n      +'<small>'+L('Свободно '+num(x.avail)+' шт, продаётся ≈ '+amountStr(x.daily)+' шт в день','Boʻsh '+num(x.avail)+' dona, kuniga ≈ '+amountStr(x.daily)+' dona sotiladi')+'</small>'\n      +(x.need>0?'<small>'+L('Докупить ≈ '+num(x.need)+' шт','Sotib olish ≈ '+num(x.need)+' dona')+(pk?' ('+esc(pk)+')':'')+'</small>':'')+'</div>';\n  }).join('')+'</div></div>';\n  return h;\n}\n/* Комиссия площадки в отчётах дистрибьютора: сколько он должен площадке за этот и прошлый месяц (видна, если процент больше нуля) */\nfunction commHTML(r){\n  const c=r.comm;\n  if(!c||!(c.pct>0||c.cur.cm>0||c.prev.cm>0))return '';\n  const row=(lab,x)=>'<div class=\"r\"><span>'+esc(lab+' ('+mFull(x.m)+')')+'<small class=\"sub\">'+esc(ordTxt(x.n)+' · '+L('товаров на ','mahsulotlar: ')+money(x.base))+'</small></span><span>'+esc(money(x.cm))+'</span></div>';\n  return '<div class=\"card\"><h3>'+L('Комиссия площадки','Platforma komissiyasi')+'</h3><div class=\"unit\">'\n    +L('Площадка берёт '+fmtPct(c.pct)+'% от суммы товаров (после скидки, без доставки) по выданным заказам. Это сумма, которую вы платите площадке за месяц.','Platforma topshirilgan buyurtmalarda mahsulotlar summasidan (chegirmadan keyin, yetkazib berishsiz) '+fmtPct(c.pct)+'% oladi. Bu siz platformaga oylik toʻlaydigan summa.')\n    +'</div><div class=\"sum\">'+row(L('Этот месяц','Shu oy'),c.cur)+row(L('Прошлый месяц','Oʻtgan oy'),c.prev)+'</div></div>';\n}\nfunction repHTML(){\n  const R=S.rep,r=R.data;\n  let h='<div class=\"filters\">'+RP_DAYS.map(d=>'<button type=\"button\" class=\"chip\" data-act=\"rdays\" data-v=\"'+d+'\" aria-pressed=\"'+(R.days===d)+'\">'+esc(rpRange(d))+'</button>').join('')+'</div>';\n  if(!r||r.days!==R.days){\n    if(R.err)return h+'<div class=\"empty\"><b>'+L('Не удалось загрузить отчёт','Hisobotni yuklab boʻlmadi')+'</b>'+L('Проверьте соединение.','Ulanishni tekshiring.')+'<div style=\"margin-top:10px\"><button type=\"button\" class=\"btn sm\" data-act=\"rretry\">'+L('Повторить','Qayta urinish')+'</button></div></div>';\n    return h+'<div class=\"empty\"><b>'+L('Считаем отчёт','Hisobot tayyorlanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  }\n  h+=commHTML(r);\n  h+='<div class=\"xtools\">'+xbtn('report')+'</div>'\n    +'<p class=\"rnote\" style=\"margin:0 0 4px\">'+L('Период: '+fDay(r.from)+' — '+fDay(r.to)+'. В отчёт попадают заказы со статусом «Выдан» или «Доставлен», по дню завершения.','Davr: '+fDay(r.from)+' — '+fDay(r.to)+'. Hisobotga «Topshirildi» yoki «Yetkazildi» holatidagi buyurtmalar kiradi, yakunlangan kun boʻyicha.')+'</p>';\n  if(r.since>r.from)h+='<p class=\"rnote\">'+L('Отчёт ведётся с '+fDay(r.since)+', раньше данных нет.','Hisobot '+fDay(r.since)+' dan yuritiladi, undan oldin maʼlumot yoʻq.')+'</p>';\n  if(r.thin)h+='<p class=\"rnote\">'+L('Данных пока мало: чем дольше работает бот, тем точнее цифры и подсказки.','Maʼlumot hozircha kam: bot qancha uzoq ishlasa, raqamlar va maslahatlar shuncha aniq boʻladi.')+'</p>';\n  if(!r.tot.n){\n    return h+'<div class=\"empty\"><b>'+L('За этот период завершённых заказов нет','Bu davrda yakunlangan buyurtma yoʻq')+'</b>'+L('Заказ попадает в отчёт, когда вы переводите его в «Выдан» или «Доставлен».','Buyurtma «Topshirildi» yoki «Yetkazildi» holatiga oʻtganda hisobotga kiradi.')+'</div>'+buyHTML(r);\n  }\n  const t=r.tot,pv=r.prev||{n:0,sum:0};\n  const kpi=(lab,v,extra)=>'<div class=\"stat rkpi\"><small>'+lab+'</small><b>'+v+'</b>'+(extra||'')+'</div>';\n  h+='<div class=\"stats\">'+kpi(L('Заказов','Buyurtmalar'),t.n,deltaHTML(t.n,pv.n,r))+kpi(L('Выручка','Tushum'),esc(money(t.sum)),deltaHTML(t.sum,pv.sum,r))+kpi(L('Средний заказ','Oʻrtacha buyurtma'),esc(money(t.avg)))+kpi(L('Дано скидок','Berilgan chegirma'),esc(money(t.disc)))+'</div>';\n  h+='<div class=\"card\"><h3>'+(r.days<=30?L('Выручка по дням','Kunlar boʻyicha tushum'):r.days<=90?L('Выручка по неделям','Haftalar boʻyicha tushum'):L('Выручка по месяцам','Oylar boʻyicha tushum'))+'</h3>'+chartHTML(r)+'</div>';\n  const pr=R.allP?r.prods:r.prods.slice(0,8);\n  h+='<div class=\"card\"><h3>'+L('Ходовые товары','Ommabop mahsulotlar')+'</h3><div class=\"unit\">'+L('По выручке за период.','Davr tushumi boʻyicha.')+'</div>'\n    +rankHTML(pr.map(x=>{const p=S.prod.items.find(y=>y.id===x.id),pk=p?packText(p,x.qty):'',w=p?weightLabel(p):'';return {t:p?nm(p):x.name,s:(w?w+' · ':'')+L('продано ','sotildi ')+num(x.qty)+' '+pcsWord()+(pk?' ('+pk+')':''),v:x.sum}}))\n    +(r.prods.length>8?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"rall\">'+(R.allP?L('Свернуть','Yigʻish'):L('Показать все ('+r.prods.length+')','Hammasini koʻrsatish ('+r.prods.length+')'))+'</button>':'')+'</div>';\n  if(r.cl.length)h+='<div class=\"card\"><h3>'+L('Лучшие клиенты','Eng yaxshi mijozlar')+'</h3><div class=\"unit\">'+L('По сумме заказов за период.','Davrdagi buyurtmalar summasi boʻyicha.')+'</div>'\n    +rankHTML(r.cl.map(c=>({t:(c.name||L('Без имени','Nomsiz'))+(c.org?' · '+c.org:''),s:ordTxt(c.n),v:c.sum})))+'</div>';\n  return h+buyHTML(r);\n}\nfunction paintRep(){\n  const b=$('#sbody');\n  if(b&&S.view==='seller'&&S.sellerTab==='reports')b.innerHTML=repHTML();\n}\nasync function loadReport(){\n  if(!S.admin)return;\n  const R=S.rep,days=R.days,seq=++R.seq;\n  R.busy=true;R.err=false;\n  paintRep();\n  const r=await api('GET','/api/admin/report?days='+days);\n  if(seq!==R.seq)return;\n  R.busy=false;\n  if(r.ok&&r.data&&r.data.report){R.data=r.data.report;R.err=false;if(R.sel>=repBuckets(R.data).length)R.sel=-1}\n  else R.err=true;\n  paintRep();\n}\n\n/* ---------- клиент дистрибьютора внутри «Базы» ---------- */\nfunction agoTxt(iso){\n  const t=new Date(iso).getTime();\n  if(isNaN(t))return '';\n  const d=Math.floor((Date.now()-t)/86400000);\n  if(d<=0)return L('сегодня','bugun');\n  if(d===1)return L('вчера','kecha');\n  if(d<60)return L(d+' дн. назад',d+' kun oldin');\n  return jrDate(iso);\n}\n/* дистрибьютор, от имени которого ведутся заметки и заказы: открытый сейчас, а если нет — первый из своих */\nconst baseShop=()=>{const sl=S.hub.me&&S.hub.me.sells||[];return sl.some(x=>x.id===S.did)?S.did:(sl[0]&&sl[0].id)||''};\n/* строка на карточке магазина: заказы у дистрибьютора (у владельца у всех), группа, блокировка, личная заметка */\nfunction baseMineHTML(x){\n  const b=S.base,owner=b.role==='owner',m=x.m,my=x.my||{};\n  const parts=[];\n  if(m){\n    parts.push(L('Заказов: ','Buyurtmalar: ')+num(m.n));\n    if(m.sum)parts.push(L('выдано на ','topshirildi: ')+money(m.sum));\n    if(owner&&m.by&&m.by.length)parts.push(m.by.length>1?L('у '+m.by.length+' дистрибьюторов',m.by.length+' ta distribyutorda'):esc(m.by[0].name));\n    if(m.last)parts.push(L('последний: ','oxirgisi: ')+esc(agoTxt(m.last)));\n  }\n  const head=parts.length?parts.join(' · '):(owner?L('Ещё не заказывал','Hali buyurtma bermagan'):L('У вас ещё не заказывал','Sizdan hali buyurtma bermagan'));\n  const badges=(my.grp?'<span class=\"st info\">'+esc(my.grp)+'</span>':'')+(my.blocked?'<span class=\"st bad\">'+L('Заблокирован','Bloklangan')+'</span>':'');\n  return '<button type=\"button\" class=\"cmine\" data-act=\"cmine\" data-id=\"'+esc(x.id)+'\" aria-label=\"'+esc(L('Карточка клиента: ','Mijoz kartochkasi: ')+x.name+L('. Заметка, группа, блокировка','. Eslatma, guruh, bloklash'))+'\"><span class=\"cmt\"><span>'+head+'</span>'\n    +(badges?'<span class=\"cbadges\">'+badges+'</span>':'')+'</span>'+ICO.chev+'</button>'\n    +(my.note?'<div class=\"bnote\"><b>'+L('Моя заметка: ','Mening eslatmam: ')+'</b>'+esc(my.note)+'</div>':'');\n}\nconst groupSuggest=()=>[...new Set(S.base.items.map(x=>x.my&&x.my.grp).filter(Boolean).concat([L('Магазин','Doʻkon'),L('Кафе','Kafe'),L('Столовая','Oshxona')]))];\nfunction cardOrdersHTML(d){\n  const list=d.orders||[],owner=S.base.role==='owner';\n  if(!list.length)return '<div class=\"unit\">'+L('Заказов пока нет.','Hozircha buyurtma yoʻq.')+'</div>';\n  return list.slice(0,15).map(o=>'<div class=\"corder\"><span class=\"oid\">'+esc(o.id)+'</span><span class=\"cs\">'+pill(o)+'<span>'+esc(jrDate(o.createdAt))+'</span></span><b>'+money(o.total)+'</b>'+(owner&&o.shopName?'<small class=\"cshop\">'+esc(o.shopName)+'</small>':'')+'</div>').join('')\n    +(list.length>15?'<div class=\"unit\" style=\"padding-top:6px\">'+L('… и ещё '+(list.length-15),'… va yana '+(list.length-15)+' ta')+'</div>':'');\n}\n/* нижняя панель клиента */\nfunction clientSheetHTML(){\n  const b=S.base,x=b.cx||{},d=b.cdd||{},f=b.cf||{},owner=b.role==='owner';\n  const phone=String(x.phone||'').replace(/[^\\d+]/g,''),tgu=d.my&&d.my.tg;\n  let body='';\n  if(d.err)body='<div class=\"empty\"><b>'+L('Не удалось загрузить','Yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"justify-content:center;margin-bottom:14px\"><button type=\"button\" class=\"btn\" data-act=\"cretry\">'+L('Повторить','Qayta urinish')+'</button></div>';\n  else if(!d.loaded)body='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else{\n    const m=d.m||{n:0,ds:0,sum:0,last:''},my=d.my||{};\n    body+='<div class=\"cact\">'+(phone?'<a class=\"btn ghost sm\" href=\"tel:'+esc(phone)+'\">'+L('Позвонить','Qoʻngʻiroq')+'</a>':'')+(tgu?'<a class=\"btn ghost sm\" data-act=\"contact\" href=\"https://t.me/'+encodeURIComponent(tgu)+'\" target=\"_blank\" rel=\"noopener\">Telegram</a>':'')+'</div>';\n    body+='<div class=\"cst\"><div><small>'+(owner?L('Заказов у всех','Hammasida buyurtma'):L('Заказов у вас','Sizda buyurtma'))+'</small><b>'+num(m.n)+'</b></div><div><small>'+L('Выдано на','Topshirildi')+'</small><b>'+money(m.sum)+'</b></div><div><small>'+L('Последний','Oxirgisi')+'</small><b>'+(m.last?esc(agoTxt(m.last)):'—')+'</b></div></div>';\n    if(owner&&m.by&&m.by.length)body+='<div class=\"csec\"><h3>'+L('По дистрибьюторам','Distribyutorlar boʻyicha')+'</h3>'+m.by.map(y=>'<div class=\"corder\"><span class=\"oid\">'+esc(y.name||y.did)+'</span><b>'+L('заказов: ','buyurtma: ')+num(y.n)+(y.sum?' · '+money(y.sum):'')+'</b></div>').join('')+'</div>';\n    if(baseShop())body+='<div class=\"csec form\"><div class=\"full\"><label class=\"lab\" for=\"cf-grp\">'+L('Группа','Guruh')+'</label><input type=\"text\" id=\"cf-grp\" data-cf=\"grp\" maxlength=\"30\" value=\"'+esc(f.grp)+'\" placeholder=\"'+esc(L('Например: Магазин','Masalan: Doʻkon'))+'\" autocomplete=\"off\"><div class=\"gchips\">'+groupSuggest().map(g=>'<button type=\"button\" class=\"chip\" data-act=\"cgrp\" data-v=\"'+esc(g)+'\">'+esc(g)+'</button>').join('')+'</div></div>'\n      +'<div class=\"full\"><label class=\"lab\" for=\"cf-note\">'+L('Заметка (видна только вам)','Eslatma (faqat sizga koʻrinadi)')+'</label><textarea id=\"cf-note\" data-cf=\"note\" rows=\"3\" maxlength=\"500\" placeholder=\"'+esc(L('Например: платит в конце недели','Masalan: hafta oxirida toʻlaydi'))+'\">'+esc(f.note)+'</textarea></div>'\n      +'<div class=\"full\"><label class=\"ck\"><input type=\"checkbox\" id=\"cf-blocked\" data-cf=\"blocked\"'+(f.blocked?' checked':'')+(my.has?'':' disabled')+'><span>'+L('Заблокировать','Bloklash')+'<small>'+(my.has?L('Магазин не сможет оформить заказ у вас, пока вы не снимете блокировку. У других дистрибьюторов он заказывает как раньше.','Siz blokni olmaguningizcha doʻkon sizdan buyurtma bera olmaydi. Boshqa distribyutorlarda avvalgidek buyurtma beradi.'):L('Доступно, когда магазин закажет у вас или заполнит профиль в вашем каталоге.','Doʻkon sizdan buyurtma berganda yoki katalogingizda profilini toʻldirganda mavjud boʻladi.'))+'</small></span></label></div></div>';\n    body+='<div class=\"csec\"><h3>'+(owner?L('История заказов у всех дистрибьюторов','Barcha distribyutorlardagi buyurtmalar tarixi'):L('История заказов','Buyurtmalar tarixi'))+'</h3>'+cardOrdersHTML(d)+'</div>';\n  }\n  const sub=[x.addr,terrName(x.terr)].filter(Boolean).map(esc).join(' · ');\n  return '<div class=\"fs-bg\" data-act=\"bsheetx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(x.name||'')+'\"><div class=\"fs-grab\"></div>'\n    +'<div class=\"fs-head\"><h2>'+esc(x.name||'')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"bsheetx\">'+L('Закрыть','Yopish')+'</button></div><div class=\"fs-body\">'\n    +(sub?'<div class=\"dmeta\" style=\"margin:0 0 10px\">'+sub+'</div>':'')+(x.phone?'<div class=\"dmeta\" style=\"margin:0 0 10px\">'+esc(x.phone)+'</div>':'')+body+'</div>'\n    +(d.loaded&&baseShop()?'<div class=\"fs-foot\"><button type=\"button\" class=\"btn\" data-act=\"csave\"'+(b.cbusy?' disabled':'')+'>'+(b.cbusy?L('Сохраняем…','Saqlanmoqda…'):L('Сохранить','Saqlash'))+'</button></div>':'')+'</div>';\n}\nasync function clientCardOpen(id){\n  const b=S.base,x=b.items.find(y=>y.id===id)||(b.cx&&b.cx.id===id?b.cx:null);\n  if(!x)return;\n  const seq=++b.cseq;\n  Object.assign(b,{cd:id,cx:x,cdd:{loaded:false,err:false},cf:null,cbusy:false,sheet:false,legend:false});\n  paintSheet();\n  const r=await api('GET','/api/hub/base/'+encodeURIComponent(id)+'/mine?sh='+encodeURIComponent(baseShop()));\n  if(seq!==b.cseq||b.cd!==id)return;\n  if(!r.ok||!r.data){b.cdd={loaded:false,err:true};paintSheet();return}\n  b.cdd=Object.assign({loaded:true,err:false},r.data);\n  const my=r.data.my||{};\n  b.cf={note:my.note||'',grp:my.grp||'',blocked:!!my.blocked};\n  paintSheet();\n}\nfunction clientCardClose(){\n  const b=S.base;\n  b.cseq++;\n  Object.assign(b,{cd:'',cx:null,cdd:null,cf:null,cbusy:false,sheet:false,legend:false});\n  paintSheet();\n}\nasync function clientCardSave(){\n  const b=S.base,id=b.cd,f=b.cf,d=b.cdd;\n  if(!id||!f||!d||!d.loaded||b.cbusy)return;\n  const body={sh:baseShop(),note:String(f.note||'').trim(),grp:String(f.grp||'').trim()};\n  if(d.my&&d.my.has)body.blocked=!!f.blocked;\n  b.cbusy=true;paintSheet();\n  const r=await api('PUT','/api/hub/base/'+encodeURIComponent(id)+'/mine',body);\n  b.cbusy=false;\n  if(!r.ok||!r.data||!r.data.my){toast(baseErr(r.data&&r.data.error));paintSheet();return}\n  const x=b.items.find(y=>y.id===id);\n  if(x)x.my=Object.assign({},x.my,r.data.my);\n  toast(L('Сохранено','Saqlandi'));\n  clientCardClose();\n  paintBase();\n}\n\n/* ---------- аналитика продаж (владелец площадки) ---------- */\nconst AN_TABS=()=>[['cats',L('Категории','Kategoriyalar')],['prods',L('Товары','Mahsulotlar')],['stores',L('Магазины','Doʻkonlar')]];\nconst anCatName=c=>c.name?L(c.name,c.uz||c.name):L('Без категории','Kategoriyasiz');\n/* «заказов» по товару и категории считаются не за все дни: у прежних дней остаётся прочерк */\nconst anN=(d,n)=>n>0||!d.partial?num(n):'—';\nconst anSort=rows=>rows.slice().sort((a,b)=>S.an.sort==='n'?(b.n-a.n||b.sum-a.sum):(b.sum-a.sum||b.n-a.n));\nfunction anListHTML(d){\n  const A=S.an,one=!!d.sh,pc=pcsWord();\n  let rows,total;\n  if(A.tab==='cats'){\n    const all=d.cats.reduce((s,c)=>s+c.sum,0)||1;\n    rows=anSort(d.cats).map(c=>({t:anCatName(c),s:L('заказов: '+anN(d,c.n)+' · продано '+num(c.qty)+' '+pc+' · доля '+Math.round(c.sum/all*100)+'%','buyurtma: '+anN(d,c.n)+' · sotildi '+num(c.qty)+' '+pc+' · ulushi '+Math.round(c.sum/all*100)+'%'),v:c.sum}));\n    total=rows.length;\n  }else if(A.tab==='prods'){\n    rows=anSort(d.prods).map(p=>({t:p.name,s:(one?'':p.shopName+' · ')+L('заказов: '+anN(d,p.n)+' · продано '+num(p.qty)+' '+pc,'buyurtma: '+anN(d,p.n)+' · sotildi '+num(p.qty)+' '+pc),v:p.sum}));\n    total=d.nprods;\n  }else{\n    rows=anSort(d.stores).map(x=>({t:x.name||L('Без имени','Nomsiz'),s:L('заказов: '+num(x.n)+(one?'':' · дистрибьюторов: '+x.nd)+' · последний: '+fDay(x.last),'buyurtma: '+num(x.n)+(one?'':' · distribyutorlar: '+x.nd)+' · oxirgisi: '+fDay(x.last)),v:x.sum}));\n    total=d.nstores;\n  }\n  const show=A.all?rows:rows.slice(0,20);\n  return (rows.length?rankHTML(show):'<div class=\"unit\">'+L('Нет данных.','Maʼlumot yoʻq.')+'</div>')\n    +(rows.length>20?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"anall\">'+(A.all?L('Свернуть','Yigʻish'):L('Показать все ('+rows.length+')','Hammasini koʻrsatish ('+rows.length+')'))+'</button>':'')\n    +(total>rows.length?'<p class=\"rnote\">'+L('Показаны первые '+rows.length+' из '+total+' по сумме.','Summa boʻyicha dastlabki '+rows.length+' ta koʻrsatilgan (jami '+total+').')+'</p>':'');\n}\nfunction renderAnalytics(){\n  const A=S.an,d=A.data,fresh=d&&d.days===A.days&&d.sh===A.sh;\n  const shops=(d&&d.shops)||A.shops;\n  let h='<div class=\"wrap page anp\"><div class=\"hrow\"><div><div class=\"eyebrow\">'+L('Только выданные и доставленные заказы','Faqat topshirilgan va yetkazilgan buyurtmalar')+'</div><h1>'+L('Аналитика','Tahlil')+'</h1></div></div>';\n  h+='<div class=\"filters\">'+RP_DAYS.map(x=>'<button type=\"button\" class=\"chip\" data-act=\"adays\" data-v=\"'+x+'\" aria-pressed=\"'+(A.days===x)+'\">'+esc(rpRange(x))+'</button>').join('')+'</div>';\n  h+='<div class=\"filters\"><div class=\"chip selc'+(A.sh?' on':'')+'\"><span>'+esc(A.sh?((shops.find(x=>x.id===A.sh)||{}).name||''):L('Все дистрибьюторы','Barcha distribyutorlar'))+'</span>'+ICO.chev\n    +'<select data-ash=\"1\" aria-label=\"'+esc(L('Дистрибьютор','Distribyutor'))+'\"><option value=\"\"'+(A.sh?'':' selected')+'>'+esc(L('Все дистрибьюторы','Barcha distribyutorlar'))+'</option>'+shops.map(x=>'<option value=\"'+esc(x.id)+'\"'+(A.sh===x.id?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></div></div>';\n  if(!fresh){\n    h+=A.err?'<div class=\"empty\"><b>'+L('Не удалось загрузить аналитику','Tahlilni yuklab boʻlmadi')+'</b>'+L('Проверьте соединение.','Ulanishni tekshiring.')+'<div style=\"margin-top:10px\"><button type=\"button\" class=\"btn sm\" data-act=\"anretry\">'+L('Повторить','Qayta urinish')+'</button></div></div>'\n      :'<div class=\"empty\"><b>'+L('Считаем продажи','Sotuvlar hisoblanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n    view.innerHTML=h+'</div>';\n    return;\n  }\n  h+='<p class=\"rnote\" style=\"margin:0 0 4px\">'+L('Период: '+fDay(d.from)+' — '+fDay(d.to)+', по дню выдачи заказа.','Davr: '+fDay(d.from)+' — '+fDay(d.to)+', buyurtma topshirilgan kun boʻyicha.')+'</p>';\n  if(d.since&&d.since>d.from)h+='<p class=\"rnote\">'+L('Учёт продаж ведётся с '+fDay(d.since)+', раньше данных нет.','Sotuvlar hisobi '+fDay(d.since)+' dan yuritiladi, undan oldin maʼlumot yoʻq.')+'</p>';\n  if(d.failed)h+='<p class=\"rnote\" style=\"color:var(--bad)\">'+L('Не удалось получить данные у дистрибьюторов: '+d.failed+'. Цифры неполные.','Distribyutorlardan maʼlumot olinmadi: '+d.failed+'. Raqamlar toʻliq emas.')+'</p>';\n  if(!d.tot.n){\n    view.innerHTML=h+'<div class=\"empty\"><b>'+L('За этот период выданных заказов нет','Bu davrda topshirilgan buyurtma yoʻq')+'</b>'+L('Заказ попадает в аналитику, когда дистрибьютор переводит его в «Выдан» или «Доставлен».','Buyurtma distribyutor uni «Topshirildi» yoki «Yetkazildi» ga oʻtkazganda tahlilga tushadi.')+'</div></div>';\n    return;\n  }\n  const t=d.tot,kpi=(lab,v)=>'<div class=\"stat rkpi\"><small>'+lab+'</small><b>'+v+'</b></div>';\n  h+='<div class=\"stats\">'+kpi(L('Заказов','Buyurtmalar'),num(t.n))+kpi(L('Выручка','Tushum'),esc(money(t.sum)))+kpi(L('Магазинов','Doʻkonlar'),num(t.stores))+(d.sh?kpi(L('Средний заказ','Oʻrtacha buyurtma'),esc(money(Math.round(t.sum/t.n)))):kpi(L('Дистрибьюторов','Distribyutorlar'),num(t.shops)))+'</div>';\n  const cnt={cats:d.cats.length,prods:d.nprods,stores:d.nstores};\n  h+='<div class=\"seg s3\" role=\"group\" aria-label=\"'+esc(L('Раздел','Boʻlim'))+'\">'+AN_TABS().map(x=>'<button type=\"button\" data-act=\"antab\" data-v=\"'+x[0]+'\" aria-pressed=\"'+(A.tab===x[0])+'\"><span>'+x[1]+'</span><b class=\"cnt\">'+num(cnt[x[0]])+'</b></button>').join('')+'</div>';\n  h+='<div class=\"card\"><div class=\"filters\" style=\"margin-bottom:6px\"><button type=\"button\" class=\"chip\" data-act=\"ansort\" data-v=\"sum\" aria-pressed=\"'+(A.sort==='sum')+'\">'+L('По сумме','Summa boʻyicha')+'</button><button type=\"button\" class=\"chip\" data-act=\"ansort\" data-v=\"n\" aria-pressed=\"'+(A.sort==='n')+'\">'+L('По заказам','Buyurtma boʻyicha')+'</button></div>'+anListHTML(d)+'</div>';\n  if(d.partial&&A.tab!=='stores')h+='<p class=\"rnote\">'+L('Число заказов по товарам и категориям считается только за дни, когда этот счёт уже шёл. За более ранние дни показаны штуки и суммы, а заказов там «—» или меньше, чем было.','Mahsulot va kategoriyalar boʻyicha buyurtmalar soni faqat bu hisob yuritilgan kunlar uchun hisoblanadi. Oldingi kunlar uchun dona va summa koʻrsatilgan, buyurtmalar esa «—» yoki haqiqatdagidan kam.')+'</p>';\n  h+='<p class=\"rnote\">'+(A.tab==='stores'?L('Сумма магазина — сколько он заплатил за выданные заказы (со скидкой и доставкой).','Doʻkon summasi — topshirilgan buyurtmalar uchun toʻlagan puli (chegirma va yetkazib berish bilan).'):L('Суммы товаров и категорий считаются по ценам в заказах, до скидки на весь заказ. Заказ с товарами из разных категорий учитывается в каждой из них. Категория — та, что была у товара в день продажи.','Mahsulot va kategoriyalar summasi buyurtmadagi narxlar boʻyicha, butun buyurtmaga chegirmagacha hisoblanadi. Turli kategoriyadagi mahsulotli buyurtma har bir kategoriyada hisobga olinadi. Kategoriya — mahsulot sotilgan kundagi kategoriya.'))+'</p>';\n  view.innerHTML=h+'</div>';\n}\nasync function loadAnalytics(){\n  if(!isOwner())return;\n  const A=S.an,seq=++A.seq;\n  A.err=false;\n  if(S.view==='analytics')renderAnalytics();\n  const r=await api('GET','/api/hub/admin/analytics?days='+A.days+'&sh='+encodeURIComponent(A.sh));\n  if(seq!==A.seq)return;\n  if(!r.ok||!r.data||!r.data.tot){A.err=true;if(S.view==='analytics')renderAnalytics();return}\n  A.data=r.data;A.shops=r.data.shops||A.shops;\n  if(r.data.sh!==A.sh)A.sh=r.data.sh;   // такого дистрибьютора нет: показаны все\n  if(S.view==='analytics')renderAnalytics();\n}\n\n/* Сжимает фото на телефоне: JPEG, длинная сторона ~800 px, до ~280 КБ. */\nasync function shrinkPhoto(file){\n  const url=URL.createObjectURL(file);\n  try{\n    const img=await new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=url});\n    const w=img.naturalWidth,h=img.naturalHeight;\n    if(!w||!h)return null;\n    let k=Math.min(1,800/Math.max(w,h));\n    for(let attempt=0;attempt<4;attempt++){\n      const cw=Math.max(64,Math.round(w*k)),ch=Math.max(64,Math.round(h*k));\n      const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;\n      const g=cv.getContext('2d');g.fillStyle='#FFFFFF';g.fillRect(0,0,cw,ch);g.drawImage(img,0,0,cw,ch);\n      for(const q of [0.82,0.7,0.58]){\n        const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',q));\n        if(blob&&blob.size<=280000)return blob;\n      }\n      k*=0.8;\n    }\n    return null;\n  }finally{URL.revokeObjectURL(url)}\n}\nasync function apiBin(method,path,blob,ctype){\n  const ep=S.epoch;\n  if(!S.did)return {ok:false,status:0,data:null,stale:true};\n  try{\n    const h={'content-type':ctype||'image/jpeg','x-shop':S.did};\n    if(S.initData)h['x-init-data']=S.initData;\n    const r=await fetch(path,{method,headers:h,body:blob,cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    if(S.epoch!==ep)return {ok:false,status:0,data:null,stale:true};\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\nfunction setPhotoVers(p,d){p.pv=d&&d.pv||'';p.pv2=d&&d.pv2||'';p.pv3=d&&d.pv3||''}\nasync function uploadPhoto(id,file,n){\n  if(!S.auth||!S.admin||S.upl[id])return;\n  const p=S.prod.items.find(x=>x.id===id);if(!p)return;\n  n=Math.max(1,Math.min(PH_MAX,Number(n)||1));\n  n=Math.min(n,phVers(p).length+1);          // фото идут подряд: следующее — сразу за последним\n  S.upl[id]=n;paintPhoto(id);\n  let ok=false;\n  try{\n    await flushSave();   // товар должен уже быть на сервере, иначе фото некуда привязать\n    const blob=await shrinkPhoto(file);\n    if(blob){\n      const r=await apiBin('PUT','/api/admin/photo/'+encodeURIComponent(id)+'?n='+n,blob);\n      if(r.ok&&r.data){setPhotoVers(p,r.data);ok=true}\n    }\n  }catch(e){}\n  delete S.upl[id];paintPhoto(id);\n  toast(ok?L('Фото сохранено','Rasm saqlandi'):L('Не удалось загрузить фото. Попробуйте другое изображение.','Rasmni yuklab boʻlmadi. Boshqa rasm tanlang.'));\n}\nasync function removePhoto(id,n){\n  const p=S.prod.items.find(x=>x.id===id);if(!p||S.upl[id])return;\n  n=Math.max(1,Math.min(PH_MAX,Number(n)||1));\n  S.upl[id]=n;paintPhoto(id);\n  const r=await api('DELETE','/api/admin/photo/'+encodeURIComponent(id)+'?n='+n);\n  if(r.ok&&r.data)setPhotoVers(p,r.data);\n  delete S.upl[id];paintPhoto(id);\n  if(!r.ok)toast(L('Не удалось убрать фото','Rasmni olib tashlab boʻlmadi'));\n}\n\n/* просмотр фото на весь экран: свайп между фото, × / касание тёмного поля / Esc / «Назад» в Telegram закрывают */\nfunction lbBack(){closeViewer()}\nfunction openViewer(id,pp,did){\n  const p=pp||S.prod.items.find(x=>x.id===id);if(!p)return;\n  const vs=phVers(p);if(!vs.length)return;\n  closeViewer();\n  const el=document.createElement('div');el.id='lb';el.className='lb';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',nm(p));\n  const many=vs.length>1;\n  el.innerHTML='<div class=\"lb-top\"><span class=\"lb-cnt\" id=\"lb-cnt\" aria-live=\"polite\">'+(many?'1 / '+vs.length:'')+'</span><button type=\"button\" class=\"lb-x\" data-act=\"lbclose\" aria-label=\"'+esc(L('Закрыть','Yopish'))+'\">×</button></div>'\n    +'<div class=\"lb-track\" id=\"lb-track\">'+vs.map((v,i)=>'<div class=\"lb-slide\" data-act=\"lbbg\"><img src=\"'+imgUrl(p,i+1,did)+'\" alt=\"'+esc(nm(p))+'\" decoding=\"async\" draggable=\"false\"></div>').join('')+'</div>'\n    +(many?'<div class=\"lb-dots\" id=\"lb-dots\">'+vs.map((v,i)=>'<i'+(i?'':' class=\"on\"')+'></i>').join('')+'</div>':'');\n  document.body.appendChild(el);\n  document.documentElement.classList.add('lb-open');\n  const tr=el.querySelector('#lb-track');let raf=0;\n  tr.addEventListener('scroll',()=>{\n    if(raf)return;\n    raf=requestAnimationFrame(()=>{\n      raf=0;\n      const i=Math.max(0,Math.min(vs.length-1,Math.round(tr.scrollLeft/(tr.clientWidth||1))));\n      const c=el.querySelector('#lb-cnt');if(c&&many)c.textContent=(i+1)+' / '+vs.length;\n      el.querySelectorAll('#lb-dots i').forEach((d,k)=>d.classList.toggle('on',k===i));\n    });\n  },{passive:true});\n  try{if(S.tg&&S.tg.BackButton&&S.tg.isVersionAtLeast&&S.tg.isVersionAtLeast('6.1')){S.tg.BackButton.onClick(lbBack);S.tg.BackButton.show();S.lbTg=true}}catch(e){}\n}\nfunction closeViewer(){\n  const el=document.getElementById('lb');\n  if(el)el.remove();\n  document.documentElement.classList.remove('lb-open');\n  if(S.lbTg){S.lbTg=false;try{S.tg.BackButton.offClick(lbBack);S.tg.BackButton.hide()}catch(e){}}\n}\ndocument.addEventListener('keydown',e=>{\n  const el=document.getElementById('lb');if(!el)return;\n  if(e.key==='Escape')closeViewer();\n  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const tr=el.querySelector('#lb-track');if(tr)tr.scrollBy({left:(e.key==='ArrowRight'?1:-1)*tr.clientWidth,behavior:'smooth'})}\n});\n\n/* скидка на заказ: до трёх строк «от суммы — %» */\nfunction discEditHTML(){\n  const d=S.cfg.shop.discounts||[];\n  const rows=[0,1,2].map(i=>{\n    const x=d[i]||{};\n    return '<div class=\"trow\"><span>'+L('от','dan')+'</span><input type=\"number\" id=\"sdf-'+i+'\" data-sd=\"from\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"1\" max=\"1000000000\" step=\"1000\" value=\"'+(x.from||'')+'\" placeholder=\"'+(i===0?'500000':'')+'\" aria-label=\"'+esc(L('Скидка '+(i+1)+': от какой суммы, сум','Chegirma '+(i+1)+': qaysi summadan, soʻm'))+'\">'\n      +'<span>'+L('сум — скидка','soʻm — chegirma')+'</span><input type=\"number\" id=\"sdp-'+i+'\" data-sd=\"pct\" data-ti=\"'+i+'\" inputmode=\"numeric\" min=\"1\" max=\"50\" step=\"1\" value=\"'+(x.pct||'')+'\" aria-label=\"'+esc(L('Скидка '+(i+1)+': процент','Chegirma '+(i+1)+': foiz'))+'\"><span>%</span></div>';\n  }).join('');\n  return '<div class=\"full\"><span class=\"lab\">'+L('Скидка на заказ от суммы','Buyurtma summasiga qarab chegirma')+'</span><div class=\"tiers\" id=\"sdisc\">'+rows+'</div><div class=\"err\" id=\"sdw\" role=\"status\"></div>'\n    +'<div class=\"note\">'+L('Считается от суммы товаров (уже с ценами по ступеням) и показывается клиенту отдельной строкой. На минимальную сумму заказа и порог бесплатной доставки скидка не влияет: они считаются по сумме до скидки. Процент от 1 до 50, он должен расти вместе с суммой.','Mahsulotlar summasidan (pogʻona narxlarida) hisoblanadi va mijozga alohida qatorda koʻrsatiladi. Minimal buyurtma summasiga va bepul yetkazish chegarasiga chegirma taʼsir qilmaydi: ular chegirmagacha boʻlgan summa boʻyicha hisoblanadi. Foiz 1 dan 50 gacha, summa oshgani sari oshishi kerak.')+'</div></div>';\n}\nfunction syncDisc(){\n  const rows=[];\n  for(let i=0;i<3;i++){\n    const a=document.getElementById('sdf-'+i),b=document.getElementById('sdp-'+i);\n    const f=a?String(a.value).trim():'',pc=b?String(b.value).trim():'';\n    if(f!==''&&pc!=='')rows.push({from:Number(f),pct:Number(pc)});\n  }\n  const ok=cleanDiscounts(rows);\n  S.cfg.shop.discounts=ok;\n  const w=document.getElementById('sdw');\n  if(w)w.textContent=ok.length<rows.length?L('Одна из строк не учтена: сумма и процент должны расти от строки к строке.','Qatorlardan biri hisobga olinmadi: summa va foiz qatordan qatorga oshib borishi kerak.')\n    :rows.some(r=>Math.round(r.pct)>50)?L('Скидка не больше 50%.','Chegirma 50% dan oshmasligi kerak.'):'';\n  queueSave();\n}\nfunction sellLinkHTML(){\n  const l=sellLink();\n  if(!l)return '';\n  return '<div class=\"card\"><h3>'+L('Ссылка для клиентов','Mijozlar uchun havola')+'</h3><div class=\"unit\">'+L('Отправьте её клиентам: она сразу открывает ваш каталог в боте.','Uni mijozlarga yuboring: u botda darhol katalogingizni ochadi.')+'</div>'\n    +'<div class=\"mono small\">'+esc(l)+'</div><div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn ghost\" data-act=\"copy\" data-v=\"'+esc(l)+'\" data-ok=\"'+esc(L('Ссылка скопирована','Havola nusxalandi'))+'\" data-lab=\"\">'+L('Копировать ссылку','Havolani nusxalash')+'</button></div></div>';\n}\n/* Куда дистрибьютор доставляет и где его склад. Самовывоз доступен всем, ограничивается только доставка. */\nfunction regionsEditHTML(){\n  const s=S.cfg.shop,z=cleanRegions(s.regions),only=S.regOnly===null?z.length>0:S.regOnly;\n  return '<div class=\"full\"><div class=\"lab\">'+L('Куда вы доставляете','Qayerga yetkazib berasiz')+'</div>'\n    +'<label class=\"chk\"><input type=\"checkbox\" id=\"s-regonly\" data-s=\"regonly\"'+(only?' checked':'')+'> '+L('Доставляю только в отмеченные регионы','Faqat belgilangan hududlarga yetkazaman')+'</label>'\n    +'<div class=\"regs\" id=\"regbox\"'+(only?'':' hidden')+'>'+REGIONS.map(r=>'<label class=\"chk\"><input type=\"checkbox\" data-sreg=\"'+r.id+'\"'+(z.includes(r.id)?' checked':'')+'> '+esc(regionName(r.id))+'</label>').join('')+'</div>'\n    +'<div class=\"note\" style=\"margin-top:8px\">'+L('Магазин из неотмеченного региона не сможет заказать доставку, но самовывоз ему доступен. Если не отметить ни одного региона, доставка будет по всей стране.','Belgilanmagan hududdagi doʻkon yetkazib berishni tanlay olmaydi, lekin olib ketish unga ochiq. Birorta hudud belgilanmasa, yetkazib berish butun mamlakat boʻylab boʻladi.')+'</div>'\n    +'<div style=\"margin-top:12px\"><label class=\"lab\" for=\"s-home\">'+L('Регион вашего склада (где самовывоз)','Omboringiz hududi (olib ketish joyi)')+'</label><select id=\"s-home\" data-s=\"home\"><option value=\"\">'+L('Не указывать','Koʻrsatilmasin')+'</option>'\n    +REGIONS.map(r=>'<option value=\"'+r.id+'\"'+(s.home===r.id?' selected':'')+'>'+esc(regionName(r.id))+'</option>').join('')+'</select>'\n    +'<div class=\"unit\">'+L('Магазины этого региона увидят вас в списке первыми, даже если вы туда не доставляете.','Shu hududdagi doʻkonlar sizni roʻyxatda birinchi koʻradi, hatto yetkazib bermasangiz ham.')+'</div></div></div>';\n}\nfunction settingsHTML(){\n  const s=S.cfg.shop;\n  const num=(id,lab,k,min,max)=>'<div><label class=\"lab\" for=\"s-'+id+'\">'+lab+'</label><input type=\"number\" id=\"s-'+id+'\" inputmode=\"numeric\" min=\"'+min+'\" max=\"'+max+'\" data-s=\"'+k+'\" value=\"'+esc(s[k])+'\"></div>';\n  return '<div class=\"savebar\" id=\"savebar\"></div><div class=\"card\"><div class=\"settings\">'\n    +'<div><label class=\"lab\" for=\"s-name\">'+L('Название компании','Kompaniya nomi')+'</label><input type=\"text\" id=\"s-name\" data-s=\"name\" value=\"'+esc(s.name)+'\" maxlength=\"60\"></div>'\n    +'<div><label class=\"lab\" for=\"s-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"s-phone\" data-s=\"phone\" value=\"'+esc(s.phone)+'\" placeholder=\"+998 …\"></div>'\n    +'<div><label class=\"lab\" for=\"s-tg\">'+L('Telegram для вопросов по заказу, без @','Buyurtma savollari uchun Telegram, @ belgisisiz')+'</label><input type=\"text\" id=\"s-tg\" data-s=\"telegram\" value=\"'+esc(s.telegram)+'\"></div>'\n    +'<div></div>'\n    +'<div><label class=\"lab\" for=\"s-addr\">'+L('Адрес самовывоза (по-русски)','Olib ketish manzili (ruscha)')+'</label><input type=\"text\" id=\"s-addr\" data-s=\"address\" value=\"'+esc(s.address)+'\"></div>'\n    +'<div><label class=\"lab\" for=\"s-addruz\">'+L('Адрес самовывоза (по-узбекски)','Olib ketish manzili (oʻzbekcha)')+'</label><input type=\"text\" id=\"s-addruz\" data-s=\"addressUz\" value=\"'+esc(s.addressUz)+'\"></div>'\n    +'<div class=\"full\"><label class=\"chk\"><input type=\"checkbox\" id=\"s-delivery\" data-s=\"delivery\"'+(s.delivery!==false?' checked':'')+'> '+L('Доставка по адресу включена','Manzilga yetkazib berish yoqilgan')+'</label></div>'\n    +num('lead',L('Самовывоз: заказ за, часов минимум','Olib ketish: buyurtma, kamida soat'),'leadHours',0,240)\n    +num('dlead',L('Доставка: заказ за, часов минимум','Yetkazib berish: buyurtma, kamida soat'),'deliveryLeadHours',0,240)\n    +num('minorder',L('Минимальная сумма заказа, сум (0 — без минимума)','Buyurtmaning minimal summasi, soʻm (0 — cheklovsiz)'),'minOrder',0,1000000000)\n    +num('dfee',L('Стоимость доставки, сум (0 — бесплатно)','Yetkazib berish narxi, soʻm (0 — bepul)'),'deliveryFee',0,1000000000)\n    +num('dfree',L('Доставка бесплатна от суммы, сум (0 — нет порога)','Yetkazib berish bepul boʻladigan summa, soʻm (0 — chegarasiz)'),'freeDeliveryFrom',0,1000000000)\n    +'<div class=\"full\"><div class=\"note\">'+L('Минимальная сумма считается по товарам и действует и на самовывоз, и на доставку. Стоимость доставки добавляется к заказу только при доставке; если указан порог, при сумме товаров от него доставка бесплатна.','Minimal summa mahsulotlar boʻyicha hisoblanadi va olib ketishga ham, yetkazib berishga ham taalluqli. Yetkazib berish narxi faqat yetkazishda qoʻshiladi; chegara koʻrsatilsa, mahsulotlar shu summadan oshganda yetkazish bepul.')+'</div></div>'\n    +(regionsOn()?regionsEditHTML():'')\n    +discEditHTML()\n    +num('from',L('Время работы с, часов','Ish vaqti: dan, soat'),'openFrom',0,22)\n    +num('to',L('Время работы до, часов','Ish vaqti: gacha, soat'),'openTo',1,23)\n    +'</div></div>'\n    +sellLinkHTML()\n    +'<div class=\"card\"><h3>'+L('Резервная копия','Zaxira nusxasi')+'</h3><div class=\"unit\">'+L('Один файл со всем: настройки, каталог с фото, остатки, заказы и клиенты. Он придёт вам в чат с ботом. Храните его в надёжном месте: в нём телефоны и адреса клиентов. Токен бота и код продавца в файл не попадают.','Hammasi bitta faylda: sozlamalar, rasmli katalog, qoldiqlar, buyurtmalar va mijozlar. U botdagi chatingizga keladi. Uni ishonchli joyda saqlang: unda mijozlarning telefon va manzillari bor. Bot tokeni va sotuvchi kodi faylga kirmaydi.')+'</div>'+xbtn('backup')+'</div>';\n}\nfunction paintSave(){\n  const el=$('#savebar');if(!el)return;\n  const t={\n    saving:L('Сохраняем…','Saqlanmoqda…'),\n    saved:L('Сохранено, клиенты видят изменения','Saqlandi, mijozlar oʻzgarishlarni koʻradi'),\n    error:L('Не удалось сохранить. Проверьте соединение и измените что-нибудь ещё раз.','Saqlab boʻlmadi. Ulanishni tekshiring va yana biror narsani oʻzgartiring.'),\n    nodb:L('Изменения не сохраняются: нет доступа к хранилищу.','Oʻzgarishlar saqlanmaydi: ombor mavjud emas.')\n  }[S.saveState]||'';\n  el.textContent=t;el.className='savebar'+(S.saveState==='error'||S.saveState==='nodb'?' bad':'');\n}\nfunction queueSave(kind){\n  if(kind==='prod')S.dirtyP=true;else S.dirtyC=true;\n  S.dirty=true;\n  if(!S.auth||!S.admin){S.saveState='nodb';paintSave();return}\n  S.saveState='saving';paintSave();\n  clearTimeout(saveT);saveT=setTimeout(doSave,700);\n}\nasync function doSave(){\n  if(S.saving){S.again=true;return}\n  S.saving=true;\n  const ep=S.epoch;\n  do{\n    S.again=false;\n    const jobs=[];\n    if(S.dirtyC){S.dirtyC=false;jobs.push(api('PUT','/api/admin/config',{cfg:clone(S.cfg)}).then(r=>{if(!r.ok&&S.epoch===ep)S.dirtyC=true;return r.ok}))}\n    if(S.dirtyP){S.dirtyP=false;jobs.push(api('PUT','/api/admin/products',{prod:clone(S.prod)}).then(r=>{if(!r.ok&&S.epoch===ep)S.dirtyP=true;if(r.ok&&r.data&&r.data.prod&&S.epoch===ep)mergeMod(r.data.prod);return r.ok}))}\n    const res=await Promise.all(jobs);\n    S.saveState=res.every(Boolean)?'saved':'error';\n  }while(S.again&&S.saveState!=='error');\n  S.saving=false;\n  S.dirty=S.dirtyC||S.dirtyP;\n  paintSave();\n}\n/* Дожидается, пока все правки уйдут на сервер (нужно перед загрузкой фото). */\nasync function flushSave(){\n  clearTimeout(saveT);\n  while(S.saving)await waitMs(80);\n  if(S.dirtyC||S.dirtyP)await doSave();\n}\nfunction applyOrder(o,stats,did){\n  if(!o)return;\n  did=did||S.did;\n  const upd=(list,hub)=>list.map(x=>x.id===o.id&&(!hub||(x.did||S.did)===did)?Object.assign({},x,o):x);\n  if(did===S.did){S.allOrders=upd(S.allOrders,false);if(stats)S.stats=stats}\n  S.myOrders=upd(S.myOrders,true);\n  renderNav();\n  if(S.view==='seller'&&S.sellerTab==='orders')paintSeller();\n  else if(S.view==='mine')renderMine();\n}\nasync function setStatus(id,to){\n  const r=await api('POST','/api/admin/status',{id,to});\n  if(!r.ok){\n    toast(L('Не удалось обновить статус','Holatni yangilab boʻlmadi'));\n    if(r.data&&r.data.order)applyOrder(r.data.order,r.data.stats);\n    return;\n  }\n  applyOrder(r.data.order,r.data.stats);\n  loadStock();   // выдача списывает товар, отмена возвращает\n}\n/* «Повторить заказ»: открывает дистрибьютора этого заказа и кладёт в корзину всё, что сейчас есть в продаже (по сегодняшним ценам и остаткам). */\nasync function repeatOrder(id,d){\n  const od=d||S.did;\n  const o=S.myOrders.find(x=>x.id===id&&(x.did||S.did)===od);\n  if(!o)return;\n  if(od!==S.did&&!(await openShop(od)))return;\n  doRepeat(o);\n}\nfunction doRepeat(o){\n  if(S.otherCart){askOtherCart(()=>doRepeat(o));return}\n  let added=0,cut=0;const skipped=[];\n  (o.items||[]).forEach(it=>{\n    const p=S.prod.items.find(x=>x.id===it.id),qty=Number(it.qty)||0;\n    if(!p||soldOut(p)||qty<1){skipped.push(nm(it));return}\n    const cur=S.cart[p.id]||0;\n    if(!cur&&cartLines().length>=MAX_LINES){skipped.push(nm(it));return}\n    const want=Math.min(MAX_QTY,cur+qty),cap=maxQty(p),got=Math.min(want,cap);\n    if(got<want)cut++;\n    if(got>cur){S.cart[p.id]=got;added++}\n  });\n  saveCart();\n  if(!added){toast(L('Этих товаров сейчас нет в наличии','Bu mahsulotlar hozir mavjud emas'));go('shop');return}\n  S.shopPlaced=null;S.shopStep='cart';\n  go('shop');\n  toast(L('Товары из заказа '+o.id+' добавлены в корзину. Проверьте количество и цены.','Buyurtma '+o.id+' mahsulotlari savatga qoʻshildi. Miqdor va narxlarni tekshiring.')\n    +(skipped.length?L(' Нет в наличии: ',' Mavjud emas: ')+skipped.slice(0,3).join(', ')+(skipped.length>3?'…':'')+'.':'')\n    +(cut?L(' Количество уменьшено по остатку.',' Miqdor qoldiqqa qarab kamaytirildi.'):''));\n}\nasync function cancelMine(id,d){\n  const od=d||S.did;\n  const r=await api('POST','/api/cancel',{id},od);\n  if(!r.ok){\n    toast(L('Не удалось отменить: продавец уже принял заказ. Напишите ему.','Bekor qilib boʻlmadi: sotuvchi buyurtmani qabul qilgan. Unga yozing.'));\n    if(r.data&&r.data.order)applyOrder(r.data.order,undefined,od);\n    return;\n  }\n  applyOrder(r.data.order,undefined,od);\n}\n\n/* ---------- местоположение ---------- */\n/* Где сейчас телефон: ok({lat,lng},точность в метрах) или fail('denied'|'na'|'fail'|'timeout') */\nfunction getPos(ok,fail){\n  if(!navigator.geolocation){fail('na');return}\n  let done=false;\n  const fin=(f,a,b)=>{if(done)return;done=true;clearTimeout(to);f(a,b)};\n  const to=setTimeout(()=>fin(fail,'timeout'),20000);\n  try{\n    navigator.geolocation.getCurrentPosition(p=>{const l=cleanLoc({lat:p.coords.latitude,lng:p.coords.longitude});if(l)fin(ok,l,p.coords.accuracy);else fin(fail,'fail')},e=>fin(fail,e&&e.code===1?'denied':'fail'),{enableHighAccuracy:true,timeout:15000,maximumAge:20000});\n  }catch(e){fin(fail,'fail')}\n}\nconst geoErr=k=>k==='denied'?L('Нет доступа к геолокации. Разрешите её для Telegram в настройках телефона.','Geolokatsiyaga ruxsat yoʻq. Telefon sozlamalarida Telegram uchun ruxsat bering.')\n  :L('Не удалось определить местоположение. Включите геолокацию на телефоне и выйдите на открытое место.','Joylashuvni aniqlab boʻlmadi. Telefonda geolokatsiyani yoqing va ochiq joyga chiqing.');\nconst fmtKm=d=>d<1?L(Math.round(d*10)*100+' м',Math.round(d*10)*100+' m'):L(String(d).replace('.',',')+' км',d+' km');\n/* выбор карты: Яндекс.Карты или Google Maps */\nfunction openMapSheet(lat,lng,title){\n  const loc=cleanLoc({lat,lng});if(!loc)return;\n  closeMapSheet();\n  S.map=loc;\n  const el=document.createElement('div');el.id='mapsheet';\n  const co=loc.lat.toFixed(5)+', '+loc.lng.toFixed(5);\n  el.innerHTML='<div class=\"fs-bg\" data-act=\"mapx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Открыть на карте','Xaritada ochish'))+'\"><div class=\"fs-grab\"></div>'\n    +'<div class=\"fs-head\"><h2>'+L('Открыть на карте','Xaritada ochish')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"mapx\">'+L('Закрыть','Yopish')+'</button></div>'\n    +'<div class=\"fs-body\">'+(title?'<div class=\"rsum\"><b>'+esc(title)+'</b></div>':'')\n    +'<div class=\"mapbtns\"><button type=\"button\" class=\"btn\" data-act=\"mapgo\" data-k=\"y\">'+L('Яндекс.Карты','Yandex Xaritalar')+'</button><button type=\"button\" class=\"btn ghost\" data-act=\"mapgo\" data-k=\"g\">Google Maps</button></div>'\n    +'<div class=\"mapco\"><span class=\"mono small\">'+esc(co)+'</span><button type=\"button\" class=\"lnk\" data-act=\"copy\" data-v=\"'+esc(co)+'\" data-ok=\"'+esc(L('Координаты скопированы','Koordinatalar nusxalandi'))+'\" data-lab=\"\">'+L('Копировать','Nusxalash')+'</button></div></div></div>';\n  document.body.appendChild(el);\n  document.documentElement.classList.add('sh-open');\n}\nfunction closeMapSheet(){\n  const el=document.getElementById('mapsheet');\n  if(el)el.remove();\n  S.map=null;\n  setScrollLock();\n}\nfunction mapGo(k){\n  if(!S.map)return;\n  const url=mapUrl(k==='g'?'g':'y',S.map);\n  try{if(S.tg&&S.tg.openLink){S.tg.openLink(url);closeMapSheet();return}}catch(e){}\n  window.open(url,'_blank','noopener');\n  closeMapSheet();\n}\n/* --- клиент: точка в заказе (необязательно, хранится только в заказе) --- */\nfunction locBoxHTML(){\n  const l=S.form.loc;\n  if(S.locBusy)return '<div class=\"unit\" style=\"margin:0\">'+L('Определяем местоположение…','Joylashuv aniqlanmoqda…')+'</div>';\n  if(l)return '<div class=\"locok\"><span>✓ '+L('Местоположение указано','Joylashuv koʻrsatildi')+'</span><span class=\"locbtns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"map\" data-lat=\"'+l.lat+'\" data-lng=\"'+l.lng+'\" data-t=\"\">'+L('На карте','Xaritada')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"locclear\">'+L('Убрать','Olib tashlash')+'</button></span></div>';\n  return '<button type=\"button\" class=\"btn ghost locbtn\" data-act=\"locmark\">'+ICO.pin+'<span>'+L('Указать моё местоположение','Joylashuvimni koʻrsatish')+'</span></button>'\n    +'<div class=\"unit\" style=\"margin:6px 0 0\">'+L('Необязательно. Продавец увидит точку на карте, так проще найти магазин.','Majburiy emas. Sotuvchi nuqtani xaritada koʻradi, doʻkonni topish osonroq.')+'</div>';\n}\nfunction paintLocBox(){const el=$('#locbox');if(el)el.innerHTML=locBoxHTML()}\nfunction locMark(){\n  if(S.locBusy)return;\n  S.locBusy=true;paintLocBox();\n  getPos(l=>{S.locBusy=false;S.form.loc=l;paintLocBox();toast(L('Местоположение добавлено к заказу','Joylashuv buyurtmaga qoʻshildi'))},k=>{S.locBusy=false;paintLocBox();toast(geoErr(k))});\n}\n/* --- база магазинов --- */\n/* строка точки в карточке: у всех «На карте» и расстояние; у агента и владельца ещё «Обновить», «Отметить здесь» и предложение клиента */\nfunction baseLocHTML(x){\n  const w=baseW(),id=esc(x.id),busy=S.base.mark===x.id;\n  let h='';\n  if(x.loc)h+='<span class=\"lchips\"><button type=\"button\" class=\"lchip\" data-act=\"map\" data-lat=\"'+x.loc.lat+'\" data-lng=\"'+x.loc.lng+'\" data-t=\"'+esc(x.name)+'\">'+ICO.pin+L('На карте','Xaritada')+'</button>'\n    +(x.d!==undefined?'<span class=\"dkm\">'+esc(fmtKm(x.d))+'</span>':'')\n    +(w?'<button type=\"button\" class=\"llink\" data-act=\"baseloc\" data-id=\"'+id+'\"'+(S.base.mark?' disabled':'')+'>'+(busy?L('Определяем…','Aniqlanmoqda…'):L('Обновить','Yangilash'))+'</button>':'')+'</span>';\n  else if(w)h+='<button type=\"button\" class=\"lchip add\" data-act=\"baseloc\" data-id=\"'+id+'\"'+(S.base.mark?' disabled':'')+'>'+ICO.pin+(busy?L('Определяем…','Aniqlanmoqda…'):L('Отметить здесь','Shu yerda belgilash'))+'</button>';\n  let c='';\n  if(w&&x.cloc)c='<div class=\"cloc\"><span>'+L('Клиент прислал точку','Mijoz nuqta yubordi')+' <i>'+L('отмечено клиентом','mijoz belgilagan')+'</i></span><span class=\"locbtns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"map\" data-lat=\"'+x.cloc.lat+'\" data-lng=\"'+x.cloc.lng+'\" data-t=\"'+esc(x.name)+'\">'+L('На карте','Xaritada')+'</button><button type=\"button\" class=\"btn sm\" data-act=\"baseaccept\" data-id=\"'+id+'\"'+(S.base.mark?' disabled':'')+'>'+L('Принять','Qabul qilish')+'</button></span></div>';\n  return (h?'<div class=\"bloc\">'+h+'</div>':'')+c;\n}\n/* «Отметить здесь» и «Обновить»: берём место, где стоит агент; не вышло — открываем форму, там можно вставить ссылку на карту */\nfunction baseMark(id){\n  const b=S.base,x=b.items.find(y=>y.id===id);\n  if(!x||b.mark||b.busy)return;\n  const go=()=>{\n    b.mark=id;paintBase();\n    getPos(async l=>{\n      const r=await api('PUT','/api/hub/base/'+encodeURIComponent(id),{loc:{lat:l.lat,lng:l.lng}});\n      b.mark='';\n      if(!r.ok){toast(baseErr(r.data&&r.data.error));paintBase();return}\n      toast(L('Точка магазина сохранена','Doʻkon nuqtasi saqlandi'));\n      loadBase(true);\n    },k=>{\n      b.mark='';\n      toast(geoErr(k)+' '+L('Можно вставить ссылку на карту в форме.','Formaga xarita havolasini qoʻyish mumkin.'));\n      baseOpenForm(x);\n    });\n  };\n  if(x.loc)askConfirm(L('Заменить точку магазина на ваше текущее местоположение? Вы сейчас у магазина?','Doʻkon nuqtasini hozirgi joylashuvingizga almashtiraylikmi? Hozir doʻkon yonidamisiz?'),go);\n  else go();\n}\nasync function baseAccept(id){\n  const b=S.base;if(b.mark||b.busy)return;\n  b.mark=id;paintBase();\n  const r=await api('PUT','/api/hub/base/'+encodeURIComponent(id),{accept:true});\n  b.mark='';\n  if(!r.ok){toast(r.data&&r.data.error==='no_client_loc'?L('Точки от клиента уже нет','Mijoz nuqtasi endi yoʻq'):baseErr(r.data&&r.data.error));loadBase(true);return}\n  toast(L('Точка принята','Nuqta qabul qilindi'));\n  loadBase(true);\n}\n/* «Ближайшие»: спрашиваем, где вы сейчас, и сортируем магазины с точкой по расстоянию */\nfunction baseNear(){\n  const b=S.base;\n  toast(L('Определяем, где вы…','Qayerdaligingiz aniqlanmoqda…'));\n  getPos(l=>{b.near={lat:l.lat,lng:l.lng};b.sort='near';loadBase(true)},k=>toast(geoErr(k)));\n}\n/* блок «Местоположение» в форме магазина: точка хранится в форме и уходит на сервер вместе с остальным по кнопке «Сохранить» */\nfunction baseLocFormHTML(){\n  const b=S.base,l=b.fm.loc;\n  return '<div class=\"full\"><span class=\"lab\">'+L('Местоположение','Joylashuv')+'</span><div class=\"locform\">'\n    +(l?'<div class=\"locok\"><span>✓ '+l.lat.toFixed(5)+', '+l.lng.toFixed(5)+(b.fm.locDirty?' <i>'+L('не сохранено','saqlanmagan')+'</i>':'')+'</span><span class=\"locbtns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"map\" data-lat=\"'+l.lat+'\" data-lng=\"'+l.lng+'\" data-t=\"\">'+L('На карте','Xaritada')+'</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"bfloc-clear\">'+L('Убрать','Olib tashlash')+'</button></span></div>'\n      :'<div class=\"unit\" style=\"margin:0\">'+L('Точка не отмечена. Если вы у магазина, нажмите «Отметить здесь».','Nuqta belgilanmagan. Doʻkon yonida boʻlsangiz, «Shu yerda belgilash» tugmasini bosing.')+'</div>')\n    +'<button type=\"button\" class=\"btn ghost locbtn\" data-act=\"bfloc-here\"'+(b.locBusy?' disabled':'')+'>'+ICO.pin+'<span>'+(b.locBusy?L('Определяем…','Aniqlanmoqda…'):l?L('Обновить здесь','Shu yerda yangilash'):L('Отметить здесь','Shu yerda belgilash'))+'</span></button>'\n    +'<div class=\"locpaste\"><input type=\"text\" id=\"bf-link\" data-bf-link=\"1\" value=\"'+esc(b.link)+'\" placeholder=\"'+esc(L('или ссылка на карту, или «41.5543, 60.6361»','yoki xarita havolasi, yoki «41.5543, 60.6361»'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Ссылка на карту или координаты','Xarita havolasi yoki koordinatalar'))+'\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"bfloc-link\">'+L('Применить','Qoʻllash')+'</button></div>'\n    +'<div class=\"err\" id=\"bflerr\" role=\"alert\"></div></div></div>';\n}\nfunction bfLocHere(){\n  const b=S.base;if(b.locBusy)return;\n  b.locBusy=true;paintBase();\n  getPos(l=>{b.locBusy=false;b.fm.loc={lat:l.lat,lng:l.lng};b.fm.locDirty=true;paintBase()},k=>{b.locBusy=false;paintBase();const e=$('#bflerr');if(e)e.textContent=geoErr(k)});\n}\nfunction bfLocLink(){\n  const b=S.base,l=parseGeo(b.link),e=$('#bflerr');\n  if(!String(b.link||'').trim()){if(e)e.textContent=L('Вставьте ссылку на карту или координаты.','Xarita havolasini yoki koordinatalarni qoʻying.');return}\n  if(!l){if(e)e.textContent=L('Не нашёл координаты. Откройте точку на карте и скопируйте ссылку из адресной строки браузера или координаты вида «41.5543, 60.6361». Короткие ссылки (maps.app.goo.gl) не подойдут.','Koordinatalar topilmadi. Nuqtani xaritada ochib, brauzer manzil satridagi havolani yoki «41.5543, 60.6361» koʻrinishidagi koordinatalarni nusxalang. Qisqa havolalar (maps.app.goo.gl) mos kelmaydi.');return}\n  b.fm.loc=l;b.fm.locDirty=true;b.link='';paintBase();\n}\n\n/* ---------- проверка товаров: владелец ---------- */\nconst modN=()=>S.hub.me&&Number(S.hub.me.modN)||0;\nconst catLabel=p=>(LANG==='uz'&&p.catUz)||p.catName||'';\nasync function hubBin(method,path,blob){\n  try{\n    const h={'content-type':'image/jpeg'};\n    if(S.initData)h['x-init-data']=S.initData;\n    const r=await fetch(path,{method,headers:h,body:blob,cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\n/* быстрые причины: нажатие добавляет фразу в текст, «Другое» только ставит курсор в поле */\nconst RV_WHY=()=>[['nophoto',L('Нет фото','Rasm yoʻq'),L('Нет фото.','Rasm yoʻq.')],['nouz',L('Нет названия по-узбекски','Oʻzbekcha nomi yoʻq'),L('Нет названия по-узбекски.','Oʻzbekcha nomi yoʻq.')],['price',L('Неверная цена','Narx notoʻgʻri'),L('Неверная цена.','Narx notoʻgʻri.')],['name',L('Ошибка в названии','Nomida xato'),L('Ошибка в названии.','Nomida xato bor.')],['other',L('Другое','Boshqa'),'']];\nfunction rvWhen(iso){\n  const t=new Date(iso);\n  if(!iso||isNaN(t.getTime()))return '';\n  const hm=('0'+t.getHours()).slice(-2)+':'+('0'+t.getMinutes()).slice(-2);\n  const a=agoTxt(iso);\n  return a===L('сегодня','bugun')?a+', '+hm:a;\n}\nfunction rvList(){\n  const v=S.rv;\n  if(v.did&&!v.shops.some(x=>x.id===v.did))v.did='';\n  const cats=new Set(v.items.filter(p=>!v.did||p.did===v.did).map(catLabel));\n  if(v.cat&&!cats.has(v.cat))v.cat='';\n  const q=normQ(v.q.trim()).split(/\\s+/).filter(Boolean);\n  return v.items.filter(p=>{\n    if(v.did&&p.did!==v.did)return false;\n    if(v.cat&&catLabel(p)!==v.cat)return false;\n    if(!q.length)return true;\n    const hay=normQ([p.name,p.uz,p.dname,catLabel(p),weightLabel(p)].join(' '));\n    return q.every(w=>hay.indexOf(w)>=0);\n  });\n}\nfunction renderReview(){\n  const v=S.rv;\n  view.innerHTML='<div class=\"wrap page rvpage\"><div class=\"hrow\"><div><div class=\"eyebrow\">'+esc(hubTitle())+'</div><h1>'+L('Проверка товаров','Mahsulotlarni tekshirish')+'</h1></div></div>'\n    +'<div class=\"seg s3\" id=\"rvsegs\" role=\"group\" aria-label=\"'+esc(L('Статус','Holat'))+'\"></div>'\n    +'<div class=\"search\"><input type=\"search\" id=\"rq\" data-rq=\"1\" value=\"'+esc(v.q)+'\" placeholder=\"'+esc(L('Название, дистрибьютор, категория','Nomi, distribyutor, kategoriya'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Поиск','Qidiruv'))+'\"></div>'\n    +'<div id=\"rvbody\"></div><div id=\"rvsheet\"></div></div>';\n  paintReview();\n}\nfunction rvSegsHTML(){\n  const v=S.rv;\n  return [['wait',L('Ждут проверки','Kutmoqda')],['ret',L('Возвращены','Qaytarilgan')],['ok',L('Одобрены','Tasdiqlangan')]].map(x=>'<button type=\"button\" data-act=\"rseg\" data-v=\"'+x[0]+'\" aria-pressed=\"'+(v.seg===x[0])+'\"><span>'+x[1]+'</span><b class=\"cnt'+(x[0]==='wait'&&v.counts.wait?' hot':'')+'\">'+(Number(v.counts[x[0]])||0)+'</b></button>').join('');\n}\nfunction rvFiltersHTML(){\n  const v=S.rv,opt=(val,lab,cur)=>'<option value=\"'+esc(val)+'\"'+(val===cur?' selected':'')+'>'+esc(lab)+'</option>';\n  const cats=[...new Set(v.items.filter(p=>!v.did||p.did===v.did).map(catLabel).filter(Boolean))].sort((a,b)=>a.localeCompare(b));\n  return '<div class=\"rvfil\"><select data-rfil=\"did\" aria-label=\"'+esc(L('Дистрибьютор','Distribyutor'))+'\">'+opt('',L('Все дистрибьюторы','Barcha distribyutorlar'),v.did)+v.shops.map(s=>opt(s.id,s.name+' · '+s.n,v.did)).join('')+'</select>'\n    +'<select data-rfil=\"cat\" aria-label=\"'+esc(L('Категория','Kategoriya'))+'\">'+opt('',L('Все категории','Barcha kategoriyalar'),v.cat)+cats.map(c=>opt(c,c,v.cat)).join('')+'</select></div>';\n}\nfunction rvCard(p){\n  const did=esc(p.did),id=esc(p.id),np=phVers(p).length,w=weightLabel(p),seg=S.rv.seg;\n  const meta=[catLabel(p),w,p.box>1?L('коробка '+p.box+' шт','quti '+p.box+' dona'):'',p.blk>1?L('блок '+p.blk+' шт','blok '+p.blk+' dona'):''].filter(Boolean).join(' · ');\n  const warn=[];\n  if(!p.pv)warn.push(L('нет фото','rasm yoʻq'));\n  if(!String(p.uz||'').trim())warn.push(L('нет названия по-узбекски','oʻzbekcha nomi yoʻq'));\n  const tiers=tiersOf(p).map(x=>'<span>'+L('от '+x.n+' шт — ',x.n+' donadan — ')+money(x.price)+'</span>').join('');\n  const btn=(act,cls,lab)=>'<button type=\"button\" class=\"btn'+cls+'\" data-act=\"'+act+'\" data-did=\"'+did+'\" data-id=\"'+id+'\">'+lab+'</button>';\n  return '<article class=\"rcard\" id=\"rc-'+did+'-'+id+'\"><div class=\"rtop\"><button type=\"button\" class=\"dpill\" data-act=\"rdist\" data-did=\"'+did+'\" aria-label=\"'+esc(L('Показать только: ','Faqat shuni koʻrsatish: ')+p.dname)+'\">'+esc(p.dname)+'</button><span class=\"rtime\">'+esc(rvWhen(seg==='ok'?p.ma:p.mt))+'</span></div>'\n    +'<div class=\"rbody\"><div class=\"rth'+(np?' zm':'')+'\"'+(np?' data-act=\"rzoom\" data-did=\"'+did+'\" data-id=\"'+id+'\"':'')+'>'+(p.pv?'<img src=\"'+imgUrl(p,1,p.did)+'\" alt=\"\" loading=\"lazy\" decoding=\"async\">':'<span class=\"ph\" aria-hidden=\"true\">📦</span>')+(np>1?'<span class=\"pcnt\" aria-hidden=\"true\">'+np+' '+L('фото','rasm')+'</span>':'')+'</div>'\n    +'<div class=\"rtx\"><b>'+esc(p.name)+'</b>'+(p.uz?'<small>'+esc(p.uz)+'</small>':'')+(meta?'<small>'+esc(meta)+'</small>':'')+'<div class=\"rprice\">'+money(p.price)+'</div>'+(tiers?'<div class=\"rtiers\">'+tiers+'</div>':'')+'</div></div>'\n    +(warn.length&&seg!=='ok'?'<div class=\"rwarn\">'+warn.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>':'')\n    +(p.ms==='ret'?modReasonHTML(p):'')\n    +'<div class=\"ract\">'+btn('redit',' ghost',L('Изменить','Tuzatish'))+(seg==='ok'?'':btn('rret',' ghost',L('Вернуть','Qaytarish'))+btn('rok','',L('Одобрить','Tasdiqlash')))+'</div></article>';\n}\nfunction paintReview(){\n  const v=S.rv,body=$('#rvbody');if(!body)return;\n  const sg=$('#rvsegs');if(sg)sg.innerHTML=rvSegsHTML();\n  if(!v.loaded){\n    body.innerHTML=v.err?'<div class=\"empty\"><b>'+L('Не удалось загрузить','Yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"rvreload\">'+L('Повторить','Qayta urinish')+'</button></div>'\n      :'<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n    paintRvSheet();return;\n  }\n  const list=rvList(),total=Number(v.counts[v.seg])||0;\n  let h=v.shops.length>1?rvFiltersHTML():'';\n  h+='<div class=\"rvinfo\"><span>'+L('Показано: ','Koʻrsatilgan: ')+list.length+L(' из ',' / ')+total+'</span>'+(v.seg==='wait'&&list.length?'<button type=\"button\" class=\"btn sm\" data-act=\"rall\">'+L('Одобрить все','Hammasini tasdiqlash')+' ('+list.length+')</button>':'')+'</div>';\n  h+=list.length?list.map(rvCard).join(''):'<div class=\"empty\"><b>'+(total?L('Ничего не найдено','Hech narsa topilmadi'):v.seg==='wait'?L('Всё проверено','Hammasi tekshirilgan'):v.seg==='ret'?L('Возвращённых нет','Qaytarilganlar yoʻq'):L('Одобренных пока нет','Tasdiqlanganlar hozircha yoʻq'))+'</b>'+(total?L('Измените поиск или фильтры.','Qidiruv yoki filtrlarni oʻzgartiring.'):v.seg==='wait'?L('Новые товары продавцов появятся здесь.','Sotuvchilarning yangi mahsulotlari shu yerda paydo boʻladi.'):'')+'</div>';\n  body.innerHTML=h;\n  paintRvSheet();\n}\nasync function loadReview(silent){\n  const v=S.rv,seg=v.seg;\n  if(!silent){v.loaded=false;v.err=false;if(S.view==='review')paintReview()}\n  const r=await api('GET','/api/hub/admin/mod?seg='+seg);\n  if(S.view!=='review'||v.seg!==seg)return;\n  if(!r.ok||!r.data){if(!v.loaded){v.err=true;paintReview()}return}\n  v.items=Array.isArray(r.data.items)?r.data.items:[];v.counts=Object.assign({wait:0,ret:0,ok:0},r.data.counts);v.shops=Array.isArray(r.data.shops)?r.data.shops:[];\n  v.loaded=true;v.err=false;\n  if(S.hub.me)S.hub.me.modN=v.counts.wait;\n  renderNav();\n  if(v.edit||v.ret){const sg=$('#rvsegs');if(sg)sg.innerHTML=rvSegsHTML();return}   // пока открыта шторка, список под ней не трогаем\n  paintReview();\n}\nasync function rvApprove(items){\n  const v=S.rv;if(v.busy||!items.length)return;\n  v.busy=true;\n  const r=await api('POST','/api/hub/admin/mod/approve',{items:items.map(x=>({did:x.did,id:x.id}))});\n  v.busy=false;\n  if(!r.ok||!r.data){toast(L('Не удалось одобрить. Проверьте соединение.','Tasdiqlab boʻlmadi. Ulanishni tekshiring.'));return}\n  const n=Number(r.data.n)||0;\n  toast(n?L('Одобрено: '+n,'Tasdiqlandi: '+n):L('Эти товары уже обработаны','Bu mahsulotlar allaqachon koʻrib chiqilgan'));\n  await loadReview(true);\n}\nfunction rvFind(did,id){return S.rv.items.find(x=>x.did===did&&x.id===id)}\nfunction rvOpenRet(did,id){\n  const it=rvFind(did,id);if(!it)return;\n  S.rv.ret={did,id,name:it.name,dname:it.dname};S.rv.rtxt=it.ms==='ret'?String(it.mc||''):'';\n  paintRvSheet();\n}\n/* шторка «Вернуть товар продавцу» и шторка правки: рисуются один раз при открытии, чтобы поле ввода не теряло курсор */\nfunction paintRvSheet(){\n  const el=$('#rvsheet');if(!el)return;\n  const v=S.rv,key=v.ret?'r:'+v.ret.did+'|'+v.ret.id:v.edit?'e:'+v.edit.did+'|'+v.edit.p.id:'';\n  document.documentElement.classList.toggle('sh-open',!!key&&S.view==='review');\n  if((el.dataset.k||'')===key)return;\n  el.dataset.k=key;\n  if(v.ret){\n    const r=v.ret;\n    el.innerHTML='<div class=\"fs-bg\" data-act=\"rsx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Вернуть товар продавцу','Mahsulotni sotuvchiga qaytarish'))+'\"><div class=\"fs-grab\"></div>'\n      +'<div class=\"fs-head\"><h2>'+L('Вернуть товар продавцу','Mahsulotni sotuvchiga qaytarish')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"rsx\">'+L('Закрыть','Yopish')+'</button></div>'\n      +'<div class=\"fs-body\"><div class=\"rsum\"><b>'+esc(r.name)+'</b><small>'+esc(r.dname)+'</small></div>'\n      +'<div class=\"fs-t\">'+L('Быстрые причины','Tezkor sabablar')+'</div><div class=\"fs-c\" id=\"rwhy\">'+RV_WHY().map(x=>'<button type=\"button\" class=\"chip\" data-act=\"rwhy\" data-k=\"'+x[0]+'\" data-ph=\"'+esc(x[2])+'\" aria-pressed=\"false\">'+esc(x[1])+'</button>').join('')+'</div>'\n      +'<label class=\"lab\" for=\"rtxt\" style=\"margin-top:14px\">'+L('Что нужно исправить','Nimani tuzatish kerak')+'</label><textarea id=\"rtxt\" data-rtxt=\"1\" maxlength=\"300\" rows=\"4\" placeholder=\"'+esc(L('Напишите, что исправить. Продавец получит это сообщением.','Nimani tuzatishni yozing. Sotuvchi buni xabar sifatida oladi.'))+'\">'+esc(v.rtxt)+'</textarea><div class=\"rcount\" id=\"rcount\"></div></div>'\n      +'<div class=\"fs-foot\"><button type=\"button\" class=\"btn\" id=\"rsend\" data-act=\"rsend\" disabled>'+L('Вернуть продавцу','Sotuvchiga qaytarish')+'</button></div></div>';\n    rvRetSync();\n  }else if(v.edit){\n    el.innerHTML=rvEditHTML(v.edit);\n    paintRvPhoto();\n  }else el.innerHTML='';\n}\nfunction rvRetSync(){\n  const v=S.rv,t=v.rtxt.trim(),b=$('#rsend'),c=$('#rcount');\n  if(b)b.disabled=!t||v.busy;\n  if(c)c.textContent=v.rtxt.length+' / 300';\n  document.querySelectorAll('#rwhy .chip').forEach(ch=>{const ph=ch.dataset.ph;ch.setAttribute('aria-pressed',String(!!ph&&v.rtxt.indexOf(ph)>=0))});\n}\nfunction rvWhy(k,ph){\n  const v=S.rv,ta=$('#rtxt');if(!v.ret||!ta)return;\n  if(ph&&v.rtxt.indexOf(ph)<0){\n    const cur=v.rtxt.trim();\n    v.rtxt=((cur?cur+' ':'')+ph).slice(0,300);\n    ta.value=v.rtxt;\n  }\n  rvRetSync();\n  try{ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)}catch(e){}\n}\nasync function rvSend(){\n  const v=S.rv,r0=v.ret,reason=v.rtxt.trim();\n  if(!r0||v.busy||!reason)return;\n  v.busy=true;rvRetSync();\n  const r=await api('POST','/api/hub/admin/mod/return',{did:r0.did,id:r0.id,reason});\n  v.busy=false;\n  if(!r.ok){\n    if(r.status===409){v.ret=null;v.rtxt='';paintRvSheet();toast(L('Этот товар уже обработан','Bu mahsulot allaqachon koʻrib chiqilgan'));loadReview(true);return}\n    rvRetSync();toast(L('Не удалось вернуть. Проверьте соединение.','Qaytarib boʻlmadi. Ulanishni tekshiring.'));return;\n  }\n  v.ret=null;v.rtxt='';paintRvSheet();\n  toast(L('Возвращено продавцу','Sotuvchiga qaytarildi'));\n  await loadReview(true);\n}\n/* --- правка товара владельцем --- */\nfunction rvOpenEdit(did,id){\n  const it=rvFind(did,id);if(!it)return;\n  const shop=S.rv.shops.find(s=>s.id===did);\n  S.rv.edit={did,dname:it.dname,cats:(shop&&shop.cats)||[],p:clone(it),err:'',busy:false,upl:null};\n  paintRvSheet();\n}\nfunction rvEditHTML(e){\n  const p=e.p,fld=(k,lab,inner,cls)=>'<div'+(cls?' class=\"'+cls+'\"':'')+'><label class=\"lab\" for=\"rf-'+k+'\">'+lab+'</label>'+inner+'</div>';\n  const inp=(k,type,val,extra)=>'<input type=\"'+type+'\" id=\"rf-'+k+'\" data-rf=\"'+k+'\" value=\"'+esc(val)+'\"'+(extra||'')+'>';\n  const ta=(k,val)=>'<textarea id=\"rf-'+k+'\" data-rf=\"'+k+'\" maxlength=\"300\" rows=\"2\">'+esc(val)+'</textarea>';\n  const t=tiersOf(p);\n  const tiers=[0,1,2].map(i=>{const x=t[i]||{};return '<div class=\"trow\"><span>'+L('от','dan')+'</span><input type=\"number\" id=\"rtn-'+i+'\" data-rf=\"tn\" inputmode=\"numeric\" min=\"2\" max=\"500\" step=\"1\" value=\"'+(x.n||'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': от скольких штук','Pogʻona '+(i+1)+': necha donadan'))+'\"><span>'+L('шт — цена','dona — narx')+'</span><input type=\"number\" id=\"rtp-'+i+'\" data-rf=\"tp\" inputmode=\"numeric\" min=\"1\" step=\"100\" value=\"'+(x.price||'')+'\" aria-label=\"'+esc(L('Ступень '+(i+1)+': цена за штуку, сум','Pogʻona '+(i+1)+': bir dona narxi, soʻm'))+'\"><span>'+L('сум','soʻm')+'</span></div>'}).join('');\n  return '<div class=\"fs-bg\" data-act=\"rsx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Изменить товар','Mahsulotni tuzatish'))+'\"><div class=\"fs-grab\"></div>'\n    +'<div class=\"fs-head\"><h2>'+L('Изменить товар','Mahsulotni tuzatish')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"rsx\">'+L('Закрыть','Yopish')+'</button></div>'\n    +'<div class=\"fs-body\"><div class=\"rsum\"><span class=\"dpill static\">'+esc(e.dname)+'</span>'+modTag(p)+'</div>'\n    +'<div class=\"pph\" id=\"rvph\"></div>'\n    +'<div class=\"pf rvform\" style=\"margin-top:12px\">'\n    +fld('name',L('Название','Nomi'),inp('name','text',p.name,' maxlength=\"60\"'),'full')\n    +fld('uz',L('Название по-узбекски','Oʻzbekcha nomi'),inp('uz','text',p.uz||'',' maxlength=\"60\"'),'full')\n    +fld('desc',L('Описание','Tavsif'),ta('desc',p.desc||''),'full')\n    +fld('descUz',L('Описание по-узбекски','Oʻzbekcha tavsif'),ta('descUz',p.descUz||''),'full')\n    +fld('cat',L('Категория','Kategoriya'),'<select id=\"rf-cat\" data-rf=\"cat\">'+e.cats.map(c=>'<option value=\"'+esc(c.id)+'\"'+(p.cat===c.id?' selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select>','full')\n    +fld('amount',L('Вес или объём единицы','Birlik ogʻirligi yoki hajmi'),inp('amount','number',p.amount||0,' inputmode=\"decimal\" step=\"any\" min=\"0\"'))\n    +fld('unit',L('Единица','Birlik'),'<select id=\"rf-unit\" data-rf=\"unit\">'+UNIT_IDS.map(u=>'<option value=\"'+u+'\"'+(p.unit===u?' selected':'')+'>'+esc(unitName(u))+'</option>').join('')+'</select>')\n    +fld('price',L('Цена за единицу, сум','Birlik narxi, soʻm'),inp('price','number',p.price||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +fld('tag',L('Метка','Belgi'),'<select id=\"rf-tag\" data-rf=\"tag\"><option value=\"\"'+(!p.tag?' selected':'')+'>'+L('Без метки','Belgisiz')+'</option><option value=\"sale\"'+(p.tag==='sale'?' selected':'')+'>'+tagName('sale')+'</option><option value=\"new\"'+(p.tag==='new'?' selected':'')+'>'+tagName('new')+'</option></select>')\n    +fld('old',L('Старая цена для акции, сум','Aksiya uchun eski narx, soʻm'),inp('old','number',p.old||0,' inputmode=\"numeric\" step=\"500\" min=\"0\"'))\n    +'<div class=\"full\"><span class=\"lab\">'+L('Цена от количества (оптовые ступени)','Miqdorga qarab narx (ulgurji pogʻonalar)')+'</span><div class=\"tiers\">'+tiers+'</div><div class=\"err\" id=\"rtw\" role=\"status\"></div></div>'\n    +fld('blk',L('Штук в блоке (0 — нет блока)','Blokda necha dona (0 — blok yoʻq)'),inp('blk','number',p.blk||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +fld('box',L('Штук в коробке (0 — нет коробки)','Qutida necha dona (0 — quti yoʻq)'),inp('box','number',p.box||0,' inputmode=\"numeric\" step=\"1\" min=\"0\" max=\"500\"'))\n    +'</div></div>'\n    +'<div class=\"fs-foot\"><div class=\"err\" id=\"rerr\" role=\"alert\"></div><button type=\"button\" class=\"btn\" id=\"rsave\" data-act=\"rsave\">'+L('Сохранить','Saqlash')+'</button></div></div>';\n}\nfunction paintRvPhoto(){\n  const e=S.rv.edit,el=$('#rvph');if(!e||!el)return;\n  const p=e.p,cnt=phVers(p).length,busy=!!e.upl;\n  let h='<div class=\"pslots'+(busy?' busy':'')+'\">';\n  for(let i=1;i<=PH_MAX;i++){\n    const inp='<input type=\"file\" class=\"sr\" id=\"rph-'+i+'\" accept=\"image/*\" data-rphoto=\"1\" data-n=\"'+i+'\"'+(busy?' disabled':'')+'>';\n    if(i<=cnt)h+='<div class=\"pslot has'+(e.upl===i?' load':'')+'\"><label for=\"rph-'+i+'\" aria-label=\"'+esc(L('Заменить фото '+i,i+'-rasmni almashtirish'))+'\"><img src=\"'+imgUrl(p,i,e.did)+'\" alt=\"\" decoding=\"async\"></label>'+(i===1?'<span class=\"pmain\">'+L('Главное','Asosiy')+'</span>':'')+(busy?'':'<button type=\"button\" class=\"px\" data-act=\"rphdel\" data-n=\"'+i+'\" aria-label=\"'+esc(L('Убрать фото '+i,i+'-rasmni olib tashlash'))+'\">×</button>')+inp+'</div>';\n    else if(i===cnt+1)h+='<div class=\"pslot add'+(e.upl===i?' load':'')+'\"><label for=\"rph-'+i+'\" aria-label=\"'+esc(L('Добавить фото','Rasm qoʻshish'))+'\"><span>+</span></label>'+inp+'</div>';\n    else h+='<div class=\"pslot ghost\" aria-hidden=\"true\"></div>';\n  }\n  el.innerHTML=h+'</div>';\n}\nfunction rvSyncPhotos(e){\n  const it=rvFind(e.did,e.p.id);\n  if(it)setPhotoVers(it,e.p);\n}\nasync function rvPhotoUp(file,n){\n  const e=S.rv.edit;if(!e||e.upl)return;\n  n=Math.max(1,Math.min(PH_MAX,Number(n)||1));n=Math.min(n,phVers(e.p).length+1);\n  e.upl=n;paintRvPhoto();\n  let ok=false;\n  try{\n    const blob=await shrinkPhoto(file);\n    if(blob){\n      const r=await hubBin('PUT','/api/hub/admin/mod/photo?did='+encodeURIComponent(e.did)+'&id='+encodeURIComponent(e.p.id)+'&n='+n,blob);\n      if(r.ok&&r.data){setPhotoVers(e.p,r.data);rvSyncPhotos(e);ok=true}\n    }\n  }catch(x){}\n  e.upl=null;if(S.rv.edit===e)paintRvPhoto();\n  toast(ok?L('Фото сохранено','Rasm saqlandi'):L('Не удалось загрузить фото. Попробуйте другое изображение.','Rasmni yuklab boʻlmadi. Boshqa rasm tanlang.'));\n}\nasync function rvPhotoDel(n){\n  const e=S.rv.edit;if(!e||e.upl)return;\n  e.upl=Number(n)||1;paintRvPhoto();\n  const r=await api('DELETE','/api/hub/admin/mod/photo?did='+encodeURIComponent(e.did)+'&id='+encodeURIComponent(e.p.id)+'&n='+(Number(n)||1));\n  if(r.ok&&r.data){setPhotoVers(e.p,r.data);rvSyncPhotos(e)}\n  else toast(L('Не удалось убрать фото','Rasmni olib tashlab boʻlmadi'));\n  e.upl=null;if(S.rv.edit===e)paintRvPhoto();\n}\nfunction rvSyncTiers(){\n  const e=S.rv.edit;if(!e)return;\n  const rows=[];\n  for(let i=0;i<3;i++){\n    const a=$('#rtn-'+i),b=$('#rtp-'+i);\n    const n=a?String(a.value).trim():'',pr=b?String(b.value).trim():'';\n    if(n!==''&&pr!=='')rows.push({n:Number(n),price:Number(pr)});\n  }\n  e.p.tiers=cleanTiers(rows,e.p.price);\n  const w=$('#rtw');\n  if(w)w.textContent=e.p.tiers.length<rows.length?L('Одна из строк не учтена: цена ступени должна быть ниже обычной и ниже предыдущей, а количество — больше предыдущего (от 2 до 500).','Qatorlardan biri hisobga olinmadi: pogʻona narxi odatdagidan va oldingisidan past, miqdor esa oldingisidan katta boʻlishi kerak (2 dan 500 gacha).'):'';\n}\nfunction rvField(t){\n  const e=S.rv.edit;if(!e)return;\n  const p=e.p,k=t.dataset.rf;\n  if(k==='amount'||k==='price'||k==='old'){const v=Number(t.value);p[k]=isFinite(v)&&v>=0?v:0;if(k==='price')rvSyncTiers()}\n  else if(k==='blk'||k==='box'){const v=Math.round(Number(t.value));p[k]=v>=2&&v<=500?v:0}\n  else if(k==='tn'||k==='tp')rvSyncTiers();\n  else p[k]=t.value;\n  const er=$('#rerr');if(er)er.textContent='';\n}\nasync function rvSave(){\n  const e=S.rv.edit;if(!e||e.busy||e.upl)return;\n  const p=e.p,er=$('#rerr'),btn=$('#rsave');\n  if(!String(p.name||'').trim()){if(er)er.textContent=L('Укажите название','Nomini kiriting');return}\n  if(!(Number(p.price)>0)){if(er)er.textContent=L('Укажите цену','Narxni kiriting');return}\n  e.busy=true;if(btn)btn.disabled=true;\n  const item={name:p.name,uz:p.uz,desc:p.desc,descUz:p.descUz,cat:p.cat,amount:p.amount,unit:p.unit,price:p.price,tiers:p.tiers||[],blk:p.blk,box:p.box,tag:p.tag,old:p.old};\n  const r=await api('PUT','/api/hub/admin/mod/edit',{did:e.did,id:p.id,item});\n  e.busy=false;\n  if(!r.ok||!r.data||!r.data.item){if(btn)btn.disabled=false;if(er)er.textContent=L('Не удалось сохранить. Проверьте соединение.','Saqlab boʻlmadi. Ulanishni tekshiring.');return}\n  const i=S.rv.items.findIndex(x=>x.did===e.did&&x.id===p.id);\n  if(i>=0){\n    const old=S.rv.items[i],cat=e.cats.find(c=>c.id===r.data.item.cat)||{};\n    S.rv.items[i]=Object.assign({},old,r.data.item,{did:old.did,dname:old.dname,catName:cat.name||'',catUz:cat.uz||''});\n  }\n  S.rv.edit=null;paintReview();\n  toast(L('Сохранено','Saqlandi'));\n}\nfunction rvClose(){\n  const v=S.rv;\n  if(v.edit&&v.edit.busy)return;\n  v.ret=null;v.edit=null;v.rtxt='';\n  paintRvSheet();\n  if(v.loaded)paintReview();\n}\n\n/* ---------- views ---------- */\nfunction render(){\n  renderNav();\n  if(S.view==='shops')renderShops();\n  else if(S.view==='owner')renderOwner();\n  else if(S.view==='shop')renderShop();\n  else if(S.view==='mine')renderMine();\n  else if(S.view==='profile')renderProfile();\n  else if(S.view==='base')renderBase();\n  else if(S.view==='review')renderReview();\n  else if(S.view==='analytics')renderAnalytics();\n  else renderSeller();\n}\nfunction go(v){\n  // каталог, профиль и панель продавца есть только внутри дистрибьютора\n  if(!S.did&&(v==='shop'||v==='profile'||v==='seller'))v='shops';\n  if(v==='owner'&&!isOwner())v='shops';\n  if(v==='base'&&!canBase())v='shops';\n  if(v==='review'&&!isOwner())v='shops';\n  if(v==='analytics'&&!isOwner())v='shops';\n  const was=S.view;\n  if(v==='base'&&was!=='base')baseResetUI();\n  S.view=v;S.cc=null;S.msub=null;setScrollLock();\n  render();window.scrollTo(0,0);\n  if(v==='mine')loadMine();\n  if(v==='shop')loadCfg();\n  if(v==='seller')loadAdmin();\n  if(v==='shops')loadHub();\n  if(v==='owner')loadOwner();\n  if(v==='base')loadBase(true);\n  if(v==='analytics')loadAnalytics();\n  if(v==='review'){S.rv.ret=null;S.rv.edit=null;loadReview()}\n}\n/* ---------- дистрибьюторы: список, переход, раздел владельца ---------- */\n/* Региональный фильтр работает, только если кто-то из дистрибьюторов уже отметил регионы или склад */\nconst regionsInUse=()=>regionsOn()&&S.hub.shops.some(r=>hasZone(r.regions)||r.home);\nfunction shopCardHTML(r){\n  const meta=[],reg=S.region&&regionsInUse()?S.region:'';\n  if(r.items)meta.push(L(r.items+' '+plTovar(r.items),r.items+' ta mahsulot'));\n  if(!r.delivery)meta.push(L('только самовывоз','faqat olib ketish'));\n  else if(hasZone(r.regions)){\n    const n=cleanRegions(r.regions).length;\n    meta.push(reg?(deliversTo(r,reg)?L('доставка к вам','sizga yetkazib beradi'):L('к вам не доставляет, самовывоз','sizga yetkazmaydi, olib ketish')):L('доставка в '+n+' рег.','yetkazib berish: '+n+' ta hudud'));\n  }\n  else meta.push(L('есть доставка','yetkazib berish bor'));\n  if(regionsOn()&&r.home&&regionName(r.home))meta.push(L('склад: ','ombor: ')+regionName(r.home));\n  if(r.minOrder>0)meta.push(L('мин. заказ ','min. buyurtma ')+money(r.minOrder));\n  return '<article class=\"dcard\"><h2>'+esc(r.name)+'</h2><div class=\"dmeta\">'+esc(meta.join(' · '))+'</div>'\n    +((r.cats||[]).length?'<div class=\"dcats\">'+r.cats.map(c=>'<span>'+esc(nm(c))+'</span>').join('')+'</div>':'')\n    +'<button type=\"button\" class=\"btn\" data-act=\"openshop\" data-id=\"'+esc(r.id)+'\">'+L('Открыть каталог','Katalogni ochish')+'</button></article>';\n}\n/* что лежит в корзине сейчас: у открытого дистрибьютора или у другого */\nfunction pendingCart(){\n  if(S.otherCart)return {did:S.otherCart.did,name:otherCartName(),n:otherCartCount()};\n  const n=Object.keys(S.cart).length;\n  return n&&S.did?{did:S.did,name:S.cfg.shop.name||shopNameOf(S.did),n}:null;\n}\n/* Выбор региона магазина */\nfunction regionBarHTML(){\n  return '<div class=\"card regbar\"><label class=\"lab\" for=\"reg-sel\">'+L('Ваш регион','Sizning hududingiz')+'</label><select id=\"reg-sel\" data-reg=\"1\"><option value=\"\">'+L('Выберите регион','Hududni tanlang')+'</option>'\n    +REGIONS.map(r=>'<option value=\"'+r.id+'\"'+(r.id===S.region?' selected':'')+'>'+esc(regionName(r.id))+'</option>').join('')+'</select>'\n    +'<div class=\"unit\">'+(S.region?L('Сначала показываем тех, кто доставляет к вам или находится в вашем регионе.','Avval sizga yetkazib beradigan yoki hududingizdagi distribyutorlar koʻrsatiladi.'):L('Выберите регион, и мы покажем тех, кто доставляет к вам.','Hududni tanlang, sizga yetkazib beradiganlarni koʻrsatamiz.'))+'</div></div>';\n}\n/* Список: сначала те, кто доставляет в регион магазина или находится в нём; остальные (у них можно заказать с самовывозом) спрятаны за кнопкой */\nfunction shopsListHTML(){\n  const all=S.hub.shops;\n  if(!all.length)return '<div class=\"empty\"><b>'+L('Пока нет дистрибьюторов с товарами','Hozircha mahsulotli distribyutorlar yoʻq')+'</b>'+L('Загляните позже.','Keyinroq qaytib keling.')+'</div>';\n  const grid=a=>'<div class=\"dgrid\">'+a.map(shopCardHTML).join('')+'</div>';\n  if(!regionsInUse())return grid(all);\n  const bar=regionBarHTML();\n  if(!S.region)return bar+grid(all);\n  const near=all.filter(r=>servesRegion(r,S.region)),far=all.filter(r=>!servesRegion(r,S.region));\n  if(!far.length)return bar+grid(near);\n  if(!near.length)return bar+'<div class=\"note warnnote\" role=\"status\" style=\"margin-bottom:12px\">'+esc(L('В вашем регионе ('+regionName(S.region)+') пока нет дистрибьюторов с доставкой. Ниже те, у кого можно заказать с самовывозом.','Sizning hududingizda ('+regionName(S.region)+') yetkazib beradigan distribyutorlar hozircha yoʻq. Quyida olib ketish bilan buyurtma berish mumkin boʻlganlar.'))+'</div>'+grid(far);\n  return bar+grid(near)\n    +'<div class=\"row-btns\" style=\"justify-content:center;margin-bottom:14px\"><button type=\"button\" class=\"btn ghost\" data-act=\"showfar\" aria-expanded=\"'+S.showFar+'\">'\n    +(S.showFar?L('Скрыть тех, кто не доставляет к вам','Sizga yetkazib bermaydiganlarni yashirish'):L('Показать и тех, кто не доставляет к вам ('+far.length+')','Sizga yetkazib bermaydiganlarni ham koʻrsatish ('+far.length+')'))+'</button></div>'\n    +(S.showFar?'<p class=\"lead\">'+L('Эти дистрибьюторы не доставляют в ваш регион, но у них можно заказать с самовывозом.','Bu distribyutorlar sizning hududingizga yetkazib bermaydi, lekin olib ketish bilan buyurtma berish mumkin.')+'</p>'+grid(far):'');\n}\nfunction renderShops(){\n  const h=S.hub,me=h.me;\n  let out='<div class=\"wrap page\"><div class=\"hrow\"><div><h1>'+esc(hubTitle())+'</h1><div class=\"tagline\">'+L('Дистрибьюторы и магазины в одном приложении','Distribyutorlar va doʻkonlar bir ilovada')+'</div></div>'\n    +'</div>';\n  if(!h.loaded&&!h.err)out+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!h.loaded)out+='<div class=\"empty\"><b>'+L('Не удалось загрузить список','Roʻyxatni yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"hubreload\">'+L('Повторить','Qayta urinish')+'</button></div>';\n  else{\n    out+='<p class=\"lead\">'+L('Выберите дистрибьютора, чтобы посмотреть каталог и заказать товары. В одной корзине товары только одного дистрибьютора.','Katalog va buyurtma uchun distribyutorni tanlang. Bitta savatda faqat bitta distribyutorning mahsulotlari boʻladi.')+'</p>';\n    const pc=pendingCart();\n    if(pc)out+='<div class=\"note\" style=\"margin-bottom:12px\">🛒 '+esc(L('В корзине '+pc.n+' поз.'+(pc.name?' · «'+pc.name+'»':''),'Savatda '+pc.n+' ta mahsulot'+(pc.name?' · «'+pc.name+'»':'')))+' <button type=\"button\" class=\"btn ghost sm\" data-act=\"opencartshop\" data-id=\"'+esc(pc.did)+'\">'+L('Открыть корзину','Savatni ochish')+'</button></div>';\n    const sells=me&&me.sells||[];\n    if(sells.length)out+='<div class=\"row-btns\" style=\"margin-bottom:14px\">'+sells.map(x=>'<button type=\"button\" class=\"btn ghost sm\" data-act=\"sellerof\" data-id=\"'+esc(x.id)+'\">'+esc(L('Панель продавца: ','Sotuvchi paneli: ')+x.name)+'</button>').join('')+'</div>';\n    out+=shopsListHTML();\n  }\n  view.innerHTML=out+'</div>';\n}\nasync function loadHub(){\n  const r=await api('GET','/api/shops');\n  if(!r.ok||!r.data){\n    if(!S.hub.loaded){S.hub.err=true;if(S.view==='shops')renderShops()}\n    return false;\n  }\n  const d=r.data,h=S.hub;\n  const next={title:d.title||'',shops:Array.isArray(d.shops)?d.shops:[],me:d.me||null,terrs:Array.isArray(d.terrs)?d.terrs:[]};\n  if(d.me){\n    S.auth=true;S.uid=d.me.id;\n    // регион: что выбрано на этом телефоне, то главнее; если здесь пусто, берём с площадки\n    const sr=regionsOn()?cleanRegion(d.me.region):'';\n    if(sr&&!S.region){S.region=sr;saveRegionLocal()}\n    else if(S.region&&sr!==S.region&&!S.regSent){S.regSent=true;api('PUT','/api/hub/region',{region:S.region})}\n  }\n  const same=h.loaded&&JSON.stringify([h.title,h.shops,h.me,h.terrs])===JSON.stringify([next.title,next.shops,next.me,next.terrs]);\n  Object.assign(h,next,{loaded:true,err:false});\n  if(same)return true;\n  renderNav();\n  if(S.view==='shops')renderShops();\n  return true;\n}\n/* Открывает каталог дистрибьютора: всё, что относилось к прежнему, сбрасывается. Возвращает true, если получилось. */\nasync function openShop(did){\n  if(!validDid(did)||S.switching)return false;\n  if(S.did===did)return true;\n  S.switching=true;\n  try{\n    if(S.did&&(S.dirty||S.saving))await flushSave();\n    view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Загружаем каталог','Katalog yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div></div>';\n    let r=S.initData?await api('GET','/api/bootstrap',undefined,did):null;\n    if(!r||r.status===401)r=await api('GET','/api/config',undefined,did);\n    if(!r.ok||!r.data){\n      toast(L('Не удалось открыть каталог. Проверьте соединение.','Katalogni ochib boʻlmadi. Ulanishni tekshiring.'));\n      render();\n      return false;\n    }\n    const d=r.data;\n    S.epoch++;\n    resetShopState();\n    S.did=did;\n    S.cfg=mergeCfg(d.cfg);S.prod=normProd(d.prod);S.off=!!d.off;\n    if(d.me){\n      S.admin=!!d.me.admin;S.profile=d.me.profile||null;S.blocked=!!d.me.blocked;\n      S.fav=Array.isArray(d.me.fav)?d.me.fav:[];\n    }\n    loadCart();pruneCart();normalizeMode();applyProfile();\n    return true;\n  }finally{S.switching=false}\n}\nasync function enterShop(did,v,cart){\n  if(!(await openShop(did))){if(!S.did)S.view='shops';render();return false}\n  S.shopPlaced=null;S.shopStep=cart&&cartCount()>0?'cart':'list';\n  go(v==='seller'&&S.admin?'seller':'shop');\n  return true;\n}\n/* ---------- база магазинов ---------- */\nconst BST=()=>({new:L('Новый','Yangi'),talk:L('Переговоры','Muzokara'),refuse:L('Отказался','Rad etdi')});\nconst terrName=id=>{const t=S.base.terrs.find(x=>x.id===id);return t?t.name:''};\nconst telHref=p=>'tel:'+String(p||'').replace(/[^\\d+]/g,'');\nconst baseW=()=>S.base.role==='owner'||S.base.role==='agent';\nconst baseErr=e=>({\n  bad_name:L('Название — от 2 символов','Nomi kamida 2 belgi boʻlsin'),\n  bad_phone:L('Укажите телефон: не меньше 9 цифр','Telefonni kiriting: kamida 9 ta raqam'),\n  bad_terr:L('Выберите территорию из списка','Roʻyxatdan hududni tanlang'),\n  need_terr:L('Выберите территорию','Hududni tanlang'),\n  too_many:L('В базе уже максимум магазинов','Bazada doʻkonlar maksimal sonda'),\n  forbidden:L('Это действие вам недоступно','Bu amal siz uchun mavjud emas'),\n  bad_loc:L('Точка не распознана. Отметьте её заново.','Nuqta aniqlanmadi. Uni qaytadan belgilang.'),\n  no_client:L('Блокировать можно магазин, у которого есть запись у вас: заказ или профиль в вашем каталоге','Faqat sizda yozuvi bor doʻkonni bloklash mumkin: buyurtma yoki katalogingizdagi profil'),\n  not_found:L('Записи уже нет. Обновите список.','Yozuv topilmadi. Roʻyxatni yangilang.')\n}[e]||L('Не получилось. Проверьте соединение и попробуйте ещё раз.','Bajarib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.'));\nconst dupTxt=x=>L('Такой магазин уже есть в базе: «'+(x&&x.name||'')+'»'+(x&&x.terr&&terrName(x.terr)?' ('+terrName(x.terr)+')':'')+'. Повторно добавить нельзя'+(x&&x.mine?'. Откройте его в списке и исправьте данные.':': его ведёт другой агент.'),\n  'Bunday doʻkon bazada bor: «'+(x&&x.name||'')+'»'+(x&&x.terr&&terrName(x.terr)?' ('+terrName(x.terr)+')':'')+'. Qayta qoʻshib boʻlmaydi'+(x&&x.mine?'. Uni roʻyxatdan ochib, maʼlumotlarni tuzating.':': uni boshqa agent yuritadi.'));\nasync function loadBase(reset){\n  const b=S.base,seq=++b.seq;\n  const r=await api('GET','/api/hub/base?terr='+encodeURIComponent(b.terr)+'&f='+encodeURIComponent(b.f)+'&ag='+encodeURIComponent(b.ag)+'&sort='+encodeURIComponent(b.sort)+(b.sort==='near'&&b.near?'&lat='+b.near.lat+'&lng='+b.near.lng:'')+'&q='+encodeURIComponent(b.q)+(isOwner()||!isAgent()?'&sh='+encodeURIComponent(baseShop())+(b.mc?'&mine=1':''):'')+'&off='+(reset?0:b.items.length));\n  if(seq!==b.seq)return;\n  if(!r.ok||!r.data||!Array.isArray(r.data.items)){\n    if(!b.loaded)b.err=true;else toast(baseErr(r.data&&r.data.error));\n    if(S.view==='base')renderBase();\n    return;\n  }\n  const d=r.data,first=!b.loaded;\n  Object.assign(b,{role:d.role,total:d.total,all:d.all,counts:d.counts||{},unchk:d.unchk||0,terrs:d.terrs||[],mine:d.mine||[],agents:d.agents||[],more:!!d.more,loaded:true,err:false});\n  b.items=reset?d.items:b.items.concat(d.items);\n  if(S.view!=='base')return;\n  if(first)renderBase();else paintBase();\n}\n/* фильтры экрана не переживают выход с него: при новом заходе список полный */\nfunction baseResetUI(){Object.assign(S.base,{terr:'',f:'',ag:'',sort:'',q:'',mc:false,sheet:false,legend:false,cd:'',cx:null,cdd:null,cf:null,cbusy:false,edit:null,ferr:''});S.base.cseq++;setScrollLock()}\nfunction setScrollLock(){const b=S.base,v=S.rv;document.documentElement.classList.toggle('sh-open',!!((S.view==='base'&&(b.sheet||b.legend||b.cd))||(S.view==='review'&&(v.ret||v.edit))))}\nconst ICO={\n  talk:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 5.5h16v11H10l-4.5 3.5v-3.5H4z\"/></svg>',\n  app:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"7\" y=\"2.5\" width=\"10\" height=\"19\" rx=\"2.5\"/><path d=\"M11 18.2h2\"/></svg>',\n  refuse:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6.5 6.5l11 11M17.5 6.5l-11 11\"/></svg>',\n  warn:'<b aria-hidden=\"true\">!</b>',\n  copy:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"9\" y=\"9\" width=\"11\" height=\"11\" rx=\"2.5\"/><path d=\"M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9\"/></svg>',\n  ok:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"/></svg>',\n  edit:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z\"/><path d=\"M14.5 6.5l3 3\"/></svg>',\n  del:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5\"/></svg>',\n  tel:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 4h4l1.5 4-2 1.3a11 11 0 0 0 5.2 5.2L15 12.5l4 1.5v4a1.5 1.5 0 0 1-1.6 1.5C10.7 19 5 13.3 4.5 5.6A1.5 1.5 0 0 1 5 4z\"/></svg>',\n  chev:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6 9.5l6 6 6-6\"/></svg>',\n  pin:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.3\"/></svg>',\n  filt:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 7h9M17 7h3M4 17h3M11 17h9\"/><circle cx=\"15\" cy=\"7\" r=\"2\"/><circle cx=\"9\" cy=\"17\" r=\"2\"/></svg>'\n};\n/* знаки на карточке: что значит каждый — в окне «?»; нажатие на знак оставляет в списке только такие магазины */\nconst SIGNS=()=>({\n  talk:{f:'talk',name:L('Переговоры','Muzokara'),txt:L('Идут переговоры','Muzokaralar bormoqda')},\n  warn:{f:'chk',name:L('Не проверен','Tekshirilmagan'),txt:L('Данные ввёл сам магазин (профиль или заказ), агент ещё не проверил','Maʼlumotlarni doʻkonning oʻzi kiritgan (profil yoki buyurtma), agent hali tekshirmagan')},\n  app:{f:'app',name:L('В приложении','Ilovada'),txt:L('Магазин уже пользуется приложением: заполнил профиль или заказывал','Doʻkon ilovadan foydalanmoqda: profilni toʻldirgan yoki buyurtma bergan')},\n  refuse:{f:'refuse',name:L('Отказался','Rad etdi'),txt:L('Магазин отказался, карточка затемнена','Doʻkon rad etdi, kartochka xiralashtirilgan')}\n});\nconst signOf=x=>{const o=[],w=baseW();if(w&&x.st==='talk')o.push('talk');if(w&&!x.chk)o.push('warn');if(x.app)o.push('app');if(w&&x.st==='refuse')o.push('refuse');return o};\nconst BSTAT=()=>[['','Любые','Har qanday'],['new','Новые','Yangi'],['chk','Не проверены','Tekshirilmagan'],['talk','Переговоры','Muzokara'],['app','В приложении','Ilovada'],['refuse','Отказались','Rad etganlar']];\nconst bFilterN=()=>{const b=S.base;return (b.f?1:0)+(b.ag?1:0)+(b.sort?1:0)};\nconst bAgName=id=>id==='-'?L('Без агента','Agentsiz'):((S.base.agents.find(a=>a.id===id)||{}).name||'');\nfunction renderBase(){\n  const b=S.base,ag=S.hub.me&&S.hub.me.agent,w=baseW();\n  let h='<div class=\"wrap page bpage\">';\n  if(!b.loaded&&!b.err)h+='<h1>'+L('База магазинов','Doʻkonlar bazasi')+'</h1><div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(!b.loaded)h+='<h1>'+L('База магазинов','Doʻkonlar bazasi')+'</h1><div class=\"empty\"><b>'+L('Не удалось загрузить','Yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"basereload\">'+L('Повторить','Qayta urinish')+'</button></div>';\n  else{\n    h+='<div class=\"btop\"><h1 id=\"btitle\"></h1><button type=\"button\" class=\"qbtn\" data-act=\"blegend\" aria-label=\"'+esc(L('Что значат знаки','Belgilar nimani anglatadi'))+'\">?</button>'\n      +(w?'<button type=\"button\" class=\"btn\" data-act=\"basenew\">＋ '+L('Добавить','Qoʻshish')+'</button>':'')+'</div>';\n    if(b.role==='agent'&&ag&&ag.link)h+='<div class=\"alink\"><span class=\"mono small\" title=\"'+esc(L('Ссылка для магазинов: после первого заказа магазин закрепится за вами','Doʻkonlar uchun havola: birinchi buyurtmadan keyin doʻkon sizga biriktiriladi'))+'\">'+esc(ag.link.replace(/^https?:\\/\\//,''))+'</span><button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(ag.link)+'\" data-ok=\"'+esc(L('Ссылка скопирована','Havola nusxalandi'))+'\" data-lab=\"\">'+L('Копировать','Nusxalash')+'</button></div>';\n    h+='<div class=\"search\"><input type=\"search\" id=\"bq\" data-bq=\"1\" value=\"'+esc(b.q)+'\" placeholder=\"'+esc(L('Название, адрес, телефон','Nomi, manzil, telefon'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Поиск','Qidiruv'))+'\"></div><div id=\"bbody\"></div><div id=\"bsheet\"></div>';\n  }\n  view.innerHTML=h+'</div>';\n  if(b.loaded)paintBase();\n}\nfunction baseCardHTML(x){\n  const w=baseW(),b=S.base,sg=signOf(x),SG=SIGNS();\n  const signs=sg.map(k=>w?'<button type=\"button\" class=\"sgn '+k+'\" data-act=\"bsign\" data-v=\"'+SG[k].f+'\" aria-label=\"'+esc(SG[k].name+'. '+L('Показать только такие','Faqat shundaylarini koʻrsatish'))+'\">'+ICO[k]+'</button>'\n    :'<span class=\"sgn '+k+'\" role=\"img\" aria-label=\"'+esc(SG[k].name)+'\">'+ICO[k]+'</span>').join('');\n  const tn=terrName(x.terr);\n  const canDel=b.role==='owner'||(b.role==='agent'&&!x.app);\n  const ib=(cls,act,ico,lab,extra)=>'<button type=\"button\" class=\"ibtn'+cls+'\" data-act=\"'+act+'\" data-id=\"'+esc(x.id)+'\" aria-label=\"'+esc(lab)+'\"'+(extra||'')+'>'+ICO[ico]+'</button>';\n  return '<article class=\"bcard'+(w&&x.st==='refuse'?' dim':'')+'\"><div class=\"bh\"><h3>'+esc(x.name)+'</h3>'+(signs?'<span class=\"bsigns\">'+signs+'</span>':'')+'<span class=\"dtag\">'+esc(tn||(w?L('без района','rayonsiz'):''))+'</span></div>'\n    +(x.addr?'<div class=\"dmeta\">'+esc(x.addr)+'</div>':'')\n    +(w&&x.note?'<div class=\"bnote\">'+esc(x.note)+'</div>':'')\n    +baseLocHTML(x)\n    +(b.role!=='agent'?baseMineHTML(x):'')\n    +'<div class=\"bact'+(w&&!x.chk&&canDel?' tight':'')+'\"><a class=\"bphone\" href=\"'+esc(telHref(x.phone))+'\">'+ICO.tel+'<span>'+esc(x.phone)+'</span></a>'\n    +'<div class=\"bic\"><button type=\"button\" class=\"ibtn\" data-act=\"copy\" data-v=\"'+esc(x.phone)+'\" data-ok=\"'+esc(L('Телефон скопирован','Telefon nusxalandi'))+'\" data-lab=\"\" aria-label=\"'+esc(L('Копировать телефон','Telefonni nusxalash'))+'\">'+ICO.copy+'</button>'\n    +(w?(!x.chk?ib(' ok','basechk','ok',L('Проверено','Tekshirildi'),b.busy?' disabled':''):'')+ib('','baseedit','edit',L('Изменить','Tahrirlash'))+(canDel?ib('','basedel','del',L('Удалить','Oʻchirish'),b.busy?' disabled':''):''):'')\n    +'</div></div></article>';\n}\nfunction baseFormHTML(){\n  const b=S.base,f=b.fm,agent=b.role==='agent';\n  const tl=agent&&b.mine.length?b.terrs.filter(t=>b.mine.includes(t.id)):b.terrs;\n  const opt=(v,lab,cur)=>'<option value=\"'+esc(v)+'\"'+(v===cur?' selected':'')+'>'+esc(lab)+'</option>';\n  return '<div class=\"card\" id=\"bform\"><h3>'+(b.edit==='new'?L('Новый магазин','Yangi doʻkon'):L('Данные магазина','Doʻkon maʼlumotlari'))+'</h3><div class=\"form\">'\n    +'<div class=\"full\"><label class=\"lab\" for=\"bf-name\">'+L('Название магазина','Doʻkon nomi')+'</label><input type=\"text\" id=\"bf-name\" data-bf=\"name\" maxlength=\"60\" value=\"'+esc(f.name)+'\" autocomplete=\"off\"></div>'\n    +'<div><label class=\"lab\" for=\"bf-phone\">'+L('Телефон','Telefon')+'</label><input type=\"tel\" id=\"bf-phone\" data-bf=\"phone\" value=\"'+esc(f.phone)+'\" placeholder=\"+998 90 123 45 67\" autocomplete=\"off\"></div>'\n    +'<div><label class=\"lab\" for=\"bf-terr\">'+L('Территория','Hudud')+'</label><select id=\"bf-terr\" data-bf=\"terr\">'+opt('',agent?L('Выберите территорию','Hududni tanlang'):L('Без территории','Hududsiz'),f.terr)+tl.map(t=>opt(t.id,t.name,f.terr)).join('')+'</select></div>'\n    +'<div class=\"full\"><label class=\"lab\" for=\"bf-addr\">'+L('Адрес','Manzil')+'</label><input type=\"text\" id=\"bf-addr\" data-bf=\"addr\" maxlength=\"200\" value=\"'+esc(f.addr)+'\" autocomplete=\"off\"></div>'\n    +'<div><label class=\"lab\" for=\"bf-st\">'+L('Статус','Holat')+'</label><select id=\"bf-st\" data-bf=\"st\">'+['new','talk','refuse'].map(k=>opt(k,BST()[k],f.st)).join('')+'</select></div>'\n    +(b.role==='owner'?'<div><label class=\"lab\" for=\"bf-agent\">'+L('Агент','Agent')+'</label><select id=\"bf-agent\" data-bf=\"agent\">'+opt('','—',f.agent)+b.agents.map(a=>opt(a.id,a.name,f.agent)).join('')+'</select></div>':'')\n    +baseLocFormHTML()\n    +'<div class=\"full\"><label class=\"lab\" for=\"bf-note\">'+L('Заметка о визите (магазин и дистрибьюторы её не видят)','Tashrif haqida eslatma (doʻkon va distribyutorlar koʻrmaydi)')+'</label><textarea id=\"bf-note\" data-bf=\"note\" rows=\"3\" maxlength=\"500\">'+esc(f.note)+'</textarea></div>'\n    +'</div><div class=\"err\" id=\"bferr\" role=\"alert\">'+esc(b.ferr)+'</div>'\n    +'<div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn\" data-act=\"basesave\"'+(b.busy?' disabled':'')+'>'+(b.busy?L('Сохраняем…','Saqlanmoqda…'):L('Сохранить','Saqlash'))+'</button><button type=\"button\" class=\"btn ghost\" data-act=\"basecancel\"'+(b.busy?' disabled':'')+'>'+L('Отмена','Bekor qilish')+'</button></div></div>';\n}\nfunction bChip(act,k,v,lab,n,on){return '<button type=\"button\" class=\"chip\" data-act=\"'+act+'\" data-k=\"'+k+'\" data-v=\"'+esc(v)+'\" aria-pressed=\"'+on+'\">'+esc(lab)+(n!==undefined?'<span class=\"cnt\">'+n+'</span>':'')+'</button>'}\n/* районы с учётом остальных фильтров; пустые не показываем (кроме выбранного) */\nfunction bTerrList(){\n  const b=S.base,w=baseW();\n  const l=b.terrs.filter(t=>b.counts[t.id]||b.terr===t.id).map(t=>({id:t.id,name:t.name,n:b.counts[t.id]||0}));\n  if(w&&(b.counts['']||b.terr==='-'))l.push({id:'-',name:L('Без района','Rayonsiz'),n:b.counts['']||0});\n  return l;\n}\nfunction paintBase(){\n  const el=$('#bbody');if(!el)return;\n  const b=S.base,w=baseW(),owner=b.role==='owner';\n  const ti=$('#btitle');if(ti)ti.textContent=L('База магазинов','Doʻkonlar bazasi')+' · '+num(b.all);\n  let h=b.edit!==null?baseFormHTML():'';\n  if(!b.all){\n    h+='<div class=\"empty\"><b>'+L('База пока пустая','Baza hozircha boʻsh')+'</b>'+(w?L('Магазин попадает сюда сам, когда заполнит профиль или сделает первый заказ. Ещё можно добавить магазин вручную: кнопка «Добавить».','Doʻkon profilni toʻldirganda yoki birinchi buyurtma berganda oʻzi shu yerga tushadi. Qoʻlda ham qoʻshish mumkin: «Qoʻshish» tugmasi.'):L('Магазины появятся здесь, когда заполнят профиль или сделают первый заказ.','Doʻkonlar profilni toʻldirganda yoki birinchi buyurtma berganda shu yerda paydo boʻladi.'))+'</div>';\n    el.innerHTML=h;paintSheet();return;\n  }\n  const tl=bTerrList(),cur=b.terr&&tl.find(t=>t.id===b.terr);\n  const tsum=Object.keys(b.counts).reduce((a,k)=>a+b.counts[k],0);\n  let bar='<div class=\"bbar\">';\n  if(w)bar+='<button type=\"button\" class=\"chip fbtn'+(bFilterN()?' on':'')+'\" data-act=\"bsheet\" aria-haspopup=\"dialog\">'+ICO.filt+L('Фильтры','Filtrlar')+(bFilterN()?'<span class=\"cnt2\">'+bFilterN()+'</span>':'')+'</button>';\n  if(b.role!=='agent')bar+='<button type=\"button\" class=\"chip'+(b.mc?' on':'')+'\" data-act=\"bmine\" aria-pressed=\"'+b.mc+'\">'+(owner?L('С заказами','Buyurtmalilar'):L('Мои клиенты','Mening mijozlarim'))+'</button>';\n  bar+='<div class=\"chip selc'+(b.terr?' on':'')+'\"><span>'+esc(cur?cur.name:L('Все районы','Barcha rayonlar'))+'</span>'+ICO.chev\n    +'<select data-bterr=\"1\" aria-label=\"'+esc(L('Район','Rayon'))+'\"><option value=\"\"'+(b.terr?'':' selected')+'>'+esc(L('Все районы','Barcha rayonlar'))+' · '+tsum+'</option>'\n    +tl.map(t=>'<option value=\"'+esc(t.id)+'\"'+(b.terr===t.id?' selected':'')+'>'+esc(t.name)+' · '+t.n+'</option>').join('')+'</select></div>';\n  if(w&&b.f){const nm=(BSTAT().find(x=>x[0]===b.f)||[])[1];bar+='<button type=\"button\" class=\"chip on x\" data-act=\"bclr\" data-k=\"f\">'+esc(L(nm||'',(BSTAT().find(x=>x[0]===b.f)||[])[2]||''))+'<span class=\"xx\" aria-hidden=\"true\">✕</span><span class=\"sr\">'+esc(L('Сбросить','Bekor qilish'))+'</span></button>'}\n  if(w&&b.sort==='near')bar+='<button type=\"button\" class=\"chip on x\" data-act=\"bclr\" data-k=\"sort\">'+ICO.pin+L('Ближайшие','Eng yaqinlari')+'<span class=\"xx\" aria-hidden=\"true\">✕</span><span class=\"sr\">'+esc(L('Сбросить','Bekor qilish'))+'</span></button>';\n  if(owner&&b.ag)bar+='<button type=\"button\" class=\"chip on x\" data-act=\"bclr\" data-k=\"ag\">'+esc(bAgName(b.ag))+'<span class=\"xx\" aria-hidden=\"true\">✕</span><span class=\"sr\">'+esc(L('Сбросить','Bekor qilish'))+'</span></button>';\n  bar+='</div>';\n  h+=bar+'<div class=\"bfrow\"><div class=\"bfound\">'+L('Найдено: ','Topildi: ')+num(b.total)+'</div>'+(b.role!=='agent'&&baseShop()?xbtn('clients','','bxport'):'')+'</div>';\n  h+=b.items.length?b.items.map(baseCardHTML).join(''):'<div class=\"empty\"><b>'+L('Никого не найдено','Hech kim topilmadi')+'</b>'+(b.mc&&!b.q&&!b.f&&!b.terr&&!b.ag?(owner?L('Пока никто не заказывал. Нажмите «С заказами», чтобы увидеть всю базу.','Hozircha hech kim buyurtma bermagan. Butun bazani koʻrish uchun «Buyurtmalilar» tugmasini bosing.'):L('У вас ещё никто не заказывал. Нажмите «Мои клиенты», чтобы увидеть всю базу.','Sizdan hali hech kim buyurtma bermagan. Butun bazani koʻrish uchun «Mening mijozlarim» tugmasini bosing.')):L('Измените поиск или фильтры.','Qidiruv yoki filtrlarni oʻzgartiring.'))+'</div><div class=\"row-btns\" style=\"justify-content:center;margin-bottom:14px\"><button type=\"button\" class=\"btn ghost\" data-act=\"breset\">'+L('Сбросить фильтры','Filtrlarni tozalash')+'</button></div>';\n  if(b.more)h+='<div class=\"row-btns\" style=\"justify-content:center;margin-bottom:14px\"><button type=\"button\" class=\"btn ghost\" data-act=\"basemore\">'+L('Показать ещё','Yana koʻrsatish')+'</button></div>';\n  el.innerHTML=h;\n  paintSheet();\n}\n/* нижняя панель: фильтры и пояснение знаков */\nfunction paintSheet(){\n  const el=$('#bsheet');if(!el)return;\n  const b=S.base,w=baseW(),owner=b.role==='owner';\n  setScrollLock();\n  if(b.cd){el.innerHTML=clientSheetHTML();return}\n  if(b.legend){\n    const SG=SIGNS(),ks=w?['talk','warn','app','refuse']:['app'];\n    el.innerHTML='<div class=\"fs-bg\" data-act=\"bsheetx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Что значат знаки','Belgilar nimani anglatadi'))+'\"><div class=\"fs-grab\"></div>'\n      +'<div class=\"fs-head\"><h2>'+L('Что значат знаки','Belgilar nimani anglatadi')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"bsheetx\">'+L('Закрыть','Yopish')+'</button></div><div class=\"fs-body\">'\n      +ks.map(k=>(w?'<button type=\"button\" class=\"lgd\" data-act=\"bsign\" data-v=\"'+SG[k].f+'\">':'<div class=\"lgd\">')+'<span class=\"sgn '+k+'\">'+ICO[k]+'</span><span><b>'+esc(SG[k].name)+'</b><small>'+esc(SG[k].txt)+'</small></span>'+(w?'</button>':'</div>')).join('')\n      +'<p class=\"lgn\">'+(w?L('Нет знака — магазин новый или уже проверен. Нажмите на знак, и в списке останутся только такие магазины.','Belgi yoʻq — doʻkon yangi yoki allaqachon tekshirilgan. Belgini bossangiz, roʻyxatda faqat shunday doʻkonlar qoladi.'):L('Нет знака — магазин ещё не пользуется приложением.','Belgi yoʻq — doʻkon ilovadan hali foydalanmayapti.'))+'</p></div></div>';\n    return;\n  }\n  if(!b.sheet||!w){el.innerHTML='';return}\n  const grp=(t,body)=>'<div class=\"fs-g\"><div class=\"fs-t\">'+t+'</div><div class=\"fs-c\">'+body+'</div></div>';\n  let h=grp(L('Статус','Holat'),BSTAT().map(x=>bChip('bset','f',x[0],L(x[1],x[2]),x[0]==='chk'?b.unchk:undefined,b.f===x[0])).join(''));\n  const tl=bTerrList(),tsum=Object.keys(b.counts).reduce((a,k)=>a+b.counts[k],0);\n  h+=grp(L('Район','Rayon'),bChip('bset','terr','',L('Все','Hammasi'),tsum,b.terr==='')+tl.map(t=>bChip('bset','terr',t.id,t.name,t.n,b.terr===t.id)).join(''));\n  if(owner)h+=grp(L('Агент','Agent'),bChip('bset','ag','',L('Все','Hammasi'),undefined,b.ag==='')+b.agents.map(a=>bChip('bset','ag',a.id,a.name,undefined,b.ag===a.id)).join('')+bChip('bset','ag','-',L('Без агента','Agentsiz'),undefined,b.ag==='-'));\n  h+=grp(L('Порядок','Tartib'),bChip('bset','sort','',L('По названию','Nomi boʻyicha'),undefined,b.sort==='')+bChip('bset','sort','new',L('Сначала новые','Avval yangilari'),undefined,b.sort==='new')+bChip('bset','sort','near',L('Ближайшие','Eng yaqinlari'),undefined,b.sort==='near'));\n  const n=b.total;\n  el.innerHTML='<div class=\"fs-bg\" data-act=\"bsheetx\"></div><div class=\"fs\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(L('Фильтры','Filtrlar'))+'\"><div class=\"fs-grab\"></div>'\n    +'<div class=\"fs-head\"><h2>'+L('Фильтры','Filtrlar')+'</h2><button type=\"button\" class=\"lnk\" data-act=\"breset\">'+L('Сбросить','Tozalash')+'</button></div><div class=\"fs-body\">'+h+'</div>'\n    +'<div class=\"fs-foot\"><button type=\"button\" class=\"btn\" data-act=\"bsheetx\">'+L('Показать '+n+' '+plShop(n),n+' ta doʻkonni koʻrsatish')+'</button></div></div>';\n}\nconst plShop=n=>{const a=n%100,b=n%10;return a>10&&a<15?'магазинов':b===1?'магазин':b>1&&b<5?'магазина':'магазинов'};\nfunction baseOpenForm(x){\n  const b=S.base;\n  let terr=x?x.terr:(b.terr&&b.terr!=='-'?b.terr:'');\n  if(!x&&b.role==='agent'&&!terr&&b.mine.length===1)terr=b.mine[0];\n  b.edit=x?x.id:'new';b.ferr='';\n  b.fm=x?{name:x.name,phone:x.phone,addr:x.addr||'',terr:x.terr||'',st:x.st||'new',note:x.note||'',agent:x.agent||'',loc:x.loc?{lat:x.loc.lat,lng:x.loc.lng}:null,locDirty:false}:{name:'',phone:'',addr:'',terr,st:'new',note:'',agent:'',loc:null,locDirty:false};b.link='';\n  paintBase();\n  const f=$('#bform');if(f)try{f.scrollIntoView({block:'start',behavior:'smooth'})}catch(e){}\n}\nasync function baseSave(){\n  const b=S.base;if(b.busy||b.edit===null)return;\n  const f=b.fm,body={name:f.name.trim(),phone:f.phone.trim(),addr:f.addr.trim(),terr:f.terr,st:f.st,note:f.note.trim()};\n  if(b.role==='owner')body.agent=f.agent||'';\n  if(f.locDirty)body.loc=f.loc?{lat:f.loc.lat,lng:f.loc.lng}:null;   // точку шлём, только если её меняли\n  if(body.name.length<2){b.ferr=baseErr('bad_name');paintBase();return}\n  if(body.phone.replace(/\\D/g,'').length<9){b.ferr=baseErr('bad_phone');paintBase();return}\n  const isNew=b.edit==='new';\n  b.busy=true;b.ferr='';paintBase();\n  const r=await api(isNew?'POST':'PUT','/api/hub/base'+(isNew?'':'/'+encodeURIComponent(b.edit)),body);\n  b.busy=false;\n  if(!r.ok||!r.data){b.ferr=r.data&&r.data.error==='dup'?dupTxt(r.data.exists):baseErr(r.data&&r.data.error);paintBase();return}\n  b.edit=null;\n  toast(isNew?L('Магазин добавлен в базу','Doʻkon bazaga qoʻshildi'):L('Данные сохранены','Maʼlumotlar saqlandi'));\n  loadBase(true);\n}\nasync function baseCheck(id){\n  const b=S.base;if(b.busy)return;\n  b.busy=true;paintBase();\n  const r=await api('PUT','/api/hub/base/'+encodeURIComponent(id),{});\n  b.busy=false;\n  if(!r.ok||!r.data){toast(baseErr(r.data&&r.data.error));paintBase();return}\n  toast(L('Отмечено: данные проверены','Belgilandi: maʼlumotlar tekshirildi'));\n  loadBase(true);\n}\nfunction baseDelete(id){\n  const x=S.base.items.find(y=>y.id===id);if(!x||S.base.busy)return;\n  askConfirm(L('Удалить магазин «'+x.name+'» из базы?','«'+x.name+'» doʻkonini bazadan oʻchirasizmi?'),async()=>{\n    const b=S.base;b.busy=true;paintBase();\n    const r=await api('DELETE','/api/hub/base/'+encodeURIComponent(id));\n    b.busy=false;\n    if(!r.ok){toast(baseErr(r.data&&r.data.error));paintBase();return}\n    toast(L('Магазин удалён из базы','Doʻkon bazadan oʻchirildi'));\n    loadBase(true);\n  });\n}\nconst ownErr=e=>({\n  bad_name:L('Название — от 2 символов','Nomi kamida 2 belgi boʻlsin'),\n  too_many:L('Больше дистрибьюторов добавить нельзя','Boshqa distribyutor qoʻshib boʻlmaydi'),\n  bad_pct:L('Процент — число от 0 до 50','Foiz — 0 dan 50 gacha son'),\n  weak_code:L('Код должен быть не короче 12 символов','Kod kamida 12 belgidan iborat boʻlsin'),\n  code_taken:L('Такой код уже занят, придумайте другой','Bu kod band, boshqasini oʻylab toping'),\n  forbidden:L('Раздел только для владельца','Boʻlim faqat egasi uchun')\n}[e]||L('Не получилось. Проверьте соединение и попробуйте ещё раз.','Bajarib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.'));\n/* перерисовывает раздел владельца, но не сбивает того, кто сейчас печатает в поле */\nfunction ownRefresh(){\n  if(S.view!=='owner')return;\n  const ae=document.activeElement;\n  if(ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)&&view.contains(ae))return;\n  renderOwner();\n}\nasync function loadOwner(){\n  if(!isOwner())return;\n  loadOwnerStats();\n  loadOwnerPeople();\n  const r=await api('GET','/api/hub/admin/shops');\n  const o=S.own;\n  if(!r.ok||!r.data){o.err=true;o.loaded=true;if(S.view==='owner')renderOwner();return}\n  o.shops=r.data.shops||[];o.title=r.data.title||'';o.max=r.data.max||50;o.err=false;o.loaded=true;\n  ownRefresh();\n}\nasync function loadOwnerStats(){\n  if(!isOwner())return;\n  const o=S.own,per=o.period;\n  const r=await api('GET','/api/hub/admin/stats?period='+encodeURIComponent(per));\n  if(per!==o.period)return;   // пока грузилось, выбрали другой период\n  if(r.ok&&r.data&&Array.isArray(r.data.rows)){o.stats=r.data;o.serr=false}\n  else o.serr=true;\n  ownRefresh();\n}\nconst fmtPct=p=>String(p).replace('.',',');\n/* «Заказы и комиссия»: сводка по всем дистрибьюторам за выбранный период. Составы заказов и клиенты здесь не показываются. */\nfunction ownStatsHTML(){\n  const o=S.own,st=o.stats;\n  const per=[['7d',L('7 дней','7 kun')],['30d',L('30 дней','30 kun')],['month',L('Этот месяц','Shu oy')],['prev',L('Прошлый месяц','Oʻtgan oy')]];\n  let h='<div class=\"card\"><h3>'+L('Заказы и комиссия','Buyurtmalar va komissiya')+'</h3>'\n    +'<div class=\"filters\" style=\"margin:8px 0\">'+per.map(p=>'<button type=\"button\" class=\"chip\" data-act=\"ownper\" data-v=\"'+p[0]+'\" aria-pressed=\"'+(o.period===p[0])+'\">'+esc(p[1])+'</button>').join('')+'</div>';\n  if(!st||st.period!==o.period){\n    h+=o.serr?'<div class=\"note\">'+L('Не удалось загрузить сводку. Проверьте соединение.','Hisobotni yuklab boʻlmadi. Ulanishni tekshiring.')+' <button type=\"button\" class=\"btn ghost sm\" data-act=\"ownreload\">'+L('Повторить','Qayta urinish')+'</button></div>'\n      :'<div class=\"unit\">'+L('Считаем…','Hisoblanmoqda…')+'</div>';\n    return h+'</div>';\n  }\n  const t=st.total;\n  h+='<div class=\"unit\">'+esc(fDay(st.from)+' — '+fDay(st.to))+'</div><div class=\"sum\">'\n    +'<div class=\"r\"><span>'+L('Выдано заказов','Topshirilgan buyurtmalar')+'</span><span>'+num(t.n)+'</span></div>'\n    +'<div class=\"r\"><span>'+L('Товаров на сумму','Mahsulotlar summasi')+'</span><span>'+esc(money(t.base))+'</span></div>'\n    +(t.active?'<div class=\"r\"><span>'+L('Сейчас в работе','Hozir jarayonda')+'</span><span>'+num(t.active)+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('Комиссия к получению','Olinadigan komissiya')+'</span><span>'+esc(money(t.cm))+'</span></div></div>'\n    +'<div class=\"note\" style=\"margin-top:12px\">'+L('Считаются только выданные и доставленные заказы. Комиссия — процент от суммы товаров после скидки, без доставки. Процент у каждого дистрибьютора свой, его можно менять ниже. Новый процент действует на заказы, выданные после изменения, прежние не пересчитываются. Деньги приложение не собирает: клиенты платят дистрибьютору при получении, а комиссию вы получаете с него сами.','Faqat topshirilgan va yetkazilgan buyurtmalar hisoblanadi. Komissiya — chegirmadan keyingi mahsulotlar summasidan foiz, yetkazib berishsiz. Har bir distribyutorning foizi alohida, uni quyida oʻzgartirish mumkin. Yangi foiz oʻzgartirilgandan keyin topshirilgan buyurtmalarga amal qiladi, avvalgilari qayta hisoblanmaydi. Ilova pul yigʻmaydi: mijozlar distribyutorga olganda toʻlaydi, komissiyani esa siz undan oʻzingiz olasiz.')+'</div></div>';\n  return h;\n}\nasync function ownPct(id){\n  const o=S.own;if(o.busy)return;\n  const row=o.stats&&o.stats.rows.find(x=>x.id===id);\n  const raw=String(o.pcts[id]!==undefined?o.pcts[id]:(row?row.pct:'')).trim().replace(',','.');\n  const v=Number(raw);\n  if(raw===''||!isFinite(v)||v<0||v>50){toast(ownErr('bad_pct'));return}\n  o.busy='pct';renderOwner();\n  const r=await api('PUT','/api/hub/admin/shops/'+encodeURIComponent(id),{pct:v});\n  o.busy='';\n  if(r.ok&&r.data&&typeof r.data.pct==='number'){\n    delete o.pcts[id];\n    toast(L('Процент сохранён: '+fmtPct(r.data.pct)+'%. Он действует на заказы, которые выдаются с этого момента.','Foiz saqlandi: '+fmtPct(r.data.pct)+'%. U shu paytdan topshiriladigan buyurtmalarga amal qiladi.'));\n  }else toast(ownErr(r.data&&r.data.error));\n  renderOwner();\n  loadOwnerStats();\n}\nfunction renderOwner(){\n  const o=S.own;\n  let h='<div class=\"wrap page\"><button type=\"button\" class=\"btn ghost sm backlink\" data-act=\"shops\">← '+L('Все дистрибьюторы','Barcha distribyutorlar')+'</button><h1>'+L('Дистрибьюторы','Distribyutorlar')+'</h1>';\n  if(!o.loaded)h+='<div class=\"empty\"><b>'+L('Загружаем','Yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div>';\n  else if(o.err)h+='<div class=\"empty\"><b>'+L('Не удалось загрузить','Yuklab boʻlmadi')+'</b>'+L('Проверьте соединение и попробуйте ещё раз.','Ulanishni tekshirib, qayta urinib koʻring.')+'</div><div class=\"row-btns\" style=\"margin-top:14px;justify-content:center\"><button type=\"button\" class=\"btn\" data-act=\"ownreload\">'+L('Повторить','Qayta urinish')+'</button></div>';\n  else{\n    h+='<p class=\"lead\">'+L('Каждому дистрибьютору вы даёте личный код. Он пишет боту «/admin КОД», становится продавцом и сам добавляет товары в приложении.','Har bir distribyutorga shaxsiy kod berasiz. U botga «/admin KOD» deb yozadi, sotuvchi boʻladi va mahsulotlarni ilovada oʻzi qoʻshadi.')+'</p>';\n    if(o.made){\n      const m=o.made;\n      h+='<div class=\"card codebox\"><h3>'+esc(m.reset?L('Новый код: ','Yangi kod: ')+m.name:L('Дистрибьютор добавлен: ','Distribyutor qoʻshildi: ')+m.name)+'</h3>'\n        +'<div class=\"unit\">'+L('Сохраните код сейчас: потом он нигде не показывается. Отправьте его дистрибьютору.','Kodni hozir saqlang: keyin u hech qayerda koʻrsatilmaydi. Uni distribyutorga yuboring.')+'</div>'\n        +'<div class=\"mono\">'+esc(m.code)+'</div>'\n        +'<div class=\"row-btns\" style=\"margin:12px 0\"><button type=\"button\" class=\"btn\" data-act=\"copy\" data-v=\"'+esc(m.code)+'\" data-ok=\"'+esc(L('Код скопирован','Kod nusxalandi'))+'\" data-lab=\"'+esc(L('Код: ','Kod: '))+'\">'+L('Копировать код','Kodni nusxalash')+'</button>'\n        +'<button type=\"button\" class=\"btn ghost\" data-act=\"copy\" data-v=\"/admin '+esc(m.code)+'\" data-ok=\"'+esc(L('Команда скопирована','Buyruq nusxalandi'))+'\" data-lab=\"\">'+L('Копировать «/admin КОД»','«/admin KOD» nusxalash')+'</button></div>'\n        +'<div class=\"note\">'+L('Дистрибьютор открывает бота, отправляет «/admin КОД» (бот сразу удалит сообщение с кодом) и нажимает «Открыть приложение». Заказы будут приходить ему в бот.','Distribyutor botni ochib, «/admin KOD» yuboradi (bot kod yozilgan xabarni darhol oʻchiradi) va «Ilovani ochish» tugmasini bosadi. Buyurtmalar botga keladi.')+'</div>'\n        +'<div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"ownmadeclose\">'+L('Готово, код сохранён','Tayyor, kod saqlandi')+'</button></div></div>';\n    }\n    h+=ownStatsHTML();\n    h+=ownPeopleHTML();\n    const full=o.shops.length>=o.max;\n    h+='<div class=\"card\"><h3>'+L('Добавить дистрибьютора','Distribyutor qoʻshish')+'</h3><div class=\"form\">'\n      +'<div><label class=\"lab\" for=\"o-name\">'+L('Название компании','Kompaniya nomi')+'</label><input type=\"text\" id=\"o-name\" data-own=\"fname\" maxlength=\"60\" value=\"'+esc(o.fname)+'\" autocomplete=\"off\"></div>'\n      +'<div><label class=\"lab\" for=\"o-code\">'+L('Свой код (от 12 символов) или пусто — придумаем','Oʻz kodingiz (12 belgidan) yoki boʻsh — oʻzimiz yaratamiz')+'</label><input type=\"text\" id=\"o-code\" data-own=\"fcode\" maxlength=\"64\" value=\"'+esc(o.fcode)+'\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\"></div>'\n      +'</div><div class=\"err\" id=\"o-err\" role=\"alert\">'+esc(o.err2||'')+'</div>'\n      +'<div class=\"row-btns\" style=\"margin-top:14px\"><button type=\"button\" class=\"btn\" id=\"ownadd\" data-act=\"ownadd\"'+(o.busy||full?' disabled':'')+'>'+(o.busy==='add'?L('Добавляем…','Qoʻshilmoqda…'):L('Добавить','Qoʻshish'))+'</button></div>'\n      +(full?'<div class=\"note\" style=\"margin-top:10px\">'+esc(ownErr('too_many'))+'</div>':'')+'</div>';\n    h+=o.shops.map(r=>{\n      const sure=o.rc===r.id;\n      const meta=[L(r.items+' '+plTovar(r.items),r.items+' ta mahsulot'),L('продавцов: '+r.sellers,'sotuvchilar: '+r.sellers),r.own?L('код выдан','kod berilgan'):L('кода нет','kod yoʻq')];\n      return '<div class=\"card\"><div class=\"hrow\"><h3 style=\"margin:0\">'+esc(r.name)+'</h3><span class=\"dtag\">'+(r.on?L('в списке','roʻyxatda'):L('скрыт','yashirin'))+'</span></div>'\n        +'<div class=\"dmeta\" style=\"margin-bottom:12px\">'+esc(meta.join(' · '))+'</div>'+ownShopStatsHTML(r.id)+'<div class=\"row-btns\">'\n        +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"openshop\" data-id=\"'+esc(r.id)+'\">'+L('Открыть каталог','Katalogni ochish')+'</button>'\n        +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"owntoggle\" data-id=\"'+esc(r.id)+'\"'+(o.busy?' disabled':'')+'>'+(r.on?L('Скрыть и закрыть заказы','Yashirish va buyurtmani yopish'):L('Вернуть в список','Roʻyxatga qaytarish'))+'</button>'\n        +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"ownreset\" data-id=\"'+esc(r.id)+'\"'+(o.busy?' disabled':'')+'>'+(sure?L('Точно? Прежние продавцы потеряют доступ','Aniqmi? Avvalgi sotuvchilar kirolmaydi'):L('Новый код','Yangi kod'))+'</button>'\n        +(r.link?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(r.link)+'\" data-ok=\"'+esc(L('Ссылка скопирована','Havola nusxalandi'))+'\" data-lab=\"\">'+L('Ссылка для клиентов','Mijozlar uchun havola')+'</button>':'')\n        +'</div></div>';\n    }).join('');\n    const tv=o.ftitle===null?o.title:o.ftitle;\n    h+='<div class=\"card\"><h3>'+L('Название площадки','Platforma nomi')+'</h3><div class=\"unit\">'+L('Показывается наверху списка дистрибьюторов.','Distribyutorlar roʻyxati tepasida koʻrsatiladi.')+'</div><div class=\"form\"><div class=\"full\"><input type=\"text\" id=\"o-title\" data-own=\"ftitle\" maxlength=\"60\" value=\"'+esc(tv)+'\" aria-label=\"'+esc(L('Название площадки','Platforma nomi'))+'\"></div></div>'\n      +'<div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn ghost\" data-act=\"owntitle\"'+(o.busy?' disabled':'')+'>'+L('Сохранить название','Nomni saqlash')+'</button></div></div>';\n  }\n  view.innerHTML=h+'</div>';\n}\n/* у каждого дистрибьютора: выданные заказы за период, комиссия и поле процента */\nfunction ownShopStatsHTML(id){\n  const o=S.own,st=o.stats,x=st&&st.period===o.period?st.rows.find(y=>y.id===id):null;\n  if(!x)return '';\n  if(x.err)return '<div class=\"note\" style=\"margin-bottom:12px\">'+L('Нет данных по этому дистрибьютору.','Bu distribyutor boʻyicha maʼlumot yoʻq.')+'</div>';\n  const pv=o.pcts[id]!==undefined?o.pcts[id]:fmtPct(x.pct);\n  return '<div class=\"sum\" style=\"margin-bottom:6px\">'\n    +'<div class=\"r\"><span>'+L('Выдано заказов','Topshirilgan buyurtmalar')+'</span><span>'+num(x.n)+'</span></div>'\n    +'<div class=\"r\"><span>'+L('Товаров на сумму','Mahsulotlar summasi')+'</span><span>'+esc(money(x.base))+'</span></div>'\n    +(x.active?'<div class=\"r\"><span>'+L('Сейчас в работе','Hozir jarayonda')+'</span><span>'+num(x.active)+'</span></div>':'')\n    +'<div class=\"r t\"><span>'+L('Комиссия ','Komissiya ')+esc(fmtPct(x.pct))+'%</span><span>'+esc(money(x.cm))+'</span></div></div>'\n    +'<div class=\"pctrow\"><div><label class=\"lab\" for=\"pc-'+esc(id)+'\">'+L('Процент комиссии, %','Komissiya foizi, %')+'</label><input type=\"text\" inputmode=\"decimal\" id=\"pc-'+esc(id)+'\" data-opct=\"'+esc(id)+'\" maxlength=\"5\" value=\"'+esc(pv)+'\" autocomplete=\"off\"></div>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"ownpct\" data-id=\"'+esc(id)+'\"'+(o.busy?' disabled':'')+'>'+L('Сохранить %','% ni saqlash')+'</button></div>';\n}\nasync function ownAdd(){\n  const o=S.own;if(o.busy)return;\n  const name=o.fname.trim(),code=o.fcode.trim();\n  if(name.length<2){o.err2=ownErr('bad_name');renderOwner();return}\n  if(code&&code.length<12){o.err2=ownErr('weak_code');renderOwner();return}\n  o.busy='add';o.err2='';renderOwner();\n  const r=await api('POST','/api/hub/admin/shops',code?{name,code}:{name});\n  o.busy='';\n  if(!r.ok||!r.data){o.err2=ownErr(r.data&&r.data.error);renderOwner();return}\n  o.shops=o.shops.concat([r.data.shop]);\n  o.made={name:r.data.shop.name,code:r.data.code,reset:false};\n  o.fname='';o.fcode='';\n  renderOwner();window.scrollTo(0,0);\n  loadHub();\n}\nasync function ownToggle(id){\n  const o=S.own,rec=o.shops.find(x=>x.id===id);if(!rec||o.busy)return;\n  o.busy='tg';renderOwner();\n  const r=await api('PUT','/api/hub/admin/shops/'+encodeURIComponent(id),{on:!rec.on});\n  o.busy='';\n  if(r.ok&&r.data&&r.data.shop)o.shops=o.shops.map(x=>x.id===id?r.data.shop:x);\n  else toast(ownErr(r.data&&r.data.error));\n  renderOwner();\n  loadHub();\n}\n/* ---------- владелец: база, территории и агенты ---------- */\nconst NAVOI_TERR=['Навои','Зарафшан','Учкудук','Кармана','Нурата','Навбахор','Конимех','Томды','Хатырчи','Кызылтепа'];\nconst peopleErr=e=>({\n  bad_name:L('Название — от 2 символов','Nomi kamida 2 belgi boʻlsin'),\n  terr_dup:L('Такая территория уже есть (или нечего добавлять)','Bunday hudud bor (yoki qoʻshadigan narsa yoʻq)'),\n  terr_used:L('В этой территории есть магазины. Сначала перенесите их в другую.','Bu hududda doʻkonlar bor. Avval ularni boshqasiga oʻtkazing.'),\n  too_many:L('Больше добавить нельзя','Koʻproq qoʻshib boʻlmaydi'),\n  weak_code:L('Код должен быть не короче 12 символов','Kod kamida 12 belgidan iborat boʻlsin'),\n  code_taken:L('Такой код уже занят, придумайте другой','Bu kod band, boshqasini oʻylab toping'),\n  forbidden:L('Раздел только для владельца','Boʻlim faqat egasi uchun')\n}[e]||L('Не получилось. Проверьте соединение и попробуйте ещё раз.','Bajarib boʻlmadi. Ulanishni tekshirib, qayta urinib koʻring.'));\nasync function loadOwnerPeople(){\n  if(!isOwner())return;\n  const r=await api('GET','/api/hub/admin/people');\n  if(r.ok&&r.data&&Array.isArray(r.data.terr)){S.own.ppl=r.data;ownRefresh()}\n}\n/* одно действие владельца: показывает занятость, обновляет список, возвращает ответ сервера или null */\nasync function peopleCall(method,path,body){\n  const o=S.own;if(o.pbusy)return null;\n  o.pbusy=true;o.perr='';renderOwner();\n  const r=await api(method,'/api/hub/admin'+path,body);\n  o.pbusy=false;\n  if(!r.ok||!r.data){o.perr=peopleErr(r.data&&r.data.error);renderOwner();return null}\n  o.ppl=r.data.state||r.data;\n  renderOwner();\n  return r.data;\n}\nfunction ownPeopleHTML(){\n  const o=S.own,p=o.ppl,dis=o.pbusy?' disabled':'';\n  if(!p)return '<div class=\"card\"><h3>'+L('База магазинов','Doʻkonlar bazasi')+'</h3><div class=\"unit\">'+L('Загружаем…','Yuklanmoqda…')+'</div></div>';\n  let h='<div class=\"card\"><h3>'+L('База магазинов','Doʻkonlar bazasi')+'</h3><div class=\"unit\">'+L('Магазин попадает в базу сам при первом заказе. Агент проверяет данные после визита и добавляет тех, кого ещё нет. Дистрибьюторы видят всю базу (название, адрес, телефон, территорию), но не заметки агентов.','Doʻkon birinchi buyurtmada bazaga oʻzi tushadi. Agent tashrifdan keyin maʼlumotlarni tekshiradi va hali yoʻqlarini qoʻshadi. Distribyutorlar butun bazani koʻradi (nomi, manzil, telefon, hudud), lekin agent eslatmalarini emas.')+'</div>'\n    +'<div class=\"sum\"><div class=\"r\"><span>'+L('Магазинов в базе','Bazadagi doʻkonlar')+'</span><span>'+num(p.total)+'</span></div><div class=\"r\"><span>'+L('Без территории','Hududsiz')+'</span><span>'+num(p.free)+'</span></div></div>'\n    +(o.perr?'<div class=\"err\" role=\"alert\" style=\"margin-top:8px\">'+esc(o.perr)+'</div>':'')\n    +'<div class=\"row-btns\" style=\"margin-top:12px\"><button type=\"button\" class=\"btn\" data-act=\"nav\" data-v=\"base\">'+L('Открыть базу','Bazani ochish')+'</button>'\n    +'<button type=\"button\" class=\"btn ghost\" data-act=\"baseimport\"'+dis+'>'+L('Перенести клиентов дистрибьюторов','Distribyutorlar mijozlarini oʻtkazish')+'</button></div>'\n    +'<div class=\"unit\" style=\"margin-top:8px\">'+L('Перенос нужен один раз: клиенты, которые уже заказывали у дистрибьюторов, попадут в общую базу. Кто уже есть, не добавится повторно.','Oʻtkazish bir marta kerak: distribyutorlarga allaqachon buyurtma bergan mijozlar umumiy bazaga tushadi. Bor boʻlganlar qayta qoʻshilmaydi.')+'</div>'\n    +(o.imp?'<div class=\"note\" style=\"margin-top:8px\">'+esc(L('Перенос выполнен: добавлено '+o.imp.added+', уже были в базе '+o.imp.linked+', пропущено '+o.imp.skipped+'.','Oʻtkazildi: qoʻshildi '+o.imp.added+', bazada bor edi '+o.imp.linked+', oʻtkazib yuborildi '+o.imp.skipped+'.'))+'</div>':'')+'</div>';\n  // территории\n  h+='<div class=\"card\"><h3>'+L('Территории','Hududlar')+'</h3><div class=\"unit\">'+L('Районы и города, по которым агенты закрепляют магазины. Например: Навои, Зарафшан, Кармана.','Agentlar doʻkonlarni biriktiradigan tuman va shaharlar. Masalan: Navoiy, Zarafshon, Karmana.')+'</div>';\n  h+=p.terr.map(t=>'<div class=\"trow\"><input type=\"text\" id=\"tn-'+esc(t.id)+'\" value=\"'+esc(t.name)+'\" maxlength=\"40\" aria-label=\"'+esc(L('Название территории','Hudud nomi'))+'\"><span class=\"dtag\" title=\"'+esc(L('Магазинов','Doʻkonlar'))+'\">'+num(t.n)+'</span>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"terrsave\" data-id=\"'+esc(t.id)+'\"'+dis+' aria-label=\"'+esc(L('Сохранить название','Nomini saqlash'))+'\" title=\"'+esc(L('Сохранить название','Nomini saqlash'))+'\">✓</button><button type=\"button\" class=\"btn ghost sm\" data-act=\"terrdel\" data-id=\"'+esc(t.id)+'\"'+dis+' aria-label=\"'+esc(L('Удалить территорию','Hududni oʻchirish'))+'\" title=\"'+esc(L('Удалить территорию','Hududni oʻchirish'))+'\">✕</button></div>').join('');\n  h+='<div class=\"trow\"><input type=\"text\" id=\"o-tname\" data-own=\"tname\" maxlength=\"40\" value=\"'+esc(o.tname)+'\" placeholder=\"'+esc(L('Новая территория','Yangi hudud'))+'\" autocomplete=\"off\" aria-label=\"'+esc(L('Новая территория','Yangi hudud'))+'\"><button type=\"button\" class=\"btn sm\" data-act=\"terradd\"'+dis+'>'+L('Добавить','Qoʻshish')+'</button></div>'\n    +'<div class=\"row-btns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"terrpreset\"'+dis+'>'+L('Добавить районы и города Навоийской области','Navoiy viloyati tumanlari va shaharlarini qoʻshish')+'</button></div></div>';\n  // агенты\n  h+='<div class=\"card\"><h3>'+L('Агенты','Agentlar')+'</h3><div class=\"unit\">'+L('Каждому агенту вы даёте личный код. Он пишет боту «/agent КОД», в приложении открывается вкладка «База». Агент видит магазины своих территорий и магазины без территории.','Har bir agentga shaxsiy kod berasiz. U botga «/agent KOD» deb yozadi, ilovada «Baza» boʻlimi ochiladi. Agent oʻz hududlaridagi va hududsiz doʻkonlarni koʻradi.')+'</div>';\n  if(o.amade){\n    const m=o.amade;\n    h+='<div class=\"codebox\" style=\"margin:12px 0\"><h3>'+esc(m.reset?L('Новый код: ','Yangi kod: ')+m.name:L('Агент добавлен: ','Agent qoʻshildi: ')+m.name)+'</h3><div class=\"unit\">'+L('Сохраните код сейчас: потом он нигде не показывается. Отправьте его агенту.','Kodni hozir saqlang: keyin u hech qayerda koʻrsatilmaydi. Uni agentga yuboring.')+'</div><div class=\"mono\">'+esc(m.code)+'</div>'\n      +'<div class=\"row-btns\" style=\"margin:12px 0\"><button type=\"button\" class=\"btn\" data-act=\"copy\" data-v=\"'+esc(m.code)+'\" data-ok=\"'+esc(L('Код скопирован','Kod nusxalandi'))+'\" data-lab=\"\">'+L('Копировать код','Kodni nusxalash')+'</button>'\n      +'<button type=\"button\" class=\"btn ghost\" data-act=\"copy\" data-v=\"/agent '+esc(m.code)+'\" data-ok=\"'+esc(L('Команда скопирована','Buyruq nusxalandi'))+'\" data-lab=\"\">'+L('Копировать «/agent КОД»','«/agent KOD» nusxalash')+'</button></div>'\n      +'<div class=\"row-btns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"amadeclose\">'+L('Готово, код сохранён','Tayyor, kod saqlandi')+'</button></div></div>';\n  }\n  h+=p.agents.map(a=>'<div class=\"bcard\"><div class=\"hrow\"><h3>'+esc(a.name)+'</h3><span class=\"dtag\">'+(a.on?L('работает','ishlaydi'):L('отключён','oʻchirilgan'))+'</span></div>'\n    +'<div class=\"dmeta\">'+esc(L('магазинов: '+a.n+' · ','doʻkonlar: '+a.n+' · ')+(a.used?L('вошёл по коду','kod bilan kirgan'):L('ещё не входил','hali kirmagan')))+'</div>'\n    +(p.terr.length?'<div class=\"tsel\" role=\"group\" aria-label=\"'+esc(L('Территории агента','Agent hududlari'))+'\">'+p.terr.map(t=>'<label class=\"chk\"><input type=\"checkbox\" data-agterr=\"'+esc(a.id+':'+t.id)+'\"'+(a.terr.includes(t.id)?' checked':'')+dis+'> '+esc(t.name)+'</label>').join('')+'</div>':'')\n    +'<div class=\"row-btns\"><button type=\"button\" class=\"btn ghost sm\" data-act=\"agenton\" data-id=\"'+esc(a.id)+'\"'+dis+'>'+(a.on?L('Отключить','Oʻchirish'):L('Включить','Yoqish'))+'</button>'\n    +'<button type=\"button\" class=\"btn ghost sm\" data-act=\"agentcode\" data-id=\"'+esc(a.id)+'\"'+dis+'>'+L('Новый код','Yangi kod')+'</button>'\n    +(a.link?'<button type=\"button\" class=\"btn ghost sm\" data-act=\"copy\" data-v=\"'+esc(a.link)+'\" data-ok=\"'+esc(L('Ссылка скопирована','Havola nusxalandi'))+'\" data-lab=\"\">'+L('Ссылка агента','Agent havolasi')+'</button>':'')+'</div></div>').join('');\n  h+='<div class=\"form\" style=\"margin-top:12px\"><div><label class=\"lab\" for=\"o-aname\">'+L('Имя агента','Agent ismi')+'</label><input type=\"text\" id=\"o-aname\" data-own=\"aname\" maxlength=\"60\" value=\"'+esc(o.aname)+'\" autocomplete=\"off\"></div>'\n    +'<div><label class=\"lab\" for=\"o-acode\">'+L('Свой код (от 12 символов) или пусто','Oʻz kodingiz (12 belgidan) yoki boʻsh')+'</label><input type=\"text\" id=\"o-acode\" data-own=\"acode\" maxlength=\"64\" value=\"'+esc(o.acode)+'\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\"></div></div>'\n    +(p.terr.length?'<div class=\"lab\" style=\"margin-top:8px\">'+L('Территории нового агента','Yangi agent hududlari')+'</div><div class=\"tsel\">'+p.terr.map(t=>'<label class=\"chk\"><input type=\"checkbox\" data-aterr=\"'+esc(t.id)+'\"'+(o.aterr.includes(t.id)?' checked':'')+'> '+esc(t.name)+'</label>').join('')+'</div>':'')\n    +'<div class=\"row-btns\" style=\"margin-top:8px\"><button type=\"button\" class=\"btn\" data-act=\"agentadd\"'+dis+'>'+L('Добавить агента','Agent qoʻshish')+'</button></div></div>';\n  return h;\n}\nasync function ownTerrAdd(names){\n  const d=await peopleCall('POST','/terr',{names});\n  if(d){S.own.tname='';renderOwner()}\n}\nasync function ownAgentAdd(){\n  const o=S.own,name=o.aname.trim(),code=o.acode.trim();\n  if(name.length<2){o.perr=peopleErr('bad_name');renderOwner();return}\n  if(code&&code.length<12){o.perr=peopleErr('weak_code');renderOwner();return}\n  const d=await peopleCall('POST','/agents',code?{name,terr:o.aterr,code}:{name,terr:o.aterr});\n  if(d){o.amade={name,code:d.code,reset:false};o.aname='';o.acode='';o.aterr=[];renderOwner();window.scrollTo(0,0);loadHub()}\n}\nasync function ownReset(id){\n  const o=S.own,rec=o.shops.find(x=>x.id===id);if(!rec||o.busy)return;\n  o.busy='rc';o.rc='';renderOwner();\n  const r=await api('POST','/api/hub/admin/shops/'+encodeURIComponent(id)+'/code',{});\n  o.busy='';\n  if(!r.ok||!r.data){toast(ownErr(r.data&&r.data.error));renderOwner();return}\n  o.shops=o.shops.map(x=>x.id===id?r.data.shop:x);\n  o.made={name:rec.name,code:r.data.code,reset:true};\n  renderOwner();window.scrollTo(0,0);\n}\nasync function ownTitle(){\n  const o=S.own;if(o.busy)return;\n  const t=(o.ftitle===null?o.title:o.ftitle).trim();\n  o.busy='tt';renderOwner();\n  const r=await api('PUT','/api/hub/admin/title',{title:t});\n  o.busy='';\n  if(r.ok&&r.data){o.title=r.data.title;o.ftitle=null;S.hub.title=r.data.title;renderNav();toast(L('Название сохранено','Nom saqlandi'))}\n  else toast(ownErr(r.data&&r.data.error));\n  renderOwner();\n}\n/* поле количества потеряло фокус: пустое или 0 убирает товар, слишком большое число обрезается */\nfunction qtyDone(t){\n  const id=t.dataset.qty,cur=S.cart[id]||0;\n  let v=Math.floor(Number(t.value));\n  if(!isFinite(v)||v<1)v=0;\n  v=cartSet(id,v);   // обрезает до остатка и сохраняет\n  if(!v){\n    if(!cartCount()){S.shopStep='list';renderShop();renderNav();return}\n    if(S.shopStep==='cart'){paintCartLines();paintShopBar();renderNav()}else paintShopCtl(id);\n    return;\n  }\n  t.value=String(v);\n  if(cur!==v)refreshTotals(id);\n}\n\n/* ---------- events ---------- */\ndocument.addEventListener('click',e=>{\n  const t=e.target.closest('[data-act]');\n  if(!t||t.disabled)return;\n  const a=t.dataset.act;\n  if(a==='lang')switchLang();\n  else if(a==='nav'){\n    if(t.dataset.v==='shop'&&S.did&&S.view!=='shop'){S.shopPlaced=null;S.shopStep='list'}\n    go(t.dataset.v);\n    menuSet(false);\n  }\n  else if(a==='menu')menuSet(!menuIsOpen());\n  else if(a==='menuclose')menuSet(false);\n  else if(a==='msub'){S.msub=menuSubOpen(S.view)?'':t.dataset.v;renderNav()}\n  else if(a==='shops')go('shops');\n  else if(a==='owner')go('owner');\n  else if(a==='hubreload'){S.hub.err=false;renderShops();loadHub()}\n  else if(a==='showfar'){S.showFar=!S.showFar;renderShops()}\n  else if(a==='ownreload'){S.own.loaded=false;S.own.err=false;renderOwner();loadOwner()}\n  else if(a==='openshop')enterShop(t.dataset.id,'shop');\n  else if(a==='opencartshop')enterShop(t.dataset.id,'shop',true);\n  else if(a==='sellerof')enterShop(t.dataset.id,'seller');\n  else if(a==='ownadd')ownAdd();\n  else if(a==='owntoggle')ownToggle(t.dataset.id);\n  else if(a==='owntitle')ownTitle();\n  else if(a==='ownper'){S.own.period=t.dataset.v;renderOwner();loadOwnerStats()}\n  else if(a==='ownpct')ownPct(t.dataset.id);\n  else if(a==='ownmadeclose'){S.own.made=null;renderOwner()}\n  else if(a==='ownreset'){\n    const id=t.dataset.id;\n    if(S.own.rc===id)ownReset(id);\n    else{\n      S.own.rc=id;renderOwner();\n      setTimeout(()=>{if(S.own.rc===id){S.own.rc='';if(S.view==='owner')renderOwner()}},5000);\n    }\n  }\n  else if(a==='basereload'){S.base.err=false;renderBase();loadBase(true)}\n  else if(a==='bsheet'){S.base.sheet=true;S.base.legend=false;paintSheet()}\n  else if(a==='blegend'){S.base.legend=true;S.base.sheet=false;paintSheet()}\n  else if(a==='bsheetx')clientCardClose()\n  else if(a==='bset'){\n    const k=t.dataset.k;\n    if(k==='sort'&&t.dataset.v==='near')baseNear();\n    else if(['f','terr','ag','sort'].includes(k)){S.base[k]=t.dataset.v;loadBase(true)}\n  }\n  else if(a==='bclr'){const k=t.dataset.k;if(k==='f'||k==='ag'||k==='sort'){S.base[k]='';loadBase(true)}}\n  else if(a==='breset'){Object.assign(S.base,{f:'',terr:'',ag:'',sort:'',mc:false});loadBase(true)}\n  else if(a==='bsign'){const b=S.base;b.f=b.f===t.dataset.v?'':t.dataset.v;b.legend=false;loadBase(true);window.scrollTo(0,0)}\n  else if(a==='basemore')loadBase(false);\n  else if(a==='basenew')baseOpenForm(null);\n  else if(a==='baseedit')baseOpenForm(S.base.items.find(x=>x.id===t.dataset.id)||null);\n  else if(a==='map')openMapSheet(t.dataset.lat,t.dataset.lng,t.dataset.t||'');\n  else if(a==='mapx')closeMapSheet();\n  else if(a==='mapgo')mapGo(t.dataset.k);\n  else if(a==='locmark')locMark();\n  else if(a==='locclear'){S.form.loc=null;paintLocBox()}\n  else if(a==='baseloc')baseMark(t.dataset.id);\n  else if(a==='baseaccept')baseAccept(t.dataset.id);\n  else if(a==='bfloc-here')bfLocHere();\n  else if(a==='bfloc-link')bfLocLink();\n  else if(a==='bfloc-clear'){S.base.fm.loc=null;S.base.fm.locDirty=true;paintBase()}\n  else if(a==='basecancel'){S.base.edit=null;S.base.ferr='';paintBase()}\n  else if(a==='basesave')baseSave();\n  else if(a==='basechk')baseCheck(t.dataset.id);\n  else if(a==='basedel')baseDelete(t.dataset.id);\n  else if(a==='terradd'){const n=S.own.tname.trim();if(n.length<2){S.own.perr=peopleErr('bad_name');renderOwner()}else ownTerrAdd([n])}\n  else if(a==='terrpreset')ownTerrAdd(NAVOI_TERR);\n  else if(a==='terrsave'){const el=document.getElementById('tn-'+t.dataset.id);if(el)peopleCall('PUT','/terr/'+encodeURIComponent(t.dataset.id),{name:el.value.trim()})}\n  else if(a==='terrdel'){\n    const tt=S.own.ppl&&S.own.ppl.terr.find(x=>x.id===t.dataset.id);\n    if(tt)askConfirm(L('Удалить территорию «'+tt.name+'»?','«'+tt.name+'» hududini oʻchirasizmi?'),()=>peopleCall('DELETE','/terr/'+encodeURIComponent(tt.id)));\n  }\n  else if(a==='agentadd')ownAgentAdd();\n  else if(a==='agenton'){const ag=S.own.ppl&&S.own.ppl.agents.find(x=>x.id===t.dataset.id);if(ag)peopleCall('PUT','/agents/'+encodeURIComponent(ag.id),{on:!ag.on}).then(()=>loadHub())}\n  else if(a==='agentcode'){\n    const ag=S.own.ppl&&S.own.ppl.agents.find(x=>x.id===t.dataset.id);\n    if(ag)askConfirm(L('Выдать «'+ag.name+'» новый код? Прежний аккаунт агента потеряет доступ.','«'+ag.name+'» ga yangi kod berasizmi? Agentning avvalgi akkaunti kirolmaydi.'),async()=>{\n      const d=await peopleCall('POST','/agents/'+encodeURIComponent(ag.id)+'/code',{});\n      if(d){S.own.amade={name:ag.name,code:d.code,reset:true};renderOwner();window.scrollTo(0,0)}\n    });\n  }\n  else if(a==='amadeclose'){S.own.amade=null;renderOwner()}\n  else if(a==='baseimport'){\n    peopleCall('POST','/base/import',{}).then(d=>{if(d){S.own.imp={added:d.added,linked:d.linked,skipped:d.skipped};renderOwner()}});\n  }\n  else if(a==='submitorder')submitOrder();\n  else if(a==='mode'){\n    S.form.mode=t.dataset.v==='delivery'?'delivery':'pickup';saveForm();\n    renderCart();\n  }\n  else if(a==='scat'){S.shopCat=t.dataset.id;renderShop()}\n  else if(a==='fav')toggleFav(t.dataset.id);\n  else if(a==='pdesc')t.classList.toggle('open');\n  else if(a==='padd'||a==='pplus'||a==='pminus'){\n    const id=t.dataset.id,cur=S.cart[id]||0;\n    if(a==='padd'&&!cur&&cartLines().length>=MAX_LINES){toast(L('В корзине не больше '+MAX_LINES+' разных товаров','Savatda '+MAX_LINES+' tadan ortiq turli mahsulot boʻlmaydi'));return}\n    const run=()=>{cartSet(id,a==='pminus'?cur-1:cur+1);paintShopCtl(id)};\n    if(a==='padd'&&S.otherCart)askOtherCart(run);else run();\n  }\n  else if(a==='ppack'||a==='cpack'){\n    const id=t.dataset.id,p=S.prod.items.find(x=>x.id===id),size=p?packSize(p,t.dataset.k):0,cur=S.cart[id]||0;\n    if(!p||!size)return;\n    if(!cur&&cartLines().length>=MAX_LINES){toast(L('В корзине не больше '+MAX_LINES+' разных товаров','Savatda '+MAX_LINES+' tadan ortiq turli mahsulot boʻlmaydi'));return}\n    const run=()=>{\n      cartSet(id,cur+size);\n      if(a==='ppack')paintShopCtl(id);\n      else{paintCartLines();paintShopBar();renderNav()}\n    };\n    if(a==='ppack'&&S.otherCart)askOtherCart(run);else run();\n  }\n  else if(a==='cplus'||a==='cminus'){\n    const id=t.dataset.id,cur=S.cart[id]||0;\n    cartSet(id,a==='cminus'?cur-1:cur+1);\n    if(!cartCount()){S.shopStep='list';renderShop();renderNav();return}\n    paintCartLines();\n    paintShopBar();renderNav();\n  }\n  else if(a==='opencart'){S.shopStep='cart';renderShop();window.scrollTo(0,0)}\n  else if(a==='shoplist'){S.shopStep='list';renderShop();window.scrollTo(0,0)}\n  else if(a==='shopagain'){S.shopPlaced=null;S.shopStep='list';renderShop();window.scrollTo(0,0)}\n  else if(a==='cadd'){\n    if(S.prod.cats.length>=MAX_CATS){toast(L('Больше '+MAX_CATS+' категорий нельзя',MAX_CATS+' tadan ortiq kategoriya boʻlmaydi'));return}\n    const c={id:'c'+Math.random().toString(36).slice(2,8),name:L('Новая категория','Yangi kategoriya'),uz:'Yangi kategoriya'};\n    S.prod.cats.push(c);queueSave('prod');paintSeller();\n    const inp=document.querySelector('[data-cid=\"'+c.id+'\"][data-cp=\"name\"]');if(inp){inp.focus();inp.select()}\n  }\n  else if(a==='cdel'){\n    const id=t.dataset.id;\n    if(S.prod.items.some(p=>p.cat===id)){toast(L('В категории есть товары. Сначала перенесите или удалите их.','Kategoriyada mahsulotlar bor. Avval ularni koʻchiring yoki oʻchiring.'));return}\n    S.prod.cats=S.prod.cats.filter(c=>c.id!==id);queueSave('prod');paintSeller();\n  }\n  else if(a==='pfilter'){S.pfilter=t.dataset.id;paintSeller()}\n  else if(a==='rseg'){if(S.rv.seg!==t.dataset.v){S.rv.seg=t.dataset.v;S.rv.did='';S.rv.cat='';S.rv.items=[];loadReview()}}\n  else if(a==='rvreload')loadReview();\n  else if(a==='rdist'){S.rv.did=S.rv.did===t.dataset.did?'':t.dataset.did;paintReview()}\n  else if(a==='rzoom'){const it=rvFind(t.dataset.did,t.dataset.id);if(it)openViewer(it.id,it,it.did)}\n  else if(a==='rok'){const it=rvFind(t.dataset.did,t.dataset.id);if(it)rvApprove([it])}\n  else if(a==='rall'){\n    const list=rvList();if(!list.length)return;\n    askConfirm(L('Одобрить '+list.length+' '+plTovar(list.length)+'? Они сразу появятся в каталогах с ценой.','Tasdiqlansinmi: '+list.length+' ta mahsulot? Ular darhol narx bilan kataloglarda paydo boʻladi.'),()=>rvApprove(rvList()));\n  }\n  else if(a==='rret')rvOpenRet(t.dataset.did,t.dataset.id);\n  else if(a==='redit')rvOpenEdit(t.dataset.did,t.dataset.id);\n  else if(a==='rsx')rvClose();\n  else if(a==='rwhy')rvWhy(t.dataset.k,t.dataset.ph);\n  else if(a==='rsend')rvSend();\n  else if(a==='rsave')rvSave();\n  else if(a==='rphdel')rvPhotoDel(t.dataset.n);\n  else if(a==='msub1')modSubmit([t.dataset.id]);\n  else if(a==='msuball')modSubmit(S.prod.items.filter(p=>p.ms==='draft').map(p=>p.id));   // только черновики: возвращённые уходят после исправления, кнопкой у самого товара\n  else if(a==='mfix'){\n    S.medit[t.dataset.id]=true;paintSeller();\n    const row=document.getElementById('prow-'+t.dataset.id);if(row)try{row.scrollIntoView({block:'center'})}catch(x){}\n  }\n  else if(a==='pnew'){\n    if(!S.prod.cats.length){toast(L('Сначала создайте категорию','Avval kategoriya yarating'));return}\n    if(S.prod.items.length>=MAX_ITEMS){toast(L('Больше '+MAX_ITEMS+' товаров нельзя',MAX_ITEMS+' tadan ortiq mahsulot boʻlmaydi'));return}\n    const cat=S.pfilter!=='all'?S.pfilter:S.prod.cats[0].id;\n    const p={id:'p'+Math.random().toString(36).slice(2,9),cat,name:L('Новый товар','Yangi mahsulot'),uz:'Yangi mahsulot',desc:'',descUz:'',amount:0,unit:'g',price:0,on:true,tag:'',old:0,pv:'',tiers:[],blk:0,box:0};\n    S.prod.items.push(p);queueSave('prod');paintSeller();\n    const inp=document.getElementById('pname-'+p.id);\n    if(inp){inp.focus();inp.select();try{inp.scrollIntoView({block:'center'})}catch(x){}}\n  }\n  else if(a==='pdel'){\n    const id=t.dataset.id;\n    if(S.cd===id){\n      S.cd=null;\n      S.prod.items=S.prod.items.filter(p=>p.id!==id);delete S.cart[id];delete S.stk[id];saveCart();\n      queueSave('prod');paintSeller();\n    }else{\n      S.cd=id;t.textContent=L('Точно удалить?','Aniq oʻchirilsinmi?');\n      setTimeout(()=>{if(S.cd===id){S.cd=null;t.textContent=L('Удалить товар','Mahsulotni oʻchirish')}},4000);\n    }\n  }\n  else if(a==='pmove'){\n    const id=t.dataset.id,d=Number(t.dataset.d)||0,arr=S.prod.items;\n    const vis=arr.map((p,i)=>i).filter(i=>S.pfilter==='all'||arr[i].cat===S.pfilter);\n    const pos=vis.indexOf(arr.findIndex(p=>p.id===id)),to=pos+d;\n    if(pos<0||to<0||to>=vis.length)return;\n    const a1=vis[pos],b1=vis[to],tmp=arr[a1];arr[a1]=arr[b1];arr[b1]=tmp;\n    queueSave('prod');paintSeller();\n    const row=document.getElementById('prow-'+id);if(row)try{row.scrollIntoView({block:'center'})}catch(x){}\n  }\n  else if(a==='phdel')removePhoto(t.dataset.id,t.dataset.n);\n  else if(a==='pzoom')openViewer(t.dataset.id);\n  else if(a==='lbclose')closeViewer();\n  else if(a==='lbbg'){if(e.target.tagName!=='IMG')closeViewer()}\n  else if(a==='copy'){\n    const v=t.dataset.v||'';\n    const ok=t.dataset.ok||L('Номер скопирован','Raqam nusxalandi');\n    const lab=(t.dataset.lab!==undefined?t.dataset.lab:L('Номер: ','Raqam: '))+v;\n    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(()=>toast(ok),()=>toast(lab));\n    else toast(lab);\n  }\n  else if(a==='stab'){sellerOpen(t.dataset.t);menuSet(false)}\n  else if(a==='rdays'){const v=Number(t.dataset.v);if(RP_DAYS.includes(v)&&v!==S.rep.days){S.rep.days=v;S.rep.sel=-1;S.rep.hov=-1;S.rep.allP=false;loadReport()}}\n  else if(a==='rsel'){if(Date.now()-S.rep.skip<400)return;const i=Number(t.dataset.i);S.rep.sel=S.rep.sel===i?-1:i;S.rep.hov=-1;repShow(S.rep.sel)}\n  else if(a==='rtab'){S.rep.tab=!S.rep.tab;paintRep()}\n  else if(a==='rall'){S.rep.allP=!S.rep.allP;paintRep()}\n  else if(a==='rretry')loadReport();\n  else if(a==='sfilter'){S.sfilter=t.dataset.v;paintStock()}\n  else if(a==='sjr'){S.jrOpen=!S.jrOpen;paintStock();if(S.jrOpen)loadJournal()}\n  else if(a==='sin'||a==='sset'){\n    const id=t.dataset.id,n=stockNum(id,'sn',a==='sin'?1:0);\n    if(n===null)return;\n    const body={op:a==='sin'?'in':'set',n},u=stockUnit(id),pr=S.prod.items.find(x=>x.id===id);\n    if(u)body.u=u;\n    const pcs=u&&pr?n*packSize(pr,u):0,ex=pcs?' ('+(a==='sin'?'+':'= ')+pcs+' '+pcsWord()+')':'';\n    stockDo(id,body,(a==='sin'?L('Приход записан','Kirim yozildi'):L('Остаток исправлен','Qoldiq tuzatildi'))+ex);\n  }\n  else if(a==='sstart'){\n    const id=t.dataset.id,n=stockNum(id,'sn',0);\n    if(n===null)return;\n    const body={op:'set',n},u=stockUnit(id);\n    if(u)body.u=u;\n    const lw=document.getElementById('sl-'+id),raw=lw?String(lw.value).trim():'';\n    if(raw!==''){\n      const v=Number(raw);\n      if(!Number.isInteger(v)||v<0||v>1000000){toast(L('Порог — целое число, 0 или больше','Chegara — butun son (0 yoki koʻp)'));lw.focus();return}\n      body.low=v;\n    }\n    stockDo(id,body,L('Учёт начат','Hisob boshlandi'));\n  }\n  else if(a==='soff'){\n    const id=t.dataset.id;\n    if(S.sc===id){S.sc=null;stockDo(id,{op:'off'},L('Учёт отключён','Hisob oʻchirildi'))}\n    else{\n      S.sc=id;paintStockRow(id);\n      setTimeout(()=>{if(S.sc===id){S.sc=null;paintStockRow(id)}},4000);\n    }\n  }\n  else if(a==='adays'){const v=Number(t.dataset.v);if(RP_DAYS.includes(v)&&v!==S.an.days){S.an.days=v;S.an.all=false;loadAnalytics()}}\n  else if(a==='antab'){S.an.tab=t.dataset.v;S.an.all=false;renderAnalytics()}\n  else if(a==='ansort'){S.an.sort=t.dataset.v==='n'?'n':'sum';renderAnalytics()}\n  else if(a==='anall'){S.an.all=!S.an.all;renderAnalytics()}\n  else if(a==='anretry')loadAnalytics();\n  else if(a==='bmine'){S.base.mc=!S.base.mc;loadBase(true)}\n  else if(a==='cmine')clientCardOpen(t.dataset.id);\n  else if(a==='csave')clientCardSave();\n  else if(a==='cretry')clientCardOpen(S.base.cd);\n  else if(a==='cgrp'){const el=document.getElementById('cf-grp');if(el&&S.base.cf){el.value=t.dataset.v;S.base.cf.grp=t.dataset.v;el.focus()}}\n  else if(a==='bxport')doExport(t.dataset.k,undefined,baseShop());\n  else if(a==='pmenu'){S.pm=!S.pm;paintSeller()}\n  else if(a==='impapply')impApply();\n  else if(a==='impcancel'){S.imp=null;paintSeller()}\n  else if(a==='pick')openPick(t.dataset.day?{day:t.dataset.day}:{});\n  else if(a==='pick1')openPick({ids:[t.dataset.id]});\n  else if(a==='pclose')closePick();\n  else if(a==='pprint')printPick();\n  else if(a==='xport')doExport(t.dataset.k,t.dataset.k==='report'?{days:S.rep.days}:undefined);\n  else if(a==='xpick'){if(S.pick)doExport('pick',S.pick.body)}\n  else if(a==='pfsave')saveProfile();\n  else if(a==='repeat')repeatOrder(t.dataset.id,t.dataset.d);\n  else if(a==='addr'){\n    const x=S.profile&&S.profile.addrs[Number(t.dataset.i)];\n    if(!x)return;\n    S.form.address=x;saveForm();\n    const ta=$('#f-address');\n    if(ta){ta.value=x;ta.setAttribute('aria-invalid','false')}\n    const er=$('#e-address');if(er)er.textContent='';\n    markAddr();\n  }\n  else if(a==='filter'){S.filter=t.dataset.v;paintSeller()}\n  else if(a==='status'){setStatus(t.dataset.id,t.dataset.to)}\n  else if(a==='contact'){try{if(S.tg&&S.initData&&S.tg.openTelegramLink){e.preventDefault();S.tg.openTelegramLink(t.href)}}catch(err){}}\n  else if(a==='scancel'||a==='mycancel'){\n    const id=t.dataset.id,d=t.dataset.d||S.did,k=okey(id,d);\n    if(S.cc===k){\n      S.cc=null;\n      if(a==='scancel')setStatus(id,'cancelled');\n      else cancelMine(id,d);\n    }else{\n      S.cc=k;\n      if(S.view==='seller')paintSeller();else renderMine();\n      setTimeout(()=>{if(S.cc===k){S.cc=null;if(S.view==='seller')paintSeller();else if(S.view==='mine')renderMine()}},4000);\n    }\n  }\n});\ndocument.addEventListener('input',e=>{\n  const t=e.target;\n  if(t.id==='q'){S.q=t.value;paintGrid()}\n  else if(t.dataset.cf!==undefined&&t.dataset.cf!=='blocked'&&S.base.cf)S.base.cf[t.dataset.cf]=t.value;\n  else if(t.dataset.rq!==undefined){S.rv.q=t.value;if(S.rv.loaded)paintReview()}\n  else if(t.dataset.rtxt!==undefined){S.rv.rtxt=t.value;rvRetSync()}\n  else if(t.dataset.rf!==undefined)rvField(t)\n  else if(t.dataset.opct!==undefined)S.own.pcts[t.dataset.opct]=t.value;\n  else if(t.dataset.bq!==undefined){S.base.q=t.value;clearTimeout(S.base.qt);S.base.qt=setTimeout(()=>loadBase(true),350)}\n  else if(t.dataset.bf!==undefined)S.base.fm[t.dataset.bf]=t.value;\n  else if(t.dataset.bfLink!==undefined)S.base.link=t.value;\n  else if(t.dataset.aterr!==undefined){const set=new Set(S.own.aterr);if(t.checked)set.add(t.dataset.aterr);else set.delete(t.dataset.aterr);S.own.aterr=[...set]}\n  else if(t.dataset.agterr!==undefined){\n    const [aid,tid]=t.dataset.agterr.split(':'),ag=S.own.ppl&&S.own.ppl.agents.find(x=>x.id===aid);\n    if(ag){const set=new Set(ag.terr);if(t.checked)set.add(tid);else set.delete(tid);peopleCall('PUT','/agents/'+encodeURIComponent(aid),{terr:[...set]})}\n  }\n  else if(t.dataset.own!==undefined){S.own[t.dataset.own]=t.value;if(t.dataset.own!=='ftitle'&&S.own.err2){S.own.err2='';const er=$('#o-err');if(er)er.textContent=''}}\n  else if(t.dataset.qty!==undefined){\n    /* количество вводят с клавиатуры: пока клиент печатает, обновляем только суммы */\n    const id=t.dataset.qty;let v=Math.floor(Number(t.value));\n    if(!isFinite(v)||v<1)return;\n    const w=cartSet(id,v);\n    if(w!==v)t.value=String(w);\n    if(!w){qtyDone(t);return}\n    refreshTotals(id);\n  }\n  else if(t.dataset.f){\n    const f=t.dataset.f;S.form[f]=t.value;\n    if(f==='date')fillTimes();\n    if(f==='name'||f==='phone'||f==='address'||f==='terr')saveForm();\n    if(f==='address')markAddr();\n    const er=$('#e-'+f);if(er&&er.textContent){er.textContent='';t.setAttribute('aria-invalid','false')}\n  }\n  else if(t.dataset.pid!==undefined){\n    const p=S.prod.items.find(x=>x.id===t.dataset.pid),k=t.dataset.pp;\n    if(!p)return;\n    if(k==='on'){p.on=t.checked;const row=t.closest('.prow');if(row)row.classList.toggle('off',!t.checked)}\n    else if(k==='amount'||k==='price'||k==='old'){const v=Number(t.value);p[k]=isFinite(v)&&v>=0?v:0;if(k==='price')syncTiers(p)}\n    else if(k==='blk'||k==='box'){const v=Math.round(Number(t.value));p[k]=v>=2&&v<=500?v:0}\n    else if(k==='tn'||k==='tp')syncTiers(p);\n    else p[k]=t.value;\n    queueSave('prod');\n  }\n  else if(t.dataset.cid!==undefined){\n    const c=S.prod.cats.find(x=>x.id===t.dataset.cid);\n    if(!c)return;\n    c[t.dataset.cp]=t.value;\n    queueSave('prod');\n  }\n  else if(t.dataset.sd!==undefined)syncDisc();\n  else if(t.dataset.sreg!==undefined){\n    const set=new Set(cleanRegions(S.cfg.shop.regions));\n    if(t.checked)set.add(t.dataset.sreg);else set.delete(t.dataset.sreg);\n    S.cfg.shop.regions=cleanRegions([...set]);\n    queueSave();\n  }\n  else if(t.dataset.s){\n    const k=t.dataset.s;\n    if(k==='regonly'){\n      S.regOnly=t.checked;\n      if(!t.checked){S.cfg.shop.regions=[];document.querySelectorAll('[data-sreg]').forEach(x=>{x.checked=false})}\n      const b=$('#regbox');if(b)b.hidden=!t.checked;\n    }\n    else if(k==='home')S.cfg.shop.home=cleanRegion(t.value);\n    else if(k==='delivery')S.cfg.shop.delivery=t.checked;\n    else if(['leadHours','deliveryLeadHours','openFrom','openTo','minOrder','deliveryFee','freeDeliveryFrom'].includes(k)){const v=Number(t.value);S.cfg.shop[k]=isFinite(v)&&v>=0?v:0}\n    else S.cfg.shop[k]=t.value;\n    if(k==='name'){$('#brandName').textContent=t.value||DEFAULT.shop.name;document.title=t.value||DEFAULT.shop.name}\n    queueSave();\n  }\n});\n\ndocument.addEventListener('change',e=>{\n  const t=e.target;\n  if(t&&t.type==='file'&&t.dataset.imp){\n    const f=t.files&&t.files[0];\n    if(f)importFile(f);\n    try{t.value=''}catch(x){}\n  }\n  else if(t&&t.type==='file'&&t.dataset.photo){\n    const f=t.files&&t.files[0];\n    if(f)uploadPhoto(t.dataset.photo,f,t.dataset.n);\n    try{t.value=''}catch(x){}\n  }\n  else if(t&&t.type==='file'&&t.dataset.rphoto){\n    const f=t.files&&t.files[0];\n    if(f)rvPhotoUp(f,t.dataset.n);\n    try{t.value=''}catch(x){}\n  }\n  else if(t&&t.dataset&&t.dataset.rfil!==undefined){S.rv[t.dataset.rfil]=t.value;paintReview()}\n  else if(t&&t.dataset&&t.dataset.bterr!==undefined){S.base.terr=t.value;loadBase(true)}\n  else if(t&&t.dataset&&t.dataset.ash!==undefined){S.an.sh=t.value;S.an.all=false;loadAnalytics()}\n  else if(t&&t.dataset&&t.dataset.cf==='blocked'){if(S.base.cf)S.base.cf.blocked=!!t.checked}\n  else if(t&&t.dataset&&t.dataset.reg!==undefined)setRegion(t.value);\n  else if(t&&t.dataset&&t.dataset.qty!==undefined)qtyDone(t);\n  else if(t&&t.dataset&&t.dataset.sl!==undefined){\n    /* порог «мало» у товара, по которому уже ведётся учёт, сохраняется сразу */\n    const id=t.dataset.sl,s=S.stk[id];\n    if(!s)return;\n    const raw=String(t.value).trim(),v=Number(raw);\n    if(raw===''||!Number.isInteger(v)||v<0||v>1000000){toast(L('Порог — целое число, 0 или больше','Chegara — butun son (0 yoki koʻp)'));t.value=String(s.low);return}\n    if(v!==s.low)stockDo(id,{op:'low',n:v},L('Порог сохранён','Chegara saqlandi'),true);\n  }\n});\n/* картинка не загрузилась: оставляем заглушку */\ndocument.addEventListener('error',e=>{\n  const t=e.target;\n  if(t&&t.tagName==='IMG'&&t.closest('.pimg,.cth,.pthumb,.th,.pslot,.lb-slide')){\n    const ph=document.createElement('span');ph.className='ph';ph.textContent='📦';ph.setAttribute('aria-hidden','true');\n    t.replaceWith(ph);\n  }\n},true);\n\n/* ---------- network ---------- */\n/* Запросы к дистрибьютору идут с его номером в заголовке x-shop (по умолчанию открытый сейчас). Ответ, пришедший уже после перехода к другому дистрибьютору, отбрасывается. */\nconst isHubPath=path=>path==='/api/shops'||path.indexOf('/api/hub/')===0;\nasync function api(method,path,body,did){\n  const ep=S.epoch,hub=isHubPath(path),d=did||S.did;\n  if(!hub&&!d)return {ok:false,status:0,data:null,stale:true};\n  try{\n    const h={'content-type':'application/json'};\n    if(S.initData)h['x-init-data']=S.initData;\n    if(!hub)h['x-shop']=d;\n    const r=await fetch(path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});\n    let data=null;try{data=await r.json()}catch(e){}\n    if(!hub&&!did&&S.epoch!==ep)return {ok:false,status:0,data:null,stale:true};\n    return {ok:r.ok,status:r.status,data};\n  }catch(e){return {ok:false,status:0,data:null}}\n}\n/* «Мои заказы» — заказы клиента у всех дистрибьюторов сразу (каждый с полями did и shopName) */\nasync function loadMine(){\n  if(!S.auth)return;\n  const r=await api('GET','/api/hub/orders');\n  if(!r.ok||!r.data||!Array.isArray(r.data.orders))return;\n  if(JSON.stringify(r.data.orders)===JSON.stringify(S.myOrders))return;\n  S.myOrders=r.data.orders;renderNav();\n  if(S.view==='mine')renderMine();\n}\nasync function loadAdmin(){\n  if(!S.admin||!S.did)return;\n  loadStock();\n  const r=await api('GET','/api/admin/orders');\n  if(!r.ok||!r.data)return;\n  if(JSON.stringify(r.data.orders)===JSON.stringify(S.allOrders)&&JSON.stringify(r.data.stats)===JSON.stringify(S.stats))return;\n  S.allOrders=r.data.orders;S.stats=r.data.stats;renderNav();\n  if(S.view==='seller'&&S.sellerTab==='orders')paintSeller();\n}\nasync function loadCfg(){\n  if(!S.did||S.dirty||S.saving||!S.ready)return;\n  const r=await api('GET','/api/config');\n  if(!r.ok||!r.data)return;\n  const next=mergeCfg(r.data.cfg),nextP=normProd(r.data.prod),off=!!r.data.off;\n  if(JSON.stringify(next)===JSON.stringify(S.cfg)&&JSON.stringify(nextP)===JSON.stringify(S.prod)&&off===S.off)return;\n  const ae=document.activeElement,typing=ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);\n  if(S.view==='shop'&&typing)return;\n  if(S.view==='seller'&&S.sellerTab==='prod'&&typing)return;\n  const msig=x=>x.items.map(p=>p.id+':'+(p.ms||'')+':'+(p.mc||'')).join();\n  const msChanged=msig(nextP)!==msig(S.prod);\n  S.cfg=next;S.prod=nextP;S.off=off;normalizeMode();\n  if(S.view==='seller'&&msChanged){paintTabs();if(S.sellerTab==='prod')paintSeller()}\n  const pruned=pruneCart();\n  renderNav();\n  if(S.view==='shop'&&!S.shopPlaced){\n    if(S.shopStep==='cart'&&!cartCount())S.shopStep='list';\n    renderShop();\n    if(pruned)toast(L('Остатки изменились, мы обновили корзину','Qoldiq oʻzgardi, savatni yangiladik'));\n  }\n}\nfunction applyTheme(){\n  try{\n    const cs=S.tg&&S.tg.colorScheme;\n    if(cs==='dark'||cs==='light')document.documentElement.setAttribute('data-theme',cs);\n    const dark=cs?cs==='dark':window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;\n    const bg=dark?'#0E1614':'#F3F7F6';\n    if(S.tg&&S.tg.setHeaderColor){S.tg.setHeaderColor(bg);S.tg.setBackgroundColor(bg)}\n  }catch(e){}\n}\nlet tickN=0;\nfunction tick(){\n  if(document.visibilityState==='hidden'||!S.ready)return;\n  tickN++;\n  if(S.auth&&S.view==='mine')loadMine();\n  if((S.view==='shops'||S.view==='review')&&tickN%2===0)loadHub();\n  else if(isOwner()&&tickN%4===0)loadHub();\n  if(S.view==='review'&&tickN%2===0&&!S.rv.ret&&!S.rv.edit&&!S.rv.busy)loadReview(true);\n  if(S.admin&&S.did&&(S.view==='seller'||tickN%2===0))loadAdmin();\n  if(S.did&&tickN%4===0)loadCfg();\n}\n(async function init(){\n  const tg=window.Telegram&&window.Telegram.WebApp;\n  if(tg){\n    S.tg=tg;\n    if(tg.initData)S.initData=tg.initData;\n    try{tg.ready();tg.expand();if(tg.onEvent)tg.onEvent('themeChanged',applyTheme)}catch(e){}\n  }\n  initLang();applyTheme();\n  renderNav();\n  view.innerHTML='<div class=\"wrap page\"><div class=\"empty\"><b>'+L('Загружаем каталог','Katalog yuklanmoqda')+'</b>'+L('Подождите секунду.','Bir soniya kuting.')+'</div></div>';\n  /* адрес: ?d=<дистрибьютор> открывает его каталог, ?v=mine|seller|owner — нужный раздел */\n  const want=QS.get('d')||'',vw=QS.get('v')||'';\n  loadRegion();\n  await loadHub();\n  if(S.initData&&!S.auth)S.authErr='auth';\n  loadForm();loadCart();\n  const me=S.hub.me;\n  let did=validDid(want)?want:'';\n  if(!did&&!vw&&S.hub.shops.length===1)did=S.hub.shops[0].id;   // дистрибьютор один: список выбирать не из чего\n  if(!did&&!S.hub.loaded&&vw!=='owner'&&vw!=='review'&&vw!=='analytics')did='main';   // список недоступен (площадка не подключена): работаем как раньше, с первым дистрибьютором\n  if(!did&&vw==='seller'&&me&&me.sells.length===1)did=me.sells[0].id;\n  S.ready=true;\n  let v='shops';\n  if(did&&await openShop(did))v=vw==='review'&&isOwner()?'review':vw==='seller'&&S.admin?'seller':vw==='mine'?'mine':'shop';\n  else if(vw==='mine')v='mine';\n  else if(vw==='owner'&&isOwner())v='owner';\n  else if(vw==='base'&&canBase())v='base';\n  else if(vw==='review'&&isOwner())v='review';\n  else if(vw==='analytics'&&isOwner())v='analytics';\n  S.view=v;\n  render();\n  if(v==='owner')loadOwner();\n  if(v==='base')loadBase(true);\n  if(v==='analytics')loadAnalytics();\n  if(v==='review')loadReview();\n  if(S.admin&&S.did)loadAdmin();\n  loadMine();\n  setInterval(tick,15000);\n  document.addEventListener('visibilitychange',()=>{\n    if(document.visibilityState!=='visible')return;\n    loadCfg();loadMine();loadAdmin();\n    if(S.view==='shops')loadHub();\n  });\n})();\n</script>\n</body></html>\n";

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

const publicOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.tg; delete x.msgs; delete x.rs; return x; };
const adminOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.msgs; delete x.rs; return x; };

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
/* Адреса, которые открывает кнопка в Telegram: каталог дистрибьютора и его панель продавца. */
const shopUrl = (origin, did) => origin + '/' + (did ? '?d=' + did : '');
const sellerUrl = (origin, did) => origin + '/?d=' + (did || MAIN) + '&v=seller';
function adminCard(o, shop, origin, confirm, cl, did) {
  setLang('ru');
  const px = cbPrefix(did);
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

/* Приветствие на двух языках: сверху язык человека (по языку его Telegram), ниже второй.
   Многие в Узбекистане пользуются Telegram на русском или английском, но говорят по-узбекски. */
const bilingual = (lang, ru, uz) => lang === 'uz' ? uz + '\n\n' + ru : ru + '\n\n' + uz;
const SELLER_NOTE_RU = 'Вы подключены как продавец: новые заказы приходят сюда, их можно принимать кнопками.';
const SELLER_NOTE_UZ = 'Siz sotuvchi sifatida ulangansiz: yangi buyurtmalar shu yerga keladi, ularni tugmalar bilan qabul qilish mumkin.';
function welcomeText(lang, isAdmin, shop, several) {
  setLang(lang);
  const name = (shop && shop.name) || DEFAULT.shop.name;
  let ru, uz;
  if (several) {
    ru = 'Здравствуйте! Это ' + name + ' 🛒\nОткройте каталог, выберите дистрибьютора и товары, оформите заказ: самовывоз или доставка. Оплата только при получении.';
    uz = 'Assalomu alaykum! Bu ' + name + ' 🛒\nKatalogni oching, distribyutor va mahsulotlarni tanlang, buyurtma bering: olib ketish yoki yetkazib berish. Toʻlov faqat olganda.';
  } else {
    ru = 'Здравствуйте! Это ' + name + ' 🛒\nОткройте каталог, выберите товары и оформите заказ: самовывоз или доставка. Оплата только при получении.';
    uz = 'Assalomu alaykum! Bu ' + name + ' 🛒\nKatalogni oching, mahsulotlarni tanlang va buyurtma bering: olib ketish yoki yetkazib berish. Toʻlov faqat olganda.';
  }
  if (isAdmin) { ru += '\n\n' + SELLER_NOTE_RU; uz += '\n\n' + SELLER_NOTE_UZ; }
  return bilingual(lang, ru, uz);
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
    + '<style>body{font:16px/1.5 system-ui,sans-serif;max-width:560px;margin:32px auto;padding:0 16px;color:#14231F}input,button{font:inherit;padding:10px 12px;border-radius:10px;border:1.5px solid #ccc}button{background:#0F766E;color:#fff;border:0;cursor:pointer}li{margin:6px 0}.ok{color:#1F7A4D}.bad{color:#B3261E}code{background:#E7EFED;padding:2px 6px;border-radius:6px}</style></head><body>'
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
  async card(o, shop, confirm) { return adminCard(o, shop, this.origin, confirm, o.uid ? await this.getClient(o.uid) : null, this.did); }
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
    if (path === '/__/off') { if (b.off) await this.st.put('off', 1); else await this.st.delete('off'); return json({ ok: true }); }
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

    if (path === '/api/bootstrap' && method === 'GET') {
      await this.ensureClients();
      const cl = await this.getClient(uid);
      return json({ did: this.did, off: await this.isOff(), cfg: await this.getCfg(), prod: await this.pubProd(admin), me: { id: uid, name: u.first_name || '', admin, profile: clientPublic(cl), blocked: !!(cl && cl.blocked), fav: await this.getFav(uid) }, orders: await this.myOrders(uid) });
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
    const card = adminCard(order, cfg.shop, this.origin, false, cl, this.did);
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
      if (text) await this.tg('sendMessage', { chat_id: o.uid, text, reply_markup: openBtn(this.origin, o.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы', this.origin + '/?v=mine') });
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
    if (!cq.from || !(await this.isAdmin(cq.from.id))) return answer('Нет доступа', true);
    // «s:<заказ>:<статус>», «c:<заказ>», «b:<заказ>»; у дистрибьюторов кроме первого после буквы идёт ещё его номер
    const parts = String(cq.data || '').split(':');
    const kind = parts[0];
    const withDid = kind === 's' ? parts.length >= 4 : parts.length >= 3;
    const id = withDid ? parts[2] : parts[1], to = withDid ? parts[3] : parts[2];
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
    const res = await shopCall(this.env, did, '/__/admin-add', { uid });
    if (!res.ok || !res.data) return { r: 'error' };
    await this.setSeller(uid, did, true, res.data.admins);
    if (owner) {
      const own = await this.owners();
      if (!own.includes(uid)) { own.push(uid); await this.st.put('owners', own); }
    }
    return { r: 'ok', did, owner };
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
    if (ag.uid && ag.uid !== uid) await this.st.delete('agu:' + ag.uid);
    ag.uid = uid;
    await this.st.put({ ['a:' + ag.id]: ag, ['agu:' + uid]: ag.id });
    return { r: 'ok', ag };
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
    const uid = au.user.id;

    if (path === '/api/hub/orders' && method === 'GET') {
      const all = await this.allRecs();
      const list = await this.userShops(uid);
      const got = await Promise.all(list.map(async did => {
        const r = await shopCall(this.env, did, '/__/my-orders', { uid });
        const rec = all.find(x => x.id === did);
        return ((r.data && r.data.orders) || []).map(o => Object.assign({}, o, { did, shopName: rec ? rec.name : did }));
      }));
      const orders = [].concat(...got).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return json({ orders });
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
    const parts = String(up.callback_query.data || '').split(':');
    const withDid = parts[0] === 's' ? parts.length >= 4 : parts.length >= 3;
    const did = withDid ? parts[1] : MAIN;
    if (!validDid(did) || !(await this.getRec(did))) return;
    await stubOf(this.env.SHOP, did).fetch(new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-did': did, 'x-telegram-bot-api-secret-token': secret },
      body: JSON.stringify(up)
    }));
  }
  async onMessage(msg) {
    if (!msg.from || !msg.chat || msg.chat.type !== 'private') return;
    const uid = msg.from.id, chat = msg.chat.id;
    const text = String(msg.text || '').trim();
    const lang = String(msg.from.language_code || '').toLowerCase().startsWith('uz') ? 'uz' : 'ru';
    const cmd = text.split(/\s+/)[0].split('@')[0].toLowerCase();
    const openText = lang === 'uz' ? '🛒 Katalogni ochish · Открыть каталог' : '🛒 Открыть каталог · Katalogni ochish';
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
        const who = res.did === MAIN && res.owner ? 'Готово, вы продавец.' : 'Готово, вы продавец «' + (rec ? rec.name : res.did) + '».';
        await this.tg('sendMessage', {
          chat_id: chat,
          text: who + ' Новые заказы будут приходить сюда с кнопками «Принять», «Готов», «Выдан». Каталог, цены и настройки меняются в приложении, вкладка «Продавец».'
            + (res.owner ? '\n\nВы также владелец площадки: дистрибьюторов можно добавлять в приложении, кнопка «Дистрибьюторы» в панели продавца.' : ''),
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
  /* Приветствие: если дистрибьютор один (или клиент пришёл по ссылке на него), говорим от его имени, иначе от имени площадки. */
  async welcome(lang, isAdmin, shopName) {
    let name = shopName;
    let several = false;
    if (!name) {
      const vis = (await this.allRecs()).filter(r => r.on && r.items > 0);
      if (vis.length === 1) name = vis[0].name;
      else { name = await this.title(); several = vis.length > 1; }
    }
    return welcomeText(lang, isAdmin, { name }, several);
  }
}
