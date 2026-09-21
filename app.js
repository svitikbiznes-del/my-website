let currentUser = null;
let adminUsers = [];
let adminKeys = [];
const DEFAULT_AVATAR_URL = 'data:image/jpeg;base64,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';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// All publications start strictly empty until an admin actually posts one!
let forumThreadsData = [];
let activeThread = null;

async function api(path, options = {}) {
  if (window.location.protocol === 'file:') throw new Error('Запусти сайт через start.bat — база данных подключается через сервер.');
  const response = await fetch(path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'Произошла ошибка.'); error.status = response.status; throw error; }
  return data;
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(value)).replace(' г.', '');
}

function formatSubscription(user) {
  if (!user.subscriptionEndsAt || new Date(user.subscriptionEndsAt) <= new Date()) return { active: false, date: '—', days: 0 };
  return {
    active: true,
    date: formatDate(user.subscriptionEndsAt),
    days: Math.ceil((new Date(user.subscriptionEndsAt) - Date.now()) / 86400000)
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

function renderBBCode(text) {
  let safe = escapeHtml(text || '');
  safe = safe.replace(/\[quote=(.*?)\]([\s\S]*?)\[\/quote\]/gi, '<div class="xf-quote"><div class="xf-quote-header">$1:</div>$2</div>');
  safe = safe.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<div class="xf-quote">$1</div>');
  safe = safe.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '<div class="xf-code">$1</div>');
  safe = safe.replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>');
  safe = safe.replace(/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>');
  return safe.replace(/\n/g, '<br />');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.textContent = message;
  $('#toast-region').append(toast);
  setTimeout(() => toast.remove(), 3400);
}

function setMessage(id, message, type = '') {
  const node = $(`#${id}`);
  if (node) {
    node.textContent = message;
    node.className = `form-message ${type}`;
  }
}

function showView(view) {
  ['public-view', 'dashboard-view', 'admin-view', 'thread-view'].forEach(id => {
    const el = $(`#${id}`);
    if (el) el.classList.toggle('is-hidden', id !== `${view}-view`);
  });
  const crumb = $('#crumb-current');
  if (crumb) {
    if (view === 'public') crumb.textContent = 'Форумы';
    else if (view === 'dashboard') crumb.textContent = 'Личный кабинет';
    else if (view === 'admin') crumb.textContent = 'Админ-панель';
    else if (view === 'thread') crumb.textContent = activeThread ? activeThread.title : 'Тема';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateAccountButton();
}

function updateAccountButton() {
  const isAuth = Boolean(currentUser);
  const isAdmin = isAuth && currentUser.role === 'admin';

  $('#guest-controls')?.classList.toggle('is-hidden', isAuth);
  $('#member-controls')?.classList.toggle('is-hidden', !isAuth);
  $('#widget-guest-state')?.classList.toggle('is-hidden', isAuth);
  $('#widget-member-state')?.classList.toggle('is-hidden', !isAuth);
  $('#xf-notice')?.classList.toggle('is-hidden', isAuth);

  // Strictly hide the create publication button unless the user is an admin
  $('#btn-open-create-thread')?.classList.toggle('is-hidden', !isAdmin);
  $('#widget-admin-btn')?.classList.toggle('is-hidden', !isAdmin);
  $('#top-admin-button')?.classList.toggle('is-hidden', !isAdmin);
  $('#btn-delete-thread')?.classList.toggle('is-hidden', !isAdmin);

  const pubBadge = $('#publish-badge');
  if (pubBadge) {
    pubBadge.textContent = 'ADMIN';
  }

  // Reply Composer in Thread Page
  $('#page-reply-form')?.classList.toggle('is-hidden', !isAuth);
  $('#reply-guest-lock')?.classList.toggle('is-hidden', isAuth);
  if (isAuth && $('#reply-current-user')) {
    $('#reply-current-user').textContent = currentUser.username;
  }

  if (isAuth) {
    const initials = (currentUser.username || 'U').slice(0, 2).toUpperCase();
    const sub = formatSubscription(currentUser);

    $('#nav-avatar').textContent = initials;
    $('#nav-username').textContent = currentUser.username;
    $('#widget-avatar').textContent = initials;
    $('#widget-username').textContent = currentUser.username;
    
    const widgetRole = $('#widget-role');
    if (widgetRole) {
      widgetRole.textContent = isAdmin ? 'ADMINISTRATOR' : 'MEMBER';
      widgetRole.className = isAdmin ? 'widget-role-badge role-admin font-bold' : 'widget-role-badge';
    }
    
    const widgetSub = $('#widget-sub-status');
    if (widgetSub) {
      widgetSub.textContent = sub.active ? `${sub.days} дн.` : 'Не активен';
      widgetSub.style.color = sub.active ? 'var(--accent)' : 'var(--text-muted)';
    }

    const replyAvatar = $('#reply-avatar');
    if (replyAvatar) replyAvatar.textContent = initials;
  }
}

// --------------------------------------------------------------------------
// Threads Loading & Rendering
// --------------------------------------------------------------------------
async function loadThreads() {
  try {
    const data = await api('/api/threads');
    forumThreadsData = data.threads || [];
  } catch {
    forumThreadsData = [];
  }
  renderForumNodes();
}

function renderForumNodes() {
  $('#stat-total-threads').textContent = forumThreadsData.length;

  const nodeMap = {
    'news': 'lastpost-news',
    'rules': 'lastpost-rules',
    'cs2-general': 'lastpost-cs2-general',
    'cs2-cfg': 'lastpost-cs2-cfg',
    'cs2-lua': 'lastpost-cs2-lua',
    'cs2-media': 'lastpost-cs2-media',
    'sub-buy': 'lastpost-sub-buy',
    'user-market': 'lastpost-user-market',
    'hwid-support': 'lastpost-hwid-support'
  };

  // Reset all lastposts to clean empty state
  Object.values(nodeMap).forEach(id => {
    const el = $(`#${id}`);
    if (el) el.innerHTML = '<span class="node-no-posts">Нет публикаций</span>';
  });

  // Calculate totals and group by node_id
  let totalReplies = 0;
  const nodeStats = {};

  forumThreadsData.forEach(thread => {
    const rep = parseInt(thread.reply_count || 0, 10);
    totalReplies += rep;
    if (!nodeStats[thread.node_id]) {
      nodeStats[thread.node_id] = { threads: 0, replies: 0, latestThread: thread };
    }
    nodeStats[thread.node_id].threads++;
    nodeStats[thread.node_id].replies += rep;
  });

  const totalRepliesEl = $('#stat-total-replies');
  if (totalRepliesEl) {
    totalRepliesEl.textContent = totalReplies + forumThreadsData.length;
  }

  // Update nodes with thread data
  Object.entries(nodeStats).forEach(([nodeId, stats]) => {
    const targetId = nodeMap[nodeId];
    const thread = stats.latestThread;
    if (targetId && thread) {
      const el = $(`#${targetId}`);
      if (el) {
        el.innerHTML = `
          <div class="lastpost-avatar cursor-pointer" data-open-thread="${escapeHtml(thread.id)}">${escapeHtml((thread.author || 'AD').slice(0, 2).toUpperCase())}</div>
          <div class="lastpost-info">
            <a href="#/thread/${escapeHtml(thread.id)}" class="lastpost-title thread-open" data-open-thread="${escapeHtml(thread.id)}">${escapeHtml(thread.title)}</a>
            <div class="lastpost-meta">
              <span class="lastpost-date">${formatDate(thread.created_at)}</span> · <span class="role-admin font-bold">${escapeHtml(thread.author)}</span>
            </div>
          </div>
        `;
      }
      const row = el ? el.closest('.node-row') : null;
      if (row) {
        row.setAttribute('data-thread-id', thread.id);
        const statsCount = row.querySelectorAll('.node-stats .stat-count');
        if (statsCount.length >= 2) {
          statsCount[0].textContent = String(stats.threads);
          statsCount[1].textContent = String(stats.replies);
        }
      }
    }
  });
}

function insertBBCode(tag) {
  const target = (activeThread && $('#thread-view') && !$('#thread-view').classList.contains('is-hidden'))
    ? $('#page-reply-textarea')
    : $('#new-thread-content');
  if (!target) return;
  const start = target.selectionStart;
  const end = target.selectionEnd;
  const val = target.value;
  const selected = val.substring(start, end);
  let replacement = '';
  if (tag === 'b') replacement = `[b]${selected || 'текст'}[/b]`;
  else if (tag === 'i') replacement = `[i]${selected || 'текст'}[/i]`;
  else if (tag === 'quote') replacement = `[quote]${selected || 'цитата'}[/quote]`;
  else if (tag === 'code') replacement = `[code]${selected || 'код'}[/code]`;
  target.value = val.substring(0, start) + replacement + val.substring(end);
  target.focus();
}

// --------------------------------------------------------------------------
// Dedicated Thread Page (Full Forum Thread View)
// --------------------------------------------------------------------------
async function openThreadPage(threadId) {
  let thread = forumThreadsData.find(t => t.id === threadId);
  let replies = [];

  try {
    const data = await api('/api/threads/' + encodeURIComponent(threadId));
    if (data && data.thread) {
      thread = data.thread;
      replies = data.replies || [];
    }
  } catch (err) {
    console.warn('Failed fetching thread details, using cached:', err);
  }

  if (!thread) {
    showToast('Тема не найдена', 'error');
    return;
  }

  activeThread = thread;

  const nodeNames = {
    'news': 'Новости и обновления',
    'rules': 'Правила сообщества',
    'cs2-general': 'Общее обсуждение CS2',
    'cs2-cfg': 'Конфигурации (CFG)',
    'cs2-lua': 'Lua Скрипты',
    'cs2-media': 'Медиа & Скриншоты',
    'sub-buy': 'Приобретение подписки',
    'user-market': 'Пользовательский рынок',
    'hwid-support': 'Техническая поддержка'
  };

  $('#page-thread-node').textContent = nodeNames[thread.node_id] || 'Официальный раздел';
  $('#page-thread-prefix').textContent = thread.prefix || (thread.pinned ? '[ЗАКРЕПЛЕНО]' : '[ОФИЦИАЛЬНО]');
  $('#page-thread-title').textContent = thread.title;
  $('#page-thread-author').textContent = thread.author || 'admin';
  $('#page-thread-date').textContent = formatDate(thread.created_at || new Date());
  $('#page-thread-replies-count').textContent = replies.length;

  const isAuth = Boolean(currentUser);
  const isAdmin = isAuth && currentUser.role === 'admin';
  $('#btn-delete-thread')?.classList.toggle('is-hidden', !isAdmin);

  const isOpAdmin = thread.author_role === 'admin' || thread.author === 'admin' || thread.author === 'admim';

  // Render OP (Post #1)
  let streamHtml = `
    <article class="xf-postbit xf-card" id="post-op">
      <div class="postbit-author">
        <div class="author-avatar ${isOpAdmin ? 'admin-avatar' : ''}">${escapeHtml((thread.author || 'AD').slice(0, 2).toUpperCase())}</div>
        <div class="author-name ${isOpAdmin ? 'role-admin font-bold' : ''}">${escapeHtml(thread.author || 'admin')}</div>
        <div class="author-title ${isOpAdmin ? 'role-admin-title' : ''}">${isOpAdmin ? 'Administrator 👑' : 'Member'}</div>
        <div class="author-meta-rows">
          <div><span>Сообщение:</span><strong>#1 (OP)</strong></div>
        </div>
      </div>
      <div class="postbit-body">
        <div class="postbit-header">
          <span class="postbit-date">${formatDate(thread.created_at || new Date())}</span>
          <span class="postbit-num">#1</span>
        </div>
        <div class="postbit-text">${renderBBCode(thread.content)}</div>
      </div>
    </article>
  `;

  // Render Replies (#2, #3...)
  replies.forEach((rep, idx) => {
    const isRepAdmin = rep.author_role === 'admin';
    streamHtml += `
      <article class="xf-postbit xf-card reply-postbit" id="post-${escapeHtml(rep.id)}">
        <div class="postbit-author">
          <div class="author-avatar ${isRepAdmin ? 'admin-avatar' : ''}">${escapeHtml((rep.author || 'U').slice(0, 2).toUpperCase())}</div>
          <div class="author-name ${isRepAdmin ? 'role-admin font-bold' : ''}">${escapeHtml(rep.author)}</div>
          <div class="author-title ${isRepAdmin ? 'role-admin-title' : ''}">${isRepAdmin ? 'Administrator 👑' : 'Пользователь'}</div>
        </div>
        <div class="postbit-body">
          <div class="postbit-header">
            <span class="postbit-date">${formatDate(rep.created_at)}</span>
            <div class="postbit-header-actions">
              ${isAdmin ? `<button class="btn-delete-reply" data-delete-reply="${escapeHtml(rep.id)}" type="button" title="Удалить ответ">Удалить</button>` : ''}
              <span class="postbit-num">#${idx + 2}</span>
            </div>
          </div>
          <div class="postbit-text">${renderBBCode(rep.content)}</div>
        </div>
      </article>
    `;
  });

  $('#thread-posts-stream').innerHTML = streamHtml;

  // Configure Reply Composer
  $('#page-reply-form')?.classList.toggle('is-hidden', !isAuth);
  $('#reply-guest-lock')?.classList.toggle('is-hidden', isAuth);
  if (isAuth && $('#reply-current-user')) {
    $('#reply-current-user').textContent = currentUser.username;
  }

  showView('thread');
  window.location.hash = `#/thread/${thread.id}`;
}

async function handlePageReply(event) {
  event.preventDefault();
  setMessage('page-reply-msg', '');
  if (!currentUser) {
    showToast('Для отправки ответа необходимо войти в аккаунт.', 'error');
    openAuth('login');
    return;
  }
  if (!activeThread) return;

  const textarea = $('#page-reply-textarea');
  const content = (textarea ? textarea.value : '').trim();
  if (!content) {
    setMessage('page-reply-msg', 'Пожалуйста, введите текст ответа.');
    return;
  }

  try {
    const res = await api('/api/replies', {
      method: 'POST',
      body: JSON.stringify({
        thread_id: activeThread.id,
        content: content
      })
    });

    if (textarea) textarea.value = '';
    showToast('Ответ успешно опубликован!');

    const rep = res.reply;
    const currentRepliesCount = Number($('#page-thread-replies-count').textContent || 0) + 1;
    $('#page-thread-replies-count').textContent = currentRepliesCount;

    const isUserAdmin = currentUser.role === 'admin';
    const repHtml = `
      <article class="xf-postbit xf-card reply-postbit" id="post-${escapeHtml(rep.id)}">
        <div class="postbit-author">
          <div class="author-avatar ${isUserAdmin ? 'admin-avatar' : ''}">${escapeHtml((currentUser.username || 'U').slice(0, 2).toUpperCase())}</div>
          <div class="author-name ${isUserAdmin ? 'role-admin font-bold' : ''}">${escapeHtml(currentUser.username)}</div>
          <div class="author-title ${isUserAdmin ? 'role-admin-title' : ''}">${isUserAdmin ? 'Administrator 👑' : 'Пользователь'}</div>
        </div>
        <div class="postbit-body">
          <div class="postbit-header">
            <span class="postbit-date">Только что</span>
            <div class="postbit-header-actions">
              ${isUserAdmin ? `<button class="btn-delete-reply" data-delete-reply="${escapeHtml(rep.id)}" type="button" title="Удалить ответ">Удалить</button>` : ''}
              <span class="postbit-num">#${currentRepliesCount + 1}</span>
            </div>
          </div>
          <div class="postbit-text">${renderBBCode(rep.content)}</div>
        </div>
      </article>
    `;

    $('#thread-posts-stream').insertAdjacentHTML('beforeend', repHtml);
    await loadThreads();
    await loadForumStats();
  } catch (err) {
    setMessage('page-reply-msg', err.message);
  }
}

// --------------------------------------------------------------------------
// Admin Thread Creation Modal (Only Admins Can Publish)
// --------------------------------------------------------------------------
function triggerOpenCreateThread() {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('🔒 Создание публикаций доступно исключительно Администраторам проекта.', 'error');
    if (!currentUser) openAuth('login');
    return;
  }
  $('#new-thread-modal').classList.remove('is-hidden');
  $('#new-thread-title')?.focus();
}

function closeCreateThreadModal() {
  $('#new-thread-modal').classList.add('is-hidden');
  setMessage('new-thread-message', '');
}

async function handleCreateThread(event) {
  event.preventDefault();
  setMessage('new-thread-message', '');

  if (!currentUser || currentUser.role !== 'admin') {
    setMessage('new-thread-message', 'Недостаточно прав. Публиковать могут только администраторы.');
    return;
  }

  const node_id = $('#new-thread-node').value;
  const prefix = $('#new-thread-prefix').value;
  const title = $('#new-thread-title').value.trim();
  const content = $('#new-thread-content').value.trim();
  const pinned = $('#new-thread-pinned').checked;

  if (!title || title.length < 3) {
    setMessage('new-thread-message', 'Заголовок должен содержать от 3 символов.');
    return;
  }
  if (!content || content.length < 5) {
    setMessage('new-thread-message', 'Текст публикации должен содержать от 5 символов.');
    return;
  }

  try {
    const data = await api('/api/threads', {
      method: 'POST',
      body: JSON.stringify({ node_id, prefix, title, content, pinned })
    });

    closeCreateThreadModal();
    $('#new-thread-form').reset();
    showToast('✅ Публикация успешно размещена на форуме!');
    await loadThreads();
    if (data.thread) {
      openThreadModal(data.thread.id);
    }
  } catch (error) {
    setMessage('new-thread-message', error.message);
  }
}

function insertBBCode(tag) {
  const textarea = $('#new-thread-content');
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  let replacement = '';
  if (tag === 'b') replacement = `[b]${selected || 'жирный текст'}[/b]`;
  else if (tag === 'i') replacement = `[i]${selected || 'курсив'}[/i]`;
  else if (tag === 'quote') replacement = `[quote=Информация]${selected || 'текст цитаты'}[/quote]`;
  else if (tag === 'code') replacement = `[code]${selected || '// код или конфиг'}[/code]`;

  textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.focus();
}

// --------------------------------------------------------------------------
// Auth & User Profile
// --------------------------------------------------------------------------
function openAuth(tab = 'login') {
  $('#auth-modal').classList.remove('is-hidden');
  switchAuthTab(tab);
  setTimeout(() => $(tab === 'login' ? '#login-identity' : '#register-username')?.focus(), 80);
}

function closeAuth() {
  $('#auth-modal').classList.add('is-hidden');
}

function switchAuthTab(tab) {
  $$('.auth-tab').forEach(button => button.classList.toggle('active', button.dataset.authTab === tab));
  $('#login-form').classList.toggle('is-hidden', tab !== 'login');
  $('#register-form').classList.toggle('is-hidden', tab !== 'register');
  $('#auth-title').innerHTML = tab === 'login' ? 'Вход на форум<span class="brand-accent">.</span>' : 'Регистрация на форуме<span class="brand-accent">.</span>';
  if (window.turnstile && typeof window.turnstile.reset === 'function') {
    try { window.turnstile.reset(); } catch {}
  }
}

function openPricingModal() {
  $('#pricing-modal').classList.remove('is-hidden');
}

function closePricingModal() {
  $('#pricing-modal').classList.add('is-hidden');
}

function renderDashboard(user) {
  const subscription = formatSubscription(user);
  $('#dashboard-admin-panel')?.classList.toggle('is-hidden', user.role !== 'admin');
  $('#profile-avatar').textContent = (user.username || 'U').slice(0, 2).toUpperCase();
  $('#profile-name').textContent = user.username;
  $('#profile-email').textContent = user.email;
  $('#profile-id').textContent = user.id;
  $('#profile-created').textContent = formatDate(user.createdAt);
  $('#profile-role').textContent = user.role.toUpperCase();
  $('#profile-role-detail').textContent = user.role === 'admin' ? 'Администратор' : 'Участник';
  $('#profile-hwid').textContent = user.hwid || 'Не привязан';

  $('#subscription-state').innerHTML = subscription.active ? '<i></i> active' : '<i></i> inactive';
  $('#subscription-state').className = `subscription-state ${subscription.active ? 'active' : ''}`;
  $('#subscription-title').textContent = subscription.active ? `${subscription.days} дней доступа` : 'Доступ не активирован';
  $('#subscription-copy').textContent = subscription.active ? 'Твоя подписка активна. Статус синхронизирован с сервером.' : 'Для активации доступа введи лицензионный ключ ниже (приобрести ключ можно в Telegram @svitikshop).';
  $('#subscription-date').textContent = subscription.date;
  $('#subscription-progress span').style.width = subscription.active ? `${Math.min(100, Math.max(10, subscription.days / 30 * 100))}%` : '0%';
  updateProfileLoaderDownload(user);
}

function renderAdmin() {
  const active = adminUsers.filter(user => formatSubscription(user).active).length;
  const banned = adminUsers.filter(user => user.banned).length;
  $('#stat-users').textContent = adminUsers.length;
  $('#stat-active').textContent = active;
  $('#stat-banned').textContent = banned;

  $('#forum-stat-users').textContent = adminUsers.length;
  $('#forum-stat-active').textContent = active;
  if (adminUsers.length > 0) {
    $('#forum-stat-newest').textContent = adminUsers[adminUsers.length - 1].username;
  }

  const query = ($('#user-search').value || '').trim().toLowerCase();
  const filtered = adminUsers.filter(user => `${user.username} ${user.email}`.toLowerCase().includes(query));
  $('#users-empty').classList.toggle('is-hidden', filtered.length > 0);

  $('#users-table-body').innerHTML = filtered.map(user => {
    const sub = formatSubscription(user);
    return `<tr>
      <td>
        <span class="table-user">
          <img src="${user.avatarUrl || DEFAULT_AVATAR_URL}" alt="" />
          <span>${escapeHtml(user.username)}<span class="user-email">${escapeHtml(user.email)}</span></span>
        </span>
      </td>
      <td>
  <select class="inline-role-select" onchange="changeUserRole('${escapeHtml(user.username)}', this.value)">
    <option value="member" ${user.role === 'member' ? 'selected' : ''}>Member</option>
    <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option>
    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
  </select>
</td>
      <td>${sub.active ? `<span class="table-tag">${sub.days} дн.</span>` : '<span class="muted-text">нет</span>'}</td>
      <td><span class="font-mono">null</span></td>
      <td>
        <span class="table-tag ${user.banned ? 'banned' : ''}">
          <span class="status-dot-mini ${user.banned ? 'dot-red' : 'dot-green'}"></span>${user.banned ? 'banned' : 'active'}
        </span>
      </td>
      <td>
        ${user.role !== 'admin' ? `<button class="table-ban-btn ${user.banned ? 'is-banned' : ''}" data-toggle-ban="${user.id}" title="${user.banned ? 'Разблокировать' : 'Заблокировать'}">${user.banned ? 'Разбанить ↺' : 'Забанить ⊘'}</button>` : '<span class="muted-text">—</span>'}
      </td>
    </tr>`;
  }).join('');
}

async function loadAdminUsers() {
  try {
    const data = await api('/api/admin/users');
    adminUsers = data.users || [];
    renderAdmin();
    loadAdminKeys();
    loadAdminLoader();
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      currentUser = null;
      showView('public');
      showToast('Доступ к админ-панели запрещён', 'error');
    } else {
      showToast(error.message, 'error');
    }
  }
}

async function loadAdminKeys() {
  try {
    const data = await api('/api/admin/keys');
    adminKeys = data.keys || [];
    renderAdminKeys();
  } catch (err) {
    console.error('Failed to load keys:', err);
  }
}

function renderAdminKeys() {
  const tbody = $('#keys-table-body');
  const empty = $('#keys-empty');
  if (!tbody) return;
  const query = ($('#keys-search')?.value || '').trim().toLowerCase();
  const filtered = adminKeys.filter(k => 
    (k.key || '').toLowerCase().includes(query) || 
    (k.used_by && k.used_by.toLowerCase().includes(query)) ||
    (k.created_by && k.created_by.toLowerCase().includes(query))
  );
  empty?.classList.toggle('is-hidden', filtered.length > 0);
  tbody.innerHTML = filtered.map(k => {
    const isUsed = Boolean(k.used);
    return `<tr>
      <td><code class="font-mono" style="font-weight:700; color:#fff; letter-spacing:0.04em;">${escapeHtml(k.key)}</code></td>
      <td><span class="table-tag">${k.days} дн.</span></td>
      <td>
        <span class="table-tag ${isUsed ? 'tag-key-used' : 'tag-key-active'}">
          <span class="status-dot-mini ${isUsed ? 'dot-red' : 'dot-green'}"></span>${isUsed ? 'использован' : 'активен'}
        </span>
      </td>
      <td>${isUsed ? `<span class="font-bold" style="color:#cad3df;">${escapeHtml(k.used_by || '—')}</span> <small class="muted-text" style="font-size:10px;">(${k.used_at ? formatDate(k.used_at) : ''})</small>` : '<span class="muted-text">—</span>'}</td>
      <td><span class="muted-text" style="font-size:11px;">${formatDate(k.created_at)}</span></td>
      <td>
        <div class="table-actions-cell">
          <button class="btn-table-action" data-copy-key="${escapeHtml(k.key)}" type="button" title="Скопировать ключ">
            Копировать ⧉
          </button>
          <button class="btn-table-action btn-table-del" data-delete-key="${escapeHtml(k.key)}" type="button" title="Удалить ключ">
            ✕
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function handleGenerateKey() {
  const daysInput = $('#key-gen-days');
  const days = parseInt(daysInput?.value, 10) || 30;
  if (days < 1 || days > 36500) {
    showToast('Срок подписки должен быть от 1 до 36500 дней.', 'error');
    return;
  }
  const btn = $('#btn-generate-key');
  if (btn) btn.disabled = true;
  try {
    const data = await api('/api/admin/keys', {
      method: 'POST',
      body: JSON.stringify({ days })
    });
    showToast(data.message || 'Ключ успешно создан!');
    const resBox = $('#gen-key-result');
    const valBox = $('#gen-key-value');
    if (resBox && valBox) {
      valBox.textContent = data.key;
      resBox.classList.remove('is-hidden');
    }
    await loadAdminKeys();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleDeleteKey(key) {
  if (!confirm(`Вы действительно хотите безвозвратно удалить ключ ${key}?`)) return;
  try {
    await api('/api/admin/keys/delete', {
      method: 'POST',
      body: JSON.stringify({ key })
    });
    showToast(`Ключ ${key} удален.`);
    await loadAdminKeys();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function copyKeyToClipboard(text) {
  if (!text) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast(`Ключ скопирован в буфер: ${text}`);
  } catch {
    showToast(text);
  }
}

// --------------------------------------------------------------------------
// Loader Management & Download Subsystem
// --------------------------------------------------------------------------
async function loadAdminLoader() {
  try {
    const data = await api('/api/admin/loader');
    const input = $('#admin-loader-url-input');
    const link = $('#admin-loader-current-link');
    if (input && !input.value) {
      input.value = data.url || '';
    }
    if (link) {
      link.textContent = data.url || 'Не установлена';
      link.href = data.url || '#';
    }
  } catch {}
}

async function handleSaveLoaderUrl() {
  const input = $('#admin-loader-url-input');
  const url = (input ? input.value : '').trim();
  const btn = $('#btn-save-loader-url');
  if (btn) btn.disabled = true;
  try {
    const res = await api('/api/admin/loader', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    showToast(res.message || 'Ссылка на лоадер обновлена для всех!');
    const link = $('#admin-loader-current-link');
    if (link) {
      link.textContent = url || 'Не установлена';
      link.href = url || '#';
    }
    if (currentUser) {
      updateProfileLoaderDownload(currentUser);
    }
  } catch (err) {
    showToast(err.message || 'Ошибка сохранения ссылки', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function updateProfileLoaderDownload(user) {
  const sub = formatSubscription(user);
  const isUnlocked = Boolean(sub && sub.active);
  const btn = $('#btn-download-loader');
  const btnText = $('#btn-download-loader-text');
  const hint = $('#loader-dl-hint');
  const warning = $('#loader-dl-warning');
  const box = $('#profile-loader-box');

  if (!btn) return;

  if (!isUnlocked) {
    btn.classList.add('disabled');
    btn.setAttribute('aria-disabled', 'true');
    btn.removeAttribute('href');
    if (btnText) btnText.textContent = 'Доступ закрыт 🔒';
    if (hint) hint.textContent = 'Для доступа к загрузке лоадера активируйте подписку.';
    if (warning) warning.classList.remove('is-hidden');
    if (box) box.classList.remove('unlocked');
    return;
  }

  // User has active subscription or is admin -> fetch the live loader link
  try {
    const data = await api('/api/loader');
    if (data.url) {
      btn.classList.remove('disabled');
      btn.removeAttribute('aria-disabled');
      btn.href = data.url;
      btn.target = '_blank';
      if (btnText) btnText.textContent = 'Скачать лоадер ⤓';
      if (hint) hint.textContent = data.updated_at ? `Лоадер готов к загрузке. Обновлен: ${formatDate(data.updated_at)}` : 'Лоадер готов к загрузке.';
      if (warning) warning.classList.add('is-hidden');
      if (box) box.classList.add('unlocked');
    } else {
      btn.classList.add('disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.removeAttribute('href');
      if (btnText) btnText.textContent = 'Ссылка готовится ⌁';
      if (hint) hint.textContent = 'Администратор еще не указал ссылку на скачивание.';
      if (warning) warning.classList.add('is-hidden');
      if (box) box.classList.remove('unlocked');
    }
  } catch {
    btn.classList.add('disabled');
    btn.setAttribute('aria-disabled', 'true');
    if (btnText) btnText.textContent = 'Ошибка загрузки';
  }
}

async function handleRedeemKey() {
  const input = $('#redeem-key-input');
  const key = (input ? input.value : '').trim().toUpperCase();
  if (!key) {
    showRedeemMsg('Введите лицензионный ключ.', true);
    return;
  }
  const btn = $('#btn-redeem-key');
  if (btn) btn.disabled = true;
  showRedeemMsg('', false);
  try {
    const data = await api('/api/keys/redeem', {
      method: 'POST',
      body: JSON.stringify({ key })
    });
    if (data.user) {
      currentUser = data.user;
      renderDashboard(currentUser);
      updateAccountButton();
    }
    if (input) input.value = '';
    showRedeemMsg(data.message || 'Ключ успешно активирован!', false);
    showToast(data.message || 'Подписка успешно активирована!');
    await loadForumStats();
  } catch (err) {
    showRedeemMsg(err.message, true);
    showToast(err.message, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

function showRedeemMsg(text, isError) {
  const el = $('#redeem-key-msg');
  if (!el) return;
  if (!text) {
    el.classList.add('is-hidden');
    el.textContent = '';
    return;
  }
  el.classList.remove('is-hidden');
  el.textContent = text;
  el.style.color = isError ? 'var(--danger, #ff5252)' : 'var(--accent, #9ece37)';
  el.style.fontSize = '12px';
  el.style.marginTop = '8px';
  el.style.fontWeight = '600';
}

function goToAccount() {
  if (!currentUser) return openAuth('login');
  if (currentUser.role === 'admin') {
    showView('admin');
    loadAdminUsers();
  } else {
    showView('dashboard');
    renderDashboard(currentUser);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  setMessage('login-message', '');
  const form = $('#login-form');
  const turnstileToken = form.querySelector('[name="cf-turnstile-response"]')?.value || 'local-bypass';

  try {
    const data = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        identity: $('#login-identity').value.trim(),
        password: $('#login-password').value,
        turnstile_token: turnstileToken
      })
    });
    currentUser = data.user;
    closeAuth();
    form.reset();
    if (window.turnstile) try { window.turnstile.reset(); } catch {}
    showToast(`С возвращением, ${currentUser.username}`);
    updateAccountButton();
    await loadForumStats();
    if (currentUser.role === 'admin') {
      $('#maintenance-overlay')?.classList.add('is-hidden');
      showView('admin');
      loadAdminUsers();
    } else {
      showView('dashboard');
      renderDashboard(currentUser);
    }
  } catch (error) {
    setMessage('login-message', error.message);
    if (window.turnstile) try { window.turnstile.reset(); } catch {}
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setMessage('register-message', '');
  const form = $('#register-form');
  const username = ($('#register-username').value || '').trim();
  const email = ($('#register-email').value || '').trim();
  const password = $('#register-password').value || '';
  const turnstileToken = form.querySelector('[name="cf-turnstile-response"]')?.value || 'local-bypass';

  if (!/^[a-zA-Z0-9]{3,16}$/.test(username)) {
    setMessage('register-message', 'Никнейм должен содержать от 3 до 16 символов (только английские буквы и цифры).');
    return;
  }
  if (password.length > 24) {
    setMessage('register-message', 'Пароль не должен превышать 24 символа.');
    return;
  }
  if (password.length < 4) {
    setMessage('register-message', 'Пароль должен содержать минимум 4 символа.');
    return;
  }

  try {
    const data = await api('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, turnstile_token: turnstileToken })
    });
    currentUser = data.user;
    closeAuth();
    form.reset();
    if (window.turnstile) try { window.turnstile.reset(); } catch {}
    showToast(`Аккаунт ${currentUser.username} успешно создан!`);
    updateAccountButton();
    await loadForumStats();
    showView('dashboard');
    renderDashboard(currentUser);
  } catch (error) {
    setMessage('register-message', error.message);
    if (window.turnstile) try { window.turnstile.reset(); } catch {}
  }
}

async function logout() {
  try {
    await api('/api/logout', { method: 'POST', body: '{}' });
  } finally {
    currentUser = null;
    showView('public');
    updateAccountButton();
    await loadForumStats();
    showToast('Вы вышли из учетной записи');
  }
}

async function issueSubscription() {
  try {
    const data = await api('/api/admin/subscription', {
      method: 'POST',
      body: JSON.stringify({
        username: $('#subscription-user').value.trim(),
        days: Number($('#subscription-days').value)
      })
    });
    $('#subscription-user').value = '';
    await loadAdminUsers();
    showToast(data.message);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function toggleBan(id) {
  try {
    const data = await api('/api/admin/ban', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
    await loadAdminUsers();
    showToast(data.message || (data.banned ? 'Пользователь заблокирован' : 'Пользователь разблокирован'));
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleBanByUsername(action = 'ban') {
  const input = $('#ban-username-input');
  const username = (input ? input.value : '').trim();
  if (!username) return showToast('Введите логин пользователя', 'error');
  try {
    const data = await api('/api/admin/ban', {
      method: 'POST',
      body: JSON.stringify({ username, action })
    });
    if (input) input.value = '';
    await loadAdminUsers();
    showToast(data.message || (data.banned ? `Пользователь ${username} заблокирован` : `Пользователь ${username} разблокирован`));
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function updateClock() {
  const clockEl = $('#live-clock');
  if (clockEl) {
    const now = new Date();
    clockEl.textContent = now.toTimeString().split(' ')[0] + ' UTC';
  }
}

// --------------------------------------------------------------------------
// Event Bindings
// --------------------------------------------------------------------------
function bindEvents() {
  $('#nav-brand')?.addEventListener('click', e => { e.preventDefault(); showView('public'); });
  $('#crumb-root')?.addEventListener('click', e => { e.preventDefault(); showView('public'); });
  $('[data-view-target="public"]')?.addEventListener('click', e => { e.preventDefault(); showView('public'); });

  $('#nav-tab-pricing')?.addEventListener('click', e => { e.preventDefault(); openPricingModal(); });
  $('#nav-tab-rules')?.addEventListener('click', e => { e.preventDefault(); showToast('Правила закрытого форума доступны участникам.'); });
  $('#nav-tab-faq')?.addEventListener('click', e => { e.preventDefault(); showToast('Техническая поддержка доступна в тикетах.'); });
  $('#footer-rules-link')?.addEventListener('click', e => { e.preventDefault(); showToast('Правила закрытого форума доступны участникам.'); });
  $('#footer-privacy-link')?.addEventListener('click', e => { e.preventDefault(); showToast('Политика конфиденциальности: полная защита данных.'); });
  $('#footer-support-link')?.addEventListener('click', e => { e.preventDefault(); showToast('Техническая поддержка доступна в тикетах.'); });

  // Publication triggers (Admin only)
  $('#btn-open-create-thread')?.addEventListener('click', triggerOpenCreateThread);
  $('#admin-create-thread-btn')?.addEventListener('click', triggerOpenCreateThread);
  $('#close-new-thread')?.addEventListener('click', closeCreateThreadModal);
  $('#btn-cancel-publish')?.addEventListener('click', closeCreateThreadModal);
  $('#new-thread-modal')?.addEventListener('click', e => { if (e.target.id === 'new-thread-modal') closeCreateThreadModal(); });
  $('#new-thread-form')?.addEventListener('submit', handleCreateThread);

  // BB-Code toolbar
  $$('.bbcode-btn').forEach(btn => btn.addEventListener('click', () => insertBBCode(btn.dataset.bb)));

  // Auth triggers
  $('#account-button')?.addEventListener('click', () => openAuth('login'));
  $('#close-auth')?.addEventListener('click', closeAuth);
  $('#auth-modal')?.addEventListener('click', event => { if (event.target.id === 'auth-modal') closeAuth(); });
  $$('[data-open-auth]').forEach(button => button.addEventListener('click', () => openAuth(button.dataset.openAuth)));
  $$('.auth-tab').forEach(button => button.addEventListener('click', () => switchAuthTab(button.dataset.authTab)));

  // Pricing close
  $('#close-pricing')?.addEventListener('click', closePricingModal);
  $('#pricing-modal')?.addEventListener('click', e => { if (e.target.id === 'pricing-modal') closePricingModal(); });

  // Thread triggers (Open dedicated thread page)
  document.addEventListener('click', e => {
    const openTarget = e.target.closest('[data-open-thread]');
    if (openTarget) {
      e.preventDefault();
      const threadId = openTarget.dataset.openThread;
      if (threadId) openThreadPage(threadId);
      return;
    }
    const nodeRow = e.target.closest('.node-row');
    if (nodeRow && !e.target.closest('a') && !e.target.closest('button')) {
      const threadId = nodeRow.getAttribute('data-thread-id');
      if (threadId) openThreadPage(threadId);
    }
  });

  $('#btn-thread-back')?.addEventListener('click', () => {
    showView('public');
    window.location.hash = '#forums';
  });

  $('#page-reply-form')?.addEventListener('submit', handlePageReply);

  // Admin delete reply click delegation
  document.addEventListener('click', async e => {
    const deleteBtn = e.target.closest('[data-delete-reply]');
    if (!deleteBtn) return;
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Недостаточно прав для удаления ответов.', 'error');
      return;
    }
    const replyId = deleteBtn.dataset.deleteReply;
    if (!replyId) return;
    if (!confirm('Вы действительно хотите удалить этот ответ?')) return;

    try {
      deleteBtn.disabled = true;
      await api('/api/replies/delete', {
        method: 'POST',
        body: JSON.stringify({ reply_id: replyId })
      });
      showToast('Ответ удален.');
      const postEl = document.getElementById(`post-${replyId}`);
      if (postEl) {
        postEl.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        postEl.style.opacity = '0';
        postEl.style.transform = 'translateY(-6px)';
        setTimeout(() => postEl.remove(), 200);
      }
      const countEl = $('#page-thread-replies-count');
      if (countEl) {
        const currentVal = parseInt(countEl.textContent, 10) || 1;
        countEl.textContent = Math.max(0, currentVal - 1);
      }
      await loadThreads();
      await loadForumStats();
    } catch (err) {
      showToast(err.message || 'Ошибка удаления ответа.', 'error');
      deleteBtn.disabled = false;
    }
  });

  // Admin delete entire thread
  $('#btn-delete-thread')?.addEventListener('click', async () => {
    if (!activeThread) return;
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Недостаточно прав для удаления темы.', 'error');
      return;
    }
    if (!confirm(`Вы действительно хотите безвозвратно удалить тему "${activeThread.title}" и все ответы?`)) return;

    try {
      await api('/api/threads/delete', {
        method: 'POST',
        body: JSON.stringify({ thread_id: activeThread.id })
      });
      showToast('Тема успешно удалена.');
      activeThread = null;
      showView('public');
      window.location.hash = '#forums';
      await loadThreads();
      await loadForumStats();
    } catch (err) {
      showToast(err.message || 'Ошибка удаления темы.', 'error');
    }
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash.startsWith('#/thread/')) {
      const tId = hash.split('#/thread/')[1];
      openThreadPage(tId);
    } else if (hash === '#forums' || hash === '' || hash === '#home') {
      showView('public');
    }
  });

  // Forms
  $('#login-form')?.addEventListener('submit', handleLogin);
  $('#register-form')?.addEventListener('submit', handleRegister);

  // User panel switches
  $('#top-profile-button')?.addEventListener('click', () => { showView('dashboard'); renderDashboard(currentUser); });
  $('#top-admin-button')?.addEventListener('click', () => { showView('admin'); loadAdminUsers(); });
  $('#top-logout-button')?.addEventListener('click', logout);
  $('#logout-button')?.addEventListener('click', logout);
  $('#admin-logout')?.addEventListener('click', logout);
  $('#dashboard-home')?.addEventListener('click', () => showView('public'));
  $('#admin-home')?.addEventListener('click', () => showView('public'));
  $('#widget-profile-btn')?.addEventListener('click', () => { showView('dashboard'); renderDashboard(currentUser); });
  $('#widget-admin-btn')?.addEventListener('click', () => { showView('admin'); loadAdminUsers(); });
  $('#dashboard-admin-panel')?.addEventListener('click', () => { showView('admin'); loadAdminUsers(); });

  // Admin actions
  $('#user-search')?.addEventListener('input', renderAdmin);
  $('#refresh-users')?.addEventListener('click', loadAdminUsers);
  $('#issue-subscription')?.addEventListener('click', issueSubscription);
  $('#btn-ban-user')?.addEventListener('click', () => handleBanByUsername('ban'));
  $('#btn-unban-user')?.addEventListener('click', () => handleBanByUsername('unban'));
  $('#users-table-body')?.addEventListener('click', event => {
    const button = event.target.closest('[data-toggle-ban]');
    if (button) toggleBan(button.dataset.toggleBan);
  });

  // License Key Generation & Management (Admin)
  $$('.btn-quick-day').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.btn-quick-day').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const input = $('#key-gen-days');
      if (input) input.value = btn.dataset.days;
    });
  });
  $('#key-gen-days')?.addEventListener('input', () => {
    const val = $('#key-gen-days').value;
    $$('.btn-quick-day').forEach(b => b.classList.toggle('active', b.dataset.days === val));
  });
  $('#btn-generate-key')?.addEventListener('click', handleGenerateKey);
  $('#btn-copy-gen-key')?.addEventListener('click', () => {
    const val = $('#gen-key-value')?.textContent;
    if (val) copyKeyToClipboard(val);
  });
  $('#keys-search')?.addEventListener('input', renderAdminKeys);
  $('#refresh-keys')?.addEventListener('click', loadAdminKeys);
  $('#keys-table-body')?.addEventListener('click', event => {
    const copyBtn = event.target.closest('[data-copy-key]');
    if (copyBtn) {
      copyKeyToClipboard(copyBtn.dataset.copyKey);
      return;
    }
    const delBtn = event.target.closest('[data-delete-key]');
    if (delBtn) {
      handleDeleteKey(delBtn.dataset.deleteKey);
      return;
    }
  });

  // License Key Redemption (User Profile)
  $('#redeem-key-input')?.addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  });
  $('#redeem-key-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRedeemKey();
    }
  });
  $('#btn-redeem-key')?.addEventListener('click', handleRedeemKey);

  // Admin Loader URL Management
  $('#btn-save-loader-url')?.addEventListener('click', handleSaveLoaderUrl);
  $('#admin-loader-url-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveLoaderUrl();
    }
  });

  // Profile Download Loader Click Guard
  $('#btn-download-loader')?.addEventListener('click', e => {
    const sub = currentUser ? formatSubscription(currentUser) : { active: false };
    const isUnlocked = Boolean(sub && sub.active);
    if (!isUnlocked) {
      e.preventDefault();
      e.stopPropagation();
      showToast('Для скачивания лоадера требуется активная подписка!', 'error');
      return false;
    }
  });

  // Maintenance screen admin bypass
  $('#btn-admin-bypass')?.addEventListener('click', () => {
    if (currentUser && currentUser.role === 'admin') {
      $('#maintenance-overlay')?.classList.add('is-hidden');
      showToast('Окно техработ скрыто (режим администратора).');
    } else {
      openAuth('login');
    }
  });

  // Profile utilities
  $('#support-button')?.addEventListener('click', () => showToast('Тикет-система поддержки открыта в вашем профиле.'));
  $('#copy-id-button')?.addEventListener('click', async () => {
    if (!currentUser) return;
    try {
      await navigator.clipboard.writeText(currentUser.id);
      showToast('ID аккаунта скопирован в буфер');
    } catch {
      showToast(currentUser.id);
    }
  });
  $('#profile-id-copy')?.addEventListener('click', () => $('#copy-id-button')?.click());

  // Password visibility
  $$('.toggle-password').forEach(button => button.addEventListener('click', () => {
    const input = $(`#${button.dataset.target}`);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  }));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeAuth();
      closeThreadModal();
      closePricingModal();
      closeCreateThreadModal();
    }
  });

  setInterval(updateClock, 1000);
  updateClock();
}

async function loadForumStats() {
  try {
    const data = await api('/api/forum/stats');
    if ($('#stat-total-threads')) $('#stat-total-threads').textContent = data.threadsCount ?? 0;
    if ($('#forum-stat-users')) $('#forum-stat-users').textContent = data.usersCount ?? 0;
    if ($('#forum-stat-active')) $('#forum-stat-active').textContent = data.usersCount ?? 0;
    if ($('#forum-stat-newest')) $('#forum-stat-newest').textContent = data.newestUser || '—';

    const staffList = $('#staff-online-list');
    const modStaffList = $('#moderator-staff-list');
    if (data.staff && data.staff.length > 0) {
      const admins = data.staff.filter(s => s.role === 'admin');
      const mods = data.staff.filter(s => s.role === 'moderator');
      if (staffList) {
        staffList.innerHTML = admins.length > 0 ? admins.map(s => `
          <li>
            <span class="staff-dot online"></span>
            <span class="role-admin font-bold">${escapeHtml(s.username)}</span>
            <span class="staff-role-sub">Administrator</span>
          </li>
        `).join('') : '<li class="widget-muted">Нет администрации в сети</li>';
      }
      if (modStaffList) {
        modStaffList.innerHTML = mods.length > 0 ? mods.map(s => `
          <li>
            <span class="staff-dot online"></span>
            <span class="role-moderator font-bold">${escapeHtml(s.username)}</span>
            <span class="staff-role-sub">Moderator</span>
          </li>
        `).join('') : '<li class="widget-muted">Нет модераторов в сети</li>';
      }
    } else {
      if (staffList) staffList.innerHTML = '<li class="widget-muted">Нет администрации в сети</li>';
      if (modStaffList) modStaffList.innerHTML = '<li class="widget-muted">Нет модераторов в сети</li>';
    }
  } catch {
    if ($('#stat-total-threads')) $('#stat-total-threads').textContent = '0';
    if ($('#forum-stat-users')) $('#forum-stat-users').textContent = '0';
    if ($('#forum-stat-active')) $('#forum-stat-active').textContent = '0';
    if ($('#forum-stat-newest')) $('#forum-stat-newest').textContent = '—';
    const staffList = $('#staff-online-list');
    if (staffList) staffList.innerHTML = '<li class="widget-muted">Нет администрации в сети</li>';
  }
}

async function init() {
  bindEvents();
  if (window.location.protocol === 'file:') {
    showToast('Запусти start.bat для связи с сервером.', 'error');
    return;
  }
  try {
    const data = await api('/api/me');
    currentUser = data.user;
  } catch {
    currentUser = null;
  }
  updateAccountButton();
  await loadThreads();
  await loadForumStats();

  if (window.location.hash.startsWith('#/thread/')) {
    const tId = window.location.hash.split('#/thread/')[1];
    if (tId) openThreadPage(tId);
  }
}

init();


// === CHAT & MODERATOR SYSTEM LOGIC (FIXED) ===

async function fetchChatMessages() {
  const chatList = document.getElementById('chat-messages-list');
  const chatFormRow = document.getElementById('chat-form-row');
  const guestNotice = document.getElementById('chat-guest-notice');
  const mutedNotice = document.getElementById('chat-muted-notice');
  const msgCountBadge = document.getElementById('chat-msg-count');

  if (!chatList) return;

  try {
    const data = await api('/api/chat');
    const messages = data.messages || [];
    const isMuted = data.is_muted;
    const user = currentUser; // Global currentUser state

    if (msgCountBadge) msgCountBadge.textContent = messages.length;

    // Visibility of controls based on login & mute status
    if (!user) {
      if (chatFormRow) chatFormRow.classList.add('is-hidden');
      if (guestNotice) guestNotice.classList.remove('is-hidden');
      if (mutedNotice) mutedNotice.classList.add('is-hidden');
    } else if (isMuted) {
      if (chatFormRow) chatFormRow.classList.add('is-hidden');
      if (guestNotice) guestNotice.classList.add('is-hidden');
      if (mutedNotice) mutedNotice.classList.remove('is-hidden');
    } else {
      if (chatFormRow) chatFormRow.classList.remove('is-hidden');
      if (guestNotice) guestNotice.classList.add('is-hidden');
      if (mutedNotice) mutedNotice.classList.add('is-hidden');
    }

    if (messages.length === 0) {
      chatList.innerHTML = '<div class="chat-empty-loading">Сообщений пока нет. Напишите первым!</div>';
      return;
    }

    const canModerate = user && (user.role === 'admin' || user.role === 'moderator');

    let html = '';
    messages.forEach(msg => {
      const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let roleClass = 'role-member';
      let roleText = 'MEMBER';
      if (msg.user_role === 'admin') {
        roleClass = 'role-admin';
        roleText = 'ADMIN';
      } else if (msg.user_role === 'moderator') {
        roleClass = 'role-moderator';
        roleText = 'MODERATOR';
      }

      const initial = (msg.username || 'A')[0].toUpperCase();

      let actionsHtml = '';
      if (canModerate) {
        actionsHtml = `
          <div class="chat-actions">
            <button type="button" class="chat-action-btn btn-mute" title="Замутить/Размутить" onclick="toggleMuteChatUser('${escapeHtml(msg.username)}')">
              <i class="fa-solid fa-volume-xmark"></i>
            </button>
            <button type="button" class="chat-action-btn btn-del" title="Удалить сообщение" onclick="deleteChatMessage('${msg.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;
      }

      html += `
        <div class="chat-message-item" data-id="${msg.id}">
          <div class="chat-avatar">${initial}</div>
          <div class="chat-msg-body">
            <div class="chat-msg-meta">
              <strong class="chat-username">${escapeHtml(msg.username)}</strong>
              <span class="role-badge ${roleClass}">${roleText}</span>
              <span class="chat-time">${timeStr}</span>
              ${actionsHtml}
            </div>
            <div class="chat-text">${escapeHtml(msg.content)}</div>
          </div>
        </div>
      `;
    });

    const isScrolledToBottom = chatList.scrollHeight - chatList.clientHeight <= chatList.scrollTop + 60;
    chatList.innerHTML = html;
    if (isScrolledToBottom) {
      chatList.scrollTop = chatList.scrollHeight;
    }
  } catch (err) {
    console.error('Chat fetch error:', err);
  }
}

async function sendChatMessage(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  try {
    const data = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ content: text })
    });
    if (data.success) {
      input.value = '';
      await fetchChatMessages();
      const chatList = document.getElementById('chat-messages-list');
      if (chatList) chatList.scrollTop = chatList.scrollHeight;
    } else if (data.error) {
      alert(data.error);
    }
  } catch (err) {
    alert(err.message || 'Ошибка отправки сообщения');
  }
}

async function deleteChatMessage(msgId) {
  if (!confirm('Удалить это сообщение?')) return;
  try {
    await api('/api/chat/delete', {
      method: 'POST',
      body: JSON.stringify({ message_id: msgId })
    });
    fetchChatMessages();
  } catch (err) {
    alert(err.message || 'Ошибка удаления сообщения');
  }
}

async function toggleMuteChatUser(username) {
  const action = confirm(`Замутить / размутить пользователя ${username} в чате?`) ? 'mute' : 'unmute';
  try {
    const data = await api('/api/chat/mute', {
      method: 'POST',
      body: JSON.stringify({ target_username: username, action: action })
    });
    if (data.success) {
      alert(`Пользователь ${username} ${action === 'mute' ? 'замучен' : 'размучен'}`);
      fetchChatMessages();
    }
  } catch (err) {
    alert(err.message || 'Ошибка изменения статуса мута');
  }
}

async function changeUserRole(username, newRole) {
  try {
    const data = await api('/api/admin/role', {
      method: 'POST',
      body: JSON.stringify({ username: username, role: newRole })
    });
    if (data.success) {
      alert(`Роль пользователя ${username} изменена на ${newRole}`);
      if (typeof loadAdminUsers === 'function') loadAdminUsers();
      if (typeof loadForumStats === 'function') loadForumStats();
    }
  } catch (err) {
    alert(err.message || 'Ошибка изменения роли');
  }
}

window.sendChatMessage = sendChatMessage;
window.deleteChatMessage = deleteChatMessage;
window.toggleMuteChatUser = toggleMuteChatUser;
window.changeUserRole = changeUserRole;
