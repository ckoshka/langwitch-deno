let
  nixpkgs = import <nixpkgs> {  };
in
with nixpkgs;

let dedup = stdenv.mkDerivation {
    name = "dedup";
    src = if system == "x86_64-darwin" then fetchurl {
      url = "http://example.org/libfoo-1.2.3.tar.bz2";
      sha256 = "0x2g1jqygyr5wiwg4ma1nd7w4ydpy82z9gkcv8vh2v8dn3y58v5m";
    } else if system == "x86_64-windows" then fetchurl {
      url = "http://example.org/libfoo-1.2.3.tar.bz2";
      sha256 = "0x2g1jqygyr5wiwg4ma1nd7w4ydpy82z9gkcv8vh2v8dn3y58v5m";
    } else fetchurl {
      url = "http://example.org/libfoo-1.2.3.tar.bz2";
      sha256 = "0x2g1jqygyr5wiwg4ma1nd7w4ydpy82z9gkcv8vh2v8dn3y58v5m";
    }
    ;
  };
in

pkgs.mkShell {
  nativeBuildInputs = [ 
    
  ];
  buildInputs = [
    openssl
    curl
    git
    dedup
  ];
}

