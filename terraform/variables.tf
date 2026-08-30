variable "aws_region" {
  description = "AWS region."
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR."
  type        = string
}

variable "vpc_name" {
  description = "VPC name."
  type        = string
}

variable "main_route_table_id" {
  description = "Existing VPC main route table ID."
  type        = string
}

variable "ec2_instance_id" {
  description = "Existing EC2 instance ID."
  type        = string
}

variable "ec2_ami_id" {
  description = "EC2 AMI ID."
  type        = string
}

variable "ec2_instance_type" {
  description = "EC2 instance type."
  type        = string
}

variable "ec2_key_name" {
  description = "EC2 key pair name."
  type        = string
}

variable "ec2_name" {
  description = "EC2 Name tag."
  type        = string
}

variable "rds_identifier" {
  description = "RDS instance identifier."
  type        = string
}

variable "rds_subnet_group_name" {
  description = "RDS subnet group name."
  type        = string
}

variable "k3s_ami_id" {
  description = "AMI ID for the K3s production EC2."
  type        = string
}

variable "k3s_instance_type" {
  description = "Instance type for the K3s production EC2."
  type        = string
}

variable "k3s_name" {
  description = "Name tag for the K3s production EC2."
  type        = string
}