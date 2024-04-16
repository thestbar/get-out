# Get Out
Game created for Ludum Dare 55 under theme `Summoning`.

You can play the game on itch.io: [Get Out](https://thestbar.itch.io/get-out).

You can find the Ludum Dare 55 Jam page here: [Ludum Dare 55](https://ldjam.com/events/ludum-dare/55/get-out).

Project created by forking the [phaser3-vite-template](https://github.com/ourcade/phaser3-vite-template).

## Prerequisites

You'll need [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed.

It is highly recommended to use [Node Version Manager](https://github.com/nvm-sh/nvm) (nvm) to install Node.js and npm.

Install Node.js and `npm` with `nvm`:

```bash
nvm install node

nvm use node
```

Replace 'node' with 'latest' for `nvm-windows`.

## Getting Started

Start development server:

```
npm run start
```

To create a production build:

```
npm run build
```

Production files will be placed in the `dist` folder. Then upload those files to a web server. 🎉

## Dev Server Port

You can change the dev server's port number by modifying the `vite.config.ts` file. Look for the `server` section:

```js
{
	// ...
	server: { host: '0.0.0.0', port: 8000 },
}
```

## License

[MIT License](https://github.com/ourcade/phaser3-vite-template/blob/master/LICENSE)
