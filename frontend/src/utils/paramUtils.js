/**
 * 参数量计算工具函数
 * 用于计算和格式化 Qwen3/Qwen3-MoE 模型各模块的参数量
 */

/**
 * 格式化参数数量为可读字符串
 * @param {number} count - 参数数量
 * @returns {string} - 格式化后的字符串 (如 "622M", "7.8B")
 */
export function formatParamCount(count) {
    if (count === 0) return '0';
    if (count === null || count === undefined) return '-';

    const absCount = Math.abs(count);

    if (absCount >= 1e9) {
        return (count / 1e9).toFixed(2) + 'B';
    } else if (absCount >= 1e6) {
        return (count / 1e6).toFixed(2) + 'M';
    } else if (absCount >= 1e3) {
        return (count / 1e3).toFixed(2) + 'K';
    }
    return count.toString();
}

/**
 * 计算参数占比
 * @param {number} partCount - 部分参数量
 * @param {number} totalCount - 总参数量
 * @returns {string} - 百分比字符串 (如 "27.5%")
 */
export function calculateParamRatio(partCount, totalCount) {
    if (!totalCount || totalCount === 0) return '0%';
    const ratio = (partCount / totalCount) * 100;
    if (ratio < 0.01) return '<0.01%';
    if (ratio < 1) return ratio.toFixed(2) + '%';
    return ratio.toFixed(1) + '%';
}

/**
 * 计算 Qwen3 Dense 模型各模块参数量
 * @param {Object} config - 模型配置
 * @returns {Object} - 各模块参数量详情
 */
export function calculateQwen3Params(config) {
    const c = {
        vocab_size: config?.vocab_size || config?.defaultParams?.vocab_size || 151936,
        hidden_size: config?.hidden_size || config?.defaultParams?.hidden_size || 4096,
        intermediate_size: config?.intermediate_size || config?.defaultParams?.intermediate_size || 12288,
        num_hidden_layers: config?.num_hidden_layers || config?.defaultParams?.num_hidden_layers || 36,
        num_attention_heads: config?.num_attention_heads || config?.defaultParams?.num_attention_heads || 32,
        num_key_value_heads: config?.num_key_value_heads || config?.defaultParams?.num_key_value_heads || 8,
        head_dim: config?.head_dim || config?.defaultParams?.head_dim || 128,
    };

    // Embedding 层
    const embed_tokens = c.vocab_size * c.hidden_size;

    // Attention 各投影层 (每层)
    const q_proj = c.hidden_size * (c.num_attention_heads * c.head_dim);
    const k_proj = c.hidden_size * (c.num_key_value_heads * c.head_dim);
    const v_proj = c.hidden_size * (c.num_key_value_heads * c.head_dim);
    const o_proj = (c.num_attention_heads * c.head_dim) * c.hidden_size;

    // Q/K Norm (每层)
    const q_norm = c.head_dim;
    const k_norm = c.head_dim;

    // MLP 各层 (每层)
    const gate_proj = c.hidden_size * c.intermediate_size;
    const up_proj = c.hidden_size * c.intermediate_size;
    const down_proj = c.intermediate_size * c.hidden_size;

    // RMSNorm (每层 2 个 + 最终 1 个)
    const input_layernorm = c.hidden_size;
    const post_attention_layernorm = c.hidden_size;
    const final_norm = c.hidden_size;

    // LM Head (可能与 embed_tokens 共享)
    const lm_head = c.hidden_size * c.vocab_size;
    const lm_head_tied = true; // Qwen3 默认共享权重

    // 单层汇总
    const attention_per_layer = q_proj + k_proj + v_proj + o_proj + q_norm + k_norm;
    const mlp_per_layer = gate_proj + up_proj + down_proj;
    const norm_per_layer = input_layernorm + post_attention_layernorm;
    const layer_total = attention_per_layer + mlp_per_layer + norm_per_layer;

    // 全模型汇总
    const all_layers = layer_total * c.num_hidden_layers;
    const total = embed_tokens + all_layers + final_norm + lm_head;

    return {
        config: c,
        embedding: {
            embed_tokens,
            total: embed_tokens,
        },
        attention: {
            q_proj,
            k_proj,
            v_proj,
            o_proj,
            q_norm,
            k_norm,
            total_per_layer: attention_per_layer,
            total_all_layers: attention_per_layer * c.num_hidden_layers,
        },
        mlp: {
            gate_proj,
            up_proj,
            down_proj,
            total_per_layer: mlp_per_layer,
            total_all_layers: mlp_per_layer * c.num_hidden_layers,
        },
        norm: {
            input_layernorm,
            post_attention_layernorm,
            final_norm,
            total_per_layer: norm_per_layer,
            total_all_layers: norm_per_layer * c.num_hidden_layers + final_norm,
        },
        lm_head: {
            params: lm_head,
            tied: lm_head_tied,
            effective: lm_head_tied ? 0 : lm_head,
        },
        layer_total,
        active_layer_total: layer_total,
        all_layers,
        total,
    };
}

/**
 * 计算 Qwen3-MoE 模型各模块参数量
 * @param {Object} config - 模型配置
 * @returns {Object} - 各模块参数量详情
 */
export function calculateQwen3MoeParams(config) {
    const c = {
        vocab_size: config?.vocab_size || config?.defaultParams?.vocab_size || 151936,
        hidden_size: config?.hidden_size || config?.defaultParams?.hidden_size || 2048,
        intermediate_size: config?.intermediate_size || config?.defaultParams?.intermediate_size || 6144,
        moe_intermediate_size: config?.moe_intermediate_size || config?.defaultParams?.moe_intermediate_size || 768,
        num_hidden_layers: config?.num_hidden_layers || config?.defaultParams?.num_hidden_layers || 48,
        num_attention_heads: config?.num_attention_heads || config?.defaultParams?.num_attention_heads || 32,
        num_key_value_heads: config?.num_key_value_heads || config?.defaultParams?.num_key_value_heads || 4,
        head_dim: config?.head_dim || config?.defaultParams?.head_dim || 128,
        num_experts: config?.num_experts || config?.defaultParams?.num_experts || 128,
        num_experts_per_tok: config?.num_experts_per_tok || config?.defaultParams?.num_experts_per_tok || 8,
        decoder_sparse_step: config?.decoder_sparse_step || config?.defaultParams?.decoder_sparse_step || 1,
    };

    // Embedding 层
    const embed_tokens = c.vocab_size * c.hidden_size;

    // Attention 各投影层 (每层)
    const q_proj = c.hidden_size * (c.num_attention_heads * c.head_dim);
    const k_proj = c.hidden_size * (c.num_key_value_heads * c.head_dim);
    const v_proj = c.hidden_size * (c.num_key_value_heads * c.head_dim);
    const o_proj = (c.num_attention_heads * c.head_dim) * c.hidden_size;

    // Q/K Norm (每层)
    const q_norm = c.head_dim;
    const k_norm = c.head_dim;

    // MoE Router (每 MoE 层)
    const router_gate = c.hidden_size * c.num_experts;

    // 单个专家 MLP
    const expert_gate_proj = c.hidden_size * c.moe_intermediate_size;
    const expert_up_proj = c.hidden_size * c.moe_intermediate_size;
    const expert_down_proj = c.moe_intermediate_size * c.hidden_size;
    const single_expert_params = expert_gate_proj + expert_up_proj + expert_down_proj;

    // 所有专家
    const all_experts = single_expert_params * c.num_experts;

    // MoE 块总计
    const moe_block_total = router_gate + all_experts;

    // 激活参数 (每次推理只激活 top-k 专家)
    const active_expert_params = single_expert_params * c.num_experts_per_tok;

    // RMSNorm (每层)
    const input_layernorm = c.hidden_size;
    const post_attention_layernorm = c.hidden_size;
    const final_norm = c.hidden_size;

    // LM Head
    const lm_head = c.hidden_size * c.vocab_size;
    const lm_head_tied = true;

    // 单层汇总
    const attention_per_layer = q_proj + k_proj + v_proj + o_proj + q_norm + k_norm;
    const norm_per_layer = input_layernorm + post_attention_layernorm;
    const layer_total = attention_per_layer + moe_block_total + norm_per_layer;

    // 全模型汇总
    // 全模型汇总 (Including LM Head even if tied, matching user report total of ~30.5B)
    const all_layers = layer_total * c.num_hidden_layers;
    const total = embed_tokens + all_layers + final_norm + lm_head;

    // 激活参数汇总 (Include LM Head in active params)
    const active_layer_total = attention_per_layer + router_gate + active_expert_params + norm_per_layer;
    const active_total = embed_tokens + active_layer_total * c.num_hidden_layers + final_norm + lm_head;

    return {
        config: c,
        embedding: {
            embed_tokens,
            total: embed_tokens,
        },
        attention: {
            q_proj,
            k_proj,
            v_proj,
            o_proj,
            q_norm,
            k_norm,
            total_per_layer: attention_per_layer,
            total_all_layers: attention_per_layer * c.num_hidden_layers,
        },
        moe: {
            router_gate,
            single_expert: single_expert_params,
            all_experts,
            moe_block_total,
            active_per_layer: router_gate + active_expert_params,
            expert_breakdown: {
                gate_proj: expert_gate_proj,
                up_proj: expert_up_proj,
                down_proj: expert_down_proj,
            },
        },
        norm: {
            input_layernorm,
            post_attention_layernorm,
            final_norm,
            total_per_layer: norm_per_layer,
            total_all_layers: norm_per_layer * c.num_hidden_layers + final_norm,
        },
        lm_head: {
            params: lm_head,
            tied: lm_head_tied,
            effective: lm_head_tied ? 0 : lm_head,
        },
        layer_total,
        active_layer_total,
        all_layers,
        total,
        active_total,
    };
}

/**
 * 获取模块的颜色强度（基于参数占比）
 * @param {number} ratio - 参数占比 (0-1)
 * @returns {number} - 透明度 (0.1-0.5)
 */
export function getParamColorIntensity(ratio) {
    return Math.min(0.5, Math.max(0.1, ratio * 2 + 0.1));
}

export default {
    formatParamCount,
    calculateParamRatio,
    calculateQwen3Params,
    calculateQwen3MoeParams,
    getParamColorIntensity,
};
