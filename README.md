# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). Only registered users are able to access the edit and delete functions. But in case a user shares a shortURL link it will be possible to be redirected to the actual webpage weather the users is signed in or not.

  1. Loggin and Logout implemented.
  2. Urls are associated with registered users.
  3. Sharing of short URL will redirect to the webpage regardless of the user status(loggind or not)
  4. Editing is available, and if you accidentaly edit a webpage or try to create a URL for the same webpage, fret not!! you will be shown your previous URL so repeating websites its a thing of the past.
  5. If anohter user or someone not logged in trys to edit your URLs, dont worry we can check and they wont be allowed. 
  6 if you are logged in and accidentally go to the register or loginPage dont worry you will be properly redirected to your Index page


  Below you can see some images of the finished app. 

## Final Product

!["Index page"](https://github.com/BRB3D/tinyapp/blob/main/docs/Index.png?raw=true)

!["Edit page"](https://github.com/BRB3D/tinyapp/blob/main/docs/edit.png?raw=true)

!["Registration Page"](https://github.com/BRB3D/tinyapp/blob/main/docs/Registration.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
