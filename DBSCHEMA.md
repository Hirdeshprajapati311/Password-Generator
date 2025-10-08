

# MongoDB collection
users
vault_items

## users
_id       -> Auto-generated unique user ID
email     -> Unique user email (lowercase)
password  -> Bcrypt hash of user password
salt      -> Bcrypt salt
createdAt -> Timestamp of signup
updatedAt -> Timestamp of last login

## vault_items
_id       -> Auto-generated unique item
userId    -> reference to users._id
title     -> Vault item title
encrypted -> the encrypted value item
   {
     ciphertext -> Base64 or hex encoded encrypted data
     salt      -> Base64 or hex encoded salt
     tag       -> Base64 or hex encoded authentication tag
   }
createdAt -> Timestamp of creation
updatedAt -> Timestamp of last update

### optional 

tags:["work", "personal"]
folder:"social"

twoFactorSecret: String
