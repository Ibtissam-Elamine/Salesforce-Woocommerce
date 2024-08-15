import { LightningElement, track } from 'lwc';
import getObjectRecords from '@salesforce/apex/ObjectDataController.getObjectRecords';

export default class ObjectFilter extends LightningElement {
    @track selectedObject = '';
    @track searchKey = '';
    @track tableData = [];
    @track columns = [];
    @track rowValues = {};

    objectOptions = [
        { label: 'Customer', value: 'wc_customer__c' },
        { label: 'Order', value: 'wc_Order__c' },
        { label: 'OrderItem', value: 'wc_OrderItem__c' },
        { label: 'Inventory', value: 'wc_Inventory__c' },
        { label: 'Product', value: 'wc_Product__c' }
    ];

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.fetchData();
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;
        this.fetchData();
    }

    fetchData() {
        if (!this.selectedObject) return;

        getObjectRecords({ objectName: this.selectedObject, searchKey: this.searchKey })
            .then(data => {
                this.tableData = data.records;
                this.columns = this.getColumnsForObject(this.selectedObject);
                this.transformData();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    transformData() {
        this.rowValues = this.tableData.reduce((acc, row) => {
            acc[row.Id] = row;
            return acc;
        }, {});
    }

    getColumnsForObject(objectName) {
        switch (objectName) {
            case 'wc_customer__c':
                return [
                    { label: 'ID', fieldName: 'Id' },
                    { label: 'First Name', fieldName: 'WC_firstName__c' },
                    { label: 'Last Name', fieldName: 'WC_lastName__c' },
                    { label: 'Email', fieldName: 'WC_email__c' },
                    { label: 'Phone', fieldName: 'WC_phone__c' },
                    { label: 'Last Order', fieldName: 'WC_lastOrderDate__c' },
                    { label: 'Total Orders', fieldName: 'WC_totalOrders__c' },
                    { label: 'Billing Address', fieldName: 'Billing_Address__c' }
                ];
            case 'wc_Order__c':
                return [
                    { label: 'ID', fieldName: 'Id' },
                    { label: 'Customer', fieldName: 'Customer__c' },
                    { label: 'Order Number', fieldName: 'WC_number__c' },
                    { label: 'Status', fieldName: 'WC_status__c' },
                    { label: 'Currency', fieldName: 'WC_currency__c' },
                    { label: 'Total', fieldName: 'WC_total__c' },
                    { label: 'Payment Method', fieldName: 'WC_paymentMethod__c' },
                    { label: 'Date Paid', fieldName: 'WC_datePaid__c' }
                ];
            case 'wc_OrderItem__c':
                return [
                    { label: 'Order ID', fieldName: 'wc_orderId__c' },
                    { label: 'Product Name', fieldName: 'wc_name__c' },
                    { label: 'Quantity', fieldName: 'wc_quantity__c' },
                    { label: 'Unit Price', fieldName: 'wc_UnitPrice__c' },
                    { label: 'Subtotal', fieldName: 'wc_subtotal__c' },
                    { label: 'Total', fieldName: 'wc_total__c' }
                ];
            case 'wc_Inventory__c':
                return [
                    { label: 'ID', fieldName: 'Id' },
                    { label: 'Inventory ID', fieldName: 'Name' },
                    { label: 'Product ID', fieldName: 'wc_productId__c' },
                    { label: 'Available Quantity', fieldName: 'wc_availableQuantity__c' },
                    { label: 'Last Stock Update', fieldName: 'wc_lastStockUpdate__c' },
                    { label: 'Status', fieldName: 'wc_inventoryStatus__c' },
                    { label: 'Weight', fieldName: 'wc_weight__c' }
                ];
            case 'wc_Product__c':
                return [
                    { label: 'Id', fieldName: 'Id' },
                    { label: 'Product Name', fieldName: 'wc_productName__c' },
                    { label: 'Category', fieldName: 'wc_category__c' },
                    { label: 'Price', fieldName: 'wc_price__c' },
                    { label: 'Stock Quantity', fieldName: 'wc_stockQuantity__c' },
                    { label: 'Status', fieldName: 'wc_status__c' },
                    { label: 'Total Sales', fieldName: 'wc_totalSales__c' }
                ];
            default:
                return [];
        }
    }
}
