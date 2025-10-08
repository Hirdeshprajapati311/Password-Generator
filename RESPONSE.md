This is post response
{
    "userId": "68e3c6bcae6c8095e05953e7",
    "title": "Gmail",
    "username": "myemail@gmail.com",
    "encrypted": {
        "ciphertext": "abcd1234...",
        "iv": "ivhex...",
        "tag": "taghex...",
        "algorithm": "aes-256-gcm",
        "salt": "randomsalt..."
    },
    "url": "https://mail.google.com",
    "notes": "Personal email account",
    "_id": "68e3d6b0ae6c8095e05953ea",
    "createdAt": "2025-10-06T14:48:16.069Z",
    "updatedAt": "2025-10-06T14:48:16.069Z",
    "__v": 0
}

This is get response
[
    {
        "_id": "68e3d6b0ae6c8095e05953ea",
        "userId": "68e3c6bcae6c8095e05953e7",
        "title": "Gmail",
        "username": "myemail@gmail.com",
        "encrypted": {
            "ciphertext": "abcd1234...",
            "iv": "ivhex...",
            "tag": "taghex...",
            "algorithm": "aes-256-gcm",
            "salt": "randomsalt..."
        },
        "url": "https://mail.google.com",
        "notes": "Personal email account",
        "createdAt": "2025-10-06T14:48:16.069Z",
        "updatedAt": "2025-10-06T14:48:16.069Z",
        "__v": 0
    }
]

This is put response

{
    "_id": "68e3d6b0ae6c8095e05953ea",
    "userId": "68e3c6bcae6c8095e05953e7",
    "title": "Gmail",
    "username": "myemail@gmail.com",
    "encrypted": {
        "ciphertext": "Hirdesh...",
        "iv": "newiv...",
        "tag": "newtag...",
        "algorithm": "aes-256-gcm",
        "salt": "newsalt..."
    },
    "url": "https://mail.google.com",
    "notes": "Updated notes",
    "createdAt": "2025-10-06T14:48:16.069Z",
    "updatedAt": "2025-10-06T14:53:23.237Z",
    "__v": 0
}


this is delete response

{
    "success": true
}



# Login ID

{
  "email": "test@example.com",
  "password": "12345678",
  "action": "login"
}