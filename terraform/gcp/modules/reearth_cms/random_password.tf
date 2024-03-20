resource "random_password" "plateauview_env" {
  for_each = toset(local.plateauview_randoms)
  length   = 32
  special  = false
}
