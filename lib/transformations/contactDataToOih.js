const jsonata = require('jsonata');

function mapMicrosoftAddressDataToOIH(addresses) {
  let addr = [];

  addresses.forEach(a => {
    addr.push({
      street: a.street !== undefined || a.street === null  ? a.street : "",
      unit:  "",
      zipCode: a.postalCode !== undefined || a.po === null  ? a.postalCode : "",
      city: a.city !== undefined || a.city === null  ? a.city : "",
      district: a.state !== undefined || a.state === null  ? a.state : "",
      region: a.countryOrRegion !== undefined || a.countryOrRegion === null  ? a.countryOrRegion : "",
      country:  "",
      countryCode:  "",
      primaryContact:  "",
    })
  });
  return addr;
}

function mapContactDataToOIH(emailAddresses, homePhones, imAddresses, mobilePhone) {
  let cd = [];

  // map email addresses
  cd.concat(emailAddresses.map(email => {
    return {
              value: email.address === undefined || email.address === null  ? "" : email.address,
              type: "email",
              label: email.name === undefined || email.name === null  ? "" : email.name,
              description: "email address"
            }
  }));

  // map private phone numbers
  cd.concat(homePhones.map(hp => {
    return {
              value: hp === undefined || hp === null  ? "" : hp,
              type: "phone",
              label: "home",
              description: "private phone number"
            }
  }));

  // map instant messaging accounts
  cd.concat(imAddresses.map(ia => {
    return {
              value: ia === undefined || ia === null  ? "" : ia,
              type: "imAddress",
              label: "instant messaging",
              description: "instant messaging address"
            }
  }));

  // map single mobile phone
  cd.push(
    {
      value: mobilePhone === undefined || mobilePhone === null  ? "" : mobilePhone,
      type: "phone",
      label: "mobilePhone",
      description: "cell phone number"
    }
  );

  return cd;
}

module.exports.contactDataToOih = function(msg) {

  const jsonataExpression =
  {
    meta: {
      recordUid: msg.meta.recordUid,
      applicationUid: (msg.meta.applicationUid!=undefined && msg.meta.applicationUid!=null) ? msg.meta.applicationUid : 'appUid not set yet',
      iamToken: (msg.meta.iamToken!=undefined && msg.meta.iamToken!=null) ? msg.meta.iamToken : 'iamToken not set yet',
      domainId: 'TO BE ADDED',
      schemaURI: 'TO BE ADDED'
    },
    data: {
      title: msg.data.title === undefined || msg.data.title === null  || msg.data.title === null  ? "" : msg.data.title,
      salutation: msg.data.salutation === undefined || msg.data.salutation === null  ? "" : msg.data.salutation,
      firstName: msg.data.firstName === undefined || msg.data.firstName === null  ? "" : msg.data.firstName,
      middleName: msg.data.middleName === undefined || msg.data.middleName === null  ? "" : msg.data.middleName,
      lastName: msg.data.lastName === undefined || msg.data.lastName === null  ? "" : msg.data.lastName,
      displayName:  msg.data.displayName === undefined || msg.data.displayName === null  ? "" : msg.data.displayName,
      gender: "",
      birthday: msg.data.birthday === undefined || msg.data.birthday === null  ? "" : msg.data.birthday,
      notes: msg.data.personalNotes === undefined || msg.data.personalNotes === null  ? "" : msg.data.personalNotes,
      language: "",
      nickname: "",
      photo: "",
      anniversary: "",
      jobTitle: msg.data.jobTitle === undefined || msg.data.jobTitle === null  ? "" : msg.data.jobTitle,
      addresses: mapMicrosoftAddressDataToOIH([msg.data.homeAddress, msg.data.businessAddress, msg.data.otherAddress]),
      contactData: mapContactDataToOIH(msg.data.emailAddresses, msg.data.homePhones, msg.data.imAddresses, msg.data.mobilePhone),
      calendars: [
        {
          calendar: "",
          busyCalendar: "",
          requestCalendar: ""
        }
      ],
      categories: [
        {
          name: "",
          label: ""
        }
      ],
    }
  };

  return jsonataExpression;
}
