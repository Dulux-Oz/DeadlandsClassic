import fs from 'fs';

export const createEslintFileFromGlobalVariables = (variables: string[]) => {
  const eslintConfig = {
    globals: {} as Record<string, 'readonly'>,
  };
  
  for (const variable of variables) {
    eslintConfig.globals[variable] = 'readonly';
  }
  
  const eslintConfigJSON = JSON.stringify(eslintConfig, null, 2);

  fs.writeFile('./foundry/globalsExtractor/.eslintrc.json', eslintConfigJSON, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to .eslintrc.json:', err);
    } else {
      console.log('.eslintrc.json has been created successfully!');
    }
  });
};
