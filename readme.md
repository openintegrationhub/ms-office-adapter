# Microsoft Graph Adapter
> Microsoft Graph Adapter for Open Integration Hub.

This is a component for Microsoft Graph, which displays own profile data stored in Microsoft Graph.

## Usage
> Make sure you're using a valid access-token.

https://docs.microsoft.com/en-us/graph/auth-v2-service

## Data
> Returned data looks like this:

```json
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users/$entity",
    "businessPhones":
    [
        "+1 412 555 0109"
    ],
    "displayName": "Megan Bowen",
    "givenName": "Megan",
    "jobTitle": "Auditor",
    "mail": "MeganB@M365x214355.onmicrosoft.com",
    "mobilePhone": null,
    "officeLocation": "12/1110",
    "preferredLanguage": "en-US",
    "surname": "Bowen",
    "userPrincipalName": "MeganB@M365x214355.onmicrosoft.com",
    "id": "48d31887-5fad-4d73-a9f5-3c356e68a038"
}
```

----------

*Copyright (c) 2018 agindo GmbH.*
