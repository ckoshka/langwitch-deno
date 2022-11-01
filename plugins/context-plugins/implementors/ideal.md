prototyping:

- intercepting and compositionally modifying at different stages
- sorta just pushing a new layer to a cyclic stack.
- we could have the io state typed with a generic indicating what stage it's at.
- or that could be inferred by some record field annotation
- and then the final program is just taking all of these labelled add-ons and ordering them in some way.
- we want this to be hierarchically stackable in some sense, i.e the part has the same behaviour as the whole

```ts
export default (state) => {
};
```
