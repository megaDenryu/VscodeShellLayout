// 左右分割/上下分割ペインの DOM 構築。DOM同期.ts から責務分割で切り出した。
// 子ペインの再帰構築は DOM同期.ts の ペインを構築 に依存するため循環 import を避けるべく
// 引数として受け取る（DOM同期.ts → 本ファイルの一方向 import に保つ）。

import { div, type DivC } from "sengen-ui";
import type { ペイン, ペインID } from "./レイアウト型";
import { ペインID属性, type DOM同期コンテキスト } from "./DOM同期";
import * as styles from "./style.css";

type ペイン構築関数 = (対象ペイン: ペイン, コンテキスト: DOM同期コンテキスト) => DivC;

export function 左右分割ペインを構築(
    対象ペイン: Extract<ペイン, { kind: "左右分割" }>,
    コンテキスト: DOM同期コンテキスト,
    ペインを構築: ペイン構築関数,
): DivC {
    const 左 = ペインを構築(対象ペイン.左, コンテキスト).setStyleCSS({ flex: `${対象ペイン.比率} 0 0` });
    const 右 = ペインを構築(対象ペイン.右, コンテキスト).setStyleCSS({ flex: `${1 - 対象ペイン.比率} 0 0` });
    return (
        div({ class: styles.左右分割 })
            .setAttribute(ペインID属性, 対象ペイン.id)
            .childs([
                左,
                div({ class: styles.スプリッター垂直 })
                    .addTypedEventListener("pointerdown", (e: PointerEvent) => {
                        e.preventDefault();
                        コンテキスト.スプリッター押下(対象ペイン.id, "垂直", { x: e.clientX, y: e.clientY });
                    }),
                右])
    );
}

export function 上下分割ペインを構築(
    対象ペイン: Extract<ペイン, { kind: "上下分割" }>,
    コンテキスト: DOM同期コンテキスト,
    ペインを構築: ペイン構築関数,
): DivC {
    const 上 = ペインを構築(対象ペイン.上, コンテキスト).setStyleCSS({ flex: `${対象ペイン.比率} 0 0` });
    const 下 = ペインを構築(対象ペイン.下, コンテキスト).setStyleCSS({ flex: `${1 - 対象ペイン.比率} 0 0` });
    return (
        div({ class: styles.上下分割 })
            .setAttribute(ペインID属性, 対象ペイン.id)
            .childs([
                上,
                div({ class: styles.スプリッター水平 })
                    .addTypedEventListener("pointerdown", (e: PointerEvent) => {
                        e.preventDefault();
                        コンテキスト.スプリッター押下(対象ペイン.id, "水平", { x: e.clientX, y: e.clientY });
                    }),
                下])
    );
}
