"use strict";
const { agencyInputFormData, agenciesConfig } = require("./agencies");
const BASE_CDN_URL =
  process.env.BASE_CDN_URL ||
  "https://storage.googleapis.com/crewpass-development-loginbutton";
const POPUP_URL = process.env.POPUP_URL || "https://verify.crewpass.co.uk";
const buttonContent = (lang = "en") => {
  const content = {
    en: {
      buttonText: "Approve with CrewPass",
      pleaseWait: "Please wait...",
      statuses: {
        "not-checked": {
          buttonText: "Approve With CrewPass",
          backgroundImage: `${BASE_CDN_URL}/Start.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Start.png`,
          },
        },
        loading: {
          buttonText: "Loading",
          backgroundImage: `${BASE_CDN_URL}/Loading.png`,
        },
        pending: {
          buttonText: "Pending",
          backgroundImage: `${BASE_CDN_URL}/Pending.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Pending.png`,
          },
        },
        approved: {
          buttonText: "Approved",
          backgroundImage: `${BASE_CDN_URL}/Approved.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Approved.png`,
          },
        },
        verified: {
          buttonText: "Approved",
          backgroundImage: `${BASE_CDN_URL}/Approved.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Approved.png`,
          },
        },
        declined: {
          buttonText: "Declined",
          backgroundImage: `${BASE_CDN_URL}/Declined.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Declined.png`,
          },
        },
        unchecked: {
          buttonText: "Unchecked",
          backgroundImage: `${BASE_CDN_URL}/Unchecked.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Unchecked.png`,
          },
        },
      },
    },
  };
  return content[lang];
};

(function (window, document) {
  class CrewPass {
    constructor({
      v: vendor,
      divId: buttonDivId = "cp-login",
      holderId: divHolderId = "cp-login-wrapper",
    }) {
      this.agency = vendor;
      this.button = "";
      this.buttonHolder = "";
      this.status = "not-checked";
      this.subscriptionStatus = "";
      this.user = "";
      this.buttonDivId = buttonDivId;
      this.buttonDivHolderId = divHolderId;
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
        if (
          this.content.statuses[status].agencyBackgroundImages &&
          this.content.statuses[status].agencyBackgroundImages[this.agency]
        ) {
          this.preloadImage(
            this.content.statuses[status].agencyBackgroundImages[this.agency]
          );
          continue;
        }
        this.preloadImage(this.content.statuses[status].backgroundImage);
      }
    }

    getLoginPopupUrl() {
      const params = {
        origin: this.getCurrentOrigin(),
        utm_id: "verify-with-crewpass",
        utm_source: "integration-popup",
        utm_medium: "popup",
        utm_campaign: this.agency || "agency-not-set",
      };
      const searchParams = new URLSearchParams(params);
      return `${POPUP_URL}?${searchParams.toString()}`;
    }
    setup(callback) {
      console.log("setup: ", this.agency);
      let self = this;
      this.buttonHolder = document.querySelector(
        "div#" + this.buttonDivHolderId
      );
      this.button = document.querySelector("div#" + this.buttonDivId);
      if (!this.button || !this.buttonHolder) {
        return callback("button not found");
      }
      this.buttonHolder.classList.add(`cp-btn-${this.agency || "default"}`);
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
      let backgroundImage = this.content.statuses[status].backgroundImage;
      if (
        this.agency &&
        this.content.statuses[status].agencyBackgroundImages &&
        this.content.statuses[status].agencyBackgroundImages[this.agency]
      ) {
        backgroundImage =
          this.content.statuses[status].agencyBackgroundImages[this.agency];
      }
      console.log("button: ", backgroundImage);
      this.button.setAttribute(
        "style",
        `background-image: url(${backgroundImage});`
      );
    }

    t(callback) {
      this.setup(function (error, res) {
        if (error) {
          return !callback ? error : callback(error);
        }
        return !callback ? res : callback(res);
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
        "status=1, height=800, width=500, toolbar=0,resizable=0"
      );
      cpLoginPopup.window.focus();
      window.addEventListener(
        "message",
        function (event) {
          console.log("event: ", event.data);
          if (event.origin !== self.getCurrentOrigin()) {
            const eventData = JSON.parse(event.data);
            self.popupCallback(eventData);
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
    }

    needsToStoreSession() {
      if (!this.agency) return true;
      if (!agenciesConfig[this.agency]) return true;
      return agenciesConfig[this.agency].storeSession;
    }

    setStatus(statusData) {
      this.status = statusData.status;
      this.user = statusData.user;
      this.subscriptionStatus = statusData.subscriptionStatus;
      this.setBackgroundImage(statusData.status);
      if (this.needsToStoreSession()) {
        window.sessionStorage.setItem(
          "cp-crewstatus-response",
          JSON.stringify(statusData)
        );
      }
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
      const standardResponse = {
        "crewpass-crew-status": this.status,
        "crewpass-crew-email": this.user.email,
        "crewpass-crew-crewUniqueId": this.user.crewUniqueId,
        "crewpass-crew-name": this.user.name,
      };
      const agencyResponseFormData = agencyInputFormData(
        standardResponse,
        this.agency
      );
      console.log("agency form response: ", agencyResponseFormData);
      for (const key in agencyResponseFormData) {
        this.attachResponseToForm(key, agencyResponseFormData[key]);
      }
    }

    attachResponseToForm(inputIdAndName, value) {
      const form = document.querySelector("form");
      if (!form) {
        return { message: "cannot find form" };
      }
      const name = inputIdAndName.split(":")[0];
      const id = inputIdAndName.split(":")[1];
      console.log("form: ", form);
      let input = document.querySelector("input#" + id);
      if (input) {
        console.log("input exists: ", input);
      } else {
        input = document.createElement("input");
      }
      input.setAttribute("id", id);
      input.setAttribute("type", "hidden");
      input.setAttribute("name", name);
      input.setAttribute("value", value);
      form.appendChild(input);
    }
  }
  window.CrewPass = CrewPass;
})(window, document);
