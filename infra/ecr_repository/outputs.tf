output "repository_name" {
  description = "The name of the ECR repository"
  value       = aws_ecr_repository.repository.name
}

output "repository_arn" {
  description = "The ARN of the ECR repository"
  value       = aws_ecr_repository.repository.arn
}
