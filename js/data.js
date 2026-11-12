/**
 * WanBridge (ワンブリッジ) - 子犬・里親犬マスターデータ
 * 4大マイルストーン（出生時・35日・60日・90日）体重ログ、高画質複数写真、仮名称、遺伝病クリア情報等を完全網羅
 */

export const INITIAL_DOGS = [
  {
    id: "dog-001",
    listingType: "puppy_sale", // puppy_sale | breeder_retired | rescue_org
    temporaryName: "青リボンくん",
    registeredName: "トイ・プードル (レッド)",
    breed: "トイプードル",
    breedEn: "Toy Poodle",
    gender: "male", // male | female
    birthDate: "2026-07-05",
    currentAgeDays: 62,
    color: "レッド",
    price: 385000,
    priceNote: "総額表示 (マイクロチップ・ワクチン2回分・血統書込)",
    status: "available", // available | negotiating | adopted
    freshnessStatus: "green", // green (最新更新済) | yellow (写真古い警告) | red (期限超過)
    freshnessLabel: "最新写真確認済 (生後60日)",
    predictedSizeCategory: "タイニー確定級",
    predictedWeightRange: "2.1kg 〜 2.4kg",
    confidenceRate: 98,
    kennelName: "千住プードル犬舎",
    breederName: "森本 和夫 (千住プードル犬舎 直営育成モデル)",
    prefecture: "東京都",
    location: "足立区千住",
    description: "マズルが短く足が短いドワーフタイプの極上トイプードル。生後60日体重840gで、タイニーサイズ確定の成長曲線を描いています。無駄吠えが一切なく、人懐っこく甘えん坊な性格です。",
    lifestyle: {
      apartmentOk: true,
      leavingAloneOk: true,
      sheddingMin: true,
      beginnerOk: true,
      goodWithKids: true
    },
    health: {
      praClear: true,      // 進行性網膜萎縮症クリア (発症リスクなし)
      dmClear: true,       // 変性性脊髄症クリア (発症リスクなし)
      vwd1Clear: true,     // フォン・ヴィレブランド病クリア (発症リスクなし)
      geneticLab: "VEQTA (動物遺伝子検査研究所)",
      geneticCertNumber: "VQ-2026-TP001",
      geneticTestDate: "2026-08-15",
      geneticStatus: "3項目全クリア (発症リスクなし) ✅",
      patellaGrade: "Grade 0 (正常・膝関節強固)",
      veterinaryCheck: "All-A (2026-09-02検診済・心音/咬合/ヘルニア異常なし)"
    },
    parents: {
      father: {
        breed: "トイプードル (レッド・タイニー 2.0kg)",
        title: "JKCチャンピオン直子",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2024-TP881"
      },
      mother: {
        breed: "トイプードル (アプリコット 2.3kg)",
        title: "自家繁殖・穏やかな良血統",
        photo: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2025-TP412"
      }
    },
    // 横スライド用写真ギャラリー (PC大画面でも高精細)
    images: [
      {
        url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=85",
        caption: "生後60日 最新立ち姿（毛量フサフサ・アイラインくっきり）",
        tag: "生後60日・最新"
      },
      {
        url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1200&q=85",
        caption: "生後60日 デジタル体重計での実測シーン (840g記録)",
        tag: "体重計実測証憑"
      },
      {
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85",
        caption: "生後35日 離乳食スタート時のあどけない表情",
        tag: "生後35日マイルストーン"
      },
      {
        url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=85",
        caption: "母犬と兄妹犬（赤リボンちゃん）と犬舎リビングで遊ぶ様子",
        tag: "犬舎成育環境"
      }
    ],
    milestones: [
      {
        type: "birth_day0",
        label: "出生時 (生後0日)",
        days: 0,
        date: "2026-07-05",
        weightG: 135,
        targetPredictedKg: "2.0〜2.3kg",
        photo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "安産で元気に誕生。母乳の吸い付き良好。"
      },
      {
        type: "day35",
        label: "離乳期 (生後35日)",
        days: 35,
        date: "2026-08-09",
        weightG: 510,
        targetPredictedKg: "2.1〜2.4kg",
        photo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "ふやかしフードを自力完食。手足の短さが確定。"
      },
      {
        type: "day60",
        label: "2ヶ月 (生後60日)",
        days: 60,
        date: "2026-09-03",
        weightG: 840,
        targetPredictedKg: "2.1〜2.3kg (確定)",
        photo: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "ワクチン1回目接種＆健康診断All-A。生後60日体重×3.0＝2.5kg以内がほぼ確実。"
      },
      {
        type: "day90",
        label: "3ヶ月 (生後90日)",
        days: 90,
        date: "2026-10-03 (予定)",
        weightG: null,
        targetPredictedKg: "測定前",
        photo: null,
        scalePhoto: false,
        memo: "次回マイルストーン測定予定"
      }
    ],
    tags: ["#最新写真確認済🟢", "#タイニー自動計算確定", "#生後60日写真あり", "#JKCチャンピオン血統", "#PRAクリア", "#総額コミコミ表示", "#マンション向け"]
  },
  {
    id: "dog-002",
    listingType: "puppy_sale",
    temporaryName: "赤リボンちゃん",
    registeredName: "トイ・プードル (アプリコット)",
    breed: "トイプードル",
    breedEn: "Toy Poodle",
    gender: "female",
    birthDate: "2026-07-05",
    currentAgeDays: 62,
    color: "アプリコット",
    price: 418000,
    priceNote: "総額表示 (生体保証1年・ワクチン込)",
    status: "available",
    freshnessStatus: "green",
    freshnessLabel: "最新写真確認済 (生後60日)",
    predictedSizeCategory: "タイニー〜極小サイズ",
    predictedWeightRange: "1.9kg 〜 2.2kg",
    confidenceRate: 97,
    kennelName: "千住プードル犬舎",
    breederName: "森本 和夫 (千住プードル犬舎 直営育成モデル)",
    prefecture: "東京都",
    location: "足立区千住",
    description: "お目々パッチリのお姫様顔！青リボンくんの同腹姉妹です。毛量が多くカールがしっかりしており、テディベアカットが抜群に似合います。体重も生後60日時点で810gと小ぶりです。",
    lifestyle: {
      apartmentOk: true,
      leavingAloneOk: true,
      sheddingMin: true,
      beginnerOk: true,
      goodWithKids: true
    },
    health: {
      praClear: true,
      dmClear: true,
      vwd1Clear: true,
      geneticLab: "VEQTA (動物遺伝子検査研究所)",
      geneticCertNumber: "VQ-2026-TP002",
      geneticTestDate: "2026-08-15",
      geneticStatus: "3項目全クリア (発症リスクなし) ✅",
      patellaGrade: "Grade 0 (正常)",
      veterinaryCheck: "All-A (健康診断証明書添付済)"
    },
    parents: {
      father: {
        breed: "トイプードル (レッド 2.0kg)",
        title: "JKCチャンピオン直子",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2024-TP881"
      },
      mother: {
        breed: "トイプードル (アプリコット 2.3kg)",
        title: "温厚・小ぶりサイズ",
        photo: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2025-TP412"
      }
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=1200&q=85",
        caption: "生後60日 お顔のアップ（まん丸お目々と毛量）",
        tag: "最新生後60日"
      },
      {
        url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=85",
        caption: "生後60日 体重計測定 (810g)",
        tag: "体重計実測証憑"
      },
      {
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85",
        caption: "生後35日のお昼寝タイム",
        tag: "生後35日写真"
      }
    ],
    milestones: [
      {
        type: "birth_day0",
        label: "出生時 (生後0日)",
        days: 0,
        date: "2026-07-05",
        weightG: 128,
        targetPredictedKg: "1.9〜2.2kg",
        photo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "小ぶりながら健康に誕生"
      },
      {
        type: "day35",
        label: "離乳期 (生後35日)",
        days: 35,
        date: "2026-08-09",
        weightG: 485,
        targetPredictedKg: "2.0〜2.2kg",
        photo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "離乳食完食。おっとり性格"
      },
      {
        type: "day60",
        label: "2ヶ月 (生後60日)",
        days: 60,
        date: "2026-09-03",
        weightG: 810,
        targetPredictedKg: "1.9〜2.2kg (確定)",
        photo: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "獣医検診All-A。タイニー極小確定"
      }
    ],
    tags: ["#最新写真確認済🟢", "#タイニー自動計算確定", "#生後60日写真あり", "#毛量抜群", "#遺伝子3項目全クリア✅", "#遺伝情報100%開示", "#総額コミコミ表示"]
  },
  {
    id: "dog-003",
    listingType: "puppy_sale",
    temporaryName: "モコちゃん",
    registeredName: "トイ・プードル (ホワイト)",
    breed: "トイプードル",
    breedEn: "Toy Poodle",
    gender: "female",
    birthDate: "2026-06-25",
    currentAgeDays: 72,
    color: "ホワイト",
    price: 330000,
    priceNote: "生体代・血統書込",
    status: "available",
    freshnessStatus: "yellow", // イエローマーク点灯！
    freshnessLabel: "⚠️ 写真更新アラート（生後60日データ未登録）",
    freshnessReason: "生後72日経過していますが、掲載写真と体重が生後35日（37日前）のままです。最新情報の確認をおすすめします。",
    predictedSizeCategory: "推定タイニー〜トイ",
    predictedWeightRange: "2.5kg 〜 3.2kg",
    confidenceRate: 60,
    kennelName: "スノーホワイト犬舎",
    breederName: "高橋 誠 (第一種動物取扱業 第19-0129号)",
    prefecture: "埼玉県",
    location: "川越市",
    description: "真っ白で毛並みの美しい女の子。離乳食も順調です。（※現在生後72日ですが、最新写真・生後60日体重が更新待ち状態です。下のボタンから1タップでブリーダーへ最新写真更新をリクエストできます）",
    lifestyle: {
      apartmentOk: true,
      leavingAloneOk: false,
      sheddingMin: true,
      beginnerOk: true,
      goodWithKids: true
    },
    health: {
      praClear: true,
      dmClear: true,
      vwd1Clear: true,
      geneticLab: "カズーDNA研究所",
      geneticCertNumber: "KZ-2026-TP003",
      geneticTestDate: "2026-07-28",
      geneticStatus: "3項目全クリア (発症リスクなし) ✅",
      patellaGrade: "Grade 0 (正常)",
      veterinaryCheck: "生後30日検診済 (All-A)"
    },
    parents: {
      father: {
        breed: "トイプードル (ホワイト 2.8kg)",
        title: "優良血統",
        photo: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "KZ-2024-TP109"
      },
      mother: {
        breed: "トイプードル (ホワイト 3.0kg)",
        title: "優しい性格",
        photo: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア (原本確認済) ✅",
        geneticCertNumber: "KZ-2025-TP552"
      }
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=1200&q=85",
        caption: "生後35日の写真（※現在生後72日・写真更新リクエスト推奨⚠️）",
        tag: "生後35日（37日前撮影）⚠️"
      },
      {
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85",
        caption: "出生時の写真",
        tag: "生後0日"
      }
    ],
    milestones: [
      {
        type: "birth_day0",
        label: "出生時 (生後0日)",
        days: 0,
        date: "2026-06-25",
        weightG: 140,
        targetPredictedKg: "2.5〜3.0kg",
        photo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
        scalePhoto: false,
        memo: "元気に出生"
      },
      {
        type: "day35",
        label: "離乳期 (生後35日)",
        days: 35,
        date: "2026-07-30",
        weightG: 560,
        targetPredictedKg: "2.6〜3.1kg",
        photo: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "ここから写真・体重が未更新です"
      },
      {
        type: "day60",
        label: "2ヶ月 (生後60日)",
        days: 60,
        date: "2026-08-24 (未登録⚠️)",
        weightG: null,
        targetPredictedKg: "未確定 (写真リクエスト受付中)",
        photo: null,
        scalePhoto: false,
        memo: "⚠️ 生後65日を超えて未登録のためイエローマーク警告中"
      }
    ],
    tags: ["#イエローマーク警告⚠️", "#写真リクエスト対象", "#トイプードル", "#白プー", "#マンション向け"]
  },
  {
    id: "dog-004",
    listingType: "puppy_sale",
    temporaryName: "小太郎くん",
    registeredName: "豆柴 (赤毛・日本犬保存会認定)",
    breed: "柴犬 (豆柴)",
    breedEn: "Mame Shiba",
    gender: "male",
    birthDate: "2026-07-07",
    currentAgeDays: 60,
    color: "赤",
    price: 360000,
    priceNote: "豆柴認定書・血統書・マイクロチップ代込",
    status: "available",
    freshnessStatus: "green",
    freshnessLabel: "最新写真確認済 (生後60日)",
    predictedSizeCategory: "豆柴認定サイズ確定",
    predictedWeightRange: "4.8kg 〜 5.3kg (標準柴犬の約半分)",
    confidenceRate: 99,
    kennelName: "信州美柴荘",
    breederName: "小林 義男 (第一種動物取扱業 長野県第21-008号)",
    prefecture: "長野県",
    location: "松本市",
    description: "両親ともに3代祖まで豆柴認定基準（体高34cm以下）を完全クリアした血統証明つき。生後60日実測体重1,250gで、成犬時5kg前後の理想的な豆柴体型に成長中。キリッとした顔立ちと巻き尾が自慢です。",
    lifestyle: {
      apartmentOk: true,
      leavingAloneOk: true,
      sheddingMin: false, // 換毛期あり
      beginnerOk: true,
      goodWithKids: true
    },
    health: {
      praClear: true,
      dmClear: true,
      patellaGrade: "Grade 0 (正常)",
      veterinaryCheck: "All-A (股関節・心臓異常なし)"
    },
    parents: {
      father: {
        breed: "豆柴 (赤 5.0kg / 体高31cm)",
        title: "日本犬保存会 優良犬",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        geneticTest: "全クリア"
      },
      mother: {
        breed: "豆柴 (赤 4.6kg / 体高30cm)",
        title: "豆柴認定犬",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        geneticTest: "全クリア"
      }
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=1200&q=85",
        caption: "生後60日 キリッとした立ち姿と豆柴特有の三角耳",
        tag: "生後60日・最新"
      },
      {
        url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=1200&q=85",
        caption: "生後60日 体重計1,250gの表示シーン",
        tag: "体重計実測証憑"
      },
      {
        url: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=1200&q=85",
        caption: "ドッグランでのびのび走り回る様子",
        tag: "運動・活発性"
      }
    ],
    milestones: [
      {
        type: "birth_day0",
        label: "出生時 (生後0日)",
        days: 0,
        date: "2026-07-07",
        weightG: 160,
        targetPredictedKg: "4.8〜5.2kg",
        photo: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "骨太で健康"
      },
      {
        type: "day35",
        label: "離乳期 (生後35日)",
        days: 35,
        date: "2026-08-11",
        weightG: 720,
        targetPredictedKg: "4.9〜5.3kg",
        photo: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "食欲旺盛。トイレトレーニング開始"
      },
      {
        type: "day60",
        label: "2ヶ月 (生後60日)",
        days: 60,
        date: "2026-09-05",
        weightG: 1250,
        targetPredictedKg: "4.8〜5.2kg (確定)",
        photo: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "生後60日体重1,250g×4.0=5.0kg。豆柴標準サイズ確定"
      }
    ],
    tags: ["#最新写真確認済🟢", "#豆柴認定サイズ確定", "#生後60日写真あり", "#両親豆柴認定", "#日本犬保存会", "#総額コミコミ表示"]
  },
  {
    id: "dog-005",
    listingType: "breeder_retired", // ブリーダー引退犬 (セカンドライフ里親枠)
    temporaryName: "マロンくん (セカンドライフ)",
    registeredName: "トイ・プードル (ブラウン・5歳)",
    breed: "トイプードル",
    breedEn: "Toy Poodle",
    gender: "male",
    birthDate: "2021-04-10",
    currentAgeDays: 1974,
    color: "ブラウン",
    price: 33000,
    priceNote: "譲渡実費（去勢手術・今年度混合ワクチン・健康診断実費）のみ",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    receiptDetails: [
      { item: "去勢手術費用 (麻酔・入院込)", cost: 22000 },
      { item: "混合8種ワクチン接種", cost: 6600 },
      { item: "血液検査・フィラリア検査", cost: 4400 }
    ],
    status: "available",
    freshnessStatus: "green",
    freshnessLabel: "引退犬・獣医師定期健診済",
    predictedSizeCategory: "成犬サイズ確定 (2.7kg)",
    predictedWeightRange: "2.7kg (安定)",
    confidenceRate: 100,
    kennelName: "千住プードル犬舎",
    breederName: "森本 和夫 (千住プードル犬舎 直営育成モデル)",
    prefecture: "東京都",
    location: "足立区千住",
    description: "ブリーダー犬舎で種親として活躍し、5歳で引退を迎えた男の子です。犬舎のリビングで人と暮らしていたため、トイレ成功率98%・無駄吠えなし・甘えん坊で完璧なしつけが入っています。一般家庭で愛される第二の犬生（セカンドライフ）を過ごさせてくださる温かい里親様を募集します。",
    lifestyle: {
      apartmentOk: true,
      leavingAloneOk: true,
      sheddingMin: true,
      beginnerOk: true,
      goodWithKids: true
    },
    health: {
      praClear: true,
      dmClear: true,
      vwd1Clear: true,
      geneticLab: "VEQTA (動物遺伝子検査研究所)",
      geneticCertNumber: "VQ-2021-MR005",
      geneticTestDate: "2026-08-20",
      geneticStatus: "本犬DNA検査 3項目全クリア (発症リスクなし) ✅",
      patellaGrade: "Grade 0 (正常)",
      veterinaryCheck: "去勢済・血液検査/心電図All-A (2026-08健康診断書添付)"
    },
    parents: {
      isRescueDirectDna: true,
      note: "ブリーダー引退犬（種親在籍時検査済＋引退時WanBridge公認DNA直接検体検査クリア）",
      father: {
        breed: "トイプードル (2.5kg)",
        title: "血統認定優良種親 (遺伝病クリア系統)",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2019-PP01"
      },
      mother: {
        breed: "トイプードル (2.8kg)",
        title: "血統認定優良繁殖親 (遺伝病クリア系統)",
        photo: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2019-MM02"
      }
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=85",
        caption: "穏やかで優しい表情のマロンくん（5歳・成犬）",
        tag: "最新近影"
      },
      {
        url: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=1200&q=85",
        caption: "トリミングサロンでカット後の様子（毛艶良好）",
        tag: "トリミング後"
      },
      {
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
        caption: "動物病院の医療費領収書（去勢・ワクチン・血液検査 明朗開示）",
        tag: "明朗領収書証憑"
      }
    ],
    milestones: [
      {
        type: "adult",
        label: "成犬時現在体重",
        days: 1974,
        date: "2026-08-20",
        weightG: 2700,
        targetPredictedKg: "2.7kg (安定確定)",
        photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "理想的な体型スコア(BCS 3/5)。健康状態極めて良好"
      }
    ],
    seniorCompatibility: {
      isSeniorRecommended: true,
      seniorRank: "S",
      pullingScore: 1,
      barkingScore: 1,
      dailyWalkMinutes: 15,
      cuddlePreference: "抱っこ・膝の上が大好きで穏やか",
      summary: "足腰への負担ゼロ。人の歩調に合わせてゆっくり歩くため、ご高齢者の一人暮らしやお散歩に最適です。",
      lifelongGuarantee: {
        certNumber: "WB-SENIOR-G-005",
        status: "100%終生引き取り保証書付帯 ✅",
        shelterHub: "WanBridge千住古民家拠点シェルター受入確約",
        emergencyCard: "救急搬送時SOS冷蔵庫マグネット付属",
        lineCheckinSupport: true
      }
    },
    tags: ["#ブリーダー公式引退犬", "#セカンドライフ里親", "#シニア高齢者安心Sランク", "#引っ張りゼロ", "#終生引き取り保証付", "#しつけ完了済", "#トイレ成功率98%", "#無駄吠えゼロ", "#医療費実費のみ", "#エスクロー決済対応"]
  },
  {
    id: "dog-006",
    listingType: "rescue_org", // 認定保護団体枠
    temporaryName: "ハナちゃん",
    registeredName: "MIX (中型・推定2歳)",
    breed: "MIX (雑種)",
    breedEn: "Mixed Breed",
    gender: "female",
    birthDate: "2024-09-01",
    currentAgeDays: 735,
    color: "クリーム＆ホワイト",
    price: 38500,
    priceNote: "譲渡実費（避妊手術・狂犬病・マイクロチップ登録・混合ワクチン実費）",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    receiptDetails: [
      { item: "不妊避妊手術費用 (術前検査込)", cost: 25000 },
      { item: "狂犬病予防注射・畜犬登録", cost: 3500 },
      { item: "混合ワクチン＋マイクロチップ装着", cost: 10000 }
    ],
    status: "available",
    freshnessStatus: "green",
    freshnessLabel: "認定保護団体・健康管理済",
    predictedSizeCategory: "中型犬 (約11kg)",
    predictedWeightRange: "11.2kg (適正体重)",
    confidenceRate: 100,
    kennelName: "NPO法人ピースドッグ保護シェルター",
    breederName: "代表: 山田 友香 (認定愛護団体)",
    prefecture: "神奈川県",
    location: "横浜市青葉区",
    description: "多頭飼育崩壊からレスキューされた優しい女の子。最初は少し人見知りしますが、3日ほどでスリスリと甘えてきます。お散歩も引っ張らずアイコンタクトをしっかり取れます。先住犬とも穏やかに過ごせます。",
    lifestyle: {
      apartmentOk: false, // 庭付き・戸建て推奨
      leavingAloneOk: true,
      sheddingMin: false,
      beginnerOk: false,
      goodWithKids: true
    },
    health: {
      praClear: true,
      dmClear: true,
      vwd1Clear: true,
      geneticLab: "WanBridge公認シェルター提携ラボ",
      geneticCertNumber: "WB-RESCUE-006",
      geneticTestDate: "2026-08-25",
      geneticStatus: "本犬DNA直接検体検査 3項目全クリア ✅",
      patellaGrade: "Grade 0 (正常)",
      veterinaryCheck: "避妊済・フィラリア陰性・血液検査正常"
    },
    parents: {
      isRescueDirectDna: true,
      note: "保護団体受入時・WanBridge公認DNA直接検体遺伝子検査実施済（発症リスクなし）",
      father: {
        breed: "MIX (中型)",
        title: "保護記録登録",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        geneticTest: "本犬検体にて遺伝病リスク排除確認済 ✅",
        geneticCertNumber: "WB-2024-F99"
      },
      mother: {
        breed: "MIX (中型)",
        title: "保護記録登録",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        geneticTest: "本犬検体にて遺伝病リスク排除確認済 ✅",
        geneticCertNumber: "WB-2024-M99"
      }
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1200&q=85",
        caption: "穏やかな笑顔を見せるハナちゃん（推定2歳）",
        tag: "最新近影"
      },
      {
        url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85",
        caption: "保護シェルターのドッグランでスタッフと触れ合う様子",
        tag: "社会化トレーニング"
      },
      {
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
        caption: "動物病院の避妊・ワクチン費用領収書（病院印捺印済）",
        tag: "明朗領収書証憑"
      }
    ],
    milestones: [
      {
        type: "adult",
        label: "保護時および現在体重",
        days: 735,
        date: "2026-08-15",
        weightG: 11200,
        targetPredictedKg: "11.2kg (適正体型)",
        photo: "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "栄養状態回復。毛並み良好"
      }
    ],
    seniorCompatibility: {
      isSeniorRecommended: true,
      seniorRank: "A",
      pullingScore: 2,
      barkingScore: 1,
      dailyWalkMinutes: 30,
      cuddlePreference: "寄り添い・スキンシップが大好き",
      summary: "シェルターで引っ張り防止訓練完了。中型犬の飼育経験があるアクティブな60代〜70代前半のシニア世帯に最適です。",
      lifelongGuarantee: {
        certNumber: "WB-SENIOR-G-006",
        status: "100%終生引き取り保証書付帯 ✅",
        shelterHub: "NPOピースドッグシェルター・WanBridge共同受入確約",
        emergencyCard: "救急搬送時SOS冷蔵庫マグネット付属",
        lineCheckinSupport: true
      }
    },
    tags: ["#認定保護団体枠", "#保護犬里親募集", "#シニア向けAランク", "#終生引き取り保証付", "#避妊手術済", "#マイクロチップ装着済", "#実費領収書明開示", "#eKYC本人確認対象", "#エスクロー決済対応"]
  },
  {
    id: "dog-007",
    listingType: "puppy_sale",
    temporaryName: "ルナちゃん",
    registeredName: "チワワ (ロングコート・ブラックタン)",
    breed: "チワワ",
    breedEn: "Chihuahua",
    gender: "female",
    birthDate: "2026-07-09",
    currentAgeDays: 58,
    color: "ブラックタン＆ホワイト",
    price: 396000,
    priceNote: "コミコミ総額表示 (血統書・検診代・生体保証込)",
    status: "available",
    freshnessStatus: "green",
    freshnessLabel: "最新写真確認済 (生後58日)",
    predictedSizeCategory: "極小サイズ確定級",
    predictedWeightRange: "1.6kg 〜 1.9kg",
    confidenceRate: 98,
    kennelName: "プチアンジュ南青山",
    breederName: "森下 美穂 (第一種動物取扱業 第20-0019号)",
    prefecture: "東京都",
    location: "港区",
    description: "アップルヘッドが美しく、目がクリクリの極小チワワちゃん。生後58日時点で650g。離乳食もモリモリ食べており、手のひらにすっぽり収まるサイズ感です。マンション住まいの一人暮らしの方にもおすすめです。",
    lifestyle: {
      apartmentOk: true,
      leavingAloneOk: true,
      sheddingMin: false,
      beginnerOk: true,
      goodWithKids: false // 極小のため乳幼児家庭は要相談
    },
    health: {
      praClear: true,
      dmClear: true,
      patellaGrade: "Grade 0",
      veterinaryCheck: "All-A (ペコなし・泉門閉鎖確認済)"
    },
    parents: {
      father: {
        breed: "チワワ (ブラックタン 1.6kg)",
        title: "JKCチャンピオン直子",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        geneticTest: "全クリア"
      },
      mother: {
        breed: "チワワ (チョコタン 1.8kg)",
        title: "自家繁殖・温厚",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        geneticTest: "全クリア"
      }
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=85",
        caption: "生後58日 手のひらサイズのお人形さんのような立ち姿",
        tag: "生後58日・最新"
      },
      {
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85",
        caption: "生後58日 体重計650gの実測記録",
        tag: "体重計実測証憑"
      },
      {
        url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1200&q=85",
        caption: "母犬と寄り添う離乳期写真",
        tag: "生後35日マイルストーン"
      }
    ],
    milestones: [
      {
        type: "birth_day0",
        label: "出生時 (生後0日)",
        days: 0,
        date: "2026-07-09",
        weightG: 98,
        targetPredictedKg: "1.5〜1.8kg",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "極小サイズで誕生"
      },
      {
        type: "day35",
        label: "離乳期 (生後35日)",
        days: 35,
        date: "2026-08-13",
        weightG: 390,
        targetPredictedKg: "1.6〜1.9kg",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "自力採食確認"
      },
      {
        type: "day60",
        label: "2ヶ月 (生後58日)",
        days: 58,
        date: "2026-09-05",
        weightG: 650,
        targetPredictedKg: "1.6〜1.9kg (確定)",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "生後58日体重650g。極小サイズ確定"
      }
    ],
    tags: ["#最新写真確認済🟢", "#極小サイズ確定級", "#生後60日写真あり", "#JKC血統", "#マンション向け", "#総額コミコミ表示"]
  },
  {
    id: "dog-008",
    listingType: "puppy_sale",
    temporaryName: "チョコくん",
    registeredName: "ポメラニアン (オレンジ)",
    breed: "ポメラニアン",
    breedEn: "Pomeranian",
    gender: "male",
    birthDate: "2026-07-15",
    currentAgeDays: 52,
    color: "オレンジ",
    price: 374000,
    priceNote: "コミコミ総額表示 (血統書・マイクロチップ・生体保証1年込)",
    status: "available",
    freshnessStatus: "green",
    freshnessLabel: "最新写真確認済 (生後50日)",
    predictedSizeCategory: "標準ポメラニアンサイズ",
    predictedWeightRange: "2.3kg 〜 2.7kg",
    confidenceRate: 95,
    kennelName: "フラワーポメラニアン犬舎",
    breederName: "斉藤 恵美子 (第一種動物取扱業 千葉県第23-010号)",
    prefecture: "千葉県",
    location: "柏市",
    description: "綿菓子のようにまん丸で毛量抜群の男の子！足が短くタヌキ顔の愛らしいフォルムです。性格は天真爛漫で、呼ぶとしっぽを振って全力で駆け寄ってきます。",
    lifestyle: {
      apartmentOk: true,
      leavingAloneOk: false,
      sheddingMin: false,
      beginnerOk: true,
      goodWithKids: true
    },
    health: {
      praClear: true,
      dmClear: true,
      patellaGrade: "Grade 0",
      veterinaryCheck: "All-A (ペコ・ヘルニアなし)"
    },
    parents: {
      father: {
        breed: "ポメラニアン (オレンジ 2.2kg)",
        title: "良血統",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        geneticTest: "全クリア"
      },
      mother: {
        breed: "ポメラニアン (セーブル 2.5kg)",
        title: "自家繁殖",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        geneticTest: "全クリア"
      }
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=85",
        caption: "生後50日 まん丸フサフサのタヌキ顔ポメラニアン",
        tag: "生後50日・最新"
      },
      {
        url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1200&q=85",
        caption: "生後50日 デジタル体重計 (780g)",
        tag: "体重計実測証憑"
      }
    ],
    milestones: [
      {
        type: "birth_day0",
        label: "出生時 (生後0日)",
        days: 0,
        date: "2026-07-15",
        weightG: 120,
        targetPredictedKg: "2.3〜2.6kg",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "丸々と健康に誕生"
      },
      {
        type: "day35",
        label: "離乳期 (生後35日)",
        days: 35,
        date: "2026-08-19",
        weightG: 480,
        targetPredictedKg: "2.3〜2.7kg",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "ふやかしフード完食"
      }
    ],
    tags: ["#最新写真確認済🟢", "#ポメラニアン", "#毛量抜群", "#タヌキ顔", "#マンション向け", "#総額コミコミ表示"]
  },
  {
    id: "dog-009",
    listingType: "breeder_retired", // ブリーダー引退犬
    temporaryName: "小春（こはる）ちゃん",
    registeredName: "柴犬 (赤柴・8歳)",
    breed: "柴犬",
    breedEn: "Shiba Inu",
    gender: "female",
    birthDate: "2018-05-10",
    currentAgeDays: 3045, // 約8歳4ヶ月
    color: "赤",
    price: 45000,
    priceNote: "譲渡実費（避妊手術・歯石スケーリング・血液検査・ワクチン済）",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    receiptDetails: [
      { item: "避妊手術＋術前総合血液検査", cost: 28000 },
      { item: "歯石除去スケーリング (口臭ゼロ処置)", cost: 12000 },
      { item: "混合ワクチン＋狂犬病予防注射", cost: 5000 }
    ],
    status: "available",
    freshnessStatus: "green",
    freshnessLabel: "引退時・総合健康ドック完了",
    predictedSizeCategory: "成犬確定 (8.2kg)",
    predictedWeightRange: "8.2kg (体型BCS 3/5 理想)",
    confidenceRate: 100,
    kennelName: "信州美鈴荘（天然記念物柴犬保存会認定）",
    breederName: "望月 義雄 (第一種動物取扱業 長野県第21-0088号)",
    prefecture: "長野県",
    location: "松本市",
    description: "8年間大切に愛育され、引退した心優しい赤柴の女の子。人への信頼感抜群で、初対面でもしっぽを振って微笑んでくれます。リードの引っ張り癖が全くなく、人の歩調に合わせてゆっくり歩くため、足腰に不安のあるシニアの飼い主様のお散歩に最高のお供となります。無駄吠え・夜鳴きも一切ありません。",
    lifestyle: {
      apartmentOk: true,
      leavingAloneOk: true,
      sheddingMin: false, // 換毛期あり
      beginnerOk: true,
      goodWithKids: true
    },
    health: {
      praClear: true,
      dmClear: true,
      vwd1Clear: true,
      geneticLab: "VEQTA (動物遺伝子検査研究所)",
      geneticCertNumber: "VQ-2018-SH009",
      geneticTestDate: "2026-08-10",
      geneticStatus: "本犬DNA検査 3項目全クリア (発症リスクなし) ✅",
      patellaGrade: "Grade 0 (正常)",
      veterinaryCheck: "避妊済・スケーリング済・心電図All-A (WanBridge提携獣医師 署名済)"
    },
    parents: {
      isRescueDirectDna: true,
      note: "ブリーダー引退犬（種親在籍時検査済＋引退時WanBridge公認DNA直接検体検査クリア）",
      father: {
        breed: "柴犬 (赤柴 9.0kg)",
        title: "柴保本部賞受賞血統",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2016-SH01"
      },
      mother: {
        breed: "柴犬 (赤柴 8.0kg)",
        title: "優良繁殖母犬",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2016-SH02"
      }
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85",
        caption: "穏やかで優しい笑顔の小春ちゃん（8歳・成犬柴犬）",
        tag: "最新近影"
      },
      {
        url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=85",
        caption: "引っ張らず人の隣をゆっくり歩くお散歩風景",
        tag: "安心歩行実証"
      }
    ],
    milestones: [
      {
        type: "adult",
        label: "現在確定体重",
        days: 3045,
        date: "2026-08-25",
        weightG: 8200,
        targetPredictedKg: "8.2kg (適正維持)",
        photo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "毛艶・関節ともに良好。シニア用低脂肪フード完食"
      }
    ],
    seniorCompatibility: {
      isSeniorRecommended: true,
      seniorRank: "S",
      pullingScore: 1, // 引っ張りゼロ
      barkingScore: 1, // 無駄吠えゼロ
      dailyWalkMinutes: 20, // 20分ゆったり歩行
      cuddlePreference: "穏やかに寄り添い、撫でられるのが好き",
      summary: "引っ張り癖が全くなく歩行同調性が完璧。65〜85歳のご高齢者が転倒リスクなく安心して日課のお散歩を楽しめます。",
      lifelongGuarantee: {
        certNumber: "WB-SENIOR-G-009",
        status: "100%終生引き取り保証書付帯 ✅",
        shelterHub: "WanBridge千住古民家拠点シェルター受入確約",
        emergencyCard: "救急搬送時SOS冷蔵庫マグネット付属",
        lineCheckinSupport: true
      }
    },
    tags: ["#ブリーダー公式引退犬", "#柴犬シニア", "#シニア高齢者安心Sランク", "#引っ張りゼロ", "#終生引き取り保証付", "#無駄吠えゼロ", "#歯石スケーリング済", "#エスクロー決済対応"]
  },
  {
    id: "dog-010",
    listingType: "rescue_org", // 飼い主高齢施設入所に伴う保護犬枠
    temporaryName: "大吉（だいきち）くん",
    registeredName: "シーズー (ホワイト＆ゴールド・9歳)",
    breed: "シーズー",
    breedEn: "Shih Tzu",
    gender: "male",
    birthDate: "2017-04-15",
    currentAgeDays: 3435, // 約9歳5ヶ月
    color: "ホワイト＆ゴールド",
    price: 33000,
    priceNote: "譲渡実費（去勢済・血液生化学検査・マイクロチップ名義変更実費）",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    receiptDetails: [
      { item: "シニア健康診断（血液検査・レントゲン・エコー）", cost: 20000 },
      { item: "混合ワクチン＋ノミダニ予防", cost: 8000 },
      { item: "マイクロチップ環境省登録変更手数料", cost: 5000 }
    ],
    status: "available",
    freshnessStatus: "green",
    freshnessLabel: "認定保護団体・シニア健診済",
    predictedSizeCategory: "成犬確定 (4.8kg)",
    predictedWeightRange: "4.8kg (適正体型)",
    confidenceRate: 100,
    kennelName: "一般社団法人シニアドッグレスキュー東京",
    breederName: "代表: 高橋 雅子 (高齢者・シニア犬共生支援推進員)",
    prefecture: "東京都",
    location: "足立区千住",
    description: "前飼い主様の老人ホーム入所に伴い、WanBridge千住古民家サテライト拠点へ円満受入されたおじいちゃんシーズー。とにかく温厚で、膝の上で丸くなって眠るのが一番の幸せ。お散歩は1日10分程度トコトコ歩くだけで満足。夜鳴きや要求吠えは一切なく、室内で静かに寄り添ってくれます。",
    lifestyle: {
      apartmentOk: true,
      leavingAloneOk: true,
      sheddingMin: true, // 抜け毛少なめ
      beginnerOk: true,
      goodWithKids: true
    },
    health: {
      praClear: true,
      dmClear: true,
      vwd1Clear: true,
      geneticLab: "VEQTA (動物遺伝子検査研究所)",
      geneticCertNumber: "VQ-2017-ST010",
      geneticTestDate: "2026-08-18",
      geneticStatus: "本犬DNA検査 3項目全クリア (発症リスクなし) ✅",
      patellaGrade: "Grade 0 (正常)",
      veterinaryCheck: "去勢済・心雑音なし・血液検査良好 (WanBridge千住動物医療提携検診済)"
    },
    parents: {
      isRescueDirectDna: true,
      note: "保護犬（受入時WanBridge公認DNA直接検体遺伝子検査実施済・3大疾患クリア確定）",
      father: {
        breed: "シーズー (5.0kg)",
        title: "JKC血統系統",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2015-ST01"
      },
      mother: {
        breed: "シーズー (4.5kg)",
        title: "家庭飼育系統",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
        geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
        geneticCertNumber: "VQ-2015-ST02"
      }
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85",
        caption: "穏やかでおっとりした大吉くん（9歳・シーズー）",
        tag: "最新近影"
      },
      {
        url: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=1200&q=85",
        caption: "千住古民家の畳の上でまったり日向ぼっこする様子",
        tag: "室内穏やか風景"
      }
    ],
    milestones: [
      {
        type: "adult",
        label: "現在確定体重",
        days: 3435,
        date: "2026-08-20",
        weightG: 4800,
        targetPredictedKg: "4.8kg (適正維持)",
        photo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
        scalePhoto: true,
        memo: "食欲旺盛。ドライフードを完食"
      }
    ],
    seniorCompatibility: {
      isSeniorRecommended: true,
      seniorRank: "S",
      pullingScore: 1, // 引っ張りゼロ
      barkingScore: 1, // 無駄吠えゼロ
      dailyWalkMinutes: 10, // 10分のお散歩で大満足
      cuddlePreference: "膝の上・抱っこが一番好き（超甘えん坊）",
      summary: "完全室内飼養・膝乗り犬。散歩は短時間でOK、無駄吠えゼロ。70〜80代のシニア単身・ご夫婦世帯に一番おすすめの子です。",
      lifelongGuarantee: {
        certNumber: "WB-SENIOR-G-010",
        status: "100%終生引き取り保証書付帯 ✅",
        shelterHub: "WanBridge千住古民家拠点シェルター受入確約",
        emergencyCard: "救急搬送時SOS冷蔵庫マグネット付属",
        lineCheckinSupport: true
      }
    },
    tags: ["#認定保護団体枠", "#シーズーシニア", "#シニア高齢者安心Sランク", "#抱っこ大好き", "#終生引き取り保証付", "#引っ張りゼロ", "#無駄吠えゼロ", "#千住古民家受入犬", "#エスクロー決済対応"]
  }
];

// ==================== 認定ブリーダー・保護団体マスター ====================
export const INITIAL_BREEDERS = [
  {
    id: "b-01",
    kennelName: "千住プードル犬舎",
    ownerName: "森本 和夫",
    licenseNumber: "東京都 第一種動物取扱業 登録準備中（千住拠点）",
    prefecture: "東京都",
    location: "足立区千住",
    established: "2026年 (WanBridge直営モデル犬舎)",
    specialty: "タイニープードル専門 (Finished Dog育成)",
    policy: "家庭的な室内環境でのお留守番・トイレしつけ完了（Finished Dog）と全頭遺伝子検査原本開示。4大マイルストーン実測体重ログを徹底しています。",
    imageUrl: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80",
    dogIds: ["dog-001", "dog-002"],
    badge: "⭐️ 第1号認定プラチナ犬舎"
  },
  {
    id: "b-02",
    kennelName: "【モデルサンプル】スノーホワイト犬舎",
    ownerName: "高橋 誠 (提携候補サンプル)",
    licenseNumber: "埼玉県 (※掲載モデルサンプル)",
    prefecture: "埼玉県",
    location: "川越市",
    established: "2011年 (ブリーダー歴15年想定)",
    specialty: "ホワイトプードル・マルチーズ専門",
    policy: "白毛種の涙やけケアと骨格形成にこだわり、広い運動場で毎日ドッグラン運動を実施しています。",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
    dogIds: ["dog-003"],
    badge: "優良認定ブリーダー（審査基準モデル）"
  },
  {
    id: "b-03",
    kennelName: "【モデルサンプル】信州美柴荘",
    ownerName: "小林 義男 (提携候補サンプル)",
    licenseNumber: "長野県 (※掲載モデルサンプル)",
    prefecture: "長野県",
    location: "松本市",
    established: "1996年 (柴犬保存会想定)",
    specialty: "極小豆柴・天然記念物柴犬専門",
    policy: "長野の清涼な空気と豊かな自然で育てる本物の豆柴。生後90日まで母犬と兄弟で過ごし社会化を完璧に仕上げます。",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    dogIds: ["dog-004"],
    badge: "伝統血統認定犬舎（審査基準モデル）"
  },
  {
    id: "b-04",
    kennelName: "【モデルサンプル】ピースドッグ保護シェルター",
    ownerName: "代表: 山田 (提携候補サンプル)",
    licenseNumber: "公認保護団体 (※掲載モデルサンプル)",
    prefecture: "神奈川県",
    location: "横浜市青葉区",
    established: "2016年 (保護活動10年想定)",
    specialty: "繁殖引退犬・保護犬セカンドライフ",
    policy: "役目を終えた繁殖犬や保護犬に最高の第2の犬生を。提携獣医師によるメディカルチェックとトイレ再トレーニングを完了してお繋ぎします。",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
    dogIds: ["dog-005", "dog-006"],
    badge: "公認保護団体（審査基準モデル）"
  },
  {
    id: "b-05",
    kennelName: "【モデルサンプル】プチアンジュ南青山",
    ownerName: "森下 (提携候補サンプル)",
    licenseNumber: "東京都 (※掲載モデルサンプル)",
    prefecture: "東京都",
    location: "港区南青山",
    established: "2014年 (ブリーダー歴12年想定)",
    specialty: "ミニチュアダックスフンド専門",
    policy: "胴長短足犬種特有の椎間板ヘルニア予防のため、低床施設・滑り止めフローリングで徹底管理しています。",
    imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80",
    dogIds: ["dog-007"],
    badge: "優良認定ブリーダー（審査基準モデル）"
  },
  {
    id: "b-06",
    kennelName: "【モデルサンプル】フラワーポメラニアン犬舎",
    ownerName: "斉藤 (提携候補サンプル)",
    licenseNumber: "千葉県 (※掲載モデルサンプル)",
    prefecture: "千葉県",
    location: "柏市",
    established: "2008年 (ブリーダー歴18年想定)",
    specialty: "タヌキ顔ポメラニアン専門",
    policy: "豊かな毛量とマズルの詰まった可愛いお顔立ち。膝関節（パテラ）チェックをクリアした健康な親犬のみをブリーディング。",
    imageUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80",
    dogIds: ["dog-008"],
    badge: "優良認定ブリーダー（審査基準モデル）"
  }
];

// ==================== 全国提携サテライト拠点マスター ====================
export const SATELLITE_HUBS = [
  {
    id: "hub-tokyo-senju",
    name: "東京・千住古民家直営フラッグシップ（WanTea）",
    region: "関東・直営",
    address: "東京都足立区千住（北千住駅徒歩7分）",
    access: "JR常磐線・日比谷線・千代田線 北千住駅 西口 徒歩7分",
    openingHours: "11:00 〜 19:00 (月火定休)",
    features: ["直営ドッグカフェ併設", "愛玩動物看護師常駐", "個室ふれあいルーム", "お迎えグッズ展示販売"],
    phone: "03-3888-XXXX",
    isOpen: true,
    statusText: "✅ 直営・見学受付中"
  },
  {
    id: "hub-osaka-umeda",
    name: "大阪・梅田サテライトハブ",
    region: "関西",
    address: "大阪府大阪市北区梅田（提携候補地）",
    access: "JR大阪駅 桜橋口 徒歩5分 / 西梅田駅 徒歩3分",
    openingHours: "開設準備中 (パートナー募集中)",
    features: ["個室見学ルーム予定", "提携動物病院連携", "関西全域送迎サポート"],
    phone: "開設準備中",
    isOpen: false,
    statusText: "🚧 順次拡大予定（準備中）"
  },
  {
    id: "hub-nagoya-sakae",
    name: "名古屋・栄サテライトハブ",
    region: "中部",
    address: "愛知県名古屋市中区栄（提携候補地）",
    access: "地下鉄東山線 栄駅 16番出口 徒歩4分",
    openingHours: "開設準備中 (パートナー募集中)",
    features: ["広々ドッグランテラス予定", "獣医師健康相談窓口", "駐車場完備予定"],
    phone: "開設準備中",
    isOpen: false,
    statusText: "🚧 順次拡大予定（準備中）"
  },
  {
    id: "hub-fukuoka-tenjin",
    name: "福岡・天神サテライトハブ",
    region: "九州",
    address: "福岡県福岡市中央区天神（提携候補地）",
    access: "西鉄福岡(天神)駅 北口 徒歩3分",
    openingHours: "開設準備中 (パートナー募集中)",
    features: ["九州全域ブリーダー中継ハブ", "個室面談ルーム予定", "空港送迎手配予定"],
    phone: "開設準備中",
    isOpen: false,
    statusText: "🚧 順次拡大予定（準備中）"
  },
  {
    id: "hub-sapporo-odori",
    name: "札幌・大通サテライトハブ",
    region: "北海道",
    address: "北海道札幌市中央区大通（提携候補地）",
    access: "地下鉄大通駅 4番出口 徒歩1分",
    openingHours: "開設準備中 (パートナー募集中)",
    features: ["寒冷地対策・室内空調管理", "道内遠方ブリーダー対面拠点予定"],
    phone: "開設準備中",
    isOpen: false,
    statusText: "🚧 順次拡大予定（準備中）"
  },
  {
    id: "hub-tokyo-aoyama",
    name: "東京・南青山サテライトハブ",
    region: "関東",
    address: "東京都港区南青山（提携候補地）",
    access: "表参道駅 A4出口 徒歩3分",
    openingHours: "開設準備中 (パートナー募集中)",
    features: ["個室見学ルーム完備予定", "動物病院併設予定", "お迎えグッズ販売予定"],
    phone: "開設準備中",
    isOpen: false,
    statusText: "🚧 順次拡大予定（準備中）"
  }
];

// ==================== 初めての方へ（お迎えガイド）マスター ====================
export const GUIDE_STEPS = [
  {
    step: "01",
    title: "実測体重と写真鮮度で子犬・里親犬を探す",
    description: "WanBridgeでは、出生時・生後35日・60日・90日のデジタル体重計実測ログを公開。更新が古い子にはイエローマーク⚠️が点灯するため、サイズ偽装や写真放置に騙されません。",
    icon: "⚖️"
  },
  {
    step: "02",
    title: "無料の見学予約 または オンライン相談",
    description: "気になるワンちゃんが見つかったら、Webから1タップで見学予約・オンライン相談を申し込み。専任スタッフとブリーダーが日程を迅速に調整します。",
    icon: "📅"
  },
  {
    step: "03",
    title: "獣医師健康診断書（All-A）と遺伝病結果を確認",
    description: "引き渡し前に、提携獣医師による総合健康診断書（心音・咬合・ヘルニア・パテラ等）と、進行性網膜萎縮症（PRA）などの遺伝子検査クリア証明をご確認いただけます。",
    icon: "🩺"
  },
  {
    step: "04",
    title: "全国サテライト拠点 または 犬舎でお迎え・対面説明",
    description: "動物愛護管理法に基づく対面説明を実施。遠方のブリーダー犬舎へ行かずに、東京・大阪・名古屋・福岡・札幌等の公認サテライト拠点で安心してお迎えいただけます。",
    icon: "🏢"
  },
  {
    step: "05",
    title: "最長365日生命保証 ＆ アフターサポート開始",
    description: "全頭に最長365日のあんしん生命保証が付帯。お迎え後180日間は24時間365日いつでも専属獣医師に無料電話相談できるホットラインをご利用いただけます。",
    icon: "🛡️"
  }
];

// ==================== よくある質問 (FAQ) マスター ====================
export const FAQ_LIST = [
  {
    category: "見学・予約について",
    q: "見学やオンライン相談に費用はかかりますか？",
    a: "一切かかりません。見学予約・オンライン相談は完全無料です。ブリーダーや専任スタッフが丁寧にご質問にお答えします。"
  },
  {
    category: "生体情報・体重について",
    q: "写真鮮度イエローマーク⚠️とは何ですか？",
    a: "WanBridgeでは生後35日・60日・90日のマイルストーンごとに体重計に乗せた写真の更新を義務付けています。前回の更新から日数が経過している子犬には自動的にイエローマークが点灯し、更新を促します。"
  },
  {
    category: "生体情報・体重について",
    q: "タイニーサイズや豆柴のサイズ予測は本当に当たりますか？",
    a: "過去数千頭の成長回帰分析に基づき、生後60日実測体重×3.0〜3.2倍の科学的予測モデルを採用しています。生後60日体重計写真という改ざん不能な証憑を提示することで、悪質なサイズ詐欺を防止しています。"
  },
  {
    category: "対面・受取について",
    q: "遠方のブリーダーの子犬を近くで受け取ることはできますか？",
    a: "はい、可能です。動物愛護管理法で定められた現物確認・対面説明を、東京・大阪・名古屋・福岡・札幌などの公認提携サテライト拠点で行うことができます。"
  },
  {
    category: "里親・繁殖引退犬について",
    q: "里親犬の「実費負担金」とは具体的に何ですか？",
    a: "避妊去勢手術、混合ワクチン、マイクロチップ装着、ノミダニ駆除等の動物病院医療費の実際にかかった費用のみです。病院発行の領収書明細を100%開示し、現地での不透明な現金請求を防ぐためエスクロー決済を採用しています。"
  },
  {
    category: "保証・アフターサポートについて",
    q: "万が一、引き渡し後に病気になった場合の保証はありますか？",
    a: "最長365日のあんしん生命保証が付帯しており、先天性疾患や急激な伝染病による死亡時に全額返金または代犬提供を行います。また、お迎え後180日間は24時間獣医師電話相談ダイヤルを無料でご利用いただけます。"
  },
  {
    category: "シニア・高齢者と老犬マッチングについて",
    q: "70代・80代の高齢者でも本当にお迎えできますか？年齢制限はありませんか？",
    a: "はい、WanBridge Seniorでは一般的な保護団体の「60〜65歳上限」を撤廃しています。全頭に【100%終生引き取り保証】が付帯しており、飼い主様の急なご入院や施設入所、他界時はWanBridge（千住古民家拠点シェルター等）が無償で引き取り終生保護するため、安心して穏やかなシニア犬との暮らしをお楽しみいただけます。"
  },
  {
    category: "シニア・高齢者と老犬マッチングについて",
    q: "シニア犬の引っ張り癖や、お散歩中の転倒事故が心配です。",
    a: "WanBridgeではシニア適性Sランクのワンちゃんを厳選しています。「引っ張り癖ゼロ」「歩行同調性（人の歩調に合わせてゆっくり歩く）」「無駄吠え・夜鳴きゼロ」が実証された子犬〜シニア犬のみをマッチングするため、足腰に不安のあるご高齢者でも転倒リスクなく安全にお散歩いただけます。"
  },
  {
    category: "シニア・高齢者と老犬マッチングについて",
    q: "毎朝のLINEワンタップ安否確認とはどのような仕組みですか？",
    a: "毎朝LINE公式アカウントから「今日もワンちゃんとお散歩に行けましたか？」とメッセージが届きます。「🐾 いけたよ」「💦 おやすみ」をタップするだけで、飼い主様と愛犬の安否が同時に確認されます。2日間返信がない場合は専任コンシェルジュから確認電話が入り、孤立死や愛犬の置き去りを未然に防ぎます。"
  }
];


