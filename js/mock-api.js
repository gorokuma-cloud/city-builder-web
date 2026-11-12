/**
 * dog.exe-ps.com 静的ホスティング用 Mock API Interceptor
 * バックエンド Python サーバーと全く同一のレスポンスをブラウザ内でシミュレートし、
 * オフライン・Cloudflare Pages 環境でも全機能（点呼、うんちAI、カフェDX等）の完全動作を保証します。
 */
(function() {
  const originalFetch = window.fetch;

  window.fetch = async function(url, options = {}) {
    const urlStr = typeof url === 'string' ? url : (url.url || '');
    const method = (options.method || 'GET').toUpperCase();

    // /api/ 以外のリクエストは通常 fetch
    if (!urlStr.startsWith('/api/')) {
      return originalFetch.apply(this, arguments);
    }

    console.log(`[WanBridge Mock API] ${method} ${urlStr}`);

    // ヘルパー: JSON レスポンス生成
    const jsonResponse = (data, status = 200) => {
      return new Response(JSON.stringify(data), {
        status: status,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    try {
      // 1. 本物のバックエンドがある場合はまず通常フェッチを試みる（タイムアウト1.5秒）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const testOptions = { ...options, signal: controller.signal };
      try {
        const realRes = await originalFetch(url, testOptions);
        clearTimeout(timeoutId);
        const ct = realRes.headers.get('content-type') || '';
        if (realRes.ok && ct.includes('application/json')) return realRes;
      } catch (e) {
        clearTimeout(timeoutId);
      }

      // 2. バックエンドがない場合はフロントエンドのモックロジックで完全応答
      // (0-0) システムヘルスチェック: /api/health
      if (urlStr.startsWith('/api/health')) {
        return jsonResponse({
          status: "healthy",
          server: "WanBridge Cloudflare Pages Edge Runtime",
          uptime: Date.now(),
          database: "client_mock_synced",
          totalDogs: 14,
          timestamp: new Date().toISOString()
        });
      }

      // (0-A) 全ブリーダー一覧: /api/breeders
      if (urlStr.startsWith('/api/breeders')) {
        return jsonResponse({
          status: "success",
          count: 3,
          data: [
            { id: "b-01", kennel_name: "千住プードル犬舎", owner_name: "森本 和夫", license_number: "東京都 登録準備中（千住拠点）", prefecture: "東京都", location: "足立区千住", rating: 5.0, review_count: 12, badge: "⭐️ 第1号認定プラチナ犬舎", dog_count: 3 },
            { id: "b-02", kennel_name: "【モデルサンプル】スノーホワイト犬舎", owner_name: "白石 (提携候補サンプル)", license_number: "北海道 (※掲載モデルサンプル)", prefecture: "北海道", location: "旭川市", rating: 4.92, review_count: 29, badge: "⭐️ ゴールド認定（基準モデル）", dog_count: 2 },
            { id: "b-03", kennel_name: "【モデルサンプル】サザンクロス・ブリーディング", owner_name: "南 (提携候補サンプル)", license_number: "静岡県 (※掲載モデルサンプル)", prefecture: "静岡県", location: "伊豆高原", rating: 4.88, review_count: 42, badge: "⭐️ ゴールド認定（基準モデル）", dog_count: 2 }
          ]
        });
      }

      // (0-B) パートナー加盟店一覧: /api/partner/stores
      if (urlStr.startsWith('/api/partner/stores')) {
        return jsonResponse({
          status: "success",
          count: 2,
          data: [
            { id: "store-01", name: "Dog Cafe WanPeace 代官山本店", type: "cafe", location: "東京都渋谷区代官山町 18-5", phone: "03-5489-1122" },
            { id: "store-02", name: "Trimming Salon Jolie 自由が丘", type: "salon", location: "東京都目黒区自由が丘 2-10-8", phone: "03-3725-3344" }
          ]
        });
      }

      // (0-C) カフェメニュー: /api/partner/cafe/menu
      if (urlStr.startsWith('/api/partner/cafe/menu')) {
        return jsonResponse({
          status: "success",
          count: 3,
          data: [
            { id: "menu-01", name: "北海道産 熟成エゾ鹿肉ステーキボウル", category: "meal", description: "高タンパク・低脂肪。オメガ3豊富な亜麻仁油仕立て。", price: 1200, hasAllergyWarning: false, allergyAlertText: "✅ アレルゲン不検出" },
            { id: "menu-02", name: "契約農家カボチャとヤギミルクのバースデーケーキ", category: "celebration", description: "砂糖・小麦粉完全不使用。乳酸菌たっぷりのヤギミルククリーム。", price: 1600, hasAllergyWarning: false, allergyAlertText: "✅ 安心素材" },
            { id: "menu-03", name: "若鶏ササミと有機玄米の薬膳おじや", category: "meal", description: "胃腸に優しい温かいスープ仕立て。シニア犬にも最適。", price: 980, hasAllergyWarning: false, allergyAlertText: "✅ 低刺激" }
          ]
        });
      }

      // (0-D) カフェチェックイン履歴: /api/partner/cafe/checkins
      if (urlStr.startsWith('/api/partner/cafe/checkins')) {
        return jsonResponse({
          status: "success",
          count: 3,
          data: [
            { id: "chk-01", dog_name: "モコちゃん", dogName: "モコちゃん", owner_name: "佐藤 健一様", customerName: "佐藤 健一様", checkin_time: "11:30", checkinTime: "11:30", table_no: "A-02", tableNo: "A-02", points: 50 },
            { id: "chk-02", dog_name: "ポチくん", dogName: "ポチくん", owner_name: "高橋 陽子様", customerName: "高橋 陽子様", checkin_time: "12:15", checkinTime: "12:15", table_no: "B-01", tableNo: "B-01", points: 50 },
            { id: "chk-03", dog_name: "レオくん", dogName: "レオくん", owner_name: "田中 一郎様", customerName: "田中 一郎様", checkin_time: "13:00", checkinTime: "13:00", table_no: "A-03", tableNo: "A-03", points: 50 }
          ]
        });
      }

      // (0-E) ブリーダーダッシュボード: /api/breeder/dashboard
      if (urlStr.startsWith('/api/breeder/dashboard')) {
        return jsonResponse({
          status: "success",
          data: {
            breeder: {
              id: "b-01",
              kennel_name: "千住プードル犬舎",
              owner_name: "森本 和夫",
              license_number: "東京都 登録準備中（千住拠点）",
              prefecture: "東京都",
              location: "足立区千住"
            },
            summary: {
              totalDogs: 8,
              availableDogs: 6,
              negotiatingDogs: 1,
              adoptedDogs: 1,
              yellowAlertCount: 0,
              pendingInquiries: 2,
              pendingPhotoRequests: 1
            },
            dogs: [
              { id: "dog-001", temporary_name: "モコちゃん", breed: "タイニープードル", status: "available", age_days: 83, current_weight_g: 685 },
              { id: "dog-003", temporary_name: "ベルちゃん", breed: "ポメラニアン", status: "available", age_days: 88, current_weight_g: 780 }
            ],
            inquiries: [
              { id: "inq-01", dog_name: "モコちゃん", customer_name: "山田 花子", status: "new", created_at: "2026-09-06 14:20" }
            ],
            photoRequests: [
              { id: "req-01", dog_name: "モコちゃん", requester_name: "佐藤 健一", status: "pending", created_at: "2026-09-06 16:45" }
            ]
          }
        });
      }

      // (A) 朝夕点呼ステータス: /api/breeder/rollcall/status
      if (urlStr === '/api/breeder/rollcall/status') {
        return jsonResponse({
          status: "success",
          data: {
            totalBreederDogs: 8,
            morningCheckedCount: 8,
            eveningCheckedCount: 0,
            morningRemainingCount: 0,
            eveningRemainingCount: 8,
            alertCount: 1,
            alerts: [
              {
                dogId: "dog-001",
                dogName: "モコちゃん",
                breed: "タイニープードル",
                alertType: "weight_drop",
                message: "前回比 -35g の体重急減を検知（低血糖警戒）"
              }
            ]
          }
        });
      }

      // (B) 朝夕点呼履歴: /api/breeder/rollcalls
      if (urlStr.startsWith('/api/breeder/rollcalls')) {
        return jsonResponse({
          status: "success",
          count: 2,
          data: [
            {
              id: "rc-mock-01",
              dog_id: "dog-001",
              dog_name: "モコちゃん",
              breed: "タイニープードル",
              rollcall_type: "morning",
              recorded_by: "森本 和夫",
              dog_photo_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
              poop_photo_url: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=600&q=80",
              poop_score: 4,
              poop_condition: "healthy",
              poop_comment: "理想的な便性状（スコア4）。水分量・硬さ良好。",
              weight_photo_url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80",
              measured_weight_g: 685,
              weight_diff_g: 10,
              alert_flags: "normal",
              health_status: "normal",
              action_taken: "朝ごはん完食。活発。",
              sns_posted_log: JSON.stringify({
                instagram: { status: "posted", post_id: "ig-demo-01" },
                x_twitter: { status: "posted", tweet_id: "x-demo-01" },
                line_official: { status: "delivered", sent_to: 18 }
              }),
              created_at: new Date().toLocaleDateString('ja-JP') + " 08:30:00"
            }
          ]
        });
      }

      // (C) 点呼記録実行: POST /api/breeder/rollcall
      if (urlStr === '/api/breeder/rollcall' && method === 'POST') {
        const body = options.body ? JSON.parse(options.body) : {};
        const pInput = body.poopInput || 4;
        let score = 4;
        let cond = "healthy";
        let comment = "理想的な良便（スコア4）です。消化管運動良好。";
        let alerts = ["normal"];
        let hStatus = "normal";
        let action = "通常飼育管理。";

        if (String(pInput).includes("下痢") || Number(pInput) >= 6) {
          score = 7;
          cond = "diarrhea_danger";
          alerts = ["diarrhea"];
          hStatus = "danger";
          comment = "【警戒】水様性下痢便を検知。脱水および低血糖リスクあり。";
          action = "保温30℃維持、経口補水液(電解質)を少量頻回投与。獣医師オンライン相談を手配。";
        } else if (String(pInput).includes("血") || String(pInput).includes("緊急")) {
          score = 7;
          cond = "bloody_emergency";
          alerts = ["bloody_emergency"];
          hStatus = "danger";
          comment = "【緊急警告】血便・出血性消化管症状を検知！感染症(パルボ等)の疑い。";
          action = "直ちに個別完全隔離。至急提携動物病院へ緊急搬送。";
        } else if (String(pInput).includes("軟便") || Number(pInput) === 5) {
          score = 5;
          cond = "soft_warning";
          alerts = ["soft_stool"];
          hStatus = "warning";
          comment = "水分多めの軟便（スコア5）。消化不良または軽度ストレス。";
          action = "乳酸菌整腸サプリを添加。夕方点呼で再検査。";
        }

        const weight = Number(body.measuredWeightG) || 680;
        if (weight <= 650) {
          alerts.push("weight_drop");
          if (hStatus === "normal") hStatus = "warning";
          action += " 前日比-35gの急減。高濃度ブドウ糖液を歯茎に塗布。";
        }

        return jsonResponse({
          status: "success",
          message: "点呼記録およびうんちAI診断、SNS自動配信が完了しました（Live Mock）",
          data: {
            id: "rc-" + Date.now(),
            dogId: body.dogId || "dog-001",
            rollcallType: body.rollcallType || "morning",
            healthStatus: hStatus,
            alerts: alerts,
            actionTaken: action,
            poopScore: score,
            poopCondition: cond,
            poopComment: comment,
            measuredWeightG: weight,
            weightDiffG: weight - 685,
            snsPosted: true,
            snsLog: {
              instagram: { status: "posted", post_id: "ig-" + Date.now() },
              x_twitter: { status: "posted", tweet_id: "x-" + Date.now() },
              line_official: { status: "delivered", sent_to: 18 }
            }
          }
        });
      }

      // (D) うんちAI単体診断: POST /api/ai/poop-diagnose
      if (urlStr === '/api/ai/poop-diagnose' && method === 'POST') {
        const body = options.body ? JSON.parse(options.body) : {};
        const p = body.poopInput || 4;
        if (String(p).includes("血")) {
          return jsonResponse({
            status: "success",
            data: { score: 7, condition: "bloody_emergency", alert: "bloody_emergency", comment: "【緊急】血便疑い。即時動物病院搬送。" }
          });
        }
        if (String(p).includes("下痢") || Number(p) >= 6) {
          return jsonResponse({
            status: "success",
            data: { score: 7, condition: "diarrhea_danger", alert: "diarrhea", comment: "水様便。脱水予防のため電解質投与。" }
          });
        }
        return jsonResponse({
          status: "success",
          data: { score: 4, condition: "healthy", alert: "normal", comment: "快便（ブリストルスコア4）。健康状態良好。" }
        });
      }

      // (E) ドッグカフェチェックイン: POST /api/partner/cafe/checkin
      if (urlStr === '/api/partner/cafe/checkin' && method === 'POST') {
        return jsonResponse({
          status: "success",
          message: "店舗チェックイン完了。ワクチン接種証明およびマナー誓約を確認しました。",
          data: {
            checkinId: "chk-" + Date.now(),
            vaccineVerified: true,
            mannerPledged: true,
            pointsAwarded: 50,
            tableNo: "A-03"
          }
        });
      }

      // (F) AIフォトブース: POST /api/partner/cafe/photo-booth
      if (urlStr === '/api/partner/cafe/photo-booth' && method === 'POST') {
        const body = options.body ? JSON.parse(options.body) : {};
        return jsonResponse({
          status: "success",
          message: "AIフォトブース撮影完了！高画質補正＆秋テーマ装飾を適用しました。",
          data: {
            photoId: "photo-" + Date.now(),
            processedUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=85",
            theme: body.theme || "autumn",
            smileScore: 98,
            snsShared: true,
            instaStoryUrl: "https://instagram.com/wanbridge_official"
          }
        });
      }

      // (G) カフェマージンサマリー: /api/partner/cafe/margin-summary
      if (urlStr.startsWith('/api/partner/cafe/margin-summary')) {
        return jsonResponse({
          status: "success",
          data: {
            storeId: "store-01",
            storeName: "千住古民家ドッグカフェ WanTea",
            totalCommission: 7850,
            totalSales: 84200,
            currentMonthOrders: 14,
            currentMonthSales: 84200,
            currentMonthMargin: 7850,
            marginRate: "粗利の20%シェア (実質売上約5%〜10%)",
            nextPayoutDate: "2026-10-15",
            history: [
              { created_at: "2026-09-06 18:20", order_id: "ORD-202609-881", customer_name: "佐藤 健一様", product_name: "熟成エゾ鹿肉キューブ定期便", order_amount: 4800, cost_price: 2400, gross_profit: 2400, commission_rate: 0.20, commission_amount: 480, supplier_name: "北海道提携ファーム直卸" },
              { created_at: "2026-09-06 14:15", order_id: "ORD-202609-882", customer_name: "高橋 陽子様", product_name: "TP-Link Tapo パピー見守りカメラ", order_amount: 6980, cost_price: 5200, gross_profit: 1780, commission_rate: 0.20, commission_amount: 356, supplier_name: "TP-Link正規一次卸" },
              { created_at: "2026-09-05 11:30", order_id: "ORD-202609-883", customer_name: "鈴木 隆様", product_name: "WanBridge Smart Collar Pro", order_amount: 14800, cost_price: 7200, gross_profit: 7600, commission_rate: 0.20, commission_amount: 1520, supplier_name: "自社開発/OEM提携" }
            ],
            recentOrders: [
              { orderId: "ORD-202609-881", customerName: "佐藤 健一様", productName: "熟成エゾ鹿肉キューブ定期便", amount: 4800, cost: 2400, grossProfit: 2400, margin: 480, supplier: "北海道提携ファーム直卸" },
              { orderId: "ORD-202609-882", customerName: "高橋 陽子様", productName: "Tapo パピー見守りカメラ", amount: 6980, cost: 5200, grossProfit: 1780, margin: 356, supplier: "TP-Link正規一次卸" }
            ]
          }
        });
      }

      // (H) 🧬 COIシミュレーション: /api/breeder/coi/simulate
      if (urlStr === '/api/breeder/coi/simulate') {
        const body = options.body ? JSON.parse(options.body) : {};
        const isCarrier = String(body.sireId).includes('carrier') || String(body.damId).includes('carrier');
        return jsonResponse({
          status: "success",
          data: {
            coiPercentage: isCarrier ? 12.5 : 3.125,
            isMatingLocked: isCarrier,
            praRisk: isCarrier ? "affected_danger" : "clear",
            dmRisk: "clear",
            soundnessScore: isCarrier ? 0.6 : 0.98,
            lockReason: isCarrier ? "【警告】キャリア交配による発症リスクがあるため交配ロック" : "健全交配（発症リスク0%・COI 3.125%適正範囲）",
            prediction: {
              predictedColors: ["レッド (45%)", "アプリコット (40%)", "シャンパン (15%)"],
              predictedAdultWeightKg: { min: 1.9, max: 2.3, expectedAverage: 2.1 }
            }
          }
        });
      }

      // (I) 🏷️ ミリ波レーダーバイタル記録: /api/breeder/vital/record
      if (urlStr === '/api/breeder/vital/record') {
        const body = options.body ? JSON.parse(options.body) : {};
        const isCrush = !!body.isOverlay;
        const isMotionless = (body.respirationRateBpm || 22) < 14;
        return jsonResponse({
          status: "success",
          data: {
            respirationRateBpm: body.respirationRateBpm || 22,
            microMotionLevel: body.microMotionLevel || 0.85,
            temperatureCelsius: body.temperatureCelsius || 29.5,
            isOverlayCrushAlarm: isCrush,
            isMotionlessAlarm: isMotionless,
            alertMessage: isCrush ? "🚨【緊急圧死警報】母犬の体と子犬が重なり呼吸動が遮断されています！至急産室へ駆けつけてください！" : isMotionless ? "⚠️【完全不動警報】呼吸数低下・低血糖警戒。" : "正常稼働。"
          }
        });
      }

      // (J) 🍼 黄金ふやかしレシピ: /api/breeder/feed/recipe
      if (urlStr === '/api/breeder/feed/recipe') {
        const body = options.body ? JSON.parse(options.body) : {};
        const w = Number(body.currentWeightG || 685);
        const p = Number(body.poopScore || 4);
        const kibble = Math.round((w * 0.065 / 3.0) * 10) / 10;
        return jsonResponse({
          status: "success",
          data: {
            perMealKibbleG: kibble,
            warmWaterMl: Math.round(kibble * 2.2),
            soakMinutes: p >= 5 ? 12 : 8,
            probioticDrops: p >= 5 ? 3 : 1,
            formulaPowderG: 2.0,
            recipeNotes: p >= 5 ? "軟便傾向のため浸漬時間を延ばし整腸サプリを3滴添加。" : "理想便（スコア4）維持。芯が柔らかくなる8分浸漬。"
          }
        });
      }

      // (K) 🎥 AI骨格採寸: /api/breeder/remote/measure
      if (urlStr === '/api/breeder/remote/measure') {
        const body = options.body ? JSON.parse(options.body) : {};
        const h = Number(body.withersHeightMm || 122);
        const l = Number(body.bodyLengthMm || 135);
        return jsonResponse({
          status: "success",
          data: {
            bodyTypeRatio: (l / h) < 1.15 ? "square" : "hyper_cobby",
            predictedAdultWeightKg: 2.15,
            predictedSizeCategory: "tiny",
            confidenceScore: 0.96
          }
        });
      }

      // (L) 🏛️ 動愛法 立入検査帳簿: /api/breeder/legal-audit/generate
      if (urlStr === '/api/breeder/legal-audit/generate') {
        return jsonResponse({
          status: "success",
          data: {
            auditGrade: "S (完全適合・指摘ゼロ確定)",
            breedingDamCount: 8,
            breedingSireCount: 2,
            capacityUtilization: "33.3% (法定上限30頭中10頭・余裕70%)",
            overAgeMatingViolations: 0,
            overLitterViolations: 0,
            microchipRegisteredRatio: "100.0%"
          }
        });
      }

      // (M) 🤝 DNAファミリー: /api/breeder/dna-family
      if (urlStr.startsWith('/api/breeder/dna-family')) {
        return jsonResponse({
          status: "success",
          data: {
            familyOwnerCount: 3,
            litterSiblings: ["dog-002", "dog-005"],
            halfSiblings: ["dog-003", "dog-004"],
            annualReunionStatus: "registered",
            foodSubscriptionActive: true,
            monthlySubscriptionAmount: 6800,
            cumulativeLtvYen: 485000
          }
        });
      }

      // (N) 🛍️ 犬用便利グッズ商品一覧: /api/shop/products
      if (urlStr.startsWith('/api/shop/products')) {
        const urlObj = new URL(urlStr, 'http://localhost');
        const cat = urlObj.searchParams.get('category') || 'all';
        const search = (urlObj.searchParams.get('search') || '').toLowerCase();

        const allProds = [
          {
            id: "ec-prod-01", product_code: "PROD-SMART-COLLAR", name: "WanBridge Smart Collar Pro (AIスマート首輪)",
            category: "iot_smart", category_label: "IoT・スマート首輪", price: 14800, cost_price: 7200, supplier_name: "自社開発/OEM提携",
            partner_margin_rate: 0.103, partner_commission: 1520, margin_note: "粗利の20%還元", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80",
            tagline: "愛犬の命を守る24時間リアルタイムGPS ＆ 心拍・睡眠バイタル解析",
            features: ["4G LTE & GPSリアルタイム迷子追跡（ジオフェンス警報）", "心拍数・呼吸・睡眠スコア24時間自動解析", "IP68完全防水・重さわずか28gの超軽量設計", "1回の充電で最長14日間連続稼働"]
          },
          {
            id: "ec-prod-02", product_code: "PROD-TAPO-PUPPY-KIT", name: "TP-Link Tapo パピー見守りカメラ WanBridgeスターターキット",
            category: "iot_smart", category_label: "Tapo見守りカメラ", price: 6980, cost_price: 5200, supplier_name: "TP-Link日本正規一次卸",
            partner_margin_rate: 0.051, partner_commission: 356, margin_note: "粗利の20%還元", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
            tagline: "実家のブリーダー犬舎と同じ安心をお家でも。2K高画質＆お留守番双方向通話",
            features: ["2K QHD (2560x1440) 超高解像度 ＆ 水平360°自動追尾", "暗闇でもクッキリ見えるスマート赤外線ナイトビジョン", "スマホから愛犬へ優しく声をかけられるクリア双方向通話", "ワンタッチ物理プライバシーシャッター搭載"]
          },
          {
            id: "ec-prod-03", product_code: "PROD-TAPO-TEMP-HUB", name: "TP-Link Tapo ケージ内スマート温湿度計＆IoTハブセット",
            category: "iot_smart", category_label: "IoT環境センサー", price: 4280, cost_price: 3200, supplier_name: "TP-Link日本正規一次卸",
            partner_margin_rate: 0.050, partner_commission: 216, margin_note: "粗利の20%還元", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
            tagline: "スイス製高精度センサー搭載。ケージ内の温度急変・熱中症をスマホ即時警告",
            features: ["スイス製Sensirion高精度センサー採用（誤差±0.3℃）", "視認性に優れたE-ink電子ペーパーディスプレイ", "エアコンやスマートプラグヒーターとの自動連動運転対応", "電池寿命最長2年間の省電力設計"]
          },
          {
            id: "ec-prod-04", product_code: "PROD-SMART-FEED-BOWL", name: "黄金ふやかし専用 デジタル温度計付きスマート計量ボウル",
            category: "health_care", category_label: "ヘルスケア・調合", price: 3800, cost_price: 2200, supplier_name: "NETSEA提携ペット卸問屋",
            partner_margin_rate: 0.084, partner_commission: 320, margin_note: "粗利の20%還元", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80",
            tagline: "0.1g単位の高精度キブル計量 ＆ 消化酵素を壊さない50℃適温インジケーター",
            features: ["0.1g単位の高精度デジタルスケール内蔵", "50℃適温キープLEDカラーインジケーター（青=冷/緑=適温/赤=熱）", "食品衛生法適合・食洗機丸洗い対応SUS304抗菌ステンレスボウル", "WanBridge黄金ふやかしスケーラーアプリ連動QR付き"]
          },
          {
            id: "ec-prod-05", product_code: "PROD-LED-HARNESS", name: "360°NightGlow LEDセーフティハーネス＆衝撃吸収リード",
            category: "safety_outdoors", category_label: "お散歩・安全", price: 3980, cost_price: 2100, supplier_name: "NETSEA提携ペット卸問屋",
            partner_margin_rate: 0.094, partner_commission: 376, margin_note: "粗利の20%還元", is_featured: 0,
            image_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
            tagline: "夜道500m先から視認。気管虚脱を防ぐY字胸当て＆急な引っ張り衝撃低減",
            features: ["360度全方位 高輝度LED光ファイバー（点灯・点滅2モード）", "気管を圧迫しない幅広Y字クッション構造", "不意のダッシュ衝撃を70%和らげるバンジー伸縮リード付属", "USB Type-C急速充電（2時間充電で最長8時間点灯）"]
          },
          {
            id: "ec-prod-06", product_code: "PROD-HEARTBEAT-PUPPY", name: "母犬ぬくもり鼓動パピードール (Heartbeat Plush Toy)",
            category: "baby_puppy", category_label: "パピー・夜泣きケア", price: 4500, cost_price: 2400, supplier_name: "自社オリジナル企画",
            partner_margin_rate: 0.093, partner_commission: 420, margin_note: "粗利の20%還元", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=800&q=80",
            tagline: "お迎え初夜の夜泣き・環境急変ストレスを90%解消。母犬の心音とぬくもりを完全再現",
            features: ["母犬の心拍リズムを忠実に再現するリアルパルスユニット", "電子レンジ対応の再利用可能ウォーミング温熱パック内蔵", "丸洗い可能で衛生的なオーガニックパイル生地", "獣医師・プロブリーダー推奨の分離不安対策"]
          },
          {
            id: "ec-prod-07", product_code: "PROD-ODORLESS-POOP-BOX", name: "ワンタッチ自動密閉＆オゾン消臭ポータブルうんちBOX",
            category: "safety_outdoors", category_label: "お出かけ・エチケット", price: 2800, cost_price: 1500, supplier_name: "スーパーデリバリー卸仕入",
            partner_margin_rate: 0.093, partner_commission: 260, margin_note: "粗利の20%還元", is_featured: 0,
            image_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80",
            tagline: "ドッグカフェ同伴や車移動もニオイ漏れ完全ゼロ。生分解性エコ袋30枚付き",
            features: ["気密性の高いダブルシリコンロック機構で車内でも無臭", "天然オゾン活性炭フィルターで有害ガスを強力吸着", "植物由来コーンスターチ生分解性マナー袋30枚付属", "カラビナ付きでバッグやリードへ片手装着"]
          },
          {
            id: "ec-prod-08", product_code: "PROD-SONIC-TOOTHBRUSH", name: "音波振動イオン犬用スマート歯ブラシ＆低刺激デンタルジェル",
            category: "health_care", category_label: "口腔ケア・デンタル", price: 5400, cost_price: 2800, supplier_name: "スーパーデリバリー卸仕入",
            partner_margin_rate: 0.096, partner_commission: 520, margin_note: "粗利の20%還元", is_featured: 0,
            image_url: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=800&q=80",
            tagline: "毎分18,000回微細音波振動。愛犬が嫌がらない超極細毛で歯周病ゼロへ",
            features: ["小型犬専用φ8mmマイクロ超極細毛ヘッド", "振動音を抑えた低周波静音モーターで愛犬の恐怖心を軽減", "すすぎ不要・舐めても安全な国産乳酸菌デンタルジェル付き", "IPX7完全防水で丸洗いOK"]
          },
          {
            id: "ec-prod-09", product_code: "PROD-EZOSHIKA-JERKY", name: "北海道産 熟成エゾ鹿肉キューブジャーキー定期便",
            category: "food_treats", category_label: "プレミアムフード・おやつ", price: 4800, cost_price: 2400, supplier_name: "北海道提携ファーム直卸",
            partner_margin_rate: 0.100, partner_commission: 480, margin_note: "粗利の20%還元", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80",
            tagline: "無添加・低アレルゲン・高タンパク。カフェ店頭でも売上No.1の至極おやつ",
            features: ["北海道産天然エゾ鹿100%・保存料着色料完全不使用", "牛肉の1/3の低脂肪・高鉄分・低カロリー", "小型犬でも喉に詰まらせない1cm角のソフトキューブカット", "カフェ店頭紹介コードで毎回粗利20%マージン還元"]
          },
          {
            id: "ec-prod-10", product_code: "PROD-DESENSITIZATION-KIT", name: "WanBridge式 パピーお手入れ脱感作スターターキット（ブラシ・コーム・爪切り・歯ブラシ・ペースト）",
            category: "health_care", category_label: "ヘルスケア・調合", price: 8800, cost_price: 4000, supplier_name: "プロトリマー卸直供",
            partner_margin_rate: 0.109, partner_commission: 960, margin_note: "粗利の20%還元 (粗利4,800円)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=800&q=80",
            tagline: "成犬になっても嫌がらない！生後3ヶ月からの触れ合い・脱感作ケア完全セット",
            features: ["皮膚を傷つけない先端丸加工ピン・プロ仕様スリッカーブラシ", "静電気防止・毛玉ほぐしステンレス両目コーム", "深爪を防ぐ刃先ストッパー付き小型犬専用ギロチン爪切り", "音波振動マイクロ歯ブラシ ＆ 嗜好性抜群チキン栄養ペースト"]
          },
          {
            id: "ec-prod-11", product_code: "PROD-CHICKEN-FLAKE-BOX", name: "千住仕込み 無添加チキンフレーク ＆ スープキューブ月額定期便 (4袋/月・送料無料)",
            category: "food_treats", category_label: "プレミアムフード・おやつ", price: 4800, cost_price: 1800, supplier_name: "千住古民家WanTea厨房直製",
            partner_margin_rate: 0.125, partner_commission: 600, margin_note: "粗利の20%還元 (粗利3,000円)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80",
            tagline: "食いつき100%保証。茹でたて国産銘柄鶏を粉雪状に粉砕した極上トッピング",
            features: ["国産銘柄鶏100%・保存料・着色料・調味料完全無添加", "歯の生え揃わないパピーやシニア犬も無理なく消化できる粉雪微粒子", "ドライキブルに混ぜるだけで完食率99.4%（自社犬舎モニター実績）", "水分補給に最適な無塩ボイルスープキューブ（冷凍小分けパック）付属"]
          },
          {
            id: "ec-prod-12", product_code: "PROD-PUPPY-WELCOME-FULLSET", name: "千住古民家監修 パピーお迎え安心スターターフルセット（ケージ・クレート・トイレ・給水器・ドール・フード1ヶ月分）",
            category: "starter_goods", category_label: "🎖️ スターターセット・物販", price: 49800, cost_price: 25800, supplier_name: "ペット専門問屋直卸（掛率51%）",
            partner_margin_rate: 0.096, partner_commission: 4800, margin_note: "粗利の20%還元 (粗利24,000円)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
            tagline: "お迎え初日からの不安を完全ゼロ化。プロブリーダーが愛用する必須飼育器具フルセット",
            features: ["屋根付き静音サークルケージ (W90×D60×H60cm) ＋ 移動用クレート", "母犬ぬくもり鼓動パピードール内蔵で初夜の夜泣きを90%解消", "メッシュ付き抗菌トイレトレー ＆ 厚型活性炭消臭シーツ100枚", "ノズル式給水器 ＋ 国産プレミアムパピーフード1ヶ月分"]
          },
          {
            id: "ec-prod-13", product_code: "PROD-STARTER-PACK", name: "千住古民家推奨 パピースターター5点セット（ケージ・トイレ・給水器・ブラシ・消臭剤）",
            category: "starter_goods", category_label: "🎖️ スターターセット・物販", price: 29800, cost_price: 14000, supplier_name: "ペット専門問屋直卸（掛率47%）",
            partner_margin_rate: 0.106, partner_commission: 3160, margin_note: "粗利の20%還元 (粗利15,800円)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
            tagline: "お迎え客の8割が同時購入！プロブリーダーが厳選した必要不可欠なスターター器具セット",
            features: ["屋根付き静音サークルケージ ＋ メッシュ付き抗菌トイレトレー", "ノズル式ケージ固定給水器 ＋ 陶器製フードボウル", "プロ仕様スリッカーブラシ ＆ ステンレスコーム", "天然ヒノキ消臭スプレー ＆ 1ヶ月分プレミアムフード"]
          },
          {
            id: "ec-prod-14", product_code: "PROD-HOMEMADE-JERKY", name: "千住古民家 自家製無添加 鶏ささみジャーキー (40g袋)",
            category: "food_treats", category_label: "🥉 自家製無添加おやつ", price: 700, cost_price: 60, supplier_name: "千住古民家WanTea厨房直製",
            partner_margin_rate: 0.183, partner_commission: 128, margin_note: "粗利の20%還元 (利益率91.4%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80",
            tagline: "食品乾燥機で70℃・10時間じっくり低温乾燥。保存料・塩分完全ゼロの極上ささみ",
            features: ["国産銘柄鶏ささみ100%使用・完全無添加", "高タンパク・超低脂肪・愛犬の食いつき抜群", "手でパリッと割れる薄切りスライスで小型犬・パピーにも最適", "愛がん動物用飼料製造業者届出済"]
          },
          {
            id: "ec-prod-15", product_code: "PROD-BIRTHDAY-CAKE", name: "千住古民家 愛犬用米粉バースデーケーキ (直径9cm・予約制プレート付)",
            category: "food_treats", category_label: "🥉 自家製無添加ケーキ", price: 1800, cost_price: 180, supplier_name: "千住古民家WanTea厨房直製",
            partner_margin_rate: 0.180, partner_commission: 324, margin_note: "粗利の20%還元 (粗利1,620円)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=800&q=80",
            tagline: "砂糖・添加物・小麦粉完全不使用。米粉スポンジとさつまいも＆水切りヨーグルト仕立て",
            features: ["小麦粉・白砂糖・着色料一切不使用（アレルギー対応）", "さつまいもの自然な甘みと国産米粉のふんわり生地", "愛犬の名前をアイシングクッキーで手書き名入れプレート無料", "カフェ店頭受取・お誕生日記念チェキ撮影無料サービス付き"]
          },
          {
            id: "ec-prod-16", product_code: "PROD-SELF-WASH-TICKET", name: "千住古民家 犬用セルフウォッシュ30分利用券 (温風ドライヤー・炭酸泉対応)",
            category: "self_wash", category_label: "🥈 犬用セルフウォッシュ", price: 1500, cost_price: 150, supplier_name: "千住古民家WanTea設備貸出",
            partner_margin_rate: 0.180, partner_commission: 270, margin_note: "粗利の20%還元 (利益率90%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80",
            tagline: "人件費ゼロ・飼い主が自分で楽しく洗う設備貸し。業務用水圧シャワー＆大型ドライヤー完備",
            features: ["大型ステンレス製ドッグバス・滑り止めマット完備", "速乾ハイパワードライヤー・防水エプロン・吸水タオル貸出", "高濃度炭酸泉タブレット・オーガニックハーブシャンプー選択可", "腰を痛めないハイスタンド設計で大型犬から超小型犬まで快適"]
          },
          {
            id: "ec-prod-18", product_code: "PROD-CARDBOARD-MAZE-KIT", name: "【組立簡単】愛犬用お絵かきダンボール迷路＆トンネルアスレチックセット",
            category: "starter_goods", category_label: "📦 DIYダンボール遊具", price: 4980, cost_price: 1800, supplier_name: "国内梱包資材メーカー・日本製",
            partner_margin_rate: 0.128, partner_commission: 636, margin_note: "粗利の20%還元", is_featured: 1,
            image_url: "/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b4c57c7b-202a-4106-b902-46c101f7f65f/cardboard_dog_maze_1794422707665.jpg",
            tagline: "可愛いわんちゃんのイラスト・丸窓・骨型トンネル付き！パピーの探検心を育む安全迷路",
            features: ["工具・接着剤不要！差し込み式で女性一人でも10分簡単組み立て", "爪研ぎや噛み癖にも安心な国内製造・無害高強度強化段ボール採用", "パピー社会化期の障害物慣らし・探検トレーニングに最適", "楽天・Amazon即日配送・千住古民家カフェで実物体験可能"],
            affiliate: {
              amazon_url: "https://www.amazon.co.jp/s?k=犬+段ボール+迷路",
              rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+段ボール+迷路/"
            }
          },
          {
            id: "ec-prod-19", product_code: "PROD-CARDBOARD-BED-CHAIR", name: "【可愛いわんちゃん絵付き】ダンボールベッド＆ミニクラフトチェア 2点セット",
            category: "starter_goods", category_label: "📦 DIYダンボール家具", price: 3480, cost_price: 1200, supplier_name: "国内梱包資材メーカー・日本製",
            partner_margin_rate: 0.131, partner_commission: 456, margin_note: "粗利の20%還元", is_featured: 1,
            image_url: "/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b4c57c7b-202a-4106-b902-46c101f7f65f/cardboard_dog_maze_1794422707665.jpg",
            tagline: "出入りしやすい低床ステップベッド＋ふわふわクッション対応。手描き風イラスト付き",
            features: ["通気性・保温性に優れたクラフト段ボールで年中快適", "パピーの足腰に負担をかけない超低床フラット設計", "写真映え抜群！ミニチュアサイズの愛犬専用チェア付き", "使い終わったら古紙回収で100%リサイクル可能なエコ設計"],
            affiliate: {
              amazon_url: "https://www.amazon.co.jp/s?k=犬+段ボール+ベッド",
              rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+段ボール+ベッド/"
            }
          },

          // --- 1. ダンボール遊具・家具シリーズ（可愛い愛犬の絵柄入り・舐めても安全な大豆油インキ） ---
          {
            id: "ec-prod-28", product_code: "PROD-CARDBOARD-MAZE-AGILITY", name: "知育ダンボール迷路＆トンネル (可愛いコーギー・柴犬絵柄入り)",
            category: "starter_goods", category_label: "📦 ダンボール遊具・迷路", price: 3980, cost_price: 980, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.150, partner_commission: 600, margin_note: "粗利3,000円 (粗利75.3%＋Ali9%)", is_featured: 1,
            image_url: "/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b4c57c7b-202a-4106-b902-46c101f7f65f/cardboard_dog_maze_1794422707665.jpg",
            tagline: "舐めても安全な大豆油インキ採用！工具不要10分組立。雨の日の運動不足・パピーの好奇心を満たす室内アジリティ",
            features: ["食品容器用植物インク（大豆油インキ）採用でパピーの甘噛みも安全", "工具・接着剤完全不要！差し込みスロット式で女性一人でも10分簡単組み立て", "のぞき穴・骨型トンネル付きでパピーの探検トレーニングに最適", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 ダンボール 迷路 トンネル",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-dog-cardboard-maze.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+ダンボール+迷路", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+ダンボール+迷路/" }
          },
          {
            id: "ec-prod-29", product_code: "PROD-CARDBOARD-HONEYCOMB-CHAIR", name: "耐荷重60kg！ダンボール椅子＆ドッグステップ (小型犬パテラ脱臼予防兼用)",
            category: "starter_goods", category_label: "📦 ダンボール家具・椅子", price: 3280, cost_price: 820, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.150, partner_commission: 492, margin_note: "粗利2,460円 (粗利75%＋Ali8%)", is_featured: 1,
            image_url: "/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b4c57c7b-202a-4106-b902-46c101f7f65f/cardboard_dog_maze_1794422707665.jpg",
            tagline: "人間も座れる高強度ハニカム構造！可愛いワンちゃん柄。ソファ昇降時の膝関節・パテラ脱臼を予防するステップ兼用",
            features: ["特殊ハニカム強化ダンボール構造により耐荷重60kgの圧倒的強度", "小型犬・トイプードルのソファ飛び降りによる骨折・パテラ脱臼を防止", "舐めても無害な植物由来インク印刷・可愛い手描き風デザイン", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 ドッグステップ ダンボール 椅子",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-pet-cardboard-chair.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+ドッグステップ+ダンボール", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+ドッグステップ+ダンボール/" }
          },
          {
            id: "ec-prod-30", product_code: "PROD-CARDBOARD-OVAL-BED", name: "すっぽりフィット！ダンボールベッド (リバーシブル起毛ボアマット付き)",
            category: "starter_goods", category_label: "📦 ダンボールベッド", price: 2800, cost_price: 680, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.151, partner_commission: 424, margin_note: "粗利2,120円 (粗利75.7%＋Ali9%)", is_featured: 1,
            image_url: "/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b4c57c7b-202a-4106-b902-46c101f7f65f/cardboard_dog_maze_1794422707665.jpg",
            tagline: "ダンボールの微細空気層で冬の底冷えを完全遮断。アゴ乗せに最適な楕円型ボウル設計",
            features: ["ダンボール特有の中空空気層が床からの冷気を断熱し保温効果抜群", "ワンちゃんが落ち着くすっぽり包み込まれるオーバル型エルゴデザイン", "取り外して洗濯機で丸洗いできるリバーシブル起毛ボアマット付属", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 段ボール ベッド ボウル",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-pet-cardboard-bed.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+段ボール+ベッド", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+段ボール+ベッド/" }
          },

          // --- 2. トイBOX・まとめ売り・初心者セット ---
          {
            id: "ec-prod-21", product_code: "PROD-PLUSH-ROPE-TOYBOX-16", name: "知育ぬいぐるみ＆天然コットンロープ 16点トイBOX (音鳴り笛8点＋ロープ6点＋知育ボール2点)",
            category: "starter_goods", category_label: "🧸 トイBOX・まとめ売り", price: 4980, cost_price: 1380, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.145, partner_commission: 720, margin_note: "粗利3,600円 (粗利72.2%＋Ali8%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
            tagline: "パピー期の甘噛み・家具破壊対策を総取り！豪華ギフトBOX仕様。歯茎を痛めず遊んで歯石ケア",
            features: ["音鳴り笛入りぬいぐるみ8点＋無漂白天然コットンロープ6点＋知育トイ2点", "ドギーボックス商標を完全回避した独自開発のまとめ売りパッケージ", "噛むだけで歯垢を物理除去し歯茎をマッサージする高耐久繊維", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 おもちゃ セット ぬいぐるみ ロープ",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-dog-toys-set.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+おもちゃ+セット+ぬいぐるみ", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+おもちゃ+セット+ぬいぐるみ/" }
          },
          {
            id: "ec-prod-22", product_code: "PROD-PUPPY-BEGINNER-PACK-9", name: "犬飼い初心者安心スターター9点セット (抗菌食器・ブラシ・コーム・生分解マナー袋・ブランケット等)",
            category: "starter_goods", category_label: "🎖️ スターターセット", price: 5980, cost_price: 1680, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.144, partner_commission: 860, margin_note: "粗利4,300円 (粗利71.9%＋Ali8%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
            tagline: "お迎え初日に必要な飼育小物をワンパッケージ！粗利4,300円の高収益スターターまとめ売り",
            features: ["抗菌ステンレス食器、ソフトスリッカーブラシ、コーム、爪切りセット", "土に還るコーンスターチ製生分解マナー袋120枚＋専用ディスペンサー", "保温フリースブランケット、噛み癖防止ロープトイ同梱", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 初心者 スターター セット グルーミング",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-dog-puppy-starter-kit.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+初心者+スターターキット", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+初心者+スターターキット/" }
          },
          {
            id: "item-toy-nosework", product_code: "PROD-CARROT-NOSEWORK-MAT", name: "ニンジン畑ノーズワーク知育マット (早食い防止＆嗅覚集中トレーニング)",
            category: "starter_goods", category_label: "🥕 知育ノーズワーク", price: 2980, cost_price: 850, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.143, partner_commission: 426, margin_note: "粗利2,130円 (粗利71.4%＋Ali9%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80",
            tagline: "15分のノーズワークで1時間の散歩に匹敵！雨の日の運動不足・ストレスを楽しく解消",
            features: ["ニンジンを引っこ抜いてポケットにおやつを隠す人気知育パズル", "嗅覚を使うことで早食いを防止し、脳の活性化と知能発達を促進", "底面滑り止めシリコングリップ加工・洗濯機で丸洗い可能", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 ノーズワーク ニンジン 知育マット",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-dog-nosework-carrot.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+ノーズワーク+にんじん", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+ノーズワーク+にんじん/" }
          },

          // --- 3. 季節イベント・歳時記ハウス・コスプレ ---
          {
            id: "ec-prod-23", product_code: "PROD-XMAS-SANTA-3D-COSTUME", name: "クリスマス愛犬サンタ＆トナカイ 3D服 (前足を通すだけ！2足歩行コスプレ)",
            category: "safety_outdoors", category_label: "🎄 季節イベント・衣装", price: 2480, cost_price: 520, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.158, partner_commission: 392, margin_note: "粗利1,960円 (粗利79%＋Ali9%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80",
            tagline: "前から見ると小さなサンタさんがトコトコ歩いてくる爆笑3D立体コスプレ！前足を通すだけ10秒装着",
            features: ["SNS・TikTok・Instagramで大バズり確定の立体2足歩行デザイン", "面ファスナー（マジックテープ）で首回りと胴回りを簡単サイズ調整", "肌触りの良いベルベット調フリースで着心地抜群", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 クリスマス コスプレ サンタ トナカイ",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-dog-christmas-costume.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+クリスマス+コスチューム", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+クリスマス+コスチューム/" }
          },
          {
            id: "ec-prod-24", product_code: "PROD-SEASONAL-HOUSE-6SET", name: "日本の歳時記 四季の折りたたみハウス6選 (Xmas・ハロウィン・七夕・節句等)",
            category: "starter_goods", category_label: "🎌 歳時記ハウス", price: 6800, cost_price: 1850, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.146, partner_commission: 990, margin_note: "粗利4,950円 (粗利72.7%＋Ali8%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
            tagline: "年間6大行事対応！厚さ5cmに折りたためるドール＆オーナメント付き年中行事ハウス",
            features: ["クリスマス・ハロウィン・七夕・端午の節句・ひな祭り・バレンタインの年間対応", "使わない時期は厚さ5cmにコンパクト収納可能", "ワンちゃんが安心して籠もれる防音・遮光ドーム構造", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 ペットハウス 折りたたみ 季節",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-pet-foldable-house.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=ペットハウス+折りたたみ", rakuten_url: "https://search.rakuten.co.jp/search/mall/ペットハウス+折りたたみ/" }
          },
          {
            id: "ec-prod-25", product_code: "PROD-HALLOWEEN-PUMPKIN-BED", name: "ハロウィン限定 かぼちゃ型ドームベッド (お化け＆コウモリ音鳴りトイ付)",
            category: "starter_goods", category_label: "🎃 ハロウィン限定", price: 3800, cost_price: 980, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.148, partner_commission: 564, margin_note: "粗利2,820円 (粗利74.2%＋Ali9%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80",
            tagline: "ジャック・オ・ランタンから顔を出す姿が激カワ！秋冬の冷気を遮断する超肉厚保温ボア",
            features: ["ハロウィン撮影会で大活躍！カボチャ型ドームで秋冬の防寒対策にも抜群", "弾力性に優れた高密度PP綿採用で型崩れしにくい構造", "付属のお化け＆コウモリの笛入りトイで楽しく遊べる", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 かぼちゃ ベッド ハロウィン ドーム",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-pumpkin-dog-bed.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+かぼちゃ+ベッド", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+かぼちゃ+ベッド/" }
          },

          // --- 4. 犬種別ステッカー（シール） ---
          {
            id: "item-sticker-corgi", product_code: "PROD-STICKER-CORGI-CAR", name: "コーギー おしり＆覗き見カーステッカー (防水・UV耐候3年仕様)",
            category: "safety_outdoors", category_label: "🏷️ 犬種別ステッカー", price: 1280, cost_price: 180, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.172, partner_commission: 220, margin_note: "粗利1,100円 (粗利85.9%＋Ali9%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80",
            tagline: "食パンお尻とひょっこり覗き見デザイン！煽り運転防止＆リアガラス装飾に大人気",
            features: ["雨・紫外線・洗車機にも耐える屋外看板グレードUVラミネートフィルム", "愛車のリアガラスや給油口、スーツケース、パソコンに貼れる", "糊残りしにくく綺麗に剥がせる再剥離仕様シート", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "コーギー ステッカー 車 防水",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-corgi-car-sticker.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=コーギー+車+ステッカー", rakuten_url: "https://search.rakuten.co.jp/search/mall/コーギー+車+ステッカー/" }
          },
          {
            id: "item-sticker-shiba", product_code: "PROD-STICKER-SHIBA-3SET", name: "柴犬 拒否柴＆ちんちんポーズシール3枚組 (スマホ・PC・車載用)",
            category: "safety_outdoors", category_label: "🏷️ 犬種別ステッカー", price: 980, cost_price: 120, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.176, partner_commission: 172, margin_note: "粗利860円 (粗利87.7%＋Ali9%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
            tagline: "散歩を断固拒否するムニッとした柴犬＋おやつおねだりポーズ！高利益・高回転の衝動買いグッズ",
            features: ["人気イラストレーター描き下ろしのイヤイヤ拒否柴デザイン3種セット", "高精細フルカラー印刷 ＆ 防水防傷マットコーティング", "スマホケースやノートPCにジャストフィットするサイズ感", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "柴犬 拒否柴 ステッカー シール",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-shiba-inu-sticker.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=柴犬+拒否柴+ステッカー", rakuten_url: "https://search.rakuten.co.jp/search/mall/柴犬+拒否柴+ステッカー/" }
          },

          // --- 5. 衛生・機能性ウェア・お散歩グッズ ---
          {
            id: "item-shoes-summer", product_code: "PROD-DOG-SHOES-MESH-3D", name: "愛犬用 3D通気メッシュ保護シューズ (アスファルト60℃熱傷＆冬季融雪剤ガード)",
            category: "safety_outdoors", category_label: "🦮 肉球ケア・シューズ", price: 2980, cost_price: 720, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.152, partner_commission: 452, margin_note: "粗利2,260円 (粗利75.8%＋Ali9%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80",
            tagline: "真夏の猛暑アスファルト熱傷や冬の融雪剤から肉球を徹底保護！断熱ラバーソール＋蒸れ防止立体メッシュ",
            features: ["耐熱・耐摩耗断熱ラバーソールで路面熱60℃から肉球を完全保護", "3D立体ハニカムメッシュで真夏でも靴内の蒸れ・熱気を即座に放出", "ダブルマジックテープ脱落防止ベルトで激しいダッシュでも脱げない", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 靴 夏 アスファルト メッシュ",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-dog-summer-shoes.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+靴+夏+メッシュ", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+靴+夏+メッシュ/" }
          },
          {
            id: "item-apparel-boa-dress", product_code: "PROD-BOA-DRESS-LIGHTGREY", name: "犬用 もこもこボアワンピース (ライトグレーホワイト・防寒静電気防止)",
            category: "safety_outdoors", category_label: "👗 機能性アパレル", price: 2480, cost_price: 580, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.153, partner_commission: 380, margin_note: "粗利1,900円 (粗利76.6%＋Ali9%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
            tagline: "冬の寒がり小型犬（プードル・チワワ）向け極暖ウェア！お散歩時の静電気・被毛汚れをガード",
            features: ["軽くて暖かい極細マイクロフリースボア素材採用", "お腹側ゴムギャザー仕様でオシッコがかかりにくい親切裁断", "伸縮性に優れ、手足を通しやすく愛犬の動きを妨げない", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 服 ワンピース ボア 冬",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-dog-winter-dress.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+服+ボア+ワンピース", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+服+ボア+ワンピース/" }
          },
          {
            id: "ec-prod-19-carbed", product_code: "PROD-CAR-DRIVE-BED-360", name: "360°雲型ふかふかドライブベッド (急ブレーキ転落防止・カフェマット兼用)",
            category: "safety_outdoors", category_label: "🚗 ドライブベッド", price: 6480, cost_price: 1850, supplier_name: "AliExpress Choice直送 / 国内問屋提携",
            partner_margin_rate: 0.143, partner_commission: 926, margin_note: "粗利4,630円 (粗利71.5%＋Ali9%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
            tagline: "急ブレーキ時の転落・車酔いを防ぐ厚型PP綿クッション！ファスナー全開でドッグカフェ寛ぎマット兼用",
            features: ["シートベルト固定ベルト＆飛び出し防止リードフック2本標準装備", "四方を囲むボリュームクッションで車揺れや急カーブ時の衝撃を吸収", "底面防水滑り止め加工・外カバーを取り外して洗濯機で丸洗い可能", "AliExpress無在庫直送 ＋ 楽天市場・Amazon即日配送に対応"],
            channel_type: "hybrid_aliexpress", affiliate_search: "犬 ドライブベッド 車載 ドライブシート",
            aliexpress_url: "https://ja.aliexpress.com/w/wholesale-dog-car-seat-bed.html",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+ドライブベッド", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+ドライブベッド/" }
          },

          // --- 6. 【国内アフィリエイト限定】生物・食品・おやつ・電波機器（法令完全クリア） ---
          {
            id: "ec-prod-26", product_code: "PROD-PREMIUM-GLOBAL-TREATS", name: "欧米プレミアム厳選おやつBOX (NZ産フリーズドライ・ヒマラヤヤクチーズ等)",
            category: "food_treats", category_label: "🍖 国内検疫適合おやつ", price: 4500, cost_price: 3600, supplier_name: "農水省検疫クリア国内正規輸入元",
            partner_margin_rate: 0.050, partner_commission: 225, margin_note: "楽天/Amazonアフィリ(2〜8%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80",
            tagline: "【動植物検疫完全クリア】農水省適合の国内正規輸入品のみを厳選！肉類没収リスクゼロの安全BOX",
            features: ["ペットフード安全法・家畜伝染病予防法に完全準拠した国内正規代理店流通品", "ニュージーランド産グラスフェッドビーフのフリーズドライ＆ヒマラヤ産無添加ヤクチーズ", "人工保存料・合成着色料・香料一切不使用", "国内発送（楽天市場・Amazon公式）で最短翌日お届け"],
            channel_type: "domestic_affiliate_only", affiliate_search: "犬 フリーズドライ おやつ プレミアム ヤクチーズ",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+フリーズドライ+おやつ+プレミアム", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+フリーズドライ+おやつ+プレミアム/" }
          },
          {
            id: "ec-prod-27", product_code: "PROD-SENJU-JERKY-4BOX", name: "千住直製 国産無添加ジャーキー4種BOX (エゾ鹿・ささみ・天然鮭・米粉クッキー)",
            category: "food_treats", category_label: "🥉 千住厨房直製ジャーキー", price: 3480, cost_price: 520, supplier_name: "千住古民家WanTea厨房（飼料製造届出済）",
            partner_margin_rate: 0.170, partner_commission: 592, margin_note: "自社直販粗利85% / 楽天Amazon併売", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=800&q=80",
            tagline: "【愛がん動物用飼料製造届済】千住古民家厨房で低温熟成乾燥！高タンパク・低アレルゲンの極上おやつ",
            features: ["北海道産エゾ鹿肉・宮崎県産ささみ・北海道産秋鮭・自家製米粉クッキー", "食品乾燥機で70℃・12時間低温乾燥。保存料・食塩・小麦粉完全ゼロ", "パピーの知育トレーニングやお迎え記念ギフトに最適", "千住古民家直営店頭受取・自社配送 ＆ 楽天/Amazon併売"],
            channel_type: "domestic_direct_and_affiliate", affiliate_search: "犬 無添加 ジャーキー 鹿肉 ささみ 国産",
            affiliate: { amazon_url: "https://www.amazon.co.jp/s?k=犬+無添加+ジャーキー+国産", rakuten_url: "https://search.rakuten.co.jp/search/mall/犬+無添加+ジャーキー+国産/" }
          },
          {
            id: "ec-prod-17", product_code: "PROD-PET-INSURANCE", name: "アニコム・アイペット正規取次 ペット保険 店頭相談・申込サポート窓口",
            category: "insurance", category_label: "🥇 ペット保険代理店", price: 0, cost_price: 0, supplier_name: "正規代理店受託（手数料直振込）",
            partner_margin_rate: 1.0, partner_commission: 10000, margin_note: "契約成立で5,000〜15,000円直振込 (原価0円・利益率100%)", is_featured: 1,
            image_url: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80",
            tagline: "原価0円・在庫0個。店頭タブレットで10分簡単申込！お迎え当日契約率60〜70%",
            features: ["アニコム損保（どうぶつ健保）＆ アイペット損保 正規取扱", "動物病院での窓口精算（対応病院全国多数）に対応", "パピー期のかかりやすい誤飲・骨折・胃腸炎トラブルを手厚く補償", "成約1件につき5,000〜15,000円の手数料が店舗口座へ直振込"]
          }
        ];

        let filtered = allProds;
        if (cat !== 'all') filtered = filtered.filter(p => p.category === cat);
        if (search) {
          const terms = search.toLowerCase().split(/[\s\u3000]+/).filter(t => t.length > 0);
          if (terms.length > 0) {
            filtered = filtered.filter(p => {
              const text = `${p.name} ${p.tagline} ${p.category_label || ''} ${(p.features || []).join(' ')}`.toLowerCase();
              return terms.every(term => text.includes(term));
            });
          }
        }

        return jsonResponse({ status: "success", count: filtered.length, data: filtered });
      }

      // (O) 🛍️ 商品詳細: /api/shop/product
      if (urlStr.startsWith('/api/shop/product')) {
        const urlObj = new URL(urlStr, 'http://localhost');
        const pId = urlObj.searchParams.get('productId') || 'ec-prod-01';
        const found = allProds.find(p => p.id === pId) || allProds[0];
        return jsonResponse({
          status: "success",
          data: found
        });
      }

      // (P) 🛍️ 商品注文: /api/shop/order (粗利20%シェア計算)
      if (urlStr === '/api/shop/order') {
        const body = options.body ? JSON.parse(options.body) : {};
        const pId = body.productId || "ec-prod-01";
        const q = Number(body.quantity || 1);
        const prod = allProds.find(p => p.id === pId) || allProds[0];
        const p = prod.price;
        const c = prod.cost_price || Math.round(p * 0.7);
        const total = p * q;
        const totalCost = c * q;
        const grossProfit = Math.max(0, total - totalCost);
        const margin = prod.partner_commission ? prod.partner_commission * q : Math.round(grossProfit * 0.20);
        const rateStr = total > 0 ? (Math.round((margin / total) * 1000) / 10) + "% (粗利20%シェア)" : "0%";
        return jsonResponse({
          status: "success",
          data: {
            orderId: "ORD-EC-" + Date.now().toString().slice(-6),
            totalAmount: total,
            totalCost: totalCost,
            grossProfit: grossProfit,
            partnerCommissionEarned: margin,
            partnerCommissionRate: rateStr,
            platformProfit: grossProfit - margin,
            status: "confirmed"
          }
        });
      }

      // (Q) 📹 Tapoデバイス一覧: /api/tapo/devices
      if (urlStr.startsWith('/api/tapo/devices')) {
        return jsonResponse({
          status: "success",
          count: 5,
          data: [
            { id: "tapo-c120-01", device_model: "Tapo C120", device_type: "camera_fixed_magnet", device_name: "産室1号 天井マグネットカメラ (C120)", location_name: "千住犬舎 産室ケージ01", status: "online", temp_celsius: 29.6, humidity_pct: 54.8, privacy_mode: 0, hls_live_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=85", assigned_dog_id: "dog-001" },
            { id: "tapo-c220-02", device_model: "Tapo C220", device_type: "camera_pan_tilt", device_name: "育成サークル 2K 360°追尾カメラ (C220)", location_name: "千住犬舎 育成サークルA", status: "online", temp_celsius: 25.2, humidity_pct: 51.0, privacy_mode: 0, hls_live_url: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=1200&q=85", assigned_dog_id: "dog-003" },
            { id: "tapo-c120-03", device_model: "Tapo C120", device_type: "camera_fixed_magnet", device_name: "産室2号 授乳見守りカメラ (C120)", location_name: "千住犬舎 産室ケージ02", status: "online", temp_celsius: 29.2, humidity_pct: 56.5, privacy_mode: 0, hls_live_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85", assigned_dog_id: "dog-005" },
            { id: "tapo-t315-01", device_model: "Tapo T315", device_type: "sensor_temp_humidity", device_name: "産室1号 スマート温湿度ハブ (T315)", location_name: "千住犬舎 産室ケージ01", status: "online", temp_celsius: 29.6, humidity_pct: 54.8, privacy_mode: 0, assigned_dog_id: "dog-001" },
            { id: "tapo-c520ws-01", device_model: "Tapo C520WS", device_type: "camera_outdoor", device_name: "屋外ドッグラン 2K 360°中継カメラ (C520WS)", location_name: "千住犬舎 縁側屋外ドッグラン", status: "online", temp_celsius: 23.8, humidity_pct: 48.0, privacy_mode: 0, hls_live_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85", assigned_dog_id: "dog-007" }
          ]
        });
      }

      // (R) 🎥 Tapoトークン発行: /api/tapo/stream/token
      if (urlStr === '/api/tapo/stream/token') {
        return jsonResponse({
          status: "success",
          data: {
            sessionId: "sess-demo-9921",
            accessToken: "tapo2k_demo_" + Math.random().toString(36).slice(2),
            deviceName: "産室1号 天井マグネットカメラ (Tapo C120)",
            durationMinutes: 30,
            tempCelsius: 29.6,
            humidityPct: 54.8,
            privacyMode: false,
            streamUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=85"
          }
        });
      }

      // (S) 📱 愛犬デジタルパスポート: /api/partner/passport
      if (urlStr.startsWith('/api/partner/passport')) {
        const urlObj = new URL(urlStr, 'http://localhost');
        const dId = urlObj.searchParams.get('dogId') || 'dog-001';
        return jsonResponse({
          status: "success",
          data: {
            dogId: dId,
            passport_code: "WB-PASS-" + dId.toUpperCase(),
            registeredName: "モコちゃん (タイニープードル)",
            breed: "タイニープードル",
            gender: "female",
            birthDate: "2026-06-15",
            microchipNumber: "392144000192831",
            healthGrade: "All-A (優良)",
            patellaGrade: "Grade 0 (正常)",
            heartMurmur: "心音清純",
            vaccineVerified: true,
            rabiesVaccineDate: "2026-08-25 (済)",
            mixedVaccineDate: "2026-08-25 (5種済)",
            clinicName: "WanBridge 提携中央動物医療センター (獣医師 署名済)",
            ownerName: "佐藤 健一様",
            pointsEarned: 250,
            status: "active"
          }
        });
      }

      // (T) 📜 パピー社会化卒業認定証: /api/puppy/diploma
      if (urlStr.startsWith('/api/puppy/diploma')) {
        const urlObj = new URL(urlStr, 'http://localhost');
        const dId = urlObj.searchParams.get('dogId') || 'dog-001';
        return jsonResponse({
          status: "success",
          data: {
            diplomaId: "DIP-2026-" + dId.toUpperCase(),
            dogId: dId,
            dogName: "モコちゃん",
            breed: "タイニープードル",
            birthDate: "2026-06-15",
            graduationDate: "2026-09-01",
            kennelName: "オーガニックフォレスト犬舎",
            breederName: "森本 和夫",
            praStatus: "ノーマル/クリア (発症リスクゼロ確定)",
            weightAtGraduation: 685,
            pedigreeNumber: "JKC-TP-2026-9921",
            socializationScore: "100% 達成",
            skills: [
              { skill: "トイレシート成功率", grade: "95% (ケージ内自律排泄確立)" },
              { skill: "クレート夜鳴きゼロ", grade: "クリア (8時間連続睡眠)" },
              { skill: "お手入れ・マズルタッチ", grade: "クリア (嫌がりゼロ)" },
              { skill: "生活音慣れ (掃除機/ベル)", grade: "クリア (過剰反応なし)" }
            ]
          }
        });
      }

      // (U) 🔄 スタッフローテーション＆鍵管理: /api/partner/staff/rotation
      if (urlStr.startsWith('/api/partner/staff/rotation')) {
        return jsonResponse({
          status: "success",
          data: {
            storeId: "store-01",
            storeName: "千住古民家ドッグカフェ WanTea ＆ パピー犬舎",
            rotationCycle: "2026年9月第2週 (9/7〜9/13)",
            compliance: {
              interval11hOk: true,
              consecutiveMaxDays: 3,
              weekendBalanceScore: "100点 (全スタッフ土日均等)",
              laborStandardsPassed: true
            },
            today: {
              date: "2026-09-07 (月)",
              isOpen: true,
              shifts: [
                {
                  id: "shift-today-01",
                  type: "early",
                  name: "🌅 早番 (犬舎開錠・朝点呼・給餌)",
                  time: "08:30 〜 14:30",
                  staff: "高橋 志保",
                  role: "愛玩動物看護師 / チーフ",
                  isVetNurse: true,
                  status: "勤務中 (14:30まで)",
                  keyPin: "884192",
                  keyValidTime: "08:00 〜 15:00",
                  keyStatus: "有効 (08:26 開錠確認済)"
                },
                {
                  id: "shift-today-02",
                  type: "late",
                  name: "🌙 遅番 (カフェ接客・夕給餌・施錠)",
                  time: "13:30 〜 20:30",
                  staff: "田中 美咲",
                  role: "JKC公認トリマー / パート",
                  isTrimmer: true,
                  status: "出勤前 (13:00有効化)",
                  keyPin: "452810",
                  keyValidTime: "13:00 〜 21:00",
                  keyStatus: "待機中 (まもなく出勤)"
                }
              ],
              goldenOverlap: {
                time: "13:30 〜 16:00 (2.5時間)",
                headcount: 2,
                detail: "カフェ来店集中＆パピーふれあい安全2名体制（高橋・田中）"
              }
            },
            weeklySchedule: [
              { date: "9/7 (月)", early: "高橋 (看護師)", late: "田中 (トリマー)", overlap: "13:30-16:00 (2名)", qualCheck: "看護師常駐 ✅" },
              { date: "9/8 (火)", early: "佐藤 (実習生)", late: "高橋 (看護師)", overlap: "13:30-16:00 (2名)", qualCheck: "責任者配置 ✅" },
              { date: "9/9 (水)", early: "田中 (トリマー)", late: "佐藤 (実習生)", overlap: "13:30-16:00 (2名)", qualCheck: "トリマー常駐 ✅" },
              { date: "9/10 (木)", early: "高橋 (看護師)", late: "奥様 (運営統括)", overlap: "13:30-16:00 (2名)", qualCheck: "専従者・看護師 ✅" },
              { date: "9/11 (金)", early: "佐藤 (実習生)", late: "田中 (トリマー)", overlap: "13:30-16:00 (2名)", qualCheck: "トリマー常駐 ✅" },
              { date: "9/12 (土)", early: "Kazuo (オーナー)", late: "高橋 (看護師)", overlap: "13:30-16:30 (商談ピーク 2名)", qualCheck: "動愛法責任者 ✅" },
              { date: "9/13 (日)", early: "奥様 (統括)", late: "佐藤 (実習生)", overlap: "13:30-16:30 (満席対応 2名)", qualCheck: "ペアリング完了 ✅" }
            ],
            handover: {
              id: "ho-20260907",
              lastUpdated: "2026-09-07 13:35",
              sender: "高橋 志保 (早番)",
              receiver: "田中 美咲 (遅番)",
              status: "pending_ack",
              vitals: "パピー全頭（モコ、ポチ、レオ、チビ）検温平熱38.2℃〜38.5℃。朝給餌完食・投薬完了。",
              poopAI: "うんちスコア96点（全員バナナ状正常便）。AI写真ログ判定済。",
              sanitation: "午前ケージシーツ交換100%完了。カフェ床スチーム除菌済。",
              customerNotes: "15:00にタイニープードル見学希望の鈴木様ご来店予定（案内カルテ準備済）。",
              cashDrawer: "レジ釣銭点検 30,000円 (差異0円確認済)"
            },
            smartLockPins: [
              { staff: "高橋 志保", slot: "早番", pin: "884192", validFrom: "08:00", validTo: "15:00", status: "アクティブ (08:26解錠)", unlockTime: "08:26:14" },
              { staff: "田中 美咲", slot: "遅番", pin: "452810", validFrom: "13:00", validTo: "21:00", status: "待機中 (未入室)", unlockTime: "-" },
              { staff: "Kazuo (オーナー)", slot: "マスター", pin: "••••••••", validFrom: "常時", validTo: "無期限", status: "常時有効", unlockTime: "昨夜 21:10" }
            ],
            staffPool: [
              { name: "Kazuo様", role: "オーナー / 動物取扱責任者", daysMonth: "自由 (商談・統括)", weekendRatio: "月2回" },
              { name: "奥様", role: "代表社員 / 運営統括専従者", daysMonth: "月4〜6日", weekendRatio: "月2回 (日曜)" },
              { name: "高橋 志保", role: "愛玩動物看護師 (パート)", daysMonth: "月10日 (週2〜3日)", weekendRatio: "月3回 (土日各2)" },
              { name: "佐藤 健太", role: "ドッグスクール実習生 (バイト)", daysMonth: "月8日 (週2日)", weekendRatio: "月3回" },
              { name: "田中 美咲", role: "JKC公認トリマー (パート)", daysMonth: "月8日 (週2日)", weekendRatio: "月2回" }
            ]
          }
        });
      }

      // (V) 申し送り受領確認: POST /api/partner/staff/handover/confirm
      if (urlStr.startsWith('/api/partner/staff/handover/confirm')) {
        return jsonResponse({
          status: "success",
          message: "朝夕申し送りの受領を確認しました。夕方業務へ引き継ぎ完了。",
          data: { acknowledgedAt: new Date().toLocaleTimeString('ja-JP'), status: "acknowledged" }
        });
      }

      // (W) 当日急募LINE配信: POST /api/partner/staff/sos
      if (urlStr.startsWith('/api/partner/staff/sos')) {
        return jsonResponse({
          status: "success",
          message: "【当日急募】LINE一斉配信完了！待機スタッフ5名へ要請通知（緊急手当+2,000円付与）を送信しました。",
          data: { broadcastCount: 5, emergencyBonus: 2000, notifiedAt: new Date().toLocaleTimeString('ja-JP') }
        });
      }

      // (X) AIローテーション最適化生成: POST /api/partner/staff/generate
      if (urlStr.startsWith('/api/partner/staff/generate')) {
        return jsonResponse({
          status: "success",
          message: "AIシフト最適化を実行しました。インターバル11h・土日均等配分・資格要件を100%充足したローテーションを更新しました。",
          data: { optimizedAt: new Date().toLocaleTimeString('ja-JP') }
        });
      }

      // (Y) 🐾 買い手先行ウェイトリスト: /api/waitlist
      if (urlStr.startsWith('/api/waitlist')) {
        if (method === 'POST') {
          const body = options.body ? JSON.parse(options.body) : {};
          const newRecord = {
            id: "wait-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
            userName: body.userName || body.name || "お迎え希望者様",
            contact: body.contact || "",
            desiredBreed: body.desiredBreed || body.breed || "トイプードル",
            desiredSize: body.desiredSize || body.size || "指定なし",
            desiredGender: body.desiredGender || body.gender || "どちらでも",
            budgetMax: Number(body.budgetMax || body.budget || 400000),
            preferredTimeline: body.preferredTimeline || body.timeline || "良いご縁があれば",
            prefecture: body.prefecture || "東京都・関東近郊",
            memo: body.memo || "",
            status: "waiting",
            createdAt: new Date().toLocaleString('ja-JP')
          };
          try {
            const cur = JSON.parse(localStorage.getItem('wanbridge_waitlist_records') || '[]');
            cur.unshift(newRecord);
            localStorage.setItem('wanbridge_waitlist_records', JSON.stringify(cur));
            console.log("✅ [WanBridge] ウェイトリストを localStorage に永続保存完了:", newRecord);
          } catch(e) {
            console.error("localStorage save error", e);
          }
          return jsonResponse({
            status: "success",
            message: "お迎えウェイトリストへ優先登録いたしました。提携ブリーダーより条件に合致する子犬が生まれ次第、優先案内いたします！",
            data: newRecord
          });
        }
        if (urlStr === '/api/waitlist/stats') {
          let extraCount = 0;
          try {
            const cur = JSON.parse(localStorage.getItem('wanbridge_waitlist_records') || '[]');
            extraCount = cur.length;
          } catch(e) {}
          return jsonResponse({
            status: "success",
            data: {
              totalWaiting: 18 + extraCount,
              topBreeds: [
                { desired_breed: "トイプードル (タイニー/ティーカップ)", count: 9 + extraCount },
                { desired_breed: "豆柴", count: 5 },
                { desired_breed: "チワワ", count: 3 },
                { desired_breed: "ポメラニアン", count: 1 }
              ],
              averageBudget: 420000
            }
          });
        }
        let localList = [];
        try {
          localList = JSON.parse(localStorage.getItem('wanbridge_waitlist_records') || '[]');
        } catch(e) {}
        const defaultList = [
          { id: "wait-01", user_name: "高橋 綾乃様", desired_breed: "タイニープードル (アプリコット・メス)", budget_max: 450000, preferred_timeline: "2ヶ月以内", prefecture: "東京都足立区", status: "waiting" },
          { id: "wait-02", user_name: "中村 健二様", desired_breed: "豆柴 (赤・オス)", budget_max: 380000, preferred_timeline: "良い子がいれば", prefecture: "埼玉県川口市", status: "waiting" },
          { id: "wait-03", user_name: "小林 美紀様", desired_breed: "ティーカッププードル (レッド・メス)", budget_max: 550000, preferred_timeline: "1ヶ月以内", prefecture: "千葉県松戸市", status: "waiting" }
        ];
        const combined = [
          ...localList.map(r => ({
            id: r.id,
            user_name: r.userName,
            desired_breed: r.desiredBreed,
            budget_max: r.budgetMax,
            preferred_timeline: r.preferredTimeline,
            prefecture: r.prefecture,
            status: r.status
          })),
          ...defaultList
        ];
        return jsonResponse({
          status: "success",
          count: combined.length,
          data: combined
        });
      }

      // デフォルト: 空または汎用成功レスポンス
      return jsonResponse({ status: "success", message: "Mock API Handled", data: [] });

    } catch (err) {
      console.warn("[WanBridge Mock API Error]", err);
      return originalFetch.apply(this, arguments);
    }
  };
})();
