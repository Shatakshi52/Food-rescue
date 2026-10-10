let allListings = [];

async function initBoard() {
    allListings = await API.getFood();
    renderBoard(allListings);
}

function renderBoard(items) {
    const grid = document.getElementById('foodGrid');
    if (!grid) return;

    grid.innerHTML = items.map(item => {
        const isExpired = item.status === 'EXPIRED';
        const isClaimed = item.status === 'FULLY_CLAIMED';
        
        return `
            <div class="card ${isExpired ? 'expired' : ''}">
                <span class="tag-badge">${item.dietary_tag}</span>
                <h3>${item.food_name}</h3>
                <p><strong>Eatery:</strong> ${item.restaurant_name}</p>
                <p><strong>Available:</strong> ${item.remaining_quantity} / ${item.total_quantity} meals</p>
                <p class="timer" id="timer-${item.id}">Calculating...</p>
                
                ${!isExpired && !isClaimed ? `
                    <button class="btn btn-primary" onclick="openClaimModal(${item.id},${item.remaining_quantity})">CLAIM</button>
                ` : `
                    <button class="btn" disabled>${isExpired ? 'EXPIRED' : 'FULLY CLAIMED'}</button>
                `}
            </div>
        `;
    }).join('');

    items.forEach(item => {
        startExpiryCountdown(item.expiry_at, `timer-${item.id}`);
    });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const tag = e.target.dataset.tag;
        
        if (tag === 'ALL') {
            renderBoard(allListings);
        } else {
            renderBoard(allListings.filter(i => i.dietary_tag === tag));
        }
    });
});

if (document.getElementById('foodGrid')) {
    initBoard();
}