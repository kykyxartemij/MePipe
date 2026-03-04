# Free-Text Filtering — Potential Improvements

## Current Implementation

All free-text search (`freeText` query param) uses Prisma's `contains` with
`mode: "insensitive"`, which translates to a MongoDB `$regex` — strict
**substring matching** only.

Utilities live in `src/lib/freeText.ts`:

| Function        | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `normalizeText` | Trim, lowercase, cap at 100 chars                      |
| `textFilter`    | Build a Prisma `contains`+`insensitive` filter object  |
| `similarity`    | Bigram Dice coefficient (0..1) between two strings     |
| `isSimilar`     | Boolean check against a threshold (default 0.7)        |

`similarity` / `isSimilar` are **not used in any endpoint** at the moment.
They are kept as building blocks for the improvements below.

---

## Improvement 1 — MongoDB Atlas Search

MongoDB Atlas provides a Lucene-backed **Atlas Search** index with built-in
fuzzy matching. This moves the work to the database and eliminates the need to
over-fetch and rank in JS.

### Setup

1. Create an Atlas Search index on the `Video` collection (field: `title`).
   In the future, add `genres` and other fields as needed.
2. Use `prisma.$runCommandRaw` to issue `$search` aggregation stages.

### Example query

```ts
const results = await prisma.$runCommandRaw({
  aggregate: "Video",
  pipeline: [
    {
      $search: {
        index: "default", // name of your Atlas Search index
        text: {
          query: "irt",
          path: "title",
          fuzzy: { maxEdits: 1 }, // Levenshtein distance
        },
      },
    },
    { $limit: 8 },
    { $project: { title: 1, _id: 0 } },
  ],
  cursor: {},
});
```

### Pros

- Fuzzy matching handled by the DB — no over-fetching.
- Supports autocomplete, compound queries, scoring, highlights.
- Scales well with data growth.

### Cons

- Requires **MongoDB Atlas** (not available on self-hosted Mongo).
- Prisma has no native `$search` support — must use raw commands.
- Extra infrastructure cost / setup.

---

## Improvement 2 — Genre-aware free-text search

Currently `freeText` only searches `title`. In the future it should also
search across genres (and potentially descriptions).

### With Atlas Search

Add `genres` to the search index and use a `compound` query:

```ts
{
  $search: {
    compound: {
      should: [
        { text: { query: "action", path: "title", fuzzy: { maxEdits: 1 } } },
        { text: { query: "action", path: "genres.name", fuzzy: { maxEdits: 1 } } },
      ],
    },
  },
}
```

### Without Atlas Search

Use Prisma `OR` to check `title` and `genres.name`:

```ts
const where = {
  OR: [
    textFilter("title", freeText),
    { genres: { some: textFilter("name", freeText) } },
  ].filter(Boolean),
};
```

---

## Summary

| Approach               | Fuzzy? | Over-fetch? | Infra needed    |
| ---------------------- | ------ | ----------- | --------------- |
| Current (substring)    | No     | No          | Any MongoDB     |
| JS post-filter         | Yes    | Yes (50→8)  | Any MongoDB     |
| Atlas Search           | Yes    | No          | MongoDB Atlas   |
