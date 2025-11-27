const { Router } = require("express");

const ProductsValidityController = require("../controllers/ProductsValidityController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const productsValidityRoutes = Router();

const productsValidityController = new ProductsValidityController();

productsValidityRoutes.use(ensureAuthenticated);

productsValidityRoutes.post("/", productsValidityController.create);
productsValidityRoutes.get("/", productsValidityController.index);
productsValidityRoutes.put("/:id", productsValidityController.update);
productsValidityRoutes.delete("/:id", productsValidityController.delete);


module.exports = productsValidityRoutes;
