const messages = document.querySelector('#messages');
const input = document.querySelector('#messageInput');
const form = document.querySelector('#chatForm');
const count = document.querySelector('#messageCount');
const themeToggle = document.querySelector('#themeToggle');
const recentConversations = document.querySelector('#recentConversations');
let activeConversation = recentConversations.querySelector('.conversation-link.selected');
const conversationTitleLimit = 35;
const chatHistory = [];
const provider = 'openrouter';
const version = new URLSearchParams(window.location.search).get('version') || 'v3';
const sessionId = `${version}_${Date.now()}`;

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Tắt dark mode' : 'Bật dark mode');
  localStorage.setItem('northstar-theme', theme);
}

setTheme(localStorage.getItem('northstar-theme') || 'light');
themeToggle.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

function addMessage(text, type = 'user') {
  const row = document.createElement('div');
  row.className = `message-row ${type === 'user' ? 'user-row' : 'assistant-row'}`;
  const avatar = type === 'user' ? '<div class="message-avatar user-avatar">AL</div>' : '<div class="message-avatar">✦</div>';
  const author = type === 'user' ? 'Bạn' : 'Northstar Assistant';
  row.innerHTML = type === 'user'
    ? `<div class="message-content"><span class="message-author">${author}<time>now</time></span><div class="bubble user-bubble">${escapeHtml(text)}</div></div>${avatar}`
    : `${avatar}<div class="message-content"><span class="message-author">${author}<time>now</time></span><div class="bubble assistant-bubble">${renderAssistantText(text)}</div></div>`;
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
  count.textContent = String(Number(count.textContent) + 1);
  if (type === 'user' && activeConversation.dataset.isNew === 'true') {
    const title = text.length > conversationTitleLimit
      ? `${text.slice(0, conversationTitleLimit - 1)}…`
      : text;
    activeConversation.textContent = title;
    activeConversation.dataset.isNew = 'false';
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
}

function renderAssistantText(value) {
  const escaped = escapeHtml(value)
    .replace(/\s+(?=\*\*[^*]+:\*\*)/g, '\n')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length) {
      blocks.push(`<ul>${listItems.join('')}</ul>`);
      listItems = [];
    }
  };

  for (const line of escaped.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
    } else if (/^(?:[-*]|•)\s+/.test(trimmed)) {
      listItems.push(`<li>${trimmed.replace(/^(?:[-*]|•)\s+/, '')}</li>`);
    } else {
      flushList();
      blocks.push(`<p>${trimmed}</p>`);
    }
  }
  flushList();
  return blocks.join('');
}

function addToolEvents(events) {
  const activity = document.querySelector('#toolActivity');
  if (events && events.length) activity.innerHTML = '';
  for (const event of events || []) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tool-event';
    wrapper.innerHTML = `<button class="tool-event-header"><span class="tool-status">✓</span><span class="tool-name">${escapeHtml(event.tool || 'tool')}</span><span class="tool-meta">completed</span><span class="chevron">⌄</span></button><div class="tool-event-body"><div><label>INPUT</label><code>${escapeHtml(JSON.stringify(event.args || {}, null, 2))}</code></div><div><label>RESULT</label><code class="${event.result && event.result.error ? '' : 'success-code'}">${escapeHtml(JSON.stringify(event.result || event.error || {}, null, 2))}</code></div></div>`;
    messages.appendChild(wrapper);
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `<span class="activity-check">${event.result && event.result.error ? '!' : '✓'}</span><div><b>${escapeHtml(event.tool || 'tool')}</b><span>${event.result && event.result.error ? 'error' : 'completed'}</span></div><time>now</time>`;
    activity.appendChild(activityItem);
  }
}

async function sendToAgent(text) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: text, history: chatHistory, provider, version, session_id: sessionId})
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Agent request failed');
  addToolEvents(data.tool_events);
  addMessage(data.assistant_text || '', 'assistant');
  chatHistory.push({role: 'user', content: text}, {role: 'assistant', content: data.assistant_text || ''});
  document.querySelector('.version-badge').textContent = data.version || version;
  document.querySelector('#providerName').textContent = data.provider || provider;
  document.querySelector('#modelName').textContent = data.model || 'default';
  document.querySelector('#sessionTitle').textContent = text.slice(0, conversationTitleLimit);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addMessage(text);
  input.value = '';
  try {
    await sendToAgent(text);
  } catch (error) {
    addMessage(`Không thể gọi agent: ${error.message}`, 'assistant');
  }
});

document.querySelectorAll('[data-prompt]').forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.dataset.prompt;
    input.focus();
  });
});

document.querySelectorAll('[data-collapsible] .tool-event-header').forEach((header) => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    body.hidden = !body.hidden;
    header.querySelector('.chevron').textContent = body.hidden ? '›' : '⌄';
  });
});

function selectConversation(conversation) {
  recentConversations.querySelectorAll('.conversation-link').forEach((item) => {
    item.classList.toggle('selected', item === conversation);
  });
  activeConversation = conversation;
}

recentConversations.addEventListener('click', (event) => {
  const conversation = event.target.closest('.conversation-link');
  if (conversation) selectConversation(conversation);
});

document.querySelector('#newChatButton').addEventListener('click', () => {
  const conversation = document.createElement('button');
  conversation.className = 'conversation-link';
  conversation.dataset.isNew = 'true';
  conversation.textContent = 'Cuộc hội thoại mới';
  recentConversations.querySelector('.nav-label').after(conversation);
  selectConversation(conversation);

  messages.innerHTML = '<div class="message-row assistant-row"><div class="message-avatar">✦</div><div class="message-content"><span class="message-author">Northstar Assistant <time>now</time></span><div class="bubble assistant-bubble">Cuộc hội thoại mới đã sẵn sàng. Bạn cần hỗ trợ điều gì?</div></div></div>';
  count.textContent = '1';
  input.focus();
});

document.querySelector('.close-tip').addEventListener('click', (event) => {
  event.currentTarget.closest('.tip-card').remove();
});

document.querySelectorAll('.nav-item[data-view]').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item[data-view]').forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');
  });
});
