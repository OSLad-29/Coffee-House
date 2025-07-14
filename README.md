# The Coffee House Digital System

Welcome to **The Coffee House** web-based management system — a lightweight, fully responsive solution designed for small coffee shops to digitize their menu, ordering, and admin operations.

----

## 🚀 Features

### For Customers:

- Interactive homepage with hero section and brand features
- Digital menu with image-rich categories and add-to-cart functionality
- Order placement with live summary and checkout form
- Reservation form with real-time validation

### For Admins:

- Secure login page (username: `admin`, password: `coffee123`)
- Dashboard showing today's orders, revenue, and pending reservations
- Reservations management (confirm/cancel functionality)
- Analytics dashboard with sales stats and popular items (powered by Chart.js)

---

## 🧰 Tech Stack

- **HTML5, CSS3, JavaScript**
- **Chart.js** for analytics visualization
- **localStorage** for storing orders, menu items, reservations, and admin state
- No backend or database required — deploy and run instantly

---

## 📁 Project Structure

```
coffee_house_site/
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── menu.js
│   ├── order.js
│   ├── reservation.js
│   ├── admin.js
│   └── auth.js
├── admin/
│   ├── dashboard.html
│   ├── login.html
│   ├── analytics.html
│   └── reservations.html
├── index.html
├── menu.html
├── order.html
└── reservation.html
```

---

## 🛠 How to Use

1. Open `index.html` in any modern browser to start.
2. Visit the `menu.html` page to simulate a customer order.
3. Place an order via `order.html` or make a reservation via `reservation.html`.
4. For admin access:
   - Go to `admin/login.html`
   - Use credentials: `admin / coffee123`
   - Navigate to the dashboard, analytics, or reservations pages

---

## 📦 Deployment

Live Demo: [https://coffee-house-og.netlify.app](https://coffee-house-og.netlify.app)

This project runs entirely in the browser. You can:

- Host it on static site platforms (e.g., GitHub Pages, Netlify, Vercel)
- Run locally without a server

---

## 📈 Future Enhancements

- Backend integration (Node.js / Firebase)
- Email confirmations
- Customer login & order history
- Inventory tracking and notifications

---

## 📄 License

This project is provided for educational and demonstration purposes. Customize freely for your coffee business!

