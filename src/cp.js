"use strict";
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "https://0460bea65d3748689e2c035bd2393a6b@o962154.ingest.sentry.io/6600060",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});
const { agencyInputFormData, agenciesConfig } = require("./agencies");
const BASE_CDN_URL =
  process.env.BASE_CDN_URL ||
  "https://storage.googleapis.com/crewpass-development-loginbutton";
const POPUP_URL = process.env.POPUP_URL || "https://verify-dev.crewpass.co.uk";
const COMMIT_ID = process.env.COMMIT_ID || "commit_id";
const ENVIRONMENT = process.env.ENVIRONMENT || "dev";
const buttonContent = (lang = "en") => {
  const content = {
    en: {
      buttonText: "Approve with CrewPass",
      pleaseWait: "Please wait...",
      statuses: {
        "not-checked": {
          buttonText: "Approve With CrewPass",
          backgroundColor: "#2B3D4B",
          backgroundImage: `${BASE_CDN_URL}/Start.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Start.png`,
          },
        },
        loading: {
          buttonText: "Please Wait..",
          backgroundColor: "#2B3D4B",
          backgroundImage: `${BASE_CDN_URL}/Loading.png`,
        },
        pending: {
          buttonText: "Pending",
          backgroundColor: "#F39200",
          backgroundImage: `${BASE_CDN_URL}/Pending.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Pending.png`,
          },
        },
        approved: {
          buttonText: "Approved",
          backgroundColor: "#3AAA35",
          backgroundImage: `${BASE_CDN_URL}/Approved.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Approved.png`,
          },
        },
        verified: {
          buttonText: "Approved",
          backgroundColor: "#3AAA35",
          backgroundImage: `${BASE_CDN_URL}/Approved.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Approved.png`,
          },
        },
        declined: {
          buttonText: "Declined",
          backgroundColor: "#E6332A",
          backgroundImage: `${BASE_CDN_URL}/Declined.png`,
          agencyBackgroundImages: {
            6345792: `${BASE_CDN_URL}/agencies/6345792/Declined.png`,
          },
        },
        unchecked: {
          buttonText: "Unchecked",
          backgroundColor: "#878787",
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
      popupUrl: popupUrl = POPUP_URL,
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
      this.popupUrl = popupUrl || POPUP_URL;
      this.env = ENVIRONMENT;
      this.commitId = COMMIT_ID;
    }
    getCurrentOrigin() {
      return window.location.origin;
    }
    getCrewPassDashboardOrigin() {
      const popupUrl = new URL(this.popupUrl);
      return popupUrl.origin;
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
      let params = {
        origin: this.getCurrentOrigin(),
        utm_id: "verify-with-crewpass",
        utm_source: "integration-popup",
        utm_medium: "popup",
        utm_campaign: this.agency || "agency-not-set",
      };
      if (this.agency) {
        params.partnerId = this.agency;
        params.partner = "agency";
        params.partnername = this.agency;
      }
      const searchParams = new URLSearchParams(params);
      return `${this.popupUrl}?${searchParams.toString()}`;
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
      this.setButtonIconAndText();
      this.checkSavedStatus(function (notSaved, statusData) {
        if (statusData) {
          self.setStatus(statusData);
        } else {
          self.setBackgroundImage("not-checked");
        }
        self.button.addEventListener("click", function () {
          console.log("clicked");
          // self.loading(true);
          self.openPopup();
        });
        self.postDebuggingMessage();
        callback(null, "setup complete");
      });
    }
    postDebuggingMessage() {
      window.postMessage(JSON.stringify({ url: this.getLoginPopupUrl(), agency: this.agency, target: "crewpass", type: "debugging", commitId: this.commitId, env: this.env }), window.location.origin);
    }
    setButtonIconAndText() {
      const buttonIcon = document.getElementById("cp-button-icon");
      console.log("button icon: ", buttonIcon);
      if (!buttonIcon) {
        console.log("setting button");
        let setButtonIcon = document.createElement("img");
        setButtonIcon.id = "cp-button-icon";
        setButtonIcon.src =
          "https://storage.googleapis.com/crewpass-production-loginbutton/cp-icon.png";
        setButtonIcon.width = 23;
        setButtonIcon.height = 23;
        setButtonIcon.style = "width:23px;height:23px;";
        this.button.appendChild(setButtonIcon);
      } else {
        console.log("button icon found");
      }
      const buttonTextHolder = document.getElementById("cp-button-text-holder");
      console.log("button text holder: ", buttonTextHolder);
      if (!buttonTextHolder) {
        console.log("setting button text holder");
        let setButtonTextHolder = document.createElement("div");
        setButtonTextHolder.id = "cp-button-text-holder";
        this.button.appendChild(setButtonTextHolder);
        let setButtonText = document.createElement("span");
        setButtonText.id = "cp-button-text-span";
        setButtonText.innerHTML =
          this.content.statuses["not-checked"].buttonText;
        setButtonTextHolder.appendChild(setButtonText);
      }
    }

    setBackgroundImage(status) {
      let buttonText = document.querySelector("span#cp-button-text-span");
      buttonText.innerHTML = this.content.statuses[status].buttonText;
      this.button.setAttribute(
        "style",
        `background-color: ${this.content.statuses[status].backgroundColor};`
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
      console.log("opening popup: ", self.getLoginPopupUrl());
      console.log("popup origin url: ", self.getCrewPassDashboardOrigin());
      const cpLoginPopup = window.open(
        this.getLoginPopupUrl(),
        "cpLoginPopup",
        "status=1, height=800, width=500, toolbar=0,resizable=0"
      );
      cpLoginPopup.window.focus();
      window.addEventListener(
        "message",
        function (event) {
          if (event.origin === self.getCrewPassDashboardOrigin() && event.data) {
            console.log("event: ", event.data);
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
        // this.loading(false);
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
      const { agencyResponseFormData, formId } = agencyInputFormData(
        standardResponse,
        this.agency
      );
      console.log(`agency - ${this.agency} form response: `, agencyResponseFormData);
      for (const key in agencyResponseFormData) {
        this.attachResponseToForm(key, agencyResponseFormData[key], formId);
      }
    }

    attachResponseToForm(inputIdAndName, value, formId = null) {
      console.log(inputIdAndName, value);
      if (value === null || value === undefined) return { message: "missing form value" };
      let form = document.querySelector("form");
      console.log("formid: ", formId);
      // if agency has a custom form ID
      if (formId) {
        form = document.getElementById(formId);
      }
      if (!form) {
        console.log('cannot find form');
        return { message: "cannot find form" };
      }
      const name = inputIdAndName.split(":")[0];
      const id = inputIdAndName.split(":")[1];
      console.log("form: ", form);
      let input = form.querySelector("input#" + id);
      if (input) {
        console.log("input exists: ", input);

        input.setAttribute("value", value);
        return { message: "input exists" };
      } else {
        console.log("creating input: ", name);
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
