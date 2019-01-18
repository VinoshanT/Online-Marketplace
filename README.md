# Online Marketplace Documentation

## Instructions
  1. Navigate to online-marketplace folder
  2. Run the following commands
      ```
      npm install
      node index.js
      ```

## Online Marketplace REST API

### Create product

```
curl -X POST -H "Content-Type: application/json" -d "{\"title\":\"hammer\", \"price\":4.99, \"inventory_count\":4}" http://localhost:3000/api/products/ 
```

### Get product by id
```
curl http://localhost:3000/api/products/JIWMQFPo2hzAxts0
```

### Get all products
```
curl http://localhost:3000/api/products/
```

### Get all products with inventory greater than 0
```
curl http://localhost:3000/api/products/?inventory=1
```

### Create a cart 
```
curl -X POST -H "Content-Type: application/json" -d "{\"name\":\"Vino Cart\", \"products\":[], \"total_cost\":0}" http://localhost:3000/api/carts/
```

### Add a product to cart
```
curl -X PUT -H "Content-Type: application/json" -d "{ \"productId\":\"XCj2pSWARxHd0SAQ\"}" http://localhost:3000/api/carts/MyP476g934cUAlwX
```

### Get cart by id
```
curl http://localhost:3000/api/carts/MyP476g934cUAlwX
```

### Complete cart
```
curl -X DELETE http://localhost:3000/api/carts/MyP476g934cUAlwX
```
