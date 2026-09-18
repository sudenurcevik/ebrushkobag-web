import type { ImageRef } from './types';

/**
 * Every word and every photograph outside the seasonal chapters.
 * Copy lives here so it can be rewritten without touching layout.
 */

export const HERO = {
  image: {
    src: '/images/editorial/hero.webp',
    alt: 'Gün batımı ışığında kahverengi el örgüsü çanta',
    width: 2400,
    height: 3000,
    placeholderLabel: 'AÇILIŞ — HERO',
    required: true,
  } satisfies ImageRef,
  lines: ['Her mevsim', 'başka bir hikâye.'],
  subline: 'Handmade knit bags, made your way.',
  cta: 'Çantanı Tasarla',
  scrollHint: 'Mevsimleri keşfet',
};

export const INTRO = {
  lines: ['Dört mevsim.', 'Tek bir iplik.'],
  body: 'EBRUSHKOBAG bir sezon markası değil. Yılın dört bölümünde de aynı masada, aynı ellerle örülüyor — yalnızca ipin rengi ve kalınlığı değişiyor. Aşağı kaydırdıkça bir yılın içinden geçeceksin.',
};

export const STORY = {
  eyebrow: 'Hikâyemiz',
  headline: ['Her şey', 'bir iplikle', 'başlıyor.'],
  paragraphs: [
    'İlk çantayı kendime ördüm. İkincisini bir arkadaşıma. Üçüncüsünde hangi ipin nerede gerildiğini not almaya başlamıştım.',
    'Bugün de aynı masada çalışıyorum. Aynı anda üç çantadan fazlasını örmüyorum, çünkü her birinin nasıl ilerlediğini hatırlamak istiyorum.',
    'Renkleri mevsime göre seçiyorum ama kimseyi mevsimine hapsetmiyorum. Kışın bahar rengi isteyen çok oldu; hepsini ördük.',
  ],
  closing: ['Made by hand.', 'Chosen by you.'],
  images: {
    hands: {
      src: '/images/editorial/hands.webp',
      alt: 'Tığ işi yapan eller, yakın plan',
      width: 1600,
      height: 2000,
      placeholderLabel: 'HİKÂYE — ELLER',
      required: true,
    } satisfies ImageRef,
    workspace: {
      src: '/images/editorial/workspace.webp',
      alt: 'Atölye masası, ipler ve aletler',
      width: 2000,
      height: 1400,
      placeholderLabel: 'HİKÂYE — ATÖLYE',
      required: true,
    } satisfies ImageRef,
    yarn: {
      src: '/images/editorial/yarn.webp',
      alt: 'Renklerine göre dizilmiş ip yumakları',
      width: 1400,
      height: 1750,
      placeholderLabel: 'HİKÂYE — İPLER',
      required: true,
    } satisfies ImageRef,
  },
};

export const ARCHIVE_INTRO = {
  title: 'THE ARCHIVE',
  lines: ['Bir zamanlar yaptıklarımız.', 'Bir sonrakinin ilhamı olabilir.'],
  body: 'Arşivdeki parçaların çoğu tek sayı örüldü ve bir daha tekrarlanmadı. Yine de hepsi bir başlangıç noktası: beğendiğin bir kareyi seç, benzerini birlikte tasarlayalım.',
};

export const FINAL = {
  lines: ['Dört mevsim.', 'Sonsuz kombinasyon.', 'Bir tane seninki.'],
  cta: 'ÇANTANI TASARLA',
};

export const FAQ = [
  {
    question: 'Ne kadar sürede hazırlanıyor?',
    answer:
      'Modele göre 4–8 iş günü. Clutch modeller daha hızlı, tote modeller daha uzun sürüyor. Yoğun dönemlerde süreyi sipariş sırasında ayrıca teyit ediyoruz.',
  },
  {
    question: 'Mevsim seçersem renklerim kısıtlanır mı?',
    answer:
      'Hayır. Mevsim yalnızca hangi renklerin önce gösterileceğini belirliyor. “Tüm renkleri gör” dediğinde paletin tamamı açılıyor; kışın bahar rengi örmekte hiçbir sakınca yok.',
  },
  {
    question: 'Arşivdeki bir çantanın aynısını yapabilir misiniz?',
    answer:
      'Birebir aynısını genelde yapmıyoruz — çoğu tek parça olarak örüldü. Ama o tasarımı başlangıç noktası alıp çok yakınını birlikte kurabiliriz.',
  },
  {
    question: 'Renkler fotoğraftakilerle birebir aynı mı?',
    answer:
      'Ekran ve ışığa göre küçük farklar olabilir. Sipariş öncesi istersen o partiden çekilmiş gerçek bir fotoğrafı gönderiyoruz.',
  },
  {
    question: 'Kargo nasıl çalışıyor?',
    answer:
      'Türkiye içi gönderim 1–3 iş günü sürer. Yurt dışı gönderimlerde ülkeye göre fiyat ve süre paylaşıyoruz.',
  },
  {
    question: 'Siparişimi nasıl oluşturuyorum?',
    answer:
      'Tasarım ekranından çantanı kur, sana özel tasarım kodunu al ve “Instagram’dan Sipariş Ver” butonuna bas. Sipariş bilgilerin panoya kopyalanır, Instagram açılır. Sitede ödeme alınmaz.',
  },
];
