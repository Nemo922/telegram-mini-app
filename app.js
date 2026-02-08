// Telegram Web App API
const tg = window.Telegram.WebApp;
tg.expand();

// Loading screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
    }, 2000);
});

// Game State
let gameState = {
    points: 0,
    referrals: 0,
    completedTasks: [],
    myAccounts: [],
    purchasedAccounts: []
};

// Load saved data
function loadGame() {
    const saved = localStorage.getItem('pubgMarketplace');
    if (saved) {
        gameState = { ...gameState, ...JSON.parse(saved) };
    }
}

// Save game data
function saveGame() {
    localStorage.setItem('pubgMarketplace', JSON.stringify(gameState));
}

// User info
const usernameElement = document.getElementById('username');
if (tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    usernameElement.textContent = user.first_name;
} else {
    usernameElement.textContent = 'Player';
}

// PUBG Accounts (örnek veriler - gerçekte backend'den gelecek)
let accounts = [
    {
        id: 1,
        seller: 'Admin',
        level: 85,
        tier: 'Conqueror',
        uc: 15000,
        skins: 250,
        price: 500,
        priceType: 'TL',
        image: '🏆',
        description: 'Full eşya, tüm sezon royale pass',
        featured: true
    },
    {
        id: 2,
        seller: 'ProGamer',
        level: 72,
        tier: 'Ace',
        uc: 8000,
        skins: 180,
        price: 300,
        priceType: 'TL',
        image: '⭐',
        description: 'Çok sayıda mythic skin',
        featured: false
    },
    {
        id: 3,
        seller: 'Admin',
        level: 50,
        tier: 'Crown',
        uc: 5000,
        skins: 100,
        price: 5000,
        priceType: 'Puan',
        image: '🎁',
        description: 'Hediye hesap - görevlerle kazan!',
        featured: true,
        isGift: true
    }
];

// Initialize
loadGame();

// Update UI
function updateUI() {
    document.getElementById('points').textContent = gameState.points.toLocaleString();
    renderAccounts();
}

updateUI();

// Render Accounts
function renderAccounts() {
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = accounts.map(acc => `
        <div class="account-card ${acc.featured ? 'featured' : ''}">
            <div class="account-badge">${acc.image}</div>
            ${acc.isGift ? '<div class="gift-badge">🎁 HEDİYE</div>' : ''}
            <div class="account-info">
                <div class="account-tier">${acc.tier}</div>
                <div class="account-level">Level ${acc.level}</div>
                <div class="account-stats">
                    <span>💎 ${acc.uc} UC</span>
                    <span>👕 ${acc.skins} Skin</span>
                </div>
                <div class="account-desc">${acc.description}</div>
                <div class="account-seller">Satıcı: ${acc.seller}</div>
            </div>
            <div class="account-footer">
                <div class="account-price">
                    ${acc.priceType === 'TL' ? '💰' : '🎁'} ${acc.price} ${acc.priceType}
                </div>
                <button class="btn-buy" onclick="buyAccount(${acc.id})">
                    ${acc.isGift ? 'Talep Et' : 'Satın Al'}
                </button>
            </div>
        </div>
    `).join('');
}

// Buy Account
function buyAccount(accountId) {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    
    if (account.priceType === 'Puan') {
        if (gameState.points >= account.price) {
            tg.showConfirm(`${account.price} puan harcayarak bu hesabı almak istiyor musun?`, (confirmed) => {
                if (confirmed) {
                    gameState.points -= account.price;
                    gameState.purchasedAccounts.push(account);
                    tg.showAlert('Tebrikler! Hesap bilgileri mesajlarına gönderildi.');
                    updateUI();
                    saveGame();
                }
            });
        } else {
            tg.showAlert(`Yeterli puanın yok! ${account.price - gameState.points} puan daha gerekli.`);
        }
    } else {
        // TL ile satın alma - ödeme sistemi
        tg.showAlert('Ödeme için satıcıyla iletişime geçilecek...');
        // Gerçek sistemde: Telegram Stars veya ödeme gateway
    }
}

// Tasks
const tasks = [
    { id: 1, icon: '📱', title: 'Telegram Kanalına Katıl', reward: 1000, link: 'https://t.me/yourchannel' },
    { id: 2, icon: '🎥', title: 'YouTube Kanalına Abone Ol', reward: 800, link: 'https://youtube.com' },
    { id: 3, icon: '🐦', title: 'Twitter\'da Takip Et', reward: 500, link: 'https://twitter.com' },
    { id: 4, icon: '📸', title: 'Instagram\'da Takip Et', reward: 500, link: 'https://instagram.com' },
    { id: 5, icon: '⭐', title: 'Günlük Giriş Bonusu', reward: 200, daily: true },
    { id: 6, icon: '👥', title: '5 Arkadaş Davet Et', reward: 2500, referralRequired: 5 }
];

function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = `
        <div class="points-display">
            <div class="points-big">🎁 ${gameState.points}</div>
            <div class="points-label">Toplam Puanın</div>
        </div>
    ` + tasks.map(task => {
        const completed = gameState.completedTasks.includes(task.id);
        const canComplete = task.referralRequired ? gameState.referrals >= task.referralRequired : true;
        return `
            <div class="task-card">
                <div class="task-icon">${task.icon}</div>
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-reward">+${task.reward.toLocaleString()} puan</div>
                </div>
                <button class="task-btn ${completed ? 'completed' : ''}" 
                        onclick="completeTask(${task.id})"
                        ${completed || !canComplete ? 'disabled' : ''}>
                    ${completed ? '✓ Tamamlandı' : 'Başla'}
                </button>
            </div>
        `;
    }).join('');
}

function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || gameState.completedTasks.includes(taskId)) return;
    
    if (task.link) {
        tg.openLink(task.link);
    }
    
    setTimeout(() => {
        gameState.points += task.reward;
        gameState.completedTasks.push(taskId);
        tg.showAlert(`Tebrikler! ${task.reward} puan kazandın!`);
        updateUI();
        saveGame();
        renderTasks();
    }, 2000);
}

// My Accounts
function renderMyAccounts() {
    const myAccountsList = document.getElementById('myAccountsList');
    
    if (gameState.myAccounts.length === 0 && gameState.purchasedAccounts.length === 0) {
        myAccountsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <div class="empty-text">Henüz hesabın yok</div>
                <button class="btn-primary" onclick="showAddAccountModal()">
                    ➕ Hesap Ekle
                </button>
            </div>
        `;
        return;
    }
    
    myAccountsList.innerHTML = `
        <button class="btn-primary" onclick="showAddAccountModal()" style="margin-bottom: 20px;">
            ➕ Yeni Hesap Ekle
        </button>
        <h3 style="margin: 20px 0 10px 0;">Satışa Çıkardığın Hesaplar</h3>
        ${gameState.myAccounts.map(acc => `
            <div class="my-account-card">
                <div class="account-info">
                    <div><strong>Level ${acc.level}</strong> - ${acc.tier}</div>
                    <div>💎 ${acc.uc} UC | 👕 ${acc.skins} Skin</div>
                    <div class="account-price">${acc.price} ${acc.priceType}</div>
                </div>
                <button class="btn-remove" onclick="removeAccount(${acc.id})">Kaldır</button>
            </div>
        `).join('')}
        <h3 style="margin: 20px 0 10px 0;">Satın Aldığın Hesaplar</h3>
        ${gameState.purchasedAccounts.map(acc => `
            <div class="my-account-card purchased">
                <div class="account-info">
                    <div><strong>Level ${acc.level}</strong> - ${acc.tier}</div>
                    <div>💎 ${acc.uc} UC | 👕 ${acc.skins} Skin</div>
                    <div style="font-size: 12px; opacity: 0.8;">Hesap bilgileri mesajlarında</div>
                </div>
            </div>
        `).join('')}
    `;
}

// Add Account Modal
function showAddAccountModal() {
    const modal = `
        <div class="modal" id="addAccountModal">
            <div class="modal-content">
                <h2>➕ Hesap Ekle</h2>
                <input type="number" id="accLevel" placeholder="Level (örn: 75)" class="input-field">
                <input type="text" id="accTier" placeholder="Tier (örn: Ace, Crown)" class="input-field">
                <input type="number" id="accUC" placeholder="UC Miktarı" class="input-field">
                <input type="number" id="accSkins" placeholder="Skin Sayısı" class="input-field">
                <input type="number" id="accPrice" placeholder="Fiyat" class="input-field">
                <select id="accPriceType" class="input-field">
                    <option value="TL">TL</option>
                    <option value="Puan">Puan</option>
                </select>
                <textarea id="accDesc" placeholder="Açıklama" class="input-field"></textarea>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-primary" onclick="addAccount()">Ekle</button>
                    <button class="btn-secondary" onclick="closeModal()">İptal</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

function addAccount() {
    const newAccount = {
        id: Date.now(),
        seller: tg.initDataUnsafe.user?.first_name || 'User',
        level: parseInt(document.getElementById('accLevel').value),
        tier: document.getElementById('accTier').value,
        uc: parseInt(document.getElementById('accUC').value),
        skins: parseInt(document.getElementById('accSkins').value),
        price: parseInt(document.getElementById('accPrice').value),
        priceType: document.getElementById('accPriceType').value,
        description: document.getElementById('accDesc').value,
        image: '🎮'
    };
    
    if (!newAccount.level || !newAccount.tier || !newAccount.price) {
        tg.showAlert('Lütfen tüm alanları doldur!');
        return;
    }
    
    gameState.myAccounts.push(newAccount);
    accounts.push(newAccount);
    saveGame();
    closeModal();
    renderMyAccounts();
    renderAccounts();
    tg.showAlert('Hesabın eklendi ve satışa çıkarıldı!');
}

function removeAccount(accountId) {
    gameState.myAccounts = gameState.myAccounts.filter(a => a.id !== accountId);
    accounts = accounts.filter(a => a.id !== accountId);
    saveGame();
    renderMyAccounts();
    renderAccounts();
}

function closeModal() {
    const modal = document.getElementById('addAccountModal');
    if (modal) modal.remove();
}

// Friends/Referral
function renderFriends() {
    document.getElementById('totalReferrals').textContent = gameState.referrals;
    document.getElementById('referralEarnings').textContent = (gameState.referrals * 1000).toLocaleString();
}

document.getElementById('inviteBtn').addEventListener('click', () => {
    const botUsername = 'coindrop_game_bot'; // Bot username'inizi buraya
    const userId = tg.initDataUnsafe.user?.id || '123456';
    const inviteLink = `https://t.me/${botUsername}?start=ref_${userId}`;
    
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('PUBG hesap al/sat! Bedava hesap kazan! 🎮')}`);
});

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const pages = {
    home: document.querySelector('.main-content'),
    tasks: document.getElementById('tasksPage'),
    myaccounts: document.getElementById('myaccountsPage'),
    friends: document.getElementById('friendsPage')
};

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        Object.keys(pages).forEach(key => {
            if (key === page) {
                pages[key].style.display = key === 'home' ? 'flex' : 'block';
            } else {
                pages[key].style.display = 'none';
            }
        });
        
        if (page === 'tasks') renderTasks();
        if (page === 'myaccounts') renderMyAccounts();
        if (page === 'friends') renderFriends();
    });
});

// Initial render
renderAccounts();
renderTasks();
renderMyAccounts();
renderFriends();
