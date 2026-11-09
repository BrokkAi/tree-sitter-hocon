/**
 * @file HOCON (Human-Optimized Config Object Notation) grammar for tree-sitter
 * @license MIT
 *
 * Follows the Lightbend HOCON specification
 * (https://github.com/lightbend/config/blob/main/HOCON.md).
 *
 * The parser keeps authored structure only. Value concatenation, object
 * merging, `include` and `${...}` substitution are left to consumers: a
 * `value` node holds every concatenated piece in order, and the whitespace
 * between two pieces is the source text between their nodes.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Characters the specification forbids in an unquoted string, plus
// whitespace. `/` is allowed except as the start of a `//` comment.
const FORBIDDEN = '$"{}\\[\\]:=,+#`^?!@*&\\\\';
const WHITESPACE = ' \\t\\n\\r\\f\\v\\u00a0\\ufeff\\u2028\\u2029';

function unquotedPattern(extra) {
  const plain = `[^${FORBIDDEN}${WHITESPACE}/${extra}]`;
  return new RegExp(`(${plain}|/${plain})+|/`);
}

module.exports = grammar({
  name: 'hocon',

  externals: $ => [
    $._newline,
    $._error_sentinel,
  ],

  extras: $ => [
    new RegExp(`[${WHITESPACE}]`),
    $.comment,
  ],


  rules: {
    // A document is one braced object, one array, or the fields of an
    // object whose braces are omitted.
    document: $ => optional(choice(
      $.object,
      $.array,
      $._fields,
    )),

    comment: _ => token(choice(
      seq('//', /[^\n]*/),
      seq('#', /[^\n]*/),
    )),

    _fields: $ => seq(
      $._member,
      repeat(seq($._separator, $._member)),
      optional($._separator),
    ),

    _member: $ => choice($.field, $.include),

    // At most one comma, with newlines on either side of it.
    _separator: $ => choice(
      seq(',', optional($._newline)),
      seq($._newline, optional(seq(',', optional($._newline)))),
    ),

    field: $ => seq(
      field('key', $.path),
      choice(
        seq(
          field('operator', choice(':', '=', '+=')),
          field('value', $.value),
        ),
        // `key { ... }` omits the separator before an object.
        field('value', alias($._object_value, $.value)),
      ),
    ),

    object: $ => seq('{', optional($._fields), '}'),

    array: $ => seq(
      '[',
      optional(seq(
        $.value,
        repeat(seq($._separator, $.value)),
        optional($._separator),
      )),
      ']',
    ),

    // One value, or several concatenated on one line.
    value: $ => repeat1($._piece),

    _object_value: $ => seq($.object, repeat($._piece)),

    _piece: $ => choice(
      $.object,
      $.array,
      $.string,
      $.multiline_string,
      $.number,
      $.true,
      $.false,
      $.null,
      $.substitution,
      $.unquoted_string,
    ),

    // A path is one or more elements joined by `.`. An element is one or
    // more unquoted or quoted pieces; whitespace between pieces belongs to
    // the element.
    path: $ => seq(
      $.path_element,
      repeat(seq(token.immediate('.'), $.path_element)),
    ),

    path_element: $ => prec.right(repeat1(choice(
      $.unquoted_key,
      $.string,
    ))),

    substitution: $ => seq(
      choice('${', field('optional', '${?')),
      field('path', $.path),
      '}',
    ),

    include: $ => seq(
      'include',
      choice(
        $._include_target,
        seq(field('required', 'required'), '(', $._include_target, ')'),
      ),
    ),

    _include_target: $ => choice(
      field('resource', $.string),
      seq(
        field('kind', choice('url', 'file', 'classpath')),
        '(',
        field('resource', $.string),
        ')',
      ),
    ),

    // A JSON string. Escapes stay inside the token; consumers decode the
    // token as JSON.
    string: _ => token(seq(
      '"',
      repeat(choice(
        /[^"\\\n]/,
        /\\[^\n]/,
      )),
      '"',
    )),

    // Raw text between `"""` delimiters. Quotes before the closing `"""`
    // belong to the content.
    multiline_string: _ => token(seq(
      '"""',
      repeat(choice(
        /[^"]/,
        /"[^"]/,
        /""[^"]/,
      )),
      /"""+/,
    )),

    number: _ => token(prec(1,
      /-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/,
    )),

    true: _ => 'true',
    false: _ => 'false',
    null: _ => 'null',

    unquoted_string: _ => token(unquotedPattern('')),

    unquoted_key: _ => token(unquotedPattern('.')),
  },
});
