resource "google_project_iam_custom_role" "reearth" {
  project     = data.google_project.project.project_id
  role_id     = "reearth"
  title       = "reearth"
  description = "IAM role for Re:Earth"
  stage       = "GA"
  permissions = [
    "cloudprofiler.profiles.create",
    "cloudprofiler.profiles.update",
    "pubsub.topics.publish",
    "secretmanager.versions.access",
    "storage.objects.create",
    "storage.objects.delete",
    "storage.objects.get",
    "storage.objects.update",
  ]
}
