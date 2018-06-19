import moment, { Moment } from 'moment';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCTemporaryDrawer } from '@material/drawer';
import { MDCRipple } from '@material/ripple';
import { MDCSnackbar } from '@material/snackbar';
import { MDCDialog } from '@material/dialog';
import { MDCTextField } from '@material/textfield';

// TODO :: 2018/06/19 :: Firebase のやつにする ↓
const API_SALES = 'http://192.168.0.13:3000/api/sales';
const API_PRODUCTS = 'http://192.168.0.13:3000/api/products';

let snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'))
let saleDialog = new MDCDialog(document.querySelector('#sale-dialog'))
let productDialog = new MDCDialog(document.querySelector('#product-dialog'))

MDCTextField.attachTo(document.querySelector('#add-prod-name-field'))
MDCTextField.attachTo(document.querySelector('#add-prod-price-field'))
MDCTextField.attachTo(document.querySelector('#add-prod-cost-field'))

fetch(API_PRODUCTS)
    .then(async products => {
        await fetch(API_SALES)
            .then(async sales => {
                init(await products.json(), await sales.json());
            })
            .catch(err => {
                console.error(`Get sales failed: ${err}`);
            });
    })
    .catch(err => {
        console.error(`Get products failed: ${err}`);
    });

function init(products, sales) {
    let app = new Vue({
        el: '#app',
        data: {
            selection: 'sales',
            products: products,
            sales: sales.map((val, idx, arr) => {
                return {
                    product: products.find(elem => {
                            return elem.id === val.productId;
                        }),
                    date: moment(val.date).format('YYYY/MM/DD')
                };
            })
        },
        methods: {
            selectDrawerItem (targetId) {
                document.querySelector('.mdc-list-item--activated').classList.remove('mdc-list-item--activated');
                document.querySelector(targetId).classList.add('mdc-list-item--activated');
                switch (targetId) {
                    case '#d-item-sales':
                        this.selection = 'sales';
                        break;
                    case '#d-item-stats':
                        this.selection = 'stats';
                        break;
                    case '#d-item-products':
                        this.selection = 'products';
                        break;
                    case '#d-item-about':
                        this.selection = 'about';
                        break;
                    default:
                        this.selection = 'sales';
                        break;
                }

                setTimeout(() => {
                    document.querySelectorAll('.mdc-list-item').forEach((val, idx, arr) => {
                        MDCRipple.attachTo(val);
                    }, 20);
                })
            },
            addSale () {
                // Not Implemented
                console.warn('addSale is NOT implemented.');
            },
            makeSnackbar (idx) {
                let testData = {
                    message: `Item Clicked! idx = ${idx}`,
                    actionText: 'Action',
                    timeout: 1000,
                    actionHandler () {
                        console.log('Test Act Clicked!');
                    }
                };
                showSnackbar(testData);
            },
            showDialog (type, evt) {
                switch (type) {
                    case 'AddSale':
                        saleDialog.lastFocusedTarget = evt.target;
                        saleDialog.show();
                        break;
                    case 'AddProduct':
                        productDialog.lastFocusedTarget = evt.target;
                        productDialog.show();
                        break;
                    default:
                        console.warn(`Invailed argument \'type\': ${type}`);
                        break;
                }
            }
        },
        computed: {
            totalSales () {
                return this.sales.reduce((sum, sale) => {
                    return sum + sale.product.price;
                }, 0);
            },
            totalCosts () {
                return this.sales.reduce((sum, sale) => {
                    return sum + sale.product.cost;
                }, 0);
            }
        }
    });

    saleDialog.listen('MDCDialog:cancel', () => {
        let sbData = {
            message: 'Canceled!',
            timeout: 1000
        };
        showSnackbar(sbData);
    });

    productDialog.listen('MDCDialog:cancel', () => {
        let sbData = {
            message: 'Canceled!',
            timeout: 1000
        };
        showSnackbar(sbData);
    })

    productDialog.listen('MDCDialog:accept', () => {
        let name = document.forms.addProductForm.productname.value;
        let price = document.forms.addProductForm.price.value;
        let cost = document.forms.addProductForm.cost.value;

        document.forms.addProductForm.productname.value = '';
        document.forms.addProductForm.price.value = '';
        document.forms.addProductForm.cost.value = '';
        document.querySelector('#add-prod-name-label').classList.remove('mdc-floating-label--float-above');
        document.querySelector('#add-prod-price-label').classList.remove('mdc-floating-label--float-above');
        document.querySelector('#add-prod-cost-label').classList.remove('mdc-floating-label--float-above');

        let data = {
            name: name,
            price: price,
            cost: cost
        };

        postData(API_PRODUCTS, data)
            .then(data => {
                app.products.push({
                    id: data.id,
                    name: name,
                    price: price,
                    cost: cost
                });
                setProducts(app, products);
            })
            .catch(err => {
                let sbData = {
                    message: 'Failed!!',
                    timeout: 1000
                };
                showSnackbar(sbData);
                attachRippleToListItems();
            });
    });

    setProducts(app, products);

    MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar--fixed'))
    
    let drawer = new MDCTemporaryDrawer(document.querySelector('.mdc-drawer--temporary'))
    document.querySelector('#appbar-menu').addEventListener('click', () => drawer.open = true);
    document.querySelector('#d-item-sales').addEventListener('click', () => drawer.open = false);
    document.querySelector('#d-item-stats').addEventListener('click', () => drawer.open = false);
    document.querySelector('#d-item-products').addEventListener('click', () => drawer.open = false);
    document.querySelector('#d-item-about').addEventListener('click', () => drawer.open = false);

    attachRippleToListItems();
    
    MDCRipple.attachTo(document.querySelector('.mdc-fab'));
}

function attachRippleToListItems() {
    document.querySelectorAll('.mdc-list-item').forEach((val, idx, arr) => {
        MDCRipple.attachTo(val);
    });
}

function showSnackbar(data) {
    setTimeout(() => {
        snackbar.show(data);
    }, 20);
}

function setProducts(app, products) {
    let parent = document.querySelector('#sale-dialog-body-ul');
    while (parent.firstChild)
        parent.removeChild(parent.firstChild);

    setTimeout(() => {
        products.forEach((val, idx, arr) => {
            let elem = document.createElement('li');
            elem.classList.add('mdc-list-item');
            elem.addEventListener('click', () => {
                let date = moment();

                app.sales.unshift({
                    product: val,
                    date: date.format('YYYY/MM/DD')
                });

                let data = {
                    productId: val.id,
                    date: date
                };
                postData(API_SALES, data)
                    .then(data => {
                        attachRippleToListItems();
                    })
                    .catch(err => {
                        let sbData = {
                            message: 'Failed!!',
                            timeout: 1000
                        };
                        showSnackbar(sbData);
                        attachRippleToListItems();
                    });

                setTimeout(() => {
                    saleDialog.close();
                }, 200);
            });
            elem.textContent = val.name;
            parent.appendChild(elem);
        });
    });
}

// Copied from https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
function postData(url, data) {
    // 既定のオプションには * が付いています
    return fetch(url, {
        body: JSON.stringify(data), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
    })
    .then(response => response.json()) // parses response to JSON
}
