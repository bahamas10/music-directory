var router = new require('routes').Router();

module.exports = router;

router.addRoute('/', require('./routes/index'));

var _static = require('./routes/static');
router.addRoute('/css/*?', _static);
router.addRoute('/favicon.ico', _static);
router.addRoute('/icon.html', _static);
router.addRoute('/js/*?', _static);
router.addRoute('/third-party/*?', _static);

router.addRoute('/media/*?', require('./routes/media'));
router.addRoute('/api/:action/:option?', require('./routes/api'));

router.addRoute('/about', require('./routes/about'));
router.addRoute('/system', require('./routes/system'));
