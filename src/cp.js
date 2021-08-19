"use strict";
const CLIENT_DATA_URL = process.env.CLIENT_DATA_URL;
const COMMIT_ID = process.env.COMMIT_ID;
const VERSION = process.env.VERSION;

(function (window, document) {
  class CrewPass {
    constructor(vendor) {
      this.vendor = vendor;
      this.button = "";
      this.buttonText = "Continue with Crew Pass";
      this.status = "not-checked";
    }
    getCurrentOrigin() {
      return window.location.origin;
    }
    getLoginPopupUrl() {
      return "http://127.0.0.1:3000/login?origin=" + this.getCurrentOrigin();
    }
    setup(callback) {
      console.log("setup: ", this.vendor);
      let self = this;
      this.button = document.querySelector("div#cp-login");
      if (!this.button) {
        return callback("button not found");
      }
      this.button.innerHTML = this.buttonText;
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
        }
        return callback(error, res);
      });
    }
    loading(isLoading) {
      if (isLoading) {
        this.button.innerHTML = `Please wait...`;
      }
    }

    openPopup() {
      let self = this;
      const cpLoginPopup = window.open(
        this.getLoginPopupUrl(),
        "cpLoginPopup",
        "status=1, height=500, width=500, toolbar=0,resizable=0"
      );
      cpLoginPopup.window.focus();
      window.addEventListener(
        "message",
        function (event) {
          console.log("message: ", event);
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
      if (!res.status || res.status === "not-started") {
        button.innerHTML = this.buttonText;
        return null;
      }
      button.classList.add("disabled");
      const response = document.querySelector("div#cp-login-response");
      response.classList.add(res.status);
      response.innerHTML = res.message;
    }
  }
  window.CrewPass = CrewPass;
})(window, document);
