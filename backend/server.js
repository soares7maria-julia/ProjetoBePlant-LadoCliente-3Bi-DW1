const express = require('express');
const app = express();
const path = require('path');

const cookieParser = require('cookie-parser');

// Importar a configuração do banco PostgreSQL
////// Tirar de comentario depois 
/* const db = require('./database'); // Ajuste o caminho conforme necessário */
//////

// Configurações do servidor - quando em produção, você deve substituir o IP e a porta pelo do seu servidor remoto
//const HOST = '192.168.1.100'; // Substitua pelo IP do seu servidor remoto
const HOST = 'localhost'; // Para desenvolvimento local
const PORT_FIXA = 3001; // Porta fixa

// serve a pasta frontend como arquivos estáticos
const caminhoFrontend = path.join(__dirname, '../frontend');
console.log('Caminho frontend:', caminhoFrontend);

app.use(express.static(caminhoFrontend));
// Servir a pasta "images" para acesso público
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cookieParser());

// Middleware para permitir CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // <-- responde ao preflight
  }

  next();
});

// Middleware para adicionar a instância do banco de dados às requisições (desativado)
// app.use((req, res, next) => {
//   req.db = db;
//   next();
// });

// Middlewares
app.use(express.json());

// Middleware de tratamento de erros JSON malformado
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON malformado',
      message: 'Verifique a sintaxe do JSON enviado'
    });
  }
  next(err);
});

// só mexa nessa parte
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Importando as rotas
//const loginRoutes = require('./routes/loginRoutes');
//app.use('/login', loginRoutes);

const menuRoutes = require('./routes/menuRoutes');
app.use('/menu', menuRoutes);

const pessoaRoutes = require('./routes/pessoaRoutes');
app.use('/pessoa', pessoaRoutes);

const cargoRoutes = require('./routes/cargoRoutes');
app.use('/cargo', cargoRoutes);

const loginRoutes = require('./routes/loginRoutes');
app.use('/login', loginRoutes);

const funcionarioRoutes = require('./routes/funcionarioRoutes');
app.use('/funcionario', funcionarioRoutes);

const clienteRoutes = require('./routes/clienteRoutes');
app.use('/cliente', clienteRoutes);

const categoriaRoutes = require('./routes/categoriaRoutes');
app.use('/categoria', categoriaRoutes);

const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produto', produtoRoutes);

const carrinhoRoutes = require("./routes/carrinhoRoutes");
app.use("/api/carrinho", carrinhoRoutes);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Rota padrão
app.get('/', (req, res) => {
  res.json({
    message: 'O server está funcionando - essa é a rota raiz!',
    database: 'DESATIVADO (sem PostgreSQL)',
    timestamp: new Date().toISOString()
  });
});

// Rota para testar a conexão com o banco (desativada)
// app.get('/health', async (req, res) => { ... });

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});


// Middleware para rotas não encontradas (404)
app.use('', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`,
    timestamp: new Date().toISOString()
  });
});

// Inicialização do servidor (sem checar o banco)
const startServer = async () => {
  try {
    console.log(caminhoFrontend);

    const PORT = process.env.PORT || PORT_FIXA;

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais para encerramento graceful (sem encerrar banco)
process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

// Iniciar o servidor
startServer();
