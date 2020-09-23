const jsonata = require('jsonata');

function mergeArrays(newArray, oldArray){
  let result = oldArray;
  let hash = {};
  let index;
  for(index in oldArray) {
    if(typeof oldArray[index] === 'object') {
      hash[oldArray[index].address] = 1;
    } else {
      hash[oldArray[index]] = 1;
    }
  }

  for(index in newArray) {
    if(typeof newArray[index] === 'object') {
      if(!(newArray[index].address in hash)) result.push(newArray[index]);
    } else {
      if(!(newArray[index] in hash)) result.push(newArray[index]);
    }
  }

  return result;
}

function transformOIHAddressToMicrosoft(address) {
  const result = {
    street: `${address.street} ${address.streetNumber}`,
    city: address.city,
    state: address.district,
    countryOrRegion: address.country,
    postalCode: address.zipcode
  };

  return result;
}

module.exports.contactDataFromOih = function(entry, oldEntry) {

  const newEntry = {};

  // Adding / updating simple fields
  const simpleFields = ['displayName', 'middleName', 'nickName', 'jobTitle', 'birthday', 'title'];
  let index;
  for(index in simpleFields) {
    if(simpleFields[index] in entry && entry[simpleFields[index]] !== ''){
      newEntry[simpleFields[index]] = entry[simpleFields[index]].trim();
    }
  }

  // Handling date format
  if('birthday' in newEntry) {
    try {
      let formattedDate = newEntry['birthday'].trim().split('.');
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
          newEntry['birthday'] = formattedDate;
        } else {
          delete newEntry['birthday'];
        }
      } else {
        delete newEntry['birthday'];
      }
    } catch(e) {
      console.error(e);
      delete newEntry['birthday'];
    }
  }

  // Map OrganizationToPerson relation 1 to companyName

  if(entry.relations && entry.relations.length > 0) {
    for(index in entry.relations) {
      if(entry.relations[index].type === 'OrganizationToPerson') {
        newEntry.companyName = entry.relations[index].partner.name;
        break;
      }
    }
  }

  // contactData
  let mobile = false;
  let homePhones = [];
  let businessPhones = [];
  let emailAddresses = []; // [{ name: 'folder@email.com', address: 'folder@email.com' }]
  let imAddresses = []; // []
  let businessHomePage = false;

  if('contactData' in entry){
    for(index in entry.contactData) {
      if(entry.contactData[index].type === 'email'){
        emailAddresses.push({ name: entry.contactData[index].value, address: entry.contactData[index].value });
      } else if(entry.contactData[index].type === 'mobil'){

        if(mobile === false && (!oldEntry || oldEntry.mobilePhone === null || oldEntry.mobilePhone.trim() === '' || oldEntry.mobilePhone === 'null')) {
          mobile = entry.contactData[index].value;
        } else if(oldEntry && oldEntry.mobilePhone === entry.contactData[index].value) {
          // skip if ident
          continue;
        } else {
          businessPhones.push(entry.contactData[index].value);
        }
      } else if(entry.contactData[index].type === 'phone'){
        let phoneType = 'home';
        if('categories' in entry.contactData[index] && entry.contactData[index].categories.length > 0) {
          let subIndex;
          for(subIndex in entry.contactData[index].categories) {
            const label = entry.contactData[index].categories[subIndex].label.toLowerCase();
            if(
              label.indexOf('work') > -1
              || label.indexOf('business') > -1
              || label.indexOf('arbeit') > -1
              || ('contextRef' in entry.contactData[index] && typeof entry.contactData[index].contextRef === 'string' && entry.contactData[index].contextRef.trim() !== '')
            ) {
              phoneType = 'business';
              break;
            }
          }
        }

        if(phoneType === 'home') {
          homePhones.push(entry.contactData[index].value);
        } else {
          businessPhones.push(entry.contactData[index].value);
        }

      } else if(entry.contactData[index].type === 'fax'){
        businessPhones.push(entry.contactData[index].value);
      } else if(entry.contactData[index].type === 'skype'){
        imAddresses.push(entry.contactData[index].value);
      } else if(entry.contactData[index].type === 'xing'){
        imAddresses.push(entry.contactData[index].value);
      } else if(entry.contactData[index].type === 'facebook'){
        imAddresses.push(entry.contactData[index].value);
      } else if(entry.contactData[index].type === 'website'){
        if(businessHomePage === false) {
          businessHomePage = entry.contactData[index].value
        } else {
          imAddresses.push(entry.contactData[index].value);
        }
      }

    }
  }

  if(mobile !== false) {
    newEntry.mobilePhone = mobile;
  }

  if(businessHomePage !== false) {
    newEntry.businessHomePage = businessHomePage;
  }

  // Adresses

  let homeAddress = false;
  let businessAddress = false;
  let otherAddress = false;
  if('addresses' in entry){
    for(index in entry.addresses) {
      let addressType = 'home';
      if(homeAddress !== false && otherAddress === false) addressType = 'other';
      if(homeAddress !== false && businessAddress !== false) addressType = 'business';

      let subIndex;
      for(subIndex in entry.addresses[index].categories) {
        const label = entry.addresses[index].categories[subIndex].label.toLowerCase();
        if(
          label.indexOf('work') > -1
          || label.indexOf('business') > -1
          || label.indexOf('arbeit') > -1
          || ('contextRef' in entry.addresses[index] && typeof entry.addresses[index].contextRef === 'string' && entry.addresses[index].contextRef.trim() !== '')
        ) {
          addressType = 'business';
          break;
        }
      }

      if(addressType === 'home') {
        if(homeAddress === '') {
          homeAddress = entry.addresses[index];
        } else if(businessAddress === '') {
          businessAddress = entry.addresses[index];
        } else {
          otherAddress = entry.addresses[index];
        }
      }

      if(addressType === 'business') {
        if(businessAddress === '') {
          businessAddress = entry.addresses[index];
        } else {
          otherAddress = entry.addresses[index];
        }
      }

      if(addressType === 'other') {
        if(otherAddress === '') {
          otherAddress = entry.addresses[index];
        } else {
          console.log(entry.addresses[index]);
          console.log('Skipped because target does not accept that many addresses');
        }
      }
    }
  }

  // add new array values to old array (is ignoring deletes)

  if(!oldEntry || typeof oldEntry !== 'object') {
    newEntry.homePhones = homePhones;
    newEntry.businessPhones = businessPhones;
    newEntry.emailAddresses = emailAddresses;
    newEntry.imAddresses = imAddresses;
  } else {
    newEntry.homePhones = mergeArrays(homePhones, oldEntry.homePhones);
    newEntry.businessPhones = mergeArrays(businessPhones, oldEntry.businessPhones);
    newEntry.emailAddresses = mergeArrays(emailAddresses, oldEntry.emailAddresses);
    newEntry.imAddresses = mergeArrays(imAddresses, oldEntry.imAddresses);
  }


  // Update / add Address if any change

  if(oldEntry && typeof oldEntry === 'object') {
    if(homeAddress !== oldEntry.homeAddress){
      newEntry.homeAddress = (homeAddress === false)? oldEntry.homeAddress : transformOIHAddressToMicrosoft(homeAddress);
    }

    if(businessAddress !== oldEntry.businessAddress){
      newEntry.businessAddress = (businessAddress === false)? oldEntry.businessAddress : transformOIHAddressToMicrosoft(businessAddress);
    }

    if(otherAddress !== oldEntry.otherAddress){
      newEntry.otherAddress = (otherAddress === false)? oldEntry.otherAddress : transformOIHAddressToMicrosoft(otherAddress);
    }
  } else {
    newEntry.homeAddress = (homeAddress === false)? {} : transformOIHAddressToMicrosoft(homeAddress);
    newEntry.businessAddress = (businessAddress === false)? {} : transformOIHAddressToMicrosoft(businessAddress);
    newEntry.otherAddress = (otherAddress === false)? {} : transformOIHAddressToMicrosoft(otherAddress);
  }


  if(!oldEntry || typeof oldEntry !== 'object') {
    newEntry.givenName = entry.firstName;
    newEntry.surname = entry.lastName;
  }

  return newEntry;
}
