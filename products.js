console.clear();
// import Pagination from "./Pagination.js"
import ProductModal from "./ProductModal.js"
import DeleteModal from "./DeleteModal.js";

const app = Vue.createApp({
    data() {
        return {
            api: {
                url: "https://ec-course-api.hexschool.io/v2",
                path: "sky030b"
            },
            allProducts: {},
            pageProducts: {},
            productTemp: {},
            ert: {},
            deleteTemp: {},
            pagination: {}
        }
    },
    components: {
        ProductModal, DeleteModal
    },
    methods: {
        // api functions
        checkLogin() {
            axios.post(`${this.api.url}/api/user/check`)
                .then(() => {
                    this.getAllProducts();
                    this.getPageProducts(this.pagination.current_page);
                })
                .catch(err => {
                    alert(`${err.data.message}。\n將返回登入頁。`);
                    delete axios.defaults.headers.common["Authorization"];
                    window.location = "./login.html";
                })
        },
        getAllProducts() {
            axios.get(`${this.api.url}/api/${this.api.path}/admin/products/all`)
                .then(res => {
                    this.allProducts = res.data.products;
                })
                .catch(err => {
                    alert(`${err.data.message}\n將返回登入頁。`);
                    delete axios.defaults.headers.common["Authorization"];
                    window.location = "./login.html";
                })
        },
        getPageProducts(page = 1) {
            axios.get(`${this.api.url}/api/${this.api.path}/admin/products?page=${page}`)
                .then(res => {
                    this.pageProducts = res.data.products;
                    this.pagination = res.data.pagination;
                })
                .catch(err => {
                    alert(`${err.data.message}\n將返回登入頁。`);
                    delete axios.defaults.headers.common["Authorization"];
                    window.location = "./login.html";
                })
        },
        addProduct() {
            const data = {
                data: this.productTemp
            }
            axios.post(`${this.api.url}/api/${this.api.path}/admin/product/`, data)
                .then(() => {
                    alert("新增成功。");
                    this.getAllProducts();
                    this.getPageProducts();
                    this.handleModalDismiss();
                })
                .catch(err => {
                    alert(`${err.data.message}`);
                })
        },
        editProduct() {
            const data = {
                data: this.productTemp
            }
            axios.put(`${this.api.url}/api/${this.api.path}/admin/product/${this.productTemp.id}`, data)
                .then(() => {
                    alert("修改成功。");
                    this.getAllProducts();
                    this.getPageProducts(this.pagination.current_page);
                    this.handleModalDismiss();
                })
                .catch(err => {
                    alert(`${err.data.message}`);
                })
        },
        deleteProduct() {
            axios.delete(`${this.api.url}/api/${this.api.path}/admin/product/${this.deleteTemp.id}`)
                .then(() => {
                    alert("刪除成功。")
                    this.getAllProducts();
                    this.getPageProducts(this.pagination.current_page);
                    this.handleModalDismiss();
                })
                .catch(err => {
                    alert(`${err.data.message}`);
                })
        },

        // 關閉 modal 後重置兩種 temp object
        handleModalDismiss() {
            // 若 指定 modal 存在，則將之關閉
            const productModal = bootstrap.Modal.getInstance(document.querySelector("#productModal"));
            productModal ? productModal.hide() : null;
            const delProductModal = bootstrap.Modal.getInstance(document.querySelector("#delProductModal"));
            delProductModal ? delProductModal.hide() : null;

            // 這裡在處理 modal 被隱藏時的邏輯
            this.productTemp = {};
            this.deleteTemp = {};
        },
        // 開啟新增或編輯 modal 前，都先重置 productTemp(two ways)
        initProductTemp() {
            this.productTemp = {};
        },
        editProductTemp(product) {
            this.productTemp = JSON.parse(JSON.stringify(product));
        },
        // 開啟刪除 modal 前，都先重置 deleteTemp
        initDeleteTemp(product) {
            this.deleteTemp = product;
            const delConfirmBtn = document.querySelector(".del-btn");
            setTimeout(() => {
                delConfirmBtn.focus();
            }, 500)
        },
        // 送出 新增 或 編輯 的產品資料
        submitAddOrEditProduct() {
            if (this.productTemp.hasOwnProperty("id")) {
                this.editProduct();
            } else {
                this.addProduct();
            }
        },
    },
    mounted() {
        // 取出 Token
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1');
        axios.defaults.headers.common.Authorization = token;
        this.checkLogin();
    }
})

// 分頁元件
app.component('pagination', {
    props: ["pagination", "getPageProducts"],
    template: `
    <nav aria-label="Page navigation example">
        <ul class="pagination">
            <li class="page-item" :class="{disabled: !pagination.has_pre}">
                <a class="page-link" href="javascript:;" aria-label="Previous"
                @click="getPageProducts(pagination.current_page - 1)">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
            <li v-for="page in pagination.total_pages" :key="page + 'for pagination'" class="page-item"
                :class="{active: page === pagination.current_page}">
                <a class="page-link" href="javascript:;" @click.prevent="getPageProducts(page)">{{ page
                    }}</a>
            </li>
            <li class="page-item" :class="{disabled: !pagination.has_next}">
                <a class="page-link" href="javascript:;" aria-label="Next"
                @click="getPageProducts(pagination.current_page + 1)">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        </ul>
    </nav>
    `
});

app.mount("#app");
