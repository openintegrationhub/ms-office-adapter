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

const Q = require('q');
const ApiClient = require('../apiClient');
const { newMessage, getFolders } = require('../helpers');


/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  // Authenticate and get the token from Snazzy Contacts
  const { applicationUid, domainId, schema, acces } = cfg;

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
    }

    // Loop through all pages
    let c = 0;
    while('@odata.nextLink' in result){
      c += 100;
      result = await instance.get(`/me/contacts?$filter=${filter}&$top=100&$skip=${c}`);
      if('value' in result) {
        contacts = contacts.concat(result.value);
      }
    }
    return contacts;
  }

  async function getAllContacts(from, until) {
    let contacts = await getContacts(instance, from, until);

    // Get all contacts in folders
    const folders = await getFolders(instance);
    for(key in folders) {
      const folderId = folders[key];
      const results = await getContacts(instance, from, until, folderId);
      for(let i=0; i<results.length; i+=1) {
        results[i].folder = key;
      }

      contacts = contacts.concat(results);
    }

    return contacts;
  }

  async function emitData() {
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

    console.log(`Found ${contacts.result.length} new records.`);

    if (contacts.result.length > 0) {
      contacts.result.forEach((elem) => {
        const newElement = {};
        oihMeta.recordUid = elem.id;
        delete elem.id;

        newElement.meta = oihMeta;
        newElement.data = elem;
        // Emit the object with meta and data properties
        self.emit('data', newMessage(newElement));
      });

      // Get the lastUpdate property from the last object and attach it to snapshot
      snapshot.lastUpdated = contacts.result[contacts.result.length - 1].lastUpdate;
      console.log(`New snapshot: ${snapshot.lastUpdated}`);
      self.emit('snapshot', snapshot);
    } else {
      self.emit('snapshot', snapshot);
    }
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

  /**
   * This method will be called from OIH platform
   * when the execution is finished successfully
   *
   */
  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  Q()
    .then(emitData)
    .fail(emitError)
    .done(emitEnd);
}

module.exports = {
  process: processTrigger,
};
