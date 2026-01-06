const serverStatus = document.getElementById('server-status');
const toolsList = document.getElementById('tools-list');
const activityLog = document.getElementById('activity-log');

function addLog(message: string, type: 'system' | 'info' = 'info') {
  if (activityLog) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    activityLog.prepend(entry);
  }
}

async function fetchTools() {
  try {
    // In a real MCP setup, the client (this dashboard) would interact with the server.
    // Here we'll simulate tool discovery for the UI.
    const tools = [
      'redis_get', 'redis_set', 'redis_hgetall',
      'mongodb_find', 'mongodb_insert', 'mysql_query',
      'mysql_show_columns', 'bookstack_search'
    ];

    if (toolsList) {
      toolsList.innerHTML = '';
      tools.forEach(tool => {
        const chip = document.createElement('div');
        chip.className = 'tool-chip';
        chip.textContent = tool;
        toolsList.appendChild(chip);
      });
    }
  } catch (err) {
    addLog('Failed to fetch tools', 'system');
  }
}

function initSSE() {
  const eventSource = new EventSource('/sse');

  eventSource.onopen = () => {
    if (serverStatus) {
      serverStatus.classList.add('online');
      serverStatus.querySelector('.status-text')!.textContent = 'Server Online';
    }
    addLog('Connected to MCP Server via SSE', 'system');
    fetchTools();
  };

  eventSource.onerror = () => {
    if (serverStatus) {
      serverStatus.classList.remove('online');
      serverStatus.querySelector('.status-text')!.textContent = 'Offline / Reconnecting';
    }
    addLog('SSE Connection lost. Retrying...', 'system');
  };
}

// Initialize
addLog('Dashboard booting...');
setTimeout(initSSE, 1000);
fetchTools();
