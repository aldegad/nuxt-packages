import { pipeline, type PipelineType } from "@xenova/transformers";

type SupportedTask =
  | "text-generation"
  | "text2text-generation"
  | "fill-mask"
  | "text-classification"
  | "summarization"
  | "translation"
  | "question-answering";

type TextInput = string;

type QaInput = {
  question: string;
  context: string;
};

type TranslationOptions = {
  src_lang?: string;
  tgt_lang?: string;
};

type GenerationOptions = {
  max_new_tokens?: number;
  temperature?: number;
  top_k?: number;
  top_p?: number;
};

type RunOptions = TranslationOptions &
  GenerationOptions &
  Record<string, unknown>;

const pipelineCache = new Map<string, any>();
const progressByKey = new Map<string, number>();

function getCacheKey(task: SupportedTask, model: string) {
  return `${task}:${model}`;
}

type ProgressEvent = {
  status: string;
  file?: string;
  loaded?: number;
  total?: number;
};

async function getPipeline(
  task: SupportedTask,
  model: string,
  logs: ProgressEvent[],
) {
  const cacheKey = getCacheKey(task, model);
  if (pipelineCache.has(cacheKey)) return pipelineCache.get(cacheKey);
  const pl = await pipeline(task as PipelineType, model, {
    progress_callback: (e: any) => {
      const event: ProgressEvent = {
        status: e.status ?? "progress",
        file: e.file,
        loaded: e.loaded,
        total: e.total,
      };
      logs.push(event);
      // 진행률 계산 및 보관 (메인 스레드에서 폴링)
      if (
        typeof e?.loaded === "number" &&
        typeof e?.total === "number" &&
        e.total > 0
      ) {
        const pct = Math.max(
          0,
          Math.min(99, Math.round((e.loaded / e.total) * 100)),
        );
        progressByKey.set(cacheKey, pct);
      }
    },
  });
  pipelineCache.set(cacheKey, pl);
  // 파이프라인 준비 완료 직후 100%로 설정
  progressByKey.set(cacheKey, 100);
  return pl;
}

export async function runPipeline(
  task: SupportedTask,
  model: string,
  input: TextInput | QaInput,
  options?: RunOptions,
) {
  const logs: ProgressEvent[] = [];
  try {
    const pl = await getPipeline(task, model, logs);

    console.log("input: ", input);
    if (task === "question-answering") {
      const { question, context } = input as QaInput;
      const result = await pl({ question, context }, options ?? {});
      return { ok: true, result, logs } as const;
    }

    const result = await pl(input as TextInput, options ?? {});
    console.log("result: ", result);
    return { ok: true, result, logs } as const;
  } catch (err: any) {
    logs.push({ status: "error", file: undefined });
    return { ok: false, error: err?.message ?? String(err), logs } as const;
  }
}

export async function loadModel(task: SupportedTask, model: string) {
  const logs: ProgressEvent[] = [];
  try {
    const t0 = performance.now?.() ?? Date.now();
    // 진행 시작: 0%로 초기화
    try {
      progressByKey.set(getCacheKey(task, model), 0);
    } catch {}
    const pl = await getPipeline(task, model, logs);
    // try a tiny dry-run for eager loading where possible
    if (task === "fill-mask") {
      await pl("Hello I am a [MASK].");
    }
    const t1 = performance.now?.() ?? Date.now();
    return { ok: true, logs, ms: Math.round(t1 - t0) } as const;
  } catch (err: any) {
    logs.push({ status: "error" });
    // 에러 시 진행률 초기화
    try {
      progressByKey.delete(getCacheKey(task, model));
    } catch {}
    return { ok: false, error: err?.message ?? String(err), logs } as const;
  }
}

export function getLoadProgress(task: SupportedTask, model: string) {
  return progressByKey.get(getCacheKey(task, model)) ?? 0;
}
