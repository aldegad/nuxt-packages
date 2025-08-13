import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const task = String(query.task || "text-generation");
  const limit = Number(query.limit || 25);
  const onlyXenova =
    String((query as any).onlyXenova ?? "true").toLowerCase() === "true";

  // const url = `https://huggingface.co/api/models?pipeline_tag=${encodeURIComponent(task)}&sort=downloads&direction=-1&limit=${limit}`;
  const url = `https://huggingface.co/api/models?filter=${encodeURIComponent(task)}&filter=onnx&sort=downloads&limit=${limit}`;

  try {
    const data: any = await $fetch(url, {
      headers: { Accept: "application/json" },
    });
    // Normalize to list of model ids
    let models: string[] = Array.isArray(data)
      ? data
          .map((m: any) => m?.modelId || m?.id || m?.name)
          .filter((x: any) => typeof x === "string")
      : [];
    if (onlyXenova) {
      models = models.filter((id) => id.startsWith("Xenova/"));
    }
    return { ok: true, models };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e), models: [] };
  }
});
