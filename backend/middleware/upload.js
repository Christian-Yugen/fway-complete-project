const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./errorHandler');

// Criar diretórios se não existirem
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/avatars',
    'uploads/documents',
    'uploads/attachments',
    'uploads/temp'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Inicializar diretórios
createUploadDirs();

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determinar pasta baseado no tipo de arquivo
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'document') {
      uploadPath += 'documents/';
    } else if (file.fieldname === 'attachment') {
      uploadPath += 'attachments/';
    } else {
      uploadPath += 'temp/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    // Sanitizar nome do arquivo
    const sanitizedBaseName = baseName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    
    const filename = `${sanitizedBaseName}_${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    document: [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    attachment: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  };

  const fieldAllowedTypes = allowedTypes[file.fieldname] || allowedTypes.attachment;
  
  if (fieldAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Tipo de arquivo não permitido para ${file.fieldname}. Tipos aceitos: ${fieldAllowedTypes.join(', ')}`, 400), false);
  }
};

// Configuração do multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Máximo 5 arquivos por upload
  }
});

// Middleware para diferentes tipos de upload
const uploadMiddleware = {
  // Upload de avatar (single)
  single: (fieldName) => upload.single(fieldName),
  
  // Upload múltiplo
  multiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
  
  // Upload de campos específicos
  fields: (fields) => upload.fields(fields),
  
  // Upload de qualquer arquivo
  any: () => upload.any(),
  
  // Middleware personalizado para avatar
  avatar: upload.single('avatar'),
  
  // Middleware personalizado para documentos
  documents: upload.array('documents', 3),
  
  // Middleware personalizado para anexos
  attachments: upload.array('attachments', 5)
};

// Middleware para limpar arquivos temporários
const cleanupTempFiles = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Limpar arquivos temporários após resposta
    if (req.files) {
      req.files.forEach(file => {
        if (file.path.includes('/temp/')) {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Erro ao remover arquivo temporário:', err);
          });
        }
      });
    }
    
    if (req.file && req.file.path.includes('/temp/')) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao remover arquivo temporário:', err);
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware para validar tamanho de imagem
const validateImageDimensions = (maxWidth = 2000, maxHeight = 2000) => {
  return async (req, res, next) => {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return next();
    }

    try {
      const sharp = require('sharp');
      const metadata = await sharp(req.file.path).metadata();
      
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        // Remover arquivo inválido
        fs.unlink(req.file.path, () => {});
        
        return res.status(400).json({
          success: false,
          message: `Imagem muito grande. Máximo permitido: ${maxWidth}x${maxHeight}px`
        });
      }
      
      next();
    } catch (error) {
      console.error('Erro ao validar dimensões da imagem:', error);
      next();
    }
  };
};

// Middleware para redimensionar imagem
const resizeImage = (width, height, quality = 80) => {
  return async (req, res, next) => {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return next();
    }

    try {
      const sharp = require('sharp');
      const outputPath = req.file.path.replace(path.extname(req.file.path), '_resized.jpg');
      
      await sharp(req.file.path)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toFile(outputPath);
      
      // Remover arquivo original
      fs.unlink(req.file.path, () => {});
      
      // Atualizar informações do arquivo
      req.file.path = outputPath;
      req.file.filename = path.basename(outputPath);
      req.file.mimetype = 'image/jpeg';
      
      next();
    } catch (error) {
      console.error('Erro ao redimensionar imagem:', error);
      next();
    }
  };
};

// Função para remover arquivo
const removeFile = (filePath) => {
  return new Promise((resolve) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Erro ao remover arquivo:', err);
      }
      resolve();
    });
  });
};

// Função para mover arquivo
const moveFile = (sourcePath, destinationPath) => {
  return new Promise((resolve, reject) => {
    fs.rename(sourcePath, destinationPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = uploadMiddleware;
module.exports.upload = upload;
module.exports.cleanupTempFiles = cleanupTempFiles;
module.exports.validateImageDimensions = validateImageDimensions;
module.exports.resizeImage = resizeImage;
module.exports.removeFile = removeFile;
module.exports.moveFile = moveFile;

