// ====================================================================================================
// 定数・変数
// ====================================================================================================

/**
 * リスト：夢コスト
 */
let listCostDefault = [
    // 0 → 1
    5,
    // 1 → 2
    5,
    // 2 → 3
    5,
    // 3 → 4
    8,
    // 4 → 5
    12,
]

/**
 * リスト：キャラクター
 */
let listCharacter = [
    {
        name: "あなた",
        cost: null,
        connect: [],
    },
    {
        name: "町",
        cost: null,
        connect: [],
    },
    {
        name: "なかま1",
        cost: null,
        connect: [],
    },
    {
        name: "なかま2",
        cost: null,
        connect: [],
    },
    {
        name: "なかま3",
        cost: null,
        connect: [],
    },
    {
        name: "なかま4",
        cost: null,
        connect: [],
    },
]

// ====================================================================================================
// 初期化
// ====================================================================================================

/**
 * ロード時
 */
window.onload = function() {
    // --------------------------------------------------
    // 復元
    // --------------------------------------------------

    let errorFlag = false;
    let localData;
    try {
        localData = JSON.parse(localStorage.getItem("data"));
    } catch {
        errorFlag = true;
    }

    if (errorFlag || !localData) {
        return;
    }

    const modal = document.querySelector(".modal");

    let text = '以前の入力内容を復元しますか？';
    modal.querySelector(".message").innerHTML = text;

    const oldElement = modal.querySelector(".buttonYes")
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
    newElement.addEventListener(
        "click",
        (() => () => {
            listCharacter = localData;
            // 初期化
            initialise();
        })()
    )

    modal.classList.remove("hidden");

    // --------------------------------------------------
    // データ設定
    // --------------------------------------------------

    let i = 0;
    listCharacter.forEach(target => {
        // コスト設定
        target.cost = [...listCostDefault];

        // つながり
        setConnect(i);

        i++;
    })

    // --------------------------------------------------
    // 初期化
    // --------------------------------------------------

    initialise();
}


/**
 * 初期化
 */
function initialise () {
    // --------------------------------------------------
    // テーブル描画
    // --------------------------------------------------

    // 設定
    drawSetting();

    // つながり
    drawConnect();

    // --------------------------------------------------
    // キャラクター名入力欄：フォーカスアウト
    // --------------------------------------------------

    let index = 0;
    document.querySelectorAll('input.input_name').forEach(target => {
        // キャラクター名変更イベント
        nameChange(target, index);

        // フォーカスアウト時にもイベント設定
        target.addEventListener(
            "blur",
            ((index) => (event) => {
                // ＰＣ名の変更
                nameChange(event.target, index);
            })(index)
        )

        index++;
    });

    // --------------------------------------------------
    // スクロールボタン
    // --------------------------------------------------

    document.addEventListener(
        "scroll",
        () => {
            // スクロールボタン
            const buttonScrollUp = document.querySelector(".buttonScroll.up");
            const buttonScrollDown = document.querySelector(".buttonScroll.down");

            // ●スクロール最上段
            if (window.scrollY === 0) {
                // ボタンを消す
                buttonScrollUp.classList.add("transparent");
                buttonScrollDown.classList.remove("transparent");
            }
            // ●それ以外
            else {
                // ボタンを出す
                buttonScrollUp.classList.remove("transparent");
                buttonScrollDown.classList.add("transparent");
            }
        }
    );
}

/**
 * テーブル描画：設定
 */
function drawSetting() {
    // --------------------------------------------------
    // 通常行
    // --------------------------------------------------

    // テンプレートの読み込み
    const templateItemSelf = document.getElementById("temp_setting_row_self");
    const templateItemFollow = document.getElementById("temp_setting_row_follow");

    // 追加ポイント
    const addPoint = document.getElementById("table_setting");

    // クリア
    addPoint.querySelectorAll("tr:not(.fixedRow)").forEach(target => {
        target.remove();
    })

    // キャラクターごとにループ
    let index = 0;
    let cloneItem;
    listCharacter.forEach(character => {
        // ●あなた
        if (index == 0) {
            // テンプレートを複製
            cloneItem = templateItemSelf.content.cloneNode(true);
        }
        // ●あいて
        else {
            // テンプレートを複製
            cloneItem = templateItemFollow.content.cloneNode(true);

            // コスト
            let costIndex = 0;
            cloneItem.querySelectorAll('[class^="input_cost_"]').forEach(cost => {
                // 初期値の設定
                cost.value = character.cost[costIndex];

                // 変更イベント
                cost.addEventListener(
                    "change",
                    ((character, costIndex) => (event) => {
                        // キャラクターリストのコストを更新
                        character.cost[costIndex] = Number(event.target.value);

                        // 再計算
                        calcFushigi();
                    })(character, costIndex)
                );

                costIndex++
            });

            // 削除ボタン
            cloneItem.querySelector("button.removeCharacter").addEventListener(
                "click",
                 ((i) => () => {
                    showModalDelete(i);
                })(index)
            );

            // ID設定
            cloneItem.id += index;
            cloneItem.querySelector(".set_id").textContent = index;

            // 置き換え要素
            const keyName = "replace";
            cloneItem.querySelectorAll('[' + keyName + ']').forEach(item => {
                item.setAttribute(keyName, item.getAttribute(keyName) + index);
            });
        }

        // キャラクター名
        cloneItem.querySelector("input.input_name").value = character.name;

        // 要素を追加する
        addPoint.appendChild(cloneItem);

        index++;
    });

    // --------------------------------------------------
    // 最終行
    // --------------------------------------------------

    // テンプレートの読み込み
    const templateItemLast = document.getElementById("temp_setting_row_last");

    // テンプレートを複製
    const cloneItemLast = templateItemLast.content.cloneNode(true);

    // 追加ポイント
    addPoint.appendChild(cloneItemLast);
}

/**
 * テーブル描画：つながり
 */
function drawConnect () {
    // --------------------------------------------------
    // 通常行
    // --------------------------------------------------

    // テンプレートの読み込み
    const templateItem = document.getElementById("temp_connect_row");

    // 追加ポイント
    const addPoint = document.getElementById("table_connect");

    // クリア
    addPoint.querySelectorAll("tr:not(.fixedRow)").forEach(target => {
        target.remove();
    })

    // キャラクターごとにループ
    let index = 0;
    listCharacter.forEach(() => {
        // 「あなた」は除く
        if (index > 0) {
            // テンプレートを複製
            let cloneItem = templateItem.content.cloneNode(true);

            // ID設定
            cloneItem.querySelectorAll('[id]').forEach(target => {
                target.id += index;
            });

            // 置き換え要素
            let keyName = "replace";
            cloneItem.querySelectorAll('[' + keyName + ']').forEach(item => {
                item.setAttribute(keyName, item.getAttribute(keyName) + index);
            });

            // --------------------------------------------------
            // 【つながり】
            // --------------------------------------------------

             let to = listCharacter[0];
             let from = listCharacter[index];

            cloneItem.querySelector(".connect.before > input.detail").value = to.connect[index].before.name;
            cloneItem.querySelector(".connect.before > input.value").value = to.connect[index].before.value;

            cloneItem.querySelector(".connect.after > input.detail").value = to.connect[index].after.name;
            cloneItem.querySelector(".connect.after > input.value").value = to.connect[index].after.value;

            cloneItem.querySelector(".connect.from > input.detail").value = from.connect[0].after.name;
            cloneItem.querySelector(".connect.from > input.value").value = from.connect[0].after.value;

            // --------------------------------------------------

            // 要素を追加する
            addPoint.appendChild(cloneItem);
        }

        index++;
    });

    // --------------------------------------------------
    // 最終行
    // --------------------------------------------------

    // テンプレートの読み込み
    const templateItemLast = document.getElementById("temp_connect_row_last");

    // テンプレートを複製
    const cloneItemLast = templateItemLast.content.cloneNode(true);

    // 追加ポイント
    addPoint.appendChild(cloneItemLast);
}

// ====================================================================================================
// ファンクション
// ====================================================================================================

/**
 * つながりデータ設定
 */
function setConnect (i) {
    for (let j = 0; j < listCharacter.length; j++) {
        let connect = null;

        if (
            (i == 0 && j > 0)
            || (i > 0 && j == 0)
        ) {
            connect = {
                before: {
                    name: "",
                    value: 0,
                },
                after: {
                    name: "",
                    value: 0,
                }
            };
        }

        listCharacter[i].connect.push(connect)
    }
}

/**
 * 計算：ふしぎ（＆夢）
 */
function calcFushigi (save = true) {
    // ふしぎ
    let value = 0;
    document.querySelectorAll(".connect_value_to").forEach(target => {
        value += Number(target.value);
    })

    document.getElementById("total_fushigi").textContent = value;

    // 夢
    calcYume(save);
}

/**
 * 計算：夢
 */
function calcYume (save) {
    // --------------------------------------------------
    // つながりから夢コストを計算
    // --------------------------------------------------

    for (let i = 1; i < listCharacter.length; i++) {
        let cost = 0;

        const before = Number(document.querySelector("#connect_to_" + i + " input.connect_before").value);
        const after = Number(document.querySelector("#connect_to_" + i + " input.connect_after").value);

        let change = after - before;

        for (let j = 0; j < change; j++) {
            cost += listCharacter[i].cost[before + j];
        }

        // ［夢］の描画
        document.querySelector("#cost_" + i + " .cost > .value").textContent = cost;
    }

    // --------------------------------------------------
    // トータル表示
    // --------------------------------------------------

    let value = 0;
    document.querySelectorAll(".cost > .value").forEach(target => {
        value += Number(target.textContent);
    })

    document.getElementById("total_yume").textContent = value;

    // --------------------------------------------------
    // ローカルストレージに保存
    // --------------------------------------------------

    if (save) {
        localSave();
    }
}

/**
 * 計算：想い
 */
function calcOmoi () {
    // 計算
    let value = 0;
    document.querySelectorAll(".connect_value_from").forEach(target => {
        value += Number(target.value);
    })
    document.getElementById("total_omoi").textContent = value;

    // ローカルストレージに保存
    localSave();
}

/**
 * ステータス名の取得
 */
function getStatusName (name) {
    return document.getElementById("statusName_" + name).value;
}

/**
 * 【強いつながり】判定
 */
function checkTsuyoiTsunagari () {
    document.querySelectorAll(".connect_row").forEach(row => {
        // 互いの【つながり】の強さが５の場合
        if (
            row.querySelector(".connect_before").value == "5"
            && row.querySelector(".connect_value_from").value == "5"
        ) {
            // 【強いつながり】を表示する
            row.querySelector(".strongConnect").classList.remove("hidden");
        }
    });
}

/**
 * 追加・削除用、データ一時保存
 */
function tempSaveData () {
    let to = listCharacter[0];
    let index = 1;
    document.querySelectorAll(".connect_row").forEach(target => {
        let from = listCharacter[index];

        to.connect[index].before.name = target.querySelector(".connect.before > input.detail").value;
        to.connect[index].before.value = target.querySelector(".connect.before > input.value").value;

        to.connect[index].after.name = target.querySelector(".connect.after > input.detail").value;
        to.connect[index].after.value = target.querySelector(".connect.after > input.value").value;

        from.connect[0].after.name = target.querySelector(".connect.from > input.detail").value;
        from.connect[0].after.value = target.querySelector(".connect.from > input.value").value;

        index++;
    });
}

/**
 * ローカルストレージに保存
 */
function localSave () {
    // 入力内容を保存
    tempSaveData();

    // ローカルストレージに保存
    localStorage.setItem("data", JSON.stringify(listCharacter));
}

// ====================================================================================================
// ボタンイベント
// ====================================================================================================

/**
 * キャラクター名の変更
 */
function nameChange (event, index) {
    // キャラクターリストへ反映
    listCharacter[index].name = event.value;

    // 【つながり】テーブルへ反映
    document.querySelectorAll('span[replace="' + event.getAttribute("replace") + '"]').forEach(target => {
        target.textContent = event.value;
    });

    // ローカルストレージに保存
    localSave();
}

/**
 * キャラクター「追加」ボタン
 */
function buttonAdd () {
    // 一時保存
    tempSaveData();

    // 末尾に新キャラクターを追加
    const addId = listCharacter.push({
        name: "なかま",
        cost: [...listCostDefault],
        connect: [],
    });
    setConnect(addId - 1);

    // 「あなた」のつながり追加
    listCharacter[0].connect.push({
        before: {
            name: "",
            value: 0,
        },
        after: {
            name: "",
            value: 0,
        }
    });

    // 初期化
    initialise();

    // さらに一時保存
    tempSaveData();
}

/**
 * キャラクター設定パネルの開閉
 */
function buttonSettingPanel (event) {
    // ボタンの見た目変更
    event.classList.toggle("active");

    // パネルの開閉
    document.querySelector('.pannel_setting').classList.toggle("hidden");
}

/**
 * 「クリップボードにコピーしました」表示
 */
function buttonFadeEvent (event) {
    if (event == null) {
        return;
    }

    // 見た目変更
    event.classList.add("active");
    setTimeout(() => {
        event.classList.remove("active");
    }, 1000);
}

/**
 * コマンド出力：ふしぎ
 */
function buttonFushigi (event) {
    // 「クリップボードにコピーしました」表示
    buttonFadeEvent(event);

    // クリップボードにコピー
    const value = document.getElementById("total_fushigi").textContent;
    navigator.clipboard.writeText(":" + getStatusName("fushigi") + "+" + value);
}

/**
 * コマンド出力：夢
 */
function buttonYume (event) {
    // 「クリップボードにコピーしました」表示
    buttonFadeEvent(event);

    // クリップボードにコピー
    const value = document.getElementById("total_yume").textContent;
    navigator.clipboard.writeText(":" + getStatusName("yume") + "-" + value);
}

/**
 * コマンド出力：想い
 */
function buttonOmoi (event) {
    // 「クリップボードにコピーしました」表示
    buttonFadeEvent(event);

    // クリップボードにコピー
    const value = document.getElementById("total_omoi").textContent;
    navigator.clipboard.writeText(":" + getStatusName("omoi") + "+" + value);
}

/**
 * スクロールボタン：上
 */
function buttonScrollUp () {
  window.scroll({
    top: 0,
  });
}

/**
 * スクロールボタン：下
 */
function buttonScrollDown () {
  window.scroll({
    top: document.body.scrollHeight,
  });
}

/**
 * 「【つながり】表を出力」ボタン
 */
function buttonOutputConnect (event) {
    // 「クリップボードにコピーしました」表示
    buttonFadeEvent(event);

    // 文字列の生成
    let text = "【つながり】";
    document.querySelectorAll(".connect_row").forEach(row => {
        text += "\r";

        const name = row.querySelector(".name_follow > span").textContent;

        let beforeDetail = row.querySelector(".connect.before > input.detail").value;
        if (beforeDetail == "") {
            beforeDetail = "未入力"
        }

        const beforeValue = row.querySelector(".connect.before > .connect_before").value;

        let afterDetail = row.querySelector(".connect.after > input.detail").value;
        if (afterDetail == "") {
            afterDetail = "未入力"
        }

        const afterValue = row.querySelector(".connect.after > .connect_after").value;

        const cost = row.querySelector(".cost > .value").textContent;
        text += "●" + name + " / " + beforeDetail + ":" + beforeValue + " → " + afterDetail + ":" + afterValue + " (夢 -" + cost + ")";
    });

    // クリップボードにコピー
    navigator.clipboard.writeText(text);
}

/**
 * 「【つながり】を確定」ボタン
 */
function buttonConnectDecide (event) {
    showModalDecide(event);
}

// ====================================================================================================
// モーダル
// ====================================================================================================

/**
 * モーダル非表示
 */
function hideModal () {
    const modal = document.querySelector(".modal");

    modal.classList.add("hidden");
}

/**
 * モーダル表示：「削除」ボタン
 */
function showModalDelete (id) {
    const modal = document.querySelector(".modal");

    let name = document.querySelector('span[replace="name_follow_' + id + '"]').textContent;
    let text = '<span class="name_follow">' + name + '</span>を削除しますか？';
    modal.querySelector(".message").innerHTML = text;

    const oldElement = modal.querySelector(".buttonYes")
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
    newElement.addEventListener(
        "click",
        ((id) => () => {
            processDelete(id);
        })(id)
    )

    modal.classList.remove("hidden");
}

/**
 * キャラクター「削除」ボタン
 */
function processDelete (id) {
    // 一時保存
    tempSaveData();

    // 指定キャラクターを削除
    listCharacter.splice(id, 1);

    // 「あなた」のつながり削除
    listCharacter[0].connect.splice(id, 1);

    // 初期化
    initialise();

    // さらに一時保存
    tempSaveData();
}

/**
 * モーダル表示：「【つながり】を確定」ボタン
 */
function showModalDecide (event) {
    const modal = document.querySelector(".modal");

    let text
        = "【つながり】の入力を確定しますか？<br>"
        + "（変更後の値で上書きされます）";
    modal.querySelector(".message").innerHTML = text;

    const oldElement = modal.querySelector(".buttonYes")
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
    newElement.addEventListener(
        "click",
        ((event) => () => {
            processConnectDecide(event);
        })(event)
    )

    modal.classList.remove("hidden");
}

/**
 * 「【つながり】を確定」ボタン
 */
function processConnectDecide (event) {
    // 「入力を確定しました」表示
    buttonFadeEvent(event);

    document.querySelectorAll(".connect_row").forEach(row => {
        const afterDetail = row.querySelector(".connect.after > input.detail").value;
        row.querySelector(".connect.before > input.detail").value = afterDetail;

        const afterValue = row.querySelector(".connect.after > .connect_after").value;
        row.querySelector(".connect.before > .connect_before").value = afterValue;
    });

    // 計算
    calcFushigi(false);

    // 強いつながり
    checkTsuyoiTsunagari();

    // ローカルストレージに保存
    localSave();
}