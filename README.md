# Tabela

İlçe seç. Web sitesi olmayan işletme üste gelsin.

Freelance site işi arayanlar için bir masa. Diş, kuaför, oto servis. Kimin sitesi yok, kimin sayfası açılmıyor, kimin yalnız Instagram’ı var. Skor bunu söyler. Sihirli bir sayı yok.

Kayıtlar örnektir. Harita kazınmaz. Canlı bağlansa kaynak resmi bir yer API’si olur.

## Masa

Filtre `ARA` basılınca işler. Yazarken liste oynamaz. `Vazgeç` son aramaya döner.

Soldan sıcak, sitesiz ya da aşama seçilir. İsme tıklanınca skorun satırları kendi sekmesinde açılır: site, yorum, puan, telefon, zincir şube. 80 ve üstü sıcak sayılır.

CSV Türkçe Excel içindir. Ayırıcı `;`, dosyanın başında BOM.

## Çalıştır

```bash
npm install
npm test
npm run dev
```

[http://localhost:3000](http://localhost:3000)

Skor ve filtre `lib/leads.ts` içinde. Örnek işletmeler `lib/data.ts`. Ekran üçe bölünmüş: filtre, tablo, kayıt.
