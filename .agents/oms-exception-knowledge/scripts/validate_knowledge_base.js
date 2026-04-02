#!/usr/bin/env node

/**
 * 知识库校验脚本
 *
 * 校验 knowledge-store.json 中所有知识原子的结构一致性。
 * 用法: node scripts/validate_knowledge_base.js [--json-path <path>]
 *
 * 校验项:
 * 1. atom_id 格式和唯一性
 * 2. domain 在标准列表中
 * 3. recommended_actions 在标准列表中
 * 4. confidence 和 probability 在 [0, 1] 范围内
 * 5. symptom_signals 非空且使用英文
 * 6. 必填字段完整性
 */

const fs = require("fs");
const path = require("path");

// 标准业务域
const VALID_DOMAINS = [
  "ORDER_CREATE", "ORDER_DISPATCH", "ORDER_UPDATE", "ORDER_CANCEL",
  "ORDER_HOLD", "ORDER_WMS_SYNC", "ORDER_FULFILLMENT", "ORDER_DELIVERY",
  "ORDER_RETURN", "ORDER_EXCHANGE", "ORDER_MERGE", "ORDER_PO",
  "ORDER_WORK_ORDER", "SHIPMENT", "INVENTORY_SYNC", "INVENTORY_ALLOCATION",
  "ITEM_SYNC", "ITEM_PUBLISH", "CHANNEL_INTEGRATION", "NOTIFICATION",
  "RATE_SHOPPING", "CUSTOMS", "SYSTEM", "UNKNOWN",
];

// 标准动作编码
const VALID_ACTION_CODES = [
  "RETRY_WITH_BACKOFF", "RETRY_IMMEDIATE", "MAP_ITEM_ID",
  "SYNC_ITEM_MASTER", "RESYNC_ORDER", "RESYNC_INVENTORY",
  "RECALCULATE_INVENTORY", "REFRESH_CHANNEL_TOKEN",
  "REPUBLISH_TO_CHANNEL", "NOTIFY_MERCHANT", "CANCEL_AND_RECREATE",
  "ESCALATE_TO_ENGINEERING", "ESCALATE_TO_OPS", "MANUAL_DATA_FIX",
  "CONTACT_CHANNEL_SUPPORT", "REVIEW_BUSINESS_RULE",
  "CHECK_THIRD_PARTY_STATUS",
];

function validate(jsonPath) {
  const errors = [];
  const warnings = [];

  // 读取 JSON 文件
  let data;
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    data = JSON.parse(raw);
  } catch (e) {
    return { valid: false, errors: [`无法读取或解析文件: ${e.message}`], warnings: [] };
  }

  const atoms = data.atoms || [];
  const seenIds = new Set();

  atoms.forEach((atom, idx) => {
    const prefix = `atoms[${idx}] (${atom.atom_id || "NO_ID"})`;

    // 1. atom_id 格式
    if (!atom.atom_id) {
      errors.push(`${prefix}: 缺少 atom_id`);
    } else {
      if (!/^KA-[A-Z_]+-\d{3,}$/.test(atom.atom_id)) {
        errors.push(`${prefix}: atom_id 格式不符合 KA-{DOMAIN}-{SEQ}`);
      }
      if (seenIds.has(atom.atom_id)) {
        errors.push(`${prefix}: atom_id 重复`);
      }
      seenIds.add(atom.atom_id);
    }

    // 2. domain
    if (!atom.domain) {
      errors.push(`${prefix}: 缺少 domain`);
    } else if (!VALID_DOMAINS.includes(atom.domain)) {
      errors.push(`${prefix}: domain "${atom.domain}" 不在标准列表中`);
    }

    // 3. symptom_signals
    if (!atom.symptom_signals || !Array.isArray(atom.symptom_signals)) {
      errors.push(`${prefix}: 缺少 symptom_signals`);
    } else if (atom.symptom_signals.length === 0) {
      errors.push(`${prefix}: symptom_signals 为空数组`);
    } else {
      // 检查是否包含中文（警告）
      atom.symptom_signals.forEach((sig) => {
        if (/[\u4e00-\u9fff]/.test(sig)) {
          warnings.push(`${prefix}: symptom_signal "${sig}" 包含中文，建议使用英文 OMS 术语`);
        }
      });
    }

    // 4. recommended_actions
    if (atom.recommended_actions && Array.isArray(atom.recommended_actions)) {
      atom.recommended_actions.forEach((code) => {
        if (!VALID_ACTION_CODES.includes(code)) {
          errors.push(`${prefix}: action_code "${code}" 不在标准列表中`);
        }
      });
    }

    // 5. confidence
    if (atom.confidence !== undefined) {
      if (typeof atom.confidence !== "number" || atom.confidence < 0 || atom.confidence > 1) {
        errors.push(`${prefix}: confidence ${atom.confidence} 不在 [0, 1] 范围内`);
      }
    }

    // 6. likely_root_causes probability
    if (atom.likely_root_causes && Array.isArray(atom.likely_root_causes)) {
      atom.likely_root_causes.forEach((rc, rcIdx) => {
        if (rc.probability !== undefined) {
          if (typeof rc.probability !== "number" || rc.probability < 0 || rc.probability > 1) {
            errors.push(`${prefix}: root_causes[${rcIdx}].probability ${rc.probability} 不在 [0, 1] 范围内`);
          }
        }
      });
    }

    // 7. version
    if (atom.version !== undefined && (typeof atom.version !== "number" || atom.version < 1)) {
      errors.push(`${prefix}: version 必须 >= 1`);
    }
  });

  // 元数据校验
  if (data.metadata) {
    if (data.metadata.total_count !== atoms.length) {
      warnings.push(`metadata.total_count (${data.metadata.total_count}) 与实际原子数 (${atoms.length}) 不一致`);
    }
  }

  return {
    valid: errors.length === 0,
    total_atoms: atoms.length,
    domains_covered: [...new Set(atoms.map((a) => a.domain))].sort(),
    errors,
    warnings,
  };
}

// CLI 入口
const args = process.argv.slice(2);
let jsonPath = path.resolve(__dirname, "../../data/knowledge-store.json");

const pathIdx = args.indexOf("--json-path");
if (pathIdx !== -1 && args[pathIdx + 1]) {
  jsonPath = path.resolve(args[pathIdx + 1]);
}

console.log(`校验文件: ${jsonPath}\n`);

const result = validate(jsonPath);

// 输出报告
console.log(`状态: ${result.valid ? "✅ 通过" : "❌ 失败"}`);
console.log(`原子总数: ${result.total_atoms}`);
console.log(`覆盖域: ${result.domains_covered?.join(", ")}`);

if (result.errors.length > 0) {
  console.log(`\n错误 (${result.errors.length}):`);
  result.errors.forEach((e) => console.log(`  ❌ ${e}`));
}

if (result.warnings.length > 0) {
  console.log(`\n警告 (${result.warnings.length}):`);
  result.warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
}

// 写入报告 JSON
const reportPath = path.resolve(__dirname, "validation-report.json");
fs.writeFileSync(reportPath, JSON.stringify(result, null, 2), "utf-8");
console.log(`\n报告已写入: ${reportPath}`);

process.exit(result.valid ? 0 : 1);
