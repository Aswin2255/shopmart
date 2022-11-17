var prohelpers = require('../helpers/producthelpers')
var adminhelpers = require('../helpers/adminhelpers');
const userhelpers = require('../helpers/userhelpers');

/*------------------------------ rendering the add address page-------------------------------*/

exports.addadresspage =  async (req, res) => {
    let count = await prohelpers.countcart(req.session.user._id)
    res.render('addadress', { userpage: true, user: req.session.user, count })
  }

/*------------------------------ Adding the address -------------------------------------------------*/

exports.addadress = (req, res) => {

    prohelpers.addadress(req.body, req.session.user._id).then((response) => {
      res.redirect('/setings')
    }).catch((er) => {
      req.session.limit = true
      res.redirect('/setings')
    })
  }
 
/*-------------------------------- Deleting the address in user setings-------------------------------------------------*/

exports.deleteaddress1 =  (req, res) => {
    let adid = req.params.id
    prohelpers.deleteadd(adid).then((response) => {
      res.redirect('/setings')
    })
  }

/*-----------------------------deleting the address in the checkout ------------------------------------------------------*/

exports.deleteaddress2 =  (req, res) => {
    let adid = req.params.id
    prohelpers.removeadd(adid).then((response) => {
      res.redirect('/checkout')
    }).catch((er) => {
      req.session.ader = true
      res.redirect('/checkout')
    })
  }
 
/*-------------------------------- rendering the edit address page ---------------------------------------------------------------------*/

exports.editaddresspage =  async (req, res) => {
    let adid = req.params.id
    let count = await prohelpers.countcart(req.session.user._id)
    prohelpers.getadd(adid).then((response) => {
      let add = response
      console.log(add)
      res.render('editadress', { userpage: true, user: req.session.user, count, add })
  
    })
  
  }

  /*---------------------------------------editing the address (post req)--------------------------------------------------------------*/

  exports.editaddress = (req, res) => {
    console.log(req.body)
    let adid = req.params.id
    prohelpers.editadd(req.body, adid).then((response) => {
      res.redirect('/setings')
    })
  
  }

  