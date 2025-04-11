# Chat Server

## structure

- `src/`: source code
- `src/models/`: models
- `src/socket/`: socket

# database

- MongoDB

```
docker run -d --name chats-db -p 27017:27017 -v ./data/db:/data/db -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin mongo
```

# run

```
pnpm install
```

## dev

```
pnpm dev
```

## run

```
pnpm run build
pnpm run start
```

