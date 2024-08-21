// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0
/*
Copyright 2024, jan-ale on github.
Code licensed under GPL 3.0 or any later version.
*/
"use strict";
const LEX_STATES = {};
LEX_STATES.NUMBER = null;
LEX_STATES.OPERATOR = null;
LEX_STATES.T = null;
LEX_STATES.START = null;
LEX_STATES.LEFT_PAREN = null;
LEX_STATES.RIGHT_PAREN = null;
LEX_STATES.SHL = null; //corresponds to parsing first character of shift left (<<)
LEX_STATES.SHR = null; //corresponds to parsing first character of shift right (>>)
LEX_STATES.UNARY = null;
const TOKENS = {};
TOKENS.NUMBER = null;
TOKENS.OPERATOR = null;
TOKENS.LEFT_PAREN = null;
TOKENS.RIGHT_PAREN = null;
TOKENS.T = null;
TOKENS.UNARY = null;
function enumify(obj) {
  let id = 0;
  for(let val in obj) {
    obj[val] = id;
    id++;
  }
  Object.freeze(obj);
}
function invertEnum(obj) {
  const inverted = {};
  for(let val in obj) {
    inverted[obj[val]] = val;
  }
  return inverted;
}
enumify(LEX_STATES);
enumify(TOKENS);
function lex(text) {
  const OPERATORS = ["+", "-", "*", "/", "&", "|", "^", "%"]; //>> and << also supported
  const UNARIES = ["-"];
  const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const tokens = [];
  let state = LEX_STATES.START;
  let tokenStart = 0;
  for(let i=0;i<text.length;i++) {
    switch(state) {
      case LEX_STATES.NUMBER:
        if(NUMBERS.includes(text[i])) {
          break;
        }
        tokens.push({type: TOKENS.NUMBER, value: text.slice(tokenStart, i)});
        tokenStart = i;
        if(OPERATORS.includes(text[i])) {
          state = LEX_STATES.OPERATOR;
          break;
        }
        if(text[i]==="<") {
          state = LEX_STATES.SHL;
          break;
        }
        if(text[i]===">") {
          state = LEX_STATES.SHR;
          break;
        }
        if(text[i]===")") {
          state = LEX_STATES.RIGHT_PAREN;
          break;
        }
        throw `Lexing error at char ${i}: Expected either a digit or an operator after a number, got "${text[i]}"`;
      case LEX_STATES.T:
        tokens.push({type: TOKENS.T, value: "t"});
        tokenStart = i;
        if(OPERATORS.includes(text[i])) {
          state = LEX_STATES.OPERATOR;
          break;
        }
        if(text[i]==="<") {
          state = LEX_STATES.SHL;
          break;
        }
        if(text[i]===">") {
          state = LEX_STATES.SHR;
          break;
        }
        if(text[i]===")") {
          state = LEX_STATES.RIGHT_PAREN;
          break;
        }
        throw `Lexing error at char ${i}: Expected an operator after "t", got "${text[i]}"`;
      case LEX_STATES.OPERATOR:
        tokens.push({type: TOKENS.OPERATOR, value: text.slice(tokenStart, i)});
        tokenStart = i;
        if(NUMBERS.includes(text[i])) {
          state = LEX_STATES.NUMBER;
          break;
        }
        if(text[i]==="t") {
          state = LEX_STATES.T;
          break;
        }
        if(text[i]==="(") {
          state = LEX_STATES.LEFT_PAREN;
          break;
        }
        if(UNARIES.includes(text[i])) {
          state = LEX_STATES.UNARY;
          break;
        }
        throw `Lexing error at char ${i}: Expected number after operator, got "${text[i]}"`;
      case LEX_STATES.START:
        if(NUMBERS.includes(text[i])) {
          state = LEX_STATES.NUMBER;
          break;
        }
        if(text[i]==="t") {
          state = LEX_STATES.T;
          break;
        }
        if(text[i]==="(") {
          state = LEX_STATES.LEFT_PAREN;
          break;
        }
        if(UNARIES.includes(text[i])) {
          state = LEX_STATES.UNARY;
          break;
        }
        throw `Lexing error at beginning: Expected number or opening parenthesis, got "${text[i]}"`;
      case LEX_STATES.LEFT_PAREN:
        tokens.push({type: TOKENS.LEFT_PAREN, value: "("});
        tokenStart = i;
        if(NUMBERS.includes(text[i])) {
          state = LEX_STATES.NUMBER;
          break;
        }
        if(text[i]==="t") {
          state = LEX_STATES.T;
          break;
        }
        if(text[i]==="(") {
          state = LEX_STATES.LEFT_PAREN;
          break;
        }
        if(UNARIES.includes(text[i])) {
          state = LEX_STATES.UNARY;
          break;
        }
        throw `Lexing error at char ${i}: Expected number after opening parenthesis, got "${text[i]}"`;
      case LEX_STATES.RIGHT_PAREN:
        tokens.push({type: TOKENS.RIGHT_PAREN, value: ")"});
        tokenStart = i;
        if(OPERATORS.includes(text[i])) {
          state = LEX_STATES.OPERATOR;
          break;
        }
        if(text[i]==="<") {
          state = LEX_STATES.SHL;
          break;
        }
        if(text[i]===">") {
          state = LEX_STATES.SHR;
          break;
        }
        throw `Lexing error at char ${i}: Expected operator after closing parenthesis, got "${text[i]}"`;
      case LEX_STATES.SHL:
        if(text[i]=="<") {
          state = LEX_STATES.OPERATOR;
          break;
        }
        throw `Lexing error at char ${i}: Expected shift left, got "${text[i]}"`;
      case LEX_STATES.SHR:
        if(text[i]==">") {
          state = LEX_STATES.OPERATOR;
          break;
        }
        throw `Lexing error at char ${i}: Expected shift right, got "${text[i]}"`;
      case LEX_STATES.UNARY:
        tokens.push({type: TOKENS.UNARY, value: text.slice(tokenStart, i)});
        tokenStart = i;
        if(NUMBERS.includes(text[i])) {
          state = LEX_STATES.NUMBER;
          break;
        }
        if(text[i]==="t") {
          state = LEX_STATES.T;
          break;
        }
        if(text[i]==="(") {
          state = LEX_STATES.LEFT_PAREN;
          break;
        }
        throw `Lexing error at char ${i}: Expected number after unary operator, got ${text[i]}`
      default:
        const INVERTED_STATES = invertEnum(LEX_STATES);
        throw `Lexing error at char ${i} (bug is in my code): Somehow got to an unknown/unhandled state. State name: ${INVERTED_STATES[state]}, Enum value: ${state}`;
    }
  }
  switch(state) {
    case LEX_STATES.NUMBER:
      tokens.push({type: TOKENS.NUMBER, value: text.slice(tokenStart, text.length)});
      break;
    case LEX_STATES.RIGHT_PAREN:
      tokens.push({type: TOKENS.RIGHT_PAREN, value: ")"});
      break;
    case LEX_STATES.T:
      tokens.push({type: TOKENS.T, value: "t"});
      break;
    case LEX_STATES.OPERATOR:
      throw `Lexing error at end: Ended with parsing an operator.`;
      break;
    default:
      const INVERTED_STATES = invertEnum(LEX_STATES);
      throw `Lexing error at end: Ended with parsing ${INVERTED_STATES[state]}`;
  }
  return tokens;
}
function parseRecursiveDescent(tokens) {
  return parseLevel(tokens, 0, 0);
}
const AST_TYPES = {};
AST_TYPES.OPERATOR = null;
AST_TYPES.NUMBER = null;
AST_TYPES.T = null;
AST_TYPES.UNARY = null;
enumify(AST_TYPES);
function parseLevel(tokens, level, start) { //recursive descent precendence climbing //start only affects error reporting, is where it is in the original list of tokens
  //console.log(`Parsing tokens:\n${tokensToText(tokens)}\nlevel: ${level}, start: ${start}`); //helpful for debugging
  // from https://en.cppreference.com/w/c/language/operator_precedence
  const LEVELS = [["|"],["^"],["&"],[">>","<<"],["+","-"],["*","/","%"]]; //higher precedence on right
  if(level == LEVELS.length) {
    if(tokens.length == 0) {
      throw `Parsing error at token ${start}: Empty statement`;
    }
    if(tokens.length == 1) {
      switch(tokens[0].type) {
        case TOKENS.NUMBER:
          return {
            type: AST_TYPES.NUMBER,
            value: parseInt(tokens[0].value)
          };
        case TOKENS.T:
          return {type: AST_TYPES.T};
        default:
          const INVERTED_TOKENS = invertEnum(TOKENS);
          throw `Parsing error at token ${start}: Expected number, got ${INVERTED_TOKENS[tokens[0].type]}`;
      }
    }
    if(tokens[0].type == TOKENS.LEFT_PAREN && tokens[tokens.length-1].type == TOKENS.RIGHT_PAREN) {
      return parseLevel(tokens.slice(1,-1), 0, start+1);
    }
    if(tokens[0].type == TOKENS.UNARY) {
      return {
        type: AST_TYPES.UNARY,
        operator: tokens[0].value,
        operand: parseLevel(tokens.slice(1), 0, start+1)
      };
    }
    throw `Parsing error at token ${start} (bug is in my code): Weird terminal parse tokens:\n${tokensToText(tokens)}`;
  }
  let parens = 0; //number of parentheses parser is inside. will only recurse on parentheses and do nothing else.
  let tree = null;
  let subExpressionStart = 0; // for tokens [2 + 3 + 5], after parsing first + and before parsing second +, subExpressionStart would be 2.
                              // subexpressions are anything the current function call cannot handle
  for(let i=0; i<tokens.length; i++) {
    switch(tokens[i].type) {
      case TOKENS.LEFT_PAREN:
        parens++;
        break;
      case TOKENS.RIGHT_PAREN:
        parens--;
        if(parens < 0) throw `Parsing error at token ${i+start}: Too many right parentheses`;
        break;
      case TOKENS.OPERATOR:
        if(parens == 0) {
          if(LEVELS[level].includes(tokens[i].value)) {
            const parsedSubExpression = parseLevel(tokens.slice(subExpressionStart,i),level+1,start+subExpressionStart);
            if(tree) {
              tree = {
                type: AST_TYPES.OPERATOR,
                operator: tokens[subExpressionStart-1].value,
                left: tree,
                right: parsedSubExpression
              }
            } else {
              tree = parsedSubExpression;
            }
            subExpressionStart = i+1;
          }
        }
        break;
      case TOKENS.NUMBER:
      case TOKENS.T:
      case TOKENS.UNARY:
        break;
      default:
        const INVERTED_TOKENS = invertEnum(TOKENS);
        throw `Parsing error at token ${i+start} (bug is in my code): Somehow got to an unknown/unhandled token type. State name: ${INVERTED_TOKENS[tokens[i].type]}, Enum value: ${tokens[i].type}`;
    }
  }
  if(parens > 0) {
    throw `Parsing error at end (token ${tokens.length+start}): Unclosed parenthesis`;
  }
  const parsedSubExpression = parseLevel(tokens.slice(subExpressionStart,tokens.length),level+1,start+subExpressionStart);
  if(tree) {
    tree = {
      type: AST_TYPES.OPERATOR,
      operator: tokens[subExpressionStart-1].value,
      left: tree,
      right: parsedSubExpression
    }
  } else {
    tree = parsedSubExpression;
  }
  return tree;
}
const CODE_BOX = document.getElementById("code");
const COMPILE_DETAILS = document.getElementById("compdetails");
function tokensToText(tokens) {
  const INVERTED_STATES = invertEnum(TOKENS);
  return tokens.map((x,i)=>`${i}: ${x.value} (${INVERTED_STATES[x.type]})`).join("\n");
}
function ASTToText(tree) {
  return ASTToTextIndent(tree, "");
}
function ASTToTextIndent(tree, indent) {
  switch(tree.type) {
    case AST_TYPES.OPERATOR:
      return `(
${indent}  ${tree.operator}
${indent}  ${ASTToTextIndent(tree.left,indent+"  ")}
${indent}  ${ASTToTextIndent(tree.right,indent+"  ")}
${indent})`;
    case AST_TYPES.NUMBER:
      return `${tree.value}`;
    case AST_TYPES.T:
      return `t`;
    case AST_TYPES.UNARY:
      return `(
${indent}  ${tree.operator}
${indent}  ${ASTToTextIndent(tree.operand,indent+"  ")}
${indent})`;
    default:
      throw `Error when converting AST to text (bug is in my code): Unrecognized AST type ${invertEnum(AST_TYPES)[tree.type]}`;
  }
}
function compile() {
  COMPILE_DETAILS.textContent = "";
  const code = CODE_BOX.value;
  try {
    const LEX_SECTION = document.createElement("h2");
    LEX_SECTION.textContent = "Tokens:";
    COMPILE_DETAILS.appendChild(LEX_SECTION);
    const tokens = lex(code);
    const tokenText = document.createElement("pre");
    tokenText.textContent = tokensToText(tokens);
    COMPILE_DETAILS.appendChild(tokenText);
    const PARSE_SECTION = document.createElement("h2");
    PARSE_SECTION.textContent = "Parse tree (lisp):";
    COMPILE_DETAILS.appendChild(PARSE_SECTION);
    const ast = parseRecursiveDescent(tokens);
    const astText = document.createElement("pre");
    astText.textContent = ASTToText(ast);
    COMPILE_DETAILS.appendChild(astText);
  } catch(e) {
    console.error(e);
    const error = document.createElement("pre");
    error.textContent = e;
    COMPILE_DETAILS.appendChild(error);
    return;
  }
}
const COMPILE_BUTTON = document.getElementById("compile");
COMPILE_BUTTON.addEventListener("click", compile);
// @license-end
