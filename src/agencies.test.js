const test = require("ava");
const { agencyInputFormData } = require("./agencies");

const attachResponseToForm = (name, value) => {
  console.log(name, value);
};

test("get agencies form inputs", (t) => {
  const keyValues = {
    "crewpass-email": "cjameshill@gmail.com",
    "crewpass-name": "Chris Hill",
    "crewpass-crewUniqueId": "12341243",
    "crewpass-status": "verified",
  };
  const r = agencyInputFormData(keyValues, "william-halligan");
  console.log(t.title, r);
  t.pass();
});
test("iterate agencies form inputs", (t) => {
  const standardResponse = {
    "crewpass-crew-status": "verified",
    "crewpass-crew-email": "cjameshill@gmail.com",
    "crewpass-crew-crewUniqueId": "12341243",
    "crewpass-crew-name": "chris",
  };
  const agencyResponseFormData = agencyInputFormData(
    standardResponse,
    "william-halligan"
  );
  for (const key in agencyResponseFormData) {
    attachResponseToForm(key, agencyResponseFormData[key]);
  }
  console.log(t.title, agencyResponseFormData);
  t.pass();
});
