// Quick utility to add test products to Firestore
// Run this in browser console on the deployed app

async function addTestProducts() {
  const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const { db } = await import('/src/config/firebase.js');
  
  const testProducts = [
    {
      gtin: '5000112576009',
      productName: 'Test Product - Coca Cola',
      brand: 'Coca-Cola',
      category: 'Beverages'
    },
    {
      gtin: '4006809087906',
      productName: 'Test Product - Nivea Cream',
      brand: 'Nivea',
      category: 'Personal Care'
    },
    {
      gtin: '8076809514118',
      productName: 'Test Product - Nutella',
      brand: 'Ferrero',
      category: 'Food'
    }
  ];

  for (const product of testProducts) {
    await setDoc(doc(db, 'products', product.gtin), product);
    console.log(`✅ Added: ${product.productName} (${product.gtin})`);
  }
  
  console.log('✅ All test products added!');
  console.log('Try scanning these GTINs:');
  testProducts.forEach(p => console.log(`- ${p.gtin}: ${p.productName}`));
}

// Run it
addTestProducts();
