fn main() {
    let src_dir = std::path::Path::new("src");

    let mut c_config = cc::Build::new();
    c_config.std("c11").include(src_dir);
    c_config.define("tree_sitter_hocon", "brokk_tree_sitter_hocon");
    c_config.define(
        "tree_sitter_hocon_external_scanner_create",
        "brokk_tree_sitter_hocon_external_scanner_create",
    );
    c_config.define(
        "tree_sitter_hocon_external_scanner_destroy",
        "brokk_tree_sitter_hocon_external_scanner_destroy",
    );
    c_config.define(
        "tree_sitter_hocon_external_scanner_serialize",
        "brokk_tree_sitter_hocon_external_scanner_serialize",
    );
    c_config.define(
        "tree_sitter_hocon_external_scanner_deserialize",
        "brokk_tree_sitter_hocon_external_scanner_deserialize",
    );
    c_config.define(
        "tree_sitter_hocon_external_scanner_scan",
        "brokk_tree_sitter_hocon_external_scanner_scan",
    );

    #[cfg(target_env = "msvc")]
    c_config.flag("-utf-8");

    for file in ["parser.c", "scanner.c"] {
        let path = src_dir.join(file);
        c_config.file(&path);
        println!("cargo:rerun-if-changed={}", path.to_str().unwrap());
    }

    c_config.compile("brokk-tree-sitter-hocon");
}
