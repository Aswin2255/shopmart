var express = require('express')
var router = express.Router()
var adminhelpers = require('../helpers/adminhelpers')
var getuser = require('../helpers/userhelpers')
var loginhelper = require('../helpers/adminhelpers')
var producthelpers = require('../helpers/producthelpers')
var multy = require('../helpers/multerhelpers')
let admincontroller = require('../controller/admincontroller')
let multiple = multy.fields([{ name: 'image1' }, { name: 'image2' }])



//---------------------------------------middleware to verify admin login ------------------------------------------------------------//

async function verifyadmin(req, res, next) {
  if (req.session.admin) {

    next()
  }
  else {
    res.redirect('/admin/login')
  }
}

//--------------------------------------this is to view the admin dashboard ----------------------------------------------------------//

router.get('/', verifyadmin, admincontroller.adminpage)

//--------------------------------------render admin login page ----------------------------------------------------------------------//

router.get('/login', admincontroller.adminloginpage)

//--------------------------------------admin can log in (post req) ------------------------------------------------------------------//

router.post('/login', admincontroller.adminlogin)

//-------------------------------------admin logout ----------------------------------------------------------------------------------//

router.get('/logout', admincontroller.adminlogout)

//------------------------------------rendering user details page --------------------------------------------------------------------//

router.get('/userdetails', verifyadmin, admincontroller.userdetails)

//------------------------------------blocking and unblocking user --------------------------------------------------------------------//

router.post('/userblock', admincontroller.restrictuser)

//--------------------------------------------------deleting the user -----------------------------------------------------------------//

router.get('/userdelete/:id', admincontroller.deleteuser)

//-----------------------------------------------add catagory page rendering ---------------------------------------------------------//

router.get('/addcatg', verifyadmin, admincontroller.addcatgpage)

//------------------------------------------------adding the catagory (post request) -------------------------------------------------//

router.post('/addcatg', admincontroller.addcatg)

//-----------------------------------------------deleting the catagory ---------------------------------------------------------------//

router.get('/delcatg/:id', admincontroller.deletecatg)

//------------------------------------------------edit catagory page rendering -------------------------------------------------------//

router.get('/editcatg/:id', admincontroller.editcatgpage)

//------------------------------------------------edit catagory (post request) -------------------------------------------------------//

router.post('/editcatg/:id', admincontroller.editcatg)

//------------------------------------------------rendering product manage page-------------------------------------------------------//

router.get('/productmanage', verifyadmin, admincontroller.productmanagepage)

//-------------------------------------------------rendering product edit page -------------------------------------------------------//

router.get('/productmanage/edit/:id', verifyadmin, admincontroller.producteditpage)

//-------------------------------------------------editing the products --------------------------------------------------------------//

router.post('/productmanage/edit/:id', multy.array('images', 2), admincontroller.productedit)

//--------------------------------------------------rendering addproduct page --------------------------------------------------------//

router.get('/addproduct', verifyadmin, admincontroller.addproductpage)

//--------------------------------------------------adding product (post request) ----------------------------------------------------//

router.post('/addproduct', multy.array('images', 5), admincontroller.addproduct)

//---------------------------------------------------deleting the product--------------------------------------------------------------//

router.get('/productmanage/delete/:id', admincontroller.delproduct)

//---------------------------------------------------view the orders done by the user--------------------------------------------------//

router.get('/ordermanage', verifyadmin, admincontroller.ordermanagepage)

//------------------------------------------------this is to change order status by admin----------------------------------------------//

router.post('/status', admincontroller.statuschange)

//------------------------------------------------this is to display products order by the customber-----------------------------------//

router.get('/orderpro/:id', verifyadmin, admincontroller.orderproducts)

//-----------------------------------------------to get the sales rsport -------------------------------------------------------------//

router.get('/salesreport', verifyadmin, admincontroller.salesreport)

//----------------------------------------------to get the sales graph ---------------------------------------------------------------//

router.get('/saleschart', verifyadmin, admincontroller.salesgraph)

//----------------------------------------------Banner Management---------------------------------------------------------------------//

router.get('/banercontrol', verifyadmin, admincontroller.bannerpage)

//----------------------------------------------Banner control (post request) --------------------------------------------------------//

router.post('/banercontrol', multy.array('baners'), admincontroller.bannercontrol)

//---------------------------------------------Applying catg offer --------------------------------------------------------------------//

router.post('/catgofer', admincontroller.catgoffer)

//--------------------------------------------Removing catgory offer ------------------------------------------------------------------//

router.get('/delofr/:id', admincontroller.removecatgoffer)

//--------------------------------------------Applying product offer -----------------------------------------------------------------//

router.post('/proofer', admincontroller.productoffer)

//--------------------------------------------Removing product offer ----------------------------------------------------------------//

router.get('/delofer/:id', admincontroller.productofferremove)

//--------------------------------------------Rendering coupoun management page -----------------------------------------------------//

router.get('/coupon', verifyadmin, admincontroller.coupounpage)

//--------------------------------------------Entering coupons (post request) -------------------------------------------------------//

router.post('/coupon', verifyadmin, admincontroller.entercoupoun)

//---------------------------------------------Delete a coupoun --------------------------------------------------------------------//

router.get('/delcpn/:id', admincontroller.delcoupoun)

//--------------------------------------------Approve a return --------------------------------------------------------------------//

router.post('/return', admincontroller.approveret)

//-------------------------------------------Delete banners -----------------------------------------------------------------------//

router.get('/delbaner', admincontroller.delbanner)

//------------------------------------------ filter sales report ------------------------------------------------------------------//

router.post('/orderfilter', admincontroller.salesreportfilter)

module.exports = router




