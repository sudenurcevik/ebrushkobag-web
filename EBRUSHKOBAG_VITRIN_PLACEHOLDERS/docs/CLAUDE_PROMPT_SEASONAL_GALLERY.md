# Claude Prompt – Ebrushkobag Seasonal Gallery Setup

Aşağıdaki promptu Claude'a verebilirsin:

---

Sen Ebrushkobag için yeni seasonal gallery yapısını kuran bir ürün/tasarım asistanısın.

Elimde bir ZIP var. ZIP içinde mevsim klasörlerine ayrılmış placeholder vitrın görselleri bulunuyor:
- spring/
- summer/
- autumn/
- winter/
- docs/manifest.csv
- docs/README_SEZON_TAGLERI.md

Bu görseller şimdilik geçici placeholder olarak kullanılacak. Projeyi buna göre kurgula.

## Bağlam
- Marka adı: **Ebrushkobag**
- Marka karakteri: el yapımı, renkli, neşeli, yaratıcı, ama aynı zamanda şık
- Tüm çantalar customize edilmeyecek
- Customize edilecek final modeller daha sonra seçilecek
- **Fuşya halka saplı pembe çanta kesin olarak koleksiyonda kalacak**
- Daha sonra yeni çanta görselleri eklendikçe bu galeri büyütülecek
- Şu an amaç: galeriyi çalışır, düzenli, genişletilebilir hale getirmek

## İstediğim çıktı
1. Seasonal gallery yapısını kur
2. Her mevsim için bir hero alanı oluştur
3. Hero altında o mevsime ait placeholder ürün kartlarını göster
4. Her ürün kartı için:
   - görsel
   - ürün adı
   - kısa açıklama
   - sezon etiketi
5. Yapı ileride kolayca genişletilebilir olsun
6. Gallery data-driven olsun; mümkünse ürünler bir data dizisinden beslensin
7. Mevsim değişim kurgusuna uygun bir his ver
8. Şimdilik customize mantığını galeride sadece "coming later" / "selected models will be customizable" gibi hafif bir notla belirt
9. Var olan app yapısını bozmadan bu galeriyi entegre etmeye uygun bir mimari öner

## Sezon eşleşmeleri
Primary season eşleşmelerini manifest.csv dosyasından oku ve kullan.

## Stil notları
- Arka planda mevsime göre renklenen saten vitrin dili korunmalı
- Görseller premium ama eğlenceli hissedilmeli
- Fazla kurumsal değil, butik ve sıcak bir his olmalı
- Tasarım genişletilebilir olmalı çünkü daha fazla çanta eklenecek

## Teknik tercih
- Component tabanlı yapı
- Reusable card sistemi
- Seasonal section component
- Product data config dosyası
- İleride filter/tag sistemi eklenebilecek temiz yapı

Önce kısa bir plan ver, sonra dosya yapısını öner, sonra gerekli component/data yapısını yaz.

---