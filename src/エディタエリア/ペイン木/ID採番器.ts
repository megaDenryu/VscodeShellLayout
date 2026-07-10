// ペインID をモノトニック増加カウンタで発行する。純核は ID 一意性を検証しない設計のため、
// 配線層がここで衝突しない ID 採番を保証する。接頭辞 (split / tabs 等) で用途を分けることで
// 別カテゴリ間でも衝突しない: "tabs-0", "split-0" は同時に存在できる。

import { ペインIDを作る, type ペインID } from "./レイアウト型";

export class ペインID採番器 {
    private _次番号: number;

    constructor(private readonly _接頭辞: string, 開始番号 = 0) {
        if (_接頭辞.length === 0) {
            throw new Error("ペインID採番器: 接頭辞は空文字列にできません(衝突防止のため)");
        }
        this._次番号 = 開始番号;
    }

    発行(): ペインID {
        const id = ペインIDを作る(`${this._接頭辞}-${this._次番号}`);
        this._次番号++;
        return id;
    }

    // セッション復元時など、既知の最大番号 + 1 から再開する用途。
    // 復元前の値より小さい値を渡すと衝突するので、呼び出し側責務。
    次番号を設定する(値: number): void {
        if (!Number.isInteger(値) || 値 < 0) {
            throw new Error(`ペインID採番器: 次番号は非負整数(${値} は不正)`);
        }
        this._次番号 = 値;
    }
}
