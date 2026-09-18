# EBRUSHKOBAG — mevsimlik marka sitesi

Renkli, el yapımı örgü çanta markası için tek akışlı bir site. Ziyaretçi bölüm
bölüm gezmiyor; **bir yılın içinden geçiyor**:

```
marka girişi → 01 BAHAR → 02 YAZ → 03 SONBAHAR → 04 KIŞ → ARŞİV → ÇANTANI TASARLA
```

Her mevsimin arasında sitenin imzası duruyor: çıkan mevsimin ipi takip edilip
örgünün içine giriliyor, doku mevsim değiştiriyor, bir sonraki mevsim o ipten
örülüyor. **Site ödeme almıyor**; sipariş Instagram üzerinden tamamlanıyor.

## Kurulum

```bash
npm install
npm run dev     # http://localhost:3001
```

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu (**3001**) |
| `npm run build` / `npm start` | Üretim derlemesi ve sunumu (3001) |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run assets:manifest` | `docs/ASSET-MANIFEST.md` dosyasını veriden yeniden üretir |

Bu uygulama tamamen bağımsızdır: kendi `package.json`, kendi kilit dosyası, kendi
`node_modules`, kendi `.next` klasörü. **3000 portundaki mevcut uygulamaya hiçbir
şekilde dokunmaz** ve ikisi aynı anda çalışabilir.

## Önce şunları değiştirin

1. **`src/config/brand.ts`** — Instagram adresi, e-posta, alan adı.
   ⚠ `instagramHandle` / `instagramUrl` / `instagramOrderUrl` marka adından
   tahmin edildi; yayına almadan önce doğrulayın.
2. **`src/data/seasons.ts`** — dört mevsimin rengi, metni, paleti, geçiş renkleri.
3. **`src/data/products.ts`** — ürünler ve arşiv.
4. **`src/data/configurator.ts`** — modeller, ipler, detaylar, saplar, fiyatlar,
   uyumluluk kuralları, hazır kombinasyonlar.
5. **`public/`** — görseller. Liste `docs/ASSET-MANIFEST.md`, canlı durum
   `/asset-manifest`.

Bileşenlerin hiçbiri mevsim rengi, ürün ya da fiyat bilmiyor; hepsi bu
dosyalardan türüyor.

## Logo

`public/brand/ebrushkobag-logo.png` markanın gerçek logosudur ve yeniden
çizilmemiştir. Sitenin paleti de bu logodan alınmıştır:

```
Blush #FEE9EA · Periwinkle #88ADFE · Hot Pink #FF68C4 · Lime #A0DB6B · Sunny #FFDE5A
```

Sonbahar ve kış için markadan çıkmayan koyu uzantılar eklendi (bordo, çikolata,
lacivert, gümüş).

## Fotoğraf olmadan da çalışır

- **Editoryal çerçeveler** dosya yoksa tasarlanmış bir yer tutucu gösterir: dosya
  adı, gereken ölçü ve — kritikse — "görsel bekleniyor" etiketi. Varlık kontrolü
  sunucuda `fs` ile yapılır; kırık görsel ikonu ya da 404 yok.
- **Makro dokular** gelmediği sürece mevsim geçişi *çizilmiş* örgü dokusunu
  kullanır. Bu, geçişin bugün de eksiksiz çalışması anlamına geliyor; gerçek
  makro kare eklendiğinde üstüne çapraz geçişle biniyor.
- **Atölye önizlemesi** katmanı eksik olan her rolü vektör olarak çizer. Çanta
  bugün de doğru renkte, doğru detayla, doğru sapla görünüyor ve PNG olarak
  indirilebiliyor.

Kritik ürün görselleri asla uydurulmaz (plan §32): yer tutucu açıkça dosyanın
eksik olduğunu söyler.

## Mevsim geçişi nasıl çalışıyor

`src/components/seasons/SeasonTransition.tsx` — sayfadaki tek GSAP alanı.

```
0–15 %   çıkan mevsim hâlâ bütün
15–34 %  iplik kadraja giriyor ve kendini çiziyor
30–52 %  kamera ürünün dokusunun içine giriyor
50–70 %  tam ekran makro; palet dönüşüyor
70–84 %  iplik yeni renkte geri geliyor, yeni bölümün adını örüyor
82–100 % yeni mevsimin ürününe geri zoom
```

İki teknik not:

- **Dönüşümler** tek bir scrubbed timeline'da. **Renk** ise `onUpdate` içinde
  CSS değişkenlerine yazılıyor; GSAP keyfi uzunluktaki renk listeleri arasında
  geçiş yapamadığı için (§14'teki duraklar) ara değerleri `src/lib/color.ts`
  hesaplıyor. Kaydırma sırasında hiçbir React state'i değişmiyor.
- **`prefers-reduced-motion`** açıkken geçiş tamamen değişiyor: pin yok, zoom
  yok; yerine sakin bir renk geçişi ve bölüm adı geliyor (§36).

## Atölye

- **Durum URL'de:** `/atelier?model=bloom&body=hotpink&detail=woodBeads&handle=knitStrap`
  aynı çantayı aylar sonra da yeniden kurar. Veritabanı yok.
- **Tasarım kodu** seçimden türer ve geri çözülebilir: `BLM-HPK-WOD-KNT`.
- **Mevsim seçimi kısıtlama değil.** Yalnızca hangi renklerin önce görüneceğini
  belirler; "Tüm renkleri gör" paletin tamamını açar (§27).
- **Hazır kombinasyonlar** ayrı bir sistem değil — aynı state'e yazan birer
  seçimden ibaret (§28).
- **Uyumsuz seçenekler gizlenmez;** listede kalır, pasifleşir, nedenini yazar.
  Artık üretilemeyen bir bağlantı açıldığında seçim en yakın alternatife onarılır
  ve adres çubuğu da düzeltilir.
- **Görsel dışa aktarma** ekran görüntüsü almaz; aynı katman modelini canvas'a
  yeniden çizer.

### Instagram akışı

Instagram hazır mesaj kabul etmediği için akış açıkça iki adımlı (§30): sipariş
metni panoya kopyalanır, onay bildirimi gösterilir, sonra Instagram açılır.

## Bilinçli tercihler

- **Framer Motion bağımlılığı kaldırıldı.** Plan onu yalnızca basit arayüz
  hareketleri için öneriyordu (menü, buton, küçük açılışlar, atölye kontrolleri);
  bunların hepsi burada CSS geçişleriyle yapıldı — daha hızlı ve script
  yüklenmese bile içerik görünür kalıyor. Kullanılmayan bir paketi yüklemektense
  çıkarmak daha doğru göründü. GSAP, planın verdiği işi yapıyor: pinlenmiş mevsim
  geçişleri ve hero'nun yavaş ölçeklenmesi.
- **Three.js / WebGL / 3D yok** (§35), **Konva yok**: önizleme 2D katmanlı.
- **Kaydırma açılışları CSS geçişi**; JavaScript yalnızca bir
  `IntersectionObserver` ile `data-visible` bayrağını çeviriyor. Gizleme kuralları
  `[data-js]` altında, o da açılışta tek satırlık bir betikle konuyor — paket
  yüklenmezse hiçbir içerik gizli kalmıyor.
- **Cam efekti yok.** Menü kaydırıldığında saydam değil, tamamen opak blush'a
  dönüyor; böylece dört farklı mevsim zemininin üzerinde de aynı çerçeve gibi
  duruyor.

## Erişilebilirlik

Semantik bölümler, gerçek `radio` girdileri (ok tuşlarıyla gezinilir),
`aria-expanded`/`aria-controls` ile akordeon, her yerde görünür odak halkası,
`inert` ile kapalı mobil menü, alt metinleri veri dosyalarında tanımlı görseller,
ve hareketsiz çalışan tam içerik.
