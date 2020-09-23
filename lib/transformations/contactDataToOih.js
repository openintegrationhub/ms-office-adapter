const jsonata = require('jsonata');


module.exports.contactDataToOih = function(contact) {
    const mapping = {
    assistantName: 'ignore',
    birthday: 'birthday',
    businessAddress: 'addresses',
    businessHomePage: ['contactData', 'website'],
    businessPhones: ['contactData', 'phone'],
    categories: 'categories',
    changeKey: 'ignore',
    children: 'ignore',
    companyName: 'name',
    createdDateTime: 'ignore',
    department: 'categories',
    displayName: 'displayName',
    emailAddresses: ['contactData', 'email'],
    fileAs: 'ignore',
    generation: 'ignore',
    givenName: 'firstName',
    homeAddress: 'addresses',
    homePhones: ['contactData', 'phone'],
    id: 'ignore',
    imAddresses: ['contactData', 'social'],
    initials: 'ignore',
    jobTitle: 'jobTitle',
    lastModifiedDateTime: 'ignore',
    manager: 'ignore',
    middleName: 'ignore',
    mobilePhone: ['contactData', 'mobil'],
    nickName: 'nickname',
    officeLocation: 'ignore',
    otherAddress: 'addresses',
    parentFolderId: 'ignore',
    personalNotes: 'notes',
    profession: 'title',
    spouseName: 'ignore',
    surname: 'lastName',
    title: 'ignore',
    yomiCompanyName: 'ignore',
    yomiGivenName: 'ignore',
    yomiSurname: 'ignore',
    photo: 'photo',
    folder: 'categories',
  };

  const addressMapping = {
    city: ['addresses', 'city'],
    countryOrRegion: ['addresses', 'country'],
    postalCode: ['addresses', 'zipcode'],
    state: ['addresses', 'state'],
    street: ['addresses', 'street'], // contains streetNumber too
    streetNumber: ['addresses', 'streetNumber'],
  };

  const newContact = {
    firstName: '',
    lastName: '',
    gender: '',
    jobTitle: '',
    nickname: '',
    displayName: '',
    middleName: '',
    salutation: '',
    title: '',
    birthday: '',
    addresses: [],
    contactData: [],
    categories: [],
  };

  let key;
  for(key in contact) {
    if(key in mapping) {
      if(contact[key] === null) contact[key] = '';
      if(mapping[key] !== 'ignore') {
        if(Array.isArray(mapping[key])) {
          if(mapping[key][0] === 'contactData') {
            if(key === 'emailAddresses') {
              for(let i=0; i<contact[key].length; i+=1) {
                if(contact[key][i] === null) contact[key][i] = '';
                newContact.contactData.push({"type": mapping[key][1],"value": contact[key][i].address});
              }
            } else if(key === 'homePhones' || key === 'businessPhones') {
              for(let i=0; i<contact[key].length; i+=1) {
                if(contact[key][i] === null) contact[key][i] = '';
                newContact.contactData.push({"type": mapping[key][1],"value": contact[key][i]});
              }
            } else if(key === 'mobilePhone') {
              newContact.contactData.push({"type": mapping[key][1],"value": contact[key]});
            }
          }
        } else if(mapping[key] === 'addresses'){
          let subKey;
          const newAddress = {};
          for(subKey in contact[key]) {
            if(subKey in addressMapping) {
              if(contact[key][subKey] === null) contact[key][subKey] = '';
              if(subKey === 'street') {
                let street = contact[key][subKey].trim().replace(/[\n]{2,}/u, '\n');
                street = street.split(' ');
                streetNumber = (street.length > 1)? street.pop() : '';
                street = street.join('\n');

                newAddress['street'] = street;
                newAddress['streetNumber'] = streetNumber;
              } else {
                newAddress[addressMapping[subKey][1]] = contact[key][subKey];
              }
            }
          }
          if(Object.keys(newAddress).length > 0) newContact.addresses.push(newAddress)
        } else if(mapping[key] === 'categories'){
          newContact[mapping[key]].push({"label": contact[key]});
        } else {
          newContact[mapping[key]] = contact[key];
        }
      }
    }
  }
  return newContact;
}
