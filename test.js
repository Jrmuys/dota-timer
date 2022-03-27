let d2gsi = require("dota2-gsi");
// let server = new d2gsi({ port: 30506 });
let server = new d2gsi({ port: 30506, ip: "localhost" });
console.log(server);
server.events.on("newclient", (client) => {
  console.log("New client connected, IP address: " + client.ip);
});
