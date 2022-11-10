let
  rustOverlay = import (builtins.fetchTarball
    "https://github.com/oxalica/rust-overlay/archive/master.tar.gz");
  nixpkgs = import <nixpkgs> { overlays = [ rustOverlay ]; };
  rustChannel = nixpkgs.rust-bin.stable.latest.default;
in
with nixpkgs;

pkgs.mkShell {
  nativeBuildInputs = [
    rustChannel 
    
  ];
  buildInputs = [
    deno
    openssl
    curl
    git
  ];
}

