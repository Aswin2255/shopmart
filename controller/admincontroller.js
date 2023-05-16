let adminhelpers = require('../helpers/adminhelpers')
let loginhelper = require('../helpers/adminhelpers')
let getuser = require('../helpers/userhelpers')
let producthelpers = require('../helpers/producthelpers')
let moment = require('moment')

/*------------------- rendering admin dashboard page -------------------------------------------------*/

exports.adminpage = async (req, res) => {
    let date = await adminhelpers.getsalesall()
    let user = await adminhelpers.getuser()
    let todays = date[date.length - 1]
    console.log(todays)
    res.render('admin', { adminpage: true, admin: true, date, todays, user })

}

/*--------------------- rendering admin login page ------------------------------------------------------*/

exports.adminloginpage = (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin')
    }
    else {
        res.render('adminlogin', { loginer1: req.session.loginerror, adminpage: true })
        req.session.loginerror = false
    }
}

/*--------------------------admin login (post req) --------------------------------------------------------*/

exports.adminlogin = (req, res) => {
    loginhelper.loginadmin(req.body).then((response) => {
        if (response.status) {
            req.session.admin = response.admin
            res.redirect('/admin')
        }
        else {
            req.session.loginerror = true
            res.redirect('/admin/login')
        }
    }).catch((response) => {
        req.session.loginerror = true
        res.redirect('/admin/login')

    })

}

/*--------------------------admin logout --------------------------------------------------------------------*/

exports.adminlogout = (req, res) => {
    req.session.admin = null
    res.redirect('/admin/login')
}

/*-----------------------------rendering userdetails page ----------------------------------------------------*/

exports.userdetails = (req, res) => {

    getuser.getallusers().then((response) => {
        let userdata = response

        res.render('userdetails', { userdata, e1: req.session.block, adminpage: true, admin: true })

    }).catch(() => {
        console.log("um")
    })


}

/*-------------------------------blocking & unblocking user -------------------------------------------------*/

exports.restrictuser = (req, res) => {
    console.log(req.body)
    let proid = req.params.id
    getuser.blockuser(req.body).then((response) => {
        if (req.body.status === 'false') {
            req.session.user = null
        }

        res.redirect('/admin/userdetails')
    }).catch(() => {
        console.log("fail")
    })
}

/*----------------------------deleting the user ---------------------------------------------------------------*/

exports.deleteuser = (req, res) => {
    let proid = req.params.id
    getuser.deluser(proid).then((response) => {
        res.redirect('/admin/userdetails')
    }).catch(() => {
        console.log('false')
    })
}

/*------------------------- rendering addcatgotry page --------------------------------------------------------*/

exports.addcatgpage = (req, res) => {
    producthelpers.getcatagories().then((data) => {
        let catagories = data
        res.render('addcatagory', { catagories, er: req.session.catgerr, adminpage: true, admin: true })
        req.session.catgerr = false
    })
}

/*--------------------------addcatagory (post request) ---------------------------------------------------------*/

exports.addcatg = (req, res) => {
    producthelpers.addcatagories(req.body).then((response) => {
        res.redirect('/admin/addcatg')
    }).catch((response) => {
        req.session.catgerr = true
        res.redirect('/admin/addcatg')
    })
}

/*--------------------------deletecatagory ----------------------------------------------------------------------*/

exports.deletecatg = (req, res) => {
    let proid = req.params.id
    console.log("helper" + proid)
    producthelpers.deletecatg(proid).then((status) => {
        res.redirect('/admin/addcatg')
    }).catch(() => {

    })
}

/*-------------------------rendering edit catagory page ----------------------------------------------------------*/

exports.editcatgpage = (req, res) => {
    if (req.session.admin) {
        let proid = req.params.id
        producthelpers.getcatone(proid).then((data) => {
            let catg = data
            console.log(catg)
            res.render('editcatagory', { admin: true, adminpage: true, catg, er: req.session.catr })
            req.session.catr = false
        })
    }
    else (
        res.redirect('/admin/login')
    )
}

/*-------------------------editing catagory (post request) ---------------------------------------------------------*/

exports.editcatg = (req, res) => {
    let proid = req.params.id
    producthelpers.editcatg(proid, req.body).then((data) => {
        res.redirect('/admin/addcatg')
    }).catch((er) => {
        req.session.catr = true
        res.redirect('/admin/editcatg/' + proid)
    })
}

/*------------------------product management page rendering ---------------------------------------------------------*/

exports.productmanagepage = (req, res) => {
    producthelpers.getproduct().then((response) => {
        let product = response
        res.render('productmanagement', { product, adminpage: true, admin: true })
    })
}

/*------------------------rendering product edit page ------------------------------------------------------------------*/

exports.producteditpage = (req, res) => {
    producthelpers.getcatagories().then((catgdata) => {
        let catg = catgdata
        console.log(catg)
        let proid = req.params.id
        producthelpers.getoneproduct(proid).then((data) => {
            let product = data
            console.log(product)
            res.render('editproduct', { adminpage: true, catg, product, e1: req.session.editer, admin: true })
            req.session.editer = false
        })
    })
}

/*---------------------- product editing (post request) -----------------------------------------------------------------*/

exports.productedit = (req, res) => {
    let proid = req.params.id
    let files = req.files
    producthelpers.editproduct(proid, req.body, files).then((data) => {
        res.redirect('/admin/productmanage')
    }).catch((err) => {
        req.session.editer = true
        res.redirect('/admin/productmanage/edit/' + proid + '')
    })
}

/*------------------------ rendering add productpage ---------------------------------------------------------------------*/

exports.addproductpage = (req, res) => {
    producthelpers.getcatagories().then((data) => {
        let catg = data
        res.render('addproduct', { catg, er: req.session.proerr, adminpage: true, admin: true })
        req.session.proerr = false

    })
}

/*------------------------- adding products -------------------------------------------------------------------------------*/

exports.addproduct = (req, res) => {
    console.log(req.body)
    let files = req.files
    producthelpers.addproduct(req.body, files).then((data) => {
        res.redirect('/admin/productmanage')
        console.log("hii")
    }).catch((er) => {
        console.log('failed')
        req.session.proerr = true
        res.redirect('/admin/addproduct')
    })
}

/*-------------------- deleting the product------------------------------------------------------------------------------*/

exports.delproduct = (req, res) => {
    let proid = req.params.id
    producthelpers.productdelete(proid).then((response) => {
        res.redirect('/admin/productmanage')
    }).catch(() => {
        console.log('false')
    })
}

/*-----------------------rendering ordermanage page ---------------------------------------------------------------------*/

exports.ordermanagepage = async (req, res) => {
    let ret = await adminhelpers.getreturn()
    console.log(ret)
    adminhelpers.getorders().then((data) => {
        let orders = data
        console.log(orders)
        res.render('ordermanage', { adminpage: true, admin: true, orders, ret })
    })
}

/*------------------------change order status by admin --------------------------------------------------------------------*/

exports.statuschange = (req, res) => {
    console.log(req.body)
    let status = req.body.status
    let proid = req.body.id
    let ordid = req.body.ordid
    adminhelpers.shipproduct(status, proid, ordid).then((response) => {
        res.json({ status: true })
    })
}

/*---------------------products ordered by the user ------------------------------------------------------------------------*/

exports.orderproducts = async (req, res) => {
    let ordid = req.params.id
    let amount = await adminhelpers.getamount(ordid)
    adminhelpers.orddetails(ordid).then((response) => {
        let ord = response
        res.render('ordprodet', { adminpage: true, admin: true, ord, amount })
    })
}

/*--------------------get the sales report ----------------------------------------------------------------------------------*/

exports.salesreport = async (req, res) => {
    let weekly = await adminhelpers.getwekly()
    let yearly = await adminhelpers.getyear()
    let monthly = await adminhelpers.getmonth()
    adminhelpers.getsalesall().then((data) => {
        console.log(data)
        res.render('salesreport', { admin: true, adminpage: true, data, weekly, yearly, monthly })
    })
}

/*--------------------get the sales graph --------------------------------------------------------------------------------------*/

exports.salesgraph = async (req, res) => {
    let date = await adminhelpers.getsalesall()
    let week = await adminhelpers.getwekly()
    let yearly = await adminhelpers.getyear()
    let monthly = await adminhelpers.getmonth()
    res.render('salesgraph', { adminpage: true, admin: true, date, week, yearly, monthly })
}

/*----------------rendering banner control page -------------------------------------------------------------------------------*/

exports.bannerpage = async (req, res) => {
    let baners = await adminhelpers.getbaners()
    baners = baners[0].imgar
    res.render('banercontrol', { adminpage: true, admin: true, baners })
}

/*----------------managing banners (post request)--------------------------------------------------------------------------------*/

exports.bannercontrol = (req, res) => {
    adminhelpers.baners(req.files).then((data)=>{
            res.redirect('/admin/banercontrol')
    })

}

/*---------------applying catg offer ---------------------------------------------------------------------------------------------*/

exports.catgoffer = (req, res) => {
    adminhelpers.catgofer(req.body).then((data) => {
        res.json({status:true})
    })
}

/*----------------removing catg offer ---------------------------------------------------------------------------------------------*/

exports.removecatgoffer = (req, res) => {
    let catg = req.params.id
    adminhelpers.delcatgofer(catg).then((data) => {
        res.redirect('/admin/addcatg')
    })
}

/*---------------Applying product offer ------------------------------------------------------------------------------------------*/

exports.productoffer = (req, res) => {
    console.log(req.body)
    adminhelpers.proofer(req.body).then((data) => {
        res.json({ status: true })
    })
}

/*---------------Removing product offer --------------------------------------------------------------------------------------------*/

exports.productofferremove = (req, res) => {
    let proid = req.params.id
    adminhelpers.delofer(proid).then((data) => {
        res.redirect('/admin/productmanage')
    })
}

/*-------------Rendering coupoun management page ------------------------------------------------------------------------------------*/

exports.coupounpage = (req, res) => {
    adminhelpers.getcpn().then((cpn) => {
        res.render('coupounmanage', { adminpage: true, admin: true, er: req.session.er, cpn })
        req.session.er = false
    })
}

/*--------------Entering copupoun (post req) ---------------------------------------------------------------------------------------*/

exports.entercoupoun = (req, res) => {
    console.log(req.body)
    adminhelpers.addcpn(req.body).then((data) => {
        res.redirect('/admin/coupon')
    }).catch((data) => {
        req.session.er = true
        res.redirect('/admin/coupon')
    })
}

/*---------------Delete coupouns ----------------------------------------------------------------------------------------------------*/

exports.delcoupoun = (req, res) => {
    let id = req.params.id
    adminhelpers.delcpn(id).then((data) => {
        res.redirect('/admin/coupon')
    })
}

/*----------------Approve return -----------------------------------------------------------------------------------------------------*/

exports.approveret = (req, res) => {
    console.log(req.body)
    adminhelpers.aproveret(req.body).then((data) => {
        res.json({ status: true })
    })
}

/*---------------Delete banners ----------------------------------------------------------------------------------------------------*/

exports.delbanner = (req, res) => {
    adminhelpers.delban().then((sta) => {
        res.json({ stat: true })
    })
}

/*---------------Sales report filter -------------------------------------------------------------------------------------------------*/

exports.salesreportfilter = (req, res) => {
    console.log(req.body)
    let from = req.body.start
    let to = req.body.end
    adminhelpers.orderfilter(from, to).then((data) => {
        from = moment(from).format('DD/MM/YYYY');
        to = moment(to).format('DD/MM/YYYY');;
        res.render('orderf', { from, to, data, filter: true })
    })
}
