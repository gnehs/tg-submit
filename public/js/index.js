grecaptcha.ready(function () {
    grecaptcha.execute(reCAPTCHA_site_key, {
            action: 'tg'
        })
        .then(token => {
            document.getElementById('g-recaptcha-response').value = token;
        });
});
$(`button#submit`).click(function () {
    let data = {
        name: $(`[data-name]`).val(),
        link: $(`[data-link]`).val(),
        intro: $(`[data-intro]`).val(),
        type: $('input[name="tg-type"]:checked').val(),
        category: [],
        grecaptcha: $(`#g-recaptcha-response`).val()
    }
    $("[data-checkbox]:checked").each(function () {
        data.category.push($(this).attr('data-checkbox'));
    });
    /* 檢查看看有沒有漏填的 */
    let regex = new RegExp(/(https?:\/\/[^\s]+)/g)
    let error = []
    if (data.name == "" || data.link == "" || data.intro == "") {
        error.push('資料填寫未完全')
    } else if (!regex.test(data.link) || !data.link.startsWith("https://t.me/")) {
        error.push('連結格式不正確')
    }
    if (!data.type) {
        error.push('未選擇類型')
    }
    if (!data.category.length > 0) {
        error.push('分類未勾選')
    }
    if (error.length > 0) {
        return Swal.fire({
            icon: 'error',
            title: '資料填寫不正確',
            text: error.join('、')
        })
    }
    /* 提交囉 */
    async function submit(data) {
        $(`button#submit`).addClass('loading disabled')
        let result = await axios.post('/', data)
        if (!result.data.success) Swal.fire({
            icon: 'error',
            title: '送出失敗',
            text: '可能是網路環境所致，請稍後再試。'
        })
        else location.href = "/success"
        $(`button#submit`).removeClass('loading disabled')
    }
    submit(data)


})

function showError(error) {
    Swal.fire({
        icon: 'error',
        title: '資料填寫不正確',
        text: error
    })
}