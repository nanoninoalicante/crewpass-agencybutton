const remapData = (keys = {}, data = {}) => {
  const modifiedData = data;

  const mappedData = (keys, data) =>
    Object.keys(data).reduce((acc, key) => {
      const renameObject = () => {
        if (keys[key] === undefined) {
          return null;
        }

        return {
          [keys[key]]: data[key],
        };
      };

      return Object.assign(acc, renameObject());
    }, {});

  return mappedData(keys, modifiedData);
};

// form name and ID - {name}:{id}
const mappingKeys = {
  email: "crewpass-crew-email",
  name: "crewpass-crew-name",
  id: "crewpass-crew-crewUniqueId",
  status: "crewpass-crew-status",
};

const agencyKeys = {
  default: {
    [mappingKeys.email]: `${mappingKeys.email}:${mappingKeys.email}`,
    [mappingKeys.name]: `${mappingKeys.name}:${mappingKeys.name}`,
    [mappingKeys.id]: `${mappingKeys.id}:${mappingKeys.id}`,
    [mappingKeys.status]: `${mappingKeys.status}:${mappingKeys.status}`,
  },
  "william-halligan": {
    [mappingKeys.id]: "input_22:input_1_22",
    [mappingKeys.status]: "input_23:input_1_23",
  },
  wilsonhalligan: {
    [mappingKeys.id]: "input_22:input_1_22",
    [mappingKeys.status]: "input_23:input_1_23",
  },
  bespoke: {
    [mappingKeys.id]: "hdn_18107:hdn_18107",
    [mappingKeys.status]: "hdn_18111:hdn_18111",
    [mappingKeys.email]: "hdn_18106:hdn_18108",
    [mappingKeys.name]: "hdn_18108:hdn_18106",
  },
  jms: {
    [mappingKeys.id]: "input_10:input_1_10",
    [mappingKeys.status]: "input_8:input_1_8",
    [mappingKeys.email]: "input_9:input_1_9",
    [mappingKeys.name]: "input_11:input_1_11",
  },
};

const agenciesConfig = {
  6345792: {
    storeSession: false,
  },
};

const agencyInputFormData = (data, agency) => {
  return remapData(agencyKeys[agency] || agencyKeys["default"], data);
};

module.exports.agencyInputFormData = agencyInputFormData;
module.exports.agenciesConfig = agenciesConfig;
