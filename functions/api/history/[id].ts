interface Env {
  DB: D1Database;
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = String(params.id);
  const result = await env.DB.prepare(
    'DELETE FROM history WHERE id = ?'
  ).bind(id).run();
  const changed = result.meta?.changes || 0;
  return Response.json({ status: changed > 0 ? 'ok' : 'not_found' });
};
