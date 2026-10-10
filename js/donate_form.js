document.getElementById('donateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const expiryInput = document.getElementById('expiry_at').value;
    const formattedExpiry = expiryInput.replace('T', ' ') + ':00';

    const payload = {
        restaurant_name: document.getElementById('restaurant_name').value,
        food_name: document.getElementById('food_name').value,
        quantity: parseInt(document.getElementById('quantity').value),
        dietary_tag: document.getElementById('dietary_tag').value,
        expiry_at: formattedExpiry,
        pickup_address: document.getElementById('pickup_address').value,
        contact_phone: document.getElementById('contact_phone').value
    };

    const res = await API.postFood(payload);
    if (res.success) {
        alert("Food posted successfully!");
        window.location.href = 'available.html';
    } else {
        alert("Failed to post food listing.");
    }
});