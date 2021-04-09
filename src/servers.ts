interface Server {
  name: string;
  channelId: string;
}

export const servers: Map<string, Server> = new Map();
// servers.set("test", {
//   name: "Test Server",
//   channelId: "542093535973867522",
// });
