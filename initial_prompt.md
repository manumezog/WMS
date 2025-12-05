# WMS Prototype - Initial Development Prompt

## Project Overview

Create a mobile-optimized warehouse management system (WMS) web application for inventory tracking using barcode scanning. The app should be built with a mobile-first approach and structured for easy conversion to a native mobile app later.

## Tech Stack Requirements

- **Frontend Framework**: React (enables easy conversion to React Native)
- **Styling**: Tailwind CSS for responsive mobile design
- **Barcode Scanning**: html5-qrcode library or QuaggaJS for camera-based barcode scanning
- **Barcode Generation**: jsbarcode or react-barcode library
- **State Management**: React Context API or Zustand
- **Database**: Firebase Firestore (real-time database)
- **Authentication**: Firebase Auth (for future multi-user support)
- **Hosting**: Firebase Hosting
- **Charts/Visualization**: Recharts or Chart.js

## Data Architecture

### 1. Product Database (CSV Import → Firestore Collection: `products`)

Based on the GTIN/EAN database structure, create a Firestore collection with fields:

```javascript
{
  gtin: string (document ID),
  productName: string,
  brand: string,
  category: string,
  // Add other relevant fields from your CSV
}
```

**CSV Setup Process:**

1. Download your CSV from Kaggle
2. Create a Firebase project at console.firebase.google.com
3. Use a Node.js script or Firebase Admin SDK to bulk import CSV data into Firestore
4. Alternative: Create an admin panel in the app to upload and parse CSV

### 2. Inventory Collection (Firestore Collection: `inventory`)

```javascript
{
  gtin: string,
  currentQuantity: number,
  lastUpdated: timestamp
}
```

### 3. Transactions Collection (Firestore Collection: `transactions`)

```javascript
{
  transactionId: string (auto-generated),
  gtin: string,
  productName: string,
  type: 'receive' | 'remove' | 'consult',
  quantity: number,
  timestamp: timestamp,
  userId: string (for future use)
}
```

## Core Features & UI Components

### View 1: Scanner View (Default/Home)

**Components:**

- **Camera Scanner**: Full-screen camera viewport with scanning overlay
- **Scan Status Indicator**:
  - Success: Green checkmark with subtle haptic feedback (if available)
  - Failure: Red X with error message
- **Product Info Card**: Displays after successful scan
  - Product name (large, bold)
  - Brand name
  - Current inventory level
  - GTIN number (small text)

**Action Panel** (appears after successful scan):

- **Quantity Input**:
  - Large numeric input field (default: 1)
  - +/- buttons for quick adjustment
  - Max value: 100
  - Input validation (positive integers only)
- **Action Buttons** (3 prominent buttons):
  - **RECEIVE** (Green): Adds quantity to inventory
  - **REMOVE** (Red): Subtracts quantity from inventory
  - **CONSULT** (Blue): Shows current inventory level in a modal/popup

**Additional Features:**

- Manual barcode entry option (keyboard icon button)
- Scan history (last 5 scans, collapsible)
- Re-scan button

### View 2: Dashboard/Analytics View

**Layout Sections:**

1. **KPI Cards** (Top row):

   - Total Products in System
   - Total Inventory Units
   - Products with Stock
   - Low Stock Alerts (< 5 units)

2. **Inventory Level Chart**:

   - Bar chart showing top 10 products by quantity
   - Option to toggle between quantity and value

3. **Recent Transactions Table**:

   - Last 20 transactions
   - Columns: Time, Product, Type (Receive/Remove), Quantity, User
   - Filter by date range and transaction type
   - Search by product name or GTIN

4. **Inventory Distribution**:

   - Pie chart by category (if available in CSV)
   - Donut chart for stock status (In Stock, Low Stock, Out of Stock)

5. **Timeline View**:
   - Line chart showing inventory movements over time (daily/weekly)

### View 3: Barcode Generator

**Three Generation Options:**

1. **Random Product Barcode**:

   - Button: "Generate Random Product"
   - Queries random document from `products` collection
   - Displays barcode image + product info

2. **Random In-Stock Product**:

   - Button: "Generate In-Stock Product"
   - Queries random product where inventory > 0
   - Displays barcode + current quantity

3. **Manual GTIN Entry**:
   - Input field for GTIN/EAN number
   - Validation (13 digits for EAN-13)
   - Generate button
   - Displays barcode + lookup product info if exists

**Barcode Display**:

- Large, scannable barcode image (EAN-13 format)
- Product information below
- Download/Share buttons
- Print option

## Mobile Camera Integration

Use `html5-qrcode` library with these configurations:

```javascript
{
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8]
}
```

**Alternative**: Manual photo upload with barcode detection processing

## Navigation Structure

Bottom navigation bar (mobile-optimized):

- 🔍 Scanner (default)
- 📊 Dashboard
- 🏷️ Generator
- ⚙️ Settings (future)

## Implementation Phases

### Phase 1: Setup & Data Import

1. Initialize Firebase project
2. Set up React app with routing
3. Import CSV data to Firestore `products` collection
4. Configure Firebase Hosting

### Phase 2: Core Scanner Functionality

1. Implement camera access and barcode scanning
2. Product lookup from Firestore
3. Quantity input and action buttons
4. Inventory transactions (Receive/Remove/Consult)

### Phase 3: Dashboard & Analytics

1. Build KPI cards with real-time data
2. Implement charts and visualizations
3. Create transaction history table
4. Add filters and search

### Phase 4: Barcode Generator

1. Implement random product selection
2. Barcode image generation
3. In-stock filtering logic
4. Manual entry form

### Phase 5: Polish & Optimization

1. PWA configuration (offline support, install prompt)
2. Loading states and error handling
3. Responsive design refinements
4. Performance optimization

## Firebase Setup Instructions

1. Create project: `console.firebase.google.com`
2. Enable Firestore Database
3. Enable Firebase Hosting
4. Set Firestore security rules (start in test mode)
5. Create web app and copy Firebase config
6. Install Firebase CLI: `npm install -g firebase-tools`
7. Deploy: `firebase deploy`

## CSV Import Strategy

**Option A**: One-time script

- Create Node.js script using `firebase-admin` SDK
- Parse CSV with `papaparse`
- Batch write to Firestore (500 documents per batch)

**Option B**: In-app admin panel

- Create protected admin route
- CSV file upload component
- Parse and import with progress indicator
- Show import summary (success/failures)

## Key Considerations

- **Offline Support**: Use Firestore's offline persistence
- **Performance**: Index frequently queried fields (gtin, category)
- **Security**: Implement Firebase Auth before production
- **Scalability**: Use pagination for transaction history
- **Validation**: Server-side validation via Cloud Functions for critical operations
- **Error Handling**: Graceful fallbacks for camera permission denials

## Deliverables

1. Fully functional mobile-optimized web app
2. Firebase project configured and deployed
3. Product database imported from CSV
4. All three views operational
5. Basic documentation for deployment and usage
