window.mdc.autoInit();
grecaptcha.ready(function () {
    grecaptcha.execute(reCAPTCHA_site_key, {
            action: 'tg'
        })
        .then(token => {
            document.getElementById('g-recaptcha-response').value = token;
        });
});
const snackbarSubmit = new mdc.snackbar.MDCSnackbar(document.querySelector('#snackbar-submit'));
const snackbarFailed = new mdc.snackbar.MDCSnackbar(document.querySelector('#snackbar-failed'));
$(`button#submit`).click(function () {
    let data = {
        name: $(`[data-name]`).val(),
        link: $(`[data-link]`).val(),
        intro: $(`[data-intro]`).val(),
        type: $(`.mdc-chip.mdc-chip--selected[data-type]`).attr('data-type'),
        category: [],
        grecaptcha: $(`#g-recaptcha-response`).val()
    }
    $("[data-checkbox]:checked").each(function () {
        data.category.push($(this).attr('data-checkbox'));
    });
    /* 檢查看看有沒有漏填的 */
    let regex = new RegExp(/(https?:\/\/[^\s]+)/g)
    let error = []
    if (data.name == "" || data.link == "" || data.intro == "") error.push('基本資料尚未填寫完畢')
    else if (!regex.test(data.link) || !data.link.startsWith("https://t.me/")) error.push('連結格式不正確')
    if (!data.type) error.push('未選擇類型')
    if (!data.category.length > 0) error.push('分類未勾選')
    if (error.length > 0) return showError(error.join('、'))
    /* 提交囉 */
    async function submit(data) {
        snackbarSubmit.open()
        let result = await axios.post('/', data)
        if (!result.data.success) snackbarFailed.open()
        else location.href = "/success"
    }
    submit(data)


})

function showError(error) {
    $('#snackbar-error [data-error]').text('發生錯誤：' + error)
    new mdc.snackbar.MDCSnackbar(document.querySelector('#snackbar-error')).open()
}