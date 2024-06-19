import { LightningElement, track, wire, api } from "lwc";
import getBoatsByLocation from "@salesforce/apex/BoatDataService.getBoatsByLocation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const LABEL_YOU_ARE_HERE = "You are here!";
const ICON_STANDARD_USER = "standard:user";
const ERROR_TITLE = "Error loading Boats Near Me";
const ERROR_VARIANT = "error";

export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  @track mapMarkers = [];
  @track isLoading = true;
  @track isRendered = false;
  latitude;
  longitude;

  @wire(getBoatsByLocation, {
    latitude: "$latitude",
    longitude: "$longitude",
    boatTypeId: "$boatTypeId"
  })
  wiredBoatsJSON({ data, error }) {
    if (data) {
      this.createMapMarkers(data);
    } else if (error) {
      const evt = new ShowToastEvent({
        title: ERROR_TITLE,
        message: error.body.message,
        variant: ERROR_VARIANT
      });
      this.dispatchEvent(evt);
    }
    this.isLoading = false;
  }

  renderedCallback() {
    if (!this.isRendered) {
      this.getLocationFromBrowser();
      this.isRendered = true;
    }
  }

  getLocationFromBrowser() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
    });
  }

  createMapMarkers(boatData) {
    const newMarkers = JSON.parse(boatData).map((boat) => {
      return {
        title: boat.Name,
        location: {
          Latitude: boat.Geolocation__Latitude__s,
          Longitude: boat.Geolocation__Longitude__s
        }
      };
    });
    newMarkers.unshift({
      title: LABEL_YOU_ARE_HERE,
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude
      },
      icon: ICON_STANDARD_USER
    });
    this.mapMarkers = newMarkers;
    this.isLoading = false;
  }
}
