const _ = require('lodash');
const { newMessage, getFolders } = require('../helpers');
const ApiClient = require('../apiClient');
const processContactData = require('../processContactDataHelper').processContactData;


async function processAction(msg, cfg)
{
    const self = this;

    console.log('msg:', msg);

    // const apiCall = `/me/contacts`;
    const instance = new ApiClient(cfg, self);

    console.log("Hi, you reached FLAG 1!");

    async function createFolder(folderName){
      const newFolder = {
        // "parentFolderId": "parentFolderId-value",
        displayName: folderName,
      };
      console.log('Creating folder');
      console.log(folderName);

      try {
        const folderResult = await instance.post('/me/contactFolders', newFolder);
        console.log(folderResult);
        return folderResult;
      } catch (err) {
        console.error('Error:', err);
        return {};
      }
    }

    async function getExistent(id, folders){
      try {
        let results = await instance.get(`/me/contacts/${id}`);

        if('id' in results) {
          return results.id;
        }

        if(results.value && results.value.length > 0){
          return results.value[0].id;
        }

        // Check in all folders
        for(const key in folders) {
          results = await instance.get(`/me/contactFolders/${folders[key]}/contacts?$filter=${filter}`);

          if('id' in results) {
            return results.id;
          }

          if(results.value && results.value.length > 0){
            return results.value[0].id;
          }
        }
      } catch (err) {
        console.error('Error:', err);
        return false;
      }

      return false;
    }

    async function getExistent(contact, folders){
      if ('emailAddresses' in contact) {
        for(let i=0; i<contact.emailAddresses.length; i+=1) {
          try {
            const email = contact.emailAddresses[i].address;
            const filter = `emailAddresses/any(a:a/address eq '${email}')`.replace(/ /g, '%20').replace(/'/g, '%27');
            let results = await instance.get(`/me/contacts?$filter=${filter}`);
            if(results.value && results.value.length > 0){
              return results.value[0].id;
            }

            // Check in all folders
            for(const key in folders) {
              results = await instance.get(`/me/contactFolders/${folders[key]}/contacts?$filter=${filter}`);
              if(results.value && results.value.length > 0){
                return results.value[0].id;
              }
            }
          } catch (err) {
            console.error('Error:', err);
            return false;
          }
        }
      }

      return false;
    }

    async function addContact(postRequestBody, meta)
    {
        //  Check if contact has folder
        let folderId = false;
        let folders;
        if('folder' in postRequestBody) {
          if(postRequestBody.folder && postRequestBody.folder.trim().length > 0) {
            folders = await getFolders(instance);

            if(postRequestBody.folder in folders) {
              folderId = folders[postRequestBody.folder];
            } else {
              // Create new folder
              const result = await createFolder(postRequestBody.folder);
              folderId = result.id;
              folders[postRequestBody.folder] = folderId;
            }
          }

          delete postRequestBody.folder;
        }

        // Save data
        const actionUrl = (folderId === false)? '/me/contacts' : `/me/contactFolders/${folderId}/contacts`;

        let existent = false;
        if('recordUid' in meta) {
          console.log(`RecordUid ${meta.recordUid}`);
          existent = await checkExistent(meta.recordUid)
          if(existent !== false) console.log('Existent record');
        }

        if(existent === false){
          existent = await getExistent(postRequestBody, folders);
          if(existent !== false) console.log('Found record with matching email');
        }

        console.log('actionUrl', actionUrl);

        if(existent !== false) {
          console.log("Hi, you reached FLAG 3U- updating the Contact!");
          return instance.patch(`${actionUrl}/${existent}`, postRequestBody);
        } else {
          console.log("Hi, you reached FLAG 3- adding the Contact!");
          return instance.post(actionUrl, postRequestBody);
        }
    }

    function emitData(data)
    {
        console.log("Hi, you reached FLAG 4- emitting the data!");
        const id = data.id;
        const messageBody = _.omitBy(data, (value, key) => key.startsWith('@odata.'));
        // messageBody.companyName = cfg.companyName;
        // messageBody.surname = cfg.surname;
        // messageBody.givenName = cfg.givenName;
        // messageBody.emailAddresses = cfg.emailAddresses;
        // messageBody.businessPhones = cfg.businessPhones;
        self.emit('data', newMessage(messageBody));
    }

    function emitError(e)
    {
        self.emit('error', e);
    }

    function emitEnd()
    {
        self.emit('end');
    }

    await addContact(msg.body.data, msg.body.meta);
    emitData(msg.body);


    return promise.finally(emitEnd);
}

module.exports.process = processAction;
