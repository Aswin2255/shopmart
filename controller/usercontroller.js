require('dotenv').config()
let prohelpers = require('../helpers/producthelpers')
let userhelpers = require('../helpers/userhelpers');
const { NetworkContext } = require('twilio/lib/rest/supersim/v1/network')

let client = require('twilio')(accsid = process.env.ACCSID, authtoken = process.env.AUTHTOKEN)

let serviceid = process.env.SERVICEID
let userstoreddata = {}

/*------------------- index page rendering-----------------------------------------------------*/

exports.indexpage = async (req, res) => {
    try {
        
        let user = req.session.user
        let logedin = req.session.logedin
        let baner = await prohelpers.getbaners()
        let banl = await prohelpers.checkban()
        let allproducts = await prohelpers.getallproducts()
        let count = null
        if (req.session.user) {
            count = await prohelpers.countcart(req.session.user._id)
        }
        prohelpers.getcatagories().then((data) => {
            let cat = data
            res.render('index', { user, cat, userpage: true, count, allproducts, baner, banl });
        })
    } catch {
        console.log('some error happended')
    }
}

/*------------------- signup page rendering -----------------------------------------------------*/

exports.signuppage = async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        }
        else {
            console.log(req.session.error)
            res.render('signup', { error: req.session.error })
            req.session.error = false
        }
    } catch (err) {
        console.log('some error happended')
    }

}

/*-------------------- user signup post -------------------------------------------------------------*/

exports.signupuser = async (req, res) => {
    try {
        userhelpers.signupuser(req.body).then((response) => {
            req.session.logedin = true
            req.session.user = response.user
            res.redirect('/')
        }).catch((data) => {
            req.session.error = true
            res.redirect('/signup')
        })
    } catch (err) {
        console.log('some error happended')
    }

}

/*---------------- login page rendering ---------------------------------------------------------------*/

exports.loginpage = async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        }
        else {

            res.render('login', { error: req.session.logerror, error2: req.session.passerror, error3: req.session.blockerror })
            req.session.logerror = false
            req.session.passerror = false
            req.session.blockerror = false
        }

    } catch (err) {
        console.log('some error happend')
    }
}

/*-------------- user login post ---------------------------------------------------------------------------*/

exports.loginuser = async (req, res) => {
    try {
        userhelpers.loginuser(req.body).then((response) => {
            if (response.status) {
                req.session.logedin = true
                req.session.user = response.user
                res.json(response)
            }
            else if (response.block) {
                req.session.blockerror = true
                res.json(response)
            }
            else {
                req.session.passerror = true
                res.json(response)
            }

        }).catch((response) => {
            console.log(response)
            req.session.logerror = true
            res.json(response)
        })

    } catch (err) {
        console.log('some error happend')
    }
}

/*------------------- user logout ------------------------------------------------------------------------------*/

exports.userlogout = async(req,res)=>{
    try{
    req.session.user = null
    res.redirect('/')
    }
    catch(err){
        console.log('some error happend')
    }
}

/*--------------------otp login page rendering -------------------------------------------------------------------*/

exports.otppage = async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        }
        else {
            res.render('phone', { userpage: true })
        }
    }
    catch (err) {
        console.log('some error happend')
    }
}

/*------------------user otp login post -----------------------------------------------------------------------------*/

exports.otplogin = async(req,res)=>{
    try{
    userhelpers.otphelper(req.body).then((response) => {

        userstoreddata = response
        let phone = response.phone
    
        client.verify.v2.services(serviceid)
          .verifications
          .create({ to: "+91" + phone, channel: 'sms' })
          .then(verification => {
            // loginhelper.loginuser
    
    
            console.log('worked')
            res.render('verifyotp', { userpage: true })
          });
    
      }).catch((er) => {
        req.session.logerror = true
    
        res.redirect('/login')
    
      })
    }
    catch(err){
        console.log('some error happend')
    }
}

/*-----------------otp is verified------------------------------------------------------------------------------*/

exports.otpverify = async (req, res) => {
    try {
        let code = (req.body.pass)
        let user = userstoreddata
        userphone = userstoreddata.phone


        client.verify.v2.services(serviceid)
            .verificationChecks
            .create({ to: "+91" + userphone, code })
            .then(verification => {
                if (verification.valid) {
                    if (user.userstatus) {
                        req.session.user = user
                        res.redirect('/')
                    }
                    else {
                        req.session.blockerror = true
                        res.redirect('/login')
                    }
                }
                else {
                    req.session.passerror = true
                    res.redirect('/login')
                }
            }).catch(() => {
                console.log("failed")
            })
    }
    catch (err) {
        console.log('some error happend')
    }
}

/*----------------------user seting page rendering --------------------------------------------------------*/

exports.usersetingpage = async (req, res) => {
    try {
        let count = await prohelpers.countcart(req.session.user._id)
        let ad = await prohelpers.getaddress(req.session.user._id)
        let walet = await prohelpers.getwallet(req.session.user._id)
        console.log(walet)
        prohelpers.getuser(req.session.user._id).then((data) => {
            let userdata = data

            res.render('usersetings', { userpage: true, user: req.session.user, userdata, ad, count, walet, limit: req.session.limit })
            req.session.limit = false
       })
    }
    catch (err) {
        console.log('some error happend')
    }

}

/*-----------------------------rendering user edit page --------------------------------------------------------------------------*/

exports.edituserpage = (req, res) => {
    let userid = req.params.id
    userhelpers.getoneuser(userid).then((data) => {
      let userdata = data
      console.log(userdata)
      res.render('useredit', { userpage: true, userdata, user: req.session.user, er: req.session.updateer, er1: req.session.error })
      req.session.updateer = false
      req.session.error = false
    })
  
  }

/*-----------------------------------editing the user details -----------------------------------------------------------------------*/

exports.edituser = (req, res) => {
    let useid = req.params.id
    userhelpers.updateuser(req.body, useid).then((response) => {
      console.log('reached1')
      if (response.update) {
        res.redirect('/setings')
      }
      else {
        req.session.error = true
        res.redirect('/useredit/' + req.body._id)
      }
    }).catch((er) => {
      req.session.updateer = true
      res.redirect('/useredit/' + req.body._id)
    })
    console.log(req.body)
  
  }

  /*------------------rendering the password editing page --------------------------------------------------------------------------*/

  exports.passeditpage = (req, res) => {
    let userid = req.params.id
    res.render('changepass', { userpage: true, user: req.session.user, userid, er: req.session.updateer, er1: req.session.invalid })
    req.session.updateer = false
    req.session.invalid = false
  }

  /*---------------------------- editing the user password ----------------------------------------------------------------------------*/

  exports.passedit =  (req, res) => {
    userhelpers.updatepass(req.body).then((response) => {
  
      if (response.update) {
        res.redirect('/setings')
      }
      else {
        req.session.updateer = true
        res.redirect('/changepass/' + req.body._id)
      }
    }).catch((er) => {
      req.session.invalid = true
      res.redirect('/changepass/' + req.body._id)
    })
  
  }