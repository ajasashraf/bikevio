function payment(proId) {
    console.log('one');
    $.ajax({
        url: "/order",
        method: "post",
        data: {
            proId
        },
        success:  (response) => {
                console.log("Reached here");
                razorpayPayment(response);
        },
    });
    console.log('two');
};


function razorpayPayment(order) {   
    var options = {
        key: "rzp_test_WMLYqfRmARx3mG", // Enter the Key ID generated from the Dashboard
        amount: order.order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "Keys",
        description: "Test Transaction",
        image: "https://api.hatchwise.com/api/public/storage/assets/contests/entries/L975725-20170505133348.jpg",
        order_id: order.order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        callback_url: "https://eneqd3r9zrjok.x.pipedream.net/",
        handler: function (response) {
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)
            verifyPayment(response, order);
        },
        prefill: {
            name: "Keys",
            email: "testfaristest@gmail.com",
            contact: "+91-907-280-048-3",
        },
        notes: {
            address: "Razorpay Corporate Office",
        },
        theme: {
            color: "#d1c286",
        },
    };
    function verifyPayment(payment, order) {
        $.ajax({
            url: "/verifyorder",
            data: {
                payment,
                order,
            },
            method: "post",
            success: (response) => {
                console.log(response);
                if (response.status) {
                    console.log("worked");
                    location.href = `/ordersuccess/${order.id}`;

                } else {
                    alert("payment failed");
                }
            },
        });
    }
    var rzp1 = new Razorpay(options);
    rzp1.open();
}
