"use strict";
const CLIENT_DATA_URL = process.env.CLIENT_DATA_URL;
const COMMIT_ID = process.env.COMMIT_ID;
const VERSION = process.env.VERSION;
const POPUP_URL = process.env.POPUP_URL || "https://verify-dev.crewpass.co.uk";
// const POPUP_URL = process.env.POPUP_URL || "http://127.0.0.1:3000/login";

const buttonContent = (lang = "en") => {
  const content = {
    en: {
      buttonText: "Approve with CrewPass",
      pleaseWait: "Please wait...",
      statuses: {
        "pending": {
          buttonText: "Pending",
          styleClass: "pending"
        },
        "approved": {
          buttonText: "Approved",
          styleClass: "approved"
        },
        "declined": {
          buttonText: "Declined",
          styleClass: "declined"
        },
        "unchecked": {
          buttonText: "Unchecked",
          styleClass: "unchecked"
        }
      }
    },
  };
  return content[lang];
};

(function (window, document) {
  class CrewPass {
    constructor(vendor, buttonDivId = "cp-login") {
      this.vendor = vendor;
      this.button = "";
      this.status = "not-checked";
      this.subscriptionStatus = "";
      this.user = "";
      this.formInputAttached = false;
      this.buttonDivId = buttonDivId;
      this.content = buttonContent("en");
    }
    getCurrentOrigin() {
      return window.location.origin;
    }
    getLoginPopupUrl() {
      return `${POPUP_URL}?origin=${this.getCurrentOrigin()}`;
    }
    setup(callback) {
      console.log("setup: ", this.vendor);
      let self = this;
      this.button = document.querySelector("div#" + this.buttonDivId);
      if (!this.button) {
        return callback("button not found");
      }
      this.button.classList.add("cp-button-image");
      this.button.addEventListener("click", function () {
        console.log("clicked");
        self.loading(true);
        self.openPopup();
      });
      return callback(null, "setup complete");
    }

    t(callback) {
      let self = this;
      console.log("initiate");
      this.setup(function (error, res) {
        if (error) {
          console.log("error: ", error);
          return callback(error);
        }
        return callback(null, res);
      });
    }
    loading(isLoading) {
      if (isLoading) {
        this.button.classList.remove("pending", "verified", "declined", "unchecked")
        this.button.classList.add("loading");
      } else {
        this.button.classList.remove("loading");
      }
    }

    openPopup() {
      let self = this;
      const cpLoginPopup = window.open(
        this.getLoginPopupUrl(),
        "cpLoginPopup",
        "status=1, height=730, width=500, toolbar=0,resizable=0"
      );
      cpLoginPopup.window.focus();
      window.addEventListener(
        "message",
        function (event) {
          if (event.origin !== self.getCurrentOrigin()) {
            console.log("event data: ", JSON.parse(event.data));
            self.popupCallback(JSON.parse(event.data));
          }
        },
        false
      );
      console.log("popup opened");
    }

    popupCallback(res) {
      console.log("callback: ", res);
      const button = document.querySelector("div#cp-login");
      if (!res.status || res.status === "closed") {
        this.loading(false);
        return null;
      }
      this.status = res.status;
      this.user = res.user;
      this.subscriptionStatus = res.subscriptionStatus;
      button.classList.add(this.content.statuses[res.status || "pending"].styleClass);
      if (!this.formInputAttached) {
        this.attachResponseToForm();
      }
      // ATTACH RESPONSE TO FORM
    }

    attachResponseToForm() {
      const form = document.querySelector("form");
      console.log("form: ", form);
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", "crewpass-crew-status");
      input.setAttribute("value", this.status);
      form.appendChild(input);
      this.formInputAttached = true;
    }
  }
  window.CrewPass = CrewPass;
})(window, document);
