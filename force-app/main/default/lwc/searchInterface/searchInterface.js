import { LightningElement, track , wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchWooCommerceData from '@salesforce/apex/WC_SearchController.searchWooCommerceData';
import synchronizeCustomer from '@salesforce/apex/SynchCustomer.synchronizeCustomer';
import SynchProduct from '@salesforce/apex/SynchProduct.SynchProduct';
import SynchronizeOrder from '@salesforce/apex/SynchOrder.SynchronizeOrder';
export default class SearchInterface extends LightningElement {
    @track searchKey = '';
    @track selectedObject = '';
    @track searchResult;
    @track columns = [];
    @track draftValues = [];
    @track isEditable = false;
    @track isInvalid = true;
    @track errors = {};


    
    objectOptions = [
        { label: 'Customer', value: 'wc_customer__c' },
        { label: 'Order', value: 'wc_order__c' },
        // { label: 'Order Item', value: 'wc_orderItem__c' },
        { label: 'Inventory', value: 'wc_inventory__c' },
        { label: 'Product', value: 'wc_product__c' }
    ];
   

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.columns = this.getColumnsForObject(this.selectedObject);
        console.log('objectType: ', this.selectedObject);
        
        
    }

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
        // Check if the search key length is less than 3
        // this.isInvalid = this.searchKey.length < 3;
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

   
    
    

    getColumnsForObject(objectName) {
        switch (objectName) {
            case 'wc_customer__c':
                return [
                    { label: 'ID', fieldName: 'id' },
                    { label: 'First Name', fieldName: 'first_name'  },
                    { label: 'Last Name', fieldName: 'last_name'  },
                    { label: 'Email', fieldName: 'email'  },
                    { label: 'Phone', fieldName: 'phone'  },
                    { label: 'Date Created', fieldName: 'date_created', type: 'date' },
                    { label: 'Billing Address', fieldName: 'billing_address' },
                    { label: 'Shipping Address', fieldName: 'shipping_address' },
                    { label: 'Last Order Date' , fieldName: 'lastOrderDate' ,  type : 'date'},
                    { label: 'Total Orders' , fieldName: 'totalOrders' },
                    { label: 'Last Sync Date', fieldName: 'LastSyncDate'},
                    {
                        label: 'Actions',
                        type: 'button',
                        typeAttributes: {
                            label: 'Synchronize',
                            name: 'synchronize',
                            title: 'Click to synchronize with Salesforce',
                            disabled: { fieldName: 'isExistingInSalesforce' }, // Désactivé si non existant
                            variant: 'brand'
                        }
                    }
                ];
            case 'wc_order__c':
                return [
                    { label: 'ID', fieldName: 'id' },
                    { label: 'Customer', fieldName: 'customer_id' },
                    { label: 'Order Number', fieldName: 'order_number' },
                    { label: 'Status', fieldName: 'status'},
                    { label: 'Currency', fieldName: 'currency' },
                    { label: 'Total', fieldName: 'total'},
                    { label: 'Payment Method', fieldName: 'payment_method'  },
                    { label: 'Date Paid', fieldName: 'date_paid' ,  type : 'date' },
                    { label: 'Last Sync Date', fieldName: 'LastSyncDate' },
                    {
                        label: 'Actions',
                        type: 'button',
                        typeAttributes: {
                            label: 'Synchronize',
                            name: 'synchronize',
                            title: 'Click to synchronize with Salesforce',
                            disabled: { fieldName: 'isExistingInSalesforce' }, // Désactivé si non existant
                            variant: 'brand'
                        }
                    }
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
                    { label: 'Available Quantity', fieldName: 'quantity'  },
                    { label: 'Last Stock Update', fieldName: 'last_Stock_Update' },
                    { label: 'Status', fieldName: 'status' },
                    { label: 'Weight', fieldName: 'weight'  },
                    
                ];
            case 'wc_product__c':
                return [
                    { label: 'Id', fieldName: 'id' },
                    { label: 'Product Name', fieldName: 'name'},
                    { label: 'Category', fieldName: 'category'},
                    { label: 'Price', fieldName: 'price'},
                    { label: 'Stock Quantity', fieldName: 'stock_quantity'},
                    { label: 'Status', fieldName: 'status'},
                    { label: 'Total Sales', fieldName: 'total_sales' },
                    { label: 'Purchasable', fieldName: 'purchasable'},
                    { label: 'Last Sync Date', fieldName: 'LastSyncDate'},
                    {
                        label: 'Actions',
                        type: 'button',
                        typeAttributes: {
                            label: 'Synchronize',
                            name: 'synchronize',
                            title: 'Click to synchronize with Salesforce',
                            disabled: { fieldName: 'isExistingInSalesforce' }, // Désactivé si non existant
                            variant: 'brand'
                        }
                    }
                    ];
            default:
                return [];
        }
    }
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log('selected object ' , this.selectedObject);
        if (actionName === 'synchronize') {
            if(this.selectedObject==='wc_customer__c'){
                this.synchronizeCustomer(row.id);
            }
            if(this.selectedObject==='wc_product__c'){
                this.synchronizeProduct(row.id);
            }  
            if(this.selectedObject==='wc_order__c') {
                this.synchronizeOrder(row.id);
            } 
        }
        console.log('row id ' , row.id);
    }

    synchronizeCustomer(recordId) {
        synchronizeCustomer({ recordId })
            .then(result => {
                this.showToast('Success', result, 'success');
               // Rafraîchir les données après synchronisation
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
                this.errors = error;
            });
    }
    
    synchronizeProduct(recordId) {
        SynchProduct({ recordId })
            .then(result => {
                this.showToast('Success', result, 'success');
                this.handleSearch(); // Rafraîchir les données après synchronisation
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
                this.errors = error;
            });
    }
    synchronizeOrder(recordId) {
        SynchronizeOrder({ recordId })
            .then(result => {
                this.showToast('Success', result, 'success');
                this.handleSearch(); // Rafraîchir les données après synchronisation
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
                this.errors = error;
            });
    }






    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    refreshRow(recordId) {
        searchWooCommerceData({ objectType: this.selectedObject, key: recordId })
            .then(result => {
                // Mettre à jour la ligne correspondante dans searchResult
                const index = this.searchResult.findIndex(item => item.id === recordId);
                if (index !== -1) {
                    this.searchResult[index] = JSON.parse(JSON.stringify(result[0]));
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
}