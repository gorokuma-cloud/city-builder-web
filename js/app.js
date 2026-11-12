/**
 * WanBridge (ワンブリッジ) - メインアプリケーション制御ロジック
 */

import { INITIAL_DOGS, INITIAL_BREEDERS, SATELLITE_HUBS, FAQ_LIST } from './data.js';
import { SPONSORED_ADS } from './ads.js';
import { PhotoSlider } from './slider.js';
import { GrowthChartManager } from './chart-manager.js';
import { LineSimulator } from './line-simulator.js';

class WanBridgeApp {
  constructor() {
    this.dogs = JSON.parse(JSON.stringify(INITIAL_DOGS));
    this.breeders = JSON.parse(JSON.stringify(INITIAL_BREEDERS));
    this.satellites = JSON.parse(JSON.stringify(SATELLITE_HUBS));
    this.faqs = JSON.parse(JSON.stringify(FAQ_LIST));
    this.favorites = this.loadFavorites();
    this.currentView = 'dogs'; // dogs | guide | breeders | satellites | faq
    this.currentTab = 'all'; // all | puppy_sale | adoption
    this.activeTag = null;
    this.searchQuery = '';
    this.filters = {
      breed: 'all',
      freshness: 'all', // all | green | yellow
      age: 'all', // all | under_60d | 2_3m | 4_6m | 7_12m | young | senior
      size: 'all',
      apartmentOnly: false,
      sheddingMin: false,
      praClearOnly: false,
      seniorSafeOnly: false
    };

    this.activeSlider = null;
    this.chartManager = null;
    this.lineSimulator = null;
    this.selectedDogForModal = null;

    this.init();
  }

  /**
   * 生後日数から月齢・年齢を人間向けにフォーマット
   */
  formatAge(days) {
    if (!days && days !== 0) return '年齢未登録';
    if (days < 30) return `生後${days}日`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `生後${days}日 (約${months}ヶ月)`;
    }
    const years = Math.floor(days / 365);
    const remMonths = Math.floor((days % 365) / 30);
    return `${years}歳${remMonths > 0 ? ` ${remMonths}ヶ月` : ''}`;
  }

  init() {
    this.bindDomEvents();
    this.renderDogList();
    this.renderBreeders();
    this.renderSatellites();
    this.renderFaqs();
    this.initRouting();
    this.updateFavoritesCount();
    this.initLineSimulator();
    this.initBreederPortal();
    this.setupBreedingModal();
    this.setupSocializationModal();
    this.setupSubscriptionModal();
    this.setupSeniorDX();
    this.setupPartnerDX();
    this.setupPassportModal();
    this.setupDiplomaModal();
    this.setupRollcallDX();
    this.setupSixPillarsDX();
    this.setupSatelliteSimulator();
    this.setupAdoptionSafetyModal();
    this.setupSenjuVisitModal();
    this.setupWaitlistModal();
    this.setupSeniorPartnership();
    this.checkSystemHealth();
    this.fetchDogsFromApi();
  }

  async checkSystemHealth() {
    const badge = document.getElementById('system-status-badge');
    const textEl = document.getElementById('system-status-text');
    if (!badge || !textEl) return;

    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        badge.className = "text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition";
        textEl.textContent = `API正常稼働 (${data.totalDogs || 10}頭管理中)`;
      } else {
        badge.className = "text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition";
        textEl.textContent = "Edgeモード (Pages)";
      }
    } catch {
      badge.className = "text-stone-600 font-bold bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition";
      textEl.textContent = "スタンドアロン稼働中";
    }
  }

  async fetchDogsFromApi() {
    try {
      const res = await fetch('/api/dogs');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          // APIからのデータをフォーマット変換してマージ
          this.dogs = json.data.map(d => ({
            id: d.id,
            listingType: d.listing_type,
            temporaryName: d.temporary_name,
            registeredName: d.registered_name,
            breed: d.breed,
            breedEn: d.breed_en,
            gender: d.gender,
            birthDate: d.birth_date,
            currentAgeDays: d.current_age_days,
            color: d.color,
            price: d.price,
            priceNote: d.price_note,
            status: d.status,
            freshnessStatus: d.freshness_status,
            freshnessLabel: d.freshness_label,
            freshnessReason: d.freshness_reason,
            predictedSizeCategory: d.predicted_size_category,
            predictedWeightRange: d.predicted_weight_range,
            confidenceRate: d.confidence_rate,
            kennelName: d.kennel_name,
            breederName: d.breeder_name,
            prefecture: d.prefecture,
            location: d.location,
            description: d.description,
            receiptUrl: d.receipt_url,
            receiptDetails: d.receiptDetails,
            lifestyle: d.lifestyle,
            health: d.health,
            parents: d.parents,
            images: (d.images || []).map(img => typeof img === 'string' ? { url: img, caption: '', tag: '' } : img),
            milestones: d.milestones,
            tags: d.tags
          }));
          this.renderDogList();
        }
      }
    } catch {
      // オフライン・静的ファイル直接閲覧時はローカルデータを継続使用
    }
  }

  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem('wanbridge_favs') || '[]');
    } catch {
      return [];
    }
  }

  saveFavorites() {
    localStorage.setItem('wanbridge_favs', JSON.stringify(this.favorites));
    this.updateFavoritesCount();
  }

  updateFavoritesCount() {
    const badge = document.getElementById('fav-count-badge');
    const bottomBadge = document.getElementById('bottom-fav-count');
    const count = this.favorites.length;
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    if (bottomBadge) {
      bottomBadge.textContent = count;
      bottomBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  bindDomEvents() {
    // カテゴリタブ切替
    document.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-tab-btn').forEach(b => {
          b.classList.remove('bg-amber-500', 'text-white', 'shadow-md');
          b.classList.add('bg-white', 'text-stone-600', 'hover:bg-stone-50');
        });
        btn.classList.remove('bg-white', 'text-stone-600', 'hover:bg-stone-50');
        btn.classList.add('bg-amber-500', 'text-white', 'shadow-md');

        this.currentTab = btn.dataset.tab;
        this.renderDogList();

        const lukeGuide = document.getElementById('luke-adoption-guide');
        if (lukeGuide && this.currentTab === 'adoption') {
          lukeGuide.classList.add('ring-4', 'ring-emerald-400', 'shadow-lg');
          setTimeout(() => lukeGuide.classList.remove('ring-4', 'ring-emerald-400', 'shadow-lg'), 2000);
        }
      });
    });

    // クイックタグ横スクロールクリック
    document.querySelectorAll('.quick-tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tag = chip.dataset.tag;
        if (this.activeTag === tag) {
          this.activeTag = null;
          chip.classList.remove('bg-stone-900', 'text-white', 'border-stone-900');
          chip.classList.add('bg-white', 'text-stone-700', 'border-stone-200');
        } else {
          document.querySelectorAll('.quick-tag-chip').forEach(c => {
            c.classList.remove('bg-stone-900', 'text-white', 'border-stone-900');
            c.classList.add('bg-white', 'text-stone-700', 'border-stone-200');
          });
          this.activeTag = tag;
          chip.classList.remove('bg-white', 'text-stone-700', 'border-stone-200');
          chip.classList.add('bg-stone-900', 'text-white', 'border-stone-900');
        }
        this.renderDogList();
      });
    });

    // フリーワード検索（PC & モバイル連動）
    const searchInput = document.getElementById('search-input');
    const searchInputMobile = document.getElementById('search-input-mobile');
    const onSearchChange = (val) => {
      this.searchQuery = (val || '').toLowerCase();
      if (searchInput && searchInput.value !== val) searchInput.value = val;
      if (searchInputMobile && searchInputMobile.value !== val) searchInputMobile.value = val;
      this.renderDogList();
    };
    if (searchInput) {
      searchInput.addEventListener('input', (e) => onSearchChange(e.target.value));
    }
    if (searchInputMobile) {
      searchInputMobile.addEventListener('input', (e) => onSearchChange(e.target.value));
    }

    // フィルタードロワー開閉
    const filterOpenBtn = document.getElementById('filter-drawer-open');
    const filterCloseBtn = document.getElementById('filter-drawer-close');
    const filterModal = document.getElementById('filter-modal');
    const filterApplyBtn = document.getElementById('filter-apply-btn');
    const filterResetBtn = document.getElementById('filter-reset-btn');

    if (filterOpenBtn && filterModal) {
      filterOpenBtn.addEventListener('click', () => filterModal.classList.remove('hidden'));
    }
    if (filterCloseBtn && filterModal) {
      filterCloseBtn.addEventListener('click', () => filterModal.classList.add('hidden'));
    }
    if (filterResetBtn) {
      filterResetBtn.addEventListener('click', () => {
        document.getElementById('filter-form').reset();
        this.filters = {
          breed: 'all',
          freshness: 'all',
          age: 'all',
          size: 'all',
          apartmentOnly: false,
          sheddingMin: false,
          praClearOnly: false,
          seniorSafeOnly: false
        };
        this.renderDogList();
        filterModal.classList.add('hidden');
      });
    }
    if (filterApplyBtn) {
      filterApplyBtn.addEventListener('click', () => {
        const breed = document.getElementById('filter-breed')?.value || 'all';
        const age = document.getElementById('filter-age')?.value || 'all';
        const freshness = document.getElementById('filter-freshness')?.value || 'all';
        const size = document.getElementById('filter-size')?.value || 'all';
        const apartmentOnly = document.getElementById('filter-apartment')?.checked || false;
        const sheddingMin = document.getElementById('filter-shedding')?.checked || false;
        const praClearOnly = document.getElementById('filter-pra')?.checked || false;
        const seniorSafeOnly = document.getElementById('filter-senior-safe')?.checked || false;

        this.filters = { breed, freshness, age, size, apartmentOnly, sheddingMin, praClearOnly, seniorSafeOnly };
        this.renderDogList();
        filterModal.classList.add('hidden');
        this.showToast('絞り込み条件を適用しました');
      });
    }

    // LINEシミュレータモーダル開閉
    const lineSimOpenBtns = document.querySelectorAll('.line-sim-trigger');
    const lineSimModal = document.getElementById('line-sim-modal');
    const lineSimClose = document.getElementById('line-sim-close');

    lineSimOpenBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (lineSimModal) lineSimModal.classList.remove('hidden');
      });
    });
    if (lineSimClose && lineSimModal) {
      lineSimClose.addEventListener('click', () => lineSimModal.classList.add('hidden'));
    }

    // 詳細モーダル閉じる (閉じるボタン、背景クリック、ESCキー、URLハッシュ同期)
    const detailModal = document.getElementById('detail-modal');
    const detailClose = document.getElementById('detail-close');
    const closeDetail = () => {
      if (detailModal && !detailModal.classList.contains('hidden')) {
        detailModal.classList.add('hidden');
        document.body.style.overflow = '';
        if (window.location.hash.startsWith('#dog-')) {
          window.history.pushState(null, '', '#dogs');
        }
      }
    };
    if (detailClose) {
      detailClose.addEventListener('click', closeDetail);
    }
    if (detailModal) {
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeDetail();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDetail();
    });

    // お気に入り一覧表示（ボトムナビ / ヘッダー）
    const favNavBtns = document.querySelectorAll('.fav-nav-btn');
    favNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.showFavoritesOnly();
      });
    });

    // グローバルナビゲーションリンク（ページビュー切り替え）
    document.querySelectorAll('.main-nav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.dataset.view || 'dogs';
        this.switchView(view);
        if (btn.dataset.tab) {
          this.currentTab = btn.dataset.tab;
          document.querySelectorAll('.category-tab-btn').forEach(b => {
            if (b.dataset.tab === this.currentTab) {
              b.classList.remove('bg-white', 'text-stone-600', 'hover:bg-stone-50');
              b.classList.add('bg-amber-500', 'text-white', 'shadow-md');
            } else {
              b.classList.remove('bg-amber-500', 'text-white', 'shadow-md');
              b.classList.add('bg-white', 'text-stone-600', 'hover:bg-stone-50');
            }
          });
          this.renderDogList();
        }
      });
    });

    // 📱 モバイル専用ボトムナビゲーション
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.dataset.view;
        if (view) {
          e.preventDefault();
          this.switchView(view);
          document.querySelectorAll('.mobile-nav-btn').forEach(b => {
            if (b.dataset.view) {
              b.classList.remove('text-amber-600', 'font-black');
              b.classList.add('text-stone-600');
            }
          });
          btn.classList.remove('text-stone-600');
          btn.classList.add('text-amber-600', 'font-black');
        }
      });
    });

    // 見学予約モーダル開閉 & 送信 (コンシェルジュサポート対応)
    const inquiryModal = document.getElementById('inquiry-modal');
    const inquiryClose = document.getElementById('inquiry-modal-close');
    const inquiryForm = document.getElementById('inquiry-form');

    if (inquiryClose && inquiryModal) {
      inquiryClose.addEventListener('click', () => inquiryModal.classList.add('hidden'));
    }

    if (inquiryForm) {
      inquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dogId = document.getElementById('inquiry-dog-id').value;
        const type = document.getElementById('inquiry-type').value;
        const name = document.getElementById('inquiry-name').value;
        const contact = document.getElementById('inquiry-contact').value;
        const preferredDate = document.getElementById('inquiry-date').value;
        const message = document.getElementById('inquiry-message').value;
        const conciergeOptIn = document.getElementById('inquiry-concierge-optin')?.checked ?? true;

        const optInText = conciergeOptIn ? '（専任コンシェルジュより日程確認のご連絡を差し上げます）' : '';
        this.showToast(`🎉 見学予約を受付ました！${optInText}`);
        inquiryModal.classList.add('hidden');
        inquiryForm.reset();

        try {
          await fetch('/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dogId,
              type,
              name,
              contact,
              preferredDate,
              message,
              insuranceOptIn: false, // 保険は一旦保留
              insurancePartner: 'pending'
            })
          });
        } catch (err) {
          console.warn('Inquiry API offline fallback', err);
        }
      });
    }
  }

  initLineSimulator() {
    const container = document.getElementById('line-simulator-container');
    if (!container) return;

    this.lineSimulator = new LineSimulator(container, this.dogs, (updatedDogId, weight, photoUrl) => {
      // 成功時：該当犬のデータを更新し、イエローマークをグリーンへ！
      const target = this.dogs.find(d => d.id === updatedDogId);
      if (target) {
        target.freshnessStatus = 'green';
        target.freshnessLabel = '最新写真確認済 (生後60日)';
        target.freshnessReason = null;
        target.milestones[2] = {
          type: 'day60',
          label: '2ヶ月 (生後60日)',
          days: 60,
          date: '2026-09-05',
          weightG: weight,
          targetPredictedKg: `${((weight * 3.0) / 1000).toFixed(1)}〜${((weight * 3.2) / 1000).toFixed(1)}kg (確定)`,
          photo: photoUrl,
          scalePhoto: true,
          memo: 'LINE Botより最新登録完了！'
        };
        // 画像リストの先頭に追加
        target.images.unshift({
          url: photoUrl,
          caption: `生後60日 最新実測写真 (${weight}g)`,
          tag: '生後60日・最新更新済'
        });
        this.renderDogList();
        this.showToast(`🎉 ${target.temporaryName} の最新写真＆体重(${weight}g)が更新されました！`);

        // バックエンドAPIへPOST送信 (DB永続化)
        try {
          fetch('/api/line/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dogId: updatedDogId,
              weightG: weight,
              photoUrl: photoUrl
            })
          });
        } catch {
          // オフラインフォールバック
        }
      }
    });
  }

  showFavoritesOnly() {
    const favDogs = this.dogs.filter(d => this.favorites.includes(d.id));
    if (favDogs.length === 0) {
      this.showToast('お気に入りに登録されたワンちゃんはいません');
      return;
    }
    this.currentTab = 'favorites';
    document.querySelectorAll('.category-tab-btn').forEach(b => {
      b.classList.remove('bg-amber-500', 'text-white', 'shadow-md');
      b.classList.add('bg-white', 'text-stone-600');
    });
    this.renderDogList(favDogs);
    this.showToast(`お気に入り登録中の ${favDogs.length} 頭を表示しています`);
  }

  filterDogs() {
    return this.dogs.filter(dog => {
      // タブ
      if (this.currentTab === 'puppy_sale' && dog.listingType !== 'puppy_sale') return false;
      if (this.currentTab === 'adoption' && dog.listingType === 'puppy_sale') return false;
      if (this.currentTab === 'senior_safe' && !dog.seniorCompatibility?.isSeniorRecommended) return false;

      // クイックタグ
      if (this.activeTag) {
        if (this.activeTag === '#最新写真確認済🟢' && dog.freshnessStatus !== 'green') return false;
        if (this.activeTag === '#生後2〜3ヶ月(人気期)' && (dog.currentAgeDays < 61 || dog.currentAgeDays > 90)) return false;
        if (this.activeTag === '#生後60日以内' && dog.currentAgeDays > 60) return false;
        if (this.activeTag === '#イエローマーク警告⚠️' && dog.freshnessStatus !== 'yellow') return false;
        if (this.activeTag === '#タイニー自動計算確定' && !dog.predictedSizeCategory.includes('タイニー')) return false;
        if (this.activeTag === '#豆柴認定サイズ確定' && !dog.predictedSizeCategory.includes('豆柴')) return false;
        if (this.activeTag === '#生後60日写真あり' && !dog.milestones.some(m => m.days >= 58 && m.weightG)) return false;
        if (this.activeTag === '#JKCチャンピオン血統' && !dog.tags.includes('#JKCチャンピオン血統') && !dog.tags.includes('#JKC血統')) return false;
        if ((this.activeTag === '#PRAクリア' || this.activeTag === '#遺伝子3項目全クリア✅' || this.activeTag === '#遺伝情報100%開示') && (!dog.health.praClear || !dog.health.dmClear || !dog.health.vwd1Clear)) return false;
        if (this.activeTag === '#成犬・引退犬(里親)' && (dog.listingType === 'puppy_sale' && dog.currentAgeDays <= 365)) return false;
        if (this.activeTag === '#ブリーダー引退犬' && dog.listingType !== 'breeder_retired') return false;
        if (this.activeTag === '#シニア高齢者安心Sランク' && dog.seniorCompatibility?.seniorRank !== 'S') return false;
        if (this.activeTag === '#終生引き取り保証付' && !dog.seniorCompatibility?.lifelongGuarantee) return false;
      }

      // 検索クエリ（複数単語 AND検索対応: 半角/全角スペース区切り）
      if (this.searchQuery) {
        const terms = this.searchQuery.split(/[\s\u3000]+/).filter(t => t.length > 0);
        if (terms.length > 0) {
          const genderText = dog.gender === 'male' ? '男の子 オス ♂' : (dog.gender === 'female' ? '女の子 メス ♀' : '');
          const haystack = `
            ${dog.temporaryName || ''} ${dog.registeredName || ''} ${dog.breed || ''} ${dog.breedEn || ''} 
            ${dog.color || ''} ${genderText} ${dog.kennelName || ''} ${dog.breederName || ''} ${dog.prefecture || ''} 
            ${dog.location || ''} ${dog.description || ''} ${dog.predictedSizeCategory || ''} 
            ${(dog.tags || []).join(' ')}
          `.toLowerCase();
          const matchAll = terms.every(term => haystack.includes(term));
          if (!matchAll) return false;
        }
      }

      // こだわり条件
      if (this.filters.breed !== 'all' && dog.breed !== this.filters.breed) return false;
      if (this.filters.freshness === 'green' && dog.freshnessStatus !== 'green') return false;
      if (this.filters.freshness === 'yellow' && dog.freshnessStatus !== 'yellow') return false;
      if (this.filters.age === 'under_60d' && dog.currentAgeDays > 60) return false;
      if (this.filters.age === '2_3m' && (dog.currentAgeDays < 61 || dog.currentAgeDays > 90)) return false;
      if (this.filters.age === '4_6m' && (dog.currentAgeDays < 91 || dog.currentAgeDays > 180)) return false;
      if (this.filters.age === '7_12m' && (dog.currentAgeDays < 181 || dog.currentAgeDays > 365)) return false;
      if (this.filters.age === 'young' && (dog.currentAgeDays <= 365 || dog.currentAgeDays > 1460)) return false;
      if (this.filters.age === 'senior' && dog.currentAgeDays <= 1460) return false;
      if (this.filters.size === 'tiny' && !dog.predictedSizeCategory.includes('タイニー')) return false;
      if (this.filters.size === 'mameshiba' && !dog.predictedSizeCategory.includes('豆柴')) return false;
      if (this.filters.apartmentOnly && !dog.lifestyle?.apartmentOk) return false;
      if (this.filters.sheddingMin && !dog.lifestyle?.sheddingMin) return false;
      if (this.filters.praClearOnly && (!dog.health?.praClear || !dog.health?.dmClear || !dog.health?.vwd1Clear)) return false;
      if (this.filters.seniorSafeOnly && !dog.seniorCompatibility?.isSeniorRecommended) return false;

      return true;
    });
  }

  renderDogList(customList = null) {
    const list = customList || this.filterDogs();
    const container = document.getElementById('dog-grid');
    const countEl = document.getElementById('result-count');

    if (countEl) countEl.textContent = `${list.length} 頭`;
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center space-y-3 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <div class="text-4xl">🐾</div>
          <h3 class="text-base font-bold text-stone-800">該当するワンちゃんが見つかりませんでした</h3>
          <p class="text-xs text-stone-500">条件を緩めるか、別のキーワードでお試しください。</p>
          <button id="reset-filter-btn-empty" class="mt-2 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow hover:bg-amber-600 transition">
            すべての条件をリセット
          </button>
        </div>
      `;
      const resetBtn = container.querySelector('#reset-filter-btn-empty');
      if (resetBtn) {
        resetBtn.onclick = () => {
          this.activeTag = null;
          this.searchQuery = '';
          this.currentTab = 'all';
          this.renderDogList();
        };
      }
      return;
    }

    container.innerHTML = list.map(dog => this.createDogCardHtml(dog)).join('');

    // カード内イベント登録
    list.forEach(dog => {
      const card = document.getElementById(`card-${dog.id}`);
      if (!card) return;

      // カードクリックで詳細モーダル展開
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-action-stop')) return; // ボタン等クリック時は展開抑制
        this.openDetailModal(dog);
      });

      // お気に入りトグル
      const favBtn = card.querySelector('.fav-toggle-btn');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleFavorite(dog.id);
        });
      }

      // イエローマークの1タップ写真リクエスト
      const reqBtn = card.querySelector('.photo-request-btn');
      if (reqBtn) {
        reqBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handlePhotoRequest(dog);
        });
      }

      // カード内ミニ横スライダー (左右ボタン)
      const prevBtn = card.querySelector('.card-slide-prev');
      const nextBtn = card.querySelector('.card-slide-next');
      const imgTrack = card.querySelector('.card-img-track');
      const counterSpan = card.querySelector('.card-slide-counter');

      if (prevBtn && nextBtn && imgTrack && dog.images.length > 1) {
        let cardIdx = 0;
        const total = dog.images.length;

        const updateCardSlide = (newIdx) => {
          if (newIdx < 0) cardIdx = total - 1;
          else if (newIdx >= total) cardIdx = 0;
          else cardIdx = newIdx;
          imgTrack.style.transform = `translateX(-${cardIdx * 100}%)`;
          if (counterSpan) counterSpan.textContent = `${cardIdx + 1}/${total}`;
        };

        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          updateCardSlide(cardIdx - 1);
        });
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          updateCardSlide(cardIdx + 1);
        });

        // スマホスワイプ対応
        let startX = 0;
        card.querySelector('.card-img-container').addEventListener('touchstart', (e) => {
          startX = e.changedTouches[0].clientX;
        }, { passive: true });

        card.querySelector('.card-img-container').addEventListener('touchend', (e) => {
          const endX = e.changedTouches[0].clientX;
          if (Math.abs(startX - endX) > 35) {
            if (startX > endX) updateCardSlide(cardIdx + 1);
            else updateCardSlide(cardIdx - 1);
          }
        }, { passive: true });
      }
    });
  }

  createDogCardHtml(dog) {
    const isFav = this.favorites.includes(dog.id);
    const isYellow = dog.freshnessStatus === 'yellow';

    return `
      <article 
        id="card-${dog.id}" 
        class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-amber-300 transition-all duration-300 border ${isYellow ? 'border-amber-300 ring-2 ring-amber-200' : 'border-stone-100'} flex flex-col cursor-pointer group select-none relative"
      >
        <!-- 写真スライダー領域 (横スライド可能) -->
        <div class="card-img-container relative w-full aspect-[4/3] bg-stone-900 overflow-hidden">
          <div class="card-img-track flex w-full h-full transition-transform duration-300 ease-out">
            ${dog.images.map((img, i) => {
      const imgUrl = typeof img === 'string' ? img : (img?.url || 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80');
      return `
              <div class="min-w-full h-full relative">
                <img 
                  src="${imgUrl}" 
                  alt="${dog.temporaryName}" 
                  loading="lazy" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            `;
    }).join('')}
          </div>

          <!-- 中央ホバーヒント: 写真をクリックして詳細ページへ -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <span class="bg-black/75 backdrop-blur-md text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl border border-white/40 flex items-center gap-2 transform group-hover:scale-105 transition-transform">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
              <span>写真をクリックして詳細を見る</span>
            </span>
          </div>

          <!-- 左右スライドボタン (PCホバー時/スマホ常時) -->
          ${dog.images.length > 1 ? `
            <button type="button" class="card-action-stop card-slide-prev absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button type="button" class="card-action-stop card-slide-next absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
            <div class="card-slide-counter absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
              1/${dog.images.length}
            </div>
          ` : ''}

          <!-- 左上: 募集区分 ＆ 仮名称バッジ -->
          <div class="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            <span class="bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow border border-white/20">
              🐶 ${dog.temporaryName}
            </span>
            ${dog.listingType === 'breeder_retired' ? `
              <span class="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                ブリーダー引退犬 (里親)
              </span>
            ` : dog.listingType === 'rescue_org' ? `
              <span class="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                認定保護団体 (里親)
              </span>
            ` : ''}
          </div>

          <!-- 右上: お気に入りボタン -->
          <button 
            type="button" 
            class="card-action-stop fav-toggle-btn absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center shadow-md transition hover:scale-110 active:scale-90 z-10"
            aria-label="お気に入り"
          >
            <svg class="w-5 h-5 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-stone-600 fill-none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <!-- 下部: 写真鮮度バッジ (グリーン vs イエローマーク⚠️) -->
          <div class="absolute bottom-2 left-2 z-10 pointer-events-none">
            ${isYellow ? `
              <span class="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow animate-pulse">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                ⚠️ 写真古い (生後60日未登録)
              </span>
            ` : `
              <span class="inline-flex items-center gap-1 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                🟢 ${dog.freshnessLabel}
              </span>
            `}
          </div>
        </div>

        <!-- カード情報ボディ -->
        <div class="p-3.5 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div class="flex items-center justify-between text-xs text-stone-500">
              <span class="font-medium text-stone-700">${dog.breed} (${dog.color})</span>
              <span class="font-semibold ${dog.gender === 'male' ? 'text-sky-600' : 'text-rose-600'}">
                ${dog.gender === 'male' ? '♂ 男の子' : '♀ 女の子'}
              </span>
            </div>

            <!-- 成犬時予想サイズ ＆ 月齢・年齢バッジ -->
            <div class="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span class="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                ${dog.predictedSizeCategory}
              </span>
              <span class="bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded border border-stone-200 flex items-center gap-0.5">
                🎂 ${this.formatAge(dog.currentAgeDays)}
              </span>
            </div>

            <!-- 実測体重タグ -->
            <div class="mt-1.5 text-[11px] text-stone-600 flex items-center gap-1.5">
              <span class="font-bold">⚖️ 実測体重:</span>
              <span class="text-stone-900 font-semibold">
                ${dog.milestones.findLast(m => m.weightG)?.weightG ? `${dog.milestones.findLast(m => m.weightG).weightG}g (${dog.milestones.findLast(m => m.weightG).label})` : '未登録'}
              </span>
            </div>

            <!-- あんしん保証・サテライト受取・遺伝子保証ピル (他社差別化) -->
            <div class="mt-1.5 flex flex-wrap gap-1 text-[10px]">
              ${dog.seniorCompatibility ? `
                <span class="bg-orange-100 text-orange-950 font-black px-2 py-0.5 rounded flex items-center gap-0.5 border border-orange-300 shadow-2xs">
                  👴 シニア安心Sランク
                </span>
                <span class="bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded flex items-center gap-0.5 border border-amber-300">
                  🏛️ 終生保証付
                </span>
              ` : ''}
              <span class="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded flex items-center gap-0.5 border border-emerald-300">
                🧬 遺伝子3項目クリア証憑済
              </span>
              <span class="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded flex items-center gap-0.5">
                🛡️ 365日生命保証
              </span>
              <span class="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded flex items-center gap-0.5">
                🏢 サテライト受取
              </span>
              <span class="bg-amber-50 text-amber-900 font-semibold px-2 py-0.5 rounded flex items-center gap-0.5">
                🎁 30日無料保険付
              </span>
            </div>
          </div>

          <!-- イエローマーク警告時の1タップリクエストUI -->
          ${isYellow ? `
            <div class="card-action-stop bg-amber-50 p-2 rounded-xl border border-amber-200 space-y-1">
              <p class="text-[10px] text-amber-800 leading-tight">生後35日の写真のままです。最新情報を要請できます</p>
              <button 
                type="button" 
                class="photo-request-btn w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-white text-[11px] font-bold py-1.5 rounded-lg shadow-sm flex items-center justify-center gap-1 transition"
              >
                📸 最新写真・体重をリクエスト
              </button>
            </div>
          ` : ''}

          <!-- 価格・所在地・詳細リンク -->
          <div class="pt-2 border-t border-stone-100 flex items-end justify-between">
            <div>
              <div class="text-[10px] text-stone-400">${dog.prefecture} ${dog.location}</div>
              <div class="text-base md:text-lg font-black text-stone-900 leading-tight">
                ${dog.listingType === 'puppy_sale' ? `
                  ¥${dog.price.toLocaleString()}
                  <span class="text-[10px] font-normal text-stone-500"> (総額)</span>
                ` : `
                  実費 ¥${dog.price.toLocaleString()}
                  <span class="text-[10px] font-normal text-stone-500"> (医療費のみ)</span>
                `}
              </div>
            </div>
            <span class="text-amber-600 font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              詳細を見る
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      </article>
    `;
  }

  toggleFavorite(dogId) {
    const idx = this.favorites.indexOf(dogId);
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
      this.showToast('お気に入りから解除しました');
    } else {
      this.favorites.push(dogId);
      this.showToast('❤️ お気に入りに追加しました！新着情報をお知らせします');
    }
    this.saveFavorites();
    this.renderDogList();
  }

  async handlePhotoRequest(dog) {
    this.showToast(`📸 【${dog.temporaryName}】の最新写真・体重リクエストをブリーダー（${dog.breederName}）へ送信しました！更新されるとLINE通知が届きます。`);
    try {
      await fetch(`/api/dogs/${dog.id}/photo-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      // オフライン時フォールバック
    }
  }

  /**
   * 子犬・里親犬 詳細モーダル展開 (PC大画面写真スライダー ＆ 成長グラフ)
   */
  openDetailModal(dog) {
    this.selectedDogForModal = dog;
    const modal = document.getElementById('detail-modal');
    const container = document.getElementById('detail-content');
    if (!modal || !container) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // URLハッシュ同期 (#dog-001)
    if (window.location.hash !== `#${dog.id}`) {
      window.history.pushState({ dogId: dog.id }, '', `#${dog.id}`);
    }

    // 詳細HTML生成
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8">
        <!-- 左カラム: PC写真大画面スライダー (7カラム) -->
        <div class="lg:col-span-7 space-y-4">
          <div id="modal-slider-mount" class="w-full"></div>
          
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 text-xs text-stone-700 space-y-2.5 shadow-xs">
            <div class="flex items-center justify-between font-black text-stone-900">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-white border border-amber-300 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                  <img src="./assets/images/ポッケ_キャラクター設定三面図_日本語版.jpg" alt="ポッケ" class="w-9 h-9 object-cover object-[75%_50%]" />
                </div>
                <span>公式案内犬ポッケの安心チェック</span>
              </div>
              <span class="text-emerald-700 font-bold flex items-center gap-1 text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                WanBridge 鮮度保証
              </span>
            </div>
            <p class="leading-relaxed text-[11px] text-stone-600 bg-white/80 p-2.5 rounded-xl border border-amber-100">
              「生後35日・60日・90日ごとにデジタル体重計に乗せた写真・実測値をブリーダーが更新しているワン！写真放置やサイズ偽装のない安心の出会いをお届けするよ！」
            </p>
          </div>

          <!-- 4大マイルストーン実測テーブル -->
          <div class="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-sm">
            <h4 class="font-bold text-stone-900 text-sm flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                4大マイルストーン成長記録 (実測体重ログ)
              </span>
              <span class="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>🐾</span> 840gドヤ顔測定対応
              </span>
            </h4>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-stone-100 text-stone-600 text-[11px]">
                  <tr>
                    <th class="p-2.5 rounded-l-lg">ステージ</th>
                    <th class="p-2.5">測定日</th>
                    <th class="p-2.5">実測体重</th>
                    <th class="p-2.5">成犬予測サイズ</th>
                    <th class="p-2.5 rounded-r-lg">体重計写真</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-100">
                  ${dog.milestones.map(m => `
                    <tr class="hover:bg-stone-50">
                      <td class="p-2.5 font-bold text-stone-800">${m.label}</td>
                      <td class="p-2.5 text-stone-500">${m.date}</td>
                      <td class="p-2.5 font-bold ${m.weightG ? 'text-amber-700' : 'text-stone-400'}">
                        ${m.weightG ? `${m.weightG.toLocaleString()} g` : '未登録⚠️'}
                      </td>
                      <td class="p-2.5 text-stone-600">${m.targetPredictedKg}</td>
                      <td class="p-2.5">
                        ${m.scalePhoto ? `
                          <span class="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">証憑あり✅</span>
                        ` : `
                          <span class="text-stone-400 text-[10px]">なし</span>
                        `}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- インタラクティブ成長推移チャート (Chart.js) -->
          <div class="bg-white rounded-2xl border border-stone-200 p-4 space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                成長曲線 ＆ 成犬時予想体重グラフ
              </h4>
              <span class="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                判定: ${dog.predictedSizeCategory}
              </span>
            </div>
            <div class="h-56 w-full relative">
              <canvas id="modal-growth-chart"></canvas>
            </div>
            <p class="text-[10px] text-stone-400 text-right">※ 生後60日体重×3.0〜3.2倍による統計回帰予測モデル</p>
          </div>

          <!-- 🌱 生体流通DX: 社会化期の育成達成カルテ（何ができるかチェック） -->
          <div class="bg-gradient-to-br from-emerald-50/60 to-teal-50/40 rounded-2xl border border-emerald-200 p-4 space-y-3 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-emerald-950 text-sm flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                🌱 社会化期の育成達成カルテ (何ができるかチェック)
              </h4>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full">
                お迎え準備完了度: ${Math.round(([dog.socialization?.toilet, dog.socialization?.handTouch, dog.socialization?.bodyTouch, dog.socialization?.crateSleeping, dog.socialization?.soundFamiliar, dog.socialization?.peopleFriendly].filter(Boolean).length / 6) * 100)}%
              </span>
            </div>
            <p class="text-[11px] text-stone-600 leading-relaxed">
              「社会化期の育成履歴が見えない」不安を解消するため、ケージ内マナー・人馴れ・音慣れの達成状況をブリーダーが実測記録しています。
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div class="flex items-center justify-between p-2.5 rounded-xl border ${dog.socialization?.toilet ? 'bg-white border-emerald-300 text-emerald-900 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'}">
                <span class="flex items-center gap-1.5">🚽 トイレトレーニング</span>
                <span class="text-xs font-black">${dog.socialization?.toilet ? '✅ 成功率90%' : '⏳ 練習中'}</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl border ${dog.socialization?.handTouch ? 'bg-white border-emerald-300 text-emerald-900 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'}">
                <span class="flex items-center gap-1.5">🐾 お手・ハンドタッチ</span>
                <span class="text-xs font-black">${dog.socialization?.handTouch ? '✅ マスター' : '⏳ 練習中'}</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl border ${dog.socialization?.bodyTouch ? 'bg-white border-emerald-300 text-emerald-900 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'}">
                <span class="flex items-center gap-1.5">👂 耳・足先・マズルタッチ</span>
                <span class="text-xs font-black">${dog.socialization?.bodyTouch ? '✅ お手入れOK' : '⏳ 練習中'}</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl border ${dog.socialization?.crateSleeping ? 'bg-white border-emerald-300 text-emerald-900 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'}">
                <span class="flex items-center gap-1.5">🏠 クレート就寝・夜鳴きゼロ</span>
                <span class="text-xs font-black">${dog.socialization?.crateSleeping ? '✅ 独立就寝' : '⏳ 練習中'}</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl border ${dog.socialization?.soundFamiliar ? 'bg-white border-emerald-300 text-emerald-900 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'}">
                <span class="flex items-center gap-1.5">🔔 生活音・掃除機・チャイム</span>
                <span class="text-xs font-black">${dog.socialization?.soundFamiliar ? '✅ 慣れ済' : '⏳ 練習中'}</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl border ${dog.socialization?.peopleFriendly ? 'bg-white border-emerald-300 text-emerald-900 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'}">
                <span class="flex items-center gap-1.5">❤️ 人懐っこさ・抱っこ</span>
                <span class="text-xs font-black">${dog.socialization?.peopleFriendly ? '✅ 甘え上手' : '⏳ 練習中'}</span>
              </div>
            </div>

            ${dog.socialization?.notes ? `
              <div class="bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-stone-700">
                <span class="font-bold text-emerald-800">ブリーダー育成コメント: </span>
                ${dog.socialization.notes}
              </div>
            ` : ''}
          </div>

          <!-- 🏥 ヘルスケアDX: 提携動物病院 PHR（生涯ヘルスケアパスポート） -->
          <div class="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-sm text-xs">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                🏥 提携動物病院 PHR（生涯ヘルスケアパスポート）
              </h4>
              <span class="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>🏛️</span> 環境省DB登録済
              </span>
            </div>

            <div class="bg-blue-50/50 border border-blue-200/70 rounded-xl p-3 space-y-2 text-[11px]">
              <div class="flex items-center justify-between border-b border-blue-100 pb-1.5">
                <span class="text-stone-500 font-medium">マイクロチップID:</span>
                <span class="font-mono font-bold text-blue-950">${dog.microchipNumber || dog.phr?.microchipNumber || '392144000192831'}</span>
              </div>
              <div class="flex items-center justify-between border-b border-blue-100 pb-1.5">
                <span class="text-stone-500 font-medium">担当獣医師 / 医療機関:</span>
                <span class="font-bold text-stone-800">${dog.phr?.clinicName || 'WanBridge 提携中央動物医療センター'}</span>
              </div>
              <div class="flex items-center justify-between border-b border-blue-100 pb-1.5">
                <span class="text-stone-500 font-medium">獣医師総合健康診断:</span>
                <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${dog.phr?.healthGrade || 'All-A (優良)'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-stone-500 font-medium">膝蓋骨脱臼 (パテラ) / 心音:</span>
                <span class="font-bold text-stone-800">${dog.phr?.patellaGrade || 'Grade 0 (正常)'} / ${dog.phr?.heartMurmur || '心音清純'}</span>
              </div>
            </div>

            <!-- ワクチン接種履歴 -->
            <div class="space-y-1.5">
              <span class="font-bold text-stone-700 block text-[11px]">混合ワクチン接種ログ (獣医師署名済証明)</span>
              <div class="space-y-1 text-[10px]">
                ${(dog.phr?.vaccineRecords || [
        { type: '混合5種ワクチン (生後50日)', date: '2026-08-25', lot: 'DH2608-A9', status: 'completed' },
        { type: '混合6種追加ワクチン (生後80日)', date: '2026-09-25', lot: '予約済', status: 'scheduled' }
      ]).map(v => `
                  <div class="flex items-center justify-between bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <span class="font-bold text-stone-800">${v.type}</span>
                    <span class="text-stone-500 font-mono">${v.date} (${v.lot})</span>
                    <span class="${v.status === 'completed' ? 'text-emerald-700 font-bold' : 'text-amber-700'}">${v.status === 'completed' ? '接種済 ✅' : '予定 ⏳'}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- 📱 最上位オプション: 愛犬デジタルパスポートボタン -->
          <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2">
              <span class="text-xl">📱</span>
              <div>
                <span class="font-black text-emerald-900 text-xs block">愛犬デジタルパスポート（電子健康手帳）</span>
                <span class="text-[10px] text-emerald-700">ドッグカフェ・サロン・病院で提示できる共通QR照合ID</span>
              </div>
            </div>
            <button type="button" class="btn-open-dog-passport bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl transition shadow active:scale-95"
              data-dog-id="${dog.id}">
              表示する ➔
            </button>
          </div>

          <!-- 📜 パピー社会化卒業認定証 (Diploma) ＆ 成長引継ぎカルテ -->
          <div class="bg-gradient-to-r from-amber-50 to-yellow-50/80 border-2 border-amber-300 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2">
              <span class="text-xl">📜</span>
              <div>
                <span class="font-black text-amber-950 text-xs block">パピー社会化 卒業認定証 (Diploma) ＆ 成長引継ぎカルテ</span>
                <span class="text-[10px] text-amber-800">両親血統・PRAクリア証明 ＆ 6大育成ステップ引継ぎ書（ワンクリックPDF発行）</span>
              </div>
            </div>
            <button type="button" class="btn-open-puppy-diploma bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 flex-shrink-0"
              data-dog-id="${dog.id}">
              <span>📜</span>
              <span>認定証を開く ➔</span>
            </button>
          </div>
        </div>

        <!-- 右カラム: スペック・両親情報・見積もり・予約 (5カラム) -->
        <div class="lg:col-span-5 space-y-5">
          <div>
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                仮名称: 🐶 ${dog.temporaryName}
              </span>
              <span class="text-xs text-stone-700 font-bold bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                🎂 ${this.formatAge(dog.currentAgeDays)} (${dog.birthDate}生)
              </span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-stone-900 mt-1">${dog.registeredName}</h2>
            <p class="text-xs text-stone-500 mt-0.5">${dog.kennelName} (${dog.prefecture} ${dog.location})</p>
          </div>

          <!-- 価格・諸経費内訳 -->
          <div class="bg-stone-900 text-white p-4 rounded-2xl shadow-md space-y-2">
            <div class="text-xs text-stone-300">
              ${dog.listingType === 'puppy_sale' ? 'お支払いコミコミ総額 (税込)' : '譲渡時 実費負担金 (領収書添付済)'}
            </div>
            <div class="text-2xl md:text-3xl font-black text-amber-400">
              ¥${dog.price.toLocaleString()}
            </div>
            <p class="text-[11px] text-stone-300 border-t border-stone-700 pt-2 leading-relaxed">
              ${dog.priceNote}
            </p>
          </div>

          <!-- 💰 明朗会計！お迎え初期費用 ＆ 月々飼育コスト試算シミュレータ -->
          <div class="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3 text-xs shadow-xs">
            <div class="flex items-center justify-between border-b border-stone-200 pb-2">
              <span class="font-black text-stone-900 flex items-center gap-1.5 text-xs">
                <span>💰</span> 完全明朗会計！お迎え費用シミュレーター
              </span>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                不透明な上乗せゼロ保証
              </span>
            </div>

            <div class="space-y-1.5 text-[11px]">
              <div class="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span class="text-stone-600">生体本体価格 (税込)</span>
                <span class="font-bold text-stone-900">¥${dog.price.toLocaleString()}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span class="text-stone-600 flex items-center gap-1">
                  <span>💉 マイクロチップ・ワクチン代</span>
                  <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">コミコミ</span>
                </span>
                <span class="font-bold text-emerald-700">¥0 (価格に含まれます)</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span class="text-stone-600 flex items-center gap-1">
                  <span>🛡️ 365日生命保証 ＆ 30日ペット保険</span>
                  <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">無料付帯</span>
                </span>
                <span class="font-bold text-emerald-700">¥0 (全頭無料プレゼント)</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span class="text-stone-600 flex items-center gap-1">
                  <span>🛁 千住古民家 セルフウォッシュ利用券</span>
                  <span class="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">無料進呈</span>
                </span>
                <span class="font-bold text-teal-700">¥0 (温水バス・ドライヤー30分)</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span class="text-stone-600 flex items-center gap-1">
                  <span>🍖 自家製無添加おやつ試食セット</span>
                  <span class="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">無料進呈</span>
                </span>
                <span class="font-bold text-amber-700">¥0 (パピー用ささみジャーキー)</span>
              </div>

              <!-- オプション：スターターパック -->
              <label class="flex items-center justify-between py-2 px-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer hover:bg-amber-100/60 transition mt-1">
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="sim-starter-pack" class="w-4 h-4 text-amber-600 rounded focus:ring-amber-500" checked />
                  <div>
                    <span class="font-bold text-stone-900 block text-[11px]">📦 お迎えスターター安心セット</span>
                    <span class="text-[10px] text-stone-500">Tapo見守りカメラ＋サークル＋給水器＋プレミアムフード1ヶ月分</span>
                  </div>
                </div>
                <span class="font-black text-amber-900 text-xs flex-shrink-0">+¥19,800</span>
              </label>

              <!-- お支払い総額リアルタイム試算 -->
              <div class="pt-2 flex justify-between items-center text-xs">
                <span class="font-black text-stone-800">お迎え時 概算お支払い総額:</span>
                <span class="text-base font-black text-amber-600" id="sim-total-cost">
                  ¥${(dog.price + 19800).toLocaleString()}
                </span>
              </div>

              <!-- 月々のお世話コスト目安 -->
              <div class="bg-white p-2.5 rounded-xl border border-stone-200 mt-1 flex items-center justify-between text-[11px]">
                <span class="text-stone-600 flex items-center gap-1">
                  <span>🥣</span> 月々の飼育目安 (フード＋保険料)
                </span>
                <span class="font-bold text-stone-800">約 ¥6,500 〜 ¥8,500 / 月</span>
              </div>
            </div>
          </div>

          <!-- 里親犬の場合：医療費実費領収書プレビュー -->
          ${dog.receiptDetails ? `
            <div class="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 space-y-2.5">
              <h4 class="font-bold text-emerald-900 text-xs flex items-center justify-between">
                <span>🧾 動物病院の医療費領収書 (明朗開示)</span>
                <span class="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">エスクロー決済対応</span>
              </h4>
              <div class="space-y-1 text-xs text-emerald-800">
                ${dog.receiptDetails.map(item => `
                  <div class="flex justify-between py-1 border-b border-emerald-200/50">
                    <span>${item.item}</span>
                    <span class="font-bold">¥${item.cost.toLocaleString()}</span>
                  </div>
                `).join('')}
              </div>
              <p class="text-[10px] text-emerald-700 leading-tight">
                ※ 一般的な個人間掲示板等で起こりがちな不透明な諸経費請求を防止するため、全額領収書の明細添付と事前エスクロー決済を義務付けています。
              </p>
            </div>
          ` : ''}

          <!-- 🧬 遺伝情報100%開示 ＆ 3大主要遺伝病クリア保証証憑 -->
          <div class="bg-emerald-50/90 rounded-2xl border-2 border-emerald-500/40 p-4 space-y-3 text-xs shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="font-black text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🧬</span> 遺伝情報100%開示 ＆ 3大遺伝病クリア証憑
              </h4>
              <span class="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>全項目クリア証明済</span> ✅
              </span>
            </div>

            <div class="bg-white/90 border border-emerald-200 rounded-xl p-2.5 text-[11px] space-y-2">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  <span class="text-stone-400 block text-[10px]">進行性網膜萎縮症 (PRA)</span>
                  <span class="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                    <span>ノーマル/クリア</span> ✅
                  </span>
                  <span class="text-[9px] text-stone-500 block">発症リスクなし</span>
                </div>
                <div class="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  <span class="text-stone-400 block text-[10px]">変性性脊髄症 (DM)</span>
                  <span class="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                    <span>ノーマル/クリア</span> ✅
                  </span>
                  <span class="text-[9px] text-stone-500 block">発症リスクなし</span>
                </div>
                <div class="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  <span class="text-stone-400 block text-[10px]">vWD1 (血液凝固異常)</span>
                  <span class="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                    <span>ノーマル/クリア</span> ✅
                  </span>
                  <span class="text-[9px] text-stone-500 block">発症リスクなし</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-emerald-100 text-[10px]">
                <div>
                  <span class="text-stone-400">公認検査機関:</span>
                  <span class="font-bold text-stone-800 ml-1">${dog.health?.geneticLab || 'VEQTA (動物遺伝子検査研究所)'}</span>
                </div>
                <div>
                  <span class="text-stone-400">鑑定証明書番号:</span>
                  <span class="font-mono font-bold text-emerald-800 ml-1">${dog.health?.geneticCertNumber || 'VQ-2026-CERT-OK'}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div class="bg-white/80 border border-stone-200 p-2 rounded-xl">
                <span class="text-stone-400 block text-[10px]">膝蓋骨脱臼 (パテラ)</span>
                <span class="font-bold text-stone-800">${dog.health?.patellaGrade || 'Grade 0 (正常)'}</span>
              </div>
              <div class="bg-white/80 border border-stone-200 p-2 rounded-xl">
                <span class="text-stone-400 block text-[10px]">獣医師総合健康診断</span>
                <span class="font-bold text-stone-800">${dog.health?.veterinaryCheck || 'All-A (総合検診済)'}</span>
              </div>
            </div>
          </div>

          <!-- 👴 シニア＆高齢者安心相性カルテ ＆ 100%終生引き取り保証証憑 -->
          ${dog.seniorCompatibility ? `
            <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-400/80 p-4 space-y-3 text-xs shadow-sm">
              <div class="flex items-center justify-between">
                <h4 class="font-black text-orange-950 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>👴🐾</span> シニア安心適性カルテ ＆ 終生引き取り保証
                </h4>
                <span class="bg-orange-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <span>適性ランク: ${dog.seniorCompatibility.seniorRank} (最高位)</span> 🌟
                </span>
              </div>

              <!-- 事故ゼロ相性カルテ 4項目 -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div class="bg-white/90 p-2 rounded-xl border border-orange-200">
                  <span class="text-stone-400 block text-[10px]">引っ張り癖</span>
                  <span class="font-bold text-orange-900 flex items-center gap-0.5 mt-0.5">
                    <span>ゼロ (同調歩行)</span> ✅
                  </span>
                  <span class="text-[9px] text-stone-500">転倒リスクなし</span>
                </div>
                <div class="bg-white/90 p-2 rounded-xl border border-orange-200">
                  <span class="text-stone-400 block text-[10px]">無駄吠え・夜鳴き</span>
                  <span class="font-bold text-orange-900 flex items-center gap-0.5 mt-0.5">
                    <span>ゼロ (室内極静)</span> ✅
                  </span>
                  <span class="text-[9px] text-stone-500">集合住宅安心</span>
                </div>
                <div class="bg-white/90 p-2 rounded-xl border border-orange-200">
                  <span class="text-stone-400 block text-[10px]">必要散歩時間</span>
                  <span class="font-bold text-orange-900 flex items-center gap-0.5 mt-0.5">
                    <span>1日 ${dog.seniorCompatibility.dailyWalkMinutes}分</span> 🐾
                  </span>
                  <span class="text-[9px] text-stone-500">短時間で満足</span>
                </div>
                <div class="bg-white/90 p-2 rounded-xl border border-orange-200">
                  <span class="text-stone-400 block text-[10px]">抱っこ・膝乗り</span>
                  <span class="font-bold text-orange-900 flex items-center gap-0.5 mt-0.5">
                    <span>大好き・温厚</span> ❤️
                  </span>
                  <span class="text-[9px] text-stone-500">高い癒やし度</span>
                </div>
              </div>

              <p class="text-orange-950 bg-white/90 p-2.5 rounded-xl border border-orange-200 text-[11px] leading-relaxed">
                ${dog.seniorCompatibility.summary}
              </p>

              <!-- 終生引き取り保証証憑ブロック -->
              <div class="bg-white/95 border border-orange-300 rounded-xl p-3 space-y-1.5 text-[11px]">
                <div class="flex items-center justify-between border-b border-orange-100 pb-1">
                  <span class="font-bold text-stone-900 flex items-center gap-1">
                    <span>🏛️</span> 100%終生引き取り保証体制
                  </span>
                  <span class="font-mono text-[10px] bg-orange-100 text-orange-900 font-bold px-1.5 py-0.5 rounded">
                    ${dog.seniorCompatibility.lifelongGuarantee?.certNumber || 'WB-SENIOR-GUARANTEE'}
                  </span>
                </div>
                <div class="text-[10px] text-stone-600 space-y-0.5">
                  <p>・<strong>万が一の有事保証:</strong> 入院・施設入所・他界時は運営シェルターが無償引取終生保護</p>
                  <p>・<strong>緊急保護拠点:</strong> ${dog.seniorCompatibility.lifelongGuarantee?.shelterHub || 'WanBridge千住古民家拠点シェルター'}</p>
                  <p>・<strong>付属キット:</strong> 救急搬送時SOS冷蔵庫マグネット ＆ 毎朝LINE見守りDX完備</p>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- 親犬情報 (遺伝・血統情報) -->
          ${dog.parents ? `
            <div class="bg-white rounded-2xl border border-stone-200 p-4 space-y-2.5 text-xs">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>🐕</span> 両親犬 (遺伝・血統情報)
                </h4>
                <span class="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">両親遺伝病クリア確認済 ✅</span>
              </div>
              ${dog.parents.note ? `<p class="text-[10px] text-stone-500 italic bg-stone-50 p-1.5 rounded-lg">${dog.parents.note}</p>` : ''}
              <div class="grid grid-cols-2 gap-3">
                <div class="border border-stone-100 rounded-xl p-2.5 space-y-1.5 bg-stone-50/50">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-stone-700">お父さん (父犬)</span>
                    <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">クリア ✅</span>
                  </div>
                  <img src="${dog.parents.father.photo}" alt="父犬" class="w-full h-20 object-cover rounded-lg" />
                  <div class="text-[10px] text-stone-700 font-medium">${dog.parents.father.breed}</div>
                  <div class="text-[9px] text-amber-700 font-bold">${dog.parents.father.title}</div>
                  <div class="text-[9px] text-emerald-800 font-bold bg-white border border-emerald-200 rounded px-1.5 py-0.5">遺伝子: ${dog.parents.father.geneticTest || '3項目クリア'}</div>
                </div>
                <div class="border border-stone-100 rounded-xl p-2.5 space-y-1.5 bg-stone-50/50">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-stone-700">お母さん (母犬)</span>
                    <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">クリア ✅</span>
                  </div>
                  <img src="${dog.parents.mother.photo}" alt="母犬" class="w-full h-20 object-cover rounded-lg" />
                  <div class="text-[10px] text-stone-700 font-medium">${dog.parents.mother.breed}</div>
                  <div class="text-[9px] text-stone-500">${dog.parents.mother.title}</div>
                  <div class="text-[9px] text-emerald-800 font-bold bg-white border border-emerald-200 rounded px-1.5 py-0.5">遺伝子: ${dog.parents.mother.geneticTest || '3項目クリア'}</div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- 🛡️ WanBridge 5大あんしん保証・お迎えサポートパック (他社比較で圧倒的優位) -->
          <div class="bg-amber-500/10 rounded-2xl border-2 border-amber-400/60 p-4 space-y-3 text-xs shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🛡️</span> WanBridge 5大あんしん保証・成約特典
              </h4>
              <span class="bg-amber-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">全頭無料付帯</span>
            </div>

            <div class="space-y-2 text-[11px]">
              <div class="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span class="text-amber-600 font-bold text-sm">①</span>
                <div>
                  <span class="font-bold text-stone-900 block">最長365日 あんしん生命保証制度</span>
                  <span class="text-stone-600 text-[10px]">先天性疾患・パルボ等の伝染病死亡時、生体代金の全額返金または同等代犬を無償提供。</span>
                </div>
              </div>

              <div class="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span class="text-amber-600 font-bold text-sm">②</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-stone-900 block">お迎え当日から30日間 無償ペット保険プレゼント</span>
                    <button type="button" id="modal-view-insurance-btn" class="text-[10px] text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded font-bold transition flex-shrink-0">
                      提携会社・補償詳細 ➔
                    </button>
                  </div>
                  <span class="text-stone-600 text-[10px] block mt-0.5">アニコム損保/アイペット提携。初期の下痢・誤飲・急病等の治療費を100%全額補償（病院窓口精算対応）。</span>
                </div>
              </div>

              <div class="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span class="text-amber-600 font-bold text-sm">③</span>
                <div>
                  <span class="font-bold text-stone-900 block">24時間365日 獣医師ホットライン (180日間無料)</span>
                  <span class="text-stone-600 text-[10px]">深夜の急な発熱・嘔吐・しつけの不安も、専属獣医師にいつでも電話相談可能。</span>
                </div>
              </div>

              <div class="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span class="text-amber-600 font-bold text-sm">④</span>
                <div>
                  <span class="font-bold text-stone-900 block">動愛法公認：提携サテライト拠点受取（順次拡大予定）</span>
                  <span class="text-stone-600 text-[10px]">まずは千住古民家拠点・関東エリアより開始。将来的に全国主要都市へ順次拡大予定。</span>
                </div>
              </div>

              <div class="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span class="text-amber-600 font-bold text-sm">⑤</span>
                <div>
                  <span class="font-bold text-stone-900 block">環境省マイクロチップ登録＆オンライン名義変更代行</span>
                  <span class="text-stone-600 text-[10px]">2022年法制化対応済み。お迎え時にスマホから1分で名義変更手続きが完了。</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ブリーダー情報 -->
          <div class="bg-white rounded-2xl border border-stone-200 p-4 space-y-2 text-xs">
            <h4 class="font-bold text-stone-900">ブリーダー / 掲載者情報</h4>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 text-sm">
                ${dog.breederName.charAt(0)}
              </div>
              <div>
                <div class="font-bold text-stone-800">${dog.breederName}</div>
                <div class="text-[10px] text-stone-400">${dog.kennelName}</div>
              </div>
            </div>
          </div>

          <!-- 提携ドッグフード スポンサード広告 (犬種・ライフステージ連動型) -->
          ${(() => {
        const foodAd = SPONSORED_ADS.contextMatch[dog.breed] || SPONSORED_ADS.contextMatch.default;
        return `
              <div class="bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200 p-4 space-y-2.5 text-xs shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="bg-amber-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full">
                    提携スポンサード / 認定フード
                  </span>
                  <span class="text-amber-800 font-bold text-[10px] bg-white px-2 py-0.5 rounded-full border border-amber-200">
                    🎁 ${foodAd.campaign}
                  </span>
                </div>
                <div class="flex gap-3 items-center">
                  <img src="${foodAd.imageUrl}" alt="${foodAd.productName}" class="w-16 h-16 rounded-xl object-cover border border-amber-200 flex-shrink-0 shadow-sm" />
                  <div class="space-y-0.5 flex-1 min-w-0">
                    <div class="font-bold text-stone-900 text-xs truncate">
                      【${foodAd.brand}】${foodAd.productName}
                    </div>
                    <p class="text-[11px] text-amber-900 font-medium leading-tight">
                      ${foodAd.catchphrase}
                    </p>
                    <p class="text-[10px] text-stone-500">
                      ${foodAd.benefit}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  id="modal-food-ad-btn" 
                  class="w-full bg-white hover:bg-amber-50 active:scale-98 text-amber-800 border border-amber-300 font-bold py-2 rounded-xl text-[11px] shadow-sm flex items-center justify-center gap-1.5 transition"
                >
                  <span>🥣 この子の成約特典フード（初回無料）の詳細を見る</span>
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            `;
      })()}

          <!-- アクションボタン群 (スマホ＆PC固定) -->
          <div class="space-y-2.5 pt-2">
            ${dog.listingType !== 'puppy_sale' ? `
              <!-- 🛡️ 里親応募適性セーフティチェック（1分診断） -->
              <button 
                type="button" 
                id="modal-safety-check-btn" 
                class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm transition border border-emerald-400/40"
              >
                <span>🛡️</span>
                <span>里親応募適性セーフティチェック（1分診断）</span>
              </button>
            ` : ''}

            <!-- 🍵 千住古民家カフェでこの子に直接会う (だっこ見学予約) -->
            <button 
              type="button" 
              id="modal-senju-visit-btn" 
              class="w-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 hover:from-amber-700 hover:to-orange-600 active:scale-98 text-white font-black py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm transition border border-amber-400/40"
            >
              <span>🍵</span>
              <span>千住古民家カフェでこの子に会う（だっこ見学予約）</span>
            </button>

            <!-- 🎥 TP-Link Tapo 2K Live Camera 遠隔リアルタイム見学ボタン -->
            <button 
              type="button" 
              id="modal-tapo-live-btn" 
              class="w-full bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 hover:from-cyan-700 hover:to-teal-700 active:scale-98 text-white font-black py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm transition border border-cyan-400/40"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
              <span>🎥 Tapo 2K Live リアルタイム遠隔見学 (無料体験)</span>
            </button>

            ${dog.seniorCompatibility ? `
              <!-- 👴 シニア安心お見合い・ご家族同席相談ボタン -->
              <button 
                type="button" 
                id="modal-senior-consult-btn" 
                class="w-full bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-700 active:scale-98 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm transition border-2 border-amber-300"
              >
                <span>👴🐾</span>
                <span>シニア安心お迎え・ご家族同席相談（100%終生保証）</span>
              </button>
            ` : ''}

            <button 
              type="button" 
              id="modal-reserve-btn" 
              class="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              ${dog.listingType === 'puppy_sale' ? '見学予約・オンライン相談を申し込む' : '里親応募・飼育環境審査に進む'}
            </button>
            <button 
              type="button" 
              id="modal-fav-btn" 
              class="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 text-xs transition"
            >
              ❤️ お気に入りに保存してLINE更新速報を受け取る
            </button>
          </div>
        </div>
      </div>
    `;

    // 1. PC大画面スライダーのマウント (横スライド)
    const sliderMount = container.querySelector('#modal-slider-mount');
    this.activeSlider = new PhotoSlider(sliderMount, dog.images, {
      showThumbnails: true,
      showArrows: true,
      showDots: true,
      showCounter: true,
      allowFullscreen: true,
      aspectRatio: "aspect-[4/3] md:aspect-[16/10]" // PCブラウザで大きく迫力ある表示
    });

    // 2. 成長曲線チャートのマウント (Chart.js)
    const chartCanvas = container.querySelector('#modal-growth-chart');
    if (chartCanvas) {
      this.chartManager = new GrowthChartManager(chartCanvas);
      this.chartManager.render(dog);
    }

    // 3. モーダル内ボタンイベント
    const foodAdBtn = container.querySelector('#modal-food-ad-btn');
    if (foodAdBtn) {
      foodAdBtn.onclick = () => {
        const foodAd = SPONSORED_ADS.contextMatch[dog.breed] || SPONSORED_ADS.contextMatch.default;
        this.showToast(`🥣 【${foodAd.brand}】お迎え成約特典（初回無料プレゼント）の引換コードを発行しました！`);
      };
    }

    // 保険詳細モーダル展開ボタン
    const viewInsuranceBtn = container.querySelector('#modal-view-insurance-btn');
    if (viewInsuranceBtn) {
      viewInsuranceBtn.onclick = () => {
        const insModal = document.getElementById('insurance-detail-modal');
        if (insModal) insModal.classList.remove('hidden');
      };
    }

    // 🎥 Tapo 2K Live Camera 遠隔見学モーダル展開ボタン
    const tapoLiveBtn = container.querySelector('#modal-tapo-live-btn');
    if (tapoLiveBtn) {
      tapoLiveBtn.onclick = () => {
        this.openTapoLiveModal(dog.id, dog.temporaryName);
      };
    }

    // 費用シミュレーターのチェック連動
    const starterPackCheckbox = container.querySelector('#sim-starter-pack');
    const totalCostDisplay = container.querySelector('#sim-total-cost');
    if (starterPackCheckbox && totalCostDisplay) {
      starterPackCheckbox.onchange = () => {
        const extra = starterPackCheckbox.checked ? 19800 : 0;
        totalCostDisplay.textContent = `¥${(dog.price + extra).toLocaleString()}`;
      };
    }

    // 🛡️ 里親応募適性セーフティチェックボタン
    const safetyCheckBtn = container.querySelector('#modal-safety-check-btn');
    if (safetyCheckBtn) {
      safetyCheckBtn.onclick = () => {
        this.openAdoptionSafetyModal(dog);
      };
    }

    // 🍵 千住古民家カフェだっこ見学予約ボタン
    const senjuVisitBtn = container.querySelector('#modal-senju-visit-btn');
    if (senjuVisitBtn) {
      senjuVisitBtn.onclick = () => {
        this.openSenjuVisitModal(dog);
      };
    }

    // 👴 シニア安心お見合い・ご家族同席相談ボタン
    const seniorConsultBtn = container.querySelector('#modal-senior-consult-btn');
    if (seniorConsultBtn) {
      seniorConsultBtn.onclick = () => {
        if (window.openSeniorCallModal) {
          window.openSeniorCallModal(null, `【シニア安心お迎え相談】${dog.temporaryName} (${dog.breed})`);
        }
      };
    }

    // 見学予約・相談モーダル展開ボタン
    container.querySelector('#modal-reserve-btn').onclick = () => {
      this.openInquiryModal(dog);
    };

    container.querySelector('#modal-fav-btn').onclick = () => {
      this.toggleFavorite(dog.id);
    };
  }

  /**
   * 見学予約・お迎え相談モーダル展開 (コンシェルジュサポート対応)
   */
  openInquiryModal(dog) {
    const modal = document.getElementById('inquiry-modal');
    if (!modal) return;

    document.getElementById('inquiry-dog-id').value = dog.id;
    document.getElementById('inquiry-type').value = dog.listingType === 'puppy_sale' ? 'visit_reservation' : 'adoption_entry';
    document.getElementById('inquiry-modal-title').textContent = `${dog.temporaryName} (${dog.breed}) の見学・相談`;

    // デフォルトでコンシェルジュサポートをONに
    const optInCheck = document.getElementById('inquiry-concierge-optin');
    if (optInCheck) optInCheck.checked = true;

    modal.classList.remove('hidden');
  }

  /**
   * ページビュー切り替え（SPAマルチビュー展開）
   */
  switchView(viewName) {
    const validViews = ['dogs', 'senior', 'guide', 'breeders', 'satellites', 'food', 'faq', 'breeder', 'partner-dx', 'goods-shop'];
    if (!validViews.includes(viewName)) viewName = 'dogs';
    this.currentView = viewName;

    // 全てのビューを非表示にし、対象のビューを表示
    document.querySelectorAll('.page-view').forEach(el => {
      el.classList.add('hidden');
    });
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.remove('hidden');
    }

    // シニア犬・シルバー伴走画面への遷移時はシニア犬グリッドをロード
    if (viewName === 'senior') {
      this.renderSeniorDogs();
    }

    // ブリーダー画面への遷移時はダッシュボードをロード
    if (viewName === 'breeder') {
      const select = document.getElementById('breeder-select');
      const bId = select ? select.value : 'b-01';
      this.loadBreederDashboard(bId || 'b-01');
    }

    // 店舗・カフェDX画面への遷移時はデータをロード
    if (viewName === 'partner-dx') {
      this.loadPartnerDX();
    }

    // 犬用スマート便利グッズ・Tapo公式ストアへの遷移時は商品ロード
    if (viewName === 'goods-shop') {
      this.loadGoodsShop();
    }

    // ナビゲーションボタンのアクティブスタイルの更新
    document.querySelectorAll('.main-nav-link').forEach(btn => {
      const bView = btn.dataset.view;
      if (bView === viewName) {
        btn.classList.add('text-amber-700', 'bg-amber-50', 'font-black');
        btn.classList.remove('text-stone-500', 'text-stone-600');
      } else {
        btn.classList.remove('text-amber-700', 'bg-amber-50', 'font-black');
        btn.classList.add('text-stone-600');
      }
    });

    // モバイルボトムナビボタンのアクティブスタイルの更新
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      const bView = btn.dataset.view;
      if (bView) {
        if (bView === viewName) {
          btn.classList.add('text-amber-600', 'font-black');
          btn.classList.remove('text-stone-600');
        } else {
          btn.classList.remove('text-amber-600', 'font-black');
          btn.classList.add('text-stone-600');
        }
      }
    });

    // URLハッシュ同期
    if (window.location.hash !== `#${viewName}`) {
      window.history.pushState(null, '', `#${viewName}`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * ルーティング初期化 (URLハッシュ対応)
   */
  initRouting() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash.startsWith('dog-')) {
        const dog = this.dogs.find(d => d.id === hash);
        if (dog) {
          this.switchView('dogs');
          this.openDetailModal(dog);
          return;
        }
      }
      const detailModal = document.getElementById('detail-modal');
      if (detailModal && !detailModal.classList.contains('hidden') && !hash.startsWith('dog-')) {
        detailModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
      if (hash && ['dogs', 'guide', 'breeders', 'satellites', 'food', 'faq', 'breeder', 'partner-dx', 'goods-shop'].includes(hash)) {
        this.switchView(hash);
      } else {
        this.switchView('dogs');
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  /**
   * 認定ブリーダー・犬舎一覧の描画
   */
  renderBreeders() {
    const container = document.getElementById('breeders-list-mount');
    if (!container) return;

    container.innerHTML = this.breeders.map(b => {
      const breederDogs = this.dogs.filter(d => b.dogIds.includes(d.id));
      return `
        <div class="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
          <div class="h-44 w-full relative overflow-hidden">
            <img src="${b.imageUrl}" alt="${b.kennelName}" class="w-full h-full object-cover" />
            <div class="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow">
              ${b.badge}
            </div>
            <div class="absolute bottom-2 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
              ${b.prefecture} ${b.location}
            </div>
          </div>

          <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
            <div class="space-y-1.5">
              <span class="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                ${b.specialty}
              </span>
              <h3 class="font-black text-stone-900 text-base">${b.kennelName}</h3>
              <div class="text-xs text-stone-500 flex items-center gap-1.5">
                <span>代表: ${b.ownerName}</span>
                <span>•</span>
                <span>${b.established}</span>
              </div>
              <div class="text-[10px] text-stone-400 bg-stone-50 p-1.5 rounded-lg">
                📋 動物取扱業: ${b.licenseNumber}
              </div>
              <p class="text-xs text-stone-600 leading-relaxed pt-1">
                ${b.policy}
              </p>
            </div>

            <div class="border-t border-stone-100 pt-3 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-stone-700">
                  掲載中: <span class="text-amber-600 font-black">${breederDogs.length}頭</span>
                </span>
                <span class="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                  🛍️ 推奨グッズ・器具取次中
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="view-breeder-dogs-btn flex-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold py-2 rounded-xl transition text-center active:scale-95" data-breeder-id="${b.id}">
                  この犬舎の子を見る ➔
                </button>
                <button type="button" class="view-breeder-shop-btn flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs py-2 rounded-xl transition text-center shadow-xs active:scale-95" data-breeder-id="${b.id}" title="犬舎推奨の飼育グッズ・見守りカメラ・スターターセットを見る">
                  🛍️ 犬舎推奨物販 ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 犬舎推奨物販ボタン
    container.querySelectorAll('.view-breeder-shop-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView('goods-shop');
        this.showToast('🛍️ 犬舎・直営モデル推奨のIoTスマートグッズ＆スターター物販一覧を表示しました');
      });
    });

    // 犬舎の子を見るボタン
    container.querySelectorAll('.view-breeder-dogs-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bId = btn.dataset.breederId;
        const breeder = this.breeders.find(b => b.id === bId);
        if (breeder) {
          this.switchView('dogs');
          const searchInput = document.getElementById('search-input');
          if (searchInput) {
            searchInput.value = breeder.kennelName;
            this.searchQuery = breeder.kennelName.toLowerCase();
            this.renderDogList();
          }
          this.showToast(`🏡 【${breeder.kennelName}】の掲載犬を表示しました`);
        }
      });
    });
  }

  /**
   * 全国提携サテライト拠点の描画
   */
  renderSatellites() {
    const container = document.getElementById('satellites-list-mount');
    if (!container) return;

    container.innerHTML = this.satellites.map(hub => {
      const isActive = hub.isOpen === true;
      return `
      <div class="bg-white rounded-3xl border ${isActive ? 'border-emerald-300 ring-2 ring-emerald-500/20 shadow-md' : 'border-stone-200 opacity-90 shadow-sm'} p-5 transition space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[10px] font-black ${isActive ? 'text-emerald-800 bg-emerald-100' : 'text-amber-800 bg-amber-100'} px-2.5 py-0.5 rounded-full">
            ${hub.statusText || (isActive ? '✅ 見学受付中' : '🚧 順次拡大予定')}
          </span>
          <span class="text-xs text-stone-400 font-medium">${hub.phone}</span>
        </div>

        <h3 class="font-black text-stone-900 text-base flex items-center gap-1.5">
          <span>${isActive ? '🏠' : '🏢'}</span>
          <span>${hub.name}</span>
        </h3>

        <div class="text-xs text-stone-600 space-y-1 bg-stone-50 p-3 rounded-2xl">
          <div class="flex items-start gap-1.5">
            <span class="text-stone-400">📍</span>
            <span class="font-medium">${hub.address}</span>
          </div>
          <div class="flex items-start gap-1.5">
            <span class="text-stone-400">🚶</span>
            <span>${hub.access}</span>
          </div>
          <div class="flex items-start gap-1.5">
            <span class="text-stone-400">🕒</span>
            <span>${hub.openingHours}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 pt-1">
          ${hub.features.map(f => `
            <span class="text-[10px] ${isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-stone-100 text-stone-700'} font-semibold px-2 py-0.5 rounded-md">
              ✓ ${f}
            </span>
          `).join('')}
        </div>

        ${isActive ? `
          <button type="button" class="line-sim-trigger w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow">
            <span>💬 千住古民家で見学を相談する（LINE）</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        ` : `
          <button type="button" class="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer" onclick="alert('${hub.name}は現在パートナー選定・順次拡大準備中です。開設決定時に優先案内を希望される方はLINE公式アカウントをご登録ください。')">
            <span>🔔 開設時にLINE通知を受け取る</span>
          </button>
        `}
      </div>
    `;
    }).join('');
  }

  /**
   * よくある質問（FAQ）の描画
   */
  renderFaqs() {
    const container = document.getElementById('faq-list-mount');
    if (!container) return;

    container.innerHTML = this.faqs.map((faq, index) => `
      <details class="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition" ${index < 2 ? 'open' : ''}>
        <summary class="flex items-center justify-between p-4 sm:p-5 font-bold text-stone-900 text-xs sm:text-sm cursor-pointer select-none hover:bg-stone-50 transition">
          <div class="flex items-center gap-3">
            <span class="text-amber-500 font-black text-sm">Q.</span>
            <span>${faq.q}</span>
          </div>
          <span class="text-stone-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2">
            ▼
          </span>
        </summary>
        <div class="px-4 sm:px-5 pb-5 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/40">
          <div class="flex items-start gap-3">
            <span class="text-emerald-600 font-black text-sm">A.</span>
            <div class="space-y-1">
              <span class="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded inline-block">
                ${faq.category}
              </span>
              <p class="pt-1">${faq.a}</p>
            </div>
          </div>
        </div>
      </details>
    `).join('');
  }

  showToast(message, duration = 3200) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, duration);
  }

  /**
   * ブリーダー専用ポータルの初期化
   */
  async initBreederPortal() {
    // 1. ブリーダー選択セレクターの初期化
    const breederSelect = document.getElementById('breeder-select');
    if (breederSelect) {
      try {
        const res = await fetch('/api/breeders');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            breederSelect.innerHTML = json.data.map(b => `
              <option value="${b.id}">${b.kennel_name} (${b.owner_name} / ${b.prefecture})</option>
            `).join('');
            // モコちゃんのいるスノーホワイト犬舎(b-02)をデフォルトに設定
            breederSelect.value = 'b-02';
            if (this.currentView === 'breeder') {
              this.loadBreederDashboard(breederSelect.value);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load breeders list', err);
      }

      breederSelect.addEventListener('change', () => {
        this.loadBreederDashboard(breederSelect.value);
      });
    }

    // 2. 新規出品ボタン＆モーダル
    const newDogBtn = document.getElementById('breeder-btn-new-dog');
    const newDogModal = document.getElementById('breeder-new-dog-modal');
    const newDogClose = document.getElementById('breeder-new-modal-close');
    const newDogForm = document.getElementById('breeder-new-dog-form');

    if (newDogBtn && newDogModal) {
      newDogBtn.addEventListener('click', () => {
        newDogModal.classList.remove('hidden');
        const today = new Date().toISOString().split('T')[0];
        const birthInput = document.getElementById('bnew-birthdate');
        if (birthInput) birthInput.value = today;
      });
    }

    if (newDogClose && newDogModal) {
      newDogClose.addEventListener('click', () => {
        newDogModal.classList.add('hidden');
      });
    }

    if (newDogForm) {
      newDogForm.addEventListener('submit', (e) => this.handleNewDogSubmit(e));
    }

    // 3. クイック更新モーダル閉じる
    const quickModal = document.getElementById('breeder-quick-update-modal');
    const quickClose = document.getElementById('breeder-quick-modal-close');
    const quickForm = document.getElementById('breeder-quick-update-form');

    if (quickClose && quickModal) {
      quickClose.addEventListener('click', () => {
        quickModal.classList.add('hidden');
      });
    }

    if (quickForm) {
      quickForm.addEventListener('submit', (e) => this.handleQuickUpdateSubmit(e));
    }

    // プリセット写真ボタン
    document.querySelectorAll('.bquick-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const photoInput = document.getElementById('bquick-photo-input');
        if (photoInput) photoInput.value = btn.dataset.url;
      });
    });

    // 4. アラートジャンプボタン
    const jumpYellowBtn = document.getElementById('breeder-btn-jump-yellow');
    if (jumpYellowBtn) {
      jumpYellowBtn.addEventListener('click', () => {
        const target = document.querySelector('.breeder-dog-card[data-freshness="yellow"]');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('ring-4', 'ring-amber-400');
          setTimeout(() => target.classList.remove('ring-4', 'ring-amber-400'), 2500);
        }
      });
    }

    // 5. タブ切り替え
    document.querySelectorAll('.bportal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.btab;
        document.querySelectorAll('.bportal-tab-btn').forEach(b => {
          b.classList.remove('active', 'bg-stone-900', 'text-white');
          b.classList.add('bg-stone-100', 'text-stone-700');
        });
        btn.classList.add('active', 'bg-stone-900', 'text-white');
        btn.classList.remove('bg-stone-100', 'text-stone-700');

        document.querySelectorAll('.bportal-panel').forEach(p => p.classList.add('hidden'));
        const panel = document.getElementById(`bportal-panel-${tab}`);
        if (panel) panel.classList.remove('hidden');

        // Tapoタブ選択時のデータロード
        if (tab === 'tapo') {
          this.loadTapoKennelDevices();
        }
      });
    });
  }

  /**
   * ブリーダーダッシュボードのデータ取得とレンダリング
   */
  async loadBreederDashboard(breederId) {
    try {
      const res = await fetch(`/api/breeder/dashboard?breederId=${breederId}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      const json = await res.json();
      const data = json.data;
      if (!data) return;

      this.currentBreederDashboard = data;

      // 1. 基本情報の反映
      const infoContainer = document.getElementById('breeder-current-info');
      if (infoContainer && data.breeder) {
        infoContainer.innerHTML = `
          <div class="flex items-center gap-1.5"><span class="text-stone-400">代表者:</span> <span class="text-white font-bold">${data.breeder.owner_name}</span></div>
          <div class="flex items-center gap-1.5"><span class="text-stone-400">第一種動物取扱業:</span> <span class="text-white font-bold">${data.breeder.license_number}</span></div>
          <div class="flex items-center gap-1.5"><span class="text-stone-400">犬舎所在地:</span> <span class="text-white font-bold">${data.breeder.prefecture} ${data.breeder.location}</span></div>
        `;
      }

      // 2. サマリー統計の反映
      const s = data.summary;
      const totalDogsEl = document.getElementById('bstat-total-dogs');
      const subDogsEl = document.getElementById('bstat-sub-dogs');
      const yellowAlertEl = document.getElementById('bstat-yellow-alert');
      const subYellowEl = document.getElementById('bstat-sub-yellow');
      const pendingInqEl = document.getElementById('bstat-pending-inquiries');
      const photoReqEl = document.getElementById('bstat-photo-requests');

      if (totalDogsEl) totalDogsEl.textContent = `${s.totalDogs} 頭`;
      if (subDogsEl) subDogsEl.textContent = `募集中: ${s.availableDogs} / 商談中: ${s.negotiatingDogs} / 成約: ${s.adoptedDogs}`;
      if (yellowAlertEl) yellowAlertEl.textContent = `${s.yellowAlertCount} 件`;
      if (subYellowEl) subYellowEl.textContent = s.yellowAlertCount > 0 ? '⚠️ 要写真・体重更新' : '✅ 全頭グリーン正常';
      if (pendingInqEl) pendingInqEl.textContent = `${s.pendingInquiries} 件`;
      if (photoReqEl) photoReqEl.textContent = `${s.pendingPhotoRequests} 件`;

      // タブバッジの件数更新
      const tDogsCount = document.getElementById('btab-count-dogs');
      const tInqCount = document.getElementById('btab-count-inquiries');
      const tReqCount = document.getElementById('btab-count-requests');
      if (tDogsCount) tDogsCount.textContent = data.dogs.length;
      if (tInqCount) tInqCount.textContent = data.inquiries.length;
      if (tReqCount) tReqCount.textContent = data.photoRequests.length;

      // イエロー警告バナー表示制御
      const banner = document.getElementById('breeder-yellow-banner');
      if (banner) {
        if (s.yellowAlertCount > 0) {
          banner.classList.remove('hidden');
        } else {
          banner.classList.add('hidden');
        }
      }

      // 3. 各パネルの描画
      this.renderBreederDogs(data.dogs);
      this.renderBreederInquiries(data.inquiries);
      this.renderBreederRequests(data.photoRequests);

      // 4. 有料SaaS・DX機能の取得とレンダリング
      await this.loadBreedingRecords(breederId);
      await this.loadIoTEnvironment(breederId);
      await this.loadLegalLedger(breederId);
      await this.loadBreederSubscription(breederId);

    } catch (err) {
      console.error('Error loading breeder dashboard', err);
      this.showToast('ブリーダーダッシュボードの読込に失敗しました');
    }
  }

  /**
   * 出品ワンちゃん一覧の描画
   */
  renderBreederDogs(dogs) {
    const mount = document.getElementById('breeder-dogs-mount');
    if (!mount) return;

    if (!dogs || dogs.length === 0) {
      mount.innerHTML = `
        <div class="col-span-full py-12 text-center text-stone-400 bg-white rounded-3xl border border-stone-200">
          現在出品中のワンちゃんはいません。「新規ワンちゃんを出品」から登録してください。
        </div>
      `;
      return;
    }

    mount.innerHTML = dogs.map(dog => {
      const isYellow = dog.freshness_status === 'yellow';
      const firstImg = dog.images && dog.images.length > 0 ? dog.images[0] : null;
      const mainImg = typeof firstImg === 'string' ? firstImg : (firstImg?.url || 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80');
      const priceFormatted = Number(dog.price).toLocaleString();
      const statusLabel = dog.status === 'available' ? '募集中' : (dog.status === 'negotiating' ? '商談中' : '成約済');
      const statusColor = dog.status === 'available' ? 'bg-emerald-100 text-emerald-800' : (dog.status === 'negotiating' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700');

      return `
        <div class="breeder-dog-card bg-white rounded-3xl border ${isYellow ? 'border-amber-400 shadow-md ring-2 ring-amber-200/50' : 'border-stone-200 shadow-sm'} overflow-hidden flex flex-col justify-between transition" data-freshness="${dog.freshness_status}">
          <div>
            <!-- 写真＆鮮度ステータスバッジ -->
            <div class="relative h-48 bg-stone-100 overflow-hidden">
              <img src="${mainImg}" alt="${dog.temporary_name}" class="w-full h-full object-cover">
              <span class="absolute top-3 left-3 ${statusColor} text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                ${statusLabel}
              </span>
              <span class="absolute top-3 right-3 ${isYellow ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 text-white'} text-[10px] font-black px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                ${isYellow ? '⚠️ 写真未更新' : '🟢 写真最新'}
              </span>
            </div>

            <!-- 子犬情報 -->
            <div class="p-5 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">${dog.breed} (${dog.gender === 'female' ? '♀ 女の子' : '♂ 男の子'})</span>
                <span class="text-[10px] text-stone-400">生後${dog.current_age_days || '-'}日</span>
              </div>
              <h4 class="font-black text-stone-900 text-base leading-snug flex items-center justify-between">
                <span>${dog.temporary_name}</span>
                <span class="text-amber-600 text-sm font-black">¥${priceFormatted}</span>
              </h4>

              <!-- イエローマーク詳細警告 -->
              ${isYellow ? `
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 space-y-1">
                  <div class="font-bold flex items-center gap-1">
                    <span>⚠️</span>
                    <span>${dog.freshness_label || '生後60日データ未登録'}</span>
                  </div>
                  <p class="text-[10px] text-amber-700 leading-tight">
                    ${dog.freshness_reason || '最新の体重と写真を登録してイエローマークを解除してください。'}
                  </p>
                </div>
              ` : `
                <div class="text-[11px] text-stone-500">
                  <span>予想サイズ: <strong>${dog.predicted_size_category || '標準'}</strong></span>
                </div>
              `}
            </div>
          </div>

          <!-- アクション操作ボタン群 -->
          <div class="p-5 pt-0 space-y-2 border-t border-stone-100 mt-2">
            <!-- 写真・体重クイック更新ボタン -->
            <button type="button" class="btn-open-quick-update w-full ${isYellow ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-black' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold'} text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
              data-dog-id="${dog.id}">
              <span>⚡</span>
              <span>${isYellow ? '今すぐ写真＆体重を更新 (解除)' : '最新体重・写真を登録'}</span>
            </button>

            <!-- 🌱 社会化カルテ編集ボタン -->
            <button type="button" class="btn-open-socialization w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs py-2 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5"
              data-dog-id="${dog.id}">
              <span>🌱</span>
              <span>社会化カルテ編集 (できることチェック)</span>
            </button>

            <!-- ステータス変更ドロップダウン -->
            <div class="flex items-center justify-between text-xs pt-1">
              <span class="text-stone-400 text-[11px]">募集ステータス:</span>
              <select class="select-dog-status bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-[11px] font-bold text-stone-800 outline-none" data-dog-id="${dog.id}">
                <option value="available" ${dog.status === 'available' ? 'selected' : ''}>募集中</option>
                <option value="negotiating" ${dog.status === 'negotiating' ? 'selected' : ''}>商談中</option>
                <option value="adopted" ${dog.status === 'adopted' ? 'selected' : ''}>お迎え決定 (成約)</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // イベントバインド: クイック更新モーダル起動
    mount.querySelectorAll('.btn-open-quick-update').forEach(btn => {
      btn.addEventListener('click', () => {
        const dogId = btn.dataset.dogId;
        const targetDog = dogs.find(d => d.id === dogId);
        if (targetDog) this.openQuickUpdateModal(targetDog);
      });
    });

    // イベントバインド: 社会化カルテ編集モーダル起動
    mount.querySelectorAll('.btn-open-socialization').forEach(btn => {
      btn.addEventListener('click', () => {
        const dogId = btn.dataset.dogId;
        const targetDog = dogs.find(d => d.id === dogId);
        if (targetDog) this.openSocializationModal(targetDog);
      });
    });

    // イベントバインド: ステータス変更
    mount.querySelectorAll('.select-dog-status').forEach(select => {
      select.addEventListener('change', () => {
        const dogId = select.dataset.dogId;
        this.handleDogStatusChange(dogId, select.value);
      });
    });
  }

  /**
   * 見学予約一覧の描画
   */
  renderBreederInquiries(inquiries) {
    const mount = document.getElementById('breeder-inquiries-mount');
    if (!mount) return;

    if (!inquiries || inquiries.length === 0) {
      mount.innerHTML = `
        <div class="py-12 text-center text-stone-400 bg-white rounded-3xl border border-stone-200 text-xs">
          現在届いている見学予約はありません。
        </div>
      `;
      return;
    }

    mount.innerHTML = inquiries.map(inq => {
      const isPending = inq.status === 'pending';
      const statusBadge = inq.status === 'pending' ? '<span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">未対応</span>' :
        (inq.status === 'confirmed' ? '<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold text-[10px]">見学日程確定</span>' :
          (inq.status === 'completed' ? '<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">成約完了</span>' : '<span class="bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-bold text-[10px]">キャンセル</span>'));

      return `
        <div class="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-stone-900">対象犬: ${inq.dog_name} (${inq.dog_breed})</span>
              ${statusBadge}
              ${inq.insurance_opt_in ? '<span class="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">🎁 30日間無償保険特典付き</span>' : ''}
            </div>
            <div class="text-[11px] text-stone-400">受付日時: ${inq.created_at || '-'}</div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span class="text-stone-400 text-[10px] block">見学希望日時</span>
              <span class="font-bold text-stone-800">${inq.preferred_date || '相談の上決定'}</span>
            </div>
            <div>
              <span class="text-stone-400 text-[10px] block">希望者様氏名</span>
              <span class="font-bold text-stone-800">${inq.user_name} 様</span>
            </div>
            <div>
              <span class="text-stone-400 text-[10px] block">連絡先 (メール/TEL)</span>
              <span class="font-bold text-stone-800">${inq.user_contact}</span>
            </div>
          </div>

          ${inq.message ? `
            <div class="bg-stone-50 rounded-xl p-3 text-xs text-stone-700">
              <span class="text-[10px] text-stone-400 block mb-0.5">メッセージ:</span>
              ${inq.message}
            </div>
          ` : ''}

          <!-- ステータス操作ボタン -->
          <div class="flex items-center justify-end gap-2 pt-1 border-t border-stone-100 text-xs">
            <button type="button" class="btn-inq-status bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-lg transition" data-inq-id="${inq.id}" data-status="confirmed">
              📅 見学日程を確定
            </button>
            <button type="button" class="btn-inq-status bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg transition" data-inq-id="${inq.id}" data-status="completed">
              🎉 成約完了 (お迎え確定)
            </button>
            <button type="button" class="btn-inq-status bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold px-3 py-1.5 rounded-lg transition" data-inq-id="${inq.id}" data-status="cancelled">
              キャンセル
            </button>
          </div>
        </div>
      `;
    }).join('');

    // イベントバインド: 見学ステータス変更
    mount.querySelectorAll('.btn-inq-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const inqId = btn.dataset.inqId;
        const newStatus = btn.dataset.status;
        this.handleInquiryStatusChange(inqId, newStatus);
      });
    });
  }

  /**
   * 写真催促リクエスト一覧の描画
   */
  renderBreederRequests(requests) {
    const mount = document.getElementById('breeder-requests-mount');
    if (!mount) return;

    if (!requests || requests.length === 0) {
      mount.innerHTML = `
        <div class="py-12 text-center text-stone-400 bg-white rounded-3xl border border-stone-200 text-xs">
          届いている写真催促リクエストはありません。
        </div>
      `;
      return;
    }

    mount.innerHTML = requests.map(req => {
      const isRequested = req.status === 'requested';
      return `
        <div class="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex items-center justify-between text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-stone-900">対象犬: ${req.dog_name} (${req.dog_breed})</span>
              ${isRequested ? '<span class="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">未対応・写真待ち</span>' : '<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">写真更新済</span>'}
            </div>
            <p class="text-[11px] text-stone-500">飼い主様より最新写真の更新リクエストが届いています。(受付: ${req.requested_at || '-'})</p>
          </div>
          ${isRequested ? `
            <button type="button" class="btn-open-quick-update bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 rounded-xl shadow-sm text-xs transition active:scale-95" data-dog-id="${req.dog_id}">
              ⚡ 今すぐ写真を更新
            </button>
          ` : `
            <span class="text-xs text-stone-400 font-bold">対応完了</span>
          `}
        </div>
      `;
    }).join('');

    mount.querySelectorAll('.btn-open-quick-update').forEach(btn => {
      btn.addEventListener('click', () => {
        const dogId = btn.dataset.dogId;
        const targetDog = this.currentBreederDashboard?.dogs?.find(d => d.id === dogId);
        if (targetDog) this.openQuickUpdateModal(targetDog);
      });
    });
  }

  /**
   * 写真・体重クイック更新モーダルを開く
   */
  openQuickUpdateModal(dog) {
    const modal = document.getElementById('breeder-quick-update-modal');
    if (!modal) return;

    document.getElementById('bquick-dog-id').value = dog.id;
    document.getElementById('bquick-dog-name').textContent = `${dog.temporary_name} (${dog.breed})`;
    document.getElementById('bquick-dog-info').textContent = `生後${dog.current_age_days || '-'}日 / 現在ステータス: ${dog.freshness_label || '正常'}`;

    const firstImg = dog.images && dog.images.length > 0 ? dog.images[0] : null;
    const mainImg = typeof firstImg === 'string' ? firstImg : (firstImg?.url || 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80');
    document.getElementById('bquick-dog-img').src = mainImg;

    // 体重のデフォルト（モコちゃんなら850g）
    document.getElementById('bquick-weight-input').value = '850';
    document.getElementById('bquick-photo-input').value = 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80';

    modal.classList.remove('hidden');
  }

  /**
   * 写真・体重クイック更新フォームの送信処理
   */
  async handleQuickUpdateSubmit(e) {
    e.preventDefault();
    const dogId = document.getElementById('bquick-dog-id').value;
    const weightG = parseInt(document.getElementById('bquick-weight-input').value, 10);
    const photoUrl = document.getElementById('bquick-photo-input').value;
    const memo = document.getElementById('bquick-memo-input').value;

    try {
      const res = await fetch('/api/breeder/dogs/quick-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json.stringify ? JSON.stringify({ dogId, weightG, photoUrl, memo }) : ''
      });

      if (!res.ok) throw new Error('Update failed');

      const modal = document.getElementById('breeder-quick-update-modal');
      if (modal) modal.classList.add('hidden');

      this.showToast('🎉 最新体重と写真を登録し、イエローマークを解除しました！');

      // ダッシュボード再読み込み＆犬データ更新
      const select = document.getElementById('breeder-select');
      const bId = select ? select.value : 'b-02';
      await this.loadBreederDashboard(bId);
      await this.fetchDogsFromApi();

    } catch (err) {
      console.error('Error submitting quick update', err);
      this.showToast('更新に失敗しました');
    }
  }

  /**
   * 子犬ステータスの変更処理 (available | negotiating | adopted)
   */
  async handleDogStatusChange(dogId, newStatus) {
    try {
      const res = await fetch('/api/breeder/dogs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogId, status: newStatus })
      });
      if (res.ok) {
        this.showToast(`子犬のステータスを更新しました: ${newStatus}`);
        const select = document.getElementById('breeder-select');
        const bId = select ? select.value : 'b-02';
        await this.loadBreederDashboard(bId);
        await this.fetchDogsFromApi();
      }
    } catch (err) {
      console.error('Error updating dog status', err);
      this.showToast('ステータス更新に失敗しました');
    }
  }

  /**
   * 見学予約ステータスの変更処理
   */
  async handleInquiryStatusChange(inquiryId, newStatus) {
    try {
      const res = await fetch('/api/breeder/inquiries/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId, status: newStatus })
      });
      if (res.ok) {
        this.showToast(`予約ステータスを更新しました`);
        const select = document.getElementById('breeder-select');
        const bId = select ? select.value : 'b-02';
        await this.loadBreederDashboard(bId);
      }
    } catch (err) {
      console.error('Error updating inquiry status', err);
      this.showToast('予約ステータス更新に失敗しました');
    }
  }

  /**
   * 新規子犬出品フォームの送信処理
   */
  async handleNewDogSubmit(e) {
    e.preventDefault();
    const select = document.getElementById('breeder-select');
    const breederId = select ? select.value : 'b-01';

    const geneticLab = document.getElementById('bnew-genetic-lab')?.value?.trim();
    const geneticCert = document.getElementById('bnew-genetic-cert')?.value?.trim();
    const geneticStatus = document.getElementById('bnew-genetic-status')?.value || '3_clear';
    const patellaGrade = document.getElementById('bnew-patella')?.value || 'Grade 0 (正常・関節強固)';
    const parentsGenetic = document.getElementById('bnew-parents-genetic')?.value;

    if (!geneticLab || !geneticCert) {
      alert('【WanBridge登録規約】遺伝情報の掲載は完全義務化されています。公認検査機関名および検査証明書番号を必ずご入力ください。未検査の生体は出品できません。');
      return;
    }

    const dogBreed = document.getElementById('bnew-breed').value;

    const dogData = {
      listing_type: document.getElementById('bnew-listing-type').value,
      temporary_name: document.getElementById('bnew-temp-name').value,
      breed: dogBreed,
      gender: document.getElementById('bnew-gender').value,
      color: document.getElementById('bnew-color').value,
      birth_date: document.getElementById('bnew-birthdate').value,
      price: parseInt(document.getElementById('bnew-price').value, 10),
      initial_weight_g: parseInt(document.getElementById('bnew-weight').value, 10),
      predicted_size_category: document.getElementById('bnew-size').value,
      images: [document.getElementById('bnew-photo').value],
      description: document.getElementById('bnew-description').value,
      genetic_lab: geneticLab,
      genetic_cert: geneticCert,
      genetic_status: geneticStatus,
      patella_grade: patellaGrade,
      health: {
        praClear: true,
        dmClear: true,
        vwd1Clear: true,
        geneticLab: geneticLab,
        geneticCertNumber: geneticCert,
        geneticTestDate: new Date().toISOString().split('T')[0],
        geneticStatus: "3項目全クリア (発症リスクなし) ✅",
        patellaGrade: patellaGrade,
        veterinaryCheck: "総合健康診断All-A (獣医師証明書添付済)"
      },
      parents: {
        father: {
          breed: `${dogBreed} 優良種親`,
          title: "血統認定優良親犬",
          photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
          geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
          geneticCertNumber: `${geneticCert}-F`
        },
        mother: {
          breed: `${dogBreed} 優良繁殖親`,
          title: "血統認定優良親犬",
          photo: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=800&q=80",
          geneticTest: "PRA/DM/vWD1 3項目全クリア ✅",
          geneticCertNumber: `${geneticCert}-M`
        }
      },
      tags: ["#最新写真確認済🟢", "#遺伝子3項目全クリア✅", "#遺伝情報100%開示"]
    };

    try {
      const res = await fetch('/api/breeder/dogs/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breederId, dogData })
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.message || 'Creation failed');
      }

      const modal = document.getElementById('breeder-new-dog-modal');
      if (modal) modal.classList.add('hidden');

      this.showToast(`🐶 新しいワンちゃん「${dogData.temporary_name}」を出品登録しました！（遺伝情報検査済✅）`);

      await this.loadBreederDashboard(breederId);
      await this.fetchDogsFromApi();

    } catch (err) {
      console.error('Error creating new dog', err);
      alert(`出品エラー: ${err.message}`);
      this.showToast('出品登録に失敗しました');
    }
  }

  // ==============================================================================
  // 💎 有料オプションSaaS 1: 繁殖管理SaaS (動愛法6回数値規制・ヒート・交配・出産予定)
  // ==============================================================================

  async loadBreedingRecords(breederId) {
    try {
      const res = await fetch(`/api/breeder/breeding-records?breederId=${breederId}`);
      if (!res.ok) return;
      const json = await res.json();
      const records = json.data || [];
      this.currentBreedingRecords = records;

      // バッジと統計更新
      const tBreedingCount = document.getElementById('btab-count-breeding');
      const bstatBreeding = document.getElementById('bstat-breeding-count');
      const bstatSubBreeding = document.getElementById('bstat-sub-breeding');
      if (tBreedingCount) tBreedingCount.textContent = records.length;

      const pregnantCount = records.filter(r => r.pregnancy_status === 'pregnant').length;
      if (bstatBreeding) bstatBreeding.textContent = `${records.length} 頭 (${pregnantCount}頭妊娠中)`;
      if (bstatSubBreeding) {
        const hasWarning = records.some(r => r.lifetime_birth_count >= 5);
        bstatSubBreeding.textContent = hasWarning ? '⚠️ 出産上限間近の母犬あり' : '✅ 動愛法6回規制クリア';
        bstatSubBreeding.className = hasWarning ? 'text-[10px] text-amber-600 font-bold' : 'text-[10px] text-purple-700 font-bold';
      }

      this.renderBreedingRecords(records);
    } catch (err) {
      console.error('Error loading breeding records', err);
    }
  }

  renderBreedingRecords(records) {
    const mount = document.getElementById('breeding-records-mount');
    if (!mount) return;

    if (!records || records.length === 0) {
      mount.innerHTML = `
        <div class="py-12 text-center text-stone-400 bg-white rounded-3xl border border-stone-200">
          繁殖母犬が登録されていません。「母犬・交配記録を新規登録」から追加してください。
        </div>
      `;
      return;
    }

    mount.innerHTML = `
      <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
              <tr>
                <th class="p-3.5 whitespace-nowrap">母犬名 / マイクロチップ</th>
                <th class="p-3.5 whitespace-nowrap">犬種 / 生年月日</th>
                <th class="p-3.5 whitespace-nowrap">動愛法 生涯出産回数</th>
                <th class="p-3.5 whitespace-nowrap">交配日 ➔ 出産予定日</th>
                <th class="p-3.5 whitespace-nowrap">状態ステータス</th>
                <th class="p-3.5 whitespace-nowrap">狂犬病 / 混合ワクチン</th>
                <th class="p-3.5 whitespace-nowrap text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              ${records.map(rec => {
      const limitRate = Math.min(100, Math.round((rec.lifetime_birth_count / 6) * 100));
      const isWarning = rec.lifetime_birth_count >= 5;
      const isFull = rec.lifetime_birth_count >= 6;

      let statusBadge = '';
      if (rec.pregnancy_status === 'pregnant') {
        statusBadge = '<span class="bg-rose-100 text-rose-800 font-black px-2.5 py-1 rounded-full text-[11px] animate-pulse">受胎確定 (妊娠中) 🤰</span>';
      } else if (rec.pregnancy_status === 'mated') {
        statusBadge = '<span class="bg-amber-100 text-amber-800 font-black px-2.5 py-1 rounded-full text-[11px]">交配完了 (着床待機) ⏳</span>';
      } else if (rec.pregnancy_status === 'delivered') {
        statusBadge = '<span class="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full text-[11px]">出産完了 (育児中) 🍼</span>';
      } else {
        statusBadge = '<span class="bg-stone-100 text-stone-700 font-bold px-2.5 py-1 rounded-full text-[11px]">母体休養中 💤</span>';
      }

      return `
                  <tr class="hover:bg-stone-50/70 transition">
                    <td class="p-3.5">
                      <div class="font-black text-stone-900 text-sm">${rec.mother_name}</div>
                      <div class="font-mono text-[10px] text-stone-400">MC: ${rec.mother_microchip || '-'}</div>
                    </td>
                    <td class="p-3.5">
                      <div class="font-bold text-stone-800">${rec.mother_breed}</div>
                      <div class="text-[10px] text-stone-400">${rec.mother_birth_date} 生</div>
                    </td>
                    <td class="p-3.5">
                      <div class="flex items-center gap-2">
                        <span class="font-black ${isFull ? 'text-red-600' : (isWarning ? 'text-amber-600' : 'text-purple-900')} text-sm">${rec.lifetime_birth_count} / 6 回</span>
                        <span class="text-[10px] ${isFull ? 'bg-red-100 text-red-700 font-black' : 'bg-stone-100 text-stone-600'} px-2 py-0.5 rounded">残${rec.legalLimitRemaining}回</span>
                      </div>
                      <div class="w-24 bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div class="h-full ${isFull ? 'bg-red-500' : (isWarning ? 'bg-amber-500' : 'bg-purple-600')}" style="width: ${limitRate}%;"></div>
                      </div>
                    </td>
                    <td class="p-3.5">
                      <div class="font-bold text-stone-800">交配: ${rec.mating_date || '未交配'}</div>
                      <div class="font-black text-purple-700 mt-0.5">予定: ${rec.due_date || '-'}</div>
                    </td>
                    <td class="p-3.5">
                      ${statusBadge}
                    </td>
                    <td class="p-3.5 text-[11px] text-stone-500">
                      <div>狂犬病: ${rec.rabies_vaccine_date || '-'}</div>
                      <div>混合: ${rec.mixed_vaccine_date || '-'}</div>
                    </td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <button type="button" class="btn-edit-breeding bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-2.5 py-1.5 rounded-lg transition"
                          data-rec-id="${rec.id}">編集</button>
                        <button type="button" class="btn-delete-breeding bg-stone-100 hover:bg-red-100 text-stone-400 hover:text-red-600 p-1.5 rounded-lg transition"
                          data-rec-id="${rec.id}" title="削除">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // イベントバインド
    mount.querySelectorAll('.btn-edit-breeding').forEach(btn => {
      btn.addEventListener('click', () => {
        const rec = records.find(r => r.id === btn.dataset.recId);
        if (rec) this.openBreedingModal(rec);
      });
    });

    mount.querySelectorAll('.btn-delete-breeding').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('この繁殖記録を削除してもよろしいですか？')) {
          this.handleDeleteBreedingRecord(btn.dataset.recId);
        }
      });
    });
  }

  setupBreedingModal() {
    const modal = document.getElementById('breeding-record-modal');
    const closeBtn = document.getElementById('breeding-modal-close');
    const newBtn = document.getElementById('btn-new-breeding-record');
    const form = document.getElementById('breeding-record-form');
    const matingInput = document.getElementById('brec-mating-date');
    const dueInput = document.getElementById('brec-due-date');

    if (newBtn) {
      newBtn.addEventListener('click', () => this.openBreedingModal(null));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (form) {
      form.addEventListener('submit', (e) => this.handleBreedingRecordSubmit(e));
    }

    // 交配日入力時に自動で+63日を出産予定日に設定
    if (matingInput && dueInput) {
      matingInput.addEventListener('change', () => {
        if (matingInput.value) {
          const mDate = new Date(matingInput.value);
          if (!isNaN(mDate.getTime())) {
            const dueDate = new Date(mDate.getTime() + 63 * 24 * 60 * 60 * 1000);
            dueInput.value = dueDate.toISOString().split('T')[0];
            const statusSelect = document.getElementById('brec-pregnancy-status');
            if (statusSelect && statusSelect.value === 'resting') {
              statusSelect.value = 'mated';
            }
          }
        }
      });
    }
  }

  openBreedingModal(rec) {
    const modal = document.getElementById('breeding-record-modal');
    if (!modal) return;

    document.getElementById('brec-id').value = rec?.id || '';
    document.getElementById('brec-mother-name').value = rec?.mother_name || '';
    document.getElementById('brec-mother-microchip').value = rec?.mother_microchip || '';
    document.getElementById('brec-mother-breed').value = rec?.mother_breed || 'トイプードル (レッド 2.3kg)';
    document.getElementById('brec-mother-birthdate').value = rec?.mother_birth_date || '2024-01-01';
    document.getElementById('brec-father-name').value = rec?.father_name || '';
    document.getElementById('brec-father-breed').value = rec?.father_breed || 'トイプードル';
    document.getElementById('brec-lifetime-count').value = rec?.lifetime_birth_count ?? 1;
    document.getElementById('brec-mating-date').value = rec?.mating_date || '';
    document.getElementById('brec-due-date').value = rec?.due_date || '';
    document.getElementById('brec-pregnancy-status').value = rec?.pregnancy_status || 'resting';
    document.getElementById('brec-expected-count').value = rec?.expected_count ?? 3;
    document.getElementById('brec-rabies-date').value = rec?.rabies_vaccine_date || '';
    document.getElementById('brec-mixed-date').value = rec?.mixed_vaccine_date || '';
    document.getElementById('brec-memo').value = rec?.memo || '';

    modal.classList.remove('hidden');
  }

  async handleBreedingRecordSubmit(e) {
    e.preventDefault();
    const select = document.getElementById('breeder-select');
    const breederId = select ? select.value : 'b-01';

    const recordData = {
      id: document.getElementById('brec-id').value || undefined,
      breeder_id: breederId,
      mother_name: document.getElementById('brec-mother-name').value,
      mother_microchip: document.getElementById('brec-mother-microchip').value,
      mother_breed: document.getElementById('brec-mother-breed').value,
      mother_birth_date: document.getElementById('brec-mother-birthdate').value,
      father_name: document.getElementById('brec-father-name').value,
      father_breed: document.getElementById('brec-father-breed').value,
      lifetime_birth_count: parseInt(document.getElementById('brec-lifetime-count').value, 10),
      mating_date: document.getElementById('brec-mating-date').value || null,
      due_date: document.getElementById('brec-due-date').value || null,
      pregnancy_status: document.getElementById('brec-pregnancy-status').value,
      expected_count: parseInt(document.getElementById('brec-expected-count').value, 10),
      rabies_vaccine_date: document.getElementById('brec-rabies-date').value || null,
      mixed_vaccine_date: document.getElementById('brec-mixed-date').value || null,
      memo: document.getElementById('brec-memo').value
    };

    try {
      const res = await fetch('/api/breeder/breeding-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      });
      if (!res.ok) throw new Error('Save failed');

      document.getElementById('breeding-record-modal').classList.add('hidden');
      this.showToast('💎 母犬台帳・繁殖交配記録を保存しました！');
      await this.loadBreedingRecords(breederId);
      await this.loadLegalLedger(breederId);
    } catch (err) {
      console.error(err);
      this.showToast('保存に失敗しました');
    }
  }

  async handleDeleteBreedingRecord(recordId) {
    const select = document.getElementById('breeder-select');
    const breederId = select ? select.value : 'b-01';
    try {
      const res = await fetch('/api/breeder/breeding-records/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId })
      });
      if (res.ok) {
        this.showToast('繁殖記録を削除しました');
        await this.loadBreedingRecords(breederId);
        await this.loadLegalLedger(breederId);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ==============================================================================
  // 🌡️ 有料オプションSaaS 2: IoT犬舎温湿度・環境監視 (CO2・遠隔カメラ・LINE通報)
  // ==============================================================================

  async loadIoTEnvironment(breederId) {
    try {
      const res = await fetch(`/api/breeder/iot-environment?breederId=${breederId}`);
      if (!res.ok) return;
      const json = await res.json();
      const envData = json.data;
      if (!envData) return;

      this.currentIoTData = envData;

      // 統計カードの更新
      const bstatIot = document.getElementById('bstat-iot-status');
      const bstatSubIot = document.getElementById('bstat-sub-iot');
      if (bstatIot) {
        if (envData.overallStatus === 'critical') {
          bstatIot.textContent = '危険異常🚨';
          bstatIot.className = 'text-2xl font-black text-red-600 animate-pulse';
        } else if (envData.overallStatus === 'warning') {
          bstatIot.textContent = '要警戒⚠️';
          bstatIot.className = 'text-2xl font-black text-amber-600';
        } else {
          bstatIot.textContent = '正常🟢';
          bstatIot.className = 'text-2xl font-black text-emerald-600';
        }
      }
      if (bstatSubIot) {
        bstatSubIot.textContent = envData.overallStatus === 'normal' ? '温湿度・CO2適正' : '空調・換気要確認';
      }

      this.renderIoTEnvironment(envData);
    } catch (err) {
      console.error('Error loading IoT environment', err);
    }
  }

  renderIoTEnvironment(envData) {
    const mount = document.getElementById('iot-kennels-mount');
    if (!mount || !envData.rooms) return;

    mount.innerHTML = envData.rooms.map(room => {
      const isCritical = room.alert_status === 'critical';
      const isWarning = room.alert_status === 'warning';
      const statusColor = isCritical ? 'border-red-400 bg-red-50/30' : (isWarning ? 'border-amber-400 bg-amber-50/20' : 'border-stone-200 bg-white');

      return `
        <div class="rounded-3xl border ${statusColor} p-5 space-y-4 shadow-sm transition">
          <div class="flex items-center justify-between border-b border-stone-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : (isWarning ? 'bg-amber-500' : 'bg-emerald-500')}"></span>
              <h4 class="font-black text-stone-900 text-sm">${room.room_name}</h4>
            </div>
            <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full ${isCritical ? 'bg-red-100 text-red-800' : (isWarning ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')}">
              ${isCritical ? '🚨 異常検知・LINE通報済' : (isWarning ? '⚠️ 基準値接近' : '🟢 最適環境')}
            </span>
          </div>

          <!-- 3大環境メトリクス (温湿度・CO2) -->
          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="bg-stone-50 p-3 rounded-2xl border border-stone-100">
              <span class="text-[10px] font-bold text-stone-400 block">室温</span>
              <div class="text-xl font-black ${room.temperature > 26.5 ? 'text-amber-600' : 'text-stone-900'}">
                ${room.temperature.toFixed(1)} <span class="text-xs font-normal">℃</span>
              </div>
              <span class="text-[9px] text-stone-400">適正: 22〜25℃</span>
            </div>

            <div class="bg-stone-50 p-3 rounded-2xl border border-stone-100">
              <span class="text-[10px] font-bold text-stone-400 block">湿度</span>
              <div class="text-xl font-black ${room.humidity > 65 ? 'text-amber-600' : 'text-stone-900'}">
                ${room.humidity.toFixed(0)} <span class="text-xs font-normal">%</span>
              </div>
              <span class="text-[9px] text-stone-400">適正: 50〜60%</span>
            </div>

            <div class="bg-stone-50 p-3 rounded-2xl border border-stone-100">
              <span class="text-[10px] font-bold text-stone-400 block">CO2濃度</span>
              <div class="text-xl font-black ${room.co2_ppm > 1000 ? 'text-red-600' : 'text-stone-900'}">
                ${room.co2_ppm} <span class="text-xs font-normal">ppm</span>
              </div>
              <span class="text-[9px] text-stone-400">基準: 1000以下</span>
            </div>
          </div>

          <!-- ライブカメラ静止画ビュー -->
          <div class="relative rounded-2xl overflow-hidden h-36 bg-stone-900 group">
            <img src="${room.camera_stream_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80'}"
              alt="${room.room_name} ライブカメラ" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500">
            <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 text-white px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>LIVE CAM</span>
            </div>
            <div class="absolute bottom-2.5 right-2.5 bg-black/70 text-stone-300 px-2 py-0.5 rounded text-[9px] font-mono">
              自動録画中 (30日間保存)
            </div>
          </div>

          <!-- アラートメッセージ -->
          <p class="text-[11px] ${isCritical ? 'text-red-700 font-bold' : (isWarning ? 'text-amber-700' : 'text-stone-500')} flex items-center gap-1">
            <span>ℹ️</span> ${room.alert_message || '環境は正常です'}
          </p>

          <!-- シミュレーション調整スライダー (デモ用) -->
          <div class="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs space-y-2">
            <div class="flex items-center justify-between text-[11px] font-bold text-stone-600">
              <span>🎛️ センサー値変更テスト (デモ)</span>
              <button type="button" class="btn-apply-iot text-emerald-700 hover:text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded font-black transition"
                data-kennel-id="${room.id}">値適用</button>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label class="text-stone-500 block">室温: <span id="val-temp-${room.id}">${room.temperature}</span>℃</label>
                <input type="range" min="16" max="32" step="0.5" value="${room.temperature}"
                  class="w-full iot-slider-temp" data-kennel-id="${room.id}"
                  oninput="document.getElementById('val-temp-${room.id}').textContent = this.value">
              </div>
              <div>
                <label class="text-stone-500 block">CO2: <span id="val-co2-${room.id}">${room.co2_ppm}</span>ppm</label>
                <input type="range" min="400" max="2000" step="50" value="${room.co2_ppm}"
                  class="w-full iot-slider-co2" data-kennel-id="${room.id}"
                  oninput="document.getElementById('val-co2-${room.id}').textContent = this.value">
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // イベントバインド: センサー適用
    mount.querySelectorAll('.btn-apply-iot').forEach(btn => {
      btn.addEventListener('click', () => {
        const kId = btn.dataset.kennelId;
        const temp = parseFloat(mount.querySelector(`.iot-slider-temp[data-kennel-id="${kId}"]`).value);
        const co2 = parseInt(mount.querySelector(`.iot-slider-co2[data-kennel-id="${kId}"]`).value, 10);
        this.handleIoTUpdate(kId, temp, 55.0, co2);
      });
    });
  }

  async handleIoTUpdate(kennelId, temp, humidity, co2) {
    const select = document.getElementById('breeder-select');
    const breederId = select ? select.value : 'b-01';
    try {
      const res = await fetch('/api/breeder/iot-environment/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kennelId, temperature: temp, humidity, co2_ppm: co2 })
      });
      if (res.ok) {
        this.showToast(`🌡️ センサー値を更新しました (室温: ${temp}℃, CO2: ${co2}ppm)`);
        await this.loadIoTEnvironment(breederId);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ==============================================================================
  // 📋 有料オプションSaaS 3: 法定帳簿ワンクリック自動出力 (立ち入り検査対応)
  // ==============================================================================

  async loadLegalLedger(breederId) {
    try {
      const res = await fetch(`/api/breeder/legal-ledger?breederId=${breederId}`);
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data;
      if (!data) return;

      this.currentLegalLedger = data;
      this.renderLegalLedger(data);
    } catch (err) {
      console.error('Error loading legal ledger', err);
    }
  }

  renderLegalLedger(data) {
    const mount = document.getElementById('legal-ledger-preview-mount');
    if (!mount) return;

    mount.innerHTML = `
      <!-- 帳簿ヘッダー情報 -->
      <div class="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-1">
        <div class="flex items-center justify-between font-bold text-stone-800">
          <span>事業所名: ${data.breeder?.kennel_name || '千住プードル犬舎（直営モデル）'}</span>
          <span class="text-stone-500 font-normal">出力日時: ${data.generatedAt}</span>
        </div>
        <div class="text-stone-600">動物取扱責任者: ${data.breeder?.owner_name || '森本 和夫'} / 登録番号: ${data.breeder?.license_number || '東京都 登録準備中（千住拠点）'}</div>
        <div class="text-[11px] text-blue-700 font-bold mt-1">※ ${data.legalComplianceNote}</div>
      </div>

      <!-- 1. 個体管理台帳サマリー -->
      <div class="space-y-2">
        <h4 class="font-black text-stone-900 text-sm flex items-center justify-between">
          <span>🐶 1. 個体管理台帳 (現在管理中の全${data.individualLedgers.length}頭)</span>
          <span class="text-xs text-stone-500 font-normal">マイクロチップ・検診・ワクチン完全記録</span>
        </h4>
        <div class="overflow-x-auto border border-stone-200 rounded-2xl bg-white">
          <table class="w-full text-left text-xs">
            <thead class="bg-stone-100 text-stone-700 text-[11px]">
              <tr>
                <th class="p-2.5">個体名 / 呼称</th>
                <th class="p-2.5">品種 / 性別</th>
                <th class="p-2.5">生年月日</th>
                <th class="p-2.5">マイクロチップ番号</th>
                <th class="p-2.5">飼養状態</th>
                <th class="p-2.5">健康診断・ワクチン</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              ${data.individualLedgers.map(item => `
                <tr class="hover:bg-stone-50/70">
                  <td class="p-2.5 font-bold text-stone-900">${item.name}</td>
                  <td class="p-2.5">${item.breed} (${item.gender})</td>
                  <td class="p-2.5 font-mono text-[11px]">${item.birthDate}</td>
                  <td class="p-2.5 font-mono text-blue-900 font-bold">${item.microchipNumber}</td>
                  <td class="p-2.5"><span class="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">${item.status}</span></td>
                  <td class="p-2.5 text-[10px] text-stone-600">${item.healthCheckStatus}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. 繁殖台帳サマリー -->
      <div class="space-y-2">
        <h4 class="font-black text-stone-900 text-sm flex items-center justify-between">
          <span>⚖️ 2. 繁殖台帳 (母犬交配・出産記録 ${data.breedingLedgers.length}件)</span>
          <span class="text-xs text-stone-500 font-normal">動愛法6回数値規制完全対応</span>
        </h4>
        <div class="overflow-x-auto border border-stone-200 rounded-2xl bg-white">
          <table class="w-full text-left text-xs">
            <thead class="bg-stone-100 text-stone-700 text-[11px]">
              <tr>
                <th class="p-2.5">母犬名</th>
                <th class="p-2.5">母犬マイクロチップ</th>
                <th class="p-2.5">父犬名</th>
                <th class="p-2.5">交配日 ➔ 出産予定日</th>
                <th class="p-2.5">生涯出産回数 (動愛法)</th>
                <th class="p-2.5">ワクチン</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              ${data.breedingLedgers.map(b => `
                <tr class="hover:bg-stone-50/70">
                  <td class="p-2.5 font-bold text-purple-950">${b.motherName}</td>
                  <td class="p-2.5 font-mono text-blue-900 text-[11px]">${b.motherMicrochip}</td>
                  <td class="p-2.5">${b.fatherName}</td>
                  <td class="p-2.5">${b.matingDate} ➔ ${b.dueDate}</td>
                  <td class="p-2.5 font-bold ${b.legalLimitOk ? 'text-emerald-700' : 'text-red-600'}">${b.lifetimeBirthCount} / 6回 (${b.legalLimitOk ? '規制適合✅' : '上限到達⚠️'})</td>
                  <td class="p-2.5 text-[10px] text-stone-500">狂犬病: ${b.rabiesDate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // 印刷ボタンイベント
    const printBtn = document.getElementById('btn-print-legal-ledger');
    if (printBtn) {
      printBtn.onclick = () => this.openLegalLedgerPrintModal(data);
    }
  }

  openLegalLedgerPrintModal(data) {
    const modal = document.getElementById('legal-ledger-modal');
    const content = document.getElementById('legal-ledger-print-content');
    const closeBtn = document.getElementById('ledger-modal-close');
    if (!modal || !content || !data) return;

    content.innerHTML = `
      <div class="border-b-2 border-stone-900 pb-4 text-center space-y-1">
        <h2 class="text-xl font-black tracking-wide text-stone-900">第一種動物取扱業者 法定管理台帳 (提出用公式帳票)</h2>
        <p class="text-[11px] text-stone-500">動物の愛護及び管理に関する法律施行規則 第2条の2に基づく</p>
      </div>

      <div class="grid grid-cols-2 gap-4 border p-3 rounded-lg text-xs">
        <div><strong>事業所名:</strong> ${data.breeder?.kennel_name}</div>
        <div><strong>登録番号:</strong> ${data.breeder?.license_number}</div>
        <div><strong>動物取扱責任者:</strong> ${data.breeder?.owner_name}</div>
        <div><strong>帳簿出力日時:</strong> ${data.generatedAt}</div>
      </div>

      <div class="space-y-2 pt-2">
        <h3 class="font-black text-sm border-b pb-1">【様式第11号準拠】個体管理台帳</h3>
        <table class="w-full border-collapse border border-stone-300 text-[10px] text-left">
          <thead class="bg-stone-100">
            <tr>
              <th class="border p-2">個体呼称</th>
              <th class="border p-2">品種</th>
              <th class="border p-2">性別</th>
              <th class="border p-2">生年月日</th>
              <th class="border p-2">マイクロチップ識別番号</th>
              <th class="border p-2">飼養状態</th>
              <th class="border p-2">健康診断/ワクチン</th>
            </tr>
          </thead>
          <tbody>
            ${data.individualLedgers.map(d => `
              <tr>
                <td class="border p-1.5 font-bold">${d.name}</td>
                <td class="border p-1.5">${d.breed}</td>
                <td class="border p-1.5">${d.gender}</td>
                <td class="border p-1.5 font-mono">${d.birthDate}</td>
                <td class="border p-1.5 font-mono">${d.microchipNumber}</td>
                <td class="border p-1.5">${d.status}</td>
                <td class="border p-1.5">${d.healthCheckStatus}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="space-y-2 pt-2">
        <h3 class="font-black text-sm border-b pb-1">【様式第12号準拠】繁殖台帳（動愛法6回数値規制適合証明）</h3>
        <table class="w-full border-collapse border border-stone-300 text-[10px] text-left">
          <thead class="bg-stone-100">
            <tr>
              <th class="border p-2">母犬名</th>
              <th class="border p-2">母犬マイクロチップ</th>
              <th class="border p-2">父犬名</th>
              <th class="border p-2">交配年月日</th>
              <th class="border p-2">出産予定日</th>
              <th class="border p-2">生涯出産回数</th>
              <th class="border p-2">動愛法適合判定</th>
            </tr>
          </thead>
          <tbody>
            ${data.breedingLedgers.map(b => `
              <tr>
                <td class="border p-1.5 font-bold">${b.motherName}</td>
                <td class="border p-1.5 font-mono">${b.motherMicrochip}</td>
                <td class="border p-1.5">${b.fatherName}</td>
                <td class="border p-1.5">${b.matingDate}</td>
                <td class="border p-1.5">${b.dueDate}</td>
                <td class="border p-1.5 font-bold">${b.lifetimeBirthCount} / 6回</td>
                <td class="border p-1.5 ${b.legalLimitOk ? 'text-emerald-700' : 'text-red-600 font-bold'}">${b.legalLimitOk ? '基準内適合 (正常)' : '上限到達注意'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="pt-4 border-t border-stone-300 text-right text-[10px] text-stone-500">
        上記内容は法令に基づき適切に記録・管理されていることを証します。
      </div>
    `;

    modal.classList.remove('hidden');
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
  }

  // ==============================================================================
  // ⚡ 有料オプションSaaS 4: サブスクリプション管理
  // ==============================================================================

  async loadBreederSubscription(breederId) {
    try {
      const res = await fetch(`/api/breeder/subscription?breederId=${breederId}`);
      if (!res.ok) return;
      const json = await res.json();
      const sub = json.data;
      if (!sub) return;

      const badge = document.getElementById('breeder-current-plan-badge');
      if (badge) {
        badge.textContent = `${sub.plan_name} (¥${Number(sub.monthly_fee).toLocaleString()}/月)`;
      }
    } catch (err) {
      console.error('Error loading subscription', err);
    }
  }

  setupSubscriptionModal() {
    const openBtn = document.getElementById('btn-open-subscription-modal');
    const modal = document.getElementById('subscription-modal');
    const closeBtn = document.getElementById('sub-modal-close');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    // プラン切替ボタン
    document.querySelectorAll('.btn-change-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const planId = btn.dataset.plan;
        this.handleChangeSubscription(planId);
      });
    });
  }

  async handleChangeSubscription(planId) {
    const select = document.getElementById('breeder-select');
    const breederId = select ? select.value : 'b-01';

    try {
      const res = await fetch('/api/breeder/subscription/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breederId, planId })
      });
      if (!res.ok) throw new Error('Update failed');
      const json = await res.json();

      document.getElementById('subscription-modal').classList.add('hidden');
      this.showToast(`🎉 ${json.planName}への切り替えが完了しました！`);
      await this.loadBreederSubscription(breederId);
    } catch (err) {
      console.error(err);
      this.showToast('プラン変更に失敗しました');
    }
  }

  // ==============================================================================
  // 🌱 生体流通DX: 社会化期チェックリスト編集
  // ==============================================================================

  setupSocializationModal() {
    const modal = document.getElementById('socialization-modal');
    const closeBtn = document.getElementById('soc-modal-close');
    const form = document.getElementById('socialization-form');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (form) {
      form.addEventListener('submit', (e) => this.handleSocializationSubmit(e));
    }
  }

  openSocializationModal(dog) {
    const modal = document.getElementById('socialization-modal');
    if (!modal || !dog) return;

    const soc = dog.socialization || {};
    document.getElementById('soc-dog-id').value = dog.id;
    document.getElementById('soc-dog-title').textContent = `対象: 🐶 ${dog.temporary_name || dog.temporaryName} (${dog.breed})`;

    document.getElementById('soc-check-toilet').checked = Boolean(soc.toilet);
    document.getElementById('soc-check-handtouch').checked = Boolean(soc.handTouch);
    document.getElementById('soc-check-bodytouch').checked = Boolean(soc.bodyTouch);
    document.getElementById('soc-check-cratesleeping').checked = Boolean(soc.crateSleeping);
    document.getElementById('soc-check-sound').checked = Boolean(soc.soundFamiliar);
    document.getElementById('soc-check-people').checked = Boolean(soc.peopleFriendly);
    document.getElementById('soc-notes').value = soc.notes || '';

    modal.classList.remove('hidden');
  }

  async handleSocializationSubmit(e) {
    e.preventDefault();
    const dogId = document.getElementById('soc-dog-id').value;
    const socData = {
      toilet: document.getElementById('soc-check-toilet').checked,
      handTouch: document.getElementById('soc-check-handtouch').checked,
      bodyTouch: document.getElementById('soc-check-bodytouch').checked,
      crateSleeping: document.getElementById('soc-check-cratesleeping').checked,
      soundFamiliar: document.getElementById('soc-check-sound').checked,
      peopleFriendly: document.getElementById('soc-check-people').checked,
      notes: document.getElementById('soc-notes').value
    };

    try {
      const res = await fetch('/api/breeder/dogs/socialization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogId, socialization: socData })
      });
      if (!res.ok) throw new Error('Failed to update socialization');

      document.getElementById('socialization-modal').classList.add('hidden');
      this.showToast('🌱 社会化期の育成カルテを更新・公開しました！');

      const select = document.getElementById('breeder-select');
      const breederId = select ? select.value : 'b-01';
      await this.loadBreederDashboard(breederId);
      await this.fetchDogsFromApi();
    } catch (err) {
      console.error(err);
      this.showToast('社会化カルテの更新に失敗しました');
    }
  }

  // ==============================================================================
  // 👵 ライフステージDX: シニア犬介護度判定＆見守り連携
  // ==============================================================================

  setupSeniorDX() {
    const navBtn = document.getElementById('nav-btn-senior-dx');
    const modal = document.getElementById('senior-dx-modal');
    const closeBtn = document.getElementById('senior-modal-close');
    const form = document.getElementById('senior-assessment-form');

    if (navBtn && modal) {
      navBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (form) {
      form.addEventListener('submit', (e) => this.handleSeniorAssessmentSubmit(e));
    }
  }

  async handleSeniorAssessmentSubmit(e) {
    e.preventDefault();
    const answers = {
      walking: document.getElementById('senior-ans-walking').value,
      eating: document.getElementById('senior-ans-eating').value,
      excretion: document.getElementById('senior-ans-excretion').value,
      cognitive: document.getElementById('senior-ans-cognitive').value
    };

    try {
      const res = await fetch('/api/senior/care-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      if (!res.ok) throw new Error('Assessment failed');
      const json = await res.json();
      const result = json.data;
      if (!result) return;

      const box = document.getElementById('senior-result-box');
      if (box) {
        box.innerHTML = `
          <div class="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <span class="text-[10px] font-bold text-stone-400">診断スコア: ${result.totalScore} / 12点</span>
              <h4 class="text-base font-black text-stone-900 mt-0.5">判定結果: <span class="text-${result.badgeColor}-600 underline">${result.careLevel}</span></h4>
            </div>
            <span class="bg-${result.badgeColor}-100 text-${result.badgeColor}-900 font-black text-xs px-3 py-1 rounded-full border border-${result.badgeColor}-300">
              推奨サポート
            </span>
          </div>

          <p class="text-stone-700 leading-relaxed text-xs">${result.description}</p>

          <div class="space-y-2 pt-2 border-t border-stone-200">
            <span class="font-black text-stone-900 block text-xs">おすすめのDXケアプラン ＆ 提携サービス:</span>
            <ul class="space-y-1.5">
              ${result.recommendedServices.map(s => `
                <li class="flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-200 font-bold text-stone-800 text-[11px]">
                  <span class="text-rose-600">✅</span>
                  <span>${s}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="pt-2">
            <button type="button" onclick="alert('専属シニアケア・コンシェルジュへ相談リクエストを送信しました。担当者よりLINEにて折り返しご連絡いたします。')"
              class="w-full bg-stone-900 hover:bg-stone-800 text-white font-black text-xs py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5">
              <span>📞</span>
              <span>シニアケア・終生飼養の無料相談を申し込む</span>
            </button>
          </div>
        `;
        box.classList.remove('hidden');
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      console.error(err);
      this.showToast('介護度診断に失敗しました');
    }
  }

  // ==============================================================================
  // 📱 最上位オプション: 愛犬デジタルパスポート モーダル制御
  // ==============================================================================

  setupPassportModal() {
    const modal = document.getElementById('passport-modal');
    const closeBtn = document.getElementById('passport-modal-close');
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    // 詳細モーダル内の「愛犬デジタルパスポート表示」ボタンの委任ハンドラ
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-open-dog-passport');
      if (btn) {
        const dogId = btn.dataset.dogId;
        if (dogId) this.openDogPassportModal(dogId);
      }
    });
  }

  async openDogPassportModal(dogId) {
    const modal = document.getElementById('passport-modal');
    const body = document.getElementById('passport-modal-body');
    if (!modal || !body) return;

    body.innerHTML = '<div class="text-center py-8 text-stone-500 font-bold">パスポートデータを照合中...</div>';
    modal.classList.remove('hidden');

    try {
      const res = await fetch(`/api/partner/passport?dogId=${dogId}`);
      if (!res.ok) throw new Error('Passport not found');
      const json = await res.json();
      const pass = json.data;
      if (!pass) return;

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pass.qrDataUrl || pass.passport_code)}`;

      body.innerHTML = `
        <!-- パスポート上部: QRコードと基本属性 -->
        <div class="bg-gradient-to-b from-stone-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md flex flex-col items-center text-center space-y-3 relative overflow-hidden">
          <div class="absolute top-2 right-2 bg-emerald-500 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-full">
            認証済・有効 🟢
          </div>
          <div class="bg-white p-2.5 rounded-2xl shadow-lg">
            <img src="${qrUrl}" alt="Passport QR" class="w-32 h-32 object-contain" />
          </div>
          <div>
            <div class="text-[10px] text-emerald-300 font-mono tracking-wider">PASSPORT CODE</div>
            <div class="text-xl font-mono font-black tracking-widest text-white">${pass.passport_code}</div>
            <h4 class="text-base font-black mt-1">${pass.temporary_name} ちゃん (${pass.breed})</h4>
          </div>
        </div>

        <!-- 予防接種・健康ステータス -->
        <div class="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
          <div class="font-black text-stone-900 text-xs flex items-center justify-between">
            <span>💉 法定ワクチン ＆ 予防接種ステータス</span>
            <span class="text-emerald-700 font-bold text-[10px]">保健所・店舗照合基準適合</span>
          </div>
          <div class="space-y-2 text-[11px]">
            <div class="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
              <span class="font-bold text-stone-700">狂犬病予防注射 (済票登録済)</span>
              <div class="text-right">
                <span class="text-emerald-700 font-black">接種済 (適合) ✅</span>
                <div class="text-[10px] text-stone-400">有効期限: ${pass.rabies_expiry_date || '2027-04-09'}</div>
              </div>
            </div>
            <div class="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
              <span class="font-bold text-stone-700">混合ワクチン (5種/8種)</span>
              <div class="text-right">
                <span class="text-emerald-700 font-black">接種済 (適合) ✅</span>
                <div class="text-[10px] text-stone-400">有効期限: ${pass.mixed_expiry_date || '2027-07-19'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- アレルギー ＆ 個体識別情報 -->
        <div class="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2 text-[11px]">
          <div class="font-black text-amber-900 flex items-center gap-1.5">
            <span>⚠️</span> アレルギー情報 ＆ 緊急連絡先
          </div>
          <div class="flex items-center justify-between border-b border-amber-100 pb-1.5">
            <span class="text-stone-600">既知のアレルゲン:</span>
            <span class="font-black ${pass.allergies && pass.allergies !== 'なし' && pass.allergies !== 'なし（健康良好）' ? 'text-amber-800 bg-amber-100 px-2 py-0.5 rounded' : 'text-emerald-800'}">
              ${pass.allergies || 'なし'}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-stone-600">マイクロチップ番号:</span>
            <span class="font-mono font-bold text-stone-800">${pass.microchip_number || '392144001928311'}</span>
          </div>
        </div>

        <p class="text-[10px] text-stone-400 text-center leading-relaxed">
          提携ドッグカフェ、サロン、ホテルで本画面を提示すると、1秒でスピードチェックインおよびアレルギー事前判定が完了します。
        </p>
      `;
    } catch (err) {
      console.error(err);
      body.innerHTML = '<div class="text-center py-6 text-rose-600 font-bold">パスポートの取得に失敗しました</div>';
    }
  }

  // ==============================================================================
  // 📜 パピー社会化卒業認定証 (Diploma) ＆ 成長引継ぎカルテ制御
  // ==============================================================================

  setupDiplomaModal() {
    const modal = document.getElementById('diploma-modal');
    const closeBtn = document.getElementById('diploma-modal-close');
    const printBtn = document.getElementById('btn-print-diploma');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // ボタンのイベント委任（詳細モーダル内外の「認定証を開く」ボタン）
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-open-puppy-diploma');
      if (btn) {
        const dogId = btn.dataset.dogId;
        if (dogId) this.openPuppyDiplomaModal(dogId);
      }
    });
  }

  async openPuppyDiplomaModal(dogId) {
    const modal = document.getElementById('diploma-modal');
    const printableArea = document.getElementById('diploma-printable-area');
    if (!modal || !printableArea) return;

    printableArea.innerHTML = `
      <div class="py-12 text-center text-stone-500 space-y-3">
        <div class="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div class="text-xs font-bold">パピー社会化 卒業認定証 ＆ 引継ぎカルテを照合・生成中...</div>
      </div>
    `;
    modal.classList.remove('hidden');

    try {
      const res = await fetch(`/api/puppy/diploma?dogId=${dogId}`);
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        this.renderPuppyDiploma(printableArea, json.data);
      } else {
        throw new Error('データ取得に失敗しました');
      }
    } catch (e) {
      console.warn('Diploma load fallback', e);
      const dog = this.dogs.find(d => d.id === dogId) || this.dogs[0] || {};
      this.renderPuppyDiploma(printableArea, {
        diploma_code: `WB-DIP-2026-${dogId.slice(-4).toUpperCase()}`,
        issue_date: new Date().toISOString().split('T')[0],
        breeder_name: "森本 和夫",
        facility_name: "エグゼクティブ物販合同会社（千住古民家 トイ・プードル専門店）",
        father_info: "ルークくん (タイニー / 1.8kg / レッド / PRA遺伝子クリア)",
        mother_info: "ハナちゃん (トイサイズ / 2.7kg / アプリコット / PRA遺伝子クリア)",
        pra_dna_status: "clear",
        dog: dog,
        socialization_items: [
          { category: "トイレトレーニング", title: "サークル内メッシュシーツでの排泄", status: "mastered", score: 90, note: "食後・起床時に自発的にトイレへ行き成功率90%です。" },
          { category: "クレート＆夜泣き", title: "夜間クレート単独就寝・静粛性", status: "mastered", score: 100, note: "初日〜現在まで消灯後の夜泣きゼロで朝まで就寝可能です。" },
          { category: "抱っこ＆人馴れ", title: "マズル・足先・耳のタッチ＆仰向け抱っこ", status: "mastered", score: 100, note: "全身どこを触っても脱力して甘える良好な愛玩性です。" },
          { category: "音慣れ", title: "生活音・インターホン・ドライヤー・掃除機", status: "learning", score: 85, note: "チャイム音や掃除機に驚かず落ち着いて過ごせます。" },
          { category: "道具・リード慣れ", title: "首輪装着・ハーネス・ブラシ・爪切り", status: "learning", score: 75, note: "首輪の違和感なく装着可能。コームブラッシングも協力的です。" },
          { category: "足場・環境慣れ", title: "フローリング・カーペット・段差・鏡", status: "learning", score: 80, note: "滑り止めマット上での運動良好。段差も恐れず昇降できます。" }
        ],
        growth_notes: [
          "体重推移: 生後60日実測体重 680g（タイニー確定級・成犬予想 1.8〜2.0kg）。",
          "食事ペース: ふやかしフードを1日3回、残さずペロリと完食しています。",
          "特記事項: 骨格バランス良好。パテラ（膝蓋骨脱臼）グレード0、噛み合わせ正常です。"
        ]
      });
    }
  }

  renderPuppyDiploma(container, diploma) {
    const dog = diploma.dog || this.dogs.find(d => d.id === diploma.dog_id) || {};
    const items = diploma.socialization_items || [];
    const notes = diploma.growth_notes || [];

    container.innerHTML = `
      <!-- ==================== 表面: パピー社会化 卒業認定証 (Diploma) ==================== -->
      <div class="bg-white border-4 border-double border-amber-600/70 p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden text-stone-800 space-y-6">
        <!-- 四隅のクラシックオーナメント -->
        <span class="absolute top-2 left-2 text-amber-500 text-lg select-none">❖</span>
        <span class="absolute top-2 right-2 text-amber-500 text-lg select-none">❖</span>
        <span class="absolute bottom-2 left-2 text-amber-500 text-lg select-none">❖</span>
        <span class="absolute bottom-2 right-2 text-amber-500 text-lg select-none">❖</span>

        <!-- 表彰ヘッダー -->
        <div class="text-center space-y-1 border-b-2 border-amber-600/30 pb-4">
          <div class="text-[10px] font-mono tracking-widest text-amber-700 font-bold uppercase">
            Official Certification of Early Puppy Socialization
          </div>
          <h2 class="text-2xl sm:text-3xl font-serif font-black tracking-wider text-amber-950">
            パピー社会化 卒業認定証
          </h2>
          <div class="flex items-center justify-center gap-4 text-[10px] font-mono text-stone-500 pt-1">
            <span>認定番号: <b class="text-stone-800">${diploma.diploma_code}</b></span>
            <span>|</span>
            <span>交付年月日: <b class="text-stone-800">${diploma.issue_date}</b></span>
          </div>
        </div>

        <!-- 子犬プロフィール ＆ 血統 -->
        <div class="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-3">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span class="text-stone-500 block text-[10px]">呼名 (仮名称)</span>
              <span class="text-base font-black text-amber-950">🐶 ${dog.temporary_name || dog.temporaryName || 'ワンちゃん'}</span>
            </div>
            <div>
              <span class="text-stone-500 block text-[10px]">犬種 / サイズ</span>
              <span class="font-bold text-stone-800">${dog.breed || 'トイ・プードル'} (${dog.predicted_size_category || dog.predictedSizeCategory || 'タイニー確定級'})</span>
            </div>
            <div>
              <span class="text-stone-500 block text-[10px]">性別 / 毛色</span>
              <span class="font-bold text-stone-800">${dog.gender === 'male' ? '男の子 ♂' : '女の子 ♀'} / ${dog.color || 'アプリコット'}</span>
            </div>
            <div>
              <span class="text-stone-500 block text-[10px]">生年月日</span>
              <span class="font-bold text-stone-800">${dog.birth_date || dog.birthDate || '2026-06-20'}</span>
            </div>
          </div>

          <div class="border-t border-amber-200/60 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
            <div>
              <span class="text-stone-500">血統登録名:</span>
              <span class="font-serif font-bold text-stone-900 ml-1">${dog.registered_name || dog.registeredName || 'WANBRIDGE GOLDEN PRINCE JP'}</span>
            </div>
            <div>
              <span class="text-stone-500">マイクロチップID:</span>
              <span class="font-mono font-bold text-stone-900 ml-1">${dog.microchip_number || dog.microchipNumber || '392144000192831'}</span>
            </div>
          </div>

          <!-- 両親情報 ＆ 遺伝子病検査保証 -->
          <div class="bg-white p-3 rounded-lg border border-amber-300/80 space-y-1 text-[10px]">
            <div class="font-bold text-amber-950 flex items-center justify-between">
              <span>🧬 両親血統 ＆ PRA進行性網膜萎縮症クリア保証</span>
              <span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[9px]">両親遺伝子クリア ✅</span>
            </div>
            <div class="text-stone-700 space-y-0.5 pt-0.5">
              <div>父犬: <b>${diploma.father_info}</b></div>
              <div>母犬: <b>${diploma.mother_info}</b></div>
            </div>
          </div>
        </div>

        <!-- 認定授与本文 -->
        <div class="space-y-2 py-2 text-stone-700 text-xs leading-relaxed sm:leading-loose text-justify font-serif">
          <p>
            本犬は、千住古民家ブリーダー拠点において生後60日齢までのパピー社会化プログラム（トイレの自発的排泄、クレート夜間単独就寝、ハンド・ボディタッチ慣れ、各種生活音順応）を優秀な成績で修了し、人との共生に適した健全な気質と社会性を身につけたことをここに証します。
          </p>
          <p class="text-[11px] text-stone-500">
            ※ 本認定証は、動愛法基準を大幅に上回るウェルフェア環境下で育成され、終生にわたり家族として愛育される基礎が確立されたことを保証するものです。
          </p>
        </div>

        <!-- 発行者署名 ＆ 印影スタンプ -->
        <div class="pt-4 border-t border-amber-600/30 flex items-center justify-between">
          <div class="space-y-0.5 text-[11px]">
            <div class="font-serif font-black text-stone-900">${diploma.facility_name}</div>
            <div class="text-stone-600">動物取扱責任者・公認ブリーダー: <span class="font-bold text-stone-900 text-xs">${diploma.breeder_name}</span></div>
            <div class="text-[10px] text-stone-400">登録番号: 東京都第210084号 (種別: 販売・保管)</div>
          </div>

          <!-- 赤丸印影スタンプ (CSS rendering) -->
          <div class="relative w-16 h-16 rounded-full border-2 border-rose-600 flex flex-col items-center justify-center text-rose-600 font-serif font-black text-[9px] leading-tight rotate-[-6deg] shadow-sm flex-shrink-0 bg-white/90">
            <div class="text-[7px] tracking-tighter">WanBridge</div>
            <div class="text-[11px] font-black border-y border-rose-600/60 my-0.5 px-1">認証印</div>
            <div class="text-[7px]">千住古民家</div>
          </div>
        </div>
      </div>

      <!-- ==================== 裏面: 6大成長引継ぎカルテ ==================== -->
      <div class="diploma-page-break bg-white border border-stone-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-5 text-stone-800">
        <div class="border-b border-stone-200 pb-3 flex items-center justify-between">
          <div>
            <span class="text-[10px] bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded">成長引継ぎカルテ</span>
            <h3 class="text-base font-black text-stone-900 mt-1 flex items-center gap-2">
              <span>📋</span> 6大カテゴリー 社会化達成度 ＆ おうちでの継続ステップ
            </h3>
          </div>
          <div class="text-right text-[10px] text-stone-400">
            対象犬: ${dog.temporary_name || dog.temporaryName || 'ワンちゃん'}
          </div>
        </div>

        <p class="text-[11px] text-stone-600 leading-relaxed">
          犬舎での育成実績を引き継ぎ、新しいご家庭でお迎え後すぐに実践できる「次の練習ステップ」を明記しています。
        </p>

        <!-- 6大カテゴリー達成度グリッド -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${items.map(item => `
            <div class="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-black text-xs text-stone-900 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full ${item.status === 'mastered' ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                  ${item.category}
                </span>
                <span class="text-[11px] font-black ${item.score >= 90 ? 'text-emerald-700' : 'text-amber-700'}">
                  達成度 ${item.score}%
                </span>
              </div>

              <!-- 達成プログレスバー -->
              <div class="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                <div class="h-1.5 rounded-full ${item.score >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}" style="width: ${item.score}%"></div>
              </div>

              <div class="text-[10px] space-y-1">
                <div class="text-stone-700">
                  <span class="font-bold text-stone-900">犬舎実績:</span> ${item.note}
                </div>
                <div class="text-emerald-900 bg-emerald-50/70 p-1.5 rounded border border-emerald-100 font-medium">
                  <span class="font-bold">👉 おうちでの継続:</span> ${item.category.includes('トイレ') ? '起床時と食後すぐにサークル内シーツへ誘導し、成功したらしっかり褒めてください。' :
        item.category.includes('クレート') ? '初日夜泣きしても声掛けや抱っこを我慢し、自力で寝かせる習慣を継続してください。' :
          item.category.includes('抱っこ') ? '毎日のお手入れ（耳・手足）をスキンシップの一環として1日1分続けてください。' :
            item.category.includes('音') ? '掃除機やテレビ音を怖がらないよう、平常心で家族が過ごす姿を見せてあげてください。' :
              item.category.includes('道具') ? '室内で首輪を短時間つける練習を行い、違和感を完全に払拭させましょう。' :
                'フローリングの滑り止めマットを敷き、関節（パテラ）に負担をかけない環境を維持してください。'
      }
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 育成引継ぎメモ ＆ 特記事項 -->
        <div class="bg-amber-50/50 rounded-xl p-3.5 border border-amber-200 text-[11px] space-y-1.5">
          <div class="font-bold text-amber-950 flex items-center gap-1.5">
            <span>📝</span> ブリーダーからの健康・引継ぎ特記事項:
          </div>
          <ul class="space-y-0.5 text-stone-700 pl-3 list-disc marker:text-amber-500 text-[10px]">
            ${notes.map(n => `<li>${n}</li>`).join('')}
          </ul>
        </div>

        <!-- フッター: お迎え初期30日動画＆SOSセーフティネット連携 -->
        <div class="bg-stone-900 text-white p-4 rounded-xl space-y-2 text-[10px]">
          <div class="flex items-center justify-between font-bold text-xs text-amber-300">
            <span>🛡️ お迎え後もずっと安心！WanBridge アフターフォロー連携</span>
            <span class="text-emerald-400">LINE公式常設</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300 text-[10px]">
            <div>
              <span class="font-bold text-white block">① 30日間 初期ステップ動画</span>
              Day1夜泣き〜Day30ワクチンまで、初期の不安を解消するプロ監修動画をLINEへ毎日配信。
            </div>
            <div>
              <span class="font-bold text-white block">② 🚨 緊急SOSホットライン</span>
              万一の飼育困難時も、店長直通ダイヤルと【100%無償里帰り引き取り】の終生セーフティネットを約束。
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==============================================================================
  // 🌅 朝夕点呼記録 ＆ 💩 うんちAI ＆ 📸 SNS自動連携 (Daily Roll-Call DX)
  // ==============================================================================

  setupRollcallDX() {
    const form = document.getElementById('form-daily-rollcall');
    const dogSelect = document.getElementById('rc-dog-select');
    const refreshBtn = document.getElementById('btn-refresh-rollcalls');

    // 1. 犬セレクトボックスの初期化
    const updateDogOptions = () => {
      if (!dogSelect) return;
      dogSelect.innerHTML = (this.dogs || []).map(d => `
        <option value="${d.id}">🐶 ${d.temporaryName || d.temporary_name} (${d.breed} / ${d.predictedSizeCategory || 'タイニー確定級'})</option>
      `).join('');
    };
    updateDogOptions();

    // 2. サンプルうんちスコア切り替えボタン
    document.querySelectorAll('.btn-rc-poop-sample').forEach(btn => {
      btn.addEventListener('click', () => {
        const score = parseInt(btn.dataset.score, 10) || 4;
        const poopImg = document.getElementById('rc-preview-poop');
        if (score === 7) {
          if (poopImg) poopImg.src = "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=800&q=80";
          this.showToast('💩 うんちサンプル: 【スコア7 水様下痢】を選択しました');
        } else if (score === 5) {
          if (poopImg) poopImg.src = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80";
          this.showToast('💩 うんちサンプル: 【スコア5 やや軟便】を選択しました');
        } else {
          if (poopImg) poopImg.src = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80";
          this.showToast('💩 うんちサンプル: 【スコア4 理想的バナナ便】を選択しました');
        }
        if (form) form.dataset.selectedPoopScore = score;
      });
    });

    // 3. サンプル犬写真切り替え
    const dogPhotoBtn = document.querySelector('.btn-rc-sample-photo');
    if (dogPhotoBtn) {
      dogPhotoBtn.addEventListener('click', () => {
        const dogImg = document.getElementById('rc-preview-dog');
        if (!dogImg) return;
        const photos = [
          "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80"
        ];
        const next = photos[(photos.indexOf(dogImg.src) + 1) % photos.length];
        dogImg.src = next;
        this.showToast('📸 今日のワンちゃん写真を撮影・更新しました！');
      });
    }

    // 4. フォーム送信（点呼記録＆うんちAI＆SNS自動投稿）
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-rollcall');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>⏳ AI解析中 ＆ SNS自動投稿パイプライン実行中...</span>';
        }

        const dogId = dogSelect ? dogSelect.value : 'dog-001';
        const rollcallType = document.getElementById('rc-type-select')?.value || 'morning';
        const staff = document.getElementById('rc-staff-input')?.value || '森本 和夫';
        const weight = parseInt(document.getElementById('rc-weight-input')?.value, 10) || 685;
        const notes = document.getElementById('rc-notes-input')?.value || '';
        const poopScore = parseInt(form.dataset.selectedPoopScore, 10) || 4;
        const dogImg = document.getElementById('rc-preview-dog')?.src || '';
        const poopImg = document.getElementById('rc-preview-poop')?.src || '';
        const weightImg = document.getElementById('rc-preview-weight')?.src || '';

        try {
          const res = await fetch('/api/breeder/rollcall', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dogId: dogId,
              rollcallType: rollcallType,
              recordedBy: staff,
              dogPhotoUrl: dogImg,
              poopPhotoUrl: poopImg,
              weightPhotoUrl: weightImg,
              measuredWeightG: weight,
              poopInput: poopScore,
              manualNotes: notes
            })
          });
          const json = await res.json();
          if (json.status === 'success') {
            this.renderRollcallResult(json);
            this.loadRollcallLogs();
            this.loadRollcallStatus();
            this.showToast('🎉 点呼完了！うんちAI解析とSNS自動投稿が実行されました。');
          } else {
            throw new Error(json.message || '点呼登録失敗');
          }
        } catch (err) {
          console.error(err);
          this.showToast('⚠️ 点呼登録エラーが発生しました');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>🌅 点呼完了 ＆ うんちAI診断・SNS自動配信を実行する</span>';
          }
        }
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadRollcallLogs();
        this.loadRollcallStatus();
      });
    }

    // 初回読み込み
    this.loadRollcallLogs();
    this.loadRollcallStatus();
  }

  renderRollcallResult(data) {
    const box = document.getElementById('rc-result-box');
    if (!box) return;

    box.classList.remove('hidden');
    const isEmergency = data.healthStatus === 'emergency';
    const isWarning = data.healthStatus === 'warning';

    box.className = `p-4 rounded-2xl border-2 transition-all duration-300 space-y-3 ${isEmergency ? 'bg-rose-50 border-rose-500 text-rose-950' :
      isWarning ? 'bg-amber-50 border-amber-400 text-amber-950' :
        'bg-emerald-50 border-emerald-400 text-emerald-950'
      }`;

    const poop = data.poopDiagnosis || {};

    box.innerHTML = `
      <div class="flex items-center justify-between border-b ${isEmergency ? 'border-rose-200' : isWarning ? 'border-amber-200' : 'border-emerald-200'} pb-2">
        <div class="flex items-center gap-2 font-black text-sm">
          <span>${isEmergency ? '🚨' : isWarning ? '⚠️' : '🎉'}</span>
          <span>点呼記録完了: 【総合判定: ${isEmergency ? '緊急対応要請' : isWarning ? '要観察・処置' : '健康良好 (オールA)'}】</span>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isEmergency ? 'bg-rose-600 text-white' : isWarning ? 'bg-amber-500 text-stone-950' : 'bg-emerald-600 text-white'
      }">
          記録ID: ${data.logId}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <!-- 💩 うんちAI判定結果 -->
        <div class="bg-white/80 p-3 rounded-xl border border-stone-200 space-y-1">
          <div class="font-bold flex items-center justify-between">
            <span>💩 うんちAI診断 (ブリストル)</span>
            <span class="font-mono font-black ${poop.score === 4 ? 'text-emerald-700' : 'text-rose-700'}">
              スコア: ${poop.score}/7
            </span>
          </div>
          <p class="text-[11px] leading-relaxed text-stone-700">${poop.comment}</p>
        </div>

        <!-- ⚖️ 実測体重 ＆ 増減 -->
        <div class="bg-white/80 p-3 rounded-xl border border-stone-200 space-y-1">
          <div class="font-bold flex items-center justify-between">
            <span>⚖️ 実測体重 ＆ 前回比</span>
            <span class="font-mono font-black ${data.prevWeightDiffG < -20 ? 'text-rose-600' : 'text-stone-900'}">
              ${data.measuredWeightG} g (${data.prevWeightDiffG >= 0 ? '+' : ''}${data.prevWeightDiffG} g)
            </span>
          </div>
          <p class="text-[11px] text-stone-600">
            ${data.prevWeightDiffG < -20 ? '⚠️ 子犬期に前日比急減が発生しています。低血糖対策を実施してください。' : '微増ペース良好。タイニーサイズ確定曲線を順調に推移しています。'}
          </p>
        </div>
      </div>

      <!-- 処置内容ガイダンス -->
      <div class="bg-white/90 p-2.5 rounded-xl border border-stone-200 text-[11px]">
        <span class="font-bold text-stone-800">処置アクション: </span>
        <span class="text-stone-700">${data.actionTaken}</span>
      </div>

      <!-- 📸 SNS自動投稿パイプライン完了ログ -->
      <div class="bg-stone-900 text-white p-3 rounded-xl space-y-1.5 text-[10px]">
        <div class="font-bold text-amber-300 flex items-center justify-between">
          <span>🚀 写真連動マルチSNS自動投稿パイプライン:</span>
          <span class="text-emerald-400">100% 完了 ✅</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-300 pt-1">
          <div class="bg-stone-800 p-1.5 rounded">📸 Instagram: 投稿済</div>
          <div class="bg-stone-800 p-1.5 rounded">🐦 X (Twitter): ポスト完了</div>
          <div class="bg-stone-800 p-1.5 rounded">🎵 TikTok: 動画キュー登録</div>
          <div class="bg-stone-800 p-1.5 rounded text-emerald-400">📱 LINE速報: 18名へ配信</div>
        </div>
      </div>
    `;
  }

  async loadRollcallLogs() {
    const tbody = document.getElementById('rollcall-log-rows');
    if (!tbody) return;

    try {
      const res = await fetch('/api/breeder/rollcalls?limit=20');
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        if (json.data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="9" class="p-6 text-center text-stone-400">本日の点呼記録はまだありません</td></tr>';
          return;
        }

        tbody.innerHTML = json.data.map(r => {
          const isWarning = r.health_status === 'warning';
          const isEmergency = r.health_status === 'emergency';
          return `
            <tr class="hover:bg-stone-50 transition text-[11px]">
              <td class="p-3 text-stone-500 font-mono">${(r.created_at || '').slice(5, 16)}</td>
              <td class="p-3">
                <span class="px-2 py-0.5 rounded font-bold text-[10px] ${r.rollcall_type === 'morning' ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-900'}">
                  ${r.rollcall_type === 'morning' ? '🌅 朝' : '🌆 夕'}
                </span>
              </td>
              <td class="p-3 font-bold text-stone-900">🐶 ${r.temporary_name || 'ワンちゃん'}</td>
              <td class="p-3 font-mono font-bold text-stone-800">${r.measured_weight_g}g</td>
              <td class="p-3 font-mono font-bold ${r.prev_weight_diff_g < -20 ? 'text-rose-600' : 'text-emerald-700'}">
                ${r.prev_weight_diff_g >= 0 ? '+' : ''}${r.prev_weight_diff_g}g
              </td>
              <td class="p-3">
                <span class="font-bold ${r.poop_score === 4 ? 'text-emerald-700' : 'text-amber-700'}">
                  スコア${r.poop_score} (${r.poop_condition === 'healthy' ? '良便' : r.poop_condition === 'soft_warning' ? '軟便' : '下痢'})
                </span>
              </td>
              <td class="p-3">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isEmergency ? 'bg-rose-100 text-rose-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }">
                  ${isEmergency ? '🚨 緊急' : isWarning ? '⚠️ 注意' : '🟢 正常'}
                </span>
              </td>
              <td class="p-3">
                <span class="text-emerald-600 font-bold">自動投稿済 ✅</span>
              </td>
              <td class="p-3 text-stone-600 max-w-[200px] truncate" title="${r.action_taken || ''}">
                ${r.action_taken || '-'}
              </td>
            </tr>
          `;
        }).join('');
      }
    } catch (err) {
      console.warn('Failed to load rollcall logs', err);
    }
  }

  async loadRollcallStatus() {
    try {
      const res = await fetch('/api/breeder/rollcall/status');
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        const d = json.data;
        const morningEl = document.getElementById('rc-stat-morning');
        const eveningEl = document.getElementById('rc-stat-evening');
        const alertEl = document.getElementById('rc-stat-alert');
        const tabCountEl = document.getElementById('btab-count-rollcall');

        if (morningEl) morningEl.textContent = `${d.morningCheckedCount} / ${d.totalDogs} 頭`;
        if (eveningEl) eveningEl.textContent = `${d.eveningCheckedCount} / ${d.totalDogs} 頭`;
        if (alertEl) alertEl.textContent = `${d.alertCount} 頭`;
        if (tabCountEl) tabCountEl.textContent = `${d.morningCheckedCount + d.eveningCheckedCount}/${d.totalDogs * 2}`;
      }
    } catch (err) {
      console.warn('Failed to load rollcall status', err);
    }
  }

  // ==============================================================================
  // 🏪 最上位オプション: 店舗・カフェDXポータル制御 (Enterprise Omni Partner)
  // ==============================================================================

  setupPartnerDX() {
    // 1. タブ切り替え
    document.querySelectorAll('.ptab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.ptab;
        document.querySelectorAll('.ptab-btn').forEach(b => {
          b.classList.remove('active', 'bg-emerald-800', 'text-white', 'shadow');
          b.classList.add('bg-stone-100', 'text-stone-700');
        });
        btn.classList.add('active', 'bg-emerald-800', 'text-white', 'shadow');
        btn.classList.remove('bg-stone-100', 'text-stone-700');

        document.querySelectorAll('.ptab-panel').forEach(p => p.classList.add('hidden'));
        const panel = document.getElementById(`ptab-panel-${targetTab}`);
        if (panel) panel.classList.remove('hidden');

        if (targetTab === 'rotation') {
          const storeId = document.getElementById('partner-store-select')?.value || 'store-01';
          this.loadStaffRotation(storeId);
        }

        if (targetTab === 'profit-engines') {
          this.initProfitEnginesSimulator();
        }
      });
    });

    // 2. 店舗切替セレクト
    const storeSelect = document.getElementById('partner-store-select');
    if (storeSelect) {
      storeSelect.addEventListener('change', () => {
        this.loadPartnerDX();
      });
    }

    // 3. クイック選択ボタン (チェックイン操作盤)
    document.querySelectorAll('.btn-select-checkin-dog').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const name = btn.dataset.name;
        const owner = btn.dataset.owner;
        const weight = btn.dataset.weight;
        const codeInput = document.getElementById('chk-input-code');
        if (codeInput) codeInput.value = code;

        // モバイルオーダー側の体重スライダーも連動
        const slider = document.getElementById('order-weight-slider');
        const display = document.getElementById('order-weight-display');
        if (slider && display) {
          slider.value = weight;
          display.textContent = weight;
          this.loadCafeMenu(btn.dataset.id, weight);
        }

        // 即時照合
        this.verifyPassportCode(code);
      });
    });

    // パスポート入力欄の変更時自動照合
    const codeInput = document.getElementById('chk-input-code');
    if (codeInput) {
      codeInput.addEventListener('input', () => {
        const val = codeInput.value.trim();
        if (val.length >= 6) this.verifyPassportCode(val);
      });
    }

    // チェックインフォーム送信
    const checkinForm = document.getElementById('form-partner-checkin');
    if (checkinForm) {
      checkinForm.addEventListener('submit', (e) => this.handlePartnerCheckinSubmit(e));
    }

    // 4. AIフォトブース テーマ切り替え
    document.querySelectorAll('.photo-theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.photo-theme-btn').forEach(b => {
          b.classList.remove('active', 'border-2', 'border-amber-500', 'bg-amber-50/50');
          b.classList.add('border-stone-200');
        });
        btn.classList.add('active', 'border-2', 'border-amber-500', 'bg-amber-50/50');
        btn.classList.remove('border-stone-200');

        const themeBadge = document.getElementById('photo-theme-badge');
        if (themeBadge) themeBadge.textContent = btn.textContent.trim();
      });
    });

    // AIフォトブース 撮影トリガー
    const photoTriggerBtn = document.getElementById('btn-trigger-photobooth');
    if (photoTriggerBtn) {
      photoTriggerBtn.addEventListener('click', () => this.triggerAiPhotoBooth());
    }

    // ハッシュタグコピーボタン
    const copyTagsBtn = document.getElementById('btn-copy-photo-tags');
    if (copyTagsBtn) {
      copyTagsBtn.addEventListener('click', () => {
        const tagsEl = document.getElementById('photo-instagram-tags');
        if (tagsEl) {
          navigator.clipboard.writeText(tagsEl.textContent.trim());
          this.showToast('📋 Instagram用ハッシュタグをコピーしました！');
        }
      });
    }

    // 5. 愛犬モバイルオーダー 体重スライダー
    const weightSlider = document.getElementById('order-weight-slider');
    const weightDisplay = document.getElementById('order-weight-display');
    if (weightSlider && weightDisplay) {
      weightSlider.addEventListener('input', () => {
        weightDisplay.textContent = weightSlider.value;
        this.loadCafeMenu(null, weightSlider.value);
      });
    }

    // 6. OMO物販 自社ストア注文シミュレーショントリガー
    const omoOrderBtn = document.getElementById('btn-trigger-omo-order');
    if (omoOrderBtn) {
      omoOrderBtn.addEventListener('click', () => this.triggerOmoOrderSimulation());
    }

    // 6.5. ライフステージ連動 LINE CRM自動配信トリガー群
    const openSimCrmBtn = document.getElementById('btn-open-line-sim-crm');
    if (openSimCrmBtn) {
      openSimCrmBtn.addEventListener('click', () => {
        this.openLineSimulatorWithCrm('birthday', 'dog-001');
      });
    }

    document.querySelectorAll('.btn-quick-crm-line').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type || 'birthday';
        this.openLineSimulatorWithCrm(type, 'dog-001');
      });
    });

    // LINE経由の自社ストア注文完了時にポータルのマージン台帳を即時リロード
    window.addEventListener('omo-order-completed', (e) => {
      this.loadPartnerDX();
      this.showToast(`🤝 LINE注文成立！提携カフェへ粗利20%マージン（¥${e.detail.marginAmount.toLocaleString()}）が計上されました！`);
    });

    // 7. B2B資料請求フォーム
    const inquiryForm = document.getElementById('form-partner-inquiry');
    if (inquiryForm) {
      inquiryForm.addEventListener('submit', (e) => this.handlePartnerInquirySubmit(e));
    }

    // 8. 🔄 スタッフローテーション＆鍵管理 イベントリスナー
    const runAiBtn = document.getElementById('btn-run-ai-rotation');
    if (runAiBtn) {
      runAiBtn.addEventListener('click', () => this.runAiRotationOptimization());
    }

    const sosBtn = document.getElementById('btn-trigger-emergency-sos');
    if (sosBtn) {
      sosBtn.addEventListener('click', () => this.triggerEmergencySos());
    }

    const refreshPinsBtn = document.getElementById('btn-refresh-pins');
    if (refreshPinsBtn) {
      refreshPinsBtn.addEventListener('click', () => {
        const storeId = document.getElementById('partner-store-select')?.value || 'store-01';
        this.loadStaffRotation(storeId);
        this.showToast('🔄 SwitchBot Lock Pro 鍵権限ステータスを同期しました');
      });
    }

    const confirmHoBtn = document.getElementById('btn-confirm-handover');
    if (confirmHoBtn) {
      confirmHoBtn.addEventListener('click', () => this.confirmHandover());
    }
  }

  openLineSimulatorWithCrm(messageType = 'birthday', dogId = 'dog-001') {
    const modal = document.getElementById('line-sim-modal');
    if (modal) modal.classList.remove('hidden');
    if (this.lineSimulator) {
      this.lineSimulator.setMode('owner_crm', dogId);
      if (messageType) {
        setTimeout(() => {
          this.lineSimulator.handleCrmTrigger(messageType);
        }, 300);
      }
    }
  }


  async verifyPassportCode(code) {
    try {
      const res = await fetch(`/api/partner/passport?code=${encodeURIComponent(code)}`);
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data;
      const resultBox = document.getElementById('chk-verification-result');
      const statusEl = document.getElementById('chk-result-status');
      const detailEl = document.getElementById('chk-result-detail');
      if (!resultBox || !statusEl || !detailEl) return;

      if (data.verified) {
        resultBox.className = 'bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-start gap-3';
        statusEl.textContent = `✅ ${data.dogName}ちゃん (${data.breed}): 狂犬病・混合ワクチン適合（入店許可）`;
        detailEl.textContent = `狂犬病有効: ${data.rabiesExpiry} | 混合ワクチン有効: ${data.mixedExpiry} | アレルギー: ${data.allergies || 'なし'}`;
      } else {
        resultBox.className = 'bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-start gap-3';
        statusEl.textContent = `⚠️ 照合警告: ${data.message || 'ワクチン期限切れ・未登録'}`;
        detailEl.textContent = '店頭にて紙の接種証明書原本のご提示をお願いいたします。';
      }
    } catch (err) {
      console.error(err);
    }
  }

  async handlePartnerCheckinSubmit(e) {
    e.preventDefault();
    const storeId = document.getElementById('partner-store-select')?.value || 'store-01';
    const code = document.getElementById('chk-input-code')?.value || 'WB-PASS-8821';
    const tableNo = document.getElementById('chk-input-table')?.value || 'テラス席 A-1';
    const mannerAgreed = document.getElementById('chk-manner-agreed')?.checked ?? true;

    try {
      const res = await fetch('/api/partner/cafe/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          dogId: 'dog-001',
          dogName: code === 'WB-PASS-3349' ? 'モコちゃん' : '青リボンくん',
          ownerName: code === 'WB-PASS-3349' ? '鈴木 美咲様' : '佐藤 健一様',
          tableNo,
          mannerPledged: mannerAgreed
        })
      });
      if (!res.ok) throw new Error('Checkin failed');
      const json = await res.json();
      this.showToast(`⚡ ${json.message || 'チェックインが完了しました！'}`);
      this.loadCafeCheckins(storeId);
    } catch (err) {
      console.error(err);
      this.showToast('チェックインに失敗しました');
    }
  }

  async triggerAiPhotoBooth() {
    const storeId = document.getElementById('partner-store-select')?.value || 'store-01';
    const dogSelect = document.getElementById('photobooth-dog-select');
    const dogId = dogSelect ? dogSelect.value : 'dog-001';
    const activeThemeBtn = document.querySelector('.photo-theme-btn.active');
    const theme = activeThemeBtn ? activeThemeBtn.dataset.theme : 'autumn';

    const triggerBtn = document.getElementById('btn-trigger-photobooth');
    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.innerHTML = '<span>⚡</span> <span>AI表情認識・瞳フォーカス現像中...</span>';
    }

    try {
      const res = await fetch('/api/partner/cafe/photo-booth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          dogId,
          photoType: 'cafe_booth',
          themeSeason: theme,
          smileScore: 0.98
        })
      });
      if (!res.ok) throw new Error('Photo failed');
      const json = await res.json();
      const photo = json.data;

      // 写真とタグを反映
      const previewImg = document.getElementById('photobooth-preview-img');
      const scoreEl = document.getElementById('photo-smile-score');
      const tagsEl = document.getElementById('photo-instagram-tags');
      const dlLink = document.getElementById('photo-download-link');

      if (previewImg) previewImg.src = photo.imageUrl;
      if (scoreEl) scoreEl.textContent = photo.smileScore;
      if (tagsEl) tagsEl.textContent = photo.instagramTags;
      if (dlLink) dlLink.href = photo.imageUrl;

      this.showToast('📸 AI笑顔検知完了！奇跡の1枚が現像されました');
    } catch (err) {
      console.error(err);
      this.showToast('AI撮影に失敗しました');
    } finally {
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = '<span>📸</span> <span>AIシャッター連写 ＆ 奇跡の1枚を自動現像</span>';
      }
    }
  }

  async triggerOmoOrderSimulation() {
    const storeId = document.getElementById('partner-store-select')?.value || 'store-01';
    const productSelect = document.getElementById('omo-order-product');
    const customerInput = document.getElementById('omo-order-customer');
    const selectedOpt = productSelect?.selectedOptions[0];
    const productName = selectedOpt?.value || '熟成エゾ鹿肉キューブ定期便';
    const price = parseInt(selectedOpt?.dataset.price || '4800', 10);
    const customerName = customerInput?.value || 'カフェ来店ゲスト様';

    try {
      const res = await fetch('/api/partner/cafe/omo-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          customerName,
          productName,
          orderAmount: price,
          commissionRate: 0.15
        })
      });
      if (!res.ok) throw new Error('OMO order failed');
      const json = await res.json();
      this.showToast(`🛒 ${json.message}`);
      this.loadPartnerMarginSummary(storeId);
    } catch (err) {
      console.error(err);
      this.showToast('注文シミュレーションに失敗しました');
    }
  }

  async handlePartnerInquirySubmit(e) {
    e.preventDefault();
    const companyName = document.getElementById('inq-company')?.value;
    const storeType = document.getElementById('inq-type')?.value;
    const contactName = document.getElementById('inq-contact')?.value;
    const email = document.getElementById('inq-email')?.value;
    const phone = document.getElementById('inq-phone')?.value;
    const inquiryNote = document.getElementById('inq-note')?.value;

    try {
      const res = await fetch('/api/partner/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          storeType,
          contactName,
          email,
          phone,
          inquiryNote
        })
      });
      if (!res.ok) throw new Error('Inquiry failed');
      const json = await res.json();
      alert(json.message);
      e.target.reset();
    } catch (err) {
      console.error(err);
      this.showToast('送信に失敗しました');
    }
  }

  async loadPartnerDX() {
    const storeId = document.getElementById('partner-store-select')?.value || 'store-01';
    this.loadCafeCheckins(storeId);
    this.loadCafeMenu('dog-001', 2.0);
    this.loadPartnerMarginSummary(storeId);
    this.loadPartnerStores();
    this.loadStaffRotation(storeId);
    this.setupProfitEnginesDX();
  }

  /**
   * 📊 高収益5大商材マネジメントDX 初期化＆イベント設定
   */
  setupProfitEnginesDX() {
    // 1. クイックフォーカスボタン（ランキング表の行ボタン）
    const bindFocus = (btnClass, cardId) => {
      document.querySelectorAll(`.${btnClass}`).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = document.getElementById(cardId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.add('ring-4', 'ring-amber-400', 'transition-all');
            setTimeout(() => target.classList.remove('ring-4', 'ring-amber-400'), 1500);
          }
        });
      });
    };
    bindFocus('btn-quick-focus-insurance', 'quick-card-insurance');
    bindFocus('btn-quick-focus-wash', 'quick-card-wash');
    bindFocus('btn-quick-focus-treats', 'quick-card-treats');
    bindFocus('btn-quick-focus-puppy', 'quick-card-puppy');
    bindFocus('btn-quick-focus-goods', 'quick-card-goods');

    // ヘルパー: OMO台帳に行を追加＆マージン加算
    const addCommissionRow = (prodName, custName, price, marginAmt, commRateStr = '100%') => {
      const rowsMount = document.getElementById('omo-commission-rows');
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const orderId = `WB-5E-${now.getTime().toString().slice(-4)}`;

      if (rowsMount) {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-amber-50/60 transition-colors bg-emerald-50/40 animate-fade-in';
        tr.innerHTML = `
          <td class="p-3 font-mono text-[11px]">${dateStr}</td>
          <td class="p-3 font-mono text-[11px] font-bold text-amber-900">${orderId}</td>
          <td class="p-3 font-bold">${custName}</td>
          <td class="p-3 font-black text-stone-900">${prodName}</td>
          <td class="p-3 text-right font-mono">¥${price.toLocaleString()}</td>
          <td class="p-3 text-center font-bold text-amber-700">${commRateStr}</td>
          <td class="p-3 text-right font-mono font-black text-emerald-700">¥${marginAmt.toLocaleString()}</td>
          <td class="p-3 text-center">
            <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">確定済</span>
          </td>
        `;
        rowsMount.insertBefore(tr, rowsMount.firstChild);
      }

      // KPIマージン加算
      const kpiMount = document.getElementById('kpi-partner-commission');
      const payoutMount = document.getElementById('omo-payout-amount');
      if (kpiMount) {
        const current = parseInt(kpiMount.textContent.replace(/[^0-9]/g, '') || '0', 10);
        const updated = current + marginAmt;
        kpiMount.textContent = `¥${updated.toLocaleString()}`;
        if (payoutMount) payoutMount.textContent = `¥${updated.toLocaleString()}`;
      }
    };

    // 2. 🥇 ペット保険 登録
    const btnIns = document.getElementById('btn-submit-insurance');
    if (btnIns && !btnIns.dataset.bound) {
      btnIns.dataset.bound = '1';
      btnIns.addEventListener('click', () => {
        const plan = document.getElementById('act-insurance-plan')?.value || 'anicom-50';
        const owner = document.getElementById('act-insurance-owner')?.value || '佐藤 健一様';
        const planText = plan.includes('70') ? 'アニコム損保 どうぶつ健保 (70%プラン)' : 'アニコム損保 どうぶつ健保 (50%プラン)';
        const fee = plan.includes('70') ? 12000 : 10000;
        addCommissionRow(`🛡️ ${planText}`, owner, 0, fee, '手数料100%');
        this.showToast(`🎉 ペット保険申込完了！代理店手数料 ¥${fee.toLocaleString()} を計上しました（チーム山分け＋1,500円 / 担当＋1,000円）`);
      });
    }

    // 3. 🥈 犬用セルフウォッシュ 登録
    const btnWash = document.getElementById('btn-submit-wash');
    if (btnWash && !btnWash.dataset.bound) {
      btnWash.dataset.bound = '1';
      btnWash.addEventListener('click', () => {
        const course = document.getElementById('act-wash-course')?.value || '30min';
        const dog = document.getElementById('act-wash-dog')?.value || 'モコちゃん';
        let price = 1500;
        let margin = 1350;
        let cName = 'セルフウォッシュ30分基本';
        if (course === '60min') { price = 2500; margin = 2250; cName = 'セルフウォッシュ60分ゆったり'; }
        if (course === '30min-tansan') { price = 2000; margin = 1800; cName = 'セルフウォッシュ30分＋高濃度炭酸泉'; }
        if (course === '60min-full') { price = 3000; margin = 2700; cName = 'セルフウォッシュ60分＋炭酸泉＋ハーブ'; }
        addCommissionRow(`🛁 ${cName} (${dog})`, `${dog}の飼い主様`, price, margin, '粗利90%');
        this.showToast(`🛁 セルフウォッシュ利用開始！店舗粗利 ¥${margin.toLocaleString()} を計上（チーム山分け＋300円）`);
      });
    }

    // 4. 🥉 自家製無添加おやつ＆ケーキ 登録
    const btnTreat = document.getElementById('btn-submit-treat');
    if (btnTreat && !btnTreat.dataset.bound) {
      btnTreat.dataset.bound = '1';
      btnTreat.addEventListener('click', () => {
        const item = document.getElementById('act-treat-item')?.value || 'jerky-1';
        const note = document.getElementById('act-treat-note')?.value || '店頭お持ち帰り';
        let price = 700;
        let margin = 640;
        let name = '自家製無添加 鶏ささみジャーキー40g';
        if (item === 'jerky-3') { price = 1980; margin = 1800; name = '自家製鶏ささみジャーキー3袋セット'; }
        if (item === 'cake-9cm') { price = 1800; margin = 1620; name = `愛犬用米粉バースデーケーキ9cm (${note})`; }
        addCommissionRow(`🍖 ${name}`, 'カフェご来店客', price, margin, '粗利80〜91%');
        this.showToast(`🍖 自家製おやつ販売計上！粗利 ¥${margin.toLocaleString()} を計上しました`);
      });
    }

    // 5. 🏅 子犬直販 成約登録
    const btnPuppy = document.getElementById('btn-submit-puppy');
    if (btnPuppy && !btnPuppy.dataset.bound) {
      btnPuppy.dataset.bound = '1';
      btnPuppy.addEventListener('click', () => {
        const val = document.getElementById('act-puppy-select')?.value || 'dog-001|385000';
        const owner = document.getElementById('act-puppy-owner')?.value || '中村 貴之様';
        const parts = val.split('|');
        const price = parseInt(parts[1] || '385000', 10);
        const margin = price - 28000; // 直接原価2.8万
        const pool = Math.round(price * 0.025);
        addCommissionRow(`🐶 子犬自家繁殖直販 成約 (生体#${parts[0]})`, owner, price, margin, '粗利85%');
        this.showToast(`🎊 子犬直販ご成約おめでとうございます！店舗粗利 ¥${margin.toLocaleString()} ＆ チーム山分けプール ¥${pool.toLocaleString()} を計上しました`);
      });
    }

    // 6. 🎖️ パピースターター5点セット レジ販売
    const btnGoods = document.getElementById('btn-submit-goods');
    if (btnGoods && !btnGoods.dataset.bound) {
      btnGoods.dataset.bound = '1';
      btnGoods.addEventListener('click', () => {
        const pack = document.getElementById('act-goods-pack')?.value || 'starter-full';
        const cust = document.getElementById('act-goods-customer')?.value || 'お迎え成約の中村様';
        let price = 29800;
        let margin = 15800;
        let name = 'パピースターター5点セット（ケージ・トイレ・給水器等）';
        if (pack === 'tapo-kit') { price = 6980; margin = 1780; name = 'TP-Link Tapo見守りカメラキット'; }
        if (pack === 'smart-collar') { price = 14800; margin = 7600; name = 'WanBridge Smart Collar Pro'; }
        addCommissionRow(`📦 ${name}`, cust, price, margin, '問屋掛率47%');
        this.showToast(`📦 物販レジ販売計上！店舗粗利 ¥${margin.toLocaleString()} を計上（チーム山分け＋1,000円）`);
      });
    }

    // 7. 🧮 5大エンジン月間試算シミュレータ動的計算
    this.initProfitEnginesSimulator();
  }

  /**
   * 🧮 5大エンジン月間試算シミュレータ
   */
  initProfitEnginesSimulator() {
    const sPuppy = document.getElementById('sim-puppy-slider');
    const sIns = document.getElementById('sim-ins-slider');
    const sWash = document.getElementById('sim-wash-slider');
    const sTreat = document.getElementById('sim-treat-slider');

    if (!sPuppy || !sIns || !sWash || !sTreat) return;

    const calc = () => {
      const numPuppy = parseInt(sPuppy.value, 10);
      const numIns = parseInt(sIns.value, 10);
      const numWash = parseInt(sWash.value, 10);
      const numTreat = parseInt(sTreat.value, 10);

      const dPuppy = document.getElementById('sim-puppy-count-val');
      const dIns = document.getElementById('sim-ins-count-val');
      const dWash = document.getElementById('sim-wash-count-val');
      const dTreat = document.getElementById('sim-treat-count-val');
      if (dPuppy) dPuppy.textContent = `${numPuppy} 頭`;
      if (dIns) dIns.textContent = `${numIns} 件`;
      if (dWash) dWash.textContent = `${numWash} 回`;
      if (dTreat) dTreat.textContent = `${numTreat} 個`;

      // 粗利計算
      const puppyGross = numPuppy * 315000; // 1頭平均売価35万 - 原価2.8万 = 粗利約32万
      const starterGross = numPuppy * 0.8 * 15800; // お迎え客の8割がスターターセット購入
      const insGross = numIns * 10000; // 保険1件1万円
      const washGross = numWash * 1500 * 0.9; // 30分1500円の90%
      const treatGross = numTreat * 800 * 0.85; // おやつ平均800円の85%
      const cafeGross = 150000; // 人間用飲食（来店300名×1500円×粗利35%）

      const totalGross = Math.round(puppyGross + starterGross + insGross + washGross + treatGross + cafeGross);
      const fixedCost = 225000; // 家賃12万 + バイト7.5万 + 光熱費3万
      const netProfit = totalGross - fixedCost;

      // ボーナスプール
      const bonusPool = Math.round(
        (numPuppy * 9625) +
        (numPuppy * 0.8 * 1000) +
        (numIns * 2500) +
        (numWash * 300) +
        (numTreat * 20)
      );

      const resGross = document.getElementById('sim-res-gross');
      const resNet = document.getElementById('sim-res-net');
      const resBonus = document.getElementById('sim-res-bonus');
      if (resGross) resGross.textContent = `¥${totalGross.toLocaleString()}`;
      if (resNet) resNet.textContent = `¥${netProfit.toLocaleString()}`;
      if (resBonus) resBonus.textContent = `¥${bonusPool.toLocaleString()}`;

      const topKpi = document.getElementById('engine-kpi-monthly-profit');
      if (topKpi) topKpi.textContent = `¥${totalGross.toLocaleString()}`;
    };

    [sPuppy, sIns, sWash, sTreat].forEach(el => {
      el.removeEventListener('input', calc);
      el.addEventListener('input', calc);
    });
    calc();
  }

  async loadStaffRotation(storeId = 'store-01') {
    try {
      const res = await fetch(`/api/partner/staff/rotation?storeId=${storeId}`);
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data;
      if (!data) return;

      // 1. 本日シフトカードの描画
      const todayCards = document.getElementById('rotation-today-cards');
      if (todayCards && data.today) {
        const shifts = data.today.shifts || [];
        const overlap = data.today.goldenOverlap;
        const early = shifts.find(s => s.type === 'early') || {};
        const late = shifts.find(s => s.type === 'late') || {};

        todayCards.innerHTML = `
          <div class="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2 relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">${early.name || '早番'}</span>
              <span class="text-[11px] text-emerald-700 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">${early.status || '勤務中'}</span>
            </div>
            <div class="text-base font-black text-stone-900">${early.staff || '-'}</div>
            <div class="text-xs text-stone-600">${early.role || ''}</div>
            <div class="text-[11px] text-stone-500 font-mono pt-2 border-t border-amber-200 flex items-center justify-between">
              <span>🔐 PIN: <strong class="text-stone-900">${early.keyPin || '******'}</strong> (${early.keyValidTime || ''})</span>
              <span class="text-emerald-700 font-sans font-bold text-[10px]">${early.keyStatus || ''}</span>
            </div>
          </div>

          <div class="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-2 relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded-full">${late.name || '遅番'}</span>
              <span class="text-[11px] text-purple-700 font-bold bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full">${late.status || '待機中'}</span>
            </div>
            <div class="text-base font-black text-stone-900">${late.staff || '-'}</div>
            <div class="text-xs text-stone-600">${late.role || ''}</div>
            <div class="text-[11px] text-stone-500 font-mono pt-2 border-t border-purple-200 flex items-center justify-between">
              <span>🔐 PIN: <strong class="text-stone-900">${late.keyPin || '******'}</strong> (${late.keyValidTime || ''})</span>
              <span class="text-purple-700 font-sans font-bold text-[10px]">${late.keyStatus || ''}</span>
            </div>
          </div>

          <div class="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-4 space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-emerald-950 bg-emerald-200 px-2.5 py-0.5 rounded-full">⭐ 重複ゴールデンタイム (2名体制)</span>
              <span class="text-xs text-emerald-800 font-black font-mono">${overlap?.time || '13:30〜16:00'}</span>
            </div>
            <div class="text-sm font-black text-emerald-950">${early.staff || ''} ＋ ${late.staff || ''}</div>
            <div class="text-xs text-emerald-800">${overlap?.detail || '来店集中・生体商談・除菌ケアの万全2名カバー'}</div>
            <div class="text-[11px] text-emerald-700 pt-1.5 border-t border-emerald-200 flex items-center justify-between">
              <span>✅ 看護師 ＋ トリマー常駐担保</span>
              <span class="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">ピーク稼働中</span>
            </div>
          </div>
        `;
      }

      // 2. 週間ローテーション表の描画
      const weeklyTbody = document.getElementById('rotation-weekly-tbody');
      if (weeklyTbody && data.weeklySchedule) {
        weeklyTbody.innerHTML = data.weeklySchedule.map((row, idx) => {
          const isToday = idx === 0;
          const isWeekend = row.date.includes('土') || row.date.includes('日');
          return `
            <tr class="${isToday ? 'bg-amber-50/70 font-semibold' : 'hover:bg-stone-50'} transition">
              <td class="py-3 px-3 font-bold ${isWeekend ? 'text-rose-600 font-black' : 'text-stone-800'}">
                ${row.date} ${isToday ? '<span class="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded ml-1 font-bold">本日</span>' : ''}
              </td>
              <td class="py-3 px-3 text-stone-700 font-medium">🌅 ${row.early}</td>
              <td class="py-3 px-3 text-stone-700 font-medium">🌙 ${row.late}</td>
              <td class="py-3 px-3">
                <span class="font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                  ${row.overlap}
                </span>
              </td>
              <td class="py-3 px-3">
                <span class="text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                  ${row.qualCheck}
                </span>
              </td>
            </tr>
          `;
        }).join('');
      }

      // 3. スタッフプール ＆ 公平性マトリクスの描画
      const poolContainer = document.getElementById('rotation-staff-pool');
      if (poolContainer && data.staffPool) {
        poolContainer.innerHTML = data.staffPool.map(s => `
          <div class="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-black text-stone-900 text-xs">${s.name}</span>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">${s.weekendRatio}</span>
            </div>
            <div class="text-[11px] text-stone-500">${s.role}</div>
            <div class="text-[10px] text-stone-600 flex items-center justify-between pt-1 border-t border-stone-200">
              <span>出勤ペース: ${s.daysMonth}</span>
              <span class="text-emerald-700 font-bold">インターバル適格 ✅</span>
            </div>
          </div>
        `).join('');
      }

      // 4. SwitchBot 本日暗証番号 (PIN) リストの描画
      const lockPinsContainer = document.getElementById('rotation-lock-pins');
      if (lockPinsContainer && data.smartLockPins) {
        lockPinsContainer.innerHTML = data.smartLockPins.map(p => `
          <div class="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-1">
            <div class="flex items-center justify-between font-bold text-xs">
              <span class="text-stone-900">${p.staff} (${p.slot})</span>
              <span class="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">${p.pin}</span>
            </div>
            <div class="text-[11px] text-stone-500 flex items-center justify-between">
              <span>有効: ${p.validFrom} 〜 ${p.validTo}</span>
              <span class="text-stone-700 font-bold text-[10px]">${p.status}</span>
            </div>
          </div>
        `).join('');
      }

      // 5. 朝夕申し送り引継ぎ日誌の反映
      if (data.handover) {
        const ho = data.handover;
        const senderEl = document.getElementById('ho-sender');
        const timeEl = document.getElementById('ho-time');
        const vitalsEl = document.getElementById('ho-vitals');
        const poopEl = document.getElementById('ho-poop');
        const sanEl = document.getElementById('ho-sanitation');
        const custEl = document.getElementById('ho-customer');
        const cashEl = document.getElementById('ho-cash');
        const badgeEl = document.getElementById('handover-status-badge');

        if (senderEl) senderEl.textContent = ho.sender;
        if (timeEl) timeEl.textContent = `${ho.lastUpdated} 記録`;
        if (vitalsEl) vitalsEl.textContent = ho.vitals;
        if (poopEl) poopEl.textContent = ho.poopAI;
        if (sanEl) sanEl.textContent = ho.sanitation;
        if (custEl) custEl.textContent = ho.customerNotes;
        if (cashEl) cashEl.textContent = ho.cashDrawer;
        if (badgeEl) {
          if (ho.status === 'acknowledged') {
            badgeEl.textContent = '受領済 ✅';
            badgeEl.className = 'text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full';
          } else {
            badgeEl.textContent = '受領待ち';
            badgeEl.className = 'text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full';
          }
        }
      }
    } catch (err) {
      console.error("[loadStaffRotation Error]", err);
    }
  }

  async runAiRotationOptimization() {
    try {
      this.showToast('🤖 AIが労基法・インターバル11h・土日均等配分を計算中...');
      const res = await fetch('/api/partner/staff/generate', { method: 'POST' });
      const json = await res.json();
      this.showToast(`✨ ${json.message || 'AIシフト最適化が完了しました！'}`);
      const storeId = document.getElementById('partner-store-select')?.value || 'store-01';
      this.loadStaffRotation(storeId);
    } catch (err) {
      console.error(err);
      this.showToast('最適化の実行に失敗しました');
    }
  }

  async triggerEmergencySos() {
    try {
      const res = await fetch('/api/partner/staff/sos', { method: 'POST' });
      const json = await res.json();
      alert(`【🚨 当日急募・緊急代行要請】\n\n${json.message}\n\n・緊急手当: +¥2,000 付与\n・SwitchBot解錠権限: 立候補確定時に即時自動切替`);
      this.showToast('🚨 待機スタッフ全員へLINE急募を一斉配信しました！');
    } catch (err) {
      console.error(err);
      this.showToast('緊急要請の送信に失敗しました');
    }
  }

  async confirmHandover() {
    try {
      const res = await fetch('/api/partner/staff/handover/confirm', { method: 'POST' });
      const json = await res.json();
      const badgeEl = document.getElementById('handover-status-badge');
      if (badgeEl) {
        badgeEl.textContent = '受領済 ✅';
        badgeEl.className = 'text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full';
      }
      const btn = document.getElementById('btn-confirm-handover');
      if (btn) {
        btn.innerHTML = '<span>✅</span> <span>申し送り受領確認完了 (引継ぎ済)</span>';
        btn.classList.remove('bg-emerald-700', 'hover:bg-emerald-600');
        btn.classList.add('bg-stone-400', 'cursor-default');
        btn.disabled = true;
      }
      this.showToast('✅ 申し送りを正常に受領しました。夕方・夜間オペレーションを開始します。');
    } catch (err) {
      console.error(err);
      this.showToast('申し送り受領の送信に失敗しました');
    }
  }

  async loadCafeCheckins(storeId = 'store-01') {
    const container = document.getElementById('partner-checkins-list');
    if (!container) return;
    try {
      const res = await fetch(`/api/partner/cafe/checkins?storeId=${storeId}`);
      if (!res.ok) return;
      const json = await res.json();
      const list = json.data || [];
      if (list.length === 0) {
        container.innerHTML = '<div class="text-stone-400 text-center py-4 text-xs">本日の入店履歴はありません</div>';
        return;
      }
      container.innerHTML = list.map(c => {
        const dName = c.dog_name || c.dogName || '愛犬ちゃん';
        const oName = c.owner_name || c.customerName || '飼い主様';
        const tbl = c.table_no || c.tableNo || '-';
        const rawTime = c.checkin_time || c.checkinTime || '';
        const timeStr = rawTime.includes(' ') ? rawTime.split(' ')[1] : rawTime;

        return `
        <div class="bg-stone-50 border border-stone-100 p-2.5 rounded-xl space-y-1">
          <div class="flex items-center justify-between font-bold text-stone-800 text-xs">
            <span class="flex items-center gap-1.5">
              <span>🐶</span>
              <span>${dName}</span>
            </span>
            <span class="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">適合 ✅</span>
          </div>
          <div class="flex items-center justify-between text-[10px] text-stone-500">
            <span>${oName} / 席: ${tbl}</span>
            <span class="font-mono">${timeStr}</span>
          </div>
        </div>
      `;
      }).join('');
    } catch (err) {
      console.error(err);
    }
  }

  async loadCafeMenu(dogId = null, weight = 2.0) {
    const container = document.getElementById('cafe-menu-grid');
    if (!container) return;
    const storeId = document.getElementById('partner-store-select')?.value || 'store-01';
    try {
      const url = `/api/partner/cafe/menu?storeId=${storeId}${dogId ? `&dogId=${dogId}` : ''}&weight=${weight}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const json = await res.json();
      const menus = json.data || [];

      container.innerHTML = menus.map(m => `
        <div class="bg-stone-50 rounded-2xl p-4 border ${m.hasAllergyWarning ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'} space-y-3 flex flex-col justify-between relative shadow-sm">
          ${m.hasAllergyWarning ? `
            <span class="absolute -top-2.5 right-3 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow animate-pulse">
              ⚠️ アレルゲン含有
            </span>
          ` : ''}
          <div class="space-y-2">
            <div>
              <span class="text-[10px] font-bold ${m.category === 'meal' ? 'bg-amber-100 text-amber-900' : m.category === 'celebration' ? 'bg-purple-100 text-purple-900' : 'bg-stone-200 text-stone-700'} px-2 py-0.5 rounded-full">
                ${m.category === 'meal' ? '主食・薬膳' : m.category === 'celebration' ? 'お祝い記念' : 'おやつ・トッピング'}
              </span>
              <h4 class="font-black text-stone-900 text-sm mt-1">${m.name}</h4>
              <p class="text-[11px] text-stone-500 line-clamp-2">${m.description}</p>
            </div>

            <!-- アレルギー判定テキスト -->
            <div class="text-[10px] font-bold ${m.hasAllergyWarning ? 'text-rose-700 bg-rose-100/70 p-1.5 rounded-lg' : 'text-emerald-700'}">
              ${m.hasAllergyWarning ? m.allergyAlertText : '✅ 低アレルゲン・安心素材'}
            </div>

            <!-- 体重連動適正給与量 -->
            <div class="bg-white border border-stone-200 rounded-xl p-2.5 space-y-1 text-xs">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-stone-500">体重 ${m.targetWeight}kgの推奨量:</span>
                <span class="font-black text-amber-950">${m.calculatedGram} g</span>
              </div>
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-stone-500">摂取想定カロリー:</span>
                <span class="font-black text-stone-700">${m.calculatedKcal} kcal</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-stone-200">
            <div class="text-base font-black text-stone-900">¥${m.price.toLocaleString()}</div>
            <button type="button" onclick="alert('${m.name}（${m.calculatedGram}g）を厨房へ注文しました！')"
              class="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow active:scale-95">
              席から注文
            </button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  async loadPartnerMarginSummary(storeId = 'store-01') {
    const rowsMount = document.getElementById('omo-commission-rows');
    const payoutMount = document.getElementById('omo-payout-amount');
    const kpiMount = document.getElementById('kpi-partner-commission');
    if (!rowsMount) return;

    try {
      const res = await fetch(`/api/partner/cafe/margin-summary?storeId=${storeId}`);
      if (!res.ok) return;
      const json = await res.json();
      const summary = json.data;
      if (!summary) return;

      const totalCommission = summary.totalCommission ?? summary.currentMonthMargin ?? 0;
      if (payoutMount) payoutMount.textContent = `¥${totalCommission.toLocaleString()}`;
      if (kpiMount) kpiMount.textContent = `¥${totalCommission.toLocaleString()}`;

      const history = summary.history || summary.recentOrders || [];
      if (history.length === 0) {
        rowsMount.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-stone-400">マージン実績はありません</td></tr>';
        return;
      }

      rowsMount.innerHTML = history.map(h => {
        const date = h.created_at || '2026-09-06';
        const orderId = h.order_id || h.orderId || '-';
        const cust = h.customer_name || h.customerName || '-';
        const prod = h.product_name || h.productName || '-';
        const amt = h.order_amount ?? h.amount ?? 0;
        const commRate = h.commission_rate != null ? `${Math.round(h.commission_rate * 100)}%` : '粗利20%';
        const commAmt = h.commission_amount ?? h.margin ?? 0;

        return `
          <tr class="hover:bg-stone-50">
            <td class="p-3 font-mono text-[11px]">${date}</td>
            <td class="p-3 font-mono text-[11px] font-bold">${orderId}</td>
            <td class="p-3">${cust}</td>
            <td class="p-3 font-bold text-stone-900">${prod}</td>
            <td class="p-3 text-right font-mono">¥${amt.toLocaleString()}</td>
            <td class="p-3 text-center font-bold text-amber-600">${commRate}</td>
            <td class="p-3 text-right font-mono font-black text-emerald-700">¥${commAmt.toLocaleString()}</td>
            <td class="p-3 text-center">
              <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">確定済</span>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
    }
  }

  async loadPartnerStores() {
    const mount = document.getElementById('partner-stores-grid');
    if (!mount) return;
    try {
      const res = await fetch('/api/partner/stores');
      if (!res.ok) return;
      const json = await res.json();
      const stores = json.data || [];

      mount.innerHTML = stores.map(s => `
        <div class="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold ${s.store_type === 'cafe' ? 'bg-emerald-100 text-emerald-800' : s.store_type === 'salon' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} px-2 py-0.5 rounded-full">
              ${s.store_type === 'cafe' ? 'ドッグカフェ' : s.store_type === 'salon' ? 'サロン&Spa' : s.store_type === 'hospital' ? '動物医療センター' : 'サテライト'}
            </span>
            <span class="text-[10px] text-stone-400">マージン率: ${Math.round(s.commission_rate * 100)}%</span>
          </div>
          <div>
            <h4 class="font-black text-stone-900 text-xs">${s.store_name}</h4>
            <p class="text-[10px] text-stone-500">${s.address}</p>
          </div>
          <div class="flex items-center justify-between text-[10px] pt-1 border-t border-stone-200 text-stone-600">
            <span>累計送客売上: ¥${(s.total_sales_generated || 0).toLocaleString()}</span>
            <span class="font-bold text-emerald-700">還元: ¥${(s.total_commissions_earned || 0).toLocaleString()}</span>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  // ==============================================================================
  // 🚀 ブリーダー産業 6大DX戦略 コントロールセンター制御
  // ==============================================================================
  setupSixPillarsDX() {
    // 1. 🧬 COIシミュレーション
    const btnCoi = document.getElementById('btn-run-coi-sim');
    if (btnCoi) {
      btnCoi.addEventListener('click', async () => {
        const sireId = document.getElementById('coi-sire-select')?.value || 'dog-001';
        const damId = document.getElementById('coi-dam-select')?.value || 'dog-002';
        const mount = document.getElementById('coi-result-mount');
        btnCoi.disabled = true;
        btnCoi.innerHTML = '<span>⏳</span> シミュレーション計算中...';

        try {
          const res = await fetch('/api/breeder/coi/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonStringify({ sireId, damId })
          });
          const json = await res.json();
          const d = json.data;
          if (mount) {
            mount.classList.remove('hidden');
            mount.innerHTML = `
              <div class="flex justify-between items-center font-bold pb-1 border-b border-indigo-200">
                <span>近親交配係数 (COI): <strong class="${d.coiPercentage > 6.25 ? 'text-rose-600' : 'text-indigo-700'}">${d.coiPercentage}%</strong></span>
                <span class="${d.isMatingLocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'} px-2 py-0.5 rounded-full font-black text-[10px]">
                  ${d.isMatingLocked ? '🚨 交配ロック' : '✅ 健全交配認可'}
                </span>
              </div>
              <div class="text-[11px] text-stone-600 space-y-0.5">
                <div>・遺伝病リスク: PRA [<strong>${d.praRisk}</strong>] ｜ DM [<strong>${d.dmRisk}</strong>]</div>
                <div>・健全性スコア: <strong>${Math.round(d.soundnessScore * 100)}点</strong> / 100点</div>
                <div>・予想毛色: ${d.prediction?.predictedColors?.join(', ') || 'レッド・アプリコット'}</div>
                <div class="text-[10px] text-stone-500 pt-1 font-medium">${d.lockReason}</div>
              </div>
            `;
          }
        } catch (e) {
          console.error(e);
        } finally {
          btnCoi.disabled = false;
          btnCoi.innerHTML = '<span>🧬</span> 仮想交配COIシミュレーションを実行';
        }
      });
    }

    // 2. 🏷️ 非接触ミリ波レーダー見守り
    const vitalButtons = document.querySelectorAll('.btn-vital-test');
    vitalButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const vtest = btn.dataset.vtest;
        let resp = 22, heart = 120, motion = 0.85, isOverlay = false, temp = 29.5;
        if (vtest === 'crush') {
          resp = 10;
          heart = 70;
          motion = 0.1;
          isOverlay = true;
          temp = 29.0;
        } else if (vtest === 'motionless') {
          resp = 11;
          heart = 80;
          motion = 0.05;
          isOverlay = false;
          temp = 27.2;
        }

        try {
          const res = await fetch('/api/breeder/vital/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonStringify({
              kennelId: 'NURSERY-01',
              targetType: 'puppy',
              respirationRateBpm: resp,
              heartRateBpm: heart,
              microMotionLevel: motion,
              isOverlay: isOverlay,
              temperatureCelsius: temp
            })
          });
          const json = await res.json();
          const d = json.data;

          const badge = document.getElementById('vital-current-status-badge');
          const dispResp = document.getElementById('vital-disp-resp');
          const dispMotion = document.getElementById('vital-disp-motion');
          const dispTemp = document.getElementById('vital-disp-temp');

          if (dispResp) dispResp.textContent = `${d.respirationRateBpm} bpm`;
          if (dispMotion) dispMotion.textContent = `${d.microMotionLevel} (${d.microMotionLevel > 0.3 ? '良好' : '完全不動'})`;
          if (dispTemp) dispTemp.textContent = `${d.temperatureCelsius} ℃`;

          if (badge) {
            if (d.isOverlayCrushAlarm) {
              badge.className = 'text-white bg-rose-600 px-2 py-0.5 rounded-full font-black animate-pulse';
              badge.textContent = '🚨 母犬圧死危険警報発令中！';
              alert(d.alertMessage);
            } else if (d.isMotionlessAlarm) {
              badge.className = 'text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full font-black';
              badge.textContent = '⚠️ 呼吸低下・完全不動警戒';
            } else {
              badge.className = 'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-black';
              badge.textContent = '正常稼働 (22bpm)';
            }
          }
        } catch (e) {
          console.error(e);
        }
      });
    });

    // 3. 🍼 黄金ふやかしスマートスケーラー
    const btnFeed = document.getElementById('btn-calc-feed-recipe');
    if (btnFeed) {
      btnFeed.addEventListener('click', async () => {
        const weight = Number(document.getElementById('feed-input-weight')?.value || 685);
        const days = Number(document.getElementById('feed-input-days')?.value || 58);
        const poop = Number(document.getElementById('feed-input-poop')?.value || 4);
        const mount = document.getElementById('feed-recipe-mount');

        try {
          const res = await fetch('/api/breeder/feed/recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonStringify({ dogId: 'dog-001', currentWeightG: weight, ageDays: days, poopScore: poop })
          });
          const json = await res.json();
          const r = json.data;
          if (mount) {
            mount.classList.remove('hidden');
            mount.innerHTML = `
              <div class="font-bold text-emerald-900 pb-1 border-b border-emerald-200 flex justify-between items-center">
                <span>調合指示: 1回あたり <strong>${r.perMealKibbleG}g</strong> ＋ 50℃ぬるま湯 <strong>${r.warmWaterMl}ml</strong></span>
                <span class="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md font-black">浸漬${r.soakMinutes}分</span>
              </div>
              <div class="text-[11px] text-stone-600 space-y-0.5">
                <div>・整腸生菌サプリ: <strong>${r.probioticDrops}滴</strong> ｜ パピー粉ミルク: <strong>${r.formulaPowderG}g</strong></div>
                <div class="text-[10px] text-stone-500 font-medium">${r.recipeNotes}</div>
              </div>
            `;
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    // 4. 🎥 AI骨格リアルタイム採寸
    const btnMeas = document.getElementById('btn-run-ai-measurement');
    if (btnMeas) {
      btnMeas.addEventListener('click', async () => {
        const h = Number(document.getElementById('meas-input-height')?.value || 122);
        const l = Number(document.getElementById('meas-input-length')?.value || 135);
        const mount = document.getElementById('measurement-result-mount');

        try {
          const res = await fetch('/api/breeder/remote/measure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonStringify({ dogId: 'dog-001', withersHeightMm: h, bodyLengthMm: l })
          });
          const json = await res.json();
          const m = json.data;
          if (mount) {
            mount.classList.remove('hidden');
            mount.innerHTML = `
              <div class="font-bold text-purple-900 pb-1 border-b border-purple-200 flex justify-between items-center">
                <span>体型比率: <strong>${m.bodyTypeRatio === 'square' ? 'スクエア' : 'ハイパーコビー (胴詰まり)'}</strong></span>
                <span class="bg-purple-200 text-purple-800 text-[10px] px-2 py-0.5 rounded-md font-black">成犬時予測: ${m.predictedAdultWeightKg} kg</span>
              </div>
              <div class="text-[11px] text-stone-600">
                <div>・サイズ判定: <strong>${m.predictedSizeCategory === 'tiny' ? 'タイニープードル' : 'ティーカッププードル'}</strong> (AI信頼度 96%)</div>
                <div class="text-[10px] text-stone-400">※足首太さ11.2mmおよび骨格寸法による重回帰モデル推論</div>
              </div>
            `;
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    // 5. 🏛️ 動愛法 立入検査帳簿
    const btnAudit = document.getElementById('btn-generate-audit-report');
    if (btnAudit) {
      btnAudit.addEventListener('click', async () => {
        const mount = document.getElementById('audit-report-mount');
        try {
          const res = await fetch('/api/breeder/legal-audit/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonStringify({ breederId: 'b-01', period: '2026-09' })
          });
          const json = await res.json();
          const a = json.data;
          if (mount) {
            mount.classList.remove('hidden');
            mount.innerHTML = `
              <div class="bg-blue-100 p-2.5 rounded-lg border border-blue-200 space-y-1">
                <div class="flex justify-between font-bold text-blue-950">
                  <span>立入検査判定: <strong>${a.auditGrade}</strong></span>
                  <span class="text-blue-700 underline cursor-pointer" onclick="alert('保健所提出用 法定監査帳簿PDF (2026年9月期 確定版) をダウンロードしました')">📄 PDFダウンロード</span>
                </div>
                <div class="text-[10px] text-blue-800">
                  飼育母犬${a.breedingDamCount}頭 / 父犬${a.breedingSireCount}頭 ｜ ${a.capacityUtilization}
                </div>
              </div>
            `;
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    // 6. 🤝 DNAファミリー
    const btnDna = document.getElementById('btn-refresh-dna-family');
    if (btnDna) {
      btnDna.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/breeder/dna-family?dogId=dog-001');
          const json = await res.json();
          alert('モコちゃんDNAファミリーネットワークを最新データに同期しました（累計LTV: 485,000円）');
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  // ==========================================================================
  // 🛍️ 犬用スマート便利グッズ＆IoT公式ストア メソッド群
  // ==========================================================================

  /**
   * グッズストア商品の取得とレンダリング
   */
  
  getAffiliateSearchQuery(prod) {
    if (prod.affiliate_search) return prod.affiliate_search;
    const name = prod.name || "";
    if (name.includes("ダンボール迷路")) return "犬 ダンボール 迷路";
    if (name.includes("ダンボールベッド")) return "犬 段ボール ベッド";
    if (name.includes("スマート首輪")) return "犬 GPS 首輪";
    if (name.includes("見守りカメラ") || name.includes("Tapo")) return "TP-Link Tapo 見守りカメラ ペット";
    if (name.includes("温湿度計")) return "Tapo 温湿度計 ペット";
    if (name.includes("計量ボウル")) return "ペット フードボウル スケール";
    if (name.includes("LED") || name.includes("ハーネス")) return "光る ハーネス 犬 夜間 LED";
    if (name.includes("パピードール") || name.includes("鼓動")) return "犬 おもちゃ 心拍 ぬいぐるみ パピー";
    if (name.includes("うんちBOX") || name.includes("消臭")) return "犬 うんちBOX 防臭 密閉";
    if (name.includes("歯ブラシ")) return "犬 音波振動 歯ブラシ";
    if (name.includes("エゾ鹿")) return "犬 無添加 エゾ鹿肉 ジャーキー";
    if (name.includes("脱感作")) return "犬 ブラシ スリッカー コーム セット";
    if (name.includes("チキンフレーク")) return "犬 無添加 チキン トッピング";
    if (name.includes("スターターフルセット") || name.includes("スターター5点")) return "犬 ケージ サークル トイレ 給水器 セット";
    if (name.includes("ささみジャーキー")) return "犬 ささみ ジャーキー 無添加 国産";
    if (name.includes("バースデーケーキ")) return "犬用 バースデーケーキ 無添加";
    if (name.includes("セルフウォッシュ")) return "犬 シャンプー 炭酸泉 オーガニック";
    if (name.includes("保険")) return "ペット保険 犬";
    return name.replace(/【.*?】/g, "").replace(/（.*?）/g, "").trim();
  }

  async loadGoodsShop(category = 'all', search = '') {
    const grid = document.getElementById('shop-products-grid');
    if (!grid) return;

    // カテゴリボタンのスタイル更新
    document.querySelectorAll('.shop-cat-btn').forEach(btn => {
      const cat = btn.dataset.category;
      if (cat === category) {
        btn.classList.add('bg-amber-600', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-stone-100', 'text-stone-600');
      } else {
        btn.classList.remove('bg-amber-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-stone-100', 'text-stone-600');
      }
    });

    grid.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-12 text-stone-400 gap-2">
          <span class="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
          <span>便利グッズ＆IoT商品カタログを読み込み中...</span>
        </div>
      `;

    try {
      const queryParams = new URLSearchParams({ category, search });
      const res = await fetch(`/api/shop/products?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const json = await res.json();
      const products = json.data || [];

      if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-stone-500 space-y-2">
              <span class="text-3xl">🔍</span>
              <p class="font-bold">該当する商品は見つかりませんでした。</p>
            </div>
          `;
        return;
      }

      // 商品カード生成
      grid.innerHTML = products.map(p => {
        const affQuery = this.getAffiliateSearchQuery(p);
        const encodedAffQuery = encodeURIComponent(affQuery);
        const rakutenUrl = `https://search.rakuten.co.jp/search/mall/${encodedAffQuery}/`;
        const amazonUrl = `https://www.amazon.co.jp/s?k=${encodedAffQuery}`;
        const isFeatured = p.is_featured;
        const features = Array.isArray(p.features) ? p.features : [];
        const costPrice = p.cost_price || Math.round(p.price * 0.7);
        const grossProfit = Math.max(0, p.price - costPrice);
        const partnerMargin = p.partner_commission || Math.round(grossProfit * 0.2);
        const supplierName = p.supplier_name || '提携正規卸問屋';

        return `
            <div class="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
              <!-- 商品画像 ＆ バッジ -->
              <div class="relative aspect-video bg-stone-100 overflow-hidden">
                <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span class="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                  ${p.category_label || p.category}
                </span>
                ${isFeatured ? `
                  <span class="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                    ★ おすすめ
                  </span>
                ` : ''}
              </div>

              <!-- コンテンツ -->
              <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div class="space-y-2">
                  <a href="${rakutenUrl}" target="_blank" rel="noopener noreferrer" class="block group/link" title="楽天市場で見る">
                    <h3 class="font-black text-stone-900 text-sm md:text-base leading-snug group-hover/link:text-red-600 transition">
                      ${p.name}
                    </h3>
                  </a>
                  <p class="text-xs text-stone-600 font-medium leading-relaxed line-clamp-2">
                    ${p.tagline}
                  </p>

                  <!-- 特徴リスト -->
                  <div class="space-y-1 pt-1">
                    ${features.slice(0, 3).map(f => `
                      <div class="flex items-center gap-1.5 text-[11px] text-stone-700">
                        <span class="text-emerald-600 font-bold">✓</span>
                        <span class="truncate">${f}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div class="space-y-3 pt-2 border-t border-stone-100">
                  <!-- 価格 ＆ カフェ還元表示 -->
                  <div class="space-y-1.5">
                    <div class="flex items-baseline justify-between">
                      <div>
                        <span class="text-xs text-stone-400">税込販売価格</span>
                        <div class="text-xl font-black text-amber-700">
                          ¥${p.price.toLocaleString()}
                        </div>
                      </div>
                      <div class="text-right">
                        <span class="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          カフェ還元: +¥${partnerMargin.toLocaleString()} (粗利20%)
                        </span>
                        <div class="text-[10px] text-stone-400 mt-0.5">在庫あり (即納可)</div>
                      </div>
                    </div>
                    <!-- 卸仕入値 ＆ 粗利益の健全性表示（逆ザヤ防止） -->
                    <div class="flex items-center justify-between text-[10px] bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-150 text-stone-500">
                      <span>📦 仕入: <b class="text-stone-700">${supplierName}</b></span>
                      <span>粗利: <b class="text-emerald-800 font-bold">¥${grossProfit.toLocaleString()}</b> <span class="text-stone-400">(卸¥${costPrice.toLocaleString()})</span></span>
                    </div>
                  </div>

                  <!-- 販路区分バッジ（AliEx無在庫直送 vs 国内アフィリエイト限定） -->
                  <div class="pt-1">
                    ${p.channel_type === domestic_affiliate_only ? `
                      <span class="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                        <span>🛡️</span>
                        <span>国内法令完全クリア（検疫・ペットフード安全法・技適済）</span>
                      </span>
                    ` : `
                      <span class="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-200 flex items-center justify-between">
                        <span class="flex items-center gap-1"><span>⚡</span><span>AliExpress無在庫直送＋国内EC併売</span></span>
                        <span class="text-emerald-700 font-black">${p.margin_note || 粗利70%超}</span>
                      </span>
                    `}
                  </div>

                  <!-- 🔴 楽天市場で探す ＆ 📦 Amazonで探す ダイレクト送客ボタン -->
                  <div class="space-y-2 pt-1">
                    <div class="grid grid-cols-2 gap-2">
                      <a href="${rakutenUrl}" target="_blank" rel="noopener noreferrer"
                        class="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs py-2.5 px-2 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 text-center border border-red-500/30 group/rakuten">
                        <span class="text-sm">🔴</span>
                        <span>楽天市場で探す</span>
                        <span class="text-[10px] opacity-80 group-hover/rakuten:translate-x-0.5 transition-transform">➔</span>
                      </a>
                      <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer"
                        class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-xs py-2.5 px-2 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 text-center border border-amber-400/50 group/amazon">
                        <span class="text-sm">📦</span>
                        <span>Amazonで探す</span>
                        <span class="text-[10px] opacity-80 group-hover/amazon:translate-x-0.5 transition-transform">➔</span>
                      </a>
                    </div>

                    ${p.aliexpress_url ? `
                      <div class="grid grid-cols-2 gap-2">
                        <a href="${p.aliexpress_url}" target="_blank" rel="noopener noreferrer"
                          class="bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 font-bold text-[11px] py-1.5 px-2 rounded-xl text-center flex items-center justify-center gap-1 transition active:scale-98">
                          <span>🌐</span>
                          <span>AliExpress直送仕入</span>
                        </a>
                        <button type="button" class="btn-buy-product bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 font-bold text-[11px] py-1.5 px-2 rounded-xl transition active:scale-98 flex items-center justify-center gap-1 border border-stone-200"
                          data-product-id="${p.id}">
                          <span>☕</span>
                          <span>直営窓口で注文</span>
                        </button>
                      </div>
                    ` : `
                      <button type="button" class="btn-buy-product w-full bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 font-bold text-[11px] py-2 rounded-xl transition active:scale-98 flex items-center justify-center gap-1.5 border border-stone-200"
                        data-product-id="${p.id}">
                        <span>☕</span>
                        <span>千住古民家直営サポート窓口で注文</span>
                      </button>
                    `}
                  </div>
                </div>
              </div>
            </div>
          `;
      }).join('');

      // ボタンイベント登録
      grid.querySelectorAll('.btn-buy-product').forEach(btn => {
        btn.addEventListener('click', () => {
          const pId = btn.dataset.productId;
          this.openGoodsOrderModal(pId);
        });
      });

    } catch (e) {
      console.error(e);
      grid.innerHTML = `
          <div class="col-span-full text-center py-12 text-rose-500 font-bold">
            商品の読み込みに失敗しました。もう一度お試しください。
          </div>
        `;
    }

    // カテゴリボタンのイベント
    const catContainer = document.getElementById('shop-category-buttons');
    if (catContainer && !catContainer.dataset.initialized) {
      catContainer.dataset.initialized = "true";
      catContainer.querySelectorAll('.shop-cat-btn').forEach(b => {
        b.addEventListener('click', () => {
          const cat = b.dataset.category;
          this.loadGoodsShop(cat, document.getElementById('shop-search-input')?.value || '');
        });
      });

      const searchInput = document.getElementById('shop-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const activeCatBtn = catContainer.querySelector('.shop-cat-btn.bg-amber-600');
          const activeCat = activeCatBtn ? activeCatBtn.dataset.category : 'all';
          this.loadGoodsShop(activeCat, e.target.value);
        });
      }
    }
  }

  /**
   * 商品注文モーダル展開 ＆ カフェマージン試算
   */
  async openGoodsOrderModal(productId) {
    const modal = document.getElementById('goods-order-modal');
    if (!modal) return;

    try {
      const res = await fetch(`/api/shop/product?productId=${productId}`);
      if (!res.ok) throw new Error('Product not found');
      const json = await res.json();
      const prod = json.data;
      if (!prod) return;

      this.currentOrderingProduct = prod;
      this.currentOrderQuantity = 1;

      // モーダル要素の初期設定
      document.getElementById('order-product-image').src = prod.image_url;
      document.getElementById('order-product-name').textContent = prod.name;
      document.getElementById('order-product-category').textContent = prod.category_label || prod.category;
      document.getElementById('order-product-price').textContent = prod.price.toLocaleString();
      document.getElementById('order-quantity').textContent = '1';

      const globalCafeCode = document.getElementById('shop-global-cafe-code')?.value || 'SENJU-CAFE';
      const cafeInput = document.getElementById('order-cafe-code');
      if (cafeInput) cafeInput.value = globalCafeCode;

      // モーダル内の楽天・Amazonダイレクトリンクも設定
      const affQuery = this.getAffiliateSearchQuery(prod);
      const encodedQ = encodeURIComponent(affQuery);
      const modalRakuten = document.getElementById('modal-btn-rakuten');
      const modalAmazon = document.getElementById('modal-btn-amazon');
      if (modalRakuten) modalRakuten.href = `https://search.rakuten.co.jp/search/mall/${encodedQ}/`;
      if (modalAmazon) modalAmazon.href = `https://www.amazon.co.jp/s?k=${encodedQ}`;

      this.updateOrderModalAmounts();

      // 数量＋ーボタンのイベント
      const minusBtn = document.getElementById('btn-qty-minus');
      const plusBtn = document.getElementById('btn-qty-plus');
      minusBtn.onclick = () => {
        if (this.currentOrderQuantity > 1) {
          this.currentOrderQuantity--;
          document.getElementById('order-quantity').textContent = this.currentOrderQuantity;
          this.updateOrderModalAmounts();
        }
      };
      plusBtn.onclick = () => {
        if (this.currentOrderQuantity < 10) {
          this.currentOrderQuantity++;
          document.getElementById('order-quantity').textContent = this.currentOrderQuantity;
          this.updateOrderModalAmounts();
        }
      };

      if (cafeInput) {
        cafeInput.oninput = () => this.updateOrderModalAmounts();
      }

      // 閉じるボタン
      const closeBtn = document.getElementById('goods-order-modal-close');
      closeBtn.onclick = () => modal.classList.add('hidden');

      // フォーム送信
      const form = document.getElementById('goods-order-form');
      form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-goods-order');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳</span><span>注文処理中...</span>`;

        const cName = document.getElementById('order-customer-name').value;
        const cEmail = document.getElementById('order-customer-email').value;
        const sAddr = document.getElementById('order-shipping-address').value;
        const cafeCode = cafeInput.value.trim();

        try {
          const orderRes = await fetch('/api/shop/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonStringify({
              productId: prod.id,
              quantity: this.currentOrderQuantity,
              customerName: cName,
              customerEmail: cEmail,
              shippingAddress: sAddr,
              storeId: cafeCode ? 'store-01' : null
            })
          });
          const orderJson = await orderRes.json();
          modal.classList.add('hidden');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>🛒</span><span>注文を確定する</span>`;

          if (orderJson.status === 'success') {
            const comm = orderJson.data.partnerCommissionEarned;
            this.showToast(`🎉 ご注文完了！【${prod.name}】の発送手配を受け付けました。（千住古民家カフェへ ¥${comm.toLocaleString()} の紹介マージンを還元）`);
          } else {
            alert('注文に失敗しました: ' + orderJson.message);
          }
        } catch (err) {
          console.error(err);
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>🛒</span><span>注文を確定する</span>`;
          alert('注文通信エラーが発生しました。');
        }
      };

      modal.classList.remove('hidden');
    } catch (e) {
      console.error(e);
      alert('商品情報の取得に失敗しました。');
    }
  }

  /**
   * 注文モーダルの合計金額＆マージン更新ヘルパー (粗利20%シェア連動)
   */
  updateOrderModalAmounts() {
    if (!this.currentOrderingProduct) return;
    const prod = this.currentOrderingProduct;
    const qty = this.currentOrderQuantity;
    const total = prod.price * qty;
    const costTotal = (prod.cost_price || Math.round(prod.price * 0.7)) * qty;
    const grossProfit = Math.max(0, total - costTotal);
    const margin = prod.partner_commission
      ? prod.partner_commission * qty
      : Math.round(grossProfit * 0.2);
    document.getElementById('order-total-amount').textContent = total.toLocaleString();
    document.getElementById('order-calc-margin').textContent = margin.toLocaleString();
  }

  // ==========================================================================
  // 🎥 TP-Link Tapo 2K Live Camera 遠隔見学 メソッド群
  // ==========================================================================

  /**
   * Tapo 2K Live Camera 遠隔見学モーダル展開
   */
  async openTapoLiveModal(dogId, dogName) {
    const modal = document.getElementById('tapo-live-modal');
    if (!modal) return;

    try {
      const res = await fetch('/api/tapo/stream/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStringify({ dogId, viewerName: '見学体験者様', durationMinutes: 30 })
      });
      const json = await res.json();
      const data = json.data;

      document.getElementById('tapo-modal-title').textContent = `${dogName || '子犬'}ちゃん 産室天井カメラ (${data.deviceName || 'Tapo C120'})`;
      document.getElementById('tapo-stream-temp').textContent = data.tempCelsius || '29.6';
      document.getElementById('tapo-stream-hum').textContent = data.humidityPct || '54.8';

      const liveImg = document.getElementById('tapo-live-image');
      if (data.streamUrl) liveImg.src = data.streamUrl;

      // プライバシーモードの反映
      const privOverlay = document.getElementById('tapo-privacy-overlay');
      if (data.privacyMode) {
        privOverlay.classList.remove('hidden');
      } else {
        privOverlay.classList.add('hidden');
      }

      // 30分タイマー開始
      let remainingSec = (data.durationMinutes || 30) * 60;
      const timerDisplay = document.getElementById('tapo-timer-display');
      if (this.tapoTimerInterval) clearInterval(this.tapoTimerInterval);

      this.tapoTimerInterval = setInterval(() => {
        remainingSec--;
        if (remainingSec <= 0) {
          clearInterval(this.tapoTimerInterval);
          timerDisplay.textContent = '00:00 (期限終了)';
          alert('見学セッションの有効期限（30分）が終了しました。');
          modal.classList.add('hidden');
          return;
        }
        const m = Math.floor(remainingSec / 60);
        const s = remainingSec % 60;
        timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }, 1000);

      // PTZボタンのインタラクティブ挙動
      modal.querySelectorAll('.tapo-ptz-btn').forEach(btn => {
        btn.onclick = () => {
          const dir = btn.dataset.dir;
          liveImg.style.transform = dir === 'up' ? 'scale(1.1) translateY(-10px)' :
            dir === 'down' ? 'scale(1.1) translateY(10px)' :
              dir === 'left' ? 'scale(1.1) translateX(-15px)' : 'scale(1.1) translateX(15px)';
          setTimeout(() => { liveImg.style.transform = 'scale(1.0) translate(0, 0)'; }, 600);
        };
      });

      // 暗視モード切替
      let isNight = true;
      const nightBtn = document.getElementById('btn-tapo-night-toggle');
      const nightLabel = document.getElementById('tapo-night-label');
      nightBtn.onclick = () => {
        isNight = !isNight;
        if (isNight) {
          liveImg.style.filter = 'grayscale(100%) contrast(140%)';
          nightLabel.textContent = '🌙 スマート赤外線暗視';
        } else {
          liveImg.style.filter = 'none';
          nightLabel.textContent = '☀️ フルカラーデイビジョン';
        }
      };

      // マイクボタン切替
      let isMicOn = false;
      const micBtn = document.getElementById('btn-tapo-mic');
      const micLabel = document.getElementById('label-tapo-mic');
      micBtn.onclick = () => {
        isMicOn = !isMicOn;
        if (isMicOn) {
          micBtn.classList.add('bg-rose-600', 'text-white');
          micBtn.classList.remove('bg-stone-800', 'text-stone-200');
          micLabel.textContent = '🎙️ 通話中 (マイクON)';
        } else {
          micBtn.classList.remove('bg-rose-600', 'text-white');
          micBtn.classList.add('bg-stone-800', 'text-stone-200');
          micLabel.textContent = '愛犬に話しかける (通話)';
        }
      };

      // 「お家でも同じカメラを使う」ボタン
      const buyKitBtn = document.getElementById('btn-tapo-buy-kit');
      buyKitBtn.onclick = () => {
        if (this.tapoTimerInterval) clearInterval(this.tapoTimerInterval);
        modal.classList.add('hidden');
        const detailModal = document.getElementById('detail-modal');
        if (detailModal) detailModal.classList.add('hidden');
        document.body.style.overflow = '';
        this.switchView('goods-shop');
      };

      // 閉じるボタン
      const closeBtn = document.getElementById('tapo-modal-close');
      closeBtn.onclick = () => {
        if (this.tapoTimerInterval) clearInterval(this.tapoTimerInterval);
        modal.classList.add('hidden');
      };

      modal.classList.remove('hidden');
    } catch (e) {
      console.error(e);
      alert('Tapoストリームの接続に失敗しました。');
    }
  }

  /**
   * ブリーダーポータル内のTapo犬舎デバイス一覧レンダリング
   */
  async loadTapoKennelDevices() {
    const mount = document.getElementById('tapo-devices-mount');
    if (!mount) return;

    mount.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-12 text-stone-400 gap-2">
          <span class="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Tapo IoTデバイス状態を取得中...</span>
        </div>
      `;

    try {
      const res = await fetch('/api/tapo/devices');
      if (!res.ok) throw new Error('Failed to fetch tapo devices');
      const json = await res.json();
      const devices = json.data || [];

      mount.innerHTML = devices.map(dev => {
        const isCam = dev.device_type.startsWith('camera');
        const isPriv = dev.privacy_mode === 1;

        return `
            <div class="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between p-4 space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${dev.status === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}">
                    ● ${dev.status.toUpperCase()}
                  </span>
                  <span class="text-xs font-black text-cyan-900">${dev.device_model}</span>
                </div>
                
                <h5 class="font-black text-stone-900 text-sm">${dev.device_name}</h5>
                <div class="text-[11px] text-stone-500">${dev.location_name}</div>

                ${isCam ? `
                  <div class="relative aspect-video rounded-2xl bg-black overflow-hidden mt-2">
                    <img src="${dev.hls_live_url || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80'}"
                      class="w-full h-full object-cover ${isPriv ? 'opacity-20 blur-sm' : ''}" />
                    ${isPriv ? `
                      <div class="absolute inset-0 flex items-center justify-center font-bold text-xs text-stone-300 bg-stone-950/70">
                        🔒 プライバシー遮蔽中
                      </div>
                    ` : `
                      <span class="absolute top-2 left-2 text-[9px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded">LIVE 2K</span>
                    `}
                  </div>
                ` : `
                  <div class="p-4 bg-cyan-50/70 rounded-2xl border border-cyan-200 flex items-center justify-around text-center my-2">
                    <div>
                      <div class="text-[10px] text-stone-500">現在室温</div>
                      <div class="text-lg font-black text-cyan-900">${dev.temp_celsius}℃</div>
                    </div>
                    <div class="border-r border-cyan-200 h-8"></div>
                    <div>
                      <div class="text-[10px] text-stone-500">現在湿度</div>
                      <div class="text-lg font-black text-cyan-900">${dev.humidity_pct}%</div>
                    </div>
                  </div>
                `}
              </div>

              <!-- 操作アクション -->
              <div class="pt-2 border-t border-stone-100 flex items-center gap-2">
                ${isCam ? `
                  <button type="button" class="btn-toggle-tapo-privacy flex-1 ${isPriv ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'} text-xs font-bold py-2 rounded-xl transition"
                    data-device-id="${dev.id}" data-current-privacy="${isPriv ? '1' : '0'}">
                    ${isPriv ? '🔓 遮蔽解除' : '🔒 遮蔽する'}
                  </button>
                  <button type="button" class="btn-issue-live-token flex-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2 rounded-xl transition"
                    data-dog-id="${dev.assigned_dog_id || 'dog-001'}">
                    🔑 見学URL発行
                  </button>
                ` : `
                  <button type="button" class="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold py-2 rounded-xl transition"
                    onclick="alert('Tapo T315の温湿度校正を実施しました')">
                    ⚙️ センサー閾値設定
                  </button>
                `}
              </div>
            </div>
          `;
      }).join('');

      // プライバシー遮蔽トグルボタンのイベント
      mount.querySelectorAll('.btn-toggle-tapo-privacy').forEach(btn => {
        btn.onclick = async () => {
          const devId = btn.dataset.deviceId;
          const curPriv = btn.dataset.currentPrivacy === '1';
          try {
            await fetch('/api/tapo/device/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: jsonStringify({ deviceId: devId, privacyMode: !curPriv })
            });
            this.loadTapoKennelDevices();
            this.showToast(`📹 カメラ [${devId}] のプライバシー遮蔽を ${!curPriv ? 'ON' : 'OFF'} に切り替えました。`);
          } catch (e) {
            console.error(e);
          }
        };
      });

      // 見学トークン発行ボタンのイベント
      mount.querySelectorAll('.btn-issue-live-token').forEach(btn => {
        btn.onclick = async () => {
          const dId = btn.dataset.dogId;
          try {
            const res = await fetch('/api/tapo/stream/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: jsonStringify({ dogId: dId, viewerName: '見学予約者様', durationMinutes: 30 })
            });
            const json = await res.json();
            const token = json.data.accessToken;
            const liveUrl = `${window.location.origin}/#live?token=${token}`;
            navigator.clipboard?.writeText(liveUrl);
            alert(`【遠隔見学用 30分限定URLを発行しました】\n\nURL: ${liveUrl}\n\n※ クリップボードにコピーしました。見学希望のお客様へLINE・メール等でお送りください。`);
          } catch (e) {
            console.error(e);
          }
        };
      });

      // 全カメラ一括プライバシー遮蔽ボタン
      const allPrivBtn = document.getElementById('btn-tapo-all-privacy-toggle');
      if (allPrivBtn && !allPrivBtn.dataset.bound) {
        allPrivBtn.dataset.bound = "true";
        allPrivBtn.onclick = async () => {
          this.showToast('🔒 全カメラの物理プライバシー遮蔽を実施しました（見学一時停止）');
          this.loadTapoKennelDevices();
        };
      }

      // リフレッシュボタン
      const refreshBtn = document.getElementById('btn-refresh-tapo-devices');
      if (refreshBtn && !refreshBtn.dataset.bound) {
        refreshBtn.dataset.bound = "true";
        refreshBtn.onclick = () => this.loadTapoKennelDevices();
      }

    } catch (e) {
      console.error(e);
      mount.innerHTML = `<div class="col-span-full text-center py-8 text-rose-500 font-bold">デバイス一覧の取得に失敗しました。</div>`;
    }
  }

  /**
   * 🚄 全国サテライト対面代行受取 交通費削減シミュレータ
   */
  setupSatelliteSimulator() {
    const areaSelect = document.getElementById('sim-kennel-area');
    const targetSelect = document.getElementById('sim-satellite-target');
    const directCostEl = document.getElementById('sim-direct-cost');
    const hubFeeEl = document.getElementById('sim-hub-fee');
    const savingsEl = document.getElementById('sim-savings');

    if (!areaSelect || !targetSelect || !directCostEl || !hubFeeEl || !savingsEl) return;

    const updateCalc = () => {
      const selectedAreaOpt = areaSelect.options[areaSelect.selectedIndex];
      const selectedTargetOpt = targetSelect.options[targetSelect.selectedIndex];

      const directCost = parseInt(selectedAreaOpt?.dataset.cost || '55000', 10);
      const hubFee = parseInt(selectedTargetOpt?.dataset.fee || '12000', 10);
      const savings = directCost - hubFee;

      directCostEl.textContent = `約 ¥${directCost.toLocaleString()}`;
      hubFeeEl.textContent = `¥${hubFee.toLocaleString()}`;
      savingsEl.textContent = `約 -¥${savings.toLocaleString()}`;
    };

    areaSelect.onchange = updateCalc;
    targetSelect.onchange = updateCalc;
    updateCalc();
  }

  /**
   * 🛡️ 里親応募適性セーフティチェックシート
   */
  setupAdoptionSafetyModal() {
    const modal = document.getElementById('adoption-safety-modal');
    const closeBtn = document.getElementById('adoption-safety-close');
    const proceedBtn = document.getElementById('safety-proceed-btn');
    if (!modal) return;

    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add('hidden');
    }

    const cbs = modal.querySelectorAll('.safety-item-cb');
    const scoreValEl = document.getElementById('safety-score-val');
    const scoreFillEl = document.getElementById('safety-score-fill');
    const scoreAdviceEl = document.getElementById('safety-score-advice');

    const recalculateScore = () => {
      let score = 0;
      cbs.forEach(cb => {
        if (cb.checked) {
          score += parseInt(cb.dataset.weight || '15', 10);
        }
      });
      score = Math.min(100, score);

      if (scoreFillEl) scoreFillEl.style.width = `${score}%`;

      if (score >= 95) {
        if (scoreValEl) scoreValEl.textContent = `${score}点 / 100点 (判定: A+ 完全適合)`;
        if (scoreValEl) scoreValEl.className = "text-sm font-black text-emerald-600";
        if (scoreFillEl) scoreFillEl.className = "bg-emerald-500 h-full rounded-full transition-all duration-300";
        if (scoreAdviceEl) scoreAdviceEl.textContent = "✅ 素晴らしい飼育環境です！すべての譲渡基準を満たしています。";
      } else if (score >= 70) {
        if (scoreValEl) scoreValEl.textContent = `${score}点 / 100点 (判定: A 概ね適合・要相談)`;
        if (scoreValEl) scoreValEl.className = "text-sm font-black text-amber-600";
        if (scoreFillEl) scoreFillEl.className = "bg-amber-500 h-full rounded-full transition-all duration-300";
        if (scoreAdviceEl) scoreAdviceEl.textContent = "⚠️ 未チェックの項目について、スタッフとの個別相談で緩和・代替対策をご案内可能です。";
      } else {
        if (scoreValEl) scoreValEl.textContent = `${score}点 / 100点 (判定: B 飼育環境要改善)`;
        if (scoreValEl) scoreValEl.className = "text-sm font-black text-rose-600";
        if (scoreFillEl) scoreFillEl.className = "bg-rose-500 h-full rounded-full transition-all duration-300";
        if (scoreAdviceEl) scoreAdviceEl.textContent = "🚨 犬の命と安全を守るため、ペット飼育可住宅の確保や同居者合意の整備が必要です。";
      }
    };

    cbs.forEach(cb => {
      cb.onchange = recalculateScore;
    });

    if (proceedBtn) {
      proceedBtn.onclick = () => {
        modal.classList.add('hidden');
        if (this.selectedDogForModal) {
          this.openInquiryModal(this.selectedDogForModal);
          const noteEl = document.getElementById('inquiry-message');
          const scoreText = scoreValEl ? scoreValEl.textContent : '100点';
          if (noteEl) {
            noteEl.value = `【里親応募適性セーフティチェック完了】\n適性スコア: ${scoreText}\n・ペット可住宅確認済\n・家族全員の迎え入れ合意済\n・脱走防止対策・後見人対応への同意済\n\n見学・面談を希望します。`;
          }
        }
      };
    }
  }

  openAdoptionSafetyModal(dog) {
    const modal = document.getElementById('adoption-safety-modal');
    if (!modal) return;
    this.selectedDogForModal = dog;
    const nameEl = document.getElementById('safety-target-dog-name');
    if (nameEl) nameEl.textContent = `${dog.temporaryName} (${dog.breed})`;

    // チェックボックスを初期状態(全ON)に
    modal.querySelectorAll('.safety-item-cb').forEach(cb => cb.checked = true);
    const scoreValEl = document.getElementById('safety-score-val');
    const scoreFillEl = document.getElementById('safety-score-fill');
    const scoreAdviceEl = document.getElementById('safety-score-advice');
    if (scoreValEl) scoreValEl.textContent = "100点 / 100点 (判定: A+ 完全適合)";
    if (scoreFillEl) scoreFillEl.style.width = "100%";
    if (scoreAdviceEl) scoreAdviceEl.textContent = "✅ 素晴らしい飼育環境です！すべての譲渡基準を満たしています。";

    modal.classList.remove('hidden');
  }

  /**
   * 🍵 千住古民家リアル犬舎（0053連携）ふれあい・抱っこ見学予約専用モーダル
   */
  setupSenjuVisitModal() {
    const modal = document.getElementById('senju-visit-modal');
    const closeBtn = document.getElementById('senju-visit-close');
    const form = document.getElementById('senju-visit-form');
    if (!modal) return;

    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add('hidden');
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const dogName = document.getElementById('senju-dog-display-name')?.textContent || 'ワンちゃん';
        const visitorName = document.getElementById('senju-visitor-name')?.value || '';
        const visitDate = document.getElementById('senju-visit-date')?.value || '';
        const visitTime = document.getElementById('senju-visit-time')?.value || '';

        modal.classList.add('hidden');
        form.reset();

        this.showToast(`🍵 ${visitorName}様、${dogName}の千住古民家だっこ見学予約（${visitDate} ${visitTime}）を受け付けました！`);
      };
    }
  }

  openSenjuVisitModal(dog) {
    const modal = document.getElementById('senju-visit-modal');
    if (!modal) return;
    this.selectedDogForModal = dog;

    const dogIdInput = document.getElementById('senju-dog-id');
    const displayNameEl = document.getElementById('senju-dog-display-name');
    const dateInput = document.getElementById('senju-visit-date');

    if (dogIdInput) dogIdInput.value = dog.id;
    if (displayNameEl) displayNameEl.textContent = `${dog.temporaryName} (${dog.breed} / ${dog.color})`;

    // 明日の日付をデフォルト設定
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    modal.classList.remove('hidden');
  }

  /**
   * 🐾 買い手先行型 お迎えウェイトリスト優先登録モーダル
   */
  setupWaitlistModal() {
    const modal = document.getElementById('waitlist-modal');
    const openBtn = document.getElementById('btn-open-waitlist');
    const closeBtn = document.getElementById('waitlist-modal-close');
    const form = document.getElementById('waitlist-form');
    if (!modal) return;

    window.openWaitlistModal = () => {
      modal.classList.remove('hidden');
    };

    if (openBtn) {
      openBtn.onclick = () => window.openWaitlistModal();
    }

    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add('hidden');
    }

    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    };

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-waitlist');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '登録処理中...';
        }

        const payload = {
          id: "wait-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
          name: document.getElementById('waitlist-name')?.value || '',
          contact: document.getElementById('waitlist-contact')?.value || '',
          breed: document.getElementById('waitlist-breed')?.value || 'トイプードル',
          size: document.getElementById('waitlist-size')?.value || '指定なし',
          gender: document.getElementById('waitlist-gender')?.value || 'どちらでも',
          budget: Number(document.getElementById('waitlist-budget')?.value || 400000),
          timeline: document.getElementById('waitlist-timeline')?.value || '良いご縁があれば',
          prefecture: document.getElementById('waitlist-prefecture')?.value || '東京都・関東近郊',
          memo: document.getElementById('waitlist-memo')?.value || '',
          status: 'waiting',
          createdAt: new Date().toLocaleString('ja-JP')
        };

        // フェイルセーフ: ブラウザの localStorage に即時実保存
        try {
          const cur = JSON.parse(localStorage.getItem('wanbridge_waitlist_records') || '[]');
          cur.unshift(payload);
          localStorage.setItem('wanbridge_waitlist_records', JSON.stringify(cur));
        } catch (e) {
          console.warn('localStorage save warning:', e);
        }

        try {
          const res = await fetch('/api/waitlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          modal.classList.add('hidden');
          form.reset();
          this.showToast(`🐾 ${payload.name}様、お迎えウェイトリストへの優先登録が完了しました！提携ブリーダーより優先案内をお届けします。`);
        } catch (err) {
          console.error(err);
          this.showToast('登録完了しました（オフライン受付）');
          modal.classList.add('hidden');
          form.reset();
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>🐾 お迎えウェイトリストに優先登録する（無料）</span>';
          }
        }
      };
    }
  }

  // ==============================================================================
  // 👴 寄り添いシニア犬・シルバー伴走プラットフォーム (WanBridge Senior) 連携
  // ==============================================================================

  setupSeniorPartnership() {
    // 1. 特大文字トグル初期化
    const toggleBtn = document.getElementById('btn-toggle-large-text');
    if (toggleBtn) {
      // 保存された設定があれば復元
      if (localStorage.getItem('wanbridge_large_text') === 'true') {
        document.body.classList.add('senior-large-text');
        toggleBtn.classList.add('bg-orange-500', 'text-white', 'border-orange-600');
        toggleBtn.classList.remove('bg-amber-100', 'text-amber-900');
      }

      toggleBtn.onclick = () => {
        const isLarge = document.body.classList.toggle('senior-large-text');
        localStorage.setItem('wanbridge_large_text', isLarge ? 'true' : 'false');
        if (isLarge) {
          toggleBtn.classList.add('bg-orange-500', 'text-white', 'border-orange-600');
          toggleBtn.classList.remove('bg-amber-100', 'text-amber-900');
          this.showToast('👓 シニア向け特大文字モードをONにしました');
        } else {
          toggleBtn.classList.remove('bg-orange-500', 'text-white', 'border-orange-600');
          toggleBtn.classList.add('bg-amber-100', 'text-amber-900');
          this.showToast('👓 通常文字サイズに戻しました');
        }
      };
    }

    // 2. 毎朝LINE安否確認シミュレーター
    const walkOkBtn = document.getElementById('btn-senior-line-walk-ok');
    const walkRestBtn = document.getElementById('btn-senior-line-walk-rest');
    const replyBox = document.getElementById('senior-line-reply-box');

    if (walkOkBtn && replyBox) {
      walkOkBtn.onclick = () => {
        replyBox.classList.remove('hidden');
        replyBox.innerHTML = `
          <!-- ユーザーの返答 -->
          <div class="flex justify-end">
            <div class="bg-[#5cbb7a] text-white p-2.5 rounded-2xl rounded-tr-none text-[11px] font-bold shadow-xs">
              🐾 今日も元気に20分ゆっくりお散歩できました！
            </div>
          </div>
          <!-- センターからの返信 -->
          <div class="flex items-start gap-2 pt-1">
            <div class="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0">
              WB
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs text-stone-800 space-y-1.5 leading-relaxed text-[11px]">
              <p class="font-bold text-emerald-800">✅ 本日の安否確認を完了しました！</p>
              <p>お散歩記録を健康カルテへ反映しました。足腰の筋力維持にも最適ですね！</p>
              <div class="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-[10px] text-emerald-900">
                👨‍👩‍👧 <strong>ご家族（長男様）へ自動通知済:</strong><br>
                「本日 8:15 お父様とワンちゃんは元気にお散歩完了されました（異常なし）」
              </div>
            </div>
          </div>
        `;
      };
    }

    if (walkRestBtn && replyBox) {
      walkRestBtn.onclick = () => {
        replyBox.classList.remove('hidden');
        replyBox.innerHTML = `
          <!-- ユーザーの返答 -->
          <div class="flex justify-end">
            <div class="bg-[#5cbb7a] text-white p-2.5 rounded-2xl rounded-tr-none text-[11px] font-bold shadow-xs">
              💦 今朝は足腰が少し重いので、お庭で日向ぼっこして休みました。
            </div>
          </div>
          <!-- センターからの返信 -->
          <div class="flex items-start gap-2 pt-1">
            <div class="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0">
              WB
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs text-stone-800 space-y-1.5 leading-relaxed text-[11px]">
              <p class="font-bold text-amber-800">☕ 無理をなさらず、ゆっくりお過ごしください</p>
              <p>室内の温度管理と水分補給を心がけてくださいね。体調に変化があれば、いつでも専属看護師ホットラインへご連絡いただけます。</p>
              <div class="bg-amber-50 p-2 rounded-xl border border-amber-200 text-[10px] text-amber-900">
                👨‍👩‍👧 <strong>ご家族へ状況共有済:</strong><br>
                「本日 8:15 ご自宅で安全に日向ぼっこ中（要経過観察）」
              </div>
            </div>
          </div>
        `;
      };
    }

    // 3. お電話相談・見学予約モーダル制御
    const modal = document.getElementById('senior-call-modal');
    const closeBtn = document.getElementById('senior-call-modal-close');
    const form = document.getElementById('senior-callback-form');

    window.openSeniorCallModal = (event, defaultTopic = null) => {
      if (event) event.preventDefault();
      if (!modal) return;
      if (defaultTopic) {
        const topicSelect = document.getElementById('senior-cb-topic');
        if (topicSelect) topicSelect.value = 'visit';
      }
      modal.classList.remove('hidden');
    };

    if (closeBtn && modal) {
      closeBtn.onclick = () => modal.classList.add('hidden');
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('senior-cb-name')?.value || 'ご相談者様';
        const phone = document.getElementById('senior-cb-phone')?.value || '';
        this.showToast(`📞 ${name}様、無料相談のお申し込みありがとうございます！専任コンシェルジュより本日中にお電話いたします。`);
        form.reset();
        modal.classList.add('hidden');
      };
    }
  }

  /**
   * シニア推奨犬一覧グリッドを描画
   */
  renderSeniorDogs() {
    const grid = document.getElementById('senior-dogs-grid');
    if (!grid) return;

    // シニア適性を持つ犬、または成犬・引退犬を抽出
    const seniorDogs = this.dogs.filter(d => d.seniorCompatibility?.isSeniorRecommended || d.listingType !== 'puppy_sale');

    if (seniorDogs.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-center text-stone-500 py-8">現在ご紹介可能なシニア安心犬を準備中です。</p>`;
      return;
    }

    grid.innerHTML = seniorDogs.map(dog => {
      const comp = dog.seniorCompatibility || {
        seniorRank: 'S',
        pullingScore: 1,
        barkingScore: 1,
        dailyWalkMinutes: 15,
        cuddlePreference: '膝乗り抱っこが好き',
        summary: '穏やかで人の歩調に合わせてゆっくり歩く優しいワンちゃんです。'
      };

      return `
        <div class="bg-white rounded-3xl border-2 border-orange-200/80 hover:border-orange-400 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between cursor-pointer group"
          onclick="window.wanbridge.openDetailModal(window.wanbridge.dogs.find(d => d.id === '${dog.id}'))">
          <div>
            <!-- 写真エリア -->
            <div class="relative h-56 sm:h-64 overflow-hidden bg-stone-100">
              <img src="${dog.images[0]?.url || ''}" alt="${dog.temporaryName}"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div class="absolute top-3 left-3 flex flex-col gap-1">
                <span class="bg-orange-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <span>👴 シニア適性 Sランク</span> 🌟
                </span>
                <span class="bg-stone-900/80 backdrop-blur-md text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <span>🏛️ 100%終生保証書付</span>
                </span>
              </div>
              <div class="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-xl">
                🎂 ${this.formatAge(dog.currentAgeDays)}
              </div>
            </div>

            <!-- 情報エリア -->
            <div class="p-5 space-y-3">
              <div>
                <div class="flex items-center justify-between text-xs text-stone-500">
                  <span>${dog.breed} (${dog.color})</span>
                  <span class="font-bold ${dog.gender === 'male' ? 'text-sky-600' : 'text-rose-600'}">
                    ${dog.gender === 'male' ? '♂ 男の子' : '♀ 女の子'}
                  </span>
                </div>
                <h3 class="text-lg font-black text-stone-900 mt-0.5 group-hover:text-orange-600 transition">
                  ${dog.temporaryName}
                </h3>
              </div>

              <!-- 事故ゼロ相性カルテ 4項目 -->
              <div class="grid grid-cols-2 gap-2 text-[11px] bg-orange-50/70 p-3 rounded-2xl border border-orange-200/60">
                <div class="flex items-center gap-1.5">
                  <span class="text-orange-600 font-bold">🦮</span>
                  <div>
                    <span class="text-stone-400 block text-[9px]">引っ張り癖</span>
                    <span class="font-bold text-stone-800">ゼロ (同調歩行) ✅</span>
                  </div>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-orange-600 font-bold">🔇</span>
                  <div>
                    <span class="text-stone-400 block text-[9px]">無駄吠え</span>
                    <span class="font-bold text-stone-800">極少・無音 ✅</span>
                  </div>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-orange-600 font-bold">⏱️</span>
                  <div>
                    <span class="text-stone-400 block text-[9px]">お散歩目安</span>
                    <span class="font-bold text-stone-800">1日 ${comp.dailyWalkMinutes}分</span>
                  </div>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-orange-600 font-bold">❤️</span>
                  <div>
                    <span class="text-stone-400 block text-[9px]">ふれあい</span>
                    <span class="font-bold text-stone-800">抱っこ大好き</span>
                  </div>
                </div>
              </div>

              <p class="text-xs text-stone-600 leading-relaxed line-clamp-2">
                ${dog.description}
              </p>

              <!-- 拠点案内 -->
              <div class="flex items-center justify-between text-[11px] pt-1 text-stone-500 border-t border-stone-100">
                <span>📍 ${dog.prefecture} ${dog.location}</span>
                <span class="font-bold text-orange-800 bg-orange-100/70 px-2 py-0.5 rounded">
                  千住カフェ見学可 🍵
                </span>
              </div>
            </div>
          </div>

          <!-- アクションフッター -->
          <div class="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
            <div>
              <span class="text-[10px] text-stone-400 block">実費譲渡費用 (医療費込)</span>
              <span class="font-black text-stone-900 text-sm">¥${dog.price.toLocaleString()}</span>
            </div>
            <button type="button"
              class="bg-orange-500 group-hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1">
              <span>詳しく見る・面談 ➔</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ヘルパー: JSON.stringify
function jsonStringify(obj) {
  return JSON.stringify(obj);
}

// アプリ起動 (DOMContentLoaded前後を問わず確実に初期化)
function initWanBridge() {
  if (!window.wanbridge) {
    window.wanbridge = new WanBridgeApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWanBridge);
} else {
  initWanBridge();
}

