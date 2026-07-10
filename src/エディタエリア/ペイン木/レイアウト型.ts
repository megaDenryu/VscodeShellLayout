// ペイン木の不変表現。型と Newtype のみ。実装ロジックや副作用は持たない。
// 不変再帰木 + 判別共用体。フィールド共有を避けるため kind で完全分離する。
// タブのコンテンツ実体は LV2 オーケストレータ側の Map<タブID, HtmlComponentBase> が保持し、
// 純関数群を DOM 非依存に保つ。

export type ペインID = string & { readonly __ペインID: unique symbol };
export type タブID = string & { readonly __タブID: unique symbol };

export function ペインIDを作る(値: string): ペインID {
    return 値 as ペインID;
}

export function タブIDを作る(値: string): タブID {
    return 値 as タブID;
}

export interface タブ定義 {
    readonly id: タブID;
    readonly ラベル: string;
    readonly 閉じれる: boolean;
}

export type ペイン = タブ群ペイン | 左右分割ペイン | 上下分割ペイン;

export interface タブ群ペイン {
    readonly kind: "タブ群";
    readonly id: ペインID;
    readonly タブ一覧: readonly タブ定義[];
    // タブ一覧が空なら null。タブ追加時に最初のタブを自動選択する責務は適用() 側。
    readonly 選択中: タブID | null;
}

export interface 左右分割ペイン {
    readonly kind: "左右分割";
    readonly id: ペインID;
    readonly 左: ペイン;
    readonly 右: ペイン;
    // 0.0〜1.0 の範囲。左ペインの幅比率。
    readonly 比率: number;
}

export interface 上下分割ペイン {
    readonly kind: "上下分割";
    readonly id: ペインID;
    readonly 上: ペイン;
    readonly 下: ペイン;
    // 0.0〜1.0 の範囲。上ペインの高さ比率。
    readonly 比率: number;
}

export interface レイアウト {
    readonly メインペイン: ペイン;
}

// =============================================================================
// ID 一意性に関する責務境界
//
// 純核は ID 一意性を検証しない。検証を入れると毎操作で全ペインID走査が必要で性能劣化、
// 一意性違反は呼び出し側 (LV2 オーケストレータ) の ID 採番バグでしか起きない。
// 呼び出し側は採番器 (モノトニック増加カウンタ等) で発行する責務を負う。
// =============================================================================

export type レイアウト操作 =
    | { readonly kind: "タブ追加"; readonly タブ: タブ定義; readonly 配置先ペイン: ペインID }
    | { readonly kind: "タブ閉じる"; readonly タブ: タブID }
    | { readonly kind: "タブ選択"; readonly タブ: タブID }
    | {
        readonly kind: "タブ移動";
        readonly タブ: タブID;
        readonly 移動先ペイン: ペインID;
        // 0 なら先頭、移動先タブ数なら末尾、それ以外は途中挿入。
        readonly 挿入位置: number;
    }
    | {
        readonly kind: "タブ→新ペイン分割";
        readonly タブ: タブID;
        readonly 分割対象: ペインID;
        readonly 方向: "左" | "右" | "上" | "下";
        // 元タブ群 ID と分割ペイン ID を流用すると親子で同一 ID が重複し、
        // ペイン探索が常に親を返して元タブ群への操作が破綻する。呼び出し側で別 ID を発行する。
        readonly 新タブ群ペインID: ペインID;
        readonly 新分割ペインID: ペインID;
    }
    | {
        readonly kind: "ペイン比率変更";
        readonly ペイン: ペインID;
        readonly 新比率: number;
    };

export type 適用結果 =
    | { readonly kind: "成功"; readonly 新レイアウト: レイアウト }
    | { readonly kind: "失敗"; readonly 理由: 失敗理由 };

export type 失敗理由 =
    | { readonly kind: "タブが存在しない"; readonly タブ: タブID }
    | { readonly kind: "ペインが存在しない"; readonly ペイン: ペインID }
    | { readonly kind: "比率が範囲外"; readonly 値: number }
    | { readonly kind: "挿入位置が範囲外"; readonly 値: number; readonly 上限: number }
    | { readonly kind: "閉じれないタブを閉じようとした"; readonly タブ: タブID };

export function 空レイアウト(初期ペインID: ペインID): レイアウト {
    return {
        メインペイン: {
            kind: "タブ群",
            id: 初期ペインID,
            タブ一覧: [],
            選択中: null,
        },
    };
}
