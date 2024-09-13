public with sharing class SynchOrder {
    @AuraEnabled(cacheable=true)
    public static String SynchronizeOrder(String recordId) {
        System.debug('id: ' + recordId);

        // Ensure recordId is a valid Decimal format
        Decimal id;
        try {
            id = Decimal.valueOf(recordId);
        } catch (Exception e) {
            return 'Error: Invalid ID format.';
        }

        // Retrieve the order record by WC_id__c
        List<wc_Order__c> orders = [SELECT Id FROM wc_Order__c WHERE WC_id__c = :id LIMIT 1];
        
        if (orders.isEmpty()) {
            return 'Error: order not found in Salesforce for the provided ID.';
        }

        wc_Order__c order = orders[0];
        Id orderId = order.Id; 
        System.debug('order Id: ' + orderId);

        // Call the asynchronous method
        synchronizeOrderAsync(orderId);
       
        return 'Synchronization started successfully';
    }

    @future(callout=true)
    public static void synchronizeOrderAsync(Id ordertId) {
        // Call the method that you cannot modify
        String result = WooCommerceOrderSyncController.synchronizeOrdersFromWooCommerce(ordertId);
        System.debug('Result from WooCommerce sync: ' + result);
    }
}