import { LightningElement, api, wire, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import { publish, MessageContext } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { refreshApex } from "@salesforce/apex";
const SUCCESS_TITLE = "Success";
const MESSAGE_SHIP_IT = "Ship it!";
const SUCCESS_VARIANT = "success";
const ERROR_TITLE = "Error";
const ERROR_VARIANT = "error";
export default class BoatSearchResults extends LightningElement {
  @api selectedBoatId;
  columns = [
    { label: "Name", fieldName: "Name", type: "text", editable: "true" },
    {
      label: "Length",
      fieldName: "Length__c",
      type: "number",
      editable: "true"
    },
    {
      label: "Price",
      fieldName: "Price__c",
      type: "currency",
      editable: "true"
    },
    {
      label: "Description",
      fieldName: "Description__c",
      type: "text",
      editable: "true"
    }
  ];
  boatTypeId = "";
  @track boats;
  @track draftValues = [];
  isLoading = false;

  @wire(MessageContext)
  messageContext;

  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats(result) {
    if (result.data) {
      this.boats = result.data;
    }
  }

  @api searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }

  @api async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  sendMessageService(boatId) {
    publish(this.messageContext, BOATMC, { recordId: boatId });
  }

  handleSave(event) {
    const updatedFields = event.detail.draftValues;
    updateBoatList({ data: updatedFields })
      .then((result) => {
        const toastMess = new ShowToastEvent({
          title: SUCCESS_TITLE,
          message: MESSAGE_SHIP_IT,
          variant: SUCCESS_VARIANT
        });
        this.dispatchEvent(toastMess);
        return this.refresh();
      })
      .catch((error) => {
        const toastMess = new ShowToastEvent({
          title: ERROR_TITLE,
          message: error.message,
          variant: ERROR_VARIANT
        });
        this.dispatchEvent(toastMess);
      })
      .finally(() => {
        this.template.querySelector("lightning-datatable").draftValues = [];
      });
  }
  notifyLoading(isLoading) {
    this.dispatchEvent(new CustomEvent(isLoading ? "loading" : "doneloading"));
  }
}
