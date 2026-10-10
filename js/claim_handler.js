function openClaimModal(id, maxQty) {
    document.getElementById('modalFoodId').value = id;
    const qtyInput = document.getElementById('claimed_quantity');
    qtyInput.max = maxQty;
    qtyInput.value = 1;
    document.getElementById('claimModal').classList.remove('hidden');
}

function closeClaimModal() {
    document.getElementById('claimModal').classList.add('hidden');
}

document.getElementById('claimForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        food_id: document.getElementById('modalFoodId').value,
        volunteer_name: document.getElementById('volunteer_name').value,
        volunteer_phone: document.getElementById('volunteer_phone').value,
        claimed_quantity: document.getElementById('claimed_quantity').value
    };

    const res = await API.claimFood(payload);
    if (res.success) {
        alert(res.message);
        window.location.reload();
    } else {
        alert(res.error);
    }
});