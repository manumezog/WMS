# 📦 WMS - Warehouse Management System

A modern, mobile-first warehouse management system with barcode scanning capabilities, real-time inventory tracking, and comprehensive analytics.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.6.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## 🌟 Features

### 📱 Scanner View

- **Live Barcode Scanning** - Real-time camera-based barcode detection using `html5-qrcode`
- **Manual Entry** - Keyboard input for GTIN/EAN codes
- **Product Information Display** - Instant product details with stock levels
- **Inventory Actions**:
  - 📥 **Receive** - Add stock to inventory
  - 📤 **Remove** - Subtract stock from inventory
  - 🔍 **Consult** - View current inventory levels
- **Visual Feedback** - Animated scan frame and haptic feedback

### 📊 Dashboard View

- **KPI Cards** - Real-time metrics at a glance:
  - Total Products in System
  - Total Inventory Units
  - Products with Stock
  - Low Stock Alerts (< 5 units)
- **Top Products** - Display top 10 products by quantity
- **Transaction History** - Recent inventory movements with timestamps
- **Auto-Refresh** - One-click data refresh

### 🏷️ Barcode Generator

- **Random Product Selection** - Generate barcodes for any product in database
- **In-Stock Filter** - Generate barcodes only for products with inventory
- **Manual GTIN Entry** - Create barcodes for custom GTIN codes
- **Download & Print** - Export barcodes as PNG or print directly
- **EAN-13 Format** - Industry-standard barcode generation

### 🎨 Modern UI/UX

- **Mobile-First Design** - Optimized for smartphones and tablets
- **Responsive Layout** - Seamless experience across all devices
- **Smooth Animations** - Polished micro-interactions
- **Touch-Friendly** - Large buttons and intuitive gestures
- **Dark Gradients** - Beautiful purple/blue gradient theme
- **Bottom Navigation** - Easy thumb-accessible navigation

---

## 🚀 Tech Stack

### Frontend

- **React 19.2.0** - Modern UI library with hooks
- **React Router DOM 7.10.1** - Client-side routing
- **Vite** - Lightning-fast build tool and dev server
- **Zustand 5.0.9** - Lightweight state management

### Backend & Database

- **Firebase 12.6.0**
  - Firestore - NoSQL real-time database
  - Authentication - User management (ready for implementation)
  - Hosting - Serverless deployment

### Barcode & Scanning

- **html5-qrcode 2.3.8** - Camera-based barcode scanning
- **jsbarcode 3.12.1** - Barcode generation library

### Data Visualization

- **Recharts 3.5.1** - Charts and graphs (ready for future analytics)

---

## 📁 Project Structure

```
wms/
├── src/
│   ├── components/
│   │   ├── Scanner/          # Scanner view components
│   │   │   ├── ScannerView.jsx
│   │   │   ├── BarcodeScanner.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ActionPanel.jsx
│   │   │   └── Scanner.css
│   │   ├── Dashboard/        # Dashboard components
│   │   │   ├── DashboardView.jsx
│   │   │   └── Dashboard.css
│   │   ├── Generator/        # Barcode generator
│   │   │   ├── GeneratorView.jsx
│   │   │   └── Generator.css
│   │   └── Navigation/       # Bottom navigation
│   │       ├── Navigation.jsx
│   │       └── Navigation.css
│   ├── config/
│   │   └── firebase.js       # Firebase configuration
│   ├── services/
│   │   └── firebaseService.js # Firestore CRUD operations
│   ├── store/
│   │   └── useStore.js       # Zustand state management
│   ├── App.jsx               # Main app component
│   ├── App.css               # App-level styles
│   ├── index.css             # Global styles
│   └── main.jsx              # App entry point
├── public/
├── firebase.json             # Firebase config
├── firestore.rules           # Security rules
├── firestore.indexes.json    # Database indexes
└── package.json
```

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Product database CSV (GTIN/EAN format)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/wms.git
cd wms
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Firebase Hosting
4. Copy your Firebase config to `src/config/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 4️⃣ Import Product Data

You'll need a CSV file with product data containing at least these fields:

- `gtin` - GTIN/EAN barcode number
- `productName` - Product name
- `brand` - Brand name (optional)
- `category` - Product category (optional)

**Note:** CSV files are excluded from git. Download your product database separately.

### 5️⃣ Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running!

---

## 📱 Usage Guide

### Scanning Products

1. **Grant Camera Permission** when prompted
2. **Point camera** at barcode (EAN-13 or EAN-8 format)
3. **View product details** after successful scan
4. **Select action**: Receive, Remove, or Consult
5. **Adjust quantity** using +/- buttons or input field
6. **Confirm action** to update inventory

### Manual Entry

1. Click **"⌨️ Manual Entry"** button
2. Enter **13-digit GTIN** code
3. Click **"Scan"** to lookup product
4. Proceed with inventory actions

### Viewing Dashboard

1. Navigate to **"📊 Dashboard"** tab
2. View **KPI metrics**
3. Check **top products** by inventory
4. Review **recent transactions**
5. Click **"🔄 Refresh"** to update data

### Generating Barcodes

1. Navigate to **"🏷️ Generator"** tab
2. Choose generation method:
   - **🎲 Random Product** - Any product
   - **📦 Random In-Stock** - Only products with inventory
   - **✏️ Manual Entry** - Enter specific GTIN
3. Click **"💾 Download"** to save as PNG
4. Click **"🖨️ Print"** to print directly

---

## 🔒 Firestore Security Rules

Basic security rules are included in `firestore.rules`. For production, implement Firebase Authentication and update rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /inventory/{itemId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## 📊 Data Architecture

### Firestore Collections

#### `products`

```javascript
{
  gtin: "1234567890123",        // Document ID
  productName: "Example Product",
  brand: "Brand Name",
  category: "Category Name"
}
```

#### `inventory`

```javascript
{
  gtin: "1234567890123",        // Document ID
  currentQuantity: 50,
  lastUpdated: Timestamp
}
```

#### `transactions`

```javascript
{
  transactionId: "auto-generated",
  gtin: "1234567890123",
  productName: "Example Product",
  type: "receive" | "remove" | "consult",
  quantity: 10,
  timestamp: Timestamp,
  userId: "user-id-here"
}
```

---

## 🎯 Roadmap

- [ ] **Authentication** - Firebase Auth integration
- [ ] **Multi-user Support** - User roles and permissions
- [ ] **CSV Import UI** - In-app product data upload
- [ ] **Advanced Analytics** - Charts and trends
- [ ] **Export Reports** - PDF/Excel exports
- [ ] **Offline Support** - PWA with offline capabilities
- [ ] **Product Search** - Search by name, category, GTIN
- [ ] **Low Stock Alerts** - Email/push notifications
- [ ] **Transaction Filtering** - Date range and type filters
- [ ] **Batch Operations** - Bulk inventory updates
- [ ] **Mobile Apps** - React Native conversion

---

## 🐛 Known Issues

- CSV data must be imported manually (no UI yet)
- Camera permissions required for scanner (browser-dependent)
- Large datasets may require pagination implementation
- Print functionality varies by browser

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - Barcode scanning library
- [JsBarcode](https://github.com/lindell/JsBarcode) - Barcode generation
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI framework

---

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

<div align="center">
  <strong>Built with ❤️ for efficient warehouse management</strong>
</div>
