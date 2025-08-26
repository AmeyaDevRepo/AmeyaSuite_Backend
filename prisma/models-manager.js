#!/usr/bin/env node

/**
 * Prisma Model Manager - Advanced Version
 * Manages organized Prisma models across directories and combines them into schema.prisma
 */

const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, 'models');
const SCHEMA_FILE = path.join(__dirname, 'schema.prisma');

// Read all model files recursively
function readModelFiles(dir) {
  const models = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      models.push(...readModelFiles(itemPath));
    } else if (item.endsWith('.prisma')) {
      const content = fs.readFileSync(itemPath, 'utf8');
      const relativePath = path.relative(MODELS_DIR, itemPath);
      const category = path.dirname(relativePath);
      
      models.push({
        file: itemPath,
        fileName: path.basename(itemPath, '.prisma'),
        category: category === '.' ? 'root' : category,
        content: content.trim()
      });
    }
  }
  
  return models;
}

// Generate schema from organized models
function generateSchema() {
  console.log('📋 Generating schema from organized models...');
  
  const models = readModelFiles(MODELS_DIR);
  
  // Schema header
  const schemaHeader = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

`;

  let schemaContent = schemaHeader;
  
  // Group models by category with proper ordering
  const categoryOrder = ['enums', 'auth', 'core', 'business'];
  const categories = {};
  
  models.forEach(model => {
    if (!categories[model.category]) {
      categories[model.category] = [];
    }
    categories[model.category].push(model);
  });
  
  // Sort models within each category alphabetically
  Object.keys(categories).forEach(category => {
    categories[category].sort((a, b) => a.fileName.localeCompare(b.fileName));
  });
  
  // Add models organized by category in the correct order
  categoryOrder.forEach(category => {
    if (categories[category]) {
      const categoryName = getCategoryDisplayName(category);
      schemaContent += `// ====================\n`;
      schemaContent += `// ${categoryName}\n`;
      schemaContent += `// ====================\n\n`;
      
      categories[category].forEach(model => {
        schemaContent += model.content + '\n\n';
      });
    }
  });
  
  // Add any remaining categories not in the order
  Object.keys(categories).forEach(category => {
    if (!categoryOrder.includes(category)) {
      const categoryName = getCategoryDisplayName(category);
      schemaContent += `// ====================\n`;
      schemaContent += `// ${categoryName}\n`;
      schemaContent += `// ====================\n\n`;
      
      categories[category].forEach(model => {
        schemaContent += model.content + '\n\n';
      });
    }
  });
  
  // Write to schema file
  fs.writeFileSync(SCHEMA_FILE, schemaContent);
  console.log('✅ Schema generated successfully!');
  console.log(`📁 Found ${models.length} models in ${Object.keys(categories).length} categories`);
  
  // Print summary
  Object.keys(categories).forEach(category => {
    const categoryName = getCategoryDisplayName(category);
    console.log(`   ${categoryName}: ${categories[category].length} models`);
  });
}

// List all models organized by category
function listModels() {
  const models = readModelFiles(MODELS_DIR);
  const categories = {};
  
  models.forEach(model => {
    if (!categories[model.category]) {
      categories[model.category] = [];
    }
    categories[model.category].push(model);
  });
  
  console.log('📋 Available models:\n');
  Object.keys(categories).sort().forEach(category => {
    const categoryName = getCategoryDisplayName(category);
    console.log(`📁 ${categoryName}:`);
    categories[category].forEach(model => {
      console.log(`   • ${model.fileName}`);
    });
    console.log('');
  });
  
  console.log(`Total: ${models.length} models in ${Object.keys(categories).length} categories`);
}

// Get category display name
function getCategoryDisplayName(category) {
  const displayNames = {
    'enums': 'ENUMS',
    'auth': 'AUTHENTICATION MODELS', 
    'core': 'CORE SAAS MODELS',
    'business': 'BUSINESS MODELS',
    'root': 'ROOT MODELS'
  };
  
  return displayNames[category] || category.toUpperCase() + ' MODELS';
}

// Validate schema after generation
function validateSchema() {
  console.log('🔍 Validating generated schema...');
  const { spawn } = require('child_process');
  
  const validation = spawn('npx', ['prisma', 'validate'], {
    stdio: 'inherit',
    shell: true
  });
  
  validation.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Schema validation passed!');
    } else {
      console.log('❌ Schema validation failed!');
      process.exit(1);
    }
  });
}

// Create a new model file
function createModel(category, modelName) {
  if (!category || !modelName) {
    console.log('❌ Please provide both category and model name');
    console.log('Usage: node models-manager.js create <category> <modelName>');
    return;
  }
  
  const categoryDir = path.join(MODELS_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
    console.log(`📁 Created category directory: ${category}`);
  }
  
  const modelFile = path.join(categoryDir, `${modelName}.prisma`);
  if (fs.existsSync(modelFile)) {
    console.log(`❌ Model ${modelName} already exists in ${category}`);
    return;
  }
  
  const modelContent = `// ${modelName} model
model ${modelName} {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("${modelName.toLowerCase()}s")
}`;
  
  fs.writeFileSync(modelFile, modelContent);
  console.log(`✅ Created model: ${category}/${modelName}.prisma`);
}

// CLI
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

switch (command) {
  case 'generate':
    generateSchema();
    if (process.argv.includes('--validate')) {
      validateSchema();
    }
    break;
    
  case 'list':
    listModels();
    break;
    
  case 'create':
    createModel(arg1, arg2);
    break;
    
  case 'validate':
    generateSchema();
    validateSchema();
    break;
    
  default:
    console.log(`
🚀 Prisma Model Manager

Usage:
  node models-manager.js generate [--validate]  # Generate schema.prisma from organized models
  node models-manager.js list                   # List all organized models
  node models-manager.js create <category> <model>  # Create a new model file
  node models-manager.js validate               # Generate and validate schema

Directory structure:
  models/
  ├── enums/           # Enum definitions
  ├── auth/            # Authentication models  
  ├── core/            # Core SaaS models
  ├── business/        # Business logic models
  └── [custom]/        # Custom categories

Examples:
  node models-manager.js generate
  node models-manager.js list
  node models-manager.js create business Product
  node models-manager.js validate

Options:
  --validate          Validate schema after generation
`);
}
