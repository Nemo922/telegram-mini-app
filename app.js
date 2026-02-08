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
    balance: 0,
    energy: 1000,
    maxEnergy: 1000,
    tapValue: 1,
    multiplier: 1,
    level: 1,
    referrals: 0,
    completedTasks: []
};

// Load saved data
function loadGame() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        gameState = { ...gameState, ...JSON.parse(saved) };
    }
}

// Save game data
function saveGame() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Initialize
loadGame();
updateUI();

// User info
const usernameElement = document.getElementById('username');
if (tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    usernameElement.textContent = user.first_name;
} else {
    usernameElement.textContent = 'Player';
}

// Tap functionality
const tapButton = document.getElementById('tapButton');
const tapValueElement = document.getElementById('tapValue');
const floatingCoinsContainer = document.getElementById('floatingCoins');

tapButton.addEventListener('click', (e) => {
    if (gameState.energy >= 1) {
        // Add coins
        const earnAmount = gameState.tapValue * gameState.multiplier;
        gameState.balance += earnAmount;
        gameState.energy -= 1;
        
        // Haptic feedback
        tg.HapticFeedback.impactOccurred('light');
        
        // Show floating coin
        createFloatingCoin(e.clientX, e.clientY, earnAmount);
        
        // Update UI
        updateUI();
        saveGame();
    } else {
        tg.showAlert('Enerjin bitti! Biraz bekle.');
    }
});

// Create floating coin animation
function createFloatingCoin(x, y, amount) {
    const coin = document.createElement('div');
    coin.className = 'floating-coin';
    coin.textContent = `+${amount}`;
    coin.style.left = x + 'px';
    coin.style.top = y + 'px';
    floatingCoinsContainer.appendChild(coin);
    
    setTimeout(() => coin.remove(), 1000);
}

// Energy regeneration
setInterval(() => {
    if (gameState.energy < gameState.maxEnergy) {
        gameState.energy += 1;
        updateUI();
        saveGame();
    }
}, 1000);

// Update UI
function updateUI() {
    document.getElementById('balance').textContent = gameState.balance.toLocaleString();
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('energyText').textContent = `${gameState.energy}/${gameState.maxEnergy}`;
    document.getElementById('energyFill').style.width = `${(gameState.energy / gameState.maxEnergy) * 100}%`;
    document.getElementById('tapValue').textContent = gameState.tapValue * gameState.multiplier;
    document.getElementById('multiplier').textContent = `x${gameState.multiplier}`;
    document.getElementById('referrals').textContent = gameState.referrals;
}

// Tasks
const tasks = [
    { id: 1, icon: '📱', title: 'Telegram Kanalına Katıl', reward: 5000, link: 'https://t.me/yourchannel' },
    { id: 2, icon: '🎥', title: 'YouTube Kanalına Abone Ol', reward: 3000, link: 'https://youtube.com' },
    { id: 3, icon: '🐦', title: 'Twitter\'da Takip Et', reward: 2000, link: 'https://twitter.com' },
    { id: 4, icon: '📸', title: 'Instagram\'da Takip Et', reward: 2000, link: 'https://instagram.com' },
    { id: 5, icon: '💬', title: 'Telegram Grubuna Katıl', reward: 5000, link: 'https://t.me/yourgroup' },
    { id: 6, icon: '⭐', title: 'Günlük Giriş Bonusu', reward: 1000, daily: true }
];

function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = tasks.map(task => {
        const completed = gameState.completedTasks.includes(task.id);
        return `
            <div class="task-card">
                <div class="task-icon">${task.icon}</div>
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-reward">+${task.reward.toLocaleString()} coin</div>
                </div>
                <button class="task-btn ${completed ? 'completed' : ''}" 
                        onclick="completeTask(${task.id})"
                        ${completed ? 'disabled' : ''}>
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
        gameState.balance += task.reward;
        gameState.completedTasks.push(taskId);
        tg.showAlert(`Tebrikler! ${task.reward} coin kazandın!`);
        updateUI();
        saveGame();
        renderTasks();
    }, 2000);
}

// Boosts
const boosts = [
    { id: 1, icon: '👆', name: 'Tap Gücü', description: 'Her tıklamada daha fazla coin', basePrice: 100, level: 1 },
    { id: 2, icon: '⚡', name: 'Enerji Limiti', description: 'Maksimum enerji artışı', basePrice: 200, level: 1 },
    { id: 3, icon: '🔋', name: 'Enerji Yenileme', description: 'Daha hızlı enerji yenileme', basePrice: 300, level: 1 },
    { id: 4, icon: '🚀', name: 'Çarpan', description: 'Tüm kazançları artır', basePrice: 500, level: 1 }
];

function renderBoosts() {
    const boostList = document.getElementById('boostList');
    boostList.innerHTML = boosts.map(boost => {
        const price = Math.floor(boost.basePrice * Math.pow(1.5, boost.level - 1));
        return `
            <div class="boost-card">
                <div class="boost-header">
                    <div class="boost-icon">${boost.icon}</div>
                    <div class="boost-details">
                        <div class="boost-name">${boost.name}</div>
                        <div class="boost-description">${boost.description}</div>
                    </div>
                </div>
                <div class="boost-footer">
                    <div class="boost-level">Level ${boost.level}</div>
                    <div class="boost-price" onclick="buyBoost(${boost.id})">
                        ${price.toLocaleString()} 💰
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function buyBoost(boostId) {
    const boost = boosts.find(b => b.id === boostId);
    const price = Math.floor(boost.basePrice * Math.pow(1.5, boost.level - 1));
    
    if (gameState.balance >= price) {
        gameState.balance -= price;
        boost.level++;
        
        // Apply boost effects
        switch(boostId) {
            case 1: gameState.tapValue++; break;
            case 2: gameState.maxEnergy += 100; break;
            case 3: break; // Handled in energy regen
            case 4: gameState.multiplier += 0.1; break;
        }
        
        tg.HapticFeedback.notificationOccurred('success');
        updateUI();
        saveGame();
        renderBoosts();
    } else {
        tg.showAlert('Yeterli coinin yok!');
    }
}

// Friends/Referral
function renderFriends() {
    document.getElementById('totalReferrals').textContent = gameState.referrals;
    document.getElementById('referralEarnings').textContent = (gameState.referrals * 5000).toLocaleString();
}

document.getElementById('inviteBtn').addEventListener('click', () => {
    const botUsername = 'yourbot'; // Bot username'inizi buraya yazın
    const userId = tg.initDataUnsafe.user?.id || '123456';
    const inviteLink = `https://t.me/${botUsername}?start=ref_${userId}`;
    
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('CoinDrop oyna ve coin kazan! 🪙')}`);
});

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const pages = {
    home: document.querySelector('.main-content'),
    tasks: document.getElementById('tasksPage'),
    boost: document.getElementById('boostPage'),
    friends: document.getElementById('friendsPage')
};

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        
        // Update active nav
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show/hide pages
        Object.keys(pages).forEach(key => {
            if (key === page) {
                pages[key].style.display = key === 'home' ? 'flex' : 'block';
            } else {
                pages[key].style.display = 'none';
            }
        });
        
        // Render page content
        if (page === 'tasks') renderTasks();
        if (page === 'boost') renderBoosts();
        if (page === 'friends') renderFriends();
    });
});

// Initial render
renderTasks();
renderBoosts();
renderFriends();
