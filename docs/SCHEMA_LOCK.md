# Schema lock: tasting.schema.json

This repository uses `schema/tasting.schema.json` as the single source of truth for tasting data.

Rule:
- Do not change the schema shape casually.
- Any schema change must be deliberate, explained, and versioned.

When a change is needed:
1) Update `schema/tasting.schema.json`
2) Update `docs/SCHEMA_CHANGELOG.md`
3) Run validation: `npm run validate:tastings`
4) If the change breaks old data, either:
   - migrate the JSON files, or
   - bump the schema version and keep backwards compatibility

Default position:
- Keep the schema stable.
