# EBRUSHKOBAG — Görsel Listesi

> Bu dosya `src/lib/asset-manifest.ts` üzerinden üretilir. Elle düzenlemeyin; mevsim/ürün/katalog verisi değiştiğinde `npm run assets:manifest` ile yenileyin.

Toplam **78 dosya**. Hepsi `public/` altına, tabloda yazan yola birebir aynı adla konur. Eksik dosyalar tasarlanmış yer tutucularla karşılanır, bu yüzden görseller parça parça teslim edilebilir.

**Kritik** işaretli dosyalar markanın gerçek ürün kimliğini taşır ve uydurulamaz.
Canlı durumu `npm run dev` çalışırken `/asset-manifest` adresinde görebilirsiniz.

## Mevsim görselleri

Sitenin omurgası. Her mevsimin üç karesi var: bölüm görseli, geçişte zoom yapılan ürün ve makro doku. WebP, kalite 80–85.

| Dosya | Ölçü | Oran | Şeffaf | Kritik | Nerede | Amaç |
| --- | --- | --- | --- | --- | --- | --- |
| `/images/editorial/hero.webp` | 2400×3000 | 4:5 | Hayır | Evet | Açılış | Markayı tanıtan tam ekran kare. Sol alt üçte biri boş kalmalı; başlık oraya oturuyor. |
| `/images/seasons/spring/hero.webp` | 2000×2500 | 4:5 | Hayır | Evet | BAHAR — bölüm görseli | Bölümün büyük editoryal karesi. Kadrajın bir kenarı ekrandan taşacak şekilde kullanılıyor. |
| `/images/seasons/spring/product.webp` | 1800×1800 | 1:1 | Hayır | Evet | BAHAR — geçiş ürünü | Mevsim geçişinde içine zoom yapılan kare. Örgü dokusu net görünmeli; çanta ortalanmış olmalı. |
| `/images/seasons/spring/macro.webp` | 2400×1600 | 3:2 | Hayır | Evet | BAHAR — makro doku | Geçişin tam ekran olduğu an. İlmeklerin ayırt edildiği çok yakın makro çekim. Dosya yoksa site çizilmiş örgü dokusunu kullanır — ama gerçek doku bu bölümün imzası. |
| `/images/seasons/summer/hero.webp` | 2000×2500 | 4:5 | Hayır | Evet | YAZ — bölüm görseli | Bölümün büyük editoryal karesi. Kadrajın bir kenarı ekrandan taşacak şekilde kullanılıyor. |
| `/images/seasons/summer/product.webp` | 1800×1800 | 1:1 | Hayır | Evet | YAZ — geçiş ürünü | Mevsim geçişinde içine zoom yapılan kare. Örgü dokusu net görünmeli; çanta ortalanmış olmalı. |
| `/images/seasons/summer/macro.webp` | 2400×1600 | 3:2 | Hayır | Evet | YAZ — makro doku | Geçişin tam ekran olduğu an. İlmeklerin ayırt edildiği çok yakın makro çekim. Dosya yoksa site çizilmiş örgü dokusunu kullanır — ama gerçek doku bu bölümün imzası. |
| `/images/seasons/autumn/hero.webp` | 2000×2500 | 4:5 | Hayır | Evet | SONBAHAR — bölüm görseli | Bölümün büyük editoryal karesi. Kadrajın bir kenarı ekrandan taşacak şekilde kullanılıyor. |
| `/images/seasons/autumn/product.webp` | 1800×1800 | 1:1 | Hayır | Evet | SONBAHAR — geçiş ürünü | Mevsim geçişinde içine zoom yapılan kare. Örgü dokusu net görünmeli; çanta ortalanmış olmalı. |
| `/images/seasons/autumn/macro.webp` | 2400×1600 | 3:2 | Hayır | Evet | SONBAHAR — makro doku | Geçişin tam ekran olduğu an. İlmeklerin ayırt edildiği çok yakın makro çekim. Dosya yoksa site çizilmiş örgü dokusunu kullanır — ama gerçek doku bu bölümün imzası. |
| `/images/seasons/winter/hero.webp` | 2000×2500 | 4:5 | Hayır | Evet | KIŞ — bölüm görseli | Bölümün büyük editoryal karesi. Kadrajın bir kenarı ekrandan taşacak şekilde kullanılıyor. |
| `/images/seasons/winter/product.webp` | 1800×1800 | 1:1 | Hayır | Evet | KIŞ — geçiş ürünü | Mevsim geçişinde içine zoom yapılan kare. Örgü dokusu net görünmeli; çanta ortalanmış olmalı. |
| `/images/seasons/winter/macro.webp` | 2400×1600 | 3:2 | Hayır | Evet | KIŞ — makro doku | Geçişin tam ekran olduğu an. İlmeklerin ayırt edildiği çok yakın makro çekim. Dosya yoksa site çizilmiş örgü dokusunu kullanır — ama gerçek doku bu bölümün imzası. |

## Ürün görselleri

Gerçek ürün kimliği korunmalı. Arka plan temizleme, ışık dengeleme ve kompozisyon düzenlemesi serbest; çantanın kendisi yeniden üretilmemeli (plan §31).

| Dosya | Ölçü | Oran | Şeffaf | Kritik | Nerede | Amaç |
| --- | --- | --- | --- | --- | --- | --- |
| `/images/products/patchwork/patchwork-01.webp` | 1600×2000 | 4:5 | Hayır | Evet | SPRING — PATCHWORK NO. 01 | Ürünün editoryal karesi. Gerçek çantanın kendi geometrisi korunmalı; yeniden tasarlanmış bir çanta üretilmemeli (plan §31). |
| `/images/products/patchwork/bloom-02.webp` | 1600×2000 | 4:5 | Hayır | Evet | SPRING — BLOOM NO. 02 | Ürünün editoryal karesi. Gerçek çantanın kendi geometrisi korunmalı; yeniden tasarlanmış bir çanta üretilmemeli (plan §31). |
| `/images/products/patchwork/sorbet-03.webp` | 1600×2000 | 4:5 | Hayır | Evet | SUMMER — SORBET NO. 03 | Ürünün editoryal karesi. Gerçek çantanın kendi geometrisi korunmalı; yeniden tasarlanmış bir çanta üretilmemeli (plan §31). |
| `/images/products/patchwork/marina-04.webp` | 1600×2000 | 4:5 | Hayır | Evet | SUMMER — MARINA NO. 04 | Ürünün editoryal karesi. Gerçek çantanın kendi geometrisi korunmalı; yeniden tasarlanmış bir çanta üretilmemeli (plan §31). |
| `/images/products/brown-knit/sunset-05.webp` | 1600×2000 | 4:5 | Hayır | Evet | AUTUMN — SUNSET NO. 05 | Ürünün editoryal karesi. Gerçek çantanın kendi geometrisi korunmalı; yeniden tasarlanmış bir çanta üretilmemeli (plan §31). |
| `/images/products/brown-knit/ember-06.webp` | 1600×2000 | 4:5 | Hayır | Evet | AUTUMN — EMBER NO. 06 | Ürünün editoryal karesi. Gerçek çantanın kendi geometrisi korunmalı; yeniden tasarlanmış bir çanta üretilmemeli (plan §31). |
| `/images/products/silver-clutch/shine-07.webp` | 1600×2000 | 4:5 | Hayır | Evet | WINTER — SHINE NO. 07 | Ürünün editoryal karesi. Gerçek çantanın kendi geometrisi korunmalı; yeniden tasarlanmış bir çanta üretilmemeli (plan §31). |
| `/images/products/black-sequin/midnight-08.webp` | 1600×2000 | 4:5 | Hayır | Evet | WINTER — MIDNIGHT NO. 08 | Ürünün editoryal karesi. Gerçek çantanın kendi geometrisi korunmalı; yeniden tasarlanmış bir çanta üretilmemeli (plan §31). |

## Arşiv

Eski Instagram kareleri. Mozaikte farklı boyutlarda kullanılıyor.

| Dosya | Ölçü | Oran | Şeffaf | Kritik | Nerede | Amaç |
| --- | --- | --- | --- | --- | --- | --- |
| `/images/archive/archive-01.webp` | 1600×2000 | 4:5 | Hayır | — | Arşiv — SUMMER '25 | Eski Instagram karesi. Kadrajlar birbirinden farklı olsun. |
| `/images/archive/archive-02.webp` | 1400×1400 | 1:1 | Hayır | — | Arşiv — TEK PARÇA | Eski Instagram karesi. Kadrajlar birbirinden farklı olsun. |
| `/images/archive/archive-03.webp` | 1600×1200 | 4:3 | Hayır | — | Arşiv — EL YAPIMI | Eski Instagram karesi. Kadrajlar birbirinden farklı olsun. |
| `/images/archive/archive-04.webp` | 1400×1750 | 4:5 | Hayır | — | Arşiv — ÖNCEKİ TASARIM | Eski Instagram karesi. Kadrajlar birbirinden farklı olsun. |
| `/images/archive/archive-05.webp` | 1600×1200 | 4:3 | Hayır | — | Arşiv — ARŞİV | Eski Instagram karesi. Kadrajlar birbirinden farklı olsun. |
| `/images/archive/archive-06.webp` | 1400×1750 | 4:5 | Hayır | — | Arşiv — TEK PARÇA | Eski Instagram karesi. Kadrajlar birbirinden farklı olsun. |
| `/images/archive/archive-07.webp` | 1600×2000 | 4:5 | Hayır | — | Arşiv — SPRING '25 | Eski Instagram karesi. Kadrajlar birbirinden farklı olsun. |

## Hikâye

Üretim ve atölye kareleri.

| Dosya | Ölçü | Oran | Şeffaf | Kritik | Nerede | Amaç |
| --- | --- | --- | --- | --- | --- | --- |
| `/images/editorial/hands.webp` | 1600×2000 | 4:5 | Hayır | — | Hikâyemiz | Örgü ören eller, yakın plan. |
| `/images/editorial/workspace.webp` | 2000×1400 | 10:7 | Hayır | — | Hikâyemiz | Atölye masası, geniş kare. |
| `/images/editorial/yarn.webp` | 1400×1750 | 4:5 | Hayır | — | Hikâyemiz | İp rafı ya da yumaklar. |

## Atölye katmanları

Hepsi şeffaf WebP/PNG ve hepsi aynı 2000×2000 tuvale, aynı hizada. Çanta karenin yaklaşık %80’ini doldurur. Tek bir çekimden maskelenerek üretilmeli: çanta, kamera ve ışık sabit kalsın, yalnızca sap ve detay katmanları ayrılsın. Bir katman eksikse arayüz onu vektör olarak çizer — site hiçbir zaman bozulmaz.

| Dosya | Ölçü | Oran | Şeffaf | Kritik | Nerede | Amaç |
| --- | --- | --- | --- | --- | --- | --- |
| `/images/configurator/bloom/base/body-black.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (gövde) | Siyah gövdenin kendi çekimi. Koyu tonlarda renklendirme dokuyu yok ediyor. |
| `/images/configurator/bloom/base/body-neutral.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (gövde) | Nötr (doygunluğu alınmış) örgü gövde. Renk buradan türetilir: doku, ilmek ve gölgeler bu katmanda yaşar. |
| `/images/configurator/bloom/base/highlights.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (gövde) | Parlaklık geçişi. Yalnızca açık tonlar; screen olarak bindirilir. |
| `/images/configurator/bloom/base/shadow.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (gövde) | Zemin gölgesi. Yalnızca gölge, çanta yok. |
| `/images/configurator/bloom/details/gold.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/bloom/details/pearl.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/bloom/details/silver.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/bloom/details/wood-beads.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/bloom/handles/black-leather.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/bloom/handles/brown-leather.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/bloom/handles/knit-strap.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/bloom/handles/wood-handle.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Bloom (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/patch/base/body-black.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (gövde) | Siyah gövdenin kendi çekimi. Koyu tonlarda renklendirme dokuyu yok ediyor. |
| `/images/configurator/patch/base/body-neutral.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (gövde) | Nötr (doygunluğu alınmış) örgü gövde. Renk buradan türetilir: doku, ilmek ve gölgeler bu katmanda yaşar. |
| `/images/configurator/patch/base/highlights.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (gövde) | Parlaklık geçişi. Yalnızca açık tonlar; screen olarak bindirilir. |
| `/images/configurator/patch/base/shadow.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (gövde) | Zemin gölgesi. Yalnızca gölge, çanta yok. |
| `/images/configurator/patch/details/gold.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/patch/details/pearl.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/patch/details/silver.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/patch/details/wood-beads.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/patch/handles/black-leather.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/patch/handles/brown-leather.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/patch/handles/knit-strap.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/patch/handles/wood-handle.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Patch (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/shine/base/body-black.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (gövde) | Siyah gövdenin kendi çekimi. Koyu tonlarda renklendirme dokuyu yok ediyor. |
| `/images/configurator/shine/base/body-neutral.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (gövde) | Nötr (doygunluğu alınmış) örgü gövde. Renk buradan türetilir: doku, ilmek ve gölgeler bu katmanda yaşar. |
| `/images/configurator/shine/base/highlights.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (gövde) | Parlaklık geçişi. Yalnızca açık tonlar; screen olarak bindirilir. |
| `/images/configurator/shine/base/shadow.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (gövde) | Zemin gölgesi. Yalnızca gölge, çanta yok. |
| `/images/configurator/shine/details/gold.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/shine/details/pearl.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/shine/details/silver.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/shine/details/wood-beads.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/shine/handles/black-leather.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/shine/handles/brown-leather.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/shine/handles/chain.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Shine (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/sunset/base/body-black.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (gövde) | Siyah gövdenin kendi çekimi. Koyu tonlarda renklendirme dokuyu yok ediyor. |
| `/images/configurator/sunset/base/body-neutral.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (gövde) | Nötr (doygunluğu alınmış) örgü gövde. Renk buradan türetilir: doku, ilmek ve gölgeler bu katmanda yaşar. |
| `/images/configurator/sunset/base/highlights.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (gövde) | Parlaklık geçişi. Yalnızca açık tonlar; screen olarak bindirilir. |
| `/images/configurator/sunset/base/shadow.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (gövde) | Zemin gölgesi. Yalnızca gölge, çanta yok. |
| `/images/configurator/sunset/details/gold.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/sunset/details/pearl.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/sunset/details/silver.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/sunset/details/wood-beads.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (detay) | Yalnızca detay katmanı. Gövdenin üzerine, aynı hizada. |
| `/images/configurator/sunset/handles/black-leather.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/sunset/handles/brown-leather.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/sunset/handles/chain.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |
| `/images/configurator/sunset/handles/knit-strap.webp` | 2000×2000 | 1:1 | Evet | — | Atölye önizleme — Sunset (sap) | Yalnızca sap. Gövde olmadan, halkalar dahil. |

## Teslim notları

- Biçim: editoryal görseller için WebP (kalite 80–85), katmanlar için şeffaf WebP/PNG.
- Renk profili: sRGB.
- Dosya adlarını değiştirmeyin; kod bu yollara göre arıyor.
- Makro dokular geçişin tam ekran olduğu an için. Gelmediği sürece site çizilmiş örgü dokusunu kullanır; gerçek doku geldiğinde üstüne çapraz geçişle biner.
- Logo `public/brand/ebrushkobag-logo.png` olarak duruyor ve yeniden çizilmemeli.
