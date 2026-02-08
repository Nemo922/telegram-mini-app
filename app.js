<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>PUBG Marketplace</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="loading-screen" id="loadingScreen">
<div class="loading-content">
<div class="loading-logo">🎮</div>
<div class="loading-text">PUBG Market</div>
<div class="loading-spinner"></div>
</div>
</div>
<div class="app" id="app" style="display:none">
<div class="header">
<div class="user-info">
<div class="avatar">👤</div>
<div class="user-details">
<div class="username" id="username">Loading...</div>
<div class="user-points">🎁 <span id="points">0</span> Points</div>
</div>
</div>
</div>
<div class="main-content">
<div class="section-header">
<h2>🛒 Accounts For Sale</h2>
<p>Premium PUBG accounts</p>
</div>
<div class="accounts-grid" id="accountsList"></div>
</div>
<div class="bottom-nav">
<div class="nav-item active" data-page="home">
<div class="nav-icon">🛒</div>
<div class="nav-label">Shop</div>
</div>
<div class="nav-item" data-page="tasks">
<div class="nav-icon">🎁</div>
<div class="nav-label">Earn</div>
</div>
<div class="nav-item" data-page="myaccounts">
<div class="nav-icon">📦</div>
<div class="nav-label">My Items</div>
</div>
<div class="nav-item" data-page="friends">
<div class="nav-icon">👥</div>
<div class="nav-label">Friends</div>
</div>
</div>
<div class="page" id="tasksPage" style="display:none">
<div class="page-header">
<h2>🎁 Earn Free Accounts</h2>
<p>Complete tasks, earn points, get free accounts!</p>
</div>
<div class="tasks-list" id="tasksList"></div>
</div>
<div class="page" id="myaccountsPage" style="display:none">
<div class="page-header">
<h2>📦 My Accounts</h2>
<p>Accounts you own and sell</p>
</div>
<div class="my-accounts-list" id="myAccountsList"></div>
</div>
<div class="page" id="friendsPage" style="display:none">
<div class="page-header">
<h2>👥 Invite Friends</h2>
<p>Earn 1000 points per friend!</p>
</div>
<div class="referral-stats">
<div class="stat-card">
<div class="stat-value" id="totalReferrals">0</div>
<div class="stat-label">Total Invites</div>
</div>
<div class="stat-card">
<div class="stat-value" id="referralEarnings">0</div>
<div class="stat-label">Points Earned</div>
</div>
</div>
<button class="btn-invite" id="inviteBtn">📤 Invite Friends</button>
</div>
</div>
<script src="app.js"></script>
</body>
</html>
