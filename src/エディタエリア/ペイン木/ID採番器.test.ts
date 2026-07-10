import { describe, expect, it } from "vitest";
import { ペインID採番器 } from "./ID採番器";

describe("ペインID採番器", () => {
    it("発行で接頭辞 + 0,1,2... の連番 ID を返す", () => {
        const 採番器 = new ペインID採番器("main");
        expect(採番器.発行()).toBe("main-0");
        expect(採番器.発行()).toBe("main-1");
        expect(採番器.発行()).toBe("main-2");
    });

    it("接頭辞が異なる採番器同士は衝突しない", () => {
        const a = new ペインID採番器("main");
        const b = new ペインID採番器("float");
        expect(a.発行()).toBe("main-0");
        expect(b.発行()).toBe("float-0");
        expect(a.発行()).toBe("main-1");
        expect(b.発行()).toBe("float-1");
    });

    it("開始番号を指定すると、そこから採番が始まる", () => {
        const 採番器 = new ペインID採番器("main", 100);
        expect(採番器.発行()).toBe("main-100");
        expect(採番器.発行()).toBe("main-101");
    });

    it("空接頭辞はコンストラクタで失敗(衝突防止)", () => {
        expect(() => new ペインID採番器("")).toThrow();
    });

    it("次番号を設定 で再開位置を変更できる(セッション復元用途)", () => {
        const 採番器 = new ペインID採番器("main");
        採番器.発行(); // main-0
        採番器.次番号を設定する(50);
        expect(採番器.発行()).toBe("main-50");
        expect(採番器.発行()).toBe("main-51");
    });

    it("次番号を設定 に負数や非整数を渡すと失敗", () => {
        const 採番器 = new ペインID採番器("main");
        expect(() => 採番器.次番号を設定する(-1)).toThrow();
        expect(() => 採番器.次番号を設定する(1.5)).toThrow();
        expect(() => 採番器.次番号を設定する(NaN)).toThrow();
    });
});
