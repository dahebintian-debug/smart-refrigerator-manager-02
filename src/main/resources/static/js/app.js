let isLoggedIn = false;
let allFoods = [];

document.addEventListener('DOMContentLoaded', () => {
	checkLoginStatus();
});

async function checkLoginStatus() {
	try {
		const response = await fetch('/api/auth/status');
		const data = await response.json();
		isLoggedIn = data.isLoggedIn; 

		const loginLink = document.getElementById('login-link');
		const userInfo = document.getElementById('user-info');
		const addForm = document.getElementById('add-form-container');
		const usernameSpan = document.getElementById('display-username');

		if (isLoggedIn) {
			if (loginLink) loginLink.style.display = 'none';
			if (userInfo) userInfo.style.display = 'flex';
			if (usernameSpan) usernameSpan.textContent = data.username;
			if (addForm) addForm.style.display = 'block';
		} else {
			if (loginLink) loginLink.style.display = 'block';
			if (userInfo) userInfo.style.display = 'none';
			if (addForm) addForm.style.display = 'none';
		}

		loadFoods();
		
	} catch (error) {
		console.error('認証ステータスの取得失敗:', error);
		loadFoods();
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

async function loadFoods() {
	try {
		const response = await fetch('/api/foods');
		allFoods = await response.json();
		displayFoods(allFoods);
	} catch (error) {
		console.error('データの取得に失敗しました', error);
	}
}

function displayFoods(foods) {
	const totalCountElement = document.getElementById('totalCount');
	if (totalCountElement) totalCountElement.textContent = foods.length;

	const list = document.getElementById('foodList');
	if (!list) return;
	list.innerHTML = '';

	foods.forEach(food => {
		const card = document.createElement('div');
		const statusClass = food.status;
		const message = food.statusMessage;

		card.className = `food-card ${statusClass}`;

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

function filterFoods() {
	const query = document.getElementById('searchInput').value.toLowerCase();
	const filtered = allFoods.filter(food =>
		food.name.toLowerCase().includes(query)
	);
	displayFoods(filtered);
}

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
