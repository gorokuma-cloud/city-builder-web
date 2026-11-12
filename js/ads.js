/**
 * WanBridge (ワンブリッジ) - 広告・スポンサード枠マスターデータ
 * 収益モデルの中核となるプレミアムドッグフード、サプリメント、シニアケア用品等のタイアップ広告
 */

export const SPONSORED_ADS = {
  // 犬一覧グリッド内に自然に差し込まれるインフィード広告 (子犬向け)
  infeedPuppy: {
    id: "ad-food-01",
    type: "sponsored_feed",
    sponsorName: "MISHONE (ミシュワン)",
    badge: "公式提携 / 厳選推奨フード",
    title: "人でも食べられる最高品質【プレミアムドッグフード MISHONE】",
    description: "健康・毛並み・関節ケアをトータル実現！全年齢対応・グレインフリー・無添加。獣医師推奨の国産最高峰フード。",
    imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80",
    offerTag: "初回特別割引",
    ctaText: "人でも食べることができる最高品質の原材料。詳細を見る ➔",
    priceText: "定期初回 ¥3,980 (送料無料)",
    target: "puppy",
    linkUrl: "[URL]"
  },

  // インフィード広告 (シニア・里親引退犬向け)
  infeedSenior: {
    id: "ad-food-02",
    type: "sponsored_feed",
    sponsorName: "NatureBite (ネイチャーバイト) シニア",
    badge: "スポンサード / 里親応援",
    title: "引退犬・シニア犬の第2の犬生を支える【関節グルコサミン＆低脂肪ケアフード】",
    description: "4歳以降の運動量変化に着目。コンドロイチン高配合で足腰の負担を軽減。腸内フローラを整えるオリゴ糖＆乳酸菌100億個配合。",
    imageUrl: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80",
    offerTag: "里親様限定 30%OFF",
    ctaText: "シニア健康診断セットを見る",
    priceText: "定期特別価格 ¥2,480",
    target: "senior"
  },

  // 詳細モーダル下部に表示される、犬種・ステージ連動型コンテキストマッチ広告
  contextMatch: {
    // トイプードル向け
    "トイプードル": {
      brand: "Poodle Royal Care",
      productName: "プードル専用 美毛＆涙やけ防止オーガニックフード",
      imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80",
      catchphrase: "カール毛のふわふわ感と目元のクリアを毎日の食事で維持",
      benefit: "オメガ3脂肪酸高含有・アレルゲン低減設計",
      campaign: "ブリーダー成約特典 1ヶ月分無料プレゼント"
    },
    // 豆柴向け
    "柴犬 (豆柴)": {
      brand: "和の極み (柴専用)",
      productName: "国産魚粉＆玄米仕立て 皮膚・被毛ダブルサポートフード",
      imageUrl: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80",
      catchphrase: "換毛期の皮膚トラブルを防ぎ、引き締まった筋肉美をつくる",
      benefit: "グレインフリー・国産鹿肉ベース",
      campaign: "お迎え安心スターターセット同梱"
    },
    // チワワ向け
    "チワワ": {
      brand: "MicroBites (極小粒)",
      productName: "極小口・アゴ対応 プレミアム超小粒チキン＆サーモン",
      imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80",
      catchphrase: "超小型犬でも無理なく噛める3mm粒設計。低血糖予防対応",
      benefit: "高カロリー高栄養・食べきり小分けパック",
      campaign: "初回お試しパック 500円"
    },
    // デフォルト（その他）
    "default": {
      brand: "WanGourmet オールステージ",
      productName: "全犬種対応 厳選ヒューマングレード無添加プレミアムフード",
      imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80",
      catchphrase: "人も食べられる安全基準。毎日の健康を内側からサポート",
      benefit: "着色料・香料・保存料完全無添加",
      campaign: "WanBridge会員限定 20%ポイント還元"
    }
  }
};

