public with sharing class ObjectDataController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getObjectRecords(String objectName) {
        Map<String, Object> result = new Map<String, Object>();
        String query = 'SELECT ';
        String fields;

        // Définir les champs en fonction de l'objet
        switch on objectName {
            when 'wc_customer__c' {
                fields = 'Id, WC_firstName__c, WC_lastName__c, WC_email__c, WC_phone__c, WC_lastOrderDate__c, WC_totalOrders__c, Billing_Address__c';
            }
            when 'wc_Order__c' {
                fields = 'Id, WC_number__c, Customer__c, WC_status__c, WC_currency__c, WC_total__c, WC_paymentMethod__c, WC_datePaid__c';
            }
            when 'wc_OrderItem__c' {
                fields = 'Id, wc_orderId__c, wc_name__c, wc_quantity__c, wc_UnitPrice__c, wc_subtotal__c, wc_total__c';
            }
            when 'wc_Inventory__c' {
                fields = 'Id, Name, wc_productId__c, wc_availableQuantity__c, wc_lastStockUpdate__c, wc_inventoryStatus__c, wc_weight__c';
            }
            when 'wc_Product__c' {
                fields = 'Id, wc_productName__c, wc_category__c, wc_price__c, wc_stockQuantity__c, wc_status__c, wc_totalSales__c';
            }
            when else {
                throw new IllegalArgumentException('Invalid object name: ' + objectName);
            }
        }

        query += fields + ' FROM ' + String.escapeSingleQuotes(objectName);

        try {
            List<SObject> records = Database.query(query);
            System.debug('Records retrieved: ' + records);
            result.put('records', records);
        } catch (Exception e) {
            System.debug('Exception: ' + e.getMessage());
            throw new AuraHandledException('Error fetching records: ' + e.getMessage());
        }

        return result;
    }
}
