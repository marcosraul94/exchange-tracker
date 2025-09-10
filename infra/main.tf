terraform {
  backend "s3" {
    bucket = "exchange-tracker-tf-state-dev"
    key    = "terraform.tfstate"
    region = "us-east-2"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = local.region
}


module "ecr_repository" {
  source = "./ecr_repository"

  environment  = var.ENVIRONMENT
  project_name = local.project_name
}

