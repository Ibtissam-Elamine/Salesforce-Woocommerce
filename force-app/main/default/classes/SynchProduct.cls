public with sharing class SynchProduct {
    @AuraEnabled(cacheable=true)
    public static String SynchProduct(String recordId) {
        System.debug('id: ' + recordId);

        // Ensure recordId is a valid Decimal format
        Decimal id;
        try {
            id = Decimal.valueOf(recordId);
        } catch (Exception e) {
            return 'Error: Invalid ID format.';
        }

        // Retrieve the product record by WC_id__c
        List<wc_Product__c> products = [SELECT Id FROM wc_Product__c WHERE wc_id__c  = :id LIMIT 1];
        
        if (products.isEmpty()) {
            return 'Error: product not found in Salesforce for the provided ID.';
        }

        wc_Product__c product = products[0];
        Id productId = product.Id; 
        System.debug('product Id: ' + productId);

        // Call the asynchronous method
        synchronizeProductAsync(productId);
       
        return 'Synchronization started successfully';
    }

    @future(callout=true)
    public static void synchronizeProductAsync(Id productId) {
        // Call the method that you cannot modify
        String result = WooCommerceProductSyncController.synchronizeProductsFromWooCommerce(productId);
        System.debug('Result from WooCommerce sync: ' + result);
    }
    
}