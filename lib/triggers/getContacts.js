/**
 * Copyright 2019 Wice GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { transform } = require('@openintegrationhub/ferryman');
const ApiClient = require('../apiClient');
const { getFolders } = require('../helpers'); // newMessage,
const { contactDataToOih } = require('../transformations/contactDataToOih')


/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  // Authenticate and get the token from Snazzy Contacts
  const { applicationUid, domainId, schema, acces, deltaToken } = cfg;

  const self = this;
  const instance = new ApiClient(cfg, self);


  // Set the snapshot if it is not provided
  snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime();

  async function getContacts(instance, from, until, folderId){
    let contacts = [];

    const actionUrl = (folderId)? `/me/contactfolders/${folderId}/contacts` : '/me/contacts';

    // const filter = `start/dateTime ge ${from} and end/dateTime le ${until}`.replace(/ /g, '%20');
    // let result = await instance.get(`${actionUrl}?$filter=${filter}&$top=100&$skip=0`);
    let result = await instance.get(`${actionUrl}?$top=100&$skip=0`);

    if('value' in result) {
      contacts = contacts.concat(result.value);
    } else {
      console.log('Missing value key in response!');
      console.log(result);
    }

    // Loop through all pages
    let c = 0;
    while('@odata.nextLink' in result){
      c += 100;
      // result = await instance.get(`/me/contacts?$filter=${filter}&$top=100&$skip=${c}`);
      result = await instance.get(`${actionUrl}?$top=100&$skip=${c}`);
      if('value' in result) {
        contacts = contacts.concat(result.value);
      } else {
        console.log('Missing value key in response!');
        console.log(result);
      }
    }


    return contacts;
  }

  async function getDeletedContacts(instance, deltaToken){
    const deletedContacts = [];

    let url = '/me/contactfolders/me/contacts/delta';
    if (deltaToken) url = url += `?${deltaToken}`;
    console.log('About to get delta');

    let result = await instance.get(url);

    if (('@odata.nextLink') in result) {
      console.log('Received nextLink, following...');
      const nextLink = result['@odata.nextLink'];
      url = nextLink.substring(nextLink.indexOf('/me/'), nextLink.length);

      result = await instance.get(url);
    }

    console.log('Received getDeleted result:', result)

    if('value' in result && result.value.length) {
      console.log('Got result:', result)
      contacts = contacts.concat(result.value);
      for (let i = 0; i < result.value.length; i += 1) {
          if ('@removed' in result[i] && result[i]['@removed'].reason === 'deleted') {
            deletedContacts.push(result[i].id)
          }
      }
    }

    let nextDeltaToken
    if (('@odata.deltaLink') in result) {
      const deltaLink = result['@odata.deltaLink'];
      console.log('Received delta link:', deltaLink);
      nextDeltaToken = deltaLink.substring(deltaLink.indexOf('$deltaToken=', deltaLink.length));
    }

    return { deletedContacts, nextDeltaToken };
  }

  async function getAllContacts(from, until) {
    // console.log('Getting contacts from base folder');
    let contacts = await getContacts(instance, from, until);
    // console.log(`Adding ${contacts.length} contacts to result set`);

    // console.log('Getting all folders');
    // Get all contacts in folders
    const folders = await getFolders(instance);

    // console.log(`Found ${Object.keys(folders).length} folders`);

    for(key in folders) {
      const folderId = folders[key];
      // console.log(`Getting contacts for folder ${key} ${folderId}`);
      const results = await getContacts(instance, from, until, folderId);
      for(let i=0; i<results.length; i+=1) {
        results[i].folder = key;
      }
      // console.log(`Adding ${results.length} contacts to result set`);
      contacts = contacts.concat(results);
    }

    console.log(`${contacts.length} results found`);

    // console.log('Filtering results');

    const filteredContacts = [];
    const length = contacts.length;
    for(let i=0; i<length; i+=1) {
      if('lastModifiedDateTime' in contacts[i]) {
        const timestamp = Date.parse(contacts[i].lastModifiedDateTime);
        // console.log('Entry timestamp:', timestamp);
        // console.log(`From: ${from} Until: ${until}`);
        if(timestamp >= from && timestamp <= until) {
          // console.log('Entry is new!');
          // console.log(contacts[i]);
          filteredContacts.push(contacts[i])
        }
      } else {
        // console.log('Contact', contacts[i]);
        // console.log('Can not filter - key not found - using all entries');
        return contacts;
      }
    }


    return filteredContacts;
  }


    /** Create an OIH meta object which is required
    * to make the Hub and Spoke architecture work properly
    */
    const oihMeta = {
      applicationUid: (applicationUid !== undefined && applicationUid !== null) ? applicationUid : undefined,
      schema: (schema !== undefined && schema !== null) ? schema : undefined,
      domainId: (domainId !== undefined && domainId !== null) ? domainId : undefined,
    };

    // Get all contacts starting from last snapshot or all contacts if no snapshot exists
    const contacts = await getAllContacts(snapshot.lastUpdated, Date.now());

    console.log(`Found ${contacts.length} new records.`);

    if (contacts.length > 0) {
      contacts.forEach((elem) => {
        const newElement = {};
        oihMeta.recordUid = elem.id;
        delete elem.id;

        newElement.metadata = oihMeta;
        newElement.data = elem;

        newElement.data = transform(newElement.data, cfg, contactDataToOih);

        // Emit the object with meta and data properties
        // self.emit('data', newMessage(newElement));
        self.emit('data', newElement);
      });

      if (cfg.deletes) {
        console.log('Checking for deleted contacts');

        const { deletedContacts, nextDeltaToken} = await getDeletedContacts(instance, snapshot.deltaLink)

        for (let i = 0; i < deletedContacts.length; i += 1) {
          self.emit('data', {
            metadata: {
              recordUid: deletedContacts[i]
            },
            data: {
              deleteRequested: true,
            }
          })
        }

        snapshot.deltaToken = nextDeltaToken
      }

      // Save current time in snapshot
      snapshot.lastUpdated = Date.now();
      console.log(`New snapshot: ${snapshot}`);
      self.emit('snapshot', snapshot);
    } else {
      self.emit('snapshot', snapshot);
    }

  /**
   * This method will be called from OIH platform if an error occured
   *
   * @param e - object containg the error
   */
  function emitError(e) {
    console.log(`ERROR: ${e}`);
    self.emit('error', e);
  }
}

module.exports = {
  process: processTrigger,
};
