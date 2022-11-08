<img src="https://github.com/ckoshka/langwitch-deno/raw/master/static/potted_plant.png" width="200" />

### The what

- Langwitch is an experimental language learning tool for power users.
- It can teach you any language from scratch with just a collection of sentences and their translations.
- Or, alternatively, any writing system from scratch with just a collection of words and their IPA transcriptions.
- It comes with 25 billion high-quality sentences mined across 1700 languages using a combination of traditional heuristic filtering and automatically curated neural machine translation.

### The how

#### From a type-level perspective

- Langwitch has a sound, declarative plugin architecture expressed as a polymorphic effect system using commutative monoids. The application itself is a free monad.
- Every part of Langwitch is implemented in terms of this architecture, meaning anything can be freely substituted via configuration without forking the source code.

#### From an algorithmic perspective

- There are three core algorithms that Langwitch uses. All of them are simple, easy to reason about, and completely parameterised.
- Langwitch is quite fast. I have a very low tolerance threshold for slow interfaces. My personal Portuguese collection has 13 million sentences and it boots within five seconds; once the session has loaded, each topological reordering requires between 0.5ms and 5ms. 

### The why

It really bothers me how slow, boring, and useless normal language-learning is. 

You have textbooks having you memorise stock phrases like "How do you do?" or "I would like a coffee", Duolingo courses that make you learn names of furtniture, universities that hand out photocopies of verb declension worksheets.

It's a really appalling situation. 

About a year ago, I wondered whether the process could be optimised. I was hoping for something maybe 10 to 50% faster, maybe shaving a few weeks off the process. 

From testing with early adopters over the last year, it seems like the difference isn't 15 to 20% faster, but 10 to 50 times faster – often compressing weeks into a few hours. It's not that Langwitch does anything special or unique, it's simply that most other methods are just very bad, reflecting the intuitions of 19th century pedagogy rather than modern cognitive linguistics.

### The who

Here are some cases where you might want to use or extend Langwitch.

* You want something hackable, not a glib monolithic interface that assumes you're too incompetent to customise anything
* You enjoy trying out experimental prototypes
* You're frustrated, bored, or confused when it comes to "normal" second-language acquisition
* You get a kick out of pushing yourself, measuring yourself, and continually breaking new records
    * Langwitch includes a suite of tools that allow you to perform statistical analysis and detailed instrumentation of your own performance
* You like to solve puzzles

Here are some cases where Langwitch might not be right for you.

* You prefer to have everything explicitly put in front of you. 
    * Langwitch does not tell you what each word translates to, it allows you to infer its full meaning from its context. It doesn't teach you grammatical rules either – it's a tango between subconscious absorption and conscious puzzle-solving.
* You need extrinsic motivation in the form of levelling up, streaks, virtual currencies, and stores.
    * That's okay. Langwitch has those as opt-ins. But it's really meant for people who prefer to define their own goals, their own metrics, and their own successes.
* You have your own method and it works just fine for you.
    * In that case, Langwitch might be useful as an adjunct for your current method, but you know best.

## Installation

### Requirements

- [Nix](https://nixos.org/download.html)

If Nix fails for some reason (I think I've seen this happen twice)

That's it.

Langwitch doesn't pollute your environment.

The build-step creates some Rust binaries, adds some example configuration files for you to tweak, then it's done.

Langwitch itself is a self-contained script run in an isolated Nix shell. You just need to choose where you want it to live.

Lastly, you need some sentences for it to draw from. By default, it will download at most 5 million sentences covering equal proportions of everything available. 

It has general datasets covering the internet, UN transcripts, movie dialogue, novels, Wikipedia, scientific journals, and news articles. It also has topics covering specialised technical vocabulary. 

See if any pique your interest. You can browse the high-resource directory [here](https://archive.org/download/english-portuguese-statmt) and the low-resource directory [here](https://archive.org/download/bible_alignments_v2) while the installer is running. I've been doing this by myself so far. I would love it if you had anything to contribute.

```
english-armenian-topics_agriculture-ord3-gtrans-2022
english-armenian-topics_bandcamp-ord3-gtrans-2022
english-armenian-topics_botany-ord3-gtrans-2022
english-armenian-topics_business-ord3-gtrans-2022
english-armenian-topics_chemistry-ord3-gtrans-2022
english-armenian-topics_cinema-ord3-gtrans-2022
english-armenian-topics_civil_engineering-ord3-gtrans-2022
english-armenian-topics_compsci-ord3-gtrans-2022
english-armenian-topics_computational_linguistics-ord3-gtrans-2022
english-armenian-topics_cooking-ord3-gtrans-2022
english-armenian-topics_corporate_strategy-ord3-gtrans-2022
english-armenian-topics_cosmology-ord3-gtrans-2022
english-armenian-topics_culture-ord3-gtrans-2022
english-armenian-topics_economics-ord3-gtrans-2022
english-armenian-topics_economist-ord3-gtrans-2022
english-armenian-topics_electrical_engineering-ord3-gtrans-2022
english-armenian-topics_emergency_management-ord3-gtrans-2022
english-armenian-topics_endocrinology-ord3-gtrans-2022
english-armenian-topics_engineering-ord3-gtrans-2022
english-armenian-topics_environment-ord3-gtrans-2022
english-armenian-topics_ethics-ord3-gtrans-2022
english-armenian-topics_exercise-ord3-gtrans-2022
english-armenian-topics_fashion-ord3-gtrans-2022
english-armenian-topics_feminism-ord3-gtrans-2022
english-armenian-topics_finances-ord3-gtrans-2022
english-armenian-topics_game_theory-ord3-gtrans-2022
english-armenian-topics_geology-ord3-gtrans-2022
english-armenian-topics_graphic_design-ord3-gtrans-2022
english-armenian-topics_language_evolution-ord3-gtrans-2022
english-armenian-topics_law-ord3-gtrans-2022
english-armenian-topics_linguistics-ord3-gtrans-2022
english-armenian-topics_linguistics_b-ord3-gtrans-2022
english-armenian-topics_linguistics_c-ord3-gtrans-2022
english-armenian-topics_linguistics_d-ord3-gtrans-2022
english-armenian-topics_linguistics_e-ord3-gtrans-2022
english-armenian-topics_literary_criticism-ord3-gtrans-2022
english-armenian-topics_logistics-ord3-gtrans-2022
english-armenian-topics_machine_learning-ord3-gtrans-2022
english-armenian-topics_marketing-ord3-gtrans-2022
english-armenian-topics_marxism-ord3-gtrans-2022
english-armenian-topics_maths-ord3-gtrans-2022
english-armenian-topics_media_theory-ord3-gtrans-2022
english-armenian-topics_medical-ord3-gtrans-2022
english-armenian-topics_microbiology-ord3-gtrans-2022
english-armenian-topics_military-ord3-gtrans-2022
english-armenian-topics_morphophonology-ord3-gtrans-2022
english-armenian-topics_music-ord3-gtrans-2022
english-armenian-topics_neuroscience-ord3-gtrans-2022
english-armenian-topics_organisation-ord3-gtrans-2022
english-armenian-topics_physics-ord3-gtrans-2022
english-armenian-topics_psychology-ord3-gtrans-2022
english-armenian-topics_religion-ord3-gtrans-2022
english-armenian-topics_sciq-ord3-gtrans-2022
english-armenian-topics_sculpting-ord3-gtrans-2022
english-armenian-topics_semantics_pragmatics-ord3-gtrans-2022
english-armenian-topics_sherlock-ord3-gtrans-2022
english-armenian-topics_short_phrases-ord3-gtrans-2022
english-armenian-topics_study-ord3-gtrans-2022
english-armenian-topics_talpco-ord3-gtrans-2022
english-armenian-topics_teaching-ord3-gtrans-2022
english-armenian-topics_travel-ord3-gtrans-2022
english-armenian-topics_urban-ord3-gtrans-2022
```

Please be careful to weed out any topics you're not interested in. Someone I know was stuck learning about pottery because the pottery dataset is around six times larger than the others.