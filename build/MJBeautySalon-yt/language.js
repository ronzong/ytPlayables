window.flip_language_map = {
    test: {
        en: "",
        ru: "",
        tr: "",
        ar: "",
        de: "",
        es: "",
        ja: "",
        vn: "",
        th: "",
        pt: "",
        id: "",
        fr: "",
        it: "",
        hi: ""
    },
    test: {
        en: "",
        ru: "",
        tr: "",
        ar: "",
        de: "",
        es: "",
        ja: "",
        vn: "",
        th: "",
        pt: "",
        id: "",
        fr: "",
        it: "",
        hi: ""
    },
}
window.getLanguageByKey = function (key, params = []) {
    let item = window.flip_language_map[key];
    if (!item) {
        return "";
    }
    let text = item[VolanSdk.GAME_LANGUAGE] || item["en"];
    if (params.length) {
        text = window.getStringReplace(text, params);
    }
    return text;
}
//支持(0)(1)括号格式的字符替换
window.getStringReplace = function (s, params) {
    if (params.length == 0) return s;
    for (var i = 0; i < params.length; i++)
        s = s.replace(new RegExp("\\(" + i + "\\)", "g"), params[i]);
    return s;
}

// window.getLanguageByKey("Fine_you_win")