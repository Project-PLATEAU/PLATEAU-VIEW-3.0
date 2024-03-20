resource "google_project_service" "project" {
  for_each                   = toset(local.services)
  disable_dependent_services = true
  project                    = data.google_project.project.project_id
  service                    = each.value
}
