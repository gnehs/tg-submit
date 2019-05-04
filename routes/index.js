const express = require('express');
const router = express.Router();
const rp = require("request-promise")
const config = require("../config.json")
const WPAPI = require('wpapi');
const wp = new WPAPI(config.wordpress);

var wpCategory = [];
wp.categories().perPage(100).then(x => {
	wpCategory =
		x
		.map(x => x.name)
		.filter(x => !x.match(/未分類|頻道|網站|群組|公告/))
	console.log('wpCategory loaded')
})
/* GET home page. */
router.get('/', (req, res, next) => {
	res.render('index', {
		reCAPTCHA_site_key: config.reCAPTCHA_site_key,
		category: wpCategory
	});
});
router.post('/', async (req, res, next) => {
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
	let categoriesData = await wp.categories().perPage(100)
	let categories = []
	req.body.category.map(v => {
		let search = categoriesData.find(e => e.name == v).id
		if (categories) categories.push(search)
	})
	categories.push(req.body.type == "group" ? 11 : 15)

	/* 提交囉 */
	await wp.posts().create({
		title: req.body.name,
		content: req.body.intro,
		categories: categories,
		meta: {
			"tg-link": req.body.link
		},
		status: 'pending'
	}).catch(e => {
		console.error(e)
		return res.json({
			success: false
		})
	})
	// 好ㄌ，愛尼
	res.json({
		success: true
	})
})
router.get('/success', (req, res, next) => {
	res.render('success');
});
module.exports = router;