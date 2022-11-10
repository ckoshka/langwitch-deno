with nixpkgs;

pkgs.mkShell {
  buildInputs = [
    deno
    openssl
    curl
    git
    pv
    python310
    python310Packages.rich
    python310Packages.typer
    python310Packages.textual
  ];
}
