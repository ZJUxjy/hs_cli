const CARD_REGISTRY = {};

function RegisterCard(id, data) {
  CARD_REGISTRY[id] = { id, ...data };
  return CARD_REGISTRY[id];
}

function GetCard(id) {
  return CARD_REGISTRY[id];
}

module.exports = { RegisterCard, GetCard, CARD_REGISTRY };
