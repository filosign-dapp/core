import fs from "fs";
import path from "path";
import { glob } from "glob";
import parser from "solidity-parser-antlr";

const SRC_DIR = path.resolve(process.cwd(), "./src");
const OUT_DIR = path.join(SRC_DIR, "interfaces");
const SPDX_HEADER = "// SPDX-License-Identifier: MIT"; // change latr

type FuncLike = {
  name?: string;
  parameters: string;
  returns?: string;
  stateMutability?: string;
  visibility?: string;
};

function prepareOutDir() {
  if (fs.existsSync(OUT_DIR)) {
    const files = fs.readdirSync(OUT_DIR);
    for (const file of files) {
      const filePath = path.join(OUT_DIR, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    }
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
}

function extractPragmaAndVersion(fileText: string) {
  try {
    const ast = parser.parse(fileText, { tolerant: true });
    let pragma = "";
    parser.visit(ast, {
      PragmaDirective(node: any) {
        if (!pragma && node.name === "solidity") {
          pragma = `pragma solidity ${node.value};`;
        }
      },
    });
    return pragma;
  } catch (e) {
    return "";
  }
}

function typeNameToString(node: any): string {
  if (!node) return "";
  switch (node.type) {
    case "ElementaryTypeName":
      return node.name;
    case "UserDefinedTypeName":
      if (typeof node.namePath === "string") {
        return node.namePath;
      } else if (node.namePath && node.namePath.name) {
        return node.namePath.name;
      } else if (Array.isArray(node.namePath)) {
        return node.namePath.map((p: any) => p.name || p).join(".");
      }
      return node.name || "UnknownType";
    case "ArrayTypeName":
      return `${typeNameToString(node.baseTypeName)}${
        node.length ? `[${node.length}]` : "[]"
      }`;
    case "Mapping":
      return `mapping(${typeNameToString(node.keyType)} => ${typeNameToString(
        node.valueType,
      )})`;
    case "FunctionTypeName":
      return "function";
    default:
      return node.name || "UnknownType";
  }
}

function needsDataLocation(typeName: string): boolean {
  if (typeName === "string" || typeName === "bytes") return true;
  if (typeName.endsWith("[]")) return true;
  if (typeName.startsWith("mapping(")) return true;
  // Structs: starts with uppercase, not value types
  if (
    typeName[0] === typeName[0].toUpperCase() &&
    typeName !== "address" &&
    !typeName.startsWith("I") &&
    !typeName.startsWith("Uint") &&
    !typeName.startsWith("Int") &&
    !typeName.startsWith("Bytes")
  )
    return true;
  return false;
}

function extractMappingParams(
  typeName: any,
  paramNames: string[] = [],
): { params: string[]; returnType: string } {
  if (typeName.type === "Mapping") {
    const keyType = typeNameToString(typeName.keyType);
    const paramName = paramNames.length > 0 ? paramNames[0] : "key";
    const keyParam = needsDataLocation(keyType)
      ? `${keyType} calldata ${paramName}`
      : `${keyType} ${paramName}`;

    const nextParamNames =
      paramNames.length > 1
        ? paramNames.slice(1)
        : [`key${paramNames.length + 1}`];
    const nested = extractMappingParams(typeName.valueType, nextParamNames);

    return {
      params: [keyParam, ...nested.params],
      returnType: nested.returnType,
    };
  } else {
    return {
      params: [],
      returnType: typeNameToString(typeName),
    };
  }
}

function paramListToString(paramList: any): string {
  if (!paramList || !Array.isArray(paramList)) return "";
  return paramList
    .map((p: any) => {
      const t = typeNameToString(p.typeName);

      const name = p.name || "";

      const storageLocation = p.storageLocation || "";
      const locationStr =
        storageLocation && storageLocation !== "default"
          ? ` ${storageLocation}`
          : "";
      return name ? `${t}${locationStr} ${name}` : `${t}${locationStr}`;
    })
    .join(", ");
}

function returnsToString(paramList: any): string {
  if (!paramList || !Array.isArray(paramList) || paramList.length === 0)
    return "";
  const s = paramList
    .map((p: any) => {
      const t = typeNameToString(p.typeName);
      const name = p.name || "";

      const storageLocation = p.storageLocation || "";
      const locationStr =
        storageLocation && storageLocation !== "default"
          ? ` ${storageLocation}`
          : "";
      return name ? `${t}${locationStr} ${name}` : `${t}${locationStr}`;
    })
    .join(", ");
  return s.includes(",") ? `(${s})` : s;
}

function functionToSignature(node: any): string {
  const name = node.name || "";

  if (
    !name ||
    name === "constructor" ||
    name === "receive" ||
    name === "fallback"
  )
    return "";

  const params = paramListToString(node.parameters);
  const returns = node.returnParameters
    ? returnsToString(node.returnParameters)
    : "";
  const stateMut =
    node.stateMutability && node.stateMutability !== "nonpayable"
      ? node.stateMutability
      : "";

  const visibility = node.visibility || "";
  if (visibility === "private" || visibility === "internal") return "";

  const parts = [];
  parts.push(`function ${name}(${params})`);
  parts.push("external");
  if (stateMut) parts.push(stateMut);
  if (returns) parts.push(`returns (${returns})`);

  return parts.join(" ") + ";";
}

function eventToSignature(node: any): string {
  const name = node.name;
  const params =
    node.parameters && node.parameters.parameters
      ? node.parameters.parameters
          .map((p: any) => {
            const type = typeNameToString(p.typeName);
            const indexed = p.indexed ? " indexed" : "";
            const pname = p.name ? ` ${p.name}` : "";
            return `${type}${indexed}${pname}`;
          })
          .join(", ")
      : "";
  return `event ${name}(${params});`;
}

function structToDefinition(node: any): string {
  const name = node.name;
  const members = node.members
    ? node.members
        .map((member: any) => {
          const type = typeNameToString(member.typeName);
          const memberName = member.name;
          return `        ${type} ${memberName};`;
        })
        .join("\n")
    : "";

  return `    struct ${name} {\n${members}\n    }`;
}

function errorToSignature(node: any): string {
  const name = node.name;
  const params = node.parameters ? paramListToString(node.parameters) : "";
  return `error ${name}(${params});`;
}

function extractImmutableVariables(
  fileText: string,
): Map<string, { varName: string; type: string }> {
  const immutableVars = new Map<string, { varName: string; type: string }>();
  const lines = fileText.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes("public immutable")) {
      const match = trimmed.match(/(\w+)\s+public\s+immutable\s+(\w+);/);
      if (match) {
        const [, type, varName] = match;
        immutableVars.set(type, { varName, type });
      }
    }
  }

  return immutableVars;
}

function generateInterfaceForContract(
  contractNode: any,
  pragma: string | null,
  srcFilePath: string,
  sourceText: string,
) {
  const name = contractNode.name;
  const ifaceName = `I${name}`;
  const outFilename = path.join(OUT_DIR, `I${name}.sol`);

  const immutableVars = extractImmutableVariables(sourceText);

  const lines: string[] = [];
  lines.push(SPDX_HEADER);
  if (pragma) lines.push(pragma);
  lines.push("");

  const rel = path.relative(process.cwd(), srcFilePath);
  lines.push(
    `// Auto-generated from ${rel} — DO NOT EDIT (regenerate with the script only)`,
  );
  lines.push("");
  lines.push(`interface ${ifaceName} {`);

  if (contractNode.subNodes && Array.isArray(contractNode.subNodes)) {
    for (const sub of contractNode.subNodes) {
      switch (sub.type) {
        case "StructDefinition": {
          const structDef = structToDefinition(sub);
          lines.push(structDef);
          lines.push("");
          break;
        }
        case "FunctionDefinition": {
          const sig = functionToSignature(sub);
          if (sig) lines.push(`    ${sig}`);
          break;
        }
        case "EventDefinition": {
          const sig = eventToSignature(sub);
          lines.push(`    ${sig}`);
          break;
        }
        case "ErrorDefinition": {
          const sig = errorToSignature(sub);
          lines.push(`    ${sig}`);
          break;
        }
        case "VariableDeclaration": {
          if (sub.visibility === "public") {
            const varType = typeNameToString(sub.typeName);
            const varName = sub.name;

            let params = "";
            let returnType = varType;

            if (sub.typeName.type === "ArrayTypeName") {
              params = `uint256 index`;
              returnType = typeNameToString(sub.typeName.baseTypeName);
            } else if (sub.typeName.type === "Mapping") {
              const mappingInfo = extractMappingParams(sub.typeName);
              params = mappingInfo.params.join(", ");
              returnType = mappingInfo.returnType;
            }

            if (
              returnType.startsWith("I") &&
              returnType !== "int" &&
              returnType !== "int256"
            ) {
              returnType = "address";
            }

            const returnLocation = needsDataLocation(returnType)
              ? ` memory`
              : "";
            const getterSig = `function ${varName}(${params}) external view returns (${returnType}${returnLocation});`;
            lines.push(`    ${getterSig}`);
          }
          break;
        }
        case "StateVariableDeclaration": {
          if (sub.variables && Array.isArray(sub.variables)) {
            for (const variable of sub.variables) {
              if (variable.visibility === "public") {
                const varType = typeNameToString(variable.typeName);
                let varName = variable.name;

                if (varName === "immutable") {
                  const immutableInfo = immutableVars.get(varType);
                  if (immutableInfo) {
                    varName = immutableInfo.varName;
                  }
                }

                let params = "";
                let returnType = varType;

                if (variable.typeName.type === "ArrayTypeName") {
                  params = `uint256 index`;
                  returnType = typeNameToString(variable.typeName.baseTypeName);
                } else if (variable.typeName.type === "Mapping") {
                  const mappingInfo = extractMappingParams(variable.typeName);
                  params = mappingInfo.params.join(", ");
                  returnType = mappingInfo.returnType;
                }

                if (
                  returnType.startsWith("I") &&
                  returnType !== "int" &&
                  returnType !== "int256"
                ) {
                  returnType = "address";
                }

                const returnLocation = needsDataLocation(returnType)
                  ? ` memory`
                  : "";
                const getterSig = `function ${varName}(${params}) external view returns (${returnType}${returnLocation});`;
                lines.push(`    ${getterSig}`);
              }
            }
          }
          break;
        }
        default:
          break;
      }
    }
  }

  lines.push("}");
  lines.push("");

  fs.writeFileSync(outFilename, lines.join("\n"), { encoding: "utf8" });
  console.log(`Wrote ${path.relative(process.cwd(), outFilename)}`);
}

function processFile(filePath: string) {
  const text = fs.readFileSync(filePath, "utf8");
  const pragma = extractPragmaAndVersion(text);
  let ast: any;
  try {
    ast = parser.parse(text, { tolerant: true });
  } catch (err) {
    console.error(`Failed to parse ${filePath}:`, err);
    return;
  }

  parser.visit(ast, {
    ContractDefinition(node: any) {
      if (node.kind === "contract") {
        generateInterfaceForContract(node, pragma, filePath, text);
      }
    },
  });
}

function main() {
  prepareOutDir();
  const pattern = path.join(SRC_DIR, "**/*.sol");
  const files = glob.sync(pattern, {
    nodir: true,
    ignore: [path.join(OUT_DIR, "**/*")],
  });

  if (files.length === 0) {
    console.log("No solidity files found under src/");
    return;
  }

  for (const f of files) {
    processFile(f);
  }
  console.log("Done.");
}

main();
