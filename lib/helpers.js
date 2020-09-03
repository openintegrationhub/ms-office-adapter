
const uuid = require('uuid');

function newMessage(body) {
  const msg = {
    id: uuid.v4(),
    attachments: {},
    body,
    headers: {},
    metadata: {},
  };

  return msg;
}


async function getFolders(instance){
  const folders = await instance.get('/me/contactFolders?$top=100');

  const foldersHash = {};
  let index;
  for(index in folders.value) {
    foldersHash[folders.value[index].displayName] = folders.value[index].id;
  }

  return foldersHash;
}

function objectToKey(obj) {
  const objType = typeof obj;
  if(objType !== 'object') return obj;
  if(Array.isArray(obj)) return obj.join('|');

  const keys = Object.keys(obj).sort();

  const keyParts = [];
  let index;
  for(index in keys) {
    keyParts.push(`${keys[index]}_${obj[keys[index]]}`);
  }
  return keyParts.join('_');
}

function mergeArrays(newEntry, oldEntry) {
  for(const key in oldEntry) {
    if(Array.isArray(oldEntry[key])) {
      if(key in newEntry) {
        const arrayData = oldEntry[key];
        const hash = {};
        for(let i=0; i<arrayData.length; i+=1) {
          const hashKey = objectToKey(arrayData[i]);

          hash[hashKey] = 1;
        }

        for(let i=0; i<newEntry[key].length; i+=1) {
          const hashKey = objectToKey(newEntry[key][i]);

          if(!(hashKey in hash)) {
            arrayData.push(newEntry[key][i]);
          }
        }

        newEntry[key] = arrayData;
      } else {
        newEntry[key] = oldEntry[key];
      }
    }
  }

  return newEntry;
}

module.exports = {
  newMessage,
  getFolders,
  mergeArrays,
};
