declare function maxCharsPerLine(): number;
declare function indent(count: any, chr?: string): string;
declare function indentLines(string: any, spaces: any, firstLineSpaces: any): string;
declare function foldLines(string: any, spaces: any, firstLineSpaces: any, charsPerLine?: number): string;
declare function colorize(text: any): any;
declare function box(message: any, title: any, options: any): string;
declare function successBox(message: any, title: any): string;
declare function warningBox(message: any, title: any): string;
declare function errorBox(message: any, title: any): string;
declare function fatalBox(message: any, title: any): string;
export { maxCharsPerLine, indent, indentLines, foldLines, colorize, box, successBox, warningBox, errorBox, fatalBox };
//# sourceMappingURL=formatting.d.ts.map