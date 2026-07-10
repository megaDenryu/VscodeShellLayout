import { div, button, DivC, ButtonC } from "sengen-ui";

export interface タブ項目 {
    id: string;
    ラベル: string;
}

interface タブ状態定義 {
    attribute: string;
    value: { active: string; inactive: string };
}

// =============================================================================
// 純粋関数コンポーネント群
// =============================================================================

export function タブバーView(
    タブ一覧: タブ項目[],
    バークラス: string,
    タブクラス: string,
    状態: タブ状態定義,
    on選択: (id: string) => void,
    タブ参照登録: (id: string, 要素: ButtonC) => void,
): DivC {
    return (
        div({ class: バークラス }).childs(
            タブ一覧.map(該当タブ => {
                const タブ要素 = button({ text: 該当タブ.ラベル, class: タブクラス })
                    .setAttribute(状態.attribute, 状態.value.inactive)
                    .onClick(() => on選択(該当タブ.id));
                タブ参照登録(該当タブ.id, タブ要素);
                return タブ要素;
            }))
    );
}
