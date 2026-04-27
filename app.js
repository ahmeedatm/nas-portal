const SERVICES = [
  { name: 'OpenMediaVault', icon: 'openmediavault', desc: 'Gestion du NAS', port: 80 },
  { name: 'qBittorrent', icon: 'qbittorrent', desc: 'Téléchargements', port: 8080 },
  { name: 'Jellyfin', icon: 'jellyfin', desc: 'Média center', port: 8096 },
  { name: 'Home Assistant', icon: 'home-assistant', desc: 'Domotique', port: 8123 },
  { name: 'Portainer', icon: 'portainer', desc: 'Docker management', port: 9000 },
  { name: 'Nginx Proxy Manager', icon: 'nginx-proxy-manager', desc: 'Reverse proxy', port: 8281 },
  { name: 'Radarr', icon: 'radarr', desc: 'Films', port: 7878 },
  { name: 'Sonarr', icon: 'sonarr', desc: 'Séries TV', port: 8989 },
  { name: 'Prowlarr', icon: 'prowlarr', desc: 'Indexeurs', port: 9696 },
  { name: 'Jellyseerr', icon: 'jellyseerr', desc: 'Demandes médias', port: 5055 },
  { name: 'n8n', icon: 'n8n', desc: 'Automatisations', port: 5678 },
  { name: 'Bazarr', icon: 'bazarr', desc: 'Sous-titres', port: 6767 }
];

function getServiceUrl(port) {
  return `http://${CONFIG.NAS_HOST}:${port}`;
}

function renderCards() {
  const grid = document.getElementById('service-grid');
  grid.innerHTML = SERVICES.map((service, index) => {
    const url = getServiceUrl(service.port);
    return `
      <a href="${url}" class="card" target="_blank" rel="noopener noreferrer" data-index="${index}">
        <div class="status-dot checking"></div>
        <div class="card-icon">
          <img src="${CONFIG.ICON_BASE_URL}${service.icon}.png" 
               alt="${service.name}" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <span style="display:none;">${service.name.substring(0, 2).toUpperCase()}</span>
        </div>
        <div class="card-name">${service.name}</div>
        <div class="card-desc">${service.desc}</div>
      </a>
    `;
  }).join('');
}

async function checkStatus(service, index) {
  const card = document.querySelector(`.card[data-index="${index}"]`);
  const dot = card.querySelector('.status-dot');
  const url = getServiceUrl(service.port);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT);

  try {
    // mode: 'no-cors' allows us to ping servers without CORS headers
    await fetch(url, { 
      mode: 'no-cors', 
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    dot.className = 'status-dot online';
  } catch (error) {
    dot.className = 'status-dot offline';
    console.warn(`Status check failed for ${service.name}:`, error.name === 'AbortError' ? 'Timeout' : error.message);
  } finally {
    clearTimeout(timeoutId);
  }
}

function updateAllStatuses() {
  SERVICES.forEach((service, index) => {
    const dot = document.querySelector(`.card[data-index="${index}"] .status-dot`);
    if (dot) dot.className = 'status-dot checking';
    checkStatus(service, index);
  });
}

function init() {
  renderCards();
  updateAllStatuses();
  setInterval(updateAllStatuses, CONFIG.CHECK_INTERVAL);
}

document.addEventListener('DOMContentLoaded', init);
