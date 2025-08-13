<script setup lang="ts">
const POLL_MS = 150;
type Task =
  | "text-generation"
  | "text2text-generation"
  | "fill-mask"
  | "text-classification"
  | "summarization"
  | "translation"
  | "question-answering";

const tasks: Task[] = [
  "text-generation",
  "text2text-generation",
  "fill-mask",
  "text-classification",
  "summarization",
  "translation",
  "question-answering",
];

const defaultModels: Record<Task, string> = {
  "text-generation": "Xenova/distilgpt2",
  "text2text-generation": "Xenova/LaMini-Flan-T5-783M",
  "fill-mask": "Xenova/bert-base-uncased",
  "text-classification":
    "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
  summarization: "Xenova/distilbart-cnn-6-6",
  translation: "Xenova/nllb-200-distilled-600M",
  "question-answering": "Xenova/distilbert-base-cased-distilled-squad",
};

const selectedTask = ref<Task>("text-generation");
const model = ref<string>(defaultModels[selectedTask.value]);

// Translation 언어 선택 상태 및 옵션
type LangOption = { code: string; label: string };
const nllbLangOptions: LangOption[] = [
  { code: "eng_Latn", label: "English" },
  { code: "kor_Hang", label: "Korean" },
  { code: "jpn_Jpan", label: "Japanese" },
  { code: "zho_Hans", label: "Chinese (Simplified)" },
  { code: "fra_Latn", label: "French" },
  { code: "deu_Latn", label: "German" },
  { code: "spa_Latn", label: "Spanish" },
];
const m2mLangOptions: LangOption[] = [
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
];
const translationSrcLang = ref<string>("eng_Latn");
const translationTgtLang = ref<string>("kor_Hang");
const translationLangOptions = computed<LangOption[]>(() => {
  return /m2m100/i.test(model.value) ? m2mLangOptions : nllbLangOptions;
});
function ensureTranslationLangDefaults() {
  const opts = translationLangOptions.value.map((o) => o.code);
  if (!opts.includes(translationSrcLang.value)) {
    translationSrcLang.value = opts[0] ?? "";
  }
  if (!opts.includes(translationTgtLang.value)) {
    translationTgtLang.value = opts.includes("kor_Hang")
      ? "kor_Hang"
      : opts.includes("ko")
        ? "ko"
        : (opts[1] ?? opts[0] ?? "");
  }
}

const inputText = ref<string>("Hello world");
const qaQuestion = ref<string>("What is my name?");
const qaContext = ref<string>("My name is Sarah and I live in London.");

const loading = ref(false);
const error = ref<string | null>(null);
const output = ref<{
  ok: boolean;
  result?: any;
  error?: string;
  logs?: any[];
} | null>(null);

const modelPresets: Record<Task, string[]> = {
  "text-generation": ["Xenova/distilgpt2", "Xenova/gpt2"],
  "text2text-generation": ["Xenova/LaMini-Flan-T5-783M"],
  "fill-mask": ["Xenova/bert-base-uncased", "Xenova/roberta-base"],
  "text-classification": [
    "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
  ],
  summarization: ["Xenova/distilbart-cnn-6-6"],
  translation: ["Xenova/nllb-200-distilled-600M", "Xenova/m2m100_418M"],
  "question-answering": ["Xenova/distilbert-base-cased-distilled-squad"],
};

watch(
  selectedTask,
  (t) => {
    model.value = modelPresets[t][0] ?? defaultModels[t];
    output.value = null;
    fetchHubModels(t);
    if (t === "translation") ensureTranslationLangDefaults();
  },
  { immediate: true },
);
watch(model, () => {
  if (selectedTask.value === "translation") ensureTranslationLangDefaults();
});

// Hugging Face Hub 인기 모델 목록 가져오기 (태스크 기준)
const hubModels = ref<string[]>([]);
async function fetchHubModels(task: Task) {
  try {
    const res = await $fetch<{ ok: boolean; models: string[]; error?: string }>(
      `/api/models?task=${task}&limit=25`,
    );
    if (res.ok) hubModels.value = res.models;
  } catch {
    // ignore
  }
}
// fetchHubModels는 위의 watch(selectedTask)에서 immediate로 호출

// 모델 로드 상태/액션
const loaded = ref(false);
const loadingModel = ref(false);
const loadInfo = ref<{ ms?: number; logs?: any[]; error?: string } | null>(
  null,
);
watch([selectedTask, model], () => {
  loaded.value = false;
});
const loadProgress = ref(0);
let progressTimer: ReturnType<typeof setInterval> | null = null;
let rafId: number | null = null;
async function handleLoadModel() {
  loadingModel.value = true;
  loadInfo.value = null;
  loaded.value = false;
  try {
    loadProgress.value = 0;
    // 기존 타이머 정리 후 폴링 시작
    if (progressTimer) clearInterval(progressTimer);
    progressTimer = setInterval(async () => {
      try {
        const p = await getLoadProgress(selectedTask.value, model.value);
        const pct = typeof p === "number" ? p : 0;
        const next = Math.max(0, Math.min(99, Math.round(pct)));
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          loadProgress.value = next;
        });
      } catch {
        // ignore
      }
    }, POLL_MS);

    const res: any = await loadModel(selectedTask.value, model.value);
    if (res?.ok) {
      loaded.value = true;
      loadInfo.value = { ms: res.ms, logs: res.logs };
      loadProgress.value = 100;
    } else {
      loadInfo.value = { error: res?.error, logs: res?.logs };
    }
  } catch (e: any) {
    loadInfo.value = { error: e?.message ?? String(e) };
  } finally {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    loadingModel.value = false;
  }
}

onBeforeUnmount(() => {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
});

const genMaxNewTokens = ref(100);
const genTemperature = ref(0.7);
const genTopP = ref(0.9);
const genTopK = ref(50);
const genDoSample = ref(true);
const systemMessage = ref("You are a helpful assistant.");

// Chat mode for text-generation
type ChatRole = "system" | "user" | "assistant";
type ChatMessage = { id: string; role: ChatRole; content: string };
const chatMessages = ref<ChatMessage[]>([]);
const chatInput = ref("");
const chatInputEl = ref<HTMLTextAreaElement | null>(null);
// 스톱 시퀀스: 첫 번째 AI 응답만 남기기 위해 이후 역할 프롬프트가 나오면 잘라냄
const chatStopSequences = ref<string[]>([
  "\nUser:",
  "\nSystem:",
  "\nAssistant:",
]);
const chatReturnFullText = ref(false);

function ensureChatInitialized() {
  if (selectedTask.value !== "text-generation") return;
  // 채팅 UI에는 시스템 메시지를 표시하지 않음 (프롬프트에만 포함)
  if (chatMessages.value.length === 0) chatMessages.value = [];
}

watch(
  selectedTask,
  (t) => {
    if (t === "text-generation") ensureChatInitialized();
  },
  { immediate: true },
);

function buildChatPromptFromMessages(messages: ChatMessage[], sysMsg: string) {
  // OpenAI 스타일과 유사한 간결한 포맷. System을 맨 앞에 두고, 역할 라벨 고정
  const lines: string[] = [];
  if (sysMsg?.trim()) lines.push(`System: ${sysMsg.trim()}`);
  for (const m of messages) {
    if (m.role === "system") continue; // UI에는 없음
    const role = m.role === "user" ? "User" : "Assistant";
    lines.push(`${role}: ${m.content.trim()}`);
  }
  // 다음 응답은 Assistant
  lines.push("Assistant:");
  return lines.join("\n\n");
}

function extractAssistantReply(generated: any, promptText: string) {
  // transformers.js text-generation은 보통 문자열 또는 [{ generated_text }] 형태
  let generatedText = "";
  if (Array.isArray(generated) && generated[0]?.generated_text) {
    generatedText = String(generated[0].generated_text);
  } else if (typeof generated === "string") {
    generatedText = generated;
  } else {
    generatedText = String(generated ?? "");
  }
  // return_full_text=true 인 경우 프롬프트를 포함하므로 잘라냄
  let reply = generatedText.startsWith(promptText)
    ? generatedText.slice(promptText.length)
    : generatedText;
  // 첫 번째 스톱 시퀀스가 나오면 그 이전까지만 취함
  let cutIndex = -1;
  for (const stop of chatStopSequences.value) {
    const idx = reply.indexOf(stop);
    if (idx !== -1) cutIndex = cutIndex === -1 ? idx : Math.min(cutIndex, idx);
  }
  // 추가: "Submissions:" 등 역할처럼 보이는 라벨에서 정지
  if (cutIndex === -1) {
    const roleLike = /\n[A-Za-z][A-Za-z0-9 _-]{0,32}:/g;
    let match: RegExpExecArray | null;
    while ((match = roleLike.exec(reply)) !== null) {
      const idx = match.index;
      cutIndex = cutIndex === -1 ? idx : Math.min(cutIndex, idx);
    }
  }
  if (cutIndex !== -1) reply = reply.slice(0, cutIndex);
  // 맨 앞/뒤 공백 정리
  reply = reply.replace(/^\s+|\s+$/g, "");
  // 너무 빈약하면 한 줄만이라도 유지
  if (!reply) {
    const firstLine = generatedText
      .replace(/^\s+|\s+$/g, "")
      .split(/\r?\n/)
      .find((l) => l.trim().length > 0);
    reply = firstLine ?? "";
  }
  return reply;
}

function resetChat() {
  chatMessages.value = [];
  ensureChatInitialized();
}

async function sendChat() {
  if (!loaded.value) return;
  const text = chatInput.value.trim();
  if (!text) return;
  const idNow = crypto?.randomUUID?.() ?? String(Date.now());
  chatMessages.value.push({ id: idNow, role: "user", content: text });
  chatInput.value = "";

  const promptText = buildChatPromptFromMessages(
    chatMessages.value,
    systemMessage.value,
  );
  loading.value = true;
  error.value = null;
  try {
    const res = await runPipeline("text-generation", model.value, promptText, {
      max_new_tokens: genMaxNewTokens.value,
      temperature: genTemperature.value,
      top_p: genTopP.value,
      top_k: genTopK.value,
      do_sample: genDoSample.value,
      // 반환 텍스트에 프롬프트 포함 여부. 포함 시 우리가 잘라냄
      // @ts-ignore - 옵션 지원 안 해도 무해
      return_full_text: chatReturnFullText.value,
    } as any);
    if (res?.ok) {
      const aiText = extractAssistantReply(res.result, promptText);
      chatMessages.value.push({
        id: crypto?.randomUUID?.() ?? `${idNow}-ai`,
        role: "assistant",
        content: aiText,
      });
      output.value = res; // 우측 로그에 원본도 확인 가능하도록 유지
    } else {
      error.value = res?.error ?? "Unknown error";
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

function goToChatInput() {
  nextTick(() => {
    chatInputEl.value?.focus();
    chatInputEl.value?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

async function run() {
  loading.value = true;
  error.value = null;
  output.value = null;
  try {
    if (selectedTask.value === "question-answering") {
      output.value = await runPipeline(selectedTask.value, model.value, {
        question: qaQuestion.value,
        context: qaContext.value,
      });
    } else if (selectedTask.value === "translation") {
      output.value = await runPipeline(
        selectedTask.value,
        model.value,
        inputText.value,
        {
          src_lang: translationSrcLang.value,
          tgt_lang: translationTgtLang.value,
        },
      );
    } else if (selectedTask.value === "text-generation") {
      // 텍스트 생성은 채팅 UI에서 sendChat로 처리. 여기선 별도 실행 없음
      output.value = {
        ok: true,
        result: "채팅 모드에서 메시지를 보내세요.",
        logs: [],
      } as any;
    } else {
      output.value = await runPipeline(
        selectedTask.value,
        model.value,
        inputText.value,
      );
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

const showCode = ref(false);
const codeSnippet = computed(() => {
  const modelName = model.value || defaultModels[selectedTask.value];
  const task = selectedTask.value;
  const optionLines: string[] = [];
  if (task === "translation") {
    optionLines.push(`  src_lang: '${translationSrcLang.value}',`);
    optionLines.push(`  tgt_lang: '${translationTgtLang.value}',`);
  }
  if (task === "text-generation") {
    optionLines.push(`  max_new_tokens: ${genMaxNewTokens.value},`);
    optionLines.push(`  temperature: ${genTemperature.value},`);
  }
  const optionsBlock = optionLines.length
    ? `, {\n${optionLines.join("\n")}\n}`
    : "";
  return `import { pipeline } from '@xenova/transformers';\n\nconst pipe = await pipeline('${task}', '${modelName}');\nconst out = await pipe(${task === "question-answering" ? "{ question, context }" : "input"}${optionsBlock});\nconsole.log(out);`;
});
</script>

<template>
  <div class="mx-auto max-w-5xl p-4 md:p-6 space-y-4">
    <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">
      Transformers.js 플레이그라운드
    </h1>

    <section
      class="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <label class="flex flex-col gap-1">
        <span
          class="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >태스크</span
        >
        <select
          v-model="selectedTask"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option v-for="t in tasks" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>

      <label class="flex flex-col gap-1">
        <span
          class="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >모델</span
        >
        <select
          v-model="model"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option
            v-for="m in [...modelPresets[selectedTask], ...hubModels]"
            :key="m"
            :value="m"
          >
            {{ m }}
          </option>
        </select>
      </label>

      <template v-if="selectedTask === 'translation'">
        <label class="flex flex-col gap-1">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >Source</span
          >
          <select
            v-model="translationSrcLang"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option
              v-for="opt in translationLangOptions"
              :key="opt.code"
              :value="opt.code"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >Target</span
          >
          <select
            v-model="translationTgtLang"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option
              v-for="opt in translationLangOptions"
              :key="opt.code"
              :value="opt.code"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>
      </template>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <div class="space-y-4">
        <section
          v-if="
            selectedTask !== 'question-answering' &&
            selectedTask !== 'text-generation'
          "
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <label
            :class="{ 'opacity-60 pointer-events-none': !loaded }"
            class="flex flex-col gap-1"
          >
            <span
              class="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >입력</span
            >
            <textarea
              v-model="inputText"
              :disabled="!loaded"
              rows="6"
              class="min-h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
            />
          </label>
        </section>

        <!-- Chat UI for text-generation -->
        <section
          v-if="selectedTask === 'text-generation'"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
        >
          <h3 class="font-bold text-slate-900">Chat</h3>
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <button
              class="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
              :disabled="!loaded || loading"
              @click="resetChat"
            >
              초기화
            </button>
            <span class="ml-auto">첫 번째 AI 응답까지만 생성</span>
          </div>
          <div class="space-y-2 max-h-[360px] overflow-auto pr-1">
            <div v-for="m in chatMessages" :key="m.id" class="flex gap-2">
              <div
                class="min-w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right"
              >
                {{ m.role }}
              </div>
              <div
                class="whitespace-pre-wrap break-words text-sm text-slate-900"
              >
                {{ m.content }}
              </div>
            </div>
            <p v-if="chatMessages.length === 0" class="text-sm text-slate-500">
              아직 메시지가 없습니다. 아래 입력창에 유저 메시지를 작성해
              보내세요.
            </p>
          </div>
          <div class="flex items-end gap-2">
            <textarea
              v-model="chatInput"
              :disabled="!loaded || loading"
              rows="3"
              placeholder="메시지를 입력하세요..."
              class="min-h-20 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
              ref="chatInputEl"
            />
            <button
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              :disabled="loading || !loaded || !chatInput.trim()"
              @click="sendChat"
            >
              보내기
            </button>
          </div>
        </section>

        <section
          v-else
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
        >
          <label
            :class="{ 'opacity-60 pointer-events-none': !loaded }"
            class="flex flex-col gap-1"
          >
            <span
              class="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >질문</span
            >
            <input
              v-model="qaQuestion"
              :disabled="!loaded"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
            />
          </label>
          <label
            :class="{ 'opacity-60 pointer-events-none': !loaded }"
            class="flex flex-col gap-1"
          >
            <span
              class="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >문맥</span
            >
            <textarea
              v-model="qaContext"
              :disabled="!loaded"
              rows="4"
              class="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
            />
          </label>
        </section>
      </div>

      <section
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h3 class="mb-2 font-bold text-slate-900">결과</h3>
        <p class="text-sm text-slate-500" v-if="!loaded">
          모델을 먼저 로드하세요.
        </p>
        <p class="text-sm text-slate-500" v-if="loadInfo?.ms">
          로드 완료: {{ loadInfo?.ms }} ms
        </p>
        <p class="text-sm text-red-600" v-if="loadInfo?.error">
          로드 에러: {{ loadInfo?.error }}
        </p>
        <template v-if="output">
          <template v-if="output.ok">
            <pre
              class="whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-900 max-h-[420px] overflow-auto"
              >{{ output.result }}</pre
            >
          </template>
          <template v-else>
            <p class="text-red-600">모델 에러: {{ output.error }}</p>
          </template>
          <details class="mt-2">
            <summary class="cursor-pointer text-slate-700">로그</summary>
            <pre
              class="mt-2 whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-900"
              >{{ output.logs }}</pre
            >
          </details>
        </template>
        <p v-else-if="!loading && !error" class="text-slate-700">
          아직 결과 없음.
        </p>
        <p v-if="error" class="text-red-600">{{ error }}</p>
      </section>
    </section>

    <section
      v-if="selectedTask === 'text-generation'"
      class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h3 class="mb-2 font-bold text-slate-900">Text Generation Settings</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-3">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >Temperature: {{ genTemperature.toFixed(2) }}</span
            >
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              v-model.number="genTemperature"
              :disabled="!loaded"
              class="w-40 accent-blue-600 disabled:opacity-50"
            />
          </div>
          <p class="text-xs text-slate-500">낮을수록 보수적, 높을수록 창의적</p>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-3">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >Max Tokens: {{ genMaxNewTokens }}</span
            >
            <input
              type="range"
              min="1"
              max="512"
              step="1"
              v-model.number="genMaxNewTokens"
              :disabled="!loaded"
              class="w-40 accent-blue-600 disabled:opacity-50"
            />
          </div>
          <p class="text-xs text-slate-500">응답에서 생성할 최대 토큰 수</p>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-3">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >Top-p: {{ genTopP.toFixed(2) }}</span
            >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              v-model.number="genTopP"
              :disabled="!loaded"
              class="w-40 accent-blue-600 disabled:opacity-50"
            />
          </div>
          <p class="text-xs text-slate-500">누적 확률 컷오프</p>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-3">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >Top-k: {{ genTopK }}</span
            >
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              v-model.number="genTopK"
              :disabled="!loaded"
              class="w-40 accent-blue-600 disabled:opacity-50"
            />
          </div>
          <p class="text-xs text-slate-500">가능성 높은 k개 토큰만 고려</p>
        </div>
        <div class="space-y-1">
          <label class="inline-flex items-center gap-2">
            <input
              type="checkbox"
              v-model="genDoSample"
              :disabled="!loaded"
              class="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <span class="text-sm text-slate-700">Do Sample</span>
          </label>
          <p class="text-xs text-slate-500">샘플링 기반 생성 사용</p>
        </div>
        <div class="space-y-1">
          <label class="flex flex-col gap-1">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >System Message</span
            >
            <input
              type="text"
              v-model="systemMessage"
              :disabled="!loaded"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
            />
          </label>
        </div>
      </div>
    </section>

    <div class="flex items-center justify-end gap-3">
      <button
        class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
        :disabled="loadingModel"
        @click="handleLoadModel"
      >
        {{
          loadingModel
            ? `로딩 중... ${loadProgress}%`
            : loaded
              ? "모델 재로딩"
              : "모델 로드"
        }}
      </button>
      <button
        v-if="selectedTask !== 'text-generation'"
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400 disabled:text-white disabled:cursor-not-allowed"
        :disabled="loading || !loaded"
        @click="run"
      >
        {{ loading ? "실행 중..." : "실행" }}
      </button>
      <button
        class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
        @click="showCode = !showCode"
      >
        {{ showCode ? "코드 숨기기" : "코드 보기" }}
      </button>
    </div>

    <div v-if="loadingModel" class="mt-1">
      <div class="h-2 w-full rounded bg-slate-200 overflow-hidden">
        <div
          class="h-2 bg-blue-600 transition-all"
          :style="{ width: `${loadProgress}%` }"
        />
      </div>
      <p class="mt-1 text-xs text-slate-600">다운로드 {{ loadProgress }}%</p>
    </div>

    <section
      class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      v-if="showCode"
    >
      <h3 class="mb-2 font-bold text-slate-900">코드</h3>
      <pre
        class="whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-900"
        >{{ codeSnippet }}</pre
      >
      <p class="mt-2 text-sm text-slate-600">
        참고: Transformers.js는 브라우저 내에서 모델을 실행합니다. 관련 데모는
        <a
          href="https://huggingface.co/spaces/Vokturz/transformers-js-playground"
          target="_blank"
          rel="noreferrer"
          class="text-blue-600 hover:underline"
          >Transformers.js Playground</a
        >
      </p>
    </section>
  </div>
</template>
