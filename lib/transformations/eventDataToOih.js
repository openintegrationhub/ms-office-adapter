const jsonata = require('jsonata');
const jsonataMoment = require('@elastic.io/jsonata-moment');

module.exports.getExpression = function(msg)
{
  const jsonataExpression =
  {
      meta: {
        recordUid: msg.body.meta.recordUid,
        applicationUid: (msg.body.meta.applicationUid!=undefined && msg.body.meta.applicationUid!=null) ? msg.body.meta.applicationUid : 'appUid not set yet',
        iamToken: (msg.body.meta.iamToken!=undefined && msg.body.meta.iamToken!=null) ? msg.body.meta.iamToken : 'iamToken not set yet',
        domainId: 'TO BE ADDED',
        schemaURI: 'TO BE ADDED'
      },
      data: {
        collaborationElement: {
          header: {
            from: "",
            to: msg.body.data.attendees !== undefined && msg.body.data.attendees.length > 0 ? jsonata(`$map(msg.body.data.attendees, function($v) {
              $v.emailAddress.address
            })`).evaluate() : [],
            cc: [],
            bcc: [],
            subject: msg.body.data.subject === undefined || msg.body.data.subject === null ? "" : msg.body.data.subject
          },
          date: {
            date: msg.body.data.createdDateTime === undefined || msg.body.data.createdDateTime === null ? "" : msg.body.data.createdDateTime,
            day: msg.body.data.createdDateTime === undefined || msg.body.data.createdDateTime === null ? "" : jsonataMoment('$moment(msg.body.data.createdDateTime).format("dddd")').evaluate(),
            time: msg.body.data.createdDateTime === undefined || msg.body.data.createdDateTime === null ? "" : jsonataMoment('$moment(msg.body.data.createdDateTime).format("HH:mm")').evaluate()
          },
          properties: {
            messageID: msg.body.data.id === undefined || msg.body.data.id === null ? "" : msg.body.data.id,
            language: "",
            authentication: "",
            mimeVersion: 0
          },
          content: {
            format: msg.body.data.body.contentType === undefined || msg.body.data.body.contentType === null ? "" : msg.body.data.body.contentType,
            content: msg.body.data.body.content === undefined || msg.body.data.body.content === null ? "" : msg.body.data.body.content
          },
          attachments: msg.body.data.attachments !== undefined && msg.body.data.attachments.length > 0 ? jsonata(`$map(msg.body.data.attachments, function($v) {
            {
              type: $v.contentType,
              size: $string($v.size)
            }
          })`).evaluate() : []
        },
        contacts: msg.body.data.attendees !== undefined && msg.body.data.attendees.length > 0 ? jsonata(`$map(msg.body.data.attendees, function($v) {
          {
            name: "",
            email: $v.emailAddress.address,
            calendars: [
              {
                calendars: "",
                requestCalendar: "",
                status: ""
              }
            ]
          }
          })`).evaluate() : [],
        location: msg.body.data.location.displayName === undefined || msg.body.data.location.displayName === null ? "" : msg.body.data.location.displayName,
        start: msg.body.data.start.dateTime === undefined || msg.body.data.start.dateTime === null ? "" : msg.body.data.start.dateTime,
        end: msg.body.data.end.dateTime === undefined || msg.body.data.end.dateTime === null ? "" : msg.body.data.end.dateTime,
      }
  };

  return jsonataExpression;
}