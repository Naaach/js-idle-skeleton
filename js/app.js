window.addEventListener('load', documentLoadEvent => {

  // name, initalPrice, showAt, pointsPerOne, incrementalRatio
  const game = new Game();

  game
    .addEntity(new Upgrade('autopointer',    10,          0,          1.3,     1.1))
    .addEntity(new Upgrade('MareNostrum',    250,         7,          5,       1.15))
    .addEntity(new Upgrade('K Computer',     1500,        200,        12,      1.2))
    .addEntity(new Upgrade('Oakforest-PACS', 10000,       1400,       48,      1.3))
    .addEntity(new Upgrade('Cori',           50000,       9000,       115,     1.32))
    .addEntity(new Upgrade('Trinity',        250000,      40000,      314,     1.35))
    .addEntity(new Upgrade('Sequoia',        1000000,     230000,     682,     1.4))
    .addEntity(new Upgrade('Titan',          2500000,     900000,     1002,    1.5))
    .addEntity(new Upgrade('Gyoukou',        10000000,    200000,     3978,    1.6))
    .addEntity(new Upgrade('Piz Daint',      120000000,   90000000,   21356,   1.6))
    .addEntity(new Upgrade('Tianhe-2',       640000000,   1100000000, 96843,   1.6))
    .addEntity(new Upgrade('TaihuLight',     20000000000, 6000000000, 100048,  1.8))
})