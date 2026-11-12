/**
 * WanBridge - ブリーダー専用「仮名称 ＆ 1タップカルーセル照合」LINE Bot対話シミュレータ
 * スマホで撮った写真を送るだけで、15秒で体重・写真登録・SNS自動投稿が完了するUXを再現
 */

export class LineSimulator {
  constructor(container, dogs, onRegisterSuccess) {
    this.container = container;
    this.dogs = dogs || [];
    this.onRegisterSuccess = onRegisterSuccess;
    this.mode = 'breeder'; // 'breeder' (仮名称・写真・体重更新) | 'owner_crm' (誕生日・フード・犬洋服CRM)
    this.step = 0; // 0: 初期(写真待機), 1: カルーセル選択, 2: 体重入力, 3: 完了・SNSパイプライン発動
    this.selectedDog = null;
    this.uploadedPhoto = null;
    this.inputWeight = null;
    this.activeCrmDogId = 'dog-001'; // デフォルト: 青リボンくん
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  setMode(mode, targetDogId = null) {
    this.mode = mode;
    if (targetDogId) {
      this.activeCrmDogId = targetDogId;
    }
    this.render();
  }

  render() {
    const isBreeder = this.mode === 'breeder';
    const activeDog = this.dogs.find(d => d.id === this.activeCrmDogId) || this.dogs[0] || { temporaryName: 'ワンちゃん', id: 'dog-001' };

    this.container.innerHTML = `
      <div class="bg-stone-100 rounded-2xl overflow-hidden shadow-2xl border border-stone-200 max-w-md mx-auto flex flex-col h-[670px] font-sans">
        <!-- LINE風 ヘッダー -->
        <div class="bg-[#2c3e50] text-white px-4 py-2.5 shadow-md flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full ${isBreeder ? 'bg-emerald-500' : 'bg-amber-500'} flex items-center justify-center text-white font-bold text-sm shadow">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <div class="font-bold text-xs leading-tight flex items-center gap-1">
                  ${isBreeder ? 'WanBridge ブリーダー公式Bot' : 'WanBridge 愛犬ライフ公式Bot'}
                  <span class="${isBreeder ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30' : 'bg-amber-400/20 text-amber-300 border-amber-400/30'} text-[9px] px-1.5 py-0.2 rounded-full border">認証済</span>
                </div>
                <div class="text-[10px] text-stone-300">
                  ${isBreeder ? '仮名称＆1タップ照合 (15秒登録)' : 'ライフステージ連動・誕生日＆適正時期ご案内'}
                </div>
              </div>
            </div>
            <button id="sim-reset-btn" class="text-[11px] bg-white/10 hover:bg-white/20 text-stone-200 px-2 py-1 rounded transition">
              最初から
            </button>
          </div>

          <!-- モード切替タブバー -->
          <div class="grid grid-cols-2 gap-1.5 mt-2.5 p-1 bg-stone-900/40 rounded-xl text-xs font-bold">
            <button type="button" id="tab-mode-breeder" class="py-1.5 rounded-lg transition text-center ${isBreeder ? 'bg-emerald-600 text-white shadow' : 'text-stone-300 hover:text-white'}">
              📷 ブリーダー更新
            </button>
            <button type="button" id="tab-mode-crm" class="py-1.5 rounded-lg transition text-center ${!isBreeder ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-stone-300 hover:text-white'}">
              🎂 飼い主LINE配信CRM
            </button>
          </div>
        </div>

        <!-- 飼い主CRMモード時：対象犬セレクター -->
        ${!isBreeder ? `
          <div class="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center justify-between text-[11px] flex-shrink-0">
            <div class="flex items-center gap-1.5 text-stone-700 font-bold">
              <span>🐶 配信先ワンちゃん:</span>
              <select id="sim-crm-dog-select" class="bg-white border border-amber-300 rounded-lg px-2 py-1 text-stone-900 font-bold outline-none text-xs">
                ${this.dogs.map(d => `
                  <option value="${d.id}" ${d.id === this.activeCrmDogId ? 'selected' : ''}>
                    ${d.temporaryName} (${d.breed} / ${d.predictedSizeCategory || 'タイニー予測'})
                  </option>
                `).join('')}
              </select>
            </div>
            <span class="bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">提携カフェ粗利20%還元連動</span>
          </div>
        ` : ''}

        <!-- LINE風 トークタイムライン -->
        <div id="sim-messages" class="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#8cabd9]/20 text-stone-800 text-xs">
          ${isBreeder ? `
            <!-- ブリーダーモード初期メッセージ -->
            <div class="flex items-start gap-2 animate-fade-in">
              <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">Bot</div>
              <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] space-y-1">
                <p class="font-bold text-stone-900 text-xs">提携ブリーダー様、お疲れ様です！🐶</p>
                <p class="text-stone-600 leading-relaxed text-[11px]">
                  子犬の写真をスマホで撮影したら、下の【📷 写真を送信する】を押してください。登録中の仮名称カルーセルが自動表示されます。
                </p>
              </div>
            </div>
          ` : `
            <!-- 飼い主CRMモード初期メッセージ -->
            <div class="flex items-start gap-2 animate-fade-in">
              <div class="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex-shrink-0 flex items-center justify-center text-[10px] font-black">Bot</div>
              <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[88%] space-y-1.5">
                <div class="font-black text-stone-900 text-xs flex items-center gap-1">
                  <span>✨</span> WanBridge 愛犬ライフコンシェルジュ
                </div>
                <p class="text-stone-600 leading-relaxed text-[11px]">
                  【${activeDog.temporaryName}ちゃん】のライフステージに合わせて、お誕生日メニュー・成犬フード定期便・ジャストサイズ犬服の自動配信テストを行えます。
                </p>
                <p class="text-[10px] text-amber-800 font-bold bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                  💡 ここで自社ストア注文が発生すると、提携ドッグカフェ（WanTea）に粗利の20%（売上換算 約5〜10%）がキックバック計上されます！
                </p>
              </div>
            </div>
          `}
        </div>

        <!-- 操作フッター -->
        <div id="sim-footer" class="bg-white border-t border-stone-200 p-2.5 flex-shrink-0">
          <div id="sim-controls" class="w-full">
            ${isBreeder ? `
              <button id="sim-send-photo-btn" class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                📷 スマホで撮った写真を送信する (Step 1)
              </button>
            ` : `
              <div class="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5 scrollbar-thin">
                <!-- ライフステージCRM (上段) -->
                <div class="flex items-center justify-between text-[10px] font-bold text-stone-500">
                  <span>① ライフステージ定期便 (お誕生日・物販)</span>
                  <span class="text-amber-700">カフェ粗利20%還元</span>
                </div>
                <div class="grid grid-cols-3 gap-1">
                  <button type="button" id="btn-crm-trigger-birthday" class="bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold p-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition">
                    <span>🎂</span><span>お誕生日</span>
                  </button>
                  <button type="button" id="btn-crm-trigger-food" class="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold p-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition">
                    <span>🥣</span><span>成犬フード</span>
                  </button>
                  <button type="button" id="btn-crm-trigger-apparel" class="bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 font-bold p-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition">
                    <span>👕</span><span>骨格確定服</span>
                  </button>
                </div>

                <!-- お迎え初期30日ステップ動画 (中段) -->
                <div class="flex items-center justify-between text-[10px] font-bold text-stone-500 pt-1 border-t border-stone-100">
                  <span>② お迎え初期30日ステップ動画</span>
                  <span class="text-indigo-600">ホームシック防止</span>
                </div>
                <div class="grid grid-cols-3 gap-1">
                  <button type="button" class="btn-step-video bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold p-1 rounded-lg text-[10px] text-center" data-day="1">
                    🌙 Day1 夜泣き
                  </button>
                  <button type="button" class="btn-step-video bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold p-1 rounded-lg text-[10px] text-center" data-day="2">
                    🥣 Day2 ふやかし
                  </button>
                  <button type="button" class="btn-step-video bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold p-1 rounded-lg text-[10px] text-center" data-day="3">
                    🐕 Day3 トイレ
                  </button>
                  <button type="button" class="btn-step-video bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold p-1 rounded-lg text-[10px] text-center" data-day="7">
                    🏥 Day7 健診
                  </button>
                  <button type="button" class="btn-step-video bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold p-1 rounded-lg text-[10px] text-center" data-day="14">
                    🦷 Day14 甘噛み
                  </button>
                  <button type="button" class="btn-step-video bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold p-1 rounded-lg text-[10px] text-center" data-day="30">
                    💉 Day30 ワクチン
                  </button>
                </div>

                <!-- 🚨 緊急SOSホットライン (下段・赤) -->
                <div class="pt-1 border-t border-stone-100">
                  <button type="button" id="btn-crm-trigger-sos" class="w-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black py-1.5 rounded-lg text-[10px] shadow-sm transition flex items-center justify-center gap-1">
                    <span>🚨</span>
                    <span>緊急SOSホットライン（飼育困難・100%里帰り無償引取）</span>
                  </button>
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- LINE風 公式リッチメニュー展開トグル -->
        <div class="bg-white border-t border-stone-200 flex-shrink-0">
          <div id="sim-rich-menu-panel" class="hidden border-b border-stone-200 bg-stone-50 overflow-hidden animate-fade-in">
            <img src="./assets/images/WanBridge公式LINEリッチメニュー_6分割デザイン.jpg" alt="WanBridge公式LINEリッチメニュー" class="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition" />
          </div>
          <button type="button" id="btn-toggle-rich-menu" class="w-full py-1.5 text-center text-[10px] font-bold text-stone-600 hover:text-stone-900 bg-stone-100/90 hover:bg-stone-200/90 transition flex items-center justify-center gap-1 border-t border-stone-200/60">
            <span>📱 公式LINEメニューを開く/閉じる</span>
          </button>
        </div>
      </div>
    `;

    this.messagesContainer = this.container.querySelector('#sim-messages');
    this.controlsContainer = this.container.querySelector('#sim-controls');
    this.bindEvents();
  }

  bindEvents() {
    // リッチメニュー開閉
    const toggleRichMenuBtn = this.container.querySelector('#btn-toggle-rich-menu');
    const richMenuPanel = this.container.querySelector('#sim-rich-menu-panel');
    if (toggleRichMenuBtn && richMenuPanel) {
      toggleRichMenuBtn.addEventListener('click', () => {
        richMenuPanel.classList.toggle('hidden');
      });
    }

    // リセットボタン
    const resetBtn = this.container.querySelector('#sim-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    // モード切替タブ
    const tabBreeder = this.container.querySelector('#tab-mode-breeder');
    const tabCrm = this.container.querySelector('#tab-mode-crm');
    if (tabBreeder) {
      tabBreeder.addEventListener('click', () => {
        if (this.mode !== 'breeder') {
          this.mode = 'breeder';
          this.step = 0;
          this.render();
        }
      });
    }
    if (tabCrm) {
      tabCrm.addEventListener('click', () => {
        if (this.mode !== 'owner_crm') {
          this.mode = 'owner_crm';
          this.render();
        }
      });
    }

    // ブリーダーモード：写真送信
    const sendPhotoBtn = this.container.querySelector('#sim-send-photo-btn');
    if (sendPhotoBtn) {
      sendPhotoBtn.addEventListener('click', () => this.handleSendPhoto());
    }

    // 飼い主CRMモード：ワンちゃんセレクト
    const dogSelect = this.container.querySelector('#sim-crm-dog-select');
    if (dogSelect) {
      dogSelect.addEventListener('change', (e) => {
        this.activeCrmDogId = e.target.value;
        this.render();
      });
    }

    // 飼い主CRMモード：トリガーボタン群
    const btnBday = this.container.querySelector('#btn-crm-trigger-birthday');
    if (btnBday) btnBday.addEventListener('click', () => this.handleCrmTrigger('birthday'));

    const btnFood = this.container.querySelector('#btn-crm-trigger-food');
    if (btnFood) btnFood.addEventListener('click', () => this.handleCrmTrigger('food_upgrade'));

    const btnApparel = this.container.querySelector('#btn-crm-trigger-apparel');
    if (btnApparel) btnApparel.addEventListener('click', () => this.handleCrmTrigger('apparel_size'));

    // お迎え初期30日ステップ動画ボタン
    this.container.querySelectorAll('.btn-step-video').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day, 10) || 1;
        this.handleStepVideo(day);
      });
    });

    // 🚨 緊急SOSホットラインボタン
    const btnSos = this.container.querySelector('#btn-crm-trigger-sos');
    if (btnSos) {
      btnSos.addEventListener('click', () => this.handleSosTriggerPrompt());
    }
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      setTimeout(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }, 50);
    }
  }

  // ==========================================
  // 💌 飼い主CRMモード：メッセージ配信＆注文UX
  // ==========================================
  async handleCrmTrigger(messageType) {
    const dog = this.dogs.find(d => d.id === this.activeCrmDogId) || this.dogs[0] || { temporaryName: 'ワンちゃん', id: 'dog-001' };

    // APIからCRMメッセージデータを取得
    let data = null;
    try {
      const res = await fetch('/api/crm/send-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogId: dog.id, messageType: messageType, storeId: 'store-01' })
      });
      const json = await res.json();
      if (json.status === 'success') {
        data = json.lineNotification;
      }
    } catch (e) {
      console.warn('API error, falling back to local simulation', e);
    }

    // フォールバックデータ
    if (!data) {
      if (messageType === 'birthday') {
        data = {
          badge: "🎂 お誕生日お祝い (14日前〜当日)",
          title: `🎉 HAPPY BIRTHDAY! ${dog.temporaryName}ちゃん 1歳記念！`,
          summary: "提携カフェのネーム入りバースデーケーキ予約 ＆ AIフォトブース無料撮影クーポン",
          body: `${dog.temporaryName}ちゃん、もうすぐ特別な1歳のお誕生日ですね！✨\n千住古民家ドッグカフェ WanTea より、愛犬用無添加バースデーケーキ（事前予約20%OFF）と、AI高画質フォトブースでの無料記念撮影クーポンをお届けします。`,
          imageUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80",
          actionLabel: "カフェのバースデー席・ケーキを予約する ➔",
          productRecommendation: {
            name: "お祝いネーム入り！豆乳クリームのバースデーケーキ",
            price: 1800,
            discountPrice: 1440,
            costPrice: 600,
            partnerMargin: 168
          }
        };
      } else if (messageType === 'food_upgrade') {
        data = {
          badge: "🥣 成犬フード切り替え (生後10〜12ヶ月)",
          title: `そろそろ大人のごはんへ！${dog.temporaryName}ちゃんの成犬用フード切り替えプログラム`,
          summary: "パピー期終了！胃腸に優しい北海道産エゾ鹿肉プレミアム低アレルゲンフード",
          body: `生後10ヶ月を過ぎた${dog.temporaryName}ちゃん。成長期から成犬期への移行時期です。急な切り替えによる消化不良を防ぐため、10日間かけてゆっくり慣らす「パピー→成犬用エゾ鹿肉キューブ」の特別定期便プログラムをご用意しました。`,
          imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
          actionLabel: "自社ストアで成犬用フード定期便を申し込む ➔",
          productRecommendation: {
            name: "WanBridge特製 熟成エゾ鹿肉キューブ定期便",
            price: 4800,
            discountPrice: 4320,
            costPrice: 2400,
            partnerMargin: 384
          }
        };
      } else {
        data = {
          badge: "👕 成犬骨格確定＆季節の犬服 (生後8ヶ月〜)",
          title: `骨格が確定しました！一生モノのジャストサイズ犬服コレクション`,
          summary: "タイニー・Sサイズぴったり設計。秋冬の蓄熱マイクロフリース＆カフェ用抜け毛防止ウェア",
          body: `${dog.temporaryName}ちゃんの体高・胸囲が成犬サイズ（確定級）に到達しました！もうサイズアウトの心配はありません。カフェへの同伴時にも安心な「抜け毛防止＆防寒蓄熱フリース」を会員様限定の送料無料・試着交換無料でお届けします。`,
          imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
          actionLabel: "自社ストアでジャストサイズ犬服を見る ➔",
          productRecommendation: {
            name: "WanBridge特製 撥水・蓄熱マイクロフリース (Sサイズ)",
            price: 3850,
            discountPrice: 3460,
            costPrice: 1800,
            partnerMargin: 332
          }
        };
      }
    }

    // LINEリッチカード吹き出しを描画
    const botMsg = document.createElement('div');
    botMsg.className = "flex items-start gap-2 animate-fade-in";
    const prod = data.productRecommendation;
    const margin = prod.partnerMargin || Math.round((prod.discountPrice - (prod.costPrice || prod.discountPrice * 0.6)) * 0.2);

    botMsg.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex-shrink-0 flex items-center justify-center text-[10px] font-black">Bot</div>
      <div class="w-full max-w-[90%] space-y-2">
        <div class="bg-white rounded-2xl rounded-tl-none overflow-hidden shadow border border-amber-200">
          <!-- 上部画像 -->
          <div class="h-32 w-full overflow-hidden relative">
            <img src="${data.imageUrl}" alt="" class="w-full h-full object-cover" />
            <span class="absolute top-2 left-2 bg-stone-950/80 text-white text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm">
              ${data.badge}
            </span>
          </div>

          <!-- 本文 -->
          <div class="p-3 space-y-2">
            <h4 class="font-black text-xs text-stone-900 leading-snug">${data.title}</h4>
            <p class="text-[11px] text-stone-600 leading-relaxed whitespace-pre-line">${data.body}</p>

            <!-- おすすめ商品枠 -->
            <div class="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 space-y-1">
              <div class="text-[10px] font-bold text-amber-900">🎁 LINE友だち限定 ご案内特典</div>
              <div class="font-bold text-xs text-stone-900">${prod.name}</div>
              <div class="flex items-baseline gap-2">
                <span class="text-stone-400 line-through text-[10px]">¥${prod.price.toLocaleString()}</span>
                <span class="text-amber-800 font-black text-xs">特別価格 ¥${prod.discountPrice.toLocaleString()}</span>
                <span class="text-[9px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded">特別割引</span>
              </div>
            </div>

            <!-- アクションボタン -->
            <button 
              type="button" 
              class="btn-crm-order w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-xs py-2.5 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5"
              data-product="${prod.name}"
              data-price="${prod.discountPrice}"
              data-margin="${margin}"
              data-dog="${dog.temporaryName}"
            >
              <span>🛒</span>
              <span>${data.actionLabel}</span>
            </button>

            <!-- カフェ還元注記 -->
            <div class="text-[9px] text-center text-emerald-700 font-bold">
              🤝 本注文の粗利20%（¥${margin.toLocaleString()}）は提携カフェ（WanTea）へ還元されます
            </div>
          </div>
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(botMsg);
    this.scrollToBottom();

    // 注文ボタンのクリックイベント
    const orderBtn = botMsg.querySelector('.btn-crm-order');
    orderBtn.addEventListener('click', () => {
      orderBtn.disabled = true;
      orderBtn.classList.add('opacity-50', 'cursor-not-allowed');
      this.handleExecuteCrmOrder({
        productName: prod.name,
        orderAmount: prod.discountPrice,
        marginAmount: margin,
        dogName: dog.temporaryName
      });
    });
  }

  /** LINEから自社ストア注文を実行し、カフェに粗利20%を還元する */
  async handleExecuteCrmOrder(orderInfo) {
    // ユーザーの「注文しました」吹き出し
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end animate-fade-in";
    userMsg.innerHTML = `
      <div class="bg-[#5bc0de] text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] space-y-0.5 text-xs font-bold">
        <div>👉 【${orderInfo.productName}】を注文しました！</div>
        <div class="text-[10px] text-white/90">受取＆利用: 千住古民家ドッグカフェ WanTea 経由</div>
      </div>
    `;
    this.messagesContainer.appendChild(userMsg);
    this.scrollToBottom();

    // サーバーへOMO注文API呼び出し
    try {
      await fetch('/api/partner/cafe/omo-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: 'store-01',
          customerName: `${orderInfo.dogName}ちゃんの飼い主様 (LINE経由)`,
          productName: orderInfo.productName,
          orderAmount: orderInfo.orderAmount,
          commissionRate: 0.20
        })
      });
    } catch (e) {
      console.warn('Order API error', e);
    }

    // 注文完了＆カフェマージン計上通知
    setTimeout(() => {
      const confirmMsg = document.createElement('div');
      confirmMsg.className = "flex items-start gap-2 animate-fade-in";
      confirmMsg.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">Bot</div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-md max-w-[90%] space-y-2">
          <div class="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            🎉 自社ストアでのご注文ありがとうございます！
          </div>

          <div class="bg-stone-50 p-2 rounded-xl border border-stone-200 text-[11px] space-y-1">
            <div class="font-bold text-stone-800">ご注文: ${orderInfo.productName}</div>
            <div class="text-stone-600">お支払い金額: <b class="text-stone-900">¥${orderInfo.orderAmount.toLocaleString()}</b> (税込)</div>
            <div class="text-[10px] text-stone-500">発送状況: 最短翌日お届け / または次回カフェ来店時に受取可能</div>
          </div>

          <!-- カフェ還元レベニューシェア達成ログ -->
          <div class="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300 space-y-1 text-[10px]">
            <div class="font-bold text-emerald-900 flex items-center gap-1">
              <span>🤝</span> ドッグカフェOMOレベニューシェア計上完了:
            </div>
            <div class="flex items-center justify-between text-emerald-800 font-bold">
              <span>提携店 (WanTea) 還元マージン (粗利20%):</span>
              <span class="text-xs text-emerald-700 font-black">+¥${orderInfo.marginAmount.toLocaleString()}</span>
            </div>
            <p class="text-emerald-700 text-[9px]">店舗側の在庫リスク・梱包ゼロで自動計上されました。</p>
          </div>
        </div>
      `;
      this.messagesContainer.appendChild(confirmMsg);
      this.scrollToBottom();

      // 親画面のイベントや更新をフック（OMO台帳が画面にあれば更新）
      window.dispatchEvent(new CustomEvent('omo-order-completed', { detail: orderInfo }));
    }, 500);
  }

  // ==========================================
  // 🐶 お迎え初期30日ステップ動画配信ハンドラー
  // ==========================================
  async handleStepVideo(dayNum) {
    const dog = this.dogs.find(d => d.id === this.activeCrmDogId) || this.dogs[0] || { temporaryName: 'ワンちゃん', id: 'dog-001' };

    // ユーザー発言
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end animate-fade-in";
    userMsg.innerHTML = `
      <div class="bg-[#5bc0de] text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] space-y-0.5 text-xs font-bold">
        <div>👉 【Day ${dayNum}】お迎え初期ステップ動画を見る</div>
        <div class="text-[10px] text-white/90">対象: ${dog.temporaryName}ちゃん</div>
      </div>
    `;
    this.messagesContainer.appendChild(userMsg);
    this.scrollToBottom();

    // APIからステップ動画データを取得
    let stepData = null;
    try {
      const res = await fetch(`/api/crm/home-steps?dogId=${dog.id}`);
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        stepData = json.data.find(s => s.stepDay === dayNum) || json.data[0];
      }
    } catch (e) {
      console.warn('Steps API error, using fallback', e);
    }

    if (!stepData) {
      stepData = {
        stepDay: dayNum,
        title: `🌙 【Day ${dayNum}】初期ケア・ホームシック防止プログラム`,
        badge: "お迎え初期サポート",
        summary: "新しいおうちの環境に慣れるまでの最重要注意点とルーティンを解説します。",
        videoTitle: `Day ${dayNum} 実践ガイダンス（専門ブリーダー監修）`,
        videoLength: "2分00秒",
        videoUrl: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80",
        keyPoints: ["サークル内で落ち着ける静かな環境づくり", "ふやかしフードの適正給与量と温度", "甘やかしすぎず自立心を育む見守り"],
        actionLabel: "初期ケアチェックシートを確認 ➔"
      };
    }

    // Botからのリッチ動画カード配信
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = "flex items-start gap-2 animate-fade-in";
      botMsg.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-black">Bot</div>
        <div class="w-full max-w-[92%] space-y-2">
          <div class="bg-white rounded-2xl rounded-tl-none overflow-hidden shadow-md border border-indigo-200">
            <!-- 動画サムネイル＆再生バッジ -->
            <div class="relative h-32 w-full bg-stone-900 group cursor-pointer overflow-hidden">
              <img src="${stepData.videoUrl}" alt="${stepData.title}" class="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-300">
              <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div class="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                  <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div class="absolute top-2 left-2 bg-indigo-900/90 text-white text-[9px] px-2 py-0.5 rounded-full font-black border border-indigo-400/50">
                ${stepData.badge}
              </div>
              <div class="absolute bottom-2 right-2 bg-black/75 text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                ⏱ ${stepData.videoLength}
              </div>
            </div>

            <div class="p-3 space-y-2">
              <div>
                <h4 class="font-black text-xs text-stone-900 leading-snug">${stepData.title}</h4>
                <p class="text-[10px] text-stone-600 mt-1 leading-relaxed">${stepData.summary}</p>
              </div>

              <!-- 重要チェックポイント -->
              <div class="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 text-[10px] space-y-1">
                <div class="font-bold text-indigo-950 flex items-center gap-1">
                  <span>💡</span> 今日の実践キーポイント:
                </div>
                <ul class="space-y-0.5 text-indigo-900 pl-3 list-disc marker:text-indigo-500">
                  ${(stepData.keyPoints || []).map(kp => `<li>${kp}</li>`).join('')}
                </ul>
              </div>

              <!-- アクションボタン -->
              <button type="button" class="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black py-2 rounded-xl text-[11px] shadow transition flex items-center justify-center gap-1.5" onclick="alert('『${stepData.videoTitle}』の動画再生 ＆ カウンセリングシートを開きました。')">
                <span>▶️</span>
                <span>動画を再生する (${stepData.videoLength})</span>
              </button>
            </div>
          </div>
        </div>
      `;
      this.messagesContainer.appendChild(botMsg);
      this.scrollToBottom();
    }, 400);
  }

  // ==========================================
  // 🚨 緊急SOSホットライン（2段分岐プロンプト）
  // ==========================================
  handleSosTriggerPrompt() {
    const dog = this.dogs.find(d => d.id === this.activeCrmDogId) || this.dogs[0] || { temporaryName: 'ワンちゃん', id: 'dog-001' };

    // ユーザー発言
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end animate-fade-in";
    userMsg.innerHTML = `
      <div class="bg-rose-600 text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] space-y-0.5 text-xs font-black">
        <div>🚨 【緊急SOSホットライン】相談を開始します</div>
        <div class="text-[10px] text-rose-100 font-normal">対象: ${dog.temporaryName}ちゃん</div>
      </div>
    `;
    this.messagesContainer.appendChild(userMsg);
    this.scrollToBottom();

    // Botからの2段分岐確認カード
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = "flex items-start gap-2 animate-fade-in";
      botMsg.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-rose-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-black">SOS</div>
        <div class="w-full max-w-[94%] space-y-2">
          <div class="bg-white rounded-2xl rounded-tl-none overflow-hidden shadow-lg border-2 border-rose-500">
            <div class="bg-rose-600 text-white p-2.5 text-xs font-black flex items-center justify-between">
              <span>🚨 緊急SOS・命のセーフティネット</span>
              <span class="bg-rose-800 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">24h 365d</span>
            </div>

            <div class="p-3 space-y-3">
              <p class="text-[11px] text-stone-700 leading-relaxed">
                どのようなご事情であっても、私たちは飼い主様を責めることは一切ありません。<br>
                最優先すべきは<b>「飼い主様の心身の安心」</b>と<b>「ワンちゃんの命と生涯の幸せ」</b>です。
              </p>

              <div class="bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <div class="font-bold text-rose-950 text-[11px] mb-1">
                  ❓ 【緊急確認】現在の状況について教えてください：
                </div>
                <div class="text-[10px] text-rose-800">
                  当てはまる選択肢をタップしてください。即座に専用窓口へお繋ぎします。
                </div>
              </div>

              <!-- 2大分岐ボタン -->
              <div class="space-y-2 pt-1">
                <!-- 分岐A: 通常相談 (NO) -->
                <button type="button" class="btn-sos-branch-normal w-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-bold p-2.5 rounded-xl text-left text-[11px] transition flex items-start gap-2">
                  <span class="text-emerald-600 text-base leading-none">📱</span>
                  <div>
                    <div class="font-black text-stone-900">【NO】体調の急変・下痢・夜泣き・しつけの悩み</div>
                    <div class="text-[10px] text-stone-500 font-normal">専任スタッフとLINE無料通話 ＆ 便のAI写真診断へ</div>
                  </div>
                </button>

                <!-- 分岐B: 飼育困難・里帰り引取 (YES) -->
                <button type="button" class="btn-sos-branch-surrender w-full bg-rose-50 hover:bg-rose-100 border-2 border-rose-400 text-rose-950 font-bold p-2.5 rounded-xl text-left text-[11px] transition flex items-start gap-2 shadow-sm">
                  <span class="text-rose-600 text-base leading-none">🚨</span>
                  <div>
                    <div class="font-black text-rose-900">【YES】入院・高齢・生活激変で『もう飼えない』状態</div>
                    <div class="text-[10px] text-rose-700 font-bold">店長直通携帯へ即時緊急通報 ＆ 100%無償里帰り引取</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      this.messagesContainer.appendChild(botMsg);
      this.scrollToBottom();

      // 分岐ボタンイベント
      const btnNormal = botMsg.querySelector('.btn-sos-branch-normal');
      const btnSurrender = botMsg.querySelector('.btn-sos-branch-surrender');

      if (btnNormal) {
        btnNormal.addEventListener('click', () => {
          btnNormal.disabled = true;
          btnSurrender.disabled = true;
          this.handleSosResolve('normal_consult');
        });
      }
      if (btnSurrender) {
        btnSurrender.addEventListener('click', () => {
          btnNormal.disabled = true;
          btnSurrender.disabled = true;
          this.handleSosResolve('surrender_sos');
        });
      }
    }, 400);
  }

  // ==========================================
  // 🚨 緊急SOS解決・アクション実行
  // ==========================================
  async handleSosResolve(branchChoice) {
    const dog = this.dogs.find(d => d.id === this.activeCrmDogId) || this.dogs[0] || { temporaryName: 'ワンちゃん', id: 'dog-001' };

    // ユーザー選択メッセージ
    const isSurrender = branchChoice === 'surrender_sos';
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end animate-fade-in";
    userMsg.innerHTML = `
      <div class="${isSurrender ? 'bg-rose-700' : 'bg-emerald-600'} text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-xs font-bold">
        ${isSurrender
        ? '👉 【YES】飼育継続が困難なため、店長直通ダイヤルと無償里帰り引き取りを要請します'
        : '👉 【NO】日頃の体調不安・しつけについて専任スタッフへの相談を希望します'}
      </div>
    `;
    this.messagesContainer.appendChild(userMsg);
    this.scrollToBottom();

    // サーバーへSOS記録
    let result = null;
    try {
      const res = await fetch('/api/crm/sos-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogId: dog.id,
          ownerName: `${dog.temporaryName}ちゃんの飼い主様`,
          branchChoice: branchChoice,
          reason: isSurrender ? "家庭環境・健康上の理由による里帰り要請" : "体調・初期しつけ相談"
        })
      });
      result = await res.json();
    } catch (e) {
      console.warn('SOS API error', e);
    }

    setTimeout(() => {
      const resMsg = document.createElement('div');
      resMsg.className = "flex items-start gap-2 animate-fade-in";

      if (isSurrender) {
        resMsg.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-rose-700 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-black">店長</div>
          <div class="w-full max-w-[94%] space-y-2">
            <div class="bg-white rounded-2xl rounded-tl-none overflow-hidden shadow-xl border-2 border-rose-600">
              <div class="bg-gradient-to-r from-rose-700 to-amber-700 text-white p-3 space-y-1">
                <div class="text-[10px] font-mono tracking-widest text-amber-200">WanBridge 終生飼養セーフティネット</div>
                <h4 class="text-xs font-black">🚨 店長直通ダイヤルへ緊急発信しました</h4>
              </div>

              <div class="p-3 space-y-3 text-[11px] text-stone-800">
                <p class="leading-relaxed font-medium">
                  ご連絡いただき本当にありがとうございます。どのようなご事情であっても、私たちは飼い主様を責めることは一切ありません。
                </p>

                <div class="bg-amber-50 p-2.5 rounded-xl border border-amber-300 space-y-1 text-[10px]">
                  <div class="font-black text-amber-950 flex items-center gap-1">
                    <span>🛡️</span> 100%無償里帰り引き取りのお約束:
                  </div>
                  <p class="text-stone-700 leading-relaxed">
                    千住古民家ブリーダー拠点では終生飼養責任として<b>完全無償での里帰り引き取り</b>を実施しています。ワンちゃんは古民家カフェの看板犬や地域高齢者施設でのセラピー犬として生涯大切に愛育いたします。
                  </p>
                </div>

                <div class="bg-rose-50 p-2.5 rounded-xl border border-rose-200 space-y-1 text-[10px]">
                  <div class="font-black text-rose-950 flex items-center gap-1">
                    <span>📞</span> 店長（森本）専用ホットライン作動中:
                  </div>
                  <p class="text-rose-800">
                    店長業務携帯へ即座に通報が届きました。<b>3分以内に直接お電話を差し上げます</b>ので、電話が繋がる状態でお待ちください。
                  </p>
                </div>

                <div class="text-[9px] text-stone-400 font-mono text-center">
                  保護台帳ID: ${result?.logId || 'sos-local'} / 緊急度: HIGHEST / ステータス: 保護手配中
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        resMsg.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">Bot</div>
          <div class="w-full max-w-[90%] space-y-2">
            <div class="bg-white rounded-2xl rounded-tl-none overflow-hidden shadow-md border border-emerald-300">
              <div class="bg-emerald-600 text-white p-2.5 text-xs font-black">
                📱 専任スタッフ・LINE無料通話へ接続しました
              </div>
              <div class="p-3 space-y-2 text-[11px] text-stone-700">
                <p>
                  子犬の体調変化やしつけの悩みですね。専任スタッフがお電話でお話をお伺いします。
                </p>
                <div class="bg-stone-50 p-2 rounded-xl border border-stone-200 space-y-1 text-[10px]">
                  <div class="font-bold text-stone-800">💡 便の異常・食欲不振の場合:</div>
                  <p class="text-stone-600">このトークルームに直接『うんちの写真』をお送りいただければ、AIと獣医師が色・硬さを即時判定します。</p>
                </div>
                <button type="button" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs shadow" onclick="alert('専任スタッフへのLINE無料通話を開始します。')">
                  📞 LINE無料通話を発信する
                </button>
              </div>
            </div>
          </div>
        `;
      }

      this.messagesContainer.appendChild(resMsg);
      this.scrollToBottom();

      // イベント発火
      window.dispatchEvent(new CustomEvent('sos-triggered', { detail: result || { branchChoice } }));
    }, 600);
  }

  // ==========================================
  // 📷 ブリーダー更新モード（既存フロー）
  // ==========================================
  /** Step 1: ブリーダーが写真を送信 */
  handleSendPhoto() {
    this.step = 1;
    this.uploadedPhoto = "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80";

    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end animate-fade-in";
    userMsg.innerHTML = `
      <div class="bg-[#5bc0de] text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[75%] space-y-1.5">
        <img src="${this.uploadedPhoto}" alt="送信写真" class="w-48 h-32 object-cover rounded-lg shadow-sm" />
        <p class="text-[11px] text-white/90 text-right">生後60日の最新写真です📷</p>
      </div>
    `;
    this.messagesContainer.appendChild(userMsg);
    this.scrollToBottom();

    setTimeout(() => {
      this.showCarousel();
    }, 600);
  }

  /** Step 2: LINE Botが仮名称カルーセルを提示 */
  showCarousel() {
    const botMsg = document.createElement('div');
    botMsg.className = "flex items-start gap-2 animate-fade-in";

    const candidateDogs = this.dogs.filter(d => d.listingType === 'puppy_sale');

    botMsg.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">Bot</div>
      <div class="w-full max-w-[90%] space-y-2">
        <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm space-y-1">
          <p class="font-bold text-stone-900 text-xs">写真を受信しました！✨</p>
          <p class="text-stone-600 text-[11px]">どの子の写真ですか？仮名称カードを1タップしてください👇</p>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          ${candidateDogs.map(dog => {
      const firstImg = dog.images && dog.images.length > 0 ? dog.images[0] : null;
      const imgUrl = typeof firstImg === 'string' ? firstImg : (firstImg?.url || '');
      return `
              <div class="flex-shrink-0 w-40 bg-white rounded-xl overflow-hidden shadow border border-stone-200 flex flex-col justify-between">
                <div class="h-20 w-full overflow-hidden relative">
                  <img src="${imgUrl}" alt="" class="w-full h-full object-cover" />
                  <span class="absolute top-1 left-1 ${dog.freshnessStatus === 'yellow' ? 'bg-amber-500' : 'bg-emerald-600'} text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                    ${dog.freshnessStatus === 'yellow' ? '⚠️写真更新待ち' : '生後60日'}
                  </span>
                </div>
                <div class="p-2 space-y-1">
                  <div class="font-bold text-stone-900 text-xs truncate">🐶 ${dog.temporaryName}</div>
                  <div class="text-[10px] text-stone-500">${dog.breed} / ${dog.gender === 'male' ? '男の子' : '女の子'}</div>
                  <button 
                    type="button" 
                    class="select-dog-btn w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg shadow-sm active:scale-95 transition"
                    data-dog-id="${dog.id}"
                    data-dog-name="${dog.temporaryName}"
                  >
                    👆 この子を登録
                  </button>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
    this.messagesContainer.appendChild(botMsg);
    this.scrollToBottom();

    botMsg.querySelectorAll('.select-dog-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dogId = btn.dataset.dogId;
        const dogName = btn.dataset.dogName;
        this.handleSelectDog(dogId, dogName);
      });
    });

    this.controlsContainer.innerHTML = `
      <p class="text-center text-[11px] text-stone-500">カルーセルから該当する子犬の【👆 この子を登録】をタップしてください</p>
    `;
  }

  /** Step 3: 仮名称確定 ＆ 体重入力 */
  handleSelectDog(dogId, dogName) {
    this.selectedDog = this.dogs.find(d => d.id === dogId);

    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end animate-fade-in";
    userMsg.innerHTML = `
      <div class="bg-[#5bc0de] text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[75%] font-medium text-xs">
        👉 【${dogName}】を選択しました！
      </div>
    `;
    this.messagesContainer.appendChild(userMsg);
    this.scrollToBottom();

    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = "flex items-start gap-2 animate-fade-in";
      botMsg.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">Bot</div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] space-y-1">
          <p class="font-bold text-stone-900 text-xs">【${dogName}】の生後60日写真としてセットしました！📷</p>
          <p class="text-stone-600 text-[11px]">デジタル体重計での現在の体重（g）を数字で入力してください。</p>
        </div>
      `;
      this.messagesContainer.appendChild(botMsg);
      this.scrollToBottom();

      this.controlsContainer.innerHTML = `
        <form id="weight-form" class="flex gap-2">
          <div class="relative flex-1">
            <input 
              type="number" 
              id="weight-input" 
              placeholder="例: 840" 
              value="840" 
              class="w-full border-2 border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-8"
              required
            />
            <span class="absolute right-3 top-2.5 text-xs text-stone-500 font-bold">g</span>
          </div>
          <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow active:scale-95 transition">
            送信
          </button>
        </form>
      `;

      const form = this.controlsContainer.querySelector('#weight-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = this.controlsContainer.querySelector('#weight-input').value;
        this.handleSubmitWeight(val);
      });
    }, 400);
  }

  /** Step 4: 体重送信 ＆ 全自動パイプライン発動 */
  handleSubmitWeight(weightStr) {
    this.inputWeight = parseInt(weightStr, 10) || 840;

    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end animate-fade-in";
    userMsg.innerHTML = `
      <div class="bg-[#5bc0de] text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[75%] font-bold text-xs">
        ⚖️ ${this.inputWeight} g
      </div>
    `;
    this.messagesContainer.appendChild(userMsg);
    this.scrollToBottom();

    const processingMsg = document.createElement('div');
    processingMsg.className = "flex items-start gap-2 animate-fade-in";
    processingMsg.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">Bot</div>
      <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] space-y-1">
        <div class="flex items-center gap-2 text-stone-700 font-bold text-xs">
          <svg class="w-4 h-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          AI成犬体重計算 ＆ マルチSNS動画自動レンダリング中...
        </div>
      </div>
    `;
    this.messagesContainer.appendChild(processingMsg);
    this.scrollToBottom();

    setTimeout(() => {
      processingMsg.remove();
      this.showCompleteResult();
    }, 1200);
  }

  /** 完了画面：AI判定とSNS自動投稿ログ */
  showCompleteResult() {
    const dog = this.selectedDog;
    const calcAdultMin = ((this.inputWeight * 3.0) / 1000).toFixed(1);
    const calcAdultMax = ((this.inputWeight * 3.2) / 1000).toFixed(1);

    const botMsg = document.createElement('div');
    botMsg.className = "flex items-start gap-2 animate-fade-in";
    botMsg.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">Bot</div>
      <div class="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-md max-w-[95%] space-y-3">
        <div class="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
          <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          🎉 登録が完了しました！(所要時間 14秒)
        </div>

        <div class="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1.5 text-[11px]">
          <div class="font-bold text-stone-900 flex items-center justify-between">
            <span>対象: 🐶 ${dog.temporaryName}</span>
            <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">イエローマーク解除済🟢</span>
          </div>
          <div class="text-stone-700">実測体重: <b class="text-stone-900">${this.inputWeight} g</b> (生後60日)</div>
          <div class="text-amber-700 font-bold">
            🏆 AI自動判定: 【タイニー確定級】成犬時予測 ${calcAdultMin}kg 〜 ${calcAdultMax}kg (信頼度98%)
          </div>
        </div>

        <div class="space-y-1.5 pt-1">
          <p class="font-bold text-[11px] text-stone-800 flex items-center gap-1">
            🚀 完全自動パイプラインが実行されました:
          </p>
          <div class="space-y-1 text-[10px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
            <div class="flex items-center justify-between text-emerald-600 font-medium">
              <span>📱 LINE速報: お気に入り登録者 18名へ即時配信</span>
              <span>完了 ✅</span>
            </div>
            <div class="flex items-center justify-between text-emerald-600 font-medium">
              <span>📸 Instagram: リール動画 ＆ フィード投稿</span>
              <span>完了 ✅</span>
            </div>
            <div class="flex items-center justify-between text-emerald-600 font-medium">
              <span>🎵 TikTok: #トイプードル #タイニー確定 で投稿</span>
              <span>完了 ✅</span>
            </div>
            <div class="flex items-center justify-between text-emerald-600 font-medium">
              <span>▶️ YouTube Shorts: 15秒動画自動生成アップロード</span>
              <span>完了 ✅</span>
            </div>
            <div class="flex items-center justify-between text-emerald-600 font-medium">
              <span>🐦 X (旧Twitter): 写真＋確定体重ポスト</span>
              <span>完了 ✅</span>
            </div>
          </div>
        </div>
      </div>
    `;
    this.messagesContainer.appendChild(botMsg);
    this.scrollToBottom();

    if (typeof this.onRegisterSuccess === 'function') {
      this.onRegisterSuccess(dog.id, this.inputWeight, this.uploadedPhoto);
    }

    this.controlsContainer.innerHTML = `
      <div class="text-center space-y-2">
        <p class="text-xs text-emerald-600 font-bold">サイト上の子犬カードに即時反映されました！</p>
        <button id="sim-complete-btn" class="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-2 px-4 rounded-xl text-xs shadow transition">
          閉じてサイトを確認する
        </button>
      </div>
    `;

    const closeBtn = this.controlsContainer.querySelector('#sim-complete-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const modal = document.getElementById('line-sim-modal');
        if (modal) modal.classList.add('hidden');
      });
    }
  }

  reset() {
    this.step = 0;
    this.selectedDog = null;
    this.uploadedPhoto = null;
    this.inputWeight = null;
    this.render();
  }
}


