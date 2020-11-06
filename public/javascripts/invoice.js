
new Vue({
    el: '#create-invoice',
    data: {
        creatingInvoice: false,
        customer: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
        },
        productInfo: {},
        productID: '',
        quantity: 1,
        viewDetail: false,
        size: 'Choose size',
        color: 'Choose color',
        invoiceList: [],
        errs: [],
        idError: [],
        colorErr: 'Please select valid color',
        sizeErr: 'Please select valid size',
        totalInYuan: 0,
        commision: 100,
        exchangeRate: 55,
        loading: false,
        shippingAddress: [
            '沈阳', '广州'
        ],
        shipAddress: '沈阳'
    },
    methods: {
        createInoice: function () {
            this.creatingInvoice = true;
            let keys = Object.keys(this.customer)
            for (let i = 0; i < keys.length; i++) {
                if (!this.customer[keys[i]]) {
                    $('#customer-infoError').removeClass('d-none');
                    this.creatingInvoice = false
                    return
                } else {
                    $('#customer-infoError').addClass('d-none')
                }
            }
            $.ajax({
                url: 'create-invoice',
                method: 'POST',
                data: {
                    invoiceList: JSON.stringify({
                        data: this.invoiceList,
                        others: {
                            commision: this.commision,
                            exchangeRate: this.exchangeRate,
                            shipAddress: this.shipAddress,
                            customerInfo: this.customer
                        }
                    })
                }
            })
                .done((res) => {
                    this.creatingInvoice = false;
                    swal({
                        title: res.status ? 'Success' : 'Failed',
                        text: res.status ? 'The invoice created successfully' : 'Creating Invoice failed',
                        icon: res.status ? "success" : 'warning',
                        button: "OK",
                    })
                    console.log(res)
                })
        },
        removeItem: function (index) {
            this.totalInYuan -= parseFloat(this.invoiceList[index].qty) * parseFloat(this.invoiceList[index].price) - parseFloat(this.invoiceList[index].shippingCost);
            this.invoiceList.splice(index, 1);
        },
        viewProductDetail: function (url) {
            this.idError = [];
            url = url.split('.html')[0];
            url = url.split('/')
            let id = url[url.length - 1]
            if (id != '' && id.length == 12) {
                this.loading = true;
                this.size = 'Choose size';
                this.color = 'Choose color';
                $.ajax({
                    url: 'viewProductDetail',
                    method: 'POST',
                    data: {
                        id: id
                    }
                })
                    .done((res) => {
                        this.loading = false;
                        if (res.status) {
                            this.productInfo = res.productDetail
                            this.viewDetail = true;
                        } else {
                            swal({
                                title: "Confirm",
                                text: res.msg,
                                icon: "warning",
                                button: "OK",
                            })
                        }

                    })
            } else {
                this.idError.push('Please insert Correct product ID')
            }
        },
        addToInvoice: function (color, size, quantity) {
            console.log("color", color)
            console.log("this.customer", this.customer)
            if (!this.productInfo.color) color = ''
            if (!this.productInfo.size) size = ''
            if (color != 'Choose color' && size != 'Choose size') {
                this.invoiceList.push({
                    imgUrl: this.productInfo.pic_url,
                    detail_url: this.productInfo.detail_url,
                    price: this.productInfo.price,
                    shippingCost: this.productInfo.express_fee ? this.productInfo.express_fee : 0,
                    color: color,
                    size: size,
                    qty: quantity
                })
                if (!this.productInfo.express_fee) this.productInfo.express_fee = 0
                this.totalInYuan += quantity * this.productInfo.price + parseFloat(this.productInfo.express_fee);
                this.errs = [];
            } else {
                if (color == 'Choose color' && !this.errs.includes(this.colorErr) && this.productInfo.color) {
                    this.errs.push(this.colorErr);
                }
                if (size == 'Choose size' && !this.errs.includes(this.sizeErr) && this.productInfo.size) {
                    this.errs.push(this.sizeErr);
                }
                // if (color != 'Choose color') this.errs = this.errs.filter(function (e) { e != this.colorErr })
                // if (size != 'Choose size') this.errs = this.errs.filter(function (e) { e != this.sizeErr })
            }
        },
    },
    computed: {

    }
})