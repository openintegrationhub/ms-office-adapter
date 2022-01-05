const { transform } = require('@openintegrationhub/ferryman');
const _ = require('lodash');
const { mergeArrays, getFolders } = require('../helpers'); // newMessage,
const ApiClient = require('../apiClient');
const processContactData = require('../processContactDataHelper').processContactData;
const { contactDataFromOih } = require('../transformations/contactDataFromOih');


async function processAction(msg, cfg)
{
    const self = this;

    // const apiCall = `/me/contacts`;
    const instance = new ApiClient(cfg, self);

    // console.log('CFG:', cfg);

    if (cfg.deletes && msg.data.deleteRequested) {
      const { success, timestamp } = await instance.delete(`/me/contacts/${msg.metadata.recordUid}`);

      const response = {
        metadata: msg.metadata,
        data: {
          delete: status,
          timestamp,
        },
      };

      return this.emit('data', response);
    }

    async function createFolder(folderName){
      const newFolder = {
        // "parentFolderId": "parentFolderId-value",
        displayName: folderName,
      };

      try {
        const folderResult = await instance.post('/me/contactFolders', newFolder);
        return folderResult;
      } catch (err) {
        console.error('Error:', err);
        return {};
      }
    }

    async function checkExistent(id, folders){
      try {
        let results = await instance.get(`/me/contacts/${id}`);

        if(results) {
          if('id' in results) {
            return results;
          }

          if(results.value && results.value.length > 0){
            return results.value[0];
          }
        }

        // Check in all folders
        for(const key in folders) {
          results = await instance.get(`/me/contactFolders/${folders[key]}/contacts/${id}`);

          if(results) {
            if('id' in results) {
              return results;
            }

            if(results.value && results.value.length > 0){
              return results.value[0];
            }
          }
        }
      } catch (err) {
        console.error('Error:', err);
        return false;
      }

      return false;
    }

    function scoreCandidate(contact, candidate) {
        let score = 0;

        if('givenName' in contact && 'givenName' in candidate) {
          if(contact.givenName == candidate.givenName) {
            score += 0.5;
          } else if(
            contact.givenName.indexOf(candidate.givenName) > -1
            ||
            candidate.givenName.indexOf(contact.givenName) > -1
          ) {
            score += 0.25;
          }
        }

        if('surname' in contact && 'surname' in candidate) {
          if(contact.surname == candidate.surname) {
            score += 0.5;
          } else if(
            contact.surname.indexOf(candidate.surname) > -1
            ||
            candidate.surname.indexOf(contact.surname) > -1
          ) {
            score += 0.25;
          }
        }

        return score;
    }

    async function findExistent(contact, folders){
      let candidate = false;
      let candidateScore = -1;

      if (contact && 'emailAddresses' in contact) {
        for(let i=0; i<contact.emailAddresses.length; i+=1) {
          try {
            const email = contact.emailAddresses[i].address;

            const filter = `emailAddresses/any(a:a/address eq '${email}')`.replace(/ /g, '%20').replace(/'/g, '%27');
            // console.log('Filter', filter);
            let results = await instance.get(`/me/contacts?$filter=${filter}`);

            if(results) {
              // console.log('Email:', email);
              // console.log(JSON.stringify(results));
              if('id' in results) {
                // return results;
                const currentScore = scoreCandidate(contact, results);
                if(currentScore > candidateScore || !candidate) {
                  candidate = results;
                  candidateScore = currentScore;
                }
              }

              if(results.value && results.value.length > 0){
                // return results.value[0];
                for(let j=0; j < results.value.length; j+=1) {
                  const currentScore = scoreCandidate(contact, results.value[j]);
                  if(currentScore > candidateScore || !candidate) {
                    candidate = results.value[j];
                    candidateScore = currentScore;
                  }
                }
              }
            }



            // Check in all folders
            for(const key in folders) {
              results = await instance.get(`/me/contactFolders/${folders[key]}/contacts?$filter=${filter}`);
              if(results) {
                // console.log(key, 'folder', folders[key]);
                // console.log('Email:', email);
                // console.log(JSON.stringify(results));
                if('id' in results) {
                  // return results;
                  const currentScore = scoreCandidate(contact, results);
                  if(currentScore > candidateScore || !candidate) {
                    candidate = results;
                    candidateScore = currentScore;
                  }
                }

                if(results.value && results.value.length > 0){
                  // return results.value[0];
                  for(let j=0; j < results.value.length; j+=1) {
                    const currentScore = scoreCandidate(contact, results.value[j]);
                    if(currentScore > candidateScore || !candidate) {
                      candidate = results.value[j];
                      candidateScore = currentScore;
                    }
                  }
                }
              }
            }

            return candidate;
          } catch (err) {
            console.error('Error:', err);
            return candidate;
          }
        }
      }

      return candidate;
    }


    async function addContact(postRequestBody, meta)
    {
        // console.log('In addContact');
        // console.log(postRequestBody, meta);
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
          existent = await checkExistent(meta.recordUid, folders)
          // console.log('ex1', JSON.stringify(existent));
          if(existent !== false && 'id' in existent) console.log('Found record via recordUid');
        }

        if(existent === false){
          existent = await findExistent(postRequestBody, folders);
          // console.log('ex2', JSON.stringify(existent));
          if(existent !== false && 'id' in existent) console.log('Found record with matching email');
        }


        if(existent !== false && existent.id) {
          const newBody = mergeArrays(postRequestBody, existent);
          return instance.patch(`${actionUrl}/${existent.id}`, newBody);
        } else {
          return instance.post(actionUrl, postRequestBody);
        }
    }

    function emitData(data)
    {
        const id = data.id;
        const messageBody = _.omitBy(data, (value, key) => key.startsWith('@odata.'));

        // self.emit('data', newMessage(messageBody));
        self.emit('data', messageBody);
    }

    function emitError(e)
    {
        self.emit('error', e);
    }

    function emitEnd()
    {
        self.emit('end');
    }

    const transformedData = transform(msg.data, cfg, contactDataFromOih)
    const result = await addContact(transformedData, msg.metadata);

    const metadata = msg.metadata;

    if('id' in result) {
      metadata.recordUid = result.id;
    }

    // console.log('Result', JSON.stringify(result));
    // console.log('metadata', metadata);
    // console.log('transformedData', transformedData);

    emitData({ data: transformedData, metadata, });


    // return emitEnd();
}

module.exports.process = processAction;
