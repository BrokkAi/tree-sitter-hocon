# HOCON Grammar for Tree-sitter

This crate provides Brokk's independently maintained
[HOCON](https://github.com/lightbend/config/blob/main/HOCON.md) grammar,
published as `brokk-tree-sitter-hocon`.

```toml
tree-sitter = "0.25"
tree-sitter-hocon = { package = "brokk-tree-sitter-hocon", version = "=0.1.0" }
```

```rust
let mut parser = tree_sitter::Parser::new();
parser
    .set_language(&tree_sitter_hocon::LANGUAGE.into())
    .expect("Error loading HOCON grammar");
```

The parser keeps authored structure only. It does not merge objects, resolve
`include` directives or expand `${...}` substitutions.
