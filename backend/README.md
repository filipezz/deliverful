## Deliverful server

### Running

- Install firebase-tools globally (if required)

```sh
  $ npm install -g firebase-tools
```

- Install dependencies

```sh
  $ cd functions
  $ npm install # or npm i
```

- Start the development server (firebase-tools required)

```sh
  $ cd functions # if not already into functions directory
  $ npm run serve
```

### Running with Docker

- Requirements
  - Install [Docker CLI](https://docs.docker.com/get-docker/)
  - (Optionally) Install [docker-compose CLI](https://docs.docker.com/compose/install/)

- Docker CLI only (Tested in Unix):
```sh
  $ docker build -t pablito/deliverful-server .
  $ docker run -d -p 5061:5061 --name deliverful-server \
    -v $PWD:/usr/src/app \
    -v /usr/src/app/node_modules \
    -t pablito/deliverful-server
```

- OR with docker-compose CLI:
```sh
  $ docker-compose up -d
```

### Testing

- Use any API testing tool that you like (eg.: Insomnia, Postman, etc.)
- Use http://localhost:5061 as your base URL
- Check the console (after starting the server), for the list of available functions/endpoints
