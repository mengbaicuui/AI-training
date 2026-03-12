// 数据工程 — RAG 数据工程基础
// 内容综合自 "Hands-On RAG for Production" 及工作坊设计 PDF

export const dataEngSections = [
  { id: 'parsing', icon: '📑', title: '文档解析策略' },
  { id: 'tables', icon: '📊', title: '表格与图像处理' },
  { id: 'chunking', icon: '✂️', title: '分块策略' },
  { id: 'embedding', icon: '🧮', title: 'Embedding 选型' },
  { id: 'vectordb', icon: '🗄️', title: '向量数据库选型' },
  { id: 'freshness', icon: '🔄', title: '数据新鲜度' },
];

export const dataEngContent = {
  parsing: {
    title: '文档解析策略',
    content: [
      'RAG 数据工程的第一关不是 embedding，而是 **把原始文档解析成可索引、可引用、可回溯的中间表示**。如果解析阶段已经丢了结构，后面的检索、重排和生成都很难补救。',
      '企业文档往往不是干净文本，而是复杂 PDF：嵌套表格、电路图、扫描件、多级目录、页眉页脚、跨页表格。数据工程的核心问题是：**抽什么、保留什么、丢什么、如何记录来源**。',
      '对于**大型 PDF**，更稳妥的做法通常不是一次性整本解析，而是**先拆分、再解析**。这样做的好处是：单次请求更稳定，失败更容易重试，也更方便并行处理。',
      '拆分时不要只关注“切开了没有”，更重要的是**保留原始页码、来源文件、章节范围**等信息。后面无论是做 citation、定位原文，还是把多个子文件结果重新拼回去，都依赖这些元数据。',
      '课程里的推荐路径是：大文件先按页数或逻辑章节拆分；能直接抽文本就不要先 OCR；遇到复杂版面、扫描件、表格和图像时，再使用 MinerU 或 PaddleOCR-VL 这类结构化解析工具。'
    ],
    concepts: [
      { term: 'Parse', desc: '把原始 PDF / DOCX / HTML 转成 Markdown / JSON / content blocks，为后续 chunking 与 indexing 提供输入。' },
      { term: 'Structural fidelity', desc: '解析结果是否保住标题层级、表格结构、图片说明、页码与引用来源。' },
      { term: 'Intermediate representation', desc: '数据工程里最重要的不是“直接喂向量库”，而是先形成稳定、可调试、可回放的中间表示。' },
    ],
    toolComparison: {
      title: '工具对比',
      columns: ['工具', '适合场景', '优势', '局限'],
      rows: [
        ['PyMuPDF', '原生文本 PDF', '速度快、依赖轻、适合 baseline', '遇到扫描件、复杂表格、图像版面容易失真'],
        ['MinerU API', '复杂企业 PDF / 结构化输出', '直接返回 Markdown / 结构化结果，落地快', '依赖外部 API，超大文件/网络稳定性要考虑'],
        ['PaddleOCR-VL', '本地离线、多模态文档', '适合扫描件、图文混排、表格和复杂版面', '环境较重，解析速度和资源占用更高'],
        ['python-docx / HTML parser', 'Office / HTML 等专有格式', '对格式专用支持更稳定', '跨格式统一表示需要自己做一层抽象'],
      ],
    },
    extensions: [
      {
        question: '如果同一份 PDF 既包含机器可提取文本，又包含扫描页，是否要走“混合解析”而不是统一 OCR？',
        approach: '先判断问题的本质：你要优化的是质量、速度，还是成本。通常可以按页或按区域分流：可直接抽文本的部分走轻量抽取，扫描页或复杂版面再走 OCR / VLM。这样能减少不必要的 OCR 开销，同时保住结构质量。'
      },
      {
        question: '解析结果应该直接存 chunk，还是先存 page/block 级 JSON 再做后处理？',
        approach: '先看你后续是否需要调试、回放和反复改 chunk 规则。若直接存 chunk，链路最短；若先存 page/block 级 JSON，中间表示更稳定，后续更容易重切分、重组装和做解析质量回归。生产里通常更推荐保留中间层。'
      },
      {
        question: '当解析工具升级后，如何做 regression test，确认没有把结构化信息解析坏？',
        approach: '不要只看“能不能跑通”，而要挑一批代表性文档做对比：标题层级有没有变，表格结构有没有断，页码和来源有没有丢，关键字段抽取是否一致。把这些检查做成固定样本集，升级后自动回归。'
      },
    ],
  },

  tables: {
    title: '表格与图像处理',
    content: [
      '那么，在 RAG 中如何正确处理表格和图像呢？关键点是：**不要把它们简单当成普通文本**。表格真正有价值的不只是单元格里的字，而是行列关系、表头语义、单位和字段之间的绑定关系；图像和图表也往往承载着正文里没有写清楚的信息。',
      '对于表格，第一步应尽可能保留结构信息，例如把表格导出为带元数据的 JSON 或 Markdown。早期做法通常是在导入阶段把整张表送给 LLM，先生成一个摘要，再把这个摘要当普通文本送进 RAG。这个方法实现简单，但问题也很明显：**摘要永远不可能等价于原始表格**，细节总会丢失。',
      '更好的方式是：**把表格和它的摘要作为两类对象一起存储**。查询时先让摘要参与检索；如果摘要显示这张表与当前问题相关，再把完整原表提供给 LLM，让模型能访问具体单元格，而不是只依赖摘要中的少量信息。',
      '对于图像或图表，一种常见做法是在摄取阶段调用 CV 或 VLM 模型，为图像生成尽可能详细的描述，再把这段描述作为文本送入 RAG。进一步的做法是使用**多模态 embedding**，让文本查询能够直接检索图像，反之亦然。'
    ],
    concepts: [
      { term: 'Table fidelity', desc: '表格的语义来自单元格之间的关系，而不只是单元格文字本身。' },
      { term: 'Captioning', desc: '把图像、示意图、截图转成描述文本，是让图像进入 RAG 检索域的最基本方法。' },
      { term: 'Object typing', desc: '表格、正文、图像不应混成同一类 chunk，最好保留 object_type 便于检索路由。' },
    ],
    toolComparison: {
      title: '表格 / 图像处理路线对比',
      columns: ['路线', '优点', '缺点', '适合'],
      rows: [
        ['Markdown 表格导出', 'LLM 易读、工程最简单', '超大表格 token 很高', '参数表、规格表、制度类表格'],
        ['摘要 + 原表双存', '兼顾召回与细节', '索引逻辑更复杂', '超大表格、明细表'],
        ['图像描述文本化', '易接入现有文本 RAG', '丢掉部分空间布局信息', '示意图、界面截图、设备图'],
        ['图文联合检索', '跨模态能力更强', '实现复杂、评估难', '电路图、视觉文档、多模态问答'],
      ],
    },
    extensions: [
      {
        question: '对于超大表格，你会选择“整表一个 chunk”还是“按行 / 按区域切分 + 表头继承”？',
        approach: '先看查询粒度。如果用户问的是整表趋势、概览，整表或摘要更合适；如果经常要落到具体单元格，通常要按区域或按行切分，并把表头继承下来，避免单元格失去语义上下文。'
      },
      {
        question: '图像应该在 ingestion 时先生成 caption，还是查询时按需调用 VLM？',
        approach: '这是“预处理换时延”还是“按需调用换成本”的权衡。高频用、结构相对稳定的图像适合在 ingestion 时先做 caption；低频或极复杂图像可以查询时再调 VLM，但要接受更高延时。'
      },
      {
        question: '同一个问题若既可能命中文本又可能命中图像，检索路由应该如何设计？',
        approach: '先拆成两个判断：这是不是明显的视觉问题；如果不是，先走文本和摘要路，再根据命中结果决定是否补图像检索。不要默认所有 query 都走最重的图文联合链路。'
      },
    ],
  },

  chunking: {
    title: '分块策略',
    content: [
      '为什么在今天大模型 context window 已经很大的情况下，我们还要讨论 chunking？因为 **大上下文并没有消灭检索问题，它只是抬高了你一次能塞进去的上限**。真正的问题仍然是：哪些内容该一起出现，哪些内容不该混在一起。',
      'Chunking 仍然重要，主要有两个原因。第一是 **context limit**：就算模型能接收很长上下文，成本、延迟和 token 预算依然有限，不可能把整个知识库直接塞进去。第二是 **signal-to-noise**：即使能塞得下，噪声太多也会让模型更难定位真正有用的证据。',
      '所以，chunking 的本质不是“把文档切小”，而是做 **检索单元设计**。你要决定：什么粒度最适合 embedding，什么粒度最适合 rerank，什么粒度最适合最终交给 LLM 回答。'
    ],
    concepts: [
      { term: 'Context limit', desc: '上下文窗口变大了，但成本、延迟和可读性约束依然存在，不能因此放弃切分。' },
      { term: 'Signal-to-noise', desc: '切分得好，检索回来的内容更集中；切分得差，模型会在噪声里找答案。' },
      { term: 'Atomicity', desc: '一个 chunk 应该对应一个相对完整的知识单元，而不是半句话或一整章。' },
      { term: 'Metadata-rich chunk', desc: 'source / page / heading / object_type / tags 等 metadata 决定了后续能否做过滤、引用和 routing。' },
    ],
    toolComparison: {
      title: 'Chunking 方法对比',
      columns: ['方法', '核心思路', '优点', '局限'],
      rows: [
        ['Character', '按固定字符数切', '最简单、最快速、适合 baseline', '容易切坏语义边界'],
        ['Recursive Character', '按分隔符逐层回退切分', '比固定长度更自然', '仍然不理解语义'],
        ['Document Specific', '按文档结构切，如标题/章节/页面', '最贴近原文结构', '依赖解析质量'],
        ['Semantic Splitting', '按语义转折或相似度变化切', 'chunk 更像知识单元', '实现和成本更复杂'],
        ['Agentic Splitting', '让模型或规则动态决定切分边界', '对复杂文档更灵活', '最贵，也最难稳定'],
        ['Indexing Bonus', '切分时就为后续索引设计 parent-child / summary', '对检索和生成都更友好', '需要更完整的管线设计'],
      ],
    },
    codeExamples: [
      {
        title: 'Level 1: Character',
        description: '最基础的 baseline。按固定字符数切分，适合快速搭系统，但很容易切坏句子和段落边界。',
        outputSummary: '**输出示例：**\n原文：`故障现象：发动机启动困难，冷车抖动明显，仪表盘报码 P0301。`\n切分后：[`故障现象：发动机启动困难，冷车抖动明`, `显，仪表盘报码 P0301。`]',
        code: `from langchain_text_splitters import CharacterTextSplitter

text = "故障现象：发动机启动困难，冷车抖动明显，仪表盘报码 P0301。"

splitter = CharacterTextSplitter(
    separator="",
    chunk_size=18,
    chunk_overlap=0,
)

chunks = splitter.split_text(text)
print(chunks)
# ['故障现象：发动机启动困难，冷车抖动明', '显，仪表盘报码 P0301。']`,
      },
      {
        title: 'Level 2: Recursive Character',
        description: 'LangChain 里最常见的默认选择。优先按段落、换行、空格等边界切，切不开时再回退到更细粒度。',
        outputSummary: '**输出示例：**\n原文：`故障现象：发动机启动困难。诊断建议：先检查火花塞，再检查点火线圈。`\n切分后：[`故障现象：发动机启动困难`, `。诊断建议：先检查火花塞，再检查点火线圈`, `。`]',
        code: `from langchain_text_splitters import RecursiveCharacterTextSplitter

text = "故障现象：发动机启动困难。诊断建议：先检查火花塞，再检查点火线圈。"

splitter = RecursiveCharacterTextSplitter(
    separators=["\\n\\n", "\\n", "。", " ", ""],
    chunk_size=20,
    chunk_overlap=0,
)

chunks = splitter.split_text(text)
print(chunks)
# ['故障现象：发动机启动困难', '。诊断建议：先检查火花塞，再检查点火线圈', '。']`,
      },
      {
        title: 'Level 3: Document Specific',
        description: '对手册、制度、技术文档更常用。先利用标题层级、章节号、页码等结构，再决定切分边界。',
        outputSummary: '**输出示例：**\n原文：`# 故障诊断\\n发动机异响可能来自点火系统。\\n# 维修步骤\\n先断开蓄电池负极，再拆检火花塞。`\n切分后：\n`page_content=\'发动机异响可能来自点火系统。\' metadata={\'heading\': \'故障诊断\'}`\n`page_content=\'先断开蓄电池负极，再拆检火花塞。\' metadata={\'heading\': \'维修步骤\'}`',
        code: `from langchain_text_splitters import MarkdownHeaderTextSplitter

md_text = """# 故障诊断
发动机异响可能来自点火系统。
# 维修步骤
先断开蓄电池负极，再拆检火花塞。"""

headers_to_split_on = [
    ("#", "heading"),
]

markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
md_chunks = markdown_splitter.split_text(md_text)

for chunk in md_chunks:
    print(chunk)
# page_content='发动机异响可能来自点火系统。' metadata={'heading': '故障诊断'}
# page_content='先断开蓄电池负极，再拆检火花塞。' metadata={'heading': '维修步骤'}`,
      },
      {
        title: 'Level 4: Semantic Splitting',
        description: '不是机械地按长度切，而是看语义变化。适合内容跳跃大、用户问题粒度更细的场景。',
        outputSummary: '**输出示例：**\n原文：`先检查火花塞是否积碳。再检查点火线圈是否老化。下面开始介绍机油更换周期。`\n切分后：[`先检查火花塞是否积碳。再检查点火线圈是否老化。`, `下面开始介绍机油更换周期。`]',
        code: `from sentence_transformers import SentenceTransformer
import numpy as np

text = "先检查火花塞是否积碳。再检查点火线圈是否老化。下面开始介绍机油更换周期。"

model = SentenceTransformer("BAAI/bge-m3")
sentences = [s for s in text.split("。") if s.strip()]
embeddings = model.encode(sentences, normalize_embeddings=True)

chunks, buffer = [], [sentences[0]]
for i in range(1, len(sentences)):
    sim = np.dot(embeddings[i - 1], embeddings[i])
    if sim < 0.75:
        chunks.append("。".join(buffer) + "。")
        buffer = [sentences[i]]
    else:
        buffer.append(sentences[i])

if buffer:
    chunks.append("。".join(buffer) + "。")
print(chunks)
# ['先检查火花塞是否积碳。再检查点火线圈是否老化。', '下面开始介绍机油更换周期。']`,
      },
      {
        title: 'Level 5: Agentic Splitting',
        description: '让模型根据文档内容决定“哪里应该成为一个独立知识单元”。适合复杂说明书、案例库、长报告，但成本更高。',
        outputSummary: '**输出示例：**\n原文：`故障现象：发动机抖动。诊断步骤：先读报码，再检查点火系统。维修建议：必要时更换火花塞。`\n切分后：[`故障现象：发动机抖动。`, `诊断步骤：先读报码，再检查点火系统。`, `维修建议：必要时更换火花塞。`]',
        code: `import json

text = "故障现象：发动机抖动。诊断步骤：先读报码，再检查点火系统。维修建议：必要时更换火花塞。"

AGENTIC_SPLIT_PROMPT = """请将下面文档切分成适合 RAG 检索的知识单元。
要求：
1. 每块语义完整
2. 不要把强相关内容拆开
3. 返回 JSON 数组

文档：
{text}
"""

response = llm.invoke(
    AGENTIC_SPLIT_PROMPT.format(text=text)
)

chunks = json.loads(response.content)
print(chunks)
# ['故障现象：发动机抖动。', '诊断步骤：先读报码，再检查点火系统。', '维修建议：必要时更换火花塞。']`,
      },
      {
        title: 'Bonus: Indexing Tactics',
        description: '切分不只是为了产生 chunk，还可以顺手设计 parent-child 索引：检索时用细粒度 child 匹配，召回时返回完整 parent 给 LLM，兼顾精度和上下文。',
        outputSummary: '**输出示例：**\n**Parent 0：** `故障诊断：发动机启动困难，冷车时抖动明显，OBD 报码 P0301（一缸失火）。常见原因包括火花塞积碳、点火线圈老化或燃油压力不足。`\n**Parent 0 的 children：** [`故障诊断：发动机启动困难，冷车时抖动明显`, `OBD 报码 P0301（一缸失火）`, `常见原因包括火花塞积碳、点火线圈老化或燃油压力不足`]\n\n**Parent 1：** `维修步骤：首先断开蓄电池负极，拆下点火线圈插头。然后取出火花塞检查电极间隙，标准值 0.8-1.1mm。间隙超标则更换火花塞，装回后清除故障码并试车验证。`\n**Parent 1 的 children：** [`维修步骤：首先断开蓄电池负极，拆下点火线圈插头`, `然后取出火花塞检查电极间隙，标准值 0.8-1.1mm`, `间隙超标则更换火花塞，装回后清除故障码并试车验证`]',
        code: `from langchain_text_splitters import RecursiveCharacterTextSplitter

text = (
    "故障诊断：发动机启动困难，冷车时抖动明显，"
    "OBD 报码 P0301（一缸失火）。"
    "常见原因包括火花塞积碳、点火线圈老化或燃油压力不足。\\n\\n"
    "维修步骤：首先断开蓄电池负极，拆下点火线圈插头。"
    "然后取出火花塞检查电极间隙，标准值 0.8-1.1mm。"
    "间隙超标则更换火花塞，装回后清除故障码并试车验证。"
)

parent_splitter = RecursiveCharacterTextSplitter(
    separators=["\\n\\n"], chunk_size=100, chunk_overlap=0
)
child_splitter = RecursiveCharacterTextSplitter(
    separators=["。", "，", ""], chunk_size=30, chunk_overlap=0
)

parent_docs = parent_splitter.create_documents([text])

for parent_id, parent in enumerate(parent_docs):
    children = child_splitter.create_documents([parent.page_content])
    for child in children:
        child.metadata["parent_id"] = parent_id
    print(f"Parent {parent_id}:", parent.page_content[:40], "...")
    print(f"  children: {[c.page_content for c in children]}\\n")`,
      },
    ],
    extensions: [
      {
        question: '你的知识库更适合“按结构切”还是“按语义切”？评估标准是什么？',
        approach: '先看文档是否本来就有稳定结构。制度、手册、规范通常适合按标题层级切；内容跳跃、问法多变时再考虑语义切分。评估不要靠感觉，要回到 Recall、nDCG、引用质量和人工抽样。'
      },
      {
        question: '如果一个问题需要跨两个相邻 chunk 才能回答，应该靠 overlap 解决还是靠 rerank/context assembly 解决？',
        approach: '先分清这是“边界问题”还是“上下文组织问题”。如果经常被截断，适量 overlap 是必要的；如果证据本来就分散在多个 chunk，更多应该靠 rerank 和 context assembly，而不是无限增大 overlap。'
      },
      {
        question: 'Chunking 在长 context 模型时代最容易被误解成什么？',
        approach: '最常见的误解是“窗口够大，就不需要切分了”。但实际问题不是塞不塞得下，而是检索精度、噪声控制、成本和引用可追溯。大窗口只是让你有更大的组装空间，不会自动替你完成好的检索单元设计。'
      },
      {
        question: 'chunk 设计应该由解析团队决定，还是由 retrieval/eval 结果反推？',
        approach: '正确做法通常是双向迭代：解析团队先给一个结构合理的初版，检索和评估结果再反推哪里切得太碎、太粗或 metadata 不足。chunk 设计本质上是数据工程和检索质量共同决定的。'
      },
    ],
  },

  embedding: {
    title: 'Embedding 选型',
    content: [
      'Embedding 模型不是“排行榜越高越好”，而是要看它是否适合你的数据、语种、查询类型和部署条件。',
      '在企业知识库里，真正要比的是：**领域召回、延时、成本、多语言、维度、私有化可行性**。同一个模型在 MTEB 上领先，不代表在你的手册、工单、FAQ 和图纸描述上也领先。',
      '课程里更推荐把 embedding 选型看成实验问题：先做 3-4 个候选模型的离线评估，再决定默认模型。'
    ],
    concepts: [
      { term: 'Recall ceiling', desc: 'Embedding 模型决定了第一阶段召回上限，后续 rerank 只能在候选集合内优化。' },
      { term: 'Dimension vs cost', desc: '维度更高通常更细腻，但存储、网络、检索延时和成本也更高。' },
      { term: 'Domain shift', desc: '通用 benchmark 表现好，不代表在汽车维修、保险条款、企业制度上也最好。' },
    ],
    toolComparison: {
      title: 'Embedding 路线对比',
      columns: ['模型/路线', '特点', '适合'],
      rows: [
        ['BGE-M3', '多语言稳定、私有化友好', '中英文混合企业知识库'],
        ['Qwen3-Embedding-8B', '能力强、API 友好', '高质量检索、可接受 API 成本'],
        ['OpenAI Embedding', '集成简单、生态成熟', '快速验证与通用场景'],
        ['Matryoshka embedding', '同模型多维度裁剪', '需要在精度与成本间做细调的系统'],
      ],
    },
    illustration: {
      title: '领域词汇语义区分度对比',
      description: '以保险领域为例，用同一组中英文关键词（保险人/Insurer、投保人/Policyholder、被保险人/Insured 等）测试不同 embedding 模型的语义区分能力。左侧为余弦相似度热力图，右侧为 PCA 降维散点图。**理想模型应该把语义不同的词拉开（低相似度）、语义相近的词聚拢（高相似度）**。这张图能快速暴露模型在你的领域里是否真的"分得清"。\n\n如果发现模型区分度不够，可以按成本从低到高依次尝试：**1)** 在 query 或文档侧加 prompt/instruction prefix，引导模型关注领域语义；**2)** 用领域语料对 embedding 模型做对比学习微调（contrastive fine-tuning），通常几千条正负例就能显著改善；**3)** 如果领域术语体系和通用语料差异极大（如医疗编码、法律条款），可能需要在领域语料上做继续预训练（continual pre-training）再微调。大多数场景下前两步已经够用，预训练是最后手段。',
      src: '/embedding-domain-comparison.png',
    },
    codeExample: `candidates = [
    "BAAI/bge-m3",
    "Qwen/Qwen3-Embedding-8B",
    "text-embedding-3-large",
]

# 实战里不要只看榜单，应该在领域数据上评测 Recall@k / nDCG
for model_name in candidates:
    score = run_retrieval_eval(model_name, eval_queries, golden_chunks)
    print(model_name, score)`,
    extensions: [
      {
        question: '你会把 embedding 选型做成一次性决策，还是持续 A/B 测试的能力？',
        approach: '更推荐把它做成持续评估能力。模型、数据分布和 query 类型都会变化，一次性拍板很容易过时。至少要保留一个小型评估集和几组候选模型，定期复测。'
      },
      {
        question: '高维 embedding 的收益，是否足以抵消向量库存储与查询成本？',
        approach: '先不要抽象争论，直接做 tradeoff 实验：固定评估集，对比不同维度下的 Recall / nDCG，再对照存储、延迟和成本。只有收益能量化，你才能知道高维是否值得。'
      },
      {
        question: '对于多模态文档，文本 embedding 和图文联合 embedding 应如何协作？',
        approach: '通常不是二选一。可以先让文本摘要和 caption 进入文本检索主链路，再在确实需要视觉定位的场景里补多模态 embedding。这样更符合课程里的渐进式落地思路。'
      },
    ],
  },

  vectordb: {
    title: '向量数据库选型',
    content: [
      '向量数据库不是“存向量的地方”这么简单，它决定了系统的过滤能力、索引更新能力、查询延时、运维复杂度和成本结构。',
      '在生产场景里，选型通常不是只看 ANN 指标，而是同时看：**metadata filter、增量写入、混合检索能力、扩展性、托管方式、合规性**。',
      '如果你的检索 heavily 依赖车型/年份/部门/权限过滤，那么 metadata filter 的重要性不亚于 ANN 本身。'
    ],
    concepts: [
      { term: 'ANN index', desc: '近似最近邻索引是向量库的核心，但不是唯一能力。' },
      { term: 'Metadata filtering', desc: '生产检索通常先过滤再相似度搜索，否则召回范围太大、噪声太高。' },
      { term: 'Realtime indexing', desc: '新数据何时可查，决定了知识库是否真能支持实时业务。' },
    ],
    toolComparison: {
      title: '向量库选型要点',
      columns: ['方案', '优势', '风险/局限', '适合'],
      rows: [
        ['Chroma', '本地实验最方便', '生产能力有限', '工作坊 / 本地原型'],
        ['Qdrant', '实时、过滤强、工程体验好', '自建仍需运维', '中小到中大型生产系统'],
        ['Milvus', '分布式、十亿级扩展', '架构更重', '超大规模向量检索'],
        ['ES/OpenSearch', '混合检索生态成熟', '向量部分不是最极致', '文本搜索本来就很强的团队'],
        ['Pinecone/托管服务', '上线快、托管省心', '成本与合规要评估', '快速验证 / 云上产品'],
      ],
    },
    codeExample: `import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="maintenance_docs",
    metadata={"hnsw:space": "cosine"},
)

collection.add(
    ids=["doc_001", "doc_002"],
    documents=["发动机启动困难，OBD 报码 P0301", "定期更换机油，建议 5000km"],
    metadatas=[
        {"vehicle_model": "Corolla", "year": 2023, "type": "fault"},
        {"vehicle_model": "Camry", "year": 2024, "type": "maintenance"},
    ],
)

results = collection.query(
    query_texts=["发动机抖动怎么处理"],
    n_results=3,
    where={"vehicle_model": "Corolla"},
)

for doc, dist in zip(results["documents"][0], results["distances"][0]):
    print(f"{dist:.4f}  {doc}")`,
    extensions: [
      {
        question: '如果业务必须做权限过滤，向量库是否要原生支持 ACL 级 metadata filter？',
        approach: '如果 ACL 是硬约束，就不应只在应用层兜底，而要尽量在检索层就过滤掉。关键判断是：未授权内容是否可能被模型看到；只要可能看到，就意味着风险仍然存在。'
      },
      {
        question: '你的系统更适合“向量库 + BM25 分离”，还是直接用支持混合检索的一体化方案？',
        approach: '看团队能力和系统边界。如果团队已经有成熟搜索基础设施，一体化方案会更省运维；如果你想完全控制 dense / sparse / rerank 各环节，分离式架构会更灵活。'
      },
      {
        question: '什么时候应该从 Chroma 升级到 Qdrant / Milvus，而不是继续在应用层补丁？',
        approach: '信号通常很明确：数据量持续增长、实时写入要求更高、metadata filter 变复杂、延迟和稳定性开始成为瓶颈。出现这些迹象时，就不应该继续在原型方案上打补丁。'
      },
    ],
  },

  freshness: {
    title: '数据新鲜度',
    content: [
      '生产 RAG 不是做一次性离线建库，而是要面对文档新增、修订、失效、删除。**知识库是活的，索引也必须是活的。**',
      '数据新鲜度的关键不是“多久重跑一次全量 embedding”，而是能否做**增量检测、增量重嵌、增量索引、版本回滚**。',
      '很多系统答得不准，不是模型不行，而是索引里还留着旧版本制度、旧 FAQ 或已失效的文档。'
    ],
    concepts: [
      { term: 'CDC', desc: '用变更捕获机制感知源端数据更新，而不是定时全量扫描。' },
      { term: 'Incremental re-embed', desc: '只对受影响的对象重做 embedding，而不是每次全量重建。' },
      { term: 'Versioned knowledge base', desc: '为每次摄取打版本，才能做回滚、审计和线上对比。' },
    ],
    toolComparison: {
      title: '更新策略对比',
      columns: ['策略', '优点', '缺点', '适合'],
      rows: [
        ['夜间全量重建', '实现最简单', '延迟高、成本高、回滚慢', '小规模静态知识库'],
        ['定时增量更新', '成本可控', '新鲜度不够实时', '日更/小时更场景'],
        ['CDC + 实时索引', '新鲜度最好', '工程复杂度最高', '高频更新的生产系统'],
        ['分层知识库', '冷热数据策略清晰', '架构设计更复杂', '多源、多频率更新场景'],
      ],
    },
    codeExample: `import hashlib, json
from pathlib import Path

DOCS_DIR = Path("./docs")
STATE_FILE = Path("./doc_state.json")

def file_hash(path: str) -> str:
    return hashlib.md5(Path(path).read_bytes()).hexdigest()

def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}

def save_state(state: dict):
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))

def detect_changes(old_state: dict, docs_dir: Path) -> dict:
    current = {str(p): file_hash(str(p)) for p in docs_dir.glob("*.txt")}
    added    = {f: h for f, h in current.items() if f not in old_state}
    deleted  = {f: h for f, h in old_state.items() if f not in current}
    modified = {f: h for f, h in current.items()
                if f in old_state and old_state[f] != h}
    return {"added": added, "modified": modified,
            "deleted": deleted, "current": current}

# --- 每次摄取时调用 ---
state = load_state()
changes = detect_changes(state, DOCS_DIR)

for f in changes["added"]:
    print(f"[NEW]    {f} → 需要 chunk + embed + index")
for f in changes["modified"]:
    print(f"[UPDATE] {f} → 删旧向量，重新 chunk + embed")
for f in changes["deleted"]:
    print(f"[DELETE] {f} → 删除对应向量")

save_state(changes["current"])

# === Round 1: 首次入库 ===
# [NEW]    docs/manual_v1.txt → 需要 chunk + embed + index
# [NEW]    docs/faq.txt       → 需要 chunk + embed + index
#
# === Round 2: 改了一份，加了一份 ===
# [NEW]    docs/policy.txt    → 需要 chunk + embed + index
# [UPDATE] docs/manual_v1.txt → 删旧向量，重新 chunk + embed
#
# === Round 3: 删了一份 ===
# [DELETE] docs/faq.txt       → 删除对应向量`,
    extensions: [
      {
        question: '如果一份制度文件只改了第 3 章，是否应该整份文档重嵌？',
        approach: '先看系统是否保留了足够细粒度的中间表示。如果能定位到受影响 chunk，增量更新通常更合适；只有当章节边界和引用关系高度耦合时，才考虑整份重嵌。'
      },
      {
        question: '删除文档时，你会同步删除旧向量，还是先做软删除并保留审计记录？',
        approach: '这取决于合规和回滚需求。若业务强调审计可追溯，软删除更稳；若数据绝不能继续暴露，则要在检索层立即不可见，并在后台完成物理清理。'
      },
      {
        question: '数据更新频率和 query 频率不对称时，索引刷新策略应该如何设计？',
        approach: '先识别主矛盾：是更新更频繁，还是查询更密集。高更新场景更看重增量和异步；高查询场景则更看重索引稳定和缓存。刷新策略应服务主要压力点，而不是追求形式上的“实时”。'
      },
    ],
  },
};

// 向量数据库即时索引对比表
export const dataEngVectorDBTable = [
  { db: 'Qdrant', instantIndex: '非常高', features: '采用 Rust 语言编写，高度重视性能和效率。专为实时更新而设计。' },
  { db: 'Pinecone', instantIndex: '高', features: '完全托管服务，性能卓越，易于使用。实际延迟可能因负载和 Pod 配置而略有不同。' },
  { db: 'Weaviate', instantIndex: '高', features: '开源，设计兼顾可扩展性和灵活性。支持使用 HNSW 进行近实时索引，但性能取决于配置和硬件。' },
  { db: 'Milvus', instantIndex: '中高', features: '高度可扩展的开源数据库，支持多种索引类型（HNSW、IVF 等）。提供近乎实时的功能，但索引延迟可能对所选索引类型更为敏感。' },
  { db: 'Elasticsearch / OpenSearch', instantIndex: '中等', features: '成熟的搜索引擎，集成了向量搜索（基于 Lucene 的 HNSW KNN）。基于近实时 (NRT) 原理运行，刷新间隔由刷新机制控制（默认 1 秒，可配置）。速度通常很快，但向量索引延迟有时可能略高于预期。' },
];

export const dataEngQuestions = {
  warmUp: [
    {
      question: '你的文档库中最复杂的文档类型是什么？当前解析方案有何局限？',
      hook: '识别复杂文档类型是优化解析的第一步',
    },
    {
      question: '固定长度切分 vs 语义切分，各适用什么场景？',
      hook: '固定切分适合结构均匀文档，语义切分适合复杂结构',
    },
    {
      question: '选择 Embedding 模型时，除了 MTEB 排名还需要考虑什么？',
      hook: '领域相关性、延迟、多语言、维度权衡',
    },
  ],
  deepThinking: [
  {
    question: '如果文档库有 100 万份文档且每天更新 1000 份，你如何设计数据摄取管线？',
    hint: '考虑 CDC、增量、并行、即时索引',
    answer: '设计要点：1) CDC 监控源端变更，仅处理新增/修改文档；2) 增量摄取管线：检测变更 → 选择性 re-embed → 更新索引，避免全量重建；3) 并行化：chunking + embedding 分布到多节点；4) 即时索引：新文档在秒级内可检索，解耦摄取确认与后台索引；5) 元数据中标记 ingestion_batch_id 支持版本回滚。',
  },
  {
    question: '表格中的关键参数如何在 RAG 中保持语义完整性？',
    hint: '结构化导出、摘要、分离存储',
    answer: '方案：1) 用专用表格解析器（Docling、Textract）导出为 Markdown/JSON，保持行列结构；2) 超大表格在索引时生成摘要；3) 表格与摘要作为不同对象类型分别存储；4) 查询时若摘要匹配，再将完整表格喂给 LLM。这样既保证检索精度，又避免超大表格直接嵌入丢失细节。',
  },
  {
    question: 'Embedding 维度从 1536 降到 768 会损失多少精度？如何评估这个 tradeoff？',
    hint: 'Matryoshka 技术、领域评估集',
    answer: '使用 Matryoshka embedding 技术：同一模型支持多维度输出，无需重训即可截断。精度损失因领域而异，需在领域评估集上实测。评估方法：在固定评估集上对比 1536 维与 768 维的 Recall@k、nDCG 等指标；若损失 < 2-3% 且延迟/成本显著下降，可接受降维。',
  },
  ],
};
