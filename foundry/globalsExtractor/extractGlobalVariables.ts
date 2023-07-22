import * as ts from "typescript";
import * as fs from "fs";

// Function to extract global variables from the source file
export function extractGlobalVariables(filePath: string): string[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath).toString(),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true
  );

  const globalVariables: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node) && ts.isSourceFile(node.parent)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          globalVariables.push(declaration.name.text);
        }
      }
    } else if (ts.isClassDeclaration(node) && ts.isSourceFile(node.parent)) {
      if (node.name && ts.isIdentifier(node.name)) {
        globalVariables.push(node.name.text);
      }
    } else if (ts.isFunctionDeclaration(node) && ts.isSourceFile(node.parent)) {
      if (node.name && ts.isIdentifier(node.name)) {
        globalVariables.push(node.name.text);
      }
    }
    node.forEachChild(visit);
  }

  visit(sourceFile);

  return globalVariables;
}
