# Take home

See [spec](./spec.md) for take home specification.

## Technical Choices

Stack:

- Typescript, NodeJs v20, Eslint, Prettier: the usual stack for me
- Used Fastify because I'm used to it and provide the perfect amount of abstraction.

Encryption

- Used AES key to encrypt field, because of that I'm storing the IV along the message which can be inefficient but gives us the flexibility to have multiple IVs per payload or partially encrypted payload.
- Used RSA to sign/verify

The keys are saved once, and read at subsequent startups. Obviously if we delete the keys and restart we won't be able to verify or decrypt old messages.
The encryption and detection of encryption could be improved, right now we can for sure end up with false positives. If I had the choice I wouldn't bother encrypting each fields separately unless there is a strong requirement for it. But if there is no choice, we could modify the JSON to change key names (e.g: `{ encrypted_name: value }`) or use a more unique way to detect encryption (it can only reduce false positives as we are limited to JSON standard).

You'll find more details directly in the code.

## Running the project

- Clone repo

```sh
git clone
```

- Use proper node version

```sh
nvm use
```

- Install

```sh
npm install
```

- Build

```sh
npm run build
```

- Start

```sh
npm run start
```

- Lint / Test

```sh
nvm run lint
npm run test
```

---

## Endpoints

### POST /encrypt

```sh
curl --request POST \
  --url http://127.0.0.1:8080/encrypt \
  --header 'Content-Type: application/json' \
  --data '{"foo": "bar"}'
```

### POST /decrypt

```sh
curl --request POST \
  --url http://127.0.0.1:8080/decrypt \
  --header 'Content-Type: application/json' \
  --data '{
 "foo": "__ENCRYPTED_FIELD__"
}'
```

### POST /sign

```sh
curl --request POST \
  --url http://127.0.0.1:8080/sign \
  --header 'Content-Type: application/json' \
  --data '{
 "foo": "bar"
}'
```

### POST /verify

```sh
curl --request POST \
  --url http://127.0.0.1:8080/verify \
  --header 'Content-Type: application/json' \
  --data '{
 "signature": "__SIGNATURE__",
 "data": {
  "foo": "__VALUE__"
 }
}'
```
