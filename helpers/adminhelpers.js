var db = require('../coinfig/connection')
var collection = require('../coinfig/collection')
const { ObjectId } = require('mongodb')
let fs = require('fs')
module.exports = {
    loginadmin: (userdata) => {
        let loginstatus = false
        let response = {}
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.admindetails).findOne({ name: userdata.name })
            if (admin) {
                let pass = await db.get().collection(collection.admindetails).findOne({ pass: userdata.pass }).then((status) => {

                    if (status) {
                        response.admin = admin
                        response.status = true // this is to check whether user is there
                        resolve(response)
                        console.log("sucess")
                    }
                    else {

                        console.log("failed")
                        resolve({ status: false })
                    }
                })

            }
            else {
                reject(response)
            }
        })

    },

    // this dispaly all the orders done by different users

    getorders: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.order).deleteMany({'product.status':"pending"})  
            let order = await db.get().collection(collection.order).aggregate([{
                $lookup: {
                    from: collection.usercollection,
                    localField: 'userid',
                    foreignField: '_id',
                    as: 'client'                              //this lookup is used to get the username of the customer 
                }
            }, {
                $project: {
                    address: 1,
                    amount: 1,
                    // status:1,
                    payment: 1,
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    // shiped:1,
                    // notpay:1,
                    product: 1,
                    username: { $arrayElemAt: ['$client', 0] }
                }
            }]).toArray()
            console.log(order)

            resolve(order)

        })

    },
    getreturn: () => {
        return new Promise(async (resolve, reject) => {
            let ret = await db.get().collection(collection.order).aggregate([{
                $unwind: '$product'
            }, {
                $project: {
                    product: 1,
                    amount: 1,
                    payment: 1,
                    userid: 1,
                    discper: 1
                }
            }, {
                $match: {
                    'product.ret': true
                }
            }, {
                $lookup: {
                    from: collection.productcollection,
                    localField: 'product.item'.toString(),
                    foreignField: '_id',
                    as: 'returnproducts'
                }
            }, {
                $project: {
                    product: 1,
                    returnproducts: { $arrayElemAt: ['$returnproducts', 0] },
                    //price:{$multiply:['returnproducts.ofprice','product.quantity']},
                    name: '$returnproducts.name',
                    image: '$returnproducts.img',
                    price: '$returnproducts.ofprice',
                    quantity: '$product.quantity',
                    payment: 1,
                    userid: 1,
                    discper: 1
                }
            }, {
                $project: {
                    product: 1,
                    name: { $arrayElemAt: ['$name', 0] },
                    image: { $arrayElemAt: ['$image', 0] },
                    quantity: 1,
                    price: { $arrayElemAt: ['$price', 0] },
                    payment: 1,
                    userid: 1,
                    discper: 1
                }
            }, {
                $project: {
                    product: 1,
                    name: 1,
                    image: 1,
                    quantity: 1,
                    price: 1,
                    payment: 1,
                    userid: 1,
                    discper: 1,
                    totprice: { $multiply: ['$price', '$quantity'] },

                }
            }]).toArray()
            console.log(ret)
            resolve(ret)

        })

    },
    shipproduct: (status, proid, ordid) => {
        console.log(status, proid, ordid)
        return new Promise(async (resolve, reject) => {
            let ship
            if (status == "shiped") {
                stat = "shipped"
                del = false
                ship = true
                payed = true
            }
            else {
                stat = "Delevered"
                del = true
                ship = true
                payed = true
            }

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
                        'product.$.status': stat,
                        'product.$.del': del,
                        'product.$.shiped': ship,
                        'product.$.payed': payed
                    }
                })

            });
            console.log(ab)





            if (status == 'cancel') {

                //this is to increase the product quantity when an item get canceled 
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


            }
            resolve(true)

        })
    },

    /*  admincancel:(orderid)=>{
          return new Promise(async(resolve, reject) => {
              await db.get().collection(collection.order).updateOne({_id:ObjectId(orderid)},{$set:{
                  status:false
              }})
              resolve(true)
          })
      },*/

    orddetails: (orderid) => {
        return new Promise(async (resolve, reject) => {

            let orddetails = await db.get().collection(collection.order).aggregate([{
                $match: {
                    _id: ObjectId(orderid)
                }
            }, {
                $unwind: '$product'
            }, {
                $project: {

                    product: '$product.item',
                    qnt: '$product.quantity',
                    status: '$product.status',
                    shiped: '$product.shiped',
                    payed: '$product.payed',
                    del: '$product.del',
                    ret: '$product.ret'

                }
            }, {
                $lookup: {
                    from: collection.productcollection,
                    localField: 'product',
                    foreignField: '_id',
                    as: 'orderproducts'
                }
            }, {
                $project: {
                    product: 1,
                    qnt: 1,
                    products: { $arrayElemAt: ['$orderproducts', 0] },
                    status: 1,
                    shiped: 1,
                    payed: 1,
                    del: 1,
                    ret: 1
                }
            }, {
                $project: {

                    product: 1,
                    qnt: 1,
                    products: 1,
                    status: 1,
                    shiped: 1,
                    payed: 1,
                    del: 1,
                    ret: 1,
                    total: { $multiply: ['$products.ofprice', '$qnt'] },

                }
            }]).toArray()
            console.log(orddetails)
            resolve(orddetails)
        })


    },
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
            },]).toArray()
            console.log(amaount[0].amount)
            resolve(amaount[0].amount)


        })
    },
    getsalesall: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collection.order).aggregate([
                {
                    $unwind: '$product'
                }, {
                    $match: {
                        'product.payed': true,
                        'product.del':true
                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'product.item',
                        foreignField: '_id',
                        as: 'orderproducts'
                    }
                }, {
                    $project: {
                        'product.quantity': 1,
                        'product.status': 1,
                        date: 1,
                        products: { $arrayElemAt: ['$orderproducts', 0] },


                    }
                }, {
                    $project: {
                        quantity: '$product.quantity',
                        productprice: '$products.ofprice',
                        date: 1,


                        total: { $multiply: ['$products.ofprice', '$product.quantity'] },

                    }
                }, {
                    $sort: {
                        date: -1
                    }
                }, {
                    $group: {
                        _id: {
                            day: { $dayOfMonth: "$date" },
                            month: { $month: "$date" },

                            year: { $year: "$date" }
                        },
                        products: { $sum: '$quantity' },
                        revenue: { $sum: '$total' },



                    }
                }, {
                    $project: {
                        revenue: 1,
                        products: 1,

                    }
                },
            ]).toArray()

            resolve(sales)
        })
    },
    getuser: () => {
        return new Promise(async (resolve, reject) => {
            let userdata = await db.get().collection(collection.usercollection).find().toArray()
            resolve(userdata.length)

        })

    },
    getwekly: () => {
        return new Promise(async (resolve, reject) => {
            let wsales = await db.get().collection(collection.order).aggregate([
                {
                    $unwind: '$product'
                }, {
                    $match: {
                        'product.payed': true,
                        'product.del':true
                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'product.item',
                        foreignField: '_id',
                        as: 'orderproducts'
                    }
                }, {
                    $project: {
                        'product.quantity': 1,
                        'product.status': 1,
                        date: 1,
                        products: { $arrayElemAt: ['$orderproducts', 0] },


                    }
                }, {
                    $project: {
                        quantity: '$product.quantity',
                        productprice: '$products.ofprice',
                        date: 1,
                        total: { $multiply: ['$products.ofprice', '$product.quantity'] },

                    }
                }, {
                    $sort: {
                        date: -1
                    }
                }, {
                    $group: {
                        _id: { $week: '$date' },
                        products: { $sum: '$quantity' },
                        revenue: { $sum: '$total' },



                    }
                }, {
                    $project: {
                        revenue: 1,
                        products: 1,

                    }
                },
            ]).toArray()
            console.log(wsales)
            resolve(wsales)

        })


    },

    getyear: () => {
        return new Promise(async (resolve, reject) => {
            let ysales = await db.get().collection(collection.order).aggregate([
                {
                    $unwind: '$product'
                }, {
                    $match: {
                        'product.payed': true,
                        'product.del':true
                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'product.item',
                        foreignField: '_id',
                        as: 'orderproducts'
                    }
                }, {
                    $project: {
                        'product.quantity': 1,
                        'product.status': 1,
                        date: 1,
                        products: { $arrayElemAt: ['$orderproducts', 0] },


                    }
                }, {
                    $project: {
                        quantity: '$product.quantity',
                        productprice: '$products.ofprice',
                        date: 1,

                        total: { $multiply: ['$products.ofprice', '$product.quantity'] },

                    }
                }, {
                    $sort: {
                        date: -1
                    }
                }, {
                    $group: {
                        _id: { $year: '$date' },
                        products: { $sum: '$quantity' },
                        revenue: { $sum: '$total' },



                    }
                }, {
                    $project: {
                        revenue: 1,
                        products: 1,

                    }
                },
            ]).toArray()
            console.log('yearly.......')
            console.log(ysales)
            resolve(ysales)

        })


    },
    getmonth: () => {
        return new Promise(async (resolve, reject) => {
            let ysales = await db.get().collection(collection.order).aggregate([
                {
                    $unwind: '$product'
                }, {
                    $match: {
                        'product.payed': true,
                        'product.del':true
                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'product.item',
                        foreignField: '_id',
                        as: 'orderproducts'
                    }
                }, {
                    $project: {
                        'product.quantity': 1,
                        'product.status': 1,
                        date: 1,
                        products: { $arrayElemAt: ['$orderproducts', 0] },


                    }
                }, {
                    $project: {
                        quantity: '$product.quantity',
                        productprice: '$products.ofprice',
                        date: 1,

                        total: { $multiply: ['$products.ofprice', '$product.quantity'] },

                    }
                }, {
                    $sort: {
                        date: -1
                    }
                }, {
                    $group: {
                        _id: { $month: '$date' },
                        products: { $sum: '$quantity' },
                        revenue: { $sum: '$total' },



                    }
                }, {
                    $addFields: {
                        month: {
                            $let: {
                                vars: {
                                    monthsInString: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec']
                                },
                                in: {
                                    $arrayElemAt: ['$$monthsInString', '$_id']
                                }
                            }
                        }
                    }
                }, {
                    $project: {
                        revenue: 1,
                        products: 1,
                        month: 1

                    }
                },
            ]).toArray()
            console.log('yearly.......')
            console.log(ysales)
            resolve(ysales)

        })


    },


    baners: (img) => {
        return new Promise(async (resolve, reject) => {
            let baner = await db.get().collection(collection.baners).find().toArray()
           /* if(baner[0].imgar.length){
                let bn = baner[0].imgar
                bn.forEach(e => {
                    fs.unlinkSync('public/'+e)
                    
                });

            }*/
           
            let imgar = []
            img.forEach(e => {
                imgar.push(e.path.slice(7))
            });
            await db.get().collection(collection.baners).updateOne({}, {
                $set: {
                    imgar: imgar
                }
            }, { upsert: true })
            console.log('fini')
            resolve(true)


        })

    },
    getbaners: () => {
        return new Promise(async (resolve, reject) => {
            let img = await db.get().collection(collection.baners).find().toArray()
            resolve(img)

        })

    },
    catgofer: (offer) => {
        let rate = parseInt(offer.ofer)
        let catg = offer.catg
        return new Promise(async (resolve, reject) => {
            let p = await db.get().collection(collection.productcollection).aggregate([{
                $match: {
                    catg: catg,
                    proofer: false

                }
            },

            ]).toArray()
            console.log(p)
            p.forEach(async (e) => {
                let catgoffer = (e.price) - ((e.price) * (rate / 100))
                catgoffer = Math.round(catgoffer)
                console.log(catgoffer)
                await db.get().collection(collection.productcollection).updateOne({ _id: e._id }, {
                    $set: {
                        ofprice: catgoffer,
                        offerper: rate,
                        

                    }
                })


            });
            await db.get().collection(collection.catagories).updateOne({ catg: catg }, {
                $set: {
                    catgoffer: rate
                }
            })
            resolve(true)

        })

    },
    delcatgofer: (catg) => {
        let rate = 0

        return new Promise(async (resolve, reject) => {
            let p = await db.get().collection(collection.productcollection).aggregate([{
                $match: {
                    catg: catg,
                    proofer: false

                }
            },

            ]).toArray()
            console.log(p)
            p.forEach(async (e) => {
                let catgoffer = Math.round(e.price) - ((e.price) * (rate / 100))
                await db.get().collection(collection.productcollection).updateOne({ _id: e._id }, {
                    $set: {
                        ofprice: catgoffer,
                        offerper: 0
                    }
                })


            });
            await db.get().collection(collection.catagories).updateOne({ catg: catg }, {
                $set: {
                    catgoffer: 0
                }
            })
            resolve(true)

        })

    },
    proofer: (offer) => {
        let rate = parseInt(offer.ofer)
        let product = offer.proid
        return new Promise(async (resolve, reject) => {
            let p = await db.get().collection(collection.productcollection).findOne({ _id: ObjectId(product) })
            console.log(p)

            let productoffer = (p.price) - ((p.price) * (rate / 100))
            productoffer = Math.round(productoffer)
            console.log(productoffer)
            await db.get().collection(collection.productcollection).updateOne({ _id: ObjectId(product) }, {
                $set: {
                    ofprice: productoffer,
                    offerper: rate,
                    proofer: true

                }
            })
            resolve(true)

        })

    },
    delofer: (proid) => {


        return new Promise(async (resolve, reject) => {
            let p = await db.get().collection(collection.productcollection).findOne({ _id: ObjectId(proid) })
            let catg = p.catg
            let catgory = await db.get().collection(collection.catagories).findOne({ catg: catg })
            let rate = catgory.catgoffer
            console.log(p)
            let offprice = Math.round(p.price) - ((p.price) * (rate / 100))
            offprice = Math.round(offprice)
            await db.get().collection(collection.productcollection).updateOne({ _id: ObjectId(proid) }, {
                $set: {
                    ofprice: offprice,
                    proofer: false,
                    offerper: rate
                }
            })
            resolve(true)

        })

    },
    getcpn: () => {
        return new Promise(async (resolve, reject) => {
            let cpn = await db.get().collection(collection.coupoun).find().toArray()
            console.log(cpn)
            resolve(cpn)

        })

    },
    addcpn: (cpn) => {
        cpn.user = []
        let code = cpn.code
        //  let exp = parseInt(cpn.exp)
        //  cpn.exp = exp
        return new Promise(async (resolve, reject) => {
            let exist = await db.get().collection(collection.coupoun).findOne({ code: code })
            console.log(exist)
            if (exist) {
                reject(true)
            }
            else {
                await db.get().collection(collection.coupoun).insertOne(cpn)
                resolve(true)
            }

        })

    },
    delcpn: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.coupoun).deleteOne({ _id: ObjectId(id) })
            resolve(true)

        })
    },
   
    aproveret: (details) => {
        let orderid = details.ordid
        let proid = details.proid
        let userid = details.user
        let amount = parseInt(details.total)
        let refund = Math.round((amount) - (amount * (details.discper / 100)))
        console.log(refund)
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.order).aggregate([{
                $match: {
                    _id: ObjectId(orderid)
                }
            }, {
                $unwind: '$product'
            }, {
                $match: {
                    'product.item': ObjectId(proid)
                }
            }]).toArray()
            order.forEach(async e => {
                let proid = (e.product.item).toString()
                await db.get().collection(collection.order).updateOne({ _id: ObjectId(orderid), 'product.item': ObjectId(proid) }, {
                    $set: {
                        'product.$.status': false,
                        'product.$.shiped': false,
                        'product.$.payed': false,
                        'product.$.del' :false,
                        'product.$.ret': true
                    }
                })

            });

            let orp = await db.get().collection(collection.order).aggregate([{
                $match: { _id: ObjectId(orderid) }
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

            let history = {
                date: new Date().toDateString(),
                message: "refunt amount credited",
                amount: refund,
                debit: false
            }
            await db.get().collection(collection.usercollection).updateOne({ _id: ObjectId(userid) }, {
                $inc: { 'walet.balance': refund }, $push: { 'walet.credit': history }
            })


            resolve(true)

        })

    },
    delban: () => {
        return new Promise(async (resolve, reject) => {
            let baner = await db.get().collection(collection.baners).find().toArray()
            if(baner[0].imgar.length){
                let bn = baner[0].imgar
                bn.forEach(e => {
                    fs.unlinkSync('public/'+e)
                    
                });

            }
            
            await db.get().collection(collection.baners).updateOne({}, {
                $set: {
                    imgar: []
                }
            })
            resolve(true)


        })

    },
    
    orderfilter:(from,to)=>{
    
        return new Promise(async(resolve, reject) => {
            let sales = await db.get().collection(collection.order).aggregate([
                {
                    $unwind: '$product'
                }, {
                    $match: {
                        'product.payed': true,
                        'product.del':true
                    }
                }, {
                    $lookup: {
                        from: collection.productcollection,
                        localField: 'product.item',
                        foreignField: '_id',
                        as: 'orderproducts'
                    }
                }, {
                    $project: {
                        'product.quantity': 1,
                        'product.status': 1,
                        date: 1,
                        products: { $arrayElemAt: ['$orderproducts', 0] },


                    }
                }, {
                    $project: {
                        quantity: '$product.quantity',
                        productprice: '$products.ofprice',
                        date: 1,


                        total: { $multiply: ['$products.ofprice', '$product.quantity'] },

                    }
                }, {
                    $sort: {
                        date: -1
                    }
                },{
                     $match: { date: { $gte: new Date(from),$lte:new Date(to) } } ,

                } ,{
                    $group: {
                        _id: {
                           
                        },
                        products: { $sum: '$quantity' },
                        revenue: { $sum: '$total' },



                    }
                }, {
                    $project: {
                        revenue: 1,
                        products: 1,

                    }
                },
            ]).toArray()
            console.log(sales)
            resolve(sales)
        })
    }






}

