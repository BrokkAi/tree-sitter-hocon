#include "tree_sitter/parser.h"

// HOCON separates fields and array elements with a comma or a newline, but
// a newline is ordinary whitespace everywhere else. The scanner emits a
// newline token only where the parser can accept one; elsewhere newlines
// are extras.

enum TokenType {
  NEWLINE,
  ERROR_SENTINEL,
};

void *tree_sitter_hocon_external_scanner_create(void) { return NULL; }

void tree_sitter_hocon_external_scanner_destroy(void *payload) { (void)payload; }

unsigned tree_sitter_hocon_external_scanner_serialize(void *payload, char *buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_hocon_external_scanner_deserialize(void *payload, const char *buffer,
                                                    unsigned length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

static bool is_inline_space(int32_t c) {
  return c == ' ' || c == '\t' || c == '\r' || c == '\f' || c == '\v' || c == 0x00a0 ||
         c == 0xfeff;
}

bool tree_sitter_hocon_external_scanner_scan(void *payload, TSLexer *lexer,
                                             const bool *valid_symbols) {
  (void)payload;
  // During error recovery every symbol is valid; let the internal lexer
  // treat newlines as whitespace then.
  if (valid_symbols[ERROR_SENTINEL] || !valid_symbols[NEWLINE]) {
    return false;
  }
  while (is_inline_space(lexer->lookahead)) {
    lexer->advance(lexer, true);
  }
  if (lexer->lookahead != '\n' && lexer->lookahead != 0x2028 && lexer->lookahead != 0x2029) {
    return false;
  }
  lexer->advance(lexer, false);
  lexer->mark_end(lexer);
  lexer->result_symbol = NEWLINE;
  return true;
}
