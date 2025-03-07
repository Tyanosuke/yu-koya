/**
 * 見た目の幅を取得
 */
function getVisualWidth(str) {
    // strが文字列でない場合は、0を返す
    if (typeof str !== "string") {
        return 0;
    }

    // 文字列を１文字ずつ分解
    const chars = Array.from(str);

    // 文字ごとに処理
    let width = 0;
    chars.forEach(char => {
        // ●半角文字
        if (char.match(/[ -~]/)) {
            width += 1;
        }
        // ●全角文字
        else {
            width += 2;
        }
    });

    // 見た目の幅を返す
    return width;
}

/**
 * 配列内で最大の、見た目の幅を取得
 */
function getMaxLength (keyList, targetKey, blankValue = null) {
    // 対象リストの取得
    let targetList = listCharacter;
    if (keyList) {
        targetList = listCharacter[0][keyList];
    }

    // targetKeyを、ドット区切りで配列に変換
    targetKey = targetKey.split(".");

    // 対象文字列の、見た目の幅を取得
    const nameWidths = targetList.map(item => {
        if (!item) {
            return 0;
        }

        // targetKeyを使って、ネストされた値を取得
        let target = item;
        for (let key of targetKey) {
            if (!target[key]) {
                target = undefined;
                break;
            }
            target = target[key];
        }

        // 対象文字が空の場合
        if (!target) {
            // ●代替文字がある場合
            if (blankValue) {
                // それを設定
                target = blankValue;
            }
            // ●それ以外の場合
            else {
                // 幅０を返す
                return 0;
            }
        }

        return getVisualWidth(target);
    });

    // 最大の見た目の幅を求める
    const maxLength = nameWidths.reduce(
        (max, len) => {
            return Math.max(max, len);
        },
        0
    );

    // 結果を返す
    return maxLength;
}

/**
 * padEnd改良版
 */
function padVisualEnd(target, targetVisualWidth, fillString = " ") {
    const currentWidth = getVisualWidth(target);
    const paddingWidth = targetVisualWidth - currentWidth;

    if (paddingWidth > 0) {
        return target + fillString.repeat(paddingWidth);
    }

    return target;
}

/**
 * padStart改良版
 */
function padVisualStart(target, targetVisualWidth, fillString = " ") {
    const currentWidth = getVisualWidth(target);
    const paddingWidth = targetVisualWidth - currentWidth;

    if (paddingWidth > 0) {
        return fillString.repeat(paddingWidth) + target;
    }

    return target;
}
