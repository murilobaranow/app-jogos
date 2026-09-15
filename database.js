const Database = require('better-sqlite3');

const db = new Database('jogos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS jogos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    genero TEXT NOT NULL,
    plataforma TEXT NOT NULL,
    ano INTEGER NOT NULL,
    nota REAL
  )
`);

const { total } = db.prepare('SELECT COUNT(*) AS total FROM jogos').get();

if (total === 0) {
  const inserir = db.prepare(`
    INSERT INTO jogos (titulo, genero, plataforma, ano, nota)
    VALUES (?, ?, ?, ?, ?)
  `);
  inserir.run('The Legend of Zelda: Breath of the Wild', 'Aventura', 'Switch', 2017, 9.7);
  inserir.run('Elden Ring', 'RPG', 'PS5', 2022, 9.5);
  inserir.run('Minecraft', 'Sandbox', 'PC', 2011, 9.0);
  inserir.run('Hollow Knight', 'Metroidvania', 'PC', 2017, 9.4);
  inserir.run('God of War Ragnarök', 'Ação', 'PS5', 2022, 9.3);
  console.log('Base de dados criada com a carga inicial de jogos.');
}

module.exports = db;
