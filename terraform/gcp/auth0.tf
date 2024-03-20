locals {
  action_binding = [
    {
      id   = module.reearth_cms.auth0_action_signup[0].id,
      name = module.reearth_cms.auth0_action_signup[0].name
    }
  ]

}

resource "auth0_trigger_binding" "reearth_login" {
  trigger = "post-user-registration"
  dynamic "actions" {
    for_each = local.action_binding
    content {
      id           = actions.value.id
      display_name = actions.value.name
    }
  }
}
