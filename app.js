const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/perfumes', { useNewUrlParser: true, useUnifiedTopology: true });

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Definir o modelo de perfume
const perfumeSchema = new mongoose.Schema({
  nome: String,
  precoCompra: Number,
  precoRevenda: Number,
  foto: String,
});

const Perfume = mongoose.model('Perfume', perfumeSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static('uploads'));

// Rota para listar todos os perfumes
app.get('/perfumes', async (req, res) => {
  const perfumes = await Perfume.find();
  res.json(perfumes);
});

// Rota para adicionar perfume
app.post('/perfumes', upload.single('foto'), async (req, res) => {
  const newPerfume = new Perfume({
    nome: req.body.nome,
    precoCompra: req.body.precoCompra,
    precoRevenda: req.body.precoRevenda,
    foto: req.file ? req.file.path : '',
  });
  await newPerfume.save();
  res.json(newPerfume);
});

// Rota para editar perfume
app.put('/perfumes/:id', upload.single('foto'), async (req, res) => {
  const updatedPerfume = await Perfume.findByIdAndUpdate(
    req.params.id,
    {
      nome: req.body.nome,
      precoCompra: req.body.precoCompra,
      precoRevenda: req.body.precoRevenda,
      foto: req.file ? req.file.path : req.body.foto,
    },
    { new: true }
  );
  res.json(updatedPerfume);
});

// Rota para excluir perfume
app.delete('/perfumes/:id', async (req, res) => {
  await Perfume.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
