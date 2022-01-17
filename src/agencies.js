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

const mappingKeys = {
  email: "crewpass-crew-email",
  name: "crewpass-crew-name",
  id: "crewpass-crew-crewUniqueId",
  status: "crewpass-crew-status"
}

const agencyKeys = {
  "default": {
    [mappingKeys.email]: mappingKeys.email,
    [mappingKeys.name]: mappingKeys.name,
    [mappingKeys.id]: mappingKeys.id,
    [mappingKeys.status]: mappingKeys.status,
  },
  "william-halligan": {
    [mappingKeys.id]: "input_1_22",
    [mappingKeys.status]: "input_1_23",
  },
  "wilsonhalligan": {
    [mappingKeys.id]: "input_1_22",
    [mappingKeys.status]: "input_1_23",
  },
};

const agencyInputFormData = (data, agency) => {
  return remapData(agencyKeys[agency] || agencyKeys["default"], data);
};

module.exports.agencyInputFormData = agencyInputFormData;
