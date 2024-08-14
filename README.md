<center><img src="https://cdn.discordapp.com/attachments/349356606883889152/616414555639382016/Logger.png" />
<a href="https://discordbots.org/bot/298822483060981760" >
  <img src="https://discordbots.org/api/widget/298822483060981760.svg" alt="Logger" />
</a>
</center>

## Logger's official instance closed 04/05/2024, but can still be selfhosted and modified by users

Logger is a powerful [Discord](https://discordapp.com) bot meant to give staff members oversight over the various actions taking place in their server. Come talk about it in the server [Logger's Lounge](https://discord.gg/ed7Gaa3).

## Installation via Docker

This route uses Docker and a docker-compose file to bring up the required dependencies for Logger.

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) if on Windows, and [regular Docker on Linux systems](https://docs.docker.com/engine/install/ubuntu/)
2. Download the bot code via `git clone` or clicking "<> Code -> Download Zip" on the GitHub page
3. In the bot code folder, copy/rename .env.example into .env
4. Fill out the values in your .env file
5. Run `docker compose up` to start the bot and dependent services. This will make two folders in the same folder that the command is ran in: pgdata and redisdata, used for storing database information. If you want to change the location that postgres and redis data is stored, check out the volume mounts in `docker-compose.yml`.
6. Run `docker compose exec loggerbot npm run genDB` to initialize the database tables.
7. The bot should be up and running in Discord if all necessary values are present.
8. If you have issues, check the logs for `docker compose up`. Otherwise, you're done, and can use `docker compose up -d` to run the bot in the background 24/7

### Making changes with Docker

If you modify the bot code, the code must be rebuilt for use with `docker compose`.
Make the code changes, and use `docker compose build loggerbot` to rebuild the code, then it can be started at will using `docker compose up` or `docker compose up -d`

## Installation without Docker

You are mostly on your own selfhosting. Required applications:

- PostgreSQL 14+ (no complex queries, most should work)
- Redis
- NodeJS 20+

1. Setup Postgres and add a superuser (default user works)
2. Clone bot repo and enter the created folder
3. Copy .env.example into .env
4. Fill out **all** fields in it (even Sentry unless you hotpatch it out)
5. `npm install`
6. `npm run genDB`
7. Set `ENABLE_TEXT_COMMANDS="true"` in .env
8. Start the bot with `node index.js`
9. Use your prefix to set the bot's commands. If yours is %, then you'd do `%setcmd global` to globally set commands, and `%setcmd guild` to quickly set server-specific slash commands

## Usage

```bash
node index.js
```

## Non-Docker Usage

```bash
NODE_ENV=production node index.js
```

## Support/Communication

Join the community to talk about contributions and potential help at [Logger's Lounge](https://discord.gg/ed7Gaa3).

## Contributing

Pull requests are welcome as long as it follows the following guidelines:

1. Is your idea really one that a large group of moderators would like?
2. Is your idea scalable?
3. Will your idea cause the bot to hit it's global ratelimit?
4. Have you proposed it in my [support server?](https://discord.gg/ed7Gaa3)

If you have done all of the above steps, then open a pull request and I will review it.  eventually. Run the styleguide (standard-js) against your code with `npx standard --fix ./`
