const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Jogos com SQLite funcionando!' });
});

// GET /jogos?genero=RPG&plataforma=PS&notaMin=9
app.get('/jogos', (req, res) => {
  const { genero, plataforma, notaMin } = req.query;
  let sql = 'SELECT * FROM jogos WHERE 1 = 1';
  const valores = [];

  if (genero) {
    sql += ' AND genero = ? COLLATE NOCASE';
    valores.push(genero);
  }
  if (plataforma) {
    sql += ' AND plataforma LIKE ?';
    valores.push('%' + plataforma + '%');
  }
  if (notaMin) {
    sql += ' AND nota >= ?';
    valores.push(parseFloat(notaMin));
  }

  const jogos = db.prepare(sql).all(...valores);
  res.status(200).json(jogos);
});

app.get('/jogos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const jogo = db.prepare('SELECT * FROM jogos WHERE id = ?').get(id);

  if (!jogo) {
    return res.status(404).json({ erro: 'Jogo não encontrado' });
  }
  res.status(200).json(jogo);
});

app.post('/jogos', (req, res) => {
  const { titulo, genero, plataforma, ano, nota } = req.body;

  if (!titulo || !genero || !plataforma || !ano) {
    return res.status(400).json({
      erro: 'Os campos titulo, genero, plataforma e ano são obrigatórios'
    });
  }

  const resultado = db.prepare(`
    INSERT INTO jogos (titulo, genero, plataforma, ano, nota)
    VALUES (?, ?, ?, ?, ?)
  `).run(titulo, genero, plataforma, parseInt(ano), nota ?? null);

  const novoJogo = db
    .prepare('SELECT * FROM jogos WHERE id = ?')
    .get(resultado.lastInsertRowid);

  res.status(201).json(novoJogo);
});

app.put('/jogos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, genero, plataforma, ano, nota } = req.body;

  if (!titulo || !genero || !plataforma || !ano) {
    return res.status(400).json({
      erro: 'Os campos titulo, genero, plataforma e ano são obrigatórios'
    });
  }

  const resultado = db.prepare(`
    UPDATE jogos
    SET titulo = ?, genero = ?, plataforma = ?, ano = ?, nota = ?
    WHERE id = ?
  `).run(titulo, genero, plataforma, parseInt(ano), nota ?? null, id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Jogo não encontrado' });
  }

  const jogoAtualizado = db.prepare('SELECT * FROM jogos WHERE id = ?').get(id);
  res.status(200).json(jogoAtualizado);
});

app.patch('/jogos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, genero, plataforma, ano, nota } = req.body;

  const resultado = db.prepare(`
    UPDATE jogos
    SET titulo = COALESCE(?, titulo),
        genero = COALESCE(?, genero),
        plataforma = COALESCE(?, plataforma),
        ano = COALESCE(?, ano),
        nota = COALESCE(?, nota)
    WHERE id = ?
  `).run(
    titulo ?? null,
    genero ?? null,
    plataforma ?? null,
    ano !== undefined ? parseInt(ano) : null,
    nota !== undefined ? parseFloat(nota) : null,
    id
  );

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Jogo não encontrado' });
  }

  const jogoAtualizado = db.prepare('SELECT * FROM jogos WHERE id = ?').get(id);
  res.status(200).json(jogoAtualizado);
});

app.delete('/jogos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = db.prepare('DELETE FROM jogos WHERE id = ?').run(id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Jogo não encontrado' });
  }
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
