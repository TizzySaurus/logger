<details>
  <summary>This is a fork of [Logger v3](https://github.com/curtisf/logger)</summary>
  This fork includes some improvements and features the main code doesn't have. 
  - Image/File logs for messageDelete / messageBulkDelete events.
</details>

<center>
  <img src="https://cdn.discordapp.com/avatars/1223274176786206853/8729a911ab234be299554a5ba006621d.png" />
</center>

TizzyLog is a powerful [Discord](https://discord.com) bot meant to give staff members oversight over the various actions taking place in their server. Come talk about me with my creator at [TizzyLog server](https://discord.gg/WYTxVjzHnc).

## Installation

You are mostly on your own selfhosting this version. Required applications:
- PostgreSQL
- Redis
- NodeJS 16+

1. Setup Postgres and add a superuser (default user works)
2. Clone bot repo and enter the created folder
3. Copy .env.example into .env
4. Fill out **all** fields in it (even Sentry unless you hotpatch it out)
5. `npm install`
6. `npm run genDB`
7. `node index.js`
8. Use your prefix to set the bot's commands. If yours is %, then you'd do `%setcmd global` to globally set commands, and `%setcmd guild` to quickly set server-specific slash commands

## Usage

```bash
node index.js
```

## Contributing
Pull requests are welcome as long as it follows the following guidelines:
1. Is your idea really one that a large group of moderators would like?
2. Is your idea scalable?
3. Will your idea cause the bot to hit it's global ratelimit?
4. Have you proposed it to *tizzysaurus* in my [support server?](https://discord.gg/WYTxVjzHnc)

If you have done all of the above steps, then open a pull request and I will review it. Style guide and testing will be implemented in a later update.
