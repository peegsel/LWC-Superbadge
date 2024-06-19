import { LightningElement, api } from "lwc";
import getAllReviews from "@salesforce/apex/BoatDataService.getAllReviews";
import { NavigationMixin } from "lightning/navigation";
export default class BoatReviews extends NavigationMixin(LightningElement) {
  boatId;
  error;
  boatReviews;
  isLoading;

  get recordId() {
    return this.boatId;
  }
  @api set recordId(value) {
    this.setAttribute("boatId", value);
    this.boatId = value;
    this.getReviews();
  }

  get reviewsToShow() {
    return (
      this.boatReviews !== undefined &&
      this.boatReviews != null &&
      this.boatReviews.length > 0
    );
  }

  @api refresh() {
    this.getReviews();
  }

  getReviews() {
    if (this.boatId) {
      this.isLoading = true;
      getAllReviews({ boatId: this.boatId })
        .then((result) => {
          if (!result) return;
          this.boatReviews = result;
          this.error = undefined;
        })
        .catch((error) => {
          this.error = error;
        })
        .finnaly(() => {
          this.isLoading = false;
        });
    } else {
      return;
    }
  }

  navigateToRecord(event) {
    event.preventDefault();
    event.stopPropagation();
    const recordId = event.currentTarget.dataset.recordId;

    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: recordId,
        objectApiName: "User",
        actionName: "view"
      }
    });
  }
}
