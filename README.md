# TravelJuice Image manager

API to automatically resize images for aeroports-voyages.fr website.

The app watches a directory specified in .env file and resize the images inside in the output directory specified.
You can also manually launch operations by sending http requests and through swagger interface (http://traveljuice-images-manager.prod.traveljuice.fr/api or localhost:3000/api).

The configuration of the resize is in a default.json inside the input directory.You can also specify parameters for one image by putting a json file in the same directory of the image with its name.In this configuration files you can specify the dimensions & the centering of the image.The centering parameters goes from -0.5 to 0.5.If there is a default.

If there is json file with the same name as an image the image will be resized with the specifications of this json file, else it will search for a default.json file in the upper folder.

If width or height is not specified in the config file then the images will be only resized and it will be put in a `resized` directory.

The json files have this structure:

```json
{
  "thumbnail": {
    "outputSize": {
      "width": 210,
      "height": 118
    },
    "translate": {
      "x": 0,
      "y": 0
    },
    "allowedExt": ["jpg", "webp", "png", "jpeg"],
    "outOptions": [{"ext":"webp","quality":80}]
  },

  "mobile": {
    "outputSize": {
      "width": 600,
      "height": 144
    },

    "translate": {
      "x": 0,
      "y": 0
    },
    "allowedExt": ["jpg", "webp", "png", "jpeg"],
    "outOptions": [{}]
  }
```
## Login 

You must login to use the different routes.

To create a new user you must use the Api key in the .env file.


## Installation

```bash
$ npm install
```

You need to install globally these modules

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
