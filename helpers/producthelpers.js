let db = require('../coinfig/connection')
let collection = require('../coinfig/collection')
const Razorpay = require('razorpay');
let paypal = require('paypal-rest-sdk');
const { ObjectId } = require('mongodb')
const { stringify } = require('ajv')
const { FlowValidateList } = require('twilio/lib/rest/studio/v2/flowValidate');
const { resolve } = require('path');
let fs = require('fs')
require('dotenv').config()
var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
});

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id':process.env.CLIENT_ID2 ,
'client_secret': process.env.CLIENT_SECRET2
});

module.exports = {
    //this is to get the baner images path from db

    getbaners: () => {
        return new Promise(async (resolve, reject) => {
            let img = await db.get().collection(collection.baners).find().toArray()
            resolve(img)

        })

    },
    checkban:()=>{
        return new Promise(async (resolve, reject) => {
            let img = await db.get().collection(collection.baners).find().toArray()
            resolve(img[0].imgar.length)

        })

    },

    //this is to get all products to display at the index page

    getallproducts: () => {
        return new Promise(async (resolve, reject) => {
            let allpro = await db.get().collection(collection.productcollection).find().toArray()

            resolve(allpro)

        })
    },


    addproduct: (product, file) => {
        product.price = parseInt(product.price)
        product.qnty = parseInt(product.qnty)
        let catg = product.catg
        return new Promise(async (resolve, reject) => {
            let offer = await db.get().collection(collection.catagories).findOne({ catg: catg })
            let rate = offer.catgoffer

            let existproduct = await db.get().collection(collection.productcollection).findOne({ name: product.name })
            console.log(existproduct)
            if (existproduct == null) {
                let imgar = []
                file.forEach(e => {
                    imgar.push(e.filename)

                });
                console.log(imgar)
                product.img = imgar
                product.ofprice = (product.price) - ((product.price) * (rate / 100))
                product.proofer = false
                product.offerper = rate
                await db.get().collection(collection.productcollection).insertOne(product).then((data) => {

                    resolve(data)


                })


            }
            else {
                er = true
                reject(er)
            }




        })
    },
    getproduct: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.productcollection).find().toArray()
            resolve(product)

        })
    },
    productdelete: (proid) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.cart).update({ 'product.item': ObjectId(proid) }, {
                $pull: { product: { item: ObjectId(proid) } }
            })
            let prod = await db.get().collection(collection.productcollection).findOne({_id:ObjectId(proid)})
            let img = prod.img
            img.forEach(e => {
                fs.unlinkSync('public/productimage/'+e)
                
            });
          
            console.log(img)

            await db.get().collection(collection.productcollection).deleteOne({ _id: ObjectId(proid) })
            resolve("hii")
        })

    },

    editproduct: (proid, details, files) => {
        console.log(details)


        return new Promise(async (resolve, reject) => {
            let ofprice
            let offerper
            let catg = details.catg
            let offer = await db.get().collection(collection.catagories).findOne({ catg: catg })
            let rate = offer.catgoffer
            details.offerper = parseInt(details.offerper)
            details.price = parseInt(details.price)
            details.qnty = parseInt(details.qnty)
            let existpro = await db.get().collection(collection.productcollection).findOne({ name: details.name })
            console.log('hii')
            if (existpro) {   // this condition checks whwether there is an existing product with the same name
                if ((existpro._id).equals(proid)) { // this is to check whether we are updating the same product
                    console.log("equalll")
                    if (files.length != 0) { // this is to check whether the file is empty
                        let img = []
                        files.forEach(e => {
                            img.push(e.filename)

                        });
                        let prod = await db.get().collection(collection.productcollection).findOne({_id:ObjectId(proid)})
                        let image = prod.img
                        image.forEach(e => {
                            fs.unlinkSync('public/productimage/'+e)
                            
                        });
                        if (details.proofer === 'true') {

                            ofprice = (details.price) - ((details.price) * (details.offerper / 100))
                            offerper = details.offerper
                        }
                        else {

                            ofprice = (details.price) - ((details.price) * (rate / 100))
                            offerper = rate
                        }

                        await db.get().collection(collection.productcollection).updateOne({ _id: ObjectId(proid) }, {
                            $set: {
                                name: details.name,
                                price: details.price,
                                ofprice: details.ofprice,
                                discription: details.discription,
                                catg: details.catg,
                                qnty: details.qnty,
                                img: img,
                                ofprice: ofprice,
                                offerper: offerper

                            }
                        }).then((response) => {
                            resolve(details)
                            console.log("hii")
                        })
                    }
                    else {
                        if (details.proofer === 'true') {

                            ofprice = (details.price) - ((details.price) * (details.offerper / 100))
                            offerper = details.offerper
                        }
                        else {

                            ofprice = (details.price) - ((details.price) * (rate / 100))
                            offerper = rate
                        }

                        console.log(ofprice)
                        await db.get().collection(collection.productcollection).updateOne({ _id: ObjectId(proid) }, {
                            $set: {
                                name: details.name,
                                price: details.price,
                                ofprice: details.ofprice,                  //here we are not updating the img field because there are no files passed by the user
                                discription: details.discription,
                                catg: details.catg,
                                qnty: details.qnty,
                                ofprice: ofprice,
                                offerper: offerper


                            }
                        }).then((response) => {
                            resolve(details)
                            console.log("hiiiiiiiiiiiiii")
                        })

                    }

                }
                else {
                    let er = true        //here rejection happense when there is another product with the same name
                    reject(er)

                }
            }

            else {
                if (files.length != 0) {     // this case work when there is no existing product&file is there
                    let img = []
                    files.forEach(e => {
                        img.push(e.filename)

                    });
                    if (details.proofer === 'true') {

                        ofprice = (details.price) - ((details.price) * (details.offerper / 100))
                        offerper = details.offerper
                    }
                    else {

                        ofprice = (details.price) - ((details.price) * (rate / 100))
                        offerper = rate
                    }

                    await db.get().collection(collection.productcollection).updateOne({ _id: ObjectId(proid) }, {
                        $set: {
                            name: details.name,
                            price: details.price,
                            ofprice: details.ofprice,
                            discription: details.discription,
                            catg: details.catg,
                            qnty: details.qnty,
                            img: img,
                            ofprice: ofprice,
                            offerper: offerper



                        }
                    }).then((response) => {
                        resolve(details)
                        console.log("hii")
                    })
                }
                else {
                    if (details.proofer === 'true') {

                        ofprice = (details.price) - ((details.price) * (details.offerper / 100))
                        offerper = details.offerper
                    }
                    else {

                        ofprice = (details.price) - ((details.price) * (rate / 100))
                        offerper = rate
                    }
                    await db.get().collection(collection.productcollection).updateOne({ _id: ObjectId(proid) }, {
                        $set: {
                            name: details.name,
                            price: details.price,
                            ofprice: details.ofprice,
                            discription: details.discription,
                            catg: details.catg,
                            qnty: details.qnty,
                            ofprice: ofprice,
                            offerper: offerper



                        }
                    }).then((response) => {
                        resolve(details)
                        console.log("hii")
                    })

                }

            }




        })

    },
    getoneproduct: (proid) => {
        return new Promise(async (resolve, reject) => {
            let onepro = await db.get().collection(collection.productcollection).findOne({ _id: ObjectId(proid) })
            console.log(onepro)
            resolve(onepro)

        })

    },



    addcatagories: (catgory) => {
        catgory.catgoffer = 0
        console.log(catgory)
        return new Promise(async (resolve, reject) => {
            let existcatg = await db.get().collection(collection.catagories).findOne({ catg: catgory.catg })
            console.log(existcatg)
            if (existcatg) {
                let er = true
                reject(er)
            }
            else {
                await db.get().collection(collection.catagories).insertOne(catgory).then((data) => {
                    resolve(data)
                })

            }


        })


    },
    getcatagories: () => {
        return new Promise(async (resolve, reject) => {
            let catg = await db.get().collection(collection.catagories).find().toArray()
            resolve(catg)
        })
    },
    deletecatg: (proid) => {
        return new Promise(async (resolve, reject) => {
            let catg = await db.get().collection(collection.catagories).findOne({ _id: ObjectId(proid) })
            await db.get().collection(collection.catagories).deleteOne({ _id: ObjectId(proid) })
            await db.get().collection(collection.productcollection).deleteMany({ catg: catg.catg })
            resolve(true)

        })


    },
    getcatpro: (catgname, gt, lt) => {
        let response = {}
        // this is used to get all products with specific catgerory
        return new Promise(async (resolve, reject) => {
            let catgdoc = await db.get().collection(collection.catagories).findOne({ catg: catgname })
            console.log("catagory" + catgdoc)
            if (catgdoc) {
                let catgory = catgdoc.catg
                console.log(catgory + "realll")
                let pro = await db.get().collection(collection.productcollection).find({ catg: catgory }).toArray()
                let productlist = await db.get().collection(collection.productcollection).find({ catg: catgory }).limit(3).toArray()
                let pages = Math.ceil(pro.length / 3)
                response.pages = pages
                response.product = productlist
                console.log(response)
                resolve(response)
            }
            else {
                console.log("err")
            }

        })
    },
    getcatone: (proid) => {
        return new Promise(async (resolve, reject) => {
            let catg = await db.get().collection(collection.catagories).findOne({ _id: ObjectId(proid) })
            resolve(catg)

        })
    },
    editcatg: (proid, details) => {
        return new Promise(async (resolve, reject) => {
            let existcatg = await db.get().collection(collection.catagories).findOne({ catg: details.catg })

            if (existcatg) {
                if (existcatg._id.equals(ObjectId(proid))) {
                    console.log('true')
                    await db.get().collection(collection.catagories).updateOne({ _id: ObjectId(proid) }, {
                        $set: {
                            catg: details.catg
                        }
                    })

                    resolve(details)

                }
                else {

                    reject("invalid")
                }

            }
            else {
                let catgname = await db.get().collection(collection.catagories).findOne({ _id: ObjectId(proid) })
                await db.get().collection(collection.productcollection).updateMany({ catg: catgname.catg }, {
                    $set: {
                        catg: details.catg
                    }
                })

                await db.get().collection(collection.catagories).updateOne({ _id: ObjectId(proid) }, {
                    $set: {
                        catg: details.catg

                    }
                })
                resolve(details)
            }


        })
    },

    countcart: (userid) => {
        let count = 0
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.cart).findOne({ user: ObjectId(userid) })
            console.log(cart)
            if (cart) {
                console.log('hiicarttttttt')
                console.log(cart)
                console.log(cart.product)
                count = cart.product.length
                if (!count) {
                    await db.get().collection(collection.cart).deleteOne({ user: ObjectId(userid) })
                }

            }


            resolve(count)

        })

    },

    //this is to display the products in the cart
    getcart: (userid) => {
        return new Promise(async (resolve, reject) => {
            let cartlist = await db.get().collection(collection.cart).aggregate([
                {
                    $match: { user: ObjectId(userid) }
                }, {
                    $unwind: '$product'
                }, {
                    $project: {
                        item: '$product.item',
                        qnty: '$product.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'cartproducts'

                    }
                }, {
                    $project: {
                        item: 1, qnty: 1, cartpro: { $arrayElemAt: ["$cartproducts", 0] }
                    }
                }, {
                    $project: {
                        item: 1,
                        qnty: 1,
                        cartpro: 1,
                        tot: { $multiply: ['$cartpro.ofprice', '$qnty'] }    //this is to fing the price of a single product (productprice*qnty)
                    }
                }

            ]).toArray()
            console.log(cartlist)
            resolve(cartlist)

        })



    },

    // this is used to get the whole sum price of the cart
    totalprice: (userid) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.cart).aggregate([
                {
                    $match: { user: ObjectId(userid) }
                }, {
                    $unwind: '$product'
                }, {
                    $project: {
                        item: '$product.item',
                        qnty: '$product.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'cartproducts'

                    }
                }, {
                    $project: {
                        item: 1, qnty: 1, cartpro: { $arrayElemAt: ["$cartproducts", 0] }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ["$qnty", "$cartpro.ofprice"] } }
                    }
                }

            ]).toArray()
            if (total) {
                console.log(total)
                resolve(total[0].total)
                console.log(total[0].total)

            }
            else {
                reject(null)
            }



        })
    },

    //this is to get the total price from the cart collection

    gettotal: (userid) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.cart).findOne({ user: ObjectId(userid) })

            resolve(cart)

        })

    },





    //-----------------------------------------cart section------------------------------------------------------------//


    addcart: (userid, proid) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let pro = await db.get().collection(collection.productcollection).findOne({ _id: ObjectId(proid) })
            console.log('88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888')

            if (pro.qnty > 0) {
                let proobj = {
                    item: ObjectId(proid),
                    quantity: 1
                }
                let existcart = await db.get().collection(collection.cart).findOne({ user: ObjectId(userid) })
                if (existcart) {
                    console.log('88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888')



                    let proexist = existcart.product.findIndex(products => products.item == proid)

                    if (proexist != -1) {
                        let c = await db.get().collection(collection.cart).aggregate([{
                            $match: {
                                $and: [{ user: ObjectId(userid) }, { product: { $elemMatch: { item: ObjectId(proid) } } }]
                            }
                        }, {
                            $unwind: '$product'
                        }, {
                            $match: {
                                'product.item': ObjectId(proid)
                            }
                        }, {
                            $project: {
                                'product.quantity': 1
                            }
                        }]).toArray()
                        let cqnty = c[0].product.quantity
                        console.log(cqnty)
                        if (pro.qnty > cqnty) {
                            await db.get().collection(collection.cart).updateOne({ user: ObjectId(userid), 'product.item': ObjectId(proid) }, {

                                $inc: { 'product.$.quantity': 1 }


                            })
                            response.inc = true
                            resolve(response)
                        }
                        else {
                            console.log('limit stock exeed')
                            let cartadd = true
                            reject(cartadd)
                        }


                    }
                    else {
                        await db.get().collection(collection.cart).updateOne({ user: ObjectId(userid) }
                            , {
                                $push: {
                                    product: proobj
                                }

                            })
                        response.add = true
                        resolve(response)
                    }
                }

                else {
                    let cartobj = {
                        user: ObjectId(userid),
                        product: [proobj]
                    }
                    await db.get().collection(collection.cart).insertOne(cartobj)
                    response.add = true
                    resolve(response)
                }
            }
            else {
                let cartadd = true
                reject(cartadd)
            }




        })


    },
    changequantity: ({ cart, pro, count, qnty, price }) => {
        let cnt = parseInt(count)
        let qnt = parseInt(qnty)

        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.productcollection).findOne({ _id: ObjectId(pro) })
            console.log(product)
            let proqnty = parseInt(product.qnty)


            let ca = await db.get().collection(collection.cart).findOne({ 'product.item': ObjectId(pro) })
            console.log(ca.product[0].item)
            if (count == -1 && qnt == 1 || count == +1 && qnty >= proqnty) {
                reject(true)


            }
            else {
                await db.get().collection(collection.cart).updateOne({ _id: ObjectId(cart), 'product.item': ObjectId(pro) }, {

                    $inc: { 'product.$.quantity': cnt }


                })


                console.log('hii')
                resolve(pro)
            }



        })

    },
    //this is to remove the cart products

    removecart: (cartpro, cart) => {
        return new Promise(async (resolve, reject) => {
            console.log('clear cart')
            let cartcol = await db.get().collection(collection.cart).findOne({ _id: ObjectId(cart) })
            let cartlength = cartcol.product.length
            await db.get().collection(collection.cart).updateOne({ _id: ObjectId(cart) }, {
                $pull: { product: { item: ObjectId(cartpro) } }

            })
            if (cartlength == 1) {
                db.get().collection(collection.cart).deleteOne({ _id: ObjectId(cart) })
                console.log("cleared cart fullly")
            }
            console.log('reached x')

            resolve(true)

        })

    },
    //--------------------------------------------order section--------------------------------------------//

    getorderpro: (userid) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.cart).findOne({ user: ObjectId(userid) })
            console.log(products.product)
            resolve(products.product)

        })

    },
    placeorder: (order, product, total, address, user, discper) => {
        console.log(product)

        return new Promise(async (resolve, reject) => {
            let date = new Date()
            let status
            let payed
            if (order.payment === 'COD') {
                status = 'placed'
                payed = true
            }
            else {
                status = 'pending'
                payed = false
            }


            product.forEach(async e => {
                e.status = status
                e.payed = payed

            });


            let orderobj = {
                address: address,
                product: product,
                userid: ObjectId(user),
                amount: total,
                payment: order.payment,
                date: date,
                shiped: false,
                discper: discper


            }
            console.log(orderobj)


            await db.get().collection(collection.order).insertOne(orderobj).then((response) => {
                resolve((response.insertedId).toString(), orderobj.amount)

            })
            await db.get().collection(collection.cart).updateOne({ user: ObjectId(user) }, {
                $set: {
                    total: total
                }
            })
            await db.get().collection(collection.coupoun).updateOne({ code: order.coup }, {
                $push: {
                    user: ObjectId(order.userid)
                }
            })
            /* await db.get().collection(collection.coupoun).updateOne({code:order.coup},{$inc:{
                 exp:-1
             }})*/







        })
    },
    getorder: (userid) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.order).deleteMany({'product.status':"pending"})    
            let orders = await db.get().collection(collection.order)
                .aggregate([{
                    $match: {
                        userid: ObjectId(userid)
                    }
                }, {
                    $project: {
                        address: 1,
                        amount: 1,
                        payment: 1,
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    }
                }]).toArray()
         
           console.log('------------------------------------------------------------------------------')
            resolve(orders)
        })

    },

    // this is to show the invoice of to the user

    orddetails: (userid) => {
        return new Promise(async (resolve, reject) => {
            let cartlist = await db.get().collection(collection.cart).aggregate([
                {
                    $match: { user: ObjectId(userid) }
                }, {
                    $unwind: '$product'
                }, {
                    $project: {
                        product: '$product.item',
                        qnty: '$product.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'product',
                        foreignField: '_id',
                        as: 'orderedproducts'
                    }
                }, {
                    $project: {
                        product: 1,
                        qnty: 1,
                        products: { $arrayElemAt: ['$orderedproducts', 0] },
                    }

                }, {
                    $project: {
                        proid: '$products._id',
                        name: '$products.name',
                        price: '$products.ofprice',
                        stock: '$products.qnty',
                        qnty: 1,
                        total: { $multiply: ['$products.ofprice', "$qnty"] },
                        img: '$products.img'


                    }
                }




            ]).toArray()
            console.log("hereis---------------------------------")
            console.log(cartlist)

            resolve(cartlist)

        })



    },


    // deleting the cart and managing the stock
    cartclear: (userid) => {
        return new Promise(async (resolve, reject) => {
            console.log('reached cart clear')
            let cartitems = await db.get().collection(collection.cart).findOne({ user: ObjectId(userid) })


            cartitems.product.forEach(element => {
                let id = (element.item).toString()
                let itemqnty = 0 - parseInt(element.quantity)
                console.log(itemqnty)
                db.get().collection(collection.productcollection).updateMany({ _id: ObjectId(id) }, {
                    $inc: { qnty: itemqnty }
                })


            });
            db.get().collection(collection.cart).deleteMany({ user: ObjectId(userid) })
            console.log('finifshed')
            resolve(true)

        })

    },

    // this helper is used to pull the products from the cart if it has 0 qnty

    check: () => {
        return new Promise(async (resolve, reject) => {
            let proid = await db.get().collection(collection.productcollection).find({ qnty: { $lt: 1 } }).toArray()
            console.log(proid)
            proid.forEach(async (e) => {
                let id = e._id
                id = id.toString()
                console.log(id)
                await db.get().collection(collection.cart).update({ 'product.item': ObjectId(id) }, {
                    $pull: { product: { item: ObjectId(id) } }
                })
            })
            console.log('finish pulinggggg')
            resolve(proid)
        })

    },

    //---------------------------------------------payment methods integrating-------------------------------------------------------//


    generaterazorpay: (orderid, total) => {
        console.log(orderid)
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: 'INR',
                receipt: orderid
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err)
                }
                else {


                    resolve(order)
                }
            })
        })

    },
    generatewall: (total, userid, orderid) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.usercollection).findOne({ _id: ObjectId(userid) })
            console.log(user)
            let balance = user.walet.balance
            console.log(user.walet.balance)
            if (balance < total) {
                let er = true
                reject(er)
            }
            else {
                let ab = await db.get().collection(collection.order).aggregate([{
                    $match: {
                        _id: ObjectId(orderid),

                    }
                }, {
                    $unwind: '$product'
                },
                {
                    $project: {
                        product: 1
                    }
                }]).toArray()
                console.log(ab)
                ab.forEach(async e => {
                    let proid = (e.product.item).toString()
                    console.log(proid)
                    await db.get().collection(collection.order).updateOne({ _id: ObjectId(orderid), 'product.item': ObjectId(proid) }, {
                        $set: {
                            'product.$.status': "placed",
                            'product.$.shiped': false,
                            'product.$.payed': true,
                            'product.$.del': false,
                            'product.$.ret': false
                        }
                    })

                });
                let walet = true
                resolve(walet)
                total = -total
                let history = {
                    date:new Date().toDateString(),
                    message:"amount debited for purchase",
                    amount:total,
                    debit:true
                }
                db.get().collection(collection.usercollection).updateOne({ _id: ObjectId(userid) }, {
                    $inc: { 'walet.balance': total },$push:{'walet.credit':history}
                })
            }

        })

    },

    verifypay: (details) => {
        return new Promise(async (resolve, reject) => {
            console.log('reached heree')
            const crypto = require('crypto')
            hmac = crypto.createHmac('sha256', 'onLPLplVOlVeOhqHxwOgJ5H4');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            console.log(hmac)
            if (hmac == details['payment[razorpay_signature]']) {
                console.log('reached resolve')

                resolve()
            }
            else {
                reject()
            }
        })

    },

    generatepaypal: (orderid, total) => {

        return new Promise((resolve, reject) => {
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/sucess",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "item",
                            "price": total,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {

                        "currency": "USD",
                        "total": total,
                    },
                    "description": "This is the payment description."
                }]
            };


            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    console.log("Create Payment Response");
                    resolve(payment);
                }
            });
        })

    },

    changestatus: (orderid) => {

        console.log(orderid)
        console.log('reached statuss change')
        return new Promise(async (resolve, reject) => {
            let ab = await db.get().collection(collection.order).aggregate([{
                $match: {
                    _id: ObjectId(orderid),

                }
            }, {
                $unwind: '$product'
            },
            {
                $project: {
                    product: 1
                }
            }]).toArray()
            console.log(ab)
            ab.forEach(async e => {
                let proid = (e.product.item).toString()
                console.log(proid)
                await db.get().collection(collection.order).updateOne({ _id: ObjectId(orderid), 'product.item': ObjectId(proid) }, {
                    $set: {
                        'product.$.status': "placed",
                        'product.$.shiped': false,
                        'product.$.payed': true,
                        'product.$.del': false,
                        'product.$.ret': false
                    }
                })

            });
            resolve(true)
        })




    },

    filter: (data) => {
        let response = {}
        let lt = parseInt(data.lt)
        let gt = parseInt(data.gt)
        let catg = (data.catg)
        console.log(gt, lt)
        return new Promise(async (resolve, reject) => {
            let pro = await db.get().collection(collection.productcollection).find({ $and: [{ catg: catg }, { ofprice: { $gte: lt, $lte: gt } }] }).toArray()
            response.product = pro
            console.log(response)
            resolve(response)
        })



    },

    search: (data) => {

        data = data.trim()
        console.log(data)
        return new Promise(async (resolve, reject) => {
            let search = await db.get().collection(collection.productcollection).find({ name: { $regex: new RegExp('^' + data + '+', 'i') } }).toArray()
            console.log(search)
            search = search.slice(0, 6)
            resolve(search)

        })

    },
    paginate: (page) => {
        console.log(page.page)
        console.log(page.catg)
        let p = parseInt(page.page)
        let catg = page.catg
        return new Promise(async (resolve, reject) => {
            let pro = await db.get().collection(collection.productcollection).find({ catg: catg }).limit(3).skip((p - 1) * 3).toArray()

            resolve(pro)
        })

    },














    //    USERS DETAILS VISIBLE TO THE USER

    getuser: (user) => {

        return new Promise(async (resolve, reject) => {
            let details = await db.get().collection(collection.usercollection).find({ _id: ObjectId(user) }).toArray()
            resolve(details)

        })
    },
    addadress: (data, user) => {
        let response = {}
        data.user = ObjectId(data.user)
        return new Promise(async (resolve, reject) => {
            let exist = await db.get().collection(collection.address).find({ user: ObjectId(user) }).toArray()
            if (exist.length < 3) {


              await db.get().collection(collection.address).insertOne(data)
                response.status = true
                resolve(response)
            }
            else {
                response.status = false
                reject(response)
            }



        })

    },
    getaddress: (userid) => {
        console.log(userid)
        return new Promise(async (resolve, reject) => {
            let add = await db.get().collection(collection.address).find({ user: ObjectId(userid) }).toArray()
            resolve(add)

        })
    },
    getwallet: (userid) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.usercollection).find({ _id: ObjectId(userid) }).toArray()
            console.log(user[0].walet.credit)
            let walet = user[0].walet.credit
            resolve(walet)

        })

    },
    // this helper is used to get the address in which the product orderd
    getoneaddress: (addid) => {
        return new Promise(async (resolve, reject) => {
            let adress = await db.get().collection(collection.address).findOne({ _id: ObjectId(addid) })
            resolve(adress)

        })
    },
    // this is to show the details of products ordered by the user
    orderprodetails: (orderid) => {
        return new Promise(async (resolve, reject) => {
            let prodetails = await db.get().collection(collection.order).aggregate([
                {
                    $match: { _id: ObjectId(orderid) }
                }, {
                    $unwind: '$product'
                }, {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity',
                        status: '$product.status',
                        shiped: '$product.shiped',
                        payed: '$product.payed',
                        del: '$product.del',
                        ret: '$product.ret',
                        payment:1,
                        date:1,
                        discper: 1

                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'orderproducts'


                    }
                }, {
                    $project: {
                        item: 1, quantity: 1, status: 1, shiped: 1, payed: 1, del: 1, ret: 1, discper: 1,payment:1,date:1,
                        orderproducts: { $arrayElemAt: ['$orderproducts', 0] }
                    }
                }, {
                    $project: {

                        item: 1,
                        quantity: 1,
                        orderproducts: 1,
                        status: 1,
                        shiped: 1,
                        payed: 1,
                        del: 1,
                        ret: 1,
                        discper: 1,
                        payment:1,
                        date:1,
                        total: { $multiply: ['$orderproducts.ofprice', '$quantity'] },

                    }
                }
            ]).toArray()
            console.log(prodetails)
            resolve(prodetails)
            /* let refund = Math.round(total)
             await db.get().collection(collection.usercollection).updateOne({_id:ObjectId(userid)},{$inc:{'walet.balance':}})*/

        })
    },
    // this is to show the total amount money purchased by the user in the user window
    getamount: (ordid) => {
        return new Promise(async (resolve, reject) => {
            let amaount = await db.get().collection(collection.order).aggregate([{
                $match: {
                    _id: ObjectId(ordid)
                }
            }, {
                $project: {
                    amount: 1
                }
            }]).toArray()
            console.log(amaount[0].amount)
            resolve(amaount[0].amount)


        })
    },







    // this is to remove the add in userprofile page here we have no limit to remove

    deleteadd: (adid) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.address).remove({ _id: ObjectId(adid) }).then((response) => {
                resolve(true)
            })
        })

    },

    // this is to  remove add in checkout page here we need 1 address minimum

    removeadd: (adid) => {
        return new Promise(async (resolve, reject) => {
            let add = await db.get().collection(collection.address).find().toArray()

            if (add.length != 6) {
                await db.get().collection(collection.address).remove({ _id: ObjectId(adid) }).then((response) => {
                    resolve(true)
                })
            }
            else {
                let er = true
                reject(er)
            }
        })

    },

    //this is edit the delevery address

    getadd: (adid) => {
        return new Promise(async (resolve, reject) => {
            let add = await db.get().collection(collection.address).findOne({ _id: ObjectId(adid) })

            resolve(add)
            console.log(add)

        })
    },

    editadd: (details, adid) => {
        console.log(details)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.address).updateOne({ _id: ObjectId(adid) }, {
                $set: {
                    name: details.name,
                    email: details.email,
                    phone: details.phone,
                    add: details.add,
                    city: details.city,
                    state: details.state,
                    pin: details.pin
                }
            })
            resolve(true)
        })

    },


    deleteorder: (orderid) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.order).remove({ _id: ObjectId(orderid) }).then((response) => {
                resolve(true)
            })
        })
    },

    // change the status of the order by user

    changeorder: (details,userid) => {
        let ordid = details.ordid
        let proid = details.proid
        let status = details.status
        let pay = details.pay
        let total = parseInt(details.total)
        let disc = parseInt(details.disc)
         return new Promise(async (resolve, reject) => {
                let ab = await db.get().collection(collection.order).aggregate([{
                    $match: {
                        _id: ObjectId(ordid),

                    }
                }, {
                    $unwind: '$product'
                }, {
                    $match: {
                        'product.item': ObjectId(proid)
                    }
                }, {
                    $project: {
                        product: 1
                    }
                }]).toArray()
                ab.forEach(async e => {
                    let proid = (e.product.item).toString()
                    await db.get().collection(collection.order).updateOne({ _id: ObjectId(ordid), 'product.item': ObjectId(proid) }, {
                        $set: {
                            'product.$.status': false,
                            'product.$.shiped': false,
                            'product.$.payed': false
                        }
                    })

                });

                let orp = await db.get().collection(collection.order).aggregate([{
                    $match: { _id: ObjectId(ordid) }
                }, {
                    $unwind: '$product'
                }, {
                    $match: {
                        'product.item': ObjectId(proid)
                    }

                }, {
                    $project: {
                        product: 1
                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'product.item',
                        foreignField: '_id',
                        as: 'ordpro'
                    }
                }, {
                    $project: {
                        quantity: '$product.quantity',
                        ordpro: { $arrayElemAt: ['$ordpro', 0] }

                    }
                }]).toArray()

                console.log(orp)
                orp.forEach(async (e) => {
                    let id = e.ordpro._id
                    id = id.toString()
                    let cq = e.quantity
                    let pq = e.ordpro.qnty
                    console.log(id)
                    console.log(cq)
                    console.log(pq)
                    await db.get().collection(collection.productcollection).updateMany({ _id: ObjectId(id) }, {
                        $inc: { qnty: cq }

                    })

                });




                console.log(ab)

                resolve(true)
                if(pay != 'COD'){
                

                    
                
                let ref = Math.round(total - (total * (disc / 100)))
                let history = {
                    date:new Date().toDateString(),
                    message:"product cancel amount credited",
                    amount:ref,
                    debit:false
                }
                
                await db.get().collection(collection.usercollection).updateOne({ _id: ObjectId(userid) }, { $inc: { 'walet.balance': ref },$push:{
                    'walet.credit':history
                } })
                }
            })
        
        
        
    },
    return:(details,userid)=>{
        let ordid = details.orderid
        let proid = details.proid
        let reason = details.res
        let total = parseInt(details.total)
        let disc = parseInt(details.disc)
        
            console.log('reached returnedd')
           
            return new Promise(async (resolve, reject) => {
                let opro = await db.get().collection(collection.order).aggregate([{
                    $match: {
                        _id: ObjectId(ordid),

                    }
                }, {
                    $unwind: '$product'
                }, {
                    $match: {
                        'product.item': ObjectId(proid)
                    }
                }, {
                    $project: {
                        product: 1
                    }
                }]).toArray()
                opro.forEach(async e => {
                    let proid = (e.product.item).toString()
                    await db.get().collection(collection.order).updateOne({ _id: ObjectId(ordid), 'product.item': ObjectId(proid) }, {
                        $set: {
                            'product.$.ret': true,
                            'product.$.status': 'Return processing',
                        }
                    })

                });
                
                resolve(true)
               
               
            })



        

    },
    applyofr: (cpn) => {
        console.log(cpn)
        let response = {}
        let coupn = cpn.cpn
        let userid = cpn.user
        return new Promise(async (resolve, reject) => {
            let cpndetails = await db.get().collection(collection.coupoun).findOne({ code: coupn })
            if (cpndetails) {
                let user = cpndetails.user
                console.log(user)

                user.forEach(e => {
                    console.log(e.toString())
                    console.log(userid)
                    if (e.toString() == userid) {
                        response.expiry = true
                        reject(response)

                    }

                });


                let total = Math.round((cpn.total) - ((cpn.total) * (cpndetails.discount / 100)))
                let reduce = Math.round((cpn.total) - total)
                response.total = total
                response.discount = cpndetails.discount
                response.coupn = coupn
                response.reduce = reduce

                resolve(response)



            }
            else {
                response.invalid = true
                reject(response)
            }





        })

    }
}

