resource "google_project_iam_custom_role" "cms_worker_m2m" {
  role_id     = "cmsworkerm2m"
  project     = data.google_project.project.project_id
  title       = "cmsworkerm2m"
  description = "IAM role for cmsworkerm2m"
  stage       = "GA"
  permissions = [
    "iam.serviceAccounts.actAs",
    "iam.serviceAccounts.get",
    "iam.serviceAccounts.getAccessToken",
    "iam.serviceAccounts.getOpenIdToken",
    "iam.serviceAccounts.implicitDelegation",
    "iam.serviceAccounts.list",
    "iam.serviceAccounts.signBlob",
    "iam.serviceAccounts.signJwt",
    "resourcemanager.projects.get",
    "run.jobs.run",
    "cloudbuild.builds.create"
  ]
}

resource "google_project_iam_custom_role" "reearth_cms" {
  role_id     = "reearthcmsapi"
  project     = data.google_project.project.project_id
  title       = "reearth-cms-api"
  description = "IAM role for reearth-cms-api"
  stage       = "GA"
  permissions = [
    "cloudbuild.builds.create",
    "cloudprofiler.profiles.create",
    "cloudprofiler.profiles.update",
    "cloudtasks.tasks.create",
    "pubsub.topics.publish",
    "secretmanager.versions.access",
    "storage.objects.create",
    "storage.objects.delete",
    "storage.objects.get",
    "storage.objects.update",
  ]
}

resource "google_project_iam_custom_role" "reearth_cms_worker" {
  role_id     = "reearthcmsworker"
  project     = data.google_project.project.project_id
  title       = "reearth-cms-worker"
  description = "IAM role for reearth-cms-worker"
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

resource "google_project_iam_custom_role" "plateauview_api" {
  role_id     = "plateauviewapi"
  project     = data.google_project.project.project_id
  title       = "plateauview-api"
  description = "IAM role for PLATEAU VIEW API"
  stage       = "GA"
  permissions = [
    "cloudprofiler.profiles.create",
    "cloudprofiler.profiles.update",
    "run.jobs.run",
    "secretmanager.versions.access",
    "pubsub.topics.publish",
    "storage.objects.create",
    "storage.objects.delete",
    "storage.objects.get",
    "storage.objects.update",
  ]
}

resource "google_project_iam_custom_role" "plateauview_geo" {
  role_id     = "plateauviewgeo"
  project     = data.google_project.project.project_id
  title       = "plateauview-geo"
  description = "IAM role for PLATEAU VIEW Geo"
  stage       = "GA"
  permissions = [
    "cloudbuild.builds.create",
    "cloudtasks.tasks.create",
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
