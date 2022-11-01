// representation, validation, storage/serialisation, retrieval/deserialisation
// these are all coupled to one another, representation/validation are looser bcs json can be stored in an sqlite row, etc.
// default?
// jsonl saved locally and backed up to github
// grace? dhall? dhall is on nix, grace isn't, so dhall. actually grace can be installed using nix. what a stupid question. anything can be installed with nix lol. no, still use dhall, grace is more meant to be forked for DSLs.
// wait no. jsonl for actual data, dhall for semi-data like configurationy stuff
// can we take advantage of the hashing stuff i.e equivalence of any two functions?
// having dhall not typescript is extremely important for extensions that need to read from the same place, using typescript for configuration should be the very very last meta-step

format requirement considerations:

- is it easily editable?
- is it easily viewable?
- can it easily be loaded and manipulated in non-typescript languages?
- is it compact?
- how fast can it be evaluated?
- is it secure?

- thing that allows you to convert typescript or whatever into several languages? quicktype
  wow haskell is way easier than i thought, turtle?

what's most important is...
we don't want to depend on the actual data structure, we want loose coupling, so just any function that can give us the data we need.
so what data do we need?
well, we need:

- the concepts the user already knows for a given dataset
  implying:
- what category those concepts belong to
- the history for those concepts over time
  implying:
- datestamped histories of concepts

start with the highest level, then break it down into substitutions.
we don't actually need the whole concepts obj in memory, we just need some key-value-based accessor and updater for it, but then we lose the benefits of immutability and rapid access

can symbol be changed to make js recognise instanceof for constructed records?
