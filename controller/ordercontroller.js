let prohelpers = require('../helpers/producthelpers');
let userhelpers = require('../helpers/userhelpers');
let paypal = require('paypal-rest-sdk');

/*-------------------- rendering chackout page ---------------------------------------------*/

exports.checkoutpage = async (req, res) => {
    let count = await prohelpers.countcart(req.session.user._id)
    let total = await prohelpers.totalprice(req.session.user._id)
    let prod = await prohelpers.orddetails(req.session.user._id)
    prohelpers.getaddress(req.session.user._id).then((data) => {
        let ad = data
        console.log('helowww')
        console.log(prod)
        console.log(ad)
        res.render('checkout', { userpage: true, user: req.session.user, ad, total, limit: req.session.limit, count, er: req.session.ader, prod })
        req.session.limit = false
        req.session.ader = false
    })
}

/*---------------------- placing order --------------------------------------------------------*/

exports.placeorder = async (req, res) => {
    let total = parseInt(req.body.price)
    let discper = parseInt(req.body.reduce)
    let pro = await prohelpers.getorderpro(req.session.user._id)
    let address = await prohelpers.getoneaddress(req.body.adress)
    prohelpers.placeorder(req.body, pro, total, address, req.session.user._id, discper).then((orderid) => {
        req.session.orderid = orderid
        console.log(req.body['payment'])
        if (req.body['payment'] == 'COD') {
            prohelpers.changestatus(orderid).then((response) => {
                res.json({ cod: true })
            })
        }
        else if (req.body['payment'] == 'Wallet') {
            prohelpers.generatewall(total, req.session.user._id, orderid).then((response) => {
                res.json({ wal: true })
            }).catch((er) => {
                res.json({ wal: false })
            })
        }
        else if (req.body['payment'] == 'razpay') {
            prohelpers.generaterazorpay(orderid, total).then((order) => {
                order.raz = true
                console.log('----------------------jjjjjjjjjjjjjjjjjjkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk-----------------------------')
                res.json(order)
            }).catch((er) => {
                res.json(er)
            })
        }
        else {
            prohelpers.generatepaypal(orderid, total).then((payment) => {
                console.log(payment)
                payment.paypal = true
                res.json(payment)
            })
        }
    }).catch((er) => {
        console.log('error ocured')
    })
}

/*----------------------------------- paypal success --------------------------------------------------*/

exports.paypalsuccess = async (req, res) => {
    let total = await prohelpers.gettotal(req.session.user._id)
    total = total.total
    const payerid = req.query.PayerID
    const paymentid = req.query.paymentId
    const execute_payment_json = {
        "payer_id": payerid,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": total
            }
        }]
    };
    paypal.payment.execute(paymentid, execute_payment_json, (error, payment) => {
        console.log("reached execute")
        if (error) {
            console.log(error)
        }
        else {
            console.log("finished exexucute")
            prohelpers.changestatus(req.session.orderid).then((response) => {
                res.redirect('/orderplace')
            })
        }
    })
}

/*---------------------------paypal cancel ------------------------------------------------------------*/

exports.paypalcancel = (req, res) => {
    res.send('payment failed')
}

/*------------------------verify razorpay -----------------------------------------------------------*/

exports.verifyrazorpay = (req, res) => {
    prohelpers.verifypay(req.body).then(() => {
        console.log('finished verifyy')
        prohelpers.changestatus(req.body['order[receipt]']).then((response) => {
            res.json({ status: true })
        })
    }).catch(() => {
        er = false
        res.json(er)
    })
}

/*------------------------order sucess and shows conformation -------------------------------------------*/

exports.ordersuccess = async (req, res) => {
    let total = await prohelpers.gettotal(req.session.user._id)
    total = total.total
    let product = await prohelpers.orddetails(req.session.user._id)
    prohelpers.cartclear(req.session.user._id).then((response) => {
        prohelpers.check().then((response) => {
            res.render('orderconfrm', { user: req.session.user, total, product, userpage: true })
            console.log(product)
        })

    })
}

/*-------------------------render order history ------------------------------------------------------------*/

exports.orderhistory = async (req, res) => {
    let count = await prohelpers.countcart(req.session.user._id)
    prohelpers.getorder(req.session.user._id).then((data) => {
        console.log(data)
        let ord = data
        res.render('orderdetails', { userpage: true, ord, user: req.session.user, count })
    })
}

/*------------------------list of product ordered by the user ------------------------------------------------*/

exports.orderproduct = async (req, res) => {
    let count = await prohelpers.countcart(req.session.user._id)
    let orderid = req.params.id
    let amount = await prohelpers.getamount(orderid)
    prohelpers.orderprodetails(orderid).then((data) => {
      let product = data
      res.render('orderdproducts', { userpage: true, user: req.session.user, product, count, amount })
    })
  }

/*-----------------------cancel the ordered products ----------------------------------------------------*/

exports.cancelorder = (req, res) => {
    prohelpers.changeorder(req.body, req.session.user._id).then((response) => {
        res.json({ status: true })
    })
}

/*-----------------------return the ordered products -----------------------------------------------------*/

exports.returnorder =  (req, res) => {
    console.log(req.body)
    prohelpers.return(req.body, req.session.user._id).then((response) => {
      res.json({ status: true })
    })
  
  }

/*------------------------ apply offer coupoun ---------------------------------------------------------------*/

exports.applycoupoun =  (req, res) => {
    prohelpers.applyofr(req.body).then((data) => {
      console.log(data)
      res.json(data)
    }).catch((response) => {
      console.log(response)
      if (response.invalid) {
        res.json(response)
      }
      else {
        res.json(response)
      }
    })
  }

