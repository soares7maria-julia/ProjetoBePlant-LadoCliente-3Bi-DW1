const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const multer = require('multer');
const path = require('path');

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // salva as imagens na pasta backend/images
    cb(null, path.join(__dirname, '../images'));
  },
  filename: (req, file, cb) => {
    // usa o id do produto + extensão original
    const id = req.body.iditem || req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `${id}${ext}`); // ex: 3.jpeg
  }
});

const upload = multer({ storage });

// Rotas de CRUD para produtos
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProduto);
router.post('/', upload.single('imagemitem'), produtoController.criarProduto);
router.put('/:id', upload.single('imagemitem'), produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;
