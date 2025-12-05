import './Scanner.css';

const ProductCard = ({ product, inventory }) => {
  if (!product) return null;

  const stockLevel = inventory?.currentQuantity || 0;
  const stockStatus = stockLevel === 0 
    ? 'out-of-stock' 
    : stockLevel < 5 
      ? 'low-stock' 
      : 'in-stock';

  return (
    <div className="product-card">
      <div className="product-card-header">
        <span className={`stock-badge ${stockStatus}`}>
          {stockLevel === 0 ? 'Out of Stock' : stockLevel < 5 ? 'Low Stock' : 'In Stock'}
        </span>
      </div>
      
      <h2 className="product-name">{product.productName || 'Unknown Product'}</h2>
      
      {product.brand && (
        <p className="product-brand">{product.brand}</p>
      )}
      
      <div className="product-details">
        {product.category && (
          <div className="detail-item">
            <span className="detail-label">Category</span>
            <span className="detail-value">{product.category}</span>
          </div>
        )}
        
        <div className="detail-item">
          <span className="detail-label">Current Stock</span>
          <span className={`detail-value stock-quantity ${stockStatus}`}>
            {stockLevel} units
          </span>
        </div>
      </div>
      
      <p className="product-gtin">GTIN: {product.gtin || product.id}</p>
    </div>
  );
};

export default ProductCard;
