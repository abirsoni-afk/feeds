# Advance Search — API Integration Guide

This document lists every external API used by the "Advance Search" widget (product search → spec questions → curated seller results), with exact endpoints, parameters, and sample request/response payloads, so another developer/project can re-implement the flow.

**⚠️ Verification note:** None of these endpoints were directly called/tested by the assistant that wrote this integration — the cloud sandbox and dev shell both had outbound access to `suggest.imimg.com`, `apps.imimg.com`, and `buyer.indiamart.com` blocked by an org proxy allowlist. Every endpoint, parameter, and response shape below is taken from curl commands and real sample responses supplied by the product owner, and was validated only via their own browser (`localhost` dev server) testing. Treat this as a faithful transcription of what was given and tested by the PM, not as independently verified API behavior.

---

## Flow overview

1. User types a product/service name → **Suggester API** returns autocomplete labels.
2. User picks a name (or types one) and hits Search → **Mcat Resolution API** turns the free-text query into an `mcatid`/`catid`.
3. **ISQ Specs API** fetches the specification questions for that `mcatid`, rendered as pills/quantity input.
4. User answers specs and clicks "Find Best Match" → **Job Creation API** submits the requirement.
5. Client polls **Job Status API** on a 5s/10s/20s/20s… schedule until `completed: true`, then renders the seller cards from `result.final_ranked_sellers`.

---

## 1. Suggester API (product-name autocomplete)

- **Method / URL:** `GET https://suggest.imimg.com/suggest/suggester.php`
- **Trigger:** debounced 250ms after each keystroke in the product-name field; in-flight requests are aborted on new input.

### Query parameters

| Param | Example | Notes |
|---|---|---|
| `q` | `mango` | the typed term |
| `mcatid` | `0` | fixed |
| `catid` | `0` | fixed |
| `fields` | `type_data,sort_order` | fixed |
| `match` | `fuzzy` | fixed |
| `display_fields` | `label` | fixed |
| `tag` | `suggestions` | fixed |
| `limit` | `40` | fixed |
| `type` | `product` | fixed |
| `v` | `412` | fixed cache-buster/version param |

### Sample request

```
GET https://suggest.imimg.com/suggest/suggester.php?q=mango&mcatid=0&catid=0&fields=type_data,sort_order&match=fuzzy&display_fields=label&tag=suggestions&limit=40&type=product&v=412
```

### Response

Response may be raw JSON or JSONP wrapped in a `callback(...)` call. Client unwraps JSONP if present, then looks for labels under any of: `suggestions[]`, `data[]`, `results[]`, `items[]`, `products[]`; each item's label may be under `label`, `value`, `text`, `name`, or `type_data`.

```json
{
  "suggestions": [
    { "label": "Mango" },
    { "label": "Mango Pulp" },
    { "label": "Mango Powder" }
  ]
}
```

Client extracts a flat `string[]` of labels for the dropdown.

---

## 2. Mcat Resolution API (product name → category id)

- **Method / URL:** `GET https://apps.imimg.com/models/mcatid-suggestion.php`
- **Trigger:** once, when the user hits Search, using the final query text.

### Query parameters

| Param | Example | Notes |
|---|---|---|
| `search_param` | `mango` | URL-encoded query text |
| `modid` | `MY` | fixed |

### Sample request

```
GET https://apps.imimg.com/models/mcatid-suggestion.php?search_param=mango&modid=MY
```

### Sample response

```json
{
  "mcatid": "105916",
  "catid": "171",
  "type": "P"
}
```

If the response is missing/empty/errors, the client treats it as "not found" (`null`) and the flow stops with an error state — no specs are fetched.

---

## 3. ISQ (Item Specific Questions) Specs API

- **Method / URL:** `GET https://apps.imimg.com/index.php?r=Newreqform/GetIsq`
- **Trigger:** once, immediately after a successful mcat resolution.

### Query parameters

| Param | Example | Notes |
|---|---|---|
| `modid` | `MY` | fixed |
| `mcatid` | `105916` | from step 2 |
| `cat_type` | `3` | fixed |
| `flag` | `1` | fixed |
| `isq_format` | `1` | fixed |
| `generic_flag` | `1` | fixed |
| `country_iso` | `IN` | fixed |

### Sample request

```
GET https://apps.imimg.com/index.php?r=Newreqform/GetIsq&modid=MY&mcatid=105916&cat_type=3&flag=1&isq_format=1&generic_flag=1&country_iso=IN
```

### Response shape

```json
{
  "CODE": "200",
  "STATUS": "1",
  "MESSAGE": "SUCCESS",
  "DATA": [
    {
      "IM_SPEC_MASTER_ID": "1023",
      "IM_SPEC_MASTER_DESC": "Variety",
      "IM_SPEC_MASTER_TYPE": "1",
      "IM_SPEC_OPTIONS_ID": "501##502##503",
      "IM_SPEC_OPTIONS_DESC": "Alphonso##Kesar##Totapuri"
    },
    {
      "IM_SPEC_MASTER_ID": "1024",
      "IM_SPEC_MASTER_DESC": "Packaging Type",
      "IM_SPEC_MASTER_TYPE": "1",
      "IM_SPEC_OPTIONS_ID": "601",
      "IM_SPEC_OPTIONS_DESC": "None"
    }
  ]
}
```

Notes:
- `DATA` can be a nested array in practice — the client flattens one level.
- `IM_SPEC_OPTIONS_ID` / `IM_SPEC_OPTIONS_DESC` are `##`-delimited parallel lists of option id/label pairs.
- `IM_SPEC_OPTIONS_DESC === "None"` marks a free-text spec (e.g. Quantity/Quantity Unit) with no option pills to render.
- The Quantity Unit spec is auto-selected to its first option by the client; Quantity itself is a digits-only text input (no `-`, no `.`).

---

## 4. Curated Search — Job Creation API

- **Method / URL:** `POST https://buyer.indiamart.com/miscreact/ajaxrequest/buyermy/curatedsellersearch/windmill`
- **Headers:** `Content-Type: application/json`
- **Trigger:** when the user clicks "Find Best Match" (initial search, or later from the results-screen "stale requirement" banner after editing filters).

### Request body (`CuratedSearchPayload`)

| Field | Type | Description |
|---|---|---|
| `offer_id` | string | currently sent empty (`""`) |
| `keyword` | string | the raw search text the user typed |
| `mcat_id` | string | from Mcat Resolution API |
| `mcat_name` | string | no name-resolution endpoint is available downstream, so this is currently sent as the same value as `keyword` |
| `buyer_city_id` | string | currently hardcoded `"1"` |
| `buyer_city` | string | the city text selected in the City dropdown |
| `city_id` | string | currently hardcoded `"70751"` per explicit product requirement |
| `city_match` | string | currently hardcoded `"exact"` |
| `quantity` | string | digits only, from the Quantity input (empty string if not filled) |
| `quantity_unit` | string | selected unit option id/label (empty string if not filled) |
| `specifications` | array of `{ question, answer }` | one entry per spec the user actually selected (unselected specs are omitted) |

### Sample request body

```json
{
  "offer_id": "",
  "keyword": "mango",
  "mcat_id": "105916",
  "mcat_name": "mango",
  "buyer_city_id": "1",
  "buyer_city": "Noida",
  "city_id": "70751",
  "city_match": "exact",
  "quantity": "500",
  "quantity_unit": "Kilograms",
  "specifications": [
    { "question": "Variety", "answer": "Alphonso" },
    { "question": "Packaging Type", "answer": "Carton Box" }
  ]
}
```

### Response

The client parses the response text as JSON and extracts a job id, checking (recursively) the keys `job_id`, `jobId`, `job`, `id`, `data` — or accepts a bare string. Example:

```json
{ "job_id": "wm_8f2c1a9e" }
```

If no job id can be extracted, or the HTTP call fails, the flow moves to an error state ("Couldn't fetch matching sellers right now — please try again.").

---

## 5. Curated Search — Job Status (Polling) API

- **Method / URL:** `POST https://buyer.indiamart.com/miscreact/ajaxrequest/buyermy/curatedsellersearch/windmill/status`
- **Headers:** `Content-Type: application/json`
- **Request body:** `{ "job_id": "<job id from step 4>" }`

### Polling schedule

Poll delays are **not fixed-interval** — they back off: `5s → 10s → 20s → 20s → 20s ...` up to a maximum of 10 attempts total. After each response:

- If `completed === true` → stop polling immediately and render whatever seller data is present (even if empty).
- Else if a non-empty seller array can already be extracted → stop polling and render it.
- Else if the response signals failure (`success: false`, or a `status`/`job_status`/`state` string of `failed`/`error`/`cancelled`) → stop polling, show error state.
- Otherwise → keep polling on the schedule above.

The UI progress bar is driven by real elapsed polling time (capped at 94% until actual completion, then jumps to 100%) — it is not a fixed-duration fake animation.

### Sample response (real, observed)

```json
{
  "completed": true,
  "success": true,
  "result": {
    "final_ranked_sellers": [
      {
        "rank": 1,
        "glusrid": "1234567",
        "companyname": "ABC Fruit Exports Pvt Ltd",
        "image": "https://5.imimg.com/data5/SELLER/Default/2023/1/AB/CD/EF/1234567/product-500x500.jpg",
        "city": "Lucknow",
        "cityid": "1102",
        "memberSince": "2020-03-15",
        "gst_verified": true,
        "trustseal": true,
        "CustTypeWt": 220,
        "supplier_rating": 4.5,
        "rating_count": 132,
        "price_formatted": "₹ 85/ Kg",
        "final_rank": 1,
        "final_score": 0.94
      },
      {
        "rank": 2,
        "glusrid": "7654321",
        "companyname": "Sunrise Agro Traders",
        "image": "https://5.imimg.com/data5/SELLER/Default/2022/8/XY/ZZ/QQ/7654321/product-500x500.jpg",
        "city": "Varanasi",
        "cityid": "1108",
        "memberSince": "9 yrs",
        "gst_verified": "1",
        "trustseal": false,
        "CustTypeWt": "150",
        "supplier_rating": null,
        "rating_count": null,
        "price_formatted": "₹ 78/ Kg",
        "final_rank": 2,
        "final_score": 0.88
      }
    ]
  }
}
```

**Important:** the seller array is nested at `result.final_ranked_sellers` in real responses, not at a top-level key. The client's seller-array extractor checks, in order, and recurses one level into nested objects: `final_ranked_sellers` → `ranked_sellers` (a pre-final fallback seen in some responses) → `data` → `result` → `results` → `sellers` → `cards` → `items`.

### Field types are inconsistent across sellers in the same response — handle defensively

| Field | Observed types |
|---|---|
| `CustTypeWt` | `number` or numeric `string` |
| `gst_verified` | `boolean`, `"1"`/`"0"`, or similar |
| `supplier_rating` / `rating` | `number` or `null` |
| `rating_count` | `number`, numeric `string`, or `null` |
| `memberSince` | ISO date string (`"2020-03-15"`), duration string (`"9 yrs"` / `"1 yr"`), `null`, or `""` |

Cards are ordered by `rank` (fallback `final_rank`, then `rank_position`).

### Field → UI mapping used for seller cards

| UI element | Source field | Notes |
|---|---|---|
| Product photo | `image` | square, white background, `object-contain` (not cropped) |
| Company name | `companyname` | |
| "Member since …" | `memberSince` | parse duration strings (`/\byrs?\b/i`) as-is; else parse as date → "Member since YYYY"; hide if null/empty |
| City | `city` | shown with a map-pin icon |
| GST verified tick | `gst_verified` | truthy → show tick |
| TrustSEAL-eligible badge | `CustTypeWt` | eligible if `Number(CustTypeWt) >= 199` |
| "Payment Protected" line | `trustseal` | boolean; shown only if `true` |
| Rating | `supplier_rating` (fallback `rating`) + `rating_count` | rendered as `4.5 (132)`; omitted if rating is null |
| Price | `price_formatted` | shown as-is (already formatted string) |
| "Best Overall" badge | `rank === 1` (or `final_rank === 1`) | |

---

## Client-side behavior notes worth carrying over

- **Filters on the results screen are editable** (dropdowns to change/add specs), but changing a filter does **not** auto-trigger a new search. A "stale requirement" banner appears instead: *"Requirement updated. Click Find Best Match to see recommended sellers"*, with a button that re-runs steps 4–5 with the updated selections.
- The Quantity/Quantity-Unit filter is hidden entirely on the results screen if it wasn't filled in during the original search.
- The loading-screen mini scene only ever shows the specs the user actually selected (plain values, no field-name prefix) — never unselected/blank specs.
