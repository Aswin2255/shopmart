

function addtocart(proid){
    console.log(proid)
    
    $.ajax({
        
       
        url:'/addtocart/'+proid,
        
        method:'GET',
        success:(response)=>{
            if(response.add){
                let count = $('.c').html()
                count = parseInt(count)+1
                $('.c').html(count)
                swal("Good job!", "item added to cart!", "success");
                
                
          
            }
          
            else if(response.cartadd) {
                swal("item is out of stock!","","error")
                
            }
            else  {
                swal("pls log in to continue!","","warning")
                .then((value) => {
                    location.href = '/login';
                });
                
                
               
                
            }

        }
    })
   
}
function changequantity(cartid,proid,count){
    let quantity = parseInt(document.getElementById(proid).innerHTML)
    let price = parseInt(document.getElementById('price'+proid).innerHTML)
    
    //this qnty price refers to the total price of the single product(productprice*productquantity)
    let qntyprice = parseInt(document.getElementById('qntyprice'+proid).innerHTML)

    let tot = parseInt(document.getElementById('tot').innerHTML)
    let tot2 = parseInt(document.getElementById('tot').innerHTML)
   
   
   
    console.log("ajax"+quantity)
    count = parseInt(count)
    $.ajax({
        url:'/changeqnty',
        data:{
           cart: cartid,
           pro: proid,
           count:count,
           qnty :quantity,
           price:price

        },
        method:'post',
        success:(response)=>{
            if(response.status){
          
            document.getElementById(proid).innerHTML = quantity+count
            document.getElementById('tot').innerHTML = ((count)*(price))+tot
            document.getElementById('tot2').innerHTML = ((count)*(price))+tot2
            document.getElementById('qntyprice'+proid).innerHTML=((count)*(price))+qntyprice
         
            }
            else{
                swal("maximum limit reached!","","error")
               
            }

        }
    })
}
