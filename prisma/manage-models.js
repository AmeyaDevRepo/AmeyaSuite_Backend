#!/usr/bin/env node

/**
 * Prisma Model Manager
 * Helps manage organized Prisma models across directories
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
      models.push({
        file: itemPath,
        category: path.relative(MODELS_DIR, path.dirname(itemPath)),
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
  const schemaHeader = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

`;

  let schemaContent = schemaHeader;
  
  // Group models by category
  const categories = {};
  models.forEach(model => {
    if (!categories[model.category]) {
      categories[model.category] = [];
    }
    categories[model.category].push(model);
  });
  
  // Add models organized by category
  Object.keys(categories).forEach(category => {
    schemaContent += `// ====================\n`;
    schemaContent += `// ${category.toUpperCase()} MODELS\n`;
    schemaContent += `// ====================\n\n`;
    
    categories[category].forEach(model => {
      schemaContent += model.content + '\n\n';
    });
  });
  
  // Write to schema file
  fs.writeFileSync(SCHEMA_FILE, schemaContent);
  console.log('✅ Schema generated successfully!');
  console.log(`📁 Found ${models.length} models in ${Object.keys(categories).length} categories`);
}

// CLI
const command = process.argv[2];

switch (command) {
  case 'generate':
    generateSchema();
    break;
  case 'list':
    const models = readModelFiles(MODELS_DIR);
    console.log('📋 Available models:');
    models.forEach(model => {
      console.log(`  ${model.category}/${path.basename(model.file)}`);
    });
    break;
  default:
    console.log(`
Prisma Model Manager

Usage:
  node manage-models.js generate  # Generate schema.prisma from organized models
  node manage-models.js list      # List all organized models

Directory structure:
  models/
  ├── auth/          # Authentication models
  ├── content/       # Content management models
  └── ...           # Other categories
`);
}
