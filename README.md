# Todo Application

This is a Todo application built using NestJS, MongoDB, AWS S3 for image storage, JSON Web Tokens (JWT) for authentication, and bcrypt for password hashing. The project utilizes pnpm as the package manager.




## Deployment Status
This project has been successfully deployed on Render.com.

For more information about Render, visit 

[Project Backend Swager ](https://todos-api-m88q.onrender.com/api)

[Project Frontend](https://react-todo-app-nd02.onrender.com/)


## Login Credentials

- **Email:** berkay@mail.com
- **Password:** 123123Ab*


## Features

- **User Authentication:** Allows users to register and login securely using JWT.
- **Todo Operations:** Users can add, remove, search, and filter todos.
- **Image Upload:** Supports uploading images for todos, stored in AWS S3 bucket.
- **Password Security:** Utilizes bcrypt to securely hash and store user passwords.
- **Database:** MongoDB is used as the database to store user information and todos.

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js
- MongoDB
- AWS S3 Bucket (for image storage)
- pnpm (recommended package manager)

## Installation

1. Clone the repository:
2. Navigate to the project directory:

```bash
cd todos-api
pnpm install
```


## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

