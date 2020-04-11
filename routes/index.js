const express = require('express');
const router = express.Router();
const rp = require("request-promise")
const config = require("../config.json")
const WPAPI = require('wpapi');
const wp = new WPAPI(config.wordpress);

/* Wordpress 分類讀取 */
var wpCategory = {};
var wpCategory_type = {};

function loadWordpressCategory(retryTimes = 1) {
	wp.categories().perPage(100).then(x => {
		// 給前端看的分類標籤
		x.filter(x => !x.name.match(/未分類|頻道|網站|群組|公告/))
			.map(x => wpCategory[x.name] = x.id)
		// 後端添加類型用的 type
		x.filter(x => x.name.match(/未分類|頻道|網站|群組|公告/))
			.map(x => wpCategory_type[x.name] = x.id)
		console.log('INFO', 'Wordpress category loaded')
	}).catch(e => {
		console.log('ERROR', `cannot fetch wordpress category, retry in ${Math.pow(retryTimes,2)}s`)
		setTimeout(() => loadWordpressCategory(retryTimes), 1000 * Math.pow(retryTimes, 2))
		retryTimes++
	})
}
loadWordpressCategory()

/* GET home page. */
router.get('/', (req, res) => {
	res.render('index', {
		reCAPTCHA_site_key: config.reCAPTCHA_site_key,
		category: wpCategory
	});
});
router.post('/', async (req, res) => {
	/* Google 哈囉// */
	let result = await rp({
		method: 'post',
		uri: "https://www.google.com/recaptcha/api/siteverify",
		qs: {
			secret: config.reCAPTCHA_secret_key,
			response: req.body.grecaptcha
		},
		transform: x => JSON.parse(x)
	})
	if (!result.success) return res.json(result)

	/* 驗證一下資料 */
	if (
		(req.body.name && req.body.name == "") ||
		(req.body.intro && req.body.intro == "") ||
		(req.body.link && !req.body.link.startsWith("https://t.me/")) ||
		(req.body.category && req.body.category.length <= 0)
	) {
		return res.json({
			success: false,
			f: 'f'
		})
	}

	/* 處理分類 */
	req.body.category.push(wpCategory_type[req.body.type == "group" ? '👥群組' : '📣頻道'])
	// 好ㄌ，愛尼
	res.json({
		success: true
	})
	/* 提交囉 */
	await wp.posts().create({
		title: req.body.name,
		content: req.body.intro,
		categories: req.body.category,
		meta: {
			"tg-link": req.body.link
		},
		status: 'pending'
	}).catch(e => {
		console.error(e)
	})
})
router.get('/success', (req, res, next) => {
	res.render('success');
});
module.exports = router;