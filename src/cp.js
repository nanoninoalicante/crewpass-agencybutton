"use strict";
const CLIENT_DATA_URL = process.env.CLIENT_DATA_URL;
const COMMIT_ID = process.env.COMMIT_ID;
const VERSION = process.env.VERSION;
// const POPUP_URL = process.env.POPUP_URL || "https://verify-dev.crewpass.co.uk";
const BASE_CDN_URL =
  process.env.BASE_CDN_URL ||
  "https://storage.googleapis.com/crewpass-development-loginbutton";
const POPUP_URL = process.env.POPUP_URL || "http://127.0.0.1:3000";
const buttonContent = (lang = "en") => {
  const content = {
    en: {
      buttonText: "Approve with CrewPass",
      pleaseWait: "Please wait...",
      statuses: {
        "not-checked": {
          buttonText: "Approve With CrewPass",
          backgroundImage: `${BASE_CDN_URL}/Start.png`,
        },
        loading: {
          buttonText: "Loading",
          backgroundImage: `${BASE_CDN_URL}/Loading.png`,
        },
        pending: {
          buttonText: "Pending",
          backgroundImage: `${BASE_CDN_URL}/Pending.png`,
        },
        approved: {
          buttonText: "Approved",
          backgroundImage: `${BASE_CDN_URL}/Approved.png`,
        },
        declined: {
          buttonText: "Declined",
          backgroundImage: `${BASE_CDN_URL}/Declined.png`,
        },
        unchecked: {
          buttonText: "Unchecked",
          backgroundImage: `${BASE_CDN_URL}/Unchecked.png`,
        },
      },
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
      this.lastestReturnedStatus = "";
      this.formInputAttached = false;
      this.buttonDivId = buttonDivId;
      this.content = buttonContent("en");
    }
    getCurrentOrigin() {
      return window.location.origin;
    }
    preloadImage(url) {
      const img = new Image();
      img.src = url;
      return img;
    }

    loadButtonImages() {
      for (const status in this.content.statuses) {
        this.preloadImage(this.content.statuses[status].backgroundImage);
      }
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
      this.loadButtonImages();
      this.checkSavedStatus(function (notSaved, statusData) {
        if (statusData) {
          self.setStatus(statusData);
        } else {
          self.setBackgroundImage("not-checked");
        }
        self.button.addEventListener("click", function () {
          console.log("clicked");
          self.loading(true);
          self.openPopup();
        });
        callback(null, "setup complete");
      });
    }

    setBackgroundImage(status) {
      console.log("button: ", this.content.statuses[status].backgroundImage);
      this.button.setAttribute(
        "style",
        `background-image: url(${this.content.statuses[status].backgroundImage});`
      );
    }

    t(callback) {
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
        this.setBackgroundImage("loading");
      } else {
        this.setBackgroundImage(this.status);
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
            const eventData = JSON.parse(event.data);
            console.log("event data: ", eventData);
            self.popupCallback(JSON.parse(event.data));
          }
        },
        false
      );
      console.log("popup opened");
    }

    popupCallback(res) {
      console.log("callback: ", res);
      this.button = document.querySelector("div#cp-login");
      if (!res.status || res.status === "closed") {
        this.loading(false);
        return null;
      }
      this.setStatus(res);
      // ATTACH RESPONSE TO FORM
    }

    setStatus(statusData) {
      this.status = statusData.status;
      this.user = statusData.user;
      this.subscriptionStatus = statusData.subscriptionStatus;
      this.setBackgroundImage(statusData.status);
      window.sessionStorage.setItem(
        "cp-crewstatus-response",
        JSON.stringify(statusData)
      );
      this.attachFullResponseToForm();
    }

    checkSavedStatus(callback) {
      try {
        let statusData = window.sessionStorage.getItem(
          "cp-crewstatus-response"
        );
        console.log("saved status: ", statusData);
        if (!statusData) {
          callback("no saved data");
          return;
        }
        statusData = JSON.parse(statusData);
        if (!statusData.status) {
          callback("no saved status");
          return null;
        }
        callback(null, statusData);
      } catch (e) {
        callback(e);
      }
    }

    attachFullResponseToForm() {
      this.attachResponseToForm("crewpass-crew-status", this.status);
      this.attachResponseToForm("crewpass-crew-email", this.user.email);
      this.attachResponseToForm("crewpass-crew-userid", this.user.userId);
      this.attachResponseToForm("crewpass-crew-name", this.user.name);
    }

    attachResponseToForm(name, value) {
      const form = document.querySelector("form");
      console.log("form: ", form);
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", name);
      input.setAttribute("value", value);
      form.appendChild(input);
      this.formInputAttached = true;
    }
  }
  window.CrewPass = CrewPass;
})(window, document);
