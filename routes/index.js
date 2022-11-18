const { response, json } = require('express');
var express = require('express');
const session = require('express-session');
var router = express.Router();
var prohelpers = require('../helpers/producthelpers')
var adminhelpers = require('../helpers/adminhelpers');
const userhelpers = require('../helpers/userhelpers');
const { NetworkContext } = require('twilio/lib/rest/supersim/v1/network')
//const client = require('twilio')(accsid = 'ACa86be7a90d1ee556979580512df9b4bb', authtoken = 'e56d55fbe72c6d6d79420febacdc211f')
//let serviceid = 'VAa97f9d7a5c7149428d142f10d79f2dbf'
let userstoreddata = {}
let usercontroller = require('../controller/usercontroller')
let procontroller = require('../controller/productcontroller')
let ordercontroller = require('../controller/ordercontroller')
let addresscontroller = require('../controller/addresscontroller')


//sb-a9cwo21601602@personal.example.com

/*------------------- authenticating middlewares--------------------------------------------- */

async function verifylogin(req, res, next) {
  if (req.session.user) {

    next()
  }
  else {
    res.redirect('/login')
  }
}

/*---------------cart checking middlewares--------------------------------------------------------------*/

async function checkcart(req, res, next) {
  let count = await prohelpers.countcart(req.session.user._id)
  if (count) {
    next()
  }
  else {
    res.redirect('/')
  }
}



//-------------------------------index page rendering--------------------------------------------------------------------------//

router.get('/', usercontroller.indexpage);

//---------------------------------------signup page rendering----------------------------------------------------------------//

router.get('/signup', usercontroller.signuppage)

//--------------------------------user signup post-----------------------------------------------------------------------------//

router.post('/signup', usercontroller.signupuser)

//--------------------------------login page rendering ------------------------------------------------------------------------//

router.get('/login', usercontroller.loginpage)

//-------------------------------user login -----------------------------------------------------------------------------------//

router.post('/login', usercontroller.loginuser)

//-------------------------------user logout ----------------------------------------------------------------------------------//

router.get('/logout', usercontroller.userlogout)

//-------------------------------otp login page rendering----------------------------------------------------------------------//

router.get('/otplogin', usercontroller.otppage)

//-------------------------------user otp login post (otp is send) -------------------------------------------------------------//

router.post('/otplogin', usercontroller.otplogin)

//--------------------------------otp is verified -------------------------------------------------------------------------------//

router.post('/verifyotp', usercontroller.otpverify)

//--------------------------------user setings page rendering--------------------------------------------------------------------//

router.get('/setings', verifylogin,usercontroller.usersetingpage)

//--------------------------------displaying product according to catg------------------------------------------------------------//

router.get('/product/:id',procontroller.catgpro )

//---------------------------------display price filterd products------------------------------------------------------------------//

router.get('/filter', procontroller.filter)

//---------------------------------display search results for products ------------------------------------------------------------//

router.post('/search', procontroller.searchpro)

//---------------------------------display products according to pages -------------------------------------------------------------//

router.post('/pagination', procontroller.paginationpro)

//---------------------------------product details page is rendering ---------------------------------------------------------------//

router.get('/productdetails/:id', procontroller.prodetails)

//----------------------------------user cart page is rendering --------------------------------------------------------------------//

router.get('/cart', verifylogin, procontroller.cartpage)

//---------------------------------- add products to cart ---------------------------------------------------------------------------//

router.get('/addtocart/:id', verifylogin, procontroller.addtocart)

//--------------------------------  increment or decrement cart quantity ------------------------------------------------------------//

router.post('/changeqnty', procontroller.changeqnty)

//----------------------------------- remove cart products --------------------------------------------------------------------------//

router.get('/deletecart/:cartproid/:cartid', procontroller.cartremove)

//----------------------------------- render checkout page --------------------------------------------------------------------------//

router.get('/checkout', verifylogin, checkcart, ordercontroller.checkoutpage)

//----------------------------------- placing order (post checkout) -----------------------------------------------------------------//

router.post('/checkout', ordercontroller.placeorder)

//------------------------------------ paypal succes case ----------------------------------------------------------------------------//

router.get('/sucess', ordercontroller.paypalsuccess)

//------------------------------------- paypal cancel case ----------------------------------------------------------------------------//

router.get('/cancel', ordercontroller.paypalcancel)

//--------------------------------------- verify razorpay online payment---------------------------------------------------------------//

router.post('/verifypay', ordercontroller.verifyrazorpay)

//----------------------------------------- orderplaced & render orderconformation page -----------------------------------------------//

router.get('/orderplace', verifylogin, checkcart,ordercontroller.ordersuccess )

//------------------------------------------ list of orders done by user --------------------------------------------------------------//

router.get('/orderdetails', verifylogin,ordercontroller.orderhistory )

//------------------------------------------- list of products orderd by the user -----------------------------------------------------//

router.get('/orderdproducts/:id', verifylogin,ordercontroller.orderproduct)

//-------------------------------------------- cancel the ordered products -----------------------------------------------------------//

router.post('/changeorder',ordercontroller.cancelorder)

//-------------------------------------------- return the ordered products -----------------------------------------------------------//

router.post('/return',ordercontroller.returnorder)

//--------------------------------rendering the add address page ----------------------------------------------------------------------//

router.get('/addadress', verifylogin,addresscontroller.addadresspage)

//---------------------------------adding the address (post request)-------------------------------------------------------------------//

router.post('/addadress', addresscontroller.addadress)

//----------------------------------deleting address in the user setings page ---------------------------------------------------------//

router.get('/address/delete/:id',addresscontroller.deleteaddress1)

//-----------------------------------deleting address in the checkout page -------------------------------------------------------------//

router.get('/delete/add/:id',addresscontroller.deleteaddress2)

//------------------------------------ editing address ----------------------------------------------------------------------------------//

router.get('/edit/add/:id', verifylogin,addresscontroller.editaddresspage)
router.get('/edit/add1/:id', verifylogin,addresscontroller.editaddresspage1)


//-------------------------------------- editi address (post request) -------------------------------------------------------------------//

router.post('/editadress/:id',addresscontroller.editaddress)
router.post('/editadress1/:id',addresscontroller.editaddress1)

//--------------------------------------- user details editingpage rendering ----------------------------------------------------------------//

router.get('/useredit/:id', verifylogin, usercontroller.edituserpage)

//---------------------------------------- editing the user details (post request) ----------------------------------------------------------//

router.post('/useredit/:id', usercontroller.edituser)

//----------------------------------------- rendering the password edit page -----------------------------------------------------------------//

router.get('/changepass/:id', verifylogin, usercontroller.passeditpage)

//------------------------------------------ editing the password (post request) --------------------------------------------------------------//

router.post('/changepass', verifylogin,usercontroller.passedit)

//-------------------------------------------- applying the coupoun for the products ----------------------------------------------------------//

router.post('/applycpn',ordercontroller.applycoupoun)

module.exports = router;