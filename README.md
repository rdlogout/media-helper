```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

API

GET `/` query parameters:

- `url` or `img`: source image URL
- `width`, `height`, or `size`: target dimensions
- `format`: `webp` | `jpeg` | `png` (default `webp`)
- `compressionFactor`: number in [0,1], default `0.8`
- `qualityThreshold`: number in [0,1], default `0.8`

POST `/` form fields:

- `file`: image file
- `width`, `height`
- `format`, `compressionFactor`, `qualityThreshold`

Examples

```txt
# Resize to 400x400, webp, balanced size/quality
curl "http://localhost:8787/?url=https://example.com/image.jpg&width=400&height=400&format=webp&compressionFactor=0.8&qualityThreshold=0.8" -o out.webp

# High quality JPEG
curl "http://localhost:8787/?url=https://example.com/image.png&width=800&format=jpeg&compressionFactor=0.9&qualityThreshold=0.95" -o out.jpg
```

Caching

- Cache key includes source `ETag`/`Last-Modified` plus transformation params
- `Cache-Control`: `public, max-age=604800, stale-while-revalidate=86400`
- Resized images larger than ~5MB are not cached

Best Practices

- Prefer `webp` for minimal size unless strict fidelity is required
- Use `compressionFactor=0.7–0.85` for thumbnails; increase for detailed images
- Raise `qualityThreshold` for photographic content with fine gradients
