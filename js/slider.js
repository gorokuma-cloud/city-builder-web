/**
 * WanBridge - 横スライド写真ギャラリーコンポーネント (PC大画面 & モバイルタッチスワイプ対応)
 */

export class PhotoSlider {
  constructor(container, images = [], options = {}) {
    this.container = container;
    this.images = (images || []).map(img => typeof img === 'string' ? { url: img, caption: '', tag: '' } : (img || { url: '', caption: '', tag: '' }));
    this.currentIndex = 0;
    this.options = Object.assign({
      showThumbnails: true,
      showArrows: true,
      showDots: true,
      showCounter: true,
      allowFullscreen: true,
      aspectRatio: "aspect-[4/3] md:aspect-[16/11]", // PCではワイド・大画面
      autoPlay: false,
      onSlideChange: null
    }, options);

    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isDragging = false;
    this.dragStartX = 0;

    this.init();
  }

  init() {
    if (!this.container || this.images.length === 0) return;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="relative w-full overflow-hidden rounded-2xl bg-stone-900 group select-none shadow-lg">
        <!-- メイン写真スライドトラック -->
        <div class="slider-track flex transition-transform duration-300 ease-out w-full cursor-grab active:cursor-grabbing ${this.options.aspectRatio}">
          ${this.images.map((img, idx) => `
            <div class="slider-slide min-w-full h-full relative flex items-center justify-center bg-stone-900">
              <img 
                src="${img.url}" 
                alt="${img.caption || '写真'}" 
                loading="${idx === 0 ? 'eager' : 'lazy'}"
                class="w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 hover:scale-105"
              />
              ${img.tag ? `
                <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                  ${img.tag}
                </div>
              ` : ''}
              ${img.caption ? `
                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8 text-white text-xs md:text-sm">
                  <p class="font-medium drop-shadow">${img.caption}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- PC向け：左右ナビゲーション矢印 (大きく押しやすいデザイン) -->
        ${this.options.showArrows && this.images.length > 1 ? `
          <button type="button" class="prev-btn absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-xl flex items-center justify-center transition-all duration-200 opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 active:scale-95 z-10" aria-label="前の写真">
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button type="button" class="next-btn absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-xl flex items-center justify-center transition-all duration-200 opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 active:scale-95 z-10" aria-label="次の写真">
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ` : ''}

        <!-- 右上: 枚数カウンター ＆ 全画面拡大ボタン -->
        <div class="absolute top-3 right-3 flex items-center gap-2 z-10">
          ${this.options.showCounter ? `
            <div class="counter-badge bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/20">
              <span class="current-idx">1</span> / ${this.images.length}
            </div>
          ` : ''}
          ${this.options.allowFullscreen ? `
            <button type="button" class="fullscreen-btn bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-1.5 rounded-full border border-white/20 transition-all hover:scale-110" title="写真を特大表示する">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          ` : ''}
        </div>

        <!-- 下部: ドットインジケーター (スマホ用) -->
        ${this.options.showDots && this.images.length > 1 ? `
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 md:hidden">
            ${this.images.map((_, i) => `
              <button type="button" class="dot-btn w-2 h-2 rounded-full transition-all duration-200 ${i === 0 ? 'bg-white w-4' : 'bg-white/50'}" data-index="${i}"></button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- PC向け：サムネイル横スライドバー (大画面でクリックして即時プレビュー) -->
      ${this.options.showThumbnails && this.images.length > 1 ? `
        <div class="thumbnail-bar flex items-center gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
          ${this.images.map((img, idx) => `
            <button 
              type="button" 
              class="thumb-item relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${idx === 0 ? 'border-amber-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}"
              data-index="${idx}"
            >
              <img src="${img.url}" alt="縮小版 ${idx + 1}" class="w-full h-full object-cover" />
            </button>
          `).join('')}
        </div>
      ` : ''}
    `;

    this.track = this.container.querySelector('.slider-track');
    this.prevBtn = this.container.querySelector('.prev-btn');
    this.nextBtn = this.container.querySelector('.next-btn');
    this.counter = this.container.querySelector('.current-idx');
    this.fullscreenBtn = this.container.querySelector('.fullscreen-btn');
    this.dots = this.container.querySelectorAll('.dot-btn');
    this.thumbs = this.container.querySelectorAll('.thumb-item');
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.prev();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.next();
      });
    }

    // サムネイルクリック
    this.thumbs.forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(thumb.dataset.index, 10);
        this.goTo(idx);
      });
    });

    // ドットクリック
    this.dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(dot.dataset.index, 10);
        this.goTo(idx);
      });
    });

    // タッチスワイプ (スマホ)
    this.track.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.handleSwipe();
    }, { passive: true });

    // マウスドラッグ (PCブラウザ横スライド対応)
    this.track.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
    });

    window.addEventListener('mouseup', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const diff = e.clientX - this.dragStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) this.prev();
        else this.next();
      }
    });

    // フルスクリーン拡大
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openFullscreen();
      });
    }
  }

  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        this.next(); // 左スワイプ -> 次へ
      } else {
        this.prev(); // 右スワイプ -> 前へ
      }
    }
  }

  goTo(index) {
    if (index < 0) {
      this.currentIndex = this.images.length - 1;
    } else if (index >= this.images.length) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = index;
    }

    // トラック移動
    const offset = -(this.currentIndex * 100);
    this.track.style.transform = `translateX(${offset}%)`;

    // カウンター更新
    if (this.counter) {
      this.counter.textContent = this.currentIndex + 1;
    }

    // ドット更新
    this.dots.forEach((dot, idx) => {
      if (idx === this.currentIndex) {
        dot.className = "dot-btn w-4 h-2 rounded-full bg-white transition-all duration-200";
      } else {
        dot.className = "dot-btn w-2 h-2 rounded-full bg-white/50 transition-all duration-200";
      }
    });

    // サムネイル更新
    this.thumbs.forEach((thumb, idx) => {
      if (idx === this.currentIndex) {
        thumb.className = "thumb-item relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-amber-500 scale-105 shadow-md transition-all duration-200";
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        thumb.className = "thumb-item relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-transparent opacity-60 hover:opacity-100 transition-all duration-200";
      }
    });

    if (typeof this.options.onSlideChange === 'function') {
      this.options.onSlideChange(this.currentIndex, this.images[this.currentIndex]);
    }
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  /**
   * PC大画面用：フルスクリーン特大ライトボックス表示
   */
  openFullscreen() {
    const existing = document.getElementById('lightbox-modal');
    if (existing) existing.remove();

    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-modal';
    lightbox.className = 'fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-between p-4 md:p-8 select-none backdrop-blur-md animate-fade-in';

    lightbox.innerHTML = `
      <!-- 上部バー -->
      <div class="w-full flex items-center justify-between text-white max-w-6xl z-10">
        <div class="flex items-center gap-3">
          <span class="bg-amber-500 text-stone-900 text-xs font-bold px-3 py-1 rounded-full">PC大画面プレビュー</span>
          <span class="text-stone-300 text-sm font-medium" id="lb-counter">${this.currentIndex + 1} / ${this.images.length}</span>
        </div>
        <button id="lb-close" class="text-stone-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 中央：特大画像表示領域 ＆ 左右ナビ -->
      <div class="relative w-full max-w-6xl flex-1 flex items-center justify-center my-4 overflow-hidden">
        <!-- 前へボタン -->
        <button id="lb-prev" class="absolute left-2 md:left-4 z-20 w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 shadow-2xl transition hover:scale-110 active:scale-95">
          <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- メイン特大画像 -->
        <div class="w-full h-full flex flex-col items-center justify-center">
          <img 
            id="lb-main-img" 
            src="${this.images[this.currentIndex].url}" 
            alt="特大写真" 
            class="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
          />
          <p id="lb-caption" class="text-stone-300 text-sm md:text-base mt-4 font-medium text-center bg-black/50 px-4 py-1.5 rounded-full border border-white/10">
            ${this.images[this.currentIndex].caption || ''}
          </p>
        </div>

        <!-- 次へボタン -->
        <button id="lb-next" class="absolute right-2 md:right-4 z-20 w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 shadow-2xl transition hover:scale-110 active:scale-95">
          <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- 下部：サムネイルストリップ -->
      <div class="w-full max-w-4xl flex items-center justify-center gap-3 overflow-x-auto py-2 z-10">
        ${this.images.map((img, i) => `
          <button class="lb-thumb flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition ${i === this.currentIndex ? 'border-amber-400 scale-110' : 'border-transparent opacity-50 hover:opacity-90'}" data-index="${i}">
            <img src="${img.url}" alt="" class="w-full h-full object-cover" />
          </button>
        `).join('')}
      </div>
    `;

    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';

    let lbIndex = this.currentIndex;

    const updateLb = (idx) => {
      if (idx < 0) lbIndex = this.images.length - 1;
      else if (idx >= this.images.length) lbIndex = 0;
      else lbIndex = idx;

      const curImg = this.images[lbIndex];
      const mainImg = lightbox.querySelector('#lb-main-img');
      const caption = lightbox.querySelector('#lb-caption');
      const counter = lightbox.querySelector('#lb-counter');

      mainImg.src = curImg.url;
      caption.textContent = curImg.caption || '';
      counter.textContent = `${lbIndex + 1} / ${this.images.length}`;

      lightbox.querySelectorAll('.lb-thumb').forEach((th, i) => {
        if (i === lbIndex) {
          th.className = "lb-thumb flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-amber-400 scale-110 transition";
        } else {
          th.className = "lb-thumb flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-transparent opacity-50 hover:opacity-90 transition";
        }
      });

      this.goTo(lbIndex);
    };

    lightbox.querySelector('#lb-close').onclick = () => {
      lightbox.remove();
      document.body.style.overflow = '';
    };

    lightbox.querySelector('#lb-prev').onclick = () => updateLb(lbIndex - 1);
    lightbox.querySelector('#lb-next').onclick = () => updateLb(lbIndex + 1);

    lightbox.querySelectorAll('.lb-thumb').forEach(th => {
      th.onclick = () => updateLb(parseInt(th.dataset.index, 10));
    });

    // キーボード操作 (左右キーでスライド、ESCで閉じる)
    const onKey = (e) => {
      if (!document.getElementById('lightbox-modal')) {
        window.removeEventListener('keydown', onKey);
        return;
      }
      if (e.key === 'ArrowLeft') updateLb(lbIndex - 1);
      if (e.key === 'ArrowRight') updateLb(lbIndex + 1);
      if (e.key === 'Escape') {
        lightbox.remove();
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKey);
      }
    };
    window.addEventListener('keydown', onKey);
  }
}

