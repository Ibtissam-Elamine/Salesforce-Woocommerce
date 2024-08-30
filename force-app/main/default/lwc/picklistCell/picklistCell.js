import { LightningElement, api } from 'lwc';

export default class PicklistCell extends LightningElement {
    @api label;
    @api placeholder;
    @api options;
    @api value;
    @api context; // Context information to pass back to the parent component

    handleChange(event) {
        // Custom event to pass the selected value to the parent component
        const selectedEvent = new CustomEvent('select', {
            detail: {
                context: this.context,
                value: event.detail.value
            }
        });
        this.dispatchEvent(selectedEvent);
    }
}
