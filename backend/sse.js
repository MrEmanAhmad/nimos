// Server-Sent Events manager
let clients = {};
let clientId = 0;

function addClient(res) {
  const id = ++clientId;
  clients[id] = res;
  return id;
}

function removeClient(id) {
  delete clients[id];
}

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of Object.values(clients)) {
    try { res.write(msg); } catch (e) { /* client disconnected */ }
  }
}

module.exports = { addClient, removeClient, broadcast, __clients: clients };
