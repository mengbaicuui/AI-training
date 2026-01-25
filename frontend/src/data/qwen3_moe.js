// Qwen3-MoE (Sparse Mixture of Experts Model) Architecture Data
// 稀疏混合专家模型架构数据

export const qwen3MoeConfig = {
    name: "Qwen3MoeForCausalLM",
    description: "Qwen3 混合专家因果语言模型 - 仅激活部分专家参数进行计算，实现大模型智力与小模型速度",
    type: "sparse_moe",
    defaultParams: {
        vocab_size: 151936,
        hidden_size: 2048,
        intermediate_size: 6144,
        moe_intermediate_size: 768,
        num_hidden_layers: 48,
        num_attention_heads: 32,
        num_key_value_heads: 4,
        head_dim: 128,
        num_experts: 128,
        num_experts_per_tok: 8,
        decoder_sparse_step: 1,
        max_position_embeddings: 32768,
        rope_theta: 1000000.0,
        rms_norm_eps: 1e-6,
        norm_topk_prob: false,
        router_aux_loss_coef: 0.001,
    },
};

export const qwen3MoeArchitecture = {
    id: "qwen3_moe_for_causal_lm",
    name: "Qwen3MoeForCausalLM",
    nameZh: "Qwen3-MoE 因果语言模型",
    description: "混合专家模型顶层类，使用 Top-K 路由机制在 128 个专家中选择 8 个进行计算。以 30B 总参数量实现 3B 激活参数的推理速度",
    params: {
        "_tied_weights_keys": '["lm_head.weight"]',
        "router_aux_loss_coef": "0.001 (负载均衡损失系数)",
        "num_experts": "128",
        "num_experts_per_tok": "8 (Top-K)",
    },
    code: `class Qwen3MoeForCausalLM(Qwen3MoePreTrainedModel, GenerationMixin):
    _tied_weights_keys = ["lm_head.weight"]
    
    def __init__(self, config):
        super().__init__(config)
        self.model = Qwen3MoeModel(config)
        self.vocab_size = config.vocab_size
        self.lm_head = nn.Linear(config.hidden_size, config.vocab_size, bias=False)
        self.router_aux_loss_coef = config.router_aux_loss_coef  # 负载均衡损失
        self.num_experts = config.num_experts                     # 128
        self.num_experts_per_tok = config.num_experts_per_tok     # 8
        self.post_init()
    
    def forward(self, ..., output_router_logits=None, ...):
        outputs = self.model(...)
        logits = self.lm_head(outputs.last_hidden_state)
        
        # MoE 特有: 计算辅助损失用于负载均衡
        if output_router_logits:
            aux_loss = load_balancing_loss_func(
                outputs.router_logits,
                self.num_experts,
                self.num_experts_per_tok,
                attention_mask,
            )
            if labels is not None:
                loss += self.router_aux_loss_coef * aux_loss
        
        return MoeCausalLMOutputWithPast(loss=loss, aux_loss=aux_loss, logits=logits, ...)`,
    children: [
        {
            id: "qwen3_moe_model",
            name: "model (Qwen3MoeModel)",
            nameZh: "主干模型",
            description: "MoE Transformer 解码器主体，与稠密模型结构相似，但 MLP 层被替换为 SparseMoeBlock",
            params: {
                "padding_idx": "config.pad_token_id",
                "vocab_size": "151936",
            },
            code: `class Qwen3MoeModel(Qwen3MoePreTrainedModel):
    def __init__(self, config: Qwen3MoeConfig):
        super().__init__(config)
        self.padding_idx = config.pad_token_id
        self.vocab_size = config.vocab_size
        
        self.embed_tokens = nn.Embedding(config.vocab_size, config.hidden_size, self.padding_idx)
        self.layers = nn.ModuleList([
            Qwen3MoeDecoderLayer(config, layer_idx) 
            for layer_idx in range(config.num_hidden_layers)
        ])
        self.norm = Qwen3MoeRMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        self.rotary_emb = Qwen3MoeRotaryEmbedding(config=config)
        self.post_init()

    @check_model_inputs
    @auto_docstring
    def forward(
        self,
        input_ids: Optional[torch.LongTensor] = None,
        attention_mask: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.LongTensor] = None,
        past_key_values: Optional[Cache] = None,
        inputs_embeds: Optional[torch.FloatTensor] = None,
        use_cache: Optional[bool] = None,
        cache_position: Optional[torch.LongTensor] = None,
        **kwargs: Unpack[TransformersKwargs],
    ) -> MoeModelOutputWithPast:
        mask_function = create_causal_mask if self.config.sliding_window is None else create_sliding_window_causal_mask
        causal_mask = mask_function(
            config=self.config,
            input_embeds=inputs_embeds,
            attention_mask=attention_mask,
            cache_position=cache_position,
            past_key_values=past_key_values,
            position_ids=position_ids,
        )

        hidden_states = inputs_embeds

        # create position embeddings to be shared across the decoder layers
        position_embeddings = self.rotary_emb(hidden_states, position_ids)

        for decoder_layer in self.layers[: self.config.num_hidden_layers]:
            hidden_states = decoder_layer(
                hidden_states,
                position_embeddings=position_embeddings,
                attention_mask=causal_mask,
                position_ids=position_ids,
                past_key_values=past_key_values,
                use_cache=use_cache,
                cache_position=cache_position,
                **kwargs,
            )

        hidden_states = self.norm(hidden_states)

        return MoeModelOutputWithPast(  # only diff with Mistral is the output type, we need MoE
            last_hidden_state=hidden_states,
            past_key_values=past_key_values,
        )`,
            children: [
                {
                    id: "moe_embed_tokens",
                    name: "embed_tokens (Embedding)",
                    nameZh: "词嵌入层",
                    description: "将 token ID 转换为稠密向量。MoE 模型通常使用较小的 hidden_size (如 2048) 以控制计算量",
                    params: {
                        "num_embeddings": "151936 (vocab_size)",
                        "embedding_dim": "2048 (hidden_size, 比稠密模型小)",
                        "padding_idx": "config.pad_token_id",
                    },
                    shapes: {
                        input: "(batch_size, seq_len) [LongTensor]",
                        output: "(batch_size, seq_len, 2048)",
                    },
                    code: `self.embed_tokens = nn.Embedding(
    config.vocab_size,      # 151936
    config.hidden_size,     # 2048 (MoE 使用更小的 hidden_size)
    self.padding_idx
)`,
                    children: [],
                },
                {
                    id: "moe_rotary_emb",
                    name: "rotary_emb (Qwen3MoeRotaryEmbedding)",
                    nameZh: "旋转位置编码",
                    description: "RoPE 位置编码，与 Qwen3 实现相同。MoE 版本使用更大的 rope_theta (1000000) 以支持长上下文",
                    params: {
                        "rope_type": '"default"',
                        "rope_theta": "1000000.0 (更大的基频支持长文本)",
                        "max_seq_len_cached": "32768 (可扩展至 1M)",
                    },
                    shapes: {
                        output: "(cos, sin) 各为 (batch_size, seq_len, head_dim)",
                    },
                    code: `class Qwen3MoeRotaryEmbedding(nn.Module):
    def __init__(self, config: Qwen3MoeConfig, device=None):
        super().__init__()
        self.rope_type = config.rope_scaling.get("rope_type", "default")
        self.max_seq_len_cached = config.max_position_embeddings
        inv_freq, self.attention_scaling = self.rope_init_fn(self.config, device)
        self.register_buffer("inv_freq", inv_freq, persistent=False)

    @torch.no_grad()
    def forward(self, x, position_ids):
        # 与 Qwen3 相同的 RoPE 计算
        freqs = (inv_freq_expanded @ position_ids_expanded).transpose(1, 2)
        emb = torch.cat((freqs, freqs), dim=-1)
        cos = emb.cos() * self.attention_scaling
        sin = emb.sin() * self.attention_scaling
        return cos.to(dtype=x.dtype), sin.to(dtype=x.dtype)`,
                    children: [],
                },
                {
                    id: "moe_layers",
                    name: "layers (ModuleList × 48)",
                    nameZh: "解码器层堆叠",
                    description: "包含 48 个 Qwen3MoeDecoderLayer。每层的 MLP 可以是 SparseMoeBlock 或普通 MLP，由 decoder_sparse_step 控制",
                    params: {
                        "num_layers": "48 (Qwen3-MoE-30B) 或 94 (Qwen3-235B)",
                        "decoder_sparse_step": "1 (每层都是 MoE)",
                    },
                    code: `self.layers = nn.ModuleList([
    Qwen3MoeDecoderLayer(config, layer_idx) 
    for layer_idx in range(config.num_hidden_layers)  # 48 layers
])

# 在 DecoderLayer 初始化时决定使用 MoE 还是普通 MLP
if (layer_idx not in config.mlp_only_layers) and \\
   (config.num_experts > 0 and (layer_idx + 1) % config.decoder_sparse_step == 0):
    self.mlp = Qwen3MoeSparseMoeBlock(config)  # MoE 层
else:
    self.mlp = Qwen3MoeMLP(config, intermediate_size=config.intermediate_size)  # 普通 MLP`,
                    children: [
                        {
                            id: "moe_decoder_layer",
                            name: "Qwen3MoeDecoderLayer",
                            nameZh: "单个 MoE 解码器层",
                            description: "与 Qwen3 解码器层类似，但 MLP 被替换为 SparseMoeBlock。输出包含 router_logits 用于辅助损失计算",
                            params: {
                                "hidden_size": "2048",
                            },
                            shapes: {
                                input: "(batch_size, seq_len, 2048)",
                                output: "(batch_size, seq_len, 2048)",
                            },
                            code: `class Qwen3MoeDecoderLayer(GradientCheckpointingLayer):
    def __init__(self, config: Qwen3MoeConfig, layer_idx: int):
        super().__init__()
        self.hidden_size = config.hidden_size
        self.self_attn = Qwen3MoeAttention(config, layer_idx)
        
        # 根据配置决定使用 MoE 或普通 MLP
        if (layer_idx not in config.mlp_only_layers) and \\
           (config.num_experts > 0 and (layer_idx + 1) % config.decoder_sparse_step == 0):
            self.mlp = Qwen3MoeSparseMoeBlock(config)  # ⭐ MoE 层
        else:
            self.mlp = Qwen3MoeMLP(config, intermediate_size=config.intermediate_size)
            
        self.input_layernorm = Qwen3MoeRMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        self.post_attention_layernorm = Qwen3MoeRMSNorm(config.hidden_size, eps=config.rms_norm_eps)

    def forward(self, hidden_states, ...):
        residual = hidden_states
        hidden_states = self.input_layernorm(hidden_states)
        hidden_states, _ = self.self_attn(hidden_states, ...)
        hidden_states = residual + hidden_states
        
        residual = hidden_states
        hidden_states = self.post_attention_layernorm(hidden_states)
        hidden_states = self.mlp(hidden_states)
        
        # MoE 层返回 tuple: (hidden_states, router_logits)
        if isinstance(hidden_states, tuple):
            hidden_states, _ = hidden_states
            
        hidden_states = residual + hidden_states
        return hidden_states`,
                            children: [
                                {
                                    id: "moe_input_layernorm",
                                    name: "input_layernorm (Qwen3MoeRMSNorm)",
                                    nameZh: "输入层归一化",
                                    description: "与 Qwen3 相同的 RMSNorm 实现",
                                    params: {
                                        "normalized_shape": "2048 (hidden_size)",
                                        "eps": "1e-6",
                                    },
                                    shapes: {
                                        input: "(batch_size, seq_len, 2048)",
                                        output: "(batch_size, seq_len, 2048)",
                                    },
                                    code: `class Qwen3MoeRMSNorm(nn.Module):
    def __init__(self, hidden_size, eps=1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(hidden_size))
        self.variance_epsilon = eps

    def forward(self, hidden_states):
        input_dtype = hidden_states.dtype
        hidden_states = hidden_states.to(torch.float32)
        variance = hidden_states.pow(2).mean(-1, keepdim=True)
        hidden_states = hidden_states * torch.rsqrt(variance + self.variance_epsilon)
        return self.weight * hidden_states.to(input_dtype)`,
                                    children: [],
                                },
                                {
                                    id: "moe_self_attn",
                                    name: "self_attn (Qwen3MoeAttention)",
                                    nameZh: "自注意力层",
                                    description: "GQA 注意力机制，使用激进的 8:1 或 16:1 的 Q:KV 头比例以减少 KV Cache 显存占用。同样具有 Q/K 归一化",
                                    params: {
                                        "num_attention_heads": "32 (Q heads)",
                                        "num_key_value_heads": "4 (KV heads, 强 GQA)",
                                        "head_dim": "64 (比稠密模型小)",
                                        "GQA_ratio": "32:4 = 8:1 (每 8 个 Q 头共享 1 个 KV 头)",
                                    },
                                    shapes: {
                                        input: "(batch_size, seq_len, 2048)",
                                        Q: "(batch_size, 32, seq_len, 64)",
                                        K: "(batch_size, 4, seq_len, 64) → 广播到 (batch_size, 32, seq_len, 64)",
                                        V: "(batch_size, 4, seq_len, 64) → 广播到 (batch_size, 32, seq_len, 64)",
                                        output: "(batch_size, seq_len, 2048)",
                                    },
                                    code: `class Qwen3MoeAttention(nn.Module):
    def __init__(self, config: Qwen3MoeConfig, layer_idx: int):
        super().__init__()
        self.head_dim = config.head_dim  # 128
        self.num_key_value_groups = config.num_attention_heads // config.num_key_value_heads  # 32/4=8
        self.scaling = self.head_dim ** -0.5  # 1/sqrt(64)
        
        # Q 投影: hidden_size → num_attention_heads * head_dim = 32 * 64 = 2048
        self.q_proj = nn.Linear(config.hidden_size, config.num_attention_heads * self.head_dim, bias=False)
        # K 投影: hidden_size → num_key_value_heads * head_dim = 4 * 64 = 256
        self.k_proj = nn.Linear(config.hidden_size, config.num_key_value_heads * self.head_dim, bias=False)
        # V 投影: hidden_size → num_key_value_heads * head_dim = 4 * 64 = 256
        self.v_proj = nn.Linear(config.hidden_size, config.num_key_value_heads * self.head_dim, bias=False)
        # O 投影: num_attention_heads * head_dim → hidden_size
        self.o_proj = nn.Linear(config.num_attention_heads * self.head_dim, config.hidden_size, bias=False)
        
        # Q/K 归一化
        self.q_norm = Qwen3MoeRMSNorm(self.head_dim, eps=config.rms_norm_eps)
        self.k_norm = Qwen3MoeRMSNorm(self.head_dim, eps=config.rms_norm_eps)

    def forward(self, hidden_states, position_embeddings, ...):
        # GQA: K/V 需要通过 repeat_kv 扩展以匹配 Q 的头数
        # 这大幅减少了 KV Cache 的显存占用（仅需 4 个 KV 头而非 32 个）
        key_states = repeat_kv(key_states, self.num_key_value_groups)  # 4 → 32
        value_states = repeat_kv(value_states, self.num_key_value_groups)
        ...`,
                                    children: [
                                        {
                                            id: "moe_q_proj",
                                            name: "q_proj (Linear)",
                                            nameZh: "Query 投影",
                                            description: "Query 投影层，输出维度 = num_attention_heads × head_dim",
                                            params: {
                                                "in_features": "2048",
                                                "out_features": "4096 (32 × 128)",
                                                "bias": "False",
                                            },
                                            shapes: {
                                                weight: "(4096, 2048)",
                                            },
                                            children: [],
                                        },
                                        {
                                            id: "moe_k_proj",
                                            name: "k_proj (Linear)",
                                            nameZh: "Key 投影",
                                            description: "Key 投影层（GQA），输出维度远小于 Q，大幅减少 KV Cache",
                                            params: {
                                                "in_features": "2048",
                                                "out_features": "512 (4 × 128)",
                                                "bias": "False",
                                            },
                                            shapes: {
                                                weight: "(512, 2048)",
                                            },
                                            children: [],
                                        },
                                        {
                                            id: "moe_v_proj",
                                            name: "v_proj (Linear)",
                                            nameZh: "Value 投影",
                                            description: "Value 投影层（GQA），与 Key 相同维度",
                                            params: {
                                                "in_features": "2048",
                                                "out_features": "512 (4 × 128)",
                                                "bias": "False",
                                            },
                                            shapes: {
                                                weight: "(512, 2048)",
                                            },
                                            children: [],
                                        },
                                        {
                                            id: "moe_o_proj",
                                            name: "o_proj (Linear)",
                                            nameZh: "输出投影",
                                            description: "注意力输出投影层",
                                            params: {
                                                "in_features": "2048",
                                                "out_features": "2048",
                                                "bias": "False",
                                            },
                                            shapes: {
                                                weight: "(2048, 2048)",
                                            },
                                            children: [],
                                        },
                                        {
                                            id: "moe_q_norm",
                                            name: "q_norm (Qwen3MoeRMSNorm)",
                                            nameZh: "Query 归一化",
                                            description: "Qwen3 特有设计：对 Query 进行 RMSNorm",
                                            params: {
                                                "normalized_shape": "128 (head_dim)",
                                                "eps": "1e-6",
                                            },
                                            children: [],
                                        },
                                        {
                                            id: "moe_k_norm",
                                            name: "k_norm (Qwen3MoeRMSNorm)",
                                            nameZh: "Key 归一化",
                                            description: "Qwen3 特有设计：对 Key 进行 RMSNorm",
                                            params: {
                                                "normalized_shape": "128 (head_dim)",
                                                "eps": "1e-6",
                                            },
                                            children: [],
                                        },
                                    ],
                                },
                                {
                                    id: "moe_post_attention_layernorm",
                                    name: "post_attention_layernorm (Qwen3MoeRMSNorm)",
                                    nameZh: "注意力后归一化",
                                    description: "自注意力层后的归一化，为 MoE 层准备输入",
                                    params: {
                                        "normalized_shape": "2048",
                                        "eps": "1e-6",
                                    },
                                    children: [],
                                },
                                {
                                    id: "moe_block",
                                    name: "mlp (Qwen3MoeSparseMoeBlock)",
                                    nameZh: "⭐ 稀疏混合专家块 (核心)",
                                    description: "MoE 核心组件！包含门控路由器和 128 个独立专家。对于每个 token，路由器选择 Top-8 个专家进行计算，其余专家不参与。这是实现稀疏激活的关键",
                                    params: {
                                        "num_experts": "128 (专家总数)",
                                        "top_k": "8 (num_experts_per_tok, 每个 token 激活的专家数)",
                                        "norm_topk_prob": "False (是否归一化 Top-K 概率)",
                                    },
                                    shapes: {
                                        input: "(batch_size, seq_len, 2048)",
                                        router_logits: "(batch_size × seq_len, 128)",
                                        expert_output: "每个专家: (num_tokens_for_expert, 2048)",
                                        output: "(batch_size, seq_len, 2048)",
                                    },
                                    code: `class Qwen3MoeSparseMoeBlock(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.num_experts = config.num_experts      # 128
        self.top_k = config.num_experts_per_tok    # 8
        self.norm_topk_prob = config.norm_topk_prob
        
        # 门控路由器: 计算每个 token 对每个专家的亲和度
        self.gate = nn.Linear(config.hidden_size, config.num_experts, bias=False)  # (2048, 128)
        
        # 128 个独立的 MLP 专家
        self.experts = nn.ModuleList([
            Qwen3MoeMLP(config, intermediate_size=config.moe_intermediate_size)
            for _ in range(self.num_experts)  # 128 个
        ])

    def forward(self, hidden_states: torch.Tensor):
        batch_size, sequence_length, hidden_dim = hidden_states.shape
        hidden_states = hidden_states.view(-1, hidden_dim)
        
        # 1. 路由计算: 获取每个 token 对 128 个专家的分数
        router_logits = self.gate(hidden_states)  # (B*S, 128)
        
        # 2. Softmax 归一化 + Top-K 选择
        routing_weights = F.softmax(router_logits, dim=1, dtype=torch.float)
        routing_weights, selected_experts = torch.topk(routing_weights, self.top_k, dim=-1)  # 选 Top-8
        
        # 3. (可选) 重新归一化 Top-K 权重
        if self.norm_topk_prob:
            routing_weights /= routing_weights.sum(dim=-1, keepdim=True)
        
        # 4. 专家计算 (仅计算被选中的专家)
        final_hidden_states = torch.zeros((batch_size * sequence_length, hidden_dim), ...)
        expert_mask = F.one_hot(selected_experts, num_classes=self.num_experts).permute(2, 1, 0)
        
        # 遍历被命中的专家
        expert_hit = torch.greater(expert_mask.sum(dim=(-1, -2)), 0).nonzero()
        for expert_idx in expert_hit:
            expert_layer = self.experts[expert_idx]
            idx, top_x = torch.where(expert_mask[expert_idx].squeeze(0))
            current_state = hidden_states[None, top_x].reshape(-1, hidden_dim)
            current_hidden_states = expert_layer(current_state) * routing_weights[top_x, idx, None]
            final_hidden_states.index_add_(0, top_x, current_hidden_states)
        
        return final_hidden_states.reshape(batch_size, sequence_length, hidden_dim), router_logits`,
                                    children: [
                                        {
                                            id: "moe_gate",
                                            name: "gate (Linear)",
                                            nameZh: "门控路由器",
                                            description: "核心路由层！将每个 token 的隐藏状态映射到 128 维的专家亲和度分数。通过 Softmax + Top-K 选择激活哪些专家",
                                            params: {
                                                "in_features": "2048 (hidden_size)",
                                                "out_features": "128 (num_experts)",
                                                "bias": "False",
                                            },
                                            shapes: {
                                                weight: "(128, 2048)",
                                                input: "(batch_size × seq_len, 2048)",
                                                output: "(batch_size × seq_len, 128) [logits]",
                                            },
                                            code: `self.gate = nn.Linear(config.hidden_size, config.num_experts, bias=False)

# 路由计算流程
router_logits = self.gate(hidden_states)  # (B*S, 128)

# Softmax 获取概率分布
routing_weights = F.softmax(router_logits, dim=1, dtype=torch.float)

# Top-K 选择: 每个 token 选 8 个专家
routing_weights, selected_experts = torch.topk(routing_weights, self.top_k, dim=-1)
# routing_weights: (B*S, 8) 被选中专家的权重
# selected_experts: (B*S, 8) 被选中专家的索引 (0-127)`,
                                            children: [],
                                        },
                                        {
                                            id: "moe_experts",
                                            name: "experts (ModuleList × 128)",
                                            nameZh: "专家网络集合",
                                            description: "包含 128 个独立的 Qwen3MoeMLP 专家网络。每个专家使用较小的 intermediate_size (768)，但专家总数很多，实现参数换智能",
                                            params: {
                                                "num_experts": "128",
                                                "moe_intermediate_size": "768 (很小！仅为稠密模型 22016 的 3.5%)",
                                                "total_expert_params": "128 × 3 × 2048 × 768 ≈ 6億参数",
                                            },
                                            shapes: {
                                                single_expert_input: "(num_tokens_for_this_expert, 2048)",
                                                single_expert_output: "(num_tokens_for_this_expert, 2048)",
                                            },
                                            code: `self.experts = nn.ModuleList([
    Qwen3MoeMLP(config, intermediate_size=config.moe_intermediate_size)
    for _ in range(self.num_experts)  # 128 个专家
])

# 每个专家是一个完整的 SwiGLU MLP
# 但 intermediate_size 只有 768 (vs 稠密模型的 22016)`,
                                            children: [
                                                {
                                                    id: "single_expert",
                                                    name: "Qwen3MoeMLP (单个专家)",
                                                    nameZh: "单个专家 MLP",
                                                    description: "细粒度专家网络，结构与 Qwen3MLP 相同，但中间维度极小 (768)。8 个专家的总计算量 ≈ 1 个大 MLP",
                                                    params: {
                                                        "hidden_size": "2048",
                                                        "intermediate_size": "768 (moe_intermediate_size)",
                                                        "hidden_act": "silu",
                                                    },
                                                    shapes: {
                                                        input: "(N, 2048)",
                                                        intermediate: "(N, 768)",
                                                        output: "(N, 2048)",
                                                    },
                                                    code: `class Qwen3MoeMLP(nn.Module):
    def __init__(self, config, intermediate_size=None):
        super().__init__()
        self.hidden_size = config.hidden_size  # 2048
        self.intermediate_size = intermediate_size if intermediate_size else config.intermediate_size
        # 对于 MoE 专家: intermediate_size = 768
        
        self.gate_proj = nn.Linear(self.hidden_size, self.intermediate_size, bias=False)  # (2048, 768)
        self.up_proj = nn.Linear(self.hidden_size, self.intermediate_size, bias=False)    # (2048, 768)
        self.down_proj = nn.Linear(self.intermediate_size, self.hidden_size, bias=False)  # (768, 2048)
        self.act_fn = ACT2FN[config.hidden_act]  # SiLU

    def forward(self, x):
        # SwiGLU: down_proj(act(gate_proj(x)) * up_proj(x))
        down_proj = self.down_proj(self.act_fn(self.gate_proj(x)) * self.up_proj(x))
        return down_proj
        
# 参数量计算 (单个专家):
# gate_proj: 2048 × 768 = 1,572,864
# up_proj:   2048 × 768 = 1,572,864
# down_proj: 768 × 2048 = 1,572,864
# 单专家总计: ~4.7M 参数
# 128 专家总计: ~600M 参数/层`,
                                                    children: [
                                                        {
                                                            id: "expert_gate_proj",
                                                            name: "gate_proj (Linear)",
                                                            nameZh: "专家门控投影",
                                                            params: {
                                                                "in_features": "2048",
                                                                "out_features": "768",
                                                            },
                                                            children: [],
                                                        },
                                                        {
                                                            id: "expert_up_proj",
                                                            name: "up_proj (Linear)",
                                                            nameZh: "专家上投影",
                                                            params: {
                                                                "in_features": "2048",
                                                                "out_features": "768",
                                                            },
                                                            children: [],
                                                        },
                                                        {
                                                            id: "expert_down_proj",
                                                            name: "down_proj (Linear)",
                                                            nameZh: "专家下投影",
                                                            params: {
                                                                "in_features": "768",
                                                                "out_features": "2048",
                                                            },
                                                            children: [],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "moe_final_norm",
                    name: "norm (Qwen3MoeRMSNorm)",
                    nameZh: "最终归一化层",
                    description: "所有解码器层后的最终归一化",
                    params: {
                        "normalized_shape": "2048",
                        "eps": "1e-6",
                    },
                    children: [],
                },
            ],
        },
        {
            id: "moe_lm_head",
            name: "lm_head (Linear)",
            nameZh: "语言模型头",
            description: "将隐藏状态映射到词表 logits",
            params: {
                "in_features": "2048 (hidden_size)",
                "out_features": "151936 (vocab_size)",
                "bias": "False",
            },
            shapes: {
                weight: "(151936, 2048)",
                input: "(batch_size, seq_len, 2048)",
                output: "(batch_size, seq_len, 151936) [logits]",
            },
            children: [],
        },
    ],
};

// Load Balancing Loss Function (辅助损失)
export const loadBalancingLossCode = `def load_balancing_loss_func(
    gate_logits: Union[torch.Tensor, tuple[torch.Tensor], None],
    num_experts: Optional[int] = None,
    top_k=2,
    attention_mask: Optional[torch.Tensor] = None,
) -> Union[torch.Tensor, int]:
    """
    Switch Transformer 负载均衡损失
    目的: 防止路由崩塌 (所有 token 都选同样几个专家)
    """
    if gate_logits is None or not isinstance(gate_logits, tuple):
        return 0
    
    # 合并所有层的 router logits
    concatenated_gate_logits = torch.cat([layer_gate for layer_gate in gate_logits], dim=0)
    routing_weights = F.softmax(concatenated_gate_logits, dim=-1)
    _, selected_experts = torch.topk(routing_weights, top_k, dim=-1)
    expert_mask = F.one_hot(selected_experts, num_experts)
    
    # 计算每个专家处理的 token 比例
    tokens_per_expert = torch.mean(expert_mask.float(), dim=0)
    
    # 计算路由到每个专家的平均概率
    router_prob_per_expert = torch.mean(routing_weights, dim=0)
    
    # 损失 = sum(tokens_per_expert * router_prob_per_expert) * num_experts
    # 鼓励均匀分布
    overall_loss = torch.sum(tokens_per_expert * router_prob_per_expert.unsqueeze(0))
    return overall_loss * num_experts`;

export default qwen3MoeArchitecture;
