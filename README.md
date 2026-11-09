# tree-sitter-hocon

Brokk's maintained [Tree-sitter](https://tree-sitter.github.io/) grammar for
[HOCON](https://github.com/lightbend/config/blob/main/HOCON.md), the
configuration format of Akka, Akka.NET and Lightbend Config. It is published to
crates.io as `brokk-tree-sitter-hocon`.

Forked from [`antosha417/tree-sitter-hocon`](https://github.com/antosha417/tree-sitter-hocon)
and rewritten as a standalone grammar:

- Newlines separate fields and array elements only where the parser can
  accept a separator (an external scanner decides); elsewhere they are
  whitespace.
- Paths keep each `.`-separated element as a `path_element` node, so quoted
  elements such as `"a.b".c` and whitespace inside an element (`a b.c`) stay
  exact.
- A `value` node holds every concatenated piece in order (`10 s`,
  `foo ${bar} "baz"`, `${base} { x = 1 }`).
- `include` with `url(...)`, `file(...)`, `classpath(...)` and
  `required(...)`, `${path}` and `${?path}` substitutions, `+=`, and
  triple-quoted strings are parsed.

The grammar records authored structure only: object merging, includes and
substitutions are left to consumers.

## Development

```bash
npm ci --ignore-scripts && npm rebuild tree-sitter-cli
npx tree-sitter generate
npx tree-sitter test
cargo test
```

Releases are published from a tag by `.github/workflows/publish.yml` through
crates.io trusted publishing.
