const swaggerSpec = require('./src/config/swagger');
const fs = require('fs');
const path = require('path');

function convertToYAML(obj, indent = 0) {
  const spaces = ' '.repeat(indent);
  let yaml = '';

  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
        return '|\n' + spaces + '  ' + obj.split('\n').join('\n' + spaces + '  ');
      }
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    yaml = '\n';
    obj.forEach(item => {
      yaml += spaces + '- ' + convertToYAML(item, indent + 2).replace(/^\n\s*/, '') + '\n';
    });
    return yaml.trimEnd();
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';

  keys.forEach((key, index) => {
    const value = obj[key];
    const formattedKey = key.includes(' ') || key.includes(':') ? `"${key}"` : key;

    if (value === null || value === undefined) {
      yaml += `${spaces}${formattedKey}: null\n`;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      yaml += `${spaces}${formattedKey}:\n`;
      yaml += convertToYAML(value, indent + 2);
      if (index < keys.length - 1) yaml += '\n';
    } else if (Array.isArray(value)) {
      yaml += `${spaces}${formattedKey}:`;
      const arrayYaml = convertToYAML(value, indent + 2);
      yaml += arrayYaml.startsWith('\n') ? arrayYaml : ' ' + arrayYaml;
      if (index < keys.length - 1) yaml += '\n';
    } else {
      const valueStr = convertToYAML(value, indent + 2);
      yaml += `${spaces}${formattedKey}: ${valueStr}\n`;
    }
  });

  return yaml;
}

try {
  const yamlString = convertToYAML(swaggerSpec);
  const outputPath = path.join(__dirname, 'swagger.yaml');
  fs.writeFileSync(outputPath, yamlString, 'utf8');

  console.log('✅ Swagger YAML file generated successfully!');
  console.log(`📄 File location: ${outputPath}`);
  console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
} catch (error) {
  console.error('❌ Error generating Swagger YAML:', error);
  process.exit(1);
}
