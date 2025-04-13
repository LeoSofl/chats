# Gradual Community chat

a simple chat app for Gradual Community

## web

### run

```
pnpm install
pnpm dev
```

## server

```
pnpm install
pnpm dev
```


## database

- MongoDB

```
docker run -d --name chats-db -p 27017:27017 -v ./data/db:/data/db -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin mongo
```
