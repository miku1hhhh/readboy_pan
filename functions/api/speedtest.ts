export const onRequestPost: PagesFunction = async ({ request }) => {
  // 直接消费 body 获取字节数（Workers 会自动丢弃 body）
  const buf = await request.arrayBuffer();
  return Response.json({ received: buf.byteLength });
};
