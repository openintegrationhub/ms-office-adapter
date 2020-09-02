const _ = require('lodash');
const { newMessage, getFolders } = require('../helpers');
const ApiClient = require('../apiClient');
const processContactData = require('../processContactDataHelper').processContactData;


function processAction(msg, cfg)
{
    const self = this;

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

    async function addContact(postRequestBody)
    {
        //  Check if contact has folder
        let folderId = false;
        if('folder' in postRequestBody) {
          if(postRequestBody.folder && postRequestBody.folder.trim().length > 0) {
            const folders = await getFolders(instance);

            if(postRequestBody.folder in folders) {
              folderId = folders[postRequestBody.folder];
            } else {
              // Create new folder
              const result = await createFolder(postRequestBody.folder);
              folderId = result.id;
            }
          }

          delete postRequestBody.folder;
        }

        // Save data
        const actionUrl = (folderId === false)? '/me/contacts' : `/me/contactFolders/${folderId}/contacts`;

        console.log("Hi, you reached FLAG 3- adding the Contact!");

        console.log('actionUrl', actionUrl);
        return instance.post(actionUrl, postRequestBody);
    }

    function emitData(data)
    {
        console.log("Hi, you reached FLAG 4- emitting the data!");
        const id = data.id;
        const messageBody = _.omitBy(data, (value, key) => key.startsWith('@odata.'));
        messageBody.companyName = cfg.companyName;
        messageBody.surname = cfg.surname;
        messageBody.givenName = cfg.givenName;
        messageBody.emailAddresses = cfg.emailAddresses;
        messageBody.businessPhones = cfg.businessPhones;
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

    let promise = processContactData(cfg, msg.body)
        .then(addContact)
        .then(emitData);

    return promise.finally(emitEnd);
}

module.exports.process = processAction;
