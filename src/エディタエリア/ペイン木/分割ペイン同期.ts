// 左右分割/上下分割ペインの DOM 構築/差分同期。DOM同期.ts から責務分割で切り出した。
// 子ペインの再帰同期は DOM同期.ts の ペインを同期 に依存するため循環 import を避けるべく
// 引数として受け取る(DOM同期.ts → 本ファイルの一方向 import に保つ)。
//
// 左右(上下)どちらの子も参照が不変な限り DOM には一切触れない。子の一方だけ差し替えが
// 必要になったときだけ、その子の DOM 要素だけを付け替える(もう一方は無傷のまま)。

import { div, type DivC } from "sengen-ui";
import { ペインID属性, type DOM同期コンテキスト } from "./DOM同期";
import type { ペイン, 上下分割ペイン, 左右分割ペイン } from "./レイアウト型";
import type { 構築済み上下分割, 構築済み左右分割, 構築済みペイン } from "./構築済みペイン";
import * as styles from "./style.css";

type ペイン同期関数 = (新: ペイン, 旧: 構築済みペイン | null, コンテキスト: DOM同期コンテキスト) => 構築済みペイン;

export function 左右分割を同期(
    新: 左右分割ペイン,
    旧: 構築済み左右分割 | null,
    コンテキスト: DOM同期コンテキスト,
    ペインを同期: ペイン同期関数,
): 構築済み左右分割 {
    if (旧 === null) return 左右分割を新規構築(新, コンテキスト, ペインを同期);

    const 新左 = ペインを同期(新.左, 旧.左, コンテキスト);
    const 新右 = ペインを同期(新.右, 旧.右, コンテキスト);
    新左.要素.setStyleCSS({ flex: `${新.比率} 0 0` });
    新右.要素.setStyleCSS({ flex: `${1 - 新.比率} 0 0` });
    if (新左.要素 !== 旧.左.要素) {
        旧.要素.removeChild(旧.左.要素).insertChildAt(0, 新左.要素);
    }
    if (新右.要素 !== 旧.右.要素) {
        旧.要素.removeChild(旧.右.要素).child(新右.要素);
    }

    return { kind: "左右分割", ペイン: 新, 要素: 旧.要素, スプリッター: 旧.スプリッター, 左: 新左, 右: 新右 };
}

function 左右分割を新規構築(
    新: 左右分割ペイン,
    コンテキスト: DOM同期コンテキスト,
    ペインを同期: ペイン同期関数,
): 構築済み左右分割 {
    const 左 = ペインを同期(新.左, null, コンテキスト);
    const 右 = ペインを同期(新.右, null, コンテキスト);
    左.要素.setStyleCSS({ flex: `${新.比率} 0 0` });
    右.要素.setStyleCSS({ flex: `${1 - 新.比率} 0 0` });
    const スプリッター = div({ class: styles.スプリッター垂直 })
        .addTypedEventListener("pointerdown", (e: PointerEvent) => {
            e.preventDefault();
            コンテキスト.スプリッター押下(新.id, "垂直", { x: e.clientX, y: e.clientY });
        });
    const 要素 = div({ class: styles.左右分割 })
        .setAttribute(ペインID属性, 新.id)
        .childs([左.要素, スプリッター, 右.要素]);
    return { kind: "左右分割", ペイン: 新, 要素, スプリッター, 左, 右 };
}

export function 上下分割を同期(
    新: 上下分割ペイン,
    旧: 構築済み上下分割 | null,
    コンテキスト: DOM同期コンテキスト,
    ペインを同期: ペイン同期関数,
): 構築済み上下分割 {
    if (旧 === null) return 上下分割を新規構築(新, コンテキスト, ペインを同期);

    const 新上 = ペインを同期(新.上, 旧.上, コンテキスト);
    const 新下 = ペインを同期(新.下, 旧.下, コンテキスト);
    新上.要素.setStyleCSS({ flex: `${新.比率} 0 0` });
    新下.要素.setStyleCSS({ flex: `${1 - 新.比率} 0 0` });
    if (新上.要素 !== 旧.上.要素) {
        旧.要素.removeChild(旧.上.要素).insertChildAt(0, 新上.要素);
    }
    if (新下.要素 !== 旧.下.要素) {
        旧.要素.removeChild(旧.下.要素).child(新下.要素);
    }

    return { kind: "上下分割", ペイン: 新, 要素: 旧.要素, スプリッター: 旧.スプリッター, 上: 新上, 下: 新下 };
}

function 上下分割を新規構築(
    新: 上下分割ペイン,
    コンテキスト: DOM同期コンテキスト,
    ペインを同期: ペイン同期関数,
): 構築済み上下分割 {
    const 上 = ペインを同期(新.上, null, コンテキスト);
    const 下 = ペインを同期(新.下, null, コンテキスト);
    上.要素.setStyleCSS({ flex: `${新.比率} 0 0` });
    下.要素.setStyleCSS({ flex: `${1 - 新.比率} 0 0` });
    const スプリッター = div({ class: styles.スプリッター水平 })
        .addTypedEventListener("pointerdown", (e: PointerEvent) => {
            e.preventDefault();
            コンテキスト.スプリッター押下(新.id, "水平", { x: e.clientX, y: e.clientY });
        });
    const 要素 = div({ class: styles.上下分割 })
        .setAttribute(ペインID属性, 新.id)
        .childs([上.要素, スプリッター, 下.要素]);
    return { kind: "上下分割", ペイン: 新, 要素, スプリッター, 上, 下 };
}
