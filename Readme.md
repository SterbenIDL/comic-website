# Squad Noobs - אתר קומיקס

## לפני העלאה
1. להחליף `YOUR-DOMAIN.example` בכתובת האתר בכל הקבצים (וב-`site.config.json`).
2. להחליף `BIT_LINK`, `WHATSAPP_NUMBER` ו-`STOCK` בתוך `comics.html`.
3. להחליף `YOUR-EMAIL@example.com`, `YOUR-NAME`, `YOUR-PHONE` בעמודי המדיניות, התנאים והנגישות, ואת קישורי Ko-fi ו-Patreon ב-`support.html`.
4. להריץ `python3 tools/optimize-images.py` ו-`node tools/build.js`.
5. להעלות לאירוח עם HTTPS (Cloudflare Pages או Netlify). הקבצים `_headers` ו-`_redirects` מופעלים אוטומטית.
6. אחרי בדיקה, להפוך `Content-Security-Policy-Report-Only` ב-`_headers` ל-`Content-Security-Policy`.

## אחרי כל שינוי
להעלות את `VERSION` בתחילת `sw.js`, כדי שהמבקרים יקבלו את הגרסה החדשה.