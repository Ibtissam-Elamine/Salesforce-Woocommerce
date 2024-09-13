public with sharing class CheckController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> checkIfProductExists(Integer recordId) {
        Map<String, Object> result = new Map<String, Object>();

        // Rechercher le produit dans Salesforce par ID
        List<wc_Product__c> products = [SELECT Id, LastSyncDate__c FROM wc_Product__c WHERE wc_id__c = :recordId LIMIT 1];

        if (!products.isEmpty()) {
            wc_Product__c product = products[0];
            result.put('exists', false);
            result.put('LastSyncDate', product.LastSyncDate__c);
        } else {
            result.put('exists', true);
            result.put('LastSyncDate', null);
        }

        return result;
    }




    @AuraEnabled(cacheable=true)
    public static Map<String, Object> checkIfCustomertExists(Integer recordId) {
        Map<String, Object> result = new Map<String, Object>();

        // Rechercher le produit dans Salesforce par ID
        List<wc_customer__c> customers = [SELECT Id, LastSyncDate__c FROM wc_customer__c WHERE WC_id__c = :recordId LIMIT 1];

        if (!customers.isEmpty()) {
            wc_customer__c customer = customers[0];
            result.put('exists', false);
            result.put('LastSyncDate', customer.LastSyncDate__c);
        } else {
            result.put('exists', true);
            result.put('LastSyncDate', null);
        }

        return result;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> checkIfOrdertExists(Integer recordId) {
        Map<String, Object> result = new Map<String, Object>();

        // Rechercher le produit dans Salesforce par ID
        List<wc_Order__c> orders = [SELECT Id, LastSyncDate__c FROM wc_Order__c WHERE WC_id__c = :recordId LIMIT 1];

        if (!orders.isEmpty()) {
            wc_Order__c order = orders[0];
            result.put('exists', false);
            result.put('LastSyncDate', order.LastSyncDate__c);
        } else {
            result.put('exists', true);
            result.put('LastSyncDate', null);
        }

        return result;
    }

}
