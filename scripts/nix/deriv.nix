with nixpkgs;

pkgs.mkShell {
  buildInputs = [
    deno
    openssl
    curl
    git
    pv
  ];
}
