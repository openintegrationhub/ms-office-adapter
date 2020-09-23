const jsonata = require('jsonata');

module.exports.contactDataFromOih = function(msg) {

  let email;
  let mobile_phone;
  let phone;
  let private_street;
  let private_street_number;
  let private_town;
  let private_country;
  let private_zip_code;

  if (msg.body.data.contactData) {
    const foundEmail = msg.body.data.contactData.find(cd => cd.type === 'email');
    if (foundEmail) email = foundEmail.value;

    const foundMobile = msg.body.data.contactData.find(cd => (cd.type === 'mobil' || cd.type === 'mobile'));
    if (foundMobile) mobile_phone = foundMobile.value;

    const foundPhone = msg.body.data.contactData.find(cd => cd.type === 'phone');
    if (foundPhone) phone = foundPhone.value;
  }

  if (msg.body.data.addresses) {
    const foundAddress = msg.body.data.addresses.find(adr => adr.description === 'primary');
    if (!foundAddress && msg.body.data.addresses.length > 0) {
      foundAddress = msg.body.data.addresses[0];
    }

    if (foundAddress) {
      private_street = foundAddress.street;
      private_street_number = foundAddress.streetNumber;
      private_town = foundAddress.city;
      private_country = foundAddress.country;
      private_zip_code = foundAddress.zipCode;
    }
  }

  let birthday = '';
  if(msg.body.data.birthday) {
    let formattedDate = msg.body.data.birthday.trim().split('.');
    if(formattedDate.length === 3) {
      const year = (formattedDate[2].length === 4)? formattedDate[2] : `${19}${formattedDate[2]}`;
      let month;
      let day;
      if(parseInt(formattedDate[1], 10) > 13) {
        day = formattedDate[1];
        month = formattedDate[0];
      } else {
        day = formattedDate[0];
        month = formattedDate[1];
      }

      formattedDate = `${year}-${month}-${day}T00:00:00Z`;
      if(formattedDate.length === 20) {
        birthday = formattedDate;
      }
    }
  }

  const expression =
  {
    data: {
      assistantName: "",
      birthday: birthday,
      businessAddress: {
                            "postalCode": (jsonata(`$filter(msg.body.data.addresses, function($v) {$v.description = "primary"})`).evaluate()).zipCode,
                            "countryOrRegion": (jsonata(`$filter(msg.body.data.addresses, function($v) {$v.description = "primary"})`).evaluate()).country,
                            "state": (jsonata(`$filter(msg.body.data.addresses, function($v) {$v.description = "primary"})`).evaluate()).region,
                            "city": (jsonata(`$filter(msg.body.data.addresses, function($v) {$v.description = "primary"})`).evaluate()).city,
                            "street": (jsonata(`$filter(msg.body.data.addresses, function($v) {$v.description = "primary"})`).evaluate()).street
                          },
      businessHomePage: "",
      businessPhones: (jsonata(`$filter(msg.body.data.contactData, function($v) {$v.description = "business" and $v.type = "phone"})`).evaluate()),
      categories: [""],
      changeKey: "",
      children: [""],
      companyName: "",
      createdDateTime: "",
      department: "",
      displayName: msg.body.data.firstName &' '& msg.body.data.middleName != '' ||  msg.body.data.middleName != undefined ? msg.body.data.middleName : '' &' '& msg.body.data.lastName,
      emailAddresses: (jsonata(`$filter(msg.body.data.contactData, function($v) {$v.type = "email"})`).evaluate()).value,
      fileAs: msg.body.data.firstName + ' ' + msg.body.data.middleName !== '' ||  msg.body.data.middleName !== undefined ? msg.body.data.middleName : '' + ' ' + msg.body.data.lastName,
      generation: "",
      givenName: msg.body.data.firstName,
      homeAddress: {
                        postalCode: private_zip_code,
                        countryOrRegion: (jsonata(`$filter(msg.body.data.addresses, function($v) {$v.description = "mailing"})`).evaluate()).country,
                        state: (jsonata(`$filter(msg.body.data.addresses, function($v) {$v.description = "mailing"})`).evaluate()).region,
                        city: (jsonata(`$filter(msg.body.data.addresses, function($v) {$v.description = "mailing"})`).evaluate()).city,
                        street: (jsonata(`$filter(msg.body.data.addresses, function($v) {$v.description = "mailing"})`).evaluate()).street,
                      },
      homePhones: (jsonata(`$filter(msg.body.data.contactData, function($v) {$v.description = "private" and $v.type = "phone"})`).evaluate()).value,
      id: "",
      imAddresses: ["None"],
      initials: "",
      jobTitle: msg.body.data.jobTitle,
      lastModifiedDateTime: "",
      manager: "",
      middleName: msg.body.data.middleName,
      mobilePhone: (jsonata(`$filter(msg.body.data.contactData, function($v) {$v.description = "mobile" and $v.type = "phone"})`).evaluate()).value,
      nickName: msg.body.data.nickname,
      officeLocation: "",
      otherAddress: {},
      parentFolderId: "",
      personalNotes: "",
      profession: "",
      spouseName: "",
      surname: msg.body.data.lastName,
      title: msg.body.data.title,
      yomiCompanyName: "",
      yomiGivenName: "",
      yomiSurname: "",

      photo: { }
    },
    meta: msg.body.meta
  }

  return expression;
}
