// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
	loadFoods();
});

let allFoods = [];

// 食材一覧をAPIから取得
async function loadFoods() {
	try {
		const response = await fetch('/api/foods');
		allFoods = await response.json();
		displayFoods(allFoods);
	} catch (error) {
		console.error('データの取得に失敗しました', error);
	}
}

// 画面に表示する
function displayFoods(foods) {
	const totalCountElement = document.getElementById('totalCount');
	totalCountElement.textContent = foods.length;
	
    const list = document.getElementById('foodList');
    list.innerHTML = ''; 

    foods.forEach(food => {
        const card = document.createElement('div');
        
        // --- 期限判定ロジック開始 ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 時間をリセットして日付のみで比較
        const expiry = new Date(food.expiryDate);
        
        // 残り日数を計算 (ミリ秒 → 日数に変換)
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
        // --- 期限判定ロジック終了 ---

        card.className = `food-card ${statusClass}`; // クラスを動的に設定
        
        card.innerHTML = `
            <div class="category-badge">${food.category}</div>
            <h3>${food.name}</h3>
            <p class="expiry-text">期限: ${food.expiryDate}</p>
            <p class="status-msg"><strong>${message}</strong></p>
            <button class="delete-btn" onclick="deleteFood(${food.id})">使い切った</button>
        `;
        list.appendChild(card);
    });
}

function filterFoods() {
    const query = document.getElementById('searchInput').value.toLowerCase(); // 入力された文字
    
    // allFoodsの中から、名前がqueryを含むものだけを抽出（filter）する
    const filtered = allFoods.filter(food => 
        food.name.toLowerCase().includes(query)
    );
    
    displayFoods(filtered); // 絞り込んだリストで画面を再描画！
}

async function addFood() {
	const name = document.getElementById('foodName').value.trim();
	const date = document.getElementById('expiryDate').value;
	const category = document.getElementById('category').value;

	// --- フロントエンド・バリデーション ---
	if(!name){
		alert("食材名を入力してください");
		return;
	}
	if(!date){
		alert("期限を入力してください");
		return;
	}

	const today = new Date().toISOString().split('T')[0];
	if(date < today){
		alert("過去の日付は登録できません");
		return;
	}
	// ------------------------------------

	const foodData = { name, expiryDate:date, category };

	try {
		const response = await fetch('/api/foods', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(foodData)
		});

		if (response.ok) {
			// 登録成功したら入力をクリアして再読み込み
			loadFoods();
			document.getElementById('foodName').value = '';
			document.getElementById('expiryDate').value = '';
		} else {
			// Java側のバリデーションに引っかかった場合
			const errorMsg = await response.text();
			alert("登録に失敗しました:" + errorMsg);
		}
	} catch (error) {
		alert("通信エラーが発生しました");
	}
}

// 食材を削除する
async function deleteFood(id) {
	if (!confirm('本当に使い切りましたか？')) return;

	try {
		await fetch(`/api/foods/${id}`, { method: 'DELETE' });
		loadFoods(); // 再読み込み
	} catch (error) {
		console.error('削除失敗:', error);
	}
}
