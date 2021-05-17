# PassMan
## _Password manager web application_

PassMan is a web application that let the users to store their password securely.
It is built using: 
- Express.js
- MySQL

Registered user's passwords are hashed using _bcrypt_ middleware and stored in MySQL database.
Passwords entered by users in order to store in the web application are encrypted using _crypto_ middleware. Users can see decrypted version of  passwords in their profile.
The app needs further improvement and new features.

## Features
- Login and registration functionality.
- Storing encrypted version of passwords.
- Demonstrating list of decrypted  passwords.
- Searching for passwords of specific accounts.
- Deleting and editing functionality.

## Prerequisites
PassMan requires [Node.js](https://nodejs.org/) and [MySQL](https://www.mysql.com/) to run.

## Installation
Clone this repository using:
```sh
git clone https://github.com/Shakar-Gadirli/PassMan.git
```
Install dependencies:
```sh
cd PassMan
npm install
```
Configure MySQL database for the application. Configuration file is _database.sql_.
Execute queries inside the file.

Run applation in localhost:
```sh
node app.js
```
or 
```sh
nodemon app.js
```
## GUI of the application

**Index page**

![Index page](https://i.imgur.com/iHPqGAx.png)

**Log In page**

![Log In page](https://i.imgur.com/gaKmDPy.png)

**Sign Up page**

![Sign Up page](https://i.imgur.com/OyjGciU.png)

**Home page**

![Home page](https://i.imgur.com/90xKgF4.png)

**Adding new password page**

![New password page](https://i.imgur.com/VNI23yj.png)

**Adding new password page**

![New password page](https://i.imgur.com/VNI23yj.png)

**All passwords page**

![All passwords page](https://i.imgur.com/rKDyOZT.png)

**Edit password page**

![Edit password page](https://i.imgur.com/oMV9G2V.png)

**Search result page**

![Search result](https://i.imgur.com/XglK8Vg.png)

**Sticky navigation bar**

![NavBar](https://i.imgur.com/m85b6Lh.png)
