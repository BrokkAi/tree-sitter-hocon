(comment) @comment

[(null) (true) (false)] @constant.builtin

(number) @number
(string) @string
(multiline_string) @string
(unquoted_string) @string

[
  "url"
  "file"
  "classpath"
  "required"
  "include"
] @keyword

(substitution ["${" "${?" "}"] @punctuation.special)
(substitution (path) @variable)

(field key: (path) @property)
(field operator: _ @operator)

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  "."
] @punctuation.delimiter
