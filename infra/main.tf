locals {
  tags = {
    Project = var.PROJECT_NAME
    Name    = "${var.BASE_NAME}-resources"
  }
}
