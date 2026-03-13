import React, { useEffect, useState } from 'react';

const quickCards = [
  {
    id: 'langchain',
    icon: '🧱',
    title: 'LangChain & LangGraph',
    desc: '组件库 + 工作流编排器',
    color: '#6366f1',
  },
  {
    id: 'langfuse',
    icon: '📈',
    title: 'Langfuse',
    desc: 'tracing / observability / agent 轨迹',
    color: '#10b981',
  },
  {
    id: 'ocr',
    icon: '📄',
    title: 'MinerU & PaddleOCR',
    desc: '复杂 PDF / 表格 / 图文混排解析',
    color: '#f59e0b',
  },
  {
    id: 'tools',
    icon: '🛠️',
    title: 'Tools',
    desc: 'Tavily、网页抓取、业务接口',
    color: '#ef4444',
  },
];

const toolCards = [
  {
    name: 'Tavily',
    bestFor: '给 agent 做联网搜索 / 实时信息补全',
    strengths: ['搜索结果对 LLM 友好', 'LangChain 集成成熟', '适合 research agent / web RAG'],
  },
  {
    name: 'Jina Reader',
    bestFor: '把网页快速转成干净文本',
    strengths: ['抓网页正文很方便', '适合把 URL 临时转为可检索上下文', '对轻量 web RAG 很实用'],
  },
  {
    name: 'Firecrawl',
    bestFor: '批量抓站点、做知识库冷启动',
    strengths: ['支持 crawl / scrape', '适合企业文档站、帮助中心、博客', '能直接产出 markdown'],
  },
  {
    name: 'E2B',
    bestFor: '给 agent 一个安全的代码执行沙箱',
    strengths: ['适合数据分析、表格处理、Python 代码执行', '很适合需要“先算再答”的 agent', '把代码执行和主应用隔离，安全性更好'],
  },
];

const codeStyle = {
  background: '#f8fafc',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--spacing-md)',
  overflowX: 'auto',
  fontSize: '0.88rem',
  lineHeight: 1.6,
};

const ToolFrameworkTab = ({ initialSection = 'langchain', onSectionChange = () => {} }) => {
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const selectSection = (section) => {
    setActiveSection(section);
    onSectionChange(section);
  };

  const renderSection = () => {
    if (activeSection === 'langchain') {
      return (
        <div className="content-block">
          <div className="block-title">🧱 LangChain & LangGraph</div>
          <p className="content-text" style={{ marginBottom: 'var(--spacing-sm)' }}>
            这是一份为你准备的 <strong>LangChain</strong> 和 <strong>LangGraph</strong> 一分钟速通指南，
            以及搭建 RAG（检索增强生成）或 AI Agent 的核心“必杀技”语法。
          </p>

          <div className="highlight-box" style={{ marginBottom: 'var(--spacing-md)' }}>
            <p className="content-text" style={{ margin: 0, fontWeight: 600 }}>
              ⏱️ 一分钟总结：LangChain & LangGraph
            </p>
          </div>

          <p className="content-text">
            用一个简单的比喻：<strong>如果做一道 AI 大菜，LangChain 是“食材和厨具”，LangGraph 就是“菜谱和厨师的烹饪逻辑”。</strong>
          </p>
          <ul className="content-text" style={{ paddingLeft: '1.2rem', marginTop: 0 }}>
            <li>
              <strong>LangChain（组件库 / 乐高积木）：</strong>
              一个用于开发由大语言模型（LLMs）驱动的应用的框架。它为你打包好了几乎所有需要的基础组件：
              对接各种 LLM API、提示词模板（Prompts）、输出解析器、文档加载器、向量数据库接口等。
              它的核心逻辑是线性的“链（Chain）”。
            </li>
            <li>
              <strong>LangGraph（编排器 / 循环大脑）：</strong>
              建立在 LangChain 之上的扩展库。传统的 LangChain 是单向执行的（A -&gt; B -&gt; C），
              但真正的 AI Agent 需要“思考-行动-观察”的<strong>循环</strong>能力。LangGraph 将应用定义为
              <strong>状态图（State Graph）</strong>，允许代码在节点之间循环
              （比如：大模型发现自己出错了，决定重新调用工具），这是构建可靠、复杂的多智能体（Multi-Actor）系统的绝对核心。
            </li>
          </ul>

          <div className="block-title" style={{ fontSize: '1rem' }}>🛠️ 必会语法 1：用 LangChain 搭建 RAG（检索增强生成）</div>
          <p className="content-text">
            构建 RAG 的核心是数据管道，现代 LangChain 极度依赖 <strong>LCEL（LangChain 表达语言）</strong>，
            也就是用 <code>|</code> 符号把组件串联起来。
          </p>
          <p className="content-text" style={{ fontWeight: 600 }}>
            RAG 核心 5 步与关键语法：
          </p>

          <div className="compare-card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <div className="compare-card-title">1. 加载与切分（Loader & Splitter）</div>
            <div className="compare-card-body">将长文档切成小块。</div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

docs = WebBaseLoader("https://...").load()
splits = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
).split_documents(docs)
`}</pre>
          </div>

          <div className="compare-card" style={{ margin: 'var(--spacing-md) 0' }}>
            <div className="compare-card-title">2. 向量化与存储（Embeddings & VectorStore）</div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=OpenAIEmbeddings(),
)
retriever = vectorstore.as_retriever()  # 变身为检索器
`}</pre>
          </div>

          <div className="compare-card" style={{ margin: 'var(--spacing-md) 0' }}>
            <div className="compare-card-title">3. 大模型与提示词（Model & Prompt）</div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o")
prompt = ChatPromptTemplate.from_template(
    "基于以下上下文回答问题：\\n{context}\\n问题：{question}"
)
`}</pre>
          </div>

          <div className="compare-card" style={{ margin: 'var(--spacing-md) 0' }}>
            <div className="compare-card-title">4. LCEL 语法组装管道（The Magic）</div>
            <div className="compare-card-body">
              用 <code>|</code> 串联输入、检索、提示词、模型和输出解析。
            </div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}  # 1. 组装输入
    | prompt                                                   # 2. 填入提示词
    | llm                                                      # 3. 交给大模型
    | StrOutputParser()                                        # 4. 解析为纯文本
)

rag_chain.invoke("LangGraph 是什么？")`}</pre>
          </div>

          <div className="block-title" style={{ fontSize: '1rem', marginTop: 'var(--spacing-lg)' }}>🤖 必会语法 2：用 LangGraph 搭建 AI Agent</div>
          <p className="content-text">
            构建 Agent 的核心是定义<strong>状态（State）</strong>、<strong>节点（Nodes - 具体动作）</strong>
            和<strong>边（Edges - 逻辑流向）</strong>。
          </p>
          <p className="content-text" style={{ fontWeight: 600 }}>
            Agent 核心结构与关键语法：
          </p>

          <div className="compare-card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <div className="compare-card-title">1. 定义状态（State）</div>
            <div className="compare-card-body">Agent 在每一步流转时共享的“记忆”数据结构。</div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # add_messages 会把新消息追加到列表中，而不是覆盖
    messages: Annotated[list, add_messages]
`}</pre>
          </div>

          <div className="compare-card" style={{ margin: 'var(--spacing-md) 0' }}>
            <div className="compare-card-title">2. 定义图与节点（Graph & Nodes）</div>
            <div className="compare-card-body">
              节点通常是普通的 Python 函数，接收 State，返回更新后的 State。
            </div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`from langgraph.graph import StateGraph, END

# 初始化图
workflow = StateGraph(AgentState)

# 定义节点函数
def call_model(state):
    response = llm.invoke(state["messages"])
    return {"messages": [response]}  # 返回状态更新

    
workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)  # 假设你定义了工具节点
`}</pre>
          </div>

          <div className="compare-card" style={{ margin: 'var(--spacing-md) 0' }}>
            <div className="compare-card-title">3. 定义边与条件流转（Edges & Conditional Edges）</div>
            <div className="compare-card-body">
              这是 Agent 的灵魂，也就是循环和决策能力。
            </div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`# 设置起点
workflow.set_entry_point("agent")

# 定义条件边：Agent 根据模型输出决定是去调用工具，还是结束
def should_continue(state):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "continue"
    return "end"

workflow.add_conditional_edges(
    "agent",          # 来源节点
    should_continue,  # 判断函数
    {
        "continue": "tools",  # 如果返回 continue，去 tools 节点
        "end": END,           # 如果返回 end，结束运行
    }
)

workflow.add_edge("tools", "agent")
`}</pre>
          </div>

          <div className="compare-card" style={{ margin: 'var(--spacing-md) 0' }}>
            <div className="compare-card-title">4. 编译与运行（Compile & Invoke）</div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`app = workflow.compile()

# 运行 Agent
inputs = {"messages": [("user", "今天新加坡天气如何？")]}
for output in app.stream(inputs):
    print(output)`}</pre>
          </div>

          <div className="info-box" style={{ marginTop: 'var(--spacing-lg)' }}>
            <p className="content-text" style={{ margin: 0 }}>
              <strong>总结来说：</strong>RAG 看重 <strong>LCEL 管道组装</strong>（<code>prompt | model | parser</code>），
              而 Agent 看重 <strong>LangGraph 状态机</strong>（<code>add_node</code> + <code>add_conditional_edges</code>）。
            </p>
          </div>
        </div>
      );
    }

    if (activeSection === 'langfuse') {
      return (
        <div className="content-block">
          <div className="block-title">📈 Langfuse</div>
          <p className="content-text" style={{ marginBottom: 'var(--spacing-sm)' }}>
            这是一份为你准备的 <strong>Langfuse</strong> 一分钟速通指南，延续之前的风格，我们来看看如何给你的 AI 应用装上“透视眼”。
          </p>

          <div className="highlight-box" style={{ marginBottom: 'var(--spacing-md)' }}>
            <p className="content-text" style={{ margin: 0, fontWeight: 600 }}>
              ⏱️ 一分钟总结：Langfuse
            </p>
          </div>

          <p className="content-text">
            如果继续用做菜来比喻：
          </p>
          <ul className="content-text" style={{ paddingLeft: '1.2rem', marginTop: 0 }}>
            <li><strong>LangChain</strong> 是食材和厨具；</li>
            <li><strong>LangGraph</strong> 是菜谱和厨师的烹饪逻辑；</li>
            <li><strong>Langfuse</strong> 就是餐厅里的 <strong>“全方位监控探头 + 财务会计 + 品控经理”</strong>。</li>
          </ul>

          <p className="content-text">
            <strong>它是做什么的？</strong>
          </p>
          <p className="content-text">
            Langfuse 是一个开源的 <strong>LLMOps（大模型运维）和可观测性平台</strong>。当你把 LangChain 或
            LangGraph 跑起来（执行了 <code>invoke</code>）之后，整个过程就像一个黑盒。如果大模型回答得很蠢，
            你不知道是检索（RAG）找错了文档，还是提示词写得不好，还是大模型本身在抽风。
          </p>
          <p className="content-text">
            Langfuse 能帮你把这个“黑盒”变成“玻璃盒”，记录下每一次执行的：
          </p>
          <ol className="content-text" style={{ paddingLeft: '1.2rem', marginTop: 0 }}>
            <li><strong>输入和输出</strong>（具体发给了大模型什么内容）。</li>
            <li><strong>执行时间</strong>（哪一步卡了最久）。</li>
            <li><strong>Token 消耗与成本</strong>（花了多少美分，精确到每一次调用）。</li>
          </ol>

          <div className="block-title" style={{ fontSize: '1rem' }}>🛠️ 必会语法 1：无缝接入 LangChain（CallbackHandler）</div>
          <p className="content-text">
            如果你已经用 LangChain 搭建好了刚才的 RAG 管道，接入 Langfuse 极其简单。它不需要你重写核心逻辑，
            只需要在“点火”（<code>invoke</code>）的时候，顺手挂上一个<strong>回调处理器（Callback Handler）</strong>。
          </p>
          <p className="content-text" style={{ fontWeight: 600 }}>
            关键语法：
          </p>

          <div className="compare-card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <div className="compare-card-title">1. 配置环境变量</div>
            <div className="compare-card-body">Langfuse 需要知道把数据发到哪个项目。</div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`import os
os.environ["LANGFUSE_SECRET_KEY"] = "sk-lf-..."
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-lf-..."
os.environ["LANGFUSE_HOST"] = "https://cloud.langfuse.com"  # 或你私有部署的地址`}</pre>
          </div>

          <div className="compare-card" style={{ margin: 'var(--spacing-md) 0' }}>
            <div className="compare-card-title">2. 在 invoke 时挂载监控</div>
          </div>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`from langfuse.callback import CallbackHandler

# 1. 初始化 Langfuse 的回调监听器
langfuse_handler = CallbackHandler()

# 2. 假设 rag_chain 是你前面用 LangChain 写好的管道
# rag_chain = prompt | model | parser

# 3. 点火！并在 config 里加上监听器
result = rag_chain.invoke(
    {"question": "Langfuse 是什么？"},
    config={"callbacks": [langfuse_handler]}  # <--- 核心就是加了这一句！
)

# 强制将数据异步推送到云端（通常在脚本结束前调用）
langfuse_handler.flush()`}</pre>
          </div>

          <div className="info-box" style={{ marginTop: 'var(--spacing-md)' }}>
            <p className="content-text" style={{ margin: 0 }}>
              就加这一句 <code>config</code> 代码，你就可以登录 Langfuse 后台，看到这一次问答耗费了多少时间、
              多少 Token、以及内部具体的流转过程了。
            </p>
          </div>

          <div className="block-title" style={{ fontSize: '1rem', marginTop: 'var(--spacing-lg)' }}>🛠️ 必会语法 2：万能的追踪器（@observe 装饰器）</div>
          <p className="content-text">
            如果你用的不是纯 LangChain，或者你正在用 <strong>LangGraph</strong> 写复杂的自定义 Agent 节点函数，
            你需要更细粒度的控制，这时候就要用到 <code>@observe</code> 装饰器。
          </p>
          <p className="content-text">
            给任何普通的 Python 函数戴上一顶 <code>@observe()</code> 的“帽子”，它就立刻变成了受监控的步骤。
          </p>
          <p className="content-text" style={{ fontWeight: 600 }}>
            关键语法：
          </p>
          <div style={codeStyle}>
            <pre style={{ margin: 0 }}>{`from langfuse.decorators import observe
import openai

# 只要加了这个装饰器，这个函数的输入、输出、耗时就会被自动记录
@observe()
def retrieve_data(query: str):
    # 模拟检索数据库
    return "Langfuse 是一个可观测性平台。"

# 监控 LLM 调用，甚至可以细化到追踪这是一个 'generation'（生成）动作
@observe(as_type="generation")
def call_llm(context: str, query: str):
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f"基于此上下文回答: {context}"},
            {"role": "user", "content": query}
        ]
    )
    return response.choices[0].message.content

# 监控整个主流程
@observe()
def main_agent(user_query: str):
    # 1. 执行检索
    context = retrieve_data(user_query)
    # 2. 调用模型
    answer = call_llm(context, user_query)
    return answer

# 运行
main_agent("介绍一下 Langfuse")`}</pre>
          </div>

          <div className="block-title" style={{ fontSize: '1rem', marginTop: 'var(--spacing-lg)' }}>📚 核心概念：监控后台里的三个词</div>
          <p className="content-text">
            当你在后台看监控数据时，你会频繁看到这三个嵌套的概念（就像套娃一样）：
          </p>
          <ol className="content-text" style={{ paddingLeft: '1.2rem', marginTop: 0 }}>
            <li><strong>Trace（追踪）：</strong>最外层。代表用户发起的一次<strong>完整请求</strong>（比如：用户点击了“发送”按钮，直到最终拿到回复的整个生命周期）。</li>
            <li><strong>Span（跨度）：</strong>中间层。代表中间经过的<strong>具体步骤</strong>（比如：切分文档、去向量库检索数据、调用工具）。</li>
            <li><strong>Generation（生成）：</strong>最内层。专指<strong>大模型的生文本过程</strong>。这里会详细显示具体的 Prompt 长什么样，生成了什么词，花了多少 Token。</li>
          </ol>
        </div>
      );
    }

    if (activeSection === 'ocr') {
      return (
        <div className="content-block">
          <div className="block-title">📄 MinerU & PaddleOCR</div>
          <p className="content-text" style={{ marginBottom: 'var(--spacing-sm)' }}>
            这是一份为你准备的 <strong>MinerU</strong> 和 <strong>PaddleOCR</strong> 对比速通版，
            重点不是“谁绝对更强”，而是它们分别代表了两条不同的文档解析路线：一条更偏
            <strong>RAG 友好的语义还原</strong>，另一条更偏<strong>工业级 OCR 与全场景鲁棒性</strong>。
          </p>

          <div className="highlight-box" style={{ marginBottom: 'var(--spacing-md)' }}>
            <p className="content-text" style={{ margin: 0, fontWeight: 600 }}>
              ⏱️ 一分钟总结：MinerU vs PaddleOCR
            </p>
          </div>

          <p className="content-text">
            如果用一句话概括：
          </p>
          <ul className="content-text" style={{ paddingLeft: '1.2rem', marginTop: 0 }}>
            <li><strong>MinerU：</strong>更像“为 LLM / RAG 准备干净 Markdown 和语义顺序”的解析器，特别擅长科学文献、复杂版面、公式和语义去噪。</li>
            <li><strong>PaddleOCR / PaddleOCR-VL：</strong>更像“工业级全能 OCR 工具箱”，在扫描件、手机拍照、扭曲文档、多语言和部署稳定性上更强。</li>
          </ul>

          <div className="block-title" style={{ fontSize: '1rem' }}>1. 架构思路：二阶段语义解析 vs 工业级模块化 / VLM 一体化</div>
          <p className="content-text">
            <strong>MinerU</strong> 的代表性思路是“分而治之”。新版 MinerU 采用粗到细的二阶段解析：
            第一阶段先做低分辨率全局版面分析，快速锁定标题、段落、图表、公式位置；第二阶段再对关键区域做高分辨率精细识别。
            这样做的优点是长文档效率高，且对复杂布局更友好。
          </p>
          <p className="content-text">
            <strong>PaddleOCR</strong> 则有两条路线：一条是传统的工业级模块化流水线（检测、方向校正、识别、结构化提取），
            另一条是更先进的 <strong>PaddleOCR-VL-1.5</strong>，走端到端文档理解路线，把视觉编码和语言理解更紧地耦合起来，
            对倾斜、扭曲和复杂页面更鲁棒。
          </p>

          <div className="content-block" style={{ padding: 0, marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <img
              src="/paddleocr-ecosystem-overview.png"
              alt="PaddleOCR 生态结构图"
              style={{
                width: '100%',
                display: 'block',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
              }}
            />
            <p className="content-text" style={{ marginTop: 'var(--spacing-sm)', marginBottom: 0, color: 'var(--text-muted)' }}>
              图里能看出 PaddleOCR 的生态层次很完整：上层是应用场景，中间是 OCR / Doc Parsing / Doc Understanding 模型族，
              再往下是训练、推理、服务化和 MCP Server，最后落到 PaddlePaddle 框架和多种硬件适配。
            </p>
          </div>

          <div className="block-title" style={{ fontSize: '1rem' }}>2. 输入与输出：谁更适合直接喂给 RAG</div>
          <table className="info-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>MinerU</th>
                <th>PaddleOCR / PaddleOCR-VL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>输入侧</td>
                <td>支持 PDF、图片，并扩展到 Office 文档；能区分文本型 PDF 和扫描型 PDF</td>
                <td>强于图像、扫描件、手机拍摄、扭曲与光照不均等“恶劣环境”输入</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Markdown</td>
                <td>原生更强调语义级输出，自动清理页眉页脚、页码、断行噪音，特别适合直接喂给 LLM</td>
                <td>也能转 Markdown，但整体更偏“结构复原”而不是“语义去噪”</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>JSON / 结构化</td>
                <td>有中间 JSON，包含坐标、阅读顺序、置信度</td>
                <td>任务型 JSON 更丰富，表格、KV、结构识别能力成熟</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>表格 / 公式</td>
                <td>公式 LaTeX 还原口碑很好，复杂科学文档表现突出</td>
                <td>表格结构恢复、跨页拼接、多语言和复杂印刷公式都很强</td>
              </tr>
            </tbody>
          </table>

          <div className="block-title" style={{ fontSize: '1rem', marginTop: 'var(--spacing-md)' }}>3. 精度、速度和鲁棒性</div>
          <p className="content-text">
            按你给的资料，<strong>PaddleOCR-VL-1.5</strong> 在 OmniDocBench 上的综合准确率约为
            <strong>94.5%</strong>，在真实物理环境（扫描、倾斜、扭曲、摄影、光照变化）下也保持了很强鲁棒性。
            如果你的业务要处理大量拍照件、票据、发票、历史档案或全球多语言文档，它通常更稳。
          </p>
          <p className="content-text">
            <strong>MinerU 2.5</strong> 综合精度略低一些，但它在学术论文、复杂公式、阅读顺序恢复、正文去噪和
            “给 RAG 产出 LLM-ready markdown” 这件事上非常强。尤其当你的目标是把 PDF 直接变成高质量知识库，
            MinerU 的语义纯净度很有优势。
          </p>
          <p className="content-text">
            速度上，两者都不慢，但风格不同：MinerU 的二阶段架构带来很高吞吐；PaddleOCR-VL 单图延迟通常更低，
            在轻量化部署和交互式场景下更占优。
          </p>

          <div className="block-title" style={{ fontSize: '1rem' }}>4. 商用和二次开发：这是选型时最容易被忽略的坑</div>
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <div className="compare-card">
              <div className="compare-card-title">MinerU</div>
              <div className="compare-card-body">
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <strong>许可证：</strong>AGPL-3.0
                </div>
                <div>
                  如果只是企业内部做数据清洗，问题通常不大；但如果你要把它作为公共 SaaS 服务对外提供，要认真评估源码开放义务。
                </div>
              </div>
            </div>
            <div className="compare-card">
              <div className="compare-card-title">PaddleOCR</div>
              <div className="compare-card-body">
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <strong>许可证：</strong>Apache 2.0
                </div>
                <div>
                  商业闭源更友好，模块化也更强，微调、替换检测器、嵌入自定义 pipeline 的自由度通常更高。
                </div>
              </div>
            </div>
          </div>

          <div className="block-title" style={{ fontSize: '1rem', marginTop: 'var(--spacing-md)' }}>5. 最后怎么选</div>
          <div className="compare-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <div className="compare-card">
              <div className="compare-card-title">优先选 MinerU 的场景</div>
              <div className="compare-card-body">
                科学论文、技术文档、公式密集 PDF、复杂阅读顺序恢复，以及你特别在意“输出给 LLM 的 Markdown 是否干净”的场景。
              </div>
            </div>
            <div className="compare-card">
              <div className="compare-card-title">优先选 PaddleOCR 的场景</div>
              <div className="compare-card-body">
                手机拍照件、票据、扫描档案、多语言全球化场景、工业级商用部署，以及你需要更强许可证安全性和模块替换自由度的场景。
              </div>
            </div>
            <div className="compare-card">
              <div className="compare-card-title">课程里的实用建议</div>
              <div className="compare-card-body">
                如果是“构建知识库 / 做 RAG”，优先关注语义连贯和阅读顺序；如果是“做 OCR 平台 / 处理脏文档”，优先关注鲁棒性、速度和商用合规。
              </div>
            </div>
          </div>

          <div className="info-box" style={{ marginTop: 'var(--spacing-md)' }}>
            <p className="content-text" style={{ margin: 0 }}>
              一个很实用的落地策略是：<strong>文本型 PDF 先直接抽文本；复杂 PDF / 科学文档优先试 MinerU；扫描件、拍照件、多语言和工业部署优先试 PaddleOCR / PaddleOCR-VL。</strong>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="content-block">
        <div className="block-title">🛠️ Tools：Tavily 和其他在 RAG 里好用的工具</div>
        <p className="content-text">
          当 query 需要实时信息、外部知识、结构化数据或跨系统联动时，单靠向量检索不够。这个时候就要把外部能力包装成 tool，让 agent 按需调用。
        </p>
        <div className="compare-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {toolCards.map((tool) => (
            <div key={tool.name} className="compare-card">
              <div className="compare-card-title">{tool.name}</div>
              <div className="compare-card-body">
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <strong>适合：</strong>{tool.bestFor}
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-secondary)' }}>
                  {tool.strengths.map((item) => (
                    <li key={item} style={{ marginBottom: '4px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="danger-box" style={{ marginTop: 'var(--spacing-md)' }}>
          <p className="content-text" style={{ margin: 0 }}>
            Tool 越多不代表 agent 越强。真正关键的是：什么时候该调用 tool、调用哪个 tool、失败后怎么降级，以及这些轨迹能不能在 Langfuse 里看清楚。
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="section-tab fade-in">
      <div className="section-main" style={{ flex: 1, maxWidth: '100%' }}>
        <div className="content-block">
          <h2 className="section-title">工具 / 框架介绍</h2>
          <p className="content-text">
            这一页按 4 个常用板块来讲。上面像“课程目录”一样点卡片切换，下面看对应内容。
          </p>
        </div>

        <div className="content-block">
          <div className="block-title">🧭 四个板块</div>
          <div className="compare-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {quickCards.map((card) => (
              <button
                key={card.title}
                onClick={() => selectSection(card.id)}
                className="compare-card"
                style={{
                  borderTop: `3px solid ${card.color}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: activeSection === card.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                }}
              >
                <div className="compare-card-title">
                  <span style={{ fontSize: '1.2rem' }}>{card.icon}</span>
                  <span>{card.title}</span>
                </div>
                <div className="compare-card-body">{card.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {renderSection()}
      </div>
    </div>
  );
};

export default ToolFrameworkTab;
