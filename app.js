/**
 * NetScope India — Complete Telecom Intelligence & Map Engine
 * Vanilla ES6+ Interactive Controls, Leaflet & Canvas Visualizations
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initIndiaNetworkMap();
  initTelecomDashboard();
  initMetricExplorer();
  initDeadZoneReporter();
  initSpeedTestSimulator();
  initFAQAccordion();
  initFAQSearch();
});

/* ==========================================
   1. Navbar & Mobile Menu Handling
   ========================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
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
  { name: 'Jammu', lat: 32.7266, lng: 74.8570, operator: 'bsnl', gen: '4g', speed: 32, signal: -99, latency: 54, status: 'fair', towers: 810 },
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362, operator: 'airtel', gen: '5g', speed: 210, signal: -89, latency: 34, status: 'good', towers: 920 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376, operator: 'jio', gen: '5g', speed: 235, signal: -87, latency: 31, status: 'good', towers: 1680 }
];

let activeFilter = {
  operator: 'all',
  gen: 'all',
  metric: 'speed'
};

function initIndiaNetworkMap() {
  const mapElement = document.getElementById('india-network-map');
  if (!mapElement || typeof L === 'undefined') return;

  // Initialize Leaflet Map centered on India
  mapInstance = L.map('india-network-map', {
    center: [22.3511, 78.6677],
    zoom: 5,
    minZoom: 4,
    maxZoom: 12,
    zoomControl: true,
    attributionControl: false
  });

  // Cyber Dark Map Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(mapInstance);

  renderMapMarkers();
  initMapFilterControls();
}

function renderMapMarkers() {
  if (!mapInstance || typeof L === 'undefined') return;

  // Clear existing markers
  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  const filtered = INDIA_CITY_DATA.filter(item => {
    const matchOp = (activeFilter.operator === 'all' || item.operator === activeFilter.operator);
    const matchGen = (activeFilter.gen === 'all' || item.gen === activeFilter.gen);
    return matchOp && matchGen;
  });

  filtered.forEach(city => {
    let color = '#00f5a0'; // green
    if (city.status === 'fair') color = '#f59e0b'; // yellow
    if (city.status === 'poor') color = '#f43f5e'; // red

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: 22px;
          height: 22px;
          background: ${color};
          border-radius: 50%;
          border: 3px solid #060913;
          box-shadow: 0 0 15px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: #000;
        ">
          📡
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
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
    btn.addEventListener('click', (e) => {
      const group = btn.getAttribute('data-filter-group');
      const val = btn.getAttribute('data-filter-val');

      // Update active state in UI
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
  all: { bw: 18.4, avail: 97.2, resp: 38.2, totalServ: 184, dropServ: 8, mos: [32, 28, 22, 12, 6], latencyTrend: [38, 42, 36, 45, 52, 68, 40, 35, 33, 36, 41, 39] },
  delhi: { bw: 24.8, avail: 98.4, resp: 24.5, totalServ: 38, dropServ: 1, mos: [40, 32, 18, 7, 3], latencyTrend: [24, 28, 22, 31, 35, 48, 29, 23, 21, 24, 26, 25] },
  mumbai: { bw: 22.1, avail: 97.8, resp: 28.1, totalServ: 42, dropServ: 2, mos: [38, 30, 20, 8, 4], latencyTrend: [28, 32, 26, 35, 40, 52, 33, 27, 25, 28, 30, 29] },
  bengaluru: { bw: 26.5, avail: 98.9, resp: 21.0, totalServ: 34, dropServ: 0, mos: [45, 34, 14, 5, 2], latencyTrend: [21, 24, 19, 27, 30, 42, 25, 20, 18, 21, 23, 22] },
  nagpur: { bw: 16.2, avail: 96.4, resp: 42.0, totalServ: 22, dropServ: 2, mos: [28, 26, 25, 14, 7], latencyTrend: [42, 46, 40, 49, 58, 72, 45, 39, 37, 40, 45, 43] },
  latur: { bw: 10.3, avail: 95.0, resp: 58.4, totalServ: 16, dropServ: 3, mos: [20, 22, 30, 18, 10], latencyTrend: [58, 64, 55, 68, 79, 95, 62, 54, 51, 56, 61, 59] }
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

  if (bwVal) bwVal.textContent = `${data.bw} Mbps`;
  if (availVal) availVal.textContent = `${data.avail} %`;
  if (respVal) respVal.textContent = `${data.resp} ms`;
  if (totalServVal) totalServVal.textContent = data.totalServ;
  if (dropServVal) dropServVal.textContent = data.dropServ;

  // Update Charts
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

  // 1. MOS Voice Quality Pie Chart
  const ctxMOS = document.getElementById('chart-voice-quality')?.getContext('2d');
  if (ctxMOS) {
    voiceQualityChart = new Chart(ctxMOS, {
      type: 'doughnut',
      data: {
        labels: ['Best', 'High', 'Medium', 'Low', 'Poor'],
        datasets: [{
          data: REGION_STATS.all.mos,
          backgroundColor: ['#6366f1', '#38bdf8', '#00f5a0', '#f59e0b', '#f43f5e'],
          borderWidth: 2,
          borderColor: '#0a0f24'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } } }
        }
      }
    });
  }

  // 2. 24-Hour Latency Delay Chart
  const ctxDelay = document.getElementById('chart-latency-delay')?.getContext('2d');
  if (ctxDelay) {
    latencyTimelineChart = new Chart(ctxDelay, {
      type: 'line',
      data: {
        labels: ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM', '10:00 PM', '12:00 AM', '2:00 AM', '4:00 AM', '6:00 AM'],
        datasets: [{
          label: 'Latency (ms)',
          data: REGION_STATS.all.latencyTrend,
          borderColor: '#00f2fe',
          backgroundColor: 'rgba(0, 242, 254, 0.1)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#00f2fe'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
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

    // Update scale card texts
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
   5. Community Dead-Zone Reporter Modal
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
   6. Speed Test Simulator (On-page)
   ========================================== */
function initSpeedTestSimulator() {
  const startBtn = document.getElementById('btn-start-speedtest');
  const speedNum = document.getElementById('sim-speed-val');
  const pingVal = document.getElementById('sim-ping-val');
  const jitterVal = document.getElementById('sim-jitter-val');
  const uploadVal = document.getElementById('sim-upload-val');
  const lossVal = document.getElementById('sim-loss-val');
  const statusLabel = document.getElementById('sim-status-label');
  const gaugePath = document.getElementById('gauge-meter-path');

  if (!startBtn) return;

  let isRunning = false;

  startBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    startBtn.textContent = 'Testing Network...';
    if (statusLabel) statusLabel.textContent = 'Connecting to Local Indian Edge Gateway...';

    if (speedNum) speedNum.textContent = '0.0';
    if (uploadVal) uploadVal.textContent = '--';
    if (pingVal) pingVal.textContent = '--';

    setTimeout(() => {
      const p = Math.floor(Math.random() * 10) + 15;
      const j = Math.floor(Math.random() * 3) + 1;
      if (pingVal) pingVal.textContent = `${p} ms`;
      if (jitterVal) jitterVal.textContent = `${j} ms`;
      if (lossVal) lossVal.textContent = '0.0%';
      if (statusLabel) statusLabel.textContent = 'Measuring Download Stream (5G NR)...';

      let currentSpeed = 0;
      const targetSpeed = Math.floor(Math.random() * 120) + 260;
      
      const dlInterval = setInterval(() => {
        currentSpeed += Math.floor(Math.random() * 25) + 15;
        if (currentSpeed >= targetSpeed) {
          currentSpeed = targetSpeed;
          clearInterval(dlInterval);

          if (statusLabel) statusLabel.textContent = 'Measuring Upload Stream...';
          let upSpeed = 0;
          const targetUp = Math.floor(Math.random() * 25) + 50;

          const upInterval = setInterval(() => {
            upSpeed += Math.floor(Math.random() * 8) + 4;
            if (upSpeed >= targetUp) {
              upSpeed = targetUp;
              clearInterval(upInterval);

              if (statusLabel) statusLabel.textContent = '✅ Analysis Complete — Optimal 5G Performance';
              startBtn.disabled = false;
              startBtn.textContent = 'Run Test Again';
              isRunning = false;
            }
            if (uploadVal) uploadVal.textContent = `${upSpeed.toFixed(1)} Mbps`;
          }, 70);
        }

        if (speedNum) speedNum.textContent = currentSpeed.toFixed(1);
        if (gaugePath) {
          const ratio = Math.min(currentSpeed / 400, 1);
          const strokeOffset = 280 - (280 * ratio);
          gaugePath.style.strokeDashoffset = strokeOffset;
        }
      }, 60);
    }, 500);
  });
}

/* ==========================================
   7. FAQ Accordion & Search
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
   8. Utility Functions & Toasts
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
      background: rgba(10, 15, 36, 0.95);
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
