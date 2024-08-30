public with sharing class WC_SearchController {

  @AuraEnabled(cacheable=true)
  public static List<Object> searchWooCommerceData(String objectType, String key) {
      List<Object> results = new List<Object>();

      if (objectType.equalsIgnoreCase('wc_customer__c')) {
          results.addAll(searchCustomers(key));
      } else if (objectType.equalsIgnoreCase('wc_order__c')) {
          results.addAll(searchOrders(key));
      } else if (objectType.equalsIgnoreCase('wc_product__c')) {
          results.addAll(searchProducts(key));
      } else if (objectType.equalsIgnoreCase('wc_inventory__c')){
          results.addAll(searchInventories(key));
      }
        

      System.debug('Search Results: ' + results);
      return results;
  }

  private static List<Object> searchCustomers(String key) {
      List<Object> customerResults = new List<Object>();
      List<WcCustomer> customers = WooCommerceService.getCustomers();
      
      
      for (WcCustomer customer : customers) {
          if (matchesSearchCriteria(customer, key)) {
              Address billingAddress = customer.billing;
              Address shippingAddress = customer.shipping;
              WooCommerceService.populateOrderDetails(customer);
              customerResults.add(new Map<String, Object>{
                  'id' => customer.id,
                  'first_name' => customer.first_name,
                  'last_name' => customer.last_name,
                  'email' => customer.email,
                  'phone' => customer.phone,
                  'date_created' => customer.date_created,
                  'billing_address' => billingAddress.getFormattedAddress(),
                  'shipping_address' => shippingAddress.getFormattedAddress(),
                  'lastOrderDate' =>customer.lastOrderDate,
                  'totalOrders'   => customer.totalOrders
              });
          }
      }
      return customerResults;
  }

  private static List<Object> searchOrders(String key) {
      List<Object> orderResults = new List<Object>();
      List<WcOrder> orders = WooCommerceService.getOrdersByCustomer(Integer.valueOf(key));
      
      for (WcOrder order : orders) {
          Map<String, Object> orderData = new Map<String, Object>();
          orderData.put('id', order.id);
          orderData.put('customer_id', order.customer_id);
          orderData.put('order_number', order.orderNumber);
          orderData.put('status', order.status);
          orderData.put('currency', order.ordercurrency);
          orderData.put('total', order.total);
          orderData.put('payment_method', order.payment_method);
          orderData.put('date_paid', order.date_paid);

          orderResults.add(orderData);
      }
      return orderResults;
  }

  private static List<Object> searchProducts(String key) {
      List<Object> productResults = new List<Object>();
      List<WcProduct> products=WooCommerceService.getProducts();
      
      for (WcProduct product : products) {
        if(product.name.contains(key) ||String.valueOf(product.id).contains(key) || String.valueOf(product.status).contains(key)){
          Map<String, Object> productData = new Map<String, Object>();
          productData.put('id', product.id);
          productData.put('name', product.name);
          productData.put('price', product.price);
          productData.put('stock_quantity', product.stock_quantity);
          productData.put('status',product.status);
          productData.put('total_sales',product.total_sales);
          productData.put('purchasable',product.purchasable);

          // Concatenate category names from category objects
          String categoryNames = '';
          for (WcProductCategory category : product.categories) {
              categoryNames += category.name + ', ';
          }
          
          if (categoryNames.length() > 0) {
            categoryNames = categoryNames.substring(0, categoryNames.length() - 2);
        }
          
          productData.put('category', categoryNames);
          System.debug(categoryNames);
    

          productResults.add(productData);
      }}
      return productResults;
  }

  private static List<Object> searchInventories(String key){
    List<Object> inventoryResult = new List<Object>();
    WCInventory inventory = WooCommerceService.getInventoryById(Integer.valueOf(key));

    
        Map<String, Object> inventoryData = new Map<String, Object>();
        inventoryData.put('id', 'row-0');
        inventoryData.put('product_id', inventory.product_id);
        inventoryData.put('quantity', inventory.wc_availableQuantity);
        inventoryData.put('last_Stock_Update', inventory.wc_lastStockUpdate);
        inventoryData.put('status', inventory.wc_inventory_status);
        inventoryData.put('weight', inventory.wc_weight);
        
        inventoryResult.add(inventoryData);

    return inventoryResult;

  }

  private static List<WcProduct> filterProductsByName(List<WcProduct> products, String key) {
      List<WcProduct> filteredProducts = new List<WcProduct>();
      for (WcProduct product : products) {
          if (product.name != null && product.name.contains(key)) {
              filteredProducts.add(product);
          }
      }
      return filteredProducts;
  }

  private static Boolean matchesSearchCriteria(WcCustomer customer, String key) {
      return customer.email.contains(key) || customer.first_name.contains(key) ||
             customer.last_name.contains(key) || String.valueOf(customer.id).contains(key);
  }



  
  
  





}
