import { Router } from "https://deno.land/x/oak@v6.2.0/mod.ts";
import { servers } from "./servers.ts";

const SITE_KEY = Deno.env.get("SITE_KEY");
const SECRET_KEY = Deno.env.get("SECRET_KEY");
const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN");

if (!(SITE_KEY && SECRET_KEY && DISCORD_TOKEN)) {
  console.log("Invalid site key, secret key, or discord token");
  Deno.exit(1);
}

export const router = new Router();

router
  .get("/", (ctx) => {
    const serverInfos: any = [];
    for (const [key, value] of servers) {
      serverInfos.push({ link: key, name: value.name });
    }
    ctx.render("./views/index.ejs", { data: { serverInfos } });
  })
  .get("/:server", (ctx) => {
    if (ctx.params && ctx.params.server && servers.has(ctx.params.server)) {
      ctx.render("./views/server.ejs", {
        data: {
          link: ctx.params.server,
          serverName: servers.get(ctx.params.server)?.name,
          siteKey: SITE_KEY,
        },
      });
    } else {
      ctx.render("./views/404.ejs");
    }
  })
  .post("/:server", async (ctx) => {
    if (!(ctx.params && ctx.params.server && servers.has(ctx.params.server))) {
      ctx.render("views/404.ejs");
      return;
    }
    const serverInfo = servers.get(ctx.params.server);

    const formData = await ctx.request.body().value;

    const captchaRes: string = formData.get("g-recaptcha-response") || "none";

    const verify = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${captchaRes}`,
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const verifyRes = await verify.json();

    if (verifyRes.success) {
      const link = await fetch(
        `https://discord.com/api/v8/channels/${serverInfo?.channelId}/invites`,
        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bot ${DISCORD_TOKEN}`,
          },
          body: JSON.stringify({
            "max_age": 900,
            "max_uses": 1,
          }),
        },
      );

      const data = await link.json();

      const invite = `https://www.discord.gg/${data.code}`;
      ctx.response.redirect(invite);
    } else {
      ctx.response.body = "Nope";
    }
  });
