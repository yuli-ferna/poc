const express = require('express');
const router = express.Router();
const {ROLE} = require('../config/constant');
const AuthMiddleware = require('../middlewares/Authentication');

const AuthRouter = require('./auth')
const NyxcipherRouter = require('./nyxcipher')
const ItemRouter = require('./item')
const TicketRouter = require('./ticket')
const PaymentRouter = require('./payment')
const UserRouter = require('./user')

//------------ Welcome Route ------------//
router.get('/', AuthMiddleware(["Customer", "Sponsor"]), (req, res) => {
    res.status(200).send({data: 'Welcome Oasis'});
});


router.use('/auth', AuthRouter)
router.use('/nyxcipher', NyxcipherRouter);
router.use('/item', ItemRouter);
router.use('/payment', PaymentRouter);
router.use('/ticket', TicketRouter);
router.use('/user', UserRouter);

module.exports = router;