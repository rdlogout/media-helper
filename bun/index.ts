import { serve } from 'bun';
serve({
  port: 8080,
  fetch(req) {
    return new Response('Hello from Bun!');
  },
});
console.log('Listening on http://localhost:8080');
