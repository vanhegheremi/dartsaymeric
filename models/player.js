export function createPlayer(name) {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now()
  };
}
