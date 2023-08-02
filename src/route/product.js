// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Product {
  static #list = []

  constructor(name, price, description) {
    this.id = this.generateId()
    this.createDate = new Date().toISOString()
    this.name = name
    this.price = price
    this.description = description
  }

  generateId() {
    // Генеруємо п'ятизначне випадкове число для id
    const min = 10000
    const max = 99999
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  static getList = () => this.#list

  static add = (product) => this.#list.push(product)

  static getById = (id) =>
    this.#list.find((product) => product.id === id)

  static updateById = (id, data) => {
    const product = this.getById(id)

    if (product) {
      this.update(product, data)
      return true
    } else {
      return false
    }
  }

  static update = (
    product,
    { name, price, description },
  ) => {
    if (name) {
      product.name = name
    }
    if (price) {
      product.price = price
    }
    if (description) {
      product.description = description
    }
  }

  static deleteById = (id) => {
    const index = this.#list.findIndex(
      (product) => product.id === Number(id),
    )

    if (index !== -1) {
      this.#list.splice(index, 1)
      return true
    } else {
      return false
    }
  }
}

// ================================================================

router.get('/product-create', function (req, res) {
  res.render('product-create', {
    style: 'product-create',
  })
})

// ================================================================

router.post('/alert', function (req, res) {
  const { name, price, description } = req.body

  const product = new Product(name, price, description)

  Product.add(product)

  console.log(Product.getList())

  let result = false

  if (Product.getById(product.id)) {
    result = true
  } else {
    result = false
  }

  // Перевірка на пусті поля перед додаванням товару
  if (!name || !price || !description) {
    res.render('alert', {
      style: 'alert',
      isError: true,
      title: 'Сталася помилка',
      info: 'Товар не був доданий: неправильні дані',
    })
    return // Припинити виконання функції, якщо поля не заповнені
  }

  res.render('alert', {
    style: 'alert',
    isError: true,

    data: {
      link: '/product-list',
      title: result
        ? 'Успішне виконання дії'
        : 'Сталася помилка',
      info: result
        ? 'Товар успішно був доданий'
        : 'Товар не був доданий',
    },
  })
})

// ================================================================

// router.get Створює нам один ентпоїнт

// ↙️ тут вводимо шлях (PATH) до сторінки
router.get('/product-list', function (req, res) {
  // res.render генерує нам HTML сторінку

  const list = Product.getList()

  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('product-list', {
    // вказуємо назву папки контейнера, в якій знаходяться наші стилі
    style: 'product-list',

    data: {
      products: {
        list,
        isEmpty: list.length === 0,
      },
    },
  })
  // ↑↑ сюди вводимо JSON дані
})

// ================================================================

router.get('/product-edit', function (req, res) {
  const { id } = req.query

  const product = Product.getById(Number(id))

  if (!product) {
    // Якщо товар з таким id не знайдено, відображаємо повідомлення про помилку
    res.render('alert', {
      style: 'alert',
      isError: true,
      title: 'Помилка',
      info: 'Товар з таким ID не знайдено',
    })
  } else {
    // Якщо товар знайдено, передаємо його дані у шаблон product-edit
    res.render('product-edit', {
      style: 'product-edit',

      data: {
        name: product.name,
        price: product.price,
        id: product.id,
        description: product.description,
      },
    })
  }
})

// ================================================================

router.post('/product-edit', function (req, res) {
  const { id, name, price, description } = req.body

  const product = Product.updateById(Number(id), {
    name,
    price,
    description,
  })

  if (product) {
    // Якщо оновлення вдалося, відображаємо повідомлення про успіх
    res.render('alert', {
      style: 'alert',

      data: {
        link: '/product-list',
        title: 'Успішне виконання дії',
        info: 'Товар успішно оновлено',
      },
    })
  } else {
    // Якщо оновлення не вдалося (наприклад, товару з таким id не існує),
    // відображаємо повідомлення про помилку
    res.render('alert', {
      style: 'alert',

      data: {
        link: '/product-list',
        title: 'Помилка',
        info: 'Не вдалося оновити товар',
      },
    })
  }
})

// ================================================================

router.get('/product-delete', function (req, res) {
  const { id } = req.query

  const isDeleted = Product.deleteById(Number(id))

  if (isDeleted) {
    // Якщо видалення успішне, перенаправте на сторінку зі списком товарів
    res.redirect('/product-list')
  } else {
    // Якщо видалення не вдалося (наприклад, товару з таким id не існує),
    // відображаємо повідомлення про помилку
    res.render('alert', {
      style: 'alert',

      data: {
        link: '/product-list',
        title: 'Помилка',
        info: 'Не вдалося оновити товар',
      },
    })
  }
})

// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router