interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM history ORDER BY upload_time DESC'
  ).all();
  return Response.json(results || []);
};

export const onRequestDelete: PagesFunction<Env> = async ({ env }) => {
  await env.DB.prepare('DELETE FROM history').run();
  return Response.json({ status: 'ok' });
};
