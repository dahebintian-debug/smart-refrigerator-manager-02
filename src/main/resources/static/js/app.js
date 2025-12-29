// 1. ログイン状態を保持するグローバル変数
let isLoggedIn = false;
let allFoods = [];

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
	// まずログイン状態を確認し、その中で loadFoods() を呼び出す
	checkLoginStatus();
});

/**
 * ログイン状態を確認し、UIを切り替える
 */
async function checkLoginStatus() {
	try {
		const response = await fetch('/api/auth/status');
		const data = await response.json();
		isLoggedIn = data.isLoggedIn; // 状態を保存

		// index.htmlの要素を取得
		const loginLink = document.getElementById('login-link');
		const userInfo = document.getElementById('user-info');
		const addForm = document.getElementById('add-form-container');
		const usernameSpan = document.getElementById('display-username');

		if (isLoggedIn) {
			// ログイン中：名前を出してフォームを表示
			if (loginLink) loginLink.style.display = 'none';
			if (userInfo) userInfo.style.display = 'flex';
			if (usernameSpan) usernameSpan.textContent = data.username;
			if (addForm) addForm.style.display = 'block';
		} else {
			// 未ログイン：ログインリンクを出してフォームを隠す
			if (loginLink) loginLink.style.display = 'block';
			if (userInfo) userInfo.style.display = 'none';
			if (addForm) addForm.style.display = 'none';
		}

		// ログイン状態が確定してから食材を読み込む
		loadFoods();
		
	} catch (error) {
		console.error('認証ステータスの取得失敗:', error);
		// エラー時は安全のため未ログインとして扱う
		loadFoods();
	}
}

/**
 * ログアウト処理
 */
async function handleLogout() {
	if (!confirm('ログアウトしますか？')) return;
	try {
		await fetch('/logout', { method: 'POST' });
		window.location.href = "/login";
	} catch (error) {
		console.error('ログアウト失敗:', error);
	}
}

/**
 * 食材一覧をAPIから取得
 */
async function loadFoods() {
	try {
		const response = await fetch('/api/foods');
		allFoods = await response.json();
		displayFoods(allFoods);
	} catch (error) {
		console.error('データの取得に失敗しました', error);
	}
}

/**
 * 食材一覧を画面に表示する（ボタンの出し分けを含む）
 */
function displayFoods(foods) {
	const totalCountElement = document.getElementById('totalCount');
	if (totalCountElement) totalCountElement.textContent = foods.length;

	const list = document.getElementById('foodList');
	if (!list) return;
	list.innerHTML = '';

	foods.forEach(food => {
		const card = document.createElement('div');

		// --- 期限判定ロジック ---
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const expiry = new Date(food.expiryDate);
		const diffTime = expiry - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		let statusClass = 'safe';
		let message = `あと ${diffDays} 日`;

		if (diffDays <= 0) {
			statusClass = 'danger';
			message = "期限切れ！急いで！";
		} else if (diffDays <= 3) {
			statusClass = 'warning';
			message = "そろそろ危ない（あと3日以内）";
		}

		card.className = `food-card ${statusClass}`;

		// ★ ログインしている場合のみ「使い切った」ボタンを作成
		const deleteBtnHtml = isLoggedIn
			? `<button class="delete-btn" onclick="deleteFood(${food.id})">使い切った</button>`
			: '';

		card.innerHTML = `
            <div class="category-badge">${food.category}</div>
            <h3>${food.name}</h3>
            <p class="expiry-text">期限: ${food.expiryDate}</p>
            <p class="status-msg"><strong>${message}</strong></p>
            ${deleteBtnHtml}
        `;
		list.appendChild(card);
	});
}

/**
 * 検索フィルタリング
 */
function filterFoods() {
	const query = document.getElementById('searchInput').value.toLowerCase();
	const filtered = allFoods.filter(food =>
		food.name.toLowerCase().includes(query)
	);
	displayFoods(filtered);
}

/**
 * 食材追加
 */
async function addFood() {
	const name = document.getElementById('foodName').value.trim();
	const date = document.getElementById('expiryDate').value;
	const category = document.getElementById('category').value;

	if (!name || !date) {
		alert("食材名と期限を入力してください");
		return;
	}

	const foodData = { name, expiryDate: date, category };

	try {
		const response = await fetch('/api/foods', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(foodData)
		});

		if (response.ok) {
			loadFoods();
			document.getElementById('foodName').value = '';
			document.getElementById('expiryDate').value = '';
		} else {
			alert("権限がないか、登録に失敗しました");
		}
	} catch (error) {
		alert("通信エラーが発生しました");
	}
}

/**
 * 食材削除
 */
async function deleteFood(id) {
	if (!confirm('本当に使い切りましたか？')) return;

	try {
		const response = await fetch(`/api/foods/${id}`, { method: 'DELETE' });
		if (response.ok) {
			loadFoods();
		} else {
			alert("削除権限がありません");
		}
	} catch (error) {
		console.error('削除失敗:', error);
	}
}
