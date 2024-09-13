public with sharing class SynchCustomer {
    @AuraEnabled(cacheable=true)
    public static String synchronizeCustomer(String recordId) {
        System.debug('id: ' + recordId);

        // Ensure recordId is a valid Decimal format
        Decimal id;
        try {
            id = Decimal.valueOf(recordId);
        } catch (Exception e) {
            return 'Error: Invalid ID format.';
        }

        // Retrieve the customer record by WC_id__c
        List<wc_customer__c> customers = [SELECT Id FROM wc_customer__c WHERE WC_id__c = :id LIMIT 1];
        
        if (customers.isEmpty()) {
            return 'Error: Customer not found in Salesforce for the provided ID.';
        }

        wc_customer__c customer = customers[0];
        Id customerId = customer.Id; 
        System.debug('customer Id: ' + customerId);

        // Call the asynchronous method
        synchronizeCustomerAsync(customerId);

        return 'Synchronization started successfully';
    }

    @future(callout=true)
    public static void synchronizeCustomerAsync(Id customerId) {
        // Call the method that you cannot modify
        String result = WooCommerceCustomerSyncController.synchronizeCustomerFromWooCommerce(customerId);
        System.debug('Result from WooCommerce sync: ' + result);
    }
}
