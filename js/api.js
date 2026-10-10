/* ------------------------------------------------------------------
   api.js  -  replaces the old Flask + SQLite backend.
   All data lives in the browser (localStorage), so no server needed.
   Same function names as before: getFood, postFood, claimFood, getClaims
------------------------------------------------------------------- */
const DB_KEYS = { food: 'olympus_food_listings', claims: 'olympus_claims' };

function pad(n) { return String(n).padStart(2, '0'); }

function formatDateTime(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function parseDateTime(str) {
    return new Date(str.replace(' ', 'T'));
}

function loadTable(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (e) { return []; }
}

function saveTable(key, rows) {
    localStorage.setItem(key, JSON.stringify(rows));
}

/* Decides AVAILABLE / EXPIRED / FULLY_CLAIMED (was expiry_service.py) */
function evaluateListingStatus(item) {
    if (item.remaining_quantity <= 0) return 'FULLY_CLAIMED';
    if (new Date() >= parseDateTime(item.expiry_at)) return 'EXPIRED';
    return 'AVAILABLE';
}

/* Sample data on first visit (was seed_data.py) */
function seedIfEmpty() {
    if (localStorage.getItem(DB_KEYS.food) !== null) return;
    const now = new Date();
    const inMin = (m) => formatDateTime(new Date(now.getTime() + m * 60000));
    const posted = formatDateTime(now);
    saveTable(DB_KEYS.food, [
        { id: 1, food_name: 'Veg Biryani & Raita', restaurant_name: 'Green Leaf Eatery', total_quantity: 20, remaining_quantity: 20, dietary_tag: 'Vegetarian', pickup_address: '124 Park Road', contact_phone: '9876543210', posted_at: posted, expiry_at: inMin(180), status: 'AVAILABLE' },
        { id: 2, food_name: 'Artisan Cheese Sandwiches', restaurant_name: 'Daily Crust Bakery', total_quantity: 12, remaining_quantity: 8, dietary_tag: 'Contains Dairy', pickup_address: '5th Avenue Mall', contact_phone: '9876543211', posted_at: posted, expiry_at: inMin(45), status: 'AVAILABLE' },
        { id: 3, food_name: 'Vegan Quinoa Bowl', restaurant_name: 'Pure Harvest Cafe', total_quantity: 15, remaining_quantity: 15, dietary_tag: 'Vegan', pickup_address: '89 Green Street', contact_phone: '9876543212', posted_at: posted, expiry_at: inMin(-10), status: 'EXPIRED' }
    ]);
    saveTable(DB_KEYS.claims, []);
}
seedIfEmpty();

const API = {
    /* GET /api/food */
    async getFood() {
        const listings = loadTable(DB_KEYS.food);
        listings.forEach(item => { item.status = evaluateListingStatus(item); });
        saveTable(DB_KEYS.food, listings);
        return listings.slice().sort((a, b) => b.id - a.id);
    },

    /* POST /api/food */
    async postFood(data) {
        const listings = loadTable(DB_KEYS.food);
        const id = listings.reduce((m, i) => Math.max(m, i.id), 0) + 1;
        listings.push({
            id,
            food_name: data.food_name,
            restaurant_name: data.restaurant_name,
            total_quantity: data.quantity,
            remaining_quantity: data.quantity,
            dietary_tag: data.dietary_tag,
            pickup_address: data.pickup_address,
            contact_phone: data.contact_phone,
            posted_at: formatDateTime(new Date()),
            expiry_at: data.expiry_at,
            status: 'AVAILABLE'
        });
        saveTable(DB_KEYS.food, listings);
        return { success: true, id, message: 'Food posted successfully!' };
    },

    /* POST /api/claim */
    async claimFood(data) {
        const listings = loadTable(DB_KEYS.food);
        const food = listings.find(i => i.id === Number(data.food_id));
        if (!food) return { error: 'Food listing not found' };

        const qty = parseInt(data.claimed_quantity, 10) || 1;
        const status = evaluateListingStatus(food);

        if (status === 'EXPIRED') return { error: 'Cannot claim food. Safe consumption time has expired!' };
        if (qty < 1) return { error: 'Quantity must be at least 1.' };
        if (food.remaining_quantity < qty) return { error: `Only ${food.remaining_quantity} items remaining!` };

        food.remaining_quantity -= qty;
        food.status = food.remaining_quantity === 0 ? 'FULLY_CLAIMED' : 'AVAILABLE';
        saveTable(DB_KEYS.food, listings);

        const claims = loadTable(DB_KEYS.claims);
        const id = claims.reduce((m, c) => Math.max(m, c.id), 0) + 1;
        claims.push({
            id,
            food_id: food.id,
            volunteer_name: data.volunteer_name,
            volunteer_phone: data.volunteer_phone,
            claimed_quantity: qty,
            claimed_at: formatDateTime(new Date())
        });
        saveTable(DB_KEYS.claims, claims);

        return { success: true, message: `Successfully claimed ${qty} meal(s)!` };
    },

    /* GET /api/claims */
    async getClaims() {
        const listings = loadTable(DB_KEYS.food);
        return loadTable(DB_KEYS.claims)
            .map(c => {
                const f = listings.find(i => i.id === c.food_id) || {};
                return { ...c, food_name: f.food_name, restaurant_name: f.restaurant_name, pickup_address: f.pickup_address };
            })
            .sort((a, b) => b.id - a.id);
    }
};
