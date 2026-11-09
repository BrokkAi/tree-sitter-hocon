//! This crate provides HOCON language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [LANGUAGE][] constant to add this language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "akka.remote.dot-netty.tcp.enable-ssl = true\n";
//! let mut parser = tree_sitter::Parser::new();
//! let language = brokk_tree_sitter_hocon::LANGUAGE;
//! parser
//!     .set_language(&language.into())
//!     .expect("Error loading HOCON parser");
//! let tree = parser.parse(code, None).unwrap();
//! assert!(!tree.root_node().has_error());
//! ```
//!
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

extern "C" {
    fn brokk_tree_sitter_hocon() -> *const ();
}

/// The tree-sitter [`LanguageFn`][LanguageFn] for this grammar.
///
/// [LanguageFn]: https://docs.rs/tree-sitter-language/*/tree_sitter_language/struct.LanguageFn.html
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(brokk_tree_sitter_hocon) };

/// The Brokk-maintained grammar package version.
pub const GRAMMAR_VERSION: &str = env!("CARGO_PKG_VERSION");

/// The content of the [`node-types.json`][] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES: &str = include_str!("../../src/node-types.json");

/// The syntax highlighting query for this language.
pub const HIGHLIGHTS_QUERY: &str = include_str!("../../queries/highlights.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading HOCON parser");
    }

    #[test]
    fn parses_from_multiple_threads() {
        // The external scanner keeps no global state, so concurrent parses
        // must agree with a sequential one.
        let source = "a {\n  b = [1\n2]\n  c = ${d} x\n}\n";
        let expected = {
            let mut parser = tree_sitter::Parser::new();
            parser.set_language(&super::LANGUAGE.into()).unwrap();
            parser.parse(source, None).unwrap().root_node().to_sexp()
        };
        let threads: Vec<_> = (0..8)
            .map(|_| {
                std::thread::spawn(move || {
                    let mut parser = tree_sitter::Parser::new();
                    parser.set_language(&super::LANGUAGE.into()).unwrap();
                    (0..200)
                        .map(|_| parser.parse(source, None).unwrap().root_node().to_sexp())
                        .collect::<Vec<_>>()
                })
            })
            .collect();
        for thread in threads {
            for tree in thread.join().unwrap() {
                assert_eq!(tree, expected);
            }
        }
    }
}
