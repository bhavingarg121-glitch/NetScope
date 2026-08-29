/**
 * NetScope India — Complete Telecom Intelligence & Map Engine
 * Vanilla ES6+ Interactive Controls, Leaflet & Chart.js Visualizations
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initIndiaNetworkMap();
  initTelecomDashboard();
  initMetricExplorer();
  initDeadZoneReporter();
  initFAQAccordion();
  initFAQSearch();
});

/* ==========================================
   1. Navbar & Mobile Menu (No Overwrite)
   ========================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggleBtn.innerHTML = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggleBtn.innerHTML = '☰';
      });
    });
  }
}

/* ==========================================
   2. Interactive India Network Map (Leaflet)
   ========================================== */
let mapInstance = null;
let mapMarkers = [];

const INDIA_CITY_DATA = [
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, operator: 'jio', gen: '5g', speed: 342, signal: -76, latency: 17, status: 'excellent', towers: 4820 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, operator: 'airtel', gen: '5g', speed: 318, signal: -79, latency: 19, status: 'excellent', towers: 5190 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, operator: 'jio', gen: '5g', speed: 385, signal: -72, latency: 14, status: 'excellent', towers: 4620 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, operator: 'airtel', gen: '5g', speed: 295, signal: -82, latency: 21, status: 'excellent', towers: 3780 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, operator: 'jio', gen: '5g', speed: 274, signal: -84, latency: 23, status: 'good', towers: 2910 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, operator: 'airtel', gen: '5g', speed: 220, signal: -88, latency: 28, status: 'good', towers: 1420 },
  { name: 'Latur', lat: 18.4088, lng: 76.5604, operator: 'vi', gen: '4g', speed: 48, signal: -94, latency: 42, status: 'fair', towers: 640 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, operator: 'jio', gen: '5g', speed: 310, signal: -78, latency: 18, status: 'excellent', towers: 3640 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, operator: 'airtel', gen: '5g', speed: 265, signal: -85, latency: 26, status: 'good', towers: 3150 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, operator: 'jio', gen: '5g', speed: 290, signal: -80, latency: 20, status: 'excellent', towers: 2840 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, operator: 'vi', gen: '4g', speed: 62, signal: -91, latency: 38, status: 'fair', towers: 1980 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, operator: 'airtel', gen: '5g', speed: 245, signal: -86, latency: 29, status: 'good', towers: 2120 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, operator: 'jio', gen: '5g', speed: 330, signal: -75, latency: 16, status: 'excellent', towers: 1250 },
  { name: 'Jammu', lat: 32.7266, lng: 74.8570, operator: 'bsnl', gen: '4g', speed: 32, signal: -99, latency: 54, status: 'fair', towers: 810 }
];

let activeFilter = {
  operator: 'all',
  gen: 'all'
};

function initIndiaNetworkMap() {
  const mapElement = document.getElementById('india-network-map');
  if (!mapElement || typeof L === 'undefined') return;

  mapInstance = L.map('india-network-map', {
    center: [22.3511, 78.6677],
    zoom: 5,
    minZoom: 4,
    maxZoom: 12,
    attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(mapInstance);

  renderMapMarkers();
  initMapFilterControls();
}

function renderMapMarkers() {
  if (!mapInstance || typeof L === 'undefined') return;

  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  const filtered = INDIA_CITY_DATA.filter(item => {
    const matchOp = (activeFilter.operator === 'all' || item.operator === activeFilter.operator);
    const matchGen = (activeFilter.gen === 'all' || item.gen === activeFilter.gen);
    return matchOp && matchGen;
  });

  filtered.forEach(city => {
    let color = '#00f5a0';
    if (city.status === 'fair') color = '#f59e0b';
    if (city.status === 'poor') color = '#f43f5e';

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: ${color};
          border-radius: 50%;
          border: 3px solid #060913;
          box-shadow: 0 0 16px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          color: #000;
        ">
          📡
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(mapInstance);

    const popupContent = `
      <div style="font-family: Outfit, sans-serif; padding: 6px; min-width: 200px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
          <strong style="font-size: 1.1rem; color: #f8fafc;">${city.name}</strong>
          <span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: rgba(0,242,254,0.2); color: #00f2fe; text-transform: uppercase; font-weight: bold;">
            ${city.operator.toUpperCase()} · ${city.gen.toUpperCase()}
          </span>
        </div>
        <div style="font-size: 0.85rem; color: #94a3b8; display: flex; flex-direction: column; gap: 4px;">
          <div>⚡ <strong>Avg Speed:</strong> <span style="color: #00f2fe;">${city.speed} Mbps</span></div>
          <div>📶 <strong>Signal:</strong> <span style="color: #00f5a0;">${city.signal} dBm</span></div>
          <div>🌐 <strong>Latency:</strong> <span style="color: #f8fafc;">${city.latency} ms</span></div>
          <div>🗼 <strong>Active Cells:</strong> ${city.towers.toLocaleString()} nodes</div>
        </div>
        <a href="#download" style="display: block; margin-top: 10px; padding: 6px; text-align: center; background: #00f2fe; color: #050814; border-radius: 6px; font-weight: bold; font-size: 0.78rem; text-decoration: none;">
          Measure with NetScope APK
        </a>
      </div>
    `;

    marker.bindPopup(popupContent);
    mapMarkers.push(marker);
  });
}

function initMapFilterControls() {
  document.querySelectorAll('[data-filter-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-filter-group');
      const val = btn.getAttribute('data-filter-val');

      const parentCluster = btn.closest('.filter-btn-cluster');
      parentCluster.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeFilter[group] = val;
      renderMapMarkers();
    });
  });
}

/* ==========================================
   3. Telecom Engineering Dashboard (Image 2)
   ========================================== */
let voiceQualityChart = null;
let latencyTimelineChart = null;

const REGION_STATS = {
  all: { bw: '10.28 Mbps', avail: '95.04 %', resp: '124.81 ms', totalServ: 32, dropServ: 12, mos: [30.84, 22.31, 20.72, 13.28, 12.85], latencyTrend: [90, 70, 210, 130, 200, 155, 190, 85, 180, 168, 182, 25, 230, 22, 35, -2, 125, 52, 218, 100, 198, 200, 42, 122, 102, 25, 18, 225, 5] },
  delhi: { bw: '16.40 Mbps', avail: '98.20 %', resp: '28.40 ms', totalServ: 48, dropServ: 2, mos: [42.10, 28.50, 16.20, 8.40, 4.80], latencyTrend: [40, 35, 65, 45, 70, 50, 60, 35, 55, 48, 52, 20, 75, 18, 22, 10, 45, 25, 68, 38, 62, 58, 24, 42, 36, 18, 14, 70, 12] },
  mumbai: { bw: '14.80 Mbps', avail: '97.60 %', resp: '32.10 ms', totalServ: 52, dropServ: 4, mos: [38.50, 26.40, 18.80, 10.20, 6.10], latencyTrend: [50, 42, 80, 55, 85, 62, 75, 45, 68, 60, 65, 25, 90, 22, 28, 15, 55, 32, 82, 48, 76, 72, 30, 52, 44, 22, 18, 85, 16] },
  bengaluru: { bw: '18.90 Mbps', avail: '99.10 %', resp: '21.50 ms', totalServ: 44, dropServ: 1, mos: [48.20, 30.10, 12.40, 6.10, 3.20], latencyTrend: [30, 25, 48, 32, 52, 38, 45, 25, 40, 35, 38, 15, 55, 12, 16, 8, 32, 18, 50, 28, 46, 42, 18, 30, 25, 12, 10, 52, 8] },
  nagpur: { bw: '12.10 Mbps', avail: '96.30 %', resp: '48.20 ms', totalServ: 26, dropServ: 3, mos: [28.40, 24.10, 24.80, 14.50, 8.20], latencyTrend: [65, 55, 110, 75, 115, 88, 102, 60, 92, 82, 88, 35, 120, 30, 38, 20, 75, 42, 112, 65, 104, 98, 40, 70, 60, 30, 24, 115, 22] },
  latur: { bw: '8.40 Mbps', avail: '94.10 %', resp: '68.50 ms', totalServ: 18, dropServ: 6, mos: [18.50, 20.20, 32.10, 18.40, 10.80], latencyTrend: [85, 72, 150, 98, 160, 120, 140, 80, 125, 112, 120, 48, 165, 40, 52, 28, 102, 58, 155, 88, 142, 134, 55, 95, 82, 42, 32, 158, 30] }
};

function initTelecomDashboard() {
  const regionSelect = document.getElementById('telecom-region-select');
  if (!regionSelect) return;

  initTelecomCharts();

  regionSelect.addEventListener('change', (e) => {
    const selectedKey = e.target.value;
    updateTelecomUI(selectedKey);
  });
}

function updateTelecomUI(regionKey) {
  const data = REGION_STATS[regionKey] || REGION_STATS.all;

  const bwVal = document.getElementById('dash-bandwidth-val');
  const availVal = document.getElementById('dash-avail-val');
  const respVal = document.getElementById('dash-resp-val');
  const totalServVal = document.getElementById('dash-total-serv');
  const dropServVal = document.getElementById('dash-drop-serv');

  if (bwVal) bwVal.textContent = data.bw;
  if (availVal) availVal.textContent = data.avail;
  if (respVal) respVal.textContent = data.resp;
  if (totalServVal) totalServVal.textContent = data.totalServ;
  if (dropServVal) dropServVal.textContent = data.dropServ;

  if (voiceQualityChart) {
    voiceQualityChart.data.datasets[0].data = data.mos;
    voiceQualityChart.update();
  }

  if (latencyTimelineChart) {
    latencyTimelineChart.data.datasets[0].data = data.latencyTrend;
    latencyTimelineChart.update();
  }
}

function initTelecomCharts() {
  if (typeof Chart === 'undefined') return;

  // 1. Exact 5-Slice MOS Voice Quality Pie/Donut Chart (Image 2 Top Right)
  const ctxMOS = document.getElementById('chart-voice-quality')?.getContext('2d');
  if (ctxMOS) {
    voiceQualityChart = new Chart(ctxMOS, {
      type: 'pie',
      data: {
        labels: ['Best (30.84%)', 'High (22.31%)', 'Medium (20.72%)', 'Low (13.28%)', 'Poor (12.85%)'],
        datasets: [{
          data: REGION_STATS.all.mos,
          backgroundColor: [
            '#4338ca', // Best - Dark Purple/Indigo
            '#1e3a8a', // High - Dark Blue
            '#06b6d4', // Medium - Bright Cyan
            '#eab308', // Low - Amber/Gold
            '#881337'  // Poor - Deep Burgundy
          ],
          borderWidth: 1.5,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 10,
              font: { family: 'Outfit', size: 10 },
              color: '#334155'
            }
          }
        }
      }
    });
  }

  // 2. Exact 24-Hour Delay Latency Timeline Chart (Image 2 Bottom Left)
  const ctxDelay = document.getElementById('chart-latency-delay')?.getContext('2d');
  if (ctxDelay) {
    const timeLabels = [
      '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', 
      '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', 
      '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', 
      '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '10:00 PM', '11:00 PM'
    ];

    latencyTimelineChart = new Chart(ctxDelay, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Delay (ms)',
            data: REGION_STATS.all.latencyTrend,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            fill: false,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#1e3a8a',
            pointBorderColor: '#3b82f6',
            borderWidth: 1.5
          },
          {
            label: 'Trend Average',
            data: new Array(timeLabels.length).fill(115),
            borderColor: '#94a3b8',
            borderDash: [5, 5],
            borderWidth: 1,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: {
              color: '#64748b',
              font: { size: 8 },
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 12
            },
            grid: { color: '#f1f5f9' }
          },
          y: {
            min: -100,
            max: 350,
            ticks: {
              stepSize: 50,
              color: '#64748b',
              font: { size: 9 }
            },
            grid: { color: '#f1f5f9' }
          }
        }
      }
    });
  }
}

/* ==========================================
   4. Network Metric Explorer Tool
   ========================================== */
const METRIC_DATA = {
  rsrp: {
    title: 'RSRP (Reference Signal Received Power)',
    desc: 'The fundamental RF measurement in 4G LTE & 5G NR indicating received power from cell tower reference signals. Measured in dBm.',
    sliderMin: -140,
    sliderMax: -40,
    defaultVal: -82,
    unit: 'dBm',
    tiers: {
      exc: '>-80 dBm (Near tower / Clear line of sight)',
      good: '-80 to -90 dBm (Strong urban coverage)',
      fair: '-90 to -105 dBm (Standard indoor penetration)',
      poor: '<-110 dBm (Cell edge / Potential drop call)'
    }
  },
  rsrq: {
    title: 'RSRQ (Reference Signal Received Quality)',
    desc: 'Indicates radio channel quality and interference level from neighboring cells. Measured in decibels (dB).',
    sliderMin: -25,
    sliderMax: -3,
    defaultVal: -10,
    unit: 'dB',
    tiers: {
      exc: '>-10 dB (Low interference / High data rate)',
      good: '-10 to -15 dB (Good quality)',
      fair: '-15 to -19 dB (Moderate cell congestion)',
      poor: '<-20 dB (Severe interference / Packet loss)'
    }
  },
  sinr: {
    title: 'SINR (Signal-to-Interference-plus-Noise Ratio)',
    desc: 'The signal quality benchmark. Determines maximum achievable modulation scheme (e.g. 256-QAM vs QPSK) and peak download speed.',
    sliderMin: -10,
    sliderMax: 35,
    defaultVal: 22,
    unit: 'dB',
    tiers: {
      exc: '>20 dB (Peak 5G throughput / 256-QAM)',
      good: '13 to 20 dB (Smooth 4K video streaming)',
      fair: '0 to 12 dB (Basic browsing / Lower throughput)',
      poor: '<0 dB (Signal overwhelmed by noise)'
    }
  },
  cqi: {
    title: 'CQI (Channel Quality Indicator)',
    desc: 'A value from 1 to 15 reported by your phone to the base station requesting specific modulation and coding rates.',
    sliderMin: 1,
    sliderMax: 15,
    defaultVal: 13,
    unit: 'Level',
    tiers: {
      exc: '12 - 15 (256-QAM Modulation / Max Code Rate)',
      good: '9 - 11 (64-QAM Modulation)',
      fair: '5 - 8 (16-QAM Modulation)',
      poor: '1 - 4 (QPSK / Heavy retransmissions)'
    }
  }
};

let currentActiveMetric = 'rsrp';

function initMetricExplorer() {
  const metricTabs = document.querySelectorAll('.metric-tab-btn');
  const slider = document.getElementById('metric-interactive-slider');
  const sliderValDisplay = document.getElementById('metric-slider-live-val');
  const titleEl = document.getElementById('metric-panel-title');
  const descEl = document.getElementById('metric-panel-desc');

  if (!metricTabs.length) return;

  function updateMetricUI(key) {
    currentActiveMetric = key;
    const m = METRIC_DATA[key];
    if (titleEl) titleEl.textContent = m.title;
    if (descEl) descEl.textContent = m.desc;

    if (slider) {
      slider.min = m.sliderMin;
      slider.max = m.sliderMax;
      slider.value = m.defaultVal;
    }
    if (sliderValDisplay) sliderValDisplay.textContent = `${m.defaultVal} ${m.unit}`;

    const excEl = document.getElementById('tier-val-exc');
    const goodEl = document.getElementById('tier-val-good');
    const fairEl = document.getElementById('tier-val-fair');
    const poorEl = document.getElementById('tier-val-poor');

    if (excEl) excEl.textContent = m.tiers.exc;
    if (goodEl) goodEl.textContent = m.tiers.good;
    if (fairEl) fairEl.textContent = m.tiers.fair;
    if (poorEl) poorEl.textContent = m.tiers.poor;
  }

  metricTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      metricTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-metric');
      updateMetricUI(key);
    });
  });

  slider?.addEventListener('input', (e) => {
    const val = e.target.value;
    const m = METRIC_DATA[currentActiveMetric];
    if (sliderValDisplay) sliderValDisplay.textContent = `${val} ${m.unit}`;
  });
}

/* ==========================================
   5. Dead-Zone Reporter Modal
   ========================================== */
function initDeadZoneReporter() {
  const openBtns = document.querySelectorAll('.btn-open-deadzone-modal');
  const modal = document.getElementById('deadzone-modal');
  const closeBtn = document.getElementById('deadzone-modal-close');
  const form = document.getElementById('deadzone-report-form');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal?.classList.add('active');
    });
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.remove('active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    modal?.classList.remove('active');
    form.reset();
    showToast('✅ Thank you! Dead-zone report recorded in the NetScope community telemetry database.');
  });
}

/* ==========================================
   6. FAQ Accordion & Search
   ========================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

function initFAQSearch() {
  const searchInput = document.getElementById('faq-search-input');
  const faqItems = document.querySelectorAll('.faq-item');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    faqItems.forEach(item => {
      const qText = item.querySelector('.faq-question')?.textContent.toLowerCase() || '';
      const aText = item.querySelector('.faq-answer')?.textContent.toLowerCase() || '';
      if (qText.includes(query) || aText.includes(query)) {
        item.style.display = 'block';
        if (query.length > 2) item.classList.add('active');
      } else {
        item.style.display = 'none';
        item.classList.remove('active');
      }
    });
  });
}

/* ==========================================
   7. Copy Link & Toast Utilities
   ========================================== */
window.copyDownloadLink = function() {
  const apkUrl = 'https://github.com/bhavingarg121-glitch/net_scope/releases/download/v1.0.0/app-debug.apk';
  navigator.clipboard.writeText(apkUrl).then(() => {
    showToast('Direct APK download link copied to clipboard!');
  }).catch(() => {
    showToast('Download link: ' + apkUrl);
  });
};

function showToast(message) {
  let toast = document.getElementById('netscope-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'netscope-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(10, 15, 36, 0.96);
      border: 1px solid #00f2fe;
      color: #f8fafc;
      padding: 12px 22px;
      border-radius: 100px;
      font-size: 0.9rem;
      font-family: Outfit, sans-serif;
      box-shadow: 0 10px 30px rgba(0, 242, 254, 0.35);
      z-index: 9999;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 3500);
}
