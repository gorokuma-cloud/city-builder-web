/**
 * WanBridge - 4大マイルストーン体重推移 ＆ 成犬時予想サイズ描画マネージャー
 * Chart.js を用いた成長曲線と成犬時予想判定
 */

export class GrowthChartManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.chart = null;
  }

  render(dog) {
    if (!this.canvas) return;

    // 既存チャート破棄
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    if (typeof Chart === 'undefined') {
      console.warn('Chart.js is not loaded.');
      return;
    }

    const milestones = dog.milestones || [];
    const labels = ["出生時 (0日)", "生後35日 (離乳期)", "生後60日 (2ヶ月)", "生後90日 (3ヶ月)", "成犬時 (予想)"];

    // 実測体重データ (g)
    const actualWeights = [
      milestones[0]?.weightG ?? null,
      milestones[1]?.weightG ?? null,
      milestones[2]?.weightG ?? null,
      milestones[3]?.weightG ?? null,
      null // 成犬時は実測ではなく予測
    ];

    // 成犬時予測基準曲線 (モデル予測)
    // 基準予測値（トイプードルの場合: 出生時130g -> 35日500g -> 60日840g -> 90日1350g -> 成犬時2200g）
    let predictedLine = [];
    if (dog.breed === "柴犬 (豆柴)") {
      predictedLine = [160, 720, 1250, 2400, 5000];
    } else if (dog.breed === "チワワ") {
      predictedLine = [100, 400, 650, 1100, 1800];
    } else if (dog.listingType === "breeder_retired" || dog.listingType === "rescue_org") {
      // 成犬
      const w = dog.milestones[0]?.weightG || 3000;
      predictedLine = [w * 0.1, w * 0.25, w * 0.45, w * 0.65, w];
    } else {
      // トイプードル等
      predictedLine = [135, 510, 840, 1400, 2250];
    }

    const ctx = this.canvas.getContext('2d');

    // グラデーション作成
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '実測体重 (g)',
            data: actualWeights,
            borderColor: '#f59e0b', // amber-500
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.25,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#d97706',
            pointBorderWidth: 3,
            spanGaps: false
          },
          {
            label: '適正成長予測ライン (g)',
            data: predictedLine,
            borderColor: 'rgba(156, 163, 175, 0.6)', // gray-400
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#9ca3af'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { size: 11, family: 'system-ui, sans-serif' },
              color: '#57534e'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(28, 25, 23, 0.95)',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const val = context.raw;
                if (val === null) return `${context.dataset.label}: 未登録・測定前`;
                return `${context.dataset.label}: ${val.toLocaleString()} g (${(val / 1000).toFixed(2)} kg)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(229, 231, 235, 0.6)'
            },
            ticks: {
              callback: (val) => `${val}g`,
              font: { size: 10 },
              color: '#78716c'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 10 },
              color: '#78716c'
            }
          }
        }
      }
    });
  }
}

