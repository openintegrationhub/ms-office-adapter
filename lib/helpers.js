
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



module.exports = {
  newMessage,
  getFolders,
};
