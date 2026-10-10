# Food Rescue Board (olympus_js)

Pure HTML + CSS + JavaScript version. No server, no Python, no install.

## Run
Double-click `index.html`.

## Structure
```
olympus_js/
├── index.html        Home page + live stats
├── available.html    Browse, filter and claim food
├── donate.html       Post surplus food
├── claims.html       Claim history
├── css/
│   ├── global.css
│   ├── navbar.css
│   ├── cards.css
│   └── forms.css
└── js/
    ├── api.js            Data layer (localStorage) - replaces the old backend
    ├── expiry_timer.js   Live countdown timers
    ├── claim_handler.js  Claim modal logic
    ├── filter.js         Renders cards + dietary filter
    └── donate_form.js    Submits the donate form
```

## Notes
- Data is stored in your browser (localStorage), per browser/device.
- Reset to sample data: press F12, run `localStorage.clear()` in the console, refresh.
