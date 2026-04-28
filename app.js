const SERVICES = [
  { name: 'OpenMediaVault', icon: 'openmediavault', desc: 'Gestion du NAS', subdomain: 'omv' },
  { name: 'qBittorrent', icon: 'qbittorrent', desc: 'Téléchargements', subdomain: 'qbittorrent' },
  { name: 'Jellyfin', icon: 'jellyfin', desc: 'Média center', subdomain: 'jellyfin' },
  { name: 'Home Assistant', icon: 'home-assistant', desc: 'Domotique', subdomain: 'homeassistant' },
  { name: 'Portainer', icon: 'portainer', desc: 'Docker management', subdomain: 'portainer' },
  { name: 'Nginx Proxy Manager', icon: 'nginx-proxy-manager', desc: 'Reverse proxy', subdomain: 'nginx' },
  { name: 'Radarr', icon: 'radarr', desc: 'Films', subdomain: 'radarr' },
  { name: 'Sonarr', icon: 'sonarr', desc: 'Séries TV', subdomain: 'sonarr' },
  { name: 'Prowlarr', icon: 'prowlarr', desc: 'Indexeurs', subdomain: 'prowlarr' },
  { name: 'Jellyseerr', icon: 'jellyseerr', desc: 'Demandes médias', subdomain: 'jellyseerr' },
  { name: 'n8n', icon: 'n8n', desc: 'Automatisations', subdomain: 'n8n' },
  { name: 'Bazarr', icon: 'bazarr', desc: 'Sous-titres', subdomain: 'bazarr' },
];

function getServiceUrl(subdomain) {
  return `https://${subdomain}.azru.uk`;
}

function renderCards() {
  const grid = document.getElementById('service-grid');
  grid.innerHTML = SERVICES.map((service, index) => {
    const url = getServiceUrl(service.subdomain);
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

function openTerminal() {
  const modal = document.getElementById('terminal-modal');
  const iframe = document.getElementById('terminal-iframe');
  iframe.src = getServiceUrl('ssh');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTerminal() {
  const modal = document.getElementById('terminal-modal');
  const iframe = document.getElementById('terminal-iframe');
  modal.classList.remove('open');
  iframe.src = '';
  document.body.style.overflow = '';
}

async function checkStatus(service, index) {
  const card = document.querySelector(`.card[data-index="${index}"]`);
  const dot = card.querySelector('.status-dot');
  const url = getServiceUrl(service.subdomain);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT);

  try {
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

  document.getElementById('ssh-btn').addEventListener('click', openTerminal);
  document.getElementById('terminal-close').addEventListener('click', closeTerminal);

  document.getElementById('terminal-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('terminal-modal')) closeTerminal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTerminal();
  });
}

document.addEventListener('DOMContentLoaded', init);
