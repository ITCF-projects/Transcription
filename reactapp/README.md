# Frontend for Transcribe
Single-page application built with React + Typescript + Vite   
Project is based on Visual Studio 2022 template "React and ASP.NET Core"

## Development

### Install packages:  
`npm install`

### Configuration
Create app registrations for frontend and API in Entra ID. See detailed info in main [Readme.md (Authentication)](../README.md#authentication)

Copy file .env to .env.development.local and update values to match the app registrations in your tenant.

### HTTPS certificates
For development the same self-signed certificates is used as the API-project.

### Connection to API
The API should be started on port 44331 in Visual Studio 2022 for debug (docker-compose) or directly with docker-compose.   
Frontend webserver (vite) has proxy setup from /api to http://localhost:44331

### Start webserver - development
`npm run dev`

Vite webserver is listening at https://localhost:5173 and uses HMR to automatic reload modules in the browser on file change.

### Start webserver - production preview
`npm run preview`

Vite builds source for production an starts webserver at https://localhost:4173  
.env.production or .env.production.local is used when running in preview. Update VITE_AUTH_REDIRECT_URL and make sure the frontend app registration also allows this as a redirect URI.

## Production
Build and start the container using docker-compose. Multi-stage build is used and the runtime image uses Nginx as a webserver.

.env.production or .env.production.local is used when building the image. 
Vite uses static replacement of env variables for production build, so the images need to be rebuilt if the env-files change.

### Nginx configuration
Nginx configuration file [nginx/default.conf](nginx/default.conf) is mounted as a volumn in docker-compose.yml so the file can be changed without rebuilding the container.

Nginx is configured as a proxy for /api to the API-container running at port 44331.  
SSL certificate files /etc/certs/transcribe.crt and /etc/certs/transcribe.key is used. The path is mounted as volumes and can be changed in docker-compose.yml (or override).


# React + TypeScript + Vite

(original template info below...)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
