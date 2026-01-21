let allFoods = [];

document.addEventListener('DOMContentLoaded', () => {
	checkLoginStatus();
});

// --- 認証・初期化 ---
async function checkLoginStatus() {
	try {
		const response = await fetch('/api/auth/status');
		const data = await response.json();
		const isLoggedIn = data.isLoggedIn;

		const loginLink = document.getElementById('login-link');
		const userInfo = document.getElementById('user-info');
		const addForm = document.getElementById('add-form-container');
		const usernameSpan = document.getElementById('display-username');
		const dateInput = document.getElementById('expiryDate');

		if (dateInput) {
			dateInput.addEventListener('change', function() {
				this.classList.toggle('has-value', !!this.value);
			});
		}

		if (isLoggedIn) {
			if (loginLink) loginLink.style.display = 'none';
			if (userInfo) userInfo.style.display = 'flex';
			if (usernameSpan) usernameSpan.textContent = data.username;
			if (addForm) addForm.style.display = 'block';
			loadFoods();
		} else {
			if (loginLink) loginLink.style.display = 'block';
			if (userInfo) userInfo.style.display = 'none';
			if (addForm) addForm.style.display = 'none';
			displayFoods([]);
		}
	} catch (error) {
		console.error('認証ステータスの取得失敗:', error);
		displayFoods([]);
	}
}

async function handleLogout() {
	if (!confirm('ログアウトしますか？')) return;
	try {
		await fetch('/logout', { method: 'POST' });
		window.location.href = "/login";
	} catch (error) {
		console.error('ログアウト失敗:', error);
	}
}

// --- データ取得・表示 ---
async function loadFoods() {
	try {
		const response = await fetch('/api/foods');
		allFoods = await response.json();
		allFoods.sort((a, b) => a.id - b.id);
		displayFoods(allFoods);
	} catch (error) {
		console.error('データの取得に失敗しました', error);
	}
}

function displayFoods(foods) {
	const list = document.getElementById('foodList');
	if (!list) return;
	list.innerHTML = '';
	document.getElementById('totalCount').textContent = foods.length;

	foods.forEach(food => {
		const card = document.createElement('div');
		card.id = `food-card-${food.id}`;
		card.className = `food-card ${food.status}`;

		const stockMessage = food.quantity <= 0
			? `<p style="color: red; font-weight: bold;">在庫がなくなりました！</p>`
			: `<p class="status-msg"><strong>${food.statusMessage}</strong></p>`;

		const todayStr = new Date().toISOString().split('T')[0];

		card.innerHTML = `
            <div class="card-header">
                <div class="category-badge">${food.category}</div>
                <label>
                    <input type="checkbox" ${food.needsRestock ? 'checked' : ''} 
                           onchange="updateFoodInfo(${food.id}, {needsRestock: this.checked})"> 買い増す
                </label>
            </div>
            <h3>${food.name}</h3>
            <p class="expiry-text">
                現在の期限：<strong>${food.expiryDate}</strong><br>
                <div class="date-edit-group">
                    <input type="date" class="edit-date" 
                           min="${todayStr}" 
                           id="input-date-${food.id}"
                           onfocus="this.classList.add('has-value')">
                    <button class="save-date-btn" onclick="manualDateUpdate(${food.id})">期限更新</button>
                </div>
            </p>
            <div class="quantity-control">
                <span>在庫数：</span>
                <input type="number" value="${food.quantity}" min="0" 
                       onchange="updateFoodInfo(${food.id}, {quantity: parseInt(this.value)})">
            </div>
            <div class="status-msg-container">
                ${stockMessage}
            </div>
            <button class="delete-btn" onclick="deleteFood(${food.id})">リストから削除</button>
        `;
		list.appendChild(card);
	});
}

// --- 検索・フィルタ ---
function filterFoods() {
	const query = document.getElementById('searchInput').value.toLowerCase();
	const filters = {
		restock: document.getElementById('filterRestock').checked,
		noStock: document.getElementById('filterNoStock').checked,
		warning: document.getElementById('filterWarning').checked,
		danger: document.getElementById('filterDanger').checked
	};

	const isAnyFilterActive = Object.values(filters).some(v => v);

	const filtered = allFoods.filter(food => {
		const matchesQuery = (food.name && food.name.toLowerCase().includes(query)) ||
			(food.category && food.category.toLowerCase().includes(query));

		if (!isAnyFilterActive) return matchesQuery;

		const matchesFilters = (filters.restock && food.needsRestock) ||
			(filters.noStock && food.quantity <= 0) ||
			(filters.warning && food.status === 'warning') ||
			(filters.danger && food.status === 'danger');

		return matchesQuery && matchesFilters;
	});
	displayFoods(filtered);
}

// --- データ更新操作 ---
async function addFood() {
	const nameInput = document.getElementById('foodName');
	const quantityInput = document.getElementById('addQuantity');
	const dateInput = document.getElementById('expiryDate');

	const name = nameInput.value.trim();
	const quantity = parseInt(quantityInput.value);
	const date = dateInput.value;

	if (!name || !date) {
		alert("食材名と期限を入力してください");
		return;
	}

	if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
		alert("期限に過去の日付は設定できません");
		return;
	}

	try {
		const response = await fetch('/api/foods', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, quantity, expiryDate: date, category: document.getElementById('category').value })
		});

		if (response.ok) {
			loadFoods();
			nameInput.value = '';
			dateInput.value = '';
			quantityInput.value = 1;
			dateInput.classList.remove('has-value');
		}
	} catch (error) {
		alert("通信エラーが発生しました");
	}
}

async function updateFoodInfo(id, updateData) {
	if (updateData.quantity !== undefined && updateData.quantity < 0) {
		alert("0より小さい値は入力できません");
		return;
	}

	try {
		const response = await fetch(`/api/foods/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updateData)
		});

		if (response.ok) {
			setTimeout(() => { loadFoods(); }, 150);
		} else if (response.status === 403) {
			window.location.href = "/login";
		}
	} catch (error) {
		console.error('通信エラー:', error);
	}
}

async function deleteFood(id) {
	if (!confirm('本当に使い切りましたか？')) return;
	try {
		const response = await fetch(`/api/foods/${id}`, { method: 'DELETE' });
		if (response.ok) loadFoods();
	} catch (error) {
		console.error('削除失敗:', error);
	}
}

async function manualDateUpdate(id) {
	const dateInput = document.getElementById(`input-date-${id}`);
	const newDate = dateInput.value;
	if (!newDate) {
		alert("日付を選択してください");
		return;
	}
	await updateFoodInfo(id, { expiryDate: newDate });
}