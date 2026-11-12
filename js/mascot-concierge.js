/**
 * WanBridge 公式マスコット・コンシェルジュ ウィジェット (ポッケ・ルーク・ピポ)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMascotConcierge();
});

export function initMascotConcierge() {
  const container = document.getElementById('mascot-concierge-container');
  if (!container) return;

  const toggleBtn = document.getElementById('mascot-toggle-btn');
  const card = document.getElementById('mascot-card');
  const closeBtn = document.getElementById('mascot-close-btn');
  const tabBtns = document.querySelectorAll('.mascot-tab-btn');
  const contentArea = document.getElementById('mascot-content-area');

  const topics = {
    milestone: {
      title: '🐾 4大マイルストーン体重測定',
      badge: 'サイズ詐欺を根絶！',
      badgeColor: 'bg-amber-100 text-amber-800',
      image: './assets/images/ワンブリッジ隊_アニメーション原画アクション設定資料.jpg',
      text: '出生時・35日・60日・90日の実測体重をブリーダーが登録！成犬時のサイズ予測グラフで「思っていたより大きくなった/小さすぎた」トラブルを完全に防ぐワン！'
    },
    freshness: {
      title: '🐥 写真鮮度イエローマーク',
      badge: '写真詐欺をゼロに！',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      image: './assets/images/ピポ_キャラクター設定資料_発光警告差分.jpg',
      text: '生後30日頃の可愛い写真のまま放置されるのを防ぐため、30日以上未更新の子犬には自動で⚠️イエローマークが点灯。ピポが最新写真を1タップでブリーダーへリクエストするよ！'
    },
    retirement: {
      title: '🌿 里親・引退犬セカンドライフ',
      badge: '安心の終生飼養',
      badgeColor: 'bg-teal-100 text-teal-800',
      image: './assets/images/ルーク_キャラクター設定三面図_案内立ちポーズ.jpg',
      text: 'ブリーダー犬舎で活躍した優しい親犬たちに、温かい第2の人生を！ルークが案内する里親枠は、医療カルテの明朗開示とエスクロー決済で安心安全だワン。'
    },
    anime: {
      title: '🎬 ショートアニメ＆スタンプ',
      badge: '公式アート公開中',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      image: './assets/images/ポッケと仲間たち_公式リアクションスタンプ集.jpg',
      text: 'ボクたち「ワンブリッジ隊」の日常や体重測定ドタバタ劇がショートアニメになったよ！LINEスタンプやSNS動画でも会えるワン！'
    }
  };

  // トグル開閉
  if (toggleBtn && card) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = !card.classList.contains('hidden');
      if (isOpen) {
        card.classList.add('hidden');
      } else {
        card.classList.remove('hidden');
        card.classList.add('animate-fade-in');
      }
    });
  }

  if (closeBtn && card) {
    closeBtn.addEventListener('click', () => {
      card.classList.add('hidden');
    });
  }

  // タブ切り替え
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const topicKey = btn.dataset.topic;
      const topic = topics[topicKey];
      if (!topic || !contentArea) return;

      tabBtns.forEach(b => {
        b.classList.remove('bg-amber-500', 'text-white', 'shadow-sm');
        b.classList.add('bg-stone-100', 'text-stone-600', 'hover:bg-stone-200');
      });
      btn.classList.remove('bg-stone-100', 'text-stone-600', 'hover:bg-stone-200');
      btn.classList.add('bg-amber-500', 'text-white', 'shadow-sm');

      contentArea.innerHTML = `
        <div class="space-y-2 animate-fade-in">
          <div class="flex items-center justify-between">
            <h4 class="font-black text-xs text-stone-900">${topic.title}</h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${topic.badgeColor}">${topic.badge}</span>
          </div>
          <div class="rounded-xl overflow-hidden border border-stone-200 bg-stone-100 max-h-36 flex items-center justify-center">
            <img src="${topic.image}" alt="${topic.title}" class="w-full h-full object-cover" />
          </div>
          <p class="text-xs text-stone-600 leading-relaxed font-medium bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
            ${topic.text}
          </p>
        </div>
      `;
    });
  });
}
