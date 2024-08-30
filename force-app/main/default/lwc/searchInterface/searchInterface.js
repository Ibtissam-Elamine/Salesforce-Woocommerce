import { LightningElement, track , wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchWooCommerceData from '@salesforce/apex/WC_SearchController.searchWooCommerceData';
import updateInSalesforce from '@salesforce/apex/UpsertInSalesforce.updateInSalesforce';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import CATEGORY_FIELD from '@salesforce/schema/wc_Product__c.wc_category__c';
import STATUS_FIELD from '@salesforce/schema/wc_Product__c.wc_status__c';
import PURCHASABLE_FIELD from '@salesforce/schema/wc_Product__c.wc_purchaseable__c';
import picklistCell from 'c/picklistCell';

export default class SearchInterface extends LightningElement {
    @track searchKey = '';
    @track selectedObject = '';
    @track searchResult;
    @track columns = [];
    @track draftValues = [];
    @track isEditable = false;
    @track isInvalid = true;
    @track errors = {};
    


    @track categoryOptions = [];
    statusOptions = [
        { label: 'Publish', value: 'publish' },
        { label: 'Draft', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Private', value: 'private' }
    ];
        @track purchasableOptions = [];

    
    objectOptions = [
        { label: 'Customer', value: 'wc_customer__c' },
        { label: 'Order', value: 'wc_order__c' },
        // { label: 'Order Item', value: 'wc_orderItem__c' },
        { label: 'Inventory', value: 'wc_inventory__c' },
        { label: 'Product', value: 'wc_product__c' }
    ];
    get inputClass() {
        return this.isInvalid ? 'input-error' : 'input-valid';
    }
  
    // Wire methods to fetch picklist values for the wc_product__c object fields
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: CATEGORY_FIELD })
    wiredCategoryValues({ error, data }) {
        if (data) {
            this.categoryOptions = data.values;
        } else if (error) {
            console.error('Error fetching category picklist values:', error);
        }
    }

    // @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: STATUS_FIELD  })
    // wiredStatusValues({ error, data }) {
    //     if (data) {
    //         this.statusOptions = data.values;
    //     } else if (error) {
    //         console.error('Error fetching status picklist values:', error);
    //     }
    // }

    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: PURCHASABLE_FIELD })
    wiredPurchasableValues({ error, data }) {
        if (data) {
            this.purchasableOptions = data.values;
        } else if (error) {
            console.error('Error fetching purchasable picklist values:', error);
        }
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.columns = this.getColumnsForObject(this.selectedObject);
        console.log('objectType: ', this.selectedObject);
        
        
    }

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
        // Check if the search key length is less than 3
        this.isInvalid = this.searchKey.length < 3;
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.errors = {}; // Clear any previous errors

        draftValues.forEach((draft) => {
            // Check if the changed field is 'email'
            if (draft.email && !this.validateEmail(draft.email)) {
                this.errors = {
                    rows: {
                        [draft.id]: {
                            title: 'Invalid email format',
                            fieldNames: ['email']
                        }
                    }
                };
            }
        });
        // this.draftValues = [...this.draftValues, ...draftValues];

    }

    // Method to validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


   handleSearch() {
        searchWooCommerceData({ objectType: this.selectedObject, key: this.searchKey })
            .then(result => {
                this.searchResult = JSON.parse(JSON.stringify(result));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

   
    handleSave(event) {
        this.draftValues = event.detail.draftValues;
    
        // Check for any existing errors before saving
        if (Object.keys(this.errors).length > 0) {
            console.log('Errors detected:', this.errors);
    
            // Show an error message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating records',
                    message: 'Please fix the errors before saving.',
                    variant: 'error',
                })
            );
            return; // Exit the function if there are errors
        }
    
        console.log('Search Results:', JSON.stringify(this.searchResult, null, 2));
        console.log('Draft Values:', JSON.stringify(this.draftValues, null, 2));
    
        let updatedRecords = [];
    
        this.draftValues.forEach(draftValue => {
            console.log('Processing Draft Value:', JSON.stringify(draftValue, null, 2));
    
            let recordToUpdate = this.searchResult.find(record => String(record.id) === String(draftValue.id));
    
            if (recordToUpdate) {
                let updatedRecord = { ...recordToUpdate };
    
                for (const field in draftValue) {
                    if (draftValue.hasOwnProperty(field)) {
                        updatedRecord[field] = draftValue[field];
                    }
                }
    
                updatedRecords.push(updatedRecord);
    
                console.log('Updated Record to be Upserted:', JSON.stringify(updatedRecord, null, 2));
            } else {
                console.warn('No matching record found for draft value ID:', draftValue.id);
            }
        });
    
        console.log('Updated Records:', JSON.stringify(updatedRecords, null, 2));
    
        updateInSalesforce({ data: updatedRecords, objectType: this.selectedObject })
            .then(result => {
                console.log('Upsert successful:', result);
    
                // Show a success message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Records have been updated successfully.',
                        variant: 'success',
                    })
                );
                this.draftValues = [];
                this.errors = {};
                this.handleSearch(); // Refresh the table data
            })
            .catch(error => {
                console.error('Error:', error);
                console.log('Error Body:', error.body);
    
                // Show an error message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating records',
                        message: error.body ? error.body.message : 'An unknown error occurred',
                        variant: 'error',
                    })
                );
            });
    }
    
    
    
    


    getColumnsForObject(objectName) {
        switch (objectName) {
            case 'wc_customer__c':
                return [
                    { label: 'ID', fieldName: 'id' },
                    { label: 'First Name', fieldName: 'first_name', editable: true },
                    { label: 'Last Name', fieldName: 'last_name', editable: true },
                    { label: 'Email', fieldName: 'email', editable: true },
                    { label: 'Phone', fieldName: 'phone', editable: true },
                    { label: 'Date Created', fieldName: 'date_created', editable : true , type: 'date' },
                    { label: 'Billing Address', fieldName: 'billing_address' },
                    { label: 'Shipping Address', fieldName: 'shipping_address' },
                    { label: 'Last Order Date' , fieldName: 'lastOrderDate' , editable: true , type : 'date'},
                    { label: 'Total Orders' , fieldName: 'totalOrders'}
                ];
            case 'wc_order__c':
                return [
                    { label: 'ID', fieldName: 'id' },
                    { label: 'Customer', fieldName: 'customer_id' },
                    { label: 'Order Number', fieldName: 'order_number' },
                    { label: 'Status', fieldName: 'status' , editable:true},
                    { label: 'Currency', fieldName: 'currency' , editable :true},
                    { label: 'Total', fieldName: 'total',  editable : true},
                    { label: 'Payment Method', fieldName: 'payment_method' , editable : true },
                    { label: 'Date Paid', fieldName: 'date_paid' , editable : true , type : 'date' }
                ];
            // case 'wc_OrderItem__c':
            //     return [
            //         { label: 'Order ID', fieldName: 'wc_orderId__c' },
            //         { label: 'Product Name', fieldName: 'wc_name__c' },
            //         { label: 'Quantity', fieldName: 'wc_quantity__c' },
            //         { label: 'Unit Price', fieldName: 'wc_UnitPrice__c' },
            //         { label: 'Subtotal', fieldName: 'wc_subtotal__c' },
            //         { label: 'Total', fieldName: 'wc_total__c' }
            //     ];
            case 'wc_inventory__c':
                return [
                    { label: 'Id', fieldName: 'id' },
                    { label: 'Product ID', fieldName: 'product_id'  },
                    { label: 'Available Quantity', fieldName: 'quantity' , editable : true },
                    { label: 'Last Stock Update', fieldName: 'last_Stock_Update' },
                    { label: 'Status', fieldName: 'status' , editable : true },
                    { label: 'Weight', fieldName: 'weight' , editable : true }
                ];
            case 'wc_product__c':
                return [
                    { label: 'Id', fieldName: 'id' },
                    { label: 'Product Name', fieldName: 'name', editable : true },
                    { label: 'Category', fieldName: 'category', editable: true, type: 'picklistCell',
                        typeAttributes: {
                            placeholder: 'Choose Category',
                            options: this.categoryOptions, 
                            value: { fieldName: 'category' },
                            context: { fieldName: 'id' }
                        }
                    },
                    { label: 'Price', fieldName: 'price' , editable : true },
                    { label: 'Stock Quantity', fieldName: 'stock_quantity' , editable : true },
                    { 
                        label: 'Status', 
                        fieldName: 'status', 
                        type: 'picklistCell',
                        typeAttributes: {
                            placeholder: 'Choose Status',
                            options: this.statusOptions,
                            value: { fieldName: 'status' },
                            context: { fieldName: 'id' }
                        },
                        editable: true 
                    },
                    { label: 'Total Sales', fieldName: 'total_sales' },
                    { label: 'Purchasable', fieldName: 'purchasable', editable: true, type: picklistCell,
                        typeAttributes: {
                            placeholder: 'Choose Purchasable',
                            options: this.purchasableOptions.map(opt => ({ label: opt.label, value: opt.value })),
                            value: { fieldName: 'purchasable' },
                            context: { fieldName: 'id' }
                        }
                    },
                    ];
            default:
                return [];
        }
    }}