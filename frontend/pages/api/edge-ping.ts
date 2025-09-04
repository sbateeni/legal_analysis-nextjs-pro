export const config = {
  runtime: 'edge',
};

export default function handler() {
  const body = JSON.stringify({ ok: true, message: 'edge-alive', ts: Date.now() });
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}


