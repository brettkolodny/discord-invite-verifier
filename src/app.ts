import { Application } from "https://deno.land/x/oak@v6.2.0/mod.ts";
import { router } from "./router.ts";

import {
  adapterFactory,
  engineFactory,
  viewEngine,
} from "https://deno.land/x/view_engine@v1.4.5/mod.ts";

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

const app = new Application();

app.use(viewEngine(oakAdapter, ejsEngine));
app.use(router.routes());
app.use((ctx) => {
  ctx.response.body = "404";
});

const port = Deno.env.get("PORT")
  ? parseInt(Deno.env.get("PORT") as string)
  : 8000;
console.log(`Listening on port ${port}`);
await app.listen({ port });
