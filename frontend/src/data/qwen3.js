// Qwen3 (Dense Model) Architecture Data
// 稠密模型架构数据

export const qwen3Config = {
  name: "Qwen3ForCausalLM",
  description: "Qwen3 稠密因果语言模型 - 所有参数在每次前向传播中全部激活",
  type: "dense",
  defaultParams: {
    vocab_size: 151936,
    hidden_size: 4096,
    intermediate_size: 12288,
    num_hidden_layers: 36,
    num_attention_heads: 32,
    num_key_value_heads: 8,
    head_dim: 128,
    max_position_embeddings: 32768,
    rope_theta: 10000.0,
    rms_norm_eps: 1e-6,
  },
};

export const qwen3Architecture = {
  id: "qwen3_for_causal_lm",
  name: "Qwen3ForCausalLM",
  nameZh: "Qwen3 因果语言模型",
  description: "顶层模型类，继承自 Qwen3PreTrainedModel 和 GenerationMixin，用于自回归文本生成",
  params: {
    "_tied_weights_keys": '["lm_head.weight"]',
  },
  code: `class Qwen3ForCausalLM(Qwen3PreTrainedModel, GenerationMixin):
    _tied_weights_keys = ["lm_head.weight"]
    
    def __init__(self, config):
        super().__init__(config)
        self.model = Qwen3Model(config)
        self.vocab_size = config.vocab_size
        self.lm_head = nn.Linear(config.hidden_size, config.vocab_size, bias=False)
        self.post_init()`,
  children: [
    {
      id: "qwen3_model",
      name: "model (Qwen3Model)",
      nameZh: "主干模型",
      description: "Transformer 解码器主体，包含嵌入层、多个解码器层和最终归一化层",
      params: {
        "padding_idx": "config.pad_token_id",
        "vocab_size": "151936",
        "gradient_checkpointing": "False",
      },
      code: `class Qwen3Model(Qwen3PreTrainedModel):
    def __init__(self, config: Qwen3Config):
        super().__init__(config)
        self.padding_idx = config.pad_token_id
        self.vocab_size = config.vocab_size
        self.embed_tokens = nn.Embedding(config.vocab_size, config.hidden_size, self.padding_idx)
        self.layers = nn.ModuleList([
            Qwen3DecoderLayer(config, layer_idx) 
            for layer_idx in range(config.num_hidden_layers)
        ])
        self.norm = Qwen3RMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        self.rotary_emb = Qwen3RotaryEmbedding(config=config)
        self.gradient_checkpointing = False
        self.post_init()`,
      children: [
        {
          id: "embed_tokens",
          name: "embed_tokens (Embedding)",
          nameZh: "词嵌入层",
          description: "将输入的 token ID 转换为稠密向量表示。词表大小为 151936，嵌入维度等于 hidden_size",
          params: {
            "num_embeddings": "151936 (vocab_size)",
            "embedding_dim": "4096 (hidden_size)",
            "padding_idx": "config.pad_token_id",
          },
          shapes: {
            input: "(batch_size, seq_len) [LongTensor]",
            output: "(batch_size, seq_len, 4096)",
          },
          code: `self.embed_tokens = nn.Embedding(
    config.vocab_size,      # 151936
    config.hidden_size,     # 4096
    self.padding_idx
)

# 前向传播
inputs_embeds = self.embed_tokens(input_ids)`,
          children: [],
        },
        {
          id: "rotary_emb",
          name: "rotary_emb (Qwen3RotaryEmbedding)",
          nameZh: "旋转位置编码",
          description: "RoPE (Rotary Position Embedding) 实现，为 Query 和 Key 提供相对位置信息。通过复数旋转使模型感知 token 之间的相对距离",
          params: {
            "rope_type": '"default" 或其他变体 (yarn, llama3 等)',
            "rope_theta": "10000.0 (基频)",
            "max_seq_len_cached": "32768",
            "attention_scaling": "1.0 (可配置)",
          },
          shapes: {
            input: "(batch_size, seq_len, hidden_size), position_ids",
            output: "(cos, sin) 各为 (batch_size, seq_len, head_dim)",
          },
          code: `class Qwen3RotaryEmbedding(nn.Module):
    def __init__(self, config: Qwen3Config, device=None):
        super().__init__()
        self.rope_type = config.rope_scaling.get("rope_type", "default")
        self.max_seq_len_cached = config.max_position_embeddings
        inv_freq, self.attention_scaling = self.rope_init_fn(self.config, device)
        self.register_buffer("inv_freq", inv_freq, persistent=False)

    @torch.no_grad()
    def forward(self, x, position_ids):
        inv_freq_expanded = self.inv_freq[None, :, None].float()\\
            .expand(position_ids.shape[0], -1, 1).to(x.device)
        position_ids_expanded = position_ids[:, None, :].float()
        
        freqs = (inv_freq_expanded @ position_ids_expanded).transpose(1, 2)
        emb = torch.cat((freqs, freqs), dim=-1)
        cos = emb.cos() * self.attention_scaling
        sin = emb.sin() * self.attention_scaling
        return cos.to(dtype=x.dtype), sin.to(dtype=x.dtype)`,
          children: [],
        },
        {
          id: "layers",
          name: "layers (ModuleList × 32)",
          nameZh: "解码器层堆叠",
          description: "包含 32 个 Qwen3DecoderLayer，每层包含自注意力和前馈网络。使用 Pre-Norm 架构（先归一化后计算）",
          params: {
            "num_layers": "36 (num_hidden_layers)",
          },
          code: `self.layers = nn.ModuleList([
    Qwen3DecoderLayer(config, layer_idx) 
    for layer_idx in range(config.num_hidden_layers)  # 36 layers
])

# 前向传播
for decoder_layer in self.layers:
    hidden_states = decoder_layer(
        hidden_states,
        attention_mask=causal_mask,
        position_embeddings=position_embeddings,
        past_key_values=past_key_values,
        ...
    )`,
          children: [
            {
              id: "decoder_layer",
              name: "Qwen3DecoderLayer",
              nameZh: "单个解码器层",
              description: "标准 Transformer 解码器层，包含：输入归一化 → 自注意力 → 残差连接 → 归一化 → MLP → 残差连接",
              params: {
                "hidden_size": "4096",
                "attention_type": '"full_attention" 或 "sliding_attention"',
              },
              shapes: {
                input: "(batch_size, seq_len, 4096)",
                output: "(batch_size, seq_len, 4096)",
              },
              code: `class Qwen3DecoderLayer(GradientCheckpointingLayer):
    def __init__(self, config: Qwen3Config, layer_idx: int):
        super().__init__()
        self.hidden_size = config.hidden_size
        self.self_attn = Qwen3Attention(config=config, layer_idx=layer_idx)
        self.mlp = Qwen3MLP(config)
        self.input_layernorm = Qwen3RMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        self.post_attention_layernorm = Qwen3RMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        self.attention_type = config.layer_types[layer_idx]

    def forward(self, hidden_states, attention_mask=None, ...):
        # Pre-Norm + Self Attention + Residual
        residual = hidden_states
        hidden_states = self.input_layernorm(hidden_states)
        hidden_states, _ = self.self_attn(hidden_states, ...)
        hidden_states = residual + hidden_states
        
        # Pre-Norm + MLP + Residual
        residual = hidden_states
        hidden_states = self.post_attention_layernorm(hidden_states)
        hidden_states = self.mlp(hidden_states)
        hidden_states = residual + hidden_states
        return hidden_states`,
              children: [
                {
                  id: "input_layernorm",
                  name: "input_layernorm (Qwen3RMSNorm)",
                  nameZh: "输入层归一化",
                  description: "RMS Layer Normalization，仅使用均方根进行归一化，比传统 LayerNorm 更高效",
                  params: {
                    "normalized_shape": "4096 (hidden_size)",
                    "eps": "1e-6 (rms_norm_eps)",
                  },
                  shapes: {
                    input: "(batch_size, seq_len, 4096)",
                    output: "(batch_size, seq_len, 4096)",
                  },
                  code: `class Qwen3RMSNorm(nn.Module):
    def __init__(self, hidden_size, eps: float = 1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(hidden_size))  # 可学习的缩放参数
        self.variance_epsilon = eps

    def forward(self, hidden_states: torch.Tensor):
        input_dtype = hidden_states.dtype
        hidden_states = hidden_states.to(torch.float32)
        # 计算均方根
        variance = hidden_states.pow(2).mean(-1, keepdim=True)
        hidden_states = hidden_states * torch.rsqrt(variance + self.variance_epsilon)
        return self.weight * hidden_states.to(input_dtype)
        
# 数学公式: RMSNorm(x) = x / sqrt(mean(x²) + ε) * γ`,
                  children: [],
                },
                {
                  id: "self_attn",
                  name: "self_attn (Qwen3Attention)",
                  nameZh: "自注意力层",
                  description: "多头自注意力机制，使用 GQA (Grouped Query Attention) 减少 KV Cache 显存占用。Qwen3 特色：对 Q 和 K 应用 RMSNorm",
                  params: {
                    "num_attention_heads": "32 (Q heads)",
                    "num_key_value_heads": "8 (KV heads，Qwen3 使用 GQA)",
                    "head_dim": "128",
                    "attention_dropout": "0.0",
                    "attention_bias": "False (无偏置)",
                  },
                  shapes: {
                    input: "(batch_size, seq_len, 4096)",
                    Q: "(batch_size, 32, seq_len, 128)",
                    K: "(batch_size, 32, seq_len, 128)",
                    V: "(batch_size, 32, seq_len, 128)",
                    output: "(batch_size, seq_len, 4096)",
                  },
                  code: `class Qwen3Attention(nn.Module):
    def __init__(self, config: Qwen3Config, layer_idx: int):
        super().__init__()
        self.head_dim = config.head_dim  # 128
        self.num_key_value_groups = config.num_attention_heads // config.num_key_value_heads
        self.scaling = self.head_dim ** -0.5  # 1/sqrt(128)
        
        # QKV 投影 (无偏置)
        self.q_proj = nn.Linear(config.hidden_size, config.num_attention_heads * self.head_dim, bias=False)
        self.k_proj = nn.Linear(config.hidden_size, config.num_key_value_heads * self.head_dim, bias=False)
        self.v_proj = nn.Linear(config.hidden_size, config.num_key_value_heads * self.head_dim, bias=False)
        self.o_proj = nn.Linear(config.num_attention_heads * self.head_dim, config.hidden_size, bias=False)
        
        # Qwen3 特色: Q/K 归一化 (在 head_dim 维度)
        self.q_norm = Qwen3RMSNorm(self.head_dim, eps=config.rms_norm_eps)
        self.k_norm = Qwen3RMSNorm(self.head_dim, eps=config.rms_norm_eps)

    def forward(self, hidden_states, position_embeddings, ...):
        # 1. QKV 投影 + Q/K 归一化
        query_states = self.q_norm(self.q_proj(hidden_states).view(...)).transpose(1, 2)
        key_states = self.k_norm(self.k_proj(hidden_states).view(...)).transpose(1, 2)
        value_states = self.v_proj(hidden_states).view(...).transpose(1, 2)
        
        # 2. 应用 RoPE
        cos, sin = position_embeddings
        query_states, key_states = apply_rotary_pos_emb(query_states, key_states, cos, sin)
        
        # 3. 注意力计算: Softmax(QK^T / sqrt(d)) * V
        attn_output, _ = attention_interface(self, query_states, key_states, value_states, ...)
        
        # 4. 输出投影
        attn_output = attn_output.reshape(*input_shape, -1).contiguous()
        return self.o_proj(attn_output)`,
                  children: [
                    {
                      id: "q_proj",
                      name: "q_proj (Linear)",
                      nameZh: "Query 投影",
                      description: "将隐藏状态投影到 Query 空间",
                      params: {
                        "in_features": "4096",
                        "out_features": "4096 (32 heads × 128 dim)",
                        "bias": "False",
                      },
                      shapes: {
                        weight: "(4096, 4096)",
                        input: "(batch_size, seq_len, 4096)",
                        output: "(batch_size, seq_len, 4096)",
                      },
                      code: `self.q_proj = nn.Linear(
    config.hidden_size,                          # 4096
    config.num_attention_heads * self.head_dim,  # 32 * 128 = 4096
    bias=config.attention_bias                   # False
)`,
                      children: [],
                    },
                    {
                      id: "k_proj",
                      name: "k_proj (Linear)",
                      nameZh: "Key 投影",
                      description: "将隐藏状态投影到 Key 空间",
                      params: {
                        "in_features": "4096",
                        "out_features": "4096 (32 heads × 128 dim)",
                        "bias": "False",
                      },
                      shapes: {
                        weight: "(4096, 4096)",
                        input: "(batch_size, seq_len, 4096)",
                        output: "(batch_size, seq_len, 4096)",
                      },
                      code: `self.k_proj = nn.Linear(
    config.hidden_size,                            # 4096
    config.num_key_value_heads * self.head_dim,    # 8 * 128 = 1024
    bias=config.attention_bias                     # False
)`,
                      children: [],
                    },
                    {
                      id: "v_proj",
                      name: "v_proj (Linear)",
                      nameZh: "Value 投影",
                      description: "将隐藏状态投影到 Value 空间",
                      params: {
                        "in_features": "4096",
                        "out_features": "4096 (32 heads × 128 dim)",
                        "bias": "False",
                      },
                      shapes: {
                        weight: "(4096, 4096)",
                        input: "(batch_size, seq_len, 4096)",
                        output: "(batch_size, seq_len, 4096)",
                      },
                      code: `self.v_proj = nn.Linear(
    config.hidden_size,                            # 4096
    config.num_key_value_heads * self.head_dim,    # 8 * 128 = 1024
    bias=config.attention_bias                     # False
)`,
                      children: [],
                    },
                    {
                      id: "q_norm",
                      name: "q_norm (Qwen3RMSNorm)",
                      nameZh: "Query 归一化",
                      description: "Qwen3 特有设计：对 Query 在 head_dim 维度进行 RMSNorm，稳定训练",
                      params: {
                        "normalized_shape": "128 (head_dim)",
                        "eps": "1e-6",
                      },
                      code: `self.q_norm = Qwen3RMSNorm(self.head_dim, eps=config.rms_norm_eps)
# 应用: query_states = self.q_norm(self.q_proj(hidden_states).view(hidden_shape))`,
                      children: [],
                    },
                    {
                      id: "k_norm",
                      name: "k_norm (Qwen3RMSNorm)",
                      nameZh: "Key 归一化",
                      description: "Qwen3 特有设计：对 Key 在 head_dim 维度进行 RMSNorm，稳定训练",
                      params: {
                        "normalized_shape": "128 (head_dim)",
                        "eps": "1e-6",
                      },
                      code: `self.k_norm = Qwen3RMSNorm(self.head_dim, eps=config.rms_norm_eps)
# 应用: key_states = self.k_norm(self.k_proj(hidden_states).view(hidden_shape))`,
                      children: [],
                    },
                    {
                      id: "o_proj",
                      name: "o_proj (Linear)",
                      nameZh: "输出投影",
                      description: "将多头注意力输出映射回隐藏状态维度",
                      params: {
                        "in_features": "4096",
                        "out_features": "4096",
                        "bias": "False",
                      },
                      shapes: {
                        weight: "(4096, 4096)",
                        input: "(batch_size, seq_len, 4096)",
                        output: "(batch_size, seq_len, 4096)",
                      },
                      code: `self.o_proj = nn.Linear(
    config.num_attention_heads * self.head_dim,  # 4096
    config.hidden_size,                          # 4096
    bias=config.attention_bias                   # False
)`,
                      children: [],
                    },
                  ],
                },
                {
                  id: "post_attention_layernorm",
                  name: "post_attention_layernorm (Qwen3RMSNorm)",
                  nameZh: "注意力后归一化",
                  description: "自注意力层后的归一化层，为 MLP 层准备输入",
                  params: {
                    "normalized_shape": "4096 (hidden_size)",
                    "eps": "1e-6",
                  },
                  shapes: {
                    input: "(batch_size, seq_len, 4096)",
                    output: "(batch_size, seq_len, 4096)",
                  },
                  code: `self.post_attention_layernorm = Qwen3RMSNorm(
    config.hidden_size,        # 4096
    eps=config.rms_norm_eps    # 1e-6
)`,
                  children: [],
                },
                {
                  id: "mlp",
                  name: "mlp (Qwen3MLP)",
                  nameZh: "前馈神经网络 (FFN)",
                  description: "SwiGLU 激活的前馈网络。公式: down_proj(SiLU(gate_proj(x)) * up_proj(x))。参数量占解码器层的约 2/3",
                  params: {
                    "hidden_size": "4096",
                    "intermediate_size": "12288",
                    "hidden_act": "silu",
                  },
                  shapes: {
                    input: "(batch_size, seq_len, 4096)",
                    intermediate: "(batch_size, seq_len, 22016)",
                    output: "(batch_size, seq_len, 4096)",
                  },
                  code: `class Qwen3MLP(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.hidden_size = config.hidden_size          # 4096
        self.intermediate_size = config.intermediate_size  # 12288
        
        # SwiGLU 结构的三个线性层
        self.gate_proj = nn.Linear(self.hidden_size, self.intermediate_size, bias=False)
        self.up_proj = nn.Linear(self.hidden_size, self.intermediate_size, bias=False)
        self.down_proj = nn.Linear(self.intermediate_size, self.hidden_size, bias=False)
        self.act_fn = ACT2FN[config.hidden_act]  # SiLU

    def forward(self, x):
        # SwiGLU: down_proj(act(gate_proj(x)) * up_proj(x))
        down_proj = self.down_proj(
            self.act_fn(self.gate_proj(x)) * self.up_proj(x)
        )
        return down_proj
        
# 参数量计算:
# gate_proj: 4096 × 12288 = 50,331,648
# up_proj:   4096 × 12288 = 50,331,648  
# down_proj: 12288 × 4096 = 50,331,648
# 总计: ~151M 参数/层`,
                  children: [
                    {
                      id: "gate_proj",
                      name: "gate_proj (Linear)",
                      nameZh: "门控投影",
                      description: "SwiGLU 的门控分支，输出经过 SiLU 激活",
                      params: {
                        "in_features": "4096",
                        "out_features": "22016",
                        "bias": "False",
                      },
                      shapes: {
                        weight: "(22016, 4096)",
                      },
                      children: [],
                    },
                    {
                      id: "up_proj",
                      name: "up_proj (Linear)",
                      nameZh: "上投影",
                      description: "SwiGLU 的值分支，与门控分支输出逐元素相乘",
                      params: {
                        "in_features": "4096",
                        "out_features": "22016",
                        "bias": "False",
                      },
                      shapes: {
                        weight: "(22016, 4096)",
                      },
                      children: [],
                    },
                    {
                      id: "down_proj",
                      name: "down_proj (Linear)",
                      nameZh: "下投影",
                      description: "将中间表示映射回隐藏维度",
                      params: {
                        "in_features": "22016",
                        "out_features": "4096",
                        "bias": "False",
                      },
                      shapes: {
                        weight: "(4096, 22016)",
                      },
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "final_norm",
          name: "norm (Qwen3RMSNorm)",
          nameZh: "最终归一化层",
          description: "所有解码器层后的最终归一化，为 LM Head 准备输入",
          params: {
            "normalized_shape": "4096",
            "eps": "1e-6",
          },
          shapes: {
            input: "(batch_size, seq_len, 4096)",
            output: "(batch_size, seq_len, 4096)",
          },
          code: `self.norm = Qwen3RMSNorm(config.hidden_size, eps=config.rms_norm_eps)

# 在 forward 中
hidden_states = self.norm(hidden_states)`,
          children: [],
        },
      ],
    },
    {
      id: "lm_head",
      name: "lm_head (Linear)",
      nameZh: "语言模型头",
      description: "将隐藏状态映射到词表大小的 logits，用于预测下一个 token 的概率分布。可与 embed_tokens 共享权重",
      params: {
        "in_features": "4096 (hidden_size)",
        "out_features": "151936 (vocab_size)",
        "bias": "False",
        "tie_word_embeddings": "True (可选，共享嵌入权重)",
      },
      shapes: {
        weight: "(151936, 4096)",
        input: "(batch_size, seq_len, 4096)",
        output: "(batch_size, seq_len, 151936) [logits]",
      },
      code: `self.lm_head = nn.Linear(config.hidden_size, config.vocab_size, bias=False)

# forward 中
logits = self.lm_head(hidden_states[:, slice_indices, :])

# 计算交叉熵损失
if labels is not None:
    loss = self.loss_function(logits=logits, labels=labels, vocab_size=self.config.vocab_size)`,
      children: [],
    },
  ],
};

export default qwen3Architecture;
