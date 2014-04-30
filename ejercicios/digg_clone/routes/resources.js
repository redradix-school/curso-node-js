module.exports = function (router, name, controller) {
  if (controller.index) router.get("/", controller.index);
  if (controller["new"]) router.get("/new", controller["new"]);
  if (controller.create) router.post("/", controller.create);
  if (controller.show) router.get("/:"+name+"id", controller.show);
  if (controller.edit) router.get("/:"+name+"id/edit", controller.edit);
  if (controller.update) router.put("/:"+name+"id", controller.update);
  if (controller["delete"]) router["delete"]("/:"+name+"id", controller["delete"]);
  if (controller.param) router.param(name + "id", controller.param);
};
