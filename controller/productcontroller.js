let prohelpers = require('../helpers/producthelpers')
let userhelpers = require('../helpers/userhelpers');

/*--------------to display product according to catagory ------------------------------------------*/

exports.catgpro = async (req, res) => {
    try {
        let user = req.session.user
        let catg = req.params.id
        console.log(catg)
        let count = null
        if (req.session.user) {
            count = await prohelpers.countcart(req.session.user._id)
        }
        prohelpers.getcatpro(catg).then((response) => {
            let pages = response.pages
            let product = response.product
            res.render('product', { user, product, userpage: true, count, catg, pages })
        })
    }
    catch (err) {
        console.log('some error happend')
    }
}

/*---------------------to display filtered products -----------------------------------------------------------*/

exports.filter = async (req, res) => {
    try {
        prohelpers.filter(req.query).then((response) => {
            let product = response.product
            res.render('filter', { product, filter: true })
        })
    }
    catch (err) {
        console.log('some error happend')
    }
}

/*---------------------to display searched products ----------------------------------------------------------------*/

exports.searchpro = async (req, res) => {
    try {
        prohelpers.search(req.body.key).then((data) => {
            res.render('search', { data, filter: true })
        })
    } catch (err) {
        console.log('some error happend')

    }
}

/*---------------------to display products according to pages -----------------------------------------------------------*/

exports.paginationpro = async (req, res) => {
    try {
        let catg = req.body.catg
        prohelpers.paginate(req.body).then((data) => {
            res.render('pagination', { data, catg, filter: true })
        })

    } catch (err) {
        console.log('some error happend')
    }
}

/*------------------------rendering product details page -------------------------------------------------------------------*/

exports.prodetails = async (req, res) => {
    try {
        let user = req.session.user
        let proid = req.params.id
        let count = null
        if (req.session.user) {
            count = await prohelpers.countcart(req.session.user._id)
        }
        prohelpers.getoneproduct(proid).then((data) => {
            let prodetails = data
            res.render('detail', { userpage: true, user, prodetails, count })

        })
    } catch (err) {
        console.log('some error happend')
    }
}

/*-------------------------rendering user cart page --------------------------------------------------------------------------*/

exports.cartpage = async (req, res) => {
    try {
        let count = await prohelpers.countcart(req.session.user._id)
        user = req.session.user
        let cart = await prohelpers.countcart(req.session.user._id)
        if (cart) {
            let total = await prohelpers.totalprice(req.session.user._id)
            prohelpers.getcart(req.session.user._id).then((data => {
                cartpro = data
                res.render('cart', { userpage: true, user, cartpro, total, empty: req.session.empty, count })
                req.session.empty = false
            }))
        }
        else {
            req.session.empty = true
            res.render('emptycart', { userpage: true, user: req.session.user })     //this is to render a empty cart page if there is no cart
        }

    } catch (err) {
        console.log('some error happend')
    }
}

/*------------------------user can add products to cart -----------------------------------------------------------------*/

exports.addtocart = (req, res) => {
    let prodid = req.params.id
    prohelpers.addcart(req.session.user._id, prodid).then((data) => {
        res.json({ add: true })

    }).catch((er) => {
        res.json({ cartadd: true })
    })
}

/*----------------------to chnage the quantity of cart products ----------------------------------------------------------*/

exports.changeqnty = (req, res) => {
    prohelpers.changequantity(req.body).then((response) => {
        res.json({ status: true })
    }).catch((response) => {
        res.json({ status: false })
    })
}

/*-----------------------remove cart products ------------------------------------------------------------------------------*/

exports.cartremove =  (req, res) => {
    let cartpro = req.params.cartproid
    let cart = req.params.cartid
    prohelpers.removecart(cartpro, cart).then((response) => {
      res.redirect('/cart')
  
    })
}
