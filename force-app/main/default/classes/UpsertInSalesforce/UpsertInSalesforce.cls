public with sharing class UpsertInSalesforce {
    @AuraEnabled
  public static String updateInSalesforce(List<Map<String, Object>> data, String objectType) {
      List<SObject> recordsToUpsert = new List<SObject>();
  
      if (!Schema.sObjectType.wc_customer__c.isCreateable() || !Schema.sObjectType.wc_customer__c.isUpdateable()) {
          throw new AuraHandledException('L\'utilisateur n\'a pas les autorisations nécessaires pour créer ou mettre à jour les enregistrements clients.');
      }
  
      for (Map<String, Object> recordData : data) {
          System.debug('Type d\'objet : ' + objectType);
          System.debug('Contenu de recordData : ' + recordData);
          System.debug('keys'+ recordData.keySet());
          if (objectType == 'wc_customer__c') {
              wc_customer__c customerRecord;
              List<wc_customer__c> existingCustomers = new List<wc_customer__c>();
               System.debug('idValue ' + recordData.get('id'));
               String idValue = (String)recordData.get('id');
               Decimal externalId=Decimal.valueOf(idValue);
               System.debug('externalId ' + externalId);
                 existingCustomers = [SELECT Id, WC_firstName__c , WC_lastName__c , WC_email__c , WC_phone__c FROM wc_customer__c WHERE WC_id__c = :externalId LIMIT 1];
                  if (!existingCustomers.isEmpty()) {
                      customerRecord = existingCustomers[0];
                  } else {
                      customerRecord = new wc_customer__c();
                      customerRecord.WC_id__c = externalId; // Utiliser le champ de clé externe pour stocker l'ID
                  }
                  // Gestion des champs modifiés seulement
                    customerRecord.WC_firstName__c = (String)recordData.get('first_name');    
                    customerRecord.WC_lastName__c = (String)recordData.get('last_name');
                    customerRecord.WC_email__c=(String)recordData.get('email');
                    customerRecord.WC_phone__c = (String)recordData.get('phone');
                    customerRecord.WC_totalOrders__c = (Decimal)recordData.get('totalOrders');
                    String lastOrderDate = (String)recordData.get('lastOrderDate');
                    String dateString = (String) recordData.get('date_created');

                    if (String.isNotBlank(dateString)) {
                        try {
                            // Convertir le format ISO 8601 en un format compatible Apex
                            dateString = dateString.replace('T', ' ').replace('Z', '');
                            Datetime dateTimeValue1 = Datetime.valueOf(dateString); 
                            customerRecord.WC_CreatedDate__c = dateTimeValue1;


                            lastOrderDate = lastOrderDate.replace('T', ' ').replace('Z', '');
                            Date dateTimeValue2 = Date.valueOf(lastOrderDate);
                            customerRecord.WC_lastOrderDate__c = dateTimeValue2;
                            
                        } catch (Exception e) {
                            // Gérer les exceptions de parsing ou journaliser les erreurs si nécessaire
                            System.debug('Erreur de conversion de la date : ' + e.getMessage());
                        }
                    } else {
                        // Gérer les cas où dateString est vide ou null
                        System.debug('La chaîne de date est vide ou null.');
                    }
  
              System.debug('customerRecord: ' + customerRecord);
              recordsToUpsert.add(customerRecord);
          }
          if(objectType == 'wc_product__c'){
           wc_Product__c productRecord;
           List<wc_Product__c> existingProducts = new List<wc_Product__c>();
           System.debug('idValue ' + recordData.get('id'));
           String idValue = (String)recordData.get('id');
           Decimal externalId=Decimal.valueOf(idValue);
           System.debug('externalId ' + externalId);
           existingProducts = [SELECT Id, wc_productName__c, wc_category__c, wc_price__c, wc_stockQuantity__c, wc_status__c, wc_totalSales__c , wc_purchaseable__c FROM wc_Product__c WHERE wc_id__c = :externalId];
           if (!existingProducts.isEmpty()) {
            productRecord = existingProducts[0];
           } else {
            productRecord = new wc_Product__c();
            productRecord.wc_id__c = externalId; 
           }
            productRecord.wc_productName__c=(String)recordData.get('name');
            productRecord.wc_category__c=(String)recordData.get('category');
            productRecord.wc_price__c = Decimal.valueOf((String)recordData.get('price'));
            productRecord.wc_stockQuantity__c = Decimal.valueOf((String)recordData.get('stock_quantity'));
            productRecord.wc_status__c = (String)recordData.get('status');
            productRecord.wc_totalSales__c =(Decimal)recordData.get('total_sales') ;
            productRecord.wc_purchaseable__c = (String)recordData.get('purchaseable');
            
            System.debug('productRecord: ' + productRecord);
            recordsToUpsert.add(productRecord);

          }

          if(objectType == 'wc_inventory__c'){
            wc_Inventory__c inventoryRecord;
            System.debug('idProductValue : ' + recordData.get('product_id'));
        
            // Convert product_id to Decimal, then to String as the external ID
            Decimal idProduct = (Decimal)recordData.get('product_id');
            String externalId = String.valueOf(idProduct);
            System.debug('externalId: ' + externalId);
        
            // Perform the query using a list to handle cases where no rows are returned
            List<wc_Inventory__c> existingInventories = [
                SELECT wc_productId__c, wc_inventoryStatus__c, wc_availableQuantity__c, wc_lastStockUpdate__c, wc_weight__c 
                FROM wc_Inventory__c 
                WHERE wc_productId__c = :externalId
            ];
            wc_Product__c productRecord = [SELECT Id FROM wc_Product__c WHERE wc_id__c = : Decimal.valueOf(externalId) LIMIT 1];
            String productId = productRecord.Id; // Retrieve the ID from the queried record
        
            System.debug('Product ID: ' + productId);      
            if (!existingInventories.isEmpty()) {
                inventoryRecord = existingInventories[0]; 
            } else {
                inventoryRecord = new wc_Inventory__c(); 
                inventoryRecord.wc_productId__c = productId;
            }
        
            // Update the fields with the incoming data
            inventoryRecord.wc_availableQuantity__c = Decimal.valueOf((String)recordData.get('quantity'));
            inventoryRecord.wc_inventoryStatus__c = (String)recordData.get('status');
            inventoryRecord.wc_weight__c = Decimal.valueOf((String)recordData.get('weight'));
            inventoryRecord.wc_lastStockUpdate__c=Date.valueOf((String)recordData.get('last_Stock_Update'));
        
            System.debug('inventoryRecord: ' + inventoryRecord);
            recordsToUpsert.add(inventoryRecord);
        }

        if (objectType == 'wc_order__c') {
            wc_Order__c orderRecord;
            List<wc_Order__c> existingOrders = new List<wc_Order__c>();
             System.debug('idValue ' + recordData.get('id'));
             String idValue = (String)recordData.get('id');
             Decimal externalId=Decimal.valueOf(idValue);
             System.debug('externalId ' + externalId);
               existingOrders = [SELECT Id, Customer__c , WC_number__c , WC_status__c , wc_currency__c ,  WC_totale__c , WC_paymentMethod__c , WC_DatePaid__c FROM wc_Order__c WHERE WC_id__c = :externalId LIMIT 1];
                if (!existingOrders.isEmpty()) {
                    orderRecord = existingOrders[0];
                } else {
                    orderRecord = new wc_Order__c();
                    orderRecord.WC_id__c = externalId; // Utiliser le champ de clé externe pour stocker l'ID
                }
                   
                  orderRecord.WC_number__c = Decimal.valueOf((String)recordData.get('order_number'));
                  orderRecord.WC_status__c=(String)recordData.get('status');
                  orderRecord.wc_currency__c  = (String)recordData.get('currency');
                  orderRecord.WC_totale__c = Decimal.valueOf((String)recordData.get('total'));
                  orderRecord.WC_paymentMethod__c  = (String)recordData.get('payment_method');
                  String dateString = (String) recordData.get('date_paid');

                  if (String.isNotBlank(dateString)) {
                      try {
                          // Convertir le format ISO 8601 en un format compatible Apex
                          dateString = dateString.replace('T', ' ').replace('Z', '');
                          Datetime dateTimeValue = Datetime.valueOf(dateString); 
                          orderRecord.WC_DatePaid__c = dateTimeValue;


            
                      } catch (Exception e) {
                          // Gérer les exceptions de parsing ou journaliser les erreurs si nécessaire
                          System.debug('Erreur de conversion de la date : ' + e.getMessage());
                      }
                  } else {
                      // Gérer les cas où dateString est vide ou null
                      System.debug('La chaîne de date est vide ou null.');
                  }

            System.debug('orderRecord: ' + orderRecord);
            recordsToUpsert.add(orderRecord);
        }
        
          
      }
  
      if (!recordsToUpsert.isEmpty()) {
          try {
              upsert recordsToUpsert;
              return 'Upsert réussi';
          } catch (DmlException e) {
              System.debug('Erreur lors de l\'upsert : ' + e.getMessage());
              throw new AuraHandledException('Erreur lors de l\'insertion ou de la mise à jour : ' + e.getMessage());
          }
      }
  
      return 'Aucun enregistrement à traiter';
  }
}