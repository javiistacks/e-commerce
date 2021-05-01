"use strict";

var router = require('express').Router();

var _require = require('../../models'),
    Product = _require.Product,
    Category = _require.Category,
    Tag = _require.Tag,
    ProductTag = _require.ProductTag; // The `/api/products` endpoint
// get all products


router.get('/', function (req, res) {// find all products
  // be sure to include its associated Category and Tag data
}); // get one product

router.get('/:id', function (req, res) {// find a single product by its `id`
  // be sure to include its associated Category and Tag data
}); // create new product

router.post('/', function (req, res) {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body).then(function (product) {
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
      var productTagIdArr = req.body.tagIds.map(function (tag_id) {
        return {
          product_id: product.id,
          tag_id: tag_id
        };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    } // if no product tags, just respond


    res.status(200).json(product);
  }).then(function (productTagIds) {
    return res.status(200).json(productTagIds);
  })["catch"](function (err) {
    console.log(err);
    res.status(400).json(err);
  });
}); // update product

router.put('/:id', function (req, res) {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id
    }
  }).then(function (product) {
    // find all associated tags from ProductTag
    return ProductTag.findAll({
      where: {
        product_id: req.params.id
      }
    });
  }).then(function (productTags) {
    // get list of current tag_ids
    var productTagIds = productTags.map(function (_ref) {
      var tag_id = _ref.tag_id;
      return tag_id;
    }); // create filtered list of new tag_ids

    var newProductTags = req.body.tagIds.filter(function (tag_id) {
      return !productTagIds.includes(tag_id);
    }).map(function (tag_id) {
      return {
        product_id: req.params.id,
        tag_id: tag_id
      };
    }); // figure out which ones to remove

    var productTagsToRemove = productTags.filter(function (_ref2) {
      var tag_id = _ref2.tag_id;
      return !req.body.tagIds.includes(tag_id);
    }).map(function (_ref3) {
      var id = _ref3.id;
      return id;
    }); // run both actions

    return Promise.all([ProductTag.destroy({
      where: {
        id: productTagsToRemove
      }
    }), ProductTag.bulkCreate(newProductTags)]);
  }).then(function (updatedProductTags) {
    return res.json(updatedProductTags);
  })["catch"](function (err) {
    // console.log(err);
    res.status(400).json(err);
  });
});
router["delete"]('/:id', function (req, res) {// delete one product by its `id` value
});
module.exports = router;